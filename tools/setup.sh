#!/usr/bin/env bash
# 과제 시작 세팅 한 줄: bash /tmp/kit/tools/setup.sh   (작업 폴더에서 실행)
# 하는 일: .gitignore(잡파일 제외) → 첫 커밋 → docs/plan, docs/handoff → 템플릿 복사 → 스킬 복사 → preflight
# 하지 않는 것: 기존 파일 덮어쓰기, 설정 변경, 네트워크 호출
set -u
KIT="${KIT:-/tmp/kit}"
W="$(pwd)"
echo "작업폴더=$W / 키트=$KIT"

# 0) 잡파일 제외 + 첫 커밋 (저장소가 없으면 init)
if ! git rev-parse --is-inside-work-tree >/dev/null 2>&1; then git init -q; echo "git init"; fi
for p in .npm/ .codex/ .literacy/ .cache/ .bash_logout .bashrc .profile .sudo_as_admin_successful kit/ node_modules/; do
  grep -qxF "$p" .gitignore 2>/dev/null || echo "$p" >> .gitignore
done
if ! git rev-parse HEAD >/dev/null 2>&1; then
  git -c user.name="${GIT_AUTHOR_NAME:-participant}" -c user.email="${GIT_AUTHOR_EMAIL:-participant@local}" add -A
  git -c user.name="${GIT_AUTHOR_NAME:-participant}" -c user.email="${GIT_AUTHOR_EMAIL:-participant@local}" commit -q -m "chore: initial state" && echo "첫 커밋: chore: initial state"
else
  echo "기존 커밋 있음: $(git log --oneline -n 1)"
fi

# 1) 문서 폴더 + 템플릿 (있으면 건너뜀)
mkdir -p docs/plan docs/handoff
cp -n "$KIT/templates/PLAN.md"      docs/plan/PRD.md        2>/dev/null && echo "+ docs/plan/PRD.md"
cp -n "$KIT/templates/UICHECK.md"   docs/plan/UICHECK.md    2>/dev/null && echo "+ docs/plan/UICHECK.md"
cp -n "$KIT/templates/NOTES.md"     docs/handoff/NOTES.md   2>/dev/null && echo "+ docs/handoff/NOTES.md"
cp -n "$KIT/templates/HANDOFF.md"   docs/handoff/HANDOFF.md 2>/dev/null && echo "+ docs/handoff/HANDOFF.md"
cp -n "$KIT/templates/CHECKLIST.md" CHECKLIST.md            2>/dev/null && echo "+ CHECKLIST.md"
cp -n "$KIT/AGENTS.md"              AGENTS.md               2>/dev/null && echo "+ AGENTS.md"

# 2) 스킬
mkdir -p .agents/skills && cp -rn "$KIT/skills/." .agents/skills/ && echo "스킬: $(ls .agents/skills | tr '\n' ' ')"

# 3) 환경 점검 (결과 첫 줄을 NOTES 런타임 줄에 넣는다)
node "$KIT/tools/preflight.mjs" "$W" | tee /tmp/preflight.txt
RT="$(head -n 1 /tmp/preflight.txt)"
if [ -f docs/handoff/NOTES.md ] && grep -q '^런타임:' docs/handoff/NOTES.md; then
  sed -i "s|^런타임:.*|$RT · 키트 출처: https://github.com/asxein/ops-workbench|" docs/handoff/NOTES.md && echo "NOTES 런타임 줄 갱신"
fi

echo
echo "다음: README가 제출 문서 파일명을 지정했으면 docs/의 파일을 그 이름으로 옮긴다 → git add -A && git commit -m \"chore: add working rules, doc templates (from public ops-workbench)\" → codex"
