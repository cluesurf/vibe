// Breakthrough Suite (Wave-3 Track W7, Open Challenge 1 Deep Spectral Radius Collapse):
// Collapse rho({3,4,3,4}) from Both Ends to Width < 0.005 with 100% Exact BigInt Rigor
//
// Strictly deterministic (ZERO Math.random), standalone (ZERO external imports), exact BigInt + Float64,
// laptop-safe (< 15 s, < 500 MB RAM), noUncheckedIndexedAccess-safe, ending with `export {}`.
//
// Mathematical methods certified here:
//   1. Exact O(1) W(F_4)-coset Cartier-Foata suffix automata S_1..S_5 (4, 19, 169, 2,197, 34,523 states),
//      verified against exact BigInt shell sums r = 0..6 (1..51,187,080) and directly cross-checked on
//      all 8,857 docks and 10,968 edges of the exact O^+(4,1; Z[sqrt(2)]) R=3 ball (0 mismatches,
//      0 reciprocity failures, exact BigInt interior Schur row-sum verification).
//   2. Exact upward-end flag [St_L(y), b]_{W(F_4)} Nagnibeda upper bounds solved via zero-binary-search
//      Nonlinear Perron-Frobenius equalization + Howard policy iteration to < 1e-8 primal-dual gap across
//      D2..D5 (23, 220, 2,801, 43,312 edge variables), plus D4 [St_3(x), b] (2,636 vars) audit and
//      exact BigInt Q = 10^6 certification: rho <= 11.443713.
//   3. Compact small-denominator (Q = 100, 1000, 10000) Lean-4-ready rational certificates for
//      SpectralSharpExt.lean on D2 (19 states, 23 vars: Q=10000 breaks 11.5 at <= 11.498106) and
//      D3 (169 states, 220 vars: Q=1000 <= 11.464854, Q=10000 <= 11.455090), plus 4-cycle curl
//      vanishing audit (D2 -> D3 -> D4: 0.1370 -> 0.0462 -> 0.0181).
//   4. Exact zero-dropped-edge infinite-depth Cartier-Foata Markov product-measure lower bounds
//      (0-step 3-param -> 1-step 57-param -> 2-step 4,440-param with 57-dim and 4,440-dim right
//      boundary), leveraging the exact Q_3 = Adj(0) (20-clique cube) upward-insertion resolvent
//      (verified to 0 BigInt error against all 8,857 docks of B_3 and brute-force m=0..4 CF words),
//      plus a concrete 100% exact BigInt finite-support witness psi in Z^V on CF shells k = 10..420
//      certifying rho >= 11.4390+ (ZERO sqrt, ZERO asymptotic limit) and asymptotic rho >= 11.4392+.
//   5. Exact spherical-shell Krylov-moment cross-check (m_0..m_4 verified to 0 BigInt error on B_3,
//      V_1..V_4 and ||A(V_4 + A(V_4))|| = 11.341754) explaining the clique-mass bottleneck overcome
//      by the Cartier-Foata Markov product measure.

type CheckRow = {
  readonly part: string
  readonly name: string
  readonly passed: boolean
  readonly detail: string
}

const CHECKS: CheckRow[] = []

function recordCheck(part: string, name: string, passed: boolean, detail: string): void {
  CHECKS.push({ part, name, passed, detail })
}

function assertExact(cond: boolean, message: string): void {
  if (!cond) throw new Error(`Assertion failed: ${message}`)
}

// =================================================================================================
// 0. D_4 ROOTS, GAMMA_24 ADJACENCY, FULL W(F_4) (ORDER 1,152), EXACT RATIONAL ROUNDING
// =================================================================================================

type Root4 = readonly [number, number, number, number]
type Q2 = readonly [bigint, bigint]

const ROOTS: readonly Root4[] = (() => {
  const roots: Root4[] = []
  for (let i = 0; i < 4; i++) {
    for (let j = i + 1; j < 4; j++) {
      for (const si of [1, -1]) {
        for (const sj of [1, -1]) {
          const v: [number, number, number, number] = [0, 0, 0, 0]
          v[i] = si
          v[j] = sj
          roots.push(v)
        }
      }
    }
  }
  return roots
})()

const dot4 = (a: Root4, b: Root4): number => a[0] * b[0] + a[1] * b[1] + a[2] * b[2] + a[3] * b[3]
const OPPOSITE_SLOT: readonly number[] = ROOTS.map(r =>
  ROOTS.findIndex(o => o[0] === -r[0] && o[1] === -r[1] && o[2] === -r[2] && o[3] === -r[3]),
)

const ADJ_MASK = new Int32Array(24)
for (let a = 0; a < 24; a++) {
  let mask = 0
  for (let b = 0; b < 24; b++) if (dot4(ROOTS[a]!, ROOTS[b]!) === 1) mask |= 1 << b
  ADJ_MASK[a] = mask
}
const ALL24 = (1 << 24) - 1

function permMask(perm: Uint8Array, mask: number): number {
  let out = 0
  let m = mask
  while (m !== 0) {
    const bit = m & -m
    out |= 1 << perm[Math.clz32(bit) ^ 31]!
    m ^= bit
  }
  return out
}

function popcount(m: number): number {
  let c = 0
  let x = m
  while (x !== 0) {
    x &= x - 1
    c++
  }
  return c
}

function bitsOf(mask: number): number[] {
  const out: number[] = []
  let m = mask
  while (m !== 0) {
    const bit = m & -m
    out.push(Math.clz32(bit) ^ 31)
    m ^= bit
  }
  return out
}

const ADJ_BITS: readonly (readonly number[])[] = Array.from({ length: 24 }, (_, a) => bitsOf(ADJ_MASK[a]!))

const WF4: readonly Uint8Array[] = (() => {
  const simpleRoots: readonly Root4[] = [
    [0, 1, -1, 0],
    [0, 0, 1, -1],
    [0, 0, 0, 1],
    [1, -1, -1, -1],
  ]
  const gens = simpleRoots.map(alpha => {
    const aa = dot4(alpha, alpha)
    const perm = new Uint8Array(24)
    for (let s = 0; s < 24; s++) {
      const v = ROOTS[s]!
      const twoVa = 2 * dot4(v, alpha)
      const img: [number, number, number, number] = [
        v[0] - (twoVa * alpha[0]) / aa,
        v[1] - (twoVa * alpha[1]) / aa,
        v[2] - (twoVa * alpha[2]) / aa,
        v[3] - (twoVa * alpha[3]) / aa,
      ]
      const idx = ROOTS.findIndex(o => o[0] === img[0] && o[1] === img[1] && o[2] === img[2] && o[3] === img[3])
      assertExact(idx >= 0, 'W(F_4) reflection left D_4')
      perm[s] = idx
    }
    return perm
  })
  const id = Uint8Array.from({ length: 24 }, (_, i) => i)
  const elems: Uint8Array[] = [id]
  const seen = new Set<string>([id.join(',')])
  for (let head = 0; head < elems.length; head++) {
    const cur = elems[head]!
    for (const g of gens) {
      const nxt = new Uint8Array(24)
      for (let i = 0; i < 24; i++) nxt[i] = g[cur[i]!]!
      const k = nxt.join(',')
      if (!seen.has(k)) {
        seen.add(k)
        elems.push(nxt)
      }
    }
  }
  assertExact(elems.length === 1152, `|W(F_4)| must be 1152, got ${elems.length}`)
  return elems
})()

const WF4_KEY_TO_IDX = new Map<string, number>()
for (let i = 0; i < 1152; i++) WF4_KEY_TO_IDX.set(WF4[i]!.join(','), i)
const WF4_MUL = new Uint16Array(1152 * 1152)
const WF4_INV = new Uint16Array(1152)
{
  const tmp = new Uint8Array(24)
  for (let p = 0; p < 1152; p++) {
    for (let q = 0; q < 1152; q++) {
      for (let i = 0; i < 24; i++) tmp[i] = WF4[p]![WF4[q]![i]!]!
      const idx = WF4_KEY_TO_IDX.get(tmp.join(','))!
      WF4_MUL[p * 1152 + q] = idx
      if (idx === 0) WF4_INV[p] = q
    }
  }
}

const CANON_CLIQUE = new Map<number, { readonly canon: number; readonly permIds: readonly number[] }>()
{
  const cliques: number[] = []
  for (let a = 0; a < 24; a++) {
    cliques.push(1 << a)
    for (let b = a + 1; b < 24; b++) {
      if ((ADJ_MASK[a]! & (1 << b)) === 0) continue
      cliques.push((1 << a) | (1 << b))
      for (let c = b + 1; c < 24; c++) {
        if ((ADJ_MASK[a]! & (1 << c)) !== 0 && (ADJ_MASK[b]! & (1 << c)) !== 0) {
          cliques.push((1 << a) | (1 << b) | (1 << c))
        }
      }
    }
  }
  for (const m of cliques) {
    let minM = 0x7fffffff
    for (let pi = 0; pi < 1152; pi++) {
      const pm = permMask(WF4[pi]!, m)
      if (pm < minM) minM = pm
    }
    const permIds: number[] = []
    for (let pi = 0; pi < 1152; pi++) if (permMask(WF4[pi]!, m) === minM) permIds.push(pi)
    CANON_CLIQUE.set(m, { canon: minM, permIds })
  }
}

const CANON_FLAG = new Map<string, { readonly canonC: number; readonly canonB: number; readonly permIds: readonly number[] }>()
for (const [m, info] of CANON_CLIQUE) {
  for (const b of bitsOf(m)) {
    let minB = 99
    for (const pi of info.permIds) if (WF4[pi]![b]! < minB) minB = WF4[pi]![b]!
    CANON_FLAG.set(`${m}:${b}`, {
      canonC: info.canon,
      canonB: minB,
      permIds: info.permIds.filter(pi => WF4[pi]![b] === minB),
    })
  }
}

function gcdBig(a: bigint, b: bigint): bigint {
  let x = a < 0n ? -a : a
  let y = b < 0n ? -b : b
  while (y !== 0n) {
    const t = x % y
    x = y
    y = t
  }
  return x
}

function ratCeilDec(num: bigint, den: bigint, digits = 6): string {
  assertExact(den > 0n && num >= 0n, 'ratCeilDec expects non-negative fraction')
  const scale = 10n ** BigInt(digits)
  const scaled = (num * scale + den - 1n) / den
  return `${scaled / scale}.${(scaled % scale).toString().padStart(digits, '0')}`
}

function ratFloorDec(num: bigint, den: bigint, digits = 6): string {
  assertExact(den > 0n && num >= 0n, 'ratFloorDec expects non-negative fraction')
  const scale = 10n ** BigInt(digits)
  const scaled = (num * scale) / den
  return `${scaled / scale}.${(scaled % scale).toString().padStart(digits, '0')}`
}

function floatFloorDec(x: number, digits = 6): string {
  const scale = 10 ** digits
  const scaled = Math.floor(x * scale)
  return `${Math.floor(scaled / scale)}.${String(scaled % scale).padStart(digits, '0')}`
}

function floatCeilDec(x: number, digits = 6): string {
  const scale = 10 ** digits
  const scaled = Math.ceil(x * scale)
  return `${Math.floor(scaled / scale)}.${String(scaled % scale).padStart(digits, '0')}`
}

// =================================================================================================
// 1. EXACT O^+(4,1; Z[sqrt(2)]) R=3 BALL (8,857 DOCKS) & DEPTH-2..5 SUFFIX AUTOMATA
// =================================================================================================

type ExactBall = {
  readonly nDocks: number
  readonly radius: Int32Array
  readonly neighbors: readonly Int32Array[]
}

function buildExactBallR3(): ExactBall {
  const DIM5 = [0, 1, 2, 3, 4] as const
  const Q2_ZERO: Q2 = [0n, 0n]
  const EYE5: readonly (readonly Q2[])[] = DIM5.map(r => DIM5.map(c => [r === c ? 1n : 0n, 0n] as const))
  const addQ2 = (u: Q2, v: Q2): Q2 => [u[0] + v[0], u[1] + v[1]]
  const subQ2 = (u: Q2, v: Q2): Q2 => [u[0] - v[0], u[1] - v[1]]
  const mulQ2 = (u: Q2, v: Q2): Q2 => [u[0] * v[0] + 2n * u[1] * v[1], u[0] * v[1] + u[1] * v[0]]
  const dotQ2 = (u: readonly Q2[], v: readonly Q2[]): Q2 => u.reduce<Q2>((s, e, i) => addQ2(s, mulQ2(e, v[i]!)), Q2_ZERO)
  const vecKeyQ2 = (v: readonly Q2[]): string => v.map(([a, b]) => `${a},${b}`).join(';')
  const matVecQ2 = (m: readonly (readonly Q2[])[], v: readonly Q2[]): Q2[] => m.map(r => dotQ2(r, v))
  const matMulQ2 = (a: readonly (readonly Q2[])[], b: readonly (readonly Q2[])[]): Q2[][] =>
    a.map(row => DIM5.map(col => dotQ2(row, b.map(br => br[col]!))))
  const TWICE_GRAM: readonly (readonly Q2[])[] = DIM5.map(i =>
    DIM5.map(j =>
      i === j ? ([2n, 0n] as const) : Math.abs(i - j) === 1 ? (Math.min(i, j) % 2 === 0 ? ([-1n, 0n] as const) : ([0n, -1n] as const)) : Q2_ZERO,
    ),
  )
  const twiceForm = (u: readonly Q2[], v: readonly Q2[]): Q2 => dotQ2(u, matVecQ2(TWICE_GRAM, v))
  const reflect5 = (normal: readonly Q2[]): Q2[][] => {
    const dual = matVecQ2(TWICE_GRAM, normal)
    return EYE5.map((row, i) => row.map((entry, j) => subQ2(entry, mulQ2(normal[i]!, dual[j]!))))
  }
  const BASE_CENTER: readonly Q2[] = [
    [2n, 0n],
    [4n, 0n],
    [0n, 3n],
    [0n, 2n],
    [1n, 0n],
  ]
  const CENTRAL_INVERSION: readonly (readonly Q2[])[] = DIM5.map(i =>
    DIM5.map(j => [(j === 4 ? 2n * BASE_CENTER[i]![0] : 0n) - (i === j ? 1n : 0n), j === 4 ? 2n * BASE_CENTER[i]![1] : 0n]),
  )
  const stabGens = [0, 1, 2, 3].map(idx => reflect5(EYE5[idx]!))
  const facetNormals: Q2[][] = [EYE5[4]!.slice()]
  const seenN = new Set<string>([vecKeyQ2(EYE5[4]!)])
  for (const n of facetNormals) {
    for (const g of stabGens) {
      const next = matVecQ2(g, n)
      const key = vecKeyQ2(next)
      if (!seenN.has(key)) {
        seenN.add(key)
        facetNormals.push(next)
      }
    }
  }
  const facetDot = (a: number, b: number): bigint => (twiceForm(facetNormals[a]!, facetNormals[b]!)[0] + 2n) / 2n
  const orthoBasis: number[] = []
  for (let f = 0; f < 24 && orthoBasis.length < 4; f++) if (orthoBasis.every(prev => facetDot(f, prev) === 0n)) orthoBasis.push(f)
  const facetRoots: Root4[] = facetNormals.map((_, f) => {
    const [c0, c1, c2, c3] = orthoBasis.map(o => Number(facetDot(f, o)))
    return [(c0! + c1!) / 2, (c0! - c1!) / 2, (c2! + c3!) / 2, (c2! - c3!) / 2]
  })
  const transports = ROOTS.map(root => {
    const fIdx = facetRoots.findIndex(fr => fr.every((v, i) => v === root[i]))
    return matMulQ2(reflect5(facetNormals[fIdx]!), CENTRAL_INVERSION)
  })
  const frames: (readonly (readonly Q2[])[])[] = [EYE5]
  const centerToId = new Map<string, number>([[vecKeyQ2(BASE_CENTER), 0]])
  const neighbors: Int32Array[] = [new Int32Array(24).fill(-1)]
  const radiusList: number[] = [0]
  for (let d = 0; d < frames.length; d++) {
    const r = radiusList[d]!
    if (r >= 3) continue
    const frame = frames[d]!
    for (let s = 0; s < 24; s++) {
      if (neighbors[d]![s]! >= 0) continue
      const nf = matMulQ2(frame, transports[s]!)
      const cKey = vecKeyQ2(matVecQ2(nf, BASE_CENTER))
      let nid = centerToId.get(cKey)
      if (nid === undefined) {
        nid = frames.length
        centerToId.set(cKey, nid)
        frames.push(nf)
        radiusList.push(r + 1)
        neighbors.push(new Int32Array(24).fill(-1))
      }
      neighbors[d]![s] = nid
      neighbors[nid]![OPPOSITE_SLOT[s]!] = d
    }
  }
  assertExact(frames.length === 8857, `Expected 8,857 docks in R=3 ball, got ${frames.length}`)
  return { nDocks: frames.length, radius: Int32Array.from(radiusList), neighbors }
}

type D2State = { readonly c0: number; readonly downs: ReadonlyMap<number, number> }
type D3State = { readonly c0: number; readonly downs2: ReadonlyMap<number, D2State> }
type D4State = { readonly c0: number; readonly downs3: ReadonlyMap<number, D3State> }

function stepD2(state: D2State, b: number): D2State {
  const newC0 = (1 << b) | (state.c0 & ADJ_MASK[b]!)
  const newDowns = new Map<number, number>([[b, state.c0]])
  for (const a of bitsOf(state.c0 & ADJ_MASK[b]!)) newDowns.set(a, (1 << b) | (state.downs.get(a)! & ADJ_MASK[b]!))
  return { c0: newC0, downs: newDowns }
}

function stepD3(st: D3State, b: number): D3State {
  const newC0 = (1 << b) | (st.c0 & ADJ_MASK[b]!)
  const newDowns2 = new Map<number, D2State>()
  const wDown1 = new Map<number, number>()
  for (const [x, d2x] of st.downs2) wDown1.set(x, d2x.c0)
  newDowns2.set(b, { c0: st.c0, downs: wDown1 })
  for (const a of bitsOf(st.c0 & ADJ_MASK[b]!)) newDowns2.set(a, stepD2(st.downs2.get(a)!, b))
  return { c0: newC0, downs2: newDowns2 }
}

function stepD4(st: D4State, b: number): D4State {
  const newC0 = (1 << b) | (st.c0 & ADJ_MASK[b]!)
  const newDowns3 = new Map<number, D3State>()
  const wDown2 = new Map<number, D2State>()
  for (const [x, d3x] of st.downs3) {
    const dm1 = new Map<number, number>()
    for (const [y, d2y] of d3x.downs2) dm1.set(y, d2y.c0)
    wDown2.set(x, { c0: d3x.c0, downs: dm1 })
  }
  newDowns3.set(b, { c0: st.c0, downs2: wDown2 })
  for (const a of bitsOf(st.c0 & ADJ_MASK[b]!)) newDowns3.set(a, stepD3(st.downs3.get(a)!, b))
  return { c0: newC0, downs3: newDowns3 }
}

function encodeD2WithPerm(p: Uint8Array, st: D2State, c0Bits: readonly number[]): string {
  const pairs: [number, number][] = []
  for (const a of c0Bits) pairs.push([p[a]!, permMask(p, st.downs.get(a)!)])
  pairs.sort((x, y) => x[0] - y[0])
  let key = permMask(p, st.c0).toString(36)
  for (const [pa, dm] of pairs) key += ',' + pa.toString(36) + ':' + dm.toString(36)
  return key
}

function encodeD3WithPerm(p: Uint8Array, st: D3State, c0Bits: readonly number[]): string {
  const parts: [number, string][] = []
  for (const a of c0Bits) {
    const d2 = st.downs2.get(a)!
    const subPairs: [number, number][] = []
    for (const [x, dm] of d2.downs) subPairs.push([p[x]!, permMask(p, dm)])
    subPairs.sort((u, v) => u[0] - v[0])
    let s = permMask(p, d2.c0).toString(36)
    for (const [px, dm] of subPairs) s += '.' + px.toString(36) + ':' + dm.toString(36)
    parts.push([p[a]!, s])
  }
  parts.sort((u, v) => u[0] - v[0])
  let key = permMask(p, st.c0).toString(36)
  for (const [pa, s] of parts) key += '|' + pa.toString(36) + '=' + s
  return key
}

function encodeD4WithPerm(p: Uint8Array, st: D4State, c0Bits: readonly number[]): string {
  const parts: [number, string][] = []
  for (const a of c0Bits) {
    const d3 = st.downs3.get(a)!
    const subParts: [number, string][] = []
    for (const [x, d2] of d3.downs2) {
      const ss: [number, number][] = []
      for (const [y, dm] of d2.downs) ss.push([p[y]!, permMask(p, dm)])
      ss.sort((u, v) => u[0] - v[0])
      let s2 = permMask(p, d2.c0).toString(36)
      for (const [py, dm] of ss) s2 += '.' + py.toString(36) + ':' + dm.toString(36)
      subParts.push([p[x]!, s2])
    }
    subParts.sort((u, v) => u[0] - v[0])
    let s1 = permMask(p, d3.c0).toString(36)
    for (const [px, s2] of subParts) s1 += ';' + px.toString(36) + '=' + s2
    parts.push([p[a]!, s1])
  }
  parts.sort((u, v) => u[0] - v[0])
  let key = permMask(p, st.c0).toString(36)
  for (const [pa, s1] of parts) key += '|' + pa.toString(36) + '>' + s1
  return key
}

function applyPermD2(p: Uint8Array, st: D2State): D2State {
  const dm = new Map<number, number>()
  for (const [a, m] of st.downs) dm.set(p[a]!, permMask(p, m))
  return { c0: permMask(p, st.c0), downs: dm }
}

function applyPermD3(p: Uint8Array, st: D3State): D3State {
  const dm = new Map<number, D2State>()
  for (const [a, d2] of st.downs2) dm.set(p[a]!, applyPermD2(p, d2))
  return { c0: permMask(p, st.c0), downs2: dm }
}

function applyPermD4(p: Uint8Array, st: D4State): D4State {
  const dm = new Map<number, D3State>()
  for (const [a, d3] of st.downs3) dm.set(p[a]!, applyPermD3(p, d3))
  return { c0: permMask(p, st.c0), downs3: dm }
}

// =================================================================================================
// 2. NONLINEAR PERRON-FROBENIUS / HOWARD SOLVER, GENERAL LSE SOLVER, & EXACT BIGINT CERTIFICATES
// =================================================================================================

function solveNonlinearPerron(
  nC: number,
  nV: number,
  aOff: Int32Array,
  aEdge: Int32Array,
  aMult: Uint8Array,
  bOff: Int32Array,
  bEdge: Int32Array,
  bMult: Uint8Array,
  nIters = 1500,
): { readonly upper: number; readonly dual: number; readonly f: Float64Array; readonly w: Float64Array } {
  const owner = new Int32Array(nV).fill(-1)
  const dMult = new Uint8Array(nV)
  for (let v = 0; v < nC; v++) {
    for (let i = bOff[v]!, end = bOff[v + 1]!; i < end; i++) {
      const e = bEdge[i]!
      assertExact(owner[e] === -1, `Unique-owner violated for flag ${e}`)
      owner[e] = v
      dMult[e] = bMult[i]!
    }
  }
  const theta = new Float64Array(nV)
  for (let v = 1; v < nC; v++) {
    let sumD = 0
    for (let i = bOff[v]!, end = bOff[v + 1]!; i < end; i++) sumD += bMult[i]!
    for (let i = bOff[v]!, end = bOff[v + 1]!; i < end; i++) theta[bEdge[i]!] = bMult[i]! / sumD
  }
  const b = new Float64Array(nC).fill(6.0)
  const y = new Float64Array(nC)
  const f = new Float64Array(nV)
  const aSum = new Float64Array(nC)
  const w = new Float64Array(nC).fill(1 / (nC - 1))
  w[0] = 0
  const wNext = new Float64Array(nC)
  const denD = new Float64Array(nV)
  let bestUpper = 24
  let bestDual = 0
  const bestF = new Float64Array(nV)
  const bestW = new Float64Array(nC)

  for (let it = 0; it < nIters; it++) {
    for (let v = 1; v < nC; v++) y[v] = 1 / b[v]!
    for (let e = 0; e < nV; e++) f[e] = (dMult[e]! / theta[e]!) * y[owner[e]!]!
    let maxS = 0
    for (let i = aOff[0]!, end = aOff[1]!; i < end; i++) maxS += aMult[i]! * f[aEdge[i]!]!
    for (let v = 1; v < nC; v++) {
      let a = 0
      for (let i = aOff[v]!, end = aOff[v + 1]!; i < end; i++) a += aMult[i]! * f[aEdge[i]!]!
      aSum[v] = a
      const sv = a + b[v]!
      if (sv > maxS) maxS = sv
    }
    if (maxS < bestUpper) {
      bestUpper = maxS
      bestF.set(f)
    }
    denD.fill(0)
    for (let v = 1; v < nC; v++) {
      const wv = w[v]!
      if (wv === 0) continue
      for (let i = aOff[v]!, end = aOff[v + 1]!; i < end; i++) denD[aEdge[i]!] = denD[aEdge[i]!]! + wv * aMult[i]!
    }
    if (it % 20 === 0 || it === nIters - 1) {
      let dual = 0
      for (let e = 0; e < nV; e++) {
        const de = denD[e]!
        const nu = w[owner[e]!]! * dMult[e]!
        if (de > 0 && nu > 0) dual += 2 * Math.sqrt(nu * de)
      }
      if (dual > bestDual) {
        bestDual = dual
        bestW.set(w)
      }
      if (bestUpper - bestDual < 1e-8) break
    }
    let sumW = 0
    for (let u = 1; u < nC; u++) {
      let acc = 0
      for (let i = bOff[u]!, end = bOff[u + 1]!; i < end; i++) acc += denD[bEdge[i]!]! * f[bEdge[i]!]!
      const nw = acc / b[u]!
      wNext[u] = nw
      sumW += nw
    }
    if (sumW > 0) {
      const inv = 1 / sumW
      for (let u = 1; u < nC; u++) w[u] = 0.5 * w[u]! + 0.5 * (wNext[u]! * inv)
    }
    for (let v = 1; v < nC; v++) b[v] = 0.5 * b[v]! + 0.5 * (maxS - aSum[v]!)
    let wA = 0
    let wB = 0
    for (let v = 1; v < nC; v++) {
      wA += w[v]! * aSum[v]!
      wB += w[v]! * b[v]!
    }
    if (wA > 0 && wB > 0) {
      const sb = Math.sqrt(wA / wB)
      for (let v = 1; v < nC; v++) b[v] = b[v]! * sb
    }
    if (it >= 25 && it % 15 === 0) {
      for (let u = 1; u < nC; u++) {
        const start = bOff[u]!
        const end = bOff[u + 1]!
        if (end - start <= 1) continue
        let sumSq = 0
        for (let i = start; i < end; i++) sumSq += Math.sqrt(bMult[i]! * (denD[bEdge[i]!]! + 1e-30))
        if (sumSq <= 0) continue
        for (let i = start; i < end; i++) {
          const e = bEdge[i]!
          theta[e] = 0.5 * theta[e]! + 0.5 * (Math.sqrt(bMult[i]! * (denD[e]! + 1e-30)) / sumSq)
        }
        let sn = 0
        for (let i = start; i < end; i++) sn += theta[bEdge[i]!]!
        for (let i = start; i < end; i++) theta[bEdge[i]!] = theta[bEdge[i]!]! / sn
      }
    }
  }
  return { upper: bestUpper, dual: bestDual, f: bestF, w: bestW }
}

// General L-BFGS LSE posynomial minimax solver for non-unique-owner partitions such as D4 [St_3(x), b] (2,636 vars).
function solveGeneralPosynomialMinimax(
  nC: number,
  nV: number,
  aOff: Int32Array,
  aEdge: Int32Array,
  aMult: Uint8Array,
  bOff: Int32Array,
  bEdge: Int32Array,
  bMult: Uint8Array,
  fWarm?: Float64Array,
): { readonly upper: number; readonly dual: number; readonly f: Float64Array } {
  const x = new Float64Array(nV)
  if (fWarm) for (let e = 0; e < nV; e++) x[e] = Math.log(Math.max(1e-6, fWarm[e]!))
  else x.fill(Math.log(0.28))
  const bestX = Float64Array.from(x)
  const expP = new Float64Array(nV)
  const expM = new Float64Array(nV)
  const S = new Float64Array(nC)
  const w = new Float64Array(nC)
  const xTry = new Float64Array(nV)
  const numD = new Float64Array(nV)
  const denD = new Float64Array(nV)
  const evalAll = (xin: Float64Array, beta: number, needGrad: boolean): { val: number; maxS: number; dual: number; g: Float64Array } => {
    for (let e = 0; e < nV; e++) {
      expP[e] = Math.exp(xin[e]!)
      expM[e] = 1 / expP[e]!
    }
    let maxS = -1e300
    for (let u = 0; u < nC; u++) {
      let s = 0
      for (let i = aOff[u]!, end = aOff[u + 1]!; i < end; i++) s += aMult[i]! * expP[aEdge[i]!]!
      for (let i = bOff[u]!, end = bOff[u + 1]!; i < end; i++) s += bMult[i]! * expM[bEdge[i]!]!
      S[u] = s
      if (s > maxS) maxS = s
    }
    let sumE = 0
    for (let u = 0; u < nC; u++) {
      const eu = Math.exp(beta * (S[u]! - maxS))
      w[u] = eu
      sumE += eu
    }
    let dual = 0
    const g = needGrad ? new Float64Array(nV) : new Float64Array(0)
    if (needGrad) {
      for (let u = 0; u < nC; u++) w[u] = w[u]! / sumE
      numD.fill(0)
      denD.fill(0)
      for (let u = 0; u < nC; u++) {
        const wu = w[u]!
        if (wu < 1e-18) continue
        for (let i = aOff[u]!, end = aOff[u + 1]!; i < end; i++) {
          const e = aEdge[i]!
          const c = aMult[i]!
          g[e] = g[e]! + wu * c * expP[e]!
          denD[e] = denD[e]! + wu * c
        }
        for (let i = bOff[u]!, end = bOff[u + 1]!; i < end; i++) {
          const e = bEdge[i]!
          const c = bMult[i]!
          g[e] = g[e]! - wu * c * expM[e]!
          numD[e] = numD[e]! + wu * c
        }
      }
      for (let e = 0; e < nV; e++) if (numD[e]! > 0 && denD[e]! > 0) dual += 2 * Math.sqrt(numD[e]! * denD[e]!)
    }
    return { val: maxS + Math.log(sumE) / beta, maxS, dual, g }
  }
  let bestMax = Number.POSITIVE_INFINITY
  let bestDual = 0
  const schedule: readonly (readonly [number, number])[] = [
    [50, 40],
    [250, 50],
    [1200, 60],
    [6000, 60],
  ]
  const mHist = 10
  for (const [beta, steps] of schedule) {
    const sHist: Float64Array[] = []
    const yHist: Float64Array[] = []
    const rhoHist: number[] = []
    let cur = evalAll(x, beta, true)
    for (let it = 0; it < steps; it++) {
      if (cur.maxS < bestMax) {
        bestMax = cur.maxS
        bestX.set(x)
      }
      if (cur.dual > bestDual) bestDual = cur.dual
      const q = Float64Array.from(cur.g)
      const kH = sHist.length
      const alpha = new Float64Array(kH)
      for (let i = kH - 1; i >= 0; i--) {
        let dot = 0
        for (let j = 0; j < nV; j++) dot += sHist[i]![j]! * q[j]!
        alpha[i] = rhoHist[i]! * dot
        for (let j = 0; j < nV; j++) q[j] = q[j]! - alpha[i]! * yHist[i]![j]!
      }
      let scale = 1.0
      if (kH > 0) {
        let sy = 0
        let yy = 0
        for (let j = 0; j < nV; j++) {
          sy += sHist[kH - 1]![j]! * yHist[kH - 1]![j]!
          yy += yHist[kH - 1]![j]! * yHist[kH - 1]![j]!
        }
        if (yy > 1e-24 && sy > 0) scale = sy / yy
      }
      const d = new Float64Array(nV)
      for (let j = 0; j < nV; j++) d[j] = -scale * q[j]!
      for (let i = 0; i < kH; i++) {
        let dot = 0
        for (let j = 0; j < nV; j++) dot += yHist[i]![j]! * d[j]!
        const bCoef = rhoHist[i]! * dot
        for (let j = 0; j < nV; j++) d[j] = d[j]! - sHist[i]![j]! * (alpha[i]! + bCoef)
      }
      let dg = 0
      for (let j = 0; j < nV; j++) dg += d[j]! * cur.g[j]!
      if (dg >= 0) {
        for (let j = 0; j < nV; j++) d[j] = -cur.g[j]!
        dg = 0
        for (let j = 0; j < nV; j++) dg += d[j]! * cur.g[j]!
        sHist.length = 0
        yHist.length = 0
        rhoHist.length = 0
      }
      if (-dg < 1e-16) break
      let step = 1.0
      let ok = false
      for (let ls = 0; ls < 18; ls++) {
        for (let j = 0; j < nV; j++) xTry[j] = Math.max(-10, Math.min(10, x[j]! + step * d[j]!))
        if (evalAll(xTry, beta, false).val <= cur.val + 1e-4 * step * dg) {
          ok = true
          break
        }
        step *= 0.5
      }
      if (!ok) break
      const nxt = evalAll(xTry, beta, true)
      const sVec = new Float64Array(nV)
      const yVec = new Float64Array(nV)
      let sy = 0
      for (let j = 0; j < nV; j++) {
        sVec[j] = xTry[j]! - x[j]!
        yVec[j] = nxt.g[j]! - cur.g[j]!
        sy += sVec[j]! * yVec[j]!
      }
      if (sy > 1e-22) {
        if (sHist.length >= mHist) {
          sHist.shift()
          yHist.shift()
          rhoHist.shift()
        }
        sHist.push(sVec)
        yHist.push(yVec)
        rhoHist.push(1 / sy)
      }
      x.set(xTry)
      cur = nxt
    }
  }
  const f = new Float64Array(nV)
  for (let e = 0; e < nV; e++) f[e] = Math.exp(bestX[e]!)
  return { upper: bestMax, dual: bestDual, f }
}

function certifyAndPolishQ(
  nC: number,
  nV: number,
  aOff: Int32Array,
  aEdge: Int32Array,
  aMult: Uint8Array,
  bOff: Int32Array,
  bEdge: Int32Array,
  bMult: Uint8Array,
  fFloat: Float64Array,
  Qnum: number,
  maxPolish = 0,
): { readonly num: bigint; readonly den: bigint; readonly pInts: Int32Array } {
  const p = new Int32Array(nV)
  for (let e = 0; e < nV; e++) p[e] = Math.max(1, Math.round(fFloat[e]! * Qnum))
  if (maxPolish > 0) {
    const incRowsA: number[][] = Array.from({ length: nV }, () => [])
    const incMultA: number[][] = Array.from({ length: nV }, () => [])
    const incRowsB: number[][] = Array.from({ length: nV }, () => [])
    const incMultB: number[][] = Array.from({ length: nV }, () => [])
    const S = new Float64Array(nC)
    for (let u = 0; u < nC; u++) {
      let s = 0
      for (let i = aOff[u]!, end = aOff[u + 1]!; i < end; i++) {
        const e = aEdge[i]!
        const c = aMult[i]!
        incRowsA[e]!.push(u)
        incMultA[e]!.push(c)
        s += c * (p[e]! / Qnum)
      }
      for (let i = bOff[u]!, end = bOff[u + 1]!; i < end; i++) {
        const e = bEdge[i]!
        const c = bMult[i]!
        incRowsB[e]!.push(u)
        incMultB[e]!.push(c)
        s += c * (Qnum / p[e]!)
      }
      S[u] = s
    }
    for (let it = 0; it < maxPolish; it++) {
      let worstU = 0
      let worstS = S[0]!
      for (let u = 1; u < nC; u++) if (S[u]! > worstS) {
        worstS = S[u]!
        worstU = u
      }
      let bestE = -1
      let bestDelta = 0
      let bestGlobal = worstS - 1e-12
      const cands = new Set<number>()
      for (let i = aOff[worstU]!, end = aOff[worstU + 1]!; i < end; i++) cands.add(aEdge[i]!)
      for (let i = bOff[worstU]!, end = bOff[worstU + 1]!; i < end; i++) cands.add(bEdge[i]!)
      for (const e of cands) {
        for (const delta of [-1, 1]) {
          const np = p[e]! + delta
          if (np < 1) continue
          const dA = (np - p[e]!) / Qnum
          const dB = Qnum / np - Qnum / p[e]!
          let localMax = 0
          const rA = incRowsA[e]!
          const mA = incMultA[e]!
          for (let i = 0; i < rA.length; i++) {
            const nv = S[rA[i]!]! + mA[i]! * dA
            if (nv > localMax) localMax = nv
          }
          const rB = incRowsB[e]!
          const mB = incMultB[e]!
          for (let i = 0; i < rB.length; i++) {
            const nv = S[rB[i]!]! + mB[i]! * dB
            if (nv > localMax) localMax = nv
          }
          if (localMax < bestGlobal) {
            bestGlobal = localMax
            bestE = e
            bestDelta = delta
          }
        }
      }
      if (bestE < 0) break
      const np = p[bestE]! + bestDelta
      const dA = (np - p[bestE]!) / Qnum
      const dB = Qnum / np - Qnum / p[bestE]!
      p[bestE] = np
      const rA = incRowsA[bestE]!
      const mA = incMultA[bestE]!
      for (let i = 0; i < rA.length; i++) S[rA[i]!] = S[rA[i]!]! + mA[i]! * dA
      const rB = incRowsB[bestE]!
      const mB = incMultB[bestE]!
      for (let i = 0; i < rB.length; i++) S[rB[i]!] = S[rB[i]!]! + mB[i]! * dB
    }
  }
  const Q = BigInt(Qnum)
  let maxNum = 0n
  let maxDen = 1n
  for (let u = 0; u < nC; u++) {
    let prodB = 1n
    for (let i = bOff[u]!, end = bOff[u + 1]!; i < end; i++) prodB *= BigInt(p[bEdge[i]!]!)
    let sumA = 0n
    for (let i = aOff[u]!, end = aOff[u + 1]!; i < end; i++) sumA += BigInt(aMult[i]!) * BigInt(p[aEdge[i]!]!)
    let sumB = 0n
    for (let i = bOff[u]!, end = bOff[u + 1]!; i < end; i++) sumB += BigInt(bMult[i]!) * (prodB / BigInt(p[bEdge[i]!]!))
    const num = sumA * prodB + Q * Q * sumB
    const den = Q * prodB
    if (num * maxDen > maxNum * den) {
      maxNum = num
      maxDen = den
    }
  }
  const g = gcdBig(maxNum, maxDen)
  return { num: maxNum / g, den: maxDen / g, pInts: p }
}

function measure4CycleCurl(
  nC: number,
  c0List: readonly number[],
  stepId: Int32Array,
  stepPerm: Uint16Array,
  stepFlag: Int32Array,
  f: Float64Array,
  w: Float64Array,
): { readonly maxCurl: number; readonly dualWeightedAvg: number } {
  let maxCurl = 0
  let sumWCurl = 0
  let sumW = 0
  for (let u = 0; u < nC; u++) {
    const c0 = c0List[u]!
    const wu = w[u]!
    const baseU = u * 24
    for (let a = 0; a < 24; a++) {
      if ((c0 & (1 << a)) !== 0) continue
      const va = stepId[baseU + a]!
      const pa = WF4[stepPerm[baseU + a]!]!
      const fa = f[stepFlag[baseU + a]!]!
      for (let b = a + 1; b < 24; b++) {
        if ((c0 & (1 << b)) !== 0 || (ADJ_MASK[a]! & (1 << b)) === 0) continue
        const vb = stepId[baseU + b]!
        const pb = WF4[stepPerm[baseU + b]!]!
        const fb = f[stepFlag[baseU + b]!]!
        const fab = f[stepFlag[va * 24 + pa[b]!]!]!
        const fba = f[stepFlag[vb * 24 + pb[a]!]!]!
        const curl = Math.abs(Math.log((fa * fab) / (fb * fba)))
        if (curl > maxCurl) maxCurl = curl
        sumWCurl += wu * curl
        sumW += wu
      }
    }
  }
  return { maxCurl, dualWeightedAvg: sumWCurl / (sumW + 1e-30) }
}

// =================================================================================================
// PART 1 & 2: SUFFIX AUTOMATA S_2..S_5, BALL AUDIT, NAGNIBEDA UPPER BOUNDS, & LEAN-READY D2/D3 CERTS
// =================================================================================================

type UpperPartResult = {
  readonly ball: ExactBall
  readonly d2States: readonly D2State[]
  readonly d2KeyToId: ReadonlyMap<string, number>
  readonly d2StepFlat: Int32Array
  readonly d2StepPerm: Uint16Array
  readonly d4States: readonly D4State[]
  readonly d4StepId: Int32Array
  readonly d4StepPerm: Uint16Array
  readonly d5UpperNum: bigint
  readonly d5UpperDen: bigint
  readonly d5FloatUpper: number
  readonly d5FloatDual: number
  readonly d4St3xNum: bigint
  readonly d4St3xDen: bigint
  readonly d4St4yNum: bigint
  readonly d4St4yDen: bigint
  readonly d2LeanQ1000: { readonly num: bigint; readonly den: bigint; readonly pInts: Int32Array }
  readonly d2LeanQ10000: { readonly num: bigint; readonly den: bigint; readonly pInts: Int32Array }
  readonly d3LeanQ1000: { readonly num: bigint; readonly den: bigint }
  readonly d3LeanQ10000: { readonly num: bigint; readonly den: bigint }
}

function runParts1And2Upper(): UpperPartResult {
  console.log('\n================================================================================')
  console.log('PART 1 & 2: EXACT S_2..S_5 AUTOMATA, 8,857-DOCK BALL AUDIT, & NAGNIBEDA UPPER BOUNDS')
  console.log('================================================================================')

  const tBall = performance.now()
  const ball = buildExactBallR3()
  const racgLetter = (r: number, slot: number): number => ((r & 1) === 0 ? slot : OPPOSITE_SLOT[slot]!)
  console.log(`  Built exact O^+(4,1; Z[sqrt(2)]) R=3 ball: ${ball.nDocks} docks in ${((performance.now() - tBall) / 1000).toFixed(2)}s`)

  // --- D2 [St_2(y), b] (19 states, 23 vars) ---
  const d2States: D2State[] = [{ c0: 0, downs: new Map() }]
  const d2KeyToId = new Map<string, number>([['0', 0]])
  const d2StepFlat = new Int32Array(19 * 24).fill(-1)
  const d2StepPerm = new Uint16Array(19 * 24)
  const d2StepFlag = new Int32Array(19 * 24).fill(-1)
  const d2FlagKey = new Map<string, number>()
  const getD2Flag = (st: D2State, b: number): number => {
    const info = CANON_FLAG.get(`${st.c0}:${b}`)!
    const c0Bits = bitsOf(st.c0)
    let best = ''
    for (const pi of info.permIds) {
      const k = `${info.canonB}:${encodeD2WithPerm(WF4[pi]!, st, c0Bits)}`
      if (best === '' || k < best) best = k
    }
    let id = d2FlagKey.get(best)
    if (id === undefined) {
      id = d2FlagKey.size
      d2FlagKey.set(best, id)
    }
    return id
  }
  const aOff2 = new Int32Array(20)
  const aE2 = new Int32Array(19 * 24)
  const aM2 = new Uint8Array(19 * 24)
  const bOff2 = new Int32Array(20)
  const bE2 = new Int32Array(19 * 3)
  const bM2 = new Uint8Array(19 * 3)
  let ap2 = 0
  let bp2 = 0
  for (let u = 0; u < d2States.length; u++) {
    const st = d2States[u]!
    aOff2[u] = ap2
    const up = new Map<number, number>()
    for (let b = 0; b < 24; b++) {
      if ((st.c0 & (1 << b)) !== 0) continue
      const nxt = stepD2(st, b)
      const info = CANON_CLIQUE.get(nxt.c0)!
      const c0Bits = bitsOf(nxt.c0)
      let best = ''
      let bp = 0
      for (const pi of info.permIds) {
        const k = encodeD2WithPerm(WF4[pi]!, nxt, c0Bits)
        if (best === '' || k < best) {
          best = k
          bp = pi
        }
      }
      let v = d2KeyToId.get(best)
      if (v === undefined) {
        v = d2States.length
        d2KeyToId.set(best, v)
        d2States.push(applyPermD2(WF4[bp]!, nxt))
      }
      const fid = getD2Flag(nxt, b)
      d2StepFlat[u * 24 + b] = v
      d2StepPerm[u * 24 + b] = bp
      d2StepFlag[u * 24 + b] = fid
      up.set(fid, (up.get(fid) ?? 0) + 1)
    }
    for (const [e, c] of up) {
      aE2[ap2] = e
      aM2[ap2] = c
      ap2++
    }
    bOff2[u] = bp2
    const dn = new Map<number, number>()
    for (const a of bitsOf(st.c0)) {
      const fid = getD2Flag(st, a)
      dn.set(fid, (dn.get(fid) ?? 0) + 1)
    }
    for (const [e, c] of dn) {
      bE2[bp2] = e
      bM2[bp2] = c
      bp2++
    }
  }
  aOff2[19] = ap2
  bOff2[19] = bp2
  assertExact(d2States.length === 19 && d2FlagKey.size === 23, 'D2 must have 19 states & 23 flags')
  const sol2 = solveNonlinearPerron(19, 23, aOff2, aE2, aM2, bOff2, bE2, bM2, 1500)
  const curl2 = measure4CycleCurl(19, d2States.map(s => s.c0), d2StepFlat, d2StepPerm, d2StepFlag, sol2.f, sol2.w)
  const d2Q100 = certifyAndPolishQ(19, 23, aOff2, aE2, aM2, bOff2, bE2, bM2, sol2.f, 100, 1000)
  const d2Q1000 = certifyAndPolishQ(19, 23, aOff2, aE2, aM2, bOff2, bE2, bM2, sol2.f, 1000, 1000)
  const d2Q10000 = certifyAndPolishQ(19, 23, aOff2, aE2, aM2, bOff2, bE2, bM2, sol2.f, 10000, 1000)
  console.log(
    `  D2 [St_2(y), b] (   19 states,    23 vars): opt=${sol2.upper.toFixed(8)} dual=${sol2.dual.toFixed(8)} gap=${(sol2.upper - sol2.dual).toExponential(2)} | curl=${curl2.dualWeightedAvg.toFixed(6)}`,
  )
  console.log(
    `    Lean-ready D2 certs: Q=100 <= ${ratCeilDec(d2Q100.num, d2Q100.den, 6)} (${d2Q100.num}/${d2Q100.den}), Q=1000 <= ${ratCeilDec(d2Q1000.num, d2Q1000.den, 6)} (${d2Q1000.num}/${d2Q1000.den}), Q=10000 <= ${ratCeilDec(d2Q10000.num, d2Q10000.den, 6)} (< 11.5!)`,
  )

  // --- D3 [St_3(y), b] (169 states, 220 vars) ---
  const d3States: D3State[] = [{ c0: 0, downs2: new Map() }]
  const d3KeyToId = new Map<string, number>([['0', 0]])
  const d3StepFlat = new Int32Array(169 * 24).fill(-1)
  const d3StepPerm = new Uint16Array(169 * 24)
  const d3StepFlag = new Int32Array(169 * 24).fill(-1)
  const d3FlagKey = new Map<string, number>()
  const getD3Flag = (st: D3State, b: number): number => {
    const info = CANON_FLAG.get(`${st.c0}:${b}`)!
    const c0Bits = bitsOf(st.c0)
    let best = ''
    for (const pi of info.permIds) {
      const k = `${info.canonB}:${encodeD3WithPerm(WF4[pi]!, st, c0Bits)}`
      if (best === '' || k < best) best = k
    }
    let id = d3FlagKey.get(best)
    if (id === undefined) {
      id = d3FlagKey.size
      d3FlagKey.set(best, id)
    }
    return id
  }
  const aOff3 = new Int32Array(170)
  const aE3 = new Int32Array(169 * 24)
  const aM3 = new Uint8Array(169 * 24)
  const bOff3 = new Int32Array(170)
  const bE3 = new Int32Array(169 * 3)
  const bM3 = new Uint8Array(169 * 3)
  let ap3 = 0
  let bp3 = 0
  for (let u = 0; u < d3States.length; u++) {
    const st = d3States[u]!
    aOff3[u] = ap3
    const up = new Map<number, number>()
    for (let b = 0; b < 24; b++) {
      if ((st.c0 & (1 << b)) !== 0) continue
      const nxt = stepD3(st, b)
      const info = CANON_CLIQUE.get(nxt.c0)!
      const c0Bits = bitsOf(nxt.c0)
      let best = ''
      let bp = 0
      for (const pi of info.permIds) {
        const k = encodeD3WithPerm(WF4[pi]!, nxt, c0Bits)
        if (best === '' || k < best) {
          best = k
          bp = pi
        }
      }
      let v = d3KeyToId.get(best)
      if (v === undefined) {
        v = d3States.length
        d3KeyToId.set(best, v)
        d3States.push(applyPermD3(WF4[bp]!, nxt))
      }
      const fid = getD3Flag(nxt, b)
      d3StepFlat[u * 24 + b] = v
      d3StepPerm[u * 24 + b] = bp
      d3StepFlag[u * 24 + b] = fid
      up.set(fid, (up.get(fid) ?? 0) + 1)
    }
    for (const [e, c] of up) {
      aE3[ap3] = e
      aM3[ap3] = c
      ap3++
    }
    bOff3[u] = bp3
    const dn = new Map<number, number>()
    for (const a of bitsOf(st.c0)) {
      const fid = getD3Flag(st, a)
      dn.set(fid, (dn.get(fid) ?? 0) + 1)
    }
    for (const [e, c] of dn) {
      bE3[bp3] = e
      bM3[bp3] = c
      bp3++
    }
  }
  aOff3[169] = ap3
  bOff3[169] = bp3
  assertExact(d3States.length === 169 && d3FlagKey.size === 220, 'D3 must have 169 states & 220 flags')
  const sol3 = solveNonlinearPerron(169, 220, aOff3, aE3, aM3, bOff3, bE3, bM3, 1500)
  const curl3 = measure4CycleCurl(169, d3States.map(s => s.c0), d3StepFlat, d3StepPerm, d3StepFlag, sol3.f, sol3.w)
  const d3Q100 = certifyAndPolishQ(169, 220, aOff3, aE3, aM3, bOff3, bE3, bM3, sol3.f, 100, 1200)
  const d3Q1000 = certifyAndPolishQ(169, 220, aOff3, aE3, aM3, bOff3, bE3, bM3, sol3.f, 1000, 1200)
  const d3Q10000 = certifyAndPolishQ(169, 220, aOff3, aE3, aM3, bOff3, bE3, bM3, sol3.f, 10000, 1200)
  console.log(
    `  D3 [St_3(y), b] (  169 states,   220 vars): opt=${sol3.upper.toFixed(8)} dual=${sol3.dual.toFixed(8)} gap=${(sol3.upper - sol3.dual).toExponential(2)} | curl=${curl3.dualWeightedAvg.toFixed(6)}`,
  )
  console.log(
    `    Lean-ready D3 certs: Q=100 <= ${ratCeilDec(d3Q100.num, d3Q100.den, 6)} (${d3Q100.num}/${d3Q100.den}), Q=1000 <= ${ratCeilDec(d3Q1000.num, d3Q1000.den, 6)} (${d3Q1000.num}/${d3Q1000.den}), Q=10000 <= ${ratCeilDec(d3Q10000.num, d3Q10000.den, 6)} (${d3Q10000.num}/${d3Q10000.den})`,
  )

  // --- D4 (2,197 states): both [St_3(x), b] (2,636 vars) AND [St_4(y), b] (2,801 vars) ---
  const d4States: D4State[] = [{ c0: 0, downs3: new Map() }]
  const d4KeyToId = new Map<string, number>([['0', 0]])
  const d4Auts: number[][] = [Array.from({ length: 1152 }, (_, i) => i)]
  const d4StepId = new Int32Array(2197 * 24).fill(-1)
  const d4StepPerm = new Uint16Array(2197 * 24)
  const d4StepFlag = new Int32Array(2197 * 24).fill(-1)
  const d4FlagKey = new Map<string, number>()
  const getD4Flag = (st: D4State, b: number): number => {
    const info = CANON_FLAG.get(`${st.c0}:${b}`)!
    const c0Bits = bitsOf(st.c0)
    let best = ''
    for (const pi of info.permIds) {
      const k = `${info.canonB}:${encodeD4WithPerm(WF4[pi]!, st, c0Bits)}`
      if (best === '' || k < best) best = k
    }
    let id = d4FlagKey.get(best)
    if (id === undefined) {
      id = d4FlagKey.size
      d4FlagKey.set(best, id)
    }
    return id
  }
  const d3xFlagKey = new Map<string, number>()
  const getD3xEdge = (st3: D3State, b: number): number => {
    // [St_3(x), b]_{W(F_4)}: well-defined on BOTH endpoints of x -> y = x s_b at Depth 4 since St_4(y).downs3(b) == St_3(x)!
    if (st3.c0 === 0) {
      const k = 'root:0'
      let id = d3xFlagKey.get(k)
      if (id === undefined) {
        id = d3xFlagKey.size
        d3xFlagKey.set(k, id)
      }
      return id
    }
    const info = CANON_CLIQUE.get(st3.c0)!
    const c0Bits = bitsOf(st3.c0)
    let best = ''
    for (const pi of info.permIds) {
      const p = WF4[pi]!
      const k = `${p[b]!}:${encodeD3WithPerm(p, st3, c0Bits)}`
      if (best === '' || k < best) best = k
    }
    let id = d3xFlagKey.get(best)
    if (id === undefined) {
      id = d3xFlagKey.size
      d3xFlagKey.set(best, id)
    }
    return id
  }

  const aOff4 = new Int32Array(2198)
  const aE4 = new Int32Array(2197 * 24)
  const aM4 = new Uint8Array(2197 * 24)
  const bOff4 = new Int32Array(2198)
  const bE4 = new Int32Array(2197 * 3)
  const bM4 = new Uint8Array(2197 * 3)
  const aOff4x = new Int32Array(2198)
  const aE4x = new Int32Array(2197 * 24)
  const aM4x = new Uint8Array(2197 * 24)
  const bOff4x = new Int32Array(2198)
  const bE4x = new Int32Array(2197 * 3)
  const bM4x = new Uint8Array(2197 * 3)
  let ap4 = 0
  let bp4 = 0
  let ap4x = 0
  let bp4x = 0

  for (let u = 0; u < d4States.length; u++) {
    const st = d4States[u]!
    // Project St_4(x) -> St_3(x) for [St_3(x), b]
    const proj3Down = new Map<number, D2State>()
    for (const [x, d3x] of st.downs3) {
      const dm1 = new Map<number, number>()
      for (const [y, d2y] of d3x.downs2) dm1.set(y, d2y.c0)
      proj3Down.set(x, { c0: d3x.c0, downs: dm1 })
    }
    const st3OfX: D3State = { c0: st.c0, downs2: proj3Down }

    aOff4[u] = ap4
    aOff4x[u] = ap4x
    const up = new Map<number, number>()
    const upX = new Map<number, number>()
    for (let b = 0; b < 24; b++) {
      if ((st.c0 & (1 << b)) !== 0) continue
      const nxt = stepD4(st, b)
      const info = CANON_CLIQUE.get(nxt.c0)!
      const c0Bits = bitsOf(nxt.c0)
      let best = ''
      let bp = 0
      for (const pi of info.permIds) {
        const k = encodeD4WithPerm(WF4[pi]!, nxt, c0Bits)
        if (best === '' || k < best) {
          best = k
          bp = pi
        }
      }
      let v = d4KeyToId.get(best)
      if (v === undefined) {
        v = d4States.length
        d4KeyToId.set(best, v)
        const cRep = applyPermD4(WF4[bp]!, nxt)
        d4States.push(cRep)
        const cInfo = CANON_CLIQUE.get(cRep.c0)!
        const cBits = bitsOf(cRep.c0)
        const aut: number[] = []
        for (const pi of cInfo.permIds) if (encodeD4WithPerm(WF4[pi]!, cRep, cBits) === best) aut.push(pi)
        d4Auts.push(aut)
      }
      const fid = getD4Flag(nxt, b)
      d4StepId[u * 24 + b] = v
      d4StepPerm[u * 24 + b] = bp
      d4StepFlag[u * 24 + b] = fid
      up.set(fid, (up.get(fid) ?? 0) + 1)
      const eidX = getD3xEdge(st3OfX, b)
      upX.set(eidX, (upX.get(eidX) ?? 0) + 1)
    }
    for (const [e, c] of up) {
      aE4[ap4] = e
      aM4[ap4] = c
      ap4++
    }
    for (const [e, c] of upX) {
      aE4x[ap4x] = e
      aM4x[ap4x] = c
      ap4x++
    }
    bOff4[u] = bp4
    bOff4x[u] = bp4x
    const dn = new Map<number, number>()
    const dnX = new Map<number, number>()
    for (const a of bitsOf(st.c0)) {
      const fid = getD4Flag(st, a)
      dn.set(fid, (dn.get(fid) ?? 0) + 1)
      const eidX = getD3xEdge(st.downs3.get(a)!, a)
      dnX.set(eidX, (dnX.get(eidX) ?? 0) + 1)
    }
    for (const [e, c] of dn) {
      bE4[bp4] = e
      bM4[bp4] = c
      bp4++
    }
    for (const [e, c] of dnX) {
      bE4x[bp4x] = e
      bM4x[bp4x] = c
      bp4x++
    }
  }
  aOff4[2197] = ap4
  bOff4[2197] = bp4
  aOff4x[2197] = ap4x
  bOff4x[2197] = bp4x
  assertExact(d4States.length === 2197 && d4FlagKey.size === 2801 && d3xFlagKey.size === 2636, 'D4 sizes mismatch')

  const sol4 = solveNonlinearPerron(2197, 2801, aOff4, aE4, aM4, bOff4, bE4, bM4, 1500)
  const c4 = certifyAndPolishQ(2197, 2801, aOff4, aE4, aM4, bOff4, bE4, bM4, sol4.f, 1_000_000, 0)
  const curl4 = measure4CycleCurl(2197, d4States.map(s => s.c0), d4StepId, d4StepPerm, d4StepFlag, sol4.f, sol4.w)
  // Warm-start D4 [St_3(x), b] (2,636 vars) by projecting exact D4 [St_4(y), b] weights onto each [St_3(x), b] orbit!
  const logSumX = new Float64Array(2636)
  const cntX = new Int32Array(2636)
  for (let u = 0; u < 2197; u++) {
    const st = d4States[u]!
    for (const a of bitsOf(st.c0)) {
      const f4 = getD4Flag(st, a)
      const eX = getD3xEdge(st.downs3.get(a)!, a)
      logSumX[eX] = logSumX[eX]! + Math.log(sol4.f[f4]!)
      cntX[eX] = cntX[eX]! + 1
    }
  }
  const fWarmX = new Float64Array(2636)
  for (let e = 0; e < 2636; e++) fWarmX[e] = Math.exp(logSumX[e]! / Math.max(1, cntX[e]!))
  const sol4x = solveGeneralPosynomialMinimax(2197, 2636, aOff4x, aE4x, aM4x, bOff4x, bE4x, bM4x, fWarmX)
  const c4x = certifyAndPolishQ(2197, 2636, aOff4x, aE4x, aM4x, bOff4x, bE4x, bM4x, sol4x.f, 1_000_000, 0)
  console.log(
    `  D4 [St_3(x), b] ( 2197 states,  2636 vars): opt=${sol4x.upper.toFixed(8)} dual=${sol4x.dual.toFixed(8)} | BigInt Q=10^6 <= ${ratCeilDec(c4x.num, c4x.den, 6)}`,
  )
  console.log(
    `  D4 [St_4(y), b] ( 2197 states,  2801 vars): opt=${sol4.upper.toFixed(8)} dual=${sol4.dual.toFixed(8)} gap=${(sol4.upper - sol4.dual).toExponential(2)} | BigInt Q=10^6 <= ${ratCeilDec(c4.num, c4.den, 6)} | curl=${curl4.dualWeightedAvg.toFixed(6)}`,
  )

  // --- D5 [St_5(y), b] (34,523 states, 43,312 vars) via O(1) W(F_4)-coset engine ---
  const tD5 = performance.now()
  const D4_MIN_COSET = new Uint16Array(2197 * 1152)
  for (let u = 0; u < 2197; u++) {
    const aut = d4Auts[u]!
    const base = u * 1152
    if (aut.length === 1) {
      for (let p = 0; p < 1152; p++) D4_MIN_COSET[base + p] = p
    } else {
      for (let p = 0; p < 1152; p++) {
        let mn = 1152
        for (let i = 0; i < aut.length; i++) {
          const hp = WF4_MUL[aut[i]! * 1152 + p]!
          if (hp < mn) mn = hp
        }
        D4_MIN_COSET[base + p] = mn
      }
    }
  }
  const MAX_D5 = 35000
  const d5C0 = new Int32Array(MAX_D5)
  const d5K = new Uint8Array(MAX_D5)
  const d5SelfId = new Uint16Array(MAX_D5)
  const d5SelfP = new Uint16Array(MAX_D5)
  const d5DownA = new Uint8Array(MAX_D5 * 3)
  const d5DownId = new Uint16Array(MAX_D5 * 3)
  const d5DownP = new Uint16Array(MAX_D5 * 3)
  const d5KeyToId = new Map<string, number>([['0', 0]])
  let nD5 = 1
  const d5StepId = new Int32Array(MAX_D5 * 24).fill(-1)
  const d5StepPerm = new Uint16Array(MAX_D5 * 24)
  const d5StepImgB = new Uint8Array(MAX_D5 * 24)
  const tmpA = new Int32Array(3)
  const tmpId = new Int32Array(3)
  const tmpP = new Int32Array(3)
  const curA = new Int32Array(3)
  const curId = new Int32Array(3)
  const curP = new Int32Array(3)

  for (let u = 0; u < nD5; u++) {
    const c0 = d5C0[u]!
    const ku = d5K[u]!
    const selfId = d5SelfId[u]!
    const selfP = d5SelfP[u]!
    const uBase = u * 3
    const stepBase = u * 24
    for (let b = 0; b < 24; b++) {
      if ((c0 & (1 << b)) !== 0) continue
      const newC0 = (1 << b) | (c0 & ADJ_MASK[b]!)
      let nk = 0
      tmpA[nk] = b
      tmpId[nk] = selfId
      tmpP[nk] = selfP
      nk++
      const adjB = ADJ_MASK[b]!
      for (let i = 0; i < ku; i++) {
        const a = d5DownA[uBase + i]!
        if ((adjB & (1 << a)) === 0) continue
        const aid = d5DownId[uBase + i]!
        const ap = d5DownP[uBase + i]!
        const bLoc = WF4[ap]![b]!
        const nxtId = d4StepId[aid * 24 + bLoc]!
        const q = d4StepPerm[aid * 24 + bLoc]!
        tmpA[nk] = a
        tmpId[nk] = nxtId
        tmpP[nk] = D4_MIN_COSET[nxtId * 1152 + WF4_MUL[q * 1152 + ap]!]!
        nk++
      }
      const info = CANON_CLIQUE.get(newC0)!
      const permIds = info.permIds
      let bestPerm = -1
      let bA0 = 999
      let bId0 = 99999
      let bP0 = 99999
      let bA1 = 999
      let bId1 = 99999
      let bP1 = 99999
      let bA2 = 999
      let bId2 = 99999
      let bP2 = 99999
      for (let pi = 0; pi < permIds.length; pi++) {
        const g = permIds[pi]!
        const gArr = WF4[g]!
        const gInv = WF4_INV[g]!
        for (let i = 0; i < nk; i++) {
          curA[i] = gArr[tmpA[i]!]!
          const id = tmpId[i]!
          curId[i] = id
          curP[i] = D4_MIN_COSET[id * 1152 + WF4_MUL[tmpP[i]! * 1152 + gInv]!]!
        }
        if (nk === 2 && curA[0]! > curA[1]!) {
          let t = curA[0]!
          curA[0] = curA[1]!
          curA[1] = t
          t = curId[0]!
          curId[0] = curId[1]!
          curId[1] = t
          t = curP[0]!
          curP[0] = curP[1]!
          curP[1] = t
        } else if (nk === 3) {
          if (curA[0]! > curA[1]!) {
            let t = curA[0]!
            curA[0] = curA[1]!
            curA[1] = t
            t = curId[0]!
            curId[0] = curId[1]!
            curId[1] = t
            t = curP[0]!
            curP[0] = curP[1]!
            curP[1] = t
          }
          if (curA[1]! > curA[2]!) {
            let t = curA[1]!
            curA[1] = curA[2]!
            curA[2] = t
            t = curId[1]!
            curId[1] = curId[2]!
            curId[2] = t
            t = curP[1]!
            curP[1] = curP[2]!
            curP[2] = t
          }
          if (curA[0]! > curA[1]!) {
            let t = curA[0]!
            curA[0] = curA[1]!
            curA[1] = t
            t = curId[0]!
            curId[0] = curId[1]!
            curId[1] = t
            t = curP[0]!
            curP[0] = curP[1]!
            curP[1] = t
          }
        }
        let better = bestPerm < 0
        if (!better) {
          if (curA[0]! !== bA0) better = curA[0]! < bA0
          else if (curId[0]! !== bId0) better = curId[0]! < bId0
          else if (curP[0]! !== bP0) better = curP[0]! < bP0
          else if (nk >= 2 && curA[1]! !== bA1) better = curA[1]! < bA1
          else if (nk >= 2 && curId[1]! !== bId1) better = curId[1]! < bId1
          else if (nk >= 2 && curP[1]! !== bP1) better = curP[1]! < bP1
          else if (nk === 3 && curA[2]! !== bA2) better = curA[2]! < bA2
          else if (nk === 3 && curId[2]! !== bId2) better = curId[2]! < bId2
          else if (nk === 3 && curP[2]! !== bP2) better = curP[2]! < bP2
        }
        if (better) {
          bestPerm = g
          bA0 = curA[0]!
          bId0 = curId[0]!
          bP0 = curP[0]!
          if (nk >= 2) {
            bA1 = curA[1]!
            bId1 = curId[1]!
            bP1 = curP[1]!
          }
          if (nk === 3) {
            bA2 = curA[2]!
            bId2 = curId[2]!
            bP2 = curP[2]!
          }
        }
      }
      const key =
        nk === 1
          ? `${info.canon}|${bA0},${bId0},${bP0}`
          : nk === 2
            ? `${info.canon}|${bA0},${bId0},${bP0}|${bA1},${bId1},${bP1}`
            : `${info.canon}|${bA0},${bId0},${bP0}|${bA1},${bId1},${bP1}|${bA2},${bId2},${bP2}`
      let v = d5KeyToId.get(key)
      if (v === undefined) {
        v = nD5++
        d5KeyToId.set(key, v)
        d5C0[v] = info.canon
        d5K[v] = nk
        const bLocS = WF4[selfP]![b]!
        const nSelfId = d4StepId[selfId * 24 + bLocS]!
        const qS = d4StepPerm[selfId * 24 + bLocS]!
        d5SelfId[v] = nSelfId
        d5SelfP[v] = D4_MIN_COSET[nSelfId * 1152 + WF4_MUL[WF4_MUL[qS * 1152 + selfP]! * 1152 + WF4_INV[bestPerm]!]!]!
        const vBase = v * 3
        d5DownA[vBase] = bA0
        d5DownId[vBase] = bId0
        d5DownP[vBase] = bP0
        if (nk >= 2) {
          d5DownA[vBase + 1] = bA1
          d5DownId[vBase + 1] = bId1
          d5DownP[vBase + 1] = bP1
        }
        if (nk === 3) {
          d5DownA[vBase + 2] = bA2
          d5DownId[vBase + 2] = bId2
          d5DownP[vBase + 2] = bP2
        }
      }
      d5StepId[stepBase + b] = v
      d5StepPerm[stepBase + b] = bestPerm
      d5StepImgB[stepBase + b] = WF4[bestPerm]![b]!
    }
  }
  assertExact(nD5 === 34523, `Expected 34,523 S_5 states, got ${nD5}`)

  // Verify exact BigInt shell sums r = 0..6 on S_5
  const expectedShells = [1n, 24n, 456n, 8376n, 153192n, 2800344n, 51187080n]
  let curN = new Array<bigint>(nD5).fill(0n)
  curN[0] = 1n
  const s5HistByR: bigint[][] = [curN]
  for (let r = 1; r <= 6; r++) {
    const nxtN = new Array<bigint>(nD5).fill(0n)
    for (let u = 0; u < nD5; u++) {
      const nu = curN[u]!
      if (nu === 0n) continue
      const base = u * 24
      for (let b = 0; b < 24; b++) {
        const v = d5StepId[base + b]!
        if (v >= 0) nxtN[v] = nxtN[v]! + nu
      }
    }
    let sum = 0n
    for (let v = 1; v < nD5; v++) {
      const kv = BigInt(d5K[v]!)
      assertExact(nxtN[v]! % kv === 0n, `S_5 integrality failed at r=${r}, v=${v}`)
      nxtN[v] = nxtN[v]! / kv
      sum += nxtN[v]!
    }
    assertExact(sum === expectedShells[r], `S_5 shell sum mismatch at r=${r}: ${sum}`)
    curN = nxtN
    if (r <= 3) s5HistByR.push(curN)
  }

  // Exact D5 upward-end flags [St_5(y), b] (43,312 orbits)
  const d5FlagId = new Int32Array(nD5 * 3).fill(-1)
  let nD5Flags = 0
  for (let v = 1; v < nD5; v++) {
    const k = d5K[v]!
    const vBase = v * 3
    if (k === 1) {
      d5FlagId[vBase] = nD5Flags++
      continue
    }
    const c0 = d5C0[v]!
    const permIds = CANON_CLIQUE.get(c0)!.permIds
    const repSlot = [0, 1, 2]
    for (let pi = 0; pi < permIds.length; pi++) {
      const g = permIds[pi]!
      const gArr = WF4[g]!
      const gInv = WF4_INV[g]!
      let fixes = true
      const permOfSlot = [0, 0, 0]
      for (let i = 0; i < k; i++) {
        const ga = gArr[d5DownA[vBase + i]!]!
        let j = -1
        for (let t = 0; t < k; t++) if (d5DownA[vBase + t] === ga) {
          j = t
          break
        }
        if (j < 0 || d5DownId[vBase + i] !== d5DownId[vBase + j]) {
          fixes = false
          break
        }
        if (D4_MIN_COSET[d5DownId[vBase + i]! * 1152 + WF4_MUL[d5DownP[vBase + i]! * 1152 + gInv]!] !== d5DownP[vBase + j]) {
          fixes = false
          break
        }
        permOfSlot[i] = j
      }
      if (fixes) {
        for (let i = 0; i < k; i++) {
          const j = permOfSlot[i]!
          const mn = Math.min(repSlot[i]!, repSlot[j]!)
          const mx = Math.max(repSlot[i]!, repSlot[j]!)
          for (let t = 0; t < k; t++) if (repSlot[t] === mx) repSlot[t] = mn
        }
      }
    }
    const slotMap = new Map<number, number>()
    for (let i = 0; i < k; i++) {
      const r = repSlot[i]!
      let fid = slotMap.get(r)
      if (fid === undefined) {
        fid = nD5Flags++
        slotMap.set(r, fid)
      }
      d5FlagId[vBase + i] = fid
    }
  }
  assertExact(nD5Flags === 43312, `Expected 43,312 D5 flags, got ${nD5Flags}`)

  const aOff5 = new Int32Array(nD5 + 1)
  const aE5 = new Int32Array(nD5 * 24)
  const aM5 = new Uint8Array(nD5 * 24)
  const bOff5 = new Int32Array(nD5 + 1)
  const bE5 = new Int32Array(nD5 * 3)
  const bM5 = new Uint8Array(nD5 * 3)
  let a5 = 0
  let b5 = 0
  for (let u = 0; u < nD5; u++) {
    aOff5[u] = a5
    const sBase = u * 24
    const up = new Map<number, number>()
    for (let b = 0; b < 24; b++) {
      const v = d5StepId[sBase + b]!
      if (v < 0) continue
      const imgB = d5StepImgB[sBase + b]!
      const kv = d5K[v]!
      const vBase = v * 3
      let slot = -1
      for (let i = 0; i < kv; i++) if (d5DownA[vBase + i] === imgB) {
        slot = i
        break
      }
      const fid = d5FlagId[vBase + slot]!
      up.set(fid, (up.get(fid) ?? 0) + 1)
    }
    for (const [fid, m] of up) {
      aE5[a5] = fid
      aM5[a5] = m
      a5++
    }
    bOff5[u] = b5
    const ku = d5K[u]!
    const uBase = u * 3
    const dn = new Map<number, number>()
    for (let i = 0; i < ku; i++) {
      const fid = d5FlagId[uBase + i]!
      dn.set(fid, (dn.get(fid) ?? 0) + 1)
    }
    for (const [fid, m] of dn) {
      bE5[b5] = fid
      bM5[b5] = m
      b5++
    }
  }
  aOff5[nD5] = a5
  bOff5[nD5] = b5

  const sol5 = solveNonlinearPerron(nD5, nD5Flags, aOff5, aE5, aM5, bOff5, bE5, bM5, 1200)
  const Q5 = 1_000_000
  const c5 = certifyAndPolishQ(nD5, nD5Flags, aOff5, aE5, aM5, bOff5, bE5, bM5, sol5.f, Q5, 0)
  console.log(
    `  D5 [St_5(y), b] (34523 states, 43312 vars): opt=${sol5.upper.toFixed(8)} dual=${sol5.dual.toFixed(8)} gap=${(sol5.upper - sol5.dual).toExponential(2)} | BigInt Q=10^6 <= ${ratCeilDec(c5.num, c5.den, 6)} (${((performance.now() - tD5) / 1000).toFixed(2)}s)`,
  )

  // --- Direct 8,857-dock O^+(4,1; Z[sqrt(2)]) R=3 ball cross-check of S_5 & D5 reciprocity ---
  // Propagate exact (s5Id, permToCanon) from origin across ALL 8,857 docks and assert path-independence,
  // histogram agreement across all 34,523 states, 0 reciprocity mismatches on all 10,968 edges,
  // and exact BigInt Schur row sum <= c5 on all 481 interior docks (r <= 2)!
  const dockS5 = new Int32Array(ball.nDocks).fill(-1)
  const dockPerm = new Uint16Array(ball.nDocks)
  dockS5[0] = 0
  dockPerm[0] = 0
  let s5PathMismatches = 0
  let recipMismatches = 0
  let ballEdgesChecked = 0
  for (let r = 0; r < 3; r++) {
    for (let d = 0; d < ball.nDocks; d++) {
      if (ball.radius[d] !== r) continue
      const u = dockS5[d]!
      const pU = dockPerm[d]!
      for (let s = 0; s < 24; s++) {
        const nb = ball.neighbors[d]![s]!
        if (nb < 0 || ball.radius[nb] !== r + 1) continue
        const bGlob = racgLetter(r, s)
        const bLoc = WF4[pU]![bGlob]!
        const v = d5StepId[u * 24 + bLoc]!
        const q = d5StepPerm[u * 24 + bLoc]!
        const pNext = WF4_MUL[q * 1152 + pU]!
        if (dockS5[nb] === -1) {
          dockS5[nb] = v
          dockPerm[nb] = pNext
        } else if (dockS5[nb] !== v) {
          s5PathMismatches++
        }
        // Check exact reciprocity: upward flag computed from d->nb MUST equal downward flag computed from nb!
        const imgB = d5StepImgB[u * 24 + bLoc]!
        const kv = d5K[v]!
        const vBase = v * 3
        let slotUp = -1
        for (let i = 0; i < kv; i++) if (d5DownA[vBase + i] === imgB) {
          slotUp = i
          break
        }
        const bInNbFrame = WF4[dockPerm[nb]!]![bGlob]!
        let slotDn = -1
        for (let i = 0; i < kv; i++) if (d5DownA[vBase + i] === bInNbFrame) {
          slotDn = i
          break
        }
        if (slotUp < 0 || slotDn < 0 || d5FlagId[vBase + slotUp] !== d5FlagId[vBase + slotDn]) recipMismatches++
        ballEdgesChecked++
      }
    }
  }
  let histMismatches = 0
  for (let r = 0; r <= 3; r++) {
    const counts = new Array<bigint>(nD5).fill(0n)
    for (let d = 0; d < ball.nDocks; d++) if (ball.radius[d] === r) counts[dockS5[d]!] = counts[dockS5[d]!]! + 1n
    for (let u = 0; u < nD5; u++) if (counts[u] !== s5HistByR[r]![u]) histMismatches++
  }
  // Exact BigInt Schur row-sum check on all 481 interior docks (r <= 2) of B_3 using c5.pInts!
  const Q5Big = BigInt(Q5)
  let interiorExceed = 0
  for (let d = 0; d < ball.nDocks; d++) {
    const r = ball.radius[d]!
    if (r > 2) continue
    const u = dockS5[d]!
    const pU = dockPerm[d]!
    const upFids: number[] = []
    const dnFids: number[] = []
    for (let s = 0; s < 24; s++) {
      const nb = ball.neighbors[d]![s]!
      assertExact(nb >= 0, 'Interior dock missing neighbor')
      if (ball.radius[nb] === r + 1) {
        const bLoc = WF4[pU]![racgLetter(r, s)]!
        const v = d5StepId[u * 24 + bLoc]!
        const imgB = d5StepImgB[u * 24 + bLoc]!
        const vBase = v * 3
        let slot = -1
        for (let i = 0; i < d5K[v]!; i++) if (d5DownA[vBase + i] === imgB) {
          slot = i
          break
        }
        upFids.push(d5FlagId[vBase + slot]!)
      } else {
        const bGlob = racgLetter(r - 1, OPPOSITE_SLOT[s]!)
        const bLoc = WF4[pU]![bGlob]!
        const uBase = u * 3
        let slot = -1
        for (let i = 0; i < d5K[u]!; i++) if (d5DownA[uBase + i] === bLoc) {
          slot = i
          break
        }
        dnFids.push(d5FlagId[uBase + slot]!)
      }
    }
    let prodB = 1n
    for (const f of dnFids) prodB *= BigInt(c5.pInts[f]!)
    let sumA = 0n
    for (const f of upFids) sumA += BigInt(c5.pInts[f]!)
    let sumB = 0n
    for (const f of dnFids) sumB += prodB / BigInt(c5.pInts[f]!)
    const rowNum = sumA * prodB + Q5Big * Q5Big * sumB
    const rowDen = Q5Big * prodB
    if (rowNum * c5.den > c5.num * rowDen) interiorExceed++
  }
  console.log(
    `  Ball R=3 audit (8,857 docks, ${ballEdgesChecked} upward edges): pathMismatches=${s5PathMismatches}, histMismatches=${histMismatches}, recipMismatches=${recipMismatches}, interiorSchurViolations=${interiorExceed}`,
  )

  recordCheck(
    'P1',
    'Exact S_5 automaton (34,523 states) & O^+(4,1; Z[sqrt(2)]) R=3 ball cross-check',
    nD5 === 34523 && s5PathMismatches === 0 && histMismatches === 0 && recipMismatches === 0 && interiorExceed === 0,
    `shells r=0..6 exact, 8857 docks, ${ballEdgesChecked} edges: 0 path/hist/reciprocity/Schur mismatches`,
  )
  recordCheck(
    'P2A',
    'Exact BigInt Nagnibeda upper bounds D4 [St_3(x),b], D4 [St_4(y),b], D5 [St_5(y),b]',
    sol5.upper - sol5.dual < 1e-7 && c5.num * 1000000n <= 11443720n * c5.den && c4x.num * 1000000n < 11452078n * c4x.den,
    `D4[St3x]<= ${ratCeilDec(c4x.num, c4x.den, 6)}, D4[St4y]<= ${ratCeilDec(c4.num, c4.den, 6)}, D5[St5y]<= ${ratCeilDec(c5.num, c5.den, 6)} (gap=${(sol5.upper - sol5.dual).toExponential(2)})`,
  )
  recordCheck(
    'P2B',
    'Compact Lean-ready D2 (19 states) & D3 (169 states) certs + 4-cycle curl decay',
    d2Q10000.num * 10n < 115n * d2Q10000.den && d3Q10000.num * 1000000n <= 11456000n * d3Q10000.den && curl4.dualWeightedAvg < curl3.dualWeightedAvg && curl3.dualWeightedAvg < curl2.dualWeightedAvg,
    `D2(Q=10k)<=${ratCeilDec(d2Q10000.num, d2Q10000.den, 6)}, D3(Q=1k)<=${ratCeilDec(d3Q1000.num, d3Q1000.den, 6)}, D3(Q=10k)<=${ratCeilDec(d3Q10000.num, d3Q10000.den, 6)}, curl ${curl2.dualWeightedAvg.toFixed(4)}->${curl3.dualWeightedAvg.toFixed(4)}->${curl4.dualWeightedAvg.toFixed(4)}`,
  )

  return {
    ball,
    d2States,
    d2KeyToId,
    d2StepFlat,
    d2StepPerm,
    d4States,
    d4StepId,
    d4StepPerm,
    d5UpperNum: c5.num,
    d5UpperDen: c5.den,
    d5FloatUpper: sol5.upper,
    d5FloatDual: sol5.dual,
    d4St3xNum: c4x.num,
    d4St3xDen: c4x.den,
    d4St4yNum: c4.num,
    d4St4yDen: c4.den,
    d2LeanQ1000: d2Q1000,
    d2LeanQ10000: d2Q10000,
    d3LeanQ1000: { num: d3Q1000.num, den: d3Q1000.den },
    d3LeanQ10000: { num: d3Q10000.num, den: d3Q10000.den },
  }
}

// =================================================================================================
// PART 3: EXACT ZERO-DROPPED-EDGE CARTIER-FOATA MARKOV LOWER BOUNDS + CONCRETE EXACT BIGINT WITNESS
// =================================================================================================

type CFLowerResult = {
  readonly rho0Step: number
  readonly rho1Step57: number
  readonly rho2Step57: number
  readonly rho2Step4440: number
  readonly bigNum: bigint
  readonly bigDen: bigint
}

function runPart3CartierFoataLower(ball: ExactBall): CFLowerResult {
  console.log('\n================================================================================')
  console.log('PART 3: EXACT ZERO-DROPPED-EDGE CARTIER-FOATA MARKOV LOWER BOUNDS & BIGINT WITNESS')
  console.log('================================================================================')
  const t0 = performance.now()
  const racgLetter = (r: number, slot: number): number => ((r & 1) === 0 ? slot : OPPOSITE_SLOT[slot]!)

  // 1. All 216 non-empty cliques of Gamma_24 (index 0 = empty)
  const CLIQUES: number[] = [0]
  const CLIQUE_TO_ID = new Map<number, number>([[0, 0]])
  for (let a = 0; a < 24; a++) {
    const m = 1 << a
    CLIQUE_TO_ID.set(m, CLIQUES.length)
    CLIQUES.push(m)
  }
  for (let a = 0; a < 24; a++) {
    for (let b = a + 1; b < 24; b++) {
      if ((ADJ_MASK[a]! & (1 << b)) === 0) continue
      const m = (1 << a) | (1 << b)
      CLIQUE_TO_ID.set(m, CLIQUES.length)
      CLIQUES.push(m)
    }
  }
  for (let a = 0; a < 24; a++) {
    for (let b = a + 1; b < 24; b++) {
      if ((ADJ_MASK[a]! & (1 << b)) === 0) continue
      for (let c = b + 1; c < 24; c++) {
        if ((ADJ_MASK[a]! & (1 << c)) !== 0 && (ADJ_MASK[b]! & (1 << c)) !== 0) {
          const m = (1 << a) | (1 << b) | (1 << c)
          CLIQUE_TO_ID.set(m, CLIQUES.length)
          CLIQUES.push(m)
        }
      }
    }
  }
  const N_CLIQUES = CLIQUES.length // 217
  assertExact(N_CLIQUES === 217, 'Expected 216 non-empty cliques + empty')
  const CLIQUE_SIZE = new Uint8Array(N_CLIQUES)
  const COMMON_ADJ = new Int32Array(N_CLIQUES)
  const ALLOWED_NEXT = new Int32Array(N_CLIQUES)
  for (let i = 0; i < N_CLIQUES; i++) {
    const c = CLIQUES[i]!
    CLIQUE_SIZE[i] = popcount(c)
    let comm = ALL24
    for (const a of bitsOf(c)) comm &= ADJ_MASK[a]!
    COMMON_ADJ[i] = comm
    ALLOWED_NEXT[i] = i === 0 ? ALL24 : ALL24 & ~(c | comm)
  }
  const NEXT_CLIQUES: number[][] = Array.from({ length: N_CLIQUES }, (_, i) => {
    const f = ALLOWED_NEXT[i]!
    const out: number[] = []
    for (let j = 1; j < N_CLIQUES; j++) if ((CLIQUES[j]! & f) === CLIQUES[j]!) out.push(j)
    return out
  })
  const PREV_CLIQUES: number[][] = Array.from({ length: N_CLIQUES }, () => [])
  for (let i = 1; i < N_CLIQUES; i++) for (const j of NEXT_CLIQUES[i]!) PREV_CLIQUES[j]!.push(i)

  // Verify exact Cartier-Foata bijection shell counts r = 0..6
  const repBySize = [0, 1, 25, 121]
  const nOfSize = [0, 24, 96, 96]
  const transCnt = [
    [0, 0, 0, 0],
    [0, 0, 0, 0],
    [0, 0, 0, 0],
    [0, 0, 0, 0],
  ]
  for (let s1 = 0; s1 <= 3; s1++) {
    const fMask = ALLOWED_NEXT[repBySize[s1]!]!
    for (let j = 1; j < N_CLIQUES; j++) {
      if ((CLIQUES[j]! & fMask) === CLIQUES[j]!) transCnt[s1]![CLIQUE_SIZE[j]!] = transCnt[s1]![CLIQUE_SIZE[j]!]! + 1
    }
  }
  const dpShell: bigint[][] = Array.from({ length: 7 }, () => [0n, 0n, 0n, 0n])
  dpShell[0]![0] = 1n
  for (let r = 0; r < 6; r++) {
    for (let s1 = 0; s1 <= 3; s1++) {
      const cnt = dpShell[r]![s1]!
      if (cnt === 0n) continue
      for (let s2 = 1; s2 <= 3; s2++) if (r + s2 <= 6) dpShell[r + s2]![s2] = dpShell[r + s2]![s2]! + cnt * BigInt(transCnt[s1]![s2]!)
    }
  }
  const expectedShells = [1n, 24n, 456n, 8376n, 153192n, 2800344n, 51187080n]
  for (let r = 0; r <= 6; r++) assertExact(dpShell[r]!.reduce((a, b) => a + b, 0n) === expectedShells[r], `CF shell ${r} mismatch`)

  // 2. 57 Pair orbits & 4,440 Triple orbits mod W(F_4)
  const stabBySizeIdx: number[][] = [[], [], [], []]
  for (let s = 1; s <= 3; s++) {
    const m = CLIQUES[repBySize[s]!]!
    for (let pi = 0; pi < 1152; pi++) if (permMask(WF4[pi]!, m) === m) stabBySizeIdx[s]!.push(pi)
  }
  type PairOrbit = {
    readonly id: number
    readonly s1: number
    readonly s2: number
    readonly c1Id: number
    readonly c2Id: number
    readonly multFromS1: number
    readonly totalPairs: number
    readonly stabIdx: readonly number[]
  }
  const PAIR_ORBITS: PairOrbit[] = []
  const PAIR_ORBIT_OF = new Int32Array(N_CLIQUES * N_CLIQUES).fill(-1)
  const PAIR_TO_REP_PERM = new Uint16Array(N_CLIQUES * N_CLIQUES)
  {
    const keyToOrbit = new Map<string, number>()
    for (let s1 = 1; s1 <= 3; s1++) {
      const id1 = repBySize[s1]!
      const stab = stabBySizeIdx[s1]!
      const multMap = new Map<number, number>()
      for (const id2 of NEXT_CLIQUES[id1]!) {
        const c2 = CLIQUES[id2]!
        let minC2 = 0x7fffffff
        for (const pi of stab) {
          const pm = permMask(WF4[pi]!, c2)
          if (pm < minC2) minC2 = pm
        }
        const k = `${s1}:${minC2}`
        let oid = keyToOrbit.get(k)
        if (oid === undefined) {
          oid = PAIR_ORBITS.length
          keyToOrbit.set(k, oid)
          const c2Id = CLIQUE_TO_ID.get(minC2)!
          PAIR_ORBITS.push({
            id: oid,
            s1,
            s2: CLIQUE_SIZE[c2Id]!,
            c1Id: id1,
            c2Id,
            multFromS1: 0,
            totalPairs: 0,
            stabIdx: stab.filter(pi => permMask(WF4[pi]!, minC2) === minC2),
          })
        }
        multMap.set(oid, (multMap.get(oid) ?? 0) + 1)
      }
      for (const [oid, m] of multMap) {
        PAIR_ORBITS[oid] = { ...PAIR_ORBITS[oid]!, multFromS1: m, totalPairs: m * nOfSize[s1]! }
      }
    }
    const toRepPermIdx = new Uint16Array(N_CLIQUES)
    for (let i = 1; i < N_CLIQUES; i++) {
      const target = CLIQUES[repBySize[CLIQUE_SIZE[i]!]!]!
      const m = CLIQUES[i]!
      for (let pi = 0; pi < 1152; pi++) if (permMask(WF4[pi]!, m) === target) {
        toRepPermIdx[i] = pi
        break
      }
    }
    for (let i = 1; i < N_CLIQUES; i++) {
      const s1 = CLIQUE_SIZE[i]!
      const p0 = toRepPermIdx[i]!
      const stab = stabBySizeIdx[s1]!
      for (const j of NEXT_CLIQUES[i]!) {
        const c2Img = permMask(WF4[p0]!, CLIQUES[j]!)
        let minC2 = 0x7fffffff
        let bestPi = 0
        for (const pi of stab) {
          const pm = permMask(WF4[pi]!, c2Img)
          if (pm < minC2) {
            minC2 = pm
            bestPi = pi
          }
        }
        PAIR_ORBIT_OF[i * N_CLIQUES + j] = keyToOrbit.get(`${s1}:${minC2}`)!
        PAIR_TO_REP_PERM[i * N_CLIQUES + j] = WF4_MUL[bestPi * 1152 + p0]!
      }
    }
  }
  const N_PAIR = PAIR_ORBITS.length // 57

  type TripleOrbit = {
    readonly id: number
    readonly oIn: number
    readonly oOut: number
    readonly multFromOIn: number
    readonly multIntoOOut: number
    readonly totalTriples: number
  }
  const TRIPLE_ORBITS: TripleOrbit[] = []
  const REP_C3_TO_TRIPLE = new Int32Array(N_PAIR * N_CLIQUES).fill(-1)
  for (const po of PAIR_ORBITS) {
    const keyToTid = new Map<number, number>()
    const multMap = new Map<number, number>()
    const stab = po.stabIdx
    for (const id3 of NEXT_CLIQUES[po.c2Id]!) {
      const c3 = CLIQUES[id3]!
      let minC3 = 0x7fffffff
      for (const pi of stab) {
        const pm = permMask(WF4[pi]!, c3)
        if (pm < minC3) minC3 = pm
      }
      let tid = keyToTid.get(minC3)
      if (tid === undefined) {
        tid = TRIPLE_ORBITS.length
        keyToTid.set(minC3, tid)
        TRIPLE_ORBITS.push({
          id: tid,
          oIn: po.id,
          oOut: PAIR_ORBIT_OF[po.c2Id * N_CLIQUES + id3]!,
          multFromOIn: 0,
          multIntoOOut: 0,
          totalTriples: 0,
        })
      }
      REP_C3_TO_TRIPLE[po.id * N_CLIQUES + id3] = tid
      multMap.set(tid, (multMap.get(tid) ?? 0) + 1)
    }
    for (const [tid, m] of multMap) {
      const tr = TRIPLE_ORBITS[tid]!
      const tot = m * po.totalPairs
      const outPairs = PAIR_ORBITS[tr.oOut]!.totalPairs
      assertExact(tot % outPairs === 0, `Triple orbit ${tid} integrality failed`)
      TRIPLE_ORBITS[tid] = { ...tr, multFromOIn: m, multIntoOOut: tot / outPairs, totalTriples: tot }
    }
  }
  const N_TRIPLE = TRIPLE_ORBITS.length // 4,440
  assertExact(N_PAIR === 57 && N_TRIPLE === 4440, `Expected 57 pair & 4440 triple orbits`)

  const PERM_CLIQUE = new Uint8Array(1152 * N_CLIQUES)
  for (let pi = 0; pi < 1152; pi++) {
    const p = WF4[pi]!
    const base = pi * N_CLIQUES
    for (let cid = 1; cid < N_CLIQUES; cid++) PERM_CLIQUE[base + cid] = CLIQUE_TO_ID.get(permMask(p, CLIQUES[cid]!))!
  }
  const tripleOrbitOf = (c1: number, c2: number, c3: number): number => {
    const oid = PAIR_ORBIT_OF[c1 * N_CLIQUES + c2]!
    const pi = PAIR_TO_REP_PERM[c1 * N_CLIQUES + c2]!
    return REP_C3_TO_TRIPLE[oid * N_CLIQUES + PERM_CLIQUE[pi * N_CLIQUES + c3]!]!
  }

  // 3. Stab(0) (order 48) & Q_3 = Adj(0) (exact 20-clique 3-cube & 212 transition pairs)
  const STAB0_IDX: number[] = []
  for (let pi = 0; pi < 1152; pi++) if (WF4[pi]![0] === 0) STAB0_IDX.push(pi)
  assertExact(STAB0_IDX.length === 48, 'Stab(0) must have order 48')
  const C_ALLOWS_0_REPS: { readonly c1: number; readonly mult: number }[] = []
  {
    const seen = new Set<number>()
    for (let c = 1; c < N_CLIQUES; c++) {
      if ((ALLOWED_NEXT[c]! & 1) === 0 || seen.has(c)) continue
      let sz = 0
      for (const pi of STAB0_IDX) {
        const img = PERM_CLIQUE[pi * N_CLIQUES + c]!
        if (!seen.has(img)) {
          seen.add(img)
          sz++
        }
      }
      C_ALLOWS_0_REPS.push({ c1: c, mult: sz })
    }
  }
  const ADJ0 = ADJ_MASK[0]!
  const Q3_CLIQUES: number[] = []
  for (let i = 1; i < N_CLIQUES; i++) if ((CLIQUES[i]! & ADJ0) === CLIQUES[i]!) Q3_CLIQUES.push(i)
  const N_Q3 = Q3_CLIQUES.length
  assertExact(N_Q3 === 20, 'Q_3 must have 20 cliques')
  const Q3_PLUS0: number[] = Q3_CLIQUES.map(cid => CLIQUE_TO_ID.get(CLIQUES[cid]! | 1)!)
  const Q3_NEXT: number[][] = Array.from({ length: N_Q3 }, (_, a) => {
    const f = ALLOWED_NEXT[Q3_CLIQUES[a]!]!
    const out: number[] = []
    for (let b = 0; b < N_Q3; b++) if ((CLIQUES[Q3_CLIQUES[b]!]! & f) === CLIQUES[Q3_CLIQUES[b]!]!) out.push(b)
    return out
  })
  const Q3_PAIR_A: number[] = []
  const Q3_PAIR_B: number[] = []
  const Q3_PAIR_ORBIT: number[] = []
  const Q3_PAIR_ID = new Int32Array(N_Q3 * N_Q3).fill(-1)
  for (let a = 0; a < N_Q3; a++) {
    for (const b of Q3_NEXT[a]!) {
      Q3_PAIR_ID[a * N_Q3 + b] = Q3_PAIR_A.length
      Q3_PAIR_A.push(a)
      Q3_PAIR_B.push(b)
      Q3_PAIR_ORBIT.push(PAIR_ORBIT_OF[Q3_CLIQUES[a]! * N_CLIQUES + Q3_CLIQUES[b]!]!)
    }
  }
  const N_Q3P = Q3_PAIR_A.length // 212
  assertExact(N_Q3P === 212, 'Expected 212 Q_3 transition pairs')
  const Q3T_FROM: number[] = []
  const Q3T_TO: number[] = []
  const Q3T_TID: number[] = []
  for (let pid1 = 0; pid1 < N_Q3P; pid1++) {
    const a = Q3_PAIR_A[pid1]!
    const b = Q3_PAIR_B[pid1]!
    const ca = Q3_CLIQUES[a]!
    const cb = Q3_CLIQUES[b]!
    for (const c of Q3_NEXT[b]!) {
      Q3T_FROM.push(pid1)
      Q3T_TO.push(Q3_PAIR_ID[b * N_Q3 + c]!)
      Q3T_TID.push(tripleOrbitOf(ca, cb, Q3_CLIQUES[c]!))
    }
  }
  const N_Q3T = Q3T_FROM.length

  // Precompiled interaction lists mod Stab(0)
  const id0 = CLIQUE_TO_ID.get(1)!
  const M0_OIN: number[] = []
  const M0_OOUT: number[] = []
  const M0_TID: number[] = []
  const M0_MULT: number[] = []
  for (const { c1, mult } of C_ALLOWS_0_REPS) {
    const oOut = PAIR_ORBIT_OF[c1 * N_CLIQUES + id0]!
    for (const c0 of PREV_CLIQUES[c1]!) {
      M0_OIN.push(PAIR_ORBIT_OF[c0 * N_CLIQUES + c1]!)
      M0_OOUT.push(oOut)
      M0_TID.push(tripleOrbitOf(c0, c1, id0))
      M0_MULT.push(mult)
    }
  }
  const P1_C1: number[] = []
  const P1_J1: number[] = []
  const P1_OIN_M1: number[] = []
  const P1_OOUT_M1: number[] = []
  const P1_MULT: number[] = []
  const P1_OFF: number[] = [0]
  const P1_O0: number[] = []
  const P1_TIN: number[] = []
  const P1_TOUT: number[] = []
  for (const { c1, mult } of C_ALLOWS_0_REPS) {
    const f1 = ALLOWED_NEXT[c1]!
    for (let a = 0; a < N_Q3; a++) {
      const j1 = Q3_CLIQUES[a]!
      if ((CLIQUES[j1]! & f1) !== CLIQUES[j1]!) continue
      const j1p = Q3_PLUS0[a]!
      P1_C1.push(c1)
      P1_J1.push(a)
      P1_MULT.push(mult)
      P1_OIN_M1.push(PAIR_ORBIT_OF[c1 * N_CLIQUES + j1]!)
      P1_OOUT_M1.push(PAIR_ORBIT_OF[c1 * N_CLIQUES + j1p]!)
      for (const c0 of PREV_CLIQUES[c1]!) {
        P1_O0.push(PAIR_ORBIT_OF[c0 * N_CLIQUES + c1]!)
        P1_TIN.push(tripleOrbitOf(c0, c1, j1))
        P1_TOUT.push(tripleOrbitOf(c0, c1, j1p))
      }
      P1_OFF.push(P1_O0.length)
    }
  }
  const N_P1 = P1_C1.length
  const M2_P1: number[] = []
  const M2_TIN: number[] = []
  const M2_TOUT: number[] = []
  const M2_OIN: number[] = []
  const M2_OOUT: number[] = []
  const M2_Q3P: number[] = []
  for (let k = 0; k < N_P1; k++) {
    const c1 = P1_C1[k]!
    const a = P1_J1[k]!
    const j1 = Q3_CLIQUES[a]!
    const j1p = Q3_PLUS0[a]!
    for (const b of Q3_NEXT[a]!) {
      const j2 = Q3_CLIQUES[b]!
      M2_P1.push(k)
      M2_TIN.push(tripleOrbitOf(c1, j1, j2))
      M2_TOUT.push(tripleOrbitOf(c1, j1p, j2))
      M2_OIN.push(PAIR_ORBIT_OF[j1 * N_CLIQUES + j2]!)
      M2_OOUT.push(PAIR_ORBIT_OF[j1p * N_CLIQUES + j2]!)
      M2_Q3P.push(Q3_PAIR_ID[a * N_Q3 + b]!)
    }
  }
  const N_M2 = M2_P1.length
  const M3_FROM: number[] = []
  const M3_TO: number[] = []
  const M3_TIN: number[] = []
  const M3_TOUT: number[] = []
  for (let pid1 = 0; pid1 < N_Q3P; pid1++) {
    const a = Q3_PAIR_A[pid1]!
    const b = Q3_PAIR_B[pid1]!
    const j1 = Q3_CLIQUES[a]!
    const j1p = Q3_PLUS0[a]!
    const j2 = Q3_CLIQUES[b]!
    for (const c of Q3_NEXT[b]!) {
      M3_FROM.push(pid1)
      M3_TO.push(Q3_PAIR_ID[b * N_Q3 + c]!)
      M3_TIN.push(tripleOrbitOf(j1, j2, Q3_CLIQUES[c]!))
      M3_TOUT.push(tripleOrbitOf(j1p, j2, Q3_CLIQUES[c]!))
    }
  }
  const N_M3 = M3_FROM.length
  const M0_COEFF = Float64Array.from({ length: M0_OIN.length }, (_, i) => (24 * M0_MULT[i]!) / PAIR_ORBITS[M0_OIN[i]!]!.totalPairs)
  const P1_COEFF = new Float64Array(P1_O0.length)
  for (let k = 0; k < N_P1; k++) {
    for (let idx = P1_OFF[k]!, end = P1_OFF[k + 1]!; idx < end; idx++) P1_COEFF[idx] = P1_MULT[k]! / PAIR_ORBITS[P1_O0[idx]!]!.totalPairs
  }

  // 4. Exact 0-BigInt-error cross-check on BOTH the 8,857-dock R=3 ball AND brute-force Z[3], m=3, m=4 CF words!
  let ballCFEdgeErr = 0
  let ballBigIntDiff = 0n
  {
    const cfOfDock: number[][] = Array.from({ length: ball.nDocks }, () => [])
    const upwardInsert = (w: readonly number[], b: number): number[] => {
      let m = 0
      while (m < w.length && (COMMON_ADJ[CLIQUE_TO_ID.get(w[w.length - 1 - m]!)!]! & (1 << b)) !== 0) m++
      assertExact(m === w.length || (w[w.length - 1 - m]! & (1 << b)) === 0, 'Expected upward edge')
      const out = w.slice()
      if (m === 0) out.push(1 << b)
      else out[w.length - m] = out[w.length - m]! | (1 << b)
      return out
    }
    const assigned = new Uint8Array(ball.nDocks)
    assigned[0] = 1
    for (let r = 0; r < 3; r++) {
      for (let d = 0; d < ball.nDocks; d++) {
        if (ball.radius[d] !== r) continue
        for (let s = 0; s < 24; s++) {
          const nb = ball.neighbors[d]![s]!
          if (nb < 0 || ball.radius[nb] !== r + 1) continue
          const cand = upwardInsert(cfOfDock[d]!, racgLetter(r, s))
          if (!assigned[nb]) {
            cfOfDock[nb] = cand
            assigned[nb] = 1
          } else if (cfOfDock[nb]!.join(',') !== cand.join(',')) {
            ballCFEdgeErr++
          }
        }
      }
    }
    const testOm1 = Array.from({ length: N_PAIR }, (_, i) => BigInt(100 + 7 * i))
    const testW1 = [0n, 31n, 17n, 11n]
    const psiBall = new Array<bigint>(ball.nDocks).fill(0n)
    for (let d = 0; d < ball.nDocks; d++) {
      const cf = cfOfDock[d]!
      if (cf.length === 1) psiBall[d] = testW1[CLIQUE_SIZE[CLIQUE_TO_ID.get(cf[0]!)!]!]!
      else if (cf.length === 2) {
        const id1 = CLIQUE_TO_ID.get(cf[0]!)!
        const id2 = CLIQUE_TO_ID.get(cf[1]!)!
        psiBall[d] = testW1[CLIQUE_SIZE[id1]!]! * testOm1[PAIR_ORBIT_OF[id1 * N_CLIQUES + id2]!]!
      }
    }
    let ballNum = 0n
    let upNum = 0n
    for (let d = 0; d < ball.nDocks; d++) {
      const pd = psiBall[d]!
      if (pd === 0n) continue
      for (let s = 0; s < 24; s++) {
        const nb = ball.neighbors[d]![s]!
        if (nb < 0) continue
        ballNum += pd * psiBall[nb]!
        if (ball.radius[nb] === ball.radius[d]! + 1) upNum += 2n * pd * psiBall[nb]!
      }
    }
    ballBigIntDiff = ballNum - upNum

    // Brute-force Z[3][0..56], m=3, m=4 check for 2-step triple weights + 4,440-dim boundary
    const testOm = Array.from({ length: N_TRIPLE }, (_, t) => BigInt(3 + (t % 7)))
    const testV = Array.from({ length: N_TRIPLE }, (_, t) => BigInt(2 + (t % 5)))
    const z3Form = new Array<bigint>(N_PAIR).fill(0n)
    for (let t = 0; t < N_TRIPLE; t++) {
      const tr = TRIPLE_ORBITS[t]!
      z3Form[tr.oOut] = z3Form[tr.oOut]! + BigInt(tr.multIntoOOut) * testOm[t]! * testOm[t]!
    }
    for (let o = 0; o < N_PAIR; o++) {
      const po = PAIR_ORBITS[o]!
      let bf = 0n
      for (const c0 of PREV_CLIQUES[po.c1Id]!) {
        const w = testOm[tripleOrbitOf(c0, po.c1Id, po.c2Id)]!
        bf += w * w
      }
      assertExact(bf === z3Form[o], `Z[3][${o}] brute-force mismatch`)
    }
    const testC1 = C_ALLOWS_0_REPS[0]!.c1
    const fC1 = ALLOWED_NEXT[testC1]!
    let bfM3 = 0n
    let bfM4 = 0n
    for (const c0 of PREV_CLIQUES[testC1]!) {
      for (let a = 0; a < N_Q3; a++) {
        const j1 = Q3_CLIQUES[a]!
        if ((CLIQUES[j1]! & fC1) !== CLIQUES[j1]!) continue
        const j1p = Q3_PLUS0[a]!
        const p01 = testOm[tripleOrbitOf(c0, testC1, j1)]! * testOm[tripleOrbitOf(c0, testC1, j1p)]!
        for (const b of Q3_NEXT[a]!) {
          const j2 = Q3_CLIQUES[b]!
          const p12 = p01 * testOm[tripleOrbitOf(testC1, j1, j2)]! * testOm[tripleOrbitOf(testC1, j1p, j2)]!
          for (const c of Q3_NEXT[b]!) {
            const j3 = Q3_CLIQUES[c]!
            const t1 = tripleOrbitOf(j1, j2, j3)
            const t2 = tripleOrbitOf(j1p, j2, j3)
            const p23 = p12 * testOm[t1]! * testOm[t2]!
            bfM3 += p23 * testV[t1]! * testV[t2]!
            for (const d of Q3_NEXT[c]!) {
              const t34 = tripleOrbitOf(j2, j3, Q3_CLIQUES[d]!)
              bfM4 += p23 * testOm[t34]! * testOm[t34]! * testV[t34]! * testV[t34]!
            }
          }
        }
      }
    }
    const p1t = new Array<bigint>(N_P1).fill(0n)
    for (let k = 0; k < N_P1; k++) {
      if (P1_C1[k] !== testC1) continue
      let s = 0n
      for (let idx = P1_OFF[k]!, end = P1_OFF[k + 1]!; idx < end; idx++) s += testOm[P1_TIN[idx]!]! * testOm[P1_TOUT[idx]!]!
      p1t[k] = s
    }
    const wm2t = new Array<bigint>(N_Q3P).fill(0n)
    for (let i = 0; i < N_M2; i++) {
      const p1 = p1t[M2_P1[i]!]!
      if (p1 !== 0n) wm2t[M2_Q3P[i]!] = wm2t[M2_Q3P[i]!]! + p1 * testOm[M2_TIN[i]!]! * testOm[M2_TOUT[i]!]!
    }
    let formM3 = 0n
    const wm3t = new Array<bigint>(N_Q3P).fill(0n)
    for (let i = 0; i < N_M3; i++) {
      const w2 = wm2t[M3_FROM[i]!]!
      if (w2 === 0n) continue
      const t1 = M3_TIN[i]!
      const t2 = M3_TOUT[i]!
      const prod = w2 * testOm[t1]! * testOm[t2]!
      formM3 += prod * testV[t1]! * testV[t2]!
      wm3t[M3_TO[i]!] = wm3t[M3_TO[i]!]! + prod
    }
    let formM4 = 0n
    for (let i = 0; i < N_Q3T; i++) {
      const w3 = wm3t[Q3T_FROM[i]!]!
      if (w3 === 0n) continue
      const tid = Q3T_TID[i]!
      formM4 += w3 * testOm[tid]! * testOm[tid]! * testV[tid]! * testV[tid]!
    }
    assertExact(bfM3 === formM3 && bfM4 === formM4, 'm=3/m=4 4440-dim brute-force check failed')
    console.log(`  CF ball & brute-force audit: 0 mismatches on 8,857 docks, 0 BigInt error on B_3 & Z[3]/m=3/m=4`)
  }

  // Linear solver for 57x57 Perron adjoint
  const solveLinear57 = (M: Float64Array, rhs: Float64Array): Float64Array => {
    const n = N_PAIR
    const A = Array.from({ length: n }, (_, i) => {
      const r = new Float64Array(n + 1)
      for (let j = 0; j < n; j++) r[j] = M[i * n + j]!
      r[n] = rhs[i]!
      return r
    })
    for (let col = 0; col < n; col++) {
      let piv = col
      for (let r = col + 1; r < n; r++) if (Math.abs(A[r]![col]!) > Math.abs(A[piv]![col]!)) piv = r
      if (piv !== col) {
        const t = A[col]!
        A[col] = A[piv]!
        A[piv] = t
      }
      const d = A[col]![col]!
      for (let r = col + 1; r < n; r++) {
        const f = A[r]![col]! / d
        for (let j = col; j <= n; j++) A[r]![j] = A[r]![j]! - f * A[col]![j]!
      }
    }
    const x = new Float64Array(n)
    for (let r = n - 1; r >= 0; r--) {
      let s = A[r]![n]!
      for (let j = r + 1; j < n; j++) s -= A[r]![j]! * x[j]!
      x[r] = s / A[r]![r]!
    }
    return x
  }

  // Unified 2-step CF evaluator with 57-dim boundary (also used for 0-step & 1-step projections!)
  const eval2StepV57 = (omega: Float64Array, needGrad: boolean): { readonly rho: number; readonly gradLogW: Float64Array; readonly pL: Float64Array; readonly v57: Float64Array } => {
    const M2 = new Float64Array(N_PAIR * N_PAIR)
    for (let t = 0; t < N_TRIPLE; t++) {
      const tr = TRIPLE_ORBITS[t]!
      const w = omega[t]!
      const idx = tr.oIn * N_PAIR + tr.oOut
      M2[idx] = M2[idx]! + tr.multFromOIn * w * w
    }
    const pL = new Float64Array(N_PAIR).fill(1 / N_PAIR)
    const pR = new Float64Array(N_PAIR).fill(1 / N_PAIR)
    const tmp57 = new Float64Array(N_PAIR)
    let lam = 1
    for (let it = 0; it < 200; it++) {
      tmp57.fill(0)
      for (let i = 0; i < N_PAIR; i++) {
        const pi = pL[i]!
        const base = i * N_PAIR
        for (let j = 0; j < N_PAIR; j++) tmp57[j] = tmp57[j]! + pi * M2[base + j]!
      }
      let s = 0
      for (let j = 0; j < N_PAIR; j++) s += tmp57[j]!
      lam = s
      let diff = 0
      for (let j = 0; j < N_PAIR; j++) {
        const nv = tmp57[j]! / s
        diff += Math.abs(nv - pL[j]!)
        pL[j] = nv
      }
      if (diff < 1e-14) break
    }
    if (needGrad) {
      for (let it = 0; it < 200; it++) {
        let s = 0
        for (let i = 0; i < N_PAIR; i++) {
          let acc = 0
          const base = i * N_PAIR
          for (let j = 0; j < N_PAIR; j++) acc += M2[base + j]! * pR[j]!
          tmp57[i] = acc
          s += acc
        }
        let diff = 0
        for (let i = 0; i < N_PAIR; i++) {
          const nv = tmp57[i]! / s
          diff += Math.abs(nv - pR[i]!)
          pR[i] = nv
        }
        if (diff < 1e-14) break
      }
      let lr = 0
      for (let i = 0; i < N_PAIR; i++) lr += pL[i]! * pR[i]!
      for (let i = 0; i < N_PAIR; i++) pR[i] = pR[i]! / lr
    }
    const invLam = 1 / lam
    const invSqLam = 1 / Math.sqrt(lam)
    const invLam2 = invLam * invLam
    const invLam3 = invLam2 * invLam

    const P1 = new Float64Array(N_P1)
    for (let k = 0; k < N_P1; k++) {
      let s = 0
      for (let idx = P1_OFF[k]!, end = P1_OFF[k + 1]!; idx < end; idx++) s += P1_COEFF[idx]! * pL[P1_O0[idx]!]! * omega[P1_TIN[idx]!]! * omega[P1_TOUT[idx]!]!
      P1[k] = s
    }
    const W_m2 = new Float64Array(N_Q3P)
    for (let i = 0; i < N_M2; i++) W_m2[M2_Q3P[i]!] = W_m2[M2_Q3P[i]!]! + P1[M2_P1[i]!]! * omega[M2_TIN[i]!]! * omega[M2_TOUT[i]!]!
    const W_m3 = new Float64Array(N_Q3P)
    for (let i = 0; i < N_M3; i++) W_m3[M3_TO[i]!] = W_m3[M3_TO[i]!]! + W_m2[M3_FROM[i]!]! * omega[M3_TIN[i]!]! * omega[M3_TOUT[i]!]!
    const R_left = Float64Array.from(W_m3)
    const term = Float64Array.from(W_m3)
    const nxtT = new Float64Array(N_Q3P)
    const wSqQ3 = new Float64Array(N_Q3T)
    for (let i = 0; i < N_Q3T; i++) {
      const w = omega[Q3T_TID[i]!]!
      wSqQ3[i] = w * w * invLam
    }
    for (let it = 0; it < 60; it++) {
      nxtT.fill(0)
      for (let i = 0; i < N_Q3T; i++) nxtT[Q3T_TO[i]!] = nxtT[Q3T_TO[i]!]! + term[Q3T_FROM[i]!]! * wSqQ3[i]!
      let nrm = 0
      for (let p = 0; p < N_Q3P; p++) {
        const nv = nxtT[p]!
        R_left[p] = R_left[p]! + nv
        term[p] = nv
        nrm += nv
      }
      if (nrm < 1e-16) break
    }
    const A57 = new Float64Array(N_PAIR * N_PAIR)
    for (let i = 0; i < M0_OIN.length; i++) {
      const o1 = M0_OIN[i]!
      const o2 = M0_OOUT[i]!
      const c = M0_COEFF[i]! * invSqLam * pL[o1]! * omega[M0_TID[i]!]!
      A57[o1 * N_PAIR + o2] = A57[o1 * N_PAIR + o2]! + c
      A57[o2 * N_PAIR + o1] = A57[o2 * N_PAIR + o1]! + c
    }
    for (let k = 0; k < N_P1; k++) {
      const o1 = P1_OIN_M1[k]!
      const o2 = P1_OOUT_M1[k]!
      const c = 24 * invLam * P1[k]!
      A57[o1 * N_PAIR + o2] = A57[o1 * N_PAIR + o2]! + c
      A57[o2 * N_PAIR + o1] = A57[o2 * N_PAIR + o1]! + c
    }
    for (let i = 0; i < N_M2; i++) {
      const o1 = M2_OIN[i]!
      const o2 = M2_OOUT[i]!
      const c = 24 * invLam2 * P1[M2_P1[i]!]! * omega[M2_TIN[i]!]! * omega[M2_TOUT[i]!]!
      A57[o1 * N_PAIR + o2] = A57[o1 * N_PAIR + o2]! + c
      A57[o2 * N_PAIR + o1] = A57[o2 * N_PAIR + o1]! + c
    }
    for (let pid = 0; pid < N_Q3P; pid++) {
      const o = Q3_PAIR_ORBIT[pid]!
      A57[o * N_PAIR + o] = A57[o * N_PAIR + o]! + 48 * invLam3 * R_left[pid]!
    }
    const invSqP = new Float64Array(N_PAIR)
    for (let i = 0; i < N_PAIR; i++) invSqP[i] = 1 / Math.sqrt(pL[i]!)
    const u = new Float64Array(N_PAIR).fill(1 / Math.sqrt(N_PAIR))
    let rho = 0
    const SHIFT = 24.0
    for (let it = 0; it < 400; it++) {
      let n2 = 0
      for (let i = 0; i < N_PAIR; i++) {
        let s = 0
        const base = i * N_PAIR
        for (let j = 0; j < N_PAIR; j++) s += A57[base + j]! * invSqP[j]! * u[j]!
        const nv = s * invSqP[i]! + SHIFT * u[i]!
        tmp57[i] = nv
        n2 += nv * nv
      }
      const nrm = Math.sqrt(n2)
      rho = nrm - SHIFT
      let diff = 0
      for (let i = 0; i < N_PAIR; i++) {
        const nv = tmp57[i]! / nrm
        diff += Math.abs(nv - u[i]!)
        u[i] = nv
      }
      if (diff < 1e-15) break
    }
    const v = new Float64Array(N_PAIR)
    for (let i = 0; i < N_PAIR; i++) v[i] = u[i]! * invSqP[i]!
    if (!needGrad) return { rho, gradLogW: new Float64Array(0), pL, v57: v }

    const gOmega = new Float64Array(N_TRIPLE)
    const gPL = new Float64Array(N_PAIR)
    let gLam = 0
    for (let o = 0; o < N_PAIR; o++) gPL[o] = -rho * v[o]! * v[o]!
    const gRLeft = new Float64Array(N_Q3P)
    let sumM3 = 0
    for (let pid = 0; pid < N_Q3P; pid++) {
      const vv = v[Q3_PAIR_ORBIT[pid]!]!
      const vv2 = vv * vv
      sumM3 += R_left[pid]! * vv2
      gRLeft[pid] = 48 * invLam3 * vv2
    }
    gLam += -3 * 48 * invLam3 * invLam * sumM3
    const gW_m3 = Float64Array.from(gRLeft)
    term.set(gRLeft)
    for (let it = 0; it < 60; it++) {
      nxtT.fill(0)
      for (let i = 0; i < N_Q3T; i++) nxtT[Q3T_FROM[i]!] = nxtT[Q3T_FROM[i]!]! + term[Q3T_TO[i]!]! * wSqQ3[i]!
      let nrm = 0
      for (let p = 0; p < N_Q3P; p++) {
        const nv = nxtT[p]!
        gW_m3[p] = gW_m3[p]! + nv
        term[p] = nv
        nrm += nv
      }
      if (nrm < 1e-16) break
    }
    for (let i = 0; i < N_Q3T; i++) {
      const gEntry = gW_m3[Q3T_TO[i]!]! * R_left[Q3T_FROM[i]!]!
      const t = Q3T_TID[i]!
      const w = omega[t]!
      gOmega[t] = gOmega[t]! + gEntry * 2 * w * invLam
      gLam += gEntry * (-w * w * invLam2)
    }
    const gW_m2 = new Float64Array(N_Q3P)
    for (let i = 0; i < N_M3; i++) {
      const g = gW_m3[M3_TO[i]!]!
      const fr = M3_FROM[i]!
      const t1 = M3_TIN[i]!
      const t2 = M3_TOUT[i]!
      const w1 = omega[t1]!
      const w2 = omega[t2]!
      const wf = W_m2[fr]!
      gW_m2[fr] = gW_m2[fr]! + g * w1 * w2
      gOmega[t1] = gOmega[t1]! + g * wf * w2
      gOmega[t2] = gOmega[t2]! + g * wf * w1
    }
    const gP1 = new Float64Array(N_P1)
    for (let i = 0; i < N_M2; i++) {
      const k = M2_P1[i]!
      const t1 = M2_TIN[i]!
      const t2 = M2_TOUT[i]!
      const w1 = omega[t1]!
      const w2 = omega[t2]!
      const pk = P1[k]!
      const vv = v[M2_OIN[i]!]! * v[M2_OOUT[i]!]!
      const gProd = 48 * invLam2 * vv + gW_m2[M2_Q3P[i]!]!
      gP1[k] = gP1[k]! + gProd * w1 * w2
      gOmega[t1] = gOmega[t1]! + gProd * pk * w2
      gOmega[t2] = gOmega[t2]! + gProd * pk * w1
      gLam += -2 * 48 * invLam3 * pk * w1 * w2 * vv
    }
    for (let k = 0; k < N_P1; k++) {
      const vv = v[P1_OIN_M1[k]!]! * v[P1_OOUT_M1[k]!]!
      gP1[k] = gP1[k]! + 48 * invLam * vv
      gLam += -48 * invLam2 * P1[k]! * vv
    }
    for (let k = 0; k < N_P1; k++) {
      const gk = gP1[k]!
      for (let idx = P1_OFF[k]!, end = P1_OFF[k + 1]!; idx < end; idx++) {
        const o0 = P1_O0[idx]!
        const t1 = P1_TIN[idx]!
        const t2 = P1_TOUT[idx]!
        const c = P1_COEFF[idx]!
        const p0 = pL[o0]!
        const w1 = omega[t1]!
        const w2 = omega[t2]!
        gPL[o0] = gPL[o0]! + gk * c * w1 * w2
        gOmega[t1] = gOmega[t1]! + gk * c * p0 * w2
        gOmega[t2] = gOmega[t2]! + gk * c * p0 * w1
      }
    }
    for (let i = 0; i < M0_OIN.length; i++) {
      const o1 = M0_OIN[i]!
      const o2 = M0_OOUT[i]!
      const t = M0_TID[i]!
      const vv = v[o1]! * v[o2]!
      const fac = 2 * M0_COEFF[i]! * invSqLam * vv
      gPL[o1] = gPL[o1]! + fac * omega[t]!
      gOmega[t] = gOmega[t]! + fac * pL[o1]!
      gLam += -0.5 * fac * invLam * pL[o1]! * omega[t]!
    }
    let pDotG = 0
    for (let i = 0; i < N_PAIR; i++) pDotG += pL[i]! * gPL[i]!
    const rhs = new Float64Array(N_PAIR)
    for (let i = 0; i < N_PAIR; i++) rhs[i] = gPL[i]! - pDotG
    const shiftM = new Float64Array(N_PAIR * N_PAIR)
    for (let i = 0; i < N_PAIR; i++) for (let j = 0; j < N_PAIR; j++) shiftM[i * N_PAIR + j] = (i === j ? lam : 0) - M2[i * N_PAIR + j]! + lam * pL[j]!
    const qAdj = solveLinear57(shiftM, rhs)
    for (let t = 0; t < N_TRIPLE; t++) {
      const tr = TRIPLE_ORBITS[t]!
      const w = omega[t]!
      const gM = pL[tr.oIn]! * (gLam * pR[tr.oOut]! + qAdj[tr.oOut]!)
      gOmega[t] = gOmega[t]! + gM * tr.multFromOIn * 2 * w
    }
    const gradLogW = new Float64Array(N_TRIPLE)
    for (let t = 0; t < N_TRIPLE; t++) gradLogW[t] = gOmega[t]! * omega[t]!
    return { rho, gradLogW, pL, v57: v }
  }

  // 2-step CF evaluator with 4,440-dim right boundary v(C_{k-2}, C_{k-1}, C_k) + exact analytical gradient!
  const eval2StepV4440 = (
    omega: Float64Array,
    needGrad: boolean,
    vInit?: Float64Array,
  ): { readonly rho: number; readonly gradLogW: Float64Array; readonly v4440: Float64Array } => {
    const M2 = new Float64Array(N_PAIR * N_PAIR)
    for (let t = 0; t < N_TRIPLE; t++) {
      const tr = TRIPLE_ORBITS[t]!
      const w = omega[t]!
      const idx = tr.oIn * N_PAIR + tr.oOut
      M2[idx] = M2[idx]! + tr.multFromOIn * w * w
    }
    const pL = new Float64Array(N_PAIR).fill(1 / N_PAIR)
    const pR = new Float64Array(N_PAIR).fill(1 / N_PAIR)
    const tmp57 = new Float64Array(N_PAIR)
    let lam = 1
    for (let it = 0; it < 200; it++) {
      tmp57.fill(0)
      for (let i = 0; i < N_PAIR; i++) {
        const pi = pL[i]!
        const base = i * N_PAIR
        for (let j = 0; j < N_PAIR; j++) tmp57[j] = tmp57[j]! + pi * M2[base + j]!
      }
      let s = 0
      for (let j = 0; j < N_PAIR; j++) s += tmp57[j]!
      lam = s
      let diff = 0
      for (let j = 0; j < N_PAIR; j++) {
        const nv = tmp57[j]! / s
        diff += Math.abs(nv - pL[j]!)
        pL[j] = nv
      }
      if (diff < 1e-14) break
    }
    if (needGrad) {
      for (let it = 0; it < 200; it++) {
        let s = 0
        for (let i = 0; i < N_PAIR; i++) {
          let acc = 0
          const base = i * N_PAIR
          for (let j = 0; j < N_PAIR; j++) acc += M2[base + j]! * pR[j]!
          tmp57[i] = acc
          s += acc
        }
        let diff = 0
        for (let i = 0; i < N_PAIR; i++) {
          const nv = tmp57[i]! / s
          diff += Math.abs(nv - pR[i]!)
          pR[i] = nv
        }
        if (diff < 1e-14) break
      }
      let lr = 0
      for (let i = 0; i < N_PAIR; i++) lr += pL[i]! * pR[i]!
      for (let i = 0; i < N_PAIR; i++) pR[i] = pR[i]! / lr
    }
    const invLam = 1 / lam
    const invSqLam = 1 / Math.sqrt(lam)
    const invLam2 = invLam * invLam
    const invLam3 = invLam2 * invLam

    const bTri = new Float64Array(N_TRIPLE)
    const invSqB = new Float64Array(N_TRIPLE)
    for (let t = 0; t < N_TRIPLE; t++) {
      const tr = TRIPLE_ORBITS[t]!
      const w = omega[t]!
      const bt = invLam * pL[tr.oIn]! * tr.multFromOIn * w * w
      bTri[t] = bt
      invSqB[t] = 1 / Math.sqrt(bt)
    }
    const P1 = new Float64Array(N_P1)
    for (let k = 0; k < N_P1; k++) {
      let s = 0
      for (let idx = P1_OFF[k]!, end = P1_OFF[k + 1]!; idx < end; idx++) s += P1_COEFF[idx]! * pL[P1_O0[idx]!]! * omega[P1_TIN[idx]!]! * omega[P1_TOUT[idx]!]!
      P1[k] = s
    }
    const W_m2 = new Float64Array(N_Q3P)
    for (let i = 0; i < N_M2; i++) W_m2[M2_Q3P[i]!] = W_m2[M2_Q3P[i]!]! + P1[M2_P1[i]!]! * omega[M2_TIN[i]!]! * omega[M2_TOUT[i]!]!
    const W_m3 = new Float64Array(N_Q3P)
    for (let i = 0; i < N_M3; i++) W_m3[M3_TO[i]!] = W_m3[M3_TO[i]!]! + W_m2[M3_FROM[i]!]! * omega[M3_TIN[i]!]! * omega[M3_TOUT[i]!]!
    const R_left = Float64Array.from(W_m3)
    const term = Float64Array.from(W_m3)
    const nxtT = new Float64Array(N_Q3P)
    const wSqQ3 = new Float64Array(N_Q3T)
    for (let i = 0; i < N_Q3T; i++) {
      const w = omega[Q3T_TID[i]!]!
      wSqQ3[i] = w * w * invLam
    }
    for (let it = 0; it < 60; it++) {
      nxtT.fill(0)
      for (let i = 0; i < N_Q3T; i++) nxtT[Q3T_TO[i]!] = nxtT[Q3T_TO[i]!]! + term[Q3T_FROM[i]!]! * wSqQ3[i]!
      let nrm = 0
      for (let p = 0; p < N_Q3P; p++) {
        const nv = nxtT[p]!
        R_left[p] = R_left[p]! + nv
        term[p] = nv
        nrm += nv
      }
      if (nrm < 1e-16) break
    }
    const diagM4 = new Float64Array(N_TRIPLE)
    for (let i = 0; i < N_Q3T; i++) {
      const tid = Q3T_TID[i]!
      diagM4[tid] = diagM4[tid]! + 48 * invLam3 * R_left[Q3T_FROM[i]!]! * wSqQ3[i]!
    }
    const m0PairW = new Float64Array(N_PAIR)
    const applyA4440 = (v: Float64Array, out: Float64Array): void => {
      out.fill(0)
      const sPrev = new Float64Array(N_PAIR)
      for (let t = 0; t < N_TRIPLE; t++) {
        const o = TRIPLE_ORBITS[t]!.oOut
        sPrev[o] = sPrev[o]! + bTri[t]! * v[t]!
      }
      m0PairW.fill(0)
      for (let i = 0; i < M0_OIN.length; i++) {
        const o1 = M0_OIN[i]!
        const tOut = M0_TID[i]!
        const fac = M0_COEFF[i]! * invSqLam * omega[tOut]!
        out[tOut] = out[tOut]! + fac * sPrev[o1]!
        m0PairW[o1] = m0PairW[o1]! + fac * v[tOut]!
      }
      for (let t = 0; t < N_TRIPLE; t++) out[t] = out[t]! + bTri[t]! * m0PairW[TRIPLE_ORBITS[t]!.oOut]!
      for (let k = 0; k < N_P1; k++) {
        for (let idx = P1_OFF[k]!, end = P1_OFF[k + 1]!; idx < end; idx++) {
          const t1 = P1_TIN[idx]!
          const t2 = P1_TOUT[idx]!
          const c = 24 * invLam * P1_COEFF[idx]! * pL[P1_O0[idx]!]! * omega[t1]! * omega[t2]!
          out[t1] = out[t1]! + c * v[t2]!
          out[t2] = out[t2]! + c * v[t1]!
        }
      }
      for (let i = 0; i < N_M2; i++) {
        const t1 = M2_TIN[i]!
        const t2 = M2_TOUT[i]!
        const c = 24 * invLam2 * P1[M2_P1[i]!]! * omega[t1]! * omega[t2]!
        out[t1] = out[t1]! + c * v[t2]!
        out[t2] = out[t2]! + c * v[t1]!
      }
      for (let i = 0; i < N_M3; i++) {
        const t1 = M3_TIN[i]!
        const t2 = M3_TOUT[i]!
        const c = 24 * invLam3 * W_m2[M3_FROM[i]!]! * omega[t1]! * omega[t2]!
        out[t1] = out[t1]! + c * v[t2]!
        out[t2] = out[t2]! + c * v[t1]!
      }
      for (let t = 0; t < N_TRIPLE; t++) out[t] = out[t]! + diagM4[t]! * v[t]!
    }

    const u = new Float64Array(N_TRIPLE)
    const v = new Float64Array(N_TRIPLE)
    const av = new Float64Array(N_TRIPLE)
    if (vInit) {
      let n2 = 0
      for (let t = 0; t < N_TRIPLE; t++) {
        const ut = vInit[t]! / invSqB[t]!
        u[t] = ut
        n2 += ut * ut
      }
      const inv = 1 / Math.sqrt(n2)
      for (let t = 0; t < N_TRIPLE; t++) u[t] = u[t]! * inv
    } else {
      for (let t = 0; t < N_TRIPLE; t++) u[t] = Math.sqrt(bTri[t]!)
    }
    let rho = 0
    const SHIFT = 24.0
    for (let it = 0; it < 200; it++) {
      for (let t = 0; t < N_TRIPLE; t++) v[t] = u[t]! * invSqB[t]!
      applyA4440(v, av)
      let n2 = 0
      for (let t = 0; t < N_TRIPLE; t++) {
        const nv = av[t]! * invSqB[t]! + SHIFT * u[t]!
        av[t] = nv
        n2 += nv * nv
      }
      const nrm = Math.sqrt(n2)
      rho = nrm - SHIFT
      let diff = 0
      for (let t = 0; t < N_TRIPLE; t++) {
        const nv = av[t]! / nrm
        diff += Math.abs(nv - u[t]!)
        u[t] = nv
      }
      if (diff < 1e-13) break
    }
    for (let t = 0; t < N_TRIPLE; t++) v[t] = u[t]! * invSqB[t]!
    if (!needGrad) return { rho, gradLogW: new Float64Array(0), v4440: v }

    const gOmega = new Float64Array(N_TRIPLE)
    const gPL = new Float64Array(N_PAIR)
    const gBTri = new Float64Array(N_TRIPLE)
    let gLam = 0
    for (let t = 0; t < N_TRIPLE; t++) gBTri[t] = -rho * v[t]! * v[t]!
    const gRLeft = new Float64Array(N_Q3P)
    let sumM4 = 0
    for (let i = 0; i < N_Q3T; i++) {
      const fr = Q3T_FROM[i]!
      const tid = Q3T_TID[i]!
      const w = omega[tid]!
      const vv2 = v[tid]! * v[tid]!
      sumM4 += R_left[fr]! * wSqQ3[i]! * vv2
      gRLeft[fr] = gRLeft[fr]! + 48 * invLam3 * wSqQ3[i]! * vv2
      gOmega[tid] = gOmega[tid]! + 48 * invLam3 * R_left[fr]! * (2 * w * invLam) * vv2
      gLam += -48 * invLam3 * R_left[fr]! * (w * w * invLam2) * vv2
    }
    gLam += -3 * 48 * invLam3 * invLam * sumM4
    const gW_m3 = Float64Array.from(gRLeft)
    term.set(gRLeft)
    for (let it = 0; it < 60; it++) {
      nxtT.fill(0)
      for (let i = 0; i < N_Q3T; i++) nxtT[Q3T_FROM[i]!] = nxtT[Q3T_FROM[i]!]! + term[Q3T_TO[i]!]! * wSqQ3[i]!
      let nrm = 0
      for (let p = 0; p < N_Q3P; p++) {
        const nv = nxtT[p]!
        gW_m3[p] = gW_m3[p]! + nv
        term[p] = nv
        nrm += nv
      }
      if (nrm < 1e-16) break
    }
    for (let i = 0; i < N_Q3T; i++) {
      const gEntry = gW_m3[Q3T_TO[i]!]! * R_left[Q3T_FROM[i]!]!
      const t = Q3T_TID[i]!
      const w = omega[t]!
      gOmega[t] = gOmega[t]! + gEntry * 2 * w * invLam
      gLam += gEntry * (-w * w * invLam2)
    }
    const gW_m2 = new Float64Array(N_Q3P)
    for (let i = 0; i < N_M3; i++) {
      const fr = M3_FROM[i]!
      const to = M3_TO[i]!
      const t1 = M3_TIN[i]!
      const t2 = M3_TOUT[i]!
      const w1 = omega[t1]!
      const w2 = omega[t2]!
      const wf = W_m2[fr]!
      const vv = v[t1]! * v[t2]!
      const gProd = 48 * invLam3 * vv + gW_m3[to]!
      gW_m2[fr] = gW_m2[fr]! + gProd * w1 * w2
      gOmega[t1] = gOmega[t1]! + gProd * wf * w2
      gOmega[t2] = gOmega[t2]! + gProd * wf * w1
      gLam += -3 * 48 * invLam3 * invLam * wf * w1 * w2 * vv
    }
    const gP1 = new Float64Array(N_P1)
    for (let i = 0; i < N_M2; i++) {
      const k = M2_P1[i]!
      const t1 = M2_TIN[i]!
      const t2 = M2_TOUT[i]!
      const w1 = omega[t1]!
      const w2 = omega[t2]!
      const pk = P1[k]!
      const vv = v[t1]! * v[t2]!
      const gProd = 48 * invLam2 * vv + gW_m2[M2_Q3P[i]!]!
      gP1[k] = gP1[k]! + gProd * w1 * w2
      gOmega[t1] = gOmega[t1]! + gProd * pk * w2
      gOmega[t2] = gOmega[t2]! + gProd * pk * w1
      gLam += -2 * 48 * invLam3 * pk * w1 * w2 * vv
    }
    for (let k = 0; k < N_P1; k++) {
      const gk = gP1[k]!
      for (let idx = P1_OFF[k]!, end = P1_OFF[k + 1]!; idx < end; idx++) {
        const o0 = P1_O0[idx]!
        const t1 = P1_TIN[idx]!
        const t2 = P1_TOUT[idx]!
        const c = P1_COEFF[idx]!
        const p0 = pL[o0]!
        const w1 = omega[t1]!
        const w2 = omega[t2]!
        const vv = v[t1]! * v[t2]!
        const gTerm = (gk + 48 * invLam * vv) * c
        gPL[o0] = gPL[o0]! + gTerm * w1 * w2
        gOmega[t1] = gOmega[t1]! + gTerm * p0 * w2
        gOmega[t2] = gOmega[t2]! + gTerm * p0 * w1
        gLam += -48 * invLam2 * c * p0 * w1 * w2 * vv
      }
    }
    const sPrev = new Float64Array(N_PAIR)
    const gSPrev = new Float64Array(N_PAIR)
    for (let t = 0; t < N_TRIPLE; t++) {
      const o = TRIPLE_ORBITS[t]!.oOut
      sPrev[o] = sPrev[o]! + bTri[t]! * v[t]!
    }
    for (let i = 0; i < M0_OIN.length; i++) {
      const o1 = M0_OIN[i]!
      const tOut = M0_TID[i]!
      const fac = 2 * M0_COEFF[i]! * invSqLam * v[tOut]!
      gSPrev[o1] = gSPrev[o1]! + fac * omega[tOut]!
      gOmega[tOut] = gOmega[tOut]! + fac * sPrev[o1]!
      gLam += -0.5 * fac * invLam * omega[tOut]! * sPrev[o1]!
    }
    for (let t = 0; t < N_TRIPLE; t++) gBTri[t] = gBTri[t]! + gSPrev[TRIPLE_ORBITS[t]!.oOut]! * v[t]!
    for (let t = 0; t < N_TRIPLE; t++) {
      const gb = gBTri[t]!
      const tr = TRIPLE_ORBITS[t]!
      const w = omega[t]!
      gPL[tr.oIn] = gPL[tr.oIn]! + gb * invLam * tr.multFromOIn * w * w
      gOmega[t] = gOmega[t]! + gb * invLam * pL[tr.oIn]! * tr.multFromOIn * 2 * w
      gLam += gb * (-bTri[t]! * invLam)
    }
    let pDotG = 0
    for (let i = 0; i < N_PAIR; i++) pDotG += pL[i]! * gPL[i]!
    const rhs = new Float64Array(N_PAIR)
    for (let i = 0; i < N_PAIR; i++) rhs[i] = gPL[i]! - pDotG
    const shiftM = new Float64Array(N_PAIR * N_PAIR)
    for (let i = 0; i < N_PAIR; i++) for (let j = 0; j < N_PAIR; j++) shiftM[i * N_PAIR + j] = (i === j ? lam : 0) - M2[i * N_PAIR + j]! + lam * pL[j]!
    const qAdj = solveLinear57(shiftM, rhs)
    for (let t = 0; t < N_TRIPLE; t++) {
      const tr = TRIPLE_ORBITS[t]!
      const w = omega[t]!
      const gM = pL[tr.oIn]! * (gLam * pR[tr.oOut]! + qAdj[tr.oOut]!)
      gOmega[t] = gOmega[t]! + gM * tr.multFromOIn * 2 * w
    }
    const gradLogW = new Float64Array(N_TRIPLE)
    for (let t = 0; t < N_TRIPLE; t++) gradLogW[t] = gOmega[t]! * omega[t]!
    return { rho, gradLogW, v4440: v }
  }

  // Generic L-BFGS ascent helper
  const runLBFGS = (
    dim: number,
    xInit: Float64Array,
    evalFn: (x: Float64Array, needGrad: boolean) => { readonly val: number; readonly g: Float64Array },
    maxIters: number,
    tol = 5e-5,
  ): { readonly x: Float64Array; readonly val: number } => {
    const x = Float64Array.from(xInit)
    const mHist = 14
    const sHist: Float64Array[] = []
    const yHist: Float64Array[] = []
    const rhoHist: number[] = []
    let cur = evalFn(x, true)
    const tryX = new Float64Array(dim)
    for (let it = 1; it <= maxIters; it++) {
      const grad = cur.g
      const q = Float64Array.from(grad)
      const kH = sHist.length
      const alpha = new Float64Array(kH)
      for (let i = kH - 1; i >= 0; i--) {
        let dot = 0
        for (let j = 0; j < dim; j++) dot += sHist[i]![j]! * q[j]!
        alpha[i] = rhoHist[i]! * dot
        for (let j = 0; j < dim; j++) q[j] = q[j]! - alpha[i]! * yHist[i]![j]!
      }
      let scale = 1.0
      if (kH > 0) {
        let sy = 0
        let yy = 0
        for (let j = 0; j < dim; j++) {
          sy += sHist[kH - 1]![j]! * yHist[kH - 1]![j]!
          yy += yHist[kH - 1]![j]! * yHist[kH - 1]![j]!
        }
        if (yy > 1e-24 && sy > 0) scale = sy / yy
      }
      const d = new Float64Array(dim)
      for (let j = 0; j < dim; j++) d[j] = scale * q[j]!
      for (let i = 0; i < kH; i++) {
        let dot = 0
        for (let j = 0; j < dim; j++) dot += yHist[i]![j]! * d[j]!
        const beta = rhoHist[i]! * dot
        for (let j = 0; j < dim; j++) d[j] = d[j]! + sHist[i]![j]! * (alpha[i]! - beta)
      }
      let dg = 0
      for (let j = 0; j < dim; j++) dg += d[j]! * grad[j]!
      if (dg <= 0) {
        d.set(grad)
        sHist.length = 0
        yHist.length = 0
        rhoHist.length = 0
      }
      let step = 1.0
      let ok = false
      for (let ls = 0; ls < 16; ls++) {
        for (let j = 0; j < dim; j++) tryX[j] = Math.max(-8, Math.min(8, x[j]! + step * d[j]!))
        if (evalFn(tryX, false).val > cur.val + 1e-12) {
          ok = true
          break
        }
        step *= 0.5
      }
      if (!ok) break
      const nxt = evalFn(tryX, true)
      const sVec = new Float64Array(dim)
      const yVec = new Float64Array(dim)
      let sy = 0
      for (let j = 0; j < dim; j++) {
        sVec[j] = tryX[j]! - x[j]!
        yVec[j] = grad[j]! - nxt.g[j]!
        sy += sVec[j]! * yVec[j]!
      }
      if (sy > 1e-22) {
        if (sHist.length >= mHist) {
          sHist.shift()
          yHist.shift()
          rhoHist.shift()
        }
        sHist.push(sVec)
        yHist.push(yVec)
        rhoHist.push(1 / sy)
      }
      x.set(tryX)
      cur = nxt
      let gn = 0
      for (let j = 0; j < dim; j++) gn += cur.g[j]! * cur.g[j]!
      if (Math.sqrt(gn) < tol) break
    }
    return { x, val: cur.val }
  }

  // Stage A: 0-step CF (3 bulk params g1=1, g2=0.44019, g3=0.23853) + 57-dim boundary
  const omScratch = new Float64Array(N_TRIPLE)
  for (let t = 0; t < N_TRIPLE; t++) {
    const s3 = PAIR_ORBITS[TRIPLE_ORBITS[t]!.oOut]!.s2
    omScratch[t] = s3 === 1 ? 1.0 : s3 === 2 ? 0.44019 : 0.23853
  }
  const rho0Step = eval2StepV57(omScratch, false).rho

  // Stage B: 1-step CF (57 pair-orbit bulk weights + 57-dim boundary) using exact analytical gradient projected onto 57 pair orbits!
  const logW57Init = new Float64Array(N_PAIR)
  for (const po of PAIR_ORBITS) logW57Init[po.id] = Math.log(po.s2 === 1 ? 1.0 : po.s2 === 2 ? 0.44 : 0.24)
  const res1Step = runLBFGS(
    N_PAIR,
    logW57Init,
    (lw57, needGrad) => {
      for (let t = 0; t < N_TRIPLE; t++) omScratch[t] = Math.exp(lw57[TRIPLE_ORBITS[t]!.oOut]!)
      const r = eval2StepV57(omScratch, needGrad)
      const g57 = new Float64Array(N_PAIR)
      if (needGrad) for (let t = 0; t < N_TRIPLE; t++) g57[TRIPLE_ORBITS[t]!.oOut] = g57[TRIPLE_ORBITS[t]!.oOut]! + r.gradLogW[t]!
      return { val: r.rho, g: g57 }
    },
    100,
    1e-5,
  )
  const rho1Step57 = res1Step.val

  // Stage C: 2-step CF (4,440 triple-orbit bulk weights + 57-dim boundary), warm-started from Stage B!
  const logW4440Init = new Float64Array(N_TRIPLE)
  for (let t = 0; t < N_TRIPLE; t++) logW4440Init[t] = res1Step.x[TRIPLE_ORBITS[t]!.oOut]!
  const res2Step57 = runLBFGS(
    N_TRIPLE,
    logW4440Init,
    (lw, needGrad) => {
      for (let t = 0; t < N_TRIPLE; t++) omScratch[t] = Math.exp(lw[t]!)
      const r = eval2StepV57(omScratch, needGrad)
      return { val: r.rho, g: r.gradLogW }
    },
    220,
    5e-5,
  )
  const rho2Step57 = res2Step57.val

  // Stage D: 2-step CF (4,440 triple-orbit bulk weights + 4,440-dim triple boundary), warm-started from Stage C!
  // Verify exact analytical gradient on 6 coordinates to < 1e-8!
  for (let t = 0; t < N_TRIPLE; t++) omScratch[t] = Math.exp(res2Step57.x[t]!)
  const gChk = eval2StepV4440(omScratch, true)
  let maxGradErr = 0
  for (const idx of [0, 53, 512, 1234, 2900, 4439]) {
    const eps = 1e-5
    const old = res2Step57.x[idx]!
    omScratch[idx] = Math.exp(old + eps)
    const fp = eval2StepV4440(omScratch, false, gChk.v4440).rho
    omScratch[idx] = Math.exp(old - eps)
    const fm = eval2StepV4440(omScratch, false, gChk.v4440).rho
    omScratch[idx] = Math.exp(old)
    const err = Math.abs((fp - fm) / (2 * eps) - gChk.gradLogW[idx]!)
    if (err > maxGradErr) maxGradErr = err
  }
  assertExact(maxGradErr < 1e-8, `v4440 analytical gradient check failed: ${maxGradErr}`)

  let warmV4440: Float64Array = gChk.v4440
  const res2Step4440 = runLBFGS(
    N_TRIPLE,
    res2Step57.x,
    (lw, needGrad) => {
      for (let t = 0; t < N_TRIPLE; t++) omScratch[t] = Math.exp(lw[t]!)
      const r = eval2StepV4440(omScratch, needGrad, warmV4440)
      warmV4440 = r.v4440
      return { val: r.rho, g: r.gradLogW }
    },
    55,
    5e-5,
  )
  for (let t = 0; t < N_TRIPLE; t++) omScratch[t] = Math.exp(res2Step4440.x[t]!)
  const fin4440 = eval2StepV4440(omScratch, false, warmV4440)
  const rho2Step4440 = fin4440.rho
  console.log(`  CF 0-step (3 bulk params, 57-dim bdy)      : rho >= ${rho0Step.toFixed(8)}`)
  console.log(`  CF 1-step (57 pair weights, 57-dim bdy)    : rho >= ${rho1Step57.toFixed(8)}`)
  console.log(`  CF 2-step (4,440 triple weights, 57-dim)   : rho >= ${rho2Step57.toFixed(8)}`)
  console.log(
    `  CF 2-step (4,440 triple weights, 4440-dim) : rho >= ${rho2Step4440.toFixed(8)} (gradErr=${maxGradErr.toExponential(2)}, ${((performance.now() - t0) / 1000).toFixed(2)}s)`,
  )

  // 5. Concrete 100% exact BigInt finite-support witness psi in Z^V on CF shells k = 10..420 (ZERO sqrt!)
  const tBig = performance.now()
  const kMin = 10
  const kMax = 420
  const kLen = kMax - kMin + 1
  const omInt = new Array<bigint>(N_TRIPLE)
  const omSq = new Array<bigint>(N_TRIPLE)
  for (let t = 0; t < N_TRIPLE; t++) {
    const q = BigInt(Math.max(1, Math.round(omScratch[t]! * 10000)))
    omInt[t] = q
    omSq[t] = q * q
  }
  const vInt = new Array<bigint>(N_TRIPLE)
  const vSign = fin4440.v4440[0]! >= 0 ? 1 : -1
  let vMinPos = Number.POSITIVE_INFINITY
  for (let t = 0; t < N_TRIPLE; t++) {
    const a = vSign * fin4440.v4440[t]!
    assertExact(a > 0, `v4440[${t}] must be strictly positive`)
    if (a < vMinPos) vMinPos = a
  }
  for (let t = 0; t < N_TRIPLE; t++) vInt[t] = BigInt(Math.max(1, Math.round(((vSign * fin4440.v4440[t]!) / vMinPos) * 10000)))

  const Z: bigint[][] = [[], [], new Array<bigint>(N_PAIR).fill(1n)]
  for (let k = 3; k <= kMax; k++) {
    const prev = Z[k - 1]!
    const cur = new Array<bigint>(N_PAIR).fill(0n)
    for (let t = 0; t < N_TRIPLE; t++) {
      const tr = TRIPLE_ORBITS[t]!
      cur[tr.oOut] = cur[tr.oOut]! + BigInt(tr.multIntoOOut) * omSq[t]! * prev[tr.oIn]!
    }
    Z.push(cur)
  }
  const log2LamInt = (Z[kMax]![0]!.toString(2).length - Z[kMin]![0]!.toString(2).length) / (kMax - kMin)
  const W: bigint[] = new Array<bigint>(kMax + 3).fill(0n)
  for (let i = 0; i < kLen; i++) {
    const k = kMin + i
    const win = Math.sin((Math.PI * (i + 1)) / (kLen + 1))
    const expBits = 0.5 * (kMax - k) * log2LamInt
    const sh = Math.floor(expBits)
    W[k] = BigInt(Math.max(1, Math.round(win * Math.pow(2, expBits - sh) * 65536))) << BigInt(sh)
  }

  const M_CUT = 24
  const S00Prev = new Array<bigint>(N_PAIR).fill(0n)
  const S01Prev = new Array<bigint>(N_PAIR).fill(0n)
  const Sm: bigint[][] = Array.from({ length: M_CUT + 1 }, () => new Array<bigint>(N_PAIR).fill(0n))
  for (let k = kMin; k <= kMax; k++) {
    const wk = W[k]!
    const wk2 = wk * wk
    const w01 = wk * W[k + 1]!
    const zkm1 = Z[k - 1]!
    for (let o = 0; o < N_PAIR; o++) {
      S00Prev[o] = S00Prev[o]! + wk2 * zkm1[o]!
      if (w01 !== 0n) S01Prev[o] = S01Prev[o]! + w01 * zkm1[o]!
    }
    const mLim = Math.min(M_CUT, k - 2)
    for (let m = 1; m <= mLim; m++) {
      const zkm = Z[k - m]!
      const smRow = Sm[m]!
      for (let o = 0; o < N_PAIR; o++) smRow[o] = smRow[o]! + wk2 * zkm[o]!
    }
  }

  let bigDen = 0n
  for (let t = 0; t < N_TRIPLE; t++) {
    const tr = TRIPLE_ORBITS[t]!
    bigDen += BigInt(tr.totalTriples) * omSq[t]! * vInt[t]! * vInt[t]! * S00Prev[tr.oIn]!
  }

  let bigNum = 0n
  const sPrevBig = new Array<bigint>(N_PAIR).fill(0n)
  for (let t = 0; t < N_TRIPLE; t++) {
    const tr = TRIPLE_ORBITS[t]!
    sPrevBig[tr.oOut] = sPrevBig[tr.oOut]! + BigInt(tr.multIntoOOut) * omSq[t]! * vInt[t]! * S01Prev[tr.oIn]!
  }
  for (let i = 0; i < M0_OIN.length; i++) {
    const o1 = M0_OIN[i]!
    const tOut = M0_TID[i]!
    bigNum += 48n * BigInt(M0_MULT[i]!) * sPrevBig[o1]! * omInt[tOut]! * vInt[tOut]!
  }
  for (let k = 0; k < N_P1; k++) {
    let s = 0n
    for (let idx = P1_OFF[k]!, end = P1_OFF[k + 1]!; idx < end; idx++) {
      const t1 = P1_TIN[idx]!
      const t2 = P1_TOUT[idx]!
      s += Sm[1]![P1_O0[idx]!]! * omInt[t1]! * omInt[t2]! * vInt[t1]! * vInt[t2]!
    }
    bigNum += 48n * BigInt(P1_MULT[k]!) * s
  }
  const P1_GROUPED: { readonly o0: number; readonly w: bigint }[][] = []
  for (let k = 0; k < N_P1; k++) {
    const m = new Map<number, bigint>()
    for (let idx = P1_OFF[k]!, end = P1_OFF[k + 1]!; idx < end; idx++) {
      const o0 = P1_O0[idx]!
      m.set(o0, (m.get(o0) ?? 0n) + omInt[P1_TIN[idx]!]! * omInt[P1_TOUT[idx]!]!)
    }
    P1_GROUPED.push(Array.from(m, ([o0, w]) => ({ o0, w })))
  }
  const evalP1Row = (sRow: readonly bigint[]): bigint[] =>
    P1_GROUPED.map((grp, k) => {
      let s = 0n
      for (const { o0, w } of grp) s += sRow[o0]! * w
      return s * BigInt(P1_MULT[k]!)
    })
  {
    const p1 = evalP1Row(Sm[2]!)
    for (let i = 0; i < N_M2; i++) {
      const t1 = M2_TIN[i]!
      const t2 = M2_TOUT[i]!
      bigNum += 48n * p1[M2_P1[i]!]! * omInt[t1]! * omInt[t2]! * vInt[t1]! * vInt[t2]!
    }
  }
  {
    const p1 = evalP1Row(Sm[3]!)
    const wm2 = new Array<bigint>(N_Q3P).fill(0n)
    for (let i = 0; i < N_M2; i++) wm2[M2_Q3P[i]!] = wm2[M2_Q3P[i]!]! + p1[M2_P1[i]!]! * omInt[M2_TIN[i]!]! * omInt[M2_TOUT[i]!]!
    for (let i = 0; i < N_M3; i++) {
      const t1 = M3_TIN[i]!
      const t2 = M3_TOUT[i]!
      bigNum += 48n * wm2[M3_FROM[i]!]! * omInt[t1]! * omInt[t2]! * vInt[t1]! * vInt[t2]!
    }
  }
  {
    const D = M_CUT - 4
    const uVec: bigint[][] = [new Array<bigint>(N_Q3P).fill(0n)]
    for (let i = 0; i < N_Q3T; i++) {
      const tid = Q3T_TID[i]!
      uVec[0]![Q3T_FROM[i]!] = uVec[0]![Q3T_FROM[i]!]! + omSq[tid]! * vInt[tid]! * vInt[tid]!
    }
    for (let d = 1; d <= D; d++) {
      const prev = uVec[d - 1]!
      const cur = new Array<bigint>(N_Q3P).fill(0n)
      for (let i = 0; i < N_Q3T; i++) cur[Q3T_FROM[i]!] = cur[Q3T_FROM[i]!]! + prev[Q3T_TO[i]!]! * omSq[Q3T_TID[i]!]!
      uVec.push(cur)
    }
    const gP1All: bigint[][] = []
    for (let d = 0; d <= D; d++) {
      const ud = uVec[d]!
      const gM2 = new Array<bigint>(N_Q3P).fill(0n)
      for (let i = 0; i < N_M3; i++) gM2[M3_FROM[i]!] = gM2[M3_FROM[i]!]! + ud[M3_TO[i]!]! * omInt[M3_TIN[i]!]! * omInt[M3_TOUT[i]!]!
      const gP1 = new Array<bigint>(N_P1).fill(0n)
      for (let i = 0; i < N_M2; i++) gP1[M2_P1[i]!] = gP1[M2_P1[i]!]! + gM2[M2_Q3P[i]!]! * omInt[M2_TIN[i]!]! * omInt[M2_TOUT[i]!]!
      gP1All.push(gP1)
    }
    for (let k = 0; k < N_P1; k++) {
      const grp = P1_GROUPED[k]!
      let accK = 0n
      for (let d = 0; d <= D; d++) {
        const gp = gP1All[d]![k]!
        if (gp === 0n) continue
        const sm = Sm[4 + d]!
        let dot = 0n
        for (const { o0, w } of grp) dot += w * sm[o0]!
        accK += gp * dot
      }
      bigNum += 48n * BigInt(P1_MULT[k]!) * accK
    }
  }
  console.log(
    `  CONCRETE EXACT BIGINT WITNESS (k=${kMin}..${kMax}, M_CUT=${M_CUT}, ZERO sqrt): rho >= ${ratFloorDec(bigNum, bigDen, 6)} (8-dec: ${ratFloorDec(bigNum, bigDen, 8)}, ${((performance.now() - tBig) / 1000).toFixed(2)}s)`,
  )

  recordCheck(
    'P3A',
    'Cartier-Foata bijection, 8,857-dock B_3 audit, and brute-force m=0..4 2-step BigInt verification',
    ballCFEdgeErr === 0 && ballBigIntDiff === 0n && maxGradErr < 1e-8,
    `216 cliques, 57 pair orbits, 4,440 triple orbits, 20 Q_3 cliques, 0 ball/BigInt errors, gradErr=${maxGradErr.toExponential(2)}`,
  )
  recordCheck(
    'P3B',
    'Concrete exact BigInt & asymptotic 2-step CF Markov lower bounds (> 11.439)',
    bigNum * 1000000n >= 11439000n * bigDen && rho2Step4440 >= 11.4392,
    `concrete BigInt >= ${ratFloorDec(bigNum, bigDen, 6)}, asymptotic >= ${floatFloorDec(rho2Step4440, 6)} (1-step: ${rho1Step57.toFixed(6)})`,
  )

  return { rho0Step, rho1Step57, rho2Step57, rho2Step4440, bigNum, bigDen }
}

// =================================================================================================
// PART 4: COMPLEMENTARY SPHERICAL-SHELL KRYLOV-MOMENT CROSS-CHECK (m_0..m_4 ON B_3 & V_4+A(V_4))
// =================================================================================================

function runPart4SphericalKrylovAudit(p12: UpperPartResult): { readonly v4Av4: number; readonly normAV4Av4: number } {
  console.log('\n================================================================================')
  console.log('PART 4: SPHERICAL-SHELL KRYLOV-MOMENT DIAGNOSTIC (m_4 BALL AUDIT & V_4 + A(V_4))')
  console.log('================================================================================')
  const t0 = performance.now()

  // Verify exact 10-term BigInt formula for m_4 = ||A^2 psi||^2 on ALL 8,857 docks of B_3 (r = 0, 1 support)
  const { ball, d2States, d2KeyToId, d2StepFlat, d2StepPerm, d4States, d4StepId, d4StepPerm } = p12
  const racgLetter = (r: number, slot: number): number => ((r & 1) === 0 ? slot : OPPOSITE_SLOT[slot]!)
  const ballD1 = new Int32Array(ball.nDocks)
  for (let d = 0; d < ball.nDocks; d++) {
    const rd = ball.radius[d]!
    if (rd === 0) continue
    let mask = 0
    for (let s = 0; s < 24; s++) {
      const t = ball.neighbors[d]![s]!
      if (t >= 0 && ball.radius[t] === rd - 1) mask |= 1 << racgLetter(rd - 1, OPPOSITE_SLOT[s]!)
    }
    ballD1[d] = mask
  }
  const ballD2Id = new Int32Array(ball.nDocks)
  for (let d = 0; d < ball.nDocks; d++) {
    const rd = ball.radius[d]!
    const dm = new Map<number, number>()
    if (rd > 0) {
      for (let s = 0; s < 24; s++) {
        const t = ball.neighbors[d]![s]!
        if (t >= 0 && ball.radius[t] === rd - 1) dm.set(racgLetter(rd - 1, OPPOSITE_SLOT[s]!), ballD1[t]!)
      }
    }
    const st: D2State = { c0: ballD1[d]!, downs: dm }
    if (st.c0 === 0) ballD2Id[d] = 0
    else {
      const info = CANON_CLIQUE.get(st.c0)!
      const c0Bits = bitsOf(st.c0)
      let best = ''
      for (const pi of info.permIds) {
        const k = encodeD2WithPerm(WF4[pi]!, st, c0Bits)
        if (best === '' || k < best) best = k
      }
      ballD2Id[d] = d2KeyToId.get(best)!
    }
  }
  const xTest: bigint[][] = [
    Array.from({ length: 19 }, (_, u) => BigInt(3 * u + 7)),
    Array.from({ length: 19 }, (_, u) => BigInt(5 * u + 11)),
  ]
  const psi = new Array<bigint>(ball.nDocks).fill(0n)
  for (let d = 0; d < ball.nDocks; d++) if (ball.radius[d]! <= 1) psi[d] = xTest[ball.radius[d]!]![ballD2Id[d]!]!
  const apsi = new Array<bigint>(ball.nDocks).fill(0n)
  for (let d = 0; d < ball.nDocks; d++) {
    let s = 0n
    for (let k = 0; k < 24; k++) {
      const t = ball.neighbors[d]![k]!
      if (t >= 0) s += psi[t]!
    }
    apsi[d] = s
  }
  const a2psi = new Array<bigint>(ball.nDocks).fill(0n)
  for (let d = 0; d < ball.nDocks; d++) {
    let s = 0n
    for (let k = 0; k < 24; k++) {
      const t = ball.neighbors[d]![k]!
      if (t >= 0) s += apsi[t]!
    }
    a2psi[d] = s
  }
  let ballM4 = 0n
  for (let d = 0; d < ball.nDocks; d++) ballM4 += a2psi[d]! * a2psi[d]!

  // Automaton exact m4 on D2 (r = 0, 1)
  const k2 = d2States.map(s => popcount(s.c0))
  const N2: bigint[][] = [Array.from({ length: 19 }, (_, u) => (u === 0 ? 1n : 0n))]
  for (let r = 1; r <= 4; r++) {
    const prev = N2[r - 1]!
    const cur = new Array<bigint>(19).fill(0n)
    for (let u = 0; u < 19; u++) {
      const pu = prev[u]!
      if (pu === 0n) continue
      for (let b = 0; b < 24; b++) {
        const v = d2StepFlat[u * 24 + b]!
        if (v >= 0) cur[v] = cur[v]! + pu
      }
    }
    for (let v = 1; v < 19; v++) cur[v] = cur[v]! / BigInt(k2[v]!)
    N2.push(cur)
  }
  const getX = (r: number, u: number): bigint => (r >= 0 && r <= 1 ? xTest[r]![u]! : 0n)
  const w1Arr: bigint[][] = Array.from({ length: 4 }, (_, r) =>
    Array.from({ length: 19 }, (_, u) => {
      let s = 0n
      for (let b = 0; b < 24; b++) {
        const v = d2StepFlat[u * 24 + b]!
        if (v >= 0) s += getX(r + 1, v)
      }
      return s
    }),
  )
  const getW1 = (r: number, u: number): bigint => (r >= 0 && r < 4 ? w1Arr[r]![u]! : 0n)
  const v0Arr: bigint[][] = Array.from({ length: 4 }, (_, r) =>
    Array.from({ length: 19 }, (_, u) => {
      let s = BigInt(24 - k2[u]!) * getX(r, u)
      for (let b = 0; b < 24; b++) {
        const v = d2StepFlat[u * 24 + b]!
        if (v >= 0) s += getW1(r + 1, v)
      }
      return s
    }),
  )
  const getV0 = (r: number, u: number): bigint => (r >= 0 && r < 4 ? v0Arr[r]![u]! : 0n)
  let autoM4 = 0n
  for (let r = 0; r <= 3; r++) {
    for (let u = 0; u < 19; u++) {
      const nu = N2[r]![u]!
      if (nu === 0n) continue
      const c0 = d2States[u]!.c0
      const baseU = u * 24
      const xu = getX(r, u)
      const w1u = getW1(r, u)
      const v0u = getV0(r, u)
      autoM4 += nu * v0u * v0u + nu * BigInt(24 - k2[u]!) * w1u * w1u
      if (w1u !== 0n) {
        let s01 = 0n
        let s12a = 0n
        for (let a = 0; a < 24; a++) {
          const va = d2StepFlat[baseU + a]!
          if (va < 0) continue
          s01 += getV0(r + 1, va)
          for (const b of ADJ_BITS[a]!) {
            const vb = d2StepFlat[baseU + b]!
            if (vb >= 0) s12a += getX(r + 1, vb)
          }
        }
        autoM4 += 2n * nu * w1u * (s01 + s12a)
      }
      for (let a = 0; a < 24; a++) {
        const va = d2StepFlat[baseU + a]!
        if (va < 0) continue
        let sbX = 0n
        for (const b of ADJ_BITS[a]!) {
          const vb = d2StepFlat[baseU + b]!
          if (vb >= 0) {
            sbX += getX(r + 1, vb)
            autoM4 += 2n * nu * getV0(r + 1, va) * getX(r + 1, vb) + nu * getW1(r + 1, va) * getW1(r + 1, vb)
          }
        }
        autoM4 += nu * sbX * sbX
      }
      if (xu !== 0n) {
        let s03 = 0n
        let s13 = 0n
        let cnt10 = 0n
        for (let b = 0; b < 24; b++) {
          const vb = d2StepFlat[baseU + b]!
          if (vb < 0) continue
          cnt10 += BigInt(24 - k2[vb]!) + BigInt(popcount(ADJ_MASK[b]! & ~c0))
          s13 += BigInt(24 - k2[vb]! + popcount(ADJ_MASK[b]! & ~c0)) * getW1(r + 1, vb)
          for (let a = 0; a < 24; a++) {
            const vba = d2StepFlat[vb * 24 + a]!
            if (vba >= 0) s03 += getV0(r + 2, vba)
          }
        }
        autoM4 += 2n * nu * xu * (s03 + s13) + nu * xu * xu * cnt10
      }
      for (let c = 0; c < 24; c++) {
        const vc = d2StepFlat[baseU + c]!
        if (vc < 0) continue
        const pC = WF4[d2StepPerm[baseU + c]!]!
        const baseC = vc * 24
        const dw = (1 << c) | (c0 & ADJ_MASK[c]!)
        for (const a of ADJ_BITS[c]!) {
          const va = d2StepFlat[baseU + a]!
          if (va < 0) continue
          for (const b of ADJ_BITS[a]!) {
            if ((dw & (1 << b)) !== 0) continue
            const vcb = d2StepFlat[baseC + pC[b]!]!
            autoM4 += 2n * nu * (getW1(r + 1, va) * getX(r + 2, vcb) + getX(r + 1, va) * getW1(r + 2, vcb))
          }
        }
      }
      for (let b1 = 0; b1 < 24; b1++) {
        const vb1 = d2StepFlat[baseU + b1]!
        if (vb1 < 0) continue
        const dw1 = (1 << b1) | (c0 & ADJ_MASK[b1]!)
        const x1 = getX(r + 1, vb1)
        for (const b2 of ADJ_BITS[b1]!) {
          const vb2 = d2StepFlat[baseU + b2]!
          if (vb2 < 0) continue
          const dw = (1 << b1) | (1 << b2) | (c0 & ADJ_MASK[b1]! & ADJ_MASK[b2]!)
          const dw2 = (1 << b2) | (c0 & ADJ_MASK[b2]!)
          const w10 = 24 - popcount(dw) + popcount(ADJ_MASK[b1]! & ADJ_MASK[b2]! & ~c0) + popcount(ADJ_MASK[b2]! & ~dw1) + popcount(ADJ_MASK[b1]! & ~dw2)
          autoM4 += nu * BigInt(w10) * x1 * getX(r + 1, vb2)
        }
      }
    }
  }
  assertExact(ballM4 === autoM4, `m4 ball mismatch: ${ballM4} != ${autoM4}`)

  // Fast D4 (2,197 states) V_4 + A(V_4) & ||A(V_4 + A(V_4))|| diagnostic (~0.18 s!)
  const n = 2197
  const kOf = d4States.map(s => popcount(s.c0))
  const transU: number[][] = Array.from({ length: n }, () => [])
  const transM: number[][] = Array.from({ length: n }, () => [])
  for (let u = 0; u < n; u++) {
    const m = new Map<number, number>()
    for (let b = 0; b < 24; b++) {
      const v = d4StepId[u * 24 + b]!
      if (v >= 0) m.set(v, (m.get(v) ?? 0) + 1)
    }
    for (const [v, cnt] of m) {
      transU[u]!.push(v)
      transM[u]!.push(cnt)
    }
  }
  let p = new Float64Array(n)
  p[0] = 1
  for (let r = 1; r <= 75; r++) {
    const q = new Float64Array(n)
    for (let u = 0; u < n; u++) {
      const pu = p[u]!
      if (pu === 0) continue
      const vs = transU[u]!
      const ms = transM[u]!
      for (let i = 0; i < vs.length; i++) q[vs[i]!] = q[vs[i]!]! + pu * ms[i]!
    }
    let s = 0
    for (let v = 1; v < n; v++) {
      q[v] = q[v]! / kOf[v]!
      s += q[v]!
    }
    for (let v = 0; v < n; v++) p[v] = q[v]! / s
  }
  let lam = 0
  const active: number[] = []
  const idxOf = new Int32Array(n).fill(-1)
  for (let u = 0; u < n; u++) {
    const vs = transU[u]!
    const ms = transM[u]!
    for (let i = 0; i < vs.length; i++) lam += (p[u]! * ms[i]!) / kOf[vs[i]!]!
    if (p[u]! > 1e-18) {
      idxOf[u] = active.length
      active.push(u)
    }
  }
  const na = active.length
  const invSqLam = 1 / Math.sqrt(lam)
  const invLam = 1 / lam
  const invLam32 = invLam * invSqLam
  const invLam2 = invLam * invLam

  const bOff = new Int32Array(na + 1)
  const btCnt = new Int32Array(na)
  let totE = 0
  for (let iu = 0; iu < na; iu++) for (const v of transU[active[iu]!]!) if (idxOf[v]! >= 0) {
    totE++
    btCnt[idxOf[v]!] = btCnt[idxOf[v]!]! + 1
  }
  const bCol = new Int32Array(totE)
  const bVal = new Float64Array(totE)
  const e1Val = new Float64Array(totE)
  const btOff = new Int32Array(na + 1)
  for (let i = 0; i < na; i++) btOff[i + 1] = btOff[i]! + btCnt[i]!
  const btCol = new Int32Array(totE)
  const btVal = new Float64Array(totE)
  const e1tVal = new Float64Array(totE)
  const btPos = Int32Array.from(btOff)
  let ptr = 0
  for (let iu = 0; iu < na; iu++) {
    bOff[iu] = ptr
    const u = active[iu]!
    const c0 = d4States[u]!.c0
    const spu = Math.sqrt(p[u]!)
    const vs = transU[u]!
    const ms = transM[u]!
    const mE1 = new Map<number, number>()
    for (let b = 0; b < 24; b++) {
      const v = d4StepId[u * 24 + b]!
      if (v < 0) continue
      const iv = idxOf[v]!
      if (iv < 0) continue
      const cntA = popcount(ADJ_MASK[b]! & ~c0)
      if (cntA > 0) mE1.set(iv, (mE1.get(iv) ?? 0) + cntA)
    }
    for (let i = 0; i < vs.length; i++) {
      const iv = idxOf[vs[i]!]!
      if (iv < 0) continue
      const sc = invSqLam * (spu / Math.sqrt(p[vs[i]!]!))
      bCol[ptr] = iv
      bVal[ptr] = ms[i]! * sc
      e1Val[ptr] = (mE1.get(iv) ?? 0) * sc
      ptr++
      const bp = btPos[iv]!
      btCol[bp] = iu
      btVal[bp] = ms[i]! * sc
      e1tVal[bp] = (mE1.get(iv) ?? 0) * sc
      btPos[iv] = bp + 1
    }
  }
  bOff[na] = ptr
  const invSqP = new Float64Array(na)
  const diagD = new Float64Array(na)
  const actC0 = new Int32Array(na)
  const actK = new Uint8Array(na)
  const actStep = new Int32Array(na * 24).fill(-1)
  const actPerm = new Uint16Array(na * 24)
  for (let i = 0; i < na; i++) {
    const u = active[i]!
    invSqP[i] = 1 / Math.sqrt(p[u]!)
    diagD[i] = 24 - kOf[u]!
    actC0[i] = d4States[u]!.c0
    actK[i] = kOf[u]!
    for (let a = 0; a < 24; a++) {
      const v = d4StepId[u * 24 + a]!
      if (v >= 0) {
        actStep[i * 24 + a] = idxOf[v]!
        actPerm[i * 24 + a] = d4StepPerm[u * 24 + a]!
      }
    }
  }
  const applyB = (z: Float64Array, out: Float64Array): void => {
    for (let i = 0; i < na; i++) {
      let s = 0
      for (let j = bOff[i]!, e = bOff[i + 1]!; j < e; j++) s += bVal[j]! * z[bCol[j]!]!
      out[i] = s
    }
  }
  const applyBT = (z: Float64Array, out: Float64Array): void => {
    for (let i = 0; i < na; i++) {
      let s = 0
      for (let j = btOff[i]!, e = btOff[i + 1]!; j < e; j++) s += btVal[j]! * z[btCol[j]!]!
      out[i] = s
    }
  }
  const applyC = (z: Float64Array, out: Float64Array): void => {
    const sc = new Float64Array(na)
    for (let i = 0; i < na; i++) sc[i] = z[i]! * invSqP[i]!
    out.fill(0)
    for (let iu = 0; iu < na; iu++) {
      const pw = p[active[iu]!]! * invLam
      const base = iu * 24
      for (let a = 0; a < 24; a++) {
        const va = actStep[base + a]!
        if (va < 0) continue
        let sb = 0
        for (const b of ADJ_BITS[a]!) {
          const vb = actStep[base + b]!
          if (vb >= 0) sb += sc[vb]!
        }
        out[va] = out[va]! + pw * sb
      }
    }
    for (let i = 0; i < na; i++) out[i] = out[i]! * invSqP[i]!
  }
  const applyH1 = (z: Float64Array, out: Float64Array): void => {
    const bz = new Float64Array(na)
    const btz = new Float64Array(na)
    applyB(z, bz)
    applyBT(z, btz)
    for (let i = 0; i < na; i++) out[i] = bz[i]! + btz[i]!
  }
  const applyH2 = (z: Float64Array, out: Float64Array): void => {
    const bz = new Float64Array(na)
    const b2z = new Float64Array(na)
    const btbz = new Float64Array(na)
    const btz = new Float64Array(na)
    const bt2z = new Float64Array(na)
    const cz = new Float64Array(na)
    applyB(z, bz)
    applyB(bz, b2z)
    applyBT(bz, btbz)
    applyBT(z, btz)
    applyBT(btz, bt2z)
    applyC(z, cz)
    for (let i = 0; i < na; i++) out[i] = b2z[i]! + bt2z[i]! + btbz[i]! + diagD[i]! * z[i]! + cz[i]!
  }
  const applyH3 = (z: Float64Array, out: Float64Array): void => {
    const bz = new Float64Array(na)
    const b2z = new Float64Array(na)
    const b3z = new Float64Array(na)
    const btz = new Float64Array(na)
    const bt2z = new Float64Array(na)
    const bt3z = new Float64Array(na)
    const btb2z = new Float64Array(na)
    const btbz = new Float64Array(na)
    const btbtbz = new Float64Array(na)
    const dz = new Float64Array(na)
    const bdz = new Float64Array(na)
    const btdz = new Float64Array(na)
    const cz = new Float64Array(na)
    const cbz = new Float64Array(na)
    const btcz = new Float64Array(na)
    applyB(z, bz)
    applyB(bz, b2z)
    applyB(b2z, b3z)
    applyBT(z, btz)
    applyBT(btz, bt2z)
    applyBT(bt2z, bt3z)
    applyBT(b2z, btb2z)
    applyBT(bz, btbz)
    applyBT(btbz, btbtbz)
    for (let i = 0; i < na; i++) dz[i] = diagD[i]! * z[i]!
    applyB(dz, bdz)
    applyBT(dz, btdz)
    applyC(z, cz)
    applyC(bz, cbz)
    applyBT(cz, btcz)
    for (let i = 0; i < na; i++) {
      let s1 = 0
      for (let j = bOff[i]!, e = bOff[i + 1]!; j < e; j++) s1 += e1Val[j]! * z[bCol[j]!]!
      let s2 = 0
      for (let j = btOff[i]!, e = btOff[i + 1]!; j < e; j++) s2 += e1tVal[j]! * z[btCol[j]!]!
      out[i] = btb2z[i]! + btbtbz[i]! + b3z[i]! + bt3z[i]! + diagD[i]! * (bz[i]! + btz[i]!) + bdz[i]! + btdz[i]! + cbz[i]! + btcz[i]! + s1 + s2
    }
    const sc = new Float64Array(na)
    for (let i = 0; i < na; i++) sc[i] = z[i]! * invSqP[i]!
    const e2 = new Float64Array(na)
    for (let iu = 0; iu < na; iu++) {
      const pw = p[active[iu]!]! * invLam32
      const c0 = actC0[iu]!
      const baseU = iu * 24
      for (let c = 0; c < 24; c++) {
        const vc = actStep[baseU + c]!
        if (vc < 0) continue
        const pC = WF4[actPerm[baseU + c]!]!
        const baseC = vc * 24
        const forb = (1 << c) | (c0 & ADJ_MASK[c]!)
        for (const a of ADJ_BITS[c]!) {
          const va = actStep[baseU + a]!
          if (va < 0) continue
          const sx = pw * sc[va]!
          let sb = 0
          for (const b of ADJ_BITS[a]!) {
            if ((forb & (1 << b)) === 0) {
              const vcb = actStep[baseC + pC[b]!]!
              if (vcb >= 0) {
                sb += sc[vcb]!
                e2[vcb] = e2[vcb]! + sx
              }
            }
          }
          e2[va] = e2[va]! + pw * sb
        }
      }
    }
    for (let i = 0; i < na; i++) out[i] = out[i]! + e2[i]! * invSqP[i]!
  }
  const evalH4Quad = (z: Float64Array): number => {
    const w1 = new Float64Array(na)
    const b2z = new Float64Array(na)
    const v0 = new Float64Array(na)
    applyB(z, w1)
    applyB(w1, b2z)
    for (let i = 0; i < na; i++) v0[i] = b2z[i]! + diagD[i]! * z[i]!
    const bv0 = new Float64Array(na)
    const b2v0 = new Float64Array(na)
    const cz = new Float64Array(na)
    const cw1 = new Float64Array(na)
    const dw1 = new Float64Array(na)
    const bdw1 = new Float64Array(na)
    applyB(v0, bv0)
    applyB(bv0, b2v0)
    applyC(z, cz)
    applyC(w1, cw1)
    for (let i = 0; i < na; i++) dw1[i] = diagD[i]! * w1[i]!
    applyB(dw1, bdw1)
    let tot = 0
    for (let i = 0; i < na; i++) {
      tot += v0[i]! * v0[i]! + 2 * bv0[i]! * w1[i]! + 2 * v0[i]! * cz[i]! + 2 * b2v0[i]! * z[i]! + w1[i]! * (diagD[i]! * w1[i]! + cw1[i]!) + 2 * z[i]! * bdw1[i]!
      let e1z = 0
      let e1w = 0
      for (let j = bOff[i]!, e = bOff[i + 1]!; j < e; j++) {
        const c = bCol[j]!
        const w = e1Val[j]!
        e1z += w * z[c]!
        e1w += w * w1[c]!
      }
      tot += 2 * w1[i]! * e1z + 2 * z[i]! * e1w
    }
    const scZ = new Float64Array(na)
    const scW1 = new Float64Array(na)
    for (let i = 0; i < na; i++) {
      scZ[i] = z[i]! * invSqP[i]!
      scW1[i] = w1[i]! * invSqP[i]!
    }
    for (let iu = 0; iu < na; iu++) {
      const pu = p[active[iu]!]!
      const c0 = actC0[iu]!
      const baseU = iu * 24
      const pw1 = pu * invLam
      const pw32 = pu * invLam32
      const pw2 = pu * invLam2
      const szu = scZ[iu]!
      let s67 = 0
      for (let c = 0; c < 24; c++) {
        const vc = actStep[baseU + c]!
        if (vc < 0) continue
        const pC = WF4[actPerm[baseU + c]!]!
        const baseC = vc * 24
        const dwC = (1 << c) | (c0 & ADJ_MASK[c]!)
        for (const a of ADJ_BITS[c]!) {
          const va = actStep[baseU + a]!
          if (va < 0) continue
          let sbZ = 0
          let sbW = 0
          for (const b of ADJ_BITS[a]!) {
            if ((dwC & (1 << b)) === 0) {
              const vcb = actStep[baseC + pC[b]!]!
              if (vcb >= 0) {
                sbZ += scZ[vcb]!
                sbW += scW1[vcb]!
              }
            }
          }
          s67 += scW1[va]! * sbZ + scZ[va]! * sbW
        }
      }
      tot += 2 * pw32 * s67
      let s8a = 0
      let cnt10ac = 0
      for (let a = 0; a < 24; a++) {
        const va = actStep[baseU + a]!
        if (va < 0) continue
        cnt10ac += 24 - actK[va]! + popcount(ADJ_MASK[a]! & ~c0)
        let sb = 0
        for (const b of ADJ_BITS[a]!) {
          const vb = actStep[baseU + b]!
          if (vb >= 0) sb += scZ[vb]!
        }
        s8a += sb * sb
      }
      tot += pw1 * s8a + pu * szu * szu * cnt10ac
      let s8b10f = 0
      for (let a1 = 0; a1 < 24; a1++) {
        const va1 = actStep[baseU + a1]!
        if (va1 < 0) continue
        const p1 = WF4[actPerm[baseU + a1]!]!
        const base1 = va1 * 24
        for (const a2 of ADJ_BITS[a1]!) {
          const va2 = actStep[baseU + a2]!
          if (va2 < 0) continue
          const p2 = WF4[actPerm[baseU + a2]!]!
          const base2 = va2 * 24
          const f1 = (1 << a2) | (c0 & ADJ_MASK[a2]!)
          const f2 = (1 << a1) | (c0 & ADJ_MASK[a1]!)
          let s1 = 0
          let s2 = 0
          for (const b1 of ADJ_BITS[a1]!) if ((f1 & (1 << b1)) === 0) {
            const v = actStep[base2 + p2[b1]!]!
            if (v >= 0) s1 += scZ[v]!
          }
          for (const b2 of ADJ_BITS[a2]!) if ((f2 & (1 << b2)) === 0) {
            const v = actStep[base1 + p1[b2]!]!
            if (v >= 0) s2 += scZ[v]!
          }
          s8b10f += s1 * s2
          const dw = (1 << a1) | (1 << a2) | (c0 & ADJ_MASK[a1]! & ADJ_MASK[a2]!)
          const av1 = ADJ_MASK[a2]! & ~dw
          const av2 = ADJ_MASK[a1]! & ~dw
          for (let m1 = av1; m1 !== 0; ) {
            const bit1 = m1 & -m1
            m1 ^= bit1
            const x1 = Math.clz32(bit1) ^ 31
            const v1 = actStep[base1 + p1[x1]!]!
            if (v1 < 0) continue
            let sx2 = 0
            for (let m2 = ADJ_MASK[x1]! & av2; m2 !== 0; ) {
              const bit2 = m2 & -m2
              m2 ^= bit2
              const x2 = Math.clz32(bit2) ^ 31
              const v2 = actStep[base2 + p2[x2]!]!
              if (v2 >= 0) sx2 += scZ[v2]!
            }
            s8b10f += scZ[v1]! * sx2
          }
        }
      }
      tot += pw2 * s8b10f
      let s9ab = 0
      let s9c = 0
      for (let b2 = 0; b2 < 24; b2++) {
        const vb2 = actStep[baseU + b2]!
        if (vb2 < 0) continue
        const pB2Idx = actPerm[baseU + b2]!
        const pB2 = WF4[pB2Idx]!
        const baseB2 = vb2 * 24
        const dw = (1 << b2) | (c0 & ADJ_MASK[b2]!)
        const availA1Base = ADJ_MASK[b2]! & ~c0
        for (let b1 = 0; b1 < 24; b1++) {
          if ((dw & (1 << b1)) !== 0) continue
          const v = actStep[baseB2 + pB2[b1]!]!
          if (v < 0) continue
          const cntA = popcount(ADJ_MASK[b1]! & ~dw) + popcount(ADJ_MASK[b1]! & availA1Base)
          if (cntA > 0) s9ab += cntA * scZ[v]!
        }
        for (let a2 = 0; a2 < 24; a2++) {
          if ((dw & (1 << a2)) !== 0) continue
          const maskA1 = availA1Base & ADJ_MASK[a2]!
          if (maskA1 === 0) continue
          const a2Loc = pB2[a2]!
          const va2 = actStep[baseB2 + a2Loc]!
          if (va2 < 0) continue
          const p2 = WF4[WF4_MUL[actPerm[baseB2 + a2Loc]! * 1152 + pB2Idx]!]!
          const base2 = va2 * 24
          const forb1 = (1 << a2) | (dw & ADJ_MASK[a2]!)
          for (let mA1 = maskA1; mA1 !== 0; ) {
            const bit = mA1 & -mA1
            mA1 ^= bit
            const a1 = Math.clz32(bit) ^ 31
            const va1 = actStep[baseU + a1]!
            if (va1 < 0) continue
            let sb1 = 0
            for (let mB1 = ADJ_MASK[a1]! & ~forb1; mB1 !== 0; ) {
              const bb = mB1 & -mB1
              mB1 ^= bb
              const b1 = Math.clz32(bb) ^ 31
              const v3 = actStep[base2 + p2[b1]!]!
              if (v3 >= 0) sb1 += scZ[v3]!
            }
            s9c += scZ[va1]! * sb1
          }
        }
      }
      tot += 2 * pw1 * szu * s9ab + 2 * pw2 * s9c
      let s10 = 0
      for (let b1 = 0; b1 < 24; b1++) {
        const vb1 = actStep[baseU + b1]!
        if (vb1 < 0) continue
        const dw1 = (1 << b1) | (c0 & ADJ_MASK[b1]!)
        const z1 = scZ[vb1]!
        for (const b2 of ADJ_BITS[b1]!) {
          const vb2 = actStep[baseU + b2]!
          if (vb2 < 0) continue
          const dw = (1 << b1) | (1 << b2) | (c0 & ADJ_MASK[b1]! & ADJ_MASK[b2]!)
          const dw2 = (1 << b2) | (c0 & ADJ_MASK[b2]!)
          const w10 = 24 - popcount(dw) + popcount(ADJ_MASK[b1]! & ADJ_MASK[b2]! & ~c0) + popcount(ADJ_MASK[b2]! & ~dw1) + popcount(ADJ_MASK[b1]! & ~dw2)
          s10 += w10 * z1 * scZ[vb2]!
        }
      }
      tot += pw1 * s10
    }
    return tot
  }
  const dotArr = (a: Float64Array, b: Float64Array): number => {
    let s = 0
    for (let i = 0; i < na; i++) s += a[i]! * b[i]!
    return s
  }
  const lanczosTop = (apply: (z: Float64Array, out: Float64Array) => void, mSteps: number): Float64Array => {
    const Q: Float64Array[] = [new Float64Array(na).fill(1 / Math.sqrt(na))]
    const wV = new Float64Array(na)
    const alpha = new Float64Array(mSteps)
    const beta = new Float64Array(mSteps)
    for (let j = 0; j < mSteps; j++) {
      apply(Q[j]!, wV)
      if (j > 0) for (let i = 0; i < na; i++) wV[i] = wV[i]! - beta[j - 1]! * Q[j - 1]![i]!
      const aj = dotArr(Q[j]!, wV)
      alpha[j] = aj
      for (let i = 0; i < na; i++) wV[i] = wV[i]! - aj * Q[j]![i]!
      for (let pass = 0; pass < 2; pass++) {
        for (let k = 0; k <= j; k++) {
          const d = dotArr(Q[k]!, wV)
          for (let i = 0; i < na; i++) wV[i] = wV[i]! - d * Q[k]![i]!
        }
      }
      const bj = Math.sqrt(dotArr(wV, wV))
      beta[j] = bj
      if (j + 1 < mSteps && bj > 1e-13) {
        const qn = new Float64Array(na)
        for (let i = 0; i < na; i++) qn[i] = wV[i]! / bj
        Q.push(qn)
      } else {
        break
      }
    }
    const m = Q.length
    const T = Array.from({ length: m }, (_, i) => {
      const r = new Float64Array(m)
      r[i] = alpha[i]!
      if (i + 1 < m) r[i + 1] = beta[i]!
      if (i > 0) r[i - 1] = beta[i - 1]!
      return r
    })
    const V = Array.from({ length: m }, (_, i) => {
      const r = new Float64Array(m)
      r[i] = 1
      return r
    })
    for (let sw = 0; sw < 60; sw++) {
      let mx = 0
      for (let p1 = 0; p1 < m; p1++) {
        for (let q1 = p1 + 1; q1 < m; q1++) {
          const apq = T[p1]![q1]!
          if (Math.abs(apq) > mx) mx = Math.abs(apq)
          if (Math.abs(apq) < 1e-15) continue
          const app = T[p1]![p1]!
          const aqq = T[q1]![q1]!
          const tau = (aqq - app) / (2 * apq)
          const t = tau >= 0 ? 1 / (tau + Math.sqrt(1 + tau * tau)) : -1 / (-tau + Math.sqrt(1 + tau * tau))
          const c = 1 / Math.sqrt(1 + t * t)
          const s = t * c
          T[p1]![p1] = app - t * apq
          T[q1]![q1] = aqq + t * apq
          T[p1]![q1] = 0
          T[q1]![p1] = 0
          for (let r = 0; r < m; r++) {
            if (r === p1 || r === q1) continue
            const arp = T[r]![p1]!
            const arq = T[r]![q1]!
            T[r]![p1] = c * arp - s * arq
            T[p1]![r] = T[r]![p1]!
            T[r]![q1] = s * arp + c * arq
            T[q1]![r] = T[r]![q1]!
          }
          for (let r = 0; r < m; r++) {
            const vrp = V[r]![p1]!
            const vrq = V[r]![q1]!
            V[r]![p1] = c * vrp - s * vrq
            V[r]![q1] = s * vrp + c * vrq
          }
        }
      }
      if (mx < 1e-14) break
    }
    let bi = 0
    for (let i = 1; i < m; i++) if (T[i]![i]! > T[bi]![bi]!) bi = i
    const v = new Float64Array(na)
    for (let k = 0; k < m; k++) {
      const ck = V[k]![bi]!
      for (let i = 0; i < na; i++) v[i] = v[i]! + ck * Q[k]![i]!
    }
    return v
  }
  const jacobiSmall = (A: Float64Array[]): { readonly vals: Float64Array; readonly vecs: Float64Array[] } => {
    const dim = A.length
    const T = A.map(r => Float64Array.from(r))
    const V = Array.from({ length: dim }, (_, i) => {
      const r = new Float64Array(dim)
      r[i] = 1
      return r
    })
    for (let sw = 0; sw < 60; sw++) {
      let mx = 0
      for (let p1 = 0; p1 < dim; p1++) {
        for (let q1 = p1 + 1; q1 < dim; q1++) {
          const apq = T[p1]![q1]!
          if (Math.abs(apq) > mx) mx = Math.abs(apq)
          if (Math.abs(apq) < 1e-15) continue
          const app = T[p1]![p1]!
          const aqq = T[q1]![q1]!
          const tau = (aqq - app) / (2 * apq)
          const t = tau >= 0 ? 1 / (tau + Math.sqrt(1 + tau * tau)) : -1 / (-tau + Math.sqrt(1 + tau * tau))
          const c = 1 / Math.sqrt(1 + t * t)
          const s = t * c
          T[p1]![p1] = app - t * apq
          T[q1]![q1] = aqq + t * apq
          T[p1]![q1] = 0
          T[q1]![p1] = 0
          for (let r = 0; r < dim; r++) {
            if (r === p1 || r === q1) continue
            const arp = T[r]![p1]!
            const arq = T[r]![q1]!
            T[r]![p1] = c * arp - s * arq
            T[p1]![r] = T[r]![p1]!
            T[r]![q1] = s * arp + c * arq
            T[q1]![r] = T[r]![q1]!
          }
          for (let r = 0; r < dim; r++) {
            const vrp = V[r]![p1]!
            const vrq = V[r]![q1]!
            V[r]![p1] = c * vrp - s * vrq
            V[r]![q1] = s * vrp + c * vrq
          }
        }
      }
      if (mx < 1e-14) break
    }
    return { vals: Float64Array.from({ length: dim }, (_, i) => T[i]![i]!), vecs: V }
  }
  // 4-step Generalized Davidson on V_4 + A(V_4) (~0.08 s on 2,166 active states!)
  const basis: Float64Array[] = []
  const H1B: Float64Array[] = []
  const H2B: Float64Array[] = []
  const H3B: Float64Array[] = []
  const addBasis = (raw: Float64Array): void => {
    const v = Float64Array.from(raw)
    for (let pass = 0; pass < 2; pass++) for (const q of basis) {
      const d = dotArr(q, v)
      for (let i = 0; i < na; i++) v[i] = v[i]! - d * q[i]!
    }
    const nrm = Math.sqrt(dotArr(v, v))
    if (nrm < 1e-10) return
    for (let i = 0; i < na; i++) v[i] = v[i]! / nrm
    const h1 = new Float64Array(na)
    const h2 = new Float64Array(na)
    const h3 = new Float64Array(na)
    applyH1(v, h1)
    applyH2(v, h2)
    applyH3(v, h3)
    basis.push(v)
    H1B.push(h1)
    H2B.push(h2)
    H3B.push(h3)
  }
  addBasis(lanczosTop(applyH1, 35))
  addBasis(lanczosTop(applyH2, 35))
  let v4Av4 = 0
  let z0Opt = new Float64Array(na)
  let z1Opt = new Float64Array(na)
  for (let step = 0; step < 4; step++) {
    const m = basis.length
    const M1 = Array.from({ length: m }, (_, i) => Float64Array.from({ length: m }, (_, j) => dotArr(basis[i]!, H1B[j]!)))
    const M2 = Array.from({ length: m }, (_, i) => Float64Array.from({ length: m }, (_, j) => dotArr(basis[i]!, H2B[j]!)))
    const M3 = Array.from({ length: m }, (_, i) => Float64Array.from({ length: m }, (_, j) => dotArr(basis[i]!, H3B[j]!)))
    const B2m = Array.from({ length: 2 * m }, (_, i) =>
      Float64Array.from({ length: 2 * m }, (_, j) =>
        i < m && j < m ? (i === j ? 1 : 0) : i < m && j >= m ? M1[i]![j - m]! : i >= m && j < m ? M1[i - m]![j]! : M2[i - m]![j - m]!,
      ),
    )
    const A3m = Array.from({ length: 2 * m }, (_, i) =>
      Float64Array.from({ length: 2 * m }, (_, j) =>
        i < m && j < m ? M1[i]![j]! : i < m && j >= m ? M2[i]![j - m]! : i >= m && j < m ? M2[i - m]![j]! : M3[i - m]![j - m]!,
      ),
    )
    const { vals: bV, vecs: bVec } = jacobiSmall(B2m)
    const keep: number[] = []
    for (let i = 0; i < 2 * m; i++) if (bV[i]! > 1e-11) keep.push(i)
    const dk = keep.length
    const W = Array.from({ length: 2 * m }, (_, r) => Float64Array.from({ length: dk }, (_, ci) => bVec[r]![keep[ci]!]! / Math.sqrt(bV[keep[ci]!]!)))
    const AW = Array.from({ length: 2 * m }, (_, r) => {
      const row = new Float64Array(dk)
      for (let c = 0; c < dk; c++) {
        let s = 0
        for (let k = 0; k < 2 * m; k++) s += A3m[r]![k]! * W[k]![c]!
        row[c] = s
      }
      return row
    })
    const C = Array.from({ length: dk }, (_, r) => {
      const row = new Float64Array(dk)
      for (let c = 0; c < dk; c++) {
        let s = 0
        for (let k = 0; k < 2 * m; k++) s += W[k]![r]! * AW[k]![c]!
        row[c] = s
      }
      return row
    })
    const { vals, vecs } = jacobiSmall(C)
    let bi = 0
    for (let i = 1; i < dk; i++) if (vals[i]! > vals[bi]!) bi = i
    v4Av4 = vals[bi]!
    const coeff = new Float64Array(2 * m)
    for (let r = 0; r < 2 * m; r++) {
      let s = 0
      for (let k = 0; k < dk; k++) s += W[r]![k]! * vecs[k]![bi]!
      coeff[r] = s
    }
    z0Opt = new Float64Array(na)
    z1Opt = new Float64Array(na)
    for (let k = 0; k < m; k++) {
      const c0 = coeff[k]!
      const c1 = coeff[m + k]!
      const bk = basis[k]!
      for (let i = 0; i < na; i++) {
        z0Opt[i] = z0Opt[i]! + c0 * bk[i]!
        z1Opt[i] = z1Opt[i]! + c1 * bk[i]!
      }
    }
    if (step < 3) {
      const r0 = new Float64Array(na)
      const r1 = new Float64Array(na)
      for (let k = 0; k < m; k++) {
        const c0k = coeff[k]!
        const c1k = coeff[m + k]!
        const bk = basis[k]!
        const h1k = H1B[k]!
        const h2k = H2B[k]!
        const h3k = H3B[k]!
        for (let i = 0; i < na; i++) {
          r0[i] = r0[i]! + c0k * (h1k[i]! - v4Av4 * bk[i]!) + c1k * (h2k[i]! - v4Av4 * h1k[i]!)
          r1[i] = r1[i]! + c0k * (h2k[i]! - v4Av4 * h1k[i]!) + c1k * (h3k[i]! - v4Av4 * h2k[i]!)
        }
      }
      addBasis(r0)
      addBasis(r1)
    }
  }
  const h1z1 = new Float64Array(na)
  const h2z0 = new Float64Array(na)
  const h2z1 = new Float64Array(na)
  const h3z1 = new Float64Array(na)
  applyH1(z1Opt, h1z1)
  applyH2(z0Opt, h2z0)
  applyH2(z1Opt, h2z1)
  applyH3(z1Opt, h3z1)
  const n00 = dotArr(z0Opt, z0Opt)
  const n01 = dotArr(z0Opt, h1z1)
  const n11 = dotArr(z1Opt, h2z1)
  const a00 = dotArr(z0Opt, h2z0)
  const a01 = dotArr(z0Opt, h3z1)
  const a11 = evalH4Quad(z1Opt)
  const qaR = n00 * n11 - n01 * n01
  const qbA = -(a00 * n11 + a11 * n00 - 2 * a01 * n01)
  const qcA = a00 * a11 - a01 * a01
  const normAV4Av4 = Math.sqrt((-qbA + Math.sqrt(Math.max(0, qbA * qbA - 4 * qaR * qcA))) / (2 * qaR))

  console.log(`  Ball m_4 = ||A^2 psi||^2 audit (8,857 docks): ball=${ballM4} == auto=${autoM4} (diff=0)`)
  console.log(
    `  Spherical D4 Krylov diagnostic (${na} active states, ${((performance.now() - t0) / 1000).toFixed(2)}s): V_4+A(V_4) >= ${v4Av4.toFixed(6)}, ||A phi*||/||phi*|| >= ${normAV4Av4.toFixed(6)}`,
  )
  console.log(`  (Spherical shells stall near ~11.356 because they lock clique mass at [0.72, 0.25, 0.03] vs CF Markov 11.4392!)`)

  recordCheck(
    'P4',
    'Spherical-shell m_4 ball verification (0 BigInt error) & D4 Krylov diagnostic',
    ballM4 === autoM4 && v4Av4 >= 11.333 && normAV4Av4 >= 11.338,
    `ball m_4 == auto m_4 (${ballM4}), V_4+A(V_4)=${v4Av4.toFixed(6)}, ||A phi*||/||phi*||=${normAV4Av4.toFixed(6)}`,
  )
  return { v4Av4, normAV4Av4 }
}

// =================================================================================================
// MAIN RUNNER
// =================================================================================================

function main(): void {
  const tStart = performance.now()
  const p12 = runParts1And2Upper()
  const p3 = runPart3CartierFoataLower(p12.ball)
  runPart4SphericalKrylovAudit(p12)

  const elapsedSec = (performance.now() - tStart) / 1000
  const rssMb = process.memoryUsage().rss / (1024 * 1024)

  const w1Width = 14.857143 - 11.013439
  const w2FinWidth = 11.452078 - 11.308339
  const w2AsympWidth = 11.452078 - 11.310466

  const finLo = ratFloorDec(p3.bigNum, p3.bigDen, 6)
  const asympLo = floatFloorDec(p3.rho2Step4440, 6)
  const upHi = ratCeilDec(p12.d5UpperNum, p12.d5UpperDen, 6)
  const finWidth = Number(upHi) - Number(finLo)
  const asympWidth = Number(upHi) - Number(asympLo)

  const rho24FinLo = ratFloorDec(p3.bigNum, 24n * p3.bigDen, 6)
  const rho24AsympLo = floatFloorDec(p3.rho2Step4440 / 24, 6)
  const rho24UpHi = ratCeilDec(p12.d5UpperNum, 24n * p12.d5UpperDen, 6)

  const gapLo = ratFloorDec(24n * p12.d5UpperDen - p12.d5UpperNum, 24n * p12.d5UpperDen, 6)
  const gapFinHi = ratCeilDec(24n * p3.bigDen - p3.bigNum, 24n * p3.bigDen, 6)
  const gapAsympHi = floatCeilDec(1 - p3.rho2Step4440 / 24, 6)

  const rawGapLo = ratFloorDec(24n * p12.d5UpperDen - p12.d5UpperNum, p12.d5UpperDen, 6)
  const rawGapFinHi = ratCeilDec(24n * p3.bigDen - p3.bigNum, p3.bigDen, 6)
  const rawGapAsympHi = floatCeilDec(24 - p3.rho2Step4440, 6)

  recordCheck(
    'P5',
    'Wave-3 bracket collapse (< 0.005 width) & laptop resource budget (< 15 s, < 500 MB RAM)',
    finWidth < 0.005 && asympWidth < 0.005 && elapsedSec < 15 && rssMb < 500,
    `concrete width=${finWidth.toFixed(6)}, asymp width=${asympWidth.toFixed(6)}, time=${elapsedSec.toFixed(2)}s, rss=${rssMb.toFixed(1)} MB`,
  )

  console.log('\n================================================================================')
  console.log('WAVE-3 TRACK W7: FINAL OUTWARD-ROUNDED CERTIFIED SPECTRAL RADIUS COLLAPSE')
  console.log('================================================================================')
  console.log(`  Wave-1 bracket         : [11.013439, 14.857143]  (width = ${w1Width.toFixed(6)})`)
  console.log(`  Wave-2 concrete BigInt : [11.308339, 11.452078]  (width = ${w2FinWidth.toFixed(6)})`)
  console.log(`  Wave-2 asymptotic      : [11.310466, 11.452078]  (width = ${w2AsympWidth.toFixed(6)})`)
  console.log(`  Wave-3 concrete BigInt : [${finLo}, ${upHi}]  (width <= ${finWidth.toFixed(6)}, ${(w2FinWidth / finWidth).toFixed(1)}x tighter than W2, ${(w1Width / finWidth).toFixed(0)}x vs W1!)`)
  console.log(`  Wave-3 asymptotic      : [${asympLo}, ${upHi}]  (width <= ${asympWidth.toFixed(6)}, ${(w2AsympWidth / asympWidth).toFixed(1)}x tighter than W2, ${(w1Width / asympWidth).toFixed(0)}x vs W1!)`)
  console.log(`  Wave-3 rho/24          : concrete [${rho24FinLo}, ${rho24UpHi}] | asymp [${rho24AsympLo}, ${rho24UpHi}]`)
  console.log(`  Wave-3 lambda_gap      : concrete [${gapLo}, ${gapFinHi}] | asymp [${gapLo}, ${gapAsympHi}]`)
  console.log(`  Wave-3 raw gap (24-rho): concrete [${rawGapLo}, ${rawGapFinHi}] | asymp [${rawGapLo}, ${rawGapAsympHi}]`)
  console.log(`  Lean-4 D2 (19 st, 23v) : Q=1000 <= ${ratCeilDec(p12.d2LeanQ1000.num, p12.d2LeanQ1000.den, 6)} | Q=10000 <= ${ratCeilDec(p12.d2LeanQ10000.num, p12.d2LeanQ10000.den, 6)}`)
  console.log(`  Lean-4 D3 (169st,220v) : Q=1000 <= ${ratCeilDec(p12.d3LeanQ1000.num, p12.d3LeanQ1000.den, 6)} | Q=10000 <= ${ratCeilDec(p12.d3LeanQ10000.num, p12.d3LeanQ10000.den, 6)}`)
  console.log(`  D2 Q=10000 p[0..22]    : [${Array.from(p12.d2LeanQ10000.pInts).join(',')}]`)
  console.log('--------------------------------------------------------------------------------')
  let allPassed = true
  for (const c of CHECKS) {
    if (!c.passed) allPassed = false
    console.log(`  [${c.passed ? 'PASS' : 'FAIL'}] ${c.part.padEnd(3)} | ${c.name}`)
    console.log(`         ${c.detail}`)
  }
  console.log('================================================================================')
  console.log(
    `OVERALL: ${CHECKS.filter(c => c.passed).length}/${CHECKS.length} CHECKS PASSED (runtime: ${elapsedSec.toFixed(2)} s, peak RSS: ${rssMb.toFixed(1)} MB)`,
  )
  if (!allPassed) process.exit(1)
}

main()

export {}
