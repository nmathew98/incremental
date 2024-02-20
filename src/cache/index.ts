import type {
	CacheProvider,
	CacheStore,
	CacheValue,
	Serializable,
} from "./types";

export const createCacheProvider = (
	store: CacheStore = new Map<any, WeakRef<CacheValue>>(),
): CacheProvider => {
	const prefetchedQueries = new Map();

	const makeOnChange = (queryKey: Serializable) => (next: CacheValue) => {
		if (prefetchedQueries.has(queryKey.toString()))
			prefetchedQueries.delete(queryKey.toString());

		store.set(queryKey.toString(), new WeakRef(next));
	};

	const getCachedValue = (queryKey: Serializable) => {
		if (prefetchedQueries.has(queryKey.toString())) {
			const cachedValue = prefetchedQueries.get(queryKey.toString());

			store.set(queryKey, new WeakRef(cachedValue));

			prefetchedQueries.delete(queryKey.toString());

			return cachedValue;
		}

		if (store.has(queryKey.toString())) {
			const cachedValue = (
				store.get(queryKey.toString()) as void | WeakRef<any>
			)?.deref();

			return cachedValue ?? null;
		}

		return null;
	};

	const makeInvalidateCachedValue = (queryKey: Serializable) => () => {
		prefetchedQueries.delete(queryKey.toString());
		store.delete(queryKey.toString());
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
