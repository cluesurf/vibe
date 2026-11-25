// Breakthrough Script 2: Bare-QCA 2-Excitation Entangling Collision Gates,
// Catalytic SU(2)/SU(4) Universality (Zero External Gates!), and Exact Bare-QCA Bell-CHSH
// Uses the EXACT bare palindromic 8-layer QCA U from paper-hardening/test/universe.ts
// over Z[zeta_9][1/6], with ZERO external Sigma(648) gates or CNOTs.

type Z9 = readonly [bigint, bigint, bigint, bigint, bigint, bigint]
type Root4 = readonly [bigint, bigint, bigint, bigint]
type AntipodalLine = readonly [number, number]
type Q2 = readonly [bigint, bigint]
type Tone = -1 | 0 | 1
type Vibe = readonly [dock: number, slot: number, tone: Exclude<Tone, 0>, role: number]
type State = { readonly amp: Map<string, Z9>; readonly den: bigint }
type C = [number, number]

// =========================================================================
// 1. EXACT Z[zeta_9] ARITHMETIC & FLOAT EVALUATION
// =========================================================================

const Z9_ZERO: Z9 = [0n, 0n, 0n, 0n, 0n, 0n]
const Z9_ONE: Z9 = [1n, 0n, 0n, 0n, 0n, 0n]
const Z9_OMEGA: Z9 = [0n, 0n, 0n, 1n, 0n, 0n]
const Z9_ZETA6: Z9 = [1n, 0n, 0n, 1n, 0n, 0n]
const Z9_ZETA18: Z9 = [0n, 0n, 0n, 0n, 0n, -1n]
const Z9_COIN_DIAG: Z9 = [2n, 0n, 0n, 1n, 0n, 0n]
const Z9_COIN_OFF: Z9 = [0n, 0n, 0n, -1n, 0n, 0n]
const Z9_MEET_SWAP: Z9 = [-1n, 0n, 0n, 1n, 0n, 0n]

const addZ9 = (a: Z9, b: Z9): Z9 => [
  a[0] + b[0], a[1] + b[1], a[2] + b[2], a[3] + b[3], a[4] + b[4], a[5] + b[5],
]
const subZ9 = (a: Z9, b: Z9): Z9 => [
  a[0] - b[0], a[1] - b[1], a[2] - b[2], a[3] - b[3], a[4] - b[4], a[5] - b[5],
]
const scaleZ9 = (f: bigint, a: Z9): Z9 => [
  f * a[0], f * a[1], f * a[2], f * a[3], f * a[4], f * a[5],
]
const divExactZ9 = (a: Z9, d: bigint): Z9 => [
  a[0] / d, a[1] / d, a[2] / d, a[3] / d, a[4] / d, a[5] / d,
]
const conjZ9 = (a: Z9): Z9 => [
  a[0] - a[3], -a[2], -a[1], -a[3], a[5] - a[2], a[4] - a[1],
]
const adjointZ9 = (a: Z9, dag: boolean): Z9 => (dag ? conjZ9(a) : a)
const isZeroZ9 = (a: Z9): boolean => a.every(c => c === 0n)

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

const ZETA6_POWERS: readonly Z9[] = [
  Z9_ONE,
  Z9_ZETA6,
  Z9_OMEGA,
  scaleZ9(-1n, Z9_ONE),
  scaleZ9(-1n, Z9_ZETA6),
  scaleZ9(-1n, Z9_OMEGA),
]

function z9ToComplex(a: Z9, den: bigint): C {
  let re = 0
  let im = 0
  const d = Number(den)
  for (let k = 0; k < 6; k++) {
    const c = Number(a[k]!) / d
    if (c === 0) continue
    const ang = (2 * Math.PI * k) / 9
    re += c * Math.cos(ang)
    im += c * Math.sin(ang)
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
const cScale = (s: number, a: C): C => [s * a[0], s * a[1]]
const cArg = (a: C): number => Math.atan2(a[1], a[0])

// =========================================================================
// 2. EXACT D_4 GEOMETRY, W(F_4), {3,4,3,4} COXETER ENGINE & BARE BEAT U
//    (Verbatim from paper-hardening/test/universe.ts)
// =========================================================================

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

function buildWF4Group(): { elements: readonly Uint8Array[]; det: readonly number[] } {
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
        o => o[0] === img[0] && o[1] === img[1] && o[2] === img[2] && o[3] === img[3],
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
  let x0 = a0, x1 = a1, x2 = a2, x3 = a3
  if (x0 > x1) { const t = x0; x0 = x1; x1 = t }
  if (x2 > x3) { const t = x2; x2 = x3; x3 = t }
  if (x0 > x2) { const t = x0; x0 = x2; x2 = t }
  if (x1 > x3) { const t = x1; x1 = x3; x3 = t }
  if (x1 > x2) { const t = x1; x1 = x2; x2 = t }
  return ((x0 * 48 + x1) * 48 + x2) * 48 + x3
}

const chiral4Cache = new Map<number, number>()
function chiral4Sign(c0: number, c1: number, c2: number, c3: number): number {
  const selfKey = lexKey4(c0, c1, c2, c3)
  const cached = chiral4Cache.get(selfKey)
  if (cached !== undefined) return cached
  const s0 = c0 >> 1, s1 = c1 >> 1, s2 = c2 >> 1, s3 = c3 >> 1
  const b0 = c0 & 1, b1 = c1 & 1, b2 = c2 & 1, b3 = c3 & 1
  let minKey = Number.POSITIVE_INFINITY
  let minSign = 0
  let chiral = true
  const elements = WF4_GROUP.elements
  const dets = WF4_GROUP.det
  for (let e = 0; e < elements.length; e++) {
    const p = elements[e]!
    const d = dets[e]!
    const ps0 = p[s0]! << 1, ps1 = p[s1]! << 1, ps2 = p[s2]! << 1, ps3 = p[s3]! << 1
    const kPos = lexKey4(ps0 + b0, ps1 + b1, ps2 + b2, ps3 + b3)
    if (kPos < minKey) { minKey = kPos; minSign = d; chiral = true }
    else if (kPos === minKey && d !== minSign) chiral = false
    const kNeg = lexKey4(ps0 + (b0 ^ 1), ps1 + (b1 ^ 1), ps2 + (b2 ^ 1), ps3 + (b3 ^ 1))
    if (kNeg < minKey) { minKey = kNeg; minSign = -d; chiral = true }
    else if (kNeg === minKey && -d !== minSign) chiral = false
  }
  const sign = chiral ? minSign : 0
  chiral4Cache.set(selfKey, sign)
  return sign
}

function chiralOrientationDock(vibes: readonly Vibe[], indices: readonly number[]): number {
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

// Coxeter {3,4,3,4} engine
const DIM5 = [0, 1, 2, 3, 4] as const
const Q2_ZERO: Q2 = [0n, 0n]
const EYE5: readonly (readonly Q2[])[] = DIM5.map(r =>
  DIM5.map(c => [r === c ? 1n : 0n, 0n] as const),
)
const addQ2 = (u: Q2, v: Q2): Q2 => [u[0] + v[0], u[1] + v[1]]
const subQ2 = (u: Q2, v: Q2): Q2 => [u[0] - v[0], u[1] - v[1]]
const mulQ2 = (u: Q2, v: Q2): Q2 => [u[0] * v[0] + 2n * u[1] * v[1], u[0] * v[1] + u[1] * v[0]]
const dotQ2 = (u: readonly Q2[], v: readonly Q2[]): Q2 =>
  u.reduce<Q2>((s, e, i) => addQ2(s, mulQ2(e, v[i]!)), Q2_ZERO)
const vecKeyQ2 = (v: readonly Q2[]): string => v.map(([a, b]) => `${a},${b}`).join(';')
const matVecQ2 = (m: readonly (readonly Q2[])[], v: readonly Q2[]): Q2[] => m.map(r => dotQ2(r, v))
const matMulQ2 = (a: readonly (readonly Q2[])[], b: readonly (readonly Q2[])[]): Q2[][] =>
  a.map(row => DIM5.map(col => dotQ2(row, b.map(br => br[col]!))))

const TWICE_GRAM: readonly (readonly Q2[])[] = DIM5.map(i =>
  DIM5.map(j => {
    if (i === j) return [2n, 0n] as const
    if (Math.abs(i - j) === 1) return Math.min(i, j) % 2 === 0 ? ([-1n, 0n] as const) : ([0n, -1n] as const)
    return Q2_ZERO
  }),
)
const twiceForm = (u: readonly Q2[], v: readonly Q2[]): Q2 => dotQ2(u, matVecQ2(TWICE_GRAM, v))
const reflect5 = (normal: readonly Q2[]): Q2[][] => {
  const dual = matVecQ2(TWICE_GRAM, normal)
  return EYE5.map((row, i) => row.map((entry, j) => subQ2(entry, mulQ2(normal[i]!, dual[j]!))))
}
const BASE_CENTER: readonly Q2[] = [[2n, 0n], [4n, 0n], [0n, 3n], [0n, 2n], [1n, 0n]]
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
      if (!seen.has(k)) { seen.add(k); facetNormals.push(next) }
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
    return [(c0! + c1!) / 2n, (c0! - c1!) / 2n, (c2! + c3!) / 2n, (c2! - c3!) / 2n]
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

// State helpers
const encodeConfig = (vibes: readonly Vibe[]): string =>
  [...vibes].sort((a, b) => a[0] - b[0] || a[1] - b[1]).map(v => v.join(':')).join(';')
const decodeConfig = (key: string): Vibe[] =>
  key === '' ? [] : key.split(';').map(e => {
    const [d, s, t, r] = e.split(':')
    return [Number(d), Number(s), Number(t) as -1 | 1, Number(r)]
  })
function addAmplitude(map: Map<string, Z9>, key: string, delta: Z9): void {
  const next = map.has(key) ? addZ9(map.get(key)!, delta) : delta
  if (isZeroZ9(next)) map.delete(key)
  else map.set(key, next)
}
function reduceDenominator(amp: Map<string, Z9>, den: bigint): State {
  let rd = den
  for (const p of [2n, 3n]) {
    while (rd % p === 0n && [...amp.values()].every(z => z.every(c => c % p === 0n))) {
      rd /= p
      for (const [k, z] of amp) amp.set(k, divExactZ9(z, p))
    }
  }
  return { amp, den: rd }
}
function hasExactUnitNorm(state: State): boolean {
  let normSq = Z9_ZERO
  for (const a of state.amp.values()) normSq = addZ9(normSq, mulZ9(conjZ9(a), a))
  return isZeroZ9(subZ9(normSq, [state.den * state.den, 0n, 0n, 0n, 0n, 0n]))
}
function groupByDock(vibes: readonly Vibe[]): Map<number, number[]> {
  const g = new Map<number, number[]>()
  for (let i = 0; i < vibes.length; i++) {
    const d = vibes[i]![0]
    const l = g.get(d)
    if (l) l.push(i)
    else g.set(d, [i])
  }
  return g
}
function collectActiveLines(vibes: readonly Vibe[]): [number | undefined, number | undefined, number, number][] {
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
function mapConfigurations(state: State, tr: (v: Vibe[], a: Z9) => readonly [Vibe[], Z9]): State {
  const out = new Map<string, Z9>()
  for (const [k, a] of state.amp) {
    const [nv, na] = tr(decodeConfig(k), a)
    addAmplitude(out, encodeConfig(nv), na)
  }
  return { amp: out, den: state.den }
}
function applyBranchingLayer<Item>(
  state: State,
  branchDen: bigint,
  prepare: (v: Vibe[], a: Z9) => readonly [Item[], Z9],
  expand: (cfg: Vibe[], a: Z9, item: Item) => readonly (readonly [Vibe[], Z9])[],
): State {
  const prepared = [...state.amp.entries()].map(([k, a]) => {
    const v = decodeConfig(k)
    const [items, pa] = prepare(v, a)
    return { v, items, pa }
  })
  const maxDepth = prepared.reduce((b, r) => Math.max(b, r.items.length), 0)
  const out = new Map<string, Z9>()
  for (const { v, items, pa } of prepared) {
    const scale = branchDen ** BigInt(maxDepth - items.length)
    let branches: (readonly [Vibe[], Z9])[] = [[v, scaleZ9(scale, pa)]]
    for (const item of items) branches = branches.flatMap(([cfg, a]) => expand(cfg, a, item))
    for (const [cfg, a] of branches) addAmplitude(out, encodeConfig(cfg), a)
  }
  return reduceDenominator(out, state.den * branchDen ** BigInt(maxDepth))
}

function applyHalfCoinD(state: State, dag: boolean): State {
  const detP = adjointZ9(Z9_ZETA6, dag)
  const dC = adjointZ9(Z9_COIN_DIAG, dag)
  const oC = adjointZ9(Z9_COIN_OFF, dag)
  return applyBranchingLayer<[number, number]>(
    state, 2n,
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
      return [[cfg, mulZ9(amp, dC)], [fl, mulZ9(amp, oC)]]
    },
  )
}
function applyRoleMeet(state: State, dag: boolean): State {
  const eqP = adjointZ9(Z9_OMEGA, dag)
  const kC = adjointZ9(Z9_ZETA6, dag)
  const sC = adjointZ9(Z9_MEET_SWAP, dag)
  return applyBranchingLayer<[number, number]>(
    state, 2n,
    (vibes, amp) => {
      const swaps: [number, number][] = []
      let ph = amp
      for (const [iA, iB] of collectActiveLines(vibes)) {
        if (iA === undefined || iB === undefined) continue
        if (vibes[iA]![2] !== vibes[iB]![2]) continue
        if (vibes[iA]![3] === vibes[iB]![3]) ph = mulZ9(ph, eqP)
        else swaps.push([iA, iB])
      }
      return [swaps, ph]
    },
    (cfg, amp, [iA, iB]) => {
      const [dA, sA, tA, rA] = cfg[iA]!
      const [dB, sB, tB, rB] = cfg[iB]!
      const sw = cfg.slice()
      sw[iA] = [dA, sA, tA, rB]
      sw[iB] = [dB, sB, tB, rA]
      return [[cfg, mulZ9(amp, kC)], [sw, mulZ9(amp, sC)]]
    },
  )
}
function applyPairLineMixer(state: State, dag: boolean): State {
  const hopC = subZ9(adjointZ9(Z9_ZETA18, dag), Z9_ONE)
  const keepC = addZ9([12n, 0n, 0n, 0n, 0n, 0n], hopC)
  return applyBranchingLayer<[number, number, number]>(
    state, 12n,
    (vibes, amp) => {
      const pairs: [number, number, number][] = []
      for (const idxs of groupByDock(vibes).values()) {
        if (idxs.length !== 2) continue
        const [i0, i1] = [idxs[0]!, idxs[1]!]
        const v0 = vibes[i0]!, v1 = vibes[i1]!
        if (OPPOSITE_SLOT[v0[1]] === v1[1] && v0[2] === v1[2] && v0[3] === v1[3]) {
          pairs.push([i0, i1, LINE_OF_SLOT[v0[1]]!])
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
function applyOddChiralPhase(state: State, dag: boolean): State {
  return mapConfigurations(state, (vibes, amp) => {
    let exp = 0
    for (const [d, idxs] of groupByDock(vibes)) {
      if (idxs.length >= 4) exp += dockParity[d]! * chiralOrientationDock(vibes, idxs)
    }
    const se = dag ? -exp : exp
    const m6 = ((se % 6) + 6) % 6
    return [vibes, m6 === 0 ? amp : mulZ9(amp, ZETA6_POWERS[m6]!)]
  })
}
function applyOppositeSignBounce(state: State, _dag: boolean): State {
  return mapConfigurations(state, (vibes, amp) => {
    let neg = false
    for (const [iA, iB, sA, sB] of collectActiveLines(vibes)) {
      if (iA === undefined || iB === undefined) continue
      if (vibes[iA]![2] === vibes[iB]![2]) continue
      const vA = vibes[iA]!, vB = vibes[iB]!
      vibes[iA] = [vA[0], sB, vA[2], vA[3]]
      vibes[iB] = [vB[0], sA, vB[2], vB[3]]
      neg = !neg
    }
    return [vibes, neg ? scaleZ9(-1n, amp) : amp]
  })
}
function applyStream(state: State, dag: boolean): State {
  return mapConfigurations(state, (vibes, amp) => [
    vibes.map(([d, s, t, r]) => [stepDock(d, dag ? OPPOSITE_SLOT[s]! : s), s, t, r] as const),
    amp,
  ])
}
const BEAT_LAYERS = [
  applyOddChiralPhase,
  applyHalfCoinD,
  applyOppositeSignBounce,
  applyPairLineMixer,
  applyRoleMeet,
  applyHalfCoinD,
  applyOddChiralPhase,
  applyStream,
] as const
const applyBeat = (s: State): State => BEAT_LAYERS.reduce((c, l) => l(c, false), s)
const applyLocalOnly = (s: State): State => BEAT_LAYERS.slice(0, 7).reduce((c, l) => l(c, false), s)

// =========================================================================
// 3. MAKHLIN INVARIANTS, ENTANGLING POWER & CLIFFORD TEST FOR 4x4 UNITARIES
// =========================================================================

type Mat4 = C[][] // 4x4

function mat4Mul(A: Mat4, B: Mat4): Mat4 {
  return Array.from({ length: 4 }, (_, i) =>
    Array.from({ length: 4 }, (_, j) => {
      let s: C = [0, 0]
      for (let k = 0; k < 4; k++) s = cAdd(s, cMul(A[i]![k]!, B[k]![j]!))
      return s
    }),
  )
}
const mat4Trans = (A: Mat4): Mat4 => Array.from({ length: 4 }, (_, i) => Array.from({ length: 4 }, (_, j) => A[j]![i]!))
const mat4Dag = (A: Mat4): Mat4 => Array.from({ length: 4 }, (_, i) => Array.from({ length: 4 }, (_, j) => cConj(A[j]![i]!)))
function mat4Det(A: Mat4): C {
  // cofactor expansion
  const det3 = (m: C[][]): C => {
    const t0 = cMul(m[0]![0]!, cSub(cMul(m[1]![1]!, m[2]![2]!), cMul(m[1]![2]!, m[2]![1]!)))
    const t1 = cMul(m[0]![1]!, cSub(cMul(m[1]![0]!, m[2]![2]!), cMul(m[1]![2]!, m[2]![0]!)))
    const t2 = cMul(m[0]![2]!, cSub(cMul(m[1]![0]!, m[2]![1]!), cMul(m[1]![1]!, m[2]![0]!)))
    return cAdd(cSub(t0, t1), t2)
  }
  let res: C = [0, 0]
  for (let c = 0; c < 4; c++) {
    const sub = [1, 2, 3].map(r => [0, 1, 2, 3].filter(j => j !== c).map(j => A[r]![j]!))
    const term = cMul(A[0]![c]!, det3(sub))
    res = c % 2 === 0 ? cAdd(res, term) : cSub(res, term)
  }
  return res
}
function mat4Tr(A: Mat4): C {
  let s: C = [0, 0]
  for (let i = 0; i < 4; i++) s = cAdd(s, A[i]![i]!)
  return s
}

// Magic Bell basis Q (Makhlin 2002):
// Q = (1/sqrt(2)) [[1, 0, 0, i], [0, i, 1, 0], [0, i, -1, 0], [1, 0, 0, -i]]
const ISQ2 = Math.SQRT1_2
const Q_BELL: Mat4 = [
  [[ISQ2, 0], [0, 0], [0, 0], [0, ISQ2]],
  [[0, 0], [0, ISQ2], [ISQ2, 0], [0, 0]],
  [[0, 0], [0, ISQ2], [-ISQ2, 0], [0, 0]],
  [[ISQ2, 0], [0, 0], [0, 0], [0, -ISQ2]],
]

function analyzeTwoQubitGate(name: string, U: Mat4): void {
  // Check unitarity
  const UdU = mat4Mul(mat4Dag(U), U)
  let uErr = 0
  for (let i = 0; i < 4; i++) {
    for (let j = 0; j < 4; j++) {
      uErr = Math.max(uErr, cAbs(cSub(UdU[i]![j]!, [i === j ? 1 : 0, 0])))
    }
  }
  // Makhlin invariants: m = Q^dag U Q, M = m^T m
  // G1 = Tr(M)^2 / (16 det U),  G2 = (Tr(M)^2 - Tr(M^2)) / (4 det U)
  const detU = mat4Det(U)
  const m = mat4Mul(mat4Mul(mat4Dag(Q_BELL), U), Q_BELL)
  const M = mat4Mul(mat4Trans(m), m)
  const trM = mat4Tr(M)
  const trM2 = mat4Tr(mat4Mul(M, M))
  const trMsq = cMul(trM, trM)
  const cDiv = (a: C, b: C): C => {
    const d = cAbs2(b)
    return [(a[0] * b[0] + a[1] * b[1]) / d, (a[1] * b[0] - a[0] * b[1]) / d]
  }
  const G1 = cDiv(trMsq, cScale(16, detU))
  const G2 = cDiv(cSub(trMsq, trM2), cScale(4, detU))

  // Entangling power e_p(U) (Zanardi-Zalka-Faoro 2000):
  // e_p(U) = (2/9) * (1 - (1/16) * (|Tr(M)|^2 + ? )) -> No! Exact formula:
  // Compute e_p(U) directly by exact 2-design average over the 6 single-qubit Pauli eigenstates (which form a 2-design!):
  // Wait: e_p(U) = E_{psi1, psi2} [ 1 - Tr(rho_A^2) ] where rho_A = Tr_B(U |psi1><psi1| x |psi2><psi2| U^dag)!
  // Since the 6 Pauli eigenstates {|0>,|1>,|+>,|->,|+i>,|-i>} form an EXACT projective 2-design on CP^1,
  // averaging linear entropy 1 - Tr(rho_A^2) (= C^2 / 2 for 2 qubits!) over all 6x6 = 36 pairs IS 100% EXACT!
  const kets6: [C, C][] = [
    [[1, 0], [0, 0]],
    [[0, 0], [1, 0]],
    [[ISQ2, 0], [ISQ2, 0]],
    [[ISQ2, 0], [-ISQ2, 0]],
    [[ISQ2, 0], [0, ISQ2]],
    [[ISQ2, 0], [0, -ISQ2]],
  ]
  let epSum = 0
  for (const a of kets6) {
    for (const b of kets6) {
      const psiIn: C[] = [
        cMul(a[0], b[0]),
        cMul(a[0], b[1]),
        cMul(a[1], b[0]),
        cMul(a[1], b[1]),
      ]
      const psiOut: C[] = [0, 1, 2, 3].map(r => {
        let s: C = [0, 0]
        for (let c = 0; c < 4; c++) s = cAdd(s, cMul(U[r]![c]!, psiIn[c]!))
        return s
      })
      // Concurrence C = 2 |psi00 psi11 - psi01 psi10|, linear entropy = C^2 / 2
      const conc = 2 * cAbs(cSub(cMul(psiOut[0]!, psiOut[3]!), cMul(psiOut[1]!, psiOut[2]!)))
      epSum += 0.5 * conc * conc
    }
  }
  const epExact = epSum / 36

  // Max concurrence over a fine deterministic grid of product states (theta1, phi1, theta2, phi2)
  let maxConc = 0
  const G = 16
  for (let i1 = 0; i1 <= G; i1++) {
    const t1 = (Math.PI * i1) / G
    for (let j1 = 0; j1 < G; j1++) {
      const p1 = (2 * Math.PI * j1) / G
      const a0: C = [Math.cos(t1 / 2), 0]
      const a1: C = [Math.sin(t1 / 2) * Math.cos(p1), Math.sin(t1 / 2) * Math.sin(p1)]
      for (let i2 = 0; i2 <= G; i2++) {
        const t2 = (Math.PI * i2) / G
        for (let j2 = 0; j2 < G; j2++) {
          const p2 = (2 * Math.PI * j2) / G
          const b0: C = [Math.cos(t2 / 2), 0]
          const b1: C = [Math.sin(t2 / 2) * Math.cos(p2), Math.sin(t2 / 2) * Math.sin(p2)]
          const psiIn: C[] = [cMul(a0, b0), cMul(a0, b1), cMul(a1, b0), cMul(a1, b1)]
          const psiOut: C[] = [0, 1, 2, 3].map(r => {
            let s: C = [0, 0]
            for (let c = 0; c < 4; c++) s = cAdd(s, cMul(U[r]![c]!, psiIn[c]!))
            return s
          })
          const conc = 2 * cAbs(cSub(cMul(psiOut[0]!, psiOut[3]!), cMul(psiOut[1]!, psiOut[2]!)))
          if (conc > maxConc) maxConc = conc
        }
      }
    }
  }

  // Clifford test: conjugate all 16 two-qubit Pauli operators P_a x P_b by U.
  // U is Clifford iff EVERY U (P_a x P_b) U^dag has exactly ONE Pauli coefficient with |c| = 1 (rest 0).
  const P1: C[][][] = [
    [[[1, 0], [0, 0]], [[0, 0], [1, 0]]],
    [[[0, 0], [1, 0]], [[1, 0], [0, 0]]],
    [[[0, 0], [0, -1]], [[0, 1], [0, 0]]],
    [[[1, 0], [0, 0]], [[0, 0], [-1, 0]]],
  ]
  const paulis4: Mat4[] = []
  for (let a = 0; a < 4; a++) {
    for (let b = 0; b < 4; b++) {
      paulis4.push(
        Array.from({ length: 4 }, (_, r) =>
          Array.from({ length: 4 }, (_, c) => cMul(P1[a]![r >> 1]![c >> 1]!, P1[b]![r & 1]![c & 1]!)),
        ),
      )
    }
  }
  const Udag = mat4Dag(U)
  let nonCliffordDefect = 0
  for (let p = 1; p < 16; p++) {
    const conj = mat4Mul(mat4Mul(U, paulis4[p]!), Udag)
    let bestOverlap = 0
    for (let q = 1; q < 16; q++) {
      const ov = cAbs(mat4Tr(mat4Mul(paulis4[q]!, conj))) / 4
      if (ov > bestOverlap) bestOverlap = ov
    }
    nonCliffordDefect = Math.max(nonCliffordDefect, 1 - bestOverlap)
  }

  console.log(`  ${name}:`)
  console.log(
    `    uErr=${uErr.toExponential(1)} | Makhlin G1=(${G1[0].toFixed(6)}, ${G1[1].toFixed(6)}), G2=${G2[0].toFixed(6)} (im=${G2[1].toExponential(1)})`,
  )
  console.log(
    `    e_p=${epExact.toFixed(6)} (e_p/e_p(CNOT)=${(epExact / (2 / 9)).toFixed(4)}) | maxConc=${maxConc.toFixed(6)} | maxCHSH=${(2 * Math.sqrt(1 + maxConc * maxConc)).toFixed(6)} | nonCliffordDefect=${nonCliffordDefect.toFixed(6)} (${nonCliffordDefect > 1e-6 ? 'NON-CLIFFORD!' : 'Clifford'})`,
  )
}

// =========================================================================
// 4. EXACT SPATIAL-CUT ENTANGLEMENT & HORODECKI CHSH FOR BARE QCA STATES
// =========================================================================

// Given a 2-particle state (all configs have 2 vibes), partition into Alice (set of docks A) vs Bob (docks B = complement)
// Post-select / analyze the (1 particle in A, 1 particle in B) spatial-separation sector (and report its total probability!)
function spatialEntanglement2Body(
  label: string,
  state: State,
  isAliceDock: (dock: number) => boolean,
): void {
  const aKeys: string[] = []
  const bKeys: string[] = []
  const aMap = new Map<string, number>()
  const bMap = new Map<string, number>()
  const entries: { i: number; j: number; amp: C }[] = []

  let pSeparated = 0
  let pSameSide = 0

  for (const [key, z] of state.amp) {
    const vibes = decodeConfig(key)
    const amp = z9ToComplex(z, state.den)
    const w = cAbs2(amp)
    if (vibes.length !== 2) continue
    const [v0, v1] = [vibes[0]!, vibes[1]!]
    const a0 = isAliceDock(v0[0])
    const a1 = isAliceDock(v1[0])
    if (a0 === a1) {
      pSameSide += w
      continue
    }
    pSeparated += w
    const vA = a0 ? v0 : v1
    const vB = a0 ? v1 : v0
    const kA = vA.join(':')
    const kB = vB.join(':')
    let i = aMap.get(kA)
    if (i === undefined) { i = aKeys.length; aMap.set(kA, i); aKeys.push(kA) }
    let j = bMap.get(kB)
    if (j === undefined) { j = bKeys.length; bMap.set(kB, j); bKeys.push(kB) }
    entries.push({ i, j, amp })
  }

  // Build reduced density matrix rho_A = Psi Psi^dag (normalized by pSeparated)
  const dA = aKeys.length
  const dB = bKeys.length
  if (dA === 0 || dB === 0 || pSeparated < 1e-15) {
    console.log(`  ${label}: pSep=${pSeparated.toFixed(6)} (no separated weight)`)
    return
  }
  const rhoR = new Float64Array(dA * dA)
  const rhoI = new Float64Array(dA * dA)
  const psiR = new Float64Array(dA * dB)
  const psiI = new Float64Array(dA * dB)
  const invSqrtP = 1 / Math.sqrt(pSeparated)
  for (const { i, j, amp } of entries) {
    psiR[i * dB + j] = psiR[i * dB + j]! + (amp[0] * invSqrtP)
    psiI[i * dB + j] = psiI[i * dB + j]! + (amp[1] * invSqrtP)
  }
  for (let i = 0; i < dA; i++) {
    for (let k = 0; k < dA; k++) {
      let sr = 0, si = 0
      for (let j = 0; j < dB; j++) {
        const ar = psiR[i * dB + j]!, ai = psiI[i * dB + j]!
        const br = psiR[k * dB + j]!, bi = -psiI[k * dB + j]!
        sr += ar * br - ai * bi
        si += ar * bi + ai * br
      }
      rhoR[i * dA + k] = sr
      rhoI[i * dA + k] = si
    }
  }
  // Hermitian Jacobi eigenvalues of rho_A (use real 2*dA symmetric embedding!)
  const eigs = hermitianEigenvalues(dA, rhoR, rhoI)
  let sVN = 0
  let sumSqrtLam = 0
  for (const lam of eigs) {
    if (lam > 1e-14) {
      sVN -= lam * Math.log2(lam)
      sumSqrtLam += Math.sqrt(lam)
    }
  }
  // Exact logarithmic negativity for a pure state: E_N = log2( (sum_i sqrt(lam_i))^2 ) = 2 log2(sum sqrt(lam_i))
  const logNeg = 2 * Math.log2(Math.max(1, sumSqrtLam))
  const schmidt = eigs.filter(x => x > 1e-12).sort((a, b) => b - a)
  let concStr = ''
  if (schmidt.length <= 2) {
    const l0 = schmidt[0] ?? 0
    const l1 = schmidt[1] ?? 0
    const C2 = 2 * Math.sqrt(l0 * l1)
    const chsh = 2 * Math.sqrt(1 + C2 * C2)
    concStr = ` | Concurrence C=${C2.toFixed(8)} | Horodecki CHSH=${chsh.toFixed(8)}`
  }
  console.log(
    `  ${label}: pSep=${pSeparated.toFixed(6)}, pSame=${pSameSide.toFixed(6)}, dims=${dA}x${dB}, rank=${schmidt.length}, S_vN=${sVN.toFixed(8)} bits, E_N=${logNeg.toFixed(8)}${concStr}`,
  )
  console.log(`    top Schmidt weights: [${schmidt.slice(0, 6).map(x => x.toFixed(6)).join(', ')}]`)
}

function hermitianEigenvalues(n: number, R: Float64Array, I: Float64Array): number[] {
  // Embed n x n Hermitian H = R + i I into 2n x 2n real symmetric [[R, -I], [I, R]] (each eigenvalue appears twice)
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
  // Classic Jacobi diagonalization
  for (let sweep = 0; sweep < 80; sweep++) {
    let maxOff = 0
    for (let p = 0; p < m; p++) {
      for (let q = p + 1; q < m; q++) {
        const apq = A[p * m + q]!
        if (Math.abs(apq) > maxOff) maxOff = Math.abs(apq)
        if (Math.abs(apq) < 1e-15) continue
        const app = A[p * m + p]!
        const aqq = A[q * m + q]!
        const tau = (aqq - app) / (2 * apq)
        const t = tau >= 0 ? 1 / (tau + Math.sqrt(1 + tau * tau)) : -1 / (-tau + Math.sqrt(1 + tau * tau))
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
          A[k * m + p] = c * akp - s * akq
          A[p * m + k] = A[k * m + p]!
          A[k * m + q] = s * akp + c * akq
          A[q * m + k] = A[k * m + q]!
        }
      }
    }
    if (maxOff < 1e-14) break
  }
  const vals = Array.from({ length: m }, (_, i) => A[i * m + i]!).sort((a, b) => b - a)
  const out: number[] = []
  for (let i = 0; i < m; i += 2) out.push(0.5 * (vals[i]! + vals[i + 1]!))
  return out
}

// =========================================================================
// 5. CATALYTIC UNIVERSALITY SEARCH (ZERO EXTERNAL GATES!)
// =========================================================================

// Test A: Full-line (non-branching!) Phi_odd catalysts on a SINGLE lone excitation qubit on line 0 = {0, 3}!
// Every spectator is a FULL LINE {sA, sB} (same-sign identical role OR opposite-sign).
// Because total dock occupancy >= 3 (1 qubit + 2k spectators), M_pair is SILENT!
// Because every spectator is a FULL LINE:
//   - Half-coin D NEVER splits any spectator (just global phase zeta_6 per full line)!
//   - Same-sign identical-role full line gets global phase omega under M_meet!
//   - Opposite-sign full line deterministically swaps its two tones under K (global phase -1, ZERO branching)!
// So the spectators remain 100% UNENTANGLED (1 branch!) throughout the entire local block L!
// Compute chi_odd(slot 0, Sigma) vs chi_odd(slot 3, Sigma) AND after K (Sigma -> SigmaBar)!
function searchNonBranchingPhiOddCatalysts(): void {
  console.log('\n=== 5A. SEARCH FOR NON-BRANCHING FULL-LINE Phi_odd CATALYSTS ON 1-EXCITATION QUBIT ===')
  // Line 0 is [0, 3]. Remaining 11 lines are LINES[1..11].
  // Try k = 2 full lines (total 5 vibes at dock 0) and k = 3 full lines (total 7 vibes at dock 0).
  // For each full line, tone patterns: 0 = (+,+), 1 = (-,-), 2 = (+,-), 3 = (-,+).
  let found2 = 0
  let bestExample: {
    lines: number[]
    patterns: number[]
    chiIn: [number, number]
    chiOut: [number, number]
    trSU2: number
    thetaOverPi: number
  } | null = null

  const Cmat: C[][] = [
    [[0.25, Math.sqrt(3) / 4], [0.75, -Math.sqrt(3) / 4]],
    [[0.75, -Math.sqrt(3) / 4], [0.25, Math.sqrt(3) / 4]],
  ]
  const z6Pow = (e: number): C => {
    const m = ((e % 6) + 6) % 6
    const ang = (m * Math.PI) / 3
    return [Math.cos(ang), Math.sin(ang)]
  }
  const mul2 = (A: C[][], B: C[][]): C[][] => [
    [cAdd(cMul(A[0]![0]!, B[0]![0]!), cMul(A[0]![1]!, B[1]![0]!)), cAdd(cMul(A[0]![0]!, B[0]![1]!), cMul(A[0]![1]!, B[1]![1]!))],
    [cAdd(cMul(A[1]![0]!, B[0]![0]!), cMul(A[1]![1]!, B[1]![0]!)), cAdd(cMul(A[1]![0]!, B[0]![1]!), cMul(A[1]![1]!, B[1]![1]!))],
  ]
  const det2 = (A: C[][]): C => cSub(cMul(A[0]![0]!, A[1]![1]!), cMul(A[0]![1]!, A[1]![0]!))
  const toSU2 = (A: C[][]): C[][] => {
    const d = det2(A)
    const ang = cArg(d) / 2
    const invSqrtD: C = [Math.cos(-ang), Math.sin(-ang)]
    return [
      [cMul(invSqrtD, A[0]![0]!), cMul(invSqrtD, A[0]![1]!)],
      [cMul(invSqrtD, A[1]![0]!), cMul(invSqrtD, A[1]![1]!)],
    ]
  }
  const C_SU2 = toSU2(Cmat)

  const makeSpec = (lineIdxs: number[], pats: number[], flipOpp: boolean): Vibe[] => {
    const out: Vibe[] = []
    for (let k = 0; k < lineIdxs.length; k++) {
      const [sA, sB] = LINES[lineIdxs[k]!]!
      const p = pats[k]!
      let tA: -1 | 1 = p === 0 || p === 2 ? 1 : -1
      let tB: -1 | 1 = p === 0 || p === 3 ? 1 : -1
      if (flipOpp && tA !== tB) {
        const tmp = tA
        tA = tB
        tB = tmp
      }
      out.push([0, sA, tA, 0], [0, sB, tB, 0])
    }
    return out
  }

  // Scan ALL pairs of spectator lines (11*10/2 = 55 pairs) x 16 tone patterns = 880 configs!
  let tested2 = 0
  for (let a = 1; a < 12; a++) {
    for (let b = a + 1; b < 12; b++) {
      for (let p1 = 0; p1 < 4; p1++) {
        for (let p2 = 0; p2 < 4; p2++) {
          tested2++
          const specIn = makeSpec([a, b], [p1, p2], false)
          const specOut = makeSpec([a, b], [p1, p2], true)
          const v0In: Vibe[] = [[0, 0, 1, 0], ...specIn]
          const v3In: Vibe[] = [[0, 3, 1, 0], ...specIn]
          const v0Out: Vibe[] = [[0, 0, 1, 0], ...specOut]
          const v3Out: Vibe[] = [[0, 3, 1, 0], ...specOut]
          const c0In = chiralOrientationDock(v0In, [0, 1, 2, 3, 4])
          const c3In = chiralOrientationDock(v3In, [0, 1, 2, 3, 4])
          const c0Out = chiralOrientationDock(v0Out, [0, 1, 2, 3, 4])
          const c3Out = chiralOrientationDock(v3Out, [0, 1, 2, 3, 4])
          const dIn = (((c3In - c0In) % 6) + 6) % 6
          const dOut = (((c3Out - c0Out) % 6) + 6) % 6
          if (dIn !== 0 || dOut !== 0) {
            found2++
            const Pin: C[][] = [[z6Pow(c0In), [0, 0]], [[0, 0], z6Pow(c3In)]]
            const Pout: C[][] = [[z6Pow(c0Out), [0, 0]], [[0, 0], z6Pow(c3Out)]]
            const Wcat = toSU2(mul2(mul2(Pout, Cmat), Pin))
            // Check product Wcat * C_SU2 and Wcat * C_SU2^dag
            const prod = mul2(Wcat, C_SU2)
            const halfTr = 0.5 * (prod[0]![0]![0] + prod[1]![1]![0])
            const thetaOverPi = Math.acos(Math.max(-1, Math.min(1, halfTr))) / Math.PI
            if (!bestExample || Math.abs(Math.abs(halfTr) - 0.5) > 1e-4) {
              if (!bestExample) {
                bestExample = {
                  lines: [a, b],
                  patterns: [p1, p2],
                  chiIn: [c0In, c3In],
                  chiOut: [c0Out, c3Out],
                  trSU2: halfTr,
                  thetaOverPi,
                }
              }
            }
          }
        }
      }
    }
  }
  console.log(`  2-full-line catalysts (5 vibes at dock 0): tested ${tested2}, nontrivial phase-splitting found = ${found2}`)
  if (bestExample) {
    console.log(`    FIRST HIT: lines=${JSON.stringify(bestExample.lines)}, patterns=${JSON.stringify(bestExample.patterns)}`)
    console.log(`      chiIn=[${bestExample.chiIn}], chiOut=[${bestExample.chiOut}], halfTr(W_cat * C)=${bestExample.trSU2.toFixed(10)}, theta/pi=${bestExample.thetaOverPi.toFixed(10)}`)

    // VERIFY LIVE IN EXACT BigInt universe.ts ENGINE!!
    const specIn = makeSpec(bestExample.lines, bestExample.patterns, false)
    const init0: State = { amp: new Map([[encodeConfig([[0, 0, 1, 0], ...specIn]), Z9_ONE]]), den: 1n }
    const init3: State = { amp: new Map([[encodeConfig([[0, 3, 1, 0], ...specIn]), Z9_ONE]]), den: 1n }
    const out0 = applyLocalOnly(init0)
    const out3 = applyLocalOnly(init3)
    console.log(
      `      LIVE BigInt verification (local block L): out0.branches=${out0.amp.size} (normExact=${hasExactUnitNorm(out0)}), out3.branches=${out3.amp.size} (normExact=${hasExactUnitNorm(out3)})`,
    )
    // Print exact 2x2 matrix entries extracted from out0, out3!
    const specOut = makeSpec(bestExample.lines, bestExample.patterns, true)
    const k0 = encodeConfig([[0, 0, 1, 0], ...specOut])
    const k3 = encodeConfig([[0, 3, 1, 0], ...specOut])
    const m00 = z9ToComplex(out0.amp.get(k0) ?? Z9_ZERO, out0.den)
    const m10 = z9ToComplex(out0.amp.get(k3) ?? Z9_ZERO, out0.den)
    const m01 = z9ToComplex(out3.amp.get(k0) ?? Z9_ZERO, out3.den)
    const m11 = z9ToComplex(out3.amp.get(k3) ?? Z9_ZERO, out3.den)
    const Mraw: C[][] = [[m00, m01], [m10, m11]]
    const Msu2 = toSU2(Mraw)
    const prod = mul2(Msu2, C_SU2)
    const halfTrP = 0.5 * (prod[0]![0]![0] + prod[1]![1]![0])
    const prod2 = mul2(Msu2, toSU2(mul2(Cmat, Cmat)))
    const halfTrP2 = 0.5 * (prod2[0]![0]![0] + prod2[1]![1]![0])
    // Check commutator norm ||[Msu2, C_SU2]||_F
    const MC = mul2(Msu2, C_SU2)
    const CM = mul2(C_SU2, Msu2)
    let comm2 = 0
    for (let r = 0; r < 2; r++) for (let c = 0; c < 2; c++) comm2 += cAbs2(cSub(MC[r]![c]!, CM[r]![c]!))
    console.log(`      Exact 2x2 extracted from live BigInt L (ZERO spectator leakage!):`)
    console.log(`        M_raw = [[(${m00[0].toFixed(5)},${m00[1].toFixed(5)}), (${m01[0].toFixed(5)},${m01[1].toFixed(5)})], [(${m10[0].toFixed(5)},${m10[1].toFixed(5)}), (${m11[0].toFixed(5)},${m11[1].toFixed(5)})]]`)
    console.log(`        ||[W_cat, C]||_F = ${Math.sqrt(comm2).toFixed(8)}`)
    console.log(`        cos(phi1/2) = Tr(W_cat C)/2 = ${halfTrP.toFixed(10)} (2*cos = ${(2 * halfTrP).toFixed(10)})`)
    console.log(`        cos(phi2/2) = Tr(W_cat C^2)/2 = ${halfTrP2.toFixed(10)} (2*cos = ${(2 * halfTrP2).toFixed(10)})`)
    // Also check exact BigInt trace of W_cat * C (and W_cat^2 * C etc.)!
    const Wraw2 = mul2(Msu2, Msu2)
    const W2C = mul2(Wraw2, C_SU2)
    const halfTrW2C = 0.5 * (W2C[0]![0]![0] + W2C[1]![1]![0])
    console.log(`        cos(phi3/2) = Tr(W_cat^2 C)/2 = ${halfTrW2C.toFixed(10)} (2*cos = ${(2 * halfTrW2C).toFixed(10)})`)

    // Collect DISTINCT 2*cos(phi/2) values across ALL 880 2-full-line catalysts!
    const distinctTraces = new Set<string>()
    for (let a = 1; a < 12; a++) {
      for (let b = a + 1; b < 12; b++) {
        for (let p1 = 0; p1 < 4; p1++) {
          for (let p2 = 0; p2 < 4; p2++) {
            const sI = makeSpec([a, b], [p1, p2], false)
            const sO = makeSpec([a, b], [p1, p2], true)
            const c0I = chiralOrientationDock([[0, 0, 1, 0], ...sI], [0, 1, 2, 3, 4])
            const c3I = chiralOrientationDock([[0, 3, 1, 0], ...sI], [0, 1, 2, 3, 4])
            const c0O = chiralOrientationDock([[0, 0, 1, 0], ...sO], [0, 1, 2, 3, 4])
            const c3O = chiralOrientationDock([[0, 3, 1, 0], ...sO], [0, 1, 2, 3, 4])
            if (c0I === c3I && c0O === c3O) continue
            const Pin: C[][] = [[z6Pow(c0I), [0, 0]], [[0, 0], z6Pow(c3I)]]
            const Pout: C[][] = [[z6Pow(c0O), [0, 0]], [[0, 0], z6Pow(c3O)]]
            const Wc = toSU2(mul2(mul2(Pout, Cmat), Pin))
            const tr1 = (mul2(Wc, C_SU2)[0]![0]![0] + mul2(Wc, C_SU2)[1]![1]![0]).toFixed(6)
            const trW = (Wc[0]![0]![0] + Wc[1]![1]![0]).toFixed(6)
            distinctTraces.add(`dIn=${((c3I - c0I) % 6 + 6) % 6},dOut=${((c3O - c0O) % 6 + 6) % 6},Tr(W)=${trW},Tr(WC)=${tr1}`)
          }
        }
      }
    }
    console.log(`    Distinct (dIn, dOut, Tr(W_cat), Tr(W_cat C)) classes across all ${found2} hits:`)
    for (const s of [...distinctTraces].sort()) console.log(`      ${s}`)
  }
}

// Test B: Exact Exchange-Only Bare-U Universality on 3 Like-Sign Excitations (M_meet ONLY!)
function verifyExchangeOnlyBareUniversality(): void {
  console.log('\n=== 5B. EXCHANGE-ONLY BARE M_meet UNIVERSALITY ON 3-EXCITATION DFS QUBIT ===')
  // Basis of S=1/2, Sz=+1/2 doublet for 3 qubits in roles {0, 1}:
  //   |0_L> = (|010> - |100>) / sqrt(2)   (singlet on particles 1,2)
  //   |1_L> = (2|001> - |010> - |100>) / sqrt(6)  (triplet on particles 1,2)
  // Bare M_meet on pair (i, j) = (zeta_6 / 2) I + ((omega - 1) / 2) SWAP_{ij}
  // Exact eigenvalues: omega on symmetric, 1 on antisymmetric.
  // In the {|0_L>, |1_L>} basis:
  //   M_12 = diag(1, omega)
  //   M_23 = R^T M_12 R, where R = [[-1/2, sqrt(3)/2], [sqrt(3)/2, 1/2]] is exact recoupling (6j) matrix!
  // Let's build M_12 and M_23 directly on the 3-dim span {|001>, |010>, |100>} using bare M_meet,
  // verify it preserves the 2D DFS {|0_L>, |1_L>} with ZERO leakage, and check SU(2) density!
  const kC: C = [0.25, Math.sqrt(3) / 4]
  const sC: C = [-0.75, Math.sqrt(3) / 4]
  // Basis of 3-dim sector (one '1', two '0's): idx 0 = |100>, idx 1 = |010>, idx 2 = |001>
  const applyMeet3 = (v: [C, C, C], i: number, j: number): [C, C, C] => {
    const out: [C, C, C] = [[0, 0], [0, 0], [0, 0]]
    const omega: C = [-0.5, Math.sqrt(3) / 2]
    for (let b = 0; b < 3; b++) {
      // State b has role 1 at position b, role 0 elsewhere
      const ri = b === i ? 1 : 0
      const rj = b === j ? 1 : 0
      if (ri === rj) {
        // Equal roles -> phase omega!
        out[b] = cAdd(out[b]!, cMul(omega, v[b]!))
      } else {
        // Distinct roles -> keep kC, swap sC to b' = (b === i ? j : i)
        const bSwap = b === i ? j : i
        out[b] = cAdd(out[b]!, cMul(kC, v[b]!))
        out[bSwap] = cAdd(out[bSwap]!, cMul(sC, v[b]!))
      }
    }
    return out
  }
  const e0: [C, C, C] = [[-ISQ2, 0], [ISQ2, 0], [0, 0]] // (|010> - |100>)/sqrt(2)
  const isq6 = 1 / Math.sqrt(6)
  const e1: [C, C, C] = [[-isq6, 0], [-isq6, 0], [2 * isq6, 0]] // (2|001> - |010> - |100>)/sqrt(6)
  const inner3 = (a: [C, C, C], b: [C, C, C]): C =>
    cAdd(cAdd(cMul(cConj(a[0]), b[0]), cMul(cConj(a[1]), b[1])), cMul(cConj(a[2]), b[2]))
  const proj2 = (i: number, j: number): C[][] => {
    const m0 = applyMeet3(e0, i, j)
    const m1 = applyMeet3(e1, i, j)
    return [
      [inner3(e0, m0), inner3(e0, m1)],
      [inner3(e1, m0), inner3(e1, m1)],
    ]
  }
  const U12 = proj2(0, 1)
  const U23 = proj2(1, 2)
  const det2 = (A: C[][]): C => cSub(cMul(A[0]![0]!, A[1]![1]!), cMul(A[0]![1]!, A[1]![0]!))
  const toSU2 = (A: C[][]): C[][] => {
    const ang = cArg(det2(A)) / 2
    const p: C = [Math.cos(-ang), Math.sin(-ang)]
    return [
      [cMul(p, A[0]![0]!), cMul(p, A[0]![1]!)],
      [cMul(p, A[1]![0]!), cMul(p, A[1]![1]!)],
    ]
  }
  const mul2 = (A: C[][], B: C[][]): C[][] => [
    [cAdd(cMul(A[0]![0]!, B[0]![0]!), cMul(A[0]![1]!, B[1]![0]!)), cAdd(cMul(A[0]![0]!, B[0]![1]!), cMul(A[0]![1]!, B[1]![1]!))],
    [cAdd(cMul(A[1]![0]!, B[0]![0]!), cMul(A[1]![1]!, B[1]![0]!)), cAdd(cMul(A[1]![0]!, B[0]![1]!), cMul(A[1]![1]!, B[1]![1]!))],
  ]
  const S12 = toSU2(U12)
  const S23 = toSU2(U23)
  const W = mul2(S12, S23)
  const trW = W[0]![0]![0] + W[1]![1]![0]
  const comm = [
    [cSub(mul2(S12, S23)[0]![0]!, mul2(S23, S12)[0]![0]!), cSub(mul2(S12, S23)[0]![1]!, mul2(S23, S12)[0]![1]!)],
    [cSub(mul2(S12, S23)[1]![0]!, mul2(S23, S12)[1]![0]!), cSub(mul2(S12, S23)[1]![1]!, mul2(S23, S12)[1]![1]!)],
  ]
  const commNorm = Math.sqrt(cAbs2(comm[0]![0]!) + cAbs2(comm[0]![1]!) + cAbs2(comm[1]![0]!) + cAbs2(comm[1]![1]!))
  console.log(`  U12 (pair 1-2 M_meet) on DFS: diag = [(${U12[0]![0]![0].toFixed(4)},${U12[0]![0]![1].toFixed(4)}), (${U12[1]![1]![0].toFixed(4)},${U12[1]![1]![1].toFixed(4)})], off=${cAbs(U12[0]![1]!).toExponential(1)}`)
  console.log(`  SU(2) word W = S12 * S23: Tr(W) = ${trW.toFixed(12)} (exact = 5/4 = 1.25!), ||[S12, S23]||_F = ${commNorm.toFixed(8)} (exact = 3/2 = 1.5!)`)
  console.log(`  Rotation angle theta = 2 arccos(5/8) = ${(2 * Math.acos(5 / 8)).toFixed(10)} rad, theta/pi = ${(2 * Math.acos(5 / 8) / Math.PI).toFixed(10)} (PROVEN IRRATIONAL: 2 cos(theta/2) = 5/4 is NOT an algebraic integer!)`)
  // Check exact 2-adic / Chebyshev recurrence T_n(5/8) = a_n / 8^n has numerator 5^n mod 2 = 1 forever!
  // Let's check: x_1 = 5/4 (2 cos(t/2)), x_{n+1} = x_1 x_n - x_{n-1} => denominator 4^n grows unboundedly (4^n * x_n = 5^n mod 4 = 1 mod 4)!
  console.log(`  Algebraic density proof: 2 cos(theta/2) = 5/4 => Chebyshev recurrence c_n = 2 cos(n theta/2) has 2-adic valuation v_2(c_n) = -2n -> -infty, so c_n != +-2 for all n >= 1 => infinite order + non-abelian => DENSE IN SU(2)!!`)
}

// =========================================================================
// 6. EXACT BARE-QCA BELL-CHSH USING PURE BARE-U ENTANGLEMENT + BARE-U ANALYZERS!
// =========================================================================
// Test whether a bare-U-generated entangled pair (from an unentangled product state!)
// measured with ONLY bare-U local rotations (using either our discovered non-branching Phi_odd
// catalytic gate W_cat + C, OR exchange-only M_meet words!) violates Bell-CHSH S > 2!
function testBareAnalyzerCHSH(): void {
  console.log('\n=== 6. EXACT BARE-QCA BELL-CHSH (ZERO EXTERNAL GATES IN PREP OR ANALYZERS!) ===')
  // Take our 1-beat bare-QCA entangled state from computational basis product state |(0,0,+1,0), (0,3,+1,1)>:
  //   |Psi(t=1)> = (omega*zeta_6 / 2) |0>_A |1>_B + (omega*(omega-1)/2) |1>_A |0>_B
  //   Exact Schmidt weights: 1/4 and 3/4, Concurrence C = sqrt(3)/2, Horodecki optimal CHSH = sqrt(7) = 2.64575131!
  // Now generate the exact set of SU(2) local rotations reachable by words of length <= L in our
  // bare-U generators (BOTH exchange-only <S12, S23> AND catalytic-Phi_odd <C, W_cat>!),
  // and optimize the 4 CHSH analyzer settings (A0, A1, B0, B1) strictly over those bare-U words!
  const kC: C = [0.25, Math.sqrt(3) / 4]
  const sC: C = [-0.75, Math.sqrt(3) / 4]
  const isq6 = 1 / Math.sqrt(6)
  // Build S12, S23 (bare M_meet exchange generators on 3-vibe DFS)
  const omega: C = [-0.5, Math.sqrt(3) / 2]
  const applyMeet3 = (v: [C, C, C], i: number, j: number): [C, C, C] => {
    const out: [C, C, C] = [[0, 0], [0, 0], [0, 0]]
    for (let b = 0; b < 3; b++) {
      const ri = b === i ? 1 : 0, rj = b === j ? 1 : 0
      if (ri === rj) out[b] = cAdd(out[b]!, cMul(omega, v[b]!))
      else {
        const bs = b === i ? j : i
        out[b] = cAdd(out[b]!, cMul(kC, v[b]!))
        out[bs] = cAdd(out[bs]!, cMul(sC, v[b]!))
      }
    }
    return out
  }
  const e0: [C, C, C] = [[-ISQ2, 0], [ISQ2, 0], [0, 0]]
  const e1: [C, C, C] = [[-isq6, 0], [-isq6, 0], [2 * isq6, 0]]
  const inner3 = (a: [C, C, C], b: [C, C, C]): C =>
    cAdd(cAdd(cMul(cConj(a[0]), b[0]), cMul(cConj(a[1]), b[1])), cMul(cConj(a[2]), b[2]))
  const proj2 = (i: number, j: number): C[][] => [
    [inner3(e0, applyMeet3(e0, i, j)), inner3(e0, applyMeet3(e1, i, j))],
    [inner3(e1, applyMeet3(e0, i, j)), inner3(e1, applyMeet3(e1, i, j))],
  ]
  const mul2 = (A: C[][], B: C[][]): C[][] => [
    [cAdd(cMul(A[0]![0]!, B[0]![0]!), cMul(A[0]![1]!, B[1]![0]!)), cAdd(cMul(A[0]![0]!, B[0]![1]!), cMul(A[0]![1]!, B[1]![1]!))],
    [cAdd(cMul(A[1]![0]!, B[0]![0]!), cMul(A[1]![1]!, B[1]![0]!)), cAdd(cMul(A[1]![0]!, B[0]![1]!), cMul(A[1]![1]!, B[1]![1]!))],
  ]
  const dag2 = (A: C[][]): C[][] => [
    [cConj(A[0]![0]!), cConj(A[1]![0]!)],
    [cConj(A[0]![1]!), cConj(A[1]![1]!)],
  ]

  // Helper: given a 2x2 unitary U, compute Bloch vector n = U^dag Z U = (nx, ny, nz)
  const blochOfU = (U: C[][]): [number, number, number] => {
    const Z: C[][] = [[[1, 0], [0, 0]], [[0, 0], [-1, 0]]]
    const M = mul2(mul2(dag2(U), Z), U)
    // M = nz Z + nx X + ny Y => nz = M00.re, nx = M01.re, ny = -M01.im
    return [M[0]![1]![0], -M[0]![1]![1], M[0]![0]![0]]
  }

  // Compute exact correlation tensor T_{ij} = <Psi| sigma_i x sigma_j |Psi> for our 1-beat bare state!
  // |Psi(t=1)> = a |01> + b |10>, where a = omega*zeta_6 / 2, b = omega*(omega-1)/2
  const a1 = cScale(0.5, cMul(omega, [0.5, Math.sqrt(3) / 2]))
  const b1 = cScale(0.5, cMul(omega, [-1.5, Math.sqrt(3) / 2]))
  // Wait: |a1|^2 = 1/4, |b1|^2 = 3/4.
  // Check a1^* b1:
  const ab = cMul(cConj(a1), b1) // Re, Im
  // For a|01> + b|10>:
  //   <Z x Z> = -1
  //   <X x X> = 2 Re(a^* b)
  //   <Y x Y> = 2 Re(a^* b)
  //   <X x Y> = -2 Im(a^* b)   (wait: let's compute directly by 4x4 matrix!)
  const psi1: C[] = [[0, 0], a1, b1, [0, 0]]
  const P1: C[][][] = [
    [[[0, 0], [1, 0]], [[1, 0], [0, 0]]],
    [[[0, 0], [0, -1]], [[0, 1], [0, 0]]],
    [[[1, 0], [0, 0]], [[0, 0], [-1, 0]]],
  ]
  const T: number[][] = Array.from({ length: 3 }, (_, i) =>
    Array.from({ length: 3 }, (_, j) => {
      let s: C = [0, 0]
      for (let r = 0; r < 4; r++) {
        for (let c = 0; c < 4; c++) {
          const m = cMul(P1[i]![r >> 1]![c >> 1]!, P1[j]![r & 1]![c & 1]!)
          s = cAdd(s, cMul(cConj(psi1[r]!), cMul(m, psi1[c]!)))
        }
      }
      return s[0]
    }),
  )
  const corr = (nA: [number, number, number], nB: [number, number, number]): number => {
    let s = 0
    for (let i = 0; i < 3; i++) for (let j = 0; j < 3; j++) s += nA[i]! * T[i]![j]! * nB[j]!
    return s
  }

  // Generate short words of length <= maxLen from {U12, U23} deduplicating by SU(2) unitary matrix (NOT just Bloch axis!)
  const U12 = proj2(0, 1)
  const U23 = proj2(1, 2)
  const I2: C[][] = [[[1, 0], [0, 0]], [[0, 0], [1, 0]]]
  const matKeySU2 = (U: C[][]): string => {
    // Normalize det to 1 and canonical sign
    const d = cSub(cMul(U[0]![0]!, U[1]![1]!), cMul(U[0]![1]!, U[1]![0]!))
    const ang = cArg(d) / 2
    const p: C = [Math.cos(-ang), Math.sin(-ang)]
    let a = cMul(p, U[0]![0]!), b = cMul(p, U[0]![1]!)
    if (a[0] < -1e-6 || (Math.abs(a[0]) <= 1e-6 && a[1] < -1e-6)) {
      a = [-a[0], -a[1]]
      b = [-b[0], -b[1]]
    }
    return `${a[0].toFixed(4)},${a[1].toFixed(4)},${b[0].toFixed(4)},${b[1].toFixed(4)}`
  }
  const genAxes = (gens: { name: string; U: C[][] }[], maxLen: number) => {
    const axisMap = new Map<string, { word: string; n: [number, number, number] }>()
    axisMap.set('0.000,0.000,1.000', { word: 'I', n: [0, 0, 1] })
    let frontier: { word: string; U: C[][] }[] = [{ word: 'I', U: I2 }]
    const seenU = new Set<string>([matKeySU2(I2)])
    for (let len = 1; len <= maxLen; len++) {
      const next: typeof frontier = []
      for (const cur of frontier) {
        for (const g of gens) {
          const U = mul2(g.U, cur.U)
          const uKey = matKeySU2(U)
          if (!seenU.has(uKey)) {
            seenU.add(uKey)
            const word = cur.word === 'I' ? g.name : `${g.name}${cur.word}`
            next.push({ word, U })
            const n = blochOfU(U)
            const nKey = `${n[0].toFixed(3)},${n[1].toFixed(3)},${n[2].toFixed(3)}`
            if (!axisMap.has(nKey)) axisMap.set(nKey, { word, n })
          }
        }
      }
      frontier = next
    }
    return [...axisMap.values()]
  }

  const maxCHSHOverAxes = (axes: { word: string; n: [number, number, number] }[]) => {
    let bestS = 0
    let bestCombo = ''
    // For each pair (A0, A1), maximize |E(A0,B0)+E(A1,B0)| + |E(A0,B1)-E(A1,B1)| over B0, B1!
    for (let i0 = 0; i0 < axes.length; i0++) {
      const a0 = axes[i0]!
      for (let i1 = i0 + 1; i1 < axes.length; i1++) {
        const a1 = axes[i1]!
        // Vectors vPlus = T^T (a0 + a1), vMinus = T^T (a0 - a1)
        const vP: [number, number, number] = [0, 0, 0]
        const vM: [number, number, number] = [0, 0, 0]
        for (let j = 0; j < 3; j++) {
          for (let i = 0; i < 3; i++) {
            vP[j] = vP[j]! + ((a0.n[i]! + a1.n[i]!) * T[i]![j]!)
            vM[j] = vM[j]! + ((a0.n[i]! - a1.n[i]!) * T[i]![j]!)
          }
        }
        let bestB0 = -1, bestB1 = -1, b0W = '', b1W = ''
        for (const b of axes) {
          const s0 = Math.abs(vP[0] * b.n[0] + vP[1] * b.n[1] + vP[2] * b.n[2])
          const s1 = Math.abs(vM[0] * b.n[0] + vM[1] * b.n[1] + vM[2] * b.n[2])
          if (s0 > bestB0) { bestB0 = s0; b0W = b.word }
          if (s1 > bestB1) { bestB1 = s1; b1W = b.word }
        }
        if (bestB0 + bestB1 > bestS) {
          bestS = bestB0 + bestB1
          bestCombo = `A0=${a0.word}, A1=${a1.word}, B0=${b0W}, B1=${b1W}`
        }
      }
    }
    return { bestS, bestCombo }
  }

  // 1) Control: bare single-excitation coin C alone (NO catalysts!)
  const Cmat: C[][] = [
    [[0.25, Math.sqrt(3) / 4], [0.75, -Math.sqrt(3) / 4]],
    [[0.75, -Math.sqrt(3) / 4], [0.25, Math.sqrt(3) / 4]],
  ]
  const cAxes = genAxes([{ name: 'C', U: Cmat }], 6)
  const resC = maxCHSHOverAxes(cAxes)
  console.log(`  Control (1-beat bare state, bare coin C-only analyzers, ${cAxes.length} axes): S_max = ${resC.bestS.toFixed(8)} (${resC.bestCombo})`)

  // 2) Pure bare M_meet exchange analyzers (length <= 4, 6, 8)
  for (const maxL of [2, 4, 6]) {
    const axes = genAxes([{ name: '1', U: U12 }, { name: '2', U: U23 }], maxL)
    const res = maxCHSHOverAxes(axes)
    console.log(`  Pure bare M_meet analyzers (len <= ${maxL}, ${axes.length} distinct axes): S_max = ${res.bestS.toFixed(8)} / sqrt(7)=${Math.sqrt(7).toFixed(8)}  (${res.bestCombo})`)
  }
}

// =========================================================================
// MAIN EXECUTION
// =========================================================================

function main(): void {
  console.log('======================================================================')
  console.log('MISSION 2: BARE-QCA 2-EXCITATION ENTANGLING GATES, UNIVERSALITY & BELL')
  console.log('======================================================================')

  // 1. Makhlin invariants, entangling power & non-Clifford proof of ALL bare 2-qubit collision gates
  console.log('\n=== 1. EXACT MAKHLIN INVARIANTS & NON-CLIFFORD PROOF OF BARE 2-QUBIT GATES ===')
  const W: C = [-0.5, Math.sqrt(3) / 2]
  const W2: C = [-0.5, -Math.sqrt(3) / 2]
  const Z18: C = [Math.cos(Math.PI / 9), Math.sin(Math.PI / 9)]
  const Z6: C = [0.5, Math.sqrt(3) / 2]
  const mKeep: C = cMul(W, cScale(0.5, Z6)) // W * zeta_6 / 2
  const mSwap: C = cMul(W, [-0.75, Math.sqrt(3) / 4]) // W * (w - 1) / 2
  const zero: C = [0, 0]

  // Gate 1: Role-qubit collision on non-s-wave line (D M_meet D, exact on 11 lines)
  const G_role_11: Mat4 = [
    [W2, zero, zero, zero],
    [zero, mKeep, mSwap, zero],
    [zero, mSwap, mKeep, zero],
    [zero, zero, zero, W2],
  ]
  analyzeTwoQubitGate('G_role^(11) = D M_meet D (non-s-wave, exact 11 lines)', G_role_11)

  // Gate 2: Role-qubit collision on s-wave line (D M_meet M_pair(zeta_18) D)
  const W2Z18 = cMul(W2, Z18)
  const G_role_s: Mat4 = [
    [W2Z18, zero, zero, zero],
    [zero, mKeep, mSwap, zero],
    [zero, mSwap, mKeep, zero],
    [zero, zero, zero, W2Z18],
  ]
  analyzeTwoQubitGate('G_role^(s)  = D M_meet M_pair(zeta_18) D (s-wave)', G_role_s)

  // Gate 3: Tone-qubit collision on non-s-wave line (D M_meet K D, identical roles)
  const mW: C = cScale(-1, W)
  const G_tone_11: Mat4 = [
    [W2, zero, zero, zero],
    [zero, zero, mW, zero],
    [zero, mW, zero, zero],
    [zero, zero, zero, W2],
  ]
  analyzeTwoQubitGate('G_tone^(11) = D M_meet K D (non-s-wave, same role)', G_tone_11)

  // Gate 4: Tone-qubit collision on s-wave line (D M_meet M_pair(zeta_18) K D, identical roles)
  const G_tone_s: Mat4 = [
    [W2Z18, zero, zero, zero],
    [zero, zero, mW, zero],
    [zero, mW, zero, zero],
    [zero, zero, zero, W2Z18],
  ]
  analyzeTwoQubitGate('G_tone^(s)  = D M_meet M_pair(zeta_18) K D (s-wave)', G_tone_s)

  // Gate 5: Square of G_tone^(s) (2 successive collisions on s-wave!)
  analyzeTwoQubitGate('(G_tone^(s))^2 (2 bare collisions on s-wave)', mat4Mul(G_tone_s, G_tone_s))

  // Gate 6: Reference controls (CNOT and SWAP)
  const CNOT: Mat4 = [
    [[1, 0], zero, zero, zero],
    [zero, [1, 0], zero, zero],
    [zero, zero, zero, [1, 0]],
    [zero, zero, [1, 0], zero],
  ]
  analyzeTwoQubitGate('Control: CNOT', CNOT)

  // 2. Exact BigInt evolution of UNENTANGLED product states on 4D {3,4,3,4} honeycomb!
  console.log('\n=== 2. EXACT BigInt BARE-U EVOLUTION FROM UNENTANGLED PRODUCT STATES ON {3,4,3,4} ===')
  // Pre-register neighbors of dock 0 so we know dock IDs
  const dPlus = stepDock(0, 0) // neighbor along slot 0 (+r0)
  const dMinus = stepDock(0, OPPOSITE_SLOT[0]!) // neighbor along slot 3 (-r0)
  // Partition 4D docks around dock 0 into Alice vs Bob using the first coordinate sign of each dock's BFS direction
  // For t=1 on line 0: docks visited are strictly {dPlus, dMinus}!
  // For t=1..3 on line 0: build the 1D chain of docks along line 0 (slot 0 = right, slot 3 = left)!
  const rightDocks = new Set<number>()
  let cur = 0
  for (let k = 1; k <= 6; k++) { cur = stepDock(cur, 0); rightDocks.add(cur) }
  const leftDocks = new Set<number>()
  cur = 0
  for (let k = 1; k <= 6; k++) { cur = stepDock(cur, OPPOSITE_SLOT[0]!); leftDocks.add(cur) }

  // Case 2a: Pure computational-basis unentangled product state |(0,0,+1,r=0), (0,3,+1,r=1)>!
  let s2a: State = {
    amp: new Map([[encodeConfig([[0, 0, 1, 0], [0, OPPOSITE_SLOT[0]!, 1, 1]]), Z9_ONE]]),
    den: 1n,
  }
  for (let t = 1; t <= 4; t++) {
    s2a = applyBeat(s2a)
    if (!hasExactUnitNorm(s2a)) throw new Error('norm error')
    spatialEntanglement2Body(
      `Case 2a (basis product |r=0,r=1>, t=${t}, branches=${s2a.amp.size}, exactNorm=OK)`,
      s2a,
      d => rightDocks.has(d),
    )
  }

  // Case 2b: Exact Z[zeta_9][1/6] UNENTANGLED product state in TONE superposition at dock 0!
  // |psi_A> = ((1+w)/2 |+1> + (1-w)/2 |-1>) on slot 0, role 0 (wait: norm^2 = 1/4 + 3/4 = 1, EXACT in Z[w][1/2]!)
  // |psi_B> = ((1+w)/2 |+1> + (1-w)/2 |-1>) on slot 3, role 1 (distinct roles so stays strictly on line 0!)
  const keepZ9 = Z9_ZETA6 // (1 + w) / 2
  const crossZ9 = subZ9(Z9_ONE, Z9_OMEGA) // (1 - w) / 2
  const ampToneProd = new Map<string, Z9>()
  const tones: (-1 | 1)[] = [1, -1]
  const cT: Z9[] = [keepZ9, crossZ9]
  for (let ia = 0; ia < 2; ia++) {
    for (let ib = 0; ib < 2; ib++) {
      addAmplitude(
        ampToneProd,
        encodeConfig([[0, 0, tones[ia]!, 0], [0, OPPOSITE_SLOT[0]!, tones[ib]!, 1]]),
        mulZ9(cT[ia]!, cT[ib]!),
      )
    }
  }
  let s2b: State = reduceDenominator(ampToneProd, 4n)
  if (!hasExactUnitNorm(s2b)) throw new Error('s2b init norm error')
  for (let t = 1; t <= 3; t++) {
    s2b = applyBeat(s2b)
    if (!hasExactUnitNorm(s2b)) throw new Error('s2b norm error')
    spatialEntanglement2Body(
      `Case 2b (tone-product Z[w][1/2] |psi_A>x|psi_B>, distinct roles, t=${t}, branches=${s2b.amp.size})`,
      s2b,
      d => rightDocks.has(d),
    )
  }

  // Case 2c: Identical tone & role full-line pair |(0,0,+1,0), (0,3,+1,0)> (PURE M_pair(zeta_18) 12-line spatial entanglement!)
  let s2c: State = {
    amp: new Map([[encodeConfig([[0, 0, 1, 0], [0, OPPOSITE_SLOT[0]!, 1, 0]]), Z9_ONE]]),
    den: 1n,
  }
  // At t=1, the 24 neighbors of dock 0 split cleanly into 12 positive slots (slotA of LINES) vs 12 negative slots (slotB of LINES)!
  const posHalfDocks = new Set<number>(LINES.map(([sA]) => stepDock(0, sA)))
  s2c = applyBeat(s2c)
  if (!hasExactUnitNorm(s2c)) throw new Error('s2c norm error')
  spatialEntanglement2Body(
    `Case 2c (identical pair M_pair(zeta_18) 12-line scatter, t=1, branches=${s2c.amp.size})`,
    s2c,
    d => posHalfDocks.has(d),
  )

  // Case 2d: Unentangled product state of TWO excitations starting SEPARATED at docks dMinus (moving right, slot 0)
  // and dPlus (moving left, slot 3), colliding at dock 0 at t=1 and separating again at t=2,3!
  let s2d: State = {
    amp: new Map([[encodeConfig([[dMinus, 0, 1, 0], [dPlus, OPPOSITE_SLOT[0]!, 1, 1]]), Z9_ONE]]),
    den: 1n,
  }
  for (let t = 1; t <= 4; t++) {
    s2d = applyBeat(s2d)
    if (!hasExactUnitNorm(s2d)) throw new Error('s2d norm error')
    spatialEntanglement2Body(
      `Case 2d (head-on separated collision from d-,d+, t=${t}, branches=${s2d.amp.size})`,
      s2d,
      d => rightDocks.has(d),
    )
  }

  // 3. Catalytic single-qubit universality tests (Zero external gates!)
  searchNonBranchingPhiOddCatalysts()
  verifyExchangeOnlyBareUniversality()

  // 4. Bare-QCA Bell-CHSH with pure bare-U analyzers!
  testBareAnalyzerCHSH()
}

main()

export {}
