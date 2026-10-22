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

## Records kept

Experiments cited pre-registrations, verdict logs and saved parts that lived only in the old moving-matter worktree's
gitignored `tmp/`, or in other worktrees. The evidence among them is now tracked under
`test/record/<experiment-code>/`, and every citation of a kept file points there. `.gitignore` re-includes `test/record/**/*.log`.

- Frozen gates: `E-SPN-0202/scross-gates-frozen-20261009T213901Z.md`, `E-FRC-0306/leak-fresh-frozen-20261009T032809Z.json`.
- Verdict and run logs for E-FND-0175 to 0177, E-FRC-0289 to 0294, 0315, 0316, E-MTR-0028 to 0032, E-QTM-0181 and 0182,
  E-RLT-0114 to 0118, E-SLF-0179 to 0181, and E-SPN-0191 to 0214.
- Saved parts that verdicts are rebuilt from: `track-a*.json`, `spn-core-*.json`, `spn-mass-*.json`,
  `spn-light-m0284-a12.json`, `spn-clock-a7.json`, `spn-cleanclock-*.json`, `mtr-boost-K*.json`, `mtr-light-K*.json`,
  `mtr-fade-*.json`, `qtm-part-*.json`, `rlt115-*.json`, `rlt116.json`, `rlt117.json`, `cflux-cf0-slab-8.json`, and
  E-FRC-0297's two small boxes `color-ens-hyper3d/` and `color-ens-hyper8/`.
- Four experiments read their recorded inputs at run time (sector-eigensolver, light-pair-dispersion, light-pair-fading,
  register-pair-formula-audit). Their path constants now resolve from the file to `test/record/`, not to the old
  worktree.

`test/record/index.csv` lists every cited `tmp/` path with its status (kept, too_large, scratch, other_worktree,
missing) and where it is cited.

## Follow-ups

- The large records are tracked with Git LFS (`.gitattributes`): `E-RLT-0118/rlt118.json` (5.8 MB, read at run time)
  and E-FRC-0297's `color-ens-bulk20/` (31 MB), `color-ens-bulk8/` (55 MB), `color-ens-slab8x8/` (55 MB) and
  `color-ens-slab8x12/` (83 MB). `.archiveignore` keeps them out of the Internet Archive zip, and the npm `files` list
  already leaves `test/` out.
- 342 evidence files that lived only in other worktrees (339 in `experiment/open-pieces`) are now in `test/record/`,
  with 358 citations repointed in 104 files. `open-pieces/tmp/rcw-eq-js.bin` (592 MB) is too large and stays out.
- 22 rerun scripts are kept in `test/record/<code>/run/`. `spn-0213-combine` and `mtr-light-combine` reproduce their
  recorded verdict logs.
- 790 cited evidence paths exist nowhere on disk. They are listed in `test/record/index.csv`.
- Some records sit in the folder of the first experiment that cites them, not the one that made them (for example
  `E-SPN-0200/rch-exp-run1.log` belongs to E-SPN-0173).
