import type { CacheProvider, Serializable } from "../cache/types";

export interface CreateIncrementalOptions<
	D extends Record<string | number | symbol, any> =
		| Record<string | number | symbol, any>
		| Array<any>,
	C extends (next: D, previous: D) => unknown = (
		next: D,
		previous: D,
	) => unknown,
> {
	cache?: CacheProvider;

	/**
	 * Global side effects to trigger when updates are applied to the CRDT
	 *
	 * These will always trigger when the CRDT is updated unless `isPersisted`
	 * is specified when `dispatch`ing the changes
	 *
	 * @param next the final version of the document
	 * @param previous the previous version of the document
	 */
	onChange: C;

	queryKey?: Serializable;

	/**
	 * Document to initialize the CRDT to
	 *
	 * Should be a `Record` or an `Array`
	 */
	initialValue: D;
}
