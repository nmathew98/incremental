export const createWeakCache = () =>
	new Proxy(new Map(), {
		get: (target: Map<any, any>, p: keyof Map<any, any>) => {
			const value = Reflect.get(target, p);

			if (p === "set" && typeof value === "function") {
				return new Proxy(value.bind(target), {
					apply: (set, thisArg, args) => {
						const [key, value] = args;

						if (value && typeof value === "object") {
							return Reflect.apply(set, thisArg, [
								key,
								new WeakRef(value),
							]);
						}

						return Reflect.apply(set, thisArg, args);
					},
				});
			}

			if (p === "get" && typeof value === "function") {
				return new Proxy(value.bind(target), {
					apply: (get, thisArg, args) => {
						const [key] = args;

						if (!target.has(key)) return null;

						const value = Reflect.apply(get, thisArg, [key]);

						if (value instanceof WeakRef) {
							const unwrapped = value.deref();

							if (!unwrapped) {
								target.delete(key);
							}

							return unwrapped ?? null;
						}

						return value ?? null;
					},
				});
			}

			if (typeof value === "function") {
				return value.bind(target);
			}

			return value;
		},
	});
