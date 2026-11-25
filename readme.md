# Vibe

A deterministic, reversible ternary quantum cellular automaton on the infinite 4D `{3,4,3,4}` hyperbolic honeycomb of regular 24-cells, evolving exact cyclotomic amplitudes in `ℤ[ζ_9][1/6]` with zero floats and zero PRNGs. Every positive result, effective-theory compatibility check, and negative control stays in git under a strict three-tier boundary separating bare QCA runs from background-field bridges and continuum EFT benchmarks.

**[clue.surf/vibe](https://clue.surf/vibe)** · **[Paper (Zenodo)](https://zenodo.org/records/24503628)** (*A Reversible Ternary Quantum Cellular Automaton on the 4D `{3,4,3,4}` Honeycomb*, Nov 24, 2026) · **[`@cluesurf/vibe` on npm](https://www.npmjs.com/package/@cluesurf/vibe)**

## 5-Second Quick Start

```sh
git clone https://github.com/cluesurf/vibe.git && cd vibe
npx tsx test/universe.ts        # ~50 ms, zero-import pure BigInt {3,4,3,4} QCA (no install needed)
pnpm install && pnpm check:lean # fail-closed: 94 Lean 4.35.0 theorems via lake build + #print axioms (pass --no-build if Lean 4.35.0 is not installed locally)
```

## The Core Tier A Microscopic Model in One Exact File (`test/universe.ts`)

Every dock of `{3,4,3,4}` carries 24 directional slots along the roots of $D_4$ (12 antipodal lines), each holding a signed ternary tone in `{-1, 0, +1}` with a 9-state role index above the neutral (quiescent) mesh state $|V_1\rangle$. One reversible beat advances exact `ℤ[ζ_9][1/6]` amplitudes by:

$$U = S \circ K \circ \Phi_{\mathrm{odd}} \circ M_{\mathrm{pair}}(\zeta_{18}) \circ D \circ M_{\mathrm{meet}} \circ D$$

Here $\Phi_{\mathrm{odd}}$ is implemented as `ODD` in code, and $D \circ M_{\mathrm{meet}} \circ D$ is symmetric Strang splitting around the role-pair meeting gate so lone excitations see $D^2 = C$. [`test/universe.ts`](test/universe.ts) runs this exact trivial-gauge core Tier A QCA kernel (Tier B `Sigma(648)` gauge links, multi-line `w_P` dock stores, and palindromic `ODD` live in [`code/rule/`](code/rule/)).

Running `npx tsx test/universe.ts` executes the entire zero-import, Prettier- and ESLint-formatted core kernel in `~55 ms` with pure `BigInt` arithmetic, verifying `D_4` rank-4 `SO(4)` isotropy (`12 = 3 * 4`, defect `0n`), exact `{3,4,3,4}` Coxeter shells `[1, 24, 456]` (`inconsistentSteps = 0`), stationarity of the neutral mesh state $|V_1\rangle$, 1-vibe and identical-tone/identical-role 2-vibe evolution strictly past `R = 3` to `r = 4` (`-2B = 1154 > 198`), `M_pair(ζ_18)` with its equal-tone and equal-role guard, `Phi_odd` `chi_odd = 1`, live global `W(D_4)` rotation covariance (`R = diag(1, 1, -1, -1)`, `U(R|psi>) = R(U|psi>)` across 5 states, `covDiff = 0`), `normErr = 0n`, and exact memoryless reversal `revDiff = 0`.

[`test/universe.ts`](test/universe.ts) is structured top-down so the entry point, reversible beat, and six physical operators appear right at the top, followed by verification checks and the pure `Z[zeta_9]` and `SO(4,1; Z[sqrt(2)])` helpers:

```ts
const BEAT_LAYERS: readonly LayerOp[] = [
  applyHalfCoinD,          // 1. Half-coin D (Strang split)
  applyRoleMeet,           // 2. Like-sign role meeting M_meet
  applyHalfCoinD,          // 3. Second half-coin D (D^2 = C on lone lines)
  applyPairLineMixer,      // 4. W(F_4)-isotropic M_pair(zeta_18)
  applyOddChiralPhase,     // 5. Scale-4 chiral 4-body phase Phi_odd
  applyOppositeSignBounce, // 6. Opposite-sign bounce K (K^dag = K)
  applyStream,             // 7. Exact SO(4,1; Z[sqrt(2)]) stream S
]

function applyBeat(state: State): State {
  return BEAT_LAYERS.reduce((cur, layer) => layer(cur, false), state)
}

function applyBeatAdjoint(state: State): State {
  return [...BEAT_LAYERS]
    .reverse()
    .reduce((cur, layer) => layer(cur, true), state)
}
```

<details>
<summary>Complete formatted <code>test/universe.ts</code> (zero imports, pure BigInt, click to expand)</summary>

```ts
// Self-contained, zero-import, pure-BigInt core Tier A microscopic QCA kernel (trivial-gauge sector).
// Tier B Sigma(648) gauge links, multi-line w_P dock stores, and palindromic ODD live in code/rule/.
// Space: infinite 4D {3,4,3,4} hyperbolic honeycomb in exact SO(4,1) over Z[sqrt(2)].
// Amplitudes: exact cyclotomic ring Z[zeta_9][1/6] mod (z^6 + z^3 + 1 = 0). Zero floats, zero PRNG.
// Beat: U = S o K o Phi_odd o M_pair(zeta_18) o D o M_meet o D, with exact adjoint U^dag.

// =================================================================================================
// 1. Entry point and reversible 7-layer beat: U = S o K o Phi_odd o M_pair(zeta_18) o D o M_meet o D
// =================================================================================================

type Z9 = readonly [bigint, bigint, bigint, bigint, bigint, bigint]
type Root4 = readonly [bigint, bigint, bigint, bigint]
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

function main(): void {
  const startNs = process.hrtime.bigint()
  const [sumFourth, sumMixed] = verifyD4Isotropy()
  const shells = verifyHoneycombShells()

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

  const chiralVibes: Vibe[] = [
    [0, 0, 1, 0],
    [0, 1, -1, 0],
    [0, 4, 1, 0],
    [0, 10, 1, 0],
  ]
  const chiVal = chiralOrientationDock(chiralVibes, [0, 1, 2, 3])

  assertExact(chiVal !== 0, 'Phi_odd chiral orientation vanished')

  const chiralRun = verifyReversibleTrajectory(
    '4-vibe-chiral',
    basisKet(chiralVibes),
    1,
  )

  const covarianceStates: readonly State[] = [
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
  ]
  const covDiff = verifyGlobalWD4Covariance(covarianceStates)
  const elapsedMs = (process.hrtime.bigint() - startNs) / 1_000_000n

  console.log(
    [
      'Core Tier A Microscopic QCA (zero-import, pure BigInt, Z[zeta_9][1/6] on {3,4,3,4})',
      `  D_4 rank-4 SO(4) isotropy : sum r0^4=${sumFourth} = 3*sum r0^2 r1^2=3*${sumMixed} (defect=0n)`,
      `  {3,4,3,4} exact Coxeter   : shells=[${shells.join(', ')}], inconsistentSteps=${inconsistentSteps}`,
      `  V1 neutral quiescent mesh : U|V1> = |V1> exact (diff=0, normErr=0n)`,
      `  1-vibe (T=4 fwd + 4 back) : ${oneVibe.branches} branches, ${oneVibe.docks} docks, max -2B=${oneVibe.maxCosh2} (r=4 > R=3 max 198), normErr=0n, revDiff=0`,
      `  2-vibe pair (T=4 + back)  : ${pairRun.branches} branches, ${pairRun.docks} docks, M_pair 12-line scatter, max -2B=${pairRun.maxCosh2} (r=4 > R=3), normErr=0n, revDiff=0`,
      `  2-vibe neutral (T=2+back) : ${neutralRun.branches} branches, ${neutralRun.docks} docks, K-bounce exact (M_pair skipped), normErr=0n, revDiff=0`,
      `  4-vibe chiral (T=1+back)  : ${chiralRun.branches} branches, chi_odd=${chiVal} (Phi_odd zeta_6 active), normErr=0n, revDiff=0`,
      `  W(D_4) R=diag(1,1,-1,-1)  : U(R|psi>) = R(U|psi>) across ${covarianceStates.length} states (like/meet/neutral/chiral), covDiff=${covDiff}`,
      `  elapsed                   : ${elapsedMs} ms  ALL CHECKS PASSED`,
    ].join('\n'),
  )
}

function applyBeat(state: State): State {
  return BEAT_LAYERS.reduce((cur, layer) => layer(cur, false), state)
}

function applyBeatAdjoint(state: State): State {
  return [...BEAT_LAYERS]
    .reverse()
    .reduce((cur, layer) => layer(cur, true), state)
}

// =================================================================================================
// 2. The six unitary operators composing one reversible beat
// =================================================================================================

// Layer 1 & 3: Half-coin D (Strang-splits M_meet symmetrically; reduces to D^2 = C on lone lines).
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

// Layer 2: Same-sign role meeting M_meet on doubly-occupied antipodal lines.
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

// Layer 4: W(F_4)-isotropic pair-line mixer M_pair(zeta_18) on identical-tone, identical-role pairs.
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

// Layer 5: Scale-4 chiral 4-body phase Phi_odd (silent on fewer than 4 excitations per dock).
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

// Layer 6: Opposite-sign collision bounce K (self-adjoint involution K^dag = K).
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

// Layer 7: Deterministic antipodal stream S across the 24 octahedral facets of {3,4,3,4}.
function applyStream(state: State, dag: boolean): State {
  return mapConfigurations(state, (vibes, amp) => [
    vibes.map(([dock, slot, tone, role]) => {
      const dir = dag ? OPPOSITE_SLOT[slot]! : slot

      return [stepDock(dock, dir), slot, tone, role] as const
    }),
    amp,
  ])
}

const BEAT_LAYERS: readonly LayerOp[] = [
  applyHalfCoinD,
  applyRoleMeet,
  applyHalfCoinD,
  applyPairLineMixer,
  applyOddChiralPhase,
  applyOppositeSignBounce,
  applyStream,
]

// =================================================================================================
// 3. Exact self-verification checks (isotropy, shells, unitarity, reversal, W(D_4) covariance)
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

function verifyHoneycombShells(): readonly number[] {
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

  return shells
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
    state = applyBeatAdjoint(state)
    assertExact(
      hasExactUnitNorm(state),
      `${label} adjoint norm at t=${t + 1}`,
    )
  }

  assertExact(
    countStateDiffs(state, initial) === 0 && state.den === initial.den,
    `${label} memoryless reversal failed`,
  )

  return { branches, maxCosh2, docks: visitedDocks.size }
}

function verifyGlobalWD4Covariance(states: readonly State[]): number {
  // Proper rotation R = diag(1, 1, -1, -1) in W(D_4), reversing line orientation on slots 20 <-> 23.
  const rotSlot = ROOTS.map(root =>
    ROOTS.findIndex(
      other =>
        other[0] === root[0] &&
        other[1] === root[1] &&
        other[2] === -root[2] &&
        other[3] === -root[3],
    ),
  )

  assertExact(
    rotSlot[20] === 23 && rotSlot[23] === 20,
    'W(D_4) proper rotation did not swap line orientation',
  )

  const rotateDock = (dock: number): number => {
    if (dock === 0) {
      return 0
    }

    const [parentDock, parentSlot] = dockParent[dock]!

    return stepDock(rotateDock(parentDock), rotSlot[parentSlot]!)
  }

  const rotateState = (state: State): State =>
    mapConfigurations(state, (vibes, amp) => [
      vibes.map(([dock, slot, tone, role]) => [
        rotateDock(dock),
        rotSlot[slot]!,
        tone,
        role,
      ]),
      amp,
    ])

  let totalDiff = 0

  for (const state of states) {
    totalDiff += countStateDiffs(
      applyBeat(rotateState(state)),
      rotateState(applyBeat(state)),
    )
  }

  assertExact(
    totalDiff === 0,
    `W(D_4) covariance failed with diff=${totalDiff}`,
  )

  return totalDiff
}

// =================================================================================================
// 4. State, branching, and chiral-orientation helpers
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

function chiralOrientationDock(
  vibes: readonly Vibe[],
  indices: readonly number[],
): number {
  let chi = 0

  for (let i = 0; i < indices.length; i++) {
    for (let j = i + 1; j < indices.length; j++) {
      for (let k = j + 1; k < indices.length; k++) {
        for (let l = k + 1; l < indices.length; l++) {
          const quad = [
            vibes[indices[i]!]!,
            vibes[indices[j]!]!,
            vibes[indices[k]!]!,
            vibes[indices[l]!]!,
          ]
          const geomMatrix = quad.map(v => ROOTS[v[1]]!)
          const attrMatrix = quad.map(v => {
            let sumDot = 0n
            let sumDotSq = 0n

            for (const other of quad) {
              const d = dot4(ROOTS[v[1]]!, ROOTS[other[1]]!)

              sumDot += d
              sumDotSq += d * d
            }

            return [1n, BigInt(v[2]), sumDot, sumDotSq] as const
          })
          const signVal = detBigInt(geomMatrix) * detBigInt(attrMatrix)

          if (signVal > 0n) {
            chi++
          } else if (signVal < 0n) {
            chi--
          }
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
// 6. Exact 24-root D_4 dock geometry and infinite {3,4,3,4} Coxeter engine in SO(4,1; Z[sqrt(2)])
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

function dotQ2(u: readonly Q2[], v: readonly Q2[]): Q2 {
  return u.reduce<Q2>(
    (sum, entry, idx) => addQ2(sum, mulQ2(entry, v[idx]!)),
    Q2_ZERO,
  )
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

// Central inversion Z fixing c_0 and negating its 4D tangent space.
const CENTRAL_INVERSION: readonly (readonly Q2[])[] = DIM5.map(i =>
  DIM5.map(j => [
    (j === 4 ? 2n * BASE_CENTER[i]![0] : 0n) - (i === j ? 1n : 0n),
    j === 4 ? 2n * BASE_CENTER[i]![1] : 0n,
  ]),
)

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

// Lazy on-the-fly infinite {3,4,3,4} Coxeter graph discovery.
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

Every current-rule experiment sits in one of three canonical tiers (identical to Paper `0018` v2) so nothing built with an imposed effective measure or textbook continuum PDE is confused with a bare cellular automaton derivation:

| Tier | Scope | What Actually Runs | Canonical Runs |
| :--- | :--- | :--- | :--- |
| **Tier A: Microscopic QCA and Exact `{3,4,3,4}` Geometry** | Bare rule and Coxeter honeycomb only | Runs exact `SO(4,1)` over `Z[sqrt(2)]` honeycomb geometry or the bare `Z[zeta_9][1/6]` QCA (`U = S o K o Phi_odd o M_pair(zeta_18) o D o M_meet o D`) with zero continuum PDEs and zero injected potentials. `E-QTM-0205` checks algebraic envariance prerequisites under the operationally posited Born measure, and `Vibe/Gauge.lean` inside `E-FND-0185` is noted separately as finite EFT algebra | [`test/universe.ts`](test/universe.ts), `E-GMT-0044` to `E-GMT-0046`, `E-RLT-0122`, `E-HLG-0043` (3D column-sum projection non-closure), `E-FND-0038`, `E-FND-0181` to `E-FND-0185`, `E-SPN-0220`, `E-QTM-0117`, `E-QTM-0202` to `E-QTM-0205`, `E-SLF-0189` to `E-SLF-0200`, `E-RLT-0123`, `E-RLT-0124` |
| **Tier B: Effective Column and Prescribed Background-Field Encodings** | Imposed measure or prescribed fields on `{3,4,3,4}` / L1 quantum models | Uses exact `{3,4,3,4}` balls, the imposed `w(D) = 1 / N_D^2` cusp column with canonical unaliased single-face `{4,3,4}` lateral links `[1, 4, 20, 100]` (cumulative `5^D = [1, 5, 25, 125]`, giving `K_eff = 1.012532`, `G_eff = 0.078593`, `c_u = 0.977925`, matching `Vibe/Geometry.lean`, with the aliased `period = 2` torus `[1, 10, 40, 200]` kept as control `1.031237 / 0.077167 / 0.986916`), or L1 state-vector models. **`E-GRV-0163` (`L2`) is a prescribed-background bijective Gullstrand-Painlevé split-step QCA `U_b = (S_river)^{m_b} S_light W(theta)` (`P = 45` beats: horizon `v_r(out) = +0.00016`, `v_r(in) = -1.95572`, trapped interior `r_areal = 0.6944 r_s < r_s` sending both orthogonal rays strictly inward at `v_r(out) = -0.19984` and `v_r(in) = -2.15572`, `0n` norm err, `0` rev diff, `(0n, 0n)` orthogonality on `45/45` beats), NOT emergent General Relativity.** `E-QTM-0206` runs genuine `(1+4)`-qubit (`dim = 32`) and `(2+8)`-qubit (`dim = 1024`) partial traces (`I(S:F_j) = 1.000000`, `CHSH = 2.825774` vs `1.421875`) | `E-QTM-0206`, `E-QTM-0207` (L1 10-qubit scrambler, Bogoliubov identity, MITM on prepared singlet), `E-RLT-0125`, `E-GRV-0134`, `E-GRV-0136`, `E-GRV-0154` to `E-GRV-0159`, `E-GRV-0162`, `E-GRV-0163`, `E-SPN-0221`, `E-SPN-0222`, `E-FRC-0322`, `E-FRC-0323`, `E-CSM-0064`, `E-CSM-0065` (Part A = Tier B, Part B = Tier C, marked `B+C`), `E-FND-0186`, `E-FND-0187` |
| **Tier C: Downstream Continuum EFT and Flat `D_4` Lattice Checks** | Not derived from the bare automaton | Assumes textbook continuum GR, `SO(10)` / Pati-Salam QFT, Starobinsky inflation, BBN, or flat 4D Euclidean `D_4` lattice gauge theory (`['eft-continuum']` / `['d4-box']`) and tests compatibility against `{3,4,3,4}` geometric invariants (`b = 6034/330`, `K_eff`, `c_u`, `Spin(10)`, `Z[zeta_9]`). `E-FND-0190` Sec 1 proves exact `{3,4,3,4}` spectral geometry while Sec 2 and Sec 3 are 4D lattice Yang-Mills bounds | `E-GRV-0160`, `E-GRV-0161`, `E-FRC-0324` to `E-FRC-0332` (`E-FRC-0332`: `Z_36` PQ `d_min = 18/36`, `SO(10)` Higgs Hessian, `120_H` flavor `chi^2: 87.97 -> 0.565`, `< 3%` max pull), `E-CSM-0065` (Part B), `E-CSM-0066` to `E-CSM-0068`, `E-FND-0188` (`13` checks = `5` zero-fit predictions + `8` consistency checks + `5` active tensions, live `E-GRV-0163` `L2`), `E-FND-0189`, `E-FND-0190` |

## Machine-Checked Lean `4.35.0` Core Suite (`code/proof/Vibe/`)

[`code/proof/Vibe.lean`](code/proof/Vibe.lean) aggregates **94 substantive headline theorems** across 7 zero-dependency modules (`Vibe.lean`, `Tone.lean`, `Algebra.lean`, `Rule.lean`, `Geometry.lean`, `Gauge.lean`, `Limits.lean`), with `113` public declarations including `19` exported algebraic helpers in `Algebra.lean`, `70` `private theorem` internal helpers, `0` trivial arithmetic tautologies, `0 sorry`, `0 axiom`, `0 native_decide`, `0 unsafe`, and `0 implemented_by`. `pnpm check:lean` is **fail-closed**: it requires Lean `4.35.0` locally (or in `.github/workflows/lean.yml`) to execute a real `lake build` (9 jobs, exit `0`, `0` warnings) and `#print axioms` across all `113/113` public theorems (`Classical.choice`, `propext`, `Quot.sound` only), exiting `1` if Lean `4.35.0` is unavailable unless `--no-build` is explicitly passed.

- **QCA and lattice theorems (`Tone`, `Algebra`, `Rule`, `Geometry`, `Limits`):** concrete 24-slot `DockState`/`V1` stationarity, full `8 x 8` `F-G` matrix unitarity, elementary 2-adic `SU(2)`/`PSU(2)` infinite order, symbolic `StarCommRing` `M_pair(u)` unitarity and eigenstates, explicit 24-vector `D_4` 256-component rank-4 `SO(4)` isotropy (`O(a^4)`) plus zero-straddling-triangle 4D `D_4` site-hyperplane reflection positivity (`S = S_+ + S_0 + Theta S_+`), verified canonical single-face `cuspLateralLinks` `[1, 4, 20, 100]` proving `K_eff < M_eff` directly, arbitrary-word `Mat2Eis` unitarity over `{M, M2, M†, M2†}`, concrete `3 x 3` `Z_3` transfer-matrix spectral gap, and `B^T B` Gram positivity.
- **Finite algebraic EFT checks (`Gauge`, `Limits`, explicitly distinct from QCA proofs):** `Spin(10)` 16-spinor anomaly sums, Weinberg `3/8`, `3 x 3` Koide warp lower bound, electroweak `m_gamma = 0` and custodial `rho = 1`, `colorWeight` axion `E/N = 8/3`, and `Z_N` modular PQ operator-dimension divisibility (`d >= N / gcd(N, q)`).

## Discrete `{3,4,3,4}` / `D_4` vs the Clay Millennium Yang-Mills Problem

On the discrete `{3,4,3,4}` honeycomb and flat 4D Euclidean `D_4` lattice, our constructive suite (`E-FND-0189`, `E-FND-0190`, and [`code/proof/Vibe/`](code/proof/Vibe/)) establishes discrete UV finiteness (`vibeDiscreteUvFinite: true`) alongside exact spectral and lattice-gauge bounds:

- **Certified global `{3,4,3,4}` spectral gap (`E-FND-0190` Sec 1):** An unconditional global Busemann Schur-test **upper bound** on the full infinite `{3,4,3,4}` honeycomb proves `rho({3,4,3,4}) <= 13/21 = 0.6190 < 1`, certifying `lambda_gap >= 8/21 = 0.3810 > 0` (`481/481` `BigInt` docks checked), paired with the matching Rayleigh-Ritz **lower bound** (`0.3782` on the exact `R = 4` ball and `0.4435` asymptotic radial).
- **Exact 4D `D_4` reflection positivity and isotropy (`E-FND-0189`, `Vibe/Geometry.lean`):** Exact 256-component `D_4` $O(a^4)$ isotropy (defect `0`) and exact 4D `D_4` `x_0 = 0` site-hyperplane reflection positivity (`S = S_+ + S_0 + Theta S_+`, `0` straddling triangles across `2,592` slab translates, `1,196 <-> 1,196` half-space pairs plus `200` in-hyperplane `S_0` triangles).
- **Rigorous multi-plaquette Kotecký-Preiss convergence (`E-FND-0189`, `E-FND-0190`):** Including self-overlap (`d_p = 21`, `Delta_p = 22`) and minimal closed polymers (`n_min = 4`) gives `A_KP = 0.009369`, `beta_OS_KP(Z_3) = 0.009348`, `beta_OS_KP(SU(3)) = 0.009328` (full 27-irrep Weyl sum agreeing with Seiler sup-norm to `4.86e-14`), and `beta_OS_KP(SU(2)) = 0.009337` (full 29-irrep activity sum), with walk-ceiling-safe cluster-expansion gap lower bounds (`m_KP < -ln(M) - ln(21)`).
- **4D `SU(2)` Migdal-Kadanoff / Tomboulis hierarchical RG contrast (`E-FND-0190` Sec 2):** Exact 29-irrep evaluation of the 4D `SU(2)` Tomboulis / Migdal-Kadanoff character-expansion RG (`k* = 1..10`, `R^2 = 0.9965` across `beta_0 = 2..10`, `1,071x` above `beta_OS_KP`) contrasts sharply against gapless `U(1)` Coulomb freeze. **Caveat:** Migdal-Kadanoff / Tomboulis bond-moving gives only a convexity upper bound (`Z_exact <= Z_MK`), leaving the non-decimated overlap remainder uncontrolled.
- **Exact Bakry-Émery Ricci curvature and APE smearing (`E-FND-0190` Sec 3, `E-FND-0189`):** `Ric(SU(2)) = 1.0` and `Ric(SU(3)) = 1.5` vs `Ric(U(1)) = 0` (`beta_BE = 1/12, 3/16, 0`, 4th-order finite-difference Hessian err `<= 2.21e-10`), gauge-covariant polar-projected APE link smearing, and a 2-loop EFT bridge to $\Lambda_{\mathrm{QCD}}$.

We state explicitly (`clayMillenniumSolved: false`) that this does **not** solve the Clay Millennium flat-$\mathbb{R}^4$ $a \to 0$ continuum Yang-Mills existence and mass-gap problem, and microscopic emergence of dynamical `SU(3)_C` and `SU(2)_L` gauge bosons from the bare QCA remains open.

## What Does NOT Work Yet (Open Frontiers and Active Tensions)

- **Sustained 4D self persistence, system-building, and value arrow (`B-19`, `B-50`, `B-54`):** `E-SLF-0200` gives `c(2) = 0.1090 << 0.50` on `R = 3` (its 28-beat bath test runs on a 1D line), `B-50` has zero passing tests, and `E-FND-0184`/`0187` show only a 1-beat `C`-asymmetry flash decaying `4x` by beat 2 rather than a sustained subject-level arrow.
- **Dynamical non-Abelian weak and strong gauge bosons on `{3,4,3,4}` (`B-23`, `B-55`):** `ODD` is silent below 4 vibes/dock, `E-FND-0187` carries only static `Z_3` link phases, and `E-SPN-0222`'s unitary cusp domain wall is not yet coupled into the 24-slot bipartite honeycomb knit.
- **Lorentz invariance and the `46x` QCA-vs-column speed gap (`B-41`):** Synchronous global-beat evolution, unexecuted staircase re-slicing (`board-0036`), untested 4D Hořava khronon (`alpha_1, alpha_2`) and radiative percolation, plus a `46x` mismatch between `E-RLT-0124`'s `M_pair(ζ_18)` Dirac speed (`0.021267`) and `E-RLT-0125`'s canonical single-face warped-column speed (`0.977925`).
- **Dynamical spin-2 gravitational backreaction and derivation of `w(D) = 1 / N_D^2` (`B-14`, `B-15`, `B-52`):** No bare QCA run yet produces metric curvature, horizon formation, or vertex-transitivity-breaking `1 / N_D^2` column weighting without injected potentials or prescribed metrics.
- **Dynamical stabilization of $D_\Lambda \approx 97$ (`B-18`, `B-42`):** Bare fixed-background horosphere drift gives Planck-scale `H_inf = 0.517 M_Pl`, `122` orders of magnitude above late-time dark energy.
- **Unfactored `~18^R` many-body scaling, non-amenable thermodynamics (`B-22`), and dynamical open-line Tsirelson saturation (`B-08`):** Few-body lazy stepping reaches `r = 4, 5`, while many-body interior thermodynamics and unentangled open-line saturation remain open.
- **Posited Born measure (Key 8 / Decision `007` C):** Squared-amplitude weighting over record branches is posited operationally, never claimed as an unconditional derivation from unitary dynamics.
- **Five explicit cross-sector EFT tensions tracked live in `E-FND-0188` (`13` checks = `5` zero-fit predictions + `8` consistency checks + `5` active tensions):**
  1. `inflation-vs-axion-isocurvature`: `E-CSM-0067` `H_inf = 1.52e13 GeV` exceeds `E-FRC-0331`'s pre-inflationary `N_DW = 3` axion bound (`H_inf < 9.9e6 GeV`) by `1.5e6x`.
  2. `minimal-10H-126barH-light-down-quark-pull`: `E-FRC-0330` misses light down quarks (`m_d -41%`, `m_s +70%`, `chi^2 = 87.97`), resolved in Tier C by adding antisymmetric `120_H` in `E-FRC-0332` (`chi^2 = 0.565`, `< 3%` max pull).
  3. `zero-fit-alpha0-residual`: bare/matched zero-fit `alpha^{-1}(0)` leaves a `-4.71%` residual (`130.58` vs `137.036`) before heavy `SO(10)` thresholds.
  4. `dm-budget-and-rge-impact`: `E-CSM-0066` WIMP and `E-FRC-0331` axion must share the `Omega_DM h^2 = 0.1200` budget and account for extra-multiplet 2-loop beta shifts.
  5. `mps-scale-alignment`: legacy standalone `E-FRC-0327` (`M_PS = 1.44e16 GeV`) is superseded by unified `M_PS = 1.434e11 GeV` in `E-FRC-0328`/`0330`/`0331`/`0332`.

## Repository Layout and Negative-Result Discipline

[`test/registry.csv`](test/registry.csv), [`test/mesh.csv`](test/mesh.csv), and [`test/catalog.csv`](test/catalog.csv) are synchronized 1-to-1 at exact **`1,790` canonical rows** (`0` duplicates, `0` orphans, `0` diffs). That number is a **cumulative research archive**, not a scoreboard: retired rules, failed self-keeping runs, negative controls, and early flat-box explorations stay intact in git alongside the curated Tier A/B/C runs above.

- [`test/universe.ts`](test/universe.ts): standalone, zero-import, pure-`BigInt` core Tier A microscopic QCA (Prettier- and ESLint-formatted top-down, `~55 ms`)
- [`code/proof/Vibe/`](code/proof/Vibe/): 7-module Lean `4.35.0` core proof suite (`pnpm check:lean`, fail-closed)
- [`code/`](code/): Coxeter `{3,4,3,4}` engine, exact cyclotomic QCA rules, operators, and measurement library
- [`test/experiment/`](test/experiment/): deterministic registered experiments (`pnpm rerun E-GRV-0163`, `pnpm rerun E-FND-0190`)
- [`text/0018-emergent-physics-on-the-fixed-honeycomb/`](text/0018-emergent-physics-on-the-fixed-honeycomb/): LaTeX source for Paper `0018` v2
- [`note/experimental-methodology.md`](note/experimental-methodology.md) and [`note/architecture.md`](note/architecture.md): grading rubric, controls, and codebase map

Licensed under MIT ([`LICENSE`](LICENSE)) for code and CC-BY-4.0 for written results and figures.

## Background and Interpretive Frame (Unfalsifiable Axiom)

The project is motivated by a Russellian-monist hypothesis: that the discrete bulk state represents intrinsic experience while 3D physics is read on a flat horospheric boundary. That metaphysical premise is explicitly unfalsifiable, held strictly as an interpretive frame rather than a scientific conclusion, and every experiment and Lean proof in this repository tests mathematical structure, never feeling. Background reading and media live at [clue.surf/vibe](https://clue.surf/vibe), the companion [book](https://www.amazon.com/dp/1951702743), and a short [audio overview](https://www.youtube.com/watch?v=9ftVzOO9Y2I).
