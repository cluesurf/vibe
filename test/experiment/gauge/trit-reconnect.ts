// The reconnection move (E-FRC-0213): a closed string loop moves into the potential of the triangle it
// bounds, so a circulating current runs lap after lap on string trits (E-FRC-0210 refused it on lap 2).
//
// The rule, code/rule/trit-reconnect. For a bulk triangle t casting husk triangle P with orientation o, the
// translation s_(l_j) <- s_(l_j) - k c_j, U_P <- U_P - k o keeps the husk flux E = S - C^T U on every husk
// link. U_P is written through its thermometer front, so the column stays the light's code. The reachable
// states form a chain of 1, 2 or 3; two swap, and of three (loop +, empty, loop -) the empty one pairs
// with the loop whose sense the field names, sigma = o sign(B_P). A step runs one class of triangles that
// share no bulk link and no husk column; the gas beat is: hop step, reconnection step (class t mod the class
// count), light beat.
//
// Exact statements, derived before any run:
// - husk E is unchanged by every move (t casts P's links with signs o C_P), so the light's drift and kick
//   are unchanged: the fast husk engine driven by the crossings' currents alone must equal the trit rule's
//   angles, counters and E on every beat, even though S and U differ
// - bulk Gauss holds: s moves by a curl, and one potential trit moves by a curl
// - each move is an involution (it depends only on its chain and on B_P, which it does not change); a step
//   is an involution; the run reverses (light back, the step again, the hop step again)
// - the literal form on t's own trit, (loop, u_t = 0) <-> (no loop, u_t = -+1), caps a triangle at one lap
//   per sense beyond the string's own (predicted: 2 laps then refusal), and a hole in the potential column
//   is erased by the light's next write, which loses information (predicted: irreversible with the light)
// - no reversible move can lower the equilibrium fill of independent string trits: a thermal gas on a
//   permutation of the states spends its time near the uniform measure, where a trit is nonzero 2/3 of the
//   time. The refusal gate below is the caller's; this argument says it may fail, and it is kept as posed
//
// DISCLOSED: one probe ran before these gates (tmp/recon-probe2.log): the forced loop at D = 8 made 285
// laps in 1,200 beats with the column move, 1 with none, 2 with the literal move and no light; the gas at
// D = 8 over 2,400 beats refused 31.5 percent of tries without the move and 34.4 percent with it, with
// 65.8 and 64.7 percent of strings nonzero. The gates were written after it and are the caller's.
//
// Gates, fixed before the first run of this file:
// I  involution, exhaustive on one triangle of each orientation (side 4, D 4): every string pattern (27),
//    every potential value in the window, B in {-1, 0, 1}: the move applied twice returns every trit, keeps
//    the husk flux on every husk link and the bulk divergence at every dock, and the column stays a
//    thermometer
// G  Gauss: the gas (a quarter of docks tried, golden and silver Weyl placement, the wave-form light from a
//    golden Weyl start), side 4, D = 8 and 11, 240 beats: 0 bulk and 0 husk violations at every beat
// Q  charge and the number of charged docks the same at every beat
// R  reversal: the 240 beats run back return every trit, 0 mismatches
// E  the light untouched: every reconnection step leaves the husk flux unchanged, and the fast husk engine
//    driven by the crossings' column-summed currents alone equals the trit rule's angles, counters and husk
//    flux on every beat (0 mismatches); 0 potential wraps
// T  every stored value in -1 .. 1 at every beat
// L  laps: a love forced around one bulk triangle (one crossing tried per beat, the next only after the
//    last succeeds) with the light on and the column move on that triangle every beat completes at least
//    100 laps in 1,200 beats at D = 8 and at D = 11, with 0 bulk Gauss violations and the run reversing to 0
//    mismatches (the attempts replayed backward); controls: 1 lap with no move, 2 with the literal move and
//    no light
// F  the gas's refusal falls: over 2,400 beats at D = 8 and 11, the refused share of tries with the move is
//    at most 0.9 of the share without it at both depths
// Reported: the literal move with the light (laps, and its reversal mismatches), the fill of strings, the
//   refused share in the first and last 240 beats, move counts (loops and slides), the U excursion.
// Status: pass if every gate passes, partial if I, G, Q, R, E, T and L pass, fail otherwise.
//
// Depth L2: an exact construction whose invariants hold by construction, checked on every beat.

import { experiment } from '@/test/scaffold/suite'
import { verdict } from '@/test/scaffold/verdict'
import { weyl } from '@/code/tool/weyl'
import {
  bulkFlux,
  bulkGaussViolations,
  columnSumLinks,
  columnValue,
  copyTritState,
  emptyTritState,
  emptyTally,
  huskFlux,
  huskGaussViolations,
  makeTritLight,
  readHusk,
  tritLightBeat,
  tritLightBeatBack,
  writeColumn,
  writeHusk,
  type TritLight,
  type TritState,
} from '@/code/rule/trit-column'
import { buildHopTable, cross, emptyHopTally, gasStep, hopStep, type HopTable } from '@/code/rule/trit-hop'
import { buildReconnectTable, emptyReconnectTally, huskFields, literalReconnect, reconnect, reconnectStep, type ReconnectTable } from '@/code/rule/trit-reconnect'
import { fastBeat, fastFlux, geometryOfBulk, makeHuskEngine } from '@/code/rule/trit-husk'

const TRIT_KEYS = ['vibe', 'angle', 'string', 'potential', 'counter', 'lag', 'spatial'] as const

function tritMismatches(a: TritState, b: TritState): number {
  let m = 0

  for (const key of TRIT_KEYS) {
    for (let i = 0; i < a[key].length; i++) m += a[key][i] === b[key][i] ? 0 : 1
  }

  return m
}

function outOfRange(s: TritState): number {
  let bad = 0

  for (const key of TRIT_KEYS) {
    for (const v of s[key]) bad += v >= -1 && v <= 1 ? 0 : 1
  }

  return bad
}

// the bulk divergence of the bulk flux at every dock
function bulkDivergence(light: TritLight, table: HopTable, state: TritState): Int32Array {
  const bulk = light.bulk
  const e = bulkFlux(light, state)
  const div = new Int32Array(bulk.docks)

  for (let l = 0; l < bulk.links; l++) {
    const x = Math.floor(l / 12)
    const y = bulk.neighbour[x * 24 + (table.rootOf[l % 12] ?? 0)] ?? 0

    div[x] = (div[x] ?? 0) + (e[l] ?? 0)
    div[y] = (div[y] ?? 0) - (e[l] ?? 0)
  }

  return div
}

// is every potential column a thermometer (|v| trits of sign v at the top, zeros below)
function thermometerFailures(light: TritLight, state: TritState): number {
  const bulk = light.bulk
  let bad = 0

  for (let p = 0; p < bulk.huskTriangles; p++) {
    const start = bulk.triColumnStart[p] ?? 0
    const length = (bulk.triColumnStart[p + 1] ?? 0) - start
    const v = columnValue(state.potential, bulk.triColumn, bulk.triColumnSign, start, length)
    const n = Math.abs(v)
    const s = Math.sign(v)
    let ok = true

    for (let i = 0; i < length; i++) {
      const want = i < n ? s * (bulk.triColumnSign[start + i] ?? 1) : 0

      if ((state.potential[bulk.triColumn[start + i] ?? 0] ?? 0) !== want) ok = false
    }

    bad += ok ? 0 : 1
  }

  return bad
}

function sectionI(): { cases: number; returned: number; fluxKept: number; divKept: number; thermometer: number; moved: number; loops: number } {
  const light = makeTritLight({ side: 4, depth: 4 })
  const table = buildReconnectTable(light)
  const hops = buildHopTable(light.bulk)
  const bulk = light.bulk
  const out = { cases: 0, returned: 0, fluxKept: 0, divKept: 0, thermometer: 0, moved: 0, loops: 0 }
  const chosen: number[] = []

  // one triangle of each orientation in its column, and each multiplicity
  for (let t = 0; t < bulk.triangles && chosen.length < 4; t++) {
    const kind = (table.orient[t] ?? 1) > 0 ? 0 : 1
    const n = bulk.multiplicity[table.husk[t] ?? 0] ?? 1
    const slot = kind + 2 * (n - 1)

    if (chosen[slot] === undefined) chosen[slot] = t
  }

  for (const t of chosen) {
    if (t === undefined) continue

    const p = table.husk[t] ?? 0
    const w = light.potentialWindow[p] ?? 0
    const start = bulk.triColumnStart[p] ?? 0
    const length = (bulk.triColumnStart[p + 1] ?? 0) - start
    const links = [0, 1, 2].map(j => bulk.triLinks[t * 3 + j] ?? 0)

    for (let pattern = 0; pattern < 27; pattern++) {
      for (let u = -w; u <= w; u++) {
        for (const b of [-1, 0, 1]) {
          const s = emptyTritState(light)

          links.forEach((l, j) => (s.string[l] = (Math.floor(pattern / 3 ** j) % 3) - 1))
          writeColumn(s.potential, bulk.triColumn, bulk.triColumnSign, start, length, u)

          const fields = new Int32Array(bulk.huskTriangles)

          fields[p] = b

          const before = copyTritState(s)
          const flux0 = huskFlux(light, readHusk(light, s))
          const div0 = bulkDivergence(light, hops, s)
          const tally = emptyReconnectTally()

          reconnect(table, s, t, fields, tally)

          const flux1 = huskFlux(light, readHusk(light, s))
          const div1 = bulkDivergence(light, hops, s)

          out.cases++
          out.moved += tally.moves
          out.loops += tally.loops
          out.fluxKept += flux0.every((v, i) => v === flux1[i]) ? 1 : 0
          out.divKept += div0.every((v, i) => v === div1[i]) ? 1 : 0
          out.thermometer += thermometerFailures(light, s) === 0 ? 1 : 0

          reconnect(table, s, t, fields)
          out.returned += tritMismatches(s, before) === 0 ? 1 : 0
        }
      }
    }
  }

  return out
}

// the gas start of E-FRC-0210; `cold` leaves the light at zero (added after the first run, reported only)
function start(light: TritLight, table: HopTable, density: number, cold = false): TritState {
  const s = emptyTritState(light)
  const h = readHusk(light, s)
  const d = light.bulk.depth

  for (let l = 0; l < h.angle.length && !cold; l++) {
    const n = light.window[l % 9] ?? 1

    h.angle[l] = Math.floor(weyl(l + 1) * n) - n / 2
  }

  for (let p = 0; p < h.potential.length && !cold; p++) {
    h.potential[p] = Math.floor(weyl(p + 7, Math.SQRT2 - 1) * 7) - 3
    h.counter[p] = Math.floor(weyl(p + 3) * light.q) - d
    h.lag[p] = Math.floor(weyl(p + 11) * light.q) - d
    h.spatial[p] = Math.floor(weyl(p + 13) * light.q) - d
  }

  writeHusk(light, s, h)

  const bulk = light.bulk

  for (let x = 0; x < bulk.docks; x++) {
    if (weyl(x + 1) >= density) continue

    const k = Math.floor(weyl(x + 1, Math.SQRT2 - 1) * 12)
    const v = weyl(x + 17, Math.SQRT2 - 1) < 0.5 ? 1 : -1
    const y = bulk.neighbour[x * 24 + (table.rootOf[k] ?? 0)] ?? 0
    const l = x * 12 + k

    if (s.vibe[x] !== 0 || s.vibe[y] !== 0 || s.string[l] !== 0 || x === y) continue

    s.vibe[x] = v
    s.vibe[y] = -v
    s.string[l] = v
  }

  return s
}

type GasRun = {
  bulkGauss: number
  huskGauss: number
  chargeChanges: number
  fluxChangedByMove: number
  engineMismatches: number
  potentialWraps: number
  range: number
  back: number
  crossings: number
  refused: number
  moves: number
  loops: number
  slides: number
  largestPotential: number
  // reported after the first run: the first beat with a potential wrap and the first with an engine mismatch
  firstWrapBeat: number
  firstMismatchBeat: number
}

function gasRun(depth: number, beats: number, cold = false): GasRun {
  const light = makeTritLight({ side: 4, depth, form: 'wave' })
  const table = buildHopTable(light.bulk)
  const rt = buildReconnectTable(light)
  const s0 = start(light, table, 0.25, cold)
  const s = copyTritState(s0)
  const engine = makeHuskEngine(geometryOfBulk(light.bulk), depth)
  const husk = readHusk(light, s)
  const engineFlux = new Int32Array(light.bulk.huskLinks)
  const tally = emptyHopTally()
  const rtally = emptyReconnectTally()
  const lightTally = emptyTally()
  const total0 = s.vibe.reduce((a, v) => a + v, 0)
  const charged0 = s.vibe.reduce((a, v) => a + (v === 0 ? 0 : 1), 0)
  const out: GasRun = { bulkGauss: 0, huskGauss: 0, chargeChanges: 0, fluxChangedByMove: 0, engineMismatches: 0, potentialWraps: 0, range: 0, back: 0, crossings: 0, refused: 0, moves: 0, loops: 0, slides: 0, largestPotential: 0, firstWrapBeat: -1, firstMismatchBeat: -1 }

  for (let t = 0; t < beats; t++) {
    const [k, phase] = gasStep(t)
    const stringBefore = columnSumLinks(light, s.string)

    hopStep(table, s, k, phase, tally)

    const stringAfter = columnSumLinks(light, s.string)

    for (let l = 0; l < light.bulk.huskLinks; l++) husk.string[l] = (husk.string[l] ?? 0) - ((stringBefore[l] ?? 0) - (stringAfter[l] ?? 0))

    const fluxBefore = huskFlux(light, readHusk(light, s))

    reconnectStep(rt, s, t % rt.classes, huskFields(light, s), rtally)

    const read = readHusk(light, s)
    const fluxAfter = huskFlux(light, read)

    out.fluxChangedByMove += fluxBefore.some((v, i) => v !== fluxAfter[i]) ? 1 : 0

    for (const v of read.potential) out.largestPotential = Math.max(out.largestPotential, Math.abs(v))

    const wrapsBefore = lightTally.potentialWraps
    const mismatchesBefore = out.engineMismatches

    tritLightBeat(light, s, lightTally)
    fastBeat(engine, husk)

    const after = readHusk(light, s)
    const tritFlux = huskFlux(light, after)

    fastFlux(engine, husk, engineFlux)

    for (let i = 0; i < after.angle.length; i++) out.engineMismatches += after.angle[i] === husk.angle[i] && tritFlux[i] === engineFlux[i] ? 0 : 1

    for (const key of ['counter', 'lag', 'spatial'] as const) {
      for (let i = 0; i < after[key].length; i++) out.engineMismatches += after[key][i] === husk[key][i] ? 0 : 1
    }

    if (out.firstWrapBeat < 0 && lightTally.potentialWraps > wrapsBefore) out.firstWrapBeat = t
    if (out.firstMismatchBeat < 0 && out.engineMismatches > mismatchesBefore) out.firstMismatchBeat = t

    out.bulkGauss += bulkGaussViolations(light, s)
    out.huskGauss += huskGaussViolations(light, columnSumLinks(light, bulkFlux(light, s)), s.vibe)
    out.range += outOfRange(s)

    const total = s.vibe.reduce((a, v) => a + v, 0)
    const charged = s.vibe.reduce((a, v) => a + (v === 0 ? 0 : 1), 0)

    out.chargeChanges += total === total0 && charged === charged0 ? 0 : 1
  }

  for (let t = beats - 1; t >= 0; t--) {
    const [k, phase] = gasStep(t)

    tritLightBeatBack(light, s)
    reconnectStep(rt, s, t % rt.classes, huskFields(light, s))
    hopStep(table, s, k, phase)
  }

  out.back = tritMismatches(s, s0)
  out.crossings = tally.crossings
  out.refused = tally.refused
  out.moves = rtally.moves
  out.loops = rtally.loops
  out.slides = rtally.slides
  out.potentialWraps = lightTally.potentialWraps

  return out
}

// the refusal comparison: the same start and schedule with and without the move
function refusal(depth: number, beats: number): Record<string, number> {
  const light = makeTritLight({ side: 4, depth, form: 'wave' })
  const table = buildHopTable(light.bulk)
  const rt = buildReconnectTable(light)
  const s0 = start(light, table, 0.25)
  const out: Record<string, number> = {}

  for (const on of [false, true]) {
    const s = copyTritState(s0)
    const all = emptyHopTally()
    const first = emptyHopTally()
    const last = emptyHopTally()
    const lightTally = emptyTally()

    for (let t = 0; t < beats; t++) {
      const [k, phase] = gasStep(t)
      const before = { c: all.crossings, r: all.refused }

      hopStep(table, s, k, phase, all)

      const window = t < 240 ? first : t >= beats - 240 ? last : undefined

      if (window) {
        window.crossings += all.crossings - before.c
        window.refused += all.refused - before.r
      }

      if (on) reconnectStep(rt, s, t % rt.classes, huskFields(light, s))

      tritLightBeat(light, s, lightTally)
    }

    let full = 0

    for (const v of s.string) full += v === 0 ? 0 : 1

    const name = on ? 'with' : 'without'
    const share = (x: { crossings: number; refused: number }): number => x.refused / Math.max(1, x.crossings + x.refused)

    out[`${name}_refusedShare`] = share(all)
    out[`${name}_refusedShareFirst240`] = share(first)
    out[`${name}_refusedShareLast240`] = share(last)
    out[`${name}_stringsNonzero`] = full / s.string.length
    out[`${name}_potentialWraps`] = lightTally.potentialWraps
  }

  return out
}

// a love forced around one bulk triangle; the fear sits three steps away at the end of a string
type LapMode = 'none' | 'column' | 'literal'

function laps(depth: number, mode: LapMode, lightOn: boolean, beats: number): { laps: number; refused: number; bulkGauss: number; back: number; largestPotential: number; potentialWraps: number } {
  const light = makeTritLight({ side: 4, depth, form: 'wave' })
  const table = buildHopTable(light.bulk)
  const rt: ReconnectTable = buildReconnectTable(light)
  const bulk = light.bulk
  const roots = bulk.roots
  let pair: [number, number, number] | undefined

  for (let a = 0; a < 12 && !pair; a++) {
    for (let b = 0; b < 12 && !pair; b++) {
      const sum = (roots[a] ?? []).map((v, i) => v + ((roots[b] ?? [])[i] ?? 0))
      const c = roots.findIndex(r => r.every((v, i) => v === (sum[i] ?? 0)))

      if (c >= 0) pair = [a, b, c]
    }
  }

  if (!pair) throw new Error('no closed first-root triangle')

  const [ka, kb, kc] = pair
  const x0 = 0
  const y1 = bulk.neighbour[x0 * 24 + (table.rootOf[ka] ?? 0)] ?? 0
  const want = new Set([x0 * 12 + ka, y1 * 12 + kb, x0 * 12 + kc])
  let tri = -1

  for (let t = 0; t < bulk.triangles && tri < 0; t++) {
    if ([0, 1, 2].every(j => want.has(bulk.triLinks[t * 3 + j] ?? -1))) tri = t
  }

  if (tri < 0) throw new Error('the loop is not a bulk triangle')

  const s = emptyTritState(light)

  s.vibe[x0] = 1

  let c = x0

  for (const k of [3, 3, 5]) {
    const l = c * 12 + k

    s.string[l] = (s.string[l] ?? 0) + 1
    c = bulk.neighbour[c * 24 + (table.rootOf[k] ?? 0)] ?? 0
  }

  s.vibe[c] = -1

  const s0 = copyTritState(s)
  const steps: [number, number][] = [
    [x0, ka],
    [y1, kb],
    [x0, kc],
  ]
  const attempts: number[] = []
  let phase = 0
  let done = 0
  let refused = 0
  let bulkGauss = 0
  let largestPotential = 0
  const lightTally = emptyTally()

  for (let t = 0; t < beats; t++) {
    const [x, k] = steps[phase] ?? [0, 0]
    const tally = emptyHopTally()

    attempts.push(phase)
    cross(table, s, x, k, tally)

    if (tally.crossings > 0) {
      phase = (phase + 1) % 3

      if (phase === 0) done++
    } else {
      refused++
    }

    if (mode === 'column') reconnect(rt, s, tri, huskFields(light, s))
    if (mode === 'literal') literalReconnect(s, light, tri)
    if (lightOn) tritLightBeat(light, s, lightTally)

    bulkGauss += bulkGaussViolations(light, s)

    const u = readHusk(light, s).potential[rt.husk[tri] ?? 0] ?? 0

    largestPotential = Math.max(largestPotential, Math.abs(u))
  }

  for (let t = beats - 1; t >= 0; t--) {
    const [x, k] = steps[attempts[t] ?? 0] ?? [0, 0]

    if (lightOn) tritLightBeatBack(light, s)
    if (mode === 'column') reconnect(rt, s, tri, huskFields(light, s))
    if (mode === 'literal') literalReconnect(s, light, tri)

    cross(table, s, x, k)
  }

  return { laps: done, refused, bulkGauss, back: tritMismatches(s, s0), largestPotential, potentialWraps: lightTally.potentialWraps }
}

export default experiment({
  id: 'gauge/trit-reconnect',
  code: 'E-FRC-0213',
  title:
    'the reconnection move: a closed string loop moves into its triangle\'s potential column through the thermometer front, the empty triangle paired with the loop whose sense the magnetic field names, keeping the husk flux on every link, so a circulating current runs lap after lap on string trits with Gauss exact, charge kept and the run reversible, while a thermal gas stays refused at the uniform-trit rate',
  category: 'gauge',
  substrates: ['3434'],
  depth: 'L2',
  paper: false,
  run() {
    const inv = sectionI()
    const runs = [8, 11].map(d => ({ d, r: gasRun(d, 240) }))
    const lapRuns = [8, 11].map(d => ({ d, column: laps(d, 'column', true, 1200) }))
    const none = laps(8, 'none', true, 1200)
    const literalDark = laps(8, 'literal', false, 1200)
    const literalLight = laps(8, 'literal', true, 1200)
    const refusals = [8, 11].map(d => ({ d, r: refusal(d, 2400) }))
    // added after the first run, reported only: the same gas from a cold light
    const colds = [8, 11].map(d => ({ d, r: gasRun(d, 240, true) }))
    const metrics: Record<string, number> = {}

    for (const { d, r } of colds) {
      for (const [key, value] of Object.entries(r)) metrics[`cold_D${d}_${key}`] = value
    }

    for (const [key, value] of Object.entries(inv)) metrics[`i_${key}`] = value

    for (const { d, r } of runs) {
      for (const [key, value] of Object.entries(r)) metrics[`gas_D${d}_${key}`] = value
    }

    for (const { d, column } of lapRuns) {
      for (const [key, value] of Object.entries(column)) metrics[`laps_D${d}_column_${key}`] = value
    }

    for (const [name, r] of [['none', none], ['literalNoLight', literalDark], ['literalLight', literalLight]] as const) {
      for (const [key, value] of Object.entries(r)) metrics[`laps_D8_${name}_${key}`] = value
    }

    for (const { d, r } of refusals) {
      for (const [key, value] of Object.entries(r)) metrics[`refusal_D${d}_${key}`] = value
    }

    const gates = {
      I: inv.returned === inv.cases && inv.fluxKept === inv.cases && inv.divKept === inv.cases && inv.thermometer === inv.cases && inv.moved > 0,
      G: runs.every(({ r }) => r.bulkGauss === 0 && r.huskGauss === 0),
      Q: runs.every(({ r }) => r.chargeChanges === 0),
      R: runs.every(({ r }) => r.back === 0),
      E: runs.every(({ r }) => r.fluxChangedByMove === 0 && r.engineMismatches === 0 && r.potentialWraps === 0 && r.moves > 0),
      T: runs.every(({ r }) => r.range === 0),
      L: lapRuns.every(({ column }) => column.laps >= 100 && column.bulkGauss === 0 && column.back === 0) && none.laps === 1 && literalDark.laps === 2,
      F: refusals.every(({ r }) => (r['with_refusedShare'] ?? 1) <= 0.9 * (r['without_refusedShare'] ?? 0)),
    }

    for (const [gate, ok] of Object.entries(gates)) metrics[`gate${gate}`] = ok ? 1 : 0

    const core = gates.I && gates.G && gates.Q && gates.R && gates.E && gates.T && gates.L
    const status = Object.values(gates).every(x => x) ? 'pass' : core ? 'partial' : 'fail'
    const pct = (x: number | undefined): string => ((x ?? 0) * 100).toFixed(1)

    return verdict({
      status,
      claim: `the column reconnection is an involution on all ${inv.cases} local cases (husk flux and bulk divergence kept, the column a thermometer), and in the gas at D = 8 and 11 (${runs.map(({ r }) => r.moves).join(' and ')} moves) Gauss is exact in bulk and husk (${runs.map(({ r }) => r.bulkGauss + r.huskGauss).join(', ')} violations), charge is kept, the run reverses to ${runs.map(({ r }) => r.back).join(', ')} mismatches and the light is untouched (${runs.map(({ r }) => r.engineMismatches).join(', ')} mismatches against the engine driven by the currents alone); a love forced around one bulk triangle completes ${lapRuns.map(({ column }) => column.laps).join(' and ')} laps in 1,200 beats (no move: ${none.laps}, the literal move without light: ${literalDark.laps}); the gas refuses ${refusals.map(({ r }) => `${pct(r['without_refusedShare'])} -> ${pct(r['with_refusedShare'])}`).join(' and ')} percent of tries without and with the move`,
      metrics,
      control: { noMoveLaps: none.laps, literalNoLightLaps: literalDark.laps, literalLightBack: literalLight.back },
      notes:
        'L2, exact integers, deterministic (golden and silver Weyl starts). FIRST RUN 2026-09-26 (tmp/frc0213.log, 18.7 s), FAIL on E and F, no gate moved. Second and third runs (tmp/frc0213-second.log, frc0213-third.log) added REPORTED metrics only (a cold-light gas, potential wraps in the refusal and lap runs, the first wrap and first engine-mismatch beats); every gated number is identical. PASSES: I, all 2,106 local cases of four triangles (both orientations, n_P 1 and 2, every string pattern, every potential in the window, B -1, 0, 1) return under the second application, keep the husk flux and the bulk divergence exactly, and leave the column a thermometer (976 cases move, 112 of them loops). G, Q, R, T: in the gas at D = 8 and 11 (94,976 and 105,006 moves, 16 and 15 percent loops, the rest slides) 0 bulk and 0 husk Gauss violations, charge kept, 0 trit mismatches after the run back, every trit in range. L: a love forced around one bulk triangle with the light on completes 285 laps at D = 8 and 314 at D = 11 in 1,200 beats (the maximum is 400), with 0 bulk Gauss violations and exact reversal; with no move it stops after 1 lap, and with the literal move (t\'s own potential trit) and no light after 2, as predicted. The literal move with the light makes 79 laps only because the light\'s next kick rewrites the holed column into a thermometer, which destroys information: that run reverses to 27,780 mismatches, as predicted. FAILS: E, the light untouched: every reconnection step left the husk flux unchanged (0 of 480 steps changed it), but the engine driven by the currents alone mismatched 967,277 and 951,819 values. The cause is the light, not the move: the one-level light (the trit-column light, E-FRC-0207) wraps its potential columns (window n_P D) in this gas 98,420 times in 2,400 beats WITHOUT the move (98,095 with it), and from a cold light too (7,133 in 240 beats at D = 8); a wrap is a flux jump of 2 n_P D + 1 on three links, its timing depends on U, and U is what the move shifts, so the first engine mismatch falls on exactly the beat of the first wrap in all four runs (beats 5, 11, 25, 36). E-FRC-0214 finds the wraps are the one-level light\'s carry heating: a static string at D = 8 wraps 514,610 times in 2,000 beats at one level and 0 times with the carries shaped to three levels, so the gate should pass on the shaped light, which is not yet built in the bulk. F, the refusal falls: it does not, 31.5 -> 34.4 percent at D = 8 and 31.5 -> 34.7 at D = 11, with 65.8 and 64.7 percent of strings nonzero, the uniform-trit value 2/3. As the header argued, a thermal gas on a permutation of the states sits near the uniform measure, where each string trit is nonzero 2/3 of the time whatever reversible move is added, so no reconnection can lower the equilibrium refusal (it lowers only the approach: 20 percent refused in the first 240 beats without the move is the gas still filling). THE DESIGN POINT: the move must write the potential COLUMN through its thermometer front, not t\'s own trit, and an involution on the three states (loop +, empty, loop -) can pair the empty triangle with only one loop, so the sense must come from outside the chain; the field B_P gives it, and in a steady current it names the sense the current is laying down (B and the lap signs: 489 positive, 628 negative, 83 zero readings in the probe, and laps still ran). The gas refusal needs a different remedy: a string of more than one trit per bulk link, or a husk string column.',
    })
  },
})
