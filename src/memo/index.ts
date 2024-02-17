const memo = new Map();

export const makeMemo = (fn, resolver) => {
	if (!fn.name) {
		throw new Error("`fn` must be named");
	}

	const memoizedFn = (...args) => {
		const key = resolver ? resolver(...args) : args.at(0);

		if (memo.has(key)) {
			return memo.get(key);
		}

		const result = fn(...args);

		memo.set(key, result);

		return result;
	};

	return memoizedFn;
};