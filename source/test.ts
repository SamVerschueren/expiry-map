/* tslint:disable:await-promise */
import test from 'ava';
import delay from 'delay';
import ExpiryMap = require('.');

test('constructor', t => {
	const map = new ExpiryMap<string, string>(1000, [
		['foo', 'bar']
	]);

	t.is(map.get('foo'), 'bar');
});

test('.size', async t => {
	const map = new ExpiryMap<string, string>(1000);
	map.set('foo', 'bar');

	await delay(500);

	map.set('unicorn', 'rainbow');

	t.is(map.size, 2);

	await delay(600);

	t.is(map.size, 1);

	await delay(500);

	t.is(map.size, 0);
});

test('.clear', t => {
	const map = new ExpiryMap<string, string>(1000);
	map.set('foo', 'bar');
	map.set('unicorn', 'rainbow');

	t.true(map.has('foo'));
	t.true(map.has('unicorn'));

	map.clear();

	t.false(map.has('foo'));
	t.false(map.has('unicorn'));
});

test('.delete', async t => {
	const map = new ExpiryMap<string, string>(1000);
	map.set('foo', 'bar');
	map.set('unicorn', 'rainbow');

	t.true(map.has('foo'));
	t.true(map.has('unicorn'));

	t.true(map.delete('unicorn'));

	t.true(map.has('foo'));
	t.false(map.has('unicorn'));

	await delay(1100);

	t.false(map.delete('foo'));
});

test('.has', async t => {
	const map = new ExpiryMap<string, string>(1000);
	map.set('foo', 'bar');

	await delay(500);

	t.true(map.has('foo'));

	await delay(600);

	t.is(map.get('foo'), undefined);
});

test('.get', async t => {
	const map = new ExpiryMap<string, string>(1000);
	map.set('foo', 'bar');

	await delay(500);

	t.is(map.get('foo'), 'bar');

	await delay(600);

	t.is(map.get('foo'), undefined);
});

test('.get', async t => {
	const map = new ExpiryMap<string, string>(1000);
	map.set('foo', 'bar');

	t.is(map.get('foo'), 'bar');
});

test('.keys', async t => {
	const map = new ExpiryMap<string, string>(1000);
	map.set('foo', 'bar');
	map.set('unicorn', 'rainbow');

	let result = [];

	for (const value of map.keys()) {
		result.push(value);
	}

	t.deepEqual(result, ['foo', 'unicorn']);

	await delay(1100);

	result = [];

	for (const value of map.values()) {
		result.push(value);
	}

	t.deepEqual(result, []);
});

test('.values', async t => {
	const map = new ExpiryMap<string, string>(1000);
	map.set('foo', 'bar');
	map.set('unicorn', 'rainbow');

	let result = [];

	for (const value of map.values()) {
		result.push(value);
	}

	t.deepEqual(result, ['bar', 'rainbow']);

	await delay(1100);

	result = [];

	for (const value of map.values()) {
		result.push(value);
	}

	t.deepEqual(result, []);
});

test('.entries', async t => {
	const map = new ExpiryMap<string, string>(1000);
	map.set('foo', 'bar');

	await delay(500);

	map.set('unicorn', 'rainbow');

	const result = [];

	for (const entry of map.entries()) {
		result.push(entry);
	}

	t.deepEqual(result, [
		['foo', 'bar'],
		['unicorn', 'rainbow']
	]);

	await delay(600);

	for (const entry of map.entries()) {
		t.deepEqual(entry, ['unicorn', 'rainbow']);
	}

	await delay(500);

	for (const _ of map) {
		t.fail();
	}
});

test('.forEach', async t => {
	const map = new ExpiryMap<string, string>(1000);
	map.set('foo', 'bar');

	await delay(500);

	map.set('unicorn', 'rainbow');

	let result: any = [];

	map.forEach((value, key) => {
		result.push([key, value]);
	});

	t.deepEqual(result, [
		['foo', 'bar'],
		['unicorn', 'rainbow']
	]);

	await delay(600);

	result = [];

	map.forEach((value, key) => {
		result.push([key, value]);
	});

	t.deepEqual(result, [
		['unicorn', 'rainbow']
	]);
});

test('iterator', async t => {
	const map = new ExpiryMap<string, string>(1000);
	map.set('foo', 'bar');

	await delay(500);

	map.set('unicorn', 'rainbow');

	const result = [];

	for (const entry of map) {
		result.push(entry);
	}

	t.deepEqual(result, [
		['foo', 'bar'],
		['unicorn', 'rainbow']
	]);

	await delay(600);

	for (const entry of map) {
		t.deepEqual(entry, ['unicorn', 'rainbow']);
	}

	await delay(500);

	for (const _ of map) {
		t.fail();
	}
});

test('auto cleanup', async t => {
	const map = new ExpiryMap<string, string>(1000);
	map.set('foo', 'bar');

	await delay(400);
	map.set('unicorn', 'rainbow');
	await delay(100);
	map.set('hello', 'world');

	t.true(map.has('foo'));
	t.true(map.has('unicorn'));
	t.true(map.has('hello'));
	t.is(map.size, 3);

	await delay(500);

	t.false(map.has('foo'));
	t.true(map.has('unicorn'));
	t.true(map.has('hello'));
	t.is(map.size, 2);

	await delay(400);

	t.false(map.has('foo'));
	t.false(map.has('unicorn'));
	t.true(map.has('hello'));
	t.is(map.size, 1);

	await delay(100);

	t.false(map.has('foo'));
	t.false(map.has('unicorn'));
	t.false(map.has('hello'));
	t.is(map.size, 0);
});
