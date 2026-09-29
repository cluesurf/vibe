// THE KEPT BRANCH OF A LIKE MEETING, ASKED OF EVERY HELD QUANTUM ROW (E-QTM-0163, OPEN-FND-07). The open item: the
// chosen vacuum (E-RLT-0105) was said to drop the interference of a like meeting's kept branch with itself, and the
// question was whether any held row of the ledger's section A needs that interference. This file switches the
// interference on and off (code/measure/kept-branch) and reruns what the rows rest on.
//
// THE SWITCH. 'on' is the rule. 'off' writes every like meeting's outcome (kept or exchanged) to a record carried with
// the term, all but the term's last one, and adds two terms only when their records agree: no earlier meeting's
// branches recombine, and the last meeting stays one coherent knot. It is the channel "every like meeting but the last
// dephased" (1/4 rho + 3/4 S rho S). 'once' lets only a pair's first meeting act. The coin (a one-vibe gate) is never
// recorded, so position interference is kept in every mode.
//
// THE ROWS, by analysis first (exact, from each row's experiments and gates; the three classification passes are in
// the notes of the OPEN-FND-07 section of remaining-pieces.md):
//   superposition and interference  the coin's interference (E-QTM-0103, 0157 E0, E1, Q2) has no like meeting: does not
//                                    need it. E-QTM-0100's clause 1/4, 3/4, 1 over three meetings does (K3)
//   Born rule; no signaling;         identities or bounds that hold on every state and every local channel: do not need
//   unitarity                        it (the rule is unitary with or without re-meetings)
//   Bell violation                   read one beat after the first meeting: one meeting, ON and OFF the same state (R0)
//   Tsirelson's bound                "never above" holds on every state; "reached" is E-QTM-0133's three meetings: needs it
//                                    (K1, K2)
//   where Bell's escape comes from   its violating states come from love-fear histories (rlt0055, 160 meetings, all
//                                    love-fear): no like meeting, does not need it
//   contextuality, magic             identities on every whole; a fear exists after one meeting: do not need it
//   no-cloning, teleportation, GHZ   kernel identities, or love-fear meetings only: do not need it
//   positions in superposition       the lone love has no partner to meet (E-QTM-0157 Q2, E-RLT-0105 Q4b): does not
//                                    need it (L0)
//
// THE PREMISE, measured here. Two probes before this file (disclosed below) found that the chosen vacuum does NOT drop
// the interference: E-RLT-0105's like pair meets again, on every start, as the box's line wraps round, and at every
// re-meeting the rule adds terms whose meeting outcomes differ. E-RLT-0105's witness (the kept configuration's weight
// against (1/4)^m) read one configuration and missed it, as E-QTM-0157 found for positions.
//
// GATES, fixed before this file's first run (the pass contact, veto 'none', coin on: the working rule):
//  I1 the 'on' runner is the rule: equal to coinedVetoBeat term for term at every beat of every like run and of L0
//  I2 the norm is exact at every beat in 'on' and in 'off'
//  R0 the lemma at the first split: 'on' and 'off' are the same sum, and the knot reads 3/4, 1/4 (1e-12), CHSH sqrt 7
//     (1e-9); per start, sides 4 and 8
//  L0 a lone love at the vacuum's center (the vacuum closed), side 4, 16 beats: 0 split meetings and 'on' equals 'strict'
//     term for term, 17 of 17
//  per start of E-MTH-0028's 17, E-RLT-0105's like pair (the rule's own first unequal-point like meeting, run back),
//  48 beats, on side 4 and on side 8:
//  R1 the pair meets again: some lineage passes 2 or more split meetings
//  R2 the rule adds across meeting outcomes: merges between terms whose written records differ, more than 0
//  R3 'on' against 'off': the L1 between their Born distributions at beat 20 is above 0
//  R4 the knot passes the one-meeting ceiling: CHSH above sqrt 7 + 1e-6 at some beat, side 4 (side 8 reported: the
//     probe read sqrt 7 exactly on integer+6, whose pair meets every 12 beats)
//  C1 control: every 'off' member's knot is at most sqrt 7 + 1e-9 at every beat (the exact ceiling of one meeting)
//  R5 the re-meeting is the box's wrap: the gap between the pair's first two meetings on side 8 is a whole multiple, at
//     least 2, of the gap on side 4
//  and on the gates, no mesh (the rows measured on words):
//  K1 the working rule's point registers (code/measure/rule-gates lineOfTwo, the 216 link point permutations, which are
//     2-transitive, so (0, 1) is every unequal start): every word of two and three meetings under 'on' has some word
//     above sqrt 7 + 1e-6, and under 'off' and 'once' every member is at most sqrt 7 + 1e-9
//  K2 E-QTM-0133's words (start |0> |t>, meetings 1 and 2 with no move, the move D2, meeting 3): the words 'on' takes to
//     Schmidt (1/2, 1/2, 0) exist, and on each of them 'off' has no member at (1/2, 1/2, 0) and none above sqrt 7 + 1e-9,
//     and 'once' none at (1/2, 1/2, 0)
//  K3 E-QTM-0100's reading (its gate SWAP U, from |0>|1>, the chance of roles (1, 0) after meetings 1, 2, 3), exact:
//     'on' 1/4, 3/4, 1; 'off' 1/4, 3/8, 7/16 (E-QTM-0100's own phase-free stand-in); 'once' 1/4, 1/4, 1/4
// Verdict: fail if I1, I2, R0, L0 or C1 fails (the instrument); pass if every gate holds; partial otherwise.
// Reported, never gated: meeting beats, lineage, merges, L1, CHSH per start and side, the side-8 R4 count, the largest
// CHSH and the starts within 1e-9 of 2 sqrt 2.
//
// PROBES before this file, disclosed: tmp/kb-probe2 (K1: two meetings best 2.7839, three 2.8174, off best sqrt 7),
// tmp/kb-probe4 (integer+0, side 4: meetings every 3 beats, 94 cross merges by beat 47), tmp/kb-probe5 (every start, side
// 4: meetings every 3 beats, CHSH max 2.7945 to 2.8284, L1 0.61 to 1.20; side 8: every 6 beats, integer+6 every 12),
// tmp/kb-probe7 (K2 on the d1 = identity words). The first probe (tmp/kb-probe1) ran 'off' for 48 beats and did not
// finish: 16 meetings give 2^16 records.
//
// FIRST RUN (795 s, tmp/qtm163-run1.log, run in the experiment/kept-branch worktree before the move to next-pieces): pass, every gate held, no gate moved,
// title written after the run. Side 4: meetings at beats 1, 4, 7, ... 46 on every start, 42 to 140 cross merges, L1 0.61
// to 1.20 at beat 20, knot CHSH max 2.7945 to 2.8284 (integer+3, 5, 7, 14: Schmidt 0.5030, 0.4970, 2.4e-5 below
// 2 sqrt 2, never reaching it). Side 8: every 6 beats on 16 starts, every 12 on integer+6 (4 cross merges, CHSH exactly
// sqrt 7: its re-meetings recombine but never lift the knot), L1 0.56 to 0.84. Every 'off' member at most sqrt 7. K1:
// on 2.7839 (two meetings) and 2.8174 (three), 0 words at 2 sqrt 2 on the point registers. K2: 18 words on, 0 off (best
// off member 4 / sqrt 3). K3 exact as registered.
//
// DETERMINISM: no random number; starts are E-MTH-0028's family. The rule is exact in Z[w][1/2]; the register circuit
// in Q(w); Schmidt weights and CHSH are floats (measurement). Depth L2: a quantum pair's re-meeting interference, known
// physics, on the rule with a computed control. NOTHING MOVES.

import { experiment } from '@/test/scaffold/suite'
import { verdict } from '@/test/scaffold/verdict'
import { startFamily, withStart } from '@/code/measure/start-ensemble'
import {
  contactFresh,
  likePairStart,
} from '@/code/measure/occupation-veto-readings'
import {
  chshFromWeights,
  registerKnot,
  schmidtWeights as registerWeights,
  vacuumConfiguration,
} from '@/code/measure/doublet-locked-readings'
import { toWords } from '@/code/rule/occupation-veto-knit'
import { coinedVetoBeat } from '@/code/rule/coined-locked-knit'
import {
  lockedState,
  type LockedState,
} from '@/code/rule/doublet-locked-knit'
import { centerOf } from '@/code/measure/wall-reading'
import {
  bornDistribution,
  l1Distance,
} from '@/code/measure/dephased-twin'
import {
  dephasedMembers,
  keptBeat,
  meetRegister,
  membersOf,
  newKeptTally,
  permuteSecond,
  recordedNorm,
  recordedStart,
  registerMatrix,
  registerStart,
  sameSum,
  type KeptMode,
  type RecordedBranch,
  type Register,
} from '@/code/measure/kept-branch'
import {
  applyFirst,
  applySwapPhase,
  cliffordGroup,
  eisNormBig,
  productState,
  schmidtInvariants,
  schmidtWeights,
  stabilizerStates,
  type State9,
} from '@/code/measure/eisenstein-words'
import { pureChshExact } from '@/code/measure/pure-chsh'

const SIDES = [4, 8] as const
const BEATS = 48
const OFF_BEATS = 20
const LONE_BEATS = 16
const SEARCH = 12
const SQRT7 = Math.sqrt(7)
const TSIRELSON = 2 * Math.SQRT2

type LikeReading = {
  found: boolean
  ruleEqual: boolean
  normExact: boolean
  firstSame: boolean
  firstKnot: boolean
  meets: number[]
  lineage: number
  crossWritten: number
  l1: number
  chshMax: number
  offChshMax: number
  weightsAtMax: number[]
}

const openSlots = (b: RecordedBranch): number[] => {
  const out: number[] = []

  for (let i = 0; i < b.vibe.length; i++) {
    if (b.vibe[i] !== 0 && b.open[i]) {
      out.push(i)
    }
  }

  return out
}

const normExact = (s: readonly RecordedBranch[]): boolean => {
  const n = recordedNorm(s)

  return n.total === n.unit
}

// the knot of a set of terms on their two open slots, or undefined when the pair is stored
function knotOf(
  s: RecordedBranch[],
): { weights: number[]; chsh: number } | undefined {
  const open = openSlots(s[0]!)

  if (open.length !== 2) {
    return undefined
  }

  return registerKnot({ branches: s }, open[0]!, open[1]!)
}

function likeRun(side: number): LikeReading {
  const f = contactFresh(side, 'pass')
  const pick = likePairStart(
    'none',
    f.tables,
    toWords(vacuumConfiguration(f, 'none')),
    SEARCH,
  )
  const out: LikeReading = {
    found: pick !== undefined && pick.clean,
    ruleEqual: true,
    normExact: true,
    firstSame: false,
    firstKnot: false,
    meets: [],
    lineage: 0,
    crossWritten: 0,
    l1: 0,
    chshMax: 0,
    offChshMax: 0,
    weightsAtMax: [],
  }

  if (!pick) {
    return out
  }

  let rule: LockedState = lockedState(pick.start)
  let on = recordedStart(pick.start)
  let off = recordedStart(pick.start)

  const tOn = newKeptTally()

  for (let t = 0; t < BEATS; t++) {
    const before = tOn.splits

    rule = coinedVetoBeat('none', f.tables, rule, t)
    on = keptBeat({
      kind: 'none',
      tables: f.tables,
      state: on,
      beat: t,
      mode: 'on',
      tally: tOn,
    })
    out.ruleEqual &&= sameSum(rule.branches, on)
    out.normExact &&= normExact(on)

    if (t < OFF_BEATS) {
      off = keptBeat({
        kind: 'none',
        tables: f.tables,
        state: off,
        beat: t,
        mode: 'off',
      })
      out.normExact &&= normExact(off)

      for (const m of membersOf(off, 'off')) {
        const k = knotOf(m)

        if (k) {
          out.offChshMax = Math.max(out.offChshMax, k.chsh)
        }
      }
    }

    const split = tOn.splits > before

    if (split) {
      out.meets.push(t)
    }

    if (split && out.meets.length === 1) {
      const k = knotOf(on)

      out.firstSame = sameSum(on, off)
      out.firstKnot =
        k !== undefined &&
        k.weights.length === 2 &&
        Math.abs(k.weights[0]! - 0.75) < 1e-12 &&
        Math.abs(k.weights[1]! - 0.25) < 1e-12 &&
        Math.abs(k.chsh - SQRT7) < 1e-9
    }

    const k = knotOf(on)

    if (k && k.chsh > out.chshMax) {
      out.chshMax = k.chsh
      out.weightsAtMax = k.weights
    }

    if (t === OFF_BEATS - 1) {
      out.l1 = l1Distance(
        bornDistribution({ branches: on }),
        bornDistribution({ branches: off }),
      ).value
    }
  }

  out.lineage = tOn.longest
  out.crossWritten = tOn.crossWritten

  return out
}

// L0: a lone love in the closed vacuum, 'on' against 'strict'
function loneRun(): { splits: number; same: boolean; ruleEqual: boolean } {
  const f = contactFresh(4, 'pass')
  const start = toWords(vacuumConfiguration(f, 'none'))
  const slot = centerOf(4) * 24

  start.vibe[slot] = 1
  start.open[slot] = 1

  let rule: LockedState = lockedState(start)
  let on = recordedStart(start)
  let strict = recordedStart(start)

  const tally = newKeptTally()

  let same = true
  let ruleEqual = true

  for (let t = 0; t < LONE_BEATS; t++) {
    rule = coinedVetoBeat('none', f.tables, rule, t)
    on = keptBeat({
      kind: 'none',
      tables: f.tables,
      state: on,
      beat: t,
      mode: 'on',
      tally,
    })
    strict = keptBeat({
      kind: 'none',
      tables: f.tables,
      state: strict,
      beat: t,
      mode: 'strict',
    })
    ruleEqual &&= sameSum(rule.branches, on)
    same &&= sameSum(on, strict)
  }

  return { splits: tally.splits, same, ruleEqual }
}

// ---- K1: the working rule's point registers ----

function registerChsh(s: Register): number {
  const m = registerMatrix(s)
  const w = registerWeights(m.re, m.im)
  const total = w.reduce((a, b) => a + b, 0)

  return chshFromWeights(w.map(x => x / total))
}

function k1(): {
  perms: number
  transitive: boolean
  onBest: number[]
  offBest: number[]
  onceBest: number[]
  atTsirelson: number
} {
  const f = contactFresh(4, 'pass')
  const act = f.weave.moves.act as unknown as ArrayLike<number>[]
  const seen = new Map<string, number[]>()

  for (const p of act) {
    const perm = Array.from({ length: 9 }, (_, i) => p[i]!)

    seen.set(perm.join(','), perm)
  }

  const perms = [...seen.values()]
  const images = new Set(perms.map(p => `${p[0]},${p[1]}`))
  const start = registerStart(0, 1)
  const one = meetRegister(start)
  const onBest = [0, 0]
  const offBest = [0, 0]
  const onceBest = [0, 0]
  const onceValue = registerChsh(one)

  let atTsirelson = 0

  for (const p of perms) {
    const two = meetRegister(permuteSecond(one, p))

    onBest[0] = Math.max(onBest[0]!, registerChsh(two))
    onceBest[0] = Math.max(onceBest[0]!, onceValue)

    for (const m of dephasedMembers(start, [p])) {
      offBest[0] = Math.max(offBest[0]!, registerChsh(m.state))
    }

    for (const q of perms) {
      const c = registerChsh(meetRegister(permuteSecond(two, q)))

      onBest[1] = Math.max(onBest[1]!, c)
      atTsirelson += c > TSIRELSON - 1e-9 ? 1 : 0

      for (const m of dephasedMembers(start, [p, q])) {
        offBest[1] = Math.max(offBest[1]!, registerChsh(m.state))
      }
    }
  }

  onceBest[1] = onceValue

  return {
    perms: perms.length,
    transitive: images.size === 72,
    onBest,
    offBest,
    onceBest,
    atTsirelson,
  }
}

// ---- K2 and K3: roles ----

const swapRoles = (s: State9): State9 => ({
  num: s.num.map((_, i) => s.num[3 * (i % 3) + Math.floor(i / 3)]!),
  k2: s.k2,
  m3: s.m3,
})

function roleReading(s: State9): { half: boolean; chsh: number } {
  const x = schmidtInvariants(s)
  const d4 = x.scale ** 4n
  const d6 = x.scale ** 6n

  return {
    half: x.e3Num === 0n && 4n * x.e2Num === d4,
    chsh: pureChshExact(
      schmidtWeights(
        Number(x.e2Num) / Number(d4),
        Number(x.e3Num) / Number(d6),
      ),
    ),
  }
}

function k2(): {
  onHits: number
  offHalf: number
  offBest: number
  onceHalf: number
} {
  const group = cliffordGroup()
  const stab = stabilizerStates(group)
  const id = group.findIndex(
    g =>
      g.den3 === 0 &&
      g.num.every((x, i) =>
        i % 4 === 0
          ? x[0] === 1 && x[1] === 0
          : x[0] === 0 && x[1] === 0,
      ),
  )
  const out = { onHits: 0, offHalf: 0, offBest: 0, onceHalf: 0 }

  for (let t = 0; t < stab.length; t++) {
    const e0 = productState(stab[0]!, stab[t]!)
    const e1 = applySwapPhase(e0)
    const e2 = applySwapPhase(applyFirst(group[id]!, e1))

    for (const d2 of group) {
      if (!roleReading(applySwapPhase(applyFirst(d2, e2))).half) {
        continue
      }

      out.onHits++

      // 'off': meetings 1 and 2 dephased, members psi or SWAP psi at each, the third coherent
      for (const a of [false, true]) {
        for (const b of [false, true]) {
          let m = a ? swapRoles(e0) : e0

          m = applyFirst(group[id]!, m)
          m = b ? swapRoles(m) : m

          const r = roleReading(applySwapPhase(applyFirst(d2, m)))

          out.offHalf += r.half ? 1 : 0
          out.offBest = Math.max(out.offBest, r.chsh)
        }
      }

      out.onceHalf += roleReading(applyFirst(d2, applyFirst(group[id]!, e1)))
        .half
        ? 1
        : 0
    }
  }

  return out
}

// E-QTM-0100's reading: the chance of roles (1, 0) after n meetings of SWAP U from |0>|1>, exact as p / q strings.
// 'on' through the Eisenstein state; 'off' and 'once' are the dephased chain on this diagonal reading: each meeting
// exchanges with the chance of SWAP U's exchange part, |(1 + w)/2|^2 = 1/4
function k3(): Record<KeptMode | 'once', string[]> {
  const zero = { num: [[1, 0], [0, 0], [0, 0]] as [number, number][], den3: 0 }
  const one = { num: [[0, 0], [1, 0], [0, 0]] as [number, number][], den3: 0 }

  let s = productState(zero, one)

  const on: string[] = []

  for (let n = 1; n <= 3; n++) {
    s = swapRoles(applySwapPhase(s))

    const scale = 2n ** BigInt(s.k2) * 3n ** BigInt(s.m3)
    const x = s.num[3]!
    const p = eisNormBig(BigInt(x[0]), BigInt(x[1]))
    const q = scale * scale
    const g = gcd(p, q)

    on.push(`${p / g}/${q / g}`)
  }

  // the chain: P(n) = P(n-1) (1 - e) + (1 - P(n-1)) e, e = 1/4, in sixty-fourths
  const off: string[] = []

  let p64 = 0n

  for (let n = 1; n <= 3; n++) {
    p64 = (p64 * 3n + (64n - p64)) / 4n

    const g = gcd(p64, 64n)

    off.push(`${p64 / g}/${64n / g}`)
  }

  return { on, off, strict: off, once: ['1/4', '1/4', '1/4'] }
}

function gcd(a: bigint, b: bigint): bigint {
  let x = a < 0n ? -a : a
  let y = b

  while (y !== 0n) {
    ;[x, y] = [y, x % y]
  }

  return x
}

export default experiment({
  id: 'quantum/kept-branch',
  code: 'E-QTM-0163',
  title:
    "the kept branch of a like meeting interferes in the working vacuum, and only Tsirelson's reached bound needs it, pass: E-RLT-0105's like pair meets again every 3 beats on side 4 and every 6 on side 8 (the line's wrap), on 17 of 17 starts, and the rule adds terms whose meeting outcomes differ (42 to 140 merges by beat 47); its knot passes the one-meeting ceiling sqrt 7 on 17 and 16 of 17 (up to 2.8284, Schmidt 0.503, 0.497), where with every meeting but the last dephased no member exceeds sqrt 7; of the 13 held rows only Tsirelson's 'reached' needs the interference (E-QTM-0133's 18 words at (1/2, 1/2, 0) on, 0 off), and E-QTM-0100's clause (1/4, 3/4, 1 on, 1/4, 3/8, 7/16 off)",
  category: 'quantum',
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
    const lone = family.map(m => withStart(m, loneRun))

    log('L0')

    const like = SIDES.map(side =>
      family.map(m => {
        const r = withStart(m, () => likeRun(side))

        log(`side ${side} ${m.name}`)

        return { name: m.name, ...r }
      }),
    )
    const words = k1()

    log('K1')

    const roles = k2()

    log('K2')

    const chances = k3()
    const all = like.flat()
    const count = (
      side: number,
      test: (r: (typeof all)[number]) => boolean,
    ): number => like[SIDES.indexOf(side as 4 | 8)]!.filter(test).length
    const n = family.length
    const gap = (r: LikeReading): number =>
      r.meets.length >= 2 ? r.meets[1]! - r.meets[0]! : 0
    const r5 = like[0]!.filter((r4, i) => {
      const g4 = gap(r4)
      const g8 = gap(like[1]![i]!)

      return g4 > 0 && g8 >= 2 * g4 && g8 % g4 === 0
    }).length
    const g = {
      I1:
        all.every(r => r.ruleEqual) && lone.every(r => r.ruleEqual),
      I2: all.every(r => r.normExact),
      R0: all.every(r => r.found && r.firstSame && r.firstKnot),
      L0: lone.every(r => r.splits === 0 && r.same),
      C1: all.every(r => r.offChshMax <= SQRT7 + 1e-9),
      R1: SIDES.every(s => count(s, r => r.lineage >= 2) === n),
      R2: SIDES.every(s => count(s, r => r.crossWritten > 0) === n),
      R3: SIDES.every(s => count(s, r => r.l1 > 0) === n),
      R4: count(4, r => r.chshMax > SQRT7 + 1e-6) === n,
      R5: r5 === n,
      K1:
        words.transitive &&
        words.onBest.every(c => c > SQRT7 + 1e-6) &&
        [...words.offBest, ...words.onceBest].every(
          c => c <= SQRT7 + 1e-9,
        ),
      K2:
        roles.onHits > 0 &&
        roles.offHalf === 0 &&
        roles.offBest <= SQRT7 + 1e-9 &&
        roles.onceHalf === 0,
      K3:
        chances.on.join() === '1/4,3/4,1/1' &&
        chances.off.join() === '1/4,3/8,7/16' &&
        chances.once.join() === '1/4,1/4,1/4',
    }
    const instrument = g.I1 && g.I2 && g.R0 && g.L0 && g.C1
    const status = !instrument
      ? 'fail'
      : Object.values(g).every(Boolean)
        ? 'pass'
        : 'partial'
    const range = (xs: number[], d = 4): string =>
      `${Math.min(...xs).toFixed(d)} to ${Math.max(...xs).toFixed(d)}`
    const metrics: Record<string, number> = {
      starts: n,
      linkPointPermutations: words.perms,
      registerTwoMeetingsOnBest: words.onBest[0]!,
      registerThreeMeetingsOnBest: words.onBest[1]!,
      registerOffBest: Math.max(...words.offBest),
      registerAtTsirelson: words.atTsirelson,
      rolesOnHalfHalf: roles.onHits,
      rolesOffHalfHalf: roles.offHalf,
      rolesOffBest: roles.offBest,
      loneSplitsMax: Math.max(...lone.map(r => r.splits)),
      seconds: 0,
    }

    SIDES.forEach((side, k) => {
      const rows = like[k]!

      metrics[`side${side}_chshMin`] = Math.min(...rows.map(r => r.chshMax))
      metrics[`side${side}_chshMax`] = Math.max(...rows.map(r => r.chshMax))
      metrics[`side${side}_aboveSqrt7`] = rows.filter(
        r => r.chshMax > SQRT7 + 1e-6,
      ).length
      metrics[`side${side}_atTsirelson`] = rows.filter(
        r => r.chshMax > TSIRELSON - 1e-9,
      ).length
      metrics[`side${side}_l1Min`] = Math.min(...rows.map(r => r.l1))
      metrics[`side${side}_l1Max`] = Math.max(...rows.map(r => r.l1))
      metrics[`side${side}_crossMin`] = Math.min(
        ...rows.map(r => r.crossWritten),
      )
      metrics[`side${side}_offChshMax`] = Math.max(
        ...rows.map(r => r.offChshMax),
      )
    })

    for (const [k, v] of Object.entries(g)) {
      metrics[`gate_${k}`] = v ? 1 : 0
    }

    metrics.seconds = (Date.now() - started) / 1000

    const perStart = (k: number): string =>
      like[k]!
        .map(
          r =>
            `${r.name}: meets ${r.meets.join(',')}, lineage ${r.lineage}, cross merges ${r.crossWritten}, L1 ${r.l1.toFixed(4)}, CHSH max ${r.chshMax.toFixed(6)} (weights ${r.weightsAtMax.map(w => w.toFixed(4)).join(', ')}), off max ${r.offChshMax.toFixed(6)}`,
        )
        .join(' | ')

    return verdict({
      status,
      claim: `the kept branch interferes in the working vacuum: E-RLT-0105's like pair meets again on ${count(4, r => r.lineage >= 2)} and ${count(8, r => r.lineage >= 2)} of ${n} starts (sides 4, 8), the rule adds terms whose meeting outcomes differ on ${count(4, r => r.crossWritten > 0)} and ${count(8, r => r.crossWritten > 0)}, and the knot passes sqrt 7 on ${metrics.side4_aboveSqrt7} and ${metrics.side8_aboveSqrt7} (up to ${Math.max(metrics.side4_chshMax!, metrics.side8_chshMax!).toFixed(4)}), which no state with the interference off reaches (at most ${Math.max(metrics.side4_offChshMax!, metrics.side8_offChshMax!).toFixed(6)}); the re-meeting is the box's wrap (${r5} of ${n}); of the held rows only Tsirelson's "reached" needs it (register words ${words.onBest.map(c => c.toFixed(4)).join(', ')} on, at most ${Math.max(...words.offBest).toFixed(6)} off; E-QTM-0133's ${roles.onHits} words at (1/2, 1/2, 0) on, ${roles.offHalf} off), with E-QTM-0100's clause (${chances.on.join(', ')} on, ${chances.off.join(', ')} off)`,
      metrics,
      control: {
        offMembersAtMostSqrt7: g.C1 ? 1 : 0,
        loneLoveSplits: metrics.loneSplitsMax!,
      },
      notes: `L2. Gates ${Object.entries(g)
        .map(([k, v]) => `${k} ${v}`)
        .join(', ')}. Side 4: ${perStart(0)}. Side 8: ${perStart(1)}. L1 ${range(like[0]!.map(r => r.l1))} (side 4), ${range(like[1]!.map(r => r.l1))} (side 8). K1: ${words.perms} point permutations, 2-transitive ${words.transitive}; on best ${words.onBest.join(', ')}, off ${words.offBest.join(', ')}, once ${words.onceBest.join(', ')}; ${words.atTsirelson} three-meeting words within 1e-9 of 2 sqrt 2. K2: ${JSON.stringify(roles)}. K3: ${JSON.stringify(chances)}. ${((Date.now() - started) / 1000).toFixed(0)} s.`,
    })
  },
})
