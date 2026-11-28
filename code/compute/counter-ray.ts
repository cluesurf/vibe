// The reversible counter rule on {3,4,3,4}: the homogeneous partitioned rule U_rev = S o L and the origin
// controller that runs Bennett's program (c1, c2, 0) to (c1, c2 + 2 c1, 0) on its counter rays.
//
// A cell is a frame of the {3,4,3,4} honeycomb, an exact 5 x 5 Lorentz matrix over Z[sqrt 2]. Each cell has 24
// ports, one per D4 root (slot), and each port holds one of 12 symbols. One beat of U_rev is:
//
//   L: on every cell, the line map acts on each of the 12 lines (s, opp s), s < opp s, read as (plus, minus);
//   S: port s of cell g moves to port s of cell g k_s, where k_s = F_s Z is the transport frame of slot s.
//
// The line map is a bijection of the 144 symbol pairs that fixes (0, 0), keeps the number of occupied ports, and
// commutes with swapping the two ports of a line; since k_s k_opp(s) = I for every slot, S is a bijection too, so
// U_rev is a global bijection. The system with the origin controller is NOT a bijection on all states: the forward
// controller merges START and the exit of the third INC macro into one phase, and its inverse separates them only
// on states reachable from an encoded seed.
//
// This module is the single source of these tables. test/verify/turing-universality-native-3434.ts keeps its own
// standalone copy, and test/code/compute/counter-ray.ts checks the two copies agree entry by entry.
// task/lean-export.ts exports the line map, its inverse, the lines and the 24 frames to
// code/proof/Vibe/Generated/CounterRay.lean, bridged in Vibe/Compute/ReversibleCounter3434.lean.

// ---------------------------------------------------------------------------------------------------------------
// Symbols

export const SYMBOL_COUNT = 12
export const SLOT_COUNT = 24
export const LINE_COUNT = 12

// 0 empty, 1 M (marker), 2 to 4 W0 W1 W2 (walker phases), 5 F, 6 G, 7 H (outbound pulses),
// 8 Fr, 9 Gr, 10 Hr (returning pulses), 11 P (probe). Every non-empty symbol carries tone +1.
export const EMPTY = 0
export const M = 1
export const W0 = 2
export const W1 = 3
export const W2 = 4
export const F = 5
export const G = 6
export const H = 7
export const FR = 8
export const GR = 9
export const HR = 10
export const P = 11

export type SymbolPair = readonly [number, number]

// ---------------------------------------------------------------------------------------------------------------
// Slots and lines: the 24 D4 roots in the order of code/substrate/coxeter/exact-3434.ts (pairs i < j, signs
// (+, +), (+, -), (-, +), (-, -)), so the antipode of slot 4q + r is 4q + 3 - r.

export type Root4 = readonly [number, number, number, number]

export const ROOTS: readonly Root4[] = (() => {
  const out: Root4[] = []

  for (let i = 0; i < 4; i++) {
    for (let j = i + 1; j < 4; j++) {
      for (const si of [1, -1]) {
        for (const sj of [1, -1]) {
          const c: [number, number, number, number] = [0, 0, 0, 0]

          c[i] = si
          c[j] = sj
          out.push(c)
        }
      }
    }
  }

  return out
})()

export const OPPOSITE_SLOT: readonly number[] = ROOTS.map(r =>
  ROOTS.findIndex(o => o[0] === -r[0] && o[1] === -r[1] && o[2] === -r[2] && o[3] === -r[3]),
)

// The 12 lines (s, opp s) with s < opp s; s is the plus port of the line.
export const LINES: readonly SymbolPair[] = (() => {
  const out: [number, number][] = []

  for (let s = 0; s < SLOT_COUNT; s++) {
    if (s < OPPOSITE_SLOT[s]!) {
      out.push([s, OPPOSITE_SLOT[s]!])
    }
  }

  return out
})()

// ---------------------------------------------------------------------------------------------------------------
// The line map L on one line (plus, minus), and its inverse.

export function lineMap(a: number, b: number): SymbolPair {
  if (a === EMPTY && b === EMPTY) {
    return [EMPTY, EMPTY]
  }

  // one particle: M bounces, the walker turns W0 -> W1 -> W2 -> W0 while it crosses, a pulse streams on
  if (b === EMPTY) {
    if (a === M) return [EMPTY, M]
    if (a === W0) return [EMPTY, W1]
    if (a === W1) return [EMPTY, W2]
    if (a === W2) return [W0, EMPTY]
    return [a, EMPTY]
  }

  if (a === EMPTY) {
    if (b === M) return [M, EMPTY]
    if (b === W0) return [W1, EMPTY]
    if (b === W1) return [W2, EMPTY]
    if (b === W2) return [EMPTY, W0]
    return [EMPTY, b]
  }

  // two particles: 9 involutions on 18 ordered pairs, closed under swapping the ports; identity elsewhere
  if (a === F && b === M) return [W0, FR]
  if (a === W0 && b === FR) return [F, M]
  if (a === M && b === F) return [FR, W0]
  if (a === FR && b === W0) return [M, F]

  if (a === G && b === W1) return [M, GR]
  if (a === M && b === GR) return [G, W1]
  if (a === W1 && b === G) return [GR, M]
  if (a === GR && b === M) return [W1, G]

  if (a === H && b === M) return [W1, HR]
  if (a === W1 && b === HR) return [H, M]
  if (a === M && b === H) return [HR, W1]
  if (a === HR && b === W1) return [M, H]

  if (a === G && b === W2) return [M, FR]
  if (a === M && b === FR) return [G, W2]
  if (a === W2 && b === G) return [FR, M]
  if (a === FR && b === M) return [W2, G]

  if (a === P && b === M) return [M, P]
  if (a === M && b === P) return [P, M]

  return [a, b]
}

export function lineMapInverse(a: number, b: number): SymbolPair {
  if (a === EMPTY && b === EMPTY) {
    return [EMPTY, EMPTY]
  }

  if (b === EMPTY) {
    if (a === M) return [EMPTY, M]
    if (a === W0) return [W2, EMPTY]
    if (a === W1) return [EMPTY, W0]
    if (a === W2) return [EMPTY, W1]
    return [a, EMPTY]
  }

  if (a === EMPTY) {
    if (b === M) return [M, EMPTY]
    if (b === W0) return [EMPTY, W2]
    if (b === W1) return [W0, EMPTY]
    if (b === W2) return [W1, EMPTY]
    return [EMPTY, b]
  }

  // every two-particle collision is an involution
  return lineMap(a, b)
}

// L on one cell: the line map on each of the 12 lines of a 24-port array.
export function cellLineMap(ports: ArrayLike<number>): Uint8Array {
  const out = new Uint8Array(SLOT_COUNT)

  for (const [sa, sb] of LINES) {
    const [oa, ob] = lineMap(ports[sa]!, ports[sb]!)

    out[sa] = oa
    out[sb] = ob
  }

  return out
}

export function cellLineMapInverse(ports: ArrayLike<number>): Uint8Array {
  const out = new Uint8Array(SLOT_COUNT)

  for (const [sa, sb] of LINES) {
    const [ia, ib] = lineMapInverse(ports[sa]!, ports[sb]!)

    out[sa] = ia
    out[sb] = ib
  }

  return out
}

// ---------------------------------------------------------------------------------------------------------------
// The 24 transport frames k_s = F_s Z over Z[sqrt 2], exact (a + b sqrt 2 as [a, b]).

export type Z2 = readonly [bigint, bigint]
export type Frame = readonly (readonly Z2[])[]

const DIM5 = [0, 1, 2, 3, 4] as const
const Z2_ZERO: Z2 = [0n, 0n]
const Z2_ONE: Z2 = [1n, 0n]
const z2Add = (u: Z2, v: Z2): Z2 => [u[0] + v[0], u[1] + v[1]]
const z2Sub = (u: Z2, v: Z2): Z2 => [u[0] - v[0], u[1] - v[1]]
const z2Mul = (u: Z2, v: Z2): Z2 => [u[0] * v[0] + 2n * u[1] * v[1], u[0] * v[1] + u[1] * v[0]]

export const IDENTITY_FRAME: Frame = DIM5.map(i => DIM5.map(j => (i === j ? Z2_ONE : Z2_ZERO)))

function dotZ2(u: readonly Z2[], v: readonly Z2[]): Z2 {
  let s = Z2_ZERO

  for (let i = 0; i < 5; i++) {
    s = z2Add(s, z2Mul(u[i]!, v[i]!))
  }

  return s
}

const matVecZ2 = (m: Frame, v: readonly Z2[]): Z2[] => m.map(row => dotZ2(row, v))

export function frameMul(a: Frame, b: Frame): Z2[][] {
  return DIM5.map(i =>
    DIM5.map(j => {
      let s = Z2_ZERO

      for (let k = 0; k < 5; k++) {
        s = z2Add(s, z2Mul(a[i]![k]!, b[k]![j]!))
      }

      return s
    }),
  )
}

export function frameEqual(a: Frame, b: Frame): boolean {
  return DIM5.every(i => DIM5.every(j => a[i]![j]![0] === b[i]![j]![0] && a[i]![j]![1] === b[i]![j]![1]))
}

const vecKeyZ2 = (v: readonly Z2[]): string => v.map(([a, b]) => `${a},${b}`).join(';')

// twice the Gram matrix of the {3,4,3,4} Coxeter simplex
const TWICE_GRAM: Frame = DIM5.map(i =>
  DIM5.map(j => {
    if (i === j) return [2n, 0n] as const
    if (Math.abs(i - j) === 1) return Math.min(i, j) % 2 === 0 ? ([-1n, 0n] as const) : ([0n, -1n] as const)
    return Z2_ZERO
  }),
)

const twiceFormZ2 = (u: readonly Z2[], v: readonly Z2[]): Z2 => dotZ2(u, matVecZ2(TWICE_GRAM, v))

function reflect5(normal: readonly Z2[]): Z2[][] {
  const dual = matVecZ2(TWICE_GRAM, normal)

  return IDENTITY_FRAME.map((row, i) => row.map((entry, j) => z2Sub(entry, z2Mul(normal[i]!, dual[j]!))))
}

export const BASE_CENTER: readonly Z2[] = [[2n, 0n], [4n, 0n], [0n, 3n], [0n, 2n], [1n, 0n]]

const CENTRAL_INVERSION: Frame = DIM5.map(i =>
  DIM5.map(j => [
    (j === 4 ? 2n * BASE_CENTER[i]![0] : 0n) - (i === j ? 1n : 0n),
    j === 4 ? 2n * BASE_CENTER[i]![1] : 0n,
  ]),
)

// TRANSPORTS[s] = F_s Z for slot s, F_s the reflection in the facet of root s and Z the central inversion.
export const TRANSPORTS: readonly Frame[] = (() => {
  const stabGens = [0, 1, 2, 3].map(idx => reflect5(IDENTITY_FRAME[idx]!))
  const facetNormals: Z2[][] = [IDENTITY_FRAME[4]!.slice()]
  const seen = new Set<string>([vecKeyZ2(IDENTITY_FRAME[4]!)])

  for (const n of facetNormals) {
    for (const g of stabGens) {
      const next = matVecZ2(g, n)
      const key = vecKeyZ2(next)

      if (!seen.has(key)) {
        seen.add(key)
        facetNormals.push(next)
      }
    }
  }

  const facetDot = (a: number, b: number): bigint =>
    (twiceFormZ2(facetNormals[a]!, facetNormals[b]!)[0] + 2n) / 2n
  const orthoBasis: number[] = []

  for (let f = 0; f < SLOT_COUNT && orthoBasis.length < 4; f++) {
    if (orthoBasis.every(prev => facetDot(f, prev) === 0n)) {
      orthoBasis.push(f)
    }
  }

  const facetRoots = facetNormals.map((_, f) => {
    const [c0, c1, c2, c3] = orthoBasis.map(o => facetDot(f, o))

    return [(c0! + c1!) / 2n, (c0! - c1!) / 2n, (c2! + c3!) / 2n, (c2! - c3!) / 2n] as const
  })

  return ROOTS.map(root => {
    const fIdx = facetRoots.findIndex(
      fr =>
        fr[0] === BigInt(root[0]) &&
        fr[1] === BigInt(root[1]) &&
        fr[2] === BigInt(root[2]) &&
        fr[3] === BigInt(root[3]),
    )

    if (fIdx < 0) {
      throw new Error(`no facet for root ${root.join(',')}`)
    }

    return frameMul(reflect5(facetNormals[fIdx]!), CENTRAL_INVERSION)
  })
})()

// ---------------------------------------------------------------------------------------------------------------
// The origin controller on cell 0: (phase of 17, launch 0..11, ret 0..10).
//
// Counters c1, c2, c3 sit on the rays of slots 0, 1, 4 (one M on the minus port of cell k^(2c) at even beats);
// the two work tokens wait on cell 0's minus ports of lines 3 and 4 (slots 6 and 11) at even beats. Loop 1:
// while c1 > 0, DEC c1, INC c2 twice, INC c3. Loop 2: while c3 > 0, DEC c3, INC c1.

export type ControllerPhase =
  | 'start'
  | 'loop1HeadOdd'
  | 'loop1DispatchEven'
  | 'loop1Dec1'
  | 'loop1Dec1Odd'
  | 'loop1Inc2a'
  | 'loop1Inc2aOdd'
  | 'loop1Inc2b'
  | 'loop1Inc2bOdd'
  | 'loop1Inc3'
  | 'loop2HeadOdd'
  | 'loop2DispatchEven'
  | 'loop2Dec3'
  | 'loop2Dec3Odd'
  | 'loop2Inc1'
  | 'haltOdd'
  | 'haltEven'

export const CONTROLLER_PHASES: readonly ControllerPhase[] = [
  'start',
  'loop1HeadOdd',
  'loop1DispatchEven',
  'loop1Dec1',
  'loop1Dec1Odd',
  'loop1Inc2a',
  'loop1Inc2aOdd',
  'loop1Inc2b',
  'loop1Inc2bOdd',
  'loop1Inc3',
  'loop2HeadOdd',
  'loop2DispatchEven',
  'loop2Dec3',
  'loop2Dec3Odd',
  'loop2Inc1',
  'haltOdd',
  'haltEven',
]

export type ControllerState = {
  readonly phase: ControllerPhase
  // 0..11
  readonly launch: number
  // 0..10
  readonly ret: number
}

export type ControllerStep = {
  readonly ports: Uint8Array
  readonly controller: ControllerState
}

// park ports of lines 3 and 4: a token waits on the minus port (PARK_WAIT) until it is launched, and an absorbed
// return lands on the plus port (PARK_LAND), where L bounces it back to the minus port as an M
export const PARK_WAIT = [LINES[3]![1], LINES[4]![1]] as const
export const PARK_LAND = [LINES[3]![0], LINES[4]![0]] as const

function guard(cond: boolean, msg: string): void {
  if (!cond) {
    throw new Error(`counter-ray controller: ${msg}`)
  }
}

const state = (phase: ControllerPhase, launch = 0, ret = 0): ControllerState => ({ phase, launch, ret })

type Macro = {
  readonly plus: number
  readonly minus: number
}

const RAY_C1: Macro = { plus: 0, minus: 3 }
const RAY_C2: Macro = { plus: 1, minus: 2 }
const RAY_C3: Macro = { plus: 4, minus: 7 }

function macroForward(
  portsIn: ArrayLike<number>,
  phase: ControllerPhase,
  launch: number,
  ret: number,
  macro: Macro,
  isInc: boolean,
  nextOddPhase: ControllerPhase,
): ControllerStep {
  const pre = Uint8Array.from(portsIn)
  const { plus, minus } = macro
  const launchG = isInc ? 6 : 10
  const launchDone = launchG + 1
  const retDone = isInc ? 10 : 6
  const first = isInc ? F : H
  const ret1 = isInc ? FR : HR
  const ret2 = isInc ? GR : FR

  // 1. launch before L
  let nextLaunch = launch

  if (launch === 0) {
    guard(pre[PARK_WAIT[0]] === M && pre[plus] === 0, `${phase} launch 0`)
    pre[PARK_WAIT[0]] = 0
    pre[plus] = first
    nextLaunch = 1
  } else if (launch < launchG) {
    nextLaunch = launch + 1
  } else if (launch === launchG) {
    guard(pre[PARK_WAIT[1]] === M && pre[plus] === 0, `${phase} launch G`)
    pre[PARK_WAIT[1]] = 0
    pre[plus] = G
    nextLaunch = launchDone
  }

  // 2. the homogeneous line map on all 12 lines
  const out = cellLineMap(pre)

  // 3. absorb returns after L
  if (ret === 0) {
    if (out[minus] === ret1) {
      guard(out[PARK_LAND[0]] === 0, `${phase} park 0 free`)
      out[minus] = 0
      out[PARK_LAND[0]] = M

      return { ports: out, controller: state(phase, nextLaunch, 1) }
    }

    return { ports: out, controller: state(phase, nextLaunch, 0) }
  }

  if (ret < retDone) {
    return { ports: out, controller: state(phase, nextLaunch, ret + 1) }
  }

  guard(out[minus] === ret2 && out[PARK_LAND[1]] === 0, `${phase} second return`)
  out[minus] = 0
  out[PARK_LAND[1]] = M

  return { ports: out, controller: state(nextOddPhase) }
}

function macroExitInverse(
  portsIn: ArrayLike<number>,
  macroPhase: ControllerPhase,
  macro: Macro,
  isInc: boolean,
): ControllerStep {
  const pre = Uint8Array.from(portsIn)
  const { plus, minus } = macro
  const launchG = isInc ? 6 : 10
  const launchDone = launchG + 1
  const retDone = isInc ? 10 : 6
  const ret2 = isInc ? GR : FR

  guard(pre[PARK_LAND[1]] === M && pre[minus] === 0, `${macroPhase} exit inverse park 1`)
  pre[PARK_LAND[1]] = 0
  pre[minus] = ret2

  const out = cellLineMapInverse(pre)

  // undo the launch of G if it happened on this same beat
  let prevLaunch = launchDone

  if (out[plus] === G) {
    guard(out[PARK_WAIT[1]] === 0, `${macroPhase} exit inverse unlaunch G`)
    out[plus] = 0
    out[PARK_WAIT[1]] = M
    prevLaunch = launchG
  }

  return { ports: out, controller: state(macroPhase, prevLaunch, retDone) }
}

function macroInverse(
  portsIn: ArrayLike<number>,
  phase: ControllerPhase,
  launch: number,
  ret: number,
  macro: Macro,
  isInc: boolean,
  prevEntryPhase: ControllerPhase,
): ControllerStep {
  const pre = Uint8Array.from(portsIn)
  const { plus, minus } = macro
  const launchG = isInc ? 6 : 10
  const launchDone = launchG + 1
  const first = isInc ? F : H
  const ret1 = isInc ? FR : HR

  let prevRet = ret

  if (ret === 1) {
    guard(pre[PARK_LAND[0]] === M && pre[minus] === 0, `${phase} inverse unpark 0`)
    pre[PARK_LAND[0]] = 0
    pre[minus] = ret1
    prevRet = 0
  } else if (ret > 1) {
    prevRet = ret - 1
  }

  const out = cellLineMapInverse(pre)

  if (launch === launchDone) {
    if (out[plus] === G) {
      guard(out[PARK_WAIT[1]] === 0, `${phase} inverse unlaunch G`)
      out[plus] = 0
      out[PARK_WAIT[1]] = M

      return { ports: out, controller: state(phase, launchG, prevRet) }
    }

    return { ports: out, controller: state(phase, launchDone, prevRet) }
  }

  if (launch > 1) {
    return { ports: out, controller: state(phase, launch - 1, prevRet) }
  }

  guard(launch === 1 && prevRet === 0 && out[plus] === first && out[PARK_WAIT[0]] === 0, `${phase} inverse unlaunch 0`)
  out[plus] = 0
  out[PARK_WAIT[0]] = M

  return { ports: out, controller: state(prevEntryPhase) }
}

// One forward beat of cell 0 under the controller, before S. Throws past haltEven.
export function controllerForward(portsIn: ArrayLike<number>, controller: ControllerState): ControllerStep {
  const { phase, launch, ret } = controller
  const plain = (next: ControllerPhase): ControllerStep => ({ ports: cellLineMap(portsIn), controller: state(next) })

  switch (phase) {
    case 'start':
      return plain('loop1HeadOdd')
    case 'loop1HeadOdd':
      return plain('loop1DispatchEven')
    case 'loop1DispatchEven':
      // local zero test: c1 = 0 iff the minus port of ray c1 holds M
      if (portsIn[RAY_C1.minus] === M) return plain('loop2HeadOdd')
      return macroForward(portsIn, 'loop1Dec1', 0, 0, RAY_C1, false, 'loop1Dec1Odd')
    case 'loop1Dec1':
      return macroForward(portsIn, 'loop1Dec1', launch, ret, RAY_C1, false, 'loop1Dec1Odd')
    case 'loop1Dec1Odd':
      return plain('loop1Inc2a')
    case 'loop1Inc2a':
      return macroForward(portsIn, 'loop1Inc2a', launch, ret, RAY_C2, true, 'loop1Inc2aOdd')
    case 'loop1Inc2aOdd':
      return plain('loop1Inc2b')
    case 'loop1Inc2b':
      return macroForward(portsIn, 'loop1Inc2b', launch, ret, RAY_C2, true, 'loop1Inc2bOdd')
    case 'loop1Inc2bOdd':
      return plain('loop1Inc3')
    case 'loop1Inc3':
      return macroForward(portsIn, 'loop1Inc3', launch, ret, RAY_C3, true, 'loop1HeadOdd')
    case 'loop2HeadOdd':
      return plain('loop2DispatchEven')
    case 'loop2DispatchEven':
      // local zero test: c3 = 0
      if (portsIn[RAY_C3.minus] === M) return plain('haltOdd')
      return macroForward(portsIn, 'loop2Dec3', 0, 0, RAY_C3, false, 'loop2Dec3Odd')
    case 'loop2Dec3':
      return macroForward(portsIn, 'loop2Dec3', launch, ret, RAY_C3, false, 'loop2Dec3Odd')
    case 'loop2Dec3Odd':
      return plain('loop2Inc1')
    case 'loop2Inc1':
      return macroForward(portsIn, 'loop2Inc1', launch, ret, RAY_C1, true, 'loop2HeadOdd')
    case 'haltOdd':
      return plain('haltEven')
    case 'haltEven':
      throw new Error('counter-ray controller: no forward step past haltEven')
  }
}

// One inverse beat of cell 0, applied after S^-1. Correct only on states reachable from an encoded seed: the
// merges into loop1HeadOdd and loop2HeadOdd are told apart by the local checks below, which hold only there.
export function controllerInverse(portsIn: ArrayLike<number>, controller: ControllerState): ControllerStep {
  const { phase, launch, ret } = controller
  const plain = (prev: ControllerPhase): ControllerStep => ({
    ports: cellLineMapInverse(portsIn),
    controller: state(prev),
  })
  const entry = launch === 0 && ret === 0

  switch (phase) {
    case 'haltEven':
      return plain('haltOdd')
    case 'haltOdd':
      return plain('loop2DispatchEven')
    case 'loop2HeadOdd':
      // from loop1DispatchEven iff c1 = 0, read on the plus port of ray c1
      if (portsIn[RAY_C1.plus] === M) return plain('loop1DispatchEven')
      return macroExitInverse(portsIn, 'loop2Inc1', RAY_C1, true)
    case 'loop2Inc1':
      if (entry) return plain('loop2Dec3Odd')
      return macroInverse(portsIn, 'loop2Inc1', launch, ret, RAY_C1, true, 'loop2Inc1')
    case 'loop2Dec3Odd':
      return macroExitInverse(portsIn, 'loop2Dec3', RAY_C3, false)
    case 'loop2Dec3':
      return macroInverse(portsIn, 'loop2Dec3', launch, ret, RAY_C3, false, 'loop2DispatchEven')
    case 'loop2DispatchEven':
      return plain('loop2HeadOdd')
    case 'loop1HeadOdd':
      // from start iff c3 = 0, read on the plus port of ray c3
      if (portsIn[RAY_C3.plus] === M) return plain('start')
      return macroExitInverse(portsIn, 'loop1Inc3', RAY_C3, true)
    case 'loop1Inc3':
      if (entry) return plain('loop1Inc2bOdd')
      return macroInverse(portsIn, 'loop1Inc3', launch, ret, RAY_C3, true, 'loop1Inc3')
    case 'loop1Inc2bOdd':
      return macroExitInverse(portsIn, 'loop1Inc2b', RAY_C2, true)
    case 'loop1Inc2b':
      if (entry) return plain('loop1Inc2aOdd')
      return macroInverse(portsIn, 'loop1Inc2b', launch, ret, RAY_C2, true, 'loop1Inc2b')
    case 'loop1Inc2aOdd':
      return macroExitInverse(portsIn, 'loop1Inc2a', RAY_C2, true)
    case 'loop1Inc2a':
      if (entry) return plain('loop1Dec1Odd')
      return macroInverse(portsIn, 'loop1Inc2a', launch, ret, RAY_C2, true, 'loop1Inc2a')
    case 'loop1Dec1Odd':
      return macroExitInverse(portsIn, 'loop1Dec1', RAY_C1, false)
    case 'loop1Dec1':
      return macroInverse(portsIn, 'loop1Dec1', launch, ret, RAY_C1, false, 'loop1DispatchEven')
    case 'loop1DispatchEven':
      return plain('loop1HeadOdd')
    case 'start':
      throw new Error('counter-ray controller: no inverse step before start')
  }
}
