#!/bin/sh
# Progress of E-RLT-0120 on the work droplet, read through mesh/work: the load, the job's log tail, each part's log
# tail (one line per landed read) and the exit code once it has one.
#
#   sh test/record/E-RLT-0120/run/status.sh
WORK=/Users/lancepollard/base/crew/cluesurf/mesh/work
RUN=/root/vibe-runs/rlt120
"$WORK" "uptime; echo '== job.log'; tail -n 6 $RUN/job.log; for f in $RUN/pkg/test/record/E-RLT-0120/rlt120-*.log; do echo \"== \$f\"; tail -n 4 \"\$f\"; done; echo '== job.exit'; cat $RUN/job.exit 2>/dev/null || echo running"
