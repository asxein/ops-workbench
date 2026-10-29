# modules — 조합 가능한 자체 모듈 (설치 없음)

각 모듈은 한 폴더에 코드 + 테스트. 과제 폴더로 **필요한 것만 복사**해 `src/`에 둔다(import 경로는 복사 후 `./`로 바꾼다). 선택 근거는 `../catalog.md`.

| 모듈 | 파일 | 용도 | 언제 안 쓰나 |
|---|---|---|---|
| server-std | server.mjs | node:http, 0.0.0.0+PORT, 정적 1장, /api JSON | 라우트 10개 이상이면 express 검토 |
| csv-std | csv.mjs | 따옴표·줄바꿈·BOM 처리 parse/serialize | 수십만 행 스트리밍 |
| ingest-std | ingest.mjs | 파일 로드 + 기본 정제(중복·공백) | 형식이 csv가 아니면 어댑터 새로 |
| repo-memory | repo.mjs | 메모리 배열 {list,get,upsert,size} | 영속성·동시 쓰기 |
| repo-sqlite | repo.mjs | 같은 인터페이스의 node:sqlite 구현 | Node 22.13 미만 |
| search-keyword | search.mjs | 조각화 + 역색인 + 간이 BM25 | 문서 수천 개 이상, 퍼지 매칭 |
| report-md | report.mjs | 회의용 Markdown 리포트(요약→후보→조치→품질) | 화면 렌더가 요구될 때 |
| ui-table | index.html | 인라인 표+필터+CSV 내려받기 | 차트 명시 요구 |

조합 예: A 유형 = server-std + csv-std + ingest-std + repo-memory + ui-table (+ report-md). C 유형 = server-std + search-keyword + ui-table. B 유형 = 기존 코드 유지, 필요 시 csv-std만.

전체 테스트: 루트에서 `npm test`.
