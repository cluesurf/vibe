// THE BARE BEAT U AS A LIBRARY (item vibe-computation-models-0029, Q0; decision 004 of vibe/computation/models).
// A port of the self-contained script test/universe.ts, which exports nothing and stays unchanged. The arithmetic is
// the script's, line for line: every layer, the branching denominators, the ring Z[zeta_9][1/6] (mod z^6 + z^3 + 1),
// the {3,4,3,4} Coxeter engine in O^+(4,1; Z[sqrt 2]) and the chi_odd orbit sign. E-CMP (bare-beat-lab) gates that
// this module reproduces the script's printed report byte for byte and its amplitudes on its own seeds.
//
//   U = S o Phi_odd o D o M_meet o M_pair(zeta_18) o K o D o Phi_odd     (palindromic, 8 layers, exact adjoint U^dag)
//
// What changed against the script, none of it arithmetic:
//   - exports (below), and main() became universeReport(), which returns the script's lines without the timing line;
//   - the lazily discovered dock tables sit in one record so withFreshMesh can run a computation on a fresh mesh, with
//     the dock ids the script would assign, and restore the shared one after;
//   - three integer max / min / abs calls of the host Math object became plain integer comparisons (no Math call in a
//     quantum module, decision 004 point 3);
//   - adapters to code/algebra/ninth-field (Ninth, a number of Q(zeta_9)) and a few read-only accessors.
//
// EXPORTED API (stable names; code/compute/quantum/ builds on them):
//   types      Z9 (six bigint coefficients on 1, z, ..., z^5), Tone, Vibe = [dock, slot, tone +-1, role 0 | 1],
//              BeatState = { amp: Map<configKey, Z9>, den } (amplitude = amp / den, den a product of 2s and 3s),
//              LayerOp, TrajectorySummary, WF4Group, CovarianceSummary, DiscreteSymmetrySummary
//   the beat   applyBeat, applyBeatInverse, applyBeats(state, beats), applyBeatsInverse(state, beats),
//              BEAT_LAYERS (execution order), BEAT_LAYER_NAMES, and the six layers applyOddChiralPhase,
//              applyHalfCoinD, applyOppositeSignBounce, applyPairLineMixer, applyRoleMeet, applyStream
//   states     basisKet, superpose (a list of [vibes, Ninth] into one BeatState), encodeConfig, decodeConfig,
//              countStateDiffs, hasExactUnitNorm, amplitudeOf (Ninth), stateToNinth, mapConfigurations,
//              mapStateBySlotPerm, slotPermFromDoubledMat4
//   ring       Z9_ZERO, Z9_ONE, Z9_OMEGA, Z9_ZETA6, Z9_ZETA18, Z9_COIN_DIAG, Z9_COIN_OFF, Z9_MEET_SWAP, ZETA6_POWERS,
//              addZ9, subZ9, scaleZ9, mulZ9, conjZ9, isZeroZ9, z9ToNinth, ninthToZ9
//   geometry   ROOTS, OPPOSITE_SLOT, LINES, LINE_OF_SLOT, WF4_GROUP, stepDock, lorentzCosh2, dockParityOf,
//              dockCount, dockCenterKey, inconsistentStepCount, withFreshMesh
//   geometries BeatGeometry ('3434' default, '3433' the flat D_4 control), BEAT_GEOMETRIES, withGeometry,
//              currentGeometry, flatCenterOf (item 0032, Q2; section 6 says what transfers and what does not)
//   closed     ClosedBeatMesh (congruence-3434 level m, torus-3433 side s), withClosedMesh, currentClosedMesh,
//              closedMeshName, closedMeshDocks, closedDockResidues (item 0039; section 8)
//   checks    chiral4Sign, chiralOrientationDock, verifyD4Isotropy, verifyHoneycombShells, verifyReversibleTrajectory,
//              verifyLowScaleAchiral, verifyGlobalWF4PlusCovariance, verifyDiscreteSymmetries, universeReport
//
// Every check throws 'FAIL: ...' when it fails (fail-closed). Dock ids are discovery order on the current mesh; compare
// states across meshes through dockCenterKey. DETERMINISM: no random numbers, no floating point.

import { type Ninth, ninth } from '@/code/algebra/ninth-field'

// =================================================================================================
// 1. Palindromic 8-layer beat:
//    U = S o Phi_odd o D o M_meet o M_pair(zeta_18) o K o D o Phi_odd
// =================================================================================================

export type Z9 = readonly [bigint, bigint, bigint, bigint, bigint, bigint]

type Root4 = readonly [bigint, bigint, bigint, bigint]
type Mat4Big = readonly (readonly [bigint, bigint, bigint, bigint])[]
type AntipodalLine = readonly [number, number]
type Q2 = readonly [bigint, bigint] // a + b * sqrt(2)

export type Tone = -1 | 0 | 1 // full ternary alphabet; 0 is the neutral quiescent mesh |V_1>
// Sparse nonzero excitation against the infinite neutral mesh |V_1> (all unlisted slots have tone 0).
export type Vibe = readonly [
  dock: number,
  slot: number,
  tone: Exclude<Tone, 0>,
  role: number,
]

export type BeatState = {
  readonly amp: Map<string, Z9>
  readonly den: bigint
}

type State = BeatState

type ActiveLine = readonly [
  idxA: number | undefined,
  idxB: number | undefined,
  slotA: number,
  slotB: number,
]

export type LayerOp = (state: State, dag: boolean) => State

export type TrajectorySummary = {
  readonly branches: number
  readonly maxCosh2: bigint
  readonly docks: number
}

export type WF4Group = {
  readonly elements: readonly Uint8Array[]
  readonly det: readonly number[]
}

export type CovarianceSummary = {
  readonly generatorCount: number
  readonly closureOrder: number
  readonly covDiff: number
}

export type DiscreteSymmetrySummary = {
  readonly tDiff: number
  readonly cpDiff: number
  readonly cptDiff: number
  readonly cViolChiral: number
  readonly pViolChiral: number
  readonly cViolX1: number
  readonly pViolX1: number
}

// The script's main(), on a fresh mesh, returning its printed lines without the final timing line (the script prints
// these eleven lines and then '  elapsed ... ms  ALL CHECKS PASSED').
export function universeReport(): string[] {
  return withFreshMesh(universeReportLines)
}

function universeReportLines(): string[] {
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

  return [
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
  ]
}

export function applyBeat(state: State): State {
  return BEAT_LAYERS.reduce((cur, layer) => layer(cur, false), state)
}

export function applyBeatInverse(state: State): State {
  return [...BEAT_LAYERS]
    .reverse()
    .reduce((cur, layer) => layer(cur, true), state)
}

// U^beats and (U^dag)^beats.
export function applyBeats(state: State, beats: number): State {
  let cur = state

  for (let t = 0; t < beats; t++) {
    cur = applyBeat(cur)
  }

  return cur
}

export function applyBeatsInverse(state: State, beats: number): State {
  let cur = state

  for (let t = 0; t < beats; t++) {
    cur = applyBeatInverse(cur)
  }

  return cur
}

// =================================================================================================
// 2. Six distinct unitary operators forming the palindromic eight-layer reversible beat:
//    U = S o Phi_odd o D o M_meet o M_pair(zeta_18) o K o D o Phi_odd
//    Note: M_meet, M_pair(zeta_18), and K mutually commute pairwise on the full Fock space,
//    so L = Phi_odd o D o (M_meet o M_pair o K) o D o Phi_odd satisfies K_conj R L R K_conj = L^dag.
// =================================================================================================

// Half-coin D (Strang-splits the middle block symmetrically; reduces to D^2 = C on lone lines).
export function applyHalfCoinD(state: State, dag: boolean): State {
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
export function applyRoleMeet(state: State, dag: boolean): State {
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
export function applyPairLineMixer(state: State, dag: boolean): State {
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
export function applyOddChiralPhase(state: State, dag: boolean): State {
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
export function applyOppositeSignBounce(state: State): State {
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
export function applyStream(state: State, dag: boolean): State {
  return mapConfigurations(state, (vibes, amp) => [
    vibes.map(([dock, slot, tone, role]) => {
      const dir = dag ? OPPOSITE_SLOT[slot]! : slot

      return [stepDock(dock, dir), slot, tone, role] as const
    }),
    amp,
  ])
}

// Execution order (right-to-left of U = S o Phi_odd o D o M_meet o M_pair(zeta_18) o K o D o Phi_odd):
export const BEAT_LAYERS: readonly LayerOp[] = [
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

export function verifyD4Isotropy(): readonly [bigint, bigint] {
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

export function verifyHoneycombShells(): readonly [readonly number[], number] {
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

export function verifyReversibleTrajectory(
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

export function slotPermFromDoubledMat4(
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

export function mapStateBySlotPerm(state: State, perm: Uint8Array): State {
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

export function verifyGlobalWF4PlusCovariance(
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

export function verifyDiscreteSymmetries(
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

export function basisKet(vibes: readonly Vibe[]): State {
  return { amp: new Map([[encodeConfig(vibes), Z9_ONE]]), den: 1n }
}

export function encodeConfig(vibes: readonly Vibe[]): string {
  return [...vibes]
    .sort((a, b) => a[0] - b[0] || a[1] - b[1])
    .map(v => v.join(':'))
    .join(';')
}

export function decodeConfig(key: string): Vibe[] {
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

export function hasExactUnitNorm(state: State): boolean {
  let normSq = Z9_ZERO

  for (const amp of state.amp.values()) {
    normSq = addZ9(normSq, mulZ9(conjZ9(amp), amp))
  }

  const target: Z9 = [state.den * state.den, 0n, 0n, 0n, 0n, 0n]

  return isZeroZ9(subZ9(normSq, target))
}

export function countStateDiffs(a: State, b: State): number {
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

export function mapConfigurations(
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
    (best, row) => (row.items.length > best ? row.items.length : best),
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
export function chiral4Sign(
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

export function verifyLowScaleAchiral(): readonly [number, number, number] {
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

export function chiralOrientationDock(
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

export const Z9_ZERO: Z9 = [0n, 0n, 0n, 0n, 0n, 0n]
export const Z9_ONE: Z9 = [1n, 0n, 0n, 0n, 0n, 0n]
export const Z9_OMEGA: Z9 = [0n, 0n, 0n, 1n, 0n, 0n] // zeta_9^3
export const Z9_ZETA6: Z9 = [1n, 0n, 0n, 1n, 0n, 0n] // 1 + omega
export const Z9_ZETA18: Z9 = [0n, 0n, 0n, 0n, 0n, -1n] // -zeta_9^5
export const Z9_COIN_DIAG: Z9 = [2n, 0n, 0n, 1n, 0n, 0n] // 2 + omega
export const Z9_COIN_OFF: Z9 = [0n, 0n, 0n, -1n, 0n, 0n] // -omega
export const Z9_MEET_SWAP: Z9 = [-1n, 0n, 0n, 1n, 0n, 0n] // omega - 1

export function addZ9(a: Z9, b: Z9): Z9 {
  return [
    a[0] + b[0],
    a[1] + b[1],
    a[2] + b[2],
    a[3] + b[3],
    a[4] + b[4],
    a[5] + b[5],
  ]
}

export function subZ9(a: Z9, b: Z9): Z9 {
  return [
    a[0] - b[0],
    a[1] - b[1],
    a[2] - b[2],
    a[3] - b[3],
    a[4] - b[4],
    a[5] - b[5],
  ]
}

export function scaleZ9(factor: bigint, a: Z9): Z9 {
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

export function conjZ9(a: Z9): Z9 {
  return [a[0] - a[3], -a[2], -a[1], -a[3], a[5] - a[2], a[4] - a[1]]
}

function adjointZ9(a: Z9, dag: boolean): Z9 {
  return dag ? conjZ9(a) : a
}

export function mulZ9(a: Z9, b: Z9): Z9 {
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

export function isZeroZ9(a: Z9): boolean {
  return a.every(coeff => coeff === 0n)
}

export const ZETA6_POWERS: readonly Z9[] = [
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

export const ROOTS: readonly Root4[] = buildD4Roots()

export const OPPOSITE_SLOT: readonly number[] = ROOTS.map(root =>
  ROOTS.findIndex(other =>
    other.every((val, idx) => val === -root[idx]!),
  ),
)

export const LINES: readonly AntipodalLine[] = ROOTS.flatMap((_, slotA) => {
  const slotB = OPPOSITE_SLOT[slotA]!

  return slotA < slotB ? [[slotA, slotB] as const] : []
})

export const LINE_OF_SLOT: readonly number[] = ROOTS.map((_, slot) =>
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

export const WF4_GROUP: WF4Group = buildWF4Group()

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

      if (i - j === 1 || j - i === 1) {
        const minIdx = i < j ? i : j

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
// The tables are module bindings, as in the script; withFreshMesh swaps in a fresh set for one computation.
let dockFrames: (readonly (readonly Q2[])[])[] = [EYE5]
let frameKeys: string[] = [matKeyQ2(EYE5)]
let dockParity: number[] = [1]
let dockParent: [number, number][] = [[-1, -1]]
let centerToDockId = new Map<string, number>([
  [vecKeyQ2(BASE_CENTER), 0],
])
let neighbors: Int32Array[] = [new Int32Array(24).fill(-1)]

let inconsistentSteps = 0

// The geometry the current mesh tables describe (item 0032, Q2). '3434' is the script's hyperbolic honeycomb and the
// default of every caller; '3433' is the flat 24-cell honeycomb, used only inside withGeometry('3433', ...).
let meshGeometry: BeatGeometry = '3434'

// Flat docks only: the exact center of each dock in the D_4 lattice (integer coordinates, the 24 roots as steps).
let flatCenters: Root4[] = []

// The closed quotient the current mesh tables describe, or null on the infinite meshes (item 0039, section 8).
let closedMesh: ClosedBeatMesh | null = null

type MeshTables = {
  dockFrames: (readonly (readonly Q2[])[])[]
  frameKeys: string[]
  dockParity: number[]
  dockParent: [number, number][]
  centerToDockId: Map<string, number>
  neighbors: Int32Array[]
  inconsistentSteps: number
  geometry: BeatGeometry
  flatCenters: Root4[]
  closed: ClosedBeatMesh | null
}

function installMesh(mesh: MeshTables): void {
  dockFrames = mesh.dockFrames
  frameKeys = mesh.frameKeys
  dockParity = mesh.dockParity
  dockParent = mesh.dockParent
  centerToDockId = mesh.centerToDockId
  neighbors = mesh.neighbors
  inconsistentSteps = mesh.inconsistentSteps
  meshGeometry = mesh.geometry
  flatCenters = mesh.flatCenters
  closedMesh = mesh.closed
}

const FLAT_ORIGIN: Root4 = [0n, 0n, 0n, 0n]

function flatKey(center: Root4): string {
  return `flat:${center.join(',')}`
}

function freshMeshTables(geometry: BeatGeometry): MeshTables {
  return {
    dockFrames: [EYE5],
    frameKeys: [matKeyQ2(EYE5)],
    dockParity: [1],
    dockParent: [[-1, -1]],
    centerToDockId: new Map<string, number>([
      [geometry === '3434' ? vecKeyQ2(BASE_CENTER) : flatKey(FLAT_ORIGIN), 0],
    ]),
    neighbors: [new Int32Array(24).fill(-1)],
    inconsistentSteps: 0,
    geometry,
    flatCenters: geometry === '3434' ? [] : [FLAT_ORIGIN],
    closed: null,
  }
}

// Run `compute` on a fresh mesh (only the base dock 0 known, the script's start), then restore the shared mesh. Dock
// ids inside `compute` are the ids the script itself would assign; states made inside must not leave it unless read
// through dockCenterKey.
export function withFreshMesh<T>(compute: () => T): T {
  return withGeometry('3434', compute)
}

// The beat's two geometries (item 0032, Q2; decision 004 point 5). Both tile space by 24-cells with 24 octahedral
// facets, so the dock space (24 slots, 5 states each) and the seven per-dock layers are the same code on both. Only the
// facet gluing differs, which lives in stepDock alone:
//   '3434'  the hyperbolic honeycomb of the script: four 24-cells around each triangle, docks as frames in
//           O^+(4,1; Z[sqrt 2]), a step on slot s is the transport k_s = F_s Z, and dock parity = det(frame) alternates.
//   '3433'  the flat 24-cell honeycomb: three 24-cells around each triangle, dock centers the D_4 lattice, a step on
//           slot s adds the root ROOTS[s], and every dock carries the translated frame (identity, det +1, parity +1).
// Why the flat frames are translations and not F_s Z: on '3433' the transport F_s Z has linear part -I + r_s r_s^T
// (det -1), and around a triangle of three 24-cells its product is not the identity, so the frame and the parity
// det(frame) are not functions of the dock (particles.ts counts the clash). The flat mesh has a global parallel frame
// instead, so the slot labels are global directions and the orientation is global. What does NOT transfer: the
// alternating parity that Phi_odd multiplies into chi_odd. It needs four cells around each face (an even cycle); on the
// flat mesh every dock has parity +1. Phi_odd is silent below four excitations per dock, so the one- and two-excitation
// sectors never see it.
export type BeatGeometry = '3434' | '3433'

export const BEAT_GEOMETRIES: readonly BeatGeometry[] = ['3434', '3433']

// Run `compute` on a fresh mesh of the given geometry, then restore the shared mesh (and its geometry).
export function withGeometry<T>(geometry: BeatGeometry, compute: () => T): T {
  const saved: MeshTables = {
    dockFrames,
    frameKeys,
    dockParity,
    dockParent,
    centerToDockId,
    neighbors,
    inconsistentSteps,
    geometry: meshGeometry,
    flatCenters,
    closed: closedMesh,
  }

  installMesh(freshMeshTables(geometry))

  try {
    return compute()
  } finally {
    installMesh(saved)
  }
}

// The geometry of the current mesh.
export function currentGeometry(): BeatGeometry {
  return meshGeometry
}

// The exact D_4 lattice center of a dock of the flat mesh (fails closed on the hyperbolic mesh).
export function flatCenterOf(dock: number): readonly [bigint, bigint, bigint, bigint] {
  const center = flatCenters[dock]

  assertExact(meshGeometry === '3433' && center !== undefined, `flatCenterOf(${dock}) needs a discovered flat dock`)

  return center!
}

// A step on the flat mesh: translate by the root of the slot; the frame stays the identity, so the parity stays +1.
function stepFlatDock(dock: number, slot: number): number {
  const from = flatCenters[dock]!
  const root = ROOTS[slot]!
  const center: Root4 = [from[0] + root[0], from[1] + root[1], from[2] + root[2], from[3] + root[3]]
  const key = flatKey(center)

  let nextId = centerToDockId.get(key)

  if (nextId === undefined) {
    nextId = dockFrames.length
    centerToDockId.set(key, nextId)
    dockFrames.push(EYE5)
    frameKeys.push(frameKeys[0]!)
    dockParity.push(1)
    dockParent.push([dock, slot])
    neighbors.push(new Int32Array(24).fill(-1))
    flatCenters.push(center)
  } else if (dockParity[nextId] !== 1) {
    inconsistentSteps++
  }

  neighbors[dock]![slot] = nextId
  neighbors[nextId]![OPPOSITE_SLOT[slot]!] = dock

  return nextId
}

// Docks discovered so far on the current mesh.
export function dockCount(): number {
  return dockFrames.length
}

// The bipartite parity sigma(d) = det(frame(d)) in {+1, -1} of a discovered dock.
export function dockParityOf(dock: number): number {
  const parity = dockParity[dock]

  assertExact(parity !== undefined, `dock ${dock} not discovered`)

  return parity!
}

// A mesh-independent name of a discovered dock: its exact center in O^+(4,1; Z[sqrt 2]) coordinates.
export function dockCenterKey(dock: number): string {
  const frame = dockFrames[dock]

  assertExact(frame !== undefined, `dock ${dock} not discovered`)

  if (closedMesh !== null) {
    return closedDockKey(dock)
  }

  if (meshGeometry === '3433') {
    return flatKey(flatCenters[dock]!)
  }

  return vecKeyQ2(matVecQ2(frame!, BASE_CENTER))
}

// Steps that met a known center with a different frame or parity (0 on a consistent mesh).
export function inconsistentStepCount(): number {
  return inconsistentSteps
}

export function stepDock(dock: number, slot: number): number {
  const cached = neighbors[dock]![slot]!

  if (cached >= 0) {
    return cached
  }

  if (closedMesh !== null) {
    return stepClosedDock(dock, slot)
  }

  if (meshGeometry === '3433') {
    return stepFlatDock(dock, slot)
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

export function lorentzCosh2(dock: number): bigint {
  assertExact(
    meshGeometry === '3434' && closedMesh === null,
    'lorentzCosh2 is defined on the infinite {3,4,3,4} mesh only',
  )

  return -twiceForm(
    matVecQ2(dockFrames[dock]!, BASE_CENTER),
    BASE_CENTER,
  )[0]
}

// =================================================================================================
// 8. Closed quotients (item vibe-computation-models-0039, the Q4 follow-up): finite meshes with no boundary
// =================================================================================================
//
// The seven per-dock layers and the stream run unchanged on a closed quotient; only stepDock changes, as for the two
// geometries of section 6, and every caller outside withClosedMesh is untouched (closedMesh is null there).
//   congruence-3434  K / N, K the frame group of {3,4,3,4} (generated by the transports k_s = F_s Z of section 6) and N
//                    its kernel modulo (sqrt 2)^m. A dock is a frame held as residues (a mod 2^ceil(m/2) and b mod
//                    2^floor(m/2) for each entry a + b sqrt 2, a ring because B divides A and A divides 2B), and a step
//                    on slot s right-multiplies by k_s and reduces. N is normal in K, so slot labels are global and the
//                    step involution holds. For m >= 3 every element of N has det +1 (det is +-1, and -1 = 1 holds
//                    modulo (sqrt 2)^m only for m <= 2), so the parity det(frame) is a function of the dock and still
//                    alternates; a step that meets a known dock of the same parity counts as inconsistent (0 expected).
//                    code/substrate/coxeter/congruence-3434.ts builds the same group from its own copy of the
//                    transports; E-CMP (bare-u-toric) gates dock for dock that the two agree.
//   torus-3433       the flat D_4 lattice modulo side * Z^4 (side even and at least 4, so the even-sum lattice is kept
//                    and the 24 neighbours are distinct), translated frames and parity +1 as on the infinite flat mesh,
//                    side^4 / 2 docks.
// dockCenterKey names a closed dock by its residue frame or its reduced center; dock ids are discovery order, as always.

export type ClosedBeatMesh =
  | { readonly kind: 'congruence-3434'; readonly twoPower: number }
  | { readonly kind: 'torus-3433'; readonly side: number }

// A stable name of a closed mesh.
export function closedMeshName(mesh: ClosedBeatMesh): string {
  return mesh.kind === 'congruence-3434'
    ? `congruence-3434-level-${mesh.twoPower}`
    : `torus-3433-side-${mesh.side}`
}

// The closed mesh of the current tables, or null on the infinite meshes.
export function currentClosedMesh(): ClosedBeatMesh | null {
  return closedMesh
}

function closedModuli(twoPower: number): readonly [bigint, bigint] {
  return [2n ** BigInt((twoPower + 1) >> 1), 2n ** BigInt(twoPower >> 1)]
}

function reduceFrameQ2(
  mat: readonly (readonly Q2[])[],
  twoPower: number,
): Q2[][] {
  const [modA, modB] = closedModuli(twoPower)

  return mat.map(row =>
    row.map(([a, b]) => {
      const ra = a % modA
      const rb = b % modB

      return [ra < 0n ? ra + modA : ra, rb < 0n ? rb + modB : rb] as const
    }),
  )
}

// Run `compute` on a fresh closed mesh (only dock 0 known), then restore the shared mesh. Fails closed on a level below
// 3 (the parity is not a function of the dock there) or an odd or small torus side.
export function withClosedMesh<T>(mesh: ClosedBeatMesh, compute: () => T): T {
  if (mesh.kind === 'congruence-3434') {
    assertExact(
      Number.isInteger(mesh.twoPower) && mesh.twoPower >= 3,
      `congruence-3434 needs an integer level >= 3, got ${mesh.twoPower}`,
    )
  } else {
    assertExact(
      Number.isInteger(mesh.side) && mesh.side >= 4 && mesh.side % 2 === 0,
      `torus-3433 needs an even side >= 4, got ${mesh.side}`,
    )
  }

  return withGeometry(mesh.kind === 'congruence-3434' ? '3434' : '3433', () => {
    if (mesh.kind === 'congruence-3434') {
      const base = reduceFrameQ2(EYE5, mesh.twoPower)
      const baseKey = matKeyQ2(base)

      dockFrames[0] = base
      frameKeys[0] = baseKey
      centerToDockId.clear()
      centerToDockId.set(baseKey, 0)
    }

    closedMesh = mesh

    return compute()
  })
}

function stepClosedDock(dock: number, slot: number): number {
  const mesh = closedMesh!

  let key: string
  let frame: readonly (readonly Q2[])[]
  let center: Root4 | undefined
  let parity: number

  if (mesh.kind === 'torus-3433') {
    const side = BigInt(mesh.side)
    const from = flatCenters[dock]!
    const root = ROOTS[slot]!
    const wrap = (x: bigint): bigint => ((x % side) + side) % side

    center = [
      wrap(from[0] + root[0]),
      wrap(from[1] + root[1]),
      wrap(from[2] + root[2]),
      wrap(from[3] + root[3]),
    ]
    key = flatKey(center)
    frame = EYE5
    parity = 1
  } else {
    frame = reduceFrameQ2(
      matMulQ2(dockFrames[dock]!, TRANSPORTS[slot]!),
      mesh.twoPower,
    )
    key = matKeyQ2(frame)
    parity = -dockParity[dock]!
  }

  let nextId = centerToDockId.get(key)

  if (nextId === undefined) {
    nextId = dockFrames.length
    centerToDockId.set(key, nextId)
    dockFrames.push(frame)
    frameKeys.push(mesh.kind === 'torus-3433' ? frameKeys[0]! : key)
    dockParity.push(parity)
    dockParent.push([dock, slot])
    neighbors.push(new Int32Array(24).fill(-1))

    if (center !== undefined) {
      flatCenters.push(center)
    }
  } else if (dockParity[nextId] !== parity) {
    inconsistentSteps++
  }

  neighbors[dock]![slot] = nextId
  neighbors[nextId]![OPPOSITE_SLOT[slot]!] = dock

  return nextId
}

function closedDockKey(dock: number): string {
  const mesh = closedMesh!

  return mesh.kind === 'torus-3433'
    ? `${closedMeshName(mesh)}:${flatCenters[dock]!.join(',')}`
    : `${closedMeshName(mesh)}:${frameKeys[dock]!}`
}

// Discover every dock of the current closed mesh breadth first from dock 0 (all 24 slots of each), and return the
// count. Fails closed on an infinite mesh or past maxDocks.
export function closedMeshDocks(maxDocks: number): number {
  assertExact(closedMesh !== null, 'closedMeshDocks needs a closed mesh (withClosedMesh)')

  for (let dock = 0; dock < dockFrames.length; dock++) {
    for (let slot = 0; slot < 24; slot++) {
      stepDock(dock, slot)
    }

    assertExact(
      dockFrames.length <= maxDocks,
      `${closedMeshName(closedMesh!)} has more than ${maxDocks} docks`,
    )
  }

  return dockFrames.length
}

// The residue frame of a dock of a congruence quotient, as 25 rational residues then 25 sqrt 2 residues (row-major), the
// layout of congruence-3434.ts reduceToLevel; the reduced D_4 center (4 numbers) on a torus.
export function closedDockResidues(dock: number): readonly bigint[] {
  assertExact(closedMesh !== null && dockFrames[dock] !== undefined, `closedDockResidues(${dock}) needs a closed dock`)

  if (closedMesh!.kind === 'torus-3433') {
    return flatCenters[dock]!
  }

  const frame = dockFrames[dock]!

  return [...frame.flatMap(row => row.map(e => e[0])), ...frame.flatMap(row => row.map(e => e[1]))]
}

// =================================================================================================
// 7. Adapters to code/algebra/ninth-field (Q(zeta_9), the same basis 1, z, ..., z^5 mod z^6 + z^3 + 1)
// =================================================================================================

export const BEAT_LAYER_NAMES: readonly string[] = [
  'Phi_odd',
  'D',
  'K',
  'M_pair(zeta_18)',
  'M_meet',
  'D',
  'Phi_odd',
  'S',
]

export function z9ToNinth(z: Z9, den = 1n): Ninth {
  return ninth(z, den)
}

// A number of Q(zeta_9) as integer coefficients over a positive denominator (the Ninth's own reduced form).
export function ninthToZ9(x: Ninth): readonly [Z9, bigint] {
  const n = x.n

  return [[n[0]!, n[1]!, n[2]!, n[3]!, n[4]!, n[5]!], x.d]
}

// The amplitude of one configuration key (0 when absent), exactly.
export function amplitudeOf(state: State, key: string): Ninth {
  return ninth(state.amp.get(key) ?? Z9_ZERO, state.den)
}

// Every nonzero amplitude, by configuration key, exactly.
export function stateToNinth(state: State): Map<string, Ninth> {
  const out = new Map<string, Ninth>()

  for (const [key, z] of state.amp) {
    out.set(key, ninth(z, state.den))
  }

  return out
}

// A superposition sum_i c_i |vibes_i> with exact coefficients, on one common denominator (the least common multiple of
// the coefficients' denominators). Configurations that repeat add. The result is not normalized.
export function superpose(terms: readonly (readonly [readonly Vibe[], Ninth])[]): State {
  let den = 1n

  for (const [, c] of terms) {
    den = lcm(den, c.d)
  }

  const amp = new Map<string, Z9>()

  for (const [vibes, c] of terms) {
    const [z, d] = ninthToZ9(c)

    addAmplitude(amp, encodeConfig(vibes), scaleZ9(den / d, z))
  }

  return { amp, den }
}

function lcm(a: bigint, b: bigint): bigint {
  let x = a
  let y = b

  while (y !== 0n) {
    ;[x, y] = [y, x % y]
  }

  return (a / x) * b
}
