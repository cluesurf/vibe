// Homogeneous Chiral Universality Verification Suite on 4D {3,4,3,4}
//
// Strictly standalone (ZERO external imports, ends with `export {}`), strictly deterministic
// (ZERO Math.random(), exact BigInt O^+(4,1; Z[sqrt(2)]) matrix arithmetic), strict TypeScript
// clean (--strict --noUncheckedIndexedAccess --noUnusedLocals --noUnusedParameters), and
// laptop-safe (< 10 s, < 200 MB RSS).
//
// SIX MACHINE-CERTIFIED VERIFICATION GATES (H1-H6):
//   GATE H1: Exact W(F_4)^+ Symmetry, Sharp Chirality Threshold (k=1 obstructed, k=2 resolved
//            with C_4 stabilizer & 0/331,776 equivariance defects, k=3 obstructed in full W(F_4)),
//            Flat Z^2 Horosphere Path-Independence (10x10 = 100 cells) & Zero Bounce Collisions
//            (600/600 pairwise distinct bounce neighbors disjoint from all 100 horosphere cells).
//   GATE H2: 5-Symbol U_univ^(5) = S_exch o L_univ^(5) Primitives (ZERO Special Origin Cell):
//            Exhaustive local bijection across all 144 pairs x 96 gate states (13,824 states) +
//            empty/catalyst/off-gate states, exact per-species conservation (N_P, N_A, N_B, N_R),
//            576-rotation W(F_4)^+-equivariance (0/6,912 defects), plus live 4D {3,4,3,4} runs:
//            closed 4x4 horosphere loop (T=16), simultaneous orthogonal crossover (T=4), and all 8
//            single-pulse Morita Rotary Element (RE) transitions (4 parallel + 4 perpendicular).
//   GATE H3: Live Multi-RE Reversible Circuits under 5-Symbol U_univ^(5) (ZERO Special Origin Cell):
//            3A: Live 1-RE Reversible Toggle Flip-Flop (2-pulse continuous run, T=30, SET + CARRY).
//            3B: Live 2-RE Mod-4 Reversible Binary Counter (00->01->10->11->00, 4-pulse continuous
//                run on 4D {3,4,3,4}, exact species conservation at every step, U^{-T} U^T = I).
//            3C: Live 2-Bit Reversible Controlled-Routing Switch (Fredkin/CNOT building block,
//                full 4-case (control, data) truth table live on {3,4,3,4}, exact U^{-T} U^T = I).
//   GATE H4: 15-Symbol U_strong^(15) Finite-Seed Homogeneous Strong Universality (ZERO Special Origin):
//            11 ray-counter species {M, W0, W1, W2, F, G, H, Fr, Gr, Hr, P} under exact S_exch-
//            conjugated lineRev12Exch + {A, B, R} + 3-R horosphere-to-bulk launcher (11-state
//            3+3+3+2 permutation); exhaustive bijectivity, N_occ conservation & W(F_4)^+-equivariance;
//            live 4D horosphere-to-bulk counter round-trips: INC (c=0..2, dt=10, returning q0 pulse
//            flips a live horosphere RE!), DEC (c=0..2, dt=6), and ZERO_TEST (c=0..3, t=t0+4c).
//   GATE H5: Adversarial Negative Controls:
//            (a) All 576 improper reflections W(F_4) \ W(F_4)^+ break L_univ5 equivariance (turner & RE),
//            (b) Bijectivity failure under single RE output mutation & 3-R 3-cycle leg collapse,
//            (c) Missing-turner leak off the horosphere into empty 4D hyperbolic bulk space.
//   GATE H6: Spectral Sharpness Summary Cross-Check (exact BigInt inequalities of Vibe.SpectralSharpExt:
//            913/80 < 387141227/33670000 <= 11.4982 < 11.5, width < 0.086, > 10.2x tighter than Depth-1,
//            lambda_gap >= 420938773/808080000 > 25/48 > 13/25 = 0.52).

const T_START_MS = performance.now()

interface CheckRow {
  readonly gate: string
  readonly id: string
  readonly name: string
  readonly passed: boolean
  readonly detail: string
}

const CHECKS: CheckRow[] = []

function recordCheck(gate: string, id: string, name: string, passed: boolean, detail: string): void {
  CHECKS.push({ gate, id, name, passed, detail })
  console.log(`  [${passed ? 'PASS' : 'FAIL'}] ${id} | ${name} :: ${detail}`)
}

// =================================================================================================
// 0. EXACT Z[sqrt(2)] O^+(4,1) MATRIX ARITHMETIC, D_4 ROOTS, AND W(F_4) / W(F_4)^+
// =================================================================================================

type Z2 = readonly [bigint, bigint] // a + b * sqrt(2)
type Vec5 = readonly [Z2, Z2, Z2, Z2, Z2]
type Mat5 = readonly [Vec5, Vec5, Vec5, Vec5, Vec5]
type Root4 = readonly [number, number, number, number]
type Mat4x2 = readonly [
  readonly [number, number, number, number],
  readonly [number, number, number, number],
  readonly [number, number, number, number],
  readonly [number, number, number, number],
]

const Z_ZERO: Z2 = [0n, 0n]
const Z_ONE: Z2 = [1n, 0n]
const Z_NEG_ONE: Z2 = [-1n, 0n]
const Z_TWO: Z2 = [2n, 0n]
const Z_NEG_SQRT2: Z2 = [0n, -1n]

const zAdd = (x: Z2, y: Z2): Z2 => [x[0] + y[0], x[1] + y[1]]
const zSub = (x: Z2, y: Z2): Z2 => [x[0] - y[0], x[1] - y[1]]
const zMul = (x: Z2, y: Z2): Z2 => [x[0] * y[0] + 2n * x[1] * y[1], x[0] * y[1] + x[1] * y[0]]
const zEq = (x: Z2, y: Z2): boolean => x[0] === y[0] && x[1] === y[1]

function matVec5(A: Mat5, v: Vec5): Vec5 {
  const out: Z2[] = new Array<Z2>(5)
  for (let i = 0; i < 5; i++) {
    const row = A[i]!
    let s = Z_ZERO
    for (let k = 0; k < 5; k++) s = zAdd(s, zMul(row[k]!, v[k]!))
    out[i] = s
  }
  return [out[0]!, out[1]!, out[2]!, out[3]!, out[4]!]
}

function matMul5(A: Mat5, B: Mat5): Mat5 {
  const rows: Vec5[] = []
  for (let i = 0; i < 5; i++) {
    const rA = A[i]!
    const row: Z2[] = new Array<Z2>(5)
    for (let j = 0; j < 5; j++) {
      let s = Z_ZERO
      for (let k = 0; k < 5; k++) s = zAdd(s, zMul(rA[k]!, B[k]![j]!))
      row[j] = s
    }
    rows.push([row[0]!, row[1]!, row[2]!, row[3]!, row[4]!])
  }
  return [rows[0]!, rows[1]!, rows[2]!, rows[3]!, rows[4]!]
}

const I5: Mat5 = [
  [Z_ONE, Z_ZERO, Z_ZERO, Z_ZERO, Z_ZERO],
  [Z_ZERO, Z_ONE, Z_ZERO, Z_ZERO, Z_ZERO],
  [Z_ZERO, Z_ZERO, Z_ONE, Z_ZERO, Z_ZERO],
  [Z_ZERO, Z_ZERO, Z_ZERO, Z_ONE, Z_ZERO],
  [Z_ZERO, Z_ZERO, Z_ZERO, Z_ZERO, Z_ONE],
]

function vec5Key(v: Vec5): string {
  return `${v[0][0]},${v[0][1]};${v[1][0]},${v[1][1]};${v[2][0]},${v[2][1]};${v[3][0]},${v[3][1]};${v[4][0]},${v[4][1]}`
}

function mat5Key(M: Mat5): string {
  return `${vec5Key(M[0])}|${vec5Key(M[1])}|${vec5Key(M[2])}|${vec5Key(M[3])}|${vec5Key(M[4])}`
}

const I5_KEY = mat5Key(I5)

// Exact Coxeter bilinear form 2*B for the {3,4,3,4} Coxeter diagram [3,4,3,4]
const B2: Mat5 = [
  [Z_TWO, Z_NEG_ONE, Z_ZERO, Z_ZERO, Z_ZERO],
  [Z_NEG_ONE, Z_TWO, Z_NEG_SQRT2, Z_ZERO, Z_ZERO],
  [Z_ZERO, Z_NEG_SQRT2, Z_TWO, Z_NEG_ONE, Z_ZERO],
  [Z_ZERO, Z_ZERO, Z_NEG_ONE, Z_TWO, Z_NEG_SQRT2],
  [Z_ZERO, Z_ZERO, Z_ZERO, Z_NEG_SQRT2, Z_TWO],
]

function inner2B(u: Vec5, v: Vec5): Z2 {
  const bv = matVec5(B2, v)
  let s = Z_ZERO
  for (let i = 0; i < 5; i++) s = zAdd(s, zMul(u[i]!, bv[i]!))
  return s
}

function refl5(n: Vec5): Mat5 {
  const bn = matVec5(B2, n)
  const rows: Vec5[] = []
  for (let i = 0; i < 5; i++) {
    const row: Z2[] = new Array<Z2>(5)
    for (let j = 0; j < 5; j++) {
      row[j] = zSub(i === j ? Z_ONE : Z_ZERO, zMul(n[i]!, bn[j]!))
    }
    rows.push([row[0]!, row[1]!, row[2]!, row[3]!, row[4]!])
  }
  return [rows[0]!, rows[1]!, rows[2]!, rows[3]!, rows[4]!]
}

function eVec5(idx: number): Vec5 {
  const out: Z2[] = [Z_ZERO, Z_ZERO, Z_ZERO, Z_ZERO, Z_ZERO]
  out[idx] = Z_ONE
  return [out[0]!, out[1]!, out[2]!, out[3]!, out[4]!]
}

// Ideal cusp null vector v_cusp satisfying <v_cusp, v_cusp>_{2B} = 0
const V_CUSP: Vec5 = [Z_ZERO, Z_ONE, [0n, 1n], [0n, 1n], Z_ONE]
// Exact timelike base 24-cell center (orthogonal to e0..e3 under B2, with <c, c>_{2B} = -2)
const BASE_CENTER: Vec5 = [[2n, 0n], [4n, 0n], [0n, 3n], [0n, 2n], [1n, 0n]]

// Generate all 24 facet normals of the fundamental 24-cell under the finite W(F_4) stabilizer <R0,R1,R2,R3>
const R_CELL_GENS: readonly Mat5[] = [0, 1, 2, 3].map(i => refl5(eVec5(i)))
const NORMALS: Vec5[] = []
{
  const seen = new Set<string>()
  const e4 = eVec5(4)
  const queue: Vec5[] = [e4]
  seen.add(vec5Key(e4))
  NORMALS.push(e4)
  let head = 0
  while (head < queue.length) {
    const cur = queue[head++]!
    for (const R of R_CELL_GENS) {
      const nxt = matVec5(R, cur)
      const k = vec5Key(nxt)
      if (!seen.has(k)) {
        seen.add(k)
        NORMALS.push(nxt)
        queue.push(nxt)
      }
    }
  }
}

const F5: readonly Mat5[] = NORMALS.map(n => refl5(n))

// Exact 24x24 D_4 Gram matrix G[a][b] = (<n_a, n_b>_{2B} + 2) / 2
let gramImagDefects = 0
const G: readonly (readonly number[])[] = NORMALS.map(na =>
  NORMALS.map(nb => {
    const ip = inner2B(na, nb)
    if (ip[1] !== 0n || (ip[0] + 2n) % 2n !== 0n) gramImagDefects++
    return Number((ip[0] + 2n) / 2n)
  }),
)

const ANTI: readonly number[] = G.map(row => row.indexOf(-2))
const LINES12: readonly (readonly [number, number])[] = (() => {
  const out: [number, number][] = []
  for (let s = 0; s < 24; s++) {
    const sb = ANTI[s]!
    if (s < sb) out.push([s, sb])
  }
  return out
})()

// Recover canonical 6 cusp facets L_cusp = {a : <n_a, v_cusp>_{2B} = 0} and 3 orthogonal octahedron pairs
const L_CUSP: number[] = []
for (let a = 0; a < 24; a++) {
  if (zEq(inner2B(NORMALS[a]!, V_CUSP), Z_ZERO)) L_CUSP.push(a)
}
const OCT_PAIRS: [number, number][] = []
{
  const used = new Set<number>()
  for (const a of L_CUSP) {
    if (used.has(a)) continue
    const b = L_CUSP.find(x => x !== a && G[a]![x] === 0)!
    OCT_PAIRS.push([a, b])
    used.add(a)
    used.add(b)
  }
}

const EP = OCT_PAIRS[0]![0]
const EM = OCT_PAIRS[0]![1]
const NP = OCT_PAIRS[1]![0]
const NM = OCT_PAIRS[1]![1]
const UP = OCT_PAIRS[2]![0]
const UM = OCT_PAIRS[2]![1]

// Canonical integer D_4 root vectors in Z^4
const ROOTS: readonly Root4[] = Array.from({ length: 24 }, (_, a) => [
  (G[a]![EP]! - G[a]![EM]!) / 2,
  (G[a]![NP]! - G[a]![NM]!) / 2,
  (G[a]![UP]! - G[a]![UM]!) / 2,
  (G[a]![EP]! + G[a]![EM]!) / 2,
])

const dot4 = (u: Root4, v: Root4): number =>
  u[0] * v[0] + u[1] * v[1] + u[2] * v[2] + u[3] * v[3]

// Exact integer 4x4 determinant via Bareiss / exact cofactor expansion (zero floating-point error!)
function det4Int(m: readonly [Root4, Root4, Root4, Root4]): number {
  const a00 = m[0][0], a01 = m[0][1], a02 = m[0][2], a03 = m[0][3]
  const a10 = m[1][0], a11 = m[1][1], a12 = m[1][2], a13 = m[1][3]
  const a20 = m[2][0], a21 = m[2][1], a22 = m[2][2], a23 = m[2][3]
  const a30 = m[3][0], a31 = m[3][1], a32 = m[3][2], a33 = m[3][3]
  const s0 = a00 * a11 - a10 * a01
  const s1 = a00 * a12 - a10 * a02
  const s2 = a00 * a13 - a10 * a03
  const s3 = a01 * a12 - a11 * a02
  const s4 = a01 * a13 - a11 * a03
  const s5 = a02 * a13 - a12 * a03
  const c5 = a22 * a33 - a32 * a23
  const c4 = a21 * a33 - a31 * a23
  const c3 = a21 * a32 - a31 * a22
  const c2 = a20 * a33 - a30 * a23
  const c1 = a20 * a32 - a30 * a22
  const c0 = a20 * a31 - a30 * a21
  return s0 * c5 - s1 * c4 + s2 * c3 + s3 * c2 - s4 * c1 + s5 * c0
}

// Generate full W(F_4) (order 1,152) in exact 2x-scaled integer 4x4 matrices, split into W(F_4)^+ (576) & W(F_4)^- (576)
interface WF4Data {
  readonly allPerms: readonly Uint8Array[]
  readonly properPerms: readonly Uint8Array[]
  readonly improperPerms: readonly Uint8Array[]
}

const WF4: WF4Data = (() => {
  const refl2 = (v: Root4): Mat4x2 => {
    const vv = dot4(v, v)
    const rows: [number, number, number, number][] = []
    for (let i = 0; i < 4; i++) {
      const r: [number, number, number, number] = [0, 0, 0, 0]
      for (let j = 0; j < 4; j++) {
        r[j] = (i === j ? 2 : 0) - (4 * v[i]! * v[j]!) / vv
      }
      rows.push(r)
    }
    return [rows[0]!, rows[1]!, rows[2]!, rows[3]!]
  }
  const mul2 = (A: Mat4x2, B: Mat4x2): Mat4x2 => {
    const rows: [number, number, number, number][] = []
    for (let i = 0; i < 4; i++) {
      const r: [number, number, number, number] = [0, 0, 0, 0]
      for (let j = 0; j < 4; j++) {
        r[j] =
          (A[i]![0] * B[0][j]! + A[i]![1] * B[1][j]! + A[i]![2] * B[2][j]! + A[i]![3] * B[3][j]!) / 2
      }
      rows.push(r)
    }
    return [rows[0]!, rows[1]!, rows[2]!, rows[3]!]
  }
  const apply2 = (M: Mat4x2, v: Root4): Root4 => [
    (M[0][0] * v[0] + M[0][1] * v[1] + M[0][2] * v[2] + M[0][3] * v[3]) / 2,
    (M[1][0] * v[0] + M[1][1] * v[1] + M[1][2] * v[2] + M[1][3] * v[3]) / 2,
    (M[2][0] * v[0] + M[2][1] * v[1] + M[2][2] * v[2] + M[2][3] * v[3]) / 2,
    (M[3][0] * v[0] + M[3][1] * v[1] + M[3][2] * v[2] + M[3][3] * v[3]) / 2,
  ]
  const matKey = (M: Mat4x2): string =>
    `${M[0].join(',')};${M[1].join(',')};${M[2].join(',')};${M[3].join(',')}`

  const gens: readonly Mat4x2[] = [
    refl2([1, -1, 0, 0]),
    refl2([0, 1, -1, 0]),
    refl2([0, 0, 1, 0]),
    refl2([1, 1, 1, 1]),
  ]
  const I2: Mat4x2 = [
    [2, 0, 0, 0],
    [0, 2, 0, 0],
    [0, 0, 2, 0],
    [0, 0, 0, 2],
  ]
  const map = new Map<string, Mat4x2>([[matKey(I2), I2]])
  const queue: Mat4x2[] = [I2]
  let head = 0
  while (head < queue.length) {
    const cur = queue[head++]!
    for (const g of gens) {
      const nxt = mul2(cur, g)
      const k = matKey(nxt)
      if (!map.has(k)) {
        map.set(k, nxt)
        queue.push(nxt)
      }
    }
  }

  const rootIdx = new Map<string, number>()
  for (let i = 0; i < 24; i++) rootIdx.set(ROOTS[i]!.join(','), i)

  const allPerms: Uint8Array[] = []
  const properPerms: Uint8Array[] = []
  const improperPerms: Uint8Array[] = []
  for (const M of map.values()) {
    const perm = new Uint8Array(24)
    for (let i = 0; i < 24; i++) perm[i] = rootIdx.get(apply2(M, ROOTS[i]!).join(','))!
    allPerms.push(perm)
    const d = det4Int(M)
    if (d === 16) properPerms.push(perm)
    else if (d === -16) improperPerms.push(perm)
  }
  return { allPerms, properPerms, improperPerms }
})()

// Precompute exact W(F_4)^+-equivariant pair tables for all 144 ordered orthogonal pairs (a, b)
interface PairTable {
  readonly a: number
  readonly b: number
  readonly Q: readonly [number, number, number, number]
  readonly P: readonly [number, number, number, number]
  readonly jq: Int8Array // port -> J^Q(port), -1 outside Q
  readonly jqInv: Int8Array
  readonly jq2: Int8Array
  readonly jp: Int8Array // port -> J^P(port), -1 outside P
  readonly jpInv: Int8Array
  readonly isPerp: Uint8Array // p * 24 + q -> 1 if q in perp(p) else 0
  readonly qOrderByP: ReadonlyMap<number, readonly [number, number, number, number]>
}

const PAIR_TABLES: (PairTable | null)[] = new Array<PairTable | null>(24 * 24).fill(null)
const ORTHO_PAIRS: [number, number][] = []

for (let a = 0; a < 24; a++) {
  for (let b = 0; b < 24; b++) {
    if (G[a]![b] !== 0) continue
    ORTHO_PAIRS.push([a, b])
    const qList: number[] = []
    const pList: number[] = []
    for (let i = 0; i < 24; i++) {
      if (G[i]![a] === 1 && G[i]![b] === 1) qList.push(i)
      else if (G[i]![a] === 0 && G[i]![b] === 0) pList.push(i)
    }
    const jq = new Int8Array(24).fill(-1)
    const jqInv = new Int8Array(24).fill(-1)
    const jq2 = new Int8Array(24).fill(-1)
    for (const q of qList) {
      const nxt = qList.find(q2 => det4Int([ROOTS[a]!, ROOTS[b]!, ROOTS[q]!, ROOTS[q2]!]) === 2)!
      jq[q] = nxt
      jqInv[nxt] = q
    }
    for (const q of qList) jq2[q] = jq[jq[q]!]!

    const jp = new Int8Array(24).fill(-1)
    const jpInv = new Int8Array(24).fill(-1)
    for (const p of pList) {
      const nxt = pList.find(p2 => det4Int([ROOTS[a]!, ROOTS[b]!, ROOTS[p]!, ROOTS[p2]!]) === 4)!
      jp[p] = nxt
      jpInv[nxt] = p
    }

    const isPerp = new Uint8Array(24 * 24)
    const qOrderByP = new Map<number, readonly [number, number, number, number]>()
    for (const p of pList) {
      // Unique q0 in Q with G[p][q0] = +1 and G[p][J^Q(q0)] = +1 (100% W(F_4)^+-equivariant!)
      const q0 = qList.find(q => G[p]![q] === 1 && G[p]![jq[q]!] === 1)!
      const q1 = jq[q0]!
      const q2 = jq[q1]!
      const q3 = jq[q2]!
      qOrderByP.set(p, [q0, q1, q2, q3])
      isPerp[p * 24 + q0] = 1
      isPerp[p * 24 + q2] = 1
    }

    PAIR_TABLES[a * 24 + b] = {
      a,
      b,
      Q: [qList[0]!, qList[1]!, qList[2]!, qList[3]!],
      P: [pList[0]!, pList[1]!, pList[2]!, pList[3]!],
      jq,
      jqInv,
      jq2,
      jp,
      jpInv,
      isPerp,
      qOrderByP,
    }
  }
}

function getPairTable(a: number, b: number): PairTable | null {
  return PAIR_TABLES[a * 24 + b] ?? null
}

// =================================================================================================
// 1. FLAT Z^2 HOROSPHERE MAP & FAST EXACT O^+(4,1; Z[sqrt(2)]) COXETER SIMULATOR
// =================================================================================================

type HoroDir = 'Xp' | 'Xm' | 'Yp' | 'Ym'

function horoW(X: number, Y: number): Mat5 {
  let w = I5
  let cx = 0
  let cy = 0
  while (cx < X) { w = matMul5(w, F5[(Math.abs(cx) & 1) === 0 ? EP : EM]!); cx++ }
  while (cx > X) { w = matMul5(w, F5[(Math.abs(cx) & 1) === 0 ? EM : EP]!); cx-- }
  while (cy < Y) { w = matMul5(w, F5[(Math.abs(cy) & 1) === 0 ? NP : NM]!); cy++ }
  while (cy > Y) { w = matMul5(w, F5[(Math.abs(cy) & 1) === 0 ? NM : NP]!); cy-- }
  return w
}

function horoW_YX(X: number, Y: number): Mat5 {
  let w = I5
  let cx = 0
  let cy = 0
  while (cy < Y) { w = matMul5(w, F5[(Math.abs(cy) & 1) === 0 ? NP : NM]!); cy++ }
  while (cy > Y) { w = matMul5(w, F5[(Math.abs(cy) & 1) === 0 ? NM : NP]!); cy-- }
  while (cx < X) { w = matMul5(w, F5[(Math.abs(cx) & 1) === 0 ? EP : EM]!); cx++ }
  while (cx > X) { w = matMul5(w, F5[(Math.abs(cx) & 1) === 0 ? EM : EP]!); cx-- }
  return w
}

function portOut(X: number, Y: number, dir: HoroDir): number {
  const xe = (Math.abs(X) & 1) === 0
  const ye = (Math.abs(Y) & 1) === 0
  if (dir === 'Xp') return xe ? EP : EM
  if (dir === 'Xm') return xe ? EM : EP
  if (dir === 'Yp') return ye ? NP : NM
  return ye ? NM : NP
}

function portIn(X: number, Y: number, dir: HoroDir): number {
  const opp: HoroDir = dir === 'Xp' ? 'Xm' : dir === 'Xm' ? 'Xp' : dir === 'Yp' ? 'Ym' : 'Yp'
  return portOut(X, Y, opp)
}

function dirOfOut(X: number, Y: number, port: number): HoroDir {
  if (portOut(X, Y, 'Xp') === port) return 'Xp'
  if (portOut(X, Y, 'Xm') === port) return 'Xm'
  if (portOut(X, Y, 'Yp') === port) return 'Yp'
  return 'Ym'
}

// Cached exact O^+(4,1; Z[sqrt(2)]) cell graph (every step still performs exact 5x5 BigInt matMul5 once!)
class ExactCoxeterGraph {
  readonly mats: Mat5[] = []
  readonly keys: string[] = []
  private readonly keyToId = new Map<string, number>()
  private readonly neighbors: Int32Array[] = []

  ensure(w: Mat5): number {
    const k = mat5Key(w)
    const existing = this.keyToId.get(k)
    if (existing !== undefined) return existing
    const id = this.mats.length
    this.mats.push(w)
    this.keys.push(k)
    this.keyToId.set(k, id)
    this.neighbors.push(new Int32Array(24).fill(-1))
    return id
  }

  step(id: number, s: number): number {
    const nb = this.neighbors[id]!
    const cached = nb[s]!
    if (cached !== -1) return cached
    const wN = matMul5(this.mats[id]!, F5[s]!)
    const nid = this.ensure(wN)
    nb[s] = nid
    this.neighbors[nid]![s] = id
    return nid
  }

  horoId(X: number, Y: number): number {
    return this.ensure(horoW(X, Y))
  }

  isOnHorosphere(id: number): boolean {
    const img = matVec5(this.mats[id]!, V_CUSP)
    for (let i = 0; i < 5; i++) if (!zEq(img[i]!, V_CUSP[i]!)) return false
    return true
  }

  lorentzHeight2(id: number): bigint {
    const img = matVec5(this.mats[id]!, BASE_CENTER)
    const h = inner2B(img, BASE_CENTER)
    return -h[0]
  }
}

type LocalRuleFn = (cell: Uint8Array, inverse: boolean) => Uint8Array

class SparseCoxeterSim {
  readonly graph: ExactCoxeterGraph
  private readonly rule: LocalRuleFn
  private readonly numSymbols: number
  cells = new Map<number, Uint8Array>()

  constructor(graph: ExactCoxeterGraph, rule: LocalRuleFn, numSymbols: number) {
    this.graph = graph
    this.rule = rule
    this.numSymbols = numSymbols
  }

  setPort(id: number, s: number, val: number): void {
    let arr = this.cells.get(id)
    if (!arr) {
      if (val === 0) return
      arr = new Uint8Array(24)
      this.cells.set(id, arr)
    }
    arr[s] = val
  }

  getPort(id: number, s: number): number {
    const arr = this.cells.get(id)
    return arr ? arr[s]! : 0
  }

  activeCellCount(): number {
    let cnt = 0
    for (const arr of this.cells.values()) {
      for (let i = 0; i < 24; i++) {
        if (arr[i] !== 0) { cnt++; break }
      }
    }
    return cnt
  }

  speciesCounts(): number[] {
    const c = new Array<number>(this.numSymbols).fill(0)
    for (const arr of this.cells.values()) {
      for (let i = 0; i < 24; i++) {
        const v = arr[i]!
        if (v !== 0) c[v] = c[v]! + 1
      }
    }
    return c
  }

  totalOccupied(): number {
    let tot = 0
    for (const arr of this.cells.values()) {
      for (let i = 0; i < 24; i++) if (arr[i] !== 0) tot++
    }
    return tot
  }

  snapshot(): string {
    const entries: string[] = []
    for (const [id, arr] of this.cells) {
      let any = false
      for (let i = 0; i < 24; i++) if (arr[i] !== 0) { any = true; break }
      if (any) entries.push(`${this.graph.keys[id]!}:${arr.join(',')}`)
    }
    entries.sort()
    return entries.join('|')
  }

  stepForward(): void {
    const next = new Map<number, Uint8Array>()
    for (const [id, arr] of this.cells) {
      let any = false
      for (let i = 0; i < 24; i++) if (arr[i] !== 0) { any = true; break }
      if (!any) continue
      const afterL = this.rule(arr, false)
      for (let s = 0; s < 24; s++) {
        const v = afterL[s]!
        if (v === 0) continue
        const nid = this.graph.step(id, s)
        let dst = next.get(nid)
        if (!dst) {
          dst = new Uint8Array(24)
          next.set(nid, dst)
        }
        dst[s] = v
      }
    }
    this.cells = next
  }

  stepBackward(): void {
    // S_exch is an exact involution: U^{-1} = L^{-1} o S_exch
    const afterS = new Map<number, Uint8Array>()
    for (const [id, arr] of this.cells) {
      let any = false
      for (let i = 0; i < 24; i++) if (arr[i] !== 0) { any = true; break }
      if (!any) continue
      for (let s = 0; s < 24; s++) {
        const v = arr[s]!
        if (v === 0) continue
        const pid = this.graph.step(id, s)
        let dst = afterS.get(pid)
        if (!dst) {
          dst = new Uint8Array(24)
          afterS.set(pid, dst)
        }
        dst[s] = v
      }
    }
    const prev = new Map<number, Uint8Array>()
    for (const [id, arr] of afterS) {
      const beforeL = this.rule(arr, true)
      let any = false
      for (let i = 0; i < 24; i++) if (beforeL[i] !== 0) { any = true; break }
      if (any) prev.set(id, beforeL)
    }
    this.cells = prev
  }
}

// =================================================================================================
// 2. SYMBOL CONSTANTS AND LOCAL RULES L_univ^(5) & L_strong^(15)
// =================================================================================================

// 5-symbol alphabet {0=EMPTY, 1=P, 2=A, 3=B, 4=R}
const EMPTY = 0
const PULSE = 1
const ANC_A = 2
const ANC_B = 3
const ROT_R = 4

// Additional 10 bulk ray-counter symbols for 15-symbol U_strong^(15)
const SP_M = 5
const SP_W0 = 6
const SP_W1 = 7
const SP_W2 = 8
const SP_F = 9
const SP_G = 10
const SP_H = 11
const SP_FR = 12
const SP_GR = 13
const SP_HR = 14

const isCat = (s: number): boolean => s === ANC_A || s === ANC_B || s === ROT_R

// Exact 5-symbol W(F_4)^+-equivariant local bijection L_univ^(5) (zero special origin cell!)
function applyLUniv5(cell: Uint8Array, inverse: boolean): Uint8Array {
  const out = Uint8Array.from(cell)
  let aPort = -1
  let aCnt = 0
  let bPort = -1
  let bCnt = 0
  for (let i = 0; i < 24; i++) {
    const v = cell[i]!
    if (v === ANC_A) { aPort = i; aCnt++ }
    else if (v === ANC_B) { bPort = i; bCnt++ }
  }
  if (aCnt === 1 && bCnt === 1 && G[aPort]![bPort] === 0) {
    const info = getPairTable(aPort, bPort)!
    let cleanQ = true
    for (let k = 0; k < 4; k++) if (isCat(cell[info.Q[k]!]!)) cleanQ = false
    let cleanP = true
    let rCnt = 0
    let pBar = -1
    for (let k = 0; k < 4; k++) {
      const p = info.P[k]!
      const v = cell[p]!
      if (v === ROT_R) { pBar = p; rCnt++ }
      else if (v !== EMPTY) cleanP = false
    }
    if (cleanQ && cleanP && (rCnt === 0 || rCnt === 1 || rCnt === 4)) {
      if (rCnt === 0) {
        // 0-R: Horosphere straight wire + orthogonal crossover (involution)
        for (let k = 0; k < 4; k++) {
          const q = info.Q[k]!
          out[info.jq2[q]!] = cell[q]!
        }
        return out
      }
      if (rCnt === 4) {
        // 4-R: 90-deg chiral turner on Q
        for (let k = 0; k < 4; k++) {
          const q = info.Q[k]!
          if (!inverse) out[info.jq[q]!] = cell[q]!
          else out[info.jqInv[q]!] = cell[q]!
        }
        return out
      }
      // 1-R: Morita Reversible Rotary Element (RE) on single-pulse sector of Q
      let pulseCnt = 0
      let qIn = -1
      for (let k = 0; k < 4; k++) {
        const q = info.Q[k]!
        if (cell[q] === PULSE) { qIn = q; pulseCnt++ }
      }
      if (pulseCnt !== 1) return out
      if (!inverse) {
        if (info.isPerp[pBar * 24 + qIn] === 1) {
          const qOut = info.jq[qIn]!
          const pNew = info.jp[pBar]! // RE bar rotation (L_univ5)
          out[qIn] = EMPTY
          out[qOut] = PULSE
          out[pBar] = EMPTY
          out[pNew] = ROT_R
        } else {
          const qOut = info.jq2[qIn]!
          out[qIn] = EMPTY
          out[qOut] = PULSE
        }
      } else {
        if (info.isPerp[pBar * 24 + qIn] === 1) {
          const qOrig = info.jqInv[qIn]!
          const pOrig = info.jpInv[pBar]!
          out[qIn] = EMPTY
          out[qOrig] = PULSE
          out[pBar] = EMPTY
          out[pOrig] = ROT_R
        } else {
          const qOrig = info.jq2[qIn]!
          out[qIn] = EMPTY
          out[qOrig] = PULSE
        }
      }
      return out
    }
  }
  // Empty / non-gate cell: swap non-catalyst antipodal pairs (speed-1 flight), bounce catalysts
  for (let l = 0; l < 12; l++) {
    const [sa, sb] = LINES12[l]!
    const va = cell[sa]!
    const vb = cell[sb]!
    if (!isCat(va) && !isCat(vb)) {
      out[sa] = vb
      out[sb] = va
    }
  }
  return out
}

// Exact 11-species ray-counter line rule in S_fwd coordinates (from Paper 0020 / turing-universality)
function lRevLineFwd(a: number, b: number): readonly [number, number] {
  if (a === EMPTY && b === EMPTY) return [EMPTY, EMPTY]
  if (b === EMPTY) {
    if (a === SP_M) return [EMPTY, SP_M]
    if (a === SP_W0) return [EMPTY, SP_W1]
    if (a === SP_W1) return [EMPTY, SP_W2]
    if (a === SP_W2) return [SP_W0, EMPTY]
    return [a, EMPTY]
  }
  if (a === EMPTY) {
    if (b === SP_M) return [SP_M, EMPTY]
    if (b === SP_W0) return [SP_W1, EMPTY]
    if (b === SP_W1) return [SP_W2, EMPTY]
    if (b === SP_W2) return [EMPTY, SP_W0]
    return [EMPTY, b]
  }
  // 9 reflection-symmetric 2-particle involutions (18 ordered pairs)
  if (a === SP_F && b === SP_M) return [SP_W0, SP_FR]
  if (a === SP_W0 && b === SP_FR) return [SP_F, SP_M]
  if (a === SP_M && b === SP_F) return [SP_FR, SP_W0]
  if (a === SP_FR && b === SP_W0) return [SP_M, SP_F]

  if (a === SP_G && b === SP_W1) return [SP_M, SP_GR]
  if (a === SP_M && b === SP_GR) return [SP_G, SP_W1]
  if (a === SP_W1 && b === SP_G) return [SP_GR, SP_M]
  if (a === SP_GR && b === SP_M) return [SP_W1, SP_G]

  if (a === SP_H && b === SP_M) return [SP_W1, SP_HR]
  if (a === SP_W1 && b === SP_HR) return [SP_H, SP_M]
  if (a === SP_M && b === SP_H) return [SP_HR, SP_W1]
  if (a === SP_HR && b === SP_W1) return [SP_M, SP_H]

  if (a === SP_G && b === SP_W2) return [SP_M, SP_FR]
  if (a === SP_M && b === SP_FR) return [SP_G, SP_W2]
  if (a === SP_W2 && b === SP_G) return [SP_FR, SP_M]
  if (a === SP_FR && b === SP_M) return [SP_W2, SP_G]

  if (a === PULSE && b === SP_M) return [SP_M, PULSE]
  if (a === SP_M && b === PULSE) return [PULSE, SP_M]

  return [a, b]
}

function lRevLineFwdInv(a: number, b: number): readonly [number, number] {
  if (a === EMPTY && b === EMPTY) return [EMPTY, EMPTY]
  if (b === EMPTY) {
    if (a === SP_M) return [EMPTY, SP_M]
    if (a === SP_W0) return [SP_W2, EMPTY]
    if (a === SP_W1) return [EMPTY, SP_W0]
    if (a === SP_W2) return [EMPTY, SP_W1]
    return [a, EMPTY]
  }
  if (a === EMPTY) {
    if (b === SP_M) return [SP_M, EMPTY]
    if (b === SP_W0) return [EMPTY, SP_W2]
    if (b === SP_W1) return [SP_W0, EMPTY]
    if (b === SP_W2) return [SP_W1, EMPTY]
    return [EMPTY, b]
  }
  return lRevLineFwd(a, b)
}

// Exact S_exch-conjugated ray-counter line bijection: L_exch(a, b) = L_fwd(b, a), L_exch^{-1}(a, b) = swap(L_fwd^{-1}(a, b))
function lineRev12Exch(a: number, b: number, inverse: boolean): readonly [number, number] {
  if (!inverse) return lRevLineFwd(b, a)
  const [ra, rb] = lRevLineFwdInv(a, b)
  return [rb, ra]
}

// Exact 15-symbol W(F_4)^+-equivariant local bijection L_strong^(15) (adds 3-R horosphere-to-bulk launcher)
function applyLStrong15(cell: Uint8Array, inverse: boolean): Uint8Array {
  const out = Uint8Array.from(cell)
  let aPort = -1
  let aCnt = 0
  let bPort = -1
  let bCnt = 0
  for (let i = 0; i < 24; i++) {
    const v = cell[i]!
    if (v === ANC_A) { aPort = i; aCnt++ }
    else if (v === ANC_B) { bPort = i; bCnt++ }
  }
  if (aCnt === 1 && bCnt === 1 && G[aPort]![bPort] === 0) {
    const info = getPairTable(aPort, bPort)!
    let cleanQ = true
    for (let k = 0; k < 4; k++) if (isCat(cell[info.Q[k]!]!)) cleanQ = false
    let rCnt = 0
    let pBar = -1
    let pEmpty = -1
    let pNonCatNonEmpty = 0
    let pHasOtherCat = false
    for (let k = 0; k < 4; k++) {
      const p = info.P[k]!
      const v = cell[p]!
      if (v === ROT_R) { pBar = p; rCnt++ }
      else if (isCat(v)) pHasOtherCat = true
      else {
        pEmpty = p
        if (v !== EMPTY) pNonCatNonEmpty++
      }
    }
    if (cleanQ && !pHasOtherCat) {
      if (rCnt === 0 && pNonCatNonEmpty === 0) {
        for (let k = 0; k < 4; k++) {
          const q = info.Q[k]!
          out[info.jq2[q]!] = cell[q]!
        }
        return out
      }
      if (rCnt === 4 && pNonCatNonEmpty === 0) {
        for (let k = 0; k < 4; k++) {
          const q = info.Q[k]!
          if (!inverse) out[info.jq[q]!] = cell[q]!
          else out[info.jqInv[q]!] = cell[q]!
        }
        return out
      }
      if (rCnt === 1 && pNonCatNonEmpty === 0) {
        let pulseCnt = 0
        let qIn = -1
        let allZeroOrPulse = true
        for (let k = 0; k < 4; k++) {
          const q = info.Q[k]!
          const v = cell[q]!
          if (v === PULSE) { qIn = q; pulseCnt++ }
          else if (v !== EMPTY) allZeroOrPulse = false
        }
        if (!allZeroOrPulse || pulseCnt !== 1) return out
        if (!inverse) {
          if (info.isPerp[pBar * 24 + qIn] === 1) {
            const qOut = info.jq[qIn]!
            const pNew = info.jp[pBar]!
            out[qIn] = EMPTY
            out[qOut] = PULSE
            out[pBar] = EMPTY
            out[pNew] = ROT_R
          } else {
            const qOut = info.jq2[qIn]!
            out[qIn] = EMPTY
            out[qOut] = PULSE
          }
        } else {
          if (info.isPerp[pBar * 24 + qIn] === 1) {
            const qOrig = info.jqInv[qIn]!
            const pOrig = info.jpInv[pBar]!
            out[qIn] = EMPTY
            out[qOrig] = PULSE
            out[pBar] = EMPTY
            out[pOrig] = ROT_R
          } else {
            const qOrig = info.jq2[qIn]!
            out[qIn] = EMPTY
            out[qOrig] = PULSE
          }
        }
        return out
      }
      if (rCnt === 3 && pEmpty !== -1) {
        // 3-R horosphere-to-bulk launcher: exact 11-state (3+3+3+2) permutation on (q0,q1,q2,q3,pEmpty)
        const [q0, q1, q2, q3] = info.qOrderByP.get(pEmpty)!
        const v0 = cell[q0]!
        const v1 = cell[q1]!
        const v2 = cell[q2]!
        const v3 = cell[q3]!
        const vp = cell[pEmpty]!
        const nonEmptyCount =
          (v0 !== EMPTY ? 1 : 0) +
          (v1 !== EMPTY ? 1 : 0) +
          (v2 !== EMPTY ? 1 : 0) +
          (v3 !== EMPTY ? 1 : 0) +
          (vp !== EMPTY ? 1 : 0)
        if (nonEmptyCount !== 1) return out
        if (!inverse) {
          // Forward 3-cycles + 2-cycle:
          // (q0=P)->(pEmpty=F)->(pEmpty=Fr)->(q0=P)
          // (q1=P)->(pEmpty=G)->(pEmpty=Gr)->(q1=P)
          // (q2=P)->(pEmpty=H)->(pEmpty=Hr)->(q2=P)
          // (q3=P)<->(pEmpty=P)
          if (v0 === PULSE) { out[q0] = EMPTY; out[pEmpty] = SP_F }
          else if (vp === SP_F) { out[pEmpty] = SP_FR }
          else if (vp === SP_FR) { out[pEmpty] = EMPTY; out[q0] = PULSE }
          else if (v1 === PULSE) { out[q1] = EMPTY; out[pEmpty] = SP_G }
          else if (vp === SP_G) { out[pEmpty] = SP_GR }
          else if (vp === SP_GR) { out[pEmpty] = EMPTY; out[q1] = PULSE }
          else if (v2 === PULSE) { out[q2] = EMPTY; out[pEmpty] = SP_H }
          else if (vp === SP_H) { out[pEmpty] = SP_HR }
          else if (vp === SP_HR) { out[pEmpty] = EMPTY; out[q2] = PULSE }
          else if (v3 === PULSE) { out[q3] = EMPTY; out[pEmpty] = PULSE }
          else if (vp === PULSE) { out[pEmpty] = EMPTY; out[q3] = PULSE }
        } else {
          // Exact inverse
          if (vp === SP_F) { out[pEmpty] = EMPTY; out[q0] = PULSE }
          else if (vp === SP_FR) { out[pEmpty] = SP_F }
          else if (v0 === PULSE) { out[q0] = EMPTY; out[pEmpty] = SP_FR }
          else if (vp === SP_G) { out[pEmpty] = EMPTY; out[q1] = PULSE }
          else if (vp === SP_GR) { out[pEmpty] = SP_G }
          else if (v1 === PULSE) { out[q1] = EMPTY; out[pEmpty] = SP_GR }
          else if (vp === SP_H) { out[pEmpty] = EMPTY; out[q2] = PULSE }
          else if (vp === SP_HR) { out[pEmpty] = SP_H }
          else if (v2 === PULSE) { out[q2] = EMPTY; out[pEmpty] = SP_HR }
          else if (vp === PULSE) { out[pEmpty] = EMPTY; out[q3] = PULSE }
          else if (v3 === PULSE) { out[q3] = EMPTY; out[pEmpty] = PULSE }
        }
        return out
      }
    }
  }
  // Empty / bulk ray / non-gate cell: exact S_exch-conjugated ray-counter line bijection on non-catalyst lines
  for (let l = 0; l < 12; l++) {
    const [sa, sb] = LINES12[l]!
    const va = cell[sa]!
    const vb = cell[sb]!
    if (!isCat(va) && !isCat(vb)) {
      const [oa, ob] = lineRev12Exch(va, vb, inverse)
      out[sa] = oa
      out[sb] = ob
    }
  }
  return out
}

// Helper: permute a 24-port cell under a W(F_4) permutation
function applyPermCell(perm: Uint8Array, cell: Uint8Array): Uint8Array {
  const out = new Uint8Array(24)
  for (let i = 0; i < 24; i++) out[perm[i]!] = cell[i]!
  return out
}

function cellsEqual(a: Uint8Array, b: Uint8Array): boolean {
  for (let i = 0; i < 24; i++) if (a[i] !== b[i]) return false
  return true
}

// Helper: place a homogeneous horosphere tile at (X, Y) with parity active at t = (X+Y) mod 2
type TileType = 'wire' | 'turnL' | 'turnR' | 're' | 'launcher3R'

function placeTile(
  sim: SparseCoxeterSim,
  X: number,
  Y: number,
  type: TileType,
  barIdx = 0,
): void {
  const id = sim.graph.horoId(X, Y)
  const even = (Math.abs(X + Y) & 1) === 0
  const infoUpUm = getPairTable(UP, UM)!
  let aPort = UP
  let bPort = UM
  if (type === 'turnL' || type === 'turnR') {
    const qInX = portIn(X, Y, 'Xp')
    const qJq = infoUpUm.jq[qInX]!
    const desired = type === 'turnL' ? portOut(X, Y, 'Yp') : portOut(X, Y, 'Ym')
    if (qJq !== desired) { aPort = UM; bPort = UP }
  }
  const tokens: [number, number][] = [
    [aPort, ANC_A],
    [bPort, ANC_B],
  ]
  if (type === 'turnL' || type === 'turnR') {
    for (let k = 0; k < 4; k++) tokens.push([infoUpUm.P[k]!, ROT_R])
  } else if (type === 're') {
    tokens.push([infoUpUm.P[barIdx]!, ROT_R])
  } else if (type === 'launcher3R') {
    // 3 R tokens on P \ {P[barIdx]}, leaving P[barIdx] open as the empty bulk launch port
    for (let k = 0; k < 4; k++) {
      if (k !== barIdx) tokens.push([infoUpUm.P[k]!, ROT_R])
    }
  }
  for (const [s, val] of tokens) {
    if (even) sim.setPort(id, s, val)
    else sim.setPort(sim.graph.step(id, s), s, val)
  }
}

// =================================================================================================
// GATE H1: EXACT W(F_4)^+ SYMMETRY, SHARP CHIRALITY THRESHOLD & HOROSPHERE GEOMETRY
// =================================================================================================

function runGateH1(): void {
  console.log('\n=================================================================================')
  console.log('GATE H1: EXACT W(F_4)^+ SYMMETRY, SHARP CHIRALITY THRESHOLD & HOROSPHERE GEOMETRY')
  console.log('=================================================================================')

  // H1.1: Exact 5x5 O^+(4,1; Z[sqrt(2)]) Coxeter reflections, 24x24 D_4 Gram isomorphism, W(F_4) & W(F_4)^+
  let invDefects = 0
  for (let a = 0; a < 24; a++) {
    if (mat5Key(matMul5(F5[a]!, F5[a]!)) !== I5_KEY) invDefects++
  }
  let d4GramDefects = 0
  for (let a = 0; a < 24; a++) {
    for (let b = 0; b < 24; b++) {
      if (dot4(ROOTS[a]!, ROOTS[b]!) !== G[a]![b]) d4GramDefects++
    }
  }
  let xyCommDefects = 0
  for (const x of [EP, EM]) {
    for (const y of [NP, NM]) {
      if (mat5Key(matMul5(F5[x]!, F5[y]!)) !== mat5Key(matMul5(F5[y]!, F5[x]!))) xyCommDefects++
    }
  }
  const h11Ok =
    NORMALS.length === 24 &&
    invDefects === 0 &&
    gramImagDefects === 0 &&
    d4GramDefects === 0 &&
    xyCommDefects === 0 &&
    WF4.allPerms.length === 1152 &&
    WF4.properPerms.length === 576 &&
    WF4.improperPerms.length === 576
  recordCheck(
    'H1',
    'H1.1',
    'Exact 5x5 O^+(4,1; Z[sqrt(2)]) reflections F_a^2=I_5, 24x24 D_4 Gram & W(F_4)/W(F_4)^+',
    h11Ok,
    `facets=${NORMALS.length}, F_a^2 defects=${invDefects}/24, D_4 Gram defects=${d4GramDefects}/576, |W(F_4)|=${WF4.allPerms.length}, |W(F_4)^+|=${WF4.properPerms.length}`,
  )

  // H1.2: Sharp Chirality Threshold (k=1 obstructed, k=2 resolved, k=3 obstructed in full W(F_4))
  // (i) k = 1 obstruction in W(F_4)^+: for EVERY facet a in 0..23 (and every orthogonal plane P(a,b)),
  //     there exists g in W(F_4)^+ fixing a pointwise while reversing 2D orientation on P(a,b) (det_2 = -1).
  let k1FacetsObstructed = 0
  let k1PlanesObstructed = 0
  let k1StabOrdersOk = true
  for (let a = 0; a < 24; a++) {
    const stabA = WF4.properPerms.filter(perm => perm[a] === a)
    if (stabA.length !== 24) k1StabOrdersOk = false
    let facetHasReverser = false
    for (let b = 0; b < 24; b++) {
      if (G[a]![b] !== 0) continue
      const info = getPairTable(a, b)!
      // Two orthogonal basis roots spanning the orthogonal signal plane P(a, b)
      const u = info.P[0]
      const v = info.jp[u]!
      let planeReversed = false
      for (const perm of stabA) {
        const gu = perm[u]!
        const gv = perm[v]!
        // Check perm preserves P(a, b) and compute exact 2D determinant in basis (u, v)
        if (info.jp[gu] === -1 || info.jp[gv] === -1) continue
        const det2x4 = G[u]![gu]! * G[v]![gv]! - G[u]![gv]! * G[v]![gu]!
        if (det2x4 === -4) {
          planeReversed = true
          break
        }
      }
      if (planeReversed) {
        k1PlanesObstructed++
        facetHasReverser = true
      }
    }
    if (facetHasReverser) k1FacetsObstructed++
  }

  // (ii) k = 2 resolution in W(F_4)^+: 144 ordered orthogonal pairs form ONE transitive orbit,
  //      pointwise stabilizer order 4 (cyclic C_4), disjoint Q(a,b) & P(a,b), 0/331,776 equivariance defects
  const orbitSet = new Set<number>()
  for (const perm of WF4.properPerms) {
    orbitSet.add(perm[UP]! * 24 + perm[UM]!)
  }
  let k2StabC4Ok = true
  let k2DisjointOk = true
  for (const [a, b] of ORTHO_PAIRS) {
    const info = getPairTable(a, b)!
    const qSet = new Set<number>(info.Q)
    const pSet = new Set<number>(info.P)
    if (qSet.size !== 4 || pSet.size !== 4) k2DisjointOk = false
    for (const q of qSet) if (pSet.has(q) || q === a || q === b) k2DisjointOk = false
    for (const p of pSet) if (p === a || p === b) k2DisjointOk = false
    const stabAB = WF4.properPerms.filter(perm => perm[a] === a && perm[b] === b)
    if (stabAB.length !== 4) {
      k2StabC4Ok = false
    } else {
      // Check cyclic C_4 generator (simultaneously realizes J^Q and J^P)
      const hasGen4 = stabAB.some(
        perm =>
          info.Q.every(q => perm[q] === info.jq[q]) &&
          info.P.every(p => perm[p] === info.jp[p]),
      )
      if (!hasGen4) k2StabC4Ok = false
    }
  }
  let jqEqDefects = 0
  let jpEqDefects = 0
  let eqChecks = 0
  for (const perm of WF4.properPerms) {
    for (let idx = 0; idx < ORTHO_PAIRS.length; idx++) {
      const [a, b] = ORTHO_PAIRS[idx]!
      const info = PAIR_TABLES[a * 24 + b]!
      const ga = perm[a]!
      const gb = perm[b]!
      const gInfo = PAIR_TABLES[ga * 24 + gb]!
      for (let k = 0; k < 4; k++) {
        const q = info.Q[k]!
        if (perm[info.jq[q]!] !== gInfo.jq[perm[q]!]) jqEqDefects++
        const p = info.P[k]!
        if (perm[info.jp[p]!] !== gInfo.jp[perm[p]!]) jpEqDefects++
        eqChecks++
      }
    }
  }

  // (iii) k = 3 obstruction in full W(F_4): for ALL 576 triples (0, b, c), an improper g (det=-1) fixes 0, b, c
  const impFixing0 = WF4.improperPerms.filter(perm => perm[0] === 0)
  let k3TriplesObstructed = 0
  for (let b = 0; b < 24; b++) {
    for (let c = 0; c < 24; c++) {
      if (impFixing0.some(perm => perm[b] === b && perm[c] === c)) k3TriplesObstructed++
    }
  }

  const h12Ok =
    k1StabOrdersOk &&
    k1FacetsObstructed === 24 &&
    k1PlanesObstructed === 144 &&
    ORTHO_PAIRS.length === 144 &&
    orbitSet.size === 144 &&
    k2StabC4Ok &&
    k2DisjointOk &&
    eqChecks === 331776 &&
    jqEqDefects === 0 &&
    jpEqDefects === 0 &&
    k3TriplesObstructed === 576
  recordCheck(
    'H1',
    'H1.2',
    'Sharp Chirality Threshold: k=1 obstructed (24/24), k=2 C_4 resolved (0/331,776), k=3 obstructed (576/576)',
    h12Ok,
    `k=1: ${k1FacetsObstructed}/24 facets (${k1PlanesObstructed}/144 planes); k=2: orbit=${orbitSet.size}/144, C_4=${k2StabC4Ok}, J^Q def=${jqEqDefects}/${eqChecks}, J^P def=${jpEqDefects}/${eqChecks}; k=3 full W(F_4): ${k3TriplesObstructed}/576 triples fixed by det=-1`,
  )

  // H1.3: Flat Z^2 horosphere path-independence (10x10 = 100 cells) & ZERO bounce collisions (600/600)
  const horoSet = new Set<string>()
  const bounceSet = new Set<string>()
  let pathDefects = 0
  let cuspFixedDefects = 0
  let bounceInHoro = 0
  const infoUpUm = getPairTable(UP, UM)!
  const bounceFacets: readonly number[] = [UP, UM, ...infoUpUm.P]
  const horoMats: Mat5[] = []
  for (let x = 0; x < 10; x++) {
    for (let y = 0; y < 10; y++) {
      const wXY = horoW(x, y)
      const wYX = horoW_YX(x, y)
      const kXY = mat5Key(wXY)
      if (kXY !== mat5Key(wYX)) pathDefects++
      // Also verify zigzag path x-y-x-y matches
      let wZig = I5
      let cx = 0
      let cy = 0
      while (cx < x || cy < y) {
        if (cx < x) { wZig = matMul5(wZig, F5[(cx & 1) === 0 ? EP : EM]!); cx++ }
        if (cy < y) { wZig = matMul5(wZig, F5[(cy & 1) === 0 ? NP : NM]!); cy++ }
      }
      if (kXY !== mat5Key(wZig)) pathDefects++
      const imgCusp = matVec5(wXY, V_CUSP)
      for (let i = 0; i < 5; i++) if (!zEq(imgCusp[i]!, V_CUSP[i]!)) cuspFixedDefects++
      horoSet.add(kXY)
      horoMats.push(wXY)
    }
  }
  for (const w of horoMats) {
    for (const s of bounceFacets) {
      const kb = mat5Key(matMul5(w, F5[s]!))
      if (horoSet.has(kb)) bounceInHoro++
      bounceSet.add(kb)
    }
  }
  const h13Ok =
    pathDefects === 0 &&
    cuspFixedDefects === 0 &&
    horoSet.size === 100 &&
    bounceSet.size === 600 &&
    bounceInHoro === 0
  recordCheck(
    'H1',
    'H1.3',
    'Flat Z^2 horosphere path-independence (10x10 = 100 cells) & zero bounce collisions (600/600)',
    h13Ok,
    `distinctHoro=${horoSet.size}/100, pathDefects=${pathDefects}, cuspDefects=${cuspFixedDefects}, distinctBounces=${bounceSet.size}/600, bounceInHoro=${bounceInHoro}`,
  )
}

// =================================================================================================
// GATE H2: 5-SYMBOL U_univ^(5) = S_exch o L_univ^(5) PRIMITIVES (ZERO SPECIAL ORIGIN CELL)
// =================================================================================================

function runGateH2(): void {
  console.log('\n=================================================================================')
  console.log('GATE H2: 5-SYMBOL U_univ^(5) = S_exch o L_univ^(5) PRIMITIVES (ZERO ORIGIN CELL)')
  console.log('=================================================================================')

  // H2.1: Exhaustive local bijection across all 144 pairs x 96 gate states (13,824 states) + empty/catalyst/off-gate
  let gateStatesTested = 0
  let bijDefects = 0
  let speciesDefects = 0
  const count5 = (c: Uint8Array): readonly [number, number, number, number] => {
    let np = 0, na = 0, nb = 0, nr = 0
    for (let i = 0; i < 24; i++) {
      const v = c[i]!
      if (v === PULSE) np++
      else if (v === ANC_A) na++
      else if (v === ANC_B) nb++
      else if (v === ROT_R) nr++
    }
    return [np, na, nb, nr]
  }
  const checkCellBijAndSpecies = (c: Uint8Array): void => {
    const fwd = applyLUniv5(c, false)
    const back1 = applyLUniv5(fwd, true)
    const inv = applyLUniv5(c, true)
    const back2 = applyLUniv5(inv, false)
    if (!cellsEqual(back1, c) || !cellsEqual(back2, c)) bijDefects++
    const cIn = count5(c)
    const cFwd = count5(fwd)
    const cInv = count5(inv)
    if (
      cIn[0] !== cFwd[0] || cIn[1] !== cFwd[1] || cIn[2] !== cFwd[2] || cIn[3] !== cFwd[3] ||
      cIn[0] !== cInv[0] || cIn[1] !== cInv[1] || cIn[2] !== cInv[2] || cIn[3] !== cInv[3]
    ) {
      speciesDefects++
    }
  }

  for (const [a, b] of ORTHO_PAIRS) {
    const info = getPairTable(a, b)!
    const rSets: readonly (readonly number[])[] = [
      [],
      [info.P[0]],
      [info.P[1]],
      [info.P[2]],
      [info.P[3]],
      info.P,
    ]
    for (const rSet of rSets) {
      for (let mask = 0; mask < 16; mask++) {
        const c = new Uint8Array(24)
        c[a] = ANC_A
        c[b] = ANC_B
        for (const p of rSet) c[p] = ROT_R
        for (let k = 0; k < 4; k++) if (((mask >> k) & 1) === 1) c[info.Q[k]!] = PULSE
        checkCellBijAndSpecies(c)
        gateStatesTested++
      }
    }
  }
  // Empty / free-flight / lone-catalyst antipodal line states (all 5x5 = 25 pairs) + off-gate (2-R, 3-R, non-ortho A/B)
  let nonGateStatesTested = 0
  for (let s1 = 0; s1 < 5; s1++) {
    for (let s2 = 0; s2 < 5; s2++) {
      const c = new Uint8Array(24)
      c[0] = s1
      c[ANTI[0]!] = s2
      checkCellBijAndSpecies(c)
      nonGateStatesTested++
    }
  }
  const info0 = getPairTable(UP, UM)!
  for (const extra of [
    // 2-R & 3-R off-gate catalyst patterns
    [[UP, ANC_A], [UM, ANC_B], [info0.P[0], ROT_R], [info0.P[1], ROT_R], [info0.Q[0], PULSE]],
    [[UP, ANC_A], [UM, ANC_B], [info0.P[0], ROT_R], [info0.P[1], ROT_R], [info0.P[2], ROT_R], [info0.Q[0], PULSE]],
    // Non-orthogonal A, B (G[UP][EP] = +1)
    [[UP, ANC_A], [EP, ANC_B], [NP, PULSE]],
    // Catalyst on Q
    [[UP, ANC_A], [UM, ANC_B], [info0.Q[0], ROT_R], [info0.Q[1], PULSE]],
  ] as const) {
    const c = new Uint8Array(24)
    for (const [s, v] of extra) c[s] = v
    checkCellBijAndSpecies(c)
    nonGateStatesTested++
  }

  // Exact 576-rotation W(F_4)^+-equivariance across 12 canonical gate states (576 x 12 = 6,912 checks)
  const canonCells: Uint8Array[] = []
  for (const rSet of [[], [info0.P[0]], info0.P] as readonly (readonly number[])[]) {
    for (let k = 0; k < 4; k++) {
      const c = new Uint8Array(24)
      c[UP] = ANC_A
      c[UM] = ANC_B
      for (const p of rSet) c[p] = ROT_R
      c[info0.Q[k]!] = PULSE
      canonCells.push(c)
    }
  }
  let symFwdDefects = 0
  let symInvDefects = 0
  let symChecks = 0
  for (const perm of WF4.properPerms) {
    for (const c of canonCells) {
      const lhsF = applyPermCell(perm, applyLUniv5(c, false))
      const rhsF = applyLUniv5(applyPermCell(perm, c), false)
      if (!cellsEqual(lhsF, rhsF)) symFwdDefects++
      const lhsI = applyPermCell(perm, applyLUniv5(c, true))
      const rhsI = applyLUniv5(applyPermCell(perm, c), true)
      if (!cellsEqual(lhsI, rhsI)) symInvDefects++
      symChecks++
    }
  }

  const h21Ok =
    gateStatesTested === 13824 &&
    bijDefects === 0 &&
    speciesDefects === 0 &&
    symChecks === 6912 &&
    symFwdDefects === 0 &&
    symInvDefects === 0
  recordCheck(
    'H2',
    'H2.1',
    'L_univ^(5) exhaustive bijection, per-species conservation & 576-rotation W(F_4)^+-equivariance',
    h21Ok,
    `tested=${gateStatesTested}+${nonGateStatesTested} states, bijDef=${bijDefects}, speciesDef=${speciesDefects}, W(F_4)^+ eqDef=${symFwdDefects}/${symChecks} (inv=${symInvDefects}/${symChecks})`,
  )

  const graph = new ExactCoxeterGraph()

  // H2.2: Live 4D {3,4,3,4} closed 4x4 horosphere loop (T = 16)
  const simLoop = new SparseCoxeterSim(graph, applyLUniv5, 5)
  for (let i = 1; i <= 3; i++) {
    placeTile(simLoop, i, 0, 'wire')
    placeTile(simLoop, 4, i, 'wire')
    placeTile(simLoop, i, 4, 'wire')
    placeTile(simLoop, 0, i, 'wire')
  }
  placeTile(simLoop, 0, 0, 'turnL')
  placeTile(simLoop, 4, 0, 'turnL')
  placeTile(simLoop, 4, 4, 'turnL')
  placeTile(simLoop, 0, 4, 'turnL')
  simLoop.setPort(graph.horoId(0, 0), portIn(0, 0, 'Ym'), PULSE)
  const loopSnap0 = simLoop.snapshot()
  const loopSpec0 = simLoop.speciesCounts().slice(1).join(',')
  let loopConsOk = true
  for (let t = 1; t <= 16; t++) {
    simLoop.stepForward()
    if (simLoop.speciesCounts().slice(1).join(',') !== loopSpec0) loopConsOk = false
  }
  const loopPeriodic = simLoop.snapshot() === loopSnap0
  for (let t = 1; t <= 16; t++) simLoop.stepBackward()
  const loopRev = simLoop.snapshot() === loopSnap0
  recordCheck(
    'H2',
    'H2.2',
    'Live 4D {3,4,3,4} closed 4x4 horosphere loop (T=16, periodic return & exact reversal)',
    loopPeriodic && loopRev && loopConsOk,
    `T=16, periodic=${loopPeriodic}, U^-16 U^16=I:${loopRev}, species(P,A,B,R)=[${loopSpec0}] conserved=${loopConsOk}, activeCells=${simLoop.activeCellCount()}`,
  )

  // H2.3: Live simultaneous orthogonal crossover at (0,0) (T = 4)
  const simCross = new SparseCoxeterSim(graph, applyLUniv5, 5)
  for (let x = -2; x <= 2; x++) placeTile(simCross, x, 0, 'wire')
  for (let y = -2; y <= 2; y++) if (y !== 0) placeTile(simCross, 0, y, 'wire')
  simCross.setPort(graph.horoId(-2, 0), portIn(-2, 0, 'Xp'), PULSE)
  simCross.setPort(graph.horoId(0, -2), portIn(0, -2, 'Yp'), PULSE)
  const crossSnap0 = simCross.snapshot()
  const crossSpec0 = simCross.speciesCounts().slice(1).join(',')
  let crossSimulAtOrigin = false
  let crossConsOk = true
  for (let t = 1; t <= 4; t++) {
    simCross.stepForward()
    if (simCross.speciesCounts().slice(1).join(',') !== crossSpec0) crossConsOk = false
    if (t === 2) {
      const originId = graph.horoId(0, 0)
      crossSimulAtOrigin =
        simCross.getPort(originId, portIn(0, 0, 'Xp')) === PULSE &&
        simCross.getPort(originId, portIn(0, 0, 'Yp')) === PULSE
    }
  }
  const crossOkX = simCross.getPort(graph.horoId(2, 0), portIn(2, 0, 'Xp')) === PULSE
  const crossOkY = simCross.getPort(graph.horoId(0, 2), portIn(0, 2, 'Yp')) === PULSE
  for (let t = 1; t <= 4; t++) simCross.stepBackward()
  const crossRev = simCross.snapshot() === crossSnap0
  recordCheck(
    'H2',
    'H2.3',
    'Live simultaneous orthogonal crossover at (0,0) (T=4, zero interference & exact reversal)',
    crossSimulAtOrigin && crossOkX && crossOkY && crossRev && crossConsOk,
    `simul@(0,0,t=2)=${crossSimulAtOrigin}, X_out=${crossOkX}, Y_out=${crossOkY}, U^-4 U^4=I:${crossRev}, species=[${crossSpec0}]`,
  )

  // H2.4: All 8 single-pulse Morita RE transitions (4 parallel + 4 perpendicular) verified LIVE on {3,4,3,4}
  let reParPassed = 0
  let rePerpPassed = 0
  let reAllRevOk = true
  let reAllConsOk = true
  const dirs: readonly HoroDir[] = ['Xp', 'Xm', 'Yp', 'Ym']
  const startCoordOf = (d: HoroDir): readonly [number, number] =>
    d === 'Xp' ? [-2, 0] : d === 'Xm' ? [2, 0] : d === 'Yp' ? [0, -2] : [0, 2]
  const endCoordOf = (d: HoroDir): readonly [number, number] =>
    d === 'Xp' ? [2, 0] : d === 'Xm' ? [-2, 0] : d === 'Yp' ? [0, 2] : [0, -2]

  for (const barIdx of [0, 1] as const) {
    const pBarInit = info0.P[barIdx]!
    for (const d of dirs) {
      const simRe = new SparseCoxeterSim(graph, applyLUniv5, 5)
      for (const x of [-2, -1, 1, 2]) placeTile(simRe, x, 0, 'wire')
      for (const y of [-2, -1, 1, 2]) placeTile(simRe, 0, y, 'wire')
      placeTile(simRe, 0, 0, 're', barIdx)
      const [sx, sy] = startCoordOf(d)
      simRe.setPort(graph.horoId(sx, sy), portIn(sx, sy, d), PULSE)

      const snap0 = simRe.snapshot()
      const spec0 = simRe.speciesCounts().slice(1).join(',')
      for (let t = 1; t <= 4; t++) {
        simRe.stepForward()
        if (simRe.speciesCounts().slice(1).join(',') !== spec0) reAllConsOk = false
      }
      const qIn0 = portIn(0, 0, d)
      const isPerpCase = info0.isPerp[pBarInit * 24 + qIn0] === 1
      const qOut0 = isPerpCase ? info0.jq[qIn0]! : info0.jq2[qIn0]!
      const expOutDir = dirOfOut(0, 0, qOut0)
      const [ex, ey] = endCoordOf(expOutDir)
      const expBar = isPerpCase ? info0.jp[pBarInit]! : pBarInit

      const pulseOk = simRe.getPort(graph.horoId(ex, ey), portIn(ex, ey, expOutDir)) === PULSE
      const barOk = simRe.getPort(graph.horoId(0, 0), expBar) === ROT_R
      for (let t = 1; t <= 4; t++) simRe.stepBackward()
      if (simRe.snapshot() !== snap0) reAllRevOk = false

      if (pulseOk && barOk) {
        if (isPerpCase) rePerpPassed++
        else reParPassed++
      }
    }
  }
  recordCheck(
    'H2',
    'H2.4',
    'All 8 single-pulse Morita RE transitions (4 parallel + 4 perpendicular) live on 4D {3,4,3,4}',
    reParPassed === 4 && rePerpPassed === 4 && reAllRevOk && reAllConsOk,
    `parallel=${reParPassed}/4, perp+barFlip=${rePerpPassed}/4, exactReversal=${reAllRevOk}, speciesConserved=${reAllConsOk}`,
  )
}

// =================================================================================================
// GATE H3: LIVE MULTI-RE REVERSIBLE CIRCUITS UNDER 5-SYMBOL U_univ^(5) (ZERO ORIGIN CELL)
// =================================================================================================

interface GateH3Metrics {
  readonly toggleT: number
  readonly toggleSpecies: string
  readonly mod4T: number
  readonly mod4Cells: number
  readonly mod4Species: string
  readonly mod4Events: string
  readonly switchT: number
  readonly switchSpecies: string
}

function runGateH3(): GateH3Metrics {
  console.log('\n=================================================================================')
  console.log('GATE H3: LIVE MULTI-RE REVERSIBLE CIRCUITS UNDER 5-SYMBOL U_univ^(5)')
  console.log('=================================================================================')

  const graph = new ExactCoxeterGraph()
  const info0 = getPairTable(UP, UM)!
  // Determine canonical barIdx=0 where in=Xp is PERP (flips 0->1, turns to Ym)
  let perpIdx = 0
  for (let bi = 0; bi < 4; bi++) {
    if (info0.isPerp[info0.P[bi]! * 24 + portIn(0, 0, 'Xp')] === 1) { perpIdx = bi; break }
  }
  const out0Dir = dirOfOut(0, 0, info0.jq[portIn(0, 0, 'Xp')]!) // Ym
  const outSign = out0Dir === 'Yp' ? 1 : -1 // -1
  const loopY = out0Dir === 'Yp' ? -2 : 2 // +2
  const turnLoop: TileType = loopY < 0 ? 'turnR' : 'turnL' // turnL

  // -----------------------------------------------------------------------------------------------
  // Circuit 3A: Live 1-RE Reversible Toggle Flip-Flop (2-pulse continuous run, T = 30)
  // -----------------------------------------------------------------------------------------------
  const simTog = new SparseCoxeterSim(graph, applyLUniv5, 5)
  for (let x = -18; x <= -1; x++) placeTile(simTog, x, 0, 'wire')
  placeTile(simTog, 0, 0, 're', perpIdx)
  for (let i = 1; i <= 18; i++) placeTile(simTog, 0, outSign * i, 'wire')
  placeTile(simTog, 1, 0, 'wire')
  placeTile(simTog, 2, 0, turnLoop)
  placeTile(simTog, 2, loopY / 2, 'wire')
  placeTile(simTog, 2, loopY, turnLoop)
  placeTile(simTog, 1, loopY, 'wire')
  placeTile(simTog, 0, loopY, turnLoop)
  placeTile(simTog, 0, loopY / 2, 'wire')

  simTog.setPort(graph.horoId(-2, 0), portIn(-2, 0, 'Xp'), PULSE)
  simTog.setPort(graph.horoId(-16, 0), portIn(-16, 0, 'Xp'), PULSE)
  const togSnap0 = simTog.snapshot()
  const togSpec0 = simTog.speciesCounts().slice(1).join(',')
  let togSetT = -1
  let togCarryT = -1
  let togConsOk = true
  const togT = 30
  for (let t = 1; t <= togT; t++) {
    simTog.stepForward()
    if (simTog.speciesCounts().slice(1).join(',') !== togSpec0) togConsOk = false
    if (simTog.getPort(graph.horoId(0, outSign * 4), portIn(0, outSign * 4, out0Dir)) === PULSE) togSetT = t
    if (simTog.getPort(graph.horoId(-4, 0), portIn(-4, 0, 'Xm')) === PULSE) togCarryT = t
  }
  const barAtEnd = info0.P.find(p => simTog.getPort(graph.horoId(0, 0), p) === ROT_R)
  const togBarReset = barAtEnd !== undefined && info0.isPerp[barAtEnd * 24 + portIn(0, 0, 'Xp')] === 1
  for (let t = 1; t <= togT; t++) simTog.stepBackward()
  const togRevOk = simTog.snapshot() === togSnap0

  recordCheck(
    'H3',
    'H3.1',
    'Circuit 3A: Live 1-RE Reversible Toggle Flip-Flop (2-pulse continuous run, T=30)',
    togSetT === 6 && togCarryT === 28 && togBarReset && togConsOk && togRevOk,
    `P1 SET(${out0Dir})@t=${togSetT}, P2 CARRY(Xm)@t=${togCarryT}, barReset=${togBarReset}, species(P,A,B,R)=[${togSpec0}] conserved=${togConsOk}, U^-30 U^30=I:${togRevOk}`,
  )

  // -----------------------------------------------------------------------------------------------
  // Circuit 3B: Live 2-RE Mod-4 Reversible Binary Counter (00 -> 01 -> 10 -> 11 -> 00)
  // Modular stack of 2 identical RE toggle stages at y=0 (RE0) and y=-6 (RE1),
  // separated by turnL routers at (-2, 0) and (-2, -6) with ZERO crossovers and ZERO origin cell!
  // 22-step pulse spacing yields exact settled binary progression 00 -> 01 -> 10 -> 11 -> 00!
  // -----------------------------------------------------------------------------------------------
  const simMod4 = new SparseCoxeterSim(graph, applyLUniv5, 5)
  const placeToggleStage = (yOff: number, outRunLen: number): void => {
    // Router at (-2, yOff): Ym(in) -> Xp(to RE), Xm(carry) -> Ym(down to next stage / carry_out)
    placeTile(simMod4, -2, yOff, 'turnL')
    placeTile(simMod4, -1, yOff, 'wire')
    placeTile(simMod4, 0, yOff, 're', perpIdx)
    // Feedback loop above RE: (1,yOff)->(2,yOff)[turnL]->(2,yOff+1)->(2,yOff+2)[turnL]->(1,yOff+2)->(0,yOff+2)[turnL]->(0,yOff+1)->(0,yOff)
    placeTile(simMod4, 1, yOff, 'wire')
    placeTile(simMod4, 2, yOff, 'turnL')
    placeTile(simMod4, 2, yOff + 1, 'wire')
    placeTile(simMod4, 2, yOff + 2, 'turnL')
    placeTile(simMod4, 1, yOff + 2, 'wire')
    placeTile(simMod4, 0, yOff + 2, 'turnL')
    placeTile(simMod4, 0, yOff + 1, 'wire')
    // out_k runway: (0, yOff-1) -> (0, yOff-2)[turnL: Ym->Xp] -> (1..outRunLen, yOff-2)
    placeTile(simMod4, 0, yOff - 1, 'wire')
    placeTile(simMod4, 0, yOff - 2, 'turnL')
    for (let x = 1; x <= outRunLen; x++) placeTile(simMod4, x, yOff - 2, 'wire')
  }

  for (let y = 1; y <= 70; y++) placeTile(simMod4, -2, y, 'wire')
  placeToggleStage(0, 108)
  for (let y = -5; y <= -1; y++) placeTile(simMod4, -2, y, 'wire')
  placeToggleStage(-6, 68)
  for (let y = -18; y <= -7; y++) placeTile(simMod4, -2, y, 'wire')

  // Inject 4 sequential pulses along x = -2 moving Ym, spaced by 22 steps (y = 2, 24, 46, 68)
  for (const yInit of [2, 24, 46, 68]) {
    simMod4.setPort(graph.horoId(-2, yInit), portIn(-2, yInit, 'Ym'), PULSE)
  }
  const m4Snap0 = simMod4.snapshot()
  const m4Spec0 = simMod4.speciesCounts().slice(1).join(',')
  const m4Cells0 = simMod4.activeCellCount()
  const m4BitAt = (yOff: number): number => {
    const id = graph.horoId(0, yOff)
    for (let k = 0; k < 4; k++) {
      const p = info0.P[k]!
      if (simMod4.getPort(id, p) === ROT_R) {
        return info0.isPerp[p * 24 + portIn(0, yOff, 'Xp')] === 1 ? 0 : 1
      }
    }
    return -1
  }

  const m4Out0: number[] = []
  const m4Out1: number[] = []
  const m4Carry: number[] = []
  const m4Seq: string[] = [`${m4BitAt(-6)}${m4BitAt(0)}`]
  let m4ConsOk = true
  const m4T = 108
  // Sample settled binary counter state (RE1, RE0) after each pulse: t = 12 (P1), 46 (P2), 56 (P3), 104 (P4)
  for (let t = 1; t <= m4T; t++) {
    simMod4.stepForward()
    if (simMod4.speciesCounts().slice(1).join(',') !== m4Spec0) m4ConsOk = false
    if (simMod4.getPort(graph.horoId(4, -2), portIn(4, -2, 'Xp')) === PULSE) m4Out0.push(t)
    if (simMod4.getPort(graph.horoId(4, -8), portIn(4, -8, 'Xp')) === PULSE) m4Out1.push(t)
    if (simMod4.getPort(graph.horoId(-2, -10), portIn(-2, -10, 'Ym')) === PULSE) m4Carry.push(t)
    if (t === 12 || t === 46 || t === 56 || t === 104) {
      m4Seq.push(`${m4BitAt(-6)}${m4BitAt(0)}`)
    }
  }
  for (let t = 1; t <= m4T; t++) simMod4.stepBackward()
  const m4RevOk = simMod4.snapshot() === m4Snap0

  const m4SeqStr = m4Seq.join('->')
  const m4EventsStr = `out0=[${m4Out0.join(',')}], out1=[${m4Out1.join(',')}], carry=[${m4Carry.join(',')}]`
  const h32Ok =
    m4SeqStr === '00->01->10->11->00' &&
    m4Out0.length === 2 &&
    m4Out1.length === 1 &&
    m4Carry.length === 1 &&
    m4ConsOk &&
    m4RevOk
  recordCheck(
    'H3',
    'H3.2',
    'Circuit 3B: Live 2-RE Mod-4 Reversible Binary Counter (00->01->10->11->00, T=108)',
    h32Ok,
    `states=${m4SeqStr}, ${m4EventsStr}, cells=${m4Cells0}, species(P,A,B,R)=[${m4Spec0}] conserved=${m4ConsOk}, U^-108 U^108=I:${m4RevOk}`,
  )

  // -----------------------------------------------------------------------------------------------
  // Circuit 3C: Live 2-Bit Reversible Controlled-Routing Switch (Fredkin/CNOT Building Block)
  // RE at (0,0) initialized to state 0:
  //   - Control enters from E (2,0) moving Xm -> hits (0,0) at t=2 -> flips 0->1, exits N (Yp)
  //   - Data enters from W (-6,0) moving Xp -> hits (0,0) at t=6:
  //       * control=0 (RE state 0): turns to Output A = S (0,-4) at t=10
  //       * control=1 (RE state 1): goes straight to Output B = E (4,0) at t=10
  // -----------------------------------------------------------------------------------------------
  let switchCasesOk = 0
  let switchRevOk = true
  let switchConsOk = true
  const switchT = 12
  let switchSpec11 = ''
  for (const ctrl of [0, 1] as const) {
    for (const data of [0, 1] as const) {
      const simSw = new SparseCoxeterSim(graph, applyLUniv5, 5)
      for (let x = -8; x <= 8; x++) if (x !== 0) placeTile(simSw, x, 0, 'wire')
      for (let y = -8; y <= 8; y++) if (y !== 0) placeTile(simSw, 0, y, 'wire')
      placeTile(simSw, 0, 0, 're', perpIdx)
      if (ctrl === 1) simSw.setPort(graph.horoId(2, 0), portIn(2, 0, 'Xm'), PULSE)
      if (data === 1) simSw.setPort(graph.horoId(-6, 0), portIn(-6, 0, 'Xp'), PULSE)
      const swSnap0 = simSw.snapshot()
      const swSpec0 = simSw.speciesCounts().slice(1).join(',')
      if (ctrl === 1 && data === 1) switchSpec11 = swSpec0

      let hitOutA = false
      let hitOutB = false
      let hitCtrlOut = false
      for (let t = 1; t <= switchT; t++) {
        simSw.stepForward()
        if (simSw.speciesCounts().slice(1).join(',') !== swSpec0) switchConsOk = false
        if (t === 10) {
          hitOutA = simSw.getPort(graph.horoId(0, -4), portIn(0, -4, 'Ym')) === PULSE
          hitOutB = simSw.getPort(graph.horoId(4, 0), portIn(4, 0, 'Xp')) === PULSE
          hitCtrlOut = simSw.getPort(graph.horoId(0, 8), portIn(0, 8, 'Yp')) === PULSE
        }
      }
      for (let t = 1; t <= switchT; t++) simSw.stepBackward()
      if (simSw.snapshot() !== swSnap0) switchRevOk = false

      const expA = data === 1 && ctrl === 0
      const expB = data === 1 && ctrl === 1
      const expC = ctrl === 1
      if (hitOutA === expA && hitOutB === expB && hitCtrlOut === expC) switchCasesOk++
    }
  }
  recordCheck(
    'H3',
    'H3.3',
    'Circuit 3C: Live 2-Bit Reversible Controlled-Routing Switch (all 4 (ctrl,data) cases, T=12)',
    switchCasesOk === 4 && switchRevOk && switchConsOk,
    `truthTable=${switchCasesOk}/4 (ctrl=0->OutA[S], ctrl=1->OutB[E]+CtrlOut[N]), species(1,1)=[${switchSpec11}] conserved=${switchConsOk}, U^-12 U^12=I:${switchRevOk}`,
  )

  return {
    toggleT: togT,
    toggleSpecies: togSpec0,
    mod4T: m4T,
    mod4Cells: m4Cells0,
    mod4Species: m4Spec0,
    mod4Events: m4EventsStr,
    switchT,
    switchSpecies: switchSpec11,
  }
}

// =================================================================================================
// GATE H4: 15-SYMBOL U_strong^(15) FINITE-SEED HOMOGENEOUS STRONG UNIVERSALITY (ZERO ORIGIN CELL)
// =================================================================================================

interface GateH4Metrics {
  readonly incSpacings: readonly number[]
  readonly decSpacings: readonly number[]
  readonly ztReturns: readonly number[]
  readonly incReFlips: number
}

function runGateH4(): GateH4Metrics {
  console.log('\n=================================================================================')
  console.log('GATE H4: 15-SYMBOL U_strong^(15) FINITE-SEED HOMOGENEOUS STRONG UNIVERSALITY')
  console.log('=================================================================================')

  // H4.1: Exhaustive bijectivity of lineRev12Exch (144/144), all 0/1/3/4-R sectors of L_strong^(15),
  //       exact N_occ conservation, and 576-rotation W(F_4)^+-equivariance (0 defects)
  const raySyms: readonly number[] = [
    EMPTY, PULSE, SP_M, SP_W0, SP_W1, SP_W2, SP_F, SP_G, SP_H, SP_FR, SP_GR, SP_HR,
  ]
  let lineBijDef = 0
  let lineIsoDef = 0
  let lineOccDef = 0
  for (const a of raySyms) {
    for (const b of raySyms) {
      const [oa, ob] = lineRev12Exch(a, b, false)
      const [ra, rb] = lineRev12Exch(oa, ob, true)
      const [ia, ib] = lineRev12Exch(a, b, true)
      const [fa, fb] = lineRev12Exch(ia, ib, false)
      if (ra !== a || rb !== b || fa !== a || fb !== b) lineBijDef++
      const [sa, sb] = lineRev12Exch(b, a, false)
      if (sa !== ob || sb !== oa) lineIsoDef++
      const occIn = (a !== EMPTY ? 1 : 0) + (b !== EMPTY ? 1 : 0)
      const occOut = (oa !== EMPTY ? 1 : 0) + (ob !== EMPTY ? 1 : 0)
      if (occIn !== occOut) lineOccDef++
    }
  }

  const info0 = getPairTable(UP, UM)!
  let strongBijDef = 0
  let strongOccDef = 0
  let strongStatesTested = 0
  const occOf = (c: Uint8Array): number => {
    let n = 0
    for (let i = 0; i < 24; i++) if (c[i] !== EMPTY) n++
    return n
  }
  const checkStrongCell = (c: Uint8Array): void => {
    const fwd = applyLStrong15(c, false)
    const back1 = applyLStrong15(fwd, true)
    const inv = applyLStrong15(c, true)
    const back2 = applyLStrong15(inv, false)
    if (!cellsEqual(back1, c) || !cellsEqual(back2, c)) strongBijDef++
    const n0 = occOf(c)
    if (occOf(fwd) !== n0 || occOf(inv) !== n0) strongOccDef++
    strongStatesTested++
  }

  // Test 0-R, 1-R, 4-R sectors on (UP, UM)
  for (const rSet of [[], [info0.P[0]], [info0.P[1]], [info0.P[2]], [info0.P[3]], info0.P] as readonly (readonly number[])[]) {
    for (let mask = 0; mask < 16; mask++) {
      const c = new Uint8Array(24)
      c[UP] = ANC_A
      c[UM] = ANC_B
      for (const p of rSet) c[p] = ROT_R
      for (let k = 0; k < 4; k++) if (((mask >> k) & 1) === 1) c[info0.Q[k]!] = PULSE
      checkStrongCell(c)
    }
  }
  // Test ALL 4 choices of pEmpty in 3-R sector across ALL 11 single-particle states + vacuum + 2-particle + bulk-M
  const launcherStates: Uint8Array[] = []
  for (let ei = 0; ei < 4; ei++) {
    const pEmpty = info0.P[ei]!
    const [q0, q1, q2, q3] = info0.qOrderByP.get(pEmpty)!
    const makeBase3R = (): Uint8Array => {
      const c = new Uint8Array(24)
      c[UP] = ANC_A
      c[UM] = ANC_B
      for (let k = 0; k < 4; k++) if (k !== ei) c[info0.P[k]!] = ROT_R
      return c
    }
    // Vacuum + 4 Q-pulses + 7 bulk ray launcher tokens + non-launcher bulk species M/W0 + 2-particle collisions
    checkStrongCell(makeBase3R())
    for (const q of [q0, q1, q2, q3]) {
      const c = makeBase3R()
      c[q] = PULSE
      checkStrongCell(c)
      if (ei === 0) launcherStates.push(c)
    }
    for (const sp of [SP_F, SP_FR, SP_G, SP_GR, SP_H, SP_HR, PULSE, SP_M, SP_W0]) {
      const c = makeBase3R()
      c[pEmpty] = sp
      checkStrongCell(c)
      if (ei === 0 && sp !== SP_M && sp !== SP_W0) launcherStates.push(c)
    }
    const c2 = makeBase3R()
    c2[q0] = PULSE
    c2[pEmpty] = SP_F
    checkStrongCell(c2)
  }

  // Exact 576-rotation W(F_4)^+-equivariance across all 11 active 3-R launcher states + 4 wire/turner/RE states
  const eqTestCells: Uint8Array[] = [...launcherStates]
  for (const rSet of [[], [info0.P[0]], info0.P] as readonly (readonly number[])[]) {
    const c = new Uint8Array(24)
    c[UP] = ANC_A
    c[UM] = ANC_B
    for (const p of rSet) c[p] = ROT_R
    c[info0.Q[0]!] = PULSE
    eqTestCells.push(c)
  }
  let strongSymDef = 0
  let strongSymChecks = 0
  for (const perm of WF4.properPerms) {
    for (const c of eqTestCells) {
      const lhs = applyPermCell(perm, applyLStrong15(c, false))
      const rhs = applyLStrong15(applyPermCell(perm, c), false)
      if (!cellsEqual(lhs, rhs)) strongSymDef++
      const lhsI = applyPermCell(perm, applyLStrong15(c, true))
      const rhsI = applyLStrong15(applyPermCell(perm, c), true)
      if (!cellsEqual(lhsI, rhsI)) strongSymDef++
      strongSymChecks++
    }
  }

  const h41Ok =
    lineBijDef === 0 &&
    lineIsoDef === 0 &&
    lineOccDef === 0 &&
    strongBijDef === 0 &&
    strongOccDef === 0 &&
    strongSymDef === 0 &&
    launcherStates.length === 11
  recordCheck(
    'H4',
    'H4.1',
    'L_strong^(15) lineRev12Exch (144/144), 0/1/3/4-R bijectivity, N_occ conservation & W(F_4)^+-equivariance',
    h41Ok,
    `rayLine(144): bij=${lineBijDef}, iso=${lineIsoDef}, occ=${lineOccDef}; gates(${strongStatesTested}): bij=${strongBijDef}, occ=${strongOccDef}; W(F_4)^+ eq(${strongSymChecks}x2): def=${strongSymDef}`,
  )

  // Build exact 4D hyperbolic bulk geodesic ray out of horosphere cell (0, 0) along pEmpty = info0.P[0]
  const graph = new ExactCoxeterGraph()
  const pEmpty = info0.P[0]
  const pAnti = ANTI[pEmpty]!
  const [q0, q1, q2, q3] = info0.qOrderByP.get(pEmpty)!
  const dir0 = dirOfOut(0, 0, q0)
  const dir1 = dirOfOut(0, 0, q1)
  const dir2 = dirOfOut(0, 0, q2)
  const dir3 = dirOfOut(0, 0, q3)

  const stepCoord = (d: HoroDir, dist: number): readonly [number, number] =>
    d === 'Xp' ? [dist, 0] : d === 'Xm' ? [-dist, 0] : d === 'Yp' ? [0, dist] : [0, -dist]
  const oppDir = (d: HoroDir): HoroDir =>
    d === 'Xp' ? 'Xm' : d === 'Xm' ? 'Xp' : d === 'Yp' ? 'Ym' : 'Yp'

  // Construct bulk ray ids w_0, w_1, ..., w_24
  const originId = graph.horoId(0, 0)
  const bulkRay: number[] = [originId]
  for (let n = 1; n <= 24; n++) {
    // At even depth n-1: outward facet is pEmpty; at odd depth n-1: outward facet is pAnti
    const outFacet = ((n - 1) & 1) === 0 ? pEmpty : pAnti
    bulkRay.push(graph.step(bulkRay[n - 1]!, outFacet))
  }
  // Verify bulk ray w_1..w_24 are pairwise distinct, strictly off the horosphere, and disjoint from launcher bounce cells
  const bulkSet = new Set<number>(bulkRay.slice(1))
  let bulkOffHoro = true
  for (let n = 1; n <= 24; n++) {
    if (graph.isOnHorosphere(bulkRay[n]!)) bulkOffHoro = false
  }
  const launcherBounces = new Set<number>([
    graph.step(originId, UP),
    graph.step(originId, UM),
    graph.step(originId, info0.P[1]),
    graph.step(originId, info0.P[2]),
    graph.step(originId, info0.P[3]),
  ])
  let bulkBounceOverlap = 0
  for (const id of bulkSet) if (launcherBounces.has(id)) bulkBounceOverlap++

  // Helper: place the 3-R launcher at (0,0) plus horosphere wire tracks along all 4 arms
  const buildLauncherSim = (armLen: number, placeReOnQ0: boolean): {
    readonly sim: SparseCoxeterSim
    readonly reBarInit: number
  } => {
    const sim = new SparseCoxeterSim(graph, applyLStrong15, 15)
    placeTile(sim, 0, 0, 'launcher3R', 0)
    for (const d of [dir0, dir1, dir2, dir3]) {
      for (let dist = 1; dist <= armLen; dist++) {
        const [x, y] = stepCoord(d, dist)
        if (placeReOnQ0 && d === dir0 && dist === 4) {
          // Place a live Morita RE at distance 4 along q0 arm oriented PERP to returning q0 pulse (dir0)!
          let reIdx = 0
          for (let bi = 0; bi < 4; bi++) {
            if (info0.isPerp[info0.P[bi]! * 24 + portIn(x, y, dir0)] === 1) { reIdx = bi; break }
          }
          placeTile(sim, x, y, 're', reIdx)
        } else {
          placeTile(sim, x, y, 'wire')
        }
      }
    }
    // Wire perpendicular exit arm from the RE at stepCoord(dir0, 4) so turned pulse stays on wire!
    let reBarInit = -1
    if (placeReOnQ0) {
      const [rx, ry] = stepCoord(dir0, 4)
      for (let bi = 0; bi < 4; bi++) {
        if (info0.isPerp[info0.P[bi]! * 24 + portIn(rx, ry, dir0)] === 1) { reBarInit = info0.P[bi]!; break }
      }
      const turnOutDir = dirOfOut(rx, ry, info0.jq[portIn(rx, ry, dir0)]!)
      for (let dist = 1; dist <= 16; dist++) {
        const [dx, dy] = stepCoord(turnOutDir, dist)
        placeTile(sim, rx + dx, ry + dy, 'wire')
      }
    }
    return { sim, reBarInit }
  }

  // H4.2: Live INC (c -> c+1) for c in {0, 1, 2} with returning q0 pulse flipping a live horosphere Morita RE!
  const incSpacings: number[] = []
  let incMarkerOk = true
  let incReFlips = 0
  let incOccOk = true
  let incRevOk = true

  for (const c of [0, 1, 2] as const) {
    const nStart = 8 + 2 * c
    const { sim, reBarInit } = buildLauncherSim(18, true)
    // Bulk marker M at even depth nStart on s_out(nStart) = pEmpty
    sim.setPort(bulkRay[nStart]!, pEmpty, SP_M)
    // Plain horosphere pulse P on q0 arm at dist=2 moving inward (hits (0,0) on q0 at t=2)
    const [x0, y0] = stepCoord(dir0, 2)
    sim.setPort(graph.horoId(x0, y0), portIn(x0, y0, oppDir(dir0)), PULSE)
    // Plain horosphere pulse P on q1 arm at dist=8 moving inward (hits (0,0) on q1 at t=8, exact +6 after q0!)
    const [x1, y1] = stepCoord(dir1, 8)
    sim.setPort(graph.horoId(x1, y1), portIn(x1, y1, oppDir(dir1)), PULSE)

    const snap0 = sim.snapshot()
    const occ0 = sim.totalOccupied()
    let tRetQ0 = -1
    let tRetQ1 = -1
    const [rx, ry] = stepCoord(dir0, 4)
    const reId = graph.horoId(rx, ry)
    const [p0x, p0y] = stepCoord(dir0, 2)
    const [p1x, p1y] = stepCoord(dir1, 2)
    const simT = 2 * nStart + 18

    for (let t = 1; t <= simT; t++) {
      sim.stepForward()
      if (sim.totalOccupied() !== occ0) incOccOk = false
      // Detect returning plain P exiting q0 at dist=2 moving outward (dir0)
      if (t > 4 && sim.getPort(graph.horoId(p0x, p0y), portIn(p0x, p0y, dir0)) === PULSE) tRetQ0 = t
      // Detect returning plain P exiting q1 at dist=2 moving outward (dir1)
      if (t > 10 && sim.getPort(graph.horoId(p1x, p1y), portIn(p1x, p1y, dir1)) === PULSE) tRetQ1 = t
    }
    const dt = tRetQ0 > 0 && tRetQ1 > 0 ? tRetQ1 - tRetQ0 : -1
    incSpacings.push(dt)
    if (sim.getPort(bulkRay[nStart + 2]!, pEmpty) !== SP_M) incMarkerOk = false
    const expFlippedBar = info0.jp[reBarInit]!
    if (sim.getPort(reId, expFlippedBar) === ROT_R) incReFlips++
    for (let t = 1; t <= simT; t++) sim.stepBackward()
    if (sim.snapshot() !== snap0) incRevOk = false
  }

  recordCheck(
    'H4',
    'H4.2',
    'Live 4D horosphere-to-bulk INC (c=0..2, dt=10) + returning pulse flips live horosphere RE',
    bulkSet.size === 24 &&
      bulkOffHoro &&
      bulkBounceOverlap === 0 &&
      incSpacings.every(x => x === 10) &&
      incMarkerOk &&
      incReFlips === 3 &&
      incOccOk &&
      incRevOk,
    `INC dt=[${incSpacings.join(',')}], bulkShift(+2)=${incMarkerOk}, horosphereREFlips=${incReFlips}/3, bulkRayDisjoint=${bulkSet.size === 24 && bulkOffHoro && bulkBounceOverlap === 0}, N_occConserved=${incOccOk}, exactRev=${incRevOk}`,
  )

  // H4.3: Live DEC (c+1 -> c) for c in {0, 1, 2}
  const decSpacings: number[] = []
  let decMarkerOk = true
  let decOccOk = true
  let decRevOk = true

  for (const c of [0, 1, 2] as const) {
    const nHi = 10 + 2 * c
    const { sim } = buildLauncherSim(20, false)
    sim.setPort(bulkRay[nHi]!, pEmpty, SP_M)
    // Plain P on q2 arm at dist=2 (arrives at (0,0) at t=2 -> H)
    const [x2, y2] = stepCoord(dir2, 2)
    sim.setPort(graph.horoId(x2, y2), portIn(x2, y2, oppDir(dir2)), PULSE)
    // Plain P on q1 arm at dist=12 (arrives at (0,0) at t=12, exact +10 after q2 -> G)
    const [x1, y1] = stepCoord(dir1, 12)
    sim.setPort(graph.horoId(x1, y1), portIn(x1, y1, oppDir(dir1)), PULSE)

    const snap0 = sim.snapshot()
    const occ0 = sim.totalOccupied()
    let tRetQ2 = -1
    let tRetQ0 = -1
    const [p2x, p2y] = stepCoord(dir2, 2)
    const [p0x, p0y] = stepCoord(dir0, 2)
    const simT = 2 * nHi + 14

    for (let t = 1; t <= simT; t++) {
      sim.stepForward()
      if (sim.totalOccupied() !== occ0) decOccOk = false
      if (t > 4 && sim.getPort(graph.horoId(p2x, p2y), portIn(p2x, p2y, dir2)) === PULSE) tRetQ2 = t
      if (t > 4 && sim.getPort(graph.horoId(p0x, p0y), portIn(p0x, p0y, dir0)) === PULSE) tRetQ0 = t
    }
    const dt = tRetQ2 > 0 && tRetQ0 > 0 ? tRetQ0 - tRetQ2 : -1
    decSpacings.push(dt)
    if (sim.getPort(bulkRay[nHi - 2]!, pEmpty) !== SP_M) decMarkerOk = false
    for (let t = 1; t <= simT; t++) sim.stepBackward()
    if (sim.snapshot() !== snap0) decRevOk = false
  }

  recordCheck(
    'H4',
    'H4.3',
    'Live 4D horosphere-to-bulk DEC (c=0..2, dt=6, exact -2 bulk shift & exact reversal)',
    decSpacings.every(x => x === 6) && decMarkerOk && decOccOk && decRevOk,
    `DEC dt=[${decSpacings.join(',')}], bulkShift(-2)=${decMarkerOk}, N_occConserved=${decOccOk}, exactRev=${decRevOk}`,
  )

  // H4.4: Live ZERO_TEST for c in {0, 1, 2, 3} (linear return t_ret = 20 + 4c at dist=2 along q3, M undisturbed)
  const ztReturns: number[] = []
  let ztMarkerOk = true
  let ztOccOk = true
  let ztRevOk = true

  for (const c of [0, 1, 2, 3] as const) {
    const nStart = 8 + 2 * c
    const { sim } = buildLauncherSim(10, false)
    sim.setPort(bulkRay[nStart]!, pEmpty, SP_M)
    const [x3, y3] = stepCoord(dir3, 2)
    sim.setPort(graph.horoId(x3, y3), portIn(x3, y3, oppDir(dir3)), PULSE)

    const snap0 = sim.snapshot()
    const occ0 = sim.totalOccupied()
    let tRetQ3 = -1
    const simT = 2 * nStart + 8

    for (let t = 1; t <= simT; t++) {
      sim.stepForward()
      if (sim.totalOccupied() !== occ0) ztOccOk = false
      if (t > 4 && sim.getPort(graph.horoId(x3, y3), portIn(x3, y3, dir3)) === PULSE) tRetQ3 = t
    }
    ztReturns.push(tRetQ3)
    if (sim.getPort(bulkRay[nStart]!, pEmpty) !== SP_M) ztMarkerOk = false
    for (let t = 1; t <= simT; t++) sim.stepBackward()
    if (sim.snapshot() !== snap0) ztRevOk = false
  }

  const ztLinearOk =
    ztReturns.length === 4 &&
    ztReturns[0] === 20 &&
    ztReturns[1] === 24 &&
    ztReturns[2] === 28 &&
    ztReturns[3] === 32
  recordCheck(
    'H4',
    'H4.4',
    'Live 4D horosphere-to-bulk ZERO_TEST (c=0..3, t_ret=20+4c, M undisturbed & exact reversal)',
    ztLinearOk && ztMarkerOk && ztOccOk && ztRevOk,
    `ZERO_TEST t_ret=[${ztReturns.join(',')}] (exact t_0+4c), M_undisturbed=${ztMarkerOk}, N_occConserved=${ztOccOk}, exactRev=${ztRevOk}`,
  )

  return { incSpacings, decSpacings, ztReturns, incReFlips }
}

// =================================================================================================
// GATE H5: ADVERSARIAL NEGATIVE CONTROLS
// =================================================================================================

function runGateH5(): void {
  console.log('\n=================================================================================')
  console.log('GATE H5: ADVERSARIAL NEGATIVE CONTROLS')
  console.log('=================================================================================')

  const info0 = getPairTable(UP, UM)!

  // H5.1: All 576 improper reflections W(F_4) \ W(F_4)^+ (det = -1) strictly break L_univ^(5) equivariance
  const turnerCell = new Uint8Array(24)
  turnerCell[UP] = ANC_A
  turnerCell[UM] = ANC_B
  for (let k = 0; k < 4; k++) turnerCell[info0.P[k]!] = ROT_R
  turnerCell[info0.Q[0]!] = PULSE

  const reCell = new Uint8Array(24)
  reCell[UP] = ANC_A
  reCell[UM] = ANC_B
  reCell[info0.P[0]!] = ROT_R
  const qPerp = info0.Q.find(q => info0.isPerp[info0.P[0]! * 24 + q] === 1)!
  reCell[qPerp] = PULSE

  let turnerBreaks = 0
  let reBreaks = 0
  for (const perm of WF4.improperPerms) {
    if (!cellsEqual(applyPermCell(perm, applyLUniv5(turnerCell, false)), applyLUniv5(applyPermCell(perm, turnerCell), false))) {
      turnerBreaks++
    }
    if (!cellsEqual(applyPermCell(perm, applyLUniv5(reCell, false)), applyLUniv5(applyPermCell(perm, reCell), false))) {
      reBreaks++
    }
  }
  recordCheck(
    'H5',
    'H5.1',
    'Reflection-breaking control: all 576 improper reflections det=-1 break L_univ^(5) (turner & RE)',
    turnerBreaks === 576 && reBreaks === 576,
    `improperBreaks: turner=${turnerBreaks}/576, RE=${reBreaks}/576 (chiral W(F_4)^+ is exact!)`,
  )

  // H5.2: Bijectivity-failure controls (mutated RE output port & collapsed 3-R 3-cycle leg)
  // (a) Mutate RE PERP transition so bar does NOT rotate (pNew = pBar instead of jp[pBar])
  const reMutImages = new Set<string>()
  let reSectorCount = 0
  for (let bi = 0; bi < 4; bi++) {
    const pBar = info0.P[bi]!
    for (let k = 0; k < 4; k++) {
      const qIn = info0.Q[k]!
      const out = new Uint8Array(24)
      out[UP] = ANC_A
      out[UM] = ANC_B
      if (info0.isPerp[pBar * 24 + qIn] === 1) {
        out[info0.jq[qIn]!] = PULSE
        out[pBar] = ROT_R // MUTATION: omitted jp[pBar] rotation -> collides with parallel state!
      } else {
        out[info0.jq2[qIn]!] = PULSE
        out[pBar] = ROT_R
      }
      reMutImages.add(out.join(','))
      reSectorCount++
    }
  }
  // (b) Collapse one leg of 3-R 3-cycle: map (pEmpty=F) -> (q0=P) instead of (pEmpty=Fr)
  const pEmpty = info0.P[0]
  const [q0, q1, q2, q3] = info0.qOrderByP.get(pEmpty)!
  const launcherInputs: readonly (readonly [number, number])[] = [
    [q0, PULSE], [pEmpty, SP_F], [pEmpty, SP_FR],
    [q1, PULSE], [pEmpty, SP_G], [pEmpty, SP_GR],
    [q2, PULSE], [pEmpty, SP_H], [pEmpty, SP_HR],
    [q3, PULSE], [pEmpty, PULSE],
  ]
  const launcherMutImages = new Set<string>()
  for (const [port, sym] of launcherInputs) {
    const c = new Uint8Array(24)
    c[UP] = ANC_A
    c[UM] = ANC_B
    for (let k = 1; k < 4; k++) c[info0.P[k]!] = ROT_R
    c[port] = sym
    const out = applyLStrong15(c, false)
    // Inject collapse mutation on (pEmpty = F) -> (q0 = P)
    if (port === pEmpty && sym === SP_F) {
      out[pEmpty] = EMPTY
      out[q0] = PULSE
    }
    launcherMutImages.add(out.join(','))
  }
  const h52Ok = reMutImages.size < reSectorCount && launcherMutImages.size < 11
  recordCheck(
    'H5',
    'H5.2',
    'Bijectivity-failure control: RE bar-freeze & 3-R 3-cycle leg collapse immediately break injectivity',
    h52Ok,
    `RE_mut images=${reMutImages.size}/${reSectorCount} (collisions=${reSectorCount - reMutImages.size}), 3R_mut images=${launcherMutImages.size}/11 (collisions=${11 - launcherMutImages.size})`,
  )

  // H5.3: Missing-turner leak control (removing corner (4,0) from 4x4 loop leaks pulse into empty 4D bulk!)
  const graph = new ExactCoxeterGraph()
  const simLeak = new SparseCoxeterSim(graph, applyLUniv5, 5)
  for (let i = 1; i <= 3; i++) {
    placeTile(simLeak, i, 0, 'wire')
    placeTile(simLeak, 4, i, 'wire')
    placeTile(simLeak, i, 4, 'wire')
    placeTile(simLeak, 0, i, 'wire')
  }
  placeTile(simLeak, 0, 0, 'turnL')
  // Intentionally OMIT corner turner at (4, 0)!
  placeTile(simLeak, 4, 4, 'turnL')
  placeTile(simLeak, 0, 4, 'turnL')
  simLeak.setPort(graph.horoId(0, 0), portIn(0, 0, 'Ym'), PULSE)
  const leakSnap0 = simLeak.snapshot()
  const leakSpec0 = simLeak.speciesCounts().slice(1).join(',')
  for (let t = 1; t <= 16; t++) simLeak.stepForward()
  const leakNotPeriodic = simLeak.snapshot() !== leakSnap0
  const leakConsOk = simLeak.speciesCounts().slice(1).join(',') === leakSpec0
  // Find the escaped PULSE cell at t=16 and confirm it left the horosphere into 4D hyperbolic bulk!
  let pulseCellId = -1
  for (const [id, arr] of simLeak.cells) {
    for (let s = 0; s < 24; s++) {
      if (arr[s] === PULSE) { pulseCellId = id; break }
    }
  }
  const escapedOffHorosphere = pulseCellId !== -1 && !graph.isOnHorosphere(pulseCellId)
  const escapedHeight2 = pulseCellId !== -1 ? graph.lorentzHeight2(pulseCellId) : 0n
  const h53Ok = leakNotPeriodic && leakConsOk && escapedOffHorosphere && escapedHeight2 > 1000000n
  recordCheck(
    'H5',
    'H5.3',
    'Missing-turner leak control: removing (4,0) leaks pulse off horosphere into empty 4D hyperbolic bulk',
    h53Ok,
    `periodic=${!leakNotPeriodic}, escapedOffHorosphere=${escapedOffHorosphere}, bulkLorentzCosh2(t=16)=${escapedHeight2.toString()}, speciesConserved=${leakConsOk}`,
  )
}

// =================================================================================================
// GATE H6: SPECTRAL SHARPNESS SUMMARY CROSS-CHECK (Vibe.SpectralSharpExt EXACT BIGINT INEQUALITIES)
// =================================================================================================

function runGateH6(): void {
  console.log('\n=================================================================================')
  console.log('GATE H6: SPECTRAL SHARPNESS SUMMARY CROSS-CHECK (Vibe.SpectralSharpExt)')
  console.log('=================================================================================')

  // Exact rational endpoints certified inside Lean 4 (Vibe.SpectralSharpExt Theorem 9):
  //   Depth-1 bracket: [11049/1000, 3325977059/278900000]
  //   Depth-2 bracket: [913/80, 387141227/33670000]
  const loNum = 913n
  const loDen = 80n
  const hiNum = 387141227n
  const hiDen = 33670000n
  const wNum = 57647040n
  const wDen = 673400000n
  const d1LoNum = 11049n
  const d1LoDen = 1000n
  const d1HiNum = 3325977059n
  const d1HiDen = 278900000n
  const walkDen = 808080000n
  const gapNum = 420938773n
  const d1GapNum = 3367622941n
  const d1GapDen = 6693600000n

  const c1 = d1LoNum * loDen < loNum * d1LoDen // 11.049 < 11.4125
  const c2 = loNum * hiDen < hiNum * loDen // 913/80 < 387141227/33670000
  const c3 = hiNum * 10000n < 114982n * hiDen // 387141227/33670000 < 11.4982
  const c4 = 114982n * 10n < 115n * 10000n && hiNum * 10n < 115n * hiDen // < 11.5
  const c5 = 115n * d1HiDen < d1HiNum * 10n // 11.5 < Depth-1 upper
  const c6 = (loNum * wDen + wNum * loDen) * hiDen === hiNum * loDen * wDen // exact width identity
  const c7 = wNum * 1000n < 86n * wDen // width < 0.086
  const c8 =
    102n * (hiNum * loDen - loNum * hiDen) * d1HiDen * d1LoDen <
    10n * (d1HiNum * d1LoDen - d1LoNum * d1HiDen) * hiDen * loDen // > 10.2x tighter than Depth-1
  const c9 = hiDen * 24n === walkDen && loDen * 24n === 1920n && hiNum + gapNum === walkDen
  const c10 =
    loNum * walkDen < hiNum * 1920n &&
    hiNum * 48n < 23n * walkDen &&
    1n * 25n < 13n * 2n &&
    13n * 48n < 25n * 25n &&
    25n * walkDen < gapNum * 48n &&
    gapNum * 1920n < 1007n * walkDen &&
    d1GapNum * walkDen < gapNum * d1GapDen

  const allExact = c1 && c2 && c3 && c4 && c5 && c6 && c7 && c8 && c9 && c10
  const hiFloat = Number(hiNum) / Number(hiDen)
  const wFloat = Number(wNum) / Number(wDen)
  const gapFloat = Number(gapNum) / Number(walkDen)
  const ratioFloat =
    (Number(d1HiNum) / Number(d1HiDen) - Number(d1LoNum) / Number(d1LoDen)) / wFloat
  recordCheck(
    'H6',
    'H6.1',
    'Vibe.SpectralSharpExt exact BigInt inequalities (rho bracket, width, >10.2x tightening & lambda_gap)',
    allExact,
    `rho in [11.4125, ${hiFloat.toFixed(6)}] (width=${wFloat.toFixed(6)} < 0.086, ${ratioFloat.toFixed(2)}x tighter than Depth-1), lambda_gap >= ${gapFloat.toFixed(6)} > 25/48 > 0.52`,
  )
}

// =================================================================================================
// MAIN EXECUTION & FAIL-CLOSED VERDICT
// =================================================================================================

function main(): void {
  console.log('=================================================================================')
  console.log('HOMOGENEOUS CHIRAL UNIVERSALITY ON 4D {3,4,3,4} — VERIFICATION SUITE (H1-H6)')
  console.log('=================================================================================')

  let h3Metrics: GateH3Metrics | null = null
  let h4Metrics: GateH4Metrics | null = null

  const runSafe = (gate: string, fn: () => void): void => {
    try {
      fn()
    } catch (err) {
      const msg = err instanceof Error ? err.message : String(err)
      recordCheck(gate, `${gate}.ERR`, `Unexpected exception in Gate ${gate}`, false, msg)
    }
  }

  runSafe('H1', () => runGateH1())
  runSafe('H2', () => runGateH2())
  runSafe('H3', () => { h3Metrics = runGateH3() })
  runSafe('H4', () => { h4Metrics = runGateH4() })
  runSafe('H5', () => runGateH5())
  runSafe('H6', () => runGateH6())

  const passedCount = CHECKS.filter(c => c.passed).length
  const failedChecks = CHECKS.filter(c => !c.passed)
  const elapsedMs = performance.now() - T_START_MS
  const rssMb = process.memoryUsage().rss / (1024 * 1024)

  console.log('\n=================================================================================')
  console.log('SUMMARY LEDGER')
  console.log('=================================================================================')
  if (h3Metrics !== null) {
    const m3: GateH3Metrics = h3Metrics
    console.log(`  H3 Toggle : T=${m3.toggleT}, species(P,A,B,R)=[${m3.toggleSpecies}]`)
    console.log(`  H3 Mod-4  : T=${m3.mod4T}, activeCells=${m3.mod4Cells}, species(P,A,B,R)=[${m3.mod4Species}], ${m3.mod4Events}`)
    console.log(`  H3 Switch : T=${m3.switchT}, species(1,1)=[${m3.switchSpecies}]`)
  }
  if (h4Metrics !== null) {
    const m4: GateH4Metrics = h4Metrics
    console.log(`  H4 Bulk   : INC dt=[${m4.incSpacings.join(',')}] (RE flips=${m4.incReFlips}/3), DEC dt=[${m4.decSpacings.join(',')}], ZT=[${m4.ztReturns.join(',')}]`)
  }
  console.log(
    `  RESULT: ${failedChecks.length === 0 ? 'PASSED' : 'FAILED'} | checks=${passedCount}/${CHECKS.length} | elapsed=${elapsedMs.toFixed(1)} ms | RSS=${rssMb.toFixed(1)} MB`,
  )
  console.log('=================================================================================')

  if (failedChecks.length > 0) {
    process.exit(1)
  }
}

main()

export {}
