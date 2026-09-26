// The confined point again, with the cooling moves of E-FRC-0162: the coupled Sigma(648) rule under the
// modified action of E-FRC-0103 (scale 12, beta1 / beta0 = -1.67 / 12, no put-in tension), its links moved by
// the 'wide' family (each of 40 staple words with each of three center elements, U -> z W U^-1 W), prepared
// by the heat-assisted drain. E-FRC-0160 could not hold beta0 near 12 with the one-staple reflection. Here:
// the Creutz ratios from three independent starts, the field-borne string, and the moving meson.
//
// The point, registered before any loop was read, from probes that read only the triangle level and the
// demon beta (tmp/probe-sigma-anneal, side 4). After 30 heat-assisted cycles the field sits at -0.771 per
// triangle, and a final fill then holds beta0 far more steadily than before:
//
// | fill | beta0 at beat 60 .. 300 |
// | --- | --- |
// | 0.004 | 21.5 .. 18.3 |
// | 0.008 | 15.5 .. 13.1 |
// | 0.012 | 12.6 .. 10.8 |
// | 0.016 | 11.4 .. 9.4 |
//
// Registered: fill 0.008, settled 300 beats, measured over the next 300, where the side-4 probe put beta0
// near 13 falling toward 12. The box here is side 6 (1,296 docks), so the beta0 it reads is measured, not
// assumed. Each run: the identity with a tenth of its links hashed by the pattern 3.3, 4.7 or 6.1, a drain of
// 100 beats, 30 cycles (fill 0.003, 30 beats, 10 drain beats), fill 0.008, 300 beats, then 300 measured.
//
// Measured:
// - per run: beta0 in each half, the triangle level, the fundamental Polyakov loop, W(1,1) .. W(3,3) in the
//   tau-s plane, chi(2,2) and chi(3,3). Their means and standard errors across the three runs
// - on the first run's settled field: a love line and a fear line along tau at R = 1, 2, 3, the string's
//   links twisted to match its flux, vibes and role points held, 300 beats, and the field energy above the
//   same field run without sources, per slice, V(R). Its slope, and the slope times beta, set against the
//   mean chi(2,2). V is an energy, not a free energy
// - a meson on that field with kappa 12 and the coupling, 600 beats, against the free meson of the uncoupled
//   rule (kappa 0, no coupling, so no twist charges its hops)
//
// Gates, fixed before the run:
// - every run keeps the energy exact and Gauss's law at every dock on every beat
// - in every run beta0 lies within 11 to 13 in both halves, and |<P>| is under 0.05
// - chi(2,2) across the three runs is above zero by 3 standard errors
// - V(R) rises strictly from R = 1 to 3, and the slope times beta lies within 30 percent of chi(2,2)
// - the meson keeps a mean gap under a tenth of the free meson's and travels more than 5
//
// Depth L2: a constructed rule, measured.

import { experiment } from '@/test/scaffold/suite'
import { verdict } from '@/test/scaffold/verdict'
import { rootsD4 } from '@/code/algebra/group/root-system'
import { unitDemonBeta } from '@/code/dynamics/finite-kinetic'
import {
  addSigmaFlux,
  coolSigmaLinks,
  defectSigmaLinks,
  fillSigmaDemons,
  makeSigmaLinks,
  pathTransport,
  sigmaBeat,
  sigmaEnergy,
  sigmaFieldEnergy,
  sigmaGaussViolations,
  sigmaLine,
  type SigmaLinks,
  type SigmaState,
} from '@/code/rule/sigma-links'

const SIDE = 6
const SCALE = 12
const RATIO = -1.67 / 12
const KAPPA = 12
const CAPACITY = 48
const COOL = { drain: 100, cycles: 30, fill: 0.003, beats: 30, empties: 10 }
const FILL = 0.008
const SETTLE = 300
const MEASURE = 300
const HASHES = [3.3, 4.7, 6.1]
const BEATS = 300
const MESON_BEATS = 600
const SEPARATIONS = [1, 2, 3]
const GOLDEN = (Math.sqrt(5) - 1) / 2

type Loops = { w11: number; w12: number; w22: number; w23: number; w33: number }

const creutz = (a: number, b: number, c: number): number => -Math.log((c * a) / (b * b))
const dist = (a: number[], b: number[]): number => Math.hypot(...a.map((x, i) => x - (b[i] ?? 0)))

function slope(xs: number[], ys: number[]): number {
  const mx = xs.reduce((a, b) => a + b, 0) / xs.length
  const my = ys.reduce((a, b) => a + b, 0) / ys.length

  return xs.reduce((a, x, k) => a + (x - mx) * ((ys[k] ?? 0) - my), 0) / xs.reduce((a, x) => a + (x - mx) ** 2, 0)
}

function stats(xs: number[]): { mean: number; error: number } {
  const m = xs.reduce((a, b) => a + b, 0) / xs.length
  const sd = Math.sqrt(xs.reduce((a, b) => a + (b - m) ** 2, 0) / (xs.length - 1))

  return { mean: m, error: sd / Math.sqrt(xs.length) }
}

export default experiment({
  id: 'gauge/sigma-cooled-string',
  code: 'E-FRC-0163',
  title:
    'the confined point with the cooling moves: the coupled Sigma(648) rule under the modified action, its links moved by 40 staple words and three centers and prepared by a heat-assisted drain, read for beta0, the Polyakov loop and Creutz ratios across three starts, the field-borne string, and a moving meson',
  category: 'gauge',
  substrates: ['3434'],
  depth: 'L2',
  paper: false,
  run() {
    const roots = rootsD4()
    const tau = roots.findIndex(r => r.join(',') === '1,-1,0,0')
    const along = roots.findIndex(r => r.join(',') === '0,0,1,1')
    const back = (d: number): number => roots.findIndex(r => r.every((x, k) => x === -(roots[d]?.[k] ?? 0)))
    const make = (input: { hop: boolean; roles: boolean; kappa: number; couple: 'none' | 'center' }): SigmaLinks =>
      makeSigmaLinks({ side: SIDE, tension: 0, capacity: CAPACITY, scale: SCALE, ratio: RATIO, moves: 'wide', ...input })
    const rule = make({ hop: false, roles: false, kappa: KAPPA, couple: 'center' })
    const { cells, group } = rule
    const triangles = (cells * 12 * 8) / 3

    const walk = (x: number, d: number, n: number): number => {
      let c = x

      for (let k = 0; k < n; k++) {
        c = rule.neighbour[c * 24 + d] ?? 0
      }

      return c
    }

    const line = (x: number): number[] => Array.from({ length: SIDE }, (_, t) => walk(x, tau, t))

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

    const copyState = (s: SigmaState): SigmaState => ({
      vibe: Int8Array.from(s.vibe),
      role: Int8Array.from(s.role),
      links: Int16Array.from(s.links),
      demon: Int32Array.from(s.demon),
      flux: Int32Array.from(s.flux),
    })

    const point = (hash: number) => {
      const cooled = coolSigmaLinks(rule, defectSigmaLinks(rule, 0.1, hash), COOL)
      const cooledLevel = sigmaFieldEnergy(rule, cooled.state.links) / triangles

      let s = cooled.state

      fillSigmaDemons(rule, s, FILL)

      const e0 = sigmaEnergy(rule, s)

      let t = cooled.beats
      let exact = true

      for (let k = 0; k < SETTLE; k++) {
        s = sigmaBeat(rule, s, t++).state
      }

      const settled = copyState(s)
      const loops: Loops = { w11: 0, w12: 0, w22: 0, w23: 0, w33: 0 }
      const halves = [0, 0]

      let level = 0
      let pre = 0
      let pim = 0

      for (let k = 0; k < MEASURE; k++) {
        s = sigmaBeat(rule, s, t++).state
        exact = exact && sigmaEnergy(rule, s) === e0

        for (let x = 0; x < cells; x++) {
          sizes.forEach(([key], j) => (loops[key] += (group.trace[pathTransport(rule, s.links, x, paths[j] ?? [])] ?? 0) / 3 / cells / MEASURE))
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
        level += sigmaFieldEnergy(rule, s.links) / triangles / MEASURE

        const half = k < MEASURE / 2 ? 0 : 1

        halves[half] = (halves[half] ?? 0) + demonMean(s) / (MEASURE / 2)
      }

      return {
        exact,
        cooledLevel,
        level,
        beta0: halves.map(m => SCALE * unitDemonBeta({ meanDemon: m, capacity: CAPACITY })),
        beta: unitDemonBeta({ meanDemon: ((halves[0] ?? 0) + (halves[1] ?? 0)) / 2, capacity: CAPACITY }),
        polyakov: Math.hypot(pre, pim),
        loops,
        chi22: creutz(loops.w11, loops.w12, loops.w22),
        chi33: creutz(loops.w22, loops.w23, loops.w33),
        settled,
        start: cooled.beats + SETTLE,
      }
    }

    const runs = HASHES.map(point)
    const chi22 = stats(runs.map(r => r.chi22))
    const chi33 = stats(runs.map(r => r.chi33))
    const first = runs[0]!

    // the field-borne string on the first run's settled field
    const twist = (st: SigmaState, x: number, d: number): void => {
      const g = group.product[rule.omega * group.order + (st.links[x * 24 + d] ?? 0)] ?? 0

      st.links[x * 24 + d] = g
      st.links[(rule.neighbour[x * 24 + d] ?? 0) * 24 + (rule.opposite[d] ?? d)] = group.inverse[g] ?? 0
      addSigmaFlux(rule, st.flux, x, d, 1)
    }

    const staticRun = (r: number) => {
      const st = copyState(first.settled)
      const x0 = 0
      const y0 = walk(x0, along, r)

      if (r > 0) {
        line(x0).forEach((c, k) => {
          st.vibe[c] = 1
          st.role[c] = Math.floor(((c + 3) * GOLDEN * 9) % 9)

          for (let j = 0; j < r; j++) {
            twist(st, walk(c, along, j), along)
          }

          const f = walk(y0, tau, k)

          st.vibe[f] = -1
          st.role[f] = Math.floor(((f + 10) * GOLDEN * 9) % 9)
        })
      }

      const e0 = sigmaEnergy(rule, st)

      let s = st
      let exact = sigmaGaussViolations(rule, st) === 0
      let field = 0

      for (let k = 0; k < BEATS; k++) {
        s = sigmaBeat(rule, s, first.start + k).state
        exact = exact && sigmaEnergy(rule, s) === e0 && sigmaGaussViolations(rule, s) === 0
        field += sigmaFieldEnergy(rule, s.links) / BEATS
      }

      return { exact, field }
    }

    const reference = staticRun(0)
    const pairs = SEPARATIONS.map(staticRun)
    const potential = pairs.map(p => (p.field - reference.field) / SIDE)
    const sigma = slope(SEPARATIONS, potential)
    const tension = sigma * first.beta

    const meson = (mover: SigmaLinks) => {
      const st = copyState(first.settled)
      const x0 = 0
      const y0 = walk(x0, along, 1)

      st.vibe[x0] = 1
      st.vibe[y0] = -1
      st.role[x0] = 4
      st.role[y0] = mover.act[(mover.quotient[st.links[x0 * 24 + along] ?? 0] ?? 0) * 9 + 4] ?? 0

      if (mover.couple === 'center') {
        twist(st, x0, along)
      } else {
        addSigmaFlux(mover, st.flux, x0, along, 1)
      }

      const charges = [
        { cell: x0, at: [0, 0, 0, 0] },
        { cell: y0, at: roots[along] ?? [0, 0, 0, 0] },
      ]

      const onHop = (from: number, to: number, d: number): void => {
        const charge = charges.find(c => c.cell === from)

        if (charge) {
          charge.cell = to
          charge.at = charge.at.map((x, i) => x + (roots[d]?.[i] ?? 0))
        }
      }

      const e0 = sigmaEnergy(mover, st)

      let s = st
      let exact = sigmaGaussViolations(mover, st) === 0
      let gap = 0
      let travel = 0

      for (let k = 0; k < MESON_BEATS; k++) {
        s = sigmaBeat(mover, s, first.start + k, onHop).state
        exact = exact && sigmaEnergy(mover, s) === e0 && sigmaGaussViolations(mover, s) === 0

        const [love, fear] = charges

        gap += dist(love?.at ?? [], fear?.at ?? []) / MESON_BEATS
        travel = Math.max(travel, dist(love?.at ?? [], [0, 0, 0, 0]))
      }

      return { exact, meanGap: gap, travel }
    }

    const bound = meson(make({ hop: true, roles: true, kappa: KAPPA, couple: 'center' }))
    const free = meson(make({ hop: true, roles: true, kappa: 0, couple: 'none' }))

    const exact = runs.every(r => r.exact) && reference.exact && pairs.every(p => p.exact) && bound.exact && free.exact
    const held = runs.every(r => r.beta0.every(b => b >= 11 && b <= 13) && r.polyakov < 0.05)

    const ok =
      exact &&
      held &&
      chi22.mean > 3 * chi22.error &&
      potential.every((v, k) => k === 0 || v > (potential[k - 1] ?? 0)) &&
      Math.abs(tension - chi22.mean) < 0.3 * Math.abs(chi22.mean) &&
      bound.meanGap < free.meanGap / 10 &&
      bound.travel > 5

    return verdict({
      status: ok ? 'pass' : 'fail',
      claim:
        "with the energy exact and Gauss's law at every dock on every beat, every run holds beta0 within 11 to 13 with the Polyakov loop under 0.05, chi(2,2) across three runs is above zero by 3 standard errors, the field energy a static pair costs rises strictly from R = 1 to 3 with its slope times beta within 30 percent of chi(2,2), and a meson keeps a mean gap under a tenth of the free meson's while it travels more than 5",
      metrics: Object.fromEntries([
        ['energyAndGaussExact', exact ? 1 : 0],
        ['creutz22Mean', chi22.mean],
        ['creutz22Error', chi22.error],
        ['creutz33Mean', chi33.mean],
        ['creutz33Error', chi33.error],
        ...runs.flatMap((r, k) => [
          [`run${k + 1}CooledLevel`, r.cooledLevel],
          [`run${k + 1}Level`, r.level],
          [`run${k + 1}Beta0FirstHalf`, r.beta0[0] ?? 0],
          [`run${k + 1}Beta0SecondHalf`, r.beta0[1] ?? 0],
          [`run${k + 1}Polyakov`, r.polyakov],
          [`run${k + 1}WilsonLoop11`, r.loops.w11],
          [`run${k + 1}WilsonLoop12`, r.loops.w12],
          [`run${k + 1}WilsonLoop22`, r.loops.w22],
          [`run${k + 1}WilsonLoop23`, r.loops.w23],
          [`run${k + 1}WilsonLoop33`, r.loops.w33],
          [`run${k + 1}Creutz22`, r.chi22],
          [`run${k + 1}Creutz33`, r.chi33],
        ]),
        ...SEPARATIONS.map((r, k) => [`fieldEnergyAboveVacuumPerSliceR${r}`, potential[k] ?? 0]),
        ['fieldSlope', sigma],
        ['fieldSlopeTimesBeta', tension],
        ['mesonMeanGap', bound.meanGap],
        ['mesonTravel', bound.travel],
      ]),
      control: {
        freeMesonMeanGap: free.meanGap,
        freeMesonTravel: free.travel,
        registeredBeta0: 12,
        finiteColorGroupsChi22AtTransition0103: 0.375,
        confinementCreutz0126: 1.41,
      },
      notes:
        "L2, exact integers, no random numbers in the rule. E-FRC-0103's point is on the hypercubic lattice with plaquettes and N_t = 4, this is D4 with triangles and a tau line of 6, so equal beta0 is not an equal spacing. The errors are across three starts sharing one rule and one fill. V is an energy above the no-source run, not a free energy.",
    })
  },
})
