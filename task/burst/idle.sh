#!/bin/sh
# THE IDLE GUARD: installed on a burst droplet by task/burst/index.ts at `burst up`, and run by cron every two minutes.
# It powers the machine off once no job (and no setup) has run for 20 minutes.
#
# A powered-off droplet STILL BILLS. This guard only stops the work and the CPU, so a forgotten machine is obvious in
# `burst status` (status "off") and cannot keep a runaway job going. Only a destroy stops the bill, and that is the
# laptop's `burst run` (auto-down), `burst down`, or the detached watchdog at the hard cap.

BASE=/root/vibe-runs/burst
STAMP="$BASE/active"
live=0
for p in "$BASE"/jobs/*/job.pid "$BASE"/setup/job.pid; do
  [ -f "$p" ] || continue
  d=$(dirname "$p")
  [ -f "$d/job.exit" ] && continue
  kill -0 "$(cat "$p")" 2>/dev/null && live=1
done
if [ "$live" = 1 ]; then
  touch "$STAMP"
  exit 0
fi
[ -f "$STAMP" ] || touch "$STAMP"
if [ -n "$(find "$STAMP" -mmin +20)" ]; then
  echo "$(date -u +%FT%TZ) no job for 20 minutes: powering off" >>"$BASE/idle.log"
  shutdown -h now
fi
