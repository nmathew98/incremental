export interface CreateCRDTParameters<
	D extends Record<string | number | symbol, any> =
		| Record<string | number | symbol, any>
		| Array<any>,
	C extends (
		next: D,
		diff: D extends Array<any> ? D : Partial<D>,
		previous: D,
	) => unknown = (
		next: D,
		diff: D extends Array<any> ? D : Partial<D>,
		previous: D,
	) => unknown,
> {
	/**
	 * Document to initialize the CRDT to
	 *
	 * Should be a `Record` or an `Array`
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
	onSuccess?: (
		next: D,
		diff: D extends Array<any> ? D : Partial<D>,
		previous: D,
	) => void;

	/**
	 * If `onChange` is an async side effect, then `onSuccess` will only be triggered
	 * if `onChange` rejects
	 *
	 * @param next the final version of the document
	 * @param diff changes to the document
	 * @param previous the previous version of the document
	 */
	onError?: (
		next: D,
		diff: D extends Array<any> ? D : Partial<D>,
		previous: D,
	) => void;

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
	D extends Record<string | number | symbol, any> =
		| Record<string | number | symbol, any>
		| Array<any>,
> {
	/**
	 * Is a getter so rely on property access to obtain the latest version
	 */
	readonly data: D;

	/**
	 * Dispatch changes to the CRDT
	 *
	 * Changes can be specified or computed
	 */
	dispatch: Dispatch<D>;

	/**
	 * All versions of the CRDT
	 *
	 * Useful for debugging
	 */
	versions: D[];
}

export interface Dispatch<
	D extends Record<string | number | symbol, any> =
		| Record<string | number | symbol, any>
		| Array<any>,
> {
	(updates: Partial<D>, options?: DispatchOptions<D>): unknown;
	(updates: Dispatcher<D>, options?: DispatchOptions<D>): unknown;
}

type Dispatcher<D> = (state: D) => void | Partial<D>;

export interface DispatchOptions<
	D extends Record<string | number | symbol, any> =
		| Record<string | number | symbol, any>
		| Array<any>,
> {
	/**
	 * If specified will always be invoked during `dispatch` regardless of `isPersisted`
	 *
	 * @param next the final version of the document
	 * @param diff changes to the document
	 * @param previous the previous version of the document
	 */
	onChange?: (
		next: D,
		diff: D extends Array<any> ? D : Partial<D>,
		previous: D,
	) => void;

	/**
	 * If `true`, then global side effects are disabled
	 *
	 * @default false
	 */
	isPersisted?: boolean;
}
