import { describe, expect, it } from "vitest";
import { createCacheProvider } from ".";

describe("createCacheProvider", () => {
	it("allows custom stores", () => {
		const KEY = Symbol("test");
		const PREFETCHED_VALUE = Object.create(null);

		const { setCachedValue, getCachedValue } = createCacheProvider(
			new Map(),
		);

		setCachedValue(KEY)(PREFETCHED_VALUE);

		expect(getCachedValue(KEY)).toBe(PREFETCHED_VALUE);
	});

	it("allows prefetching queries", () => {
		const KEY = Symbol("test");
		const PREFETCHED_VALUE = Object.create(null);

		const { setCachedValue, getCachedValue } = createCacheProvider();

		setCachedValue(KEY)(PREFETCHED_VALUE);

		expect(getCachedValue(KEY)).toBe(PREFETCHED_VALUE);
	});

	describe("allows retrieving from cache", () => {
		it("invalidates prefetched values `onChange`", () => {
			const KEY = Symbol("test");
			const PREFETCHED_VALUE = Object.create(null);
			const DISPATCHED_VALUE = Object.create(null);

			const { setCachedValue, getCachedValue, makeOnChange } =
				createCacheProvider();

			setCachedValue(KEY)(PREFETCHED_VALUE);

			expect(getCachedValue(KEY)).toBe(PREFETCHED_VALUE);

			makeOnChange(KEY)(DISPATCHED_VALUE);

			expect(getCachedValue(KEY)).not.toBe(PREFETCHED_VALUE);
			expect(getCachedValue(KEY)).toBe(DISPATCHED_VALUE);
		});

		// In reality, the entry would be garbage collected (if using default `store`)
		it("returns null if a query has been marked as stale", () => {
			const KEY = Symbol("test");
			const PREFETCHED_VALUE = Object.create(null);
			const DISPATCHED_VALUE = Object.create(null);
			const STALE_VALUE = void DISPATCHED_VALUE;

			const { setCachedValue, getCachedValue, makeOnChange } =
				createCacheProvider();

			setCachedValue(KEY)(PREFETCHED_VALUE);

			expect(getCachedValue(KEY)).toBe(PREFETCHED_VALUE);

			makeOnChange(KEY)(DISPATCHED_VALUE);
			makeOnChange(KEY)(STALE_VALUE);

			expect(getCachedValue(KEY)).toBe(null);
		});
	});
});
