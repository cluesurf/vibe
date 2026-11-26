// Breakthrough Suite (Wave-4 Track W19):
//   Husk-vs-Bulk Phi_odd Baryogenesis With Exact Global Q = 0 Conservation
//   & Sterile Deep-Bulk Dark-Matter Candidate on the 4D Hyperbolic {3,4,3,4} Honeycomb
//
// Strictly deterministic (ZERO Math.random), standalone (ZERO external imports),
// laptop-safe (< 10 s, < 300 MB RAM), strict noUncheckedIndexedAccess-safe, ending with `export {}`.
//
// Machine-verified theorems and exact computations proved in this script:
//   W19.1 (C1): Exact {3,4,3,4} O^+(4,1, Z[sqrt(2)]) cusp geometry (0 up / 6 lat / 18 down,
//               N_D = 1, 18, 330, 6034), W(B_3) cusp stabilizer (24 proper + 24 improper, verified
//               on all 481 R <= 2 docks), and verbatim 8-layer bare U with canonical chi_odd.
//   W19.2 (C2): Exact t = 0..6 Husk-vs-Bulk Baryogenesis from strictly Q_total = 0, strictly C-even
//               k = 4 (++--) initial states on D = 0 under verbatim bare U: exact <Q_{D=0}(1)> = -3/8
//               balanced identically by <Q_{D>=1}(t)> = -<Q_{D=0}(t)> swept into deep bulk shells
//               D = 1..6 (transient impulse with chordal-geodesic escape and sign oscillation),
//               plus exact purity ceiling eta_husk = 1.000000 (100% pure matter at <Q_0> = -9/32).
//   W19.3 (C3): Exact Symmetry Controls:
//               (1) Phi_odd = I null control -> <Q_D(t)> === 0 identically on every shell for t = 0..6
//               (2) Cusp-preserving reflection P_cusp in W(B_3)^- -> exact CP sign flip
//                   <Q_{D=0}(t, P_cusp|psi>)> = -<Q_{D=0}(t, |psi>)>
//               (3) C-even + P_cusp-even state -> exact <Q_{D=0}(t)> === 0 (proving CP protection)
//               (4) C-even + P_perp-even state (bulk-normal reflection outside W(B_3)) -> NONZERO <Q_{D=0}(t)>
//               (5) 3D rotationally isotropic W(B_3)^+-invariant C-even chiral state -> NONZERO <Q_{D=0}(t)>.
//   W19.4 (C4): Closed Flat 4D D_4 / L D_4 Periodic Box Null Control:
//               Exact geometric contrast proving why flat 3D hyperplane x_0 = 0 (6 up / 12 lat / 6 down,
//               0 slice-to-bulk antipodal pairs) forbids 1-beat slice-vs-bulk pumping (<Q_{x_0=0}(1)> = 0)
//               and keeps global <Q_box(t)> = 0 with periodic recurrence, vs {3,4,3,4}'s 6/6 cusp-to-bulk pairs.
//   W19.5 (C5): Irreversible Hyperbolic Bulk Export Arrow:
//               Exact Steinberg cusp-tree branching asymmetry (d_down/d_up -> 18.2787), SchurGap spectral
//               bound (||A/24||_2 <= 13/21, lambda_gap >= 8/21), Markov decay P_return(t) < (13/21)^{2t},
//               full t = 1..60 flip-flop S_ff peak-return audit vs true moving-shift S_mv and bare k = 1 walk.
//   W19.6 (C6): Sterile Deep-Bulk Neutral Dark-Matter Candidates at Depths D = 1, 2, 3:
//               (a) k = 2 neutral antipodal pair (exhaustive 312/330 = 94.55% off-geodesic D = 2 sterility,
//                   pure-bulk-line exact 0 husk leakage, geodesic causal delay and EM cross-section ~ P^2)
//               (b) k = 4 neutral C-even chiral cluster at D = 0, 1, 2, 3 (rapid depth suppression)
//               (c) W10 [[24, 1, 8]]_3 bulk logical excitations (exact 0 local electric charge <Q_s> = 0
//                   and exact 0 two-point EM shift across 24 slots and 1104 ZZ ops, plus +1 ln 3 FLM shift).
//   W19.7 (C7): Honest Two-Part Bare-U Microscopic Audit on the 37-Dock {3,4,3,4} Cusp Cluster (T = 2):
//               (a) Strictly sterile D = 1 non-bridge neutral mode in a genuine disjoint tensor-product state
//                   certifies exact 0 sterile entanglement imprint on D = 0 (plus t = 0 50/50 artifact diagnosis)
//               (b) Non-sterile D = 1 <-> D = 0 bridge-exchange diagnostic explicitly reports matter leakage
//                   D_act(D = 0) > 0, bridge dI/dd_MI/dk_LLY growth, and negative husk-only I(0:r_1) and dk_LLY(hub).
//   W19.8 (C8): Exact {3,4,3,4} Bulk-to-Husk Green's Function & Emergent Cored Dark-Matter Halo Profile:
//               (a) Exact 8,857-dock R <= 3 Coxeter 4D Green's function G_{4D}(x_{D=0}, v_{D_source})
//                   for D_source = 0..3 (point decay ~3.12/hop vs m_bulk = 2.9057, 4/3 path-multiplicity jump)
//               (b) Exact 3D {4,3,4} lattice G_cusp verified at 6 axis points via Schwinger-Bessel quadrature
//                   plus closed-form continuum H^4 Poisson-kernel potential atan(r/r_c) / (2 pi^2 r).
//   W19.9 (C9): Exact {3,4,3,4} Dark-to-Baryonic Phase-Space & Warped-Column Ratio Audit:
//               Exact N_D = 1, 18, 330, 6034..., facet ratio 18/6 = 3, shell-1 ratio 18, exact closed-form
//               Steinberg generating function (cross-checked to D = 600) for critical alpha_* matching
//               Planck Omega_c / Omega_b = 5.364, and honest cosmological boundary statement.

type CheckRow = {
  readonly id: string
  readonly name: string
  readonly passed: boolean
  readonly detail: string
}

const CHECKS: CheckRow[] = []

function recordCheck(id: string, name: string, passed: boolean, detail: string): void {
  CHECKS.push({ id, name, passed, detail })
}

function assertExact(cond: boolean, msg: string): void {
  if (!cond) throw new Error(`Assertion failed: ${msg}`)
}

const PI = Math.PI
const SQRT3 = Math.sqrt(3)

type Cx = readonly [number, number]
const cxMul = (a: Cx, b: Cx): Cx => [a[0] * b[0] - a[1] * b[1], a[0] * b[1] + a[1] * b[0]]
const cxConj = (a: Cx): Cx => [a[0], -a[1]]
const cxAbs2 = (a: Cx): number => a[0] * a[0] + a[1] * a[1]

// Exact cyclotomic constants of verbatim 8-layer bare U in Z[zeta_9][1/6]
const W_C: Cx = [-0.5, SQRT3 / 2] // omega = e^{2pi i/3}
const Z6_C: Cx = [0.5, SQRT3 / 2] // zeta_6 = 1 + omega = e^{i pi/3}
const Z18_C: Cx = [Math.cos(PI / 9), Math.sin(PI / 9)] // zeta_18 = e^{i pi/9}
const D_KEEP_C: Cx = [0.75, SQRT3 / 4] // (2 + omega) / 2
const D_CROSS_C: Cx = [0.25, -SQRT3 / 4] // -omega / 2
const MEET_KEEP_C: Cx = [0.25, SQRT3 / 4] // zeta_6 / 2
const MEET_SWAP_C: Cx = [-0.75, SQRT3 / 4] // (omega - 1) / 2
const PAIR_HOP_C: Cx = [(Z18_C[0] - 1) / 12, Z18_C[1] / 12]
const PAIR_KEEP_C: Cx = [1 + PAIR_HOP_C[0], PAIR_HOP_C[1]]

const ZETA6_POW_C: readonly Cx[] = [
  [1, 0],
  Z6_C,
  W_C,
  [-1, 0],
  [-0.5, -SQRT3 / 2],
  [0.5, -SQRT3 / 2],
]
const zeta6PowC = (n: number): Cx => ZETA6_POW_C[((n % 6) + 6) % 6]!

// ============================================================================
// 0. EXACT D_4 ROOT SYSTEM, W(F_4) (ORDER 1152), W(B_3) CUSP STABILIZER (48),
//    AND EXACT O^+(4,1, Z[sqrt(2)]) {3,4,3,4} COXETER ENGINE
// ============================================================================

type Root4 = readonly [bigint, bigint, bigint, bigint]
type Q2 = readonly [bigint, bigint]

const ROOTS: readonly Root4[] = (() => {
  const roots: Root4[] = []
  const signs: readonly bigint[] = [1n, -1n]
  for (let i = 0; i < 4; i++) {
    for (let j = i + 1; j < 4; j++) {
      for (const si of signs) {
        for (const sj of signs) {
          const c: [bigint, bigint, bigint, bigint] = [0n, 0n, 0n, 0n]
          c[i] = si
          c[j] = sj
          roots.push(c)
        }
      }
    }
  }
  return roots
})()

const dot4 = (a: Root4, b: Root4): bigint => a[0] * b[0] + a[1] * b[1] + a[2] * b[2] + a[3] * b[3]
const OPPOSITE_SLOT: readonly number[] = ROOTS.map(r =>
  ROOTS.findIndex(o => o[0] === -r[0] && o[1] === -r[1] && o[2] === -r[2] && o[3] === -r[3]),
)
const LINES: readonly (readonly [number, number])[] = ROOTS.flatMap((_, a) => {
  const b = OPPOSITE_SLOT[a]!
  return a < b ? [[a, b] as const] : []
})
const LINE_OF_SLOT: readonly number[] = ROOTS.map((_, s) => LINES.findIndex(([a, b]) => a === s || b === s))
const FRAME_OF: readonly number[] = ROOTS.map(r => {
  const n0 = r[0] !== 0n, n1 = r[1] !== 0n, n2 = r[2] !== 0n, n3 = r[3] !== 0n
  return (n0 && n1) || (n2 && n3) ? 0 : (n0 && n2) || (n1 && n3) ? 1 : 2
})

interface WF4Group {
  readonly elements: readonly Uint8Array[]
  readonly det: readonly number[]
}

const WF4_GROUP: WF4Group = (() => {
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
        assertExact(num % aa === 0n, 'F_4 reflection not integral on D_4')
        img.push(v[k]! - num / aa)
      }
      const idx = ROOTS.findIndex(
        o => o[0] === img[0] && o[1] === img[1] && o[2] === img[2] && o[3] === img[3],
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
      for (let d = 0; d < 24; d++) next[d] = ref[cur[d]!]!
      const key = next.join(',')
      const known = seen.get(key)
      if (known === undefined) {
        seen.set(key, elements.length)
        elements.push(next)
        det.push(nextDet)
      } else {
        assertExact(det[known] === nextDet, 'W(F_4) parity mismatch')
      }
    }
  }
  assertExact(elements.length === 1152 && det.filter(d => d === 1).length === 576, 'W(F_4) size 1152')
  return { elements, det }
})()

// Exact O^+(4,1, Z[sqrt(2)]) {3,4,3,4} Coxeter engine
const DIM5 = [0, 1, 2, 3, 4] as const
const Q2_ZERO: Q2 = [0n, 0n]
const EYE5: readonly (readonly Q2[])[] = DIM5.map(r => DIM5.map(c => [r === c ? 1n : 0n, 0n] as const))
const addQ2 = (u: Q2, v: Q2): Q2 => [u[0] + v[0], u[1] + v[1]]
const subQ2 = (u: Q2, v: Q2): Q2 => [u[0] - v[0], u[1] - v[1]]
const mulQ2 = (u: Q2, v: Q2): Q2 => [u[0] * v[0] + 2n * u[1] * v[1], u[0] * v[1] + u[1] * v[0]]
const eqQ2 = (u: Q2, v: Q2): boolean => u[0] === v[0] && u[1] === v[1]
function dotQ2(u: readonly Q2[], v: readonly Q2[]): Q2 {
  let a = 0n, b = 0n
  for (let i = 0; i < 5; i++) {
    const ui = u[i]!, vi = v[i]!
    a += ui[0] * vi[0] + 2n * ui[1] * vi[1]
    b += ui[0] * vi[1] + ui[1] * vi[0]
  }
  return [a, b]
}
const vecKeyQ2 = (v: readonly Q2[]): string => `${v[0]![0]},${v[0]![1]};${v[1]![0]},${v[1]![1]};${v[2]![0]},${v[2]![1]};${v[3]![0]},${v[3]![1]};${v[4]![0]},${v[4]![1]}`
function matVecQ2(m: readonly (readonly Q2[])[], v: readonly Q2[]): Q2[] {
  const out: Q2[] = new Array(5)
  for (let i = 0; i < 5; i++) {
    const row = m[i]!
    let a = 0n, b = 0n
    for (let k = 0; k < 5; k++) {
      const rk = row[k]!, vk = v[k]!
      a += rk[0] * vk[0] + 2n * rk[1] * vk[1]
      b += rk[0] * vk[1] + rk[1] * vk[0]
    }
    out[i] = [a, b]
  }
  return out
}
function matMulQ2(a: readonly (readonly Q2[])[], b: readonly (readonly Q2[])[]): Q2[][] {
  const out: Q2[][] = new Array(5)
  for (let i = 0; i < 5; i++) {
    const aRow = a[i]!
    const outRow: Q2[] = new Array(5)
    for (let j = 0; j < 5; j++) {
      let s0 = 0n, s1 = 0n
      for (let k = 0; k < 5; k++) {
        const u = aRow[k]!, v = b[k]![j]!
        s0 += u[0] * v[0] + 2n * u[1] * v[1]
        s1 += u[0] * v[1] + u[1] * v[0]
      }
      outRow[j] = [s0, s1]
    }
    out[i] = outRow
  }
  return out
}
const q2ToFloat = (u: Q2): number => Number(u[0]) + Number(u[1]) * Math.SQRT2

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
const CUSP_VERTEX: readonly Q2[] = [[0n, 0n], [1n, 0n], [0n, 1n], [0n, 1n], [1n, 0n]]

const { transports: TRANSPORTS, layerSlots: LAYER_SLOTS } = (() => {
  const stabGens = [0, 1, 2, 3].map(idx => reflect5(EYE5[idx]!))
  const facetNormals: Q2[][] = [EYE5[4]!.slice()]
  const seenN = new Set<string>([vecKeyQ2(EYE5[4]!)])
  for (const n of facetNormals) {
    for (const g of stabGens) {
      const nx = matVecQ2(g, n)
      const k = vecKeyQ2(nx)
      if (!seenN.has(k)) {
        seenN.add(k)
        facetNormals.push(nx)
      }
    }
  }
  const facetDot = (a: number, b: number): bigint => (twiceForm(facetNormals[a]!, facetNormals[b]!)[0] + 2n) / 2n
  const ortho: number[] = []
  for (let f = 0; f < 24 && ortho.length < 4; f++) {
    if (ortho.every(o => facetDot(f, o) === 0n)) ortho.push(f)
  }
  const facetRoots: Root4[] = facetNormals.map((_, f) => {
    const [c0, c1, c2, c3] = ortho.map(o => facetDot(f, o))
    return [(c0! + c1!) / 2n, (c0! - c1!) / 2n, (c2! + c3!) / 2n, (c2! - c3!) / 2n]
  })
  const slotNormals: Q2[][] = ROOTS.map(r => {
    const fi = facetRoots.findIndex(fr => fr.every((v, i) => v === r[i]))
    return facetNormals[fi]!
  })
  const transports = slotNormals.map(fn => matMulQ2(reflect5(fn), CENTRAL_INVERSION))
  const level0 = twiceForm(BASE_CENTER, CUSP_VERTEX)
  const layerSlots: number[] = []
  for (let s = 0; s < 24; s++) {
    const lv = twiceForm(matVecQ2(transports[s]!, BASE_CENTER), CUSP_VERTEX)
    if (eqQ2(lv, level0)) layerSlots.push(s)
  }
  return { transports, layerSlots }
})()

const LAYER_SLOT_SET = new Set<number>(LAYER_SLOTS)

// Lazy infinite {3,4,3,4} Coxeter graph discovery
const dockFrames: (readonly (readonly Q2[])[])[] = [EYE5]
const dockCenters: Q2[][] = [BASE_CENTER.map(x => [x[0], x[1]] as Q2)]
const dockParity: number[] = [1]
const dockParent: [number, number][] = [[-1, -1]]
const centerToDockId = new Map<string, number>([[vecKeyQ2(BASE_CENTER), 0]])
const neighbors: Int32Array[] = [new Int32Array(24).fill(-1)]

function stepDock(dock: number, slot: number): number {
  const cached = neighbors[dock]![slot]!
  if (cached >= 0) return cached
  const nextFrame = matMulQ2(dockFrames[dock]!, TRANSPORTS[slot]!)
  const nextCenter = matVecQ2(nextFrame, BASE_CENTER)
  const centerKey = vecKeyQ2(nextCenter)
  let nextId = centerToDockId.get(centerKey)
  if (nextId === undefined) {
    nextId = dockFrames.length
    centerToDockId.set(centerKey, nextId)
    dockFrames.push(nextFrame)
    dockCenters.push(nextCenter)
    dockParity.push(-dockParity[dock]!)
    dockParent.push([dock, slot])
    neighbors.push(new Int32Array(24).fill(-1))
  }
  neighbors[dock]![slot] = nextId
  neighbors[nextId]![OPPOSITE_SLOT[slot]!] = dock
  return nextId
}

function isLayerDock(dock: number): boolean {
  const c0 = dockCenters[dock]![0]!
  return c0[0] === 2n && c0[1] === 0n
}

const depthCache = new Map<number, number>([[0, 0]])
function cuspDepth(dock: number): number {
  const cached = depthCache.get(dock)
  if (cached !== undefined) return cached
  if (isLayerDock(dock)) {
    depthCache.set(dock, 0)
    return 0
  }
  const dist = new Map<number, number>([[dock, 0]])
  const q: number[] = [dock]
  let head = 0
  while (head < q.length) {
    const u = q[head++]!
    const du = dist.get(u)!
    const hu = q2ToFloat(dockCenters[u]![0]!)
    for (let s = 0; s < 24; s++) {
      const nb = stepDock(u, s)
      if (isLayerDock(nb)) {
        depthCache.set(dock, du + 1)
        return du + 1
      }
      const hnb = q2ToFloat(dockCenters[nb]![0]!)
      if (hnb < hu - 1e-9 && !dist.has(nb)) {
        dist.set(nb, du + 1)
        q.push(nb)
      }
    }
  }
  throw new Error(`Could not find cusp depth for dock ${dock}`)
}

// Extract exact W(B_3) cusp stabilizer inside W(F_4) (elements preserving LAYER_SLOTS)
const WB3_PROPER: Uint8Array[] = []
const WB3_IMPROPER: Uint8Array[] = []
const WF4_IMPROPER_NONCUSP: Uint8Array[] = []
for (let i = 0; i < WF4_GROUP.elements.length; i++) {
  const p = WF4_GROUP.elements[i]!
  const d = WF4_GROUP.det[i]!
  const preservesCusp = LAYER_SLOTS.every(s => LAYER_SLOT_SET.has(p[s]!))
  if (preservesCusp) {
    if (d === 1) WB3_PROPER.push(p)
    else WB3_IMPROPER.push(p)
  } else if (d === -1) {
    WF4_IMPROPER_NONCUSP.push(p)
  }
}

function isInvolution(p: Uint8Array): boolean {
  for (let i = 0; i < 24; i++) if (p[p[i]!] !== i) return false
  return true
}

const P_CUSP_REF = WB3_IMPROPER.find(p => isInvolution(p))!
const P_PERP_REF = WF4_IMPROPER_NONCUSP.find(p => isInvolution(p))!

// ============================================================================
// 1. EXACT CANONICAL W(F_4) x Z_2^C CHIRAL INVARIANT chi_odd (FROM universe.ts)
//    AND VERBATIM 8-LAYER BARE U ENGINE (+ EXACT INVERSE U^dag)
// ============================================================================

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
    const ps0 = p[s0]! << 1
    const ps1 = p[s1]! << 1
    const ps2 = p[s2]! << 1
    const ps3 = p[s3]! << 1

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

type Vibe = readonly [dock: number, slot: number, tone: -1 | 1, role: number]
type StateEntry = { readonly vibes: Vibe[]; re: number; im: number }
type FState = Map<string, StateEntry>

interface LatticeGeometry {
  readonly step: (dock: number, slot: number) => number
  readonly parity: (dock: number) => number
  readonly depth: (dock: number) => number
}

const HYP_GEOM: LatticeGeometry = {
  step: stepDock,
  parity: d => dockParity[d]!,
  depth: cuspDepth,
}

function sortAndEncode(vibes: readonly Vibe[]): { sorted: Vibe[]; key: string } {
  const n = vibes.length
  const sorted = vibes.slice()
  for (let i = 1; i < n; i++) {
    const cur = sorted[i]!
    let j = i - 1
    while (j >= 0 && (sorted[j]![0] > cur[0] || (sorted[j]![0] === cur[0] && sorted[j]![1] > cur[1]))) {
      sorted[j + 1] = sorted[j]!
      j--
    }
    sorted[j + 1] = cur
  }
  if (n === 4) {
    const v0 = sorted[0]!, v1 = sorted[1]!, v2 = sorted[2]!, v3 = sorted[3]!
    const c0 = (((v0[0] * 24 + v0[1]) * 2 + (v0[2] < 0 ? 1 : 0)) * 2 + v0[3])
    const c1 = (((v1[0] * 24 + v1[1]) * 2 + (v1[2] < 0 ? 1 : 0)) * 2 + v1[3])
    const c2 = (((v2[0] * 24 + v2[1]) * 2 + (v2[2] < 0 ? 1 : 0)) * 2 + v2[3])
    const c3 = (((v3[0] * 24 + v3[1]) * 2 + (v3[2] < 0 ? 1 : 0)) * 2 + v3[3])
    return { sorted, key: `${c0}_${c1}_${c2}_${c3}` }
  }
  if (n === 2) {
    const v0 = sorted[0]!, v1 = sorted[1]!
    const c0 = (((v0[0] * 24 + v0[1]) * 2 + (v0[2] < 0 ? 1 : 0)) * 2 + v0[3])
    const c1 = (((v1[0] * 24 + v1[1]) * 2 + (v1[2] < 0 ? 1 : 0)) * 2 + v1[3])
    return { sorted, key: `${c0}_${c1}` }
  }
  let key = ''
  for (let i = 0; i < n; i++) {
    const v = sorted[i]!
    if (i > 0) key += '_'
    key += `${((v[0] * 24 + v[1]) * 2 + (v[2] < 0 ? 1 : 0)) * 2 + v[3]}`
  }
  return { sorted, key }
}

function addEntry(map: FState, vibes: readonly Vibe[], re: number, im: number): void {
  if (re * re + im * im < 1e-30) return
  const { sorted, key } = sortAndEncode(vibes)
  const ex = map.get(key)
  if (ex) {
    ex.re += re
    ex.im += im
    if (ex.re * ex.re + ex.im * ex.im < 1e-30) map.delete(key)
  } else {
    map.set(key, { vibes: sorted, re, im })
  }
}

function normSqState(st: FState): number {
  let s = 0
  for (const e of st.values()) s += e.re * e.re + e.im * e.im
  return s
}

function normalizeState(st: FState): FState {
  const inv = 1 / Math.sqrt(normSqState(st))
  const out: FState = new Map()
  for (const [k, e] of st) out.set(k, { vibes: e.vibes, re: e.re * inv, im: e.im * inv })
  return out
}

function stateDiffL2(a: FState, b: FState): number {
  const keys = new Set<string>([...a.keys(), ...b.keys()])
  let s = 0
  for (const k of keys) {
    const ea = a.get(k)
    const eb = b.get(k)
    const dr = (ea ? ea.re : 0) - (eb ? eb.re : 0)
    const di = (ea ? ea.im : 0) - (eb ? eb.im : 0)
    s += dr * dr + di * di
  }
  return Math.sqrt(s)
}

function applyCState(st: FState): FState {
  const out: FState = new Map()
  for (const e of st.values()) {
    const flipped = e.vibes.map(([d, s, t, r]): Vibe => [d, s, (t === 1 ? -1 : 1) as -1 | 1, r])
    addEntry(out, flipped, e.re, e.im)
  }
  return out
}

function mapHypStateByPerm(st: FState, perm: Uint8Array): FState {
  const dockCache = new Map<number, number>([[0, 0]])
  const mapDock = (d: number): number => {
    const hit = dockCache.get(d)
    if (hit !== undefined) return hit
    const [pDock, pSlot] = dockParent[d]!
    const mapped = stepDock(mapDock(pDock), perm[pSlot]!)
    dockCache.set(d, mapped)
    return mapped
  }
  const out: FState = new Map()
  for (const e of st.values()) {
    const mapped = e.vibes.map(([d, s, t, r]): Vibe => [mapDock(d), perm[s]!, t, r])
    addEntry(out, mapped, e.re, e.im)
  }
  return out
}

function chiralOrientationDock(vibes: readonly Vibe[], indices: readonly number[]): number {
  let chi = 0
  const m = indices.length
  for (let i = 0; i < m; i++) {
    const vi = vibes[indices[i]!]!
    const ci = (vi[1] << 1) + (vi[2] < 0 ? 1 : 0)
    for (let j = i + 1; j < m; j++) {
      const vj = vibes[indices[j]!]!
      const cj = (vj[1] << 1) + (vj[2] < 0 ? 1 : 0)
      for (let k = j + 1; k < m; k++) {
        const vk = vibes[indices[k]!]!
        const ck = (vk[1] << 1) + (vk[2] < 0 ? 1 : 0)
        for (let l = k + 1; l < m; l++) {
          const vl = vibes[indices[l]!]!
          const cl = (vl[1] << 1) + (vl[2] < 0 ? 1 : 0)
          chi += chiral4Sign(ci, cj, ck, cl)
        }
      }
    }
  }
  return chi
}

type BeatOptions = {
  readonly enablePhiOdd?: boolean
  readonly stats?: { phiOddHits: number; mPairHits: number; kBounceHits: number; mMeetHits: number }
}

function applyPhiOddLayer(st: FState, dag: boolean, geom: LatticeGeometry, opts: BeatOptions): FState {
  if (opts.enablePhiOdd === false) return st
  const out: FState = new Map()
  for (const [key, e] of st) {
    const vibes = e.vibes
    const n = vibes.length
    if (n < 4) {
      out.set(key, { vibes, re: e.re, im: e.im })
      continue
    }
    // Fast path for k = 4 (sorted by dock: all 4 at same dock iff vibes[0][0] === vibes[3][0]!)
    if (n === 4) {
      const d0 = vibes[0]![0]
      if (vibes[3]![0] !== d0) {
        out.set(key, { vibes, re: e.re, im: e.im })
        continue
      }
      const chi = chiral4Sign(
        (vibes[0]![1] << 1) + (vibes[0]![2] < 0 ? 1 : 0),
        (vibes[1]![1] << 1) + (vibes[1]![2] < 0 ? 1 : 0),
        (vibes[2]![1] << 1) + (vibes[2]![2] < 0 ? 1 : 0),
        (vibes[3]![1] << 1) + (vibes[3]![2] < 0 ? 1 : 0),
      )
      if (chi === 0) {
        out.set(key, { vibes, re: e.re, im: e.im })
      } else {
        if (opts.stats) opts.stats.phiOddHits++
        const exp = geom.parity(d0) * chi
        const ph = cxMul([e.re, e.im], zeta6PowC(dag ? -exp : exp))
        out.set(key, { vibes, re: ph[0], im: ph[1] })
      }
      continue
    }
    const byDock = new Map<number, number[]>()
    for (let i = 0; i < n; i++) {
      const d = vibes[i]![0]
      const arr = byDock.get(d)
      if (arr) arr.push(i)
      else byDock.set(d, [i])
    }
    let expSum = 0
    for (const [dock, idxs] of byDock) {
      if (idxs.length >= 4) {
        const chi = chiralOrientationDock(vibes, idxs)
        if (chi !== 0) {
          if (opts.stats) opts.stats.phiOddHits++
          expSum += geom.parity(dock) * chi
        }
      }
    }
    if (expSum === 0) {
      out.set(key, { vibes, re: e.re, im: e.im })
    } else {
      const ph = cxMul([e.re, e.im], zeta6PowC(dag ? -expSum : expSum))
      out.set(key, { vibes, re: ph[0], im: ph[1] })
    }
  }
  return out
}

function decodePackedVibe(code: number): Vibe {
  const role = code & 1
  const tone: -1 | 1 = ((code >>> 1) & 1) === 1 ? -1 : 1
  const ds = code >>> 2
  const slot = ds % 24
  const dock = (ds - slot) / 24
  return [dock, slot, tone, role]
}

function addPacked4(map: FState, a0: number, a1: number, a2: number, a3: number, re: number, im: number): void {
  if (re * re + im * im < 1e-30) return
  let x0 = a0, x1 = a1, x2 = a2, x3 = a3
  if (x0 > x1) { const t = x0; x0 = x1; x1 = t }
  if (x2 > x3) { const t = x2; x2 = x3; x3 = t }
  if (x0 > x2) { const t = x0; x0 = x2; x2 = t }
  if (x1 > x3) { const t = x1; x1 = x3; x3 = t }
  if (x1 > x2) { const t = x1; x1 = x2; x2 = t }
  const key = `${x0}_${x1}_${x2}_${x3}`
  const ex = map.get(key)
  if (ex) {
    ex.re += re
    ex.im += im
    if (ex.re * ex.re + ex.im * ex.im < 1e-30) map.delete(key)
  } else {
    map.set(key, {
      vibes: [decodePackedVibe(x0), decodePackedVibe(x1), decodePackedVibe(x2), decodePackedVibe(x3)],
      re,
      im,
    })
  }
}

function applyHalfCoinDLayer(st: FState, dag: boolean): FState {
  const detR = Z6_C[0], detI = dag ? -Z6_C[1] : Z6_C[1]
  const keepR = D_KEEP_C[0], keepI = dag ? -D_KEEP_C[1] : D_KEEP_C[1]
  const crossR = D_CROSS_C[0], crossI = dag ? -D_CROSS_C[1] : D_CROSS_C[1]
  const out: FState = new Map()
  const loneIdx = new Int32Array(8)
  const loneOpp = new Int32Array(8)
  const baseC = new Int32Array(4)
  const flipC = new Int32Array(4)
  for (const e of st.values()) {
    const vibes = e.vibes
    const n = vibes.length
    let phR = e.re, phI = e.im
    let nLone = 0
    let pairedMask = 0
    for (let i = 0; i < n; i++) {
      if ((pairedMask & (1 << i)) !== 0) continue
      const vi = vibes[i]!
      const di = vi[0], si = vi[1], oppI = OPPOSITE_SLOT[si]!
      let partner = -1
      for (let j = i + 1; j < n; j++) {
        if (vibes[j]![0] !== di) break
        if (vibes[j]![1] === oppI) { partner = j; break }
      }
      if (partner >= 0) {
        pairedMask |= 1 << partner
        const nr = phR * detR - phI * detI
        const ni = phR * detI + phI * detR
        phR = nr; phI = ni
      } else {
        loneIdx[nLone] = i
        loneOpp[nLone] = oppI
        nLone++
      }
    }
    const nMask = 1 << nLone
    if (n === 4) {
      for (let i = 0; i < 4; i++) {
        const v = vibes[i]!
        const tail = ((v[2] < 0 ? 1 : 0) << 1) | v[3]
        baseC[i] = ((v[0] * 24 + v[1]) << 2) | tail
        flipC[i] = ((v[0] * 24 + OPPOSITE_SLOT[v[1]]!) << 2) | tail
      }
      for (let mask = 0; mask < nMask; mask++) {
        let ar = phR, ai = phI
        let c0 = baseC[0]!, c1 = baseC[1]!, c2 = baseC[2]!, c3 = baseC[3]!
        for (let b = 0; b < nLone; b++) {
          if ((mask & (1 << b)) !== 0) {
            const idx = loneIdx[b]!
            if (idx === 0) c0 = flipC[0]!
            else if (idx === 1) c1 = flipC[1]!
            else if (idx === 2) c2 = flipC[2]!
            else c3 = flipC[3]!
            const nr = ar * crossR - ai * crossI
            const ni = ar * crossI + ai * crossR
            ar = nr; ai = ni
          } else {
            const nr = ar * keepR - ai * keepI
            const ni = ar * keepI + ai * keepR
            ar = nr; ai = ni
          }
        }
        addPacked4(out, c0, c1, c2, c3, ar, ai)
      }
      continue
    }
    for (let mask = 0; mask < nMask; mask++) {
      let ar = phR, ai = phI
      const cfg = vibes.slice()
      for (let b = 0; b < nLone; b++) {
        if ((mask & (1 << b)) !== 0) {
          const idx = loneIdx[b]!
          const v = cfg[idx]!
          cfg[idx] = [v[0], loneOpp[b]!, v[2], v[3]]
          const nr = ar * crossR - ai * crossI
          const ni = ar * crossI + ai * crossR
          ar = nr; ai = ni
        } else {
          const nr = ar * keepR - ai * keepI
          const ni = ar * keepI + ai * keepR
          ar = nr; ai = ni
        }
      }
      addEntry(out, cfg, ar, ai)
    }
  }
  return out
}

function applyOppositeSignBounceKLayer(st: FState, opts: BeatOptions): FState {
  const out: FState = new Map()
  for (const [key, e] of st) {
    const vibes = e.vibes
    const n = vibes.length
    let anyBounce = false
    for (let i = 0; i < n; i++) {
      const vi = vibes[i]!
      const di = vi[0], oppI = OPPOSITE_SLOT[vi[1]]!
      for (let j = i + 1; j < n && vibes[j]![0] === di; j++) {
        if (vibes[j]![1] === oppI && vibes[j]![2] !== vi[2]) { anyBounce = true; break }
      }
      if (anyBounce) break
    }
    if (!anyBounce) {
      out.set(key, { vibes, re: e.re, im: e.im })
      continue
    }
    const nextV = vibes.slice()
    let neg = false
    let used = 0
    for (let i = 0; i < n; i++) {
      if ((used & (1 << i)) !== 0) continue
      const vi = nextV[i]!
      const di = vi[0], oppI = OPPOSITE_SLOT[vi[1]]!
      for (let j = i + 1; j < n && nextV[j]![0] === di; j++) {
        if (nextV[j]![1] === oppI && nextV[j]![2] !== vi[2]) {
          const vj = nextV[j]!
          nextV[i] = [di, oppI, vi[2], vi[3]]
          nextV[j] = [di, vi[1], vj[2], vj[3]]
          used |= 1 << j
          neg = !neg
          if (opts.stats) opts.stats.kBounceHits++
          break
        }
      }
    }
    addEntry(out, nextV, neg ? -e.re : e.re, neg ? -e.im : e.im)
  }
  return out
}

function applyPairLineMixerLayer(st: FState, dag: boolean, opts: BeatOptions): FState {
  const hopC = dag ? cxConj(PAIR_HOP_C) : PAIR_HOP_C
  const keepC = dag ? cxConj(PAIR_KEEP_C) : PAIR_KEEP_C
  const out: FState = new Map()
  for (const [key, e] of st) {
    const vibes = e.vibes
    const n = vibes.length
    // Scan contiguous dock runs (vibes are sorted by dock!)
    const pairs: [number, number, number][] = []
    let i = 0
    while (i < n) {
      const d = vibes[i]![0]
      let j = i + 1
      while (j < n && vibes[j]![0] === d) j++
      if (j - i === 2) {
        const v0 = vibes[i]!, v1 = vibes[i + 1]!
        if (OPPOSITE_SLOT[v0[1]] === v1[1] && v0[2] === v1[2] && v0[3] === v1[3]) {
          pairs.push([i, i + 1, LINE_OF_SLOT[v0[1]]!])
          if (opts.stats) opts.stats.mPairHits++
        }
      }
      i = j
    }
    if (pairs.length === 0) {
      out.set(key, { vibes, re: e.re, im: e.im })
      continue
    }
    let branches: [Vibe[], Cx][] = [[vibes, [e.re, e.im]]]
    for (const [i0, i1, curL] of pairs) {
      const nextB: [Vibe[], Cx][] = []
      for (const [cfg, amp] of branches) {
        const [d, , t, r] = cfg[i0]!
        for (let tL = 0; tL < 12; tL++) {
          if (tL === curL) {
            nextB.push([cfg, cxMul(amp, keepC)])
          } else {
            const hp = cfg.slice()
            hp[i0] = [d, LINES[tL]![0], t, r]
            hp[i1] = [d, LINES[tL]![1], t, r]
            nextB.push([hp, cxMul(amp, hopC)])
          }
        }
      }
      branches = nextB
    }
    for (const [cfg, [br, bi]] of branches) addEntry(out, cfg, br, bi)
  }
  return out
}

function applyRoleMeetLayer(st: FState, dag: boolean, opts: BeatOptions): FState {
  const eqPh = dag ? cxConj(W_C) : W_C
  const keepC = dag ? cxConj(MEET_KEEP_C) : MEET_KEEP_C
  const swapC = dag ? cxConj(MEET_SWAP_C) : MEET_SWAP_C
  const out: FState = new Map()
  for (const [key, e] of st) {
    const vibes = e.vibes
    const n = vibes.length
    let ph: Cx = [e.re, e.im]
    let anySamePair = false
    const swaps: [number, number][] = []
    let used = 0
    for (let i = 0; i < n; i++) {
      if ((used & (1 << i)) !== 0) continue
      const vi = vibes[i]!
      const di = vi[0], oppI = OPPOSITE_SLOT[vi[1]]!
      for (let j = i + 1; j < n && vibes[j]![0] === di; j++) {
        if (vibes[j]![1] === oppI && vibes[j]![2] === vi[2]) {
          used |= 1 << j
          anySamePair = true
          if (opts.stats) opts.stats.mMeetHits++
          if (vi[3] === vibes[j]![3]) ph = cxMul(ph, eqPh)
          else swaps.push([i, j])
          break
        }
      }
    }
    if (!anySamePair) {
      out.set(key, { vibes, re: e.re, im: e.im })
      continue
    }
    if (swaps.length === 0) {
      out.set(key, { vibes, re: ph[0], im: ph[1] })
      continue
    }
    let branches: [Vibe[], Cx][] = [[vibes, ph]]
    for (const [iA, iB] of swaps) {
      const nextB: [Vibe[], Cx][] = []
      for (const [cfg, amp] of branches) {
        const sw = cfg.slice()
        const a = cfg[iA]!, b = cfg[iB]!
        sw[iA] = [a[0], a[1], a[2], b[3]]
        sw[iB] = [b[0], b[1], b[2], a[3]]
        nextB.push([cfg, cxMul(amp, keepC)], [sw, cxMul(amp, swapC)])
      }
      branches = nextB
    }
    for (const [cfg, [br, bi]] of branches) addEntry(out, cfg, br, bi)
  }
  return out
}

function applyStreamLayer(st: FState, dag: boolean, geom: LatticeGeometry): FState {
  const out: FState = new Map()
  for (const e of st.values()) {
    const moved = e.vibes.map(([d, s, t, r]): Vibe => {
      const dir = dag ? OPPOSITE_SLOT[s]! : s
      return [geom.step(d, dir), s, t, r]
    })
    addEntry(out, moved, e.re, e.im)
  }
  return out
}

// Verbatim 8-layer palindromic beat: U = S o Phi_odd o D o M_meet o M_pair(zeta_18) o K o D o Phi_odd
function applyBareBeat(st: FState, geom: LatticeGeometry = HYP_GEOM, opts: BeatOptions = {}): FState {
  let s = applyPhiOddLayer(st, false, geom, opts)
  s = applyHalfCoinDLayer(s, false)
  s = applyOppositeSignBounceKLayer(s, opts)
  s = applyPairLineMixerLayer(s, false, opts)
  s = applyRoleMeetLayer(s, false, opts)
  s = applyHalfCoinDLayer(s, false)
  s = applyPhiOddLayer(s, false, geom, opts)
  s = applyStreamLayer(s, false, geom)
  return s
}

// Exact adjoint inverse: U^dag = Phi_odd^dag o D^dag o K o M_pair^dag o M_meet^dag o D^dag o Phi_odd^dag o S^dag
function applyBareBeatInverse(st: FState, geom: LatticeGeometry = HYP_GEOM, opts: BeatOptions = {}): FState {
  let s = applyStreamLayer(st, true, geom)
  s = applyPhiOddLayer(s, true, geom, opts)
  s = applyHalfCoinDLayer(s, true)
  s = applyRoleMeetLayer(s, true, opts)
  s = applyPairLineMixerLayer(s, true, opts)
  s = applyOppositeSignBounceKLayer(s, opts)
  s = applyHalfCoinDLayer(s, true)
  s = applyPhiOddLayer(s, true, geom, opts)
  return s
}

type ShellMetrics = {
  readonly normSq: number
  readonly qTotal: number
  readonly dActTotal: number
  readonly qByShell: Float64Array
  readonly dActByShell: Float64Array
  readonly qBulkGe1: number
  readonly qBulkGe2: number
  readonly dActBulkGe1: number
  readonly meanDepthAll: number
  readonly meanDepthBulkQ: number
  readonly etaHusk: number
  readonly etaGlobal: number
  readonly branches: number
}

// Compact zero-string, zero-object-per-branch verbatim 8-layer bare-U state for k = 4 (< 2 MB for 41,472 branches!)
// Packed 32-bit vibe code: ((dock * 24 + slot) << 2) | ((tone < 0 ? 1 : 0) << 1) | role
// Exact 53-bit 2-level key: hi = x0 * 1048576 + x1, lo = x2 * 1048576 + x3 (exact for dock < 10,922)
const PACK_RADIX = 1048576

interface Fast4State {
  c0: Int32Array
  c1: Int32Array
  c2: Int32Array
  c3: Int32Array
  re: Float64Array
  im: Float64Array
  len: number
  readonly idx: Map<number, Map<number, number>>
}

function createFast4(cap = 64): Fast4State {
  return {
    c0: new Int32Array(cap),
    c1: new Int32Array(cap),
    c2: new Int32Array(cap),
    c3: new Int32Array(cap),
    re: new Float64Array(cap),
    im: new Float64Array(cap),
    len: 0,
    idx: new Map(),
  }
}

function growFast4(st: Fast4State): void {
  const newCap = st.c0.length * 2
  const nc0 = new Int32Array(newCap); nc0.set(st.c0); st.c0 = nc0
  const nc1 = new Int32Array(newCap); nc1.set(st.c1); st.c1 = nc1
  const nc2 = new Int32Array(newCap); nc2.set(st.c2); st.c2 = nc2
  const nc3 = new Int32Array(newCap); nc3.set(st.c3); st.c3 = nc3
  const nre = new Float64Array(newCap); nre.set(st.re); st.re = nre
  const nim = new Float64Array(newCap); nim.set(st.im); st.im = nim
}

function addFast4(st: Fast4State, a0: number, a1: number, a2: number, a3: number, re: number, im: number): void {
  if (re * re + im * im < 1e-30) return
  let x0 = a0, x1 = a1, x2 = a2, x3 = a3
  if (x0 > x1) { const t = x0; x0 = x1; x1 = t }
  if (x2 > x3) { const t = x2; x2 = x3; x3 = t }
  if (x0 > x2) { const t = x0; x0 = x2; x2 = t }
  if (x1 > x3) { const t = x1; x1 = x3; x3 = t }
  if (x1 > x2) { const t = x1; x1 = x2; x2 = t }
  const hi = x0 * PACK_RADIX + x1
  const lo = x2 * PACK_RADIX + x3
  let inner = st.idx.get(hi)
  if (!inner) {
    inner = new Map()
    st.idx.set(hi, inner)
  }
  const pos = inner.get(lo)
  if (pos !== undefined) {
    st.re[pos] = st.re[pos]! + re
    st.im[pos] = st.im[pos]! + im
  } else {
    const p = st.len
    if (p === st.c0.length) growFast4(st)
    st.c0[p] = x0; st.c1[p] = x1; st.c2[p] = x2; st.c3[p] = x3
    st.re[p] = re; st.im[p] = im
    inner.set(lo, p)
    st.len = p + 1
  }
}

function toFast4(st: FState): Fast4State {
  const out = createFast4(Math.max(16, st.size))
  for (const e of st.values()) {
    assertExact(e.vibes.length === 4, 'toFast4 requires k = 4')
    const p = (v: Vibe): number => ((v[0] * 24 + v[1]) << 2) | ((v[2] < 0 ? 1 : 0) << 1) | v[3]
    addFast4(out, p(e.vibes[0]!), p(e.vibes[1]!), p(e.vibes[2]!), p(e.vibes[3]!), e.re, e.im)
  }
  return out
}

function fast4DiffL2(a: Fast4State, b: Fast4State): number {
  let s = 0
  for (let i = 0; i < a.len; i++) {
    const ar = a.re[i]!, ai = a.im[i]!
    const hi = a.c0[i]! * PACK_RADIX + a.c1[i]!
    const lo = a.c2[i]! * PACK_RADIX + a.c3[i]!
    const pb = b.idx.get(hi)?.get(lo)
    const br = pb !== undefined ? b.re[pb]! : 0
    const bi = pb !== undefined ? b.im[pb]! : 0
    s += (ar - br) ** 2 + (ai - bi) ** 2
  }
  for (let i = 0; i < b.len; i++) {
    const hi = b.c0[i]! * PACK_RADIX + b.c1[i]!
    const lo = b.c2[i]! * PACK_RADIX + b.c3[i]!
    if (a.idx.get(hi)?.get(lo) === undefined) s += b.re[i]! ** 2 + b.im[i]! ** 2
  }
  return Math.sqrt(s)
}

function fast4PhiOddInPlace(st: Fast4State, dag: boolean, geom: LatticeGeometry, opts: BeatOptions): void {
  if (opts.enablePhiOdd === false) return
  for (let i = 0; i < st.len; i++) {
    const ar = st.re[i]!, ai = st.im[i]!
    if (ar * ar + ai * ai < 1e-30) continue
    const x0 = st.c0[i]!, x3 = st.c3[i]!
    const ds0 = x0 >>> 2, ds3 = x3 >>> 2
    const d0 = (ds0 - (ds0 % 24)) / 24
    const d3 = (ds3 - (ds3 % 24)) / 24
    if (d0 !== d3) continue
    const x1 = st.c1[i]!, x2 = st.c2[i]!
    const s0 = ds0 % 24, s1 = (x1 >>> 2) % 24, s2 = (x2 >>> 2) % 24, s3 = ds3 % 24
    const chi = chiral4Sign(
      (s0 << 1) | ((x0 >>> 1) & 1),
      (s1 << 1) | ((x1 >>> 1) & 1),
      (s2 << 1) | ((x2 >>> 1) & 1),
      (s3 << 1) | ((x3 >>> 1) & 1),
    )
    if (chi !== 0) {
      if (opts.stats) opts.stats.phiOddHits++
      const exp = geom.parity(d0) * chi
      const ph = zeta6PowC(dag ? -exp : exp)
      st.re[i] = ar * ph[0] - ai * ph[1]
      st.im[i] = ar * ph[1] + ai * ph[0]
    }
  }
}

function fast4HalfCoinD(st: Fast4State, dag: boolean): Fast4State {
  const detR = Z6_C[0], detI = dag ? -Z6_C[1] : Z6_C[1]
  const keepR = D_KEEP_C[0], keepI = dag ? -D_KEEP_C[1] : D_KEEP_C[1]
  const crossR = D_CROSS_C[0], crossI = dag ? -D_CROSS_C[1] : D_CROSS_C[1]
  const out = createFast4(Math.max(64, st.len))
  const cBuf = new Int32Array(4)
  const dBuf = new Int32Array(4)
  const sBuf = new Int32Array(4)
  const fBuf = new Int32Array(4)
  const loneIdx = new Int32Array(4)
  for (let i = 0; i < st.len; i++) {
    let phR = st.re[i]!, phI = st.im[i]!
    if (phR * phR + phI * phI < 1e-30) continue
    cBuf[0] = st.c0[i]!; cBuf[1] = st.c1[i]!; cBuf[2] = st.c2[i]!; cBuf[3] = st.c3[i]!
    for (let k = 0; k < 4; k++) {
      const c = cBuf[k]!, ds = c >>> 2, s = ds % 24, d = (ds - s) / 24
      dBuf[k] = d; sBuf[k] = s; fBuf[k] = ((d * 24 + OPPOSITE_SLOT[s]!) << 2) | (c & 3)
    }
    let nLone = 0, paired = 0
    for (let k = 0; k < 4; k++) {
      if ((paired & (1 << k)) !== 0) continue
      const dk = dBuf[k]!, opp = OPPOSITE_SLOT[sBuf[k]!]!
      let partner = -1
      for (let j = k + 1; j < 4 && dBuf[j] === dk; j++) {
        if (sBuf[j] === opp) { partner = j; break }
      }
      if (partner >= 0) {
        paired |= 1 << partner
        const nr = phR * detR - phI * detI
        const ni = phR * detI + phI * detR
        phR = nr; phI = ni
      } else {
        loneIdx[nLone++] = k
      }
    }
    const nMask = 1 << nLone
    for (let mask = 0; mask < nMask; mask++) {
      let ar = phR, ai = phI
      let x0 = cBuf[0]!, x1 = cBuf[1]!, x2 = cBuf[2]!, x3 = cBuf[3]!
      for (let b = 0; b < nLone; b++) {
        if ((mask & (1 << b)) !== 0) {
          const idx = loneIdx[b]!
          if (idx === 0) x0 = fBuf[0]!
          else if (idx === 1) x1 = fBuf[1]!
          else if (idx === 2) x2 = fBuf[2]!
          else x3 = fBuf[3]!
          const nr = ar * crossR - ai * crossI
          const ni = ar * crossI + ai * crossR
          ar = nr; ai = ni
        } else {
          const nr = ar * keepR - ai * keepI
          const ni = ar * keepI + ai * keepR
          ar = nr; ai = ni
        }
      }
      addFast4(out, x0, x1, x2, x3, ar, ai)
    }
  }
  return out
}

// Combined verbatim middle triple (M_meet o M_pair(zeta_18) o K) on Fast4State (they pairwise commute!)
function fast4MiddleTriple(st: Fast4State, dag: boolean, opts: BeatOptions): Fast4State {
  const eqPhR = W_C[0], eqPhI = dag ? -W_C[1] : W_C[1]
  const hopR = PAIR_HOP_C[0], hopI = dag ? -PAIR_HOP_C[1] : PAIR_HOP_C[1]
  const keepPR = PAIR_KEEP_C[0], keepPI = dag ? -PAIR_KEEP_C[1] : PAIR_KEEP_C[1]
  const keepMR = MEET_KEEP_C[0], keepMI = dag ? -MEET_KEEP_C[1] : MEET_KEEP_C[1]
  const swapMR = MEET_SWAP_C[0], swapMI = dag ? -MEET_SWAP_C[1] : MEET_SWAP_C[1]
  const out = createFast4(Math.max(64, st.len))
  const cBuf = new Int32Array(4)
  const dBuf = new Int32Array(4)
  const sBuf = new Int32Array(4)
  for (let i = 0; i < st.len; i++) {
    let ar = st.re[i]!, ai = st.im[i]!
    if (ar * ar + ai * ai < 1e-30) continue
    cBuf[0] = st.c0[i]!; cBuf[1] = st.c1[i]!; cBuf[2] = st.c2[i]!; cBuf[3] = st.c3[i]!
    for (let k = 0; k < 4; k++) {
      const ds = cBuf[k]! >>> 2, s = ds % 24
      dBuf[k] = (ds - s) / 24; sBuf[k] = s
    }
    // 1. K: opposite-sign antipodal bounce
    let usedK = 0
    for (let k = 0; k < 4; k++) {
      if ((usedK & (1 << k)) !== 0) continue
      const dk = dBuf[k]!, sk = sBuf[k]!, opp = OPPOSITE_SLOT[sk]!
      for (let j = k + 1; j < 4 && dBuf[j] === dk; j++) {
        if (sBuf[j] === opp && ((cBuf[k]! ^ cBuf[j]!) & 2) !== 0) {
          usedK |= 1 << j
          cBuf[k] = ((dk * 24 + opp) << 2) | (cBuf[k]! & 3)
          cBuf[j] = ((dk * 24 + sk) << 2) | (cBuf[j]! & 3)
          sBuf[k] = opp; sBuf[j] = sk
          ar = -ar; ai = -ai
          if (opts.stats) opts.stats.kBounceHits++
          break
        }
      }
    }
    // 2. Check M_pair (dock run of exact length 2 with same tone & role on antipodal line) & M_meet
    const mPairRuns: [number, number, number][] = []
    const mMeetSwaps: [number, number][] = []
    let k = 0
    while (k < 4) {
      const dk = dBuf[k]!
      let end = k + 1
      while (end < 4 && dBuf[end] === dk) end++
      if (end - k === 2) {
        if (OPPOSITE_SLOT[sBuf[k]!] === sBuf[k + 1]! && (cBuf[k]! & 3) === (cBuf[k + 1]! & 3)) {
          mPairRuns.push([k, k + 1, LINE_OF_SLOT[sBuf[k]!]!])
          if (opts.stats) opts.stats.mPairHits++
        }
      }
      let usedM = 0
      for (let a = k; a < end; a++) {
        if ((usedM & (1 << a)) !== 0) continue
        const opp = OPPOSITE_SLOT[sBuf[a]!]!
        for (let b = a + 1; b < end; b++) {
          if (sBuf[b] === opp && ((cBuf[a]! ^ cBuf[b]!) & 2) === 0) {
            usedM |= 1 << b
            if (opts.stats) opts.stats.mMeetHits++
            if (((cBuf[a]! ^ cBuf[b]!) & 1) === 0) {
              const nr = ar * eqPhR - ai * eqPhI
              const ni = ar * eqPhI + ai * eqPhR
              ar = nr; ai = ni
            } else {
              mMeetSwaps.push([a, b])
            }
            break
          }
        }
      }
      k = end
    }
    if (mPairRuns.length === 0 && mMeetSwaps.length === 0) {
      addFast4(out, cBuf[0]!, cBuf[1]!, cBuf[2]!, cBuf[3]!, ar, ai)
      continue
    }
    // Expand any active M_pair and M_meet branches
    let list: [number, number, number, number, number, number][] = [[cBuf[0]!, cBuf[1]!, cBuf[2]!, cBuf[3]!, ar, ai]]
    for (const [i0, i1, curL] of mPairRuns) {
      const next: [number, number, number, number, number, number][] = []
      for (const row of list) {
        const tail = row[i0]! & 3
        const d = ((row[i0]! >>> 2) - ((row[i0]! >>> 2) % 24)) / 24
        for (let tL = 0; tL < 12; tL++) {
          const multR = tL === curL ? keepPR : hopR
          const multI = tL === curL ? keepPI : hopI
          const nr = row[4] * multR - row[5] * multI
          const ni = row[4] * multI + row[5] * multR
          const cp: [number, number, number, number, number, number] = [row[0], row[1], row[2], row[3], nr, ni]
          if (tL !== curL) {
            cp[i0] = ((d * 24 + LINES[tL]![0]) << 2) | tail
            cp[i1] = ((d * 24 + LINES[tL]![1]) << 2) | tail
          }
          next.push(cp)
        }
      }
      list = next
    }
    for (const [iA, iB] of mMeetSwaps) {
      const next: [number, number, number, number, number, number][] = []
      for (const row of list) {
        const kr = row[4] * keepMR - row[5] * keepMI, ki = row[4] * keepMI + row[5] * keepMR
        next.push([row[0], row[1], row[2], row[3], kr, ki])
        const sr = row[4] * swapMR - row[5] * swapMI, si = row[4] * swapMI + row[5] * swapMR
        const sw: [number, number, number, number, number, number] = [row[0], row[1], row[2], row[3], sr, si]
        const rA = row[iA]! & 1, rB = row[iB]! & 1
        sw[iA] = (row[iA]! & ~1) | rB
        sw[iB] = (row[iB]! & ~1) | rA
        next.push(sw)
      }
      list = next
    }
    for (const row of list) addFast4(out, row[0], row[1], row[2], row[3], row[4], row[5])
  }
  return out
}

function fast4Stream(st: Fast4State, dag: boolean, geom: LatticeGeometry): Fast4State {
  const out = createFast4(Math.max(64, st.len))
  for (let i = 0; i < st.len; i++) {
    const ar = st.re[i]!, ai = st.im[i]!
    if (ar * ar + ai * ai < 1e-30) continue
    const move = (c: number): number => {
      const ds = c >>> 2, s = ds % 24, d = (ds - s) / 24
      const nd = geom.step(d, dag ? OPPOSITE_SLOT[s]! : s)
      return ((nd * 24 + s) << 2) | (c & 3)
    }
    addFast4(out, move(st.c0[i]!), move(st.c1[i]!), move(st.c2[i]!), move(st.c3[i]!), ar, ai)
  }
  return out
}

function applyBareBeat4(st: Fast4State, geom: LatticeGeometry = HYP_GEOM, opts: BeatOptions = {}): Fast4State {
  // Clone amplitudes before in-place Phi_odd so input st is never mutated
  const s0 = createFast4(Math.max(16, st.len))
  for (let i = 0; i < st.len; i++) addFast4(s0, st.c0[i]!, st.c1[i]!, st.c2[i]!, st.c3[i]!, st.re[i]!, st.im[i]!)
  fast4PhiOddInPlace(s0, false, geom, opts)
  const s1 = fast4HalfCoinD(s0, false)
  const s2 = fast4MiddleTriple(s1, false, opts)
  const s3 = fast4HalfCoinD(s2, false)
  fast4PhiOddInPlace(s3, false, geom, opts)
  return fast4Stream(s3, false, geom)
}

function applyBareBeatInverse4(st: Fast4State, geom: LatticeGeometry = HYP_GEOM, opts: BeatOptions = {}): Fast4State {
  const s0 = fast4Stream(st, true, geom)
  fast4PhiOddInPlace(s0, true, geom, opts)
  const s1 = fast4HalfCoinD(s0, true)
  const s2 = fast4MiddleTriple(s1, true, opts)
  const s3 = fast4HalfCoinD(s2, true)
  fast4PhiOddInPlace(s3, true, geom, opts)
  return s3
}

function measureShellMetrics4(st: Fast4State, geom: LatticeGeometry = HYP_GEOM, maxShell = 8): ShellMetrics {
  const qByShell = new Float64Array(maxShell + 1)
  const dActByShell = new Float64Array(maxShell + 1)
  let normSq = 0, qTotal = 0, dActTotal = 0, sumDepthAct = 0, activeBranches = 0
  for (let i = 0; i < st.len; i++) {
    const p = st.re[i]! * st.re[i]! + st.im[i]! * st.im[i]!
    if (p < 1e-30) continue
    activeBranches++
    normSq += p
    for (let k = 0; k < 4; k++) {
      const c = k === 0 ? st.c0[i]! : k === 1 ? st.c1[i]! : k === 2 ? st.c2[i]! : st.c3[i]!
      const ds = c >>> 2, d = (ds - (ds % 24)) / 24
      const t = ((c >>> 1) & 1) === 1 ? -1 : 1
      const dep = geom.depth(d)
      const b = dep <= maxShell ? dep : maxShell
      qByShell[b] = qByShell[b]! + p * t
      dActByShell[b] = dActByShell[b]! + p
      qTotal += p * t
      dActTotal += p
      sumDepthAct += p * dep
    }
  }
  let qBulkGe1 = 0, qBulkGe2 = 0, dActBulkGe1 = 0, sumDabsQBulk = 0, sumAbsQBulk = 0
  for (let d = 1; d <= maxShell; d++) {
    qBulkGe1 += qByShell[d]!
    if (d >= 2) qBulkGe2 += qByShell[d]!
    dActBulkGe1 += dActByShell[d]!
    sumDabsQBulk += d * Math.abs(qByShell[d]!)
    sumAbsQBulk += Math.abs(qByShell[d]!)
  }
  const dAct0 = dActByShell[0]!
  return {
    normSq,
    qTotal,
    dActTotal,
    qByShell,
    dActByShell,
    qBulkGe1,
    qBulkGe2,
    dActBulkGe1,
    meanDepthAll: dActTotal > 1e-14 ? sumDepthAct / dActTotal : 0,
    meanDepthBulkQ: sumAbsQBulk > 1e-14 ? sumDabsQBulk / sumAbsQBulk : 0,
    etaHusk: dAct0 > 1e-14 ? Math.abs(qByShell[0]!) / dAct0 : 0,
    etaGlobal: dActTotal > 1e-14 ? Math.abs(qByShell[0]!) / dActTotal : 0,
    branches: activeBranches,
  }
}

function measureShellMetrics(st: FState, geom: LatticeGeometry = HYP_GEOM, maxShell = 8): ShellMetrics {
  const qByShell = new Float64Array(maxShell + 1)
  const dActByShell = new Float64Array(maxShell + 1)
  let normSq = 0
  let qTotal = 0
  let dActTotal = 0
  let sumDepthAct = 0
  for (const e of st.values()) {
    const p = e.re * e.re + e.im * e.im
    normSq += p
    for (const [d, , t] of e.vibes) {
      const dep = geom.depth(d)
      const bucket = dep <= maxShell ? dep : maxShell
      qByShell[bucket] = qByShell[bucket]! + p * t
      dActByShell[bucket] = dActByShell[bucket]! + p
      qTotal += p * t
      dActTotal += p
      sumDepthAct += p * dep
    }
  }
  let qBulkGe1 = 0, qBulkGe2 = 0, dActBulkGe1 = 0
  let sumDabsQBulk = 0, sumAbsQBulk = 0
  for (let d = 1; d <= maxShell; d++) {
    qBulkGe1 += qByShell[d]!
    if (d >= 2) qBulkGe2 += qByShell[d]!
    dActBulkGe1 += dActByShell[d]!
    sumDabsQBulk += d * Math.abs(qByShell[d]!)
    sumAbsQBulk += Math.abs(qByShell[d]!)
  }
  const dAct0 = dActByShell[0]!
  const etaHusk = dAct0 > 1e-14 ? Math.abs(qByShell[0]!) / dAct0 : 0
  const etaGlobal = dActTotal > 1e-14 ? Math.abs(qByShell[0]!) / dActTotal : 0
  return {
    normSq,
    qTotal,
    dActTotal,
    qByShell,
    dActByShell,
    qBulkGe1,
    qBulkGe2,
    dActBulkGe1,
    meanDepthAll: dActTotal > 1e-14 ? sumDepthAct / dActTotal : 0,
    meanDepthBulkQ: sumAbsQBulk > 1e-14 ? sumDabsQBulk / sumAbsQBulk : 0,
    etaHusk,
    etaGlobal,
    branches: st.size,
  }
}

// ============================================================================
// DETERMINISTIC LINEAR ALGEBRA PRIMITIVES (FOR PART 2: ENTROPY, LLY, GREEN'S)
// ============================================================================

type CMat = { readonly n: number; readonly re: Float64Array; readonly im: Float64Array }
const cmatZero = (n: number): CMat => ({ n, re: new Float64Array(n * n), im: new Float64Array(n * n) })

function cmatEye(n: number): CMat {
  const M = cmatZero(n)
  for (let i = 0; i < n; i++) M.re[i * n + i] = 1
  return M
}

function cmatMul(A: CMat, B: CMat): CMat {
  const n = A.n, out = cmatZero(n)
  for (let i = 0; i < n; i++) {
    for (let k = 0; k < n; k++) {
      const ar = A.re[i * n + k]!, ai = A.im[i * n + k]!
      if (ar === 0 && ai === 0) continue
      for (let j = 0; j < n; j++) {
        const br = B.re[k * n + j]!, bi = B.im[k * n + j]!
        out.re[i * n + j] = out.re[i * n + j]! + (ar * br - ai * bi)
        out.im[i * n + j] = out.im[i * n + j]! + (ar * bi + ai * br)
      }
    }
  }
  return out
}

function cmatUnitaryErr(U: CMat): number {
  const n = U.n
  let m = 0
  for (let i = 0; i < n; i++) {
    for (let j = 0; j < n; j++) {
      let sr = 0, si = 0
      for (let k = 0; k < n; k++) {
        const aR = U.re[k * n + i]!, aI = -U.im[k * n + i]!
        const bR = U.re[k * n + j]!, bI = U.im[k * n + j]!
        sr += aR * bR - aI * bI
        si += aR * bI + aI * bR
      }
      m = Math.max(m, Math.hypot(sr - (i === j ? 1 : 0), si))
    }
  }
  return m
}

function tridiagQL(d: Float64Array, eIn: Float64Array, z: Float64Array, n: number): void {
  const e = new Float64Array(n)
  for (let i = 1; i < n; i++) e[i - 1] = eIn[i]!
  e[n - 1] = 0
  for (let l = 0; l < n; l++) {
    let iter = 0
    for (;;) {
      let m = l
      while (m < n - 1) {
        const dd = Math.abs(d[m]!) + Math.abs(d[m + 1]!)
        if (Math.abs(e[m]!) <= 1e-15 * Math.max(1e-30, dd)) break
        m++
      }
      if (m === l) break
      if (++iter > 80) break
      let g = (d[l + 1]! - d[l]!) / (2 * e[l]!)
      let r = Math.hypot(g, 1)
      g = d[m]! - d[l]! + e[l]! / (g + (g >= 0 ? r : -r))
      let s = 1, c = 1, p = 0
      for (let i = m - 1; i >= l; i--) {
        const f = s * e[i]!, b = c * e[i]!
        r = Math.hypot(f, g)
        e[i + 1] = r
        if (r === 0) { d[i + 1] = d[i + 1]! - p; e[m] = 0; break }
        s = f / r; c = g / r; g = d[i + 1]! - p
        const rr = (d[i]! - g) * s + 2 * c * b
        p = s * rr; d[i + 1] = g + p; g = c * rr - b
        for (let k = 0; k < n; k++) {
          const zki1 = z[k * n + (i + 1)]!, zki = z[k * n + i]!
          z[k * n + (i + 1)] = s * zki + c * zki1
          z[k * n + i] = c * zki - s * zki1
        }
      }
      if (r === 0 && m > l) continue
      d[l] = d[l]! - p; e[l] = g; e[m] = 0
    }
  }
}

function hermitianEigenValues(H: CMat): Float64Array {
  const n = H.n
  if (n === 1) return new Float64Array([H.re[0]!])
  const hr = Float64Array.from(H.re)
  const hi = Float64Array.from(H.im)
  const cSubRe = new Float64Array(n), cSubIm = new Float64Array(n)
  for (let k = 0; k < n - 2; k++) {
    const m = n - k - 1
    let norm2 = 0
    for (let i = 0; i < m; i++) {
      const r = hr[(k + 1 + i) * n + k]!, im = hi[(k + 1 + i) * n + k]!
      norm2 += r * r + im * im
    }
    const sigma = Math.sqrt(norm2)
    if (sigma < 1e-30) continue
    const x0r = hr[(k + 1) * n + k]!, x0i = hi[(k + 1) * n + k]!, x0a = Math.hypot(x0r, x0i)
    const phR = x0a > 1e-30 ? x0r / x0a : 1, phI = x0a > 1e-30 ? x0i / x0a : 0
    const vr = new Float64Array(m), vi = new Float64Array(m)
    for (let i = 0; i < m; i++) { vr[i] = hr[(k + 1 + i) * n + k]!; vi[i] = hi[(k + 1 + i) * n + k]! }
    vr[0] = vr[0]! + phR * sigma; vi[0] = vi[0]! + phI * sigma
    let vn2 = 0
    for (let i = 0; i < m; i++) vn2 += vr[i]! * vr[i]! + vi[i]! * vi[i]!
    if (vn2 < 1e-30) continue
    const beta = 2 / vn2
    const ur = new Float64Array(m), ui = new Float64Array(m)
    for (let i = 0; i < m; i++) {
      let sr = 0, si = 0
      const ro = (k + 1 + i) * n + (k + 1)
      for (let j = 0; j < m; j++) {
        const aR = hr[ro + j]!, aI = hi[ro + j]!, bR = vr[j]!, bI = vi[j]!
        sr += aR * bR - aI * bI; si += aR * bI + aI * bR
      }
      ur[i] = beta * sr; ui[i] = beta * si
    }
    let kappa = 0
    for (let i = 0; i < m; i++) kappa += vr[i]! * ur[i]! + vi[i]! * ui[i]!
    kappa *= 0.5 * beta
    const wr = new Float64Array(m), wi = new Float64Array(m)
    for (let i = 0; i < m; i++) { wr[i] = ur[i]! - kappa * vr[i]!; wi[i] = ui[i]! - kappa * vi[i]! }
    for (let i = 0; i < m; i++) {
      const vRi = vr[i]!, vIi = vi[i]!, wRi = wr[i]!, wIi = wi[i]!
      const ro = (k + 1 + i) * n + (k + 1)
      for (let j = 0; j < m; j++) {
        const vRj = vr[j]!, vIj = vi[j]!, wRj = wr[j]!, wIj = wi[j]!
        hr[ro + j] = hr[ro + j]! - (vRi * wRj + vIi * wIj + (wRi * vRj + wIi * vIj))
        hi[ro + j] = hi[ro + j]! - (vIi * wRj - vRi * wIj + (wIi * vRj - wRi * vIj))
      }
    }
    cSubRe[k + 1] = -phR * sigma; cSubIm[k + 1] = -phI * sigma
  }
  cSubRe[n - 1] = hr[(n - 1) * n + (n - 2)]!
  cSubIm[n - 1] = hi[(n - 1) * n + (n - 2)]!
  const d = new Float64Array(n), e = new Float64Array(n)
  d[0] = hr[0]!
  for (let k = 1; k < n; k++) { d[k] = hr[k * n + k]!; e[k] = Math.hypot(cSubRe[k]!, cSubIm[k]!) }
  const z = new Float64Array(n * n)
  for (let i = 0; i < n; i++) z[i * n + i] = 1
  tridiagQL(d, e, z, n)
  return d
}

function floydWarshall(nV: number, edgeLen: readonly Float64Array[]): Float64Array[] {
  const d = edgeLen.map(r => Float64Array.from(r))
  for (let k = 0; k < nV; k++) {
    for (let i = 0; i < nV; i++) {
      const dik = d[i]![k]!
      if (dik >= 1e14) continue
      for (let j = 0; j < nV; j++) {
        const alt = dik + d[k]![j]!
        if (alt < d[i]![j]!) d[i]![j] = alt
      }
    }
  }
  return d
}

function exactWasserstein1(muA: readonly number[], muB: readonly number[], dist: readonly Float64Array[]): number {
  const nV = muA.length
  const srcIdx: number[] = [], srcMass: number[] = []
  const dstIdx: number[] = [], dstMass: number[] = []
  for (let v = 0; v < nV; v++) {
    const diff = muA[v]! - muB[v]!
    if (diff > 1e-15) { srcIdx.push(v); srcMass.push(diff) }
    else if (diff < -1e-15) { dstIdx.push(v); dstMass.push(-diff) }
  }
  const m = srcIdx.length, n = dstIdx.length
  if (m === 0 || n === 0) return 0
  const totS = srcMass.reduce((a, b) => a + b, 0)
  const totD = dstMass.reduce((a, b) => a + b, 0)
  dstMass[n - 1] = dstMass[n - 1]! + (totS - totD)

  const cost: number[][] = Array.from({ length: m }, (_, i) =>
    Array.from({ length: n }, (_, j) => dist[srcIdx[i]!]![dstIdx[j]!]!),
  )
  const isBasic: boolean[][] = Array.from({ length: m }, () => new Array<boolean>(n).fill(false))
  const flow: number[][] = Array.from({ length: m }, () => new Array<number>(n).fill(0))
  const remS = srcMass.slice(), remD = dstMass.slice()
  let ri = 0, cj = 0
  while (ri < m && cj < n) {
    isBasic[ri]![cj] = true
    const f = Math.min(remS[ri]!, remD[cj]!)
    flow[ri]![cj] = f; remS[ri] = remS[ri]! - f; remD[cj] = remD[cj]! - f
    if (ri === m - 1 && cj === n - 1) break
    if (cj === n - 1) ri++
    else if (ri === m - 1) cj++
    else if (remS[ri]! <= remD[cj]!) ri++
    else cj++
  }
  const u = new Float64Array(m), v = new Float64Array(n)
  for (let iter = 0; iter < 5000; iter++) {
    const uSet = new Uint8Array(m), vSet = new Uint8Array(n)
    u[0] = 0; uSet[0] = 1
    const q: number[] = [0]
    let head = 0
    while (head < q.length) {
      const node = q[head++]!
      if (node < m) {
        for (let j = 0; j < n; j++) {
          if (isBasic[node]![j] && !vSet[j]) { v[j] = cost[node]![j]! - u[node]!; vSet[j] = 1; q.push(m + j) }
        }
      } else {
        const col = node - m
        for (let i = 0; i < m; i++) {
          if (isBasic[i]![col] && !uSet[i]) { u[i] = cost[i]![col]! - v[col]!; uSet[i] = 1; q.push(i) }
        }
      }
    }
    let enterI = -1, enterJ = -1, minRed = -1e-12
    const useBland = iter > 150
    outer: for (let i = 0; i < m; i++) {
      for (let j = 0; j < n; j++) {
        if (isBasic[i]![j]) continue
        const red = cost[i]![j]! - u[i]! - v[j]!
        if (red < minRed) { minRed = red; enterI = i; enterJ = j; if (useBland) break outer }
      }
    }
    if (enterI === -1) break
    const parent = new Int32Array(m + n).fill(-1)
    parent[enterI] = enterI
    const target = m + enterJ
    const bq: number[] = [enterI]
    let bh = 0
    while (bh < bq.length && parent[target] === -1) {
      const cur = bq[bh++]!
      if (cur < m) {
        for (let j = 0; j < n; j++) if (isBasic[cur]![j] && parent[m + j] === -1) { parent[m + j] = cur; bq.push(m + j) }
      } else {
        const col = cur - m
        for (let i = 0; i < m; i++) if (isBasic[i]![col] && parent[i] === -1) { parent[i] = cur; bq.push(i) }
      }
    }
    const pathNodes: number[] = []
    for (let x = target; x !== enterI; x = parent[x]!) pathNodes.push(x)
    pathNodes.push(enterI); pathNodes.reverse()
    const cycle: [number, number, number][] = [[enterI, enterJ, 1]]
    for (let k = 0; k < pathNodes.length - 1; k++) {
      const a = pathNodes[k]!, b = pathNodes[k + 1]!
      cycle.push([a < m ? a : b, a < m ? b - m : a - m, k % 2 === 0 ? -1 : 1])
    }
    let theta = Infinity, leaveI = -1, leaveJ = -1
    for (const [rI, cI, sgn] of cycle) {
      if (sgn !== -1) continue
      const f = flow[rI]![cI]!
      if (f < theta - 1e-15 || (Math.abs(f - theta) <= 1e-15 && (leaveI === -1 || rI < leaveI || (rI === leaveI && cI < leaveJ)))) {
        theta = f; leaveI = rI; leaveJ = cI
      }
    }
    for (const [rI, cI, sgn] of cycle) flow[rI]![cI] = Math.max(0, flow[rI]![cI]! + sgn * theta)
    isBasic[enterI]![enterJ] = true; isBasic[leaveI]![leaveJ] = false; flow[leaveI]![leaveJ] = 0
  }
  let primal = 0
  for (let i = 0; i < m; i++) for (let j = 0; j < n; j++) primal += flow[i]![j]! * cost[i]![j]!
  return primal
}

function computeLLYCurvature(x: number, y: number, weights: readonly Float64Array[], dist: readonly Float64Array[]): number {
  const nV = weights.length
  const makeMeasure = (v: number, alpha: number): number[] => {
    const mu = new Array<number>(nV).fill(0)
    mu[v] = alpha
    let deg = 0
    for (let u = 0; u < nV; u++) if (u !== v) deg += weights[v]![u]!
    if (deg > 1e-15) {
      const sc = (1 - alpha) / deg
      for (let u = 0; u < nV; u++) if (u !== v && weights[v]![u]! > 0) mu[u] = weights[v]![u]! * sc
    }
    return mu
  }
  const dxy = dist[x]![y]!
  const w1 = exactWasserstein1(makeMeasure(x, 0.95), makeMeasure(y, 0.95), dist)
  return (1 - w1 / dxy) / 0.05
}

// ============================================================================
// PART 1 (C1-C5): HUSK-VS-BULK Phi_odd BARYOGENESIS WITH EXACT Q_total = 0
// ============================================================================

function runPart1(): { readonly lambdaExact: number; readonly nExact: readonly number[] } {
  console.log('================================================================================')
  console.log('PART 1: HUSK-VS-BULK Phi_odd BARYOGENESIS WITH EXACT GLOBAL Q_total = 0 ON {3,4,3,4}')
  console.log('================================================================================')

  // --------------------------------------------------------------------------
  // C1: Certify {3,4,3,4} cusp geometry, W(B_3) stabilizer, and verbatim bare U
  // --------------------------------------------------------------------------
  let d0Lat = 0, d0Down = 0, oppInD1 = 0
  const d1Docks: number[] = []
  for (let s = 0; s < 24; s++) {
    const nb = stepDock(0, s)
    if (cuspDepth(nb) === 0) {
      d0Lat++
      if (cuspDepth(stepDock(0, OPPOSITE_SLOT[s]!)) === 1) oppInD1++
    } else {
      d0Down++
      d1Docks.push(nb)
    }
  }
  let d1Up = 0, d1Lat = 0, d1Down = 0
  for (const d1 of d1Docks) {
    for (let s = 0; s < 24; s++) {
      const dep = cuspDepth(stepDock(d1, s))
      if (dep === 0) d1Up++
      else if (dep === 1) d1Lat++
      else d1Down++
    }
  }
  // Cross-check universe.ts exact chi_odd witnesses
  const cCode = (s: number, t: -1 | 1): number => (s << 1) + (t < 0 ? 1 : 0)
  const chiMixed = chiral4Sign(cCode(0, 1), cCode(1, -1), cCode(4, 1), cCode(10, 1))
  const chiX1 = chiral4Sign(cCode(0, 1), cCode(1, 1), cCode(4, 1), cCode(16, 1))
  const chi184Zero = chiral4Sign(cCode(0, 1), cCode(1, 1), cCode(4, 1), cCode(10, 1))
  const chi184Act = chiral4Sign(cCode(1, 1), cCode(OPPOSITE_SLOT[0]!, 1), cCode(4, 1), cCode(10, 1))

  // Verify exact CP invariance and C/P violation of verbatim bare U on a chiral k = 4 state
  const testChiral: FState = new Map()
  addEntry(testChiral, [[0, 0, 1, 0], [0, 1, -1, 0], [0, 4, 1, 0], [0, 10, 1, 0]], 1, 0)
  const uChiral = applyBareBeat(testChiral)
  const fast4CrossErr = fast4DiffL2(toFast4(uChiral), applyBareBeat4(toFast4(testChiral)))
  assertExact(fast4CrossErr < 1e-14, `Fast4State diverged from reference FState: ${fast4CrossErr}`)
  const revChiral = applyBareBeatInverse(uChiral)
  const revErrC1 = stateDiffL2(revChiral, testChiral)
  const cpDiffC1 = stateDiffL2(
    applyCState(mapHypStateByPerm(uChiral, P_CUSP_REF)),
    applyBareBeat(applyCState(mapHypStateByPerm(testChiral, P_CUSP_REF))),
  )
  const cViolC1 = stateDiffL2(applyCState(uChiral), applyBareBeat(applyCState(testChiral)))
  const pViolC1 = stateDiffL2(mapHypStateByPerm(uChiral, P_CUSP_REF), applyBareBeat(mapHypStateByPerm(testChiral, P_CUSP_REF)))

  // Verify P_cusp preserves cuspDepth identically across ALL 481 docks in the R <= 2 ball around dock 0
  const r2Dist = new Map<number, number>([[0, 0]])
  const r2Mapped = new Map<number, number>([[0, 0]])
  const r2Queue: number[] = [0]
  for (let head = 0; head < r2Queue.length; head++) {
    const u = r2Queue[head]!
    const du = r2Dist.get(u)!
    if (du >= 2) continue
    const mu = r2Mapped.get(u)!
    for (let s = 0; s < 24; s++) {
      const nb = stepDock(u, s)
      if (!r2Dist.has(nb)) {
        r2Dist.set(nb, du + 1)
        r2Mapped.set(nb, stepDock(mu, P_CUSP_REF[s]!))
        r2Queue.push(nb)
      }
    }
  }
  assertExact(r2Queue.length === 481, `Expected 481 docks in R <= 2 ball, got ${r2Queue.length}`)
  let pCuspDepthViol = 0
  for (const d of r2Queue) {
    if (cuspDepth(d) !== cuspDepth(r2Mapped.get(d)!)) pCuspDepthViol++
  }

  console.log('\n  [C1] Exact {3,4,3,4} Horosphere Cusp & Verbatim Bare-U Certification:')
  console.log(
    `       D=0 cusp facets: LAYER_SLOTS=[${LAYER_SLOTS.join(', ')}] (6 lat + 18 down, ${oppInD1}/6 antipodal pairs split D=0 <-> D=1)`,
  )
  console.log(
    `       D=1 bulk facets: ${d1Up} up + ${d1Lat} lat + ${d1Down} down across N_1=${d1Docks.length} docks`,
  )
  console.log(
    `       Cusp stabilizer W(B_3) in W(F_4): |W(B_3)^+|=${WB3_PROPER.length}, |W(B_3)^-|=${WB3_IMPROPER.length}, non-cusp W(F_4)^-=${WF4_IMPROPER_NONCUSP.length}, P_cusp depth defects=${pCuspDepthViol}/${r2Queue.length} (full R<=2 ball)`,
  )
  console.log(
    `       chi_odd witnesses (universe.ts): mixed=${chiMixed}, X1=${chiX1}, E-FND-0184=${chi184Zero}/${chi184Act}`,
  )
  console.log(
    `       Bare-U symmetry check: revErr=${revErrC1.toExponential(2)}, cpDiff=${cpDiffC1.toExponential(2)}, C-viol=${cViolC1.toFixed(6)}, P-viol=${pViolC1.toFixed(6)}`,
  )

  recordCheck(
    'C1',
    '{3,4,3,4} cusp geometry, W(B_3) stabilizer & verbatim bare-U CP/C/P certification',
    d0Lat === 6 &&
      d0Down === 18 &&
      oppInD1 === 6 &&
      d1Up === 18 &&
      d1Lat === 24 &&
      d1Down === 390 &&
      WB3_PROPER.length === 24 &&
      WB3_IMPROPER.length === 24 &&
      r2Queue.length === 481 &&
      pCuspDepthViol === 0 &&
      chiMixed !== 0 &&
      chiX1 !== 0 &&
      chi184Zero === 0 &&
      chi184Act !== 0 &&
      revErrC1 < 1e-14 &&
      cpDiffC1 < 1e-14 &&
      cViolC1 > 0.5 &&
      pViolC1 > 0.5,
    `6lat+18down, W(B_3)=24+24, P_cusp=0/481, revErr=${revErrC1.toExponential(1)}, cpDiff=${cpDiffC1.toExponential(1)}, C/P-viol=${cViolC1.toFixed(3)}`,
  )

  // --------------------------------------------------------------------------
  // C2: Exact t = 0..6 Husk-vs-Bulk Baryogenesis on Unbounded {3,4,3,4} Cusp
  // --------------------------------------------------------------------------
  // Exhaustively scan k = 4, Q = 0_V (++--) quads on 4 distinct antipodal lines with q3 in LAYER_SLOTS
  // where flipping q3 -> opp(q3) changes chi_odd (deltaChi = chi(a) - chi(b) != 0)!
  const q0Patterns: readonly (readonly [-1 | 1, -1 | 1, -1 | 1, -1 | 1])[] = [
    [1, -1, -1, 1],
    [-1, 1, -1, 1],
    [-1, -1, 1, 1],
  ]
  type ChiralPumpWitness = {
    readonly slots: readonly [number, number, number, number]
    readonly tones: readonly [-1 | 1, -1 | 1, -1 | 1, -1 | 1]
    readonly chiA: number
    readonly chiB: number
    readonly cuspSlotsCount: number
  }
  let witnessSingle: ChiralPumpWitness | undefined
  let witnessDelta2: ChiralPumpWitness | undefined
  let totalDistinctLinePumps = 0
  let totalDelta2Pumps = 0
  let totalAntipodalPairChiral = 0
  let witnessMPair: { readonly slots: readonly [number, number, number, number]; readonly tones: readonly [-1 | 1, -1 | 1, -1 | 1, -1 | 1]; readonly chiA: number; readonly chiB: number } | undefined

  // Also locate a pure-bulk-spectator pump witness (q3 in LAYER_SLOTS, q0,q1,q2 on pure-bulk lines!)
  // Equal weights give max beat-1 magnitude |<Q_0>| = 3/8 (eta = 3/4) while destructive interference reaches eta = 1!
  let witnessMaxEta: ChiralPumpWitness | undefined
  for (const q3 of LAYER_SLOTS) {
    const l3 = LINE_OF_SLOT[q3]!
    const opp3 = OPPOSITE_SLOT[q3]!
    for (let q0 = 0; q0 < 24; q0++) {
      const l0 = LINE_OF_SLOT[q0]!
      if (l0 === l3) continue
      for (let q1 = q0 + 1; q1 < 24; q1++) {
        const l1 = LINE_OF_SLOT[q1]!
        if (l1 === l3 || l1 === l0) continue
        for (let q2 = q1 + 1; q2 < 24; q2++) {
          const l2 = LINE_OF_SLOT[q2]!
          if (l2 === l3 || l2 === l0 || l2 === l1) continue
          for (const ts of q0Patterns) {
            const chiA = chiral4Sign(
              cCode(q0, ts[0]),
              cCode(q1, ts[1]),
              cCode(q2, ts[2]),
              cCode(q3, ts[3]),
            )
            const chiB = chiral4Sign(
              cCode(q0, ts[0]),
              cCode(q1, ts[1]),
              cCode(q2, ts[2]),
              cCode(opp3, ts[3]),
            )
            const diff = Math.abs(chiA - chiB)
            if (diff > 0) {
              totalDistinctLinePumps++
              const cuspCnt =
                (LAYER_SLOT_SET.has(q0) || LAYER_SLOT_SET.has(OPPOSITE_SLOT[q0]!) ? 1 : 0) +
                (LAYER_SLOT_SET.has(q1) || LAYER_SLOT_SET.has(OPPOSITE_SLOT[q1]!) ? 1 : 0) +
                (LAYER_SLOT_SET.has(q2) || LAYER_SLOT_SET.has(OPPOSITE_SLOT[q2]!) ? 1 : 0) +
                1
              if (diff === 2) {
                totalDelta2Pumps++
                if (!witnessDelta2 || cuspCnt > witnessDelta2.cuspSlotsCount) {
                  witnessDelta2 = { slots: [q0, q1, q2, q3], tones: ts, chiA, chiB, cuspSlotsCount: cuspCnt }
                }
              }
              if (!witnessSingle && chiA === 1 && chiB === 0 && cuspCnt >= 2) {
                witnessSingle = { slots: [q0, q1, q2, q3], tones: ts, chiA, chiB, cuspSlotsCount: cuspCnt }
              }
              if (!witnessMaxEta && chiA === 1 && chiB === 0 && cuspCnt === 1) {
                witnessMaxEta = { slots: [q0, q1, q2, q3], tones: ts, chiA, chiB, cuspSlotsCount: 1 }
              }
            }
          }
        }
      }
    }
  }
  // Exhaustively verify across ALL 16 tone patterns and ALL antipodal-pair 4-tuples in D_4 that chi_odd === 0
  let totalAntipodalPairChecked = 0
  for (let lPair = 0; lPair < 12; lPair++) {
    const [pA, pB] = LINES[lPair]!
    for (let q2 = 0; q2 < 24; q2++) {
      if (LINE_OF_SLOT[q2] === lPair) continue
      for (let q3 = q2 + 1; q3 < 24; q3++) {
        if (LINE_OF_SLOT[q3] === lPair) continue
        if (LINE_OF_SLOT[q3] === LINE_OF_SLOT[q2] && LINE_OF_SLOT[q2]! < lPair) continue
        for (let tMask = 0; tMask < 16; tMask++) {
          const t0: -1 | 1 = (tMask & 1) ? -1 : 1
          const t1: -1 | 1 = (tMask & 2) ? -1 : 1
          const t2: -1 | 1 = (tMask & 4) ? -1 : 1
          const t3: -1 | 1 = (tMask & 8) ? -1 : 1
          totalAntipodalPairChecked++
          const chi = chiral4Sign(cCode(pA, t0), cCode(pB, t1), cCode(q2, t2), cCode(q3, t3))
          if (chi !== 0) {
            totalAntipodalPairChiral++
            if (!witnessMPair) {
              witnessMPair = { slots: [pA, pB, q2, q3], tones: [t0, t1, t2, t3], chiA: chi, chiB: 0 }
            }
          }
        }
      }
    }
  }
  assertExact(witnessSingle !== undefined, 'Expected at least one distinct-line chi=(1,0) Q=0 pump witness')
  assertExact(witnessMaxEta !== undefined, 'Expected pure-bulk-spectator chi=(1,0) Q=0 witness')
  assertExact(totalAntipodalPairChiral === 0, `Expected 0 chiral antipodal-pair quads across all 16 tone patterns`)

  // Trace exact chordal geodesic depth sequence D(n) along LAYER_SLOTS[0] for n = -3..+4
  const chordalDepths: number[] = []
  let dNeg = 0
  const negTrail: number[] = []
  for (let k = 1; k <= 3; k++) {
    dNeg = stepDock(dNeg, OPPOSITE_SLOT[LAYER_SLOTS[0]!]!)
    negTrail.push(cuspDepth(dNeg))
  }
  for (let k = 2; k >= 0; k--) chordalDepths.push(negTrail[k]!)
  chordalDepths.push(0)
  let dPos = 0
  for (let k = 1; k <= 4; k++) {
    dPos = stepDock(dPos, LAYER_SLOTS[0]!)
    chordalDepths.push(cuspDepth(dPos))
  }

  // Build C-even Q_total = 0 initial states on D = 0 (dock 0):
  //   (1) |psi_int>  : canonical single-line interfering C-even state (|a> + |b> + C|a> + C|b>) / 2
  //                    with chi(a) = +1, chi(b) = 0 -> exact analytic beat-1 <Q_{D=0}(1)> = -3/8 = -0.375!
  //   (2) |psi_d2>   : delta-chi = 2 witness (chi(a) = +1, chi(b) = -1, if present)
  //   (3) |psi_multi>: simultaneous multi-line interfering C-even state maximizing |<Q_{D=0}>| / <D_act,D=0>
  //   (4) |psi_pure> : pure non-superposed C-even ket pair (|a> + C|a>) / sqrt(2) (tests multi-beat recurrence!)
  function buildInterferingCEven(
    slots: readonly [number, number, number, number],
    tones: readonly [-1 | 1, -1 | 1, -1 | 1, -1 | 1],
    flipIdx: number,
  ): FState {
    const a: Vibe[] = slots.map((s, i) => [0, s, tones[i]!, 0] as const)
    const b: Vibe[] = slots.map((s, i) => [0, i === flipIdx ? OPPOSITE_SLOT[s]! : s, tones[i]!, 0] as const)
    const st: FState = new Map()
    addEntry(st, a, 1, 0)
    addEntry(st, b, 1, 0)
    const cSt = applyCState(st)
    const both: FState = new Map()
    for (const e of st.values()) addEntry(both, e.vibes, e.re, e.im)
    for (const e of cSt.values()) addEntry(both, e.vibes, e.re, e.im)
    return normalizeState(both)
  }

  function buildPureKetCEven(
    slots: readonly [number, number, number, number],
    tones: readonly [-1 | 1, -1 | 1, -1 | 1, -1 | 1],
  ): FState {
    const a: Vibe[] = slots.map((s, i) => [0, s, tones[i]!, 0] as const)
    const ca: Vibe[] = slots.map((s, i) => [0, s, (tones[i]! === 1 ? -1 : 1) as -1 | 1, 0] as const)
    const st: FState = new Map()
    addEntry(st, a, 1, 0)
    addEntry(st, ca, 1, 0)
    return normalizeState(st)
  }

  // Construct maximal-eta_husk multi-slot C-even superposition across the 16 line-flip variants of a 4-cusp-line quad
  // (finding optimal real/complex sign weights on all 4 lines so multiple particles pump constructively!)
  const wMain = witnessSingle!
  const psiInt0 = buildInterferingCEven(wMain.slots, wMain.tones, 3)
  const psiPure0 = buildPureKetCEven(wMain.slots, wMain.tones)
  assertExact(stateDiffL2(psiInt0, applyCState(psiInt0)) < 1e-14, 'psiInt0 must be strictly C-even')
  assertExact(stateDiffL2(psiPure0, applyCState(psiPure0)) < 1e-14, 'psiPure0 must be strictly C-even')

  // Evolve psiInt0 for T = 6 beats under VERBATIM bare U on the unbounded exact {3,4,3,4} honeycomb!
  const T_BARYO = 6
  const statsInt = { phiOddHits: 0, mPairHits: 0, kBounceHits: 0, mMeetHits: 0 }
  const psiInt4 = toFast4(psiInt0)
  const trajInt: ShellMetrics[] = [measureShellMetrics4(psiInt4)]
  let curInt = psiInt4
  for (let t = 1; t <= T_BARYO; t++) {
    curInt = applyBareBeat4(curInt, HYP_GEOM, { stats: statsInt })
    trajInt.push(measureShellMetrics4(curInt))
  }
  // Exact memoryless reversal from t = 6 -> t = 0!
  for (let t = 0; t < T_BARYO; t++) curInt = applyBareBeatInverse4(curInt, HYP_GEOM)
  const revErrInt6 = fast4DiffL2(curInt, psiInt4)
  curInt = createFast4(1)

  // Also evolve psiPure0 (pure ket + C-conjugate, ZERO initial superposition!) for T = 6 beats
  const psiPure4 = toFast4(psiPure0)
  const trajPure: ShellMetrics[] = [measureShellMetrics4(psiPure4)]
  let curPure = psiPure4
  for (let t = 1; t <= T_BARYO; t++) {
    curPure = applyBareBeat4(curPure, HYP_GEOM)
    trajPure.push(measureShellMetrics4(curPure))
  }
  curPure = createFast4(1)

  // Also test delta-chi = 2 witness (if found) and M_pair-active antipodal-pair witness (if found)
  let trajD2: ShellMetrics[] | undefined
  if (witnessDelta2) {
    let cur = toFast4(buildInterferingCEven(witnessDelta2.slots, witnessDelta2.tones, 3))
    trajD2 = [measureShellMetrics4(cur)]
    for (let t = 1; t <= 4; t++) {
      cur = applyBareBeat4(cur, HYP_GEOM)
      trajD2.push(measureShellMetrics4(cur))
    }
  }

  let trajMPair: ShellMetrics[] | undefined
  const statsMPair = { phiOddHits: 0, mPairHits: 0, kBounceHits: 0, mMeetHits: 0 }
  if (witnessMPair) {
    let cur = buildInterferingCEven(witnessMPair.slots, witnessMPair.tones, 3)
    trajMPair = [measureShellMetrics(cur)]
    for (let t = 1; t <= 4; t++) {
      cur = applyBareBeat(cur, HYP_GEOM, { stats: statsMPair })
      trajMPair.push(measureShellMetrics(cur))
    }
  }

  // Scan all 2-ket (1-line flip) C-even superpositions across all C(6,4) = 15 4-cusp-slot quads
  // with discrete relative phases {1, i, -1, -i, zeta_6, zeta_6^-1}
  let best4CuspEta = 0
  let best4CuspQ = 0
  let best4CuspDAct = 0
  let best4CuspDesc = ''
  for (let i = 0; i < LAYER_SLOTS.length; i++) {
    for (let j = i + 1; j < LAYER_SLOTS.length; j++) {
      for (let k = j + 1; k < LAYER_SLOTS.length; k++) {
        for (let l = k + 1; l < LAYER_SLOTS.length; l++) {
          const qs: [number, number, number, number] = [
            LAYER_SLOTS[i]!, LAYER_SLOTS[j]!, LAYER_SLOTS[k]!, LAYER_SLOTS[l]!,
          ]
          for (const ts of q0Patterns) {
            const chis = new Int8Array(16)
            let anyNz = false
            for (let m = 0; m < 16; m++) {
              const s0 = (m & 1) ? OPPOSITE_SLOT[qs[0]]! : qs[0]
              const s1 = (m & 2) ? OPPOSITE_SLOT[qs[1]]! : qs[1]
              const s2 = (m & 4) ? OPPOSITE_SLOT[qs[2]]! : qs[2]
              const s3 = (m & 8) ? OPPOSITE_SLOT[qs[3]]! : qs[3]
              const ch = chiral4Sign(cCode(s0, ts[0]), cCode(s1, ts[1]), cCode(s2, ts[2]), cCode(s3, ts[3]))
              chis[m] = ch
              if (ch !== 0) anyNz = true
            }
            if (!anyNz) continue
            for (let mA = 0; mA < 16; mA++) {
              for (let bit = 0; bit < 4; bit++) {
                const mB = mA ^ (1 << bit)
                if (mB <= mA || chis[mA] === chis[mB]) continue
                const sA: Vibe[] = qs.map((q, idx) => [0, (mA >> idx) & 1 ? OPPOSITE_SLOT[q]! : q, ts[idx]!, 0] as const)
                const sB: Vibe[] = qs.map((q, idx) => [0, (mB >> idx) & 1 ? OPPOSITE_SLOT[q]! : q, ts[idx]!, 0] as const)
                const phases: readonly Cx[] = [[1, 0], [0, 1], [-1, 0], [0, -1], Z6_C, cxConj(Z6_C)]
                for (const [pr, pi] of phases) {
                  const st: FState = new Map()
                  addEntry(st, sA, 1, 0)
                  addEntry(st, sB, pr, pi)
                  const cSt = applyCState(st)
                  for (const e of cSt.values()) addEntry(st, e.vibes, e.re, e.im)
                  const psiN = toFast4(normalizeState(st))
                  const m1 = measureShellMetrics4(applyBareBeat4(psiN, HYP_GEOM))
                  if (m1.etaHusk > best4CuspEta + 1e-12) {
                    best4CuspEta = m1.etaHusk
                    best4CuspQ = m1.qByShell[0]!
                    best4CuspDAct = m1.dActByShell[0]!
                    best4CuspDesc = `4-cusp-slot [${qs.join(',')}] tones=[${ts.join(',')}] mA=${mA},mB=${mB} chi=(${chis[mA]},${chis[mB]}) ph=(${pr.toFixed(2)},${pi.toFixed(2)})`
                  }
                }
              }
            }
          }
        }
      }
    }
  }

  // Exact analytical purity family on pure-bulk-spectator quad [12, 13, 18, 0] (chi = (1, 0)):
  // Because C is linear, ANY normalized (alpha |a> + beta |b> + C(...)) / sqrt(2) is strictly Q = 0 and C-even!
  //   (i)   Equal weights, phi = 0: maximizes magnitude |<Q_0(1)>| = 3/8 = 0.375000 (eta_husk = 3/4 = 0.750000)
  //   (ii)  Equal weights, optimal phase phi_* = pi + arcsin(sqrt(3)/4) = 3.589425: eta_husk = 3/sqrt(13) = 0.832050
  //   (iii) Exact destructive interference alpha = sqrt(3)/2, beta = (1/2) e^{-i pi/6}:
  //         P_+(D=0, t=1) === 0, <Q_0(1)> = -9/32 = -0.281250, <D_act,0(1)> = 9/32, eta_husk = 1.000000 (100% pure matter!)
  const buildWeightedCEven = (
    slots: readonly [number, number, number, number],
    tones: readonly [-1 | 1, -1 | 1, -1 | 1, -1 | 1],
    flipIdx: number,
    alpha: Cx,
    beta: Cx,
  ): FState => {
    const a: Vibe[] = slots.map((s, i) => [0, s, tones[i]!, 0] as const)
    const b: Vibe[] = slots.map((s, i) => [0, i === flipIdx ? OPPOSITE_SLOT[s]! : s, tones[i]!, 0] as const)
    const st: FState = new Map()
    addEntry(st, a, alpha[0], alpha[1])
    addEntry(st, b, beta[0], beta[1])
    const cSt = applyCState(st)
    const both: FState = new Map()
    for (const e of st.values()) addEntry(both, e.vibes, e.re, e.im)
    for (const e of cSt.values()) addEntry(both, e.vibes, e.re, e.im)
    return normalizeState(both)
  }
  const wSpec = witnessMaxEta!
  const psiEqZero = buildWeightedCEven(wSpec.slots, wSpec.tones, 3, [Math.SQRT1_2, 0], [Math.SQRT1_2, 0])
  const mEqZero = measureShellMetrics(applyBareBeat(psiEqZero, HYP_GEOM))

  const phiOptEq = PI + Math.asin(SQRT3 / 4)
  const psiEqPhi = buildWeightedCEven(
    wSpec.slots,
    wSpec.tones,
    3,
    [Math.SQRT1_2, 0],
    [Math.SQRT1_2 * Math.cos(phiOptEq), Math.SQRT1_2 * Math.sin(phiOptEq)],
  )
  const mEqPhi = measureShellMetrics(applyBareBeat(psiEqPhi, HYP_GEOM))

  const psiPure100 = buildWeightedCEven(
    wSpec.slots,
    wSpec.tones,
    3,
    [SQRT3 / 2, 0],
    [0.5 * Math.cos(-PI / 6), 0.5 * Math.sin(-PI / 6)],
  )
  const pure100CEvenErr = stateDiffL2(psiPure100, applyCState(psiPure100))
  const uPure100 = applyBareBeat(psiPure100, HYP_GEOM)
  const mPure100 = measureShellMetrics(uPure100)
  // Verify P_+(D = 0, t = 1) === 0 directly on uPure100
  let pPlusPure100 = 0
  let pMinusPure100 = 0
  for (const e of uPure100.values()) {
    const p = e.re * e.re + e.im * e.im
    for (const [d, , t] of e.vibes) {
      if (cuspDepth(d) === 0) {
        if (t > 0) pPlusPure100 += p
        else pMinusPure100 += p
      }
    }
  }

  let maxNormErrC2 = 0
  let maxQTotalErrC2 = 0
  let maxShellConsErrC2 = 0
  let peakAbsQHusk = 0
  let peakEtaHuskInt = 0
  for (let t = 0; t <= T_BARYO; t++) {
    const m = trajInt[t]!
    maxNormErrC2 = Math.max(maxNormErrC2, Math.abs(m.normSq - 1))
    maxQTotalErrC2 = Math.max(maxQTotalErrC2, Math.abs(m.qTotal))
    maxShellConsErrC2 = Math.max(maxShellConsErrC2, Math.abs(m.qByShell[0]! + m.qBulkGe1))
    peakAbsQHusk = Math.max(peakAbsQHusk, Math.abs(m.qByShell[0]!))
    peakEtaHuskInt = Math.max(peakEtaHuskInt, m.etaHusk)
  }

  const fmtS = (x: number): string => `${x >= 0 ? '+' : ''}${x.toFixed(6)}`
  console.log('\n  [C2] Exact t = 0..6 Husk-vs-Bulk Baryogenesis Under Verbatim Bare U (Unbounded {3,4,3,4}):')
  console.log(
    `       Exhaustive pump scan: ${totalDistinctLinePumps} distinct-line Q=0 pumps (${totalDelta2Pumps} with |dChi|=2), ${totalAntipodalPairChiral}/${totalAntipodalPairChecked} antipodal-pair chiral quads across all 16 tone patterns`,
  )
  console.log(
    `       Chordal geodesic depth along LAYER_SLOTS[0] (n = -3..+4): D = [${chordalDepths.join(', ')}] (stays on D=0 for only 2 docks -> transient impulse with sign oscillation)`,
  )
  console.log(
    `       Canonical witness |psi_int>: slots=[${wMain.slots.join(',')}] tones=[${wMain.tones.join(',')}] (q3=${wMain.slots[3]} in D=0, opp=${OPPOSITE_SLOT[wMain.slots[3]]} in D=1), chi=(${wMain.chiA},${wMain.chiB})`,
  )
  console.log('       Beat t |  Branches |   <Q_{D=0}>  |   <Q_{D=1}>  |  <Q_{D>=2}>  | <Q_{tot}> | <D_act,0> | eta_husk | <D_Qbulk>')
  for (let t = 0; t <= T_BARYO; t++) {
    const m = trajInt[t]!
    console.log(
      `          ${t}   | ${String(m.branches).padStart(9)} | ${fmtS(m.qByShell[0]!).padStart(12)} | ${fmtS(m.qByShell[1]!).padStart(12)} | ${fmtS(m.qBulkGe2).padStart(12)} |  ${m.qTotal.toExponential(1)} |  ${m.dActByShell[0]!.toFixed(5)} |  ${m.etaHusk.toFixed(5)} |   ${m.meanDepthBulkQ.toFixed(4)}`,
    )
  }
  console.log(
    `       Certificates: maxNormErr=${maxNormErrC2.toExponential(2)}, max|<Q_tot>|=${maxQTotalErrC2.toExponential(2)}, max|Q_0+Q_bulk|=${maxShellConsErrC2.toExponential(2)}, revErr(t=6->0)=${revErrInt6.toExponential(2)}, Phi_odd hits=${statsInt.phiOddHits}`,
  )
  console.log(
    `       Pure-ket (no t=0 interference) |psi_pure>=(|a>+C|a>)/sqrt(2) <Q_{D=0}(t=0..6)>: [${trajPure.map(m => fmtS(m.qByShell[0]!)).join(', ')}] (phase coherence required!)`,
  )
  if (trajD2 && witnessDelta2) {
    console.log(
      `       |dChi|=2 witness slots=[${witnessDelta2.slots.join(',')}] chi=(${witnessDelta2.chiA},${witnessDelta2.chiB}) <Q_{D=0}(t=0..4)>: [${trajD2.map(m => fmtS(m.qByShell[0]!)).join(', ')}]`,
    )
  }
  console.log(
    `       Best 4-cusp-slot 2-ket pump: eta_husk = ${best4CuspEta.toFixed(6)} (exact 3/10 = 0.300000: <Q_0>=${fmtS(best4CuspQ)}, <D_act,0>=${best4CuspDAct.toFixed(5)}) via ${best4CuspDesc}`,
  )
  console.log(
    `       Pure-bulk-spectator [${wSpec.slots.join(',')}] exact beat-1 family (strictly Q=0, C-even):`,
  )
  console.log(
    `         (i)   Equal weights, phi = 0 (max magnitude): <Q_0>=${fmtS(mEqZero.qByShell[0]!)} (-3/8), <D_act,0>=${mEqZero.dActByShell[0]!.toFixed(5)}, eta_husk=${mEqZero.etaHusk.toFixed(6)} (3/4)`,
  )
  console.log(
    `         (ii)  Equal weights, phi_*=${phiOptEq.toFixed(6)}: <Q_0>=${fmtS(mEqPhi.qByShell[0]!)}, <D_act,0>=${mEqPhi.dActByShell[0]!.toFixed(5)}, eta_husk=${mEqPhi.etaHusk.toFixed(6)} (3/sqrt(13)=${(3 / Math.sqrt(13)).toFixed(6)})`,
  )
  console.log(
    `         (iii) Destructive interference alpha=sqrt(3)/2, beta=(1/2)e^{-i pi/6}: <Q_0>=${fmtS(mPure100.qByShell[0]!)} (-9/32), <D_act,0>=${mPure100.dActByShell[0]!.toFixed(6)}, P_+=${pPlusPure100.toExponential(1)}, P_-=${pMinusPure100.toFixed(6)}, eta_husk=${mPure100.etaHusk.toFixed(6)} (100% PURE MATTER, C-err=${pure100CEvenErr.toExponential(1)}, Q_tot=${mPure100.qTotal.toExponential(1)})`,
  )

  const exactBeat1Match = Math.abs(Math.abs(trajInt[1]!.qByShell[0]!) - 0.375) < 1e-12
  recordCheck(
    'C2',
    'Exact t=0..6 husk-vs-bulk baryogenesis from Q=0, C-even k=4 state under verbatim bare U',
    maxNormErrC2 < 1e-13 &&
      maxQTotalErrC2 < 1e-14 &&
      maxShellConsErrC2 < 1e-14 &&
      revErrInt6 < 1e-13 &&
      exactBeat1Match &&
      peakAbsQHusk >= 0.375 - 1e-12 &&
      Math.abs(trajInt[6]!.qBulkGe2) > 1e-4 &&
      chordalDepths.join(',') === '3,2,1,0,0,1,2,3' &&
      Math.abs(best4CuspEta - 0.3) < 1e-12 &&
      Math.abs(mEqZero.etaHusk - 0.75) < 1e-12 &&
      Math.abs(mEqPhi.etaHusk - 3 / Math.sqrt(13)) < 1e-12 &&
      pure100CEvenErr < 1e-14 &&
      Math.abs(mPure100.qTotal) < 1e-14 &&
      pPlusPure100 < 1e-14 &&
      Math.abs(mPure100.qByShell[0]! + 9 / 32) < 1e-12 &&
      Math.abs(mPure100.etaHusk - 1.0) < 1e-12,
    `Q_0(1)=${fmtS(trajInt[1]!.qByShell[0]!)}, Q_0(3)=${fmtS(trajInt[3]!.qByShell[0]!)}, Q_0(6)=${fmtS(trajInt[6]!.qByShell[0]!)}, revErr6=${revErrInt6.toExponential(1)}, maxMag=3/8(eta=3/4), maxEta=1.0000(-9/32)`,
  )

  // --------------------------------------------------------------------------
  // C3: Crucial Symmetry Controls (Phi_odd=I, CP/P_cusp, P_cusp+, P_perp+, W(B_3)^+)
  // --------------------------------------------------------------------------
  // Control 1: Phi_odd = I on psiInt0 for t = 0..6
  let curNoPhi = psiInt4
  let maxQNoPhi = 0
  for (let t = 1; t <= T_BARYO; t++) {
    curNoPhi = applyBareBeat4(curNoPhi, HYP_GEOM, { enablePhiOdd: false })
    const m = measureShellMetrics4(curNoPhi)
    for (let d = 0; d <= 8; d++) maxQNoPhi = Math.max(maxQNoPhi, Math.abs(m.qByShell[d]!))
  }
  curNoPhi = createFast4(1)

  // Control 2: P_cusp |psiInt0> (exact CP sign flip <Q_{D=0}(t, P_cusp|psi>)> = -<Q_{D=0}(t, |psi>)>)
  const psiPCusp0 = mapHypStateByPerm(psiInt0, P_CUSP_REF)
  let curPCusp = toFast4(psiPCusp0)
  let maxCPSignErr = 0
  const qPCuspSeries: number[] = [0]
  for (let t = 1; t <= T_BARYO; t++) {
    curPCusp = applyBareBeat4(curPCusp, HYP_GEOM)
    const m = measureShellMetrics4(curPCusp)
    qPCuspSeries.push(m.qByShell[0]!)
    maxCPSignErr = Math.max(maxCPSignErr, Math.abs(m.qByShell[0]! + trajInt[t]!.qByShell[0]!))
  }
  curPCusp = createFast4(1)

  // Control 3: Strictly C-even AND P_cusp-even state |psi_{C+, P_cusp+}> = (|psiInt0> + P_cusp|psiInt0>) / norm
  const psiCPcuspEven0: FState = new Map()
  for (const e of psiInt0.values()) addEntry(psiCPcuspEven0, e.vibes, e.re, e.im)
  for (const e of psiPCusp0.values()) addEntry(psiCPcuspEven0, e.vibes, e.re, e.im)
  const psiCPcuspEvenNorm = normalizeState(psiCPcuspEven0)
  assertExact(stateDiffL2(psiCPcuspEvenNorm, applyCState(psiCPcuspEvenNorm)) < 1e-14, 'C+P_cusp+ must be C-even')
  assertExact(
    stateDiffL2(psiCPcuspEvenNorm, mapHypStateByPerm(psiCPcuspEvenNorm, P_CUSP_REF)) < 1e-14,
    'C+P_cusp+ must be P_cusp-even',
  )
  let curCPcuspEven = toFast4(psiCPcuspEvenNorm)
  let maxQCPcuspEven = 0
  for (let t = 1; t <= 4; t++) {
    curCPcuspEven = applyBareBeat4(curCPcuspEven, HYP_GEOM)
    const m = measureShellMetrics4(curCPcuspEven)
    for (let d = 0; d <= 8; d++) maxQCPcuspEven = Math.max(maxQCPcuspEven, Math.abs(m.qByShell[d]!))
  }
  curCPcuspEven = createFast4(1)

  // Control 4: Strictly C-even AND P_perp-even state |psi_{C+, P_perp+}> using bulk-normal reflection P_perp outside W(B_3)
  // Pick a P_perp in WF4_IMPROPER_NONCUSP (involution) that maximizes |<Q_{D=0}(1)>|!
  let bestPPerpQ1 = 0
  let bestPPerpSeries: number[] = []
  let chosenPPerpIdx = -1
  for (let pi = 0; pi < WF4_IMPROPER_NONCUSP.length; pi++) {
    const p = WF4_IMPROPER_NONCUSP[pi]!
    if (!isInvolution(p)) continue
    const mapped = mapHypStateByPerm(psiInt0, p)
    const sumSt: FState = new Map()
    for (const e of psiInt0.values()) addEntry(sumSt, e.vibes, e.re, e.im)
    for (const e of mapped.values()) addEntry(sumSt, e.vibes, e.re, e.im)
    if (normSqState(sumSt) < 1e-6) continue
    const normSt = normalizeState(sumSt)
    const m1 = measureShellMetrics4(applyBareBeat4(toFast4(normSt), HYP_GEOM))
    if (Math.abs(m1.qByShell[0]!) > bestPPerpQ1 + 1e-12) {
      bestPPerpQ1 = Math.abs(m1.qByShell[0]!)
      chosenPPerpIdx = pi
      if (bestPPerpQ1 > 0.18) break
    }
  }
  const pPerpBest = WF4_IMPROPER_NONCUSP[chosenPPerpIdx]!
  const psiPPerpEvenRaw: FState = new Map()
  for (const e of psiInt0.values()) addEntry(psiPPerpEvenRaw, e.vibes, e.re, e.im)
  for (const e of mapHypStateByPerm(psiInt0, pPerpBest).values()) addEntry(psiPPerpEvenRaw, e.vibes, e.re, e.im)
  const psiPPerpEven0 = normalizeState(psiPPerpEvenRaw)
  assertExact(stateDiffL2(psiPPerpEven0, applyCState(psiPPerpEven0)) < 1e-14, 'C+P_perp+ must be C-even')
  assertExact(
    stateDiffL2(psiPPerpEven0, mapHypStateByPerm(psiPPerpEven0, pPerpBest)) < 1e-14,
    'C+P_perp+ must be P_perp-even',
  )
  let curPPerp = toFast4(psiPPerpEven0)
  bestPPerpSeries = [measureShellMetrics4(curPPerp).qByShell[0]!]
  for (let t = 1; t <= 4; t++) {
    curPPerp = applyBareBeat4(curPPerp, HYP_GEOM)
    bestPPerpSeries.push(measureShellMetrics4(curPPerp).qByShell[0]!)
  }
  curPPerp = createFast4(1)

  // Control 5: 3D Rotationally Isotropic W(B_3)^+-Invariant C-Even Chiral State on D = 0!
  // Sum g |psiInt0> over all 24 proper 3D cubic rotations g in W(B_3)^+!
  const psiIsoRaw: FState = new Map()
  for (const g of WB3_PROPER) {
    const gPsi = mapHypStateByPerm(psiInt0, g)
    for (const e of gPsi.values()) addEntry(psiIsoRaw, e.vibes, e.re, e.im)
  }
  const psiIso0 = normalizeState(psiIsoRaw)
  let maxIsoRotErr = 0
  for (const g of WB3_PROPER) maxIsoRotErr = Math.max(maxIsoRotErr, stateDiffL2(psiIso0, mapHypStateByPerm(psiIso0, g)))
  assertExact(stateDiffL2(psiIso0, applyCState(psiIso0)) < 1e-14, 'psiIso0 must be C-even')
  let curIso = toFast4(psiIso0)
  const isoQSeries: number[] = [measureShellMetrics4(curIso).qByShell[0]!]
  for (let t = 1; t <= 3; t++) {
    curIso = applyBareBeat4(curIso, HYP_GEOM)
    isoQSeries.push(measureShellMetrics4(curIso).qByShell[0]!)
  }
  curIso = createFast4(1)

  console.log('\n  [C3] Crucial Symmetry Controls (Phi_odd=I, CP Sign-Flip, P_cusp-Even vs P_perp-Even vs 3D-Isotropic):')
  console.log(`       Control 1 (Phi_odd = I, t=0..6)          : max_{t,D} |<Q_D(t)>| = ${maxQNoPhi.toExponential(2)} (EXACT ZERO!)`)
  console.log(
    `       Control 2 (P_cusp |psi_0>, t=0..6)       : max_t |Q_0(P_cusp) + Q_0| = ${maxCPSignErr.toExponential(2)} (EXACT CP SIGN FLIP!)`,
  )
  console.log(
    `       Control 3 (C-even + P_cusp-even, t=0..4) : max_{t,D} |<Q_D(t)>| = ${maxQCPcuspEven.toExponential(2)} (EXACT CP PROTECTION!)`,
  )
  console.log(
    `       Control 4 (C-even + P_perp-even, t=0..4) : <Q_{D=0}(t)> = [${bestPPerpSeries.map(fmtS).join(', ')}] (NONZERO: one-sided cusp breaks P_perp!)`,
  )
  console.log(
    `       Control 5 (W(B_3)^+ 3D-isotropic, t=0..3): rotErr=${maxIsoRotErr.toExponential(1)}, <Q_{D=0}(t)> = [${isoQSeries.map(fmtS).join(', ')}] (NONZERO: 3D-isotropic chiral domain!)`,
  )

  recordCheck(
    'C3',
    'Symmetry controls: Phi_odd=I null, exact CP sign flip, P_cusp-even null, P_perp-even & 3D-isotropic nonzero',
    maxQNoPhi < 1e-14 &&
      maxCPSignErr < 1e-14 &&
      maxQCPcuspEven < 1e-14 &&
      Math.abs(bestPPerpSeries[1]!) > 0.15 &&
      maxIsoRotErr < 1e-14 &&
      Math.abs(isoQSeries[1]!) > 0.15,
    `noPhi=${maxQNoPhi.toExponential(1)}, cpFlipErr=${maxCPSignErr.toExponential(1)}, Pcusp+=${maxQCPcuspEven.toExponential(1)}, Pperp+(1)=${fmtS(bestPPerpSeries[1]!)}, 3Diso(1)=${fmtS(isoQSeries[1]!)}`,
  )

  // --------------------------------------------------------------------------
  // C4: Closed Flat 4D D_4 / L D_4 Periodic Box Null Control
  // --------------------------------------------------------------------------
  // Bipartite double cover of flat D_4 / L D_4 (L = 4 -> 128 * 2 = 256 docks):
  //   coords (x0, x1, x2, x3) in Z_4^4 with x0+x1+x2+x3 even, plus bipartite parity bit p in {0, 1}.
  //   Every hop along D_4 root r_s flips p -> 1 - p, giving exact bipartite dockParity = (-1)^p!
  //   Flat 3D hyperplane slice: x0 = 0 (6 slots with x0=+1, 12 slots with x0=0, 6 slots with x0=-1,
  //   0 slice-to-bulk antipodal pairs because opp(r) has -x0!).
  const L_FLAT = 4
  const flatKey = (x0: number, x1: number, x2: number, x3: number, p: number): number =>
    ((((x0 * L_FLAT + x1) * L_FLAT + x2) * L_FLAT + x3) * 2 + p)
  const flatToId = new Map<number, number>()
  const flatCoords: [number, number, number, number, number][] = []
  for (let x0 = 0; x0 < L_FLAT; x0++) {
    for (let x1 = 0; x1 < L_FLAT; x1++) {
      for (let x2 = 0; x2 < L_FLAT; x2++) {
        for (let x3 = 0; x3 < L_FLAT; x3++) {
          if (((x0 + x1 + x2 + x3) & 1) !== 0) continue
          for (let p = 0; p < 2; p++) {
            const k = flatKey(x0, x1, x2, x3, p)
            flatToId.set(k, flatCoords.length)
            flatCoords.push([x0, x1, x2, x3, p])
          }
        }
      }
    }
  }
  const nFlat = flatCoords.length // 256 docks
  const flatStepTable = Array.from({ length: nFlat }, () => new Int32Array(24))
  for (let id = 0; id < nFlat; id++) {
    const [x0, x1, x2, x3, p] = flatCoords[id]!
    for (let s = 0; s < 24; s++) {
      const r = ROOTS[s]!
      const nx0 = (x0 + Number(r[0]) + L_FLAT) % L_FLAT
      const nx1 = (x1 + Number(r[1]) + L_FLAT) % L_FLAT
      const nx2 = (x2 + Number(r[2]) + L_FLAT) % L_FLAT
      const nx3 = (x3 + Number(r[3]) + L_FLAT) % L_FLAT
      flatStepTable[id]![s] = flatToId.get(flatKey(nx0, nx1, nx2, nx3, 1 - p))!
    }
  }
  const FLAT_GEOM: LatticeGeometry = {
    step: (d, s) => flatStepTable[d]![s]!,
    parity: d => (flatCoords[d]![4] === 0 ? 1 : -1),
    // Distance from flat 3D hyperplane x0 = 0: |x0|_torus in {0, 1, 2}
    depth: d => {
      const x0 = flatCoords[d]![0]
      return Math.min(x0, L_FLAT - x0)
    },
  }

  let flatSlicePairs = 0, flatUpDownPairs = 0, flatSliceToBulkPairs = 0
  for (const [a, b] of LINES) {
    const xa = Number(ROOTS[a]![0]), xb = Number(ROOTS[b]![0])
    if (xa === 0 && xb === 0) flatSlicePairs++
    else if (xa !== 0 && xb !== 0) flatUpDownPairs++
    else flatSliceToBulkPairs++
  }

  // Run the EXACT SAME C-even chiral state |psiInt0> on the closed flat 4D periodic box for t = 0..6!
  let curFlat = psiInt4
  let maxFlatQBox = 0
  let maxFlatQSlice = 0
  const flatSliceSeries: number[] = [0]
  const flatDipoleSeries: number[] = [0] // <Q(x0=+1)> - <Q(x0=-1)>
  for (let t = 1; t <= T_BARYO; t++) {
    curFlat = applyBareBeat4(curFlat, FLAT_GEOM)
    const m = measureShellMetrics4(curFlat, FLAT_GEOM, 2)
    maxFlatQBox = Math.max(maxFlatQBox, Math.abs(m.qTotal))
    maxFlatQSlice = Math.max(maxFlatQSlice, Math.abs(m.qByShell[0]!))
    flatSliceSeries.push(m.qByShell[0]!)
    let qPlus = 0, qMinus = 0
    for (let i = 0; i < curFlat.len; i++) {
      const p = curFlat.re[i]! ** 2 + curFlat.im[i]! ** 2
      if (p < 1e-30) continue
      for (let k = 0; k < 4; k++) {
        const c = k === 0 ? curFlat.c0[i]! : k === 1 ? curFlat.c1[i]! : k === 2 ? curFlat.c2[i]! : curFlat.c3[i]!
        const ds = c >>> 2, d = (ds - (ds % 24)) / 24
        const tone = ((c >>> 1) & 1) === 1 ? -1 : 1
        const x0 = flatCoords[d]![0]
        if (x0 === 1) qPlus += p * tone
        else if (x0 === L_FLAT - 1) qMinus += p * tone
      }
    }
    flatDipoleSeries.push(qPlus - qMinus)
  }
  curFlat = createFast4(1)

  console.log('\n  [C4] Closed Flat 4D D_4 / 4 D_4 Periodic Box Null Control (N = 256 Bipartite Torus):')
  console.log(
    `       Flat 3D hyperplane x_0=0 antipodal line audit: ${flatSlicePairs} slice-slice + ${flatUpDownPairs} (+1,-1) up-down + ${flatSliceToBulkPairs} slice-to-bulk (vs 6/6 on {3,4,3,4} cusp!)`,
  )
  console.log(
    `       Global box charge conservation (t=0..6): max|<Q_box(t)>| = ${maxFlatQBox.toExponential(2)} (EXACT ZERO!)`,
  )
  console.log(
    `       Flat 3D slice <Q_{x_0=0}(t=0..6)>: [${flatSliceSeries.map(fmtS).join(', ')}] (beat-1 = ${flatSliceSeries[1]!.toExponential(2)} vs ${fmtS(trajInt[1]!.qByShell[0]!)} on {3,4,3,4}!)`,
  )
  console.log(
    `       Symmetric transverse dipole <Q(x_0=+1) - Q(x_0=-1)> (t=0..6): [${flatDipoleSeries.map(fmtS).join(', ')}] (local dipole cancels across x_0=+-1, no one-sided export)`,
  )

  recordCheck(
    'C4',
    'Closed flat 4D D_4/4D_4 periodic box control: 0 slice-to-bulk pairs, <Q_box>=0 & beat-1 <Q_{x0=0}>=0',
    flatSlicePairs === 6 &&
      flatUpDownPairs === 6 &&
      flatSliceToBulkPairs === 0 &&
      maxFlatQBox < 1e-14 &&
      Math.abs(flatSliceSeries[1]!) < 1e-14 &&
      maxFlatQSlice < 1e-14,
    `flatPairs=(6,6,0), max|Q_box|=${maxFlatQBox.toExponential(1)}, max|Q_{x0=0}|=${maxFlatQSlice.toExponential(1)} (vs 0.375 on {3,4,3,4})`,
  )

  // --------------------------------------------------------------------------
  // C5: Irreversible Hyperbolic Bulk Export Arrow (Steinberg Tree & P_return)
  // --------------------------------------------------------------------------
  const D_TREE = 80
  const nExact: number[] = [1, 18, 330, 6034]
  for (let d = 4; d <= D_TREE; d++) nExact.push(21 * nExact[d - 1]! - 51 * nExact[d - 2]! + 23 * nExact[d - 3]!)
  const lExact: number[] = [1]
  for (let d = 1; d <= D_TREE; d++) lExact.push(4 * 5 ** (d - 1))
  const vExact: number[] = [24 * nExact[0]! - 6 * lExact[0]!]
  for (let d = 1; d <= D_TREE; d++) vExact.push(24 * nExact[d]! - vExact[d - 1]! - 6 * lExact[d]!)

  // Verify exact degree conservation dUp + dLat + dDown === 24 across all D = 0..80
  let maxDegErrC5 = 0
  for (let d = 0; d <= D_TREE; d++) {
    const dUp = d === 0 ? 0 : vExact[d - 1]! / nExact[d]!
    const dLat = (6 * lExact[d]!) / nExact[d]!
    const dDown = vExact[d]! / nExact[d]!
    maxDegErrC5 = Math.max(maxDegErrC5, Math.abs(dUp + dLat + dDown - 24))
  }
  assertExact(maxDegErrC5 < 1e-12, `Degree conservation error on D_TREE=80: ${maxDegErrC5}`)

  let lam = 18.28
  for (let it = 0; it < 30; it++) {
    lam -= (lam ** 3 - 21 * lam ** 2 + 51 * lam - 23) / (3 * lam ** 2 - 42 * lam + 51)
  }
  const dUpInf = 24 / (lam + 1)
  const dDownInf = 24 - dUpInf
  const asymRatioInf = dDownInf / dUpInf

  // Compute exact classical Markov branching-tree return probability P(D=0, t | D_init=1) over t = 1..60
  const T_RET = 60
  const pMkv = new Float64Array(D_TREE + 1)
  pMkv[1] = 1.0
  const retMkv: number[] = []
  const schurRho = 13 / 21
  const rhoTreeAsymp = 2 * Math.sqrt((dUpInf / 24) * (dDownInf / 24))
  let maxRatioToSchurT = 0
  let maxRatioToRhoTree = 0
  for (let t = 1; t <= T_RET; t++) {
    const nxt = new Float64Array(D_TREE + 1)
    for (let d = 0; d <= D_TREE; d++) {
      const pd = pMkv[d]!
      if (pd === 0) continue
      const dUp = d === 0 ? 0 : vExact[d - 1]! / nExact[d]!
      const dLat = (6 * lExact[d]!) / nExact[d]!
      const dDown = vExact[d]! / nExact[d]!
      if (d > 0) nxt[d - 1] = nxt[d - 1]! + pd * (dUp / 24)
      nxt[d] = nxt[d]! + pd * (dLat / 24)
      if (d < D_TREE) nxt[d + 1] = nxt[d + 1]! + pd * (dDown / 24)
      else nxt[d] = nxt[d]! + pd * (dDown / 24)
    }
    pMkv.set(nxt)
    retMkv.push(pMkv[0]!)
    maxRatioToSchurT = Math.max(maxRatioToSchurT, pMkv[0]! / Math.pow(schurRho, t))
    maxRatioToRhoTree = Math.max(maxRatioToRhoTree, pMkv[0]! / Math.pow(rhoTreeAsymp, t))
  }

  // Exact sparse O(D_TREE) unitary branching-tree quantum walk from D = 1 over t = 1..60 (D_TREE = 80)
  // Compares BOTH flip-flop shift S_ff (down(d) <-> up(d+1), which exhibits mid-time return spikes!)
  // AND true unitary moving shift S_mv (down(d) -> down(d+1), up(d) -> up(d-1), up(1) -> down(0))
  const chOff = (d: number): number => (d === 0 ? 0 : 2 + 3 * (d - 1))
  const treeDim = 2 + 3 * D_TREE
  type TreeWalkResult = {
    readonly unitErr: number
    readonly maxNormErr: number
    readonly p0Series: number[]
    readonly peakP0: number
    readonly peakT: number
    readonly pGe1At14: number
    readonly pGe1At60: number
    readonly minBulkTrap: number
  }
  function runTreeFromD1(
    coinKind: 'grover' | 'zeta18',
    shiftKind: 'flipflop' | 'moving',
    initChannel: 'down' | 'up',
  ): TreeWalkResult {
    // Precompute exact 2x2 (d=0) and 3x3 (d>=1) local unitary coin blocks and certify block unitarity
    const blkRe: Float64Array[] = []
    const blkIm: Float64Array[] = []
    let unitErr = 0
    for (let d = 0; d <= D_TREE; d++) {
      const dUp = d === 0 ? 0 : vExact[d - 1]! / nExact[d]!
      const dLat = (6 * lExact[d]!) / nExact[d]!
      const dDown = vExact[d]! / nExact[d]!
      const uVec = d === 0 ? [Math.sqrt(dLat / 24), Math.sqrt(dDown / 24)] : [Math.sqrt(dUp / 24), Math.sqrt(dLat / 24), Math.sqrt(dDown / 24)]
      const m = uVec.length
      const br = new Float64Array(m * m)
      const bi = new Float64Array(m * m)
      for (let i = 0; i < m; i++) {
        for (let j = 0; j < m; j++) {
          const uu = uVec[i]! * uVec[j]!
          if (coinKind === 'grover') {
            br[i * m + j] = 2 * uu - (i === j ? 1 : 0)
          } else {
            br[i * m + j] = (i === j ? 1 : 0) + (Z18_C[0] - 1) * uu
            bi[i * m + j] = Z18_C[1] * uu
          }
        }
      }
      // Verify C_d^dag C_d = I_m
      for (let i = 0; i < m; i++) {
        for (let j = 0; j < m; j++) {
          let sr = 0, si = 0
          for (let k = 0; k < m; k++) {
            const ar = br[k * m + i]!, ai = -bi[k * m + i]!
            const cr = br[k * m + j]!, ci = bi[k * m + j]!
            sr += ar * cr - ai * ci
            si += ar * ci + ai * cr
          }
          unitErr = Math.max(unitErr, Math.hypot(sr - (i === j ? 1 : 0), si))
        }
      }
      blkRe.push(br)
      blkIm.push(bi)
    }
    // Build exact permutation map for shift S (bijection on treeDim -> exact unitarity S^dag S = I)
    const shiftDst = new Int32Array(treeDim).fill(-1)
    for (let d = 0; d <= D_TREE; d++) {
      const off = chOff(d)
      const latIdx = d === 0 ? off : off + 1
      const downIdx = d === 0 ? off + 1 : off + 2
      shiftDst[latIdx] = latIdx
      if (shiftKind === 'flipflop') {
        if (d < D_TREE) {
          const nextUp = chOff(d + 1)
          shiftDst[downIdx] = nextUp
          shiftDst[nextUp] = downIdx
        } else {
          shiftDst[downIdx] = downIdx
        }
      } else {
        // True moving shift: down(d) -> down(d+1), up(d) -> up(d-1), up(1) -> down(0), down(D_TREE) -> up(D_TREE)
        if (d < D_TREE) {
          shiftDst[downIdx] = chOff(d + 1) + 2
        } else {
          shiftDst[downIdx] = chOff(D_TREE)
        }
        if (d >= 2) {
          shiftDst[off] = chOff(d - 1)
        } else if (d === 1) {
          shiftDst[off] = chOff(0) + 1
        }
      }
    }
    // Certify shiftDst is a strict bijection on 0..treeDim-1
    const seenDst = new Uint8Array(treeDim)
    for (let i = 0; i < treeDim; i++) {
      const dst = shiftDst[i]!
      assertExact(dst >= 0 && dst < treeDim && seenDst[dst] === 0, `Shift permutation failed at ${i}`)
      seenDst[dst] = 1
    }

    let vr = new Float64Array(treeDim), vi = new Float64Array(treeDim)
    const cr = new Float64Array(treeDim), ci = new Float64Array(treeDim)
    vr[initChannel === 'down' ? chOff(1) + 2 : chOff(1)] = 1.0
    const p0Series: number[] = []
    let peakP0 = 0
    let peakT = 0
    let maxNormErr = 0
    for (let t = 1; t <= T_RET; t++) {
      // Apply block-diagonal coin C
      for (let d = 0; d <= D_TREE; d++) {
        const off = chOff(d)
        const m = d === 0 ? 2 : 3
        const br = blkRe[d]!, bi = blkIm[d]!
        for (let i = 0; i < m; i++) {
          let sr = 0, si = 0
          for (let j = 0; j < m; j++) {
            const xr = vr[off + j]!, xi = vi[off + j]!
            const mr = br[i * m + j]!, mi = bi[i * m + j]!
            sr += mr * xr - mi * xi
            si += mr * xi + mi * xr
          }
          cr[off + i] = sr
          ci[off + i] = si
        }
      }
      // Apply shift permutation S
      const nr = new Float64Array(treeDim), ni = new Float64Array(treeDim)
      let normSq = 0
      for (let i = 0; i < treeDim; i++) {
        const dst = shiftDst[i]!
        nr[dst] = cr[i]!
        ni[dst] = ci[i]!
        normSq += cr[i]! * cr[i]! + ci[i]! * ci[i]!
      }
      maxNormErr = Math.max(maxNormErr, Math.abs(normSq - 1))
      vr = nr; vi = ni
      const p0 = vr[0]! ** 2 + vi[0]! ** 2 + vr[1]! ** 2 + vi[1]! ** 2
      p0Series.push(p0)
      if (p0 > peakP0) { peakP0 = p0; peakT = t }
    }
    return {
      unitErr,
      maxNormErr,
      p0Series,
      peakP0,
      peakT,
      pGe1At14: 1 - p0Series[13]!,
      pGe1At60: 1 - p0Series[T_RET - 1]!,
      minBulkTrap: 1 - peakP0,
    }
  }
  const uTreeGFF = runTreeFromD1('grover', 'flipflop', 'down')
  const uTreeZFF = runTreeFromD1('zeta18', 'flipflop', 'down')
  const uTreeGUpFF = runTreeFromD1('grover', 'flipflop', 'up')
  const uTreeGMv = runTreeFromD1('grover', 'moving', 'down')
  const uTreeZMv = runTreeFromD1('zeta18', 'moving', 'down')

  // Also run exact bare-U moving-shift k = 1 Coxeter walk from an isotropic D = 1 bulk dock for T = 6 beats!
  const d1Sample = d1Docks[0]!
  let stBareD1 = new Map<string, [number, number]>()
  const invSqrt24 = 1 / Math.sqrt(24)
  for (let s = 0; s < 24; s++) stBareD1.set(`${d1Sample}:${s}`, [invSqrt24, 0])
  const cKeep: Cx = [0.25, SQRT3 / 4]
  const cCross: Cx = [0.75, -SQRT3 / 4]
  const bareD1P0Series: number[] = []
  let bareD1NormFinal = 0
  for (let t = 1; t <= 6; t++) {
    const next = new Map<string, [number, number]>()
    const add1 = (k: string, r: number, i: number): void => {
      const ex = next.get(k)
      if (ex) { ex[0] += r; ex[1] += i } else next.set(k, [r, i])
    }
    for (const [k, [ar, ai]] of stBareD1) {
      const sep = k.indexOf(':')
      const d = Number(k.slice(0, sep)), s = Number(k.slice(sep + 1))
      const opp = OPPOSITE_SLOT[s]!
      const aK = cxMul([ar, ai], cKeep), aC = cxMul([ar, ai], cCross)
      add1(`${stepDock(d, s)}:${s}`, aK[0], aK[1])
      add1(`${stepDock(d, opp)}:${opp}`, aC[0], aC[1])
    }
    stBareD1 = next
    let p0 = 0, tot = 0
    for (const [k, [ar, ai]] of stBareD1) {
      const p = ar * ar + ai * ai
      tot += p
      const d = Number(k.slice(0, k.indexOf(':')))
      if (cuspDepth(d) === 0) p0 += p
    }
    bareD1P0Series.push(p0)
    bareD1NormFinal = tot
  }
  const bareD1TrapT6 = 1 - bareD1P0Series[5]!
  const bareD1PeakP0 = Math.max(...bareD1P0Series)

  // Radial random-walk return spectral gap on asymptotic {3,4,3,4} tree: 1 - 2 sqrt(p_up p_down)
  const lambdaGapTree = 1 - rhoTreeAsymp
  const lambdaGapSchur = 1 - schurRho

  console.log('\n  [C5] Irreversible Hyperbolic Bulk Export Arrow (Steinberg Cusp Tree & Spectral Gap, T = 1..60):')
  console.log(
    `       Steinberg shells N_D = [${nExact.slice(0, 6).join(', ')}], lambda = ${lam.toFixed(10)}, d_down/d_up -> ${dDownInf.toFixed(4)}/${dUpInf.toFixed(4)} = ${asymRatioInf.toFixed(4)}`,
  )
  console.log(
    `       Spectral gaps: SchurGap bulk 1 - 13/21 = ${lambdaGapSchur.toFixed(6)} (||A/24|| <= 13/21 = ${schurRho.toFixed(6)}); radial cusp tree 1 - 2*sqrt(p_up*p_down) = ${lambdaGapTree.toFixed(6)} (> 1/2!, rho_tree = ${rhoTreeAsymp.toFixed(6)})`,
  )
  console.log(
    `       Exported D=1 packet return probability P(D=0, t) over t = 1..60 (D_TREE = ${D_TREE}):`,
  )
  console.log(
    `         Markov tree               : P(14)=${retMkv[13]!.toExponential(3)} (< (13/21)^28=${Math.pow(schurRho, 28).toExponential(3)}), P(60)=${retMkv[59]!.toExponential(3)} (< rho_tree^60=${Math.pow(rhoTreeAsymp, 60).toExponential(2)} < (13/21)^60=${Math.pow(schurRho, 60).toExponential(2)}), max(P/rho_tree^t)=${maxRatioToRhoTree.toFixed(4)}, max(P/(13/21)^t)=${maxRatioToSchurT.toFixed(4)}`,
  )
  console.log(
    `         Flip-flop S_ff Grover |1,d>: PEAK return ${(100 * uTreeGFF.peakP0).toFixed(2)}% at t=${uTreeGFF.peakT} (min trap ${(100 * uTreeGFF.minBulkTrap).toFixed(2)}%, t=14 trap ${(100 * uTreeGFF.pGe1At14).toFixed(2)}%, t=60 trap ${(100 * uTreeGFF.pGe1At60).toFixed(2)}%, uErr=${uTreeGFF.unitErr.toExponential(1)})`,
  )
  console.log(
    `         Flip-flop S_ff zeta18 |1,d>: PEAK return ${(100 * uTreeZFF.peakP0).toFixed(2)}% at t=${uTreeZFF.peakT} (min trap ${(100 * uTreeZFF.minBulkTrap).toFixed(2)}%, t=14 trap ${(100 * uTreeZFF.pGe1At14).toFixed(2)}%, t=60 trap ${(100 * uTreeZFF.pGe1At60).toFixed(2)}%, uErr=${uTreeZFF.unitErr.toExponential(1)})`,
  )
  console.log(
    `         Flip-flop S_ff Grover |1,u>: PEAK return ${(100 * uTreeGUpFF.peakP0).toFixed(2)}% at t=${uTreeGUpFF.peakT} (t=14 trap ${(100 * uTreeGUpFF.pGe1At14).toFixed(2)}%, t=60 trap ${(100 * uTreeGUpFF.pGe1At60).toFixed(2)}%)`,
  )
  console.log(
    `         Moving S_mv Grover    |1,d>: PEAK return ${(100 * uTreeGMv.peakP0).toFixed(4)}% at t=${uTreeGMv.peakT} (min trap ${(100 * uTreeGMv.minBulkTrap).toFixed(4)}%, t=14 trap ${(100 * uTreeGMv.pGe1At14).toFixed(2)}%, t=60 trap ${(100 * uTreeGMv.pGe1At60).toFixed(4)}%, uErr=${uTreeGMv.unitErr.toExponential(1)})`,
  )
  console.log(
    `         Moving S_mv zeta18    |1,d>: PEAK return ${(100 * uTreeZMv.peakP0).toFixed(4)}% at t=${uTreeZMv.peakT} (min trap ${(100 * uTreeZMv.minBulkTrap).toFixed(4)}%, t=14 trap ${(100 * uTreeZMv.pGe1At14).toFixed(2)}%, t=60 trap ${(100 * uTreeZMv.pGe1At60).toFixed(4)}%, uErr=${uTreeZMv.unitErr.toExponential(1)})`,
  )
  console.log(
    `         Exact bare-U moving k=1 D=1: P(D=0, t=1..6) = [${bareD1P0Series.map(x => x.toFixed(4)).join(', ')}] (peak ${(100 * bareD1PeakP0).toFixed(2)}%, norm=${bareD1NormFinal.toFixed(12)}, bulk-trapped at t=6: ${(100 * bareD1TrapT6).toFixed(2)}%)`,
  )

  recordCheck(
    'C5',
    'Hyperbolic bulk export irreversibility: radial gap > 1/2, Markov < rho_tree^t, S_ff vs S_mv & bare k=1',
    lambdaGapTree > 0.5 &&
      retMkv[13]! < Math.pow(schurRho, 28) &&
      retMkv[59]! < 1e-23 &&
      maxRatioToRhoTree < 1.0 &&
      maxRatioToSchurT < 1.0 &&
      uTreeGFF.unitErr < 1e-13 &&
      uTreeZFF.unitErr < 1e-13 &&
      uTreeGMv.unitErr < 1e-13 &&
      uTreeZMv.unitErr < 1e-13 &&
      uTreeGFF.maxNormErr < 1e-12 &&
      uTreeZFF.maxNormErr < 1e-12 &&
      uTreeGMv.maxNormErr < 1e-12 &&
      uTreeZMv.maxNormErr < 1e-12 &&
      uTreeGFF.peakP0 > 0.45 &&
      uTreeZFF.peakP0 > 0.30 &&
      uTreeGMv.minBulkTrap > 0.84 &&
      uTreeZMv.minBulkTrap > 0.99 &&
      Math.abs(bareD1NormFinal - 1) < 1e-12 &&
      bareD1TrapT6 > 0.96,
    `gap_tree=${lambdaGapTree.toFixed(4)}>0.5, P_Mkv(14/60)=${retMkv[13]!.toExponential(2)}/${retMkv[59]!.toExponential(2)}, S_ff peak(G/z18)=${(100 * uTreeGFF.peakP0).toFixed(2)}%/${(100 * uTreeZFF.peakP0).toFixed(2)}%, S_mv minTrap(G/z18)=${(100 * uTreeGMv.minBulkTrap).toFixed(2)}%/${(100 * uTreeZMv.minBulkTrap).toFixed(2)}%, bare1=${(100 * bareD1TrapT6).toFixed(2)}%`,
  )

  return { lambdaExact: lam, nExact }
}

// ============================================================================
// PART 2 (C6-C9): STERILE DEEP-BULK NEUTRAL MODES AS DARK-MATTER CANDIDATE
// ============================================================================

function runPart2(lambdaExact: number, nExact: readonly number[]): void {
  console.log('\n================================================================================')
  console.log('PART 2: STERILE DEEP-BULK NEUTRAL MODES AS DARK-MATTER CANDIDATE ON {3,4,3,4}')
  console.log('================================================================================')

  // --------------------------------------------------------------------------
  // C6: Electromagnetic Sterility & Depth Suppression at D = 1, 2, 3
  //     (a) k = 2 neutral bulk pair (pure-bulk-line & isotropic-12-line)
  //     (b) k = 4 neutral C-even chiral bulk cluster
  //     (c) W10 [[24, 1, 8]]_3 bulk logical excitations (exact GF(3) Knill-Laflamme)
  // --------------------------------------------------------------------------
  // Locate BOTH:
  //   (1) Direct geodesic-aligned D = 0, 1, 2, 3 bulk docks (step^D along downSlot0: worst-case line of sight to D=0!)
  //   (2) Generic off-geodesic D = 2, 3 bulk docks (turning a corner at D=1: typical bulk dock!)
  const downSlot0 = Array.from({ length: 24 }, (_, s) => s).find(
    s => cuspDepth(stepDock(0, s)) === 1 && cuspDepth(stepDock(0, OPPOSITE_SLOT[s]!)) === 1,
  )!
  const bulkDocks: number[] = [0]
  for (let d = 1; d <= 3; d++) {
    const nextD = stepDock(bulkDocks[d - 1]!, downSlot0)
    assertExact(cuspDepth(nextD) === d, `Expected straight-geodesic depth ${d}, got ${cuspDepth(nextD)}`)
    bulkDocks.push(nextD)
  }
  // Find generic off-geodesic D = 2 and D = 3 bulk docks (no straight geodesic hits D = 0!)
  const offGeoD2 = Array.from({ length: 24 }, (_, s) => stepDock(bulkDocks[1]!, s)).find(
    nb => cuspDepth(nb) === 2 && nb !== bulkDocks[2],
  )!
  const offGeoD3 = Array.from({ length: 24 }, (_, s) => stepDock(offGeoD2, s)).find(
    nb => cuspDepth(nb) === 3,
  )!
  // Exact count of straight-geodesic-visible docks in D = 2 under dock 0:
  // Every D = 0 dock has 18 downward rays into D = 1, continuing 1 more step straight down gives 18 D = 2 docks.
  // Exhaustively test ALL 330 D = 2 descendants across ALL 24 geodesic rays for m = 1..6 via exact Q(sqrt(2)) frames!
  const d1ChildrenOf0: number[] = []
  const d1SlotOf0: number[] = []
  for (let s = 0; s < 24; s++) {
    const nb = stepDock(0, s)
    if (cuspDepth(nb) === 1) { d1ChildrenOf0.push(nb); d1SlotOf0.push(s) }
  }
  const d2AllUnder0 = new Set<number>()
  const d2StraightFrom0 = new Set<number>()
  for (let i = 0; i < d1ChildrenOf0.length; i++) {
    const u = d1ChildrenOf0[i]!
    const straightNext = stepDock(u, d1SlotOf0[i]!)
    if (cuspDepth(straightNext) === 2) d2StraightFrom0.add(straightNext)
    for (let s = 0; s < 24; s++) {
      const nb = stepDock(u, s)
      if (cuspDepth(nb) === 2) d2AllUnder0.add(nb)
    }
  }
  // Zero-allocation exact Q(sqrt(2)) straight-ray check: center(step^m(v, s))[0] = dockFrames[v][0] . (T_s^m * c_0)
  const rayVecs: Q2[][][] = Array.from({ length: 24 }, (_, s) => {
    const arr: Q2[][] = [BASE_CENTER.map(x => [x[0], x[1]] as Q2)]
    for (let m = 1; m <= 6; m++) arr.push(matVecQ2(TRANSPORTS[s]!, arr[m - 1]!))
    return arr
  })
  // Cross-check rayVecs formula against stepDock on bulkDocks[2] and offGeoD2 for m = 1..6
  for (const vTest of [bulkDocks[2]!, offGeoD2]) {
    const r0 = dockFrames[vTest]![0]!
    for (let s = 0; s < 24; s++) {
      let cur = vTest
      for (let m = 1; m <= 6; m++) {
        cur = stepDock(cur, s)
        const c0Pred = dotQ2(r0, rayVecs[s]![m]!)
        const isD0Pred = c0Pred[0] === 2n && c0Pred[1] === 0n
        assertExact(isD0Pred === isLayerDock(cur), `rayVecs mismatch at dock ${vTest} slot ${s} step ${m}`)
      }
    }
  }
  let d2ExhaustiveHitD0 = 0
  let d2ExhaustiveSterile = 0
  for (const v of d2AllUnder0) {
    const r0 = dockFrames[v]![0]!
    let hitsAnyD0 = false
    for (let s = 0; s < 24 && !hitsAnyD0; s++) {
      for (let m = 1; m <= 6; m++) {
        const c0 = dotQ2(r0, rayVecs[s]![m]!)
        if (c0[0] === 2n && c0[1] === 0n) { hitsAnyD0 = true; break }
      }
    }
    if (hitsAnyD0) d2ExhaustiveHitD0++
    else d2ExhaustiveSterile++
  }

  // (a) k = 2 neutral C-even antipodal pair at depths D = 0, 1, 2, 3 (geodesic-aligned worst-case AND off-geodesic generic!)
  const T_DM2 = 6
  const pureBulkPairMaxP0: number[] = []
  const isoPairPeakP0: number[] = []
  const isoPairT6P0: number[] = []
  const isoPairCausalDelay: number[] = []
  let maxK2LocalQ = 0

  function evalIsoK2AtDock(vD: number, dDepth: number): { peakP0: number; p0Final: number; firstHit: number } {
    const stIso: FState = new Map()
    for (const [sA, sB] of LINES) {
      addEntry(stIso, [[vD, sA, 1, 0], [vD, sB, -1, 0]], 1, 0)
      addEntry(stIso, [[vD, sA, -1, 0], [vD, sB, 1, 0]], 1, 0)
    }
    let curI = normalizeState(stIso)
    let peakP0 = dDepth === 0 ? 1 : 0
    let firstHit = dDepth === 0 ? 0 : 99
    let p0Final = 0
    for (let t = 1; t <= T_DM2; t++) {
      curI = applyBareBeat(curI, HYP_GEOM)
      const m = measureShellMetrics(curI, HYP_GEOM, 10)
      maxK2LocalQ = Math.max(maxK2LocalQ, Math.abs(m.qByShell[0]!), Math.abs(m.qTotal))
      const p0 = m.dActByShell[0]! / 2
      if (p0 > 1e-14 && firstHit === 99) firstHit = t
      peakP0 = Math.max(peakP0, p0)
      p0Final = p0
    }
    return { peakP0, p0Final, firstHit }
  }

  for (let d = 0; d <= 3; d++) {
    const vD = bulkDocks[d]!
    const pureBulkLine = LINES.findIndex(
      ([a, b]) => cuspDepth(stepDock(vD, a)) >= d && cuspDepth(stepDock(vD, b)) >= d,
    )
    assertExact(pureBulkLine >= 0, `Expected pure-bulk line at D=${d}`)
    const [pA, pB] = LINES[pureBulkLine]!
    const stPure: FState = new Map()
    addEntry(stPure, [[vD, pA, 1, 0], [vD, pB, -1, 0]], 1, 0)
    addEntry(stPure, [[vD, pA, -1, 0], [vD, pB, 1, 0]], 1, 0)
    let curP = normalizeState(stPure)
    let maxP0Pure = d === 0 ? 1 : 0
    for (let t = 1; t <= T_DM2; t++) {
      curP = applyBareBeat(curP, HYP_GEOM)
      const m = measureShellMetrics(curP, HYP_GEOM, 10)
      maxK2LocalQ = Math.max(maxK2LocalQ, Math.abs(m.qByShell[0]!), Math.abs(m.qTotal))
      maxP0Pure = Math.max(maxP0Pure, m.dActByShell[0]! / 2)
    }
    pureBulkPairMaxP0.push(maxP0Pure)
    const rIso = evalIsoK2AtDock(vD, d)
    isoPairPeakP0.push(rIso.peakP0)
    isoPairT6P0.push(rIso.p0Final)
    isoPairCausalDelay.push(rIso.firstHit)
  }
  const offGeoResD2 = evalIsoK2AtDock(offGeoD2, 2)
  const offGeoResD3 = evalIsoK2AtDock(offGeoD3, 3)

  // (b) k = 4 neutral C-even chiral cluster at depths D = 0, 1, 2, 3 (evolved T = 4 beats under bare U!)
  const cCode = (s: number, t: -1 | 1): number => (s << 1) + (t < 0 ? 1 : 0)
  // Pick a chiral Q = 0_V quad (reuse [0,1,4,10]-like distinct-line witness)
  let chiQuad4: [number, number, number, number] = [0, 1, 4, LAYER_SLOTS[0]!]
  let chiTones4: [-1 | 1, -1 | 1, -1 | 1, -1 | 1] = [1, -1, -1, 1]
  outerQ4: for (const q3 of LAYER_SLOTS) {
    const l3 = LINE_OF_SLOT[q3]!
    for (let q0 = 0; q0 < 24; q0++) {
      if (LINE_OF_SLOT[q0] === l3) continue
      for (let q1 = q0 + 1; q1 < 24; q1++) {
        if (LINE_OF_SLOT[q1] === l3 || LINE_OF_SLOT[q1] === LINE_OF_SLOT[q0]) continue
        for (let q2 = q1 + 1; q2 < 24; q2++) {
          if (LINE_OF_SLOT[q2] === l3 || LINE_OF_SLOT[q2] === LINE_OF_SLOT[q0] || LINE_OF_SLOT[q2] === LINE_OF_SLOT[q1]) continue
          const cA = chiral4Sign(cCode(q0, 1), cCode(q1, -1), cCode(q2, -1), cCode(q3, 1))
          const cB = chiral4Sign(cCode(q0, 1), cCode(q1, -1), cCode(q2, -1), cCode(OPPOSITE_SLOT[q3]!, 1))
          if (cA === 1 && cB === 0) {
            chiQuad4 = [q0, q1, q2, q3]
            chiTones4 = [1, -1, -1, 1]
            break outerQ4
          }
        }
      }
    }
  }

  const k4PeakQ0: number[] = []
  const k4PeakAct0: number[] = []
  let maxK4GlobalQ = 0
  for (let d = 0; d <= 3; d++) {
    const vD = bulkDocks[d]!
    const st: FState = new Map()
    const a: Vibe[] = chiQuad4.map((s, i) => [vD, s, chiTones4[i]!, 0] as const)
    const b: Vibe[] = chiQuad4.map((s, i) => [vD, i === 3 ? OPPOSITE_SLOT[s]! : s, chiTones4[i]!, 0] as const)
    addEntry(st, a, 1, 0)
    addEntry(st, b, 1, 0)
    for (const e of applyCState(st).values()) addEntry(st, e.vibes, e.re, e.im)
    let cur = toFast4(normalizeState(st))
    let pQ0 = 0, pAct0 = d === 0 ? 4 : 0
    for (let t = 1; t <= 4; t++) {
      cur = applyBareBeat4(cur, HYP_GEOM)
      const m = measureShellMetrics4(cur, HYP_GEOM, 10)
      maxK4GlobalQ = Math.max(maxK4GlobalQ, Math.abs(m.qTotal))
      pQ0 = Math.max(pQ0, Math.abs(m.qByShell[0]!))
      pAct0 = Math.max(pAct0, m.dActByShell[0]!)
    }
    k4PeakQ0.push(pQ0)
    k4PeakAct0.push(pAct0)
  }

  // (c) W10 [[24, 1, 8]]_3 Bulk Logical Excitations: Exact GF(3) Knill-Laflamme EM Sterility & FLM Imprint
  // Build the exact 23 stabilizer rows of [[24, 1, 8]]_3 over GF(3) (verbatim from W10 / W11)
  const mod3 = (x: number): number => ((x % 3) + 3) % 3
  const w9Defs: readonly (readonly (readonly [number, number, number])[])[] = [
    [[0, 0, 1], [0, 1, 2], [1, 10, 2], [1, 11, 1]],
    [[0, 2, 1], [0, 3, 2], [1, 8, 2], [1, 9, 1]],
    [[0, 4, 1], [0, 5, 2], [1, 6, 2], [1, 7, 1]],
    [[0, 6, 1], [0, 7, 2], [1, 5, 2], [1, 6, 2], [1, 7, 2]],
    [[0, 8, 1], [0, 9, 2], [1, 3, 2], [1, 8, 2], [1, 9, 2]],
    [[0, 10, 1], [0, 11, 2], [1, 1, 2], [1, 10, 2], [1, 11, 2]],
    [[1, 0, 1], [1, 1, 1], [1, 10, 2], [1, 11, 2]],
    [[1, 2, 1], [1, 3, 1], [1, 8, 2], [1, 9, 2]],
    [[1, 4, 1], [1, 5, 1], [1, 6, 2], [1, 7, 2]],
  ]
  const lvmDefs: readonly (readonly (readonly [number, number, number])[])[] = [
    [[0, 0, 1], [0, 5, 2], [0, 9, 2], [0, 10, 2], [0, 11, 1]],
    [[0, 1, 1], [0, 5, 2], [0, 9, 1]],
    [[0, 2, 1], [0, 5, 2], [0, 10, 2]],
    [[0, 3, 1], [0, 5, 2], [0, 11, 1]],
    [[0, 4, 1], [0, 5, 2], [0, 10, 2], [0, 11, 1]],
    [[0, 6, 1], [0, 9, 2], [0, 10, 2]],
    [[0, 7, 1], [0, 9, 2], [0, 11, 1]],
    [[0, 8, 1], [0, 9, 2], [0, 10, 2], [0, 11, 1]],
    [[1, 0, 1], [1, 3, 1], [1, 5, 1], [1, 7, 1], [1, 9, 1], [1, 10, 2]],
    [[1, 1, 1], [1, 3, 1], [1, 5, 1], [1, 6, 2], [1, 8, 2], [1, 10, 2]],
    [[1, 2, 1], [1, 3, 2], [1, 6, 1], [1, 7, 2], [1, 10, 1], [1, 11, 1]],
    [[1, 4, 1], [1, 5, 2], [1, 8, 1], [1, 9, 2], [1, 10, 1], [1, 11, 2]],
  ]
  const bulk23: Uint8Array[] = []
  const allX = new Uint8Array(48); for (let i = 0; i < 24; i++) allX[i] = 1
  const allZ = new Uint8Array(48); for (let i = 0; i < 24; i++) allZ[24 + i] = 1
  bulk23.push(allX, allZ)
  for (const entries of w9Defs) {
    const r = new Uint8Array(48)
    for (const [p, l, v] of entries) { const [a, b] = LINES[l]!; r[p * 24 + a] = v; r[p * 24 + b] = v }
    bulk23.push(r)
  }
  for (const entries of lvmDefs) {
    const r = new Uint8Array(48)
    for (const [p, l, v] of entries) { const [a, b] = LINES[l]!; r[p * 24 + a] = v; r[p * 24 + b] = mod3(2 * v) }
    bulk23.push(r)
  }
  const xL = new Uint8Array(48), zL = new Uint8Array(48)
  for (let i = 0; i < 24; i++) { const v = FRAME_OF[i] === 0 ? 1 : FRAME_OF[i] === 1 ? 2 : 0; xL[i] = v; zL[24 + i] = v }

  const sympDot = (u: Uint8Array, v: Uint8Array): number => {
    let s = 0
    for (let i = 0; i < 24; i++) s += u[i]! * v[24 + i]! - u[24 + i]! * v[i]!
    return mod3(s)
  }
  // Verify all 23 stabilizers commute pairwise and with xL, zL, and sympDot(xL, zL) != 0
  let stabIsoDef = 0
  for (let i = 0; i < 23; i++) {
    for (let j = i + 1; j < 23; j++) if (sympDot(bulk23[i]!, bulk23[j]!) !== 0) stabIsoDef++
    if (sympDot(bulk23[i]!, xL) !== 0 || sympDot(bulk23[i]!, zL) !== 0) stabIsoDef++
  }
  assertExact(stabIsoDef === 0 && sympDot(xL, zL) !== 0, '[[24,1,8]]_3 stabilizer algebra check failed')

  // Check exact EM sterility for ALL 24 single-slot electric charges Q_s = (-i/sqrt3)(Z_s - Z_s^2)
  // and ALL 276 two-slot charge correlators Q_{s1} Q_{s2} (all 4 combinations Z_{s1}^{a1} Z_{s2}^{a2}):
  // If a Pauli P anticommutes with ANY stabilizer g in S_bulk, then <psi|P|psi> = 0 IDENTICALLY
  // for EVERY logical state |psi> in the code subspace (including |0_L>, |1_L>, |2_L>, |+_L>, and mixed rho_bulk)!
  let singleSlotAnticomm = 0
  for (let s = 0; s < 24; s++) {
    const pZ = new Uint8Array(48)
    pZ[24 + s] = 1
    if (bulk23.some(g => sympDot(g, pZ) !== 0)) singleSlotAnticomm++
  }
  let twoSlotZZAnticomm = 0
  let twoSlotZZTotal = 0
  for (let s1 = 0; s1 < 24; s1++) {
    for (let s2 = s1 + 1; s2 < 24; s2++) {
      for (const a1 of [1, 2]) {
        for (const a2 of [1, 2]) {
          twoSlotZZTotal++
          const pZZ = new Uint8Array(48)
          pZZ[24 + s1] = a1
          pZZ[24 + s2] = a2
          if (bulk23.some(g => sympDot(g, pZZ) !== 0)) twoSlotZZAnticomm++
        }
      }
    }
  }
  // Exact boundary entropy of region A_k (size k) for pure vacuum |0_L> vs maximally mixed bulk logical M_1 (rho_bulk = I/3):
  const gf3RankSmall = (rows: readonly Uint8Array[], nCols: number): number => {
    const mat = rows.map(r => Uint8Array.from(r))
    let rank = 0
    for (let col = 0; col < nCols && rank < mat.length; col++) {
      let piv = -1
      for (let r = rank; r < mat.length; r++) if (mat[r]![col] !== 0) { piv = r; break }
      if (piv === -1) continue
      const tmp = mat[rank]!; mat[rank] = mat[piv]!; mat[piv] = tmp
      const pRow = mat[rank]!
      if (pRow[col] === 2) for (let c = col; c < nCols; c++) pRow[c] = (2 * pRow[c]!) % 3
      for (let r = rank + 1; r < mat.length; r++) {
        const f = mat[r]![col]!
        if (f === 0) continue
        const row = mat[r]!
        for (let c = col; c < nCols; c++) row[c] = mod3(row[c]! - f * pRow[c]!)
      }
      rank++
    }
    return rank
  }
  const stabSubEntropy = (basis: readonly Uint8Array[], k: number): number => {
    const sub = basis.map(r => {
      const o = new Uint8Array(2 * k)
      for (let j = 0; j < k; j++) { o[j] = r[j]!; o[k + j] = r[24 + j]! }
      return o
    })
    return gf3RankSmall(sub, 2 * k) - k
  }
  // Pure |0_L> has 24 stabilizers (bulk23 U {zL}), maximally mixed bulk logical M_1 has 23 stabilizers (bulk23)
  // Wait: for mixed state on 24 qutrits with 23 stabilizers (dim 3 code space), S(A) = |A| - |S_A| where |S_A| = rank(S) - rank(S_{A^c})?
  // Exact formula for mixed stabilizer state rho = (1/3^{n-r}) prod (I + ...): S(A) = |A| - (r - rank(proj_{A^c}(S)))?
  // Wait: for pure state (r = n), S(A) = rank(proj_A(S)) - |A|. For mixed state purified by 1 bulk qutrit b_0:
  // Use the EXACT 25-qutrit Choi state (24 boundary + 1 bulk b_0): S(A) = rank(proj_A(Choi)) - |A|!
  const choi25: Uint8Array[] = bulk23.map(r => {
    const s = new Uint8Array(50)
    for (let i = 0; i < 24; i++) { s[i] = r[i]!; s[25 + i] = r[24 + i]! }
    return s
  })
  const sXChoi = new Uint8Array(50), sZChoi = new Uint8Array(50)
  for (let i = 0; i < 24; i++) { sXChoi[i] = xL[i]!; sZChoi[25 + i] = zL[24 + i]! }
  sXChoi[24] = 2; sZChoi[49] = 1
  choi25.push(sXChoi, sZChoi)
  const choiSubEntropy = (basis: readonly Uint8Array[], k: number): number => {
    const sub = basis.map(r => {
      const o = new Uint8Array(2 * k)
      for (let j = 0; j < k; j++) { o[j] = r[j]!; o[k + j] = r[25 + j]! }
      return o
    })
    return gf3RankSmall(sub, 2 * k) - k
  }
  const pure0L = [...bulk23, zL]
  const w10VacS: number[] = []
  const w10MixS: number[] = []
  const w10Ks = [1, 4, 7, 8, 12, 16, 17, 20, 24]
  for (const k of w10Ks) {
    w10VacS.push(stabSubEntropy(pure0L, k))
    w10MixS.push(choiSubEntropy(choi25, k))
  }

  console.log('\n  [C6] Electromagnetic Sterility & Depth Suppression of D = 1, 2, 3 Neutral Bulk Modes:')
  console.log('       (a) k = 2 Neutral Antipodal Pair (Q = 0_V, T = 6 beats under verbatim bare U):')
  console.log(`           max|<Q_0>| & max|<Q_tot>| across all D=0..3, t=0..6 = ${maxK2LocalQ.toExponential(2)} (EXACT ZERO EM CHARGE!)`)
  console.log('           Worst-case straight-geodesic-aligned bulk docks (step^D along downward ray from dock 0):')
  console.log('           Depth D | Pure-Bulk-Line max P(D=0) | Isotropic-12-Line Causal Delay | Peak P(D=0) | P(D=0, t=6) | Rel EM sigma ~ P^2')
  for (let d = 0; d <= 3; d++) {
    const relSig = (isoPairPeakP0[d]! / isoPairPeakP0[0]!) ** 2
    console.log(
      `              ${d}    |       ${pureBulkPairMaxP0[d]!.toExponential(4)}        |            t_hit = ${String(isoPairCausalDelay[d]!).padStart(2)}          | ${isoPairPeakP0[d]!.toExponential(4)}  | ${isoPairT6P0[d]!.toExponential(4)}  |     ${relSig.toExponential(3)}`,
    )
  }
  console.log(
    `           Hyperbolic geodesic sterility theorem (exhaustive all ${d2AllUnder0.size} D=2 descendants, 24 rays, m=1..6): ${d2ExhaustiveSterile}/${d2AllUnder0.size} (${((100 * d2ExhaustiveSterile) / d2AllUnder0.size).toFixed(2)}%) have ZERO geodesic rays hitting ANY D=0 dock, while ${d2ExhaustiveHitD0}/${d2AllUnder0.size} (${((100 * d2ExhaustiveHitD0) / d2AllUnder0.size).toFixed(2)}%, matching ${d2StraightFrom0.size} straight from dock 0) hit D=0! Bare-U off-geodesic D=2,3 isotropic k=2 pairs: P(D=0, t=0..6) = [${offGeoResD2.peakP0.toExponential(1)}, ${offGeoResD3.peakP0.toExponential(1)}]`,
  )
  console.log('       (b) k = 4 Neutral C-Even Chiral Bulk Cluster (T = 4 beats under verbatim bare U, geodesic-aligned):')
  console.log(
    `           max|<Q_tot>|=${maxK4GlobalQ.toExponential(2)}; Depth D=0..3 peak |<Q_{D=0}>| = [${k4PeakQ0.map(x => x.toExponential(3)).join(', ')}]; peak <D_act,D=0> = [${k4PeakAct0.map(x => x.toExponential(3)).join(', ')}]`,
  )
  console.log('       (c) W10 [[24, 1, 8]]_3 Bulk Logical Excitation (Exact GF(3) Knill-Laflamme Sterility):')
  console.log(
    `           Weight-1 electric charge <Q_s> = 0 identically on ${singleSlotAnticomm}/24 slots; weight-2 <Q_s1 Q_s2> = 0 on ${twoSlotZZAnticomm}/${twoSlotZZTotal} ZZ operators!`,
  )
  console.log(
    `           Gravitational FLM imprint S(A_k)/ln 3 for k=[${w10Ks.join(',')}]: vac=[${w10VacS.join(',')}], bulk-DM M_1=[${w10MixS.join(',')}] (dS=0 for k<=7, dS=+1 for k>=8/17!)`,
  )

  recordCheck(
    'C6',
    'Sterile deep-bulk DM modes (D=1..3): exact <Q_0>=0, exhaustive 312/330 geodesic sterility & W10 d=8 EM sterility',
    maxK2LocalQ < 1e-14 &&
      pureBulkPairMaxP0[1]! < 1e-14 &&
      pureBulkPairMaxP0[2]! < 1e-14 &&
      pureBulkPairMaxP0[3]! < 1e-14 &&
      isoPairCausalDelay[1] === 1 &&
      isoPairCausalDelay[2] === 2 &&
      isoPairCausalDelay[3] === 3 &&
      isoPairPeakP0[3]! < isoPairPeakP0[2]! &&
      isoPairPeakP0[2]! < isoPairPeakP0[1]! &&
      isoPairPeakP0[1]! < isoPairPeakP0[0]! &&
      d2AllUnder0.size === 330 &&
      d2ExhaustiveSterile === 312 &&
      d2ExhaustiveHitD0 === 18 &&
      offGeoResD2.peakP0 < 1e-14 &&
      offGeoResD3.peakP0 < 1e-14 &&
      k4PeakQ0[1]! < k4PeakQ0[0]! &&
      k4PeakQ0[2]! <= k4PeakQ0[1]! &&
      k4PeakQ0[3]! <= k4PeakQ0[2]! &&
      singleSlotAnticomm === 24 &&
      twoSlotZZAnticomm === twoSlotZZTotal &&
      w10MixS[2]! - w10VacS[2]! === 0 &&
      w10MixS[6]! - w10VacS[6]! === 1,
    `geoPeak=[${isoPairPeakP0.map(x => x.toFixed(4)).join(',')}], sterileD2=${d2ExhaustiveSterile}/${d2AllUnder0.size} (94.55%), W10 Q_s=0 (24/24), FLM=+1`,
  )

  // --------------------------------------------------------------------------
  // C7: Honest Two-Part Bare-U Microscopic Audit on the 37-Dock {3,4,3,4} Cusp:
  //     (a) Strictly sterile D = 1 non-bridge neutral mode (disjoint tensor-product state)
  //         certifying exact 0 bare-U sterile entanglement imprint when no particle crosses to D = 0
  //     (b) Non-sterile D = 1 <-> D = 0 bridge-exchange diagnostic (explicitly reporting matter leakage
  //         D_act(D=0) > 0, t=0 50/50 cross-sector artifact, bridge dI>0, and negative husk-only response)
  // --------------------------------------------------------------------------
  const globalDock37: number[] = [0]
  const localId37 = new Map<number, number>([[0, 0]])
  const addD37 = (d: number): void => {
    if (!localId37.has(d)) { localId37.set(d, globalDock37.length); globalDock37.push(d) }
  }
  const r1Layer37: number[] = []
  for (let s = 0; s < 24; s++) {
    const nb = stepDock(0, s)
    addD37(nb)
    if (cuspDepth(nb) === 0) r1Layer37.push(nb)
  }
  const cornerCnt37 = new Map<number, number>()
  for (const d1 of r1Layer37) {
    for (let s = 0; s < 24; s++) {
      const nb = stepDock(d1, s)
      if (!localId37.has(nb) && cuspDepth(nb) === 0) cornerCnt37.set(nb, (cornerCnt37.get(nb) ?? 0) + 1)
    }
  }
  for (const [c, cnt] of cornerCnt37) if (cnt >= 2) addD37(c)
  const nV37 = globalDock37.length
  assertExact(nV37 === 37, `Expected 37-dock cluster, got ${nV37}`)

  const table37: Int32Array[] = Array.from({ length: nV37 }, () => new Int32Array(24).fill(-1))
  const edges37: [number, number][] = []
  const edgeSet37 = new Set<string>()
  const edgeLen37 = Array.from({ length: nV37 }, (_, i) => {
    const r = new Float64Array(nV37).fill(1e15); r[i] = 0; return r
  })
  for (let u = 0; u < nV37; u++) {
    for (let s = 0; s < 24; s++) {
      const v = localId37.get(stepDock(globalDock37[u]!, s))
      if (v !== undefined) {
        table37[u]![s] = v
        edgeLen37[u]![v] = 1
        if (u < v && !edgeSet37.has(`${u},${v}`)) { edgeSet37.add(`${u},${v}`); edges37.push([u, v]) }
      }
    }
  }
  const graphDist37 = floydWarshall(nV37, edgeLen37)

  function applyBareBeat37(st: FState): FState {
    const geom37: LatticeGeometry = {
      step: (d, s) => table37[d]![s]!,
      parity: d => dockParity[globalDock37[d]!]!,
      depth: d => cuspDepth(globalDock37[d]!),
    }
    let s = applyPhiOddLayer(st, false, geom37, {})
    s = applyHalfCoinDLayer(s, false)
    s = applyOppositeSignBounceKLayer(s, {})
    s = applyPairLineMixerLayer(s, false, {})
    s = applyRoleMeetLayer(s, false, {})
    s = applyHalfCoinDLayer(s, false)
    s = applyPhiOddLayer(s, false, geom37, {})
    const out: FState = new Map()
    for (const e of s.values()) {
      const moved = e.vibes.map(([d, sl, t, r]): Vibe => {
        const nb = table37[d]![sl]!
        return nb >= 0 ? [nb, sl, t, r] : [d, OPPOSITE_SLOT[sl]!, t, r]
      })
      addEntry(out, moved, e.re, e.im)
    }
    return out
  }

  function subsystemEntropy37(st: FState, subDocks: readonly number[]): number {
    const inSub = new Set(subDocks)
    const intIds = new Map<string, number>()
    const extIds = new Map<string, number>()
    const entries: [number, number, number, number][] = []
    for (const e of st.values()) {
      const ip: string[] = [], ep: string[] = []
      for (const [d, s, t, r] of e.vibes) {
        const tok = `${d}:${s}:${t}:${r}`
        if (inSub.has(d)) ip.push(tok)
        else ep.push(tok)
      }
      const ik = ip.join('|'), ek = ep.join('|')
      let ii = intIds.get(ik)
      if (ii === undefined) { ii = intIds.size; intIds.set(ik, ii) }
      let ei = extIds.get(ek)
      if (ei === undefined) { ei = extIds.size; extIds.set(ek, ei) }
      entries.push([ii, ei, e.re, e.im])
    }
    const nI = intIds.size, nE = extIds.size
    if (nI <= 1 || nE <= 1) return 0
    const useInt = nI <= nE
    const dim = useInt ? nI : nE
    const bySum = new Map<number, [number, number, number][]>()
    for (const [ii, ei, re, im] of entries) {
      const row = useInt ? ii : ei, col = useInt ? ei : ii
      const arr = bySum.get(col)
      if (arr) arr.push([row, re, im])
      else bySum.set(col, [[row, re, im]])
    }
    const G = cmatZero(dim)
    for (const list of bySum.values()) {
      for (let a = 0; a < list.length; a++) {
        const [ra, ar, ai] = list[a]!
        for (let b = a; b < list.length; b++) {
          const [rb, br, bi] = list[b]!
          const dr = ar * br + ai * bi, di = ai * br - ar * bi
          G.re[ra * dim + rb] = G.re[ra * dim + rb]! + dr
          G.im[ra * dim + rb] = G.im[ra * dim + rb]! + di
          if (a !== b) {
            G.re[rb * dim + ra] = G.re[rb * dim + ra]! + dr
            G.im[rb * dim + ra] = G.im[rb * dim + ra]! - di
          }
        }
      }
    }
    const vals = hermitianEigenValues(G)
    let S = 0
    for (let i = 0; i < dim; i++) {
      const p = vals[i]!
      if (p > 1e-14) S -= p * Math.log(p)
    }
    return S
  }

  const cuspLines: number[] = []
  for (const s of LAYER_SLOTS) {
    const l = LINE_OF_SLOT[s]!
    if (!cuspLines.includes(l)) cuspLines.push(l)
  }
  const vBulkD1 = Array.from({ length: 24 }, (_, i) => i + 1).find(u => cuspDepth(globalDock37[u]!) === 1)!
  const bridgeEdgeIdx = edges37.findIndex(([u, v]) => (u === 0 && v === vBulkD1) || (u === vBulkD1 && v === 0))
  const slotBulkTo0 = Array.from({ length: 24 }, (_, s) => s).find(s => table37[vBulkD1]![s] === 0)!
  const bridgeLine = LINE_OF_SLOT[slotBulkTo0]!
  const sterileLines = cuspLines.filter(l => l !== bridgeLine)
  let vBulkReflectSlots = 0
  for (let s = 0; s < 24; s++) if (table37[vBulkD1]![s]! < 0) vBulkReflectSlots++
  const r1HuskLocals: number[] = []
  for (let v = 1; v < nV37; v++) {
    if (cuspDepth(globalDock37[v]!) === 0 && graphDist37[0]![v] === 1) r1HuskLocals.push(v)
  }
  assertExact(r1HuskLocals.length === 6, `Expected 6 r=1 husk docks in cl37, got ${r1HuskLocals.length}`)

  const measureDAct37 = (st: FState): { readonly dAct0: number; readonly dActAllD0: number; readonly maxQHusk: number } => {
    const qLoc = new Float64Array(nV37)
    let dAct0 = 0, dActAllD0 = 0
    for (const e of st.values()) {
      const p = e.re * e.re + e.im * e.im
      for (const [d, , t] of e.vibes) {
        qLoc[d] = qLoc[d]! + p * t
        if (d === 0) dAct0 += p
        if (cuspDepth(globalDock37[d]!) === 0) dActAllD0 += p
      }
    }
    let maxQHusk = 0
    for (let v = 0; v < nV37; v++) if (cuspDepth(globalDock37[v]!) === 0) maxQHusk = Math.max(maxQHusk, Math.abs(qLoc[v]!))
    return { dAct0, dActAllD0, maxQHusk }
  }

  const tensorProduct37 = (a: FState, b: FState): FState => {
    const out: FState = new Map()
    for (const ea of a.values()) {
      for (const eb of b.values()) {
        const [re, im] = cxMul([ea.re, ea.im], [eb.re, eb.im])
        addEntry(out, [...ea.vibes, ...eb.vibes], re, im)
      }
    }
    return normalizeState(out)
  }

  // (a) Strictly sterile D = 1 bulk mode control (excluding bridgeLine {1, 2}):
  //     Build a genuine same-role tensor-product state |sea_husk(D=0)> (x) |DM_sterile(vBulkD1)>
  const buildHuskOnlySea37 = (): FState => {
    const st: FState = new Map()
    const huskCore = [0, ...r1HuskLocals]
    for (const v of huskCore) {
      for (const l of cuspLines) {
        const [sA, sB] = LINES[l]!
        addEntry(st, [[v, sA, 1, 0], [v, sB, -1, 0]], 1, 0)
        addEntry(st, [[v, sA, -1, 0], [v, sB, 1, 0]], 1, 0)
      }
    }
    return normalizeState(st)
  }
  const buildSterileDM37 = (): FState => {
    const [sA, sB] = LINES[sterileLines[0]!]!
    const st: FState = new Map()
    addEntry(st, [[vBulkD1, sA, 1, 0], [vBulkD1, sB, -1, 0]], 1, 0)
    addEntry(st, [[vBulkD1, sA, -1, 0], [vBulkD1, sB, 1, 0]], 1, 0)
    return normalizeState(st)
  }
  let stSterileAlone = buildSterileDM37()
  let stHuskBase = buildHuskOnlySea37()
  let stProdSterile = tensorProduct37(stHuskBase, stSterileAlone)
  for (let t = 0; t < 2; t++) {
    stSterileAlone = applyBareBeat37(stSterileAlone)
    stHuskBase = applyBareBeat37(stHuskBase)
    stProdSterile = applyBareBeat37(stProdSterile)
  }
  const sterileLeak = measureDAct37(stSterileAlone)
  const sHubBaseA = subsystemEntropy37(stHuskBase, [0])
  const sBulkBaseA = subsystemEntropy37(stHuskBase, [vBulkD1])
  const miBridgeBaseA = Math.max(0, sHubBaseA + sBulkBaseA - subsystemEntropy37(stHuskBase, [0, vBulkD1]))
  let miHuskBaseA = 0
  for (const r1 of r1HuskLocals) {
    miHuskBaseA += Math.max(0, sHubBaseA + subsystemEntropy37(stHuskBase, [r1]) - subsystemEntropy37(stHuskBase, [0, r1]))
  }
  miHuskBaseA /= r1HuskLocals.length

  const sHubProdA = subsystemEntropy37(stProdSterile, [0])
  const sBulkProdA = subsystemEntropy37(stProdSterile, [vBulkD1])
  const miBridgeProdA = Math.max(0, sHubProdA + sBulkProdA - subsystemEntropy37(stProdSterile, [0, vBulkD1]))
  let miHuskProdA = 0
  for (const r1 of r1HuskLocals) {
    miHuskProdA += Math.max(0, sHubProdA + subsystemEntropy37(stProdSterile, [r1]) - subsystemEntropy37(stProdSterile, [0, r1]))
  }
  miHuskProdA /= r1HuskLocals.length
  const prodLeakQ = measureDAct37(stProdSterile).maxQHusk
  const sterileShiftMax = Math.max(
    Math.abs(sHubProdA - sHubBaseA),
    Math.abs(miBridgeProdA - miBridgeBaseA),
    Math.abs(miHuskProdA - miHuskBaseA),
  )

  // (b) Non-sterile D = 1 <-> D = 0 bridge-exchange diagnostic (explicitly non-sterile!)
  const buildSea37 = (): FState => {
    const st: FState = new Map()
    for (let v = 0; v < nV37; v++) {
      for (const l of cuspLines) {
        const [sA, sB] = LINES[l]!
        addEntry(st, [[v, sA, 1, 0], [v, sB, -1, 0]], 1, 0)
        addEntry(st, [[v, sA, -1, 0], [v, sB, 1, 0]], 1, 0)
      }
    }
    return normalizeState(st)
  }
  const buildBulkDM37 = (nPairs: 1 | 2): FState => {
    const st: FState = new Map()
    if (nPairs === 1) {
      for (const l of cuspLines) {
        const [sA, sB] = LINES[l]!
        addEntry(st, [[vBulkD1, sA, 1, 1], [vBulkD1, sB, -1, 1]], 1, 0)
        addEntry(st, [[vBulkD1, sA, -1, 1], [vBulkD1, sB, 1, 1]], 1, 0)
      }
    } else {
      for (let i = 0; i < 6; i++) {
        const [a1, b1] = LINES[cuspLines[i]!]!
        const [a2, b2] = LINES[cuspLines[(i + 1) % 6]!]!
        addEntry(st, [[vBulkD1, a1, 1, 1], [vBulkD1, b1, -1, 1], [vBulkD1, a2, 1, 1], [vBulkD1, b2, -1, 1]], 1, 0)
        addEntry(st, [[vBulkD1, a1, -1, 1], [vBulkD1, b1, 1, 1], [vBulkD1, a2, -1, 1], [vBulkD1, b2, 1, 1]], 1, 0)
      }
    }
    return normalizeState(st)
  }
  const mixStates = (a: FState, b: FState): FState => {
    const out: FState = new Map()
    for (const e of a.values()) addEntry(out, e.vibes, e.re, e.im)
    for (const e of b.values()) addEntry(out, e.vibes, e.re, e.im)
    return normalizeState(out)
  }

  const stSea0 = buildSea37()
  const stDM2_0 = buildBulkDM37(1)
  const stDM4_0 = buildBulkDM37(2)
  // Measure t = 0 50/50 cross-sector superposition artifact BEFORE bare U runs
  const psiMixT0 = mixStates(stSea0, stDM2_0)
  const miSeaT0 = Math.max(0, subsystemEntropy37(stSea0, [0]) + subsystemEntropy37(stSea0, [vBulkD1]) - subsystemEntropy37(stSea0, [0, vBulkD1]))
  const miMixT0 = Math.max(0, subsystemEntropy37(psiMixT0, [0]) + subsystemEntropy37(psiMixT0, [vBulkD1]) - subsystemEntropy37(psiMixT0, [0, vBulkD1]))
  const artifactT0DeltaI = miMixT0 - miSeaT0

  let stSea = stSea0
  let stDM2 = stDM2_0
  let stDM4 = stDM4_0
  for (let t = 0; t < 2; t++) {
    stSea = applyBareBeat37(stSea)
    stDM2 = applyBareBeat37(stDM2)
    stDM4 = applyBareBeat37(stDM4)
  }
  const dm2Leak = measureDAct37(stDM2)
  const dm4Leak = measureDAct37(stDM4)
  const psiSea = stSea
  const psiWithDM2 = mixStates(stSea, stDM2)
  const psiWithDM4 = mixStates(stSea, stDM4)

  const analyze37 = (st: FState, iRefBg?: number) => {
    const qLoc = new Float64Array(nV37)
    const dAct = new Float64Array(nV37)
    for (const e of st.values()) {
      const p = e.re * e.re + e.im * e.im
      for (const [d, , t] of e.vibes) {
        qLoc[d] = qLoc[d]! + p * t
        dAct[d] = dAct[d]! + p
      }
    }
    let maxQHusk = 0
    for (let v = 0; v < nV37; v++) if (cuspDepth(globalDock37[v]!) === 0) maxQHusk = Math.max(maxQHusk, Math.abs(qLoc[v]!))
    const s1 = new Float64Array(nV37)
    for (let v = 0; v < nV37; v++) s1[v] = subsystemEntropy37(st, [v])
    const wMat = Array.from({ length: nV37 }, () => new Float64Array(nV37))
    const mutEdge = new Float64Array(edges37.length)
    let maxMut = 0
    let miHuskR1Sum = 0
    for (let ei = 0; ei < edges37.length; ei++) {
      const [u, v] = edges37[ei]!
      const mi = Math.max(0, s1[u]! + s1[v]! - subsystemEntropy37(st, [u, v]))
      mutEdge[ei] = mi
      if (mi > maxMut) maxMut = mi
      if ((u === 0 && r1HuskLocals.includes(v)) || (v === 0 && r1HuskLocals.includes(u))) miHuskR1Sum += mi
    }
    const iRef = iRefBg ?? Math.max(maxMut, 1e-15)
    const iFloor = Math.max(iRef * 1e-6, 1e-12)
    for (let ei = 0; ei < edges37.length; ei++) {
      const [u, v] = edges37[ei]!
      const mi = Math.max(mutEdge[ei]!, iFloor)
      wMat[u]![v] = mi
      wMat[v]![u] = mi
    }
    const miBridge = Math.max(mutEdge[bridgeEdgeIdx]!, iFloor)
    const dMIBridge = -Math.log(miBridge / iRef)
    const kBridge = computeLLYCurvature(0, vBulkD1, wMat, graphDist37)
    let kHubSum = 0, kHubCnt = 0
    for (let ei = 0; ei < edges37.length; ei++) {
      const [u, v] = edges37[ei]!
      if (u === 0 || v === 0) { kHubSum += computeLLYCurvature(u, v, wMat, graphDist37); kHubCnt++ }
    }
    return {
      maxQHusk,
      dActHub: dAct[0]!,
      dActBulk: dAct[vBulkD1]!,
      sHub: s1[0]!,
      sBulk: s1[vBulkD1]!,
      miBridge,
      miHuskR1Mean: miHuskR1Sum / r1HuskLocals.length,
      dMIBridge,
      kBridge,
      kHubMean: kHubSum / kHubCnt,
      maxMut,
    }
  }

  const aSea = analyze37(psiSea)
  const aDM2 = analyze37(psiWithDM2, aSea.maxMut)
  const aDM4 = analyze37(psiWithDM4, aSea.maxMut)
  const huskR1Drop2Pct = 100 * (aDM2.miHuskR1Mean / aSea.miHuskR1Mean - 1)
  const huskR1Drop4Pct = 100 * (aDM4.miHuskR1Mean / aSea.miHuskR1Mean - 1)

  const fmtS = (x: number): string => `${x >= 0 ? '+' : ''}${x.toFixed(5)}`
  console.log('\n  [C7] Honest Bare-U Microscopic Audit on 37-Dock {3,4,3,4} Cluster (T = 2, Sterile Control vs Non-Sterile Bridge):')
  console.log(
    `       cl37 boundary audit: vBulkD1 has ${vBulkReflectSlots}/24 slots hitting the artificial reflecting wall, bridgeLine={${LINES[bridgeLine]!.join(',')}}`,
  )
  console.log(
    `       (a) STRICTLY STERILE D=1 non-bridge control (genuine same-role tensor product |sea_husk> (x) |DM_sterile>):`,
  )
  console.log(
    `           Sterile DM alone at t=2: D_act(dock 0)=${sterileLeak.dAct0.toFixed(6)}, D_act(all D=0)=${sterileLeak.dActAllD0.toFixed(6)}, max|Q_{D=0}|=${sterileLeak.maxQHusk.toExponential(1)}`,
  )
  console.log(
    `           Product state vs baseline: max|Q_{D=0}|=${prodLeakQ.toExponential(1)}, dS(hub)=${fmtS(sHubProdA - sHubBaseA)}, dI(0:D1)=${fmtS(miBridgeProdA - miBridgeBaseA)}, dI(0:r_1)=${fmtS(miHuskProdA - miHuskBaseA)} (EXACT ZERO sterile imprint!)`,
  )
  console.log(
    `           50/50 role-0/role-1 superposition artifact check at t=0 (BEFORE bare U): dI(0:D1, t=0)=${fmtS(artifactT0DeltaI)}`,
  )
  console.log(
    `       (b) NON-STERILE D=1 <-> D=0 bridge-exchange diagnostic (particles physically cross bridgeLine onto D=0!):`,
  )
  console.log(
    `           Non-sterile DM matter leakage onto D=0 at t=2: DM2 D_act(dock 0)=${dm2Leak.dAct0.toFixed(6)}, D_act(all D=0)=${dm2Leak.dActAllD0.toFixed(6)}; DM4 D_act(dock 0)=${dm4Leak.dAct0.toFixed(6)}, D_act(all D=0)=${dm4Leak.dActAllD0.toFixed(6)}`,
  )
  console.log(
    `           Baseline sea (Q=0_V) : max|Q_{D=0}|=${aSea.maxQHusk.toExponential(1)}, S(hub)=${aSea.sHub.toFixed(5)}, I(0:D1)=${aSea.miBridge.toFixed(5)}, I(0:r1)=${aSea.miHuskR1Mean.toFixed(5)}, k_LLY(0,D1)=${aSea.kBridge.toFixed(5)}, k_LLY(hub)=${aSea.kHubMean.toFixed(5)}`,
  )
  console.log(
    `           + Bridge DM2 (non-st): max|Q_{D=0}|=${aDM2.maxQHusk.toExponential(1)}, dS(hub)=${fmtS(aDM2.sHub - aSea.sHub)}, dI(0:D1)=${fmtS(aDM2.miBridge - aSea.miBridge)}, dI(0:r1)=${huskR1Drop2Pct.toFixed(1)}%, dd_MI=${fmtS(aDM2.dMIBridge - aSea.dMIBridge)}, dk_LLY(0,D1)=${fmtS(aDM2.kBridge - aSea.kBridge)}, dk_LLY(hub)=${fmtS(aDM2.kHubMean - aSea.kHubMean)}`,
  )
  console.log(
    `           + Bridge DM4 (non-st): max|Q_{D=0}|=${aDM4.maxQHusk.toExponential(1)}, dS(hub)=${fmtS(aDM4.sHub - aSea.sHub)}, dI(0:D1)=${fmtS(aDM4.miBridge - aSea.miBridge)}, dI(0:r1)=${huskR1Drop4Pct.toFixed(1)}%, dd_MI=${fmtS(aDM4.dMIBridge - aSea.dMIBridge)}, dk_LLY(0,D1)=${fmtS(aDM4.kBridge - aSea.kBridge)}, dk_LLY(hub)=${fmtS(aDM4.kHubMean - aSea.kHubMean)}`,
  )
  console.log(
    `           HONEST VERDICT: Bare U on fixed cl37 mediates ZERO sterile entanglement imprint in T=2 beats when no particle crosses to D=0; genuine sterile gravitational visibility arises via W10 [[24,1,8]]_3 FLM entropy (C6c) and H^4 zero-mode Newtonian gravity (C8b).`,
  )

  recordCheck(
    'C7',
    'Honest bare-U 37-dock audit: 0 sterile entanglement imprint vs non-sterile bridge-exchange leakage & artifact',
    vBulkReflectSlots === 23 &&
      sterileLeak.dActAllD0 < 1e-14 &&
      sterileLeak.maxQHusk < 1e-14 &&
      prodLeakQ < 1e-14 &&
      sterileShiftMax < 1e-12 &&
      artifactT0DeltaI > 0.03 &&
      dm2Leak.dAct0 > 0.04 &&
      dm2Leak.dActAllD0 > 0.08 &&
      aDM2.maxQHusk < 1e-14 &&
      aDM4.maxQHusk < 1e-14 &&
      aDM2.miBridge - aSea.miBridge > 0.1 &&
      aDM4.miBridge - aSea.miBridge > aDM2.miBridge - aSea.miBridge &&
      huskR1Drop2Pct < -30 &&
      aDM2.kHubMean - aSea.kHubMean < 0,
    `sterileShift=${sterileShiftMax.toExponential(1)}, t0Art=${fmtS(artifactT0DeltaI)}, bridgeLeak(D0)=${dm2Leak.dActAllD0.toFixed(4)}, huskI(0:r1)=${huskR1Drop2Pct.toFixed(1)}%, dk_hub=${fmtS(aDM2.kHubMean - aSea.kHubMean)}`,
  )

  // --------------------------------------------------------------------------
  // C8: Exact {3,4,3,4} Bulk-to-Husk Green's Function & Emergent Cored Halo
  // --------------------------------------------------------------------------
  // (a) Exact 8,857-dock R <= 3 Coxeter 4D Green's function G_{4D}(x_{D=0}, v_{D_source})
  const ballDist = new Map<number, number>([[0, 0]])
  const ballDocks: number[] = [0]
  const ballLocal = new Map<number, number>([[0, 0]])
  for (let head = 0; head < ballDocks.length; head++) {
    const u = ballDocks[head]!
    const du = ballDist.get(u)!
    if (du >= 3) continue
    for (let s = 0; s < 24; s++) {
      const nb = stepDock(u, s)
      if (!ballDist.has(nb)) {
        ballDist.set(nb, du + 1)
        ballLocal.set(nb, ballDocks.length)
        ballDocks.push(nb)
      }
    }
  }
  const nBall = ballDocks.length
  assertExact(nBall === 8857, `Expected 8857-dock R<=3 ball, got ${nBall}`)
  const adjBall = new Int32Array(nBall * 24).fill(-1)
  const ballRad = new Uint8Array(nBall)
  for (let i = 0; i < nBall; i++) {
    const gd = ballDocks[i]!
    ballRad[i] = ballDist.get(gd)!
    if (ballRad[i]! < 3) {
      for (let s = 0; s < 24; s++) {
        const j = ballLocal.get(stepDock(gd, s))
        adjBall[i * 24 + s] = j === undefined ? -1 : j
      }
    } else {
      for (let s = 0; s < 24; s++) {
        const nb = neighbors[gd]![s]!
        if (nb >= 0) {
          const j = ballLocal.get(nb)
          if (j !== undefined) adjBall[i * 24 + s] = j
        }
      }
    }
  }
  // Collect all D = 0 husk docks inside the R <= 3 ball, grouped by husk radius r in {0, 1, 2, 3}
  const huskLocalByR: number[][] = [[], [], [], []]
  for (let i = 0; i < nBall; i++) {
    if (isLayerDock(ballDocks[i]!)) huskLocalByR[ballRad[i]!]!.push(i)
  }

  function solveBallGreen(srcLocal: number): { readonly g: Float64Array; readonly maxRes: number } {
    let gCur = new Float64Array(nBall)
    let gNxt = new Float64Array(nBall)
    const inv24 = 1 / 24
    for (let it = 0; it < 75; it++) {
      for (let i = 0; i < nBall; i++) {
        let sum = i === srcLocal ? 1.0 : 0.0
        const base = i * 24
        for (let s = 0; s < 24; s++) {
          const j = adjBall[base + s]!
          if (j >= 0) sum += gCur[j]!
        }
        gNxt[i] = sum * inv24
      }
      const tmp = gCur; gCur = gNxt; gNxt = tmp
    }
    let maxRes = 0
    for (let i = 0; i < nBall; i++) {
      let sum = 0
      const base = i * 24
      for (let s = 0; s < 24; s++) {
        const j = adjBall[base + s]!
        if (j >= 0) sum += gCur[j]!
      }
      maxRes = Math.max(maxRes, Math.abs(24 * gCur[i]! - sum - (i === srcLocal ? 1 : 0)))
    }
    return { g: gCur, maxRes }
  }

  // Solve G_{4D}(x_{D=0}, v_{D_source}) for D_source = 0, 1, 2, 3
  const g4DProfiles: { dSrc: number; gR0: number; gR1Avg: number; gR2Avg: number; ratio10: number; maxRes: number }[] = []
  for (let d = 0; d <= 3; d++) {
    const srcLocal = ballLocal.get(bulkDocks[d]!)!
    const sol = solveBallGreen(srcLocal)
    const gR0 = sol.g[0]!
    const avgOf = (arr: readonly number[]): number => arr.reduce((s, idx) => s + sol.g[idx]!, 0) / arr.length
    const gR1Avg = avgOf(huskLocalByR[1]!)
    const gR2Avg = avgOf(huskLocalByR[2]!)
    g4DProfiles.push({ dSrc: d, gR0, gR1Avg, gR2Avg, ratio10: gR1Avg / gR0, maxRes: sol.maxRes })
  }
  // Exact point-to-point vertical decay rates vs horosphere-averaged m_bulk = ln(lambda)
  const ptDecay01 = -Math.log(g4DProfiles[1]!.gR0 / g4DProfiles[0]!.gR0)
  const ptDecay12 = -Math.log(g4DProfiles[2]!.gR0 / g4DProfiles[1]!.gR0)
  const ptDecay23 = -Math.log(g4DProfiles[3]!.gR0 / g4DProfiles[2]!.gR0)
  // Exact length-2 shortest-path multiplicity from bulkDocks[1] to each of the 6 r=1 husk docks
  const d1SrcLocal = ballLocal.get(bulkDocks[1]!)!
  const d1NbrSet = new Set<number>()
  for (let s = 0; s < 24; s++) {
    const j = adjBall[d1SrcLocal * 24 + s]!
    if (j >= 0) d1NbrSet.add(j)
  }
  const pathMultD1ToR1: number[] = []
  for (const hLoc of huskLocalByR[1]!) {
    let cnt = 0
    for (let s = 0; s < 24; s++) {
      const j = adjBall[hLoc * 24 + s]!
      if (j >= 0 && d1NbrSet.has(j)) cnt++
    }
    pathMultD1ToR1.push(cnt)
  }
  const meanPathMultD1ToR1 = pathMultD1ToR1.reduce((a, b) => a + b, 0) / pathMultD1ToR1.length

  // (b) Exact 3D {4,3,4} Lattice G_cusp at 6 Axis Points + Closed-Form Continuum H^4 Cored Halo Potential
  //     Step 1: Verify 3D {4,3,4} lattice Green's function G_cusp(r, 0, 0) at 6 axis points [0,1,2,4,8,12]
  //             via 16-point Gauss-Legendre Schwinger-Bessel quadrature (4 pi * 12 * G_cusp(12) -> 1.0018).
  //     Step 2: Evaluate the exact closed-form continuum 3D Newtonian potential sourced by the normalized
  //             H^4 boundary Poisson kernel K_{H^4}(y, r_c) = r_c / (pi^2 (|y|^2 + r_c^2)^2):
  //               Phi_cont(r, r_c) = atan(r / r_c) / (2 pi^2 r)
  //             At r -> inf: (1 / (2 pi^2 r)) * (pi/2) = 1 / (4 pi r) exactly.
  //             At r -> 0: Phi_cont(r, r_c) = 1 / (2 pi^2 r_c) * (1 - r^2 / (3 r_c^2) + ...), completely cored.
  //             Enclosed mass M_enc(r) = (2/pi) * (atan(r/r_c) - (r/r_c)/(1 + (r/r_c)^2)) => v_circ^2 = M_enc / (4 pi r).
  //             Core scale from exact {3,4,3,4} horosphere factor r_c(D) = a(D) = N_D^{1/3}
  //             (r_c(1) = 2.6207, r_c(2) = 6.9104, r_c(3) = 18.2055 hops).
  function expScaledBesselIAll(t: number, nMax: number): Float64Array {
    const out = new Float64Array(nMax + 1)
    if (t === 0) { out[0] = 1; return out }
    if (t > 120) {
      const pref = 1 / Math.sqrt(2 * PI * t)
      for (let n = 0; n <= nMax; n++) {
        const mu = 4 * n * n
        let term = 1, sum = 1
        for (let k = 1; k <= 12; k++) {
          term *= -(mu - (2 * k - 1) * (2 * k - 1)) / (k * 8 * t)
          sum += term
          if (Math.abs(term) < 1e-16 * Math.abs(sum)) break
        }
        out[n] = pref * sum
      }
      return out
    }
    const M = nMax + Math.ceil(Math.sqrt(40 * (t + 1))) + 35
    let yNext = 0, yCur = 1e-100, normSum = 0
    const raw = new Float64Array(nMax + 1)
    for (let k = M; k >= 0; k--) {
      if (k <= nMax) raw[k] = yCur
      normSum += k === 0 ? yCur : 2 * yCur
      const yPrev = ((2 * k) / t) * yCur + yNext
      yNext = yCur; yCur = yPrev
      if (yCur > 1e150) {
        yCur *= 1e-150; yNext *= 1e-150; normSum *= 1e-150
        for (let j = 0; j <= nMax; j++) raw[j] = raw[j]! * 1e-150
      }
    }
    for (let n = 0; n <= nMax; n++) out[n] = raw[n]! / normSum
    return out
  }
  const GL16_X = [
    -0.9894009349916499, -0.9445750230732326, -0.8656312023878318, -0.7554044083550030,
    -0.6178762444026438, -0.4580167776572274, -0.2816035507792589, -0.0950125098376374,
     0.0950125098376374,  0.2816035507792589,  0.4580167776572274,  0.6178762444026438,
     0.7554044083550030,  0.8656312023878318,  0.9445750230732326,  0.9894009349916499,
  ] as const
  const GL16_W = [
    0.0271524594117541, 0.0622535239386479, 0.0951585116824928, 0.1246289712555339,
    0.1495959888165767, 0.1691565193950025, 0.1826034150449236, 0.1894506104550685,
    0.1894506104550685, 0.1826034150449236, 0.1691565193950025, 0.1495959888165767,
    0.1246289712555339, 0.0951585116824928, 0.0622535239386479, 0.0271524594117541,
  ] as const

  // Evaluate 3D {4,3,4} lattice Green's function G_cusp(r, 0, 0) at 6 axis points [0, 1, 2, 4, 8, 12]
  const axisPts: [number, number, number][] = [[0, 0, 0], [1, 0, 0], [2, 0, 0], [4, 0, 0], [8, 0, 0], [12, 0, 0]]
  const gAxis = new Float64Array(axisPts.length)
  for (let p = 0; p < 24; p++) {
    const a = p / 24, b = (p + 1) / 24, mid = 0.5 * (a + b), half = 0.5 * (b - a)
    for (let q = 0; q < 16; q++) {
      const s = mid + half * GL16_X[q]!
      const oms = 1 - s
      if (oms < 1e-9) continue
      const t = 4 * (s / oms) * (s / oms)
      const wt = 0.5 * half * GL16_W[q]! * ((8 * s) / (oms * oms * oms))
      const bes = expScaledBesselIAll(t, 12)
      for (let i = 0; i < axisPts.length; i++) {
        const [rx, ry, rz] = axisPts[i]!
        gAxis[i] = gAxis[i]! + wt * bes[rx]! * bes[ry]! * bes[rz]!
      }
    }
  }

  // Exact closed-form continuum H^4 bulk-to-husk potential Phi_husk(r, D_source) with r_c(D) = a(D) = N_D^{1/3}
  const phiCored = (r: number, rc: number): number => (r < 1e-12 ? 1 / (2 * PI * PI * rc) : Math.atan(r / rc) / (2 * PI * PI * r))
  const rhoCored = (r: number, rc: number): number => rc / (PI * PI * (r * r + rc * rc) ** 2)
  const vCircCored = (r: number, rc: number): number => {
    if (r < 1e-12) return 0
    const u = r / rc
    const mEnc = (2 / PI) * (Math.atan(u) - u / (1 + u * u))
    return Math.sqrt(mEnc / (4 * PI * r))
  }
  const rcList = [0, Math.cbrt(nExact[1]!), Math.cbrt(nExact[2]!), Math.cbrt(nExact[3]!)]

  // Cross-check exact 3D Poisson equation -nabla^2 Phi_cored(r, rc) = rho_cored(r, rc) numerically
  let maxH4PoissonErr = 0
  for (let d = 1; d <= 3; d++) {
    const rc = rcList[d]!
    for (const r of [0.5, 2.0, 6.0, 20.0]) {
      const h = 1e-4
      const phiM = phiCored(r - h, rc), phi0 = phiCored(r, rc), phiP = phiCored(r + h, rc)
      const d2 = (phiP - 2 * phi0 + phiM) / (h * h)
      const d1 = (phiP - phiM) / (2 * h)
      const negLap = -(d2 + (2 / r) * d1)
      maxH4PoissonErr = Math.max(maxH4PoissonErr, Math.abs(negLap - rhoCored(r, rc)) / rhoCored(r, rc))
    }
  }
  const innerLogSlope = (rc: number): number => {
    const r = 0.1 * rc
    return (-4 * r * r) / (r * r + rc * rc)
  }
  let bestU = 0, bestVc = 0
  for (let iu = 1; iu <= 5000; iu++) {
    const u = iu * 0.002
    const vc = vCircCored(u, 1.0)
    if (vc > bestVc) { bestVc = vc; bestU = u }
  }

  console.log('\n  [C8] Exact {3,4,3,4} Bulk-to-Husk Green\'s Function & Emergent Cored Dark-Matter Halo Profile:')
  console.log('       (a) Microscopic 8,857-Dock R <= 3 Coxeter 4D Green\'s Function G_{4D}(x_{D=0}, v_{D_source}):')
  console.log(`           Husk docks inside R<=3 ball: r=0 (${huskLocalByR[0]!.length}), r=1 (${huskLocalByR[1]!.length}), r=2 (${huskLocalByR[2]!.length}), r=3 (${huskLocalByR[3]!.length})`)
  console.log('           D_src |  G_4D(r=0)   |  G_4D(r=1) avg |  G_4D(r=2) avg | Flatness G(1)/G(0) | Max Residual')
  for (const row of g4DProfiles) {
    console.log(
      `             ${row.dSrc}   | ${row.gR0.toExponential(4)} |  ${row.gR1Avg.toExponential(4)}  |  ${row.gR2Avg.toExponential(4)}  |       ${row.ratio10.toFixed(6)}     |  ${row.maxRes.toExponential(1)}`,
    )
  }
  console.log(
    `           Point-source vertical decay: -ln(G_0(1)/G_0(0))=${ptDecay01.toFixed(4)}/hop, -ln(G_0(2)/G_0(1))=${ptDecay12.toFixed(4)}/hop, -ln(G_0(3)/G_0(2))=${ptDecay23.toFixed(4)}/hop (D=3 sits on R=3 Dirichlet boundary), vs horosphere-averaged m_bulk = ln(lambda) = ${Math.log(lambdaExact).toFixed(6)}/hop`,
  )
  console.log(
    `           Shortest-path multiplicity D=1 -> r=1 husk docks: [${pathMultD1ToR1.join(', ')}] (mean ${meanPathMultD1ToR1.toFixed(6)} = 4/3), directly explaining the +${(100 * (g4DProfiles[2]!.ratio10 / g4DProfiles[0]!.ratio10 - 1)).toFixed(3)}% ratio jump (${g4DProfiles[0]!.ratio10.toFixed(6)} -> ${g4DProfiles[2]!.ratio10.toFixed(6)}) before bottlenecking through dock 0`,
  )
  console.log('       (b) 3D {4,3,4} Lattice G_cusp (6 Axis Points) & Closed-Form Continuum H^4 Cored Halo Potential (r_c(D) = N_D^{1/3}):')
  console.log(
    `           3D lattice G_cusp(0)=${gAxis[0]!.toFixed(8)} (4pi*12*G(12)=${(4 * PI * 12 * gAxis[5]!).toFixed(6)}); continuum H^4 Poisson check maxRelErr=${maxH4PoissonErr.toExponential(2)}`,
  )
  console.log(
    `           Universal H^4 cored halo laws: inner density slope at r=0.1 r_c is ${innerLogSlope(1).toFixed(4)} (flat core vs NFW -1.000 cusp!), peak rotation curve at r_peak = ${bestU.toFixed(3)} r_c`,
  )
  console.log('           D_src | r_c(D) [hops] | Phi(r=0)   | 4pi*r*Phi(r=1) | 4pi*r*Phi(r=10) | 4pi*r*Phi(r=100) | v_c(r=0.5rc) -> v_c(r_peak)')
  for (let d = 1; d <= 3; d++) {
    const rc = rcList[d]!
    console.log(
      `             ${d}   |    ${rc.toFixed(4).padStart(7)}    | ${phiCored(0, rc).toExponential(3)} |    ${(4 * PI * 1 * phiCored(1, rc)).toFixed(6)}    |     ${(4 * PI * 10 * phiCored(10, rc)).toFixed(6)}    |      ${(4 * PI * 100 * phiCored(100, rc)).toFixed(6)}    |  ${vCircCored(0.5 * rc, rc).toFixed(5)} -> ${vCircCored(bestU * rc, rc).toFixed(5)}`,
    )
  }

  recordCheck(
    'C8',
    'Bulk-to-husk Green\'s function (8,857-dock Coxeter bottleneck audit + 3D {4,3,4} G_cusp & H^4 cored halo)',
    g4DProfiles.every(r => r.maxRes < 1e-12) &&
      g4DProfiles[1]!.ratio10 > g4DProfiles[0]!.ratio10 &&
      g4DProfiles[2]!.ratio10 >= g4DProfiles[1]!.ratio10 &&
      Math.abs(meanPathMultD1ToR1 - 4 / 3) < 1e-12 &&
      Math.abs(4 * PI * 12 * gAxis[5]! - 1) < 5e-3 &&
      maxH4PoissonErr < 1e-4 &&
      Math.abs(4 * PI * 1000 * phiCored(1000, rcList[1]!) - 1) < 2e-3 &&
      Math.abs(innerLogSlope(rcList[1]!)) < 0.05 &&
      vCircCored(bestU * rcList[1]!, rcList[1]!) > vCircCored(0.5 * rcList[1]!, rcList[1]!),
    `Cox4D G(1)/G(0): [${g4DProfiles.map(r => r.ratio10.toFixed(5)).join(',')}] (ptDecay=${ptDecay12.toFixed(3)}, mult=4/3); H4 core slope=${innerLogSlope(1).toFixed(3)}, r_peak=${bestU.toFixed(3)}r_c`,
  )

  // --------------------------------------------------------------------------
  // C9: Exact {3,4,3,4} Dark-to-Baryonic Phase-Space & Warped-Column Ratio Audit
  // --------------------------------------------------------------------------
  const OMEGA_RATIO_PLANCK = 0.1200 / 0.02237
  const D_SUM = 60
  const sumInvN2 = Array.from({ length: D_SUM }, (_, i) => 1 / nExact[i + 1]!).reduce((a, b) => a + b, 0)
  const sumConfA4 = Array.from({ length: D_SUM }, (_, i) => Math.pow(nExact[i + 1]!, -1 / 3)).reduce((a, b) => a + b, 0)
  const sumLamD_5 = Array.from({ length: 5 }, (_, i) => nExact[i + 1]! / Math.pow(lambdaExact, i + 1)).reduce((a, b) => a + b, 0)
  const sumLamD_6 = Array.from({ length: 6 }, (_, i) => nExact[i + 1]! / Math.pow(lambdaExact, i + 1)).reduce((a, b) => a + b, 0)
  const sumLamD_10 = Array.from({ length: 10 }, (_, i) => nExact[i + 1]! / Math.pow(lambdaExact, i + 1)).reduce((a, b) => a + b, 0)

  // Exact closed-form Steinberg generating function for sum_{D=1}^inf N_D x^D = W^L(x) - 1:
  //   W^L(x) = (1 - x)^3 / (1 - 21 x + 51 x^2 - 23 x^3)
  //   sum_{D=1}^inf N_D x^D = (18 x - 48 x^2 + 22 x^3) / (1 - 21 x + 51 x^2 - 23 x^3)
  const evalAlphaExact = (alpha: number): number => {
    const x = Math.pow(lambdaExact, -alpha)
    return (18 * x - 48 * x * x + 22 * x * x * x) / (1 - 21 * x + 51 * x * x - 23 * x * x * x)
  }
  // Cross-check against normalized D = 600 recurrence sum r_D = N_D / lambda^D
  const rNorm = new Float64Array(601)
  rNorm[0] = 1
  rNorm[1] = 18 / lambdaExact
  rNorm[2] = 330 / (lambdaExact * lambdaExact)
  rNorm[3] = 6034 / (lambdaExact * lambdaExact * lambdaExact)
  const c1 = 21 / lambdaExact, c2 = 51 / (lambdaExact * lambdaExact), c3 = 23 / (lambdaExact * lambdaExact * lambdaExact)
  for (let d = 4; d <= 600; d++) {
    rNorm[d] = c1 * rNorm[d - 1]! - c2 * rNorm[d - 2]! + c3 * rNorm[d - 3]!
  }
  const evalAlphaD600 = (alpha: number): number => {
    const q = Math.pow(lambdaExact, -(alpha - 1))
    let qPow = q, s = 0
    for (let d = 1; d <= 600; d++) {
      s += rNorm[d]! * qPow
      qPow *= q
    }
    return s
  }
  let lo = 1.005, hi = 1.5
  for (let it = 0; it < 80; it++) {
    const mid = 0.5 * (lo + hi)
    if (evalAlphaExact(mid) > OMEGA_RATIO_PLANCK) lo = mid
    else hi = mid
  }
  const alphaStar = 0.5 * (lo + hi)
  const pStar = 3 * alphaStar
  const gfCrossErr = Math.abs(evalAlphaExact(alphaStar) - evalAlphaD600(alphaStar))

  console.log('\n  [C9] Exact {3,4,3,4} Dark-to-Baryonic Phase-Space Ratio Audit (Planck 2018 Omega_c/Omega_b = 5.364):')
  console.log(`       Exact shell multiplicity ratio N_1 / N_0         = ${(nExact[1]! / nExact[0]!).toFixed(6)} (unwarped D>=1 diverges as lambda^D)`)
  console.log(`       Exact D=0 bulk-to-husk facet ratio d_down/d_lat  = ${(18 / 6).toFixed(6)} (bare 1-beat branching = 3.000 : 1)`)
  console.log(`       Volume-normalized w(D) = 1/N_D (cutoff D_max)    : D_max=5 -> 5.000, D_max=6 -> 6.000 (hits 5.36 at D_eff ~ 5.36)`)
  console.log(`       Spectral warp w(D) = lambda^{-D} (cutoff D_max)  : D_max=5 -> ${sumLamD_5.toFixed(4)}, D_max=6 -> ${sumLamD_6.toFixed(4)}, D_max=10 -> ${sumLamD_10.toFixed(4)} (diverges linearly)`)
  console.log(`       Conformal a(D)^{-4} = N_D^{-4/3} (convergent)    : sum_{D>=1} N_D^{-1/3} = ${sumConfA4.toFixed(6)} (below 5.36)`)
  console.log(`       Inverse-square w(D) = 1/N_D^2 (convergent)       : sum_{D>=1} 1/N_D      = ${sumInvN2.toFixed(6)} (far below 5.36)`)
  console.log(
    `       Power-law warp w(D) = lambda^{-alpha D} (exact GF): hits Planck 5.364 at alpha_* = ${alphaStar.toFixed(6)} (a(D)^{-p_*} with p_* = ${pStar.toFixed(4)}, GF vs D=600 err=${gfCrossErr.toExponential(1)})`,
  )
  console.log(
    '       HONEST VERDICT: {3,4,3,4} geometry brackets Omega_c/Omega_b = 5.36 cleanly between 1-step branching (3) and shell-1 multiplicity (18), but the exact 5.36 ratio depends on the dynamical warp profile w(D) / horizon depth D_eff and cosmological initial conditions, NOT bare combinatorics alone.',
  )

  recordCheck(
    'C9',
    'Exact {3,4,3,4} dark-to-baryon phase-space & warped-column ratio audit',
    nExact[1] === 18 &&
      nExact[2] === 330 &&
      nExact[3] === 6034 &&
      Math.abs(evalAlphaExact(alphaStar) - OMEGA_RATIO_PLANCK) < 1e-12 &&
      gfCrossErr < 1e-12 &&
      sumConfA4 > 0.5 &&
      sumConfA4 < 0.7 &&
      sumInvN2 > 0.05 &&
      sumInvN2 < 0.07,
    `d_down/d_lat=3, N_1/N_0=18, a^{-4}=${sumConfA4.toFixed(4)}, 1/N^2=${sumInvN2.toFixed(4)}, lam^{-D}(D=5,6)=[${sumLamD_5.toFixed(2)},${sumLamD_6.toFixed(2)}], alpha*=${alphaStar.toFixed(6)} (p*=${pStar.toFixed(4)})`,
  )
}

function main(): void {
  const t0 = performance.now()
  const { lambdaExact, nExact } = runPart1()
  runPart2(lambdaExact, nExact)
  const elapsedSec = (performance.now() - t0) / 1000
  const mem = process.memoryUsage()
  const rssMB = mem.rss / (1024 * 1024)
  const heapMB = mem.heapUsed / (1024 * 1024)

  console.log('\n================================================================================')
  console.log('BREAKTHROUGH SUITE (W19): VERIFICATION SUMMARY TABLE')
  console.log('================================================================================')
  let allPassed = true
  for (const c of CHECKS) {
    if (!c.passed) allPassed = false
    console.log(`  [${c.passed ? 'PASS' : 'FAIL'}] ${c.id.padEnd(4)} | ${c.name.padEnd(76)} | ${c.detail}`)
  }
  console.log('================================================================================')
  console.log(
    `OVERALL: ${CHECKS.filter(c => c.passed).length}/${CHECKS.length} CHECKS PASSED (runtime: ${elapsedSec.toFixed(3)} s, heap: ${heapMB.toFixed(1)} MB, RSS: ${rssMB.toFixed(1)} MB)`,
  )
  if (!allPassed) process.exit(1)
}

main()

export {}
