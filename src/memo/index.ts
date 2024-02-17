const memo = new Map();

export const makeMemo = <F extends (...args: any[]) => any>(
	fn: F,
	resolver?: (...args: Parameters<F>) => any,
) => {
	if (!fn.name) {
		throw new Error("`fn` must be named");
	}

	const memoizedFn = (
		...args: Parameters<typeof fn>
	): ReturnType<typeof fn> => {
		const key = resolver ? resolver(...args) : args.at(0);

		if (memo.has(key)) {
			return memo.get(key);
		}

		const result = fn(...args);

		memo.set(key, result);

		return result;
	};

	return memoizedFn as typeof fn;
};
