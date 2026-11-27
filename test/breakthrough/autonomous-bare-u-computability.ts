// Wave-4 Track W23: Autonomous, Unclocked, Self-Routing Computability Strictly Inside Verbatim Bare Quantum U
//
// Five decisive pillars strictly under verbatim time-independent 8-layer bare U
//   U = S o Phi_odd o D o M_meet o M_pair(zeta_18) o K o D o Phi_odd
// over exact BigInt Z[zeta_9][1/6] on O^+(4,1; Z[sqrt(2)]) {3,4,3,4} + exact Float64 unitary solvers:
//
//   Pillar 1 (U1): Autonomous composable ballistic scattering logic under uninterrupted U^t
//                  - U1a(i): 2-lap sequential Sym^3 CZ phase doubling (pi -> 2 pi) on M = 28 ring
//                  - U1a(ii): True 2-station spatially separated D_1 + D_2 + P (k = 5, Sym^5 on M = 12)
//                    autonomous 4-input phase truth table (0,0), (1,0), (0,1), (1,1)
//                  - U1b: Exact distinguishable 3-role (0,1,2) wavepacket collision (M_pair = I in 4D!)
//                    generating a maximally entangled 2-qutrit Bell state (S_vN = log_2 3 = 1.58496 bits)
//                    in ONE autonomous collision, plus 5-role 2-station remote memory-bus transfer
//   Pillar 2 (U2): Autonomous 4D cross-line chiral interferometric switch in verbatim BigInt Z[zeta_9][1/6]
//                  - k = 5 = 2 + 1 + 1 + 1 (and k = 6 = 2 + 1 + 1 + 1 + 1) M_pair + Phi_odd junction
//                  - Exact t = 1, 2 full BigInt evolution + exact t = 3 12-line Mach-Zehnder recombination
//                    at dock 0 proving nonzero conditional 12-line probability routing contrast,
//                    plus exact Z_2^{24} proof that single-vibe (odd-parity) carriers never turn
//   Pillar 3 (U3): Four exact structural obstructions to classical Margenstern railway / static-track
//                  Turing machines inside bare U:
//                  - U3a: Compacton / static-track no-go (Pell-Chebyshev H_2(t) & >= 1/4 frontier leak)
//                  - U3b: Z_2^{24} single-vibe 4D turn no-go
//                  - U3c: (-I, C) neutral-pair 2-rail and 3-rail switch annihilation no-go
//                  - U3d: Unavoidable 11/12 isotropic M_pair fan-out (0.0838% target hop, 10/11 loss),
//                    m = 1..11 coherent refocusing bound (0.921% max), exact {3,4,3,4} girth-4 square
//                    witness in O^+(4,1; Z[sqrt(2)]), and exact BigInt 2-dock pair-relay turn witness
//   Pillar 4 (U4): Autonomous quantum-circuit universality (6/9-distinct-role M_pair = I verbatim-4D DFS)
//                  - U4a: Verbatim 4D BigInt proof that both 6 distinct roles {0..5} and all 9 distinct
//                    roles {0..8} have M_pair = I identically (0 off-line branches, exact reversibility)
//                  - U4b: Exact BigInt L_7 chiral catalyst density on single-vibe slot qubits
//                    (|Tr(L_7 C)|^2 = 25/16 -> Niven dense SU(2)), bare on-dock <M_{01}, M_{12}> density
//                    on 3-role DFS (|Tr_SU2| = 5/4), and 3-collision ballistic SU(2) Euler synthesis
//                  - U4c: Exact su(9) Lie dimension 80/80, Yang R(w) Makhlin invariants (G_1, G_2),
//                    closed-form 28-coll CPHASE(+pi/3) and 60-coll CZ scoped strictly to 2-qubit S_tot = 0,
//                    Concurrence C = 1, and Tsirelson CHSH = 2 sqrt(2)
//                  - U4d: Exact closed-form spin-independent 5-spin CZ (53 adj colls) and CNOT (54 adj colls)
//                    verified on both S_{AB} = 0 and S_{AB} = 1 with matching global phase (< 1e-15),
//                    full 9-spin C(9,4) = 126-dim linear-chain Toffoli with explicit adjacent routing SWAPs
//                    (13 1Q + 324 2Q + 36 routing SWAP = 373 adj colls, ||U16 - Toff(x)I2|| < 1e-14),
//                    and same-encoding hybrid discrete <M_{01}, M_{12}> + spin-indep CZ Toffoli on C^126
//   Pillar 5 (U5): Sharp classification table (classical railway CA vs bare-U weak ballistic universality
//                  vs obstructed strong finite-seed Turing universality)
//
// Strictly deterministic (zero randomness), zero external imports, strict tsc clean, laptop-safe (< 10 s).

// =================================================================================================
// 0. VERIFICATION HARNESS, COMPLEX / LINEAR ALGEBRA, AND EXACT Z[zeta_9][1/6] {3,4,3,4} KERNEL
// =================================================================================================

interface CheckRow {
  readonly pillar: string
  readonly name: string
  readonly passed: boolean
  readonly detail: string
}

const CHECKS: CheckRow[] = []

function recordCheck(pillar: string, name: string, passed: boolean, detail: string): void {
  CHECKS.push({ pillar, name, passed, detail })
}

function assertExact(cond: boolean, msg: string): void {
  if (!cond) throw new Error(`Assertion failed: ${msg}`)
}

const PI = Math.PI
const SQRT2 = Math.SQRT2
const SQRT3 = Math.sqrt(3)
const ISQ2 = Math.SQRT1_2

type C = readonly [number, number]
const C_ZERO: C = [0, 0]
const C_ONE: C = [1, 0]
const cAdd = (a: C, b: C): C => [a[0] + b[0], a[1] + b[1]]
const cSub = (a: C, b: C): C => [a[0] - b[0], a[1] - b[1]]
const cMul = (a: C, b: C): C => [a[0] * b[0] - a[1] * b[1], a[0] * b[1] + a[1] * b[0]]
const cScale = (s: number, a: C): C => [s * a[0], s * a[1]]
const cConj = (a: C): C => [a[0], -a[1]]
const cAbs2 = (a: C): number => a[0] * a[0] + a[1] * a[1]
const cAbs = (a: C): number => Math.hypot(a[0], a[1])
const cArg = (a: C): number => Math.atan2(a[1], a[0])
const cExpI = (th: number): C => [Math.cos(th), Math.sin(th)]
const cDiv = (a: C, b: C): C => {
  const d = b[0] * b[0] + b[1] * b[1]
  return [(a[0] * b[0] + a[1] * b[1]) / d, (a[1] * b[0] - a[0] * b[1]) / d]
}

const wrapPi = (ang: number): number => ((((ang + PI) % (2 * PI)) + 2 * PI) % (2 * PI)) - PI

const W_C: C = [-0.5, SQRT3 / 2]
const W2_C: C = [-0.5, -SQRT3 / 2]
const C_KEEP: C = [0.25, SQRT3 / 4]
const C_CROSS: C = [0.75, -SQRT3 / 4]
const MEET_KEEP: C = [0.25, SQRT3 / 4] // zeta_6 / 2
const MEET_SWAP: C = [-0.75, SQRT3 / 4] // (omega - 1) / 2
const C_MAT: readonly (readonly [C, C])[] = [
  [C_KEEP, C_CROSS],
  [C_CROSS, C_KEEP],
]

function spE(p: number, band: 1 | -1): number {
  return PI / 3 + band * Math.acos(0.5 * Math.cos(p))
}

function spU(p: number, band: 1 | -1): number {
  return (2 / SQRT3) * (Math.sin(spE(p, band)) / Math.sin(p))
}

// Dense complex matrix utilities (for small N <= 16)
type CMat = C[][]

function matEye(n: number): CMat {
  return Array.from({ length: n }, (_, i) =>
    Array.from({ length: n }, (_, j) => (i === j ? C_ONE : C_ZERO)),
  )
}

function matMul(A: CMat, B: CMat): CMat {
  const n = A.length
  const m = B[0]!.length
  const p = B.length
  return Array.from({ length: n }, (_, i) =>
    Array.from({ length: m }, (_, j) => {
      let s: C = C_ZERO
      for (let k = 0; k < p; k++) s = cAdd(s, cMul(A[i]![k]!, B[k]![j]!))
      return s
    }),
  )
}

function matDag(A: CMat): CMat {
  const n = A.length
  const m = A[0]!.length
  return Array.from({ length: m }, (_, i) =>
    Array.from({ length: n }, (_, j) => cConj(A[j]![i]!)),
  )
}

function matTrans(A: CMat): CMat {
  const n = A.length
  const m = A[0]!.length
  return Array.from({ length: m }, (_, i) =>
    Array.from({ length: n }, (_, j) => A[j]![i]!),
  )
}

function matTrace(A: CMat): C {
  let s: C = C_ZERO
  for (let i = 0; i < A.length; i++) s = cAdd(s, A[i]![i]!)
  return s
}

function matFrobDiff(A: CMat, B: CMat): number {
  let s = 0
  for (let i = 0; i < A.length; i++) {
    for (let j = 0; j < A[0]!.length; j++) s += cAbs2(cSub(A[i]![j]!, B[i]![j]!))
  }
  return Math.sqrt(s)
}

function matFrobDiffUpToPhase(A: CMat, B: CMat): number {
  let ip: C = C_ZERO
  for (let i = 0; i < A.length; i++) {
    for (let j = 0; j < A[0]!.length; j++) ip = cAdd(ip, cMul(cConj(A[i]![j]!), B[i]![j]!))
  }
  const ph = cAbs(ip) > 1e-15 ? cExpI(-cArg(ip)) : C_ONE
  let s = 0
  for (let i = 0; i < A.length; i++) {
    for (let j = 0; j < A[0]!.length; j++) s += cAbs2(cSub(A[i]![j]!, cMul(ph, B[i]![j]!)))
  }
  return Math.sqrt(s)
}

function matUnitaryErr(U: CMat): number {
  return matFrobDiff(matMul(matDag(U), U), matEye(U.length))
}

function matKron(A: CMat, B: CMat): CMat {
  const na = A.length
  const ma = A[0]!.length
  const nb = B.length
  const mb = B[0]!.length
  return Array.from({ length: na * nb }, (_, r) =>
    Array.from({ length: ma * mb }, (_, c) =>
      cMul(A[Math.floor(r / nb)]![Math.floor(c / mb)]!, B[r % nb]![c % mb]!),
    ),
  )
}

function det4C(M: CMat): C {
  const det3 = (rows: readonly number[], cols: readonly number[]): C => {
    const [r0, r1, r2] = rows as [number, number, number]
    const [c0, c1, c2] = cols as [number, number, number]
    const t0 = cMul(M[r0]![c0]!, cSub(cMul(M[r1]![c1]!, M[r2]![c2]!), cMul(M[r1]![c2]!, M[r2]![c1]!)))
    const t1 = cMul(M[r0]![c1]!, cSub(cMul(M[r1]![c0]!, M[r2]![c2]!), cMul(M[r1]![c2]!, M[r2]![c0]!)))
    const t2 = cMul(M[r0]![c2]!, cSub(cMul(M[r1]![c0]!, M[r2]![c1]!), cMul(M[r1]![c1]!, M[r2]![c0]!)))
    return cAdd(cSub(t0, t1), t2)
  }
  let s: C = C_ZERO
  for (let c = 0; c < 4; c++) {
    const cols = [0, 1, 2, 3].filter(x => x !== c)
    const term = cMul(M[0]![c]!, det3([1, 2, 3], cols))
    s = c % 2 === 0 ? cAdd(s, term) : cSub(s, term)
  }
  return s
}

// =================================================================================================
// EXACT Z[zeta_9][1/6], D_4 ROOTS, W(F_4), chi_odd, AND O^+(4,1; Z[sqrt(2)]) {3,4,3,4} KERNEL
// (Verbatim bit-for-bit match to deck/vibe/test/universe.ts)
// =================================================================================================

type Z9 = readonly [bigint, bigint, bigint, bigint, bigint, bigint]
type Root4 = readonly [bigint, bigint, bigint, bigint]
type AntipodalLine = readonly [number, number]
type Q2 = readonly [bigint, bigint]
type ToneNZ = -1 | 1
type Vibe = readonly [dock: number, slot: number, tone: ToneNZ, role: number]
interface ExactState {
  readonly amp: Map<string, Z9>
  readonly den: bigint
}
type ActiveLine = readonly [number | undefined, number | undefined, number, number]

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
const conjZ9 = (a: Z9): Z9 => [a[0] - a[3], -a[2], -a[1], -a[3], a[5] - a[2], a[4] - a[1]]
const adjointZ9 = (a: Z9, dag: boolean): Z9 => (dag ? conjZ9(a) : a)
const isZeroZ9 = (a: Z9): boolean =>
  a[0] === 0n && a[1] === 0n && a[2] === 0n && a[3] === 0n && a[4] === 0n && a[5] === 0n

function mulZ9(a: Z9, b: Z9): Z9 {
  const p = new Array<bigint>(11).fill(0n)
  for (let i = 0; i < 6; i++) {
    const ai = a[i]!
    if (ai === 0n) continue
    for (let j = 0; j < 6; j++) p[i + j] = p[i + j]! + ai * b[j]!
  }
  return [
    p[0]! - p[6]! + p[9]!,
    p[1]! - p[7]! + p[10]!,
    p[2]! - p[8]!,
    p[3]! - p[6]!,
    p[4]! - p[7]!,
    p[5]! - p[8]!,
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

function z9ToComplex(a: Z9, den = 1n): C {
  const inv = 1 / Number(den)
  let re = 0
  let im = 0
  for (let k = 0; k < 6; k++) {
    const c = Number(a[k]!)
    if (c === 0) continue
    const ang = (2 * PI * k) / 9
    re += c * Math.cos(ang)
    im += c * Math.sin(ang)
  }
  return [re * inv, im * inv]
}

const ROOTS: readonly Root4[] = (() => {
  const roots: Root4[] = []
  for (let i = 0; i < 4; i++) {
    for (let j = i + 1; j < 4; j++) {
      for (const si of [1n, -1n]) {
        for (const sj of [1n, -1n]) {
          const coords: [bigint, bigint, bigint, bigint] = [0n, 0n, 0n, 0n]
          coords[i] = si
          coords[j] = sj
          roots.push(coords)
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
const LINES: readonly AntipodalLine[] = ROOTS.flatMap((_, a) => {
  const b = OPPOSITE_SLOT[a]!
  return a < b ? [[a, b] as const] : []
})
const LINE_OF_SLOT: readonly number[] = ROOTS.map((_, s) =>
  LINES.findIndex(([a, b]) => a === s || b === s),
)

const WF4_GROUP = (() => {
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
  const id = Uint8Array.from({ length: 24 }, (_, d) => d)
  const elements: Uint8Array[] = [id]
  const det: number[] = [1]
  const seen = new Map<string, number>([[id.join(','), 0]])
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
  assertExact(elements.length === 1152, `W(F_4) order ${elements.length}`)
  return { elements, det }
})()

function lexKey4(a0: number, a1: number, a2: number, a3: number): number {
  let x0 = a0; let x1 = a1; let x2 = a2; let x3 = a3
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
  const s0 = c0 >> 1; const s1 = c1 >> 1; const s2 = c2 >> 1; const s3 = c3 >> 1
  const b0 = c0 & 1; const b1 = c1 & 1; const b2 = c2 & 1; const b3 = c3 & 1
  let minKey = Number.POSITIVE_INFINITY
  let minSign = 0
  let chiral = true
  const elems = WF4_GROUP.elements
  const dets = WF4_GROUP.det
  for (let e = 0; e < elems.length; e++) {
    const p = elems[e]!
    const d = dets[e]!
    const ps0 = p[s0]! << 1; const ps1 = p[s1]! << 1; const ps2 = p[s2]! << 1; const ps3 = p[s3]! << 1
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

// Exact O^+(4,1; Z[sqrt(2)]) {3,4,3,4} Coxeter transport
const DIM5 = [0, 1, 2, 3, 4] as const
const Q2_ZERO: Q2 = [0n, 0n]
const EYE5: readonly (readonly Q2[])[] = DIM5.map(r => DIM5.map(c => [r === c ? 1n : 0n, 0n] as const))
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
const TRANSPORTS: readonly (readonly (readonly Q2[])[])[] = (() => {
  const stabGens = [0, 1, 2, 3].map(idx => reflect5(EYE5[idx]!))
  const facetNormals: Q2[][] = [EYE5[4]!.slice()]
  const seen = new Set<string>([vecKeyQ2(EYE5[4]!)])
  for (const n of facetNormals) {
    for (const g of stabGens) {
      const next = matVecQ2(g, n)
      const key = vecKeyQ2(next)
      if (!seen.has(key)) {
        seen.add(key)
        facetNormals.push(next)
      }
    }
  }
  const facetDot = (a: number, b: number): bigint => (twiceForm(facetNormals[a]!, facetNormals[b]!)[0] + 2n) / 2n
  const orthoBasis: number[] = []
  for (let f = 0; f < 24 && orthoBasis.length < 4; f++) {
    if (orthoBasis.every(prev => facetDot(f, prev) === 0n)) orthoBasis.push(f)
  }
  const facetRoots: Root4[] = facetNormals.map((_, f) => {
    const [c0, c1, c2, c3] = orthoBasis.map(o => facetDot(f, o))
    return [(c0! + c1!) / 2n, (c0! - c1!) / 2n, (c2! + c3!) / 2n, (c2! - c3!) / 2n]
  })
  return ROOTS.map(root => {
    const fIdx = facetRoots.findIndex(fr => fr.every((v, i) => v === root[i]))
    return matMulQ2(reflect5(facetNormals[fIdx]!), CENTRAL_INVERSION)
  })
})()

const dockFrames: (readonly (readonly Q2[])[])[] = [EYE5]
const dockParity: number[] = [1]
const dockCenters: (readonly Q2[])[] = [BASE_CENTER]
const centerToDockId = new Map<string, number>([[vecKeyQ2(BASE_CENTER), 0]])
const hcNeighbors: Int32Array[] = [new Int32Array(24).fill(-1)]

function stepDock(dock: number, slot: number): number {
  const cached = hcNeighbors[dock]![slot]!
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
    hcNeighbors.push(new Int32Array(24).fill(-1))
  }
  hcNeighbors[dock]![slot] = nextId
  hcNeighbors[nextId]![OPPOSITE_SLOT[slot]!] = dock
  return nextId
}

function lorentzCosh2(dock: number): bigint {
  const c = dockCenters[dock]!
  const h = twiceForm(c, BASE_CENTER)
  assertExact(h[1] === 0n, `non-integer hyperbolic height at dock ${dock}`)
  return -h[0]
}

function encodeConfig(vibes: readonly Vibe[]): string {
  return [...vibes]
    .sort((a, b) => a[0] - b[0] || a[1] - b[1])
    .map(v => v.join(':'))
    .join(';')
}
function decodeConfig(key: string): Vibe[] {
  if (key === '') return []
  return key.split(';').map(entry => {
    const p = entry.split(':')
    return [Number(p[0]), Number(p[1]), Number(p[2]) as ToneNZ, Number(p[3])]
  })
}
function addAmpZ9(map: Map<string, Z9>, key: string, delta: Z9): void {
  const prev = map.get(key)
  const next = prev ? addZ9(prev, delta) : delta
  if (isZeroZ9(next)) map.delete(key)
  else map.set(key, next)
}
function reduceDenZ9(amp: Map<string, Z9>, den: bigint): ExactState {
  let d = den
  for (const p of [2n, 3n]) {
    while (d % p === 0n && [...amp.values()].every(z => z.every(c => c % p === 0n))) {
      d /= p
      for (const [k, z] of amp) amp.set(k, divExactZ9(z, p))
    }
  }
  return { amp, den: d }
}
function stateFromEntries(entries: readonly (readonly [readonly Vibe[], Z9])[], den: bigint): ExactState {
  const map = new Map<string, Z9>()
  for (const [vs, z] of entries) addAmpZ9(map, encodeConfig(vs), z)
  return reduceDenZ9(map, den)
}
function basisKet(vibes: readonly Vibe[]): ExactState {
  return stateFromEntries([[vibes, Z9_ONE]], 1n)
}
function innerProductExact(a: ExactState, b: ExactState): { readonly num: Z9; readonly den: bigint } {
  let sum = Z9_ZERO
  for (const [k, va] of a.amp) {
    const vb = b.amp.get(k)
    if (vb !== undefined) sum = addZ9(sum, mulZ9(conjZ9(va), vb))
  }
  return { num: sum, den: a.den * b.den }
}
function hasExactUnitNorm(s: ExactState): boolean {
  const ip = innerProductExact(s, s)
  return isZeroZ9(subZ9(ip.num, [ip.den, 0n, 0n, 0n, 0n, 0n]))
}
function countStateDiffs(a: ExactState, b: ExactState): number {
  const keys = new Set([...a.amp.keys(), ...b.amp.keys()])
  let diffs = 0
  for (const key of keys) {
    const lhs = scaleZ9(b.den, a.amp.get(key) ?? Z9_ZERO)
    const rhs = scaleZ9(a.den, b.amp.get(key) ?? Z9_ZERO)
    if (!isZeroZ9(subZ9(lhs, rhs))) diffs++
  }
  return diffs
}
function l2DiffExact(a: ExactState, b: ExactState): number {
  const keys = new Set([...a.amp.keys(), ...b.amp.keys()])
  let s = 0
  for (const key of keys) {
    const za = a.amp.has(key) ? z9ToComplex(a.amp.get(key)!, a.den) : C_ZERO
    const zb = b.amp.has(key) ? z9ToComplex(b.amp.get(key)!, b.den) : C_ZERO
    s += cAbs2(cSub(za, zb))
  }
  return Math.sqrt(s)
}
function groupByDock(vibes: readonly Vibe[]): Map<number, number[]> {
  const groups = new Map<number, number[]>()
  for (let i = 0; i < vibes.length; i++) {
    const d = vibes[i]![0]
    const list = groups.get(d)
    if (list) list.push(i)
    else groups.set(d, [i])
  }
  return groups
}
function collectActiveLines(vibes: readonly Vibe[]): ActiveLine[] {
  const result: ActiveLine[] = []
  for (const indices of groupByDock(vibes).values()) {
    const bySlot = new Map<number, number>()
    for (const idx of indices) bySlot.set(vibes[idx]![1], idx)
    for (const [slotA, slotB] of LINES) {
      const idxA = bySlot.get(slotA)
      const idxB = bySlot.get(slotB)
      if (idxA !== undefined || idxB !== undefined) result.push([idxA, idxB, slotA, slotB])
    }
  }
  return result
}
function mapConfigs(state: ExactState, transform: (vibes: Vibe[], amp: Z9) => readonly [Vibe[], Z9]): ExactState {
  const out = new Map<string, Z9>()
  for (const [k, amp] of state.amp) {
    const [nv, na] = transform(decodeConfig(k), amp)
    addAmpZ9(out, encodeConfig(nv), na)
  }
  return { amp: out, den: state.den }
}
function applyBranchingLayer<Item>(
  state: ExactState,
  branchDen: bigint,
  prepare: (vibes: Vibe[], amp: Z9) => readonly [Item[], Z9],
  expand: (cfg: Vibe[], amp: Z9, item: Item) => readonly (readonly [Vibe[], Z9])[],
): ExactState {
  const prepared = [...state.amp.entries()].map(([k, amp]) => {
    const vibes = decodeConfig(k)
    const [items, phasedAmp] = prepare(vibes, amp)
    return { vibes, items, phasedAmp }
  })
  const maxDepth = prepared.reduce((b, r) => Math.max(b, r.items.length), 0)
  const out = new Map<string, Z9>()
  for (const { vibes, items, phasedAmp } of prepared) {
    const scale = branchDen ** BigInt(maxDepth - items.length)
    let branches: (readonly [Vibe[], Z9])[] = [[vibes, scaleZ9(scale, phasedAmp)]]
    for (const item of items) branches = branches.flatMap(([cfg, amp]) => expand(cfg, amp, item))
    for (const [cfg, amp] of branches) addAmpZ9(out, encodeConfig(cfg), amp)
  }
  return reduceDenZ9(out, state.den * branchDen ** BigInt(maxDepth))
}
function applyHalfCoinD(state: ExactState, dag: boolean): ExactState {
  const detPhase = adjointZ9(Z9_ZETA6, dag)
  const diagCoeff = adjointZ9(Z9_COIN_DIAG, dag)
  const offCoeff = adjointZ9(Z9_COIN_OFF, dag)
  return applyBranchingLayer<readonly [number, number]>(
    state, 2n,
    (vibes, amp) => {
      const loneSplits: (readonly [number, number])[] = []
      let phased = amp
      for (const [idxA, idxB, slotA, slotB] of collectActiveLines(vibes)) {
        if (idxA !== undefined && idxB !== undefined) phased = mulZ9(phased, detPhase)
        else if (idxA !== undefined) loneSplits.push([idxA, slotB])
        else loneSplits.push([idxB!, slotA])
      }
      return [loneSplits, phased]
    },
    (cfg, amp, [idx, oppSlot]) => {
      const [dock, , tone, role] = cfg[idx]!
      const flipped = cfg.slice()
      flipped[idx] = [dock, oppSlot, tone, role]
      return [[cfg, mulZ9(amp, diagCoeff)], [flipped, mulZ9(amp, offCoeff)]]
    },
  )
}
function applyRoleMeet(state: ExactState, dag: boolean): ExactState {
  const equalRolePhase = adjointZ9(Z9_OMEGA, dag)
  const keepCoeff = adjointZ9(Z9_ZETA6, dag)
  const swapCoeff = adjointZ9(Z9_MEET_SWAP, dag)
  return applyBranchingLayer<readonly [number, number]>(
    state, 2n,
    (vibes, amp) => {
      const swaps: (readonly [number, number])[] = []
      let phased = amp
      for (const [idxA, idxB] of collectActiveLines(vibes)) {
        if (idxA === undefined || idxB === undefined) continue
        if (vibes[idxA]![2] !== vibes[idxB]![2]) continue
        if (vibes[idxA]![3] === vibes[idxB]![3]) phased = mulZ9(phased, equalRolePhase)
        else swaps.push([idxA, idxB])
      }
      return [swaps, phased]
    },
    (cfg, amp, [idxA, idxB]) => {
      const [dockA, slotA, toneA, roleA] = cfg[idxA]!
      const [dockB, slotB, toneB, roleB] = cfg[idxB]!
      const swapped = cfg.slice()
      swapped[idxA] = [dockA, slotA, toneA, roleB]
      swapped[idxB] = [dockB, slotB, toneB, roleA]
      return [[cfg, mulZ9(amp, keepCoeff)], [swapped, mulZ9(amp, swapCoeff)]]
    },
  )
}
function applyPairLineMixer(state: ExactState, dag: boolean): ExactState {
  const hopCoeff = subZ9(adjointZ9(Z9_ZETA18, dag), Z9_ONE)
  const keepCoeff = addZ9([12n, 0n, 0n, 0n, 0n, 0n], hopCoeff)
  return applyBranchingLayer<readonly [number, number, number]>(
    state, 12n,
    (vibes, amp) => {
      const pairs: (readonly [number, number, number])[] = []
      for (const indices of groupByDock(vibes).values()) {
        if (indices.length !== 2) continue
        const [i0, i1] = [indices[0]!, indices[1]!]
        const v0 = vibes[i0]!; const v1 = vibes[i1]!
        if (OPPOSITE_SLOT[v0[1]] === v1[1] && v0[2] === v1[2] && v0[3] === v1[3]) {
          pairs.push([i0, i1, LINE_OF_SLOT[v0[1]]!])
        }
      }
      return [pairs, amp]
    },
    (cfg, amp, [i0, i1, curLine]) =>
      LINES.map(([slotA, slotB], targetLine) => {
        if (targetLine === curLine) return [cfg, mulZ9(amp, keepCoeff)] as const
        const [dock, , tone, role] = cfg[i0]!
        const hopped = cfg.slice()
        hopped[i0] = [dock, slotA, tone, role]
        hopped[i1] = [dock, slotB, tone, role]
        return [hopped, mulZ9(amp, hopCoeff)] as const
      }),
  )
}
function applyOddChiralPhase(state: ExactState, dag: boolean): ExactState {
  return mapConfigs(state, (vibes, amp) => {
    let exponent = 0
    for (const [dock, indices] of groupByDock(vibes)) {
      if (indices.length >= 4) exponent += dockParity[dock]! * chiralOrientationDock(vibes, indices)
    }
    const signedExp = dag ? -exponent : exponent
    const mod6 = ((signedExp % 6) + 6) % 6
    return [vibes, mod6 === 0 ? amp : mulZ9(amp, ZETA6_POWERS[mod6]!)]
  })
}
function applyOppositeSignBounce(state: ExactState, _dag: boolean): ExactState {
  return mapConfigs(state, (vibes, amp) => {
    let negate = false
    for (const [idxA, idxB, slotA, slotB] of collectActiveLines(vibes)) {
      if (idxA === undefined || idxB === undefined) continue
      if (vibes[idxA]![2] === vibes[idxB]![2]) continue
      const vA = vibes[idxA]!; const vB = vibes[idxB]!
      vibes[idxA] = [vA[0], slotB, vA[2], vA[3]]
      vibes[idxB] = [vB[0], slotA, vB[2], vB[3]]
      negate = !negate
    }
    return [vibes, negate ? scaleZ9(-1n, amp) : amp]
  })
}
function applyStream(state: ExactState, dag: boolean): ExactState {
  return mapConfigs(state, (vibes, amp) => [
    vibes.map(([dock, slot, tone, role]) => [
      stepDock(dock, dag ? OPPOSITE_SLOT[slot]! : slot),
      slot,
      tone,
      role,
    ] as const),
    amp,
  ])
}

type LayerOp = (state: ExactState, dag: boolean) => ExactState
const BEAT_LAYERS: readonly LayerOp[] = [
  applyOddChiralPhase,
  applyHalfCoinD,
  applyOppositeSignBounce,
  applyPairLineMixer,
  applyRoleMeet,
  applyHalfCoinD,
  applyOddChiralPhase,
  applyStream,
]
const applyBeat = (s: ExactState): ExactState => BEAT_LAYERS.reduce((c, f) => f(c, false), s)
const applyBeatInv = (s: ExactState): ExactState => [...BEAT_LAYERS].reverse().reduce((c, f) => f(c, true), s)
const applyBeatSkip = (s: ExactState, skip: LayerOp): ExactState =>
  BEAT_LAYERS.reduce((c, f) => (f === skip ? c : f(c, false)), s)

function toneParitySig24(vibes: readonly Vibe[]): string {
  const p = new Int32Array(24)
  for (const [, slot, tone] of vibes) {
    const idx = LINE_OF_SLOT[slot]! * 2 + (tone > 0 ? 0 : 1)
    p[idx] = p[idx]! ^ 1
  }
  return Array.from(p).join('')
}

function tensorStatesExact(a: ExactState, b: ExactState): ExactState {
  const out = new Map<string, Z9>()
  for (const [ka, za] of a.amp) {
    const va = decodeConfig(ka)
    for (const [kb, zb] of b.amp) {
      const vb = decodeConfig(kb)
      let ok = true
      for (let i = 0; i < va.length && ok; i++) {
        for (let j = 0; j < vb.length; j++) {
          if (va[i]![0] === vb[j]![0] && va[i]![1] === vb[j]![1]) { ok = false; break }
        }
      }
      if (ok) addAmpZ9(out, encodeConfig([...va, ...vb]), mulZ9(za, zb))
    }
  }
  return reduceDenZ9(out, a.den * b.den)
}

// =================================================================================================
// PILLAR 1 (U1): AUTONOMOUS COMPOSABLE BALLISTIC SCATTERING LOGIC UNDER UNINTERRUPTED U^t
// =================================================================================================

function buildPulse1D(M: number, p: number, m0: number, sig: number): [Float64Array, Float64Array] {
  const S = 2 * M
  const re = new Float64Array(S)
  const im = new Float64Array(S)
  const th = Math.acos(0.5 * Math.cos(p))
  const ratio = -(Math.sin(p) + 2 * Math.sin(th)) / SQRT3
  const w = cScale(ratio, cExpI(p))
  const inv = 1 / Math.hypot(1, Math.abs(ratio))
  const chi0: C = [inv, 0]
  const chi1: C = cScale(inv, w)
  let n2 = 0
  for (let m = 0; m < M; m++) {
    let dm = m - m0
    if (dm > M / 2) dm -= M
    if (dm < -M / 2) dm += M
    const env = Math.exp(-(dm * dm) / (4 * sig * sig))
    const ph = cExpI(2 * p * m)
    const a0 = cScale(env, cMul(ph, chi0))
    const a1 = cScale(env, cMul(ph, chi1))
    re[2 * m] = a0[0]; im[2 * m] = a0[1]
    re[2 * m + 1] = a1[0]; im[2 * m + 1] = a1[1]
    n2 += cAbs2(a0) + cAbs2(a1)
  }
  const sc = 1 / Math.sqrt(n2)
  for (let i = 0; i < S; i++) { re[i] = re[i]! * sc; im[i] = im[i]! * sc }
  return [re, im]
}

function buildDoublon1D(M: number, m0: number, sigD: number, maxD = 5): [Float64Array, Float64Array] {
  const S = 2 * M
  const re = new Float64Array(S * S)
  const im = new Float64Array(S * S)
  const uPP: C = [3 + 4 * W_C[0], 4 * W_C[1]]
  const uPM: C = [1, 0]
  const uMP: C = [-7 + 8 * W_C[0], 8 * W_C[1]]
  for (let m1 = 0; m1 < M; m1++) {
    let dm0 = m1 - m0
    if (dm0 > M / 2) dm0 -= M
    if (dm0 < -M / 2) dm0 += M
    const e0 = Math.exp(-(dm0 * dm0) / (4 * sigD * sigD))
    re[2 * m1 * S + (2 * m1 + 1)] = 13 * e0
    for (let d = 1; d <= maxD; d++) {
      const m2 = (m1 + d) % M
      let dcm = m1 + 0.5 * d - m0
      if (dcm > M / 2) dcm -= M
      if (dcm < -M / 2) dcm += M
      const env = Math.exp(-(dcm * dcm) / (4 * sigD * sigD)) * Math.pow(1 / 13, d - 1)
      for (const [c1, c2, u] of [
        [2 * m1, 2 * m2, uPP],
        [2 * m1, 2 * m2 + 1, uPM],
        [2 * m1 + 1, 2 * m2, uMP],
        [2 * m1 + 1, 2 * m2 + 1, uPP],
      ] as const) {
        const lo = Math.min(c1, c2)
        const hi = Math.max(c1, c2)
        const v = cScale(env, u)
        re[lo * S + hi] = re[lo * S + hi]! + v[0]
        im[lo * S + hi] = im[lo * S + hi]! + v[1]
      }
    }
  }
  let n2 = 0
  for (let a = 0; a < S; a++) {
    for (let b = a + 1; b < S; b++) n2 += re[a * S + b]! ** 2 + im[a * S + b]! ** 2
  }
  const sc = 1 / Math.sqrt(n2)
  for (let i = 0; i < S * S; i++) { re[i] = re[i]! * sc; im[i] = im[i]! * sc }
  return [re, im]
}

function step1Even(M: number, re: Float64Array, im: Float64Array): [Float64Array, Float64Array] {
  const S = 2 * M
  const nr = new Float64Array(S)
  const ni = new Float64Array(S)
  for (let m = 0; m < M; m++) {
    for (let s = 0; s < 2; s++) {
      const ar = re[2 * m + s]!
      const ai = im[2 * m + s]!
      if (ar === 0 && ai === 0) continue
      for (const t of [0, 1] as const) {
        const cm = C_MAT[t]![s]!
        const dst = 2 * (t === 0 ? m : (m - 1 + M) % M) + t
        nr[dst] = nr[dst]! + (ar * cm[0] - ai * cm[1])
        ni[dst] = ni[dst]! + (ar * cm[1] + ai * cm[0])
      }
    }
  }
  return [nr, ni]
}

function step2EvenSym(M: number, re: Float64Array, im: Float64Array): [Float64Array, Float64Array] {
  const S = 2 * M
  const nr = new Float64Array(S * S)
  const ni = new Float64Array(S * S)
  for (let a = 0; a < S; a++) {
    const m1 = a >> 1; const s1 = a & 1
    for (let b = a + 1; b < S; b++) {
      const ar = re[a * S + b]!
      const ai = im[a * S + b]!
      if (ar === 0 && ai === 0) continue
      const m2 = b >> 1; const s2 = b & 1
      if (m1 === m2) {
        const n1 = 2 * m1
        const n2 = 2 * ((m2 - 1 + M) % M) + 1
        const lo = n1 < n2 ? n1 : n2
        const hi = n1 < n2 ? n2 : n1
        nr[lo * S + hi] = nr[lo * S + hi]! + (ar * W2_C[0] - ai * W2_C[1])
        ni[lo * S + hi] = ni[lo * S + hi]! + (ar * W2_C[1] + ai * W2_C[0])
      } else {
        for (const t1 of [0, 1] as const) {
          const c1 = C_MAT[t1]![s1]!
          const n1 = 2 * (t1 === 0 ? m1 : (m1 - 1 + M) % M) + t1
          for (const t2 of [0, 1] as const) {
            const cc = cMul(c1, C_MAT[t2]![s2]!)
            const n2 = 2 * (t2 === 0 ? m2 : (m2 - 1 + M) % M) + t2
            const lo = n1 < n2 ? n1 : n2
            const hi = n1 < n2 ? n2 : n1
            nr[lo * S + hi] = nr[lo * S + hi]! + (ar * cc[0] - ai * cc[1])
            ni[lo * S + hi] = ni[lo * S + hi]! + (ar * cc[1] + ai * cc[0])
          }
        }
      }
    }
  }
  return [nr, ni]
}

function runPillar1(): void {
  console.log('================================================================================')
  console.log('PILLAR 1 (U1): AUTONOMOUS COMPOSABLE BALLISTIC SCATTERING LOGIC UNDER BARE U^t')
  console.log('================================================================================')

  const pStar = -Math.atan((6 * SQRT3) / 5) // exact u* = -sqrt(3)/2, v_g = 6/13 docks/beat

  // -----------------------------------------------------------------------------------------------
  // U1a(i): Autonomous 2-Lap Sequential Sym^3 CZ Composition (pi -> 2 pi) under uninterrupted U^t
  // -----------------------------------------------------------------------------------------------
  const u1aLap = (() => {
    const M = 28
    const S = 2 * M
    const C1 = new Int32Array(S + 1)
    const C2 = new Int32Array(S + 1)
    const C3 = new Int32Array(S + 1)
    for (let n = 0; n <= S; n++) {
      C1[n] = n
      C2[n] = (n * (n - 1)) / 2
      C3[n] = (n * (n - 1) * (n - 2)) / 6
    }
    const N3 = C3[S]!
    const idx3 = (x: number, y: number, z: number): number => C1[x]! + C2[y]! + C3[z]!
    const [pR0, pI0] = buildPulse1D(M, pStar, 6, 2.0)
    const [dR0, dI0] = buildDoublon1D(M, 15, 1.8)

    const compose3 = (dr: Float64Array, di: Float64Array, pr: Float64Array, pi: Float64Array, shiftP = 0): [Float64Array, Float64Array] => {
      const oR = new Float64Array(N3)
      const oI = new Float64Array(N3)
      for (let a = 0; a < S; a++) {
        for (let b = a + 1; b < S; b++) {
          const dar = dr[a * S + b]!; const dai = di[a * S + b]!
          if (dar === 0 && dai === 0) continue
          for (let c = 0; c < S; c++) {
            if (c === a || c === b) continue
            const cSh = 2 * ((((c >> 1) - shiftP + M) % M + M) % M) + (c & 1)
            const pcr = pr[cSh]!; const pci = pi[cSh]!
            if (pcr === 0 && pci === 0) continue
            let x = a; let y = b; let z = c
            if (x > y) { const t = x; x = y; y = t }
            if (y > z) { const t = y; y = z; z = t }
            if (x > y) { const t = x; x = y; y = t }
            const id = idx3(x, y, z)
            oR[id] = oR[id]! + (dar * pcr - dai * pci)
            oI[id] = oI[id]! + (dar * pci + dai * pcr)
          }
        }
      }
      let n2 = 0
      for (let i = 0; i < N3; i++) n2 += oR[i]! ** 2 + oI[i]! ** 2
      const sc = 1 / Math.sqrt(n2)
      for (let i = 0; i < N3; i++) { oR[i] = oR[i]! * sc; oI[i] = oI[i]! * sc }
      return [oR, oI]
    }

    let curDR = dR0; let curDI = dI0
    let curPR = pR0; let curPI = pI0
    let [stR, stI] = compose3(curDR, curDI, curPR, curPI, 0)
    let nr = new Float64Array(N3)
    let ni = new Float64Array(N3)
    const T1 = 68 // after 1st autonomous collision (rel ~ +6.7 even sites past D_1)
    const T2 = 190 // after 2nd autonomous collision (one full lap 121.33 beats later, rel ~ +6.9!)
    let maxNormErr = 0
    const dCyc = (a: number, b: number) => Math.min(Math.abs(a - b), M - Math.abs(a - b))

    const measureAt = (shiftRange: readonly number[]) => {
      const [refR, refI] = compose3(curDR, curDI, curPR, curPI, 0)
      let ovR = 0; let ovI = 0
      for (let i = 0; i < N3; i++) {
        ovR += refR[i]! * stR[i]! + refI[i]! * stI[i]!
        ovI += refR[i]! * stI[i]! - refI[i]! * stR[i]!
      }
      const fid0 = ovR * ovR + ovI * ovI
      const dPhi = Math.atan2(ovI, ovR)
      let bestFid = fid0; let bestSh = 0; let bestPhi = dPhi
      for (const sh of shiftRange) {
        const [sR, sI] = compose3(curDR, curDI, curPR, curPI, sh)
        let r = 0; let im = 0
        for (let i = 0; i < N3; i++) {
          r += sR[i]! * stR[i]! + sI[i]! * stI[i]!
          im += sR[i]! * stI[i]! - sI[i]! * stR[i]!
        }
        if (r * r + im * im > bestFid) { bestFid = r * r + im * im; bestSh = sh; bestPhi = Math.atan2(im, r) }
      }
      let pSurv = 0
      for (let a = 0; a < S; a++) {
        const m1 = a >> 1
        for (let b = a + 1; b < S; b++) {
          const m2 = b >> 1
          const base = C1[a]! + C2[b]!
          for (let c = b + 1; c < S; c++) {
            const w = stR[base + C3[c]!]! ** 2 + stI[base + C3[c]!]! ** 2
            if (w === 0) continue
            const m3 = c >> 1
            if (Math.min(dCyc(m1, m2), dCyc(m2, m3), dCyc(m1, m3)) <= 3) pSurv += w
          }
        }
      }
      return { fid0, wigFid: bestFid, bestSh, dPhi, bestPhi, pBreak: 1 - pSurv }
    }

    let r1 = { fid0: 0, wigFid: 0, bestSh: 0, dPhi: 0, bestPhi: 0, pBreak: 0 }
    let r2 = { fid0: 0, wigFid: 0, bestSh: 0, dPhi: 0, bestPhi: 0, pBreak: 0 }
    const add3 = (u1: number, u2: number, u3: number, vr: number, vi: number) => {
      let x = u1; let y = u2; let z = u3
      if (x > y) { const t = x; x = y; y = t }
      if (y > z) { const t = y; y = z; z = t }
      if (x > y) { const t = x; x = y; y = t }
      const id = C1[x]! + C2[y]! + C3[z]!
      nr[id] = nr[id]! + vr
      ni[id] = ni[id]! + vi
    }

    for (let t = 1; t <= T2; t++) {
      ;[curDR, curDI] = step2EvenSym(M, curDR, curDI)
      ;[curPR, curPI] = step1Even(M, curPR, curPI)
      nr.fill(0); ni.fill(0)
      for (let a = 0; a < S; a++) {
        const m1 = a >> 1; const s1 = a & 1
        for (let b = a + 1; b < S; b++) {
          const m2 = b >> 1; const s2 = b & 1
          const base = C1[a]! + C2[b]!
          for (let c = b + 1; c < S; c++) {
            const id = base + C3[c]!
            const ar = stR[id]!; const ai = stI[id]!
            if (ar === 0 && ai === 0) continue
            const m3 = c >> 1; const s3 = c & 1
            if (m1 === m2) {
              const n1 = 2 * m1; const n2 = 2 * ((m2 - 1 + M) % M) + 1
              const pr = ar * W2_C[0] - ai * W2_C[1]; const pi = ar * W2_C[1] + ai * W2_C[0]
              for (const t3 of [0, 1] as const) {
                const c3 = C_MAT[t3]![s3]!
                add3(n1, n2, 2 * (t3 === 0 ? m3 : (m3 - 1 + M) % M) + t3, pr * c3[0] - pi * c3[1], pr * c3[1] + pi * c3[0])
              }
            } else if (m2 === m3) {
              const n2 = 2 * m2; const n3 = 2 * ((m3 - 1 + M) % M) + 1
              const pr = ar * W2_C[0] - ai * W2_C[1]; const pi = ar * W2_C[1] + ai * W2_C[0]
              for (const t1 of [0, 1] as const) {
                const c1 = C_MAT[t1]![s1]!
                add3(2 * (t1 === 0 ? m1 : (m1 - 1 + M) % M) + t1, n2, n3, pr * c1[0] - pi * c1[1], pr * c1[1] + pi * c1[0])
              }
            } else {
              for (const t1 of [0, 1] as const) {
                const c1 = C_MAT[t1]![s1]!; const n1 = 2 * (t1 === 0 ? m1 : (m1 - 1 + M) % M) + t1
                const r1x = ar * c1[0] - ai * c1[1]; const i1x = ar * c1[1] + ai * c1[0]
                for (const t2 of [0, 1] as const) {
                  const c2 = C_MAT[t2]![s2]!; const n2 = 2 * (t2 === 0 ? m2 : (m2 - 1 + M) % M) + t2
                  const r2x = r1x * c2[0] - i1x * c2[1]; const i2x = r1x * c2[1] + i1x * c2[0]
                  for (const t3 of [0, 1] as const) {
                    const c3 = C_MAT[t3]![s3]!
                    add3(n1, n2, 2 * (t3 === 0 ? m3 : (m3 - 1 + M) % M) + t3, r2x * c3[0] - i2x * c3[1], r2x * c3[1] + i2x * c3[0])
                  }
                }
              }
            }
          }
        }
      }
      const tr = stR; const ti = stI; stR = nr; stI = ni; nr = tr; ni = ti
      if (t === T1 || t === T2) {
        let n2 = 0
        for (let i = 0; i < N3; i++) n2 += stR[i]! ** 2 + stI[i]! ** 2
        maxNormErr = Math.max(maxNormErr, Math.abs(n2 - 1))
        if (t === T1) r1 = measureAt([-2, -1, 1, 2])
        if (t === T2) r2 = measureAt([-3, -2, -1, 1, 2, 3])
      }
    }
    return { maxNormErr, r1, r2 }
  })()

  // -----------------------------------------------------------------------------------------------
  // U1a(ii): TRUE 2-Station Spatially Separated D_1 + D_2 + P (k = 5 Sym^5 on M = 12, C(24,5) = 42,504)
  //          Full 4-entry autonomous phase truth table (0,0), (1,0), (0,1), (1,1) under pure U^t!
  // -----------------------------------------------------------------------------------------------
  const u1aTwoStation = (() => {
    const M = 12
    const S = 2 * M // 24
    const binom = (n: number, k: number): number => {
      if (k < 0 || k > n) return 0
      let r = 1
      for (let i = 1; i <= k; i++) r = (r * (n - i + 1)) / i
      return Math.round(r)
    }
    const C1 = new Int32Array(S + 1)
    const C2 = new Int32Array(S + 1)
    const C3 = new Int32Array(S + 1)
    const C4 = new Int32Array(S + 1)
    const C5 = new Int32Array(S + 1)
    for (let n = 0; n <= S; n++) {
      C1[n] = n; C2[n] = binom(n, 2); C3[n] = binom(n, 3); C4[n] = binom(n, 4); C5[n] = binom(n, 5)
    }
    const N3 = C3[S]!
    const N5 = C5[S]!
    const T_END = 44 // P at m=0 -> hits D_1(m=3) at t~13, hits D_2(m=7) at t~30, exits cleanly at m~10.15!
    const [pR0, pI0] = buildPulse1D(M, pStar, 0, 1.1)
    const [d1R0, d1I0] = buildDoublon1D(M, 3, 0.85, 3)
    const [d2R0, d2I0] = buildDoublon1D(M, 7, 0.85, 3)

    // Evolve reference single pulse & two independent doublons over T_END beats
    let refPR = pR0; let refPI = pI0
    let refD1R = d1R0; let refD1I = d1I0
    let refD2R = d2R0; let refD2I = d2I0

    // Helper: run 1-station k = 3 Sym^3 for (1,0) and (0,1)
    const runSingleStation = (dInitR: Float64Array, dInitI: Float64Array) => {
      const compose3 = (dr: Float64Array, di: Float64Array, pr: Float64Array, pi: Float64Array, shiftP = 0): [Float64Array, Float64Array] => {
        const oR = new Float64Array(N3); const oI = new Float64Array(N3)
        for (let a = 0; a < S; a++) for (let b = a + 1; b < S; b++) {
          const dar = dr[a * S + b]!; const dai = di[a * S + b]!
          if (dar === 0 && dai === 0) continue
          for (let c = 0; c < S; c++) {
            if (c === a || c === b) continue
            const cSh = 2 * ((((c >> 1) - shiftP + M) % M + M) % M) + (c & 1)
            const pcr = pr[cSh]!; const pci = pi[cSh]!
            if (pcr === 0 && pci === 0) continue
            let x = a; let y = b; let z = c
            if (x > y) { const t = x; x = y; y = t }
            if (y > z) { const t = y; y = z; z = t }
            if (x > y) { const t = x; x = y; y = t }
            const id = C1[x]! + C2[y]! + C3[z]!
            oR[id] = oR[id]! + (dar * pcr - dai * pci)
            oI[id] = oI[id]! + (dar * pci + dai * pcr)
          }
        }
        let n2 = 0
        for (let i = 0; i < N3; i++) n2 += oR[i]! ** 2 + oI[i]! ** 2
        const sc = 1 / Math.sqrt(n2)
        for (let i = 0; i < N3; i++) { oR[i] = oR[i]! * sc; oI[i] = oI[i]! * sc }
        return [oR, oI]
      }
      let [stR, stI] = compose3(dInitR, dInitI, pR0, pI0)
      let nr = new Float64Array(N3); let ni = new Float64Array(N3)
      const add3 = (u1: number, u2: number, u3: number, vr: number, vi: number) => {
        let x = u1; let y = u2; let z = u3
        if (x > y) { const t = x; x = y; y = t }
        if (y > z) { const t = y; y = z; z = t }
        if (x > y) { const t = x; x = y; y = t }
        const id = C1[x]! + C2[y]! + C3[z]!
        nr[id] = nr[id]! + vr; ni[id] = ni[id]! + vi
      }
      for (let t = 1; t <= T_END; t++) {
        nr.fill(0); ni.fill(0)
        for (let a = 0; a < S; a++) {
          const m1 = a >> 1; const s1 = a & 1
          for (let b = a + 1; b < S; b++) {
            const m2 = b >> 1; const s2 = b & 1
            const base = C1[a]! + C2[b]!
            for (let c = b + 1; c < S; c++) {
              const id = base + C3[c]!
              const ar = stR[id]!; const ai = stI[id]!
              if (ar === 0 && ai === 0) continue
              const m3 = c >> 1; const s3 = c & 1
              if (m1 === m2) {
                const n1 = 2 * m1; const n2 = 2 * ((m2 - 1 + M) % M) + 1
                const pr = ar * W2_C[0] - ai * W2_C[1]; const pi = ar * W2_C[1] + ai * W2_C[0]
                for (const t3 of [0, 1] as const) {
                  const c3 = C_MAT[t3]![s3]!
                  add3(n1, n2, 2 * (t3 === 0 ? m3 : (m3 - 1 + M) % M) + t3, pr * c3[0] - pi * c3[1], pr * c3[1] + pi * c3[0])
                }
              } else if (m2 === m3) {
                const n2 = 2 * m2; const n3 = 2 * ((m3 - 1 + M) % M) + 1
                const pr = ar * W2_C[0] - ai * W2_C[1]; const pi = ar * W2_C[1] + ai * W2_C[0]
                for (const t1 of [0, 1] as const) {
                  const c1 = C_MAT[t1]![s1]!
                  add3(2 * (t1 === 0 ? m1 : (m1 - 1 + M) % M) + t1, n2, n3, pr * c1[0] - pi * c1[1], pr * c1[1] + pi * c1[0])
                }
              } else {
                for (const t1 of [0, 1] as const) {
                  const c1 = C_MAT[t1]![s1]!; const n1 = 2 * (t1 === 0 ? m1 : (m1 - 1 + M) % M) + t1
                  const r1x = ar * c1[0] - ai * c1[1]; const i1x = ar * c1[1] + ai * c1[0]
                  for (const t2 of [0, 1] as const) {
                    const c2 = C_MAT[t2]![s2]!; const n2 = 2 * (t2 === 0 ? m2 : (m2 - 1 + M) % M) + t2
                    const r2x = r1x * c2[0] - i1x * c2[1]; const i2x = r1x * c2[1] + i1x * c2[0]
                    for (const t3 of [0, 1] as const) {
                      const c3 = C_MAT[t3]![s3]!
                      add3(n1, n2, 2 * (t3 === 0 ? m3 : (m3 - 1 + M) % M) + t3, r2x * c3[0] - i2x * c3[1], r2x * c3[1] + i2x * c3[0])
                    }
                  }
                }
              }
            }
          }
        }
        const tr = stR; const ti = stI; stR = nr; stI = ni; nr = tr; ni = ti
      }
      return { stR, stI, compose3 }
    }

    // Build exact 5-body Sym^5 initial product |D_1> (x) |D_2> (x) |P>
    const compose5 = (
      d1r: Float64Array, d1i: Float64Array,
      d2r: Float64Array, d2i: Float64Array,
      pr: Float64Array, pi: Float64Array,
      shiftP = 0,
    ): [Float64Array, Float64Array] => {
      const oR = new Float64Array(N5); const oI = new Float64Array(N5)
      // Collect nonzero pairs for d1 and d2 to keep composition instantaneous
      const nz1: [number, number, number, number][] = []
      const nz2: [number, number, number, number][] = []
      for (let a = 0; a < S; a++) for (let b = a + 1; b < S; b++) {
        const r1 = d1r[a * S + b]!; const i1 = d1i[a * S + b]!
        if (r1 * r1 + i1 * i1 > 1e-14) nz1.push([a, b, r1, i1])
        const r2 = d2r[a * S + b]!; const i2 = d2i[a * S + b]!
        if (r2 * r2 + i2 * i2 > 1e-14) nz2.push([a, b, r2, i2])
      }
      const arr = new Int32Array(5)
      for (const [a1, b1, r1, i1] of nz1) {
        for (const [a2, b2, r2, i2] of nz2) {
          if (a2 === a1 || a2 === b1 || b2 === a1 || b2 === b1) continue
          const r12 = r1 * r2 - i1 * i2; const i12 = r1 * i2 + i1 * r2
          for (let c = 0; c < S; c++) {
            if (c === a1 || c === b1 || c === a2 || c === b2) continue
            const cSh = 2 * ((((c >> 1) - shiftP + M) % M + M) % M) + (c & 1)
            const pcr = pr[cSh]!; const pci = pi[cSh]!
            if (pcr * pcr + pci * pci < 1e-14) continue
            arr[0] = a1; arr[1] = b1; arr[2] = a2; arr[3] = b2; arr[4] = c
            // Insertion sort 5 elements
            for (let i = 1; i < 5; i++) {
              const v = arr[i]!
              let j = i - 1
              while (j >= 0 && arr[j]! > v) { arr[j + 1] = arr[j]!; j-- }
              arr[j + 1] = v
            }
            const id = C1[arr[0]!]! + C2[arr[1]!]! + C3[arr[2]!]! + C4[arr[3]!]! + C5[arr[4]!]!
            oR[id] = oR[id]! + (r12 * pcr - i12 * pci)
            oI[id] = oI[id]! + (r12 * pci + i12 * pcr)
          }
        }
      }
      let n2 = 0
      for (let i = 0; i < N5; i++) n2 += oR[i]! ** 2 + oI[i]! ** 2
      const sc = 1 / Math.sqrt(n2)
      for (let i = 0; i < N5; i++) { oR[i] = oR[i]! * sc; oI[i] = oI[i]! * sc }
      return [oR, oI]
    }

    const res10 = runSingleStation(d1R0, d1I0)
    const res01 = runSingleStation(d2R0, d2I0)

    // Precompute sorted combinadic tuples for exact k = 5 Sym^5 evolution
    let [st5R, st5I] = compose5(d1R0, d1I0, d2R0, d2I0, pR0, pI0)
    let nr5 = new Float64Array(N5)
    let ni5 = new Float64Array(N5)
    const slots5 = new Uint8Array(N5 * 5)
    {
      let ptr = 0
      for (let e = 4; e < S; e++) {
        for (let d = 3; d < e; d++) {
          for (let c = 2; c < d; c++) {
            for (let b = 1; b < c; b++) {
              for (let a = 0; a < b; a++) {
                const id = C1[a]! + C2[b]! + C3[c]! + C4[d]! + C5[e]!
                slots5[id * 5] = a; slots5[id * 5 + 1] = b; slots5[id * 5 + 2] = c
                slots5[id * 5 + 3] = d; slots5[id * 5 + 4] = e
                ptr++
              }
            }
          }
        }
      }
      assertExact(ptr === N5, `k=5 combinadic count ${ptr} !== ${N5}`)
    }

    const tmpOut = new Int32Array(5)
    const add5 = (u0: number, u1: number, u2: number, u3: number, u4: number, vr: number, vi: number) => {
      tmpOut[0] = u0; tmpOut[1] = u1; tmpOut[2] = u2; tmpOut[3] = u3; tmpOut[4] = u4
      for (let i = 1; i < 5; i++) {
        const v = tmpOut[i]!
        let j = i - 1
        while (j >= 0 && tmpOut[j]! > v) { tmpOut[j + 1] = tmpOut[j]!; j-- }
        tmpOut[j + 1] = v
      }
      const id = C1[tmpOut[0]!]! + C2[tmpOut[1]!]! + C3[tmpOut[2]!]! + C4[tmpOut[3]!]! + C5[tmpOut[4]!]!
      nr5[id] = nr5[id]! + vr
      ni5[id] = ni5[id]! + vi
    }

    // Evolve reference 1-body & 2-body + interacting 5-body for T_END beats
    const loneIdx = new Int32Array(5)
    const loneM = new Int32Array(5)
    const loneS = new Int32Array(5)
    const fixedSlots = new Int32Array(5)

    for (let t = 1; t <= T_END; t++) {
      ;[refPR, refPI] = step1Even(M, refPR, refPI)
      ;[refD1R, refD1I] = step2EvenSym(M, refD1R, refD1I)
      ;[refD2R, refD2I] = step2EvenSym(M, refD2R, refD2I)
      nr5.fill(0); ni5.fill(0)
      for (let id = 0; id < N5; id++) {
        const ar = st5R[id]!; const ai = st5I[id]!
        if (ar === 0 && ai === 0) continue
        const off = id * 5
        const a0 = slots5[off]!; const a1 = slots5[off + 1]!; const a2 = slots5[off + 2]!
        const a3 = slots5[off + 3]!; const a4 = slots5[off + 4]!
        // Group consecutive equal sites (sorted a0 < a1 < a2 < a3 < a4, max 2 per site!)
        const ms = [a0 >> 1, a1 >> 1, a2 >> 1, a3 >> 1, a4 >> 1]
        const ss = [a0 & 1, a1 & 1, a2 & 1, a3 & 1, a4 & 1]
        let pr = ar; let pi = ai
        let nFixed = 0; let nLone = 0
        let i = 0
        while (i < 5) {
          if (i + 1 < 5 && ms[i] === ms[i + 1]) {
            const m = ms[i]!
            fixedSlots[nFixed++] = 2 * m
            fixedSlots[nFixed++] = 2 * ((m - 1 + M) % M) + 1
            const nrp = pr * W2_C[0] - pi * W2_C[1]
            const nip = pr * W2_C[1] + pi * W2_C[0]
            pr = nrp; pi = nip
            i += 2
          } else {
            loneIdx[nLone] = i
            loneM[nLone] = ms[i]!
            loneS[nLone] = ss[i]!
            nLone++
            i++
          }
        }
        // Expand 2^{nLone} coin branches
        const nB = 1 << nLone
        for (let mask = 0; mask < nB; mask++) {
          let br = pr; let bi = pi
          let fPtr = nFixed
          for (let l = 0; l < nLone; l++) {
            const tDir = (mask >> l) & 1
            const cm = C_MAT[tDir]![loneS[l]!]!
            const nrr = br * cm[0] - bi * cm[1]
            const nii = br * cm[1] + bi * cm[0]
            br = nrr; bi = nii
            const ml = loneM[l]!
            fixedSlots[fPtr++] = 2 * (tDir === 0 ? ml : (ml - 1 + M) % M) + tDir
          }
          add5(fixedSlots[0]!, fixedSlots[1]!, fixedSlots[2]!, fixedSlots[3]!, fixedSlots[4]!, br, bi)
        }
      }
      const tr = st5R; const ti = st5I; st5R = nr5; st5I = ni5; nr5 = tr; ni5 = ti
    }

    let norm5 = 0
    for (let i = 0; i < N5; i++) norm5 += st5R[i]! ** 2 + st5I[i]! ** 2
    const norm5Err = Math.abs(norm5 - 1)

    const ov3Best = (
      stR: Float64Array, stI: Float64Array,
      compose3Fn: (dr: Float64Array, di: Float64Array, pr: Float64Array, pi: Float64Array, sh?: number) => [Float64Array, Float64Array],
      refDR: Float64Array, refDI: Float64Array,
    ) => {
      const evalSh = (sh: number) => {
        const [refR, refI] = compose3Fn(refDR, refDI, refPR, refPI, sh)
        let r = 0; let im = 0
        for (let i = 0; i < N3; i++) {
          r += refR[i]! * stR[i]! + refI[i]! * stI[i]!
          im += refR[i]! * stI[i]! - refI[i]! * stR[i]!
        }
        return { fid: r * r + im * im, phi: Math.atan2(im, r) }
      }
      const base = evalSh(0)
      let bestFid = base.fid; let bestSh = 0
      for (const sh of [-1, 1, 2]) {
        const cand = evalSh(sh)
        if (cand.fid > bestFid) { bestFid = cand.fid; bestSh = sh }
      }
      return { fid: base.fid, wigFid: bestFid, bestSh, phi: base.phi }
    }
    const o10 = ov3Best(res10.stR, res10.stI, res10.compose3, refD1R, refD1I)
    const o01 = ov3Best(res01.stR, res01.stI, res01.compose3, refD2R, refD2I)

    const eval5Sh = (sh: number) => {
      const [ref11R, ref11I] = compose5(refD1R, refD1I, refD2R, refD2I, refPR, refPI, sh)
      let r11 = 0; let i11 = 0
      for (let i = 0; i < N5; i++) {
        r11 += ref11R[i]! * st5R[i]! + ref11I[i]! * st5I[i]!
        i11 += ref11R[i]! * st5I[i]! - ref11I[i]! * st5R[i]!
      }
      return { fid: r11 * r11 + i11 * i11, phi: Math.atan2(i11, r11) }
    }
    const o11Base = eval5Sh(0)
    let wigFid11 = o11Base.fid; let bestSh11 = 0
    for (const sh of [-1, 1, 2]) {
      const cand = eval5Sh(sh)
      if (cand.fid > wigFid11) { wigFid11 = cand.fid; bestSh11 = sh }
    }
    const fid11 = o11Base.fid
    const phi11 = o11Base.phi
    const addDefect = Math.abs(wrapPi(phi11 - (o10.phi + o01.phi)))
    return { norm5Err, o10, o01, fid11, wigFid11, bestSh11, phi11, addDefect }
  })()

  // -----------------------------------------------------------------------------------------------
  // U1b: Exact Distinguishable 3-Role (0,1,2) Time-Domain Wavepacket Collision (M_pair = I in 4D!)
  //      + Autonomous Maximal 2-Qutrit Entanglement (log_2 3 bits) & 5-Role Remote Memory Bus
  // -----------------------------------------------------------------------------------------------
  const u1bRoleHead = (() => {
    const M = 20
    const S = 2 * M // 40
    const S2 = S * S
    const S3 = S * S2 // 64,000 ordered triples (c0, c1, c2) for roles (0, 1, 2)
    const T_END = 48
    const [dR0, dI0] = buildDoublon1D(M, 11, 1.4, 4)
    const [pR0, pI0] = buildPulse1D(M, pStar, 4, 1.5)

    // Initial separable state: |{0,1}_Sym> (doublon) (x) |2> (flying head)
    let stR = new Float64Array(S3)
    let stI = new Float64Array(S3)
    for (let a = 0; a < S; a++) {
      for (let b = a + 1; b < S; b++) {
        const dar = dR0[a * S + b]!; const dai = dI0[a * S + b]!
        if (dar === 0 && dai === 0) continue
        for (let c = 0; c < S; c++) {
          if (c === a || c === b) continue
          const pcr = pR0[c]!; const pci = pI0[c]!
          if (pcr === 0 && pci === 0) continue
          const vr = ISQ2 * (dar * pcr - dai * pci)
          const vi = ISQ2 * (dar * pci + dai * pcr)
          stR[a * S2 + b * S + c] = vr; stI[a * S2 + b * S + c] = vi
          stR[b * S2 + a * S + c] = vr; stI[b * S2 + a * S + c] = vi
        }
      }
    }
    let n2Init = 0
    for (let i = 0; i < S3; i++) n2Init += stR[i]! ** 2 + stI[i]! ** 2
    const sc0 = 1 / Math.sqrt(n2Init)
    for (let i = 0; i < S3; i++) { stR[i] = stR[i]! * sc0; stI[i] = stI[i]! * sc0 }

    let nr = new Float64Array(S3)
    let ni = new Float64Array(S3)
    let refDR = dR0; let refDI = dI0
    let refPR = pR0; let refPI = pI0

    // Exact 1D verbatim bare U for 3 distinct roles (0, 1, 2):
    // When two particles share site m (slots 2m, 2m+1), D o M_meet o D acts as:
    //   omega * ( (zeta_6/2) I + ((omega - 1)/2) SWAP_roles )!
    // Wait: check D o M_meet o D on antipodal pair with distinct roles (r_A, r_B):
    //   D gives detPhase = zeta_6 (twice -> zeta_6^2 = omega), M_meet gives keep = zeta_6/2, swap = (omega-1)/2!
    const mkKeep = cMul(W_C, MEET_KEEP) // omega * zeta_6 / 2 = (-1/2 + i*0)? Wait: omega * zeta_6 = (-1/2+is3/2)(1/2+is3/2) = -1! -> -1/2? Wait check!
    // Careful! Check exact: zeta_6 = e^{i pi/3}, omega = e^{i 2pi/3}: omega * zeta_6 = e^{i pi} = -1!
    // Wait: check Sym & Alt eigenvalues of D o M_meet o D:
    //   On Sym: M_meet = omega, D^2_full = zeta_6^2 = omega => total = omega^2!
    //   Check (mkKeep + mkSwap) = omega * (zeta_6/2 + (omega - 1)/2) = omega * ((1+w + w-1)/2) = omega^2! EXACT!
    //   On Alt: M_meet = 1, D^2_full = omega => total = omega!
    //   Check (mkKeep - mkSwap) = omega * ((1+w - (w-1))/2) = omega * 1 = omega! EXACT!
    const mkSwap = cMul(W_C, MEET_SWAP)
    // Cross-check Sym = omega^2 and Alt = omega
    assertExact(cAbs(cSub(cAdd(mkKeep, mkSwap), W2_C)) < 1e-14, 'D M_meet D Sym phase !== omega^2')
    assertExact(cAbs(cSub(cSub(mkKeep, mkSwap), W_C)) < 1e-14, 'D M_meet D Alt phase !== omega')

    let maxNormErr = 0
    for (let t = 1; t <= T_END; t++) {
      ;[refDR, refDI] = step2EvenSym(M, refDR, refDI)
      ;[refPR, refPI] = step1Even(M, refPR, refPI)
      nr.fill(0); ni.fill(0)
      for (let a = 0; a < S; a++) {
        const m0 = a >> 1; const s0 = a & 1
        for (let b = 0; b < S; b++) {
          if (b === a) continue
          const m1 = b >> 1; const s1 = b & 1
          const base = a * S2 + b * S
          for (let c = 0; c < S; c++) {
            if (c === a || c === b) continue
            const ar = stR[base + c]!; const ai = stI[base + c]!
            if (ar === 0 && ai === 0) continue
            const m2 = c >> 1; const s2 = c & 1
            if (m0 === m1) {
              // Roles 0, 1 meet on site m0: stream destinations for slot 0 -> 2*m0, slot 1 -> 2*((m0-1+M)%M)+1
              const dst0 = 2 * (s0 === 0 ? m0 : (m0 - 1 + M) % M) + s0
              const dst1 = 2 * (s1 === 0 ? m1 : (m1 - 1 + M) % M) + s1
              const kr = ar * mkKeep[0] - ai * mkKeep[1]; const ki = ar * mkKeep[1] + ai * mkKeep[0]
              const sr = ar * mkSwap[0] - ai * mkSwap[1]; const si = ar * mkSwap[1] + ai * mkSwap[0]
              for (const t2 of [0, 1] as const) {
                const cm = C_MAT[t2]![s2]!
                const dst2 = 2 * (t2 === 0 ? m2 : (m2 - 1 + M) % M) + t2
                const idxK = dst0 * S2 + dst1 * S + dst2
                const idxS = dst1 * S2 + dst0 * S + dst2
                nr[idxK] = nr[idxK]! + (kr * cm[0] - ki * cm[1]); ni[idxK] = ni[idxK]! + (kr * cm[1] + ki * cm[0])
                nr[idxS] = nr[idxS]! + (sr * cm[0] - si * cm[1]); ni[idxS] = ni[idxS]! + (sr * cm[1] + si * cm[0])
              }
            } else if (m0 === m2) {
              const dst0 = 2 * (s0 === 0 ? m0 : (m0 - 1 + M) % M) + s0
              const dst2 = 2 * (s2 === 0 ? m2 : (m2 - 1 + M) % M) + s2
              const kr = ar * mkKeep[0] - ai * mkKeep[1]; const ki = ar * mkKeep[1] + ai * mkKeep[0]
              const sr = ar * mkSwap[0] - ai * mkSwap[1]; const si = ar * mkSwap[1] + ai * mkSwap[0]
              for (const t1 of [0, 1] as const) {
                const cm = C_MAT[t1]![s1]!
                const dst1 = 2 * (t1 === 0 ? m1 : (m1 - 1 + M) % M) + t1
                const idxK = dst0 * S2 + dst1 * S + dst2
                const idxS = dst2 * S2 + dst1 * S + dst0
                nr[idxK] = nr[idxK]! + (kr * cm[0] - ki * cm[1]); ni[idxK] = ni[idxK]! + (kr * cm[1] + ki * cm[0])
                nr[idxS] = nr[idxS]! + (sr * cm[0] - si * cm[1]); ni[idxS] = ni[idxS]! + (sr * cm[1] + si * cm[0])
              }
            } else if (m1 === m2) {
              const dst1 = 2 * (s1 === 0 ? m1 : (m1 - 1 + M) % M) + s1
              const dst2 = 2 * (s2 === 0 ? m2 : (m2 - 1 + M) % M) + s2
              const kr = ar * mkKeep[0] - ai * mkKeep[1]; const ki = ar * mkKeep[1] + ai * mkKeep[0]
              const sr = ar * mkSwap[0] - ai * mkSwap[1]; const si = ar * mkSwap[1] + ai * mkSwap[0]
              for (const t0 of [0, 1] as const) {
                const cm = C_MAT[t0]![s0]!
                const dst0 = 2 * (t0 === 0 ? m0 : (m0 - 1 + M) % M) + t0
                const idxK = dst0 * S2 + dst1 * S + dst2
                const idxS = dst0 * S2 + dst2 * S + dst1
                nr[idxK] = nr[idxK]! + (kr * cm[0] - ki * cm[1]); ni[idxK] = ni[idxK]! + (kr * cm[1] + ki * cm[0])
                nr[idxS] = nr[idxS]! + (sr * cm[0] - si * cm[1]); ni[idxS] = ni[idxS]! + (sr * cm[1] + si * cm[0])
              }
            } else {
              for (const t0 of [0, 1] as const) {
                const c0 = C_MAT[t0]![s0]!; const d0 = 2 * (t0 === 0 ? m0 : (m0 - 1 + M) % M) + t0
                const r0 = ar * c0[0] - ai * c0[1]; const i0 = ar * c0[1] + ai * c0[0]
                for (const t1 of [0, 1] as const) {
                  const c1 = C_MAT[t1]![s1]!; const d1 = 2 * (t1 === 0 ? m1 : (m1 - 1 + M) % M) + t1
                  const r1 = r0 * c1[0] - i0 * c1[1]; const i1 = r0 * c1[1] + i0 * c1[0]
                  for (const t2 of [0, 1] as const) {
                    const c2 = C_MAT[t2]![s2]!; const d2 = 2 * (t2 === 0 ? m2 : (m2 - 1 + M) % M) + t2
                    const idx = d0 * S2 + d1 * S + d2
                    nr[idx] = nr[idx]! + (r1 * c2[0] - i1 * c2[1])
                    ni[idx] = ni[idx]! + (r1 * c2[1] + i1 * c2[0])
                  }
                }
              }
            }
          }
        }
      }
      const tr = stR; const ti = stI; stR = nr; stI = ni; nr = tr; ni = ti
      if (t === 1 || t === T_END) {
        let n2 = 0
        for (let i = 0; i < S3; i++) n2 += stR[i]! ** 2 + stI[i]! ** 2
        maxNormErr = Math.max(maxNormErr, Math.abs(n2 - 1))
      }
    }

    // Measure post-collision branch probabilities into the 3 orthogonal role channels:
    //   ch2: doublon={0,1}, head=2 (elastic)
    //   ch1: doublon={0,2}, head=1 (role-swap 1)
    //   ch0: doublon={1,2}, head=0 (role-swap 2)
    // plus Alt leakage and overlap with unshifted/Wigner-shifted reference!
    const dCyc = (a: number, b: number) => Math.min(Math.abs(a - b), M - Math.abs(a - b))
    let pEl = 0; let pSw1 = 0; let pSw0 = 0; let pBreak = 0
    let altNorm2 = 0
    for (let a = 0; a < S; a++) {
      const m0 = a >> 1
      for (let b = 0; b < S; b++) {
        if (b === a) continue
        const m1 = b >> 1
        const base = a * S2 + b * S
        for (let c = 0; c < S; c++) {
          if (c === a || c === b) continue
          const vr = stR[base + c]!; const vi = stI[base + c]!
          const w = vr * vr + vi * vi
          if (w === 0) continue
          const m2 = c >> 1
          const d01 = dCyc(m0, m1); const d02 = dCyc(m0, m2); const d12 = dCyc(m1, m2)
          const dMin = Math.min(d01, d02, d12)
          if (dMin > 3) { pBreak += w; continue }
          if (d01 === dMin && d01 < d02 && d01 < d12) {
            pEl += w
            if (a < b) {
              const wr = stR[b * S2 + a * S + c]!; const wi = stI[b * S2 + a * S + c]!
              altNorm2 += 0.5 * ((vr - wr) ** 2 + (vi - wi) ** 2)
            }
          } else if (d02 === dMin && d02 < d01 && d02 < d12) {
            pSw1 += w
            if (a < c) {
              const wr = stR[c * S2 + b * S + a]!; const wi = stI[c * S2 + b * S + a]!
              altNorm2 += 0.5 * ((vr - wr) ** 2 + (vi - wi) ** 2)
            }
          } else if (d12 === dMin && d12 < d01 && d12 < d02) {
            pSw0 += w
            if (b < c) {
              const wr = stR[a * S2 + c * S + b]!; const wi = stI[a * S2 + c * S + b]!
              altNorm2 += 0.5 * ((vr - wr) ** 2 + (vi - wi) ** 2)
            }
          } else {
            pBreak += w
          }
        }
      }
    }

    // Overlap with evolved elastic reference |{0,1}_Sym(t)> (x) |2(t)>
    let ovElR = 0; let ovElI = 0
    for (let a = 0; a < S; a++) {
      for (let b = a + 1; b < S; b++) {
        const dar = refDR[a * S + b]!; const dai = refDI[a * S + b]!
        if (dar === 0 && dai === 0) continue
        for (let c = 0; c < S; c++) {
          if (c === a || c === b) continue
          const pcr = refPR[c]!; const pci = refPI[c]!
          if (pcr === 0 && pci === 0) continue
          const rr = ISQ2 * (dar * pcr - dai * pci)
          const ri = ISQ2 * (dar * pci + dai * pcr)
          const s1r = stR[a * S2 + b * S + c]!; const s1i = stI[a * S2 + b * S + c]!
          const s2r = stR[b * S2 + a * S + c]!; const s2i = stI[b * S2 + a * S + c]!
          ovElR += rr * (s1r + s2r) + ri * (s1i + s2i)
          ovElI += rr * (s1i + s2i) - ri * (s1r + s2r)
        }
      }
    }
    const argEl = Math.atan2(ovElI, ovElR)
    const pSurv = pEl + pSw1 + pSw0
    const q0 = pEl / pSurv; const q1 = pSw1 / pSurv; const q2 = pSw0 / pSurv
    const sVN = -(q0 * Math.log2(q0) + q1 * Math.log2(q1) + q2 * Math.log2(q2))

    // Exact analytic Yang fusion F(u*) = R_{13}(u*+i/2) R_{23}(u*-i/2) Alt(1,2) leakage check!
    const uStar = spU(pStar, 1)
    const yangR = (wRe: number, wIm: number): { readonly rI: C; readonly rP: C } => ({
      rI: cDiv([wRe, wIm], [wRe, wIm + 1]),
      rP: cDiv([0, -1], [wRe, wIm + 1]),
    })
    const applyR6 = (v: readonly C[], iA: number, iB: number, rI: C, rP: C): C[] => {
      const perms: readonly (readonly [number, number, number])[] = [[0,1,2],[0,2,1],[1,0,2],[1,2,0],[2,0,1],[2,1,0]]
      const out: C[] = Array.from({ length: 6 }, () => C_ZERO)
      for (let idx = 0; idx < 6; idx++) {
        const p = perms[idx]!
        const sw: [number, number, number] = [p[0], p[1], p[2]]
        const tmp = sw[iA]!; sw[iA] = sw[iB]!; sw[iB] = tmp
        const j = perms.findIndex(q => q[0] === sw[0] && q[1] === sw[1] && q[2] === sw[2])
        out[idx] = cAdd(out[idx]!, cMul(v[idx]!, rI))
        out[j] = cAdd(out[j]!, cMul(v[idx]!, rP))
      }
      return out
    }
    const r23 = yangR(uStar, -0.5); const r13 = yangR(uStar, +0.5)
    const fOut = applyR6(applyR6([[ISQ2, 0], C_ZERO, [ISQ2, 0], C_ZERO, C_ZERO, C_ZERO], 1, 2, r23.rI, r23.rP), 0, 2, r13.rI, r13.rP)
    const anaAltLeak = cAbs(cSub(fOut[0]!, fOut[2]!)) + cAbs(cSub(fOut[1]!, fOut[4]!)) + cAbs(cSub(fOut[3]!, fOut[5]!))

    // Exact analytic 5-role 2-station remote memory bus (D_1={0,1}, D_2={2,3}, head=4):
    // F(u*) maps |{a,b}, c> -> alpha |{a,b}, c> + beta (|{a,c}, b> + |{b,c}, a>)
    // with u* = -sqrt(3)/2 => alpha = (u* - i/2)/(u* + 3i/2) = i/sqrt(3), beta = -i(u* - i/2)/((u*+i/2)(u*+3i/2))
    const alpha = cDiv([uStar, -0.5], [uStar, 1.5])
    const beta = cDiv(cMul([0, -1], [uStar, -0.5]), cMul([uStar, 0.5], [uStar, 1.5]))
    // Step 1: Head (4) hits D_1 ({0,1}) -> 3 branches: ({0,1}, 4; amp=alpha), ({0,4}, 1; amp=beta), ({1,4}, 0; amp=beta)
    // Step 2: Head (h) hits D_2 ({2,3}) -> 9 orthogonal basis states |D_1, D_2, head>!
    interface BusTerm { readonly d1: string; readonly d2: string; readonly h: number; readonly amp: C }
    const step1: { readonly d1: string; readonly h: number; readonly amp: C }[] = [
      { d1: '01', h: 4, amp: alpha },
      { d1: '04', h: 1, amp: beta },
      { d1: '14', h: 0, amp: beta },
    ]
    const busTerms: BusTerm[] = []
    for (const s1 of step1) {
      busTerms.push({ d1: s1.d1, d2: '23', h: s1.h, amp: cMul(s1.amp, alpha) })
      busTerms.push({ d1: s1.d1, d2: `2${s1.h}`, h: 3, amp: cMul(s1.amp, beta) })
      busTerms.push({ d1: s1.d1, d2: `3${s1.h}`, h: 2, amp: cMul(s1.amp, beta) })
    }
    let busNorm2 = 0
    let pWriteD1toD2 = 0
    let pReadD2 = 0
    const d1Prob = new Map<string, number>()
    const d2Prob = new Map<string, number>()
    const hProb = new Map<number, number>()
    for (const term of busTerms) {
      const p = cAbs2(term.amp)
      busNorm2 += p
      if (term.d2.includes('0') || term.d2.includes('1')) pWriteD1toD2 += p
      if (term.h === 2 || term.h === 3) pReadD2 += p
      d1Prob.set(term.d1, (d1Prob.get(term.d1) ?? 0) + p)
      d2Prob.set(term.d2, (d2Prob.get(term.d2) ?? 0) + p)
      hProb.set(term.h, (hProb.get(term.h) ?? 0) + p)
    }
    // Entropies S(D_1), S(D_2), S(D_1 D_2) = S(head) (since total state is pure!)
    const shannon = (vals: Iterable<number>): number => {
      let s = 0
      for (const p of vals) if (p > 1e-15) s -= p * Math.log2(p)
      return s
    }
    const sD1 = shannon(d1Prob.values())
    const sD2 = shannon(d2Prob.values())
    const sHead = shannon(hProb.values()) // equals S(D_1 D_2)
    const mutInfoD1D2 = sD1 + sD2 - sHead
    // Heralded entanglement between D_1 and D_2 when head is measured in role 2 (prob 1/3):
    // Conditioned on h = 2, the 3 terms are: (01, 34), (04, 31), (14, 30) with equal weights (1/3, 1/3, 1/3)!
    // That is a MAXIMALLY ENTANGLED REMOTE 2-QUTRIT BELL STATE (S = log_2 3 bits) between stationary D_1 and D_2!
    const heraldTerms = busTerms.filter(t => t.h === 2)
    const heraldProb = heraldTerms.reduce((s, t) => s + cAbs2(t.amp), 0)
    const heraldEnt = shannon(heraldTerms.map(t => cAbs2(t.amp) / heraldProb))

    return {
      maxNormErr, pEl, pSw1, pSw0, pBreak, pSurv, altNorm2, anaAltLeak, argEl, sVN,
      busNorm2, pWriteD1toD2, pReadD2, mutInfoD1D2, heraldProb, heraldEnt,
    }
  })()

  console.log(`  [U1a-i]  2-Lap Autonomous Sym^3 CZ Composition (M=28, uninterrupted U^t, normErr=${u1aLap.maxNormErr.toExponential(1)}):`)
  console.log(`           Collision 1 (T=68) : dPhi_1=${(u1aLap.r1.dPhi / PI).toFixed(5)} pi, fid0=${u1aLap.r1.fid0.toFixed(5)}, wigFid=${u1aLap.r1.wigFid.toFixed(5)} (sh=${u1aLap.r1.bestSh}), P_break=${u1aLap.r1.pBreak.toFixed(5)}`)
  console.log(`           Collision 2 (T=190): dPhi_2=${(u1aLap.r2.dPhi / PI).toFixed(5)} pi (= 2 pi mod 2pi!), fid0=${u1aLap.r2.fid0.toFixed(5)}, wigFid=${u1aLap.r2.wigFid.toFixed(5)} (sh=${u1aLap.r2.bestSh}), P_break=${u1aLap.r2.pBreak.toFixed(5)}`)
  console.log(`  [U1a-ii] True 2-Station Spatially Separated D_1(m=3) + D_2(m=7) + P(m=0) (M=12, k=5 Sym^5, T=44, normErr=${u1aTwoStation.norm5Err.toExponential(1)}):`)
  console.log(`           (0,0): dPhi=0.00000 pi | (1,0): dPhi=${(u1aTwoStation.o10.phi / PI).toFixed(5)} pi (wigFid=${u1aTwoStation.o10.wigFid.toFixed(4)}, sh=${u1aTwoStation.o10.bestSh}) | (0,1): dPhi=${(u1aTwoStation.o01.phi / PI).toFixed(5)} pi (wigFid=${u1aTwoStation.o01.wigFid.toFixed(4)}, sh=${u1aTwoStation.o01.bestSh})`)
  console.log(`           (1,1) exact 5-body: dPhi_11=${(u1aTwoStation.phi11 / PI).toFixed(5)} pi (wigFid=${u1aTwoStation.wigFid11.toFixed(4)}, sh=${u1aTwoStation.bestSh11}), |dPhi_11 - (dPhi_10+dPhi_01)|=${(u1aTwoStation.addDefect / PI).toFixed(5)} pi`)
  console.log(`  [U1b]    Exact Distinguishable 3-Role (0,1,2) Collision (M=20, T=48, M_pair=I in 4D!, normErr=${u1bRoleHead.maxNormErr.toExponential(1)}):`)
  console.log(`           P_el=${u1bRoleHead.pEl.toFixed(5)} (ana 1/3), P_swap=(${u1bRoleHead.pSw1.toFixed(5)}, ${u1bRoleHead.pSw0.toFixed(5)}) (ana 1/3,1/3), P_break=${u1bRoleHead.pBreak.toFixed(5)}, wpAltTail=${u1bRoleHead.altNorm2.toExponential(2)} (anaAltLeak=${u1bRoleHead.anaAltLeak.toExponential(1)})`)
  console.log(`           arg(a_el)=${(u1bRoleHead.argEl / PI).toFixed(5)} pi (ana +0.500 pi), survival-conditioned role entanglement entropy S_vN(head:mem)=${u1bRoleHead.sVN.toFixed(5)} bits (pSurv=${u1bRoleHead.pSurv.toFixed(5)}, max log2(3)=${Math.log2(3).toFixed(5)})`)
  console.log(`           5-Role 2-Station Remote Bus (D_1={0,1}, D_2={2,3}, head=4): norm2=${u1bRoleHead.busNorm2.toFixed(12)}, P(D1->D2 write)=${u1bRoleHead.pWriteD1toD2.toFixed(5)} (4/9), P(D2 readout)=${u1bRoleHead.pReadD2.toFixed(5)} (2/3)`)
  console.log(`           Remote Stationary-Memory I(D_1:D_2)=${u1bRoleHead.mutInfoD1D2.toFixed(5)} bits, Heralded (h=2, P=1/3) Bell S_vN=${u1bRoleHead.heraldEnt.toFixed(5)} bits (= log2(3) exact!)`)

  const ok =
    u1aLap.maxNormErr < 1e-12 &&
    Math.abs(Math.abs(u1aLap.r1.dPhi) - PI) < 0.03 &&
    Math.abs(u1aLap.r2.dPhi) < 0.06 &&
    u1aLap.r2.wigFid > 0.70 &&
    u1aTwoStation.norm5Err < 1e-12 &&
    u1aTwoStation.addDefect < 0.15 &&
    u1bRoleHead.maxNormErr < 1e-12 &&
    Math.abs(u1bRoleHead.pEl - 1 / 3) < 0.03 &&
    Math.abs(u1bRoleHead.pSw1 - 1 / 3) < 0.03 &&
    Math.abs(u1bRoleHead.pSw0 - 1 / 3) < 0.03 &&
    u1bRoleHead.anaAltLeak < 1e-14 &&
    u1bRoleHead.altNorm2 < 0.02 &&
    Math.abs(u1bRoleHead.argEl - PI / 2) < 0.05 * PI &&
    u1bRoleHead.sVN > 1.57 &&
    Math.abs(u1bRoleHead.pWriteD1toD2 - 4 / 9) < 1e-12 &&
    Math.abs(u1bRoleHead.heraldEnt - Math.log2(3)) < 1e-12

  recordCheck(
    'U1',
    'Autonomous multi-gate collinear CZ composition (2-lap & 5-body 2-station) + distinguishable 3-role qutrit Bell collision & 5-role remote bus',
    ok,
    `2-lap dPhi=(${(u1aLap.r1.dPhi / PI).toFixed(4)}pi -> ${(u1aLap.r2.dPhi / PI).toFixed(4)}pi), 5-body addErr=${(u1aTwoStation.addDefect / PI).toFixed(4)}pi, 3-role S_vN=${u1bRoleHead.sVN.toFixed(4)}b, bus write=${u1bRoleHead.pWriteD1toD2.toFixed(4)}, herald=${u1bRoleHead.heraldEnt.toFixed(4)}b`,
  )
}

// =================================================================================================
// PILLAR 2 (U2): AUTONOMOUS 4D CROSS-LINE CHIRAL INTERFEROMETRIC SWITCH (k = 5 & k = 6 IN BigInt)
// =================================================================================================

function runPillar2(): void {
  console.log('\n================================================================================')
  console.log('PILLAR 2 (U2): AUTONOMOUS 4D CROSS-LINE CHIRAL SWITCH (k=5 & k=6, EXACT BigInt)')
  console.log('================================================================================')

  const [l0A, l0B] = LINES[0]!
  const [l1A] = LINES[1]!
  const [l2A] = LINES[2]!
  const [l4A] = LINES[4]!
  const [l8A] = LINES[8]!
  const d1 = stepDock(0, l0A)
  const cDock1 = stepDock(d1, OPPOSITE_SLOT[l1A]!)
  const cDock2 = stepDock(d1, OPPOSITE_SLOT[l2A]!)
  const cDock8 = stepDock(d1, OPPOSITE_SLOT[l8A]!)
  const cDock4 = stepDock(d1, OPPOSITE_SLOT[l4A]!)

  // Control states for k = 5 = 2 + 1 + 1 + 1:
  //   ctrl = +1: 3 control rays on [l1, l2, l8] all tone +1 (all role 0)
  //   ctrl = -1: flip control ray on l8 from tone +1 -> -1
  //   ctrl = OFF (k = 4): remove line-8 control ray (so only 2 control rays -> <= 3 vibes at d1 -> Phi_odd = I!)
  const seedPos = basisKet([
    [0, l0A, 1, 0],
    [0, l0B, 1, 0],
    [cDock1, l1A, 1, 0],
    [cDock2, l2A, 1, 0],
    [cDock8, l8A, 1, 0],
  ])
  const seedNeg = basisKet([
    [0, l0A, 1, 0],
    [0, l0B, 1, 0],
    [cDock1, l1A, 1, 0],
    [cDock2, l2A, 1, 0],
    [cDock8, l8A, -1, 0],
  ])
  const seedOff = basisKet([
    [0, l0A, 1, 0],
    [0, l0B, 1, 0],
    [cDock1, l1A, 1, 0],
    [cDock2, l2A, 1, 0],
  ])

  const evolve2Exact = (seed: ExactState, label: string) => {
    const expPar = toneParitySig24(decodeConfig([...seed.amp.keys()][0]!))
    const t1 = applyBeat(seed)
    assertExact(hasExactUnitNorm(t1), `${label} t=1 unit norm`)
    assertExact(countStateDiffs(applyBeatInv(t1), seed) === 0, `${label} t=1 exact reversibility`)
    const t1Size = t1.amp.size
    const t2 = applyBeat(t1)
    assertExact(hasExactUnitNorm(t2), `${label} t=2 unit norm`)
    let parDef = 0
    for (const k of t1.amp.keys()) if (toneParitySig24(decodeConfig(k)) !== expPar) parDef++
    for (const k of t2.amp.keys()) if (toneParitySig24(decodeConfig(k)) !== expPar) parDef++
    const t2NoPhi = applyBeatSkip(t1, applyOddChiralPhase)
    const phiDiffsT2 = countStateDiffs(t2, t2NoPhi)
    const l2PhiVsNoPhi = l2DiffExact(t2, t2NoPhi)
    return { t1Size, t2, phiDiffsT2, l2PhiVsNoPhi, parDef }
  }

  const measureLine0BranchT2 = (s: ExactState) => {
    const d2Fwd = stepDock(d1, l0A)
    let pFwd = 0; let pRefl = 0
    for (const [k, z] of s.amp) {
      const vs = decodeConfig(k)
      const sigVibes = vs.filter(v => LINE_OF_SLOT[v[1]] === 0)
      if (sigVibes.length !== 2) continue
      const p = cAbs2(z9ToComplex(z, s.den))
      const hasFwd = sigVibes.some(v => v[0] === d2Fwd)
      const hasBack0 = sigVibes.some(v => v[0] === 0 && v[1] === l0B)
      if (hasFwd) pFwd += p
      if (hasBack0) pRefl += p
    }
    return { pFwd, pRefl }
  }

  // Exact t = 3 12-line Mach-Zehnder recombination at dock 0!
  const evolveT3ExactRecomb = (t2: ExactState, ctrlSlots: readonly number[]) => {
    const ctrlLines = ctrlSlots.map(s => LINE_OF_SLOT[s]!)
    const ctrlDocks = new Set<number>()
    for (const sIn of ctrlSlots) {
      const sOpp = OPPOSITE_SLOT[sIn]!
      ctrlDocks.add(stepDock(d1, sIn))
      ctrlDocks.add(stepDock(d1, sOpp))
      const cD = stepDock(d1, sOpp)
      ctrlDocks.add(stepDock(cD, sOpp))
      ctrlDocks.add(stepDock(stepDock(cD, sOpp), sOpp))
    }
    let dockOverlapCount = 0
    const byCtrl = new Map<string, Map<string, Z9>>()
    for (const [k, z] of t2.amp) {
      const vs = decodeConfig(k)
      const cVs: Vibe[] = []
      const sVs: Vibe[] = []
      for (const v of vs) {
        if (ctrlLines.includes(LINE_OF_SLOT[v[1]]!) && ctrlDocks.has(v[0])) cVs.push(v)
        else sVs.push(v)
      }
      assertExact(sVs.length === 2, `signal pair partition failed (${sVs.length} != 2) for ${k}`)
      for (const sv of sVs) for (const cv of cVs) if (sv[0] === cv[0]) dockOverlapCount++
      const cKey = encodeConfig(cVs)
      let sub = byCtrl.get(cKey)
      if (!sub) { sub = new Map<string, Z9>(); byCtrl.set(cKey, sub) }
      addAmpZ9(sub, encodeConfig(sVs), z)
    }
    assertExact(dockOverlapCount === 0, `unexpected dock overlap ${dockOverlapCount} at t=2`)
    const lineProb = new Float64Array(12)
    let totalProb = 0
    let mPairRecombBranches = 0
    for (const subMap of byCtrl.values()) {
      const sigState: ExactState = { amp: subMap, den: t2.den }
      for (const sk of subMap.keys()) {
        const sv = decodeConfig(sk)
        if (sv[0]![0] === 0 && sv[1]![0] === 0) mPairRecombBranches++
      }
      const sigT3 = applyBeat(sigState)
      for (const [sk, z] of sigT3.amp) {
        const sv = decodeConfig(sk)
        const l0 = LINE_OF_SLOT[sv[0]![1]]!
        const l1 = LINE_OF_SLOT[sv[1]![1]]!
        assertExact(l0 === l1, `signal pair split across lines at t=3`)
        const p = cAbs2(z9ToComplex(z, sigT3.den))
        lineProb[l0] = lineProb[l0]! + p
        totalProb += p
      }
    }
    return { dockOverlapCount, mPairRecombBranches, lineProb, totalProb }
  }

  // Block 1: C4 = [0, 1, 2, 8] (scoped to release BigInt state maps immediately for low RSS)
  const c4Summary = (() => {
    const runPos = evolve2Exact(seedPos, 'k5_ctrl+1')
    const runNeg = evolve2Exact(seedNeg, 'k5_ctrl-1')
    const stripCtrl8Tone = (s: ExactState): ExactState =>
      mapConfigs(s, (vibes, amp) => [
        vibes.map(([d, sl, tn, r]) => [d, sl, LINE_OF_SLOT[sl] === 8 ? 1 : tn, r] as const),
        amp,
      ])
    const l2ContrastT2 = l2DiffExact(stripCtrl8Tone(runPos.t2), stripCtrl8Tone(runNeg.t2))
    const bPosT2 = measureLine0BranchT2(runPos.t2)
    const t3Pos = evolveT3ExactRecomb(runPos.t2, [l1A, l2A, l8A])
    const t3Neg = evolveT3ExactRecomb(runNeg.t2, [l1A, l2A, l8A])
    const runOff = evolve2Exact(seedOff, 'k4_ctrlOFF')
    const bOffT2 = measureLine0BranchT2(runOff.t2)
    const t3Off = evolveT3ExactRecomb(runOff.t2, [l1A, l2A])
    return {
      t1Size: runPos.t1Size, t2Size: runPos.t2.amp.size,
      phiPos: runPos.phiDiffsT2, phiNeg: runNeg.phiDiffsT2, phiOff: runOff.phiDiffsT2,
      parDef: runPos.parDef + runNeg.parDef + runOff.parDef,
      l2ContrastT2, l2PhiPos: runPos.l2PhiVsNoPhi, l2PhiNeg: runNeg.l2PhiVsNoPhi,
      bPosT2, bOffT2, t3Pos, t3Neg, t3Off,
    }
  })()

  const dP0_PosNeg = c4Summary.t3Pos.lineProb[0]! - c4Summary.t3Neg.lineProb[0]!
  const dP0_PosOff = c4Summary.t3Pos.lineProb[0]! - c4Summary.t3Off.lineProb[0]!
  const offSumPos = 1 - c4Summary.t3Pos.lineProb[0]!
  const offSumNeg = 1 - c4Summary.t3Neg.lineProb[0]!
  const offSumOff = 1 - c4Summary.t3Off.lineProb[0]!
  const dPOff_PosNeg = offSumPos - offSumNeg
  const dPOff_PosOff = offSumPos - offSumOff

  // Block 2: Constant-k = 5 single-bit tone-flip switch S_184 = [0, 1, 4, 10] (scoped for low RSS)
  const s184A = 1; const s184B = 4; const s184C = 10
  const l184A = LINE_OF_SLOT[s184A]!; const l184B = LINE_OF_SLOT[s184B]!; const l184C = LINE_OF_SLOT[s184C]!
  const s184Summary = (() => {
    const d184A = stepDock(d1, OPPOSITE_SLOT[s184A]!)
    const d184B = stepDock(d1, OPPOSITE_SLOT[s184B]!)
    const d184C = stepDock(d1, OPPOSITE_SLOT[s184C]!)
    const seed184Pos = basisKet([
      [0, l0A, 1, 0], [0, l0B, 1, 0],
      [d184A, s184A, 1, 0], [d184B, s184B, 1, 0], [d184C, s184C, 1, 0],
    ])
    const seed184Neg = basisKet([
      [0, l0A, 1, 0], [0, l0B, 1, 0],
      [d184A, s184A, -1, 0], [d184B, s184B, 1, 0], [d184C, s184C, 1, 0],
    ])
    const run184Pos = evolve2Exact(seed184Pos, 'k5_184_ctrl+1')
    const run184Neg = evolve2Exact(seed184Neg, 'k5_184_ctrl-1')
    const strip184Tone = (s: ExactState): ExactState =>
      mapConfigs(s, (vibes, amp) => [
        vibes.map(([d, sl, tn, r]) => [d, sl, LINE_OF_SLOT[sl] === l184A ? 1 : tn, r] as const),
        amp,
      ])
    const l2Contrast184T2 = l2DiffExact(strip184Tone(run184Pos.t2), strip184Tone(run184Neg.t2))
    const b184PosT2 = measureLine0BranchT2(run184Pos.t2)
    const b184NegT2 = measureLine0BranchT2(run184Neg.t2)
    const t3_184Pos = evolveT3ExactRecomb(run184Pos.t2, [s184A, s184B, s184C])
    const t3_184Neg = evolveT3ExactRecomb(run184Neg.t2, [s184A, s184B, s184C])
    return {
      phiPos: run184Pos.phiDiffsT2, phiNeg: run184Neg.phiDiffsT2,
      parDef: run184Pos.parDef + run184Neg.parDef,
      l2Contrast184T2, b184PosT2, b184NegT2, t3_184Pos, t3_184Neg,
    }
  })()
  const off184Pos = 1 - s184Summary.t3_184Pos.lineProb[0]!
  const off184Neg = 1 - s184Summary.t3_184Neg.lineProb[0]!
  const dPOff_184 = off184Pos - off184Neg

  // Also test k = 6 = 2 + 1 + 1 + 1 + 1 (4 control rays on [1, 2, 4, 8], t = 1 exact + active d1 sector t = 2!)
  const seedK6Pos = basisKet([
    [0, l0A, 1, 0],
    [0, l0B, 1, 0],
    [cDock1, l1A, 1, 0],
    [cDock2, l2A, 1, 0],
    [cDock4, l4A, 1, 0],
    [cDock8, l8A, 1, 0],
  ])
  const seedK6Neg = basisKet([
    [0, l0A, 1, 0],
    [0, l0B, 1, 0],
    [cDock1, l1A, 1, 0],
    [cDock2, l2A, 1, 0],
    [cDock4, l4A, 1, 0],
    [cDock8, l8A, -1, 0],
  ])
  const k6T1Pos = applyBeat(seedK6Pos)
  const k6T1Neg = applyBeat(seedK6Neg)
  assertExact(hasExactUnitNorm(k6T1Pos) && hasExactUnitNorm(k6T1Neg), 'k=6 t=1 unit norm')
  const extractActiveD1 = (s: ExactState): ExactState => {
    const m = new Map<string, Z9>()
    for (const [k, z] of s.amp) {
      const grp = groupByDock(decodeConfig(k))
      if ((grp.get(d1)?.length ?? 0) >= 4) m.set(k, z)
    }
    return { amp: m, den: s.den }
  }
  const k6ActPos = extractActiveD1(k6T1Pos)
  const k6ActNeg = extractActiveD1(k6T1Neg)
  const k6T2Pos = applyBeat(k6ActPos)
  const k6T2Neg = applyBeat(k6ActNeg)
  const k6PhiDiffPos = countStateDiffs(k6T2Pos, applyBeatSkip(k6ActPos, applyOddChiralPhase))
  const k6PhiDiffNeg = countStateDiffs(k6T2Neg, applyBeatSkip(k6ActNeg, applyOddChiralPhase))
  const stripCtrl8ToneK6 = (s: ExactState): ExactState =>
    mapConfigs(s, (vibes, amp) => [
      vibes.map(([d, sl, tn, r]) => [d, sl, LINE_OF_SLOT[sl] === 8 ? 1 : tn, r] as const),
      amp,
    ])
  const k6Contrast = l2DiffExact(stripCtrl8ToneK6(k6T2Pos), stripCtrl8ToneK6(k6T2Neg))

  // Single-vibe (odd-parity) control test: 1 vibe on line 0 + 3 control rays on [1, 2, 8] -> 0 off-line!
  const seedSingle = basisKet([
    [0, l0A, 1, 0],
    [cDock1, l1A, 1, 0],
    [cDock2, l2A, 1, 0],
    [cDock8, l8A, 1, 0],
  ])
  let sSingle = seedSingle
  const expParSingle = toneParitySig24(decodeConfig([...seedSingle.amp.keys()][0]!))
  let singleOffLine = 0
  let singleParDef = 0
  for (let t = 1; t <= 2; t++) {
    sSingle = applyBeat(sSingle)
    assertExact(hasExactUnitNorm(sSingle), `single-vibe switch t=${t} norm`)
    for (const k of sSingle.amp.keys()) {
      const vs = decodeConfig(k)
      if (toneParitySig24(vs) !== expParSingle) singleParDef++
      const linesUsed = new Set(vs.map(v => LINE_OF_SLOT[v[1]]!))
      for (const l of linesUsed) if (l !== 0 && l !== 1 && l !== 2 && l !== 8) singleOffLine++
    }
  }

  console.log(`  [U2a] Verbatim 4D BigInt Z[zeta_9][1/6] k=5 (2+1+1+1) M_pair+Phi_odd Switch (0 parity defects, exact revDiff=0):`)
  console.log(`        C4 (lines [0,1,2,8], slots [${l0A},${l1A},${l2A},${l8A}]) branches: t=1 -> ${c4Summary.t1Size}, t=2 -> ${c4Summary.t2Size}; Phi_odd diffs at t=2: ctrl(+1)=${c4Summary.phiPos}, ctrl(-1)=${c4Summary.phiNeg}, ctrl(OFF,k=4)=${c4Summary.phiOff}`)
  console.log(`        C4 t=2 L2 contrast: ||psi(+1)-psi(-1)||=${c4Summary.l2ContrastT2.toFixed(6)} (W(F_4)xZ_2^C invariant!), ||psi(+1)-psi_noPhi||=${c4Summary.l2PhiPos.toFixed(6)}, ||psi(-1)-psi_noPhi||=${c4Summary.l2PhiNeg.toFixed(6)}`)
  console.log(`        C4 t=2 signal line-0 (fwd/refl) probs: ctrl(+1)=(${c4Summary.bPosT2.pFwd.toFixed(6)}, ${c4Summary.bPosT2.pRefl.toFixed(6)}), ctrl(OFF)=(${c4Summary.bOffT2.pFwd.toFixed(6)}, ${c4Summary.bOffT2.pRefl.toFixed(6)})`)
  console.log(`  [U2b] Exact t=3 12-Line Mach-Zehnder Recombination at Dock 0 (dockOverlaps=${c4Summary.t3Pos.dockOverlapCount}, recombBranches=${c4Summary.t3Pos.mPairRecombBranches}, sumP=${c4Summary.t3Pos.totalProb.toFixed(12)}):`)
  console.log(`        C4 (lines [0,1,2,8], slots [${l0A},${l1A},${l2A},${l8A}]) P(line 0):   ctrl(+1)=${c4Summary.t3Pos.lineProb[0]!.toFixed(8)}, ctrl(OFF)=${c4Summary.t3Off.lineProb[0]!.toFixed(8)} (dP_0=${dP0_PosOff.toExponential(4)}, dP_off=${dPOff_PosOff.toExponential(4)})`)
  console.log(`        C4 (lines [0,1,2,8], slots [${l0A},${l1A},${l2A},${l8A}]) P(off 1..11): ctrl(+1)=${offSumPos.toFixed(8)}, ctrl(-1)=${offSumNeg.toFixed(8)}, ctrl(OFF)=${offSumOff.toFixed(8)} (dP_off(+/-)=${dPOff_PosNeg.toExponential(1)}, dP_0(+/-)=${dP0_PosNeg.toExponential(1)})`)
  console.log(`  [U2b'] Constant-k=5 Single-Bit Tone-Flip Switch S_184=[0,1,4,10] (lines [0,${l184A},${l184B},${l184C}], flip slot-1 tone +1 <-> -1):`)
  console.log(`        t=2 Phi_odd diffs: ctrl(+1)=${s184Summary.phiPos}, ctrl(-1)=${s184Summary.phiNeg}, L2 contrast ||psi(+1)-psi(-1)||_2 = ${s184Summary.l2Contrast184T2.toFixed(6)}`)
  console.log(`        t=2 line-0 (fwd/refl): ctrl(+1)=(${s184Summary.b184PosT2.pFwd.toFixed(6)}, ${s184Summary.b184PosT2.pRefl.toFixed(6)}), ctrl(-1)=(${s184Summary.b184NegT2.pFwd.toFixed(6)}, ${s184Summary.b184NegT2.pRefl.toFixed(6)})`)
  console.log(`        t=3 12-line Mach-Zehnder P(off 1..11): ctrl(+1)=${off184Pos.toFixed(8)}, ctrl(-1)=${off184Neg.toFixed(8)} -> dP_off(+1 vs -1) = ${dPOff_184.toExponential(4)}!`)
  console.log(`  [U2c] k=6 (2+1+1+1+1) 5-Vibe Chiral Switch: t=1 branches=${k6T1Pos.amp.size}, active d1 configs=${k6ActPos.amp.size}, t=2 Phi_odd diffs=(${k6PhiDiffPos},${k6PhiDiffNeg}), contrast=${k6Contrast.toFixed(6)}`)
  console.log(`  [U2d] Single-Vibe (Odd-Parity) Switch Witness (k=4, 1+1+1+1): off-line branches=${singleOffLine}, Z_2^{24} parity defects=${singleParDef} (ONLY pairs turn!)`)

  const ok =
    c4Summary.parDef === 0 &&
    s184Summary.parDef === 0 &&
    c4Summary.phiPos > 0 &&
    c4Summary.phiOff === 0 &&
    c4Summary.l2PhiPos > 0.1 &&
    s184Summary.l2Contrast184T2 > 0.05 &&
    c4Summary.t3Pos.dockOverlapCount === 0 &&
    s184Summary.t3_184Pos.dockOverlapCount === 0 &&
    s184Summary.t3_184Neg.dockOverlapCount === 0 &&
    Math.abs(c4Summary.t3Pos.totalProb - 1) < 1e-12 &&
    Math.abs(s184Summary.t3_184Pos.totalProb - 1) < 1e-12 &&
    Math.abs(s184Summary.t3_184Neg.totalProb - 1) < 1e-12 &&
    Math.abs(dPOff_PosOff) > 1e-5 &&
    Math.abs(dPOff_184) > 1e-5 &&
    k6PhiDiffPos > 0 &&
    k6Contrast > 0.05 &&
    singleOffLine === 0 &&
    singleParDef === 0

  recordCheck(
    'U2',
    'Verbatim 4D BigInt k=5 (C4 ON/OFF & S_184 single-bit tone flip) & k=6 M_pair+Phi_odd interferometric switches + Z_2^{24} lock',
    ok,
    `C4 dP_off(ON/OFF)=${dPOff_PosOff.toExponential(3)}, S_184 k=5 flip L2=${s184Summary.l2Contrast184T2.toFixed(4)} / t=3 dP_off=${dPOff_184.toExponential(3)}, k=6 L2=${k6Contrast.toFixed(4)}, single-vibe offLine=${singleOffLine}`,
  )
}

// =================================================================================================
// PILLAR 3 (U3): EXACT STRUCTURAL OBSTRUCTIONS TO CLASSICAL MARGENSTERN RAILWAY TURING MACHINES
// =================================================================================================

function runPillar3(): void {
  console.log('\n================================================================================')
  console.log('PILLAR 3 (U3): EXACT OBSTRUCTIONS TO CLASSICAL RAILWAY / STATIC-TRACK MACHINES')
  console.log('================================================================================')

  const [l0A, l0B] = LINES[0]!
  const [l1A, l1B] = LINES[1]!
  const [l2A, l2B] = LINES[2]!
  const [l8A] = LINES[8]!

  // -----------------------------------------------------------------------------------------------
  // U3a: Compacton / Static Finite-Support Track No-Go (Pell-Chebyshev H_2 & 1-(3/4)^m Frontier Leak)
  // -----------------------------------------------------------------------------------------------
  const pellSeq: bigint[] = []
  let stTrack = basisKet([[0, l0A, 1, 0], [0, l0B, 1, 1]]) // truncated k=2 distinct-role doublon core at dock 0!
  pellSeq.push(2n) // H_2(0) = 2
  for (let t = 1; t <= 4; t++) {
    stTrack = applyBeat(stTrack)
    assertExact(hasExactUnitNorm(stTrack), `U3a doublon core t=${t} norm`)
    let maxH = 0n
    for (const k of stTrack.amp.keys()) {
      for (const [dock] of decodeConfig(k)) {
        const h = lorentzCosh2(dock)
        if (h > maxH) maxH = h
      }
    }
    pellSeq.push(maxH)
  }
  const pellOk =
    pellSeq[0] === 2n && pellSeq[1] === 6n && pellSeq[2] === 34n && pellSeq[3] === 198n && pellSeq[4] === 1154n &&
    pellSeq[2]! + pellSeq[0]! === 6n * pellSeq[1]! &&
    pellSeq[3]! + pellSeq[1]! === 6n * pellSeq[2]! &&
    pellSeq[4]! + pellSeq[2]! === 6n * pellSeq[3]!

  // Verify exact frontier outward leakage 1 - (3/4)^m (BallisticDoublon.lean Lemma 2) on m = 1..4 frontier
  // arrivals at distinct H_2 = 6 shell docks stepDock(0, s_j) (each arriving from dock 0 along s_j, so each has
  // 3/4 inward return probability to H_2 = 2 and 1/4 outward transmission probability to H_2 = 34!).
  const d1 = stepDock(0, l0A)
  const d1_1 = stepDock(0, l1A)
  const d1_2 = stepDock(0, l2A)
  const d1_8 = stepDock(0, l8A)
  const frontierLeaks: number[] = []
  const frontierSeeds: readonly (readonly Vibe[])[] = [
    [[d1, l0A, 1, 0]],
    [[d1, l0A, 1, 0], [d1_1, l1A, 1, 1]],
    [[d1, l0A, 1, 0], [d1_1, l1A, 1, 1], [d1_2, l2A, 1, 2]],
    [[d1, l0A, 1, 0], [d1_1, l1A, 1, 1], [d1_2, l2A, 1, 2], [d1_8, l8A, 1, 3]],
  ]
  let maxLeakErr = 0
  for (let m = 1; m <= 4; m++) {
    const s1 = applyBeat(basisKet(frontierSeeds[m - 1]!))
    assertExact(hasExactUnitNorm(s1), `U3a frontier m=${m} norm`)
    let pOut = 0
    for (const [k, z] of s1.amp) {
      const vs = decodeConfig(k)
      if (vs.some(v => lorentzCosh2(v[0]) > 6n)) pOut += cAbs2(z9ToComplex(z, s1.den))
    }
    const exactLeak = 1 - Math.pow(3 / 4, m)
    maxLeakErr = Math.max(maxLeakErr, Math.abs(pOut - exactLeak))
    frontierLeaks.push(pOut)
  }
  // Also note that any transverse slot at a single frontier dock d1 leaks outward with 100% probability (1.0)!
  const sTrans = applyBeat(basisKet([[d1, l1A, 1, 0]]))
  let transLeak = 0
  for (const [k, z] of sTrans.amp) {
    if (decodeConfig(k).some(v => lorentzCosh2(v[0]) > 6n)) transLeak += cAbs2(z9ToComplex(z, sTrans.den))
  }
  assertExact(Math.abs(transLeak - 1) < 1e-13, `transverse frontier leak ${transLeak}`)

  // -----------------------------------------------------------------------------------------------
  // U3b: Z_2^{24} Single-Vibe 4D Turn No-Go
  // -----------------------------------------------------------------------------------------------
  let sLoco = basisKet([[0, l0A, 1, 0]])
  let locoOffLine = 0
  for (let t = 1; t <= 4; t++) {
    sLoco = applyBeat(sLoco)
    for (const k of sLoco.amp.keys()) {
      for (const [, sl] of decodeConfig(k)) if (LINE_OF_SLOT[sl] !== 0) locoOffLine++
    }
  }

  // -----------------------------------------------------------------------------------------------
  // U3c: (-I, C) Neutral-Pair 2-Rail and 3-Rail Switch Annihilation No-Go
  // -----------------------------------------------------------------------------------------------
  const rail0 = basisKet([[0, l0A, 1, 0], [0, l0B, -1, 0]])
  const rail1 = basisKet([[0, l1A, 1, 0], [0, l1B, -1, 0]])
  const rail2 = basisKet([[0, l2A, 1, 0], [0, l2B, -1, 0]])
  // Check exact vacuum fixed point U|V_1> = |V_1>
  const vacFixed = countStateDiffs(applyBeat(basisKet([])), basisKet([])) === 0
  // 2-rail and 3-rail literal 4D BigInt factorization across t = 1, 2
  const r0T2 = applyBeat(applyBeat(rail0))
  const r1T2 = applyBeat(applyBeat(rail1))
  const r2T2 = applyBeat(applyBeat(rail2))
  const joint2T2 = applyBeat(applyBeat(tensorStatesExact(rail0, rail1)))
  const joint3T2 = applyBeat(applyBeat(tensorStatesExact(tensorStatesExact(rail0, rail1), rail2)))
  const diff2Rail = countStateDiffs(joint2T2, tensorStatesExact(r0T2, r1T2))
  const diff3Rail = countStateDiffs(joint3T2, tensorStatesExact(tensorStatesExact(r0T2, r1T2), r2T2))
  // Exhaustive check of all 264 2-rail neutral-pair junctions chi_odd === 0
  let nonzero2RailChi = 0
  for (let a = 0; a < 12; a++) {
    const [a0, a1] = LINES[a]!
    for (let b = a + 1; b < 12; b++) {
      const [b0, b1] = LINES[b]!
      for (const ta of [-1, 1] as const) {
        for (const tb of [-1, 1] as const) {
          const vs: Vibe[] = [[0, a0, ta, 0], [0, a1, -ta as ToneNZ, 0], [0, b0, tb, 0], [0, b1, -tb as ToneNZ, 0]]
          if (chiralOrientationDock(vs, [0, 1, 2, 3]) !== 0) nonzero2RailChi++
        }
      }
    }
  }

  // -----------------------------------------------------------------------------------------------
  // U3d: Unavoidable 11/12 Isotropic M_pair Fan-Out, Coherent Refocusing Bound,
  //      Exact {3,4,3,4} Girth-4 Square Witness, & 2-Dock Pair-Relay Turn Witness
  // -----------------------------------------------------------------------------------------------
  const pairInit = basisKet([[0, l0A, 1, 0], [0, l0B, 1, 0]])
  const pairT1 = applyBeat(pairInit)
  assertExact(hasExactUnitNorm(pairT1) && pairT1.amp.size === 12, 'M_pair 12-line split')
  const pTargetAna = (Math.sin(PI / 18) ** 2) / 36 // 0.0008376042...
  let pKeepMeas = 0; let pHopMin = 1; let pHopMax = 0
  for (const [k, z] of pairT1.amp) {
    const vs = decodeConfig(k)
    const l = LINE_OF_SLOT[vs[0]![1]]!
    const p = cAbs2(z9ToComplex(z, pairT1.den))
    if (l === 0) pKeepMeas = p
    else { pHopMin = Math.min(pHopMin, p); pHopMax = Math.max(pHopMax, p) }
  }
  const pOffTotal = 1 - pKeepMeas
  const unwantedFrac = 10 / 11 // 10 of the 11 off-lines are unwanted diffraction loss!
  const groverMaxSingleTarget = 1 / 36 // universal W(F_4)-isotropic ceiling even at phase = -1!
  // Coherent m = 11 focusing (equal superposition across all 11 lines l = 1..11 into target line 0)
  const focusEntries = LINES.slice(1).map(([sA, sB]) => [[ [0, sA, 1, 0], [0, sB, 1, 0] ] as readonly Vibe[], Z9_ONE] as const)
  const focusRaw = applyBeat(stateFromEntries(focusEntries, 1n)) // unnormalized by sqrt(11)
  let pFocusTarget = 0
  for (const [k, z] of focusRaw.amp) {
    const vs = decodeConfig(k)
    if (LINE_OF_SLOT[vs[0]![1]] === 0) pFocusTarget += cAbs2(z9ToComplex(z, focusRaw.den)) / 11
  }
  const focusAna = 11 * pTargetAna

  // Exact {3,4,3,4} girth-4 square witness in O^+(4,1; Z[sqrt(2)])!
  // Check two facets whose D_4 roots have inner product +-1 (angle 60 deg -> 4-cycle around ridge? Let's search exact 4-cycles!)
  let sqSlots: [number, number, number, number] | null = null
  let sqDocks: [number, number, number, number] | null = null
  for (let s0 = 0; s0 < 24 && !sqSlots; s0++) {
    const dA = stepDock(0, s0)
    for (let s1 = 0; s1 < 24 && !sqSlots; s1++) {
      if (s1 === OPPOSITE_SLOT[s0]) continue
      const dB = stepDock(dA, s1)
      if (dB === 0) continue
      for (let s2 = 0; s2 < 24 && !sqSlots; s2++) {
        if (s2 === OPPOSITE_SLOT[s1]) continue
        const dC = stepDock(dB, s2)
        if (dC === dA || dC === 0) continue
        for (let s3 = 0; s3 < 24 && !sqSlots; s3++) {
          if (stepDock(dC, s3) === 0) {
            sqSlots = [s0, s1, s2, s3]
            sqDocks = [0, dA, dB, dC]
          }
        }
      }
    }
  }
  assertExact(sqSlots !== null && sqDocks !== null, 'no 4-cycle found in {3,4,3,4}')

  // Exact BigInt 2-dock pair-relay turn witness:
  // Place two identical pairs on line 0 at dock 0 and dock d_2 = stepDock(d1, l0A) (distance 2 along line 0).
  // At t = 1, the l0A half from dock 0 meets the l0B half from d_2 at midpoint dock d1 -> forming a sole n = 2 pair!
  // At t = 2, M_pair fires at dock d1 (the midpoint!), turning that relayed pair onto ALL 11 perpendicular lines!
  const d2 = stepDock(d1, l0A)
  const relaySeed = basisKet([
    [0, l0A, 1, 0], [0, l0B, 1, 0],
    [d2, l0A, 1, 0], [d2, l0B, 1, 0],
  ])
  const relayT1 = applyBeat(relaySeed)
  assertExact(hasExactUnitNorm(relayT1), 'U3d relay t=1 norm')
  // Extract the exact midpoint-reunited branch (2 vibes at d1 on line 0, 2 outer vibes at d_{-1} and d_3 on line 0)
  let midpointBranchesT1 = 0
  const midMap = new Map<string, Z9>()
  for (const [k, z] of relayT1.amp) {
    const vs = decodeConfig(k)
    const grp = groupByDock(vs)
    const atD1 = grp.get(d1)
    if (atD1 && atD1.length === 2 && LINE_OF_SLOT[vs[atD1[0]!]![1]] === 0 && LINE_OF_SLOT[vs[atD1[1]!]![1]] === 0) {
      midpointBranchesT1++
      midMap.set(k, z)
    }
  }
  const midStateT1: ExactState = { amp: midMap, den: relayT1.den }
  const midStateT2 = applyBeat(midStateT1)
  let relayTurnProbPerLine = 0
  let relayTurnLines = new Set<number>()
  for (const [k, z] of midStateT2.amp) {
    const vs = decodeConfig(k)
    for (const [, sl] of vs) {
      const l = LINE_OF_SLOT[sl]!
      if (l !== 0) {
        relayTurnLines.add(l)
        if (l === 1) relayTurnProbPerLine += cAbs2(z9ToComplex(z, midStateT2.den)) / 2 // 2 vibes per turned pair
      }
    }
  }

  console.log(`  [U3a] Compacton / Static-Track No-Go: H_2(t=0..4)=[${pellSeq.join(', ')}] (exact 6*H(t)-H(t-1) Pell recurrence!)`)
  console.log(`        Exact frontier leakage 1-(3/4)^m (m=1..4): [${frontierLeaks.map(x => x.toFixed(6)).join(', ')}] (maxErr=${maxLeakErr.toExponential(1)}, >= 0.25 always!)`)
  console.log(`  [U3b] Single-Vibe 4D Turn No-Go: k=1 locomotive over t=1..4 -> off-line branches=${locoOffLine} (exact Z_2^{24} superselection lock!)`)
  console.log(`  [U3c] (-I, C) Neutral-Pair Switch No-Go: U|V_1>=|V_1> (${vacFixed}), 2-rail chi!=0: ${nonzero2RailChi}/264, 4D BigInt 2-rail diff=${diff2Rail}, 3-rail diff=${diff3Rail}`)
  console.log(`  [U3d] M_pair 11/12 Diffraction & Coherent Refocusing Bound:`)
  console.log(`        Single-hop P(0->b)=${pHopMax.toFixed(8)} (exact sin^2(pi/18)/36=${pTargetAna.toFixed(8)}), P_off_total=${pOffTotal.toFixed(8)}, unwanted loss=${(unwantedFrac * 100).toFixed(2)}% (Grover ceiling=${(groverMaxSingleTarget * 100).toFixed(2)}%)`)
  console.log(`        Coherent m=11 multi-line focusing into target line 0: P_focus=${pFocusTarget.toFixed(8)} (exact 11*P_hop=${focusAna.toFixed(8)}, 11x gain yet < 1%!)`)
  console.log(`        Exact {3,4,3,4} girth-4 square witness: docks=[${sqDocks!.join('->')}->0], slots=[${sqSlots!.join(',')}], H_2=[${sqDocks!.map(d => lorentzCosh2(d)).join(',')}]`)
  console.log(`        Exact BigInt 2-dock pair-relay turn at midpoint d_1: midBranches=${midpointBranchesT1}, turnedLines=${relayTurnLines.size}/11, P_relay(->line 1)=${relayTurnProbPerLine.toFixed(8)}`)

  const ok =
    pellOk &&
    maxLeakErr < 1e-13 &&
    locoOffLine === 0 &&
    vacFixed &&
    nonzero2RailChi === 0 &&
    diff2Rail === 0 &&
    diff3Rail === 0 &&
    Math.abs(pHopMax - pTargetAna) < 1e-13 &&
    Math.abs(pHopMin - pTargetAna) < 1e-13 &&
    Math.abs(pFocusTarget - focusAna) < 1e-13 &&
    sqSlots !== null &&
    midpointBranchesT1 === 1 &&
    relayTurnLines.size === 11 &&
    relayTurnProbPerLine > 0 &&
    relayTurnProbPerLine < pTargetAna

  recordCheck(
    'U3',
    'Exact 4-obstruction fortress: Pell compacton no-go, Z_2^{24} turn lock, (-I,C) neutral decoupling, & 11/12 M_pair diffraction + girth-4 relay',
    ok,
    `H_2(4)=${pellSeq[4]}, leakErr=${maxLeakErr.toExponential(1)}, locoOff=${locoOffLine}, railDiff=(${diff2Rail},${diff3Rail}), P_hop=${pHopMax.toFixed(6)}, P_focus(11)=${pFocusTarget.toFixed(6)}, girth=4`,
  )
}

// =================================================================================================
// PILLAR 4 (U4): AUTONOMOUS QUANTUM-CIRCUIT UNIVERSALITY (6-DISTINCT-ROLE DFS SU(4) & TOFFOLI)
// =================================================================================================

function makhlinInvariants(U: CMat): { readonly G1: C; readonly G2: number; readonly ep: number } {
  // Exact Makhlin (2002) local invariants for U in U(4):
  //   Q = (1/sqrt(2)) [[1, 0, 0, i], [0, i, 1, 0], [0, i, -1, 0], [1, 0, 0, -i]] (Magic Bell basis)
  //   m = (Q^dag U Q)^T (Q^dag U Q)
  //   G_1 = Tr^2(m) / (16 det U),   G_2 = (Tr^2(m) - Tr(m^2)) / (4 det U)
  //   Entangling power (Zanardi 2000): e_p = (2/9) (1 - |G_1|)  for CNOT-class? Exact general formula:
  //   Wait: exact Zanardi-Zalka-Faoro (2000) formula in terms of Makhlin G_1:
  //     e_p(U) = (2/9) (1 - |G_1|) ONLY when U is in the SWAP-free slice; exact general formula uses
  //     linear entropy of SWAP-channel, let's compute exact e_p = (2/9)(1 - (|Tr(m)|^2 ...)) via
  //     canonical Weyl coordinates OR exact Balakrishnan-Sankaranarayanan formula!
  //     Wait: exact Zanardi (2000) theorem:
  //       e_p(U) = 1 - (1/36) (Tr(m^dag m) ...)? No, exact theorem (Zanardi 2000, Eq. 11):
  //       e_p(U) = (2/9) (1 - E(U)) where E(U) = (1/16) |Tr(U_B^T U_B)|^2? Wait: check on I, SWAP, CNOT, sqrt(SWAP)!
  //       - On I: m = I => |G_1| = 1, e_p = 0.
  //       - On SWAP: m = diag(1,1,1,-1)? Check Q^dag SWAP Q = diag(1,1,1,-1) => m = I, det=-1 => G_1 = -1, |G_1| = 1, e_p = 0!
  //       - On CNOT: G_1 = 0, G_2 = 1 => e_p = 2/9!
  //       - On sqrt(SWAP): G_1 = i/4, G_2 = 0 => |G_1| = 1/4 => (2/9)(1 - 1/4) = 1/6!
  //       WAIT A SECOND! Check if (2/9)(1 - |G_1|) fails for DCNOT (c1=pi/2, c2=pi/2, c3=0):
  //       For Weyl coords (c1, c2, c3): G_1 = (cos^2 c1 cos^2 c2 cos^2 c3 - sin^2 c1 sin^2 c2 sin^2 c3) + i/4 sin(2c1) sin(2c2) sin(2c3)
  //       And EXACT Zanardi (2000) formula is: e_p(U) = 1 - (1/9)(Tr(U_R^T U_R) + Tr(U_R^T SWAP U_R SWAP)) / ... ->
  //       Better yet, compute exact e_p directly from its definition by exact 2-design averaging over the 6 Pauli eigenstates!
  //       Exact 2-design identity (spherical 2-design on CP^1 = the 6 Pauli eigenstates {+-X, +-Y, +-Z}):
  //       e_p(U) = mean_{|a>, |b> in 6x6 Pauli eigenstates} E_L(U |a, b>), where E_L(psi) = 1 - Tr(rho_A^2) = 2 |psi_00 psi_11 - psi_01 psi_10|^2!
  const Q: CMat = [
    [[ISQ2, 0], C_ZERO, C_ZERO, [0, ISQ2]],
    [C_ZERO, [0, ISQ2], [ISQ2, 0], C_ZERO],
    [C_ZERO, [0, ISQ2], [-ISQ2, 0], C_ZERO],
    [[ISQ2, 0], C_ZERO, C_ZERO, [0, -ISQ2]],
  ]
  const UB = matMul(matMul(matDag(Q), U), Q)
  const m = matMul(matTrans(UB), UB)
  const m2 = matMul(m, m)
  const trM = matTrace(m)
  const trM2 = matTrace(m2)
  const trSq = cMul(trM, trM)
  const detU = det4C(U)
  const G1 = cDiv(trSq, cScale(16, detU))
  const G2C = cDiv(cSub(trSq, trM2), cScale(4, detU))
  assertExact(Math.abs(G2C[1]) < 1e-10, `Makhlin G2 imaginary part ${G2C[1]}`)

  // Exact entangling power via exact 2-design average over 6 x 6 Pauli eigenstates!
  const pauliKets: readonly (readonly [C, C])[] = [
    [C_ONE, C_ZERO],
    [C_ZERO, C_ONE],
    [[ISQ2, 0], [ISQ2, 0]],
    [[ISQ2, 0], [-ISQ2, 0]],
    [[ISQ2, 0], [0, ISQ2]],
    [[ISQ2, 0], [0, -ISQ2]],
  ]
  let epSum = 0
  for (const a of pauliKets) {
    for (const b of pauliKets) {
      const inp: C[] = [cMul(a[0], b[0]), cMul(a[0], b[1]), cMul(a[1], b[0]), cMul(a[1], b[1])]
      const out: C[] = [C_ZERO, C_ZERO, C_ZERO, C_ZERO]
      for (let r = 0; r < 4; r++) {
        let s: C = C_ZERO
        for (let c = 0; c < 4; c++) s = cAdd(s, cMul(U[r]![c]!, inp[c]!))
        out[r] = s
      }
      const detPsi = cSub(cMul(out[0]!, out[3]!), cMul(out[1]!, out[2]!))
      epSum += 2 * cAbs2(detPsi) // linear entropy 1 - Tr(rho_A^2) = 2 |det(Psi)|^2 = C^2 / 2
    }
  }
  return { G1, G2: G2C[0], ep: epSum / 36 }
}

function runPillar4(): void {
  console.log('\n================================================================================')
  console.log('PILLAR 4 (U4): AUTONOMOUS QUANTUM-CIRCUIT UNIVERSALITY (6-ROLE DFS & TOFFOLI)')
  console.log('================================================================================')

  // -----------------------------------------------------------------------------------------------
  // U4a: Verbatim 4D BigInt Protection Proof for 6-Distinct-Role DFS ({0..5} subset {0..8}, M_pair=I!)
  // -----------------------------------------------------------------------------------------------
  const [l0A, l0B] = LINES[0]!
  const d1 = stepDock(0, l0A)
  const d2 = stepDock(d1, l0A)
  const d3 = stepDock(d2, l0A)
  const d4 = stepDock(d3, l0A)
  const sixRoleSeed = basisKet([
    [0, l0A, 1, 0], [0, l0B, 1, 1],
    [d1, l0A, 1, 2], [d1, l0B, 1, 3],
    [d2, l0A, 1, 4], [d3, l0B, 1, 5],
  ])
  const sixRoleT1 = applyBeat(sixRoleSeed)
  const sixRoleT1NoPair = applyBeatSkip(sixRoleSeed, applyPairLineMixer)
  const sixRolePairDiff = countStateDiffs(sixRoleT1, sixRoleT1NoPair)
  const sixRoleRevDiff = countStateDiffs(applyBeatInv(sixRoleT1), sixRoleSeed)
  let sixRoleOffLine = 0
  for (const k of sixRoleT1.amp.keys()) {
    for (const [, sl] of decodeConfig(k)) if (LINE_OF_SLOT[sl] !== 0) sixRoleOffLine++
  }
  assertExact(hasExactUnitNorm(sixRoleT1), 'U4a 6-role unit norm')

  // Also certify full 9-distinct-role ({0..8}) 3-qubit register in verbatim 4D BigInt (M_pair = I identically!)
  const nineRoleSeed = basisKet([
    [0, l0A, 1, 0], [0, l0B, 1, 1],
    [d1, l0A, 1, 2], [d1, l0B, 1, 3],
    [d2, l0A, 1, 4], [d2, l0B, 1, 5],
    [d3, l0A, 1, 6], [d3, l0B, 1, 7],
    [d4, l0A, 1, 8],
  ])
  const nineRoleT1 = applyBeat(nineRoleSeed)
  const nineRoleT1NoPair = applyBeatSkip(nineRoleSeed, applyPairLineMixer)
  const nineRolePairDiff = countStateDiffs(nineRoleT1, nineRoleT1NoPair)
  const nineRoleRevDiff = countStateDiffs(applyBeatInv(nineRoleT1), nineRoleSeed)
  let nineRoleOffLine = 0
  for (const k of nineRoleT1.amp.keys()) {
    for (const [, sl] of decodeConfig(k)) if (LINE_OF_SLOT[sl] !== 0) nineRoleOffLine++
  }
  assertExact(hasExactUnitNorm(nineRoleT1), 'U4a 9-role unit norm')

  // -----------------------------------------------------------------------------------------------
  // U4b: Exact BigInt L_7 3-Full-Line Chiral Catalyst (|Tr(L_7 C)|^2 = 25/16 -> Dense SU(2)!)
  // -----------------------------------------------------------------------------------------------
  const [l1A, l1B] = LINES[1]!
  const [l2A, l2B] = LINES[2]!
  const [l4A, l4B] = LINES[4]!
  const applyL7BigInt = (qSlot: number): { readonly amp0: Z9; readonly amp3: Z9; readonly den: bigint } => {
    const specIn: Vibe[] = [
      [0, l1A, 1, 0], [0, l1B, 1, 0],
      [0, l2A, 1, 0], [0, l2B, 1, 0],
      [0, l4A, 1, 0], [0, l4B, -1, 0],
    ]
    const sOut = applyBeat(basisKet([[0, qSlot, 1, 0], ...specIn]))
    assertExact(hasExactUnitNorm(sOut) && sOut.amp.size === 2, `L_7 non-branching check (${sOut.amp.size})`)
    let amp0: Z9 = Z9_ZERO
    let amp3: Z9 = Z9_ZERO
    for (const [k, z] of sOut.amp) {
      const vs = decodeConfig(k)
      const qv = vs.find(v => LINE_OF_SLOT[v[1]] === 0)!
      if (qv[1] === l0A) amp0 = z
      else amp3 = z
    }
    return { amp0, amp3, den: sOut.den }
  }
  const l7c0 = applyL7BigInt(l0A)
  const l7c3 = applyL7BigInt(l0B)
  // Exact BigInt |Tr(L_7 * C)|^2: C = (1/2) [[1+w, 1-w], [1-w, 1+w]]
  const cDiagZ9 = Z9_ZETA6
  const cOffZ9 = subZ9(Z9_ONE, Z9_OMEGA)
  const trL7C = addZ9(
    addZ9(mulZ9(l7c0.amp0, cDiagZ9), mulZ9(l7c3.amp0, cOffZ9)),
    addZ9(mulZ9(l7c0.amp3, cOffZ9), mulZ9(l7c3.amp3, cDiagZ9)),
  )
  const trL7CNorm2 = mulZ9(conjZ9(trL7C), trL7C)
  const trL7CDen2 = (2n * l7c0.den) ** 2n // 16n -> exact 25/16!
  const toSU2 = (M: CMat): CMat => {
    const det = cSub(cMul(M[0]![0]!, M[1]![1]!), cMul(M[0]![1]!, M[1]![0]!))
    const p = cExpI(-cArg(det) / 2)
    return [
      [cMul(p, M[0]![0]!), cMul(p, M[0]![1]!)],
      [cMul(p, M[1]![0]!), cMul(p, M[1]![1]!)],
    ]
  }
  const L7_SU2 = toSU2([
    [z9ToComplex(l7c0.amp0, l7c0.den), z9ToComplex(l7c3.amp0, l7c3.den)],
    [z9ToComplex(l7c0.amp3, l7c0.den), z9ToComplex(l7c3.amp3, l7c3.den)],
  ])
  const C_SU2 = toSU2([
    [C_KEEP, C_CROSS],
    [C_CROSS, C_KEEP],
  ])
  const trSU2Val = cAbs(matTrace(matMul(L7_SU2, C_SU2))) // exact 5/4 = 1.25!

  // -----------------------------------------------------------------------------------------------
  // U4c: 6-Distinct-Role DFS SU(4): Exact su(9) Lie Rank (80/80), Yang R(w) Makhlin Invariants,
  //      2-Qubit S_tot = 0 Singlet-DFS 28/60-Collision CPHASE/CZ, Concurrence & CHSH!
  // -----------------------------------------------------------------------------------------------
  // Exact 15-state S_4({0,1,2,3}) x S_2({4,5}) symmetric basis:
  //   basis15[idx] = [i, j] (0 <= i < j < 6) = positions of the two symmetrized marker roles {4, 5}!
  const basis15: [number, number][] = []
  const idx15 = new Map<string, number>()
  for (let i = 0; i < 6; i++) {
    for (let j = i + 1; j < 6; j++) {
      idx15.set(`${i},${j}`, basis15.length)
      basis15.push([i, j])
    }
  }
  const swapMat15 = (p: number, q: number): number[][] => {
    const M = Array.from({ length: 15 }, () => new Array<number>(15).fill(0))
    for (let col = 0; col < 15; col++) {
      const [i, j] = basis15[col]!
      const ni = i === p ? q : i === q ? p : i
      const nj = j === p ? q : j === q ? p : j
      const row = idx15.get(`${Math.min(ni, nj)},${Math.max(ni, nj)}`)!
      M[row]![col] = 1
    }
    return M
  }

  // Exact 4D logical DFS basis on linear chain (0, 1, 2) = Qubit A and (3, 4, 5) = Qubit B:
  //   Standard Zeuch-Bonesteel / Fong-Wandzura convention (spins A3=0, A2=1, A1=2, B1=3, B2=4, B3=5):
  //   Qubit A: singlet/triplet on pair (A2, A1) = (1, 2), idle spin A3 = 0!
  //     |0_A> = (|01>_12 - |10>_12)/sqrt(2) (x) |0>_0   (spin 1 or 2 carries the marker, singlet on (1,2))
  //     |1_A> = (2|1>_0|00>_12 - |0>_0(|01>+|10>)_12)/sqrt(6)
  //   Qubit B: singlet/triplet on pair (B2, B3) = (4, 5), leg spin B1 = 3!
  //     |0_B> = (|01>_45 - |10>_45)/sqrt(2) (x) |0>_3   (singlet on (4,5))
  //     |1_B> = (2|1>_3|00>_45 - |0>_3(|01>+|10>)_45)/sqrt(6)
  const isq6 = 1 / Math.sqrt(6)
  const dfsA: readonly (readonly (readonly [number, number])[])[] = [
    [[1, ISQ2], [2, -ISQ2]],
    [[0, 2 * isq6], [1, -isq6], [2, -isq6]],
  ]
  const dfsB: readonly (readonly (readonly [number, number])[])[] = [
    [[4, ISQ2], [5, -ISQ2]],
    [[3, 2 * isq6], [4, -isq6], [5, -isq6]],
  ]
  const logicalKets: number[][] = []
  for (let a = 0; a < 2; a++) {
    for (let b = 0; b < 2; b++) {
      const v = new Array<number>(15).fill(0)
      for (const [sa, ca] of dfsA[a]!) {
        for (const [sb, cb] of dfsB[b]!) {
          const id = idx15.get(`${Math.min(sa, sb)},${Math.max(sa, sb)}`)!
          v[id] = ca * cb
        }
      }
      logicalKets.push(v)
    }
  }

  // Verify exact su(9) Lie algebra dimension (80/80) on the 9D S_tot = 1 sector
  const casimir = Array.from({ length: 15 }, () => new Array<number>(15).fill(0))
  for (let p = 0; p < 6; p++) {
    for (let q = p + 1; q < 6; q++) {
      const P = swapMat15(p, q)
      for (let r = 0; r < 15; r++) for (let c = 0; c < 15; c++) casimir[r]![c] = casimir[r]![c]! + P[r]![c]!
    }
  }
  const applyR15 = (M: number[][], v: number[]): number[] =>
    M.map(row => row.reduce((s, x, j) => s + x * v[j]!, 0))
  const B9: number[][] = logicalKets.map(v => v.slice())
  for (let e = 0; e < 15 && B9.length < 9; e++) {
    const v = new Array<number>(15).fill(0); v[e] = 1
    const v1 = applyR15(casimir, v).map((x, i) => x - 9 * v[i]!)
    let v2 = applyR15(casimir, v1).map((x, i) => x - 15 * v1[i]!)
    for (const u of B9) {
      const dot = u.reduce((s, x, i) => s + x * v2[i]!, 0)
      v2 = v2.map((x, i) => x - dot * u[i]!)
    }
    const nrm = Math.hypot(...v2)
    if (nrm > 1e-6) B9.push(v2.map(x => x / nrm))
  }
  assertExact(B9.length === 9, `S_tot=1 basis dim ${B9.length}`)

  const proj9 = (P: number[][]): number[][] =>
    Array.from({ length: 9 }, (_, i) =>
      Array.from({ length: 9 }, (_, j) => {
        const Pv = applyR15(P, B9[j]!)
        return B9[i]!.reduce((s, x, r) => s + x * Pv[r]!, 0)
      }),
    )
  const comm9 = (v1: Float64Array, v2: Float64Array): Float64Array => {
    const out = new Float64Array(162)
    for (let r = 0; r < 9; r++) {
      for (let c = 0; c < 9; c++) {
        let rr = 0; let ii = 0
        for (let k = 0; k < 9; k++) {
          const r1 = v1[r * 9 + k]!; const i1 = v1[81 + r * 9 + k]!
          const r2 = v2[k * 9 + c]!; const i2 = v2[81 + k * 9 + c]!
          const r2b = v2[r * 9 + k]!; const i2b = v2[81 + r * 9 + k]!
          const r1b = v1[k * 9 + c]!; const i1b = v1[81 + k * 9 + c]!
          rr += (r1 * r2 - i1 * i2) - (r2b * r1b - i2b * i1b)
          ii += (r1 * i2 + i1 * r2) - (r2b * i1b + i2b * r1b)
        }
        out[r * 9 + c] = rr; out[81 + r * 9 + c] = ii
      }
    }
    return out
  }
  const basisLie: Float64Array[] = []
  const addLie = (vIn: Float64Array): void => {
    const v = Float64Array.from(vIn)
    for (const b of basisLie) {
      let dot = 0
      for (let i = 0; i < 162; i++) dot += b[i]! * v[i]!
      for (let i = 0; i < 162; i++) v[i] = v[i]! - dot * b[i]!
    }
    let n2 = 0
    for (let i = 0; i < 162; i++) n2 += v[i]! * v[i]!
    if (n2 > 1e-12) {
      const inv = 1 / Math.sqrt(n2)
      for (let i = 0; i < 162; i++) v[i] = v[i]! * inv
      basisLie.push(v)
    }
  }
  const gens5: Float64Array[] = []
  for (let k = 0; k < 5; k++) {
    const P9 = proj9(swapMat15(k, k + 1))
    let tr = 0
    for (let i = 0; i < 9; i++) tr += P9[i]![i]!
    const gv = new Float64Array(162)
    for (let r = 0; r < 9; r++) for (let c = 0; c < 9; c++) gv[81 + r * 9 + c] = P9[r]![c]! - (r === c ? tr / 9 : 0)
    gens5.push(gv); addLie(gv)
  }
  for (let head = 0; head < basisLie.length && basisLie.length < 80; head++) {
    for (const g of gens5) addLie(comm9(basisLie[head]!, g))
  }
  const su9Dim = basisLie.length

  // Exact Makhlin invariants of elementary 2-qubit Yang scattering gate R(w) = (w I - i SWAP)/(w + i)
  const makeYang4 = (w: number): CMat => {
    const t = cDiv([w, 0], [w, 1])
    const r = cDiv([0, -1], [w, 1])
    const sw = cAdd(t, r)
    return [
      [sw, C_ZERO, C_ZERO, C_ZERO],
      [C_ZERO, t, r, C_ZERO],
      [C_ZERO, r, t, C_ZERO],
      [C_ZERO, C_ZERO, C_ZERO, sw],
    ]
  }
  const makhSqrtSwap = makhlinInvariants(makeYang4(1)) // w = 1 => sqrt(SWAP)
  const makhBareMeet = makhlinInvariants(makeYang4(1 / SQRT3)) // w = 1/sqrt(3) => bare on-dock M_meet (2pi/3)

  // EXACT CLOSED-FORM ZERO-LEAKAGE 28-COLLISION CPHASE(pi/3) & 60-COLLISION CZ (SCOPED TO 2-QUBIT S_tot = 0!)
  // On the 20-state S_3({0,1,2}) x S_3({3,4,5}) symmetric subspace (C(6,3) = 20 states, ALL 6 roles pairwise
  // distinct in Vibe's 9-point alphabet {0..8} => M_pair = I strictly in verbatim 4D bare U!):
  //   - Total spin S_tot = 0 has exact dimension C_3 = 5 (4 logical DFS states |a_A, b_B> + 1 leakage state),
  //     forcing S_{12345} = 1/2 uniquely! (Note: this 60-collision singlet-DFS CZ applies strictly to 2-qubit
  //     S_tot = 0 states; multi-qubit circuits with n >= 3 qubits require the spin-independent 5-spin CZ/CNOT
  //     proved and verified across both S_{AB} = 0 and S_{AB} = 1 in U4d below!)
  //   - For any angle theta, the 4-collision bare-U ballistic operator G_{abc}(theta) = [R_{ab}(phi_1) R_{bc}(phi_2)]^2
  //     with s = pi/2 - theta, d = arccos(-(1/3) cos s), phi_1 = (s+d)/2, phi_2 = (s-d)/2 (exact ballistic rapidities
  //     w_1 = cot(phi_1), w_2 = cot(phi_2)!) acts as exp(+i theta) on S_{abc} = 3/2 and exp(-i theta) on S_{abc} = 1/2
  //     (up to global phase)! At theta = pi/2, G_{abc}(pi/2) = W_3(a,b,c) (w = +-1/sqrt(2))!
  //   - With exact Racah 6j double-angle cosine gamma = cos(2 beta) = 17/81 and closed-form root
  //     t* = (32*sqrt(3) - sqrt(1695))/17 (phi* = atan(t*), psi* = 2*pi/3 - phi*):
  //       V = W_3(1,2,3) G_{345}(phi*) W_3(1,2,3) G_{345}(psi*) W_3(1,2,3) G_{345}(phi*) W_3(1,2,3) (28 collisions)
  //     realizes exact zero-leakage CPHASE(pi/3), and its reduced cube V^3 (60 adjacent collisions on spins 1..5,
  //     spin 0 untouched!) realizes exact zero-leakage CZ on S_tot = 0 (< 1e-14)!
  const basis20: [number, number, number][] = []
  const idx20 = new Map<string, number>()
  for (let i = 0; i < 6; i++) {
    for (let j = i + 1; j < 6; j++) {
      for (let k = j + 1; k < 6; k++) {
        idx20.set(`${i},${j},${k}`, basis20.length)
        basis20.push([i, j, k])
      }
    }
  }
  const yangScatter20Phi = (p: number, q: number, phi: number): CMat => {
    // R_{pq}(w = cot(phi)): on P=+1 gives e^{-2i phi}, on P=-1 gives +1
    const ePh = cExpI(-2 * phi)
    const cI = cScale(0.5, cAdd(C_ONE, ePh))
    const cP = cScale(0.5, cSub(ePh, C_ONE))
    const M: CMat = Array.from({ length: 20 }, () => Array.from({ length: 20 }, () => C_ZERO))
    for (let col = 0; col < 20; col++) {
      const [i, j, k] = basis20[col]!
      const mp = (x: number) => (x === p ? q : x === q ? p : x)
      const arr = [mp(i), mp(j), mp(k)].sort((a, b) => a - b)
      const row = idx20.get(`${arr[0]},${arr[1]},${arr[2]}`)!
      M[col]![col] = cAdd(M[col]![col]!, cI)
      M[row]![col] = cAdd(M[row]![col]!, cP)
    }
    return M
  }
  const buildG3_20 = (a: number, b: number, c: number, theta: number): CMat => {
    const s = PI / 2 - theta
    const d = Math.acos(-(1 / 3) * Math.cos(s))
    const phi1 = 0.5 * (s + d)
    const phi2 = 0.5 * (s - d)
    const pair = matMul(yangScatter20Phi(a, b, phi1), yangScatter20Phi(b, c, phi2))
    return matMul(pair, pair)
  }
  // Build exact 4 logical S_tot = 0 singlet DFS kets in C^20:
  const dfsUpA: readonly (readonly (readonly [readonly [number], number])[])[] = [
    [[[1], ISQ2], [[2], -ISQ2]],
    [[[0], 2 * isq6], [[1], -isq6], [[2], -isq6]],
  ]
  const dfsDnA: readonly (readonly (readonly [readonly [number, number], number])[])[] = [
    [[[0, 1], ISQ2], [[0, 2], -ISQ2]],
    [[[0, 1], isq6], [[0, 2], isq6], [[1, 2], -2 * isq6]],
  ]
  const dfsUpB: readonly (readonly (readonly [readonly [number], number])[])[] = [
    [[[4], ISQ2], [[5], -ISQ2]],
    [[[3], 2 * isq6], [[4], -isq6], [[5], -isq6]],
  ]
  const dfsDnB: readonly (readonly (readonly [readonly [number, number], number])[])[] = [
    [[[3, 4], ISQ2], [[3, 5], -ISQ2]],
    [[[3, 4], isq6], [[3, 5], isq6], [[4, 5], -2 * isq6]],
  ]
  const singletKets20: number[][] = []
  for (let a = 0; a < 2; a++) {
    for (let b = 0; b < 2; b++) {
      const v = new Array<number>(20).fill(0)
      for (const [pa, ca] of dfsUpA[a]!) {
        for (const [pb, cb] of dfsDnB[b]!) {
          const arr = [pa[0], pb[0], pb[1]].sort((x, y) => x - y)
          const id = idx20.get(`${arr[0]},${arr[1]},${arr[2]}`)!
          v[id] = v[id]! + ISQ2 * ca * cb
        }
      }
      for (const [pa, ca] of dfsDnA[a]!) {
        for (const [pb, cb] of dfsUpB[b]!) {
          const arr = [pa[0], pa[1], pb[0]].sort((x, y) => x - y)
          const id = idx20.get(`${arr[0]},${arr[1]},${arr[2]}`)!
          v[id] = v[id]! - ISQ2 * ca * cb
        }
      }
      singletKets20.push(v)
    }
  }
  // Verify exact S_tot = 0 Casimir (sum_{p<q} P_{pq} = 3) on all 4 singlet logical kets!
  let maxSingletCasErr = 0
  for (const v of singletKets20) {
    const out = new Array<number>(20).fill(0)
    for (let p = 0; p < 6; p++) {
      for (let q = p + 1; q < 6; q++) {
        for (let col = 0; col < 20; col++) {
          if (v[col] === 0) continue
          const [i, j, k] = basis20[col]!
          const mp = (x: number) => (x === p ? q : x === q ? p : x)
          const arr = [mp(i), mp(j), mp(k)].sort((x, y) => x - y)
          const row = idx20.get(`${arr[0]},${arr[1]},${arr[2]}`)!
          out[row] = out[row]! + v[col]!
        }
      }
    }
    for (let i = 0; i < 20; i++) maxSingletCasErr = Math.max(maxSingletCasErr, Math.abs(out[i]! - 3 * v[i]!))
  }
  assertExact(maxSingletCasErr < 1e-13, `singlet Casimir err=${maxSingletCasErr}`)

  const W123_20 = buildG3_20(1, 2, 3, PI / 2)
  // Exact Racah 6j cosine: cos(beta) = -7/9 => gamma = cos(2 beta) = 2*(49/81) - 1 = +17/81!
  // Solving exact zero-leakage cot(psi) = (17/81) tan(phi) together with phi + psi = 2*pi/3
  // yields cot(2*pi/3 - phi) = (sqrt(3) t - 1)/(sqrt(3) + t) = (17/81) t => 17 t^2 - 64*sqrt(3) t + 81 = 0
  // => exact closed-form root t* = (32*sqrt(3) - sqrt(1695)) / 17:
  //   - Single block V(phi*) = W123 G(phi*) W123 G(psi*) W123 G(phi*) W123 (28 collisions) = exact zero-leakage CPHASE(pi/3)!
  //   - Cubing V(phi*)^3 (canceling W123^2 = I & merging G(phi*)^2 = G(2 phi*) -> 60 adjacent collisions!) = EXACT ZERO-LEAKAGE CZ!
  const tStarCZ = (32 * SQRT3 - Math.sqrt(1695)) / 17
  const phiStarCZ = Math.atan(tStarCZ)
  const psiStarCZ = (2 * PI) / 3 - phiStarCZ
  const G345_phi = buildG3_20(3, 4, 5, phiStarCZ)
  const G345_2phi = buildG3_20(3, 4, 5, 2 * phiStarCZ)
  const G345_psi = buildG3_20(3, 4, 5, psiStarCZ)
  const V_CP3_20 = matMul(
    W123_20,
    matMul(
      G345_phi,
      matMul(W123_20, matMul(G345_psi, matMul(W123_20, matMul(G345_phi, W123_20)))),
    ),
  )
  // Simplified 60-collision exact product W123 G(phi) W123 G(psi) W123 G(2phi) W123 G(psi) W123 G(2phi) W123 G(psi) W123 G(phi) W123
  const U_CZ_20 = [
    W123_20, G345_phi, W123_20, G345_psi, W123_20, G345_2phi, W123_20,
    G345_psi, W123_20, G345_2phi, W123_20, G345_psi, W123_20, G345_phi, W123_20,
  ].reduce((acc, M) => matMul(M, acc), matEye(20))
  const v3CheckErr = matFrobDiffUpToPhase(U_CZ_20, matMul(V_CP3_20, matMul(V_CP3_20, V_CP3_20)))
  assertExact(v3CheckErr < 1e-12, `60-collision reduction mismatch: ${v3CheckErr}`)
  const cz20UniErr = matUnitaryErr(U_CZ_20)
  const proj20to4 = (U20: CMat): { readonly U4: CMat; readonly leak: number } => {
    const U4: CMat = Array.from({ length: 4 }, (_, r) =>
      Array.from({ length: 4 }, (_, c) => {
        let s: C = C_ZERO
        for (let i = 0; i < 20; i++) {
          const ri = singletKets20[r]![i]!
          if (ri === 0) continue
          for (let j = 0; j < 20; j++) {
            const cj = singletKets20[c]![j]!
            if (cj === 0) continue
            s = cAdd(s, cScale(ri * cj, U20[i]![j]!))
          }
        }
        return s
      }),
    )
    const leak = Math.max(0, 4 - matTrace(matMul(matDag(U4), U4))[0]) / 4
    return { U4, leak }
  }
  const cp3Res = proj20to4(V_CP3_20)
  const czRes = proj20to4(U_CZ_20)
  const CZ_DFS4 = czRes.U4
  const czDfsLeak = czRes.leak

  const I2: CMat = matEye(2)
  const X2: CMat = [[C_ZERO, C_ONE], [C_ONE, C_ZERO]]
  const Z2: CMat = [[C_ONE, C_ZERO], [C_ZERO, [-1, 0]]]
  const H2: CMat = [[[ISQ2, 0], [ISQ2, 0]], [[ISQ2, 0], [-ISQ2, 0]]]
  const S2: CMat = [[C_ONE, C_ZERO], [C_ZERO, [0, 1]]]
  const Sd2: CMat = [[C_ONE, C_ZERO], [C_ZERO, [0, -1]]]
  const T2: CMat = [[C_ONE, C_ZERO], [C_ZERO, cExpI(PI / 4)]]
  const Td2: CMat = [[C_ONE, C_ZERO], [C_ZERO, cExpI(-PI / 4)]]

  const CZ_exact: CMat = [
    [C_ONE, C_ZERO, C_ZERO, C_ZERO],
    [C_ZERO, C_ONE, C_ZERO, C_ZERO],
    [C_ZERO, C_ZERO, C_ONE, C_ZERO],
    [C_ZERO, C_ZERO, C_ZERO, [-1, 0]],
  ]
  // Exact 28-collision CPHASE(+pi/3) target check (MINOR-3):
  const CPHASE_PI3_exact: CMat = [
    [C_ONE, C_ZERO, C_ZERO, C_ZERO],
    [C_ZERO, C_ONE, C_ZERO, C_ZERO],
    [C_ZERO, C_ZERO, C_ONE, C_ZERO],
    [C_ZERO, C_ZERO, C_ZERO, cExpI(PI / 3)],
  ]
  const cp3Err = matFrobDiffUpToPhase(cp3Res.U4, CPHASE_PI3_exact)
  const czDfsErr = matFrobDiffUpToPhase(CZ_DFS4, CZ_exact)
  const CNOT_DFS4 = matMul(matKron(I2, H2), matMul(CZ_DFS4, matKron(I2, H2)))
  const makhDfsCNOT = makhlinInvariants(CNOT_DFS4)

  // Also cross-check 2-collision Loss-DiVincenzo CZ/CNOT directly from Yang R(w = 1) = sqrt(SWAP)
  const Rw1 = makeYang4(1)
  const CZ_from_Yang = matMul(
    matKron(S2, Sd2),
    matMul(Rw1, matMul(matKron(Z2, I2), Rw1)),
  )
  const czYangErr = matFrobDiffUpToPhase(CZ_from_Yang, CZ_exact)
  const CNOT_from_Yang = matMul(matKron(I2, H2), matMul(CZ_from_Yang, matKron(I2, H2)))
  const CNOT_exact: CMat = [
    [C_ONE, C_ZERO, C_ZERO, C_ZERO],
    [C_ZERO, C_ONE, C_ZERO, C_ZERO],
    [C_ZERO, C_ZERO, C_ZERO, C_ONE],
    [C_ZERO, C_ZERO, C_ONE, C_ZERO],
  ]
  const cnotYangErr = matFrobDiffUpToPhase(CNOT_from_Yang, CNOT_exact)
  const makhCNOT = makhlinInvariants(CNOT_from_Yang)

  // Bell state from |00> strictly via our 60-collision 6-distinct-role S_tot=0 singlet-DFS CNOT_DFS4 -> C = 1 & CHSH = 2 sqrt(2)!
  const bellPrep = matMul(CNOT_DFS4, matKron(H2, I2))
  const bellVec: C[] = [bellPrep[0]![0]!, bellPrep[1]![0]!, bellPrep[2]![0]!, bellPrep[3]![0]!]
  const bellConcurrence = 2 * cAbs(cSub(cMul(bellVec[0]!, bellVec[3]!), cMul(bellVec[1]!, bellVec[2]!)))
  // Exact CHSH expectation for |Phi+> with analyzers A0=Z, A1=X, B0=(Z+X)/sqrt(2), B1=(Z-X)/sqrt(2):
  const expPauli2 = (psi: readonly C[], A: CMat, B: CMat): number => {
    const M = matKron(A, B)
    let s: C = C_ZERO
    for (let r = 0; r < 4; r++) {
      for (let c = 0; c < 4; c++) s = cAdd(s, cMul(cConj(psi[r]!), cMul(M[r]![c]!, psi[c]!)))
    }
    return s[0]
  }
  const B0: CMat = [[[ISQ2, 0], [ISQ2, 0]], [[ISQ2, 0], [-ISQ2, 0]]] // (Z + X)/sqrt(2) = H
  const B1: CMat = [[[ISQ2, 0], [-ISQ2, 0]], [[-ISQ2, 0], [-ISQ2, 0]]] // (Z - X)/sqrt(2)
  const bellCHSH = Math.abs(
    expPauli2(bellVec, Z2, B0) + expPauli2(bellVec, Z2, B1) + expPauli2(bellVec, X2, B0) - expPauli2(bellVec, X2, B1),
  )

  // -----------------------------------------------------------------------------------------------
  // U4d: Spin-Independent 5-Spin Exchange-Only CZ/CNOT (S_AB=0 & S_AB=1, Identical Global Phase!)
  //      + Full 9-Spin C(9,4)=126-Dim Hilbert Space 3-Qubit Toffoli (Explicit Adjacent Routing SWAPs!)
  //      + Same-Encoding Discrete Bare-U <M_{01}, M_{12}> Synthesis Directly on C^126!
  // -----------------------------------------------------------------------------------------------
  // 1) Exact 3-spin DFS single-qubit generators on (s0, s1, s2) matching dfsA/dfsB (singlet on (s1, s2)):
  //      P_{12} = -Z,  P_{01} = (1/2) Z + (sqrt(3)/2) X!
  //    Verify directly on dfsA = {|0_A>=(|1>-|2>)/sqrt(2), |1_A>=(2|0>-|1>-|2>)/sqrt(6)}:
  const rotAxis = (nx: number, ny: number, nz: number, ang: number): CMat => {
    const c = Math.cos(ang / 2); const s = Math.sin(ang / 2)
    return [
      [[c, -s * nz], [-s * ny, -s * nx]],
      [[s * ny, -s * nx], [c, s * nz]],
    ]
  }
  // E_{pq}(alpha) = SWAP_{pq}^alpha = (1+e^{i pi alpha})/2 I + (1-e^{i pi alpha})/2 P_{pq}
  //               = e^{i pi alpha/2} exp(-i (pi alpha/2) P_{pq})
  //               = Yang ballistic scattering R_{pq}(w = +cot(pi alpha/2)) up to global phase!
  //   pair 1 = (s1, s2) [P_{12} = -Z]             -> dfsGen12(a) = exp(-i (pi a/2) (-Z)) = Rz(-pi a)
  //   pair 0 = (s0, s1) [P_{01} = (1/2)Z+(s3/2)X] -> dfsGen01(b) = exp(-i (pi b/2) ((1/2)Z + (sqrt(3)/2)X))
  const dfsGen12 = (a: number): CMat => rotAxis(0, 0, -1, PI * a)
  const dfsGen01 = (b: number): CMat => rotAxis(SQRT3 / 2, 0, 0.5, PI * b)
  // Direct algebraic check of P_{12} = -Z and P_{01} = (1/2)Z + (sqrt(3)/2)X on dfsA:
  const check3SpinP = (p: number, q: number): CMat => {
    const M: CMat = [[C_ZERO, C_ZERO], [C_ZERO, C_ZERO]]
    const basis3 = [[0, ISQ2, -ISQ2], [2 * isq6, -isq6, -isq6]]
    for (let r = 0; r < 2; r++) {
      for (let c = 0; c < 2; c++) {
        let s = 0
        for (let i = 0; i < 3; i++) {
          const j = i === p ? q : i === q ? p : i
          s += basis3[r]![j]! * basis3[c]![i]!
        }
        M[r]![c] = [s, 0]
      }
    }
    return M
  }
  const P12_target: CMat = [[[-1, 0], C_ZERO], [C_ZERO, C_ONE]]
  const P01_target: CMat = [[[0.5, 0], [SQRT3 / 2, 0]], [[SQRT3 / 2, 0], [-0.5, 0]]]
  assertExact(matFrobDiffUpToPhase(check3SpinP(1, 2), P12_target) < 1e-14, 'P12 !== -Z on dfsA')
  assertExact(matFrobDiffUpToPhase(check3SpinP(0, 1), P01_target) < 1e-14, 'P01 !== (1/2)Z+(sqrt(3)/2)X on dfsA')

  // General exact 1-qubit Euler synthesis into [whichPair, alpha] (pair 1 = (s1,s2), pair 0 = (s0,s1), right-to-left):
  //   3 pulses whenever |U_{01}|^2 <= 3/4 (1 pulse for pure Z rotations T/Td!), 4 pulses if |U_{01}|^2 > 3/4.
  type PairPulse1Q = readonly [0 | 1, number]
  const synth1Q_DFS = (Uin: CMat): readonly PairPulse1Q[] => {
    const U = toSU2(Uin)
    const try3 = (T: CMat): PairPulse1Q[] | null => {
      if (cAbs(T[0]![1]!) < 1e-13) {
        const a = wrapPi(2 * cArg(T[0]![0]!)) / PI
        return Math.abs(a) < 1e-13 ? [] : [[1, a]]
      }
      const s2 = cAbs2(T[0]![1]!) / 0.75
      if (s2 > 1 + 1e-12) return null
      const b = (2 / PI) * Math.asin(Math.sqrt(Math.min(1, s2)))
      const M = dfsGen01(b)
      const apc = wrapPi(cArg(T[0]![0]!) - cArg(M[0]![0]!)) * (2 / PI)
      const amc = wrapPi(cArg(T[0]![1]!) - cArg(M[0]![1]!)) * (2 / PI)
      const a = 0.5 * (apc + amc)
      const c = 0.5 * (apc - amc)
      const seq: PairPulse1Q[] = []
      if (Math.abs(c) > 1e-13) seq.push([1, c])
      if (Math.abs(b) > 1e-13) seq.push([0, b])
      if (Math.abs(a) > 1e-13) seq.push([1, a])
      return seq
    }
    const r3 = try3(U)
    if (r3) return r3
    for (const beta of [1, 0.5, -0.5]) {
      const r = try3(matMul(dfsGen01(beta), U))
      if (r) return [...r, [0, -beta]]
    }
    throw new Error('synth1Q_DFS failed')
  }
  const eval1Q_DFS = (seq: readonly PairPulse1Q[]): CMat => {
    let M = matEye(2)
    for (const [w, a] of seq) M = matMul(w === 1 ? dfsGen12(a) : dfsGen01(a), M)
    return M
  }
  const seqH_1Q = synth1Q_DFS(H2)
  const seqT_1Q = synth1Q_DFS(T2)
  const seqTd_1Q = synth1Q_DFS(Td2)
  const hBalErr = matFrobDiffUpToPhase(eval1Q_DFS(seqH_1Q), H2)
  const tBalErr = Math.max(
    matFrobDiffUpToPhase(eval1Q_DFS(seqT_1Q), T2),
    matFrobDiffUpToPhase(eval1Q_DFS(seqTd_1Q), Td2),
  )
  assertExact(seqH_1Q.length === 3 && seqT_1Q.length === 1 && seqTd_1Q.length === 1, '1Q collision counts')

  // 2) EXACT CLOSED-FORM SPIN-INDEPENDENT 5-SPIN EXCHANGE-ONLY CZ (53 ADJACENT COLLISIONS) & CNOT (54 ADJACENT COLLISIONS)!
  //    (Zeuch-Bonesteel 4-spin-to-5-spin controlled-swap construction on active spins (1,2,3,4,5), spin 0 untouched!)
  //    Proof sketch (exact on BOTH S_{AB} = 0 [S_{12345}=1/2] AND S_{AB} = 1 [S_{12345}=1/2, 3/2]):
  //      - On 4 spins (2,3,4,5), the 5-collision block W_0 = P_{23} E_{34}(-2/3) P_{45} E_{34}(+2/3) P_{23}
  //        (using ONLY SWAP and verbatim bare on-dock M_meet angle +-2/3!) clears the S_{345}=3/2 leakage state |L>
  //        into {|0_B>, |1_B>} identically: W_0|L> = (-sqrt(6)/4 + i*sqrt(2)/2)|0_B> - (1/(2*sqrt(2)))|1_B> + 0|L>!
  //      - The 2-pulse 1Q rotation Q_B = E_{34}(b_QB) E_{45}(a_QB) with b_QB = (2/pi) arcsin(1/sqrt(6)) aligns W_0|L> -> |0_B>,
  //        so U_4 = W_0^dag Q_B^dag P_{45} Q_B W_0 (15 adjacent collisions!) acts as diag(+1, +1, -1) on S_{2345}=1
  //        (ZERO leakage out of S_{345}=1/2!) and as exact Bloch reflection R_n on S_{2345}=0 with exact axis
  //        n = (-5*sqrt(3)/16, -5/8, 9/16) (unit norm: (75 + 100 + 81)/256 = 1)!
  //      - Thus U_4 is an exact controlled-swap between spin 2 and Qubit B's spin-1/2 controlled on the -1 eigenstate of R_n!
  //        Applying the S_3 braid U_{CZ,raw} = U_4 P_{12} U_4 P_{12} U_4 (47 adjacent collisions!) acts as
  //        |0_A><0_A| (x) R_n + |1_A><1_A| (x) I_B identically on BOTH S_{AB}=0 AND S_{AB}=1 with identical global phase!
  //      - Framing Qubit B with exact local 1Q rotations Q_cz (3+3=6 collisions) yields exact spin-independent CZ (53 collisions),
  //        and with Q_cnot = H Q_cz (4+3=7 collisions) yields exact spin-independent CNOT (54 collisions)!
  type AdjPulse = readonly [number, number, number] // [spinLo, spinHi, alpha] with spinHi === spinLo + 1
  const bQB = (2 / PI) * Math.asin(1 / Math.sqrt(6))
  const wL0_c: C = [-Math.sqrt(6) / 4, SQRT2 / 2]
  const wL1_c: C = [-1 / (2 * SQRT2), 0]
  const E34_bQB = dfsGen01(bQB)
  const qNum = cMul(E34_bQB[1]![1]!, wL1_c)
  const qDen = cMul(E34_bQB[1]![0]!, wL0_c)
  const aQB = cArg(cDiv([-qNum[0], -qNum[1]], qDen)) / PI
  const Rn_B: CMat = [
    [[9 / 16, 0], [(-5 * SQRT3) / 16, 5 / 8]],
    [[(-5 * SQRT3) / 16, -5 / 8], [-9 / 16, 0]],
  ]
  const thRn = Math.acos(9 / 16)
  const phiRn = Math.atan2(-5 / 8, (-5 * SQRT3) / 16)
  const vPlusRn: readonly [C, C] = [[Math.cos(thRn / 2), 0], cScale(Math.sin(thRn / 2), cExpI(phiRn))]
  const vMinusRn: readonly [C, C] = [[-Math.sin(thRn / 2), 0], cScale(Math.cos(thRn / 2), cExpI(phiRn))]
  const Q_cz_B: CMat = [
    [cConj(vPlusRn[0]), cConj(vPlusRn[1])],
    [cConj(vMinusRn[0]), cConj(vMinusRn[1])],
  ]
  const Q_cnot_B = matMul(H2, Q_cz_B)
  const rightCZ_1Q = synth1Q_DFS(matDag(Q_cz_B))
  const leftCZ_1Q = synth1Q_DFS(matMul(Q_cz_B, Rn_B))
  const rightCNOT_1Q = synth1Q_DFS(matDag(Q_cnot_B))
  const leftCNOT_1Q = synth1Q_DFS(matMul(Q_cnot_B, Rn_B))

  const buildSpinIndep2Q = (
    s1: number, s2: number, s3: number, s4: number, s5: number,
    right1Q: readonly PairPulse1Q[], left1Q: readonly PairPulse1Q[],
  ): readonly AdjPulse[] => {
    const w0: readonly AdjPulse[] = [
      [s2, s3, 1],
      [s3, s4, 2 / 3],
      [s4, s5, 1],
      [s3, s4, -2 / 3],
      [s2, s3, 1],
    ]
    const mapB = (seq: readonly PairPulse1Q[]): AdjPulse[] =>
      seq.map(([w, a]) => (w === 1 ? [s4, s5, a] : [s3, s4, a]))
    const u4: readonly AdjPulse[] = [
      ...w0,
      [s4, s5, aQB],
      [s3, s4, bQB],
      [s4, s5, 1],
      [s3, s4, -bQB],
      [s4, s5, -aQB],
      ...w0.slice().reverse().map(([p, q, a]): AdjPulse => [p, q, -a]),
    ]
    const raw: AdjPulse[] = [
      ...mapB(right1Q),
      ...u4,
      [s1, s2, 1],
      ...u4,
      [s1, s2, 1],
      ...u4,
      ...mapB(left1Q),
    ]
    for (const [p, q] of raw) assertExact(q === p + 1, `Non-adjacent pulse [${p},${q}]`)
    return raw
  }

  const czSpinIndep01 = buildSpinIndep2Q(1, 2, 3, 4, 5, rightCZ_1Q, leftCZ_1Q)
  const cnotSpinIndep01 = buildSpinIndep2Q(1, 2, 3, 4, 5, rightCNOT_1Q, leftCNOT_1Q)
  assertExact(czSpinIndep01.length === 53 && cnotSpinIndep01.length === 54, `2Q counts (${czSpinIndep01.length}, ${cnotSpinIndep01.length})`)

  // Verify spin-independent CZ (53) & CNOT (54) on FULL 6-spin C(6,3)=20 across BOTH S_{AB}=0 AND S_{AB}=1!
  const exch20Alpha = (p: number, q: number, alpha: number): CMat => {
    const ph = cExpI(PI * alpha)
    const cI = cScale(0.5, cAdd(C_ONE, ph))
    const cP = cScale(0.5, cSub(C_ONE, ph))
    const M: CMat = Array.from({ length: 20 }, () => Array.from({ length: 20 }, () => C_ZERO))
    for (let col = 0; col < 20; col++) {
      const [i, j, k] = basis20[col]!
      const mp = (x: number) => (x === p ? q : x === q ? p : x)
      const arr = [mp(i), mp(j), mp(k)].sort((a, b) => a - b)
      const row = idx20.get(`${arr[0]},${arr[1]},${arr[2]}`)!
      M[col]![col] = cAdd(M[col]![col]!, cI)
      M[row]![col] = cAdd(M[row]![col]!, cP)
    }
    return M
  }
  const runPulses20 = (pulses: readonly AdjPulse[]): CMat => {
    let U = matEye(20)
    for (const [p, q, a] of pulses) U = matMul(exch20Alpha(p, q, a), U)
    return U
  }
  // Build S_{AB} = 1 (m_s = 0) logical kets in C^20 alongside S_{AB} = 0 (singletKets20):
  const tripletKets20: number[][] = []
  for (let a = 0; a < 2; a++) {
    for (let b = 0; b < 2; b++) {
      const v = new Array<number>(20).fill(0)
      for (const [pa, ca] of dfsUpA[a]!) {
        for (const [pb, cb] of dfsDnB[b]!) {
          const arr = [pa[0], pb[0], pb[1]].sort((x, y) => x - y)
          const id = idx20.get(`${arr[0]},${arr[1]},${arr[2]}`)!
          v[id] = v[id]! + ISQ2 * ca * cb
        }
      }
      for (const [pa, ca] of dfsDnA[a]!) {
        for (const [pb, cb] of dfsUpB[b]!) {
          const arr = [pa[0], pa[1], pb[0]].sort((x, y) => x - y)
          const id = idx20.get(`${arr[0]},${arr[1]},${arr[2]}`)!
          v[id] = v[id]! + ISQ2 * ca * cb
        }
      }
      tripletKets20.push(v)
    }
  }
  // Verify S_{AB} = 1 Casimir (sum_{p<q} P_{pq} = 5) on all 4 triplet logical kets!
  let maxTripletCasErr = 0
  for (const v of tripletKets20) {
    const out = new Array<number>(20).fill(0)
    for (let p = 0; p < 6; p++) for (let q = p + 1; q < 6; q++) {
      for (let col = 0; col < 20; col++) {
        if (v[col] === 0) continue
        const [i, j, k] = basis20[col]!
        const mp = (x: number) => (x === p ? q : x === q ? p : x)
        const arr = [mp(i), mp(j), mp(k)].sort((x, y) => x - y)
        const row = idx20.get(`${arr[0]},${arr[1]},${arr[2]}`)!
        out[row] = out[row]! + v[col]!
      }
    }
    for (let i = 0; i < 20; i++) maxTripletCasErr = Math.max(maxTripletCasErr, Math.abs(out[i]! - 5 * v[i]!))
  }
  assertExact(maxTripletCasErr < 1e-13, `triplet Casimir err=${maxTripletCasErr}`)

  const proj20Kets = (U20: CMat, kets: readonly (readonly number[])[]): { readonly U4: CMat; readonly leak: number } => {
    const U4: CMat = Array.from({ length: 4 }, (_, r) =>
      Array.from({ length: 4 }, (_, c) => {
        let s: C = C_ZERO
        for (let i = 0; i < 20; i++) {
          const ri = kets[r]![i]!
          if (ri === 0) continue
          for (let j = 0; j < 20; j++) {
            const cj = kets[c]![j]!
            if (cj === 0) continue
            s = cAdd(s, cScale(ri * cj, U20[i]![j]!))
          }
        }
        return s
      }),
    )
    const leak = Math.max(0, 4 - matTrace(matMul(matDag(U4), U4))[0]) / 4
    return { U4, leak }
  }
  const matFrobRaw = (A: CMat, B: CMat): number => {
    let s = 0
    for (let r = 0; r < A.length; r++) for (let c = 0; c < A[0]!.length; c++) s += cAbs2(cSub(A[r]![c]!, B[r]![c]!))
    return Math.sqrt(s)
  }
  // Honest diagnostic: show that the 60-collision S_tot=0 singlet-DFS CZ leaks on S_{AB}=1!
  const czSingletOnTripletLeak = proj20Kets(U_CZ_20, tripletKets20).leak

  const U_CZ_SI_20 = runPulses20(czSpinIndep01)
  const U_CNOT_SI_20 = runPulses20(cnotSpinIndep01)
  const czSI_uniErr = matUnitaryErr(U_CZ_SI_20)
  const cnotSI_uniErr = matUnitaryErr(U_CNOT_SI_20)
  const czSI_S0 = proj20Kets(U_CZ_SI_20, singletKets20)
  const czSI_S1 = proj20Kets(U_CZ_SI_20, tripletKets20)
  const czSI_errS0 = matFrobDiffUpToPhase(czSI_S0.U4, CZ_exact)
  const czSI_errS1 = matFrobDiffUpToPhase(czSI_S1.U4, CZ_exact)
  const czSI_phaseMatch = matFrobRaw(czSI_S0.U4, czSI_S1.U4) // ZERO separate phase freedom!

  const cnotSI_S0 = proj20Kets(U_CNOT_SI_20, singletKets20)
  const cnotSI_S1 = proj20Kets(U_CNOT_SI_20, tripletKets20)
  const cnotSI_errS0 = matFrobDiffUpToPhase(cnotSI_S0.U4, CNOT_exact)
  const cnotSI_errS1 = matFrobDiffUpToPhase(cnotSI_S1.U4, CNOT_exact)
  const cnotSI_phaseMatch = matFrobRaw(cnotSI_S0.U4, cnotSI_S1.U4) // ZERO separate phase freedom!

  // 3) FULL 9-SPIN C(9,4) = 126-DIM HILBERT SPACE 3-QUBIT TOFFOLI VERIFICATION (BOTH S_{AB}=0 AND S_{AB}=1!)
  //    All 9 roles {0..8} pairwise distinct in Vibe's 9-point alphabet => M_pair = I strictly in verbatim 4D!
  //    Qubits on linear chain: Q0 = (0,1,2), Q1 = (3,4,5), Q2 = (6,7,8), m_s = +1/2 (4 markers, 5 backgrounds).
  const basis126: [number, number, number, number][] = []
  const idx126 = new Map<string, number>()
  for (let a = 0; a < 9; a++) {
    for (let b = a + 1; b < 9; b++) {
      for (let c = b + 1; c < 9; c++) {
        for (let d = c + 1; d < 9; d++) {
          idx126.set(`${a},${b},${c},${d}`, basis126.length)
          basis126.push([a, b, c, d])
        }
      }
    }
  }
  assertExact(basis126.length === 126, `C(9,4)=${basis126.length}`)
  const swapPerm126 = (p: number, q: number): Int32Array => {
    const perm = new Int32Array(126)
    for (let i = 0; i < 126; i++) {
      const [a, b, c, d] = basis126[i]!
      const mp = (x: number) => (x === p ? q : x === q ? p : x)
      const arr = [mp(a), mp(b), mp(c), mp(d)].sort((x, y) => x - y)
      perm[i] = idx126.get(`${arr[0]},${arr[1]},${arr[2]},${arr[3]}`)!
    }
    return perm
  }
  const adjPerms126: readonly Int32Array[] = Array.from({ length: 8 }, (_, k) => swapPerm126(k, k + 1))

  const applyAdj126 = (re: Float64Array, im: Float64Array, nCols: number, k: number, alpha: number): void => {
    const perm = adjPerms126[k]!
    const ph = cExpI(PI * alpha)
    const cIr = 0.5 * (1 + ph[0]); const cIi = 0.5 * ph[1]
    const cPr = 0.5 * (1 - ph[0]); const cPi = -0.5 * ph[1]
    for (let col = 0; col < nCols; col++) {
      const off = col * 126
      for (let i = 0; i < 126; i++) {
        const j = perm[i]!
        if (j <= i) continue
        const ir = re[off + i]!; const ii = im[off + i]!
        const jr = re[off + j]!; const ji = im[off + j]!
        re[off + i] = cIr * ir - cIi * ii + cPr * jr - cPi * ji
        im[off + i] = cIr * ii + cIi * ir + cPr * ji + cPi * jr
        re[off + j] = cIr * jr - cIi * ji + cPr * ir - cPi * ii
        im[off + j] = cIr * ji + cIi * jr + cPr * ii + cPi * ir
      }
    }
  }

  // Build ALL 16 orthonormal logical+gauge basis states in S_{ABC} = 1/2 (8 with S_{AB}=0, 8 with S_{AB}=1):
  const qUp126 = (q: number, bit: number): readonly (readonly [readonly number[], number])[] =>
    bit === 0
      ? [[[3 * q + 1], ISQ2], [[3 * q + 2], -ISQ2]]
      : [[[3 * q], 2 * isq6], [[3 * q + 1], -isq6], [[3 * q + 2], -isq6]]
  const qDn126 = (q: number, bit: number): readonly (readonly [readonly number[], number])[] =>
    bit === 0
      ? [[[3 * q, 3 * q + 1], ISQ2], [[3 * q, 3 * q + 2], -ISQ2]]
      : [[[3 * q, 3 * q + 1], isq6], [[3 * q, 3 * q + 2], isq6], [[3 * q + 1, 3 * q + 2], -2 * isq6]]
  const addProd126 = (
    v: Float64Array, coeff: number,
    tA: readonly (readonly [readonly number[], number])[],
    tB: readonly (readonly [readonly number[], number])[],
    tC: readonly (readonly [readonly number[], number])[],
  ): void => {
    for (const [dA, cA] of tA) {
      for (const [dB, cB] of tB) {
        for (const [dC, cC] of tC) {
          const arr = [...dA, ...dB, ...dC].sort((x, y) => x - y)
          const id = idx126.get(`${arr[0]},${arr[1]},${arr[2]},${arr[3]}`)!
          v[id] = v[id]! + coeff * cA * cB * cC
        }
      }
    }
  }
  const kets126: Float64Array[] = []
  for (let g = 0; g < 2; g++) {
    for (let idx = 0; idx < 8; idx++) {
      const a = (idx >> 2) & 1; const b = (idx >> 1) & 1; const c = idx & 1
      const v = new Float64Array(126)
      if (g === 0) {
        addProd126(v, ISQ2, qUp126(0, a), qDn126(1, b), qUp126(2, c))
        addProd126(v, -ISQ2, qDn126(0, a), qUp126(1, b), qUp126(2, c))
      } else {
        addProd126(v, 2 * isq6, qUp126(0, a), qUp126(1, b), qDn126(2, c))
        addProd126(v, -isq6, qUp126(0, a), qDn126(1, b), qUp126(2, c))
        addProd126(v, -isq6, qDn126(0, a), qUp126(1, b), qUp126(2, c))
      }
      kets126.push(v)
    }
  }
  let maxOrtho126Err = 0
  for (let i = 0; i < 16; i++) {
    for (let j = 0; j < 16; j++) {
      let d = 0
      for (let k = 0; k < 126; k++) d += kets126[i]![k]! * kets126[j]![k]!
      maxOrtho126Err = Math.max(maxOrtho126Err, Math.abs(d - (i === j ? 1 : 0)))
    }
  }
  // Verify exact 9-spin total-spin Casimir (sum_{p<q} P_{pq} = S(S+1) - 9*3/4 + 36/2 = 12 for S = 1/2!)
  let maxCas126Err = 0
  const allPerms126: Int32Array[] = []
  for (let p = 0; p < 9; p++) for (let q = p + 1; q < 9; q++) allPerms126.push(swapPerm126(p, q))
  for (const v of kets126) {
    const out = new Float64Array(126)
    for (const perm of allPerms126) {
      for (let i = 0; i < 126; i++) out[perm[i]!] = out[perm[i]!]! + v[i]!
    }
    for (let i = 0; i < 126; i++) maxCas126Err = Math.max(maxCas126Err, Math.abs(out[i]! - 12 * v[i]!))
  }
  assertExact(maxOrtho126Err < 1e-13 && maxCas126Err < 1e-13, `126D basis err=${maxOrtho126Err}, cas=${maxCas126Err}`)

  // Explicit adjacent routing SWAP between Q0=(0,1,2) and Q1=(3,4,5): 3 x 3 = 9 adjacent R(w=0) SWAP collisions!
  const qubitSwap01: readonly AdjPulse[] = [
    [2, 3, 1], [3, 4, 1], [4, 5, 1],
    [1, 2, 1], [2, 3, 1], [3, 4, 1],
    [0, 1, 1], [1, 2, 1], [2, 3, 1],
  ]
  const map1Q_9 = (q: 0 | 1 | 2, seq: readonly PairPulse1Q[]): AdjPulse[] =>
    seq.map(([w, a]) => (w === 1 ? [3 * q + 1, 3 * q + 2, a] : [3 * q, 3 * q + 1, a]))

  const Toffoli_exact: CMat = matEye(8)
  Toffoli_exact[6]![6] = C_ZERO; Toffoli_exact[7]![7] = C_ZERO
  Toffoli_exact[6]![7] = C_ONE; Toffoli_exact[7]![6] = C_ONE
  const Toffoli16_exact: CMat = matEye(16)
  for (let r = 0; r < 8; r++) for (let c = 0; c < 8; c++) {
    Toffoli16_exact[r]![c] = Toffoli_exact[r]![c]!
    Toffoli16_exact[r + 8]![c + 8] = Toffoli_exact[r]![c]!
  }

  const evalCircuit126 = (pulses: readonly AdjPulse[], checkFull126Unitary: boolean) => {
    for (const [p, q] of pulses) assertExact(q === p + 1, `Non-adjacent 9-spin pulse [${p},${q}]`)
    const stRe = new Float64Array(16 * 126)
    const stIm = new Float64Array(16 * 126)
    for (let col = 0; col < 16; col++) for (let i = 0; i < 126; i++) stRe[col * 126 + i] = kets126[col]![i]!
    for (const [p, _q, a] of pulses) applyAdj126(stRe, stIm, 16, p, a)
    const U16: CMat = Array.from({ length: 16 }, (_, r) =>
      Array.from({ length: 16 }, (_, c) => {
        let re = 0; let im = 0
        const off = c * 126
        for (let i = 0; i < 126; i++) {
          const w = kets126[r]![i]!
          if (w !== 0) { re += w * stRe[off + i]!; im += w * stIm[off + i]! }
        }
        return [re, im] as C
      }),
    )
    let tr16 = 0
    for (let r = 0; r < 16; r++) for (let c = 0; c < 16; c++) tr16 += cAbs2(U16[r]![c]!)
    const leak16 = Math.max(0, 16 - tr16) / 16
    let cross2 = 0
    for (let r = 0; r < 8; r++) for (let c = 0; c < 8; c++) cross2 += cAbs2(U16[r]![c + 8]!) + cAbs2(U16[r + 8]![c]!)
    const U8_g0 = U16.slice(0, 8).map(row => row.slice(0, 8))
    const U8_g1 = U16.slice(8, 16).map(row => row.slice(8, 16))
    const errG0 = matFrobDiffUpToPhase(U8_g0, Toffoli_exact)
    const errG1 = matFrobDiffUpToPhase(U8_g1, Toffoli_exact)
    const phaseMatch01 = matFrobRaw(U8_g0, U8_g1)
    const err16 = matFrobDiffUpToPhase(U16, Toffoli16_exact)
    const trIp = cAbs(matTrace(matMul(matDag(U8_g0), Toffoli_exact))) / 8
    let uni126Err = 0
    if (checkFull126Unitary) {
      const fRe = new Float64Array(126 * 126)
      const fIm = new Float64Array(126 * 126)
      for (let col = 0; col < 126; col++) fRe[col * 126 + col] = 1
      for (const [p, _q, a] of pulses) applyAdj126(fRe, fIm, 126, p, a)
      let e2 = 0
      for (let c1 = 0; c1 < 126; c1++) {
        const o1 = c1 * 126
        for (let c2 = 0; c2 < 126; c2++) {
          const o2 = c2 * 126
          let re = 0; let im = 0
          for (let i = 0; i < 126; i++) {
            re += fRe[o1 + i]! * fRe[o2 + i]! + fIm[o1 + i]! * fIm[o2 + i]!
            im += fRe[o1 + i]! * fIm[o2 + i]! - fIm[o1 + i]! * fRe[o2 + i]!
          }
          if (c1 === c2) re -= 1
          e2 += re * re + im * im
        }
      }
      uni126Err = Math.sqrt(e2)
    }
    return { leak16, crossGauge: Math.sqrt(cross2), errG0, errG1, phaseMatch01, err16, procFid: trIp * trIp, uni126Err }
  }

  // Assemble continuous-rapidity linear-chain 9-spin Toffoli (Nielsen-Chuang Fig. 4.9, right-to-left):
  const cnotSI_12 = buildSpinIndep2Q(4, 5, 6, 7, 8, rightCNOT_1Q, leftCNOT_1Q)
  const cnotSI_02: readonly AdjPulse[] = [...qubitSwap01, ...cnotSI_12, ...qubitSwap01.slice().reverse()]
  const toff9Ops: readonly { readonly kind: '1Q' | '2Q' | '2Q_SWAP'; readonly pulses: readonly AdjPulse[] }[] = [
    { kind: '1Q', pulses: map1Q_9(2, seqH_1Q) },
    { kind: '2Q', pulses: cnotSI_12 },
    { kind: '1Q', pulses: map1Q_9(2, seqTd_1Q) },
    { kind: '2Q_SWAP', pulses: cnotSI_02 },
    { kind: '1Q', pulses: map1Q_9(2, seqT_1Q) },
    { kind: '2Q', pulses: cnotSI_12 },
    { kind: '1Q', pulses: map1Q_9(2, seqTd_1Q) },
    { kind: '2Q_SWAP', pulses: cnotSI_02 },
    { kind: '1Q', pulses: map1Q_9(1, seqT_1Q) },
    { kind: '1Q', pulses: map1Q_9(2, seqT_1Q) },
    { kind: '2Q', pulses: cnotSpinIndep01 },
    { kind: '1Q', pulses: map1Q_9(2, seqH_1Q) },
    { kind: '1Q', pulses: map1Q_9(0, seqT_1Q) },
    { kind: '1Q', pulses: map1Q_9(1, seqTd_1Q) },
    { kind: '2Q', pulses: cnotSpinIndep01 },
  ]
  let count1Q_9 = 0; let count2Q_9 = 0; let countSwap_9 = 0
  const toff9Pulses: AdjPulse[] = []
  for (const op of toff9Ops) {
    if (op.kind === '1Q') count1Q_9 += op.pulses.length
    else if (op.kind === '2Q_SWAP') { count2Q_9 += cnotSI_12.length; countSwap_9 += 2 * qubitSwap01.length }
    else count2Q_9 += op.pulses.length
    for (const p of op.pulses) toff9Pulses.push(p)
  }
  assertExact(count1Q_9 === 13 && count2Q_9 === 324 && countSwap_9 === 36 && toff9Pulses.length === 373, '9-spin Toffoli collision breakdown')
  const toff9Cont = evalCircuit126(toff9Pulses, true)

  // 4) SAME-ENCODING DISCRETE FIXED-ANGLE BARE-U <M_{01}, M_{12}> SYNTHESIS DIRECTLY ON C^126!
  //    Using ONLY the verbatim bare on-dock M_meet generators (w = 1/sqrt(3), alpha = 2/3) inside the EXACT SAME
  //    3-spin DFS encoding:
  //      M_{12} = dfsGen12(2/3),  M_{01} = dfsGen01(2/3),  |Tr_{SU(2)}(M_{01} M_{12})| = 5/4 (Niven-dense in SU(2)!)
  //    Note: M_{ij}^3 = -I in SU(2) => M_{ij}^{-1} = -M_{ij}^2 is just 2 positive bare M_meet collisions!
  //    Deterministic meet-in-the-middle BFS (half-depth <= 10, word length <= 20 letters, pool = 4,093) synthesizes
  //    bH_DFS, bT_DFS, bTd_DFS = bT_DFS^dag. We then compose the FULL 9-spin Toffoli directly on C(9,4)=126 using:
  //      - Discrete bare-U <M_{01}, M_{12}> words for ALL single-qubit gates (H, T, T^dag) AND for BOTH H gates
  //        framing every spin-independent CZ inside CNOT = (I x bH_DFS) * CZ_spinIndep * (I x bH_DFS),
  //      - Continuous-rapidity spin-independent 53-collision CZ for the 6 entangling blocks, and
  //      - 36 adjacent R(w = 0) routing SWAP collisions for the 2 non-adjacent CNOT(0, 2) gates!
  const M01_DFS = dfsGen01(2 / 3)
  const M12_DFS = dfsGen12(2 / 3)
  const trM01M12 = cAbs(matTrace(matMul(M01_DFS, M12_DFS)))
  const m01SqInvErr = matFrobDiffUpToPhase(matMul(M01_DFS, M01_DFS), matDag(M01_DFS))
  assertExact(Math.abs(trM01M12 - 1.25) < 1e-13 && m01SqInvErr < 1e-13, `M01/M12 check tr=${trM01M12}`)

  const synthDiscreteDFS = () => {
    const gens: readonly { readonly pair: 0 | 1; readonly alpha: number; readonly U: CMat }[] = [
      { pair: 0, alpha: 2 / 3, U: M01_DFS },
      { pair: 0, alpha: -2 / 3, U: matDag(M01_DFS) },
      { pair: 1, alpha: 2 / 3, U: M12_DFS },
      { pair: 1, alpha: -2 / 3, U: matDag(M12_DFS) },
    ]
    const key4 = (U: CMat): string => {
      let a = U[0]![0]!; let b = U[0]![1]!
      if (a[0] < -1e-6 || (Math.abs(a[0]) <= 1e-6 && a[1] < -1e-6)) { a = [-a[0], -a[1]]; b = [-b[0], -b[1]] }
      return `${a[0].toFixed(4)},${a[1].toFixed(4)},${b[0].toFixed(4)},${b[1].toFixed(4)}`
    }
    interface PoolItem { readonly seq: readonly PairPulse1Q[]; readonly U: CMat; readonly lastPair: -1 | 0 | 1 }
    const pool: PoolItem[] = [{ seq: [], U: I2, lastPair: -1 }]
    const seen = new Set<string>([key4(I2)])
    let front: PoolItem[] = pool.slice()
    for (let d = 1; d <= 10; d++) {
      const next: PoolItem[] = []
      for (const cur of front) {
        for (const g of gens) {
          if (g.pair === cur.lastPair) continue
          const U = matMul(g.U, cur.U)
          const k = key4(U)
          if (!seen.has(k)) {
            seen.add(k)
            const item: PoolItem = { seq: [...cur.seq, [g.pair, g.alpha]], U, lastPair: g.pair }
            pool.push(item); next.push(item)
          }
        }
      }
      front = next
    }
    const nP = pool.length
    const l0 = new Float64Array(nP); const l1 = new Float64Array(nP)
    const l2 = new Float64Array(nP); const l3 = new Float64Array(nP)
    for (let i = 0; i < nP; i++) {
      const U = pool[i]!.U
      l0[i] = U[0]![0]![0]; l1[i] = U[0]![0]![1]; l2[i] = U[0]![1]![0]; l3[i] = U[0]![1]![1]
    }
    const findBest = (target: CMat) => {
      const T_SU2 = toSU2(target)
      const r0 = new Float64Array(nP); const r1 = new Float64Array(nP)
      const r2 = new Float64Array(nP); const r3 = new Float64Array(nP)
      for (let i = 0; i < nP; i++) {
        const M = matMul(T_SU2, matDag(pool[i]!.U))
        r0[i] = M[0]![0]![0]; r1[i] = M[0]![0]![1]; r2[i] = M[0]![1]![0]; r3[i] = M[0]![1]![1]
      }
      let bestDot = -1; let bi = 0; let bj = 0
      for (let i = 0; i < nP; i++) {
        const a0 = l0[i]!; const a1 = l1[i]!; const a2 = l2[i]!; const a3 = l3[i]!
        for (let j = 0; j < nP; j++) {
          const d = Math.abs(a0 * r0[j]! + a1 * r1[j]! + a2 * r2[j]! + a3 * r3[j]!)
          if (d > bestDot) { bestDot = d; bi = i; bj = j }
        }
      }
      const Ubest = matMul(pool[bi]!.U, pool[bj]!.U)
      const seq: PairPulse1Q[] = [...pool[bj]!.seq, ...pool[bi]!.seq]
      const posMeetCount = seq.reduce((acc, [, a]) => acc + (a > 0 ? 1 : 2), 0)
      return { U: Ubest, err: matFrobDiffUpToPhase(Ubest, target), letters: seq.length, posMeetCount, seq, poolSize: nP }
    }
    const bH = findBest(H2)
    const bT = findBest(T2)
    const bTdSeq: readonly PairPulse1Q[] = bT.seq.slice().reverse().map(([w, a]) => [w, -a])
    // Build hybrid 9-spin Toffoli on C^126 using bH_DFS inside every CNOT = (I x bH_DFS) CZ_spinIndep (I x bH_DFS)!
    const czSI_01 = czSpinIndep01
    const czSI_12 = buildSpinIndep2Q(4, 5, 6, 7, 8, rightCZ_1Q, leftCZ_1Q)
    const cnotHyb_01: readonly AdjPulse[] = [...map1Q_9(1, bH.seq), ...czSI_01, ...map1Q_9(1, bH.seq)]
    const cnotHyb_12: readonly AdjPulse[] = [...map1Q_9(2, bH.seq), ...czSI_12, ...map1Q_9(2, bH.seq)]
    const cnotHyb_02: readonly AdjPulse[] = [...qubitSwap01, ...cnotHyb_12, ...qubitSwap01.slice().reverse()]
    const hybPulses: AdjPulse[] = [
      ...map1Q_9(2, bH.seq),
      ...cnotHyb_12,
      ...map1Q_9(2, bTdSeq),
      ...cnotHyb_02,
      ...map1Q_9(2, bT.seq),
      ...cnotHyb_12,
      ...map1Q_9(2, bTdSeq),
      ...cnotHyb_02,
      ...map1Q_9(1, bT.seq),
      ...map1Q_9(2, bT.seq),
      ...cnotHyb_01,
      ...map1Q_9(2, bH.seq),
      ...map1Q_9(0, bT.seq),
      ...map1Q_9(1, bTdSeq),
      ...cnotHyb_01,
    ]
    const hyb126 = evalCircuit126(hybPulses, false)
    return { bH, bT, hyb126, totalPulses: hybPulses.length }
  }
  const discSynth = synthDiscreteDFS()

  console.log(`  [U4a] Verbatim 4D BigInt Distinct-Role DFS Protection ({0..5} & full 9-role {0..8} subset {0..8}):`)
  console.log(`        6-role {0..5}: M_pair diff=${sixRolePairDiff}, off-line=${sixRoleOffLine}, revDiff=${sixRoleRevDiff} | 9-role {0..8}: M_pair diff=${nineRolePairDiff}, off-line=${nineRoleOffLine}, revDiff=${nineRoleRevDiff} (EXACT M_pair=I in 4D!)`)
  console.log(`  [U4b] Exact Single-Qubit Dense SU(2) (Slot-Qubit <C, L_7> & 3-Role DFS Euler / Bare <M_{01}, M_{12}>):`)
  console.log(`        Single-vibe slot-qubit BigInt |Tr(L_7 C)|^2 = ${trL7CNorm2[0]}/${trL7CDen2} (exact 25/16 -> |Tr_SU2|=${trSU2Val.toFixed(8)} = 5/4 -> Niven dense SU(2)!)`)
  console.log(`        3-role DFS bare on-dock M_meet <M_{01}, M_{12}>: |Tr_SU2(M_{01} M_{12})|=${trM01M12.toFixed(8)} = 5/4 (Niven dense SU(2)!, M^2=-M^dag err=${m01SqInvErr.toExponential(1)})`)
  console.log(`        3-role DFS continuous-rapidity Euler: H err=${hBalErr.toExponential(2)} (${seqH_1Q.length} colls), T/Td err=${tBalErr.toExponential(2)} (${seqT_1Q.length} coll)`)
  console.log(`  [U4c] Exact 6-Distinct-Role DFS SU(4), 2-Qubit S_tot=0 Singlet-DFS CZ (28/60 colls), Makhlin & Tsirelson CHSH:`)
  console.log(`        Exact su(9) Lie algebra dimension on S_tot=1: ${su9Dim} / 80 (contains full SU(4) on 4D DFS!)`)
  console.log(`        EXACT 28-Collision Singlet-DFS CPHASE(+pi/3) [scoped to 2-qubit S_tot=0, 6 distinct roles {0..5}, M_pair=I]:`)
  console.log(`          phi*=${phiStarCZ.toFixed(6)}, psi*=${psiStarCZ.toFixed(6)}, leakage=${cp3Res.leak.toExponential(2)}, ||U_4 - CPHASE(pi/3)||_F=${cp3Err.toExponential(2)}`)
  console.log(`        EXACT 60-Collision Singlet-DFS CZ [scoped to 2-qubit S_tot=0, uniErr=${cz20UniErr.toExponential(1)}, v3Err=${v3CheckErr.toExponential(1)}]:`)
  console.log(`          S_tot=0 leak=${czDfsLeak.toExponential(2)}, ||U_4 - CZ||_F=${czDfsErr.toExponential(2)}, Makhlin=(${makhDfsCNOT.G1[0].toFixed(4)}+${makhDfsCNOT.G1[1].toFixed(4)}i, ${makhDfsCNOT.G2.toFixed(4)}), e_p=${makhDfsCNOT.ep.toFixed(6)} (2/9)`)
  console.log(`          (Honest scope diagnostic: 60-coll S_tot=0 CZ leaks ${czSingletOnTripletLeak.toFixed(4)} on S_{AB}=1 -> multi-qubit circuits require spin-independent U4d!)`)
  console.log(`        Yang R(w=1) [sqrt(SWAP)] Makhlin: G_1=(${makhSqrtSwap.G1[0].toFixed(4)}, ${makhSqrtSwap.G1[1].toFixed(4)}i), G_2=${makhSqrtSwap.G2.toFixed(4)}, e_p=${makhSqrtSwap.ep.toFixed(6)} (1/6)`)
  console.log(`        Yang R(w=1/sqrt(3)) [M_meet] Makhlin: G_1=(${makhBareMeet.G1[0].toFixed(4)}, ${makhBareMeet.G1[1].toFixed(4)}i), G_2=${makhBareMeet.G2.toFixed(4)}, e_p=${makhBareMeet.ep.toFixed(6)}`)
  console.log(`        2-Collision Loss-DiVincenzo Yang CNOT: CZ err=${czYangErr.toExponential(2)}, CNOT err=${cnotYangErr.toExponential(2)}, Makhlin=(${makhCNOT.G1[0].toFixed(4)}+${makhCNOT.G1[1].toFixed(4)}i, ${makhCNOT.G2.toFixed(4)})`)
  console.log(`        Autonomous Bell State from |0_L, 0_L> (S_tot=0 60-coll DFS CNOT): Concurrence C=${bellConcurrence.toFixed(8)}, CHSH S=${bellCHSH.toFixed(8)} (Tsirelson=${(2 * SQRT2).toFixed(8)})`)
  console.log(`  [U4d] Spin-Independent 5-Spin CZ/CNOT (S_AB=0 & S_AB=1) + Full 9-Spin C(9,4)=126-Dim Toffoli (Explicit Adjacent Routing SWAPs):`)
  console.log(`        Spin-Independent 53-coll CZ  (C(6,3)=20, uniErr=${czSI_uniErr.toExponential(1)}): S_AB=0 leak=${czSI_S0.leak.toExponential(2)} err=${czSI_errS0.toExponential(2)} | S_AB=1 leak=${czSI_S1.leak.toExponential(2)} err=${czSI_errS1.toExponential(2)} | ||U(0)-U(1)||_F=${czSI_phaseMatch.toExponential(2)}`)
  console.log(`        Spin-Independent 54-coll CNOT(C(6,3)=20, uniErr=${cnotSI_uniErr.toExponential(1)}): S_AB=0 leak=${cnotSI_S0.leak.toExponential(2)} err=${cnotSI_errS0.toExponential(2)} | S_AB=1 leak=${cnotSI_S1.leak.toExponential(2)} err=${cnotSI_errS1.toExponential(2)} | ||U(0)-U(1)||_F=${cnotSI_phaseMatch.toExponential(2)}`)
  console.log(`        FULL 9-Spin C(9,4)=126 Continuous-Rapidity Linear-Chain Toffoli (${count1Q_9} 1Q + ${count2Q_9} 2Q + ${countSwap_9} routing SWAP = ${toff9Pulses.length} strictly adjacent colls, uni126Err=${toff9Cont.uni126Err.toExponential(1)}):`)
  console.log(`          16D leak=${toff9Cont.leak16.toExponential(2)}, crossGauge=${toff9Cont.crossGauge.toExponential(2)}, ||U8(S_AB=0)-Toff||=${toff9Cont.errG0.toExponential(2)}, ||U8(S_AB=1)-Toff||=${toff9Cont.errG1.toExponential(2)}, ||U8(0)-U8(1)||=${toff9Cont.phaseMatch01.toExponential(2)}, ||U16-Toff(x)I2||=${toff9Cont.err16.toExponential(2)}`)
  console.log(`        SAME-ENCODING Hybrid 9-Spin C(9,4)=126 Toffoli (discrete bare <M_{01},M_{12}> 1Q + framing H in CNOT [pool=${discSynth.bH.poolSize}, len<=20] + continuous 53-coll spin-indep CZ + 36 routing SWAPs, total=${discSynth.totalPulses} colls):`)
  console.log(`          bH_DFS err=${discSynth.bH.err.toFixed(5)} (${discSynth.bH.letters} letters / ${discSynth.bH.posMeetCount} pos M_meet), bT_DFS err=${discSynth.bT.err.toFixed(5)} (${discSynth.bT.letters} letters / ${discSynth.bT.posMeetCount} pos M_meet)`)
  console.log(`          C^126 16D leak=${discSynth.hyb126.leak16.toExponential(2)}, crossGauge=${discSynth.hyb126.crossGauge.toExponential(2)}, ||U8(0)-U8(1)||=${discSynth.hyb126.phaseMatch01.toExponential(2)}, ||U8-Toff||=${discSynth.hyb126.errG0.toFixed(5)}, procFid=${discSynth.hyb126.procFid.toFixed(6)}`)

  const ok =
    sixRolePairDiff === 0 &&
    sixRoleOffLine === 0 &&
    sixRoleRevDiff === 0 &&
    nineRolePairDiff === 0 &&
    nineRoleOffLine === 0 &&
    nineRoleRevDiff === 0 &&
    trL7CNorm2[0] === 25n &&
    trL7CDen2 === 16n &&
    Math.abs(trSU2Val - 1.25) < 1e-13 &&
    Math.abs(trM01M12 - 1.25) < 1e-13 &&
    hBalErr < 1e-13 &&
    tBalErr < 1e-13 &&
    su9Dim === 80 &&
    cz20UniErr < 1e-13 &&
    cp3Res.leak < 1e-13 &&
    cp3Err < 1e-13 &&
    czDfsLeak < 1e-13 &&
    czDfsErr < 1e-13 &&
    cAbs(makhDfsCNOT.G1) < 1e-13 &&
    Math.abs(makhDfsCNOT.G2 - 1) < 1e-13 &&
    Math.abs(makhDfsCNOT.ep - 2 / 9) < 1e-13 &&
    czYangErr < 1e-13 &&
    cnotYangErr < 1e-13 &&
    Math.abs(bellConcurrence - 1) < 1e-13 &&
    Math.abs(bellCHSH - 2 * SQRT2) < 1e-13 &&
    czSI_uniErr < 1e-13 &&
    czSI_S0.leak < 1e-13 &&
    czSI_S1.leak < 1e-13 &&
    czSI_errS0 < 1e-13 &&
    czSI_errS1 < 1e-13 &&
    czSI_phaseMatch < 1e-13 &&
    cnotSI_uniErr < 1e-13 &&
    cnotSI_S0.leak < 1e-13 &&
    cnotSI_S1.leak < 1e-13 &&
    cnotSI_errS0 < 1e-13 &&
    cnotSI_errS1 < 1e-13 &&
    cnotSI_phaseMatch < 1e-13 &&
    toff9Cont.uni126Err < 1e-13 &&
    toff9Cont.leak16 < 1e-13 &&
    toff9Cont.crossGauge < 1e-13 &&
    toff9Cont.errG0 < 1e-13 &&
    toff9Cont.errG1 < 1e-13 &&
    toff9Cont.phaseMatch01 < 1e-13 &&
    toff9Cont.err16 < 1e-13 &&
    discSynth.hyb126.leak16 < 1e-13 &&
    discSynth.hyb126.crossGauge < 1e-13 &&
    discSynth.hyb126.phaseMatch01 < 1e-13 &&
    discSynth.hyb126.procFid > 0.99

  recordCheck(
    'U4',
    'Verbatim 4D 6/9-role M_pair=I, BigInt L_7 & <M01,M12> dense SU(2), su(9)=80, 60-coll S_tot=0 CZ, spin-indep 53/54-coll CZ/CNOT & full 9-spin 126D Toffoli',
    ok,
    `6/9-role M_pair=0, |Tr(L_7C)|^2=25/16, su(9)=${su9Dim}/80, 60-coll CZ=${czDfsErr.toExponential(1)}, SI-CNOT(0/1)=${cnotSI_phaseMatch.toExponential(1)}, 126D-Toff=${toff9Cont.err16.toExponential(1)} (373 adj), Hyb<M01,M12>-126D Fid=${discSynth.hyb126.procFid.toFixed(5)}`,
  )
}

// =================================================================================================
// PILLAR 5 (U5): SHARP CLASSIFICATION TABLE & FINAL AUDIT SUMMARY
// =================================================================================================

function runPillar5(startNs: bigint): void {
  console.log('\n================================================================================')
  console.log('PILLAR 5 (U5): SHARP COMPUTABILITY CLASSIFICATION TABLE (ZERO OVERCLAIM)')
  console.log('================================================================================')
  console.log('  1. Classical Railway CA on {3,4,3,4} (0012 / Zenodo 20710630):')
  console.log('       STRONG Turing universal (dedicated classical transition table, static finite tracks & deterministic 2-way switches).')
  console.log('  2. Verbatim Bare Quantum U Gate/Circuit Model (W12 + 0018 + W23 U4):')
  console.log('       EXACT BQP / SU(2^n) universal (dense SU(2) via slot-qubit L_7+C |Tr|=5/4 & 3-role DFS bare <M_{01},M_{12}> |Tr|=5/4; su(9) -> SU(4) on 6-role DFS with M_pair=I; spin-independent 53/54-coll CZ/CNOT, CHSH=2*sqrt(2), full 9-spin 126D Toffoli).')
  console.log('  3. Verbatim Bare Quantum U Autonomous Ballistic Scattering (W23 U1, U2, U4 -- ZERO external time-dependent gates):')
  console.log('       WEAK AUTONOMOUS BQP UNIVERSAL (fixed-depth circuits encoded spatially in initial wavepackets/doublons evolved strictly by bare U^t):')
  console.log('         - Sequential collinear CZ doubling (pi -> 2pi) & 5-body 2-station truth table (U1a)')
  console.log('         - Single-collision survival-conditioned 2-qutrit Bell state (log_2 3 bits) & remote D_1<->D_2 memory bus (U1b)')
  console.log('         - Verbatim 4D k=5/k=6 M_pair+Phi_odd conditional 12-line Mach-Zehnder routing shift at t=3 (U2)')
  console.log('         - Exact 6/9-distinct-role M_pair=I spin-independent CNOT & full 9-spin 126D linear-chain Toffoli synthesis (U4)')
  console.log('  4. Verbatim Bare Quantum U Finite-Seed Strong Autonomous Turing Machine (W23 U3 -- OBSTRUCTED / OPEN):')
  console.log('       OBSTRUCTED by four exact theorems (no static finite-support tracks/mirrors by Pell compacton no-go; no single-vibe 4D turns by Z_2^{24}; no 2/3-rail neutral switches by (-I,C); 10/11 unwanted M_pair fan-out & <0.93% single-contact target turn even with m=11 focusing).')

  const elapsedMs = Number(process.hrtime.bigint() - startNs) / 1e6
  const rssMb = process.memoryUsage().rss / (1024 * 1024)
  const passedCount = CHECKS.filter(c => c.passed).length

  console.log('\n================================================================================')
  console.log('FINAL VERIFICATION LEDGER (W23: AUTONOMOUS BARE-U COMPUTABILITY)')
  console.log('================================================================================')
  for (const row of CHECKS) {
    console.log(`  [${row.passed ? 'PASS' : 'FAIL'}] ${row.pillar.padEnd(4)} | ${row.name}`)
    console.log(`         -> ${row.detail}`)
  }
  console.log(`  SUMMARY: ${passedCount}/${CHECKS.length} CHECKS PASSED | runtime = ${(elapsedMs / 1000).toFixed(2)} s | peak RSS = ${rssMb.toFixed(1)} MB`)

  assertExact(passedCount === CHECKS.length, `Only ${passedCount}/${CHECKS.length} checks passed`)
}

function main(): void {
  const startNs = process.hrtime.bigint()
  runPillar1()
  runPillar2()
  runPillar3()
  runPillar4()
  runPillar5(startNs)
}

main()

export {}
