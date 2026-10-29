# QUICKSTART — clone 직후 환경 안에서 복붙할 줄

키트는 **작업 폴더 밖(/tmp/kit)** 에 둔다. 작업 폴더가 홈(~)이고 그 자체가 git 저장소인 환경이 있어서, 안에 두면 제출물 diff에 섞인다.

```bash
# -1) 시작 5줄 (키트는 /tmp, 작업은 ~)
cd /tmp
git clone https://github.com/asxein/ops-workbench.git kit
cd ~
cat /tmp/kit/QUICKSTART.md
# codex 는 0~3번을 마친 뒤 작업 폴더(~)에서 켠다

# 0) 첫 커밋 전 잡파일 제외 (작업 폴더가 ~ 이고 "No commits yet" 일 때)
printf ".npm/
.codex/
.literacy/
.cache/
.bash_logout
.bashrc
.profile
.sudo_as_admin_successful
kit/
node_modules/
" >> .gitignore
git add -A && git commit -m "chore: initial state" && git log --oneline

# 1) 위치·버전
W=$(pwd); echo "작업폴더=$W"
node --version; npm -v; python3 --version; git --version
which tmux docker psql sqlite3 curl
node -e "require('node:sqlite'); console.log('node:sqlite ok')"
npm view leftpad version
git status

# 2) 환경 점검 한 줄 (결과를 NOTES 런타임 줄에)
node /tmp/kit/tools/preflight.mjs "$W"

# 3) 폴더·스킬 준비
mkdir -p docs/plan docs/handoff
mkdir -p .agents/skills && cp -r /tmp/kit/skills/* .agents/skills/ && ls .agents/skills

# 4) 서버 미리보기 점검 (Browser 탭: PORT 3000, 경로 /) → 끝나면 Ctrl+C
PORT=3000 node /tmp/kit/modules/server-std/server.mjs

# 5) 세션 띄우기 (각각 다른 터미널 탭)
codex                                  # 구현 (루트). 시작 시 업데이트 안내가 뜨면 반드시 건너뛴다(업데이트 금지)
cd docs/plan && codex                  # 계획·검증
cd docs/handoff && codex               # 문서·핸드오프

# 6) 자주 여는 카드
cat /tmp/kit/OPERATOR.md
cat /tmp/kit/prompts.md
cat /tmp/kit/flow.md
```

Codex 안에서 확인: `/status` → `/model` → `/skills` → `/` 로 명령 목록.
