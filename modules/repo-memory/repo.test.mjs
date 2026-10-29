import { test } from 'node:test';
import assert from 'node:assert/strict';
import { createMemoryRepo } from './repo.mjs';
import { clean } from '../ingest-std/ingest.mjs';

test('list/get/upsert', () => {
  const r = createMemoryRepo([{ id: 1, v: 'a' }]);
  r.upsert({ id: 2, v: 'b' });
  r.upsert({ id: 1, v: 'c' });
  assert.equal(r.size(), 2);
  assert.equal(r.get(1).v, 'c');
  assert.equal(r.list((x) => x.v === 'b').length, 1);
});

test('clean은 완전 중복을 제거하고 공백을 다듬는다', () => {
  const out = clean([{ a: ' x ' }, { a: ' x ' }, { a: 'y' }]);
  assert.deepEqual(out, [{ a: 'x' }, { a: 'y' }]);
});

test('없는 id는 null', () => {
  assert.equal(createMemoryRepo().get(9), null);
});
