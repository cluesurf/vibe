// DO A LONE VIBE'S POSITIONS INTERFERE ON THE WORKING RULE? (E-QTM-0157). The ledger holds "positions in superposition"
// partial because E-RLT-0105 read the lone love's keep term (the configuration of the all-keep history) at the dephased
// weight 1/4, 1/16, 1/64 and concluded the kept branch does not interfere. That reading sees merges into ONE
// configuration only, and the all-keep configuration is the light-cone edge, which exactly one history reaches, so it
// reads the dephased weight whatever the rule does. This file replaces the witness and asks again, and reads the
// Schrodinger row's object, the lone vibe's walk, off the rule itself rather than off the fear walk stand-in.
//
// THE RULE: the working rule as it stands, exact and superposed (code/rule/coined-locked-knit coinedVetoBeat, veto
// 'none', tables on the pass contact): the coin, the meetings, the no-veto store's collision under the pass, the stream.
// No path is read, so no path key enters (E-MTH-0029's full-period key concerns path records only).
//
// THE WITNESS (code/measure/dephased-twin): the same rule run with its phases dropped after every beat (the Markov chain
// of the rule's own one-beat Born weights). The L1 distance between the exact Born distribution and the twin's, read
// on the occupation (where the vibes are) and on the husk columns (loves, fears, stores per column), is exact
// (rationals over 4^K). Interference is a nonzero distance.
//
// WHAT IS PREDICTED, before this file's first run (from the probes below):
//  - in the empty box the lone vibe's walk on its line is the fear walk (the coin is the fear walk's (1 + w)/2, (1 - w)/2)
//    bit for bit, at every beat on trivial links and before the first wrap on every start's links; its symbol has trace
//    (1 + w)(z + 1/z) and determinant 4 w, so rest frequency pi/3, mass sqrt 3 and top speed 1/2 (E-CMP-0017's numbers)
//  - the witness sees the walk's interference (L1 0.5625 at beat 3); the old keep-term witness reads dephased there
//  - in the working vacuum with every vibe and stored pair on the love's own mesh line open, the love's positions
//    interfere (tmp/pos-probe4: L1 0.14 at beat 4, 0.69 at beat 6 on integer+0, side 4); with the coin off the occupation
//    is autonomous and the distance is exactly 0
//  - with the vacuum's vibes closed (E-RLT-0105's bookkeeping) on side 16 the positions interfere from about beat 9
//
// GATES, fixed before the first run:
//  E0 (calibration, trivial links: every link the identity, a device not in the start family, side 16, ring 16, the
//     empty box): the rule's lone love (center, slot 0) equals walkBeat(FEAR_COIN) on a ring of 16 bit for bit at every
//     beat 1..16 (one branch per occupied slot, Eisenstein numerators over 2^t equal), and the witness's occupation L1
//     equals the L1 between walkChances and chanceBeat(1, 3), computed independently in code/rule/fear-walk, exactly
//  E1 (every start's links, side 16, empty box): bit for bit with the walk at every beat 1..7 (before the right and left
//     movers can meet round the ring), on 17 of 17 starts
//  S1 (the symbol, read off one beat of the rule on the empty box from each slot of the line): 2U(z) has trace
//     coefficients exactly 1 + w at z and z^-1 and determinant exactly 4 w; from it W(0) = pi/3 within 1e-12, the mass
//     1/W''(0) within 1e-6 of sqrt 3, the largest |dW/dk| within 1e-6 of 1/2
//  O  (the old witness, on E0's run): the all-keep configuration's weight is exactly 1/4^t at t = 1, 2, 3 (the dephased
//     value E-RLT-0105 read) while the witness reads interference at t = 3 (L1 > 0): the old witness is blind there
//  per start of E-MTH-0028's 17, side 4, the working vacuum (E-RLT-0105's no-veto store under the pass), a lone love
//  at the center on slot 0, every vibe and stored pair on its mesh line open, every other line closed, 6 beats:
//  F  factorization: every branch equals the closed vacuum's run off the love's mesh line at every beat (0 trits), so
//     the other lines are a separate factor and closing them loses nothing on this line
//  N  the norm is exact at every beat
//  C1 control, the coin off (vetoBeat, the same open line): the occupation L1 is exactly 0 at every beat
//  Q1 the love's positions interfere: occupation L1 > 0 at some beat
//  Q1h the same read on the husk: husk-column L1 > 0 at some beat
//  and per start, side 16, 16 beats, the vacuum's vibes closed (E-RLT-0105's lone study bookkeeping):
//  Q2 occupation L1 > 0 at some beat
// Verdict: fail if any of E0, E1, S1, O, F, N, C1 fails (the instrument or the rule's identity); pass if those hold and
// Q1, Q1h, Q2 hold on 17 of 17; partial otherwise.
// Reported, never gated: the L1 trajectories, branch and occupation counts, the walk's spread exact against dephased
// (sigma^2 at beats 1..7 on E0), and on every start's links the L1 between the rule's occupation and the walk's
// chances at beat 16 (what the link holonomy round the ring changes after the wrap).
//
// PROBES before this file, disclosed: tmp/pos-probe1 (side 4: the empty box, trivial links, closed vacuum; found the
// merges E-RLT-0105's tally missed, since the coin's merge is made outside the tallied one), tmp/pos-probe2 (sides 8 and
// 16, empty and closed vacuum, occupation L1 and spread), tmp/pos-probe3 (every slot's line crosses one husk column a
// dock), tmp/pos-probe4 (the open line: side 8 grows 2, 24, 288 terms, beyond reach; side 4 to beat 6; off-line 0).
// The all-open vacuum is out of reach (478 unequal-point like meetings in one beat on side 4, over the rule's guard).
//
// FIRST RUN (3,021 s, tmp/pos-exp-run1.log): pass, no gate moved, title written after the run. E0, E1, S1, O, F, N, C1
// all hold; Q1, Q1h, Q2 on 17 of 17. The empty box's occupation L1 reads 0, 0, 0.5625, 0.7031 ... 1.3198 by beat 15;
// sigma^2 at beat 7 is 7.09 exact against 2.67 dephased (ballistic against diffusive). The open line: L1 0, 0, 0,
// 0.1406, 0.6529, 0.6943 on 14 starts, 0.7055 and 0.7142 on integer+11, 0.6885 at beat 6 on integer+13 to 15; the start
// enters only through the vacuum's like meetings (branches 1,325 to 2,286 at beat 6), and the closed-vacuum run is the
// same on every start (0.1406 at beat 9 to 0.3450 at beat 16), since there no piece reads a point. After the wrap the
// ring's link holonomy separates the rule from the walk by L1 0.3037 at beat 16 on 16 starts and 0 on integer+13,
// whose ring holonomy is trivial.
// OPEN: the other mesh lines are closed (their own like meetings are not superposed). By the line law (E-SPN-0098) and
// gate F they never touch this line, so opening them multiplies the state by a factor this line's reading does not
// see, but that argument, not a run, is what covers it. The all-open vacuum is out of reach (478 splits in one beat).
//
// DETERMINISM: no random number; starts are E-MTH-0028's family; the twin enumerates. The rule is exact in Z[w][1/2];
// floats appear only in the printed distances and in S1's reading of W(k) off the exact symbol. Depth L2: a coined
// quantum walk's interference (known physics), measured on the rule with a computed control. Husk: Q1h is read on
// husk columns; the line crosses one column a dock (tmp/pos-probe3). NOTHING MOVES.

import { experiment } from '@/test/scaffold/suite'
import { verdict } from '@/test/scaffold/verdict'
import { centerOf } from '@/code/measure/wall-reading'
import { startFamily, withStart } from '@/code/measure/start-ensemble'
import { boxHusk } from '@/code/measure/causal-components'
import { contactFresh } from '@/code/measure/occupation-veto-readings'
import { vacuumConfiguration } from '@/code/measure/doublet-locked-readings'
import { meshLines } from '@/code/measure/full-key-paths'
import { bornDistribution, coarsen, dephasedBeat, dephasedStart, l1Distance, OCCUPATION, type Distribution, type Grain } from '@/code/measure/dephased-twin'
import { toWords, vetoBeat } from '@/code/rule/occupation-veto-knit'
import { coinedVetoBeat } from '@/code/rule/coined-locked-knit'
import { LINE_FIRSTS, OPPOSITE } from '@/code/rule/isometric-knit'
import { lockedNorm, lockedState, lockedTables, type Configuration, type LockedState, type LockedTables } from '@/code/rule/doublet-locked-knit'
import { chanceBeat, FEAR_COIN, norm as walkNorm, walkBeat, walkStart, type ChanceState, type Eisenstein, type WalkState } from '@/code/rule/fear-walk'

const E_SIDE = 16
const E_BEATS = 16
const E1_BEATS = 7
const V_SIDE = 4
const V_BEATS = 6
const C_SIDE = 16
const C_BEATS = 16
const SLOT = 0
const BACK = OPPOSITE[SLOT] as number

type Fresh = ReturnType<typeof contactFresh>

// the love's line: dock -> cell on a ring (steps from the center along slot 0), and the ring's length
function lineCells(f: Fresh, center: number): { cell: Map<number, number>; ring: number } {
  const cell = new Map<number, number>()
  let x = center
  let n = 0

  do {
    cell.set(x, n)
    x = f.weave.mesh.neighbour(x, SLOT)
    n++
  } while (x !== center && n < 1024)

  return { cell, ring: n }
}

const emptyLove = (f: Fresh, center: number): Configuration => {
  const c = toWords(vacuumConfiguration({ cells: f.cells, store: new Int8Array(f.store.length), layout: f.layout }, 'none'))

  c.vibe[center * 24 + SLOT] = 1
  c.open[center * 24 + SLOT] = 1

  return c
}

// the rule's state against the walk, bit for bit: one branch per occupied slot, numerators over 2^t equal
function matchesWalk(s: LockedState, walk: WalkState, line: { cell: Map<number, number> }, t: number): boolean {
  const seen = new Set<string>()

  for (const b of s.branches) {
    let slot = -1

    for (let i = 0; i < b.vibe.length; i++) {
      if (b.vibe[i] === 0) continue
      if (slot >= 0) return false
      slot = i
    }

    const d = slot % 24
    const cell = line.cell.get(Math.floor(slot / 24))

    if (cell === undefined || (d !== SLOT && d !== BACK)) return false

    const w = (d === SLOT ? walk.right : walk.left)[cell] as Eisenstein
    const scale = 1n << BigInt(t - b.k)
    const id = `${cell}:${d}`

    if (b.k > t || seen.has(id) || b.a * scale !== w[0] || b.b * scale !== w[1]) return false
    seen.add(id)
  }

  const nonzero = [...walk.right, ...walk.left].filter(w => w[0] !== 0n || w[1] !== 0n).length

  return nonzero === seen.size
}

// the L1 between the walk's chances and the dephased walk's (chanceBeat keep 1, reverse 3), over 4^t
function walkL1(walk: WalkState, chance: ChanceState): bigint {
  let sum = 0n

  walk.right.forEach((w, x) => {
    const a = walkNorm(w) - (chance.right[x] as bigint)
    const b = walkNorm(walk.left[x] as Eisenstein) - (chance.left[x] as bigint)

    sum += (a < 0n ? -a : a) + (b < 0n ? -b : b)
  })

  return sum
}

// the rule's occupation distribution against the walk's chances at beat t (the lone vibe on its line)
function ruleVersusWalk(d: Distribution, walk: WalkState, line: { cell: Map<number, number> }, t: number): number {
  const chances = new Map<string, bigint>()

  walk.right.forEach((w, x) => chances.set(`${x}:${SLOT}`, walkNorm(w)))
  walk.left.forEach((w, x) => chances.set(`${x}:${BACK}`, walkNorm(w)))

  const rule = new Map<string, bigint>()

  for (const w of d.values()) {
    const slot = w.c.vibe.findIndex(v => v !== 0)
    const id = `${line.cell.get(Math.floor(slot / 24))}:${slot % 24}`

    rule.set(id, (rule.get(id) ?? 0n) + w.p * (1n << BigInt(2 * (t - w.k))))
  }

  let sum = 0n

  for (const id of new Set([...chances.keys(), ...rule.keys()])) {
    const x = (rule.get(id) ?? 0n) - (chances.get(id) ?? 0n)

    sum += x < 0n ? -x : x
  }

  return Number(sum) / 4 ** t
}

// ---- S1: the symbol off one beat of the rule ----
type Ez = [bigint, bigint]
const mulE = (x: Ez, y: Ez): Ez => [x[0] * y[0] - x[1] * y[1], x[0] * y[1] + x[1] * y[0] - x[1] * y[1]]

function readSymbol(f: Fresh, tables: LockedTables, center: number, line: { cell: Map<number, number>; ring: number }): { rr: Ez; rl: Ez; ll: Ez; lr: Ez; ok: boolean } {
  const one = (fromSlot: number): Map<string, Ez> => {
    const c = emptyLove(f, center)

    c.vibe[center * 24 + SLOT] = 0
    c.open[center * 24 + SLOT] = 0
    c.vibe[center * 24 + fromSlot] = 1
    c.open[center * 24 + fromSlot] = 1

    const out = new Map<string, Ez>()

    for (const b of coinedVetoBeat('none', tables, lockedState(c), 0).branches) {
      const slot = b.vibe.findIndex(v => v !== 0)
      const cell = line.cell.get(Math.floor(slot / 24)) as number
      const step = cell > line.ring / 2 ? cell - line.ring : cell
      const scale = 1n << BigInt(1 - b.k)

      out.set(`${step}:${slot % 24}`, [b.a * scale, b.b * scale])
    }

    return out
  }

  const fromRight = one(SLOT)
  const fromLeft = one(BACK)
  const zero: Ez = [0n, 0n]
  const rr = fromRight.get(`1:${SLOT}`) ?? zero
  const rl = fromRight.get(`-1:${BACK}`) ?? zero
  const ll = fromLeft.get(`-1:${BACK}`) ?? zero
  const lr = fromLeft.get(`1:${SLOT}`) ?? zero

  return { rr, rl, ll, lr, ok: fromRight.size === 2 && fromLeft.size === 2 }
}

// W(k) from the exact symbol: U(k) = M(e^(ik)) / 2, eigenvalues e^(i pi/3) e^(+-iW); returns W and the imaginary residue
function wOf(sym: { rr: Ez; ll: Ez }, k: number): { w: number; residue: number } {
  // an Eisenstein integer x + y w as a complex number, w = e^(2 pi i/3)
  const cx = (e: Ez): [number, number] => [Number(e[0]) - Number(e[1]) / 2, (Number(e[1]) * Math.sqrt(3)) / 2]
  const [ar, ai] = cx(sym.rr)
  const [br, bi] = cx(sym.ll)
  // tr U = (rr e^(-ik) + ll e^(ik)) / 2: the right mover lands one cell on, a factor e^(-ik) on its Fourier mode
  const tr: [number, number] = [(ar * Math.cos(k) + ai * Math.sin(k) + br * Math.cos(k) - bi * Math.sin(k)) / 2, (ai * Math.cos(k) - ar * Math.sin(k) + bi * Math.cos(k) + br * Math.sin(k)) / 2]
  // cos W = tr U / (2 e^(i pi/3))
  const c = Math.cos(Math.PI / 3)
  const s = Math.sin(Math.PI / 3)
  const re = (tr[0] * c + tr[1] * s) / 2
  const im = (tr[1] * c - tr[0] * s) / 2

  return { w: Math.acos(Math.max(-1, Math.min(1, re))), residue: Math.abs(im) }
}

// ---- the vacuum runs ----
type VacuumReading = { l1: number[]; husk: number[]; branches: number[]; occupations: number[]; offLine: number; normExact: boolean; controlL1: number[]; controlFull: number[] }

function vacuumRun(): VacuumReading {
  const f = contactFresh(V_SIDE, 'pass')
  const center = centerOf(V_SIDE)
  const lines = meshLines(f.tables)
  const own = lines.lineOf[center * 24 + SLOT] as number
  const onOwn = (s: number): boolean => lines.lineOf[Math.floor(s / 12) * 24 + (LINE_FIRSTS[s % 12] as number)] === own
  const husk: Grain = { kind: 'husk', column: boxHusk(f.weave.mesh, V_SIDE).column }
  const closed = toWords(vacuumConfiguration(f, 'none'))
  const start = toWords(vacuumConfiguration(f, 'none'))

  for (let i = 0; i < start.vibe.length; i++) if (lines.lineOf[i] === own && start.vibe[i] !== 0) start.open[i] = 1
  for (let s = 0; s < start.store.length; s++) if (onOwn(s)) start.sopen[s] = 3

  start.vibe[center * 24 + SLOT] = 1
  start.open[center * 24 + SLOT] = 1

  const coined = (s: LockedState, t: number): LockedState => coinedVetoBeat('none', f.tables, s, t)
  const bare = (s: LockedState, t: number): LockedState => vetoBeat('none', f.tables, s, t)
  let s = lockedState(start)
  let twin = dephasedStart(start)
  let c = lockedState(start)
  let cTwin = dephasedStart(start)
  let v = lockedState(closed)
  const out: VacuumReading = { l1: [], husk: [], branches: [], occupations: [], offLine: 0, normExact: true, controlL1: [], controlFull: [] }

  for (let t = 0; t < V_BEATS; t++) {
    s = coined(s, t)
    twin = dephasedBeat(twin, x => coined(x, t))
    c = bare(c, t)
    cTwin = dephasedBeat(cTwin, x => bare(x, t))
    v = coined(v, t)

    const ref = v.branches[0] as Configuration

    for (const b of s.branches) {
      for (let i = 0; i < b.vibe.length; i++) if (lines.lineOf[i] !== own && b.vibe[i] !== ref.vibe[i]) out.offLine++
      for (let q = 0; q < b.store.length; q++) if (!onOwn(q) && b.store[q] !== ref.store[q]) out.offLine++
    }

    const n = lockedNorm(s)
    const exact = bornDistribution(s)
    const cExact = bornDistribution(c)

    out.normExact &&= n.total === n.unit && v.branches.length === 1
    out.l1.push(l1Distance(coarsen(exact, OCCUPATION), coarsen(twin, OCCUPATION)).value)
    out.husk.push(l1Distance(coarsen(exact, husk), coarsen(twin, husk)).value)
    out.branches.push(s.branches.length)
    out.occupations.push(coarsen(exact, OCCUPATION).size)
    out.controlL1.push(l1Distance(coarsen(cExact, OCCUPATION), coarsen(cTwin, OCCUPATION)).value)
    out.controlFull.push(l1Distance(cExact, cTwin).value)
  }

  return out
}

function closedRun(): number[] {
  const f = contactFresh(C_SIDE, 'pass')
  const center = centerOf(C_SIDE)
  const start = toWords(vacuumConfiguration(f, 'none'))

  start.vibe[center * 24 + SLOT] = 1
  start.open[center * 24 + SLOT] = 1

  const coined = (s: LockedState, t: number): LockedState => coinedVetoBeat('none', f.tables, s, t)
  let s = lockedState(start)
  let twin = dephasedStart(start)
  const l1: number[] = []

  for (let t = 0; t < C_BEATS; t++) {
    s = coined(s, t)
    twin = dephasedBeat(twin, x => coined(x, t))
    l1.push(l1Distance(coarsen(bornDistribution(s), OCCUPATION), coarsen(twin, OCCUPATION)).value)
  }

  return l1
}

// the empty box on the member's links: bit for bit before the wrap, and the holonomy's effect at the last beat
function emptyRun(): { bitForBit: boolean; afterWrap: number } {
  const f = contactFresh(E_SIDE, 'pass')
  const center = centerOf(E_SIDE)
  const line = lineCells(f, center)
  let s = lockedState(emptyLove(f, center))
  let walk = walkStart(line.ring, 0, true)
  let bitForBit = true

  for (let t = 1; t <= E_BEATS; t++) {
    s = coinedVetoBeat('none', f.tables, s, t - 1)
    walk = walkBeat(walk, () => FEAR_COIN)
    if (t <= E1_BEATS) bitForBit &&= matchesWalk(s, walk, line, t)
  }

  return { bitForBit, afterWrap: ruleVersusWalk(coarsen(bornDistribution(s), OCCUPATION), walk, line, E_BEATS) }
}

export default experiment({
  id: 'quantum/position-interference',
  code: 'E-QTM-0157',
  title:
    "a lone vibe's positions interfere on the working rule, pass: its walk on its line is the fear walk bit for bit (trivial links every beat to 16, every start's links to beat 7, 17 of 17; symbol trace (1 + w)(z + 1/z), det 4 w, mass sqrt 3, top speed 1/2), and a dephased twin of the rule (its own Born weights added as chances every beat) reads interference E-RLT-0105's keep-term witness cannot see (occupation L1 up to 1.32 in the empty box, where the keep term reads the dephased 1/4, 1/16, 1/64); in the working vacuum with the love's mesh line open the positions interfere on 17 of 17 starts (occupation L1 0.69 to 0.71 by beat 6, husk columns 0.60), the state factorizes off the line (0 trits) and the coin-off control reads exactly 0; with the vacuum closed, side 16, 17 of 17 from beat 9 (L1 0.345 at beat 16)",
  category: 'quantum',
  substrates: ['3434'],
  depth: 'L2',
  paper: false,
  run() {
    const started = Date.now()
    const log = (what: string): void => console.error(`${what} ${Math.round((Date.now() - started) / 1000)}s`)
    const family = startFamily(16)

    // ---- E0, S1, O: trivial links, the empty box (start-independent) ----
    const calibration = withStart(family[0]!, () => {
      const f = contactFresh(E_SIDE, 'pass')
      const center = centerOf(E_SIDE)
      const line = lineCells(f, center)
      const tables = lockedTables(f.weave, 'pass', new Int16Array(f.cells * 24).fill(f.weave.moves.identity))
      const beat = (x: LockedState, t: number): LockedState => coinedVetoBeat('none', tables, x, t)
      const start = emptyLove(f, center)
      let s = lockedState(start)
      let twin = dephasedStart(start)
      let walk = walkStart(line.ring, 0, true)
      let chance: ChanceState = { right: walk.right.map((_, x) => (x === 0 ? 1n : 0n)), left: walk.left.map(() => 0n) }
      let bitForBit = true
      let witnessAgrees = true
      const l1: number[] = []
      const spread: string[] = []
      const keepWeights: string[] = []
      let oldBlind = true

      for (let t = 1; t <= E_BEATS; t++) {
        s = beat(s, t - 1)
        twin = dephasedBeat(twin, x => beat(x, t - 1))
        walk = walkBeat(walk, () => FEAR_COIN)
        chance = chanceBeat(chance, 1n, 3n)
        bitForBit &&= matchesWalk(s, walk, line, t)

        const d = l1Distance(coarsen(bornDistribution(s), OCCUPATION), coarsen(twin, OCCUPATION))
        const w = walkL1(walk, chance)

        witnessAgrees &&= d.numerator * (1n << BigInt(2 * t)) === w * d.unit
        l1.push(d.value)

        if (t <= E1_BEATS) {
          const moments = (p: (x: number, right: boolean) => number): number => walk.right.reduce((m, _, x) => m + p(x, true) + p(x, false), 0)
          const pos = (x: number): number => (x > line.ring / 2 ? x - line.ring : x)
          const exact = (x: number, right: boolean): number => Number(walkNorm((right ? walk.right : walk.left)[x] as Eisenstein)) / 4 ** t
          const deph = (x: number, right: boolean): number => Number((right ? chance.right : chance.left)[x] as bigint) / 4 ** t
          const variance = (p: (x: number, right: boolean) => number): number => moments((x, r) => p(x, r) * pos(x) ** 2) - moments((x, r) => p(x, r) * pos(x)) ** 2

          spread.push(`t ${t}: ${variance(exact).toFixed(4)} against ${variance(deph).toFixed(4)}`)
        }

        if (t <= 3) {
          // E-RLT-0105's keep term: the all-keep configuration, the love t cells on, still on slot 0
          const edge = s.branches.find(b => {
            const at = b.vibe.findIndex(v => v !== 0)

            return line.cell.get(Math.floor(at / 24)) === t && at % 24 === SLOT
          })
          const weight = edge ? (edge.a * edge.a - edge.a * edge.b + edge.b * edge.b) * (1n << BigInt(2 * (t - edge.k))) : -1n

          keepWeights.push(`t ${t}: ${weight}/4^${t}`)
          oldBlind &&= weight === 1n
        }
      }

      oldBlind &&= (l1[2] ?? 0) > 0

      // S1 on the same trivial tables
      const sym = readSymbol(f, tables, center, line)
      const trace = sym.rr[0] === 1n && sym.rr[1] === 1n && sym.ll[0] === 1n && sym.ll[1] === 1n
      const det = mulE(sym.rr, sym.ll)
      const cross = mulE(sym.lr, sym.rl)
      const detExact = det[0] - cross[0] === 0n && det[1] - cross[1] === 4n
      const h = 1e-4
      const w0 = wOf(sym, 0)
      const mass = (h * h) / (wOf(sym, h).w - 2 * w0.w + wOf(sym, -h).w)
      let vmax = 0
      let residue = w0.residue

      for (let j = 1; j < 20000; j++) {
        const k = (Math.PI * j) / 20000
        const g = (wOf(sym, k + 1e-6).w - wOf(sym, k - 1e-6).w) / 2e-6

        vmax = Math.max(vmax, Math.abs(g))
        residue = Math.max(residue, wOf(sym, k).residue)
      }

      const symbolOk = sym.ok && trace && detExact && Math.abs(w0.w - Math.PI / 3) < 1e-12 && Math.abs(mass - Math.sqrt(3)) < 1e-6 && Math.abs(vmax - 0.5) < 1e-6 && residue < 1e-12

      return { bitForBit, witnessAgrees, l1, spread, keepWeights, oldBlind, symbolOk, sym, w0: w0.w, mass, vmax, residue, ring: line.ring }
    })

    log('E0 S1 O')

    const perStart = family.map(member =>
      withStart(member, () => {
        const empty = emptyRun()
        const vacuum = vacuumRun()
        const closed = closedRun()

        log(`start ${member.name}`)

        return { name: member.name, empty, vacuum, closed }
      }),
    )

    type P = (typeof perStart)[number]
    const count = (test: (p: P) => boolean): number => perStart.filter(test).length
    const all = (test: (p: P) => boolean): boolean => count(test) === family.length
    const g = {
      E0: calibration.bitForBit && calibration.witnessAgrees,
      E1: all(p => p.empty.bitForBit),
      S1: calibration.symbolOk,
      O: calibration.oldBlind,
      F: all(p => p.vacuum.offLine === 0),
      N: all(p => p.vacuum.normExact),
      C1: all(p => p.vacuum.controlL1.every(x => x === 0)),
    }
    const q = {
      Q1: count(p => p.vacuum.l1.some(x => x > 0)),
      Q1h: count(p => p.vacuum.husk.some(x => x > 0)),
      Q2: count(p => p.closed.some(x => x > 0)),
    }
    const instrument = Object.values(g).every(Boolean)
    const answered = Object.values(q).every(n => n === family.length)
    const status = !instrument ? 'fail' : answered ? 'pass' : 'partial'
    const range = (xs: number[]): string => (Math.min(...xs) === Math.max(...xs) ? `${xs[0]}` : `${Math.min(...xs)} to ${Math.max(...xs)}`)
    const r4 = (x: number): number => Math.round(x * 1e4) / 1e4
    const metrics: Record<string, number> = { starts: family.length, ring: calibration.ring }

    for (const [k, v] of Object.entries(g)) metrics[`gate_${k}`] = v ? 1 : 0
    for (const [k, v] of Object.entries(q)) metrics[k] = v

    metrics.emptyL1Max = Math.max(...calibration.l1)
    metrics.symbolMass = calibration.mass
    metrics.symbolTopSpeed = calibration.vmax
    metrics.vacuumL1MaxMin = Math.min(...perStart.map(p => Math.max(...p.vacuum.l1)))
    metrics.vacuumL1MaxMax = Math.max(...perStart.map(p => Math.max(...p.vacuum.l1)))
    metrics.vacuumHuskL1MaxMin = Math.min(...perStart.map(p => Math.max(...p.vacuum.husk)))
    metrics.vacuumFirstBeatMax = Math.max(...perStart.map(p => p.vacuum.l1.findIndex(x => x > 0) + 1))
    metrics.closedL1MaxMin = Math.min(...perStart.map(p => Math.max(...p.closed)))
    metrics.closedFirstBeatMax = Math.max(...perStart.map(p => p.closed.findIndex(x => x > 0) + 1))
    metrics.afterWrapMax = Math.max(...perStart.map(p => p.empty.afterWrap))
    metrics.controlFullMax = Math.max(...perStart.map(p => Math.max(...p.vacuum.controlFull)))
    metrics.seconds = (Date.now() - started) / 1000

    return verdict({
      status,
      claim: `the working rule's lone vibe is the fear walk on its line bit for bit (trivial links every beat to 16: ${calibration.bitForBit}; every start's links to beat 7: ${count(p => p.empty.bitForBit)} of ${family.length}), symbol trace (1 + w)(z + 1/z), det 4 w, mass ${calibration.mass.toFixed(7)}, top speed ${calibration.vmax.toFixed(7)}; the dephased-twin witness agrees with the walk's own exactly (${calibration.witnessAgrees}) and sees interference up to L1 ${r4(metrics.emptyL1Max as number)}, where E-RLT-0105's keep term reads the dephased ${calibration.keepWeights.join(', ')}; in the working vacuum with the love's line open, factorized ${count(p => p.vacuum.offLine === 0)}, exact ${count(p => p.vacuum.normExact)}, coin-off occupation L1 0 on ${count(p => p.vacuum.controlL1.every(x => x === 0))}, positions interfere on ${q.Q1} (husk ${q.Q1h}) of ${family.length}, L1 up to ${range(perStart.map(p => r4(Math.max(...p.vacuum.l1))))}; with the vacuum closed (side 16) on ${q.Q2} of ${family.length}`,
      metrics,
      control: { coinOffOccupationL1Max: Math.max(...perStart.map(p => Math.max(...p.vacuum.controlL1))), dephasedTwinSelf: 0 },
      notes: `L2. Gates ${Object.entries(g)
        .map(([k, v]) => `${k} ${v}`)
        .join(', ')}; ${Object.entries(q)
        .map(([k, v]) => `${k} ${v}`)
        .join(', ')}. Empty box, trivial links, occupation L1 by beat: ${calibration.l1.map(r4).join(' ')}. Spread (sigma^2, exact against dephased): ${calibration.spread.join('; ')}. Symbol: rr ${calibration.sym.rr}, ll ${calibration.sym.ll}, lr ${calibration.sym.lr}, rl ${calibration.sym.rl}, W(0) ${calibration.w0}, imaginary residue ${calibration.residue.toExponential(2)}. Per start (vacuum open line: L1 occupation by beat | husk | branches | occupations | coin-off full L1; closed side 16 L1 by beat; empty-box rule against walk at beat ${E_BEATS}): ${perStart
        .map(
          p =>
            `${p.name} [${p.vacuum.l1.map(r4).join(' ')}] [${p.vacuum.husk.map(r4).join(' ')}] [${p.vacuum.branches.join(' ')}] [${p.vacuum.occupations.join(' ')}] [${p.vacuum.controlFull.map(r4).join(' ')}]; [${p.closed.map(r4).join(' ')}]; ${r4(p.empty.afterWrap)}`,
        )
        .join(' | ')}. ${((Date.now() - started) / 1000).toFixed(0)} s.`,
    })
  },
})
