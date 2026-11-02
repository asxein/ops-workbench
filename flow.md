# 흐름 (시간순 한 장)

프롬프트 본문은 `prompts.md`. 여기는 **언제·누가·무엇을 보면 다음 단계로 가는지**만.

## 탭

| 탭 | 실행 | 쓰는 곳 |
|---|---|---|
| P → V | `cd ~/docs/plan && codex` | docs/plan (PRD, REVIEW) |
| M | `cd ~ && codex` | src·test·public (유일한 코드 작성자) |
| D | `cd ~/docs/handoff && codex` | docs/handoff (HANDOFF, NOTES) |
| S | `PORT=3000 npm start` (또는 제출 형태 실행) | 서버 |
| T | 나: `git tag`, gate, `git status` | — |

권한: `/status` → 편집마다 물으면 `/permissions` Auto. 플래그·Full access 안 씀.

## 단계와 통과 기준

| 분 | 단계 | 누가 | 통과 기준 → 다음 |
|---|---|---|---|
| 0 | 시작 4줄 → `$task-onboard` | 나·P | RUNPLAN 생김 |
| 3 / 9 | 담당자 1차·2차 질문 | **나 (내 말로)** | 답을 NOTES 요구사항 표에 Q→A |
| 5 | `$task-frame` | P | 제출물·**제출 형태** 체크리스트 (README가 정한 실행 방식. Docker면 이때 `docker info`) |
| 13~20 | PRD (P2) | P | 수용 기준에 **제출 형태 1줄** 포함 → T: `git add -A && git commit -m "docs: prd v1" && git tag prd-v1` |
| 20 | `$task-verify` / `$task-scaffold` → M1 | V / M | REVIEW 체크리스트 / 뼈대 |
| 20~65 | **v0** (M1) | M | 아래 **v0 기준** 전부 → `git tag v0` |
| 65 | `리뷰해 v0` → M2 | V → M | 고칠 번호만 골라 M2 |
| 70~120 | 기능 루프 (M3, 기능당 15분) | M | 기능마다 gate + 커밋. `v1`·`v2`는 선택 |
| 120 | `부검` (V3) → 고칠 것만 M3 | V → M | 전체 gate 통과 → `git tag verified` |
| 145 | P6 (PRD 4~9) ∥ D3 (HANDOFF) | V ∥ D | (미정) 칸 없음 |
| 145~150 | **F0** → 불일치 문서 수정 | M → D | 아래 **final 기준** 전부 → `git tag final` |
| 158 | **AI 끄기**, 직접 읽기 | 나 | 서술형 재료(아래) 머리에 넣기 |
| 170 | 제출 | 나 | — |

뒤처지면: 65분에 v0 없으면 범위 축소(NOTES 1줄). 태그는 prd-v1·v0·final만, F1 생략.

### v0 기준 (모두 충족해야 태그)
1. PRD 3장 v0 범위가 입력 → 처리 → 출력까지 끝까지 돈다
2. S: `PORT=3000 npm start` → T: `node /tmp/kit/tools/gate.mjs --since prd-v1 --url … --expect …` exit 0
3. **README가 정한 제출 형태가 `npm start`와 다르면** S 끄고 그 형태로 1회 실행 → 같은 gate 한 번 더
   예: Docker `docker build -t app . && docker run --rm -e PORT=3000 -p 3000:3000 app` / Python `python main.py` / CLI·배치는 그 명령 + 출력 파일 확인
4. Browser로 직접 확인 → `git add -A && git commit -m "feat: e2e v0" && git tag v0`

### final 기준 (모두 충족해야 태그)
1. 145분 F0 보고의 불일치를 문서(155분 이후는 문서만)나 코드로 해소하고 커밋
2. **사용가이드·HANDOFF에 적힌 실행 명령 그대로** 실행 (제출 형태 포함) → gate exit 0
3. Browser 확인 → `git tag final`
4. 서버가 불안하면 순서: 커밋 → `git tag final` 먼저 → F0 → 고친 뒤 `git tag -f final`
5. 확인 못 한 건 HANDOFF에 "미검증(사유)"

## M 완료 보고 확인 (매번 2분)

- 보고는 주장, diff와 출력이 사실. M이 붙인 `--since` gate 출력 확인 → 내가 T에서 `--url` 포함 gate
- "어느 파일 어느 함수?" 한 줄 질문. 흐리면 없는 것
- 화면·실데이터·내려받은 파일은 내가 본다 (UICHECK)

## 서술형 재료 (시험 중 D에 한 줄씩 → 158분에 먼저 읽기)

- `[결정] 무엇 / 대안 / 고른 이유(수치)` → "왜 이 기술", "왜 대안 안 씀"
- `[AI지적] 무엇이 틀렸나 / 어떻게 발견 / 수정` → "AI 산출물 문제점"
- F0 표 → "파이프라인이 어떻게 동작하는지 증명"
