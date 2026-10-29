import { test } from 'node:test';
import assert from 'node:assert/strict';
import { buildReport, mdTable } from './report.mjs';

test('표는 파이프를 이스케이프한다', () => {
  const t = mdTable([{ a: 'x|y', b: 1 }]);
  assert.ok(t.includes('x\\|y'));
});

test('리포트는 정해진 섹션 순서를 가진다', () => {
  const md = buildReport({ title: '주간 리포트', period: 'W1', summary: ['a'], candidates: [{ 후보: 'X', 근거: '차이 6%p', 표본: 9 }], actions: ['확인'], quality: ['결측 3건 제외'] });
  const order = ['## 요약', '## 후보 Top 1', '## 권장 조치', '## 데이터 품질 메모'].map((h) => md.indexOf(h));
  assert.deepEqual([...order].sort((a, b) => a - b), order);
});
