import type {
	CacheProvider,
	CacheStore,
	CacheValue,
	Serializable,
} from "./types";
import { createWeakCache } from "./weak-cache";

export const createCacheProvider = (
	store: CacheStore = createWeakCache(),
): CacheProvider => {
	const prefetchedQueries = new Map();

	const makeOnChange = (queryKey: Serializable) => (next: CacheValue) => {
		if (prefetchedQueries.has(queryKey)) prefetchedQueries.delete(queryKey);

		store.set(queryKey, next);
	};

	const getCachedValue = (queryKey: Serializable) => {
		if (prefetchedQueries.has(queryKey)) {
			const cachedValue = prefetchedQueries.get(queryKey);

			store.set(queryKey, cachedValue);

			prefetchedQueries.delete(queryKey);

			return cachedValue;
		}

		return store.get(queryKey);
	};

	const makeInvalidateCachedValue = (queryKey: Serializable) => () => {
		prefetchedQueries.delete(queryKey);
		store.delete(queryKey);
	};

	const setCachedValue = (queryKey: Serializable) => (next: CacheValue) =>
		void prefetchedQueries.set(queryKey, next);

	const clearCache = () => {
		store.clear?.();
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
