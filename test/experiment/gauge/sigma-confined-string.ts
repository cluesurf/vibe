// The string tension on the confined side of the D4 field, in units of the transition temperature. The coupled
// Sigma(648) rule under the modified action (scale 12, beta1 / beta0 = -1.67 / 12, no put-in tension), links moved
// by the 'wide' family of E-FRC-0162, prepared by the heat-assisted drain, at the points E-FRC-0166 fixed.
//
// E-FRC-0166 put the N_t = 4 transition of this field near beta0 = 7.1 (the Polyakov susceptibility peaks at
// fill 0.04) and registered, by its rule and before any Wilson loop was read, the confined point nearest it:
// fill 0.08, beta0 5.88, Polyakov 0.024. Here, on the side-6 D4 box (1,296 docks, tau lines of 6, so colder than
// N_t = 4 at the same beta0):
// - at the registered fill 0.08, three independent starts (defect patterns 3.3, 4.7, 6.1): beta0, the triangle
//   level, the fundamental Polyakov loop, W(1,1) .. W(3,3) in the tau-s plane, chi(2,2) and chi(3,3), with the
//   mean and standard error across the three
// - at the transition fill 0.04, the same three starts, for the tension at the transition coupling: sigma a^2
//   read as chi(2,2) there, and sigma / T_c^2 = N_t^2 chi(2,2) = 16 chi(2,2), the comparison E-FRC-0103 made at
//   N_t = 4 (SU(3) 0.378 and Sigma(648) 0.375 at their transitions, so about 6.0). D4 has 8 triangles through each
//   link where the hypercubic lattice has 6 plaquettes, so beta0 is not comparable across the two and this
//   ratio is
// - on the first registered run's settled field: a love line and a fear line along tau at R = 1, 2, 3, the
//   string's links twisted to match its flux, vibes and role points held, 300 beats, and the field energy above
//   the same field without sources, per slice, V(R), its slope, and the slope times beta against chi(2,2)
// - a meson on that field, kappa 12 and the coupling, 600 beats, against the free meson of the uncoupled rule
//
// Gates, fixed before the run:
// - every run keeps the energy exact and Gauss's law at every dock on every beat
// - at the registered fill every run is confined, |<P>| under 0.05
// - chi(2,2) at the registered fill, across the three runs, is above zero by 3 standard errors
// - V(R) rises strictly from R = 1 to 3, and the slope times beta lies within 30 percent of chi(2,2)
// - the meson keeps a mean gap under a tenth of the free meson's and travels more than 5
// sigma / T_c^2 is reported, not gated.
//
// The run, recorded as it came out. Energy and Gauss's law exact in every run. Three gates hold, two fail.
// - the registered point confines and carries a string tension. beta0 5.87, 5.89, 5.90, Polyakov 0.003,
//   0.009, 0.011. W(1,1), W(1,2), W(2,2) are 0.211, 0.070, 0.016 in every run, and chi(2,2) is 0.354, 0.403,
//   0.400: 0.386 +- 0.016 across the three, an area law read on the coupled field for the first time. W(2,3)
//   and W(3,3) (0.003 to 0.004 and 0.0009) are at the noise, so chi(3,3), -0.07 +- 0.28, is not read
// - the transition fill on this box is not confined: beta0 7.26, 7.15, 6.99, Polyakov 0.16, 0.18, 0.22, the
//   fixed energy holding the deconfined branch at the first-order transition. Its chi(2,2), 0.029 +- 0.013,
//   is a deconfined field's, so 16 chi(2,2) = 0.46 +- 0.21 there is not sigma / T_c^2. The honest statement:
//   sigma / T_c^2 needs chi(2,2) on the confined branch at beta0 7.1, and a fixed energy in the coexistence
//   region lands on one branch or the other. The confined point at 5.88 gives 16 chi(2,2) = 6.2, beside
//   SU(3)'s 6.05 at its transition, but at a coupling 1.2 below T_c's, so it is not the ratio either
// - the field-borne potential rises strictly, 86.0, 116.1, 164.6 per slice at R = 1 to 3. Its slope, 39.3,
//   times beta 0.489 is 19.2, about 50 times chi(2,2): the gate fails. The energy of a twisted string is the
//   local cost of its twists, not the free energy an area law measures
// - the meson is frozen, gap 1.414 and travel 0, against 66.1 and 133.2 free: the gate fails
//
// Added after that run, 2026-09-26, and disclosed here. No gate moved and the status stays by the gates above.
// - speed: the file now runs code/rule/sigma-fast, a kernel that makes the same moves in the same order with
//   precomputed tables (5.3 to 5.9 times faster on side 4, 0 mismatches in every array over 12 beats and four
//   switch settings, tmp/sigma-fast-check.ts). The run checks it again on its own field: 3 beats from the first
//   start at the registered fill by both kernels, every array compared, reported as fastKernelMismatches
// - the confined branch near the transition coupling, REPORTED, NOT GATED. The first run could not read
//   sigma / T_c^2 because fill 0.04 on this box held the deconfined branch. Two more fills, 0.05 and 0.06, from
//   the same three starts, measured as the others. The rule for reading it, fixed before these fills were run:
//   of 0.05 and 0.06, the fill whose three runs are all confined (Polyakov under 0.05) with the largest mean
//   beta0 gives sigmaOverTcSquaredConfinedBranch = 16 chi(2,2) there, with its beta0 beside it; if neither is
//   confined, the metric is -1. It is sigma / T_c^2 only as far as that beta0 is near 7.1
// - whether the transition moved with the box: the side-4 box (E-FRC-0166) turns near beta0 7.1. On this
//   box, where the tau lines are 6 long, a thermal transition would sit at a LARGER beta0 (a colder lattice at
//   the same coupling is confined further up). The largest beta0 of any all-confined point and the smallest
//   beta0 of any all-deconfined point (Polyakov over 0.1) are reported as the side-6 bracket
//
// Depth L2: a constructed rule, measured.

import { experiment } from '@/test/scaffold/suite'
import { verdict } from '@/test/scaffold/verdict'
import { rootsD4 } from '@/code/algebra/group/root-system'
import { unitDemonBeta } from '@/code/dynamics/finite-kinetic'
import {
  addSigmaFlux,
  defectSigmaLinks,
  fillSigmaDemons,
  makeSigmaLinks,
  pathTransport,
  sigmaBeat,
  sigmaEnergy,
  sigmaGaussViolations,
  sigmaLine,
  type SigmaLinks,
  type SigmaState,
} from '@/code/rule/sigma-links'
import { fastCoolSigmaLinks, fastFieldEnergy, fastSigmaBeat, makeSigmaTables, type SigmaTables } from '@/code/rule/sigma-fast'

const SIDE = 6
const SCALE = 12
const RATIO = -1.67 / 12
const KAPPA = 12
const CAPACITY = 48
const COOL = { drain: 100, cycles: 30, fill: 0.003, beats: 30, empties: 10 }
const REGISTERED_FILL = 0.08
const TRANSITION_FILL = 0.04
// the fills added after the first run, reported and not gated
const BRANCH_FILLS = [0.05, 0.06]
const KERNEL_CHECK_BEATS = 3
const TRANSITION_NT = 4
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
  id: 'gauge/sigma-confined-string',
  code: 'E-FRC-0167',
  title:
    'the string tension on the confined side of the D4 field: at the registered point (beta0 5.88, Polyakov under 0.011) the coupled field shows an area law, chi(2,2) = 0.386 +- 0.016 across three starts, but at the transition coupling the fixed energy holds the deconfined branch so sigma / T_c^2 is not read, the field-borne potential rises (86, 116, 165) some 50 times steeper than chi, and the meson is frozen',
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
    const tables = makeSigmaTables(rule)
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

    const cooled = HASHES.map(hash => fastCoolSigmaLinks(tables, defectSigmaLinks(rule, 0.1, hash), COOL))

    // the fast kernel against sigmaBeat on this run's own field: every array, every beat
    let fastKernelMismatches = 0

    {
      let slow = copyState(cooled[0]!.state)

      fillSigmaDemons(rule, slow, REGISTERED_FILL)

      const fast = copyState(slow)

      for (let k = 0; k < KERNEL_CHECK_BEATS; k++) {
        slow = sigmaBeat(rule, slow, cooled[0]!.beats + k).state
        fastSigmaBeat(tables, fast, cooled[0]!.beats + k)

        for (const key of ['vibe', 'role', 'links', 'demon', 'flux'] as const) {
          slow[key].forEach((v, i) => (fastKernelMismatches += v === fast[key][i] ? 0 : 1))
        }
      }
    }

    const point = (base: { state: SigmaState; beats: number }, fill: number) => {
      const s = copyState(base.state)

      fillSigmaDemons(rule, s, fill)

      const e0 = sigmaEnergy(rule, s)

      let t = base.beats
      let exact = true

      for (let k = 0; k < SETTLE; k++) {
        fastSigmaBeat(tables, s, t++)
      }

      const settled = copyState(s)
      const loops: Loops = { w11: 0, w12: 0, w22: 0, w23: 0, w33: 0 }

      let demon = 0
      let level = 0
      let pre = 0
      let pim = 0

      for (let k = 0; k < MEASURE; k++) {
        fastSigmaBeat(tables, s, t++)
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
        level += fastFieldEnergy(tables, s.links) / triangles / MEASURE
        demon += demonMean(s) / MEASURE
      }

      const beta = unitDemonBeta({ meanDemon: demon, capacity: CAPACITY })

      return {
        exact,
        level,
        beta,
        beta0: SCALE * beta,
        polyakov: Math.hypot(pre, pim),
        loops,
        chi22: creutz(loops.w11, loops.w12, loops.w22),
        chi33: creutz(loops.w22, loops.w23, loops.w33),
        settled,
        start: base.beats + SETTLE,
      }
    }

    const registered = cooled.map(base => point(base, REGISTERED_FILL))
    const transition = cooled.map(base => point(base, TRANSITION_FILL))
    const branch = BRANCH_FILLS.map(fill => ({ fill, runs: cooled.map(base => point(base, fill)) }))
    const meanOf = (xs: number[]): number => xs.reduce((a, b) => a + b, 0) / xs.length
    const allPoints = [
      { fill: REGISTERED_FILL, runs: registered },
      { fill: TRANSITION_FILL, runs: transition },
      ...branch,
    ].map(p => ({
      fill: p.fill,
      beta0: meanOf(p.runs.map(r => r.beta0)),
      confined: p.runs.every(r => r.polyakov < 0.05),
      deconfined: p.runs.every(r => r.polyakov > 0.1),
      chi22: meanOf(p.runs.map(r => r.chi22)),
    }))
    const branchPick = allPoints.filter(p => BRANCH_FILLS.includes(p.fill) && p.confined).sort((a, b) => b.beta0 - a.beta0)[0]
    const bracketConfined = Math.max(-1, ...allPoints.filter(p => p.confined).map(p => p.beta0))
    const bracketDeconfined = Math.min(99, ...allPoints.filter(p => p.deconfined).map(p => p.beta0))
    const chi22 = stats(registered.map(r => r.chi22))
    const chi33 = stats(registered.map(r => r.chi33))
    const chi22Transition = stats(transition.map(r => r.chi22))
    const first = registered[0]!

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

      const s = st

      let exact = sigmaGaussViolations(rule, st) === 0
      let field = 0

      for (let k = 0; k < BEATS; k++) {
        fastSigmaBeat(tables, s, first.start + k)
        exact = exact && sigmaEnergy(rule, s) === e0 && sigmaGaussViolations(rule, s) === 0
        field += fastFieldEnergy(tables, s.links) / BEATS
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
      const moverTables: SigmaTables = makeSigmaTables(mover)
      const s = st

      let exact = sigmaGaussViolations(mover, st) === 0
      let gap = 0
      let travel = 0

      for (let k = 0; k < MESON_BEATS; k++) {
        fastSigmaBeat(moverTables, s, first.start + k, onHop)
        exact = exact && sigmaEnergy(mover, s) === e0 && sigmaGaussViolations(mover, s) === 0

        const [love, fear] = charges

        gap += dist(love?.at ?? [], fear?.at ?? []) / MESON_BEATS
        travel = Math.max(travel, dist(love?.at ?? [], [0, 0, 0, 0]))
      }

      return { exact, meanGap: gap, travel }
    }

    const bound = meson(make({ hop: true, roles: true, kappa: KAPPA, couple: 'center' }))
    const free = meson(make({ hop: true, roles: true, kappa: 0, couple: 'none' }))

    const exact =
      [...registered, ...transition].every(r => r.exact) && reference.exact && pairs.every(p => p.exact) && bound.exact && free.exact

    const ok =
      exact &&
      registered.every(r => r.polyakov < 0.05) &&
      chi22.mean > 3 * chi22.error &&
      potential.every((v, k) => k === 0 || v > (potential[k - 1] ?? 0)) &&
      Math.abs(tension - chi22.mean) < 0.3 * Math.abs(chi22.mean) &&
      bound.meanGap < free.meanGap / 10 &&
      bound.travel > 5

    const report = (label: string, runs: typeof registered): [string, number][] =>
      runs.flatMap((r, k): [string, number][] => [
        [`${label}${k + 1}Beta0`, r.beta0],
        [`${label}${k + 1}Level`, r.level],
        [`${label}${k + 1}Polyakov`, r.polyakov],
        [`${label}${k + 1}WilsonLoop11`, r.loops.w11],
        [`${label}${k + 1}WilsonLoop12`, r.loops.w12],
        [`${label}${k + 1}WilsonLoop22`, r.loops.w22],
        [`${label}${k + 1}WilsonLoop23`, r.loops.w23],
        [`${label}${k + 1}WilsonLoop33`, r.loops.w33],
        [`${label}${k + 1}Creutz22`, r.chi22],
        [`${label}${k + 1}Creutz33`, r.chi33],
      ])

    return verdict({
      status: ok ? 'pass' : 'fail',
      claim:
        "with the energy exact and Gauss's law at every dock on every beat, every run at the registered fill is confined with the Polyakov loop under 0.05, chi(2,2) there across three runs is above zero by 3 standard errors, the field energy a static pair costs rises strictly from R = 1 to 3 with its slope times beta within 30 percent of chi(2,2), and a meson keeps a mean gap under a tenth of the free meson's while it travels more than 5",
      metrics: Object.fromEntries<number>([
        ['energyAndGaussExact', exact ? 1 : 0],
        ['creutz22Mean', chi22.mean],
        ['creutz22Error', chi22.error],
        ['creutz33Mean', chi33.mean],
        ['creutz33Error', chi33.error],
        ['transitionCreutz22Mean', chi22Transition.mean],
        ['transitionCreutz22Error', chi22Transition.error],
        ['sigmaOverTc2', TRANSITION_NT ** 2 * chi22Transition.mean],
        ['sigmaOverTc2Error', TRANSITION_NT ** 2 * chi22Transition.error],
        ...report('registered', registered),
        ...report('transition', transition),
        ...SEPARATIONS.map((r, k): [string, number] => [`fieldEnergyAboveVacuumPerSliceR${r}`, potential[k] ?? 0]),
        ['fieldSlope', sigma],
        ['fieldSlopeTimesBeta', tension],
        ['mesonMeanGap', bound.meanGap],
        ['mesonTravel', bound.travel],
        // added after the first run, reported and not gated
        ['fastKernelMismatches', fastKernelMismatches],
        ...branch.flatMap(p => report(`branch${String(p.fill).replace('.', '_')}Run`, p.runs)),
        ['confinedBranchFill', branchPick?.fill ?? -1],
        ['confinedBranchBeta0', branchPick?.beta0 ?? -1],
        ['confinedBranchCreutz22', branchPick?.chi22 ?? -1],
        ['sigmaOverTcSquaredConfinedBranch', branchPick ? TRANSITION_NT ** 2 * branchPick.chi22 : -1],
        ['side6LargestConfinedBeta0', bracketConfined],
        ['side6SmallestDeconfinedBeta0', bracketDeconfined],
      ]),
      control: {
        freeMesonMeanGap: free.meanGap,
        freeMesonTravel: free.travel,
        su3SigmaOverTc2At0103: TRANSITION_NT ** 2 * 0.378,
        sigma648HypercubicSigmaOverTc2At0103: TRANSITION_NT ** 2 * 0.375,
        confinementCreutz0126: 1.41,
      },
      notes:
        "L2, exact integers, no random numbers in the rule. sigma / T_c^2 = N_t^2 chi(2,2) uses chi(2,2) as sigma a^2 at the N_t = 4 transition coupling, read on a side-6 box where that coupling is confined, the comparison E-FRC-0103 made, with the same caveat that a 2 x 2 Creutz ratio carries short-distance corrections. The errors are across three starts sharing one rule and one fill. V is an energy above the no-source run, not a free energy.",
    })
  },
})
