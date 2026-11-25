// BREAKTHROUGH 5 — PART C: ZERO-CONTINUOUS-PARAMETER CYCLOTOMIC ALGEBRA AUDIT
// FOR KOIDE PHASE, FLAVOR (CKM / PMNS / QUARK MASSES), AND COUPLINGS.
//
// 1. Part C1: Exact algebraic error floor for ALL cyclotomic roots e^{i 2 pi k / m}
//    (m in {9, 18, 27, 36, 54, 72}) against PDG 2024 charged-lepton Koide phase delta_PDG.
// 2. Part C2: Non-root-of-unity algebraic phases strictly in Z[zeta_9][1/6]:
//    - Short words (L = 1..6) of bare 3-full-line Phi_odd catalyst {C, L_7} (exact BigInt SU(2)/U(2))
//    - Short words (L = 1..6) of bare M_meet DFS generators {S_12, S_23} (exact BigInt SU(2))
//    - Short words (L = 1..5) of equatorial chiral coins {R_x(2pi/9), R_{pi/9}(2pi/9)} (incl. Part A's K_small!)
//    - Small-height exact unit-modulus ratios alpha / conj(alpha) in Q(omega) and Q(zeta_9)
//    - Exact rational combinations of {3,4,3,4} / D_4 invariants for delta_PDG and alpha^{-1}(0)
//    EVERY dictionary is paired with a strict deterministic Look-Elsewhere Null Control!
// 3. Part C3: Zero-continuous-parameter pure-Z[zeta_9][1/6] + {3,4,3,4} shell CKM, PMNS,
//    and quark-hierarchy texture audit (ZERO fitted continuous floats), reported honestly vs PDG
//    and vs Paper 0018's 14-continuous-parameter 120_H fit.
//
// Deterministic, zero Math.random, native Node 24 TypeScript.

export {}

// ============================================================================
// 1. PDG 2024 REFERENCE DATA & EXACT KOIDE EXTRACTION
// ============================================================================

const PDG = {
  // Charged leptons (MeV)
  me: 0.51099895,
  mmu: 105.6583755,
  mtau: 1776.86,
  // Quarks MS-bar at M_Z (MeV) and 2 GeV (MeV)
  upMz: [1.27, 619, 171700] as const,
  downMz: [2.67, 53.16, 2855] as const,
  // CKM magnitudes & Jarlskog & UT gamma (PDG 2024)
  vus: 0.22500,
  vcb: 0.04182,
  vub: 0.00369,
  jCKM: 3.08e-5,
  deltaCKMDeg: 65.5,
  // PMNS (NuFIT 5.3 / PDG 2024, Normal Ordering)
  s12Sq: 0.307,
  s23Sq: 0.546,
  s13Sq: 0.0220,
  deltaPMNSDeg: 197.0,
  dm21Sq: 7.53e-5,
  dm31Sq: 2.453e-3,
  // CODATA fine-structure constant
  alphaInv0: 137.035999177,
} as const

// Exact Koide spectrum from Brannen/circulant formula:
//   sqrt(m_k) = mu * (1 + sqrt(2) * cos(delta + 2*pi*k/3)), k = 0, 1, 2
function koideMassesFromDelta(delta: number): {
  signedRoots: [number, number, number]
  masses: [number, number, number] // sorted ascending
  muOverE: number
  tauOverMu: number
  allPositive: boolean
  koideQ: number
} {
  const s = [0, 1, 2].map(k => 1 + Math.SQRT2 * Math.cos(delta + (2 * Math.PI * k) / 3))
  const allPositive = s.every(x => x > 0)
  const m = s.map(x => x * x).sort((a, b) => a - b) as [number, number, number]
  const sr = s.slice().sort((a, b) => a - b) as [number, number, number]
  const sumM = m[0] + m[1] + m[2]
  const sumSqrt = Math.sqrt(m[0]) + Math.sqrt(m[1]) + Math.sqrt(m[2])
  return {
    signedRoots: sr,
    masses: m,
    muOverE: m[1] / Math.max(m[0], 1e-300),
    tauOverMu: m[2] / Math.max(m[1], 1e-300),
    allPositive,
    koideQ: sumM / (sumSqrt * sumSqrt),
  }
}

// Extract exact empirical Koide Q and folded Brannen phase delta_PDG in [0, pi/3] from PDG masses
function extractPdgKoide(): {
  Q: number; Qerr: number; rSq: number; deltaPdg: number; deltaFromTwoNinths: number
  pdgMuE: number; pdgTauMu: number
} {
  const se = Math.sqrt(PDG.me)
  const sm = Math.sqrt(PDG.mmu)
  const st = Math.sqrt(PDG.mtau)
  const Q = (PDG.me + PDG.mmu + PDG.mtau) / (se + sm + st) ** 2
  const rSq = 6 * Q - 2 // = 2 iff Q = 2/3
  const mu = (se + sm + st) / 3
  // Solve cos(3*delta) from product or direct projections on [1, cos(2pi/3), cos(4pi/3)]
  // With (st, sm, se) = mu * (1 + r cos(d), 1 + r cos(d - 2pi/3), 1 + r cos(d + 2pi/3)):
  //   c = (st - mu) / (mu * r) = cos(d),
  //   s = (sm - se) / (sqrt(3) * mu * r) = sin(d)!
  const r = Math.sqrt(rSq)
  const cosD = (st - mu) / (mu * r)
  const sinD = (sm - se) / (Math.sqrt(3) * mu * r)
  const deltaPdg = Math.abs(Math.atan2(sinD, cosD))
  return {
    Q,
    Qerr: Math.abs(Q - 2 / 3),
    rSq,
    deltaPdg,
    deltaFromTwoNinths: Math.abs(deltaPdg - 2 / 9),
    pdgMuE: PDG.mmu / PDG.me,
    pdgTauMu: PDG.mtau / PDG.mmu,
  }
}

function foldKoideAngle(theta: number): number {
  const per = (2 * Math.PI) / 3
  const m = ((theta % per) + per) % per
  return Math.min(m, per - m)
}

const pdgK = extractPdgKoide()
const twoNinthsSpec = koideMassesFromDelta(2 / 9)

console.log('========================================================================')
console.log('PART C0: EXACT PDG 2024 CHARGED-LEPTON KOIDE BENCHMARK')
console.log('========================================================================')
console.log(`  Q_PDG = ${pdgK.Q.toFixed(10)} (|Q - 2/3| = ${pdgK.Qerr.toExponential(3)}, r^2 = ${pdgK.rSq.toFixed(8)})`)
console.log(`  delta_PDG (folded in [0, pi/3]) = ${pdgK.deltaPdg.toFixed(10)} rad`)
console.log(`  2/9                             = ${(2 / 9).toFixed(10)} rad (|delta_PDG - 2/9| = ${pdgK.deltaFromTwoNinths.toExponential(3)} rad, rel ${(100 * pdgK.deltaFromTwoNinths / pdgK.deltaPdg).toFixed(5)}%)`)
console.log(`  PDG mass ratios:   m_mu/m_e = ${pdgK.pdgMuE.toFixed(5)}, m_tau/m_mu = ${pdgK.pdgTauMu.toFixed(5)}`)
console.log(`  At delta = 2/9:    m_mu/m_e = ${twoNinthsSpec.muOverE.toFixed(5)} (err ${(100 * Math.abs(twoNinthsSpec.muOverE - pdgK.pdgMuE) / pdgK.pdgMuE).toFixed(4)}%), m_tau/m_mu = ${twoNinthsSpec.tauOverMu.toFixed(5)} (err ${(100 * Math.abs(twoNinthsSpec.tauOverMu - pdgK.pdgTauMu) / pdgK.pdgTauMu).toFixed(4)}%)`)
console.log(`  Note: exact Brannen positivity window is delta in [0, pi/12 = ${(Math.PI / 12).toFixed(6)} rad] (above pi/12, min sqrt(m) < 0!)`)

//Wait: verify why delta = 2/9 gives 206.065 vs 206.768!
// Because in Brannen's formula: delta_PDG = 0.22222205 IS shifted by pi/12? NO! Check delta_PDG printed above!
// Wait: let's see what deltaPdg prints when we run it!

// ============================================================================
// 2. PART C1: EXACT CYCLOTOMIC ROOT ERROR FLOOR FOR m | 18, 36, 54, 72
// ============================================================================

console.log('\n========================================================================')
console.log('PART C1: EXACT CYCLOTOMIC ROOT-OF-UNITY ERROR FLOOR (m | 18, 36, 54, 72)')
console.log('========================================================================')

for (const m of [9, 18, 27, 36, 54, 72]) {
  let bestK = -1
  let bestAng = 0
  let bestErr = Infinity
  let inWindowNonDeg = 0
  for (let k = 0; k < m; k++) {
    const raw = (2 * Math.PI * k) / m
    const f = foldKoideAngle(raw)
    if (f < 1e-12) continue // degenerate m1=m2 root (cube root of unity)
    if (f < Math.PI / 12 - 1e-12) inWindowNonDeg++
    const err = Math.abs(f - pdgK.deltaPdg)
    if (err < bestErr) {
      bestErr = err
      bestAng = f
      bestK = k
    }
  }
  const sp = koideMassesFromDelta(bestAng)
  const errMuE = Math.abs(sp.muOverE - pdgK.pdgMuE) / pdgK.pdgMuE
  const errTauMu = Math.abs(sp.tauOverMu - pdgK.pdgTauMu) / pdgK.pdgTauMu
  console.log(
    `  m=${String(m).padStart(2)}: closest folded root = ${(bestAng / Math.PI).toFixed(6)}*pi = ${bestAng.toFixed(6)} rad (k=${bestK}), ` +
    `|d-d_PDG|=${bestErr.toFixed(6)} (${(100 * bestErr / pdgK.deltaPdg).toFixed(2)}%), ` +
    `nonDegInPosWindow=${inWindowNonDeg}, pos=${sp.allPositive}, ` +
    `m_mu/m_e=${sp.muOverE.toFixed(2)} (err ${(100 * errMuE).toFixed(1)}%), m_tau/m_mu=${sp.tauOverMu.toFixed(2)} (err ${(100 * errTauMu).toFixed(1)}%)`,
  )
}

// ============================================================================
// 3. PART C2: EXACT BigInt NON-ROOT-OF-UNITY ALGEBRAIC PHASES IN Z[zeta_9][1/6]
//    WITH STRICT LOOK-ELSEWHERE NULL CONTROLS!
// ============================================================================

console.log('\n========================================================================')
console.log('PART C2: SHORT BARE-RULE UNITARY WORDS & ALGEBRAIC RATIOS (WITH LOOK-ELSEWHERE)')
console.log('========================================================================')

// Exact Eisenstein Z[w][1/2] 2x2 matrix arithmetic for bare {C, L_7}, bare {S_12, S_23}, and {W_1, W_2}
type Eis = readonly [bigint, bigint] // a + b*w
const eAdd = (x: Eis, y: Eis): Eis => [x[0] + y[0], x[1] + y[1]]
const eSub = (x: Eis, y: Eis): Eis => [x[0] - y[0], x[1] - y[1]]
const eMul = (x: Eis, y: Eis): Eis => [
  x[0] * y[0] - x[1] * y[1],
  x[0] * y[1] + x[1] * y[0] - x[1] * y[1],
]
const eConj = (x: Eis): Eis => [x[0] - x[1], -x[1]]
const eEq = (x: Eis, y: Eis): boolean => x[0] === y[0] && x[1] === y[1]

type EMat2 = { m00: Eis; m01: Eis; m10: Eis; m11: Eis; p: number }

function reduceE2(a: EMat2): EMat2 {
  let { m00, m01, m10, m11, p } = a
  while (
    p > 0 &&
    (m00[0] & 1n) === 0n && (m00[1] & 1n) === 0n &&
    (m01[0] & 1n) === 0n && (m01[1] & 1n) === 0n &&
    (m10[0] & 1n) === 0n && (m10[1] & 1n) === 0n &&
    (m11[0] & 1n) === 0n && (m11[1] & 1n) === 0n
  ) {
    m00 = [m00[0] >> 1n, m00[1] >> 1n]
    m01 = [m01[0] >> 1n, m01[1] >> 1n]
    m10 = [m10[0] >> 1n, m10[1] >> 1n]
    m11 = [m11[0] >> 1n, m11[1] >> 1n]
    p--
  }
  return { m00, m01, m10, m11, p }
}

function mulE2(a: EMat2, b: EMat2): EMat2 {
  return reduceE2({
    m00: eAdd(eMul(a.m00, b.m00), eMul(a.m01, b.m10)),
    m01: eAdd(eMul(a.m00, b.m01), eMul(a.m01, b.m11)),
    m10: eAdd(eMul(a.m10, b.m00), eMul(a.m11, b.m10)),
    m11: eAdd(eMul(a.m10, b.m01), eMul(a.m11, b.m11)),
    p: a.p + b.p,
  })
}

function dagE2(a: EMat2): EMat2 {
  return { m00: eConj(a.m00), m01: eConj(a.m10), m10: eConj(a.m01), m11: eConj(a.m11), p: a.p }
}

const SQRT3 = Math.sqrt(3)
function eisToC(x: Eis, p: number): [number, number] {
  const s = 1 / 2 ** p
  return [(Number(x[0]) - 0.5 * Number(x[1])) * s, (Number(x[1]) * SQRT3 * 0.5) * s]
}

// Compute exact eigenphases of a 2x2 unitary U in U(2):
//   eigenvalues solve lam^2 - Tr(U) lam + det(U) = 0 -> lam = sqrt(det) * exp(+- i * acos(Re(Tr / (2 sqrt(det)))))
function eigPhasesU2(a: EMat2): [number, number, number] {
  const [t0r, t0i] = eisToC(eAdd(a.m00, a.m11), a.p)
  const detE = eSub(eMul(a.m00, a.m11), eMul(a.m01, a.m10))
  const [dr, di] = eisToC(detE, 2 * a.p)
  const phiDet = Math.atan2(di, dr)
  const halfPhi = 0.5 * phiDet
  // Tr / (2 * e^{i halfPhi}) should be real = cos(theta_SU2)
  const c = Math.cos(-halfPhi)
  const s = Math.sin(-halfPhi)
  const cosTheta = Math.max(-1, Math.min(1, 0.5 * (t0r * c - t0i * s)))
  const thSU2 = Math.acos(cosTheta)
  return [thSU2, halfPhi + thSU2, halfPhi - thSU2]
}

function keyE2(a: EMat2): string {
  return `${a.m00[0]},${a.m00[1]};${a.m01[0]},${a.m01[1]};${a.m10[0]},${a.m10[1]};${a.m11[0]},${a.m11[1]}/${a.p}`
}

// Look-elsewhere audit for ANY sorted finite dictionary of distinct folded phases in (0, pi/3)
function lookElsewhereAudit(
  label: string,
  entries: { phase: number; desc: string }[],
  target: number,
): void {
  // Deduplicate phases within 1e-11
  const sorted = entries
    .filter(e => e.phase > 1e-10 && e.phase < Math.PI / 3 - 1e-10)
    .sort((a, b) => a.phase - b.phase)
  const unique: { phase: number; desc: string }[] = []
  for (const e of sorted) {
    if (unique.length === 0 || e.phase - unique[unique.length - 1]!.phase > 1e-10) {
      unique.push(e)
    }
  }
  const N = unique.length
  if (N === 0) {
    console.log(`  [${label}]: 0 nontrivial distinct phases`)
    return
  }
  let best = unique[0]!
  let bestErr = Math.abs(best.phase - target)
  for (const u of unique) {
    const err = Math.abs(u.phase - target)
    if (err < bestErr) {
      bestErr = err
      best = u
    }
  }
  // Exact deterministic look-elsewhere p-value across 2000 uniform targets in (0, pi/3):
  // Fraction of targets in (0, pi/3) whose nearest dictionary element is <= bestErr away!
  // We can compute the EXACT Lebesgue measure of the union of intervals [u_i - bestErr, u_i + bestErr] cap [0, pi/3]!
  const cap = Math.PI / 3
  let covered = 0
  let curL = -1
  let curR = -1
  for (const u of unique) {
    const l = Math.max(0, u.phase - bestErr)
    const r = Math.min(cap, u.phase + bestErr)
    if (curL < 0) {
      curL = l; curR = r
    } else if (l <= curR) {
      curR = Math.max(curR, r)
    } else {
      covered += curR - curL
      curL = l; curR = r
    }
  }
  if (curL >= 0) covered += curR - curL
  const exactPval = covered / cap
  const expNullErr = cap / (2 * (N + 1))

  const sp = koideMassesFromDelta(best.phase)
  const errMuE = Math.abs(sp.muOverE - pdgK.pdgMuE) / pdgK.pdgMuE
  const errTauMu = Math.abs(sp.tauOverMu - pdgK.pdgTauMu) / pdgK.pdgTauMu

  console.log(
    `  [${label}]: N_unique=${N}, best=${best.phase.toFixed(8)} rad (${best.desc})`,
  )
  console.log(
    `      |d-d_PDG|=${bestErr.toExponential(3)} (${(100 * bestErr / target).toFixed(4)}%), ` +
    `E[null]=${expNullErr.toExponential(2)}, EXACT Look-Elsewhere p-val=${exactPval.toFixed(4)}`,
  )
  console.log(
    `      Leptons: pos=${sp.allPositive}, m_mu/m_e=${sp.muOverE.toFixed(3)} (err ${(100 * errMuE).toFixed(3)}%), ` +
    `m_tau/m_mu=${sp.tauOverMu.toFixed(3)} (err ${(100 * errTauMu).toFixed(3)}%)`,
  )
}

function enumerateEisWords(
  name: string,
  gens: { label: string; mat: EMat2 }[],
  maxLen: number,
): void {
  const I2: EMat2 = { m00: [1n, 0n], m01: [0n, 0n], m10: [0n, 0n], m11: [1n, 0n], p: 0 }
  let frontier: { mat: EMat2; word: string }[] = [{ mat: I2, word: 'I' }]
  const seen = new Set<string>([keyE2(I2)])
  const allEntries: { phase: number; desc: string }[] = []

  for (let L = 1; L <= maxLen; L++) {
    const next: { mat: EMat2; word: string }[] = []
    for (const item of frontier) {
      for (const g of gens) {
        const m = mulE2(item.mat, g.mat)
        const k = keyE2(m)
        if (!seen.has(k)) {
          seen.add(k)
          const w = item.word === 'I' ? g.label : `${item.word}*${g.label}`
          next.push({ mat: m, word: w })
          const [thSU2, e1, e2] = eigPhasesU2(m)
          allEntries.push({ phase: foldKoideAngle(thSU2), desc: `SU2-ang(${w})` })
          allEntries.push({ phase: foldKoideAngle(e1), desc: `eig+(${w})` })
          allEntries.push({ phase: foldKoideAngle(e2), desc: `eig-(${w})` })
        }
      }
    }
    frontier = next
    if (L === 2 || L === 4 || L === maxLen) {
      lookElsewhereAudit(`${name} L<=${L} (${seen.size} mats)`, allEntries, pdgK.deltaPdg)
    }
  }
}

// Dictionary 1: Pure bare-U 3-full-line catalyst {C, L_7} from Breakthrough 3 (exact BigInt!)
//   C = (1/2)[[1+w, 1-w], [1-w, 1+w]], L_7 = (1/2)[[w, -1-2w], [w-1, w]]
const C_EIS: EMat2 = { m00: [1n, 1n], m01: [1n, -1n], m10: [1n, -1n], m11: [1n, 1n], p: 1 }
const L7_EIS: EMat2 = { m00: [0n, 1n], m01: [-1n, -2n], m10: [-1n, 1n], m11: [0n, 1n], p: 1 }
// Verify exact unitarity & Tr(L_7 C) = -5/4!
{
  const prod = mulE2(L7_EIS, C_EIS)
  const tr = eAdd(prod.m00, prod.m11)
  const trOk = eEq(tr, [-5n, 0n]) && prod.p === 2
  const unitOk = keyE2(mulE2(dagE2(L7_EIS), L7_EIS)) === '1,0;0,0;0,0;1,0/0'
  console.log(`  Bare catalyst check: L_7 exact BigInt unitary=${unitOk}, Tr(L_7*C) == -5/4 exact=${trOk}`)
}
enumerateEisWords(
  'Bare {C, L_7}',
  [
    { label: 'C', mat: C_EIS },
    { label: 'C^d', mat: dagE2(C_EIS) },
    { label: 'L7', mat: L7_EIS },
    { label: 'L7^d', mat: dagE2(L7_EIS) },
  ],
  6,
)

// Dictionary 2: Pure bare M_meet DFS generators {S_12, S_23} in SU(2) cap Z[w][1/2]!
// In Breakthrough 3: M_meet on 3-excitation DFS gives S_12 = diag(w, 1) * (-w^2)?
// Exact SU(2) representation (up to conjugation, identical spectrum):
//   S_12 = diag(e^{i pi/3}, e^{-i pi/3}) = [[1+w, 0], [0, -w]] (det=1, Tr=1, angle pi/3)
//   S_23 = R_y(2*acos(1/2))? Exact: on |0_L>, |1_L> (P_12 = diag(-1, 1), P_23 = [[1/2, -sqrt(3)/2], [-sqrt(3)/2, -1/2]]):
//   M_meet = (1+w)/2 I + (w-1)/2 P. Removing scalar det = sqrt(w) = -w^2 gives exact SU(2) in Z[w][1/2]:
//   Check: S_12 = (-w^2) * ((1+w)/2 I + (w-1)/2 P_12) = diag(-w^2, -1) = [[1+w, 0], [0, -1]]? Wait: det = -(1+w) = w^2.
//   Scale by zeta_6 = 1+w: S_12 = diag(1+w, -w) has det = -w(1+w) = 1! Tr = 1+w - w = 1!
//   Let's build S_12 and S_23 directly from P_12 and P_23 in complex Float64 AND exact BigInt!
//   Note: P_23 has sqrt(3)/2 = -i(2w+1)/2 (needs i), OR rotate basis by diag(1, i) so P_23 = [[1/2, i*sqrt(3)/2], [-i*sqrt(3)/2, -1/2]]
//   which IS STRICTLY IN Z[w][1/2]!!
//   Verify: P_23 = (1/2) [[1, 2w+1], [-(2w+1), -1]]!
//   Check P_23^2 = (1/4) [[1 - (2w+1)^2, 0], [0, -(2w+1)^2 + 1]] = (1/4)[[4, 0], [0, 4]] = I_2!!
//   Check P_23^dag = (1/2) [[1, -(2w^2+1)], [2w^2+1, -1]] = (1/2)[[1, 2w+1], [-(2w+1), -1]] = P_23!! (since 2w^2+1 = -(2w+1)!)
//   Now S_k = (1/2) I + ((2w+1)/2? Wait: M_meet = w (I+P)/2 + (I-P)/2 = (w+1)/2 I + (w-1)/2 P.
//   Multiply by zeta_6^{-1} = -w^2 = 1+w? Wait: det(M_meet) = w, so sqrt(det) = -w^2 = 1+w (since (1+w)^2 = 1+2w+w^2 = w!).
//   Thus S_k = (1+w)^{-1} M_meet = (-w) M_meet = (-w)( (w+1)/2 I + (w-1)/2 P )
//            = (1/2) I + ((-w^2 + w)/2) P = (1/2) I + ((2w + 1)/2) P!!
//   CHECK S_12, S_23 IN EXACT BigInt Z[w][1/2]!!
//   For P_12 = diag(-1, 1): S_12 = diag(-w, 1+w)! det = -w(1+w) = 1!
//   For P_23 = (1/2)[[1, 2w+1], [-2w-1, -1]]:
//     (2w+1)/2 * P_23 = (1/4)[[2w+1, -3], [3, -(2w+1)]]
//     S_23 = (1/4)[[3 + 2w, -3], [3, 1 - 2w]]!
//     Check Tr(S_12 * S_23) = (1/4)[(-w)(3+2w) + (1+w)(1-2w)] = (1/4)[(-3w - 2w^2) + (1 - w - 2w^2)]
//                           = (1/4)[1 - 4w - 4w^2] = (1/4)[1 + 4] = +5/4!! EXACT MATCH WITH BREAKTHROUGH 3!!
const S12_EIS: EMat2 = { m00: [0n, -1n], m01: [0n, 0n], m10: [0n, 0n], m11: [1n, 1n], p: 0 }
const S23_EIS: EMat2 = { m00: [3n, 2n], m01: [-3n, 0n], m10: [3n, 0n], m11: [1n, -2n], p: 2 }
{
  const prod = mulE2(S12_EIS, S23_EIS)
  const tr = eAdd(prod.m00, prod.m11)
  const trOk = eEq(tr, [5n, 0n]) && prod.p === 2
  const u1 = keyE2(mulE2(dagE2(S12_EIS), S12_EIS)) === '1,0;0,0;0,0;1,0/0'
  const u2 = keyE2(mulE2(dagE2(S23_EIS), S23_EIS)) === '1,0;0,0;0,0;1,0/0'
  console.log(`  Bare M_meet DFS check: S_12 unitary=${u1}, S_23 unitary=${u2}, Tr(S_12*S_23) == +5/4 exact=${trOk}`)
}
enumerateEisWords(
  'Bare M_meet DFS {S_12, S_23}',
  [
    { label: 'S12', mat: S12_EIS },
    { label: 'S12^d', mat: dagE2(S12_EIS) },
    { label: 'S23', mat: S23_EIS },
    { label: 'S23^d', mat: dagE2(S23_EIS) },
  ],
  6,
)

// Dictionary 3: Small-height exact unit-modulus ratios alpha / conj(alpha) in Z[omega] and Z[zeta_9]!
// (Just like Breakthrough 3's exact bound-state pole e^{i E_bound} = (4+3w)/(1-3w) = -w^2 (1-3w^2)/(1-3w)!)
{
  const eisRatios: { phase: number; desc: string }[] = []
  for (let a = -6; a <= 6; a++) {
    for (let b = 1; b <= 6; b++) {
      // alpha = a + b*w => arg(alpha / conj(alpha)) = 2 * arg(a + b*w)
      const re = a - 0.5 * b
      const im = b * SQRT3 * 0.5
      const ang = 2 * Math.atan2(im, re)
      eisRatios.push({ phase: foldKoideAngle(ang), desc: `arg((${a}+${b}w)/conj)` })
    }
  }
  lookElsewhereAudit('Eisenstein ratios alpha/conj(alpha) (|a|,|b|<=6)', eisRatios, pdgK.deltaPdg)

  const z9Ratios: { phase: number; desc: string }[] = []
  for (let a = 1; a <= 4; a++) {
    for (let b = -4; b <= 4; b++) {
      if (b === 0) continue
      for (let k = 1; k <= 4; k++) {
        // alpha = a + b * zeta_9^k
        const t = (2 * Math.PI * k) / 9
        const re = a + b * Math.cos(t)
        const im = b * Math.sin(t)
        const ang = 2 * Math.atan2(im, re)
        z9Ratios.push({ phase: foldKoideAngle(ang), desc: `arg((${a}+${b}z9^${k})/conj)` })
      }
    }
  }
  lookElsewhereAudit('Ninth-field ratios (a+b*z9^k)/conj (|a|,|b|<=4)', z9Ratios, pdgK.deltaPdg)
}

// Dictionary 4: Short equatorial Z[zeta_9][1/2] words (like Part A's K_small = R_{pi/9}(2pi/9) R_x(-4pi/9) R_{pi/9}(2pi/9))!
{
  // Build Float64 SU(2) quaternions for R_{phi}(2*a*pi/9) for a in {-2,-1,1,2}, phi in {0,1}
  type Q = [number, number, number, number] // c, -s*nx, -s*ny, -s*nz -> a00 = c + i qz, a01 = qy + i qx
  const mulQ = (u: Q, v: Q): Q => [
    u[0] * v[0] - u[1] * v[1] - u[2] * v[2] - u[3] * v[3],
    u[0] * v[1] + u[1] * v[0] + u[2] * v[3] - u[3] * v[2],
    u[0] * v[2] - u[1] * v[3] + u[2] * v[0] + u[3] * v[1],
    u[0] * v[3] + u[1] * v[2] - u[2] * v[1] + u[3] * v[0],
  ]
  const mkEqQ = (step: number, phiStep: number): Q => {
    const th = (step * Math.PI) / 9
    const ph = (phiStep * Math.PI) / 9
    return [Math.cos(th), -Math.sin(th) * Math.cos(ph), -Math.sin(th) * Math.sin(ph), 0]
  }
  const gensQ: { label: string; q: Q }[] = [
    { label: 'Rx(2pi/9)', q: mkEqQ(1, 0) },
    { label: 'Rx(-2pi/9)', q: mkEqQ(-1, 0) },
    { label: 'R1(2pi/9)', q: mkEqQ(1, 1) },
    { label: 'R1(-2pi/9)', q: mkEqQ(-1, 1) },
  ]
  let cur: { q: Q; w: string }[] = [{ q: [1, 0, 0, 0], w: 'I' }]
  const seen = new Set<string>(['1.000000,0.000000,0.000000,0.000000'])
  const allEq: { phase: number; desc: string }[] = []
  for (let L = 1; L <= 4; L++) {
    const next: { q: Q; w: string }[] = []
    for (const item of cur) {
      for (const g of gensQ) {
        const q = mulQ(item.q, g.q)
        const s = q[0] < 0 ? -1 : 1
        const key = `${(s * q[0]).toFixed(6)},${(s * q[1]).toFixed(6)},${(s * q[2]).toFixed(6)},${(s * q[3]).toFixed(6)}`
        if (!seen.has(key)) {
          seen.add(key)
          const w = item.w === 'I' ? g.label : `${item.w}*${g.label}`
          next.push({ q, w })
          const ang = Math.acos(Math.max(-1, Math.min(1, Math.abs(q[0]))))
          allEq.push({ phase: foldKoideAngle(ang), desc: w })
        }
      }
    }
    cur = next
    if (L === 3 || L === 4) {
      lookElsewhereAudit(`Z[zeta_9][1/2] {Rx(2pi/9), R_{pi/9}(2pi/9)} L<=${L}`, allEq, pdgK.deltaPdg)
    }
  }
}

// Dictionary 5: Exact small rationals & {3,4,3,4}/D_4 invariants against delta_PDG and alpha^{-1}(0)!
{
  console.log('\n  Exact {3,4,3,4} / D_4 invariant rational check (Honesty + Look-Elsewhere Audit):')
  const invs: [string, number][] = [
    ['2/9 (= 2/N_roles)', 2 / 9],
    ['4/18 (= 4/N_1)', 4 / 18],
    ['1/sqrt(18)', 1 / Math.sqrt(18)],
    ['1/sqrt(b) = sqrt(330/6034)', Math.sqrt(330 / 6034)],
    ['4/b = 4*330/6034', (4 * 330) / 6034],
    ['theta_*(K_small)', Math.acos(Math.cos((2 * Math.PI) / 9) ** 2 + Math.sin((2 * Math.PI) / 9) ** 2 * Math.cos(Math.PI / 9))],
  ]
  for (const [name, val] of invs) {
    const err = Math.abs(val - pdgK.deltaPdg)
    console.log(`    ${name.padEnd(28)} = ${val.toFixed(8)} (|err|=${err.toExponential(3)}, rel=${(100 * err / pdgK.deltaPdg).toFixed(4)}%)`)
  }
  // Check 1/alpha(0) vs exact {3,4,3,4} invariants (and Paper 0018's BLM zero-fit 130.58)
  console.log(`  Fine-structure constant alpha^{-1}(0) = ${PDG.alphaInv0.toFixed(6)}:`)
  console.log(`    Paper 0018 D_4 BLM zero-fit (E-FRC-0329) = 130.58 (-4.71% residual — needs O(1) heavy SO(10) thresholds)`)
  console.log(`    Pure rational control: 137 = 128 + 9 (numerology!), 4*pi*... -> NO zero-parameter algebraic derivation exists.`)
}

// ============================================================================
// 4. PART C3: ZERO-CONTINUOUS-PARAMETER PURE Z[zeta_9][1/6] + {3,4,3,4}
//    CKM, PMNS & QUARK-HIERARCHY AUDIT (ZERO FITTED FLOATS!)
// ============================================================================

console.log('\n========================================================================')
console.log('PART C3: ZERO-CONTINUOUS-PARAMETER CKM, PMNS & QUARK TEXTURE AUDIT')
console.log('========================================================================')

// Exact complex 3x3 helpers
type C = [number, number]
const cAdd = (a: C, b: C): C => [a[0] + b[0], a[1] + b[1]]
const cSub = (a: C, b: C): C => [a[0] - b[0], a[1] - b[1]]
const cMul = (a: C, b: C): C => [a[0] * b[0] - a[1] * b[1], a[0] * b[1] + a[1] * b[0]]
const cConj = (a: C): C => [a[0], -a[1]]
const cAbs = (a: C): number => Math.hypot(a[0], a[1])
const cExp = (th: number): C => [Math.cos(th), Math.sin(th)]

type M3 = C[][]
function m3Mul(a: M3, b: M3): M3 {
  return [0, 1, 2].map(i =>
    [0, 1, 2].map(j => {
      let s: C = [0, 0]
      for (let k = 0; k < 3; k++) s = cAdd(s, cMul(a[i]![k]!, b[k]![j]!))
      return s
    }),
  )
}
function m3Dag(a: M3): M3 {
  return [0, 1, 2].map(i => [0, 1, 2].map(j => cConj(a[j]![i]!)))
}
function m3UnitaryErr(u: M3): number {
  const p = m3Mul(m3Dag(u), u)
  let worst = 0
  for (let i = 0; i < 3; i++) {
    for (let j = 0; j < 3; j++) {
      worst = Math.max(worst, cAbs(cSub(p[i]![j]!, [i === j ? 1 : 0, 0])))
    }
  }
  return worst
}

// Exact 3x3 Hermitian Jacobi eigensolver (returns eigenvalues ascending + unitary columns V: H = V diag V^dag)
function hermitian3Eig(H: M3): { vals: [number, number, number]; U: M3 } {
  const A: M3 = H.map(r => r.map(x => [x[0], x[1]] as C))
  const V: M3 = [0, 1, 2].map(i => [0, 1, 2].map(j => [i === j ? 1 : 0, 0] as C))
  for (let sweep = 0; sweep < 40; sweep++) {
    let maxOff = 0
    for (const [p, q] of [[0, 1], [0, 2], [1, 2]] as const) {
      const mag = cAbs(A[p]![q]!)
      if (mag > maxOff) maxOff = mag
      if (mag < 1e-16) continue
      const u: C = [A[p]![q]![0] / mag, A[p]![q]![1] / mag]
      const uc = cConj(u)
      const app = A[p]![p]![0]
      const aqq = A[q]![q]![0]
      const tau = (aqq - app) / (2 * mag)
      const t = tau >= 0 ? 1 / (tau + Math.hypot(1, tau)) : -1 / (-tau + Math.hypot(1, tau))
      const c = 1 / Math.sqrt(1 + t * t)
      const s = t * c
      for (let k = 0; k < 3; k++) {
        if (k === p || k === q) continue
        const akp = A[k]![p]!, akq = A[k]![q]!
        const nkp = cAdd([c * akp[0], c * akp[1]], cMul([-s, 0], cMul(uc, akq)))
        const nkq = cAdd(cMul([s, 0], cMul(u, akp)), [c * akq[0], c * akq[1]])
        A[k]![p] = nkp; A[p]![k] = cConj(nkp)
        A[k]![q] = nkq; A[q]![k] = cConj(nkq)
      }
      A[p]![p] = [app - t * mag, 0]
      A[q]![q] = [aqq + t * mag, 0]
      A[p]![q] = [0, 0]; A[q]![p] = [0, 0]
      for (let k = 0; k < 3; k++) {
        const vkp = V[k]![p]!, vkq = V[k]![q]!
        V[k]![p] = cAdd([c * vkp[0], c * vkp[1]], cMul([-s, 0], cMul(uc, vkq)))
        V[k]![q] = cAdd(cMul([s, 0], cMul(u, vkp)), [c * vkq[0], c * vkq[1]])
      }
    }
    if (maxOff < 1e-15) break
  }
  const ord = [0, 1, 2].sort((i, j) => A[i]![i]![0] - A[j]![j]![0])
  const vals = ord.map(i => A[i]![i]![0]) as [number, number, number]
  const U: M3 = [0, 1, 2].map(r => ord.map(c => V[r]![c]!))
  // Self-verify H * U == U * diag(vals)
  const HU = m3Mul(H, U)
  let maxEigRes = 0
  for (let r = 0; r < 3; r++) {
    for (let c = 0; c < 3; c++) {
      const target: C = [U[r]![c]![0] * vals[c]!, U[r]![c]![1] * vals[c]!]
      maxEigRes = Math.max(maxEigRes, cAbs(cSub(HU[r]![c]!, target)))
    }
  }
  if (maxEigRes > 1e-10) {
    throw new Error(`hermitian3Eig residual ${maxEigRes} exceeded 1e-10`)
  }
  return { vals, U }
}

function extractMixing(V: M3): {
  s12Sq: number; s23Sq: number; s13Sq: number
  v12: number; v23: number; v13: number
  J: number; deltaDeg: number; uErr: number
} {
  const uErr = m3UnitaryErr(V)
  const v13 = cAbs(V[0]![2]!)
  const s13Sq = v13 * v13
  const c13Sq = Math.max(1e-30, 1 - s13Sq)
  const v12 = cAbs(V[0]![1]!)
  const v23 = cAbs(V[1]![2]!)
  const s12Sq = (v12 * v12) / c13Sq
  const s23Sq = (v23 * v23) / c13Sq
  // Jarlskog invariant J = Im(V_01 V_12 V_02^* V_11^*)
  const q = cMul(cMul(V[0]![1]!, V[1]![2]!), cMul(cConj(V[0]![2]!), cConj(V[1]![1]!)))
  const J = q[1]
  // Exact sin(delta) = J / (c12 s12 c23 s23 c13^2 s13)
  const denom = Math.sqrt(s12Sq * (1 - s12Sq) * s23Sq * (1 - s23Sq) * s13Sq) * c13Sq
  const sinD = denom > 1e-15 ? Math.max(-1, Math.min(1, J / denom)) : 0
  // Standard cosine from |V_10|^2 = s12^2 c23^2 + c12^2 s23^2 s13^2 + 2 c12 s12 c23 s23 s13 cos(delta)
  const v10Sq = cAbs(V[1]![0]!) ** 2
  const base = s12Sq * (1 - s23Sq) + (1 - s12Sq) * s23Sq * s13Sq
  const cosDen = 2 * Math.sqrt(s12Sq * (1 - s12Sq) * (1 - s23Sq) * s23Sq * s13Sq)
  const cosD = cosDen > 1e-15 ? Math.max(-1, Math.min(1, (v10Sq - base) / cosDen)) : 1
  const deltaDeg = (Math.atan2(sinD, cosD) * 180) / Math.PI
  return { s12Sq, s23Sq, s13Sq, v12, v23, v13, J, deltaDeg, uErr }
}

// --- C3-A: Exact 0-Continuous-Parameter Pure {3,4,3,4} Geometric CKM ---
console.log('--- C3-A: 0-Continuous-Parameter Geometric CKM (Direct {3,4,3,4} Invariants) ---')
// Construct exact PDG-parameterized unitary V_CKM = R_23(t23) * U_13(t13, delta) * R_12(t12)
// using STRICTLY 0-parameter {3,4,3,4}/D_4 discrete invariants:
//   s12 = 1/sqrt(N_1) = 1/sqrt(18) (or 1/sqrt(b) = sqrt(330/6034))
//   s23 = 1/|Phi(D_4)| = 1/24
//   s13 = 1/N_2 = 1/330 (or 1/(12*24) = 1/288)
//   delta = pi/3 = arg(zeta_6) (60 deg) or 4*pi/9 = arg(zeta_9^2) (80 deg)
function buildStandardUnitary(s12: number, s23: number, s13: number, delta: number): M3 {
  const c12 = Math.sqrt(1 - s12 * s12)
  const c23 = Math.sqrt(1 - s23 * s23)
  const c13 = Math.sqrt(1 - s13 * s13)
  const R12: M3 = [
    [[c12, 0], [s12, 0], [0, 0]],
    [[-s12, 0], [c12, 0], [0, 0]],
    [[0, 0], [0, 0], [1, 0]],
  ]
  const R23: M3 = [
    [[1, 0], [0, 0], [0, 0]],
    [[0, 0], [c23, 0], [s23, 0]],
    [[0, 0], [-s23, 0], [c23, 0]],
  ]
  const emd = cExp(-delta)
  const epd = cExp(delta)
  const U13: M3 = [
    [[c13, 0], [0, 0], [s13 * emd[0], s13 * emd[1]]],
    [[0, 0], [1, 0], [0, 0]],
    [[-s13 * epd[0], -s13 * epd[1]], [0, 0], [c13, 0]],
  ]
  return m3Mul(R23, m3Mul(U13, R12))
}

const ckmModels: { name: string; s12: number; s23: number; s13: number; delta: number }[] = [
  { name: 'Shell-pure (1/sqrt(18), 1/24, 1/330, pi/3)', s12: 1 / Math.sqrt(18), s23: 1 / 24, s13: 1 / 330, delta: Math.PI / 3 },
  { name: 'Shell-pure (1/sqrt(18), 1/24, 1/330, 4pi/9)', s12: 1 / Math.sqrt(18), s23: 1 / 24, s13: 1 / 330, delta: (4 * Math.PI) / 9 },
  { name: 'Asymp-b (1/sqrt(b), 1/24, 1/288, pi/3)', s12: Math.sqrt(330 / 6034), s23: 1 / 24, s13: 1 / 288, delta: Math.PI / 3 },
]
for (const m of ckmModels) {
  const V = buildStandardUnitary(m.s12, m.s23, m.s13, m.delta)
  const x = extractMixing(V)
  console.log(`  [${m.name}] (uErr=${x.uErr.toExponential(1)}):`)
  console.log(
    `    |V_us|=${x.v12.toFixed(5)} (PDG ${PDG.vus}, err ${((x.v12 - PDG.vus) / PDG.vus * 100).toFixed(2)}%), ` +
    `|V_cb|=${x.v23.toFixed(5)} (PDG ${PDG.vcb}, err ${((x.v23 - PDG.vcb) / PDG.vcb * 100).toFixed(2)}%), ` +
    `|V_ub|=${x.v13.toFixed(5)} (PDG ${PDG.vub}, err ${((x.v13 - PDG.vub) / PDG.vub * 100).toFixed(2)}%), ` +
    `J=${x.J.toExponential(3)} (PDG ${PDG.jCKM.toExponential(2)}, err ${((x.J - PDG.jCKM) / PDG.jCKM * 100).toFixed(1)}%)`,
  )
}

// --- C3-B: Exact 0-Continuous-Parameter Pure-Z[zeta_9][1/6] + Shell Yukawa Matrices ---
console.log('\n--- C3-B: 0-Continuous-Parameter Pure-Shell Yukawa Matrix Textures (M_q = W_q O_q W_q) ---')
// Exact {3,4,3,4} cusp shell counts N_D = [1, 18, 330, 6034]
// Look at natural shell hierarchies (ZERO fitted floats!):
//   Down quarks (shells D = 0, 1, 2 -> W_d = diag(1/330, 1/18, 1) OR sqrt(1/N_D) on (0,2,3)):
//   Up quarks   (shells D = 0, 1, 2 -> W_u = diag(1/N_2^2, 1/N_1^2, 1) = diag(1/108900, 1/324, 1)):
// Let's build the exact simplest Hermitian/complex shell-warped Yukawa matrices strictly with
// O(1) entries in {0, 1, zeta_9^k, 1/2, 1/3} (ZERO continuous floats!):
{
  const N0 = 1, N1 = 18, N2 = 330, N3 = 6034
  // Test 1: Pure cusp-shell mass hierarchy with 1-nearest-neighbor Z[zeta_9] Fritzsch-like hopping!
  //   W_d = diag(1/sqrt(N2), 1/sqrt(N1), 1)  -> diagonal W_d^2 = (1/330, 1/18, 1) => ratios (18.33, 18.0)!
  //   Wait: PDG down at M_Z: m_d : m_s : m_b = 1 : 19.91 : 1069.3 (m_s/m_d = 19.91 ~ 18, m_b/m_s = 53.71 ~ 3*18!)
  //   PDG up at M_Z:         m_u : m_c : m_t = 1 : 487.4 : 135197 (m_c/m_u = 487.4 ~ N_2=330, m_t/m_c = 277.4 ~ N_1^2=324!)
  // Construct 0-parameter pure Z[zeta_9][1/6] shell-warped Hermitian Yukawa textures:
  //   H_d = W_d * O_d * W_d   with W_d = diag(1/sqrt(N2 * 3), 1/sqrt(N1 * 3), 1)  (factor 3 = triality generations!)
  //   Wait: check purely canonical W_d = diag(1/sqrt(3*N2), 1/sqrt(3*N1), 1) vs W_d = diag(1/N2, 1/N1, 1)!
  const testYukawaPair = (
    label: string,
    wd: [number, number, number],
    wu: [number, number, number],
    Od: M3,
    Ou: M3,
  ) => {
    const scaleH = (w: [number, number, number], O: M3): M3 =>
      [0, 1, 2].map(i => [0, 1, 2].map(j => [w[i]! * w[j]! * O[i]![j]![0], w[i]! * w[j]! * O[i]![j]![1]] as C))
    const Hd = scaleH(wd, Od)
    const Hu = scaleH(wu, Ou)
    const ed = hermitian3Eig(Hd)
    const eu = hermitian3Eig(Hu)
    const md = ed.vals.map(Math.abs).sort((a, b) => a - b)
    const mu = eu.vals.map(Math.abs).sort((a, b) => a - b)
    const V = m3Mul(m3Dag(eu.U), ed.U)
    const mix = extractMixing(V)
    const pdgBs = PDG.downMz[2] / PDG.downMz[1] // 53.71
    const pdgSd = PDG.downMz[1] / PDG.downMz[0] // 19.91
    const pdgTc = PDG.upMz[2] / PDG.upMz[1]     // 277.4
    const pdgCu = PDG.upMz[1] / PDG.upMz[0]     // 487.4
    console.log(`  [${label}]:`)
    console.log(
      `    Down ratios: m_b/m_s=${(md[2]! / md[1]!).toFixed(2)} (PDG ${pdgBs.toFixed(1)}), ` +
      `m_s/m_d=${(md[1]! / md[0]!).toFixed(2)} (PDG ${pdgSd.toFixed(1)})`,
    )
    console.log(
      `    Up ratios:   m_t/m_c=${(mu[2]! / mu[1]!).toFixed(1)} (PDG ${pdgTc.toFixed(1)}), ` +
      `m_c/m_u=${(mu[1]! / mu[0]!).toFixed(1)} (PDG ${pdgCu.toFixed(1)})`,
    )
    console.log(
      `    CKM (uErr=${mix.uErr.toExponential(1)}): |V_us|=${mix.v12.toFixed(4)} (${((mix.v12 - PDG.vus) / PDG.vus * 100).toFixed(1)}%), ` +
      `|V_cb|=${mix.v23.toFixed(4)} (${((mix.v23 - PDG.vcb) / PDG.vcb * 100).toFixed(1)}%), ` +
      `|V_ub|=${mix.v13.toFixed(5)} (${((mix.v13 - PDG.vub) / PDG.vub * 100).toFixed(1)}%), ` +
      `J=${Math.abs(mix.J).toExponential(3)} (PDG ${PDG.jCKM.toExponential(2)})`,
    )
  }

  const z9 = (k: number): C => cExp((2 * Math.PI * k) / 9)
  // Texture 1: Pure cusp shell powers (0, 1, 2) with O_q = I + nearest-neighbor Z[zeta_9] coupling (0 floats!)
  //   W_d = (1/sqrt(N2), 1/sqrt(N1), 1), W_u = (1/N2, 1/N1, 1)
  //   O_d = [[1, 1, 1/3], [1, 1, 1/3], [1/3, 1/3, 1]]? Keep Hermitian strictly in Z[zeta_9][1/6]!
  const Od1: M3 = [
    [[1, 0], z9(0), [1 / 6, 0]],
    [z9(0), [1, 0], [1 / 6, 0]],
    [[1 / 6, 0], [1 / 6, 0], [1, 0]],
  ]
  const Ou1: M3 = [
    [[1, 0], z9(2), [1 / 6, 0]],
    [z9(-2), [1, 0], [1 / 6, 0]],
    [[1 / 6, 0], [1 / 6, 0], [1, 0]],
  ]
  testYukawaPair(
    'Pure shell W_d=(N2^-1/2,N1^-1/2,1), W_u=(N2^-1,N1^-1,1), O in Z[z9][1/6]',
    [1 / Math.sqrt(N2), 1 / Math.sqrt(N1), 1],
    [1 / N2, 1 / N1, 1],
    Od1,
    Ou1,
  )

  // Texture 2: Exact Fritzsch-like 0-parameter texture on (1/sqrt(N2*3), 1/sqrt(N1*3), 1) and (1/N2, 1/N1, 1)
  //   with diagonal (1, 1, 1) and off-diagonal strictly in {0, 1, zeta_9^2, 1/2, 1/3}
  const Od2: M3 = [
    [[1 / 2, 0], [1, 0], [1 / 6, 0]],
    [[1, 0], [1, 0], [1 / 3, 0]],
    [[1 / 6, 0], [1 / 3, 0], [1, 0]],
  ]
  const Ou2: M3 = [
    [[1 / 2, 0], z9(2), [1 / 6, 0]],
    [z9(-2), [1, 0], [1 / 3, 0]],
    [[1 / 6, 0], [1 / 3, 0], [1, 0]],
  ]
  testYukawaPair(
    'Shell + triality-3 W_d=(1/sqrt(3*N2),1/sqrt(3*N1),1), W_u=(1/N2,1/N1,1)',
    [1 / Math.sqrt(3 * N2), 1 / Math.sqrt(3 * N1), 1],
    [1 / N2, 1 / N1, 1],
    Od2,
    Ou2,
  )

  // Texture 3: Pure Z[zeta_9][1/6] matrix (NO N_D shells at all — ONLY powers of 1/6 and zeta_9^k!)
  const Od3: M3 = [
    [[1 / 216, 0], [1 / 36, 0], [1 / 216, 0]],
    [[1 / 36, 0], [1 / 18, 0], [1 / 24, 0]],
    [[1 / 216, 0], [1 / 24, 0], [1, 0]],
  ]
  const Ou3: M3 = [
    [[1 / 1296, 0], [z9(2)[0] / 216, z9(2)[1] / 216], [1 / 1296, 0]],
    [[z9(-2)[0] / 216, z9(-2)[1] / 216], [1 / 216, 0], [1 / 216, 0]],
    [[1 / 1296, 0], [1 / 216, 0], [1, 0]],
  ]
  testYukawaPair(
    'Pure Z[zeta_9][1/6] powers of 1/6 only (no N_D)',
    [1, 1, 1],
    [1, 1, 1],
    Od3,
    Ou3,
  )
}

// --- C3-C: Exact 0-Continuous-Parameter PMNS (TBM + Z[zeta_9][1/6] / {3,4,3,4} Perturbation) ---
console.log('\n--- C3-C: 0-Continuous-Parameter PMNS (Exact S_3 TBM + Discrete Z[zeta_9][1/6] Perturbation) ---')
{
  const s2 = Math.SQRT1_2
  const s3 = 1 / Math.sqrt(3)
  const s6 = 1 / Math.sqrt(6)
  const UTBM: M3 = [
    [[Math.sqrt(2 / 3), 0], [s3, 0], [0, 0]],
    [[-s6, 0], [s3, 0], [s2, 0]],
    [[s6, 0], [-s3, 0], [s2, 0]],
  ]
  const tbmMix = extractMixing(UTBM)
  console.log(
    `  [Unperturbed S_3 TBM Control]: sin^2 t12=${tbmMix.s12Sq.toFixed(4)} (PDG ${PDG.s12Sq}), ` +
    `sin^2 t23=${tbmMix.s23Sq.toFixed(4)} (PDG ${PDG.s23Sq}), sin^2 t13=${tbmMix.s13Sq.toFixed(5)} (PDG ${PDG.s13Sq} -> FAILS!), J=${tbmMix.J.toExponential(1)}`,
  )

  // Charged-lepton Cabibbo-type correction U_PMNS = U_12^ell(s_l, phi)^dag * U_TBM
  // with ZERO continuous parameters: s_l = 1/sqrt(N_1) = 1/sqrt(18) (so sin^2 t13 = 1/36 = 0.02778)
  // OR s_l = 1/sqrt(24) (D_4 root count -> sin^2 t13 = 1/48 = 0.02083, within 5.3% of PDG 0.0220!)
  // and exact cyclotomic phase phi in {2*pi*k/9} (k = 0..8)!
  for (const [sName, sl] of [['1/sqrt(N_1)=1/sqrt(18)', 1 / Math.sqrt(18)], ['1/sqrt(|Phi(D4)|)=1/sqrt(24)', 1 / Math.sqrt(24)]] as const) {
    const cl = Math.sqrt(1 - sl * sl)
    let bestRow = { k: 0, maxRel: Infinity, mix: tbmMix }
    for (let k = 0; k < 9; k++) {
      const ph = cExp((2 * Math.PI * k) / 9)
      const phc = cConj(ph)
      const Ul: M3 = [
        [[cl, 0], [sl * ph[0], sl * ph[1]], [0, 0]],
        [[-sl * phc[0], -sl * phc[1]], [cl, 0], [0, 0]],
        [[0, 0], [0, 0], [1, 0]],
      ]
      const Upmns = m3Mul(m3Dag(Ul), UTBM)
      const mix = extractMixing(Upmns)
      const r12 = Math.abs(mix.s12Sq - PDG.s12Sq) / PDG.s12Sq
      const r23 = Math.abs(mix.s23Sq - PDG.s23Sq) / PDG.s23Sq
      const r13 = Math.abs(mix.s13Sq - PDG.s13Sq) / PDG.s13Sq
      const maxRel = Math.max(r12, r23, r13)
      if (maxRel < bestRow.maxRel) bestRow = { k, maxRel, mix }
    }
    const m = bestRow.mix
    console.log(
      `  [TBM + U_12(${sName}, zeta_9^${bestRow.k})] (uErr=${m.uErr.toExponential(1)}):`,
    )
    console.log(
      `    sin^2 t12=${m.s12Sq.toFixed(4)} (${((m.s12Sq - PDG.s12Sq) / PDG.s12Sq * 100).toFixed(1)}%), ` +
      `sin^2 t23=${m.s23Sq.toFixed(4)} (${((m.s23Sq - PDG.s23Sq) / PDG.s23Sq * 100).toFixed(1)}%), ` +
      `sin^2 t13=${m.s13Sq.toFixed(5)} (${((m.s13Sq - PDG.s13Sq) / PDG.s13Sq * 100).toFixed(1)}%), ` +
      `J_PMNS=${m.J.toExponential(3)}, delta_CP=${m.deltaDeg.toFixed(1)} deg (PDG ${PDG.deltaPMNSDeg} deg)`,
    )
  }

  // Exact pure-Z[zeta_9][1/6] Type-I Seesaw Majorana perturbation (0 continuous params for all 4 PMNS + dm21/dm31!)
  // Take M_nu = U_TBM * diag(0, 1, 6) * U_TBM^T + (1/2) * (zeta_9^k perturbation in 1-3 entry)
  // Notice: dm21^2 / dm31^2 = 1 / 36 = 0.02778 (PDG 0.03070, -9.5%!) from pure integer 6 = 2*3!
  const z92 = cExp((4 * Math.PI) / 9)
  // Build Hermitian M_nu M_nu^dag directly from symmetric complex M_nu in TBM + Z[zeta_9][1/6]
  const mDiag: M3 = [
    [[0, 0], [0, 0], [z92[0] / 2, z92[1] / 2]],
    [[0, 0], [1, 0], [0, 0]],
    [[z92[0] / 2, z92[1] / 2], [0, 0], [6, 0]],
  ]
  const UTBM_T: M3 = [0, 1, 2].map(i => [0, 1, 2].map(j => UTBM[j]![i]!))
  const Mnu = m3Mul(UTBM, m3Mul(mDiag, UTBM_T))
  const Hnu = m3Mul(Mnu, m3Dag(Mnu))
  const enu = hermitian3Eig(Hnu)
  const dmRatio = (enu.vals[1] - enu.vals[0]) / (enu.vals[2] - enu.vals[0])
  const pmnsSeesaw = extractMixing(enu.U)
  const pdgDmRatio = PDG.dm21Sq / PDG.dm31Sq
  console.log(`  [Pure Z[zeta_9][1/2] Seesaw M_nu = U_TBM * (diag(0,1,6) + (1/2)z9^2 E_13) * U_TBM^T] (0 continuous floats!):`)
  console.log(
    `    dm21^2/dm31^2 = ${dmRatio.toFixed(5)} (PDG ${pdgDmRatio.toFixed(5)}, err ${((dmRatio - pdgDmRatio) / pdgDmRatio * 100).toFixed(1)}%), ` +
    `sin^2 t12=${pmnsSeesaw.s12Sq.toFixed(4)} (${((pmnsSeesaw.s12Sq - PDG.s12Sq) / PDG.s12Sq * 100).toFixed(1)}%), ` +
    `sin^2 t23=${pmnsSeesaw.s23Sq.toFixed(4)} (${((pmnsSeesaw.s23Sq - PDG.s23Sq) / PDG.s23Sq * 100).toFixed(1)}%), ` +
    `sin^2 t13=${pmnsSeesaw.s13Sq.toFixed(5)} (${((pmnsSeesaw.s13Sq - PDG.s13Sq) / PDG.s13Sq * 100).toFixed(1)}%), ` +
    `J_PMNS=${pmnsSeesaw.J.toExponential(3)}`,
  )
}

console.log('\nPART_C_ALL_AUDITS_COMPLETED')

export {}
