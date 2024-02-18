import { describe, expect, it, vitest } from "vitest";
import { createCRDT } from ".";

describe("createCRDT", () => {
	describe("`dispatch`", () => {
		it("invokes `onChange` when updates are dispatched", () => {
			const INITIAL_VALUE = { b: 1 };
			const onChange: () => null = vitest.fn();

			const { dispatch } = createCRDT({
				initialValue: INITIAL_VALUE as Record<string, any>,
				onChange,
			});

			const FIRST_UPDATE = { a: 1 };
			dispatch(FIRST_UPDATE);

			expect(onChange).toBeCalledWith(
				{
					...INITIAL_VALUE,
					...FIRST_UPDATE,
				},
				INITIAL_VALUE,
			);
			expect(onChange).toBeCalledTimes(1);
		});

		it("allows an updates to be computed", () => {
			const INITIAL_VALUE = Object.create(null);
			const setState = vitest.fn();

			const crdt = createCRDT({
				initialValue: INITIAL_VALUE,
				onChange: setState,
			});

			const FIRST_UPDATE = { a: 1 };
			const SECOND_UPDATE = { b: 1 };

			crdt.dispatch(previous => ({ ...previous, ...FIRST_UPDATE }));

			expect(setState).toBeCalledWith(FIRST_UPDATE, INITIAL_VALUE);
			expect(setState).toBeCalledTimes(1);

			crdt.dispatch(previous => ({ ...previous, ...SECOND_UPDATE }));

			expect(setState).toBeCalledWith(
				{
					...FIRST_UPDATE,
					...SECOND_UPDATE,
				},
				FIRST_UPDATE,
			);
			expect(setState).toBeCalledTimes(2);

			expect(crdt.data).toEqual({ ...FIRST_UPDATE, ...SECOND_UPDATE });
		});

		it("allows updates to be specified", () => {
			const INITIAL_VALUE = Object.create(null);
			const upsert = vitest.fn().mockImplementation(updates => {
				const query = `INSERT INTO users(${Object.keys(updates).join(", ")})
					VALUES (${Object.values(updates).join(", ")})
					ON CONFLICT (uuid)
					DO UPDATE SET
						${Object.entries(updates)
							.map(([key, value]) => `${key} = ${value}`)
							.join(", ")};
				`;

				return query;
			});

			const { dispatch } = createCRDT({
				initialValue: INITIAL_VALUE,
				onChange: upsert,
			});

			const FIRST_UPDATE = { a: 1 };
			dispatch(FIRST_UPDATE);

			expect(upsert).toBeCalledWith(FIRST_UPDATE, INITIAL_VALUE);
			expect(upsert).toBeCalledTimes(1);
		});

		it("returns a new reference", () => {
			const onChange = vitest.fn();

			const crdt = createCRDT({
				initialValue: Object.create(null),
				onChange,
			});

			const INITIAL_VALUE = crdt.data;
			const FIRST_UPDATE = { a: 1 };

			const latest = crdt.dispatch(FIRST_UPDATE);

			const FINAL_VALUE = crdt.data;

			expect(latest).not.toBe(INITIAL_VALUE);
			expect(FINAL_VALUE).toBe(latest);
		});
	});

	describe("`data`", () => {
		it("has stable references", () => {
			const crdt = createCRDT({
				initialValue: Object.create(null),
				onChange: vitest.fn(),
			});

			expect(crdt.data).toBe(crdt.data);
		});

		it("nested property references stay the same if they are not changed", () => {
			const INITIAL_VALUE: Record<string, any> = {
				a: {
					b: {
						c: {
							d: 1,
						},
						e: {
							f: 1,
						},
					},
					g: 1,
				},
				h: 1,
			};
			const onChange = vitest.fn();

			const crdt = createCRDT({
				initialValue: INITIAL_VALUE,
				onChange,
			});

			crdt.dispatch(previousValue => {
				previousValue.a.b.c = {
					d: 2,
					h: 1,
				};

				return previousValue;
			});

			expect(crdt.data.a).not.toBe(INITIAL_VALUE.a);
			expect(crdt.data.a.b).not.toBe(INITIAL_VALUE.a.b);
			expect(crdt.data.a.b.c).not.toBe(INITIAL_VALUE.a.b.c);
			expect(crdt.data.a.b.c.d).toEqual(2);
			expect(crdt.data.a.b.c.h).toEqual(1);

			expect(crdt.data.a.b.e).toBe(INITIAL_VALUE.a.b.e);
			expect(crdt.data).not.toBe(INITIAL_VALUE);

			expect(onChange).toBeCalledWith(crdt.data, INITIAL_VALUE);
		});

		it("array references change if mutated", () => {
			const INITIAL_VALUE = {
				a: {
					b: [1, 2],
				},
				c: {
					d: 1,
				},
				e: [1, 2],
			};
			const onChange = vitest.fn();

			const crdt = createCRDT({
				initialValue: INITIAL_VALUE,
				onChange,
			});

			crdt.dispatch(previousValue => {
				previousValue.a.b.push(3);

				return previousValue;
			});

			expect(crdt.data.a.b).toEqual([1, 2, 3]);
			expect(crdt.data.c).toBe(INITIAL_VALUE.c);
			expect(crdt.data.e).toBe(INITIAL_VALUE.e);

			expect(onChange).toHaveBeenCalledWith(crdt.data, INITIAL_VALUE);

			crdt.dispatch(previousValue => void previousValue.e.push(3));

			expect(crdt.data.e).toEqual([1, 2, 3]);
			expect(crdt.data.e).not.toBe(INITIAL_VALUE.e);
			expect(crdt.data.e).not.toBe(crdt.data.a.b);
		});

		it("accepts arrays", () => {
			const INITIAL_VALUE = [1, 2, 3];
			const onChange = vitest.fn();

			const crdt = createCRDT({
				initialValue: INITIAL_VALUE,
				onChange,
			});

			crdt.dispatch(previousValue => void previousValue.push(4));

			expect(crdt.data.length).toBeGreaterThan(INITIAL_VALUE.length);
			expect(crdt.data.at(-1)).toEqual(4);

			expect(onChange).toBeCalledTimes(1);
			expect(onChange).toBeCalledWith([1, 2, 3, 4], [1, 2, 3]);
		});
	});
});
