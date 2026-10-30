---
name: task-scaffold
description: PRD 스택 결정표에서 사용자가 승인한 모듈만 modules/에서 복사해 src·public·test 뼈대를 만들고, 문서 뼈대(docs/plan, docs/handoff)를 둔다. 승인되지 않은 모듈은 가져오지 않는다. 과제 로직은 넣지 않는다.
---

# task-scaffold

사용 시점: 과제 시작 0~10분, 구현 세션(루트)에서. PRD 확정 전에는 `src/`에 과제 로직을 넣지 않는다.

절차
1. `docs/plan/PRD.md` 5장 스택 결정표에서 "사용자 결정 = 승인"인 행의 모듈만 `/tmp/kit/modules/<이름>/`에서 복사한다(코드는 src/, index.html은 public/, 테스트는 test/). import 경로를 `./`로 정리하고 package.json(start, test)을 만든다. 승인되지 않은 모듈은 복사하지 않는다. 이미 같은 파일이 있으면 덮어쓰지 않고 보고한다.
2. `/tmp/kit/templates/`의 PLAN.md(setup.sh가 이미 복사했으면 건너뜀) → `docs/plan/PRD.md`, UICHECK.md → `docs/plan/`, NOTES.md·HANDOFF.md → `docs/handoff/`, CHECKLIST.md → 루트. README가 문서 파일명을 지정했으면 그 이름을 쓴다.
3. `CHECKLIST.md`에 README의 필수조건과 제출물 파일명을 체크박스로 옮긴다.
4. `npm test`를 실제로 실행하고 출력을 보고한다.
5. `git add -A && git commit -m "chore: scaffold"` 명령을 완료 보고에 포함한다.

규칙: 외부 패키지를 설치하지 않는다(표준 라이브러리와 /tmp/kit/modules/만). 서버는 0.0.0.0 + PORT. README 제출물 외 파일을 만들지 않는다. 완료 보고에 만든 파일 목록과 `npm test` 실제 출력을 붙인다.
