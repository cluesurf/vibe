// A SELF ACROSS LINES (a board proposal). The line
// self (B1's bound 3-love cluster, L(2) 0.959 under B1's line rule, 0019, 0020) lives on one mesh line, where the
// working rule cannot move a vibe off its line. The rule's collision K = w_P does move vibes between lines on a dock with
// two single lines and a third occupied line (note/line-confinement.md section 2, witness W0). Does a self whose dock is
// shared with other lines, so that K fires on it, keep its level, i.e. does a self in the bulk export only its errors?
//
// THE RULE. The line self binds under the working rule plus the drift cost and the fermion sign, defined on one line
// only (code/rule/bound-line-pieces). A board proposal writes both for any state: the sign as the reordering parity in
// modeIndex order, the cost as S1, a Z3 trit on every link with Gauss at every dock and zeta_18^(-1) (pi/9) a flux link
// (code/rule/cross-line-pieces, opt-in, not adopted). Here both run as optional pieces, the status the line pieces
// have.
//
// THE INSTRUMENTS. (1) The main read, a board proposal option C: B1's full 23-dock level on the line engine
// (code/measure/cone-line, clock 18), with K's block at one shared dock X on beat 1 (code/measure/cross-line-dock):
// exact through beat 2 by the argument in that file's header, a lower bound if a collision changes l's love count.
// (2) The exact R = 4 ball (162,049 docks), sparse branches (code/measure/cross-ball), on a start that fits its horizon
// (B1's level cut to 3 docks of l, r0 1, exact to beat 2): a line arm, and a bulk arm with W0's env at dock 0 so K fires,
// each equal to instrument (1) on the same cut start. (3) Option A, the bare working rule (both pieces off), on the two
// ball arms, a control only.
//
// GATES, fixed in the item's what before any results probe (see the gate line): C1, R0, R1, R2, R3, R4, R5, B0, P0, X0;
// the main read L_C(2) and the falsifier. Smoke is open by rule.
//
// PREDICTION (before the first run): P0 holds (L(2) about 0.95 at pi/9); K at the shared dock costs the self a little:
// L_C(2) at the max-weight dock 0.85 to 0.95, within 0.1 of the line's; verdict pass or fail at the 0.9 bar, leaning pass.
//
// FULL RUN (M3, 2026-11-16, clone bulk-self, 117 s, gate f30e4853d6f6): FAIL. Every instrument gate holds (C1, B0 L
// 0.9167 0.9589, R0 to R5, X0 to 2.2e-16 with 0 frontier hits on R = 4). P0 holds: the line self at pi/9 keeps L(2)
// 0.9524. With W0's env at its max-weight lone dock, K fires on weight 0.097 and L_C(2) is 0.8868 (0.8783 to 0.9524 over
// 18 docks), below 0.9 while the line holds, within 0.1 of it. X0's bulk arm fires K only on terms of weight 5e-30 (the
// cut level holds no lone love at dock 0); X0b, added after the gate and reported only, puts the env at the cut's lone
// dock: K fires on weight 0.5 and ball and instrument agree to 3.3e-16.
//
// Depth L2: the main read is B1's line rule in floats with K's block from the rule's own table; the ball arms are exact.

import { experiment } from '@/test/scaffold/suite'
import { verdict } from '@/test/scaffold/verdict'
import {
  lineBasis,
  lineLightest,
  wholeBasis,
} from '@/code/measure/coined-line-bloch'
import { fitRing, levelPlacement } from '@/code/measure/held-cluster'
import type { Placed } from '@/code/measure/held-cluster'
import { lineReader, type LineReader } from '@/code/measure/cold-line'
import {
  addAmp,
  coneBoundCount,
  coneStart,
  coneStore,
  type ConeStore,
} from '@/code/measure/cone-line'
import {
  crossDockRun,
  loneWeights,
  spanWeight,
  type DockEnv,
} from '@/code/measure/cross-line-dock'
import {
  newSparseTally,
  physical,
  sparseBeat,
  sparseDiffer,
  sparseNorm,
  sparseOf,
  sparseStart,
  type SparseState,
} from '@/code/measure/cross-ball'
import { lockedFresh } from '@/code/measure/doublet-locked-readings'
import { exactBallMesh } from '@/code/substrate/coxeter/exact-ball-mesh'
import {
  lockedTables,
  mergeBranches,
  type Branch,
  type Configuration,
  type LockedState,
  type LockedTables,
} from '@/code/rule/doublet-locked-knit'
import {
  coinedVetoBeat,
  currentCoinPlace,
  modeIndex,
  setCoinPlace,
  type CoinPlace,
} from '@/code/rule/coined-locked-knit'
import {
  crossBeat,
  crossBeatBack,
  crossDiffer,
  crossNorm,
  gaugeLine,
  gaussDefect,
  registerKey,
  reorderParity,
  type CrossOptions,
  type CrossState,
  type Register,
} from '@/code/rule/cross-line-pieces'
import {
  boundBeat,
  boundStart,
  type BoundLine,
  type BoundState,
} from '@/code/rule/bound-line-pieces'
import { BOUNCE_TABLE, bouncePermutation } from '@/code/rule/bounce-pair-knit'
import { LINE_FIRSTS, LINE_OF, OPPOSITE } from '@/code/rule/isometric-knit'

const RECORDED = { energy: 0.33001851839229945 }

// 0020's bare line rule (clock 14), L(1) and L(2) of B1's lone cluster at W 12
const L_0020 = [0.917, 0.959]
const B0_TOL = 1e-3
const X0_TOL = 1e-12
const HOLD = 0.9
const MARGIN = 0.1
const WINDOW = 2
const SPAN = 2
const PI9 = 18
const PI7 = 14

const D0 = LINE_FIRSTS[0]!
const D0_BACK = OPPOSITE[D0]!
const LINE_L = LINE_OF[D0]!
const ON: CrossOptions = { sign: true, cost: true, clock: PI9, place: 'split' }
const OFF: CrossOptions = { sign: false, cost: false, clock: PI9, place: 'split' }

// ---- the ball ----

type Ball = {
  radius: number
  cells: number
  tables: LockedTables
  nb: (x: number, d: number) => number
  // docks of l through dock 0 by position (dock 0 at 0) and back
  pos: Map<number, number>
  dockAt: Map<number, number>
}

function ballOf(radius: number): Ball {
  const m = exactBallMesh({ radius })
  const cells = m.cells
  const f = lockedFresh({ mesh: m.mesh, store: new Int8Array(cells * 12) })
  const tables = lockedTables(
    f.weave,
    'pass',
    new Int16Array(cells * 24).fill(f.weave.moves.identity),
  )
  const nb = (x: number, d: number): number => m.mesh.neighbour(x, d)
  const pos = new Map<number, number>([[0, 0]])

  for (const [dir, step] of [[D0, 1], [D0_BACK, -1]] as const) {
    let x = nb(0, dir)
    let p = step

    while (x >= 0) {
      pos.set(x, p)
      x = nb(x, dir)
      p += step
    }
  }

  const dockAt = new Map([...pos].map(([x, p]) => [p, x]))

  return { radius, cells, tables, nb, pos, dockAt }
}

function empty(cells: number): Configuration {
  return {
    vibe: new Int8Array(cells * 24),
    point: new Int8Array(cells * 24),
    open: new Uint8Array(cells * 24),
    store: new Int8Array(cells * 12),
    spoint: new Int8Array(cells * 12),
    sopen: new Uint8Array(cells * 12),
  }
}

const branchOf = (cells: number, slots: readonly number[], value: number, a: bigint): Branch => {
  const c = empty(cells)

  for (const s of slots) {
    c.vibe[s] = value
    c.open[s] = 1
  }

  return { ...c, a, b: 0n, k: 0 }
}

// the cluster's string on l: link (position p to p + 1) holds the loves at positions <= p, mod 3
function lineRegister(ball: Ball, positions: readonly number[], q: number): Map<number, number> {
  const reg = new Map<number, number>()

  if (positions.length === 0) {
    return reg
  }

  const lo = Math.min(...positions)
  const hi = Math.max(...positions)

  for (let p = lo; p < hi; p++) {
    const f = (((positions.filter(x => x <= p).length * q) % 3) + 3) % 3

    if (f !== 0) {
      reg.set(ball.dockAt.get(p)! * 24 + D0, f)
    }
  }

  return reg
}

// the slot of a love at line position p with label j (0 forward, the first slot)
const lineSlot = (ball: Ball, p: number, j: number): number =>
  ball.dockAt.get(p)! * 24 + (j === 0 ? D0 : D0_BACK)

// ---- W0's env: the first (s, m') in W0's search order where K at a dock with l single on D0 moves m' off its line ----

function findEnv(): DockEnv {
  const dock = new Int8Array(24)
  const perm = new Int32Array(24)

  for (let s = 0; s < 24; s++) {
    if (LINE_OF[s] === LINE_L) {
      continue
    }

    for (let lm = 0; lm < 12; lm++) {
      if (lm === LINE_L || lm === LINE_OF[s]) {
        continue
      }

      dock.fill(0)
      dock[D0] = 1
      dock[s] = 1
      dock[LINE_FIRSTS[lm]!] = 1
      dock[OPPOSITE[LINE_FIRSTS[lm]!]!] = 1

      if (bouncePermutation(BOUNCE_TABLE, 'pass', dock, 0, perm) === 1 && LINE_OF[perm[LINE_FIRSTS[lm]!]!] !== lm) {
        return { first: D0, single: s, full: lm }
      }
    }
  }

  throw new Error('bulk-self: no W0 env')
}

const envSlots = (env: DockEnv): number[] => [
  env.single,
  LINE_FIRSTS[env.full]!,
  OPPOSITE[LINE_FIRSTS[env.full]!]!,
]

// ---- the cut start: B1's level cut to 3 docks of l (relative positions 0..2 at line positions -1..1) ----

type Cut = { ts: [number, number][]; re: number; im: number }[]

function cutLevel(placed: readonly Placed[]): Cut {
  const kept = placed.filter(p => Math.max(...p.ts.map(t => t[0])) <= 2 && p.re ** 2 + p.im ** 2 > 0)
  const w = Math.sqrt(kept.reduce((s, p) => s + p.re ** 2 + p.im ** 2, 0))

  return kept.map(p => ({ ts: p.ts.map(([x, j]) => [x - 1, j] as [number, number]), re: p.re / w, im: p.im / w }))
}

// cone modes of line positions (cone position = OFFSET + line position)
const coneMode = (offset: number, p: number, j: number): number => 2 * (offset + p) + (j === 0 ? 1 : 0)

function cutCone(cut: Cut, offset: number, line: number, clock: number): ConeStore {
  const s = coneStore(3, line, 1e6, clock)

  for (const p of cut) {
    addAmp(s, Int32Array.from(p.ts.map(([x, j]) => coneMode(offset, x, j)).sort((a, b) => a - b)), p.re, p.im)
  }

  return s
}

// the order O_joint's key of a ball slot: l's modes in line order (cone modes), every other mode before them
const BIG = 1 << 28

function jointKey(ball: Ball, offset: number, slot: number): number {
  const x = Math.floor(slot / 24)
  const d = slot % 24
  const p = ball.pos.get(x)

  return p !== undefined && LINE_OF[d] === LINE_L ? coneMode(offset, p, d === D0 ? 0 : 1) : modeIndex(slot) - BIG
}

// ---- the ball arms ----

type Combined = Map<string, { slots: Int32Array; values: Int8Array; reg: Register; re: number; im: number }>

type ArmRead = { F: number[]; span: number[]; norm: number[]; offLine: number; regOff: number; frontier: number; kFired: number; terms: number }

function ballArm(
  ball: Ball,
  cut: Cut,
  env: DockEnv | undefined,
  options: CrossOptions,
  beats: number,
  rd: LineReader,
  offset: number,
  line: number,
  envAt = 0,
): ArmRead {
  const clock = options.clock ?? PI9
  const envDock = ball.dockAt.get(envAt)!
  const extra = env ? envSlots(env).map(d => envDock * 24 + d) : []
  const per: Combined[] = Array.from({ length: beats + 1 }, () => new Map())
  const tally = newSparseTally()

  for (const p of cut) {
    const slots = [...p.ts.map(([x, j]) => lineSlot(ball, x, j)), ...extra]
    const reg = options.cost ? lineRegister(ball, p.ts.map(t => t[0]), 1) : new Map<number, number>()
    // the start's amplitude in modeIndex order: the level's (line order, env in front) times the gauge
    const g = reorderParity(slots.map(s => jointKey(ball, offset, s)), slots.map(modeIndex)) === 1 ? -1 : 1

    let s: SparseState = sparseStart(slots, slots.map(() => 1), reg)

    for (let t = 0; t <= beats; t++) {
      if (t > 0) {
        s = sparseBeat(options, ball.tables, s, t - 1, tally)
      }

      for (const [key, term] of s) {
        const [ar, ai] = physical(term, clock)
        const o = per[t]!.get(key) ?? { slots: term.slots, values: term.values, reg: term.reg, re: 0, im: 0 }

        o.re += g * (p.re * ar - p.im * ai)
        o.im += g * (p.re * ai + p.im * ar)
        per[t]!.set(key, o)
      }
    }
  }

  const F: number[] = []
  const span: number[] = []
  const norm: number[] = []

  let offLine = 0
  let regOff = 0

  per.forEach(map => {
    const groups = new Map<string, ConeStore>()

    let nm = 0

    for (const term of map.values()) {
      const w = term.re ** 2 + term.im ** 2

      nm += w

      const lModes: number[] = []
      const envPart: string[] = []
      const lPos: number[] = []

      term.slots.forEach((slot, i) => {
        const k = jointKey(ball, offset, slot)

        if (k >= 0) {
          lModes.push(k)
          lPos.push((k >> 1) - offset)
        } else {
          envPart.push(`${slot}${term.values[i]! > 0 ? '+' : '-'}`)
        }
      })

      // l's links: ids dock * 24 + D0 for docks on l; the rest of the register goes with the env
      const lReg = new Map<number, number>()
      const envReg = new Map<number, number>()

      for (const [id, f] of term.reg) {
        if (id % 24 === D0 && ball.pos.has(Math.floor(id / 24))) {
          lReg.set(id, f)
        } else {
          envReg.set(id, f)
        }
      }

      if (options.cost && registerKey(lReg) !== registerKey(lineRegister(ball, lPos, 1))) {
        regOff++
      }

      if (lModes.length !== 3) {
        offLine += w
        continue
      }

      const g = reorderParity(Array.from(term.slots, s => jointKey(ball, offset, s)), Array.from(term.slots, modeIndex)) === 1 ? -1 : 1
      const key = `${envPart.join(',')}|${registerKey(envReg)}`

      let s = groups.get(key)

      if (!s) {
        s = coneStore(3, line, 1e6, clock)
        groups.set(key, s)
      }

      addAmp(s, Int32Array.from(lModes.sort((a, b) => a - b)), g * term.re, g * term.im)
    }

    let f = 0
    let sp = 0

    for (const s of groups.values()) {
      f += coneBoundCount(s, rd)
      sp += spanWeight(s, SPAN)
    }

    F.push(f)
    span.push(sp)
    norm.push(nm)
  })

  return { F, span, norm, offLine, regOff, frontier: tally.frontier, kFired: tally.kFired, terms: per[beats]!.size }
}

// ---- the dense gates ----

const wrap = (s: LockedState): CrossState => new Map([['0|', { e: 0, reg: new Map(), branches: s.branches }]])

// a dense start grouped by register: [slots, amplitude] per configuration
function denseStart(ball: Ball, configs: readonly { slots: number[]; a: bigint; reg: Register }[]): CrossState {
  const out: CrossState = new Map()

  for (const c of configs) {
    const key = `0|${registerKey(c.reg)}`
    const g = out.get(key) ?? { e: 0, reg: c.reg, branches: [] }

    g.branches.push(branchOf(ball.cells, c.slots, 1, c.a))
    out.set(key, g)
  }

  for (const g of out.values()) {
    g.branches = mergeBranches(g.branches)
  }

  return out
}

// the 20 configurations of 3 loves on the 6 modes of l at positions -1..1, each with amplitude 1 (signed by `sign`)
function lineConfigs(ball: Ball, extra: readonly number[], cost: boolean): { slots: number[]; a: bigint; reg: Register; ts: [number, number][] }[] {
  const modes: [number, number][] = []

  for (const p of [-1, 0, 1]) {
    modes.push([p, 0], [p, 1])
  }

  const out: { slots: number[]; a: bigint; reg: Register; ts: [number, number][] }[] = []

  for (let a = 0; a < 6; a++) {
    for (let b = a + 1; b < 6; b++) {
      for (let c = b + 1; c < 6; c++) {
        const ts = [modes[a]!, modes[b]!, modes[c]!]

        out.push({
          slots: [...ts.map(([x, j]) => lineSlot(ball, x, j)), ...extra],
          a: 1n,
          reg: cost ? lineRegister(ball, ts.map(t => t[0]), 1) : new Map(),
          ts,
        })
      }
    }
  }

  return out
}

type DenseRun = { name: string; reverse: boolean; norm: boolean; gauss: number; sparse: number; branches: number }

function denseRun(name: string, ball: Ball, start: CrossState, options: CrossOptions, beats: number): DenseRun {
  let s = start
  let gauss = 0
  let sparse = 0
  let branches = 0

  const n0 = crossNorm(start)
  let sp: SparseState | undefined = options.place === 'split' ? sparseOf(start) : undefined
  const defects = new Set<string>()
  const defectKey = (m: Map<number, number>): string => registerKey(m)

  for (const g of start.values()) {
    for (const b of g.branches) {
      defects.add(defectKey(gaussDefect(ball.tables, b, g.reg)))
    }
  }

  // every start branch carries one defect map (none for a neutral start with its strings)
  if (options.cost && defects.size !== 1) {
    gauss += defects.size
  }

  const defect0 = [...defects][0] ?? ''

  for (let t = 0; t < beats; t++) {
    s = crossBeat(options, 'none', ball.tables, s, t)

    if (sp) {
      sp = sparseBeat(options, ball.tables, sp, t)
      sparse += sparseDiffer(sparseOf(s), sp)
    }

    if (options.cost) {
      for (const g of s.values()) {
        for (const b of g.branches) {
          if (defectKey(gaussDefect(ball.tables, b, g.reg)) !== defect0) {
            gauss++
          }
        }
      }
    }

    branches = Math.max(branches, [...s.values()].reduce((x, g) => x + g.branches.length, 0))
  }

  const n1 = crossNorm(s)
  const norm = n1.total * n0.unit === n0.total * n1.unit
  const spNorm = sp ? sparseNorm(sp) : undefined
  const sparseNormOk = spNorm ? spNorm.total * n0.unit === n0.total * spNorm.unit : true

  let back = s

  for (let t = beats - 1; t >= 0; t--) {
    back = crossBeatBack(options, 'none', ball.tables, back, t)
  }

  return {
    name,
    reverse: crossDiffer(back, start) === 0,
    norm: norm && sparseNormOk,
    gauss,
    sparse,
    branches,
  }
}

// R0: the pieces off are the working beat bit for bit
function offCheck(ball: Ball, start: CrossState, place: CoinPlace, beats: number): number {
  const was = currentCoinPlace()

  try {
    setCoinPlace(place)

    let a = start
    let b: LockedState = { branches: [...start.values()][0]!.branches }
    let off = 0

    for (let t = 0; t < beats; t++) {
      a = crossBeat({ ...OFF, place }, 'none', ball.tables, a, t)
      b = coinedVetoBeat('none', ball.tables, b, t)
      off += crossDiffer(a, wrap(b))
    }

    return off
  } finally {
    setCoinPlace(was)
  }
}

// R1: the pieces on one line equal bound-line-pieces (clock 14, coin before) after the gauge G
function reduction(ball: Ball, beats: number): { differ: number; regOff: number; branches: number } {
  const R = ball.radius
  const docks = Array.from({ length: 2 * R + 1 }, (_, i) => ball.dockAt.get(i - R)!)
  const line: BoundLine = {
    docks,
    first: D0,
    second: D0_BACK,
    position: new Map(docks.map((x, i) => [x, i])),
  }
  const configs = lineConfigs(ball, [], true)
  // mine in modeIndex order: amplitude G(x) times bound's
  const mine = denseStart(
    ball,
    configs.map(c => {
      const b = branchOf(ball.cells, c.slots, 1, 1n)

      return { ...c, a: gaugeLine(b, line.position, D0) === 1 ? -1n : 1n }
    }),
  )
  let theirs: BoundState = boundStart({ branches: configs.map(c => branchOf(ball.cells, c.slots, 1, 1n)) })
  let s = mine
  let differ = 0
  let regOff = 0
  let branches = 0

  for (let t = 0; t < beats; t++) {
    s = crossBeat({ sign: true, cost: true, clock: PI7, place: 'before' }, 'none', ball.tables, s, t)
    theirs = boundBeat({ cost: true, sign: true }, ball.tables, line, theirs, t)

    // compare per clock count: mine times G against theirs (cut trit 0)
    const byE = new Map<number, { a: Branch[]; b: Branch[] }>()

    for (const g of s.values()) {
      const o = byE.get(g.e) ?? { a: [], b: [] }

      for (const br of g.branches) {
        const p = new Map<number, number>()

        for (let i = 0; i < br.vibe.length; i++) {
          if (br.vibe[i] !== 0) {
            p.set(i, line.position.get(Math.floor(i / 24))! - R)
          }
        }

        const lp = [...p.values()]

        if (registerKey(g.reg) !== registerKey(lineRegister(ball, lp, 1))) {
          regOff++
        }

        const c = { ...br, vibe: Int8Array.from(br.vibe), open: Uint8Array.from(br.open), point: Int8Array.from(br.point), store: Int8Array.from(br.store), spoint: Int8Array.from(br.spoint), sopen: Uint8Array.from(br.sopen) }

        if (gaugeLine(br, line.position, D0) === 1) {
          c.a = -c.a
          c.b = -c.b
        }

        o.a.push(c)
      }

      byE.set(g.e, o)
    }

    for (const g of theirs.values()) {
      if (g.c !== 0) {
        differ += g.branches.length
        continue
      }

      const o = byE.get(g.e) ?? { a: [], b: [] }

      o.b.push(...g.branches)
      byE.set(g.e, o)
    }

    for (const { a, b } of byE.values()) {
      const neg = b.map(x => ({ ...x, vibe: Int8Array.from(x.vibe), open: Uint8Array.from(x.open), point: Int8Array.from(x.point), store: Int8Array.from(x.store), spoint: Int8Array.from(x.spoint), sopen: Uint8Array.from(x.sopen), a: -x.a, b: -x.b }))

      differ += mergeBranches([...a, ...neg]).length
    }

    branches = Math.max(branches, [...s.values()].reduce((x, g) => x + g.branches.length, 0))
  }

  return { differ, regOff, branches }
}

// R5: C (every vibe to its opposite, every trit to its negative) commutes with the beat with the pieces on
function conjugate(s: CrossState): CrossState {
  const out: CrossState = new Map()

  for (const g of s.values()) {
    const reg = new Map([...g.reg].map(([l, f]) => [l, 3 - f]))
    const branches = g.branches.map(b => ({ ...b, vibe: Int8Array.from(b.vibe, v => -v), open: Uint8Array.from(b.open), point: Int8Array.from(b.point), store: Int8Array.from(b.store), spoint: Int8Array.from(b.spoint), sopen: Uint8Array.from(b.sopen) }))

    out.set(`${g.e}|${registerKey(reg)}`, { e: g.e, reg, branches })
  }

  return out
}

function cCheck(ball: Ball, start: CrossState, beats: number): number {
  let a = start
  let b = conjugate(start)
  let off = 0

  for (let t = 0; t < beats; t++) {
    a = crossBeat(ON, 'none', ball.tables, a, t)
    b = crossBeat(ON, 'none', ball.tables, b, t)
    off += crossDiffer(conjugate(a), b)
  }

  return off
}

// ---- settings ----

type Setting = {
  name: 'smoke' | 'full'
  box: number
  levelBar: number
  W: number
  armRadius: number
  reductionRadius: number
  reductionBeats: number
  denseBeats: number
}

const SMOKE: Setting = { name: 'smoke', box: 8, levelBar: 1e-4, W: 10, armRadius: 2, reductionRadius: 2, reductionBeats: 1, denseBeats: 1 }
// the smoke with the arms on the R = 3 ball, exact through beat 2 for this start (r0 + t = 3 = R: no stream leaves the
// frontier shell before beat 3), to check X0's instruments before the full run; open by rule
const MID: Setting = { ...SMOKE, armRadius: 3 }
const FULL: Setting = { name: 'full', box: 12, levelBar: 1e-9, W: 12, armRadius: 4, reductionRadius: 3, reductionBeats: 2, denseBeats: 2 }

const widthOf = (W: number, fit: readonly Placed[]): number =>
  W + Math.max(...fit.flatMap(p => p.ts.map(t => t[0])))

const f4 = (x: number): string => (Number.isFinite(x) ? x.toFixed(4) : String(x))

export default experiment({
  id: 'selves/bulk-self',
  code: 'E-SLF-0186',
  title:
    "a self across lines: B1's bound cluster on its honeycomb line with W0's env at a shared dock, so the collision K moves vibes between lines, under the working rule plus a board proposal's cross-line fermion sign and S1 link register at pi/9 (opt-in), read on the line engine with K's block (option C) and checked on the exact R = 4 ball",
  category: 'selves',
  substrates: ['3434'],
  depth: 'L2',
  paper: false,
  run() {
    const started = Date.now()
    const setting = process.env.BULK_SWEEP === 'full' ? FULL : process.env.BULK_SWEEP === 'mid' ? MID : SMOKE
    const log = (what: string): void =>
      console.error(`${what} ${Math.round((Date.now() - started) / 1000)}s`)
    const env = findEnv()

    // ---- C1, the level ----
    const basis = lineBasis({ flavors: [0, 0, 0], statistics: 'fermion', D: 3, box: setting.box, unit: 0 })
    const level = lineLightest(basis, wholeBasis(basis)).lightest
    const placed = levelPlacement(basis, level.cre, level.cim)
    const levelOff = Math.abs(level.unwrapped - RECORDED.energy)
    const gC1 = levelOff <= setting.levelBar

    log('C1')

    // ---- the line engine: B0 (clock 14 against 0020), P0 (clock 18) ----
    const { W } = setting
    const read = Math.floor((W - 1) / 2)
    const fit = fitRing(placed, W).kept
    const width = widthOf(W, fit)
    const line = Math.max(64, width + 2 * WINDOW + 8)
    const offset = WINDOW + 2
    const rd = lineReader(placed, line, read, false)
    const make = (clock: number): ConeStore =>
      coneStart({ n: 3, line, cap: 1e8, W, placed: fit, bath: [], offset, clock }).store
    const lineRun = (clock: number) =>
      crossDockRun({ start: make(clock), X: 0, env: undefined, beats: WINDOW, rd, collision: 'pass', spanBar: SPAN })
    const b0 = lineRun(PI7)
    const LB0 = b0.F.map(f => f / b0.F[0]!)
    const gB0 = setting.name === 'smoke' || L_0020.every((x, i) => Math.abs(LB0[i + 1]! - x) <= B0_TOL)
    const p0 = lineRun(PI9)
    const LP0 = p0.F.map(f => f / p0.F[0]!)
    const gP0 = LP0[WINDOW]! >= HOLD

    log(`B0 L ${LB0.map(f4).join(' ')}; P0 L ${LP0.map(f4).join(' ')}`)

    // the D = 4 level at pi/9, information only
    let d4 = 'not read'

    try {
      const b4 = lineBasis({ flavors: [0, 0, 0], statistics: 'fermion', D: 4, box: setting.box, unit: 0 })
      const lv4 = lineLightest(b4, wholeBasis(b4)).lightest
      const pl4 = levelPlacement(b4, lv4.cre, lv4.cim)
      const fit4 = fitRing(pl4, W).kept
      const line4 = Math.max(64, widthOf(W, fit4) + 2 * WINDOW + 8)
      const r4 = crossDockRun({
        start: coneStart({ n: 3, line: line4, cap: 1e8, W, placed: fit4, bath: [], offset, clock: PI9 }).store,
        X: 0,
        env: undefined,
        beats: WINDOW,
        rd: lineReader(pl4, line4, read, false),
        collision: 'pass',
        spanBar: SPAN,
      })

      d4 = `energy ${lv4.unwrapped.toFixed(6)}, L ${r4.F.map(f => f4(f / r4.F[0]!)).join(' ')}`
    } catch (err) {
      d4 = `failed: ${(err as Error).message}`
    }

    log('D4')

    // ---- the dense gates R0..R5 ----
    const b1 = ballOf(1)
    const b2 = ballOf(2)
    const cutR1 = lineConfigs(b1, [], true)
    const lineR1On = denseStart(b1, cutR1)
    const bulkR1On = denseStart(b1, lineConfigs(b1, envSlots(env), true))
    const w0 = (ball: Ball, cost: boolean): CrossState =>
      denseStart(ball, [{ slots: [D0, ...envSlots(env)], a: 1n, reg: new Map() }].map(c => ({ ...c, reg: cost ? c.reg : new Map() })))
    const lineR2On = denseStart(b2, lineConfigs(b2, [], true))
    const db = setting.denseBeats

    const r0 =
      offCheck(b1, denseStart(b1, lineConfigs(b1, envSlots(env), false)), 'split', db) +
      offCheck(b1, denseStart(b1, lineConfigs(b1, envSlots(env), false)), 'before', db) +
      offCheck(b2, w0(b2, false), 'split', db) +
      offCheck(b2, w0(b2, false), 'before', db)
    const gR0 = r0 === 0

    log(`R0 ${r0}`)

    const runs: DenseRun[] = [
      denseRun('R1 line split', b1, lineR1On, ON, db),
      denseRun('R1 bulk split', b1, bulkR1On, ON, db),
      denseRun('R1 bulk before', b1, bulkR1On, { ...ON, place: 'before' }, db),
      denseRun('R1 bulk off', b1, denseStart(b1, lineConfigs(b1, envSlots(env), false)), OFF, db),
      denseRun('R2 line split', b2, lineR2On, ON, db),
      denseRun('R2 W0 split', b2, w0(b2, true), ON, db),
      denseRun('R2 W0 before', b2, w0(b2, true), { ...ON, place: 'before' }, db),
    ]
    const gR2 = runs.every(r => r.reverse && r.norm)
    const gR3 = runs.every(r => r.gauss === 0)
    const gR4 = runs.every(r => r.sparse === 0)

    log(`R2-R4 ${runs.map(r => `${r.name} rev ${r.reverse} norm ${r.norm} gauss ${r.gauss} sparse ${r.sparse} (${r.branches})`).join('; ')}`)

    const red = reduction(ballOf(setting.reductionRadius), setting.reductionBeats)
    const gR1 = red.differ === 0 && red.regOff === 0

    log(`R1 differ ${red.differ} regOff ${red.regOff} (${red.branches})`)

    const cOff = cCheck(b1, bulkR1On, db) + cCheck(b2, w0(b2, true), db)
    const gR5 = cOff === 0

    log(`R5 ${cOff}`)

    // ---- the ball arms and X0 ----
    const cut = cutLevel(placed)
    const armLine = 2 * setting.armRadius + 2 * WINDOW + 16
    const armOff = setting.armRadius + WINDOW + 4
    const ball = ballOf(setting.armRadius)

    log('ball')

    const arms = {
      line: ballArm(ball, cut, undefined, ON, WINDOW, rd, armOff, armLine),
      bulk: ballArm(ball, cut, env, ON, WINDOW, rd, armOff, armLine),
      lineA: ballArm(ball, cut, undefined, OFF, WINDOW, rd, armOff, armLine),
      bulkA: ballArm(ball, cut, env, OFF, WINDOW, rd, armOff, armLine),
    }

    log('arms')

    const coneCut = (withEnv: boolean) =>
      crossDockRun({ start: cutCone(cut, armOff, armLine, PI9), X: armOff, env: withEnv ? env : undefined, beats: WINDOW, rd, collision: 'pass', spanBar: SPAN })
    const cLine = coneCut(false)
    const cBulk = coneCut(true)
    const diff = (a: number[], b: number[]): number => Math.max(...a.map((x, i) => Math.abs(x - (b[i] ?? Infinity))))
    const x0 = {
      line: Math.max(diff(arms.line.F, cLine.F), diff(arms.line.span, cLine.span)),
      bulk: Math.max(diff(arms.bulk.F, cBulk.F), diff(arms.bulk.span, cBulk.span)),
    }
    const exactWindow = setting.armRadius >= 1 + WINDOW + 1
    const gX0 =
      x0.line <= X0_TOL &&
      (cBulk.exported > 0 ? arms.bulk.F.every((f, i) => cBulk.F[i]! <= f + X0_TOL) : x0.bulk <= X0_TOL) &&
      arms.line.offLine === 0 && arms.bulk.offLine === 0 &&
      arms.line.regOff === 0 && arms.bulk.regOff === 0 &&
      arms.bulk.kFired > 0 && cBulk.fired > 0 && arms.line.kFired === 0 &&
      (!exactWindow || (arms.line.frontier === 0 && arms.bulk.frontier === 0))

    log(`X0 line ${x0.line.toExponential(1)} bulk ${x0.bulk.toExponential(1)}`)

    // X0b (added after the gate line, REPORTED, NOT GATING): the cut level holds no lone love at dock 0 (its weight
    // sits on a full dock at one end and a single at the other), so in X0's bulk arm K fires only on terms of numerical
    // zero weight. Here the env sits at the cut's own lone dock (X*'s rule on the cut start), so K fires with weight
    const cutLone = loneWeights(cutCone(cut, armOff, armLine, PI9))
    const cutX = [...cutLone.entries()].sort((a, b) => b[1] - a[1] || a[0] - b[0])[0]![0]
    const armK = ballArm(ball, cut, env, ON, WINDOW, rd, armOff, armLine, cutX - armOff)
    const cK = crossDockRun({ start: cutCone(cut, armOff, armLine, PI9), X: cutX, env, beats: WINDOW, rd, collision: 'pass', spanBar: SPAN })
    const x0b = Math.max(diff(armK.F, cK.F), diff(armK.span, cK.span))

    log(`X0b dock ${cutX - armOff}: ${x0b.toExponential(1)}, fired ${cK.fired.toExponential(2)}`)

    // ---- the main read: B1's full level, K at a shared dock X ----
    const lone = loneWeights(make(PI9))
    const top = Math.max(...lone.values())
    const xs = [...lone.entries()].filter(([, w]) => w >= 1e-3 * top).map(([x]) => x).sort((a, b) => a - b)
    const xStar = [...lone.entries()].sort((a, b) => b[1] - a[1] || a[0] - b[0])[0]![0]
    const mainAt = (X: number) => {
      const r = crossDockRun({ start: make(PI9), X, env, beats: WINDOW, rd, collision: 'pass', spanBar: SPAN })

      return { X, L: r.F.map(f => f / r.F[0]!), exported: r.exported, fired: r.fired, envs: r.envs }
    }
    const main = mainAt(xStar)
    const sweep = xs.map(mainAt)
    const worst = sweep.reduce((m, r) => (r.L[WINDOW]! < m.L[WINDOW]! ? r : m), main)

    log(`main X* ${xStar} L ${main.L.map(f4).join(' ')}`)

    const instrument = gC1 && gB0 && gR0 && gR1 && gR2 && gR3 && gR4 && gR5 && gX0
    const LC = main.L[WINDOW]!
    const LL = LP0[WINDOW]!
    const status: 'pass' | 'fail' | 'open' =
      setting.name === 'smoke' || !instrument || !gP0
        ? 'open'
        : LC < LL - MARGIN || (LC < HOLD && LL >= HOLD)
          ? 'fail'
          : LC >= HOLD
            ? 'pass'
            : 'open'
    const Lof = (a: ArmRead): number[] => a.F.map(f => f / a.F[0]!)
    const Sof = (a: ArmRead): number[] => a.span.map(f => f / a.span[0]!)

    const metrics: Record<string, number> = {
      gate_C1: gC1 ? 1 : 0,
      gate_B0: gB0 ? 1 : 0,
      gate_P0: gP0 ? 1 : 0,
      gate_R0: gR0 ? 1 : 0,
      gate_R1: gR1 ? 1 : 0,
      gate_R2: gR2 ? 1 : 0,
      gate_R3: gR3 ? 1 : 0,
      gate_R4: gR4 ? 1 : 0,
      gate_R5: gR5 ? 1 : 0,
      gate_X0: gX0 ? 1 : 0,
      levelOff,
      B0_L1: LB0[1]!,
      B0_L2: LB0[2]!,
      P0_L1: LP0[1]!,
      P0_L2: LL,
      main_X: xStar,
      main_L1: main.L[1]!,
      main_L2: LC,
      main_fired: main.fired,
      main_exported: main.exported,
      worst_X: worst.X,
      worst_L2: worst.L[WINDOW]!,
      ball_line_L2: Lof(arms.line)[WINDOW]!,
      ball_bulk_L2: Lof(arms.bulk)[WINDOW]!,
      ball_lineA_L2: Lof(arms.lineA)[WINDOW]!,
      ball_bulkA_L2: Lof(arms.bulkA)[WINDOW]!,
      x0_line: x0.line,
      x0_bulk: x0.bulk,
      x0b: x0b,
      x0b_fired: cK.fired,
      seconds: (Date.now() - started) / 1000,
    }

    const arm = (name: string, a: ArmRead): string =>
      `${name}: L ${Lof(a).map(f4).join(' ')}, span ${Sof(a).map(f4).join(' ')}, norm ${a.norm.map(f4).join(' ')}, K fired ${a.kFired}, frontier ${a.frontier}, terms ${a.terms}`

    return verdict({
      status,
      claim: `${setting.name} setting, W ${W} k 3, window beats 0 to ${WINDOW}, S1 and the sign at pi/9 (clock 18). P0 line self L ${LP0.map(f4).join(' ')} (bar ${HOLD}); B0 at pi/7 L ${LB0.map(f4).join(' ')} against 0020's ${L_0020.join(' ')}. MAIN (option C, K at shared dock X* ${xStar - offset} of the start, env slot ${env.single} line ${env.full}): L ${main.L.map(f4).join(' ')}, K fired on weight ${f4(main.fired)}, exported ${main.exported.toExponential(1)}; over ${xs.length} docks L(2) from ${f4(worst.L[WINDOW]!)} (dock ${worst.X - offset}) up, profile ${sweep.map(r => `${r.X - offset}:${f4(r.L[WINDOW]!)}`).join(' ')}. Ball R ${setting.armRadius} cut start (${cut.length} configurations): ${arm('line arm', arms.line)} (instrument L ${cLine.F.map(f => f4(f / cLine.F[0]!)).join(' ')}) || ${arm('bulk arm', arms.bulk)} (instrument L ${cBulk.F.map(f => f4(f / cBulk.F[0]!)).join(' ')}, K fired weight ${cBulk.fired.toExponential(1)}) || X0b (reported, not gating; env at the cut's lone dock ${cutX - armOff}): ${arm('arm', armK)}, instrument L ${cK.F.map(f => f4(f / cK.F[0]!)).join(' ')}, K fired weight ${f4(cK.fired)}, exported ${cK.exported.toExponential(1)}, ball against instrument ${x0b.toExponential(1)} || control A ${arm('line', arms.lineA)} || ${arm('bulk', arms.bulkA)}. D = 4 level at pi/9 (information): ${d4}.`,
      metrics,
      notes: `L2. Setting ${setting.name}${setting.name === 'smoke' ? ' (proves the file runs; not evidence, status open by rule)' : ''}. Gates C1 ${gC1} (level off ${levelOff.toExponential(1)}), B0 ${gB0}, P0 ${gP0}, R0 ${gR0} (${r0} differing against coinedVetoBeat, pieces off, both places), R1 ${gR1} (reduction to bound-line-pieces at pi/7, coin before, R ${setting.reductionRadius}, ${setting.reductionBeats} beats: ${red.differ} differing, register off Q ${red.regOff}, ${red.branches} branches), R2 ${gR2}, R3 ${gR3}, R4 ${gR4} (${runs.map(r => `${r.name}: reverse ${r.reverse}, norm ${r.norm}, Gauss off ${r.gauss}, sparse differ ${r.sparse}, ${r.branches} branches`).join('; ')}), R5 ${gR5} (C off ${cOff}), X0 ${gX0} (ball against the line engine: line ${x0.line.toExponential(1)}, bulk ${x0.bulk.toExponential(1)}, instrument exported ${cBulk.exported.toExponential(1)}, K fired weight ${f4(cBulk.fired)}, off-line ${arms.line.offLine + arms.bulk.offLine}, register off ${arms.line.regOff + arms.bulk.regOff}, exact window ${exactWindow}). A board proposal is not adopted: the sign and S1 are opt-in pieces. The main read is a lower bound only where exported > 0. T (E-FND-0179) is not checked with the pieces on.`,
    })
  },
})
