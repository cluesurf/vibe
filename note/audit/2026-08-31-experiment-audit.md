# Experiment audit, 2026-08-31

The standing adversarial audit the methodology asks for
(`experimental-methodology.md`, section 7), run over the whole registry.
What was read, what was found, what changed, and what is left.

## Scope

All 92 experiments graded L3 were read: the 40 with no substrate in
their import graph in full, the 52 substrate-based ones by their
verdict and control logic. The lattice-gas rule and collision table.
The six coined-walk implementations. The runner, the scaffold, the
catalog generator. Sweeps over all 817 registered experiments for
randomness, unconditional passes, barrel drift, typed constants, and
transitive substrate imports.

## Findings

| finding | count | where |
| --- | --- | --- |
| L3 experiments touching no substrate, rule, or coin algebra | 40 of 92 | textbook calculations and the hand-written coined walk |
| experiments labeled `['3434']` with nothing 3434-related in their code | 149 after refinement (166 by the first sweep) | every arena |
| literal constants reaching a verdict | 24 sites in 20 files | `fermi-exclusion`, `atoms-shell-filling`, `proton-lifetime`, `design-signature`, both `reversible-universality`, `ternary-not-triality`, and thirteen more |
| controls that were typed formulas | 2 | `area-law` (`l * ln 2`), `nuclei-binding-saturation` (`singleBinding + G (N - 1) / 2`) |
| registered experiments never imported by the barrel | 4 | E-CMP-0001, E-FND-0003, E-GRV-0028, E-SPN-0001 |
| `tsc` errors the `tsx` runner never saw | 11 in 5 files | strings in `metrics` and `control` |
| copies of the 1D coined Dirac walk | 6 | `quantum-walk`, `dirac-scattering`, `klein-barrier`, `bloch-oscillation`, `quasiperiodic-walk`, `mass-domain-wall` |
| copies of inline complex helpers in `code/` | 12 | same files and others |
| `Math.random` | 0 | two comment mentions only |

The central finding: **the committed rule has no amplitudes.** The
state is `Int8` ternary slots and the beat is a permutation. The coined
Dirac walk that thirteen quantum experiments call "the coin's own
single-particle sector" is a separate hand-written unitary model, and
`relativity/dirac-from-discrete`, cited as the derivation, simulates
that walk rather than the rule. A further measured fact: under the
committed pair table the all-zero state is a global period-three flash
(every slot nonzero at beats one and two, zero at beat three, the
create-flip-annihilate cycle), so a "lone tone" is a defect of at most
two slots on a flashing background, and two defects add exactly as
sets. Recorded as `foundations/rule-has-no-amplitudes` (E-FND-0080).

## Changes

- Every typed constant is out of every verdict, each site carrying an
  `AUDIT 2026-08-31` comment. Two typed controls replaced by computed
  ones (`area-law` from the infinite-temperature correlation matrix,
  `proton-lifetime` from the bare-SM run) and two removed
  (`nuclei-binding-saturation`, `atoms-shell-filling`).
- 43 substrate-free L3 experiments regraded to L1 or L2 with
  `substrates: 'any'` and an audit note in the file and the verdict.
  Prior art named for the walk results.
- 129 false `['3434']` labels rewritten to `'any'` by `pnpm check:labels
  --commit` after a hand sample of fourteen; 20 octonion-algebra files
  held for review.
- The four unimported experiments added to the barrel. All pass.
  E-SPN-0001 regraded to L1 (it evaluates a formula).
- The 11 `tsc` errors fixed. `pnpm test` now typechecks first.
- `code/dynamics/coined-dirac-walk.ts`: the walk defined once, with
  the measures the audit needed.
- `task/check-labels.ts` and `task/check-constants.ts`, permanent.
- `readme.md` opens with the goal. This note. `note/experiment/readme.md`
  count and L0 definition corrected.

## The scoreboard after

L3: 50 (43 paper-grade), down from 92. L2: 554. L1: 207. L0: 14. Every
remaining L3 builds a substrate and measures against a computed
control. The full post-fix run is recorded in the roadmap's `state.md`
(`note/research/vibe/roadmap/` in the monorepo).

## What is left

Tracked as checklist items in the monorepo roadmap
(`note/research/vibe/roadmap/project/experiment-audit.json`):
consolidating the six walk copies onto the shared stepper with
bit-identical proof (0007), the arena readmes (0009), the post-fix run
record (0010), size perturbation of the 50 L3s (0012), the
pseudo-random fills (0013), the holography controls (0014), and the
inline helpers in `test/` (0015).

## How to rerun the audit

```
pnpm check:constants          # typed constants reaching a verdict, must be 0
pnpm check:labels             # contradicted substrate labels, must be 0 (20 under review listed)
npx tsc --noEmit -p tsconfig.json
pnpm test                     # 0 crashes, honest fails reported
```
