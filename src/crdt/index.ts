import type { CRDT, CreateCRDTParameters } from "./types";

export const createCRDT = <T extends Record<string, any>>({
	initialValue,
	onChange,
	trackVersions = true,
}: CreateCRDTParameters<T>): CRDT<T> => {
	const versions: any[] = [];
	const updatedDates: Date[] = [];
	const data = new Map();

	const createNewVersion = (timestamp?: Date) => {
		versions.push(Object.fromEntries(data));
		updatedDates.push(timestamp ?? new Date());
	};
	const merge = (record, map = new Map()) =>
		Object.entries(record).forEach(([key, value]) => map.set(key, value));

	const dispatch = (updates, options) => {
		const apply = ({ timestamp, ...diff }) => {
			// Last write wins
			if (
				timestamp instanceof Date &&
				timestamp < (updatedDates.at(-1) as Date)
			)
				return versions.at(-1);

			merge(diff, data);
			createNewVersion(timestamp);

			const previous = versions.at(-2);
			const latest = versions.at(-1);

			if (!trackVersions) {
				versions.splice(0, versions.length - 1);
				updatedDates.splice(0, updatedDates.length - 1);
			}

			const onChangeResult = onChange(latest, previous);
			options?.onChange?.(latest, previous);

			return onChangeResult ?? latest;
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
