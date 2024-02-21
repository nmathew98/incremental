import type { MakeMonitoredParameters } from "./types";

export const makeMonitoredFetch = <F extends (...args: any[]) => Promise<any>>({
	fetchFn,
	onFetching,
	onSuccess,
	onError,
	refetchOnWindowFocus = false,
	enabled = true,
}: MakeMonitoredParameters<F>) => {
	const monitoredFetchFn = new Proxy(fetchFn, {
		apply: (target, thisArg, args: Parameters<F>) => {
			if (!enabled) return;

			onFetching?.(true);

			return Reflect.apply(target, thisArg, args)
				.then(result => {
					onSuccess?.(result, ...args);

					return result;
				})
				.catch(error => {
					onError?.(error, ...args);

					throw error;
				})
				.finally(() => onFetching?.(false));
		},
	});

	return monitoredFetchFn as typeof fetchFn;
};
