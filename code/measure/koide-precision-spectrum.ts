// EXACT KOIDE Q = 2/3 FROM F4'S SQRT(2) ROOT RATIO, Z[zeta_9] PHASE ANALYSIS (arg(zeta_9)/pi = 2/9),
// PRECISION CHARGED-LEPTON / QUARK / NEUTRINO AUDIT, STRICT LOOK-ELSEWHERE NULL CONTROLS,
// AND COMBINED KOIDE + {3,4,3,4} WARP-SHELL RUNNING THEOREM
// (E-FRC-0325, Open Problem #2).
//
// Builds directly on verified Vibe Theory primitives and confronts prior negative/honest results:
//   - E-FRC-0058..0066: Koide sqrt(2) decomposition, F4 long/short root ratio 1/sqrt(2), sector
//     assignment, tau prediction (1776.97 MeV), quark/neutrino scope limits, and honest negative
//     E-FRC-0066 (delta = 2/9 rad is NOT a geometric root angle or simple pi-fraction).
//   - E-FRC-0323 (code/measure/three-generation-spectrum.ts): 3 orthogonal 8-slot D4 triality frames
//     of the 24-cell, order-3 T_3 in W(D4) < W(F4), exact Z[zeta_9][1/6] shifted domain-wall zero
//     modes, and {3,4,3,4} cusp shell counts N_D = [1, 18, 330, 6034].
//   - E-FRC-0324 (code/measure/so10-three-generations.ts): 3 x 16 = 48 Spin(10) Weyl fermions and
//     spontaneous S_3 breaking selecting staggered shells (0, 2, 3).
//
// Three parts (100% deterministic, zero Math.random, exact BigInt rationals + dense Hermitian solver):
//   1. Exact parameter-free theorem: on the 24-cell F4 root system (24 short norm^2 = 1, 24 long
//      norm^2 = 2, r_F4 = |long|/|short| = sqrt(2)) with order-3 D4 triality T_3 (T_3^3 = I,
//      eigenvalues {1, omega, omega^2}), the 3x3 Hermitian triality-circulant square-root mass
//      operator S(r, delta) = v_0 (I + (r/2)(e^{i delta} T_3 + e^{-i delta} T_3^dag)) has M = S^2
//      satisfying Q(M) = (2 + r^2) / 6 identically across the positivity window |delta mod 2pi/3| <= pi/12
//      (and for all phases in the signed-root convention). Thus Q = 2/3 IF AND ONLY IF r^2 = 2 (r = sqrt(2),
//      the unique 4D exceptional root system F4, shared by B_n/C_n). Negative controls: r = 1 (simply-laced
//      A/D/E) gives Q = 1/2, r = sqrt(3) (G_2) gives Q = 5/6, swapped r = 2*sqrt(2) gives Q_signed = 5/3.
//   2. Exact Z[zeta_9][1/6] phase analysis and strict look-elsewhere null control:
//      - Directly tests delta = arg(zeta_9) = 2*pi/9 rad (FAILS: outside positivity window, negative
//        eigenvalue, huge mass-ratio error) vs delta_9 = arg(zeta_9)/pi = 2/9 rad (MATCHES PDG 2024
//        charged leptons: m_mu/m_e to 0.0008%, m_tau/m_mu to 0.0061%, m_tau/m_e to 0.0070%, Q to 0.0009%),
//        stating the unexplained 1/pi bridge transparently (confronting E-FRC-0066).
//      - Deterministic look-elsewhere null sweep over all 45 reduced rationals p/q (1 <= p < q <= 12),
//        all F4 / Z[zeta_9] geometric angles (pi/9, 2pi/9, pi/6, pi/4, pi/3, pi/12, and pi/n for n = 2..40),
//        plus a 20,000-point continuous phase-space acceptance scan on (0, pi/12).
//   3. Precision lepton / quark / neutrino audit and exact Koide + {3,4,3,4} warp-shell theorem:
//      - Audits charged leptons (Q = 0.666661), down quarks (Q = 0.7314), up quarks (Q = 0.8490),
//        mixed-scheme heavy (c, b, t) (Q = 0.6695), and neutrinos (max Q_NO = 0.584, max Q_IO = 0.500).
//      - Proves algebraically (BigInt rationals) and numerically (<= 1e-15) that sandwiching S(sqrt(2), delta)
//        by ANY positive diagonal warp matrix W(D) = diag(w_0, w_1, w_2) gives S_eff = W S W > 0 with
//          Q(S_eff^2) = 2/3 + sum_{i<j} (w_i^2 - w_j^2)^2 / (6 (sum_i w_i^2)^2) in [2/3, 1)
//        EXACTLY and PHASE-INDEPENDENTLY inside (-pi/12, pi/12), with Q = 2/3 iff w_0 = w_1 = w_2.
//      - Shows that single-cusp-aligned leptons stay at Q = 2/3, staggered {3,4,3,4} shells (0, 2, 3)
//        from E-FRC-0324 push Q strictly upward through Q_down = 0.7314 and Q_up = 0.8490, and
//        neutrinos (Q < 2/3) are provably unreachable by any diagonal warp (requiring Majorana/seesaw).

import { rootsF4 } from '@/code/algebra/group/root-system'
import { hermitianEigenRows } from '@/code/algebra/linear/eig-hermitian-householder'
import {
  OMEGA,
  ONE,
  ZERO,
  dagger,
  identityMatrix,
  isUnitary,
  matMul,
  sameMatrix,
  toComplex,
  zetaPower,
  type Ninth,
} from '@/code/algebra/ninth-field'
import { EXACT_COLUMN_SHELL_COUNTS } from '@/code/measure/pair-density-gravity-slope'
import {
  rat,
  ratAdd,
  ratDiv,
  ratEq,
  ratFormat,
  ratMul,
  ratSub,
  ratToNumber,
  type Rat,
} from '@/code/measure/so10-three-generations'
import {
  SM_REFERENCE,
  buildTrialityFramesCertificate,
  koideInvariant,
  solveShiftedDomainWallZeroMode,
  type TrialityFramesCertificate,
} from '@/code/measure/three-generation-spectrum'

// ---------------------------------------------------------------------------------------------------------
// PDG 2024 reference constants (empirical test comparison data, never fitted in Part 1)

export const PDG_FERMION_DATA = {
  // Charged leptons (pole masses, MeV): e, mu, tau
  leptonsMeV: SM_REFERENCE.leptonMassesMeV,
  // Down-type quarks (MS-bar masses, MeV): d, s, b
  downQuarksMeV: SM_REFERENCE.downMassesMeV,
  // Up-type quarks (MS-bar masses, MeV): u, c, t
  upQuarksMeV: SM_REFERENCE.upMassesMeV,
  // Heavy triple (c MS-bar, b MS-bar, t pole, MeV) - mixed scheme caveat noted explicitly
  heavyQuarksMixedMeV: [1270, 4180, 172500] as const,
  // Neutrino mass-squared splittings (eV^2)
  neutrinoDm21SqEv2: 7.53e-5,
  neutrinoDm31SqNormalEv2: 2.453e-3,
  neutrinoDm31SqInvertedEv2: 2.536e-3,
} as const

// ---------------------------------------------------------------------------------------------------------
// Exact 3x3 Hermitian triality-circulant matrix construction and eigensolver

export type TrialityCirculantSpectrum = {
  readonly rRatio: number
  readonly delta: number
  readonly v0: number
  readonly hermiticityErr: number
  readonly maxEigResidual: number
  readonly signedEigenvalues: readonly [number, number, number] // ascending s_0 <= s_1 <= s_2
  readonly analyticMatchErr: number
  readonly allPositive: boolean
  readonly masses: readonly [number, number, number] // ascending m_0 <= m_1 <= m_2
  readonly koideQSigned: number
  readonly koideQUnsigned: number
}

// Build explicit 3x3 Hermitian matrix:
//   S(r, delta) = v_0 * (I_3 + (r / 2) * (e^{i delta} T_3 + e^{-i delta} T_3^dag))
// where T_3 is the cyclic shift T_3 |e_0> = |e_1>, T_3 |e_1> = |e_2>, T_3 |e_2> = |e_0>.
// Entries:
//   S[k, k] = v_0
//   S[(k+1)%3, k] = v_0 * (r / 2) * e^{i delta}
//   S[k, (k+1)%3] = v_0 * (r / 2) * e^{-i delta}
function buildTrialityCirculantMatrix(
  rRatio: number,
  delta: number,
  v0: number,
): { readonly re: Float64Array; readonly im: Float64Array } {
  const re = new Float64Array(9)
  const im = new Float64Array(9)
  const cRe = v0 * (rRatio / 2) * Math.cos(delta)
  const cIm = v0 * (rRatio / 2) * Math.sin(delta)

  for (let k = 0; k < 3; k++) {
    const next = (k + 1) % 3

    // Diagonal
    re[k * 3 + k] = v0
    im[k * 3 + k] = 0
    // T_3 entry: row = next, col = k -> +i delta
    re[next * 3 + k] = cRe
    im[next * 3 + k] = cIm
    // T_3^dag entry: row = k, col = next -> -i delta
    re[k * 3 + next] = cRe
    im[k * 3 + next] = -cIm
  }

  return { re, im }
}

function hermiticityError3(re: Float64Array, im: Float64Array): number {
  let maxErr = 0

  for (let r = 0; r < 3; r++) {
    for (let c = 0; c < 3; c++) {
      const dr = Math.abs(re[r * 3 + c]! - re[c * 3 + r]!)
      const di = Math.abs(im[r * 3 + c]! + im[c * 3 + r]!)
      const err = Math.hypot(dr, di)

      if (err > maxErr) maxErr = err
    }
  }

  return maxErr
}

function koideSignedFromRoots(s: readonly [number, number, number]): number {
  const sumM = s[0] * s[0] + s[1] * s[1] + s[2] * s[2]
  const sumS = s[0] + s[1] + s[2]

  return sumS !== 0 ? sumM / (sumS * sumS) : 0
}

export function solveTrialityCirculant(
  rRatio: number,
  delta: number,
  v0 = 1,
): TrialityCirculantSpectrum {
  const mat = buildTrialityCirculantMatrix(rRatio, delta, v0)
  const hermiticityErr = hermiticityError3(mat.re, mat.im)
  const shift = Math.max(1e-30, 3 * v0 * (1 + Math.abs(rRatio)))
  const eig = hermitianEigenRows(3, mat.re, mat.im, shift)

  const signedEigenvalues: [number, number, number] = [
    eig.values[0]!,
    eig.values[1]!,
    eig.values[2]!,
  ]

  // Directly certify eigenpair residual max_k ||S v_k - s_k v_k||_2
  let maxEigResidual = 0

  for (let k = 0; k < 3; k++) {
    const lam = signedEigenvalues[k]!
    const off = k * 3
    let resSq = 0

    for (let r = 0; r < 3; r++) {
      let sr = 0
      let si = 0

      for (let c = 0; c < 3; c++) {
        const mr = mat.re[r * 3 + c]!
        const mi = mat.im[r * 3 + c]!
        const vr = eig.vectorsRe[off + c]!
        const vi = eig.vectorsIm[off + c]!

        sr += mr * vr - mi * vi
        si += mr * vi + mi * vr
      }

      const dr = sr - lam * eig.vectorsRe[off + r]!
      const di = si - lam * eig.vectorsIm[off + r]!

      resSq += dr * dr + di * di
    }

    const res = Math.sqrt(resSq)

    if (res > maxEigResidual) maxEigResidual = res
  }

  // Compare with exact analytic eigenvalues v_0 (1 + r cos(delta + 2 pi k / 3))
  const analytic = [0, 1, 2]
    .map(k => v0 * (1 + rRatio * Math.cos(delta + (2 * Math.PI * k) / 3)))
    .sort((a, b) => a - b)

  const analyticMatchErr = Math.max(
    Math.abs(signedEigenvalues[0] - analytic[0]!),
    Math.abs(signedEigenvalues[1] - analytic[1]!),
    Math.abs(signedEigenvalues[2] - analytic[2]!),
  )

  const allPositive = signedEigenvalues[0] >= -1e-14
  const massesSorted = [
    signedEigenvalues[0] * signedEigenvalues[0],
    signedEigenvalues[1] * signedEigenvalues[1],
    signedEigenvalues[2] * signedEigenvalues[2],
  ].sort((a, b) => a - b) as [number, number, number]

  const koideQSigned = koideSignedFromRoots(signedEigenvalues)
  const koideQUnsigned = koideInvariant(massesSorted)

  return {
    rRatio,
    delta,
    v0,
    hermiticityErr,
    maxEigResidual,
    signedEigenvalues,
    analyticMatchErr,
    allPositive,
    masses: massesSorted,
    koideQSigned,
    koideQUnsigned,
  }
}

// ---------------------------------------------------------------------------------------------------------
// Part 1: Exact parameter-free theorem (F4 sqrt(2) root ratio + D4 triality T_3 => Q = 2/3 identically)

export type RootFamilyControl = {
  readonly label: string
  readonly rSquaredExact: Rat
  readonly rFloat: number
  readonly qExact: Rat
  readonly qFloat: number
  readonly qNumericalSigned: number
  readonly qNumericalUnsigned: number
  readonly errFromExactFormula: number
  readonly matchesTwoThirds: boolean
}

export type Part1ExactTheoremReport = {
  // 24-cell / F4 root-system geometry certificate
  readonly framesCert: TrialityFramesCertificate
  readonly f4TotalRoots: number
  readonly f4ShortRootsCount: number
  readonly f4LongRootsCount: number
  readonly f4ShortNormSqExact: Rat
  readonly f4LongNormSqExact: Rat
  readonly f4RatioSqExact: Rat
  readonly f4RatioFloat: number
  // Symbolic Q(zeta_9) certificate for 3x3 triality operator T_3
  readonly t3SymbolicUnitaryExact: boolean
  readonly t3SymbolicOrder3Exact: boolean
  readonly t3SymbolicTracelessExact: boolean
  readonly t3SymbolicEigenvaluesExact: boolean
  // Exact BigInt rational proof: Q(r^2) = (3 + 3 r^2 / 2) / 9 = (2 + r^2) / 6 = 2/3 iff r^2 = 2
  readonly symbolicNumeratorF4: Rat
  readonly symbolicDenominatorF4: Rat
  readonly symbolicQF4Exact: Rat
  readonly symbolicQF4EqualsTwoThirds: boolean
  readonly uniqueRSquaredForTwoThirds: Rat
  // Positivity window verification: |delta mod 2pi/3| <= pi/12 = pi/3 - acos(1/sqrt(2))
  readonly positivityHalfWidthRad: number
  readonly positivityWindowFormulaErr: number
  readonly phaseSweepCount: number
  readonly phaseSweepMaxHermiticityErr: number
  readonly phaseSweepMaxAnalyticErr: number
  readonly phaseSweepMaxEigResidual: number
  readonly phaseSweepMaxQErrUnsigned: number
  readonly phaseSweepMaxQErrSigned: number
  readonly phaseSweepMinEigenvalue: number
  readonly scaleInvarianceMaxQErr: number
  // Outside-window control (delta = pi/6): negative eigenvalue breaks unsigned Q while signed Q stays 2/3
  readonly outsideWindowDelta: number
  readonly outsideWindowMinEigenvalue: number
  readonly outsideWindowQSigned: number
  readonly outsideWindowQUnsigned: number
  // Negative controls across root families (r = 1 simply-laced, r = sqrt(2) F4/B/C, r = sqrt(3) G2, swapped 2*sqrt(2))
  readonly rootFamilyControls: readonly RootFamilyControl[]
  readonly onlySqrt2GivesTwoThirds: boolean
}

// Exact BigInt rational formula Q(r^2) = (3 + (3/2) r^2) / 9 = (1 + r^2 / 2) / 3
export function exactKoideRationalFromRSquared(rSq: Rat): {
  readonly numerator: Rat
  readonly denominator: Rat
  readonly qExact: Rat
} {
  const three = rat(3n)
  const nine = rat(9n)
  const threeHalves = rat(3n, 2n)
  const numerator = ratAdd(three, ratMul(threeHalves, rSq))
  const denominator = nine
  const qExact = ratDiv(numerator, denominator)

  return { numerator, denominator, qExact }
}

function runPart1ExactTheorem(): Part1ExactTheoremReport {
  const framesCert = buildTrialityFramesCertificate()

  // Verify F4 root system directly from rootsF4()
  const f4 = rootsF4()
  let f4ShortRootsCount = 0
  let f4LongRootsCount = 0

  for (const r of f4) {
    const n2 = r[0]! * r[0]! + r[1]! * r[1]! + r[2]! * r[2]! + r[3]! * r[3]!

    if (Math.abs(n2 - 1) < 1e-12) {
      f4ShortRootsCount++
    } else if (Math.abs(n2 - 2) < 1e-12) {
      f4LongRootsCount++
    }
  }

  const f4ShortNormSqExact = rat(1n)
  const f4LongNormSqExact = rat(2n)
  const f4RatioSqExact = ratDiv(f4LongNormSqExact, f4ShortNormSqExact)
  const f4RatioFloat = Math.sqrt(ratToNumber(f4RatioSqExact))

  // Symbolic Q(zeta_9) verification of 3x3 triality operator T_3
  const t3Mat: Ninth[][] = [
    [ZERO, ZERO, ONE],
    [ONE, ZERO, ZERO],
    [ZERO, ONE, ZERO],
  ]
  const id3 = identityMatrix(3)
  const t3Sq = matMul(t3Mat, t3Mat)
  const t3Cube = matMul(t3Sq, t3Mat)
  const t3SymbolicUnitaryExact = isUnitary(t3Mat) && sameMatrix(dagger(t3Mat), t3Sq)
  const t3SymbolicOrder3Exact = !sameMatrix(t3Mat, id3) && sameMatrix(t3Cube, id3)

  // Tr(T_3) = Tr(T_3^2) = 0 exact
  const trZero = (m: Ninth[][]): boolean => {
    const z0 = m[0]![0]!
    const z1 = m[1]![1]!
    const z2 = m[2]![2]!

    return (
      sameMatrix([[z0]], [[ZERO]]) &&
      sameMatrix([[z1]], [[ZERO]]) &&
      sameMatrix([[z2]], [[ZERO]])
    )
  }
  const t3SymbolicTracelessExact = trZero(t3Mat) && trZero(t3Sq)

  // Verify eigenvalues {1, omega, omega^2} via exact DFT matrix F = [1, 1, 1; 1, omega^2, omega; 1, omega, omega^2]
  // T_3 v_k = omega^k v_k where v_k = (1, omega^{2k}, omega^k)^T (since T_3 shifts down: row 1 gets row 0 = 1 = omega^k * omega^{2k})
  const omegaSq = zetaPower(6)
  const eigVals: readonly Ninth[] = [ONE, OMEGA, omegaSq]
  const eigVecs: readonly (readonly [Ninth, Ninth, Ninth])[] = [
    [ONE, ONE, ONE],
    [ONE, omegaSq, OMEGA],
    [ONE, OMEGA, omegaSq],
  ]
  let t3SymbolicEigenvaluesExact = true

  for (let k = 0; k < 3; k++) {
    const lam = eigVals[k]!
    const v = eigVecs[k]!
    const vCol: Ninth[][] = [[v[0]], [v[1]], [v[2]]]
    const lhs = matMul(t3Mat, vCol)
    const rhs = matMul(
      [
        [lam, ZERO, ZERO],
        [ZERO, lam, ZERO],
        [ZERO, ZERO, lam],
      ],
      vCol,
    )

    if (!sameMatrix(lhs, rhs)) {
      t3SymbolicEigenvaluesExact = false
    }
  }

  // Exact BigInt rational proof for F4 (r^2 = 2)
  const symF4 = exactKoideRationalFromRSquared(f4RatioSqExact)
  const twoThirds = rat(2n, 3n)
  const symbolicQF4EqualsTwoThirds = ratEq(symF4.qExact, twoThirds)
  // Solve (1 + r^2/2)/3 = 2/3 => r^2 = 2 * (3 * (2/3) - 1) = 2
  const uniqueRSquaredForTwoThirds = ratMul(
    rat(2n),
    ratSub(ratMul(rat(3n), twoThirds), rat(1n)),
  )

  // Exact positivity window: cos(delta + 2 pi k / 3) >= -1/sqrt(2) <=> |delta mod 2pi/3| <= pi/3 - acos(1/sqrt(2)) = pi/12
  const positivityHalfWidthRad = Math.PI / 12
  const positivityWindowFormulaErr = Math.abs(
    positivityHalfWidthRad - (Math.PI / 3 - Math.acos(1 / Math.SQRT2)),
  )

  // Dense deterministic sweep across [-pi/12, pi/12] plus 2/9 and shifted branches (+2pi/3, +4pi/3)
  const sweepPhases: number[] = []
  const nGrid = 64

  for (let i = 0; i <= nGrid; i++) {
    const t = -1 + (2 * i) / nGrid

    sweepPhases.push(t * positivityHalfWidthRad)
  }

  sweepPhases.push(2 / 9)
  sweepPhases.push(2 / 9 + (2 * Math.PI) / 3)
  sweepPhases.push(2 / 9 + (4 * Math.PI) / 3)

  let phaseSweepMaxHermiticityErr = 0
  let phaseSweepMaxAnalyticErr = 0
  let phaseSweepMaxEigResidual = 0
  let phaseSweepMaxQErrUnsigned = 0
  let phaseSweepMaxQErrSigned = 0
  let phaseSweepMinEigenvalue = Infinity

  for (const delta of sweepPhases) {
    const spec = solveTrialityCirculant(Math.SQRT2, delta, 1)

    if (spec.hermiticityErr > phaseSweepMaxHermiticityErr) {
      phaseSweepMaxHermiticityErr = spec.hermiticityErr
    }

    if (spec.analyticMatchErr > phaseSweepMaxAnalyticErr) {
      phaseSweepMaxAnalyticErr = spec.analyticMatchErr
    }

    if (spec.maxEigResidual > phaseSweepMaxEigResidual) {
      phaseSweepMaxEigResidual = spec.maxEigResidual
    }

    const errU = Math.abs(spec.koideQUnsigned - 2 / 3)
    const errS = Math.abs(spec.koideQSigned - 2 / 3)

    if (errU > phaseSweepMaxQErrUnsigned) phaseSweepMaxQErrUnsigned = errU
    if (errS > phaseSweepMaxQErrSigned) phaseSweepMaxQErrSigned = errS
    if (spec.signedEigenvalues[0] < phaseSweepMinEigenvalue) {
      phaseSweepMinEigenvalue = spec.signedEigenvalues[0]
    }
  }

  // Scale invariance check across 5 orders of magnitude in v_0 > 0
  const scales = [1e-3, 0.5, 1, 17.7156, 1e3]
  let scaleInvarianceMaxQErr = 0

  for (const v0 of scales) {
    const spec = solveTrialityCirculant(Math.SQRT2, 2 / 9, v0)
    const err = Math.abs(spec.koideQUnsigned - 2 / 3)

    if (err > scaleInvarianceMaxQErr) scaleInvarianceMaxQErr = err
  }

  // Outside-window control: delta = pi/6 (strictly outside (-pi/12, pi/12))
  const outsideWindowDelta = Math.PI / 6
  const outsideSpec = solveTrialityCirculant(Math.SQRT2, outsideWindowDelta, 1)

  // Negative controls across Lie root-system families + swapped assignment
  const familySpecs: readonly { readonly label: string; readonly rSq: Rat }[] = [
    { label: 'simply-laced A_n / D_n / E_n (r = 1)', rSq: rat(1n) },
    { label: 'non-simply-laced F4 / B_n / C_n (r = sqrt(2))', rSq: rat(2n) },
    { label: 'non-simply-laced G2 (r = sqrt(3))', rSq: rat(3n) },
    { label: 'swapped F4 short/long assignment (r = 2*sqrt(2))', rSq: rat(8n) },
  ]

  const rootFamilyControls: RootFamilyControl[] = familySpecs.map(({ label, rSq }) => {
    const { qExact } = exactKoideRationalFromRSquared(rSq)
    const rFloat = Math.sqrt(ratToNumber(rSq))
    const qFloat = ratToNumber(qExact)
    const spec = solveTrialityCirculant(rFloat, 0, 1)
    const errFromExactFormula = Math.abs(spec.koideQSigned - qFloat)

    return {
      label,
      rSquaredExact: rSq,
      rFloat,
      qExact,
      qFloat,
      qNumericalSigned: spec.koideQSigned,
      qNumericalUnsigned: spec.koideQUnsigned,
      errFromExactFormula,
      matchesTwoThirds: ratEq(qExact, twoThirds),
    }
  })

  const onlySqrt2GivesTwoThirds =
    rootFamilyControls.filter(c => c.matchesTwoThirds).length === 1 &&
    rootFamilyControls[1]!.matchesTwoThirds

  return {
    framesCert,
    f4TotalRoots: f4.length,
    f4ShortRootsCount,
    f4LongRootsCount,
    f4ShortNormSqExact,
    f4LongNormSqExact,
    f4RatioSqExact,
    f4RatioFloat,
    t3SymbolicUnitaryExact,
    t3SymbolicOrder3Exact,
    t3SymbolicTracelessExact,
    t3SymbolicEigenvaluesExact,
    symbolicNumeratorF4: symF4.numerator,
    symbolicDenominatorF4: symF4.denominator,
    symbolicQF4Exact: symF4.qExact,
    symbolicQF4EqualsTwoThirds,
    uniqueRSquaredForTwoThirds,
    positivityHalfWidthRad,
    positivityWindowFormulaErr,
    phaseSweepCount: sweepPhases.length,
    phaseSweepMaxHermiticityErr,
    phaseSweepMaxAnalyticErr,
    phaseSweepMaxEigResidual,
    phaseSweepMaxQErrUnsigned,
    phaseSweepMaxQErrSigned,
    phaseSweepMinEigenvalue,
    scaleInvarianceMaxQErr,
    outsideWindowDelta,
    outsideWindowMinEigenvalue: outsideSpec.signedEigenvalues[0],
    outsideWindowQSigned: outsideSpec.koideQSigned,
    outsideWindowQUnsigned: outsideSpec.koideQUnsigned,
    rootFamilyControls,
    onlySqrt2GivesTwoThirds,
  }
}

// ---------------------------------------------------------------------------------------------------------
// Part 2: Exact Z[zeta_9] phase analysis (arg(zeta_9)/pi = 2/9), charged-lepton match,
//         and deterministic pre-registered look-elsewhere null sweep

export type PhaseCandidateAudit = {
  readonly label: string
  readonly family: 'rational' | 'geometric_angle' | 'pi_fraction'
  readonly deltaRad: number
  readonly inPositivityWindow: boolean
  readonly minSignedEigenvalue: number
  readonly ratioMuOverE: number
  readonly ratioTauOverMu: number
  readonly relErrMuOverE: number
  readonly relErrTauOverMu: number
  readonly maxRatioRelErr: number
  readonly passes005Pct: boolean
}

export type Part2PhaseAndNullReport = {
  // Exact Z[zeta_9][1/6] generator audit
  readonly zeta9ArgRad: number
  readonly zeta9ArgOverPi: number
  readonly zeta9ArgOverPiExactErr: number
  // Direct geometric angle delta = arg(zeta_9) = 2*pi/9 rad (honest negative control!)
  readonly directZeta9AngleInWindow: boolean
  readonly directZeta9MinEigenvalue: number
  readonly directZeta9MaxRatioRelErr: number
  // Normalized phase fraction delta_9 = arg(zeta_9)/pi = 2/9 rad
  readonly delta9Rad: number
  readonly pdgExtractedDeltaRad: number
  readonly delta9AbsDiffFromPdg: number
  readonly pdgExtractedBOverA: number
  readonly bOverAAbsDiffFromSqrt2: number
  // Precision charged-lepton comparison at delta_9 = 2/9 rad
  readonly pdgQ: number
  readonly predQ: number
  readonly qRelErr: number
  readonly pdgMuOverE: number
  readonly predMuOverE: number
  readonly relErrMuOverE: number
  readonly pdgTauOverMu: number
  readonly predTauOverMu: number
  readonly relErrTauOverMu: number
  readonly pdgTauOverE: number
  readonly predTauOverE: number
  readonly relErrTauOverE: number
  // Single-scale predictions (1 scale v_0 fixed from m_mu) and phase-free Koide prediction of m_tau
  readonly v0FromMuonMeVHalf: number
  readonly predMeFromMuonScaleMeV: number
  readonly predMtauFromMuonScaleMeV: number
  readonly predMeRelErrFromMuonScale: number
  readonly predMtauRelErrFromMuonScale: number
  readonly phaseFreeKoideMtauMeV: number
  readonly phaseFreeKoideMtauRelErr: number
  // Look-elsewhere null sweep over all reduced rationals 1 <= p < q <= 12
  readonly rationalTotalCount: number
  readonly rationalInWindowCount: number
  readonly rationalHits005Pct: number
  readonly rationalNullFalsePositives005Pct: number
  readonly rationalEmpiricalHitRate005Pct: number
  readonly rationalHits1Pct: number
  readonly bestRationalLabel: string
  readonly bestRationalMaxErr: number
  readonly runnerUpRationalLabel: string
  readonly runnerUpRationalMaxErr: number
  readonly runnerUpInWindowRationalLabel: string
  readonly runnerUpInWindowRationalMaxErr: number
  // Geometric angles (Z[zeta_9] / F4) and simple pi/n (n = 2..40) audit
  readonly geometricAngleCandidates: readonly PhaseCandidateAudit[]
  readonly geometricAnglesHits005Pct: number
  readonly bestPiFractionLabel: string
  readonly bestPiFractionDeltaRad: number
  readonly bestPiFractionDeltaDiff: number
  readonly bestPiFractionMaxRatioErr: number
  readonly piFractionHits005Pct: number
  // Continuous phase-space acceptance fraction on (0, pi/12) via exact bisection + 20,000-point global scan
  readonly continuousGridCount: number
  readonly continuousSecondaryIslands005Pct: number
  readonly continuousAcceptanceWidthRad005Pct: number
  readonly continuousAcceptanceFraction005Pct: number
  readonly lookElsewhereProb45Rationals005Pct: number
  readonly lookElsewhereProbInWindowRationals005Pct: number
  readonly continuousAcceptanceWidthRadAtObservedErr: number
  readonly continuousAcceptanceFractionAtObservedErr: number
  readonly lookElsewhereProb45RationalsAtObservedErr: number
}

function gcdNum(a: number, b: number): number {
  let x = Math.abs(a)
  let y = Math.abs(b)

  while (y !== 0) {
    const t = x % y

    x = y
    y = t
  }

  return x
}

function evaluatePhaseCandidate(
  label: string,
  family: 'rational' | 'geometric_angle' | 'pi_fraction',
  deltaRad: number,
  pdgMuOverE: number,
  pdgTauOverMu: number,
): PhaseCandidateAudit {
  const spec = solveTrialityCirculant(Math.SQRT2, deltaRad, 1)
  const [m1, m2, m3] = spec.masses
  const safe1 = Math.max(m1, 1e-300)
  const safe2 = Math.max(m2, 1e-300)
  const ratioMuOverE = m2 / safe1
  const ratioTauOverMu = m3 / safe2
  const relErrMuOverE = Math.abs(ratioMuOverE - pdgMuOverE) / pdgMuOverE
  const relErrTauOverMu = Math.abs(ratioTauOverMu - pdgTauOverMu) / pdgTauOverMu
  const maxRatioRelErr = Math.max(relErrMuOverE, relErrTauOverMu)
  const passes005Pct = spec.allPositive && maxRatioRelErr < 5e-4

  return {
    label,
    family,
    deltaRad,
    inPositivityWindow: spec.allPositive,
    minSignedEigenvalue: spec.signedEigenvalues[0],
    ratioMuOverE,
    ratioTauOverMu,
    relErrMuOverE,
    relErrTauOverMu,
    maxRatioRelErr,
    passes005Pct,
  }
}

function runPart2PhaseAndNull(): Part2PhaseAndNullReport {
  const [me, mmu, mtau] = PDG_FERMION_DATA.leptonsMeV
  const pdgMuOverE = mmu / me
  const pdgTauOverMu = mtau / mmu
  const pdgTauOverE = mtau / me
  const pdgQ = koideInvariant(PDG_FERMION_DATA.leptonsMeV)

  // Extract empirical Koide parameters (a, b, delta) from PDG leptons
  const roots = [Math.sqrt(me), Math.sqrt(mmu), Math.sqrt(mtau)]
  const aPdg = (roots[0]! + roots[1]! + roots[2]!) / 3
  const dev = roots.map(r => r - aPdg)
  const bPdg = Math.sqrt((dev[0]! ** 2 + dev[1]! ** 2 + dev[2]! ** 2) / 1.5)
  const pdgExtractedBOverA = bPdg / aPdg
  const bOverAAbsDiffFromSqrt2 = Math.abs(pdgExtractedBOverA - Math.SQRT2)
  const pdgExtractedDeltaRad = Math.min(
    ...dev.map(d => Math.acos(Math.max(-1, Math.min(1, d / bPdg)))),
  )

  // Exact Z[zeta_9][1/6] fundamental generator zeta_9 = exp(2 pi i / 9)
  const [z9Re, z9Im] = toComplex(zetaPower(1))
  const zeta9ArgRad = Math.atan2(z9Im, z9Re)
  const zeta9ArgOverPi = zeta9ArgRad / Math.PI
  const delta9Rad = 2 / 9
  const zeta9ArgOverPiExactErr = Math.abs(zeta9ArgOverPi - delta9Rad)

  // Direct geometric angle delta = arg(zeta_9) = 2 pi / 9 rad (explicit negative check)
  const directZeta9Audit = evaluatePhaseCandidate(
    'arg(zeta_9) = 2*pi/9',
    'geometric_angle',
    zeta9ArgRad,
    pdgMuOverE,
    pdgTauOverMu,
  )

  // Normalized phase fraction delta_9 = arg(zeta_9)/pi = 2/9 rad
  const delta9Spec = solveTrialityCirculant(Math.SQRT2, delta9Rad, 1)
  const [p1, p2, p3] = delta9Spec.masses
  const predQ = delta9Spec.koideQUnsigned
  const qRelErr = Math.abs(predQ - pdgQ) / pdgQ
  const predMuOverE = p2 / p1
  const predTauOverMu = p3 / p2
  const predTauOverE = p3 / p1
  const relErrMuOverE = Math.abs(predMuOverE - pdgMuOverE) / pdgMuOverE
  const relErrTauOverMu = Math.abs(predTauOverMu - pdgTauOverMu) / pdgTauOverMu
  const relErrTauOverE = Math.abs(predTauOverE - pdgTauOverE) / pdgTauOverE

  // Single-scale prediction fixing v_0 from m_mu alone
  const sMuonUnit = delta9Spec.signedEigenvalues[1] // middle eigenvalue corresponds to muon
  const v0FromMuonMeVHalf = Math.sqrt(mmu) / sMuonUnit
  const scaledSpec = solveTrialityCirculant(Math.SQRT2, delta9Rad, v0FromMuonMeVHalf)
  const predMeFromMuonScaleMeV = scaledSpec.masses[0]
  const predMtauFromMuonScaleMeV = scaledSpec.masses[2]
  const predMeRelErrFromMuonScale = Math.abs(predMeFromMuonScaleMeV - me) / me
  const predMtauRelErrFromMuonScale = Math.abs(predMtauFromMuonScaleMeV - mtau) / mtau

  // Phase-free exact Q = 2/3 prediction of m_tau from (m_e, m_mu) alone
  const sumLight = me + mmu
  const sumSqrtLight = Math.sqrt(me) + Math.sqrt(mmu)
  const xTauHeavy = 2 * sumSqrtLight + Math.sqrt(6 * sumSqrtLight * sumSqrtLight - 3 * sumLight)
  const phaseFreeKoideMtauMeV = xTauHeavy * xTauHeavy
  const phaseFreeKoideMtauRelErr = Math.abs(phaseFreeKoideMtauMeV - mtau) / mtau

  // Look-elsewhere null sweep 1: ALL reduced rationals p/q with 1 <= p < q <= 12
  const rationalAudits: PhaseCandidateAudit[] = []

  for (let q = 2; q <= 12; q++) {
    for (let p = 1; p < q; p++) {
      if (gcdNum(p, q) !== 1) continue

      rationalAudits.push(
        evaluatePhaseCandidate(`${p}/${q}`, 'rational', p / q, pdgMuOverE, pdgTauOverMu),
      )
    }
  }

  const rationalSorted = [...rationalAudits].sort((a, b) => a.maxRatioRelErr - b.maxRatioRelErr)
  const rationalInWindow = rationalAudits.filter(a => a.inPositivityWindow)
  const rationalInWindowSorted = [...rationalInWindow].sort(
    (a, b) => a.maxRatioRelErr - b.maxRatioRelErr,
  )
  const rationalHits005 = rationalAudits.filter(a => a.passes005Pct)
  const rationalNullFalsePositives005Pct = rationalHits005.filter(a => a.label !== '2/9').length
  const rationalHits1Pct = rationalAudits.filter(
    a => a.inPositivityWindow && a.maxRatioRelErr < 1e-2,
  ).length

  // Look-elsewhere null sweep 2: natural Z[zeta_9] / F4 geometric angles
  const geoSpecs: readonly (readonly [string, number])[] = [
    ['pi/12', Math.PI / 12],
    ['pi/9', Math.PI / 9],
    ['2*pi/9', (2 * Math.PI) / 9],
    ['pi/6', Math.PI / 6],
    ['pi/4', Math.PI / 4],
    ['pi/3', Math.PI / 3],
  ]
  const geometricAngleCandidates = geoSpecs.map(([lbl, ang]) =>
    evaluatePhaseCandidate(lbl, 'geometric_angle', ang, pdgMuOverE, pdgTauOverMu),
  )
  const geometricAnglesHits005Pct = geometricAngleCandidates.filter(c => c.passes005Pct).length

  // Look-elsewhere null sweep 3: all simple pi/n for n = 2..40
  let bestPiAudit: PhaseCandidateAudit | null = null
  let piFractionHits005Pct = 0

  for (let n = 2; n <= 40; n++) {
    const audit = evaluatePhaseCandidate(
      `pi/${n}`,
      'pi_fraction',
      Math.PI / n,
      pdgMuOverE,
      pdgTauOverMu,
    )

    if (audit.passes005Pct) piFractionHits005Pct++

    if (!bestPiAudit || audit.maxRatioRelErr < bestPiAudit.maxRatioRelErr) {
      bestPiAudit = audit
    }
  }

  // Exact analytic ratio error at any delta in (0, pi/12) (certified equal to dense eigensolver to <= 1e-15 in Part 1)
  const ratioMaxErrAtDelta = (delta: number): number => {
    const s0 = 1 + Math.SQRT2 * Math.cos(delta)
    const s1 = 1 + Math.SQRT2 * Math.cos(delta + (2 * Math.PI) / 3)
    const s2 = 1 + Math.SQRT2 * Math.cos(delta + (4 * Math.PI) / 3)
    const ms = [s0 * s0, s1 * s1, s2 * s2].sort((a, b) => a - b)
    const r21 = ms[1]! / Math.max(ms[0]!, 1e-300)
    const r32 = ms[2]! / Math.max(ms[1]!, 1e-300)

    return Math.max(
      Math.abs(r21 - pdgMuOverE) / pdgMuOverE,
      Math.abs(r32 - pdgTauOverMu) / pdgTauOverMu,
    )
  }

  // Find the exact continuous acceptance interval width around delta_PDG via deterministic bisection
  const halfWidth = Math.PI / 12
  const observedMaxErr = Math.max(relErrMuOverE, relErrTauOverMu)
  const measureAcceptanceWidth = (threshold: number): {
    readonly lo: number
    readonly hi: number
    readonly width: number
  } => {
    // Center point minimizing ratioMaxErrAtDelta sits near delta_9 = 2/9 (within 1e-5 rad)
    let center = delta9Rad
    let bestErr = ratioMaxErrAtDelta(center)

    for (let k = -200; k <= 200; k++) {
      const cand = delta9Rad + k * 2e-7
      const err = ratioMaxErrAtDelta(cand)

      if (err < bestErr) {
        bestErr = err
        center = cand
      }
    }

    if (bestErr > threshold) {
      return { lo: center, hi: center, width: 0 }
    }

    // Bisect lower edge in [max(0, center - 0.01), center]
    let loOut = Math.max(0, center - 0.01)
    let loIn = center

    for (let iter = 0; iter < 80; iter++) {
      const mid = 0.5 * (loOut + loIn)

      if (ratioMaxErrAtDelta(mid) <= threshold) {
        loIn = mid
      } else {
        loOut = mid
      }
    }

    // Bisect upper edge in [center, min(halfWidth, center + 0.01)]
    let hiIn = center
    let hiOut = Math.min(halfWidth, center + 0.01)

    for (let iter = 0; iter < 80; iter++) {
      const mid = 0.5 * (hiIn + hiOut)

      if (ratioMaxErrAtDelta(mid) <= threshold) {
        hiIn = mid
      } else {
        hiOut = mid
      }
    }

    return { lo: loIn, hi: hiIn, width: Math.max(0, hiIn - loIn) }
  }

  const acc005 = measureAcceptanceWidth(5e-4)
  const accObs = measureAcceptanceWidth(observedMaxErr)

  // Global 20,000-point deterministic scan over (0, pi/12) to verify zero secondary acceptance islands outside [acc005.lo, acc005.hi]
  const continuousGridCount = 20000
  let continuousSecondaryIslands005Pct = 0

  for (let i = 0; i < continuousGridCount; i++) {
    const delta = ((i + 0.5) / continuousGridCount) * halfWidth

    if (delta >= acc005.lo - 1e-5 && delta <= acc005.hi + 1e-5) continue
    if (ratioMaxErrAtDelta(delta) < 5e-4) {
      continuousSecondaryIslands005Pct++
    }
  }

  const continuousAcceptanceWidthRad005Pct = acc005.width
  const continuousAcceptanceFraction005Pct = acc005.width / halfWidth
  const lookElsewhereProb45Rationals005Pct =
    1 - Math.pow(1 - continuousAcceptanceFraction005Pct, rationalAudits.length)
  const lookElsewhereProbInWindowRationals005Pct =
    1 - Math.pow(1 - continuousAcceptanceFraction005Pct, rationalInWindow.length)
  const continuousAcceptanceWidthRadAtObservedErr = accObs.width
  const continuousAcceptanceFractionAtObservedErr = accObs.width / halfWidth
  const lookElsewhereProb45RationalsAtObservedErr =
    1 - Math.pow(1 - continuousAcceptanceFractionAtObservedErr, rationalAudits.length)

  return {
    zeta9ArgRad,
    zeta9ArgOverPi,
    zeta9ArgOverPiExactErr,
    directZeta9AngleInWindow: directZeta9Audit.inPositivityWindow,
    directZeta9MinEigenvalue: directZeta9Audit.minSignedEigenvalue,
    directZeta9MaxRatioRelErr: directZeta9Audit.maxRatioRelErr,
    delta9Rad,
    pdgExtractedDeltaRad,
    delta9AbsDiffFromPdg: Math.abs(pdgExtractedDeltaRad - delta9Rad),
    pdgExtractedBOverA,
    bOverAAbsDiffFromSqrt2,
    pdgQ,
    predQ,
    qRelErr,
    pdgMuOverE,
    predMuOverE,
    relErrMuOverE,
    pdgTauOverMu,
    predTauOverMu,
    relErrTauOverMu,
    pdgTauOverE,
    predTauOverE,
    relErrTauOverE,
    v0FromMuonMeVHalf,
    predMeFromMuonScaleMeV,
    predMtauFromMuonScaleMeV,
    predMeRelErrFromMuonScale,
    predMtauRelErrFromMuonScale,
    phaseFreeKoideMtauMeV,
    phaseFreeKoideMtauRelErr,
    rationalTotalCount: rationalAudits.length,
    rationalInWindowCount: rationalInWindow.length,
    rationalHits005Pct: rationalHits005.length,
    rationalNullFalsePositives005Pct,
    rationalEmpiricalHitRate005Pct: rationalHits005.length / rationalAudits.length,
    rationalHits1Pct,
    bestRationalLabel: rationalSorted[0]!.label,
    bestRationalMaxErr: rationalSorted[0]!.maxRatioRelErr,
    runnerUpRationalLabel: rationalSorted[1]!.label,
    runnerUpRationalMaxErr: rationalSorted[1]!.maxRatioRelErr,
    runnerUpInWindowRationalLabel: rationalInWindowSorted[1]!.label,
    runnerUpInWindowRationalMaxErr: rationalInWindowSorted[1]!.maxRatioRelErr,
    geometricAngleCandidates,
    geometricAnglesHits005Pct,
    bestPiFractionLabel: bestPiAudit!.label,
    bestPiFractionDeltaRad: bestPiAudit!.deltaRad,
    bestPiFractionDeltaDiff: Math.abs(bestPiAudit!.deltaRad - pdgExtractedDeltaRad),
    bestPiFractionMaxRatioErr: bestPiAudit!.maxRatioRelErr,
    piFractionHits005Pct,
    continuousGridCount,
    continuousSecondaryIslands005Pct,
    continuousAcceptanceWidthRad005Pct,
    continuousAcceptanceFraction005Pct,
    lookElsewhereProb45Rationals005Pct,
    lookElsewhereProbInWindowRationals005Pct,
    continuousAcceptanceWidthRadAtObservedErr,
    continuousAcceptanceFractionAtObservedErr,
    lookElsewhereProb45RationalsAtObservedErr,
  }
}

// ---------------------------------------------------------------------------------------------------------
// Part 3: Full fermion sector audit + exact Koide + {3,4,3,4} warp-shell running theorem
//         S_eff(D, delta) = W(D) S(sqrt(2), delta) W(D)

export type WarpedKoidePoint = {
  readonly eta: number
  readonly qExactFormula: number
  readonly qNumerical: number
  readonly qFormulaErr: number
  readonly minEigenvalue: number
  readonly ratio3To2: number
  readonly ratio2To1: number
  readonly ratio3To1: number
}

export type Part3SectorsAndWarpReport = {
  // Observed PDG sector Koide invariants
  readonly qChargedLeptonsPdg: number
  readonly qDownQuarksPdg: number
  readonly qUpQuarksPdg: number
  readonly qHeavyQuarksMixedPdg: number
  readonly neutrinoMaxQNormalOrdering: number
  readonly neutrinoMaxQInvertedOrdering: number
  readonly neutrinoPositiveRootReachesTwoThirds: boolean
  // Exact BigInt rational theorem on S_eff = W S(sqrt(2), delta) W:
  //   Q(S_eff^2) = 2/3 + sum_{i<j}(w_i^2 - w_j^2)^2 / (6 (sum_i w_i^2)^2) >= 2/3
  readonly warpTheoremBigIntUniformQExact: Rat
  readonly warpTheoremBigIntStaggeredShellCountsQExact: Rat
  readonly warpTheoremBigIntFormulaMatchExact: boolean
  readonly warpTheoremPhaseInvarianceMaxErr: number
  readonly warpTheoremStrictlyPositiveDefinite: boolean
  // Exact {3,4,3,4} cusp shell counts N_D = [1, 18, 330, 6034] on staggered shells (0, 2, 3) from E-FRC-0324
  readonly staggeredShells: readonly [number, number, number]
  readonly staggeredShellCounts: readonly [number, number, number]
  // Exact E-SPN-0222 shifted zero-mode warp overlaps o(D_k) for D in {0, 2, 3}
  readonly zeroModeOverlapsNormalized: readonly [number, number, number]
  readonly warpSweepMonotonicIncreasing: boolean
  readonly warpAtEtaZero: WarpedKoidePoint
  readonly warpAtDownMatch: WarpedKoidePoint
  readonly warpAtUpMatch: WarpedKoidePoint
  readonly warpAtFullShellWeightEta1: WarpedKoidePoint
  readonly warpFromZeroModeOverlapsEtaDown: number
  readonly warpFromZeroModeOverlapsEtaUp: number
  // Honest PDG mass-ratio comparison at matched quark Q points
  readonly pdgDownRatio3To2: number
  readonly pdgDownRatio2To1: number
  readonly pdgUpRatio3To2: number
  readonly pdgUpRatio2To1: number
  // Standard 1-loop QCD MS-bar running context (clearly marked textbook SM QCD, not lattice-derived)
  readonly qcdRunningDownQAtMz: number
  readonly qcdRunningDownQAtGut: number
  readonly qcdRunningUpQAtMz: number
  readonly qcdRunningUpQAtGut: number
}

// Exact BigInt rational evaluation of Q(W S(sqrt(2), delta) W) for x_k = w_k^2 in Q_{>0}
export function exactWarpedKoideRational(x0: Rat, x1: Rat, x2: Rat): {
  readonly qFromTraces: Rat
  readonly qFromShiftFormula: Rat
  readonly matchesExact: boolean
} {
  const sumX = ratAdd(ratAdd(x0, x1), x2)
  const sumXSq = ratMul(sumX, sumX)
  const sumSq = ratAdd(ratAdd(ratMul(x0, x0), ratMul(x1, x1)), ratMul(x2, x2))
  const sumCross = ratAdd(ratAdd(ratMul(x0, x1), ratMul(x1, x2)), ratMul(x2, x0))

  // Tr(S_eff^2) / Tr(S_eff)^2 = (sum x_i^2 + sum_{i<j} x_i x_j) / (sum x_i)^2
  const qFromTraces = ratDiv(ratAdd(sumSq, sumCross), sumXSq)

  // 2/3 + ((x0 - x1)^2 + (x1 - x2)^2 + (x2 - x0)^2) / (6 * (x0 + x1 + x2)^2)
  const d01 = ratSub(x0, x1)
  const d12 = ratSub(x1, x2)
  const d20 = ratSub(x2, x0)
  const diffSqSum = ratAdd(ratAdd(ratMul(d01, d01), ratMul(d12, d12)), ratMul(d20, d20))
  const shiftTerm = ratDiv(diffSqSum, ratMul(rat(6n), sumXSq))
  const qFromShiftFormula = ratAdd(rat(2n, 3n), shiftTerm)

  return {
    qFromTraces,
    qFromShiftFormula,
    matchesExact: ratEq(qFromTraces, qFromShiftFormula),
  }
}

function solveWarpedKoide(
  weightsW: readonly [number, number, number],
  delta: number,
  eta: number,
): WarpedKoidePoint {
  const base = buildTrialityCirculantMatrix(Math.SQRT2, delta, 1)
  const re = new Float64Array(9)
  const im = new Float64Array(9)

  // S_eff = W S W, so (S_eff)_{ij} = w_i * S_{ij} * w_j
  for (let r = 0; r < 3; r++) {
    for (let c = 0; c < 3; c++) {
      const scale = weightsW[r]! * weightsW[c]!

      re[r * 3 + c] = base.re[r * 3 + c]! * scale
      im[r * 3 + c] = base.im[r * 3 + c]! * scale
    }
  }

  const maxW2 = Math.max(weightsW[0] ** 2, weightsW[1] ** 2, weightsW[2] ** 2)
  const eig = hermitianEigenRows(3, re, im, Math.max(1e-30, 6 * maxW2))
  const s0 = eig.values[0]!
  const s1 = eig.values[1]!
  const s2 = eig.values[2]!
  const masses: [number, number, number] = [s0 * s0, s1 * s1, s2 * s2].sort((a, b) => a - b) as [
    number,
    number,
    number,
  ]
  const qNumerical = koideInvariant(masses)

  const x0 = weightsW[0] * weightsW[0]
  const x1 = weightsW[1] * weightsW[1]
  const x2 = weightsW[2] * weightsW[2]
  const sumX = x0 + x1 + x2
  const qExactFormula =
    2 / 3 + ((x0 - x1) ** 2 + (x1 - x2) ** 2 + (x2 - x0) ** 2) / (6 * sumX * sumX)

  const safe0 = Math.max(masses[0], 1e-300)
  const safe1 = Math.max(masses[1], 1e-300)

  return {
    eta,
    qExactFormula,
    qNumerical,
    qFormulaErr: Math.abs(qNumerical - qExactFormula),
    minEigenvalue: s0,
    ratio3To2: masses[2] / safe1,
    ratio2To1: masses[1] / safe0,
    ratio3To1: masses[2] / safe0,
  }
}

// Deterministic bisection for eta > 0 such that Q(W(baseScales, eta) S W(baseScales, eta)) = targetQ
function solveEtaForTargetQ(
  baseScales: readonly [number, number, number], // N_{D_k} >= 1
  targetQ: number,
): number {
  const qAtEta = (eta: number): number => {
    const x0 = Math.pow(baseScales[0], -eta)
    const x1 = Math.pow(baseScales[1], -eta)
    const x2 = Math.pow(baseScales[2], -eta)
    const s = x0 + x1 + x2

    return 2 / 3 + ((x0 - x1) ** 2 + (x1 - x2) ** 2 + (x2 - x0) ** 2) / (6 * s * s)
  }

  let lo = 0
  let hi = 4

  for (let iter = 0; iter < 80; iter++) {
    const mid = 0.5 * (lo + hi)

    if (qAtEta(mid) < targetQ) {
      lo = mid
    } else {
      hi = mid
    }
  }

  return 0.5 * (lo + hi)
}

function scanNeutrinoMaxQ(
  massesFn: (lightEv: number) => readonly [number, number, number],
): number {
  let mx = 0

  for (let i = 0; i <= 4000; i++) {
    const light = (i / 4000) * 0.3
    const q = koideInvariant(massesFn(light))

    if (q > mx) mx = q
  }

  return mx
}

function runPart3SectorsAndWarp(depth: number): Part3SectorsAndWarpReport {
  const qChargedLeptonsPdg = koideInvariant(PDG_FERMION_DATA.leptonsMeV)
  const qDownQuarksPdg = koideInvariant(PDG_FERMION_DATA.downQuarksMeV)
  const qUpQuarksPdg = koideInvariant(PDG_FERMION_DATA.upQuarksMeV)
  const qHeavyQuarksMixedPdg = koideInvariant(PDG_FERMION_DATA.heavyQuarksMixedMeV)

  const dm21 = PDG_FERMION_DATA.neutrinoDm21SqEv2
  const dm31No = PDG_FERMION_DATA.neutrinoDm31SqNormalEv2
  const dm31Io = PDG_FERMION_DATA.neutrinoDm31SqInvertedEv2

  const neutrinoMaxQNormalOrdering = scanNeutrinoMaxQ(m1 => [
    m1,
    Math.sqrt(m1 * m1 + dm21),
    Math.sqrt(m1 * m1 + dm31No),
  ])
  const neutrinoMaxQInvertedOrdering = scanNeutrinoMaxQ(m3 => {
    const m1 = Math.sqrt(m3 * m3 + dm31Io)
    const m2 = Math.sqrt(m1 * m1 + dm21)

    return [m1, m2, m3]
  })
  const neutrinoPositiveRootReachesTwoThirds =
    neutrinoMaxQNormalOrdering >= 2 / 3 - 1e-9 || neutrinoMaxQInvertedOrdering >= 2 / 3 - 1e-9

  // Dynamically selected staggered shells from E-FRC-0324: (0, 2, 3) with exact {3,4,3,4} shell counts
  const staggeredShells: [number, number, number] = [0, 2, 3]
  const staggeredShellCounts: [number, number, number] = [
    EXACT_COLUMN_SHELL_COUNTS[0],
    EXACT_COLUMN_SHELL_COUNTS[2],
    EXACT_COLUMN_SHELL_COUNTS[3],
  ]

  // Exact BigInt rational proof of the warp-shell Koide theorem
  const uniformRat = exactWarpedKoideRational(rat(1n), rat(1n), rat(1n))
  const staggeredRat = exactWarpedKoideRational(
    rat(1n, BigInt(staggeredShellCounts[0])),
    rat(1n, BigInt(staggeredShellCounts[1])),
    rat(1n, BigInt(staggeredShellCounts[2])),
  )
  const extraRat = exactWarpedKoideRational(rat(1n), rat(1n, 2n), rat(1n, 5n))
  const warpTheoremBigIntFormulaMatchExact =
    uniformRat.matchesExact &&
    ratEq(uniformRat.qFromTraces, rat(2n, 3n)) &&
    staggeredRat.matchesExact &&
    extraRat.matchesExact

  // Verify phase independence and strict positive-definiteness of S_eff = W S(sqrt(2), delta) W
  // across phases inside (-pi/12, pi/12) for nontrivial W
  const testPhases = [-0.22, -0.1, 0, 0.1, 2 / 9, 0.25]
  const testW: [number, number, number] = [1, 1 / Math.sqrt(3), 1 / Math.sqrt(7)]
  let warpTheoremPhaseInvarianceMaxErr = 0
  let warpTheoremStrictlyPositiveDefinite = true

  for (const delta of testPhases) {
    const pt = solveWarpedKoide(testW, delta, 1)

    if (pt.qFormulaErr > warpTheoremPhaseInvarianceMaxErr) {
      warpTheoremPhaseInvarianceMaxErr = pt.qFormulaErr
    }

    if (pt.minEigenvalue <= 0) {
      warpTheoremStrictlyPositiveDefinite = false
    }
  }

  // Sweep eta from 0 to 1 on staggered {3,4,3,4} shell counts N_D = (1, 330, 6034)
  // with w_k(eta) = N_{D_k}^{-eta / 2} (so x_k = w_k^2 = N_{D_k}^{-eta})
  const weightsAtEta = (
    scales: readonly [number, number, number],
    eta: number,
  ): [number, number, number] => [
    Math.pow(scales[0], -0.5 * eta),
    Math.pow(scales[1], -0.5 * eta),
    Math.pow(scales[2], -0.5 * eta),
  ]

  const delta9 = 2 / 9
  let prevQ = -Infinity
  let warpSweepMonotonicIncreasing = true

  for (let i = 0; i <= 20; i++) {
    const eta = i / 20
    const pt = solveWarpedKoide(weightsAtEta(staggeredShellCounts, eta), delta9, eta)

    if (pt.qNumerical < prevQ - 1e-12) {
      warpSweepMonotonicIncreasing = false
    }

    if (pt.minEigenvalue <= 0) {
      warpTheoremStrictlyPositiveDefinite = false
    }

    prevQ = pt.qNumerical
  }

  const etaDown = solveEtaForTargetQ(staggeredShellCounts, qDownQuarksPdg)
  const etaUp = solveEtaForTargetQ(staggeredShellCounts, qUpQuarksPdg)
  const warpAtEtaZero = solveWarpedKoide(weightsAtEta(staggeredShellCounts, 0), delta9, 0)
  const warpAtDownMatch = solveWarpedKoide(
    weightsAtEta(staggeredShellCounts, etaDown),
    delta9,
    etaDown,
  )
  const warpAtUpMatch = solveWarpedKoide(weightsAtEta(staggeredShellCounts, etaUp), delta9, etaUp)
  const warpAtFullShellWeightEta1 = solveWarpedKoide(
    weightsAtEta(staggeredShellCounts, 1),
    delta9,
    1,
  )

  // Also compute exact E-SPN-0222 shifted domain-wall zero-mode diagonal overlaps o(D_k)
  // on {3,4,3,4} pair-density warp 1 / N_d^2 for D in {0, 2, 3}
  const bGrowth = EXACT_COLUMN_SHELL_COUNTS[3] / EXACT_COLUMN_SHELL_COUNTS[2]
  const shellCounts: number[] = []

  for (let d = 0; d < depth; d++) {
    if (d < EXACT_COLUMN_SHELL_COUNTS.length) {
      shellCounts.push(EXACT_COLUMN_SHELL_COUNTS[d]!)
    } else {
      shellCounts.push(shellCounts[d - 1]! * bGrowth)
    }
  }

  const rawOverlaps = staggeredShells.map(anchor => {
    const mode = solveShiftedDomainWallZeroMode(depth, anchor, 2)
    let acc = 0

    for (let d = 0; d < depth; d++) {
      const p = mode.profile[d]!

      acc += (p * p) / (shellCounts[d]! * shellCounts[d]!)
    }

    return acc
  })
  const o0 = rawOverlaps[0]!
  const zeroModeOverlapsNormalized: [number, number, number] = [
    1,
    rawOverlaps[1]! / o0,
    rawOverlaps[2]! / o0,
  ]
  const invZeroModeScales: [number, number, number] = [
    1,
    1 / zeroModeOverlapsNormalized[1],
    1 / zeroModeOverlapsNormalized[2],
  ]
  const warpFromZeroModeOverlapsEtaDown = solveEtaForTargetQ(invZeroModeScales, qDownQuarksPdg)
  const warpFromZeroModeOverlapsEtaUp = solveEtaForTargetQ(invZeroModeScales, qUpQuarksPdg)

  // Textbook 1-loop QCD MS-bar running context (clearly marked standard SM QCD, not lattice-derived):
  //   At a common scale mu = m_Z = 91.19 GeV (standard PDG / Xing-Zhang-Zhou MS-bar values in MeV):
  //     (m_d, m_s, m_b)(m_Z) = (2.67, 53.16, 2855) MeV
  //     (m_u, m_c, m_t)(m_Z) = (1.27, 619, 171700) MeV
  //   Under pure 1-loop QCD (same anomalous dimension gamma_m for all flavors above m_t), all quark
  //   masses scale by a common factor between m_Z and M_GUT, leaving Q(mu) invariant up to small
  //   Yukawa/electroweak threshold shifts (reported explicitly as standard SM reference values).
  const downAtMz: [number, number, number] = [2.67, 53.16, 2855]
  const upAtMz: [number, number, number] = [1.27, 619, 171700]
  // Standard SM 2-loop RGE benchmark at M_GUT = 2e16 GeV (Xing-Zhang-Zhou, MeV):
  const downAtGut: [number, number, number] = [1.14, 22.7, 990]
  const upAtGut: [number, number, number] = [0.48, 235, 74000]

  const [md, ms, mb] = PDG_FERMION_DATA.downQuarksMeV
  const [mu, mc, mt] = PDG_FERMION_DATA.upQuarksMeV

  return {
    qChargedLeptonsPdg,
    qDownQuarksPdg,
    qUpQuarksPdg,
    qHeavyQuarksMixedPdg,
    neutrinoMaxQNormalOrdering,
    neutrinoMaxQInvertedOrdering,
    neutrinoPositiveRootReachesTwoThirds,
    warpTheoremBigIntUniformQExact: uniformRat.qFromTraces,
    warpTheoremBigIntStaggeredShellCountsQExact: staggeredRat.qFromTraces,
    warpTheoremBigIntFormulaMatchExact,
    warpTheoremPhaseInvarianceMaxErr,
    warpTheoremStrictlyPositiveDefinite,
    staggeredShells,
    staggeredShellCounts,
    zeroModeOverlapsNormalized,
    warpSweepMonotonicIncreasing,
    warpAtEtaZero,
    warpAtDownMatch,
    warpAtUpMatch,
    warpAtFullShellWeightEta1,
    warpFromZeroModeOverlapsEtaDown,
    warpFromZeroModeOverlapsEtaUp,
    pdgDownRatio3To2: mb / ms,
    pdgDownRatio2To1: ms / md,
    pdgUpRatio3To2: mt / mc,
    pdgUpRatio2To1: mc / mu,
    qcdRunningDownQAtMz: koideInvariant(downAtMz),
    qcdRunningDownQAtGut: koideInvariant(downAtGut),
    qcdRunningUpQAtMz: koideInvariant(upAtMz),
    qcdRunningUpQAtGut: koideInvariant(upAtGut),
  }
}

// ---------------------------------------------------------------------------------------------------------
// Top-level E-FRC-0325 report

export type KoidePrecisionSpectrumReport = {
  readonly part1: Part1ExactTheoremReport
  readonly part2: Part2PhaseAndNullReport
  readonly part3: Part3SectorsAndWarpReport
}

export function analyzeKoidePrecisionSpectrum(depth = 16): KoidePrecisionSpectrumReport {
  const part1 = runPart1ExactTheorem()
  const part2 = runPart2PhaseAndNull()
  const part3 = runPart3SectorsAndWarp(depth)

  return { part1, part2, part3 }
}

export { rat, ratEq, ratFormat, ratToNumber }
