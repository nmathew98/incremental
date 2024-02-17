export interface MakeMonitoredParameters {
	fetchFn: <F extends (...args: any[]) => Promise<any>>(...args: Parameters<F>) => ReturnType<F>
	onFetching?: (state: boolean) => void,
	onSuccess?: (result: unknown, ...args: any[]) => void;
	onError?: (error: unknown, ...args: any[]) => void;
	refetchOnWindowFocus?: boolean;
	enabled?: boolean
}