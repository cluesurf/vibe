// THE VACUUM'S OWN MEETING WORDS AGAINST THE 108 (E-QTM-0171, routes file quantum-relativity-light-computation.md, the
// row "count the vacuum's own words" under Tsirelson's bound). E-QTM-0133 found that 108 of the 559,872 three-meeting
// words U (D2 x 1) U (D1 x 1) U |0>|t> (t one of the 12 stabilizer roles, D1, D2 any of the 216 local Cliffords) end at
// Schmidt weights (1/2, 1/2, 0), where CHSH = 2 sqrt 2 exactly. E-QTM-0163 found that the working vacuum's like pair
// (E-RLT-0105's pick) meets again every 3 beats on side 4 and every 6 on side 8, and that its knot comes within 2.4e-5
// of 2 sqrt 2 without reaching it. The row asks whether the words the vacuum actually runs are among the 108; its kill:
// zero matches on every start, and then the row should say "approached".
//
// WHAT IS RUN. Per start of E-MTH-0028's 17 and per side (4 and 8), the working rule (coinedVetoBeat, veto 'none', the
// pass contact) from E-RLT-0105's like-pair start, 64 beats. Beside it, two single-mark shadows of the classical
// occupation (one per vibe of the pair) run the rule's own collision and stream, so each vibe's slot is known every
// beat and the grid move of the link it streams through is read from the tables. Between two meetings of the pair each
// vibe's point is moved by the product of those link moves, P for vibe A and Q for vibe B.
//
// DERIVED BEFORE THE GATE RUN.
// 1. THE RULE'S MEETING. On the pair's points the like meeting keeps with (1 + w)/2 = K and exchanges with -(1 - w)/2 =
//    -X (code/rule/occupation-veto-knit KEEP, EXCHANGE), and on equal points multiplies by w = K - X. So every meeting,
//    split or not, is the one operator M = K 1 - X SWAP on the two points. E-QTM-0133's swap phase is U = K 1 + X SWAP
//    = P_sym + w P_anti, while M = w P_sym + P_anti = w U^dagger. The rule's like meeting is the complex conjugate of
//    E-QTM-0133's up to the unit w. The Clifford group, the stabilizer roles and the Schmidt weights are closed under
//    complex conjugation, so the list for M is the conjugate of the 108, again 108 words. Both lists are matched.
// 2. THE RELATIVE MOVE. Every non-meeting piece moves a vibe's point only by its link's grid move (the stream); the
//    store keeps a stored vibe's point in its pair word and gives it back, and the collision moves slots, not points.
//    Both meetings commute with D x D, so (P2 x Q2) M (P1 x Q1) M = (local) M (P2 Q2^-1 x 1) ... and a window of three
//    meetings is, up to a local unitary after it, the word M (R2 x 1) M (R1 x 1) M with R_i = P_i Q_i^-1, the same shape
//    as E-QTM-0133's.
// 3. THE IDENTIFICATION. A grid move is a permutation of the nine phase points; the 216 local Cliffords permute the
//    phase-point operators by conjugation, 216 distinct permutations, in E-QTM-0133's convention A (grid index = phase
//    point index), where its G5 found them among the weave's moves. So each R is one Clifford, and the vacuum's window
//    (R1, R2) is a word of the list's shape. The start: the 108 begin at |0>|t>; a vacuum window begins wherever the pair
//    is. So two readings: LITERAL, (R1, R2) is the (D1, D2) of one of the listed words; BROAD, some product of two
//    stabilizer roles (144 starts) is taken by the window's word to (1/2, 1/2, 0) exactly.
//
// PROBES BEFORE THE GATES, DISCLOSED. tmp/vw-probe1.ts (17 starts, side 4, 9 s): the pair meets at beats 1, 4, ..., 61,
//  21 meetings, and the inter-meeting moves alternate between two (P, Q) pairs on every start. tmp/vw-probe2.ts (both
//  sides, 41 s): the U list has 108 words with 108 distinct (D1, D2), 22 distinct D1; side 8 meets 11 times every 6
//  beats (E-QTM-0163's every 12 on integer+6 counts split meetings only, so every other meeting there is at equal
//  points); each start runs two windows (R1, R2) and (R2, R1) (one, (5, 5), on side 8 integer+12); 0 literal and 0
//  broad matches on every start. tmp/vw-probe3.ts (the U^dagger list, point 1): again 108 words, again 0 and 0. So the
//  outcome of P1 below was seen before the gates were written; the gate run adds the instrument check against the rule
//  itself, the planted control and the readings past three meetings.
//
// HYPOTHESES AND GATES, fixed before the gate run, never moved.
//  I1 INSTRUMENT, on all 34 runs: the 216 Cliffords give 216 distinct point permutations, all among the weave's grid
//     moves, and every inter-meeting R maps to one of them; the shadows' occupation equals every branch's occupation of
//     the rule at every beat; the shadows' meeting beats are exactly the beats where the rule counts a like meeting;
//     the coin splits nothing; and the two-vibe register built from the shadows' word alone (M at each meeting, P x Q
//     between) is proportional to the rule's amplitudes on the pair's points, exactly in Q(w), at every beat where both
//     vibes are free, from the first such beat to beat 64.
//  C1 CONTROL (the instrument can read a match): planted windows, built as interval moves P = perm(D) Q from a real
//     vacuum interval's Q with (D1, D2) taken from the first word of each list, are read back by the same pipeline as
//     literal matches in their list and as broad matches (at least one of 144 starts).
//  H1 THE ROUTE: on some start and side, some vacuum window matches literally in the U list or the U^dagger list.
//  P1 THE KILL (the row's own): zero literal matches in both lists and zero broad matches in both conventions, on every
//     start and both sides. Predicted from the probes: P1 fires.
// VERDICT, fixed before the run: FAIL if I1 or C1 fails (the instrument); PASS if H1 holds; FAIL as predicted if P1
//  holds (the exact reach is a word the rule never runs); PARTIAL otherwise (broad matches without a literal one).
// REPORTED, NOT GATED: the role words past three meetings, the vacuum's alternating R1, R2, R1, ... run as role words
//  from all 144 stabilizer products for up to 12 meetings, both conventions, counting exact (1/2, 1/2, 0); the rule's
//  own knot (the register) tested exactly for Tr rho^2 = 1/2 and Tr rho^3 = 1/4 at every free beat, and its largest
//  float CHSH.
// WHAT THIS CAN AND CANNOT SHOW. It reads the words one like pair (E-RLT-0105's pick) runs over 64 beats on two box
//  sizes and 17 link starts; other like pairs, other boxes and later beats are not read. The match is made through
//  the identification of point 3 (a grid move as the Clifford that permutes the phase points the same way); the vacuum's
//  knot itself lives on the pair's points, a nine-by-nine register, not on two roles, so the role words are the list's
//  language, not the vacuum's state. A fail says the rule's own like pair does not run any of the 108 three-meeting words
//  on these starts; it does not say no history of the rule could.
//
// FIRST RUN 2026-10-02 (tmp/vw-run1.log, 146 s): FAIL as predicted, I1 and C1 held, H1 failed, P1 fired, no gate moved,
//  title written after the run. Both lists hold 108 words (108 distinct (D1, D2) each); the 216 Cliffords give 216
//  distinct point permutations, all among the weave's grid moves. The like pair meets 21 times on side 4 (every 3 beats
//  from beat 1) and 11 times on side 8 (every 6), on all 17 starts; the inter-meeting moves alternate between two, so
//  the vacuum runs 67 distinct windows in all (two per start and side, one, (5, 5), on side 8 integer+12). Literal
//  matches 0 (U list) and 0 (U^dagger list); broad matches 0 and 0 over 144 starts each; the alternating role words to
//  12 meetings from all 144 products 0 and 0. The register built from the shadows' word is proportional to the rule's
//  amplitudes, exactly, at all 1,428 free beats (42 of 64 per run; the pair is stored on the others), the coin splits
//  nothing and the meeting beats agree with the rule's count. The rule's knot is at (1/2, 1/2, 0) exactly at 0 of 1,428
//  free beats; its largest CHSH is 2.828403 (2.4e-5 below 2 sqrt 2) on side 4 integer+3, 5, 7, 14 and side 8 integer+3,
//  smallest side-4 maximum 2.816462, side 8 down to sqrt 7 (integer+6). The planted windows read back as literal matches
//  (1 each) and broad ones (4 of 144 each). So the vacuum's own words are not among the 108, and the exact reach of
//  2 sqrt 2 stays an arranged word: by the row's kill it should read "approached".
//
// Depth L1: exact counts and exact arithmetic (Z[w][1/6] for roles, Q(w) for the register); floats only in the
// reported CHSH. Deterministic: no random number; starts are E-MTH-0028's family.

import { experiment } from '@/test/scaffold/suite'
import { verdict } from '@/test/scaffold/verdict'
import { startFamily, withStart } from '@/code/measure/start-ensemble'
import {
  contactFresh,
  likePairStart,
} from '@/code/measure/occupation-veto-readings'
import {
  chshFromWeights,
  sameOccupation,
  schmidtWeights as matrixSchmidt,
  vacuumConfiguration,
} from '@/code/measure/doublet-locked-readings'
import { collideVeto, toWords } from '@/code/rule/occupation-veto-knit'
import {
  cloneConfiguration,
  lockedState,
  newTally,
  streamConfiguration,
  type Configuration,
  type LockedState,
} from '@/code/rule/doublet-locked-knit'
import {
  coinedVetoBeat,
  newCoinTally,
} from '@/code/rule/coined-locked-knit'
import { OPPOSITE } from '@/code/rule/isometric-knit'
import {
  applyFirst,
  applySwapPhase,
  cliffordGroup,
  eisMul,
  eisValue,
  productState,
  reduceState,
  schmidtInvariants,
  stabilizerStates,
  type Eis,
  type Mat3,
  type State9,
} from '@/code/measure/eisenstein-words'
import {
  phasePointOperators,
  type Operator,
} from '@/code/measure/grid-weights'
import {
  add,
  isZero,
  K,
  mul,
  neg,
  qw,
  sub,
  W,
  X,
  type Qw,
} from '@/code/measure/rule-gates'
import {
  powerSums,
  registerMatrix,
  type Register,
} from '@/code/measure/kept-branch'

const SIDES = [4, 8] as const
const BEATS = 64
const SEARCH = 12
const ROLE_MEETINGS = 12
const IDENTITY = Array.from({ length: 9 }, (_, i) => i)

type Meeting = 'U' | 'Udag'

// ---- roles ----

// U^dagger = ((1 + w^2) 1 + (1 - w^2) SWAP) / 2 = (-w 1 + (2 + w) SWAP) / 2, the rule's meeting up to w (point 1)
function applySwapPhaseDagger(s: State9): State9 {
  const a: Eis = [0, -1]
  const b: Eis = [2, 1]
  const num: Eis[] = []

  for (let i = 0; i < 3; i++) {
    for (let j = 0; j < 3; j++) {
      const x = eisMul(a, s.num[3 * i + j]!)
      const y = eisMul(b, s.num[3 * j + i]!)

      num.push([x[0] + y[0], x[1] + y[1]])
    }
  }

  return reduceState({ num, k2: s.k2 + 1, m3: s.m3 })
}

const meet = (m: Meeting, s: State9): State9 =>
  m === 'U' ? applySwapPhase(s) : applySwapPhaseDagger(s)

function isHalfHalf(s: State9): boolean {
  const inv = schmidtInvariants(s)

  return inv.e3Num === 0n && 4n * inv.e2Num === inv.scale ** 4n
}

function floatOf(m: Mat3): Operator {
  const o: Operator = {
    n: 3,
    re: new Float64Array(9),
    im: new Float64Array(9),
  }

  m.num.forEach((x, i) => {
    const [re, im] = eisValue(x, 3 ** m.den3)

    o.re[i] = re
    o.im[i] = im
  })

  return o
}

// a b, or a b^dagger
function product(a: Operator, b: Operator, dagger: boolean): Operator {
  const o: Operator = {
    n: 3,
    re: new Float64Array(9),
    im: new Float64Array(9),
  }

  for (let i = 0; i < 3; i++) {
    for (let j = 0; j < 3; j++) {
      let re = 0
      let im = 0

      for (let k = 0; k < 3; k++) {
        const ar = a.re[i * 3 + k]!
        const ai = a.im[i * 3 + k]!
        const br = dagger ? b.re[j * 3 + k]! : b.re[k * 3 + j]!
        const bi = dagger ? -b.im[j * 3 + k]! : b.im[k * 3 + j]!

        re += ar * br - ai * bi
        im += ar * bi + ai * br
      }

      o.re[i * 3 + j] = re
      o.im[i * 3 + j] = im
    }
  }

  return o
}

// the permutation of the nine phase points a Clifford makes by conjugation (E-QTM-0133's convention A)
function pointPermutation(u: Operator): number[] {
  const points = phasePointOperators(1)

  return points.map(p => {
    const moved = product(product(u, p, false), u, true)

    return points.findIndex(q =>
      q.re.every(
        (v, i) =>
          Math.abs(v - moved.re[i]!) < 1e-9 &&
          Math.abs(q.im[i]! - moved.im[i]!) < 1e-9,
      ),
    )
  })
}

const inverse = (p: readonly number[]): number[] => {
  const q = new Array<number>(9)

  p.forEach((v, i) => (q[v] = i))

  return q
}

// P Q^-1 as a point table
const relative = (
  p: readonly number[],
  q: readonly number[],
): number[] => {
  const qi = inverse(q)

  return IDENTITY.map(x => p[qi[x]!]!)
}

type Lists = {
  group: Mat3[]
  stab: ReturnType<typeof stabilizerStates>
  permOf: number[][]
  indexOf: Map<string, number>
  list: Record<Meeting, Set<string>>
  first: Record<Meeting, [number, number]>
  hits: Record<Meeting, number>
}

function buildLists(): Lists {
  const group = cliffordGroup()
  const stab = stabilizerStates(group)
  const permOf = group.map(g => pointPermutation(floatOf(g)))
  const indexOf = new Map<string, number>()

  permOf.forEach((p, i) => indexOf.set(p.join(','), i))

  const list: Record<Meeting, Set<string>> = {
    U: new Set(),
    Udag: new Set(),
  }
  const first: Record<Meeting, [number, number]> = {
    U: [-1, -1],
    Udag: [-1, -1],
  }
  const hits: Record<Meeting, number> = { U: 0, Udag: 0 }

  for (const m of ['U', 'Udag'] as const) {
    for (const role of stab) {
      const s1 = meet(m, productState(stab[0]!, role))

      for (let i = 0; i < group.length; i++) {
        const s2 = meet(m, applyFirst(group[i]!, s1))

        for (let j = 0; j < group.length; j++) {
          if (isHalfHalf(meet(m, applyFirst(group[j]!, s2)))) {
            hits[m]++
            list[m].add(`${i},${j}`)

            if (first[m][0] < 0) {
              first[m] = [i, j]
            }
          }
        }
      }
    }
  }

  return { group, stab, permOf, indexOf, list, first, hits }
}

// the broad reading: how many of the 144 stabilizer products the window's word takes to (1/2, 1/2, 0)
function broadCount(
  L: Lists,
  m: Meeting,
  r1: number,
  r2: number,
): number {
  let n = 0

  for (const a of L.stab) {
    for (const b of L.stab) {
      const s = meet(
        m,
        applyFirst(
          L.group[r2]!,
          meet(
            m,
            applyFirst(L.group[r1]!, meet(m, productState(a, b))),
          ),
        ),
      )

      n += isHalfHalf(s) ? 1 : 0
    }
  }

  return n
}

// the role words past three meetings: R1, R2, R1, ... between up to `count` meetings, from all 144 products
function longRoleHits(
  L: Lists,
  m: Meeting,
  rs: readonly number[],
  count: number,
): { hits: number; overflow: number } {
  let hits = 0
  let overflow = 0

  for (const a of L.stab) {
    for (const b of L.stab) {
      try {
        let s = meet(m, productState(a, b))

        for (let n = 1; n < count && n - 1 < rs.length; n++) {
          s = meet(m, applyFirst(L.group[rs[n - 1]!]!, s))

          if (n >= 2 && isHalfHalf(s)) {
            hits++
          }
        }
      } catch {
        overflow++
      }
    }
  }

  return { hits, overflow }
}

// ---- the register on the pair's points, with the rule's meeting M = K 1 - X SWAP ----

function addTo(out: Register, key: number, v: Qw): void {
  const s = add(out.get(key) ?? qw(0n), v)

  if (isZero(s)) {
    out.delete(key)
  } else {
    out.set(key, s)
  }
}

function meetRule(s: Register): Register {
  const out: Register = new Map()
  const minusX = neg(X)

  for (const [key, v] of s) {
    const a = Math.floor(key / 9)
    const b = key % 9

    if (a === b) {
      addTo(out, key, mul(v, W))
    } else {
      addTo(out, key, mul(v, K))
      addTo(out, 9 * b + a, mul(v, minusX))
    }
  }

  return out
}

function moveBoth(
  s: Register,
  p: readonly number[],
  q: readonly number[],
): Register {
  const out: Register = new Map()

  for (const [key, v] of s) {
    out.set(9 * p[Math.floor(key / 9)]! + q[key % 9]!, v)
  }

  return out
}

function ruleRegister(
  s: LockedState,
  slotA: number,
  slotB: number,
): Register {
  const out: Register = new Map()

  for (const b of s.branches) {
    addTo(
      out,
      9 * b.point[slotA]! + b.point[slotB]!,
      qw(b.a, b.b, 1n << BigInt(b.k)),
    )
  }

  return out
}

// equal up to one common nonzero factor, exactly
function proportional(a: Register, b: Register): boolean {
  if (a.size !== b.size || a.size === 0) {
    return false
  }

  const [k0, a0] = [...a.entries()][0]!
  const b0 = b.get(k0)

  if (!b0) {
    return false
  }

  for (const [k, v] of a) {
    const w = b.get(k)

    if (!w || !isZero(sub(mul(v, b0), mul(w, a0)))) {
      return false
    }
  }

  return true
}

const HALF = qw(1n, 0n, 2n)
const QUARTER = qw(1n, 0n, 4n)

// ---- one vacuum run ----

type VacuumRun = {
  found: boolean
  instrument: boolean
  shadowOccupation: boolean
  meetingsAgree: boolean
  coinSplits: number
  registerChecked: number
  registerProportional: boolean
  unmappedMoves: number
  meets: number[]
  rs: number[]
  q0: number[]
  registerExactHalf: number
  chshMax: number
}

function vacuumRun(L: Lists, side: number): VacuumRun {
  const f = contactFresh(side, 'pass')
  const pick = likePairStart(
    'none',
    f.tables,
    toWords(vacuumConfiguration(f, 'none')),
    SEARCH,
  )
  const out: VacuumRun = {
    found: pick?.clean === true,
    instrument: false,
    shadowOccupation: true,
    meetingsAgree: true,
    coinSplits: 0,
    registerChecked: 0,
    registerProportional: true,
    unmappedMoves: 0,
    meets: [],
    rs: [],
    q0: [],
    registerExactHalf: 0,
    chshMax: 0,
  }

  if (!pick) {
    return out
  }

  // the two single-mark shadows, vibe A first (store lines in order, first slot before second)
  const marks: Configuration[] = []

  pick.start.sopen.forEach((bits, line) => {
    for (const bit of [1, 2]) {
      if (bits & bit) {
        const c = cloneConfiguration(pick.start)

        c.sopen.fill(0)
        c.sopen[line] = bit
        marks.push(c)
      }
    }
  })

  if (marks.length !== 2) {
    out.found = false

    return out
  }

  const slotOf = (c: Configuration): number =>
    c.open.findIndex(v => v !== 0)
  const tally = newTally()
  const coinTally = newCoinTally()

  let rule: LockedState = lockedState(pick.start)
  let register: Register | undefined
  let cum = [IDENTITY, IDENTITY]

  for (let t = 0; t < BEATS; t++) {
    const sa = slotOf(marks[0]!)
    const sb = slotOf(marks[1]!)

    for (const b of rule.branches) {
      out.shadowOccupation &&=
        sameOccupation(b, marks[0]!) && sameOccupation(b, marks[1]!)
    }

    const free = sa >= 0 && sb >= 0

    if (free && !register) {
      register = ruleRegister(rule, sa, sb)
    }

    if (free && register) {
      const r = ruleRegister(rule, sa, sb)

      out.registerChecked++
      out.registerProportional &&= proportional(register, r)

      const ps = powerSums(register)

      out.registerExactHalf +=
        isZero(sub(ps.p2, HALF)) && isZero(sub(ps.p3, QUARTER)) ? 1 : 0

      const mat = registerMatrix(register)
      const w = matrixSchmidt(mat.re, mat.im)
      const total = w.reduce((x, y) => x + y, 0)

      out.chshMax = Math.max(
        out.chshMax,
        chshFromWeights(w.map(x => x / total)),
      )
    }

    const meeting =
      free &&
      Math.floor(sa / 24) === Math.floor(sb / 24) &&
      OPPOSITE[sa % 24] === sb % 24 &&
      marks[0]!.vibe[sa] === marks[0]!.vibe[sb]

    if (meeting) {
      if (out.meets.length > 0) {
        out.rs.push(
          L.indexOf.get(relative(cum[0]!, cum[1]!).join(',')) ?? -1,
        )

        if (out.q0.length === 0) {
          out.q0 = cum[1]!
        }
      }

      out.meets.push(t)
      cum = [IDENTITY, IDENTITY]

      if (register) {
        register = meetRule(register)
      }
    }

    // the rule's beat
    const before = tally.likeMeetings

    rule = coinedVetoBeat('none', f.tables, rule, t, tally, coinTally)
    out.meetingsAgree &&= tally.likeMeetings > before === meeting

    // the shadows: the collision, then the link move of the slot each vibe streams from, then the stream
    const moves: number[][] = [IDENTITY, IDENTITY]

    marks.forEach((c, k) => {
      collideVeto('none', f.tables, c, t, false)

      const s = slotOf(c)

      if (s >= 0) {
        const mv = IDENTITY.map(p => f.tables.move[s * 9 + p]!)

        moves[k] = mv
        cum[k] = cum[k]!.map(p => mv[p]!)
      }

      streamConfiguration(f.tables, c, false)
    })

    if (register) {
      register = moveBoth(register, moves[0]!, moves[1]!)
    }
  }

  out.coinSplits = coinTally.splits
  out.unmappedMoves = out.rs.filter(r => r < 0).length
  out.instrument =
    out.found &&
    out.shadowOccupation &&
    out.meetingsAgree &&
    out.coinSplits === 0 &&
    out.registerChecked > 0 &&
    out.registerProportional &&
    out.unmappedMoves === 0

  return out
}

// the windows of a run: consecutive (R_i, R_i+1), distinct
function windowsOf(rs: readonly number[]): [number, number][] {
  const seen = new Map<string, [number, number]>()

  for (let i = 0; i + 1 < rs.length; i++) {
    seen.set(`${rs[i]},${rs[i + 1]}`, [rs[i]!, rs[i + 1]!])
  }

  return [...seen.values()]
}

type Match = {
  windows: number
  literal: Record<Meeting, number>
  broad: Record<Meeting, number>
}

function matchWindows(
  L: Lists,
  ws: readonly [number, number][],
): Match {
  const out: Match = {
    windows: ws.length,
    literal: { U: 0, Udag: 0 },
    broad: { U: 0, Udag: 0 },
  }

  for (const [r1, r2] of ws) {
    for (const m of ['U', 'Udag'] as const) {
      out.literal[m] += L.list[m].has(`${r1},${r2}`) ? 1 : 0
      out.broad[m] += broadCount(L, m, r1, r2)
    }
  }

  return out
}

export default experiment({
  id: 'quantum/vacuum-meeting-words',
  code: 'E-QTM-0171',
  title:
    "the working vacuum's like pair never runs one of the 108 words that reach Tsirelson's bound exactly, fail as predicted: over 17 starts and sides 4 and 8 (64 beats) its link moves between meetings alternate between two, 67 distinct three-meeting windows in all, and 0 match E-QTM-0133's list or its conjugate (the rule's meeting is w U^dagger), 0 reach Schmidt (1/2, 1/2, 0) from any of 144 stabilizer products, and the rule's knot, matched exactly by the word at 1,428 free beats, is never at (1/2, 1/2, 0), coming to 2.828403 on 5 of 34 runs; so the reach is approached, not run",
  category: 'quantum',
  substrates: ['3434'],
  depth: 'L1',
  paper: false,
  run() {
    const started = Date.now()
    const log = (what: string): void =>
      console.error(
        `${what} ${Math.round((Date.now() - started) / 1000)}s`,
      )
    const L = buildLists()

    log('lists')

    const family = startFamily(16)
    const weaveMoves = new Set<string>()

    withStart(family[0]!, () => {
      const f = contactFresh(4, 'pass')
      const act = f.weave.moves.act as unknown as ArrayLike<number>[]

      for (const p of act) {
        weaveMoves.add(
          Array.from({ length: 9 }, (_, i) => p[i]!).join(','),
        )
      }
    })

    const cliffordMovesOk =
      L.indexOf.size === 216 &&
      L.permOf.every(p => weaveMoves.has(p.join(',')))
    const runs = SIDES.map(side =>
      family.map(m => {
        const r = withStart(m, () => vacuumRun(L, side))
        const ws = windowsOf(r.rs)
        const match = matchWindows(L, ws)
        const long: Record<
          Meeting,
          { hits: number; overflow: number }
        > = {
          U: longRoleHits(L, 'U', r.rs, ROLE_MEETINGS),
          Udag: longRoleHits(L, 'Udag', r.rs, ROLE_MEETINGS),
        }

        log(`side ${side} ${m.name}`)

        return { name: m.name, side, run: r, ws, match, long }
      }),
    )
    const all = runs.flat()

    // C1: planted windows from a real interval's Q
    const q = all[0]!.run.q0
    const planted = (['U', 'Udag'] as const).map(m => {
      const [d1, d2] = L.first[m]
      const p1 = q.map(x => L.permOf[d1]![x]!)
      const p2 = q.map(x => L.permOf[d2]![x]!)
      const r1 = L.indexOf.get(relative(p1, q).join(',')) ?? -1
      const r2 = L.indexOf.get(relative(p2, q).join(',')) ?? -1
      const match = matchWindows(L, [[r1, r2]])

      return {
        m,
        readBack: r1 === d1 && r2 === d2,
        literal: match.literal[m],
        broad: match.broad[m],
      }
    })

    const sum = (f: (x: (typeof all)[number]) => number): number =>
      all.reduce((s, x) => s + f(x), 0)
    const literalU = sum(x => x.match.literal.U)
    const literalUdag = sum(x => x.match.literal.Udag)
    const broadU = sum(x => x.match.broad.U)
    const broadUdag = sum(x => x.match.broad.Udag)
    const g = {
      I1:
        cliffordMovesOk &&
        q.length === 9 &&
        all.every(x => x.run.instrument),
      C1: planted.every(
        p => p.readBack && p.literal === 1 && p.broad >= 1,
      ),
      H1: literalU + literalUdag > 0,
      P1:
        literalU === 0 &&
        literalUdag === 0 &&
        broadU === 0 &&
        broadUdag === 0,
    }
    const status =
      !g.I1 || !g.C1
        ? 'fail'
        : g.H1
          ? 'pass'
          : g.P1
            ? 'fail'
            : 'partial'
    const seconds = (Date.now() - started) / 1000
    const metrics: Record<string, number> = {
      starts: family.length,
      listU: L.hits.U,
      listUdag: L.hits.Udag,
      listUDistinctPairs: L.list.U.size,
      listUdagDistinctPairs: L.list.Udag.size,
      cliffordPermutations: L.indexOf.size,
      cliffordMovesAmongWeaveMoves: cliffordMovesOk ? 1 : 0,
      windowsTotal: sum(x => x.match.windows),
      literalU,
      literalUdag,
      broadU,
      broadUdag,
      startsWithLiteralMatch: all.filter(
        x => x.match.literal.U + x.match.literal.Udag > 0,
      ).length,
      longRoleHitsU: sum(x => x.long.U.hits),
      longRoleHitsUdag: sum(x => x.long.Udag.hits),
      longRoleOverflow: sum(
        x => x.long.U.overflow + x.long.Udag.overflow,
      ),
      registerBeatsChecked: sum(x => x.run.registerChecked),
      registerExactHalfHalf: sum(x => x.run.registerExactHalf),
      coinSplits: sum(x => x.run.coinSplits),
      seconds,
    }

    SIDES.forEach((side, k) => {
      const rows = runs[k]!

      metrics[`side${side}_meetingsMin`] = Math.min(
        ...rows.map(r => r.run.meets.length),
      )

      metrics[`side${side}_meetingsMax`] = Math.max(
        ...rows.map(r => r.run.meets.length),
      )

      metrics[`side${side}_chshMin`] = Math.min(
        ...rows.map(r => r.run.chshMax),
      )

      metrics[`side${side}_chshMax`] = Math.max(
        ...rows.map(r => r.run.chshMax),
      )
    })

    for (const [k, v] of Object.entries(g)) {
      metrics[`gate_${k}`] = v ? 1 : 0
    }

    const perRun = all
      .map(
        x =>
          `side ${x.side} ${x.name}: meets ${x.run.meets.length} (first ${x.run.meets[0] ?? -1}, gap ${(x.run.meets[1] ?? 0) - (x.run.meets[0] ?? 0)}), windows ${x.ws.map(w => `(${w.join(',')})`).join(' ')}, literal U ${x.match.literal.U} Udag ${x.match.literal.Udag}, broad U ${x.match.broad.U} Udag ${x.match.broad.Udag}, long ${x.long.U.hits}/${x.long.Udag.hits}, register beats ${x.run.registerChecked} exact half ${x.run.registerExactHalf} CHSH max ${x.run.chshMax.toFixed(6)}, instrument ${x.run.instrument}`,
      )
      .join(' | ')

    return verdict({
      status,
      claim: `the working vacuum's like pair runs ${metrics.windowsTotal} distinct three-meeting windows over ${family.length} starts and sides 4 and 8 (64 beats); ${literalU} match E-QTM-0133's 108 words literally (${literalUdag} in the conjugate list of the rule's own meeting w U^dagger), and ${broadU} and ${broadUdag} reach Schmidt (1/2, 1/2, 0) from any of the 144 stabilizer products; the rule's knot meets (1/2, 1/2, 0) exactly at ${metrics.registerExactHalfHalf} of ${metrics.registerBeatsChecked} free beats (CHSH up to ${Math.max(metrics.side4_chshMax!, metrics.side8_chshMax!).toFixed(6)})`,
      metrics,
      control: {
        plantedU_readBack: planted[0]!.readBack ? 1 : 0,
        plantedU_literal: planted[0]!.literal,
        plantedU_broad: planted[0]!.broad,
        plantedUdag_readBack: planted[1]!.readBack ? 1 : 0,
        plantedUdag_literal: planted[1]!.literal,
        plantedUdag_broad: planted[1]!.broad,
      },
      notes: `L1. Gates ${Object.entries(g)
        .map(([k, v]) => `${k} ${v}`)
        .join(
          ', ',
        )}. First list words U ${L.first.U.join(',')}, Udag ${L.first.Udag.join(',')}. ${perRun}. ${seconds.toFixed(0)} s.`,
    })
  },
})
