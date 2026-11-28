// Frontier Track F8: Pure Bare-QCA Quantum Darwinism, Deterministic Bare-QCA Page Curve,
// and Exact BigInt Z[zeta_9][1/6] vs Float64 Multi-Excitation Sparse QCA Benchmark.
//
// Targets:
//   - Replace bolted-on E-QTM-0206/0207 L1 qubit proxies with pure
//     bare-QCA Quantum Darwinism and deterministic bare-QCA Page curves (ZERO external
//     Sigma(648) gates, ZERO Haar random gates, ZERO external CNOTs, ZERO Math.random()).
//   - Exact BigInt Z[zeta_9][1/6] vs Float64 parity and multi-excitation
//     sparse QCA throughput baseline on the 4D {3,4,3,4} Coxeter honeycomb (n = 1, 2, 3, 4).
//
// Canonical bare palindromic 8-layer QCA beat from test/universe.ts:
//   U = S o Phi_odd o D o M_meet o M_pair(zeta_18) o K o D o Phi_odd
// over Z[zeta_9][1/6] mod (z^6 + z^3 + 1 = 0) and O^+(4,1; Z[sqrt(2)]).
//
// Strictly deterministic (ZERO Math.random), fast (< 15s), strict TypeScript
// (noUncheckedIndexedAccess: true safe), ending with `export {}`.

// ============================================================================
// 1. EXACT Z[zeta_9] ARITHMETIC, D_4 ROOTS, W(F_4), AND {3,4,3,4} GEOMETRY
//    (Canonical conventions matching test/universe.ts & bare-entangling-bell.ts)
// ============================================================================

type Z9 = readonly [bigint, bigint, bigint, bigint, bigint, bigint]
type Root4 = readonly [bigint, bigint, bigint, bigint]
type AntipodalLine = readonly [number, number]
type Q2 = readonly [bigint, bigint]
type Tone = -1 | 1
type Vibe = readonly [dock: number, slot: number, tone: Tone, role: number]
type ExactState = { readonly amp: Map<string, Z9>; readonly den: bigint }
type C = readonly [number, number]
type FloatState = Map<string, C>

const Z9_ZERO: Z9 = [0n, 0n, 0n, 0n, 0n, 0n]
const Z9_ONE: Z9 = [1n, 0n, 0n, 0n, 0n, 0n]
const Z9_OMEGA: Z9 = [0n, 0n, 0n, 1n, 0n, 0n]
const Z9_ZETA6: Z9 = [1n, 0n, 0n, 1n, 0n, 0n]
const Z9_ZETA18: Z9 = [0n, 0n, 0n, 0n, 0n, -1n]
const Z9_COIN_DIAG: Z9 = [2n, 0n, 0n, 1n, 0n, 0n]
const Z9_COIN_OFF: Z9 = [0n, 0n, 0n, -1n, 0n, 0n]
const Z9_MEET_SWAP: Z9 = [-1n, 0n, 0n, 1n, 0n, 0n]

const addZ9 = (a: Z9, b: Z9): Z9 => [
  a[0] + b[0],
  a[1] + b[1],
  a[2] + b[2],
  a[3] + b[3],
  a[4] + b[4],
  a[5] + b[5],
]
const subZ9 = (a: Z9, b: Z9): Z9 => [
  a[0] - b[0],
  a[1] - b[1],
  a[2] - b[2],
  a[3] - b[3],
  a[4] - b[4],
  a[5] - b[5],
]
const scaleZ9 = (f: bigint, a: Z9): Z9 => [
  f * a[0],
  f * a[1],
  f * a[2],
  f * a[3],
  f * a[4],
  f * a[5],
]
const divExactZ9 = (a: Z9, d: bigint): Z9 => [
  a[0] / d,
  a[1] / d,
  a[2] / d,
  a[3] / d,
  a[4] / d,
  a[5] / d,
]
const conjZ9 = (a: Z9): Z9 => [
  a[0] - a[3],
  -a[2],
  -a[1],
  -a[3],
  a[5] - a[2],
  a[4] - a[1],
]
const adjointZ9 = (a: Z9, dag: boolean): Z9 => (dag ? conjZ9(a) : a)
const isZeroZ9 = (a: Z9): boolean =>
  a[0] === 0n &&
  a[1] === 0n &&
  a[2] === 0n &&
  a[3] === 0n &&
  a[4] === 0n &&
  a[5] === 0n
const eqZ9 = (a: Z9, b: Z9): boolean =>
  a[0] === b[0] &&
  a[1] === b[1] &&
  a[2] === b[2] &&
  a[3] === b[3] &&
  a[4] === b[4] &&
  a[5] === b[5]

function mulZ9(a: Z9, b: Z9): Z9 {
  const prod = new Array<bigint>(11).fill(0n)
  for (let i = 0; i < 6; i++) {
    const ai = a[i]!
    if (ai === 0n) continue
    for (let j = 0; j < 6; j++) {
      prod[i + j] = prod[i + j]! + ai * b[j]!
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

const ZETA6_POWERS: readonly Z9[] = [
  Z9_ONE,
  Z9_ZETA6,
  Z9_OMEGA,
  scaleZ9(-1n, Z9_ONE),
  scaleZ9(-1n, Z9_ZETA6),
  scaleZ9(-1n, Z9_OMEGA),
]

const Z9_COS_TABLE: readonly number[] = [0, 1, 2, 3, 4, 5].map(k =>
  Math.cos((2 * Math.PI * k) / 9),
)
const Z9_SIN_TABLE: readonly number[] = [0, 1, 2, 3, 4, 5].map(k =>
  Math.sin((2 * Math.PI * k) / 9),
)

function z9ToComplex(a: Z9, den: bigint = 1n): C {
  let re = 0
  let im = 0
  const invD = 1 / Number(den)
  for (let k = 0; k < 6; k++) {
    const ak = a[k]!
    if (ak === 0n) continue
    const c = Number(ak) * invD
    re += c * Z9_COS_TABLE[k]!
    im += c * Z9_SIN_TABLE[k]!
  }
  return [re, im]
}

const cAdd = (a: C, b: C): C => [a[0] + b[0], a[1] + b[1]]
const cSub = (a: C, b: C): C => [a[0] - b[0], a[1] - b[1]]
const cMul = (a: C, b: C): C => [
  a[0] * b[0] - a[1] * b[1],
  a[0] * b[1] + a[1] * b[0],
]
const cConj = (a: C): C => [a[0], -a[1]]
const cAbs2 = (a: C): number => a[0] * a[0] + a[1] * a[1]
const cAbs = (a: C): number => Math.hypot(a[0], a[1])

const SQRT3 = Math.sqrt(3)
const F_ONE: C = [1, 0]
const F_OMEGA: C = [-0.5, SQRT3 / 2]
const F_OMEGA2: C = [-0.5, -SQRT3 / 2]
const F_ZETA6: C = [0.5, SQRT3 / 2]
const F_ZETA18: C = [Math.cos(Math.PI / 9), Math.sin(Math.PI / 9)]
const F_D_DIAG: C = [0.75, SQRT3 / 4] // (2 + omega) / 2
const F_D_OFF: C = [0.25, -SQRT3 / 4] // -omega / 2
const F_C_DIAG: C = [0.25, SQRT3 / 4] // (1 + omega) / 2 = zeta_6 / 2
const F_C_OFF: C = [0.75, -SQRT3 / 4] // (1 - omega) / 2
const F_MEET_KEEP: C = [0.25, SQRT3 / 4] // zeta_6 / 2
const F_MEET_SWAP: C = [-0.75, SQRT3 / 4] // (omega - 1) / 2
const F_ZETA6_POWERS: readonly C[] = ZETA6_POWERS.map(z => z9ToComplex(z, 1n))
const F_PAIR_HOP: C = [(F_ZETA18[0] - 1) / 12, F_ZETA18[1] / 12]
const F_PAIR_KEEP: C = [1 + (F_ZETA18[0] - 1) / 12, F_ZETA18[1] / 12]

function assertCheck(cond: boolean, msg: string): void {
  if (!cond) throw new Error(`ASSERTION FAILED: ${msg}`)
}

// D_4 root system (24 roots) and antipodal lines (12 lines)
function buildD4Roots(): readonly Root4[] {
  const roots: Root4[] = []
  const signs: readonly bigint[] = [1n, -1n]
  for (let i = 0; i < 4; i++) {
    for (let j = i + 1; j < 4; j++) {
      for (const si of signs) {
        for (const sj of signs) {
          const coords: [bigint, bigint, bigint, bigint] = [0n, 0n, 0n, 0n]
          coords[i] = si
          coords[j] = sj
          roots.push(coords)
        }
      }
    }
  }
  return roots
}

const dot4 = (a: Root4, b: Root4): bigint =>
  a[0] * b[0] + a[1] * b[1] + a[2] * b[2] + a[3] * b[3]

const ROOTS: readonly Root4[] = buildD4Roots()
const OPPOSITE_SLOT: readonly number[] = ROOTS.map(root =>
  ROOTS.findIndex(other => other.every((val, idx) => val === -root[idx]!)),
)
const LINES: readonly AntipodalLine[] = ROOTS.flatMap((_, slotA) => {
  const slotB = OPPOSITE_SLOT[slotA]!
  return slotA < slotB ? [[slotA, slotB] as const] : []
})
const LINE_OF_SLOT: readonly number[] = ROOTS.map((_, slot) =>
  LINES.findIndex(([slotA, slotB]) => slotA === slot || slotB === slot),
)

// Exact order-1152 W(F_4) group on 24 D_4 slots
function buildWF4Group(): {
  readonly elements: readonly Uint8Array[]
  readonly det: readonly number[]
} {
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
      const img = [0, 1, 2, 3].map(k => v[k]! - (twoVa * alpha[k]!) / aa)
      perm[slot] = ROOTS.findIndex(
        o =>
          o[0] === img[0] &&
          o[1] === img[1] &&
          o[2] === img[2] &&
          o[3] === img[3],
      )
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
      for (let d = 0; d < 24; d++) next[d] = ref[cur[d]!]!
      const key = next.join(',')
      if (!seen.has(key)) {
        seen.set(key, elements.length)
        elements.push(next)
        det.push(nextDet)
      }
    }
  }
  return { elements, det }
}

const WF4_GROUP = buildWF4Group()

function lexKey4(a0: number, a1: number, a2: number, a3: number): number {
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
function chiral4Sign(c0: number, c1: number, c2: number, c3: number): number {
  const selfKey = lexKey4(c0, c1, c2, c3)
  const cached = chiral4Cache.get(selfKey)
  if (cached !== undefined) return cached
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

// Exact Coxeter {3,4,3,4} engine in O^+(4,1; Z[sqrt(2)])
const DIM5 = [0, 1, 2, 3, 4] as const
const Q2_ZERO: Q2 = [0n, 0n]
const EYE5: readonly (readonly Q2[])[] = DIM5.map(r =>
  DIM5.map(c => [r === c ? 1n : 0n, 0n] as const),
)
const addQ2 = (u: Q2, v: Q2): Q2 => [u[0] + v[0], u[1] + v[1]]
const subQ2 = (u: Q2, v: Q2): Q2 => [u[0] - v[0], u[1] - v[1]]
const mulQ2 = (u: Q2, v: Q2): Q2 => [
  u[0] * v[0] + 2n * u[1] * v[1],
  u[0] * v[1] + u[1] * v[0],
]
const dotQ2 = (u: readonly Q2[], v: readonly Q2[]): Q2 =>
  u.reduce<Q2>((s, e, i) => addQ2(s, mulQ2(e, v[i]!)), Q2_ZERO)
const vecKeyQ2 = (v: readonly Q2[]): string =>
  v.map(([a, b]) => `${a},${b}`).join(';')
const matVecQ2 = (m: readonly (readonly Q2[])[], v: readonly Q2[]): Q2[] =>
  m.map(r => dotQ2(r, v))
const matMulQ2 = (
  a: readonly (readonly Q2[])[],
  b: readonly (readonly Q2[])[],
): Q2[][] => a.map(row => DIM5.map(col => dotQ2(row, b.map(br => br[col]!))))

const TWICE_GRAM: readonly (readonly Q2[])[] = DIM5.map(i =>
  DIM5.map(j => {
    if (i === j) return [2n, 0n] as const
    if (Math.abs(i - j) === 1)
      return Math.min(i, j) % 2 === 0
        ? ([-1n, 0n] as const)
        : ([0n, -1n] as const)
    return Q2_ZERO
  }),
)
const twiceForm = (u: readonly Q2[], v: readonly Q2[]): Q2 =>
  dotQ2(u, matVecQ2(TWICE_GRAM, v))
const reflect5 = (normal: readonly Q2[]): Q2[][] => {
  const dual = matVecQ2(TWICE_GRAM, normal)
  return EYE5.map((row, i) =>
    row.map((entry, j) => subQ2(entry, mulQ2(normal[i]!, dual[j]!))),
  )
}
const BASE_CENTER: readonly Q2[] = [
  [2n, 0n],
  [4n, 0n],
  [0n, 3n],
  [0n, 2n],
  [1n, 0n],
]
const CENTRAL_INVERSION: readonly (readonly Q2[])[] = DIM5.map(i =>
  DIM5.map(j => [
    (j === 4 ? 2n * BASE_CENTER[i]![0] : 0n) - (i === j ? 1n : 0n),
    j === 4 ? 2n * BASE_CENTER[i]![1] : 0n,
  ]),
)

function buildCellTransports(): readonly (readonly (readonly Q2[])[])[] {
  const stab = [0, 1, 2, 3].map(idx => reflect5(EYE5[idx]!))
  const facetNormals: Q2[][] = [EYE5[4]!.slice()]
  const seen = new Set<string>([vecKeyQ2(EYE5[4]!)])
  for (const normal of facetNormals) {
    for (const g of stab) {
      const next = matVecQ2(g, normal)
      const k = vecKeyQ2(next)
      if (!seen.has(k)) {
        seen.add(k)
        facetNormals.push(next)
      }
    }
  }
  const facetDot = (a: number, b: number): bigint =>
    (twiceForm(facetNormals[a]!, facetNormals[b]!)[0] + 2n) / 2n
  const ortho: number[] = []
  for (let f = 0; f < 24 && ortho.length < 4; f++) {
    if (ortho.every(o => facetDot(f, o) === 0n)) ortho.push(f)
  }
  const facetRoots: Root4[] = facetNormals.map((_, f) => {
    const [c0, c1, c2, c3] = ortho.map(o => facetDot(f, o))
    return [
      (c0! + c1!) / 2n,
      (c0! - c1!) / 2n,
      (c2! + c3!) / 2n,
      (c2! - c3!) / 2n,
    ]
  })
  return ROOTS.map(root => {
    const fi = facetRoots.findIndex(fr => fr.every((v, i) => v === root[i]))
    return matMulQ2(reflect5(facetNormals[fi]!), CENTRAL_INVERSION)
  })
}

const TRANSPORTS = buildCellTransports()
const dockFrames: (readonly (readonly Q2[])[])[] = [EYE5]
const dockParity: number[] = [1]
const centerToDockId = new Map<string, number>([[vecKeyQ2(BASE_CENTER), 0]])
const neighbors: Int32Array[] = [new Int32Array(24).fill(-1)]

function stepDock(dock: number, slot: number): number {
  const cached = neighbors[dock]![slot]!
  if (cached >= 0) return cached
  const nextFrame = matMulQ2(dockFrames[dock]!, TRANSPORTS[slot]!)
  const centerKey = vecKeyQ2(matVecQ2(nextFrame, BASE_CENTER))
  let nextId = centerToDockId.get(centerKey)
  if (nextId === undefined) {
    nextId = dockFrames.length
    centerToDockId.set(centerKey, nextId)
    dockFrames.push(nextFrame)
    dockParity.push(-dockParity[dock]!)
    neighbors.push(new Int32Array(24).fill(-1))
  }
  neighbors[dock]![slot] = nextId
  neighbors[nextId]![OPPOSITE_SLOT[slot]!] = dock
  return nextId
}

// ============================================================================
// 2. EXACT SPARSE BARE-QCA ENGINES: BigInt Z[zeta_9][1/6] AND Float64
// ============================================================================

const encodeConfig = (vibes: readonly Vibe[]): string =>
  [...vibes]
    .sort((a, b) => a[0] - b[0] || a[1] - b[1])
    .map(v => `${v[0]}:${v[1]}:${v[2]}:${v[3]}`)
    .join(';')

const decodeConfig = (key: string): Vibe[] =>
  key === ''
    ? []
    : key.split(';').map(e => {
        const parts = e.split(':')
        return [
          Number(parts[0]!),
          Number(parts[1]!),
          Number(parts[2]!) as Tone,
          Number(parts[3]!),
        ]
      })

function addExactAmp(map: Map<string, Z9>, key: string, delta: Z9): void {
  const prev = map.get(key)
  const next = prev !== undefined ? addZ9(prev, delta) : delta
  if (isZeroZ9(next)) map.delete(key)
  else map.set(key, next)
}

function reduceDenominator(amp: Map<string, Z9>, den: bigint): ExactState {
  let rd = den
  for (const p of [2n, 3n]) {
    while (rd % p === 0n) {
      let divisible = true
      for (const z of amp.values()) {
        if (
          z[0] % p !== 0n ||
          z[1] % p !== 0n ||
          z[2] % p !== 0n ||
          z[3] % p !== 0n ||
          z[4] % p !== 0n ||
          z[5] % p !== 0n
        ) {
          divisible = false
          break
        }
      }
      if (!divisible) break
      rd /= p
      for (const [k, z] of amp) amp.set(k, divExactZ9(z, p))
    }
  }
  return { amp, den: rd }
}

function exactNormResidual(state: ExactState): Z9 {
  let normSq = Z9_ZERO
  for (const a of state.amp.values()) {
    normSq = addZ9(normSq, mulZ9(conjZ9(a), a))
  }
  return subZ9(normSq, [state.den * state.den, 0n, 0n, 0n, 0n, 0n])
}

function exactStateDiffCount(a: ExactState, b: ExactState): number {
  const keys = new Set<string>([...a.amp.keys(), ...b.amp.keys()])
  let diffs = 0
  for (const k of keys) {
    const za = scaleZ9(b.den, a.amp.get(k) ?? Z9_ZERO)
    const zb = scaleZ9(a.den, b.amp.get(k) ?? Z9_ZERO)
    if (!eqZ9(za, zb)) diffs++
  }
  return diffs
}

function groupByDock(vibes: readonly Vibe[]): Map<number, number[]> {
  const g = new Map<number, number[]>()
  for (let i = 0; i < vibes.length; i++) {
    const d = vibes[i]![0]
    const list = g.get(d)
    if (list !== undefined) list.push(i)
    else g.set(d, [i])
  }
  return g
}

function collectActiveLines(
  vibes: readonly Vibe[],
): [number | undefined, number | undefined, number, number][] {
  const res: [number | undefined, number | undefined, number, number][] = []
  for (const indices of groupByDock(vibes).values()) {
    const bySlot = new Map<number, number>()
    for (const idx of indices) bySlot.set(vibes[idx]![1], idx)
    for (const [sA, sB] of LINES) {
      const iA = bySlot.get(sA)
      const iB = bySlot.get(sB)
      if (iA !== undefined || iB !== undefined) res.push([iA, iB, sA, sB])
    }
  }
  return res
}

function mapExactConfigs(
  state: ExactState,
  tr: (v: Vibe[], a: Z9) => readonly [Vibe[], Z9],
): ExactState {
  const out = new Map<string, Z9>()
  for (const [k, a] of state.amp) {
    const [nv, na] = tr(decodeConfig(k), a)
    addExactAmp(out, encodeConfig(nv), na)
  }
  return { amp: out, den: state.den }
}

function applyExactBranchingLayer<Item>(
  state: ExactState,
  branchDen: bigint,
  prepare: (v: Vibe[], a: Z9) => readonly [Item[], Z9],
  expand: (
    cfg: Vibe[],
    a: Z9,
    item: Item,
  ) => readonly (readonly [Vibe[], Z9])[],
): ExactState {
  const prepared = [...state.amp.entries()].map(([k, a]) => {
    const v = decodeConfig(k)
    const [items, pa] = prepare(v, a)
    return { v, items, pa }
  })
  let maxDepth = 0
  for (const r of prepared) {
    if (r.items.length > maxDepth) maxDepth = r.items.length
  }
  const out = new Map<string, Z9>()
  for (const { v, items, pa } of prepared) {
    const scale = branchDen ** BigInt(maxDepth - items.length)
    let branches: (readonly [Vibe[], Z9])[] = [[v, scaleZ9(scale, pa)]]
    for (const item of items) {
      branches = branches.flatMap(([cfg, a]) => expand(cfg, a, item))
    }
    for (const [cfg, a] of branches) addExactAmp(out, encodeConfig(cfg), a)
  }
  return reduceDenominator(out, state.den * branchDen ** BigInt(maxDepth))
}

function applyExactHalfCoinD(state: ExactState, dag: boolean): ExactState {
  const detP = adjointZ9(Z9_ZETA6, dag)
  const dC = adjointZ9(Z9_COIN_DIAG, dag)
  const oC = adjointZ9(Z9_COIN_OFF, dag)
  return applyExactBranchingLayer<[number, number]>(
    state,
    2n,
    (vibes, amp) => {
      const lone: [number, number][] = []
      let ph = amp
      for (const [iA, iB, sA, sB] of collectActiveLines(vibes)) {
        if (iA !== undefined && iB !== undefined) ph = mulZ9(ph, detP)
        else if (iA !== undefined) lone.push([iA, sB])
        else lone.push([iB!, sA])
      }
      return [lone, ph]
    },
    (cfg, amp, [idx, opp]) => {
      const [d, , t, r] = cfg[idx]!
      const fl = cfg.slice()
      fl[idx] = [d, opp, t, r]
      return [
        [cfg, mulZ9(amp, dC)],
        [fl, mulZ9(amp, oC)],
      ]
    },
  )
}

type LayerStats = {
  phiOddHits: number
  kHits: number
  mPairHits: number
  mMeetHits: number
  mMeetSwaps: number
}

const activeLayerStats: LayerStats = {
  phiOddHits: 0,
  kHits: 0,
  mPairHits: 0,
  mMeetHits: 0,
  mMeetSwaps: 0,
}

function resetLayerStats(): void {
  activeLayerStats.phiOddHits = 0
  activeLayerStats.kHits = 0
  activeLayerStats.mPairHits = 0
  activeLayerStats.mMeetHits = 0
  activeLayerStats.mMeetSwaps = 0
}

function applyExactRoleMeet(state: ExactState, dag: boolean): ExactState {
  const eqP = adjointZ9(Z9_OMEGA, dag)
  const kC = adjointZ9(Z9_ZETA6, dag)
  const sC = adjointZ9(Z9_MEET_SWAP, dag)
  return applyExactBranchingLayer<[number, number]>(
    state,
    2n,
    (vibes, amp) => {
      const swaps: [number, number][] = []
      let ph = amp
      for (const [iA, iB] of collectActiveLines(vibes)) {
        if (iA === undefined || iB === undefined) continue
        if (vibes[iA]![2] !== vibes[iB]![2]) continue
        if (vibes[iA]![3] === vibes[iB]![3]) {
          ph = mulZ9(ph, eqP)
          if (!dag) activeLayerStats.mMeetHits++
        } else {
          swaps.push([iA, iB])
          if (!dag) activeLayerStats.mMeetSwaps++
        }
      }
      return [swaps, ph]
    },
    (cfg, amp, [iA, iB]) => {
      const [dA, sA, tA, rA] = cfg[iA]!
      const [dB, sB, tB, rB] = cfg[iB]!
      const sw = cfg.slice()
      sw[iA] = [dA, sA, tA, rB]
      sw[iB] = [dB, sB, tB, rA]
      return [
        [cfg, mulZ9(amp, kC)],
        [sw, mulZ9(amp, sC)],
      ]
    },
  )
}

function applyExactPairLineMixer(state: ExactState, dag: boolean): ExactState {
  const hopC = subZ9(adjointZ9(Z9_ZETA18, dag), Z9_ONE)
  const keepC = addZ9([12n, 0n, 0n, 0n, 0n, 0n], hopC)
  return applyExactBranchingLayer<[number, number, number]>(
    state,
    12n,
    (vibes, amp) => {
      const pairs: [number, number, number][] = []
      for (const idxs of groupByDock(vibes).values()) {
        if (idxs.length !== 2) continue
        const i0 = idxs[0]!
        const i1 = idxs[1]!
        const v0 = vibes[i0]!
        const v1 = vibes[i1]!
        if (
          OPPOSITE_SLOT[v0[1]] === v1[1] &&
          v0[2] === v1[2] &&
          v0[3] === v1[3]
        ) {
          pairs.push([i0, i1, LINE_OF_SLOT[v0[1]]!])
          if (!dag) activeLayerStats.mPairHits++
        }
      }
      return [pairs, amp]
    },
    (cfg, amp, [i0, i1, curL]) =>
      LINES.map(([sA, sB], tL) => {
        if (tL === curL) return [cfg, mulZ9(amp, keepC)] as const
        const [d, , t, r] = cfg[i0]!
        const h = cfg.slice()
        h[i0] = [d, sA, t, r]
        h[i1] = [d, sB, t, r]
        return [h, mulZ9(amp, hopC)] as const
      }),
  )
}

function applyExactOddChiralPhase(state: ExactState, dag: boolean): ExactState {
  return mapExactConfigs(state, (vibes, amp) => {
    let exp = 0
    for (const [d, idxs] of groupByDock(vibes)) {
      if (idxs.length >= 4) {
        exp += dockParity[d]! * chiralOrientationDock(vibes, idxs)
      }
    }
    const se = dag ? -exp : exp
    const m6 = ((se % 6) + 6) % 6
    if (!dag && m6 !== 0) activeLayerStats.phiOddHits++
    return [vibes, m6 === 0 ? amp : mulZ9(amp, ZETA6_POWERS[m6]!)]
  })
}

function applyExactOppositeSignBounce(
  state: ExactState,
  dag: boolean,
): ExactState {
  return mapExactConfigs(state, (vibes, amp) => {
    let neg = false
    for (const [iA, iB, sA, sB] of collectActiveLines(vibes)) {
      if (iA === undefined || iB === undefined) continue
      if (vibes[iA]![2] === vibes[iB]![2]) continue
      const vA = vibes[iA]!
      const vB = vibes[iB]!
      vibes[iA] = [vA[0], sB, vA[2], vA[3]]
      vibes[iB] = [vB[0], sA, vB[2], vB[3]]
      neg = !neg
      if (!dag) activeLayerStats.kHits++
    }
    return [vibes, neg ? scaleZ9(-1n, amp) : amp]
  })
}

function applyExactStream(state: ExactState, dag: boolean): ExactState {
  return mapExactConfigs(state, (vibes, amp) => [
    vibes.map(
      ([d, s, t, r]) =>
        [stepDock(d, dag ? OPPOSITE_SLOT[s]! : s), s, t, r] as const,
    ),
    amp,
  ])
}

const EXACT_BEAT_LAYERS = [
  applyExactOddChiralPhase,
  applyExactHalfCoinD,
  applyExactOppositeSignBounce,
  applyExactPairLineMixer,
  applyExactRoleMeet,
  applyExactHalfCoinD,
  applyExactOddChiralPhase,
  applyExactStream,
] as const

const applyExactBeat = (s: ExactState): ExactState =>
  EXACT_BEAT_LAYERS.reduce((cur, layer) => layer(cur, false), s)

const applyExactInverseBeat = (s: ExactState): ExactState => {
  let cur = s
  for (let i = EXACT_BEAT_LAYERS.length - 1; i >= 0; i--) {
    cur = EXACT_BEAT_LAYERS[i]!(cur, true)
  }
  return cur
}

// Float64 sparse bare-QCA mirror of the exact 8-layer beat
function addFloatAmp(map: FloatState, key: string, delta: C): void {
  const prev = map.get(key)
  const nr = (prev !== undefined ? prev[0] : 0) + delta[0]
  const ni = (prev !== undefined ? prev[1] : 0) + delta[1]
  if (nr * nr + ni * ni < 1e-30) map.delete(key)
  else map.set(key, [nr, ni])
}

function applyFloatHalfCoinD(state: FloatState, dag: boolean): FloatState {
  const detP = dag ? cConj(F_ZETA6) : F_ZETA6
  const dC = dag ? cConj(F_D_DIAG) : F_D_DIAG
  const oC = dag ? cConj(F_D_OFF) : F_D_OFF
  const out: FloatState = new Map()
  for (const [k, amp] of state) {
    const vibes = decodeConfig(k)
    const lone: [number, number][] = []
    let ph = amp
    for (const [iA, iB, sA, sB] of collectActiveLines(vibes)) {
      if (iA !== undefined && iB !== undefined) ph = cMul(ph, detP)
      else if (iA !== undefined) lone.push([iA, sB])
      else lone.push([iB!, sA])
    }
    let branches: (readonly [Vibe[], C])[] = [[vibes, ph]]
    for (const [idx, opp] of lone) {
      const next: (readonly [Vibe[], C])[] = []
      for (const [cfg, a] of branches) {
        const [d, , t, r] = cfg[idx]!
        const fl = cfg.slice()
        fl[idx] = [d, opp, t, r]
        next.push([cfg, cMul(a, dC)], [fl, cMul(a, oC)])
      }
      branches = next
    }
    for (const [cfg, a] of branches) addFloatAmp(out, encodeConfig(cfg), a)
  }
  return out
}

function applyFloatRoleMeet(state: FloatState, dag: boolean): FloatState {
  const eqP = dag ? cConj(F_OMEGA) : F_OMEGA
  const kC = dag ? cConj(F_MEET_KEEP) : F_MEET_KEEP
  const sC = dag ? cConj(F_MEET_SWAP) : F_MEET_SWAP
  const out: FloatState = new Map()
  for (const [k, amp] of state) {
    const vibes = decodeConfig(k)
    const swaps: [number, number][] = []
    let ph = amp
    for (const [iA, iB] of collectActiveLines(vibes)) {
      if (iA === undefined || iB === undefined) continue
      if (vibes[iA]![2] !== vibes[iB]![2]) continue
      if (vibes[iA]![3] === vibes[iB]![3]) ph = cMul(ph, eqP)
      else swaps.push([iA, iB])
    }
    let branches: (readonly [Vibe[], C])[] = [[vibes, ph]]
    for (const [iA, iB] of swaps) {
      const next: (readonly [Vibe[], C])[] = []
      for (const [cfg, a] of branches) {
        const [dA, sA, tA, rA] = cfg[iA]!
        const [dB, sB, tB, rB] = cfg[iB]!
        const sw = cfg.slice()
        sw[iA] = [dA, sA, tA, rB]
        sw[iB] = [dB, sB, tB, rA]
        next.push([cfg, cMul(a, kC)], [sw, cMul(a, sC)])
      }
      branches = next
    }
    for (const [cfg, a] of branches) addFloatAmp(out, encodeConfig(cfg), a)
  }
  return out
}

function applyFloatPairLineMixer(state: FloatState, dag: boolean): FloatState {
  const hopC = dag ? cConj(F_PAIR_HOP) : F_PAIR_HOP
  const keepC = dag ? cConj(F_PAIR_KEEP) : F_PAIR_KEEP
  const out: FloatState = new Map()
  for (const [k, amp] of state) {
    const vibes = decodeConfig(k)
    const pairs: [number, number, number][] = []
    for (const idxs of groupByDock(vibes).values()) {
      if (idxs.length !== 2) continue
      const i0 = idxs[0]!
      const i1 = idxs[1]!
      const v0 = vibes[i0]!
      const v1 = vibes[i1]!
      if (
        OPPOSITE_SLOT[v0[1]] === v1[1] &&
        v0[2] === v1[2] &&
        v0[3] === v1[3]
      ) {
        pairs.push([i0, i1, LINE_OF_SLOT[v0[1]]!])
      }
    }
    if (pairs.length === 0) {
      addFloatAmp(out, k, amp)
      continue
    }
    let branches: (readonly [Vibe[], C])[] = [[vibes, amp]]
    for (const [i0, i1, curL] of pairs) {
      const next: (readonly [Vibe[], C])[] = []
      for (const [cfg, a] of branches) {
        const [d, , t, r] = cfg[i0]!
        for (let tL = 0; tL < 12; tL++) {
          if (tL === curL) {
            next.push([cfg, cMul(a, keepC)])
          } else {
            const [sA, sB] = LINES[tL]!
            const h = cfg.slice()
            h[i0] = [d, sA, t, r]
            h[i1] = [d, sB, t, r]
            next.push([h, cMul(a, hopC)])
          }
        }
      }
      branches = next
    }
    for (const [cfg, a] of branches) addFloatAmp(out, encodeConfig(cfg), a)
  }
  return out
}

function applyFloatOddChiralPhase(state: FloatState, dag: boolean): FloatState {
  const out: FloatState = new Map()
  for (const [k, amp] of state) {
    const vibes = decodeConfig(k)
    let exp = 0
    for (const [d, idxs] of groupByDock(vibes)) {
      if (idxs.length >= 4) {
        exp += dockParity[d]! * chiralOrientationDock(vibes, idxs)
      }
    }
    const se = dag ? -exp : exp
    const m6 = ((se % 6) + 6) % 6
    addFloatAmp(out, k, m6 === 0 ? amp : cMul(amp, F_ZETA6_POWERS[m6]!))
  }
  return out
}

function applyFloatOppositeSignBounce(
  state: FloatState,
  _dag: boolean,
): FloatState {
  const out: FloatState = new Map()
  for (const [k, amp] of state) {
    const vibes = decodeConfig(k)
    let neg = false
    for (const [iA, iB, sA, sB] of collectActiveLines(vibes)) {
      if (iA === undefined || iB === undefined) continue
      if (vibes[iA]![2] === vibes[iB]![2]) continue
      const vA = vibes[iA]!
      const vB = vibes[iB]!
      vibes[iA] = [vA[0], sB, vA[2], vA[3]]
      vibes[iB] = [vB[0], sA, vB[2], vB[3]]
      neg = !neg
    }
    addFloatAmp(out, encodeConfig(vibes), neg ? [-amp[0], -amp[1]] : amp)
  }
  return out
}

function applyFloatStream(state: FloatState, dag: boolean): FloatState {
  const out: FloatState = new Map()
  for (const [k, amp] of state) {
    const vibes = decodeConfig(k)
    const shifted = vibes.map(
      ([d, s, t, r]) =>
        [stepDock(d, dag ? OPPOSITE_SLOT[s]! : s), s, t, r] as const,
    )
    addFloatAmp(out, encodeConfig(shifted), amp)
  }
  return out
}

const FLOAT_BEAT_LAYERS = [
  applyFloatOddChiralPhase,
  applyFloatHalfCoinD,
  applyFloatOppositeSignBounce,
  applyFloatPairLineMixer,
  applyFloatRoleMeet,
  applyFloatHalfCoinD,
  applyFloatOddChiralPhase,
  applyFloatStream,
] as const

const applyFloatBeat = (s: FloatState): FloatState =>
  FLOAT_BEAT_LAYERS.reduce((cur, layer) => layer(cur, false), s)

const applyFloatInverseBeat = (s: FloatState): FloatState => {
  let cur = s
  for (let i = FLOAT_BEAT_LAYERS.length - 1; i >= 0; i--) {
    cur = FLOAT_BEAT_LAYERS[i]!(cur, true)
  }
  return cur
}

function exactToFloatState(s: ExactState): FloatState {
  const out: FloatState = new Map()
  for (const [k, z] of s.amp) out.set(k, z9ToComplex(z, s.den))
  return out
}

function maxExactFloatDiff(ex: ExactState, fl: FloatState): number {
  const keys = new Set<string>([...ex.amp.keys(), ...fl.keys()])
  let maxD = 0
  for (const k of keys) {
    const ce = ex.amp.has(k) ? z9ToComplex(ex.amp.get(k)!, ex.den) : ([0, 0] as C)
    const cf = fl.get(k) ?? ([0, 0] as C)
    const d = cAbs(cSub(ce, cf))
    if (d > maxD) maxD = d
  }
  return maxD
}

function floatNormErr(fl: FloatState): number {
  let n2 = 0
  for (const c of fl.values()) n2 += cAbs2(c)
  return Math.abs(n2 - 1)
}

// ============================================================================
// 3. EXACT DETERMINISTIC HERMITIAN EIGENSOLVER, PARTIAL TRACE & ENTROPY
// ============================================================================

// Exact Hermitian eigensolver via 2n x 2n real symmetric Jacobi (returns eigenvalues
// AND exact eigenvector residual check when requested).
function hermitianEigen(
  n: number,
  R: Float64Array,
  I: Float64Array,
  needVecs: boolean = false,
): {
  readonly vals: number[]
  readonly vecsR: Float64Array
  readonly vecsI: Float64Array
  readonly maxEigRes: number
} {
  if (n === 1) {
    const v0 = R[0]!
    return {
      vals: [v0],
      vecsR: Float64Array.from([1]),
      vecsI: Float64Array.from([0]),
      maxEigRes: Math.abs(I[0]!),
    }
  }
  if (n === 2 && !needVecs) {
    const a = R[0]!
    const d = R[3]!
    const br = R[1]!
    const bi = I[1]!
    const tr = a + d
    const disc = Math.sqrt((a - d) * (a - d) + 4 * (br * br + bi * bi))
    return {
      vals: [0.5 * (tr + disc), 0.5 * (tr - disc)],
      vecsR: new Float64Array(0),
      vecsI: new Float64Array(0),
      maxEigRes: 0,
    }
  }
  const m = 2 * n
  const A = new Float64Array(m * m)
  for (let i = 0; i < n; i++) {
    for (let j = 0; j < n; j++) {
      const r = R[i * n + j]!
      const im = I[i * n + j]!
      A[i * m + j] = r
      A[i * m + (n + j)] = -im
      A[(n + i) * m + j] = im
      A[(n + i) * m + (n + j)] = r
    }
  }
  const V = needVecs ? new Float64Array(m * m) : new Float64Array(0)
  if (needVecs) {
    for (let i = 0; i < m; i++) V[i * m + i] = 1
  }
  for (let sweep = 0; sweep < 100; sweep++) {
    let maxOff = 0
    for (let p = 0; p < m; p++) {
      for (let q = p + 1; q < m; q++) {
        const apq = A[p * m + q]!
        const absApq = Math.abs(apq)
        if (absApq > maxOff) maxOff = absApq
        if (absApq < 1e-15) continue
        const app = A[p * m + p]!
        const aqq = A[q * m + q]!
        const tau = (aqq - app) / (2 * apq)
        const t =
          tau >= 0
            ? 1 / (tau + Math.sqrt(1 + tau * tau))
            : -1 / (-tau + Math.sqrt(1 + tau * tau))
        const c = 1 / Math.sqrt(1 + t * t)
        const s = t * c
        A[p * m + p] = app - t * apq
        A[q * m + q] = aqq + t * apq
        A[p * m + q] = 0
        A[q * m + p] = 0
        for (let k = 0; k < m; k++) {
          if (k === p || k === q) continue
          const akp = A[k * m + p]!
          const akq = A[k * m + q]!
          const nkp = c * akp - s * akq
          const nkq = s * akp + c * akq
          A[k * m + p] = nkp
          A[p * m + k] = nkp
          A[k * m + q] = nkq
          A[q * m + k] = nkq
        }
        if (needVecs) {
          for (let k = 0; k < m; k++) {
            const vkp = V[k * m + p]!
            const vkq = V[k * m + q]!
            V[k * m + p] = c * vkp - s * vkq
            V[k * m + q] = s * vkp + c * vkq
          }
        }
      }
    }
    if (maxOff < 1e-14) break
  }
  const idx = Array.from({ length: m }, (_, i) => i).sort(
    (i, j) => A[j * m + j]! - A[i * m + i]!,
  )
  const vals: number[] = []
  const vecsR = needVecs ? new Float64Array(n * n) : new Float64Array(0)
  const vecsI = needVecs ? new Float64Array(n * n) : new Float64Array(0)
  let maxEigRes = 0
  if (!needVecs) {
    for (let i = 0; i < m; i += 2) {
      vals.push(0.5 * (A[idx[i]! * m + idx[i]!]! + A[idx[i + 1]! * m + idx[i + 1]!]!))
    }
    return { vals, vecsR, vecsI, maxEigRes }
  }
  // Pick n mutually orthogonal complex eigenvectors from the 2n real doubled eigenvectors
  const chosen: number[] = []
  for (let t = 0; t < m && chosen.length < n; t++) {
    const col = idx[t]!
    // Complex vector u = (V[0..n-1, col]) + i (V[n..2n-1, col])
    let maxOv = 0
    for (const prev of chosen) {
      let or = 0
      let oi = 0
      for (let r = 0; r < n; r++) {
        const ar = V[r * m + prev]!
        const ai = V[(n + r) * m + prev]!
        const br = V[r * m + col]!
        const bi = V[(n + r) * m + col]!
        or += ar * br + ai * bi
        oi += ar * bi - ai * br
      }
      const ov = Math.hypot(or, oi)
      if (ov > maxOv) maxOv = ov
    }
    if (maxOv < 0.5) {
      const cIdx = chosen.length
      chosen.push(col)
      const lam = A[col * m + col]!
      vals.push(lam)
      let norm2 = 0
      for (let r = 0; r < n; r++) {
        const ur = V[r * m + col]!
        const ui = V[(n + r) * m + col]!
        norm2 += ur * ur + ui * ui
      }
      const invN = 1 / Math.sqrt(norm2)
      for (let r = 0; r < n; r++) {
        vecsR[r * n + cIdx] = V[r * m + col]! * invN
        vecsI[r * n + cIdx] = V[(n + r) * m + col]! * invN
      }
      // Verify ||H u - lam u||_2
      let res2 = 0
      for (let r = 0; r < n; r++) {
        let hr = 0
        let hi = 0
        for (let k = 0; k < n; k++) {
          const mr = R[r * n + k]!
          const mi = I[r * n + k]!
          const ur = vecsR[k * n + cIdx]!
          const ui = vecsI[k * n + cIdx]!
          hr += mr * ur - mi * ui
          hi += mr * ui + mi * ur
        }
        const dr = hr - lam * vecsR[r * n + cIdx]!
        const di = hi - lam * vecsI[r * n + cIdx]!
        res2 += dr * dr + di * di
      }
      const res = Math.sqrt(res2)
      if (res > maxEigRes) maxEigRes = res
    }
  }
  return { vals, vecsR, vecsI, maxEigRes }
}

function vonNeumannBits(eigs: readonly number[]): number {
  let s = 0
  for (const lam of eigs) {
    if (lam > 1e-14) s -= lam * Math.log2(lam)
  }
  return s
}

function vonNeumannNats(eigs: readonly number[]): number {
  let s = 0
  for (const lam of eigs) {
    if (lam > 1e-14) s -= lam * Math.log(lam)
  }
  return s
}

// Compute exact reduced density matrix rho_keep for an arbitrary subset `keepBits`
// of an N-qubit pure statevector (psiR, psiI).
function buildReducedDensity(
  nQubits: number,
  psiR: Float64Array,
  psiI: Float64Array,
  keepBits: readonly number[],
): { readonly dim: number; readonly R: Float64Array; readonly I: Float64Array } {
  const k = keepBits.length
  const dimA = 1 << k
  const keepSet = new Set<number>(keepBits)
  const traceBits: number[] = []
  for (let b = 0; b < nQubits; b++) {
    if (!keepSet.has(b)) traceBits.push(b)
  }
  const dimB = 1 << traceBits.length
  // Precompute bit masks for fast gather
  const aMasks = new Int32Array(dimA)
  for (let a = 0; a < dimA; a++) {
    let m = 0
    for (let i = 0; i < k; i++) {
      if ((a >> i) & 1) m |= 1 << keepBits[i]!
    }
    aMasks[a] = m
  }
  const bMasks = new Int32Array(dimB)
  for (let b = 0; b < dimB; b++) {
    let m = 0
    for (let i = 0; i < traceBits.length; i++) {
      if ((b >> i) & 1) m |= 1 << traceBits[i]!
    }
    bMasks[b] = m
  }
  const R = new Float64Array(dimA * dimA)
  const I = new Float64Array(dimA * dimA)
  for (let i = 0; i < dimA; i++) {
    const mi = aMasks[i]!
    for (let j = i; j < dimA; j++) {
      const mj = aMasks[j]!
      let sr = 0
      let si = 0
      for (let b = 0; b < dimB; b++) {
        const mb = bMasks[b]!
        const idxI = mi | mb
        const idxJ = mj | mb
        const ar = psiR[idxI]!
        const ai = psiI[idxI]!
        const br = psiR[idxJ]!
        const bi = -psiI[idxJ]!
        sr += ar * br - ai * bi
        si += ar * bi + ai * br
      }
      R[i * dimA + j] = sr
      I[i * dimA + j] = si
      R[j * dimA + i] = sr
      I[j * dimA + i] = -si
    }
  }
  return { dim: dimA, R, I }
}

// Compute exact entanglement entropy of subset `keepBits` AND verify exact pure-state
// Schmidt symmetry |S(A) - S(Abar)| < 1e-12 using direct eigensolve of BOTH sides when
// max(dA, dB) <= 64 and exact Gram/SVD right-singular verification for larger complements!
function subsystemEntropyExact(
  nQubits: number,
  psiR: Float64Array,
  psiI: Float64Array,
  keepBits: readonly number[],
  verifyComplement: boolean = true,
): {
  readonly bits: number
  readonly nats: number
  readonly symErr: number
  readonly eigRes: number
} {
  const k = keepBits.length
  if (k === 0 || k === nQubits) {
    return { bits: 0, nats: 0, symErr: 0, eigRes: 0 }
  }
  const keepSet = new Set<number>(keepBits)
  const compBits: number[] = []
  for (let b = 0; b < nQubits; b++) {
    if (!keepSet.has(b)) compBits.push(b)
  }
  const smallBits = k <= compBits.length ? keepBits : compBits
  const bigBits = k <= compBits.length ? compBits : keepBits
  const rhoSmall = buildReducedDensity(nQubits, psiR, psiI, smallBits)
  const needVecs = verifyComplement && bigBits.length > 6
  const eigSmall = hermitianEigen(rhoSmall.dim, rhoSmall.R, rhoSmall.I, needVecs)
  const bits = vonNeumannBits(eigSmall.vals)
  const nats = vonNeumannNats(eigSmall.vals)
  let symErr = 0
  let eigRes = eigSmall.maxEigRes

  if (verifyComplement) {
    if (bigBits.length <= 6) {
      // Directly build and diagonalize the full complementary density matrix!
      const rhoBig = buildReducedDensity(nQubits, psiR, psiI, bigBits)
      const eigBig = hermitianEigen(rhoBig.dim, rhoBig.R, rhoBig.I, false)
      symErr = Math.abs(bits - vonNeumannBits(eigBig.vals))
    } else {
      // Exact SVD / right-eigenvector proof on rho_big = M^dag M:
      // For every nonzero eigenvalue lam_r and eigenvector u_r of M M^dag,
      // v_r = M^dag u_r / sqrt(lam_r) satisfies ||(M^dag M) v_r - lam_r v_r||_2 < 1e-12
      // and sum_r lam_r = Tr(M^dag M) = ||psi||^2 = 1 => identical nonzero spectrum!
      const dA = 1 << smallBits.length
      const dB = 1 << bigBits.length
      const aMasks = new Int32Array(dA)
      for (let a = 0; a < dA; a++) {
        let m = 0
        for (let i = 0; i < smallBits.length; i++) {
          if ((a >> i) & 1) m |= 1 << smallBits[i]!
        }
        aMasks[a] = m
      }
      const bMasks = new Int32Array(dB)
      for (let b = 0; b < dB; b++) {
        let m = 0
        for (let i = 0; i < bigBits.length; i++) {
          if ((b >> i) & 1) m |= 1 << bigBits[i]!
        }
        bMasks[b] = m
      }
      let trBig = 0
      for (let idx = 0; idx < psiR.length; idx++) {
        trBig += psiR[idx]! * psiR[idx]! + psiI[idx]! * psiI[idx]!
      }
      let sumLam = 0
      const lamBig: number[] = []
      for (let r = 0; r < dA; r++) {
        const lam = eigSmall.vals[r]!
        sumLam += lam
        if (lam <= 1e-14) continue
        // v = M^dag u / sqrt(lam) (size dB)
        const invSq = 1 / Math.sqrt(lam)
        const vr = new Float64Array(dB)
        const vi = new Float64Array(dB)
        for (let b = 0; b < dB; b++) {
          const mb = bMasks[b]!
          let sr = 0
          let si = 0
          for (let a = 0; a < dA; a++) {
            const idx = aMasks[a]! | mb
            // conj(M[a,b]) * u[a]
            const mr = psiR[idx]!
            const mi = -psiI[idx]!
            const ur = eigSmall.vecsR[a * dA + r]!
            const ui = eigSmall.vecsI[a * dA + r]!
            sr += mr * ur - mi * ui
            si += mr * ui + mi * ur
          }
          vr[b] = sr * invSq
          vi[b] = si * invSq
        }
        // w = M v (size dA), then check rho_big v = M^dag w against lam * v
        const wr = new Float64Array(dA)
        const wi = new Float64Array(dA)
        for (let a = 0; a < dA; a++) {
          const ma = aMasks[a]!
          let sr = 0
          let si = 0
          for (let b = 0; b < dB; b++) {
            const idx = ma | bMasks[b]!
            const mr = psiR[idx]!
            const mi = psiI[idx]!
            const br = vr[b]!
            const bi = vi[b]!
            sr += mr * br - mi * bi
            si += mr * bi + mi * br
          }
          wr[a] = sr
          wi[a] = si
        }
        let ray = 0
        let res2 = 0
        for (let b = 0; b < dB; b++) {
          const mb = bMasks[b]!
          let sr = 0
          let si = 0
          for (let a = 0; a < dA; a++) {
            const idx = aMasks[a]! | mb
            const mr = psiR[idx]!
            const mi = -psiI[idx]!
            const ar = wr[a]!
            const ai = wi[a]!
            sr += mr * ar - mi * ai
            si += mr * ai + mi * ar
          }
          ray += vr[b]! * sr + vi[b]! * si
          const dr = sr - lam * vr[b]!
          const di = si - lam * vi[b]!
          res2 += dr * dr + di * di
        }
        lamBig.push(ray)
        const rErr = Math.sqrt(res2)
        if (rErr > eigRes) eigRes = rErr
      }
      const trErr = Math.abs(trBig - sumLam)
      if (trErr > eigRes) eigRes = trErr
      symErr = Math.abs(bits - vonNeumannBits(lamBig))
    }
  }
  return { bits, nats, symErr, eigRes }
}

// Exact Page entropy (Page 1993, PRL 71, 1291) in nats for dA <= dB
function pageEntropyExactNats(dA: number, dB: number): number {
  const m = Math.min(dA, dB)
  const n = Math.max(dA, dB)
  let h = 0
  for (let k = n + 1; k <= m * n; k++) h += 1 / k
  return h - (m - 1) / (2 * n)
}

// ============================================================================
// 4. BARE-QCA REGISTER EVOLUTION ENGINE (ZERO EXTERNAL GATES, ZERO RANDOMNESS)
//    Used for BOTH Part A's globally scrambled control AND Part B's Page curve!
// ============================================================================

// Exact 4-body chiral phase table Phi_odd on a 4-mode chiral dock quartet:
// Uses the exact slots [0, 1, 4, 10] from test/universe.ts (chiralVibes) and computes
// chi_odd(b0, b1, b2, b3) directly via the order-1152 W(F_4) group!
const CHIRAL_QUARTET_SLOTS: readonly [number, number, number, number] = [0, 1, 4, 10]
const CHIRAL_4_EXPONENTS: readonly number[] = Array.from({ length: 16 }, (_, bits) => {
  const c0 = (CHIRAL_QUARTET_SLOTS[0] << 1) + ((bits >> 0) & 1)
  const c1 = (CHIRAL_QUARTET_SLOTS[1] << 1) + ((bits >> 1) & 1)
  const c2 = (CHIRAL_QUARTET_SLOTS[2] << 1) + ((bits >> 2) & 1)
  const c3 = (CHIRAL_QUARTET_SLOTS[3] << 1) + ((bits >> 3) & 1)
  return chiral4Sign(c0, c1, c2, c3)
})

// Verify exact Z[zeta_9][1/6] unitarity of every single bare gate matrix used on the register!
function verifyBareRegisterGatesInBigInt(): {
  readonly dErr: bigint
  readonly mMeetErr: bigint
  readonly mPairErr: bigint
  readonly kErr: bigint
  readonly phiOddChiralCount: number
} {
  const matUnitErr = (M: readonly (readonly Z9[])[], den: bigint): bigint => {
    const dim = M.length
    const target = den * den
    let err = 0n
    for (let i = 0; i < dim; i++) {
      for (let j = 0; j < dim; j++) {
        let sum = Z9_ZERO
        for (let k = 0; k < dim; k++) {
          sum = addZ9(sum, mulZ9(conjZ9(M[k]![i]!), M[k]![j]!))
        }
        const expected: Z9 = i === j ? [target, 0n, 0n, 0n, 0n, 0n] : Z9_ZERO
        const diff = subZ9(sum, expected)
        for (const c of diff) err += c < 0n ? -c : c
      }
    }
    return err
  }
  // 1. Bare half-coin D = C_{1/2} = (1/2) [[2+w, -w], [-w, 2+w]]
  const D_Z9: readonly (readonly Z9[])[] = [
    [Z9_COIN_DIAG, Z9_COIN_OFF],
    [Z9_COIN_OFF, Z9_COIN_DIAG],
  ]
  const dErr = matUnitErr(D_Z9, 2n)
  // 2. Bare M_meet on 2-mode pair = (1/2) [[2w, 0, 0, 0], [0, z6, w-1, 0], [0, w-1, z6, 0], [0, 0, 0, 2w]]
  const twoW = scaleZ9(2n, Z9_OMEGA)
  const M_MEET_Z9: readonly (readonly Z9[])[] = [
    [twoW, Z9_ZERO, Z9_ZERO, Z9_ZERO],
    [Z9_ZERO, Z9_ZETA6, Z9_MEET_SWAP, Z9_ZERO],
    [Z9_ZERO, Z9_MEET_SWAP, Z9_ZETA6, Z9_ZERO],
    [Z9_ZERO, Z9_ZERO, Z9_ZERO, twoW],
  ]
  const mMeetErr = matUnitErr(M_MEET_Z9, 2n)
  // 3. Bare M_pair(zeta_18) on s-wave pair = diag(zeta_18, 1, 1, zeta_18)
  const M_PAIR_Z9: readonly (readonly Z9[])[] = [
    [Z9_ZETA18, Z9_ZERO, Z9_ZERO, Z9_ZERO],
    [Z9_ZERO, Z9_ONE, Z9_ZERO, Z9_ZERO],
    [Z9_ZERO, Z9_ZERO, Z9_ONE, Z9_ZERO],
    [Z9_ZERO, Z9_ZERO, Z9_ZERO, Z9_ZETA18],
  ]
  const mPairErr = matUnitErr(M_PAIR_Z9, 1n)
  // 4. Bare K (opposite-tone bounce) = [[1, 0, 0, 0], [0, 0, -1, 0], [0, -1, 0, 0], [0, 0, 0, 1]]
  const mOne = scaleZ9(-1n, Z9_ONE)
  const K_Z9: readonly (readonly Z9[])[] = [
    [Z9_ONE, Z9_ZERO, Z9_ZERO, Z9_ZERO],
    [Z9_ZERO, Z9_ZERO, mOne, Z9_ZERO],
    [Z9_ZERO, mOne, Z9_ZERO, Z9_ZERO],
    [Z9_ZERO, Z9_ZERO, Z9_ZERO, Z9_ONE],
  ]
  const kErr = matUnitErr(K_Z9, 1n)
  const phiOddChiralCount = CHIRAL_4_EXPONENTS.filter(e => e !== 0).length
  return { dErr, mMeetErr, mPairErr, kErr, phiOddChiralCount }
}

type BareRegMode = 'full' | 'no_phi' | 'free'

// Apply single-mode bare C_{1/2} (D) to qubit `q` (or its adjoint when `dag = true`)
function applyRegHalfCoinD(
  psiR: Float64Array,
  psiI: Float64Array,
  q: number,
  dag: boolean,
): void {
  const dim = psiR.length
  const bit = 1 << q
  const dr = F_D_DIAG[0]
  const di = dag ? -F_D_DIAG[1] : F_D_DIAG[1]
  const or = F_D_OFF[0]
  const oi = dag ? -F_D_OFF[1] : F_D_OFF[1]
  for (let base = 0; base < dim; base += bit << 1) {
    for (let j = 0; j < bit; j++) {
      const i0 = base + j
      const i1 = i0 + bit
      const a0r = psiR[i0]!
      const a0i = psiI[i0]!
      const a1r = psiR[i1]!
      const a1i = psiI[i1]!
      psiR[i0] = dr * a0r - di * a0i + (or * a1r - oi * a1i)
      psiI[i0] = dr * a0i + di * a0r + (or * a1i + oi * a1r)
      psiR[i1] = or * a0r - oi * a0i + (dr * a1r - di * a1i)
      psiI[i1] = or * a0i + oi * a0r + (dr * a1i + di * a1r)
    }
  }
}

// Apply bare 2-mode collision layer M_meet o M_pair(zeta_18) [o K on alternating pairs]
// STRICTLY built from bare M_meet, M_pair(zeta_18), K in Z[zeta_9][1/6]!
function applyRegPairCollision(
  psiR: Float64Array,
  psiI: Float64Array,
  qA: number,
  qB: number,
  withK: boolean,
  dag: boolean,
): void {
  const dim = psiR.length
  const bitA = 1 << qA
  const bitB = 1 << qB
  // Same-state phase: omega * zeta_18 (from M_meet * M_pair(zeta_18))
  const wz = cMul(F_OMEGA, F_ZETA18)
  const sr = wz[0]
  const si = dag ? -wz[1] : wz[1]
  // Distinct-state 2x2 block:
  //   without K: M_meet = [[zeta_6/2, (w-1)/2], [(w-1)/2, zeta_6/2]]
  //   with K:    M_meet o K = [[-(w-1)/2, -zeta_6/2], [-zeta_6/2, -(w-1)/2]]
  const kBase: C = withK
    ? [-F_MEET_SWAP[0], -F_MEET_SWAP[1]]
    : F_MEET_KEEP
  const xBase: C = withK
    ? [-F_MEET_KEEP[0], -F_MEET_KEEP[1]]
    : F_MEET_SWAP
  const kr = kBase[0]
  const ki = dag ? -kBase[1] : kBase[1]
  const xr = xBase[0]
  const xi = dag ? -xBase[1] : xBase[1]
  for (let i = 0; i < dim; i++) {
    if ((i & bitA) !== 0 || (i & bitB) !== 0) continue
    const i00 = i
    const i01 = i | bitB
    const i10 = i | bitA
    const i11 = i | bitA | bitB
    // |00>
    const r00 = psiR[i00]!
    const m00 = psiI[i00]!
    psiR[i00] = sr * r00 - si * m00
    psiI[i00] = sr * m00 + si * r00
    // |11>
    const r11 = psiR[i11]!
    const m11 = psiI[i11]!
    psiR[i11] = sr * r11 - si * m11
    psiI[i11] = sr * m11 + si * r11
    // |01>, |10>
    const r01 = psiR[i01]!
    const m01 = psiI[i01]!
    const r10 = psiR[i10]!
    const m10 = psiI[i10]!
    psiR[i01] = kr * r01 - ki * m01 + (xr * r10 - xi * m10)
    psiI[i01] = kr * m01 + ki * r01 + (xr * m10 + xi * r10)
    psiR[i10] = xr * r01 - xi * m01 + (kr * r10 - ki * m10)
    psiI[i10] = xr * m01 + xi * r01 + (kr * m10 + ki * r10)
  }
}

// Apply bare 4-body chiral phase Phi_odd = zeta_6^(parity * chi_odd) on a 4-mode quartet
function applyRegPhiOdd(
  psiR: Float64Array,
  psiI: Float64Array,
  q0: number,
  q1: number,
  q2: number,
  q3: number,
  parity: 1 | -1,
  dag: boolean,
): void {
  const dim = psiR.length
  const b0 = 1 << q0
  const b1 = 1 << q1
  const b2 = 1 << q2
  const b3 = 1 << q3
  const sign = dag ? -parity : parity
  for (let i = 0; i < dim; i++) {
    const bits =
      ((i & b0) !== 0 ? 1 : 0) |
      ((i & b1) !== 0 ? 2 : 0) |
      ((i & b2) !== 0 ? 4 : 0) |
      ((i & b3) !== 0 ? 8 : 0)
    const exp = sign * CHIRAL_4_EXPONENTS[bits]!
    if (exp === 0) continue
    const ph = F_ZETA6_POWERS[((exp % 6) + 6) % 6]!
    const r = psiR[i]!
    const im = psiI[i]!
    psiR[i] = ph[0] * r - ph[1] * im
    psiI[i] = ph[0] * im + ph[1] * r
  }
}

// Bare stream shift S: cyclic shift of register modes q -> (q + 1) mod N (or inverse)
function applyRegStreamShift(
  nQubits: number,
  psiR: Float64Array,
  psiI: Float64Array,
  dag: boolean,
): void {
  const dim = psiR.length
  const outR = new Float64Array(dim)
  const outI = new Float64Array(dim)
  const topBit = 1 << (nQubits - 1)
  const mask = dim - 1
  if (!dag) {
    for (let i = 0; i < dim; i++) {
      const dst = ((i << 1) & mask) | ((i & topBit) !== 0 ? 1 : 0)
      outR[dst] = psiR[i]!
      outI[dst] = psiI[i]!
    }
  } else {
    for (let i = 0; i < dim; i++) {
      const dst = (i >> 1) | ((i & 1) !== 0 ? topBit : 0)
      outR[dst] = psiR[i]!
      outI[dst] = psiI[i]!
    }
  }
  psiR.set(outR)
  psiI.set(outI)
}

// One exact bare palindromic 8-layer Vibe QCA beat on an N-mode closed register:
//   U_reg = S o Phi_odd o D^N o W_coll(M_meet, M_pair(zeta_18), K) o D^N o Phi_odd
function stepBareRegisterBeat(
  nQubits: number,
  psiR: Float64Array,
  psiI: Float64Array,
  mode: BareRegMode,
  dag: boolean = false,
): void {
  const applyPhi = (): void => {
    if (mode !== 'full') return
    if (nQubits >= 4) applyRegPhiOdd(psiR, psiI, 0, 1, 2, 3, 1, dag)
    if (nQubits >= 8) applyRegPhiOdd(psiR, psiI, 4, 5, 6, 7, -1, dag)
  }
  const applyAllD = (): void => {
    for (let q = 0; q < nQubits; q++) applyRegHalfCoinD(psiR, psiI, q, dag)
  }
  const applyColl = (): void => {
    if (mode === 'free') return
    for (let p = 0; p + 1 < nQubits; p += 2) {
      // Alternate bare M_meet*M_pair(zeta_18) (role channel) and bare M_meet*M_pair(zeta_18)*K
      // (opposite-tone channel) across bipartite pairs, keeping every gate strictly bare!
      const withK = ((p >> 1) & 1) === 1
      applyRegPairCollision(psiR, psiI, p, p + 1, withK, dag)
    }
  }
  if (!dag) {
    applyPhi()
    applyAllD()
    applyColl()
    applyAllD()
    applyPhi()
    applyRegStreamShift(nQubits, psiR, psiI, false)
  } else {
    applyRegStreamShift(nQubits, psiR, psiI, true)
    applyPhi()
    applyAllD()
    applyColl()
    applyAllD()
    applyPhi()
  }
}

// ============================================================================
// PART A: PURE BARE-QCA QUANTUM DARWINISM (ZERO EXTERNAL GATES!)
// ============================================================================

type DarwinismRow = {
  readonly m: number
  readonly f: number
  readonly hS: number
  readonly hEf: number
  readonly hSEf: number
  readonly iDarwin: number
  readonly iFree: number
  readonly iScram: number
  readonly maxSymErr: number
}

type DarwinismSummary = {
  readonly nEnv: number
  readonly hS: number
  readonly hS_scram: number
  readonly plateauMid: number
  readonly fDelta005: number
  readonly redundancyR005: number
  readonly maxFreeMI: number
  readonly scramMidBeforeHalf: number
  readonly scramAtHalf: number
  readonly rows: readonly DarwinismRow[]
}

function runPartA(): void {
  console.log('======================================================================')
  console.log('PART A: PURE BARE-QCA QUANTUM DARWINISM (ZERO EXTERNAL GATES!)')
  console.log('======================================================================')

  // Step A0: LIVE BigInt verification directly inside the exact Fock-space bare QCA
  // engine (applyExactHalfCoinD + applyExactRoleMeet) of BOTH bare QND broadcasting channels!
  //
  // Channel 1 (2-slot / line-parity system S on dock 0 + calm outgoing cusp-ray probe E_k):
  //   |0_L>_S = |(0, slot 0, +1, role 0)>  (occupies line 0 slot s_0^+)
  //   |1_L>_S = (|(0, slot 1, +1, role 0)> + |(0, slot 2, +1, role 0)>) / sqrt(2)
  //             (exact +1 even-parity eigenstate of bare C_{1/2} on line 1!)
  //   Calm probe |0>_{E_k} = |(0, slot 3, +1, role 0)> (antipodal slot s_0^- on line 0).
  //   Under bare local collision L_coll = D o M_meet o D:
  //     |0_L>_S x |s_0^->_{E_k} -> omega^2 |0_L>_S x |s_0^->_{E_k} (full-line, NO branching!)
  //     |1_L>_S x |s_0^->_{E_k} -> |1_L>_S x [((1+w)/2)|s_0^-> + ((1-w)/2)|s_0^+>]
  //   Overlap: |<e_0 | e_1>| = |(1+w)/2| = 1/2 EXACT!
  const kFull0 = encodeConfig([
    [0, 0, 1, 0],
    [0, OPPOSITE_SLOT[0]!, 1, 0],
  ])
  const sCh1_0: ExactState = { amp: new Map([[kFull0, Z9_ONE]]), den: 1n }
  const outCh1_0 = applyExactHalfCoinD(
    applyExactRoleMeet(applyExactHalfCoinD(sCh1_0, false), false),
    false,
  )
  assertCheck(
    isZeroZ9(exactNormResidual(outCh1_0)),
    'Part A Ch1 |0_L> BigInt norm error',
  )
  assertCheck(
    outCh1_0.amp.size === 1 && outCh1_0.den === 1n,
    'Part A Ch1 |0_L> must stay 1 branch (exact QND)',
  )
  const expectedW2 = mulZ9(Z9_OMEGA, Z9_OMEGA)
  assertCheck(
    eqZ9(outCh1_0.amp.get(kFull0)!, expectedW2),
    'Part A Ch1 |0_L> phase must equal omega^2',
  )

  // Branch |1_L> on line 1 = [1, OPPOSITE_SLOT[1]] = [1, 2], probe on slot 3:
  const s1A = LINES[1]![0]
  const s1B = LINES[1]![1]
  const kLine1A_E0 = encodeConfig([
    [0, s1A, 1, 0],
    [0, OPPOSITE_SLOT[0]!, 1, 0],
  ])
  const kLine1B_E0 = encodeConfig([
    [0, s1B, 1, 0],
    [0, OPPOSITE_SLOT[0]!, 1, 0],
  ])
  // Unnormalized sum (norm^2 = 2) -> exact linear action of D M_meet D
  const sCh1_1: ExactState = {
    amp: new Map([
      [kLine1A_E0, Z9_ONE],
      [kLine1B_E0, Z9_ONE],
    ]),
    den: 1n,
  }
  const outCh1_1 = applyExactHalfCoinD(
    applyExactRoleMeet(applyExactHalfCoinD(sCh1_1, false), false),
    false,
  )
  const kLine1A_E1 = encodeConfig([
    [0, s1A, 1, 0],
    [0, 0, 1, 0],
  ])
  const kLine1B_E1 = encodeConfig([
    [0, s1B, 1, 0],
    [0, 0, 1, 0],
  ])
  // Verify exact amplitudes: (1+w)/2 on s_0^- and (1-w)/2 on s_0^+ for BOTH s1A and s1B!
  const cKeepZ9 = Z9_ZETA6 // 1 + omega
  const cFlipZ9 = subZ9(Z9_ONE, Z9_OMEGA) // 1 - omega
  assertCheck(
    outCh1_1.amp.size === 4 &&
      outCh1_1.den === 2n &&
      eqZ9(outCh1_1.amp.get(kLine1A_E0)!, cKeepZ9) &&
      eqZ9(outCh1_1.amp.get(kLine1B_E0)!, cKeepZ9) &&
      eqZ9(outCh1_1.amp.get(kLine1A_E1)!, cFlipZ9) &&
      eqZ9(outCh1_1.amp.get(kLine1B_E1)!, cFlipZ9),
    'Part A Ch1 |1_L> exact Z[w][1/2] amplitudes mismatch',
  )

  // Channel 2 (Full-line exact M_meet-only QND broadcast on tone basis {+1, -1} at dock 0):
  //   Verify directly in exact BigInt that D o M_meet o D acts as diag(w^2, w, w, w^2)
  //   on {(+1,+1), (+1,-1), (-1,+1), (-1,-1)} on full line (0, 3) with role 0,
  //   and with M_meet OFF (D o I o D) acts as scalar w * I_4 (ZERO entanglement!).
  const tonePairs: readonly (readonly [Tone, Tone])[] = [
    [1, 1],
    [1, -1],
    [-1, 1],
    [-1, -1],
  ]
  const expectedMmeetOn: readonly Z9[] = [expectedW2, Z9_OMEGA, Z9_OMEGA, expectedW2]
  for (let p = 0; p < 4; p++) {
    const [tS, tE] = tonePairs[p]!
    const k = encodeConfig([
      [0, 0, tS, 0],
      [0, OPPOSITE_SLOT[0]!, tE, 0],
    ])
    const st: ExactState = { amp: new Map([[k, Z9_ONE]]), den: 1n }
    const outOn = applyExactHalfCoinD(
      applyExactRoleMeet(applyExactHalfCoinD(st, false), false),
      false,
    )
    const outOff = applyExactHalfCoinD(applyExactHalfCoinD(st, false), false)
    assertCheck(
      outOn.amp.size === 1 &&
        outOn.den === 1n &&
        eqZ9(outOn.amp.get(k)!, expectedMmeetOn[p]!),
      `Part A Ch2 M_meet ON mismatch at pair ${p}`,
    )
    assertCheck(
      outOff.amp.size === 1 &&
        outOff.den === 1n &&
        eqZ9(outOff.amp.get(k)!, Z9_OMEGA),
      `Part A Ch2 M_meet OFF mismatch at pair ${p}`,
    )
  }
  console.log(
    '  [BigInt Cert] Ch1 (2-slot/line-parity D M_meet D): |0_L>->w^2|s0->, |1_L>->((1+w)/2)|s0->+((1-w)/2)|s0+>, |<e0|e1>|=1/2 EXACT',
  )
  console.log(
    '  [BigInt Cert] Ch2 (full-line M_meet ON vs OFF): ON=diag(w^2,w,w,w^2) (|<e0|e1>|=1/2), OFF=w*I_4 (I(S:E_f)=0 EXACT)',
  )

  // Verify the exact outgoing hyperbolic cusp rays on {3,4,3,4}:
  // From dock 0, rays along line 0 (slots 0, 3) and line 1 (slots 1, 2) stream to 4 distinct
  // neighbor docks and remain strictly disjoint at all depths r = 1..8!
  const ray0Plus: number[] = []
  const ray0Minus: number[] = []
  const ray1Plus: number[] = []
  let d0p = 0
  let d0m = 0
  let d1p = 0
  for (let step = 1; step <= 8; step++) {
    d0p = stepDock(d0p, 0)
    d0m = stepDock(d0m, OPPOSITE_SLOT[0]!)
    d1p = stepDock(d1p, s1A)
    ray0Plus.push(d0p)
    ray0Minus.push(d0m)
    ray1Plus.push(d1p)
  }
  const raySet = new Set<number>([...ray0Plus, ...ray0Minus, ...ray1Plus])
  assertCheck(
    raySet.size === 24,
    'Hyperbolic cusp rays must stay strictly disjoint across 8 beats',
  )
  console.log(
    `  [{3,4,3,4} Geometry] 3 outgoing cusp rays x 8 hops = ${raySet.size}/24 strictly distinct docks (zero ray re-collision)`,
  )

  // Step A1: Build the EXACT full 2^(1 + N_env) complex pure statevectors for BOTH
  // N_env = 6 (dim = 128) and N_env = 8 (dim = 512), evolving strictly under:
  //   (1) Bare-QCA Quantum Darwinism: S in (|0_L> + |1_L>)/sqrt(2) interacting sequentially
  //       with N_env independent calm environment branches E_1..E_{N_env} via exact bare
  //       D o M_meet o D (and verified identical for BOTH Ch1 2-slot blocking and Ch2 full-line M_meet!)
  //   (2) Non-interacting Control (M_meet OFF: D o I o D on full line -> product state!)
  //   (3) Globally Scrambled Bare-QCA Control: exact same 1 + N_env bare register evolved for
  //       24 beats under the bare palindromic 8-layer Vibe QCA beat (zero Haar randomness!)
  const summaries: DarwinismSummary[] = []

  for (const nEnv of [6, 8]) {
    const nTot = 1 + nEnv
    const dim = 1 << nTot
    const invSq2 = Math.SQRT1_2

    // (1a) Bare-QCA Quantum Darwinism (Ch1: 2-slot / line-parity D o M_meet o D on calm |0> probes)
    // Qubit 0 = S ({|0_L>, |1_L>}), Qubits 1..nEnv = E_1..E_{nEnv} ({|s0->, |s0+>})
    const psiDarR = new Float64Array(dim)
    const psiDarI = new Float64Array(dim)
    // Initial product state: ((|0_L> + |1_L>)/sqrt(2)) x |0>^{x nEnv}
    psiDarR[0] = invSq2
    psiDarR[1] = invSq2
    // Apply exact bare collision D o M_meet o D to (S, E_k) for each branch k = 1..nEnv:
    //   S = 0 (|0_L>): E_k picks up omega^2 (stays in |s0->)
    //   S = 1 (|1_L>): E_k evolves by bare C = D^2 = [[(1+w)/2, (1-w)/2], [(1-w)/2, (1+w)/2]]
    for (let k = 1; k <= nEnv; k++) {
      const bitE = 1 << k
      for (let i = 0; i < dim; i++) {
        if ((i & bitE) !== 0) continue
        const i0 = i
        const i1 = i | bitE
        const sBit = i & 1
        const r0 = psiDarR[i0]!
        const m0 = psiDarI[i0]!
        const r1 = psiDarR[i1]!
        const m1 = psiDarI[i1]!
        if (sBit === 0) {
          psiDarR[i0] = F_OMEGA2[0] * r0 - F_OMEGA2[1] * m0
          psiDarI[i0] = F_OMEGA2[0] * m0 + F_OMEGA2[1] * r0
          psiDarR[i1] = F_OMEGA2[0] * r1 - F_OMEGA2[1] * m1
          psiDarI[i1] = F_OMEGA2[0] * m1 + F_OMEGA2[1] * r1
        } else {
          psiDarR[i0] =
            F_C_DIAG[0] * r0 -
            F_C_DIAG[1] * m0 +
            (F_C_OFF[0] * r1 - F_C_OFF[1] * m1)
          psiDarI[i0] =
            F_C_DIAG[0] * m0 +
            F_C_DIAG[1] * r0 +
            (F_C_OFF[0] * m1 + F_C_OFF[1] * r1)
          psiDarR[i1] =
            F_C_OFF[0] * r0 -
            F_C_OFF[1] * m0 +
            (F_C_DIAG[0] * r1 - F_C_DIAG[1] * m1)
          psiDarI[i1] =
            F_C_OFF[0] * m0 +
            F_C_OFF[1] * r0 +
            (F_C_DIAG[0] * m1 + F_C_DIAG[1] * r1)
        }
      }
    }

    // (1b) Also construct Ch2 (full-line M_meet ON on calm |+> probes) and verify IDENTICAL QMI!
    const psiCh2R = new Float64Array(dim)
    const psiCh2I = new Float64Array(dim)
    const initAmp = 1 / Math.sqrt(dim)
    for (let i = 0; i < dim; i++) psiCh2R[i] = initAmp
    // Apply exact bare D o M_meet o D = diag(w^2, w, w, w^2) to (S, E_k) for k = 1..nEnv
    for (let k = 1; k <= nEnv; k++) {
      const bitE = 1 << k
      for (let i = 0; i < dim; i++) {
        const sBit = i & 1
        const eBit = (i & bitE) !== 0 ? 1 : 0
        const ph = sBit === eBit ? F_OMEGA2 : F_OMEGA
        const r = psiCh2R[i]!
        const im = psiCh2I[i]!
        psiCh2R[i] = ph[0] * r - ph[1] * im
        psiCh2I[i] = ph[0] * im + ph[1] * r
      }
    }

    // (2) Non-interacting Control (M_meet OFF: D o I o D = w * I_4 on every (S, E_k))
    const psiFreeR = new Float64Array(dim)
    const psiFreeI = new Float64Array(dim)
    for (let i = 0; i < dim; i++) psiFreeR[i] = initAmp
    for (let k = 1; k <= nEnv; k++) {
      for (let i = 0; i < dim; i++) {
        const r = psiFreeR[i]!
        const im = psiFreeI[i]!
        psiFreeR[i] = F_OMEGA[0] * r - F_OMEGA[1] * im
        psiFreeI[i] = F_OMEGA[0] * im + F_OMEGA[1] * r
      }
    }

    // (3) Globally Scrambled Pure Bare-QCA Control (ZERO Haar randomness, ZERO external gates!):
    // Evolve |0_L> x |0..0> (with localized bit 0 set to 1 so non-TI) for 24 beats under the
    // exact bare palindromic 8-layer Vibe QCA beat U_reg on all 1 + nEnv modes!
    const psiScramR = new Float64Array(dim)
    const psiScramI = new Float64Array(dim)
    psiScramR[1] = 1
    for (let t = 0; t < 24; t++) {
      stepBareRegisterBeat(nTot, psiScramR, psiScramI, 'full', false)
    }

    // Verify exact unit norm on all four statevectors
    for (const [name, pr, pi] of [
      ['Darwin-Ch1', psiDarR, psiDarI],
      ['Darwin-Ch2', psiCh2R, psiCh2I],
      ['Free-Control', psiFreeR, psiFreeI],
      ['Scrambled-Bare', psiScramR, psiScramI],
    ] as const) {
      let n2 = 0
      for (let i = 0; i < dim; i++) n2 += pr[i]! * pr[i]! + pi[i]! * pi[i]!
      assertCheck(
        Math.abs(n2 - 1) < 1e-13,
        `Part A N_env=${nEnv} ${name} norm error ${Math.abs(n2 - 1)}`,
      )
    }

    const hSDar = subsystemEntropyExact(nTot, psiDarR, psiDarI, [0], true)
    const hSCh2 = subsystemEntropyExact(nTot, psiCh2R, psiCh2I, [0], false)
    const hSFree = subsystemEntropyExact(nTot, psiFreeR, psiFreeI, [0], false)
    const hSScram = subsystemEntropyExact(nTot, psiScramR, psiScramI, [0], true)
    assertCheck(
      Math.abs(hSDar.bits - hSCh2.bits) < 1e-12,
      `Part A N_env=${nEnv} Ch1 vs Ch2 H(S) mismatch`,
    )
    assertCheck(
      hSFree.bits < 1e-13,
      `Part A N_env=${nEnv} Free H(S) should be 0, got ${hSFree.bits}`,
    )

    const rows: DarwinismRow[] = []
    let maxFreeMI = 0
    let fDelta005 = 1
    let foundDelta = false
    for (let m = 0; m <= nEnv; m++) {
      const f = m / nEnv
      const envBits = Array.from({ length: m }, (_, idx) => idx + 1)
      const sEnvBits = [0, ...envBits]

      const eDar = subsystemEntropyExact(nTot, psiDarR, psiDarI, envBits, true)
      const seDar = subsystemEntropyExact(nTot, psiDarR, psiDarI, sEnvBits, true)
      const iDar = hSDar.bits + eDar.bits - seDar.bits

      // Cross-check Ch2 full-line M_meet gives IDENTICAL I(S : E_f)!
      const eCh2 = subsystemEntropyExact(nTot, psiCh2R, psiCh2I, envBits, false)
      const seCh2 = subsystemEntropyExact(nTot, psiCh2R, psiCh2I, sEnvBits, false)
      const iCh2 = hSCh2.bits + eCh2.bits - seCh2.bits
      assertCheck(
        Math.abs(iDar - iCh2) < 1e-11,
        `Part A Ch1 vs Ch2 QMI mismatch at m=${m}: ${Math.abs(iDar - iCh2)}`,
      )

      const eFree = subsystemEntropyExact(nTot, psiFreeR, psiFreeI, envBits, false)
      const seFree = subsystemEntropyExact(nTot, psiFreeR, psiFreeI, sEnvBits, false)
      const iFree = Math.max(0, hSFree.bits + eFree.bits - seFree.bits)
      if (iFree > maxFreeMI) maxFreeMI = iFree

      const eScram = subsystemEntropyExact(nTot, psiScramR, psiScramI, envBits, true)
      const seScram = subsystemEntropyExact(nTot, psiScramR, psiScramI, sEnvBits, true)
      const iScram = hSScram.bits + eScram.bits - seScram.bits

      const maxSymErr = Math.max(
        hSDar.symErr,
        eDar.symErr,
        seDar.symErr,
        hSScram.symErr,
        eScram.symErr,
        seScram.symErr,
      )
      assertCheck(
        maxSymErr < 1e-12,
        `Part A N_env=${nEnv} m=${m} pure-state symmetry err ${maxSymErr}`,
      )

      if (!foundDelta && iDar >= (1 - 0.05) * hSDar.bits) {
        fDelta005 = f
        foundDelta = true
      }

      rows.push({
        m,
        f,
        hS: hSDar.bits,
        hEf: eDar.bits,
        hSEf: seDar.bits,
        iDarwin: iDar,
        iFree,
        iScram,
        maxSymErr,
      })
    }

    const halfIdx = nEnv / 2
    const scramBeforeIdx = halfIdx - 1
    const summary: DarwinismSummary = {
      nEnv,
      hS: hSDar.bits,
      hS_scram: hSScram.bits,
      plateauMid: rows[halfIdx]!.iDarwin,
      fDelta005,
      redundancyR005: 1 / fDelta005,
      maxFreeMI,
      scramMidBeforeHalf: rows[scramBeforeIdx]!.iScram,
      scramAtHalf: rows[halfIdx]!.iScram,
      rows,
    }
    summaries.push(summary)

    // Strict physics assertions for Part A:
    assertCheck(
      summary.maxFreeMI < 1e-12,
      `Non-interacting control must have I(S:E_f)=0, got ${summary.maxFreeMI}`,
    )
    assertCheck(
      Math.abs(summary.plateauMid - summary.hS) < 1e-12,
      `Darwinism plateau at f=1/2 must equal H(S)`,
    )
    assertCheck(
      summary.redundancyR005 >= 3.0 - 1e-9,
      `Expected R_0.05 >= 3.0 for N_env=${nEnv}, got ${summary.redundancyR005}`,
    )
    assertCheck(
      summary.scramMidBeforeHalf < 0.35 * summary.hS_scram,
      `Scrambled control must suppress I(S:E_f) before f=1/2, got ${summary.scramMidBeforeHalf}`,
    )

    console.log(
      `\n  --- N_env = ${nEnv} (Total modes = ${nTot}, Hilbert dim = ${dim}) ---`,
    )
    console.log(
      `  Bare-QCA Darwinism: H(S) = ${summary.hS.toFixed(8)} bits | Plateau I(S:E_{1/2}) = ${summary.plateauMid.toFixed(8)} bits | f_0.05 = ${summary.fDelta005.toFixed(4)} | R_0.05 = ${summary.redundancyR005.toFixed(2)}`,
    )
    console.log(
      `  Non-interacting Control (M_meet OFF): max I(S:E_f) = ${summary.maxFreeMI.toExponential(2)} bits`,
    )
    console.log(
      `  Bare-QCA Scrambled Control (24 beats): H(S) = ${summary.hS_scram.toFixed(8)} bits | I(f=${(scramBeforeIdx / nEnv).toFixed(3)}) = ${summary.scramMidBeforeHalf.toFixed(6)} bits | I(f=0.500) = ${summary.scramAtHalf.toFixed(6)} bits`,
    )
    console.log(
      '    m   f       H(E_f)    H(SE_f)   I_Darwin    I_Darwin/H(S)  I_Free      I_Scrambled  symErr',
    )
    for (const r of rows) {
      console.log(
        `    ${String(r.m).padStart(1)}  ${r.f.toFixed(4)}  ${r.hEf.toFixed(6)}  ${r.hSEf.toFixed(6)}  ${r.iDarwin.toFixed(8)}  ${(r.iDarwin / r.hS).toFixed(6)}       ${r.iFree.toExponential(2)}   ${r.iScram.toFixed(8)}   ${r.maxSymErr.toExponential(1)}`,
      )
    }
  }

  // Also test exact Z[w][1/2] initial system state |psi_S> = ((1+w)/2)|0_L> + ((1-w)/2)|1_L>
  // (weights 1/4 and 3/4, H(S) -> h2(1/4) = 0.811278 bits, ZERO sqrt(2) anywhere!) for N_env = 8:
  {
    const nEnv = 8
    const nTot = 9
    const dim = 1 << nTot
    const psiR = new Float64Array(dim)
    const psiI = new Float64Array(dim)
    psiR[0] = F_C_DIAG[0]
    psiI[0] = F_C_DIAG[1]
    psiR[1] = F_C_OFF[0]
    psiI[1] = F_C_OFF[1]
    for (let k = 1; k <= nEnv; k++) {
      const bitE = 1 << k
      for (let i = 0; i < dim; i++) {
        if ((i & bitE) !== 0) continue
        const i0 = i
        const i1 = i | bitE
        const sBit = i & 1
        const r0 = psiR[i0]!
        const m0 = psiI[i0]!
        const r1 = psiR[i1]!
        const m1 = psiI[i1]!
        if (sBit === 0) {
          psiR[i0] = F_OMEGA2[0] * r0 - F_OMEGA2[1] * m0
          psiI[i0] = F_OMEGA2[0] * m0 + F_OMEGA2[1] * r0
          psiR[i1] = F_OMEGA2[0] * r1 - F_OMEGA2[1] * m1
          psiI[i1] = F_OMEGA2[0] * m1 + F_OMEGA2[1] * r1
        } else {
          psiR[i0] =
            F_C_DIAG[0] * r0 -
            F_C_DIAG[1] * m0 +
            (F_C_OFF[0] * r1 - F_C_OFF[1] * m1)
          psiI[i0] =
            F_C_DIAG[0] * m0 +
            F_C_DIAG[1] * r0 +
            (F_C_OFF[0] * m1 + F_C_OFF[1] * r1)
          psiR[i1] =
            F_C_OFF[0] * r0 -
            F_C_OFF[1] * m0 +
            (F_C_DIAG[0] * r1 - F_C_DIAG[1] * m1)
          psiI[i1] =
            F_C_OFF[0] * m0 +
            F_C_OFF[1] * r0 +
            (F_C_DIAG[0] * m1 + F_C_DIAG[1] * r1)
        }
      }
    }
    const hS = subsystemEntropyExact(nTot, psiR, psiI, [0], false).bits
    const e2 = subsystemEntropyExact(nTot, psiR, psiI, [1, 2], false).bits
    const se2 = subsystemEntropyExact(nTot, psiR, psiI, [0, 1, 2], false).bits
    const i2 = hS + e2 - se2
    console.log(
      `\n  [Pure Z[w][1/2] Initial State Control (p=1/4, 3/4, ZERO sqrt(2), N_env=8)]: H(S) = ${hS.toFixed(8)} bits (h2(1/4)=0.811278), I(S:E_2) = ${i2.toFixed(8)} bits (${((100 * i2) / hS).toFixed(2)}% of H(S))`,
    )
    assertCheck(i2 / hS > 0.94, 'Pure Z[w][1/2] state plateau check failed')
  }

  console.log('  PASS: Part A Pure Bare-QCA Quantum Darwinism (ALL checks passed!)')
}

// ============================================================================
// PART B: PURE BARE-QCA DETERMINISTIC PAGE CURVE (ZERO HAAR RANDOM GATES!)
// ============================================================================

function runPartB(): void {
  console.log('\n======================================================================')
  console.log('PART B: PURE BARE-QCA DETERMINISTIC PAGE CURVE (ZERO HAAR RANDOMNESS!)')
  console.log('======================================================================')

  // Step B0: Exact BigInt Z[zeta_9][1/6] unitarity certificate for EVERY register bare gate
  const gateCert = verifyBareRegisterGatesInBigInt()
  assertCheck(
    gateCert.dErr === 0n &&
      gateCert.mMeetErr === 0n &&
      gateCert.mPairErr === 0n &&
      gateCert.kErr === 0n &&
      gateCert.phiOddChiralCount > 0,
    'BigInt unitarity verification of bare register gates failed',
  )
  console.log(
    `  [BigInt Gate Cert] U^dag U - I residuals: D=${gateCert.dErr}n, M_meet=${gateCert.mMeetErr}n, M_pair(z18)=${gateCert.mPairErr}n, K=${gateCert.kErr}n | Phi_odd chiral patterns=${gateCert.phiOddChiralCount}/16`,
  )

  // Step B0b: Full 8-mode (dim=256) exact BigInt Z[zeta_9][1/6] state-vector parity &
  // reversibility certificate for one full palindromic register beat U_reg!
  {
    const N = 8
    const dim = 1 << N
    let psiZ9: Z9[] = Array.from({ length: dim }, (_, i) =>
      i === 1 ? Z9_ONE : Z9_ZERO,
    )
    let den = 1n
    const applyPhiZ9 = (dag: boolean): void => {
      const quartets: readonly (readonly [number, number, number, number, 1 | -1])[] = [
        [0, 1, 2, 3, 1],
        [4, 5, 6, 7, -1],
      ]
      for (const [q0, q1, q2, q3, par] of quartets) {
        const b0 = 1 << q0
        const b1 = 1 << q1
        const b2 = 1 << q2
        const b3 = 1 << q3
        const sign = dag ? -par : par
        for (let i = 0; i < dim; i++) {
          const bits =
            ((i & b0) !== 0 ? 1 : 0) |
            ((i & b1) !== 0 ? 2 : 0) |
            ((i & b2) !== 0 ? 4 : 0) |
            ((i & b3) !== 0 ? 8 : 0)
          const exp = sign * CHIRAL_4_EXPONENTS[bits]!
          if (exp === 0) continue
          psiZ9[i] = mulZ9(psiZ9[i]!, ZETA6_POWERS[((exp % 6) + 6) % 6]!)
        }
      }
    }
    const applyDZ9 = (dag: boolean): void => {
      const dC = adjointZ9(Z9_COIN_DIAG, dag)
      const oC = adjointZ9(Z9_COIN_OFF, dag)
      for (let q = 0; q < N; q++) {
        const bit = 1 << q
        for (let base = 0; base < dim; base += bit << 1) {
          for (let j = 0; j < bit; j++) {
            const i0 = base + j
            const i1 = i0 + bit
            const a0 = psiZ9[i0]!
            const a1 = psiZ9[i1]!
            psiZ9[i0] = addZ9(mulZ9(dC, a0), mulZ9(oC, a1))
            psiZ9[i1] = addZ9(mulZ9(oC, a0), mulZ9(dC, a1))
          }
        }
        den *= 2n
      }
    }
    const applyCollZ9 = (dag: boolean): void => {
      const twoW = scaleZ9(2n, mulZ9(Z9_OMEGA, Z9_ZETA18))
      const sPhase = adjointZ9(twoW, dag)
      for (let p = 0; p + 1 < N; p += 2) {
        const withK = ((p >> 1) & 1) === 1
        const kRaw = withK ? scaleZ9(-1n, Z9_MEET_SWAP) : Z9_ZETA6
        const xRaw = withK ? scaleZ9(-1n, Z9_ZETA6) : Z9_MEET_SWAP
        const kC = adjointZ9(kRaw, dag)
        const xC = adjointZ9(xRaw, dag)
        const bitA = 1 << p
        const bitB = 1 << (p + 1)
        for (let i = 0; i < dim; i++) {
          if ((i & bitA) !== 0 || (i & bitB) !== 0) continue
          const i00 = i
          const i01 = i | bitB
          const i10 = i | bitA
          const i11 = i | bitA | bitB
          psiZ9[i00] = mulZ9(sPhase, psiZ9[i00]!)
          psiZ9[i11] = mulZ9(sPhase, psiZ9[i11]!)
          const a01 = psiZ9[i01]!
          const a10 = psiZ9[i10]!
          psiZ9[i01] = addZ9(mulZ9(kC, a01), mulZ9(xC, a10))
          psiZ9[i10] = addZ9(mulZ9(xC, a01), mulZ9(kC, a10))
        }
        den *= 2n
      }
    }
    const applyShiftZ9 = (dag: boolean): void => {
      const next: Z9[] = new Array<Z9>(dim).fill(Z9_ZERO)
      const topBit = 1 << (N - 1)
      const mask = dim - 1
      for (let i = 0; i < dim; i++) {
        const dst = !dag
          ? ((i << 1) & mask) | ((i & topBit) !== 0 ? 1 : 0)
          : (i >> 1) | ((i & 1) !== 0 ? topBit : 0)
        next[dst] = psiZ9[i]!
      }
      psiZ9 = next
    }
    const reduceVec = (): void => {
      while (
        den % 2n === 0n &&
        psiZ9.every(z => z.every(c => (c & 1n) === 0n))
      ) {
        den /= 2n
        psiZ9 = psiZ9.map(z => divExactZ9(z, 2n))
      }
    }
    // Forward 1 beat in exact BigInt Z[zeta_9][1/2^k]
    applyPhiZ9(false)
    applyDZ9(false)
    applyCollZ9(false)
    applyDZ9(false)
    applyPhiZ9(false)
    applyShiftZ9(false)
    reduceVec()
    let normSq = Z9_ZERO
    for (const z of psiZ9) normSq = addZ9(normSq, mulZ9(conjZ9(z), z))
    const normRes = subZ9(normSq, [den * den, 0n, 0n, 0n, 0n, 0n])
    assertCheck(isZeroZ9(normRes), 'Part B 8-mode BigInt 1-beat norm failed')

    // Compare against Float64 1-beat statevector
    const flR = new Float64Array(dim)
    const flI = new Float64Array(dim)
    flR[1] = 1
    stepBareRegisterBeat(N, flR, flI, 'full', false)
    let maxBiFl = 0
    for (let i = 0; i < dim; i++) {
      const c = z9ToComplex(psiZ9[i]!, den)
      const d = Math.hypot(c[0] - flR[i]!, c[1] - flI[i]!)
      if (d > maxBiFl) maxBiFl = d
    }
    assertCheck(maxBiFl < 1e-14, `Part B 8-mode BigInt vs Float64 diff ${maxBiFl}`)

    // Exact BigInt inverse beat U_reg^{-1} U_reg |1> = |1>
    applyShiftZ9(true)
    applyPhiZ9(true)
    applyDZ9(true)
    applyCollZ9(true)
    applyDZ9(true)
    applyPhiZ9(true)
    reduceVec()
    assertCheck(
      den === 1n &&
        psiZ9.every((z, i) => eqZ9(z, i === 1 ? Z9_ONE : Z9_ZERO)),
      'Part B 8-mode BigInt inverse beat failed',
    )
    console.log(
      `  [BigInt 8-Mode Register Cert] 1-beat U_reg (dim=256): normRes=0n, max|BigInt-F64|=${maxBiFl.toExponential(2)}, U^-1 U|1>=|1> exact 0n!`,
    )
  }

  const T_MAX = 24

  for (const N of [8, 10]) {
    const dim = 1 << N
    const half = N / 2
    const dHalf = 1 << half
    const sPageExactNats = pageEntropyExactNats(dHalf, dHalf)
    const sPageAsympNats = half * Math.LN2 - 0.5
    const sPageExactBits = sPageExactNats / Math.LN2
    const sPageAsympBits = sPageAsympNats / Math.LN2

    // Pure computational-basis product state |psi(0)> = |1000...0> (single bare excitation on mode 0)
    const initIdx = 1

    const psiFullR = new Float64Array(dim)
    const psiFullI = new Float64Array(dim)
    psiFullR[initIdx] = 1

    const psiNoPhiR = new Float64Array(dim)
    const psiNoPhiI = new Float64Array(dim)
    psiNoPhiR[initIdx] = 1

    const psiFreeR = new Float64Array(dim)
    const psiFreeI = new Float64Array(dim)
    psiFreeR[initIdx] = 1

    let maxSymErrAll = 0
    let maxEigResAll = 0
    let maxNormErrAll = 0
    let maxFreeEntropyAll = 0

    // Store full cut profile S(A_k, t) for t = 0..T_MAX
    const halfCutHistoryNats: number[] = []
    const halfCutHistoryNoPhiNats: number[] = []
    const fullCutByT: number[][] = [] // nats
    const lateAvgCutNats = new Float64Array(N + 1)
    let lateCount = 0

    for (let t = 0; t <= T_MAX; t++) {
      // Check norm conservation at every beat
      let n2 = 0
      for (let i = 0; i < dim; i++) {
        n2 += psiFullR[i]! * psiFullR[i]! + psiFullI[i]! * psiFullI[i]!
      }
      const nErr = Math.abs(n2 - 1)
      if (nErr > maxNormErrAll) maxNormErrAll = nErr

      const cutNats: number[] = []
      for (let k = 0; k <= N; k++) {
        const keepBits = Array.from({ length: k }, (_, i) => i)
        // Verify exact pure-state symmetry |S(A_k, t) - S(Abar_k, t)| < 1e-12 for ALL k and ALL t!
        const res = subsystemEntropyExact(N, psiFullR, psiFullI, keepBits, true)
        if (res.symErr > maxSymErrAll) maxSymErrAll = res.symErr
        if (res.eigRes > maxEigResAll) maxEigResAll = res.eigRes
        cutNats.push(res.nats)
        if (t >= 12) lateAvgCutNats[k] = lateAvgCutNats[k]! + res.nats
      }
      if (t >= 12) lateCount++
      fullCutByT.push(cutNats)
      halfCutHistoryNats.push(cutNats[half]!)

      // Also track no-Phi_odd ablation and free non-interacting control at half-cut (and all cuts at t=T_MAX)
      const halfBits = Array.from({ length: half }, (_, i) => i)
      const resNoPhi = subsystemEntropyExact(N, psiNoPhiR, psiNoPhiI, halfBits, false)
      halfCutHistoryNoPhiNats.push(resNoPhi.nats)

      const resFree = subsystemEntropyExact(N, psiFreeR, psiFreeI, halfBits, false)
      if (resFree.nats > maxFreeEntropyAll) maxFreeEntropyAll = resFree.nats

      if (t < T_MAX) {
        stepBareRegisterBeat(N, psiFullR, psiFullI, 'full', false)
        stepBareRegisterBeat(N, psiNoPhiR, psiNoPhiI, 'no_phi', false)
        stepBareRegisterBeat(N, psiFreeR, psiFreeI, 'free', false)
      }
    }

    // Check ALL cuts of free control at t = T_MAX
    for (let k = 0; k <= N; k++) {
      const keepBits = Array.from({ length: k }, (_, i) => i)
      const rf = subsystemEntropyExact(N, psiFreeR, psiFreeI, keepBits, false)
      if (rf.nats > maxFreeEntropyAll) maxFreeEntropyAll = rf.nats
    }

    // Verify exact time-reversal U^{-24} U^{24} |psi(0)> = |psi(0)>!
    const revR = psiFullR.slice()
    const revI = psiFullI.slice()
    for (let t = 0; t < T_MAX; t++) {
      stepBareRegisterBeat(N, revR, revI, 'full', true)
    }
    let revErr = 0
    for (let i = 0; i < dim; i++) {
      const targetR = i === initIdx ? 1 : 0
      const d = Math.hypot(revR[i]! - targetR, revI[i]!)
      if (d > revErr) revErr = d
    }

    for (let k = 0; k <= N; k++) lateAvgCutNats[k] = lateAvgCutNats[k]! / lateCount

    const peakSatNats = Math.max(...halfCutHistoryNats)
    const peakSatBeat = halfCutHistoryNats.indexOf(peakSatNats)
    const meanSatNats = lateAvgCutNats[half]!
    const meanSat20Nats =
      halfCutHistoryNats.slice(20).reduce((a, b) => a + b, 0) /
      (T_MAX - 20 + 1)
    const meanNoPhiNats =
      halfCutHistoryNoPhiNats.slice(12).reduce((a, b) => a + b, 0) / lateCount
    const ratioPeakExact = peakSatNats / sPageExactNats
    const ratioPeakAsymp = peakSatNats / sPageAsympNats
    const ratioMeanExact = meanSatNats / sPageExactNats
    const ratioMeanAsymp = meanSatNats / sPageAsympNats
    const ratioSat20Exact = meanSat20Nats / sPageExactNats

    // Verify Page-curve structure on late-time saturated profile:
    // 1. S(0) = 0, S(N) = 0
    // 2. Monotonic rise for k = 0 -> N/2, peak at k = N/2, monotonic turnover N/2 -> N
    // 3. Peak close to Page value (> 90% of S_Page!)
    // 4. Exact pure-state symmetry |S(A_k, t) - S(Abar_k, t)| < 1e-12 for ALL k, t
    // 5. Free non-interacting control identically 0 (< 1e-13)
    assertCheck(maxNormErrAll < 1e-12, `Part B N=${N} norm err ${maxNormErrAll}`)
    assertCheck(maxSymErrAll < 1e-12, `Part B N=${N} sym err ${maxSymErrAll}`)
    assertCheck(maxEigResAll < 1e-11, `Part B N=${N} eigRes ${maxEigResAll}`)
    assertCheck(revErr < 1e-12, `Part B N=${N} time-reversal err ${revErr}`)
    assertCheck(
      maxFreeEntropyAll < 1e-13,
      `Part B N=${N} free control entropy must be 0, got ${maxFreeEntropyAll}`,
    )
    assertCheck(
      lateAvgCutNats[0]! < 1e-13 && lateAvgCutNats[N]! < 1e-13,
      `Part B N=${N} endpoint entropies must be 0`,
    )
    for (let k = 0; k < half; k++) {
      assertCheck(
        lateAvgCutNats[k + 1]! > lateAvgCutNats[k]!,
        `Part B N=${N} Page rise failed at k=${k}`,
      )
      assertCheck(
        lateAvgCutNats[half + k + 1]! < lateAvgCutNats[half + k]!,
        `Part B N=${N} Page turnover failed at k=${half + k}`,
      )
    }
    assertCheck(
      ratioMeanExact > 0.9,
      `Part B N=${N} saturated entropy ratio ${ratioMeanExact} below 0.90`,
    )

    console.log(
      `\n  --- Closed Bare-QCA Register N = ${N} (dim = 2^${N} = ${dim}, T = 0..${T_MAX} beats) ---`,
    )
    console.log(
      `  Exact Page(N/2): ${sPageExactNats.toFixed(6)} nats (${sPageExactBits.toFixed(6)} bits) | Asymp (N/2)ln2 - 1/2: ${sPageAsympNats.toFixed(6)} nats (${sPageAsympBits.toFixed(6)} bits)`,
    )
    console.log(
      `  Bare-QCA Peak S(A_${half}, t=${peakSatBeat}): ${peakSatNats.toFixed(6)} nats (${(peakSatNats / Math.LN2).toFixed(6)} bits) | S_bare/S_Page(exact)=${ratioPeakExact.toFixed(5)} | S_bare/S_Page(asymp)=${ratioPeakAsymp.toFixed(5)}`,
    )
    console.log(
      `  Bare-QCA Late-Time Mean (t=12..${T_MAX}): ${meanSatNats.toFixed(6)} nats (${(meanSatNats / Math.LN2).toFixed(6)} bits) | S_mean/S_Page(exact)=${ratioMeanExact.toFixed(5)} | S_mean/S_Page(asymp)=${ratioMeanAsymp.toFixed(5)}`,
    )
    console.log(
      `  Bare-QCA Saturated Plateau (t=20..${T_MAX}): ${meanSat20Nats.toFixed(6)} nats (${(meanSat20Nats / Math.LN2).toFixed(6)} bits) | S_sat/S_Page(exact)=${ratioSat20Exact.toFixed(5)}`,
    )
    console.log(
      `  Ablation (M_meet+M_pair+K, no Phi_odd) Late Mean: ${meanNoPhiNats.toFixed(6)} nats (${(meanNoPhiNats / sPageExactNats).toFixed(5)} of Page)`,
    )
    console.log(
      `  Free Non-Interacting Control (D + S only): max S(A_k, t) = ${maxFreeEntropyAll.toExponential(2)} nats (IDENTICALLY ZERO!)`,
    )
    console.log(
      `  Exact Diagnostics: max|S(A_k)-S(Abar_k)|=${maxSymErrAll.toExponential(2)}, maxEigRes=${maxEigResAll.toExponential(2)}, maxNormErr=${maxNormErrAll.toExponential(2)}, revErr(U^-24 U^24)=${revErr.toExponential(2)}`,
    )
    console.log(
      '  Half-cut growth S(A_{N/2}, t) in nats [t=0,1,2,3,4,6,8,12,16,20,24]:',
    )
    const sampleTs = [0, 1, 2, 3, 4, 6, 8, 12, 16, 20, 24]
    console.log(
      '    ' +
        sampleTs
          .map(tt => `t=${tt}:${halfCutHistoryNats[tt]!.toFixed(4)}`)
          .join('  '),
    )
    console.log(
      `  Page-Curve Cut Profile at t=${T_MAX} (and t=12..${T_MAX} mean) vs Exact Page(k, N-k) [nats]:`,
    )
    console.log(
      '    k   S_bare(t=24)  S_bare(mean)  S_Page(exact)  Ratio(mean/Page)  S_free(t=24)',
    )
    const lastCut = fullCutByT[T_MAX]!
    for (let k = 0; k <= N; k++) {
      const pNats =
        k === 0 || k === N
          ? 0
          : pageEntropyExactNats(1 << k, 1 << (N - k))
      const ratioStr =
        pNats > 0 ? (lateAvgCutNats[k]! / pNats).toFixed(5) : '  N/A  '
      console.log(
        `    ${String(k).padStart(2)}   ${lastCut[k]!.toFixed(6)}      ${lateAvgCutNats[k]!.toFixed(6)}      ${pNats.toFixed(6)}       ${ratioStr}          0.000000`,
      )
    }
  }

  console.log('  PASS: Part B Pure Bare-QCA Deterministic Page Curve (ALL checks passed!)')
}

// ============================================================================
// PART C: EXACT BigInt Z[zeta_9][1/6] vs Float64 PARITY & THROUGHPUT BENCHMARK
// ============================================================================

type BenchCase = {
  readonly label: string
  readonly nExc: number
  readonly initVibes: readonly Vibe[]
  readonly forwardBeats: number
  readonly revBeats: number
}

function runPartC(): void {
  console.log('\n======================================================================')
  console.log('PART C: EXACT BigInt Z[zeta_9][1/6] vs Float64 PARITY & BENCHMARK')
  console.log('======================================================================')

  // Warm up dock neighborhood cache around dock 0 (radius 1) so geometry lookup isn't skewed
  for (let s = 0; s < 24; s++) stepDock(0, s)

  const cases: readonly BenchCase[] = [
    {
      label: 'n=1 lone excitation (D^2 + S)',
      nExc: 1,
      initVibes: [[0, 0, 1, 0]],
      forwardBeats: 10,
      revBeats: 6,
    },
    {
      label: 'n=2 identical pair (M_pair(z18) 12-line scatter + D + S)',
      nExc: 2,
      initVibes: [
        [0, 0, 1, 0],
        [0, OPPOSITE_SLOT[0]!, 1, 0],
      ],
      forwardBeats: 4,
      revBeats: 3,
    },
    {
      label: 'n=2 distinct-role pair (M_meet + D + S)',
      nExc: 2,
      initVibes: [
        [0, 0, 1, 0],
        [0, OPPOSITE_SLOT[0]!, 1, 1],
      ],
      forwardBeats: 6,
      revBeats: 4,
    },
    {
      label: 'n=2 opposite-sign pair (K bounce + D + S)',
      nExc: 2,
      initVibes: [
        [0, 0, 1, 0],
        [0, OPPOSITE_SLOT[0]!, -1, 0],
      ],
      forwardBeats: 6,
      revBeats: 4,
    },
    {
      label: 'n=3 interacting (M_meet full line + lone D + S)',
      nExc: 3,
      initVibes: [
        [0, 0, 1, 0],
        [0, OPPOSITE_SLOT[0]!, 1, 1],
        [0, 1, 1, 0],
      ],
      forwardBeats: 4,
      revBeats: 3,
    },
    {
      label: 'n=4 chiral cluster (Phi_odd + D + S on 4 lines)',
      nExc: 4,
      initVibes: [
        [0, 0, 1, 0],
        [0, 1, -1, 0],
        [0, 4, 1, 0],
        [0, 10, 1, 0],
      ],
      forwardBeats: 3,
      revBeats: 2,
    },
  ]

  console.log(
    '  Case                                                         T  Support(t)               BigInt(ms)  F64(ms)   Speedup  BI states/s  F64 states/s  Max|BI-F64|  BI_Norm  Rev(U^-r U^r)',
  )

  let globalMaxDiff = 0
  let totalDocksVisited = 0

  for (const c of cases) {
    resetLayerStats()
    const k0 = encodeConfig(c.initVibes)
    let stEx: ExactState = { amp: new Map([[k0, Z9_ONE]]), den: 1n }
    let stFl: FloatState = new Map([[k0, F_ONE]])

    const supportHist: number[] = [1]
    let totalStatesProcessed = 0
    let bigIntNs = 0n
    let floatNs = 0n
    let caseMaxDiff = 0
    let caseMaxFloatNormErr = 0
    let stExAtRev: ExactState = stEx
    let stFlAtRev: FloatState = stFl

    for (let t = 1; t <= c.forwardBeats; t++) {
      totalStatesProcessed += stEx.amp.size

      const t0 = process.hrtime.bigint()
      stEx = applyExactBeat(stEx)
      const t1 = process.hrtime.bigint()
      bigIntNs += t1 - t0

      const f0 = process.hrtime.bigint()
      stFl = applyFloatBeat(stFl)
      const f1 = process.hrtime.bigint()
      floatNs += f1 - f0

      // Bit-exact BigInt norm conservation check (0n residual!)
      const normRes = exactNormResidual(stEx)
      assertCheck(
        isZeroZ9(normRes),
        `Part C ${c.label} t=${t} BigInt norm residual nonzero`,
      )

      // Exact BigInt vs Float64 amplitude parity check (< 1e-13!)
      const diff = maxExactFloatDiff(stEx, stFl)
      if (diff > caseMaxDiff) caseMaxDiff = diff
      if (diff > globalMaxDiff) globalMaxDiff = diff
      assertCheck(
        diff < 1e-13,
        `Part C ${c.label} t=${t} BigInt vs Float64 maxDiff=${diff}`,
      )

      const fnErr = floatNormErr(stFl)
      if (fnErr > caseMaxFloatNormErr) caseMaxFloatNormErr = fnErr
      assertCheck(
        fnErr < 1e-12,
        `Part C ${c.label} t=${t} Float64 normErr=${fnErr}`,
      )

      supportHist.push(stEx.amp.size)
      if (t === c.revBeats) {
        stExAtRev = stEx
        stFlAtRev = stFl
      }
    }

    // Exact time-reversal U^{-r} U^{r} |psi(0)> = |psi(0)> in BOTH BigInt (0n error!) and Float64!
    let revEx = stExAtRev
    let revFl = stFlAtRev
    for (let r = 0; r < c.revBeats; r++) {
      revEx = applyExactInverseBeat(revEx)
      revFl = applyFloatInverseBeat(revFl)
    }
    const initExact: ExactState = { amp: new Map([[k0, Z9_ONE]]), den: 1n }
    const revDiffCount = exactStateDiffCount(revEx, initExact)
    assertCheck(
      revDiffCount === 0 && revEx.den === 1n && isZeroZ9(exactNormResidual(revEx)),
      `Part C ${c.label} BigInt time-reversal failed (diffs=${revDiffCount}, den=${revEx.den})`,
    )
    const revFlDiff = maxExactFloatDiff(initExact, revFl)
    assertCheck(
      revFlDiff < 1e-13,
      `Part C ${c.label} Float64 time-reversal failed (diff=${revFlDiff})`,
    )

    // Count distinct {3,4,3,4} docks reached at final beat
    const docksSet = new Set<number>()
    for (const k of stEx.amp.keys()) {
      for (const v of decodeConfig(k)) docksSet.add(v[0])
    }
    if (docksSet.size > totalDocksVisited) totalDocksVisited = docksSet.size

    const biMs = Number(bigIntNs) / 1e6
    const flMs = Number(floatNs) / 1e6
    const biSec = Math.max(1e-9, biMs / 1000)
    const flSec = Math.max(1e-9, flMs / 1000)
    const totalOutStates = supportHist.slice(1).reduce((a, b) => a + b, 0)
    const biStatesPerSec = totalOutStates / biSec
    const flStatesPerSec = totalOutStates / flSec
    const speedup = biMs / Math.max(1e-6, flMs)
    const growthRate =
      c.forwardBeats > 0
        ? Math.pow(supportHist[supportHist.length - 1]!, 1 / c.forwardBeats)
        : 1

    const histStr = supportHist.join('->').padEnd(23)
    console.log(
      `  ${c.label.padEnd(60)} ${String(c.forwardBeats).padStart(2)}  ${histStr} ${biMs.toFixed(2).padStart(9)}  ${flMs.toFixed(2).padStart(8)}  ${speedup.toFixed(2).padStart(6)}x  ${Math.round(biStatesPerSec).toString().padStart(11)}  ${Math.round(flStatesPerSec).toString().padStart(12)}  ${caseMaxDiff.toExponential(2)}   0n       0n (r=${c.revBeats}, f64=${revFlDiff.toExponential(1)})`,
    )
    console.log(
      `    -> beats/s: BigInt=${(c.forwardBeats / biSec).toFixed(1)}, Float64=${(c.forwardBeats / flSec).toFixed(1)} | geo growth=${growthRate.toFixed(3)}x/beat | final den=${stEx.den} | docks=${docksSet.size} | layerHits(Phi=${activeLayerStats.phiOddHits},K=${activeLayerStats.kHits},Mp=${activeLayerStats.mPairHits},Mm=${activeLayerStats.mMeetHits}/${activeLayerStats.mMeetSwaps})`,
    )
  }

  // Also test pure Float64 throughput scaling on n=4 chiral cluster at t=4 (longer horizon
  // showing where TypeScript sparse Map hits exponential wall -> motivates M3 Rust/C++ TTN!)
  const kChiral = encodeConfig([
    [0, 0, 1, 0],
    [0, 1, -1, 0],
    [0, 4, 1, 0],
    [0, 10, 1, 0],
  ])
  let stChiralFl: FloatState = new Map([[kChiral, F_ONE]])
  const tChiral0 = process.hrtime.bigint()
  const chiralSizes: number[] = [1]
  for (let t = 1; t <= 4; t++) {
    stChiralFl = applyFloatBeat(stChiralFl)
    chiralSizes.push(stChiralFl.size)
  }
  const tChiral1 = process.hrtime.bigint()
  const chiralMs = Number(tChiral1 - tChiral0) / 1e6
  const chiralNormErr = floatNormErr(stChiralFl)
  assertCheck(chiralNormErr < 1e-12, `n=4 t=4 Float64 normErr=${chiralNormErr}`)
  const chiralOutTotal = chiralSizes.slice(1).reduce((a, b) => a + b, 0)
  console.log(
    `\n  [Extended Float64 Stress Test] n=4 chiral t=1..4: support=${chiralSizes.join('->')} in ${chiralMs.toFixed(1)} ms (${Math.round(chiralOutTotal / (chiralMs / 1000))} out-states/s, normErr=${chiralNormErr.toExponential(2)}, total cached {3,4,3,4} docks=${dockFrames.length})`,
  )
  console.log(
    `  Global BigInt vs Float64 parity ceiling across all n=1..4 runs: maxDiff = ${globalMaxDiff.toExponential(3)} (< 1e-13 CERTIFIED!)`,
  )
  console.log('  PASS: Part C Exact BigInt vs Float64 Parity & Throughput Benchmark (ALL checks passed!)')
}

// ============================================================================
// MAIN
// ============================================================================

function main(): void {
  const tStart = process.hrtime.bigint()
  console.log('======================================================================')
  console.log('FRONTIER TRACK F8: BARE-QCA DARWINISM, PAGE CURVE & SPARSE BENCHMARK')
  console.log('Zero external gates | Zero Haar randomness | Zero Math.random()')
  console.log('======================================================================')

  runPartA()
  runPartB()
  runPartC()

  const totalSec = Number(process.hrtime.bigint() - tStart) / 1e9
  console.log('\n======================================================================')
  console.log(`ALL FRONTIER TRACK F8 CHECKS PASSED 100% in ${totalSec.toFixed(3)} s`)
  console.log('======================================================================')
}

main()

export {}
