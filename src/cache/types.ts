export interface CacheProvider {
	makeOnChange: (queryKey: Serializable) => (next: CacheValue) => void;
	getCachedValue: (queryKey: Serializable) => null | CacheValue;
	makeInvalidateCachedValue: (queryKey: Serializable) => () => void;
	setCachedValue: (queryKey: Serializable) => (next: CacheValue) => void;
	clearCache: () => void;
}

export type CacheValue = Record<string | symbol | number, any> | unknown[];

export interface CacheStore {
	has: (queryKey: Serializable) => boolean;
	get: (
		queryKey: Serializable,
	) => void | WeakRef<CacheValue> | Promise<CacheValue>;
	set: (queryKey: Serializable, value: WeakRef<CacheValue>) => void;
	delete: (queryKey: Serializable) => void;
	clear?: () => void;
}

export interface Serializable {
	toString: () => string;
}
