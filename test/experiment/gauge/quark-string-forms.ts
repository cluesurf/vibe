// Does a quark string form now? The rule of E-FRC-0144 (code/rule/center-links), where each link holds
// the grid move and the center flux, measured for the string between a static love line and a fear line
// and for a moving meson.
//
// E-FRC-0135 found that the grid field alone binds matter only on contact: the role points see Sigma(648)
// with its center divided out. The center flux E carries the triality with Gauss's law, and a link with
// E mod 3 not 0 costs the tension. Here both are on the link.
//
// The D4 box of side 8 (4,096 cells), the root tau = (1, -1, 0, 0) as time (a line along it closes after 8
// steps) and s = (0, 0, 1, 1) orthogonal to it. Kappa 12, tension 12, demon capacity 200. The two branches of
// E-FRC-0135, prepared the same way under this rule: drain the hashed links for 150 beats, then melted
// (4 units per demon, 200 beats) or cold (no demon energy, 2,500 beats).
//
// On each branch, every run starts from the same settled field:
// - the field alone, 300 beats: level, demon temperature beta, the grid Polyakov count and its correlator
//   along s, and how many links carry flux with no charge anywhere
// - a love line and a fear line along tau at separation R = 1, 2, 3, 4 along s, joined at the start by a
//   straight string (one unit of flux on each of the R links of every time slice), vibes and role points
//   held, 300 beats: the string's length per time slice (links with E mod 3 not 0, over 8), the potential
//   V(R) = tension x that length, its slope, and the link response of E-FRC-0135 (how often the source links
//   carry their role points, the grid Polyakov count on the lines)
// - the same at R = 4 with tension 0, the control: the flux then wanders at no cost
// - a meson, a love and a fear on neighboring cells joined by one unit of flux, hop and role moves on, 600
//   beats, positions followed hop by hop and unwrapped as in E-FRC-0131: mean gap and travel, with kappa and
//   tension, with neither (the free control), and with each alone
//
// What the slope can and cannot say. A straight string of length R has V = tension x R, so the slope
// returns the tension put in whenever the string stays straight. The measurement is the string's excess
// length over R: near 0 the string is confined and taut, large it is rough and melted. The standard
// expectation for a string with 23 ways to turn at each link is that it stays taut when tension x beta
// exceeds ln 23, about 3.1. From E-FRC-0135's demon temperatures that is 4.2 on the melted branch and 3.3 on
// the cold one (its demons are hotter), so the cold branch is predicted only barely taut.
//
// Gates, set from that expectation and from E-FRC-0131's standard before any run of this rule on these
// boxes (no probe was run for them):
// - every run keeps the energy exact and Gauss's law at every cell on every beat
// - on both branches V(R) rises strictly from R = 1 to 4, and the excess length per slice is under 1 at
//   every R
// - with tension 0 the excess length at R = 4 is over 1
// - on both branches the meson with kappa and tension has a mean gap under a tenth of the free meson's, and
//   travels more than 5
//
// The first run, recorded as it came out. It counted the string as the flux-carrying links now minus those
// at the start. On the melted branch that read lengths 1.56, 2.96, 3.62, 5.13 at R = 1 to 4 (excess 0.56,
// 0.96, 0.62, 1.13, so the R = 4 gate failed), and the meson a mean gap of 1.48 against the free 65.6 while
// travelling 7.7. On the cold branch it read 0.02, -1.61, -0.77, 2.78: impossible, since Gauss's law needs at
// least R links per slice. The cold vacuum holds about 100 links of closed flux loops that drift during a run,
// and subtracting the start's count measured that drift. So the instrument was wrong, not the gate. The
// count now subtracts, beat by beat, the same field run with no charge. The gates are unchanged.
//
// The second run, with that count. Melted: every gate holds. The string lengths are 1.20, 2.60, 3.26, 4.77
// at R = 1 to 4 (excess 0.20, 0.60, 0.26, 0.77), the potential rises 14.4, 31.2, 39.1, 57.3, and with no
// tension the flux spreads over about 4,200 links. Cold: the meson gates hold (gap 2.68 against 65.6,
// travel 22.7), and the string gates fail. The lengths read 3.77, 2.14, 2.98, 6.53, not monotonic, and one
// excess (-0.02 at R = 3) sits below the floor Gauss's law sets, so the reading is at the noise of the ~100
// vacuum flux links, whose paths in the paired runs decorrelate. Tension x beta there is 3.33, near the
// expected threshold of 3.1, so a taut string was predicted only barely. The failure stands: on the cold
// branch this instrument cannot show a taut string.
//
// Depth L2: a constructed rule, measured.

import { experiment } from '@/test/scaffold/suite'
import { verdict } from '@/test/scaffold/verdict'
import { rootsD4 } from '@/code/algebra/group/root-system'
import { unitDemonBeta } from '@/code/dynamics/finite-kinetic'
import { carries, fieldEnergy, fixedPoints, hashedLinks, lineTransport } from '@/code/rule/matter-links'
import {
  addFlux,
  centerBeat,
  centerEnergy,
  gaussViolations,
  makeCenterLinks,
  stringLinks,
  type CenterLinks,
  type CenterState,
} from '@/code/rule/center-links'

const SIDE = 8
const KAPPA = 12
const TENSION = 12
const CAPACITY = 200
const DRAIN = 150
const BEATS = 300
const MESON_BEATS = 600
const MELTED = { fill: 4, settle: 200 }
const COLD = { fill: 0, settle: 2500 }
const SEPARATIONS = [1, 2, 3, 4]
const TAUT = Math.log(23)
const GOLDEN = (Math.sqrt(5) - 1) / 2

type Branch = { base: CenterState; start: number }

type FieldRun = { level: number; beta: number; bulkN: number; correlator: number[]; vacuumStringLinks: number; vacuumSeries: number[] }

type PairRun = { exact: boolean; length: number; carry: number; lineN: number }

type MesonRun = { exact: boolean; meanGap: number; travel: number; hops: number }

const dist = (a: number[], b: number[]): number => Math.hypot(...a.map((x, i) => x - (b[i] ?? 0)))

function slope(xs: number[], ys: number[]): number {
  const mx = xs.reduce((a, b) => a + b, 0) / xs.length
  const my = ys.reduce((a, b) => a + b, 0) / ys.length

  return xs.reduce((a, x, k) => a + (x - mx) * ((ys[k] ?? 0) - my), 0) / xs.reduce((a, x) => a + (x - mx) ** 2, 0)
}

export default experiment({
  id: 'gauge/quark-string-forms',
  code: 'E-FRC-0145',
  title:
    'a quark string forms with the whole three-trit link: on the melted field the string between a static love line and a fear line stays taut (excess length under 0.8 per slice at R = 1 to 4, the potential rising 14 to 57) and a meson keeps a mean gap of 1.48 against 65.6 free while it travels, the center flux doing the binding and the grid field only the contact, while on the cold field the meson binds and the string reading is lost in the vacuum flux, so the string gates fail there',
  category: 'gauge',
  substrates: ['3434'],
  depth: 'L2',
  paper: false,
  run() {
    const roots = rootsD4()
    const tau = roots.findIndex(r => r.join(',') === '1,-1,0,0')
    const along = roots.findIndex(r => r.join(',') === '0,0,1,1')
    const make = (input: { kappa: number; tension: number; hop: boolean; roles: boolean }): CenterLinks =>
      makeCenterLinks({ side: SIDE, capacity: CAPACITY, ...input })
    const plain = make({ kappa: KAPPA, tension: TENSION, hop: false, roles: true })
    const { matter } = plain
    const { cells } = matter
    const triangles = (cells * 12 * 8) / 3

    const walk = (x: number, d: number, n: number): number => {
      let c = x

      for (let k = 0; k < n; k++) {
        c = matter.neighbour[c * 24 + d] ?? 0
      }

      return c
    }

    const line = (x: number): number[] => Array.from({ length: SIDE }, (_, t) => walk(x, tau, t))

    const demonMean = (s: CenterState): number => {
      let sum = 0

      for (let x = 0; x < cells; x++) {
        for (const a of matter.firsts) {
          sum += s.demon[x * 24 + a] ?? 0
        }
      }

      return sum / (cells * matter.firsts.length)
    }

    const vacuum = (): CenterState => ({
      vibe: new Int8Array(cells),
      role: new Int8Array(cells),
      links: hashedLinks(matter),
      demon: new Int32Array(cells * 24),
      flux: new Int32Array(cells * 24),
    })

    let drained = vacuum()

    for (let k = 0; k < DRAIN; k++) {
      drained = centerBeat(plain, drained, k).state
      drained.demon.fill(0)
    }

    const branch = (input: { fill: number; settle: number }): Branch => {
      let s: CenterState = { ...drained, links: Int16Array.from(drained.links), flux: Int32Array.from(drained.flux), demon: new Int32Array(cells * 24) }

      for (let x = 0; x < cells; x++) {
        for (const a of matter.firsts) {
          s.demon[x * 24 + a] = Math.floor(2 * input.fill * (((x * 24 + a + 5) * GOLDEN) % 1) + 0.5)
        }
      }

      for (let t = 0; t < input.settle; t++) {
        s = centerBeat(plain, s, t).state
      }

      return { base: s, start: input.settle }
    }

    const fresh = (b: Branch): CenterState => ({
      vibe: new Int8Array(cells),
      role: new Int8Array(cells),
      links: Int16Array.from(b.base.links),
      demon: Int32Array.from(b.base.demon),
      flux: Int32Array.from(b.base.flux),
    })

    const fieldAlone = (b: Branch): FieldRun => {
      let s = fresh(b)
      let level = 0
      let demon = 0
      let bulkN = 0
      let vacuumStringLinks = 0

      const correlator = new Array<number>(SIDE).fill(0)
      const vacuumSeries: number[] = []

      for (let t = 0; t < BEATS; t++) {
        s = centerBeat(plain, s, b.start + t).state

        const n = new Float64Array(cells)

        for (let x = 0; x < cells; x++) {
          n[x] = fixedPoints(matter, lineTransport(matter, s.links, x, tau))
          bulkN += (n[x] ?? 0) / cells / BEATS
        }

        for (let r = 0; r < SIDE; r++) {
          let sum = 0

          for (let x = 0; x < cells; x++) {
            sum += (n[x] ?? 0) * (n[walk(x, along, r)] ?? 0)
          }

          correlator[r] = (correlator[r] ?? 0) + sum / cells / BEATS
        }

        level += fieldEnergy(matter, s.links) / triangles / BEATS
        demon += demonMean(s) / BEATS
        vacuumSeries.push(stringLinks(plain, s.flux))
        vacuumStringLinks += (vacuumSeries[t] ?? 0) / BEATS
      }

      return {
        level,
        beta: unitDemonBeta({ meanDemon: demon, capacity: CAPACITY }),
        bulkN,
        correlator: correlator.map(c => c / (bulkN * bulkN) - 1),
        vacuumStringLinks,
        vacuumSeries,
      }
    }

    // `reference`, beat by beat, is the flux-carrying links of the same field run with no charge, subtracted
    // so that flux loops of the vacuum are not counted as string. Without it the start's count is used
    const pair = (b: Branch, rule: CenterLinks, r: number, reference?: number[]): PairRun => {
      const s0 = fresh(b)
      const x0 = 0
      const y0 = walk(x0, along, r)

      line(x0).forEach((c, t) => {
        s0.vibe[c] = 1
        s0.role[c] = Math.floor(((c + 3) * GOLDEN * 9) % 9)

        for (let j = 0; j < r; j++) {
          addFlux(rule, s0.flux, walk(c, along, j), along, 1)
        }

        const f = walk(y0, tau, t)

        s0.vibe[f] = -1
        s0.role[f] = Math.floor(((f + 10) * GOLDEN * 9) % 9)
      })

      const e0 = centerEnergy(rule, s0)
      const lines = [x0, y0]

      let s = s0
      let exact = gaussViolations(rule, s0) === 0
      let length = 0
      let carry = 0
      let lineN = 0

      for (let t = 0; t < BEATS; t++) {
        s = centerBeat(rule, s, b.start + t).state
        exact = exact && centerEnergy(rule, s) === e0 && gaussViolations(rule, s) === 0
        length += (stringLinks(rule, s.flux) - (reference?.[t] ?? stringLinks(rule, b.base.flux))) / SIDE / BEATS

        for (const x of lines) {
          lineN += fixedPoints(matter, lineTransport(matter, s.links, x, tau)) / lines.length / BEATS

          for (const c of line(x)) {
            carry += carries(matter, s, c, tau) ? 1 / (SIDE * lines.length * BEATS) : 0
          }
        }
      }

      return { exact, length, carry, lineN }
    }

    const meson = (b: Branch, rule: CenterLinks): MesonRun => {
      const s0 = fresh(b)
      const x0 = 0
      const y0 = walk(x0, along, 1)

      s0.vibe[x0] = 1
      s0.vibe[y0] = -1
      s0.role[x0] = 4
      s0.role[y0] = matter.act[(s0.links[x0 * 24 + along] ?? 0) * 9 + 4] ?? 0
      addFlux(rule, s0.flux, x0, along, 1)

      const charges = [
        { cell: x0, sign: 1, at: [0, 0, 0, 0] },
        { cell: y0, sign: -1, at: roots[along] ?? [0, 0, 0, 0] },
      ]

      const onHop = (from: number, to: number, d: number): void => {
        const charge = charges.find(c => c.cell === from)

        if (charge) {
          charge.cell = to
          charge.at = charge.at.map((x, i) => x + (roots[d]?.[i] ?? 0))
        }
      }

      const e0 = centerEnergy(rule, s0)

      let s = s0
      let exact = gaussViolations(rule, s0) === 0
      let gap = 0
      let travel = 0
      let hops = 0

      for (let t = 0; t < MESON_BEATS; t++) {
        const next = centerBeat(rule, s, b.start + t, onHop)

        s = next.state
        hops += next.moved.hops
        exact = exact && centerEnergy(rule, s) === e0 && gaussViolations(rule, s) === 0

        const [love, fear] = charges

        gap += dist(love?.at ?? [], fear?.at ?? []) / MESON_BEATS
        travel = Math.max(travel, dist(love?.at ?? [], [0, 0, 0, 0]))
      }

      return { exact, meanGap: gap, travel, hops: hops / MESON_BEATS }
    }

    const staticRule = make({ kappa: KAPPA, tension: TENSION, hop: false, roles: false })
    const slack = make({ kappa: KAPPA, tension: 0, hop: false, roles: false })
    const mesons = {
      bound: make({ kappa: KAPPA, tension: TENSION, hop: true, roles: true }),
      free: make({ kappa: 0, tension: 0, hop: true, roles: true }),
      tensionOnly: make({ kappa: 0, tension: TENSION, hop: true, roles: true }),
      kappaOnly: make({ kappa: KAPPA, tension: 0, hop: true, roles: true }),
    }

    const measure = (b: Branch) => {
      const field = fieldAlone(b)
      const pairs = SEPARATIONS.map(r => pair(b, staticRule, r, field.vacuumSeries))
      const slackPair = pair(b, slack, SEPARATIONS[SEPARATIONS.length - 1] ?? 4)
      const potential = pairs.map(p => TENSION * p.length)
      const excess = pairs.map((p, k) => p.length - (SEPARATIONS[k] ?? 0))
      const moving = {
        bound: meson(b, mesons.bound),
        free: meson(b, mesons.free),
        tensionOnly: meson(b, mesons.tensionOnly),
        kappaOnly: meson(b, mesons.kappaOnly),
      }

      return { field, pairs, slackPair, potential, excess, sigma: slope(SEPARATIONS, potential), moving }
    }

    const melted = measure(branch(MELTED))
    const cold = measure(branch(COLD))
    const both = [melted, cold]

    const exact = both.every(m => [...m.pairs, m.slackPair].every(p => p.exact) && Object.values(m.moving).every(r => r.exact))

    const ok =
      exact &&
      both.every(
        m =>
          m.potential.every((v, k) => k === 0 || v > (m.potential[k - 1] ?? 0)) &&
          m.excess.every(e => e < 1) &&
          m.slackPair.length - (SEPARATIONS[SEPARATIONS.length - 1] ?? 4) > 1 &&
          m.moving.bound.meanGap < m.moving.free.meanGap / 10 &&
          m.moving.bound.travel > 5,
      )

    const report = (label: string, m: typeof melted): Record<string, number> => ({
      [`${label}Level`]: m.field.level,
      [`${label}DemonBeta`]: m.field.beta,
      [`${label}TensionTimesBeta`]: TENSION * m.field.beta,
      [`${label}VacuumStringLinks`]: m.field.vacuumStringLinks,
      [`${label}PolyakovCount`]: m.field.bulkN,
      ...Object.fromEntries(SEPARATIONS.map(r => [`${label}PolyakovCorrelator${r}`, m.field.correlator[r] ?? 0])),
      ...Object.fromEntries(
        m.pairs.flatMap((p, k) => {
          const r = SEPARATIONS[k]

          return [
            [`${label}StringLengthR${r}`, p.length],
            [`${label}PotentialR${r}`, m.potential[k] ?? 0],
            [`${label}ExcessLengthR${r}`, m.excess[k] ?? 0],
            [`${label}SourceLinksCarryR${r}`, p.carry],
            [`${label}LinePolyakovCountR${r}`, p.lineN],
          ]
        }),
      ),
      [`${label}PotentialSlope`]: m.sigma,
      [`${label}PotentialSlopeTimesBeta`]: m.sigma * m.field.beta,
      [`${label}MesonMeanGap`]: m.moving.bound.meanGap,
      [`${label}MesonTravel`]: m.moving.bound.travel,
      [`${label}MesonHopsPerBeat`]: m.moving.bound.hops,
      [`${label}TensionOnlyMesonMeanGap`]: m.moving.tensionOnly.meanGap,
      [`${label}TensionOnlyMesonTravel`]: m.moving.tensionOnly.travel,
      [`${label}KappaOnlyMesonMeanGap`]: m.moving.kappaOnly.meanGap,
      [`${label}KappaOnlyMesonTravel`]: m.moving.kappaOnly.travel,
    })

    return verdict({
      status: ok ? 'pass' : 'fail',
      claim:
        "with the energy exact and Gauss's law at every cell on every beat, on both branches the potential between a static love line and fear line rises strictly from R = 1 to 4 with the string's excess length under 1 per slice at every R, the string wanders past that with no tension, and a meson with kappa and tension keeps a mean gap under a tenth of the free meson's while it travels more than 5",
      metrics: { energyAndGaussExact: exact ? 1 : 0, ...report('melted', melted), ...report('cold', cold) },
      control: {
        tautThreshold: TAUT,
        meltedTensionZeroExcessLengthR4: melted.slackPair.length - 4,
        coldTensionZeroExcessLengthR4: cold.slackPair.length - 4,
        meltedFreeMesonMeanGap: melted.moving.free.meanGap,
        meltedFreeMesonTravel: melted.moving.free.travel,
        coldFreeMesonMeanGap: cold.moving.free.meanGap,
        coldFreeMesonTravel: cold.moving.free.travel,
        confinementCreutz0126: 1.41,
        d4StringBindsMesonGap0131: 1.72,
        d4StringBindsFreeGap0131: 122,
      },
      notes:
        "L2, exact integers, no random numbers. Distances are in the D4 lattice's own units (a root has length sqrt 2), unwrapped hop by hop. The potential's slope is the tension put in times how straight the string stays, so it is not an independent string tension: the measured content is the excess length. The grid Polyakov count reads the grid field, which the flux does not enter, so it cannot show the quark string. The E-FRC-0126 and 0131 numbers are quoted for comparison, not recomputed.",
    })
  },
})
