// The quark string with one Sigma(648) element per link (code/rule/sigma-links, E-FRC-0150): the string of
// E-FRC-0145 measured again now that the gauge field itself feels the center, with the fundamental
// Polyakov loop and Creutz ratios of the full element read beside it.
//
// The D4 box of side 8 (4,096 docks), the root tau = (1, -1, 0, 0) as time (a line along it closes after 8
// steps), s = (0, 0, 1, 1) orthogonal to it. Kappa 12, tension 12, demon capacity 200, the triangle priced at
// round(6 (1 - Re Tr / 3)). The two branches are prepared as in E-FRC-0135 and 0145, under this rule: drain
// the hashed links for 150 beats, then melted (4 units per demon, 200 beats) or cold (no demon energy, 2,500
// beats).
//
// On each branch, every run starts from the same settled field:
// - the field alone, 300 beats: level, demon beta, and the full element's observables. The fundamental
//   Polyakov loop P = Tr / 3 round each tau line, its magnitude |<P>| (the configuration mean of the signed
//   spatial mean, as E-FRC-0126), and its correlator C(R) = <Re P(x) P*(x + R s)> at R = 1 to 4, the free
//   energy of a static quark and antiquark R apart, exp(-8 F(R)). Wilson loops W(1,1), W(1,2), W(2,2) of
//   Re Tr / 3 in the tau-s plane and the Creutz ratio chi(2,2) = -ln(W22 W11 / W12^2) with a jackknife error
//   over bins of 25 beats, against E-FRC-0126's 1.41
// - a love line and a fear line along tau at R = 1, 2, 3, 4 along s, joined at the start by a straight
//   string, vibes and role points held, 300 beats: the string length per slice, V(R) = tension x length, the
//   excess over R, the link response
// - the same at R = 4 with tension 0, the control
// - a meson, 600 beats, unwrapped hop by hop: mean gap and travel with kappa and tension, and free
//
// The string instrument, chosen before any run of this file. In E-FRC-0145 the cold string read noise: the
// cold vacuum holds about 100 links of closed flux loops, and subtracting a paired run's count left the
// difference of two decorrelated loop gases. Three candidates were weighed:
// - the flux through a plane between the lines is fixed by Gauss's law at one unit per slice, whatever the
//   string does, so it cannot measure length
// - a paired run with loops frozen changes the dynamics being measured
// - so the string is read from the configuration itself: the flux-carrying links (E mod 3 not 0) in the
//   connected pieces that touch a source dock, joined through shared docks. A closed vacuum loop that does
//   not touch the string carries no flux between the lines and is not counted. A loop that touches the
//   string is counted, since it is then part of the string's shape. This needs no reference run and cannot
//   go below R, since Gauss's law makes the string a connected path of flux from each love dock
// E-FRC-0145's paired count is reported beside it for comparison.
//
// Gates, set before any run of this file, from E-FRC-0145's gates and E-FRC-0126's:
// - every run keeps the energy exact and Gauss's law at every dock on every beat
// - on both branches V(R) rises strictly from R = 1 to 4 on the connected count, and the excess is under 1
//   per slice at every R
// - with tension 0 the excess at R = 4 is over 1
// - on both branches the meson with kappa and tension has a mean gap under a tenth of the free meson's and
//   travels more than 5
// - on the melted branch the center is unbroken, |<P>| under 0.01, and chi(2,2) is above zero by 3 standard
//   errors
//
// The run, recorded as it came out. Energy and Gauss's law exact in every run.
// - melted (beta 0.374, tension x beta 4.48): the string is taut, excess 0.12, 0.35, 0.45, 0.60 at R = 1
//   to 4, V rising 13.4, 28.2, 41.4, 55.2, and with no tension the flux spreads over 4,228 links. The meson
//   keeps a gap of 1.43 against 65.6 free and travels 5.10, just over the gate of 5. |<P>| is 0.0001, the
//   center unbroken. The Creutz gate fails: W(1,2) and W(2,2) come out negative (-0.00045, -0.00015),
//   below their noise, so chi(2,2) cannot be read at all. The field is too strongly coupled for loops past
//   1 x 1 on this box, as E-FRC-0135's melted branch was
// - cold: pricing the center changed this branch. Its demons settle at beta 0.598, not the 0.28 of E-FRC-0145,
//   and the vacuum holds no flux loops at all. The string is taut to the hundredth (excess 0.003 to 0.012),
//   but the meson is frozen: gap 1.414 and travel 1.414, one root, since at tension x beta 7.2 no hop can
//   pay to stretch the string. The travel gate fails. chi(2,2) reads 0.07 +- 0.60, noise
// So the instrument chosen above was not stress-tested: with 1.7 and 0 vacuum loop links it reads the same
// as the paired count on both branches, and the loop gas that defeated E-FRC-0145 did not form here.
//
// Depth L2: a constructed rule, measured.

import { experiment } from '@/test/scaffold/suite'
import { verdict } from '@/test/scaffold/verdict'
import { rootsD4 } from '@/code/algebra/group/root-system'
import { unitDemonBeta } from '@/code/dynamics/finite-kinetic'
import { jackknife } from '@/code/measure/jackknife'
import {
  addSigmaFlux,
  hashedSigmaLinks,
  makeSigmaLinks,
  pathTransport,
  sigmaBeat,
  sigmaCarries,
  sigmaEnergy,
  sigmaFieldEnergy,
  sigmaGaussViolations,
  sigmaLine,
  sigmaStringLinks,
  type SigmaLinks,
  type SigmaState,
} from '@/code/rule/sigma-links'

const SIDE = 8
const KAPPA = 12
const TENSION = 12
const CAPACITY = 200
const DRAIN = 150
const BEATS = 300
const MESON_BEATS = 600
const BIN = 25
const MELTED = { fill: 4, settle: 200 }
const COLD = { fill: 0, settle: 2500 }
const SEPARATIONS = [1, 2, 3, 4]
const GOLDEN = (Math.sqrt(5) - 1) / 2

type Branch = { base: SigmaState; start: number }

type Loops = { w11: number; w12: number; w22: number }

type FieldRun = {
  level: number
  beta: number
  polyakov: number
  correlator: number[]
  chi: { value: number; error: number }
  loops: Loops
  vacuumStringLinks: number
  vacuumSeries: number[]
}

type PairRun = { exact: boolean; connected: number; paired: number; carry: number }

type MesonRun = { exact: boolean; meanGap: number; travel: number }

const mod3 = (x: number): number => ((x % 3) + 3) % 3
const dist = (a: number[], b: number[]): number => Math.hypot(...a.map((x, i) => x - (b[i] ?? 0)))

function slope(xs: number[], ys: number[]): number {
  const mx = xs.reduce((a, b) => a + b, 0) / xs.length
  const my = ys.reduce((a, b) => a + b, 0) / ys.length

  return xs.reduce((a, x, k) => a + (x - mx) * ((ys[k] ?? 0) - my), 0) / xs.reduce((a, x) => a + (x - mx) ** 2, 0)
}

// the flux-carrying links in the connected pieces that touch one of `sources`
function connectedString(rule: SigmaLinks, flux: Int32Array, sources: number[]): number {
  const seen = new Uint8Array(rule.cells)
  const counted = new Uint8Array(rule.cells * 24)
  const queue = [...sources]

  let links = 0

  sources.forEach(x => (seen[x] = 1))

  while (queue.length > 0) {
    const x = queue.pop() ?? 0

    for (let d = 0; d < 24; d++) {
      const o = rule.opposite[d] ?? d
      const y = rule.neighbour[x * 24 + d] ?? 0
      const slot = d < o ? x * 24 + d : y * 24 + o

      if (mod3(flux[slot] ?? 0) === 0) {
        continue
      }

      if (counted[slot] === 0) {
        counted[slot] = 1
        links += 1
      }

      if (seen[y] === 0) {
        seen[y] = 1
        queue.push(y)
      }
    }
  }

  return links
}

export default experiment({
  id: 'gauge/sigma-quark-string',
  code: 'E-FRC-0151',
  title:
    'the quark string with one Sigma(648) element per link: the string between a static love line and a fear line stays taut on both branches (excess under 0.61 melted, under 0.012 cold), the melted meson binds while it moves (gap 1.43 against 65.6), and the full element keeps its center unbroken (|<P>| 0.0001), but no Creutz ratio can be read (loops past 1 x 1 at the noise) and the cold meson is frozen, so two gates fail',
  category: 'gauge',
  substrates: ['3434'],
  depth: 'L2',
  paper: false,
  run() {
    const roots = rootsD4()
    const tau = roots.findIndex(r => r.join(',') === '1,-1,0,0')
    const along = roots.findIndex(r => r.join(',') === '0,0,1,1')
    const back = (d: number): number => roots.findIndex(r => r.every((x, k) => x === -(roots[d]?.[k] ?? 0)))
    const make = (input: { kappa: number; tension: number; hop: boolean; roles: boolean }): SigmaLinks =>
      makeSigmaLinks({ side: SIDE, capacity: CAPACITY, ...input })
    const plain = make({ kappa: KAPPA, tension: TENSION, hop: false, roles: true })
    const { cells, group } = plain
    const triangles = (cells * 12 * 8) / 3

    const walk = (x: number, d: number, n: number): number => {
      let c = x

      for (let k = 0; k < n; k++) {
        c = plain.neighbour[c * 24 + d] ?? 0
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

    const demonMean = (s: SigmaState): number => {
      let sum = 0

      for (let x = 0; x < cells; x++) {
        for (const a of plain.firsts) {
          sum += s.demon[x * 24 + a] ?? 0
        }
      }

      return sum / (cells * plain.firsts.length)
    }

    let drained: SigmaState = {
      vibe: new Int8Array(cells),
      role: new Int8Array(cells),
      links: hashedSigmaLinks(plain),
      demon: new Int32Array(cells * 24),
      flux: new Int32Array(cells * 24),
    }

    for (let k = 0; k < DRAIN; k++) {
      drained = sigmaBeat(plain, drained, k).state
      drained.demon.fill(0)
    }

    const branch = (input: { fill: number; settle: number }): Branch => {
      let s: SigmaState = { ...drained, links: Int16Array.from(drained.links), flux: Int32Array.from(drained.flux), demon: new Int32Array(cells * 24) }

      for (let x = 0; x < cells; x++) {
        for (const a of plain.firsts) {
          s.demon[x * 24 + a] = Math.floor(2 * input.fill * (((x * 24 + a + 5) * GOLDEN) % 1) + 0.5)
        }
      }

      for (let t = 0; t < input.settle; t++) {
        s = sigmaBeat(plain, s, t).state
      }

      return { base: s, start: input.settle }
    }

    const fresh = (b: Branch): SigmaState => ({
      vibe: new Int8Array(cells),
      role: new Int8Array(cells),
      links: Int16Array.from(b.base.links),
      demon: Int32Array.from(b.base.demon),
      flux: Int32Array.from(b.base.flux),
    })

    const fieldAlone = (b: Branch): FieldRun => {
      const sizes: [keyof Loops, number, number][] = [
        ['w11', 1, 1],
        ['w12', 1, 2],
        ['w22', 2, 2],
      ]
      const paths = sizes.map(([, r, h]) => rectangle(r, h))
      const samples: Loops[] = []
      const correlator = new Array<number>(SIDE).fill(0)
      const vacuumSeries: number[] = []
      // tau = b1 steps the first box coordinate, so the docks with that coordinate 0 start every tau line once
      const starts = Array.from({ length: cells }, (_, x) => x).filter(x => x % SIDE === 0)

      let s = fresh(b)
      let level = 0
      let demon = 0
      let re = 0
      let im = 0

      for (let t = 0; t < BEATS; t++) {
        s = sigmaBeat(plain, s, b.start + t).state

        const sample: Loops = { w11: 0, w12: 0, w22: 0 }

        for (let x = 0; x < cells; x++) {
          sizes.forEach(([key], k) => (sample[key] += (group.trace[pathTransport(plain, s.links, x, paths[k] ?? [])] ?? 0) / 3 / cells))
        }

        samples.push(sample)

        // one Polyakov loop per tau line: the lines through every dock of one tau slice
        const pr = new Float64Array(cells)
        const pi = new Float64Array(cells)
        let sr = 0
        let si = 0

        for (const x of starts) {
          const g = sigmaLine(plain, s.links, x, tau)

          pr[x] = (group.trace[g] ?? 0) / 3
          pi[x] = (plain.traceIm[g] ?? 0) / 3
          sr += (pr[x] ?? 0) / starts.length
          si += (pi[x] ?? 0) / starts.length
        }

        re += sr / BEATS
        im += si / BEATS

        for (let r = 0; r < SIDE; r++) {
          let sum = 0

          for (const x of starts) {
            const y = walk(x, along, r)
            // walking along s leaves the slice, so the partner's loop is read where it starts
            const g = sigmaLine(plain, s.links, y, tau)

            sum += (pr[x] ?? 0) * ((group.trace[g] ?? 0) / 3) + (pi[x] ?? 0) * ((plain.traceIm[g] ?? 0) / 3)
          }

          correlator[r] = (correlator[r] ?? 0) + sum / starts.length / BEATS
        }

        level += sigmaFieldEnergy(plain, s.links) / triangles / BEATS
        demon += demonMean(s) / BEATS
        vacuumSeries.push(sigmaStringLinks(plain, s.flux))
      }

      const mean = (xs: Loops[], key: keyof Loops): number => xs.reduce((a, x) => a + x[key], 0) / xs.length
      const chi = jackknife({
        samples,
        estimator: picked => -Math.log((mean(picked, 'w22') * mean(picked, 'w11')) / mean(picked, 'w12') ** 2),
        binSize: BIN,
      })

      return {
        level,
        beta: unitDemonBeta({ meanDemon: demon, capacity: CAPACITY }),
        polyakov: Math.hypot(re, im),
        correlator,
        chi,
        loops: { w11: mean(samples, 'w11'), w12: mean(samples, 'w12'), w22: mean(samples, 'w22') },
        vacuumStringLinks: vacuumSeries.reduce((a, v) => a + v, 0) / BEATS,
        vacuumSeries,
      }
    }

    const pair = (b: Branch, rule: SigmaLinks, r: number, reference: number[]): PairRun => {
      const s0 = fresh(b)
      const x0 = 0
      const y0 = walk(x0, along, r)

      line(x0).forEach((c, t) => {
        s0.vibe[c] = 1
        s0.role[c] = Math.floor(((c + 3) * GOLDEN * 9) % 9)

        for (let j = 0; j < r; j++) {
          addSigmaFlux(rule, s0.flux, walk(c, along, j), along, 1)
        }

        const f = walk(y0, tau, t)

        s0.vibe[f] = -1
        s0.role[f] = Math.floor(((f + 10) * GOLDEN * 9) % 9)
      })

      const e0 = sigmaEnergy(rule, s0)
      const sources = [...line(x0), ...line(y0)]

      let s = s0
      let exact = sigmaGaussViolations(rule, s0) === 0
      let connected = 0
      let paired = 0
      let carry = 0

      for (let t = 0; t < BEATS; t++) {
        s = sigmaBeat(rule, s, b.start + t).state
        exact = exact && sigmaEnergy(rule, s) === e0 && sigmaGaussViolations(rule, s) === 0
        connected += connectedString(rule, s.flux, sources) / SIDE / BEATS
        paired += (sigmaStringLinks(rule, s.flux) - (reference[t] ?? 0)) / SIDE / BEATS

        for (const c of sources) {
          carry += sigmaCarries(rule, s, c, tau) ? 1 / (sources.length * BEATS) : 0
        }
      }

      return { exact, connected, paired, carry }
    }

    const meson = (b: Branch, rule: SigmaLinks): MesonRun => {
      const s0 = fresh(b)
      const x0 = 0
      const y0 = walk(x0, along, 1)

      s0.vibe[x0] = 1
      s0.vibe[y0] = -1
      s0.role[x0] = 4
      s0.role[y0] = plain.act[(plain.quotient[s0.links[x0 * 24 + along] ?? 0] ?? 0) * 9 + 4] ?? 0
      addSigmaFlux(rule, s0.flux, x0, along, 1)

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

      const e0 = sigmaEnergy(rule, s0)

      let s = s0
      let exact = sigmaGaussViolations(rule, s0) === 0
      let gap = 0
      let travel = 0

      for (let t = 0; t < MESON_BEATS; t++) {
        s = sigmaBeat(rule, s, b.start + t, onHop).state
        exact = exact && sigmaEnergy(rule, s) === e0 && sigmaGaussViolations(rule, s) === 0

        const [love, fear] = charges

        gap += dist(love?.at ?? [], fear?.at ?? []) / MESON_BEATS
        travel = Math.max(travel, dist(love?.at ?? [], [0, 0, 0, 0]))
      }

      return { exact, meanGap: gap, travel }
    }

    const staticRule = make({ kappa: KAPPA, tension: TENSION, hop: false, roles: false })
    const slack = make({ kappa: KAPPA, tension: 0, hop: false, roles: false })
    const bound = make({ kappa: KAPPA, tension: TENSION, hop: true, roles: true })
    const free = make({ kappa: 0, tension: 0, hop: true, roles: true })

    const measure = (b: Branch) => {
      const field = fieldAlone(b)
      const pairs = SEPARATIONS.map(r => pair(b, staticRule, r, field.vacuumSeries))
      const slackPair = pair(b, slack, SEPARATIONS[SEPARATIONS.length - 1] ?? 4, field.vacuumSeries)
      const potential = pairs.map(p => TENSION * p.connected)
      const excess = pairs.map((p, k) => p.connected - (SEPARATIONS[k] ?? 0))
      const moving = { bound: meson(b, bound), free: meson(b, free) }

      return { field, pairs, slackPair, potential, excess, sigma: slope(SEPARATIONS, potential), moving }
    }

    const melted = measure(branch(MELTED))
    const cold = measure(branch(COLD))
    const both = [melted, cold]

    const exact = both.every(m => [...m.pairs, m.slackPair].every(p => p.exact) && m.moving.bound.exact && m.moving.free.exact)

    const ok =
      exact &&
      both.every(
        m =>
          m.potential.every((v, k) => k === 0 || v > (m.potential[k - 1] ?? 0)) &&
          m.excess.every(e => e < 1) &&
          m.slackPair.connected - (SEPARATIONS[SEPARATIONS.length - 1] ?? 4) > 1 &&
          m.moving.bound.meanGap < m.moving.free.meanGap / 10 &&
          m.moving.bound.travel > 5,
      ) &&
      melted.field.polyakov < 0.01 &&
      melted.field.chi.value > 3 * melted.field.chi.error

    const report = (label: string, m: typeof melted): Record<string, number> => ({
      [`${label}Level`]: m.field.level,
      [`${label}DemonBeta`]: m.field.beta,
      [`${label}TensionTimesBeta`]: TENSION * m.field.beta,
      [`${label}VacuumStringLinks`]: m.field.vacuumStringLinks,
      [`${label}Polyakov`]: m.field.polyakov,
      ...Object.fromEntries(SEPARATIONS.map(r => [`${label}PolyakovCorrelator${r}`, m.field.correlator[r] ?? 0])),
      [`${label}WilsonLoop11`]: m.field.loops.w11,
      [`${label}WilsonLoop12`]: m.field.loops.w12,
      [`${label}WilsonLoop22`]: m.field.loops.w22,
      [`${label}Creutz22`]: m.field.chi.value,
      [`${label}Creutz22Error`]: m.field.chi.error,
      ...Object.fromEntries(
        m.pairs.flatMap((p, k) => {
          const r = SEPARATIONS[k]

          return [
            [`${label}StringLengthR${r}`, p.connected],
            [`${label}PotentialR${r}`, m.potential[k] ?? 0],
            [`${label}ExcessLengthR${r}`, m.excess[k] ?? 0],
            [`${label}PairedCountLengthR${r}`, p.paired],
            [`${label}SourceLinksCarryR${r}`, p.carry],
          ]
        }),
      ),
      [`${label}PotentialSlope`]: m.sigma,
      [`${label}PotentialSlopeTimesBeta`]: m.sigma * m.field.beta,
      [`${label}MesonMeanGap`]: m.moving.bound.meanGap,
      [`${label}MesonTravel`]: m.moving.bound.travel,
    })

    return verdict({
      status: ok ? 'pass' : 'fail',
      claim:
        "with the energy exact and Gauss's law at every dock on every beat, on both branches the potential read from the flux connected to the sources rises strictly from R = 1 to 4 with the excess under 1 per slice, the string wanders past that with no tension, and a meson with kappa and tension keeps a mean gap under a tenth of the free meson's while it travels more than 5, and on the melted branch the full element's fundamental Polyakov loop is under 0.01 and chi(2,2) is above zero by 3 standard errors",
      metrics: { energyAndGaussExact: exact ? 1 : 0, ...report('melted', melted), ...report('cold', cold) },
      control: {
        meltedTensionZeroExcessLengthR4: melted.slackPair.connected - 4,
        coldTensionZeroExcessLengthR4: cold.slackPair.connected - 4,
        meltedFreeMesonMeanGap: melted.moving.free.meanGap,
        meltedFreeMesonTravel: melted.moving.free.travel,
        coldFreeMesonMeanGap: cold.moving.free.meanGap,
        coldFreeMesonTravel: cold.moving.free.travel,
        confinementCreutz0126: 1.41,
        d4StringBindsMesonGap0131: 1.72,
        quarkStringMesonGap0145: 1.48,
      },
      notes:
        "L2, exact integers, no random numbers. The flux string and the Polyakov loop are two faces of the center that this rule does not join: the flux is the triality's electric side, sourced by the vibes with Gauss's law, and the Polyakov loop is the element's phase round a time line, which the vibes do not source. So the static lines' string is read from the flux, and the Polyakov correlator and Creutz ratios read the field's own confinement. The potential's slope returns the tension put in times how straight the string stays, so the measured content is the excess length. Distances are in the D4 lattice's own units, unwrapped hop by hop.",
    })
  },
})
