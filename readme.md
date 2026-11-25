<br/>
<br/>
<br/>
<br/>
<br/>
<br/>
<br/>

<p align='center'>
  <a href="https://www.youtube.com/watch?v=IE2uHC0qX1o"><img src='https://github.com/cluesurf/vibe/blob/make/view/vibe-mesh-{7,3}.png?raw=true' height='256'/></a>
</p>

<h3 align='center'>Vibe Theory</h3>
<p align='center'>
  Valenced Information as Base Experience
</p>
<br/>
<br/>
<br/>

A deterministic, reversible ternary quantum cellular automaton on the
infinite 4D `{3,4,3,4}` hyperbolic honeycomb of regular 24-cells,
evolving exact cyclotomic amplitudes in `ℤ[ζ₉][1/6]` with zero floats
and zero PRNGs. Every positive result, effective-theory compatibility
check, and negative control stays in git under a strict three-tier
boundary separating bare QCA runs from background-field bridges and
continuum EFT benchmarks.

- **[Paper (Zenodo)](https://zenodo.org/records/24503628)**: _A
  Reversible Ternary Quantum Cellular Automaton on the 4D `{3,4,3,4}`
  Honeycomb_ (Nov 24, 2026)
- **[clue.surf/vibe](https://clue.surf/vibe)**: Project site and
  interactive notes

## 5-Second Quick Start

```sh
git clone https://github.com/cluesurf/vibe.git && cd vibe
npx tsx test/universe.ts
pnpm install
pnpm check:lean
```

## The Core Tier A Microscopic Model in One Exact File (`test/universe.ts`)

Every dock of `{3,4,3,4}` carries 24 directional slots along the roots
of $D_4$ (12 antipodal lines), each holding a signed ternary tone in
`{−1, 0, +1}` with a 9-state role index above the neutral (quiescent)
mesh state $|V_1\rangle$. One reversible beat advances exact
`ℤ[ζ₉][1/6]` amplitudes by the palindromic 8-layer operator (six
distinct unitary gates, with $C_{1/2}^2 = C$ implemented as
`applyHalfCoinD` and pairwise-commuting $M_{\mathrm{meet}}$,
$M_{\mathrm{pair}}(\zeta_{18})$, and $K$):

$$U = S \circ \Phi_{\mathrm{odd}} \circ C_{1/2} \circ M_{\mathrm{meet}} \circ M_{\mathrm{pair}}(\zeta_{18}) \circ K \circ C_{1/2} \circ \Phi_{\mathrm{odd}}$$

Here $\Phi_{\mathrm{odd}}$ is applied palindromically at layers 1 and 7
with the canonical $W(F_4) \times \mathbb{Z}_2^{\mathcal{C}}$ orbit
invariant $\chi_{\mathrm{odd}}$ (matching `code/rule/value-phase.ts`),
and $C_{1/2}$ symmetrically splits the commuting central collision block
so lone excitations see $C_{1/2}^2 = C$.
[`test/universe.ts`](test/universe.ts) runs this exact trivial-gauge
core Tier A QCA kernel (Tier B `Σ(648)` gauge links and multi-line $w_P$
dock stores live in [`code/rule/`](code/rule/)).

Running `npx tsx test/universe.ts` executes the entire zero-import,
Prettier- and ESLint-formatted core kernel in `< 0.2 s` with pure
`BigInt` arithmetic, verifying `D₄` rank-4 `SO(4)` isotropy
(`12 = 3 × 4`, defect `0`), exact `{3,4,3,4}` `O⁺(4,1; ℤ[√2])` Coxeter
shells `[1, 24, 456]` (`det(Tₛ) = −1` on `24/24` slots,
`parity = det(frame)` on `481/481` docks, `inconsistentSteps = 0`),
stationarity of the neutral mesh state $|V_1\rangle$, 1-vibe and
identical-tone/identical-role 2-vibe evolution strictly past `R = 3` to
`r = 4` (`−2B = 1154 > 198`), $M_{\mathrm{pair}}(\zeta_{18})$ with its
equal-tone and equal-role guard, canonical $\chi_{\mathrm{odd}}$ under
$W(F_4) \times \mathbb{Z}_2^{\mathcal{C}}$ (`|W(F₄)| = 1,152`,
`k = 1..3` orbits `[1, 8, 29]` with `0` chiral and `k* = 4`), full
proper `W(F₄)⁺` covariance (4 generators, closure order `576`, 7 states,
`covDiff = 0`), exact discrete `T`, `CP`, and `CPT` invariance (`0`)
alongside genuine `C` and `P` violation (`12/8`), exact unit norm, and
exact memoryless reversal (`0`).

[`test/universe.ts`](test/universe.ts) is structured top-down so the
entry point, palindromic 8-layer beat, and six physical operators appear
right at the top, followed by verification checks and the pure `ℤ[ζ₉]`
and `O⁺(4,1; ℤ[√2])` helpers:

```ts
// Execution order (right-to-left of U = S o Phi_odd o D o M_meet o M_pair(zeta_18) o K o D o Phi_odd):
const BEAT_LAYERS: readonly LayerOp[] = [
  applyOddChiralPhase, // 1. Scale-4 chiral 4-body phase Phi_odd (canonical W(F_4) x Z_2^C chi_odd)
  applyHalfCoinD, // 2. Half-coin C_{1/2} (Strang split)
  applyOppositeSignBounce, // 3. Opposite-sign bounce K (K^dag = K)
  applyPairLineMixer, // 4. W(F_4)-isotropic M_pair(zeta_18)
  applyRoleMeet, // 5. Like-sign role meeting M_meet
  applyHalfCoinD, // 6. Second half-coin C_{1/2} (C_{1/2}^2 = C on lone lines)
  applyOddChiralPhase, // 7. Palindromic Scale-4 chiral 4-body phase Phi_odd
  applyStream, // 8. Exact O^+(4,1; Z[sqrt(2)]) stream S
]

function applyBeat(state: State): State {
  return BEAT_LAYERS.reduce((cur, layer) => layer(cur, false), state)
}

function applyBeatInverse(state: State): State {
  return [...BEAT_LAYERS]
    .reverse()
    .reduce((cur, layer) => layer(cur, true), state)
}
```

Complete [`test/universe.ts`](test/universe.ts) code.

## Repository Layout and Negative-Result Discipline

[`test/registry.csv`](test/registry.csv),
[`test/mesh.csv`](test/mesh.csv), and
[`test/catalog.csv`](test/catalog.csv) are synchronized 1-to-1 at exact
**`1,790` canonical rows** (`0` duplicates, `0` orphans, `0` diffs).
That number is a **cumulative research archive**, not a scoreboard:
retired rules, failed self-keeping runs, negative controls, and early
flat-box explorations stay intact in git alongside the curated Tier
A/B/C runs above.

- [`test/universe.ts`](test/universe.ts): standalone, zero-import,
  pure-`BigInt` core Tier A microscopic QCA (Prettier- and
  ESLint-formatted top-down, `< 0.2 s`)
- [`code/proof/Vibe/`](code/proof/Vibe/): 9 zero-dependency Lean
  `4.35.0` proof modules plus root aggregator `Vibe.lean` (`141`
  headline / `160` public theorems, `pnpm check:lean`, fail-closed)
- [`test/breakthrough/`](test/breakthrough/): 12 standalone zero-import
  verification scripts for scattering, bare universality, 1-hop horizon
  crossing, finite-range domain wall, Cayley-4-form SMG, Nelson-Barr CP,
  and 24-cell Combes-Thomas mass-gap audits
- [`code/`](code/): Coxeter `{3,4,3,4}` engine, exact cyclotomic QCA
  rules, operators, and measurement library
- [`test/experiment/`](test/experiment/): deterministic registered
  experiments (`pnpm rerun E-GRV-0163`, `pnpm rerun E-FND-0190`)
- [`text/0018-emergent-physics-on-the-fixed-honeycomb/`](text/0018-emergent-physics-on-the-fixed-honeycomb/):
  LaTeX source and 64-page PDF for Paper `0018`
- [`note/experimental-methodology.md`](note/experimental-methodology.md)
  and [`note/architecture.md`](note/architecture.md): grading rubric,
  controls, and codebase map

## Running Experiments and Dev Workflow

```sh
# Core bare-rule kernel (< 0.2 s, zero install needed)
npx tsx test/universe.ts

# Typecheck and unit tests
pnpm test

# Run the full experiment suite
pnpm test:full

# Rerun any single registered experiment by code
pnpm rerun E-GRV-0163
pnpm rerun E-FND-0190

# Inspect recorded metrics for an experiment
pnpm result E-FND-0188

# Run any standalone breakthrough verification script (zero imports)
npx tsx test/breakthrough/combes-thomas-d4-mass-gap.ts
npx tsx test/breakthrough/horizon-one-hop.ts

# Verify the Lean 4.35.0 proof suite (9 modules, 141 headline theorems)
pnpm check:lean
pnpm check:lean -- --no-build   # structural + BigInt audit without Lean installed

# Catalog integrity, build, and formatting
pnpm check:labels
pnpm check:constants
pnpm check:coverage
pnpm make
pnpm lint
pnpm format
```

Typical dev workflow:

1. Edit rules, geometry, or measurement helpers in [`code/`](code/) or
   add/update a deterministic experiment in
   [`test/experiment/`](test/experiment/).
2. Run `pnpm rerun <CODE>` to verify gates and negative controls, and
   `pnpm test` to confirm `tsc --noEmit` and core tests stay clean.
3. For formal proofs in [`code/proof/Vibe/`](code/proof/Vibe/), run
   `pnpm check:lean` to verify `lake build` (`0` warnings) and
   `#print axioms`.
4. Rebuild the paper PDF with `make` inside
   [`text/0018-emergent-physics-on-the-fixed-honeycomb/`](text/0018-emergent-physics-on-the-fixed-honeycomb/)
   when manuscript figures or tables change.

## License

MIT. Open for science: use, modify, and build on it freely, with
attribution. See [LICENSE](LICENSE). The written results and figures are
shared under CC-BY-4.0 (attribution).

## ClueSurf

Made by [ClueSurf](https://clue.surf), meditating on the universe.
