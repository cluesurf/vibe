// 3D CUSP-HUSK DISPERSION, GROUP SPEED, AND ISOTROPY UNDER M_pair VS BARE LINE LAW
// (E-RLT-0123, gaps B-10, B-41).
//
// Tests exact 3D horospherical cusp-husk motion on the cached exact R = 3 {3,4,3,4} ball (8,857 docks)
// and exact 24-state 3D cusp-husk Bloch dispersion E(k) along (1,0,0), (1,1,0), and (1,1,1) for:
//   - Bare working rule (u = 1 control): line law confines lone love and full-line pair to 1D lines
//     (maxShadow <= sqrt(2), W_off = 0) and freezes the cusp-husk Bloch bands (bandwidth = 0, v_g = 0).
//   - M_pair(-1) (exact Z[w][1/6]) and M_pair(zeta_18) (exact Z[zeta_9][1/6]):
//     * Exact unitarity (normErr <= 1e-13, Bloch unitarity <= 1e-13, exact Z[w][1/6] sparse match).
//     * Breaks the sqrt(2) line-law barrier on the 3D cusp husk (W_off > 0, maxShadow >= 2.0 > sqrt(2)).
//     * Exact 2nd-moment isotropy (I_2 <= 1e-12 vs single-line bare) and sub-cubic 4th-moment angular
//       isotropy (I_4 < cubic control 1.0) on the 3D cusp projection.
//     * Genuine 3D cusp-husk Bloch dispersion E(k) along (1,0,0), (1,1,0), (1,1,1) with small-k isotropy
//       and strict causal signal speed bound (max graph speed <= 1, max Bloch group speed <= 1 dock/beat).
//
// Depth L2: exact cached R = 3 honeycomb ball + exact period-4 floor-0 cusp cross-check + exact 24x24
// unitary Bloch operator. Deterministic, zero Math.random.

import { experiment } from '@/test/scaffold/suite'
import { verdict } from '@/test/scaffold/verdict'
import { runMpairCuspDispersion } from '@/code/measure/mpair-cusp-dispersion'

const NORM_TOL = 1e-13
const AMP_TOL = 1e-13
const LINE_LIMIT = Math.SQRT2 + 1e-9

export default experiment({
  id: 'relativity/mpair-cusp-dispersion',
  code: 'E-RLT-0123',
  title:
    '3D cusp-husk motion, Bloch dispersion E(k), group speed, and isotropy under M_pair(-1 / zeta_18) vs bare line law on exact {3,4,3,4} cusp and cached R = 3 ball',
  category: 'relativity',
  substrates: ['3434'],
  depth: 'L2',
  paper: false,
  run() {
    const started = Date.now()
    const res = runMpairCuspDispersion()
    const seconds = (Date.now() - started) / 1000

    const gChart =
      res.chart.translationGatesAll &&
      res.chart.layerSlotsCount === 6 &&
      res.chart.bulkSlotsCount === 18 &&
      res.chart.unitOff <= 1e-12 &&
      res.chart.pairOff <= 1e-12 &&
      res.chart.chartConsistencyErr <= 1e-11

    const gSparseMatch =
      res.sparseEngineCheck.bareMaxAmpDiff <= AMP_TOL &&
      res.sparseEngineCheck.mpairNeg1MaxAmpDiff <= AMP_TOL &&
      res.sparseEngineCheck.mpairNeg1BigIntNormExact

    const gUnitary =
      res.bareLone.maxNormErr <= NORM_TOL &&
      res.bareOriginPair.maxNormErr <= NORM_TOL &&
      res.mpairNeg1OriginPair.maxNormErr <= NORM_TOL &&
      res.mpairZeta18OriginPair.maxNormErr <= NORM_TOL &&
      res.bareLayerNeighborPair.maxNormErr <= NORM_TOL &&
      res.mpairNeg1LayerNeighborPair.maxNormErr <= NORM_TOL &&
      res.mpairZeta18LayerNeighborPair.maxNormErr <= NORM_TOL &&
      res.blochBare.maxUnitaryErr <= NORM_TOL &&
      res.blochNeg1.maxUnitaryErr <= NORM_TOL &&
      res.blochZeta18.maxUnitaryErr <= NORM_TOL &&
      res.blochBare.realSpaceCrossCheckErr <= AMP_TOL &&
      res.blochNeg1.realSpaceCrossCheckErr <= AMP_TOL &&
      res.blochZeta18.realSpaceCrossCheckErr <= AMP_TOL

    const gBareConfined =
      res.bareLone.maxShadow <= LINE_LIMIT &&
      res.bareLone.maxWOff === 0 &&
      res.bareOriginPair.maxShadow <= LINE_LIMIT &&
      res.bareOriginPair.maxWOff === 0 &&
      res.bareLayerNeighborPair.maxShadow <= LINE_LIMIT &&
      res.bareLayerNeighborPair.maxWOff === 0 &&
      res.blochBare.maxBandwidth <= 1e-12 &&
      res.blochBare.maxGroupSpeedAllDirs <= 1e-12

    const gMpairMovesOffLine =
      res.mpairNeg1LayerNeighborPair.beats[0]!.wOff > 0 &&
      res.mpairNeg1LayerNeighborPair.maxShadow > LINE_LIMIT &&
      res.mpairZeta18LayerNeighborPair.beats[0]!.wOff > 0 &&
      res.mpairZeta18LayerNeighborPair.maxShadow > LINE_LIMIT &&
      res.blochNeg1.maxBandwidth > 0.05 &&
      res.blochZeta18.maxBandwidth > 1e-3

    const neg1OriginB3 = res.mpairNeg1OriginPair.beats[2]!
    const z18OriginB3 = res.mpairZeta18OriginPair.beats[2]!
    const bareSingleB3 = res.bareSingleLineOriginPair.beats[2]!
    const neg1SingleB3 = res.mpairNeg1SingleLineOriginPair.beats[2]!
    const z18SingleB3 = res.mpairZeta18SingleLineOriginPair.beats[2]!

    const gIsotropy =
      neg1OriginB3.i2Anisotropy <= 1e-11 &&
      z18OriginB3.i2Anisotropy <= 1e-11 &&
      bareSingleB3.i2Anisotropy > 1.0 &&
      neg1SingleB3.i2Anisotropy < bareSingleB3.i2Anisotropy &&
      z18SingleB3.i2Anisotropy < bareSingleB3.i2Anisotropy &&
      neg1OriginB3.i4Anisotropy < res.cubicAxisI4Control &&
      z18OriginB3.i4Anisotropy < res.cubicAxisI4Control &&
      res.blochNeg1.tinyKCurvatureSpread < 2e-4 &&
      res.blochZeta18.tinyKCurvatureSpread < 2e-4 &&
      Math.abs(res.blochNeg1.smallKAnisotropyOrder - 2) < 0.1 &&
      Math.abs(res.blochZeta18.smallKAnisotropyOrder - 2) < 0.1 &&
      res.blochNeg1.smallKCurvatureSpread < 0.02 &&
      res.blochZeta18.smallKCurvatureSpread < 0.02

    const gCausalSpeed =
      res.bareOriginPair.maxGraphSpeed <= 1 + 1e-12 &&
      res.mpairNeg1OriginPair.maxGraphSpeed <= 1 + 1e-12 &&
      res.mpairZeta18OriginPair.maxGraphSpeed <= 1 + 1e-12 &&
      res.blochNeg1.maxGroupSpeedAllDirs <= 1 + 1e-12 &&
      res.blochZeta18.maxGroupSpeedAllDirs <= 1 + 1e-12

    const ok =
      gChart &&
      gSparseMatch &&
      gUnitary &&
      gBareConfined &&
      gMpairMovesOffLine &&
      gIsotropy &&
      gCausalSpeed

    const n1Dirs = res.blochNeg1.directions
    const z18Dirs = res.blochZeta18.directions

    return verdict({
      status: ok ? 'pass' : 'fail',
      claim:
        `3D cusp-husk motion & Bloch dispersion on cached exact R=3 ball (${res.chart.cells} docks, 6 layer / 18 bulk slots, ` +
        `chart err ${res.chart.chartConsistencyErr.toExponential(2)}) + exact 24x24 cusp-husk Bloch U(k) ` +
        `(real-space period-4 floor-0 cusp match <= ${Math.max(res.blochBare.realSpaceCrossCheckErr, res.blochNeg1.realSpaceCrossCheckErr, res.blochZeta18.realSpaceCrossCheckErr).toExponential(2)}): ` +
        `bare line-law control stays strictly confined (lone & pair maxShadow <= ${Math.max(res.bareLone.maxShadow, res.bareLayerNeighborPair.maxShadow).toFixed(6)} <= sqrt(2), ` +
        `W_off = 0, Bloch bandwidth = ${res.blochBare.maxBandwidth.toExponential(2)}); ` +
        `M_pair(-1) and M_pair(zeta_18) are exact unitary (normErr <= ${Math.max(res.mpairNeg1OriginPair.maxNormErr, res.mpairZeta18OriginPair.maxNormErr, res.blochNeg1.maxUnitaryErr, res.blochZeta18.maxUnitaryErr).toExponential(2)}), ` +
        `break past sqrt(2) on the cusp husk (layer-neighbor W_off(1..3): u=-1 [${res.mpairNeg1LayerNeighborPair.beats.map(b => b.wOff.toFixed(5)).join(', ')}], ` +
        `u=zeta_18 [${res.mpairZeta18LayerNeighborPair.beats.map(b => b.wOff.toFixed(6)).join(', ')}], maxShadow ${res.mpairNeg1LayerNeighborPair.maxShadow.toFixed(4)}), ` +
        `keep exact 2nd-moment isotropy (12-line I_2 = ${neg1OriginB3.i2Anisotropy.toExponential(2)}; single-line I_2 drops from bare ${bareSingleB3.i2Anisotropy.toFixed(3)} to ${neg1SingleB3.i2Anisotropy.toFixed(3)} at u=-1 and ${z18SingleB3.i2Anisotropy.toFixed(3)} at u=zeta_18) ` +
        `and sub-cubic 4th-moment isotropy (S_4 = ${neg1OriginB3.s4Moment.toFixed(4)}, I_4 = ${neg1OriginB3.i4Anisotropy.toFixed(4)} vs cubic 1.0), ` +
        `and open 3D Bloch bands along (1,0,0)/(1,1,0)/(1,1,1) with O(k^2)-vanishing anisotropy (order ${res.blochNeg1.smallKAnisotropyOrder.toFixed(2)}, tiny-k spread ${res.blochNeg1.tinyKCurvatureSpread.toExponential(2)} at k=pi/64, bw=${res.blochNeg1.maxBandwidth.toFixed(4)}, v_max=${res.blochNeg1.maxGroupSpeedAllDirs.toFixed(4)} at u=-1; ` +
        `order ${res.blochZeta18.smallKAnisotropyOrder.toFixed(2)}, tiny-k spread ${res.blochZeta18.tinyKCurvatureSpread.toExponential(2)}, bw=${res.blochZeta18.maxBandwidth.toFixed(5)}, v_max=${res.blochZeta18.maxGroupSpeedAllDirs.toFixed(5)} at u=zeta_18), ` +
        `strictly causal (v_max <= 1 dock/beat)`,
      metrics: {
        gChart: gChart ? 1 : 0,
        gSparseMatch: gSparseMatch ? 1 : 0,
        gUnitary: gUnitary ? 1 : 0,
        gBareConfined: gBareConfined ? 1 : 0,
        gMpairMovesOffLine: gMpairMovesOffLine ? 1 : 0,
        gIsotropy: gIsotropy ? 1 : 0,
        gCausalSpeed: gCausalSpeed ? 1 : 0,
        cellsR3: res.chart.cells,
        layerSlotsCount: res.chart.layerSlotsCount,
        bulkSlotsCount: res.chart.bulkSlotsCount,
        chartConsistencyErr: res.chart.chartConsistencyErr,
        sparseBareAmpDiff: res.sparseEngineCheck.bareMaxAmpDiff,
        sparseNeg1AmpDiff: res.sparseEngineCheck.mpairNeg1MaxAmpDiff,
        sparseNeg1BigIntNormExact: res.sparseEngineCheck.mpairNeg1BigIntNormExact ? 1 : 0,
        bareLoneMaxShadow: res.bareLone.maxShadow,
        bareLoneMaxWOff: res.bareLone.maxWOff,
        bareOriginMaxShadow: res.bareOriginPair.maxShadow,
        bareOriginMaxWOff: res.bareOriginPair.maxWOff,
        bareLayerMaxShadow: res.bareLayerNeighborPair.maxShadow,
        bareLayerMaxWOff: res.bareLayerNeighborPair.maxWOff,
        neg1OriginNormErr: res.mpairNeg1OriginPair.maxNormErr,
        neg1OriginMsd1: res.mpairNeg1OriginPair.beats[0]!.msd,
        neg1OriginMsd2: res.mpairNeg1OriginPair.beats[1]!.msd,
        neg1OriginMsd3: res.mpairNeg1OriginPair.beats[2]!.msd,
        neg1OriginI2At3: neg1OriginB3.i2Anisotropy,
        neg1OriginS4At3: neg1OriginB3.s4Moment,
        neg1OriginI4At3: neg1OriginB3.i4Anisotropy,
        neg1OriginMaxGraphSpeed: res.mpairNeg1OriginPair.maxGraphSpeed,
        z18OriginNormErr: res.mpairZeta18OriginPair.maxNormErr,
        z18OriginMsd1: res.mpairZeta18OriginPair.beats[0]!.msd,
        z18OriginMsd2: res.mpairZeta18OriginPair.beats[1]!.msd,
        z18OriginMsd3: res.mpairZeta18OriginPair.beats[2]!.msd,
        z18OriginI2At3: z18OriginB3.i2Anisotropy,
        z18OriginS4At3: z18OriginB3.s4Moment,
        z18OriginI4At3: z18OriginB3.i4Anisotropy,
        z18OriginMaxGraphSpeed: res.mpairZeta18OriginPair.maxGraphSpeed,
        bareSingleLineI2At3: bareSingleB3.i2Anisotropy,
        neg1SingleLineI2At3: neg1SingleB3.i2Anisotropy,
        z18SingleLineI2At3: z18SingleB3.i2Anisotropy,
        neg1SingleLineDocksAt1: res.mpairNeg1SingleLineOriginPair.beats[0]!.distinctDocks,
        z18SingleLineDocksAt1: res.mpairZeta18SingleLineOriginPair.beats[0]!.distinctDocks,
        bareSingleLineDocksAt1: res.bareSingleLineOriginPair.beats[0]!.distinctDocks,
        cubicAxisS4Control: res.cubicAxisS4Control,
        cubicAxisI4Control: res.cubicAxisI4Control,
        neg1LayerWOff1: res.mpairNeg1LayerNeighborPair.beats[0]!.wOff,
        neg1LayerWOff2: res.mpairNeg1LayerNeighborPair.beats[1]!.wOff,
        neg1LayerWOff3: res.mpairNeg1LayerNeighborPair.beats[2]!.wOff,
        neg1LayerMaxShadow: res.mpairNeg1LayerNeighborPair.maxShadow,
        z18LayerWOff1: res.mpairZeta18LayerNeighborPair.beats[0]!.wOff,
        z18LayerWOff2: res.mpairZeta18LayerNeighborPair.beats[1]!.wOff,
        z18LayerWOff3: res.mpairZeta18LayerNeighborPair.beats[2]!.wOff,
        z18LayerMaxShadow: res.mpairZeta18LayerNeighborPair.maxShadow,
        blochBareBandwidth: res.blochBare.maxBandwidth,
        blochBareMaxVg: res.blochBare.maxGroupSpeedAllDirs,
        blochBareCrossCheckErr: res.blochBare.realSpaceCrossCheckErr,
        blochNeg1UnitaryErr: res.blochNeg1.maxUnitaryErr,
        blochNeg1CrossCheckErr: res.blochNeg1.realSpaceCrossCheckErr,
        blochNeg1Bandwidth: res.blochNeg1.maxBandwidth,
        blochNeg1MaxVg: res.blochNeg1.maxGroupSpeedAllDirs,
        blochNeg1Curv100: n1Dirs[0]!.quadraticCoeff,
        blochNeg1Curv110: n1Dirs[1]!.quadraticCoeff,
        blochNeg1Curv111: n1Dirs[2]!.quadraticCoeff,
        blochNeg1TinyKCurvSpread: res.blochNeg1.tinyKCurvatureSpread,
        blochNeg1SmallKCurvSpread: res.blochNeg1.smallKCurvatureSpread,
        blochNeg1AnisotropyOrder: res.blochNeg1.smallKAnisotropyOrder,
        blochNeg1SmallKSpeedSpread: res.blochNeg1.smallKSpeedSpread,
        blochNeg1MidKSpeedSpread: res.blochNeg1.midKSpeedSpread,
        blochZ18UnitaryErr: res.blochZeta18.maxUnitaryErr,
        blochZ18CrossCheckErr: res.blochZeta18.realSpaceCrossCheckErr,
        blochZ18Bandwidth: res.blochZeta18.maxBandwidth,
        blochZ18MaxVg: res.blochZeta18.maxGroupSpeedAllDirs,
        blochZ18Curv100: z18Dirs[0]!.quadraticCoeff,
        blochZ18Curv110: z18Dirs[1]!.quadraticCoeff,
        blochZ18Curv111: z18Dirs[2]!.quadraticCoeff,
        blochZ18TinyKCurvSpread: res.blochZeta18.tinyKCurvatureSpread,
        blochZ18SmallKCurvSpread: res.blochZeta18.smallKCurvatureSpread,
        blochZ18AnisotropyOrder: res.blochZeta18.smallKAnisotropyOrder,
        blochZ18SmallKSpeedSpread: res.blochZeta18.smallKSpeedSpread,
        blochZ18MidKSpeedSpread: res.blochZeta18.midKSpeedSpread,
        cubicControlMidKSpeedSpread: res.blochNeg1.cubicControlMidKSpeedSpread,
        seconds,
      },
      control: {
        bareLoneMaxShadow: res.bareLone.maxShadow,
        bareLoneMaxWOff: res.bareLone.maxWOff,
        bareLayerMaxShadow: res.bareLayerNeighborPair.maxShadow,
        bareLayerMaxWOff: res.bareLayerNeighborPair.maxWOff,
        blochBareBandwidth: res.blochBare.maxBandwidth,
        bareSingleLineI2At3: bareSingleB3.i2Anisotropy,
        cubicAxisI4Control: res.cubicAxisI4Control,
        cubicControlMidKSpeedSpread: res.blochNeg1.cubicControlMidKSpeedSpread,
      },
      notes:
        `L2. Exact horospherical cusp projection of R=3 ball (8,857 docks) + exact 24x24 cusp-husk Bloch operator U(k; u) ` +
        `cross-checked against exact Z[w][1/6] sparse-locked-knit on R=3 ball and period-4 floor-0 exact cusp. ` +
        `Layer-neighbor pair starts on the 6 cubic neighbors x_a = n(0, a) along line l(a) through dock 0 (0 frontier hits for t=1,2; ` +
        `exact unitary reflecting frontier for t=3). Origin pair starts on all 12 lines of dock 0 (0 frontier hits for t=1,2,3).`,
    })
  },
})
