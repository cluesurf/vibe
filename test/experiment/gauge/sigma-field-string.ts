// The field-borne string at the point E-FRC-0160 reaches: the coupled Sigma(648) rule with the modified
// action (scale 12, beta1 / beta0 = -1.67 / 12) and no put-in tension, so a love line and a fear line cost
// energy only through the center twists their flux string makes in the field.
//
// The point is the first of E-FRC-0160's three ordered runs, prepared the same way (side 6, the identity with
// a tenth of its links hashed by the pattern 3.3, a drain of 100 beats, fill 0.003, settled 1,500 beats).
// E-FRC-0160 shows beta0 does not hold near 12 there: the field falls toward its lowest level and heats the
// demons. Whatever beta0 it settles at is measured here and used as the temperature, so this reads the string
// at the point the rule reaches, not at the registered one.
//
// Measured, 300 beats from the settled field:
// - a love line and a fear line along tau at R = 1, 2, 3 along s (the side-6 box holds R up to 3), joined at
//   the start by a straight string with its links twisted to match, vibes and role points held: the string's
//   length per slice (flux-carrying links connected to the sources), and the field energy above the same
//   field run without sources, per slice, V(R)
// - the slope of V against R, and the slope times the demon beta, a string tension in the units of the action
//   (the Boltzmann weight is exp(-beta E)), set against chi(2,2) read from the no-source run's loops. The two
//   are independent: the slope comes from sources and energy, chi from loops of the empty field. V here is
//   an energy, not the free energy a loop measures, and they agree only where entropy is small
// - a meson, the coupling on, tension 0, kappa 12, hop and role moves on, 600 beats, unwrapped hop by hop,
//   against the free meson (kappa 0)
//
// Gates, fixed before the run:
// - every run keeps the energy exact and Gauss's law at every dock on every beat
// - V(R) rises strictly from R = 1 to 3
// - the slope times beta lies within 30 percent of chi(2,2), and chi(2,2) is positive
// - the meson keeps a mean gap under a tenth of the free meson's and travels more than 5
//
// The run, recorded as it came out. Energy and Gauss's law exact in every run. Every physics gate fails.
// - the point: beta0 7.42 (beta 0.619), triangle level 0.363, W(1,1), W(1,2), W(2,2) 0.649, 0.531, 0.429,
//   chi(2,2) 0.012, the same field as E-FRC-0160's first ordered run
// - V(R) per slice: 19.3, 16.6, 30.8 at R = 1, 2, 3, not monotonic. The string lengths are 2.67, 3.67, 5.17
//   (excess 1.7, 1.7, 2.2). The slope is 5.76, times beta 3.56, some 300 times chi(2,2): the energy a pair
//   costs and the loops of the empty field do not agree, as expected where the field is deconfined and the
//   string's energy is the local cost of its twists, not an area law
// - the meson: gap 1.70, travel 2.45. The kappa-0 control is not free under the coupling, since every hop
//   twists its link and the field charges for it: gap 2.17, travel 2.45, against 65.6 and 103.6 for the free
//   meson of the uncoupled rule in E-FRC-0151. So the coupled field binds any pair, with or without the
//   matching term, and at this temperature it also stops them moving
//
// Depth L2: a constructed rule, measured.

import { experiment } from '@/test/scaffold/suite'
import { verdict } from '@/test/scaffold/verdict'
import { rootsD4 } from '@/code/algebra/group/root-system'
import { unitDemonBeta } from '@/code/dynamics/finite-kinetic'
import {
  addSigmaFlux,
  defectSigmaLinks,
  drainFillSettle,
  makeSigmaLinks,
  pathTransport,
  sigmaBeat,
  sigmaEnergy,
  sigmaFieldEnergy,
  sigmaGaussViolations,
  type SigmaLinks,
  type SigmaState,
} from '@/code/rule/sigma-links'

const SIDE = 6
const SCALE = 12
const RATIO = -1.67 / 12
const KAPPA = 12
const POINT = { drain: 100, fill: 0.003, settle: 1500, hash: 3.3 }
const BEATS = 300
const MESON_BEATS = 600
const SEPARATIONS = [1, 2, 3]
const GOLDEN = (Math.sqrt(5) - 1) / 2

const mod3 = (x: number): number => ((x % 3) + 3) % 3
const dist = (a: number[], b: number[]): number => Math.hypot(...a.map((x, i) => x - (b[i] ?? 0)))

function slope(xs: number[], ys: number[]): number {
  const mx = xs.reduce((a, b) => a + b, 0) / xs.length
  const my = ys.reduce((a, b) => a + b, 0) / ys.length

  return xs.reduce((a, x, k) => a + (x - mx) * ((ys[k] ?? 0) - my), 0) / xs.reduce((a, x) => a + (x - mx) ** 2, 0)
}

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
  id: 'gauge/sigma-field-string',
  code: 'E-FRC-0161',
  title:
    'the field-borne string at the point the coupled Sigma(648) rule reaches under the modified action (beta0 7.4, deconfined): the field alone charges a static love-fear pair 19.3, 16.6, 30.8 per slice at R = 1 to 3, not monotonic, its slope times beta (3.56) is some 300 times the empty field chi(2,2) (0.012), and a meson is held by the field but barely moves (travel 2.45), so every physics gate fails',
  category: 'gauge',
  substrates: ['3434'],
  depth: 'L2',
  paper: false,
  run() {
    const roots = rootsD4()
    const tau = roots.findIndex(r => r.join(',') === '1,-1,0,0')
    const along = roots.findIndex(r => r.join(',') === '0,0,1,1')
    const back = (d: number): number => roots.findIndex(r => r.every((x, k) => x === -(roots[d]?.[k] ?? 0)))
    const probe = makeSigmaLinks({ side: SIDE, kappa: 0, tension: 0, capacity: 1, couple: 'center', scale: SCALE, ratio: RATIO })
    const capacity = 3 * Math.max(...Array.from(probe.level).map(Math.abs))
    const make = (input: { hop: boolean; roles: boolean; kappa: number }): SigmaLinks =>
      makeSigmaLinks({ side: SIDE, tension: 0, capacity, couple: 'center', scale: SCALE, ratio: RATIO, ...input })
    const staticRule = make({ hop: false, roles: false, kappa: KAPPA })
    const { cells, group } = staticRule

    const walk = (x: number, d: number, n: number): number => {
      let c = x

      for (let k = 0; k < n; k++) {
        c = staticRule.neighbour[c * 24 + d] ?? 0
      }

      return c
    }

    const line = (x: number): number[] => Array.from({ length: SIDE }, (_, t) => walk(x, tau, t))

    const prepared = drainFillSettle(staticRule, defectSigmaLinks(staticRule, 0.1, POINT.hash), POINT)
    const point = prepared.state
    const start = POINT.drain + POINT.settle

    const copyState = (s: SigmaState): SigmaState => ({
      vibe: Int8Array.from(s.vibe),
      role: Int8Array.from(s.role),
      links: Int16Array.from(s.links),
      demon: Int32Array.from(s.demon),
      flux: Int32Array.from(s.flux),
    })

    const twist = (rule: SigmaLinks, st: SigmaState, x: number, d: number): void => {
      const g = group.product[rule.omega * group.order + (st.links[x * 24 + d] ?? 0)] ?? 0

      st.links[x * 24 + d] = g
      st.links[(rule.neighbour[x * 24 + d] ?? 0) * 24 + (rule.opposite[d] ?? d)] = group.inverse[g] ?? 0
      addSigmaFlux(rule, st.flux, x, d, 1)
    }

    const rectangle = (r: number, h: number): number[] => [
      ...new Array<number>(r).fill(along),
      ...new Array<number>(h).fill(tau),
      ...new Array<number>(r).fill(back(along)),
      ...new Array<number>(h).fill(back(tau)),
    ]
    const loopPaths = [rectangle(1, 1), rectangle(1, 2), rectangle(2, 2)]

    // one static run: sources at separation r, or none (r = 0), with the loops read when there are none
    const staticRun = (r: number) => {
      const st = copyState(point)
      const x0 = 0
      const y0 = walk(x0, along, r)

      if (r > 0) {
        line(x0).forEach((c, t) => {
          st.vibe[c] = 1
          st.role[c] = Math.floor(((c + 3) * GOLDEN * 9) % 9)

          for (let j = 0; j < r; j++) {
            twist(staticRule, st, walk(c, along, j), along)
          }

          const f = walk(y0, tau, t)

          st.vibe[f] = -1
          st.role[f] = Math.floor(((f + 10) * GOLDEN * 9) % 9)
        })
      }

      const e0 = sigmaEnergy(staticRule, st)
      const sources = r > 0 ? [...line(x0), ...line(y0)] : []
      const loops = [0, 0, 0]

      let s = st
      let exact = sigmaGaussViolations(staticRule, st) === 0
      let field = 0
      let length = 0
      let demon = 0

      for (let t = 0; t < BEATS; t++) {
        s = sigmaBeat(staticRule, s, start + t).state
        exact = exact && sigmaEnergy(staticRule, s) === e0 && sigmaGaussViolations(staticRule, s) === 0
        field += sigmaFieldEnergy(staticRule, s.links) / BEATS
        length += r > 0 ? connectedString(staticRule, s.flux, sources) / SIDE / BEATS : 0

        let d = 0

        for (let x = 0; x < cells; x++) {
          for (const a of staticRule.firsts) {
            d += s.demon[x * 24 + a] ?? 0
          }
        }

        demon += d / (cells * 12) / BEATS

        if (r === 0) {
          for (let x = 0; x < cells; x++) {
            loopPaths.forEach((path, k) => (loops[k] = (loops[k] ?? 0) + (group.trace[pathTransport(staticRule, s.links, x, path)] ?? 0) / 3 / cells / BEATS))
          }
        }
      }

      return { exact, field, length, beta: unitDemonBeta({ meanDemon: demon, capacity }), loops }
    }

    const reference = staticRun(0)
    const pairs = SEPARATIONS.map(r => staticRun(r))
    const potential = pairs.map(p => (p.field - reference.field) / SIDE)
    const sigma = slope(SEPARATIONS, potential)
    const beta = reference.beta
    const [w11, w12, w22] = reference.loops as [number, number, number]
    const chi22 = -Math.log((w22 * w11) / (w12 * w12))

    const meson = (rule: SigmaLinks) => {
      const st = copyState(point)
      const x0 = 0
      const y0 = walk(x0, along, 1)

      st.vibe[x0] = 1
      st.vibe[y0] = -1
      st.role[x0] = 4
      st.role[y0] = rule.act[(rule.quotient[st.links[x0 * 24 + along] ?? 0] ?? 0) * 9 + 4] ?? 0
      twist(rule, st, x0, along)

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

      const e0 = sigmaEnergy(rule, st)

      let s = st
      let exact = sigmaGaussViolations(rule, st) === 0
      let gap = 0
      let travel = 0

      for (let t = 0; t < MESON_BEATS; t++) {
        s = sigmaBeat(rule, s, start + t, onHop).state
        exact = exact && sigmaEnergy(rule, s) === e0 && sigmaGaussViolations(rule, s) === 0

        const [love, fear] = charges

        gap += dist(love?.at ?? [], fear?.at ?? []) / MESON_BEATS
        travel = Math.max(travel, dist(love?.at ?? [], [0, 0, 0, 0]))
      }

      return { exact, meanGap: gap, travel }
    }

    const bound = meson(make({ hop: true, roles: true, kappa: KAPPA }))
    const free = meson(make({ hop: true, roles: true, kappa: 0 }))

    const exact = prepared.exact && reference.exact && pairs.every(p => p.exact) && bound.exact && free.exact
    const tension = sigma * beta

    const ok =
      exact &&
      potential.every((v, k) => k === 0 || v > (potential[k - 1] ?? 0)) &&
      chi22 > 0 &&
      Math.abs(tension - chi22) < 0.3 * chi22 &&
      bound.meanGap < free.meanGap / 10 &&
      bound.travel > 5

    return verdict({
      status: ok ? 'pass' : 'fail',
      claim:
        "with the energy exact and Gauss's law at every dock on every beat, the field energy a static love-fear pair costs rises strictly from R = 1 to 3 with no put-in tension, its slope times beta lies within 30 percent of the positive chi(2,2) of the empty field, and a meson keeps a mean gap under a tenth of the free meson's while it travels more than 5",
      metrics: {
        energyAndGaussExact: exact ? 1 : 0,
        pointDrainedLevel: prepared.drainedLevel,
        pointDemonBeta: beta,
        pointBeta0: SCALE * beta,
        pointTriangleLevel: reference.field / ((cells * 12 * 8) / 3),
        wilsonLoop11: w11,
        wilsonLoop12: w12,
        wilsonLoop22: w22,
        creutz22: chi22,
        ...Object.fromEntries(
          SEPARATIONS.flatMap((r, k) => [
            [`fieldEnergyAboveVacuumPerSliceR${r}`, potential[k] ?? 0],
            [`stringLengthR${r}`, pairs[k]?.length ?? 0],
            [`excessR${r}`, (pairs[k]?.length ?? 0) - r],
          ]),
        ),
        fieldSlope: sigma,
        fieldSlopeTimesBeta: tension,
        mesonMeanGap: bound.meanGap,
        mesonTravel: bound.travel,
      },
      control: {
        freeMesonMeanGap: free.meanGap,
        freeMesonTravel: free.travel,
        confinementCreutz0126: 1.41,
        finiteColorGroupsChi22AtTransition0103: 0.375,
      },
      notes:
        "L2, exact integers, no random numbers. The point is where the rule settles, not the registered beta0 = 12, which E-FRC-0160 shows the rule cannot hold. V is the field's energy above the no-source run, not a free energy, so it can differ from what a loop measures wherever entropy matters. One run: the chi(2,2) here is from this point's own empty field, and E-FRC-0160 gives it with errors across three starts.",
    })
  },
})
