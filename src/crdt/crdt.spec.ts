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
				initialValue: Object.create(null),
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
				initialValue: Object.create(null),
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

		it("only applies the latest updates", () => {
			const onChange = vitest.fn();

			const crdt = createCRDT({
				initialValue: Object.create(null),
				onChange,
			});

			const FIRST_UPDATE = {
				timestamp: new Date(0),
				a: 1,
			};

			crdt.dispatch(FIRST_UPDATE);

			expect(onChange).not.toBeCalled();
			expect(crdt.data).toEqual(Object.create(null));
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
	});
});
