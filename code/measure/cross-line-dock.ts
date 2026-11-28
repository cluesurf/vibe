// THE LINE ENGINE WITH K AT A SHARED DOCK. B1's cluster
// runs on its mesh line l in code/measure/cone-line (the working rule's line sector with the drift cost and the line
// block's sign, split coin, at the store's clock). At one dock X of l, a second mesh line m holds a single love and a
// third line m' a full pair (W0's dock, note/line-confinement.md section 2), so on beat 1 the collision at X is K = w_P
// wherever the cluster holds a single love at X, and K permutes the slots of l, m and m' together.
//
// THE INSTRUMENT (a lemma in the spirit of Lemma W, section 4 of the note). The pieces on l away from X are the line
// engine's. The env vibes (m's love, m''s pair) sit at X only before beat 1's stream; after it they run on lines through
// X, at docks off l (two mesh lines share at most one dock), and no beat brings one back to X before beat 3, so through
// beat 2 the collision at X on beat 1 is the only piece that reads l and the env together. Before it the env is a fixed
// state times its first half coin (m's love kept on its slot or moved to the other, D's keep and cross; m''s pair a
// phase common to every term). After it the env evolves on its own, so terms with different env states after the
// collision never meet again within the window: the cluster's F is the sum over env outcomes of F on each outcome's
// cluster store, exactly. A collision outcome that changes the number of loves on l leaves the P part (counted in
// `exported`, the reading is then a lower bound).
//
// THE ORDER for the sign: every mode off l first (in modeIndex order), then l's modes in line order (position, back
// slot first). A total order, so by the board proposal it gives the dynamics of the modeIndex order up to a fixed diagonal
// gauge; the env-only phases it adds are traced out with the env. The experiment checks the whole instrument against the
// exact R = 4 ball (code/measure/cross-ball) on a start that fits it.

import {
  addAmp,
  coneBeat,
  coneBoundCount,
  coneNorm,
  coneStore,
  eachConfiguration,
  halfPass,
  phasePass,
  streamInto,
  type ConeStore,
} from '@/code/measure/cone-line'
import { HALF_COIN, type LineReader } from '@/code/measure/cold-line'
import {
  BOUNCE_TABLE,
  bouncePermutation,
  type CollisionKind,
} from '@/code/rule/bounce-pair-knit'
import { localMode, reorderParity } from '@/code/rule/cross-line-pieces'
import { LINE_FIRSTS, LINE_OF, OPPOSITE } from '@/code/rule/isometric-knit'

// the shared dock's env: l's first slot (label 0, forward), m's single love's slot before the beat, m''s line
export type DockEnv = {
  readonly first: number
  readonly single: number
  readonly full: number
}

export type CrossDockRun = {
  // B1's bound count, the weight on configurations whose loves lie within `spanBar` docks, and the P part's norm, beats
  // 0 .. reach
  F: number[]
  span: number[]
  norm: number[]
  // weight sent off l's count by the collision at X; weight of the terms where K fired
  exported: number
  fired: number
  // the env outcomes after the collision
  envs: number
  reach: number
}

const PERM = new Int32Array(24)
const DOCK = new Int8Array(24)
const OFF = -1000

// the weight on configurations whose first and last love lie at most `bar` docks apart
export function spanWeight(s: ConeStore, bar: number): number {
  let w = 0

  eachConfiguration(s, (modes, re, im) => {
    const lo = modes[0]! >> 1
    const hi = modes[modes.length - 1]! >> 1

    if (hi - lo <= bar) {
      w += re * re + im * im
    }
  })

  return w
}

function read(stores: readonly ConeStore[], rd: LineReader, bar: number): [number, number, number] {
  let F = 0
  let span = 0
  let norm = 0

  for (const s of stores) {
    F += coneBoundCount(s, rd)
    span += spanWeight(s, bar)
    norm += coneNorm(s)
  }

  return [F, span, norm]
}

// the collision at X on every configuration of `a`, into one store per env outcome
function dockCollision(
  a: ConeStore,
  X: number,
  env: DockEnv,
  collision: CollisionKind,
): { stores: Map<string, ConeStore>; exported: number; fired: number } {
  const lineOfL = LINE_OF[env.first]!
  const second = OPPOSITE[env.first]!
  const envTerms: [number, number, number][] = [
    [env.single, HALF_COIN[0][0], HALF_COIN[0][1]],
    [OPPOSITE[env.single]!, HALF_COIN[1][0], HALF_COIN[1][1]],
  ]
  const fullSlots = [LINE_FIRSTS[env.full]!, OPPOSITE[LINE_FIRSTS[env.full]!]!]
  const stores = new Map<string, ConeStore>()
  const keyOf = (d: number): number =>
    LINE_OF[d] === lineOfL ? 2 * X + (d === env.first ? 1 : 0) : OFF + localMode(d)

  let exported = 0
  let fired = 0

  if (LINE_OF[env.single] === lineOfL || env.full === lineOfL || LINE_OF[env.single] === env.full) {
    throw new Error('cross-line-dock: l, m and m\' must be three different lines')
  }

  eachConfiguration(a, (modes, re, im) => {
    if (re === 0 && im === 0) {
      return
    }

    const atX: number[] = []
    const rest: number[] = []

    for (const md of modes) {
      if (md >> 1 === X) {
        atX.push(md)
      } else {
        rest.push(md)
      }
    }

    for (const [single, cr, ci] of envTerms) {
      DOCK.fill(0)

      for (const md of atX) {
        DOCK[(md & 1) === 1 ? env.first : second] = 1
      }

      DOCK[single] = 1

      for (const d of fullSlots) {
        DOCK[d] = 1
      }

      const kind = bouncePermutation(BOUNCE_TABLE, collision, DOCK, 0, PERM)

      let singles = 0

      for (let l = 0; l < 12; l++) {
        if ((DOCK[LINE_FIRSTS[l]!] !== 0) !== (DOCK[OPPOSITE[LINE_FIRSTS[l]!]!] !== 0)) {
          singles++
        }
      }

      const keys: number[] = [...rest]
      const images: number[] = [...rest]
      const newL: number[] = []
      const envAfter: number[] = []

      for (let d = 0; d < 24; d++) {
        if (DOCK[d] === 0) {
          continue
        }

        const to = kind === 0 ? d : PERM[d]!

        keys.push(keyOf(d))
        images.push(keyOf(to))

        if (LINE_OF[to] === lineOfL) {
          newL.push(keyOf(to))
        } else {
          envAfter.push(to)
        }
      }

      const ar = re * cr - im * ci
      const ai = re * ci + im * cr
      const w = ar * ar + ai * ai

      if (kind !== 0 && singles > 1) {
        fired += w
      }

      if (newL.length !== atX.length) {
        exported += w
        continue
      }

      const sg = reorderParity(keys, images) === 1 ? -1 : 1
      const key = envAfter.sort((p, q) => p - q).join(',')

      let s = stores.get(key)

      if (!s) {
        s = coneStore(a.n, a.line, a.cap, a.clock)
        stores.set(key, s)
      }

      addAmp(s, Int32Array.from([...rest, ...newL].sort((p, q) => p - q)), sg * ar, sg * ai)
    }
  })

  return { stores, exported, fired }
}

// the run: `start` (used up) through `beats` beats, with the env at X on beat 1 (none: the plain line engine)
export function crossDockRun(input: {
  start: ConeStore
  X: number
  env: DockEnv | undefined
  beats: number
  rd: LineReader
  collision: CollisionKind
  spanBar: number
}): CrossDockRun {
  const { start, X, env, beats, rd, collision, spanBar } = input
  let stores: ConeStore[] = [start]

  const F: number[] = []
  const span: number[] = []
  const norm: number[] = []
  const push = (): void => {
    const [f, s, n] = read(stores, rd, spanBar)

    F.push(f)
    span.push(s)
    norm.push(n)
  }

  push()

  let exported = 0
  let fired = 0
  let reach = 0

  for (let t = 1; t <= beats; t++) {
    if (t === 1 && env) {
      halfPass(start)
      phasePass(start)

      const c = dockCollision(start, X, env, collision)

      exported = c.exported
      fired = c.fired
      stores = [...c.stores.values()].map(s => {
        halfPass(s)

        const b = coneStore(s.n, s.line, s.cap, s.clock)

        streamInto(s, b)

        return b
      })
    } else {
      stores = stores.map(s => {
        const b = coneStore(s.n, s.line, s.cap, s.clock)

        coneBeat(s, b, true)

        return b
      })
    }

    reach = t
    push()
  }

  return { F, span, norm, exported, fired, envs: stores.length, reach }
}

// the weight of each dock of the line holding exactly one love of `s`
export function loneWeights(s: ConeStore): Map<number, number> {
  const out = new Map<number, number>()

  eachConfiguration(s, (modes, re, im) => {
    const w = re * re + im * im

    if (w === 0) {
      return
    }

    for (let a = 0; a < modes.length; a++) {
      const x = modes[a]! >> 1
      const before = a > 0 && modes[a - 1]! >> 1 === x
      const after = a + 1 < modes.length && modes[a + 1]! >> 1 === x

      if (!before && !after) {
        out.set(x, (out.get(x) ?? 0) + w)
      }
    }
  })

  return out
}
