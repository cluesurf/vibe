// GEOMETRIC ELECTROWEAK HIERARCHY ON {3,4,3,4} (D_EW ~ 13 SHELLS),
// EXACT 2-LOOP SO(10) -> PATI-SALAM (SU(4)_C x SU(2)_L x SU(2)_R) -> SM GAUGE UNIFICATION,
// NEUTRINO SEESAW SCALE M_R = M_PS, AND HONEST BARE-LATTICE ALPHA(0) TEST
// (E-FRC-0328, Boundary #2).
//
// Three deterministic parts (zero Math.random):
//
//   Part 1 - Geometric Solution to the Electroweak Hierarchy Problem on {3,4,3,4}:
//     Uses the exact {3,4,3,4} cusp per-column shell counts N_D = [1, 18, 330, 6034, ...]
//     (EXACT_COLUMN_SHELL_COUNTS from E-GRV-0157), cusp branching factor b = 6034/330 = 18.28484848,
//     and asymptotic bulk Perron growth lambda = warpFactor() = 18.27870777 to compute the exact
//     discrete shell depth D needed to generate M_Planck / v_EW = 4.9585e16 via the discrete
//     Randall-Sundrum / {3,4,3,4} cusp warp law M(D) / M_UV = N_D^{-1} (or b^{-D}). Shows that
//     D_EW = 13.23 discrete shells (b^13 = 2.55e16, N_13 = 2.52e16) compresses 16.7 decades into
//     only 13 integer shells without 10^16 fine-tuning, decomposes D_EW = D(Pl->GUT) + D(GUT->PS)
//     + D(PS->EW) across the Part 2 unification scales, and tests flat-mesh (b = 1) and Euclidean
//     polynomial (D + 1)^3 negative controls.
//
//   Part 2 - Exact 2-Loop SO(10) -> Pati-Salam (SU(4)_C x SU(2)_L x SU(2)_R) -> SM Unification:
//     Verifies directly in exact BigInt rationals on E-FRC-0324's 16-state Spin(10) spinor that
//     16 = (4, 2, 1) + (4bar, 1, 2), Tr_16(T_15^2) = Tr_16((T_3^L)^2) = Tr_16((T_3^R)^2) = 2,
//     and hypercharge Y = (B-L)/2 + T_3^R yields exact Pati-Salam matching weights
//     alpha_1^{-1}(M_PS) = (3/5) alpha_{2R}^{-1}(M_PS) + (2/5) alpha_{4C}^{-1}(M_PS).
//     Derives exact 1-loop (b_4C, b_2L, b_2R) and 2-loop b_{ij}^{PS} in exact BigInt rationals
//     from exact SU(N) Dynkin indices of the SO(10) representations: 3 generations of
//     (4,2,1) + (4bar,1,2), minimal bidoublet (1,2,2), and SU(2)_R-breaking (10,1,3).
//     Solves the coupled 2-loop RG boundary-value problem (SM M_Z->M_PS, exact matching at M_PS,
//     PS M_PS->M_GUT, exact SO(10) unification) to <= 1e-12, verifying:
//       (1) exact 3-coupling unification <= 1e-12 (closing E-FRC-0326's 4.91 non-SUSY mismatch)
//       (2) exact backward running from sin^2(theta_W)_GUT = 3/8 to PDG 0.23122 (<= 1e-10)
//       (3) proton-decay safe M_GUT > 10^{15.5} GeV AND Type-I seesaw window M_PS ~ 10^{11..13.8} GeV
//       (4) 2-loop RK4 round-trip reversibility M_Z -> M_PS -> M_GUT -> M_PS -> M_Z <= 1e-11
//     plus the no-PS negative control (M_PS = M_GUT recovering E-FRC-0326's 4.91 failure) and
//     three companion SO(10) Pati-Salam scalar variants for complete scientific transparency.
//
//   Part 3 - Honest Bare-Lattice alpha(0) Prediction Test (Zero Numerology):
//     Computes Vibe Theory's canonical unaliased single-face {3,4,3,4} Riccati stiffness
//     K_eff = 1.0125321220 (lateral links [1, 4, 20, 100], cumulative 5^D, matching E-GRV-0157 & Vibe/Geometry.lean),
//     G_eff = 0.07859254, 1/G_eff = 4 pi K_eff = 12.7239, and bare lattice invariant
//     alpha_lat^{-1} = 4 pi K_eff ln(lambda) = 36.9722 (and 4 pi K_eff ln(b_cusp) = 36.9765).
//     Runs alpha_lat^{-1} downward through the exact Part 2 2-loop SO(10) -> PS -> SM -> QED chain
//     to M_Z and q^2 = 0 with zero tuning, compares against PDG 127.951 and CODATA 137.035999177,
//     demonstrates that unlogged 1/G_eff = 12.7239 hits a QCD Landau pole well above M_Z, and
//     reports transparently what is solved vs what remains open.

import {
  INVERSE_ALPHA,
  INVERSE_ALPHA_DELTA,
  warpFactor,
} from '@/code/measure/coupling-candidates'
import {
  EXACT_COLUMN_SHELL_COUNTS,
  singleFaceLateralLinksPerNeighbor,
} from '@/code/measure/pair-density-gravity-slope'
import {
  analyzeSo10ThreeGenerations,
  rat,
  ratAdd,
  ratDiv,
  ratEq,
  ratFormat,
  ratIsZero,
  ratMul,
  ratToNumber,
  type Rat,
  type Spin10StateInfo,
} from '@/code/measure/so10-three-generations'

// ---------------------------------------------------------------------------------------------------------
// Physical constants (PDG 2024 / CODATA 2022, deterministic)

const M_PLANCK_GEV = 1.22089e19
const M_PLANCK_REDUCED_GEV = M_PLANCK_GEV / Math.sqrt(8 * Math.PI)
const V_EW_GEV = 246.21965
const M_Z_GEV = 91.1876
const M_PROTON_GEV = 0.93827208816
const HBAR_GEV_S = 6.582119569e-25
const SECONDS_PER_YEAR = 3.15576e7

// PDG 2024 MS-bar electroweak and strong inputs at M_Z (identical to E-FRC-0326)
const ALPHA_EM_INV_MZ_PDG = 127.951
const SIN2_THETA_W_MZ_PDG = 0.23122
const ALPHA_3_MZ_PDG = 0.118

type Vec3 = readonly [number, number, number]

// ---------------------------------------------------------------------------------------------------------
// Exact BigInt rational SU(N) representation algebra & Machacek-Vaughn 2-loop beta derivation

type PsRepSpec = {
  readonly label: string
  readonly kind: 'weyl_fermion' | 'complex_scalar' | 'real_scalar'
  readonly multiplicity: bigint // N_g for fermions, copy count for scalars
  readonly dim: readonly [Rat, Rat, Rat] // (d_4C, d_2L, d_2R)
  readonly s2: readonly [Rat, Rat, Rat] // Dynkin index S_2(R)
  readonly c2: readonly [Rat, Rat, Rat] // Quadratic Casimir C_2(R)
}

export type PsBetaCertificate = {
  readonly label: string
  readonly b1Rat: readonly [Rat, Rat, Rat]
  readonly b2Rat: readonly (readonly [Rat, Rat, Rat])[]
  readonly b1Num: readonly [number, number, number]
  readonly b2Num: readonly (readonly [number, number, number])[]
  readonly b1Formatted: readonly [string, string, string]
  readonly dynkinCasimirIdentitiesExact: boolean // S_2(R) * dim(G) === dim(R) * C_2(R) for all reps
  readonly twoLoopReciprocityExact: boolean // dim(G_i) * b_{ij} === dim(G_j) * b_{ji} for all i != j
}

// Canonical SU(N) Dynkin index S_2 and Casimir C_2 from exact BigInt representation formulas
function suNDynkinCasimir(
  n: bigint,
  rep: '1' | 'fund' | 'sym2' | 'adj',
): { readonly dim: Rat; readonly s2: Rat; readonly c2: Rat } {
  if (rep === '1') {
    return { dim: rat(1n), s2: rat(0n), c2: rat(0n) }
  }

  if (rep === 'fund') {
    return {
      dim: rat(n),
      s2: rat(1n, 2n),
      c2: rat(n * n - 1n, 2n * n),
    }
  }

  if (rep === 'sym2') {
    return {
      dim: rat(n * (n + 1n), 2n),
      s2: rat(n + 2n, 2n),
      c2: rat((n - 1n) * (n + 2n), n),
    }
  }

  // Adjoint
  return {
    dim: rat(n * n - 1n),
    s2: rat(n),
    c2: rat(n),
  }
}

function makePsRep(
  label: string,
  kind: PsRepSpec['kind'],
  multiplicity: bigint,
  r4: '1' | 'fund' | 'sym2' | 'adj',
  r2L: '1' | 'fund' | 'sym2' | 'adj',
  r2R: '1' | 'fund' | 'sym2' | 'adj',
): PsRepSpec {
  const g4 = suNDynkinCasimir(4n, r4)
  const g2L = suNDynkinCasimir(2n, r2L)
  const g2R = suNDynkinCasimir(2n, r2R)

  return {
    label,
    kind,
    multiplicity,
    dim: [g4.dim, g2L.dim, g2R.dim],
    s2: [g4.s2, g2L.s2, g2R.s2],
    c2: [g4.c2, g2L.c2, g2R.c2],
  }
}

// Derive exact 1-loop (b_4C, b_2L, b_2R) and 2-loop b_{ij}^{PS} in exact BigInt rationals
// using Machacek-Vaughn (1983) formulas for G_PS = SU(4)_C x SU(2)_L x SU(2)_R
function deriveExactPatiSalamBeta(
  label: string,
  scalarReps: readonly PsRepSpec[],
): PsBetaCertificate {
  const zero = rat(0n)
  const dimG: readonly [Rat, Rat, Rat] = [rat(15n), rat(3n), rat(3n)]
  const c2G: readonly [Rat, Rat, Rat] = [rat(4n), rat(2n), rat(2n)]

  // 3 generations of SO(10) 16 = (4, 2, 1) + (4bar, 1, 2) Weyl fermions
  const fermionReps: readonly PsRepSpec[] = [
    makePsRep('F_L=(4,2,1)', 'weyl_fermion', 3n, 'fund', 'fund', '1'),
    makePsRep('F_R=(4bar,1,2)', 'weyl_fermion', 3n, 'fund', '1', 'fund'),
  ]
  const allReps = [...fermionReps, ...scalarReps]

  // Verify exact group-theoretic identity S_2(R) * dim(G) === dim(R) * C_2(R) for every rep & factor
  let dynkinCasimirIdentitiesExact = true

  for (const rep of allReps) {
    for (let i = 0; i < 3; i++) {
      const lhs = ratMul(rep.s2[i]!, dimG[i]!)
      const rhs = ratMul(rep.dim[i]!, rep.c2[i]!)

      if (!ratEq(lhs, rhs)) {
        dynkinCasimirIdentitiesExact = false
      }
    }
  }

  const b1: Rat[] = [
    ratMul(rat(-11n, 3n), c2G[0]),
    ratMul(rat(-11n, 3n), c2G[1]),
    ratMul(rat(-11n, 3n), c2G[2]),
  ]
  const b2: Rat[][] = [
    [ratMul(rat(-34n, 3n), ratMul(c2G[0], c2G[0])), zero, zero],
    [zero, ratMul(rat(-34n, 3n), ratMul(c2G[1], c2G[1])), zero],
    [zero, zero, ratMul(rat(-34n, 3n), ratMul(c2G[2], c2G[2]))],
  ]

  for (const rep of allReps) {
    const multCopy = rat(rep.multiplicity)
    const eta =
      rep.kind === 'weyl_fermion'
        ? rat(1n)
        : rep.kind === 'complex_scalar'
          ? rat(1n)
          : rat(1n, 2n)

    for (let i = 0; i < 3; i++) {
      const otherDim = ratMul(rep.dim[(i + 1) % 3]!, rep.dim[(i + 2) % 3]!)
      const s2Total = ratMul(multCopy, ratMul(rep.s2[i]!, otherDim))

      if (rep.kind === 'weyl_fermion') {
        b1[i] = ratAdd(b1[i]!, ratMul(rat(2n, 3n), s2Total))
      } else {
        b1[i] = ratAdd(b1[i]!, ratMul(ratMul(rat(1n, 3n), eta), s2Total))
      }

      for (let j = 0; j < 3; j++) {
        if (i === j) {
          if (rep.kind === 'weyl_fermion') {
            const bracket = ratAdd(ratMul(rat(10n, 3n), c2G[i]!), ratMul(rat(2n), rep.c2[i]!))

            b2[i]![i] = ratAdd(b2[i]![i]!, ratMul(bracket, s2Total))
          } else {
            const bracket = ratAdd(ratMul(rat(2n, 3n), c2G[i]!), ratMul(rat(4n), rep.c2[i]!))

            b2[i]![i] = ratAdd(b2[i]![i]!, ratMul(eta, ratMul(bracket, s2Total)))
          }
        } else {
          if (rep.kind === 'weyl_fermion') {
            b2[i]![j] = ratAdd(b2[i]![j]!, ratMul(rat(2n), ratMul(s2Total, rep.c2[j]!)))
          } else {
            b2[i]![j] = ratAdd(
              b2[i]![j]!,
              ratMul(ratMul(rat(4n), eta), ratMul(s2Total, rep.c2[j]!)),
            )
          }
        }
      }
    }
  }

  // Verify exact off-diagonal 2-loop reciprocity: dim(G_i) * b_{ij} === dim(G_j) * b_{ji}
  let twoLoopReciprocityExact = true

  for (let i = 0; i < 3; i++) {
    for (let j = i + 1; j < 3; j++) {
      const lhs = ratMul(dimG[i]!, b2[i]![j]!)
      const rhs = ratMul(dimG[j]!, b2[j]![i]!)

      if (!ratEq(lhs, rhs)) {
        twoLoopReciprocityExact = false
      }
    }
  }

  const b1Rat: readonly [Rat, Rat, Rat] = [b1[0]!, b1[1]!, b1[2]!]
  const b2Rat: readonly (readonly [Rat, Rat, Rat])[] = [
    [b2[0]![0]!, b2[0]![1]!, b2[0]![2]!],
    [b2[1]![0]!, b2[1]![1]!, b2[1]![2]!],
    [b2[2]![0]!, b2[2]![1]!, b2[2]![2]!],
  ]

  return {
    label,
    b1Rat,
    b2Rat,
    b1Num: [ratToNumber(b1Rat[0]), ratToNumber(b1Rat[1]), ratToNumber(b1Rat[2])],
    b2Num: [
      [ratToNumber(b2Rat[0]![0]!), ratToNumber(b2Rat[0]![1]!), ratToNumber(b2Rat[0]![2]!)],
      [ratToNumber(b2Rat[1]![0]!), ratToNumber(b2Rat[1]![1]!), ratToNumber(b2Rat[1]![2]!)],
      [ratToNumber(b2Rat[2]![0]!), ratToNumber(b2Rat[2]![1]!), ratToNumber(b2Rat[2]![2]!)],
    ],
    b1Formatted: [ratFormat(b1Rat[0]), ratFormat(b1Rat[1]), ratFormat(b1Rat[2])],
    dynkinCasimirIdentitiesExact,
    twoLoopReciprocityExact,
  }
}

// Derive exact 1-loop and 2-loop SM beta coefficients directly from E-FRC-0324's 16 Weyl states + 1 Higgs doublet
function deriveExactSmBeta(states: readonly Spin10StateInfo[]): {
  readonly b1Rat: readonly [Rat, Rat, Rat]
  readonly b2Rat: readonly (readonly [Rat, Rat, Rat])[]
  readonly b1Num: readonly [number, number, number]
  readonly b2Num: readonly (readonly [number, number, number])[]
  readonly exactMatch: boolean
} {
  const zero = rat(0n)
  const nGen = rat(3n)
  const k1Inv = rat(3n, 5n)
  const dimG: readonly [Rat, Rat, Rat] = [rat(1n), rat(3n), rat(8n)]
  const c2Adj: readonly [Rat, Rat, Rat] = [zero, rat(2n), rat(3n)]
  const stateCasimirs = states.map(
    s => [ratMul(k1Inv, ratMul(s.y, s.y)), s.c2Su2L, s.c2Su3] as const,
  )
  const higgsCasimir: readonly [Rat, Rat, Rat] = [
    ratMul(k1Inv, rat(1n, 4n)),
    rat(3n, 4n),
    zero,
  ]
  const higgsComponents = rat(2n)

  const b1: Rat[] = []
  const b2: Rat[][] = []

  for (let i = 0; i < 3; i++) {
    const cg = c2Adj[i]!
    const invDimG = rat(dimG[i]!.den, dimG[i]!.num)
    let sumS2F = zero

    for (const c of stateCasimirs) {
      sumS2F = ratAdd(sumS2F, ratMul(c[i]!, invDimG))
    }

    const sumS2S = ratMul(higgsComponents, ratMul(higgsCasimir[i]!, invDimG))

    b1.push(
      ratAdd(
        ratAdd(ratMul(rat(-11n, 3n), cg), ratMul(ratMul(rat(2n, 3n), nGen), sumS2F)),
        ratMul(rat(1n, 3n), sumS2S),
      ),
    )

    const row: Rat[] = []

    for (let j = 0; j < 3; j++) {
      if (i === j) {
        let fermTerm = zero

        for (const c of stateCasimirs) {
          const s2i = ratMul(c[i]!, invDimG)
          const bracket = ratAdd(ratMul(rat(10n, 3n), cg), ratMul(rat(2n), c[i]!))

          fermTerm = ratAdd(fermTerm, ratMul(bracket, s2i))
        }

        const s2Si = ratMul(higgsCasimir[i]!, invDimG)
        const scalBracket = ratAdd(ratMul(rat(2n, 3n), cg), ratMul(rat(4n), higgsCasimir[i]!))
        const scalTerm = ratMul(higgsComponents, ratMul(scalBracket, s2Si))
        const gaugeTerm = ratMul(rat(-34n, 3n), ratMul(cg, cg))

        row.push(ratAdd(ratAdd(gaugeTerm, ratMul(nGen, fermTerm)), scalTerm))
      } else {
        let fermTerm = zero

        for (const c of stateCasimirs) {
          fermTerm = ratAdd(fermTerm, ratMul(ratMul(c[i]!, invDimG), c[j]!))
        }

        const s2Si = ratMul(higgsCasimir[i]!, invDimG)
        const scalTerm = ratMul(rat(4n), ratMul(higgsComponents, ratMul(s2Si, higgsCasimir[j]!)))

        row.push(ratAdd(ratMul(ratMul(rat(2n), nGen), fermTerm), scalTerm))
      }
    }

    b2.push(row)
  }

  const expectedB1: readonly [Rat, Rat, Rat] = [rat(41n, 10n), rat(-19n, 6n), rat(-7n)]
  const expectedB2: readonly (readonly [Rat, Rat, Rat])[] = [
    [rat(199n, 50n), rat(27n, 10n), rat(44n, 5n)],
    [rat(9n, 10n), rat(35n, 6n), rat(12n)],
    [rat(11n, 10n), rat(9n, 2n), rat(-26n)],
  ]

  let exactMatch = true

  for (let i = 0; i < 3; i++) {
    if (!ratEq(b1[i]!, expectedB1[i]!)) exactMatch = false

    for (let j = 0; j < 3; j++) {
      if (!ratEq(b2[i]![j]!, expectedB2[i]![j]!)) exactMatch = false
    }
  }

  const b1Rat: readonly [Rat, Rat, Rat] = [b1[0]!, b1[1]!, b1[2]!]
  const b2Rat: readonly (readonly [Rat, Rat, Rat])[] = [
    [b2[0]![0]!, b2[0]![1]!, b2[0]![2]!],
    [b2[1]![0]!, b2[1]![1]!, b2[1]![2]!],
    [b2[2]![0]!, b2[2]![1]!, b2[2]![2]!],
  ]

  return {
    b1Rat,
    b2Rat,
    b1Num: [ratToNumber(b1Rat[0]), ratToNumber(b1Rat[1]), ratToNumber(b1Rat[2])],
    b2Num: [
      [ratToNumber(b2Rat[0]![0]!), ratToNumber(b2Rat[0]![1]!), ratToNumber(b2Rat[0]![2]!)],
      [ratToNumber(b2Rat[1]![0]!), ratToNumber(b2Rat[1]![1]!), ratToNumber(b2Rat[1]![2]!)],
      [ratToNumber(b2Rat[2]![0]!), ratToNumber(b2Rat[2]![1]!), ratToNumber(b2Rat[2]![2]!)],
    ],
    exactMatch,
  }
}

// ---------------------------------------------------------------------------------------------------------
// Exact BigInt certification of Pati-Salam embedding & matching boundary condition on E-FRC-0324's 16

export type PatiSalamEmbeddingCert = {
  readonly leftMultipletCount: number // 8 states in (4, 2, 1) = Q_L(6) + L_L(2)
  readonly rightMultipletCount: number // 8 states in (4bar, 1, 2) = u_R^c(3) + d_R^c(3) + e_R^c(1) + nu_R^c(1)
  readonly trBMinusLLeft: Rat // exact 0
  readonly trBMinusLRight: Rat // exact 0
  readonly trT15Sq: Rat // exact 2
  readonly trT3LSq: Rat // exact 2
  readonly trT3RSq: Rat // exact 2
  readonly trBMinusLT3R: Rat // exact 0 (orthogonality)
  readonly trYSq: Rat // exact 10/3
  readonly matchingWeight2R: Rat // exact 3/5
  readonly matchingWeight4C: Rat // exact 2/5
  readonly matchingWeightsSumToOne: boolean
  readonly sin2ThetaWGutExact: Rat // exact 3/8
  readonly embeddingExact: boolean
}

function certifyPatiSalamEmbedding(states: readonly Spin10StateInfo[]): PatiSalamEmbeddingCert {
  const zero = rat(0n)
  const half = rat(1n, 2n)
  const threeEighths = rat(3n, 8n)

  let leftMultipletCount = 0
  let rightMultipletCount = 0
  let trBMinusLLeft = zero
  let trBMinusLRight = zero
  let trT15Sq = zero
  let trT3LSq = zero
  let trT3RSq = zero
  let trBMinusLT3R = zero
  let trYSq = zero
  let trHalfBLSq = zero
  let trQSq = zero

  for (const s of states) {
    if (s.su2LDim === 2 && ratIsZero(s.t3R)) {
      leftMultipletCount++
      trBMinusLLeft = ratAdd(trBMinusLLeft, s.bMinusL)
    } else if (s.su2LDim === 1 && !ratIsZero(s.t3R)) {
      rightMultipletCount++
      trBMinusLRight = ratAdd(trBMinusLRight, s.bMinusL)
    }

    const blSq = ratMul(s.bMinusL, s.bMinusL)
    const halfBL = ratMul(half, s.bMinusL)

    trT15Sq = ratAdd(trT15Sq, ratMul(threeEighths, blSq))
    trT3LSq = ratAdd(trT3LSq, ratMul(s.t3L, s.t3L))
    trT3RSq = ratAdd(trT3RSq, ratMul(s.t3R, s.t3R))
    trBMinusLT3R = ratAdd(trBMinusLT3R, ratMul(s.bMinusL, s.t3R))
    trYSq = ratAdd(trYSq, ratMul(s.y, s.y))
    trHalfBLSq = ratAdd(trHalfBLSq, ratMul(halfBL, halfBL))
    trQSq = ratAdd(trQSq, ratMul(s.q, s.q))
  }

  const matchingWeight2R = ratDiv(trT3RSq, trYSq)
  const matchingWeight4C = ratDiv(trHalfBLSq, trYSq)
  const matchingWeightsSumToOne = ratEq(ratAdd(matchingWeight2R, matchingWeight4C), rat(1n))
  const sin2ThetaWGutExact = ratDiv(trT3LSq, trQSq)

  const embeddingExact =
    leftMultipletCount === 8 &&
    rightMultipletCount === 8 &&
    ratIsZero(trBMinusLLeft) &&
    ratIsZero(trBMinusLRight) &&
    ratEq(trT15Sq, rat(2n)) &&
    ratEq(trT3LSq, rat(2n)) &&
    ratEq(trT3RSq, rat(2n)) &&
    ratIsZero(trBMinusLT3R) &&
    ratEq(trYSq, rat(10n, 3n)) &&
    ratEq(matchingWeight2R, rat(3n, 5n)) &&
    ratEq(matchingWeight4C, rat(2n, 5n)) &&
    matchingWeightsSumToOne &&
    ratEq(sin2ThetaWGutExact, rat(3n, 8n))

  return {
    leftMultipletCount,
    rightMultipletCount,
    trBMinusLLeft,
    trBMinusLRight,
    trT15Sq,
    trT3LSq,
    trT3RSq,
    trBMinusLT3R,
    trYSq,
    matchingWeight2R,
    matchingWeight4C,
    matchingWeightsSumToOne,
    sin2ThetaWGutExact,
    embeddingExact,
  }
}

// ---------------------------------------------------------------------------------------------------------
// 2-Loop RK4 RG Integrator, Exact Pati-Salam Matching, and 2D Newton Boundary-Value Solver

function rk4TwoLoopRg(
  y0: Vec3,
  dtTotal: number,
  steps: number,
  b1: readonly [number, number, number],
  b2: readonly (readonly [number, number, number])[],
): Vec3 {
  const inv2Pi = 1 / (2 * Math.PI)
  const inv8Pi2 = 1 / (8 * Math.PI * Math.PI)
  const rhs = (y: Vec3): Vec3 => {
    const a0 = 1 / y[0]
    const a1 = 1 / y[1]
    const a2 = 1 / y[2]
    const out: [number, number, number] = [0, 0, 0]

    for (let i = 0; i < 3; i++) {
      const row = b2[i]!

      out[i] = -b1[i]! * inv2Pi - (row[0] * a0 + row[1] * a1 + row[2] * a2) * inv8Pi2
    }

    return out
  }

  const h = dtTotal / steps
  let y: Vec3 = [y0[0], y0[1], y0[2]]

  for (let s = 0; s < steps; s++) {
    const k1 = rhs(y)
    const y1: Vec3 = [y[0] + 0.5 * h * k1[0], y[1] + 0.5 * h * k1[1], y[2] + 0.5 * h * k1[2]]
    const k2 = rhs(y1)
    const y2: Vec3 = [y[0] + 0.5 * h * k2[0], y[1] + 0.5 * h * k2[1], y[2] + 0.5 * h * k2[2]]
    const k3 = rhs(y2)
    const y3: Vec3 = [y[0] + h * k3[0], y[1] + h * k3[1], y[2] + h * k3[2]]
    const k4 = rhs(y3)

    y = [
      y[0] + (h / 6) * (k1[0] + 2 * k2[0] + 2 * k3[0] + k4[0]),
      y[1] + (h / 6) * (k1[1] + 2 * k2[1] + 2 * k3[1] + k4[1]),
      y[2] + (h / 6) * (k1[2] + 2 * k2[2] + 2 * k3[2] + k4[2]),
    ]
  }

  return y
}

// Exact Pati-Salam <-> SM matching at M_PS:
//   SM -> PS: alpha_{4C}^{-1} = alpha_3^{-1}, alpha_{2L}^{-1} = alpha_2^{-1},
//             alpha_{2R}^{-1} = (5/3) alpha_1^{-1} - (2/3) alpha_3^{-1}
//   PS -> SM: alpha_1^{-1} = (3/5) alpha_{2R}^{-1} + (2/5) alpha_{4C}^{-1},
//             alpha_2^{-1} = alpha_{2L}^{-1}, alpha_3^{-1} = alpha_{4C}^{-1}
function matchSmToPs(sm: Vec3): Vec3 {
  return [sm[2], sm[1], (5 / 3) * sm[0] - (2 / 3) * sm[2]]
}

function matchPsToSm(ps: Vec3): Vec3 {
  return [(3 / 5) * ps[2] + (2 / 5) * ps[0], ps[1], ps[0]]
}

function alphaEmInvFrom12(a1Inv: number, a2Inv: number): number {
  return (5 / 3) * a1Inv + a2Inv
}

function sin2ThetaWFrom12(a1Inv: number, a2Inv: number): number {
  return a2Inv / alphaEmInvFrom12(a1Inv, a2Inv)
}

// Standard SM QED running below M_Z (MS-bar alpha_hat^{-1}(M_Z) -> on-shell alpha^{-1}(0)),
// identical to E-FRC-0326 (lines 1454-1469)
function qedRunMzToZero(alphaEmInvMsBarMz: number, mZGeV: number): number {
  const alpha0Ref = 1 / INVERSE_ALPHA
  const leptonMassesGeV = [0.00051099895, 0.1056583755, 1.77686]
  let deltaAlphaLep = 0

  for (const ml of leptonMassesGeV) {
    deltaAlphaLep += (alpha0Ref / (3 * Math.PI)) * (2 * Math.log(mZGeV / ml) - 5 / 3)
  }

  const deltaAlphaHad5 = 0.02768
  const deltaAlphaTop = -0.00007
  const deltaAlphaTotal = deltaAlphaLep + deltaAlphaHad5 + deltaAlphaTop
  const alphaEmInvOnShellMz = alphaEmInvMsBarMz + 0.995

  return alphaEmInvOnShellMz / (1 - deltaAlphaTotal)
}

export type PatiSalamUnificationSolution = {
  readonly label: string
  readonly betaCert: PsBetaCertificate
  readonly tPs: number // ln(M_PS / M_Z)
  readonly tGut: number // ln(M_GUT / M_Z)
  readonly log10MPsGeV: number
  readonly log10MGutGeV: number
  readonly mPsGeV: number
  readonly mGutGeV: number
  readonly alphaGutInv: number
  readonly psCouplingsAtMPs: Vec3 // (alpha_4C^-1, alpha_2L^-1, alpha_2R^-1)
  readonly smCouplingsAtMPs: Vec3 // (alpha_1^-1, alpha_2^-1, alpha_3^-1)
  readonly psCouplingsAtMGut: Vec3
  readonly matchingBoundaryErr: number // |alpha_1^-1 - ((3/5) alpha_2R^-1 + (2/5) alpha_4C^-1)|
  readonly unificationMaxResidual: number // max |alpha_i^-1(M_GUT) - alpha_GUT^-1|
  readonly backwardSin2ThetaWMz: number
  readonly backwardSin2ThetaWErr: number
  readonly backwardAlphaEmInvMz: number
  readonly backwardAlphaEmInvErr: number
  readonly backwardAlpha3Mz: number
  readonly backwardAlpha3Err: number
  readonly roundTripMaxErr: number // M_Z -> M_PS -> M_GUT -> M_PS -> M_Z
  readonly protonLifetimeEstimateYr: number
  readonly protonDecaySafe: boolean // M_GUT > 10^{15.5} GeV
  // Type-I seesaw neutrino mass estimates at M_R = M_PS (m_nu = m_D^2 / M_PS)
  readonly seesawNuMassFromMbEV: number // m_D = m_b = 4.18 GeV
  readonly seesawNuMassFromMTauEV: number // m_D = m_tau = 1.77686 GeV
  readonly seesawNuMassFromTopPsEV: number // m_D = m_t(M_PS) ~ 85 GeV (honest full-top benchmark)
  readonly seesawNuMassFromY002EV: number // m_D = 0.02 * v / sqrt(2) = 3.48 GeV
  readonly seesawScaleInWindow: boolean // 10^{11} <= M_PS <= 10^{13.8} GeV
}

function solvePatiSalamUnification(
  betaCert: PsBetaCertificate,
  b1Sm: readonly [number, number, number],
  b2Sm: readonly (readonly [number, number, number])[],
  yMz: Vec3,
  initialTPs = 22.0,
  initialTGut = 32.0,
): PatiSalamUnificationSolution {
  const b1Ps = betaCert.b1Num
  const b2Ps = betaCert.b2Num
  const solveSteps = 400
  const verifySteps = 800

  const evalUp = (tPs: number, tGut: number, steps: number) => {
    const smAtPs = rk4TwoLoopRg(yMz, tPs, steps, b1Sm, b2Sm)
    const psAtPs = matchSmToPs(smAtPs)
    const psAtGut = rk4TwoLoopRg(psAtPs, tGut - tPs, steps, b1Ps, b2Ps)

    return {
      smAtPs,
      psAtPs,
      psAtGut,
      f0: psAtGut[1] - psAtGut[0],
      f1: psAtGut[2] - psAtGut[0],
    }
  }

  // Deterministic 2D Newton-Raphson solver on (t_PS, t_GUT)
  let tPs = initialTPs
  let tGut = initialTGut

  for (let iter = 0; iter < 30; iter++) {
    const cur = evalUp(tPs, tGut, solveSteps)

    if (Math.max(Math.abs(cur.f0), Math.abs(cur.f1)) < 1e-13) break

    const eps = 1e-6
    const p1 = evalUp(tPs + eps, tGut, solveSteps)
    const p2 = evalUp(tPs, tGut + eps, solveSteps)
    const j00 = (p1.f0 - cur.f0) / eps
    const j10 = (p1.f1 - cur.f1) / eps
    const j01 = (p2.f0 - cur.f0) / eps
    const j11 = (p2.f1 - cur.f1) / eps
    const det = j00 * j11 - j01 * j10
    const dPs = (j11 * cur.f0 - j01 * cur.f1) / det
    const dGut = (-j10 * cur.f0 + j00 * cur.f1) / det

    tPs -= dPs
    tGut -= dGut
  }

  // Refine with final high-resolution Newton pass at verifySteps = 800
  for (let iter = 0; iter < 6; iter++) {
    const cur = evalUp(tPs, tGut, verifySteps)

    if (Math.max(Math.abs(cur.f0), Math.abs(cur.f1)) < 1e-14) break

    const eps = 1e-7
    const p1 = evalUp(tPs + eps, tGut, verifySteps)
    const p2 = evalUp(tPs, tGut + eps, verifySteps)
    const j00 = (p1.f0 - cur.f0) / eps
    const j10 = (p1.f1 - cur.f1) / eps
    const j01 = (p2.f0 - cur.f0) / eps
    const j11 = (p2.f1 - cur.f1) / eps
    const det = j00 * j11 - j01 * j10

    tPs -= (j11 * cur.f0 - j01 * cur.f1) / det
    tGut -= (-j10 * cur.f0 + j00 * cur.f1) / det
  }

  const finalUp = evalUp(tPs, tGut, verifySteps)
  const alphaGutInv = (finalUp.psAtGut[0] + finalUp.psAtGut[1] + finalUp.psAtGut[2]) / 3
  const unificationMaxResidual = Math.max(
    Math.abs(finalUp.psAtGut[0] - alphaGutInv),
    Math.abs(finalUp.psAtGut[1] - alphaGutInv),
    Math.abs(finalUp.psAtGut[2] - alphaGutInv),
  )

  const matchedSmBack = matchPsToSm(finalUp.psAtPs)
  const matchingBoundaryErr = Math.max(
    Math.abs(matchedSmBack[0] - finalUp.smAtPs[0]),
    Math.abs(matchedSmBack[1] - finalUp.smAtPs[1]),
    Math.abs(matchedSmBack[2] - finalUp.smAtPs[2]),
  )

  // Backward run from EXACT unified SO(10) boundary (alpha_4C = alpha_2L = alpha_2R = alpha_GUT,
  // where sin^2(theta_W)_GUT = 3/8 exact) down through M_PS to M_Z
  const psDownAtPs = rk4TwoLoopRg(
    [alphaGutInv, alphaGutInv, alphaGutInv],
    -(tGut - tPs),
    verifySteps,
    b1Ps,
    b2Ps,
  )
  const smDownAtPs = matchPsToSm(psDownAtPs)
  const smDownAtMz = rk4TwoLoopRg(smDownAtPs, -tPs, verifySteps, b1Sm, b2Sm)

  const backwardAlphaEmInvMz = alphaEmInvFrom12(smDownAtMz[0], smDownAtMz[1])
  const backwardSin2ThetaWMz = sin2ThetaWFrom12(smDownAtMz[0], smDownAtMz[1])
  const backwardAlpha3Mz = 1 / smDownAtMz[2]
  const backwardSin2ThetaWErr = Math.abs(backwardSin2ThetaWMz - SIN2_THETA_W_MZ_PDG)
  const backwardAlphaEmInvErr = Math.abs(backwardAlphaEmInvMz - ALPHA_EM_INV_MZ_PDG)
  const backwardAlpha3Err = Math.abs(backwardAlpha3Mz - ALPHA_3_MZ_PDG)

  // Exact RK4 round-trip reversibility: M_Z -> M_PS -> M_GUT -> M_PS -> M_Z
  const psBackAtPs = rk4TwoLoopRg(finalUp.psAtGut, -(tGut - tPs), verifySteps, b1Ps, b2Ps)
  const smBackAtMz = rk4TwoLoopRg(matchPsToSm(psBackAtPs), -tPs, verifySteps, b1Sm, b2Sm)
  const roundTripMaxErr = Math.max(
    Math.abs(smBackAtMz[0] - yMz[0]),
    Math.abs(smBackAtMz[1] - yMz[1]),
    Math.abs(smBackAtMz[2] - yMz[2]),
  )

  const log10MPsGeV = Math.log10(M_Z_GEV) + tPs / Math.LN10
  const log10MGutGeV = Math.log10(M_Z_GEV) + tGut / Math.LN10
  const mPsGeV = 10 ** log10MPsGeV
  const mGutGeV = 10 ** log10MGutGeV

  // Order-of-magnitude dimension-6 proton lifetime estimate tau_p ~ M_GUT^4 / (alpha_GUT^2 * m_p^5)
  const alphaGut = 1 / alphaGutInv
  const gammaPGeV = (alphaGut * alphaGut * M_PROTON_GEV ** 5) / mGutGeV ** 4
  const protonLifetimeEstimateYr = HBAR_GEV_S / gammaPGeV / SECONDS_PER_YEAR
  const protonDecaySafe = log10MGutGeV > 15.5

  // Type-I seesaw neutrino mass at M_R = M_PS: m_nu = m_D^2 / M_PS (converted to eV)
  const seesawEV = (mDGeV: number): number => ((mDGeV * mDGeV) / mPsGeV) * 1e9
  const seesawNuMassFromMbEV = seesawEV(4.18)
  const seesawNuMassFromMTauEV = seesawEV(1.77686)
  const seesawNuMassFromTopPsEV = seesawEV(85.0)
  const seesawNuMassFromY002EV = seesawEV(0.02 * V_EW_GEV * Math.SQRT1_2)
  const seesawScaleInWindow = log10MPsGeV >= 11.0 && log10MPsGeV <= 13.8

  return {
    label: betaCert.label,
    betaCert,
    tPs,
    tGut,
    log10MPsGeV,
    log10MGutGeV,
    mPsGeV,
    mGutGeV,
    alphaGutInv,
    psCouplingsAtMPs: finalUp.psAtPs,
    smCouplingsAtMPs: finalUp.smAtPs,
    psCouplingsAtMGut: finalUp.psAtGut,
    matchingBoundaryErr,
    unificationMaxResidual,
    backwardSin2ThetaWMz,
    backwardSin2ThetaWErr,
    backwardAlphaEmInvMz,
    backwardAlphaEmInvErr,
    backwardAlpha3Mz,
    backwardAlpha3Err,
    roundTripMaxErr,
    protonLifetimeEstimateYr,
    protonDecaySafe,
    seesawNuMassFromMbEV,
    seesawNuMassFromMTauEV,
    seesawNuMassFromTopPsEV,
    seesawNuMassFromY002EV,
    seesawScaleInWindow,
  }
}

// Negative control: no intermediate Pati-Salam stage (M_PS = M_GUT, pure 1-Higgs SM),
// recovering E-FRC-0326's exact 4.91 mismatch at M_12
function computeNoPatiSalamControl(
  b1Sm: readonly [number, number, number],
  b2Sm: readonly (readonly [number, number, number])[],
  yMz: Vec3,
): {
  readonly log10M12GeV: number
  readonly alpha12Inv: number
  readonly alpha3InvAtM12: number
  readonly unificationMismatchNoPS: number
} {
  let lo = 15
  let hi = 35

  for (let iter = 0; iter < 60; iter++) {
    const mid = 0.5 * (lo + hi)
    const ym = rk4TwoLoopRg(yMz, mid, 400, b1Sm, b2Sm)

    if (ym[0] - ym[1] > 0) {
      lo = mid
    } else {
      hi = mid
    }
  }

  const t12 = 0.5 * (lo + hi)
  const y12 = rk4TwoLoopRg(yMz, t12, 800, b1Sm, b2Sm)
  const alpha12Inv = 0.5 * (y12[0] + y12[1])
  const alpha3InvAtM12 = y12[2]

  return {
    log10M12GeV: Math.log10(M_Z_GEV) + t12 / Math.LN10,
    alpha12Inv,
    alpha3InvAtM12,
    unificationMismatchNoPS: alpha12Inv - alpha3InvAtM12,
  }
}

// ---------------------------------------------------------------------------------------------------------
// Part 1: Geometric Solution to the Electroweak Hierarchy Problem on {3,4,3,4}

export type GeometricHierarchyReport = {
  readonly exactShellCounts0to3: readonly [number, number, number, number]
  readonly cuspBranchingFactorB: number // 6034 / 330 = 18.28484848...
  readonly bulkPerronGrowthLambda: number // warpFactor() = 18.27870777...
  readonly logBranchingFactor: number // ln(b) = 2.90607258...
  readonly mPlanckGeV: number
  readonly mPlanckReducedGeV: number
  readonly vEwGeV: number
  readonly planckToEwRatio: number // 4.95854e16
  readonly reducedPlanckToEwRatio: number
  // Exact continuous & integer shell depths on {3,4,3,4}
  readonly depthEwFromB: number // ln(M_Pl / v_EW) / ln(b) = 13.2283
  readonly depthEwFromLambda: number // ln(M_Pl / v_EW) / ln(lambda) = 13.2299
  readonly depthEwFromExactShellN: number // 3 + ln(M_Pl / (v_EW * 6034)) / ln(b) = 13.2328
  readonly depthEwReducedPlanck: number // ln(M_Pl_red / v_EW) / ln(b) = 12.6736
  readonly nearestIntegerShellEw: number // 13
  readonly bPow13: number // 2.5538e16
  readonly shellCountN13: number // 2.5207e16
  readonly warpedScaleAtShell13GeV: number // M_Pl / N_13 ~ 484.3 GeV
  readonly warpedScaleAtShell13RatioToVew: number // ~1.97 (O(1), zero 10^16 tuning!)
  readonly randallSundrumWarpExponent: number // k * pi * r_c = D_EW * ln(b) = 38.4426
  readonly flatQuadraticFineTuning: number // (M_Pl / v_EW)^2 = 2.4587e33
  // Shell depth decomposition across the Part 2 SO(10) -> PS -> SM unification ladder
  readonly depthPlToGut: number // ln(M_Pl / M_GUT) / ln(b) ~ 2.52 shells
  readonly depthGutToPs: number // ln(M_GUT / M_PS) / ln(b) ~ 3.76 shells
  readonly depthPsToEw: number // ln(M_PS / v_EW) / ln(b) ~ 6.95 shells
  readonly depthGutToEw: number // ln(M_GUT / v_EW) / ln(b) ~ 10.70 shells
  readonly depthAdditivityErr: number // |(D_Pl-GUT + D_GUT-PS + D_PS-EW) - D_EW| <= 1e-13
  // Negative controls: flat column (b = 1) & 3D Euclidean polynomial shell volume (D + 1)^3
  readonly flatControlBranchingB: number // 1
  readonly flatControlShellCountAtD13: number // 1
  readonly flatControlShellCountAtD1000: number // 1
  readonly flatControlWarpRatioAtD13: number // 1.0 (zero hierarchy)
  readonly flatControlResidualTuning: number // 4.95854e16 (full unreduced fine-tuning)
  readonly euclidean3DShellsNeeded: number // (M_Pl / v_EW)^(1/3) - 1 ~ 367,385 shells
}

function analyzeGeometricHierarchy(
  mGutGeV: number,
  mPsGeV: number,
): GeometricHierarchyReport {
  const b = EXACT_COLUMN_SHELL_COUNTS[3] / EXACT_COLUMN_SHELL_COUNTS[2]
  const lambda = warpFactor()
  const lnB = Math.log(b)
  const lnLambda = Math.log(lambda)

  const planckToEwRatio = M_PLANCK_GEV / V_EW_GEV
  const reducedPlanckToEwRatio = M_PLANCK_REDUCED_GEV / V_EW_GEV

  const depthEwFromB = Math.log(planckToEwRatio) / lnB
  const depthEwFromLambda = Math.log(planckToEwRatio) / lnLambda
  const depthEwFromExactShellN =
    3 + Math.log(planckToEwRatio / EXACT_COLUMN_SHELL_COUNTS[3]) / lnB
  const depthEwReducedPlanck = Math.log(reducedPlanckToEwRatio) / lnB

  const nearestIntegerShellEw = Math.round(depthEwFromB)
  const bPow13 = b ** nearestIntegerShellEw
  const shellCountN13 =
    EXACT_COLUMN_SHELL_COUNTS[3] * b ** (nearestIntegerShellEw - 3)
  const warpedScaleAtShell13GeV = M_PLANCK_GEV / shellCountN13
  const warpedScaleAtShell13RatioToVew = warpedScaleAtShell13GeV / V_EW_GEV
  const randallSundrumWarpExponent = depthEwFromB * lnB
  const flatQuadraticFineTuning = planckToEwRatio * planckToEwRatio

  const depthPlToGut = Math.log(M_PLANCK_GEV / mGutGeV) / lnB
  const depthGutToPs = Math.log(mGutGeV / mPsGeV) / lnB
  const depthPsToEw = Math.log(mPsGeV / V_EW_GEV) / lnB
  const depthGutToEw = Math.log(mGutGeV / V_EW_GEV) / lnB
  const depthAdditivityErr = Math.abs(
    depthPlToGut + depthGutToPs + depthPsToEw - depthEwFromB,
  )

  // Flat-mesh negative control (b = 1 -> N_D = 1 for all D)
  const flatControlBranchingB = 1
  const flatControlShellCountAtD13 = flatControlBranchingB ** 13
  const flatControlShellCountAtD1000 = flatControlBranchingB ** 1000
  const flatControlWarpRatioAtD13 = 1 / flatControlShellCountAtD13
  const flatControlResidualTuning = planckToEwRatio * flatControlWarpRatioAtD13
  const euclidean3DShellsNeeded = Math.cbrt(planckToEwRatio) - 1

  return {
    exactShellCounts0to3: [
      EXACT_COLUMN_SHELL_COUNTS[0],
      EXACT_COLUMN_SHELL_COUNTS[1],
      EXACT_COLUMN_SHELL_COUNTS[2],
      EXACT_COLUMN_SHELL_COUNTS[3],
    ],
    cuspBranchingFactorB: b,
    bulkPerronGrowthLambda: lambda,
    logBranchingFactor: lnB,
    mPlanckGeV: M_PLANCK_GEV,
    mPlanckReducedGeV: M_PLANCK_REDUCED_GEV,
    vEwGeV: V_EW_GEV,
    planckToEwRatio,
    reducedPlanckToEwRatio,
    depthEwFromB,
    depthEwFromLambda,
    depthEwFromExactShellN,
    depthEwReducedPlanck,
    nearestIntegerShellEw,
    bPow13,
    shellCountN13,
    warpedScaleAtShell13GeV,
    warpedScaleAtShell13RatioToVew,
    randallSundrumWarpExponent,
    flatQuadraticFineTuning,
    depthPlToGut,
    depthGutToPs,
    depthPsToEw,
    depthGutToEw,
    depthAdditivityErr,
    flatControlBranchingB,
    flatControlShellCountAtD13,
    flatControlShellCountAtD1000,
    flatControlWarpRatioAtD13,
    flatControlResidualTuning,
    euclidean3DShellsNeeded,
  }
}

// ---------------------------------------------------------------------------------------------------------
// Part 3: Honest Bare-Lattice alpha(0) Prediction Test (Zero Numerology)

// Compute canonical unaliased single-face {3,4,3,4} pair-density Riccati stiffness K_eff = 1.01253212
// and G_eff = 1 / (4 pi K_eff) = 0.07859254, identical to pair-density-gravity-slope.ts (E-GRV-0157)
// and electroweak-breaking-alpha.ts (E-FRC-0326).
function computeLatticeKEffGEff(floorF = 24): {
  readonly kEff: number
  readonly gEff: number
} {
  const rVol = EXACT_COLUMN_SHELL_COUNTS[3] / EXACT_COLUMN_SHELL_COUNTS[2]
  const nShell = new Float64Array(floorF + 2)

  for (let d = 0; d < EXACT_COLUMN_SHELL_COUNTS.length && d < nShell.length; d++) {
    nShell[d] = EXACT_COLUMN_SHELL_COUNTS[d]!
  }

  for (let d = EXACT_COLUMN_SHELL_COUNTS.length; d < nShell.length; d++) {
    nShell[d] = nShell[d - 1]! * rVol
  }

  const cLat = new Float64Array(floorF + 1)
  const cVert = new Float64Array(floorF + 1)

  for (let d = 0; d <= floorF; d++) {
    const nd = nShell[d]!
    const nd1 = nShell[d + 1]!
    const lat = singleFaceLateralLinksPerNeighbor(d)

    cLat[d] = lat / (nd * nd)
    cVert[d] = 18 / nd1
  }

  let y = cVert[floorF]!
  let dy = cLat[floorF]!

  for (let d = floorF - 1; d >= 0; d--) {
    const cv = cVert[d]!
    const denom = cv + y
    const ratio = cv / denom

    dy = cLat[d]! + ratio * ratio * dy
    y = (cv * y) / denom
  }

  return { kEff: dy, gEff: 1 / (4 * Math.PI * dy) }
}

export type BareLatticeRunEntry = {
  readonly label: string
  readonly bareAlphaGutInv: number
  readonly targetAlphaGutInv: number
  readonly gutRelResidualPct: number
  readonly predAlphaEmInvMz: number
  readonly mzRelResidualPct: number
  readonly predAlphaEmInvZero: number
  readonly zeroRelResidualPct: number
  readonly predSin2ThetaWMz: number
  readonly predAlpha3InvMz: number
  readonly perturbativeToMz: boolean
  readonly stepConvergenceErr: number
  readonly codataExactMatch: boolean
}

export type BareLatticeAlphaReport = {
  readonly latticeKEff: number
  readonly latticeGEff: number
  readonly invGEff4PiKEff: number // 12.723854...
  readonly alphaLatInvLambda: number // 4 pi K_eff ln(lambda) = 36.972213...
  readonly alphaLatInvCuspB: number // 4 pi K_eff ln(6034/330) = 36.976487...
  readonly primaryMinimalPsRun: BareLatticeRunEntry
  readonly primaryCuspBRun: BareLatticeRunEntry
  readonly georgiJarlskogPsRun: BareLatticeRunEntry
  readonly dParityPsRun: BareLatticeRunEntry
  // Unlogged 1 / G_eff = 12.7239 1-loop QCD Landau-pole control
  readonly invGEffOneLoopAlpha3InvAtMPs: number
  readonly invGEffOneLoopAlpha3InvAtMz: number
  readonly invGEffOneLoopLandauLog10GeV: number
  readonly invGEffHitsLandauPoleAboveMz: boolean
  // Honest CODATA boundary flags
  readonly pdgAlphaEmInvMz: number
  readonly codataAlphaEmInvZero: number
  readonly anyZeroParamCodataHit: boolean
  readonly exactAlphaRemainsOpen: boolean
}

function runBareLatticeThroughChain(
  label: string,
  bareAlphaGutInv: number,
  sol: PatiSalamUnificationSolution,
  b1Sm: readonly [number, number, number],
  b2Sm: readonly (readonly [number, number, number])[],
): BareLatticeRunEntry {
  const b1Ps = sol.betaCert.b1Num
  const b2Ps = sol.betaCert.b2Num
  const dtPs = sol.tGut - sol.tPs

  const evalWithSteps = (steps: number) => {
    const psAtPs = rk4TwoLoopRg(
      [bareAlphaGutInv, bareAlphaGutInv, bareAlphaGutInv],
      -dtPs,
      steps,
      b1Ps,
      b2Ps,
    )
    const smAtPs = matchPsToSm(psAtPs)
    const smAtMz = rk4TwoLoopRg(smAtPs, -sol.tPs, steps, b1Sm, b2Sm)
    const aEmMz = alphaEmInvFrom12(smAtMz[0], smAtMz[1])
    const s2wMz = sin2ThetaWFrom12(smAtMz[0], smAtMz[1])
    const aEm0 = qedRunMzToZero(aEmMz, M_Z_GEV)

    return { smAtMz, aEmMz, s2wMz, aEm0 }
  }

  const r800 = evalWithSteps(800)
  const r1600 = evalWithSteps(1600)
  const stepConvergenceErr = Math.max(
    Math.abs(r1600.aEmMz - r800.aEmMz),
    Math.abs(r1600.aEm0 - r800.aEm0),
    Math.abs(r1600.smAtMz[2] - r800.smAtMz[2]),
  )

  const predAlphaEmInvMz = r1600.aEmMz
  const predAlphaEmInvZero = r1600.aEm0
  const predSin2ThetaWMz = r1600.s2wMz
  const predAlpha3InvMz = r1600.smAtMz[2]
  const perturbativeToMz =
    Number.isFinite(predAlpha3InvMz) &&
    predAlpha3InvMz > 0 &&
    Number.isFinite(predAlphaEmInvZero)

  const gutRelResidualPct =
    ((bareAlphaGutInv - sol.alphaGutInv) / sol.alphaGutInv) * 100
  const mzRelResidualPct =
    ((predAlphaEmInvMz - ALPHA_EM_INV_MZ_PDG) / ALPHA_EM_INV_MZ_PDG) * 100
  const zeroRelResidualPct =
    ((predAlphaEmInvZero - INVERSE_ALPHA) / INVERSE_ALPHA) * 100
  const codataExactMatch =
    Math.abs(predAlphaEmInvZero - INVERSE_ALPHA) <= 3 * INVERSE_ALPHA_DELTA

  return {
    label,
    bareAlphaGutInv,
    targetAlphaGutInv: sol.alphaGutInv,
    gutRelResidualPct,
    predAlphaEmInvMz,
    mzRelResidualPct,
    predAlphaEmInvZero,
    zeroRelResidualPct,
    predSin2ThetaWMz,
    predAlpha3InvMz,
    perturbativeToMz,
    stepConvergenceErr,
    codataExactMatch,
  }
}

function analyzeBareLatticeAlpha(
  primarySol: PatiSalamUnificationSolution,
  gjSol: PatiSalamUnificationSolution,
  dParitySol: PatiSalamUnificationSolution,
  b1Sm: readonly [number, number, number],
  b2Sm: readonly (readonly [number, number, number])[],
): BareLatticeAlphaReport {
  const { kEff, gEff } = computeLatticeKEffGEff(24)
  const lambda = warpFactor()
  const cuspB = EXACT_COLUMN_SHELL_COUNTS[3] / EXACT_COLUMN_SHELL_COUNTS[2]
  const invGEff4PiKEff = 1 / gEff
  const alphaLatInvLambda = invGEff4PiKEff * Math.log(lambda)
  const alphaLatInvCuspB = invGEff4PiKEff * Math.log(cuspB)

  const primaryMinimalPsRun = runBareLatticeThroughChain(
    `alpha_lat(lambda)=${alphaLatInvLambda.toFixed(4)} -> Primary Minimal PS`,
    alphaLatInvLambda,
    primarySol,
    b1Sm,
    b2Sm,
  )
  const primaryCuspBRun = runBareLatticeThroughChain(
    `alpha_lat(b_cusp)=${alphaLatInvCuspB.toFixed(4)} -> Primary Minimal PS`,
    alphaLatInvCuspB,
    primarySol,
    b1Sm,
    b2Sm,
  )
  const georgiJarlskogPsRun = runBareLatticeThroughChain(
    `alpha_lat(lambda)=${alphaLatInvLambda.toFixed(4)} -> Georgi-Jarlskog PS (+(15,2,2)_R)`,
    alphaLatInvLambda,
    gjSol,
    b1Sm,
    b2Sm,
  )
  const dParityPsRun = runBareLatticeThroughChain(
    `alpha_lat(lambda)=${alphaLatInvLambda.toFixed(4)} -> D-parity PS (G_422D)`,
    alphaLatInvLambda,
    dParitySol,
    b1Sm,
    b2Sm,
  )

  // Control: unlogged 1 / G_eff = 4 pi K_eff = 12.7239 at 1-loop (avoids 2-loop 1/0 pole)
  // Running DOWN by dt: alpha^{-1}(low) = alpha^{-1}(high) + b * dt / (2 pi) (since b_4C < 0, b_3 < 0)
  const b4C = primarySol.betaCert.b1Num[0]
  const b3Sm = b1Sm[2]
  const dtPs = primarySol.tGut - primarySol.tPs
  const invGEffOneLoopAlpha3InvAtMPs = invGEff4PiKEff + (b4C * dtPs) / (2 * Math.PI)
  const invGEffOneLoopAlpha3InvAtMz =
    invGEffOneLoopAlpha3InvAtMPs + (b3Sm * primarySol.tPs) / (2 * Math.PI)
  // Exact 1-loop Landau pole scale where alpha_4C^{-1}(mu) = 0
  const dtToLandau = (2 * Math.PI * invGEff4PiKEff) / -b4C
  const invGEffOneLoopLandauLog10GeV =
    primarySol.log10MGutGeV - dtToLandau / Math.LN10
  const invGEffHitsLandauPoleAboveMz =
    invGEffOneLoopAlpha3InvAtMz < 0 &&
    invGEffOneLoopLandauLog10GeV > Math.log10(M_Z_GEV)

  const runs = [
    primaryMinimalPsRun,
    primaryCuspBRun,
    georgiJarlskogPsRun,
    dParityPsRun,
  ]
  const anyZeroParamCodataHit = runs.some(r => r.codataExactMatch)

  return {
    latticeKEff: kEff,
    latticeGEff: gEff,
    invGEff4PiKEff,
    alphaLatInvLambda,
    alphaLatInvCuspB,
    primaryMinimalPsRun,
    primaryCuspBRun,
    georgiJarlskogPsRun,
    dParityPsRun,
    invGEffOneLoopAlpha3InvAtMPs,
    invGEffOneLoopAlpha3InvAtMz,
    invGEffOneLoopLandauLog10GeV,
    invGEffHitsLandauPoleAboveMz,
    pdgAlphaEmInvMz: ALPHA_EM_INV_MZ_PDG,
    codataAlphaEmInvZero: INVERSE_ALPHA,
    anyZeroParamCodataHit,
    exactAlphaRemainsOpen: !anyZeroParamCodataHit,
  }
}

// ---------------------------------------------------------------------------------------------------------
// Top-level E-FRC-0328 report

export type PatiSalamUnificationHierarchyReport = {
  readonly hierarchy: GeometricHierarchyReport
  readonly embedding: PatiSalamEmbeddingCert
  readonly smBetaExactMatch: boolean
  readonly primaryPsBetaExpectedMatch: boolean
  readonly primary: PatiSalamUnificationSolution
  readonly companionRealBidoublet: PatiSalamUnificationSolution
  readonly companionGeorgiJarlskog: PatiSalamUnificationSolution
  readonly companionDParity: PatiSalamUnificationSolution
  readonly noPatiSalamControl: {
    readonly log10M12GeV: number
    readonly alpha12Inv: number
    readonly alpha3InvAtM12: number
    readonly unificationMismatchNoPS: number
  }
  readonly bareLatticeAlpha: BareLatticeAlphaReport
}

export function analyzePatiSalamUnificationHierarchy(): PatiSalamUnificationHierarchyReport {
  const so10 = analyzeSo10ThreeGenerations(20)
  const states = so10.spin10.states

  // Part 2A: Certify Pati-Salam embedding & matching weights directly from E-FRC-0324's 16 states
  const embedding = certifyPatiSalamEmbedding(states)
  const smBeta = deriveExactSmBeta(states)

  // Standard minimal Pati-Salam representations inside SO(10):
  //   (1, 2, 2) bidoublet from 10_H, (10, 1, 3) SU(2)_R-breaking scalar from 126_H
  const complexBidoublet = makePsRep('Phi=(1,2,2)_C', 'complex_scalar', 1n, '1', 'fund', 'fund')
  const realBidoublet = makePsRep('Phi=(1,2,2)_R', 'real_scalar', 1n, '1', 'fund', 'fund')
  const deltaR = makePsRep('Delta_R=(10,1,3)_C', 'complex_scalar', 1n, 'sym2', '1', 'sym2')
  const deltaL = makePsRep('Delta_L=(10bar,3,1)_C', 'complex_scalar', 1n, 'sym2', 'sym2', '1')
  const xi15Real = makePsRep('Xi=(15,2,2)_R', 'real_scalar', 1n, 'adj', 'fund', 'fund')

  // Primary minimal realistic SO(10) -> Pati-Salam -> SM model: complex (1,2,2) + complex (10,1,3)
  const primaryBeta = deriveExactPatiSalamBeta(
    'Minimal PS: (1,2,2)_C + (10,1,3)_C',
    [complexBidoublet, deltaR],
  )

  // Verify exact BigInt rational match against closed-form textbook Machacek-Vaughn fractions
  const expectedPrimaryB1: readonly [Rat, Rat, Rat] = [
    rat(-23n, 3n),
    rat(-3n),
    rat(11n, 3n),
  ]
  const expectedPrimaryB2: readonly (readonly [Rat, Rat, Rat])[] = [
    [rat(643n, 6n), rat(9n, 2n), rat(153n, 2n)],
    [rat(45n, 2n), rat(8n), rat(3n)],
    [rat(765n, 2n), rat(3n), rat(584n, 3n)],
  ]
  let primaryPsBetaExpectedMatch =
    primaryBeta.dynkinCasimirIdentitiesExact && primaryBeta.twoLoopReciprocityExact

  for (let i = 0; i < 3; i++) {
    if (!ratEq(primaryBeta.b1Rat[i]!, expectedPrimaryB1[i]!)) {
      primaryPsBetaExpectedMatch = false
    }

    for (let j = 0; j < 3; j++) {
      if (!ratEq(primaryBeta.b2Rat[i]![j]!, expectedPrimaryB2[i]![j]!)) {
        primaryPsBetaExpectedMatch = false
      }
    }
  }

  // Companion SO(10) Pati-Salam scalar sectors for transparent structural comparison
  const realBidoubletBeta = deriveExactPatiSalamBeta(
    'Minimal 1-Higgs PS: (1,2,2)_R + (10,1,3)_C',
    [realBidoublet, deltaR],
  )
  const georgiJarlskogBeta = deriveExactPatiSalamBeta(
    'Georgi-Jarlskog PS: (1,2,2)_R + (10,1,3)_C + (15,2,2)_R',
    [realBidoublet, deltaR, xi15Real],
  )
  const dParityBeta = deriveExactPatiSalamBeta(
    'D-Parity Symmetric PS (G_422D): (1,2,2)_C + (10,1,3)_C + (10bar,3,1)_C',
    [complexBidoublet, deltaR, deltaL],
  )

  // PDG 2024 MS-bar gauge couplings at M_Z = 91.1876 GeV
  const alpha2InvMz = ALPHA_EM_INV_MZ_PDG * SIN2_THETA_W_MZ_PDG
  const alpha1InvMz = (3 / 5) * ALPHA_EM_INV_MZ_PDG * (1 - SIN2_THETA_W_MZ_PDG)
  const alpha3InvMz = 1 / ALPHA_3_MZ_PDG
  const yMz: Vec3 = [alpha1InvMz, alpha2InvMz, alpha3InvMz]

  // Part 2B: Solve exact 2-loop SO(10) -> PS -> SM unification for primary & companion models
  const primary = solvePatiSalamUnification(
    primaryBeta,
    smBeta.b1Num,
    smBeta.b2Num,
    yMz,
    21.5,
    32.0,
  )
  const companionRealBidoublet = solvePatiSalamUnification(
    realBidoubletBeta,
    smBeta.b1Num,
    smBeta.b2Num,
    yMz,
    21.0,
    32.5,
  )
  const companionGeorgiJarlskog = solvePatiSalamUnification(
    georgiJarlskogBeta,
    smBeta.b1Num,
    smBeta.b2Num,
    yMz,
    20.0,
    33.0,
  )
  const companionDParity = solvePatiSalamUnification(
    dParityBeta,
    smBeta.b1Num,
    smBeta.b2Num,
    yMz,
    26.5,
    30.0,
  )

  // Part 2C: Negative control with no intermediate Pati-Salam stage (M_PS = M_GUT)
  const noPatiSalamControl = computeNoPatiSalamControl(smBeta.b1Num, smBeta.b2Num, yMz)

  // Part 1: Geometric {3,4,3,4} electroweak hierarchy tied to Part 2 unification scales
  const hierarchy = analyzeGeometricHierarchy(primary.mGutGeV, primary.mPsGeV)

  // Part 3: Honest bare-lattice alpha(0) prediction test (zero numerology)
  const bareLatticeAlpha = analyzeBareLatticeAlpha(
    primary,
    companionGeorgiJarlskog,
    companionDParity,
    smBeta.b1Num,
    smBeta.b2Num,
  )

  return {
    hierarchy,
    embedding,
    smBetaExactMatch: smBeta.exactMatch,
    primaryPsBetaExpectedMatch,
    primary,
    companionRealBidoublet,
    companionGeorgiJarlskog,
    companionDParity,
    noPatiSalamControl,
    bareLatticeAlpha,
  }
}
