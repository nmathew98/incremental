import { describe, expect, it, vitest } from "vitest";
import { diff } from ".";
import { createCRDT } from "../crdt";

describe("diff", () => {
	it("diffs nested property changes based on references", () => {
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
			i: {
				j: {
					k: 1,
				},
			},
		};

		const crdt = createCRDT({
			initialValue: INITIAL_VALUE,
			onChange: vitest.fn(),
		});

		crdt.dispatch(previousValue => {
			previousValue.a.b.c = {
				d: 2,
				h: 1,
			};

			return previousValue;
		});

		expect(crdt.data.a.b.e).toBe(INITIAL_VALUE.a.b.e);
		expect(diff(crdt.data, INITIAL_VALUE)).not.toEqual({
			h: 1,
			i: { j: { k: 1 } },
		});
	});

	it("diffs array value changes based on references", () => {
		const INITIAL_VALUE: any[] = [{ a: 1 }, { b: 1 }, { c: 1 }];

		const crdt = createCRDT({
			initialValue: INITIAL_VALUE,
			onChange: vitest.fn(),
		});

		crdt.dispatch(previousValue => [...previousValue, { d: 1 }]);

		expect(diff(crdt.data, INITIAL_VALUE)).toEqual([{ d: 1 }]);
	});

	it("diffs array value changes based on values", () => {
		const INITIAL_VALUE: number[] = [1, 2, 3];

		const crdt = createCRDT({
			initialValue: INITIAL_VALUE,
			onChange: vitest.fn(),
		});

		crdt.dispatch(previousValue => void previousValue.push(4));

		expect(diff(crdt.data, INITIAL_VALUE)).toEqual([4]);
	});
});
