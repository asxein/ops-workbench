import { test } from 'node:test';
import assert from 'node:assert/strict';
import { parseCsv, toCsv } from './csv.mjs';

test('따옴표·쉼표·줄바꿈 필드를 파싱한다', () => {
  const rows = parseCsv('a,b\n1,"x, y"\n2,"line\nbreak"\n');
  assert.equal(rows.length, 2);
  assert.equal(rows[0].b, 'x, y');
  assert.equal(rows[1].b, 'line\nbreak');
});

test('BOM과 CRLF를 처리한다', () => {
  const rows = parseCsv('﻿a,b\r\n1,2\r\n');
  assert.deepEqual(rows, [{ a: '1', b: '2' }]);
});

test('toCsv는 BOM을 붙이고 특수문자를 이스케이프한다', () => {
  const out = toCsv([{ a: 'x,y', b: 'q"q' }]);
  assert.ok(out.startsWith('﻿'));
  assert.ok(out.includes('"x,y"'));
  assert.ok(out.includes('"q""q"'));
});
