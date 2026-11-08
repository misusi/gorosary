#!/usr/bin/env bash
#
# Boots GoRosary on macOS or Linux.
#
#   ./scripts/startup.sh              # website on http://localhost:3000
#   ./scripts/startup.sh mobile       # the Expo app
#   ./scripts/startup.sh all          # both
#   ./scripts/startup.sh check        # validate the content and typecheck
#   ./scripts/startup.sh install      # install dependencies and compile only
set -euo pipefail

TARGET="${1:-web}"
ROOT="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
cd "$ROOT"

step() { printf '\n\033[36m==> %s\033[0m\n' "$1"; }
fail() { printf '\033[31mx  %s\033[0m\n' "$1" >&2; exit 1; }

printf '\n\033[1mGoRosary\033[0m\n\033[90mgorosary.app\033[0m\n'

command -v node >/dev/null 2>&1 || fail 'Node is not installed. Install Node 20.11 or newer.'
NODE_VERSION="$(node --version)"
step "Node $NODE_VERSION"

MAJOR="$(printf '%s' "$NODE_VERSION" | sed 's/^v//' | cut -d. -f1)"
[ "$MAJOR" -ge 20 ] || fail "Node 20 or newer is required. You have $NODE_VERSION"

if [ ! -d node_modules ]; then
  step 'Installing dependencies (first run only)'
  npm install --no-audit --no-fund
fi

step 'Compiling the prayer content and shared packages'
npm run build:packages || fail 'The content did not compile. Fix the files named in the error above.'

case "$TARGET" in
  install)
    printf '\n\033[32mReady. Run ./scripts/startup.sh to start the website.\033[0m\n'
    ;;
  check)
    step 'Typechecking every workspace'
    npm run typecheck || fail 'Typecheck failed'
    printf '\n\033[32mEverything checks out.\033[0m\n'
    ;;
  web)
    step 'Starting the website on http://localhost:3000'
    npm run dev --workspace @gorosary/web
    ;;
  mobile)
    step 'Starting the Expo app'
    npm run dev --workspace @gorosary/mobile
    ;;
  all)
    step 'Starting the website and the app'
    npm run dev:all
    ;;
  *)
    fail "Unknown target '$TARGET'. Use web, mobile, all, check, or install."
    ;;
esac
