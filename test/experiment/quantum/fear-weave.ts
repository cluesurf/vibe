// The fear beat inside the lattice: the cube-root swap phase run as a step of the color weave, with the
// loves and fears of a whole riding the role points the lattice moves (code/rule/fear-weave).
//
// E-FRC-0127 ran the fear beat on a standalone grid of 81 weights. Here the lattice decides everything:
// the committed turning weave (pair table, hop kept) moves the vibes on the side-3 D4 box, streaming
// carries each role point along its link and moves it by the link's grid move, and the one-third turn acts
// only where two vibes of the whole meet on a line. The whole is two tokens that start on one line of cell
// 0 in the vacuum, the first line whose two tokens meet again within 24 beats (found by the run, not
// chosen), in the product state |0>|1>: nine loves, no fear.
//
// Gates, fixed before the run:
// - phi = pi is the color weave: with every token open and the exchange's kernel applied at every
//   meeting, the role field equals code/rule/color-weave's at every slot for 24 beats, with meetings
// - reversal: 96 beats forward and back restore the vibes, tokens, points and every weight exactly
// - charge: the vibe sum and love minus fear (the whole's units) are the same after every beat
// - purity, exact in integers: 9 sum n^2 = N^2 after every beat, the pure-state identity sum W^2 = 1/9 of
//   two roles, so love plus fear is at most 3 N and the share of fear at most 1/3
// - gauge: an independent change of role frame in every cell, links changed to match, commutes with the
//   whole rule (0 mismatches over 48 beats). Control: the same rule with SUM, a Clifford two-role move that
//   is not color-blind, at the meetings: mismatches
// - with the fear beat off (phi = pi) no fear ever appears and the units stay 9
// - grain: on the live link field the units grow at meetings and a whole of 9 x 4^m units is refused at a
//   meeting (never rounded); on a flat field (every link the identity) the units saturate, since
//   U(2 pi / 3)^3 = 1
// Reported: the units, loves, fears, share of fear and negativity after each meeting, the first refused
// meeting for each whole size, and the cost of opening the vacuum: every token of the box in the whole,
// one colored token among roles all at one point, the number of joint points holding weight per beat.
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
  moveCoordinate,
  quarterKernel,
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
const GRAIN_BEATS = 480
const REVERSAL_BEATS = 96
const GAUGE_BEATS = 48
const OPEN_BEATS = 8
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
    const on = tokens.every((_, c) => Math.floor(Math.floor(i / 9 ** (tokens.length - 1 - c)) % 9 / 3) === digits[c])

    weight[i] = on ? 1n : 0n
  }

  return { tokens, weight }
}

function sameWhole(a: Whole | null, b: Whole | null): boolean {
  return a !== null && b !== null && a.weight.every((w, i) => w === b.weight[i])
}

export default experiment({
  id: 'quantum/fear-weave',
  code: 'E-QTM-0099',
  title:
    'the fear beat inside the lattice: the cube-root swap phase acts where two vibes of a whole meet on a line of the committed turning weave, the classical steps carry the loves and fears by permuting role points, and the rule is the color weave exactly with the fear beat off, reverses exactly, keeps love minus fear, keeps the whole pure in integers so fear stays under a third, commutes with a change of role frame in every cell, and grows grain only in a live link field',
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
    const kThird = quarterKernel(swapPhase(OMEGA))
    const kPi = quarterKernel(swapPhase(Math.PI))
    const kThirdBack = quarterKernel(swapPhase(-OMEGA))
    const kSum = quarterKernel(sumGate())
    const allOpen = new Uint8Array(slots).fill(1)
    // the kernel leaves every joint point with x = y alone
    const diagonalFixed = Array.from({ length: 9 }, (_, x) => x * 9 + x).every(c =>
      (kThird ?? []).every((row, r) => (row[c] ?? 0) === (r === c ? 4 : 0)),
    )

    // 1. phi = pi is the color weave: every token open, a delta tracked through the exchange kernel
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
          const target = (kPi ?? []).findIndex(row => row[column] === 4)

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

    // 2. the whole: the first line of cell 0 whose two tokens meet again within 24 beats
    const vacuum = { vibe: new Int8Array(slots), point: new Int8Array(slots) }
    const openOf = (tokens: readonly number[]): Uint8Array => {
      const open = new Uint8Array(slots)

      for (const t of tokens) {
        open[t] = 1
      }

      return open
    }

    let pair: number[] = []

    for (let d = 0; d < 24 && pair.length === 0; d++) {
      const o = opposite[d] ?? d

      if (o < d) {
        continue
      }

      const open = openOf([d, o])
      let lattice = makeLattice(vacuum)

      for (let t = 0; t < 24; t++) {
        const r = fearBeat({ weave, links: liveLinks, lattice, open, t })

        lattice = r.lattice

        if (r.record.meetings.length > 0) {
          pair = [d, o]
          break
        }
      }
    }

    const open = openOf(pair)
    const records = (links: Int16Array, beats: number): { records: BeatRecord[]; lattices: Lattice[] } => {
      let lattice = makeLattice(vacuum)
      const out: BeatRecord[] = []
      const lattices: Lattice[] = [lattice]

      for (let t = 0; t < beats; t++) {
        const r = fearBeat({ weave, links, lattice, open, t })

        lattice = r.lattice
        out.push(r.record)
        lattices.push(lattice)
      }

      return { records: out, lattices }
    }

    const live = records(liveLinks, GRAIN_BEATS)
    const flat = records(flatLinks, GRAIN_BEATS)
    const start = basisWhole(pair, [0, 1])

    // grain, fear, purity, charge after every beat, fear beat on, live field
    type Row = { units: bigint; loves: bigint; fears: bigint }
    const runGrain = (recs: BeatRecord[], kernel4: number[][] | null): { rows: Row[]; pure: boolean; meetings: number } => {
      let whole: Whole | null = start
      const rows: Row[] = []
      let pure = true
      let meetings = 0

      for (const record of recs) {
        whole = advanceWhole({ weave, whole: whole!, record, kernel4: kernel4 ?? [], fixed: false, forward: true })

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

    const grain = runGrain(live.records, kThird)
    const flatGrain = runGrain(flat.records, kThird)
    const off = runGrain(live.records, kPi)
    const shareOf = (r: Row): number => Number(r.fears) / Number(r.loves + r.fears)
    const maxShare = Math.max(...grain.rows.map(shareOf))
    const flatUnitsMax = flatGrain.rows.reduce((m, r) => (r.units > m ? r.units : m), 0n)
    const offFears = off.rows.reduce((m, r) => (r.fears > m ? r.fears : m), 0n)
    const offUnits = off.rows.every(r => r.units === 9n)
    const finalLive = grain.rows[grain.rows.length - 1]
    const growth = grain.rows.map((r, i) => (i === 0 ? Number(r.units) / 9 : Number(r.units) / Number(grain.rows[i - 1]?.units ?? 1n)))

    // first refused meeting for a whole of 9 x 4^m units
    const firstRefused = (m: number): number => {
      let whole: Whole | null = { tokens: start.tokens, weight: start.weight.map(w => w * 4n ** BigInt(m)) }
      let meeting = 0

      for (const record of live.records) {
        meeting += record.meetings.length
        whole = advanceWhole({ weave, whole: whole!, record, kernel4: kThird ?? [], fixed: true, forward: true })

        if (!whole) {
          return meeting
        }
      }

      return 0
    }
    const refusals = [1, 2, 3, 4, 6, 8].map(m => [m, firstRefused(m)] as const)

    // 3. reversal and charge, fixed units
    const bigUnits = 9n * 4n ** 60n
    let reverses = true
    let chargeKept = true
    let vibeChargeKept = true

    {
      let lattice = makeLattice(golden(2.11))
      const start2 = lattice
      const vibeCharge = lattice.vibe.reduce((a, b) => a + b, 0)
      // a whole on the golden background: the first pair of tokens that meets in 24 beats among cell 0
      let tokens2: number[] = []

      for (let a = 0; a < 24 && tokens2.length === 0; a++) {
        for (let b = a + 1; b < 24 && tokens2.length === 0; b++) {
          let probe = lattice
          const o2 = openOf([a, b])

          for (let t = 0; t < 24; t++) {
            const r = fearBeat({ weave, links: liveLinks, lattice: probe, open: o2, t })

            probe = r.lattice

            if (r.record.meetings.length > 0) {
              tokens2 = [a, b]
              break
            }
          }
        }
      }

      const open2 = openOf(tokens2.length === 2 ? tokens2 : pair)
      const whole0: Whole = {
        tokens: tokens2.length === 2 ? tokens2 : pair,
        weight: basisWhole(tokens2.length === 2 ? tokens2 : pair, [2, 0]).weight.map(w => w * (bigUnits / 9n)),
      }
      let whole: Whole | null = whole0

      for (let t = 0; t < REVERSAL_BEATS; t++) {
        const r = fearBeat({ weave, links: liveLinks, lattice, open: open2, t })

        lattice = r.lattice
        whole = whole ? advanceWhole({ weave, whole, record: r.record, kernel4: kThird ?? [], fixed: true, forward: true }) : null
        chargeKept = chargeKept && whole !== null && wholeUnits(whole) === bigUnits
        vibeChargeKept = vibeChargeKept && lattice.vibe.reduce((a, b) => a + b, 0) === vibeCharge
      }

      for (let t = REVERSAL_BEATS - 1; t >= 0; t--) {
        const r = fearBeatBack({ weave, links: liveLinks, lattice, open: open2, t })

        lattice = r.lattice
        whole = whole ? advanceWhole({ weave, whole, record: r.record, kernel4: kThirdBack ?? [], fixed: true, forward: false }) : null
      }

      reverses =
        sameWhole(whole, whole0) &&
        lattice.vibe.every((v, i) => v === start2.vibe[i]) &&
        lattice.token.every((v, i) => v === start2.token[i]) &&
        lattice.point.every((v, i) => v === start2.point[i])
    }

    // 4. gauge: a frame in every cell, links changed to match
    const frame = Array.from({ length: mesh.cellCount }, (_, x) => Math.floor((((x + 11) * GOLDEN * 5.9) % 1) * moves.act.length))
    const gaugeLinks = new Int16Array(slots)

    for (let x = 0; x < mesh.cellCount; x++) {
      for (let d = 0; d < 24; d++) {
        const y = mesh.neighbour(x, d)

        gaugeLinks[x * 24 + d] = moves.compose(
          moves.compose(frame[y] ?? moves.identity, liveLinks[x * 24 + d] ?? moves.identity),
          moves.inverse[frame[x] ?? moves.identity] ?? moves.identity,
        )
      }
    }

    const cellOf = (lattice: Lattice): Map<number, number> => {
      const at = new Map<number, number>()

      lattice.token.forEach((tk, s) => at.set(tk, Math.floor(s / 24)))

      return at
    }
    const transform = (lattice: Lattice, whole: Whole): { lattice: Lattice; whole: Whole } => {
      const at = cellOf(lattice)
      const point = Int8Array.from(lattice.point, (p, tk) => moves.act[frame[at.get(tk) ?? 0] ?? moves.identity]?.[p] ?? 0)
      let moved = whole

      whole.tokens.forEach((tk, c) => {
        moved = moveCoordinate(moved, c, moves.act[frame[at.get(tk) ?? 0] ?? moves.identity] ?? [])
      })

      return { lattice: { vibe: lattice.vibe, token: lattice.token, point }, whole: moved }
    }

    const gaugeMismatch = (kernel4: number[][] | null): number => {
      let a = { lattice: makeLattice(vacuum), whole: basisWhole(pair, [0, 1]) as Whole | null }
      const first = transform(a.lattice, a.whole!)
      let b = { lattice: first.lattice, whole: first.whole as Whole | null }
      let mismatch = 0

      for (let t = 0; t < GAUGE_BEATS; t++) {
        const ra = fearBeat({ weave, links: liveLinks, lattice: a.lattice, open, t })
        const rb = fearBeat({ weave, links: gaugeLinks, lattice: b.lattice, open, t })

        a = { lattice: ra.lattice, whole: advanceWhole({ weave, whole: a.whole!, record: ra.record, kernel4: kernel4 ?? [], fixed: false, forward: true }) }
        b = { lattice: rb.lattice, whole: advanceWhole({ weave, whole: b.whole!, record: rb.record, kernel4: kernel4 ?? [], fixed: false, forward: true }) }

        const expected = transform(a.lattice, a.whole!)

        mismatch += expected.lattice.point.reduce((n, p, i) => n + (p === b.lattice.point[i] ? 0 : 1), 0)
        mismatch += reduceWhole(expected.whole).weight.reduce((n, w, i) => n + (w === reduceWhole(b.whole!).weight[i] ? 0 : 1), 0)
      }

      return mismatch
    }

    const gaugeSwapPhase = gaugeMismatch(kThird)
    const gaugeSum = gaugeMismatch(kSum)
    const gaugeMeetings = records(liveLinks, GAUGE_BEATS).records.reduce((n, r) => n + r.meetings.length, 0)

    // 5. the cost of an open vacuum: every token open, roles all at one point, flat links, one colored token
    const openVacuum = (kernel4: number[][] | null): number[] => {
      const keyOf = (diff: Map<number, number>): string =>
        [...diff.entries()]
          .filter(([, p]) => p !== 0)
          .sort((x, y) => x[0] - y[0])
          .map(([tk, p]) => `${tk}:${p}`)
          .join(',')
      const parse = (key: string): Map<number, number> =>
        new Map(key === '' ? [] : key.split(',').map(part => part.split(':').map(Number) as [number, number]))
      let weights = new Map<string, bigint>([[keyOf(new Map([[pair[0] ?? 0, 3]])), 1n]])
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
          let branches = [{ diff: parse(key), weight, m: 0 }]
          const done = new Set<readonly [number, number]>()

          for (const tk of parse(key).keys()) {
            const meeting = partner.get(tk)

            if (!meeting || done.has(meeting)) {
              continue
            }

            done.add(meeting)

            const [ta, tb] = meeting

            branches = branches.flatMap(branch => {
              const pa = branch.diff.get(ta) ?? 0
              const pb = branch.diff.get(tb) ?? 0

              if (pa === pb) {
                return [branch]
              }

              const column = pa * 9 + pb

              return (kernel4 ?? []).flatMap((row, target) => {
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

    const ok =
      kThird !== null &&
      kPi !== null &&
      kThirdBack !== null &&
      kSum !== null &&
      diagonalFixed &&
      pair.length === 2 &&
      equivalenceMismatch === 0 &&
      equivalenceMeetings > 0 &&
      reverses &&
      chargeKept &&
      vibeChargeKept &&
      grain.pure &&
      maxShare <= 1 / 3 &&
      (finalLive?.fears ?? 0n) > 0n &&
      gaugeSwapPhase === 0 &&
      gaugeSum > 0 &&
      offFears === 0n &&
      offUnits &&
      (finalLive?.units ?? 0n) > flatUnitsMax &&
      refusals.every(([, meeting]) => meeting > 0)

    const meetingRow = (i: number): Row | undefined => grain.rows[i]

    return verdict({
      status: ok ? 'pass' : 'fail',
      claim:
        'with the fear beat off the rule is the color weave at every slot; with it on, the whole of two tokens reverses exactly over 96 beats, keeps the vibe sum and love minus fear after every beat, stays pure in integers so the share of fear never passes a third, commutes with a change of role frame in every cell where SUM does not, grows its grain at meetings in a live link field and saturates on a flat one, and a whole of fixed size is refused at a meeting rather than rounded',
      metrics: {
        pairFirstToken: pair[0] ?? -1,
        pairSecondToken: pair[1] ?? -1,
        kernelFixesAlikeRoles: diagonalFixed ? 1 : 0,
        phiPiMismatchWithColorWeave: equivalenceMismatch,
        phiPiMeetingsChecked: equivalenceMeetings,
        reversesExactly: reverses ? 1 : 0,
        loveMinusFearKept: chargeKept ? 1 : 0,
        vibeChargeKept: vibeChargeKept ? 1 : 0,
        pureEveryBeat: grain.pure ? 1 : 0,
        meetingsIn480Beats: grain.meetings,
        units1: Number(meetingRow(0)?.units ?? -1n),
        units2: Number(meetingRow(1)?.units ?? -1n),
        units3: Number(meetingRow(2)?.units ?? -1n),
        units4: Number(meetingRow(3)?.units ?? -1n),
        units8: Number(meetingRow(7)?.units ?? -1n),
        fears1: Number(meetingRow(0)?.fears ?? -1n),
        fears2: Number(meetingRow(1)?.fears ?? -1n),
        fears4: Number(meetingRow(3)?.fears ?? -1n),
        unitsLog4Final: Math.log(Number(finalLive?.units ?? 1n)) / Math.log(4),
        growthPerMeetingMax: Math.max(...growth),
        growthPerMeetingMin: Math.min(...growth),
        fearShareMax: maxShare,
        fearShareFinal: finalLive ? shareOf(finalLive) : -1,
        negativityFinal: finalLive ? Number(finalLive.loves + finalLive.fears) / Number(finalLive.units) : -1,
        ...Object.fromEntries(refusals.map(([m, meeting]) => [`firstRefusedMeetingWhole9x4pow${m}`, meeting])),
        gaugeMismatchSwapPhase: gaugeSwapPhase,
        gaugeMeetings,
        openVacuumSupportBeat1: openSupport[0] ?? -1,
        openVacuumSupportBeat2: openSupport[1] ?? -1,
        openVacuumSupportBeat3: openSupport[2] ?? -1,
        openVacuumSupportLast: openSupport[openSupport.length - 1] ?? -1,
        openVacuumBeatsRun: openSupport.length,
      },
      control: {
        gaugeMismatchSum: gaugeSum,
        fearBeatOffFearsMax: Number(offFears),
        fearBeatOffUnitsStay9: offUnits ? 1 : 0,
        flatFieldUnitsMax: Number(flatUnitsMax),
        flatFieldMeetings: flatGrain.meetings,
        openVacuumSupportFearOff: openSupportOff[openSupportOff.length - 1] ?? -1,
      },
      notes:
        'L2, exact integers (BigInt) for every weight, no random numbers (golden-ratio fills for the backgrounds, links and frames). The whole is closed: only its tokens carry weight, and a token outside it meets an open one by exchange, as the color weave does. The open-vacuum run puts every token of the box in the whole with roles at one grid point (a classical, not a quantum, background) and one token moved to another point, on flat links, and counts joint points holding weight until the count passes 200,000 or 8 beats. Purity 9 sum n^2 = N^2 is the integer form of sum W^2 = 1/9 for a pure state of two roles, which with love minus fear = N bounds the share of fear by 1/3 (E-FRC-0122).',
    })
  },
})
