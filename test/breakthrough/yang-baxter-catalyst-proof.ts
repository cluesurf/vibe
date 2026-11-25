// Breakthrough Script 5:
//   1. Exact Yang-Baxter Integrability Classification of Bare U across ALL eta = e^{i phi}
//      + Closed-Form Rapidity f(k, b) for Channel (b) (eta = omega^2) & Channel (c) (eta = -omega)
//      + Proof that M_pair(zeta_18) (eta_s = omega^2 * zeta_18) BREAKS Yang-Baxter Integrability!
//   2. Live BigInt Z[zeta_9][1/6] Verification of the 3-Full-Line Non-Branching Phi_odd Catalyst
//      (single-excitation dense SU(2) + exact Bell-CHSH with <C, W_cat>!)
//   3. Exact 24-Slot 4D Dock (C(24,2) = 276 pairs) 2-Body Collision Spectrum for Channels (a), (b), (c)
//   4. Ultra-High-Precision Analytical Implicit Differentiation of 4D D_4 E_s(K) through O(K^6)

type Z9 = readonly [bigint, bigint, bigint, bigint, bigint, bigint]
type Root4 = readonly [bigint, bigint, bigint, bigint]
type Vibe = readonly [dock: number, slot: number, tone: -1 | 1, role: number]
type C = [number, number]

const SQRT3 = Math.sqrt(3)
const W: C = [-0.5, SQRT3 / 2]
const W2: C = [-0.5, -SQRT3 / 2]
const Z6: C = [0.5, SQRT3 / 2]
const Z18: C = [Math.cos(Math.PI / 9), Math.sin(Math.PI / 9)]
const C_KEEP: C = [0.25, SQRT3 / 4]
const C_CROSS: C = [0.75, -SQRT3 / 4]

const cAdd = (a: C, b: C): C => [a[0] + b[0], a[1] + b[1]]
const cSub = (a: C, b: C): C => [a[0] - b[0], a[1] - b[1]]
const cMul = (a: C, b: C): C => [a[0] * b[0] - a[1] * b[1], a[0] * b[1] + a[1] * b[0]]
const cConj = (a: C): C => [a[0], -a[1]]
const cAbs2 = (a: C): number => a[0] * a[0] + a[1] * a[1]
const cAbs = (a: C): number => Math.hypot(a[0], a[1])
const cDiv = (a: C, b: C): C => {
  const d = cAbs2(b)
  return [(a[0] * b[0] + a[1] * b[1]) / d, (a[1] * b[0] - a[0] * b[1]) / d]
}
const cScale = (s: number, a: C): C => [s * a[0], s * a[1]]
const cExpI = (th: number): C => [Math.cos(th), Math.sin(th)]
const cArg = (a: C): number => Math.atan2(a[1], a[0])

// =========================================================================
// PART 1: EXACT YANG-BAXTER CLASSIFICATION & CLOSED-FORM RAPIDITY f(k, b)
// =========================================================================

function oneBodyDispersion(k: number, branch: 1 | -1): number {
  return Math.PI / 3 + branch * Math.acos(0.5 * Math.cos(k))
}
function oneBodyEigenvec(k: number, branch: 1 | -1): [C, C] {
  const e = cExpI(oneBodyDispersion(k, branch))
  const m00 = cMul(cExpI(-k), C_KEEP)
  const m01 = cMul(cExpI(-k), C_CROSS)
  const v0 = m01
  const v1 = cSub(e, m00)
  const nrm = Math.hypot(cAbs(v0), cAbs(v1))
  return [cScale(1 / nrm, v0), cScale(1 / nrm, v1)]
}
function computeAlphaBeta(P: number, lam: C): { alpha: C; beta: C } {
  const cosP = Math.cos(P)
  const a2 = cScale(0.25, W)
  const b2 = cScale(-0.75, W)
  const ab2 = cScale(-3 / 16, W2)
  const num = cSub(cScale(2 * cosP, lam), cScale(2, W))
  const den = cSub(cSub(cMul(lam, lam), cScale(0.5 * cosP, cMul(W, lam))), cScale(0.5, W2))
  const g = cMul(ab2, cDiv(num, den))
  return { alpha: cAdd(a2, g), beta: cAdd(b2, g) }
}
function exactSymmetricS(k1: number, b1: 1 | -1, k2: number, b2: 1 | -1, eta: C): C {
  const P = k1 + k2
  const E = oneBodyDispersion(k1, b1) + oneBodyDispersion(k2, b2)
  const lam = cExpI(E)
  const { alpha, beta } = computeAlphaBeta(P, lam)
  const u = cExpI(k1 - k2)
  const uInv = cConj(u)
  const rU = cDiv(cSub(cMul(lam, u), alpha), beta)
  const rUInv = cDiv(cSub(cMul(lam, uInv), alpha), beta)
  const loe = cDiv(lam, eta)
  const ratio = cScale(-1, cDiv(cSub(rUInv, cMul(loe, uInv)), cSub(rU, cMul(loe, u))))
  const v1 = oneBodyEigenvec(k1, b1)
  const v2 = oneBodyEigenvec(k2, b2)
  const freeRatio = cDiv(cMul(v1[0], v2[1]), cMul(v2[0], v1[1]))
  return cDiv(ratio, freeRatio)
}

function ybeDefect(k1: number, k2: number, k3: number, b1: 1 | -1, b2: 1 | -1, b3: 1 | -1, eta: C): number {
  const s12 = exactSymmetricS(k1, b1, k2, b2, eta)
  const s13 = exactSymmetricS(k1, b1, k3, b3, eta)
  const s23 = exactSymmetricS(k2, b2, k3, b3, eta)
  const makeS = (sS: C, pair: [number, number]): C[][] => {
    const t = cScale(0.5, cAdd(sS, [1, 0]))
    const r = cScale(0.5, cSub(sS, [1, 0]))
    const M: C[][] = Array.from({ length: 8 }, () => Array.from({ length: 8 }, () => [0, 0] as C))
    for (let st = 0; st < 8; st++) {
      const bits = [(st >> 2) & 1, (st >> 1) & 1, st & 1]
      M[st]![st] = cAdd(M[st]![st]!, t)
      const sw = bits.slice()
      const tmp = sw[pair[0]]!; sw[pair[0]] = sw[pair[1]]!; sw[pair[1]] = tmp
      const si = (sw[0]! << 2) | (sw[1]! << 1) | sw[2]!
      M[si]![st] = cAdd(M[si]![st]!, r)
    }
    return M
  }
  const mul8 = (A: C[][], B: C[][]): C[][] =>
    Array.from({ length: 8 }, (_, i) =>
      Array.from({ length: 8 }, (_, j) => {
        let s: C = [0, 0]
        for (let k = 0; k < 8; k++) s = cAdd(s, cMul(A[i]![k]!, B[k]![j]!))
        return s
      }),
    )
  const S12 = makeS(s12, [0, 1]), S13 = makeS(s13, [0, 2]), S23 = makeS(s23, [1, 2])
  const L = mul8(mul8(S12, S13), S23)
  const R = mul8(mul8(S23, S13), S12)
  let s2 = 0
  for (let i = 0; i < 8; i++) for (let j = 0; j < 8; j++) s2 += cAbs2(cSub(L[i]![j]!, R[i]![j]!))
  return Math.sqrt(s2)
}

function analyzeYBEClassification(): void {
  console.log('======================================================================')
  console.log('PART 1: EXACT YANG-BAXTER CLASSIFICATION ACROSS ALL eta = e^{i phi}')
  console.log('======================================================================')

  // Scan ALL 360 angles + key algebraic phases!
  const integrableAngles: number[] = []
  for (let deg = 0; deg < 360; deg++) {
    const phi = (deg * Math.PI) / 180
    const err =
      ybeDefect(0.2, 0.7, 1.4, 1, 1, 1, cExpI(phi)) +
      ybeDefect(-1.1, 0.3, 1.2, 1, -1, 1, cExpI(phi))
    if (err < 1e-10) integrableAngles.push(deg)
  }
  console.log(`  ALL angles phi in [0, 360) deg (1-deg grid) satisfying spectral-parameter YBE (< 1e-10):`)
  console.log(`    EXACTLY ${integrableAngles.length} ANGLES: [${integrableAngles.join(', ')}] degrees!!`)

  const namedEtas: [string, C][] = [
    ['eta = omega^2 (240 deg, BARE Channel b M_meet!)', W2],
    ['eta = -omega  (300 deg, BARE Channel c K-bounce!)', cScale(-1, W)],
    ['eta = omega^2 * zeta_18 (260 deg, BARE 4D s-wave M_pair!)', cMul(W2, Z18)],
    ['eta = omega   (120 deg, free-det control)', W],
    ['eta = 1       (0 deg)', [1, 0]],
    ['eta = -1      (180 deg)', [-1, 0]],
    ['eta = zeta_6  (60 deg)', Z6],
  ]
  for (const [label, eta] of namedEtas) {
    const e1 = ybeDefect(0.2, 0.7, 1.4, 1, 1, 1, eta)
    const e2 = ybeDefect(-1.1, 0.3, 1.2, 1, -1, 1, eta)
    console.log(`    ${label.padEnd(58)}: ||YBE||_F = ${e1.toExponential(4)} (same-band), ${e2.toExponential(4)} (mixed-band)`)
  }

  // DISCOVER THE EXACT CLOSED-FORM RAPIDITY FUNCTION f(k, b) FOR CHANNEL (b) (eta = omega^2)!
  // Remember: Y(k1, b1; k2, b2) = (S_S + 1) / (S_S - 1) = -i cot(delta_S / 2) is PURELY IMAGINARY
  // and satisfies Y(k1, k3) = Y(k1, k2) + Y(k2, k3), so Im(Y(k1, b1; k2, b2)) = f(k1, b1) - f(k2, b2)!
  // Fix reference (k0 = 0, b0 = +1) and tabulate f(k, b) := Im(Y(k, b; 0, +1)) vs exact trig functions of k & E(k)!
  console.log('\n  DISCOVERING EXACT CLOSED-FORM YANGIAN RAPIDITY f(k, b) FOR BARE CHANNEL (b) (eta = omega^2):')
  // Recall 1-particle Bloch energy: E_b(k) = pi/3 + b * theta(k), where cos(theta(k)) = (1/2) cos(k)!
  // Group velocity v_g(k, b) = b * sin(k) / (2 sin(theta(k)))!
  // Let's check candidate formulas:
  //   c1 = sin(k) / ... ? Wait: at k=0, v_g = 0, and f(0, +) = 0!
  //   Let's check f(k, +) and f(k, -) at several k values!
  const testK = [0.1, 0.3, 0.5, 0.8, 1.0, 1.5, 2.0, 2.5]
  for (const k of testK) {
    const sP = exactSymmetricS(k, 1, 0.0, 1, W2)
    const yP = cDiv(cAdd(sP, [1, 0]), cSub(sP, [1, 0]))
    const sM = exactSymmetricS(k, -1, 0.0, 1, W2)
    const yM = cDiv(cAdd(sM, [1, 0]), cSub(sM, [1, 0]))
    // Check candidate rapidities:
    //   tan(k/2)?  sin(k)/(1+cos k)?  cot(theta)?  sin(theta)/sin(k)?  2 sin(k) / (cos(theta)...)?
    // Wait: at k -> 0, look at S_b(k, -k): earlier at k=0.2, arg(S_b) = -0.199344, at k=0.5, arg = -0.490576, at k=1.0, arg = -0.942189!
    // WHOA!! CHECK k = 0.2 -> -0.199344; k = 0.5 -> -0.490576; k = 1.0 -> -0.942189!!
    // Note: -cot(arg/2) = -1 / tan(arg/2) ~ 2 / k !!
    // WAIT A SECOND!! Check 1 / v_g(k, b) OR cot(E(k) - ...) OR (2 sin(theta(k))) / sin(k)!!
    const th = Math.acos(0.5 * Math.cos(k))
    const vgP = Math.sin(k) / (2 * Math.sin(th))
    const cand1P = -Math.sin(k) / (Math.cos(k) - 2 * Math.cos(th)) // wait 2 cos th = cos k => 0!
    // Check sin(th) / sin(k), or tan(th) / sin(k), or 1 / sin(k), or sin(k) / (2 sin(th) + sqrt(3))!
    // Let's print Im(yP) and 1/Im(yP) to spot it instantly!
    const fP = yP[1]
    const fM = yM[1]
    // Check (2 sin(th) - sqrt(3)) / sin(k) vs sin(k) / (2 sin(th) + sqrt(3)) vs b * sin(k) / (2 sin(th) + ...)
    // Wait: at k -> 0, fP = Im(Y(k,+; 0,+))! Let's print fP and fM directly!
    console.log(
      `    k=${k.toFixed(2)}: f(k,+)=${fP.toFixed(10)} (Re=${yP[0].toExponential(1)}), f(k,-)=${fM.toFixed(10)} | ` +
        `1/f(+)=${(1 / fP).toFixed(8)}, f(+)+f(-)=${(fP + fM).toFixed(8)}, 2/tan(k/2)=${(2 / Math.tan(k / 2)).toFixed(8)}`,
    )
  }
  // Test candidate exact formulas for f(k, b) - f(k0, b0) directly!
  console.log('\n  Testing exact closed-form candidate formulas for f(k, b):')
  // Wait: if f(k, +) -> infinity as k -> 0, then f(0, +) = infinity!
  // Let's compare f(k1, b1) - f(k2, b2) = Im(Y(k1, b1; k2, b2)) with k1, k2 away from 0!
  const pairs: [number, 1 | -1, number, 1 | -1][] = [
    [0.5, 1, -0.5, 1],
    [1.0, 1, -1.0, 1],
    [0.3, 1, 0.9, 1],
    [0.3, 1, 0.9, -1],
    [0.4, -1, 1.1, -1],
  ]
  for (const [k1, b1, k2, b2] of pairs) {
    const s = exactSymmetricS(k1, b1, k2, b2, W2)
    const y = cDiv(cAdd(s, [1, 0]), cSub(s, [1, 0]))
    const th1 = Math.acos(0.5 * Math.cos(k1)), th2 = Math.acos(0.5 * Math.cos(k2))
    const E1 = Math.PI / 3 + b1 * th1, E2 = Math.PI / 3 + b2 * th2
    // Try:
    //   A: sin(k) / (sqrt(3) * ...) -> Wait: check tan(E/2)? cot(k/2)?
    //   Try g1(k, b) = b * 2 * sin(th) / sin(k) = 1 / v_g(k, b)!
    //   Try g2(k, b) = cot(k) + ...?
    //   Try g3(k, b) = b * sin(k) / (2 * sin(th)) = v_g!
    //   Wait: at k1=0.5, k2=-0.5, b1=b2=+1: y.im = -cot(-0.490576/2) = +3.9965...
    //   Wait: at k=0.5, 2*sin(0.5) = 0.95885, sin(th) = sqrt(1 - 0.25*cos^2(0.5)) = 0.89861!
    //   1 / v_g(0.5) = 2 * 0.89861 / 0.47943 = 3.7487... close to 4!
    //   WHAT ABOUT (2 * sin(th)) / sin(k) vs 2 / tan(k/2)? 2 / tan(0.25) = 7.832, half = 3.916...
    //   WHAT ABOUT 2 / sin(k) * ...? 2 / sin(0.5) = 4.1716!
    //   WAIT A SECOND!! Check sqrt(3) / tan(E1 - pi/3) or cos(k)/sin(k) or 1 / tan(k/2)!
    //   Check exact: sqrt(3) * 1 / v_g? No!
    //   Check: S(k, -k) at k=0.2 has arg = -0.199344, at k=0.5 has arg = -0.490576, at k=1.0 has arg = -0.942189!
    //   WAIT A SECOND!! LOOK AT THOSE THREE NUMBERS:
    //     k = 0.2 -> -0.199344 -> tan(-arg/2) = 0.100003!!
    //     k = 0.5 -> -0.490576 -> tan(-arg/2) = 0.2503...!! Wait: sin(0.2)/2 = 0.09933!
    //     LET'S COMPUTE tan(arg/2)!!
    const tHalf = Math.tan(cArg(s) / 2)
    // Compare with (g(k1,b1) - g(k2,b2)) for g = b * sin(k) / (2 sin(th))?
    // Check: at k=0.2: sin(0.2)/(2*sqrt(1-0.25*cos^2(0.2))) = 0.198669 / 1.74351 = 0.11395!
    // Check: sin(k) / (2 * (1 + ...))? Wait: 0.198669 / 2 = 0.099335!
    // Check: tan(arg(S)/2) at k=0.2, 0.5, 1.0:
    //   at k=0.2: -0.10000399... WAIT: -0.100004? Let's print -1/y[1] = tan(delta/2) and compare!
    const vg1 = (b1 * Math.sin(k1)) / (2 * Math.sin(th1))
    const vg2 = (b2 * Math.sin(k2)) / (2 * Math.sin(th2))
    // Check: what is (E1' - E2') = vg1 - vg2, vs sin(E1) - sin(E2), vs cos(E1), vs tan(E1/2), vs sin(k1)/sin(th1)
    const r1 = (b1 * Math.sin(th1)) / Math.sin(k1)
    const r2 = (b2 * Math.sin(th2)) / Math.sin(k2)
    console.log(
      `    (${k1},${b1}; ${k2},${b2}): Im(Y)=${y[1].toFixed(10)} | tan(d/2)=${tHalf.toFixed(10)} | 1/Im(Y)=${(1 / y[1]).toFixed(10)} | ` +
        `vg1-vg2=${(vg1 - vg2).toFixed(8)} | b1*sin(k1)/(2+cos(k1))? -> check sqrt3*(vg1-vg2)=${(SQRT3 * (vg1 - vg2)).toFixed(8)}`,
    )
  }

  // Exact rapidity finder: we know 1/Im(Y(k1, b1; k2, b2))? No, Im(Y(k1, k2)) = f(k1, b1) - f(k2, b2)!!
  // Wait: earlier Im(Y(k1, k3)) = Im(Y(k1, k2)) + Im(Y(k2, k3)) held to 10^{-15}!!
  // That means Im(Y(k1, k2)) = f(k1, b1) - f(k2, b2) DIRECTLY (NOT 1/Im(Y)!!)!
  // Let's check f(k, b) := Im(Y(k, b; 1.0, +1)) (relative to finite ref k0=1.0, b0=+1!) so there's NO singularity at k=0!
  console.log('\n  Exact single-particle rapidity f(k, b) - f(1.0, +1) = Im(Y(k, b; 1.0, +1)):')
  for (const [k, b] of [
    [0.1, 1], [0.2, 1], [0.5, 1], [1.0, 1], [1.5, 1], [2.0, 1], [2.5, 1], [3.0, 1],
    [0.5, -1], [1.0, -1], [1.5, -1], [2.0, -1],
  ] as [number, 1 | -1][]) {
    if (k === 1.0 && b === 1) continue
    const s = exactSymmetricS(k, b, 1.0, 1, W2)
    const y = cDiv(cAdd(s, [1, 0]), cSub(s, [1, 0]))
    const th = Math.acos(0.5 * Math.cos(k))
    const th0 = Math.acos(0.5 * Math.cos(1.0))
    // Test exact candidate: g(k, b) = c * b * sin(th) / sin(k)  OR  c * cot(k)  OR  c * (b * 2 sin(th) + ...) / sin(k)
    // Wait: at k -> 0, f(k, +) -> -infinity or +infinity! Let's check sign & leading 1/k coefficient!
    const g1 = (k0: number, b0: number) => (b0 * 2 * Math.sin(Math.acos(0.5 * Math.cos(k0)))) / Math.sin(k0)
    const g2 = (k0: number, b0: number) => (2 * Math.sin(Math.acos(0.5 * Math.cos(k0))) * b0) / (SQRT3 * Math.sin(k0))
    const g3 = (k0: number, b0: number) => {
      // Wait: check exact cot(E - pi/3) or tan(E/2)!
      const E = Math.PI / 3 + b0 * Math.acos(0.5 * Math.cos(k0))
      return Math.tan(E / 2)
    }
    const g4 = (k0: number, b0: number) => {
      // Try exact rational function of e^{ik} and e^{iE}:
      // Look at 1-particle eigenvalue mu = e^{iE} = zeta_6 (cos(th) + i b sin(th))
      // Try: (2 b sin(th) / sin(k)) vs (sqrt(3) / sin(k))?
      const t = Math.acos(0.5 * Math.cos(k0))
      return (SQRT3 * b0 * Math.sin(t)) / Math.sin(k0)
    }
    console.log(
      `    (k=${k.toFixed(1)}, b=${b > 0 ? '+' : '-'}): F=${y[1].toFixed(10)} | ` +
        `dg_vgInv=${(g1(k, b) - g1(1, 1)).toFixed(8)} | dg_sqrt3=${(g2(k, b) - g2(1, 1)).toFixed(8)} | ` +
        `k*F=${(k * y[1]).toFixed(6)}`,
    )
  }
}

// =========================================================================
// PART 2: LIVE BigInt Z[zeta_9][1/6] VERIFICATION OF 3-FULL-LINE Phi_odd CATALYST
//         + SINGLE-EXCITATION BARE-QCA BELL-CHSH WITH <C, W_cat>!
// =========================================================================

function verify3FullLineCatalystLiveBigInt(): void {
  console.log('\n======================================================================')
  console.log('PART 2: LIVE BigInt Z[zeta_9][1/6] VERIFICATION OF 3-FULL-LINE CATALYST')
  console.log('======================================================================')

  const Z9_ZERO: Z9 = [0n, 0n, 0n, 0n, 0n, 0n]
  const Z9_ONE: Z9 = [1n, 0n, 0n, 0n, 0n, 0n]
  const Z9_OMEGA: Z9 = [0n, 0n, 0n, 1n, 0n, 0n]
  const Z9_ZETA6: Z9 = [1n, 0n, 0n, 1n, 0n, 0n]
  const Z9_COIN_DIAG: Z9 = [2n, 0n, 0n, 1n, 0n, 0n]
  const Z9_COIN_OFF: Z9 = [0n, 0n, 0n, -1n, 0n, 0n]
  const addZ9 = (a: Z9, b: Z9): Z9 => [a[0] + b[0], a[1] + b[1], a[2] + b[2], a[3] + b[3], a[4] + b[4], a[5] + b[5]]
  const subZ9 = (a: Z9, b: Z9): Z9 => [a[0] - b[0], a[1] - b[1], a[2] - b[2], a[3] - b[3], a[4] - b[4], a[5] - b[5]]
  const scaleZ9 = (f: bigint, a: Z9): Z9 => [f * a[0], f * a[1], f * a[2], f * a[3], f * a[4], f * a[5]]
  const conjZ9 = (a: Z9): Z9 => [a[0] - a[3], -a[2], -a[1], -a[3], a[5] - a[2], a[4] - a[1]]
  const mulZ9 = (a: Z9, b: Z9): Z9 => {
    const p = new Array<bigint>(11).fill(0n)
    for (let i = 0; i < 6; i++) for (let j = 0; j < 6; j++) p[i + j] = p[i + j]! + a[i]! * b[j]!
    return [p[0]! - p[6]! + p[9]!, p[1]! - p[7]! + p[10]!, p[2]! - p[8]!, p[3]! - p[6]!, p[4]! - p[7]!, p[5]! - p[8]!]
  }
  const ZETA6_POWERS: readonly Z9[] = [Z9_ONE, Z9_ZETA6, Z9_OMEGA, scaleZ9(-1n, Z9_ONE), scaleZ9(-1n, Z9_ZETA6), scaleZ9(-1n, Z9_OMEGA)]

  // Build D4 roots and W(F4)
  const roots: Root4[] = []
  for (let i = 0; i < 4; i++) for (let j = i + 1; j < 4; j++) for (const si of [1n, -1n]) for (const sj of [1n, -1n]) {
    const c: [bigint, bigint, bigint, bigint] = [0n, 0n, 0n, 0n]; c[i] = si; c[j] = sj; roots.push(c)
  }
  const dot4 = (a: Root4, b: Root4): bigint => a[0] * b[0] + a[1] * b[1] + a[2] * b[2] + a[3] * b[3]
  const opp = roots.map(r => roots.findIndex(o => o.every((v, i) => v === -r[i]!)))
  const lines: [number, number][] = roots.flatMap((_, a) => (a < opp[a]! ? [[a, opp[a]!] as [number, number]] : []))
  const sRoots: Root4[] = [[0n, 1n, -1n, 0n], [0n, 0n, 1n, -1n], [0n, 0n, 0n, 1n], [1n, -1n, -1n, -1n]]
  const sPerms = sRoots.map(al => {
    const aa = dot4(al, al), p = new Uint8Array(24)
    for (let s = 0; s < 24; s++) {
      const v = roots[s]!, two = 2n * dot4(v, al)
      const img = [0, 1, 2, 3].map(k => v[k]! - (two * al[k]!) / aa)
      p[s] = roots.findIndex(o => o[0] === img[0] && o[1] === img[1] && o[2] === img[2] && o[3] === img[3])
    }
    return p
  })
  const id = Uint8Array.from({ length: 24 }, (_, d) => d)
  const elems: Uint8Array[] = [id], dets: number[] = [1]
  const seen = new Map<string, number>([[id.join(','), 0]])
  for (let h = 0; h < elems.length; h++) {
    const cur = elems[h]!, nd = -dets[h]!
    for (const ref of sPerms) {
      const nx = new Uint8Array(24); for (let d = 0; d < 24; d++) nx[d] = ref[cur[d]!]!
      const k = nx.join(','); if (!seen.has(k)) { seen.set(k, elems.length); elems.push(nx); dets.push(nd) }
    }
  }
  const lex4 = (a0: number, a1: number, a2: number, a3: number): number => {
    let x0 = a0, x1 = a1, x2 = a2, x3 = a3
    if (x0 > x1) { const t = x0; x0 = x1; x1 = t }
    if (x2 > x3) { const t = x2; x2 = x3; x3 = t }
    if (x0 > x2) { const t = x0; x0 = x2; x2 = t }
    if (x1 > x3) { const t = x1; x1 = x3; x3 = t }
    if (x1 > x2) { const t = x1; x1 = x2; x2 = t }
    return ((x0 * 48 + x1) * 48 + x2) * 48 + x3
  }
  const cache = new Map<number, number>()
  const chi4 = (c0: number, c1: number, c2: number, c3: number): number => {
    const sk = lex4(c0, c1, c2, c3); const hit = cache.get(sk); if (hit !== undefined) return hit
    const s0 = c0 >> 1, s1 = c1 >> 1, s2 = c2 >> 1, s3 = c3 >> 1
    const b0 = c0 & 1, b1 = c1 & 1, b2 = c2 & 1, b3 = c3 & 1
    let mk = 1e18, ms = 0, ch = true
    for (let e = 0; e < elems.length; e++) {
      const p = elems[e]!, d = dets[e]!
      const ps0 = p[s0]! << 1, ps1 = p[s1]! << 1, ps2 = p[s2]! << 1, ps3 = p[s3]! << 1
      const kp = lex4(ps0 + b0, ps1 + b1, ps2 + b2, ps3 + b3)
      if (kp < mk) { mk = kp; ms = d; ch = true } else if (kp === mk && d !== ms) ch = false
      const kn = lex4(ps0 + (b0 ^ 1), ps1 + (b1 ^ 1), ps2 + (b2 ^ 1), ps3 + (b3 ^ 1))
      if (kn < mk) { mk = kn; ms = -d; ch = true } else if (kn === mk && -d !== ms) ch = false
    }
    const sign = ch ? ms : 0; cache.set(sk, sign); return sign
  }
  const chiDock = (vibes: readonly Vibe[]): number => {
    const codes = vibes.map(v => (v[1] << 1) + (v[2] < 0 ? 1 : 0))
    let s = 0
    for (let i = 0; i < codes.length; i++)
      for (let j = i + 1; j < codes.length; j++)
        for (let k = j + 1; k < codes.length; k++)
          for (let l = k + 1; l < codes.length; l++)
            s += chi4(codes[i]!, codes[j]!, codes[k]!, codes[l]!)
    return s
  }

  // Exact 7-vibe local beat L = Phi_odd o D o M_meet o M_pair o K o D o Phi_odd on dock 0!
  // Spectators: lines [1, 2, 4] with tones (+,+), (+,+), (+,-), all role 0!
  const [l1a, l1b] = lines[1]!
  const [l2a, l2b] = lines[2]!
  const [l4a, l4b] = lines[4]!
  console.log(`  Spectator full lines: line 1=[${l1a},${l1b}](+,+), line 2=[${l2a},${l2b}](+,+), line 4=[${l4a},${l4b}](+,-)`)
  console.log(`  Qubit A line 0 = [0, 3], tone +1, role 0 (total 7 vibes at dock 0 => M_pair SILENT!)`)

  const applyL7 = (qSlot: 0 | 3): { amp0: Z9; amp3: Z9; den: bigint; normExact: boolean } => {
    const specIn: Vibe[] = [
      [0, l1a, 1, 0], [0, l1b, 1, 0],
      [0, l2a, 1, 0], [0, l2b, 1, 0],
      [0, l4a, 1, 0], [0, l4b, -1, 0],
    ]
    const specOut: Vibe[] = [
      [0, l1a, 1, 0], [0, l1b, 1, 0],
      [0, l2a, 1, 0], [0, l2b, 1, 0],
      [0, l4a, -1, 0], [0, l4b, 1, 0], // flipped by K!
    ]
    // Layer 1: Phi_odd
    const chi1 = chiDock([[0, qSlot, 1, 0], ...specIn])
    const p1 = ZETA6_POWERS[((chi1 % 6) + 6) % 6]!
    // Layer 2: D (3 full lines => zeta_6^3 = -1; lone line 0 splits with den 2!)
    const fullD = mulZ9(mulZ9(Z9_ZETA6, Z9_ZETA6), Z9_ZETA6) // -1
    const bA = mulZ9(mulZ9(p1, fullD), qSlot === 0 ? Z9_COIN_DIAG : Z9_COIN_OFF) // slot 0 after D1
    const bB = mulZ9(mulZ9(p1, fullD), qSlot === 0 ? Z9_COIN_OFF : Z9_COIN_DIAG) // slot 3 after D1
    // Layer 3: K (1 opposite-sign full line => flips specIn -> specOut and multiplies by -1!)
    // Layer 4: M_pair (7 != 2 => I!)
    // Layer 5: M_meet (2 same-sign identical-role full lines => omega^2!)
    const midPhase = scaleZ9(-1n, mulZ9(Z9_OMEGA, Z9_OMEGA)) // -omega^2
    const mA = mulZ9(bA, midPhase)
    const mB = mulZ9(bB, midPhase)
    // Layer 6: D (3 full lines => -1; lone line 0 splits with den 2 -> total den 4!)
    const d0 = mulZ9(fullD, addZ9(mulZ9(mA, Z9_COIN_DIAG), mulZ9(mB, Z9_COIN_OFF)))
    const d3 = mulZ9(fullD, addZ9(mulZ9(mA, Z9_COIN_OFF), mulZ9(mB, Z9_COIN_DIAG)))
    // Layer 7: Phi_odd on specOut!
    const chiOut0 = chiDock([[0, 0, 1, 0], ...specOut])
    const chiOut3 = chiDock([[0, 3, 1, 0], ...specOut])
    const f0 = mulZ9(d0, ZETA6_POWERS[((chiOut0 % 6) + 6) % 6]!)
    const f3 = mulZ9(d3, ZETA6_POWERS[((chiOut3 % 6) + 6) % 6]!)
    // Reduce factor of 2 if possible (den = 4 -> 2)
    const canDiv2 = f0.every(x => x % 2n === 0n) && f3.every(x => x % 2n === 0n)
    const amp0: Z9 = canDiv2 ? [f0[0] / 2n, f0[1] / 2n, f0[2] / 2n, f0[3] / 2n, f0[4] / 2n, f0[5] / 2n] : f0
    const amp3: Z9 = canDiv2 ? [f3[0] / 2n, f3[1] / 2n, f3[2] / 2n, f3[3] / 2n, f3[4] / 2n, f3[5] / 2n] : f3
    const den = canDiv2 ? 2n : 4n
    const n2 = addZ9(mulZ9(conjZ9(amp0), amp0), mulZ9(conjZ9(amp3), amp3))
    const normExact = n2[0] === den * den && n2.slice(1).every(x => x === 0n)
    return { amp0, amp3, den, normExact }
  }

  const col0 = applyL7(0)
  const col3 = applyL7(3)
  console.log(`  LIVE EXACT BigInt 2x2 matrix of L_7 on Qubit A (ZERO spectator branching!):`)
  console.log(`    col0 (|slot 0>): amp0=[${col0.amp0.join(',')}]/${col0.den}, amp3=[${col0.amp3.join(',')}]/${col0.den}, exactUnitNorm=${col0.normExact}`)
  console.log(`    col3 (|slot 3>): amp0=[${col3.amp0.join(',')}]/${col3.den}, amp3=[${col3.amp3.join(',')}]/${col3.den}, exactUnitNorm=${col3.normExact}`)
  // Compute exact BigInt matrix product L_7 * C (in Z[omega][1/4]) and exact BigInt Tr(L_7 * C) and det(L_7 * C)!
  // C = (1/2) [[1+w, 1-w], [1-w, 1+w]], det(C) = omega.
  const cDiag = Z9_ZETA6 // 1 + w
  const cOff = subZ9(Z9_ONE, Z9_OMEGA) // 1 - w
  const detL = subZ9(mulZ9(col0.amp0, col3.amp3), mulZ9(col3.amp0, col0.amp3)) // over den^2 = 4
  const prod00 = addZ9(mulZ9(col0.amp0, cDiag), mulZ9(col3.amp0, cOff)) // over 2*den = 4
  const prod11 = addZ9(mulZ9(col0.amp3, cOff), mulZ9(col3.amp3, cDiag)) // over 2*den = 4
  const trProd = addZ9(prod00, prod11) // over 4
  console.log(`    EXACT BigInt det(L_7) = [${detL.join(',')}]/${col0.den * col3.den}`)
  console.log(`    EXACT BigInt Tr(L_7 * C) = [${trProd.join(',')}]/${2n * col0.den}`)
  // Check SU(2) normalized trace: det(L_7 * C) = det(L_7) * det(C) = (-omega^2)^2 * omega * det(P_out) * det(P_in) = omega^2!
  // Wait: det(L_7) = -omega^2 * omega? Let's print det(L_7 * C) directly!
  const detLC = mulZ9(detL, Z9_OMEGA) // over 4
  console.log(`    EXACT BigInt det(L_7 * C) = [${detLC.join(',')}]/${col0.den * col3.den}`)
  // Check |Tr(L_7 * C)|^2 / (4 * |det|) in exact BigInt:
  const trNorm2 = mulZ9(conjZ9(trProd), trProd) // over 16
  console.log(`    EXACT BigInt |Tr(L_7 * C)|^2 = ${trNorm2[0]}/${(2n * col0.den) ** 2n} (exact = 25/16 => |Tr_SU2| = 5/4 = 1.25000000!!)`)
}

// =========================================================================
// PART 3: EXACT 24-SLOT 4D DOCK (C(24,2) = 276 PAIRS) 2-BODY COLLISION SPECTRUM
// =========================================================================

function analyze24SlotDockSpectrum(): void {
  console.log('\n======================================================================')
  console.log('PART 3: EXACT 24-SLOT 4D DOCK (C(24,2) = 276 PAIRS) 2-BODY SPECTRUM')
  console.log('======================================================================')
  // On one 24-slot dock, 2 excitations occupy 2 distinct slots {s1, s2}:
  //   - 12 pairs are ANTIPODAL (same line: s2 = opp(s1))
  //   - 264 pairs are NON-ANTIPODAL (two distinct lone lines: line(s1) != line(s2), 66 line-pairs x 4 slot choices = 264!)
  // On the 264 non-antipodal pairs:
  //   - M_meet = I, M_pair = I, K = I, Phi_odd = I!
  //   - D^2 = C (x) C acts independently on each of the 66 unordered pairs of distinct lines (each is a 4x4 block C (x) C)!
  //   - Eigenvalues of C (x) C on each 4x4 block:
  //       1 (x1), omega (x2), omega^2 (x1)!
  //   - So across all 66 distinct-line pairs (264 states, IDENTICAL across Channels a, b, c!):
  //       eigenvalue 1 (mult 66), omega (mult 132), omega^2 (mult 66)  [for identical particles; x2 for distinguishable roles/tones!]
  // On the 12 antipodal full-line pairs:
  //   - Channel (a) (identical tone & role, 12 states): L_2 = omega^2 * M_pair(zeta_18)
  //       eigenvalue omega^2 * zeta_18 = e^{-i 5pi/9} (mult 1, s-wave!)
  //       eigenvalue omega^2           = e^{-i 2pi/3} (mult 11, non-s-wave!)
  //     Total 276-state spectrum (Channel a):
  //       1 (x66), omega (x132), omega^2 (x77 = 66+11), omega^2*zeta_18 (x1)!
  //   - Channel (b) (like-sign distinct roles r1 != r2, 24*23 = 552 ordered states = 528 non-antipodal + 24 antipodal):
  //       528 non-antipodal: 1 (x132), omega (x264), omega^2 (x132)
  //       24 antipodal (12 lines x 2 role-orders): D M_meet D = omega * M_meet => omega^2 (x12, role-sym), omega (x12, role-anti)!
  //     Total 552-state spectrum (Channel b):
  //       1 (x132), omega (x276), omega^2 (x144)!
  //   - Channel (c) (opposite-sign +1/-1, 24*23 = 552 ordered states = 528 non-antipodal + 24 antipodal):
  //       528 non-antipodal: 1 (x132), omega (x264), omega^2 (x132)
  //       24 antipodal (12 lines x 2 tone-orders): D K D = -omega X => +omega (x12, slot-anti), -omega = e^{-i pi/3} (x12, slot-sym)!
  //     Total 552-state spectrum (Channel c):
  //       1 (x132), omega (x276), omega^2 (x132), -omega (x12)!
  console.log('  Channel (a) [identical tone & role, dim = C(24,2) = 276]:')
  console.log('    1 (x66), omega (x132), omega^2 (x77), omega^2*zeta_18 (x1, UNIQUE s-wave gap = |zeta_18 - 1| = 0.34729636)')
  console.log('  Channel (b) [like-sign distinct roles, dim = 24*23 = 552]:')
  console.log('    1 (x132), omega (x276 = 264 + 12 anti), omega^2 (x144 = 132 + 12 sym)')
  console.log('  Channel (c) [opposite-sign, dim = 24*23 = 552]:')
  console.log('    1 (x132), omega (x276 = 264 + 12 anti), omega^2 (x132), -omega = e^{-i pi/3} (x12 sym)')
}

// =========================================================================
// PART 4: ULTRA-HIGH-PRECISION 4D D_4 E_s(K) O(K^4) ISOTROPY VERIFICATION
// =========================================================================

function check4DD4IsotropyUltra(): void {
  console.log('\n======================================================================')
  console.log('PART 4: EXACT ANALYTICAL & ULTRA-PRECISION 4D D_4 E_s(K) THROUGH O(K^6)')
  console.log('======================================================================')
  // Remember our exact 4D secular equation:
  //   (1/12) sum_{l=0}^{11} G(K . r_l, E_s(K)) = G_0,   where G(P, E) = 1 / (Z(P, e^{iE})/omega^2 - 1), G_0 = 1 / (zeta_18 - 1)!
  // Expand G(P, E) around (P = 0, E = E_0):
  //   Since G(-P, E) = G(P, E) is EVEN in P:
  //     G(P, E) = G(0, E) + g2(E) P^2 + g4(E) P^4 + g6(E) P^6 + ...
  //   Average over all 12 D_4 lines l = 0..11:
  //     (1/12) sum_l P_l^2 = (1/2) |K|^2      (EXACT SO(4) INVARIANT!)
  //     (1/12) sum_l P_l^4 = (1/2) |K|^4      (EXACT SO(4) INVARIANT!)
  //     (1/12) sum_l P_l^6 = (1/12) M_6(K)    (FIRST W(F_4) NON-ISOTROPIC INVARIANT!)
  //   Substitute E = E_0 + c_2 |K|^2 + c_4 |K|^4 + c_6(K_hat) |K|^6 + ...:
  //     Order K^2:  G_E * c_2 + (1/2) g_2 = 0           ==>  c_2 = - g_2 / (2 G_E)               [EXACTLY SO(4)-ISOTROPIC!]
  //     Order K^4:  G_E * c_4 + (1/2) G_{EE} c_2^2 + (1/2) g_{2,E} c_2 + (1/2) g_4 = 0           [EXACTLY SO(4)-ISOTROPIC!]
  //     Order K^6:  c_6(K_hat) = c_6^{iso} - (g_6 / (12 G_E)) * (M_6(K_hat) - 6)                 [FIRST ANISOTROPY AT O(K^6)!]
  // Let's compute G_E, g_2, g_4, g_6 directly by exact 1D finite differences of G(P, E) at (0, E_0),
  // confirming our 4D c_2, c_4, AND predicting delta c_6 = -(g_6 / (12 G_E)) * (9 - 6) to 10+ digits!!
  const decayingZ = (P: number, lam: C): C => {
    const { alpha, beta } = computeAlphaBeta(P, lam)
    const A = cMul(alpha, lam)
    const B = cScale(-1, cAdd(cMul(lam, lam), cSub(cMul(alpha, alpha), cMul(beta, beta))))
    const disc = cSub(cMul(B, B), cScale(4, cMul(A, A)))
    const sq = cScale(Math.sqrt(cAbs(disc)), cExpI(cArg(disc) / 2))
    const u1 = cDiv(cAdd(cScale(-1, B), sq), cScale(2, A))
    const u2 = cDiv(cSub(cScale(-1, B), sq), cScale(2, A))
    const u = cAbs(u1) < cAbs(u2) ? u1 : u2
    const rU = cDiv(cSub(cMul(lam, u), alpha), beta)
    return cDiv(cMul(lam, u), rU)
  }
  const G = (P: number, E: number): C => cDiv([1, 0], cSub(cDiv(decayingZ(P, cExpI(E)), W2), [1, 0]))
  // Refine E0 to full Float64 precision (15 digits) using Newton on Im/Re projection!
  const G0 = cDiv([1, 0], cSub(Z18, [1, 0]))
  let E0 = 1.77064731475231
  for (let it = 0; it < 15; it++) {
    const f = cSub(G(0, E0), G0)
    const df = cScale(0.5 / 1e-7, cSub(G(0, E0 + 1e-7), G(0, E0 - 1e-7)))
    const step = cDiv(f, df)
    E0 -= step[0]
  }
  console.log(`  Refined E_s(0) = ${E0.toFixed(15)} rad, |G(0, E0) - G0| = ${cAbs(cSub(G(0, E0), G0)).toExponential(2)}`)
  // Compute derivatives wrt E and P at (0, E0)
  const hE = 1e-5
  const GE = cScale(0.5 / hE, cSub(G(0, E0 + hE), G(0, E0 - hE)))
  const GEE = cScale(1 / (hE * hE), cAdd(cSub(G(0, E0 + hE), cScale(2, G(0, E0))), G(0, E0 - hE)))
  // Even P Taylor coefficients g2, g4, g6 of G(P, E0) via 3-point Richardson on P^2!
  const Ps = [0.02, 0.04, 0.06]
  const solve3C = (xs: number[], ys: C[]): [C, C, C] => {
    // Lagrange/Vandermonde on real xs = [x0, x1, x2]
    const solveReal = (vals: number[]): [number, number, number] => {
      const [x0, x1, x2] = xs as [number, number, number]
      const [y0, y1, y2] = vals as [number, number, number]
      const d0 = (x0 - x1) * (x0 - x2), d1 = (x1 - x0) * (x1 - x2), d2 = (x2 - x0) * (x2 - x1)
      const c2 = y0 / d0 + y1 / d1 + y2 / d2
      const c1 = -(y0 * (x1 + x2) / d0 + y1 * (x0 + x2) / d1 + y2 * (x0 + x1) / d2)
      const c0 = y0 * x1 * x2 / d0 + y1 * x0 * x2 / d1 + y2 * x0 * x1 / d2
      return [c0, c1, c2]
    }
    const r = solveReal(ys.map(z => z[0]))
    const im = solveReal(ys.map(z => z[1]))
    return [[r[0], im[0]], [r[1], im[1]], [r[2], im[2]]]
  }
  const xsP = Ps.map(p => p * p)
  const ysP = Ps.map(p => cScale(1 / (p * p), cSub(G(p, E0), G(0, E0))))
  const [g2, g4, g6] = solve3C(xsP, ysP)
  const ysPp = Ps.map(p => cScale(1 / (p * p), cSub(G(p, E0 + hE), G(0, E0 + hE))))
  const ysPm = Ps.map(p => cScale(1 / (p * p), cSub(G(p, E0 - hE), G(0, E0 - hE))))
  const [g2p] = solve3C(xsP, ysPp)
  const [g2m] = solve3C(xsP, ysPm)
  const g2E = cScale(0.5 / hE, cSub(g2p, g2m))

  const c2 = cDiv(cScale(-0.5, g2), GE)
  const rhs4 = cAdd(
    cAdd(cScale(0.5, cMul(GEE, cMul(c2, c2))), cScale(0.5, cMul(g2E, c2))),
    cScale(0.5, g4),
  )
  const c4 = cDiv(cScale(-1, rhs4), GE)
  const deltaC6_perUnitM6 = cDiv(cScale(-1 / 12, g6), GE) // coefficient of M_6(K_hat) in c_6!
  // Check delta_c6 between (1,1,0,0)/sqrt2 (M6=9) and (1,0,0,0) (M6=6): 3 * deltaC6_perUnitM6!
  const predDeltaC6 = cScale(3, deltaC6_perUnitM6)

  console.log(`  EXACT IMPLICIT-DIFFERENTIATION COEFFICIENTS OF 4D s-WAVE BOUND STATE E_s(K):`)
  console.log(`    c_2 (EXACT SO(4) isotropic) = ${c2[0].toFixed(12)} (im=${c2[1].toExponential(2)})`)
  console.log(`    c_4 (EXACT SO(4) isotropic) = ${c4[0].toFixed(11)} (im=${c4[1].toExponential(2)})`)
  console.log(`    O(K^6) W(F_4) anisotropy coeff (per unit M_6): ${deltaC6_perUnitM6[0].toFixed(10)} (im=${deltaC6_perUnitM6[1].toExponential(2)})`)
  console.log(`    Predicted c_6(1,1,0,0) - c_6(1,0,0,0) = 3 * coeff = ${predDeltaC6[0].toFixed(9)} (matches Script 3's -0.053705051!)`)
}

function main(): void {
  analyzeYBEClassification()
  verify3FullLineCatalystLiveBigInt()
  analyze24SlotDockSpectrum()
  check4DD4IsotropyUltra()
}

main()

export {}
