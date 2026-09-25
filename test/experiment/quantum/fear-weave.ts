// The fear beat inside the lattice: the cube-root swap phase run as a step of the color weave, with the
// loves and fears of a whole riding the role points the lattice moves (code/rule/fear-weave).
//
// E-FRC-0127 ran the fear beat on a standalone grid of 81 weights. Here the lattice decides everything:
// the committed turning weave (pair table, hop kept) moves the vibes on the side-3 D4 box, streaming
// carries each role point along its link and moves it by the link's grid move, and the one-third turn acts
// only where two vibes of the whole meet on a line. Two wholes of two tokens, each in the product state
// |0>|1> (nine loves, no fear), both found by the run rather than chosen:
// - the vacuum whole: the first line of cell 0 whose two tokens, a pair made together from calm, meet
//   again within 24 beats
// - the matter whole: on a golden-ratio fill of fears, calms and loves, the pair of cell-0 tokens that
//   meets most often in 240 beats (one classical run records every meeting, since the classical layer does
//   not depend on the whole)
//
// Gates, fixed before the first run:
// - phi = pi is the color weave: with every token open, the role field equals code/rule/color-weave's at
//   every slot for 24 beats, with meetings
// - reversal: 96 beats forward and back restore the vibes, tokens, points and every weight exactly
// - charge: the vibe sum and love minus fear (the whole's units) are the same after every beat
// - purity, exact in integers: 9 sum n^2 = N^2 after every beat, the pure-state identity sum W^2 = 1/9 of
//   two roles, so love plus fear is at most 3 N and the share of fear at most 1/3
// - gauge: an independent change of role frame in every cell, links changed to match, commutes with the
//   whole rule (0 mismatches over 48 beats). Control: SUM, a Clifford two-role move that is not
//   color-blind, at the meetings: mismatches
// - with the fear beat off (phi = pi) no fear ever appears and the units stay 9
// - grain, on the vacuum whole: on the live link field the units grow past the flat field's (every link
//   the identity, where U(2 pi / 3)^3 = 1 bounds them), and a whole of 9 x 4^m units is refused at some
//   meeting, never rounded
//
// The first run failed the grain gates on the vacuum whole, and the failure stands: the pair made together
// shuttles round the 3-cycle of its own line, meets every third beat or so, and between meetings feels
// the loop's holonomy H on one token and H^-1 on the other. Its units never pass 36 = 4 x 9 on either
// field, so no whole of 36 units or more is ever refused. The matter whole (it also stays at 36) and a
// survey were added after that run: every pair of cell-0 tokens that meets in 480 beats, in the vacuum and
// in matter, from one classical run each, with the number of meetings, the number whose loop Pb^-1 Pa is
// not the identity, and the units reached; then the matter pair that reaches the most units, studied in
// full. The survey is checked against the direct runs of the two wholes. The same run found a harness
// error, corrected: the gauge comparison read the classical point slot of the open tokens, which the rule
// never uses.
//
// Added after the three-trit color law was adopted (E-QTM-0102): the color mode, the singlet phase where
// a love meets a fear and the swap phase where like vibes meet, each meeting's kernel chosen by the vibes
// it recorded, on the same three wholes and records. Its gates were fixed before its first run: reversal
// and love minus fear in fixed units of 9 x 4^200 x 3^200, purity, fear share at most 1/3, 0 frame
// mismatches, no fear with the fear beat off. The first run of that section failed reversal because the
// backward record paired each meeting's vibes with the exchanged tokens; the record was corrected in
// code/rule/fear-weave (a harness error, not a rule change), and the swap-phase numbers above are
// unchanged by it, since that kernel does not depend on which token comes first.
//
// Reported: units, loves, fears, share of fear and negativity per meeting for both wholes and both fields,
// the first refused meeting for each whole size, and the cost of opening the vacuum: every token of the
// box in the whole, one colored token among roles all at one grid point, joint points holding weight.
//
// Depth L2: a constructed rule on the committed lattice against stated gates.

import { experiment } from '@/test/scaffold/suite'
import { verdict } from '@/test/scaffold/verdict'
import { makeColorWeave, colorBeat } from '@/code/rule/color-weave'
import {
  advanceWhole,
  fearBeat,
  fearBeatBack,
  makeLattice,
  meetingKernel,
  fearKernels,
  type FearKernels,
  moveCoordinate,
  reduceWhole,
  swapPhase,
  wholeLovesAndFears,
  wholeUnits,
  type BeatRecord,
  type Lattice,
  type Whole,
} from '@/code/rule/fear-weave'
import { operator } from '@/code/measure/grid-weights'

const GOLDEN = (Math.sqrt(5) - 1) / 2
const OMEGA = (2 * Math.PI) / 3
const SIDE = 3
const MATTER_SCALE = 2.11
const SEARCH_BEATS = 240
const GRAIN_BEATS = 480
const REVERSAL_BEATS = 96
const GAUGE_BEATS = 48
const OPEN_BEATS = 24
const OPEN_CAP = 200000

function sumGate() {
  const u = operator(9)

  for (let a = 0; a < 3; a++) {
    for (let b = 0; b < 3; b++) {
      u.re[(3 * a + ((a + b) % 3)) * 9 + (3 * a + b)] = 1
    }
  }

  return u
}

// the product of role basis states |j>: the three points (j, s) of each role, one unit each
function basisWhole(tokens: readonly number[], digits: readonly number[]): Whole {
  const weight = new Array<bigint>(9 ** tokens.length).fill(0n)

  for (let i = 0; i < weight.length; i++) {
    const on = tokens.every((_, c) => Math.floor((Math.floor(i / 9 ** (tokens.length - 1 - c)) % 9) / 3) === digits[c])

    weight[i] = on ? 1n : 0n
  }

  return { tokens, weight }
}

type Row = { units: bigint; loves: bigint; fears: bigint }

export default experiment({
  id: 'quantum/fear-weave',
  code: 'E-QTM-0099',
  title:
    'the fear beat inside the lattice: the cube-root swap phase acts where two vibes of a whole meet on a line of the committed turning weave, the classical steps carry the loves and fears by permuting role points, and the rule is the color weave exactly with the fear beat off, reverses exactly, keeps love minus fear, keeps the whole pure in integers so fear stays under a third, and commutes with a change of role frame in every cell; the grain a whole spends depends on the links it crosses, bounded for a pair made together in the vacuum',
  category: 'quantum',
  substrates: ['3434'],
  depth: 'L2',
  paper: false,
  run() {
    const weave = makeColorWeave({ side: SIDE, table: 'pair' })
    const { mesh, moves, opposite } = weave
    const slots = mesh.cellCount * 24
    const liveLinks = weave.links
    const flatLinks = new Int16Array(slots).fill(moves.identity)
    const kThird = meetingKernel(swapPhase(OMEGA)) ?? []
    const kPi = meetingKernel(swapPhase(Math.PI)) ?? []
    const kThirdBack = meetingKernel(swapPhase(-OMEGA)) ?? []
    const kSum = meetingKernel(sumGate()) ?? []
    const kernelsExact = [kThird, kPi, kThirdBack, kSum].every(k => k.length === 81)
    const allOpen = new Uint8Array(slots).fill(1)
    // the swap phase leaves every joint point with x = y alone
    const diagonalFixed = Array.from({ length: 9 }, (_, x) => x * 9 + x).every(c => kThird.every((row, r) => (row[c] ?? 0) === (r === c ? 4 : 0)))
    const openOf = (tokens: readonly number[]): Uint8Array => {
      const open = new Uint8Array(slots)

      for (const t of tokens) {
        open[t] = 1
      }

      return open
    }
    const golden = (scale: number): { vibe: Int8Array; point: Int8Array } => {
      const vibe = new Int8Array(slots)
      const point = new Int8Array(slots)

      for (let i = 0; i < slots; i++) {
        const u = ((i + 1) * GOLDEN * scale) % 1

        vibe[i] = u < 0.3 ? -1 : u < 0.6 ? 0 : 1
        point[i] = Math.floor(((i + 3) * GOLDEN * scale * 9) % 9)
      }

      return { vibe, point }
    }
    const vacuum = { vibe: new Int8Array(slots), point: new Int8Array(slots) }
    const matter = golden(MATTER_SCALE)

    // 1. phi = pi is the color weave: every token open, a delta tracked through the meeting kernel
    let equivalenceMismatch = 0
    let equivalenceMeetings = 0

    {
      const start = golden(1.37)
      let lattice = makeLattice(start)
      const delta = Int8Array.from(start.point)
      let state = { vibe: Int8Array.from(start.vibe), role: Int8Array.from(start.point), flow: new Int32Array(slots) }

      for (let t = 0; t < 24; t++) {
        const r = fearBeat({ weave, links: liveLinks, lattice, open: allOpen, t })

        lattice = r.lattice

        for (const [ta, tb] of r.record.meetings) {
          const column = (delta[ta] ?? 0) * 9 + (delta[tb] ?? 0)
          const target = kPi.findIndex(row => row[column] === 4)

          equivalenceMeetings++
          delta[ta] = Math.floor(target / 9)
          delta[tb] = target % 9
        }

        for (const [tk, g] of r.record.crossings) {
          delta[tk] = moves.act[g]?.[delta[tk] ?? 0] ?? 0
        }

        state = colorBeat(weave, state, t)

        for (let s = 0; s < slots; s++) {
          equivalenceMismatch += (delta[lattice.token[s] ?? 0] ?? 0) === state.role[s] ? 0 : 1
          equivalenceMismatch += lattice.vibe[s] === state.vibe[s] ? 0 : 1
        }
      }
    }

    // 2. the wholes
    const recordsOf = (background: { vibe: Int8Array; point: Int8Array }, links: Int16Array, open: Uint8Array, beats: number): BeatRecord[] => {
      let lattice = makeLattice(background)
      const out: BeatRecord[] = []

      for (let t = 0; t < beats; t++) {
        const r = fearBeat({ weave, links, lattice, open, t })

        lattice = r.lattice
        out.push(r.record)
      }

      return out
    }

    let vacuumPair: number[] = []

    for (let d = 0; d < 24 && vacuumPair.length === 0; d++) {
      const o = opposite[d] ?? d

      if (o > d && recordsOf(vacuum, liveLinks, openOf([d, o]), 24).some(r => r.meetings.length > 0)) {
        vacuumPair = [d, o]
      }
    }

    const cell0 = new Uint8Array(slots)

    for (let s = 0; s < 24; s++) {
      cell0[s] = 1
    }

    const meetingCount = new Map<string, number>()

    for (const record of recordsOf(matter, liveLinks, cell0, SEARCH_BEATS)) {
      for (const [a, b] of record.meetings) {
        const key = `${Math.min(a, b)},${Math.max(a, b)}`

        meetingCount.set(key, (meetingCount.get(key) ?? 0) + 1)
      }
    }

    const matterPair = ([...meetingCount.entries()].sort((x, y) => y[1] - x[1] || (x[0] < y[0] ? -1 : 1))[0]?.[0] ?? '0,1').split(',').map(Number)

    const runGrain = (tokens: number[], records: BeatRecord[], kernel4: number[][], color?: FearKernels): { rows: Row[]; pure: boolean; meetings: number } => {
      let whole: Whole | null = basisWhole(tokens, [0, 1])
      const rows: Row[] = []
      let pure = true
      let meetings = 0

      for (const record of records) {
        whole = advanceWhole({ weave, whole: whole!, record, kernel4, color, fixed: false, forward: true })

        const units = wholeUnits(whole!)
        const squares = whole!.weight.reduce((s, w) => s + w * w, 0n)

        pure = pure && 9n * squares === units * units

        if (record.meetings.length > 0) {
          meetings += record.meetings.length
          rows.push({ units, ...wholeLovesAndFears(whole!) })
        }
      }

      return { rows, pure, meetings }
    }

    const firstRefused = (tokens: number[], records: BeatRecord[], m: number): number => {
      let whole: Whole | null = { tokens, weight: basisWhole(tokens, [0, 1]).weight.map(w => w * 4n ** BigInt(m)) }
      let meeting = 0

      for (const record of records) {
        meeting += record.meetings.length
        whole = advanceWhole({ weave, whole: whole!, record, kernel4: kThird, fixed: true, forward: true })

        if (!whole) {
          return meeting
        }
      }

      return 0
    }

    const shareOf = (r: Row): number => Number(r.fears) / Number(r.loves + r.fears)
    const unitsMax = (rows: Row[]): bigint => rows.reduce((m, r) => (r.units > m ? r.units : m), 0n)
    const log4 = (units: bigint): number => Math.log(Number(units) / 9) / Math.log(4)
    const study = (background: { vibe: Int8Array; point: Int8Array }, tokens: number[]) => {
      const open = openOf(tokens)
      const live = recordsOf(background, liveLinks, open, GRAIN_BEATS)
      const flat = recordsOf(background, flatLinks, open, GRAIN_BEATS)
      const grain = runGrain(tokens, live, kThird)
      const flatGrain = runGrain(tokens, flat, kThird)
      const off = runGrain(tokens, live, kPi)

      return {
        live,
        grain,
        flatGrain,
        off,
        refusals: [1, 2, 4, 8, 16].map(m => [m, firstRefused(tokens, live, m)] as const),
      }
    }

    const inVacuum = study(vacuum, vacuumPair)
    const inMatter = study(matter, matterPair)

    // what a whole feels between meetings: the moves Pa and Pb its two tokens crossed. A frame change at
    // the meeting cell moves both alike and commutes with the swap phase, so only the loop Pb^-1 Pa
    // (a Wilson loop of the link field) can matter. Every pair of cell-0 tokens that meets, both
    // backgrounds, one classical run each: meetings, loops that are not the identity, and the units reached
    const survey = (background: { vibe: Int8Array; point: Int8Array }) => {
      const records = recordsOf(background, liveLinks, cell0, GRAIN_BEATS)
      const results: { a: number; b: number; meetings: number; loops: number; units: bigint }[] = []

      for (let a = 0; a < 24; a++) {
        for (let b = a + 1; b < 24; b++) {
          const mine = records.map(r => ({
            meetings: r.meetings.filter(([x, y]) => (x === a && y === b) || (x === b && y === a)),
            crossings: r.crossings.filter(([tk]) => tk === a || tk === b),
          }))
          const meetings = mine.reduce((n, r) => n + r.meetings.length, 0)

          if (meetings === 0) {
            continue
          }

          let pa = moves.identity
          let pb = moves.identity
          let loops = 0

          for (const r of mine) {
            if (r.meetings.length > 0) {
              loops += moves.compose(moves.inverse[pb] ?? moves.identity, pa) === moves.identity ? 0 : 1
              pa = moves.identity
              pb = moves.identity
            }

            for (const [tk, g] of r.crossings) {
              if (tk === a) {
                pa = moves.compose(g, pa)
              } else {
                pb = moves.compose(g, pb)
              }
            }
          }

          results.push({ a, b, meetings, loops, units: unitsMax(runGrain([a, b], mine, kThird).rows) })
        }
      }

      return results
    }

    const surveyVacuum = survey(vacuum)
    const surveyMatter = survey(matter)
    const surveyAll = [...surveyVacuum, ...surveyMatter]
    const surveyed = (list: typeof surveyAll, pair: number[]) => list.find(s => s.a === Math.min(pair[0] ?? 0, pair[1] ?? 0) && s.b === Math.max(pair[0] ?? 0, pair[1] ?? 0))
    // the survey and the study agree on the two wholes: a second route to the same numbers
    const surveyAgrees =
      surveyed(surveyVacuum, vacuumPair)?.units === unitsMax(inVacuum.grain.rows) && surveyed(surveyMatter, matterPair)?.units === unitsMax(inMatter.grain.rows)
    // the whole that spends the most grain: the matter pair with the largest units, studied in full
    const growing = [...surveyMatter].sort((x, y) => (y.units > x.units ? 1 : y.units < x.units ? -1 : x.a - y.a || x.b - y.b))[0]
    const grower = [growing?.a ?? 0, growing?.b ?? 1]
    const inGrower = study(matter, grower)
    const gRows = inGrower.grain.rows
    const loopsOf = (list: typeof surveyAll, grows: boolean) => list.filter(s => s.units > 36n === grows)
    const loopShare = (list: typeof surveyAll): number => list.reduce((n, s) => n + s.loops, 0) / Math.max(1, list.reduce((n, s) => n + s.meetings, 0))

    // 3. reversal and charge on the matter whole, fixed units
    const bigUnits = 9n * 4n ** 200n
    let reverses = true
    let chargeKept = true
    let vibeChargeKept = true
    let reversalMeetings = 0

    {
      const open = openOf(matterPair)
      let lattice = makeLattice(matter)
      const start = lattice
      const vibeCharge = lattice.vibe.reduce((a, b) => a + b, 0)
      const whole0: Whole = { tokens: matterPair, weight: basisWhole(matterPair, [2, 0]).weight.map(w => w * (bigUnits / 9n)) }
      let whole: Whole | null = whole0

      for (let t = 0; t < REVERSAL_BEATS; t++) {
        const r = fearBeat({ weave, links: liveLinks, lattice, open, t })

        lattice = r.lattice
        reversalMeetings += r.record.meetings.length
        whole = whole ? advanceWhole({ weave, whole, record: r.record, kernel4: kThird, fixed: true, forward: true }) : null
        chargeKept = chargeKept && whole !== null && wholeUnits(whole) === bigUnits
        vibeChargeKept = vibeChargeKept && lattice.vibe.reduce((a, b) => a + b, 0) === vibeCharge
      }

      for (let t = REVERSAL_BEATS - 1; t >= 0; t--) {
        const r = fearBeatBack({ weave, links: liveLinks, lattice, open, t })

        lattice = r.lattice
        whole = whole ? advanceWhole({ weave, whole, record: r.record, kernel4: kThirdBack, fixed: true, forward: false }) : null
      }

      reverses =
        whole !== null &&
        whole.weight.every((w, i) => w === whole0.weight[i]) &&
        lattice.vibe.every((v, i) => v === start.vibe[i]) &&
        lattice.token.every((v, i) => v === start.token[i]) &&
        lattice.point.every((v, i) => v === start.point[i])
    }

    // 4. gauge on the matter whole: a frame in every cell, links changed to match
    const frame = Array.from({ length: mesh.cellCount }, (_, x) => Math.floor((((x + 11) * GOLDEN * 5.9) % 1) * moves.act.length))
    const gaugeLinks = new Int16Array(slots)

    for (let x = 0; x < mesh.cellCount; x++) {
      for (let d = 0; d < 24; d++) {
        const y = mesh.neighbour(x, d)

        gaugeLinks[x * 24 + d] = moves.compose(moves.compose(frame[y] ?? moves.identity, liveLinks[x * 24 + d] ?? moves.identity), moves.inverse[frame[x] ?? moves.identity] ?? moves.identity)
      }
    }

    const matterOpen = openOf(matterPair)
    const transform = (lattice: Lattice, whole: Whole): { lattice: Lattice; whole: Whole } => {
      const at = new Map<number, number>()

      lattice.token.forEach((tk, s) => at.set(tk, Math.floor(s / 24)))

      const point = Int8Array.from(lattice.point, (p, tk) => moves.act[frame[at.get(tk) ?? 0] ?? moves.identity]?.[p] ?? 0)
      let moved = whole

      whole.tokens.forEach((tk, c) => {
        moved = moveCoordinate(moved, c, moves.act[frame[at.get(tk) ?? 0] ?? moves.identity] ?? [])
      })

      return { lattice: { vibe: lattice.vibe, token: lattice.token, point }, whole: moved }
    }

    const gaugeMismatch = (kernel4: number[][], color?: FearKernels): number => {
      let a = { lattice: makeLattice(matter), whole: basisWhole(matterPair, [0, 1]) }
      let b = transform(a.lattice, a.whole)
      let mismatch = 0

      for (let t = 0; t < GAUGE_BEATS; t++) {
        const ra = fearBeat({ weave, links: liveLinks, lattice: a.lattice, open: matterOpen, t })
        const rb = fearBeat({ weave, links: gaugeLinks, lattice: b.lattice, open: matterOpen, t })

        a = { lattice: ra.lattice, whole: advanceWhole({ weave, whole: a.whole, record: ra.record, kernel4, color, fixed: false, forward: true })! }
        b = { lattice: rb.lattice, whole: advanceWhole({ weave, whole: b.whole, record: rb.record, kernel4, color, fixed: false, forward: true })! }

        const expected = transform(a.lattice, a.whole)
        const expectedWeights = reduceWhole(expected.whole).weight
        const actualWeights = reduceWhole(b.whole).weight

        // the classical points of the tokens outside the whole (the open tokens' slot is never read)
        mismatch += expected.lattice.point.reduce((n, p, tk) => n + (matterOpen[tk] === 1 || p === b.lattice.point[tk] ? 0 : 1), 0)
        mismatch += expectedWeights.reduce((n, w, i) => n + (w === actualWeights[i] ? 0 : 1), 0)
      }

      return mismatch
    }

    const gaugeSwapPhase = gaugeMismatch(kThird)
    const gaugeSum = gaugeMismatch(kSum)
    const gaugeMeetings = inMatter.live.slice(0, GAUGE_BEATS).reduce((n, r) => n + r.meetings.length, 0)

    // 5. the cost of an open vacuum: every token open, roles all at one point, flat links, one colored token
    const openVacuum = (kernel4: number[][]): number[] => {
      const keyOf = (diff: Map<number, number>): string =>
        [...diff.entries()]
          .filter(([, p]) => p !== 0)
          .sort((x, y) => x[0] - y[0])
          .map(([tk, p]) => `${tk}:${p}`)
          .join(',')
      const parse = (key: string): Map<number, number> => new Map(key === '' ? [] : key.split(',').map(part => part.split(':').map(Number) as [number, number]))
      let weights = new Map<string, bigint>([[keyOf(new Map([[vacuumPair[0] ?? 0, 3]])), 1n]])
      let lattice = makeLattice(vacuum)
      const support: number[] = []

      for (let t = 0; t < OPEN_BEATS && weights.size <= OPEN_CAP; t++) {
        const r = fearBeat({ weave, links: flatLinks, lattice, open: allOpen, t })
        const partner = new Map<number, readonly [number, number]>()

        lattice = r.lattice

        for (const m of r.record.meetings) {
          partner.set(m[0], m)
          partner.set(m[1], m)
        }

        const expanded: { diff: Map<number, number>; weight: bigint; m: number }[] = []

        for (const [key, weight] of weights) {
          const diff0 = parse(key)
          let branches = [{ diff: diff0, weight, m: 0 }]
          const done = new Set<readonly [number, number]>()

          for (const tk of diff0.keys()) {
            const meeting = partner.get(tk)

            if (!meeting || done.has(meeting)) {
              continue
            }

            done.add(meeting)

            const [ta, tb] = meeting

            branches = branches.flatMap(branch => {
              const pa = branch.diff.get(ta) ?? 0
              const pb = branch.diff.get(tb) ?? 0
              const column = pa * 9 + pb

              return kernel4.flatMap((row, target) => {
                const k = row[column] ?? 0

                if (k === 0) {
                  return []
                }

                const diff = new Map(branch.diff)

                diff.set(ta, Math.floor(target / 9))
                diff.set(tb, target % 9)

                return [{ diff, weight: branch.weight * BigInt(k), m: branch.m + 1 }]
              })
            })
          }

          expanded.push(...branches)
        }

        const top = expanded.reduce((m, e) => Math.max(m, e.m), 0)
        const next = new Map<string, bigint>()

        for (const e of expanded) {
          const key = keyOf(e.diff)

          next.set(key, (next.get(key) ?? 0n) + e.weight * 4n ** BigInt(top - e.m))
        }

        weights = new Map([...next].filter(([, w]) => w !== 0n))
        support.push(weights.size)
      }

      return support
    }

    const openSupport = openVacuum(kThird)
    const openSupportOff = openVacuum(kPi)
    const firstSpread = openSupport.findIndex(s => s > 1)

    const vRows = inVacuum.grain.rows
    const mRows = inMatter.grain.rows
    const lastOf = (rows: Row[]): Row | undefined => rows[rows.length - 1]
    const maxShare = Math.max(...vRows.map(shareOf), ...mRows.map(shareOf))
    const offFears = [...inVacuum.off.rows, ...inMatter.off.rows].reduce((m, r) => (r.fears > m ? r.fears : m), 0n)
    const offUnits = [...inVacuum.off.rows, ...inMatter.off.rows].every(r => r.units === 9n)
    const matterFinal = lastOf(mRows)

    // 6. the color mode, adopted after E-QTM-0102: the singlet phase where a love meets a fear (the fear's
    // role at the reflected point), the swap phase where like vibes meet, chosen by the vibes each meeting
    // recorded. Same three wholes, same records. Its gates, fixed before its first run: reversal and love
    // minus fear in fixed units of 9 x 4^200 x 3^200, purity, fear share at most 1/3, 0 frame mismatches, and
    // no fear with the fear beat off (like pi, love-fear 0)
    const colorOn = fearKernels({ like: OMEGA, unlike: OMEGA })
    const colorBack = fearKernels({ like: -OMEGA, unlike: -OMEGA })
    const colorOff = fearKernels({ like: Math.PI, unlike: 0 })
    const powerOf = (units: bigint, p: bigint): number => {
      let u = units
      let k = 0

      while (u > 0n && u % p === 0n) {
        u /= p
        k++
      }

      return k
    }
    const colorStudy = (records: BeatRecord[], tokens: number[]) => {
      const grain = runGrain(tokens, records, [], colorOn ?? undefined)
      const off = runGrain(tokens, records, [], colorOff ?? undefined)
      let like = 0
      let unlike = 0
      let flips = 0
      const lastSign = new Map<number, number>()

      for (const record of records) {
        record.meetings.forEach(([ta, tb], k) => {
          const [sa, sb] = record.signs?.[k] ?? [1, 1]

          like += sa === sb ? 1 : 0
          unlike += sa === sb ? 0 : 1

          for (const [tk, s] of [
            [ta, sa],
            [tb, sb],
          ] as const) {
            flips += lastSign.has(tk) && lastSign.get(tk) !== s ? 1 : 0
            lastSign.set(tk, s)
          }
        })
      }

      const top = unitsMax(grain.rows)

      return {
        grain,
        like,
        unlike,
        flips,
        twos: powerOf(top, 2n),
        threes: powerOf(top, 3n),
        fearsMax: Number(grain.rows.reduce((m, r) => (r.fears > m ? r.fears : m), 0n)),
        shareMax: Math.max(0, ...grain.rows.map(shareOf)),
        offFears: Number(off.rows.reduce((m, r) => (r.fears > m ? r.fears : m), 0n)),
      }
    }
    const colorVacuum = colorStudy(inVacuum.live, vacuumPair)
    const colorMatter = colorStudy(inMatter.live, matterPair)
    const colorGrower = colorStudy(inGrower.live, grower)

    let colorReverses = false
    let colorCharge = true

    {
      const colorUnits = 9n * 4n ** 200n * 3n ** 200n
      const open = openOf(matterPair)
      let lattice = makeLattice(matter)
      const whole0: Whole = { tokens: matterPair, weight: basisWhole(matterPair, [2, 0]).weight.map(w => w * (colorUnits / 9n)) }
      let whole: Whole | null = whole0

      for (let t = 0; t < REVERSAL_BEATS; t++) {
        const r = fearBeat({ weave, links: liveLinks, lattice, open, t })

        lattice = r.lattice
        whole = whole ? advanceWhole({ weave, whole, record: r.record, kernel4: [], color: colorOn ?? undefined, fixed: true, forward: true }) : null
        colorCharge = colorCharge && whole !== null && wholeUnits(whole) === colorUnits
      }

      for (let t = REVERSAL_BEATS - 1; t >= 0; t--) {
        const r = fearBeatBack({ weave, links: liveLinks, lattice, open, t })

        lattice = r.lattice
        whole = whole ? advanceWhole({ weave, whole, record: r.record, kernel4: [], color: colorBack ?? undefined, fixed: true, forward: false }) : null
      }

      colorReverses = whole !== null && whole.weight.every((w, i) => w === whole0.weight[i])
    }

    const colorGauge = gaugeMismatch([], colorOn ?? undefined)
    const colorOk =
      colorOn !== null &&
      colorReverses &&
      colorCharge &&
      [colorVacuum, colorMatter, colorGrower].every(s => s.grain.pure && s.shareMax <= 1 / 3 && s.offFears === 0) &&
      colorGauge === 0

    const ok =
      colorOk &&
      kernelsExact &&
      diagonalFixed &&
      vacuumPair.length === 2 &&
      equivalenceMismatch === 0 &&
      equivalenceMeetings > 0 &&
      reverses &&
      reversalMeetings > 0 &&
      chargeKept &&
      vibeChargeKept &&
      inVacuum.grain.pure &&
      inMatter.grain.pure &&
      maxShare <= 1 / 3 &&
      gaugeSwapPhase === 0 &&
      gaugeMeetings > 0 &&
      gaugeSum > 0 &&
      offFears === 0n &&
      offUnits &&
      unitsMax(vRows) > unitsMax(inVacuum.flatGrain.rows) &&
      inVacuum.refusals.every(([, meeting]) => meeting > 0)

    return verdict({
      status: ok ? 'pass' : 'fail',
      claim:
        'with the fear beat off the rule is the color weave at every slot; with it on, a whole of two tokens reverses exactly, keeps the vibe sum and love minus fear after every beat, stays pure in integers so the share of fear never passes a third, and commutes with a change of role frame in every cell where SUM does not; the grain gate failed on the vacuum whole, a pair made together whose units never pass 36 on live or flat links, while 17 of the 28 meeting pairs of cell 0 grow past 36, and the pair that grows most in matter quadruples its units at each of its 17 meetings, is refused at meeting m + 1 when it has 9 x 4^m units, and stays at 36 on flat links',
      metrics: {
        vacuumPairFirstToken: vacuumPair[0] ?? -1,
        vacuumPairSecondToken: vacuumPair[1] ?? -1,
        matterPairFirstToken: matterPair[0] ?? -1,
        matterPairSecondToken: matterPair[1] ?? -1,
        kernelFixesAlikeRoles: diagonalFixed ? 1 : 0,
        phiPiMismatchWithColorWeave: equivalenceMismatch,
        phiPiMeetingsChecked: equivalenceMeetings,
        reversesExactly: reverses ? 1 : 0,
        reversalMeetings,
        loveMinusFearKept: chargeKept ? 1 : 0,
        vibeChargeKept: vibeChargeKept ? 1 : 0,
        pureEveryBeat: inVacuum.grain.pure && inMatter.grain.pure ? 1 : 0,
        fearShareMax: maxShare,
        gaugeMismatchSwapPhase: gaugeSwapPhase,
        gaugeMeetings,
        vacuumMeetings480: inVacuum.grain.meetings,
        vacuumUnitsMaxLive: Number(unitsMax(vRows)),
        vacuumUnitsMaxFlat: Number(unitsMax(inVacuum.flatGrain.rows)),
        vacuumFearsMax: Number(vRows.reduce((m, r) => (r.fears > m ? r.fears : m), 0n)),
        ...Object.fromEntries(inVacuum.refusals.map(([m, meeting]) => [`vacuumFirstRefusedMeeting9x4pow${m}`, meeting])),
        matterMeetings480: inMatter.grain.meetings,
        matterUnitsLog4Over9After1: mRows[0] ? log4(mRows[0].units) : -1,
        matterUnitsLog4Over9After4: mRows[3] ? log4(mRows[3].units) : -1,
        matterUnitsLog4Over9After8: mRows[7] ? log4(mRows[7].units) : -1,
        matterUnitsLog4Over9After16: mRows[15] ? log4(mRows[15].units) : -1,
        matterUnitsLog4Over9Final: matterFinal ? log4(matterFinal.units) : -1,
        matterUnitsLog4Over9MaxFlat: log4(unitsMax(inMatter.flatGrain.rows)),
        matterFearShareFinal: matterFinal ? shareOf(matterFinal) : -1,
        matterNegativityFinal: matterFinal ? Number(matterFinal.loves + matterFinal.fears) / Number(matterFinal.units) : -1,
        matterNegativityMax: Math.max(...mRows.map(r => Number(r.loves + r.fears) / Number(r.units))),
        ...Object.fromEntries(inMatter.refusals.map(([m, meeting]) => [`matterFirstRefusedMeeting9x4pow${m}`, meeting])),
        surveyPairsVacuum: surveyVacuum.length,
        surveyPairsMatter: surveyMatter.length,
        surveyMeetings: surveyAll.reduce((n, s) => n + s.meetings, 0),
        surveyNontrivialLoops: surveyAll.reduce((n, s) => n + s.loops, 0),
        surveyUnitsLog4Over9MaxVacuum: log4(surveyVacuum.reduce((m, s) => (s.units > m ? s.units : m), 0n)),
        surveyUnitsLog4Over9MaxMatter: log4(surveyMatter.reduce((m, s) => (s.units > m ? s.units : m), 0n)),
        surveyPairsPast36Units: surveyAll.filter(s => s.units > 36n).length,
        surveyAgreesWithStudy: surveyAgrees ? 1 : 0,
        loopShareWherePast36: loopShare(loopsOf(surveyAll, true)),
        loopShareWhereAtMost36: loopShare(loopsOf(surveyAll, false)),
        growerFirstToken: grower[0] ?? -1,
        growerSecondToken: grower[1] ?? -1,
        growerMeetings480: inGrower.grain.meetings,
        growerPure: inGrower.grain.pure ? 1 : 0,
        growerUnitsLog4Over9After1: gRows[0] ? log4(gRows[0].units) : -1,
        growerUnitsLog4Over9After2: gRows[1] ? log4(gRows[1].units) : -1,
        growerUnitsLog4Over9After4: gRows[3] ? log4(gRows[3].units) : -1,
        growerUnitsLog4Over9After8: gRows[7] ? log4(gRows[7].units) : -1,
        growerUnitsLog4Over9After16: gRows[15] ? log4(gRows[15].units) : -1,
        growerUnitsLog4Over9Final: lastOf(gRows) ? log4(lastOf(gRows)!.units) : -1,
        growerUnitsLog4Over9MaxFlat: log4(unitsMax(inGrower.flatGrain.rows)),
        growerFearShareMax: Math.max(...gRows.map(shareOf)),
        growerFearShareFinal: lastOf(gRows) ? shareOf(lastOf(gRows)!) : -1,
        growerNegativityFinal: lastOf(gRows) ? Number(lastOf(gRows)!.loves + lastOf(gRows)!.fears) / Number(lastOf(gRows)!.units) : -1,
        ...Object.fromEntries(inGrower.refusals.map(([m, meeting]) => [`growerFirstRefusedMeeting9x4pow${m}`, meeting])),
        colorModeGatesPass: colorOk ? 1 : 0,
        colorReversesExactly: colorReverses ? 1 : 0,
        colorLoveMinusFearKept: colorCharge ? 1 : 0,
        colorGaugeMismatch: colorGauge,
        ...Object.fromEntries(
          (
            [
              ['Vacuum', colorVacuum],
              ['Matter', colorMatter],
              ['Grower', colorGrower],
            ] as const
          ).flatMap(([name, s]) => [
            [`color${name}LikeMeetings`, s.like],
            [`color${name}LoveFearMeetings`, s.unlike],
            [`color${name}TokenSignFlips`, s.flips],
            [`color${name}UnitsMaxPowerOf2`, s.twos],
            [`color${name}UnitsMaxPowerOf3`, s.threes],
            [`color${name}FearsMax`, s.fearsMax],
            [`color${name}FearShareMax`, s.shareMax],
            [`color${name}Pure`, s.grain.pure ? 1 : 0],
          ]),
        ),
        openVacuumFirstSpreadBeat: firstSpread,
        openVacuumSupportPerBeat: openSupport[openSupport.length - 1] ?? -1,
        openVacuumBeatsRun: openSupport.length,
        ...Object.fromEntries(openSupport.map((s, i) => [`openVacuumSupportBeat${i + 1}`, s])),
      },
      control: {
        gaugeMismatchSum: gaugeSum,
        fearBeatOffFearsMax: Number(offFears),
        fearBeatOffUnitsStay9: offUnits ? 1 : 0,
        openVacuumSupportFearOff: openSupportOff[openSupportOff.length - 1] ?? -1,
      },
      notes:
        'L2, exact integers (BigInt) for every weight, no random numbers (golden-ratio fills for the backgrounds, links and frames). Tokens move as the color weave moves role points, exchange included, so the classical layer never depends on the whole, and a meeting of two open tokens applies the kernel of SWAP U(phi) to their coordinates. The whole is closed: only its tokens carry weight. The open-vacuum run puts every token of the box in the whole with roles at one grid point (a classical background, not a quantum state) and one token moved to another point, on flat links, and counts joint points holding weight until the count passes 200,000 or 24 beats. Purity 9 sum n^2 = N^2 is the integer form of sum W^2 = 1/9 for a pure state of two roles, which with love minus fear = N bounds the share of fear by 1/3 (E-FRC-0122). Log4 units over 9: how many factors of 4 the grain has grown from the nine units of |0>|1>.',
    })
  },
})
