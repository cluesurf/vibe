# Vibe

A deterministic, reversible ternary quantum cellular automaton on the infinite 4D `{3,4,3,4}` hyperbolic honeycomb of regular 24-cells, evolving exact cyclotomic amplitudes in `ℤ[ζ_9][1/6]` with zero floats and zero PRNGs. Every positive result, effective-theory compatibility check, and negative control stays in git under a strict three-tier boundary separating bare QCA runs from background-field bridges and continuum EFT benchmarks.

**[clue.surf/vibe](https://clue.surf/vibe)** · **[Paper (Zenodo)](https://zenodo.org/records/24503628)** (*A Reversible Ternary Quantum Cellular Automaton on the 4D `{3,4,3,4}` Honeycomb*, Nov 24, 2026) · **[`@cluesurf/vibe` on npm](https://www.npmjs.com/package/@cluesurf/vibe)**

## 5-Second Quick Start

```sh
git clone https://github.com/cluesurf/vibe.git && cd vibe
npx tsx test/universe.ts        # < 0.2 s, zero-import pure BigInt {3,4,3,4} QCA (no install needed)
pnpm install && pnpm check:lean # fail-closed: 141 Lean 4.35.0 headline theorems across 9 modules via lake build + #print axioms (pass --no-build if Lean 4.35.0 is not installed locally)
```

## The Core Tier A Microscopic Model in One Exact File (`test/universe.ts`)

Every dock of `{3,4,3,4}` carries 24 directional slots along the roots of $D_4$ (12 antipodal lines), each holding a signed ternary tone in `{-1, 0, +1}` with a 9-state role index above the neutral (quiescent) mesh state $|V_1\rangle$. One reversible beat advances exact `ℤ[ζ_9][1/6]` amplitudes by the palindromic 8-layer operator (six distinct unitary gates, with $C_{1/2}^2 = C$ implemented as `applyHalfCoinD` and pairwise-commuting $M_{\mathrm{meet}}$, $M_{\mathrm{pair}}(\zeta_{18})$, and $K$):

$$U = S \circ \Phi_{\mathrm{odd}} \circ C_{1/2} \circ M_{\mathrm{meet}} \circ M_{\mathrm{pair}}(\zeta_{18}) \circ K \circ C_{1/2} \circ \Phi_{\mathrm{odd}}$$

Here $\Phi_{\mathrm{odd}}$ is applied palindromically at layers 1 and 7 with the canonical $W(F_4) \times \mathbb{Z}_2^{\mathcal{C}}$ orbit invariant $\chi_{\mathrm{odd}}$ (matching `code/rule/value-phase.ts`), and $C_{1/2}$ symmetrically splits the commuting central collision block so lone excitations see $C_{1/2}^2 = C$. [`test/universe.ts`](test/universe.ts) runs this exact trivial-gauge core Tier A QCA kernel (Tier B `Sigma(648)` gauge links and multi-line `w_P` dock stores live in [`code/rule/`](code/rule/)).

Running `npx tsx test/universe.ts` executes the entire zero-import, Prettier- and ESLint-formatted core kernel in `< 0.2 s` with pure `BigInt` arithmetic, verifying `D_4` rank-4 `SO(4)` isotropy (`12 = 3 * 4`, defect `0`), exact `{3,4,3,4}` `O^+(4,1; Z[sqrt(2)])` Coxeter shells `[1, 24, 456]` (`det(T_s) = -1` on `24/24` slots, `parity = det(frame)` on `481/481` docks, `inconsistentSteps = 0`), stationarity of the neutral mesh state $|V_1\rangle$, 1-vibe and identical-tone/identical-role 2-vibe evolution strictly past `R = 3` to `r = 4` (`-2B = 1154 > 198`), `M_pair(ζ_18)` with its equal-tone and equal-role guard, canonical `chi_odd` under `W(F_4) x Z_2^C` (`|W(F_4)| = 1,152`, `k = 1..3` orbits `[1, 8, 29]` with `0` chiral and `k* = 4`), full proper `W(F_4)^+` covariance (4 generators, closure order `576`, 7 states, `covDiff = 0`), exact discrete `T`, `CP`, and `CPT` invariance (`0`) alongside genuine `C` and `P` violation (`12/8`), exact unit norm, and exact memoryless reversal (`0`).

[`test/universe.ts`](test/universe.ts) is structured top-down so the entry point, palindromic 8-layer beat, and six physical operators appear right at the top, followed by verification checks and the pure `Z[zeta_9]` and `O^+(4,1; Z[sqrt(2)])` helpers:

```ts
// Execution order (right-to-left of U = S o Phi_odd o D o M_meet o M_pair(zeta_18) o K o D o Phi_odd):
const BEAT_LAYERS: readonly LayerOp[] = [
  applyOddChiralPhase,     // 1. Scale-4 chiral 4-body phase Phi_odd (canonical W(F_4) x Z_2^C chi_odd)
  applyHalfCoinD,          // 2. Half-coin C_{1/2} (Strang split)
  applyOppositeSignBounce, // 3. Opposite-sign bounce K (K^dag = K)
  applyPairLineMixer,      // 4. W(F_4)-isotropic M_pair(zeta_18)
  applyRoleMeet,           // 5. Like-sign role meeting M_meet
  applyHalfCoinD,          // 6. Second half-coin C_{1/2} (C_{1/2}^2 = C on lone lines)
  applyOddChiralPhase,     // 7. Palindromic Scale-4 chiral 4-body phase Phi_odd
  applyStream,             // 8. Exact O^+(4,1; Z[sqrt(2)]) stream S
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

<details>
<summary>Complete formatted <code>test/universe.ts</code> (zero imports, pure BigInt, click to expand)</summary>

```ts
// Self-contained, zero-import, pure-BigInt core Tier A microscopic QCA kernel (trivial-gauge sector).
// Tier B Sigma(648) gauge links and multi-line w_P dock stores live in code/rule/.
// Space: infinite 4D {3,4,3,4} hyperbolic honeycomb in exact O^+(4,1; Z[sqrt(2)]).
// Amplitudes: exact cyclotomic ring Z[zeta_9][1/6] mod (z^6 + z^3 + 1 = 0). Zero floats, zero PRNG.
// Beat (palindromic 8-layer): U = S o Phi_odd o D o M_meet o M_pair(zeta_18) o K o D o Phi_odd,
// with canonical W(F_4) x Z_2^C orbit invariant chi_odd (matching code/rule/value-phase.ts)
// and exact adjoint U^dag.

// =================================================================================================
// 1. Entry point and palindromic 8-layer beat:
//    U = S o Phi_odd o D o M_meet o M_pair(zeta_18) o K o D o Phi_odd
// =================================================================================================

type Z9 = readonly [bigint, bigint, bigint, bigint, bigint, bigint]
type Root4 = readonly [bigint, bigint, bigint, bigint]
type Mat4Big = readonly (readonly [bigint, bigint, bigint, bigint])[]
type AntipodalLine = readonly [number, number]
type Q2 = readonly [bigint, bigint] // a + b * sqrt(2)
type Tone = -1 | 0 | 1 // full ternary alphabet; 0 is the neutral quiescent mesh |V_1>
// Sparse nonzero excitation against the infinite neutral mesh |V_1> (all unlisted slots have tone 0).
type Vibe = readonly [
  dock: number,
  slot: number,
  tone: Exclude<Tone, 0>,
  role: number,
]

type State = {
  readonly amp: Map<string, Z9>
  readonly den: bigint
}

type ActiveLine = readonly [
  idxA: number | undefined,
  idxB: number | undefined,
  slotA: number,
  slotB: number,
]

type LayerOp = (state: State, dag: boolean) => State

type TrajectorySummary = {
  readonly branches: number
  readonly maxCosh2: bigint
  readonly docks: number
}

type WF4Group = {
  readonly elements: readonly Uint8Array[]
  readonly det: readonly number[]
}

type CovarianceSummary = {
  readonly generatorCount: number
  readonly closureOrder: number
  readonly covDiff: number
}

type DiscreteSymmetrySummary = {
  readonly tDiff: number
  readonly cpDiff: number
  readonly cptDiff: number
  readonly cViolChiral: number
  readonly pViolChiral: number
  readonly cViolX1: number
  readonly pViolX1: number
}

function main(): void {
  const startNs = process.hrtime.bigint()
  const [sumFourth, sumMixed] = verifyD4Isotropy()
  const [shells, parityCheckedDocks] = verifyHoneycombShells()

  assertExact(
    eqQ2(detQ2(CENTRAL_INVERSION), [1n, 0n]),
    'CENTRAL_INVERSION det !== +1',
  )

  for (let slot = 0; slot < 24; slot++) {
    assertExact(
      eqQ2(detQ2(TRANSPORTS[slot]!), [-1n, 0n]),
      `TRANSPORTS[${slot}] det !== -1`,
    )
  }

  const neutralMesh = basisKet([])
  const evolvedNeutral = applyBeat(neutralMesh)

  assertExact(
    countStateDiffs(evolvedNeutral, neutralMesh) === 0 &&
      evolvedNeutral.den === 1n,
    'neutral quiescent mesh V1 not fixed',
  )

  const oneVibe = verifyReversibleTrajectory(
    '1-vibe',
    basisKet([[0, 0, 1, 0]]),
    4,
  )

  const identicalPairInit = basisKet([
    [0, 0, 1, 0],
    [0, OPPOSITE_SLOT[0]!, 1, 0],
  ])

  assertExact(
    applyBeat(identicalPairInit).amp.size === 12,
    'M_pair did not scatter identical pair isotropically across all 12 lines',
  )

  const pairRun = verifyReversibleTrajectory(
    '2-vibe-pair',
    identicalPairInit,
    4,
  )

  assertExact(
    oneVibe.maxCosh2 === 1154n && pairRun.maxCosh2 === 1154n,
    'did not reach exact r=4 beyond R=3',
  )

  const neutralPairInit = basisKet([
    [0, 0, 1, 0],
    [0, OPPOSITE_SLOT[0]!, -1, 0],
  ])
  const neutralRun = verifyReversibleTrajectory(
    '2-vibe-neutral',
    neutralPairInit,
    2,
  )

  const achiralLowK = verifyLowScaleAchiral()

  const chiralVibes: readonly Vibe[] = [
    [0, 0, 1, 0],
    [0, 1, -1, 0],
    [0, 4, 1, 0],
    [0, 10, 1, 0],
  ]
  const x1Vibes: readonly Vibe[] = [
    [0, 0, 1, 0],
    [0, 1, 1, 0],
    [0, 4, 1, 0],
    [0, 16, 1, 0],
  ]
  // E-FND-0184's all-+1 pair: [0,1,4,10] has chi_odd = 0 while flipping slot 0 -> OPPOSITE[0]=3
  // yields [1,3,4,10] (all +1) with chi_odd !== 0, directly witnessing [Phi_odd, D] !== 0 on all-+1!
  const e184AchiralVibes: readonly Vibe[] = [
    [0, 0, 1, 0],
    [0, 1, 1, 0],
    [0, 4, 1, 0],
    [0, 10, 1, 0],
  ]
  const e184ChiralVibes: readonly Vibe[] = [
    [0, 1, 1, 0],
    [0, OPPOSITE_SLOT[0]!, 1, 0],
    [0, 4, 1, 0],
    [0, 10, 1, 0],
  ]

  const chiMixed = chiralOrientationDock(chiralVibes, [0, 1, 2, 3])
  const chiX1 = chiralOrientationDock(x1Vibes, [0, 1, 2, 3])
  const chiE184Zero = chiralOrientationDock(
    e184AchiralVibes,
    [0, 1, 2, 3],
  )
  const chiE184Active = chiralOrientationDock(
    e184ChiralVibes,
    [0, 1, 2, 3],
  )

  assertExact(chiMixed !== 0, 'Phi_odd chi_odd vanished on chiralVibes')
  assertExact(chiX1 !== 0, 'Phi_odd chi_odd vanished on all-+1 X1')
  assertExact(
    chiE184Zero === 0 && chiE184Active !== 0,
    `E-FND-0184 all-+1 pair expected (0, nonzero), got (${chiE184Zero}, ${chiE184Active})`,
  )

  const chiralRun = verifyReversibleTrajectory(
    '4-vibe-chiral',
    basisKet(chiralVibes),
    1,
  )
  const x1Run = verifyReversibleTrajectory(
    '4-vibe-X1',
    basisKet(x1Vibes),
    1,
  )

  const representativeStates: readonly State[] = [
    identicalPairInit,
    basisKet([
      [0, 4, 1, 0],
      [0, OPPOSITE_SLOT[4]!, 1, 0],
    ]),
    basisKet([
      [0, 0, 1, 0],
      [0, OPPOSITE_SLOT[0]!, 1, 1],
    ]),
    neutralPairInit,
    basisKet(chiralVibes),
    basisKet(x1Vibes),
    basisKet(e184ChiralVibes),
  ]
  const cov = verifyGlobalWF4PlusCovariance(representativeStates)
  const sym = verifyDiscreteSymmetries(
    representativeStates,
    basisKet(chiralVibes),
    basisKet(x1Vibes),
  )
  const elapsedMs = (process.hrtime.bigint() - startNs) / 1_000_000n

  console.log(
    [
      'Core Tier A Microscopic QCA (zero-import, pure BigInt, Z[zeta_9][1/6] on {3,4,3,4})',
      `  D_4 rank-4 SO(4) isotropy : sum r0^4=${sumFourth} = 3*sum r0^2 r1^2=3*${sumMixed} (defect=0n)`,
      `  {3,4,3,4} O^+(4,1;Z[s2])  : shells=[${shells.join(', ')}], det(T_s)=-1 (24/24), parity=det(frame) (${parityCheckedDocks}/${parityCheckedDocks}), inconsistentSteps=${inconsistentSteps}`,
      `  V1 neutral quiescent mesh : U|V1> = |V1> exact (diff=0, normErr=0n)`,
      `  1-vibe (T=4 fwd + 4 back) : ${oneVibe.branches} branches, ${oneVibe.docks} docks, max -2B=${oneVibe.maxCosh2} (r=4 > R=3 max 198), normErr=0n, revDiff=0`,
      `  2-vibe pair (T=4 + back)  : ${pairRun.branches} branches, ${pairRun.docks} docks, M_pair 12-line scatter, max -2B=${pairRun.maxCosh2} (r=4 > R=3), normErr=0n, revDiff=0`,
      `  2-vibe neutral (T=2+back) : ${neutralRun.branches} branches, ${neutralRun.docks} docks, K-bounce exact (M_pair skipped), normErr=0n, revDiff=0`,
      `  chi_odd W(F_4)xZ_2^C      : |W(F_4)|=${WF4_GROUP.elements.length}, k=1..3 orbits=[${achiralLowK.join(',')}] (0 chiral, k*=4), chi(mixed)=${chiMixed}, chi(X1)=${chiX1}, chi(0184: [0,1,4,10]/[1,3,4,10])=${chiE184Zero}/${chiE184Active}`,
      `  4-vibe chiral (T=1+back)  : mixed=${chiralRun.branches} branches, X1=${x1Run.branches} branches (palindromic Phi_odd active), normErr=0n, revDiff=0`,
      `  W(F_4)^+ covariance       : ${cov.generatorCount} proper generators (|G|=${cov.closureOrder}), ${representativeStates.length} states, covDiff=${cov.covDiff}`,
      `  Discrete T, CP, CPT, C, P : tDiff=${sym.tDiff}, cpDiff=${sym.cpDiff}, cptDiff=${sym.cptDiff}, C-viol(mixed/X1)=${sym.cViolChiral}/${sym.cViolX1}, P-viol(mixed/X1)=${sym.pViolChiral}/${sym.pViolX1}`,
      `  elapsed                   : ${elapsedMs} ms  ALL CHECKS PASSED`,
    ].join('\n'),
  )
}

function applyBeat(state: State): State {
  return BEAT_LAYERS.reduce((cur, layer) => layer(cur, false), state)
}

function applyBeatInverse(state: State): State {
  return [...BEAT_LAYERS]
    .reverse()
    .reduce((cur, layer) => layer(cur, true), state)
}

// =================================================================================================
// 2. Six distinct unitary operators forming the palindromic eight-layer reversible beat:
//    U = S o Phi_odd o D o M_meet o M_pair(zeta_18) o K o D o Phi_odd
//    Note: M_meet, M_pair(zeta_18), and K mutually commute pairwise on the full Fock space,
//    so L = Phi_odd o D o (M_meet o M_pair o K) o D o Phi_odd satisfies K_conj R L R K_conj = L^dag.
// =================================================================================================

// Half-coin D (Strang-splits the middle block symmetrically; reduces to D^2 = C on lone lines).
function applyHalfCoinD(state: State, dag: boolean): State {
  const detPhase = adjointZ9(Z9_ZETA6, dag)
  const diagCoeff = adjointZ9(Z9_COIN_DIAG, dag)
  const offCoeff = adjointZ9(Z9_COIN_OFF, dag)

  return applyBranchingLayer<readonly [number, number]>(
    state,
    2n,
    (vibes, amp) => {
      const loneSplits: (readonly [number, number])[] = []

      let phased = amp

      for (const [idxA, idxB, slotA, slotB] of collectActiveLines(
        vibes,
      )) {
        if (idxA !== undefined && idxB !== undefined) {
          phased = mulZ9(phased, detPhase)
        } else if (idxA !== undefined) {
          loneSplits.push([idxA, slotB])
        } else {
          loneSplits.push([idxB!, slotA])
        }
      }

      return [loneSplits, phased]
    },
    (cfg, amp, [idx, oppSlot]) => {
      const [dock, , tone, role] = cfg[idx]!
      const flipped = cfg.slice()

      flipped[idx] = [dock, oppSlot, tone, role]

      return [
        [cfg, mulZ9(amp, diagCoeff)],
        [flipped, mulZ9(amp, offCoeff)],
      ]
    },
  )
}

// Same-sign role meeting M_meet on doubly-occupied antipodal lines (commutes with M_pair and K).
function applyRoleMeet(state: State, dag: boolean): State {
  const equalRolePhase = adjointZ9(Z9_OMEGA, dag)
  const keepCoeff = adjointZ9(Z9_ZETA6, dag)
  const swapCoeff = adjointZ9(Z9_MEET_SWAP, dag)

  return applyBranchingLayer<readonly [number, number]>(
    state,
    2n,
    (vibes, amp) => {
      const swaps: (readonly [number, number])[] = []

      let phased = amp

      for (const [idxA, idxB] of collectActiveLines(vibes)) {
        if (idxA === undefined || idxB === undefined) {
          continue
        }

        if (vibes[idxA]![2] !== vibes[idxB]![2]) {
          continue
        }

        if (vibes[idxA]![3] === vibes[idxB]![3]) {
          phased = mulZ9(phased, equalRolePhase)
        } else {
          swaps.push([idxA, idxB])
        }
      }

      return [swaps, phased]
    },
    (cfg, amp, [idxA, idxB]) => {
      const [dockA, slotA, toneA, roleA] = cfg[idxA]!
      const [dockB, slotB, toneB, roleB] = cfg[idxB]!
      const swapped = cfg.slice()

      swapped[idxA] = [dockA, slotA, toneA, roleB]
      swapped[idxB] = [dockB, slotB, toneB, roleA]

      return [
        [cfg, mulZ9(amp, keepCoeff)],
        [swapped, mulZ9(amp, swapCoeff)],
      ]
    },
  )
}

// W(F_4)-isotropic pair-line mixer M_pair(zeta_18) on identical-tone, identical-role pairs
// (commutes with M_meet and K).
function applyPairLineMixer(state: State, dag: boolean): State {
  const hopCoeff = subZ9(adjointZ9(Z9_ZETA18, dag), Z9_ONE)
  const keepCoeff = addZ9([12n, 0n, 0n, 0n, 0n, 0n], hopCoeff)

  return applyBranchingLayer<readonly [number, number, number]>(
    state,
    12n,
    (vibes, amp) => {
      const pairs: (readonly [number, number, number])[] = []

      for (const indices of groupByDock(vibes).values()) {
        if (indices.length !== 2) {
          continue
        }

        const [i0, i1] = [indices[0]!, indices[1]!]
        const v0 = vibes[i0]!
        const v1 = vibes[i1]!
        const isIdenticalFullLine =
          OPPOSITE_SLOT[v0[1]] === v1[1] &&
          v0[2] === v1[2] &&
          v0[3] === v1[3]

        if (isIdenticalFullLine) {
          pairs.push([i0, i1, LINE_OF_SLOT[v0[1]]!])
        }
      }

      return [pairs, amp]
    },
    (cfg, amp, [i0, i1, currentLine]) =>
      LINES.map(([slotA, slotB], targetLine) => {
        if (targetLine === currentLine) {
          return [cfg, mulZ9(amp, keepCoeff)] as const
        }

        const [dock, , tone, role] = cfg[i0]!
        const hopped = cfg.slice()

        hopped[i0] = [dock, slotA, tone, role]
        hopped[i1] = [dock, slotB, tone, role]

        return [hopped, mulZ9(amp, hopCoeff)] as const
      }),
  )
}

// Scale-4 chiral 4-body phase Phi_odd using canonical W(F_4) x Z_2^C orbit invariant chi_odd
// (applied palindromically at layers 1 and 7; silent on fewer than 4 excitations per dock).
function applyOddChiralPhase(state: State, dag: boolean): State {
  return mapConfigurations(state, (vibes, amp) => {
    let exponent = 0

    for (const [dock, indices] of groupByDock(vibes)) {
      if (indices.length >= 4) {
        exponent +=
          dockParity[dock]! * chiralOrientationDock(vibes, indices)
      }
    }

    const signedExp = dag ? -exponent : exponent
    const mod6 = ((signedExp % 6) + 6) % 6
    const phased = mod6 === 0 ? amp : mulZ9(amp, ZETA6_POWERS[mod6]!)

    return [vibes, phased]
  })
}

// Opposite-sign collision bounce K (self-adjoint involution K^dag = K; commutes with M_meet and M_pair).
function applyOppositeSignBounce(state: State, _dag: boolean): State {
  return mapConfigurations(state, (vibes, amp) => {
    let negate = false

    for (const [idxA, idxB, slotA, slotB] of collectActiveLines(
      vibes,
    )) {
      if (idxA === undefined || idxB === undefined) {
        continue
      }

      if (vibes[idxA]![2] === vibes[idxB]![2]) {
        continue
      }

      const vA = vibes[idxA]!
      const vB = vibes[idxB]!

      vibes[idxA] = [vA[0], slotB, vA[2], vA[3]]
      vibes[idxB] = [vB[0], slotA, vB[2], vB[3]]
      negate = !negate
    }

    return [vibes, negate ? scaleZ9(-1n, amp) : amp]
  })
}

// Deterministic antipodal stream S across the 24 octahedral facets of {3,4,3,4}.
function applyStream(state: State, dag: boolean): State {
  return mapConfigurations(state, (vibes, amp) => [
    vibes.map(([dock, slot, tone, role]) => {
      const dir = dag ? OPPOSITE_SLOT[slot]! : slot

      return [stepDock(dock, dir), slot, tone, role] as const
    }),
    amp,
  ])
}

// Execution order (right-to-left of U = S o Phi_odd o D o M_meet o M_pair(zeta_18) o K o D o Phi_odd):
const BEAT_LAYERS: readonly LayerOp[] = [
  applyOddChiralPhase,
  applyHalfCoinD,
  applyOppositeSignBounce,
  applyPairLineMixer,
  applyRoleMeet,
  applyHalfCoinD,
  applyOddChiralPhase,
  applyStream,
]

// =================================================================================================
// 3. Exact self-verification checks (isotropy, shells, unitarity, W(F_4)^+ covariance, T/CP/CPT/C/P)
// =================================================================================================

function verifyD4Isotropy(): readonly [bigint, bigint] {
  const sumFourth = ROOTS.reduce((sum, r) => sum + r[0] ** 4n, 0n)
  const sumMixed = ROOTS.reduce(
    (sum, r) => sum + r[0] ** 2n * r[1] ** 2n,
    0n,
  )

  assertExact(
    sumFourth === 12n &&
      sumMixed === 4n &&
      sumFourth - 3n * sumMixed === 0n,
    'D_4 rank-4 SO(4) isotropy failed',
  )

  return [sumFourth, sumMixed]
}

function verifyHoneycombShells(): readonly [readonly number[], number] {
  const distance = new Map<number, number>([[0, 0]])
  const queue: number[] = [0]
  const shells = [0, 0, 0]

  for (const dock of queue) {
    const radius = distance.get(dock)!

    shells[radius]!++

    if (radius < 2) {
      for (let slot = 0; slot < 24; slot++) {
        const next = stepDock(dock, slot)

        assertExact(
          stepDock(next, OPPOSITE_SLOT[slot]!) === dock,
          'step involution failed',
        )

        if (!distance.has(next)) {
          distance.set(next, radius + 1)
          queue.push(next)
        }
      }
    }
  }

  assertExact(
    shells.join(',') === '1,24,456' && inconsistentSteps === 0,
    `unexpected honeycomb shells: ${shells.join(',')}`,
  )

  for (let dock = 0; dock < dockFrames.length; dock++) {
    const expectedDet: Q2 = [BigInt(dockParity[dock]!), 0n]

    assertExact(
      eqQ2(detQ2(dockFrames[dock]!), expectedDet),
      `dockParity[${dock}] !== det(frame(${dock}))`,
    )
  }

  return [shells, dockFrames.length]
}

function verifyReversibleTrajectory(
  label: string,
  initial: State,
  beats: number,
): TrajectorySummary {
  let state = initial

  for (let t = 0; t < beats; t++) {
    state = applyBeat(state)
    assertExact(
      hasExactUnitNorm(state),
      `${label} forward norm at t=${t + 1}`,
    )
  }

  const visitedDocks = new Set<number>()

  let maxCosh2 = 2n

  for (const key of state.amp.keys()) {
    for (const [dock] of decodeConfig(key)) {
      visitedDocks.add(dock)

      const cosh2 = lorentzCosh2(dock)

      if (cosh2 > maxCosh2) {
        maxCosh2 = cosh2
      }
    }
  }

  const branches = state.amp.size

  for (let t = 0; t < beats; t++) {
    state = applyBeatInverse(state)
    assertExact(
      hasExactUnitNorm(state),
      `${label} inverse norm at t=${t + 1}`,
    )
  }

  assertExact(
    countStateDiffs(state, initial) === 0 && state.den === initial.den,
    `${label} memoryless reversal failed`,
  )

  return { branches, maxCosh2, docks: visitedDocks.size }
}

function slotPermFromDoubledMat4(
  mat2: Mat4Big,
  expectedDet16: bigint,
): Uint8Array {
  for (let i = 0; i < 4; i++) {
    for (let j = 0; j < 4; j++) {
      let dot = 0n

      for (let k = 0; k < 4; k++) {
        dot += mat2[k]![i]! * mat2[k]![j]!
      }

      assertExact(
        dot === (i === j ? 4n : 0n),
        'W(F_4) generator matrix is not orthogonal',
      )
    }
  }

  assertExact(
    detBigInt(mat2) === expectedDet16,
    `W(F_4) generator determinant mismatch (expected ${expectedDet16})`,
  )

  const perm = new Uint8Array(24)

  for (let slot = 0; slot < 24; slot++) {
    const r = ROOTS[slot]!
    const image: bigint[] = []

    for (let row = 0; row < 4; row++) {
      const mRow = mat2[row]!
      const num =
        mRow[0] * r[0] +
        mRow[1] * r[1] +
        mRow[2] * r[2] +
        mRow[3] * r[3]

      assertExact(num % 2n === 0n, 'W(F_4) image not integral on D_4')
      image.push(num / 2n)
    }

    const idx = ROOTS.findIndex(
      other =>
        other[0] === image[0] &&
        other[1] === image[1] &&
        other[2] === image[2] &&
        other[3] === image[3],
    )

    assertExact(idx >= 0, 'W(F_4) generator did not preserve D_4 roots')
    perm[slot] = idx
  }

  return perm
}

function mapStateBySlotPerm(state: State, perm: Uint8Array): State {
  const dockCache = new Map<number, number>([[0, 0]])

  const mapDock = (dock: number): number => {
    const hit = dockCache.get(dock)

    if (hit !== undefined) {
      return hit
    }

    const [parentDock, parentSlot] = dockParent[dock]!
    const mapped = stepDock(mapDock(parentDock), perm[parentSlot]!)

    dockCache.set(dock, mapped)

    return mapped
  }

  return mapConfigurations(state, (vibes, amp) => [
    vibes.map(([dock, slot, tone, role]) => [
      mapDock(dock),
      perm[slot]!,
      tone,
      role,
    ]),
    amp,
  ])
}

function verifyGlobalWF4PlusCovariance(
  states: readonly State[],
): CovarianceSummary {
  // Four explicit proper orthogonal 4x4 matrices (represented as 2*M in Z^{4x4}, det(M)=+1)
  // generating the entire proper Weyl group W(F_4)^+ of order 576:
  //   G0 = diag(1, 1, -1, -1) (line-reversing involution in W(D_4)^+, swaps slots 20 <-> 23)
  //   G1 = s_1 s_2            (order-3 coordinate 3-cycle in W(D_4)^+)
  //   G2 = s_1 s_3            (swap x_1 <-> x_2, negate x_3, in W(D_4)^+)
  //   G3 = s_1 s_4            (outer F_4 triality proper rotation in W(F_4)^+ \ W(D_4)^+)
  const properGenerators2: readonly Mat4Big[] = [
    [
      [2n, 0n, 0n, 0n],
      [0n, 2n, 0n, 0n],
      [0n, 0n, -2n, 0n],
      [0n, 0n, 0n, -2n],
    ],
    [
      [2n, 0n, 0n, 0n],
      [0n, 0n, 0n, 2n],
      [0n, 2n, 0n, 0n],
      [0n, 0n, 2n, 0n],
    ],
    [
      [2n, 0n, 0n, 0n],
      [0n, 0n, 2n, 0n],
      [0n, 2n, 0n, 0n],
      [0n, 0n, 0n, -2n],
    ],
    [
      [1n, 1n, 1n, 1n],
      [1n, -1n, 1n, -1n],
      [1n, 1n, -1n, -1n],
      [1n, -1n, -1n, 1n],
    ],
  ]

  const perms = properGenerators2.map(m =>
    slotPermFromDoubledMat4(m, 16n),
  )

  assertExact(
    perms[0]![20] === 23 && perms[0]![23] === 20,
    'G0 = diag(1,1,-1,-1) did not swap line orientation 20 <-> 23',
  )

  // Verify BFS closure of the 4 generators equals the entire proper subgroup W(F_4)^+ (order 576).
  const identity = Uint8Array.from({ length: 24 }, (_, d) => d)
  const queue: Uint8Array[] = [identity]
  const seen = new Set<string>([identity.join(',')])

  for (const cur of queue) {
    for (const g of perms) {
      const next = new Uint8Array(24)

      for (let d = 0; d < 24; d++) {
        next[d] = g[cur[d]!]!
      }

      const key = next.join(',')

      if (!seen.has(key)) {
        seen.add(key)
        queue.push(next)
      }
    }
  }

  assertExact(
    queue.length === 576,
    `W(F_4)^+ generator closure had order ${queue.length}, expected 576`,
  )

  let totalDiff = 0

  for (const perm of perms) {
    for (const state of states) {
      totalDiff += countStateDiffs(
        applyBeat(mapStateBySlotPerm(state, perm)),
        mapStateBySlotPerm(applyBeat(state), perm),
      )
    }
  }

  assertExact(
    totalDiff === 0,
    `W(F_4)^+ covariance failed with diff=${totalDiff}`,
  )

  return {
    generatorCount: perms.length,
    closureOrder: queue.length,
    covDiff: totalDiff,
  }
}

function verifyDiscreteSymmetries(
  states: readonly State[],
  chiralState: State,
  x1State: State,
): DiscreteSymmetrySummary {
  // Spatial parity reflection P = diag(1, 1, 1, -1) in W(F_4)^- (det = -1, P^2 = I).
  const parityPerm = slotPermFromDoubledMat4(
    [
      [2n, 0n, 0n, 0n],
      [0n, 2n, 0n, 0n],
      [0n, 0n, 2n, 0n],
      [0n, 0n, 0n, -2n],
    ],
    -16n,
  )

  const applyC = (state: State): State =>
    mapConfigurations(state, (vibes, amp) => [
      vibes.map(([dock, slot, tone, role]) => [
        dock,
        slot,
        tone === 1 ? -1 : 1,
        role,
      ]),
      amp,
    ])

  const applyP = (state: State): State =>
    mapStateBySlotPerm(state, parityPerm)

  const applyCP = (state: State): State => applyC(applyP(state))

  const applySlotReversalR = (state: State): State =>
    mapConfigurations(state, (vibes, amp) => [
      vibes.map(([dock, slot, tone, role]) => [
        dock,
        OPPOSITE_SLOT[slot]!,
        tone,
        role,
      ]),
      amp,
    ])

  const applyConjK = (state: State): State => {
    const out = new Map<string, Z9>()

    for (const [key, amp] of state.amp) {
      out.set(key, conjZ9(amp))
    }

    return { amp: out, den: state.den }
  }

  // Motion-reversal antiunitary involution T = K_conj o S o R (T^2 = I).
  const applyT = (state: State): State =>
    applyConjK(applyStream(applySlotReversalR(state), false))

  const applyCPT = (state: State): State => applyCP(applyT(state))

  let tDiff = 0
  let cpDiff = 0
  let cptDiff = 0

  for (const state of states) {
    assertExact(
      countStateDiffs(applyT(applyT(state)), state) === 0,
      'T^2 !== I',
    )

    assertExact(
      countStateDiffs(applyCPT(applyCPT(state)), state) === 0,
      '(CPT)^2 !== I',
    )

    tDiff += countStateDiffs(
      applyT(applyBeat(state)),
      applyBeatInverse(applyT(state)),
    )

    cpDiff += countStateDiffs(
      applyCP(applyBeat(state)),
      applyBeat(applyCP(state)),
    )

    cptDiff += countStateDiffs(
      applyCPT(applyBeat(state)),
      applyBeatInverse(applyCPT(state)),
    )
  }

  const cViolChiral = countStateDiffs(
    applyC(applyBeat(chiralState)),
    applyBeat(applyC(chiralState)),
  )
  const pViolChiral = countStateDiffs(
    applyP(applyBeat(chiralState)),
    applyBeat(applyP(chiralState)),
  )
  const cViolX1 = countStateDiffs(
    applyC(applyBeat(x1State)),
    applyBeat(applyC(x1State)),
  )
  const pViolX1 = countStateDiffs(
    applyP(applyBeat(x1State)),
    applyBeat(applyP(x1State)),
  )

  assertExact(tDiff === 0, `T-reversal failed: tDiff=${tDiff}`)
  assertExact(cpDiff === 0, `CP symmetry failed: cpDiff=${cpDiff}`)
  assertExact(cptDiff === 0, `CPT symmetry failed: cptDiff=${cptDiff}`)
  assertExact(
    cViolChiral > 0 && cViolX1 > 0,
    `C violation vanished: mixed=${cViolChiral}, X1=${cViolX1}`,
  )

  assertExact(
    pViolChiral > 0 && pViolX1 > 0,
    `P violation vanished: mixed=${pViolChiral}, X1=${pViolX1}`,
  )

  return {
    tDiff,
    cpDiff,
    cptDiff,
    cViolChiral,
    pViolChiral,
    cViolX1,
    pViolX1,
  }
}

// =================================================================================================
// 4. State, branching, and canonical W(F_4) x Z_2^C chiral-orientation helpers
// =================================================================================================

function assertExact(condition: boolean, message: string): void {
  if (!condition) {
    throw new Error(`FAIL: ${message}`)
  }
}

function basisKet(vibes: readonly Vibe[]): State {
  return { amp: new Map([[encodeConfig(vibes), Z9_ONE]]), den: 1n }
}

function encodeConfig(vibes: readonly Vibe[]): string {
  return [...vibes]
    .sort((a, b) => a[0] - b[0] || a[1] - b[1])
    .map(v => v.join(':'))
    .join(';')
}

function decodeConfig(key: string): Vibe[] {
  if (key === '') {
    return []
  }

  return key.split(';').map(entry => {
    const [dock, slot, tone, role] = entry.split(':')

    return [
      Number(dock),
      Number(slot),
      Number(tone) as -1 | 1,
      Number(role),
    ]
  })
}

function addAmplitude(
  map: Map<string, Z9>,
  key: string,
  delta: Z9,
): void {
  const next = map.has(key) ? addZ9(map.get(key)!, delta) : delta

  if (isZeroZ9(next)) {
    map.delete(key)
  } else {
    map.set(key, next)
  }
}

function reduceDenominator(amp: Map<string, Z9>, den: bigint): State {
  let reducedDen = den

  for (const prime of [2n, 3n]) {
    while (
      reducedDen % prime === 0n &&
      [...amp.values()].every(z => z.every(c => c % prime === 0n))
    ) {
      reducedDen /= prime

      for (const [key, z] of amp) {
        amp.set(key, divExactZ9(z, prime))
      }
    }
  }

  return { amp, den: reducedDen }
}

function hasExactUnitNorm(state: State): boolean {
  let normSq = Z9_ZERO

  for (const amp of state.amp.values()) {
    normSq = addZ9(normSq, mulZ9(conjZ9(amp), amp))
  }

  const target: Z9 = [state.den * state.den, 0n, 0n, 0n, 0n, 0n]

  return isZeroZ9(subZ9(normSq, target))
}

function countStateDiffs(a: State, b: State): number {
  const keys = new Set([...a.amp.keys(), ...b.amp.keys()])

  let diffs = 0

  for (const key of keys) {
    const lhs = scaleZ9(b.den, a.amp.get(key) ?? Z9_ZERO)
    const rhs = scaleZ9(a.den, b.amp.get(key) ?? Z9_ZERO)

    if (!isZeroZ9(subZ9(lhs, rhs))) {
      diffs++
    }
  }

  return diffs
}

function groupByDock(vibes: readonly Vibe[]): Map<number, number[]> {
  const groups = new Map<number, number[]>()

  for (let i = 0; i < vibes.length; i++) {
    const dock = vibes[i]![0]
    const list = groups.get(dock)

    if (list) {
      list.push(i)
    } else {
      groups.set(dock, [i])
    }
  }

  return groups
}

function collectActiveLines(vibes: readonly Vibe[]): ActiveLine[] {
  const result: ActiveLine[] = []

  for (const indices of groupByDock(vibes).values()) {
    const bySlot = new Map<number, number>()

    for (const idx of indices) {
      bySlot.set(vibes[idx]![1], idx)
    }

    for (const [slotA, slotB] of LINES) {
      const idxA = bySlot.get(slotA)
      const idxB = bySlot.get(slotB)

      if (idxA !== undefined || idxB !== undefined) {
        result.push([idxA, idxB, slotA, slotB])
      }
    }
  }

  return result
}

function mapConfigurations(
  state: State,
  transform: (vibes: Vibe[], amp: Z9) => readonly [Vibe[], Z9],
): State {
  const out = new Map<string, Z9>()

  for (const [key, amp] of state.amp) {
    const [nextVibes, nextAmp] = transform(decodeConfig(key), amp)

    addAmplitude(out, encodeConfig(nextVibes), nextAmp)
  }

  return { amp: out, den: state.den }
}

function applyBranchingLayer<Item>(
  state: State,
  branchDen: bigint,
  prepare: (vibes: Vibe[], amp: Z9) => readonly [Item[], Z9],
  expand: (
    cfg: Vibe[],
    amp: Z9,
    item: Item,
  ) => readonly (readonly [Vibe[], Z9])[],
): State {
  const prepared = [...state.amp.entries()].map(([key, amp]) => {
    const vibes = decodeConfig(key)
    const [items, phasedAmp] = prepare(vibes, amp)

    return { vibes, items, phasedAmp }
  })

  const maxDepth = prepared.reduce(
    (best, row) => Math.max(best, row.items.length),
    0,
  )
  const out = new Map<string, Z9>()

  for (const { vibes, items, phasedAmp } of prepared) {
    const scale = branchDen ** BigInt(maxDepth - items.length)

    let branches: (readonly [Vibe[], Z9])[] = [
      [vibes, scaleZ9(scale, phasedAmp)],
    ]

    for (const item of items) {
      branches = branches.flatMap(([cfg, amp]) =>
        expand(cfg, amp, item),
      )
    }

    for (const [cfg, amp] of branches) {
      addAmplitude(out, encodeConfig(cfg), amp)
    }
  }

  return reduceDenominator(
    out,
    state.den * branchDen ** BigInt(maxDepth),
  )
}

function detBigInt(matrix: readonly (readonly bigint[])[]): bigint {
  if (matrix.length === 1) {
    return matrix[0]![0]!
  }

  let total = 0n

  for (let col = 0; col < matrix.length; col++) {
    const minor = matrix
      .slice(1)
      .map(row => row.filter((_, j) => j !== col))
    const term = matrix[0]![col]! * detBigInt(minor)

    total += col % 2 === 0 ? term : -term
  }

  return total
}

function lexKey4(
  a0: number,
  a1: number,
  a2: number,
  a3: number,
): number {
  let x0 = a0
  let x1 = a1
  let x2 = a2
  let x3 = a3

  if (x0 > x1) {
    const t = x0

    x0 = x1
    x1 = t
  }

  if (x2 > x3) {
    const t = x2

    x2 = x3
    x3 = t
  }

  if (x0 > x2) {
    const t = x0

    x0 = x2
    x2 = t
  }

  if (x1 > x3) {
    const t = x1

    x1 = x3
    x3 = t
  }

  if (x1 > x2) {
    const t = x1

    x1 = x2
    x2 = t
  }

  return ((x0 * 48 + x1) * 48 + x2) * 48 + x3
}

const chiral4Cache = new Map<number, number>()

// Exact canonical W(F_4) x Z_2^C orbit sign eps(quad) in {-1, 0, +1}, mathematically identical to
// code/rule/value-phase.ts:valueCensus():
//   - codes are 2 * slot + (tone < 0 ? 1 : 0),
//   - finds the lexicographically minimum sorted code tuple minKey in the W(F_4) x {+1, -1} orbit,
//   - returns the unique c * det(g) of all (c, g) mapping quad -> minKey if chiral, or 0 if achiral.
function chiral4Sign(
  c0: number,
  c1: number,
  c2: number,
  c3: number,
): number {
  const selfKey = lexKey4(c0, c1, c2, c3)
  const cached = chiral4Cache.get(selfKey)

  if (cached !== undefined) {
    return cached
  }

  const s0 = c0 >> 1
  const s1 = c1 >> 1
  const s2 = c2 >> 1
  const s3 = c3 >> 1
  const b0 = c0 & 1
  const b1 = c1 & 1
  const b2 = c2 & 1
  const b3 = c3 & 1

  let minKey = Number.POSITIVE_INFINITY
  let minSign = 0
  let chiral = true

  const elements = WF4_GROUP.elements
  const dets = WF4_GROUP.det

  for (let e = 0; e < elements.length; e++) {
    const p = elements[e]!
    const d = dets[e]!
    const ps0 = p[s0]! << 1
    const ps1 = p[s1]! << 1
    const ps2 = p[s2]! << 1
    const ps3 = p[s3]! << 1

    const kPos = lexKey4(ps0 + b0, ps1 + b1, ps2 + b2, ps3 + b3)

    if (kPos < minKey) {
      minKey = kPos
      minSign = d
      chiral = true
    } else if (kPos === minKey && d !== minSign) {
      chiral = false
    }

    const kNeg = lexKey4(
      ps0 + (b0 ^ 1),
      ps1 + (b1 ^ 1),
      ps2 + (b2 ^ 1),
      ps3 + (b3 ^ 1),
    )

    if (kNeg < minKey) {
      minKey = kNeg
      minSign = -d
      chiral = true
    } else if (kNeg === minKey && -d !== minSign) {
      chiral = false
    }
  }

  const sign = chiral ? minSign : 0

  chiral4Cache.set(selfKey, sign)

  return sign
}

function verifyLowScaleAchiral(): readonly [number, number, number] {
  const orbitCounts: [number, number, number] = [0, 0, 0]
  const elements = WF4_GROUP.elements
  const dets = WF4_GROUP.det

  for (let k = 1; k <= 3; k++) {
    const visited = new Set<number>()
    const codes: number[] = []
    const img = new Array<number>(k).fill(0)

    const lexKeyK = (arr: readonly number[]): number => {
      let key = 0

      for (const value of arr) {
        key = key * 48 + value
      }

      return key
    }

    const visit = (): void => {
      const startKey = lexKeyK(codes)

      if (visited.has(startKey)) {
        return
      }

      orbitCounts[k - 1] = orbitCounts[k - 1]! + 1

      const signs = new Map<number, number>()

      let chiral = true

      for (let e = 0; e < elements.length; e++) {
        const p = elements[e]!
        const d = dets[e]!

        for (const flip of [0, 1]) {
          for (let i = 0; i < k; i++) {
            img[i] =
              (p[codes[i]! >> 1]! << 1) + ((codes[i]! & 1) ^ flip)
          }

          img.sort((a, b) => a - b)

          const ik = lexKeyK(img)
          const s = flip === 0 ? d : -d
          const prev = signs.get(ik)

          if (prev === undefined) {
            signs.set(ik, s)
          } else if (prev !== s) {
            chiral = false
          }
        }
      }

      for (const ik of signs.keys()) {
        visited.add(ik)
      }

      assertExact(!chiral, `unexpected chiral orbit at k=${k}`)
    }

    const recurse = (from: number, usedSlots: number): void => {
      if (codes.length === k) {
        visit()

        return
      }

      for (let c = from; c < 48; c++) {
        const slot = c >> 1

        if ((usedSlots >> slot) & 1) {
          continue
        }

        codes.push(c)
        recurse(c + 1, usedSlots | (1 << slot))
        codes.pop()
      }
    }

    recurse(0, 0)
  }

  return orbitCounts
}

function chiralOrientationDock(
  vibes: readonly Vibe[],
  indices: readonly number[],
): number {
  let chi = 0

  for (let i = 0; i < indices.length; i++) {
    const vi = vibes[indices[i]!]!
    const ci = (vi[1] << 1) + (vi[2] < 0 ? 1 : 0)

    for (let j = i + 1; j < indices.length; j++) {
      const vj = vibes[indices[j]!]!
      const cj = (vj[1] << 1) + (vj[2] < 0 ? 1 : 0)

      for (let k = j + 1; k < indices.length; k++) {
        const vk = vibes[indices[k]!]!
        const ck = (vk[1] << 1) + (vk[2] < 0 ? 1 : 0)

        for (let l = k + 1; l < indices.length; l++) {
          const vl = vibes[indices[l]!]!
          const cl = (vl[1] << 1) + (vl[2] < 0 ? 1 : 0)

          chi += chiral4Sign(ci, cj, ck, cl)
        }
      }
    }
  }

  return chi
}

// =================================================================================================
// 5. Exact cyclotomic ring Z[zeta_9] helpers (mod z^6 + z^3 + 1 = 0)
// =================================================================================================

const Z9_ZERO: Z9 = [0n, 0n, 0n, 0n, 0n, 0n]
const Z9_ONE: Z9 = [1n, 0n, 0n, 0n, 0n, 0n]
const Z9_OMEGA: Z9 = [0n, 0n, 0n, 1n, 0n, 0n] // zeta_9^3
const Z9_ZETA6: Z9 = [1n, 0n, 0n, 1n, 0n, 0n] // 1 + omega
const Z9_ZETA18: Z9 = [0n, 0n, 0n, 0n, 0n, -1n] // -zeta_9^5
const Z9_COIN_DIAG: Z9 = [2n, 0n, 0n, 1n, 0n, 0n] // 2 + omega
const Z9_COIN_OFF: Z9 = [0n, 0n, 0n, -1n, 0n, 0n] // -omega
const Z9_MEET_SWAP: Z9 = [-1n, 0n, 0n, 1n, 0n, 0n] // omega - 1

function addZ9(a: Z9, b: Z9): Z9 {
  return [
    a[0] + b[0],
    a[1] + b[1],
    a[2] + b[2],
    a[3] + b[3],
    a[4] + b[4],
    a[5] + b[5],
  ]
}

function subZ9(a: Z9, b: Z9): Z9 {
  return [
    a[0] - b[0],
    a[1] - b[1],
    a[2] - b[2],
    a[3] - b[3],
    a[4] - b[4],
    a[5] - b[5],
  ]
}

function scaleZ9(factor: bigint, a: Z9): Z9 {
  return [
    factor * a[0],
    factor * a[1],
    factor * a[2],
    factor * a[3],
    factor * a[4],
    factor * a[5],
  ]
}

function divExactZ9(a: Z9, divisor: bigint): Z9 {
  return [
    a[0] / divisor,
    a[1] / divisor,
    a[2] / divisor,
    a[3] / divisor,
    a[4] / divisor,
    a[5] / divisor,
  ]
}

function conjZ9(a: Z9): Z9 {
  return [a[0] - a[3], -a[2], -a[1], -a[3], a[5] - a[2], a[4] - a[1]]
}

function adjointZ9(a: Z9, dag: boolean): Z9 {
  return dag ? conjZ9(a) : a
}

function mulZ9(a: Z9, b: Z9): Z9 {
  const prod = new Array<bigint>(11).fill(0n)

  for (let i = 0; i < 6; i++) {
    for (let j = 0; j < 6; j++) {
      prod[i + j] = prod[i + j]! + a[i]! * b[j]!
    }
  }

  return [
    prod[0]! - prod[6]! + prod[9]!,
    prod[1]! - prod[7]! + prod[10]!,
    prod[2]! - prod[8]!,
    prod[3]! - prod[6]!,
    prod[4]! - prod[7]!,
    prod[5]! - prod[8]!,
  ]
}

function isZeroZ9(a: Z9): boolean {
  return a.every(coeff => coeff === 0n)
}

const ZETA6_POWERS: readonly Z9[] = [
  Z9_ONE,
  Z9_ZETA6,
  Z9_OMEGA,
  scaleZ9(-1n, Z9_ONE),
  scaleZ9(-1n, Z9_ZETA6),
  scaleZ9(-1n, Z9_OMEGA),
]

// =================================================================================================
// 6. Exact 24-root D_4 dock geometry, W(F_4) group (order 1,152), and {3,4,3,4} Coxeter engine
//    in O^+(4,1; Z[sqrt(2)])
// =================================================================================================

function buildD4Roots(): readonly Root4[] {
  const roots: Root4[] = []
  const signs: readonly bigint[] = [1n, -1n]

  for (let i = 0; i < 4; i++) {
    for (let j = i + 1; j < 4; j++) {
      for (const si of signs) {
        for (const sj of signs) {
          const coords: [bigint, bigint, bigint, bigint] = [
            0n,
            0n,
            0n,
            0n,
          ]

          coords[i] = si
          coords[j] = sj
          roots.push(coords)
        }
      }
    }
  }

  return roots
}

function dot4(a: Root4, b: Root4): bigint {
  return a[0] * b[0] + a[1] * b[1] + a[2] * b[2] + a[3] * b[3]
}

const ROOTS: readonly Root4[] = buildD4Roots()

const OPPOSITE_SLOT: readonly number[] = ROOTS.map(root =>
  ROOTS.findIndex(other =>
    other.every((val, idx) => val === -root[idx]!),
  ),
)

const LINES: readonly AntipodalLine[] = ROOTS.flatMap((_, slotA) => {
  const slotB = OPPOSITE_SLOT[slotA]!

  return slotA < slotB ? [[slotA, slotB] as const] : []
})

const LINE_OF_SLOT: readonly number[] = ROOTS.map((_, slot) =>
  LINES.findIndex(([slotA, slotB]) => slotA === slot || slotB === slot),
)

// Generate all 1,152 elements of W(F_4) on the 24 D_4 roots from the 4 Bourbaki simple F_4 roots.
function buildWF4Group(): WF4Group {
  const simpleRoots: readonly Root4[] = [
    [0n, 1n, -1n, 0n],
    [0n, 0n, 1n, -1n],
    [0n, 0n, 0n, 1n],
    [1n, -1n, -1n, -1n],
  ]

  const simplePerms = simpleRoots.map(alpha => {
    const aa = dot4(alpha, alpha)
    const perm = new Uint8Array(24)

    for (let slot = 0; slot < 24; slot++) {
      const v = ROOTS[slot]!
      const twoVa = 2n * dot4(v, alpha)
      const img: bigint[] = []

      for (let k = 0; k < 4; k++) {
        const num = twoVa * alpha[k]!

        assertExact(
          num % aa === 0n,
          'F_4 reflection not integral on D_4',
        )
        img.push(v[k]! - num / aa)
      }

      const idx = ROOTS.findIndex(
        other =>
          other[0] === img[0] &&
          other[1] === img[1] &&
          other[2] === img[2] &&
          other[3] === img[3],
      )

      assertExact(idx >= 0, 'F_4 simple reflection left D_4 roots')
      perm[slot] = idx
    }

    return perm
  })

  const identity = Uint8Array.from({ length: 24 }, (_, d) => d)
  const elements: Uint8Array[] = [identity]
  const det: number[] = [1]
  const seen = new Map<string, number>([[identity.join(','), 0]])

  for (let head = 0; head < elements.length; head++) {
    const cur = elements[head]!
    const nextDet = -det[head]!

    for (const ref of simplePerms) {
      const next = new Uint8Array(24)

      for (let d = 0; d < 24; d++) {
        next[d] = ref[cur[d]!]!
      }

      const key = next.join(',')
      const known = seen.get(key)

      if (known === undefined) {
        seen.set(key, elements.length)
        elements.push(next)
        det.push(nextDet)
      } else {
        assertExact(
          det[known] === nextDet,
          'W(F_4) reflection parity inconsistent',
        )
      }
    }
  }

  assertExact(
    elements.length === 1152 && det.filter(d => d === 1).length === 576,
    `W(F_4) group size mismatch: ${elements.length}`,
  )

  return { elements, det }
}

const WF4_GROUP: WF4Group = buildWF4Group()

const DIM5 = [0, 1, 2, 3, 4] as const
const Q2_ZERO: Q2 = [0n, 0n]

const EYE5: readonly (readonly Q2[])[] = DIM5.map(row =>
  DIM5.map(col => [row === col ? 1n : 0n, 0n] as const),
)

function addQ2(u: Q2, v: Q2): Q2 {
  return [u[0] + v[0], u[1] + v[1]]
}

function subQ2(u: Q2, v: Q2): Q2 {
  return [u[0] - v[0], u[1] - v[1]]
}

function mulQ2(u: Q2, v: Q2): Q2 {
  return [u[0] * v[0] + 2n * u[1] * v[1], u[0] * v[1] + u[1] * v[0]]
}

function eqQ2(u: Q2, v: Q2): boolean {
  return u[0] === v[0] && u[1] === v[1]
}

function dotQ2(u: readonly Q2[], v: readonly Q2[]): Q2 {
  return u.reduce<Q2>(
    (sum, entry, idx) => addQ2(sum, mulQ2(entry, v[idx]!)),
    Q2_ZERO,
  )
}

function detQ2(mat: readonly (readonly Q2[])[]): Q2 {
  const n = mat.length

  if (n === 1) {
    return mat[0]![0]!
  }

  let total = Q2_ZERO

  for (let col = 0; col < n; col++) {
    const entry = mat[0]![col]!

    if (entry[0] === 0n && entry[1] === 0n) {
      continue
    }

    const minor = mat
      .slice(1)
      .map(row => row.filter((_, j) => j !== col))
    const term = mulQ2(entry, detQ2(minor))

    total = col % 2 === 0 ? addQ2(total, term) : subQ2(total, term)
  }

  return total
}

function vecKeyQ2(vec: readonly Q2[]): string {
  return vec.map(([a, b]) => `${a},${b}`).join(';')
}

function matKeyQ2(mat: readonly (readonly Q2[])[]): string {
  return mat.map(vecKeyQ2).join('|')
}

function matVecQ2(
  mat: readonly (readonly Q2[])[],
  vec: readonly Q2[],
): Q2[] {
  return mat.map(row => dotQ2(row, vec))
}

function matMulQ2(
  a: readonly (readonly Q2[])[],
  b: readonly (readonly Q2[])[],
): Q2[][] {
  return a.map(row =>
    DIM5.map(col =>
      dotQ2(
        row,
        b.map(bRow => bRow[col]!),
      ),
    ),
  )
}

function buildTwiceGram(): readonly (readonly Q2[])[] {
  return DIM5.map(i =>
    DIM5.map(j => {
      if (i === j) {
        return [2n, 0n] as const
      }

      if (Math.abs(i - j) === 1) {
        const minIdx = Math.min(i, j)

        return minIdx % 2 === 0
          ? ([-1n, 0n] as const)
          : ([0n, -1n] as const)
      }

      return Q2_ZERO
    }),
  )
}

const TWICE_GRAM = buildTwiceGram()

function twiceForm(u: readonly Q2[], v: readonly Q2[]): Q2 {
  return dotQ2(u, matVecQ2(TWICE_GRAM, v))
}

function reflect5(normal: readonly Q2[]): Q2[][] {
  const dual = matVecQ2(TWICE_GRAM, normal)

  return EYE5.map((row, i) =>
    row.map((entry, j) => subQ2(entry, mulQ2(normal[i]!, dual[j]!))),
  )
}

// Base 24-cell center c_0 = (2, 4, 3*sqrt(2), 2*sqrt(2), 1) in Coxeter root coordinates.
const BASE_CENTER: readonly Q2[] = [
  [2n, 0n],
  [4n, 0n],
  [0n, 3n],
  [0n, 2n],
  [1n, 0n],
]

// Central inversion Z fixing c_0 and negating its 4D tangent space (det(Z) = +1 in O^+(4,1; Z[sqrt(2)])).
const CENTRAL_INVERSION: readonly (readonly Q2[])[] = DIM5.map(i =>
  DIM5.map(j => [
    (j === 4 ? 2n * BASE_CENTER[i]![0] : 0n) - (i === j ? 1n : 0n),
    j === 4 ? 2n * BASE_CENTER[i]![1] : 0n,
  ]),
)

// Every single-hop cell transport k_a = F_a Z has det(k_a) = (-1)(+1) = -1 in O^+(4,1; Z[sqrt(2)]),
// so the bipartite dock parity sigma(d) = det(frame(d)) in {+1, -1} is canonically orientation-determined.
function buildCellTransports(): readonly (readonly (readonly Q2[])[])[] {
  const stabilizerGenerators = [0, 1, 2, 3].map(idx =>
    reflect5(EYE5[idx]!),
  )
  const facetNormals: Q2[][] = [EYE5[4]!.slice()]
  const seenNormals = new Set<string>([vecKeyQ2(EYE5[4]!)])

  for (const normal of facetNormals) {
    for (const generator of stabilizerGenerators) {
      const next = matVecQ2(generator, normal)
      const key = vecKeyQ2(next)

      if (!seenNormals.has(key)) {
        seenNormals.add(key)
        facetNormals.push(next)
      }
    }
  }

  const facetDot = (a: number, b: number): bigint =>
    (twiceForm(facetNormals[a]!, facetNormals[b]!)[0] + 2n) / 2n

  const orthoBasis: number[] = []

  for (let f = 0; f < 24 && orthoBasis.length < 4; f++) {
    if (orthoBasis.every(prev => facetDot(f, prev) === 0n)) {
      orthoBasis.push(f)
    }
  }

  const facetRoots: Root4[] = facetNormals.map((_, f) => {
    const [c0, c1, c2, c3] = orthoBasis.map(o => facetDot(f, o))

    return [
      (c0! + c1!) / 2n,
      (c0! - c1!) / 2n,
      (c2! + c3!) / 2n,
      (c2! - c3!) / 2n,
    ]
  })

  return ROOTS.map(root => {
    const facetIdx = facetRoots.findIndex(fr =>
      fr.every((val, i) => val === root[i]),
    )

    return matMulQ2(
      reflect5(facetNormals[facetIdx]!),
      CENTRAL_INVERSION,
    )
  })
}

const TRANSPORTS = buildCellTransports()

// Lazy on-the-fly infinite {3,4,3,4} Coxeter graph discovery in O^+(4,1; Z[sqrt(2)]).
const dockFrames: (readonly (readonly Q2[])[])[] = [EYE5]
const frameKeys: string[] = [matKeyQ2(EYE5)]
const dockParity: number[] = [1]
const dockParent: [number, number][] = [[-1, -1]]
const centerToDockId = new Map<string, number>([
  [vecKeyQ2(BASE_CENTER), 0],
])
const neighbors: Int32Array[] = [new Int32Array(24).fill(-1)]

let inconsistentSteps = 0

function stepDock(dock: number, slot: number): number {
  const cached = neighbors[dock]![slot]!

  if (cached >= 0) {
    return cached
  }

  const nextFrame = matMulQ2(dockFrames[dock]!, TRANSPORTS[slot]!)
  const centerKey = vecKeyQ2(matVecQ2(nextFrame, BASE_CENTER))
  const frameKey = matKeyQ2(nextFrame)

  let nextId = centerToDockId.get(centerKey)

  if (nextId === undefined) {
    nextId = dockFrames.length
    centerToDockId.set(centerKey, nextId)
    dockFrames.push(nextFrame)
    frameKeys.push(frameKey)
    dockParity.push(-dockParity[dock]!)
    dockParent.push([dock, slot])
    neighbors.push(new Int32Array(24).fill(-1))
  } else if (
    frameKeys[nextId] !== frameKey ||
    dockParity[nextId] !== -dockParity[dock]!
  ) {
    inconsistentSteps++
  }

  neighbors[dock]![slot] = nextId
  neighbors[nextId]![OPPOSITE_SLOT[slot]!] = dock

  return nextId
}

function lorentzCosh2(dock: number): bigint {
  return -twiceForm(
    matVecQ2(dockFrames[dock]!, BASE_CENTER),
    BASE_CENTER,
  )[0]
}

main()
```

</details>

Or open [`test/universe.ts`](test/universe.ts) directly.

## Honest Three-Tier Status Table

Every current-rule experiment sits in one of three canonical tiers (identical to Paper `0018`) so nothing built with an imposed effective measure or textbook continuum PDE is confused with a bare cellular automaton derivation:

| Tier | Scope | What Actually Runs | Canonical Runs |
| :--- | :--- | :--- | :--- |
| **Tier A: Microscopic QCA and Exact `{3,4,3,4}` Geometry** | Bare rule and Coxeter honeycomb only | Runs exact `O^+(4,1; Z[sqrt(2)])` honeycomb geometry or the bare `Z[zeta_9][1/6]` QCA (palindromic 8-layer beat `U = S o Phi_odd o C_{1/2} o M_meet o M_pair(zeta_18) o K o C_{1/2} o Phi_odd`) with zero continuum PDEs and zero injected potentials. `E-QTM-0204` (`L1`) verifies the exact `6x6` path+role unitary circuit, `E-QTM-0205` checks explicit bipartite state-vector envariance prerequisites under the operationally posited Born measure, and `Vibe/Gauge.lean` plus Theorem 15 of `Vibe/Limits.lean` inside `E-FND-0185` are noted separately as finite EFT algebra | [`test/universe.ts`](test/universe.ts), `E-GMT-0044` to `E-GMT-0046`, `E-RLT-0122`, `E-HLG-0043` (3D beam-sum non-closure, `i0` fail on period-2 cusp), `E-FND-0038`, `E-FND-0181` to `E-FND-0185`, `E-SPN-0220`, `E-QTM-0117`, `E-QTM-0202` to `E-QTM-0205`, `E-SLF-0189`, `E-SLF-0190`, `E-SLF-0192`, `E-SLF-0195`, `E-SLF-0198` to `E-SLF-0200`, `E-RLT-0123`, `E-RLT-0124` |
| **Tier B: Effective Beam and Prescribed Background-Field Encodings** | Imposed measure or prescribed fields on `{3,4,3,4}` / 1D chains / L1 quantum models | Uses exact `{3,4,3,4}` balls, the imposed `w(D) = 1 / N_D^2` cusp beam with canonical unaliased single-face `{4,3,4}` lateral links `[1, 4, 20, 100]` (cumulative `5^D = [1, 5, 25, 125]`, giving `K_eff = 1.012532`, `G_eff = 0.078593`, `c_u = 0.977925`, matching `Vibe/Geometry.lean`, with the aliased `period = 2` torus `[1, 10, 40, 200]` kept as control `1.031237 / 0.077167 / 0.986916`), 1D depth-24 domain-wall / 6-plaquette ladder models, or L1 state-vector models. **`E-GRV-0163` (`L2`) is a spatially uniform 1D radial-chain constant-river Gullstrand-Painlevé benchmark (`K = 0, 22, 35, 44, 53` total parabolic shifts distributed across `P = 45` beats with `m_b in {0, 1, 2}`: `r_s/r_0 = 1.00` gives `v_r(out) = +0.00016`, `v_r(in) = -1.95572`, `r_s/r_0 = 1.44` sends both orthogonal rays inward at `-0.19984` and `-2.15572`, exact `0` norm, reversal, and orthogonality on `45/45` beats), NOT a spatially varying horizon crossing or emergent General Relativity.** `E-QTM-0206` runs explicit `(1+4)`-qubit (`dim = 32`) and `(2+8)`-qubit (`dim = 1024`) partial traces (`I(S:F_j) = 1.000000`, `CHSH = 2.825774` vs `1.421875`) | `E-QTM-0206`, `E-QTM-0207` (L1 10-qubit scrambler, Bogoliubov identity, MITM on prepared singlet), `E-RLT-0125`, `E-GRV-0134`, `E-GRV-0136`, `E-GRV-0154` to `E-GRV-0158`, `E-GRV-0162`, `E-GRV-0163`, `E-SPN-0221`, `E-SPN-0222`, `E-FRC-0322`, `E-FRC-0323`, `E-CSM-0064`, `E-CSM-0065` (Part A = Tier B, Part B = Tier C, marked `B+C`), `E-FND-0186` (1D-ring x 9-depth beam), `E-FND-0187` |
| **Tier C: Downstream Continuum EFT and Flat `D_4` Lattice Checks** | Not derived from the bare automaton | Assumes textbook continuum GR (`E-GRV-0159` prescribed isotropic PPN `gamma = beta = 1`, `E-GRV-0160`, `E-GRV-0161`), `Spin(10)` / Pati-Salam QFT, Starobinsky inflation, BBN, or flat 4D Euclidean `D_4` lattice gauge theory (`['eft-continuum']` / `['d4-box']`) and tests compatibility against `{3,4,3,4}` geometric invariants (`b = 6034/330`, canonical `K_eff = 1.012532`, `c_u = 0.977925`, `Spin(10)`, `Z[zeta_9]`). `E-FND-0190` Sec 1 proves exact `{3,4,3,4}` spectral geometry while Sec 2 and Sec 3 are 4D lattice Yang-Mills bounds | `E-GRV-0159`, `E-GRV-0160`, `E-GRV-0161`, `E-FRC-0324` to `E-FRC-0332` (`E-FRC-0332`: GS-anomalous `Z_36` PQ `d_min = 18`, 11-scalar toy Higgs Hessian proxy, `120_H` flavor `chi^2: 87.97 -> 0.565`, 14 continuous + 11 `Z_9` params, synthetic 2%-12% weights), `E-CSM-0065` (Part B), `E-CSM-0066` to `E-CSM-0068` (`1,454` toy BP vacua), `E-FND-0188` (`13` checks = `3` structural zero-fit checks + `10` fitted/continuum-GR consistency checks + `5` active tensions, live `E-GRV-0163` `L2`), `E-FND-0189`, `E-FND-0190` |

## Machine-Checked Lean `4.35.0` Core Suite (`code/proof/Vibe/`)

[`code/proof/Vibe.lean`](code/proof/Vibe.lean) aggregates **9 zero-dependency proof modules** (`Tone.lean`, `Algebra.lean`, `Rule.lean`, `Geometry.lean`, `Gauge.lean`, `Limits.lean`, `SchurGap.lean`, `Uniqueness4D.lean`, `CoxeterTransport.lean`) plus the root aggregator `Vibe.lean`, totaling **160 public theorems** (`141` headline theorems alongside `19` exported algebraic helpers in `Algebra.lean` and `170` private helper lemmas), with `0 sorry`, `0 axiom`, `0 native_decide`, `0 unsafe`, and `0 implemented_by`. The 6 baseline modules (`94` headline theorems) pass full Lean `4.35.0` `lake build` and `#print axioms` verification, while the 3 newer modules (`47` headline theorems: `SchurGap`, `Uniqueness4D`, `CoxeterTransport`) pass `pnpm check:lean -- --no-build` and independent exact Python arithmetic cross-checks pending host `lake build`. Twelve standalone zero-import verification scripts under [`test/breakthrough/`](test/breakthrough/) reproduce all scattering, bare-universality, 1-hop horizon, finite-range domain-wall, Cayley-4-form SMG, Nelson-Barr, and 24-cell Combes-Thomas audits. Reproducing `E-FND-0185` and `E-FND-0188` on a fresh clone requires running `pnpm check:lean` first to compile the `.olean` artifacts.

- **QCA and lattice theorems (`Tone`, `Algebra`, `Rule`, `Geometry`, `Limits`):** classical 24-slot `DockState` fixed-point stationarity and 1-hop Lipschitz light-cone lemmas, exact local matrix/scalar unitarity (`2x2` `C` and `C_{1/2}`, `8x8` `F-G`, unit-modulus `zeta_6^n`, symbolic `12x12` `M_pair(u)`), algebraic 2-adic `SU(2)`/`PSU(2)` infinite-order and `Pin(2)`-exclusion hypotheses (implying topological `SU(2)` density via closed-subgroup classification), conditional single-face `cuspLateralLinks` (`[1, 4, 20, 100]` given `N_{D+1} >= 18 N_D`, verified through `D = 3`) proving exponential resistance and `K_eff < M_eff`, explicit 24-vector `D_4` 256-component rank-4 `SO(4)` isotropy (`O(a^4)`), the combinatorial zero-straddling-triangle half-space partition of infinite 4D `D_4` across `x_0 = 0` (the geometric premise for measure-theoretic Osterwalder-Seiler site-reflection positivity `S = S_+ + S_0 + Theta S_+`), arbitrary-word `Mat2Eis` unitarity over `{M, M2, M†, M2†}`, concrete `3x3` `Z_3` transfer-matrix spectral gap, and finite integer `B^T B` Gram positivity.
- **Finite algebraic EFT checks (`Gauge` and Theorem 15 of `Limits`, Tier C, explicitly distinct from QCA proofs):** `Spin(10)` 16-spinor anomaly sums, Weinberg `3/8`, `3x3` Koide warp lower bound, electroweak `m_gamma = 0` and custodial `rho_EW = 1`, `colorWeight` axion `E/N = 8/3`, and `Z_N` modular PQ operator-dimension divisibility (`d >= N / gcd(N, q)`).

## Discrete `{3,4,3,4}` / `D_4` vs the Clay Millennium Yang-Mills Problem

On the discrete `{3,4,3,4}` honeycomb and flat 4D Euclidean `D_4` lattice, our constructive suite (`E-FND-0189`, `E-FND-0190`, and [`code/proof/Vibe/`](code/proof/Vibe/)) establishes discrete UV finiteness alongside exact spectral and lattice-gauge bounds:

- **Certified global `{3,4,3,4}` spectral gap (`E-FND-0190` Sec 1):** An unconditional global Busemann Schur-test **upper bound** on the full infinite `{3,4,3,4}` honeycomb proves `rho_spec({3,4,3,4}) <= 13/21 = 0.6190 < 1`, certifying `lambda_gap >= 8/21 = 0.3810 > 0` (`481/481` `BigInt` docks checked). This upper bound on `rho_spec` is bracketed from below by Rayleigh-Ritz **lower bounds on `rho_spec`** (`0.3782` exact zero-extrapolation on the `R = 4` ball and `0.4435` recurrence-extrapolated asymptotic radial compression, giving `lambda_gap <= 0.5565`).
- **Exact 4D `D_4` reflection positivity and isotropy (`E-FND-0189`, `Vibe/Geometry.lean`):** Exact 256-component `D_4` $O(a^4)$ isotropy (defect `0`) and exact 4D `D_4` `x_0 = 0` site-hyperplane reflection positivity (`S = S_+ + S_0 + Theta S_+`, `0` straddling triangles across `2,592` slab translates, `1,196 <-> 1,196` half-space pairs plus `200` in-hyperplane `S_0` triangles).
- **Rigorous multi-plaquette Kotecký-Preiss convergence (`E-FND-0189`, `E-FND-0190`):** Including self-overlap (`d_p = 21`, `Delta_p = 22`) and minimal closed polymers (`n_min = 4`) gives `A_KP = 0.009369`, `beta_OS_KP(Z_3) = 0.009348`, `beta_OS_KP(SU(3)) = 0.009328` (full 27-irrep Weyl sum agreeing with Seiler sup-norm to `4.86e-14`), and `beta_OS_KP(SU(2)) = 0.009337` (full 29-irrep activity sum), with walk-ceiling-safe cluster-expansion gap lower bounds (`m_KP in [0.156, 2.237]` for `Z_3` and `[0.154, 2.237]` for `SU(3)` on `beta in [0.001, 0.008]`).
- **4D `SU(2)` Migdal-Kadanoff / Tomboulis hierarchical RG contrast (`E-FND-0190` Sec 2):** Exact 29-irrep evaluation of the 4D `SU(2)` Tomboulis / Migdal-Kadanoff character-expansion RG drives `beta_0 in [0.5, 10]` (`1,071x` above `beta_OS_KP`) into KP in `k* = 1..10` (`k* = 2..10`, `R^2 = 0.9965` across `beta_0 in [2, 10]`), contrasting with gapless `U(1)` Coulomb freeze (`u_1(40) = 0.9492`, `beta_eff = 9.58`). **Caveat:** Migdal-Kadanoff / Tomboulis bond-moving gives only a convexity upper bound (`Z_exact <= Z_MK`), leaving the non-decimated overlap remainder uncontrolled.
- **Exact Bakry-Émery Ricci curvature and APE smearing (`E-FND-0190` Sec 3, `E-FND-0189`):** In `<X, Y> = Tr(X^dagger Y)`, `Ric(SU(2)) = 1.0` and `Ric(SU(3)) = 1.5` vs `Ric(U(1)) = 0` (`beta_BE = 1/12, 3/16, 0`, 4th-order finite-difference Hessian err `<= 2.21e-10`), certifying a uniform Log-Sobolev inequality / Langevin spectral gap (and implying exponential spatial decay of Euclidean correlations below `beta_BE` via the Helffer-Sjöstrand / Combes-Thomas Witten-Laplacian representation), alongside gauge-covariant polar-projected APE link smearing and a 2-loop EFT bridge to $\Lambda_{\mathrm{QCD}}$.

We state explicitly that this does **not** solve the Clay Millennium flat-$\mathbb{R}^4$ $a \to 0$ continuum Yang-Mills existence and mass-gap problem, and microscopic emergence of dynamical `SU(3)_C` and `SU(2)_L` gauge bosons from the bare QCA remains open.

## What Does NOT Work Yet (Open Frontiers and Active Tensions)

- **Sustained 4D self persistence, system-building, and value arrow (`B-19`, `B-50`, `B-54`):** `E-SLF-0200` gives `c(2) = 0.1090 << 0.50` on `R = 3` (its 28-beat bath test runs on a 1D line), `B-50` has zero passing tests, and `E-FND-0184`/`0187` show only a 1-beat `C`-asymmetry flash decaying `4x` by beat 2 rather than a sustained subject-level arrow.
- **Dynamical non-Abelian weak and strong gauge bosons on `{3,4,3,4}` (`B-23`, `B-55`):** `ODD` is silent below 4 excitations/dock, `E-FND-0187` carries only static `Z_3` link phases, and `E-SPN-0222`'s 1D depth-24 unitary domain wall carries an exact Right-handed mirror on `D >= 21` and is not coupled into dynamical chiral gauge fields on the 24-slot honeycomb knit.
- **Lorentz invariance and the `46x` QCA-vs-beam speed gap (`B-41`):** Synchronous global-beat evolution, unexecuted staircase re-slicing (`board-0036`), untested 4D Hořava khronon (`alpha_1, alpha_2`) and radiative percolation, plus a `46x` mismatch between `E-RLT-0124`'s `M_pair(ζ_18)` floor-0 Dirac speed (`0.021267`) and `E-RLT-0125`'s canonical single-face warped-beam speed (`0.977925`).
- **Dynamical spin-2 gravitational backreaction and derivation of `w(D) = 1 / N_D^2` (`B-14`, `B-15`, `B-52`):** No bare QCA run yet produces metric curvature, horizon formation, or vertex-transitivity-breaking `1 / N_D^2` beam weighting without injected potentials or prescribed metrics.
- **Dynamical stabilization of $D_\Lambda \approx 97$ (`B-18`, `B-42`):** Bare fixed-background horosphere drift gives `H_dS = 0.29808 beat^-1` (`0.088 M_Pl`, `18/1/5` Grover tree) and `0.51713 beat^-1` (`0.153 M_Pl`, `F-G(pi)` control), sitting `~61` orders of magnitude above late-time `H_0` (`122` orders of magnitude in vacuum energy `Lambda ~ H^2`).
- **Unfactored `~18^R` many-body scaling, non-amenable thermodynamics (`B-22`), and dynamical open-line Tsirelson saturation (`B-08`):** Few-body lazy stepping reaches `r = 4, 5`, while many-body interior thermodynamics and unentangled open-line saturation remain open.
- **Posited Born measure (Key 8 / Decision `007` C):** Squared-amplitude weighting over record branches is posited operationally, never claimed as an unconditional derivation from unitary dynamics.
- **Five explicit cross-sector EFT tensions tracked live in `E-FND-0188` (`13` checks = `3` structural zero-fit checks + `10` fitted/continuum-GR consistency checks + `5` active tensions):**
  1. `inflation-vs-axion-isocurvature`: `E-CSM-0067` `H_infl = 1.50e13 GeV` exceeds `E-FRC-0331`'s pre-inflationary `N_DW = 3` axion bound (`H_infl < 9.9e6 GeV`) by a factor of `1.51e6`, while `N_DW = 3 > 1` blocks an unbiased post-inflationary escape.
  2. `minimal-10H-126barH-light-down-quark-pull`: `E-FRC-0330` at `M_GUT` misses light down quarks (`m_d -41%`, `m_s +70%`, `chi^2 = 87.97`), while adding `120_H` in `E-FRC-0332` (`chi^2 = 0.565`, `< 3%` max pull) uses `14` continuous plus `11` discrete `Z_9` exponents (`9^11` basins) with synthetic `2%-12%` weights over 18 measured observables and omits `120_H` from Part 2's toy Hessian and 2-loop RGEs.
  3. `zero-fit-alpha0-residual`: under canonical single-face `K_eff = 1.012532`, the non-compact `mu = pi/a` `D_4` BLM ansatz (omitting the negative `-17.91` compact Wilson tadpole) leaves a `-6.06%` zero-fit `alpha^{-1}(0)` residual (`128.73` vs `137.036`) before heavy `Spin(10)` thresholds (`[0.291, 1.346]`).
  4. `dm-budget-and-rge-impact`: `E-CSM-0066` `484.35 GeV` WIMP and `E-FRC-0331` axion must share the `Omega_DM h^2 = 0.1200` budget and account for extra-multiplet 2-loop beta shifts.
  5. `mps-scale-alignment`: legacy standalone `E-FRC-0327` (`M_PS = 1.44e16 GeV`) is superseded by unified `M_PS = 1.434e11 GeV` in `E-FRC-0328`/`0330`/`0331`/`0332`.

## Repository Layout and Negative-Result Discipline

[`test/registry.csv`](test/registry.csv), [`test/mesh.csv`](test/mesh.csv), and [`test/catalog.csv`](test/catalog.csv) are synchronized 1-to-1 at exact **`1,790` canonical rows** (`0` duplicates, `0` orphans, `0` diffs). That number is a **cumulative research archive**, not a scoreboard: retired rules, failed self-keeping runs, negative controls, and early flat-box explorations stay intact in git alongside the curated Tier A/B/C runs above.

- [`test/universe.ts`](test/universe.ts): standalone, zero-import, pure-`BigInt` core Tier A microscopic QCA (Prettier- and ESLint-formatted top-down, `< 0.2 s`)
- [`code/proof/Vibe/`](code/proof/Vibe/): 6 zero-dependency Lean `4.35.0` proof modules plus root aggregator `Vibe.lean` (`pnpm check:lean`, fail-closed)
- [`code/`](code/): Coxeter `{3,4,3,4}` engine, exact cyclotomic QCA rules, operators, and measurement library
- [`test/experiment/`](test/experiment/): deterministic registered experiments (`pnpm rerun E-GRV-0163`, `pnpm rerun E-FND-0190`)
- [`text/0018-emergent-physics-on-the-fixed-honeycomb/`](text/0018-emergent-physics-on-the-fixed-honeycomb/): LaTeX source for Paper `0018`
- [`note/experimental-methodology.md`](note/experimental-methodology.md) and [`note/architecture.md`](note/architecture.md): grading rubric, controls, and codebase map

Licensed under MIT ([`LICENSE`](LICENSE)) for code and CC-BY-4.0 for written results and figures.

## Project Links

Project overview and interactive notes live at [clue.surf/vibe](https://clue.surf/vibe). Every experiment and Lean proof in this repository tests strictly discrete mathematical and physical structure.
