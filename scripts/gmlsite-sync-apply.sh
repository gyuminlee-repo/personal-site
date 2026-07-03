#!/usr/bin/env bash
# gmlsite-sync-apply.sh, register the daily scholar-sync LaunchAgent on this Mac.
#
# Copies the tracked plist into ~/Library/LaunchAgents and (re)bootstraps it so
# scholar_sync_cron.sh runs every day at 05:00 local. Idempotent. macOS only,
# user domain (no sudo).
set -euo pipefail

[ "$(uname -s)" = "Darwin" ] || { echo "macOS only"; exit 1; }

REPO_ROOT="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
LABEL="com.gml.gmlsite-scholar-sync"
SRC="$REPO_ROOT/config/launchd/$LABEL.plist"
DEST="$HOME/Library/LaunchAgents/$LABEL.plist"
DOMAIN="gui/$(id -u)"

[ -f "$SRC" ] || { echo "missing plist: $SRC"; exit 1; }

cp "$SRC" "$DEST"
plutil -lint "$DEST"

# Re-bootstrap: unload any prior instance, then load fresh.
launchctl bootout "$DOMAIN/$LABEL" 2>/dev/null || true

if ! launchctl bootstrap "$DOMAIN" "$DEST" 2>/tmp/gmlsite-bootstrap.err; then
  # A disabled label yields "Input/output error"; enable then retry.
  if grep -qi "input/output error" /tmp/gmlsite-bootstrap.err; then
    launchctl enable "$DOMAIN/$LABEL"
    launchctl bootstrap "$DOMAIN" "$DEST"
  else
    cat /tmp/gmlsite-bootstrap.err >&2
    exit 1
  fi
fi

echo "registered $LABEL (daily 05:00)"
launchctl print "$DOMAIN/$LABEL" 2>/dev/null | grep -E "state =|program =" | sed 's/^/  /' || true
echo
echo "run once now to verify:  $REPO_ROOT/scripts/scholar_sync_cron.sh"
