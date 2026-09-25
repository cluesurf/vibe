// The fear weave on the hop-free knit: the color mode (singlet phase where a love meets a fear, swap phase
// where like vibes meet) run on the color turn weave (code/rule/color-turn-weave, E-FRC-0136), and its
// knots stored as their departure from calm (code/rule/calm-weave) with the center phase omega^q
// (code/rule/signed-knot).
//
// The color turn weave keeps the bind table (no hop) and moves role points only where a wire's first slot
// changes sign, so like pairs keep their tokens: the knit is built from its own spec
// (code/rule/fear-weave, colorLocalKnit) and the like kernel is the swap phase U itself, not SWAP U. The fear
// beat off is then like 0, love-fear 0, both the identity.
//
// Measured on the side-3 D4 box, gates fixed before the first run:
// - the knit is the color turn weave: with every token open and the fear beat off, the vibes equal
//   colorTurnWeave run through the lattice gas and the role points equal colorLocalBeat, every slot, 24
//   beats, with meetings
// - three knots of two tokens from dock 0, found by the run: the vacuum pair (the first line whose two
//   tokens meet within 24 beats in the vacuum), the matter pair (the pair meeting most in 240 beats on a
//   golden-ratio fill), and the grower (the matter pair reaching the largest units in 480 beats). For each:
//   token sign flips 0 (every token keeps its sign for life), pure in integers every beat, share of fear at
//   most 1/3, no fear with the fear beat off. Control: the committed-table color weave flips signs
// - the matter pair reverses exactly over 96 beats in fixed units of 9 x 4^200 x 3^200 and keeps love minus
//   fear; 0 frame mismatches under a change of frame in every dock on the vacuum and matter pairs, and
//   mismatches when the love-fear kernel is the swap phase (the control)
// - interference and CHSH on the vacuum pair, a love and a fear, from |0>|0bar>: on flat links the chance
//   of reading (0, 0) after three meetings is 1/3, 1/3, 1, the dephased stand-in 1/3, 1/3, 1/3, fear off 1;
//   one beat after its first meeting on live links, CHSH above 2, the fear-off rule and the stand-in at most 2
// - option-1 storage with the center phase: the departure Delta = W - 1/81 evolved by the same kernels in
//   fixed units and stored as Delta omega^q (q the knot's love minus fear), for 480 beats on the vacuum and
//   matter pairs: at every beat the stored weights read back (omega^-q divided out) real and equal to Delta,
//   Delta equals the departure of the knot evolved the plain way, loves equal fears, the purity identity
//   81 sum delta^2 = 8 M^2 holds, and every role reading's chance equals the plain knot's; both kernels are
//   unital and keep the weight
// Reported: grain (units as 2^a 3^b), meetings like and love-fear, fears, CHSH values, q of each knot.
//
// The first run failed its sign-flip control, and the control was ill-posed: the committed table was run on
// this knit's matter pair (tokens 5 and 6), which happens not to flip there. The control now counts the flips
// of every dock-0 token on each knit (gated: 0 on the color turn knit, above 0 on the committed table). The
// same run showed both stored knots were a love and a fear (q = 0), where omega^q is 1, so the storage gate
// now also runs the grower, a like pair (q = 2 or -2), where the center phase is not trivial.
//
// Depth L2: a constructed rule on the adopted knit against stated gates.

import { experiment } from '@/test/scaffold/suite'
import { verdict } from '@/test/scaffold/verdict'
import { makeColorWeave } from '@/code/rule/color-weave'
import { COLOR_TURN_SPEC, colorTurnWeave } from '@/code/rule/color-turn-weave'
import { colorLocalBeat, makeColorLocalWeave } from '@/code/rule/color-local-weave'
import { collide, stream } from '@/code/rule/lattice-gas'
import {
  advanceWhole,
  colorLocalKnit,
  conjugateSecond,
  CONJUGATE_POINT,
  fearBeat,
  fearBeatBack,
  fearKernels,
  makeLattice,
  moveCoordinate,
  reduceWhole,
  swapPhase,
  wholeKernel,
  wholeLovesAndFears,
  wholeUnits,
  type BeatRecord,
  type FearKernels,
  type Knit,
  type Lattice,
  type Whole,
} from '@/code/rule/fear-weave'
import { departureChances, departureOf, kernelIsUnital, kernelKeepsWeight, reduceDeparture, type Departure } from '@/code/rule/calm-weave'
import { timesOmega } from '@/code/rule/signed-knot'
import { roleChsh, roleDensity } from '@/code/measure/role-bell'
import { d4BoxDistance } from '@/code/substrate/d4-box'

const GOLDEN = (Math.sqrt(5) - 1) / 2
const OMEGA = (2 * Math.PI) / 3
const SIDE = 3
const MATTER_SCALE = 2.11
const SEARCH_BEATS = 240
const BEATS = 480
const REVERSAL_BEATS = 96
const GAUGE_BEATS = 48

type Row = { units: bigint; loves: bigint; fears: bigint }

function basisWhole(tokens: readonly number[], digits: readonly number[]): Whole {
  const weight = new Array<bigint>(9 ** tokens.length).fill(0n)

  for (let i = 0; i < weight.length; i++) {
    const on = tokens.every((_, c) => Math.floor((Math.floor(i / 9 ** (tokens.length - 1 - c)) % 9) / 3) === digits[c])

    weight[i] = on ? 1n : 0n
  }

  return { tokens, weight }
}

const readingOf = (i: number): number => Math.floor(Math.floor(i / 9) / 3) * 3 + Math.floor((i % 9) / 3)

function dephase(whole: Whole): Whole {
  const role = new Array<bigint>(9).fill(0n)

  whole.weight.forEach((w, i) => {
    role[readingOf(i)] = (role[readingOf(i)] ?? 0n) + w
  })

  return { tokens: whole.tokens, weight: whole.weight.map((_, i) => role[readingOf(i)] ?? 0n) }
}

function chance(whole: Whole, reading: number): number {
  return Number(whole.weight.reduce((s, w, i) => (readingOf(i) === reading ? s + w : s), 0n)) / Number(wholeUnits(whole))
}

// the knot with the second token taken back from the reflected point to its own conjugate convention
const native = (whole: Whole): Whole => ({ tokens: whole.tokens, weight: whole.weight.map((_, i) => whole.weight[Math.floor(i / 9) * 9 + (CONJUGATE_POINT[i % 9] ?? 0)] ?? 0n) })

export default experiment({
  id: 'quantum/fear-turn-weave',
  code: 'E-QTM-0109',
  title:
    'the fear weave on the hop-free color turn weave: the color mode keeps every token sign for life, stays exact, pure, reversible, frame-covariant and under a third fear, interferes and violates CHSH, and stored as its departure from calm times omega^q it reads back unchanged at every beat',
  category: 'quantum',
  substrates: ['3434'],
  depth: 'L2',
  paper: false,
  run() {
    const weave = makeColorWeave({ side: SIDE, table: 'bind' })
    const { mesh, moves, opposite } = weave
    const slots = mesh.cellCount * 24
    const liveLinks = weave.links
    const flatLinks = new Int16Array(slots).fill(moves.identity)
    const knit: Knit = colorLocalKnit({
      opposite,
      couplesZero: COLOR_TURN_SPEC.couplesZero,
      turn: COLOR_TURN_SPEC.turn,
      positionAt: COLOR_TURN_SPEC.positionAt,
      swapAt: COLOR_TURN_SPEC.swapAt,
      table: COLOR_TURN_SPEC.tables[0] ?? [],
      swapWhen: COLOR_TURN_SPEC.swapWhen,
    })
    const on = fearKernels({ like: OMEGA, unlike: OMEGA, likeExchanged: false })!
    const back = fearKernels({ like: -OMEGA, unlike: -OMEGA, likeExchanged: false })!
    const off = fearKernels({ like: 0, unlike: 0, likeExchanged: false })!
    const swapControl: FearKernels = { ...on, unlike: conjugateSecond(wholeKernel(swapPhase(OMEGA), 1000)?.kernel ?? []), unlikeDivisor: 4 }
    const openOf = (tokens: readonly number[]): Uint8Array => {
      const open = new Uint8Array(slots)

      for (const t of tokens) {
        open[t] = 1
      }

      return open
    }
    const golden = (scale: number) => {
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

    // the knit is the color turn weave
    let knitMismatch = 0
    let knitMeetings = 0

    {
      const start = golden(1.37)
      const allOpen = new Uint8Array(slots).fill(1)
      const turned = makeColorLocalWeave({ side: SIDE, spec: COLOR_TURN_SPEC })
      const forward = colorTurnWeave({ opposite })
      let lattice = makeLattice(start)
      let will = { mesh, data: Int8Array.from(start.vibe) }
      let state = { vibe: Int8Array.from(start.vibe), role: Int8Array.from(start.point), flow: new Int32Array(slots) }
      const delta = Int8Array.from(start.point)

      for (let t = 0; t < 24; t++) {
        const r = fearBeat({ weave, links: liveLinks, lattice, open: allOpen, t, knit })

        lattice = r.lattice
        knitMeetings += r.record.meetings.length

        for (const [tk, g] of r.record.crossings) {
          delta[tk] = moves.act[g]?.[delta[tk] ?? 0] ?? 0
        }

        collide(will, forward(t))
        will = stream(will)
        state = colorLocalBeat(turned, state, t)

        for (let s = 0; s < slots; s++) {
          knitMismatch += lattice.vibe[s] === will.data[s] ? 0 : 1
          knitMismatch += lattice.vibe[s] === state.vibe[s] ? 0 : 1
          knitMismatch += (delta[lattice.token[s] ?? 0] ?? 0) === state.role[s] ? 0 : 1
        }
      }
    }

    const recordsOf = (background: { vibe: Int8Array; point: Int8Array }, links: Int16Array, open: Uint8Array, beats: number, k: Knit | undefined, w = weave): BeatRecord[] => {
      let lattice = makeLattice(background)
      const out: BeatRecord[] = []

      for (let t = 0; t < beats; t++) {
        const r = fearBeat({ weave: w, links, lattice, open, t, knit: k })

        lattice = r.lattice
        out.push(r.record)
      }

      return out
    }

    // the three knots
    let vacuumPair: number[] = []

    for (let d = 0; d < 24 && vacuumPair.length === 0; d++) {
      const o = opposite[d] ?? d

      if (o > d && recordsOf(vacuum, liveLinks, openOf([d, o]), 24, knit).some(r => r.meetings.length > 0)) {
        vacuumPair = [d, o]
      }
    }

    const dock0 = openOf(Array.from({ length: 24 }, (_, s) => s))
    const counts = new Map<string, number>()

    for (const r of recordsOf(matter, liveLinks, dock0, SEARCH_BEATS, knit)) {
      for (const [a, b] of r.meetings) {
        const key = `${Math.min(a, b)},${Math.max(a, b)}`

        counts.set(key, (counts.get(key) ?? 0) + 1)
      }
    }

    const ranked = [...counts.entries()].sort((x, y) => y[1] - x[1] || (x[0] < y[0] ? -1 : 1)).map(([k]) => k.split(',').map(Number))
    const matterPair = ranked[0] ?? [0, 1]
    const signOfToken = (vibe: Int8Array, tk: number): number => (vibe[tk] ?? 0) || (weave.side[tk % 24] ?? 1)

    const study = (background: { vibe: Int8Array; point: Int8Array }, tokens: number[], kernels: FearKernels, links: Int16Array, start: Whole) => {
      const records = recordsOf(background, links, openOf(tokens), BEATS, knit)
      let whole: Whole = start
      const rows: Row[] = []
      let pure = true
      let like = 0
      let unlike = 0
      let flips = 0
      const last = new Map<number, number>(tokens.map(tk => [tk, signOfToken(background.vibe, tk)]))

      for (const record of records) {
        record.meetings.forEach(([ta, tb], k) => {
          const [sa, sb] = record.signs?.[k] ?? [1, 1]

          like += sa === sb ? 1 : 0
          unlike += sa === sb ? 0 : 1
          flips += (last.get(ta) === sa ? 0 : 1) + (last.get(tb) === sb ? 0 : 1)
          last.set(ta, sa)
          last.set(tb, sb)
        })

        whole = advanceWhole({ weave, whole, record, kernel4: [], color: kernels, fixed: false, forward: true })!

        const units = wholeUnits(whole)

        pure = pure && 81n * whole.weight.reduce((s, w) => s + w * w, 0n) === 9n * units * units

        if (record.meetings.length > 0) {
          rows.push({ units, ...wholeLovesAndFears(whole) })
        }
      }

      const top = rows.reduce((m, r) => (r.units > m ? r.units : m), wholeUnits(start))
      const power = (p: bigint): number => {
        let u = top
        let k = 0

        while (u % p === 0n) {
          u /= p
          k++
        }

        return k
      }

      return {
        records,
        rows,
        pure,
        like,
        unlike,
        flips,
        twos: power(2n),
        threes: power(3n),
        fearsMax: Number(rows.reduce((m, r) => (r.fears > m ? r.fears : m), 0n)),
        shareMax: Math.max(0, ...rows.map(r => Number(r.fears) / Number(r.loves + r.fears))),
        final: whole,
      }
    }

    const vacuumStudy = study(vacuum, vacuumPair, on, liveLinks, basisWhole(vacuumPair, [0, 0]))
    const matterStudy = study(matter, matterPair, on, liveLinks, basisWhole(matterPair, [0, 1]))
    const growerCandidates = ranked.slice(0, 12).map(pair => ({ pair, s: study(matter, pair, on, liveLinks, basisWhole(pair, [0, 1])) }))
    const grower = growerCandidates.reduce((best, c) => (c.s.twos + c.s.threes > best.s.twos + best.s.threes ? c : best), growerCandidates[0]!)
    const offStudies = [study(vacuum, vacuumPair, off, liveLinks, basisWhole(vacuumPair, [0, 0])), study(matter, matterPair, off, liveLinks, basisWhole(matterPair, [0, 1]))]
    // sign flips of every dock-0 token that meets another, on a knit
    const dockFlips = (k: Knit | undefined, w: ReturnType<typeof makeColorWeave>): number => {
      const records = recordsOf(matter, w.links, dock0, BEATS, k, w)
      let flips = 0
      const last = new Map<number, number>(Array.from({ length: 24 }, (_, tk) => [tk, signOfToken(matter.vibe, tk)]))

      for (const r of records) {
        r.meetings.forEach(([ta, tb], k) => {
          const [sa, sb] = r.signs?.[k] ?? [1, 1]

          flips += (last.get(ta) === sa ? 0 : 1) + (last.get(tb) === sb ? 0 : 1)
          last.set(ta, sa)
          last.set(tb, sb)
        })
      }

      return flips
    }
    const committedFlips = dockFlips(undefined, makeColorWeave({ side: SIDE, table: 'pair' }))
    const turnFlips = dockFlips(knit, weave)

    // reversal and charge on the matter pair
    let reverses = false
    let chargeKept = true

    {
      const units = 9n * 4n ** 200n * 3n ** 200n
      const open = openOf(matterPair)
      let lattice: Lattice = makeLattice(matter)
      const start = lattice
      const whole0: Whole = { tokens: matterPair, weight: basisWhole(matterPair, [2, 0]).weight.map(w => w * (units / 9n)) }
      let whole: Whole | null = whole0

      for (let t = 0; t < REVERSAL_BEATS; t++) {
        const r = fearBeat({ weave, links: liveLinks, lattice, open, t, knit })

        lattice = r.lattice
        whole = whole ? advanceWhole({ weave, whole, record: r.record, kernel4: [], color: on, fixed: true, forward: true }) : null
        chargeKept = chargeKept && whole !== null && wholeUnits(whole) === units
      }

      for (let t = REVERSAL_BEATS - 1; t >= 0; t--) {
        const r = fearBeatBack({ weave, links: liveLinks, lattice, open, t, knit })

        lattice = r.lattice
        whole = whole ? advanceWhole({ weave, whole, record: r.record, kernel4: [], color: back, fixed: true, forward: false }) : null
      }

      reverses =
        whole !== null &&
        whole.weight.every((w, i) => w === whole0.weight[i]) &&
        lattice.token.every((tk, s) => tk === start.token[s]) &&
        lattice.vibe.every((v, s) => v === start.vibe[s])
    }

    // frame: a frame in every dock, links changed to match
    const frame = Array.from({ length: mesh.cellCount }, (_, x) => Math.floor((((x + 11) * GOLDEN * 5.9) % 1) * moves.act.length))
    const gaugeLinks = new Int16Array(slots)

    for (let x = 0; x < mesh.cellCount; x++) {
      for (let d = 0; d < 24; d++) {
        gaugeLinks[x * 24 + d] = moves.compose(
          moves.compose(frame[mesh.neighbour(x, d)] ?? moves.identity, liveLinks[x * 24 + d] ?? moves.identity),
          moves.inverse[frame[x] ?? moves.identity] ?? moves.identity,
        )
      }
    }

    const transform = (lattice: Lattice, whole: Whole): Whole => {
      const at = new Map<number, number>()

      lattice.token.forEach((tk, s) => at.set(tk, Math.floor(s / 24)))

      let moved = whole

      whole.tokens.forEach((tk, c) => {
        moved = moveCoordinate(moved, c, moves.act[frame[at.get(tk) ?? 0] ?? moves.identity] ?? [])
      })

      return moved
    }
    const frameMismatch = (background: { vibe: Int8Array; point: Int8Array }, tokens: number[], kernels: FearKernels, start: Whole): { mismatch: number; meetings: number } => {
      const open = openOf(tokens)
      let a = { lattice: makeLattice(background), whole: start }
      let b = { lattice: makeLattice(background), whole: transform(a.lattice, start) }
      let mismatch = 0
      let meetings = 0

      for (let t = 0; t < GAUGE_BEATS; t++) {
        const ra = fearBeat({ weave, links: liveLinks, lattice: a.lattice, open, t, knit })
        const rb = fearBeat({ weave, links: gaugeLinks, lattice: b.lattice, open, t, knit })

        meetings += ra.record.meetings.length
        a = { lattice: ra.lattice, whole: advanceWhole({ weave, whole: a.whole, record: ra.record, kernel4: [], color: kernels, fixed: false, forward: true })! }
        b = { lattice: rb.lattice, whole: advanceWhole({ weave, whole: b.whole, record: rb.record, kernel4: [], color: kernels, fixed: false, forward: true })! }

        const expected = reduceWhole(transform(a.lattice, a.whole)).weight
        const actual = reduceWhole(b.whole).weight

        mismatch += expected.reduce((n, w, i) => n + (w === actual[i] ? 0 : 1), 0)
      }

      return { mismatch, meetings }
    }
    const frameVacuum = frameMismatch(vacuum, vacuumPair, on, basisWhole(vacuumPair, [0, 0]))
    const frameMatter = frameMismatch(matter, matterPair, on, basisWhole(matterPair, [0, 1]))
    const frameControl = frameMismatch(vacuum, vacuumPair, swapControl, basisWhole(vacuumPair, [0, 0]))

    // interference and CHSH on the vacuum pair
    const flatRecords = recordsOf(vacuum, flatLinks, openOf(vacuumPair), 60, knit)
    const chances = (kernels: FearKernels, dephased: boolean): number[] => {
      let whole = basisWhole(vacuumPair, [0, 0])
      const out: number[] = []

      for (const record of flatRecords) {
        whole = advanceWhole({ weave, whole, record, kernel4: [], color: kernels, fixed: false, forward: true })!

        if (record.meetings.length > 0 && out.length < 3) {
          whole = dephased ? dephase(whole) : whole
          out.push(chance(whole, 0))
        }
      }

      return out
    }
    const quantum = chances(on, false)
    const standIn = chances(on, true)
    const fearOff = chances(off, false)
    const liveRecords = vacuumStudy.records
    const firstMeeting = liveRecords.findIndex(r => r.meetings.length > 0)
    const readState = (kernels: FearKernels, dephased: boolean): Whole => {
      let whole = basisWhole(vacuumPair, [0, 0])

      for (let t = 0; t <= firstMeeting + 1; t++) {
        const record = liveRecords[t]!

        whole = advanceWhole({ weave, whole, record, kernel4: [], color: kernels, fixed: false, forward: true })!
        whole = dephased && record.meetings.length > 0 ? dephase(whole) : whole
      }

      return whole
    }
    const bell = roleChsh(roleDensity(native(readState(on, false))))
    const bellOff = roleChsh(roleDensity(native(readState(off, false))))
    const bellStandIn = roleChsh(roleDensity(native(readState(on, true))))
    const readCells = (() => {
      let lattice = makeLattice(vacuum)

      for (let t = 0; t <= firstMeeting + 1; t++) {
        lattice = fearBeat({ weave, links: liveLinks, lattice, open: openOf(vacuumPair), t, knit }).lattice
      }

      return vacuumPair.map(tk => Math.floor(lattice.token.indexOf(tk) / 24))
    })()
    const separation = d4BoxDistance({ a: readCells[0] ?? 0, b: readCells[1] ?? 0, side: SIDE })

    // option-1 storage with the center phase
    const unital = [on, back].every(k => kernelIsUnital(k.like, k.likeDivisor) && kernelKeepsWeight(k.like, k.likeDivisor) && kernelIsUnital(k.unlike, k.unlikeDivisor) && kernelKeepsWeight(k.unlike, k.unlikeDivisor))
    const storage = (background: { vibe: Int8Array; point: Int8Array }, tokens: number[], start: Whole) => {
      const records = recordsOf(background, liveLinks, openOf(tokens), BEATS, knit)
      const q = tokens.reduce((s, tk) => s + signOfToken(background.vibe, tk), 0)
      const scale = 4n ** 200n * 3n ** 200n
      const d0 = departureOf(start)
      let plain: Whole = start
      let delta: Whole = { tokens, weight: d0.delta.map(x => x * scale) }
      const stored0 = timesOmega(delta.weight, delta.weight.map(() => 0n), q)
      let re: Whole = { tokens, weight: stored0.re }
      let om: Whole = { tokens, weight: stored0.om }
      const units = d0.units * scale
      let mismatches = 0

      for (const record of records) {
        plain = advanceWhole({ weave, whole: plain, record, kernel4: [], color: on, fixed: false, forward: true })!
        delta = advanceWhole({ weave, whole: delta, record, kernel4: [], color: on, fixed: true, forward: true })!
        re = advanceWhole({ weave, whole: re, record, kernel4: [], color: on, fixed: true, forward: true })!
        om = advanceWhole({ weave, whole: om, record, kernel4: [], color: on, fixed: true, forward: true })!

        const read = timesOmega(re.weight, om.weight, -q)
        const readsBack = read.om.every(x => x === 0n) && read.re.every((x, i) => x === delta.weight[i])
        const direct: Departure = reduceDeparture({ tokens, delta: delta.weight, units })
        const fromPlain = departureOf(plain)
        const same = direct.units === fromPlain.units && direct.delta.every((x, i) => x === fromPlain.delta[i])
        const balanced = delta.weight.reduce((s, x) => s + x, 0n) === 0n
        const purity = 81n * delta.weight.reduce((s, x) => s + x * x, 0n) === 8n * units * units
        const c = departureChances(direct)
        const plainUnits = wholeUnits(plain)
        const chancesSame = c.numerator.every((n, reading) => n * plainUnits === plain.weight.reduce((s, w, i) => (readingOf(i) === reading ? s + w : s), 0n) * c.denominator)

        mismatches += (readsBack ? 0 : 1) + (same ? 0 : 1) + (balanced ? 0 : 1) + (purity ? 0 : 1) + (chancesSame ? 0 : 1)
      }

      return { q, mismatches, beats: records.length }
    }
    const storedVacuum = storage(vacuum, vacuumPair, basisWhole(vacuumPair, [0, 0]))
    const storedMatter = storage(matter, matterPair, basisWhole(matterPair, [0, 1]))
    const storedGrower = storage(matter, grower.pair, basisWhole(grower.pair, [0, 1]))

    const exact = (x: number, y: number): boolean => Math.abs(x - y) < 1e-12
    const knots = [vacuumStudy, matterStudy, grower.s]
    const ok =
      knitMismatch === 0 &&
      knitMeetings > 0 &&
      vacuumPair.length === 2 &&
      knots.every(s => s.flips === 0 && s.pure && s.shareMax <= 1 / 3) &&
      turnFlips === 0 &&
      storedGrower.q !== 0 &&
      storedGrower.mismatches === 0 &&
      offStudies.every(s => s.fearsMax === 0) &&
      committedFlips > 0 &&
      reverses &&
      chargeKept &&
      frameVacuum.mismatch === 0 &&
      frameMatter.mismatch === 0 &&
      frameControl.mismatch > 0 &&
      exact(quantum[0] ?? 0, 1 / 3) &&
      exact(quantum[1] ?? 0, 1 / 3) &&
      exact(quantum[2] ?? 0, 1) &&
      standIn.every(c => exact(c, 1 / 3)) &&
      fearOff.every(c => c === 1) &&
      bell > 2 + 1e-6 &&
      bellOff <= 2 + 1e-9 &&
      bellStandIn <= 2 + 1e-9 &&
      unital &&
      storedVacuum.mismatches === 0 &&
      storedMatter.mismatches === 0

    return verdict({
      status: ok ? 'pass' : 'fail',
      claim:
        'the knit is the color turn weave at every slot; on it the color mode keeps every token sign for life where the committed table flips them, stays pure and under a third fear, reverses exactly and keeps love minus fear, commutes with a frame change in every dock where the swap phase at love-fear meetings does not, gives 1/3, 1/3, 1 against 1/3 dephased and CHSH above 2 against 2, and stored as its departure from calm times omega^q reads back real and unchanged, balanced, pure and with every chance equal at every beat',
      metrics: {
        knitMismatch,
        knitMeetingsChecked: knitMeetings,
        vacuumPairFirst: vacuumPair[0] ?? -1,
        vacuumPairSecond: vacuumPair[1] ?? -1,
        matterPairFirst: matterPair[0] ?? -1,
        matterPairSecond: matterPair[1] ?? -1,
        growerFirst: grower.pair[0] ?? -1,
        growerSecond: grower.pair[1] ?? -1,
        ...Object.fromEntries(
          (
            [
              ['Vacuum', vacuumStudy],
              ['Matter', matterStudy],
              ['Grower', grower.s],
            ] as const
          ).flatMap(([name, s]) => [
            [`${name.toLowerCase()}LikeMeetings`, s.like],
            [`${name.toLowerCase()}LoveFearMeetings`, s.unlike],
            [`${name.toLowerCase()}SignFlips`, s.flips],
            [`${name.toLowerCase()}UnitsMaxPowerOf2`, s.twos],
            [`${name.toLowerCase()}UnitsMaxPowerOf3`, s.threes],
            [`${name.toLowerCase()}FearsMax`, s.fearsMax],
            [`${name.toLowerCase()}FearShareMax`, s.shareMax],
            [`${name.toLowerCase()}Pure`, s.pure ? 1 : 0],
          ]),
        ),
        reversesExactly: reverses ? 1 : 0,
        loveMinusFearKept: chargeKept ? 1 : 0,
        frameMismatchVacuum: frameVacuum.mismatch,
        frameMeetingsVacuum: frameVacuum.meetings,
        frameMismatchMatter: frameMatter.mismatch,
        frameMeetingsMatter: frameMatter.meetings,
        chanceAfterMeeting1: quantum[0] ?? -1,
        chanceAfterMeeting2: quantum[1] ?? -1,
        chanceAfterMeeting3: quantum[2] ?? -1,
        firstMeetingBeat: firstMeeting,
        tokenSeparationAtReading: separation,
        chsh: bell,
        kernelsUnitalAndWeightKeeping: unital ? 1 : 0,
        storedVacuumCharge: storedVacuum.q,
        storedVacuumMismatches: storedVacuum.mismatches,
        storedMatterCharge: storedMatter.q,
        storedMatterMismatches: storedMatter.mismatches,
        storedBeats: storedMatter.beats,
        storedGrowerCharge: storedGrower.q,
        storedGrowerMismatches: storedGrower.mismatches,
        dock0SignFlipsTurnKnit: turnFlips,
      },
      control: {
        committedTableSignFlips: committedFlips,
        frameMismatchSwapAtLoveFear: frameControl.mismatch,
        fearOffFearsMax: Math.max(...offStudies.map(s => s.fearsMax)),
        standInChance3: standIn[2] ?? -1,
        fearOffChanceMin: Math.min(...fearOff),
        chshFearOff: bellOff,
        chshStandIn: bellStandIn,
      },
      notes:
        'L2, exact BigInt weights, golden-ratio fills, no random numbers. The knit is built from COLOR_TURN_SPEC by code/rule/fear-weave colorLocalKnit, which rebuilds its positions as code/rule/color-local-weave does (that module does not export them). The stored departure runs in fixed units 81 x 4^200 x 3^200, reduced only when read. A two-token knot always meets the same way (its signs are for life), so one kernel serves its meetings; the center factor omega^q is carried as two whole-number arrays evolved by the same real kernel. The grower is the matter pair among the twelve meeting most whose units grow the most.',
    })
  },
})
