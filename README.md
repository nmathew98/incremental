![Tests](https://github.com/nmathew98/incremental/actions/workflows/main.yml/badge.svg)

## About

Simple universal composable asynchronous state management utilities.

## Features

-   CJS + ESM ✅
-   Lightweight ✅
-   Simple and easy to use ✅
-   Retry mechanism ✅
-   Caching ✅
-   Structural sharing ✅

## Background

Managing asynchronous state is hard, on the backend the data access patterns we utilize varies wildly depending on the type of database we use and on the frontend we need to worry about keeping our data up to date, caching, network failures, and structural sharing to prevent rerenders.

`incremental` standardizes and simplifies the data access patterns we utilize on the backend and frontend by providing simple composable utilities allowing us to opt-in to the functionality we need.

The central idea is to utilize state-based [CRDT](https://en.wikipedia.org/wiki/Conflict-free_replicated_data_type)'s - a type of data structure which provides strong eventual consistency - to manage all data access, any changes to data are `dispatch`ed and applied by `dispatch` using `onChange`.

## Usage

On the frontend, we often have to fetch data from the backend and then apply updates on a button click:

```typescript
const user = createCRDT({
	initialValue: await service.getUserById,
	onChange: over(
		makeMonitor({
			fetchFn: service.putUser,
			onFetching: toggleLoadingIndicator,
			// For `fetchFn` to throw `onError`
			// `onError` has to throw
			onError: displayError,
		}),
	),
});

const onSubmit = updates => user.dispatch(updates, { onChange: setUser });
```

or, sometimes we have incremental updates from multiple sources which need to be applied:

```typescript
const chatMessages = createCRDT({
	initialValue: await service.getChatMessages(currentUser, recipient),
	onChange: makeMonitor({
		fetchFn: makeRetry({
			retryFn: service.putChatMessage,
		}),
		onFetching: toggleLoadingIndicator,
	}),
});

// Updates which are dispatched with a `timestamp` specified do not trigger `onChange`
const newMessagesSocket = new WebSocket(wsUri);
newMessagesSocket.onmessage = event =>
	dispatch(previousChatMessages => {
		const message = JSON.parse(event.data);

		return {
			timestamp: new Date(event.data.timestamp),
			// when it comes to subscriptions and arrays, supply the latest value in full
			// and dedupe
			value: uniqBy(
				[...previousChatMessages.value, ...event.data.value],
				"uuid",
			),
		};
	});

const onSubmitChatMessage = newMessage =>
	chatMessages.dispatch(previousChatMessages => ({
		...previousChatMessages,
		value: [...previousChatMessages.value, newMessage],
	}));
```

On the backend, we need to apply updates to a model and ideally we would want to protect our application data models from the underlying database models:

```typescript
const user = createCRDT({
	initialValue: await repo.getUserByUuid(userUuid),
	onChange: over(
		makeRetry({
			retryFn: repo.putUserByUuid,
		}),
		makeRetry({
			retryFn: repo.deleteUserByUuid, // soft delete
		}),
	),
});

if (!userSchema.isValid(req.body, user.data)) {
	throw new Error("User is invalid");
}

await Promise.allSettled(user.dispatch(req.body));
```

Key points:

-   `dispatch` does not apply nested updates, so if a field in the `initialValue` is a record or an array, then the field must be specified in full.
-   `data` is really a getter, so upon re-renders, `data` is up to date. Otherwise, rely on property access instead of destructuring to get the latest value.

More information in:

-   `src/crdt/crdt.spec.ts`
-   `src/monitor/monitor.spec.ts`
-   `src/retry/retry.spec.ts`

## Contributions

-   Contributions are welcome, just make a pull request
