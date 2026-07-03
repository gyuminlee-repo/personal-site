#!/usr/bin/env bash
# scholar_sync_cron.sh, run scholar_sync.py from this always-on Mac and push results.
#
# Why local instead of GitHub Actions: Google Scholar bot-blocks datacenter IPs
# (scholarly raises MaxTriesExceededException). A residential IP hitting one
# profile once a day is far less likely to be blocked, so the sync actually
# refreshes instead of failing red in CI.
#
# Self-bootstrapping: creates .venv-sync + installs scholarly on first run.
# Idempotent, safe to run under launchd. macOS only.
set -euo pipefail

[ "$(uname -s)" = "Darwin" ] || { echo "macOS only"; exit 1; }

REPO_ROOT="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
VENV="$REPO_ROOT/.venv-sync"
PY="$VENV/bin/python"
BRANCH="main"
LOG_TS="$(date '+%Y-%m-%d %H:%M:%S %Z')"

cd "$REPO_ROOT"

echo "[$LOG_TS] scholar-sync-cron start ($REPO_ROOT)"

# Bootstrap venv if missing (first run or after cleanup).
if [ ! -x "$PY" ]; then
  echo "  bootstrapping venv + scholarly"
  python3 -m venv "$VENV"
  "$VENV/bin/pip" install --quiet --upgrade pip
  "$VENV/bin/pip" install --quiet scholarly
fi

# Reconcile with remote first so the push is a clean fast-forward. If the tree
# is dirty (a previous run left changes), fail loud rather than clobber.
if ! git diff --quiet || ! git diff --cached --quiet; then
  echo "  ERROR: working tree dirty before sync, aborting to avoid clobber" >&2
  git status -s >&2
  exit 1
fi
git fetch --quiet origin "$BRANCH"
git merge --ff-only --quiet "origin/$BRANCH"

# Run the sync. scholar_sync.py keeps previous JSON and exits 0 if Scholar
# blocks, so a blocked day is a no-op, not a failure.
SCHOLAR_ID="${SCHOLAR_ID:-cnTN6OkAAAAJ}" "$PY" scripts/scholar_sync.py

if git diff --quiet -- src/data/scholar_metrics.json src/data/publications.json; then
  echo "  no metric changes, nothing to commit"
  echo "[$LOG_TS] scholar-sync-cron done (no-op)"
  exit 0
fi

git add src/data/scholar_metrics.json src/data/publications.json
git -c user.name='scholar-sync-bot' -c user.email='bot@gyuminlee.dev' \
  commit --quiet -m "chore: scholar sync $(date -u +%Y-%m-%d)"
git push --quiet origin "$BRANCH"

# Verify the push actually landed (silent push-fail guard).
if [ "$(git rev-list --count "origin/$BRANCH..$BRANCH")" != "0" ]; then
  echo "  ERROR: push did not land, local ahead of origin/$BRANCH" >&2
  exit 1
fi

echo "  pushed scholar update; Cloudflare deploy triggers on main push"
echo "[$LOG_TS] scholar-sync-cron done (updated)"
