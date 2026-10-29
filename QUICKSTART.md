# QUICKSTART — clone 직후 환경 안에서 복붙할 줄

```bash
# 1) 위치·버전
W=$(pwd); echo "작업폴더=$W"
node --version; npm -v; python3 --version; git --version
which tmux docker psql sqlite3 curl
node -e "require('node:sqlite'); console.log('node:sqlite ok')"
npm view leftpad version
git status

# 2) 환경 점검 한 줄 (결과를 NOTES 런타임 줄에)
node ~/kit/tools/preflight.mjs "$W"

# 3) 폴더·스킬 준비
mkdir -p docs/plan docs/handoff
mkdir -p .agents/skills && cp -r ~/kit/skills/* .agents/skills/ && ls .agents/skills

# 4) 서버 미리보기 점검 (Browser 탭: PORT 3000, 경로 /) → 끝나면 Ctrl+C
PORT=3000 node ~/kit/modules/server-std/server.mjs

# 5) 세션 띄우기 (각각 다른 터미널 탭)
codex                                  # 구현 (루트)
cd docs/plan && codex                  # 계획·검증
cd docs/handoff && codex               # 문서·핸드오프

# 6) 자주 여는 카드
cat ~/kit/OPERATOR.md
cat ~/kit/prompts.md
cat ~/kit/flow.md
```

Codex 안에서 확인: `/status` → `/model` → `/skills` → `/` 로 명령 목록.
