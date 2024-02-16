export const makeMonitored = ({
	fetchFn,
	onFetching,
	onSuccess,
	onError,
	refetchOnWindowFocus = false,
	enabled = true,
}) => {
	const wrappedFetchFn = async (...args) => {
		if (!enabled) return;

		onFetching(true);

		return fetchFn(...args)
			.then(onSuccess)
			.catch(error => {
				onError?.(error);

				throw error;
			})
			.finally(() => onFetching(false));
	};

	if (refetchOnWindowFocus)
		window?.addEventListener("focusin", wrappedFetchFn);

	return wrappedFetchFn;
};
