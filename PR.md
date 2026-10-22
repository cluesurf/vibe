# Move singlet-crossing's 3 x 3 complex helpers out of tmp/ into code/

## Summary

`tsc --noEmit -p tsconfig.check.json` failed with one TS2307 on a clean clone:
`test/experiment/spin/singlet-crossing.ts` (E-SPN-0202) imported `det3f` and `mul3f` from
`../../../tmp/leada-common`, a scratch file in the gitignored `tmp/`. It existed only in the old
`experiment/moving-matter` worktree, so the merged repo could neither typecheck nor build.

## What changed and why

- **New `code/algebra/linear/complex-matrix3.ts`**: `det3f` (determinant by first-row cofactors),
  `mul3f` (product into an 18-float buffer) and `entry3`, for 3 x 3 complex matrices packed as 18
  interleaved floats, row major, read in place by offset. This is the layout of holonomy-caging's
  `GridLifts.floats` and color-slab's `ColorLinks` (k 3). It belongs in `algebra/linear/` per
  `note/architecture.md` (dense linear algebra goes there even when one experiment uses it). The
  arithmetic is copied operation for operation from the scratch file, so floating-point results are
  unchanged. The helpers were renamed to the repo's spelled-out style (`at` became `entry3`, and the
  private `cm`/`cs`/`ca` became `times`/`minus`/`plus`). `cabs` was dropped because nothing used it.
  No existing exported helper in `code/` had this layout: color-slab's and color-gates' `mul3` are
  private and have different signatures.
- **`test/experiment/spin/singlet-crossing.ts`**: the import now points at
  `@/code/algebra/linear/complex-matrix3`. Nothing else in the file changed.
- **Other imports of `tmp/`**: a search of `test/`, `code/` and the whole worktree for
  `from '...tmp...'` / `import('...tmp...')` found no other one. Every other `tmp/` mention is a
  comment citing a disclosed probe, not an import.

## How it was tested

All commands were run from this worktree. `node_modules` is symlinked to the main tree's.

1. Typecheck:
   `node node_modules/typescript/bin/tsc --noEmit -p tsconfig.check.json` exited 0 with no errors.
   Before the fix it failed with TS2307.
2. Build (the `make` script's two steps; `host/` did not exist, so its `rm -rf host` had nothing to remove):
   `node node_modules/typescript/bin/tsc -p tsconfig.build.json` exited 0.
   `node node_modules/tsc-alias/dist/bin/index.js -p tsconfig.build.json` exited 0.
   `host/code/algebra/linear/complex-matrix3.js` and `host/code/index.js` were emitted.
3. Rerun of E-SPN-0202 through `test/rerun.ts` (`sh tmp/rerun-scross.sh`, which sets
   `VIBE_KERNEL_NATIVE` to the same native kernel build the recorded run used), 290 s:
   status `fail` (`FAILS`), the same as recorded. `tmp/compare-scross.mjs` compared the output with
   the recorded verdict of 2026-10-09 (`scross-verdict-20261009T215356Z.log` in the old worktree's
   `tmp/`):
   - the claim string matches exactly
   - **31 of 31 shared metrics are bit-identical** (`Object.is`), among them `E2first 0.9452855238263882`,
     `s_sym 0.001006520960130835`, `share_sym 0.7115641144797548` and `levelE_sym -2.8785250387291996`
   - 0 metrics differ
   - the recorded run's 9 `*_sym000` metrics are absent from the rerun because they came from an
     optional third start that the scratch runner added. The experiment's `run()` reads only `sym`
     and `anti`.

## Status

- Typecheck: pass, 0 errors.
- Build: pass.
- E-SPN-0202: verdict and every number it computes are unchanged.

## Follow-ups

- The singlet-crossing header still cites its frozen gate file
  `tmp/scross-gates-frozen-20261009T213901Z.md`, which is not in git. It is a citation in a comment,
  not an import, so it breaks nothing. Copying that file into a tracked note is a separate decision.
- The recorded verdict log also lives only in the old worktree's `tmp/`.
