// THE PARITY SECTOR WITH STORES (item vibe-roadmap-grounding-0034). E-SLF-0192 (item 0032) found the working rule keeps
// every pairwise separation's parity on the {3,4,3,4} honeycomb for loves with no store, so the any-neighbour lock
// never opens on an all-even self (B1's cut exactly bare). Its stated limit: a store that holds a vibe still for a beat
// would break the parity. This experiment tests that limit.
//
// FROM THE CODE. The one piece that holds a vibe in place is the pair move's store: a love and a fear on the two slots
// of one line are unmade into the dock's line store, and made again when the line's slots are empty. The stream moves
// every slot vibe, open or closed, one facet, and never the store. With the collision order alternating (P then K on
// even beats, K then P on odd), a pair unmade at beat t is made at beat t + 1, so it rests exactly one stream. Every
// piece keeps each vibe's value, so a start with no fear can never store.
//
// GATES, fixed in the item's what before this file existed (gate abb395a395e1, 2026-11-17T10:49:58Z). S0 term by term:
// the dock-local pieces keep each dock's held count, the stream moves each slot vibe to the other colour and leaves the
// stores, and Q_(t+1) = Q_t + 2 (s_other - s_same). S1 the sector (out_strict, out_rel) and the rest weight on seven
// starts, both rules. S2 the lock against bare. Instruments I0 to I3.
//
// PREDICTION (before the first run): every instrument holds, S0 all 0; out_rel 0 on CUT_EVEN, DENSE, X1, EVEN2, PAIR;
// PAIR out_strict 1 at t 1 and 2; STORE out_rel 1 at t 1 and 2, rest 1 at beat 0; MEET bare out_rel at t 2 in
// (0, 1/16]; STORE's lock opens at t 1 and differs at t 2; the loves-only starts exactly bare; verdict partial.
//
// FULL RUN (M3, 2026-11-17, clone store-parity-full2, 148 s, gate abb395a395e1): PARTIAL, every prediction held (11 of
// 11). S0: 0 dock-local piece violations, 0 same-colour stream targets of 212,568 interior slots, 0 stores moved by a
// stream, 0 identity violations, 0 stores on the no-fear starts. S1: out_rel 0 on CUT_EVEN, DENSE, X1, EVEN2 and PAIR
// (PAIR's whole state shifts, out_strict 1 at t 1 to 3, and its pair meets again and rests a second time with 9/16);
// STORE out_rel 1 at t 1 and 2, both rules; MEET bare out_rel 1/16 at t 2 and 0.1328 at t 3 (locked 0.0352, 0.0557).
// S2: STORE's lock opens on 1/4 at t 1 and 0.8125 at t 2, |dpsi|^2 1/8 at t 2; the five no-store starts exactly bare.
// An earlier full run ran out of the default 4 GB heap on MEET's locked t 3 (733,260 branches); the lock then beat now
// runs one branch at a time (storeLockBeat) on a 32 GB heap, checked equal to the whole-state path.
//
// SETTINGS. Default SMOKE (box 8, the R = 3 ball; seconds; open by rule). STORE_SWEEP=full for the M3 (box 12, the
// R = 4 ball).
//
// Depth L2: every run exact in Z[w][1/2] per start configuration; the summed reads in floats.

import { experiment } from '@/test/scaffold/suite'
import { verdict } from '@/test/scaffold/verdict'
import { lineBasis, lineLightest, wholeBasis } from '@/code/measure/coined-line-bloch'
import { levelPlacement } from '@/code/measure/held-cluster'
import { D0, cutLevel, cutOnBall, findEnv, lineDocks, type Ball, type BallStart } from '@/code/measure/self-reader-ball'
import { branchLock, colouring, hasOddPair } from '@/code/measure/parity-sector'
import {
  amplitudeOf,
  ballDistance,
  exactBranchNorm,
  hasStore,
  keyedBranches,
  keyedDiffer,
  newStoreChecks,
  openedFrames,
  sectorOfBranch,
  storeBeat,
  storeLockAll,
  storeLockBeat,
  weightOf,
  type StoreChecks,
} from '@/code/measure/store-parity'
import { lockedFresh } from '@/code/measure/doublet-locked-readings'
import { exactBallMesh } from '@/code/substrate/coxeter/exact-ball-mesh'
import { lockedState, lockedTables, mergeBranches, type Configuration } from '@/code/rule/doublet-locked-knit'
import { coinedVetoBeat, currentCoinPlace, setCoinPlace } from '@/code/rule/coined-locked-knit'
import {
  sparseBranchOf,
  sparseFromDense,
  sparseKey,
  sparseVetoBeat,
  type SparseBranch,
} from '@/code/rule/sparse-locked-knit'
import { LINE_FIRSTS, OPPOSITE } from '@/code/rule/isometric-knit'

const D0_BACK = OPPOSITE[D0]!
const MIN_SEEN = 1e-3
const ONE = 1 - 1e-12
// the largest locked state the whole-state lock path is also run on (I1's check of the branch-at-a-time path)
const LOCK_CHECK_MAX = 2000

type Setting = { name: 'smoke' | 'full'; box: number; radius: number }

const SMOKE: Setting = { name: 'smoke', box: 8, radius: 3 }
const FULL: Setting = { name: 'full', box: 12, radius: 4 }

const e17 = (x: number): string => x.toExponential(17)

// one vibe of a start: slot, value, open
type Held = { slot: number; value: number; open: number }

type Part = { held: Held[]; re: number; im: number }

type Start = { name: string; parts: Part[]; beats: number; fear: boolean }

function ballWith(radius: number): { ball: Ball; table: Int32Array; gates: boolean } {
  const m = exactBallMesh({ radius })
  const f = lockedFresh({ mesh: m.mesh, store: new Int8Array(m.cells * 12) })
  const tables = lockedTables(f.weave, 'pass', new Int16Array(m.cells * 24).fill(f.weave.moves.identity))

  return {
    ball: { radius, cells: m.cells, tables, nb: (x, d) => m.mesh.neighbour(x, d) },
    table: m.ball.table,
    gates: Object.values(m.gates).every(Boolean),
  }
}

const love = (slot: number, open = 1): Held => ({ slot, value: 1, open })
const fear = (slot: number): Held => ({ slot, value: -1, open: 1 })

// the hand starts on the line l through dock 0 along D0; beats R - r0
function handStarts(ball: Ball, R: number): Start[] {
  const { dockAt } = lineDocks(ball, D0)
  const at = (p: number, d: number): number => dockAt.get(p)! * 24 + d
  const env = findEnv()
  const one = (name: string, held: Held[], r0: number): Start => ({
    name,
    parts: [{ held, re: 1, im: 0 }],
    beats: R - r0,
    fear: held.some(h => h.value < 0),
  })

  return [
    one('DENSE', [D0, env.single, LINE_FIRSTS[env.full]!, OPPOSITE[LINE_FIRSTS[env.full]!]!].map(s => love(s)), 0),
    one('X1', [love(0), love(1, 0), love(4, 0), love(16, 0)], 0),
    one('PAIR', [love(at(0, D0)), fear(at(0, D0_BACK))], 0),
    one('STORE', [love(at(0, D0)), fear(at(0, D0_BACK)), love(at(2, D0_BACK))], 2),
    one('EVEN2', [love(at(0, D0)), love(at(0, D0_BACK)), love(at(2, D0_BACK))], 2),
    one('MEET', [love(at(-1, D0)), fear(at(1, D0_BACK)), love(at(0, LINE_FIRSTS[1]!))], 1),
  ]
}

const branchOf = (held: readonly Held[]): SparseBranch =>
  sparseBranchOf(
    held.map(h => ({ slot: h.slot, vibe: h.value, point: 0, open: h.open })),
    [],
  )

function configuration(cells: number, held: readonly Held[]): Configuration {
  const c: Configuration = {
    vibe: new Int8Array(cells * 24),
    point: new Int8Array(cells * 24),
    open: new Uint8Array(cells * 24),
    store: new Int8Array(cells * 12),
    spoint: new Int8Array(cells * 12),
    sopen: new Uint8Array(cells * 12),
  }

  for (const h of held) {
    c.vibe[h.slot] = h.value
    c.open[h.slot] = h.open
  }

  return c
}

// ---- one start, both rules ----

// the summed state of one rule at one beat: amplitude by configuration, and whether the lock opens on it
type Summed = Map<string, { opened: boolean; re: number; im: number }>

type BeatRead = {
  outStrict: [number, number]
  outStrictWeight: [number, number]
  outRel: [number, number]
  outRelWeight: [number, number]
  // weight resting in stores at this beat's stream (beat t -> t + 1)
  rest: [number, number]
  dpsi: number
  differing: number
  opened: number
  normExact: boolean
  frontier: number
  terms: [number, number]
  stored: [number, number]
}

type StartRead = {
  name: string
  fear: boolean
  beats: BeatRead[]
  sparseDiffer: number
  lockPathDiffer: number
  lockPathChecked: number
  checks: StoreChecks
}

function readStart(
  ball: Ball,
  col: Uint8Array,
  dist: Int32Array,
  st: Start,
): StartRead {
  const t = ball.tables
  const B = st.beats
  const checks = newStoreChecks()
  const fresh = (): BeatRead => ({
    outStrict: [0, 0],
    outStrictWeight: [0, 0],
    outRel: [0, 0],
    outRelWeight: [0, 0],
    rest: [0, 0],
    dpsi: 0,
    differing: 0,
    opened: 0,
    normExact: true,
    frontier: 0,
    terms: [0, 0],
    stored: [0, 0],
  })
  const beats: BeatRead[] = Array.from({ length: B + 1 }, fresh)
  const summed: [Summed, Summed][] = Array.from({ length: B + 1 }, () => [new Map(), new Map()])

  let sparseDiffer = 0
  let lockPathDiffer = 0
  let lockPathChecked = 0

  for (const p of st.parts) {
    const w0 = p.re ** 2 + p.im ** 2
    const start = branchOf(p.held)
    const s0 = sectorOfBranch(start, col, 0)

    let lk: SparseBranch[] = [start]
    let br: SparseBranch[] = [branchOf(p.held)]

    for (let beat = 0; beat <= B; beat++) {
      const read = beats[beat]!

      ;[lk, br].forEach((s, i) => {
        const r = i as 0 | 1

        for (const b of s) {
          const sec = sectorOfBranch(b, col, beat)
          const w = weightOf(b) * w0

          if (sec.n !== s0.n) {
            throw new Error('store-parity: the held count N changed')
          }

          if (sec.q !== s0.q) {
            read.outStrict[r]++
            read.outStrictWeight[r] += w
          }

          if (sec.q !== s0.q && sec.q !== s0.n - s0.q) {
            read.outRel[r]++
            read.outRelWeight[r] += w
          }

          if (hasStore(b)) {
            read.stored[r]++
          }

          const [ar, ai] = amplitudeOf(b)
          const key = sparseKey(b)
          const o = summed[beat]![r]!.get(key) ?? { opened: r === 0 && openedFrames(b, ball.nb).length > 0, re: 0, im: 0 }

          o.re += p.re * ar - p.im * ai
          o.im += p.re * ai + p.im * ar
          summed[beat]![r]!.set(key, o)
        }

        const n = exactBranchNorm(s)

        read.normExact &&= n.total === n.unit
        read.terms[r] += s.length
      })

      read.differing += keyedDiffer(keyedBranches(lk), keyedBranches(br))

      if (beat === B) {
        break
      }

      // I2: every held dock at distance <= R - 1 before the stream (the dock-local pieces keep the docks)
      for (const b of [...lk, ...br]) {
        for (const x of b.docks) {
          if (dist[x]! > ball.radius - 1) {
            read.frontier++
          }
        }
      }

      const locked = storeLockBeat(t, lk, ball.nb, beat, col, checks, w0)
      const bare = storeBeat(t, br, beat, col, checks, w0)

      // I1: the branch-at-a-time lock and beat equal the lock on the whole state then the beat, where both fit
      if (lk.length <= LOCK_CHECK_MAX) {
        const side = newStoreChecks()

        lockPathDiffer += keyedDiffer(
          keyedBranches(locked.branches),
          keyedBranches(storeBeat(t, storeLockAll(lk, ball.nb, side), beat, col, side).branches),
        )
        lockPathChecked++
      }

      // I1: the instrumented beat equals sparseVetoBeat on the bare run
      sparseDiffer += keyedDiffer(
        keyedBranches(bare.branches),
        keyedBranches(sparseVetoBeat('none', t, { branches: br }, beat).branches),
      )

      read.rest[0] += locked.rest
      read.rest[1] += bare.rest
      lk = locked.branches
      br = bare.branches
    }
  }

  for (let beat = 0; beat <= B; beat++) {
    const [L, Bm] = summed[beat]!
    const read = beats[beat]!

    for (const key of new Set([...L.keys(), ...Bm.keys()])) {
      const a = L.get(key) ?? { re: 0, im: 0 }
      const b = Bm.get(key) ?? { re: 0, im: 0 }

      read.dpsi += (a.re - b.re) ** 2 + (a.im - b.im) ** 2
    }

    for (const v of L.values()) {
      if (v.opened) {
        read.opened += v.re ** 2 + v.im ** 2
      }
    }
  }

  return { name: st.name, fear: st.fear, beats, sparseDiffer, lockPathDiffer, lockPathChecked, checks }
}

// ---- I1 against the dense branch code on the R = 2 ball ----

function denseAgainst(): { differing: number; runs: number } {
  const { ball, table } = ballWith(2)
  const t = ball.tables
  const col = colouring(table, ball.cells).col
  const checks = newStoreChecks()
  const wanted = new Set(['PAIR', 'STORE', 'MEET', 'X1'])

  let differing = 0
  let runs = 0

  for (const st of handStarts(ball, 2).filter(s => wanted.has(s.name))) {
    const held = st.parts[0]!.held
    const c = configuration(ball.cells, held)
    const bare = coinedVetoBeat('none', t, lockedState(c), 0)
    const locked = coinedVetoBeat(
      'none',
      t,
      { branches: mergeBranches(branchLock(ball.cells, lockedState(c).branches[0]!, ball.nb)) },
      0,
    )
    const sBare = storeBeat(t, [branchOf(held)], 0, col, checks)
    const sLocked = storeBeat(t, storeLockAll([branchOf(held)], ball.nb, checks), 0, col, checks)

    differing += keyedDiffer(keyedBranches(bare.branches.map(sparseFromDense)), keyedBranches(sBare.branches))
    differing += keyedDiffer(keyedBranches(locked.branches.map(sparseFromDense)), keyedBranches(sLocked.branches))
    runs += 2
  }

  return { differing, runs }
}

export default experiment({
  id: 'selves/store-parity',
  code: 'E-SLF-0195',
  title:
    "the parity sector with stores: whether the working rule's separation-parity sector, which keeps B1's loves-only self out of reach of the any-neighbour lock on the {3,4,3,4} honeycomb, survives the pair move's store, by the rule's pieces checked term by term on the exact R = 4 ball, the sector read on starts with closed vibes, a stored pair and a love meeting a fear, and the lock read against bare",
  category: 'selves',
  substrates: ['3434'],
  depth: 'L2',
  paper: false,
  run() {
    const started = Date.now()
    const setting = process.env.STORE_SWEEP === 'full' ? FULL : SMOKE
    const log = (what: string): void => console.error(`${what} ${Math.round((Date.now() - started) / 1000)}s`)
    const place0 = currentCoinPlace()

    setCoinPlace('split')

    try {
      // ---- I1 against the dense code ----
      const i1 = denseAgainst()

      log(`I1 dense differing ${i1.differing} over ${i1.runs} R = 2 runs`)

      // ---- the ball, I0, S0 (b) static ----
      const R = setting.radius
      const { ball, table, gates: ballGates } = ballWith(R)
      const cl = colouring(table, ball.cells)
      const dist = ballDistance(table, ball.cells)

      let sameColourTargets = 0
      let interiorSlots = 0

      for (let x = 0; x < ball.cells; x++) {
        if (dist[x]! > R - 1) {
          continue
        }

        for (let d = 0; d < 24; d++) {
          const y = Math.floor(ball.tables.target[x * 24 + d]! / 24)

          interiorSlots++

          if (y === x || cl.col[y] === cl.col[x]) {
            sameColourTargets++
          }
        }
      }

      const gI0 = ballGates && cl.reached === ball.cells && cl.conflicts === 0

      log(`ball R = ${R}: ${ball.cells} docks, conflicts ${cl.conflicts}, same-colour targets ${sameColourTargets} of ${interiorSlots}`)

      // ---- the cut, all-even part ----
      const basis = lineBasis({ flavors: [0, 0, 0], statistics: 'fermion', D: 3, box: setting.box, unit: 0 })
      const level = lineLightest(basis, wholeBasis(basis)).lightest
      const placed = levelPlacement(basis, level.cre, level.cim)
      const cut = cutOnBall(ball, cutLevel(placed), D0, 1, false).starts
      const even = cut.filter((p: BallStart) => !hasOddPair(Int32Array.from(p.slots), cl.col))
      const evenNorm = Math.sqrt(even.reduce((s, p) => s + p.re ** 2 + p.im ** 2, 0))
      const cutEven: Start = {
        name: 'CUT_EVEN',
        parts: even.map(p => ({
          held: p.slots.map((s, i) => ({ slot: s, value: p.values[i]!, open: 1 })),
          re: p.re / evenNorm,
          im: p.im / evenNorm,
        })),
        beats: R - 1,
        fear: false,
      }

      log(`cut ${cut.length} configurations, ${even.length} all-even`)

      // ---- the runs ----
      const starts: Start[] = [cutEven, ...handStarts(ball, R)]
      const reads = starts.map(st => {
        const r = readStart(ball, cl.col, dist, st)

        log(
          `${st.name}: ${st.beats} beats, terms ${r.beats.map(b => b.terms.join('/')).join(' ')}, out_rel ${r.beats.map(b => b.outRel.join('/')).join(' ')}, checks ${JSON.stringify(r.checks)}`,
        )

        return r
      })
      const by = (name: string): StartRead => reads.find(r => r.name === name)!

      const sum = (f: (r: StartRead) => number): number => reads.reduce((s, r) => s + f(r), 0)
      const s0a = sum(r => r.checks.pieceViolations)
      const s0bStore = sum(r => r.checks.storeViolations)
      const s0c = sum(r => r.checks.identityViolations)
      const s0d = reads.filter(r => !r.fear).reduce((s, r) => s + r.checks.storedBranches, 0)
      const sparseDiffer = sum(r => r.sparseDiffer)
      const lockPathDiffer = sum(r => r.lockPathDiffer)
      const lockPathChecked = sum(r => r.lockPathChecked)
      const gI1 = i1.differing === 0 && sparseDiffer === 0 && lockPathDiffer === 0
      const gI2 = reads.every(r => r.beats.every(b => b.frontier === 0))
      const gI3 = reads.every(r => r.beats.every(b => b.normExact))
      const instrument = gI0 && gI1 && gI2 && gI3
      const s0 = s0a === 0 && sameColourTargets === 0 && s0bStore === 0 && s0c === 0

      const relOf = (r: StartRead): number => r.beats.reduce((s, b) => s + b.outRel[0] + b.outRel[1], 0)
      const relMax = (r: StartRead): number => Math.max(...r.beats.map(b => Math.max(...b.outRelWeight)))
      const restOf = (r: StartRead): number => r.beats.reduce((s, b) => s + b.rest[0] + b.rest[1], 0)
      const noFear = reads.filter(r => !r.fear)
      const withFear = reads.filter(r => r.fear)
      const kind = !instrument || !s0
        ? 'open'
        : reads.every(r => relOf(r) === 0)
          ? 'property'
          : noFear.some(r => relOf(r) > 0)
            ? 'broken'
            : withFear.every(r => relOf(r) === 0 || restOf(r) > 0)
              ? 'partial'
              : 'unexplained'
      const status: 'pass' | 'fail' | 'partial' | 'open' =
        setting.name === 'smoke' || kind === 'open' || kind === 'unexplained'
          ? 'open'
          : kind === 'property'
            ? 'pass'
            : kind === 'broken'
              ? 'fail'
              : 'partial'

      // ---- the predictions, reported ----
      const pair = by('PAIR')
      const store = by('STORE')
      const meet = by('MEET')
      const exactBare = (r: StartRead): boolean => r.beats.every(b => b.differing === 0 && b.opened === 0)
      const at = (r: StartRead, t: number): BeatRead | undefined => r.beats[t]
      const predicted = {
        instruments: instrument,
        s0: s0 && s0d === 0,
        relZero: ['CUT_EVEN', 'DENSE', 'X1', 'EVEN2', 'PAIR'].every(n => relOf(by(n)) === 0),
        pairStrict: [1, 2].every(t => (at(pair, t)?.outStrictWeight[1] ?? 0) >= ONE),
        storeRel: [1, 2].every(t => {
          const b = at(store, t)

          return b !== undefined && b.outRelWeight[0] >= ONE && b.outRelWeight[1] >= ONE
        }),
        storeRest: store.beats[0]!.rest[1] >= ONE,
        meetLeak: (() => {
          const w = at(meet, 2)?.outRelWeight[1] ?? 0

          return w > 0 && w <= 0.0625 + 1e-12
        })(),
        storeOpened: store.beats[0]!.opened === 0 && (at(store, 1)?.opened ?? 0) >= MIN_SEEN,
        storeDpsi: (at(store, 2)?.dpsi ?? 0) >= MIN_SEEN,
        exactBare: ['CUT_EVEN', 'DENSE', 'X1', 'PAIR', 'EVEN2'].every(n => exactBare(by(n))),
        verdictPartial: kind === 'partial',
      }

      const row = (r: StartRead): string =>
        `${r.name} (stored branches ${r.checks.storedBranches}): ` +
        r.beats
          .map(
            (b, t) =>
              `t ${t}: terms ${b.terms.join('/')}, out_strict ${b.outStrict.join('/')} weight ${e17(b.outStrictWeight[0])}/${e17(b.outStrictWeight[1])}, out_rel ${b.outRel.join('/')} weight ${e17(b.outRelWeight[0])}/${e17(b.outRelWeight[1])}, rest ${e17(b.rest[0])}/${e17(b.rest[1])}, stored ${b.stored.join('/')}, |dpsi|^2 ${e17(b.dpsi)}, differing ${b.differing}, opened ${e17(b.opened)}`,
          )
          .join('; ')

      for (const r of reads) {
        console.error(row(r))
      }

      const metrics: Record<string, number> = {
        gate_I0: gI0 ? 1 : 0,
        gate_I1: gI1 ? 1 : 0,
        gate_I2: gI2 ? 1 : 0,
        gate_I3: gI3 ? 1 : 0,
        gate_S0: s0 ? 1 : 0,
        s0aPieceViolations: s0a,
        s0bSameColourTargets: sameColourTargets,
        s0bStoreViolations: s0bStore,
        s0cIdentityViolations: s0c,
        s0dStoredWithoutFear: s0d,
        i1DenseDiffering: i1.differing,
        i1SparseDiffering: sparseDiffer,
        ballCells: ball.cells,
        interiorSlots,
        outRelTerms: sum(relOf),
        storeRelMax: relMax(store),
        meetRelMax: relMax(meet),
        pairRelMax: relMax(pair),
        storeRest0: store.beats[0]!.rest[1],
        storeOpened1: at(store, 1)?.opened ?? NaN,
        storeDpsi2: at(store, 2)?.dpsi ?? NaN,
        predictionsHeld: Object.values(predicted).filter(Boolean).length,
        predictions: Object.values(predicted).length,
        seconds: (Date.now() - started) / 1000,
      }

      return verdict({
        status,
        claim: `${setting.name} setting, kind ${kind}. S0: dock-local piece violations ${s0a}, same-colour stream targets ${sameColourTargets} of ${interiorSlots} interior slots, stores changed by a stream ${s0bStore}, identity violations ${s0c}, stores on no-fear starts ${s0d}. S1: out_rel terms ${sum(relOf)}; leak (max out_rel weight) STORE ${e17(relMax(store))}, MEET ${e17(relMax(meet))}, PAIR ${e17(relMax(pair))}. ${reads.map(row).join(' || ')}. Predictions held ${Object.entries(predicted).map(([k, v]) => `${k} ${v}`).join(', ')}`,
        metrics,
        notes: `L2. Gate abb395a395e1. Setting ${setting.name}${setting.name === 'smoke' ? ' (proves the file runs; not evidence, status open by rule)' : ''}. I0 ${gI0} (ball gates ${ballGates}, reached ${cl.reached} of ${ball.cells}, conflicts ${cl.conflicts}). I1 ${gI1} (dense ${i1.differing} differing over ${i1.runs} R = 2 runs, sparseVetoBeat ${sparseDiffer} differing over every bare beat, the branch-at-a-time lock and beat ${lockPathDiffer} differing from the whole-state lock then beat over ${lockPathChecked} locked beats of at most ${LOCK_CHECK_MAX} branches). I2 ${gI2}. I3 ${gI3}. Out and rest weights are per start configuration times its weight (exact for the one-configuration starts); dpsi and opened read on the summed state.`,
      })
    } finally {
      setCoinPlace(place0)
    }
  },
})
