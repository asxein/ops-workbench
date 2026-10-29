// 입력 어댑터. 과제 데이터 형식에 맞춰 이 파일만 바꾼다. 원본은 수정하지 않는다.
import { readFileSync } from 'node:fs';
import { parseCsv } from '../csv-std/csv.mjs';

export function loadRecords(path = process.env.DATA_PATH ?? 'data/input.csv') {
  return parseCsv(readFileSync(path, 'utf8'));
}

// 정제 규칙은 순수 함수로. 규칙마다 NOTES.md 데이터 품질 메모에 한 줄.
export function clean(records) {
  const seen = new Set();
  return records
    .filter((r) => { const k = JSON.stringify(r); if (seen.has(k)) return false; seen.add(k); return true; })
    .map((r) => Object.fromEntries(Object.entries(r).map(([k, v]) => [k, typeof v === 'string' ? v.trim() : v])));
}
