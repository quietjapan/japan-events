#!/usr/bin/env bash
# 한 번에 실행 (기본 정책: 공식 출처로 확인된 것만 게시, 나머지는 pending.json 에 보관만 — 사람 검수 대기열 없음)
# 1) 근거 없는 항목 근거 채우기 → 2) 쿠지/가챠 상품 썸네일 → 3) 공식 원문 재검증·종료 삭제 → review.md
set -e
cd "$(dirname "$0")/.."
PY=/workspace/.pwvenv/bin/python
(cd tools && $PY thumbs.py && $PY geo.py)
$PY tools/verify.py --backfill "$@"
