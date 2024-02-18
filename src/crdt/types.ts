export interface CreateCRDTParameters<
	D extends Record<string, any>,
	C extends (next: D, previous: D) => unknown,
> {
	initialValue: D;
	onChange: C;
	onSuccess?: (next: D, previous: D) => Promise<void>;
	onError?: (next: D, previous: D) => Promise<void>;
	trackVersions?: boolean;
}

export interface CRDT<
	D extends Record<string, any>,
	C extends (next: D, previous: D) => any,
> {
	readonly data: D;
	dispatch: Dispatch<D, C>;
	versions: D[];
}

export interface Dispatch<
	D extends Record<string, any>,
	C extends (next: D, previous: D) => any,
> {
	(
		updates: Partial<D> & { timestamp?: Date },
		options?: DispatchOptions<D>,
	): ReturnType<C> extends null | undefined ? D : ReturnType<C>;
	(
		updates: (state: D) => Partial<D> & { timestamp?: Date },
		options?: DispatchOptions<D>,
	): ReturnType<C> extends null | undefined ? D : ReturnType<C>;
}

export interface DispatchOptions<T extends Record<string, any>> {
	onChange?: (next: T, previous: T) => void;
}
