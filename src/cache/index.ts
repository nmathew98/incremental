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
		if (prefetchedQueries.has(queryKey.toString()))
			prefetchedQueries.delete(queryKey.toString());

		store.set(queryKey, next);
	};

	const getCachedValue = (queryKey: Serializable) => {
		if (prefetchedQueries.has(queryKey.toString())) {
			const cachedValue = prefetchedQueries.get(queryKey.toString());

			store.set(queryKey, cachedValue);

			prefetchedQueries.delete(queryKey.toString());

			return cachedValue;
		}

		return store.get(queryKey);
	};

	const makeInvalidateCachedValue = (queryKey: Serializable) => () => {
		prefetchedQueries.delete(queryKey.toString());
		store.delete(queryKey);
	};

	const setCachedValue = (queryKey: Serializable) => (next: CacheValue) =>
		void prefetchedQueries.set(queryKey.toString(), next);

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
