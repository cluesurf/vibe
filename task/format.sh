#!/usr/bin/env bash
#
# Format the vibe repo without running out of memory.
#
# `eslint --fix` here is TYPE-CHECKED (typescript-eslint `projectService`):
# the type-checker's program grows with every file it loads, so a single
# whole-repo run can exhaust the heap and abort (exit 134). So eslint runs
# in BOUNDED FILE BATCHES discovered with `find` + `xargs`, each batch its
# own process (bounded memory) that writes its fixes as it finishes, giving
# visible, incremental progress. New files/dirs are picked up automatically
# (nothing is hand-listed).
#
# ORDER MATTERS: eslint --fix FIRST, then prettier LAST. eslint applies
# structural fixes (stripping braces off one-line `if`/`for` bodies via
# `curly: multi-or-nest`, adding blank-line padding, ...); some of those
# leave artifacts prettier then cleans up (a removed `}` leaves a blank
# line; a doubled blank collapses to one). Prettier is the final authority
# on whitespace, so it must run after eslint, never before.
#
# Excluded: node_modules, the generated `host/` tree, `tmp/` (scratch files
# not in any tsconfig — they fatally error the project service), the
# self-contained `test/site/` app (its own toolchain), and `*.d.ts`.
#
# Tunables (env):
#   FORMAT_CHUNK   files per eslint process     (default 300)
#   FORMAT_HEAP    node heap per eslint process (default 8 GB)
#
# Usage:  pnpm format            (wired to this script)
#         FORMAT_CHUNK=200 pnpm format

set -uo pipefail

ROOT="$(cd "$(dirname "$0")/.." && pwd)"
cd "$ROOT"

CHUNK="${FORMAT_CHUNK:-300}"
HEAP="${FORMAT_HEAP:---max-old-space-size=8000}"

# File discovery. A SINGLE `.` root so the `./test/site` prune actually fires
# (passing `code test .` as roots re-walked test/ and slipped test/site past the
# prune). node_modules / host / tmp / test/site are pruned as directories.
#
# eslint is TYPE-CHECKED against the main tsconfig, which is `.ts`-only (no jsx).
# The one `.tsx` under code/ (code/render/react, consumed by the test/site React
# app) is not in that program, so eslint must NOT be handed `.tsx` or it fails
# with a project-service parse error. Prettier has no such constraint, so it
# formats `.ts` AND `.tsx`.
find_ts() {
  find . \
    -type d \( -name node_modules -o -name host -o -name tmp -o -path './test/site' \) -prune -o \
    -type f "$@" ! -name '*.d.ts' -print 2>/dev/null | sort -u
}
LINT_FILES="$(find_ts -name '*.ts')"                        # eslint: .ts only
FMT_FILES="$(find_ts \( -name '*.ts' -o -name '*.tsx' \))"  # prettier: .ts + .tsx
COUNT="$(printf '%s\n' "$LINT_FILES" | grep -c . || true)"

echo "== eslint --fix: $COUNT files, batches of $CHUNK =="
printf '%s\n' "$LINT_FILES" \
  | xargs -n "$CHUNK" env NODE_OPTIONS="$HEAP" \
      npx eslint --fix --no-error-on-unmatched-pattern --no-warn-ignored
ES=$?
echo "== eslint pass done (exit $ES; nonzero = lint warnings/errors remain, fixes still applied) =="

echo "== prettier (final formatting pass) =="
printf '%s\n' "$FMT_FILES" | xargs -n 500 npx prettier --write --log-level warn

echo "== format done =="
