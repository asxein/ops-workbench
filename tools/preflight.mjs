#!/usr/bin/env node
// 시작 3분 환경 점검. 외부 의존성 없음. 설정을 바꾸지 않고 읽기만 한다.
// 사용: node /tmp/kit/tools/preflight.mjs [작업폴더]   → 요약 한 줄을 NOTES "런타임" 줄에 붙인다.
import { execSync } from 'node:child_process';
import { existsSync, readdirSync, readFileSync, statSync } from 'node:fs';
import { createServer } from 'node:net';
import path from 'node:path';

const ws = path.resolve(process.argv[2] ?? '.');
const out = [];
const warn = [];
const run = (cmd) => { try { return execSync(cmd, { stdio: ['ignore', 'pipe', 'ignore'], timeout: 8000 }).toString().trim(); } catch { return null; } };

// 1) 런타임 버전
const node = process.version; // vX.Y.Z
const [maj, min, pat] = node.slice(1).split('.').map(Number);
const patched = { 22: [22, 23, 4], 24: [24, 22, 1], 26: [26, 12, 1] }; // 2026-10-21 보안 릴리스
let sec = 'unknown';
if (patched[maj]) {
  const [, pm, pp] = patched[maj];
  sec = (min > pm || (min === pm && pat >= pp)) ? '보안 릴리스 반영' : '2026-10 보안 릴리스 미반영(플랫폼 제공, 변경 불가; zlib·dns·tls 미사용으로 직접 영향 낮음)';
} else if (maj <= 20) sec = 'EOL 라인(LTS 이전 필요)';
out.push(`node ${node} [${sec}]`);
const npm = run('npm -v'); out.push(`npm ${npm ?? '없음'}`);
const git = run('git --version'); out.push(git ? git.replace('git version ', 'git ') : 'git 없음');
const py = run('python3 --version') ?? run('python --version'); out.push(py ?? 'python 없음');

// 2) 표준 모듈 가용성
let sqlite = false; try { await import('node:sqlite'); sqlite = true; } catch {}
out.push(`node:sqlite ${sqlite ? '사용 가능' : '없음(repo-memory 사용)'}`);

// 3) 0.0.0.0 바인딩 가능 여부 (임시 포트)
const bind = await new Promise((resolve) => { const s = createServer(); s.once('error', () => resolve(false)); s.listen(0, '0.0.0.0', () => { s.close(); resolve(true); }); });
out.push(`0.0.0.0 바인딩 ${bind ? '가능' : '실패'}`);
if (!bind) warn.push('0.0.0.0 바인딩 실패: Browser 미리보기가 안 열릴 수 있음');

// 4) git 저장소 상태
const inRepo = run(`git -C "${ws}" rev-parse --is-inside-work-tree`) === 'true';
out.push(`git 저장소 ${inRepo ? '있음' : '없음 → git init 필요'}`);
if (inRepo) { const dirty = run(`git -C "${ws}" status --porcelain`); if (dirty) warn.push(`커밋 안 된 변경 ${dirty.split('\n').length}건`); }

// 5) 작업 폴더 구성
const top = existsSync(ws) ? readdirSync(ws).filter((n) => !n.startsWith('.')) : [];
out.push(`폴더: ${top.join(', ') || '(비어 있음)'}`);
for (const need of ['README.md']) if (!existsSync(path.join(ws, need))) warn.push(`${need} 없음`);

// 6) 비밀값·개인정보 간이 스캔 (텍스트 파일 200KB 이하)
const secretRe = /(api[_-]?key|secret|token|password|passwd)\s*[:=]\s*['"]?[A-Za-z0-9_\-]{12,}|sk-[A-Za-z0-9]{20,}|ghp_[A-Za-z0-9]{20,}|\b\d{6}-\d{7}\b/i;
const hits = [];
const walk = (d, depth = 0) => { if (depth > 4) return; for (const e of readdirSync(d, { withFileTypes: true })) { if (['.git', 'node_modules', 'data'].includes(e.name)) continue; const p = path.join(d, e.name); if (e.isDirectory()) walk(p, depth + 1); else if (/\.(md|mjs|js|json|py|html|csv|txt|yml|toml|env)$/i.test(e.name) && statSync(p).size < 200_000) { const t = readFileSync(p, 'utf8'); if (secretRe.test(t)) hits.push(path.relative(ws, p)); } } };
if (existsSync(ws)) walk(ws);
if (hits.length) warn.push(`비밀값·주민번호 패턴 의심: ${hits.join(', ')}`);

console.log('런타임: ' + out.join(' · '));
if (warn.length) { console.log('주의: ' + warn.join(' / ')); process.exitCode = 1; }
