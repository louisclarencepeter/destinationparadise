#!/usr/bin/env bash
set -euo pipefail
APP_ROOT="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
cd "$APP_ROOT"
# Expo advertises 127.0.0.1 for localhost sessions; Node 24 otherwise may bind
# only ::1 on macOS, making native simulator connections fail.
export NODE_OPTIONS="${NODE_OPTIONS:+$NODE_OPTIONS }--dns-result-order=ipv4first"
MODE="${1:-start}"
if [[ -f pnpm-lock.yaml ]] && command -v pnpm >/dev/null; then
  EXPO_CMD=(pnpm exec expo)
elif [[ -f yarn.lock ]] && command -v yarn >/dev/null; then
  EXPO_CMD=(yarn expo)
elif [[ -f bun.lock ]] && command -v bun >/dev/null; then
  EXPO_CMD=(bunx expo)
else
  EXPO_CMD=(npx expo)
fi
case "$MODE" in
  start|run) exec "${EXPO_CMD[@]}" start ;;
  --ios|ios) exec "${EXPO_CMD[@]}" start --ios ;;
  --android|android) exec "${EXPO_CMD[@]}" start --android ;;
  --web|web) exec "${EXPO_CMD[@]}" start --web ;;
  --dev-client|dev-client) exec "${EXPO_CMD[@]}" start --dev-client ;;
  --tunnel|tunnel) exec "${EXPO_CMD[@]}" start --tunnel ;;
  --export-web|export-web) exec "${EXPO_CMD[@]}" export --platform web ;;
  --help|help) cat <<'USAGE'
Destination Paradise mobile
./script/build_and_run.sh [start|--ios|--android|--web|--dev-client|--tunnel|--export-web]
Starts Expo Go by default. Metro runs in this terminal; Ctrl-C stops it.
USAGE
    ;;
  *) echo "Unknown mode. Use --help." >&2; exit 2 ;;
esac
