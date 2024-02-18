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
	const previousMap = new Map(Object.entries(previous));

	const diff = Object.entries(next).filter(
		([key, value]) =>
			!previousMap.has(key) || previousMap.get(key) !== value,
	);

	return Array.isArray(previous)
		? (diff.map(([_, v]) => v) as D)
		: (Object.fromEntries(diff) as D);
};
