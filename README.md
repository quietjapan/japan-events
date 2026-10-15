# 조용한 관종의 일본 · 일본 행사 캘린더

빌드 없이 HTML/CSS/JS만으로 만든 정적 사이트예요. 일정은 전부 `events.json`에 있어요.

## 파일
- `index.html` 화면 / `style.css` 디자인 / `app.js` 필터·상태 계산
- `events.json` 일정 데이터 (이것만 고치면 돼요)

## 일정 수정하기 (events.json)
- `base_date`: 상단 "기준일" (예: `"2026-10-20"`)
- `is_sample`: `true`면 "예시 데이터" 배너 표시 → 실제 데이터로 바꾸면 `false`로
- `events` 항목 필드:
  | 필드 | 설명 |
  |---|---|
  | title_ko / title_ja | 한국어 / 일본어 제목 |
  | category | 팝업스토어, 콜라보카페, 전시·행사, 축제, 가챠, 쿠지, 플리마켓 중 하나 (카테고리마다 배지 색이 달라요) |
  | area | 도쿄, 오사카, 나고야, 전국 ... (지역 목록은 자동 생성) |
  | venue | 장소 (가챠·쿠지는 "전국 판매처" 등) |
  | start / end | `YYYY-MM-DD` (모르면 `null`, 가챠·쿠지 start=입고/발매일) |
  | reservation | 필요 / 불필요 / 선택 |
  | price | 가격 문구 |
  | official_url / source_url | 공식 링크 / 출처(X 게시물 등) |
  | notes | 메모 |
  | checked_date | 마지막으로 확인한 날 |

상태는 오늘 날짜로 자동 계산돼요: 진행 중 / 예정 / 곧 종료(7일 이내) / 종료(자동 숨김).
가챠·쿠지는 입고 중 / 입고 예정 / 곧 종료(end가 있을 때만)로 표시되고, 상단 토글에서는 입고 중=진행 중, 입고 예정=예정으로 묶여요.
쉼표·따옴표 하나만 틀려도 사이트가 안 뜨니, 수정 후 https://jsonlint.com 에서 검사해 보세요.

## 내 컴퓨터에서 미리보기
```
python -m http.server 8000
```
브라우저에서 http://localhost:8000 (파일을 더블클릭하면 json을 못 읽어요)

## GitHub Pages로 무료 배포
1. GitHub에서 새 공개 저장소 만들기 (예: `japan-events`)
2. 이 폴더 파일들 업로드 (`preview/` 폴더는 빼도 돼요)
3. 저장소 Settings → Pages → Branch `main` / `/ (root)` → Save
4. 1~2분 뒤 `https://아이디.github.io/japan-events/` 로 접속
5. 업데이트할 때는 GitHub에서 `events.json`을 열어 연필(✏️) 버튼으로 고치고 Commit 하면 끝
