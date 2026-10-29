# ops-workbench

제한 시간 과제(제한 시간 안에 README 기반 업무 과제를 코딩 에이전트와 함께 구현)를 위한 **작업 규칙·프롬프트·문서 템플릿·표준 모듈 뼈대**. 과제 해답은 들어 있지 않다. 모든 내용은 제작자가 리허설(2026-10-27~29)에서 직접 작성했다.

## 구성

| 경로 | 내용 |
|---|---|
| `QUICKSTART.md` | clone 직후 환경 안에서 복붙할 명령 줄(위치·버전·점검·폴더·스킬·서버·세션) |
| `OPERATOR.md` | **운영자 카드: 분 단위로 내가 치는 것·읽는 것·정하는 것** (가장 먼저 읽을 것) |
| `AGENTS.md` | 코딩 에이전트 작업 규칙 (커밋·검증·문서·금지사항) |
| `prompts.md` | 세션별 프롬프트 카드 (P1~P3, M0~M4, V1~V3, D1~D3, F1) |
| `flow.md` | 시간순 세션 운영 플로우 (분 단위, 세션 실행 명령, 완료 보고 검증 3종) |
| `session-card.md` | 세션 역할·태그 체크포인트·키트 결정 트리 |
| `templates/` | PLAN(PRD)·NOTES·HANDOFF·CHECKLIST 뼈대 + **UICHECK**(내가 직접 하는 5분 UI·데이터 검증 카드) |
| `security.md` | 보안·런타임 기준선: 시작 3분 버전 기록, 지원 중/EOL 표, 코드 수준 기본 다섯 줄, HANDOFF 보안 섹션 틀 |
| `tools/preflight.mjs` | 시작 3분 환경 점검(런타임·보안 릴리스 반영 여부·node:sqlite·0.0.0.0 바인딩·git·비밀값 스캔). 읽기만, 설정 변경 없음 |
| `tools/gate.mjs` | 완료 보고 검증 게이트: 직전 태그 이후 src 변경 여부 + 테스트 실제 실행 + 수용 조건 URL 확인. 검증 항목 0개면 exit 2 |
| `catalog.md` | **스택 카탈로그**: 계층별 자체 모듈 후보(외부 패키지·타인 저장소 없음), 근거·위험, 결정 표 작성 규칙(승인/변경/컷) |
| `modules/` | 조합 가능한 자체 모듈 8종(설치 없음, 모듈별 테스트): server-std, csv-std, ingest-std, repo-memory, repo-sqlite, search-keyword, report-md, ui-table |
| `skills/` | Codex 스킬 3종: `task-onboard`(과제 유형 판별 → RUNPLAN), `task-frame`(조사·질문·접근안), `task-scaffold`(뼈대 생성) |
| `playbooks/` | 유형별 실행 각본(playbook): A 데이터→화면/리포트, B 기존 코드 수정, C 문서·지식 응답. 온보딩 스킬이 고른다 |

## 과제 시작 시 적용 (5분)

```bash
cd /tmp && git clone https://github.com/asxein/ops-workbench.git kit && cd ~
cd <작업 폴더>
mkdir -p docs/plan docs/handoff
cp /tmp/kit/AGENTS.md ./AGENTS.md
cp /tmp/kit/templates/PLAN.md docs/plan/PRD.md && cp /tmp/kit/templates/UICHECK.md docs/plan/
cp /tmp/kit/templates/NOTES.md /tmp/kit/templates/HANDOFF.md docs/handoff/
cp /tmp/kit/templates/CHECKLIST.md ./CHECKLIST.md
# 모듈은 PRD 스택 결정표에서 승인된 것만 복사 (예: A 유형)
mkdir -p src public test && cp /tmp/kit/modules/server-std/server.mjs /tmp/kit/modules/csv-std/csv.mjs /tmp/kit/modules/ingest-std/ingest.mjs /tmp/kit/modules/repo-memory/repo.mjs src/ && cp /tmp/kit/modules/ui-table/index.html public/ && cp /tmp/kit/modules/csv-std/csv.test.mjs /tmp/kit/modules/repo-memory/repo.test.mjs test/
# 복사 후 import 경로를 ./ 로 정리한다
# 스킬 인식 경로는 환경 안내를 따른다
mkdir -p .agents/skills && cp -r /tmp/kit/skills/* .agents/skills/
node /tmp/kit/tools/preflight.mjs .      # 결과 한 줄을 docs/handoff/NOTES.md 런타임 줄에
git add -A && git commit -m "chore: add working rules, doc templates, scaffold (from public ops-workbench)"
```

README가 제출 문서 파일명을 지정하면 그 이름으로 복사한다. 출처(이 저장소 URL)는 NOTES.md 첫 줄에 적는다.

## 온보딩 흐름 (0~8분)

1. 사용자가 README를 두 번 읽고 담당자에게 1차 질문 3~4개를 보낸다(내 말로).
2. 계획 세션에서 `task-onboard` → 유형 판별, `docs/plan/RUNPLAN.md` 생성 (3분).
3. 사용자가 RUNPLAN의 "결정할 것 3개"를 정한다. 그 다음 `task-frame`(추가 질문·접근안) → PRD(P2).
4. 구현 세션에서 `task-scaffold`(유형 A·C만; B는 기존 코드 그대로).

각본은 해법이 아니라 **순서·v0 정의·검증 포인트·함정 목록**이다. 과제별 규칙·점수·스택은 PRD에서 사용자가 정한다.

## 세션 실행

```bash
codex                              # M 구현 (작업 폴더 루트에서 실행)
cd docs/plan && codex              # P→V 계획·검증 (작업 폴더가 docs/plan이라 그 아래만 쓰기)
cd docs/handoff && codex           # D 문서·핸드오프 (docs/handoff 아래만 쓰기). 모델은 안에서 /model

실행 플래그로 승인 정책·모델을 바꾸지 않는다. 제공 환경의 기본 설정을 그대로 쓰고, 모델은 `/model`, 현재 설정은 `/status`로 확인한다. 쓰기 범위는 "어느 폴더에서 codex를 실행했는가"로만 정해진다.
```

## 완료 보고 검증 (매 기능마다)

```bash
node /tmp/kit/tools/gate.mjs --since v0 --url "http://localhost:3000/api/rows?size=5" --expect "기대 문자열"
# exit 0 커밋 가능 / 1 실패 → 원인부터 / 2 검증한 게 없음
```

게이트는 사람의 검증 3종(diff·출력·파일명)을 스크립트로 묶은 것이다. 통과해도 Browser 탭에서 눈으로 한 번 더 본다(UICHECK).

## 모듈 테스트

```bash
npm test        # modules/**/*.test.mjs (repo-sqlite는 Node 22.13+에서만)
```

## 스택 결정 흐름

온보딩(P0)이 `catalog.md`에서 후보를 골라 **근거·대안·설치 필요·위험**을 붙여 제안 → 나는 행마다 **승인 / 변경 / 컷** → PRD 5장에는 승인된 행만 → 구현 세션은 승인된 행만 쓴다. 구현 중 바꿀 이유가 생기면 임의로 바꾸지 않고 행을 추가해 근거를 적고 다시 결정을 받는다.
