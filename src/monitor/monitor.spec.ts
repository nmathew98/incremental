import { describe, expect, it, vitest } from "vitest";
import { makeMonitored } from ".";

describe("makeMonitored", () => {
	it("invokes `onFetching` when `fetchFn` is fetching", async () => {
		const fetchFn = vitest.fn().mockImplementation(() => Promise.resolve());
		const onFetching = vitest.fn();
		const onSuccess = vitest.fn();
		const onError = vitest.fn();

		const monitoredFetch = makeMonitored({
			fetchFn,
			onFetching,
			onSuccess,
			onError,
		});

		await expect(
			monitoredFetch("hello", "world"),
		).resolves.not.toThrowError();

		expect(fetchFn).toBeCalledTimes(1);
		expect(fetchFn).toHaveBeenCalledWith("hello", "world");

		expect(onFetching).toHaveBeenNthCalledWith(1, true);
		expect(onFetching).toHaveBeenNthCalledWith(2, false);

		expect(onSuccess).toHaveBeenCalled();
		expect(onError).not.toHaveBeenCalled();
	});

	it("does not invoke `fetchFn` if not `enabled", async () => {
		const fetchFn = vitest.fn().mockImplementation(() => Promise.resolve());
		const onFetching = vitest.fn();
		const onSuccess = vitest.fn();
		const onError = vitest.fn();

		const monitoredFetch = makeMonitored({
			fetchFn,
			onFetching,
			onSuccess,
			onError,
			enabled: false,
		});

		await expect(
			monitoredFetch("hello", "world"),
		).resolves.not.toThrowError();

		expect(fetchFn).not.toHaveBeenCalled();

		expect(onSuccess).not.toHaveBeenCalled();
		expect(onFetching).not.toHaveBeenCalled();
		expect(onError).not.toHaveBeenCalled();
	});

	it("invokes `onFetching` when `fetchFn` settles", async () => {
		const fetchFn = vitest.fn().mockImplementation(async () => {
			throw "error!";
		});
		const onFetching = vitest.fn();
		const onSuccess = vitest.fn();
		const onError = vitest.fn();

		const monitoredFetch = makeMonitored({
			fetchFn,
			onFetching,
			onSuccess,
			onError,
		});

		await expect(
			monitoredFetch("hello", "world"),
		).resolves.not.toThrowError();

		expect(onFetching).toHaveBeenNthCalledWith(1, true);
		expect(onFetching).toHaveBeenNthCalledWith(2, false);

		expect(onError).toHaveBeenCalledTimes(1);
		expect(onError).toHaveBeenCalledWith("error!");

		expect(onSuccess).not.toHaveBeenCalled();
	});

	it("refetches on window focus", () => {
		const fetchFn = vitest.fn().mockImplementation(async () => {
			throw "error!";
		});
		const onFetching = vitest.fn();
		const onSuccess = vitest.fn();
		const onError = vitest.fn();
		const addEventListener = vitest.fn();

		(global as any).window = { addEventListener };

		const monitoredFetch = makeMonitored({
			fetchFn,
			onFetching,
			onSuccess,
			onError,
			refetchOnWindowFocus: true,
		});

		expect(addEventListener).toHaveBeenCalledTimes(1);
		expect(addEventListener).toHaveBeenCalledWith(
			"focusin",
			monitoredFetch,
		);
	});
});
