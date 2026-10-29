import { test } from 'node:test';
import assert from 'node:assert/strict';
import { buildIndex, search, chunkMarkdown } from './search.mjs';

const docs = chunkMarkdown('# 장비 정지 절차\n전원을 끄기 전에 인터락을 확인한다.\n## 재가동\n점검 후 담당자 승인이 필요하다.\n# 휴가 신청\n시스템에서 신청한다.', 'sop.md');

test('제목 단위로 조각을 나누고 출처를 남긴다', () => {
  assert.equal(docs.length, 3);
  assert.equal(docs[0].title, '장비 정지 절차');
  assert.equal(docs[0].source, 'sop.md');
});

test('관련 조각이 상위에 오고 매칭 단어를 알려 준다', () => {
  const idx = buildIndex(docs);
  const r = search(idx, '재가동 승인');
  assert.equal(r[0].chunk.title, '재가동');
  assert.ok(r[0].matched.includes('승인'));
});

test('문서에 없는 질문은 빈 결과', () => {
  const idx = buildIndex(docs);
  assert.deepEqual(search(idx, '커피 머신'), []);
});
