export interface CacheProviderOptions {
	store?: CacheStore;
}

export interface CacheProvider {
	makeOnChange: (queryKey: WeakKey) => (next: CacheValue) => void;
	getCachedValue: (queryKey: WeakKey) => null | CacheValue;
	makeInvalidateCachedValue: (queryKey: WeakKey) => void;
	setCachedValue: (queryKey: WeakKey) => (next: CacheValue) => void;
	clearCache: () => void;
}

export type CacheValue = Record<string | symbol | number, any> | unknown[];

export interface CacheStore {
	has: (queryKey: WeakKey) => boolean;
	get: (queryKey: WeakKey) => void | CacheValue | Promise<CacheValue>;
	set: (queryKey: WeakKey, value: void | CacheValue) => void;
	delete: (queryKey: WeakKey) => void;
}
