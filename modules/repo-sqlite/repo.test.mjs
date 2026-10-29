import { test } from 'node:test';
import assert from 'node:assert/strict';

let createSqliteRepo = null;
try { ({ createSqliteRepo } = await import('./repo.mjs')); } catch { /* node:sqlite 없음 */ }

test('node:sqlite가 있으면 list/get/upsert/size가 동작한다', { skip: !createSqliteRepo && 'node:sqlite 미지원 Node' }, () => {
  const r = createSqliteRepo({ columns: ['id', 'v'] });
  r.upsert({ id: 1, v: 'a' });
  r.upsert({ id: 2, v: 'b' });
  r.upsert({ id: 1, v: 'c' });
  assert.equal(r.size(), 2);
  assert.equal(r.get(1).v, 'c');
  assert.equal(r.list((x) => x.v === 'b').length, 1);
  assert.equal(r.get(9), null);
  r.close();
});
