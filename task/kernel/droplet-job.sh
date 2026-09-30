#!/bin/bash
# THE DROPLET JOB: what task/kernel/droplet-run.ts runs on a CPU machine (a rented CPU droplet, or an existing host such
# as a work droplet), once, after copying this package to <run dir>/pkg. task/kernel/
#   1. the machine: CPU, memory, load
#   2. the toolchain, all of it under <run dir>/tools unless the machine already has it: node 24 (the system's if it is
#      24, else the official tarball), rust (the system's cargo, else rustup into tools/ with --no-modify-path), tsx (the
#      one npm package the tasks need, installed into tools/, never into the package)
#   3. the build: the plain native addon (task/kernel/build.ts native)
#   4. the steps: every line of job-steps.tsv (written by droplet-run.ts), each "<name> TAB <0|1> TAB <command>", the
#      command run by bash in the package directory with TSX, THREADS, THREAD_LIST and CORES set; 1 marks a step as
#      informational (its
#      exit code is reported and never fails the run)
# Every step writes tmp/droplet-logs/<name>.log and a line "<name> <exit> <seconds> [info]" to steps.txt. A failed step
# is reported and the job goes on, so one failure does not cost the rest of the run.
#
# It changes nothing outside <run dir> unless VIBE_SYSTEM_INSTALL=1, which droplet-run.ts sets only on a droplet it
# created itself: then a missing C compiler is installed with apt. On a shared host a missing compiler stops the job.

set -u
PKG=$(cd "$(dirname "$0")/../.." && pwd)
RUN=$(dirname "$PKG")
cd "$PKG" || exit 1
LOG="$PKG/tmp/droplet-logs"
TOOLS="$RUN/tools"
mkdir -p "$LOG" "$TOOLS"
# the sentinels droplet-run.ts reads: started here, finished on the last line. A run without both did not happen
date -u +%FT%TZ >"$LOG/started"
echo "== job started on $(hostname) as $(id -un), in $PKG"
export PATH="$TOOLS/node/bin:$TOOLS/cargo/bin:$TOOLS/node_modules/.bin:$PATH"
TSX="$TOOLS/node_modules/.bin/tsx"
CORES=$(nproc)
THREADS="${THREADS:-$CORES}"
# the thread counts a benchmark sweeps: 1, 4, 8 and 16 where they fit, and THREADS itself
THREAD_LIST=$(printf '1\n4\n8\n16\n%s\n' "$THREADS" | awk -v t="$THREADS" '$1 <= t' | sort -nu | paste -sd, -)
export TSX CORES THREADS THREAD_LIST

step() {
  local name=$1 info=$2
  shift 2
  local t0
  t0=$(date +%s)
  echo "== $(date -u +%H:%M:%S) $name"
  "$@" >"$LOG/$name.log" 2>&1
  local code=$?
  echo "== $(date -u +%H:%M:%S) $name exit $code in $(($(date +%s) - t0)) s"
  tail -n 4 "$LOG/$name.log"
  if [ "$info" = 1 ]; then
    echo "$name $code $(($(date +%s) - t0)) info" >>"$LOG/steps.txt"
  else
    echo "$name $code $(($(date +%s) - t0))" >>"$LOG/steps.txt"
  fi
}

machine() {
  uname -a
  echo "cores $CORES, threads for the job $THREADS"
  free -g
  lscpu | grep -E 'Model name|Thread|Core|Socket|NUMA node|L3|Flags' | cut -c 1-200
  uptime
  echo "nice $(nice)"
  command -v ionice >/dev/null && ionice -p $$
  command -v taskset >/dev/null && taskset -cp $$
}

install_node() {
  if command -v node >/dev/null && node --version | grep -q '^v24\.'; then
    echo "system node $(node --version)"
    return 0
  fi
  local file arch=x64
  [ "$(uname -m)" = aarch64 ] && arch=arm64
  file=$(curl -fsSL https://nodejs.org/dist/latest-v24.x/SHASUMS256.txt | awk -v a="linux-$arch.tar.xz" '$2 ~ a"$" {print $2}')
  curl -fsSL "https://nodejs.org/dist/latest-v24.x/$file" -o "$TOOLS/node.tar.xz" || return 1
  mkdir -p "$TOOLS/node"
  tar -xJf "$TOOLS/node.tar.xz" -C "$TOOLS/node" --strip-components=1 || return 1
  node --version
}

install_rust() {
  if ! command -v cc >/dev/null; then
    if [ "${VIBE_SYSTEM_INSTALL:-0}" = 1 ]; then
      (apt-get update && apt-get install -y build-essential) || return 1
    else
      echo "no C compiler (cc) on this host, and installing one would change the system: stopping"
      return 1
    fi
  fi
  if command -v cargo >/dev/null; then
    echo "cargo $(cargo --version) at $(command -v cargo)"
    return 0
  fi
  # our own rustup, confined to tools/ (set only here, so a host's own rustup-managed cargo is never redirected)
  export RUSTUP_HOME="$TOOLS/rustup"
  export CARGO_HOME="$TOOLS/cargo"
  curl -fsSL https://sh.rustup.rs -o "$TOOLS/rustup-init.sh" || return 1
  sh "$TOOLS/rustup-init.sh" -y --no-modify-path --profile minimal --default-toolchain stable || return 1
  cargo --version
}

install_tsx() {
  (cd "$TOOLS" && { [ -f package.json ] || npm init -y >/dev/null; } && npm install --no-audit --no-fund tsx@4) || return 1
  "$TSX" --version
}

step machine 0 machine
step install_node 0 install_node
step install_rust 0 install_rust
step install_tsx 0 install_tsx
step build_native 0 "$TSX" task/kernel/build.ts native

if [ -f "$PKG/job-steps.tsv" ]; then
  while IFS=$'\t' read -r name info command; do
    [ -z "$name" ] && continue
    step "$name" "$info" bash -c "$command" </dev/null
  done <"$PKG/job-steps.tsv"
fi

echo "== $(date -u +%H:%M:%S) job done"
cat "$LOG/steps.txt"
date -u +%FT%TZ >"$LOG/finished"
