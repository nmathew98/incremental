export interface CreateCRDTParameters<
	D extends Record<string, any>,
	C extends (next: D, diff: Partial<D>, previous: D) => unknown,
> {
	/**
	 * Document to initialize the CRDT to
	 *
	 * Must be a record type
	 */
	initialValue: D;

	/**
	 * Global side effects to trigger when updates are applied to the CRDT
	 *
	 * These will always trigger when the CRDT is updated unless `isPersisted`
	 * is specified when `dispatch`ing the changes
	 *
	 * @param next the final version of the document
	 * @param diff changes to the document
	 * @param previous the previous version of the document
	 */
	onChange: C;

	/**
	 * If `onChange` is an async side effect, then `onSuccess` will only be triggered
	 * if `onChange` resolves successfully
	 *
	 * @param next the final version of the document
	 * @param diff changes to the document
	 * @param previous the previous version of the document
	 */
	onSuccess?: (next: D, diff: Partial<D>, previous: D) => Promise<void>;

	/**
	 * If `onChange` is an async side effect, then `onSuccess` will only be triggered
	 * if `onChange` rejects
	 *
	 * @param next the final version of the document
	 * @param diff changes to the document
	 * @param previous the previous version of the document
	 */
	onError?: (next: D, diff: Partial<D>, previous: D) => Promise<void>;

	/**
	 * Track the versions of the CRDT if `true`
	 *
	 * Useful for debugging
	 *
	 * @default false
	 */
	trackVersions?: boolean;
}

export interface CRDT<
	D extends Record<string, any>,
	C extends (next: D, diff: Partial<D>, previous: D) => any,
> {
	readonly data: D;
	dispatch: Dispatch<D, C>;
	versions: D[];
}

export interface Dispatch<
	D extends Record<string, any>,
	C extends (next: D, diff: Partial<D>, previous: D) => any,
> {
	(
		updates: Partial<D>,
		options?: DispatchOptions<D>,
	): ReturnType<C> extends null | undefined ? D : ReturnType<C>;
	(
		updates: (state: D) => Partial<D>,
		options?: DispatchOptions<D>,
	): ReturnType<C> extends null | undefined ? D : ReturnType<C>;
}

export interface DispatchOptions<D extends Record<string, any>> {
	/**
	 * If specified will always be invoked during `dispatch` regardless of `isPersisted`
	 *
	 * @param next the final version of the document
	 * @param diff changes to the document
	 * @param previous the previous version of the document
	 */
	onChange?: (next: D, diff: Partial<D>, previous: D) => void;

	/**
	 * If `true`, then global side effects are disabled
	 *
	 * @default false
	 */
	isPersisted?: boolean;
}
