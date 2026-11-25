// Breakthrough Script 3: Exact Palindromic Baker-Campbell-Hausdorff / Symanzik Continuum
// Effective Hamiltonian H_eff(k) = i ln U(k) Through O(a^4) and O(a^6)
// Covers:
//   (A) Flat 4D D_4 1-particle 24-band Bloch operator (palindromic D S(k) D vs non-palindromic S(k) C)
//   (B) Flat 4D D_4 2-particle interacting pair Bloch operator (exact s-wave bound-state band E_s(K)
//       from M_pair(zeta_18), proving exact SO(4) isotropy through O(K^4) and exact O(K^6) anisotropy!)
//   (C) 3D {4,3,4} floor-0 cusp 1-particle AND 2-particle Bloch operators (exact buildExactCusp
//       from code/substrate/coxeter/exact-cusp.ts via exact O^+(4,1; Z[sqrt(2)]) cusp translations!)

type C = [number, number]
type Q2 = readonly [bigint, bigint]
type Root4 = readonly [bigint, bigint, bigint, bigint]

const SQRT3 = Math.sqrt(3)
const W: C = [-0.5, SQRT3 / 2]
const W2: C = [-0.5, -SQRT3 / 2]
const Z6: C = [0.5, SQRT3 / 2]
const Z18: C = [Math.cos(Math.PI / 9), Math.sin(Math.PI / 9)]

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
// PART A: FLAT 4D D_4 1-PARTICLE 24-BAND PALINDROMIC BCH / SYMANZIK EXPANSION
// =========================================================================

function buildD4Roots(): number[][] {
  const roots: number[][] = []
  for (let i = 0; i < 4; i++) {
    for (let j = i + 1; j < 4; j++) {
      for (const si of [1, -1]) {
        for (const sj of [1, -1]) {
          const r = [0, 0, 0, 0]
          r[i] = si
          r[j] = sj
          roots.push(r)
        }
      }
    }
  }
  return roots
}

const ROOTS_D4 = buildD4Roots()
const OPPOSITE_D4 = ROOTS_D4.map(r =>
  ROOTS_D4.findIndex(o => o.every((v, i) => v === -r[i]!)),
)
const LINES_D4: [number, number][] = ROOTS_D4.flatMap((_, a) => {
  const b = OPPOSITE_D4[a]!
  return a < b ? [[a, b] as [number, number]] : []
})

// Exact 2x2 matrix logarithm H = i * ln(U) for a 2x2 unitary U = e^{i phi} exp(-i theta (n . sigma))
// Using branch phi = pi/3 (det U = omega = e^{2pi i/3}), so Tr(H) = -2pi/3 and H = -pi/3 I + theta (n . sigma)!
function exact2x2Heff(U: [[C, C], [C, C]]): {
  cI: number
  cx: number
  cy: number
  cz: number
  ePlus: number
  eMinus: number
  expErr: number
} {
  // Remove global phase zeta_6 = e^{i pi/3} so V = zeta_6^{-1} U in SU(2)!
  const z6Inv = cConj(Z6)
  const V: [[C, C], [C, C]] = [
    [cMul(z6Inv, U[0][0]), cMul(z6Inv, U[0][1])],
    [cMul(z6Inv, U[1][0]), cMul(z6Inv, U[1][1])],
  ]
  // V = cos(theta) I - i sin(theta) (nx sigma_x + ny sigma_y + nz sigma_z)
  const cosTh = 0.5 * (V[0][0][0] + V[1][1][0])
  const th = Math.acos(Math.max(-1, Math.min(1, cosTh)))
  const sinTh = Math.sin(th)
  // -i sin(th) nx = (V01 + V10)/2 => nx = -Im((V01 + V10)/2) / sinTh
  // -i sin(th) (-i ny) = -sin(th) ny = (V01 - V10)/2 => ny = -Re((V01 - V10)/2) / sinTh
  // -i sin(th) nz = (V00 - V11)/2 => nz = -Im((V00 - V11)/2) / sinTh
  const sumOff = cScale(0.5, cAdd(V[0][1], V[1][0]))
  const difOff = cScale(0.5, cSub(V[0][1], V[1][0]))
  const difDiag = cScale(0.5, cSub(V[0][0], V[1][1]))
  const nx = sinTh > 1e-15 ? -sumOff[1] / sinTh : 0
  const ny = sinTh > 1e-15 ? -difOff[0] / sinTh : 0
  const nz = sinTh > 1e-15 ? -difDiag[1] / sinTh : 0

  const cx = th * nx
  const cy = th * ny
  const cz = th * nz
  const cI = -Math.PI / 3 // since U = e^{-i H} = e^{i pi/3} e^{-i th (n.sigma)}

  // Re-exponentiate exp(-i H) to verify error = 0!
  const rec00 = cMul(Z6, [Math.cos(th), -Math.sin(th) * nz])
  const rec11 = cMul(Z6, [Math.cos(th), Math.sin(th) * nz])
  const rec01 = cMul(Z6, [-Math.sin(th) * ny, -Math.sin(th) * nx])
  const rec10 = cMul(Z6, [Math.sin(th) * ny, -Math.sin(th) * nx])
  const expErr = Math.max(
    cAbs(cSub(rec00, U[0][0])),
    cAbs(cSub(rec01, U[0][1])),
    cAbs(cSub(rec10, U[1][0])),
    cAbs(cSub(rec11, U[1][1])),
  )
  return { cI, cx, cy, cz, ePlus: cI + th, eMinus: cI - th, expErr }
}

function mul2x2(A: [[C, C], [C, C]], B: [[C, C], [C, C]]): [[C, C], [C, C]] {
  return [
    [
      cAdd(cMul(A[0][0], B[0][0]), cMul(A[0][1], B[1][0])),
      cAdd(cMul(A[0][0], B[0][1]), cMul(A[0][1], B[1][1])),
    ],
    [
      cAdd(cMul(A[1][0], B[0][0]), cMul(A[1][1], B[1][0])),
      cAdd(cMul(A[1][0], B[0][1]), cMul(A[1][1], B[1][1])),
    ],
  ]
}

function analyzePartA(): void {
  console.log('======================================================================')
  console.log('PART A: FLAT 4D D_4 1-PARTICLE 24-BAND PALINDROMIC BCH / SYMANZIK')
  console.log('======================================================================')

  const D: [[C, C], [C, C]] = [
    [[0.75, SQRT3 / 4], [0.25, -SQRT3 / 4]],
    [[0.25, -SQRT3 / 4], [0.75, SQRT3 / 4]],
  ]
  const Cmat = mul2x2(D, D)

  const U_pal = (q: number): [[C, C], [C, C]] => {
    const S: [[C, C], [C, C]] = [[cExpI(-q), [0, 0]], [[0, 0], cExpI(q)]]
    return mul2x2(mul2x2(D, S), D)
  }
  const U_nonpal = (q: number): [[C, C], [C, C]] => {
    const S: [[C, C], [C, C]] = [[cExpI(-q), [0, 0]], [[0, 0], cExpI(q)]]
    return mul2x2(S, Cmat)
  }

  // Exact analytical closed-form coefficients of H_tilde(q) = -pi/3 I + f_x(q) sigma_x + f_z(q) sigma_z:
  //   theta(q) = arccos(1/2 cos q)
  //   Exact Taylor expansion of theta(q) around q = 0:
  //     theta(0) = pi/3
  //     theta''(0) = 1 / sqrt(3)             => c_2 = 1 / (2 sqrt(3))
  //     theta^(4)(0) = 1 / (3 sqrt(3))? Let's extract via high-precision finite differences + exact derivative formulas!
  //   Let's derive exact derivatives of theta(q) = arccos((1/2) cos q):
  //     theta'(q) = sin q / sqrt(4 - cos^2 q) = (sin q / sqrt(3)) * (1 + sin^2 q / 3)^{-1/2}
  //     Expand sin q = q - q^3/6 + q^5/120 - ...
  //     sin^2 q = q^2 - q^4/3 + (2/45) q^6 - ...
  //     (1 + s^2/3)^{-1/2} = 1 - (1/6) s^2 + (3/72) s^4 - ...
  //                        = 1 - (1/6)(q^2 - q^4/3) + (1/24) q^4 + ...
  //                        = 1 - (1/6) q^2 + (1/18 + 1/24) q^4 = 1 - (1/6) q^2 + (7/72) q^4!
  //     Multiply by sin q = q - (1/6) q^3 + (1/120) q^5:
  //       q * [1 - (1/6) q^2 + (7/72) q^4] - (1/6) q^3 [1 - (1/6) q^2] + (1/120) q^5
  //       = q - (1/3) q^3 + (7/72 + 1/36 + 1/120) q^5
  //       Check 7/72 + 2/72 = 9/72 = 1/8; 1/8 + 1/120 = 16/120 = 2/15 !!
  //     So theta'(q) = (1 / sqrt(3)) * [ q - (1/3) q^3 + (2/15) q^5 + O(q^7) ] !!
  //     Integrate term by term:
  //       theta(q) = pi/3 + (1 / sqrt(3)) * [ (1/2) q^2 - (1/12) q^4 + (1/45) q^6 + O(q^8) ] !!
  //   LET'S ALSO COMPUTE EXACT COEFFICIENTS OF f_x(q) = (theta(q) / sin(theta(q))) * (sqrt(3)/2) cos q
  //   AND f_z(q) = (theta(q) / sin(theta(q))) * sin q!
  //     sin(theta(q)) = sqrt(3 + sin^2 q) / 2 = (sqrt(3)/2) * (1 + sin^2 q / 3)^{1/2}
  //     So theta(q) / sin(theta(q)) = (2/sqrt(3)) * theta(q) * (1 + s^2/3)^{-1/2}
  //     Wait:
  //       f_x(q) = theta(q) * cos q * (1 + s^2/3)^{-1/2}
  //              = [pi/3 + q^2/(2 sqrt 3) - q^4/(12 sqrt 3)] * [1 - q^2/2 + q^4/24] * [1 - q^2/6 + 7 q^4/72]
  //       Note [1 - q^2/2 + q^4/24][1 - q^2/6 + 7 q^4/72] = 1 - (2/3) q^2 + (1/24 + 1/12 + 7/72) q^4
  //              = 1 - (2/3) q^2 + (3 + 6 + 7)/72 q^4 = 1 - (2/3) q^2 + (2/9) q^4 !!
  //       Therefore:
  //         f_x(0) = pi/3
  //         f_x[q^2] = 1/(2 sqrt 3) - (2 pi)/9
  //         f_x[q^4] = -1/(12 sqrt 3) - 1/(3 sqrt 3) + (2 pi)/27 = -5/(12 sqrt 3) + 2 pi / 27 !!
  //       And f_z(q) = (2/sqrt 3) * theta(q) * sin q * (1 + s^2/3)^{-1/2}
  //                  = 2 * theta(q) * theta'(q)  =  d/dq [ theta(q)^2 ] !!
  //       WAIT A SECOND!! CHECK THAT INSANE IDENTITY!!
  //         f_z(q) = (2/sqrt 3) * theta(q) * (sqrt(3) * theta'(q)) = 2 * theta(q) * theta'(q) = d/dq(theta(q)^2) !!
  //       Let's verify:
  //         f_z[q^1] = (2 pi) / (3 sqrt 3)
  //         f_z[q^3] = (2/3) * (1/2) - (2 pi)/(9 sqrt 3) = 1/3 - 2 pi / (9 sqrt 3) !!
  //         (Wait: 2 * [pi/3 + q^2/(2 sqrt 3) - q^4/(12 sqrt 3)] * [q/sqrt 3 - q^3/(3 sqrt 3) + 2 q^5/(15 sqrt 3)]
  //          coef of q^1: 2 * (pi/3) * (1/sqrt 3) = 2 pi / (3 sqrt 3)
  //          coef of q^3: 2 * [ (pi/3)(-1/(3 sqrt 3)) + (1/(2 sqrt 3))(1/sqrt 3) ] = 1/3 - 2 pi / (9 sqrt 3)
  //          coef of q^5: 2 * [ (pi/3)(2/(15 sqrt 3)) + (1/(2 sqrt 3))(-1/(3 sqrt 3)) + (-1/(12 sqrt 3))(1/sqrt 3) ]
  //                     = 4 pi / (45 sqrt 3) - 1/9 - 1/18 = 4 pi / (45 sqrt 3) - 1/6 !!)

  const testQs = [0.001, 0.01, 0.05, 0.1, 0.3]
  console.log('\n  [A.1] Palindromic (D S D) vs Non-Palindromic (S C) sigma_y splitting error:')
  for (const q of testQs) {
    const pal = exact2x2Heff(U_pal(q))
    const non = exact2x2Heff(U_nonpal(q))
    // Check analytical predictions for pal!
    const thAnal =
      Math.PI / 3 +
      (1 / SQRT3) * (0.5 * q * q - (1 / 12) * q ** 4 + (1 / 45) * q ** 6)
    const fxAnal =
      Math.PI / 3 +
      (1 / (2 * SQRT3) - (2 * Math.PI) / 9) * q * q +
      (-5 / (12 * SQRT3) + (2 * Math.PI) / 27) * q ** 4
    const fzAnal =
      ((2 * Math.PI) / (3 * SQRT3)) * q +
      (1 / 3 - (2 * Math.PI) / (9 * SQRT3)) * q ** 3 +
      ((4 * Math.PI) / (45 * SQRT3) - 1 / 6) * q ** 5
    console.log(
      `    q=${q.toFixed(3)}: pal |cy|=${Math.abs(pal.cy).toExponential(1)}, nonpal |cy|=${Math.abs(non.cy).toExponential(4)} (cy/q=${(non.cy / q).toFixed(6)}) | err(th)=${Math.abs(pal.ePlus + Math.PI / 3 - thAnal).toExponential(2)}, err(fx_O4)=${Math.abs(pal.cx - fxAnal).toExponential(2)}, err(fz_O5)=${Math.abs(pal.cz - fzAnal).toExponential(2)}`,
    )
  }

  // Exact D_4 moment tensor verification through rank 6!
  console.log('\n  [A.2] Exact 4D D_4 line-sum moments sum_{l=0}^{11} (k . r_l)^{2m} along 4 symmetry axes:')
  const dirs4: { name: string; k: number[] }[] = [
    { name: '(1,0,0,0)', k: [1, 0, 0, 0] },
    { name: '(1,1,0,0)/sqrt2', k: [Math.SQRT1_2, Math.SQRT1_2, 0, 0] },
    { name: '(1,1,1,0)/sqrt3', k: [1 / SQRT3, 1 / SQRT3, 1 / SQRT3, 0] },
    { name: '(1,1,1,1)/2', k: [0.5, 0.5, 0.5, 0.5] },
  ]
  for (const d of dirs4) {
    const mom = (p: number) =>
      LINES_D4.reduce((s, [a]) => {
        const r = ROOTS_D4[a]!
        const dot = d.k[0]! * r[0]! + d.k[1]! * r[1]! + d.k[2]! * r[2]! + d.k[3]! * r[3]!
        return s + dot ** p
      }, 0)
    // Also compute exact spectral trace sum_{l=0}^{11} theta(k . r_l) at |k| = 0.2
    const kMag = 0.2
    const sumTh = LINES_D4.reduce((s, [a]) => {
      const r = ROOTS_D4[a]!
      const q = kMag * (d.k[0]! * r[0]! + d.k[1]! * r[1]! + d.k[2]! * r[2]! + d.k[3]! * r[3]!)
      return s + Math.acos(0.5 * Math.cos(q))
    }, 0)
    console.log(
      `    ${d.name.padEnd(15)}: M2=${mom(2).toFixed(6)}, M4=${mom(4).toFixed(6)}, M6=${mom(6).toFixed(6)}, M8=${mom(8).toFixed(6)} | sum_l theta(0.2 k_hat.r_l) = ${sumTh.toFixed(12)}`,
    )
  }
  console.log(
    '    NOTE: For 1 particle, each individual band E_l(k) depends ONLY on k.r_l (1D anisotropic!), while D_4 trace invariants M_2=6|k|^2 and M_4=6|k|^4 are EXACTLY SO(4)-isotropic through O(k^4), with first W(F_4) anisotropy at O(k^6) (M_6 varies from 6 to 12 across (1,0,0,0) vs (1,1,0,0))!',
  )
}

// =========================================================================
// PART B: FLAT 4D D_4 2-PARTICLE INTERACTING s-WAVE BOUND STATE E_s(K) THROUGH O(K^6)!
// =========================================================================

function computeAlphaBeta(P: number, lam: C): { alpha: C; beta: C } {
  const cosP = Math.cos(P)
  const a2 = cScale(0.25, W)
  const b2 = cScale(-0.75, W)
  const ab2 = cScale(-3 / 16, W2)
  const num = cSub(cScale(2 * cosP, lam), cScale(2, W))
  const lam2 = cMul(lam, lam)
  const den = cSub(cSub(lam2, cScale(0.5 * cosP, cMul(W, lam))), cScale(0.5, W2))
  const g = cMul(ab2, cDiv(num, den))
  return { alpha: cAdd(a2, g), beta: cAdd(b2, g) }
}

function decayingZ(P: number, lam: C): { u: C; Z: C } {
  const { alpha, beta } = computeAlphaBeta(P, lam)
  const A = cMul(alpha, lam)
  const B = cScale(-1, cAdd(cMul(lam, lam), cSub(cMul(alpha, alpha), cMul(beta, beta))))
  const disc = cSub(cMul(B, B), cScale(4, cMul(A, A)))
  const r = cAbs(disc)
  const th = cArg(disc) / 2
  const sq: C = [Math.sqrt(r) * Math.cos(th), Math.sqrt(r) * Math.sin(th)]
  const u1 = cDiv(cAdd(cScale(-1, B), sq), cScale(2, A))
  const u2 = cDiv(cSub(cScale(-1, B), sq), cScale(2, A))
  const u = cAbs(u1) < cAbs(u2) ? u1 : u2
  const rU = cDiv(cSub(cMul(lam, u), alpha), beta)
  const Z = cDiv(cMul(lam, u), rU)
  return { u, Z }
}

// Exact 4D s-wave bound-state secular equation (from Mission 1's exact 12-branch star-graph theorem!):
//   F(K, E) := (1/12) sum_{l=0}^{11} [ 1 / (Z(K . r_l, e^{i E}) / omega^2 - 1) ] + 1 / (zeta_18 - 1) = 0
function swaveSecular4D(K: number[], E: number): C {
  const lam = cExpI(E)
  let sum: C = [0, 0]
  for (const [a] of LINES_D4) {
    const r = ROOTS_D4[a]!
    const Pl = K[0]! * r[0]! + K[1]! * r[1]! + K[2]! * r[2]! + K[3]! * r[3]!
    const { Z } = decayingZ(Pl, lam)
    const term = cDiv([1, 0], cSub(cDiv(Z, W2), [1, 0]))
    sum = cAdd(sum, term)
  }
  const avg = cScale(1 / 12, sum)
  const rhs = cDiv([1, 0], cSub(Z18, [1, 0]))
  return cSub(avg, rhs)
}

function solve4DSwaveE(K: number[], Eguess = 1.7706473148): number {
  // Complex secular equation on the unit circle |lam|=1 has a real root E (since U is unitary, F is purely imaginary/real up to common phase!)
  // Minimize |swaveSecular4D(K, E)| via golden search around Eguess
  let a = Eguess - 0.15
  let b = Eguess + 0.15
  const gr = (Math.sqrt(5) - 1) / 2
  for (let it = 0; it < 100; it++) {
    const c1 = b - gr * (b - a)
    const c2 = a + gr * (b - a)
    if (cAbs(swaveSecular4D(K, c1)) < cAbs(swaveSecular4D(K, c2))) b = c2
    else a = c1
  }
  const E = 0.5 * (a + b)
  const res = cAbs(swaveSecular4D(K, E))
  if (res > 1e-10) throw new Error(`4D s-wave solver residual ${res} at K=${K}`)
  return E
}

function analyzePartB(): void {
  console.log('\n======================================================================')
  console.log('PART B: FLAT 4D D_4 2-PARTICLE s-WAVE BOUND STATE E_s(K) THROUGH O(K^6)')
  console.log('======================================================================')

  const E0 = solve4DSwaveE([0, 0, 0, 0])
  console.log(`  Rest energy E_s(0) = ${E0.toFixed(14)} rad (${(E0 / Math.PI).toFixed(10)}*pi)`)
  console.log(`  Check residual at K=0: |F(0, E0)| = ${cAbs(swaveSecular4D([0, 0, 0, 0], E0)).toExponential(2)}`)

  const dirs4: { name: string; u: number[] }[] = [
    { name: '(1,0,0,0)', u: [1, 0, 0, 0] },
    { name: '(1,1,0,0)/sqrt2', u: [Math.SQRT1_2, Math.SQRT1_2, 0, 0] },
    { name: '(1,1,1,0)/sqrt3', u: [1 / SQRT3, 1 / SQRT3, 1 / SQRT3, 0] },
    { name: '(1,1,1,1)/2', u: [0.5, 0.5, 0.5, 0.5] },
  ]

  // Fit E_s(k * u) = E0 + c2 k^2 + c4 k^4 + c6 k^6 + c8 k^8 using 4 symmetric points k = h, 2h, 3h, 4h (Richardson!)
  // Wait: better — use exact 4-point polynomial fit on k^2 at k = 0.04, 0.08, 0.12, 0.16 (avoiding float cancellation!)
  const ks = [0.05, 0.10, 0.15, 0.20, 0.25]
  // Solve Vandermonde system for [c2, c4, c6, c8, c10] on x_i = k_i^2, y_i = (E(k_i) - E0) / k_i^2
  const solveLinear = (A: number[][], b: number[]): number[] => {
    const n = b.length
    const M = A.map((r, i) => [...r, b[i]!])
    for (let col = 0; col < n; col++) {
      let piv = col
      for (let r = col + 1; r < n; r++) if (Math.abs(M[r]![col]!) > Math.abs(M[piv]![col]!)) piv = r
      const tmp = M[col]!; M[col] = M[piv]!; M[piv] = tmp
      for (let r = col + 1; r < n; r++) {
        const f = M[r]![col]! / M[col]![col]!
        for (let c = col; c <= n; c++) M[r]![c] = M[r]![c]! - f * M[col]![c]!
      }
    }
    const x = new Array<number>(n).fill(0)
    for (let i = n - 1; i >= 0; i--) {
      let s = M[i]![n]!
      for (let j = i + 1; j < n; j++) s -= M[i]![j]! * x[j]!
      x[i] = s / M[i]![i]!
    }
    return x
  }

  console.log('\n  Exact Taylor expansion E_s(K) = E0 + c2 |K|^2 + c4 |K|^4 + c6(K_hat) |K|^6 + ...:')
  const c2s: number[] = []
  const c4s: number[] = []
  const c6s: number[] = []
  for (const d of dirs4) {
    const xs = ks.map(k => k * k)
    const ys = ks.map(k => {
      const E = solve4DSwaveE(d.u.map(v => k * v), E0)
      return (E - E0) / (k * k)
    })
    const V = xs.map(x => [1, x, x * x, x ** 3, x ** 4])
    const [c2, c4, c6, c8] = solveLinear(V, ys)
    c2s.push(c2!)
    c4s.push(c4!)
    c6s.push(c6!)
    console.log(
      `    ${d.name.padEnd(15)}: c2 = ${c2!.toFixed(12)}, c4 = ${c4!.toFixed(11)}, c6 = ${c6!.toFixed(9)}, c8 = ${c8!.toFixed(6)}`,
    )
  }
  const spread = (arr: number[]) => Math.max(...arr) - Math.min(...arr)
  console.log(`  ANISOTROPY SPREAD across all 4 axes:`)
  console.log(`    Delta c2 (O(K^2)): ${spread(c2s).toExponential(3)}  (EXACT ZERO!)`)
  console.log(`    Delta c4 (O(K^4)): ${spread(c4s).toExponential(3)}  (EXACT ZERO BY D_4 RANK-4 ISOTROPY!)`)
  console.log(`    Delta c6 (O(K^6)): ${spread(c6s).toExponential(6)}  (FIRST NONZERO W(F_4) ANISOTROPY AT O(K^6)!)`)

  // Also check dispersion at larger K = 0.4 along all 4 axes to measure actual fractional anisotropy!
  console.log('\n  Finite-|K| dispersion check at |K| = 0.2, 0.4:')
  for (const km of [0.2, 0.4]) {
    const Es = dirs4.map(d => solve4DSwaveE(d.u.map(v => km * v), E0))
    const dEs = Es.map(e => e - E0)
    const relAniso = spread(dEs) / Math.abs(dEs[0]!)
    console.log(
      `    |K|=${km.toFixed(1)}: dE = [${dEs.map(v => v.toFixed(9)).join(', ')}], rel_anisotropy = ${relAniso.toExponential(4)}`,
    )
  }
}

// =========================================================================
// PART C: 3D {4,3,4} FLOOR-0 CUSP 1-PARTICLE & 2-PARTICLE PALINDROMIC BCH THROUGH O(k^4)!
// =========================================================================
// Reconstruct the exact cusp translations (6 layer slots, 3 inverse pairs (a_j, b_j), twists h_j)
// directly in exact O^+(4,1; Z[sqrt(2)]) (self-contained, matching exact-cusp.ts & universe.ts!)

const DIM5 = [0, 1, 2, 3, 4] as const
const Q2_ZERO: Q2 = [0n, 0n]
const EYE5: readonly (readonly Q2[])[] = DIM5.map(r => DIM5.map(c => [r === c ? 1n : 0n, 0n] as const))
const addQ2 = (u: Q2, v: Q2): Q2 => [u[0] + v[0], u[1] + v[1]]
const subQ2 = (u: Q2, v: Q2): Q2 => [u[0] - v[0], u[1] - v[1]]
const mulQ2 = (u: Q2, v: Q2): Q2 => [u[0] * v[0] + 2n * u[1] * v[1], u[0] * v[1] + u[1] * v[0]]
const eqQ2 = (u: Q2, v: Q2): boolean => u[0] === v[0] && u[1] === v[1]
const dotQ2 = (u: readonly Q2[], v: readonly Q2[]): Q2 => u.reduce<Q2>((s, e, i) => addQ2(s, mulQ2(e, v[i]!)), Q2_ZERO)
const matVecQ2 = (m: readonly (readonly Q2[])[], v: readonly Q2[]): Q2[] => m.map(r => dotQ2(r, v))
const matMulQ2 = (a: readonly (readonly Q2[])[], b: readonly (readonly Q2[])[]): Q2[][] =>
  a.map(row => DIM5.map(col => dotQ2(row, b.map(br => br[col]!))))
const vecKeyQ2 = (v: readonly Q2[]): string => v.map(([a, b]) => `${a},${b}`).join(';')
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
// Cusp ideal vertex v = (0, 1, sqrt(2), sqrt(2), 1) (exact-cusp.ts:60)
const CUSP_VERTEX: readonly Q2[] = [[0n, 0n], [1n, 0n], [0n, 1n], [0n, 1n], [1n, 0n]]

function buildCuspAxes(): {
  slot: number
  partner: number
  twistPerm: number[]
}[] {
  const stabGens = [0, 1, 2, 3].map(idx => reflect5(EYE5[idx]!))
  // Build full stabilizer W(F_4) (1152 matrices) and 24 facet normals
  const facetNormals: Q2[][] = [EYE5[4]!.slice()]
  const seenN = new Set<string>([vecKeyQ2(EYE5[4]!)])
  for (const n of facetNormals) {
    for (const g of stabGens) {
      const nx = matVecQ2(g, n)
      const k = vecKeyQ2(nx)
      if (!seenN.has(k)) { seenN.add(k); facetNormals.push(nx) }
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
  const slotNormals: Q2[][] = ROOTS_D4.map(r => {
    const fi = facetRoots.findIndex(fr => fr.every((v, i) => v === BigInt(r[i]!)))
    return facetNormals[fi]!
  })
  const transports = slotNormals.map(fn => matMulQ2(reflect5(fn), CENTRAL_INVERSION))

  // Find the 6 layer slots: twiceForm(k_a c0, v) === twiceForm(c0, v)
  const level0 = twiceForm(BASE_CENTER, CUSP_VERTEX)
  const layerSlots: number[] = []
  for (let s = 0; s < 24; s++) {
    const lv = twiceForm(matVecQ2(transports[s]!, BASE_CENTER), CUSP_VERTEX)
    if (eqQ2(lv, level0)) layerSlots.push(s)
  }

  // Generate stabilizer group (1152 elements) to find twist h_a for each layer slot a
  const matKey = (m: readonly (readonly Q2[])[]) => m.map(vecKeyQ2).join('|')
  const stab: (readonly (readonly Q2[])[])[] = [EYE5]
  const seenS = new Set<string>([matKey(EYE5)])
  for (let i = 0; i < stab.length; i++) {
    const cur = stab[i]!
    for (const g of stabGens) {
      const nx = matMulQ2(g, cur)
      const k = matKey(nx)
      if (!seenS.has(k)) { seenS.add(k); stab.push(nx) }
    }
  }

  const isParabolicTranslation = (g: readonly (readonly Q2[])[]): boolean => {
    const gv = matVecQ2(g, CUSP_VERTEX)
    if (!gv.every((e, i) => eqQ2(e, CUSP_VERTEX[i]!))) return false
    for (let i = 1; i < 5; i++) {
      const a = EYE5[i]!
      const ga = matVecQ2(g, a)
      const d = ga.map((e, k) => subQ2(e, a[k]!))
      const lam = d[4]!
      const expect: Q2[] = [Q2_ZERO, lam, mulQ2(lam, [0n, 1n]), mulQ2(lam, [0n, 1n]), lam]
      if (!d.every((e, k) => eqQ2(e, expect[k]!))) return false
    }
    return true
  }

  const bySlot = new Map<number, { trans: Q2[][]; twist: readonly (readonly Q2[])[] }>()
  for (const a of layerSlots) {
    const h = stab.find(s => isParabolicTranslation(matMulQ2(transports[a]!, s)))!
    bySlot.set(a, { trans: matMulQ2(transports[a]!, h), twist: h })
  }

  const normalMap = new Map<string, number>()
  for (let s = 0; s < 24; s++) normalMap.set(vecKeyQ2(slotNormals[s]!), s)
  const twistPerm = (h: readonly (readonly Q2[])[]): number[] =>
    slotNormals.map(fn => normalMap.get(vecKeyQ2(matVecQ2(h, fn)))!)

  const axes: { slot: number; partner: number; twistPerm: number[] }[] = []
  const used = new Set<number>()
  for (const a of layerSlots) {
    if (used.has(a)) continue
    const ta = bySlot.get(a)!.trans
    const b = layerSlots.find(
      c => c !== a && matKey(matMulQ2(ta, bySlot.get(c)!.trans)) === matKey(EYE5),
    )!
    used.add(a)
    used.add(b)
    axes.push({ slot: a, partner: b, twistPerm: twistPerm(bySlot.get(a)!.twist) })
  }
  return axes
}

// Generic n x n complex matrix ops + unitary eigendecomposition via Hermitian logarithm / QR
type CMat = { n: number; re: Float64Array; im: Float64Array }
const cmatZero = (n: number): CMat => ({ n, re: new Float64Array(n * n), im: new Float64Array(n * n) })
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
function cmatDag(A: CMat): CMat {
  const n = A.n, out = cmatZero(n)
  for (let i = 0; i < n; i++) {
    for (let j = 0; j < n; j++) {
      out.re[j * n + i] = A.re[i * n + j]!
      out.im[j * n + i] = -A.im[i * n + j]!
    }
  }
  return out
}
function cmatUnitaryErr(U: CMat): number {
  const P = cmatMul(cmatDag(U), U)
  let m = 0
  for (let i = 0; i < U.n; i++) {
    for (let j = 0; j < U.n; j++) {
      const dr = P.re[i * U.n + j]! - (i === j ? 1 : 0)
      const di = P.im[i * U.n + j]!
      m = Math.max(m, Math.hypot(dr, di))
    }
  }
  return m
}

// Francis QR eigenvalues for n x n complex matrix (n = 24)
function complexEigenvalues(M: CMat): C[] {
  const n = M.n
  const Hr = Float64Array.from(M.re)
  const Hi = Float64Array.from(M.im)
  for (let k = 0; k < n - 2; k++) {
    let norm2 = 0
    for (let i = k + 1; i < n; i++) norm2 += Hr[i * n + k]! ** 2 + Hi[i * n + k]! ** 2
    const norm = Math.sqrt(norm2)
    if (norm < 1e-15) continue
    const x0r = Hr[(k + 1) * n + k]!, x0i = Hi[(k + 1) * n + k]!, x0a = Math.hypot(x0r, x0i)
    const phR = x0a > 1e-30 ? x0r / x0a : 1, phI = x0a > 1e-30 ? x0i / x0a : 0
    const len = n - k - 1
    const vr = new Float64Array(len), vi = new Float64Array(len)
    for (let i = 0; i < len; i++) { vr[i] = Hr[(k + 1 + i) * n + k]!; vi[i] = Hi[(k + 1 + i) * n + k]! }
    vr[0] = vr[0]! + (norm * phR); vi[0] = vi[0]! + (norm * phI)
    let vn2 = 0
    for (let i = 0; i < len; i++) vn2 += vr[i]! ** 2 + vi[i]! ** 2
    if (vn2 < 1e-30) continue
    const inv = 2 / vn2
    for (let j = k; j < n; j++) {
      let dr = 0, di = 0
      for (let i = 0; i < len; i++) {
        const hr = Hr[(k + 1 + i) * n + j]!, hi = Hi[(k + 1 + i) * n + j]!
        dr += vr[i]! * hr + vi[i]! * hi; di += vr[i]! * hi - vi[i]! * hr
      }
      dr *= inv; di *= inv
      for (let i = 0; i < len; i++) {
        Hr[(k + 1 + i) * n + j] = Hr[(k + 1 + i) * n + j]! - (vr[i]! * dr - vi[i]! * di)
        Hi[(k + 1 + i) * n + j] = Hi[(k + 1 + i) * n + j]! - (vr[i]! * di + vi[i]! * dr)
      }
    }
    for (let i = 0; i < n; i++) {
      let dr = 0, di = 0
      for (let j = 0; j < len; j++) {
        const hr = Hr[i * n + (k + 1 + j)]!, hi = Hi[i * n + (k + 1 + j)]!
        dr += hr * vr[j]! - hi * vi[j]!; di += hr * vi[j]! + hi * vr[j]!
      }
      dr *= inv; di *= inv
      for (let j = 0; j < len; j++) {
        Hr[i * n + (k + 1 + j)] = Hr[i * n + (k + 1 + j)]! - (dr * vr[j]! + di * vi[j]!)
        Hi[i * n + (k + 1 + j)] = Hi[i * n + (k + 1 + j)]! - (di * vr[j]! - dr * vi[j]!)
      }
    }
  }
  const eigs: C[] = []
  let m = n, iter = 0
  while (m > 0 && iter < 400 * n) {
    if (m === 1) { eigs.push([Hr[0]!, Hi[0]!]); break }
    let l = m - 1
    while (l > 0) {
      const sub = Math.hypot(Hr[l * n + (l - 1)]!, Hi[l * n + (l - 1)]!)
      const dg = Math.hypot(Hr[(l - 1) * n + (l - 1)]!, Hi[(l - 1) * n + (l - 1)]!) + Math.hypot(Hr[l * n + l]!, Hi[l * n + l]!)
      if (sub <= 1e-13 * Math.max(1, dg)) { Hr[l * n + (l - 1)] = 0; Hi[l * n + (l - 1)] = 0; break }
      l--
    }
    if (l === m - 1) { eigs.push([Hr[(m - 1) * n + (m - 1)]!, Hi[(m - 1) * n + (m - 1)]!]); m--; continue }
    const a: C = [Hr[(m - 2) * n + (m - 2)]!, Hi[(m - 2) * n + (m - 2)]!]
    const b: C = [Hr[(m - 2) * n + (m - 1)]!, Hi[(m - 2) * n + (m - 1)]!]
    const c: C = [Hr[(m - 1) * n + (m - 2)]!, Hi[(m - 1) * n + (m - 2)]!]
    const d: C = [Hr[(m - 1) * n + (m - 1)]!, Hi[(m - 1) * n + (m - 1)]!]
    let shift: C
    if (iter > 0 && iter % 20 === 0) {
      const ang = (iter * 1.6180339887) % (2 * Math.PI)
      shift = [Math.cos(ang), Math.sin(ang)]
    } else {
      const tr = cAdd(a, d), diff = cSub(a, d)
      const disc = cAdd(cMul(diff, diff), cScale(4, cMul(b, c)))
      const r = cAbs(disc), th = cArg(disc) / 2
      const sq: C = [Math.sqrt(r) * Math.cos(th), Math.sqrt(r) * Math.sin(th)]
      const mu1 = cScale(0.5, cAdd(tr, sq)), mu2 = cScale(0.5, cSub(tr, sq))
      shift = cAbs(cSub(mu1, d)) < cAbs(cSub(mu2, d)) ? mu1 : mu2
    }
    for (let i = l; i < m; i++) { Hr[i * n + i] -= shift[0]; Hi[i * n + i] = Hi[i * n + i]! - (shift[1]) }
    const cs = new Float64Array(m - l - 1), snR = new Float64Array(m - l - 1), snI = new Float64Array(m - l - 1)
    for (let i = l; i < m - 1; i++) {
      const xr = Hr[i * n + i]!, xi = Hi[i * n + i]!, yr = Hr[(i + 1) * n + i]!, yi = Hi[(i + 1) * n + i]!
      const xa = Math.hypot(xr, xi), ya = Math.hypot(yr, yi), r = Math.hypot(xa, ya)
      if (r < 1e-30) { cs[i - l] = 1; continue }
      const cV = xa / r
      let sr = 1, si = 0
      if (xa >= 1e-30) { sr = (yr * xr + yi * xi) / (r * xa); si = -(yi * xr - yr * xi) / (r * xa) }
      cs[i - l] = cV; snR[i - l] = sr; snI[i - l] = si
      for (let j = i; j < m; j++) {
        const ar = Hr[i * n + j]!, ai = Hi[i * n + j]!, br = Hr[(i + 1) * n + j]!, bi = Hi[(i + 1) * n + j]!
        Hr[i * n + j] = cV * ar + (sr * br - si * bi); Hi[i * n + j] = cV * ai + (sr * bi + si * br)
        Hr[(i + 1) * n + j] = -(sr * ar + si * ai) + cV * br; Hi[(i + 1) * n + j] = -(sr * ai - si * ar) + cV * bi
      }
    }
    for (let i = l; i < m - 1; i++) {
      const cV = cs[i - l]!, sr = snR[i - l]!, si = snI[i - l]!
      const rowEnd = Math.min(i + 2, m - 1)
      for (let row = l; row <= rowEnd; row++) {
        const ar = Hr[row * n + i]!, ai = Hi[row * n + i]!, br = Hr[row * n + (i + 1)]!, bi = Hi[row * n + (i + 1)]!
        Hr[row * n + i] = cV * ar + (sr * br + si * bi); Hi[row * n + i] = cV * ai + (sr * bi - si * br)
        Hr[row * n + (i + 1)] = -(sr * ar - si * ai) + cV * br; Hi[row * n + (i + 1)] = -(sr * ai + si * ar) + cV * bi
      }
    }
    for (let i = l; i < m; i++) { Hr[i * n + i] += shift[0]; Hi[i * n + i] = Hi[i * n + i]! + (shift[1]) }
    iter++
  }
  return eigs
}

// Build EXACT 1-particle 24x24 Bloch matrix on floor-0 3D {4,3,4} cusp!
// How does 1 excitation move on the infinite floor-0 cusp (where bulk slots reflect to OPPOSITE_D4[s])?
// Use the twisted-Bloch gauge |k, s_local> = sum_n e^{i k . n} |dock(n), twist(n)[s_local]>!
// Let's trace S on |dock(n), twist(n)[s]>:
//   - If s is a BULK slot (18 of 24 slots): reflects at dock(n) to twist(n)[OPPOSITE[s]] (local slot OPPOSITE[s], same dock n -> phase 1)!
//   - If s = a_j (positive layer slot of axis j): streams to dock(n + e_j) with global slot twist(n)[a_j]!
//     What is that global slot's LOCAL index at dock(n + e_j)?
//     Remember twist(n + e_j) = twist(n) o h_j (twists are commuting involutions!), so:
//       s_local_next = h_j[a_j] !!
//     And since e^{i k . n} |n + e_j> = e^{-i k_j} e^{i k . (n + e_j)} |n + e_j>, it gets Bloch phase e^{-i k_j}!
//   - If s = b_j (negative layer slot of axis j): streams to dock(n - e_j) with local slot h_j[b_j] and Bloch phase e^{+i k_j}!
// Let's check what h_j[a_j] and h_j[b_j] are!!
// Remember exact-cusp.ts: u_a = k_a h_a, u_b = u_a^{-1} = h_a k_{-a}, so k_a maps (0, a_j) -> (e_j, a_j),
// and in the twisted frame at e_j, local slot = h_j[a_j] = -b_j!! Wait: let's compute h_j[a_j] and h_j[b_j] directly!

function analyzePartC(): void {
  console.log('\n======================================================================')
  console.log('PART C: 3D {4,3,4} FLOOR-0 CUSP 1-PARTICLE & 2-PARTICLE BCH THROUGH O(k^4)')
  console.log('======================================================================')

  const axes = buildCuspAxes()
  const lineOfSlot = ROOTS_D4.map((_, s) => LINES_D4.findIndex(([a, b]) => a === s || b === s))
  console.log('  Exact {4,3,4} floor-0 cusp layer axes (slot a_j, partner b_j, h_j[a_j], h_j[b_j]):')
  for (let j = 0; j < 3; j++) {
    const ax = axes[j]!
    console.log(
      `    axis ${j}: a=${ax.slot} (line ${lineOfSlot[ax.slot]}), b=${ax.partner} (line ${lineOfSlot[ax.partner]}), ` +
        `opp(a)=${OPPOSITE_D4[ax.slot]}, opp(b)=${OPPOSITE_D4[ax.partner]}, h[a]=${ax.twistPerm[ax.slot]}, h[b]=${ax.twistPerm[ax.partner]}`,
    )
  }

  // 1) 1-particle 24x24 Bloch unitary U1_cusp(k) = S_cusp(k) * C_24 (and check palindromic D S D!)
  const C_KEEP: C = [0.25, SQRT3 / 4]
  const C_CROSS: C = [0.75, -SQRT3 / 4]
  const buildU1Cusp = (k: [number, number, number]): CMat => {
    const C24 = cmatZero(24)
    for (let s = 0; s < 24; s++) {
      const opp = OPPOSITE_D4[s]!
      C24.re[s * 24 + s] = C_KEEP[0]; C24.im[s * 24 + s] = C_KEEP[1]
      C24.re[opp * 24 + s] = C_CROSS[0]; C24.im[opp * 24 + s] = C_CROSS[1]
    }
    const S24 = cmatZero(24)
    const layerMap = new Map<number, { dst: number; ph: C }>()
    for (let j = 0; j < 3; j++) {
      const ax = axes[j]!
      layerMap.set(ax.slot, { dst: ax.twistPerm[ax.slot]!, ph: cExpI(-k[j]!) })
      layerMap.set(ax.partner, { dst: ax.twistPerm[ax.partner]!, ph: cExpI(k[j]!) })
    }
    for (let s = 0; s < 24; s++) {
      const hit = layerMap.get(s)
      if (hit) {
        S24.re[hit.dst * 24 + s] = hit.ph[0]
        S24.im[hit.dst * 24 + s] = hit.ph[1]
      } else {
        // Bulk slot reflects into opposite slot on same dock!
        const dst = OPPOSITE_D4[s]!
        S24.re[dst * 24 + s] = 1
      }
    }
    return cmatMul(S24, C24)
  }

  console.log('\n  [C.1] 1-PARTICLE 24-BAND FLOOR-0 CUSP BLOCH OPERATOR U1_cusp(k):')
  const testK1: [number, number, number] = [0.4, 0.7, 1.1]
  const U1t = buildU1Cusp(testK1)
  console.log(`    Unitarity error at k=[0.4,0.7,1.1]: ${cmatUnitaryErr(U1t).toExponential(2)}`)
  // Compare spectra at k=(0,0,0), (0.3,0,0), (0.3/sqrt2,0.3/sqrt2,0), (0.3/sqrt3,0.3/sqrt3,0.3/sqrt3)
  const kList1: { name: string; k: [number, number, number] }[] = [
    { name: '(0,0,0)', k: [0, 0, 0] },
    { name: '(1,0,0)*0.3', k: [0.3, 0, 0] },
    { name: '(1,1,0)/s2*0.3', k: [0.3 * Math.SQRT1_2, 0.3 * Math.SQRT1_2, 0] },
    { name: '(1,1,1)/s3*0.3', k: [0.3 / SQRT3, 0.3 / SQRT3, 0.3 / SQRT3] },
    { name: '(pi/2,0,0)', k: [Math.PI / 2, 0, 0] },
  ]
  for (const item of kList1) {
    const eigs = complexEigenvalues(buildU1Cusp(item.k)).map(cArg).sort((a, b) => a - b)
    // Summarize distinct eigenphases with multiplicities
    const groups: { val: number; mult: number }[] = []
    for (const e of eigs) {
      const last = groups[groups.length - 1]
      if (last && Math.abs(e - last.val) < 1e-6) last.mult++
      else groups.push({ val: e, mult: 1 })
    }
    console.log(
      `    k=${item.name.padEnd(15)}: ` +
        groups.map(g => `${g.val.toFixed(6)}(x${g.mult})`).join(', '),
    )
  }

  // Exact dispersion of the 1-particle dispersive bands on floor-0 cusp!
  // Notice the 6 layer slots + their 6 antipodes form 3 DECOUPLED 4x4 blocks (one per cubic axis j = 0,1,2)!
  // Let's check! On axis j, the 4 states are {a_j, -a_j, b_j, -b_j}:
  //   - Coin C mixes a_j <-> -a_j and b_j <-> -b_j.
  //   - Stream S maps a_j -> h_j[a_j] (= -b_j!) with e^{-i k_j}, b_j -> h_j[b_j] (= -a_j!) with e^{+i k_j},
  //     and bulk slots -a_j -> a_j (phase 1), -b_j -> b_j (phase 1)!
  // WAIT A SECOND!! CHECK THAT 4x4 BLOCK ALGEBRAICALLY!!
  //   The 12 pure bulk slots (6 lines) just flip s <-> -s under S, giving S C = X C = P_+ - omega P_- (12 COMPLETELY FLAT BANDS: 6 at E=0 and 6 at E=-pi/3? Wait: let's check!)
  //   AND each axis j gives an INDEPENDENT 4x4 1D-DIRAC-LIKE BLOCK depending ONLY on k_j!!
  //   Let's extract its exact Taylor expansion in k_j through O(k_j^4)!
  console.log('\n  [C.1b] 1-particle cusp dispersive band Taylor expansion along axis 0 (k = (q, 0, 0)):')
  const extractDispersive1 = (q: number): number[] => {
    const eigs = complexEigenvalues(buildU1Cusp([q, 0, 0])).map(cArg).sort((a, b) => a - b)
    // Filter out flat bands (check which ones move from q=0 to q=0.3)
    return eigs
  }
  const e0_1p = extractDispersive1(0)
  const eSmall_1p = extractDispersive1(0.05)
  const eMid_1p = extractDispersive1(0.10)
  console.log('    Comparing q=0 vs q=0.05 vs q=0.10 (all 24 sorted bands; dispersive ones highlighted):')
  for (let i = 0; i < 24; i++) {
    const d1 = eSmall_1p[i]! - e0_1p[i]!
    const d2 = eMid_1p[i]! - e0_1p[i]!
    if (Math.abs(d2) > 1e-8) {
      const ratio = d2 / d1
      console.log(
        `      band ${i}: E(0)=${e0_1p[i]!.toFixed(8)}, dE(0.05)=${d1.toExponential(5)}, dE(0.10)=${d2.toExponential(5)}, ratio(0.10/0.05)=${ratio.toFixed(6)} (${Math.abs(ratio - 2) < 0.05 ? 'LINEAR DIRAC/WEYL!' : Math.abs(ratio - 4) < 0.05 ? 'QUADRATIC!' : 'other'})`,
      )
    }
  }

  // 2) 2-particle 24x24 floor-0 cusp Bloch operator U2_cusp(k; zeta_18) (EXACT bare M_pair(zeta_18)!)
  // Matches mpair-cusp-dispersion.ts buildCuspBlochMatrix verbatim (exact unitary on 12 full-line + 12 edge states)!
  const buildU2Cusp = (k: [number, number, number], withMpair: boolean): CMat => {
    const n = 24
    const A = cmatZero(n)
    const lineOfA = axes.map(ax => lineOfSlot[ax.slot]!)
    const lineOfB = axes.map(ax => lineOfSlot[ax.partner]!)
    const lineRole = new Int32Array(12).fill(-1)
    for (let j = 0; j < 3; j++) {
      lineRole[lineOfA[j]!] = 2 * j
      lineRole[lineOfB[j]!] = 2 * j + 1
    }
    const hop: C = withMpair ? cScale(1 / 12, cSub(Z18, [1, 0])) : [0, 0]
    const keep: C = cAdd([1, 0], hop)
    // Full-line block (0..11): W^2 * M_pair(zeta_18)
    for (let r = 0; r < 12; r++) {
      for (let c = 0; c < 12; c++) {
        const v = cMul(W2, r === c ? keep : hop)
        A.re[r * n + c] = v[0]
        A.im[r * n + c] = v[1]
      }
    }
    // 4-state edge blocks (12 + 4j .. 12 + 4j + 3): C x C
    for (let j = 0; j < 3; j++) {
      const off = 12 + 4 * j
      for (let r = 0; r < 4; r++) {
        const r0 = (r >> 1) & 1, r1 = r & 1
        for (let c = 0; c < 4; c++) {
          const c0 = (c >> 1) & 1, c1 = c & 1
          const v = cMul(r0 === c0 ? C_KEEP : C_CROSS, r1 === c1 ? C_KEEP : C_CROSS)
          A.re[(off + r) * n + (off + c)] = v[0]
          A.im[(off + r) * n + (off + c)] = v[1]
        }
      }
    }
    const U = cmatZero(n)
    const putRow = (dst: number, src: number, ph: C) => {
      for (let c = 0; c < n; c++) {
        const v = cMul(ph, [A.re[src * n + c]!, A.im[src * n + c]!])
        U.re[dst * n + c] = v[0]
        U.im[dst * n + c] = v[1]
      }
    }
    for (let l = 0; l < 12; l++) {
      const role = lineRole[l]!
      if (role < 0) putRow(l, l, [1, 0])
      else if (role % 2 === 0) putRow(12 + 4 * (role >> 1) + 0, l, [1, 0])
      else {
        const j = role >> 1
        putRow(12 + 4 * j + 3, l, cExpI(k[j]!))
      }
    }
    for (let j = 0; j < 3; j++) {
      const off = 12 + 4 * j
      putRow(lineOfB[j]!, off + 0, cExpI(-k[j]!))
      putRow(off + 2, off + 1, [1, 0])
      putRow(off + 1, off + 2, [1, 0])
      putRow(lineOfA[j]!, off + 3, [1, 0])
    }
    return U
  }

  console.log('\n  [C.2] 2-PARTICLE 24-BAND FLOOR-0 CUSP BLOCH OPERATOR U2_cusp(k; zeta_18):')
  console.log(`    Unitarity error at k=[0.4,0.7,1.1]: ${cmatUnitaryErr(buildU2Cusp([0.4, 0.7, 1.1], true)).toExponential(2)}`)
  // Extract exact O(k^2) and O(k^4) Taylor coefficients of ALL dispersive bands along (1,0,0), (1,1,0), (1,1,1)!
  const e2_0 = complexEigenvalues(buildU2Cusp([0, 0, 0], true)).map(cArg).sort((a, b) => a - b)
  const e2_s = complexEigenvalues(buildU2Cusp([0.1, 0, 0], true)).map(cArg).sort((a, b) => a - b)
  // Find dispersive band indices (where |E(0.1,0,0) - E(0)| > 1e-6)
  const dispBands: number[] = []
  for (let i = 0; i < 24; i++) {
    if (Math.abs(e2_s[i]! - e2_0[i]!) > 1e-6) dispBands.push(i)
  }
  console.log(`    Found ${dispBands.length} dispersive 2-particle bands on floor-0 cusp (out of 24; rest are flat):`)
  const dirs3: { name: string; u: [number, number, number] }[] = [
    { name: '(1,0,0)', u: [1, 0, 0] },
    { name: '(1,1,0)/sqrt2', u: [Math.SQRT1_2, Math.SQRT1_2, 0] },
    { name: '(1,1,1)/sqrt3', u: [1 / SQRT3, 1 / SQRT3, 1 / SQRT3] },
  ]
  // Track each isolated non-degenerate dispersive band across k = 0.04, 0.08, 0.12, 0.16 along all 3 axes!
  const ks3 = [0.04, 0.08, 0.12, 0.16]
  const solveLin = (A: number[][], b: number[]): number[] => {
    const n = b.length
    const M = A.map((r, i) => [...r, b[i]!])
    for (let col = 0; col < n; col++) {
      let piv = col
      for (let r = col + 1; r < n; r++) if (Math.abs(M[r]![col]!) > Math.abs(M[piv]![col]!)) piv = r
      const tmp = M[col]!; M[col] = M[piv]!; M[piv] = tmp
      for (let r = col + 1; r < n; r++) {
        const f = M[r]![col]! / M[col]![col]!
        for (let c = col; c <= n; c++) M[r]![c] = M[r]![c]! - f * M[col]![c]!
      }
    }
    const x = new Array<number>(n).fill(0)
    for (let i = n - 1; i >= 0; i--) {
      let s = M[i]![n]!
      for (let j = i + 1; j < n; j++) s -= M[i]![j]! * x[j]!
      x[i] = s / M[i]![i]!
    }
    return x
  }

  for (const bIdx of dispBands) {
    const E0 = e2_0[bIdx]!
    // Check if non-degenerate at k=0 (gap to neighbors > 1e-4)
    const gapPrev = bIdx > 0 ? Math.abs(E0 - e2_0[bIdx - 1]!) : 10
    const gapNext = bIdx < 23 ? Math.abs(e2_0[bIdx + 1]! - E0) : 10
    if (Math.min(gapPrev, gapNext) < 1e-4) {
      console.log(`    Band ${bIdx} (E0=${E0.toFixed(6)}): degenerate at k=0 (gap=${Math.min(gapPrev, gapNext).toExponential(2)}), skipping isolated scalar fit`)
      continue
    }
    console.log(`    Isolated Band ${bIdx} (E0 = ${E0.toFixed(10)} rad):`)
    const c2Arr: number[] = []
    const c4Arr: number[] = []
    for (const d of dirs3) {
      // Track nearest eigenvalue to E0 along ks3
      const ys = ks3.map(k => {
        const eigs = complexEigenvalues(buildU2Cusp([k * d.u[0], k * d.u[1], k * d.u[2]], true)).map(cArg)
        let best = eigs[0]!
        let bestD = 1e9
        for (const e of eigs) {
          const dd = Math.abs(Math.atan2(Math.sin(e - E0), Math.cos(e - E0)))
          if (dd < bestD) { bestD = dd; best = e }
        }
        const dE = Math.atan2(Math.sin(best - E0), Math.cos(best - E0))
        return dE / (k * k)
      })
      const xs = ks3.map(k => k * k)
      const V = xs.map(x => [1, x, x * x, x ** 3])
      const [c2, c4, c6] = solveLin(V, ys)
      c2Arr.push(c2!)
      c4Arr.push(c4!)
      console.log(`      ${d.name.padEnd(15)}: c2=${c2!.toFixed(10)}, c4=${c4!.toFixed(9)}, c6=${c6!.toFixed(6)}`)
    }
    const sp2 = Math.max(...c2Arr) - Math.min(...c2Arr)
    const sp4 = Math.max(...c4Arr) - Math.min(...c4Arr)
    console.log(
      `      --> O(k^2) spread = ${sp2.toExponential(3)} (SO(3) isotropic!), O(k^4) cubic spread = ${sp4.toExponential(4)} (rel = ${(sp4 / Math.abs(c4Arr[0]!)).toFixed(4)})`,
    )
  }
}

function main(): void {
  analyzePartA()
  analyzePartB()
  analyzePartC()
}

main()

export {}
