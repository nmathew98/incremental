import { CacheProvider } from "../cache/types";

export interface BaseCreateIncrementalOptions<
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
}

export interface CreateIncrementalOptionsWithInitialValue<
	D extends Record<string | number | symbol, any> =
		| Record<string | number | symbol, any>
		| Array<any>,
	C extends (next: D, previous: D) => unknown = (
		next: D,
		previous: D,
	) => unknown,
> extends BaseCreateIncrementalOptions<D, C> {
	queryKey?: WeakKey;

	/**
	 * Document to initialize the CRDT to
	 *
	 * Should be a `Record` or an `Array`
	 */
	initialValue: D;
}

export interface CreateIncrementalOptionsWithoutInitialValue<
	D extends Record<string | number | symbol, any> =
		| Record<string | number | symbol, any>
		| Array<any>,
	C extends (next: D, previous: D) => unknown = (
		next: D,
		previous: D,
	) => unknown,
> extends BaseCreateIncrementalOptions<D, C> {
	queryKey: WeakKey;

	initialValue?: never;
}

export type CreateIncrementalOptions<
	D extends Record<string | number | symbol, any> =
		| Record<string | number | symbol, any>
		| Array<any>,
	C extends (next: D, previous: D) => unknown = (
		next: D,
		previous: D,
	) => unknown,
> =
	| CreateIncrementalOptionsWithoutInitialValue<D, C>
	| CreateIncrementalOptionsWithInitialValue<D, C>;
