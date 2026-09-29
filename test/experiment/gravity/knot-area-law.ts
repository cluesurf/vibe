// The entanglement of the working vacuum's husk regions against their area and their volume (E-GRV-0083): Jacobson's
// route to Newton's constant (2015, "Entanglement equilibrium and the Einstein equation"). If the vacuum's entanglement
// across a surface is S = eta A and the vacuum is in entanglement equilibrium, Einstein's equation follows with
// G = 1 / (4 eta) (hbar = c = 1). The vacuum's entanglement lives in its knots (E-RLT-0103, E-SPN-0095: a like meeting
// of two vacuum vibes with unequal points keeps with weight 1/4 and exchanges with 3/4, Schmidt weights 3/4 and 1/4,
// CHSH sqrt 7), each worth s_k = -(3/4 ln 3/4 + 1/4 ln 1/4) = 0.5623 nats.
//
// THE STATE, EXACT (code/measure/knot-network). The working vacuum (the no-veto two-point store under the pass, the
// covariant coin, E-RLT-0105, E-SPN-0095 with G off) is a quench: at beat 0 every stored pair sits on a definite point,
// a product state, and the like meetings entangle it. Under 'none' no piece reads a point, so the occupation history is
// one classical history on every term (E-RLT-0103 Q4) and a vibe is a nine-valued register on a fixed world line. The
// knot network holds the superposed state as the exact product of the components the meetings have joined; nothing in
// it is sampled, truncated or assumed independent. The coin acts only on a line of one open vibe; the network counts
// such lines at every beat, and where there are none the coined rule is the network times one global phase (the
// full-line determinants read the occupation alone). The superposed rule itself cannot hold this state as a branch list:
// on side 4 its first like beat splits at 480 meetings at once (2^480 terms, tmp/area-probe1.log).
//
// WHAT THE PROBES FOUND, disclosed (tmp/area-probe2.log, tmp/area-probe3.log, integer+0; no gate was read):
//  - the like meetings come every 3 beats (7,680 at beat 1 on side 8), none on a line of one open vibe;
//  - the components never grow past one mesh line: 2, 4, 6, 8 tokens on sides 4, 8, 12, 16, from beat 4 on, and 9,216
//    of side 8's 24,576 tokens never meet at all. So the knots chain along the lines (the line law, step-back H1) into
//    one ring per line, and a ring spans the torus: its length is the box's, not the rule's;
//  - on side 8 every ring saturates by beat 34 (864 terms at most, of 9^4), and the region entropies repeat with the
//    12-beat cycle from beat 35 on;
//  - at beat 2 (the first round) every region's entropy is its count of cut knots times s_k, and the slabs of width 2 to
//    4 read one number (1,079.7 on every axis); later the slabs grow with width, and at beats 35 to 39 the volume fit
//    beats the area fit (rms 596 against 875);
//  - the network agrees with the rule's own coinedVetoBeat on a masked start (two stored units open) on 36 of 36 beats.
//
// GATES, fixed before this file's first run.
//  A0 the knot phase, exact: at beat 2 on sides 8, 12 and 16 every region of the family (code/measure/knot-network
//     huskRegionFamily) has S equal to its cut knots times s_k (1e-9) and every cut component is one knot; the slabs of
//     width 2 to side / 2 read one S on each axis (1e-9); and eta_1, that slab S over its area 2 side^2, is one number on
//     the three sides (1e-9 relative)
//  A1 area, not volume, at entanglement equilibrium: side 8, the mean over beats 36 to 47 (one period of the vacuum's
//     cycle, after every ring saturated) of each region's S, fitted as S = eta A + c and S = v V + c over the 32 regions:
//     the area fit's rms residual below the volume fit's, on every start read (integer+0, integer+1)
//  A2 eta read in the husk's natural unit (nats per husk plaquette, the unit face of the husk's cubic mesh, one husk
//     step on a side): the equilibrium area fit has r2 >= 0.9 and eta > 0, on every start
//  A3 the instrument: 0 lines of one open vibe at every beat of every run; every component exactly normed (in
//     integers) at every reading; 48 inverse beats return every component to one term of amplitude 1 on its beat-0
//     values and every token to its beat-0 place; the masked start agrees with coinedVetoBeat term for term (up to one
//     global unit) on 36 of 36 beats; the tridiagonal eigenvalues agree with code/measure/doublet-locked-readings
//     schmidtWeights (cyclic Jacobi, a second method) to 1e-9 on 30 components, every mask at beat 5 and the one-member
//     masks at beat 47 (the Jacobi form is too slow for a saturated ring's two-and-two cut; tmp/area-probe3 was stopped
//     in that check, after its readings)
// Verdict: fail if A3 fails (the instrument is not the rule) or A1 fails (no area law, so Jacobson's premise fails);
// pass if A0 to A3 hold; partial otherwise.
// PREDICTED from the probes: A0 and A3 hold, A1 fails, A2 fails (r2 about 0.75): fail. Reported whatever the verdict:
// eta_1 (the knot phase, an exact area law), the counted eta (cut knots per plaquette times s_k, the fallback the brief
// names: here it equals eta_1 exactly, not by an independence assumption), G = 1 / (4 eta) from each, and the
// equilibrium fits.
//
//
// FIRST RUN (tmp/grv83-run1.log, 305 s, the record): fail on A0, A1 and A2, no gate moved; A3 holds (0 lines of one
// open vibe, every component exactly normed, 48 inverse beats return the start exactly, the masked start agrees with
// coinedVetoBeat on 36 of 36 beats, the solvers agree to 2.2e-15). A0: at beat 2 every region's S is its cut knots
// times s_k and every cut component is one knot, and the equal-area slabs of width 2 to side / 2 read one S, on all
// three sides; but eta_1 is NOT one number: 8.435, 12.653, 16.870 nats per husk plaquette on sides 8, 12, 16 (15,
// 22.5, 30 cut knots per plaquette), exactly proportional to the side, because a husk column holds `side` bulk docks
// and the knots are cut through the whole bulk depth: eta_1 = 1.0544 nats per husk plaquette per bulk dock of depth
// (1.875 knots per bulk three-face). Side 16's "exact" also failed on the 1e-9 tolerance, a float sum over some 8,000
// nats (post run tmp/grv83-post.log, read by no gate: worst 3.0e-9, relative 3.6e-13, 0 cut components that are not a
// knot). A1 and A2: at equilibrium the volume fit beats the area fit on both starts (rms 579 against 916 and 572
// against 910; area r2 0.723, volume r2 0.889): the equal-area slabs of width 1, 2, 3, 4 read 1,770, 3,254, 4,404,
// 5,472 nats, growing with width. Once every ring has saturated the entanglement is a VOLUME law out to half the box:
// the rings run the whole length of their lines, so every knot chain crosses every slab face, and a region of more
// columns cuts more rings. G_1 = 1 / (4 eta_1) = 0.0296 husk steps squared on side 8 (0.0148 on side 16); from the
// equilibrium area slope (34.4, a poor fit) 0.0073. Title written after the run.
//
// DETERMINISM: no random numbers; starts are E-MTH-0028's family; the state is exact in Z[w][1/2]; the entropies are
// floats (measurement). Depth L2: a known quantity (region entanglement, Jacobson's eta) read off the rule's exact
// state, with a control that could fail (the volume fit). HUSK FIRST: every region is a set of husk columns with
// everything in their bulk columns. No path is read, so the path key (exchangeAt) plays no part.

import { experiment } from '@/test/scaffold/suite'
import { verdict } from '@/test/scaffold/verdict'
import { startFamily, withStart } from '@/code/measure/start-ensemble'
import { contactFresh } from '@/code/measure/occupation-veto-readings'
import {
  schmidtWeights,
  vacuumConfiguration,
} from '@/code/measure/doublet-locked-readings'
import { boxHusk } from '@/code/measure/causal-components'
import { linearFit } from '@/code/measure/regression'
import { toWords } from '@/code/rule/occupation-veto-knit'
import {
  lockedState,
  type Configuration,
  type LockedState,
  type LockedTables,
} from '@/code/rule/doublet-locked-knit'
import { coinedVetoBeat } from '@/code/rule/coined-locked-knit'
import {
  componentEntropy,
  componentsOf,
  digitOf,
  huskRegionFamily,
  KNOT_ENTROPY,
  knotNetwork,
  networkBeat,
  networkBeatBack,
  networkNormExact,
  networkReturned,
  regionEntropy,
  sameAsBranches,
  tokenDocks,
  type HuskRegion,
  type KnotNetwork,
} from '@/code/measure/knot-network'

const SIDE = 8
const KNOT_SIDES = [8, 12, 16] as const
const KNOT_BEAT = 2
const EQUILIBRIUM = [36, 47] as const
const BEATS = 48
const MASKED_BEATS = 36
const SOLVER_COMPONENTS = 30
const STARTS = 2

type Reading = {
  region: HuskRegion
  S: number
  cut: number
  knots: number
}

function readRegions(
  net: KnotNetwork,
  column: Int32Array,
  regions: readonly HuskRegion[],
): Reading[] {
  const docks = tokenDocks(net)
  const cache = new Map<number, { entropy: number; rows: number }>()

  return regions.map(region => {
    const e = regionEntropy(
      net,
      t => region.inside[column[docks[t]!]!] === 1,
      cache,
    )

    return { region, S: e.entropy, cut: e.cut, knots: e.knots }
  })
}

const vacuumNet = (
  side: number,
): {
  net: KnotNetwork
  column: Int32Array
  tables: LockedTables
  start: Configuration
} => {
  const f = contactFresh(side, 'pass')
  const start = toWords(vacuumConfiguration(f, 'all'))

  return {
    net: knotNetwork('none', f.tables, start),
    column: boxHusk(f.weave.mesh, side).column,
    tables: f.tables,
    start,
  }
}

const slabFlat = (
  rows: readonly Reading[],
  side: number,
  axis: number,
): { values: number[]; flat: boolean } => {
  const values = rows
    .filter(
      r =>
        r.region.name.startsWith(`slab${axis}-`) &&
        Number(r.region.name.split('-')[1]) >= 2,
    )
    .map(r => r.S)

  return {
    values,
    flat:
      values.every(
        v =>
          Math.abs(v - values[0]!) <=
          1e-9 * Math.max(1, Math.abs(values[0]!)),
      ) && values.length === side / 2 - 1,
  }
}

// A0 on one side: the knot phase at beat 2
function knotPhase(side: number): {
  exact: boolean
  flat: boolean
  eta1: number
  knotsPerPlaquette: number
  halfOpen: number
} {
  const { net, column } = vacuumNet(side)

  for (let t = 0; t <= KNOT_BEAT; t++) {
    networkBeat(net)
  }

  const rows = readRegions(net, column, huskRegionFamily(side))
  const exact = rows.every(
    r =>
      r.cut === r.knots &&
      Math.abs(r.S - r.knots * KNOT_ENTROPY) <= 1e-9,
  )
  const flats = [0, 1, 2].map(axis => slabFlat(rows, side, axis))
  const slab = rows.find(r => r.region.name === 'slab0-2')!

  return {
    exact,
    flat: flats.every(f => f.flat),
    eta1: slab.S / slab.region.area,
    knotsPerPlaquette: slab.knots / slab.region.area,
    halfOpen: net.tally.halfOpen,
  }
}

type Equilibrium = {
  mean: number[]
  area: ReturnType<typeof linearFit>
  volume: ReturnType<typeof linearFit>
  normExact: boolean
  returned: boolean
  halfOpen: number
  largest: number
  branchesMax: number
  series: string[]
  slabs: string
}

// A1, A2 and part of A3 on one start: the equilibrium mean, the fits, the norm at every reading, the reversal
function equilibrium(regions: readonly HuskRegion[]): Equilibrium {
  const { net, column, tables, start } = vacuumNet(SIDE)
  const sums = new Array<number>(regions.length).fill(0)

  let normExact = true
  let count = 0

  const series: string[] = []

  for (let t = 0; t < BEATS; t++) {
    networkBeat(net)

    if (t >= EQUILIBRIUM[0] && t <= EQUILIBRIUM[1]) {
      const rows = readRegions(net, column, regions)

      rows.forEach((r, i) => {
        sums[i] = sums[i]! + r.S
      })
      count++
      normExact = normExact && networkNormExact(net)
    } else if (t % 6 === 2) {
      const rows = readRegions(
        net,
        column,
        regions.filter(
          r =>
            r.name === 'slab0-2' ||
            r.name === 'slab0-4' ||
            r.name === 'cube000-4',
        ),
      )

      series.push(
        `beat ${t}: ${rows.map(r => `${r.region.name} ${r.S.toFixed(1)}`).join(', ')}`,
      )
    }
  }

  const mean = sums.map(s => s / count)
  const area = linearFit({ xs: regions.map(r => r.area), ys: mean })
  const volume = linearFit({ xs: regions.map(r => r.volume), ys: mean })
  const largest = net.tally.largest
  const branchesMax = net.tally.branchesMax
  const halfOpen = net.tally.halfOpen

  for (let t = 0; t < BEATS; t++) {
    networkBeatBack(net)
  }

  const returned = networkReturned(
    net,
    knotNetwork('none', tables, start),
  )
  const slabs = [0, 1, 2]
    .map(axis =>
      regions
        .map((r, i) =>
          r.name.startsWith(`slab${axis}-`)
            ? `${r.name} ${mean[i]!.toFixed(1)}`
            : '',
        )
        .filter(Boolean)
        .join(', '),
    )
    .join('; ')

  return {
    mean,
    area,
    volume,
    normExact,
    returned,
    halfOpen,
    largest,
    branchesMax,
    series,
    slabs,
  }
}

// A3: the network against the rule's superposed beat on a masked start (the two stored units of the first knot)
function maskedAgreement(): { agree: number; branchesLast: number } {
  const { net: probe, tables } = vacuumNet(SIDE)
  const lineOf = new Map<number, number>()

  for (let h = 0; h < probe.storeToken.length; h++) {
    if (probe.storeToken[h]! >= 0) {
      lineOf.set(probe.storeToken[h]!, h >> 1)
    }
  }

  for (let t = 0; t <= KNOT_BEAT; t++) {
    networkBeat(probe)
  }

  const first = componentsOf(probe).find(c => c.members.length === 2)
  const f = contactFresh(SIDE, 'pass')
  const masked = toWords(vacuumConfiguration(f, 'none'))

  for (const t of first?.members ?? []) {
    masked.sopen[lineOf.get(t)!] = 3
  }

  const net = knotNetwork('none', tables, masked)

  let rule: LockedState = lockedState(masked)
  let agree = 0

  for (let t = 0; t < MASKED_BEATS; t++) {
    rule = coinedVetoBeat('none', tables, rule, t)
    networkBeat(net)
    agree += sameAsBranches(net, rule) ? 1 : 0
  }

  return { agree, branchesLast: rule.branches.length }
}

// A3: the tridiagonal solver against the Jacobi one, on the masks with at most `inside` members inside (the Jacobi
// solver runs on the 2n real form of the inside side, too slow for the saturated rings' two-and-two cuts)
function solverAgreement(net: KnotNetwork, inside: number): number {
  let worst = 0

  const members = (mask: number): number =>
    mask
      .toString(2)
      .split('')
      .filter(b => b === '1').length

  for (const c of componentsOf(net)
    .filter(x => x.members.length > 1)
    .slice(0, SOLVER_COMPONENTS)) {
    for (let mask = 1; mask < (1 << c.members.length) - 1; mask++) {
      if (members(mask) > inside) {
        continue
      }

      const rIndex = new Map<number, number>()
      const cIndex = new Map<number, number>()
      const key = (code: number, want: number): number =>
        c.members.reduce(
          (acc, _, i) =>
            ((mask >> i) & 1) === want
              ? acc * 9 + digitOf(code, i)
              : acc,
          0,
        )

      for (const code of c.codes) {
        if (!rIndex.has(key(code, 1))) {
          rIndex.set(key(code, 1), rIndex.size)
        }

        if (!cIndex.has(key(code, 0))) {
          cIndex.set(key(code, 0), cIndex.size)
        }
      }

      const re = Array.from({ length: rIndex.size }, () =>
        new Array<number>(cIndex.size).fill(0),
      )
      const im = Array.from({ length: rIndex.size }, () =>
        new Array<number>(cIndex.size).fill(0),
      )

      c.codes.forEach((code, i) => {
        const x = Number(c.a[i]!) * 2 ** -c.k
        const y = Number(c.b[i]!) * 2 ** -c.k
        const r = rIndex.get(key(code, 1))!
        const q = cIndex.get(key(code, 0))!

        re[r]![q]! += x - y / 2
        im[r]![q]! += (y * Math.sqrt(3)) / 2
      })

      let slow = 0

      for (const l of schmidtWeights(re, im)) {
        if (l > 1e-15) {
          slow -= l * Math.log(l)
        }
      }

      worst = Math.max(
        worst,
        Math.abs(componentEntropy(c, mask).entropy - slow),
      )
    }
  }

  return worst
}

export default experiment({
  id: 'gravity/knot-area-law',
  code: 'E-GRV-0083',
  title:
    "the working vacuum's knot entanglement is an area law only at its first meeting and a volume law at equilibrium, and its eta grows with the bulk depth, fail on A0, A1 and A2 with the instrument exact: the exact superposed state (a product of knot rings, never over 4 tokens on side 8, checked term for term against the rule and reversed exactly) gives at beat 2 S = cut knots x 0.5623 on every region and one S for every equal-area slab, eta_1 = 8.435, 12.65, 16.87 nats per husk plaquette on sides 8, 12, 16 (1.054 per plaquette per bulk dock of depth, so G_1 = 1 / (4 eta_1) = 0.0296 husk steps squared on side 8 and falls as 1 / depth); at equilibrium (beats 36 .. 47) the equal-area slabs of width 1 .. 4 read 1,770 to 5,472 nats and the volume fit beats the area fit (rms 579 against 916, r2 0.889 against 0.723, two starts alike), because each knot ring runs the length of its line",
  category: 'gravity',
  substrates: ['3434'],
  depth: 'L2',
  paper: false,
  run() {
    const started = Date.now()
    const log = (what: string): void =>
      console.error(
        `${what} ${Math.round((Date.now() - started) / 1000)}s`,
      )
    const family = startFamily(16)
    const regions = huskRegionFamily(SIDE)

    // A0
    const knots = withStart(family[0]!, () =>
      KNOT_SIDES.map(side => ({ side, ...knotPhase(side) })),
    )
    const eta1 = knots[0]!.eta1
    const a0 = knots.every(
      k => k.exact && k.flat && Math.abs(k.eta1 / eta1 - 1) <= 1e-9,
    )

    log('A0')

    // A1, A2, and the instrument per start
    const perStart = family.slice(0, STARTS).map(member =>
      withStart(member, () => {
        const e = equilibrium(regions)

        log(`equilibrium ${member.name}`)

        return { name: member.name, ...e }
      }),
    )
    const rms = (fit: { residual: number }): number =>
      Math.sqrt(fit.residual / regions.length)
    const a1 = perStart.every(p => rms(p.area) < rms(p.volume))
    const a2 = perStart.every(p => p.area.r2 >= 0.9 && p.area.slope > 0)

    // the rest of the instrument, on integer+0
    const masked = withStart(family[0]!, maskedAgreement)
    // every mask at beat 5 (at most 12 rows on side 8), the one-member masks at the last beat (saturated rings)
    const solverWorst = withStart(family[0]!, () => {
      const { net } = vacuumNet(SIDE)

      let worst = 0

      for (let t = 0; t < BEATS; t++) {
        networkBeat(net)

        if (t === 5) {
          worst = Math.max(worst, solverAgreement(net, SIDE))
        }
      }

      return Math.max(worst, solverAgreement(net, 1))
    })
    const a3 =
      knots.every(k => k.halfOpen === 0) &&
      perStart.every(
        p => p.halfOpen === 0 && p.normExact && p.returned,
      ) &&
      masked.agree === MASKED_BEATS &&
      solverWorst <= 1e-9

    log('A3')

    const status = !a3 || !a1 ? 'fail' : a0 && a2 ? 'pass' : 'partial'
    const first = perStart[0]!
    const etaEq = first.area.slope
    const g1 = 1 / (4 * eta1)
    const gEq = 1 / (4 * etaEq)
    const f4 = (x: number): string => x.toPrecision(4)
    const metrics: Record<string, number> = {
      gate_A0: a0 ? 1 : 0,
      gate_A1: a1 ? 1 : 0,
      gate_A2: a2 ? 1 : 0,
      gate_A3: a3 ? 1 : 0,
      knotEntropy: KNOT_ENTROPY,
      eta1,
      knotsPerPlaquette: knots[0]!.knotsPerPlaquette,
      etaCounted: knots[0]!.knotsPerPlaquette * KNOT_ENTROPY,
      G1: g1,
      maskedAgree: masked.agree,
      maskedBranchesLast: masked.branchesLast,
      solverWorst,
      seconds: (Date.now() - started) / 1000,
    }

    for (const k of knots) {
      metrics[`knotExact_side${k.side}`] = k.exact ? 1 : 0
      metrics[`knotFlat_side${k.side}`] = k.flat ? 1 : 0
      metrics[`eta1_side${k.side}`] = k.eta1
    }

    for (const p of perStart) {
      metrics[`${p.name}_etaEquilibrium`] = p.area.slope
      metrics[`${p.name}_areaIntercept`] = p.area.intercept
      metrics[`${p.name}_areaRms`] = rms(p.area)
      metrics[`${p.name}_areaR2`] = p.area.r2
      metrics[`${p.name}_volumeSlope`] = p.volume.slope
      metrics[`${p.name}_volumeIntercept`] = p.volume.intercept
      metrics[`${p.name}_volumeRms`] = rms(p.volume)
      metrics[`${p.name}_volumeR2`] = p.volume.r2
      metrics[`${p.name}_largestComponent`] = p.largest
      metrics[`${p.name}_branchesMax`] = p.branchesMax
      metrics[`${p.name}_G`] = 1 / (4 * p.area.slope)
    }

    return verdict({
      status,
      claim: `knot phase (beat ${KNOT_BEAT}, sides ${KNOT_SIDES.join(', ')}): S = cut knots x s_k exactly ${knots.map(k => k.exact).join('/')}, equal-area slabs flat ${knots.map(k => k.flat).join('/')}, eta_1 = ${f4(eta1)} nats per husk plaquette (${f4(knots[0]!.knotsPerPlaquette)} knots per plaquette x ${f4(KNOT_ENTROPY)}), G_1 = 1 / (4 eta_1) = ${f4(g1)} husk steps squared; equilibrium (side ${SIDE}, mean of beats ${EQUILIBRIUM[0]} .. ${EQUILIBRIUM[1]}, ${regions.length} regions): ${perStart.map(p => `${p.name} area fit eta ${f4(p.area.slope)} (c ${f4(p.area.intercept)}, rms ${f4(rms(p.area))}, r2 ${f4(p.area.r2)}) against volume fit v ${f4(p.volume.slope)} (c ${f4(p.volume.intercept)}, rms ${f4(rms(p.volume))}, r2 ${f4(p.volume.r2)})`).join('; ')}; G from the equilibrium slope ${f4(gEq)}; instrument ${a3}`,
      metrics,
      control: {
        volumeRms: rms(first.volume),
        areaRms: rms(first.area),
      },
      notes: `L2. Gates A0 ${a0}, A1 ${a1}, A2 ${a2}, A3 ${a3}. Knot phase per side: ${knots.map(k => `side ${k.side} exact ${k.exact}, flat ${k.flat}, eta_1 ${k.eta1}, half-open lines ${k.halfOpen}`).join('; ')}. Per start: ${perStart.map(p => `${p.name}: norm exact ${p.normExact}, returned ${p.returned}, half-open lines ${p.halfOpen}, largest component ${p.largest} tokens, most terms ${p.branchesMax}; equilibrium slabs ${p.slabs}; series ${p.series.join(' | ')}; region means ${regions.map((r, i) => `${r.name} (A ${r.area}, V ${r.volume}) ${p.mean[i]!.toFixed(1)}`).join(', ')}`).join('. ')}. Masked start against coinedVetoBeat: ${masked.agree} of ${MASKED_BEATS} beats, ${masked.branchesLast} terms at the last. Solver against Jacobi: ${solverWorst.toExponential(2)}. ${((Date.now() - started) / 1000).toFixed(0)} s.`,
    })
  },
})
