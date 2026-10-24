#!/bin/sh
# Bring E-RLT-0120's finished parts and logs back from the work droplet into test/record/E-RLT-0120/, through
# mesh/work. It refuses while the job has no job.exit, and never overwrites a file already in the record (a part
# fetched once is the record). The job's own log comes back as rlt120-droplet.log.
#
#   sh test/record/E-RLT-0120/run/fetch.sh
W=$(cd "$(dirname "$0")/../../../.." && pwd) || exit 2
WORK=/Users/lancepollard/base/crew/cluesurf/mesh/work
RUN=/root/vibe-runs/rlt120
D="$W/test/record/E-RLT-0120"
done_code=$("$WORK" "cat $RUN/job.exit 2>/dev/null || echo running")
[ "$done_code" != running ] || { echo "the droplet job is still running: sh $D/run/status.sh"; exit 3; }
echo "droplet job exit $done_code"
for f in rlt120-axes.json rlt120-axes.log rlt120-plane.json rlt120-plane.log rlt120-generic.json rlt120-generic.log; do
  if [ -e "$D/$f" ]; then
    echo "kept $f (already in the record)"
    continue
  fi
  "$WORK" "cat $RUN/pkg/test/record/E-RLT-0120/$f" >"$D/$f" || { echo "could not fetch $f"; exit 2; }
  echo "fetched $f ($(wc -c <"$D/$f") bytes)"
done
[ -e "$D/rlt120-droplet.log" ] || "$WORK" "cat $RUN/job.log" >"$D/rlt120-droplet.log"
