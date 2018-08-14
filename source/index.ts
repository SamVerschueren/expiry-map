interface Entry<V> {
	timestamp: number;
	data: V;
}

export default class ExpiryMap<K = any, V = any> implements Map<K, V> {
	private readonly data: Map<K, Entry<V>>;
	public readonly [Symbol.toStringTag]: 'Map' = 'Map';

	constructor(maxAge: number);
	constructor(maxAge: number, entries: ReadonlyArray<[K, V]> | null | undefined);
	constructor(maxAge: number, iterable: Iterable<[K, V]>);
	constructor(private readonly maxAge: number, data?: ReadonlyArray<[K, V]> | Iterable<[K, V]> | null | undefined) {
		this.data = new Map();

		if (data) {										// tslint:disable-line:early-exit
			for (const [key, value] of data) {
				this.set(key, value);
			}
		}
	}

	get size() {
		return [...this.entries()].length;
	}

	clear() {
		this.data.clear();
	}

	delete(key: K) {
		return this.data.delete(key);
	}

	has(key: K) {
		const value = this.data.get(key);

		return Boolean(value && !this.isExpired([key, value]));
	}

	get(key: K) {
		const value = this.data.get(key);

		if (value && !this.isExpired([key, value])) {
			return value.data;
		}

		return;
	}

	set(key: K, value: V) {
		this.data.set(key, {
			timestamp: Date.now(),
			data: value
		});

		return this;
	}

	values() {
		return this.createIterator(item => item[1].data);
	}

	keys() {
		return this.createIterator(item => item[0]);
	}

	entries() {
		return this.createIterator<[K, V]>(item => [item[0], item[1].data]);
	}

	forEach(callbackfn: (value: V, key: K, map: Map<K, V>) => void, thisArg?: any) {
		for (const [key, value] of this.entries()) {
			callbackfn.apply(thisArg, [value, key, this]);
		}
	}

	[Symbol.iterator]() {
		return this.entries();
	}

	private isExpired([key, value]: [K, Entry<V>]) {
		const isExpired = Date.now() - value.timestamp > this.maxAge;

		if (isExpired) {
			this.data.delete(key);
		}

		return isExpired;
	}

	private *createIterator<T>(projection: (item: [K, Entry<V>]) => T) {
		for (const item of this.data.entries()) {
			if (!this.isExpired(item)) {
				yield projection(item);
			}
		}
	}
}

// Add support for CJS
module.exports = ExpiryMap;
module.exports.default = ExpiryMap;
