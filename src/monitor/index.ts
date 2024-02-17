import type { MakeMonitoredParameters } from "./types";

export const makeMonitoredFetch = <F extends (...args: any[]) => Promise<any>>({
	fetchFn,
	onFetching,
	onSuccess,
	onError,
	refetchOnWindowFocus = false,
	enabled = true,
}: MakeMonitoredParameters<F>) => {
	const monitoredFetchFn = async (...args: Parameters<typeof fetchFn>) => {
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
		window?.addEventListener("focusin", monitoredFetchFn as any);

	return monitoredFetchFn as typeof fetchFn;
};
