// Readings of the working vacuum with the frame mixer (E-SPN-0095): the no-veto two-point store under the pass contact,
// the covariant coin, and G of E-SPN-0094 (code/rule/coined-locked-knit mixBranch, mixedVetoBeat; on paths
// code/measure/occupation-veto-readings pathMix).
//
// THE PATH GATES are E-RLT-0103's and E-RLT-0105's (laws, reversal, C, one causal component, balanced pair creation,
// a bounded lone wake), read the same way, with the coin and the mixer as flags, so the coinless and mixerless runs are
// the same code. THE LONE RUNS are the superposed rule on one open love: per beat, the weight of the branches whose open
// vibe is off the seed's line, off the seed's frame, off the seed's husk line, and the husk displacements it holds.
//
// Exact: the rule in Z[w][1/2]; the weights below are exact rationals reported as floats (measurement).

import { LINE_OF } from '@/code/rule/isometric-knit'
import { boxHusk, causalRun, streamTarget } from '@/code/measure/causal-components'
import { centerOf } from '@/code/measure/wall-reading'
import { cloneConfiguration, lockedNorm, lockedState, norm, sameConfiguration, type Branch, type Configuration, type LockedState, type LockedTables } from '@/code/rule/doublet-locked-knit'
import { toWords, type VetoKind } from '@/code/rule/occupation-veto-knit'
import { coinedVetoBeat, coinedVetoBeatBack, FRAME_OF_LINE, liftedVetoBeat, liftedVetoBeatBack, mixedVetoBeat, mixedVetoBeatBack, newLiftTally, newMixTally } from '@/code/rule/coined-locked-knit'
import { laws, newPathTally, vacuumConfiguration, type LockedFresh } from '@/code/measure/doublet-locked-readings'
import { contactFresh, vetoPathReplay, vetoPathRunner, vetoPathTrack, vetoPathWake, type MixKind } from '@/code/measure/occupation-veto-readings'
import { d4BoxCoordinates, d4Vector } from '@/code/substrate/d4-box-integer'
import { rootsD4 } from '@/code/algebra/group/root-system'

const ROOTS = rootsD4()

// `mix`: false, true (E-SPN-0095's G on lone frames) or 'lift' (E-SPN-0097's Gamma(G), code/rule/coined-locked-knit
// liftBranch, on paths occupation-veto-readings pathLift)
export type Flags = { readonly coin: boolean; readonly mix: MixKind }

export const wordVacuum = (f: { cells: number; layout: Int8Array }, store: Int8Array): Configuration => toWords(vacuumConfiguration({ cells: f.cells, store, layout: f.layout }, 'all'))

// ---- the path gates ----

export type Wake = { worst: number[][]; offLine: number; offFrame: number }

// the lone wake on one path, all 24 directions, love and fear: worst trits per period [love, fear], off the line, off
// the frame
export function wakeOf(kind: VetoKind, g: LockedFresh, side: number, threshold: number, beats: number, flags: Flags): Wake {
  const center = centerOf(side)
  const vacuum = wordVacuum(g, g.store)
  const track = vetoPathTrack(kind, g.tables, vacuum, threshold, beats, flags.coin, flags.mix).states
  const worst: number[][] = [
    [0, 0, 0, 0],
    [0, 0, 0, 0],
  ]
  let offLine = 0
  let offFrame = 0

  ;[1, -1].forEach((tone, k) => {
    for (let d = 0; d < 24; d++) {
      const w = vetoPathWake({ kind, tables: g.tables, vacuum, track, seedSlot: center * 24 + d, tone, threshold, beats, coin: flags.coin, mix: flags.mix })

      w.worst.forEach((x, p) => {
        worst[k]![p] = Math.max(worst[k]![p] ?? 0, x)
      })
      offLine += w.offLine
      offFrame += w.offFrame
    }
  })

  return { worst, offLine, offFrame }
}

export type PathReading = {
  lawBreaks: number
  reverses: boolean
  cBreaks: number
  made: number
  unmade: number
  units: number
  freeLast: number
  crossed: number
  mixed: number
  causalLargest: number
  descentMin: number
  coveredBy: number
  wake: Wake
}

// E-RLT-0105's readPath with the flags: side, beats, causal beats as E-RLT-0103
export function readVacuumPath(input: { kind: VetoKind; side: number; threshold: number; beats: number; causalBeats: number; flags: Flags }): PathReading {
  const { kind, side, threshold, beats, causalBeats, flags } = input
  const f = contactFresh(side, 'pass')
  const vacuum = wordVacuum(f, f.store)
  const run = vetoPathRunner(kind, f.tables, vacuum, threshold, 0, flags.coin, flags.mix)
  const crun = vetoPathRunner(kind, f.tables, wordVacuum(f, Int8Array.from(f.store, v => -v)), threshold, 0, flags.coin, flags.mix)
  const tally = newPathTally()
  const l0 = laws(vacuum)
  let lawBreaks = 0
  let cBreaks = 0
  let freeLast = 0

  for (let t = 0; t < beats; t++) {
    run.beat(tally)
    crun.beat()

    const s = run.state()
    const c = crun.state()
    const l = laws(s)
    let off = 0
    let free = 0

    lawBreaks += l.some((v, k) => v !== l0[k]) ? 1 : 0

    for (let i = 0; i < s.vibe.length; i++) {
      free += s.vibe[i] !== 0 ? 1 : 0
      if (s.vibe[i] !== -(c.vibe[i] as number) || (s.vibe[i] !== 0 && s.point[i] !== c.point[i])) off++
    }

    for (let i = 0; i < s.store.length; i++) if (s.store[i] !== -(c.store[i] as number) || (s.store[i] !== 0 && s.spoint[i] !== c.spoint[i])) off++

    cBreaks += off > 0 ? 1 : 0
    freeLast = free
  }

  const crossed = run.crossed()
  const mixed = run.mixed()

  for (let t = 0; t < beats; t++) run.back()

  const back = run.state()
  let reverses = true

  for (let i = 0; i < back.vibe.length && reverses; i++) reverses = back.vibe[i] === vacuum.vibe[i] && (back.vibe[i] === 0 || back.point[i] === vacuum.point[i])
  for (let i = 0; i < back.store.length && reverses; i++) reverses = back.store[i] === vacuum.store[i] && (back.store[i] === 0 || back.spoint[i] === vacuum.spoint[i])

  let units = 0

  for (const v of f.store) units += v !== 0 ? 1 : 0

  const husk = boxHusk(f.weave.mesh, side)
  const target = streamTarget(f.weave.mesh)
  const center = centerOf(side)
  let causalLargest = 0
  let descentMin = Number.POSITIVE_INFINITY
  let coveredBy = 0

  for (let d = 0; d < 24; d++) {
    const start = wordVacuum(f, f.store)

    start.vibe[center * 24 + d] = 1
    start.open[center * 24 + d] = 1

    const c = causalRun({ replay: vetoPathReplay(kind, f.tables, start, threshold, flags.coin, flags.mix), husk, target, beats: causalBeats, seedDock: center })
    const first = new Int32Array(husk.columns).fill(-1)

    for (let x = 0; x < f.cells; x++) {
      const at = c.log.reachedAt[x] as number
      const col = husk.column[x] as number

      if (at >= 0 && (first[col] === -1 || at < (first[col] as number))) first[col] = at
    }

    causalLargest = Math.max(causalLargest, c.counts.husk)
    descentMin = Math.min(descentMin, c.counts.reachedHusk)
    coveredBy = Math.max(coveredBy, first.includes(-1) ? Number.POSITIVE_INFINITY : Math.max(...Array.from(first)))
  }

  const wake = wakeOf(kind, contactFresh(side, 'pass', center), side, threshold, beats, flags)

  return { lawBreaks, reverses, cBreaks, made: tally.made, unmade: tally.unmade, units, freeLast, crossed, mixed, causalLargest, descentMin, coveredBy, wake }
}

// ---- the lone runs ----

// every dock's husk column coordinates (v0, v1, v2) mod side
export function huskCoordinates(cells: number, side: number): number[][] {
  const mod = (a: number): number => ((a % side) + side) % side

  return Array.from({ length: cells }, (_, x) => d4Vector(d4BoxCoordinates({ cell: x, side })).slice(0, 3).map(mod))
}

// the positions of a branch's open content: open slots (dock, line) and open stores (dock, line)
function openPlaces(b: Configuration): { x: number; line: number }[] {
  const out: { x: number; line: number }[] = []

  for (let i = 0; i < b.vibe.length; i++) if (b.vibe[i] !== 0 && b.open[i]) out.push({ x: Math.floor(i / 24), line: LINE_OF[i % 24] as number })
  for (let i = 0; i < b.store.length; i++) if (b.store[i] !== 0 && b.sopen[i]) out.push({ x: Math.floor(i / 12), line: i % 12 })

  return out
}

// the integer rank of a set of 3-vectors
function rank3(vs: readonly number[][]): number {
  const rows = vs.map(v => v.slice())
  let r = 0

  for (let c = 0; c < 3 && r < rows.length; c++) {
    const p = rows.findIndex((row, k) => k >= r && row[c] !== 0)

    if (p < 0) continue
    ;[rows[r], rows[p]] = [rows[p]!, rows[r]!]

    for (let k = 0; k < rows.length; k++) {
      if (k === r || rows[k]![c] === 0) continue

      const f = rows[k]![c]!
      const e = rows[r]![c]!

      rows[k] = rows[k]!.map((x, t) => x * e - rows[r]![t]! * f)
    }

    r++
  }

  return r
}

export type LoneBeat = { branches: number; offLine: number; offFrame: number; offHuskLine: number; lines: number; huskRank: number; normExact: boolean }

export type LoneRun = { beats: LoneBeat[]; final: LockedState; mixes: number }

// one open love (or fear) at `slot` of `start`, run `beats` beats of the mixed rule (or the coined rule when `mix` is
// false), read every beat
export function loneRun(input: { kind: VetoKind; tables: LockedTables; start: Configuration; slot: number; beats: number; mix: MixKind; side: number; husk: readonly number[][] }): LoneRun {
  const { kind, tables, start, slot, beats, mix, side, husk } = input
  const seedLine = LINE_OF[slot % 24] as number
  const seedFrame = FRAME_OF_LINE[seedLine] as number
  const x0 = Math.floor(slot / 24)
  const axis = (ROOTS[slot % 24] as number[]).slice(0, 3)
  const reduce = (a: number): number => {
    const m = ((a % side) + side) % side

    return m > side / 2 ? m - side : m
  }
  // on the seed's husk line: the displacement is a multiple of the axis shadow (mod side)
  const onHuskLine = (d: number[]): boolean => {
    for (let n = 0; n < side; n++) if (d.every((v, k) => reduce(v - n * (axis[k] as number)) === 0)) return true

    return false
  }
  const mt = newMixTally()
  const lt = newLiftTally()
  let s: LockedState = lockedState(start)
  const out: LoneBeat[] = []

  for (let t = 0; t < beats; t++) {
    s = mix === 'lift' ? liftedVetoBeat(kind, tables, s, t, undefined, undefined, lt) : mix ? mixedVetoBeat(kind, tables, s, t, undefined, undefined, mt) : coinedVetoBeat(kind, tables, s, t)

    const n = lockedNorm(s)
    let offLine = 0
    let offFrame = 0
    let offHuskLine = 0
    const lines = new Set<number>()
    const displacements = new Map<string, number[]>()

    for (const b of s.branches) {
      const w = Number(norm(b.a, b.b)) / 4 ** b.k
      const places = openPlaces(b)

      if (places.some(p => p.line !== seedLine)) offLine += w
      if (places.some(p => FRAME_OF_LINE[p.line] !== seedFrame)) offFrame += w

      let offH = false

      for (const p of places) {
        lines.add(p.line)

        const d = (husk[p.x] as number[]).map((v, k) => reduce(v - ((husk[x0] as number[])[k] as number)))

        displacements.set(d.join(','), d)
        if (!onHuskLine(d)) offH = true
      }

      if (offH) offHuskLine += w
    }

    out.push({ branches: s.branches.length, offLine, offFrame, offHuskLine, lines: lines.size, huskRank: rank3([...displacements.values()]), normExact: n.total === n.unit })
  }

  return { beats: out, final: s, mixes: mix === 'lift' ? lt.lifts : mt.mixes }
}

// the exact inverse of a lone run: true when it returns the start as one branch of amplitude 1
export function loneRunsBack(input: { kind: VetoKind; tables: LockedTables; start: Configuration; final: LockedState; beats: number; mix: MixKind }): boolean {
  const { kind, tables, start, final, beats, mix } = input
  let back = final

  for (let t = beats - 1; t >= 0; t--) back = mix === 'lift' ? liftedVetoBeatBack(kind, tables, back, t) : mix ? mixedVetoBeatBack(kind, tables, back, t) : coinedVetoBeatBack(kind, tables, back, t)

  const b0 = back.branches[0]

  return back.branches.length === 1 && !!b0 && b0.a === 1n && b0.b === 0n && b0.k === 0 && sameConfiguration(b0, start)
}

// two states equal branch for branch, in order (the rule's own merge order), amplitudes and configurations
export function sameState(a: LockedState, b: LockedState): boolean {
  return a.branches.length === b.branches.length && a.branches.every((x: Branch, i) => {
    const y = b.branches[i] as Branch

    return x.a === y.a && x.b === y.b && x.k === y.k && sameConfiguration(x, y)
  })
}

// an empty configuration of `cells` docks with one open vibe of `tone` at `slot`
export function loneStart(cells: number, slot: number, tone: number, base?: Configuration): Configuration {
  const c: Configuration = base
    ? cloneConfiguration(base)
    : { vibe: new Int8Array(cells * 24), point: new Int8Array(cells * 24), open: new Uint8Array(cells * 24), store: new Int8Array(cells * 12), spoint: new Int8Array(cells * 12), sopen: new Uint8Array(cells * 12) }

  c.vibe[slot] = tone
  c.open[slot] = 1

  return c
}
