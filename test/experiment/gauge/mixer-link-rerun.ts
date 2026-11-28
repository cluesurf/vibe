// E-FRC-0320 RERUN, A TWO-BODY READ OF F-G AGAINST F-L, AND THE HELD-OUT C, P, CP TABLE.
// Every gate was registered before this file existed (gate
// e6106c2e478a, 2026-11-17T06:26:51Z), and every run goes through task/pre-register.
//
// WHY. E-FRC-0320 read open: its norm gate K2 (1e-12) was too tight for a float engine summing about 3e5
// irrational amplitudes (board trap). Its readings named (F-G or F-L, m1) as a product of halves, but F-G and F-L agree
// on a lone vibe (the lift Gamma(G) differs from G only on a frame holding two or more vibes), and the held-out tests
// were not run. This file:
//   A reruns E-FRC-0320's five parts unchanged, with K2 at 1e-10, and checks they equal 0034's files (RR);
//   B reads two loves on one full line of the base dock under F-G, F-L and the bare rule, exactly, on the R = 2 ball
//     for 2 beats (inside the horizon), to tell F-G from F-L;
//   C reads the C, P and CP table of the chosen rule (the working rule with F-G or F-L, the bare rule as the control)
//     exactly on the R = 2 ball for 2 beats, and, reported only, m1's link update under C, P and CP one sweep at a time.
//
// The pair stays a product of halves: no rule couples a mixer to a link, so a bound moving pair is not
// tested. Bell, interference and size are not run.
//
// GRADE. A's motion and parts B and C: honeycomb (exact balls within their horizon). Binding and the link table:
// mirrored. Depth L2.

import { experiment } from '@/test/scaffold/suite'
import { verdict, type Verdict } from '@/test/scaffold/verdict'
import { LINE_FIRSTS, OPPOSITE } from '@/code/rule/isometric-knit'
import { FRAME_OF_LINE, LINE_SECONDS, currentCoinPlace, setCoinPlace } from '@/code/rule/coined-locked-knit'
import {
  lockedNorm,
  lockedState,
  type Configuration,
  type LockedState,
} from '@/code/rule/doublet-locked-knit'
import { chargeConjugate, mapState, mirrorConfiguration, type Mirror } from '@/code/measure/locked-parity'
import { asMirror, labelMap, sameStateFast } from '@/code/measure/value-phase-maps'
import { slotGroup } from '@/code/rule/value-phase'

import {
  BARE,
  MIXERS,
  M1_GRADE,
  chartBall,
  gradeLink,
  linkPart,
  mixerBeat,
  motionGates,
  motionPart,
  readOld,
  readPart,
  referenceHolds,
  referencePart,
  smallBall,
  type Chart,
  type LinkGrade,
  type LinkPart,
  type Mixer,
  type MixerReading,
  type MotionPart,
  type ReferencePart,
  type SmallBall,
} from '@/test/experiment/gauge/mixer-link-select'
import {
  colorGroup,
  cuspGraph,
  familyF35,
  makeField,
  runPoint,
  sweep,
  totalEnergy,
  type State,
} from '@/test/experiment/gauge/demon-link-family'

const SLOTS = 24
const BEATS_SMALL = 2
const NORM_TOL = 1e-10
const DIFFER = 1e-9
const OFF_LINE = Math.SQRT2 + 1e-9
const P_MAPS = 8
const D0 = LINE_FIRSTS[0]!
const D0_BACK = OPPOSITE[D0]!

const FG = MIXERS.find(m => m.name === 'F-G')!
const FL = MIXERS.find(m => m.name === 'F-L')!

function configOf(cells: number, at: readonly (readonly [number, number, number])[]): Configuration {
  const c: Configuration = {
    vibe: new Int8Array(cells * 24),
    point: new Int8Array(cells * 24),
    open: new Uint8Array(cells * 24),
    store: new Int8Array(cells * 12),
    spoint: new Int8Array(cells * 12),
    sopen: new Uint8Array(cells * 12),
  }

  for (const [x, d, tone] of at) {
    c.vibe[x * 24 + d] = tone
    c.open[x * 24 + d] = 1
  }

  return c
}

function withSplit<T>(f: () => T): T {
  const place0 = currentCoinPlace()

  setCoinPlace('split')

  try {
    return f()
  } finally {
    setCoinPlace(place0)
  }
}

// n / d as a float, for big exact integers
function ratio(n: bigint, d: bigint): number {
  if (n === 0n) {
    return 0
  }

  const neg = n < 0n
  const q = ((neg ? -n : n) << 160n) / d

  return ((neg ? -1 : 1) * Number(q)) / 2 ** 160
}

// ---------------------------------------------------------------------------------------------------------------
// part B: two loves on a full line of the base dock

export type TwoBeat = { wOff: number; msd: number; separation: number; sameDock: number }

export type TwoReading = {
  name: string
  beats: TwoBeat[]
  normExact: boolean
  shapeExceptions: number
  branchesMax: number
}

export type TwoPart = { tablesMatch: boolean; readings: TwoReading[] }

function readTwo(m: Mixer, ball: SmallBall, chart: Chart, log: (line: string) => void): TwoReading {
  const sums: TwoBeat[] = Array.from({ length: BEATS_SMALL }, () => ({ wOff: 0, msd: 0, separation: 0, sameDock: 0 }))
  const shift = (x: number): number[] => [0, 1, 2].map(i => chart.pos[x * 3 + i]! - chart.pos[i]!)

  let normExact = true
  let shapeExceptions = 0
  let branchesMax = 0

  for (let l = 0; l < 12; l++) {
    let s: LockedState = lockedState(
      configOf(ball.cells, [
        [0, LINE_FIRSTS[l]!, 1],
        [0, LINE_SECONDS[l]!, 1],
      ]),
    )

    for (let t = 0; t < BEATS_SMALL; t++) {
      s = mixerBeat(m, ball.tables, s, t)
      branchesMax = Math.max(branchesMax, s.branches.length)

      const n = lockedNorm(s)

      normExact &&= n.total === n.unit * m.scale ** BigInt(2 * ball.cells * (t + 1))

      const den = m.scale ** BigInt(2 * ball.cells * (t + 1))
      const r = sums[t]!

      for (const b of s.branches) {
        const held: number[] = []

        for (let i = 0; i < b.vibe.length; i++) {
          if (b.vibe[i] !== 0) {
            held.push(i)
          }
        }

        if (held.length !== 2 || held.some(i => b.vibe[i] !== 1) || b.store.some(v => v !== 0)) {
          shapeExceptions++
          continue
        }

        const w = ratio(b.a * b.a - b.a * b.b + b.b * b.b, den << BigInt(2 * b.k)) / 12
        const [x1, x2] = held.map(i => Math.floor(i / 24)) as [number, number]
        const n1 = shift(x1)
        const n2 = shift(x2)
        const s1 = Math.hypot(...n1)
        const s2 = Math.hypot(...n2)

        r.wOff += (w / 2) * ((s1 > OFF_LINE ? 1 : 0) + (s2 > OFF_LINE ? 1 : 0))
        r.msd += (w / 2) * (s1 * s1 + s2 * s2)
        r.separation += w * ((n1[0]! - n2[0]!) ** 2 + (n1[1]! - n2[1]!) ** 2 + (n1[2]! - n2[2]!) ** 2)
        r.sameDock += x1 === x2 ? w : 0
      }
    }
  }

  log(
    `B ${m.name}: ${sums.map((b, t) => `beat ${t + 1} W_off ${b.wOff.toFixed(6)} msd ${b.msd.toFixed(6)} sep ${b.separation.toFixed(6)} same ${b.sameDock.toFixed(6)}`).join('; ')}; norm exact ${normExact}, shape exceptions ${shapeExceptions}, branches max ${branchesMax}`,
  )

  return { name: m.name, beats: sums, normExact, shapeExceptions, branchesMax }
}

export function twoPart(log: (line: string) => void): TwoPart {
  return withSplit(() => {
    const ball = smallBall(BEATS_SMALL)
    const chart = chartBall(BEATS_SMALL)
    const tablesMatch = ball.cells === chart.cells && ball.table.every((v, i) => v === chart.table[i])

    return { tablesMatch, readings: [BARE, FG, FL].map(m => readTwo(m, ball, chart, log)) }
  })
}

// ---------------------------------------------------------------------------------------------------------------
// part C: the C, P, CP table

export type SymmetryRow = {
  mixer: string
  start: string
  c: number
  p: number[]
  cp: number
}

export type TablePart = {
  pMaps: { name: string; conflicts: number }[]
  rows: SymmetryRow[]
  link: LinkTable
}

export type LinkTable = {
  conjugateMissing: number
  pFound: string | null
  pConflicts: number
  linkMapConflicts: number
  c: { differ: number; energyKept: boolean }
  p: { differ: number; energyKept: boolean } | null
  cp: { differ: number; energyKept: boolean } | null
  links: number
}

function beatsOff(m: Mixer, ball: SmallBall, c0: Configuration, f: (c: Configuration) => Configuration): number {
  let a = lockedState(c0)
  let b = lockedState(f(c0))
  let off = 0

  for (let t = 0; t < BEATS_SMALL; t++) {
    a = mixerBeat(m, ball.tables, a, t)
    b = mixerBeat(m, ball.tables, b, t)

    if (!sameStateFast(mapState(a, f), b)) {
      off++
    }
  }

  return off
}

function ballSymmetries(log: (line: string) => void): { pMaps: TablePart['pMaps']; rows: SymmetryRow[] } {
  return withSplit(() => {
    const ball = smallBall(BEATS_SMALL)
    const table = { cells: ball.cells, neighbour: (x: number, d: number) => ball.table[x * SLOTS + d]! }
    const g = slotGroup()
    const mirrors: Mirror[] = []
    const pMaps: TablePart['pMaps'] = []

    for (let e = 0; e < g.elements.length && mirrors.length < P_MAPS; e++) {
      if (g.det[e] !== -1) {
        continue
      }

      const m = labelMap(table, g.elements[e]!, 0)

      pMaps.push({ name: `g${e}`, conflicts: m.conflicts })
      mirrors.push(asMirror(`g${e}`, g.elements[e]!, m.cells, -1))
    }

    const other = Array.from({ length: 12 }, (_, l) => l).find(l => FRAME_OF_LINE[l] !== FRAME_OF_LINE[0])!
    const starts: [string, [number, number][]][] = [
      ['L', [[0, D0]]],
      ['F', [[0, D0], [0, D0_BACK]]],
      ['X', [[0, D0], [0, LINE_FIRSTS[other]!]]],
    ]
    const charge = (c: Configuration): Configuration => chargeConjugate(c)
    const rows: SymmetryRow[] = []

    for (const m of [BARE, FG, FL]) {
      for (const [name, at] of starts) {
        for (const tone of [1, -1]) {
          const c0 = configOf(ball.cells, at.map(([x, d]) => [x, d, tone] as const))
          const row: SymmetryRow = {
            mixer: m.name,
            start: tone > 0 ? name : `${name}f`,
            c: beatsOff(m, ball, c0, charge),
            p: mirrors.map(p => beatsOff(m, ball, c0, c => mirrorConfiguration(p, c))),
            cp: beatsOff(m, ball, c0, c => chargeConjugate(mirrorConfiguration(mirrors[0]!, c))),
          }

          rows.push(row)
          log(`C ${JSON.stringify(row)}`)
        }
      }
    }

    return { pMaps, rows }
  })
}

// m1's link update under C, P, CP, one sweep at a time (reported only)
function linkSymmetries(log: (line: string) => void): LinkTable {
  const color = colorGroup()
  const group = color.group
  const m1 = familyF35(color)[0]!
  const graph = cuspGraph({ period: 4, floor: 1 })
  const field = makeField(graph)
  const state = runPoint({ field, color, member: m1, fill: 0.14 }).state

  // C: each element to its complex conjugate
  const conj = new Int32Array(group.order).fill(-1)

  for (let a = 0; a < group.order; a++) {
    const ma = group.matrices[a]!

    for (let b = 0; b < group.order && conj[a]! < 0; b++) {
      const mb = group.matrices[b]!
      let same = true

      for (let k = 0; k < 9 && same; k++) {
        same = Math.abs(ma[2 * k]! - mb[2 * k]!) < 1e-9 && Math.abs(ma[2 * k + 1]! + mb[2 * k + 1]!) < 1e-9
      }

      if (same) {
        conj[a] = b
      }
    }
  }

  const conjugateMissing = Array.from(conj).filter(v => v < 0).length

  // P: the first det -1 slot map whose extension from dock 0 to dock 0 is a bijection with 0 conflicts
  const table = { cells: graph.docks, neighbour: (x: number, d: number) => graph.table[x * SLOTS + d]! }
  const g = slotGroup()

  let pFound: string | null = null
  let pConflicts = -1
  let linkTarget: Int32Array | null = null
  let linkFlip: Uint8Array | null = null
  let linkMapConflicts = 0

  for (let e = 0; e < g.elements.length && pFound === null; e++) {
    if (g.det[e] !== -1) {
      continue
    }

    const m = labelMap(table, g.elements[e]!, 0)
    const seen = new Uint8Array(graph.docks)
    const bijective = m.cells.every(y => y >= 0 && !seen[y] && (seen[y] = 1) === 1)

    if (m.conflicts !== 0 || !bijective) {
      continue
    }

    pFound = `g${e}`
    pConflicts = m.conflicts

    const target = new Int32Array(field.links).fill(-1)
    const flip = new Uint8Array(field.links)
    const slots = g.elements[e]!

    for (let x = 0; x < graph.docks; x++) {
      for (let d = 0; d < SLOTS; d++) {
        const h = x * SLOTS + d
        const l = field.linkOf[h]!

        if (l < 0) {
          continue
        }

        const h2 = m.cells[x]! * SLOTS + slots[d]!
        const l2 = field.linkOf[h2]!
        const f = field.forward[h] === field.forward[h2] ? 0 : 1

        if (l2 < 0) {
          linkMapConflicts++
          continue
        }

        if (target[l]! < 0) {
          target[l] = l2
          flip[l] = f
        } else if (target[l] !== l2 || flip[l] !== f) {
          linkMapConflicts++
        }
      }
    }

    linkTarget = target
    linkFlip = flip
  }

  const applyC = (s: State): State => ({ values: Int32Array.from(s.values, v => conj[v]!), demons: Int32Array.from(s.demons) })
  const applyP = (s: State): State => {
    const values = new Int32Array(field.links)
    const demons = new Int32Array(field.links)

    for (let l = 0; l < field.links; l++) {
      const l2 = linkTarget![l]!

      values[l2] = linkFlip![l] ? group.inverse[s.values[l]!]! : s.values[l]!
      demons[l2] = s.demons[l]!
    }

    return { values, demons }
  }
  const clone = (s: State): State => ({ values: Int32Array.from(s.values), demons: Int32Array.from(s.demons) })
  const energy = (s: State): number => totalEnergy({ field, group, member: m1, state: s })
  const covariance = (f: (s: State) => State): { differ: number; energyKept: boolean } => {
    const a = clone(state)

    sweep({ field, group, member: m1, state: a })

    const fa = f(a)
    const b = f(clone(state))

    sweep({ field, group, member: m1, state: b })

    let differ = 0

    for (let l = 0; l < field.links; l++) {
      differ += fa.values[l] !== b.values[l] || fa.demons[l] !== b.demons[l] ? 1 : 0
    }

    return { differ, energyKept: energy(f(clone(state))) === energy(state) }
  }
  const usableP = linkTarget !== null && linkMapConflicts === 0
  const out: LinkTable = {
    conjugateMissing,
    pFound,
    pConflicts,
    linkMapConflicts,
    c: conjugateMissing === 0 ? covariance(applyC) : { differ: -1, energyKept: false },
    p: usableP ? covariance(applyP) : null,
    cp: usableP && conjugateMissing === 0 ? covariance(s => applyC(applyP(s))) : null,
    links: field.links,
  }

  log(`C link ${JSON.stringify(out)}`)

  return out
}

export function tablePart(log: (line: string) => void): TablePart {
  const { pMaps, rows } = ballSymmetries(log)

  return { pMaps, rows, link: linkSymmetries(log) }
}

// ---------------------------------------------------------------------------------------------------------------
// the verdict

// 0034's part, without wall-clock seconds
const stable = (x: unknown): string => JSON.stringify(x, (k, v) => (k === 'seconds' ? undefined : v))

export type RerunInput = {
  motion: MotionPart
  links: LinkPart[]
  reference: ReferencePart
  previous: { motion: MotionPart | null; links: (LinkPart | null)[]; reference: ReferencePart | null }
  two: TwoPart
  table: TablePart
}

const fmt = (x: number, d = 3): string => (Number.isFinite(x) ? x.toFixed(d) : 'none')

export function rerunVerdict(input: RerunInput): Verdict {
  const { motion, links, reference, previous, two, table } = input
  const mg = motionGates(motion, NORM_TOL)
  const rPrime = referenceHolds(reference, readOld())
  const grades: LinkGrade[] = links.map(gradeLink)
  const linkInstruments = grades.every(g => g.instruments)
  const rr =
    previous.motion !== null &&
    stable(previous.motion) === stable(motion) &&
    previous.reference !== null &&
    stable(previous.reference) === stable(reference) &&
    links.every((l, k) => previous.links[k] !== null && stable(previous.links[k]) === stable(l))

  // part B
  const bReading = (name: string) => two.readings.find(r => r.name === name)!
  const b1 = two.readings.every(r => r.normExact)
  const b2 = two.readings.every(r => r.shapeExceptions === 0)
  const fg = bReading('F-G')
  const fl = bReading('F-L')
  const keys: (keyof TwoBeat)[] = ['wOff', 'msd', 'separation', 'sameDock']
  const gap = Math.max(...fg.beats.flatMap((b, t) => keys.map(k => Math.abs(b[k] - fl.beats[t]![k]))))
  const t0 = gap > DIFFER
  const last = BEATS_SMALL - 1
  const choice: string[] = !t0
    ? ['F-G', 'F-L']
    : Math.abs(fg.beats[last]!.msd - fl.beats[last]!.msd) > DIFFER
      ? [fg.beats[last]!.msd > fl.beats[last]!.msd ? 'F-G' : 'F-L']
      : Math.abs(fg.beats[last]!.wOff - fl.beats[last]!.wOff) > DIFFER
        ? [fg.beats[last]!.wOff > fl.beats[last]!.wOff ? 'F-G' : 'F-L']
        : ['F-G', 'F-L']

  // part C
  const p0 = table.pMaps.length === P_MAPS && table.pMaps.every(p => p.conflicts === 0)
  const rowsOf = (name: string) => table.rows.filter(r => r.mixer === name)
  const clean = (name: string): boolean => rowsOf(name).every(r => r.c === 0 && r.cp === 0 && r.p.every(v => v === 0))
  const z = clean('bare')
  const hcp = (name: string): boolean => clean(name)

  // the selection of 0034, rerun
  const mixers = motion.readings.filter(r => r.name !== 'bare')
  const moving = mixers.filter(r => r.pass).sort((a, b) => b.beats[3]!.msd - a.beats[3]!.msd)
  const binding = [
    M1_GRADE,
    ...grades.filter(g => g.status === 'pass').map(g => ({ member: g.member, status: g.status, both: g.both, maxShift: g.maxShift })),
  ].sort((a, b) => b.both - a.both || a.maxShift - b.maxShift)
  const chosen = choice.filter(name => moving.some(r => r.name === name))
  const instrumentsHold = mg.all && rPrime && linkInstruments && rr && b1 && b2 && p0 && z
  const selected = moving.length > 0 && binding.length > 0
  const status: Verdict['status'] = !instrumentsHold
    ? 'open'
    : !selected
      ? 'fail'
      : t0 && chosen.length > 0 && chosen.every(hcp)
        ? 'pass'
        : 'partial'
  const link = binding[0]
  const row = (r: MixerReading): string =>
    `${r.name} ${r.pass ? 'MOVES' : 'no'}: W_off(4) ${fmt(r.beats[3]!.wOff, 4)}, msd ${r.beats.map(b => fmt(b.msd)).join(' ')}, norm off ${r.normOff.toExponential(1)}`
  const twoRow = (r: TwoReading): string =>
    `${r.name}: ${r.beats.map((b, t) => `beat ${t + 1} W_off ${fmt(b.wOff, 4)} msd ${fmt(b.msd, 4)} separation ${fmt(b.separation, 4)} same dock ${fmt(b.sameDock, 4)}`).join(', ')} (branches max ${r.branchesMax})`
  const tableRow = (name: string): string =>
    `${name}: ${rowsOf(name).map(r => `${r.start} C ${r.c} P ${r.p.join('')} CP ${r.cp}`).join(', ')}`
  const lt = table.link
  const metrics: Record<string, number> = {
    k0: mg.k0 ? 1 : 0,
    k1: mg.k1 ? 1 : 0,
    k2: mg.k2 ? 1 : 0,
    k3: mg.k3 ? 1 : 0,
    h1: mg.h1 ? 1 : 0,
    c0: mg.c0 ? 1 : 0,
    rPrime: rPrime ? 1 : 0,
    rr: rr ? 1 : 0,
    linkInstruments: linkInstruments ? 1 : 0,
    b1: b1 ? 1 : 0,
    b2: b2 ? 1 : 0,
    t0: t0 ? 1 : 0,
    p0: p0 ? 1 : 0,
    z: z ? 1 : 0,
    hcpFG: hcp('F-G') ? 1 : 0,
    hcpFL: hcp('F-L') ? 1 : 0,
    twoGap: gap,
    tablesMatch: two.tablesMatch ? 1 : 0,
    linkConjugateMissing: lt.conjugateMissing,
    linkCDiffer: lt.c.differ,
    linkPDiffer: lt.p?.differ ?? -1,
    linkCPDiffer: lt.cp?.differ ?? -1,
    linkLinks: lt.links,
  }

  for (const r of motion.readings) {
    metrics[`${r.name.replace('-', '')}_normOff`] = r.normOff
    metrics[`${r.name.replace('-', '')}_pass`] = r.pass ? 1 : 0
  }

  for (const r of two.readings) {
    r.beats.forEach((b, t) => {
      metrics[`two_${r.name.replace('-', '')}_msd${t + 1}`] = b.msd
      metrics[`two_${r.name.replace('-', '')}_wOff${t + 1}`] = b.wOff
    })
  }

  for (const g of grades) {
    metrics[`${g.member}_pass`] = g.status === 'pass' ? 1 : 0
  }

  const selection =
    status === 'open'
      ? 'NOT SELECTED: an instrument gate fails'
      : !selected
        ? `NO PAIR: ${moving.length === 0 ? 'no mixer passes motion' : 'no link member passes binding'}`
        : `SELECTED (a product of two halves): mixer ${chosen.join(' and ')}${!t0 ? ' (tied: the two-body read does not tell them apart)' : chosen.length > 1 ? ' (the two-body read tells them apart, but the choice rule ties: equal msd and W_off at beat 2)' : ''}, link ${link!.member}; H-CP ${chosen.map(n => `${n} ${hcp(n) ? 'passes' : 'FAILS'}`).join(', ')}`

  return verdict({
    status,
    claim: `${selection}. A bound moving pair is NOT tested; Bell, interference and size were not run. A, E-FRC-0320 rerun with K2 at 1e-10: ${motion.readings.map(row).join(' || ')}; binding m1 PASS (E-FRC-0319), ${grades.map(g => `${g.member} ${g.status.toUpperCase()} (${g.both} both-confining, ${g.beyond} past 25 percent)`).join(', ')}; equal to 0034's parts ${rr}. B, two loves on a full line of the base dock (12 lines, exact R = 2 ball, beats 1 and 2): ${two.readings.map(twoRow).join(' || ')}; F-G against F-L differ by up to ${gap.toExponential(2)}. C, the C, P, CP table (beats off of 2, exact R = 2 ball, P the first ${P_MAPS} det -1 slot maps): ${['bare', 'F-G', 'F-L'].map(tableRow).join(' || ')}. Link m1 one sweep at a time on I-A f 0.14 (reported): C ${lt.c.differ} of ${lt.links} links differ (energy kept ${lt.c.energyKept}), P ${lt.p ? `${lt.p.differ} (energy kept ${lt.p.energyKept}, map ${lt.pFound})` : 'no 0-conflict det -1 map'}, CP ${lt.cp ? `${lt.cp.differ} (energy kept ${lt.cp.energyKept})` : 'not read'}. Instruments ${instrumentsHold ? 'hold' : 'FAIL'} (K0 ${mg.k0}, K1 ${mg.k1}, K2 ${mg.k2}, K3 ${mg.k3}, H1 ${mg.h1}, C0 ${mg.c0}, R' ${rPrime}, RR ${rr}, link ${linkInstruments}, B1 ${b1}, B2 ${b2}, P0 ${p0}, Z ${z})`,
    metrics,
    control: { c0: mg.c0 ? 1 : 0, z: z ? 1 : 0 },
    notes: `L2. Gates registered before the run, gate e6106c2e478a. Motion, B and C honeycomb grade (exact within the horizon), binding and the link table mirrored. P maps ${JSON.stringify(table.pMaps)}. Link table ${JSON.stringify(lt)}.`,
  })
}

// 0034's parts, for RR
export function previousParts(): RerunInput['previous'] {
  return {
    motion: readPart<MotionPart>('motion'),
    links: (['m2', 'm3', 'm4'] as const).map(name => readPart<LinkPart>(name)),
    reference: readPart<ReferencePart>('reference'),
  }
}

export default experiment({
  id: 'gauge/mixer-link-rerun',
  code: 'E-FRC-0321',
  title:
    "E-FRC-0320 rerun with the norm gate at 1e-10, a two-body read of F-G against F-L and the held-out C, P, CP table, partial (gates fixed before the run): the rerun equals 0034's parts bit for bit and every instrument gate holds, so motion selects F-G and F-L (W_off(4) 0.0126, msd 0.408 against the line law's 0.333) and binding m1; two loves on a full line of the base dock (exact R = 2 ball, 2 beats) tell them apart only in the pair's spread (separation 1.164 against 0.888 at beat 1, 0.743 against 0.648 at beat 2) while the registered choice readings tie (msd 0.296 and W_off 0.0156 at beat 2 for both); the C, P, CP table on 6 starts and 8 det -1 maps reads 0 beats off for the bare rule and F-G, while F-L breaks P on the full-line and cross-frame starts (2 of 2 beats under 6 of 8 maps) and CP on the full line, keeping C; m1's link update is not covariant one sweep at a time (C 2061, P 1708, CP 2085 of 2112 links differ) though every map keeps its energy; the pair is a product of halves, a bound moving pair not tested",
  category: 'gauge',
  substrates: ['3434'],
  depth: 'L2',
  paper: false,
  run() {
    const log = (line: string): void => console.error(line)

    return rerunVerdict({
      motion: motionPart(log),
      links: (['m2', 'm3', 'm4'] as const).map(name => linkPart(name, log)),
      reference: referencePart(log),
      previous: previousParts(),
      two: twoPart(log),
      table: tablePart(log),
    })
  },
})
