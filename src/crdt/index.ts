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
		const apply = updates => {
			const next = Array.isArray(initialValue)
				? updates
				: {
						...versions.at(-1),
						...updates,
					};

			createNewVersion(next);

			const previous = versions.at(-2);
			const latest = versions.at(-1);

			if (!trackVersions) versions.splice(0, versions.length - 1);

			options?.onChange?.(latest, previous);

			if (!options?.isPersisted) {
				// If `onChange` returns a `Promise` then the side-effect is
				// async and we want to wait until it is done
				// before sync effects
				const onChangeResult = onChange(latest, previous)
					?.then?.(result => {
						onSuccess?.(latest, previous);

						return result;
					})
					.catch(() => void onError?.(latest, previous));

				return onChangeResult ?? latest;
			}

			return latest;
		};

		if (typeof updates === "function")
			return apply(produce(versions.at(-1), updates));

		return apply(
			produce(versions.at(-1), draft => ({
				...draft,
				...updates,
			})),
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
