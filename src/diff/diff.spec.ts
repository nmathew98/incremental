import { describe, expect, it, vitest } from "vitest";
import { diff } from ".";
import { createCRDT } from "../crdt";

describe("diff", () => {
	describe("addition", () => {
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

	describe("subtraction", () => {
		it("arrays with primitive types", () => {
			const INITIAL_VALUE: number[] = [1, 2, 3];

			const crdt = createCRDT({
				initialValue: INITIAL_VALUE,
				onChange: vitest.fn(),
			});

			crdt.dispatch(previousValue => void previousValue.pop());

			expect(diff(INITIAL_VALUE, crdt.data)).toEqual([3]);
		});

		it("arrays with reference types", () => {
			const LAST_ELEMENT = { c: 3 };
			const INITIAL_VALUE = [{ a: 1 }, { b: 2 }, LAST_ELEMENT];

			const crdt = createCRDT({
				initialValue: INITIAL_VALUE,
				onChange: vitest.fn(),
			});

			crdt.dispatch(previousValue => void previousValue.pop());

			expect(diff(INITIAL_VALUE, crdt.data)).toEqual([LAST_ELEMENT]);
		});

		it("if a nested property is removed, its entire root is different", () => {
			const INITIAL_VALUE: Record<string, any> = {
				a: {
					b: {
						c: 1,
					},
				},
				d: 2,
				e: {
					f: {
						g: {
							h: 1,
						},
					},
				},
			};

			const crdt = createCRDT({
				initialValue: INITIAL_VALUE,
				onChange: vitest.fn(),
			});

			crdt.dispatch(previousValue => {
				delete previousValue.a.b.c;
			});

			expect(diff(INITIAL_VALUE, crdt.data)).toEqual({
				a: { b: { c: 1 } },
			});
		});
	});
});
