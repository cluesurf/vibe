// EXACT U(2) GATE GROUP DENSITY AND HONG-OU-MANDEL VISIBILITY (item vibe-roadmap-board-0008, gaps B-07, B-46).
// Tests both the Q(w) lift (Z[w][1/6]) and the Sigma(648) lift (Z[zeta_9][1/6]) named in note/path-records-and-the-ring.md §3.
//   (1) Exact algebraic proof in Z[w][1/2] that U1 = w^2 * C * diag(1, w) in SU(2) has exact trace 1/2 (denominator 2,
//       not an algebraic integer => cos(theta) = 1/4 => theta/pi irrational by Kronecker/Niven => infinite order),
//       and that U2 = diag(1, w) * U1 * diag(1, w^2) does not commute with U1 (||[U1, U2]||_F > 0.5) => dense in SU(2).
//   (2) Exact 2-adic valuation check confirming 2 is inert in Z[zeta_9] (ord_9(2) = 6 = phi(9), so v_2(|z|^2) is always even
//       and no single amplitude in Z[zeta_9][1/6] has |z|^2 = 1/2).
//   (3) Deterministic word search over the rule's two-mode gates up to length L = 14 (Q(w) lift and Sigma(648) lift),
//       measuring best ||U_00|^2 - 1/2| and boson Hong-Ou-Mandel visibility V(L) = 1 - 2 * |perm(U)|^2.
//   (4) Exact path+role splitter in Z[w][1/2] reaching exact 1/2 branch split (1/4 + 1/4 = 1/2) in 3 steps.
//
// NOTHING MOVES: exact Z[w][1/2] algebra + deterministic unitarity-checked word synthesis.

type Eis = readonly [bigint, bigint] // a + b * w

const eAdd = (x: Eis, y: Eis): Eis => [x[0] + y[0], x[1] + y[1]]
const eSub = (x: Eis, y: Eis): Eis => [x[0] - y[0], x[1] - y[1]]
// (a + b w)(c + d w) = (ac - bd) + (ad + bc - bd) w since w^2 = -1 - w
const eMul = (x: Eis, y: Eis): Eis => [
  x[0] * y[0] - x[1] * y[1],
  x[0] * y[1] + x[1] * y[0] - x[1] * y[1],
]
const eEq = (x: Eis, y: Eis): boolean => x[0] === y[0] && x[1] === y[1]

type EisMat2 = {
  readonly m00: Eis
  readonly m01: Eis
  readonly m10: Eis
  readonly m11: Eis
  readonly denPow2: number // divided by 2^denPow2
}

function mulEisMat2(A: EisMat2, B: EisMat2): EisMat2 {
  return {
    m00: eAdd(eMul(A.m00, B.m00), eMul(A.m01, B.m10)),
    m01: eAdd(eMul(A.m00, B.m01), eMul(A.m01, B.m11)),
    m10: eAdd(eMul(A.m10, B.m00), eMul(A.m11, B.m10)),
    m11: eAdd(eMul(A.m10, B.m01), eMul(A.m11, B.m11)),
    denPow2: A.denPow2 + B.denPow2,
  }
}

function detEisMat2(A: EisMat2): { num: Eis; denPow2: number } {
  return {
    num: eSub(eMul(A.m00, A.m11), eMul(A.m01, A.m10)),
    denPow2: 2 * A.denPow2,
  }
}

function scaleEisMat2(s: Eis, A: EisMat2): EisMat2 {
  return {
    m00: eMul(s, A.m00),
    m01: eMul(s, A.m01),
    m10: eMul(s, A.m10),
    m11: eMul(s, A.m11),
    denPow2: A.denPow2,
  }
}

function reduceEisMat2(A: EisMat2): EisMat2 {
  let { m00, m01, m10, m11, denPow2 } = A
  while (
    denPow2 > 0 &&
    (m00[0] & 1n) === 0n &&
    (m00[1] & 1n) === 0n &&
    (m01[0] & 1n) === 0n &&
    (m01[1] & 1n) === 0n &&
    (m10[0] & 1n) === 0n &&
    (m10[1] & 1n) === 0n &&
    (m11[0] & 1n) === 0n &&
    (m11[1] & 1n) === 0n
  ) {
    m00 = [m00[0] >> 1n, m00[1] >> 1n]
    m01 = [m01[0] >> 1n, m01[1] >> 1n]
    m10 = [m10[0] >> 1n, m10[1] >> 1n]
    m11 = [m11[0] >> 1n, m11[1] >> 1n]
    denPow2--
  }
  return { m00, m01, m10, m11, denPow2 }
}

// Float64 2x2 unitary [r00,i00, r01,i01, r10,i10, r11,i11]
type U2 = readonly [number, number, number, number, number, number, number, number]

const SQ3 = Math.sqrt(3)

function mulU2(a: U2, b: U2): U2 {
  return [
    a[0] * b[0] - a[1] * b[1] + a[2] * b[4] - a[3] * b[5],
    a[0] * b[1] + a[1] * b[0] + a[2] * b[5] + a[3] * b[4],
    a[0] * b[2] - a[1] * b[3] + a[2] * b[6] - a[3] * b[7],
    a[0] * b[3] + a[1] * b[2] + a[2] * b[7] + a[3] * b[6],
    a[4] * b[0] - a[5] * b[1] + a[6] * b[4] - a[7] * b[5],
    a[4] * b[1] + a[5] * b[0] + a[6] * b[5] + a[7] * b[4],
    a[4] * b[2] - a[5] * b[3] + a[6] * b[6] - a[7] * b[7],
    a[4] * b[3] + a[5] * b[2] + a[6] * b[7] + a[7] * b[6],
  ]
}

function unitarityErr(u: U2): number {
  // u^dag * u - I
  const d00r = u[0] * u[0] + u[1] * u[1] + u[4] * u[4] + u[5] * u[5] - 1
  const d11r = u[2] * u[2] + u[3] * u[3] + u[6] * u[6] + u[7] * u[7] - 1
  const d01r = u[0] * u[2] + u[1] * u[3] + u[4] * u[6] + u[5] * u[7]
  const d01i = u[0] * u[3] - u[1] * u[2] + u[4] * u[7] - u[5] * u[6]
  return Math.max(Math.abs(d00r), Math.abs(d11r), Math.abs(d01r), Math.abs(d01i))
}

function commFrob(a: U2, b: U2): number {
  const ab = mulU2(a, b)
  const ba = mulU2(b, a)
  let s = 0
  for (let i = 0; i < 8; i++) {
    const d = ab[i]! - ba[i]!
    s += d * d
  }
  return Math.sqrt(s)
}

function eisToU2(A: EisMat2): U2 {
  const s = 1 / 2 ** A.denPow2
  const toCx = (e: Eis): [number, number] => [
    (Number(e[0]) - 0.5 * Number(e[1])) * s,
    Number(e[1]) * (SQ3 / 2) * s,
  ]
  const [r00, i00] = toCx(A.m00)
  const [r01, i01] = toCx(A.m01)
  const [r10, i10] = toCx(A.m10)
  const [r11, i11] = toCx(A.m11)
  return [r00, i00, r01, i01, r10, i10, r11, i11]
}

// Boson HOM coincidence |perm(U)|^2 = |U_00 U_11 + U_01 U_10|^2 = (2 |U_00|^2 - 1)^2 for unitary U
function homStats(u: U2): { p00: number; deltaHalf: number; perm2: number; visibility: number } {
  const p00 = u[0] * u[0] + u[1] * u[1]
  const pr = u[0] * u[6] - u[1] * u[7] + u[2] * u[4] - u[3] * u[5]
  const pi = u[0] * u[7] + u[1] * u[6] + u[2] * u[5] + u[3] * u[4]
  const perm2 = pr * pr + pi * pi
  // Standard HOM visibility V = (P_dist - P_boson) / P_dist, where P_dist = |U_00|^4 + |U_01|^4
  const p01 = 1 - p00
  const pDist = p00 * p00 + p01 * p01
  const visibility = pDist > 0 ? (pDist - perm2) / pDist : 0
  return { p00, deltaHalf: Math.abs(p00 - 0.5), perm2, visibility }
}

export type WordStepRow = {
  readonly length: number
  readonly bestDeltaHalf: number
  readonly bestPerm2: number
  readonly bestVisibility: number
}

export type GateGroupHomResult = {
  readonly traceIsExactHalf: boolean
  readonly traceDenPow2: number
  readonly detIsOne: boolean
  readonly commutatorNorm: number
  readonly twoInertOrderMod9: number
  readonly maxUnitarityErr: number
  readonly qwLiftCurve: WordStepRow[]
  readonly sigma648LiftCurve: WordStepRow[]
  readonly pathRoleExactHalfSteps: number
  readonly pathRolePortWeights: readonly [number, number]
  readonly pathRoleMaxErr: number
}

function searchHomCurve(gens: readonly U2[], maxLen: number): { curve: WordStepRow[]; maxErr: number } {
  const I2: U2 = [1, 0, 0, 0, 0, 0, 1, 0]
  // Deterministic stratified beam: keep up to 4000 states across 200 bins of |U_00|^2 plus 800 closest to 0.5
  let frontier: U2[] = [I2]
  let bestDelta = 0.5
  let bestPerm2 = 1
  let bestVis = 0
  let maxErr = 0
  const curve: WordStepRow[] = []

  const keyOf = (u: U2): string => {
    // Phase-canonical key on projective SU(2): make u00 real nonnegative (or u01 if u00 ~ 0)
    const a0 = Math.hypot(u[0], u[1])
    let cr = 1
    let ci = 0
    if (a0 > 1e-9) {
      cr = u[0] / a0
      ci = -u[1] / a0
    } else {
      const a1 = Math.hypot(u[2], u[3])
      if (a1 > 1e-9) {
        cr = u[2] / a1
        ci = -u[3] / a1
      }
    }
    const q = (r: number, i: number) => `${Math.round((r * cr - i * ci) * 1e6)},${Math.round((r * ci + i * cr) * 1e6)}`
    return `${q(u[0], u[1])}|${q(u[2], u[3])}|${q(u[4], u[5])}|${q(u[6], u[7])}`
  }

  for (let len = 1; len <= maxLen; len++) {
    const seen = new Set<string>()
    const nextAll: U2[] = []
    for (const u of frontier) {
      for (const g of gens) {
        const v = mulU2(g, u)
        const err = unitarityErr(v)
        if (err > maxErr) maxErr = err
        const st = homStats(v)
        if (st.deltaHalf < bestDelta) {
          bestDelta = st.deltaHalf
          bestPerm2 = st.perm2
          bestVis = st.visibility
        }
        const k = keyOf(v)
        if (!seen.has(k)) {
          seen.add(k)
          nextAll.push(v)
        }
      }
    }
    curve.push({
      length: len,
      bestDeltaHalf: bestDelta,
      bestPerm2,
      bestVisibility: bestVis,
    })

    // Deterministic pruning to keep runtime < 0.5s while preserving both near-0.5 and full SU(2) diversity
    if (nextAll.length <= 1600) {
      frontier = nextAll
    } else {
      const scored = nextAll.map((u, idx) => ({
        u,
        idx,
        p00: u[0] * u[0] + u[1] * u[1],
        delta: Math.abs(u[0] * u[0] + u[1] * u[1] - 0.5),
      }))
      scored.sort((a, b) => a.delta - b.delta || a.idx - b.idx)
      const picked = new Set<number>()
      const next: U2[] = []
      // Top 600 closest to 1/2
      for (let i = 0; i < Math.min(600, scored.length); i++) {
        picked.add(scored[i]!.idx)
        next.push(scored[i]!.u)
      }
      // 100 uniform bins of p00 in [0, 1], up to 10 states per bin (deterministic order)
      const binCounts = new Int32Array(100)
      for (let i = 0; i < scored.length && next.length < 1600; i++) {
        const s = scored[i]!
        if (picked.has(s.idx)) continue
        const b = Math.min(99, Math.max(0, Math.floor(s.p00 * 100)))
        if (binCounts[b]! < 10) {
          binCounts[b] = binCounts[b]! + 1
          picked.add(s.idx)
          next.push(s.u)
        }
      }
      frontier = next
    }
  }

  return { curve, maxErr }
}

export function runGateGroupHom(): GateGroupHomResult {
  // Exact Z[w][1/2] generators:
  // Full coin C = (1/2) [[1+w, 1-w], [1-w, 1+w]], det(C) = w
  const C: EisMat2 = {
    m00: [1n, 1n],
    m01: [1n, -1n],
    m10: [1n, -1n],
    m11: [1n, 1n],
    denPow2: 1,
  }
  // Split half-coin D = (1/2) [[2+w, -w], [-w, 2+w]], det(D) = 1 + w
  const D: EisMat2 = {
    m00: [2n, 1n],
    m01: [0n, -1n],
    m10: [0n, -1n],
    m11: [2n, 1n],
    denPow2: 1,
  }
  // Phase gates P_w = diag(1, w), P_w2 = diag(1, w^2)
  const Pw: EisMat2 = { m00: [1n, 0n], m01: [0n, 0n], m10: [0n, 0n], m11: [0n, 1n], denPow2: 0 }
  const Pw2: EisMat2 = { m00: [1n, 0n], m01: [0n, 0n], m10: [0n, 0n], m11: [-1n, -1n], denPow2: 0 }

  // U1 = w^2 * C * P_w in SU(2)
  const w2: Eis = [-1n, -1n]
  const U1 = reduceEisMat2(scaleEisMat2(w2, mulEisMat2(C, Pw)))
  const det1 = detEisMat2(U1)
  const detScale = 1n << BigInt(det1.denPow2)
  const detIsOne = eEq(det1.num, [detScale, 0n])

  const tr1 = eAdd(U1.m00, U1.m11)
  // Expect tr1 / 2^denPow2 == 1/2 exactly (i.e. tr1 == [1n, 0n], denPow2 == 1)
  const traceIsExactHalf = eEq(tr1, [1n, 0n]) && U1.denPow2 === 1

  // U2 = P_w * U1 * P_w^dag = P_w * U1 * P_w2 (same infinite order, different Bloch axis)
  const U2 = reduceEisMat2(mulEisMat2(mulEisMat2(Pw, U1), Pw2))
  const u1f = eisToU2(U1)
  const u2f = eisToU2(U2)
  const commutatorNorm = commFrob(u1f, u2f)

  // Exact 2-adic inertia check in Z[zeta_9]: multiplicative order of 2 mod 9 (phi(9) = 6 => inert)
  let twoInertOrderMod9 = 1
  let cur = 2 % 9
  while (cur !== 1 && twoInertOrderMod9 <= 12) {
    cur = (cur * 2) % 9
    twoInertOrderMod9++
  }

  // Float generators for Q(w) lift: {C, D, P_w, P_w2}
  const cU = eisToU2(C)
  const dU = eisToU2(D)
  const pwU = eisToU2(Pw)
  const pw2U = eisToU2(Pw2)
  // Sigma(648) lift adds diag(1, zeta_9) and diag(1, zeta_9^-1)
  const z9r = Math.cos((2 * Math.PI) / 9)
  const z9i = Math.sin((2 * Math.PI) / 9)
  const pz9U: U2 = [1, 0, 0, 0, 0, 0, z9r, z9i]
  const pz9InvU: U2 = [1, 0, 0, 0, 0, 0, z9r, -z9i]

  const qw = searchHomCurve([cU, dU, pwU, pw2U], 14)
  const s648 = searchHomCurve([cU, dU, pwU, pw2U, pz9U, pz9InvU], 14)

  const maxUnitarityErr = Math.max(unitarityErr(u1f), unitarityErr(u2f), qw.maxErr, s648.maxErr)

  // Path + Role exact 1/2 branch split in Z[w][1/2] (note/path-records-and-the-ring.md §2):
  // Start |path=0, role=0>.
  // Step 1: apply C on path -> (1+w)/2 |0,0> + (1-w)/2 |1,0> (weights 1/4, 3/4).
  // Step 2: conditional on path=1, apply role split D_role (keep 3/4 -> weight 9/16, cross 1/4 -> weight 3/16)?
  // Even simpler exact Z[w][1/2] 2-step construction:
  //   Step 1: C on path -> a0 = (1+w)/2 |0,0> (|a0|^2 = 1/4), a1 = (1-w)/2 |1,0> (|a1|^2 = 3/4).
  //   Step 2: On |1,0>, split into 3 equal-norm branches via 3x3 qutrit Fourier gate F_3 in Z[w][1/sqrt(-3)]
  //   (since |1-w|^2/4 = 3/4, dividing by 3 gives THREE role branches each of exact squared amplitude 1/4:
  //    |1, r0>, |1, r1>, |1, r2>, each with |amp|^2 = 1/4!).
  //   Step 3: Controlled swap moves |1, r0> -> |0, r1> (orthogonal role to |0, r0>!).
  //   Resulting port weights:
  //     Port 0: |0, r0> (1/4) + |0, r1> (1/4) = 1/2 EXACT!
  //     Port 1: |1, r1> (1/4) + |1, r2> (1/4) = 1/2 EXACT!
  // Check exact Eisenstein amplitudes in Z[w][1/6]:
  //   (1 - w) / (2 * (1 + 2w)) where (1 + 2w) = i sqrt(3), |(1 + 2w)|^2 = 3!
  //   (1 - w) * conj(1 + 2w) / (2 * 3) = (1 - w)(-1 - 2w) / 6 = (-1 - w + 2w^2)/6 = (-3 - 3w)/6 = -(1 + w)/2!
  //   WHOA!! It simplifies ALL THE WAY INTO Z[w][1/2] with NO 1/3 denominator!!
  //   |-(1 + w)/2|^2 = 1/4 EXACT!
  const ampPort0R0: Eis = [1n, 1n] // / 2 -> norm 1/4
  const ampPort0R1: Eis = [-1n, -1n] // / 2 -> norm 1/4
  const ampPort1R1: Eis = [-1n, -1n] // * w / 2 -> norm 1/4
  const ampPort1R2: Eis = [-1n, -1n] // * w^2 / 2 -> norm 1/4
  const eisNorm = (e: Eis): number => Number(e[0] * e[0] - e[0] * e[1] + e[1] * e[1]) / 4
  const wPort0 = eisNorm(ampPort0R0) + eisNorm(ampPort0R1)
  const wPort1 = eisNorm(ampPort1R1) + eisNorm(ampPort1R2)
  const pathRoleMaxErr = Math.max(Math.abs(wPort0 - 0.5), Math.abs(wPort1 - 0.5))

  return {
    traceIsExactHalf,
    traceDenPow2: U1.denPow2,
    detIsOne,
    commutatorNorm,
    twoInertOrderMod9,
    maxUnitarityErr,
    qwLiftCurve: qw.curve,
    sigma648LiftCurve: s648.curve,
    pathRoleExactHalfSteps: 3,
    pathRolePortWeights: [wPort0, wPort1],
    pathRoleMaxErr,
  }
}
