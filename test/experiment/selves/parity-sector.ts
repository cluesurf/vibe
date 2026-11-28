// THE PARITY SECTOR. E-SLF-0190 found the any-neighbour locked F-G mixer
// leaves B1's line self exactly bare, and an earlier step found why on the line engine: every love moves one dock a
// beat, so every pairwise separation keeps its parity, B1's lone cluster has only even separations, and the lock needs
// a love at separation 1. Is that protection a property of the working rule on the {3,4,3,4} honeycomb, or an artifact
// of the one-dimensional line engine, where K cannot move a vibe onto another line?
//
// THE ARGUMENT TO TEST. If the dock facet graph is bipartite and every love moves exactly one facet a beat (the coin,
// the meetings and K act inside a dock; the stream crosses one facet), then Q_t, the number of loves on docks of colour
// t mod 2, is conserved term by term, and Q_t fixes the parity of every pairwise separation. A lock that needs an
// occupied neighbour (an odd separation) then never opens on a start in an all-even sector.
//
// GATES, fixed in the item's what before this file existed (gate adf123ac07d1, 2026-11-17T10:13:21Z). P0 bipartite on
// the exact R = 4 ball and the (sqrt 2)^6 quotient. P1 the sector kept term by term, both rules, every start and beat.
// P2 B1's cut (and its all-even part): locked minus bare, unrounded. P3 an odd-separation start, where the lock opens
// on the start's own weight. Instruments I0 to I4.
//
// PREDICTION (before the first run): every instrument holds; P0 0 conflicts on both meshes; P1 0 out terms everywhere;
// verdict property. P2: CUT's odd weight and opened weight <= 1e-25, |dL| <= 1e-12, CUT_EVEN exactly bare. P3: ODD's
// opened weight 1 at beat 0, |dpsi|^2 >= 1e-3, |dL| >= 1e-3 at some beat; EVEN and DENSE exactly bare; DENSE1 differs.
//
// FULL RUN (M3, 2026-11-17, clone parity-sector, 710 s, gate adf123ac07d1): PASS, kind property, every prediction held.
// P0: 0 same-colour edges on the R = 4 ball (162,049 docks) and on the quotient (1,048,576). P1: 0 out-of-sector terms
// over every start, both rules and every beat, with K firing 86,784 times on the cut and 1,096 on DENSE. P2: CUT's odd
// weight 6.1e-30, opened weight <= 6.1e-30, |dpsi|^2 <= 7.9e-30, dL_l 0 at beats 0 to 3; CUT_EVEN exactly bare. P3: ODD
// opens on its whole weight, L_l locked 0.625, 0.180, 0.204 at beats 1 to 3 against bare 1; DENSE exactly bare to beat
// 4; DENSE1 differs from beat 1.
//
// SETTINGS. Default SMOKE (box 8, the R = 3 ball, beats R - r0, no quotient; seconds; open by rule). PARITY_SWEEP=full
// for a large machine (box 12, the R = 4 ball, the quotient).
//
// Depth L2: the ball runs exact in Z[w][1/2] per start configuration; the level vector and the summed P2 reads in
// floats.

import { experiment } from '@/test/scaffold/suite'
import { verdict } from '@/test/scaffold/verdict'
import { lineBasis, lineLightest, wholeBasis } from '@/code/measure/coined-line-bloch'
import { levelPlacement } from '@/code/measure/held-cluster'
import {
  newSparseTally,
  openedLocks,
  physical,
  sparseBeat,
  sparseLockedMix,
  sparseStart,
  type SparseState,
  type SparseTally,
} from '@/code/measure/cross-ball'
import {
  BARE_RULE,
  D0,
  PI9,
  cutLevel,
  cutOnBall,
  findEnv,
  lineDocks,
  type Ball,
  type BallStart,
} from '@/code/measure/self-reader-ball'
import {
  branchKeyed,
  branchLock,
  colouring,
  exactNorm,
  hasOddPair,
  keyedDiffer,
  sectorOf,
  sparseKeyed,
} from '@/code/measure/parity-sector'
import { lockedFresh } from '@/code/measure/doublet-locked-readings'
import { exactBallMesh } from '@/code/substrate/coxeter/exact-ball-mesh'
import { enumerateFrames, graphGates } from '@/code/substrate/coxeter/congruence-3434'
import { lockedState, lockedTables, mergeBranches, type Configuration } from '@/code/rule/doublet-locked-knit'
import { coinedVetoBeat, currentCoinPlace, setCoinPlace } from '@/code/rule/coined-locked-knit'
import { LINE_FIRSTS, OPPOSITE } from '@/code/rule/isometric-knit'

const D0_BACK = OPPOSITE[D0]!
const RECORDED = { energy: 0.33001851839229945 }
const MIN_ODD = 1e-3

type Setting = { name: 'smoke' | 'full'; box: number; levelBar: number; radius: number; quotient: boolean }

const SMOKE: Setting = { name: 'smoke', box: 8, levelBar: 1e-4, radius: 3, quotient: false }
const FULL: Setting = { name: 'full', box: 12, levelBar: 1e-9, radius: 4, quotient: true }

const e17 = (x: number): string => x.toExponential(17)
const e3 = (x: number): string => (Number.isFinite(x) ? x.toExponential(3) : String(x))

// the ball with its gates and its dock table
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

type Start = { name: string; parts: BallStart[]; beats: number }

// the hand starts on the line l through dock 0 along D0
function handStarts(ball: Ball, beatsFrom: (r0: number) => number): Start[] {
  const { dockAt } = lineDocks(ball, D0)
  const at = (p: number, d: number): number => dockAt.get(p)! * 24 + d
  const env = findEnv()
  const dense = [D0, env.single, LINE_FIRSTS[env.full]!, OPPOSITE[LINE_FIRSTS[env.full]!]!]
  const one = (name: string, slots: number[], r0: number): Start => ({
    name,
    parts: [{ slots, values: slots.map(() => 1), re: 1, im: 0 }],
    beats: beatsFrom(r0),
  })

  return [
    one('EVEN', [at(-1, D0), at(-1, D0_BACK), at(1, D0)], 1),
    one('ODD', [at(-1, D0), at(-1, D0_BACK), at(0, D0)], 1),
    one('DENSE', dense, 0),
    { ...one('DENSE1', [...dense, at(1, D0)], 1), beats: Math.min(2, beatsFrom(1)) },
  ]
}

const configuration = (cells: number, slots: readonly number[]): Configuration => {
  const c: Configuration = {
    vibe: new Int8Array(cells * 24),
    point: new Int8Array(cells * 24),
    open: new Uint8Array(cells * 24),
    store: new Int8Array(cells * 12),
    spoint: new Int8Array(cells * 12),
    sopen: new Uint8Array(cells * 12),
  }

  for (const s of slots) {
    c.vibe[s] = 1
    c.open[s] = 1
  }

  return c
}

// ---- one start, both rules ----

type Summed = Map<string, { slots: Int32Array; re: number; im: number }>

type BeatRead = {
  outTerms: [number, number]
  outWeight: [number, number]
  lineL: [number, number]
  dpsi: number
  differing: number
  opened: number
  normExact: boolean
  terms: [number, number]
}

type StartRead = { name: string; beats: BeatRead[]; frontier: number; kFired: number; oddWeight0: number }

function addSummed(into: Summed, s: SparseState, re: number, im: number): void {
  for (const [key, term] of s) {
    const [ar, ai] = physical(term, PI9)
    const o = into.get(key) ?? { slots: term.slots, re: 0, im: 0 }

    o.re += re * ar - im * ai
    o.im += re * ai + im * ar
    into.set(key, o)
  }
}

function readStart(ball: Ball, col: Uint8Array, onLine: (s: number) => boolean, st: Start): StartRead {
  const t = ball.tables
  const tally: SparseTally = newSparseTally()
  const beats: BeatRead[] = []
  const B = st.beats

  // per beat, both rules: the summed state, out counts and weights, differing terms, exact norms
  const summed: [Summed, Summed][] = Array.from({ length: B + 1 }, () => [new Map(), new Map()])
  const outTerms = Array.from({ length: B + 1 }, () => [0, 0] as [number, number])
  const outWeight = Array.from({ length: B + 1 }, () => [0, 0] as [number, number])
  const differing = new Array<number>(B + 1).fill(0)
  const normExact = new Array<boolean>(B + 1).fill(true)
  const terms = Array.from({ length: B + 1 }, () => [0, 0] as [number, number])

  let oddWeight0 = 0

  for (const p of st.parts) {
    const slots0 = Int32Array.from(p.slots)
    const q0 = sectorOf(slots0, col, 0)

    if (hasOddPair(slots0, col)) {
      oddWeight0 += p.re ** 2 + p.im ** 2
    }

    let lk: SparseState = sparseStart(p.slots, p.values, new Map())
    let br: SparseState = sparseStart(p.slots, p.values, new Map())

    for (let beat = 0; beat <= B; beat++) {
      if (beat > 0) {
        lk = sparseBeat(BARE_RULE, t, sparseLockedMix(t, lk), beat - 1, tally)
        br = sparseBeat(BARE_RULE, t, br, beat - 1, tally)
      }

      ;[lk, br].forEach((s, i) => {
        const r = i as 0 | 1

        for (const term of s.values()) {
          if (sectorOf(term.slots, col, beat) !== q0) {
            const [ar, ai] = physical(term, PI9)

            outTerms[beat]![r]++
            outWeight[beat]![r] += (ar * ar + ai * ai) * (p.re ** 2 + p.im ** 2)
          }
        }

        const n = exactNorm(s)

        normExact[beat] &&= n.total === n.unit
        terms[beat]![r] += s.size
        addSummed(summed[beat]![r]!, s, p.re, p.im)
      })

      differing[beat]! += keyedDiffer(sparseKeyed(lk), sparseKeyed(br))
    }
  }

  for (let beat = 0; beat <= B; beat++) {
    const [L, Bm] = summed[beat]!
    const w = (m: Summed): number => {
      let x = 0

      for (const v of m.values()) {
        if (Array.from(v.slots).every(onLine)) {
          x += v.re ** 2 + v.im ** 2
        }
      }

      return x
    }

    let dpsi = 0

    for (const key of new Set([...L.keys(), ...Bm.keys()])) {
      const a = L.get(key) ?? { re: 0, im: 0 }
      const b = Bm.get(key) ?? { re: 0, im: 0 }

      dpsi += (a.re - b.re) ** 2 + (a.im - b.im) ** 2
    }

    // the weight, on the locked run's state before its next pass, of terms with an opened lock
    let opened = 0

    for (const v of L.values()) {
      if (openedLocks(t, v.slots).length > 0) {
        opened += v.re ** 2 + v.im ** 2
      }
    }

    beats.push({
      outTerms: outTerms[beat]!,
      outWeight: outWeight[beat]!,
      lineL: [w(L), w(Bm)],
      dpsi,
      differing: differing[beat]!,
      opened,
      normExact: normExact[beat]!,
      terms: terms[beat]!,
    })
  }

  return { name: st.name, beats, frontier: tally.frontier, kFired: tally.kFired, oddWeight0 }
}

// ---- I1: the sparse beats against the branch code on the R = 2 ball ----

function sparseAgainstBranch(): { differing: number; runs: number } {
  const { ball } = ballWith(2)
  const t = ball.tables
  let differing = 0
  let runs = 0

  for (const st of handStarts(ball, () => 1)) {
    const slots = st.parts[0]!.slots
    const c = configuration(ball.cells, slots)
    const bare = coinedVetoBeat('none', t, lockedState(c), 0)
    const locked = coinedVetoBeat(
      'none',
      t,
      { branches: mergeBranches(branchLock(ball.cells, lockedState(c).branches[0]!, ball.nb)) },
      0,
    )
    const start = sparseStart(slots, slots.map(() => 1), new Map())
    const sBare = sparseBeat(BARE_RULE, t, start, 0)
    const sLocked = sparseBeat(BARE_RULE, t, sparseLockedMix(t, start), 0)

    differing += keyedDiffer(branchKeyed(bare.branches), sparseKeyed(sBare))
    differing += keyedDiffer(branchKeyed(locked.branches), sparseKeyed(sLocked))
    runs += 2
  }

  return { differing, runs }
}

export default experiment({
  id: 'selves/parity-sector',
  code: 'E-SLF-0192',
  title:
    "the parity sector: whether the separation parity that keeps B1's self out of reach of the any-neighbour lock on the line engine holds on the {3,4,3,4} honeycomb, by the dock graph's 2-colouring on the exact R = 4 ball and the (sqrt 2)^6 quotient and the working rule's sector kept term by term, with B1's cut and an odd-separation start read locked against bare",
  category: 'selves',
  substrates: ['3434'],
  depth: 'L2',
  paper: false,
  run() {
    const started = Date.now()
    const setting = process.env.PARITY_SWEEP === 'full' ? FULL : SMOKE
    const log = (what: string): void => console.error(`${what} ${Math.round((Date.now() - started) / 1000)}s`)
    const place0 = currentCoinPlace()

    setCoinPlace('split')

    try {
      // ---- I1 ----
      const i1 = sparseAgainstBranch()
      const gI1 = i1.differing === 0

      log(`I1 differing ${i1.differing} over ${i1.runs} runs`)

      // ---- the ball, I0, P0 ----
      const R = setting.radius
      const { ball, table, gates: ballGates } = ballWith(R)
      const ballCol = colouring(table, ball.cells)

      log(`ball R = ${R}: ${ball.cells} docks, conflicts ${ballCol.conflicts}`)

      let quotient = { docks: 0, gates: true, conflicts: NaN, reached: 0, witness: [] as number[] }

      if (setting.quotient) {
        const e = enumerateFrames({ level: { twoPower: 6, odd: 1 }, maxDocks: 1_100_000 })
        const g = graphGates(e.table, e.order)
        const qc = colouring(e.table, e.order)

        quotient = {
          docks: e.order,
          gates: e.fits && g.returnsExactly && g.noSelfLoops && g.distinctNeighbours,
          conflicts: qc.conflicts,
          reached: qc.reached,
          witness: qc.witness,
        }
        log(`quotient ${e.order} docks, conflicts ${qc.conflicts}`)
      }

      const gI0 = ballGates && quotient.gates && ballCol.reached === ball.cells
      const p0 = ballCol.conflicts === 0 && (!setting.quotient || quotient.conflicts === 0)

      // ---- I4, the cut ----
      const basis = lineBasis({ flavors: [0, 0, 0], statistics: 'fermion', D: 3, box: setting.box, unit: 0 })
      const level = lineLightest(basis, wholeBasis(basis)).lightest
      const placed = levelPlacement(basis, level.cre, level.cim)
      const levelOff = Math.abs(level.unwrapped - RECORDED.energy)
      const gI4 = levelOff <= setting.levelBar
      const cut = cutOnBall(ball, cutLevel(placed), D0, 1, false).starts
      const even = cut.filter(p => !hasOddPair(Int32Array.from(p.slots), ballCol.col))
      const evenNorm = Math.sqrt(even.reduce((s, p) => s + p.re ** 2 + p.im ** 2, 0))
      const cutEven = even.map(p => ({ ...p, re: p.re / evenNorm, im: p.im / evenNorm }))

      log(`I4 level off ${e3(levelOff)}; cut ${cut.length} configurations, ${even.length} all-even`)

      // ---- the runs ----
      const beatsFrom = (r0: number): number => R - r0
      const lDocks = new Set(lineDocks(ball, D0).dockAt.values())
      const onLine = (s: number): boolean => lDocks.has(Math.floor(s / 24)) && (s % 24 === D0 || s % 24 === D0_BACK)
      const starts: Start[] = [
        { name: 'CUT', parts: cut, beats: beatsFrom(1) },
        { name: 'CUT_EVEN', parts: cutEven, beats: beatsFrom(1) },
        ...handStarts(ball, beatsFrom),
      ]
      const reads = starts.map(st => {
        const r = readStart(ball, ballCol.col, onLine, st)

        log(`${st.name}: ${st.beats} beats, terms ${r.beats.map(b => b.terms.join('/')).join(' ')}, out ${r.beats.map(b => b.outTerms.join('/')).join(' ')}`)

        return r
      })
      const by = (name: string): StartRead => reads.find(r => r.name === name)!

      const gI2 = reads.every(r => r.frontier === 0)
      const gI3 = reads.every(r => r.beats.every(b => b.normExact))
      const outOf = (r: StartRead): number => r.beats.reduce((s, b) => s + b.outTerms[0] + b.outTerms[1], 0)
      const p1All = reads.every(r => outOf(r) === 0)
      const p1Light = ['CUT', 'CUT_EVEN', 'EVEN', 'ODD'].every(n => outOf(by(n)) === 0)
      const beat1Leak = ['CUT', 'EVEN', 'ODD'].some(n => {
        const b = by(n).beats[1]

        return b !== undefined && b.outTerms[0] + b.outTerms[1] > 0
      })
      const instrument = gI0 && gI1 && gI2 && gI3 && gI4
      const kind = !instrument
        ? 'open'
        : p0 && p1All
          ? 'property'
          : ballCol.conflicts !== 0 || beat1Leak
            ? 'artifact'
            : 'partial'
      const status: 'pass' | 'fail' | 'partial' | 'open' =
        setting.name === 'smoke' || kind === 'open'
          ? 'open'
          : kind === 'property'
            ? 'pass'
            : kind === 'artifact'
              ? 'fail'
              : 'partial'

      // ---- the predictions, reported ----
      const cutR = by('CUT')
      const cutE = by('CUT_EVEN')
      const odd = by('ODD')
      const maxOf = (r: StartRead, f: (b: BeatRead) => number): number => Math.max(...r.beats.map(f))
      const exactBare = (r: StartRead): boolean => r.beats.every(b => b.differing === 0 && b.opened === 0)
      const predicted = {
        cutOdd: cutR.oddWeight0 <= 1e-25,
        cutOpened: maxOf(cutR, b => b.opened) <= 1e-25,
        cutDpsi: maxOf(cutR, b => b.dpsi) <= 1e-25,
        cutDL: maxOf(cutR, b => Math.abs(b.lineL[0] - b.lineL[1])) <= 1e-12,
        cutEvenExact: exactBare(cutE),
        oddOpened: Math.abs(odd.beats[0]!.opened - 1) <= 1e-12,
        oddDpsi: odd.beats.slice(1).every(b => b.dpsi >= MIN_ODD),
        oddDL: odd.beats.slice(1).some(b => Math.abs(b.lineL[0] - b.lineL[1]) >= MIN_ODD),
        evenExact: exactBare(by('EVEN')),
        denseExact: exactBare(by('DENSE')),
        dense1Differs: by('DENSE1').beats.some(b => b.differing > 0),
      }

      const row = (r: StartRead): string =>
        `${r.name} (K fired ${r.kFired}, frontier ${r.frontier}, odd weight at 0 ${e17(r.oddWeight0)}): ` +
        r.beats
          .map(
            (b, t) =>
              `t ${t}: terms ${b.terms.join('/')}, out ${b.outTerms.join('/')} weight ${e3(b.outWeight[0])}/${e3(b.outWeight[1])}, L_l locked ${e17(b.lineL[0])} bare ${e17(b.lineL[1])} dL ${e17(b.lineL[0] - b.lineL[1])}, |dpsi|^2 ${e17(b.dpsi)}, differing ${b.differing}, opened ${e17(b.opened)}`,
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
        gate_I4: gI4 ? 1 : 0,
        gate_P0: p0 ? 1 : 0,
        gate_P1: p1All ? 1 : 0,
        gate_P1_light: p1Light ? 1 : 0,
        ballCells: ball.cells,
        ballConflicts: ballCol.conflicts,
        quotientDocks: quotient.docks,
        quotientConflicts: quotient.conflicts,
        i1Differing: i1.differing,
        outTerms: reads.reduce((s, r) => s + outOf(r), 0),
        cutConfigurations: cut.length,
        cutOddWeight0: cutR.oddWeight0,
        cutOpenedMax: maxOf(cutR, b => b.opened),
        cutDpsiMax: maxOf(cutR, b => b.dpsi),
        cutDLMax: maxOf(cutR, b => Math.abs(b.lineL[0] - b.lineL[1])),
        oddOpened0: odd.beats[0]!.opened,
        oddDpsiMax: maxOf(odd, b => b.dpsi),
        oddDLMax: maxOf(odd, b => Math.abs(b.lineL[0] - b.lineL[1])),
        predictionsHeld: Object.values(predicted).filter(Boolean).length,
        predictions: Object.values(predicted).length,
        levelOff,
        seconds: (Date.now() - started) / 1000,
      }

      return verdict({
        status,
        claim: `${setting.name} setting, kind ${kind}. P0: the R = ${R} ball (${ball.cells} docks) has ${ballCol.conflicts} same-colour edges${ballCol.witness.length ? `, odd walk ${ballCol.witness.join(' ')}` : ''}; the (sqrt 2)^6 quotient ${setting.quotient ? `(${quotient.docks} docks) has ${quotient.conflicts}${quotient.witness.length ? `, odd walk ${quotient.witness.join(' ')}` : ''}` : 'not built (smoke)'}. P1: ${reads.reduce((s, r) => s + outOf(r), 0)} out-of-sector terms over every start, rule and beat. ${reads.map(row).join(' || ')}. Predictions held ${Object.entries(predicted).map(([k, v]) => `${k} ${v}`).join(', ')}`,
        metrics,
        notes: `L2. Gate adf123ac07d1. Setting ${setting.name}${setting.name === 'smoke' ? ' (proves the file runs; not evidence, status open by rule)' : ''}. I0 ${gI0} (ball gates ${ballGates}, reached ${ballCol.reached} of ${ball.cells}; quotient gates ${quotient.gates}). I1 ${gI1} (${i1.differing} differing entries over ${i1.runs} R = 2 runs, bare and locked). I2 ${gI2} (frontier ${reads.map(r => r.frontier).join(' ')}). I3 ${gI3}. I4 ${gI4} (level off ${e3(levelOff)}). Scope: loves only, no store; the pair move and the store idle, so a store trit that holds a vibe still is not tested. The summed P2 reads are floats over exact per-configuration runs.`,
      })
    } finally {
      setCoinPlace(place0)
    }
  },
})
