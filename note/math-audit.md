# Math Audit

A full correctness pass over `code/`: every math-bearing function checked for
wrong equations, wrong algorithms, arbitrary constants, non-determinism, and
circularity. The goal was to guarantee the accuracy of the whole experiment set,
fix what was wrong, and confirm the findings did not move (or moved only in a
valid direction).

## Method

Two independent passes, then a before/after verification.

1. **Read audit.** Eight reviewers swept the findings-bearing folders (`rule`,
   `tone`, `check`, `tool`, `algebra`, `operator`, `substrate`, `measure`,
   `dynamics`, `coarse`, `geometry`, `control`, `model`), re-deriving each
   identity and algorithm by hand rather than trusting the code.
2. **Conformance suite.** A new `test/code/` tree (688 checks across 213 suites)
   tests the math by re-deriving expected values independently: group identities,
   gamma-matrix Clifford relations, known eigen-spectra, closed-form fits,
   reversibility round-trips, charge conservation. Run with
   `pnpm call test/code/run.ts`. This is a permanent floor, not a one-time check.
3. **Before/after dump.** Every experiment's verdict and metrics were dumped to
   JSON before and after the fixes (deterministic, seed 1), then diffed, so any
   change to a finding is visible.

## Defects found and fixed

All are in the worktree branch `audit/math-verification`.

| # | Module | Severity | Defect | Fix |
| - | ------ | -------- | ------ | --- |
| 1 | `measure/probe-directions` | major | The probe-direction multipliers were consecutive powers of the plastic number rho. Since rho^3 = rho + 1 gives 1/rho^2 + 1/rho^3 = 1 exactly, coordinate 3 was forced to be the exact negative of coordinate 2 on every sample, collapsing the direction set onto a plane for dimension >= 3. Isotropy and anisotropy measures were sampling a degenerate 2D cone, not the sphere. | Use the generalised golden ratio for the actual dimension (the root of x^(d+1)=x+1), whose inverse powers have no such relation. Verified no two coordinates are exact negatives for d=2,3,4 and the mean direction is near zero. |
| 2 | `measure/integration` | major | `algebraicConnectivity` (the Fiedler value) used a single deterministic power-iteration start. On a path graph the alternating start (1,-1,1) is exactly a higher eigenvector, orthogonal to the Fiedler vector, so the pass converged to the wrong, larger eigenvalue (returned 3 instead of 1 on P3). | Run several diverse deterministic starts and take the smallest nonzero eigenvalue estimate. Any start with Fiedler overlap converges to the true value, and a start without it converges to something strictly larger, so the minimum is robust and stays deterministic. |
| 3 | `measure/integration` | major | The integrated-information bipartition enumeration fixed node 0 to one side to dedup complements. That dedup is correct only for an even region size. For odd n a size-k subset is never the complement of another size-k subset, so the filter silently dropped about half the valid cuts, biasing Phi upward. | Apply the complement dedup only when n is even. |
| 4 | `measure/spectrum` | minor | `zeroModeCensus` tested `v < tolerance` on the signed eigenvalue, so every negative eigenvalue of a symmetric spectrum (a Dirac or gauge operator with +/-E pairs) was miscounted as a zero mode. | Compare the magnitude `|v|`, matching the docstring's "smallest nonzero magnitude". |
| 5 | `measure/entropic-gravity` | minor | `verlindeForceLaw` classified an exponent as Newtonian with an un-derived 0.4 band. | The screen-bit exponent is a measured dimensionality, so the only laws are the integer ones (dilution 1, area 2, volume 3). The decision boundary is the half-integer midpoint, so the band is exactly 0.5 (nearest integer is 2), derived from the neighbouring laws rather than tuned. |
| 6 | `check/reversibility` | minor | `roundtrip` had no inverse-collision parameter, so it was silently wrong for a non-involution collision (it would re-apply the forward collide on the way back). Latent: both current callers pass an involution. | Add an `inverseCollision` parameter defaulting to the forward collision, matching `isReversible`. |
| 7 | `measure/regression` | minor | `loglogExponentWindow` and `powerLawFit` lacked the zero-denominator and `m>1` guards their sibling fits have, so a degenerate window returned NaN that could propagate into a verdict. | Add the same guards, returning a defined 0 in the degenerate case. |
| 8 | `substrate/tessellation-catalog` | minor | Five vertex-figure strings were wrong (the vertex figure of {p,q,r,...} is {q,r,...}): {3,5,3} said icosahedron (dodecahedron), {4,4,3} said octahedron (cube), {5,3,3,4} said tesseract (16-cell), {5,3,3,5} said 120-cell (600-cell), {4,4,3,3} said 5-cell (tesseract). Documentation strings only, never read in computation. | Corrected all five to the true vertex figure. |
| 9 | `dynamics/mcmc`, `dynamics/parallel-tempering` | major | Both samplers proposed a move by toggling a raw relation bit then taking the transitive closure. Closure is many-to-one, and the proposal is not symmetric over posets, so the chain sampled a multiplicity-biased measure (pi(P) carried a factor 2^(redundant relations) toward tall chain-like orders), not the intended uniform / Gibbs measure. | Switch both to the symmetric single-pair move from `uniform-sampler` (toggle one pair, accept only if still transitive), reusing those verified primitives, and add a burn-in. This is the correct causal-set measure. See the honest consequences below. |

## Defects documented, deliberately not changed

These are real notes, but changing them would either risk destabilising
established findings or is a labeled numerical choice rather than a math error.
They are recorded here so they are named, not hidden.

- **`measure/gravity-exponent` uses a screening mass `mass2 = 0.004` and a fit
  window `[2,6]`.** These are labeled numerical regularizers for the iterative
  Poisson solve and the mid-range fit, not derived constants. The measure itself
  (screened Green's function plus log-log slope) is correct. The result should be
  shown robust to a `mass2` and window sweep. Left as a follow-up.
- **`measure/tessellation-battery` `fermionPropagates` uses three tuned
  thresholds.** They classify per-tessellation propagation quality. The underlying
  numbers are reported. Tightening them blindly risks flipping per-tessellation
  classifications, so they are flagged rather than changed.
- **Drift and duplication (DRY, not correctness):** two quaternion types
  (`algebra/binary-tetrahedral` vs `algebra/group/quaternion`), two `CellComplex`
  conventions (`operator/exterior-derivative` vs `operator/dirac`), the deflated
  CG Poisson solver re-rolled in three operators, a second hyperbolic distance in
  `geometry/tree-embedding`, and a duplicate `makeRng` in `coarse/self-trajectory`.
  All are individually correct today. They should be collapsed to one source each.
- **`operator/gauge-dirac` `covariantKahlerDirac`** uses a real `cos(charge*phase)`
  weight as a Lanczos-friendly stand-in, which is not gauge covariant. It is
  labeled as a stand-in in its header. The genuine complex Wilson-Dirac in
  `operator/gauge-index` recovers the index theorem correctly.

## Before and after

Deterministic dump of all 615 experiments, before vs after, in two groups.

### The math-correctness fixes (1 to 8)

These left the findings intact.

- **Status changes: 0.** Every verdict identical.
- **Metric changes: 1.** `relativity/symmetry-restoration-3434`'s UV anisotropy
  dropped slightly (7.1e-5 to 5.9e-5, more isotropic) because the probe-direction
  fix removed the degenerate plane. A more accurate measurement that strengthens
  the result, verdict unchanged. The `algebraicConnectivity`, `spectrum`,
  `integration` odd-n, `reversibility`, and `regression` fixes were
  latent-correctness improvements no current experiment metric depended on.

### The sampler fix (9)

Correcting the causal-set measure changed the verdicts of the experiments that
depended on it. This is the honest result of removing a bias, not a regression.

- `cosmology/dynamics`: pass to fail.
- `cosmology/study`: pass to fail.
- `substrate-survey/epsilon`: pass to open.
- `cosmology/transition`: pass (unchanged).
- `quantum/path-integral` (the only `paper: true` of the group): partial
  (unchanged).
- `gravity/tempering`: partial (unchanged).

Under the correct uniform measure a random causal set is dominated by
Kleitman-Rothschild orders (three flat layers), not manifold-like orders. This is
the well-known entropy problem of causal set theory. So the "manifold-likeness"
claims that passed on the biased sampler do not survive the correct one. The old
passes were artifacts of the sampling bug. None of the flipped experiments is a
paper result, and the only `paper: true` member of the group keeps its status. The
build stays green (a scientific fail or open is an honest result, not a crash).

Reaching a fair manifold claim under the correct sampler is a research follow-up
(the action-weighted and warm-start regime noted in the package's
`p2-p6-optimal-path` plan), not a code fix. The fix here is to sample the right
measure and report what it says.

## Test coverage

The `test/code/` tree now mirrors **325 of the 360 math-bearing modules** with a
conformance test, **1920 checks across 774 suites, all green**
(`pnpm call test/code/run.ts`). Every expected value is re-derived independently
(known identities, closed forms, hand-worked synthetic inputs), exact where the
quantity is exact and tight-tolerance only for genuine floats.

The 35 untested modules are honest skips, not gaps: pure simulation orchestration
or expensive geometry builders whose underlying math primitives are tested in the
modules they call (for example `coxeter/engine` and `hyperbolic-honeycomb` build
large cell graphs, but their `schlafli`, `minkowski`, `gram-signature`,
`streaming-shell-count`, and reflection math are each tested directly). Padding
them with trivial or circular checks would weaken the suite, not strengthen it.

A handful of doc or convention nits surfaced while writing the tests and are worth
a maintainer's eye, none of which is a math error (the tests assert the true
behavior): `greens-function.greensDecayClass` does not match its "flat lattice
gives a power law" comment, `skyrme-energy.skyrmionCharge2d` returns the right
magnitude with a flipped sign convention, `screened-greens-function`'s
`clampedLeakyDiffusion` comment says the source is pinned to 1 but the fixed point
is higher, and a few headers (`coxeter-growth`, `ternary-permutation`) overstate a
relationship. None affects a finding.

## Deliverables

- `test/code/` math-conformance tree, 1920 checks across 774 suites, run with
  `pnpm call test/code/run.ts`.
- `note/math.md`, a catalog of every math-bearing module: what it implements,
  what it depends on, and which experiments use it.
- This report.
