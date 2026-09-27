// Calm is the one whole: every knot of the fear weave stored as its departure from the fully mixed state,
// so its loves and fears are equal, run on the committed lattice beside the fear weave's own storage
// (code/rule/calm-weave, code/rule/fear-weave, E-QTM-0099).
//
// STATUS (2026-09-26, E-MTH-0028): pass at the default integer link start (E-MTH-0027), pass on 8 of 17 starts of the
// start family. Eight failing starts (integer+2 to 7, 12 and the retired golden start) are the ones whose live-link
// reading lands on the middle rung 4 / sqrt 3 of one meeting's ladder, where gate 12 asks for sqrt 7. The ninth,
// integer+9, reads the top rung and fails gate 4 alone: the grower pair meets 17 times in 480 beats and at grain
// 9 x 4 both the knot and its departure refuse at meeting 12, but at grain 9 x 16 neither refuses at all (0 and 0),
// and the gate requires a refusal. Knot and departure agree at both grains, so this is a clause that could not fire
// on that history (an instrument artifact), not a disagreement between the two storages.
//
// The question. On the lattice love minus fear is the vibe charge and from calm it is 0. On the role grid a
// knot's weights sum to 1, so love minus fear is one whole in every knot. Store instead
// Delta = W - U, U = 1 / 9^k on each of the 9^k joint points of k roles: Delta sums to 0, so love = fear
// inside every knot, and the one whole moves into calm, which is the same for every knot and never stored.
// This works only if U is fixed by every step, so that Delta moves by the same kernel W does.
//
// Knots, from the fear weave's runs on the committed turning weave (pair table, hop kept), side-3 D4 box,
// 480 beats on the live links:
// - the vacuum pair (tokens 4 and 7, made together from calm, E-QTM-0099), from |0>|1>
// - the grower pair (tokens 4 and 20, the pair that spends the most grain in E-QTM-0099), from |0>|1>
// - the matter pair: on the golden-ratio fill at 2.11, the pair of cell-0 tokens meeting most often in
//   480 beats, from |0>|1>
// - the matter triple: the cell-0 triple whose three pairs all meet, with the most meetings (E-QTM-0100),
//   from |0>|1>|2>
//
// Gates, fixed before the first run:
// 1. U is fixed by every step: the meeting kernels at 2 pi / 3, -2 pi / 3 and pi have every row and every
//    column summing to 4, and every one of the 216 grid moves is a permutation of the 9 points. Control:
//    the reset kernel rho -> |0><0| keeps weight (columns sum to 9) but is not unital (rows do not)
// 2. the same kernel moves Delta: for all four knots, U + Delta read back as whole numbers equals the fear
//    weave's knot at every one of the 480 beats, 0 mismatches. Control: with the reset kernel at the
//    meetings, Delta run alone disagrees with the departure of the knot run the fear weave's way
// 3. chances: the chances of the 3^k role readings, read as 1 / 3^k plus the sum of Delta over the
//    reading's points, sum to 1 and lie in [0, 1] at every beat
// 4. exact integers: every weight is a BigInt, and in fixed units the departure refuses at exactly the
//    meeting the knot does (grower pair, 9 x 4^m units against their departure's 81 x 4^m, m = 1, 2)
// 5. love = fear: every departure sums to 0 at every beat. This holds by construction and is recorded, not
//    counted as evidence. The share of fear is then 1/2 exactly, also by construction
// 6. purity: 9^k sum delta^2 = (3^k - 1) M^2 at every beat for every knot, the form sum Delta^2 = 1 / 3^k -
//    1 / 9^k takes for a pure state. With love = fear it caps the loves at sqrt(3^k - 1) / 2 wholes
// 7. the grain cost of calm: the departure's units over the knot's units are exactly 3^k at every beat
//    (9 for a pair, 27 for the triple), predicted from the 3-adic valuation of the knot's units staying k
// 8. classical steps only permute: on every beat with no meeting inside the knot, the multiset of the
//    departure's weights is unchanged
// 9. reversal: the matter pair's departure, fixed units 81 x 4^200, 96 beats forward and back on live links,
//    restored exactly with the lattice
// 10. lattice charge: the vibe sum is the same after every beat, and for the vacuum pair made from calm
//    the grid's love minus fear (0) equals the vibe charge its two tokens carry, at every beat. The fear
//    weave's own storage (love minus fear one whole) is reported against the same count
// 11. charge conjugation C, (a, b) -> (a, -b) on the grid: the conjugated kernel at 2 pi / 3 is exactly the
//    kernel at -2 pi / 3 (C sends the rule to its reverse phase), and C applied to a departure gives a
//    departure whose role readings are the same, at every beat. The literal swap of love and fear
//    (every weight negated) is predicted NOT to be a symmetry of states: -Delta is 2 U - W, and on a pure
//    knot some reading goes negative
// 12. every measured quantum result unchanged, read from departures alone: on flat links the vacuum pair
//    reads (1, 0) with chance 1/4, 3/4, 1 after its first three meetings, and on live links one beat after
//    its first meeting its CHSH value is sqrt 7 (to 1e-6), as in E-QTM-0100
// 13. merging: the departures of |0> and |1> on one token each, joined as calm-weave's tensor rule, equal
//    the departure of the pair |0>|1> exactly, and three singles give the triple's
//
// The first run passed every gate. The loves reach 1.17 wholes in a pair (bound 1.41) and 2.08 in the
// triple (bound 2.55), where the fear weave's storage allows 2. The grid's love minus fear matches the
// vibe charge of the pair made from calm on 480 of 480 beats (the fear weave's one whole: 0 of 480), and
// the other knots' on 98 to 199 of 480, since their tokens trade vibes with the matter around them.
//
// Depth L2: a storage of the fear weave on the committed lattice against stated gates. Its central result
// (love = fear in every knot) is by construction; what is measured is that nothing else breaks and what it
// costs.

import { experiment } from '@/test/scaffold/suite'
import { verdict } from '@/test/scaffold/verdict'
import { makeColorWeave } from '@/code/rule/color-weave'
import {
  advanceWhole,
  fearBeat,
  fearBeatBack,
  makeLattice,
  meetingKernel,
  reduceWhole,
  swapPhase,
  wholeUnits,
  type BeatRecord,
  type Lattice,
  type Whole,
} from '@/code/rule/fear-weave'
import {
  advanceDeparture,
  conjugateIndex,
  conjugateKernel,
  departureChances,
  departureLovesAndFears,
  departureOf,
  kernelIsUnital,
  kernelKeepsWeight,
  mergeDepartures,
  wholeOfDeparture,
  type Departure,
} from '@/code/rule/calm-weave'
import { roleChsh, roleDensity } from '@/code/measure/role-bell'

const GOLDEN = (Math.sqrt(5) - 1) / 2
const OMEGA = (2 * Math.PI) / 3
const SIDE = 3
const MATTER_SCALE = 2.11
const BEATS = 480
const REVERSAL_BEATS = 96
const VACUUM_PAIR = [4, 7]
const GROWER_PAIR = [4, 20]

function basisWhole(tokens: readonly number[], digits: readonly number[]): Whole {
  const weight = new Array<bigint>(9 ** tokens.length).fill(0n)

  for (let i = 0; i < weight.length; i++) {
    const on = tokens.every((_, c) => Math.floor((Math.floor(i / 9 ** (tokens.length - 1 - c)) % 9) / 3) === digits[c])

    weight[i] = on ? 1n : 0n
  }

  return { tokens, weight }
}

const sameWeights = (a: readonly bigint[], b: readonly bigint[]): boolean => a.length === b.length && a.every((w, i) => w === b[i])
const sameDeparture = (a: Departure, b: Departure): boolean => a.units === b.units && sameWeights(a.delta, b.delta)

export default experiment({
  id: 'quantum/calm-is-the-one-whole',
  code: 'E-QTM-0105',
  title:
    'calm is the one whole, pass at the default integer link start (E-MTH-0027), and on 8 of 17 starts of E-MTH-0028\'s family: stored as its departure from the fully mixed state, every knot of the fear weave holds exactly as many loves as fears, the departure moves by the same kernel because every step fixes calm, and nothing measured changes (chances 1/4, 3/4, 1, exact reversal, purity, CHSH sqrt 7 = 2.6458 at the default start, the top rung of one meeting\'s ladder), at a grain cost of exactly 3^k units per knot of k roles; it fails its sqrt 7 gate on the 8 starts whose reading lands on the middle rung 4 / sqrt 3 (the retired golden start among them), and at integer+9 on its refusal clause alone, where the grower pair at grain 9 x 16 never refuses in 480 beats (knot and departure agree, 0 and 0), so the clause cannot fire; charge conjugation stays a symmetry but the literal swap of love and fear does not',
  category: 'quantum',
  substrates: ['3434'],
  depth: 'L2',
  paper: false,
  run() {
    const weave = makeColorWeave({ side: SIDE, table: 'pair' })
    const { mesh, moves } = weave
    const slots = mesh.cellCount * 24
    const liveLinks = weave.links
    const flatLinks = new Int16Array(slots).fill(moves.identity)
    const kThird = meetingKernel(swapPhase(OMEGA)) ?? []
    const kThirdBack = meetingKernel(swapPhase(-OMEGA)) ?? []
    const kPi = meetingKernel(swapPhase(Math.PI)) ?? []
    // the reset rho -> |0><0| on both roles, as 9 K: every point sends its weight to the 9 points of |00>
    const zeroZero = basisWhole([0, 1], [0, 0]).weight
    const kReset = Array.from({ length: 81 }, (_, r) => Array.from({ length: 81 }, () => Number(zeroZero[r] ?? 0n)))
    const openOf = (tokens: readonly number[]): Uint8Array => {
      const open = new Uint8Array(slots)

      for (const t of tokens) {
        open[t] = 1
      }

      return open
    }
    const vacuum = { vibe: new Int8Array(slots), point: new Int8Array(slots) }
    const matter = { vibe: new Int8Array(slots), point: new Int8Array(slots) }

    for (let i = 0; i < slots; i++) {
      const u = ((i + 1) * GOLDEN * MATTER_SCALE) % 1

      matter.vibe[i] = u < 0.3 ? -1 : u < 0.6 ? 0 : 1
      matter.point[i] = Math.floor(((i + 3) * GOLDEN * MATTER_SCALE * 9) % 9)
    }

    const run = (background: typeof vacuum, links: Int16Array, open: Uint8Array, beats: number): { records: BeatRecord[]; lattices: Lattice[] } => {
      let lattice = makeLattice(background)
      const records: BeatRecord[] = []
      const lattices: Lattice[] = []

      for (let t = 0; t < beats; t++) {
        const r = fearBeat({ weave, links, lattice, open, t })

        lattice = r.lattice
        records.push(r.record)
        lattices.push(lattice)
      }

      return { records, lattices }
    }

    // 1. U is fixed by every step
    const kernelsUnital = [kThird, kThirdBack, kPi].every(k => k.length === 81 && kernelIsUnital(k, 4) && kernelKeepsWeight(k, 4))
    const movesPermute = moves.act.every(p => new Set(Array.from(p)).size === 9 && p.length === 9)
    const resetKeepsWeight = kernelKeepsWeight(kReset, 9)
    const resetUnital = kernelIsUnital(kReset, 9)

    // the matter pair and triple, from one classical run with cell 0 open
    const cell0 = openOf(Array.from({ length: 24 }, (_, s) => s))
    const pairMeetings = new Map<string, number>()

    for (const r of run(matter, liveLinks, cell0, BEATS).records) {
      for (const [a, b] of r.meetings) {
        const key = `${Math.min(a, b)},${Math.max(a, b)}`

        pairMeetings.set(key, (pairMeetings.get(key) ?? 0) + 1)
      }
    }

    const met = (a: number, b: number): number => pairMeetings.get(`${Math.min(a, b)},${Math.max(a, b)}`) ?? 0
    const matterPair = ([...pairMeetings.entries()].sort((x, y) => y[1] - x[1] || (x[0] < y[0] ? -1 : 1))[0]?.[0] ?? '0,1').split(',').map(Number)
    let triple: number[] = []
    let tripleMeetings = 0

    for (let a = 0; a < 24; a++) {
      for (let b = a + 1; b < 24; b++) {
        for (let c = b + 1; c < 24; c++) {
          const total = met(a, b) + met(a, c) + met(b, c)

          if (met(a, b) > 0 && met(a, c) > 0 && met(b, c) > 0 && total > tripleMeetings) {
            triple = [a, b, c]
            tripleMeetings = total
          }
        }
      }
    }

    // 2 to 8: each knot run both ways, beat by beat
    type Study = {
      mismatches: number
      chanceFaults: number
      balanced: boolean
      pure: boolean
      ratios: Set<bigint>
      permuteFaults: number
      permuteBeats: number
      meetings: number
      loveMaxWholes: number
      conjugateFaults: number
      swapMinChance: number
      chargeKept: boolean
      gridEqualsLattice: number
      oldEqualsLattice: number
    }
    const study = (background: typeof vacuum, tokens: number[], digits: number[]): Study => {
      const k = tokens.length
      const open = openOf(tokens)
      const { records, lattices } = run(background, liveLinks, open, BEATS)
      let whole: Whole = basisWhole(tokens, digits)
      let departure: Departure = departureOf(whole)
      const three = 3n ** BigInt(k)
      const nine = 9n ** BigInt(k)
      const out: Study = {
        mismatches: 0,
        chanceFaults: 0,
        balanced: true,
        pure: true,
        ratios: new Set(),
        permuteFaults: 0,
        permuteBeats: 0,
        meetings: 0,
        loveMaxWholes: 0,
        conjugateFaults: 0,
        swapMinChance: Number.POSITIVE_INFINITY,
        chargeKept: true,
        gridEqualsLattice: 0,
        oldEqualsLattice: 0,
      }
      const vibeCharge = background.vibe.reduce((a, b) => a + b, 0)
      const sorted = (d: Departure): string => [...d.delta].sort((a, b) => (a < b ? -1 : a > b ? 1 : 0)).join(',')

      records.forEach((record, t) => {
        const inside = record.meetings.length
        const before = sorted(departure)

        whole = advanceWhole({ weave, whole, record, kernel4: kThird, fixed: false, forward: true })!
        departure = advanceDeparture({ weave, departure, record, kernel: kThird, divisor: 4, fixed: false, forward: true })!
        out.meetings += inside

        if (inside === 0) {
          out.permuteBeats++
          out.permuteFaults += sorted(departure) === before ? 0 : 1
        }

        out.mismatches += sameWeights(wholeOfDeparture(departure).weight, reduceWhole(whole).weight) ? 0 : 1

        const chances = departureChances(departure)
        const total = chances.numerator.reduce((a, b) => a + b, 0n)

        out.chanceFaults += total === chances.denominator && chances.numerator.every(n => n >= 0n && n <= chances.denominator) ? 0 : 1

        const sum = departure.delta.reduce((a, b) => a + b, 0n)
        const squares = departure.delta.reduce((s, x) => s + x * x, 0n)

        out.balanced = out.balanced && sum === 0n
        out.pure = out.pure && nine * squares === (three - 1n) * departure.units * departure.units
        // the grain cost: departure units over knot units, or -1 when not a whole multiple
        out.ratios.add(departure.units % wholeUnits(whole) === 0n ? departure.units / wholeUnits(whole) : -1n)
        out.loveMaxWholes = Math.max(out.loveMaxWholes, Number(departureLovesAndFears(departure).loves) / Number(departure.units))

        // C: the departure of rho*, same role readings
        const conjugated: Departure = { tokens, delta: departure.delta.map((_, i) => departure.delta[conjugateIndex(i, k)] ?? 0n), units: departure.units }
        const cc = departureChances(conjugated)

        out.conjugateFaults += sameWeights(cc.numerator, chances.numerator) ? 0 : 1

        // the literal swap, -Delta
        const swapped = departureChances({ tokens, delta: departure.delta.map(x => -x), units: departure.units })

        out.swapMinChance = Math.min(out.swapMinChance, ...swapped.numerator.map(n => Number(n) / Number(swapped.denominator)))

        // charge: the lattice vibe sum, and the vibe charge the knot's tokens carry
        const lattice = lattices[t]!

        out.chargeKept = out.chargeKept && lattice.vibe.reduce((a, b) => a + b, 0) === vibeCharge

        let knotCharge = 0

        lattice.token.forEach((tk, s) => {
          if (open[tk] === 1) {
            knotCharge += lattice.vibe[s] ?? 0
          }
        })

        out.gridEqualsLattice += Number(sum) === knotCharge ? 1 : 0
        // the fear weave's storage: love minus fear is one whole
        out.oldEqualsLattice += knotCharge === 1 ? 1 : 0
      })

      return out
    }

    const inVacuum = study(vacuum, VACUUM_PAIR, [0, 1])
    const inGrower = study(matter, GROWER_PAIR, [0, 1])
    const inMatter = study(matter, matterPair, [0, 1])
    const inTriple = study(matter, triple, [0, 1, 2])
    const pairs = [inVacuum, inGrower, inMatter]
    const all = [...pairs, inTriple]

    // 2, control: the reset kernel at the meetings, Delta run alone against the knot run the fear weave's way
    let resetMismatches = 0

    {
      const { records } = run(vacuum, liveLinks, openOf(VACUUM_PAIR), BEATS)
      let whole: Whole = basisWhole(VACUUM_PAIR, [0, 1])
      let departure: Departure = departureOf(whole)

      for (const record of records) {
        whole = advanceWhole({ weave, whole, record, kernel4: kReset, fixed: false, forward: true, kernelOf: (a, b) => ({ kernel: kReset, divisor: 9, order: [a, b] }) })!
        departure = advanceDeparture({ weave, departure, record, kernel: kReset, divisor: 9, fixed: false, forward: true })!
        resetMismatches += sameDeparture(departure, departureOf(whole)) ? 0 : 1
      }
    }

    // 4. fixed units: the departure refuses at the knot's meeting
    const growerRecords = run(matter, liveLinks, openOf(GROWER_PAIR), BEATS).records
    const refusedAt = (m: number): { whole: number; departure: number } => {
      let whole: Whole | null = { tokens: GROWER_PAIR, weight: basisWhole(GROWER_PAIR, [0, 1]).weight.map(w => w * 4n ** BigInt(m)) }
      const d0 = departureOf(basisWhole(GROWER_PAIR, [0, 1]))
      let departure: Departure | null = { tokens: GROWER_PAIR, delta: d0.delta.map(x => x * 4n ** BigInt(m)), units: d0.units * 4n ** BigInt(m) }
      let meeting = 0
      const at = { whole: 0, departure: 0 }

      for (const record of growerRecords) {
        meeting += record.meetings.length
        whole = whole ? advanceWhole({ weave, whole, record, kernel4: kThird, fixed: true, forward: true }) : null
        departure = departure ? advanceDeparture({ weave, departure, record, kernel: kThird, divisor: 4, fixed: true, forward: true }) : null
        at.whole = at.whole || (whole ? 0 : meeting)
        at.departure = at.departure || (departure ? 0 : meeting)
      }

      return at
    }
    const refusals = [1, 2].map(refusedAt)
    const refusalsAgree = refusals.every(r => r.whole > 0 && r.whole === r.departure)

    // 9. reversal on the matter pair, fixed units
    let reverses = false
    let reversalMeetings = 0

    {
      const open = openOf(matterPair)
      let lattice = makeLattice(matter)
      const start = lattice
      const d0 = departureOf(basisWhole(matterPair, [2, 0]))
      const big = 4n ** 200n
      const first: Departure = { tokens: matterPair, delta: d0.delta.map(x => x * big), units: d0.units * big }
      let departure: Departure | null = first

      for (let t = 0; t < REVERSAL_BEATS; t++) {
        const r = fearBeat({ weave, links: liveLinks, lattice, open, t })

        lattice = r.lattice
        reversalMeetings += r.record.meetings.length
        departure = departure ? advanceDeparture({ weave, departure, record: r.record, kernel: kThird, divisor: 4, fixed: true, forward: true }) : null
      }

      for (let t = REVERSAL_BEATS - 1; t >= 0; t--) {
        const r = fearBeatBack({ weave, links: liveLinks, lattice, open, t })

        lattice = r.lattice
        departure = departure ? advanceDeparture({ weave, departure, record: r.record, kernel: kThirdBack, divisor: 4, fixed: true, forward: false }) : null
      }

      reverses =
        departure !== null &&
        sameDeparture(departure, first) &&
        lattice.vibe.every((v, i) => v === start.vibe[i]) &&
        lattice.token.every((v, i) => v === start.token[i]) &&
        lattice.point.every((v, i) => v === start.point[i])
    }

    // 11. C sends the rule at 2 pi / 3 to the rule at -2 pi / 3
    const conjugateIsReverse = conjugateKernel(kThird).every((row, r) => row.every((x, c) => x === (kThirdBack[r]?.[c] ?? 0)))

    // 12. the measured quantum results, from departures alone
    const flatRecords = run(vacuum, flatLinks, openOf(VACUUM_PAIR), 60).records
    const interference: number[] = []

    {
      let departure: Departure = departureOf(basisWhole(VACUUM_PAIR, [0, 1]))

      for (const record of flatRecords) {
        departure = advanceDeparture({ weave, departure, record, kernel: kThird, divisor: 4, fixed: false, forward: true })!

        if (record.meetings.length > 0 && interference.length < 3) {
          const c = departureChances(departure)

          interference.push(Number(c.numerator[3] ?? 0n) / Number(c.denominator))
        }
      }
    }

    const liveRecords = run(vacuum, liveLinks, openOf(VACUUM_PAIR), 60).records
    const firstMeeting = liveRecords.findIndex(r => r.meetings.length > 0)
    let bellDeparture: Departure = departureOf(basisWhole(VACUUM_PAIR, [0, 1]))

    for (let t = 0; t <= firstMeeting + 1; t++) {
      bellDeparture = advanceDeparture({ weave, departure: bellDeparture, record: liveRecords[t]!, kernel: kThird, divisor: 4, fixed: false, forward: true })!
    }

    const bell = roleChsh(roleDensity(wholeOfDeparture(bellDeparture)))

    // 13. merging
    const single = (token: number, digit: number): Departure => departureOf(basisWhole([token], [digit]))
    const mergedPair = mergeDepartures(single(VACUUM_PAIR[0] ?? 0, 0), single(VACUUM_PAIR[1] ?? 0, 1))
    const mergedTriple = mergeDepartures(mergeDepartures(single(triple[0] ?? 0, 0), single(triple[1] ?? 0, 1)), single(triple[2] ?? 0, 2))
    const mergesAgree =
      sameDeparture(mergedPair, departureOf(basisWhole(VACUUM_PAIR, [0, 1]))) && sameDeparture(mergedTriple, departureOf(basisWhole(triple, [0, 1, 2])))

    const exact = (x: number, y: number): boolean => Math.abs(x - y) < 1e-12
    const ratioExactly = (s: Study, k: number): boolean => s.ratios.size === 1 && s.ratios.has(3n ** BigInt(k))

    const ok =
      kernelsUnital &&
      movesPermute &&
      resetKeepsWeight &&
      !resetUnital &&
      all.every(s => s.mismatches === 0 && s.chanceFaults === 0 && s.balanced && s.pure && s.permuteFaults === 0 && s.conjugateFaults === 0 && s.chargeKept) &&
      all.every(s => s.meetings > 0) &&
      resetMismatches > 0 &&
      refusalsAgree &&
      pairs.every(s => ratioExactly(s, 2)) &&
      ratioExactly(inTriple, 3) &&
      reverses &&
      reversalMeetings > 0 &&
      inVacuum.gridEqualsLattice === BEATS &&
      conjugateIsReverse &&
      all.every(s => s.swapMinChance < 0) &&
      interference.length === 3 &&
      exact(interference[0] ?? 0, 1 / 4) &&
      exact(interference[1] ?? 0, 3 / 4) &&
      exact(interference[2] ?? 0, 1) &&
      Math.abs(bell - Math.sqrt(7)) < 1e-6 &&
      mergesAgree

    const ratioOf = (s: Study): number => Number([...s.ratios][0] ?? -1n)
    // the rung and the refusals as measured (added 2026-09-26, no gate moved: the claim had printed sqrt 7 and "the
    // same refusals" whatever the start gave). One meeting's swap ladder is {2, 4 / sqrt 3, sqrt 7} (E-QTM-0140); the
    // departure's CHSH is a see-saw lower bound that meets a rung to 1e-6.
    const bellRung =
      ([
        ['sqrt 7 (the top rung of one meeting\'s ladder)', Math.sqrt(7)],
        ['4 / sqrt 3 (the middle rung of one meeting\'s ladder; the gate asks for sqrt 7)', 4 / Math.sqrt(3)],
        ['2 (the bottom rung)', 2],
      ] as const).find(([, v]) => bell >= v - 1e-6 && bell <= v + 1e-9)?.[0] ?? `${bell.toFixed(4)} (on no rung of one meeting's ladder)`
    const refusalText = refusals.every(r => r.whole > 0 && r.whole === r.departure)
      ? `the same refusals in fixed units (meetings ${refusals.map(r => r.whole).join(' and ')} at grains 9 x 4 and 9 x 16)`
      : `refusals in fixed units at meetings ${refusals.map(r => r.whole || 'none').join(' and ')} for the knot and ${refusals.map(r => r.departure || 'none').join(' and ')} for its departure at grains 9 x 4 and 9 x 16 (the gate needs a refusal at both grains)`

    return verdict({
      status: ok ? 'pass' : 'fail',
      claim: `every step of the fear weave fixes the fully mixed state (unital kernels, permutations), so a knot stored as its departure from calm moves by the same kernel and reads back as the fear weave's knot at every one of 480 beats for three pairs and a triple, with love = fear in every knot, purity 9^k sum delta^2 = (3^k - 1) M^2, chances summing to 1, exact reversal, ${refusalText}, chances 1/4, 3/4, 1 and CHSH ${bellRung} unchanged, and the grid's love minus fear equal to the vibe charge of the pair made from calm at every beat; the cost is exactly 3^k more units per knot; C stays a symmetry, sending the rule to its reverse phase, while the literal swap of love and fear sends a pure knot to negative chances`,
      metrics: {
        kernelsUnitalAndWeightKeeping: kernelsUnital ? 1 : 0,
        gridMovesArePermutations: movesPermute ? 1 : 0,
        matterPairFirstToken: matterPair[0] ?? -1,
        matterPairSecondToken: matterPair[1] ?? -1,
        tripleFirst: triple[0] ?? -1,
        tripleSecond: triple[1] ?? -1,
        tripleThird: triple[2] ?? -1,
        vacuumMeetings: inVacuum.meetings,
        growerMeetings: inGrower.meetings,
        matterMeetings: inMatter.meetings,
        tripleMeetings: inTriple.meetings,
        readBackMismatches: all.reduce((n, s) => n + s.mismatches, 0),
        chanceFaults: all.reduce((n, s) => n + s.chanceFaults, 0),
        loveEqualsFearEveryBeat: all.every(s => s.balanced) ? 1 : 0,
        fearShare: 0.5,
        pureEveryBeat: all.every(s => s.pure) ? 1 : 0,
        loveMaxWholesPairs: Math.max(...pairs.map(s => s.loveMaxWholes)),
        loveBoundWholesPair: Math.sqrt(8) / 2,
        loveMaxWholesTriple: inTriple.loveMaxWholes,
        loveBoundWholesTriple: Math.sqrt(26) / 2,
        grainCostVacuum: ratioOf(inVacuum),
        grainCostGrower: ratioOf(inGrower),
        grainCostMatter: ratioOf(inMatter),
        grainCostTriple: ratioOf(inTriple),
        grainCostDistinctValues: all.reduce((n, s) => n + s.ratios.size, 0),
        permuteBeatsChecked: all.reduce((n, s) => n + s.permuteBeats, 0),
        permuteFaults: all.reduce((n, s) => n + s.permuteFaults, 0),
        firstRefusedMeetingWhole9x4: refusals[0]?.whole ?? -1,
        firstRefusedMeetingDeparture81x4: refusals[0]?.departure ?? -1,
        firstRefusedMeetingWhole9x16: refusals[1]?.whole ?? -1,
        firstRefusedMeetingDeparture81x16: refusals[1]?.departure ?? -1,
        reversesExactly: reverses ? 1 : 0,
        reversalMeetings,
        vibeChargeKept: all.every(s => s.chargeKept) ? 1 : 0,
        vacuumGridLedgerEqualsLatticeBeats: inVacuum.gridEqualsLattice,
        vacuumWholeLedgerEqualsLatticeBeats: inVacuum.oldEqualsLattice,
        growerGridLedgerEqualsLatticeBeats: inGrower.gridEqualsLattice,
        matterGridLedgerEqualsLatticeBeats: inMatter.gridEqualsLattice,
        tripleGridLedgerEqualsLatticeBeats: inTriple.gridEqualsLattice,
        conjugateKernelIsReversePhase: conjugateIsReverse ? 1 : 0,
        conjugateReadingFaults: all.reduce((n, s) => n + s.conjugateFaults, 0),
        loveFearSwapMinChance: Math.min(...all.map(s => s.swapMinChance)),
        chanceAfterMeeting1: interference[0] ?? -1,
        chanceAfterMeeting2: interference[1] ?? -1,
        chanceAfterMeeting3: interference[2] ?? -1,
        chshFromDeparture: bell,
        mergesAgree: mergesAgree ? 1 : 0,
      },
      control: {
        resetKeepsWeight: resetKeepsWeight ? 1 : 0,
        resetUnital: resetUnital ? 1 : 0,
        resetDepartureMismatches: resetMismatches,
      },
      notes:
        "STATUS BY START (E-MTH-0028): pass at the default integer start, pass on 8 of 17 starts; the rerun below read the retired golden start, a middle-rung start. RERUN 2026-09-26 under the adopted comoving fear beat: status fail as before; loveMaxWholesPairs 1.2372 -> 1.3128, loveMaxWholesTriple 2.0881 -> 2.0708. " + ('L2, exact BigInt weights, no random numbers (golden-ratio fills). The departure is stored over its own units M because a sum of zero no longer names them; the whole-number form is delta = 9^k n - N over 9^k N, reduced. That love = fear (and the share of fear 1/2) holds by construction; the measurements are that the rule still acts (unital kernels), that every reading and result is unchanged, and the grain cost. The ledger gate counts beats where the grid\'s love minus fear equals the vibe charge of the knot\'s tokens; the fear weave\'s storage puts one whole there. The reset control is not a step of the rule: it is the simplest weight-keeping kernel that moves calm, and there the departure alone cannot follow. The literal love-fear swap is -Delta, the Wigner function of 2/3^k - rho, which is not a state for a pure knot.'),
    })
  },
})
