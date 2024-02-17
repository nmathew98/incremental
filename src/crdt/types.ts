export interface CreateCRDTParameters<T extends Record<string, any>> {
	/**
	 * The initial value of the CRDT
	 */
	initialValue: T;

	/**
	 * Return a value other than `null` or `undefined` for it to be returned by `dispatch`
	 */
	onChange: (next: T, previous: T) => any;

	/**
	 * Keep track of all versions for debugging
	 */
	trackVersions?: boolean;
}

export interface CRDT<T extends Record<string, any>> {
	readonly data: T;
	dispatch: <R = T>(
		/**
		 * `timestamp` should be the number of seconds since UNIX epoch
		 */
		updates: Partial<T> & { timestamp?: number },
		options?: DispatchOptions<T>,
	) => R;
	versions: T[];
}

export interface DispatchOptions<T extends Record<string, any>> {
	onChange?: (next: T, previous: T) => void;
}
