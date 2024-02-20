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
	const combinedOnChange = (...args: any[]) => {
		const result = (onChange as any)(...args);

		if (queryKey) {
			const updateCache: any = cache?.makeOnChange?.(queryKey);

			updateCache?.(...args);
		}

		return result;
	};

	const { data, dispatch } = createCRDT<D, C>({
		initialValue,
		onChange: combinedOnChange as any,
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
