// The knit's quantum results under the doublet-locked rule, on the coset-union vacuum, paired against the old rule on
// the same start (E-RLT-0099; E-MTH-0028's adoption rule).
//
// WHAT CHANGES, derived before any run (code/rule/doublet-locked-knit, E-RLT-0097):
//  (a) A LOVE AND A FEAR MEET AS THE IDENTITY. On one line they hold opposite labels, orthogonal to Phi under C, so the
//      singlet phase does nothing: every fear the old rule made at a love-fear meeting is gone (E-SPN-0073's helicity
//      suppression, now in the knit).
//  (b) TWO LIKE VIBES EXCHANGE THEIR POINTS. The role is the label (the copy direction), and the point is a register the
//      meeting moves: a like meeting of different points makes a two-term knot, (1 + w)/2 on the kept assignment and
//      -(1 - w)/2 on the exchanged one, orthogonal registers, Schmidt weights 1/4 and 3/4 exactly, so CHSH = 2 sqrt(1 +
//      4 (1/4)(3/4)) = sqrt 7, the ladder's TOP rung, whatever the points; equal points give a phase and CHSH 2. The
//      ladder collapses to {2, sqrt 7}: the middle rungs of E-QTM-0140 come from roles that overlap by 1/3, and two
//      registers never overlap.
//  (c) FEAR IS CARRIED BY MOTION. A moving vibe's role is one of the lock's two doublet vectors. The doublet's four
//      stabilizer states have pairwise overlap 1/3 (a tetrahedron on its Bloch sphere), so no two are orthogonal and no
//      lock puts both copy directions on stabilizer states; the lock of a husk line (E-SPN-0081: a Q8 element's axis)
//      puts both on edge midpoints, each with a Wigner weight of (1 - sqrt 3)/12 at four points. So every moving vibe
//      holds a fixed fear share (sqrt 3 - 1)/(1 + 2 sqrt 3) and mana ln((1 + 2 sqrt 3)/3), with no meeting at all, and by
//      E-QTM-0149's identity (S_u = 36 W(u) + 4, a theorem on every two-role state) two moving vibes are contextual for
//      the model's readings. "The fear beat is the only source of magic" and "the Clifford part is noncontextual" do not
//      survive the lock.
//  (d) POSITIONS CARRY AMPLITUDE through the neutral veto: an exchanged point makes the pair's return a veto, so the
//      terms of a like study hold different occupations.
//
// THE STUDIES, per start of E-MTH-0028's 17, on the side-4 coset-union vacuum (the vacuum's unit pairs, found on the
// start's own history by an id-tracking run of the old rule, code/measure/doublet-locked-readings idRun):
//  LIKE   the first like meeting of two vacuum vibes with different points (within 12 beats); those two vibes open
//  UNLIKE the first meeting of a love and a fear (within 12 beats); those two vibes open
// The OLD column runs the old whole (code/rule/fear-weave advanceWhole, the color law with frames, the comoving beat,
// exactFearKernels like 1 unlike 1 unexchanged as code/measure/bounce-battery reads the bounce knit) on the same two
// tokens and the same history, and code/measure/bounce-battery quantum() on the union vacuum (its 14 gates, the old
// rule's own reading of this vacuum).
//
// Gates, fixed before this file's first run (probes tmp/dl-probe3 (role facts), dl-probe6 (the like study at integer+0,
// integer+1 and golden: split at beat 1, knot 3/4 and 1/4, CHSH 2.6458, 3 occupations at beat 48, old CHSH 2.3094,
// 2.3094, 2.0000) and dl-probe8 (timing of quantum()) ran first, disclosed):
//  Q1 UNLIKE: the locked rule makes no split in 48 beats (one term, the classical history) on every start where the study
//     exists; the control is informative: the old whole with the fear beat on differs from the fear-off whole on the same
//     history on at least one start
//  Q2 LIKE: at the first split the two-vibe knot has Schmidt weights 3/4 and 1/4 (1e-12) and CHSH sqrt 7 (1e-9), on every
//     start
//  Q3 exact: the norm is exact at every beat and the exact inverse returns amplitude 1 on the start, both studies, every
//     start
//  Q4 LIKE: the terms hold more than one occupation within 48 beats, on every start (positions carry amplitude)
//  Q5 the role facts: the doublet holds 4 of the 12 stabilizer states with pairwise overlap 1/3; for each of the 6 Q8
//     elements the lock's two states have exactly four Wigner weights (1 - sqrt 3)/12 and none other negative (1e-12),
//     leak off the doublet under 1e-12; and on every product of two lock states S_u = 36 W(u) + 4 at all 81 points
//     (1e-12), violated exactly where W(u) < 0, with 40 violating points
//  Q6 gauge covariance: a frame change at every dock (silver-rate grid moves, links and points carried) maps the LIKE
//     study's terms onto the gauged run's term for term, amplitude for amplitude, 48 beats, every start
//  Q7 interference beyond the dephased mixture: in the LIKE study the weight of the old rule's own history, read after
//     each of its first three meetings of the pair, differs from (1/4)^m at some reading, every start
// Verdict: pass if Q1 to Q7 hold; fail otherwise. Reported beside, never gated: the old column's 14 gates per start and,
// for each, the locked counterpart (carried, measured here, or none), the old whole's CHSH at the like meeting (its rung)
// and fear share, the locked fear share and mana per moving vibe, the added failures per start (E-MTH-0028).
//
// FIRST RUN (31 s, tmp/rlt099-run1.log): pass, no gate moved. Q1 unlike study found on 17, 0 splits, the old whole
// differs from fear-off on 17; Q2 17 of 17 (weights 0.75, 0.25, CHSH 2.6458); Q3 exact; Q4 3 occupations on 17; Q5
// 12 stabilizer states, 4 in the doublet, overlap 1/3 to 1e-15, lock weights exact, S_u identity to 5e-14, 40 violating
// = 40 negative points on 5 products; Q6 0 gauge mismatches on 17; Q7 the old history's term reads 1/4, 1/16, 7/256
// after its 1st, 2nd and 3rd meeting (dephased 1/64) on 17. Old column: CHSH 4/sqrt 3 on 13 starts and 2 on 4, fear
// share up to 0.32; the old quantum() battery passes 14 of 14 gates on 16 starts, 13 on integer+11 (storageGrower); no
// counterpart gate added a failure or gained one. Title written after the run.
//
// DETERMINISM: no random numbers; starts are E-MTH-0028's family; the gauge frames are silver-rate grid moves. The rule
// is exact in Z[w]; CHSH, Wigner weights and Schmidt weights are floats (measurement). Depth L2. Husk: these are role
// and register readings of two vibes, not husk transport; there is no husk number to put first.

import { experiment } from '@/test/scaffold/suite'
import { verdict } from '@/test/scaffold/verdict'
import { LINE_FIRSTS, OPPOSITE } from '@/code/rule/isometric-knit'
import { advanceWhole, physicalWhole, wholeLovesAndFears, type Whole } from '@/code/rule/fear-weave'
import { exactFearKernels } from '@/code/rule/fear-kernel-exact'
import { roleChsh, roleDensity } from '@/code/measure/role-bell'
import { quantum, type VaryingVacuum } from '@/code/measure/bounce-battery'
import { baseHub, storeOfKind } from '@/code/measure/dense-hub'
import { bounceRunner, makeBounceKernel } from '@/code/measure/bounce-pair-kernel'
import { hubVacuum } from '@/code/measure/causal-components'
import { lagrangians, phaseSpace, cosetLabels } from '@/code/measure/stabilizer-contexts'
import { startFamily, withStart } from '@/code/measure/start-ensemble'
import { lockedBeat, lockedBeatBack, lockedNorm, lockedState, lockedTables, newTally, norm, sameConfiguration, type Configuration, type LockedState } from '@/code/rule/doublet-locked-knit'
import { idRun, lockedFresh, lockStates, orderFourGrids, overlap, registerKnot, sameOccupation, samePoints, stabilizerStates, vacuumConfiguration, wignerOf, SILVER_RATE, type LockedFresh } from '@/code/measure/doublet-locked-readings'

const SIDE = 4
const BEATS = 48
const SEARCH = 12
const LINE_SECONDS = LINE_FIRSTS.map(f => OPPOSITE[f] as number)
const SQRT3 = Math.sqrt(3)
const LOCK_W = (1 - SQRT3) / 12
const FEAR_MASS = (SQRT3 - 1) / 3
const FEAR_SHARE = FEAR_MASS / (1 + 2 * FEAR_MASS)
const MANA = Math.log(1 + 2 * FEAR_MASS)
const UNION: VaryingVacuum = { key: 'union', collision: 'lone', store: (side, anchor) => storeOfKind('union', side, baseHub(side, anchor)) }

const basisWhole = (tokens: number[]): Whole => ({ tokens, weight: Array.from({ length: 81 }, (_, i) => (Math.floor(Math.floor(i / 9) / 3) === 0 && Math.floor((i % 9) / 3) === 0 ? 1n : 0n)) })

// the first meeting of two named vibes of the wanted kind within SEARCH beats
function findPair(f: LockedFresh, like: boolean): [number, number] | undefined {
  const all = new Map<number, [number, number]>()

  for (let line = 0; line < f.store.length; line++) if (f.store[line] !== 0) all.set(line, [2 * line, 2 * line + 1])

  const r = idRun(f.tables, f.weave, vacuumConfiguration(f, 'none'), all)

  for (let t = 0; t < SEARCH; t++) {
    const c = r.state()
    const ids = r.ids()

    for (let x = 0; x < f.cells; x++) {
      for (let l = 0; l < 12; l++) {
        const i = x * 24 + (LINE_FIRSTS[l] as number)
        const j = x * 24 + (LINE_SECONDS[l] as number)
        const vi = c.vibe[i] as number
        const vj = c.vibe[j] as number

        if (vi === 0 || vj === 0 || (ids[i] as number) < 0 || (ids[j] as number) < 0) continue
        if (like && vi === vj && c.point[i] !== c.point[j]) return [ids[i] as number, ids[j] as number]
        if (!like && vi !== vj) return [ids[i] as number, ids[j] as number]
      }
    }

    r.beat()
  }

  return undefined
}

const openStart = (f: LockedFresh, pick: readonly number[]): Configuration => {
  const s = vacuumConfiguration(f, 'none')

  for (const id of pick) s.sopen[id >> 1] = (s.sopen[id >> 1] as number) | (1 << (id & 1))

  return s
}

// the old whole on the two tokens along the old history: CHSH at the first meeting beat, the largest fear share, and
// the final whole with the fear beat on and off
function oldWhole(f: LockedFresh, pick: [number, number]): { chsh: number; share: number; differsFromOff: boolean; meetings: number } {
  const named = new Map<number, [number, number]>()

  for (const id of pick) {
    const line = id >> 1
    const prev = named.get(line) ?? [-1, -1]

    prev[id & 1] = id
    named.set(line, prev)
  }

  const run = idRun(f.tables, f.weave, vacuumConfiguration(f, 'none'), named)
  const on = exactFearKernels({ like: 1, unlike: 1, likeExchanged: false })
  const off = exactFearKernels({ like: 0, unlike: 0, likeExchanged: false })
  let a: Whole = basisWhole([...pick])
  let b: Whole = basisWhole([...pick])
  let chsh = 0
  let first = -1
  let share = 0
  let meetings = 0

  for (let t = 0; t < BEATS; t++) {
    const record = run.beat()

    a = advanceWhole({ weave: f.weave, whole: a, record, kernel4: [], color: on, fixed: false, forward: true }) as Whole
    b = advanceWhole({ weave: f.weave, whole: b, record, kernel4: [], color: off, fixed: false, forward: true }) as Whole
    meetings += record.meetings.length

    if (first < 0 && record.meetings.length > 0) {
      first = t
      chsh = roleChsh(roleDensity(physicalWhole(a)))
    }

    const { loves, fears } = wholeLovesAndFears(a)

    share = Math.max(share, Number(fears) / Number(loves + fears))
  }

  const pa = physicalWhole(a)
  const pb = physicalWhole(b)
  const ua = pa.weight.reduce((s, w) => s + w, 0n)
  const ub = pb.weight.reduce((s, w) => s + w, 0n)
  const differsFromOff = pa.weight.some((w, i) => w * ub !== (pb.weight[i] as bigint) * ua)

  return { chsh, share, differsFromOff, meetings }
}

type Study = {
  found: boolean
  splits: number
  branchesMax: number
  normExact: boolean
  reversed: boolean
  occupations: number
  knot?: { weights: number[]; chsh: number }
  chargeKept: boolean
  interference: { readings: string[]; differs: boolean }
  gauge: number
  old?: { chsh: number; share: number; differsFromOff: boolean; meetings: number }
}

function charge(c: Configuration): number {
  let q = 0

  for (const v of c.vibe) q += v

  return q
}

// a frame change: a grid move h per dock; links g on slot (x, d) become h_y g h_x^-1, points p -> h_x(p)
function gauged(f: LockedFresh): { tables: ReturnType<typeof lockedTables>; h: Int16Array } {
  const { moves } = f.weave
  const h = Int16Array.from({ length: f.cells }, (_, x) => (((x + 1) * SILVER_RATE) % 65536) % moves.act.length)
  const links = new Int16Array(f.cells * 24)

  for (let x = 0; x < f.cells; x++) {
    for (let d = 0; d < 24; d++) {
      const slot = x * 24 + d
      const y = ((f.tables.target[slot] as number) / 24) | 0
      const g = f.weave.links[slot] ?? moves.identity

      links[slot] = moves.compose(h[y] as number, moves.compose(g, moves.inverse[h[x] as number] as number))
    }
  }

  return { tables: lockedTables(f.weave, 'lone', links), h }
}

function runStudy(f: LockedFresh, like: boolean): Study {
  const pick = findPair(f, like)

  if (!pick) return { found: false, splits: 0, branchesMax: 0, normExact: false, reversed: false, occupations: 0, chargeKept: false, interference: { readings: [], differs: false }, gauge: -1 }

  const start = openStart(f, pick)
  const tally = newTally()
  const oldRun = bounceRunner(makeBounceKernel(f.weave, 'lone'), hubVacuum({ cells: f.cells, store: f.store, layout: f.layout }))
  const q0 = charge(start)
  const { tables: gt, h } = gauged(f)
  const act = f.weave.moves.act
  const gStart = openStart(f, pick)

  for (let line = 0; line < gStart.spoint.length; line++) gStart.spoint[line] = (act[h[(line / 12) | 0] as number] as Int8Array)[gStart.spoint[line] as number] as number

  let s: LockedState = lockedState(start)
  let g: LockedState = lockedState(gStart)
  let normExact = true
  let branchesMax = 1
  let knot: { weights: number[]; chsh: number } | undefined
  let chargeKept = true
  let keepMeetings = 0
  let gauge = 0
  const readings: string[] = []
  let differs = false

  let cumulative = 0

  for (let t = 0; t < BEATS; t++) {
    const before = tally.splitMeetings
    // the old history's term before this beat, and the unequal-point like meetings of the open pair on it
    const pre = oldRun.state()
    const twinPre = s.branches.find(b => samePoints(b, { ...b, vibe: pre.vibe, point: pre.point, store: pre.store, spoint: pre.spoint }))
    let onKeep = 0

    if (twinPre) {
      for (let x = 0; x < f.cells; x++) {
        for (let l = 0; l < 12; l++) {
          const i = x * 24 + (LINE_FIRSTS[l] as number)
          const j = x * 24 + (LINE_SECONDS[l] as number)

          if (twinPre.vibe[i] !== 0 && twinPre.vibe[i] === twinPre.vibe[j] && twinPre.open[i] && twinPre.open[j] && twinPre.point[i] !== twinPre.point[j]) onKeep++
        }
      }
    }

    s = lockedBeat(f.tables, s, t, tally)
    g = lockedBeat(gt, g, t)
    oldRun.beat()

    const n = lockedNorm(s)

    normExact = normExact && n.total === n.unit
    branchesMax = Math.max(branchesMax, s.branches.length)
    for (const b of s.branches) chargeKept = chargeKept && charge(b) === q0

    if (!knot && tally.splitMeetings > before) {
      const b0 = s.branches[0]!
      const open: number[] = []

      for (let i = 0; i < b0.open.length; i++) if (b0.open[i]) open.push(i)

      const k = open.length === 2 ? registerKnot(s, open[0]!, open[1]!) : undefined

      if (k) knot = { weights: k.weights, chsh: k.chsh }
    }

    // the old history's term: its weight after each of the first three meetings on it
    const oldState = oldRun.state()
    const twin = s.branches.find(b => samePoints(b, { ...b, vibe: oldState.vibe, point: oldState.point, store: oldState.store, spoint: oldState.spoint }))

    if (onKeep > 0 && keepMeetings < 3) {
      keepMeetings++
      cumulative += onKeep

      const w = twin ? norm(twin.a, twin.b) : 0n
      const k = twin ? twin.k : 0
      // weight w / 4^k against the dephased (1/4)^m, m the meetings on the old history so far: w 4^m against 4^k
      const coherent = w * (1n << BigInt(2 * cumulative))
      const dephased = 1n << BigInt(2 * k)

      readings.push(`beat ${t}, m ${cumulative}: ${twin ? `${w}/4^${k}` : 'absent'}`)
      if (!twin || coherent !== dephased) differs = true
    }

    // gauge: every term of the gauged run is the image of a term here
    const image = (b: Configuration): Configuration => {
      const c = { ...b, point: Int8Array.from(b.point), spoint: Int8Array.from(b.spoint) }

      for (let i = 0; i < c.point.length; i++) if (c.vibe[i] !== 0) c.point[i] = (act[h[(i / 24) | 0] as number] as Int8Array)[c.point[i] as number] as number
      for (let i = 0; i < c.spoint.length; i++) if (c.store[i] !== 0) c.spoint[i] = (act[h[(i / 12) | 0] as number] as Int8Array)[c.spoint[i] as number] as number

      return c
    }

    if (g.branches.length !== s.branches.length) gauge++
    else {
      for (const b of s.branches) {
        const im = image(b)
        const match = g.branches.find(o => sameConfiguration(o, im))

        if (!match || match.a !== b.a || match.b !== b.b || match.k !== b.k) gauge++
      }
    }
  }

  const occupations: Configuration[] = []

  for (const b of s.branches) if (!occupations.some(o => sameOccupation(o, b))) occupations.push(b)

  let back = s

  for (let t = BEATS - 1; t >= 0; t--) back = lockedBeatBack(f.tables, back, t)

  const b0 = back.branches[0]
  const reversed = back.branches.length === 1 && !!b0 && b0.a === 1n && b0.b === 0n && b0.k === 0 && samePoints(b0, start)

  return { found: true, splits: tally.splitMeetings, branchesMax, normExact, reversed, occupations: occupations.length, knot, chargeKept, interference: { readings, differs }, gauge, old: oldWhole(f, pick) }
}

// Q5: the role facts
function roleFacts(): { stabilizers: number; doublet: number; overlapWorst: number; lockW: boolean; leakWorst: number; identityWorst: number; violating: number[]; negative: number[] } {
  const { all, doublet } = stabilizerStates()
  let overlapWorst = 0

  for (let i = 0; i < doublet.length; i++) for (let j = i + 1; j < doublet.length; j++) overlapWorst = Math.max(overlapWorst, Math.abs(Math.hypot(...overlap(doublet[i]!, doublet[j]!)) ** 2 - 1 / 3))

  let lockW = true
  let leakWorst = 0
  const states: ReturnType<typeof wignerOf>[] = []

  for (const grid of orderFourGrids()) {
    const s = lockStates(grid)

    leakWorst = Math.max(leakWorst, s.leak)

    for (const v of [s.plus, s.minus]) {
      const w = wignerOf(v)
      const neg = w.filter(x => x < -1e-12)

      lockW = lockW && neg.length === 4 && neg.every(x => Math.abs(x - LOCK_W) < 1e-12)
      states.push(w)
    }
  }

  // S_u on products of two lock states: the two states of the first axis in every order, and one from a second axis
  const space = phaseSpace(2)
  const planes = lagrangians(space).map(p => cosetLabels(space, p))
  const pairs: [number[], number[]][] = [
    [states[0]!, states[0]!],
    [states[0]!, states[1]!],
    [states[1]!, states[0]!],
    [states[1]!, states[1]!],
    [states[0]!, states[2]!],
  ]
  let identityWorst = 0
  const violating: number[] = []
  const negative: number[] = []

  for (const [wa, wb] of pairs) {
    const w2 = Array.from({ length: 81 }, (_, i) => (wa[Math.floor(i / 9)] as number) * (wb[i % 9] as number))
    let v = 0
    let n = 0

    for (let u = 0; u < 81; u++) {
      let su = 0

      for (const label of planes) {
        const own = label[u]

        for (let x = 0; x < 81; x++) if (label[x] === own) su += w2[x] as number
      }

      identityWorst = Math.max(identityWorst, Math.abs(su - (36 * (w2[u] as number) + 4)))
      if (su < 4 - 1e-12) v++
      if ((w2[u] as number) < -1e-12) n++
    }

    violating.push(v)
    negative.push(n)
  }

  return { stabilizers: all.length, doublet: doublet.length, overlapWorst, lockW, leakWorst, identityWorst, violating, negative }
}

export default experiment({
  id: 'relativity/doublet-locked-quantum',
  code: 'E-RLT-0099',
  title:
    "the knit's quantum results under the doublet-locked rule, pass: a love and a fear meet as the identity (0 terms made on 17 of 17, where the old whole moves on 17), so the love-fear rungs are gone; a like meeting of two vacuum vibes makes a knot of exact weights 3/4 and 1/4 on orthogonal point registers, CHSH sqrt 7 on 17 of 17 where the old whole reads 4/sqrt 3 on 13 and 2 on 4, so the ladder collapses to {2, sqrt 7}; the terms hold 3 occupations (positions carry amplitude through the veto), interfere (the old history's weight 7/256 after three meetings against the dephased 1/64), keep norm, reversal, love minus fear and gauge covariance exactly; and every moving vibe holds a fixed fear, four Wigner weights (1 - sqrt 3)/12, share 0.164, mana 0.397, because the doublet's four stabilizer states are pairwise at overlap 1/3 and no lock puts a copy direction on one, so two moving vibes violate S_u >= 4 at 40 of 81 points with no meeting: magic and contextuality come with motion, not only with the fear beat",
  category: 'relativity',
  substrates: ['3434'],
  depth: 'L2',
  paper: false,
  run() {
    const started = Date.now()
    const log = (what: string): void => console.error(`${what} ${Math.round((Date.now() - started) / 1000)}s`)
    const facts = roleFacts()

    log('role facts')

    const family = startFamily(16)
    const perStart = family.map(member =>
      withStart(member, () => {
        const f = lockedFresh(SIDE)
        const like = runStudy(f, true)
        const unlike = runStudy(f, false)
        const old = quantum(UNION, 'on', SIDE)

        log(`start ${member.name}`)

        return { name: member.name, like, unlike, old }
      }),
    )

    const informative = perStart.some(p => p.unlike.old?.differsFromOff)
    const gQ1 = perStart.every(p => !p.unlike.found || (p.unlike.splits === 0 && p.unlike.branchesMax === 1)) && perStart.some(p => p.unlike.found) && informative
    const gQ2 = perStart.every(p => p.like.found && !!p.like.knot && p.like.knot.weights.length === 2 && Math.abs((p.like.knot.weights[0] ?? 0) - 0.75) < 1e-12 && Math.abs((p.like.knot.weights[1] ?? 0) - 0.25) < 1e-12 && Math.abs(p.like.knot.chsh - Math.sqrt(7)) < 1e-9)
    const gQ3 = perStart.every(p => [p.like, p.unlike].every(s => !s.found || (s.normExact && s.reversed)))
    const gQ4 = perStart.every(p => p.like.occupations > 1)
    const gQ5 = facts.stabilizers === 12 && facts.doublet === 4 && facts.overlapWorst < 1e-12 && facts.lockW && facts.leakWorst < 1e-12 && facts.identityWorst < 1e-12 && facts.violating.every((v, k) => v === facts.negative[k] && v === 40)
    const gQ6 = perStart.every(p => p.like.gauge === 0)
    const gQ7 = perStart.every(p => p.like.interference.differs)
    const status = gQ1 && gQ2 && gQ3 && gQ4 && gQ5 && gQ6 && gQ7 ? 'pass' : 'fail'

    // the old column's 14 gates and the locked counterparts
    const counterparts: Record<string, (p: (typeof perStart)[number]) => boolean | undefined> = {
      tokenSignsKept: p => p.old.gates.tokenSignsKept, // the classical layer, identical in the bookkeeping reading (E-RLT-0098 K1)
      knotsPure: p => p.like.normExact && p.unlike.normExact,
      fearShareUnderThird: () => FEAR_SHARE < 1 / 3 && (2 * FEAR_MASS * (1 + FEAR_MASS)) / (1 + 2 * FEAR_MASS) ** 2 < 1 / 3,
      fearsMade: () => facts.lockW,
      reversesInFixedUnits: p => p.like.reversed && p.unlike.reversed,
      loveMinusFearKept: p => p.like.chargeKept && p.unlike.chargeKept,
      frameCommutesVacuum: p => p.like.gauge === 0,
      frameCommutesMatter: () => undefined,
      storageVacuum: () => undefined,
      storageMatter: () => undefined,
      storageGrower: () => undefined,
      kernelsUnital: () => norm(1n, 1n) + norm(1n, -1n) === 4n,
      interferenceBeyondStandIn: p => p.like.interference.differs,
      chshAbove2: p => (p.like.knot?.chsh ?? 0) > 2 + 1e-6,
    }
    const added = perStart.map(p => Object.entries(counterparts).filter(([gate, f]) => p.old.gates[gate] === true && f(p) === false).map(([gate]) => gate))
    const gained = perStart.map(p => Object.entries(counterparts).filter(([gate, f]) => p.old.gates[gate] === false && f(p) === true).map(([gate]) => gate))
    const range = (xs: number[]): string => (Math.min(...xs) === Math.max(...xs) ? `${Math.min(...xs)}` : `${Math.min(...xs)} to ${Math.max(...xs)}`)
    const oldLikeChsh = perStart.map(p => p.like.old?.chsh ?? 0)
    const metrics: Record<string, number> = {
      gateQ1: gQ1 ? 1 : 0,
      gateQ2: perStart.filter(p => p.like.knot && Math.abs(p.like.knot.chsh - Math.sqrt(7)) < 1e-9).length,
      gateQ3: gQ3 ? 1 : 0,
      gateQ4: perStart.filter(p => p.like.occupations > 1).length,
      gateQ5: gQ5 ? 1 : 0,
      gateQ6: perStart.filter(p => p.like.gauge === 0).length,
      gateQ7: perStart.filter(p => p.like.interference.differs).length,
      starts: family.length,
      lockedLikeChshMin: Math.min(...perStart.map(p => p.like.knot?.chsh ?? 0)),
      oldLikeChshMin: Math.min(...oldLikeChsh),
      oldLikeChshMax: Math.max(...oldLikeChsh),
      oldLikeChshMiddleRung: oldLikeChsh.filter(c => Math.abs(c - 4 / SQRT3) < 1e-6).length,
      oldLikeChshTwo: oldLikeChsh.filter(c => Math.abs(c - 2) < 1e-6).length,
      lockedFearShare: FEAR_SHARE,
      lockedMana: MANA,
      lockW: LOCK_W,
      unlikeFound: perStart.filter(p => p.unlike.found).length,
      unlikeOldInformative: perStart.filter(p => p.unlike.old?.differsFromOff).length,
      likeSplitsMin: Math.min(...perStart.map(p => p.like.splits)),
      likeBranchesMax: Math.max(...perStart.map(p => p.like.branchesMax)),
      likeOccupationsMin: Math.min(...perStart.map(p => p.like.occupations)),
      addedFailuresMax: Math.max(...added.map(a => a.length)),
      gainedMax: Math.max(...gained.map(a => a.length)),
      oldGatesPassingMin: Math.min(...perStart.map(p => Object.values(p.old.gates).filter(Boolean).length)),
      oldGatesPassingMax: Math.max(...perStart.map(p => Object.values(p.old.gates).filter(Boolean).length)),
      seconds: (Date.now() - started) / 1000,
    }

    return verdict({
      status,
      claim: `under the lock a love and a fear meet as the identity (the unlike study makes no term on every start where it exists, while the old whole moves at those meetings on ${perStart.filter(p => p.unlike.old?.differsFromOff).length}); a like meeting makes a two-term knot of weights 3/4 and 1/4 and CHSH sqrt 7 on ${metrics.gateQ2} of ${family.length} starts, where the old whole reads ${range(oldLikeChsh.map(c => Math.round(c * 1e4) / 1e4))}; positions carry amplitude (${range(perStart.map(p => p.like.occupations))} occupations); every moving vibe holds fear share ${FEAR_SHARE.toFixed(4)} (mana ${MANA.toFixed(4)}) with no meeting, and two moving vibes violate S_u >= 4 at 40 of 81 points; the exact laws, reversal and gauge covariance hold`,
      metrics,
      control: {
        oldFearShareLikeMax: Math.max(...perStart.map(p => p.like.old?.share ?? 0)),
        oldFearShareUnlikeMax: Math.max(...perStart.map(p => p.unlike.old?.share ?? 0)),
        oldUnlikeMeetingsMax: Math.max(...perStart.map(p => p.unlike.old?.meetings ?? 0)),
        oldLikeMeetingsMax: Math.max(...perStart.map(p => p.like.old?.meetings ?? 0)),
      },
      notes: `L2. Gates: Q1 ${gQ1} (informative ${informative}), Q2 ${metrics.gateQ2} of ${family.length}, Q3 ${gQ3}, Q4 ${metrics.gateQ4} of ${family.length}, Q5 ${gQ5} (${JSON.stringify(facts)}), Q6 ${metrics.gateQ6} of ${family.length}, Q7 ${metrics.gateQ7} of ${family.length}. Lock weight (1 - sqrt 3)/12 = ${LOCK_W.toFixed(6)}, fear share (sqrt 3 - 1)/(1 + 2 sqrt 3) = ${FEAR_SHARE.toFixed(6)}, mana ln((1 + 2 sqrt 3)/3) = ${MANA.toFixed(6)}. Per start (like: splits, branches max, occupations, knot weights, CHSH, interference readings, gauge mismatches, old CHSH and fear share; unlike: found, splits, old differs from fear off; old quantum() gates passing; added and gained against the old column): ${perStart
        .map(
          (p, k) =>
            `${p.name} like ${p.like.splits}, ${p.like.branchesMax}, ${p.like.occupations}, ${JSON.stringify(p.like.knot?.weights.map(w => Math.round(w * 1e6) / 1e6))}, ${p.like.knot?.chsh.toFixed(4)}, [${p.like.interference.readings.join('; ')}], ${p.like.gauge}, old ${p.like.old?.chsh.toFixed(4)} ${p.like.old?.share.toFixed(4)}; unlike ${p.unlike.found}, ${p.unlike.splits}, ${p.unlike.old?.differsFromOff}; old gates ${Object.entries(p.old.gates)
              .filter(([, v]) => v)
              .map(([g]) => g)
              .join(',')}; added [${added[k]!.join(',')}] gained [${gained[k]!.join(',')}]`,
        )
        .join(' | ')}. Counterparts: tokenSignsKept carried (classical layer); knotsPure = exact norm; fearShareUnderThird = the static share per vibe and per pair; fearsMade = the static fear of motion; frameCommutesVacuum = Q6; frameCommutesMatter, storage x3 have no counterpart (the old whole's departure storage and matter pair are not built on the locked rule). ${((Date.now() - started) / 1000).toFixed(0)} s.`,
    })
  },
})
