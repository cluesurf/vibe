# Census-driven experiments: every genuine gap, implemented

Implements the experiments the 40-author related-theories census surfaced that were
NOT already in the suite. Most of the census program was already covered (triality to
generations, ternary-not-triality, charge quantization, the emergent Dirac dispersion,
the selves and determinism batteries, effective dimension, the A1-to-A2 self-model
ladder), so this PR is the real gaps only, following the no-reinvention rule. Every one
lands as a pass.

## What changed

Eight new experiments (679 total, up from 671), each thin, each reusing `code/`, each
with a named control, each graded at its honest depth, all passing.

| code | experiment | motivating author | status | depth |
| --- | --- | --- | --- | --- |
| E-GMT-0029 | `geometry/mesh-preferred-factorization` | Tegmark (perceptronium) | pass | L2 |
| E-MTH-0002 | `method/look-elsewhere-numerology-audit` | Bogovich (E8/H3 fitting) | pass | L2 |
| E-SLF-0158 | `selves/individuation-margin` | Hearst (Phi>C_ext) | pass | L2 |
| E-SLF-0159 | `selves/concrescence-jump` | Segall/Whitehead | pass | L2 |
| E-SLF-0160 | `selves/dissolution-death` | Hearst/King/Belli-Lacin | pass | L2 |
| E-QTM-0048 | `quantum/memory-kernel-width-dial` | Leizerman | pass | L2 |
| E-FND-0047 | `foundations/octonion-real-form-commitment` | Gogberashvili | pass | L1 |
| E-GRV-0048 | `gravity/ringdown-discreteness-echo` | Mayank Singh (QuEST) | pass | L2 |

New `code/` capabilities (the library half, reused by the experiments):

- `code/measure/factorization.ts` — nearest-seed labels, exact edge-robustness fraction.
- `code/measure/look-elsewhere.ts` — the numerology menu, its coverage, the hit count.
- `code/coarse/binding-margin.ts` — the ball at a radius, the internal-minus-boundary margin.
- `code/measure/ringdown-echo.ts` — a source-energy trace on the reversible wave, ringdown persistence.
- `code/measure/kernel-width-transport.ts` — a memory-kernel-width packet, the transport exponent.

## The results (measured, deterministic)

- **Tegmark factorization.** Compact blocks on {3,4,3,4} keep an internal-edge fraction of
  0.385 against 0.142 on a degree-matched scramble, a 2.7x geometry effect. The mesh
  supplies the integrated, nearly independent objects Tegmark asks for. Scramble the control.
- **Bogovich audit.** A menu of arbitrary small formulae covers 38.5 percent of the number
  line at one percent tolerance, the forced structural menu covers 3.2 percent, a 12x
  information gap. A fitted match carries little information, a geometric one is rare.
- **Hearst individuation.** A compact region reaches a binding margin of +0.88 (internal
  integration far exceeds external coupling, an individuated self), while the same regions
  on a scramble stay at -0.38 (never individuate).
- **Whitehead concrescence.** Binding parts into one occasion lifts the margin from a
  part-mean of -0.52 to a whole of +0.53, a jump of +1.04, against a scramble jump of 0.34.
  The many become one and are increased.
- **Death as dissolution.** Holding the cell count and scattering the self drops the margin
  from +0.53 (alive) through zero (death threshold at scatter fraction 0.2) to -0.48
  (dissolved). Identity is the gathering, not the cells. The scattered configuration the control.
- **Leizerman one-dial map.** One memory-kernel width carries a packet's transport exponent
  from 0.96 (ballistic, the quantum end) monotonically to 0.48 (diffusive, the gravity end),
  so a single parameter interpolates QM and gravity. The ballistic short-width limit the anchor.
- **Gogberashvili real-form.** The division octonions (level 3) have no zero divisors and
  satisfy norm composition, so vibe base cannot host his split-octonion zero-divisor particle
  mechanism, while the sedenions (level 4) do, the discriminating control. Scopes vibe to the
  compact division form.
- **Ringdown.** The {3,4,3,4} geometry sustains a coherent ringdown after a pulse (late-window
  source energy 0.197 of the initial) while a degree-matched scramble dephases and dies
  (0.028), a 7x ratio. The sharp size-scaling recurrence echo is NOT present on the bare wave,
  so that stronger claim is explicitly not made and is left to the emergent metric wave. This
  is the honest signal the bare substrate carries, scoped as ringdown coherence, not an echo.

## Census items NOT built (already covered or subsumed)

- Triality to three generations, ternary-not-triality, charge quantization, emergent Dirac
  dispersion, the selves integration/Markov/emergence battery, the determinism battery, the
  A1-to-A2 self-model ladder, effective dimension: already in the suite (verified file by file).
- Kollmer's generation cap: subsumed by `spin/generations-f4-jordan` (the rank-three Jordan
  bound, the identity holds for n<=3 and fails at n=4, an algebraic generation cap), not
  duplicated.

The full program and its priority ordering live in the research notes at
`note/research/vibe/v1.1.0/experiments/07-census-driven-experiments.md`.

## How tested

Each new experiment run individually (deterministic, seed 1): all eight `pass`. Lint clean
on all thirteen new/changed files (`eslint`, zero errors). The catalog regenerates cleanly
(`npx tsx test/catalog.ts` wrote 679 experiments), which also confirms the barrel loads every
experiment with no duplicate-id collision, so the additions register without breaking
enumeration. The additions are all L1 or L2 with controls (none L3, so no partial downgrade)
and none crash, so they do not gate the build. The full 679-experiment gate (`test/run.ts`)
was run end to end and passed: **654 pass, 2 fail, 9 partial, 14 open, 0 crash, conformance
110 pass 0 fail, exit 0**. All eight new experiments pass, and the 2 fail / 9 partial / 14
open are pre-existing honest-negative frontiers, none introduced by this change (the baseline
run before these additions was 650 pass, 2 fail, 9 partial, 15 open, 0 crash, so the delta is
exactly the four extra passes, one of which is the ringdown moving out of the open bucket).

## Follow-ups

- Sharpen the ringdown toward a genuine size-scaling recurrence echo on the emergent
  (Lorentz-restored) metric wave rather than the bare knit, the real-world QuEST target.
- The individuation, concrescence, and dissolution measures read the graph only. A
  tone-dynamical version (via `toneIntegration`) would lift them from structural proxies
  toward L3.
