#!/bin/zsh

set -u

PROJECT_DIR="$(cd "$(dirname "$0")/.." && pwd)"
LOG_FILE="$PROJECT_DIR/.git/auto-sync.log"

cd "$PROJECT_DIR" || exit 1

timestamp() { date '+%Y-%m-%d %H:%M:%S'; }

if ! /usr/bin/git diff --quiet || ! /usr/bin/git diff --cached --quiet; then
  echo "$(timestamp) skip: working tree has uncommitted changes" >> "$LOG_FILE"
  exit 0
fi

/usr/bin/git fetch origin main >> "$LOG_FILE" 2>&1 || {
  echo "$(timestamp) retry later: cannot reach GitHub" >> "$LOG_FILE"
  exit 0
}

ahead=$(/usr/bin/git rev-list --count origin/main..HEAD 2>/dev/null || echo 0)
behind=$(/usr/bin/git rev-list --count HEAD..origin/main 2>/dev/null || echo 0)

if [ "$behind" -gt 0 ]; then
  echo "$(timestamp) stopped safely: remote has newer commits; manual pull is required" >> "$LOG_FILE"
  exit 0
fi

if [ "$ahead" -gt 0 ]; then
  /usr/bin/git push origin main >> "$LOG_FILE" 2>&1 && echo "$(timestamp) pushed $ahead commit(s)" >> "$LOG_FILE"
fi

