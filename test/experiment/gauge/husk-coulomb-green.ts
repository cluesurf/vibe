// Coulomb's law on the husk, exactly (E-FRC-0241). The static field of a charge in the model's own light (the E~
// light on the 3D husk, every integer a column sum of bulk trits, E-FRC-0185, 0207, 0212), with the lattice's own
// correction in closed form.
//
// E-FRC-0212 measured the husk Coulomb coefficient at 0.9971 / (24 D) (axis), 1.0009 (face), 1.0018 (body) at r 8 to
// 17 on a side-64 torus. This file supplies what that left open: the exact prediction, and its test.
//
// THE PREDICTION, written before any run (derivation in code/measure/husk-coulomb):
// (P1) the static operator's symbol eps(k) = sum_h g_h 2 (1 - cos k . u_h) (g 2 on the axes, 1 on the face
//      diagonals) is EXACTLY the bulk D4 root Laplacian's k4 = 0 block, and its moments are EXACT polynomial
//      identities: sum g (k . u)^2 = 6 k^2, sum g (k . u)^4 = 6 (k^2)^2 (isotropic), sum g (k . u)^6 =
//      30 p4 p2 - 24 p6. So eps = 6 k^2 - k^4 / 2 + (30 p4 p2 - 24 p6) / 360 + O(k^8)
// (P2) the Green's function (eps G = delta, infinite husk) is
//        G(r) = 1 / (24 pi r) + A(r-hat) / r^5 + O(r^-7),   A = [(35/6336) K4 - (7/32) K6] / pi
//        A(axis) = -1 / (288 pi),  A(face) = 5 / (576 pi),  A(body) = -5 / (432 pi)
//      with NO 1/r^3 term: the husk's quartic is isotropic, so the lattice first shows at r^-5. The simple cubic
//      Laplacian (the control, the same method) has the known (5 / (32 pi)) K4 / r^3: 1 / (16 pi), -1 / (64 pi),
//      -1 / (24 pi)
// (P3) the continuum coefficient is exactly 1 / (24 pi) (the 6 in 6 k^2), so a +1, -1 pair on the trit light holds
//      (pi / D)(G(0) - G(r)) -> const - 1 / (24 D r): C = 1 / (24 D) with no lattice factor beyond A / r^5.
//      E-FRC-0212's 0.9971 was the torus, not the lattice
// (P4) on the trit rule itself, like charges repel and unlike attract with equal and opposite energies: the like
//      pair's interaction energy, taken from six configurations read off the rule's own flux (four charges and
//      five dipoles, no Green's function used), is minus the unlike pair's at every separation, and Gauss's law
//      holds on every beat
// The bulk beside (P5): the depth-varying modes of the bulk operator are gapped, eps_bulk(0, k4) = 12 (1 - cos k4),
// so a single bulk trit's field differs from the column's only within a depth-sized screening length; the husk
// reads the column sum, which is the k4 = 0 block alone.
//
// METHOD (SECOND RUN; the first run's method is in the notes and failed its own control). The infinite-lattice
// V(r) = G(0) - G(r) from exact mode sums (Kahan-summed, every mode, no sampling) on tori of side 64, 128 and 256,
// each plus its uniform-background term r^2 / (6 a V), then Richardson removing the image terms L^-5 and L^-7.
// G(0) itself from the torus sums G_L(0) corrected by the image constant xi / (4 pi a L) (xi = 2.8372974795) and
// Richardson removing L^-3 and L^-5. Then G(r) = G0 - V(r), and the tail is read without a fit: the scaled
// residual s(r) = (G(r) - c / r) r^p (p = 5 husk, 3 cubic) is taken through its last three radii as
// A + B r^-2 + C r^-4. Along an axis (r = 1 .. 14), a face diagonal (n = 1 .. 10) and a body diagonal (n = 1 .. 8).
// The instrument was calibrated on the CUBIC CONTROL alone before the second run (tmp/coul-probe5..8.log): its G0
// against Watson's integral 0.252731009858933 to 2.7e-13 and its tail to 1e-4. No husk tail was read in a probe.
// Trit rule: side 8, D 4, wave form, 48 beats of light on each placed configuration.
//
// Gates, fixed before the first run (three machinery probes ran before this file, tmp/coul-probe1..2.log: the
// sums' speed at sides 32 and 64 on four points, the moment identities and the series residual at two k, and
// the bulk's root order; no tail coefficient was fitted). G1's and G2's instrument changed for the second run, as
// disclosed in the notes; G1's thresholds did not move, and G2's G0 clause became the Watson calibration because
// the second instrument has one G0, not three:
// S  the moment identities hold with 0 failures on every integer k in [-4, 4]^3 (quadratic, quartic, sextic),
//    the cubic control's quartic is NOT isotropic (failures > 0), and the series residual falls as k^8 (the
//    ratio of residuals at k and k/2 in [200, 312]) along three Weyl directions
// G1 the husk tail A within 2 percent of -1/(288 pi), 5/(576 pi), -5/(432 pi) on the three directions, and the
//    cubic control's A3 within 2 percent of 1/(16 pi), -1/(64 pi), -1/(24 pi)
// G2 (first run: the fitted G0 of the three husk directions agree within 1e-9) second run: the cubic control's
//    extrapolated G0 equals Watson's integral within 1e-9; and, unchanged, 24 pi r (G0 - V(r)) is within 2e-4 of 1
//    at every r >= 6 on all three husk directions
// G3 on the trit rule (side 8, D 4), every configuration of G4 run 48 beats: 0 bulk and 0 husk Gauss violations
//    on every beat, the longitudinal energy constant to 1e-9, and each dipole's energy equal to
//    (pi / D)(G_8(0) - G_8(r)) of the side-8 torus to 1e-9
// G4 W_like(r) = U4 - U(a,Z1) - U(b,Z2) - U(a,Z2) - U(b,Z1) + U(Z1,Z2) and U_unlike(r) = U(a+, b-) read off the
//    rule satisfy |W_like + U_unlike| < 1e-9 at r = 1 .. 4, U_unlike strictly increasing (attraction) and W_like
//    strictly decreasing (repulsion)
// G5 the bulk symbol at k4 = 0 equals the husk symbol to 1e-12 at 64 golden-Weyl points, and at k = 0 equals
//    12 (1 - cos k4) to 1e-12 at 16 points
// Status: pass if every gate holds; partial if S, G3 and G4 hold; fail otherwise.
//
// Depth L2: the exact lattice electrostatics of the model's light, with its closed-form correction; the charge
// is the vibe trit. HUSK FIRST: every number is a husk number except G5, the bulk beside. The start family does
// not enter (a static field, no link start read).

import { experiment } from '@/test/scaffold/suite'
import { verdict } from '@/test/scaffold/verdict'
import { rootsD4 } from '@/code/algebra/group/root-system'
import {
  bulkGaussViolations,
  bulkFlux,
  columnSumLinks,
  emptyTritState,
  huskGaussViolations,
  makeTritLight,
  tritLightBeat,
  type TritLight,
  type TritState,
} from '@/code/rule/trit-column'
import { huskGreenDifference } from '@/code/measure/trit-hop-light'
import { weyl, GOLDEN, SILVER } from '@/code/tool/weyl'
import {
  continuumCoefficient,
  dockOfColumn,
  infiniteGreenThree,
  infiniteGreenZero,
  longitudinalEnergy,
  momentIdentityFailures,
  placeStrung,
  richardsonTail,
  symbolAt,
  symbolSeries,
  tailCoefficient,
  tailPower,
  type SymbolKind,
} from '@/code/measure/husk-coulomb'

const SIDE = 64
const DIRECTIONS: { name: string; unit: number[]; count: number }[] = [
  { name: 'axis', unit: [1, 0, 0], count: 14 },
  { name: 'face', unit: [1, 1, 0], count: 10 },
  { name: 'body', unit: [1, 1, 1], count: 8 },
]

type Fit = {
  g0: number
  tail: number
  tailShort: number
  predicted: number
  ratio: number
  worstUnity: number
  unity: number[]
  rs: number[]
  scaled: number[]
}

function greenStudy(kind: SymbolKind): {
  fits: Record<string, Fit>
  g0: number
  imageChange: number
} {
  const points: number[][] = []

  for (const dir of DIRECTIONS) {
    for (let n = 1; n <= dir.count; n++) {
      points.push(dir.unit.map(x => x * n))
    }
  }

  const green = infiniteGreenThree(kind, SIDE, points)
  const g0 = infiniteGreenZero(kind, SIDE).value
  const c = continuumCoefficient(kind)
  const p = tailPower(kind)
  const fits: Record<string, Fit> = {}

  let at = 0

  for (const dir of DIRECTIONS) {
    const rs: number[] = []
    const v: number[] = []
    const scaled: number[] = []

    for (let n = 1; n <= dir.count; n++) {
      const r = Math.hypot(...dir.unit) * n

      rs.push(r)
      v.push(green.value[at]!)
      scaled.push((g0 - green.value[at]! - c / r) * r ** p)
      at++
    }

    const tail = richardsonTail(rs, scaled)
    // the same two radii earlier: how settled the reading is
    const tailShort = richardsonTail(
      rs.slice(0, -2),
      scaled.slice(0, -2),
    )
    const predicted = tailCoefficient(kind, dir.unit)
    // 24 pi r (G0 - V) for the husk, 4 pi r (G0 - V) for the cubic: r (G0 - V) / c
    const unity = rs.map((r, i) => (r * (g0 - v[i]!)) / c)

    fits[dir.name] = {
      g0,
      tail,
      tailShort,
      predicted,
      ratio: tail / predicted,
      worstUnity: Math.max(
        ...unity.map((x, i) => (rs[i]! >= 6 ? Math.abs(x - 1) : 0)),
      ),
      unity,
      rs,
      scaled,
    }
  }

  return { fits, g0, imageChange: green.change }
}

// the bulk symbol sum over the 24 roots of (1 - cos k . rho)
function bulkSymbol(k: readonly number[]): number {
  return rootsD4().reduce(
    (s, r) =>
      s + 1 - Math.cos(r.reduce((a, x, i) => a + x * (k[i] ?? 0), 0)),
    0,
  )
}

function runConfiguration(
  light: TritLight,
  place: (s: TritState) => void,
  beats: number,
): {
  energy: number
  drift: number
  bulkGauss: number
  huskGauss: number
} {
  const s = emptyTritState(light)

  place(s)

  const first = longitudinalEnergy(light, s).longitudinal

  let drift = 0
  let bulkGauss = bulkGaussViolations(light, s)
  let huskGauss = huskGaussViolations(
    light,
    columnSumLinks(light, bulkFlux(light, s)),
    s.vibe,
  )

  for (let t = 0; t < beats; t++) {
    tritLightBeat(light, s)
    bulkGauss += bulkGaussViolations(light, s)
    huskGauss += huskGaussViolations(
      light,
      columnSumLinks(light, bulkFlux(light, s)),
      s.vibe,
    )

    drift = Math.max(
      drift,
      Math.abs(longitudinalEnergy(light, s).longitudinal - first),
    )
  }

  return { energy: first, drift, bulkGauss, huskGauss }
}

function ruleStudy(): {
  metrics: Record<string, number>
  g3: boolean
  g4: boolean
} {
  const depth = 4
  const side = 8
  const beats = 48
  const light = makeTritLight({ side, depth, form: 'wave' })
  const metrics: Record<string, number> = {}
  const scale = Math.PI / depth

  let g3 = true
  let g4 = true

  const unlike: number[] = []
  const like: number[] = []

  for (let r = 1; r <= 4; r++) {
    const a = dockOfColumn(light, [0, 0, 0], 0)
    const b = dockOfColumn(light, [r, 0, 0], 0)
    const z1 = dockOfColumn(light, [0, 4, 4], 0)
    const runs = {
      four: runConfiguration(
        light,
        s => {
          placeStrung(light, s, a, [0, 4, 4], 1)
          placeStrung(light, s, b, [0, 4, 4], 1)
        },
        beats,
      ),
      aZ1: runConfiguration(
        light,
        s => void placeStrung(light, s, a, [0, 4, 4], 1),
        beats,
      ),
      bZ2: runConfiguration(
        light,
        s => void placeStrung(light, s, b, [0, 4, 4], 1),
        beats,
      ),
      aZ2: runConfiguration(
        light,
        s => void placeStrung(light, s, a, [r, 4, 4], 1),
        beats,
      ),
      bZ1: runConfiguration(
        light,
        s => void placeStrung(light, s, b, [side - r, 4, 4], 1),
        beats,
      ),
      z1Z2: runConfiguration(
        light,
        s => void placeStrung(light, s, z1, [r, 0, 0], 1),
        beats,
      ),
      ab: runConfiguration(
        light,
        s => void placeStrung(light, s, a, [r, 0, 0], 1),
        beats,
      ),
    }
    const w =
      runs.four.energy -
      runs.aZ1.energy -
      runs.bZ2.energy -
      runs.aZ2.energy -
      runs.bZ1.energy +
      runs.z1Z2.energy
    const u = runs.ab.energy
    const green = scale * huskGreenDifference(side, [r, 0, 0])
    const greenFar = scale * huskGreenDifference(side, [0, 4, 4])

    unlike.push(u)
    like.push(w)

    for (const [name, run] of Object.entries(runs)) {
      g3 =
        g3 &&
        run.bulkGauss === 0 &&
        run.huskGauss === 0 &&
        run.drift < 1e-9
      metrics[`rule_r${r}_${name}_energy`] = run.energy
      metrics[`rule_r${r}_${name}_drift`] = run.drift
      metrics[`rule_r${r}_${name}_gauss`] =
        run.bulkGauss + run.huskGauss
    }

    g3 =
      g3 &&
      Math.abs(u - green) < 1e-9 &&
      Math.abs(runs.aZ1.energy - greenFar) < 1e-9
    metrics[`rule_r${r}_unlike`] = u
    metrics[`rule_r${r}_like`] = w
    metrics[`rule_r${r}_sum`] = w + u
    metrics[`rule_r${r}_green`] = green
    g4 = g4 && Math.abs(w + u) < 1e-9
  }

  for (let i = 1; i < unlike.length; i++) {
    g4 = g4 && unlike[i]! > unlike[i - 1]! && like[i]! < like[i - 1]!
    // the force per crossing: minus the energy's step (like: positive = pushes apart)
    metrics[`rule_forceLike_${i}to${i + 1}`] = -(
      like[i]! - like[i - 1]!
    )

    metrics[`rule_forceUnlike_${i}to${i + 1}`] = -(
      unlike[i]! - unlike[i - 1]!
    )
  }

  return { metrics, g3, g4 }
}

export default experiment({
  id: 'gauge/husk-coulomb-green',
  code: 'E-FRC-0241',
  title:
    "Coulomb's law on the husk, exactly: the husk light's static operator has an isotropic quartic (sum g (k . u)^4 = 6 (k^2)^2 exactly), so its Green's function is 1 / (24 pi r) with NO 1/r^3 lattice term, the first correction A / r^5 with A = -1/(288 pi), 5/(576 pi), -5/(432 pi) on the axis, face and body diagonals in closed form (the simple cubic control carries its known 1/r^3); the coefficient is exactly 1 / (24 D) on the trit rule, like charges repel and unlike attract with equal and opposite energies read off the rule's own flux, and Gauss holds on every beat",
  category: 'gauge',
  substrates: ['3434'],
  depth: 'L2',
  paper: false,
  run() {
    const started = Date.now()
    const metrics: Record<string, number> = {}

    // S: moments and series
    const husk = momentIdentityFailures('husk', 4)
    const cubic = momentIdentityFailures('cubic', 4)

    // the cubic's quartic against the isotropic form: count vectors where p4 != (p2)^2 (always, off the axes)
    let cubicQuarticAniso = 0

    for (let a = -4; a <= 4; a++) {
      for (let b = -4; b <= 4; b++) {
        for (let c = -4; c <= 4; c++) {
          cubicQuarticAniso +=
            a ** 4 + b ** 4 + c ** 4 === (a * a + b * b + c * c) ** 2
              ? 0
              : 1
        }
      }
    }

    let seriesOk = true

    for (let j = 1; j <= 3; j++) {
      const dir = [
        weyl(j, GOLDEN) - 0.5,
        weyl(j, SILVER) - 0.5,
        weyl(j + 7, GOLDEN) - 0.5,
      ]
      const norm = Math.hypot(...dir)

      const at = (s: number): number => {
        const k = dir.map(x => (s * x) / norm)

        return Math.abs(symbolAt('husk', k) - symbolSeries('husk', k))
      }

      const ratio = at(0.2) / at(0.1)

      metrics[`seriesRatio${j}`] = ratio
      seriesOk = seriesOk && ratio >= 200 && ratio <= 312
    }

    metrics.huskMomentFailures =
      husk.quadratic + husk.quartic + husk.sextic
    metrics.momentVectors = husk.checked
    metrics.cubicMomentFailures =
      cubic.quadratic + cubic.quartic + cubic.sextic
    metrics.cubicQuarticAnisotropic = cubicQuarticAniso

    const gateS =
      husk.quadratic + husk.quartic + husk.sextic === 0 &&
      cubic.quadratic + cubic.quartic + cubic.sextic === 0 &&
      cubicQuarticAniso > 0 &&
      seriesOk

    // G1, G2: the Green's functions
    const hs = greenStudy('husk')
    const cs = greenStudy('cubic')

    let gate1 = true

    for (const dir of DIRECTIONS) {
      const h = hs.fits[dir.name]!
      const c = cs.fits[dir.name]!

      metrics[`husk_${dir.name}_tail`] = h.tail
      metrics[`husk_${dir.name}_tailPredicted`] = h.predicted
      metrics[`husk_${dir.name}_tailRatio`] = h.ratio
      metrics[`husk_${dir.name}_tailRatioTwoRadiiEarlier`] =
        h.tailShort / h.predicted
      metrics[`husk_${dir.name}_worstUnityAtLeast6`] = h.worstUnity
      metrics[`cubic_${dir.name}_tail`] = c.tail
      metrics[`cubic_${dir.name}_tailPredicted`] = c.predicted
      metrics[`cubic_${dir.name}_tailRatio`] = c.ratio
      metrics[`cubic_${dir.name}_tailRatioTwoRadiiEarlier`] =
        c.tailShort / c.predicted

      h.rs.forEach((r, i) => {
        metrics[`husk_${dir.name}_unity_r${r.toFixed(3)}`] = h.unity[i]!
        metrics[`husk_${dir.name}_scaledTail_r${r.toFixed(3)}`] =
          h.scaled[i]!
      })

      gate1 =
        gate1 &&
        Math.abs(h.ratio - 1) < 0.02 &&
        Math.abs(c.ratio - 1) < 0.02
    }

    const watson = 0.252731009858933

    metrics.huskG0 = hs.g0
    metrics.cubicG0 = cs.g0
    metrics.cubicG0MinusWatson = cs.g0 - watson
    metrics.huskImageChange = hs.imageChange
    metrics.cubicImageChange = cs.imageChange

    const g0Spread = Math.abs(cs.g0 - watson)
    const gate2 =
      g0Spread < 1e-9 &&
      DIRECTIONS.every(d => hs.fits[d.name]!.worstUnity < 2e-4)

    // G3, G4: the trit rule
    const rule = ruleStudy()

    Object.assign(metrics, rule.metrics)

    // G5: the bulk beside
    let bulkHusk = 0
    let bulkGap = 0

    for (let i = 1; i <= 64; i++) {
      const k = [
        2 * Math.PI * weyl(i, GOLDEN),
        2 * Math.PI * weyl(i, SILVER),
        2 * Math.PI * weyl(i + 101, GOLDEN),
      ]

      bulkHusk = Math.max(
        bulkHusk,
        Math.abs(bulkSymbol([...k, 0]) - symbolAt('husk', k)),
      )
    }

    for (let i = 1; i <= 16; i++) {
      const k4 = 2 * Math.PI * weyl(i, SILVER)

      bulkGap = Math.max(
        bulkGap,
        Math.abs(bulkSymbol([0, 0, 0, k4]) - 12 * (1 - Math.cos(k4))),
      )
    }

    metrics.bulkHuskSymbolDifference = bulkHusk
    metrics.bulkDepthGapDifference = bulkGap

    for (const d of [4, 11, 16]) {
      // the lightest depth mode k4 = pi / D: mass^2 12 (1 - cos(pi / D)) against 6 k^2, screening length
      const m2 = 12 * (1 - Math.cos(Math.PI / d))

      metrics[`bulkDepthMass2_D${d}`] = m2
      metrics[`bulkScreeningLength_D${d}`] = Math.sqrt(6 / m2)
    }

    const gate5 = bulkHusk < 1e-12 && bulkGap < 1e-12
    const gates = {
      S: gateS,
      G1: gate1,
      G2: gate2,
      G3: rule.g3,
      G4: rule.g4,
      G5: gate5,
    }

    for (const [k, v] of Object.entries(gates)) {
      metrics[`gate${k}`] = v ? 1 : 0
    }

    metrics.seconds = (Date.now() - started) / 1000

    const status = Object.values(gates).every(Boolean)
      ? 'pass'
      : gateS && rule.g3 && rule.g4
        ? 'partial'
        : 'fail'
    const f = (x: number): string => x.toPrecision(5)

    return verdict({
      status,
      claim: `the husk light's static operator is the bulk's k4 = 0 block (${bulkHusk.toExponential(1)}) with an exactly isotropic quartic (${husk.checked} integer vectors, 0 failures; the cubic control's quartic anisotropic on ${cubicQuarticAniso}); its infinite-lattice Green's function is 1/(24 pi r) plus A / r^5 with A read at ${f(hs.fits.axis!.ratio)}, ${f(hs.fits.face!.ratio)}, ${f(hs.fits.body!.ratio)} of the closed form -1/(288 pi), 5/(576 pi), -5/(432 pi) (cubic control's 1/r^3 at ${f(cs.fits.axis!.ratio)}, ${f(cs.fits.face!.ratio)}, ${f(cs.fits.body!.ratio)} of its known form, its G0 on Watson's to ${g0Spread.toExponential(1)}), husk G0 = ${hs.g0.toPrecision(12)}, and 24 pi r (G0 - V) within ${Math.max(...DIRECTIONS.map(d => hs.fits[d.name]!.worstUnity)).toExponential(1)} of 1 from r = 6; on the trit rule (side 8, D 4) like pairs' energies read off the rule's flux are minus the unlike pairs' to ${Math.max(...[1, 2, 3, 4].map(r => Math.abs(rule.metrics[`rule_r${r}_sum`]!))).toExponential(1)} (unlike ${[1, 2, 3, 4].map(r => f(rule.metrics[`rule_r${r}_unlike`]!)).join(', ')} at r = 1 .. 4), with Gauss exact on every beat`,
      metrics,
      control: {
        cubicAxisTailRatio: cs.fits.axis!.ratio,
        cubicAxisTail: cs.fits.axis!.tail,
      },
      notes: `L2, deterministic (exact mode sums, golden and silver Weyl points, no draw). Gates: ${JSON.stringify(gates)}. FIRST RUN 2026-09-26 (tmp/frc0241.log, 7.8 s), PARTIAL: S, G3, G4, G5 passed exactly as now; G1 and G2 failed on the instrument, not the prediction. The first instrument fitted G0 + a r^-p + ... per direction over r up to 12 on two tori (128, 256); it read the husk tail at 1.316, 0.703, 0.917 of the closed form and ALSO the cubic control's known 1/r^3 at 0.902, 1.080, 1.003, with the three husk G0 spread 7.4e-9 against 1e-9: the fit, not the lattice, was wrong (the axis series converges slowly and a free G0 absorbs it). SECOND RUN, instrument changed and disclosed: G0 computed directly from the torus sums with the image constant and Richardson in L (the first form assumed L^-5; a cubic probe showed L^-3, from the images of a lattice 1/r^3 tail), three tori for V (64, 128, 256), and the tail read by Richardson in r through the last three radii instead of a fit, radii extended to 14, 10, 8. It was calibrated on the cubic control alone (Watson's G0 to 2.7e-13, tails to 1e-4, tmp/coul-probe5..8.log) before any husk tail was read. G1's 2 percent tolerance did not move; G2's G0 clause changed from three fitted G0 agreeing to the control's G0 against Watson, because the new instrument has one G0; its unity clause did not move. The first run's unity worst values (6.2e-5, 8.7e-5, 1.2e-4) used the fitted G0s.`,
    })
  },
})
