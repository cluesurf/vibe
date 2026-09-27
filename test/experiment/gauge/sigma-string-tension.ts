// A string tension from the field, with the center phase and the flux coupled (code/rule/sigma-links with
// `couple: 'center'`, E-FRC-0154). Three questions, each with its point chosen before any loop or string
// was looked at.
//
// 1. Can a string tension be read from the full element's Wilson loops? In E-FRC-0151 every loop past
//    1 x 1 was at the noise: the fields the drain reaches are too disordered. The point here is chosen from
//    a probe that read only the demon temperature and the triangle energy (tmp/probe-sigma-point, side 6,
//    scale 6, coupled, from the identity with a tenth of the links hashed, 400 beats):
//
//    | fill | triangle Re Tr / 3 at beat 80 .. 400 | demon beta | stationary |
//    | --- | --- | --- | --- |
//    | 2 | 0.776 .. 0.784 | 0.29 | yes |
//    | 5 | 0.759 .. 0.712 | 0.17 .. 0.19 | no, melting |
//    | 10 | 0.404 .. 0.246 | 0.19 .. 0.36 | no, melting |
//    | 20 | 0.056 | 0.15 | yes, the disordered side where E-FRC-0151's loops were noise |
//    | 40 | 0.016 | 0.04 | yes, hotter still |
//
//    Registered: fill 2. It is the only stationary point on the ordered side, where loops past 1 x 1 can
//    rise above the noise. Its demon beta, 0.29 at scale 6, is a Wilson coupling near 1.75, far below where a
//    canonical heatbath would order, so this is the ordered branch a fixed energy holds (the back-bent caloric
//    curve of E-FRC-0110), not a weak-coupling equilibrium, and that is said with every number it gives.
//    Measured: W(1,1), W(1,2), W(2,2), W(2,3), W(3,3) of Re Tr / 3 in the tau-s plane, chi(2,2) and
//    chi(3,3) with jackknife errors over bins of 50 beats, 1,000 beats, against E-FRC-0126's 1.41, and the
//    fundamental Polyakov loop
// 2. Does the field now carry the string's energy? With the coupling, a unit of flux on a link is a center
//    twist of that link, so a string is a line of twists the triangles pay for. At the registered point, a
//    love line and a fear line along tau at R = 1 to 4, joined at the start by a straight string with its
//    links twisted to match, vibes and role points held, and the put-in tension set to 0, so any binding
//    comes from the field: the string's excess length (flux-carrying links connected to the sources, per
//    slice, minus R), and the field energy above a run of the same start without sources. Control: the same
//    at R = 4 without the coupling, where nothing holds the flux
// 3. A cold meson that binds and travels. E-FRC-0151's cold meson froze at tension x beta 7.2, and its melted
//    one travelled at 4.5. Registered from E-FRC-0151's cold demon beta 0.598: tension 7, tension x beta
//    about 4.2, on E-FRC-0151's cold branch prepared the same way, uncoupled as that rule was. Also reported:
//    a meson at the registered point with the coupling and tension 0
//
// Gates, fixed before the run:
// - every run keeps the energy exact and Gauss's law at every dock on every beat
// - chi(2,2) at the registered point is above zero by 3 standard errors
// - coupled with tension 0, the string's excess at every R is under 1 per slice, and the field energy above
//   the no-source run rises strictly from R = 1 to 4
// - uncoupled with tension 0, the excess at R = 4 is over 1
// - the cold meson at tension 7 keeps a mean gap under a tenth of the free meson's and travels more than 5
//
// The run, recorded as it came out. Energy and Gauss's law exact in every run. Three gates fail.
// - the registered point is ordered and deconfined: triangle Re Tr / 3 0.769, demon beta 0.305 (Wilson
//   coupling 1.83), fundamental Polyakov loop 0.58, the center broken. Every loop is now far above the
//   noise, W(1,1) .. W(3,3) = 0.706, 0.584, 0.524, 0.483, 0.339, but chi(2,2) is -0.080: W(2,2) is too large
//   for an area law, and the gate fails. chi(3,3) is 0.273. The jackknife errors (0.0004, 0.0016) are far
//   smaller than the drift of a frozen branch and should not be trusted. Neither number is a confining string
//   tension to set against E-FRC-0126's 1.41: this point is the branch that has frozen
// - the field carries the string, loosely. With the coupling and no put-in tension, the flux between the
//   lines stays within a few links of taut, lengths 1.88, 3.69, 5.20, 6.58 at R = 1 to 4, against 4,207
//   excess links without the coupling. The field energy above the no-source run rises strictly, 32.3, 49.5,
//   65.5, 96.6 per slice, a slope near 21 per unit R that the field alone pays. But the excess, 0.88, 1.69,
//   2.20, 2.58, passes 1 from R = 2, so the taut-string gate fails: the field-borne string is rough. The
//   uncoupled control started from the same twisted string, and its field energy above vacuum (116 at R =
//   4) is those twists left behind when the flux wandered off, not a string
// - the cold meson at tension 7 (beta 0.605, tension x beta 4.24) stays adjacent the whole time, gap 1.414,
//   and moves as a pair, but only 4.24 in 600 beats, under the 5 of the gate. The coupled meson at the
//   registered point with no put-in tension keeps a gap of 4.43 and travels 5.29
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
  sigmaEnergy,
  sigmaFieldEnergy,
  sigmaGaussViolations,
  sigmaLine,
  type SigmaLinks,
  type SigmaState,
} from '@/code/rule/sigma-links'

const SIDE = 8
const SCALE = 6
const KAPPA = 12
const CAPACITY = 200
const POINT = { fill: 2, defect: 0.1, settle: 400 }
const COLD = { drain: 150, settle: 2500 }
const COLD_TENSION = 7
const LOOP_BEATS = 1000
const BIN = 50
const BEATS = 300
const MESON_BEATS = 600
const SEPARATIONS = [1, 2, 3, 4]
const GOLDEN = (Math.sqrt(5) - 1) / 2

type Loops = { w11: number; w12: number; w22: number; w23: number; w33: number }

const mod3 = (x: number): number => ((x % 3) + 3) % 3
const dist = (a: number[], b: number[]): number => Math.hypot(...a.map((x, i) => x - (b[i] ?? 0)))

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
  id: 'gauge/sigma-string-tension',
  code: 'E-FRC-0155',
  title:
    'a string tension from the coupled Sigma(648) field: at the one stationary ordered point the loops rise far above the noise but the field is deconfined (Polyakov 0.58, chi(2,2) -0.08, chi(3,3) 0.27), with no put-in tension the coupled field holds a flux string within a few links of taut (excess 0.9 to 2.6, against 4,207 uncoupled) and pays for it with energy rising about 21 per unit length, and a cold meson at tension x beta 4.2 binds and moves as a pair but only 4.2 in 600 beats, so three gates fail',
  category: 'gauge',
  substrates: ['3434'],
  depth: 'L2',
  paper: false,
  run() {
    const roots = rootsD4()
    const tau = roots.findIndex(r => r.join(',') === '1,-1,0,0')
    const along = roots.findIndex(r => r.join(',') === '0,0,1,1')
    const back = (d: number): number => roots.findIndex(r => r.every((x, k) => x === -(roots[d]?.[k] ?? 0)))
    const make = (input: { tension: number; couple: 'none' | 'center'; hop: boolean; roles: boolean; kappa?: number }): SigmaLinks =>
      makeSigmaLinks({ side: SIDE, capacity: CAPACITY, scale: SCALE, kappa: input.kappa ?? KAPPA, ...input })
    const coupled = make({ tension: 0, couple: 'center', hop: false, roles: false })
    const { cells, group } = coupled
    const triangles = (cells * 12 * 8) / 3

    const walk = (x: number, d: number, n: number): number => {
      let c = x

      for (let k = 0; k < n; k++) {
        c = coupled.neighbour[c * 24 + d] ?? 0
      }

      return c
    }

    const line = (x: number): number[] => Array.from({ length: SIDE }, (_, t) => walk(x, tau, t))

    const demonMean = (s: SigmaState): number => {
      let sum = 0

      for (let x = 0; x < cells; x++) {
        for (const a of coupled.firsts) {
          sum += s.demon[x * 24 + a] ?? 0
        }
      }

      return sum / (cells * coupled.firsts.length)
    }

    const fill = (demon: Int32Array, amount: number): void => {
      for (let x = 0; x < cells; x++) {
        for (const a of coupled.firsts) {
          demon[x * 24 + a] = Math.floor(2 * amount * (((x * 24 + a + 5) * GOLDEN) % 1) + 0.5)
        }
      }
    }

    const copyState = (s: SigmaState): SigmaState => ({
      vibe: Int8Array.from(s.vibe),
      role: Int8Array.from(s.role),
      links: Int16Array.from(s.links),
      demon: Int32Array.from(s.demon),
      flux: Int32Array.from(s.flux),
    })

    // 1. the registered point: the identity with a tenth of the links hashed, fill 2, settled 400 beats
    const hot = hashedSigmaLinks(coupled)
    const pointLinks = new Int16Array(cells * 24).fill(coupled.identity)

    for (let x = 0; x < cells; x++) {
      for (const a of coupled.firsts) {
        if (((x * 24 + a + 2) * GOLDEN * 3.3) % 1 < POINT.defect) {
          const g = hot[x * 24 + a] ?? 0

          pointLinks[x * 24 + a] = g
          pointLinks[(coupled.neighbour[x * 24 + a] ?? 0) * 24 + (coupled.opposite[a] ?? a)] = group.inverse[g] ?? 0
        }
      }
    }

    let point: SigmaState = {
      vibe: new Int8Array(cells),
      role: new Int8Array(cells),
      links: pointLinks,
      demon: new Int32Array(cells * 24),
      flux: new Int32Array(cells * 24),
    }

    fill(point.demon, POINT.fill)

    for (let t = 0; t < POINT.settle; t++) {
      point = sigmaBeat(coupled, point, t).state
    }

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
    const samples: Loops[] = []

    let s = copyState(point)
    let level = 0
    let demon = 0
    let pre = 0
    let pim = 0
    let exactField = true

    const e0 = sigmaEnergy(coupled, s)

    for (let t = 0; t < LOOP_BEATS; t++) {
      s = sigmaBeat(coupled, s, POINT.settle + t).state
      exactField = exactField && sigmaEnergy(coupled, s) === e0

      const sample: Loops = { w11: 0, w12: 0, w22: 0, w23: 0, w33: 0 }

      for (let x = 0; x < cells; x++) {
        sizes.forEach(([key], k) => (sample[key] += (group.trace[pathTransport(coupled, s.links, x, paths[k] ?? [])] ?? 0) / 3 / cells))
      }

      samples.push(sample)

      let sr = 0
      let si = 0

      for (const x of starts) {
        const g = sigmaLine(coupled, s.links, x, tau)

        sr += (group.trace[g] ?? 0) / 3 / starts.length
        si += (coupled.traceIm[g] ?? 0) / 3 / starts.length
      }

      pre += sr / LOOP_BEATS
      pim += si / LOOP_BEATS
      level += sigmaFieldEnergy(coupled, s.links) / triangles / LOOP_BEATS
      demon += demonMean(s) / LOOP_BEATS
    }

    const mean = (xs: readonly Loops[], key: keyof Loops): number => xs.reduce((a, x) => a + x[key], 0) / xs.length
    const creutz = (a: keyof Loops, b: keyof Loops, c: keyof Loops) =>
      jackknife({ samples, estimator: picked => -Math.log((mean(picked, c) * mean(picked, a)) / mean(picked, b) ** 2), binSize: BIN })
    const chi22 = creutz('w11', 'w12', 'w22')
    // chi(3,3) = -ln(W33 W22 / W23^2)
    const chi33 = creutz('w22', 'w23', 'w33')
    const pointBeta = unitDemonBeta({ meanDemon: demon, capacity: CAPACITY })

    // 2. does the field carry the string? static lines, tension 0, the string's links twisted to match
    const twisted = (rule: SigmaLinks, st: SigmaState, x: number, d: number): void => {
      const g = group.product[rule.omega * group.order + (st.links[x * 24 + d] ?? 0)] ?? 0

      st.links[x * 24 + d] = g
      st.links[(rule.neighbour[x * 24 + d] ?? 0) * 24 + (rule.opposite[d] ?? d)] = group.inverse[g] ?? 0
      addSigmaFlux(rule, st.flux, x, d, 1)
    }

    const pairRun = (rule: SigmaLinks, r: number, sources: boolean) => {
      const st = copyState(s)
      const x0 = 0
      const y0 = walk(x0, along, r)

      if (sources) {
        line(x0).forEach((c, t) => {
          st.vibe[c] = 1
          st.role[c] = Math.floor(((c + 3) * GOLDEN * 9) % 9)

          for (let j = 0; j < r; j++) {
            twisted(rule, st, walk(c, along, j), along)
          }

          const f = walk(y0, tau, t)

          st.vibe[f] = -1
          st.role[f] = Math.floor(((f + 10) * GOLDEN * 9) % 9)
        })
      }

      const e = sigmaEnergy(rule, st)
      const src = [...line(x0), ...line(y0)]

      let cur = st
      let exact = sigmaGaussViolations(rule, st) === 0
      let length = 0
      let field = 0

      for (let t = 0; t < BEATS; t++) {
        cur = sigmaBeat(rule, cur, POINT.settle + LOOP_BEATS + t).state
        exact = exact && sigmaEnergy(rule, cur) === e && sigmaGaussViolations(rule, cur) === 0
        length += sources ? connectedString(rule, cur.flux, src) / SIDE / BEATS : 0
        field += sigmaFieldEnergy(rule, cur.links) / BEATS
      }

      return { exact, length, field }
    }

    const reference = pairRun(coupled, 1, false)
    const pairs = SEPARATIONS.map(r => pairRun(coupled, r, true))
    const uncoupledRule = make({ tension: 0, couple: 'none', hop: false, roles: false })
    const uncoupledReference = pairRun(uncoupledRule, 4, false)
    const uncoupled = pairRun(uncoupledRule, 4, true)
    const fieldExcess = pairs.map(p => (p.field - reference.field) / SIDE)
    const excess = pairs.map((p, k) => p.length - (SEPARATIONS[k] ?? 0))

    // 3. mesons
    const mesonRun = (rule: SigmaLinks, base: SigmaState, start: number) => {
      const st = copyState(base)
      const x0 = 0
      const y0 = walk(x0, along, 1)

      st.vibe[x0] = 1
      st.vibe[y0] = -1
      st.role[x0] = 4
      st.role[y0] = rule.act[(rule.quotient[st.links[x0 * 24 + along] ?? 0] ?? 0) * 9 + 4] ?? 0

      if (rule.couple === 'center') {
        twisted(rule, st, x0, along)
      } else {
        addSigmaFlux(rule, st.flux, x0, along, 1)
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

      const e = sigmaEnergy(rule, st)

      let cur = st
      let exact = sigmaGaussViolations(rule, st) === 0
      let gap = 0
      let travel = 0

      for (let t = 0; t < MESON_BEATS; t++) {
        cur = sigmaBeat(rule, cur, start + t, onHop).state
        exact = exact && sigmaEnergy(rule, cur) === e && sigmaGaussViolations(rule, cur) === 0

        const [love, fear] = charges

        gap += dist(love?.at ?? [], fear?.at ?? []) / MESON_BEATS
        travel = Math.max(travel, dist(love?.at ?? [], [0, 0, 0, 0]))
      }

      return { exact, meanGap: gap, travel }
    }

    const pointMeson = mesonRun(make({ tension: 0, couple: 'center', hop: true, roles: true }), s, POINT.settle + LOOP_BEATS)

    // E-FRC-0151's cold branch, uncoupled, prepared the same way
    const plain = make({ tension: COLD_TENSION, couple: 'none', hop: false, roles: true })

    let cold: SigmaState = {
      vibe: new Int8Array(cells),
      role: new Int8Array(cells),
      links: hashedSigmaLinks(plain),
      demon: new Int32Array(cells * 24),
      flux: new Int32Array(cells * 24),
    }

    for (let k = 0; k < COLD.drain; k++) {
      cold = sigmaBeat(plain, cold, k).state
      cold.demon.fill(0)
    }

    for (let t = 0; t < COLD.settle; t++) {
      cold = sigmaBeat(plain, cold, t).state
    }

    const coldBeta = unitDemonBeta({ meanDemon: demonMean(cold), capacity: CAPACITY })
    const coldBound = mesonRun(make({ tension: COLD_TENSION, couple: 'none', hop: true, roles: true }), cold, COLD.settle)
    const coldFree = mesonRun(make({ tension: 0, couple: 'none', hop: true, roles: true, kappa: 0 }), cold, COLD.settle)

    const exact =
      exactField &&
      [reference, ...pairs, uncoupledReference, uncoupled].every(p => p.exact) &&
      [pointMeson, coldBound, coldFree].every(m => m.exact)

    const ok =
      exact &&
      chi22.value > 3 * chi22.error &&
      excess.every(e => e < 1) &&
      fieldExcess.every((v, k) => k === 0 || v > (fieldExcess[k - 1] ?? 0)) &&
      uncoupled.length - 4 > 1 &&
      coldBound.meanGap < coldFree.meanGap / 10 &&
      coldBound.travel > 5

    return verdict({
      status: ok ? 'pass' : 'fail',
      claim:
        "with the energy exact and Gauss's law at every dock on every beat, chi(2,2) at the registered point is above zero by 3 standard errors, with the coupling and no put-in tension the string between static lines stays within 1 of taut at every R while the field energy above the no-source run rises strictly with R, without the coupling the flux wanders, and the cold meson at tension 7 keeps a gap under a tenth of the free meson's while travelling more than 5",
      metrics: {
        energyAndGaussExact: exact ? 1 : 0,
        pointLevel: level,
        pointTriangleReTr: 1 - level / SCALE,
        pointDemonBeta: pointBeta,
        pointWilsonCoupling: SCALE * pointBeta,
        pointPolyakov: Math.hypot(pre, pim),
        wilsonLoop11: mean(samples, 'w11'),
        wilsonLoop12: mean(samples, 'w12'),
        wilsonLoop22: mean(samples, 'w22'),
        wilsonLoop23: mean(samples, 'w23'),
        wilsonLoop33: mean(samples, 'w33'),
        creutz22: chi22.value,
        creutz22Error: chi22.error,
        creutz33: chi33.value,
        creutz33Error: chi33.error,
        ...Object.fromEntries(
          SEPARATIONS.flatMap((r, k) => [
            [`fieldOnlyStringLengthR${r}`, pairs[k]?.length ?? 0],
            [`fieldOnlyExcessR${r}`, excess[k] ?? 0],
            [`fieldEnergyAboveVacuumPerSliceR${r}`, fieldExcess[k] ?? 0],
          ]),
        ),
        pointMesonMeanGap: pointMeson.meanGap,
        pointMesonTravel: pointMeson.travel,
        coldDemonBeta: coldBeta,
        coldTensionTimesBeta: COLD_TENSION * coldBeta,
        coldMesonMeanGap: coldBound.meanGap,
        coldMesonTravel: coldBound.travel,
      },
      control: {
        uncoupledTensionZeroExcessR4: uncoupled.length - 4,
        uncoupledFieldEnergyAboveVacuumPerSliceR4: (uncoupled.field - uncoupledReference.field) / SIDE,
        coldFreeMesonMeanGap: coldFree.meanGap,
        coldFreeMesonTravel: coldFree.travel,
        confinementCreutz0126: 1.41,
      },
      notes:
        'L2, exact integers, no random numbers. The registered point is the ordered branch a fixed energy holds at a Wilson coupling near 1.75, not a weak-coupling equilibrium, so its Creutz ratios measure that branch, not a continuum string tension, and E-FRC-0126 read 1.41 on a hypercubic lattice with a plaquette action, not on D4 triangles. Distances are in the D4 lattice units, unwrapped hop by hop.',
    })
  },
})
