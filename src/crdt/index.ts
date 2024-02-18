import { produce } from "immer";
import type { CRDT, CreateCRDTParameters, DispatchOptions } from "./types";

export const createCRDT = <
	D extends Record<string, any>,
	C extends (next: D, diff: Partial<D>, previous: D) => any,
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
	const merge = (record, map) => {
		const diff = Object.entries(record).filter(
			([key, value]) => !map.has(key) || map.get(key) !== value,
		);

		diff.forEach(([key, value]) => map.set(key, value));

		return diff;
	};

	const dispatch = (updates, options?: DispatchOptions<D>) => {
		const apply = (updates: Partial<D>) => {
			const diff = Object.fromEntries(merge(updates, data)) as Partial<D>;
			createNewVersion();

			const previous = versions.at(-2);
			const latest = versions.at(-1);

			if (!trackVersions) versions.splice(0, versions.length - 1);

			options?.onChange?.(latest, diff, previous);

			if (!options?.isPersisted) {
				// If `onChange` returns a `Promise` then the side-effect is
				// async and we want to wait until it is done
				// before sync effects
				const onChangeResult = onChange(latest, diff, previous)
					?.then?.(result => {
						onSuccess?.(latest, diff, previous);

						return result;
					})
					.catch(() => void onError?.(latest, diff, previous));

				return onChangeResult ?? latest;
			}

			return latest;
		};

		if (typeof updates === "function")
			return apply(produce(versions.at(-1) as Partial<D>, updates));

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
