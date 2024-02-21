import { createCRDT } from "../crdt";
import type { CreateIncrementalOptions } from "./types";

export const createIncremental = async <
	D extends Record<string | number | symbol, any> | Array<any>,
	C extends (next: D, previous: D) => any,
>({
	cache,
	queryKey,
	initialValue,
	onChange,
}: CreateIncrementalOptions<D, C>) => {
	const proxiedOnChange = new Proxy(onChange, {
		apply: (onChange, thisArg, args) => {
			const result = Reflect.apply(onChange, thisArg, args);

			if (queryKey) {
				cache?.makeOnChange?.(queryKey).apply(null, [args[0]]);
			}

			return result;
		},
	});

	const { data, dispatch } = createCRDT<D, C>({
		initialValue,
		onChange: proxiedOnChange,
	});

	/// @ts-expect-error
	const invalidateCachedValue = cache?.makeInvalidateCachedValue(queryKey);

	return {
		data,
		dispatch,
		invalidateCachedValue,
		clearCache: cache?.clearCache,
	};
};
