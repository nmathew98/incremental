import type { CacheProvider, CacheStore, CacheValue } from "./types";

export const createCacheProvider = (
	store: CacheStore = new WeakMap(),
): CacheProvider => {
	const prefetchedQueries = new Map();

	const makeOnChange = (queryKey: WeakKey) => (next: CacheValue) => {
		if (prefetchedQueries.has(queryKey)) prefetchedQueries.delete(queryKey);

		store.set(queryKey, next);
	};

	const getCachedValue = (queryKey: WeakKey) => {
		if (prefetchedQueries.has(queryKey)) {
			const cachedValue = prefetchedQueries.get(queryKey);

			store.set(queryKey, cachedValue);

			prefetchedQueries.delete(queryKey);

			return cachedValue;
		}

		if (store.has(queryKey)) return store.get(queryKey) ?? null;

		return null;
	};

	const makeInvalidateCachedValue = (queryKey: WeakKey) => {
		prefetchedQueries.delete(queryKey);
		store.delete(queryKey);
	};

	const setCachedValue = (queryKey: WeakKey) => (next: CacheValue) =>
		void prefetchedQueries.set(queryKey, next);

	const clearCache = () => {
		// Intentional mutation, `WeakMap` has no `clear`
		store = new WeakMap();

		prefetchedQueries.clear();
	};

	return {
		makeOnChange,
		getCachedValue,
		setCachedValue,
		makeInvalidateCachedValue,
		clearCache,
	};
};
