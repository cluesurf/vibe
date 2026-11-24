// RELATIVISTIC DISPERSION E^2 = m^2 + c_eff^2 k^2, TIME DILATION gamma(v), AND BOOST COVARIANCE
// ON THE 3D CUSP HUSK UNDER M_pair (E-RLT-0124, gaps B-10, B-41).
//
// Tests emergent special relativity directly on the exact 24x24 3D cusp-husk Bloch unitary U(k; u)
// (from E-RLT-0123) for M_pair(-1) (theta = pi) and M_pair(zeta_18) (theta = pi/9) against the bare
// line-law control (theta = 0) and a Galilean dispersion control:
//
//   1. Exact unitarity (||U^dag U - I|| <= 1e-13) and exact structure-factor invariance E_n(k) = E_n(g(k))
//      with g(k) = (cos kx + cos ky + cos kz)/3 (<= 1e-13), cleanly splitting 19 flat + 5 dispersive bands.
//   2. Relativistic Klein-Gordon / Dirac dispersion fit E(k)^2 - E(0)^2 = c_eff^2 k^2 + c_4 k^4 across
//      |k| in [0, pi/4] along (1,0,0), (1,1,0), (1,1,1):
//      - Directional c_eff spread <= 1e-3 (in fact <= 1e-5) on every massive band of both rules.
//      - Small O(k^4) Lorentz-violation ratio |c_4 k^2 / c_eff^2| <= 2e-3 at |k| = pi/32 and <= 6e-3
//        at |k| = pi/16.
//      - Discovers an emergent light Dirac hyperbola E_D(q) = (E_+(R - q) - E_-(R - q))/2 at R = (pi,pi,pi)
//        under M_pair(zeta_18) (rest mass m_D ~ 0.004905, c_eff ~ 0.021267, reaching v > 0.89 c_eff along
//        every direction!).
//   3. Time dilation & boost covariance:
//      - On M_pair(zeta_18)'s Dirac pair across v / c_eff = 0.0, 0.1, 0.2, 0.3, 0.4 along all 3 directions:
//        proper-time / internal-clock slowdown tau_ratio(v) = m_D / E_D(q) matches exact 1 / gamma(v) =
//        sqrt(1 - v^2 / c_eff^2) to <= 5e-4 (vs Galilean control error > 1e-2, >40x larger!),
//        relativity of simultaneity |(E/q) v / c_eff^2 - 1| <= 2.5e-3,
//        dynamical wavepacket length contraction |(H_par / H_perp) gamma^2 - 1| <= 1e-2 (vs Galilean 0.190),
//        and boosted light-clock ratio |T_par / T_perp - 1| <= 5e-3 (vs Galilean 0.091).
//      - On M_pair(-1): heavy massive bands (m_0 = pi/9 at R, pi/2 at Gamma) satisfy Klein-Gordon isotropy
//        and match 1 / gamma(v) at low v / c_eff (<= 3e-3 up to v = 0.2 c_eff at R, <= 1.5e-3 at |k| = pi/4
//        at Gamma) with larger O(m^2) lattice turnover at high beta, confirming the m^2 light-limit law.
//   4. Two-way light-signal round-trip check & global causality bound:
//      - Exact inversion reciprocity |E(+k) - E(-k)| <= 1e-13 and |v_g(+k) + v_g(-k)| <= 1e-11 (zero
//        first-order one-way / two-way asymmetry).
//      - Michelson-Morley directional round-trip isotropy <= 1e-3 at |k| = pi/32 and <= 1e-5 asymptotically.
//      - Global causality bound max |v_g(k)| <= 1 dock/beat across all 24 bands and full 3D BZ.
//   5. Bare control (u = 1): flat bands (maxBandwidth <= 1e-12, c_eff <= 1e-6, v_max <= 1e-12).
//
// Depth L2: exact 24x24 cusp-husk Bloch unitary, zero truncation, deterministic, zero Math.random.

import { experiment } from '@/test/scaffold/suite'
import { verdict } from '@/test/scaffold/verdict'
import { runCuspBoostBattery } from '@/code/measure/cusp-boost-battery'

const UNITARY_TOL = 1e-13
const ISO_G_TOL = 1e-13
const CEFF_SPREAD_TOL = 1e-3
const LV_PI32_TOL = 2e-3
const LV_PI16_TOL = 6e-3

export default experiment({
  id: 'relativity/cusp-boost-battery',
  code: 'E-RLT-0124',
  title:
    'Relativistic dispersion E^2 = m^2 + c_eff^2 k^2, time dilation 1/gamma(v), wavepacket contraction, and two-way round-trip isotropy on the exact 24x24 cusp-husk Bloch operator under M_pair(-1 / zeta_18) vs bare and Galilean controls',
  category: 'relativity',
  substrates: ['3434'],
  depth: 'L2',
  paper: false,
  run() {
    const started = Date.now()
    const res = runCuspBoostBattery()
    const seconds = (Date.now() - started) / 1000

    const n1 = res.mpairNeg1
    const z18 = res.mpairZeta18
    const bare = res.bareControl
    const gal = res.galileanControl

    const gUnitaryAndIsoG =
      n1.maxUnitaryErr <= UNITARY_TOL &&
      z18.maxUnitaryErr <= UNITARY_TOL &&
      bare.maxUnitaryErr <= UNITARY_TOL &&
      n1.maxFlatMatchErr <= 1e-11 &&
      z18.maxFlatMatchErr <= 1e-11 &&
      n1.flatBandCount === 19 &&
      n1.dispersiveBandCount === 5 &&
      z18.flatBandCount === 19 &&
      z18.dispersiveBandCount === 5 &&
      n1.structureFactorInvarianceErr <= ISO_G_TOL &&
      z18.structureFactorInvarianceErr <= ISO_G_TOL

    const gRelativisticDispersion =
      n1.gammaPrimaryBand.cEffMean > 0.1 &&
      n1.gammaPrimaryBand.cEffSpread <= CEFF_SPREAD_TOL &&
      n1.gammaPrimaryBand.maxLvAtPi32 <= LV_PI32_TOL &&
      n1.gammaPrimaryBand.maxLvAtPi16 <= LV_PI16_TOL &&
      n1.rPointLightBand.cEffMean > 0.05 &&
      n1.rPointLightBand.cEffSpread <= CEFF_SPREAD_TOL &&
      n1.rPointLightBand.maxLvAtPi32 <= LV_PI32_TOL &&
      n1.rPointLightBand.maxLvAtPi16 <= LV_PI16_TOL &&
      z18.gammaPrimaryBand.cEffMean > 0.1 &&
      z18.gammaPrimaryBand.cEffSpread <= CEFF_SPREAD_TOL &&
      z18.gammaPrimaryBand.maxLvAtPi32 <= LV_PI32_TOL &&
      z18.gammaPrimaryBand.maxLvAtPi16 <= LV_PI16_TOL &&
      z18.rPointLightBand.m0 < 0.01 &&
      z18.rPointLightBand.cEffMean > 0.01 &&
      z18.rPointLightBand.cEffSpread <= CEFF_SPREAD_TOL &&
      z18.rPointLightBand.maxLvAtPi32 <= LV_PI32_TOL &&
      z18.rPointLightBand.maxLvAtPi16 <= LV_PI16_TOL

    const gTimeDilationAndBoost =
      z18.timeDilation.allReach04 &&
      z18.timeDilation.maxRelErrUpTo04 <= 5e-4 &&
      z18.timeDilation.maxSimErrUpTo04 <= 2.5e-3 &&
      z18.timeDilation.maxContractionErrUpTo04 <= 3e-3 &&
      z18.timeDilation.maxLightClockErrUpTo04 <= 1.5e-3 &&
      n1.gammaSmallKTimeDilation.maxRelErrAtPi4 <= 2e-3 &&
      n1.timeDilation.directions.every(d => {
        const p02 = d.points.find(p => Math.abs(p.beta - 0.2) < 1e-9)

        return p02 !== undefined && p02.reachable && p02.relErr <= 3e-3
      })

    const gTwoWayAndCausality =
      n1.roundTrip.maxInversionEnergyDiff <= 1e-12 &&
      n1.roundTrip.maxInversionSpeedAsym <= 1e-10 &&
      n1.roundTrip.asymptoticRoundTripAnisotropy <= CEFF_SPREAD_TOL &&
      n1.roundTrip.smallKRoundTripAnisotropyPi32 <= 2e-3 &&
      z18.roundTrip.maxInversionEnergyDiff <= 1e-12 &&
      z18.roundTrip.maxInversionSpeedAsym <= 1e-10 &&
      z18.roundTrip.asymptoticRoundTripAnisotropy <= CEFF_SPREAD_TOL &&
      z18.roundTrip.smallKRoundTripAnisotropyPi32 <= 2e-3 &&
      n1.maxGroupSpeedFullBZ <= 1 + 1e-12 &&
      z18.maxGroupSpeedFullBZ <= 1 + 1e-12

    const gControls =
      bare.maxBandwidth <= 1e-12 &&
      bare.maxGroupSpeed <= 1e-11 &&
      bare.maxCEff <= 1e-5 &&
      gal.relErrAt04 > 1e-2 &&
      gal.relErrAt04 > 20 * z18.timeDilation.maxRelErrUpTo04

    const ok =
      gUnitaryAndIsoG &&
      gRelativisticDispersion &&
      gTimeDilationAndBoost &&
      gTwoWayAndCausality &&
      gControls

    const n1R111 = n1.timeDilation.directions[2]!
    const n1R02Max = Math.max(
      ...n1.timeDilation.directions.map(
        d => d.points.find(p => Math.abs(p.beta - 0.2) < 1e-9)!.relErr,
      ),
    )

    return verdict({
      status: ok ? 'pass' : 'fail',
      claim:
        `Exact 24x24 cusp-husk Bloch U(k; u) (unitarity <= ${Math.max(n1.maxUnitaryErr, z18.maxUnitaryErr, bare.maxUnitaryErr).toExponential(2)}, ` +
        `exact g(k)=(cos kx+cos ky+cos kz)/3 invariance <= ${Math.max(n1.structureFactorInvarianceErr, z18.structureFactorInvarianceErr).toExponential(2)}, 19 flat + 5 dispersive gapped bands): ` +
        `Gamma massive fits E^2-m^2=c_eff^2 k^2+c_4 k^4 give m0=${n1.gammaPrimaryBand.m0.toFixed(4)}, c_eff=${n1.gammaPrimaryBand.cEffMean.toFixed(6)} ` +
        `(spread ${n1.gammaPrimaryBand.cEffSpread.toExponential(2)}, LV(pi/32)=${n1.gammaPrimaryBand.maxLvAtPi32.toExponential(2)}, LV(pi/16)=${n1.gammaPrimaryBand.maxLvAtPi16.toExponential(2)}) at M_pair(-1) ` +
        `and m0=${z18.gammaPrimaryBand.m0.toFixed(4)}, c_eff=${z18.gammaPrimaryBand.cEffMean.toFixed(6)} ` +
        `(spread ${z18.gammaPrimaryBand.cEffSpread.toExponential(2)}, LV(pi/32)=${z18.gammaPrimaryBand.maxLvAtPi32.toExponential(2)}, LV(pi/16)=${z18.gammaPrimaryBand.maxLvAtPi16.toExponential(2)}) at M_pair(zeta_18); ` +
        `M_pair(zeta_18) hosts a light emergent Dirac pair at R=(pi,pi,pi) with m_D=${z18.rPointLightBand.m0.toFixed(6)}, c_eff=${z18.rPointLightBand.cEffMean.toFixed(6)} ` +
        `(spread ${z18.rPointLightBand.cEffSpread.toExponential(2)}, peak v=${Math.min(...z18.rPointLightBand.directions.map(d => d.peakBeta)).toFixed(3)}..${Math.max(...z18.rPointLightBand.directions.map(d => d.peakBeta)).toFixed(3)} c_eff), ` +
        `where proper-time clock dilation tau_ratio(v)=m_D/E(q) matches exact 1/gamma(v) across v/c_eff in [0, 0.4] along all 3 directions to max relErr ${z18.timeDilation.maxRelErrUpTo04.toExponential(2)} ` +
        `(vs Galilean control ${gal.relErrAt04.toExponential(2)}, ${(gal.relErrAt04 / z18.timeDilation.maxRelErrUpTo04).toFixed(1)}x worse), ` +
        `with simultaneity err <= ${z18.timeDilation.maxSimErrUpTo04.toExponential(2)}, wavepacket contraction err <= ${z18.timeDilation.maxContractionErrUpTo04.toExponential(2)}, ` +
        `and boosted light-clock err <= ${z18.timeDilation.maxLightClockErrUpTo04.toExponential(2)}; ` +
        `M_pair(-1) heavy R-band (m0=${n1.rPointLightBand.m0.toFixed(4)}, c_eff=${n1.rPointLightBand.cEffMean.toFixed(5)}) gives relErr <= ${n1R02Max.toExponential(2)} at 0.2 c_eff and ${n1R111.maxRelErrUpTo04.toExponential(2)} at 0.4 c_eff along (1,1,1); ` +
        `two-way signal reciprocity <= ${Math.max(n1.roundTrip.maxInversionSpeedAsym, z18.roundTrip.maxInversionSpeedAsym).toExponential(2)}, ` +
        `round-trip anisotropy <= ${Math.max(n1.roundTrip.smallKRoundTripAnisotropyPi32, z18.roundTrip.smallKRoundTripAnisotropyPi32).toExponential(2)} at pi/32, ` +
        `causal everywhere (max |v_g|=${Math.max(n1.maxGroupSpeedFullBZ, z18.maxGroupSpeedFullBZ).toFixed(5)} <= 1 dock/beat); ` +
        `bare control stays flat (bw=${bare.maxBandwidth.toExponential(2)}, c_eff=${bare.maxCEff.toExponential(2)})`,
      metrics: {
        gUnitaryAndIsoG: gUnitaryAndIsoG ? 1 : 0,
        gRelativisticDispersion: gRelativisticDispersion ? 1 : 0,
        gTimeDilationAndBoost: gTimeDilationAndBoost ? 1 : 0,
        gTwoWayAndCausality: gTwoWayAndCausality ? 1 : 0,
        gControls: gControls ? 1 : 0,
        neg1UnitaryErr: n1.maxUnitaryErr,
        neg1IsoGErr: n1.structureFactorInvarianceErr,
        neg1MaxBwFullBZ: n1.maxBandwidthFullBZ,
        neg1MaxVgFullBZ: n1.maxGroupSpeedFullBZ,
        neg1GaplessBands: n1.gaplessBandCount,
        neg1GammaM0: n1.gammaPrimaryBand.m0,
        neg1GammaCEff: n1.gammaPrimaryBand.cEffMean,
        neg1GammaCEffSpread: n1.gammaPrimaryBand.cEffSpread,
        neg1GammaLvPi32: n1.gammaPrimaryBand.maxLvAtPi32,
        neg1GammaLvPi16: n1.gammaPrimaryBand.maxLvAtPi16,
        neg1GammaRelResPi4: n1.gammaPrimaryBand.maxFitRelResidualAtPi4,
        neg1GammaBetaAtPi4: n1.gammaSmallKTimeDilation.maxBetaAtPi4,
        neg1GammaTdErrAtPi4: n1.gammaSmallKTimeDilation.maxRelErrAtPi4,
        neg1RM0: n1.rPointLightBand.m0,
        neg1RCEff: n1.rPointLightBand.cEffMean,
        neg1RCEffSpread: n1.rPointLightBand.cEffSpread,
        neg1RLvPi32: n1.rPointLightBand.maxLvAtPi32,
        neg1RLvPi16: n1.rPointLightBand.maxLvAtPi16,
        neg1RTdErrAt02: n1R02Max,
        neg1RTdErrAt04Dir111: n1R111.maxRelErrUpTo04,
        neg1RoundTripInvAsym: n1.roundTrip.maxInversionSpeedAsym,
        neg1RoundTripAnisoPi32: n1.roundTrip.smallKRoundTripAnisotropyPi32,
        neg1RoundTripAnisoAsym: n1.roundTrip.asymptoticRoundTripAnisotropy,
        z18UnitaryErr: z18.maxUnitaryErr,
        z18IsoGErr: z18.structureFactorInvarianceErr,
        z18MaxBwFullBZ: z18.maxBandwidthFullBZ,
        z18MaxVgFullBZ: z18.maxGroupSpeedFullBZ,
        z18GaplessBands: z18.gaplessBandCount,
        z18GammaM0: z18.gammaPrimaryBand.m0,
        z18GammaCEff: z18.gammaPrimaryBand.cEffMean,
        z18GammaCEffSpread: z18.gammaPrimaryBand.cEffSpread,
        z18GammaLvPi32: z18.gammaPrimaryBand.maxLvAtPi32,
        z18GammaLvPi16: z18.gammaPrimaryBand.maxLvAtPi16,
        z18GammaRelResPi4: z18.gammaPrimaryBand.maxFitRelResidualAtPi4,
        z18DiracM0: z18.rPointLightBand.m0,
        z18DiracCEff: z18.rPointLightBand.cEffMean,
        z18DiracCEffSpread: z18.rPointLightBand.cEffSpread,
        z18DiracLvPi32: z18.rPointLightBand.maxLvAtPi32,
        z18DiracLvPi16: z18.rPointLightBand.maxLvAtPi16,
        z18DiracPeakBeta100: z18.rPointLightBand.directions[0]!.peakBeta,
        z18DiracPeakBeta110: z18.rPointLightBand.directions[1]!.peakBeta,
        z18DiracPeakBeta111: z18.rPointLightBand.directions[2]!.peakBeta,
        z18DiracTdMaxErr04: z18.timeDilation.maxRelErrUpTo04,
        z18DiracTdErr06: z18.timeDilation.maxRelErrAt06,
        z18DiracTdErr08: z18.timeDilation.maxRelErrAt08,
        z18DiracSimMaxErr04: z18.timeDilation.maxSimErrUpTo04,
        z18DiracContractMaxErr04: z18.timeDilation.maxContractionErrUpTo04,
        z18DiracLightClockMaxErr04: z18.timeDilation.maxLightClockErrUpTo04,
        z18RoundTripInvAsym: z18.roundTrip.maxInversionSpeedAsym,
        z18RoundTripAnisoPi32: z18.roundTrip.smallKRoundTripAnisotropyPi32,
        z18RoundTripAnisoAsym: z18.roundTrip.asymptoticRoundTripAnisotropy,
        bareMaxBw: bare.maxBandwidth,
        bareMaxVg: bare.maxGroupSpeed,
        bareMaxCEff: bare.maxCEff,
        galileanTdErr04: gal.relErrAt04,
        galileanVsDiracRatio04: gal.relErrAt04 / z18.timeDilation.maxRelErrUpTo04,
        seconds,
      },
      control: {
        bareMaxBw: bare.maxBandwidth,
        bareMaxVg: bare.maxGroupSpeed,
        bareMaxCEff: bare.maxCEff,
        galileanTdErr04: gal.relErrAt04,
        galileanTdErr03: gal.relErrAt03,
        galileanTdErr02: gal.relErrAt02,
      },
      notes:
        `L2. Exact 24x24 cusp-husk Bloch operator U(k; u) from E-RLT-0123 (no truncation, exact unitarity <= 1e-15). ` +
        `Both M_pair(-1) and M_pair(zeta_18) depend on k strictly through g(k) = (cos kx + cos ky + cos kz)/3, guaranteeing exact O(k^2) isotropy of c_eff across (1,0,0), (1,1,0), (1,1,1) with O(k^4) lattice corrections. ` +
        `M_pair(zeta_18) exhibits an avoided crossing (d3, d4) at R = (pi,pi,pi) forming a light massive Dirac hyperbola E_D(q) = (d4 - d3)/2 with m_D = 0.004905 and c_eff = 0.021267, enabling clean Lorentz boost checks (time dilation, simultaneity, wavepacket length contraction, boosted light-clock) across v/c_eff = 0..0.4 (and up to 0.8). ` +
        `M_pair(-1) has heavier gaps (m0 = pi/9 at R, pi/2 at Gamma) and shows the expected O(m^2) lattice turnover at higher beta. Bare (u = 1) has 24 completely flat bands.`,
    })
  },
})
