#!/usr/bin/env bash
# 统一构建入口：强制使用 Homebrew Node (>=24)，避开 PATH 里 WorkBuddy 自带的 Node 22。
# 用法：
#   ./scripts/dev.sh ci            -> npm ci
#   ./scripts/dev.sh run build     -> npm run build
#   ./scripts/dev.sh test          -> npm test
set -euo pipefail

export PATH="/opt/homebrew/bin:$PATH"
cd "$(dirname "$0")/.."

if [ "${1:-}" = "" ]; then
	echo "usage: $0 <npm-args...>   e.g. $0 run build | $0 test | $0 ci" >&2
	exit 64
fi

echo "node $(node -v) / npm $(npm -v)  ($(which node))" >&2
exec npm "$@"
