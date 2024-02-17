export const createCRDT = ({
	initialValue,
	onChange,
	trackVersions = true,
}) => {
	const versions: any[] = [];
	const updatedDates: Date[] = [];
	const data = new Map();

	const createNewVersion = (timestamp?: Date) => {
		versions.push(Object.fromEntries(data));
		updatedDates.push(timestamp ?? new Date());
	};
	const merge = (record, map = new Map()) =>
		Object.entries(record).forEach(([key, value]) => map.set(key, value));

	const dispatch = updates => {
		const apply = ({ timestamp, ...diff }) => {
			// Last write wins
			if (
				timestamp instanceof Date &&
				timestamp < (updatedDates.at(-1) as Date)
			)
				return versions.at(-1);

			merge(diff, data);
			createNewVersion(timestamp);

			const latest = versions.at(-1);

			if (!trackVersions) {
				versions.splice(0, versions.length - 1);
				updatedDates.splice(0, updatedDates.length - 1);
			}

			const onChangeResult = onChange(latest);
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
	};
};
