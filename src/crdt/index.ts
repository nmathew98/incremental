export const createCRDT = ({
	initialValue,
	onChange,
	trackVersions = true,
}) => {
	const versions: any[] = [];
	const updatedDates: Date[] = [];
	const data = new Map();

	const createNewVersion = () => {
		versions.push(Object.fromEntries(data));
		updatedDates.push(new Date());
	};
	const merge = (record, map = new Map()) =>
		Object.entries(record).forEach(([key, value]) => map.set(key, value));

	const dispatch = updates => {
		const apply = diff => {
			// Last write wins
			if (
				diff.timestamp instanceof Date &&
				diff.timestamp < (updatedDates.at(-1) as Date)
			)
				return versions.at(-1);

			merge(diff, data);
			createNewVersion();

			const latest = versions.at(-1);

			if (!trackVersions) {
				versions.splice(0, versions.length - 1);
				updatedDates.splice(0, updatedDates.length - 1);
			}

			onChange(latest);
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
	};
};
