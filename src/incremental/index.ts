import { createCacheProvider } from "../cache";
import type { CacheProvider } from "../cache/types";
import { createCRDT } from "../crdt";
import { CreateIncrementalOptions } from "./types";

let __cache__: CacheProvider;

export const createIncremental = async <
	D extends Record<string | number | symbol, any> | Array<any>,
	C extends (next: D, previous: D) => any,
>({
	cache,
	queryKey,
	initialValue,
	onChange,
}: CreateIncrementalOptions<D, C>) => {
	__cache__ = cache ?? createCacheProvider();

	const { makeOnChange, makeInvalidateCachedValue, clearCache } = __cache__;

	const crdtInitialValue =
		initialValue ?? (await __cache__.getCachedValue(queryKey as WeakKey));

	if (!crdtInitialValue) {
		throw new TypeError("`initialValue` must be a `Record` or an `Array`");
	}

	const combinedOnChange = (...args: any[]) => {
		const result = (onChange as any)(...args);

		if (queryKey) {
			const updateCache: (...args: any) => any = makeOnChange(queryKey);

			updateCache(...args);
		}

		return result;
	};

	const { data, dispatch } = createCRDT<D, C>({
		initialValue: crdtInitialValue as D,
		onChange: combinedOnChange as any,
	});

	const invalidateCachedValue = makeInvalidateCachedValue(
		queryKey as WeakKey,
	);

	return { data, dispatch, invalidateCachedValue, clearCache };
};
