import type { CRDT, CreateCRDTParameters, DispatchOptions } from "./types";

export const createCRDT = <
	D extends Record<string, any>,
	C extends (next: D, previous: D) => any,
>({
	initialValue,
	onChange,
	onSuccess,
	onError,
	trackVersions = false,
}: CreateCRDTParameters<D, C>): CRDT<D, C> => {
	const versions: any[] = [];
	const data = new Map();

	const createNewVersion = () => {
		versions.push(Object.fromEntries(data));
	};
	const merge = (record, map = new Map()) =>
		Object.entries(record).forEach(([key, value]) => map.set(key, value));

	const dispatch = (updates, options?: DispatchOptions<D>) => {
		const apply = (diff: Partial<D>) => {
			merge(diff, data);
			createNewVersion();

			const previous = versions.at(-2);
			const latest = versions.at(-1);

			if (!trackVersions) versions.splice(0, versions.length - 1);

			options?.onChange?.(latest, previous);

			if (!options?.isPersisted) {
				// If `onChange` returns a `Promise` then the side-effect is
				// async and we want to wait until it is done
				// before sync effects
				const onChangeResult = onChange(latest, previous)
					?.then?.(result => (onSuccess?.(latest, previous), result))
					.catch(() => void onError?.(latest, previous));

				return onChangeResult ?? latest;
			}

			return latest;
		};

		if (typeof updates === "function")
			return apply(updates(versions.at(-1)));

		return apply(updates);
	};

	merge(initialValue, data);
	createNewVersion();

	return {
		get data() {
			return versions.at(-1);
		},
		dispatch,
		versions,
	};
};
