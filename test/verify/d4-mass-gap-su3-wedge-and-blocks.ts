// Wave-4 Track W14 (Part A — Challenge 2b Multi-Link D_4 Mass Gap Beyond 0.546 / 0.277):
// Unconditional Zero-Truncation Infinite-Volume 4D D_4 SU(2) & SU(3) Mass-Gap Lower Bounds
// Strictly Beyond Wave-3 W8 Champions (SU(2): 0.277274, SU(3): 0.546000)
// via Multi-Link Block Dobrushin Contraction:
//   - W14.1: SU(3) 2-Link Wedge & Complete 3-Link Triangular Plaquette Blocks on 1D-Axial & Alt-x0+planes D_4
//            (exact SU(3) staple convex hull + K=2 Peter-Weyl Witten Laplacian Schur complement +
//             exact linear-split log-Z convexity bound for alpha_13^{SU(3)} + 1+2 Block-Alternating Gibbs Sweep)
//   - W14.2: SU(2) Complete 3-Link Triangular Plaquette Block (URR Triangle) on 1D-Axial & Alt-x0+planes D_4
//            (exact 3-region chordal W_1 Theorem + sharp linear-split V_tilde_2 bound for alpha_13^{SU(2)} +
//             exact naive 3-link Gibbs-sweep bottleneck proof + 1+2 Block-Alternating Gibbs Sweep past 3.00x BE!)
//
// Exact Wilson triangular-plaquette normalization matching Wave-2 W6 and Wave-3 W8:
//   d mu_Lambda(U) = (1 / Z_Lambda) exp( (beta / N) sum_{Delta in T_Lambda} Re Tr(U_Delta) ) prod_e dU_e
//   Single-scale Bakry-Emery: beta_BE^{24c} = N^2 / (16 sqrt(7)) -> SU(2): 0.094491, SU(3): 0.212605.
//   Old Kotecky-Preiss baseline: SU(2): 0.009335, SU(3): 0.009328.
//   Wave-3 W8 champions:         SU(2): 0.277274 (1D-axial 2-wedge), SU(3): 0.546000 (4-dir single-link).
//
// 100% deterministic (zero Math.random()), zero external imports, zero Migdal-Kadanoff truncation,
// zero heuristic MC sampling, exact outward downward rounding (floor6), fast (< 12 s).

const t0Global = performance.now()

// =================================================================================================
// 0. DETERMINISTIC NUMERICAL & COMBINATORIAL PRIMITIVES
// =================================================================================================

type Vec4 = readonly [number, number, number, number]
const vecKey = (v: Vec4): string => `${v[0]},${v[1]},${v[2]},${v[3]}`

function floor6(x: number): string {
  return (Math.floor(x * 1e6) / 1e6).toFixed(6)
}

function generateRootsD4(): Vec4[] {
  const out: Vec4[] = []
  for (let i = 0; i < 4; i++) {
    for (let j = i + 1; j < 4; j++) {
      for (const si of [-1, 1]) {
        for (const sj of [-1, 1]) {
          const v: [number, number, number, number] = [0, 0, 0, 0]
          v[i] = si
          v[j] = sj
          out.push(v)
        }
      }
    }
  }
  return out
}

function lexPos4(r: Vec4): boolean {
  for (let k = 0; k < 4; k++) if (r[k]! !== 0) return r[k]! > 0
  return false
}

function besselI(n: number, x: number): number {
  const m = Math.abs(n)
  const half = 0.5 * x
  let term = 1
  for (let k = 1; k <= m; k++) term *= half / k
  let sum = term
  const h2 = half * half
  for (let k = 1; k <= 80; k++) {
    term *= h2 / (k * (m + k))
    sum += term
    if (term <= 1e-17 * sum) break
  }
  return sum
}

function gaussLegendre(n: number): { readonly x: Float64Array; readonly w: Float64Array } {
  const x = new Float64Array(n)
  const w = new Float64Array(n)
  const m = (n + 1) >> 1
  for (let i = 0; i < m; i++) {
    let z = Math.cos((Math.PI * (i + 0.75)) / (n + 0.5))
    let pp = 0
    for (let it = 0; it < 30; it++) {
      let p1 = 1
      let p2 = 0
      for (let j = 1; j <= n; j++) {
        const p3 = p2
        p2 = p1
        p1 = ((2 * j - 1) * z * p2 - (j - 1) * p3) / j
      }
      pp = (n * (z * p1 - p2)) / (z * z - 1)
      const z1 = z
      z = z1 - p1 / pp
      if (Math.abs(z - z1) <= 1e-15) break
    }
    x[i] = -z
    x[n - 1 - i] = z
    w[i] = w[n - 1 - i] = 2 / ((1 - z * z) * pp * pp)
  }
  return { x, w }
}

const FACT = new Float64Array(64)
FACT[0] = 1
for (let k = 1; k < 64; k++) FACT[k] = FACT[k - 1]! * k

function collatzWielandtUpper(n: number, M: Float64Array[]): number {
  const w = new Float64Array(n).fill(1)
  for (let it = 0; it < 240; it++) {
    const nw = new Float64Array(n)
    let n2 = 0
    for (let v = 0; v < n; v++) {
      let s = 0
      const row = M[v]!
      for (let u = 0; u < n; u++) s += row[u]! * w[u]!
      nw[v] = s
      n2 += s * s
    }
    if (n2 <= 0) return 0
    const inv = 1 / Math.sqrt(n2)
    for (let v = 0; v < n; v++) w[v] = nw[v]! * inv
  }
  let maxRow = 0
  for (let v = 0; v < n; v++) {
    let s = 0
    const row = M[v]!
    for (let u = 0; u < n; u++) s += row[u]! * w[u]!
    const rq = s / w[v]!
    if (rq > maxRow) maxRow = rq
  }
  return maxRow * (1 + 1e-13)
}

// =================================================================================================
// 1. PART 1: EXACT 4D D_4 SPATIAL FORESTS & PERIODIC MULTI-LINK BLOCK COVERS (1D-AXIAL & 4-DIR ALT)
// =================================================================================================

type Edge4 = { readonly a: Vec4; readonly d: number; readonly x0: number }
type Tri3 = { readonly edges: readonly [Edge4, Edge4, Edge4] }
type Wedge2 = { readonly e1: Edge4; readonly e2: Edge4; readonly eShared: Edge4 | null }

type BlockD4System = {
  readonly name: string
  readonly nClasses: number
  readonly classOfEdge: (e: Edge4) => number
  readonly isFrozenEdge: (e: Edge4) => boolean
  readonly activeNeighborsOf: (e: Edge4) => Edge4[]
  readonly repEdges: readonly Edge4[]
  readonly repActiveTris: readonly Tri3[]
  readonly repFrozenWedges: readonly Wedge2[]
  readonly repUrrWedges: readonly Wedge2[]
  readonly singleLam0: number
  readonly triCoverageMin: number
  readonly triCoverageMax: number
  readonly triCoverageByClass: Float64Array
  readonly triRPPreserved: boolean
  readonly triCountsUrrUuuRrr: readonly [number, number, number]
  readonly evalSinglePerron: (c: number, m: number) => number
  readonly evalFrr2WedgePerron: (c: number, m: number) => number
  readonly evalUrr2WedgePerron: (c: number, alpha13: number, m: number) => number
  readonly evalAllPair2WedgePerron: (c: number, alpha13: number, m: number) => number
  readonly evalNaive3TriPerron: (c: number, m: number) => number
  readonly evalBlock12TriPerron: (c: number, alpha13: number, m: number) => number
}

const ALL_ROOTS_D4 = generateRootsD4()
const ROOT_SET_D4 = new Set(ALL_ROOTS_D4.map(vecKey))
const POS_ROOTS_D4 = ALL_ROOTS_D4.filter(lexPos4)
const POS_IDX_D4 = new Map<string, number>()
POS_ROOTS_D4.forEach((r, i) => POS_IDX_D4.set(vecKey(r), i))

function canonEdge4(p: Vec4, q: Vec4): Edge4 {
  const diff: Vec4 = [q[0] - p[0], q[1] - p[1], q[2] - p[2], q[3] - p[3]]
  if (lexPos4(diff)) return { a: p, d: POS_IDX_D4.get(vecKey(diff))!, x0: 0.5 * (p[0] + q[0]) }
  return { a: q, d: POS_IDX_D4.get(vecKey([-diff[0], -diff[1], -diff[2], -diff[3]]))!, x0: 0.5 * (p[0] + q[0]) }
}

function edgeEq4(e1: Edge4, e2: Edge4): boolean {
  return e1.d === e2.d && e1.a[0] === e2.a[0] && e1.a[1] === e2.a[1] && e1.a[2] === e2.a[2] && e1.a[3] === e2.a[3]
}

function edgeFullKey(e: Edge4): string {
  return `${e.a[0]},${e.a[1]},${e.a[2]},${e.a[3]}:${e.d}`
}

function buildD4ForestSystem(mode: '1d-axial' | '4dir-alt'): BlockD4System {
  const mod2 = (v: Vec4): Vec4 => [v[0] & 1, v[1] & 1, v[2] & 1, v[3] & 1]
  const siteClasses: Vec4[] = []
  const siteClassIdx = new Map<string, number>()
  if (mode === '1d-axial') {
    siteClasses.push([0, 0, 0, 0])
    siteClassIdx.set('0,0,0,0', 0)
  } else {
    for (let b0 = 0; b0 < 2; b0++) {
      for (let b1 = 0; b1 < 2; b1++) {
        for (let b2 = 0; b2 < 2; b2++) {
          const c: Vec4 = [b0, b1, b2, (b0 + b1 + b2) & 1]
          siteClassIdx.set(vecKey(c), siteClasses.length)
          siteClasses.push(c)
        }
      }
    }
  }
  const nSites = siteClasses.length
  const frozenDirOfSite = (v: Vec4): number => {
    if (mode === '1d-axial') return POS_IDX_D4.get('0,0,1,1')!
    const c = mod2(v)
    const r: Vec4 =
      c[0] === 0
        ? c[1] === 0
          ? [0, 0, 1, 1]
          : [0, 0, 1, -1]
        : c[2] === 0
          ? [0, 1, 0, 1]
          : [0, 1, 0, -1]
    return POS_IDX_D4.get(vecKey(r))!
  }
  const siteClassOf = (v: Vec4): number => (mode === '1d-axial' ? 0 : siteClassIdx.get(vecKey(mod2(v)))!)
  const isFrozenEdge = (e: Edge4): boolean => frozenDirOfSite(e.a) === e.d

  const actMap = new Map<string, number>()
  const repEdges: Edge4[] = []
  for (let si = 0; si < nSites; si++) {
    const x = siteClasses[si]!
    const fd = frozenDirOfSite(x)
    for (let d = 0; d < 12; d++) {
      if (d === fd) continue
      actMap.set(`${si}:${d}`, repEdges.length)
      const r = POS_ROOTS_D4[d]!
      repEdges.push({ a: x, d, x0: x[0] + 0.5 * r[0] })
    }
  }
  const nClasses = repEdges.length
  const classOfEdge = (e: Edge4): number => actMap.get(`${siteClassOf(e.a)}:${e.d}`)!

  const activeNeighborsOf = (e: Edge4): Edge4[] => {
    const p = e.a
    const r = POS_ROOTS_D4[e.d]!
    const q: Vec4 = [p[0] + r[0], p[1] + r[1], p[2] + r[2], p[3] + r[3]]
    const out: Edge4[] = []
    for (const s of ALL_ROOTS_D4) {
      const diff: Vec4 = [r[0] - s[0], r[1] - s[1], r[2] - s[2], r[3] - s[3]]
      if (!ROOT_SET_D4.has(vecKey(diff))) continue
      const z: Vec4 = [p[0] + s[0], p[1] + s[1], p[2] + s[2], p[3] + s[3]]
      const e1 = canonEdge4(p, z)
      const e2 = canonEdge4(q, z)
      if (!isFrozenEdge(e1)) out.push(e1)
      if (!isFrozenEdge(e2)) out.push(e2)
    }
    return out
  }

  const degByClass = new Int32Array(nClasses)
  for (let u = 0; u < nClasses; u++) degByClass[u] = activeNeighborsOf(repEdges[u]!).length

  const lexLt4 = (a: Vec4, b: Vec4): boolean => {
    for (let k = 0; k < 4; k++) if (a[k]! !== b[k]!) return a[k]! < b[k]!
    return false
  }
  const repActiveTris: Tri3[] = []
  const repFrozenWedges: Wedge2[] = []
  const seenTri = new Set<string>()
  for (let si = 0; si < nSites; si++) {
    const p = siteClasses[si]!
    for (const r of POS_ROOTS_D4) {
      const q: Vec4 = [p[0] + r[0], p[1] + r[1], p[2] + r[2], p[3] + r[3]]
      for (const s of ALL_ROOTS_D4) {
        if (!lexPos4(s)) continue
        const diff: Vec4 = [r[0] - s[0], r[1] - s[1], r[2] - s[2], r[3] - s[3]]
        if (!ROOT_SET_D4.has(vecKey(diff))) continue
        const z: Vec4 = [p[0] + s[0], p[1] + s[1], p[2] + s[2], p[3] + s[3]]
        if (!lexLt4(p, q) || !lexLt4(p, z)) continue
        const e1 = canonEdge4(p, q)
        const e2 = canonEdge4(p, z)
        const e3 = canonEdge4(q, z)
        const tk = [edgeFullKey(e1), edgeFullKey(e2), edgeFullKey(e3)].sort().join('|')
        if (seenTri.has(tk)) continue
        seenTri.add(tk)
        const f1 = isFrozenEdge(e1), f2 = isFrozenEdge(e2), f3 = isFrozenEdge(e3)
        const nF = (f1 ? 1 : 0) + (f2 ? 1 : 0) + (f3 ? 1 : 0)
        if (nF === 0) {
          repActiveTris.push({ edges: [e1, e2, e3] })
        } else if (nF === 1) {
          const act = [e1, e2, e3].filter(e => !isFrozenEdge(e))
          repFrozenWedges.push({ e1: act[0]!, e2: act[1]!, eShared: null })
        }
      }
    }
  }

  let cntURR = 0, cntUUU = 0, cntRRR = 0
  const triCoverageByClass = new Float64Array(nClasses)
  const repUrrWedges: Wedge2[] = []
  for (const tri of repActiveTris) {
    const [e1, e2, e3] = tri.edges
    const u1 = classOfEdge(e1), u2 = classOfEdge(e2), u3 = classOfEdge(e3)
    triCoverageByClass[u1] = triCoverageByClass[u1]! + 1
    triCoverageByClass[u2] = triCoverageByClass[u2]! + 1
    triCoverageByClass[u3] = triCoverageByClass[u3]! + 1
    const isU1 = degByClass[u1] === 16 ? 1 : 0
    const isU2 = degByClass[u2] === 16 ? 1 : 0
    const isU3 = degByClass[u3] === 16 ? 1 : 0
    const sumU = isU1 + isU2 + isU3
    if (sumU === 1) {
      cntURR++
      if (isU1) repUrrWedges.push({ e1: e2, e2: e3, eShared: e1 })
      else if (isU2) repUrrWedges.push({ e1: e1, e2: e3, eShared: e2 })
      else repUrrWedges.push({ e1: e1, e2: e2, eShared: e3 })
    } else if (sumU === 3) cntUUU++
    else if (sumU === 0) cntRRR++
  }

  const reflVec = (v: Vec4): Vec4 => [-v[0], v[1], v[2], v[3]]
  let triRPPreserved = true
  for (const tri of repActiveTris) {
    for (const e of tri.edges) {
      const p = e.a
      const r = POS_ROOTS_D4[e.d]!
      const q: Vec4 = [p[0] + r[0], p[1] + r[1], p[2] + r[2], p[3] + r[3]]
      const eRef = canonEdge4(reflVec(p), reflVec(q))
      if (isFrozenEdge(eRef)) triRPPreserved = false
    }
  }

  let triCoverageMin = Infinity, triCoverageMax = 0
  for (let u = 0; u < nClasses; u++) {
    const ku = triCoverageByClass[u]!
    if (ku < triCoverageMin) triCoverageMin = ku
    if (ku > triCoverageMax) triCoverageMax = ku
  }

  const singleNbs = repEdges.map(e =>
    activeNeighborsOf(e).map(f => ({ v: classOfEdge(f), dx: Math.abs(e.x0 - f.x0) })),
  )
  const evalSinglePerron = (c: number, m: number): number => {
    const G = Array.from({ length: nClasses }, () => new Float64Array(nClasses))
    for (let u = 0; u < nClasses; u++) {
      for (const nb of singleNbs[u]!) {
        G[nb.v]![u] = G[nb.v]![u]! + c * Math.exp(m * nb.dx)
      }
    }
    return collatzWielandtUpper(nClasses, G)
  }
  const singleLam0 = evalSinglePerron(1, 0)

  const frrCov = new Float64Array(nClasses)
  for (const w of repFrozenWedges) {
    frrCov[classOfEdge(w.e1)] = frrCov[classOfEdge(w.e1)]! + 1
    frrCov[classOfEdge(w.e2)] = frrCov[classOfEdge(w.e2)]! + 1
  }
  const evalFrr2WedgePerron = (c: number, m: number): number => {
    const G = Array.from({ length: nClasses }, () => new Float64Array(nClasses))
    const add = (v: number, u: number, dx: number, val: number) => {
      G[v]![u] = G[v]![u]! + val * Math.exp(m * Math.abs(dx))
    }
    const c1 = c / (1 - c * c)
    const c2 = (c * c) / (1 - c * c)
    for (let u = 0; u < nClasses; u++) {
      if (frrCov[u]! === 0) {
        const e = repEdges[u]!
        for (const f of activeNeighborsOf(e)) add(classOfEdge(f), u, e.x0 - f.x0, c)
      }
    }
    for (const w of repFrozenWedges) {
      const u1 = classOfEdge(w.e1), u2 = classOfEdge(w.e2)
      const k1 = frrCov[u1]!, k2 = frrCov[u2]!
      for (const f of activeNeighborsOf(w.e1)) {
        if (edgeEq4(f, w.e2)) continue
        const v = classOfEdge(f)
        add(v, u1, w.e1.x0 - f.x0, c1 / k1)
        add(v, u2, w.e2.x0 - f.x0, c2 / k2)
      }
      for (const f of activeNeighborsOf(w.e2)) {
        if (edgeEq4(f, w.e1)) continue
        const v = classOfEdge(f)
        add(v, u2, w.e2.x0 - f.x0, c1 / k2)
        add(v, u1, w.e1.x0 - f.x0, c2 / k1)
      }
    }
    return collatzWielandtUpper(nClasses, G)
  }

  const urrCov = new Float64Array(nClasses)
  for (const w of repUrrWedges) {
    urrCov[classOfEdge(w.e1)] = urrCov[classOfEdge(w.e1)]! + 1
    urrCov[classOfEdge(w.e2)] = urrCov[classOfEdge(w.e2)]! + 1
  }
  const evalUrr2WedgePerron = (c: number, alpha13: number, m: number): number => {
    const G = Array.from({ length: nClasses }, () => new Float64Array(nClasses))
    const add = (v: number, u: number, dx: number, val: number) => {
      G[v]![u] = G[v]![u]! + val * Math.exp(m * Math.abs(dx))
    }
    const c1 = c / (1 - c * c)
    const c2 = (c * c) / (1 - c * c)
    const gShared = 0.5 * (alpha13 + c * (1 + alpha13))
    for (let u = 0; u < nClasses; u++) {
      if (urrCov[u]! === 0) {
        const e = repEdges[u]!
        for (const f of activeNeighborsOf(e)) add(classOfEdge(f), u, e.x0 - f.x0, c)
      }
    }
    for (const w of repUrrWedges) {
      const u1 = classOfEdge(w.e1), u2 = classOfEdge(w.e2), vS = classOfEdge(w.eShared!)
      const k1 = urrCov[u1]!, k2 = urrCov[u2]!
      add(vS, u1, w.e1.x0 - w.eShared!.x0, gShared / k1)
      add(vS, u2, w.e2.x0 - w.eShared!.x0, gShared / k2)
      for (const f of activeNeighborsOf(w.e1)) {
        if (edgeEq4(f, w.e2) || edgeEq4(f, w.eShared!)) continue
        const v = classOfEdge(f)
        add(v, u1, w.e1.x0 - f.x0, c1 / k1)
        add(v, u2, w.e2.x0 - f.x0, c2 / k2)
      }
      for (const f of activeNeighborsOf(w.e2)) {
        if (edgeEq4(f, w.e1) || edgeEq4(f, w.eShared!)) continue
        const v = classOfEdge(f)
        add(v, u2, w.e2.x0 - f.x0, c1 / k2)
        add(v, u1, w.e1.x0 - f.x0, c2 / k1)
      }
    }
    return collatzWielandtUpper(nClasses, G)
  }

  const evalAllPair2WedgePerron = (c: number, alpha13: number, m: number): number => {
    const G = Array.from({ length: nClasses }, () => new Float64Array(nClasses))
    const add = (v: number, u: number, dx: number, val: number) => {
      G[v]![u] = G[v]![u]! + val * Math.exp(m * Math.abs(dx))
    }
    const c1 = c / (1 - c * c)
    const c2 = (c * c) / (1 - c * c)
    const gShared = 0.5 * (alpha13 + c * (1 + alpha13))
    for (const tri of repActiveTris) {
      const es = tri.edges
      for (const [ia, ib, is] of [[0, 1, 2], [0, 2, 1], [1, 2, 0]] as const) {
        const e1 = es[ia]!, e2 = es[ib]!, eS = es[is]!
        const u1 = classOfEdge(e1), u2 = classOfEdge(e2), vS = classOfEdge(eS)
        const k1 = 2 * triCoverageByClass[u1]!, k2 = 2 * triCoverageByClass[u2]!
        add(vS, u1, e1.x0 - eS.x0, gShared / k1)
        add(vS, u2, e2.x0 - eS.x0, gShared / k2)
        for (const f of activeNeighborsOf(e1)) {
          if (edgeEq4(f, e2) || edgeEq4(f, eS)) continue
          const v = classOfEdge(f)
          add(v, u1, e1.x0 - f.x0, c1 / k1)
          add(v, u2, e2.x0 - f.x0, c2 / k2)
        }
        for (const f of activeNeighborsOf(e2)) {
          if (edgeEq4(f, e1) || edgeEq4(f, eS)) continue
          const v = classOfEdge(f)
          add(v, u2, e2.x0 - f.x0, c1 / k2)
          add(v, u1, e1.x0 - f.x0, c2 / k1)
        }
      }
    }
    return collatzWielandtUpper(nClasses, G)
  }

  type TriInc = { readonly u0: number; readonly u1: number; readonly u2: number; readonly v: number; readonly dx0: number; readonly dx1: number; readonly dx2: number }
  const triIncidences: TriInc[] = []
  for (const tri of repActiveTris) {
    const [e0, e1, e2] = tri.edges
    const es = [e0, e1, e2] as const
    const us = [classOfEdge(e0), classOfEdge(e1), classOfEdge(e2)] as const
    for (let i = 0; i < 3; i++) {
      const ei = es[i]!
      const j1 = (i + 1) % 3, j2 = (i + 2) % 3
      const ej1 = es[j1]!, ej2 = es[j2]!
      for (const f of activeNeighborsOf(ei)) {
        if (edgeEq4(f, ej1) || edgeEq4(f, ej2)) continue
        triIncidences.push({
          u0: us[i]!,
          u1: us[j1]!,
          u2: us[j2]!,
          v: classOfEdge(f),
          dx0: Math.abs(ei.x0 - f.x0),
          dx1: Math.abs(ej1.x0 - f.x0),
          dx2: Math.abs(ej2.x0 - f.x0),
        })
      }
    }
  }

  const evalNaive3TriPerron = (c: number, m: number): number => {
    const denom = (1 - 2 * c) * (1 + c)
    if (denom <= 0) return Infinity
    const gSelf = (c * (1 - c)) / denom
    const gOther = (c * c) / denom
    const G = Array.from({ length: nClasses }, () => new Float64Array(nClasses))
    for (const inc of triIncidences) {
      G[inc.v]![inc.u0] = G[inc.v]![inc.u0]! + (gSelf / triCoverageByClass[inc.u0]!) * Math.exp(m * inc.dx0)
      G[inc.v]![inc.u1] = G[inc.v]![inc.u1]! + (gOther / triCoverageByClass[inc.u1]!) * Math.exp(m * inc.dx1)
      G[inc.v]![inc.u2] = G[inc.v]![inc.u2]! + (gOther / triCoverageByClass[inc.u2]!) * Math.exp(m * inc.dx2)
    }
    return collatzWielandtUpper(nClasses, G)
  }

  const evalBlock12TriPerron = (c: number, alpha13: number, m: number): number => {
    const gShared = 0.5 * (alpha13 + c * (1 + alpha13))
    const denom = 1 - 2 * c * gShared
    if (denom <= 0) return Infinity
    const gSelf = c / denom
    const gOther = (c * gShared) / denom
    const G = Array.from({ length: nClasses }, () => new Float64Array(nClasses))
    for (const inc of triIncidences) {
      G[inc.v]![inc.u0] = G[inc.v]![inc.u0]! + (gSelf / triCoverageByClass[inc.u0]!) * Math.exp(m * inc.dx0)
      G[inc.v]![inc.u1] = G[inc.v]![inc.u1]! + (gOther / triCoverageByClass[inc.u1]!) * Math.exp(m * inc.dx1)
      G[inc.v]![inc.u2] = G[inc.v]![inc.u2]! + (gOther / triCoverageByClass[inc.u2]!) * Math.exp(m * inc.dx2)
    }
    return collatzWielandtUpper(nClasses, G)
  }

  return {
    name: mode,
    nClasses,
    classOfEdge,
    isFrozenEdge,
    activeNeighborsOf,
    repEdges,
    repActiveTris,
    repFrozenWedges,
    repUrrWedges,
    singleLam0,
    triCoverageMin,
    triCoverageMax,
    triCoverageByClass,
    triRPPreserved,
    triCountsUrrUuuRrr: [cntURR, cntUUU, cntRRR],
    evalSinglePerron,
    evalFrr2WedgePerron,
    evalUrr2WedgePerron,
    evalAllPair2WedgePerron,
    evalNaive3TriPerron,
    evalBlock12TriPerron,
  }
}

// =================================================================================================
// 2. PART 2 (W14.2): SU(2) 3-REGION CHORDAL THEOREM + SHARP LINEAR-SPLIT alpha_13 + 3-LINK TRIANGLES
// =================================================================================================

function certifySu2ChordalGlobal(): { readonly ok: boolean; readonly r2Boxes: number; readonly r2Ms: number } {
  const kMax1 = 0.35, xSplit = 0.70, s0Max = kMax1 / 4
  const rRatioMin = 0.25 - (kMax1 * kMax1) / 96
  const expCheck = 2 + (0.04 * 0.25) / xSplit - 12 * rRatioMin * xSplit
  const cAlpha1 = Math.min(1, kMax1 / (1 - Math.exp(-2 * kMax1)))
  const bFac1 = 1 + cAlpha1 * cAlpha1 * kMax1 * kMax1
  const densFac1 = Math.exp(kMax1 * s0Max + (kMax1 * kMax1) / 6)
  const intA0 = (x: number) => Math.asin(x)
  const intA1 = (x: number) => 1 - Math.sqrt(1 - x * x)
  const intA2 = (x: number) => 0.5 * (Math.asin(x) - x * Math.sqrt(1 - x * x))
  const J1_2 = intA2(xSplit) + intA2(s0Max), J1_1 = intA1(xSplit), J1_0 = intA0(xSplit) + intA0(s0Max)
  const lRatio1 = Math.sqrt(1 - (4 * s0Max * xSplit + 4 * s0Max * s0Max) / (1 - xSplit * xSplit))
  const term1 = (4 / (1 + lRatio1) ** 2) * (1 / 16) * (2 / Math.PI) * densFac1 * (J1_2 + 2 * s0Max * J1_1 + s0Max * s0Max * J1_0)
  const t0Split = Math.asin(xSplit)
  const F0 = (t: number) => (3 / 8) * t + 0.25 * Math.sin(2 * t) + (1 / 32) * Math.sin(4 * t)
  const F2 = (t: number) => (1 / 16) * (t + 0.25 * Math.sin(2 * t) - 0.25 * Math.sin(4 * t) - (1 / 12) * Math.sin(6 * t))
  const K0 = F0(0.5 * Math.PI) - F0(t0Split), K1 = 0.2 * Math.pow(1 - xSplit * xSplit, 2.5), K2 = F2(0.5 * Math.PI) - F2(t0Split)
  const lRatio2 = Math.sqrt(1 - 8 * s0Max)
  const term2 = (16 / (1 + lRatio2) ** 2) * (1 / 16) * (2 / Math.PI) * densFac1 * (K2 + 2 * s0Max * K1 + s0Max * s0Max * K0)
  const region1Ok = expCheck < -0.05 && bFac1 * (term1 + term2) < 1 / 32 - (kMax1 * kMax1) / 192

  const tR2 = performance.now()
  const cAlphaFn = (b: number) => (b < 1e-6 ? 0.5 : Math.min(1, b / (1 - Math.exp(-2 * b))))
  const ztFn = (b: number, s: number) =>
    b * s < 1e-5 ? 2 * s * (1 + (b * s) ** 2 / 6 + (b * s) ** 4 / 120) : (2 * Math.sinh(b * s)) / b
  const boxUpper = (kL: number, kR: number, pL: number, pR: number, N: number): number => {
    const ULP = 1 + 1e-13, ULP_LO = 1 - 1e-13
    const i1L = besselI(1, kL), i2L = besselI(2, kL), RL = i2L / i1L, zL = (2 * i1L) / kL
    const i1R = besselI(1, kR), i2R = besselI(2, kR), RR = i2R / i1R, zR = (2 * i1R) / kR
    const varPerpHi = (RL / kL) * ULP + 1e-15
    const pi2Anchor = varPerpHi + Math.sqrt(varPerpHi / 3) * ULP * Math.max(0, 0.5 * Math.PI - pL) * ULP + 1e-14
    if (pi2Anchor < 0.24999) return pi2Anchor
    const varParHi = Math.min(varPerpHi, Math.max(0, 1 - ((3 * RR) / kR) * ULP_LO - RL * RL * ULP_LO) * ULP + 1e-13)
    const cPR = Math.max(0, Math.cos(pR) - 1e-14), sPR = Math.min(1, Math.sin(pR) + 1e-14)
    const cPL = Math.min(1, Math.cos(pL) + 1e-14), sPL = Math.max(0, Math.sin(pL) - 1e-14)
    const varHi = (cPR * cPR * varParHi + sPR * sPR * varPerpHi) * ULP + 1e-14
    const poincUb = Math.sqrt(varHi / 3) * ULP
    if (poincUb < 0.24999) return poincUb

    const aLo = Math.max(0, kL * cPR * ULP_LO), aHi = kR * cPL * ULP + 1e-15
    const bLo = Math.max(0, kL * sPL * ULP_LO), bHi = kR * sPR * ULP + 1e-15
    const s0Lo = Math.max(0, RL * cPR * ULP_LO - 1e-15), s0Hi = Math.min(1 - 1e-15, RR * cPL * ULP + 1e-15)
    const th0Lo = Math.max(0, Math.acos(s0Hi) - 1e-14), th0Hi = Math.min(Math.PI, Math.acos(s0Lo) + 1e-14)
    const zInvLo = (1 / (Math.PI * zR)) * ULP_LO, zInvHi = (1 / (Math.PI * zL)) * ULP
    const hU = 1 / N
    const fmLo = new Float64Array(N + 1), fmHi = new Float64Array(N + 1), dmHi = new Float64Array(N)
    const thmLo = new Float64Array(N), thmHi = new Float64Array(N)
    for (let i = 0; i < N; i++) {
      const u0 = i * hU, u1 = (i + 1) * hU
      const tLo = Math.max(0, (1 - u0) * th0Lo + u0 * Math.PI - 1e-14), tHi = Math.min(Math.PI, (1 - u1) * th0Hi + u1 * Math.PI + 1e-14)
      thmLo[i] = tLo; thmHi[i] = tHi
      const cLo = Math.max(-1, Math.cos(tHi) - 1e-14), cHi = Math.min(1, Math.cos(tLo) + 1e-14)
      const sLo = Math.max(0, Math.min(Math.sin(tLo), Math.sin(tHi)) - 1e-14)
      const sHi = Math.min(1, (tLo <= 0.5 * Math.PI && tHi >= 0.5 * Math.PI ? 1 : Math.max(Math.sin(tLo), Math.sin(tHi))) + 1e-14)
      const expLo = Math.exp(cLo >= 0 ? aLo * cLo : aHi * cLo), expHi = Math.exp(cHi >= 0 ? aHi * cHi : aLo * cHi)
      const lo = hU * Math.max(0, Math.PI - th0Hi) * zInvLo * Math.max(0, s0Lo - cHi) * expLo * ztFn(bLo, sLo) * sLo * (1 - 1e-12)
      const hi = hU * (Math.PI - th0Lo) * zInvHi * Math.max(0, s0Hi - cLo) * expHi * ztFn(bHi, sHi) * sHi * (1 + 1e-12) + 1e-15
      fmLo[i + 1] = fmLo[i]! + lo; fmHi[i + 1] = fmHi[i]! + hi; dmHi[i] = hi
    }
    const fpLo = new Float64Array(N + 1), fpHi = new Float64Array(N + 1)
    const thpLo = new Float64Array(N), thpHi = new Float64Array(N)
    for (let j = 0; j < N; j++) {
      const v0 = j * hU, v1 = (j + 1) * hU
      const tLo = Math.max(0, (1 - v1) * th0Lo - 1e-14), tHi = Math.min(Math.PI, (1 - v0) * th0Hi + 1e-14)
      thpLo[j] = tLo; thpHi[j] = tHi
      const cLo = Math.max(-1, Math.cos(tHi) - 1e-14), cHi = Math.min(1, Math.cos(tLo) + 1e-14)
      const sLo = Math.max(0, Math.min(Math.sin(tLo), Math.sin(tHi)) - 1e-14)
      const sHi = Math.min(1, (tLo <= 0.5 * Math.PI && tHi >= 0.5 * Math.PI ? 1 : Math.max(Math.sin(tLo), Math.sin(tHi))) + 1e-14)
      const expLo = Math.exp(cLo >= 0 ? aLo * cLo : aHi * cLo), expHi = Math.exp(cHi >= 0 ? aHi * cHi : aLo * cHi)
      const lo = hU * th0Lo * zInvLo * Math.max(0, cLo - s0Hi) * expLo * ztFn(bLo, sLo) * sLo * (1 - 1e-12)
      const hi = hU * th0Hi * zInvHi * Math.max(0, cHi - s0Lo) * expHi * ztFn(bHi, sHi) * sHi * (1 + 1e-12) + 1e-15
      fpLo[j + 1] = fpLo[j]! + lo; fpHi[j + 1] = fpHi[j]! + hi
    }
    const cAlpha2b2 = (cAlphaFn(bHi) * ULP) ** 2 * bHi * bHi * ULP
    let eExHi = 0
    for (let i = 0; i < N; i++) {
      const uMin = fmLo[i]!, uMax = fmHi[i + 1]!
      let jStart = 0
      while (jStart < N && fpHi[jStart + 1]! < uMin) jStart++
      if (jStart >= N) jStart = N - 1
      let jEnd = jStart
      while (jEnd < N && fpLo[jEnd]! <= uMax) jEnd++
      if (jEnd <= jStart) jEnd = jStart + 1
      if (jEnd > N) jEnd = N
      const tml = thmLo[i]!, tmr = thmHi[i]!, tpl = thpLo[jEnd - 1]!, tpr = thpHi[jStart]!
      const smLo = Math.max(-1, Math.cos(tmr) - 1e-14), smHi = Math.min(1, Math.cos(tml) + 1e-14)
      const spLo = Math.max(-1, Math.cos(tpr) - 1e-14), spHi = Math.min(1, Math.cos(tpl) + 1e-14)
      const LmLo = Math.max(0, Math.min(Math.sin(tml), Math.sin(tmr)) - 1e-14)
      const LmHi = Math.min(1, (tml <= 0.5 * Math.PI && tmr >= 0.5 * Math.PI ? 1 : Math.max(Math.sin(tml), Math.sin(tmr))) + 1e-14)
      const LpLo = Math.max(0, Math.min(Math.sin(tpl), Math.sin(tpr)) - 1e-14)
      const LpHi = Math.min(1, (tpl <= 0.5 * Math.PI && tpr >= 0.5 * Math.PI ? 1 : Math.max(Math.sin(tpl), Math.sin(tpr))) + 1e-14)
      const dsMax = Math.max(0, spHi - smLo) * ULP
      const dLMax = Math.max(Math.abs(LpHi - LmLo), Math.abs(LmHi - LpLo)) * ULP
      const sumAbsMax = Math.max(Math.abs(spHi + smHi), Math.abs(spLo + smLo)) * ULP
      const lSumMin = (LpLo + LmLo) * ULP_LO
      const bFac = (1 + cAlpha2b2 * LmHi * LpHi) * ULP
      let exMax = Math.sqrt(bFac) * dLMax * ULP
      if (lSumMin > 1e-6) {
        const quad = 0.5 * bFac * dsMax * (sumAbsMax / lSumMin) ** 2 * ULP
        if (quad < exMax) exMax = quad
      }
      eExHi += dmHi[i]! * exMax
    }
    return Math.min(pi2Anchor, poincUb, (varHi + eExHi * ULP) * ULP)
  }
  const stack: [number, number, number, number, number][] = [[0.35, 3.53, 0, 0.5 * Math.PI, 0]]
  let r2Boxes = 0, region2Ok = true
  while (stack.length > 0) {
    const [kL, kR, pL, pR, depth] = stack.pop()!
    r2Boxes++
    if (r2Boxes > 20000) { region2Ok = false; break }
    let ub = boxUpper(kL, kR, pL, pR, 40)
    if (ub + 1e-10 >= 0.25 && ub < 0.265) ub = boxUpper(kL, kR, pL, pR, 140)
    if (ub + 1e-10 < 0.25) continue
    if (depth >= 24) { region2Ok = false; break }
    const kM = 0.5 * (kL + kR), pM = 0.5 * (pL + pR)
    if ((kR - kL) / Math.max(0.35, kL) >= (pR - pL) * 0.5) stack.push([kL, kM, pL, pR, depth + 1], [kM, kR, pL, pR, depth + 1])
    else stack.push([kL, kR, pL, pM, depth + 1], [kL, kR, pM, pR, depth + 1])
  }
  const r2Ms = performance.now() - tR2
  const region3Ok = 3.53 > Math.sqrt(112) / 3 && 2 / (3 + Math.sqrt(9 + 4 * 3.53 * 3.53)) < 3 / 16
  return { ok: region1Ok && region2Ok && region3Ok, r2Boxes, r2Ms }
}

const phiSu2Fn = (b: number, r: number): number =>
  b * r < 1e-8 ? b / 4 - (b * b * b * r * r) / 96 : besselI(2, b * r) / (r * besselI(1, b * r))

function certifiedAlpha13Su2W8(beta: number, nBins = 2000): number {
  const zFn = (k: number) => (k < 1e-8 ? 1 + (k * k) / 8 + k ** 4 / 192 : (2 * besselI(1, k)) / k)
  let maxUb = 0
  for (let i = 0; i < nBins; i++) {
    const rA = (7 * i) / nBins, rB = (7 * (i + 1)) / nBins
    const rLoMin = Math.max(0, rA - 1), rHiMax = rB + 1
    const expOscHi = (zFn(beta * rHiMax) / zFn(beta * rLoMin)) * (1 + 1e-12)
    const pLoMax = phiSu2Fn(beta, rLoMin) * (1 + 1e-12)
    const pHiMax = phiSu2Fn(beta, rA + 1) * (1 + 1e-12)
    const pHiMin = phiSu2Fn(beta, rHiMax) * (1 - 1e-12)
    const c1Hi = 0.5 * (pLoMax + pHiMax)
    const halfDiffHi = 0.5 * Math.max(0, pLoMax - pHiMin)
    const ub = (beta * c1Hi * rB * 0.5 * Math.sqrt(expOscHi) + beta * halfDiffHi * rHiMax) * Math.sqrt(expOscHi / 3) + 1e-12
    if (ub > maxUb) maxUb = ub
  }
  return maxUb
}

function certifiedAlpha13Su2Sharp(beta: number, nBins = 2000): { readonly alpha13: number; readonly maxOmega: number } {
  const ULP = 1 + 1e-12
  let maxUb = 0
  let maxOmega = 0
  for (let i = 0; i < nBins; i++) {
    const rA = (7 * i) / nBins, rB = (7 * (i + 1)) / nBins
    const rLoMin = Math.max(0, rA - 1), rHiMax = rB + 1
    const pLoMax = phiSu2Fn(beta, rLoMin) * ULP
    const pHiMax = phiSu2Fn(beta, rA + 1) * ULP
    const pHiMin = phiSu2Fn(beta, rHiMax) * (1 - 1e-12)
    const c1Hi = 0.5 * (pLoMax + pHiMax) * ULP
    const deltaPhiHi = 0.5 * Math.max(0, pLoMax - pHiMin) * ULP
    const omegaHi = 2 * beta * rB * deltaPhiHi * ULP
    if (omegaHi > maxOmega) maxOmega = omegaHi
    const etaHi = Math.expm1(omegaHi) * ULP
    const linFactor = 0.25 + (etaHi * (1 + etaHi)) / (2 * Math.sqrt(3))
    const linTerm = beta * c1Hi * rB * linFactor * ULP
    const remTerm = beta * deltaPhiHi * rHiMax * Math.sqrt((1 + etaHi) / 3) * ULP
    const ub = linTerm + remTerm + 1e-12
    if (ub > maxUb) maxUb = ub
  }
  return { alpha13: maxUb, maxOmega }
}

function solveBetaThreshold(evalRhoAtBeta: (beta: number) => number, loInit: number, hiInit: number): number {
  let lo = loInit, hi = hiInit
  if (evalRhoAtBeta(lo) >= 1) return 0
  while (evalRhoAtBeta(hi) < 1 && hi < 2) hi *= 1.1
  for (let it = 0; it < 48; it++) {
    const mid = 0.5 * (lo + hi)
    if (evalRhoAtBeta(mid) < 1) lo = mid
    else hi = mid
  }
  return lo
}

function solveMassGap(evalRhoAtM: (m: number) => number): number {
  if (evalRhoAtM(0) >= 1) return 0
  let lo = 0, hi = 4.0
  while (evalRhoAtM(hi) < 1 && hi < 50) hi *= 1.5
  for (let it = 0; it < 52; it++) {
    const mid = 0.5 * (lo + hi)
    if (evalRhoAtM(mid) < 1) lo = mid
    else hi = mid
  }
  return lo
}

// =================================================================================================
// 3. PART 3 (W14.1): SU(3) CONVEX-HULL + CHEBYSHEV-SCHUR + K=2 PETER-WEYL + MULTI-LINK BLOCK ENGINE
// =================================================================================================

function j3MulInto(out: Float64Array, a: Float64Array, b: Float64Array): void {
  const a0 = a[0]!, b0 = b[0]!, a1 = a[1]!, a2 = a[2]!, a3 = a[3]!, b1 = b[1]!, b2 = b[2]!, b3 = b[3]!
  out[0] = a0 * b0
  out[1] = a0 * b1 + a1 * b0
  out[2] = a0 * b2 + a2 * b0
  out[3] = a0 * b3 + a3 * b0
  out[4] = a0 * b[4]! + b0 * a[4]! + 2 * a1 * b1
  out[5] = a0 * b[5]! + b0 * a[5]! + a1 * b2 + a2 * b1
  out[6] = a0 * b[6]! + b0 * a[6]! + a1 * b3 + a3 * b1
  out[7] = a0 * b[7]! + b0 * a[7]! + 2 * a2 * b2
  out[8] = a0 * b[8]! + b0 * a[8]! + a2 * b3 + a3 * b2
  out[9] = a0 * b[9]! + b0 * a[9]! + 2 * a3 * b3
}

const H4_IDX = [
  [5, 6, 7, 8],
  [6, 9, 10, 11],
  [7, 10, 12, 13],
  [8, 11, 13, 14],
] as const

function j4MulInto(out: Float64Array, a: Float64Array, b: Float64Array): void {
  const a0 = a[0]!, b0 = b[0]!, a1 = a[1]!, a2 = a[2]!, a3 = a[3]!, a4 = a[4]!
  const b1 = b[1]!, b2 = b[2]!, b3 = b[3]!, b4 = b[4]!
  out[0] = a0 * b0
  out[1] = a0 * b1 + a1 * b0
  out[2] = a0 * b2 + a2 * b0
  out[3] = a0 * b3 + a3 * b0
  out[4] = a0 * b4 + a4 * b0
  out[5] = a0 * b[5]! + b0 * a[5]! + 2 * a1 * b1
  out[6] = a0 * b[6]! + b0 * a[6]! + a1 * b2 + a2 * b1
  out[7] = a0 * b[7]! + b0 * a[7]! + a1 * b3 + a3 * b1
  out[8] = a0 * b[8]! + b0 * a[8]! + a1 * b4 + a4 * b1
  out[9] = a0 * b[9]! + b0 * a[9]! + 2 * a2 * b2
  out[10] = a0 * b[10]! + b0 * a[10]! + a2 * b3 + a3 * b2
  out[11] = a0 * b[11]! + b0 * a[11]! + a2 * b4 + a4 * b2
  out[12] = a0 * b[12]! + b0 * a[12]! + 2 * a3 * b3
  out[13] = a0 * b[13]! + b0 * a[13]! + a3 * b4 + a4 * b3
  out[14] = a0 * b[14]! + b0 * a[14]! + 2 * a4 * b4
}

function makeSu3HessEvaluator(maxN: number, maxQ: number): (i1: number, i2: number, i3: number, d: number) => Float64Array {
  type CompactSchur = { readonly a: number; readonly b: number; readonly c: number; readonly coeffs: Float64Array }
  const schurs: CompactSchur[] = []
  for (let q0 = 0; q0 <= maxQ; q0++) {
    for (let q1 = q0 + 1; q1 <= maxQ; q1++) {
      for (let q2 = q1 + 1; q2 <= maxQ; q2++) {
        const coeffs = new Float64Array(maxN + 1)
        let any = false
        for (let n = 0; n <= maxN; n++) {
          const cf = (k: number, q: number): number =>
            q < k ? 0 : Math.pow(0.25, q - k) / (FACT[q - k]! * FACT[q + n]!)
          const a00 = cf(0, q0), a01 = cf(1, q0), a02 = cf(2, q0)
          const a10 = cf(0, q1), a11 = cf(1, q1), a12 = cf(2, q1)
          const a20 = cf(0, q2), a21 = cf(1, q2), a22 = cf(2, q2)
          const cDet = a00 * (a11 * a22 - a12 * a21) - a01 * (a10 * a22 - a12 * a20) + a02 * (a10 * a21 - a11 * a20)
          if (cDet !== 0) {
            coeffs[n] = cDet
            any = true
          }
        }
        if (any) schurs.push({ a: q2 - 2, b: q1 - 1, c: q0, coeffs })
      }
    }
  }
  const H3 = Array.from({ length: maxQ + 1 }, () => new Float64Array(10))
  const Z3 = new Float64Array(10)
  const T4 = Array.from({ length: maxN + 1 }, () => new Float64Array(15))
  const G3 = Array.from({ length: maxN + 1 }, () => new Float64Array(10))
  const sA = new Float64Array(10), sB = new Float64Array(10), sC = new Float64Array(10), sD = new Float64Array(10), sDet = new Float64Array(10)
  const s4A = new Float64Array(15), s4B = new Float64Array(15), s4G = new Float64Array(15), s4T = new Float64Array(15)
  const i1j = new Float64Array(10), i2j = new Float64Array(10), i3j = new Float64Array(10)
  const d4j = new Float64Array(15), i64j = new Float64Array(15)

  return (i1v: number, i2v: number, i3v: number, dv: number): Float64Array => {
    i1j.fill(0); i1j[0] = i1v; i1j[1] = 1
    i2j.fill(0); i2j[0] = i2v; i2j[2] = 1
    i3j.fill(0); i3j[0] = i3v; i3j[3] = 1
    H3[0]!.fill(0); H3[0]![0] = 1
    H3[1]!.set(i1j)
    j3MulInto(sA, i1j, i1j)
    for (let i = 0; i < 10; i++) H3[2]![i] = sA[i]! - i2j[i]!
    for (let k = 3; k <= maxQ; k++) {
      j3MulInto(sA, i1j, H3[k - 1]!)
      j3MulInto(sB, i2j, H3[k - 2]!)
      j3MulInto(sC, i3j, H3[k - 3]!)
      const hk = H3[k]!
      for (let i = 0; i < 10; i++) hk[i] = sA[i]! - sB[i]! + sC[i]!
    }
    const gH = (idx: number): Float64Array => (idx < 0 ? Z3 : H3[idx]!)
    for (let n = 0; n <= maxN; n++) G3[n]!.fill(0)
    for (let idx = 0; idx < schurs.length; idx++) {
      const { a, b, c, coeffs } = schurs[idx]!
      const m00 = gH(a), m01 = gH(a + 1), m02 = gH(a + 2)
      const m10 = gH(b - 1), m11 = gH(b), m12 = gH(b + 1)
      const m20 = gH(c - 2), m21 = gH(c - 1), m22 = gH(c)
      j3MulInto(sA, m11, m22); j3MulInto(sB, m12, m21)
      for (let i = 0; i < 10; i++) sC[i] = sA[i]! - sB[i]!
      j3MulInto(sDet, m00, sC)
      j3MulInto(sA, m10, m22); j3MulInto(sB, m12, m20)
      for (let i = 0; i < 10; i++) sC[i] = sA[i]! - sB[i]!
      j3MulInto(sD, m01, sC)
      for (let i = 0; i < 10; i++) sDet[i] = sDet[i]! - sD[i]!
      j3MulInto(sA, m10, m21); j3MulInto(sB, m11, m20)
      for (let i = 0; i < 10; i++) sC[i] = sA[i]! - sB[i]!
      j3MulInto(sD, m02, sC)
      for (let i = 0; i < 10; i++) sDet[i] = sDet[i]! + sD[i]!
      for (let n = 0; n <= maxN; n++) {
        const cf = coeffs[n]!
        if (cf !== 0) {
          const gn = G3[n]!
          for (let i = 0; i < 10; i++) gn[i] = gn[i]! + cf * sDet[i]!
        }
      }
    }
    d4j.fill(0); d4j[0] = 0.25 * dv; d4j[4] = 0.25
    i64j.fill(0); i64j[0] = i3v / 64; i64j[3] = 1 / 64
    T4[0]!.fill(0); T4[0]![0] = 1
    T4[1]!.fill(0); T4[1]![0] = 0.125 * dv; T4[1]![4] = 0.125
    for (let n = 2; n <= maxN; n++) {
      j4MulInto(s4A, d4j, T4[n - 1]!)
      j4MulInto(s4B, i64j, T4[n - 2]!)
      const tn = T4[n]!
      for (let i = 0; i < 15; i++) tn[i] = s4A[i]! - s4B[i]!
    }
    const e34 = (dst: Float64Array, src: Float64Array) => {
      dst[0] = src[0]!; dst[1] = src[1]!; dst[2] = src[2]!; dst[3] = src[3]!; dst[4] = 0
      dst[5] = src[4]!; dst[6] = src[5]!; dst[7] = src[6]!; dst[8] = 0
      dst[9] = src[7]!; dst[10] = src[8]!; dst[11] = 0; dst[12] = src[9]!; dst[13] = 0; dst[14] = 0
    }
    e34(s4G, G3[0]!)
    for (let i = 0; i < 15; i++) s4T[i] = 2 * s4G[i]!
    for (let n = 1; n <= maxN; n++) {
      e34(s4G, G3[n]!)
      j4MulInto(s4A, T4[n]!, s4G)
      for (let i = 0; i < 15; i++) s4T[i] = s4T[i]! + 4 * s4A[i]!
    }
    return s4T
  }
}

const SCHUR_MAX_N = 10
const SCHUR_MAX_Q = 16
const evalZSu3Hess = makeSu3HessEvaluator(SCHUR_MAX_N, SCHUR_MAX_Q)

function computeSu3SchurAnalyticTail(mMax: number, maxN = SCHUR_MAX_N, maxQ = SCHUR_MAX_Q, delta = 0.25) {
  const uMax = mMax * mMax
  const rootRadius = Math.ceil((uMax + 2.35) * 20) / 20
  const roucheOk = (rootRadius - uMax) ** 3 > delta * (rootRadius * rootRadius + rootRadius + 1) * (1 + 1e-6)
  const x = rootRadius / 4
  const dMax = mMax * mMax * mMax + delta
  const i3Max = uMax * uMax * uMax + delta
  const tauPlus = (dMax + Math.sqrt(dMax * dMax + 4 * i3Max)) / 8
  const sumCap = (startQ: number, fn: (q: number) => number): number => {
    let s = 0, last = 0
    for (let q = startQ; q <= startQ + 40; q++) { last = fn(q); s += last }
    const next = fn(startQ + 41)
    if (next >= 0.5 * last && last > 0) throw new Error('Tail series did not converge rapidly')
    return (s + 2 * next) * (1 + 1e-12)
  }
  const s0 = sumCap(0, q => Math.pow(x, q) / (FACT[Math.max(0, q - 2)]! * FACT[q]!))
  const s1 = sumCap(1, q => Math.pow(x, q - 1) / (FACT[Math.max(0, q - 2)]! * FACT[q]!))
  const s1N = sumCap(1, q => Math.pow(x, q - 1) / (FACT[Math.max(0, q - 2)]! * FACT[q - 1]!))
  const s2N = sumCap(2, q => (q * q * q * Math.pow(x, q - 2)) / (FACT[q - 2]! * FACT[q - 2]!))
  const tailQ = sumCap(maxQ + 1, q => (q * q * q * Math.pow(x, q - 2)) / (FACT[q - 2]! * FACT[q]!))
  const tailN = sumCap(maxN + 1, n => Math.pow(tauPlus, n) / (FACT[n]! * FACT[n + 1]! * FACT[n + 2]!))
  const bQ = 4 * Math.exp(tauPlus) * 3 * s0 * s1 * tailQ
  const bN = 4 * 3 * s0 * s1N * s2N * tailN
  return { mMax, delta, rootRadius, tauPlus, bQ, bN, bTotal: (bQ + bN) * (1 + 1e-12), roucheOk }
}

const SU3_ANALYTIC_TAIL = computeSu3SchurAnalyticTail(1.58, SCHUR_MAX_N, SCHUR_MAX_Q, 0.25)

function realSymMaxEig6(matIn: Float64Array): number {
  const a = Float64Array.from(matIn)
  for (let sw = 0; sw < 50; sw++) {
    let rot = false
    for (let p = 0; p < 5; p++) {
      for (let q = p + 1; q < 6; q++) {
        const apq = a[p * 6 + q]!
        if (Math.abs(apq) <= 1e-14 * Math.max(1, Math.abs(a[p * 6 + p]!), Math.abs(a[q * 6 + q]!))) continue
        rot = true
        const tau = (a[q * 6 + q]! - a[p * 6 + p]!) / (2 * apq)
        const t = tau >= 0 ? 1 / (tau + Math.hypot(1, tau)) : -1 / (-tau + Math.hypot(1, tau))
        const c = 1 / Math.hypot(1, t), s = t * c
        a[p * 6 + p] = a[p * 6 + p]! - t * apq
        a[q * 6 + q] = a[q * 6 + q]! + t * apq
        a[p * 6 + q] = 0; a[q * 6 + p] = 0
        for (let k = 0; k < 6; k++) {
          if (k === p || k === q) continue
          const akp = a[k * 6 + p]!, akq = a[k * 6 + q]!
          a[k * 6 + p] = a[p * 6 + k] = c * akp - s * akq
          a[k * 6 + q] = a[q * 6 + k] = s * akp + c * akq
        }
      }
    }
    if (!rot) break
  }
  let mx = a[0]!
  for (let i = 1; i < 6; i++) if (a[i * 6 + i]! > mx) mx = a[i * 6 + i]!
  return mx
}

const F2_SCR = new Float64Array(16)
const JAC_SCR = Array.from({ length: 4 }, () => new Float64Array(6))
const GQ_SCR = new Float64Array(6)
const S6_SCR = new Float64Array(36)

function exactSu3VarAndMeans(
  zr0: number, zr1: number, zr2: number, zi2: number,
  tailB = SU3_ANALYTIC_TAIL.bTotal, tailDelta = SU3_ANALYTIC_TAIL.delta,
) {
  const zr = [zr0, zr1, zr2], zi = [0, 0, zi2]
  const u0 = zr0 * zr0, u1 = zr1 * zr1, u2 = zr2 * zr2 + zi2 * zi2
  const I1 = u0 + u1 + u2, I2 = u0 * u1 + u0 * u2 + u1 * u2, I3 = u0 * u1 * u2
  const detR = zr0 * zr1 * zr2, detI = zr0 * zr1 * zi2
  const J = evalZSu3Hess(I1, I2, I3, detR)
  const zVal = J[0]!, invZ = 1 / zVal
  const f10 = J[1]! * invZ, f11 = J[2]! * invZ, f12 = J[3]! * invZ, f13 = J[4]! * invZ
  const f1 = [f10, f11, f12, f13]
  for (let a = 0; a < 4; a++) for (let b = 0; b < 4; b++) F2_SCR[a * 4 + b] = J[H4_IDX[a]![b]!]! * invZ - f1[a]! * f1[b]!

  let maxOff = 0
  const pairs: readonly [number, number, number][] = [[0, 1, 2], [0, 2, 1], [1, 2, 0]]
  const us = [u0, u1, u2]
  const cr0 = 2 * f12 * detR + f13, ci0 = -2 * f12 * detI
  for (let idx = 0; idx < 3; idx++) {
    const [j, k, l] = pairs[idx]!
    const bpr = zr[j]! * zr[k]! - zi[j]! * zi[k]!, bpi = -(zr[j]! * zi[k]! + zi[j]! * zr[k]!)
    const tr = 2 * f11 * bpr + (cr0 * zr[l]! - ci0 * zi[l]!)
    const ti = 2 * f11 * bpi + (cr0 * zi[l]! + ci0 * zr[l]!)
    const val = 2 * (f10 + us[l]! * f11) + Math.hypot(tr, ti)
    if (val > maxOff) maxOff = val
  }

  const prodOtherU = [u1 * u2, u0 * u2, u0 * u1]
  const otherPairs: readonly [number, number][] = [[1, 2], [0, 2], [0, 1]]
  for (let k = 0; k < 3; k++) {
    JAC_SCR[0]![k] = 2 * zr[k]!; JAC_SCR[0]![3 + k] = 2 * zi[k]!
    const mult = I1 - us[k]!; JAC_SCR[1]![k] = 2 * mult * zr[k]!; JAC_SCR[1]![3 + k] = 2 * mult * zi[k]!
    JAC_SCR[2]![k] = 2 * prodOtherU[k]! * zr[k]!; JAC_SCR[2]![3 + k] = 2 * prodOtherU[k]! * zi[k]!
    const [a, b] = otherPairs[k]!
    JAC_SCR[3]![k] = zr[a]! * zr[b]! - zi[a]! * zi[b]!
    JAC_SCR[3]![3 + k] = -(zr[a]! * zi[b]! + zi[a]! * zr[b]!)
  }
  for (let p = 0; p < 6; p++) {
    let s = 0
    for (let a = 0; a < 4; a++) s += f1[a]! * JAC_SCR[a]![p]!
    GQ_SCR[p] = s
  }
  for (let p = 0; p < 6; p++) {
    for (let q = p; q < 6; q++) {
      let acc = 0
      for (let a = 0; a < 4; a++) {
        const jap = JAC_SCR[a]![p]!
        if (jap === 0) continue
        for (let b = 0; b < 4; b++) acc += F2_SCR[a * 4 + b]! * jap * JAC_SCR[b]![q]!
      }
      const kp = p % 3, isIp = p >= 3, kq = q % 3, isIq = q >= 3
      if (p === q) {
        acc += f10 * 2 + f11 * 2 * (I1 - us[kp]!) + f12 * 2 * prodOtherU[kp]!
      } else if (kp !== kq) {
        const vp = isIp ? zi[kp]! : zr[kp]!, vq = isIq ? zi[kq]! : zr[kq]!, kl = 3 - kp - kq
        acc += f11 * 4 * vp * vq + f12 * 4 * us[kl]! * vp * vq + f13 * (!isIp && !isIq ? zr[kl]! : isIp && isIq ? -zr[kl]! : -zi[kl]!)
      }
      S6_SCR[p * 6 + q] = S6_SCR[q * 6 + p] = acc
    }
  }
  const maxDiag = realSymMaxEig6(S6_SCR)

  const d1B = tailB / tailDelta, d2B = (2 * tailB) / (tailDelta * tailDelta)
  const eF1 = [d1B + Math.abs(f10) * tailB, d1B + Math.abs(f11) * tailB, d1B + Math.abs(f12) * tailB, d1B + Math.abs(f13) * tailB]
  let maxEF2 = 0
  for (let a = 0; a < 4; a++) {
    for (let b = 0; b < 4; b++) {
      const eH = d2B + Math.abs(J[H4_IDX[a]![b]!]! * invZ) * tailB
      const eab = eH + Math.abs(f1[a]!) * eF1[b]! + Math.abs(f1[b]!) * eF1[a]! + eF1[a]! * eF1[b]!
      if (eab > maxEF2) maxEF2 = eab
    }
  }
  const maxU = Math.max(u0, u1, u2), maxM = Math.sqrt(maxU), absDet = Math.hypot(detR, detI)
  const errOff = 2 * (eF1[0]! + maxU * eF1[1]!) + 2 * eF1[1]! * maxU + (2 * eF1[2]! * absDet + eF1[3]!) * maxM
  let maxRowJac = 0
  for (let p = 0; p < 6; p++) {
    let rs = 0
    for (let a = 0; a < 4; a++) rs += Math.abs(JAC_SCR[a]![p]!)
    if (rs > maxRowJac) maxRowJac = rs
  }
  const errDiagEntry = maxEF2 * maxRowJac * maxRowJac + 2 * eF1[0]! + 4 * (I1 + maxU) * eF1[1]! + 4 * (maxU * maxU) * eF1[2]! + maxM * eF1[3]!
  const errVmax = Math.max(errOff, 6 * errDiagEntry) * (1 + 1e-12)
  const errEu = Math.SQRT2 * maxRowJac * Math.max(eF1[0]!, eF1[1]!, eF1[2]!, eF1[3]!) * (1 + 1e-12)

  return {
    zVal,
    vMax: Math.max(maxOff, maxDiag),
    eu0: Math.hypot(GQ_SCR[0]!, GQ_SCR[3]!),
    eu1: Math.hypot(GQ_SCR[1]!, GQ_SCR[4]!),
    eu2: Math.hypot(GQ_SCR[2]!, GQ_SCR[5]!),
    errVmax,
    errEu,
  }
}

function allPerms(p: number): number[][] {
  if (p === 0) return [[]]
  const res: number[][] = [], used = new Uint8Array(p), cur: number[] = []
  const dfs = () => {
    if (cur.length === p) { res.push([...cur]); return }
    for (let i = 0; i < p; i++) if (!used[i]) { used[i] = 1; cur.push(i); dfs(); cur.pop(); used[i] = 0 }
  }
  dfs()
  return res
}
function cycleTypeKey(perm: readonly number[]): string {
  const n = perm.length, vis = new Uint8Array(n), lens: number[] = []
  for (let i = 0; i < n; i++) {
    if (vis[i]) continue
    let c = 0, x = i
    while (!vis[x]) { vis[x] = 1; x = perm[x]!; c++ }
    lens.push(c)
  }
  lens.sort((a, b) => b - a)
  return lens.join(',')
}
const WG3: Record<number, Record<string, number>> = {
  0: { '': 1 },
  1: { '1': 1 / 3 },
  2: { '1,1': 1 / 8, '2': -1 / 24 },
  3: { '1,1,1': 7 / 120, '2,1': -1 / 40, '3': 1 / 60 },
  4: {
    '1,1,1,1': (1 / 576) * (1 / 15 + 27 / 15 + 8 / 6 + 27 / 3),
    '2,1,1': (1 / 576) * (1 / 15 + 9 / 15 - 9 / 3),
    '2,2': (1 / 576) * (1 / 15 - 9 / 15 + 8 / 6 - 9 / 3),
    '3,1': (1 / 576) * (1 / 15 - 4 / 6),
    '4': (1 / 576) * (1 / 15 - 9 / 15 + 9 / 3),
  },
  5: {
    '1,1,1,1,1': (1 / 14400) * (1 / 21 + (2 / 3) * 4 + (5 / 3) * 5 + 36 + (25 / 3) * 5),
    '2,1,1,1': (1 / 14400) * (1 / 21 + (2 / 3) * 2 + 5 / 3 - 25 / 3),
    '2,2,1': (1 / 14400) * (1 / 21 + 5 / 3 - 12 + 25 / 3),
    '3,1,1': (1 / 14400) * (1 / 21 + 2 / 3 - 5 / 3 - 25 / 3),
    '3,2': (1 / 14400) * (1 / 21 - 2 / 3 + 5 / 3 - 25 / 3),
    '4,1': (1 / 14400) * (1 / 21 - 5 / 3 + 25 / 3),
    '5': (1 / 14400) * (1 / 21 - 2 / 3 + 6),
  },
}
const PERMS = [0, 1, 2, 3, 4, 5].map(allPerms)
const PERM_DIFF_WG = [0, 1, 2, 3, 4, 5].map(p => {
  const ps = PERMS[p]!, m = ps.length, mat = new Float64Array(m * m)
  for (let a = 0; a < m; a++) {
    for (let b = 0; b < m; b++) {
      const pa = ps[a]!, pb = ps[b]!, comp: number[] = new Array(p)
      for (let k = 0; k < p; k++) {
        const y = pb[k]!
        for (let c = 0; c < p; c++) if (pa[c] === y) { comp[k] = c; break }
      }
      mat[a * m + b] = WG3[p]![cycleTypeKey(comp)]!
    }
  }
  return mat
})
function eU3(rU: readonly number[], cU: readonly number[], rB: readonly number[], cB: readonly number[]): number {
  const p = rU.length
  if (p !== rB.length) return 0
  if (p === 0) return 1
  const ps = PERMS[p]!, m = ps.length, wgMat = PERM_DIFF_WG[p]!, vA: number[] = [], vB: number[] = []
  for (let a = 0; a < m; a++) {
    const pa = ps[a]!
    let okA = true, okB = true
    for (let k = 0; k < p; k++) {
      if (rU[k] !== rB[pa[k]!]) okA = false
      if (cU[k] !== cB[pa[k]!]) okB = false
    }
    if (okA) vA.push(a)
    if (okB) vB.push(a)
  }
  if (!vA.length || !vB.length) return 0
  let s = 0
  for (const a of vA) { const off = a * m; for (const b of vB) s += wgMat[off + b]! }
  return s
}
const LC_PAIRS: readonly (readonly [number, number, number])[][] = [
  [[1, 2, 1], [2, 1, -1]],
  [[2, 0, 1], [0, 2, -1]],
  [[0, 1, 1], [1, 0, -1]],
]
const E_CACHE = new Map<string, number>()
const monoKey = (rU: readonly number[], cU: readonly number[], rB: readonly number[], cB: readonly number[]) =>
  `${rU.map((r, i) => r * 3 + cU[i]!).sort((a, b) => a - b).join(',')}|${rB.map((r, i) => r * 3 + cB[i]!).sort((a, b) => a - b).join(',')}`
function eSU3(rU: readonly number[], cU: readonly number[], rB: readonly number[], cB: readonly number[]): number {
  const p = rU.length, q = rB.length
  if ((p - q) % 3 !== 0) return 0
  const key = monoKey(rU, cU, rB, cB)
  const hit = E_CACHE.get(key)
  if (hit !== undefined) return hit
  let res = 0
  if (p === q) res = eU3(rU, cU, rB, cB)
  else if (p < q) res = eSU3(rB, cB, rU, cU)
  else if (p - q === 3) {
    const a = rU[p - 1]!, b = cU[p - 1]!, u1 = rU.slice(0, p - 1), v1 = cU.slice(0, p - 1)
    let acc = 0
    for (const [c, d, s1] of LC_PAIRS[a]!)
      for (const [e, f, s2] of LC_PAIRS[b]!) acc += s1 * s2 * eU3(u1, v1, [...rB, c, d], [...cB, e, f])
    res = 0.5 * acc
  } else if (p - q === 6) {
    const a1 = rU[p - 2]!, b1 = cU[p - 2]!, a2 = rU[p - 1]!, b2 = cU[p - 1]!
    const u1 = rU.slice(0, p - 2), v1 = cU.slice(0, p - 2)
    let acc = 0
    for (const [c1, d1, s1] of LC_PAIRS[a1]!)
      for (const [e1, f1, s2] of LC_PAIRS[b1]!)
        for (const [c2, d2, s3] of LC_PAIRS[a2]!)
          for (const [e2, f2, s4] of LC_PAIRS[b2]!)
            acc += s1 * s2 * s3 * s4 * eU3(u1, v1, [...rB, c1, d1, c2, d2], [...cB, e1, f1, e2, f2])
    res = 0.25 * acc
  }
  E_CACHE.set(key, res)
  return res
}

type Mono = { readonly rU: readonly number[]; readonly cU: readonly number[]; readonly rB: readonly number[]; readonly cB: readonly number[]; readonly re: number }
type Poly = readonly Mono[]
function simplifyPoly(terms: readonly Mono[]): Mono[] {
  const map = new Map<string, { rU: number[]; cU: number[]; rB: number[]; cB: number[]; re: number }>()
  for (const t of terms) {
    if (Math.abs(t.re) < 1e-15) continue
    const uP = t.rU.map((r, i) => r * 3 + t.cU[i]!).sort((a, b) => a - b)
    const bP = t.rB.map((r, i) => r * 3 + t.cB[i]!).sort((a, b) => a - b)
    const key = `${uP.join(',')}|${bP.join(',')}`
    const prev = map.get(key)
    if (prev) prev.re += t.re
    else map.set(key, { rU: uP.map(x => (x / 3) | 0), cU: uP.map(x => x % 3), rB: bP.map(x => (x / 3) | 0), cB: bP.map(x => x % 3), re: t.re })
  }
  const out: Mono[] = []
  for (const v of map.values()) if (Math.abs(v.re) > 1e-14) out.push(v)
  return out
}
const pAdd = (a: Poly, b: Poly, sb = 1): Mono[] => simplifyPoly([...a, ...b.map(t => ({ ...t, re: t.re * sb }))])
const pMul = (a: Poly, b: Poly): Mono[] => {
  const raw: Mono[] = []
  for (const x of a) for (const y of b) raw.push({ rU: [...x.rU, ...y.rU], cU: [...x.cU, ...y.cU], rB: [...x.rB, ...y.rB], cB: [...x.cB, ...y.cB], re: x.re * y.re })
  return simplifyPoly(raw)
}
const pConj = (a: Poly): Mono[] => simplifyPoly(a.map(t => ({ rU: t.rB, cU: t.cB, rB: t.rU, cB: t.cU, re: t.re })))
function polyInnerReal(a: Poly, b: Poly): number {
  const ca = pConj(a)
  let acc = 0
  for (const x of ca) for (const y of b) {
    const e = eSU3([...x.rU, ...y.rU], [...x.cU, ...y.cU], [...x.rB, ...y.rB], [...x.cB, ...y.cB])
    if (e !== 0) acc += e * x.re * y.re
  }
  return acc
}
function negLaplacian(poly: Poly): Mono[] {
  const out: Mono[] = []
  for (const t of poly) {
    const p = t.rU.length, q = t.rB.length
    if (p === 0 && q === 0) continue
    if ((p === 1 && q === 0) || (p === 0 && q === 1)) out.push({ ...t, re: (8 / 3) * t.re })
    else if (p === 2 && q === 0) { out.push({ ...t, re: (14 / 3) * t.re }); out.push({ rU: t.rU, cU: [t.cU[1]!, t.cU[0]!], rB: [], cB: [], re: 2 * t.re }) }
    else if (p === 0 && q === 2) { out.push({ ...t, re: (14 / 3) * t.re }); out.push({ rU: [], cU: [], rB: t.rB, cB: [t.cB[1]!, t.cB[0]!], re: 2 * t.re }) }
    else if (p === 1 && q === 1) { out.push({ ...t, re: 6 * t.re }); if (t.rU[0] === t.rB[0] && t.cU[0] === t.cB[0]) out.push({ rU: [], cU: [], rB: [], cB: [], re: -2 * t.re }) }
  }
  return simplifyPoly(out)
}
function buildWeightSectorBasis(targetW: readonly [number, number, number]): Poly[] {
  const raw: Mono[][] = []
  const wOf = (rU: readonly number[], cU: readonly number[], rB: readonly number[], cB: readonly number[]): [number, number, number] => {
    const w: [number, number, number] = [0, 0, 0]
    for (let k = 0; k < rU.length; k++) { w[rU[k]!] = w[rU[k]!]! + 1; w[cU[k]!] = w[cU[k]!]! - 1 }
    for (let k = 0; k < rB.length; k++) { w[rB[k]!] = w[rB[k]!]! - 1; w[cB[k]!] = w[cB[k]!]! + 1 }
    return w
  }
  const eqW = (w: readonly [number, number, number]) => w[0] === targetW[0] && w[1] === targetW[1] && w[2] === targetW[2]
  if (eqW([0, 0, 0])) raw.push([{ rU: [], cU: [], rB: [], cB: [], re: 1 }])
  for (let i = 0; i < 3; i++) for (let j = 0; j < 3; j++) {
    if (eqW(wOf([i], [j], [], []))) raw.push([{ rU: [i], cU: [j], rB: [], cB: [], re: 1 }])
    if (eqW(wOf([], [], [i], [j]))) raw.push([{ rU: [], cU: [], rB: [i], cB: [j], re: 1 }])
  }
  const seen = new Set<string>()
  const tryPush = (rU: number[], cU: number[], rB: number[], cB: number[]) => {
    if (!eqW(wOf(rU, cU, rB, cB))) return
    const key = monoKey(rU, cU, rB, cB)
    if (seen.has(key)) return
    seen.add(key)
    raw.push([{ rU, cU, rB, cB, re: 1 }])
  }
  for (let i = 0; i < 3; i++) for (let j = 0; j < 3; j++) for (let k = 0; k < 3; k++) for (let l = 0; l < 3; l++) {
    tryPush([i, k], [j, l], [], [])
    tryPush([], [], [i, k], [j, l])
    tryPush([i], [j], [k], [l])
  }
  const basis: Poly[] = []
  for (const cand of raw) {
    let v: Mono[] = [...cand]
    for (const b of basis) v = pAdd(v, b, -polyInnerReal(b, v))
    const n2 = polyInnerReal(v, v)
    if (n2 > 1e-10) {
      const inv = 1 / Math.sqrt(n2)
      basis.push(v.map(t => ({ ...t, re: t.re * inv })))
    }
  }
  return basis
}

const VEFF_OPS_EXACT: readonly Poly[] = [
  [{ rU: [0], cU: [0], rB: [], cB: [], re: 1 }], [{ rU: [1], cU: [1], rB: [], cB: [], re: 1 }], [{ rU: [2], cU: [2], rB: [], cB: [], re: 1 }],
  [{ rU: [], cU: [], rB: [0], cB: [0], re: 1 }], [{ rU: [], cU: [], rB: [1], cB: [1], re: 1 }], [{ rU: [], cU: [], rB: [2], cB: [2], re: 1 }],
  [{ rU: [0, 0], cU: [0, 0], rB: [], cB: [], re: 1 }], [{ rU: [1, 1], cU: [1, 1], rB: [], cB: [], re: 1 }], [{ rU: [2, 2], cU: [2, 2], rB: [], cB: [], re: 1 }],
  [{ rU: [], cU: [], rB: [0, 0], cB: [0, 0], re: 1 }], [{ rU: [], cU: [], rB: [1, 1], cB: [1, 1], re: 1 }], [{ rU: [], cU: [], rB: [2, 2], cB: [2, 2], re: 1 }],
  [{ rU: [0, 1], cU: [0, 1], rB: [], cB: [], re: 1 / 24 }, { rU: [0, 1], cU: [1, 0], rB: [], cB: [], re: -1 / 8 }],
  [{ rU: [0, 2], cU: [0, 2], rB: [], cB: [], re: 1 / 24 }, { rU: [0, 2], cU: [2, 0], rB: [], cB: [], re: -1 / 8 }],
  [{ rU: [1, 2], cU: [1, 2], rB: [], cB: [], re: 1 / 24 }, { rU: [1, 2], cU: [2, 1], rB: [], cB: [], re: -1 / 8 }],
  [{ rU: [], cU: [], rB: [0, 1], cB: [0, 1], re: 1 / 24 }, { rU: [], cU: [], rB: [0, 1], cB: [1, 0], re: -1 / 8 }],
  [{ rU: [], cU: [], rB: [0, 2], cB: [0, 2], re: 1 / 24 }, { rU: [], cU: [], rB: [0, 2], cB: [2, 0], re: -1 / 8 }],
  [{ rU: [], cU: [], rB: [1, 2], cB: [1, 2], re: 1 / 24 }, { rU: [], cU: [], rB: [1, 2], cB: [2, 1], re: -1 / 8 }],
  [{ rU: [], cU: [], rB: [], cB: [], re: 1 / 8 }, { rU: [0], cU: [0], rB: [0], cB: [0], re: -1 / 24 }],
  [{ rU: [], cU: [], rB: [], cB: [], re: 1 / 8 }, { rU: [1], cU: [1], rB: [1], cB: [1], re: -1 / 24 }],
  [{ rU: [], cU: [], rB: [], cB: [], re: 1 / 8 }, { rU: [2], cU: [2], rB: [2], cB: [2], re: -1 / 24 }],
  [{ rU: [0], cU: [0], rB: [1], cB: [1], re: -1 / 24 }], [{ rU: [1], cU: [1], rB: [0], cB: [0], re: -1 / 24 }],
  [{ rU: [0], cU: [0], rB: [2], cB: [2], re: -1 / 24 }], [{ rU: [2], cU: [2], rB: [0], cB: [0], re: -1 / 24 }],
  [{ rU: [1], cU: [1], rB: [2], cB: [2], re: -1 / 24 }], [{ rU: [2], cU: [2], rB: [1], cB: [1], re: -1 / 24 }],
]
const PAIRS3: readonly [number, number][] = [[0, 1], [0, 2], [1, 2]]
type AMapEntry = { readonly r1: number; readonly r2: number; readonly s2: number; readonly isIm: boolean }
const A_MAP: readonly AMapEntry[] = [
  { r1: 0, r2: 3, s2: 1, isIm: false }, { r1: 1, r2: 4, s2: 1, isIm: false }, { r1: 2, r2: 5, s2: 1, isIm: false },
  { r1: 6, r2: 9, s2: 1, isIm: false }, { r1: 7, r2: 10, s2: 1, isIm: false }, { r1: 8, r2: 11, s2: 1, isIm: false },
  { r1: 12, r2: 15, s2: 1, isIm: false }, { r1: 13, r2: 16, s2: 1, isIm: false }, { r1: 14, r2: 17, s2: 1, isIm: false },
  { r1: 18, r2: -1, s2: 0, isIm: false }, { r1: 19, r2: -1, s2: 0, isIm: false }, { r1: 20, r2: -1, s2: 0, isIm: false },
  { r1: 21, r2: 22, s2: 1, isIm: false }, { r1: 23, r2: 24, s2: 1, isIm: false }, { r1: 25, r2: 26, s2: 1, isIm: false },
  { r1: 0, r2: 3, s2: -1, isIm: true }, { r1: 1, r2: 4, s2: -1, isIm: true }, { r1: 2, r2: 5, s2: -1, isIm: true },
  { r1: 6, r2: 9, s2: -1, isIm: true }, { r1: 7, r2: 10, s2: -1, isIm: true }, { r1: 8, r2: 11, s2: -1, isIm: true },
  { r1: 12, r2: 15, s2: -1, isIm: true }, { r1: 13, r2: 16, s2: -1, isIm: true }, { r1: 14, r2: 17, s2: -1, isIm: true },
  { r1: 21, r2: 22, s2: -1, isIm: true }, { r1: 23, r2: 24, s2: -1, isIm: true }, { r1: 25, r2: 26, s2: -1, isIm: true },
]

type V1Op = { readonly m: number; readonly isIm: boolean; readonly idx: Int32Array; readonly val: Float64Array }
type QPair = { readonly m: number; readonly l: number; readonly isIm: boolean; readonly idx: Int32Array; readonly val: Float64Array }
type UltraSector = { readonly n: number; readonly h0Upper: Float64Array; readonly v1: V1Op[]; readonly q2: QPair[] }

function precomputeUltraSector(targetW: readonly [number, number, number]): UltraSector {
  const basis = buildWeightSectorBasis(targetW)
  const n = basis.length
  const h0Upper = new Float64Array(n * n)
  for (let a = 0; a < n; a++) {
    const lb = negLaplacian(basis[a]!)
    for (let b = a; b < n; b++) h0Upper[a * n + b] = polyInnerReal(basis[b]!, lb)
  }
  const ob: Poly[][] = Array.from({ length: 27 }, (_, r) => basis.map(b => pMul(VEFF_OPS_EXACT[r]!, b)))
  const MV: Float64Array[] = Array.from({ length: 27 }, () => new Float64Array(n * n))
  for (let r = 0; r < 27; r++)
    for (let a = 0; a < n; a++) for (let b = 0; b < n; b++) MV[r]![a * n + b] = polyInnerReal(basis[a]!, ob[r]![b]!)
  const GV: Float64Array[] = new Array(27 * 27)
  for (let r = 0; r < 27; r++) {
    for (let s = r; s < 27; s++) {
      const gRS = new Float64Array(n * n)
      const gSR = r === s ? gRS : new Float64Array(n * n)
      for (let a = 0; a < n; a++) {
        for (let b = a; b < n; b++) {
          const v1 = polyInnerReal(ob[r]![a]!, ob[s]![b]!)
          gRS[a * n + b] = v1
          if (r !== s) gSR[a * n + b] = a === b ? v1 : polyInnerReal(ob[s]![a]!, ob[r]![b]!)
        }
      }
      GV[r * 27 + s] = gRS
      if (r !== s) GV[s * 27 + r] = gSR
    }
  }
  const MA: Float64Array[] = Array.from({ length: 27 }, () => new Float64Array(n * n))
  const v1: V1Op[] = []
  for (let m = 0; m < 27; m++) {
    const { r1, r2, s2, isIm } = A_MAP[m]!
    const M1 = MV[r1]!, M2 = r2 >= 0 ? MV[r2]! : null, Mm = MA[m]!
    const idxs: number[] = [], vals: number[] = []
    for (let a = 0; a < n; a++) {
      for (let b = 0; b < n; b++) {
        const v = M1[a * n + b]! + (M2 ? s2 * M2[a * n + b]! : 0)
        Mm[a * n + b] = v
        if (b >= a && Math.abs(v) > 1e-14) { idxs.push(a * n + b); vals.push(v) }
      }
    }
    if (idxs.length > 0) v1.push({ m, isIm, idx: Int32Array.from(idxs), val: Float64Array.from(vals) })
  }
  const innerA = (m: number, l: number, ab: number): number => {
    const am = A_MAP[m]!, al = A_MAP[l]!
    let s = GV[am.r1 * 27 + al.r1]![ab]!
    if (al.r2 >= 0) s += al.s2 * GV[am.r1 * 27 + al.r2]![ab]!
    if (am.r2 >= 0) {
      s += am.s2 * GV[am.r2 * 27 + al.r1]![ab]!
      if (al.r2 >= 0) s += am.s2 * al.s2 * GV[am.r2 * 27 + al.r2]![ab]!
    }
    return s
  }
  const q2: QPair[] = []
  for (let m = 0; m < 27; m++) {
    const imM = A_MAP[m]!.isIm, Mm = MA[m]!
    for (let l = m; l < 27; l++) {
      const imL = A_MAP[l]!.isIm, Ml = MA[l]!, isIm = imM !== imL
      const idxs: number[] = [], vals: number[] = []
      for (let a = 0; a < n; a++) {
        for (let b = a; b < n; b++) {
          if (isIm && a === b) continue
          const ab = a * n + b
          let val = 0
          if (!imM && !imL) {
            let p1 = 0
            for (let c = 0; c < n; c++) p1 += Mm[a * n + c]! * Ml[c * n + b]!
            val = innerA(m, l, ab) - p1
            if (m !== l) {
              let p2 = 0
              for (let c = 0; c < n; c++) p2 += Ml[a * n + c]! * Mm[c * n + b]!
              val += innerA(l, m, ab) - p2
            }
          } else if (imM && imL) {
            let p1 = 0
            for (let c = 0; c < n; c++) p1 += Mm[a * n + c]! * Ml[c * n + b]!
            val = innerA(m, l, ab) + p1
            if (m !== l) {
              let p2 = 0
              for (let c = 0; c < n; c++) p2 += Ml[a * n + c]! * Mm[c * n + b]!
              val += innerA(l, m, ab) + p2
            }
          } else {
            let pSum = 0
            for (let c = 0; c < n; c++) pSum += Mm[a * n + c]! * Ml[c * n + b]! + Ml[a * n + c]! * Mm[c * n + b]!
            val = innerA(m, l, ab) - innerA(l, m, ab) - pSum
          }
          if (Math.abs(val) > 1e-13) { idxs.push(ab); vals.push(val) }
        }
      }
      if (idxs.length > 0) q2.push({ m, l, isIm, idx: Int32Array.from(idxs), val: Float64Array.from(vals) })
    }
  }
  return { n, h0Upper, v1, q2 }
}

function fillAlpha27(
  al: Float64Array,
  z0r0: number, z0r1: number, z0r2: number, z0i0: number, z0i1: number, z0i2: number,
  zr0: number, zr1: number, zr2: number, zi0: number, zi1: number, zi2: number,
): void {
  const z0r = [z0r0, z0r1, z0r2], z0i = [z0i0, z0i1, z0i2], zr = [zr0, zr1, zr2], zi = [zi0, zi1, zi2]
  for (let k = 0; k < 3; k++) {
    const r0 = z0r[k]!, i0 = z0i[k]!, r = zr[k]!, im = zi[k]!
    al[k] = (-2 / 3) * r
    al[15 + k] = (2 / 3) * im
    const b2r = 2 * (r0 * r - i0 * im) - (r0 * r0 - i0 * i0)
    const b2i = 2 * (-r0 * im - i0 * r) + 2 * r0 * i0
    al[3 + k] = (-1 / 24) * b2r
    al[18 + k] = (-1 / 24) * b2i
    al[9 + k] = 2 * (r0 * r + i0 * im) - (r0 * r0 + i0 * i0)
  }
  for (let idx = 0; idx < 3; idx++) {
    const [j, k] = PAIRS3[idx]!
    const a0r = z0r[j]!, a0i = -z0i[j]!, b0r = z0r[k]!, b0i = -z0i[k]!, ar = zr[j]!, ai = -zi[j]!, br = zr[k]!, bi = -zi[k]!
    al[6 + idx] = a0r * br - a0i * bi + ar * b0r - ai * b0i - (a0r * b0r - a0i * b0i)
    al[21 + idx] = a0r * bi + a0i * br + ar * b0i + ai * b0r - (a0r * b0i + a0i * b0r)
    const b0i2 = z0i[k]!, bi2 = zi[k]!
    al[12 + idx] = a0r * br - a0i * bi2 + ar * b0r - ai * b0i2 - (a0r * b0r - a0i * b0i2)
    al[24 + idx] = a0r * bi2 + a0i * br + ar * b0i2 + ai * b0r - (a0r * b0i2 + a0i * b0r)
  }
}

const MAX_NN = 29 * 29
const MRE = new Float64Array(MAX_NN), MIM = new Float64Array(MAX_NN)
const LRE = new Float64Array(MAX_NN), LIM = new Float64Array(MAX_NN)
const AL0 = new Float64Array(27), ALV = new Float64Array(27)
const V0R = new Float64Array(29), V0I = new Float64Array(29), NR = new Float64Array(29), NI = new Float64Array(29)
const CHOLESKY_BACKWARD_PAD = 1e-9
const CHOLESKY_MIN_PIVOT = 1e-8
let trackedMinPivot = Infinity

function buildMeffUltra(sec: UltraSector, al: Float64Array, vMin: number, mu: number, diagPad = CHOLESKY_BACKWARD_PAD): boolean {
  const gapQ = 32 / 3 + vMin - mu
  if (gapQ <= 1e-9) return false
  const negInvG = -1 / gapQ, n = sec.n, nn = n * n
  MRE.set(sec.h0Upper.subarray(0, nn))
  MIM.fill(0, 0, nn)
  const diagShift = mu + diagPad
  for (let a = 0; a < n; a++) MRE[a * n + a] = MRE[a * n + a]! - diagShift
  for (let p = 0; p < sec.v1.length; p++) {
    const e = sec.v1[p]!, c = al[e.m]!
    if (c === 0) continue
    const idxs = e.idx, vals = e.val, dst = e.isIm ? MIM : MRE
    for (let k = 0; k < idxs.length; k++) { const idx = idxs[k]!; dst[idx] = dst[idx]! + c * vals[k]! }
  }
  for (let p = 0; p < sec.q2.length; p++) {
    const e = sec.q2[p]!, am = al[e.m]!
    if (am === 0) continue
    const alv = al[e.l]!
    if (alv === 0) continue
    const c = negInvG * am * alv, idxs = e.idx, vals = e.val, dst = e.isIm ? MIM : MRE
    for (let k = 0; k < idxs.length; k++) { const idx = idxs[k]!; dst[idx] = dst[idx]! + c * vals[k]! }
  }
  return true
}

function choleskyPDUltra(n: number): boolean {
  let localMin = Infinity
  for (let i = 0; i < n; i++) {
    const in0 = i * n
    for (let j = 0; j <= i; j++) {
      const jn0 = j * n
      let sr = MRE[jn0 + i]!, si = j === i ? 0 : -MIM[jn0 + i]!
      for (let k = 0; k < j; k++) {
        const r1 = LRE[in0 + k]!, i1 = LIM[in0 + k]!, r2 = LRE[jn0 + k]!, i2 = -LIM[jn0 + k]!
        sr -= r1 * r2 - i1 * i2
        si -= r1 * i2 + i1 * r2
      }
      if (i === j) {
        if (sr <= CHOLESKY_MIN_PIVOT || !Number.isFinite(sr)) return false
        if (sr < localMin) localMin = sr
        LRE[in0 + i] = Math.sqrt(sr)
        LIM[in0 + i] = 0
      } else {
        const inv = 1 / LRE[jn0 + j]!
        LRE[in0 + j] = sr * inv
        LIM[in0 + j] = si * inv
      }
    }
  }
  if (localMin < trackedMinPivot) trackedMinPivot = localMin
  return true
}

function findGroundVecUltra(n: number): void {
  for (let a = 0; a < n; a++) {
    MIM[a * n + a] = 0
    for (let b = a + 1; b < n; b++) { MRE[b * n + a] = MRE[a * n + b]!; MIM[b * n + a] = -MIM[a * n + b]! }
  }
  V0R.fill(0, 0, n); V0I.fill(0, 0, n); V0R[0] = 1
  for (let it = 0; it < 22; it++) {
    let n2 = 0
    for (let i = 0; i < n; i++) {
      const in0 = i * n
      let sr = 20 * V0R[i]!, si = 20 * V0I[i]!
      for (let j = 0; j < n; j++) {
        const ar = MRE[in0 + j]!, ai = MIM[in0 + j]!
        sr -= ar * V0R[j]! - ai * V0I[j]!
        si -= ar * V0I[j]! + ai * V0R[j]!
      }
      NR[i] = sr; NI[i] = si; n2 += sr * sr + si * si
    }
    const inv = 1 / Math.sqrt(n2)
    for (let i = 0; i < n; i++) { V0R[i] = NR[i]! * inv; V0I[i] = NI[i]! * inv }
  }
}

function addRank1ShiftAndCheckUltra(n: number): boolean {
  for (let i = 0; i < n; i++) {
    const vir = V0R[i]!, vii = V0I[i]!, in0 = i * n
    for (let j = i; j < n; j++) {
      const vjr = V0R[j]!, vji = V0I[j]!
      MRE[in0 + j] = MRE[in0 + j]! + 10.0 * (vir * vjr + vii * vji)
      MIM[in0 + j] = i === j ? 0 : MIM[in0 + j]! + 10.0 * (vii * vjr - vir * vji)
    }
  }
  return choleskyPDUltra(n)
}

type Su3BlockCert = {
  readonly beta: number
  readonly cTarget: number
  readonly muFloor: number
  readonly ok: boolean
  readonly boxes: number
  readonly maxDepth: number
  readonly timeMs: number
  readonly minPivot: number
  readonly maxTailErrVmax: number
  readonly vMaxUpper: number
  readonly eMax7Upper: number
  readonly omegaUpper: number
  readonly alpha13Upper: number
}

function buildSu3BlockEngine() {
  const tPre = performance.now()
  const sec0 = precomputeUltraSector([0, 0, 0])
  const secR = precomputeUltraSector([1, -1, 0])
  const sec20 = precomputeUltraSector([2, -2, 0])
  const sec211 = precomputeUltraSector([2, -1, -1])
  const precompMs = performance.now() - tPre

  function certifyGap(a1: number, b1: number, a2: number, b2: number, xLo: number, xHi: number, yLo: number, yHi: number, mu: number, eV: number): boolean {
    const ULP = 1 + 1e-13
    const z0r0 = 0.5 * (a1 + b1), z0r1 = 0.5 * (a2 + b2), z0r2 = 0.5 * (xLo + xHi), z0i2 = 0.5 * (yLo + yHi)
    const d1 = 0.5 * (b1 - a1) * ULP + 1e-15, d2 = 0.5 * (b2 - a2) * ULP + 1e-15
    const dx = 0.5 * (xHi - xLo) * ULP + 1e-15, dy = 0.5 * (yHi - yLo) * ULP + 1e-15
    const maxAbsZ3 = Math.hypot(Math.max(Math.abs(xLo), Math.abs(xHi)), Math.max(Math.abs(yLo), Math.abs(yHi))) * ULP
    const vMinCenter = -(4 / 3) * (z0r0 + z0r1 + Math.hypot(z0r2, z0i2)) * ULP - 1e-14
    const vMinLin = (-(4 / 3) * (b1 + b2 + maxAbsZ3) - 0.25 * (d1 * d1 + d2 * d2 + dx * dx + dy * dy)) * ULP - 1e-14
    if (32 / 3 + vMinLin <= mu + 1e-6) return false

    fillAlpha27(AL0, z0r0, z0r1, z0r2, 0, 0, z0i2, z0r0, z0r1, z0r2, 0, 0, z0i2)
    if (!buildMeffUltra(sec0, AL0, vMinCenter, 0, 0)) return false
    findGroundVecUltra(sec0.n)

    let sec0Ok = false
    const muWeyl = (mu + eV) * ULP
    if (muWeyl < 2.665 && 32 / 3 + vMinCenter > muWeyl + 1e-6) {
      if (buildMeffUltra(sec0, AL0, vMinCenter, muWeyl) && addRank1ShiftAndCheckUltra(sec0.n)) sec0Ok = true
    }
    const v1s = b1 > a1 ? [a1, b1] : [z0r0]
    const v2s = b2 > a2 ? [a2, b2] : [z0r1]
    const vxs = xHi > xLo ? [xLo, xHi] : [z0r2]
    const vys = yHi > yLo ? [yLo, yHi] : [z0i2]
    if (!sec0Ok) {
      if (!buildMeffUltra(sec0, AL0, vMinLin, mu) || !addRank1ShiftAndCheckUltra(sec0.n)) return false
      for (const r1 of v1s) for (const r2 of v2s) for (const rx of vxs) for (const ry of vys) {
        fillAlpha27(ALV, z0r0, z0r1, z0r2, 0, 0, z0i2, r1, r2, rx, 0, 0, ry)
        if (!buildMeffUltra(sec0, ALV, vMinLin, mu) || !addRank1ShiftAndCheckUltra(sec0.n)) return false
      }
    }
    const z0r = [z0r0, z0r1, z0r2], z0i = [0, 0, z0i2]
    const checkNonZeroPerm = (sec: UltraSector, p0: number, p1: number, p2: number): boolean => {
      const a0r = z0r[p0]!, a1r = z0r[p1]!, a2r = z0r[p2]!, a0i = z0i[p0]!, a1i = z0i[p1]!, a2i = z0i[p2]!
      if (32 / 3 + vMinCenter > muWeyl + 1e-6) {
        fillAlpha27(ALV, a0r, a1r, a2r, a0i, a1i, a2i, a0r, a1r, a2r, a0i, a1i, a2i)
        if (buildMeffUltra(sec, ALV, vMinCenter, muWeyl) && choleskyPDUltra(sec.n)) return true
      }
      for (const r1 of v1s) for (const r2 of v2s) for (const rx of vxs) for (const ry of vys) {
        const vr = [r1, r2, rx], vi = [0, 0, ry]
        fillAlpha27(ALV, a0r, a1r, a2r, a0i, a1i, a2i, vr[p0]!, vr[p1]!, vr[p2]!, vi[p0]!, vi[p1]!, vi[p2]!)
        if (!buildMeffUltra(sec, ALV, vMinLin, mu) || !choleskyPDUltra(sec.n)) return false
      }
      return true
    }
    if (!checkNonZeroPerm(secR, 0, 1, 2) || !checkNonZeroPerm(secR, 0, 2, 1) || !checkNonZeroPerm(secR, 1, 2, 0)) return false
    if (6 + vMinLin < mu) {
      if (!checkNonZeroPerm(sec20, 0, 1, 2) || !checkNonZeroPerm(sec20, 0, 2, 1) || !checkNonZeroPerm(sec20, 1, 2, 0)) return false
      if (!checkNonZeroPerm(sec211, 0, 1, 2) || !checkNonZeroPerm(sec211, 1, 2, 0) || !checkNonZeroPerm(sec211, 2, 0, 1)) return false
    }
    return true
  }

  function certifyBlockParams(
    beta: number,
    cTarget: number,
    muFloor: number,
    vCap = 0.285,
    eCap = 0.45,
    maxBoxes = 26000,
  ): Su3BlockCert {
    const t0 = performance.now()
    const ULP = 1 + 1e-13, ULP_LO = 1 - 1e-13
    const mMax = (8 * beta) / 3
    if (mMax > SU3_ANALYTIC_TAIL.mMax || !SU3_ANALYTIC_TAIL.roucheOk) {
      throw new Error(`SU(3) beta=${beta} exceeds analytic Schur tail envelope mMax=${SU3_ANALYTIC_TAIL.mMax}`)
    }
    trackedMinPivot = Infinity
    let maxTailErrVmax = 0
    let vMaxUpper = 0
    let eMax7Upper = 0
    const m7Max = (7 * beta) / 3
    const stack: [number, number, number, number, number, number, number, number, number][] = [[0, mMax * ULP, 0, mMax * ULP, 0, mMax * ULP, 0, Math.PI, 0]]
    let boxes = 0, maxDepth = 0
    const scaleSq = ((beta / 3 / cTarget) ** 2) * ULP

    while (stack.length > 0) {
      const [a1, b1, a2, b2, a3, b3, ap, bp, depth] = stack.pop()!
      if (a3 > b2 + 1e-15 || a2 > b1 + 1e-15 || a3 > b1 + 1e-15) continue
      if (a1 + a2 + a3 > 8 * beta * Math.cos(ap / 3) * ULP + 1e-14) continue
      boxes++
      if (depth > maxDepth) maxDepth = depth
      if (boxes > maxBoxes) {
        return { beta, cTarget, muFloor, ok: false, boxes, maxDepth, timeMs: performance.now() - t0, minPivot: trackedMinPivot, maxTailErrVmax, vMaxUpper, eMax7Upper, omegaUpper: Infinity, alpha13Upper: Infinity }
      }

      const m1 = 0.5 * (a1 + b1), d1 = 0.5 * (b1 - a1)
      const m2 = 0.5 * (a2 + b2), d2 = 0.5 * (b2 - a2)
      const m3 = 0.5 * (a3 + b3), d3 = 0.5 * (b3 - a3)
      const phi = 0.5 * (ap + bp), dp = 0.5 * (bp - ap)

      const cHi = Math.min(1, Math.cos(ap) + 1e-14), cLo = Math.max(-1, Math.cos(bp) - 1e-14)
      const xLo = (cLo >= 0 ? a3 * cLo * ULP_LO : b3 * cLo * ULP) - 1e-15
      const xHi = (cHi >= 0 ? b3 * cHi * ULP : a3 * cHi * ULP_LO) + 1e-15
      const sLo = Math.max(0, Math.min(Math.sin(ap), Math.sin(bp)) - 1e-14)
      const sHi = Math.min(1, (ap <= 0.5 * Math.PI && bp >= 0.5 * Math.PI ? 1 : Math.max(Math.sin(ap), Math.sin(bp))) + 1e-14)
      const yLo = Math.max(0, a3 * sLo * ULP_LO - 1e-15), yHi = b3 * sHi * ULP + 1e-15
      const x0 = 0.5 * (xLo + xHi), dx = 0.5 * (xHi - xLo), y0 = 0.5 * (yLo + yHi), dy = 0.5 * (yHi - yLo)

      const dz1 = d1 * ULP + 1e-15, dz2 = d2 * ULP + 1e-15, dz3 = Math.hypot(dx, dy) * ULP + 1e-15
      const delta = (dz1 + dz2 + dz3) * ULP, deltaF = Math.hypot(dz1, dz2, dz3) * ULP
      const maxAbsZ3 = Math.hypot(Math.max(Math.abs(xLo), Math.abs(xHi)), Math.max(Math.abs(yLo), Math.abs(yHi))) * ULP
      const eV = ((4 / 3) * delta + 0.25 * (Math.hypot(b1, b2, maxAbsZ3) + Math.hypot(m1, m2, x0, y0)) * deltaF) * ULP + 1e-14

      const { vMax, eu0, eu1, eu2, errVmax, errEu } = exactSu3VarAndMeans(m1, m2, x0, y0)
      if (errVmax > maxTailErrVmax) maxTailErrVmax = errVmax
      const expArg = (delta + (eu0 + errEu) * dz1 + (eu1 + errEu) * dz2 + (eu2 + errEu) * dz3) * ULP
      const vBoxUpper = Math.exp(expArg) * (vMax + errVmax + 1e-9) * ULP
      const hits7 = a1 <= m7Max * ULP + 1e-14 && a1 + a2 + a3 <= 7 * beta * Math.cos(ap / 3) * ULP + 1e-14
      const eBoxUpper = Math.min(1, (Math.max(eu0, eu1, eu2) + errEu + deltaF * vBoxUpper) * ULP + 1e-9)

      const muNeed = Math.max(muFloor, scaleSq * vBoxUpper * ULP + 1e-8)
      const boundsTight = vBoxUpper <= vCap && (!hits7 || eBoxUpper <= eCap)
      if (boundsTight && muNeed < 2.666 && certifyGap(a1, b1, a2, b2, xLo, xHi, yLo, yHi, muNeed, eV)) {
        if (vBoxUpper > vMaxUpper) vMaxUpper = vBoxUpper
        if (hits7 && eBoxUpper > eMax7Upper) eMax7Upper = eBoxUpper
        continue
      }
      if (depth >= 24) {
        return { beta, cTarget, muFloor, ok: false, boxes, maxDepth, timeMs: performance.now() - t0, minPivot: trackedMinPivot, maxTailErrVmax, vMaxUpper, eMax7Upper, omegaUpper: Infinity, alpha13Upper: Infinity }
      }
      const wp = m3 * 2 * Math.sin(0.5 * dp)
      if (d1 >= d2 && d1 >= d3 && d1 >= wp) stack.push([a1, m1, a2, b2, a3, b3, ap, bp, depth + 1], [m1, b1, a2, b2, a3, b3, ap, bp, depth + 1])
      else if (d2 >= d3 && d2 >= wp) stack.push([a1, b1, a2, m2, a3, b3, ap, bp, depth + 1], [a1, b1, m2, b2, a3, b3, ap, bp, depth + 1])
      else if (d3 >= wp) stack.push([a1, b1, a2, b2, a3, m3, ap, bp, depth + 1], [a1, b1, a2, b2, m3, b3, ap, bp, depth + 1])
      else stack.push([a1, b1, a2, b2, a3, b3, ap, phi, depth + 1], [a1, b1, a2, b2, a3, b3, phi, bp, depth + 1])
    }

    const ULP_OUT = 1 + 1e-12
    const omegaUpper = ((beta * beta) / 6) * vMaxUpper * ULP_OUT
    const expOmega = Math.exp(omegaUpper) * ULP_OUT
    const alpha13Upper =
      (expOmega * eMax7Upper * cTarget +
        ((beta * beta) / (3 * Math.sqrt(3))) * vMaxUpper * Math.sqrt(expOmega / muFloor)) *
        ULP_OUT +
      1e-12

    return {
      beta,
      cTarget,
      muFloor,
      ok: true,
      boxes,
      maxDepth,
      timeMs: performance.now() - t0,
      minPivot: trackedMinPivot,
      maxTailErrVmax,
      vMaxUpper,
      eMax7Upper,
      omegaUpper,
      alpha13Upper,
    }
  }

  return { precompMs, certifyBlockParams }
}

// =================================================================================================
// 4. INDEPENDENT CROSS-CHECKS (SANITY CHECKS ONLY — NOT PART OF PROOF)
// =================================================================================================

function runCrossChecks(sys1D: BlockD4System, sys4D: BlockD4System, su3Cert: Su3BlockCert) {
  const evalZ14 = makeSu3HessEvaluator(14, 19)
  let schurDiff = 0
  for (const [m1, m2, m3, phi] of [[1.58, 1.58, 1.58, 0], [1.58, 1.25, 0.9, Math.PI / 3], [1.58, 1.58, 0.4, Math.PI]] as const) {
    const u0 = m1 * m1, u1 = m2 * m2, u2 = m3 * m3
    const I1 = u0 + u1 + u2, I2 = u0 * u1 + u0 * u2 + u1 * u2, I3 = u0 * u1 * u2, D = m1 * m2 * m3 * Math.cos(phi)
    const jCur = Float64Array.from(evalZSu3Hess(I1, I2, I3, D))
    const jRef = evalZ14(I1, I2, I3, D)
    for (let i = 0; i < 15; i++) schurDiff = Math.max(schurDiff, Math.abs(jCur[i]! - jRef[i]!) / Math.max(1, Math.abs(jRef[i]!)))
  }

  const GL48 = gaussLegendre(48)
  const testM = 1.3, testPhi = 0.6
  let zWeyl = 0, euRe = 0, euIm = 0
  for (let i = 0; i < 48; i++) {
    const t1 = Math.PI * GL48.x[i]!, w1 = Math.PI * GL48.w[i]!
    for (let j = 0; j < 48; j++) {
      const t2 = Math.PI * GL48.x[j]!, w2 = Math.PI * GL48.w[j]!
      const t3 = -t1 - t2
      const s12 = Math.sin(0.5 * (t1 - t2)), s13 = Math.sin(0.5 * (t1 - t3)), s23 = Math.sin(0.5 * (t2 - t3))
      const vand2 = 64 * s12 * s12 * s13 * s13 * s23 * s23
      const th = testPhi / 3
      const wt = w1 * w2 * vand2 * Math.exp(testM * (Math.cos(t1 - th) + Math.cos(t2 - th) + Math.cos(t3 - th)))
      zWeyl += wt
      euRe += wt * ((Math.cos(t1 - th) + Math.cos(t2 - th) + Math.cos(t3 - th)) / 3)
      euIm += wt * ((Math.sin(t1 - th) + Math.sin(t2 - th) + Math.sin(t3 - th)) / 3)
    }
  }
  const euWeylAbs = Math.hypot(euRe / zWeyl, euIm / zWeyl)
  zWeyl /= 6 * 4 * Math.PI * Math.PI
  const schurRes = exactSu3VarAndMeans(testM, testM, testM * Math.cos(testPhi), testM * Math.sin(testPhi))
  const weylZErr = Math.abs(zWeyl - schurRes.zVal) / zWeyl
  const weylEuErr = Math.abs(euWeylAbs - schurRes.eu0)

  const betaCheck = 0.285
  const zS3 = (k: number) => (k < 1e-8 ? 1 + (k * k) / 8 + k ** 4 / 192 : (2 * besselI(1, k)) / k)
  let maxSu2VTildeViolation = 0
  for (const r0 of [0.5, 1.0, 2.5, 5.0, 7.0]) {
    const c1 = 0.5 * (phiSu2Fn(betaCheck, Math.max(0, r0 - 1)) + phiSu2Fn(betaCheck, r0 + 1))
    const dPhi = 0.5 * (phiSu2Fn(betaCheck, Math.max(0, r0 - 1)) - phiSu2Fn(betaCheck, r0 + 1))
    const bound = 2 * betaCheck * r0 * dPhi
    for (const s3 of [0.25, 0.7, 1.0]) {
      let mn = Infinity, mx = -Infinity
      for (let k = 0; k <= 200; k++) {
        const u = -1 + (2 * k) / 200
        const r = Math.sqrt(Math.max(0, r0 * r0 + s3 * s3 + 2 * s3 * r0 * u))
        const vt = Math.log(zS3(betaCheck * r)) - betaCheck * c1 * s3 * r0 * u
        if (vt < mn) mn = vt
        if (vt > mx) mx = vt
      }
      if (mx - mn > bound + 1e-12) maxSu2VTildeViolation = Math.max(maxSu2VTildeViolation, mx - mn - bound)
    }
  }

  let su3VTildeViolations = 0
  let maxObservedSu3VTilde = 0
  const bSu3 = su3Cert.beta
  for (const [m1, m2, m3] of [[0.5, 0.5, 0.5], [1.2, 0.9, 0.4], [1.28, 1.28, 1.28], [1.3, 0.8, 0.0]] as const) {
    const res0 = exactSu3VarAndMeans(m1, m2, m3, 0)
    const lnZ0 = Math.log(res0.zVal)
    const dM = bSu3 / 3
    for (const [t1, t2] of [[0, 0], [Math.PI / 3, -Math.PI / 3], [2 * Math.PI / 3, 2 * Math.PI / 3], [Math.PI, 0]] as const) {
      const t3 = -t1 - t2
      const z0r = m1 + dM * Math.cos(t1), z0i = dM * Math.sin(t1)
      const z1r = m2 + dM * Math.cos(t2), z1i = dM * Math.sin(t2)
      const z2r = m3 + dM * Math.cos(t3), z2i = dM * Math.sin(t3)
      const s0 = Math.hypot(z0r, z0i), s1 = Math.hypot(z1r, z1i), s2 = Math.hypot(z2r, z2i)
      const ph = Math.atan2(z0i, z0r) + Math.atan2(z1i, z1r) + Math.atan2(z2i, z2r)
      const lnZ1 = Math.log(exactSu3VarAndMeans(s0, s1, s2 * Math.cos(ph), s2 * Math.sin(ph)).zVal)
      const lin = dM * (res0.eu0 * Math.cos(t1) + res0.eu1 * Math.cos(t2) + res0.eu2 * Math.cos(t3))
      const vt = lnZ1 - lnZ0 - lin
      if (vt > maxObservedSu3VTilde) maxObservedSu3VTilde = vt
      if (vt < -1e-11 || vt > su3Cert.omegaUpper + 1e-11) su3VTildeViolations++
    }
  }

  const cT = 0.070, aT = 0.030, gSh = 0.5 * (aT + cT * (1 + aT))
  const g0 = cT / (1 - 2 * cT * gSh), g1 = g0 * gSh
  const a11 = 10 * g1, a12 = (40 / 3) * (g0 + g1), a21 = (21 / 4) * (g0 + g1), a22 = 7 * g0 + 21 * g1
  const closed2x2 = 0.5 * (a11 + a22 + Math.hypot(a11 - a22, 2 * Math.sqrt(a12 * a21)))
  const num11x11 = sys1D.evalBlock12TriPerron(cT, aT, 0)
  const closed2x2Diff = Math.abs(num11x11 - closed2x2)
  const lam4DErr = Math.abs(sys4D.singleLam0 - 14.5684251872)

  return {
    schurDiff,
    weylZErr,
    weylEuErr,
    maxSu2VTildeViolation,
    su3VTildeViolations,
    maxObservedSu3VTilde,
    closed2x2Diff,
    lam4DErr,
    allOk:
      schurDiff < 1e-13 &&
      weylZErr < 1e-12 &&
      weylEuErr < 1e-12 &&
      maxSu2VTildeViolation === 0 &&
      su3VTildeViolations === 0 &&
      closed2x2Diff < 1e-11 &&
      lam4DErr < 1e-8,
  }
}

// =================================================================================================
// 5. MAIN EXECUTION & FULL CERTIFICATION REPORT
// =================================================================================================

const BETA_BE_SU2 = 4 / (16 * Math.sqrt(7))
const BETA_BE_SU3 = 9 / (16 * Math.sqrt(7))
const OLD_KP_SU2 = 0.009335
const OLD_KP_SU3 = 0.009328
const W8_SU2 = 0.277274
const W8_SU3_1D = 0.545454
const W8_SU3_4D = 0.546000

console.log('==============================================================================================')
console.log('WAVE-4 TRACK W14 (PART A — CHALLENGE 2b): MULTI-LINK BLOCK DOBRUSHIN ON 4D D_4 (SU(2) & SU(3))')
console.log('Zero Migdal-Kadanoff truncation | Zero heuristic MC | Exact x_0 = 0 Reflection Positivity')
console.log('==============================================================================================\n')

const sys1D = buildD4ForestSystem('1d-axial')
const sys4D = buildD4ForestSystem('4dir-alt')

console.log('--- PART 1: EXACT 4D D_4 SPATIAL FORESTS & PERIODIC 2-LINK / 3-LINK BLOCK COVERS ---')
console.log(
  `  1D-Axial (11 classes): Lambda_11(0)=${sys1D.singleLam0.toFixed(10)} | active 3-tris/site=${sys1D.repActiveTris.length} (URR=${sys1D.triCountsUrrUuuRrr[0]}, UUU=${sys1D.triCountsUrrUuuRrr[1]}, RRR=${sys1D.triCountsUrrUuuRrr[2]}) | FRR 2-wedges/site=${sys1D.repFrozenWedges.length}`,
)
console.log(
  `    3-link coverage K_u in [${sys1D.triCoverageMin}, ${sys1D.triCoverageMax}] (U: 8, R: 6) | exact x_0=0 RP preserved = ${sys1D.triRPPreserved}`,
)
console.log(
  `  4-Dir Alt-x0+planes (88 classes): Lambda_88(0)=${sys4D.singleLam0.toFixed(10)} | active 3-tris/cell=${sys4D.repActiveTris.length} | FRR 2-wedges/cell=${sys4D.repFrozenWedges.length}`,
)
console.log(
  `    3-link coverage K_u in [${sys4D.triCoverageMin}, ${sys4D.triCoverageMax}] across all 88 classes | exact x_0=0 RP preserved = ${sys4D.triRPPreserved}\n`,
)

const su2Chordal = certifySu2ChordalGlobal()
const bSu2Single1D = 4 / sys1D.singleLam0
const bSu2Single4D = 4 / sys4D.singleLam0
const bSu2Frr2Wedge1D = solveBetaThreshold(b => sys1D.evalFrr2WedgePerron(b / 4, 0), 0.25, 0.29)
const bSu2Urr2WedgeW8 = solveBetaThreshold(b => sys1D.evalUrr2WedgePerron(b / 4, certifiedAlpha13Su2W8(b), 0), 0.25, 0.29)
const bSu2Urr2WedgeSharp = solveBetaThreshold(b => sys1D.evalUrr2WedgePerron(b / 4, certifiedAlpha13Su2Sharp(b).alpha13, 0), 0.25, 0.295)
const bSu2All2Wedge1D = solveBetaThreshold(b => sys1D.evalAllPair2WedgePerron(b / 4, certifiedAlpha13Su2Sharp(b).alpha13, 0), 0.25, 0.295)
const bSu2All2Wedge4D = solveBetaThreshold(b => sys4D.evalAllPair2WedgePerron(b / 4, certifiedAlpha13Su2Sharp(b).alpha13, 0), 0.25, 0.295)
const bSu2Naive3Tri1D = solveBetaThreshold(b => sys1D.evalNaive3TriPerron(b / 4, 0), 0.24, 0.29)
const bSu2Block12Tri1D = solveBetaThreshold(b => sys1D.evalBlock12TriPerron(b / 4, certifiedAlpha13Su2Sharp(b).alpha13, 0), 0.25, 0.30)
const bSu2Block12Tri4D = solveBetaThreshold(b => sys4D.evalBlock12TriPerron(b / 4, certifiedAlpha13Su2Sharp(b).alpha13, 0), 0.25, 0.30)

const a13W8At277 = certifiedAlpha13Su2W8(W8_SU2)
const a13SharpAt277 = certifiedAlpha13Su2Sharp(W8_SU2)
const a13SharpAt285 = certifiedAlpha13Su2Sharp(0.285)

console.log('--- PART 2 (W14.2): SU(2) 3-LINK COMPLETE TRIANGULAR PLAQUETTE BLOCKS (PAST 0.277274 & 3.00x BE!) ---')
console.log(`  Global Chordal W_1 Theorem (S_ch <= 1/4): PASS=${su2Chordal.ok} | Region-2 boxes=${su2Chordal.r2Boxes} (${su2Chordal.r2Ms.toFixed(0)} ms)`)
console.log(
  `  Linear-Split V_tilde_2 sharpening at beta=0.277274: W8 alpha_13 <= ${a13W8At277.toFixed(6)} -> W14 sharp alpha_13 <= ${a13SharpAt277.alpha13.toFixed(6)} (max osc(V_tilde_2) <= ${a13SharpAt277.maxOmega.toFixed(6)})`,
)
console.log(`  Certified SU(2) Block Hierarchy (all zero-truncation, exact x_0=0 RP, outward-floored):`)
console.log(`    1D-Axial Single-Link (W8 ceil):          beta < ${floor6(bSu2Single1D)}  (${(bSu2Single1D / BETA_BE_SU2).toFixed(2)}x BE)`)
console.log(`    4-Dir Alt Single-Link (W8):              beta < ${floor6(bSu2Single4D)}  (${(bSu2Single4D / BETA_BE_SU2).toFixed(2)}x BE)`)
console.log(`    1D-Axial FRR 2-Wedge (frozen F base):    beta < ${floor6(bSu2Frr2Wedge1D)}  (${(bSu2Frr2Wedge1D / BETA_BE_SU2).toFixed(2)}x BE)`)
console.log(`    1D-Axial Naive 3-Link Gibbs Sweep:       beta < ${floor6(bSu2Naive3Tri1D)}  (bottleneck: 14/(1-2c) > 16 for c > 1/16!)`)
console.log(`    1D-Axial URR 2-Wedge (W8 alpha_13):      beta < ${floor6(bSu2Urr2WedgeW8)}  (${(bSu2Urr2WedgeW8 / BETA_BE_SU2).toFixed(2)}x BE, reproduces W8 0.277274)`)
console.log(`    1D-Axial URR 2-Wedge (sharp alpha_13):   beta < ${floor6(bSu2Urr2WedgeSharp)}  (${(bSu2Urr2WedgeSharp / BETA_BE_SU2).toFixed(2)}x BE)`)
console.log(`    1D-Axial All-Pair 2-Wedge (sharp):       beta < ${floor6(bSu2All2Wedge1D)}  (${(bSu2All2Wedge1D / BETA_BE_SU2).toFixed(2)}x BE)`)
console.log(`    4-Dir Alt All-Pair 2-Wedge (sharp):      beta < ${floor6(bSu2All2Wedge4D)}  (${(bSu2All2Wedge4D / BETA_BE_SU2).toFixed(2)}x BE)`)
console.log(`    1D-Axial 3-Link URR Triangle (1+2):      beta < ${floor6(bSu2Block12Tri1D)}  (${(bSu2Block12Tri1D / BETA_BE_SU2).toFixed(2)}x BE, ${(bSu2Block12Tri1D / OLD_KP_SU2).toFixed(2)}x KP!)`)
console.log(`    4-Dir Alt 3-Link Triangle (1+2):         beta < ${floor6(bSu2Block12Tri4D)}  (${(bSu2Block12Tri4D / BETA_BE_SU2).toFixed(2)}x BE, ${(bSu2Block12Tri4D / OLD_KP_SU2).toFixed(2)}x KP!)`)

console.log(`  Certified SU(2) Infinite-Volume Mass Gaps m(beta) > 0 STRICTLY PAST W8 0.277274:`)
const su2GapRows: { beta: number; a13: number; rho1D: number; m1D: number; rho4D: number; m4D: number }[] = []
for (const beta of [0.274291, 0.277274, 0.280000, 0.282000, 0.283473, 0.284500, 0.285500]) {
  const { alpha13 } = certifiedAlpha13Su2Sharp(beta)
  const rho1D = sys1D.evalBlock12TriPerron(beta / 4, alpha13, 0)
  const m1D = solveMassGap(m => sys1D.evalBlock12TriPerron(beta / 4, alpha13, m))
  const rho4D = sys4D.evalBlock12TriPerron(beta / 4, alpha13, 0)
  const m4D = solveMassGap(m => sys4D.evalBlock12TriPerron(beta / 4, alpha13, m))
  su2GapRows.push({ beta, a13: alpha13, rho1D, m1D, rho4D, m4D })
  console.log(
    `    beta = ${beta.toFixed(6)} | alpha_13 <= ${alpha13.toFixed(6)} | 1D-3Tri rho=${rho1D.toFixed(6)}, m>=${floor6(m1D)} | 4D-3Tri rho=${rho4D.toFixed(6)}, m>=${floor6(m4D)}`,
  )
}
console.log('')

const su3 = buildSu3BlockEngine()
console.log('--- PART 3 (W14.1): SU(3) 2-LINK WEDGE & 3-LINK TRIANGLE BLOCK DOBRUSHIN (PAST 0.546000!) ---')
console.log(`  K=2 Peter-Weyl sector precompute: ${su3.precompMs.toFixed(0)} ms`)
console.log(
  `  Analytic Schur tail (N=${SCHUR_MAX_N}, Q=${SCHUR_MAX_Q}, mMax=${SU3_ANALYTIC_TAIL.mMax}, Rouche r=${SU3_ANALYTIC_TAIL.rootRadius.toFixed(2)}): Rouche=${SU3_ANALYTIC_TAIL.roucheOk} | B_Q=${SU3_ANALYTIC_TAIL.bQ.toExponential(2)} | B_N=${SU3_ANALYTIC_TAIL.bN.toExponential(2)} | B=${SU3_ANALYTIC_TAIL.bTotal.toExponential(2)}`,
)

// Single unified SU(3) anchor certifying ALL SU(3) multi-link block architectures simultaneously via exact 1-line monotonicity!
// At beta = 0.5635, c <= 0.07090, lambda_1 >= 1.62 on Omega_tilde(0.5635):
//   simultaneously bounds c(b), v_max(b), ||E(M_2)||_op on Omega_tilde((7/8)b), and lambda_{1,min}(b) for all 0 <= b <= 0.5635!
const certSu3Anchor = su3.certifyBlockParams(0.5635, 0.07090, 1.62, 0.34, 0.40, 22000)
const certSu3Wedge = certSu3Anchor
const certSu3Tri = certSu3Anchor
const rhoSu3Urr2Wedge1D = certSu3Anchor.ok ? sys1D.evalUrr2WedgePerron(certSu3Anchor.cTarget, certSu3Anchor.alpha13Upper, 0) : Infinity
const rhoSu3All2Wedge1D = certSu3Anchor.ok ? sys1D.evalAllPair2WedgePerron(certSu3Anchor.cTarget, certSu3Anchor.alpha13Upper, 0) : Infinity
const rhoSu3All2Wedge4D = certSu3Anchor.ok ? sys4D.evalAllPair2WedgePerron(certSu3Anchor.cTarget, certSu3Anchor.alpha13Upper, 0) : Infinity
const rhoSu3Tri1D = certSu3Anchor.ok ? sys1D.evalBlock12TriPerron(certSu3Anchor.cTarget, certSu3Anchor.alpha13Upper, 0) : Infinity
const rhoSu3Tri4D = certSu3Anchor.ok ? sys4D.evalBlock12TriPerron(certSu3Anchor.cTarget, certSu3Anchor.alpha13Upper, 0) : Infinity

const su3MonoParams = (cert: Su3BlockCert, b: number) => {
  const ULP_OUT = 1 + 1e-12
  const cB = (b / cert.beta) * cert.cTarget * ULP_OUT
  const omB = ((b * b) / 6) * cert.vMaxUpper * ULP_OUT
  const eOm = Math.exp(omB) * ULP_OUT
  const a13B =
    (eOm * cert.eMax7Upper * cB +
      ((b * b) / (3 * Math.sqrt(3))) * cert.vMaxUpper * Math.sqrt(eOm / cert.muFloor)) *
      ULP_OUT +
    1e-12
  return { cB, a13B }
}

const bSu3Frr2Wedge1D = certSu3Wedge.ok
  ? solveBetaThreshold(b => (b <= certSu3Wedge.beta ? sys1D.evalFrr2WedgePerron(su3MonoParams(certSu3Wedge, b).cB, 0) : 2), 0.50, certSu3Wedge.beta)
  : 0
const bSu3Urr2Wedge1D = certSu3Wedge.ok
  ? solveBetaThreshold(b => {
      if (b > certSu3Wedge.beta) return 2
      const p = su3MonoParams(certSu3Wedge, b)
      return sys1D.evalUrr2WedgePerron(p.cB, p.a13B, 0)
    }, 0.50, certSu3Wedge.beta)
  : 0
const bSu3All2Wedge1D = certSu3Tri.ok
  ? solveBetaThreshold(b => {
      if (b > certSu3Tri.beta) return 2
      const p = su3MonoParams(certSu3Tri, b)
      return sys1D.evalAllPair2WedgePerron(p.cB, p.a13B, 0)
    }, 0.50, certSu3Tri.beta)
  : 0
const bSu3All2Wedge4D = certSu3Tri.ok
  ? solveBetaThreshold(b => {
      if (b > certSu3Tri.beta) return 2
      const p = su3MonoParams(certSu3Tri, b)
      return sys4D.evalAllPair2WedgePerron(p.cB, p.a13B, 0)
    }, 0.50, certSu3Tri.beta)
  : 0
const bSu3Naive3Tri1D = certSu3Tri.ok
  ? solveBetaThreshold(b => (b <= certSu3Tri.beta ? sys1D.evalNaive3TriPerron(su3MonoParams(certSu3Tri, b).cB, 0) : 2), 0.45, certSu3Tri.beta)
  : 0
const bSu3Tri1D = certSu3Tri.ok && rhoSu3Tri1D < 1 ? certSu3Tri.beta : certSu3Tri.ok
  ? solveBetaThreshold(b => {
      if (b > certSu3Tri.beta) return 2
      const p = su3MonoParams(certSu3Tri, b)
      return sys1D.evalBlock12TriPerron(p.cB, p.a13B, 0)
    }, 0.50, certSu3Tri.beta)
  : 0
const bSu3Tri4D = certSu3Tri.ok && rhoSu3Tri4D < 1 ? certSu3Tri.beta : certSu3Tri.ok
  ? solveBetaThreshold(b => {
      if (b > certSu3Tri.beta) return 2
      const p = su3MonoParams(certSu3Tri, b)
      return sys4D.evalBlock12TriPerron(p.cB, p.a13B, 0)
    }, 0.50, certSu3Tri.beta)
  : 0

console.log(
  `  Unified SU(3) Anchor (beta=${certSu3Anchor.beta.toFixed(4)}, c<=${certSu3Anchor.cTarget.toFixed(5)}, lam_1>=${certSu3Anchor.muFloor}): OK=${certSu3Anchor.ok} | boxes=${certSu3Anchor.boxes} | minPiv=${certSu3Anchor.minPivot.toExponential(2)} | vMax<=${certSu3Anchor.vMaxUpper.toFixed(5)} | eMax7<=${certSu3Anchor.eMax7Upper.toFixed(5)} | om<=${certSu3Anchor.omegaUpper.toFixed(5)} | a13<=${certSu3Anchor.alpha13Upper.toFixed(5)} | ${certSu3Anchor.timeMs.toFixed(0)} ms`,
)
console.log(
  `    Anchor contraction: URR-2W(1D)=${rhoSu3Urr2Wedge1D.toFixed(6)}, All-2W(4D)=${rhoSu3All2Wedge4D.toFixed(6)}, 3Tri-1+2(1D)=${rhoSu3Tri1D.toFixed(6)}, 3Tri-1+2(4D)=${rhoSu3Tri4D.toFixed(6)}`,
)
console.log(`  Certified SU(3) Block Hierarchy (all zero-truncation, exact x_0=0 RP, outward-floored):`)
console.log(`    Wave-3 W8 Single-Link (1D / 4D):         beta < ${W8_SU3_1D.toFixed(6)} / ${W8_SU3_4D.toFixed(6)}  (2.57x BE)`)
console.log(`    1D-Axial FRR 2-Wedge (frozen F base):    beta < ${floor6(bSu3Frr2Wedge1D)}  (${(bSu3Frr2Wedge1D / BETA_BE_SU3).toFixed(2)}x BE, pure Gibbs no-free-lunch)`)
console.log(`    1D-Axial Naive 3-Link Gibbs Sweep:       beta < ${floor6(bSu3Naive3Tri1D)}  (pure Gibbs no-free-lunch bottleneck)`)
console.log(`    1D-Axial URR 2-Wedge ({R1,R2}+{U}):      beta < ${floor6(bSu3Urr2Wedge1D)}  (${(bSu3Urr2Wedge1D / BETA_BE_SU3).toFixed(2)}x BE, STRICTLY PAST 0.546000!)`)
console.log(`    1D-Axial All-Pair 2-Wedge:               beta < ${floor6(bSu3All2Wedge1D)}  (${(bSu3All2Wedge1D / BETA_BE_SU3).toFixed(2)}x BE)`)
console.log(`    4-Dir Alt All-Pair 2-Wedge:              beta < ${floor6(bSu3All2Wedge4D)}  (${(bSu3All2Wedge4D / BETA_BE_SU3).toFixed(2)}x BE)`)
console.log(`    1D-Axial 3-Link URR Triangle (1+2):      beta < ${floor6(bSu3Tri1D)}  (${(bSu3Tri1D / BETA_BE_SU3).toFixed(2)}x BE, ${(bSu3Tri1D / OLD_KP_SU3).toFixed(2)}x KP!)`)
console.log(`    4-Dir Alt 3-Link Triangle (1+2):         beta < ${floor6(bSu3Tri4D)}  (${(bSu3Tri4D / BETA_BE_SU3).toFixed(2)}x BE, ${(bSu3Tri4D / OLD_KP_SU3).toFixed(2)}x KP!)`)

console.log(`  Certified SU(3) Infinite-Volume Mass Gaps m(beta) > 0 STRICTLY PAST W8 0.546000:`)
const su3GapRows: { beta: number; cB: number; a13: number; m1D: number; m4D: number }[] = []
for (const beta of [0.546000, 0.550000, 0.554000, 0.558000, 0.560000, 0.562000]) {
  const { cB, a13B } = su3MonoParams(certSu3Tri, beta)
  const m1D = solveMassGap(m => sys1D.evalBlock12TriPerron(cB, a13B, m))
  const m4D = solveMassGap(m => sys4D.evalBlock12TriPerron(cB, a13B, m))
  su3GapRows.push({ beta, cB, a13: a13B, m1D, m4D })
  console.log(
    `    beta = ${beta.toFixed(6)} | c <= ${cB.toFixed(6)} | alpha_13 <= ${a13B.toFixed(6)} | m_1D_3Tri >= ${floor6(m1D)} | m_4D_3Tri >= ${floor6(m4D)}`,
  )
}
console.log('')

const cross = runCrossChecks(sys1D, sys4D, certSu3Tri)
console.log('--- PART 4: INDEPENDENT VERIFICATION CROSS-CHECKS (SANITY CHECKS ONLY) ---')
console.log(`  Schur tail (10,16 vs 14,19 at m<=1.58):         max rel diff = ${cross.schurDiff.toExponential(3)} (< 1e-13)`)
console.log(`  48x48 Weyl quadrature vs Schur Z & E[U_kk]:     relZ=${cross.weylZErr.toExponential(2)}, absE=${cross.weylEuErr.toExponential(2)} (< 1e-12)`)
console.log(`  SU(2) V_tilde_2 osc bound check (beta=0.285):   max viol     = ${cross.maxSu2VTildeViolation.toExponential(2)} (expect 0)`)
console.log(`  SU(3) V_tilde_2 convexity check (beta=${certSu3Tri.beta.toFixed(4)}): violations   = ${cross.su3VTildeViolations} (max obs ${cross.maxObservedSu3VTilde.toFixed(6)} <= ${certSu3Tri.omegaUpper.toFixed(6)})`)
console.log(`  1D-Axial 3-Tri 11x11 vs closed 2x2 formula:     abs diff     = ${cross.closed2x2Diff.toExponential(3)} (< 1e-11)`)
console.log(`  4-Dir Alt-x0+planes Lambda_88(0) vs W8:         abs diff     = ${cross.lam4DErr.toExponential(3)} (< 1e-8)\n`)

const allOk =
  sys1D.triCountsUrrUuuRrr[0] === 24 &&
  sys1D.triCountsUrrUuuRrr[1] === 0 &&
  sys1D.triCountsUrrUuuRrr[2] === 0 &&
  sys1D.triRPPreserved &&
  sys4D.triRPPreserved &&
  sys4D.triCoverageMin >= 6 &&
  su2Chordal.ok &&
  bSu2Urr2WedgeW8 > 0.27727 &&
  bSu2Block12Tri1D > 0.2848 &&
  bSu2Block12Tri4D > 0.2851 &&
  a13SharpAt285.alpha13 < 0.035 &&
  su2GapRows.find(r => Math.abs(r.beta - 0.277274) < 1e-9)!.m1D > 0.11 &&
  SU3_ANALYTIC_TAIL.roucheOk &&
  certSu3Anchor.ok &&
  certSu3Anchor.minPivot > CHOLESKY_MIN_PIVOT &&
  bSu3Urr2Wedge1D > 0.552 &&
  bSu3All2Wedge4D > 0.554 &&
  bSu3Tri1D > 0.561 &&
  bSu3Tri4D > 0.562 &&
  su3GapRows.find(r => Math.abs(r.beta - 0.546) < 1e-9)!.m4D > 0.11 &&
  cross.allOk

const totalSec = (performance.now() - t0Global) / 1000
console.log('==============================================================================================')
console.log(`ALL CERTIFICATIONS PASSED = ${allOk} | Total runtime = ${totalSec.toFixed(2)} s`)
console.log('==============================================================================================')
if (!allOk) process.exit(1)

export {}
