#!/bin/bash
# THE BURST JOB: one job of a batch on a burst droplet, as task/burst/index.ts starts it through
# task/kernel/droplet-launch.sh (which already gives it its own session, nice 19, the idle I/O class and the cap).
#
#   job.sh <job dir>
#
# <job dir> holds command.sh (the job's command, written by task/burst/index.ts) and threads (its thread budget). The
# command runs by bash in the package directory with TSX, THREADS and CORES set and node, cargo and tsx on PATH (the
# toolchain task/kernel/droplet-job.sh installed under tools/ at `burst up`). It writes the sentinels the runner reads:
# <job dir>/started before the command and <job dir>/finished after it, with the command's exit code in
# <job dir>/command.exit. droplet-launch.sh writes job.exit (124 when the cap stopped it).

set -u
DIR=$1
PKG=$(cd "$(dirname "$0")/../.." && pwd)
RUN=$(dirname "$PKG")
TOOLS="$RUN/tools"
cd "$PKG" || exit 1
export PATH="$TOOLS/node/bin:$TOOLS/cargo/bin:$TOOLS/node_modules/.bin:$PATH"
export TSX="$TOOLS/node_modules/.bin/tsx"
export CORES=$(nproc)
export THREADS=$(cat "$DIR/threads")
date -u +%FT%TZ >"$DIR/started"
echo "== burst job $(basename "$DIR") started on $(hostname) at $(date -u +%FT%TZ), $THREADS of $CORES threads"
bash "$DIR/command.sh" </dev/null
code=$?
echo "$code" >"$DIR/command.exit"
echo "== burst job $(basename "$DIR") exit $code at $(date -u +%FT%TZ)"
date -u +%FT%TZ >"$DIR/finished"
exit "$code"
