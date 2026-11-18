// The self reader's checks (E-SLF-0191, item vibe-roadmap-grounding-0029; note/self-reader.md): the exact R = 4 ball
// runs, W0's env, B1's level cut to 3 docks, the dock mixers' on-line blocks, and the lone love read on the line engine.
// The ball parts are E-SLF-0187's own (test/experiment/selves/self-reader.ts), moved here unchanged so the rerun shares
// them without importing an experiment; E-SLF-0187 keeps its copy as the record of item 0004.
//
// THE LONE LOVE ON THE LINE (S3', decision 005): one love has no flux link and no full dock, so B1's line rule runs it
// with no phase at all, as the free walk on the honeycomb line (line-transfer Lemma 2). A slot s of dock 0 lies on the
// line LINE_OF[s]; the love carries the forward label when s is that line's LINE_FIRSTS slot and the back label
// otherwise (the orientation cutOnBall gives the line along LINE_FIRSTS). c is read from the line engine run, c0 from
// the free-love null, over the same beats.

import type { Placed } from '@/code/measure/held-cluster'
import type { Coin } from '@/code/measure/cold-line'
import { ConeCap, addAmp, coneBeat, coneNorm, coneStore } from '@/code/measure/cone-line'
import type { DockEnv } from '@/code/measure/cross-line-dock'
import {
  newSparseTally,
  physical,
  sparseBeat,
  sparseStart,
  type SparseState,
} from '@/code/measure/cross-ball'
import { configsOf, freeNull, halfTime, regionRetention, type BallTerm } from '@/code/measure/self-reader'
import { lockedFresh } from '@/code/measure/doublet-locked-readings'
import { exactBallMesh } from '@/code/substrate/coxeter/exact-ball-mesh'
import { lockedTables, type LockedTables } from '@/code/rule/doublet-locked-knit'
import type { CrossOptions } from '@/code/rule/cross-line-pieces'
import { BOUNCE_TABLE, bouncePermutation } from '@/code/rule/bounce-pair-knit'
import { SWAP_ANGLE, type RingUnit } from '@/code/rule/swap-mixer'
import { LINE_FIRSTS, LINE_OF, OPPOSITE } from '@/code/rule/isometric-knit'

export const PI9 = 18
export const PI7 = 14
export const D0 = LINE_FIRSTS[0]!
export const LINE_L = LINE_OF[D0]!
export const BARE_RULE: CrossOptions = { sign: false, cost: false, clock: PI9, place: 'split' }

// ---- the dock mixers' on-line blocks (E-SLF-0185, note/line-confinement.md section 4) ----

export type Mixer = { name: string; lone: Coin; full: [number, number] }

const SQ3 = Math.sqrt(3)

function ringMixer(name: string, u: RingUnit): Mixer {
  const ur = (Number(u.num[0]) - Number(u.num[1]) / 2) / Number(u.den)
  const ui = ((Number(u.num[1]) * SQ3) / 2) / Number(u.den)
  const hr = (ur - 1) / 24
  const hi = ui / 24

  return {
    name,
    lone: [
      [1 + hr, hi],
      [hr, hi],
    ],
    full: [1 + 2 * hr, 2 * hi],
  }
}

export const MIXERS: readonly Mixer[] = [
  { name: 'F-G', lone: [[0.75, 0], [-0.25, 0]], full: [1, 0] },
  { name: 'F-L', lone: [[0.75, 0], [-0.25, 0]], full: [0.5, 0] },
  ringMixer('R-w', { num: [0n, 1n], den: 1n }),
  ringMixer('R-w2', { num: [-1n, -1n], den: 1n }),
  ringMixer('R-1', { num: [-1n, 0n], den: 1n }),
  ringMixer('R-star', SWAP_ANGLE),
]

// ---- the ball ----

export type Ball = {
  radius: number
  cells: number
  tables: LockedTables
  nb: (x: number, d: number) => number
}

export function ballOf(radius: number): Ball {
  const m = exactBallMesh({ radius })
  const cells = m.cells
  const f = lockedFresh({ mesh: m.mesh, store: new Int8Array(cells * 12) })
  const tables = lockedTables(
    f.weave,
    'pass',
    new Int16Array(cells * 24).fill(f.weave.moves.identity),
  )

  return { radius, cells, tables, nb: (x, d) => m.mesh.neighbour(x, d) }
}

// the docks of the mesh line through dock 0 along slot `dir`: position -> dock and dock -> position
export function lineDocks(ball: Ball, dir: number): { dockAt: Map<number, number>; pos: Map<number, number> } {
  const pos = new Map<number, number>([[0, 0]])

  for (const [d, step] of [[dir, 1], [OPPOSITE[dir]!, -1]] as const) {
    let x = ball.nb(0, d)
    let p = step

    while (x >= 0) {
      pos.set(x, p)
      x = ball.nb(x, d)
      p += step
    }
  }

  return { dockAt: new Map([...pos].map(([x, p]) => [p, x])), pos }
}

export type BallStart = { slots: number[]; values: number[]; re: number; im: number }

// the bare working rule (split coin) on the sparse ball from a sum of configurations: the terms at beats 0..beats
export function ballRun(ball: Ball, starts: readonly BallStart[], beats: number): { per: BallTerm[][]; kFired: number; frontier: number } {
  const per: Map<string, BallTerm>[] = Array.from({ length: beats + 1 }, () => new Map())
  const tally = newSparseTally()

  for (const p of starts) {
    let s: SparseState = sparseStart(p.slots, p.values, new Map())

    for (let t = 0; t <= beats; t++) {
      if (t > 0) {
        s = sparseBeat(BARE_RULE, ball.tables, s, t - 1, tally)
      }

      for (const [key, term] of s) {
        const [ar, ai] = physical(term, PI9)
        const o = per[t]!.get(key) ?? { slots: term.slots, values: term.values, re: 0, im: 0 }

        o.re += p.re * ar - p.im * ai
        o.im += p.re * ai + p.im * ar
        per[t]!.set(key, o)
      }
    }
  }

  return { per: per.map(m => [...m.values()]), kFired: tally.kFired, frontier: tally.frontier }
}

// W0's env: the first (s, m') in W0's search order where K at a dock with l single on D0 moves m' off its line
export function findEnv(): DockEnv {
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

  throw new Error('self-reader: no W0 env')
}

// B1's level cut to 3 docks (positions -1..1), renormalized (E-SLF-0186's cut start)
export type Cut = { ts: [number, number][]; re: number; im: number }[]

export function cutLevel(placed: readonly Placed[]): Cut {
  const kept = placed.filter(p => Math.max(...p.ts.map(t => t[0])) <= 2 && p.re ** 2 + p.im ** 2 > 0)
  const w = Math.sqrt(kept.reduce((s, p) => s + p.re ** 2 + p.im ** 2, 0))

  return kept.map(p => ({ ts: p.ts.map(([x, j]) => [x - 1, j] as [number, number]), re: p.re / w, im: p.im / w }))
}

// the cut start on the line through dock 0 along slot `fwd` (label 0 on fwd)
export function cutOnBall(ball: Ball, cut: Cut, fwd: number, value: number, reverse: boolean): { starts: BallStart[]; inRegion: (s: number) => boolean } {
  const { dockAt } = lineDocks(ball, fwd)
  const region = new Set([-1, 0, 1].map(p => dockAt.get(p)!))
  const starts = cut.map(p => {
    const slots = p.ts.map(([x, j]) => dockAt.get(x)! * 24 + (j === 0 ? fwd : OPPOSITE[fwd]!))

    return {
      slots: reverse ? [...slots].reverse() : slots,
      values: slots.map(() => value),
      re: p.re,
      im: p.im,
    }
  })

  return { starts, inRegion: s => region.has(Math.floor(s / 24)) }
}

// ---- the lone love on the line engine (S3') ----

export type LineLove = {
  // the slot of dock 0
  slot: number
  // the line engine mode the slot maps to (2x + 1 forward, 2x back)
  mode: number
  c: number[]
  c0: number[]
  tauC: number
  tau0: number
  // max |c - c0| over the beats
  off: number
  // max |norm - 1| of the line engine run
  norm: number
}

// a lone love from slot `slot` of dock 0 on the line engine (B1's line rule at `clock`, split), region its dock and the
// two line neighbours, beats 0..beats, on an open line of 2 beats + 12 docks from dock beats + 5
export function lineLove(slot: number, beats: number, clock = PI7): LineLove {
  const line = 2 * beats + 12
  const at = beats + 5
  const forward = LINE_FIRSTS[LINE_OF[slot]!] === slot
  const mode = 2 * at + (forward ? 1 : 0)
  let a = coneStore(1, line, 1e6, clock)

  addAmp(a, Int32Array.of(mode), 1, 0)

  const psi = configsOf(a)
  const r = [regionRetention(a, at - 1, at + 1)]
  let norm = Math.abs(coneNorm(a) - 1)

  for (let t = 1; t <= beats; t++) {
    const b = coneStore(a.n, a.line, a.cap, a.clock)

    try {
      coneBeat(a, b, true)
    } catch (err) {
      if (err instanceof ConeCap) {
        throw new Error(`self-reader: a lone love passed the cap at beat ${t}`)
      }

      throw err
    }

    a = b
    r.push(regionRetention(a, at - 1, at + 1))
    norm = Math.max(norm, Math.abs(coneNorm(a) - 1))
  }

  const c = r.map(x => x * x)
  const c0 = freeNull({ psi, line, lo: at - 1, hi: at + 1, beats }).r0.map(x => x * x)
  const off = c.reduce((m, x, i) => Math.max(m, Math.abs(x - c0[i]!)), 0)

  return { slot, mode, c, c0, tauC: halfTime(c), tau0: halfTime(c0), off, norm }
}
