// Can the coupled Sigma(648) rule reach a confined point with loops above the noise? The modified action of
// E-FRC-0103 (a Re Tr U^2 term, beta1 / beta0 on its trajectory), which on the hypercubic lattice does not
// freeze and confines, with its N_t = 4 Creutz ratios matching SU(3) (0.375 against 0.378), put into the
// coupled rule of E-FRC-0154 (code/rule/sigma-links, `couple: 'center'`, `ratio`), quantized at scale 12 as
// E-FRC-0110 runs it: level round(12 ((1 - Re Tr / 3) + r (3 - Re Tr g^2))), r = -1.67 / 12, the trajectory
// at beta0 = 12, levels -1 to 16, demon capacity 48 (three times the largest level, as E-FRC-0110). No
// put-in tension: the flux costs nothing of its own, and the field pays for its twists.
//
// The registered point, beta0 near 12 on the confined side of E-FRC-0103's N_t = 4 transition at 13, is
// reached as E-FRC-0110 reaches it: drain the field into its lowest state (a beat, then every demon emptied),
// then fill a fraction of the demons to capacity. Three probes, reading only the demon beta and the triangle,
// were run before this file (tmp/probe-sigma-mixed, side 6, 300 beats after the fill):
//
// | start | drain stalls at level | fill | beta0 at beat 60 .. 300 | triangle Re Tr / 3 |
// | --- | --- | --- | --- | --- |
// | the identity with a tenth of its links hashed | 0.746 (the same at 100 and 600 drain beats) | 0.003 | 18.6 .. 11.6 | 0.729 .. 0.731 |
// | same | same | 0.01 | 9.4 .. 6.9 | 0.73 |
// | same | same | 0.04 | 4.0 .. 3.4 | 0.71 |
// | the hashed links of E-FRC-0128 | 2.651 | 0.003 | 15.8 .. 6.7 | 0.25 .. 0.28 |
// | same | same | 0.04 | 4.3 .. 3.2 | 0.26 .. 0.28 |
//
// So the probes already say the point will not hold: the drain stalls far above the lowest level, -1 per
// triangle, and as soon as the demons hold any energy the field falls toward that level and pours what it
// stored into them, so beta0 passes through 12 and keeps falling. The run measures this with the numbers,
// and measures what the field is where it does settle, which is what E-FRC-0161 then builds a string on.
//
// Runs, on the side-6 D4 box (1,296 docks), each drained for 100 beats, filled at 0.003, settled 1,500 beats
// and measured for 600:
// - three independent ordered starts (the identity with a tenth of its links hashed by three different
//   patterns), for the errors: beta0 in each half of the measurement, the triangle, the fundamental Polyakov
//   loop, W(1,1) .. W(3,3) in the tau-s plane, and chi(2,2) and chi(3,3) per run, their mean and its standard
//   error across the three runs
// - one start from the hashed links, the disordered side
// - the energy stored above the lowest level after the drain, per link: (drained level + 1) x 8 / 3 triangles
//
// Gates, fixed before the run:
// - every run keeps the energy exact on every beat
// - the confined point is held: in every ordered run, beta0 in both halves of the measurement lies within 11
//   to 13, |<P>| is under 0.05, and chi(2,2) across the three runs is above zero by 3 standard errors
// The probes predict the second gate fails. It is set as the question the note asked, not moved to pass.
//
// The run, recorded as it came out. Energy exact in every run. The point is not held, and the gate fails.
// - the three ordered starts drain to levels 0.746, 0.706, 0.655 per triangle (the same at the halfway beat
//   to three places), 4.66, 4.55, 4.41 units per link above the lowest level. Filled at 0.003, they settle at
//   beta0 7.4 / 7.3, 9.2 / 9.0 and 8.2 / 8.1 in the two halves of the measurement, triangle levels 0.36, 0.43,
//   0.33, and fundamental Polyakov loops 0.56, 0.63, 0.62: ordered and deconfined. Their loops stand well
//   above the noise (W(1,1) 0.65 to 0.72, W(3,3) 0.28 to 0.32), but chi(2,2) is 0.011, 0.109, -0.031 and
//   chi(3,3) 0.049, 0.080, -0.017: across the three, chi(2,2) = 0.030 +- 0.042 and chi(3,3) = 0.037 +- 0.029,
//   zero within the errors. No string tension, against 0103's 0.375 and 0126's 1.41
// - the hashed start drains to 2.65, 9.75 units per link above the lowest level, settles at beta0 3.8 and is
//   confined, Polyakov 0.009, but its loops past 1 x 1 are at the noise (W(1,2) 0.0036, W(2,2) 0.0058), so
//   no Creutz ratio reads there either
// Why, with the numbers: a demon at beta0 = 12 (beta 1 at scale 12, capacity 48) holds 0.58 units on
// average. The drain leaves 4.4 to 9.7 units per link that the field will release, and releasing them heats the
// demons to beta0 near 2 to 9. The drain stalls because the reflection cannot leave a field whose staples
// it only inverts, so the lowest level is out of reach and with it the cold confined side. What the rule
// reaches is either confined with loops at the noise, or ordered with a broken center.
//
// Depth L2: a constructed rule, measured.

import { experiment } from '@/test/scaffold/suite'
import { verdict } from '@/test/scaffold/verdict'
import { rootsD4 } from '@/code/algebra/group/root-system'
import { unitDemonBeta } from '@/code/dynamics/finite-kinetic'
import {
  defectSigmaLinks,
  drainFillSettle,
  hashedSigmaLinks,
  makeSigmaLinks,
  pathTransport,
  sigmaBeat,
  sigmaEnergy,
  sigmaFieldEnergy,
  sigmaLine,
  type SigmaLinks,
  type SigmaState,
} from '@/code/rule/sigma-links'

const SIDE = 6
const SCALE = 12
const RATIO = -1.67 / 12
const KAPPA = 12
const FILL = 0.003
const DRAIN = 100
const SETTLE = 1500
const MEASURE = 600
const HASHES = [3.3, 4.7, 6.1]

type Loops = { w11: number; w12: number; w22: number; w23: number; w33: number }

type PointRun = {
  exact: boolean
  drainedLevel: number
  stalledLevel: number
  stored: number
  beta0: [number, number]
  triangle: number
  polyakov: number
  loops: Loops
  chi22: number
  chi33: number
  final: SigmaState
}

const creutz = (a: number, b: number, c: number): number => -Math.log((c * a) / (b * b))

function makeConfinedRule(): SigmaLinks {
  const probe = makeSigmaLinks({ side: SIDE, kappa: 0, tension: 0, capacity: 1, couple: 'center', scale: SCALE, ratio: RATIO })
  const capacity = 3 * Math.max(...Array.from(probe.level).map(Math.abs))

  return makeSigmaLinks({ side: SIDE, kappa: KAPPA, tension: 0, capacity, hop: false, roles: false, couple: 'center', scale: SCALE, ratio: RATIO })
}

export default experiment({
  id: 'gauge/sigma-confined-point',
  code: 'E-FRC-0160',
  title:
    'the coupled Sigma(648) rule cannot hold the confined point of the modified action: its drain stalls 4.4 to 9.7 units per link above the lowest level, and releasing them carries beta0 to 7 to 9 from the ordered starts (Polyakov 0.56 to 0.63, chi(2,2) 0.030 +- 0.042) and to 3.8 from the disordered one (confined, loops at the noise), so no confining string tension can be read',
  category: 'gauge',
  substrates: ['3434'],
  depth: 'L2',
  paper: false,
  run() {
    const roots = rootsD4()
    const tau = roots.findIndex(r => r.join(',') === '1,-1,0,0')
    const along = roots.findIndex(r => r.join(',') === '0,0,1,1')
    const back = (d: number): number => roots.findIndex(r => r.every((x, k) => x === -(roots[d]?.[k] ?? 0)))
    const rule = makeConfinedRule()
    const { cells, group } = rule
    const triangles = (cells * 12 * 8) / 3
    const lowest = Math.min(...Array.from(rule.level))

    const rectangle = (r: number, h: number): number[] => [
      ...new Array<number>(r).fill(along),
      ...new Array<number>(h).fill(tau),
      ...new Array<number>(r).fill(back(along)),
      ...new Array<number>(h).fill(back(tau)),
    ]
    const sizes: [keyof Loops, number, number][] = [
      ['w11', 1, 1],
      ['w12', 1, 2],
      ['w22', 2, 2],
      ['w23', 2, 3],
      ['w33', 3, 3],
    ]
    const paths = sizes.map(([, r, h]) => rectangle(r, h))
    const starts = Array.from({ length: cells }, (_, x) => x).filter(x => x % SIDE === 0)

    const demonMean = (s: SigmaState): number => {
      let sum = 0

      for (let x = 0; x < cells; x++) {
        for (const a of rule.firsts) {
          sum += s.demon[x * 24 + a] ?? 0
        }
      }

      return sum / (cells * rule.firsts.length)
    }

    const pointRun = (links: Int16Array): PointRun => {
      const prepared = drainFillSettle(rule, links, { drain: DRAIN, fill: FILL, settle: SETTLE })
      const e0 = sigmaEnergy(rule, prepared.state)
      const loops: Loops = { w11: 0, w12: 0, w22: 0, w23: 0, w33: 0 }
      const halves = [0, 0]

      let s = prepared.state
      let exact = prepared.exact
      let triangle = 0
      let pre = 0
      let pim = 0

      for (let t = 0; t < MEASURE; t++) {
        s = sigmaBeat(rule, s, DRAIN + SETTLE + t).state
        exact = exact && sigmaEnergy(rule, s) === e0

        for (let x = 0; x < cells; x++) {
          sizes.forEach(([key], k) => (loops[key] += (group.trace[pathTransport(rule, s.links, x, paths[k] ?? [])] ?? 0) / 3 / cells / MEASURE))
        }

        let sr = 0
        let si = 0

        for (const x of starts) {
          const g = sigmaLine(rule, s.links, x, tau)

          sr += (group.trace[g] ?? 0) / 3 / starts.length
          si += (rule.traceIm[g] ?? 0) / 3 / starts.length
        }

        pre += sr / MEASURE
        pim += si / MEASURE
        triangle += sigmaFieldEnergy(rule, s.links) / triangles / MEASURE

        const half = t < MEASURE / 2 ? 0 : 1

        halves[half] = (halves[half] ?? 0) + demonMean(s) / (MEASURE / 2)
      }

      return {
        exact,
        drainedLevel: prepared.drainedLevel,
        stalledLevel: prepared.halfwayLevel,
        stored: ((prepared.drainedLevel - lowest) * 8) / 3,
        beta0: [SCALE * unitDemonBeta({ meanDemon: halves[0] ?? 0, capacity: rule.capacity }), SCALE * unitDemonBeta({ meanDemon: halves[1] ?? 0, capacity: rule.capacity })],
        triangle,
        polyakov: Math.hypot(pre, pim),
        loops,
        chi22: creutz(loops.w11, loops.w12, loops.w22),
        chi33: creutz(loops.w22, loops.w23, loops.w33),
        final: s,
      }
    }

    const ordered = HASHES.map(hash => pointRun(defectSigmaLinks(rule, 0.1, hash)))
    const disordered = pointRun(hashedSigmaLinks(rule))

    const stats = (xs: number[]): { mean: number; error: number } => {
      const m = xs.reduce((a, b) => a + b, 0) / xs.length
      const sd = Math.sqrt(xs.reduce((a, b) => a + (b - m) ** 2, 0) / (xs.length - 1))

      return { mean: m, error: sd / Math.sqrt(xs.length) }
    }

    const chi22 = stats(ordered.map(r => r.chi22))
    const chi33 = stats(ordered.map(r => r.chi33))
    const exact = [...ordered, disordered].every(r => r.exact)
    const held = ordered.every(r => r.beta0.every(b => b >= 11 && b <= 13) && r.polyakov < 0.05) && chi22.mean > 3 * chi22.error

    const ok = exact && held

    const report = (label: string, r: PointRun): [string, number][] => [
      [`${label}DrainStalledLevel`, r.stalledLevel],
      [`${label}DrainedLevel`, r.drainedLevel],
      [`${label}StoredPerLink`, r.stored],
      [`${label}Beta0FirstHalf`, r.beta0[0]],
      [`${label}Beta0SecondHalf`, r.beta0[1]],
      [`${label}TriangleLevel`, r.triangle],
      [`${label}Polyakov`, r.polyakov],
      [`${label}WilsonLoop11`, r.loops.w11],
      [`${label}WilsonLoop12`, r.loops.w12],
      [`${label}WilsonLoop22`, r.loops.w22],
      [`${label}WilsonLoop23`, r.loops.w23],
      [`${label}WilsonLoop33`, r.loops.w33],
      [`${label}Creutz22`, r.chi22],
      [`${label}Creutz33`, r.chi33],
    ]

    return verdict({
      status: ok ? 'pass' : 'fail',
      claim:
        'with the energy exact on every beat, the coupled rule holds the confined point of the modified action: in every ordered run beta0 stays within 11 to 13 in both halves of the measurement, the fundamental Polyakov loop is under 0.05, and chi(2,2) across three independent runs is above zero by 3 standard errors',
      metrics: Object.fromEntries([
        ['energyExact', exact ? 1 : 0],
        ['lowestLevel', lowest],
        ['creutz22Mean', chi22.mean],
        ['creutz22Error', chi22.error],
        ['creutz33Mean', chi33.mean],
        ['creutz33Error', chi33.error],
        ...ordered.flatMap((r, k) => report(`ordered${k + 1}`, r)),
        ...report('disordered', disordered),
      ]),
      control: {
        registeredBeta0: 12,
        finiteColorGroupsChi22AtTransition0103: 0.375,
        su3Chi22AtTransition0103: 0.378,
        confinementCreutz0126: 1.41,
      },
      notes:
        "L2, exact integers, no random numbers. E-FRC-0103's point is on the hypercubic lattice with a plaquette action and N_t = 4, this is the D4 lattice with triangles and a line of 6 along tau, so equal beta0 is not an equal spacing even where it holds. The errors on chi are the standard error across three runs that share the rule and the fill and differ in the pattern of their starting defects, so they are independent in start, not in the ensemble, and a frozen branch can make them agree too well.",
    })
  },
})
