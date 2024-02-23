import { produce } from "immer";
import type {
	CRDT,
	CreateCRDTParameters,
	Dispatch,
	DispatchOptions,
} from "./types";

export const createCRDT = <
	D extends Record<string | number | symbol, any> | Array<any>,
	C extends (next: D, previous: D) => any,
>({
	initialValue,
	onChange,
	onSuccess,
	onError,
	trackVersions = false,
}: CreateCRDTParameters<D, C>): CRDT<D> => {
	const versions: any[] = [];

	const createNewVersion = (next: D) => void versions.push(next);

	const dispatch: Dispatch<D> = (updates, options?: DispatchOptions<D>) => {
		const apply = next => {
			const previous = versions.at(-1);
			const latest = next;

			if (!trackVersions) versions.splice(0, versions.length - 1);

			options?.onChange?.(latest, previous);

			if (!options?.isPersisted) {
				const isPromise = onChange(latest, previous)
					?.then?.(result => {
						onSuccess?.(latest, previous);

						createNewVersion(latest);

						return result;
					})
					.catch(() => void onError?.(latest, previous));

				if (isPromise) {
					return isPromise;
				}
			}

			createNewVersion(latest);

			return latest;
		};

		if (typeof updates === "function")
			return apply(produce(versions.at(-1), updates));

		return apply(
			produce(versions.at(-1), draft =>
				Array.isArray(initialValue)
					? updates
					: {
							...draft,
							...updates,
						},
			),
		);
	};

	createNewVersion(initialValue);

	return {
		get data() {
			return versions.at(-1);
		},
		dispatch,
		versions,
	};
};
