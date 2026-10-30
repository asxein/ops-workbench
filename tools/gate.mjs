#!/usr/bin/env node
// 완료 보고 검증 게이트. "검증한 게 없으면 통과가 아니다"를 exit 코드로 강제한다.
// 사용: node /tmp/kit/tools/gate.mjs --since v0 [--test "npm test"] [--url http://localhost:3000/api/rows] [--expect "문자열"] [--must src/]
//   exit 0 = 모든 항목 통과 / 1 = 실패 항목 있음 / 2 = 검증한 항목이 하나도 없음(게이트 미실행과 구분)
//   --since 는 "그 태그 ↔ 지금 작업 트리"를 비교한다(미커밋 변경 포함). 커밋 전에 돌려도 된다.
import { execSync } from 'node:child_process';

const args = process.argv.slice(2);
const opt = (k, d) => { const i = args.indexOf(k); return i >= 0 ? args[i + 1] : d; };
const since = opt('--since');
const testCmd = opt('--test', 'npm test');
const url = opt('--url');
const expect = opt('--expect');
const must = opt('--must', 'src/');
const results = [];
const sh = (cmd, timeout = 120000) => { try { return { ok: true, out: execSync(cmd, { stdio: ['ignore', 'pipe', 'pipe'], timeout }).toString() }; } catch (e) { return { ok: false, out: (e.stdout?.toString() ?? '') + (e.stderr?.toString() ?? '') }; } };
const lines = (t) => t.split(/\r?\n/).filter(Boolean);

// 변경 파일 = 미커밋(수정·새 파일 포함, -uall) ∪ 직전 태그 이후 커밋된 것
const uncommitted = lines(sh('git status --short -uall').out).map((l) => l.slice(3).trim().replace(/^"|"$/g, ''));
const committed = since && since !== 'HEAD' ? lines(sh(`git diff --name-only ${since}`).out) : [];
const changed = [...new Set([...uncommitted, ...committed])];

// 0) 문서 단계 감지: 변경이 docs/·*.md 뿐이면 gate 대상이 아니다(문서는 그냥 커밋)
if (!url) {
  const isDoc = (f) => f.startsWith('docs/') || f.endsWith('.md');
  if (changed.length && changed.every(isDoc)) {
    console.log(`문서 단계: 변경 ${changed.length}개가 전부 docs/·.md → gate 대상 아님. 파일 경로와 git status --short만 보고하고 그대로 커밋한다.`);
    console.log('GATE: SKIP (문서 단계, exit 0)');
    process.exit(0);
  }
}
if (since === 'HEAD') console.log('참고: --since HEAD 는 미커밋 변경만 본다. 단계 검증은 직전 태그(prd-v1, v0 …)를 넣는다. 태그가 없으면 사용자가 T탭에서 git tag 먼저.');

// 1) diff: 직전 태그 이후(미커밋 포함) 기능 파일이 바뀌었는가
const sinceIsHead = since && sh(`git rev-parse ${since}`).out.trim() === sh('git rev-parse HEAD').out.trim();
if (since && sinceIsHead && !uncommitted.length) {
  console.log(`참고: ${since} 가 지금 HEAD와 같고 미커밋 변경도 없다 → 방금 찍은 태그 자체를 검증하는 중. diff 항목은 생략(다음 단계부터 --since ${since}).`);
} else if (since) {
  const touched = changed.filter((f) => f.startsWith(must));
  results.push({ name: `${since} 이후 ${must} 변경(미커밋 포함)`, ok: touched.length > 0, detail: touched.length ? touched.slice(0, 8).join(', ') + (touched.length > 8 ? ` 외 ${touched.length - 8}` : '') : `변경 파일 ${changed.length}개 중 ${must} 없음 → 구현이 반영되지 않았을 수 있음` });
}

// 2) 테스트 실제 실행
if (testCmd !== 'none') {
  const r = sh(testCmd, 300000);
  const pass = /# pass (\d+)/.exec(r.out)?.[1] ?? '?';
  const fail = /# fail (\d+)/.exec(r.out)?.[1] ?? (r.ok ? '0' : '?');
  results.push({ name: `테스트 (${testCmd})`, ok: r.ok && fail === '0', detail: `pass ${pass} fail ${fail}` });
}

// 3) 수용 조건: URL 응답에 기대 문자열
if (url) {
  try {
    const res = await fetch(url, { signal: AbortSignal.timeout(8000) });
    const body = await res.text();
    const ok = res.ok && (!expect || body.includes(expect));
    results.push({ name: `GET ${url}${expect ? ` ⊇ "${expect}"` : ''}`, ok, detail: `status ${res.status}, ${body.length}B${expect && !body.includes(expect) ? ', 기대 문자열 없음' : ''}` });
  } catch (e) { results.push({ name: `GET ${url}`, ok: false, detail: `연결 실패: ${e.message} → 서버가 S탭에서 떠 있는지, PORT가 같은지 확인` }); }
}

if (!results.length) { console.log('GATE: 검증한 항목이 없음 (exit 2). --since/--url 중 하나는 주어야 한다.'); process.exit(2); }
for (const r of results) console.log(`${r.ok ? 'PASS' : 'FAIL'}  ${r.name}  —  ${r.detail}`);
const failed = results.filter((r) => !r.ok).length;
console.log(failed ? `GATE: FAIL ${failed}/${results.length} → 커밋 보류, 원인부터` : `GATE: PASS ${results.length}/${results.length} → 커밋 가능`);
process.exit(failed ? 1 : 0);
