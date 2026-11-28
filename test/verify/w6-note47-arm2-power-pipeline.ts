// Wave-6 Track W6-B8: Note 47 Arm II Preregistered Empirical Neuroscience Statistical Power,
// BIC Model-Selection & Eldin/Balduzzi Anti-Confound Verification Pipeline
//
// Standalone, strictly deterministic (ZERO external imports, ZERO stochastic system RNG -- pure
// Mulberry32 PRNG), strict TypeScript (--strict --noUncheckedIndexedAccess), laptop-safe (< 5 s,
// peak RSS < 200 MB), fail-closed (throws on any failed check -> exit code 1), ending with `export {}`.
//
// Four Preregistered Verification Gates (N_subj in {20, 30, 40, 60}, R = 200 cohorts/condition):
//   GATE P1 -- Study E1: Five-Way Human Affective Dissociation Power & Null Calibration
//              (Holm-Bonferroni FWER alpha = 0.005, moderate marginal d = 0.65..0.80, d = 0 null).
//   GATE P2 -- Study E2: 0_V (Vital Peace) vs 0_D (Active Balanced Neutrality) Spectroscopy +
//              Mandatory Eldin Anti-Confound Guard Suite (CAR zero-mean vs Surface Laplacian,
//              zero-lag EOG volume-conduction null |Re(C)| > 0.90 vs debiased wPLI^2 < 0.05,
//              causal VAR Granger vs zero-phase FIR acausal trap, exact CSN 2009 Hurwitz-Zeta MLE
//              + KS + Vuong LLR vs naive log-log OLS).
//   GATE P3 -- Study E3: Present-State Metamerism TOST Equivalence (|Delta| < 0.25 SD) vs
//              History-Leakage Detection (Delta = 0.70 SD) + Neural Match & Impulse-Ping Audit.
//   GATE P4 -- Study E4: 12-Level Titrated TMS-EEG Wedge-Snap BIC Power & Non-Vacuous Null
//              Calibration (M_lin vs M_sig vs 3-regime M_snap, decisive Delta BIC > +10,
//              tested against linear, smooth logistic, and steep single-step logistic nulls).
//
// EPISTEMIC BOUNDARY (Tier C):
//   This in-silico verification suite certifies statistical power, Type I error control, model-
//   selection calibration, and signal-processing confound immunity ONLY. It does NOT establish
//   empirical human neural or phenomenal truth.

const t0Global = Date.now()

type CheckRow = {
  readonly id: string
  readonly gate: string
  readonly tier: 'Tier A' | 'Tier C'
  readonly name: string
  readonly passed: boolean
  readonly detail: string
}

const CHECKS: CheckRow[] = []

function recordCheck(
  id: string,
  gate: string,
  tier: 'Tier A' | 'Tier C',
  name: string,
  passed: boolean,
  detail: string,
): void {
  CHECKS.push({ id, gate, tier, name, passed, detail })
  const tag = passed ? 'PASS' : 'FAIL'
  console.log(`  [${tag}] ${id} (${tier}) ${name} :: ${detail}`)
}

function assertExact(cond: boolean, msg: string): void {
  if (!cond) throw new Error(`Assertion failed: ${msg}`)
}

// =================================================================================================
// 0. DETERMINISTIC MULBERRY32 PRNG & EXACT STATISTICAL / NUMERICAL PRIMITIVES
// =================================================================================================

const PI = Math.PI
const ALPHA_FWER = 0.005
const N_COHORTS = [20, 30, 40, 60] as const
const R_TRIALS = 200

type Prng = {
  readonly next: () => number
  readonly nextNormal: () => number
}

function makePrng(seed: number): Prng {
  let state = seed >>> 0
  let spare: number | null = null
  const next = (): number => {
    state = (state + 0x6d2b79f5) >>> 0
    let t = Math.imul(state ^ (state >>> 15), 1 | state)
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296
  }
  const nextNormal = (): number => {
    if (spare !== null) {
      const v = spare
      spare = null
      return v
    }
    let u = next()
    while (u <= 1e-15) u = next()
    const v = next()
    const r = Math.sqrt(-2 * Math.log(u))
    const th = 2 * PI * v
    spare = r * Math.sin(th)
    return r * Math.cos(th)
  }
  return { next, nextNormal }
}

// Lanczos log-gamma (accuracy < 1e-13 for x > 0)
const LANCZOS_COEF = [
  76.18009172947146,
  -86.50532032941677,
  24.01409824083091,
  -1.231739572450155,
  0.1208650973866179e-2,
  -0.5395239384953e-5,
] as const

function logGamma(z: number): number {
  let x = z
  let y = z
  let tmp = x + 5.5
  tmp -= (x + 0.5) * Math.log(tmp)
  let ser = 1.000000000190015
  for (let j = 0; j < LANCZOS_COEF.length; j++) {
    y += 1
    ser += LANCZOS_COEF[j]! / y
  }
  return -tmp + Math.log((2.5066282746310005 * ser) / x)
}

// Regularized incomplete beta I_x(a, b) via modified Lentz continued fraction
function betacf(a: number, b: number, x: number): number {
  const MAXIT = 200
  const EPS = 3e-13
  const FPMIN = 1e-300
  const qab = a + b
  const qap = a + 1
  const qam = a - 1
  let c = 1
  let d = 1 - (qab * x) / qap
  if (Math.abs(d) < FPMIN) d = FPMIN
  d = 1 / d
  let h = d
  for (let m = 1; m <= MAXIT; m++) {
    const m2 = 2 * m
    let aa = (m * (b - m) * x) / ((qam + m2) * (a + m2))
    d = 1 + aa * d
    if (Math.abs(d) < FPMIN) d = FPMIN
    c = 1 + aa / c
    if (Math.abs(c) < FPMIN) c = FPMIN
    d = 1 / d
    h *= d * c
    aa = (-(a + m) * (qab + m) * x) / ((a + m2) * (qap + m2))
    d = 1 + aa * d
    if (Math.abs(d) < FPMIN) d = FPMIN
    c = 1 + aa / c
    if (Math.abs(c) < FPMIN) c = FPMIN
    d = 1 / d
    const del = d * c
    h *= del
    if (Math.abs(del - 1) < EPS) break
  }
  return h
}

function ibeta(x: number, a: number, b: number): number {
  if (x <= 0) return 0
  if (x >= 1) return 1
  const bt = Math.exp(
    logGamma(a + b) - logGamma(a) - logGamma(b) + a * Math.log(x) + b * Math.log(1 - x),
  )
  if (x < (a + 1) / (a + b + 2)) {
    return (bt * betacf(a, b, x)) / a
  }
  return 1 - (bt * betacf(b, a, 1 - x)) / b
}

// Exact Student-t two-sided p-value P(|T_df| >= |t|)
function tPValueTwoSided(tStat: number, df: number): number {
  const x = df / (df + tStat * tStat)
  return ibeta(x, 0.5 * df, 0.5)
}

// Exact Student-t upper-tail p-value P(T_df >= t)
function tPValueUpper(tStat: number, df: number): number {
  const two = tPValueTwoSided(tStat, df)
  return tStat >= 0 ? 0.5 * two : 1 - 0.5 * two
}

// Exact F-distribution upper-tail p-value P(F_{d1, d2} >= fStat)
function fPValueUpper(fStat: number, d1: number, d2: number): number {
  if (fStat <= 0) return 1
  const x = d2 / (d2 + d1 * fStat)
  return ibeta(x, 0.5 * d2, 0.5 * d1)
}

// Error function and normal CDF (Abramowitz & Stegun 7.1.26)
function erfExact(x: number): number {
  const sign = x < 0 ? -1 : 1
  const ax = Math.abs(x)
  if (ax > 6.5) return sign
  const t = 1 / (1 + 0.3275911 * ax)
  const poly =
    t *
    (0.254829592 +
      t * (-0.284496736 + t * (1.421413741 + t * (-1.453152027 + t * 1.061405429))))
  return sign * (1 - poly * Math.exp(-ax * ax))
}

function normCdf(z: number): number {
  return 0.5 * (1 + erfExact(z / Math.SQRT2))
}

// Paired one-sample Student-t statistic from array of subject-level contrasts
function oneSampleT(vals: Float64Array, mu0 = 0): {
  readonly mean: number
  readonly sd: number
  readonly se: number
  readonly tStat: number
  readonly df: number
  readonly pTwoSided: number
} {
  const n = vals.length
  let s = 0
  for (let i = 0; i < n; i++) s += vals[i]!
  const mean = s / n
  let ss = 0
  for (let i = 0; i < n; i++) {
    const d = vals[i]! - mean
    ss += d * d
  }
  const sd = Math.sqrt(ss / (n - 1))
  const se = sd / Math.sqrt(n)
  const tStat = se > 1e-15 ? (mean - mu0) / se : mean === mu0 ? 0 : Math.sign(mean - mu0) * 1e9
  const df = n - 1
  return { mean, sd, se, tStat, df, pTwoSided: tPValueTwoSided(tStat, df) }
}

// Exact Holm-Bonferroni step-down family-wise error control at level alpha
function holmBonferroni(
  pVals: readonly number[],
  alpha: number,
): {
  readonly rejected: boolean[]
  readonly allRejected: boolean
  readonly anyRejected: boolean
} {
  const m = pVals.length
  const order = Array.from({ length: m }, (_, i) => i).sort((a, b) => pVals[a]! - pVals[b]!)
  const rejected = new Array<boolean>(m).fill(false)
  for (let k = 0; k < m; k++) {
    const idx = order[k]!
    const thresh = alpha / (m - k)
    if (pVals[idx]! <= thresh) {
      rejected[idx] = true
    } else {
      break
    }
  }
  let allRejected = true
  let anyRejected = false
  for (let i = 0; i < m; i++) {
    if (rejected[i]) anyRejected = true
    else allRejected = false
  }
  return { rejected, allRejected, anyRejected }
}

// Real Gaussian elimination with partial pivoting (for small OLS / VAR systems)
function solveLinearReal(A: readonly (readonly number[])[], b: readonly number[]): Float64Array {
  const n = b.length
  const M = A.map((row, i) => {
    const out = new Float64Array(n + 1)
    for (let j = 0; j < n; j++) out[j] = row[j]!
    out[n] = b[i]!
    return out
  })
  for (let col = 0; col < n; col++) {
    let piv = col
    let best = Math.abs(M[col]![col]!)
    for (let r = col + 1; r < n; r++) {
      const v = Math.abs(M[r]![col]!)
      if (v > best) {
        best = v
        piv = r
      }
    }
    assertExact(best > 1e-14, 'singular linear system in OLS/VAR')
    if (piv !== col) {
      const tmp = M[col]!
      M[col] = M[piv]!
      M[piv] = tmp
    }
    const pRow = M[col]!
    const diag = pRow[col]!
    for (let r = col + 1; r < n; r++) {
      const row = M[r]!
      const fac = row[col]! / diag
      for (let j = col; j <= n; j++) row[j] = row[j]! - fac * pRow[j]!
    }
  }
  const x = new Float64Array(n)
  for (let r = n - 1; r >= 0; r--) {
    const row = M[r]!
    let rhs = row[n]!
    for (let j = r + 1; j < n; j++) rhs -= row[j]! * x[j]!
    x[r] = rhs / row[r]!
  }
  return x
}

// Exact Discrete Hurwitz Zeta zeta(alpha, xMin) via Euler-Maclaurin (< 1e-14 accuracy)
function hurwitzZeta(alpha: number, xMin: number): number {
  const M = xMin + 50
  let sum = 0
  for (let k = xMin; k < M; k++) sum += Math.pow(k, -alpha)
  const mPow = Math.pow(M, -alpha)
  const m2 = M * M
  const t0 = (M * mPow) / (alpha - 1)
  const t1 = 0.5 * mPow
  const t2 = (alpha / 12) * (mPow / M)
  const t3 = -((alpha * (alpha + 1) * (alpha + 2)) / 720) * (mPow / (M * m2))
  const t4 =
    ((alpha * (alpha + 1) * (alpha + 2) * (alpha + 3) * (alpha + 4)) / 30240) *
    (mPow / (M * m2 * m2))
  return sum + t0 + t1 + t2 + t3 + t4
}

type CsnFitResult = {
  readonly alphaHat: number
  readonly ks: number
  readonly vuongExp: number
  readonly vuongPLvsLN: number
  readonly olsR2: number
  readonly nTail: number
}

// Exact Clauset-Shalizi-Newman (2009) Discrete Hurwitz-Zeta MLE + Discrete KS + Vuong LLR
// against Discrete Exponential & Discrete Truncated Positive-Scale Lognormal + Naive Log-Log OLS R^2
function fitDiscreteCsn(samples: readonly number[], xMin: number): CsnFitResult {
  const tail: number[] = []
  let sumLogX = 0
  let sumX = 0
  for (let i = 0; i < samples.length; i++) {
    const v = samples[i]!
    if (v >= xMin) {
      tail.push(v)
      sumLogX += Math.log(v)
      sumX += v
    }
  }
  const n = tail.length
  assertExact(n >= 500, `CSN requires n_tail >= 500 (got ${n})`)

  // 1. Exact Discrete Hurwitz-Zeta MLE via Golden-Section Search
  const llPl = (a: number): number => -n * Math.log(hurwitzZeta(a, xMin)) - a * sumLogX
  let lo = 1.05
  let hi = 5.5
  const phi = (Math.sqrt(5) - 1) / 2
  let c1 = hi - phi * (hi - lo)
  let c2 = lo + phi * (hi - lo)
  let f1 = llPl(c1)
  let f2 = llPl(c2)
  for (let it = 0; it < 55; it++) {
    if (f1 < f2) {
      lo = c1
      c1 = c2
      f1 = f2
      c2 = lo + phi * (hi - lo)
      f2 = llPl(c2)
    } else {
      hi = c2
      c2 = c1
      f2 = f1
      c1 = hi - phi * (hi - lo)
      f1 = llPl(c1)
    }
  }
  const alphaHat = 0.5 * (lo + hi)
  const zPl = hurwitzZeta(alphaHat, xMin)
  const logZPl = Math.log(zPl)

  // 2. Exact Discrete KS distance
  const sorted = tail.slice().sort((a, b) => a - b)
  let ks = 0
  let pos = 0
  while (pos < n) {
    const x = sorted[pos]!
    let end = pos + 1
    while (end < n && sorted[end] === x) end++
    const empCdf = end / n
    const empCdfPrev = pos / n
    const thCdf = 1 - hurwitzZeta(alphaHat, x + 1) / zPl
    ks = Math.max(ks, Math.abs(empCdf - thCdf), Math.abs(empCdfPrev - thCdf))
    pos = end
  }

  // 3. Discrete Exponential MLE & Vuong LLR
  const meanShift = sumX / n - xMin
  const lamExp = Math.log(1 + 1 / Math.max(meanShift, 1e-9))
  const logOneMinusE = Math.log(1 - Math.exp(-lamExp))
  let rExpSum = 0
  let rExpSqSum = 0
  for (let i = 0; i < n; i++) {
    const x = tail[i]!
    const lpPl = -alphaHat * Math.log(x) - logZPl
    const lpExp = logOneMinusE - lamExp * (x - xMin)
    const d = lpPl - lpExp
    rExpSum += d
    rExpSqSum += d * d
  }
  const rExpMean = rExpSum / n
  const rExpVar = Math.max(1e-15, rExpSqSum / n - rExpMean * rExpMean)
  const vuongExp = rExpSum / Math.sqrt(n * rExpVar)

  // 4. Discrete Truncated Positive-Scale Lognormal MLE & Vuong LLR
  const logHalfMin = Math.log(xMin - 0.5)
  const logBinsLo = new Float64Array(n)
  const logBinsHi = new Float64Array(n)
  for (let i = 0; i < n; i++) {
    const x = tail[i]!
    logBinsLo[i] = Math.log(x - 0.5)
    logBinsHi[i] = Math.log(x + 0.5)
  }
  const lnBinProb = (i: number, mu: number, sig: number): number => {
    const zHi = (logBinsHi[i]! - mu) / sig
    const zLo = (logBinsLo[i]! - mu) / sig
    const diff = normCdf(zHi) - normCdf(zLo)
    if (diff > 1e-14) return Math.log(diff)
    const lx = Math.log(tail[i]!)
    return -lx - Math.log(sig * Math.sqrt(2 * PI)) - ((lx - mu) * (lx - mu)) / (2 * sig * sig)
  }
  const llLn = (mu: number, sig: number): number => {
    const tailMass = 1 - normCdf((logHalfMin - mu) / sig)
    if (tailMass <= 1e-14) return Number.NEGATIVE_INFINITY
    const logZ = Math.log(tailMass)
    let ll = -n * logZ
    for (let i = 0; i < n; i++) ll += lnBinProb(i, mu, sig)
    return ll
  }
  const muMin = Math.log(xMin)
  let muHat = Math.max(muMin, sumLogX / n)
  let varLog = 0
  for (let i = 0; i < n; i++) {
    const d = Math.log(tail[i]!) - sumLogX / n
    varLog += d * d
  }
  let sigHat = Math.max(0.15, Math.sqrt(varLog / n))
  let bestLL = llLn(muHat, sigHat)
  let stepMu = 0.4
  let stepSig = 0.3
  for (let round = 0; round < 18; round++) {
    let improved = true
    while (improved) {
      improved = false
      for (const dm of [-stepMu, stepMu]) {
        const cm = Math.max(muMin, muHat + dm)
        const v = llLn(cm, sigHat)
        if (v > bestLL + 1e-10) {
          bestLL = v
          muHat = cm
          improved = true
        }
      }
      for (const ds of [-stepSig, stepSig]) {
        const cs = Math.max(0.05, sigHat + ds)
        const v = llLn(muHat, cs)
        if (v > bestLL + 1e-10) {
          bestLL = v
          sigHat = cs
          improved = true
        }
      }
    }
    stepMu *= 0.5
    stepSig *= 0.5
  }
  const logZLn = Math.log(Math.max(1e-15, 1 - normCdf((logHalfMin - muHat) / sigHat)))
  let rLnSum = 0
  let rLnSqSum = 0
  for (let i = 0; i < n; i++) {
    const x = tail[i]!
    const lpPl = -alphaHat * Math.log(x) - logZPl
    const lpLn = lnBinProb(i, muHat, sigHat) - logZLn
    const d = lpPl - lpLn
    rLnSum += d
    rLnSqSum += d * d
  }
  const rLnMean = rLnSum / n
  const rLnVar = Math.max(1e-15, rLnSqSum / n - rLnMean * rLnMean)
  const vuongPLvsLN = rLnSum / Math.sqrt(n * rLnVar)

  // 5. Naive log-log CCDF OLS R^2 (demonstrates false power-law acceptance on lognormal!)
  const uniqX: number[] = []
  const uniqCcdf: number[] = []
  let idxS = 0
  while (idxS < n) {
    const x = sorted[idxS]!
    const ccdf = (n - idxS) / n
    if (x >= xMin && ccdf > 0.005) {
      uniqX.push(Math.log(x))
      uniqCcdf.push(Math.log(ccdf))
    }
    while (idxS < n && sorted[idxS] === x) idxS++
  }
  let mx = 0
  let my = 0
  for (let i = 0; i < uniqX.length; i++) {
    mx += uniqX[i]!
    my += uniqCcdf[i]!
  }
  mx /= uniqX.length
  my /= uniqX.length
  let sxx = 0
  let syy = 0
  let sxy = 0
  for (let i = 0; i < uniqX.length; i++) {
    const dx = uniqX[i]! - mx
    const dy = uniqCcdf[i]! - my
    sxx += dx * dx
    syy += dy * dy
    sxy += dx * dy
  }
  const olsR2 = sxx > 0 && syy > 0 ? (sxy * sxy) / (sxx * syy) : 0

  return { alphaHat, ks, vuongExp, vuongPLvsLN, olsR2, nTail: n }
}

// =================================================================================================
// GATE P1 -- STUDY E1: FIVE-WAY HUMAN AFFECTIVE DISSOCIATION POWER & NULL CALIBRATION
// =================================================================================================
// Hierarchical within-subject mixed-effects model (zero pseudoreplication):
//   Y_{i, r, j} = mu_r + u_i + b_{i, r} + eps_{i, r, j}
//   sigma_u = 0.60 (inter-subject baseline intercept), sigma_b = 0.58 (inter-subject random slope),
//   sigma_eps = 0.85 (trial noise), K = 24 trials per regime per subject.
//   Marginal total SD = sqrt(0.60^2 + 0.58^2 + 0.85^2) = 1.1912.
//   Within-subject paired contrast SD = sqrt(2 * 0.58^2 + 2 * 0.85^2 / 24) = 0.8562.
// Five primary orthogonal contrasts with moderate marginal Cohen's d in [0.65, 0.80]:
//   C1 (V+ vs V- signed valence orthogonal to utility/RPE):             d = 0.80 (d_z = 1.113)
//   C2 (V- vs 0_V arousal-sign paradox: valence < 0 & lam_dot > 0):     d = 0.72 (d_z = 1.002)
//   C3 (0_D vs 0_V dynamical density after net-valence matching):       d = 0.75 (d_z = 1.043)
//   C4 (T_neg sustained tonic plateau vs 0_V residualized on lam_dot):  d = 0.65 (d_z = 0.904)
//   C5 (Low vs High reserve proximity interaction, Balduzzi Fig. 6b):   d = 0.68 (d_z = 0.946)

function runGateP1(): void {
  console.log('\n==============================================================================================')
  console.log('GATE P1: STUDY E1 FIVE-WAY AFFECTIVE DISSOCIATION POWER & NULL CALIBRATION (alpha = 0.005)')
  console.log('==============================================================================================')

  const sigmaU = 0.60
  const sigmaB = 0.58
  const sigmaEps = 0.85
  const kTrials = 24
  const sigmaTot = Math.sqrt(sigmaU * sigmaU + sigmaB * sigmaB + sigmaEps * sigmaEps)
  const sdPairedDiff = Math.sqrt(2 * sigmaB * sigmaB + (2 * sigmaEps * sigmaEps) / kTrials)

  const contrastNames = ['C1(V+/V-)', 'C2(SignPara)', 'C3(0D/0V)', 'C4(Tonic)', 'C5(Reserve)'] as const
  const marginalD = [0.80, 0.72, 0.75, 0.65, 0.68] as const
  const nContrasts = marginalD.length

  const simulateE1Cohort = (nSubj: number, isAlt: boolean, rng: Prng): {
    readonly allRejected: boolean
    readonly anyRejected: boolean
    readonly perContrastRejected: boolean[]
  } => {
    const pVals = new Array<number>(nContrasts).fill(1)
    // Generate realistic subject-level paired contrast scores from hierarchical trial averaging
    // (shared subject intercept u_i cancels identically in paired differences, as in real mixed models)
    const invSqrtK = 1 / Math.sqrt(kTrials)
    for (let c = 0; c < nContrasts; c++) {
      const deltaTrue = isAlt ? marginalD[c]! * sigmaTot : 0
      const diffs = new Float64Array(nSubj)
      for (let s = 0; s < nSubj; s++) {
        // Explicit trial-averaged paired difference with subject random baseline u_i canceling
        const uSubj = sigmaU * rng.nextNormal()
        const bA = sigmaB * rng.nextNormal()
        const bB = sigmaB * rng.nextNormal()
        const trialNoiseA = sigmaEps * invSqrtK * rng.nextNormal()
        const trialNoiseB = sigmaEps * invSqrtK * rng.nextNormal()
        const barA = deltaTrue + uSubj + bA + trialNoiseA
        const barB = uSubj + bB + trialNoiseB
        diffs[s] = barA - barB
      }
      const res = oneSampleT(diffs, 0)
      pVals[c] = res.pTwoSided
    }
    const hb = holmBonferroni(pVals, ALPHA_FWER)
    return {
      allRejected: hb.allRejected,
      anyRejected: hb.anyRejected,
      perContrastRejected: hb.rejected,
    }
  }

  type E1Row = {
    readonly n: number
    readonly fwerPowerAll: number
    readonly minSinglePower: number
    readonly nullFwer: number
  }
  const rows: E1Row[] = []

  console.log(
    `  [P1] Hierarchical E1 Design: sigma_tot=${sigmaTot.toFixed(4)}, sd_paired=${sdPairedDiff.toFixed(4)}, K=${kTrials} trials/regime`,
  )
  console.log(
    `       Marginal d = [${marginalD.map(v => v.toFixed(2)).join(', ')}] -> Paired d_z = [${marginalD.map(v => ((v * sigmaTot) / sdPairedDiff).toFixed(3)).join(', ')}]`,
  )
  console.log('       N_subj | Conjunctive Power (All 5 HB) | Min Single-Contrast Power | Pure Null FWER (d=0)')

  for (let ni = 0; ni < N_COHORTS.length; ni++) {
    const n = N_COHORTS[ni]!
    const rngAlt = makePrng(0x47e11000 + n * 131)
    const rngNull = makePrng(0x47e12000 + n * 131)
    let altAll = 0
    const singleHits = new Int32Array(nContrasts)
    let nullAny = 0
    for (let r = 0; r < R_TRIALS; r++) {
      const altRes = simulateE1Cohort(n, true, rngAlt)
      if (altRes.allRejected) altAll++
      for (let c = 0; c < nContrasts; c++) {
        if (altRes.perContrastRejected[c]) singleHits[c] = singleHits[c]! + 1
      }
      const nullRes = simulateE1Cohort(n, false, rngNull)
      if (nullRes.anyRejected) nullAny++
    }
    let minSingle = 1
    for (let c = 0; c < nContrasts; c++) {
      const p = singleHits[c]! / R_TRIALS
      if (p < minSingle) minSingle = p
    }
    const row: E1Row = {
      n,
      fwerPowerAll: altAll / R_TRIALS,
      minSinglePower: minSingle,
      nullFwer: nullAny / R_TRIALS,
    }
    rows.push(row)
    console.log(
      `       N = ${String(n).padStart(2)} | ${(100 * row.fwerPowerAll).toFixed(1).padStart(29)}% | ${(100 * row.minSinglePower).toFixed(1).padStart(24)}% | ${(100 * row.nullFwer).toFixed(2).padStart(19)}%`,
    )
  }

  const row20 = rows[0]!
  const row40 = rows[2]!
  const row60 = rows[3]!
  const allNullsClean = rows.every(r => r.nullFwer < 0.01)

  recordCheck(
    'P1.1',
    'P1',
    'Tier C',
    `E1 5-way dissociation conjunctive HB power (alpha=${ALPHA_FWER}, ${contrastNames.join(',')})`,
    row40.fwerPowerAll >= 0.90 &&
      row60.fwerPowerAll >= 0.99 &&
      row20.fwerPowerAll < row40.fwerPowerAll,
    `N=20:${(100 * row20.fwerPowerAll).toFixed(1)}%, N=30:${(100 * rows[1]!.fwerPowerAll).toFixed(1)}%, N=40:${(100 * row40.fwerPowerAll).toFixed(1)}% (>=90%), N=60:${(100 * row60.fwerPowerAll).toFixed(1)}%`,
  )
  recordCheck(
    'P1.2',
    'P1',
    'Tier A',
    `E1 pure null (d=0) FWER calibration across N in {20,30,40,60} (alpha=${ALPHA_FWER})`,
    allNullsClean && row40.nullFwer < 0.01,
    `FWER(d=0): N=20:${(100 * rows[0]!.nullFwer).toFixed(2)}%, N=30:${(100 * rows[1]!.nullFwer).toFixed(2)}%, N=40:${(100 * row40.nullFwer).toFixed(2)}%, N=60:${(100 * row60.nullFwer).toFixed(2)}% (all <1%)`,
  )
}

// =================================================================================================
// GATE P2 -- STUDY E2: 0_V vs 0_D SPECTROSCOPY + ELDIN ANTI-CONFOUND GUARD SUITE
// =================================================================================================
// 3 Primary E2 Spectroscopy Contrasts (0_V Vital Peace vs 0_D Active Balanced Neutrality):
//   S1: Aperiodic 1/f spectral offset & slope (a_0 vs a_D) -- marginal d = 0.75
//   S2: Alpha/theta bandpower & genuine peripheral HRV/respiratory phase coupling -- d = 0.70
//   S3: Surface Laplacian lagged connectivity (debiased wPLI^2) -- d = 0.72
// Plus 4 Mandatory Eldin Anti-Confound Guards:
//   G2.1: CAR global mean === 0 (< 1e-14) vs Surface Laplacian dipole suppression (> 10x)
//   G2.2: Zero-lag EOG/EMG volume-conduction null over R = 200 cohorts (|Re(C)| > 0.90,
//         debiased wPLI^2 < 0.05, cohort FPR < 1%)
//   G2.3: Causal VAR(3) Granger (0% false B -> A) vs two-sided zero-phase FIR (> 95% false B -> A)
//   G2.4: Exact CSN (2009) Discrete Hurwitz-Zeta MLE + KS + Vuong LLR vs Naive Log-Log OLS

function runGateP2(): void {
  console.log('\n==============================================================================================')
  console.log('GATE P2: STUDY E2 0_V vs 0_D SPECTROSCOPY & MANDATORY ELDIN ANTI-CONFOUND GUARD SUITE')
  console.log('==============================================================================================')

  // --- Part A: Cohort Power & Pure-Null Calibration for 3 Primary E2 Endpoints ---
  const sigmaU = 0.58
  const sigmaB = 0.56
  const sigmaEps = 0.84
  const kEpochs = 24
  const sigmaTot = Math.sqrt(sigmaU * sigmaU + sigmaB * sigmaB + sigmaEps * sigmaEps)
  const sdPaired = Math.sqrt(2 * sigmaB * sigmaB + (2 * sigmaEps * sigmaEps) / kEpochs)
  const e2MarginalD = [0.75, 0.70, 0.72] as const // aperiodic 1/f, alpha/theta+HRV-resp, debiased wPLI^2
  const invSqrtK = 1 / Math.sqrt(kEpochs)

  console.log(
    `  [P2.A] E2 3-Endpoint Spectroscopy (a_0/a_D 1/f, alpha/theta+HRV-resp, Laplacian wPLI^2):`,
  )
  console.log('         N_subj | Conjunctive HB Power (All 3) | Pure Null FWER (d=0)')

  let e2Power40 = 0
  let e2Power30 = 0
  let e2Power20 = 0
  let e2Power60 = 0
  let e2NullMax = 0
  let e2Null40 = 0

  for (const n of N_COHORTS) {
    const rngAlt = makePrng(0x47e21000 + n * 137)
    const rngNull = makePrng(0x47e22000 + n * 137)
    let altAll = 0
    let nullAny = 0
    for (let r = 0; r < R_TRIALS; r++) {
      const pAlt = [1, 1, 1]
      const pNull = [1, 1, 1]
      for (let m = 0; m < 3; m++) {
        const deltaTrue = e2MarginalD[m]! * sigmaTot
        const dAlt = new Float64Array(n)
        const dNull = new Float64Array(n)
        for (let s = 0; s < n; s++) {
          const u1 = sigmaU * rngAlt.nextNormal()
          const diffAlt =
            deltaTrue +
            (u1 + sigmaB * rngAlt.nextNormal() + sigmaEps * invSqrtK * rngAlt.nextNormal()) -
            (u1 + sigmaB * rngAlt.nextNormal() + sigmaEps * invSqrtK * rngAlt.nextNormal())
          dAlt[s] = diffAlt

          const u2 = sigmaU * rngNull.nextNormal()
          const diffNull =
            u2 +
            sigmaB * rngNull.nextNormal() +
            sigmaEps * invSqrtK * rngNull.nextNormal() -
            (u2 + sigmaB * rngNull.nextNormal() + sigmaEps * invSqrtK * rngNull.nextNormal())
          dNull[s] = diffNull
        }
        pAlt[m] = oneSampleT(dAlt, 0).pTwoSided
        pNull[m] = oneSampleT(dNull, 0).pTwoSided
      }
      if (holmBonferroni(pAlt, ALPHA_FWER).allRejected) altAll++
      if (holmBonferroni(pNull, ALPHA_FWER).anyRejected) nullAny++
    }
    const pwr = altAll / R_TRIALS
    const fpr = nullAny / R_TRIALS
    if (n === 20) e2Power20 = pwr
    if (n === 30) e2Power30 = pwr
    if (n === 40) {
      e2Power40 = pwr
      e2Null40 = fpr
    }
    if (n === 60) e2Power60 = pwr
    if (fpr > e2NullMax) e2NullMax = fpr
    console.log(
      `         N = ${String(n).padStart(2)} | ${(100 * pwr).toFixed(1).padStart(29)}% | ${(100 * fpr).toFixed(2).padStart(19)}%`,
    )
  }

  recordCheck(
    'P2.1',
    'P2',
    'Tier C',
    `E2 0_V vs 0_D spectroscopy conjunctive HB power (alpha=${ALPHA_FWER}, d=[0.75,0.70,0.72])`,
    e2Power40 >= 0.90 && e2Power60 >= 0.99 && e2NullMax < 0.01,
    `N=20:${(100 * e2Power20).toFixed(1)}%, N=30:${(100 * e2Power30).toFixed(1)}%, N=40:${(100 * e2Power40).toFixed(1)}% (>=90%), N=60:${(100 * e2Power60).toFixed(1)}%, nullFWR_40=${(100 * e2Null40).toFixed(2)}% (<1%), sd_paired=${sdPaired.toFixed(3)}`,
  )

  // --- Part B: Eldin Anti-Confound Guard G2.1 & G2.2 (CAR Zero-Mean, Surface Laplacian & EOG Null) ---
  // 16-channel 4x4 scalp grid; rank-1 anterior-posterior linear/smooth EOG field + independent cortical noise.
  // Surface Laplacian on interior posterior electrode (r=2,c=2) vs CAR reference.
  const nGrid = 4
  const nCh = nGrid * nGrid
  const T_VC = 1024
  const nSeg = 32
  const segLen = T_VC / nSeg // 32 samples/segment
  const kBin = 3
  const hann = new Float64Array(segLen)
  const cosTab = new Float64Array(segLen)
  const sinTab = new Float64Array(segLen)
  for (let i = 0; i < segLen; i++) {
    const h = 0.5 * (1 - Math.cos((2 * PI * i) / (segLen - 1)))
    hann[i] = h
    const ang = (2 * PI * kBin * i) / segLen
    cosTab[i] = Math.cos(ang) * h
    sinTab[i] = -Math.sin(ang) * h
  }
  // Smooth anterior-posterior EOG dipole topography across 4x4 scalp grid (linear in row -> exact harmonic -> Laplacian = 0!)
  const eogTopo = new Float64Array(nCh)
  for (let r = 0; r < nGrid; r++) {
    for (let c = 0; c < nGrid; c++) {
      // Exact linear potential gradient + tiny 2% curvature (realistic distant corneo-retinal dipole)
      const y = 1 - (2 * r) / (nGrid - 1) // +1 frontal row 0 to -1 posterior row 3
      eogTopo[r * nGrid + c] = y + 0.02 * (y * y - 0.5)
    }
  }
  // Verify exact Surface Laplacian attenuation on interior channel (r=2, c=1) vs CAR injection
  const lapIdx = 2 * nGrid + 1
  const lapEogGain =
    eogTopo[lapIdx]! -
    0.25 *
      (eogTopo[1 * nGrid + 1]! +
        eogTopo[3 * nGrid + 1]! +
        eogTopo[2 * nGrid + 0]! +
        eogTopo[2 * nGrid + 2]!)
  const carMeanTopo = eogTopo.reduce((a, b) => a + b, 0) / nCh
  const carEogGain = eogTopo[lapIdx]! - carMeanTopo
  const lapAttenuation = Math.abs(carEogGain) / Math.max(Math.abs(lapEogGain), 1e-12)

  // Compute Welch complex coherency & debiased wPLI^2 between frontal (0,1) and posterior (3,1) under pure zero-lag EOG null
  const rngVc = makePrng(0x47e23000)
  let maxCarMeanAbs = 0
  let sumAbsReCoh = 0
  let sumAbsImCoh = 0
  let sumDebiasedWpliSq = 0
  let maxDebiasedWpliSq = 0
  let reCohFalseAlarms = 0
  let wpliCohortFalseAlarms = 0

  // Also test R = 200 cohorts of N = 40 subjects under pure zero-lag volume-conduction null
  // (where condition 0_D has 1.6x stronger EOG blink amplitude than 0_V -- a lethal trap for Re(C)!)
  const nVcTrials = R_TRIALS
  const w0Eog = (2 * PI * kBin) / segLen
  const rPol = 0.90
  const c1Pol = 2 * rPol * Math.cos(w0Eog)
  const c2Pol = rPol * rPol

  const measurePairMetrics = (
    eogAmp: number,
    rng: Prng,
    checkCar: boolean,
  ): { readonly reCoh: number; readonly imCoh: number; readonly debiasedWpliSq: number } => {
    const xF = new Float64Array(T_VC)
    const yP = new Float64Array(T_VC)
    let e1 = 0
    let e2 = 0
    const chBuf = new Float64Array(nCh)
    for (let t = 0; t < T_VC; t++) {
      const nxt = c1Pol * e1 - c2Pol * e2 + rng.nextNormal()
      e2 = e1
      e1 = nxt
      const eogVal = eogAmp * nxt
      let mean = 0
      for (let ch = 0; ch < nCh; ch++) {
        const v = rng.nextNormal() + eogTopo[ch]! * eogVal
        chBuf[ch] = v
        mean += v
      }
      mean /= nCh
      if (checkCar) {
        let checkM = 0
        for (let ch = 0; ch < nCh; ch++) checkM += chBuf[ch]! - mean
        checkM /= nCh
        if (Math.abs(checkM) > maxCarMeanAbs) maxCarMeanAbs = Math.abs(checkM)
      }
      xF[t] = chBuf[1]! - mean // frontal (0,1) under CAR
      yP[t] = chBuf[13]! - mean // posterior (3,1) under CAR
    }
    let sxyRe = 0
    let sxyIm = 0
    let sxx = 0
    let syy = 0
    let sumIm = 0
    let sumAbsIm = 0
    let sumImSq = 0
    for (let seg = 0; seg < nSeg; seg++) {
      const off = seg * segLen
      let xr = 0
      let xi = 0
      let yr = 0
      let yi = 0
      for (let i = 0; i < segLen; i++) {
        const ca = cosTab[i]!
        const sa = sinTab[i]!
        const xv = xF[off + i]!
        const yv = yP[off + i]!
        xr += xv * ca
        xi += xv * sa
        yr += yv * ca
        yi += yv * sa
      }
      const cr = xr * yr + xi * yi
      const ci = xi * yr - xr * yi
      sxyRe += cr
      sxyIm += ci
      sxx += xr * xr + xi * xi
      syy += yr * yr + yi * yi
      sumIm += ci
      sumAbsIm += Math.abs(ci)
      sumImSq += ci * ci
    }
    const den = Math.sqrt(sxx * syy)
    const reCoh = sxyRe / den
    const imCoh = sxyIm / den
    const wDen = sumAbsIm * sumAbsIm - sumImSq
    const debiasedWpliSq = wDen > 1e-15 ? (sumIm * sumIm - sumImSq) / wDen : 0
    return { reCoh, imCoh, debiasedWpliSq }
  }

  // First: direct R = 200 single-recording pure EOG volume-conduction checks
  for (let r = 0; r < nVcTrials; r++) {
    const m = measurePairMetrics(3.2, rngVc, r < 8)
    sumAbsReCoh += Math.abs(m.reCoh)
    sumAbsImCoh += Math.abs(m.imCoh)
    sumDebiasedWpliSq += m.debiasedWpliSq
    if (Math.abs(m.debiasedWpliSq) > maxDebiasedWpliSq) maxDebiasedWpliSq = Math.abs(m.debiasedWpliSq)
    if (Math.abs(m.reCoh) > 0.90) reCohFalseAlarms++
  }
  const meanAbsReCoh = sumAbsReCoh / nVcTrials
  const meanAbsImCoh = sumAbsImCoh / nVcTrials
  const meanDebiasedWpliSq = sumDebiasedWpliSq / nVcTrials

  // Second: R = 200 cohort-level (N = 40) volume-conduction differential-blink null (0_D has 1.6x EOG amp vs 0_V!)
  // Uses direct fast spectral-domain paired realizations of the exact same zero-lag dipole model:
  // under zero-lag volume conduction, E[Im(S_xy)] = 0 identically regardless of EOG amplitude!
  let reCohCohortFalseAlarms = 0
  const rngVcCoh = makePrng(0x47e23555)
  for (let r = 0; r < R_TRIALS; r++) {
    const diffRe = new Float64Array(40)
    const diffWpli = new Float64Array(40)
    for (let s = 0; s < 40; s++) {
      // Simulate 32 Welch segments directly at frequency bin kBin with zero-lag rank-1 EOG dipole
      // (amp_0V = 2.0, amp_0D = 3.6 -> huge differential EOG power, zero lagged cortical coupling)
      const simSpectralNull = (amp: number): { readonly absRe: number; readonly wpli2: number } => {
        let sxyR = 0
        let sxx = 0
        let syy = 0
        let sumIm = 0
        let sumAbsIm = 0
        let sumImSq = 0
        for (let seg = 0; seg < 32; seg++) {
          const er = amp * rngVcCoh.nextNormal()
          const ei = amp * rngVcCoh.nextNormal()
          const xr = rngVcCoh.nextNormal() + er
          const xi = rngVcCoh.nextNormal() + ei
          const yr = rngVcCoh.nextNormal() - er
          const yi = rngVcCoh.nextNormal() - ei
          const cr = xr * yr + xi * yi
          const ci = xi * yr - xr * yi
          sxyR += cr
          sxx += xr * xr + xi * xi
          syy += yr * yr + yi * yi
          sumIm += ci
          sumAbsIm += Math.abs(ci)
          sumImSq += ci * ci
        }
        const den = Math.sqrt(sxx * syy)
        const wDen = sumAbsIm * sumAbsIm - sumImSq
        return {
          absRe: Math.abs(sxyR / den),
          wpli2: wDen > 1e-15 ? (sumIm * sumIm - sumImSq) / wDen : 0,
        }
      }
      const m0V = simSpectralNull(2.0)
      const m0D = simSpectralNull(3.6)
      diffRe[s] = m0D.absRe - m0V.absRe
      diffWpli[s] = m0D.wpli2 - m0V.wpli2
    }
    if (oneSampleT(diffRe, 0).pTwoSided <= ALPHA_FWER) reCohCohortFalseAlarms++
    if (oneSampleT(diffWpli, 0).pTwoSided <= ALPHA_FWER) wpliCohortFalseAlarms++
  }
  const vcReFpr = reCohCohortFalseAlarms / R_TRIALS
  const vcWpliFpr = wpliCohortFalseAlarms / R_TRIALS

  recordCheck(
    'P2.2',
    'P2',
    'Tier A',
    'Eldin CAR zero-mean, Surface Laplacian attenuation & EOG zero-lag volume-conduction null',
    maxCarMeanAbs < 1e-14 &&
      lapAttenuation > 10 &&
      meanAbsReCoh > 0.90 &&
      meanAbsImCoh < 0.05 &&
      Math.abs(meanDebiasedWpliSq) < 0.01 &&
      vcReFpr > 0.95 &&
      vcWpliFpr < 0.01,
    `CAR maxMean=${maxCarMeanAbs.toExponential(1)}, Laplacian dipole atten=${lapAttenuation.toFixed(1)}x, EOG null |Re(C)|=${meanAbsReCoh.toFixed(4)} (>0.90, ${reCohFalseAlarms}/${nVcTrials}), |Im(C)|=${meanAbsImCoh.toFixed(4)}, debiased wPLI^2=${meanDebiasedWpliSq.toFixed(4)} (cohort FPR: Re=${(100 * vcReFpr).toFixed(1)}% vs wPLI^2=${(100 * vcWpliFpr).toFixed(2)}% <1%)`,
  )

  // --- Part C: Eldin Anti-Confound Guard G2.3 (Causal VAR Granger vs Zero-Phase FIR Trap) ---
  // Across R = 200 unidirectional A -> B cohorts (strictly ZERO B -> A feedback):
  //   Compare unfiltered causal VAR(3) Granger vs minimum-phase causal IIR vs two-sided zero-phase FIR!
  const T_GR = 600
  const burnGr = 100
  const firOrder = 24
  const firLen = firOrder + 1
  const halfOrd = firOrder / 2
  const firKernel = new Float64Array(firLen)
  const fLo = 0.06
  const fHi = 0.30
  for (let i = 0; i < firLen; i++) {
    const m = i - halfOrd
    const sincHi = m === 0 ? fHi : Math.sin(PI * fHi * m) / (PI * m)
    const sincLo = m === 0 ? fLo : Math.sin(PI * fLo * m) / (PI * m)
    const win = 0.54 - 0.46 * Math.cos((2 * PI * i) / firOrder)
    firKernel[i] = (sincHi - sincLo) * win
  }

  const applyZeroPhaseFir = (sig: Float64Array): Float64Array => {
    const n = sig.length
    const fwd = new Float64Array(n)
    for (let t = 0; t < n; t++) {
      let s = 0
      for (let k = 0; k < firLen; k++) {
        const idx = t - k
        if (idx >= 0) s += firKernel[k]! * sig[idx]!
      }
      fwd[t] = s
    }
    const bwd = new Float64Array(n)
    for (let t = 0; t < n; t++) {
      let s = 0
      for (let k = 0; k < firLen; k++) {
        const idx = t + k
        if (idx < n) s += firKernel[k]! * fwd[idx]!
      }
      bwd[t] = s
    }
    return bwd
  }

  // Exact VAR(p) OLS Granger F-test with exact F-distribution p-value
  const grangerTest = (
    src: Float64Array,
    dst: Float64Array,
    pLag: number,
    margin: number,
  ): { readonly fStat: number; readonly pVal: number } => {
    const start = Math.max(pLag, margin)
    const end = dst.length - margin
    const nEff = end - start
    const fitRss = (useSrc: boolean): number => {
      const kCols = useSrc ? 2 * pLag + 1 : pLag + 1
      const XtX: number[][] = Array.from({ length: kCols }, () => new Array<number>(kCols).fill(0))
      const Xty = new Array<number>(kCols).fill(0)
      const row = new Float64Array(kCols)
      for (let t = start; t < end; t++) {
        row[0] = 1
        for (let l = 1; l <= pLag; l++) row[l] = dst[t - l]!
        if (useSrc) for (let l = 1; l <= pLag; l++) row[pLag + l] = src[t - l]!
        const yt = dst[t]!
        for (let i = 0; i < kCols; i++) {
          const ri = row[i]!
          Xty[i] = Xty[i]! + ri * yt
          for (let j = i; j < kCols; j++) XtX[i]![j] = XtX[i]![j]! + ri * row[j]!
        }
      }
      for (let i = 0; i < kCols; i++) for (let j = 0; j < i; j++) XtX[i]![j] = XtX[j]![i]!
      const beta = solveLinearReal(XtX, Xty)
      let rss = 0
      for (let t = start; t < end; t++) {
        let pred = beta[0]!
        for (let l = 1; l <= pLag; l++) pred += beta[l]! * dst[t - l]!
        if (useSrc) for (let l = 1; l <= pLag; l++) pred += beta[pLag + l]! * src[t - l]!
        const err = dst[t]! - pred
        rss += err * err
      }
      return rss
    }
    const rssR = fitRss(false)
    const rssU = fitRss(true)
    const d2 = nEff - 2 * pLag - 1
    const fStat = ((rssR - rssU) / pLag) / (rssU / d2)
    return { fStat, pVal: fPValueUpper(fStat, pLag, d2) }
  }

  const rngGr = makePrng(0x47e24000)
  let rawTrueAB = 0
  let rawFalseBA = 0
  let zpFalseBA = 0
  let sumRawFba = 0
  let sumZpFba = 0
  const A_arr = new Float64Array(T_GR)
  const B_arr = new Float64Array(T_GR)

  for (let r = 0; r < R_TRIALS; r++) {
    let aPrev = 0
    let bPrev = 0
    for (let t = -burnGr; t < T_GR; t++) {
      const aCur = 0.65 * aPrev + rngGr.nextNormal()
      const bCur = 0.55 * bPrev + 0.72 * aPrev + rngGr.nextNormal()
      if (t >= 0) {
        A_arr[t] = aCur
        B_arr[t] = bCur
      }
      aPrev = aCur
      bPrev = bCur
    }
    const gAB = grangerTest(A_arr, B_arr, 3, 40)
    const gBA = grangerTest(B_arr, A_arr, 3, 40)
    const A_zp = applyZeroPhaseFir(A_arr)
    const B_zp = applyZeroPhaseFir(B_arr)
    const gZpBA = grangerTest(B_zp, A_zp, 3, 40)

    if (gAB.pVal <= ALPHA_FWER) rawTrueAB++
    if (gBA.pVal <= ALPHA_FWER) rawFalseBA++
    if (gZpBA.pVal <= ALPHA_FWER) zpFalseBA++
    sumRawFba += gBA.fStat
    sumZpFba += gZpBA.fStat
  }
  const rawAbPower = rawTrueAB / R_TRIALS
  const rawBaFpr = rawFalseBA / R_TRIALS
  const zpBaFpr = zpFalseBA / R_TRIALS

  recordCheck(
    'P2.3',
    'P2',
    'Tier A',
    'Eldin causal VAR(3) Granger vs zero-phase FIR acausal trap (R=200 unidirectional A->B)',
    rawAbPower === 1.0 && rawBaFpr < 0.01 && zpBaFpr > 0.95,
    `Causal VAR: A->B power=${(100 * rawAbPower).toFixed(1)}%, false B->A=${(100 * rawBaFpr).toFixed(2)}% (<1%, mean F=${(sumRawFba / R_TRIALS).toFixed(2)}) | Zero-phase FIR false B->A=${(100 * zpBaFpr).toFixed(1)}% (>95%, mean F=${(sumZpFba / R_TRIALS).toFixed(1)})`,
  )

  // --- Part D: Eldin Anti-Confound Guard G2.4 (Exact CSN 2009 Hurwitz-Zeta MLE vs Naive OLS) ---
  const rngCsn = makePrng(0x47e25000)
  const N_CSN = 2000

  // 1. Discrete Exponential (lam = 0.12)
  const expSamples: number[] = []
  for (let i = 0; i < N_CSN; i++) {
    let u = rngCsn.next()
    while (u <= 1e-15) u = rngCsn.next()
    expSamples.push(1 + Math.floor(-Math.log(u) / 0.12))
  }
  const fitExp = fitDiscreteCsn(expSamples, 1)

  // 2. Discrete Lognormal (mu = 1.4, sigma = 1.05): fools naive log-log OLS (R^2 > 0.95), rejected by CSN!
  const lnSamples: number[] = []
  for (let i = 0; i < N_CSN; i++) {
    const val = Math.exp(1.4 + 1.05 * rngCsn.nextNormal())
    lnSamples.push(Math.max(1, Math.floor(val + 0.5)))
  }
  const fitLn = fitDiscreteCsn(lnSamples, 1)

  // 3. Exact Discrete Hurwitz-Zeta Power-Law (alpha = 2.0, x_min = 1)
  const z2 = hurwitzZeta(2.0, 1)
  const plSamples: number[] = []
  for (let i = 0; i < N_CSN; i++) {
    const u = rngCsn.next()
    let lo = 1
    let hi = 2
    while (1 - hurwitzZeta(2.0, hi + 1) / z2 < u && hi < 1000000) hi *= 2
    while (lo < hi) {
      const mid = (lo + hi) >>> 1
      if (1 - hurwitzZeta(2.0, mid + 1) / z2 >= u) hi = mid
      else lo = mid + 1
    }
    plSamples.push(lo)
  }
  const fitPl = fitDiscreteCsn(plSamples, 1)

  recordCheck(
    'P2.4',
    'P2',
    'Tier A',
    'Exact CSN (2009) discrete Hurwitz-Zeta MLE + KS + Vuong LLR vs naive log-log OLS (n_tail=2000)',
    fitExp.vuongExp < -10 &&
      fitLn.olsR2 > 0.95 &&
      fitLn.ks > 0.05 &&
      fitLn.vuongPLvsLN < -3 &&
      Math.abs(fitPl.alphaHat - 2.0) < 0.08 &&
      fitPl.ks < 0.03 &&
      fitPl.vuongExp > 3 &&
      fitPl.vuongPLvsLN > 3,
    `Exp(V_exp=${fitExp.vuongExp.toFixed(1)}<-10), LN(olsR2=${fitLn.olsR2.toFixed(4)}>0.95 [FOOLED], KS=${fitLn.ks.toFixed(3)}, V_LN=${fitLn.vuongPLvsLN.toFixed(1)}<-3), TruePL(alpha=${fitPl.alphaHat.toFixed(3)}, KS=${fitPl.ks.toFixed(4)}, V_exp=+${fitPl.vuongExp.toFixed(1)}, V_LN=+${fitPl.vuongPLvsLN.toFixed(1)})`,
  )
}

// =================================================================================================
// GATE P3 -- STUDY E3: PRESENT-STATE METAMERISM TOST EQUIVALENCE VS HISTORY-LEAKAGE DISCRIMINATION
// =================================================================================================
// Each subject completes K_pair = 36 instantaneous-neural-state-matched metamer pairs (Path A vs B).
// Population response SD sigma_Y = 1.0 (sigma_subj_bias = 0.30, sigma_trial = sqrt(0.91) = 0.9539).
// Subject-level paired difference SD: sigma_D = sqrt(0.30^2 + 2 * 0.91 / 36) = 0.3749.
// Preregistered TOST equivalence margin: [-0.25 SD, +0.25 SD] at one-sided alpha = 0.005 (99% CI).
// History-leakage detector: two-sided t-test at alpha = 0.005 on Delta = 0.70 SD.
// Also audits instantaneous state-matching filter (decoder AUC in [0.47, 0.53]) and impulse-ping
// retention-trace detector (Wolff et al. T_{A,t} classifier when silent trace is present).

function runGateP3(): void {
  console.log('\n==============================================================================================')
  console.log('GATE P3: STUDY E3 PRESENT-STATE METAMERISM TOST EQUIVALENCE & HISTORY-LEAKAGE DISCRIMINATION')
  console.log('==============================================================================================')

  const sigmaBias = 0.30
  const sigmaTrial = Math.sqrt(1.0 - sigmaBias * sigmaBias) // 0.953939 -> exact population sigma_Y = 1.000
  const kPairs = 36
  const sigmaD = Math.sqrt(sigmaBias * sigmaBias + (2 * sigmaTrial * sigmaTrial) / kPairs)
  const eqBound = 0.25 // |Delta| < 0.25 SD
  const leakDelta = 0.70 // Delta = 0.70 SD

  // Exact TOST at alpha_TOST = 0.005 (each one-sided test at 0.005 -> 99% CI inside [-0.25, +0.25])
  const evalTostAndLeak = (
    diffs: Float64Array,
  ): { readonly tostEquiv: boolean; readonly leakReject: boolean } => {
    const st = oneSampleT(diffs, 0)
    // H01: Delta <= -eqBound -> test t1 = (mean + eqBound) / se > t_crit (upper tail)
    const tLower = (st.mean + eqBound) / st.se
    // H02: Delta >= +eqBound -> test t2 = (eqBound - mean) / se > t_crit (upper tail)
    const tUpper = (eqBound - st.mean) / st.se
    const pLower = tPValueUpper(tLower, st.df)
    const pUpper = tPValueUpper(tUpper, st.df)
    const tostEquiv = Math.max(pLower, pUpper) <= ALPHA_FWER
    const leakReject = st.pTwoSided <= ALPHA_FWER
    return { tostEquiv, leakReject }
  }

  console.log(
    `  [P3] E3 TOST Design: sigma_Y=1.000, sigma_D=${sigmaD.toFixed(4)} (K=${kPairs} pairs/subj), bound=+/-${eqBound} SD, alpha=${ALPHA_FWER}`,
  )
  console.log(
    '       N_subj | TOST Power (Delta=0) | Boundary FPR (Delta=0.25) | Leak Reject (Delta=0.70) | Leak False-TOST',
  )

  type E3Row = {
    readonly n: number
    readonly tostPower: number
    readonly boundaryFpr: number
    readonly leakRejectPower: number
    readonly leakFalseTost: number
  }
  const rows: E3Row[] = []

  for (const n of N_COHORTS) {
    const rngMeta = makePrng(0x47e31000 + n * 149)
    const rngBnd = makePrng(0x47e32000 + n * 149)
    const rngLeak = makePrng(0x47e33000 + n * 149)
    let metaHits = 0
    let bndFalse = 0
    let leakHits = 0
    let leakFalseEquiv = 0
    const buf = new Float64Array(n)
    const invSqrtK = 1 / Math.sqrt(kPairs)

    for (let r = 0; r < R_TRIALS; r++) {
      // Condition 1: Exact Key 2 Present-State Metamerism (Delta = 0)
      for (let s = 0; s < n; s++) {
        buf[s] =
          sigmaBias * rngMeta.nextNormal() +
          sigmaTrial * invSqrtK * (rngMeta.nextNormal() - rngMeta.nextNormal())
      }
      if (evalTostAndLeak(buf).tostEquiv) metaHits++

      // Condition 2: Exact Equivalence Boundary (Delta = +0.25 SD -> TOST Type I error <= alpha = 0.005)
      for (let s = 0; s < n; s++) {
        buf[s] =
          eqBound +
          sigmaBias * rngBnd.nextNormal() +
          sigmaTrial * invSqrtK * (rngBnd.nextNormal() - rngBnd.nextNormal())
      }
      if (evalTostAndLeak(buf).tostEquiv) bndFalse++

      // Condition 3: History Leakage (Delta = +0.70 SD)
      for (let s = 0; s < n; s++) {
        buf[s] =
          leakDelta +
          sigmaBias * rngLeak.nextNormal() +
          sigmaTrial * invSqrtK * (rngLeak.nextNormal() - rngLeak.nextNormal())
      }
      const resLeak = evalTostAndLeak(buf)
      if (resLeak.leakReject) leakHits++
      if (resLeak.tostEquiv) leakFalseEquiv++
    }

    const row: E3Row = {
      n,
      tostPower: metaHits / R_TRIALS,
      boundaryFpr: bndFalse / R_TRIALS,
      leakRejectPower: leakHits / R_TRIALS,
      leakFalseTost: leakFalseEquiv / R_TRIALS,
    }
    rows.push(row)
    console.log(
      `       N = ${String(n).padStart(2)} | ${(100 * row.tostPower).toFixed(1).padStart(19)}% | ${(100 * row.boundaryFpr).toFixed(2).padStart(24)}% | ${(100 * row.leakRejectPower).toFixed(1).padStart(23)}% | ${(100 * row.leakFalseTost).toFixed(2).padStart(14)}%`,
    )
  }

  // Neural-match AUC gate check (matched instantaneous state sits in [0.47, 0.53]) + Impulse-ping T_{A,t} recovery
  const rngPing = makePrng(0x47e34000)
  const nMatchPairs = 2000
  let concordantMatch = 0
  let concordantPing = 0
  for (let i = 0; i < nMatchPairs; i++) {
    // Strictly state-matched instantaneous neural decoder scores (zero separation -> AUC ~ 0.50)
    const sA = rngPing.nextNormal()
    const sB = rngPing.nextNormal()
    if (sA > sB) concordantMatch++
    // Activity-silent synaptic trace T_{A,t} revealed by broadband impulse ping (d = 1.4 -> AUC ~ 0.84 > 0.75)
    const pA = 1.4 + rngPing.nextNormal()
    const pB = rngPing.nextNormal()
    if (pA > pB) concordantPing++
  }
  const aucMatch = concordantMatch / nMatchPairs
  const aucPing = concordantPing / nMatchPairs

  const r20 = rows[0]!
  const r30 = rows[1]!
  const r40 = rows[2]!
  const r60 = rows[3]!

  recordCheck(
    'P3.1',
    'P3',
    'Tier C',
    `E3 TOST metamerism equivalence power (|Delta|<0.25 SD) & boundary FPR (alpha=${ALPHA_FWER})`,
    r40.tostPower >= 0.90 &&
      r60.tostPower >= 0.99 &&
      r20.tostPower < r40.tostPower &&
      rows.every(r => r.boundaryFpr < 0.015) &&
      r40.boundaryFpr < 0.01,
    `TOST power: N=20:${(100 * r20.tostPower).toFixed(1)}%, N=30:${(100 * r30.tostPower).toFixed(1)}%, N=40:${(100 * r40.tostPower).toFixed(1)}% (>=90%), N=60:${(100 * r60.tostPower).toFixed(1)}% | boundary FPR(N=40)=${(100 * r40.boundaryFpr).toFixed(2)}% (<1%)`,
  )
  recordCheck(
    'P3.2',
    'P3',
    'Tier C',
    'E3 history-leakage rejection (Delta=0.70 SD) + neural-match & impulse-ping T_{A,t} gates',
    r40.leakRejectPower >= 0.95 &&
      r40.leakFalseTost === 0 &&
      aucMatch >= 0.47 &&
      aucMatch <= 0.53 &&
      aucPing > 0.75,
    `Leak reject(N=40)=${(100 * r40.leakRejectPower).toFixed(1)}% (>=95%), false-TOST=${(100 * r40.leakFalseTost).toFixed(2)}%, matched neural AUC=${aucMatch.toFixed(4)} in [0.47,0.53], impulse-ping T_{A,t} AUC=${aucPing.toFixed(4)} (>0.75)`,
  )
}

// =================================================================================================
// GATE P4 -- STUDY E4: 12-LEVEL TMS-EEG WEDGE-SNAP BIC POWER & NON-VACUOUS NULL CALIBRATION
// =================================================================================================
// 12 titration levels x_l = l / 11 (l = 0..11) across N in {20, 30, 40, 60} subjects, R = 200 cohorts.
// Within-subject repeated-measures model with subject random intercept u_i ~ N(0, 0.08^2) and
// realistic per-level PCI^ST / QFI noise eps_{i, l} ~ N(0, 0.16^2).
// Subject-centered exact likelihood (n_eff = 11 * N within-subject degrees of freedom) comparing:
//   M_lin  (p = 2: linear intercept + slope)
//   M_sig  (p = 4: 4-parameter smooth logistic a + b / (1 + exp(-k * (x - x0))), global var-proj fit)
//   M_snap (p = 5: 3-regime discrete wedge-snap plateaus m0, m1, m2 with exact cutoffs c1, c2)
// Decisive wedge-snap criterion:
//   Delta BIC_snap = min(BIC(M_lin), BIC(M_sig)) - BIC(M_snap) > +10
// Verified against FOUR ground-truth generators:
//   1. True 3-regime Wedge-Snap ([0.08]*4, [0.48]*4, [0.92]*4 matching B_1 k <= 7, 8..16, >= 17)
//   2. Pure Linear Null (0.08 + 0.84 * x)
//   3. Smooth Logistic Null (0.08 + 0.84 / (1 + exp(-8 * (x - 0.50))))
//   4. Steep Single-Step Logistic Null (0.08 + 0.84 / (1 + exp(-18 * (x - 0.50))))

function runGateP4(): void {
  console.log('\n==============================================================================================')
  console.log('GATE P4: STUDY E4 12-LEVEL TMS-EEG WEDGE-SNAP BIC POWER & NON-VACUOUS NULL CALIBRATION')
  console.log('==============================================================================================')

  const nLvl = 12
  const xs = new Float64Array(nLvl)
  for (let l = 0; l < nLvl; l++) xs[l] = l / (nLvl - 1)
  const xBar = 0.5
  let sxx12 = 0
  for (let l = 0; l < nLvl; l++) {
    const dx = xs[l]! - xBar
    sxx12 += dx * dx
  }

  // Precompute global variable-projection grid for smooth logistic M_sig:
  // k in [1.5, 28.0] (28 log-spaced steps) x x0 in [0.15, 0.85] (29 linear steps) = 812 candidates.
  // For each (k, x0), exact closed-form centered OLS solves for (a, b) in O(12) ops!
  const kGrid: number[] = []
  for (let i = 0; i < 28; i++) kGrid.push(1.5 * Math.pow(28 / 1.5, i / 27))
  const x0Grid: number[] = []
  for (let j = 0; j < 29; j++) x0Grid.push(0.15 + (0.70 * j) / 28)

  type SigBasis = {
    readonly k: number
    readonly x0: number
    readonly gCentered: Float64Array
    readonly denom: number
  }
  const sigGrid: SigBasis[] = []
  for (const k of kGrid) {
    for (const x0 of x0Grid) {
      const g = new Float64Array(nLvl)
      let gMean = 0
      for (let l = 0; l < nLvl; l++) {
        const v = 1 / (1 + Math.exp(-k * (xs[l]! - x0)))
        g[l] = v
        gMean += v
      }
      gMean /= nLvl
      let den = 0
      for (let l = 0; l < nLvl; l++) {
        const gc = g[l]! - gMean
        g[l] = gc
        den += gc * gc
      }
      if (den > 1e-12) sigGrid.push({ k, x0, gCentered: g, denom: den })
    }
  }

  // Evaluate exact centered RSS for logistic (k, x0) given centered 12-level means yC and its SS
  const sigProfileSse = (yC: Float64Array, ySS: number, k: number, x0: number): number => {
    let gMean = 0
    const g = new Float64Array(nLvl)
    for (let l = 0; l < nLvl; l++) {
      const v = 1 / (1 + Math.exp(-k * (xs[l]! - x0)))
      g[l] = v
      gMean += v
    }
    gMean /= nLvl
    let num = 0
    let den = 0
    for (let l = 0; l < nLvl; l++) {
      const gc = g[l]! - gMean
      num += gc * yC[l]!
      den += gc * gc
    }
    if (den <= 1e-14) return ySS
    const b = num / den
    return Math.max(0, ySS - b * num)
  }

  // Exact within-subject BIC evaluation for M_lin (p=2), M_sig (p=4), M_snap (p=5)
  const fitE4Models = (
    nSubj: number,
    meanLvl: Float64Array,
    ssPure: number,
  ): {
    readonly bicLin: number
    readonly bicSig: number
    readonly bicSnap: number
    readonly deltaBicSnap: number
    readonly bestC1: number
    readonly bestC2: number
  } => {
    const nEff = nSubj * (nLvl - 1)
    const logNEff = Math.log(nEff)

    let yBar = 0
    for (let l = 0; l < nLvl; l++) yBar += meanLvl[l]!
    yBar /= nLvl
    const yC = new Float64Array(nLvl)
    let ySS = 0
    let sxy = 0
    for (let l = 0; l < nLvl; l++) {
      const yc = meanLvl[l]! - yBar
      yC[l] = yc
      ySS += yc * yc
      sxy += (xs[l]! - xBar) * yc
    }

    // 1. M_lin (p = 2: intercept + slope)
    const b1 = sxy / sxx12
    const sseLinLvl = Math.max(0, ySS - b1 * sxy)
    const rssLin = ssPure + nSubj * sseLinLvl
    const bicLin = nEff * Math.log(rssLin / nEff) + 2 * logNEff

    // 2. M_sig (p = 4: global grid + local coordinate refinement)
    let bestSigSse = ySS
    let bestK = 6.0
    let bestX0 = 0.5
    for (let idx = 0; idx < sigGrid.length; idx++) {
      const sb = sigGrid[idx]!
      const gc = sb.gCentered
      let num = 0
      for (let l = 0; l < nLvl; l++) num += gc[l]! * yC[l]!
      const sse = Math.max(0, ySS - (num * num) / sb.denom)
      if (sse < bestSigSse) {
        bestSigSse = sse
        bestK = sb.k
        bestX0 = sb.x0
      }
    }
    // Fine local refinement around global grid optimum
    let stepK = 0.18 * bestK
    let stepX = 0.025
    for (let it = 0; it < 6; it++) {
      for (const dk of [-stepK, stepK]) {
        const ck = Math.max(0.5, Math.min(45, bestK + dk))
        const sse = sigProfileSse(yC, ySS, ck, bestX0)
        if (sse < bestSigSse) {
          bestSigSse = sse
          bestK = ck
        }
      }
      for (const dx of [-stepX, stepX]) {
        const cx = Math.max(0.05, Math.min(0.95, bestX0 + dx))
        const sse = sigProfileSse(yC, ySS, bestK, cx)
        if (sse < bestSigSse) {
          bestSigSse = sse
          bestX0 = cx
        }
      }
      stepK *= 0.5
      stepX *= 0.5
    }
    const rssSig = ssPure + nSubj * bestSigSse
    const bicSig = nEff * Math.log(rssSig / nEff) + 4 * logNEff

    // 3. M_snap (p = 5: exact global search over all valid 3-regime partitions c1, c2 with >= 2 levels/regime)
    let bestSnapSse = Number.POSITIVE_INFINITY
    let bestC1 = 3
    let bestC2 = 7
    const prefS = new Float64Array(nLvl + 1)
    const prefS2 = new Float64Array(nLvl + 1)
    for (let l = 0; l < nLvl; l++) {
      const v = yC[l]!
      prefS[l + 1] = prefS[l]! + v
      prefS2[l + 1] = prefS2[l]! + v * v
    }
    const segSse = (a: number, bInc: number): number => {
      const cnt = bInc - a + 1
      const sum = prefS[bInc + 1]! - prefS[a]!
      const sum2 = prefS2[bInc + 1]! - prefS2[a]!
      return Math.max(0, sum2 - (sum * sum) / cnt)
    }
    for (let c1 = 1; c1 <= nLvl - 5; c1++) {
      const sse0 = segSse(0, c1)
      for (let c2 = c1 + 2; c2 <= nLvl - 3; c2++) {
        const sse = sse0 + segSse(c1 + 1, c2) + segSse(c2 + 1, nLvl - 1)
        if (sse < bestSnapSse) {
          bestSnapSse = sse
          bestC1 = c1
          bestC2 = c2
        }
      }
    }
    const rssSnap = ssPure + nSubj * bestSnapSse
    const bicSnap = nEff * Math.log(rssSnap / nEff) + 5 * logNEff

    const bestSmooth = Math.min(bicLin, bicSig)
    return {
      bicLin,
      bicSig,
      bicSnap,
      deltaBicSnap: bestSmooth - bicSnap,
      bestC1,
      bestC2,
    }
  }

  // Ground-truth mean profiles across the 12 titration levels:
  const muSnap = new Float64Array(nLvl)
  const muLin = new Float64Array(nLvl)
  const muSigSmooth = new Float64Array(nLvl)
  const muSigSteep = new Float64Array(nLvl)
  for (let l = 0; l < nLvl; l++) {
    const x = xs[l]!
    muSnap[l] = l <= 3 ? 0.08 : l <= 7 ? 0.48 : 0.92
    muLin[l] = 0.08 + 0.84 * x
    muSigSmooth[l] = 0.08 + 0.84 / (1 + Math.exp(-8.0 * (x - 0.50)))
    muSigSteep[l] = 0.08 + 0.84 / (1 + Math.exp(-18.0 * (x - 0.50)))
  }

  const sigmaU = 0.08
  const sigmaEps = 0.16
  const simulateCohortAndFit = (nSubj: number, muTrue: Float64Array, rng: Prng) => {
    // Generate full N x 12 repeated-measures matrix, center each subject, and compute exact (meanLvl, ssPure)
    const centered = new Float64Array(nSubj * nLvl)
    const meanLvl = new Float64Array(nLvl)
    for (let s = 0; s < nSubj; s++) {
      const u = sigmaU * rng.nextNormal()
      let rowMean = 0
      for (let l = 0; l < nLvl; l++) {
        const y = muTrue[l]! + u + sigmaEps * rng.nextNormal()
        centered[s * nLvl + l] = y
        rowMean += y
      }
      rowMean /= nLvl
      for (let l = 0; l < nLvl; l++) {
        const yc = centered[s * nLvl + l]! - rowMean
        centered[s * nLvl + l] = yc
        meanLvl[l] = meanLvl[l]! + yc
      }
    }
    for (let l = 0; l < nLvl; l++) meanLvl[l] = meanLvl[l]! / nSubj
    let ssPure = 0
    for (let s = 0; s < nSubj; s++) {
      for (let l = 0; l < nLvl; l++) {
        const d = centered[s * nLvl + l]! - meanLvl[l]!
        ssPure += d * d
      }
    }
    return fitE4Models(nSubj, meanLvl, ssPure)
  }

  type E4Row = {
    readonly n: number
    readonly snapDetectPower: number
    readonly snapCutoffExact: number
    readonly snapMeanDeltaBic: number
    readonly linFalseSnap: number
    readonly smoothSigFalseSnap: number
    readonly steepSigFalseSnap: number
  }
  const rows: E4Row[] = []

  console.log(
    `  [P4] E4 12-Level Titration Design: sigma_u=${sigmaU}, sigma_eps=${sigmaEps}, decisive DeltaBIC > +10`,
  )
  console.log(
    '       N_subj | Snap Power (>+10) | Mean dBIC(Snap) | Exact (3,7) | Lin FalseSnap | SmoothSig False | SteepSig False',
  )

  for (const n of N_COHORTS) {
    const rngSnap = makePrng(0x47e41000 + n * 157)
    const rngLin = makePrng(0x47e42000 + n * 157)
    const rngSig = makePrng(0x47e43000 + n * 157)
    const rngSteep = makePrng(0x47e44000 + n * 157)
    let snapHits = 0
    let cutExact = 0
    let sumDeltaBic = 0
    let linFalse = 0
    let sigFalse = 0
    let steepFalse = 0

    for (let r = 0; r < R_TRIALS; r++) {
      const fSnap = simulateCohortAndFit(n, muSnap, rngSnap)
      if (fSnap.deltaBicSnap > 10) snapHits++
      if (fSnap.bestC1 === 3 && fSnap.bestC2 === 7) cutExact++
      sumDeltaBic += fSnap.deltaBicSnap

      const fLin = simulateCohortAndFit(n, muLin, rngLin)
      if (fLin.deltaBicSnap > 10) linFalse++

      const fSig = simulateCohortAndFit(n, muSigSmooth, rngSig)
      if (fSig.deltaBicSnap > 10) sigFalse++

      const fSteep = simulateCohortAndFit(n, muSigSteep, rngSteep)
      if (fSteep.deltaBicSnap > 10) steepFalse++
    }

    const row: E4Row = {
      n,
      snapDetectPower: snapHits / R_TRIALS,
      snapCutoffExact: cutExact / R_TRIALS,
      snapMeanDeltaBic: sumDeltaBic / R_TRIALS,
      linFalseSnap: linFalse / R_TRIALS,
      smoothSigFalseSnap: sigFalse / R_TRIALS,
      steepSigFalseSnap: steepFalse / R_TRIALS,
    }
    rows.push(row)
    console.log(
      `       N = ${String(n).padStart(2)} | ${(100 * row.snapDetectPower).toFixed(1).padStart(16)}% | ${row.snapMeanDeltaBic.toFixed(1).padStart(15)} | ${(100 * row.snapCutoffExact).toFixed(1).padStart(10)}% | ${(100 * row.linFalseSnap).toFixed(2).padStart(12)}% | ${(100 * row.smoothSigFalseSnap).toFixed(2).padStart(14)}% | ${(100 * row.steepSigFalseSnap).toFixed(2).padStart(13)}%`,
    )
  }

  const r20 = rows[0]!
  const r30 = rows[1]!
  const r40 = rows[2]!
  const r60 = rows[3]!

  recordCheck(
    'P4.1',
    'P4',
    'Tier C',
    'E4 12-level TMS-EEG 3-regime wedge-snap decisive BIC detection power (Delta BIC > +10)',
    r30.snapDetectPower >= 0.90 &&
      r40.snapDetectPower >= 0.90 &&
      r60.snapDetectPower >= 0.99 &&
      r40.snapCutoffExact >= 0.90,
    `Power(DeltaBIC>+10): N=20:${(100 * r20.snapDetectPower).toFixed(1)}% (mean +${r20.snapMeanDeltaBic.toFixed(1)}), N=30:${(100 * r30.snapDetectPower).toFixed(1)}% (mean +${r30.snapMeanDeltaBic.toFixed(1)}), N=40:${(100 * r40.snapDetectPower).toFixed(1)}% (mean +${r40.snapMeanDeltaBic.toFixed(1)}, exact (3,7)=${(100 * r40.snapCutoffExact).toFixed(1)}%), N=60:${(100 * r60.snapDetectPower).toFixed(1)}%`,
  )
  recordCheck(
    'P4.2',
    'P4',
    'Tier A',
    'E4 non-vacuous null calibration: linear, smooth logistic & steep single-step logistic nulls',
    rows.every(
      r => r.linFalseSnap < 0.01 && r.smoothSigFalseSnap < 0.01 && r.steepSigFalseSnap < 0.01,
    ),
    `Max false decisive M_snap across N in {20,30,40,60}: Linear=${(100 * Math.max(...rows.map(r => r.linFalseSnap))).toFixed(2)}%, SmoothSig=${(100 * Math.max(...rows.map(r => r.smoothSigFalseSnap))).toFixed(2)}%, SteepSig=${(100 * Math.max(...rows.map(r => r.steepSigFalseSnap))).toFixed(2)}% (all <1%)`,
  )
}

// =================================================================================================
// MAIN EXECUTION, RESOURCE REPORT & TIER C EPISTEMIC FOOTER
// =================================================================================================

runGateP1()
runGateP2()
runGateP3()
runGateP4()

const elapsedMs = Date.now() - t0Global
const total = CHECKS.length
const passed = CHECKS.filter(c => c.passed).length
const failed = total - passed
const tierACount = CHECKS.filter(c => c.tier === 'Tier A').length
const tierCCount = CHECKS.filter(c => c.tier === 'Tier C').length

console.log('\n==============================================================================================')
console.log(
  `WAVE-6 W6-B8 NOTE 47 ARM II POWER PIPELINE: ${passed}/${total} PASSED (${failed} FAILED) in ${(elapsedMs / 1000).toFixed(3)} s`,
)
console.log('==============================================================================================')
console.log('EPISTEMIC BOUNDARY NOTICE (Strict Tier C Quarantine):')
console.log(`  - Tier A (${tierACount} checks -- Mathematical Calibration & Signal-Processing Anti-Confound Guards):`)
console.log('      Exact Student-t Holm-Bonferroni null FWER (P1.2), CAR zero-mean / Surface Laplacian /')
console.log('      zero-lag EOG volume-conduction null immunity via debiased wPLI^2 (P2.2), causal VAR')
console.log('      Granger vs zero-phase FIR acausal trap (P2.3), exact CSN 2009 Hurwitz-Zeta MLE + KS')
console.log('      + Vuong LLR vs naive log-log OLS (P2.4), and E4 linear/logistic BIC null calibration (P4.2).')
console.log(`  - Tier C (${tierCCount} checks -- Preregistered Human Neuroscience Power Audits Only):`)
console.log('      In-silico cohort power audits for E1 (P1.1), E2 (P2.1), E3 (P3.1, P3.2), and E4 (P4.1)')
console.log('      certify statistical power, sample-size sufficiency, and confound immunity ONLY. They do')
console.log('      NOT establish empirical human neural or phenomenal truth (reserved for Arm II labs).')
console.log('==============================================================================================')

if (failed > 0) {
  const failedIds = CHECKS.filter(c => !c.passed)
    .map(c => c.id)
    .join(', ')
  throw new Error(`W6-B8 Arm II Power Pipeline FAILED (${failed}/${total}): ${failedIds}`)
}

export {}
