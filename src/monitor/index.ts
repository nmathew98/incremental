import type { MakeMonitoredParameters } from "./types";

export const makeMonitoredFetch = ({
	fetchFn,
	onFetching,
	onSuccess,
	onError,
	refetchOnWindowFocus = false,
	enabled = true,
}: MakeMonitoredParameters) => {
	const monitoredFetchFn = async (...args) => {
		if (!enabled) return;

		onFetching?.(true);

		return fetchFn(...args)
			.then(result => {
				onSuccess?.(result, ...args);

				return result;
			})
			.catch(error => {
				onError?.(error, ...args);

				throw error;
			})
			.finally(() => onFetching?.(false));
	};

	if (refetchOnWindowFocus)
		window?.addEventListener("focusin", monitoredFetchFn);

	return monitoredFetchFn as typeof fetchFn;
};
