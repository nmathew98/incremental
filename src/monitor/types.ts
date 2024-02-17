export interface MakeMonitoredParameters<
	F extends (...args: any[]) => Promise<any>,
> {
	fetchFn: F;
	onFetching?: (isFetching: boolean) => void;
	onSuccess?: (
		result: Awaited<ReturnType<F>>,
		...args: Parameters<F>
	) => void;
	onError?: (error: unknown, ...args: Parameters<F>) => void;
	refetchOnWindowFocus?: boolean;
	enabled?: boolean;
}
