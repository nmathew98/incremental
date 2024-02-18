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
-   Framework agnostic (note: BYO framework wrappers) ✅

## Background

Managing asynchronous state is hard, on the backend the data access patterns we utilize varies wildly depending on the type of database we use and on the frontend we need to worry about keeping our data up to date, caching, network failures, and structural sharing to prevent rerenders.

`incremental` standardizes and simplifies the data access patterns we utilize on the backend and frontend by providing simple composable utilities allowing us to opt-in to the functionality we need.

The central idea is to utilize state-based [CRDT](https://en.wikipedia.org/wiki/Conflict-free_replicated_data_type)'s - a type of data structure which provides strong eventual consistency - to manage all data access, any changes to data are `dispatch`ed and applied by `dispatch` using `onChange`.

## Usage

On the frontend, we often have to fetch data from the backend and then apply updates on a button click:

```typescript
const user = createCRDT({
	initialValue: await service.getUserById,
	onChange: makeMonitor({
		fetchFn: service.putUser,
		onFetching: toggleLoadingIndicator,
		// For `fetchFn` to throw `onError`
		// `onError` has to throw
		onError: displayError,
	}),
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

const newMessagesSocket = new WebSocket(wsUri);
newMessagesSocket.onmessage = event =>
	dispatch(
		previousChat => {
			const message = JSON.parse(event.data);

			previousChat.messages.push(message.data);

			return previousChat;
			// If `isPersisted`, then `chatMessages.onChange`
			// is not invoked
		},
		{ isPersisted: true },
	);

const onSubmitChatMessage = newMessage =>
	chatMessages.dispatch(previousChat =>
		previousChat.messages.push(newMessage),
	);
```

More information in:

-   `src/crdt/crdt.spec.ts`
-   `src/monitor/monitor.spec.ts`
-   `src/retry/retry.spec.ts`

## Contributions

-   Contributions are welcome, just make a pull request
