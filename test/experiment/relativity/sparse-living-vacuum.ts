// A sparse living vacuum: the living-pair knit (code/rule/living-pair-knit, schedule 'alternate', unchanged) on a hot
// vacuum that stores a unit on ONE line of every dock, E-RLT-0077.
//
// THE PROBLEM (E-RLT-0075). The living-pair knit recovers all 14 quantum gates, but its hot vacuum stores a unit on all
// twelve lines of every dock, so between collisions every dock is full, and one lone vibe breaks the timing and melts
// the box (179,763 trits in the first period on side 9, the committed knit 33). After that run, probes found that a
// vacuum storing one line per dock keeps a bounded wake.
//
// DERIVED FIRST (code/measure/sparse-living-vacuum's header carries each step):
//  (a) A sparse pattern (a set of units: dock x stores +1 on line l) runs E-RLT-0074's exact period-6 cycle if and only
//      if every collision a vacuum vibe meets is the -1 coin map, which is condition (Z): at every dock y, the beat-1
//      occupation momentum sum_l r_l ([unit at (y - r_l, l)] - [unit at (y + r_l, l)]) is 0; and the neutral veto
//      refuses the two different units that meet on a line (condition (A), needed only where both units exist).
//  (b) Every translation-invariant pattern (the same lines on every dock) meets (Z) term by term. On an odd box a line's
//      units close along the whole line (invariance under 2 r is invariance under r), so a thinner pattern needs a
//      sublattice whose index divides the side, or momentum cancellation between lines at every dock: box-dependent.
//  (c) THE SIMPLEST PATTERN, chosen before any gated run: ONE_LINE, line 0 on every dock, the separated layout. The
//      RULE keeps all 1,152 coin maps; the STATE keeps only the stabilizer of the root of line 0 (48 elements, the store
//      is oriented), which is the spontaneous breaking E-RLT-0064's theorem requires.
//
// Gates, fixed before the first run (side 3 with the color weave's links, bind table, unless named):
//  G0 THE CONDITION: on the side-3 box, all 4,095 nonempty uniform line sets meet (Z) and (A) and run the exact cycle;
//     over every pattern tried (the 4,095, the 960 single-line sublattice patterns a . c = 0 mod 3, 120 Weyl patterns at
//     densities 1/12, 1/4, 1/2, and 12 single-line patterns on flat links with every stored point 0), the cycle is exact
//     exactly when (Z) and (A) hold (0 disagreements), with at least one non-uniform exact pattern and one failing one
//  G1 W(F4) and C on the sparse vacuum's states: both collisions commute with all 1,152 coin maps and with charge
//     conjugation on 162 sample docks (the golden fill on the one-line vacuum after 5 beats, the one-line vacuum after 1
//     beat), and all 1,152 box automorphisms commute with a beat of each parity (0 failures)
//  G2 reversal: 96 beats forward and back return every trit, token, place and point on three sparse starts; the motion
//     reversal T = S R and CPT (charge conjugation, the inversion with its cell map and links, and T) hold on them and
//     both parities (0 failures)
//  G3 charge, momentum and energy exact over 96 beats on two sparse starts; the held color through every collision (0
//     leaks over 48 beats) and no token sign flip at any meeting of an all-open 240-beat run
//  G4 THE LIVING VACUUM: on sides 3, 5, 7 and 9 the one-line vacuum meets (Z) and (A) and runs the exact cycle (period
//     6, every unit made on beats 0 and 3 mod 6, refused against its neighbour on 1 and 4, unmade on 2 and 5, the store
//     back); on side 3 with every token open, 24 beats give 8 partner and 8 cross meetings per unit and no stray one;
//     dock 0's vacuum pair (the battery's search) meets within 24 beats and at least 150 times in 480
//  G5 THE LONE WAKE on side 9 (every one of the 24 directions, 4 periods of 24 beats, trits off the vacuum run): the
//     love's largest wake per period at most the committed knit's 33, 160, 565, 1,508; bounded: for the love and the
//     fear the fourth period's largest at most 1.5 times the second's
//  G6 superposition (the clock amplitude on side 11, E-FRC-0159's item) under 1e-9, and the walls item quantized with a
//     nonzero settled wall (side 9)
// Verdict: pass if G0 to G6 hold; fail if G0 to G3 hold and G4, G5 or G6 does not; partial otherwise.
//
// PREDICTED before the first run: G0 to G4 pass (derived). G5 FAILS in its first clause: E-RLT-0075's post-run probe
// (tmp/live-probe3.ts, live-probe4.ts) already read the one-line vacuum's wake on side 9: a lone love orthogonal to the
// line stays bare (1 trit), one along it wakes 13 to 17 trits, one at 60 degrees about 245 to 264 per period, flat over
// four periods. So the wake is bounded but above the committed 33 and 160 in the first two periods. G6 not predicted.
//
// Reported, not gated: the wake per period by the angle between the love and the line (orthogonal, 60 degrees,
// along), the wake on sides 7 and 11, the two-line vacuum's wake (line 0 and the first line orthogonal to it), the walls
// item for each of the 12 single lines (the wall is along the first box axis, so the lines differ against it), and the
// state's stabilizer in W(F4).
//
// DISCLOSED: E-RLT-0075's probes (above) are the only numbers of this vacuum seen before this file; no new probe ran.
//
// FIRST RUN (119.7 s): fail, as predicted on G5's first clause, and on G6's walls clause (not predicted): G0 to G4 and
// superposition pass. AFTER THE FIRST RUN a probe (tmp/sparse-probe1.ts) read the wake beat by beat on sides 9, 13 and
// 17: the 60-degree wake grows 5, 19, 28, 36, 67, 134, 240, 333, 444 ... and saturates near 3 L^2 trits (245, 500, 860),
// so the flat per-period wake that passes G5's "bounded" clause is the torus filling a PLANE of docks, not a bounded
// dressing. That reading was added below (the wake per beat on side 17, the saturation over L^2 on sides 7, 9, 11),
// outside the verdict; no gate moved, and the rerun reproduces every gated number.
//
// Depth L2. DETERMINISM: golden fills, Weyl patterns (silver ratio), fixed layouts, no draw. The husk is not read here
// (a rule's vacuum and its bulk wake); the husk transport is E-RLT-0079's.

import { experiment } from '@/test/scaffold/suite'
import { verdict } from '@/test/scaffold/verdict'
import { rootsD4 } from '@/code/algebra/group/root-system'
import { makeColorWeave, type ColorWeave } from '@/code/rule/color-weave'
import { LINE_FIRSTS, OPPOSITE } from '@/code/rule/isometric-knit'
import { cloneStoreState, sameStoreState, storeCharge, storeEnergy, transformLinks, transformStoreState, type TokenStoreState } from '@/code/rule/token-store-knit'
import { livingBeat, livingBeatBack, livingCollide, livingMotionReversal, makeLivingKnit, separatedLayout, type LivingKnit, type LivingSchedule } from '@/code/rule/living-pair-knit'
import { makeLivingKernel } from '@/code/measure/living-pair-kernel'
import { goldenFill } from '@/code/measure/candidate-kernel'
import { weylF4DirectionPermutations } from '@/code/measure/coin-symmetry'
import { boxCellMap, d4BoxCell, d4BoxCoordinates, linearMapOf } from '@/code/substrate/d4-box'
import { weyl, SILVER } from '@/code/tool/weyl'
import { angleClass, boxStore, ONE_LINE, patternOf, sparseConditions, sparseLivingState, vacuumCycle, wakeSeries, type StorePattern } from '@/code/measure/sparse-living-vacuum'
import { additivityWorst, dressing, walls } from '@/code/measure/sparse-living-battery'

const ROOTS = rootsD4()
const SIDE_LENGTH = 3
const COMMITTED_LOVE_9 = [33, 160, 565, 1508]
const COMMITTED_FEAR_9 = [27, 163, 581, 1501]

const weave = makeColorWeave({ side: SIDE_LENGTH, table: 'bind' })
const cells = weave.mesh.cellCount
const slots = cells * 24
const tokens = slots * 2
const layout = separatedLayout(weave)
const oneStore = boxStore(cells, ONE_LINE)

const sparseStart = (scale: number): TokenStoreState => sparseLivingState({ ...goldenFill(slots, scale), store: oneStore, layout })
const sparseVacuum = (): TokenStoreState => sparseLivingState({ vibe: new Int8Array(slots), point: new Int8Array(slots), store: oneStore, layout })
const loneLove = (): TokenStoreState => {
  const s = sparseVacuum()

  s.vibe[13 * 24 + 5] = 1

  return s
}
const starts = (): TokenStoreState[] => [sparseStart(1.37), sparseStart(2.11), loneLove()]

function run(k: LivingKnit, s: TokenStoreState, beats: number, open?: Uint8Array): TokenStoreState {
  const o = open ?? new Uint8Array(s.point.length)
  let x = s

  for (let t = 0; t < beats; t++) x = livingBeat(k, x, o, t).state

  return x
}

// G0
function conditionScan(): { uniformExact: number; tried: number; disagreements: number; nonUniformExact: number; failing: number; sublatticeZ: number } {
  const kernel = makeLivingKernel(weave)
  const flatWeave: ColorWeave = { ...weave, links: new Int16Array(slots).fill(weave.moves.identity) }
  const flatKernel = makeLivingKernel(flatWeave)
  const zeroLayout = new Int8Array(cells * 12)
  let uniformExact = 0
  let tried = 0
  let disagreements = 0
  let nonUniformExact = 0
  let failing = 0
  let sublatticeZ = 0
  const check = (w: ColorWeave, k: typeof kernel, store: Int8Array, lay: Int8Array, uniform: boolean): boolean => {
    const c = sparseConditions(w, store, lay)
    const cycle = vacuumCycle(k, store, lay, c.bothLines)
    const predicted = c.momentumDocks === 0 && c.vetoFailures === 0

    tried++
    disagreements += predicted === cycle.exact ? 0 : 1
    failing += cycle.exact ? 0 : 1

    if (!uniform && cycle.exact) nonUniformExact++

    return cycle.exact
  }

  for (let mask = 1; mask < 4096; mask++) {
    const lines = Array.from({ length: 12 }, (_, l) => l).filter(l => (mask >> l) & 1)

    uniformExact += check(weave, kernel, boxStore(cells, patternOf(lines)), layout, true) ? 1 : 0
  }

  const coords = Array.from({ length: cells }, (_, x) => d4BoxCoordinates({ cell: x, side: SIDE_LENGTH }))

  for (let l = 0; l < 12; l++) {
    const step = d4BoxCoordinates({ cell: weave.mesh.neighbour(0, LINE_FIRSTS[l] as number), side: SIDE_LENGTH })

    for (let a = 1; a < 81; a++) {
      const form = [0, 1, 2, 3].map(k => Math.floor(a / 3 ** k) % 3)
      const on = (c: number[]): boolean => form.reduce((s, f, k) => s + f * (c[k] ?? 0), 0) % 3 === 0
      const store = new Int8Array(cells * 12)

      for (let x = 0; x < cells; x++) if (on(coords[x] as number[])) store[x * 12 + l] = 1

      sublatticeZ += on(step) ? 1 : 0
      check(weave, kernel, store, layout, false)
    }
  }

  for (let n = 0; n < 120; n++) {
    const density = [1 / 12, 1 / 4, 1 / 2][n % 3] as number
    const store = new Int8Array(cells * 12)

    for (let i = 0; i < store.length; i++) store[i] = weyl(n * store.length + i + 1, SILVER) < density ? 1 : 0

    check(weave, kernel, store, layout, false)
  }

  for (let l = 0; l < 12; l++) check(flatWeave, flatKernel, boxStore(cells, patternOf([l])), zeroLayout, false)

  return { uniformExact, tried, disagreements, nonUniformExact, failing, sublatticeZ }
}

// G1
function covariance(k: LivingKnit): { coinFailures: number; conjugationFailures: number; dockSamples: number; boxAutomorphisms: number; boxFailures: number; stateStabilizer: number; lineStabilizer: number } {
  const permutations = weylF4DirectionPermutations({ directions: ROOTS })
  const samples: TokenStoreState[] = []

  for (const [start, beats] of [
    [sparseStart(1.37), 5],
    [sparseVacuum(), 1],
  ] as [TokenStoreState, number][]) {
    const s = run(k, start, beats)

    for (let x = 0; x < cells; x++) {
      samples.push({
        vibe: s.vibe.slice(x * 24, x * 24 + 24),
        store: s.store.slice(x * 12, x * 12 + 12),
        token: s.token.slice(x * 24, x * 24 + 24),
        place: s.place.slice(x * 24, x * 24 + 24),
        point: s.point,
        label: s.label,
      })
    }
  }

  const failures = (g: readonly number[], sign: number): number => {
    let bad = 0

    for (const t of [0, 1]) {
      for (const x of samples) {
        const gx = transformStoreState(x, [0], g, sign)

        livingCollide(k, gx, 0, t)

        const cx = cloneStoreState(x)

        livingCollide(k, cx, 0, t)
        bad += sameStoreState(gx, transformStoreState(cx, [0], g, sign)) ? 0 : 1
      }
    }

    return bad
  }
  let coinFailures = 0

  for (const g of permutations) coinFailures += failures(g, 1)

  const conjugationFailures = failures(
    Array.from({ length: 24 }, (_, d) => d),
    -1,
  )
  const boxStart = run(k, sparseStart(2.11), 3)
  const vacuum = sparseVacuum()
  const none = new Uint8Array(tokens)
  let boxAutomorphisms = 0
  let boxFailures = 0
  let stateStabilizer = 0
  let lineStabilizer = 0

  for (const g of permutations) {
    const matrix = linearMapOf(g)
    const cellMap = matrix ? boxCellMap({ matrix, side: SIDE_LENGTH }) : undefined

    if (!cellMap) continue

    boxAutomorphisms++

    const kg: LivingKnit = { ...k, weave: { ...weave, links: transformLinks(weave.links, cellMap, g) } }

    for (const t of [0, 1]) {
      const lhs = livingBeat(kg, transformStoreState(boxStart, cellMap, g), none, t).state
      const rhs = transformStoreState(livingBeat(k, boxStart, none, t).state, cellMap, g)

      boxFailures += sameStoreState(lhs, rhs) ? 0 : 1
    }

    const image = transformStoreState(vacuum, cellMap, g).store

    stateStabilizer += image.every((v, i) => v === vacuum.store[i]) ? 1 : 0
    lineStabilizer += image.every((v, i) => Math.abs(v) === Math.abs(vacuum.store[i] as number)) ? 1 : 0
  }

  return { coinFailures, conjugationFailures, dockSamples: samples.length, boxAutomorphisms, boxFailures, stateStabilizer, lineStabilizer }
}

// G2
function reversal(schedule: LivingSchedule): { reverses: boolean; motionFailures: number; cptFailures: number } {
  const k = makeLivingKnit(weave, schedule)
  const none = new Uint8Array(tokens)
  let reverses = true

  for (const start of starts()) {
    let s = start

    for (let t = 0; t < 96; t++) s = livingBeat(k, s, none, t).state
    for (let t = 95; t >= 0; t--) s = livingBeatBack(k, s, none, t).state

    reverses = reverses && sameStoreState(s, start)
  }

  const permutations = weylF4DirectionPermutations({ directions: ROOTS })
  let inversionCells: number[] = []

  for (const g of permutations) {
    if (!g.every((image, d) => image === OPPOSITE[d])) continue

    const matrix = linearMapOf(g)

    inversionCells = matrix ? (boxCellMap({ matrix, side: SIDE_LENGTH }) ?? []) : []
  }

  const kp: LivingKnit = { ...k, weave: { ...weave, links: transformLinks(weave.links, inversionCells, OPPOSITE) } }
  let motionFailures = 0
  let cptFailures = 0

  for (const x of starts()) {
    for (const t of [0, 1]) {
      const lhs = livingMotionReversal(k, livingBeat(k, x, none, t).state, t)
      const rhs = livingBeatBack(k, livingMotionReversal(k, x, t + 1), none, t + 1).state

      motionFailures += sameStoreState(lhs, rhs) ? 0 : 1

      const m = transformStoreState(x, inversionCells, OPPOSITE, -1)
      const y = livingBeat(kp, livingMotionReversal(kp, m, t), none, t).state
      const undone = transformStoreState(livingMotionReversal(kp, y, t + 1), inversionCells, OPPOSITE, -1)

      cptFailures += sameStoreState(undone, livingBeatBack(k, x, none, t + 1).state) ? 0 : 1
    }
  }

  return { reverses, motionFailures, cptFailures: inversionCells.length === cells ? cptFailures : -1 }
}

// G3
function laws(k: LivingKnit): { exact: boolean; leaks: number; flips: number; meetings: number } {
  const none = new Uint8Array(tokens)
  const momentum = (st: TokenStoreState): number[] => {
    const p = [0, 0, 0, 0]

    for (let i = 0; i < st.vibe.length; i++) if (st.vibe[i] !== 0) (ROOTS[i % 24] as number[]).forEach((v, c) => (p[c] = (p[c] as number) + v))

    return p
  }
  let exact = true

  for (const start of [sparseStart(1.37), loneLove()]) {
    let s = start
    const q0 = storeCharge(s)
    const e0 = storeEnergy(s)
    const p0 = momentum(s)

    for (let t = 0; t < 96; t++) {
      s = livingBeat(k, s, none, t).state
      exact = exact && storeCharge(s) === q0 && storeEnergy(s) === e0 && momentum(s).every((v, c) => v === p0[c])
    }
  }

  const content = (s: TokenStoreState, x: number): number => {
    let w = 0
    let qx = 0
    let qy = 0

    for (let d = 0; d < 24; d++) {
      const v = s.vibe[x * 24 + d] as number

      if (v === 0) continue

      const p = s.point[s.token[x * 24 + d] as number] as number

      w += v
      qx += v * (p % 3)
      qy += v * Math.floor(p / 3)
    }

    const m = (v: number): number => ((v % 3) + 3) % 3

    return m(w) * 9 + m(qx) * 3 + m(qy)
  }
  let s = sparseStart(1.37)
  let leaks = 0

  for (let t = 0; t < 48; t++) {
    const probe = cloneStoreState(s)

    for (let x = 0; x < cells; x++) {
      const before = content(probe, x)

      livingCollide(k, probe, x, t)
      leaks += content(probe, x) === before ? 0 : 1
    }

    s = livingBeat(k, s, none, t).state
  }

  const all = new Uint8Array(tokens).fill(1)
  const last = new Int8Array(tokens)
  let flips = 0
  let meetings = 0

  s = sparseStart(1.37)

  for (let t = 0; t < 240; t++) {
    const r = livingBeat(k, s, all, t)

    r.record.meetings.forEach(([a, b], m) => {
      const [sa, sb] = r.record.signs?.[m] ?? [1, 1]

      flips += (last[a] !== 0 && last[a] !== sa ? 1 : 0) + (last[b] !== 0 && last[b] !== sb ? 1 : 0)
      last[a] = sa
      last[b] = sb
      meetings++
    })
    s = r.state
  }

  return { exact, leaks, flips, meetings }
}

// G4
function partnerMeetings(k: LivingKnit, beats: number): { partner: number; across: number; stray: number } {
  const all = new Uint8Array(tokens).fill(1)
  let s = sparseVacuum()
  let partner = 0
  let across = 0
  let stray = 0

  for (let t = 0; t < beats; t++) {
    const r = livingBeat(k, s, all, t)

    for (const [a, b] of r.record.meetings) {
      const own = a >= slots && b >= slots && Math.floor((a - slots) / 2) === Math.floor((b - slots) / 2)

      if (t % 3 === 2 && own) partner++
      else if (t % 3 === 1 && !own) across++
      else stray++
    }

    s = r.state
  }

  return { partner, across, stray }
}

function vacuumPair(k: LivingKnit): { pair: number[]; kind: number; meetings: number } {
  const openOf = (pair: number[]): Uint8Array => {
    const o = new Uint8Array(tokens)

    for (const t of pair) o[t] = 1

    return o
  }
  const meetingsIn = (pair: number[], beats: number): number => {
    let s = sparseVacuum()
    let n = 0

    for (let t = 0; t < beats; t++) {
      const r = livingBeat(k, s, openOf(pair), t)

      n += r.record.meetings.length
      s = r.state
    }

    return n
  }

  for (let kind = 0; kind < 2; kind++) {
    for (let l = 0; l < 12; l++) {
      const f = LINE_FIRSTS[l] as number
      const pair = kind === 0 ? [f, OPPOSITE[f] as number] : [slots + 2 * l, slots + 2 * l + 1]

      if (meetingsIn(pair, 24) > 0) return { pair, kind, meetings: meetingsIn(pair, 480) }
    }
  }

  return { pair: [], kind: -1, meetings: 0 }
}

function sideVacuum(side: number, pattern: StorePattern): { violations: number; momentumDocks: number; exact: boolean; period: number; tallies: string } {
  const w = side === SIDE_LENGTH ? weave : makeColorWeave({ side, table: 'bind' })
  const lay = side === SIDE_LENGTH ? layout : separatedLayout(w)
  const store = boxStore(w.mesh.cellCount, pattern)
  const c = sparseConditions(w, store, lay)
  const cycle = vacuumCycle(makeLivingKernel(w), store, lay, c.bothLines)

  return { violations: c.vetoFailures, momentumDocks: c.momentumDocks, exact: cycle.exact, period: cycle.period, tallies: cycle.tallies }
}

// the wake per period by the angle class of the lone love's direction against line 0
function wakeByClass(d: ReturnType<typeof dressing>): number[][] {
  const out = [0, 1, 2].map(() => [0, 0, 0, 0])

  d.sequences.forEach((seq, direction) => {
    const c = angleClass(direction, 0)

    seq.forEach((v, t) => {
      const p = Math.floor(t / 24)

      out[c]![p] = Math.max(out[c]![p] ?? 0, v)
    })
  })

  return out
}

export default experiment({
  id: 'relativity/sparse-living-vacuum',
  code: 'E-RLT-0077',
  title:
    "a sparse living vacuum, fail (the lone wake, the walls): a pattern of stored units runs the living-pair knit's exact period-6 cycle exactly when every dock's beat-1 occupation momentum is zero (condition Z) and the veto separates neighboring units (A), 0 disagreements over 5,187 patterns, all 4,095 uniform line sets exact; the simplest, one line on every dock, keeps W(F4) as a rule (0 failures over 1,152 coin maps and box automorphisms) while its state keeps 48, C, reversal, motion reversal and CPT, and its vacuum pairs meet (160 in 480 beats); superposition holds (2e-16), but a lone love at 60 degrees to the line wakes 266 trits in the first period on side 9 (committed 33; orthogonal 1, along 23), a wake that fills a plane of docks until the torus stops it (about 3 L^2), and the walls item is quantized for only the 6 of 12 lines lying in the wall",
  category: 'relativity',
  substrates: ['3434'],
  depth: 'L2',
  paper: false,
  run() {
    const started = Date.now()
    const log = (what: string): void => console.error(`${what} ${Math.round((Date.now() - started) / 1000)}s`)
    const k = makeLivingKnit(weave)
    const scan = conditionScan()

    log('G0')

    const cov = covariance(k)

    log('G1')

    const rev = reversal('alternate')
    const law = laws(k)

    log('G2 G3')

    const boxes = [3, 5, 7, 9].map(side => ({ side, ...sideVacuum(side, ONE_LINE) }))
    const partners = partnerMeetings(k, 24)
    const pair = vacuumPair(k)

    log('G4')

    const love9 = dressing(ONE_LINE, 9, 1)
    const fear9 = dressing(ONE_LINE, 9, -1)
    const love7 = dressing(ONE_LINE, 7, 1)
    const love11 = dressing(ONE_LINE, 11, 1)

    log('G5')

    const additivity = additivityWorst(ONE_LINE)
    const wall = walls(ONE_LINE)

    log('G6')

    // readings
    const r0 = ROOTS[LINE_FIRSTS[0] as number] as number[]
    const ortho = LINE_FIRSTS.findIndex(f => (ROOTS[f] as number[]).reduce((s, x, i) => s + x * (r0[i] ?? 0), 0) === 0)
    const twoLines = patternOf([0, ortho])
    const love9Two = dressing(twoLines, 9, 1)
    const lineWalls = Array.from({ length: 12 }, (_, l) => walls(patternOf([l])))
    const classes = wakeByClass(love9)
    // added after the first run: the 60-degree and along wakes per beat on side 17 (no wrap for the first beats)
    const w17 = makeColorWeave({ side: 17, table: 'bind' })
    const k17 = makeLivingKernel(w17)
    const center17 = d4BoxCell({ coordinates: [8, 8, 8, 8], side: 17 })
    const sixty = Array.from({ length: 24 }, (_, e) => e).find(e => angleClass(e, 0) === 1) as number
    const alongLine = Array.from({ length: 24 }, (_, e) => e).find(e => angleClass(e, 0) === 2) as number
    const wake17 = wakeSeries(k17, boxStore(w17.mesh.cellCount, ONE_LINE), separatedLayout(w17), center17 * 24 + sixty, 1, 40)
    const along17 = wakeSeries(k17, boxStore(w17.mesh.cellCount, ONE_LINE), separatedLayout(w17), center17 * 24 + alongLine, 1, 40)
    const saturation = [
      [7, love7.periodLargest[3] ?? 0],
      [9, love9.periodLargest[3] ?? 0],
      [11, love11.periodLargest[3] ?? 0],
    ].map(([side, v]) => (v as number) / ((side as number) * (side as number)))

    log('readings')

    const units = cells
    const g0 = scan.uniformExact === 4095 && scan.disagreements === 0 && scan.nonUniformExact > 0 && scan.failing > 0
    const g1 = cov.coinFailures === 0 && cov.conjugationFailures === 0 && cov.boxAutomorphisms === 1152 && cov.boxFailures === 0
    const g2 = rev.reverses && rev.motionFailures === 0 && rev.cptFailures === 0
    const g3 = law.exact && law.leaks === 0 && law.flips === 0 && law.meetings > 0
    const g4 =
      boxes.every(b => b.violations === 0 && b.momentumDocks === 0 && b.exact) &&
      partners.partner === 8 * units &&
      partners.across === 8 * units &&
      partners.stray === 0 &&
      pair.pair.length === 2 &&
      pair.meetings >= 150
    const loveUnder = love9.periodLargest.every((x, p) => x <= (COMMITTED_LOVE_9[p] ?? 0))
    const bounded = [love9, fear9].every(d => (d.periodLargest[3] ?? 0) <= 1.5 * (d.periodLargest[1] ?? 0))
    const g5 = loveUnder && bounded
    const g6 = additivity < 1e-9 && wall.quantized && wall.settledMax > 0
    const instruments = g0 && g1 && g2 && g3
    const status = instruments ? (g4 && g5 && g6 ? 'pass' : 'fail') : 'partial'
    const per = (xs: readonly number[]): string => xs.join(', ')
    const seconds = (Date.now() - started) / 1000
    const metrics: Record<string, number> = {
      uniformPatternsExact: scan.uniformExact,
      patternsTried: scan.tried,
      conditionDisagreements: scan.disagreements,
      nonUniformExact: scan.nonUniformExact,
      patternsFailing: scan.failing,
      sublatticePatternsMeetingZ: scan.sublatticeZ,
      coinMapFailures: cov.coinFailures,
      chargeConjugationFailures: cov.conjugationFailures,
      dockSamples: cov.dockSamples,
      boxAutomorphisms: cov.boxAutomorphisms,
      boxAutomorphismFailures: cov.boxFailures,
      stateStabilizer: cov.stateStabilizer,
      lineStabilizer: cov.lineStabilizer,
      reverses: rev.reverses ? 1 : 0,
      motionReversalFailures: rev.motionFailures,
      cptFailures: rev.cptFailures,
      lawsExact: law.exact ? 1 : 0,
      heldColorLeaks: law.leaks,
      signFlips: law.flips,
      allOpenMeetings: law.meetings,
      ...Object.fromEntries(boxes.flatMap(b => [
        [`side${b.side}_vetoViolations`, b.violations],
        [`side${b.side}_momentumDocks`, b.momentumDocks],
        [`side${b.side}_period`, b.period],
        [`side${b.side}_exact`, b.exact ? 1 : 0],
      ])),
      partnerMeetings: partners.partner,
      acrossMeetings: partners.across,
      strayMeetings: partners.stray,
      vacuumPairKind: pair.kind,
      vacuumPairFirst: pair.pair[0] ?? -1,
      vacuumPairSecond: pair.pair[1] ?? -1,
      vacuumPairMeetings480: pair.meetings,
      ...Object.fromEntries(love9.periodLargest.map((x, p) => [`side9LovePeriod${p + 1}`, x])),
      ...Object.fromEntries(fear9.periodLargest.map((x, p) => [`side9FearPeriod${p + 1}`, x])),
      ...Object.fromEntries(love9.periodLargestVibes.map((x, p) => [`side9LoveVibesPeriod${p + 1}`, x])),
      ...Object.fromEntries(love7.periodLargest.map((x, p) => [`side7LovePeriod${p + 1}`, x])),
      ...Object.fromEntries(love11.periodLargest.map((x, p) => [`side11LovePeriod${p + 1}`, x])),
      ...Object.fromEntries(love9Two.periodLargest.map((x, p) => [`twoLinesSide9LovePeriod${p + 1}`, x])),
      ...Object.fromEntries(classes.flatMap((xs, c) => xs.map((x, p) => [`side9LoveClass${c}Period${p + 1}`, x]))),
      protectedSpecies: love9.protectedSpecies,
      straightLoves: love9.straight,
      straightFears: fear9.straight,
      additivityWorst: additivity,
      wallQuantized: wall.quantized ? 1 : 0,
      wallSettledMax: wall.settledMax,
      wallSettledMaxVibes: wall.settledMaxVibes,
      linesWithQuantizedWall: lineWalls.filter(w => w.quantized && w.settledMax > 0).length,
      ...Object.fromEntries(lineWalls.map((w, l) => [`line${l}_wallSettledMax`, w.quantized ? w.settledMax : -w.settledMax])),
      orthogonalLine: ortho,
      ...Object.fromEntries(wake17.map((v, t) => [`side17SixtyWakeBeat${t + 1}`, v])),
      ...Object.fromEntries(along17.map((v, t) => [`side17AlongWakeBeat${t + 1}`, v])),
      saturationOverSideSquared7: saturation[0] ?? 0,
      saturationOverSideSquared9: saturation[1] ?? 0,
      saturationOverSideSquared11: saturation[2] ?? 0,
      seconds,
    }

    return verdict({
      status,
      claim: `on the living-pair knit a hot vacuum storing one line per dock runs the exact period-6 cycle (sides 3 to 9: ${boxes.map(b => b.period).join(', ')}; made, refused, unmade per beat ${boxes[0]?.tallies}) under the derived condition (Z) (zero beat-1 momentum at every dock) with the veto's (A) (${scan.disagreements} disagreements over ${scan.tried} patterns, ${scan.uniformExact} of 4,095 uniform line sets exact), keeps W(F4) as a rule (${cov.coinFailures} failures over 1,152 coin maps, ${cov.boxFailures} over ${cov.boxAutomorphisms} box automorphisms) while the state keeps ${cov.stateStabilizer} of them, C, reversal, motion reversal (${rev.motionFailures}) and CPT (${rev.cptFailures}), and its vacuum pairs meet (${pair.meetings} in 480 beats); a lone love's largest wake per period on side 9 is ${per(love9.periodLargest)} trits (committed 33, 160, 565, 1,508; orthogonal ${per(classes[0] ?? [])}, 60 degrees ${per(classes[1] ?? [])}, along ${per(classes[2] ?? [])}), the fear's ${per(fear9.periodLargest)}; superposition ${additivity.toExponential(2)}, walls ${wall.quantized ? 'quantized' : 'not quantized'} (${wall.settledMax} trits)`,
      metrics,
      control: { committedSide9LovePeriod1: COMMITTED_LOVE_9[0] ?? 0, committedSide9LovePeriod4: COMMITTED_LOVE_9[3] ?? 0, committedSide9FearPeriod1: COMMITTED_FEAR_9[0] ?? 0 },
      notes: `L2. Gates: G0 ${g0}, G1 ${g1}, G2 ${g2}, G3 ${g3}, G4 ${g4}, G5 ${g5} (love under the committed ${loveUnder}, bounded ${bounded}), G6 ${g6}. Condition scan: ${scan.tried} patterns, ${scan.failing} not exact, ${scan.nonUniformExact} non-uniform exact, ${scan.sublatticeZ} of 960 sublattice patterns meet (Z). The state's stabilizer: ${cov.stateStabilizer} coin maps keep the oriented store, ${cov.lineStabilizer} keep the stored line. Wake on side 9 by angle to the line (per period): orthogonal ${per(classes[0] ?? [])}, 60 degrees ${per(classes[1] ?? [])}, along ${per(classes[2] ?? [])}; love in vibes ${per(love9.periodLargestVibes)}; side 7 love ${per(love7.periodLargest)} (committed 33, 131, 420, 1,204); side 11 love ${per(love11.periodLargest)} (committed 33, 209, 755, 2,241); fear side 9 ${per(fear9.periodLargest)} (committed 27, 163, 581, 1,501). Two orthogonal lines (0 and ${ortho}): side-9 love ${per(love9Two.periodLargest)}. Walls per line (settled trits, negative when not quantized): ${lineWalls.map(w => (w.quantized ? w.settledMax : -w.settledMax)).join(', ')}. ADDED AFTER THE FIRST RUN (a reading): the 60-degree wake per beat on side 17, ${wake17.join(' ')}; along the line, ${along17.join(' ')}; the fourth-period wake over L^2 on sides 7, 9, 11: ${saturation.map(v => v.toFixed(2)).join(', ')}. The wake fills a plane of docks until the torus stops it: it is not a bounded dressing. ${seconds.toFixed(1)} s.`,
    })
  },
})
