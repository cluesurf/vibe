// Conformance for code/rule/cross-line-pieces (board proposal 012, item vibe-roadmap-grounding-0021) and its sparse
// form code/measure/cross-ball, on the exact radius-1 and radius-2 balls:
//   - with both pieces off the beat is coinedVetoBeat (veto 'none') bit for bit, in both coin places
//   - on a one-line state the pieces equal code/rule/bound-line-pieces (clock 14, coin before) after the gauge G
//   - with both pieces on (clock 18) the beat runs back exactly and keeps the slices' summed norm exactly
//   - the register keeps Gauss's defect at every dock
//   - the sparse store equals the dense pieces
// The start that matters is W0's dock (note/line-confinement.md section 2): a single on l, a single on m and a full m',
// so the collision K = w_P fires and moves vibes between lines.

import { suite, check, equal, ok } from '@/test/code/harness'
import { lockedFresh } from '@/code/measure/doublet-locked-readings'
import { exactBallMesh } from '@/code/substrate/coxeter/exact-ball-mesh'
import {
  lockedTables,
  mergeBranches,
  type Branch,
  type LockedState,
  type LockedTables,
} from '@/code/rule/doublet-locked-knit'
import {
  coinedVetoBeat,
  currentCoinPlace,
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
  type CrossOptions,
  type CrossState,
  type Register,
} from '@/code/rule/cross-line-pieces'
import { boundBeat, boundStart, type BoundLine } from '@/code/rule/bound-line-pieces'
import { sparseBeat, sparseDiffer, sparseOf } from '@/code/measure/cross-ball'
import { BOUNCE_TABLE, bouncePermutation } from '@/code/rule/bounce-pair-knit'
import { LINE_FIRSTS, LINE_OF, OPPOSITE } from '@/code/rule/isometric-knit'

const D0 = LINE_FIRSTS[0]!
const D0_BACK = OPPOSITE[D0]!

type Ball = { cells: number; tables: LockedTables; dockAt: Map<number, number> }

const balls = new Map<number, Ball>()

function ballOf(radius: number): Ball {
  const known = balls.get(radius)

  if (known) {
    return known
  }

  const m = exactBallMesh({ radius })
  const f = lockedFresh({ mesh: m.mesh, store: new Int8Array(m.cells * 12) })
  const tables = lockedTables(f.weave, 'pass', new Int16Array(m.cells * 24).fill(f.weave.moves.identity))
  const dockAt = new Map<number, number>([[0, 0]])

  for (const [dir, step] of [[D0, 1], [D0_BACK, -1]] as const) {
    let x = m.mesh.neighbour(0, dir)
    let p = step

    while (x >= 0) {
      dockAt.set(p, x)
      x = m.mesh.neighbour(x, dir)
      p += step
    }
  }

  const b = { cells: m.cells, tables, dockAt }

  balls.set(radius, b)

  return b
}

function branchOf(cells: number, slots: readonly number[], a: bigint): Branch {
  const n = cells * 24
  const b: Branch = {
    vibe: new Int8Array(n),
    point: new Int8Array(n),
    open: new Uint8Array(n),
    store: new Int8Array(cells * 12),
    spoint: new Int8Array(cells * 12),
    sopen: new Uint8Array(cells * 12),
    a,
    b: 0n,
    k: 0,
  }

  for (const s of slots) {
    b.vibe[s] = 1
    b.open[s] = 1
  }

  return b
}

// W0's env: the first single slot s and full line m' where K at a dock with l single on D0 moves m' off its line
function w0Slots(): number[] {
  const dock = new Int8Array(24)
  const perm = new Int32Array(24)

  for (let s = 0; s < 24; s++) {
    if (LINE_OF[s] === LINE_OF[D0]) {
      continue
    }

    for (let lm = 0; lm < 12; lm++) {
      if (lm === LINE_OF[D0] || lm === LINE_OF[s]) {
        continue
      }

      dock.fill(0)
      dock[D0] = 1
      dock[s] = 1
      dock[LINE_FIRSTS[lm]!] = 1
      dock[OPPOSITE[LINE_FIRSTS[lm]!]!] = 1

      if (bouncePermutation(BOUNCE_TABLE, 'pass', dock, 0, perm) === 1 && LINE_OF[perm[LINE_FIRSTS[lm]!]!] !== lm) {
        return [D0, s, LINE_FIRSTS[lm]!, OPPOSITE[LINE_FIRSTS[lm]!]!]
      }
    }
  }

  throw new Error('no W0 dock')
}

const single = (b: Branch, reg: Register = new Map()): CrossState =>
  new Map([[`0|${registerKey(reg)}`, { e: 0, reg, branches: [b] }]])

const ON: CrossOptions = { sign: true, cost: true, clock: 18, place: 'split' }

function offEqualsWorking(place: CoinPlace): number {
  const ball = ballOf(1)
  const was = currentCoinPlace()

  try {
    setCoinPlace(place)

    let a = single(branchOf(ball.cells, w0Slots(), 1n))
    let b: LockedState = { branches: [branchOf(ball.cells, w0Slots(), 1n)] }
    let off = 0

    for (let t = 0; t < 2; t++) {
      a = crossBeat({ sign: false, cost: false, place }, 'none', ball.tables, a, t)
      b = coinedVetoBeat('none', ball.tables, b, t)
      off += crossDiffer(a, new Map([['0|', { e: 0, reg: new Map(), branches: b.branches }]]))
    }

    return off
  } finally {
    setCoinPlace(was)
  }
}

function roundTrip(place: CoinPlace): { back: number; norm: boolean; gauss: number } {
  const ball = ballOf(1)
  const start = single(branchOf(ball.cells, w0Slots(), 1n))
  const o = { ...ON, place }
  const d0 = registerKey(gaussDefect(ball.tables, start.values().next().value!.branches[0]!, new Map()))

  let s = start
  let gauss = 0

  for (let t = 0; t < 2; t++) {
    s = crossBeat(o, 'none', ball.tables, s, t)

    for (const g of s.values()) {
      for (const b of g.branches) {
        if (registerKey(gaussDefect(ball.tables, b, g.reg)) !== d0) {
          gauss++
        }
      }
    }
  }

  const n0 = crossNorm(start)
  const n1 = crossNorm(s)

  for (let t = 1; t >= 0; t--) {
    s = crossBeatBack(o, 'none', ball.tables, s, t)
  }

  return { back: crossDiffer(s, start), norm: n1.total * n0.unit === n0.total * n1.unit, gauss }
}

function reduction(): number {
  const ball = ballOf(2)
  const docks = [-2, -1, 0, 1, 2].map(p => ball.dockAt.get(p)!)
  const line: BoundLine = { docks, first: D0, second: D0_BACK, position: new Map(docks.map((x, i) => [x, i])) }
  const modes: [number, number][] = []

  for (const p of [-1, 0, 1]) {
    modes.push([p, 0], [p, 1])
  }

  const mine: CrossState = new Map()
  const theirs: Branch[] = []

  for (let a = 0; a < 6; a++) {
    for (let b = a + 1; b < 6; b++) {
      for (let c = b + 1; c < 6; c++) {
        const ts = [modes[a]!, modes[b]!, modes[c]!]
        const slots = ts.map(([p, j]) => ball.dockAt.get(p)! * 24 + (j === 0 ? D0 : D0_BACK))
        const reg = new Map<number, number>()
        const ps = ts.map(t => t[0])

        for (let p = Math.min(...ps); p < Math.max(...ps); p++) {
          const f = ps.filter(x => x <= p).length % 3

          if (f !== 0) {
            reg.set(ball.dockAt.get(p)! * 24 + D0, f)
          }
        }

        const br = branchOf(ball.cells, slots, 1n)
        const key = `0|${registerKey(reg)}`
        const g = mine.get(key) ?? { e: 0, reg, branches: [] }

        g.branches.push(branchOf(ball.cells, slots, gaugeLine(br, line.position, D0) === 1 ? -1n : 1n))
        mine.set(key, g)
        theirs.push(br)
      }
    }
  }

  const a = crossBeat({ sign: true, cost: true, clock: 14, place: 'before' }, 'none', ball.tables, mine, 0)
  const b = boundBeat({ cost: true, sign: true }, ball.tables, line, boundStart({ branches: theirs }), 0)
  const byE = new Map<number, Branch[]>()

  for (const g of a.values()) {
    for (const br of g.branches) {
      const c = { ...br }

      if (gaugeLine(br, line.position, D0) === 1) {
        c.a = -c.a
        c.b = -c.b
      }

      byE.set(g.e, [...(byE.get(g.e) ?? []), c])
    }
  }

  let differ = 0

  for (const g of b.values()) {
    if (g.c !== 0) {
      differ += g.branches.length
      continue
    }

    byE.set(g.e, [...(byE.get(g.e) ?? []), ...g.branches.map(x => ({ ...x, a: -x.a, b: -x.b }))])
  }

  for (const list of byE.values()) {
    differ += mergeBranches(list.map(x => ({ ...x, vibe: Int8Array.from(x.vibe), open: Uint8Array.from(x.open), point: Int8Array.from(x.point), store: Int8Array.from(x.store), spoint: Int8Array.from(x.spoint), sopen: Uint8Array.from(x.sopen) }))).length
  }

  return differ
}

function sparseEqualsDense(): number {
  const ball = ballOf(1)

  let d = single(branchOf(ball.cells, w0Slots(), 1n))
  let s = sparseOf(d)
  let off = 0

  for (let t = 0; t < 2; t++) {
    d = crossBeat(ON, 'none', ball.tables, d, t)
    s = sparseBeat(ON, ball.tables, s, t)
    off += sparseDiffer(sparseOf(d), s)
  }

  return off
}

suite('rule/cross-line-pieces', [
  check('both pieces off are the working beat (coin before)', () => {
    equal(offEqualsWorking('before'), 0, 'differing branches')
  }),
  check('both pieces off are the working beat (split coin)', () => {
    equal(offEqualsWorking('split'), 0, 'differing branches')
  }),
  check('on one line the pieces equal bound-line-pieces after the gauge', () => {
    equal(reduction(), 0, 'differing branches')
  }),
  check('the pieces on run back exactly and keep the norm (split)', () => {
    const r = roundTrip('split')

    equal(r.back, 0, 'differing after the round trip')
    ok(r.norm, 'summed norm kept')
    equal(r.gauss, 0, 'branches off Gauss')
  }),
  check('the pieces on run back exactly and keep the norm (coin before)', () => {
    const r = roundTrip('before')

    equal(r.back, 0, 'differing after the round trip')
    ok(r.norm, 'summed norm kept')
    equal(r.gauss, 0, 'branches off Gauss')
  }),
  check('the sign is active where K fires', () => {
    const ball = ballOf(1)
    const a = crossBeat(ON, 'none', ball.tables, single(branchOf(ball.cells, w0Slots(), 1n)), 0)
    const b = crossBeat({ ...ON, sign: false }, 'none', ball.tables, single(branchOf(ball.cells, w0Slots(), 1n)), 0)

    ok(crossDiffer(a, b) > 0, 'the sign changes some branch')
  }),
  check('the sparse store equals the dense pieces', () => {
    equal(sparseEqualsDense(), 0, 'differing entries')
  }),
])
