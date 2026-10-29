#!/usr/bin/env node
// 완료 보고 검증 게이트. "검증한 게 없으면 통과가 아니다"를 exit 코드로 강제한다.
// 사용: node /tmp/kit/tools/gate.mjs --since v0 [--test "npm test"] [--url http://localhost:3000/api/rows] [--expect "문자열"] [--must src/]
//   exit 0 = 모든 항목 통과 / 1 = 실패 항목 있음 / 2 = 검증한 항목이 하나도 없음(게이트 미실행과 구분)
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

// 1) diff: 직전 태그 이후 기능 파일이 바뀌었는가
if (since) {
  const r = sh(`git diff --stat ${since}..HEAD`);
  const files = r.out.split('\n').filter((l) => l.includes('|')).map((l) => l.trim().split('|')[0].trim());
  const touched = files.filter((f) => f.startsWith(must));
  results.push({ name: `diff ${since}..HEAD 에 ${must} 변경`, ok: touched.length > 0, detail: touched.length ? touched.join(', ') : `변경 파일 ${files.length}개 중 ${must} 없음 → 구현이 반영되지 않았을 수 있음` });
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
  } catch (e) { results.push({ name: `GET ${url}`, ok: false, detail: `연결 실패: ${e.message}` }); }
}

if (!results.length) { console.log('GATE: 검증한 항목이 없음 (exit 2). --since/--url 중 하나는 주어야 한다.'); process.exit(2); }
for (const r of results) console.log(`${r.ok ? 'PASS' : 'FAIL'}  ${r.name}  —  ${r.detail}`);
const failed = results.filter((r) => !r.ok).length;
console.log(failed ? `GATE: FAIL ${failed}/${results.length} → 커밋 보류, 원인부터` : `GATE: PASS ${results.length}/${results.length} → 커밋 가능`);
process.exit(failed ? 1 : 0);
