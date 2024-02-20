export interface CacheProvider {
	makeOnChange: (queryKey: WeakKey) => (next: CacheValue) => void;
	getCachedValue: (queryKey: WeakKey) => null | CacheValue;
	makeInvalidateCachedValue: (queryKey: WeakKey) => void;
	setCachedValue: (queryKey: WeakKey) => (next: CacheValue) => void;
	clearCache: () => void;
}

export type CacheValue = Record<string | symbol | number, any> | unknown[];

export interface CacheStore {
	has: (queryKey: Serializable) => boolean;
	get: (
		queryKey: Serializable,
	) => void | WeakRef<CacheValue> | WeakRef<Promise<CacheValue>>;
	set: (queryKey: Serializable, value: WeakRef<CacheValue>) => void;
	delete: (queryKey: Serializable) => void;
	clear?: () => void;
}

export interface Serializable {
	toString: () => string;
}
