#!/usr/bin/env bash
# 한 번에 실행: 근거 없는 항목 근거 채우기 → 재검증 → review.md 생성
cd "$(dirname "$0")/.." && /workspace/.pwvenv/bin/python tools/verify.py --backfill "$@"
