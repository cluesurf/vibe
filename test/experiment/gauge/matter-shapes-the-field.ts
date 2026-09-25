// Does matter now shape the field? The rule of E-FRC-0134 (code/rule/matter-links), where a link joining two
// vibes lowers the energy by kappa when it carries the one's role point onto the other's, measured for what
// the matter does to the links and what the links do to the matter.
//
// The D4 box of side 6 (1,296 cells), read as a Euclidean lattice with the root tau = (1, -1, 0, 0) as time:
// the line x, x + tau, ... closes after 6 steps, and s = (0, 0, 1, 1) is orthogonal to it. A static source is
// a line of vibes along tau (a worldline), the hopping term along it is the source's propagator, and its
// transport round the line is the Polyakov product. Kappa 12, demon capacity 200.
//
// Two branches of the field, both prepared from the hashed links of E-FRC-0128 by draining the demons for
// 150 beats (tmp/probe-matter-field):
// - melted: then 4 units per demon on average, settled 200 beats (mean triangle level about 6.6 of 9)
// - cold: then no demon energy, settled 2,500 beats while the field releases heat into the demons (level
//   about 4.8). The reflection dynamics does not reach the ordered phase from either side: a drain stalls
//   near level 6, and a cold start with a twentieth of its links hashed stays near level 1.1 with 8 units in
//   every demon. So the cold branch is a slowly aging field, reported as such, not an equilibrium
//
// On each branch, every run starts from the same settled links and demons and runs 300 beats, so a run with
// matter and one without differ only by the matter:
// - the field alone: the Polyakov fixed-point count N of the tau lines (a role point's survival round the
//   line, E-FRC-0119), its correlator along s, and rectangular role-point loops in the tau-s plane with
//   their Creutz ratio chi(2, 2), the string read
// - 27 static love lines with their role points frozen, so only the links can respond: how often a line's
//   links carry the role points (1/9 by chance), N on the lines, and the dent, the mean triangle level round
//   the source links against the same links in the run without matter
// - the same with kappa 0: the matter is then invisible, the field bit-identical to the run without matter
// - a love line and a fear line at separations 1, 2 and 3 along s: does anything depend on the separation
// - a moving meson, a love and a fear on neighboring cells with the hop on: how often it is adjacent, how
//   often its link carries its color when adjacent, its mean gap, against kappa 0, with role points free and
//   with role points frozen (then only the links and the hop's transport can match the pair)
//
// Gates, set after the probes (tmp/probe-matter-shapes, tmp/probe-matter-loops), before this run:
// - every run keeps the energy exact on every beat
// - on both branches the links alone make the source lines carry their role points more than half the time,
//   against under 0.2 with kappa 0, and raise N on the lines above the run without matter
// - on both branches the kappa-0 run leaves the links bit-identical to the run without matter
// - on the melted branch the dent is positive by 2 standard errors
// - the meson with kappa is adjacent more than 3 times as often as without, and when adjacent its link
//   carries its color more than half the time with role points frozen
// The rest is reported as measured: whether a string can be read on each branch, whether the pair depends on
// its separation, and whether the meson is confined (its mean gap against the control).
//
// Result of the first run, recorded as it came out: every gate holds but one. On the cold branch the source
// links carry their role points 0.475 of the time, under the 0.5 set from the melted probe, and the Polyakov
// count on the lines rises only from 0.999 to 1.004. A reading, not measured: a colder field is stiffer, a
// link move there disturbs 8 triangles at a lower level, so the matter's kappa pays for fewer of them. The
// gate is left as set,
// and the experiment fails on it. The kappa-0 meson reads the same on both branches because with no matter
// term a hop costs nothing, so its path does not depend on the field at all.
//
// Depth L2: a constructed rule, measured.

import { experiment } from '@/test/scaffold/suite'
import { verdict } from '@/test/scaffold/verdict'
import { rootsD4 } from '@/code/algebra/group/root-system'
import { d4BoxDistance } from '@/code/substrate/d4-box'
import { unitDemonBeta } from '@/code/dynamics/finite-kinetic'
import {
  carries,
  fieldEnergy,
  fixedPoints,
  hashedLinks,
  lineTransport,
  linkLevel,
  makeMatterLinks,
  matterBeat,
  totalEnergy,
  type MatterLinks,
  type MatterState,
} from '@/code/rule/matter-links'

const SIDE = 6
const KAPPA = 12
const CAPACITY = 200
const DRAIN = 150
const BEATS = 300
const MELTED = { fill: 4, settle: 200 }
const COLD = { fill: 0, settle: 2500 }
const SEPARATIONS = [1, 2, 3]
const GOLDEN = (Math.sqrt(5) - 1) / 2

type Branch = { base: MatterState; start: number }

type FieldRun = {
  level: number
  beta: number
  bulkN: number
  correlator: number[]
  loops: { w11: number; w12: number; w22: number }
}

type LinesRun = { exact: boolean; matched: number; lineN: number; perLine: number[]; links: Int16Array }

type MesonRun = { exact: boolean; adjacent: number; matchedWhenAdjacent: number; meanGap: number; hops: number }

const mean = (xs: number[]): number => xs.reduce((a, b) => a + b, 0) / xs.length

export default experiment({
  id: 'gauge/matter-shapes-the-field',
  code: 'E-FRC-0135',
  title:
    "does matter shape the field: under the rule where links feel the matter, static source lines pull their links into carrying their color (0.81 of the time on the melted field, 0.48 on the cold one, against 1/9 by chance) at an energy cost in the triangles round them, and a meson's link follows it as it moves, but the effect stays on the links the matter touches: no string between separated lines, the pair bound by contact only, the role-point string read only on the cold field, and the gate that the cold field's links respond more than half the time fails",
  category: 'gauge',
  substrates: ['3434'],
  depth: 'L2',
  paper: false,
  run() {
    const roots = rootsD4()
    const tau = roots.findIndex(r => r.join(',') === '1,-1,0,0')
    const along = roots.findIndex(r => r.join(',') === '0,0,1,1')
    const make = (input: { kappa: number; hop: boolean; roles: boolean }): MatterLinks => makeMatterLinks({ side: SIDE, capacity: CAPACITY, ...input })
    const plain = make({ kappa: KAPPA, hop: false, roles: true })
    const { cells } = plain
    const triangles = (cells * 12 * 8) / 3
    const walk = (x: number, d: number, n: number): number => {
      let c = x

      for (let k = 0; k < n; k++) {
        c = plain.neighbour[c * 24 + d] ?? 0
      }

      return c
    }
    const line = (x: number): number[] => Array.from({ length: SIDE }, (_, t) => walk(x, tau, t))
    const demonMean = (s: MatterState): number => {
      let sum = 0

      for (let x = 0; x < cells; x++) {
        for (const a of plain.firsts) {
          sum += s.demon[x * 24 + a] ?? 0
        }
      }

      return sum / (cells * plain.firsts.length)
    }

    // the drained field, shared by both branches
    let drained: MatterState = { vibe: new Int8Array(cells), role: new Int8Array(cells), links: hashedLinks(plain), demon: new Int32Array(cells * 24) }

    for (let k = 0; k < DRAIN; k++) {
      drained = matterBeat(plain, drained, k).state
      drained.demon.fill(0)
    }

    const branch = (input: { fill: number; settle: number }): Branch => {
      let s: MatterState = { ...drained, links: Int16Array.from(drained.links), demon: new Int32Array(cells * 24) }

      for (let x = 0; x < cells; x++) {
        for (const a of plain.firsts) {
          s.demon[x * 24 + a] = Math.floor(2 * input.fill * (((x * 24 + a + 5) * GOLDEN) % 1) + 0.5)
        }
      }

      for (let t = 0; t < input.settle; t++) {
        s = matterBeat(plain, s, t).state
      }

      return { base: s, start: input.settle }
    }

    // the transport round a rectangle r along s by h along tau, from x
    const rectangle = (links: Int16Array, x: number, r: number, h: number): number => {
      const dirs = [...Array(r).fill(along), ...Array(h).fill(tau), ...Array(r).fill(plain.opposite[along]), ...Array(h).fill(plain.opposite[tau])] as number[]

      let g = plain.identity
      let c = x

      for (const d of dirs) {
        g = plain.compose[(links[c * 24 + d] ?? 0) * plain.order + g] ?? 0
        c = plain.neighbour[c * 24 + d] ?? 0
      }

      return g
    }

    const fieldAlone = (b: Branch): FieldRun => {
      let s = b.base
      let level = 0
      let demon = 0
      let bulkN = 0
      const correlator = new Array(SIDE).fill(0)
      const loops = { w11: 0, w12: 0, w22: 0 }

      for (let t = 0; t < BEATS; t++) {
        s = matterBeat(plain, s, b.start + t).state

        const n = new Float64Array(cells)

        for (let x = 0; x < cells; x++) {
          n[x] = fixedPoints(plain, lineTransport(plain, s.links, x, tau))
          bulkN += n[x]! / cells / BEATS
          loops.w11 += (fixedPoints(plain, rectangle(s.links, x, 1, 1)) - 1) / cells / BEATS
          loops.w12 += (fixedPoints(plain, rectangle(s.links, x, 1, 2)) - 1) / cells / BEATS
          loops.w22 += (fixedPoints(plain, rectangle(s.links, x, 2, 2)) - 1) / cells / BEATS
        }

        for (let r = 0; r < SIDE; r++) {
          let sum = 0

          for (let x = 0; x < cells; x++) {
            sum += n[x]! * n[walk(x, along, r)]!
          }

          correlator[r] += sum / cells / BEATS
        }

        level += fieldEnergy(plain, s.links) / triangles / BEATS
        demon += demonMean(s) / BEATS
      }

      return {
        level,
        beta: unitDemonBeta({ meanDemon: demon, capacity: CAPACITY }),
        bulkN,
        correlator: correlator.map(c => c / (bulkN * bulkN) - 1),
        loops,
      }
    }

    // static source lines through `starts`, signs `signs`, role points hashed
    const lines = (b: Branch, rule: MatterLinks, starts: number[], signs: number[]): LinesRun => {
      const vibe = new Int8Array(cells)
      const role = new Int8Array(cells)

      starts.forEach((x, k) =>
        line(x).forEach(c => {
          vibe[c] = signs[k] ?? 1
          role[c] = Math.floor(((c + 7 * k + 3) * GOLDEN * 9) % 9)
        }),
      )

      let s: MatterState = { vibe, role, links: Int16Array.from(b.base.links), demon: Int32Array.from(b.base.demon) }
      const e0 = totalEnergy(rule, s)
      const perLine = starts.map(() => 0)

      let exact = true
      let matched = 0
      let lineN = 0

      for (let t = 0; t < BEATS; t++) {
        s = matterBeat(rule, s, b.start + t).state
        exact = exact && totalEnergy(rule, s) === e0

        starts.forEach((x, k) => {
          lineN += fixedPoints(rule, lineTransport(rule, s.links, x, tau)) / starts.length / BEATS

          for (const c of line(x)) {
            perLine[k] = (perLine[k] ?? 0) + linkLevel(rule, s.links, c, tau) / SIDE / BEATS
            matched += vibe[c] !== 0 && carries(rule, s, c, tau) ? 1 / (SIDE * starts.length * BEATS) : 0
          }
        })
      }

      return { exact, matched, lineN, perLine, links: s.links }
    }

    const meson = (b: Branch, rule: MatterLinks): MesonRun => {
      const x0 = 0
      const y0 = walk(x0, along, 1)
      const vibe = new Int8Array(cells)
      const role = new Int8Array(cells)

      vibe[x0] = 1
      vibe[y0] = -1
      role[x0] = 4
      role[y0] = rule.act[(b.base.links[x0 * 24 + along] ?? 0) * 9 + 4] ?? 0

      let s: MatterState = { vibe, role, links: Int16Array.from(b.base.links), demon: Int32Array.from(b.base.demon) }
      const e0 = totalEnergy(rule, s)

      let exact = true
      let adjacent = 0
      let matched = 0
      let gap = 0
      let hops = 0

      for (let t = 0; t < BEATS; t++) {
        const next = matterBeat(rule, s, b.start + t)

        s = next.state
        hops += next.moved.hops
        exact = exact && totalEnergy(rule, s) === e0

        const at: number[] = []

        s.vibe.forEach((v, x) => (v !== 0 ? at.push(x) : undefined))

        const [a, c] = [at[0] ?? 0, at[1] ?? 0]
        const d = Array.from({ length: 24 }, (_, k) => k).find(k => rule.neighbour[a * 24 + k] === c)

        gap += d4BoxDistance({ a, b: c, side: SIDE }) / BEATS

        if (d !== undefined) {
          adjacent += 1
          matched += carries(rule, s, a, d) ? 1 : 0
        }
      }

      return { exact, adjacent: adjacent / BEATS, matchedWhenAdjacent: adjacent > 0 ? matched / adjacent : 0, meanGap: gap, hops }
    }

    // the 27 lines through cells of time 0 with every other coordinate even
    const starts: number[] = []

    for (let x = 0; x < cells; x++) {
      const c = [0, 1, 2, 3].map(k => Math.floor(x / SIDE ** k) % SIDE)

      if (c[0] === 0 && c.slice(1).every(v => v % 2 === 0)) {
        starts.push(x)
      }
    }

    const frozen = make({ kappa: KAPPA, hop: false, roles: false })
    const invisible = make({ kappa: 0, hop: false, roles: false })
    const hopping = make({ kappa: KAPPA, hop: true, roles: true })
    const hoppingFrozen = make({ kappa: KAPPA, hop: true, roles: false })
    const hoppingFree = make({ kappa: 0, hop: true, roles: true })

    const measure = (b: Branch) => {
      const field = fieldAlone(b)
      const none = lines(b, frozen, starts, starts.map(() => 0))
      const sourced = lines(b, frozen, starts, starts.map(() => 1))
      const control = lines(b, invisible, starts, starts.map(() => 1))
      const dent = sourced.perLine.map((l, k) => l - (none.perLine[k] ?? 0))
      const dentMean = mean(dent)
      const dentError = Math.sqrt(dent.reduce((a, v) => a + (v - dentMean) ** 2, 0) / (dent.length - 1) / dent.length)
      const identical = control.links.every((v, i) => v === none.links[i]) ? 1 : 0
      const pairs = SEPARATIONS.map(r => lines(b, frozen, [0, walk(0, along, r)], [1, -1]))
      const mesons = { bound: meson(b, hopping), frozen: meson(b, hoppingFrozen), free: meson(b, hoppingFree) }
      const chi = field.loops.w22 > 0 && field.loops.w12 > 0 ? -Math.log((field.loops.w22 * field.loops.w11) / field.loops.w12 ** 2) : Number.NaN

      return { field, none, sourced, control, dentMean, dentError, identical, pairs, mesons, chi }
    }

    const melted = measure(branch(MELTED))
    const cold = measure(branch(COLD))
    const both = [melted, cold]

    const exact = both.every(m => [m.none, m.sourced, m.control, ...m.pairs].every(r => r.exact) && Object.values(m.mesons).every(r => r.exact))

    const ok =
      exact &&
      both.every(m => m.sourced.matched > 0.5 && m.control.matched < 0.2 && m.sourced.lineN > m.none.lineN && m.identical === 1) &&
      melted.dentMean > 2 * melted.dentError &&
      both.every(m => m.mesons.bound.adjacent > 3 * m.mesons.free.adjacent && m.mesons.frozen.matchedWhenAdjacent > 0.5)

    const report = (label: string, m: typeof melted): Record<string, number> => ({
      [`${label}Level`]: m.field.level,
      [`${label}DemonBeta`]: m.field.beta,
      [`${label}PolyakovCount`]: m.field.bulkN,
      ...Object.fromEntries(SEPARATIONS.map(r => [`${label}PolyakovCorrelator${r}`, m.field.correlator[r] ?? 0])),
      [`${label}RoleLoop11`]: m.field.loops.w11,
      [`${label}RoleLoop12`]: m.field.loops.w12,
      [`${label}RoleLoop22`]: m.field.loops.w22,
      [`${label}Creutz22`]: m.chi,
      [`${label}SourceLinksCarry`]: m.sourced.matched,
      [`${label}SourceLinePolyakovCount`]: m.sourced.lineN,
      [`${label}NoMatterLinePolyakovCount`]: m.none.lineN,
      [`${label}Dent`]: m.dentMean,
      [`${label}DentError`]: m.dentError,
      ...Object.fromEntries(
        m.pairs.flatMap((p, k) => [
          [`${label}PairCarry${SEPARATIONS[k]}`, p.matched],
          [`${label}PairPolyakovCount${SEPARATIONS[k]}`, p.lineN],
        ]),
      ),
      [`${label}MesonAdjacent`]: m.mesons.bound.adjacent,
      [`${label}MesonCarriesWhenAdjacent`]: m.mesons.bound.matchedWhenAdjacent,
      [`${label}MesonFrozenRolesAdjacent`]: m.mesons.frozen.adjacent,
      [`${label}MesonFrozenRolesCarriesWhenAdjacent`]: m.mesons.frozen.matchedWhenAdjacent,
      [`${label}MesonMeanGap`]: m.mesons.bound.meanGap,
      [`${label}MesonHopsPerBeat`]: m.mesons.bound.hops / BEATS,
    })

    return verdict({
      status: ok ? 'pass' : 'fail',
      claim:
        'on both branches, with the energy exact on every beat, the links alone make static source lines carry their role points more than half the time (under 0.2 with kappa 0, whose field stays bit-identical to the run without matter) and raise the Polyakov count on the lines, on the melted branch at a positive cost in the triangles round the source links, and a meson with kappa is adjacent more than 3 times as often as without, its link carrying its color more than half the time when adjacent even with role points frozen',
      metrics: { energyExact: exact ? 1 : 0, ...report('melted', melted), ...report('cold', cold) },
      control: {
        meltedKappaZeroCarry: melted.control.matched,
        coldKappaZeroCarry: cold.control.matched,
        meltedKappaZeroFieldIdentical: melted.identical,
        coldKappaZeroFieldIdentical: cold.identical,
        meltedFreeMesonAdjacent: melted.mesons.free.adjacent,
        meltedFreeMesonMeanGap: melted.mesons.free.meanGap,
        coldFreeMesonAdjacent: cold.mesons.free.adjacent,
        coldFreeMesonMeanGap: cold.mesons.free.meanGap,
        chanceCarry: 1 / 9,
        sourceLines: starts.length,
      },
      notes:
        "L2, exact integers, no random numbers. The role points see the 216 grid moves, Sigma(648) with its center divided out, so a role-point source is gluon-like (adjoint): its string can break, and a Polyakov count N of 1 is the confined value, not 0. The triality string is the center flux of E-FRC-0129 and 0131, which this rule does not carry. The hopping term binds only on contact, one link, so a pair's energy does not grow with its separation by construction, and any string would have to come from the field, whose correlation the Polyakov correlator reads. The reflection dynamics reaches neither the ordered phase nor equilibrium on the cold branch, so the cold numbers are of a slowly aging field. On the melted branch every role-point loop past 1 x 1 is at the noise (W(2,2) comes out negative), so no Creutz ratio can be read there and it is reported as NaN.",
    })
  },
})
