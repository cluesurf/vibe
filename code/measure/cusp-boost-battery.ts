// RELATIVISTIC DISPERSION E^2 = m^2 + c_eff^2 k^2, TIME DILATION gamma(v), AND BOOST COVARIANCE
// ON THE 3D CUSP HUSK UNDER M_pair (E-RLT-0124).
//
// Reuses the exact 24x24 3D cusp-husk Bloch unitary U(k; u) from E-RLT-0123 (mpair-cusp-dispersion.ts)
// for M_pair(-1) (theta = pi), M_pair(zeta_18) (theta = pi/9), and the bare line-law control (theta = 0):
//
//   1. Exact 24-band Floquet spectrum extraction along (1,0,0), (1,1,0), and (1,1,1):
//      - Verifies exact unitarity (||U^dag U - I|| <= 1e-13) and exact structure-factor dependence
//        E_n(k) = E_n(g(k)) where g(k) = (cos kx + cos ky + cos kz) / 3 (residual <= 1e-13).
//      - Separates the 19 k-independent flat bands from the 5 mutually disjoint 3D dispersive bands.
//   2. Relativistic Klein-Gordon / Dirac dispersion fit E(k)^2 - E(0)^2 = c_eff^2 k^2 + c_4 k^4:
//      - Fits all positive-curvature massive bands at Gamma = (0,0,0) across |k| in [0, pi/4] for
//        M_pair(-1) and M_pair(zeta_18), reporting m_0, c_eff, c_4, O(k^4) Lorentz-violation ratio
//        |c_4 k^2 / c_eff^2| at |k| = pi/32 and pi/16, directional c_eff spread across (1,0,0),
//        (1,1,0), (1,1,1), and fastest dispersive band speed v_max.
//      - Extracts the emergent light Dirac hyperbola E_D(q) = (E_+(R - q) - E_-(R - q)) / 2 of
//        M_pair(zeta_18) around R = (pi, pi, pi) (tiny rest mass m_D ~ 0.004905, internal beat
//        omega_0 = 2 m_D, emergent light-cone speed c_eff ~ 0.021267, reaching v_max > 0.89 c_eff
//        along all 3 directions), and the lightest single-band minimum of M_pair(-1) around R
//        (m_0 = pi/9 ~ 0.3491, c_eff ~ 0.1160).
//   3. Time dilation & boost covariance battery:
//      - Compares proper-time / internal-clock slowdown tau_ratio(v) = E_rest / E(k) against exact
//        Lorentz factor 1 / gamma(v) = sqrt(1 - v^2 / c_eff^2) at v / c_eff = 0.0, 0.1, 0.2, 0.3, 0.4
//        (plus 0.6, 0.8 on the light Dirac pair) across (1,0,0), (1,1,0), (1,1,1).
//      - Checks wavepacket dynamical length contraction (H_par / H_perp) * gamma(v)^2 - 1 and
//        relativity of simultaneity (E / q) v / c_eff^2 - 1 on the light Dirac pair.
//      - Compares against a Galilean control band E_Gal(q) = m_D + c_eff^2 q^2 / (2 m_D) that shares
//        (m_D, c_eff) yet fails Lorentz time dilation at v / c_eff = 0.4 by > 1%.
//   4. Two-way light-signal round-trip check & global causality bound:
//      - Exact inversion reciprocity |E(+k) - E(-k)| and |v_g(+k) + v_g(-k)| (zero first-order
//        one-way / two-way asymmetry), Michelson-Morley directional round-trip isotropy, boosted
//        light-clock T_par(v) / T_perp(v) agreement using dynamical contraction, and global causality
//        bound max |v_g(k)| <= 1 dock/beat across all 24 bands and full 3D BZ.
//   5. Bare control (u = 1): all 24 bands strictly flat (c_eff = 0, v_max = 0, no boost).
//
// Deterministic, zero Math.random.

import { exactCell } from '@/code/substrate/coxeter/exact-3434'
import { cuspTranslations } from '@/code/substrate/coxeter/exact-cusp'
import {
  buildCuspBlochMatrix,
  buildCuspChartR3,
  quasiEnergies,
  unitaryError,
  type CuspChartR3,
} from '@/code/measure/mpair-cusp-dispersion'

const SQRT3 = Math.sqrt(3)
const DIFF_H = 1e-4

export type UnitDirection = {
  readonly name: '(1,0,0)' | '(1,1,0)' | '(1,1,1)'
  readonly vec: readonly [number, number, number]
  readonly bzHalfExtent: number
}

const DIRECTIONS: readonly UnitDirection[] = [
  { name: '(1,0,0)', vec: [1, 0, 0], bzHalfExtent: Math.PI },
  { name: '(1,1,0)', vec: [Math.SQRT1_2, Math.SQRT1_2, 0], bzHalfExtent: Math.SQRT2 * Math.PI },
  { name: '(1,1,1)', vec: [1 / SQRT3, 1 / SQRT3, 1 / SQRT3], bzHalfExtent: SQRT3 * Math.PI },
]

export type DispersionFitDirection = {
  readonly dir: UnitDirection['name']
  readonly m0: number
  readonly cEff: number
  readonly c4: number
  readonly lvAtPi32: number
  readonly lvAtPi16: number
  readonly fitRelResidualAtPi4: number
  readonly peakGroupSpeed: number
  readonly peakBeta: number
  readonly peakQ: number
}

export type MassiveBandFit = {
  readonly label: string
  readonly center: 'Gamma' | 'R'
  readonly m0: number
  readonly cEffMean: number
  readonly cEffSpread: number
  readonly maxLvAtPi32: number
  readonly maxLvAtPi16: number
  readonly maxFitRelResidualAtPi4: number
  readonly directions: readonly DispersionFitDirection[]
}

export type TimeDilationPoint = {
  readonly beta: number
  readonly reachable: boolean
  readonly q: number
  readonly energy: number
  readonly groupSpeed: number
  readonly tauRatio: number
  readonly invGamma: number
  readonly relErr: number
  readonly simultaneityErr: number
  readonly contractionErr: number
  readonly lightClockRatioErr: number
}

export type TimeDilationDirection = {
  readonly dir: UnitDirection['name']
  readonly cEff: number
  readonly peakBeta: number
  readonly points: readonly TimeDilationPoint[]
  readonly maxRelErrUpTo04: number
  readonly maxSimErrUpTo04: number
  readonly maxContractionErrUpTo04: number
  readonly maxLightClockErrUpTo04: number
}

export type TimeDilationBattery = {
  readonly label: string
  readonly m0: number
  readonly cEffMean: number
  readonly directions: readonly TimeDilationDirection[]
  readonly allReach04: boolean
  readonly maxRelErrUpTo04: number
  readonly maxSimErrUpTo04: number
  readonly maxContractionErrUpTo04: number
  readonly maxLightClockErrUpTo04: number
  readonly maxRelErrAt06: number
  readonly maxRelErrAt08: number
}

export type TwoWayRoundTripReading = {
  readonly maxInversionEnergyDiff: number
  readonly maxInversionSpeedAsym: number
  readonly smallKSpeedSpreadPi32: number
  readonly smallKRoundTripAnisotropyPi32: number
  readonly asymptoticRoundTripAnisotropy: number
}

export type RuleBoostSummary = {
  readonly name: string
  readonly theta: number
  readonly maxUnitaryErr: number
  readonly flatBandCount: number
  readonly dispersiveBandCount: number
  readonly maxFlatMatchErr: number
  readonly structureFactorInvarianceErr: number
  readonly maxBandwidthFullBZ: number
  readonly maxGroupSpeedFullBZ: number
  readonly gaplessBandCount: number
  readonly gammaPrimaryBand: MassiveBandFit
  readonly gammaAllPositiveBands: readonly MassiveBandFit[]
  readonly rPointLightBand: MassiveBandFit
  readonly timeDilation: TimeDilationBattery
  readonly gammaSmallKTimeDilation: {
    readonly maxBetaAtPi4: number
    readonly maxRelErrAtPi4: number
  }
  readonly roundTrip: TwoWayRoundTripReading
}

export type BareControlSummary = {
  readonly maxUnitaryErr: number
  readonly maxBandwidth: number
  readonly maxGroupSpeed: number
  readonly maxCEff: number
}

export type GalileanControlSummary = {
  readonly m0: number
  readonly cEff: number
  readonly relErrAt04: number
  readonly relErrAt03: number
  readonly relErrAt02: number
  readonly contractionErrAt04: number
  readonly lightClockErrAt04: number
}

export type CuspBoostBatteryResult = {
  readonly mpairNeg1: RuleBoostSummary
  readonly mpairZeta18: RuleBoostSummary
  readonly bareControl: BareControlSummary
  readonly galileanControl: GalileanControlSummary
}

// ---- Exact flat/dispersive band separation ----

type BandExtractor = {
  readonly flatValues: readonly number[]
  readonly dispersiveCount: number
  readonly extract: (k: readonly [number, number, number]) => {
    readonly disp: readonly number[]
    readonly flatMatchErr: number
    readonly unitaryErr: number
  }
}

function buildBandExtractor(
  axes: CuspChartR3['axes'],
  theta: number,
): BandExtractor {
  const mA = buildCuspBlochMatrix(axes, [0.71, 0.37, 0.19], theta)
  const mB = buildCuspBlochMatrix(axes, [2.13, 1.41, 0.83], theta)
  const eA = quasiEnergies(mA)
  const eB = quasiEnergies(mB)

  // Greedy multiset intersection within 1e-10 identifies the k-independent flat bands cleanly
  const usedB = new Uint8Array(eB.length)
  const flatValues: number[] = []

  for (let i = 0; i < eA.length; i++) {
    let bestJ = -1
    let bestD = 1e-10

    for (let j = 0; j < eB.length; j++) {
      if (usedB[j]) continue

      const d = Math.abs(eA[i]! - eB[j]!)

      if (d < bestD) {
        bestD = d
        bestJ = j
      }
    }

    if (bestJ >= 0) {
      usedB[bestJ] = 1
      flatValues.push(0.5 * (eA[i]! + eB[bestJ]!))
    }
  }

  flatValues.sort((a, b) => a - b)

  const dispersiveCount = 24 - flatValues.length

  const extract = (
    k: readonly [number, number, number],
  ): {
    readonly disp: readonly number[]
    readonly flatMatchErr: number
    readonly unitaryErr: number
  } => {
    const m = buildCuspBlochMatrix(axes, k, theta)
    const uErr = unitaryError(m)
    const ev = quasiEnergies(m)
    const used = new Uint8Array(ev.length)
    let flatMatchErr = 0

    for (const fv of flatValues) {
      let bestIdx = -1
      let bestD = Infinity

      for (let i = 0; i < ev.length; i++) {
        if (used[i]) continue

        const d = Math.abs(ev[i]! - fv)

        if (d < bestD) {
          bestD = d
          bestIdx = i
        }
      }

      if (bestIdx >= 0) {
        used[bestIdx] = 1
        flatMatchErr = Math.max(flatMatchErr, bestD)
      }
    }

    const disp: number[] = []

    for (let i = 0; i < ev.length; i++) {
      if (!used[i]) {
        disp.push(ev[i]!)
      }
    }

    return { disp, flatMatchErr, unitaryErr: uErr }
  }

  return { flatValues, dispersiveCount, extract }
}

// ---- Vector helpers ----

function addVec3(
  a: readonly [number, number, number],
  b: readonly [number, number, number],
  s: number,
): [number, number, number] {
  return [a[0] + s * b[0], a[1] + s * b[1], a[2] + s * b[2]]
}

function transverseBasis(
  u: readonly [number, number, number],
): [[number, number, number], [number, number, number]] {
  const ref: [number, number, number] = Math.abs(u[0]) < 0.9 ? [1, 0, 0] : [0, 1, 0]
  const dot = ref[0] * u[0] + ref[1] * u[1] + ref[2] * u[2]
  const w1: [number, number, number] = [
    ref[0] - dot * u[0],
    ref[1] - dot * u[1],
    ref[2] - dot * u[2],
  ]
  const n1 = Math.hypot(w1[0], w1[1], w1[2])
  const t1: [number, number, number] = [w1[0] / n1, w1[1] / n1, w1[2] / n1]
  const w2: [number, number, number] = [
    u[1] * t1[2] - u[2] * t1[1],
    u[2] * t1[0] - u[0] * t1[2],
    u[0] * t1[1] - u[1] * t1[0],
  ]
  const n2 = Math.hypot(w2[0], w2[1], w2[2])
  const t2: [number, number, number] = [w2[0] / n2, w2[1] / n2, w2[2] / n2]

  return [t1, t2]
}

// ---- Fit relativistic dispersion E(q)^2 - m0^2 = c_eff^2 q^2 + c_4 q^4 ----

type ScalarEnergyFn = (k: readonly [number, number, number]) => number

function fitMassiveBand(input: {
  label: string
  center: 'Gamma' | 'R'
  energyAtK: ScalarEnergyFn
}): MassiveBandFit {
  const { label, center, energyAtK } = input
  const kOrigin: [number, number, number] =
    center === 'Gamma' ? [0, 0, 0] : [Math.PI, Math.PI, Math.PI]
  const sign = center === 'Gamma' ? 1 : -1
  const m0 = energyAtK(kOrigin)

  const evalAlong = (u: readonly [number, number, number], q: number): number =>
    energyAtK(addVec3(kOrigin, u, sign * q))

  const vgAlong = (u: readonly [number, number, number], q: number): number =>
    (evalAlong(u, q + DIFF_H) - evalAlong(u, q - DIFF_H)) / (2 * DIFF_H)

  const dirFits: DispersionFitDirection[] = DIRECTIONS.map(d => {
    // Fit y(q) = (E(q)^2 - m0^2) / q^2 = c2 + c4 * q^2 on q in [pi/128, pi/16] (16 samples)
    let s0 = 0
    let s1 = 0
    let s2 = 0
    let sy = 0
    let sxy = 0

    for (let i = 1; i <= 16; i++) {
      const q = (i * Math.PI) / 256
      const e = evalAlong(d.vec, q)
      const x = q * q
      const y = (e * e - m0 * m0) / x

      s0 += 1
      s1 += x
      s2 += x * x
      sy += y
      sxy += x * y
    }

    const det = s0 * s2 - s1 * s1
    const c2 = (s2 * sy - s1 * sxy) / det
    const c4 = (-s1 * sy + s0 * sxy) / det
    const cEff = Math.sqrt(Math.max(0, c2))
    const lvAtPi32 = c2 > 1e-18 ? Math.abs((c4 * (Math.PI / 32) ** 2) / c2) : 0
    const lvAtPi16 = c2 > 1e-18 ? Math.abs((c4 * (Math.PI / 16) ** 2) / c2) : 0

    const qPi4 = Math.PI / 4
    const ePi4 = evalAlong(d.vec, qPi4)
    const predSq = m0 * m0 + c2 * qPi4 * qPi4 + c4 * qPi4 ** 4
    const deltaSq = Math.abs(ePi4 * ePi4 - m0 * m0)
    const fitRelResidualAtPi4 =
      deltaSq > 1e-18 ? Math.abs(ePi4 * ePi4 - predSq) / deltaSq : 0

    // Locate peak group speed along the rising side [0, bzHalfExtent]
    const scanSteps = 64
    let bestV = 0
    let bestQ = 0

    for (let i = 1; i <= scanSteps; i++) {
      const q = (i * d.bzHalfExtent) / scanSteps
      const v = vgAlong(d.vec, q)

      if (v > bestV) {
        bestV = v
        bestQ = q
      }
    }

    // Refine peak with golden-section / ternary search
    let lo = Math.max(DIFF_H, bestQ - d.bzHalfExtent / scanSteps)
    let hi = Math.min(d.bzHalfExtent - DIFF_H, bestQ + d.bzHalfExtent / scanSteps)

    for (let it = 0; it < 30; it++) {
      const a = lo + (hi - lo) / 3
      const b = hi - (hi - lo) / 3

      if (vgAlong(d.vec, a) < vgAlong(d.vec, b)) {
        lo = a
      } else {
        hi = b
      }
    }

    const peakQ = 0.5 * (lo + hi)
    const peakGroupSpeed = vgAlong(d.vec, peakQ)

    return {
      dir: d.name,
      m0,
      cEff,
      c4,
      lvAtPi32,
      lvAtPi16,
      fitRelResidualAtPi4,
      peakGroupSpeed,
      peakBeta: cEff > 1e-12 ? peakGroupSpeed / cEff : 0,
      peakQ,
    }
  })

  const cEffs = dirFits.map(d => d.cEff)
  const cEffMean = cEffs.reduce((a, b) => a + b, 0) / cEffs.length
  const cEffSpread =
    cEffMean > 1e-12 ? (Math.max(...cEffs) - Math.min(...cEffs)) / cEffMean : 0

  return {
    label,
    center,
    m0,
    cEffMean,
    cEffSpread,
    maxLvAtPi32: Math.max(...dirFits.map(d => d.lvAtPi32)),
    maxLvAtPi16: Math.max(...dirFits.map(d => d.lvAtPi16)),
    maxFitRelResidualAtPi4: Math.max(...dirFits.map(d => d.fitRelResidualAtPi4)),
    directions: dirFits,
  }
}

// ---- Time dilation, contraction, simultaneity & boosted light-clock battery ----

function measureTimeDilationBattery(input: {
  label: string
  center: 'Gamma' | 'R'
  energyAtK: ScalarEnergyFn
  fit: MassiveBandFit
  betas: readonly number[]
}): TimeDilationBattery {
  const { label, center, energyAtK, fit, betas } = input
  const kOrigin: [number, number, number] =
    center === 'Gamma' ? [0, 0, 0] : [Math.PI, Math.PI, Math.PI]
  const sign = center === 'Gamma' ? 1 : -1
  const m0 = fit.m0

  const dirReadings: TimeDilationDirection[] = DIRECTIONS.map((d, di) => {
    const df = fit.directions[di]!
    const cEff = df.cEff
    const [t1, t2] = transverseBasis(d.vec)

    const evalAlong = (q: number): number =>
      energyAtK(addVec3(kOrigin, d.vec, sign * q))
    const vgAlong = (q: number): number =>
      (evalAlong(q + DIFF_H) - evalAlong(q - DIFF_H)) / (2 * DIFF_H)

    const points: TimeDilationPoint[] = betas.map(beta => {
      if (beta === 0) {
        return {
          beta: 0,
          reachable: true,
          q: 0,
          energy: m0,
          groupSpeed: 0,
          tauRatio: 1,
          invGamma: 1,
          relErr: 0,
          simultaneityErr: 0,
          contractionErr: 0,
          lightClockRatioErr: 0,
        }
      }

      const targetV = beta * cEff

      if (targetV >= df.peakGroupSpeed * 0.9999) {
        return {
          beta,
          reachable: false,
          q: NaN,
          energy: NaN,
          groupSpeed: NaN,
          tauRatio: NaN,
          invGamma: Math.sqrt(1 - beta * beta),
          relErr: NaN,
          simultaneityErr: NaN,
          contractionErr: NaN,
          lightClockRatioErr: NaN,
        }
      }

      // Bisect on rising side [0, peakQ] to find exact momentum q where v_g(q) = beta * cEff
      let lo = 0
      let hi = df.peakQ

      for (let it = 0; it < 55; it++) {
        const mid = 0.5 * (lo + hi)

        if (vgAlong(mid) < targetV) {
          lo = mid
        } else {
          hi = mid
        }
      }

      const q = 0.5 * (lo + hi)
      const kVec = addVec3(kOrigin, d.vec, sign * q)
      const energy = energyAtK(kVec)
      const groupSpeed = vgAlong(q)
      const actualBeta = groupSpeed / cEff
      const invGamma = Math.sqrt(1 - actualBeta * actualBeta)
      const gamma = 1 / invGamma
      const tauRatio = m0 / energy
      const relErr = Math.abs(tauRatio - invGamma) / invGamma

      // Relativity of simultaneity: (E / q) * v_g / c_eff^2 = 1
      const simultaneityErr = Math.abs(((energy / q) * groupSpeed) / (cEff * cEff) - 1)

      // Dynamical wavepacket contraction: H_par / H_perp = 1 / gamma^2
      const hStep = Math.min(DIFF_H, Math.max(1e-5, q * 0.01))
      const hPar =
        (energyAtK(addVec3(kVec, d.vec, hStep)) -
          2 * energy +
          energyAtK(addVec3(kVec, d.vec, -hStep))) /
        (hStep * hStep)
      const hPerp1 =
        (energyAtK(addVec3(kVec, t1, hStep)) -
          2 * energy +
          energyAtK(addVec3(kVec, t1, -hStep))) /
        (hStep * hStep)
      const hPerp2 =
        (energyAtK(addVec3(kVec, t2, hStep)) -
          2 * energy +
          energyAtK(addVec3(kVec, t2, -hStep))) /
        (hStep * hStep)
      const hPerp = 0.5 * (hPerp1 + hPerp2)
      const contractionRatio = hPerp > 1e-15 ? hPar / hPerp : 0
      const contractionErr = Math.abs(contractionRatio * gamma * gamma - 1)

      // Boosted light-clock two-way round-trip ratio:
      // With dynamical longitudinal contraction factor L_par / L_perp = sqrt(H_par / H_perp),
      // T_par / T_perp = (L_par / L_perp) / sqrt(1 - beta^2) = gamma * sqrt(H_par / H_perp) = 1.
      const lightClockRatio =
        contractionRatio > 0 ? gamma * Math.sqrt(contractionRatio) : 0
      const lightClockRatioErr = Math.abs(lightClockRatio - 1)

      return {
        beta,
        reachable: true,
        q,
        energy,
        groupSpeed,
        tauRatio,
        invGamma,
        relErr,
        simultaneityErr,
        contractionErr,
        lightClockRatioErr,
      }
    })

    const upTo04 = points.filter(p => p.beta <= 0.4001 && p.reachable)

    return {
      dir: d.name,
      cEff,
      peakBeta: df.peakBeta,
      points,
      maxRelErrUpTo04: Math.max(0, ...upTo04.map(p => p.relErr)),
      maxSimErrUpTo04: Math.max(0, ...upTo04.map(p => p.simultaneityErr)),
      maxContractionErrUpTo04: Math.max(0, ...upTo04.map(p => p.contractionErr)),
      maxLightClockErrUpTo04: Math.max(0, ...upTo04.map(p => p.lightClockRatioErr)),
    }
  })

  const allReach04 = dirReadings.every(dr =>
    dr.points.filter(p => p.beta <= 0.4001).every(p => p.reachable),
  )
  const atBeta = (b: number): number => {
    const vals = dirReadings
      .map(dr => dr.points.find(p => Math.abs(p.beta - b) < 1e-9))
      .filter((p): p is TimeDilationPoint => p !== undefined && p.reachable)
      .map(p => p.relErr)

    return vals.length > 0 ? Math.max(...vals) : NaN
  }

  return {
    label,
    m0,
    cEffMean: fit.cEffMean,
    directions: dirReadings,
    allReach04,
    maxRelErrUpTo04: Math.max(...dirReadings.map(d => d.maxRelErrUpTo04)),
    maxSimErrUpTo04: Math.max(...dirReadings.map(d => d.maxSimErrUpTo04)),
    maxContractionErrUpTo04: Math.max(...dirReadings.map(d => d.maxContractionErrUpTo04)),
    maxLightClockErrUpTo04: Math.max(...dirReadings.map(d => d.maxLightClockErrUpTo04)),
    maxRelErrAt06: atBeta(0.6),
    maxRelErrAt08: atBeta(0.8),
  }
}

// ---- Full analysis for one M_pair angle ----

function analyzeRule(input: {
  axes: CuspChartR3['axes']
  name: string
  theta: number
  useDiracPairAtR: boolean
}): RuleBoostSummary {
  const { axes, name, theta, useDiracPairAtR } = input
  const extractor = buildBandExtractor(axes, theta)

  let maxUnitaryErr = 0
  let maxFlatMatchErr = 0

  const evalDisp = (k: readonly [number, number, number]): readonly number[] => {
    const res = extractor.extract(k)

    maxUnitaryErr = Math.max(maxUnitaryErr, res.unitaryErr)
    maxFlatMatchErr = Math.max(maxFlatMatchErr, res.flatMatchErr)

    return res.disp
  }

  // 1. Structure-factor invariance check: three distinct k points with identical g(k) = (cos kx + cos ky + cos kz)/3 = 5/6
  const isoA = evalDisp([Math.PI / 3, 0, 0])
  const isoB = evalDisp([Math.acos(0.75), Math.acos(0.75), 0])
  const isoC = evalDisp([Math.acos(5 / 6), Math.acos(5 / 6), Math.acos(5 / 6)])
  let structureFactorInvarianceErr = 0

  for (let i = 0; i < isoA.length; i++) {
    structureFactorInvarianceErr = Math.max(
      structureFactorInvarianceErr,
      Math.abs(isoA[i]! - isoB[i]!),
      Math.abs(isoA[i]! - isoC[i]!),
    )
  }

  // 2. Full BZ scan across all 3 directions for bandwidth, global max group speed, and gapless check
  let maxBandwidthFullBZ = 0
  let maxGroupSpeedFullBZ = 0
  let minAbsEnergyFullBZ = Infinity

  for (const d of DIRECTIONS) {
    const steps = 48
    const dk = d.bzHalfExtent / steps
    const tracks: number[][] = Array.from({ length: extractor.dispersiveCount }, () => [])

    for (let s = 0; s <= steps; s++) {
      const kap = s * dk
      const disp = evalDisp([d.vec[0] * kap, d.vec[1] * kap, d.vec[2] * kap])

      for (let b = 0; b < disp.length; b++) {
        tracks[b]!.push(disp[b]!)
        minAbsEnergyFullBZ = Math.min(minAbsEnergyFullBZ, Math.abs(disp[b]!))
      }
    }

    for (const band of tracks) {
      const bw = Math.max(...band) - Math.min(...band)

      maxBandwidthFullBZ = Math.max(maxBandwidthFullBZ, bw)

      for (let s = 1; s < band.length; s++) {
        maxGroupSpeedFullBZ = Math.max(
          maxGroupSpeedFullBZ,
          Math.abs(band[s]! - band[s - 1]!) / dk,
        )
      }
    }
  }

  const gaplessBandCount = minAbsEnergyFullBZ < 1e-4 ? 1 : 0

  // 3. Fit all positive-curvature massive bands at Gamma = (0,0,0) (where |E(k)| increases with |k|)
  const d0 = evalDisp([0, 0, 0])
  const dSmall = evalDisp([Math.PI / 64, 0, 0])
  const gammaAllPositiveBands: MassiveBandFit[] = []

  for (let b = 0; b < extractor.dispersiveCount; b++) {
    const e0 = d0[b]!
    const eS = dSmall[b]!

    if (Math.abs(eS) > Math.abs(e0) + 1e-10) {
      gammaAllPositiveBands.push(
        fitMassiveBand({
          label: `${name}:Gamma-disp-${b}`,
          center: 'Gamma',
          energyAtK: k => Math.abs(evalDisp(k)[b]!),
        }),
      )
    }
  }

  // Primary Gamma massive band: the one with largest emergent speed c_eff
  const gammaPrimaryBand = [...gammaAllPositiveBands].sort(
    (a, b) => b.cEffMean - a.cEffMean,
  )[0]!
  const primaryGammaIdx = Number(gammaPrimaryBand.label.split('-').pop())

  // Gamma small-k time dilation check up to |k| = pi/4 along (1,0,0)
  const qGamma = Math.PI / 4
  const eGammaPi4 = Math.abs(evalDisp([qGamma, 0, 0])[primaryGammaIdx]!)
  const vgGammaPi4 =
    (Math.abs(evalDisp([qGamma + DIFF_H, 0, 0])[primaryGammaIdx]!) -
      Math.abs(evalDisp([qGamma - DIFF_H, 0, 0])[primaryGammaIdx]!)) /
    (2 * DIFF_H)
  const betaGammaPi4 = vgGammaPi4 / gammaPrimaryBand.cEffMean
  const tauGammaPi4 = gammaPrimaryBand.m0 / eGammaPi4
  const invGammaPi4 = Math.sqrt(1 - betaGammaPi4 * betaGammaPi4)
  const gammaSmallKTimeDilation = {
    maxBetaAtPi4: betaGammaPi4,
    maxRelErrAtPi4: Math.abs(tauGammaPi4 - invGammaPi4) / invGammaPi4,
  }

  // 4. R-point light relativistic band & time dilation battery:
  //    - For M_pair(zeta_18): exact two-band Dirac pair E_D(q) = (d_4(R-q) - d_3(R-q)) / 2 (m_D ~ 0.004905)
  //    - For M_pair(-1): lightest single-band minimum at R (d_2, E(R) = pi/9 ~ 0.3491)
  let rPointEnergyAtK: ScalarEnergyFn
  let rLabel: string

  if (useDiracPairAtR) {
    rLabel = `${name}:R-dirac-pair(d3,d4)`
    rPointEnergyAtK = k => {
      const d = evalDisp(k)

      return 0.5 * (d[4]! - d[3]!)
    }
  } else {
    // Pick the positive-curvature R-point band with smallest rest energy m0
    const dR0 = evalDisp([Math.PI, Math.PI, Math.PI])
    const dRSmall = evalDisp([Math.PI - Math.PI / 64, Math.PI, Math.PI])
    let bestIdx = 0
    let bestM = Infinity

    for (let b = 0; b < extractor.dispersiveCount; b++) {
      if (Math.abs(dRSmall[b]!) > Math.abs(dR0[b]!) + 1e-10) {
        if (Math.abs(dR0[b]!) < bestM) {
          bestM = Math.abs(dR0[b]!)
          bestIdx = b
        }
      }
    }

    rLabel = `${name}:R-disp-${bestIdx}`
    rPointEnergyAtK = k => Math.abs(evalDisp(k)[bestIdx]!)
  }

  const rPointLightBand = fitMassiveBand({
    label: rLabel,
    center: 'R',
    energyAtK: rPointEnergyAtK,
  })

  const betas = useDiracPairAtR
    ? [0.0, 0.1, 0.2, 0.3, 0.4, 0.6, 0.8]
    : [0.0, 0.1, 0.2, 0.3, 0.4]

  const timeDilation = measureTimeDilationBattery({
    label: rLabel,
    center: 'R',
    energyAtK: rPointEnergyAtK,
    fit: rPointLightBand,
    betas,
  })

  // 5. Two-way light-signal round-trip check (inversion reciprocity + Michelson-Morley isotropy)
  const kOriginR: [number, number, number] = [Math.PI, Math.PI, Math.PI]
  let maxInversionEnergyDiff = 0
  let maxInversionSpeedAsym = 0
  const speedsAtPi32: number[] = []

  for (const d of DIRECTIONS) {
    for (const q of [Math.PI / 32, Math.PI / 16, Math.PI / 8]) {
      const kPlus = addVec3(kOriginR, d.vec, q)
      const kMinus = addVec3(kOriginR, d.vec, -q)
      const ePlus = rPointEnergyAtK(kPlus)
      const eMinus = rPointEnergyAtK(kMinus)

      maxInversionEnergyDiff = Math.max(maxInversionEnergyDiff, Math.abs(ePlus - eMinus))

      const vPlus =
        (rPointEnergyAtK(addVec3(kPlus, d.vec, DIFF_H)) -
          rPointEnergyAtK(addVec3(kPlus, d.vec, -DIFF_H))) /
        (2 * DIFF_H)
      const vMinus =
        (rPointEnergyAtK(addVec3(kMinus, d.vec, DIFF_H)) -
          rPointEnergyAtK(addVec3(kMinus, d.vec, -DIFF_H))) /
        (2 * DIFF_H)

      maxInversionSpeedAsym = Math.max(maxInversionSpeedAsym, Math.abs(vPlus + vMinus))

      if (Math.abs(q - Math.PI / 32) < 1e-12) {
        speedsAtPi32.push(Math.abs(vPlus))
      }
    }
  }

  const meanV32 = speedsAtPi32.reduce((a, b) => a + b, 0) / speedsAtPi32.length
  const smallKSpeedSpreadPi32 =
    meanV32 > 1e-12 ? (Math.max(...speedsAtPi32) - Math.min(...speedsAtPi32)) / meanV32 : 0
  const rtTimes32 = speedsAtPi32.map(v => 2 / v)
  const meanRt32 = rtTimes32.reduce((a, b) => a + b, 0) / rtTimes32.length
  const smallKRoundTripAnisotropyPi32 =
    meanRt32 > 1e-12 ? (Math.max(...rtTimes32) - Math.min(...rtTimes32)) / meanRt32 : 0

  const asymRt = rPointLightBand.directions.map(d => 2 / d.cEff)
  const meanAsymRt = asymRt.reduce((a, b) => a + b, 0) / asymRt.length
  const asymptoticRoundTripAnisotropy =
    meanAsymRt > 1e-12 ? (Math.max(...asymRt) - Math.min(...asymRt)) / meanAsymRt : 0

  return {
    name,
    theta,
    maxUnitaryErr,
    flatBandCount: extractor.flatValues.length,
    dispersiveBandCount: extractor.dispersiveCount,
    maxFlatMatchErr,
    structureFactorInvarianceErr,
    maxBandwidthFullBZ,
    maxGroupSpeedFullBZ,
    gaplessBandCount,
    gammaPrimaryBand,
    gammaAllPositiveBands,
    rPointLightBand,
    timeDilation,
    gammaSmallKTimeDilation,
    roundTrip: {
      maxInversionEnergyDiff,
      maxInversionSpeedAsym,
      smallKSpeedSpreadPi32,
      smallKRoundTripAnisotropyPi32,
      asymptoticRoundTripAnisotropy,
    },
  }
}

// ---- Bare control (theta = 0): flat bands, c_eff = 0, v_max = 0 ----

function measureBareControl(axes: CuspChartR3['axes']): BareControlSummary {
  let maxUnitaryErr = 0
  let maxBandwidth = 0
  let maxGroupSpeed = 0
  let maxCEff = 0

  const m0 = buildCuspBlochMatrix(axes, [0, 0, 0], 0)

  maxUnitaryErr = Math.max(maxUnitaryErr, unitaryError(m0))

  const e0 = quasiEnergies(m0)

  for (const d of DIRECTIONS) {
    const steps = 16
    const dk = Math.PI / (4 * steps)
    let prev = e0

    for (let s = 1; s <= steps; s++) {
      const q = s * dk
      const m = buildCuspBlochMatrix(axes, [d.vec[0] * q, d.vec[1] * q, d.vec[2] * q], 0)

      maxUnitaryErr = Math.max(maxUnitaryErr, unitaryError(m))

      const cur = quasiEnergies(m)

      for (let b = 0; b < 24; b++) {
        maxBandwidth = Math.max(maxBandwidth, Math.abs(cur[b]! - e0[b]!))
        maxGroupSpeed = Math.max(maxGroupSpeed, Math.abs(cur[b]! - prev[b]!) / dk)

        if (s === 4) {
          const c2 = Math.abs(cur[b]! ** 2 - e0[b]! ** 2) / (q * q)

          maxCEff = Math.max(maxCEff, Math.sqrt(c2))
        }
      }

      prev = cur
    }
  }

  return { maxUnitaryErr, maxBandwidth, maxGroupSpeed, maxCEff }
}

// ---- Galilean control: E_Gal(q) = m0 + c_eff^2 q^2 / (2 m0) ----

function measureGalileanControl(m0: number, cEff: number): GalileanControlSummary {
  // For E_Gal(q) = m0 + cEff^2 q^2 / (2 m0), v(q) = (cEff^2 / m0) q => q = (m0 / cEff) beta
  // E_Gal(beta) / m0 = 1 + beta^2 / 2, so tau_ratio(beta) = 1 / (1 + beta^2 / 2) vs sqrt(1 - beta^2)
  const errAt = (beta: number): number => {
    const tauGal = 1 / (1 + 0.5 * beta * beta)
    const invGamma = Math.sqrt(1 - beta * beta)

    return Math.abs(tauGal - invGamma) / invGamma
  }

  const gamma04 = 1 / Math.sqrt(1 - 0.16)

  return {
    m0,
    cEff,
    relErrAt04: errAt(0.4),
    relErrAt03: errAt(0.3),
    relErrAt02: errAt(0.2),
    // Galilean H_par / H_perp = 1 identically => (H_par/H_perp) gamma^2 - 1 = gamma^2 - 1
    contractionErrAt04: gamma04 * gamma04 - 1,
    lightClockErrAt04: gamma04 - 1,
  }
}

export function runCuspBoostBattery(): CuspBoostBatteryResult {
  const cell = exactCell()
  const translations = cuspTranslations(cell)
  const chart = buildCuspChartR3(cell, translations)
  const axes = chart.axes

  const mpairNeg1 = analyzeRule({
    axes,
    name: 'mpair-neg1',
    theta: Math.PI,
    useDiracPairAtR: false,
  })
  const mpairZeta18 = analyzeRule({
    axes,
    name: 'mpair-zeta18',
    theta: Math.PI / 9,
    useDiracPairAtR: true,
  })
  const bareControl = measureBareControl(axes)
  const galileanControl = measureGalileanControl(
    mpairZeta18.rPointLightBand.m0,
    mpairZeta18.rPointLightBand.cEffMean,
  )

  return {
    mpairNeg1,
    mpairZeta18,
    bareControl,
    galileanControl,
  }
}
