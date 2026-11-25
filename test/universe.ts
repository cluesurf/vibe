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
