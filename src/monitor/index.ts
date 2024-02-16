export const monitor = ({
	fetchFn,
	onFetching,
	onSuccess,
	onError,
	refetchOnWindowFocus,
	enabled,
}) => {
	const wrappedFetchFn = async args => {
		if (!enabled) return;

		onFetching(true);

		return await fetchFn(args)
			.then(onSuccess)
			.catch(onError)
			.finally(() => onFetching(false));
	};

	if (refetchOnWindowFocus)
		window?.addEventListener("focusin", wrappedFetchFn);

	return fetchFn;
};
