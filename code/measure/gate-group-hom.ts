// EXACT U(2) GATE GROUP DENSITY AND ABSTRACT TWO-MODE BEAMSPLITTER BALANCE (item vibe-roadmap-board-0008, gaps B-07, B-46).
// Tests both the Q(w) lift (Z[w][1/6]) and the Sigma(648) lift (Z[zeta_9][1/6]) named in note/path-records-and-the-ring.md §3.
// Gate provenance note: on a single excitation in the bare Tier-A QCA beat U, only the local coin C (cyclic order 6) acts;
// the qutrit phase gates P_w = diag(1, w), P_{zeta_9} = diag(1, zeta_9), the qutrit Fourier gate F_3, and the path-role
// controlled swap belong to the Tier-B Sigma(648) qutrit Clifford / link-phase alphabet (or multi-excitation M_meet encodings).
//   (1) Exact algebraic proof in Z[w][1/2] that U1 = w^2 * C * diag(1, w) in SU(2) has exact trace 1/2 (denominator 2,
//       not an algebraic integer => cos(theta) = 1/4 => irrational angle => infinite order),
//       and that U2 = diag(1, w) * U1 * diag(1, w^2) neither commutes with U1 nor lies in Pin(2) (||[U1, U2]||_F > 0.5),
//       establishing the algebraic hypotheses implying topological density in SU(2).
//   (2) Exact 2-adic valuation check confirming 2 is inert in Z[zeta_9] (ord_9(2) = 6 = phi(9), so v_2(|z|^2) is always even
//       and no single amplitude in Z[zeta_9][1/6] has |z|^2 = 1/2).
//   (3) Deterministic word search over two-mode gates up to length L = 14 (Q(w) lift and Sigma(648) lift),
//       measuring best ||U_00|^2 - 1/2| and the abstract 2-mode beamsplitter permanent balance proxy
//       V(U) = 1 - |perm(U)|^2 / (|U_00|^4 + |U_01|^4) (note: bare QCA ternary slots {-1, 0, +1} are hard-core and exclude
//       |2, 0> double occupation of identical excitations on one slot, so V(U) is a 2-mode unitary matrix balance proxy).
//   (4) Explicit exact 6x6 unitary matrix product U_tot = U3 * U2 * U1 on path(2) (x) role(3) over Z[w][1/6]
//       (U1 = C (x) I_3, U2 = diag(I_3, Z_3 F_3), U3 = controlled swap |1,0> <-> |0,1>), verifying exact unitarity of
//       U1, U2, U3, and U_tot and computing the exact output port weights (1/2, 1/2) directly from U_tot |0, 0>.
//
// NOTHING MOVES: pure L1 exact Z[w][1/6] matrix algebra + deterministic unitarity-checked word synthesis.

type Eis = readonly [bigint, bigint] // a + b * w

const E_ZERO: Eis = [0n, 0n]
const E_ONE: Eis = [1n, 0n]
const E_W: Eis = [0n, 1n]
const E_W2: Eis = [-1n, -1n]
const E_OMEGA_POW: readonly Eis[] = [E_ONE, E_W, E_W2]

const eAdd = (x: Eis, y: Eis): Eis => [x[0] + y[0], x[1] + y[1]]
const eSub = (x: Eis, y: Eis): Eis => [x[0] - y[0], x[1] - y[1]]
const eConj = (x: Eis): Eis => [x[0] - x[1], -x[1]]
// (a + b w)(c + d w) = (ac - bd) + (ad + bc - bd) w since w^2 = -1 - w
const eMul = (x: Eis, y: Eis): Eis => [
  x[0] * y[0] - x[1] * y[1],
  x[0] * y[1] + x[1] * y[0] - x[1] * y[1],
]
const eEq = (x: Eis, y: Eis): boolean => x[0] === y[0] && x[1] === y[1]
const eNormSq = (x: Eis): bigint =>
  x[0] * x[0] - x[0] * x[1] + x[1] * x[1]

type EisMat2 = {
  readonly m00: Eis
  readonly m01: Eis
  readonly m10: Eis
  readonly m11: Eis
  readonly denPow2: number // divided by 2^denPow2
}

type EisMatN = readonly (readonly Eis[])[]

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

function zeroMatN(n: number): Eis[][] {
  return Array.from({ length: n }, () =>
    Array.from({ length: n }, () => E_ZERO),
  )
}

function mulMatN(a: EisMatN, b: EisMatN): Eis[][] {
  const n = a.length
  const out = zeroMatN(n)

  for (let i = 0; i < n; i++) {
    for (let j = 0; j < n; j++) {
      let acc = E_ZERO

      for (let k = 0; k < n; k++) {
        acc = eAdd(acc, eMul(a[i]![k]!, b[k]![j]!))
      }

      out[i]![j] = acc
    }
  }

  return out
}

function matVecN(m: EisMatN, v: readonly Eis[]): Eis[] {
  return m.map(row => {
    let acc = E_ZERO

    for (let k = 0; k < row.length; k++) {
      acc = eAdd(acc, eMul(row[k]!, v[k]!))
    }

    return acc
  })
}

function isExactScaledUnitaryN(m: EisMatN, scaleSq: bigint): boolean {
  const n = m.length

  for (let i = 0; i < n; i++) {
    for (let j = 0; j < n; j++) {
      let acc = E_ZERO

      for (let k = 0; k < n; k++) {
        acc = eAdd(acc, eMul(eConj(m[k]![i]!), m[k]![j]!))
      }

      const target: Eis = i === j ? [scaleSq, 0n] : E_ZERO

      if (!eEq(acc, target)) {
        return false
      }
    }
  }

  return true
}

// Float64 2x2 unitary [r00,i00, r01,i01, r10,i10, r11,i11]
type U2 = readonly [
  number,
  number,
  number,
  number,
  number,
  number,
  number,
  number,
]

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

  return Math.max(
    Math.abs(d00r),
    Math.abs(d11r),
    Math.abs(d01r),
    Math.abs(d01i),
  )
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

// Abstract 2-mode beamsplitter permanent balance proxy over SU(2) words:
//   |perm(U)|^2 = |U_00 U_11 + U_01 U_10|^2 = (2 |U_00|^2 - 1)^2 for unitary U,
//   V(U) = (P_dist - |perm(U)|^2) / P_dist with P_dist = |U_00|^4 + |U_01|^4.
// Note: bare QCA ternary slots {-1, 0, +1} are hard-core and exclude |2, 0> double occupation
// of identical excitations on a single slot; this metric measures abstract 2x2 unitary balance.
function homStats(u: U2): {
  p00: number
  deltaHalf: number
  perm2: number
  visibility: number
} {
  const p00 = u[0] * u[0] + u[1] * u[1]
  const pr = u[0] * u[6] - u[1] * u[7] + u[2] * u[4] - u[3] * u[5]
  const pi = u[0] * u[7] + u[1] * u[6] + u[2] * u[5] + u[3] * u[4]
  const perm2 = pr * pr + pi * pi
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
  readonly pathRoleCircuitUnitaryExact: boolean
  readonly pathRoleOutputInZOmegaHalf: boolean
  readonly pathRolePortWeights: readonly [number, number]
  readonly pathRoleMaxErr: number
}

function searchHomCurve(
  gens: readonly U2[],
  maxLen: number,
): { curve: WordStepRow[]; maxErr: number } {
  const I2: U2 = [1, 0, 0, 0, 0, 0, 1, 0]

  // Deterministic stratified beam: keep up to 1600 states (top 600 closest to 0.5 + 100 bins x 10)
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

    const q = (r: number, i: number): string =>
      `${Math.round((r * cr - i * ci) * 1e6)},${Math.round((r * ci + i * cr) * 1e6)}`

    return `${q(u[0], u[1])}|${q(u[2], u[3])}|${q(u[4], u[5])}|${q(u[6], u[7])}`
  }

  for (let len = 1; len <= maxLen; len++) {
    const seen = new Set<string>()
    const nextAll: U2[] = []

    for (const u of frontier) {
      for (const g of gens) {
        const v = mulU2(g, u)
        const err = unitarityErr(v)

        if (err > maxErr) {
          maxErr = err
        }

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

        if (picked.has(s.idx)) {
          continue
        }

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

// Build and execute the exact 6x6 unitary 3-step path(2) (x) role(3) splitter over Z[w][1/6]:
//   Basis index = 3 * path + role (path in {0, 1}, role in {0, 1, 2}).
//   Step 1: U1 = C (x) I_3 (denominator 2) -> splits |0,0> to weights (1/4, 3/4).
//   Step 2: U2 = diag(I_3, Z_3 F_3) in Sigma(648) (denominator 3; 1/(i sqrt(3)) = (-1 - 2w)/3)
//           -> splits |1,0> uniformly across 3 roles of squared norm 1/4 each.
//   Step 3: U3 = controlled swap |1,0> <-> |0,1> (denominator 1, permutation unitary)
//           -> relocates one 1/4 role branch from port 1 to orthogonal role 1 on port 0.
//   Total:  6 U_tot = U3 * (3 U2) * (2 U1), exact unitary ((6 U_tot)^dag (6 U_tot) = 36 I_6).
function runExactPathRoleSplitter(): {
  readonly circuitUnitaryExact: boolean
  readonly outputInZOmegaHalf: boolean
  readonly portWeights: readonly [number, number]
  readonly maxErr: number
} {
  // 2 * U1 = (2 C) (x) I_3
  const c00: Eis = [1n, 1n] // 1 + w
  const c01: Eis = [1n, -1n] // 1 - w
  const u1Scaled2 = zeroMatN(6)

  for (let r = 0; r < 3; r++) {
    u1Scaled2[r]![r] = c00
    u1Scaled2[r]![3 + r] = c01
    u1Scaled2[3 + r]![r] = c01
    u1Scaled2[3 + r]![3 + r] = c00
  }

  // 3 * U2 = diag(3 I_3, 3 Z_3 F_3) with 3 / (i sqrt(3)) = -1 - 2w in Z[w]
  const invISqrt3Times3: Eis = [-1n, -2n]
  const u2Scaled3 = zeroMatN(6)

  for (let r = 0; r < 3; r++) {
    u2Scaled3[r]![r] = [3n, 0n]
  }

  for (let r = 0; r < 3; r++) {
    for (let c = 0; c < 3; c++) {
      u2Scaled3[3 + r]![3 + c] = eMul(
        invISqrt3Times3,
        E_OMEGA_POW[(r * (c + 1)) % 3]!,
      )
    }
  }

  // U3 = controlled swap |1,0> (index 3) <-> |0,1> (index 1)
  const u3 = zeroMatN(6)

  for (let i = 0; i < 6; i++) {
    if (i === 1) {
      u3[1]![3] = E_ONE
    } else if (i === 3) {
      u3[3]![1] = E_ONE
    } else {
      u3[i]![i] = E_ONE
    }
  }

  const u21Scaled6 = mulMatN(u2Scaled3, u1Scaled2)
  const uTotScaled6 = mulMatN(u3, u21Scaled6)

  const circuitUnitaryExact =
    isExactScaledUnitaryN(u1Scaled2, 4n) &&
    isExactScaledUnitaryN(u2Scaled3, 9n) &&
    isExactScaledUnitaryN(u3, 1n) &&
    isExactScaledUnitaryN(uTotScaled6, 36n)

  const initKet: readonly Eis[] = [
    E_ONE,
    E_ZERO,
    E_ZERO,
    E_ZERO,
    E_ZERO,
    E_ZERO,
  ]
  const outScaled6 = matVecN(uTotScaled6, initKet)
  const outputInZOmegaHalf = outScaled6.every(
    z => z[0] % 3n === 0n && z[1] % 3n === 0n,
  )

  let port0Num = 0n
  let port1Num = 0n

  for (let r = 0; r < 3; r++) {
    port0Num += eNormSq(outScaled6[r]!)
    port1Num += eNormSq(outScaled6[3 + r]!)
  }

  const denSq = 36n
  const wPort0 = Number(port0Num) / Number(denSq)
  const wPort1 = Number(port1Num) / Number(denSq)
  const exactHalf = 2n * port0Num === denSq && 2n * port1Num === denSq
  const maxErr = exactHalf
    ? 0
    : Math.max(Math.abs(wPort0 - 0.5), Math.abs(wPort1 - 0.5))

  return {
    circuitUnitaryExact,
    outputInZOmegaHalf,
    portWeights: [wPort0, wPort1],
    maxErr,
  }
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
  // Tier-B Sigma(648) qutrit/link phase gates P_w = diag(1, w), P_w2 = diag(1, w^2)
  const Pw: EisMat2 = {
    m00: [1n, 0n],
    m01: [0n, 0n],
    m10: [0n, 0n],
    m11: [0n, 1n],
    denPow2: 0,
  }
  const Pw2: EisMat2 = {
    m00: [1n, 0n],
    m01: [0n, 0n],
    m10: [0n, 0n],
    m11: [-1n, -1n],
    denPow2: 0,
  }

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

  // Float generators for Q(w) lift: {C, D, P_w, P_w2} (P_w, P_w2 from Tier-B Sigma(648) phase alphabet)
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

  const maxUnitarityErr = Math.max(
    unitarityErr(u1f),
    unitarityErr(u2f),
    qw.maxErr,
    s648.maxErr,
  )

  const splitter = runExactPathRoleSplitter()

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
    pathRoleCircuitUnitaryExact: splitter.circuitUnitaryExact,
    pathRoleOutputInZOmegaHalf: splitter.outputInZOmegaHalf,
    pathRolePortWeights: splitter.portWeights,
    pathRoleMaxErr: splitter.maxErr,
  }
}
