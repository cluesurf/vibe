// Where does the D4 field confine? A scan of beta0 with the cooling moves of E-FRC-0162: the coupled Sigma(648)
// rule under the modified action (scale 12, beta1 / beta0 = -1.67 / 12, no put-in tension), links moved by the
// 'wide' family, prepared by the heat-assisted drain, on the side-4 D4 box, whose tau lines close after 4
// steps: N_t = 4, the length E-FRC-0103 set Sigma(648) against SU(3) at.
//
// The fills, chosen from an energy-only probe (tmp/probe-sigma-anneal, side 4, the same preparation), which read
// the triangle level and beta0 only:
//
// | fill | beta0 at beat 60 .. 300 | level |
// | --- | --- | --- |
// | 0.008 | 15.5 .. 13.1 | -0.76 .. -0.81 |
// | 0.02 | 9.9 .. 8.3 | -0.70 .. -0.78 |
// | 0.04 | 7.4 .. 7.2 | -0.49 |
// | 0.08 | 5.8 .. 6.0 | 0.07 |
// | 0.16 | 3.6 .. 3.7 | 1.05 |
//
// The level jumps between fills 0.02 and 0.08 while beta0 moves only from 8.3 to 5.8, which is where a
// transition would sit. The scan takes 11 fills, 0.008, 0.012, 0.016, 0.02, 0.025, 0.03, 0.04, 0.06, 0.08,
// 0.12 and 0.16, from two independent cooled starts (the identity with a tenth of its links hashed by the
// patterns 3.3 and 4.7, the heat-assisted drain of E-FRC-0162), each settled 300 beats and measured over
// 400.
//
// Measured at each point, per start: beta0 (demon), the triangle level, the fundamental Polyakov loop P, the
// mean over the 64 tau lines of Tr / 3 round each, its magnitude |<P>| over the measurement, and its
// susceptibility chi_P = V (<|P|^2> - <|P|>^2) with V = 64 lines. No Wilson loop is read, so the point E-FRC-0167
// then registers is chosen before any loop is looked at.
//
// The registration rule, fixed here before the run: the point for E-FRC-0167 is the fill with the largest
// beta0 at which |<P>| is under 0.05 in both starts, the confined point nearest the transition.
//
// Gates, fixed before the run:
// - every run keeps the energy exact on every beat
// - the hottest point (fill 0.16) is confined, |<P>| under 0.05 in both starts, and the coldest (fill 0.008)
//   is not, |<P>| over 0.1 in both
// - the susceptibility, averaged over the two starts, peaks at an interior fill, not at either end
//
// The run, recorded as it came out. Energy exact, every gate holds. The two starts, averaged:
//
// | fill | beta0 | level | Polyakov | susceptibility |
// | --- | --- | --- | --- | --- |
// | 0.008 | 13.61 | -0.823 | 0.397 | 0.017 |
// | 0.012 | 10.67 | -0.836 | 0.396 | 0.019 |
// | 0.016 | 9.32 | -0.824 | 0.403 | 0.018 |
// | 0.02 | 8.34 | -0.808 | 0.420 | 0.055 |
// | 0.025 | 7.57 | -0.773 | 0.422 | 0.033 |
// | 0.03 | 6.81 | -0.749 | 0.450 | 0.076 |
// | 0.04 | 7.16 | -0.530 | 0.294 | 0.086 (peak) |
// | 0.06 | 7.07 | -0.180 | 0.081 | 0.063 |
// | 0.08 | 5.88 | 0.051 | 0.024 | 0.040 |
// | 0.12 | 4.39 | 0.515 | 0.002 | 0.026 |
// | 0.16 | 3.64 | 1.029 | 0.004 | 0.025 |
//
// The Polyakov loop falls from about 0.4 to under 0.03 between fills 0.03 and 0.08, while the level jumps by
// 0.8 per triangle and beta0 stays near 7 and even runs backward (6.81, 7.16, 7.07): the back-bent caloric
// curve of a first-order transition at fixed energy, the shape E-FRC-0102 and 0110 saw. The susceptibility
// peaks at fill 0.04. So on the D4 lattice at N_t = 4 the field deconfines near beta0 = 7.1, against 13 for
// the same group and action on the hypercubic lattice (E-FRC-0103), about half. Registered for E-FRC-0167 by
// the rule above: fill 0.08, beta0 5.88, Polyakov 0.024 (both starts under 0.05).
//
// Depth L2: a constructed rule, measured.

import { experiment } from '@/test/scaffold/suite'
import { verdict } from '@/test/scaffold/verdict'
import { rootsD4 } from '@/code/algebra/group/root-system'
import { unitDemonBeta } from '@/code/dynamics/finite-kinetic'
import {
  coolSigmaLinks,
  defectSigmaLinks,
  fillSigmaDemons,
  makeSigmaLinks,
  sigmaBeat,
  sigmaEnergy,
  sigmaFieldEnergy,
  sigmaLine,
  type SigmaState,
} from '@/code/rule/sigma-links'

const SIDE = 4
const SCALE = 12
const RATIO = -1.67 / 12
const CAPACITY = 48
const COOL = { drain: 100, cycles: 30, fill: 0.003, beats: 30, empties: 10 }
const FILLS = [0.008, 0.012, 0.016, 0.02, 0.025, 0.03, 0.04, 0.06, 0.08, 0.12, 0.16]
const HASHES = [3.3, 4.7]
const SETTLE = 300
const MEASURE = 400

type Point = { beta0: number; level: number; polyakov: number; susceptibility: number; exact: boolean }

export default experiment({
  id: 'gauge/sigma-deconfinement-scan',
  code: 'E-FRC-0166',
  title:
    'where the D4 field confines: a beta0 scan of the coupled Sigma(648) rule under the modified action, with the cooling moves and the heat-assisted drain, at N_t = 4, finds the Polyakov loop falling from 0.4 to under 0.03 across a first-order transition near beta0 = 7.1 (susceptibility peak at fill 0.04), half the hypercubic 13, and registers the confined point fill 0.08, beta0 5.88',
  category: 'gauge',
  substrates: ['3434'],
  depth: 'L2',
  paper: false,
  run() {
    const roots = rootsD4()
    const tau = roots.findIndex(r => r.join(',') === '1,-1,0,0')
    const rule = makeSigmaLinks({ side: SIDE, kappa: 12, tension: 0, capacity: CAPACITY, hop: false, roles: false, couple: 'center', scale: SCALE, ratio: RATIO, moves: 'wide' })
    const { cells, group } = rule
    const triangles = (cells * 12 * 8) / 3
    const lines = Array.from({ length: cells }, (_, x) => x).filter(x => x % SIDE === 0)

    const demonMean = (s: SigmaState): number => {
      let sum = 0

      for (let x = 0; x < cells; x++) {
        for (const a of rule.firsts) {
          sum += s.demon[x * 24 + a] ?? 0
        }
      }

      return sum / (cells * rule.firsts.length)
    }

    const scan = HASHES.map(hash => {
      const cooled = coolSigmaLinks(rule, defectSigmaLinks(rule, 0.1, hash), COOL)

      return FILLS.map((fill): Point => {
        let s: SigmaState = { ...cooled.state, links: Int16Array.from(cooled.state.links), demon: new Int32Array(cells * 24) }

        fillSigmaDemons(rule, s, fill)

        const e0 = sigmaEnergy(rule, s)

        let t = cooled.beats
        let exact = true

        for (let k = 0; k < SETTLE; k++) {
          s = sigmaBeat(rule, s, t++).state
        }

        let demon = 0
        let level = 0
        let pre = 0
        let pim = 0
        let squared = 0
        let magnitude = 0

        for (let k = 0; k < MEASURE; k++) {
          s = sigmaBeat(rule, s, t++).state
          exact = exact && sigmaEnergy(rule, s) === e0

          let sr = 0
          let si = 0

          for (const x of lines) {
            const g = sigmaLine(rule, s.links, x, tau)

            sr += (group.trace[g] ?? 0) / 3 / lines.length
            si += (rule.traceIm[g] ?? 0) / 3 / lines.length
          }

          pre += sr / MEASURE
          pim += si / MEASURE
          squared += (sr * sr + si * si) / MEASURE
          magnitude += Math.hypot(sr, si) / MEASURE
          demon += demonMean(s) / MEASURE
          level += sigmaFieldEnergy(rule, s.links) / triangles / MEASURE
        }

        return {
          beta0: SCALE * unitDemonBeta({ meanDemon: demon, capacity: CAPACITY }),
          level,
          polyakov: Math.hypot(pre, pim),
          susceptibility: lines.length * (squared - magnitude * magnitude),
          exact,
        }
      })
    })

    const exact = scan.every(points => points.every(p => p.exact))
    const mean = (k: number, key: keyof Omit<Point, 'exact'>): number => scan.reduce((a, points) => a + (points[k]?.[key] ?? 0), 0) / scan.length
    const susceptibility = FILLS.map((_, k) => mean(k, 'susceptibility'))
    const peak = susceptibility.indexOf(Math.max(...susceptibility))
    const hottest = FILLS.length - 1
    const confinedAtHottest = scan.every(points => (points[hottest]?.polyakov ?? 1) < 0.05)
    const deconfinedAtColdest = scan.every(points => (points[0]?.polyakov ?? 0) > 0.1)
    const confined = FILLS.map((_, k) => scan.every(points => (points[k]?.polyakov ?? 1) < 0.05))
    const registered = confined
      .map((isConfined, k) => ({ isConfined, k, beta0: mean(k, 'beta0') }))
      .filter(p => p.isConfined)
      .sort((a, b) => b.beta0 - a.beta0)[0]

    const ok = exact && confinedAtHottest && deconfinedAtColdest && peak > 0 && peak < hottest

    return verdict({
      status: ok ? 'pass' : 'fail',
      claim:
        'with the energy exact on every beat, the hottest point of the scan is confined and the coldest is not in both starts, and the Polyakov susceptibility peaks at an interior point: a confinement transition on the D4 lattice at N_t = 4',
      metrics: Object.fromEntries<number>([
        ['energyExact', exact ? 1 : 0],
        ['peakFill', FILLS[peak] ?? -1],
        ['peakBeta0', mean(peak, 'beta0')],
        ['registeredFill', registered ? (FILLS[registered.k] ?? -1) : -1],
        ['registeredBeta0', registered?.beta0 ?? -1],
        ...FILLS.flatMap((fill, k): [string, number][] => {
          const key = String(fill).replace('.', '_')

          return [
            [`beta0Fill${key}`, mean(k, 'beta0')],
            [`levelFill${key}`, mean(k, 'level')],
            [`polyakovFill${key}`, mean(k, 'polyakov')],
            [`polyakovSpreadFill${key}`, Math.abs((scan[0]?.[k]?.polyakov ?? 0) - (scan[1]?.[k]?.polyakov ?? 0))],
            [`susceptibilityFill${key}`, susceptibility[k] ?? 0],
          ]
        }),
      ]),
      control: {
        su3TransitionBeta0Hypercubic0103: 5.6925,
        sigma648TransitionBeta0Hypercubic0103: 13,
        polyakovLines: lines.length,
      },
      notes:
        'L2, exact integers, no random numbers. A fixed-energy run reads its temperature from the demons, so the scan is in the fill and beta0 is measured, and inside a first-order region the demon temperature need not rise with the energy (E-FRC-0110). The Polyakov values are magnitudes of the configuration mean over 400 beats, and their floor on 64 lines is near 1 / sqrt(64 x independent beats), so small values are bounded by that noise. N_t = 4 on a box of spatial extent 4 is a small box, so the transition is broad.',
    })
  },
})
