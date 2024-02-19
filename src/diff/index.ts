/**
 * Diff two records or arrays based on `===` equality
 *
 * @param next the next value
 * @param previous the previous value
 */
export const diff = <
	D extends Record<string | number | symbol, any> | Array<any>,
>(
	next: D,
	previous: D,
): D => {
	const computeDiff = () => {
		if (Array.isArray(previous)) {
			return next.filter((v, idx) => v !== previous[idx]);
		}

		const previousMap = new Map(Object.entries(previous));

		return Object.entries(next).filter(
			([key, value]) =>
				!previousMap.has(key) || previousMap.get(key) !== value,
		);
	};

	const diff = computeDiff();

	return Array.isArray(previous) ? diff : (Object.fromEntries(diff) as D);
};
