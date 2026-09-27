// The charge as the knot's sign: each knot stored as its departure from calm (E-QTM-0105), times +1 for a
// love-knot and -1 for its mirror, the fear-knot, read back by dividing the sign out
// (code/rule/signed-knot, code/rule/calm-weave, code/rule/fear-weave).
//
// The question. From calm the lattice makes a love and a fear together, love minus fear 0. If a love's
// knot carries +1 and a fear's carries -1, the signs over everything add to 0 from calm, the lattice's own
// law, while every knot keeps love = fear in its weights (the departure). The risk, stated before the run:
// two knots that meet must become one, and the joint of independent knots is their tensor product, which
// MULTIPLIES what each carries, where a charge ledger ADDS.
//
// Built on the fear weave, committed turning weave (pair table, hop kept), side-3 D4 box. Two tokens, each
// its own single-role knot until they first meet: the first from |0>, the second from |1> (the start of
// E-QTM-0099 and 0100). Each knot's sign is the vibe its token holds just before the pair's first meeting
// (both slots of a meeting hold a vibe): love +1, fear -1. At a meeting of tokens in two knots the knots
// join first, then the beat acts. Pairs: the vacuum pair (tokens 4 and 7, made together from calm) and the
// grower pair (tokens 4 and 20), 480 beats on live links.
//
// Gates for the sign rule (option 3), fixed before the first run. Option 3 WORKS only if all hold:
// 1. the additive ledger: the sum of every knot's sign is the same before and after every join, and after
//    the pair is made from calm (0 from calm)
// 2. readable: every knot divides its sign out to a real departure, and after the join the knot reads
//    back as the fear weave's own pair knot at every beat, 0 mismatches
// 3. love = fear inside every knot and across the universe: every knot's stored weights sum to 0, and so
//    do all of them together, at every beat
// 4. chances: the readings of every knot sum to 1 and lie in [0, 1]
// 5. purity: 81 sum delta^2 = 8 M^2 for the joined pair at every beat
// 6. classical steps only permute: covered by the same departure steps as E-QTM-0105, checked again here as
//    the multiset of stored weights on beats with no meeting
// 7. exact reversal: from the join, 96 beats forward and back in fixed units restore the joined knot
// 8. charge conjugation: the mirror (C on the grid, weights negated, sign flipped) reads the same role
//    chances, and a mirror on the same tokens stays the mirror of its knot at every beat when it runs the
//    conjugate rule (kernel seen through C, moves C g C)
// 9. the measured results unchanged: chances 1/4, 3/4, 1 on flat links and CHSH sqrt 7 (to 1e-6) one beat
//    after the first meeting on live links, read from the signed knots
//
// Measured and reported beside the sign rule, with the same gates, not moving its verdict:
// - option 2, the sign on the fear weave's own storage (weights sum to +1 or -1): its weight ledger
// - the joint sign by addition, s_a + s_b, the only choice that keeps gate 1: whether the joint can be read
// - the center rule: the factor omega^q (q the charge), exact in Eisenstein integers: joined factors
//   multiply and charges add, so the additive ledger is the exponent
// - the label rule: the charge kept beside the departure, never in the weights
// - a mirror on the same tokens run by the SAME rule as its knot: the beat it stops being the mirror
// - the universe's total on shared tokens (a knot plus its mirror): how many points are nonzero, whether
//   the total alone could hold the state
//
// The first run: every gate held but gate 1, which failed where the risk said, at the first meeting of the
// two knots (beat 6 for the vacuum pair, 0 before the join and -1 after; beat 232 for the grower pair, the
// same numbers). The verdict is fail and it stands. The center rule passed its gates.
//
// Depth L2: a storage rule on the committed lattice, with a stated break point as the main measurement.

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
  type BeatRecord,
  type Lattice,
  type Whole,
} from '@/code/rule/fear-weave'
import { conjugateKernel, conjugateMove, departureChances, departureOf, wholeOfDeparture, type Departure } from '@/code/rule/calm-weave'
import { advanceKnot, knotOf, knotTotal, mergeKnots, mirrorKnot, readKnot, type KnotRule, type SignedKnot } from '@/code/rule/signed-knot'
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
const sameKnot = (a: SignedKnot, b: SignedKnot): boolean =>
  a.units === b.units && a.sign === b.sign && a.charge === b.charge && sameWeights(a.re, b.re) && sameWeights(a.om, b.om)

export default experiment({
  id: 'quantum/charge-as-the-sign',
  code: 'E-QTM-0106',
  title:
    'the charge as the knot\'s sign: a love-knot carrying +1 and its mirror fear-knot -1 on top of the departure from calm keeps love = fear in every knot and in the universe, reads every chance, reverses and keeps charge conjugation, but its additive ledger breaks at the first meeting of two knots, because joined knots multiply what they carry; the cube-root center phase omega^q is the factor that survives',
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
      const lattices: Lattice[] = [lattice]

      for (let t = 0; t < beats; t++) {
        const r = fearBeat({ weave, links, lattice, open, t })

        lattice = r.lattice
        records.push(r.record)
        lattices.push(lattice)
      }

      return { records, lattices }
    }

    const vibeOfToken = (lattice: Lattice, token: number): number => lattice.vibe[lattice.token.indexOf(token)] ?? 0
    const single = (token: number, digit: number): Departure => departureOf(basisWhole([token], [digit]))

    // the two-knot universe, beat by beat, under one rule
    type Universe = {
      signs: number[]
      firstMeetingBeat: number
      ledgerBefore: number
      ledgerAfter: number
      ledgerKeptAtJoin: boolean
      chargeBefore: number
      chargeAfter: number
      factorProductBefore: string
      factorProductAfter: string
      readFaults: number
      readMismatches: number
      balancedKnots: boolean
      balancedUniverse: boolean
      chanceFaults: number
      pure: boolean
      permuteFaults: number
      mirrorReadFaults: number
      ledgerEqualsLatticeBeats: number
      chargeEqualsLatticeBeats: number
      joined: SignedKnot | null
      joinBeat: number
      beats: number
    }
    const universe = (background: typeof vacuum, links: Int16Array, pair: number[], rule: KnotRule, beats: number): Universe => {
      const open = openOf(pair)
      const { records, lattices } = run(background, links, open, beats)
      const firstMeeting = records.findIndex(r => r.meetings.length > 0)
      const signs = pair.map(tk => Math.sign(vibeOfToken(lattices[Math.max(0, firstMeeting)]!, tk)))
      let knots: SignedKnot[] = pair.map((tk, i) => knotOf({ departure: single(tk, i), rule, sign: signs[i] ?? 0, charge: signs[i] ?? 0 }))
      let whole: Whole = basisWhole(pair, [0, 1])
      // the product of every knot's factor: the sign, or omega to the charge mod 3
      const factorProduct = (list: SignedKnot[]): string =>
        rule === 'sign' ? `${list.reduce((p, k) => p * k.sign, 1)}` : rule === 'center' ? `${list.reduce((p, k) => (((p + k.charge) % 3) + 3) % 3, 0)}` : '1'
      const out: Universe = {
        signs,
        firstMeetingBeat: firstMeeting,
        ledgerBefore: 0,
        ledgerAfter: 0,
        ledgerKeptAtJoin: true,
        chargeBefore: 0,
        chargeAfter: 0,
        factorProductBefore: '',
        factorProductAfter: '',
        readFaults: 0,
        readMismatches: 0,
        balancedKnots: true,
        balancedUniverse: true,
        chanceFaults: 0,
        pure: true,
        permuteFaults: 0,
        mirrorReadFaults: 0,
        ledgerEqualsLatticeBeats: 0,
        chargeEqualsLatticeBeats: 0,
        joined: null,
        joinBeat: -1,
        beats,
      }
      const sorted = (list: SignedKnot[]): string =>
        list
          .map(k => [...k.re, ...k.om].sort((a, b) => (a < b ? -1 : a > b ? 1 : 0)).join(','))
          .join('|')

      records.forEach((record, t) => {
        // join knots whose tokens meet
        for (const [ta, tb] of record.meetings) {
          const ka = knots.find(k => k.tokens.includes(ta))
          const kb = knots.find(k => k.tokens.includes(tb))

          if (ka && kb && ka !== kb) {
            const first = ka.tokens[0] === pair[0] ? ka : kb
            const second = first === ka ? kb : ka
            const joined = mergeKnots(first, second)

            out.ledgerBefore = knots.reduce((s, k) => s + k.sign, 0)
            out.chargeBefore = knots.reduce((s, k) => s + k.charge, 0)
            out.factorProductBefore = factorProduct(knots)
            out.readFaults += joined ? 0 : 1
            knots = joined ? [...knots.filter(k => k !== ka && k !== kb), joined] : knots
            out.ledgerAfter = knots.reduce((s, k) => s + k.sign, 0)
            out.chargeAfter = knots.reduce((s, k) => s + k.charge, 0)
            out.factorProductAfter = factorProduct(knots)
            out.ledgerKeptAtJoin = out.ledgerKeptAtJoin && out.ledgerBefore === out.ledgerAfter
            out.joinBeat = t
          }
        }

        const before = sorted(knots)
        const meetingsInside = record.meetings.length

        knots = knots.map(k => advanceKnot({ weave, knot: k, record, kernel: kThird, divisor: 4, fixed: false, forward: true })!)
        whole = advanceWhole({ weave, whole, record, kernel4: kThird, fixed: false, forward: true })!

        if (meetingsInside === 0) {
          out.permuteFaults += sorted(knots) === before ? 0 : 1
        }

        let universeTotal = { re: 0n, om: 0n }

        for (const k of knots) {
          const total = knotTotal(k)
          const read = readKnot(k)

          universeTotal = { re: universeTotal.re + total.re, om: universeTotal.om + total.om }
          out.balancedKnots = out.balancedKnots && total.re === 0n && total.om === 0n

          if (!read) {
            out.readFaults++
            continue
          }

          const c = departureChances(read)

          out.chanceFaults += c.numerator.reduce((a, b) => a + b, 0n) === c.denominator && c.numerator.every(n => n >= 0n && n <= c.denominator) ? 0 : 1

          if (k.tokens.length === 2) {
            out.readMismatches += sameWeights(wholeOfDeparture(read).weight, reduceWhole(whole).weight) ? 0 : 1
            out.pure = out.pure && 81n * read.delta.reduce((s, x) => s + x * x, 0n) === 8n * read.units * read.units
          }

          const mirrored = readKnot(mirrorKnot(k))
          const mc = mirrored ? departureChances(mirrored) : null

          out.mirrorReadFaults += mc && sameWeights(mc.numerator, c.numerator) && mc.denominator === c.denominator ? 0 : 1
        }

        out.balancedUniverse = out.balancedUniverse && universeTotal.re === 0n && universeTotal.om === 0n

        const lattice = lattices[t + 1]!
        const latticeCharge = pair.reduce((s, tk) => s + vibeOfToken(lattice, tk), 0)

        out.ledgerEqualsLatticeBeats += knots.reduce((s, k) => s + k.sign, 0) === latticeCharge ? 1 : 0
        out.chargeEqualsLatticeBeats += knots.reduce((s, k) => s + k.charge, 0) === latticeCharge ? 1 : 0
      })

      out.joined = knots.length === 1 ? knots[0]! : null

      return out
    }

    const rules: KnotRule[] = ['sign', 'center', 'label']
    const vacuumRuns = Object.fromEntries(rules.map(rule => [rule, universe(vacuum, liveLinks, VACUUM_PAIR, rule, BEATS)])) as Record<KnotRule, Universe>
    const growerRuns = Object.fromEntries(rules.map(rule => [rule, universe(matter, liveLinks, GROWER_PAIR, rule, BEATS)])) as Record<KnotRule, Universe>

    // creation from calm: calm holds no knot, ledger 0, factor product 1; the pair made from calm
    const vacuumSigns = vacuumRuns.sign.signs
    const creationAdditive = vacuumSigns.reduce((a, b) => a + b, 0) === 0
    const creationProduct = vacuumSigns.reduce((a, b) => a * b, 1) === 1
    const creationCenter = vacuumSigns.reduce((a, b) => (((a + b) % 3) + 3) % 3, 0) === 0

    // the joint sign by addition: can the joined knot be read?
    const additiveJointSign = vacuumSigns.reduce((a, b) => a + b, 0)
    const additiveJointReadable = additiveJointSign === 1 || additiveJointSign === -1

    // option 2: the sign on the fear weave's own storage, weights sum to the sign
    const option2 = (() => {
      const sa = vacuumSigns[0] ?? 0
      const sb = vacuumSigns[1] ?? 0
      const ledgerBefore = sa + sb
      const a = basisWhole([VACUUM_PAIR[0] ?? 0], [0]).weight.map(w => BigInt(sa) * w)
      const b = basisWhole([VACUUM_PAIR[1] ?? 0], [1]).weight.map(w => BigInt(sb) * w)
      const joint = a.flatMap(x => b.map(y => x * y))
      const unitsA = 3n
      const unitsB = 3n

      return { ledgerBefore, ledgerAfter: Number(joint.reduce((s, w) => s + w, 0n)) / Number(unitsA * unitsB) }
    })()

    // 7. reversal of the joined sign knot, fixed units, from the join
    let reverses = false
    let reversalMeetings = 0

    {
      const open = openOf(VACUUM_PAIR)
      const joinBeat = vacuumRuns.sign.joinBeat
      const early = universe(vacuum, liveLinks, VACUUM_PAIR, 'sign', joinBeat + 1)
      let lattice = run(vacuum, liveLinks, open, joinBeat + 1).lattices[joinBeat + 1]!
      const start = lattice
      const big = 4n ** 200n
      const joined = early.joined!
      const first: SignedKnot = { ...joined, re: joined.re.map(x => x * big), om: joined.om.map(x => x * big), units: joined.units * big }
      let knot: SignedKnot | null = first

      for (let t = joinBeat + 1; t < joinBeat + 1 + REVERSAL_BEATS; t++) {
        const r = fearBeat({ weave, links: liveLinks, lattice, open, t })

        lattice = r.lattice
        reversalMeetings += r.record.meetings.length
        knot = knot ? advanceKnot({ weave, knot, record: r.record, kernel: kThird, divisor: 4, fixed: true, forward: true }) : null
      }

      for (let t = joinBeat + REVERSAL_BEATS; t > joinBeat; t--) {
        const r = fearBeatBack({ weave, links: liveLinks, lattice, open, t })

        lattice = r.lattice
        knot = knot ? advanceKnot({ weave, knot, record: r.record, kernel: kThirdBack, divisor: 4, fixed: true, forward: false }) : null
      }

      reverses = knot !== null && sameKnot(knot, first) && lattice.token.every((v, i) => v === start.token[i]) && lattice.vibe.every((v, i) => v === start.vibe[i])
    }

    // 8. a mirror on the same tokens: the pair knot and its mirror, the mirror run by the conjugate rule and
    // by the same rule
    const mirrorStudy = (() => {
      const { records } = run(vacuum, liveLinks, openOf(VACUUM_PAIR), BEATS)
      let knot = knotOf({ departure: departureOf(basisWhole(VACUUM_PAIR, [0, 1])), rule: 'sign', sign: 1, charge: 1 })
      let conj = mirrorKnot(knot)
      let same = conj
      const kConj = conjugateKernel(kThird)
      const conjMove = (g: number): number[] => conjugateMove(moves.act[g] ?? [])
      let conjFaults = 0
      let sameFirstFault = -1
      let totalNonzeroStart = -1
      let totalNonzeroMax = 0
      let wholeTotalNonzeroStart = -1

      {
        const w = basisWhole(VACUUM_PAIR, [0, 1]).weight
        const c = mirrorKnot(knotOf({ departure: { tokens: VACUUM_PAIR, delta: w, units: 9n }, rule: 'sign', sign: 1, charge: 1 }))

        wholeTotalNonzeroStart = w.filter((x, i) => x + (c.re[i] ?? 0n) !== 0n).length
      }

      records.forEach((record, t) => {
        const nonzero = knot.re.filter((x, i) => x * conj.units + (conj.re[i] ?? 0n) * knot.units !== 0n).length

        totalNonzeroStart = totalNonzeroStart < 0 ? nonzero : totalNonzeroStart
        totalNonzeroMax = Math.max(totalNonzeroMax, nonzero)
        knot = advanceKnot({ weave, knot, record, kernel: kThird, divisor: 4, fixed: false, forward: true })!
        conj = advanceKnot({ weave, knot: conj, record, kernel: kConj, divisor: 4, fixed: false, forward: true, moveOf: conjMove })!
        same = advanceKnot({ weave, knot: same, record, kernel: kThird, divisor: 4, fixed: false, forward: true })!
        conjFaults += sameKnot(conj, mirrorKnot(knot)) ? 0 : 1
        sameFirstFault = sameFirstFault >= 0 || sameKnot(same, mirrorKnot(knot)) ? sameFirstFault : t
      })

      const commuting = moves.act.filter(p => conjugateMove(p).every((x, i) => x === p[i])).length

      return { conjFaults, sameFirstFault, totalNonzeroStart, totalNonzeroMax, wholeTotalNonzeroStart, commuting }
    })()

    // 9. the measured results, from the sign rule's knots
    const flat = universe(vacuum, flatLinks, VACUUM_PAIR, 'sign', 60)
    const interference: number[] = []

    {
      const open = openOf(VACUUM_PAIR)
      const { records, lattices } = run(vacuum, flatLinks, open, 60)
      const firstMeeting = records.findIndex(r => r.meetings.length > 0)
      const signs = VACUUM_PAIR.map(tk => Math.sign(vibeOfToken(lattices[Math.max(0, firstMeeting)]!, tk)))
      let knots: SignedKnot[] = VACUUM_PAIR.map((tk, i) => knotOf({ departure: single(tk, i), rule: 'sign', sign: signs[i] ?? 0, charge: signs[i] ?? 0 }))

      for (const record of records) {
        if (record.meetings.length > 0 && knots.length === 2) {
          knots = [mergeKnots(knots[0]!, knots[1]!)!]
        }

        knots = knots.map(k => advanceKnot({ weave, knot: k, record, kernel: kThird, divisor: 4, fixed: false, forward: true })!)

        if (record.meetings.length > 0 && interference.length < 3) {
          const c = departureChances(readKnot(knots[0]!)!)

          interference.push(Number(c.numerator[3] ?? 0n) / Number(c.denominator))
        }
      }
    }

    const bellRun = universe(vacuum, liveLinks, VACUUM_PAIR, 'sign', vacuumRuns.sign.firstMeetingBeat + 2)
    const bellRead = bellRun.joined ? readKnot(bellRun.joined) : null
    const bell = bellRead ? roleChsh(roleDensity(wholeOfDeparture(bellRead))) : -1

    const exact = (x: number, y: number): boolean => Math.abs(x - y) < 1e-12
    const gatesOf = (u: Universe): boolean =>
      u.joinBeat >= 0 &&
      u.ledgerKeptAtJoin &&
      u.readFaults === 0 &&
      u.readMismatches === 0 &&
      u.balancedKnots &&
      u.balancedUniverse &&
      u.chanceFaults === 0 &&
      u.pure &&
      u.permuteFaults === 0 &&
      u.mirrorReadFaults === 0
    const signOk =
      gatesOf(vacuumRuns.sign) &&
      gatesOf(growerRuns.sign) &&
      creationAdditive &&
      reverses &&
      reversalMeetings > 0 &&
      mirrorStudy.conjFaults === 0 &&
      interference.length === 3 &&
      exact(interference[0] ?? 0, 1 / 4) &&
      exact(interference[1] ?? 0, 3 / 4) &&
      exact(interference[2] ?? 0, 1) &&
      Math.abs(bell - Math.sqrt(7)) < 1e-6
    // the center rule on the same gates, its additive ledger being the charge (the exponent)
    const centerOk = [vacuumRuns.center, growerRuns.center].every(
      u => u.joinBeat >= 0 && u.chargeBefore === u.chargeAfter && u.factorProductBefore === u.factorProductAfter && u.readFaults === 0 && u.readMismatches === 0 && u.balancedKnots && u.balancedUniverse && u.chanceFaults === 0 && u.pure && u.mirrorReadFaults === 0,
    ) && creationCenter
    const labelOk = [vacuumRuns.label, growerRuns.label].every(
      u => u.joinBeat >= 0 && u.chargeBefore === u.chargeAfter && u.readFaults === 0 && u.readMismatches === 0 && u.balancedKnots && u.balancedUniverse && u.chanceFaults === 0 && u.pure && u.mirrorReadFaults === 0,
    )

    const v = vacuumRuns.sign
    const g = growerRuns.sign

    return verdict({
      status: signOk ? 'pass' : 'fail',
      claim:
        'the sign rule keeps love = fear in every knot and across the universe, reads every chance, stays pure, reverses exactly, keeps its mirror under the conjugate rule and gives chances 1/4, 3/4, 1 and CHSH sqrt 7, and its additive ledger is 0 from calm, but the ledger breaks at the first meeting of the two knots, 0 before the join and -1 after, for the pair made from calm (beat 6) and for the grower pair (beat 232): a joined knot must carry the product of the signs to be readable, and the sum, 0, cannot be divided out. So option 3 fails its gates. The cube-root center phase omega^q passes the same gates with its charge, the exponent, kept at every join and at creation',
      metrics: {
        vacuumSignFirst: v.signs[0] ?? 0,
        vacuumSignSecond: v.signs[1] ?? 0,
        vacuumFirstMeetingBeat: v.firstMeetingBeat,
        vacuumJoinBeat: v.joinBeat,
        vacuumLedgerBeforeJoin: v.ledgerBefore,
        vacuumLedgerAfterJoin: v.ledgerAfter,
        vacuumLedgerKeptAtJoin: v.ledgerKeptAtJoin ? 1 : 0,
        growerSignFirst: g.signs[0] ?? 0,
        growerSignSecond: g.signs[1] ?? 0,
        growerJoinBeat: g.joinBeat,
        growerLedgerBeforeJoin: g.ledgerBefore,
        growerLedgerAfterJoin: g.ledgerAfter,
        growerLedgerKeptAtJoin: g.ledgerKeptAtJoin ? 1 : 0,
        creationKeepsAdditiveLedger: creationAdditive ? 1 : 0,
        creationKeepsSignProduct: creationProduct ? 1 : 0,
        additiveJointSign,
        additiveJointReadable: additiveJointReadable ? 1 : 0,
        signReadFaults: v.readFaults + g.readFaults,
        signReadMismatches: v.readMismatches + g.readMismatches,
        signLoveEqualsFearInKnots: v.balancedKnots && g.balancedKnots ? 1 : 0,
        signLoveEqualsFearInUniverse: v.balancedUniverse && g.balancedUniverse ? 1 : 0,
        signChanceFaults: v.chanceFaults + g.chanceFaults,
        signPure: v.pure && g.pure ? 1 : 0,
        signPermuteFaults: v.permuteFaults + g.permuteFaults,
        signMirrorReadFaults: v.mirrorReadFaults + g.mirrorReadFaults,
        signReversesFromJoin: reverses ? 1 : 0,
        reversalMeetings,
        vacuumSignLedgerEqualsLatticeBeats: v.ledgerEqualsLatticeBeats,
        vacuumChargeLabelEqualsLatticeBeats: v.chargeEqualsLatticeBeats,
        growerSignLedgerEqualsLatticeBeats: g.ledgerEqualsLatticeBeats,
        growerChargeLabelEqualsLatticeBeats: g.chargeEqualsLatticeBeats,
        beats: BEATS,
        chanceAfterMeeting1: interference[0] ?? -1,
        chanceAfterMeeting2: interference[1] ?? -1,
        chanceAfterMeeting3: interference[2] ?? -1,
        flatJoinBeat: flat.joinBeat,
        chshFromSignedKnot: bell,
        mirrorConjugateRuleFaults: mirrorStudy.conjFaults,
        mirrorSameRuleFirstFaultBeat: mirrorStudy.sameFirstFault,
        gridMovesCommutingWithC: mirrorStudy.commuting,
        knotPlusMirrorNonzeroPointsStart: mirrorStudy.totalNonzeroStart,
        knotPlusMirrorNonzeroPointsMax: mirrorStudy.totalNonzeroMax,
        wholePlusMirrorNonzeroPointsStart: mirrorStudy.wholeTotalNonzeroStart,
        option2WeightLedgerBeforeJoin: option2.ledgerBefore,
        option2WeightLedgerAfterJoin: option2.ledgerAfter,
        centerRulePasses: centerOk ? 1 : 0,
        centerChargeBeforeJoinVacuum: vacuumRuns.center.chargeBefore,
        centerChargeAfterJoinVacuum: vacuumRuns.center.chargeAfter,
        centerCreationFactorProductIsOne: creationCenter ? 1 : 0,
        centerReadMismatches: vacuumRuns.center.readMismatches + growerRuns.center.readMismatches,
        labelRulePasses: labelOk ? 1 : 0,
      },
      control: {
        signOptionWorks: signOk ? 1 : 0,
        growerSignLedgerIsAlsoBroken: g.ledgerKeptAtJoin ? 0 : 1,
      },
      notes:
        "RERUN 2026-09-26 under the adopted comoving fear beat and calm-weave's conjugateMove fix (C read on the GRID index, CONJUGATE_GRID): status fail as before; mirrorConjugateRuleFaults 480 -> 0 (the conjugateMove fix, not the comoving beat), knotPlusMirrorNonzeroPointsMax 81 -> 72. " + ('L2, exact BigInt weights (Eisenstein integers for the center rule), no random numbers. The first run failed gate 1 as predicted in the header and the failure stands. Why it cannot be fixed within the sign rule: a factor f that must divide out of a joined knot is f_ab = f_a f_b, and the empty universe (calm) carries 1, so a pair from calm has f_love f_fear = 1, which a +1 love and a -1 fear break (their product is -1) and which the additive rule keeps only by giving the joint knot a sign of 0, which cannot be divided out. A factor that is both multiplicative and gives love and fear conjugate values is a character of the charge: omega^q, with omega omega^2 = 1. Its additive ledger is the exponent q, which equals the vibe charge the knot\'s tokens carry on 480 of 480 beats for the pair made from calm and on 199 of 480 for the grower pair, whose tokens trade vibes with the matter around them (the sign ledger: 6 of 480 and 100 of 480). None of the factors changes a single chance: every reading is the departure of E-QTM-0105, so the sign and the phase are bookkeeping, not dynamics. A mirror on the same tokens stays the mirror only under the conjugate rule (kernel seen through C, which is the -2 pi / 3 kernel, and moves C g C): run by the knot\'s own rule it is broken at beat 0, since only 6 of the 216 grid moves commute with C. A knot and its mirror summed on shared tokens start at 0 on every point for |0>|1>, so the universe total alone cannot hold the state.'),
    })
  },
})
