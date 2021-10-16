import mapAgeCleaner = require('map-age-cleaner');

interface Entry<V> {
	maxAge: number;
	data: V;
}

class ExpiryMap<K = any, V = any> implements Map<K, V> {
	private readonly data: Map<K, Entry<V>>;
	public readonly [Symbol.toStringTag]: 'Map' = 'Map';

	constructor(maxAge: number);
	constructor(maxAge: number, entries: ReadonlyArray<[K, V]> | null | undefined);
	constructor(maxAge: number, iterable: Iterable<[K, V]>);
	constructor(private readonly maxAge: number, data?: ReadonlyArray<[K, V]> | Iterable<[K, V]> | null | undefined) {
		this.data = new Map();

		// Bootstrap the cleanup process which frees up memory when an item expires
		mapAgeCleaner(this.data);

		if (data) {										// tslint:disable-line:early-exit
			for (const [key, value] of data) {
				this.set(key, value);
			}
		}
	}

	get size() {
		return this.data.size;
	}

	clear() {
		this.data.clear();
	}

	delete(key: K) {
		return this.data.delete(key);
	}

	has(key: K) {
		return this.data.has(key);
	}

	get(key: K) {
		const value = this.data.get(key);

		if (value) {
			return value.data;
		}

		return;
	}

	set(key: K, value: V) {
		this.data.set(key, {
			maxAge: Date.now() + this.maxAge,
			data: value
		});

		return this;
	}

	values() {
		return this.createIterator(item => item[1].data);
	}

	keys() {
		return this.data.keys();
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

	private *createIterator<T>(projection: (item: [K, Entry<V>]) => T) {
		for (const item of this.data.entries()) {
			yield projection(item);
		}
	}
}

export = ExpiryMap;
