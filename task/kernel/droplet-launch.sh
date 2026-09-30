#!/bin/bash
# THE LAUNCHER: how task/kernel/droplet-run.ts starts a job on the remote machine, detached from the ssh session that
# started it. task/kernel/
#
#   droplet-launch.sh <run dir> <cap seconds> <cpu list, or -> <job script> [job arguments]
#
# The job runs in its own session (setsid), so a dropped connection or a closed laptop does not stop it, and it is
# bounded ON THE MACHINE by `timeout`: at the cap it gets SIGTERM, and SIGKILL a minute later, whatever happened to the
# laptop. It runs at the lowest priority (nice 19, and the idle I/O class where ionice exists), and, given a cpu list,
# pinned to those cpus with taskset, so a host that has other work (a deploy build) is never starved by it.
#
# It writes <run dir>/job.pid (the session id, which is also its process group, for a stop), <run dir>/job.log (the
# job's output) and <run dir>/job.exit (the exit code, 124 when the cap stopped it), and prints vibe-launched-<pid>.

set -u

if [ "${1:-}" = --inner ]; then
  shift
  DIR=$1 CAP=$2 CPUS=$3
  shift 3
  wrap=(nice -n 19)
  command -v ionice >/dev/null && wrap+=(ionice -c 3)
  [ "$CPUS" != - ] && command -v taskset >/dev/null && wrap+=(taskset -c "$CPUS")
  timeout --signal=TERM --kill-after=60 "$CAP" "${wrap[@]}" bash "$@"
  echo $? >"$DIR/job.exit"
  exit 0
fi

DIR=$1
[ -d "$DIR" ] || { echo "no run directory $DIR"; exit 1; }
setsid bash "$0" --inner "$@" >"$DIR/job.log" 2>&1 </dev/null &
echo $! >"$DIR/job.pid"
echo "vibe-launched-$!"
