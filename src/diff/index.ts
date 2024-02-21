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

		return Object.fromEntries(
			Object.entries(next).filter(
				([key, value]) =>
					previous[key] === undefined || previous[key] !== value,
			),
		);
	};

	return computeDiff();
};
