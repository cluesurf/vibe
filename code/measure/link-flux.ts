// THE LINK-FLUX STRING (E-SPN-0149, E-SPN-0150): a Z3 electric flux held on each LINK of the mesh, carried and updated by
// the charges' own hops, with a cost of one phase per link that holds flux, per beat (the Kogut-Susskind electric term
// with no magnetic term). It replaces the separation costs of E-SPN-0146 (a phase per unit of d4Steps between the two
// charges) and E-SPN-0147 (a mixer angle set by d4Steps), which are read from both charges at once.
//
// THE REGISTER. A link joins x and x + r for a root r; its flux is a value mod 3 along a fixed orientation (from x to x
// + r for the twelve POSITIVE roots, the first nonzero coordinate positive). A charge q (a love +1, a fear -1 = 2 mod 3)
// that hops from x to x + r changes the flux along its own direction of motion by -q. So Gauss's law, div E = rho mod 3
// at every dock, is kept by every hop exactly (the change is -q out of x and +q into x + r), and a state that starts
// Gauss-legal stays Gauss-legal on every branch. A charge that stays (a store, a wall) changes nothing.
//
// ONE LINE (the 1d reduction). On a line Gauss's law fixes the flux from the charges (no flux at infinity): E(y, y + 1)
// = sum of the charges at x <= y, mod 3, so for a love and a fear the flux is 1 on the |d| links between them and 0
// elsewhere. The register holds no freedom, and its cost is the separation cost of string-binding's meson exactly.
// `lineRegisterRun` carries the register explicitly and `lineInstantRun` reads the cost from the positions; the two are
// the same map, which the experiment checks branch by branch.
//
// THE MESH (4d). The flux is NOT fixed by the charges: two paths to one dock leave two different flux patterns, so the
// register records the path. With the love as the origin, a Gauss-legal pattern the two charges can reach is the flux
// along a reduced word of roots from the love to the fear (a love that hops by s prepends s^-1, a fear that hops by t
// appends t, and a hop back along the last link cancels it), which is a path in the 24-regular tree (the Cayley tree of
// the free group on the twelve line generators, the universal cover of the D4 root graph). Two words are the same
// pattern only when a closed loop is run three times over (Z3), nine links at least, past every box run here; a word
// that runs one link twice holds flux 2 there and costs one link, so the COST is the number of links holding flux,
// which is at most the word's length. `wordSpace` enumerates the reduced words up to a length (the measurement box),
// with the one-beat transition for every slot pair, and checks on each word's own flux pattern that it is Gauss-legal,
// that no two words leave one pattern, and what it costs (exact integers). `fluxBeat` is the pair's beat on that space,
// `treeBeat` one member's with the far end fixed, and `radialBeat` the same member reduced by the tree's symmetry.
//
// DETERMINISM: no random numbers. EXACT: the register is integers mod 3, the cost an integer count. NOTHING MOVES: the
// register is a value on a link, changed by the charges that cross it; the stream takes each slot's value one dock
// along.

import { flatBoxTables, ROOTS } from '@/code/measure/swap-sector'
import { fineCoin } from '@/code/measure/coined-line-bloch'
import {
  applyVibe,
  blackmanHarris,
  CONTACT_STATES,
  STORE_BASE,
  type LevelRead,
  type Sparse,
  type VibeShape,
} from '@/code/measure/swap-string'
import { seaConfiguration } from '@/code/measure/pauli-mixer'
import {
  lockedState,
  sameConfiguration,
  type LockedState,
} from '@/code/rule/doublet-locked-knit'
import { swapMixedBeat, type RingUnit } from '@/code/rule/swap-mixer'

type C = [number, number]

const cmul = (x: C, y: C): C => [
  x[0] * y[0] - x[1] * y[1],
  x[0] * y[1] + x[1] * y[0],
]

// ---- one line ----

// a two-charge state on a line: love at x0 with label j0, fear at x1 with label j1 (label 0 steps +1, label 1 steps
// -1, as string-binding pairColumn), and, in the register form, the flux on every link of a window of the line
export type LineBranch = {
  x0: number
  x1: number
  j0: number
  j1: number
  flux: Int8Array | null
  amp: C
}

// the Gauss flux on the window's links (link y joins y and y + 1, y = lo .. lo + n - 1) for a love at x0 and a fear
// at x1: E(y) = sum of the charges at x <= y, mod 3
export function lineGauss(
  x0: number,
  x1: number,
  lo: number,
  n: number,
): Int8Array {
  const out = new Int8Array(n)

  for (let k = 0; k < n; k++) {
    const y = lo + k
    const q = (x0 <= y ? 1 : 0) - (x1 <= y ? 1 : 0)

    out[k] = ((q % 3) + 3) % 3
  }

  return out
}

const lineKey = (b: LineBranch): string =>
  `${b.x0},${b.j0},${b.x1},${b.j1}|${b.flux ? b.flux.join('') : ''}`

// one beat of the love-fear pair on a line with the fine coin (string-binding pairColumn in absolute coordinates, the
// same arithmetic in the same order): the cost phase exp(i angle(l)) of the CURRENT state (string-binding writes
// angle(l) = -pi l / N), the coin on each charge, the hop, and the measurement wall (a move that would take |x1 - x0|
// past `box` leaves both where they are with their labels flipped). In the REGISTER form l is the count of window links
// holding flux and every hop updates the flux of the link it crosses by -q along its direction; in the INSTANT form
// (flux null) l = |x1 - x0|
// (`fearCharge` is the fear's charge in the register's update, -1; a control passes the wrong sign)
export function lineBeat(
  state: readonly LineBranch[],
  fine: number,
  angle: (l: number) => number,
  box: number,
  lo: number,
  fearCharge = -1,
): LineBranch[] {
  const { keep, cross } = fineCoin(fine)
  const out = new Map<string, LineBranch>()

  for (const b of state) {
    let l = 0

    if (b.flux) {
      for (const f of b.flux) {
        if (f !== 0) {
          l++
        }
      }
    } else {
      l = Math.abs(b.x1 - b.x0)
    }

    const th = angle(l)
    const cost: C = [Math.cos(th), Math.sin(th)]
    const j0 = [b.j0, b.j1]

    for (let mask = 0; mask < 4; mask++) {
      const j = j0.map((v, t) => ((mask >> t) & 1 ? 1 - v : v))

      let a = cost

      for (let t = 0; t < 2; t++) {
        a = cmul(a, (mask >> t) & 1 ? cross : keep)
      }

      a = cmul(a, b.amp)

      const steps = j.map(v => (v === 0 ? 1 : -1))
      const y0 = b.x0 + (steps[0] as number)
      const y1 = b.x1 + (steps[1] as number)

      let next: LineBranch

      if (Math.abs(y1 - y0) > box) {
        next = {
          x0: b.x0,
          x1: b.x1,
          j0: 1 - j[0]!,
          j1: 1 - j[1]!,
          flux: b.flux ? Int8Array.from(b.flux) : null,
          amp: a,
        }
      } else {
        let flux: Int8Array | null = null

        if (b.flux) {
          flux = Int8Array.from(b.flux)

          // the love (+1) crosses the link between x0 and y0, the fear (-1) the link between x1 and y1: flux along the
          // direction of motion changes by -q, so along +x by -q (a step right) or +q (a step left)
          const hop = (x: number, s: number, q: number): void => {
            const k = (s > 0 ? x : x - 1) - lo

            if (k < 0 || k >= flux!.length) {
              throw new Error(
                'link-flux: a hop left the register window',
              )
            }

            flux![k] = (((flux![k]! + (s > 0 ? -q : q)) % 3) + 3) % 3
          }

          hop(b.x0, steps[0] as number, 1)
          hop(b.x1, steps[1] as number, fearCharge)
        }

        next = { x0: y0, x1: y1, j0: j[0]!, j1: j[1]!, flux, amp: a }
      }

      const key = lineKey(next)
      const had = out.get(key)

      if (had) {
        had.amp = [had.amp[0] + next.amp[0], had.amp[1] + next.amp[1]]
      } else {
        out.set(key, next)
      }
    }
  }

  return [...out.values()]
}

// the same states, keyed, for a comparison: the instant form's key and the register form's key with its flux dropped
export const lineStateKey = (b: LineBranch): string =>
  `${b.x0},${b.j0},${b.x1},${b.j1}`

// ONE COLUMN OF THE REGISTER FORM at total momentum K: a love at 0 and a fear at d with labels (j0, j1) and the Gauss
// flux on a window around them, one register beat, each branch read in the relative coordinate d' = x1 - x0 with the
// phase exp(-i K s0) of the love's step s0 (string-binding's convention: K rides on the love; a wall bounce steps
// nothing); `gauss` says each branch's register equals the Gauss flux of its own positions on the whole window
export function lineRegisterColumn(
  fine: number,
  angle: (l: number) => number,
  box: number,
  d: number,
  j0: number,
  j1: number,
  K: number,
  fearCharge = -1,
): {
  d: number
  j0: number
  j1: number
  re: number
  im: number
  gauss: boolean
}[] {
  const lo = Math.min(0, d) - 2
  const n = Math.abs(d) + 4
  const start: LineBranch = {
    x0: 0,
    x1: d,
    j0,
    j1,
    flux: lineGauss(0, d, lo, n),
    amp: [1, 0],
  }

  return lineBeat([start], fine, angle, box, lo, fearCharge).map(b => {
    const s0 = b.x0
    const a: C =
      s0 === 0
        ? b.amp
        : cmul(b.amp, [Math.cos(-K * s0), Math.sin(-K * s0)])
    const g = lineGauss(b.x0, b.x1, lo, n)
    const gauss = b.flux!.every((v, k) => v === g[k])

    return {
      d: b.x1 - b.x0,
      j0: b.j0,
      j1: b.j1,
      re: a[0],
      im: a[1],
      gauss,
    }
  })
}

// ---- the mesh: flux patterns relative to the love ----

// the positive root index (0 .. 11) and sign of each of the 24 roots
const POS_OF: { k: number; s: number }[] = (() => {
  const positive: number[] = []

  ROOTS.forEach((r, d) => {
    const first = r.find(x => x !== 0)!

    if (first > 0) {
      positive.push(d)
    }
  })

  return ROOTS.map(r => {
    const first = r.find(x => x !== 0)!
    const target = first > 0 ? r : r.map(x => -x)
    const k = positive.findIndex(p =>
      ROOTS[p]!.every((x, i) => x === target[i]),
    )

    return { k, s: first > 0 ? 1 : -1 }
  })
})()

const POSITIVE_ROOTS: readonly (readonly number[])[] = (() => {
  const out: (readonly number[])[] = []

  ROOTS.forEach((r, d) => {
    if ((POS_OF[d] as { k: number; s: number }).s > 0) {
      out[(POS_OF[d] as { k: number; s: number }).k] = r
    }
  })

  return out
})()

const OFF = 16
const BASE = 33

const pointCode = (p: readonly number[]): number =>
  (((p[0]! + OFF) * BASE + p[1]! + OFF) * BASE + p[2]! + OFF) * BASE +
  p[3]! +
  OFF

const pointOf = (code: number): number[] => {
  const out = [0, 0, 0, 0]

  let c = code

  for (let i = 3; i >= 0; i--) {
    out[i] = (c % BASE) - OFF
    c = Math.floor(c / BASE)
  }

  return out
}

// a pattern: sorted entries (point code * 12 + positive root) * 3 + value, value 1 or 2 (the flux along the positive
// orientation), the love at the origin
export type Pattern = number[]

const entryLink = (e: number): number => Math.floor(e / 3)
const entryValue = (e: number): number => e % 3

// the link a step from x along root d crosses: its code (the base point's code * 12 + the positive root) and the sign
// of d against the link's positive orientation (+1 along it, -1 against)
export function rootLink(
  x: readonly number[],
  d: number,
): { link: number; sign: number } {
  const { k, s } = POS_OF[d] as { k: number; s: number }
  const r = ROOTS[d]!
  // the link's base point: x for a positive root, x + r for a negative one (whose positive orientation runs back to x)
  const base = s > 0 ? x : x.map((v, i) => v + r[i]!)

  return { link: pointCode(base) * 12 + k, sign: s }
}

// the base point of a link code (its positive orientation runs from there along the link's positive root)
export const linkBase = (link: number): number[] =>
  pointOf(Math.floor(link / 12))

// the flux change of a charge q hopping from x along root d: -q along its motion
export function patternHop(
  p: Pattern,
  x: readonly number[],
  d: number,
  q: number,
): Pattern {
  const { link, sign } = rootLink(x, d)

  return patternAdd(p, link, sign > 0 ? -q : q)
}

// a pattern with `delta` (mod 3) added to one link, along the link's positive orientation
export function patternAdd(
  p: Pattern,
  link: number,
  delta0: number,
): Pattern {
  const delta = ((delta0 % 3) + 3) % 3
  const out: Pattern = []

  let placed = false

  for (const e of p) {
    const l = entryLink(e)

    if (l === link) {
      const v = (entryValue(e) + delta) % 3

      if (v !== 0) {
        out.push(l * 3 + v)
      }

      placed = true
      continue
    }

    if (!placed && l > link) {
      if (delta !== 0) {
        out.push(link * 3 + delta)
      }

      placed = true
    }

    out.push(e)
  }

  if (!placed && delta !== 0) {
    out.push(link * 3 + delta)
  }

  return out
}

// the pattern moved by -r (the love moved by r, and is the origin again)
export function patternShift(
  p: Pattern,
  r: readonly number[],
): Pattern {
  const out = p.map(e => {
    const l = entryLink(e)
    const k = l % 12
    const pt = pointOf(Math.floor(l / 12)).map((v, i) => v - r[i]!)

    return (pointCode(pt) * 12 + k) * 3 + entryValue(e)
  })

  return out.sort((a, b) => a - b)
}

// the divergence of a pattern at every dock it touches, mod 3; Gauss's law for a love at the origin and a fear at
// `fear` asks +1 at the origin, -1 (2) at the fear, 0 elsewhere (0 everywhere when the two share a dock)
export function patternGauss(p: Pattern): {
  fear: number[]
  legal: boolean
} {
  const div = new Map<number, number>()

  const add = (code: number, v: number): void => {
    div.set(code, ((((div.get(code) ?? 0) + v) % 3) + 3) % 3)
  }

  for (const e of p) {
    const l = entryLink(e)
    const k = l % 12
    const a = pointOf(Math.floor(l / 12))
    const b = a.map((v, i) => v + POSITIVE_ROOTS[k]![i]!)
    const v = entryValue(e)

    add(pointCode(a), v)
    add(pointCode(b), -v)
  }

  const origin = pointCode([0, 0, 0, 0])
  const nonzero = [...div.entries()].filter(([, v]) => v !== 0)

  if (nonzero.length === 0) {
    return { fear: [0, 0, 0, 0], legal: true }
  }

  const at = (code: number): number => div.get(code) ?? 0
  const fears = nonzero.filter(([c, v]) => v === 2 && c !== origin)
  const legal =
    at(origin) === 1 && fears.length === 1 && nonzero.length === 2

  return {
    fear:
      fears.length === 1 ? pointOf(fears[0]![0]) : [NaN, NaN, NaN, NaN],
    legal,
  }
}

// two UTF-16 units per entry: a Map key
export const patternKey = (p: Pattern): string => {
  let s = ''

  for (const e of p) {
    s += String.fromCharCode(e & 0xffff, e >>> 16)
  }

  return s
}

// ---- the reduced words: the flux space ----
//
// A word is the list of roots from the love to the fear, reduced (no root followed by its opposite). Word codes are
// little-endian base 25 (letter + 1), so a word of at most 4 letters has a code under 25^4. `wordSpace` enumerates every
// reduced word of length at most `maxLength` and, for each, the flux pattern it leaves (a fear walked out along it from
// the love), with three exact checks: every pattern is Gauss-legal with the fear at the word's vector sum; no two words
// leave one pattern (so the word space IS the flux space, below the Z3 triple loop); and the cost is the pattern's link
// count. The pair's one-beat transition on the even words: the love hops along root l (prepends opp(l), or drops a
// first letter equal to l) and the fear along root f (appends f, or drops a last letter equal to opp(f)); -1 when the word passes `maxLength` (the weight is absorbed: the measurement box) and for l = f at contact (no
// state). The one-member transition (a member at the word's end, the far end fixed) on all words.

export const OPPOSITE: readonly number[] = ROOTS.map(r =>
  ROOTS.findIndex(o => o.every((x, k) => x === -r[k]!)),
)

export type WordSpace = {
  maxLength: number
  // every reduced word of length <= maxLength (one-member space), in order of length
  words: number
  letters: Int8Array
  length: Int8Array
  cost: Int32Array
  vector: Int32Array
  // the one-member transition: the member at the word's end hops along root d
  step: Int32Array
  // the two-member space: the even words, their index in `words`, the contact ones (vector sum 0) and their store blocks
  size: number
  even: Int32Array
  contactIndex: Int32Array
  contacts: number
  next: Int32Array
  prev: Int32Array
  // the exact checks
  gauss: boolean
  distinct: boolean
  costBelowLength: number
}

export function wordSpace(maxLength: number): WordSpace {
  const codeOf = (w: readonly number[]): number =>
    w.reduce((s, x, i) => s + (x + 1) * 25 ** i, 0)
  const lookup = new Int32Array(25 ** maxLength).fill(-1)
  const all: number[][] = [[]]

  lookup[0] = 0

  for (let len = 1; len <= maxLength; len++) {
    for (const w of all.filter(x => x.length === len - 1)) {
      for (let d = 0; d < 24; d++) {
        if (w.length > 0 && w[w.length - 1] === OPPOSITE[d]) {
          continue
        }

        const x = [...w, d]

        lookup[codeOf(x)] = all.length
        all.push(x)
      }
    }
  }

  const words = all.length
  const letters = new Int8Array(words * maxLength).fill(-1)
  const length = new Int8Array(words)
  const cost = new Int32Array(words)
  const vector = new Int32Array(words * 4)
  const keys = new Set<string>()

  let gauss = true
  let costBelowLength = 0

  all.forEach((w, i) => {
    length[i] = w.length
    w.forEach((d, k) => (letters[i * maxLength + k] = d))

    let p: Pattern = []

    const x = [0, 0, 0, 0]

    for (const d of w) {
      p = patternHop(p, x, d, -1)

      for (let k = 0; k < 4; k++) {
        x[k] = x[k]! + ROOTS[d]![k]!
      }
    }

    vector.set(x, i * 4)
    cost[i] = p.length

    if (p.length < w.length) {
      costBelowLength++
    }

    keys.add(patternKey(p))

    const g = patternGauss(p)

    if (!g.legal || g.fear.some((v, k) => v !== x[k])) {
      gauss = false
    }
  })

  const step = new Int32Array(words * 24).fill(-1)

  all.forEach((w, i) => {
    for (let d = 0; d < 24; d++) {
      const y =
        w.length > 0 && w[w.length - 1] === OPPOSITE[d]
          ? w.slice(0, -1)
          : [...w, d]

      if (y.length <= maxLength) {
        step[i * 24 + d] = lookup[codeOf(y)]!
      }
    }
  })

  const evenList: number[] = []

  all.forEach((w, i) => {
    if (w.length % 2 === 0) {
      evenList.push(i)
    }
  })

  const size = evenList.length
  const evenOf = new Int32Array(words).fill(-1)

  evenList.forEach((i, e) => (evenOf[i] = e))

  const contactIndex = new Int32Array(size).fill(-1)

  let contacts = 0

  evenList.forEach((i, e) => {
    if (
      vector[i * 4] === 0 &&
      vector[i * 4 + 1] === 0 &&
      vector[i * 4 + 2] === 0 &&
      vector[i * 4 + 3] === 0
    ) {
      contactIndex[e] = contacts++
    }
  })

  const next = new Int32Array(size * 576).fill(-1)

  evenList.forEach((i, e) => {
    const w = all[i]!
    const contact = contactIndex[e]! >= 0

    for (let f = 0; f < 24; f++) {
      const y =
        w.length > 0 && w[w.length - 1] === OPPOSITE[f]
          ? w.slice(0, -1)
          : [...w, f]

      for (let l = 0; l < 24; l++) {
        if (contact && l === f) {
          continue
        }

        const z =
          y.length > 0 && y[0] === l ? y.slice(1) : [OPPOSITE[l]!, ...y]

        if (z.length > maxLength) {
          continue
        }

        next[e * 576 + l * 24 + f] = evenOf[lookup[codeOf(z)]!]!
      }
    }
  })

  const prev = new Int32Array(size * 576).fill(-1)

  for (let e = 0; e < size; e++) {
    for (let k = 0; k < 576; k++) {
      const t = next[e * 576 + k]!

      if (t < 0) {
        continue
      }

      if (prev[t * 576 + k]! >= 0) {
        throw new Error(
          'link-flux: two words reach one word by one slot pair',
        )
      }

      prev[t * 576 + k] = e
    }
  }

  return {
    maxLength,
    words,
    letters,
    length,
    cost,
    vector,
    step,
    size,
    even: Int32Array.from(evenList),
    contactIndex,
    contacts,
    next,
    prev,
    gauss,
    distinct: keys.size === words,
    costBelowLength,
  }
}

// the flux pattern a word leaves (a fear walked out along it from the love at the origin)
export function wordPattern(s: WordSpace, i: number): Pattern {
  let p: Pattern = []

  const x = [0, 0, 0, 0]

  for (let k = 0; k < s.length[i]!; k++) {
    const d = s.letters[i * s.maxLength + k]!

    p = patternHop(p, x, d, -1)

    for (let a = 0; a < 4; a++) {
      x[a] = x[a]! + ROOTS[d]![a]!
    }
  }

  return p
}

// the even words by their pattern's key
export function patternIndex(s: WordSpace): Map<string, number> {
  const out = new Map<string, number>()

  for (let e = 0; e < s.size; e++) {
    out.set(patternKey(wordPattern(s, s.even[e]!)), e)
  }

  return out
}

// the one-beat transition read from the flux patterns themselves (patternHop and patternShift, the register's own
// update, not the word rule) for one even word and slot pair: the even word whose pattern results, or -1 when none in
// the box holds it. An instrument for `next`: the two must agree wherever `next` is defined
export function patternNext(
  s: WordSpace,
  index: Map<string, number>,
  e: number,
  l: number,
  f: number,
): number {
  const i = s.even[e]!
  const p = wordPattern(s, i)
  const y = [0, 1, 2, 3].map(a => s.vector[i * 4 + a]!)
  const q = patternShift(
    patternHop(patternHop(p, [0, 0, 0, 0], l, 1), y, f, -1),
    ROOTS[l]!,
  )

  return index.get(patternKey(q)) ?? -1
}

// ---- one member on a string to a static charge, on the tree: the radial chain ----
//
// A love tied by the link flux to a charge that never moves (the far end held fixed) walks on the tree of reduced
// words (the flux pattern is its path). Its one-vibe matrix A = c X (I + beta 1 1^T) followed by the stream is a
// FLIP-FLOP walk on that tree: the slot a vibe arrived in (slot d at the dock it reached along d) is the edge it came by,
// X sends it back along that edge, and I + beta 1 1^T mixes the 24 edges of a dock alike. Both are unchanged by every
// automorphism of the tree that fixes the root, so the sector symmetric under them is closed: at depth l >= 1 the
// amplitude on the parent edge (p) and the normalized symmetric amplitude on the 23 child edges (c); at depth 0 on the 24
// edges (c). One beat: (p, c) -> k (p + beta S, c + beta sqrt(n) S), S = p + sqrt(n) c (n = 23, or 24 with no p at the
// root), then each edge is crossed: the parent-edge amplitude reaches depth l - 1 on a child edge, the child-edge
// amplitude reaches depth l + 1 on its parent edge (the normalizations cancel: the weight is kept); then the string's
// phase exp(-i sigma l) at the new depth. `depth` walls the chain: an edge crossing past it is absorbed, or with
// `reflect` comes back on the edge it left by (a measurement box that keeps the chain unitary).
export function radialBeat(
  k: C,
  beta: C,
  sigma: number,
  depth: number,
  pr: Float64Array,
  pi: Float64Array,
  cr: Float64Array,
  ci: Float64Array,
  reflect = false,
): {
  pr: Float64Array
  pi: Float64Array
  cr: Float64Array
  ci: Float64Array
  lost: number
} {
  const npr = new Float64Array(depth + 1)
  const npi = new Float64Array(depth + 1)
  const ncr = new Float64Array(depth + 1)
  const nci = new Float64Array(depth + 1)

  let lost = 0

  for (let l = 0; l <= depth; l++) {
    const n = l === 0 ? 24 : 23
    const rn = Math.sqrt(n)
    const P: C = l === 0 ? [0, 0] : [pr[l]!, pi[l]!]
    const Cc: C = [cr[l]!, ci[l]!]
    const S: C = [P[0] + rn * Cc[0], P[1] + rn * Cc[1]]
    const bS = cmul(beta, S)
    const p1 = cmul(k, [P[0] + bS[0], P[1] + bS[1]])
    const c1 = cmul(k, [Cc[0] + rn * bS[0], Cc[1] + rn * bS[1]])

    // the parent edge is crossed to depth l - 1, arriving on a child edge there
    if (l > 0) {
      ncr[l - 1] = ncr[l - 1]! + p1[0]
      nci[l - 1] = nci[l - 1]! + p1[1]
    }

    // the child edges are crossed to depth l + 1, arriving on its parent edge
    if (l + 1 > depth) {
      if (reflect) {
        ncr[l] = ncr[l]! + c1[0]
        nci[l] = nci[l]! + c1[1]
      } else {
        lost += c1[0] * c1[0] + c1[1] * c1[1]
      }
    } else {
      npr[l + 1] = c1[0]
      npi[l + 1] = c1[1]
    }
  }

  for (let l = 0; l <= depth; l++) {
    const ph: C = [Math.cos(-sigma * l), Math.sin(-sigma * l)]
    const a = cmul(ph, [npr[l]!, npi[l]!])
    const b = cmul(ph, [ncr[l]!, nci[l]!])

    npr[l] = a[0]
    npi[l] = a[1]
    ncr[l] = b[0]
    nci[l] = b[1]
  }

  return { pr: npr, pi: npi, cr: ncr, ci: nci, lost }
}

// the adjacency spectral radius of the 24-regular tree over 24 (Kesten): 2 sqrt(23) / 24
export const KESTEN = (2 * Math.sqrt(23)) / 24

// ---- one member on the tree, the full word space (the radial chain's instrument) ----

// one beat of a lone member tied to a fixed charge at the root: A (the one-vibe shape, row 0 of `table`) on its 24
// slots at each word, then the stream (slot d moves the member's end along root d: `step`), then exp(-i sigma cost) of
// the word reached (cost = the pattern's links holding flux). States are words x 24; returns the weight past the box
export function treeBeat(
  s: WordSpace,
  table: Float64Array,
  sigma: number,
  re: Float64Array,
  im: Float64Array,
  ore: Float64Array,
  oim: Float64Array,
): number {
  const tr = new Float64Array(24)
  const ti = new Float64Array(24)

  let lost = 0

  ore.fill(0)
  oim.fill(0)

  for (let w = 0; w < s.words; w++) {
    let empty = true

    for (let d = 0; d < 24; d++) {
      if (re[w * 24 + d] !== 0 || im[w * 24 + d] !== 0) {
        empty = false
        break
      }
    }

    if (empty) {
      continue
    }

    applyVibe(table, 0, re, im, w * 24, 1, tr, ti, 0, 1)

    for (let d = 0; d < 24; d++) {
      const x = tr[d]!
      const y = ti[d]!
      const t = s.step[w * 24 + d]!

      if (t < 0) {
        lost += x * x + y * y
        continue
      }

      const ph = -sigma * s.cost[t]!
      const c = Math.cos(ph)
      const sn = Math.sin(ph)

      ore[t * 24 + d] = ore[t * 24 + d]! + x * c - y * sn
      oim[t * 24 + d] = oim[t * 24 + d]! + x * sn + y * c
    }
  }

  return lost
}

// the radial chain's (p, c) read off a full word state, depth by depth: p = sqrt(N_l) times the parent-edge amplitude
// (the slot equal to the word's last letter), c = sqrt(n N_l) times a child-edge amplitude, with the largest spread of
// either over the words of one depth and the slots of one kind (0 for a state in the symmetric sector)
export function radialOf(
  s: WordSpace,
  re: Float64Array,
  im: Float64Array,
): {
  pr: Float64Array
  pi: Float64Array
  cr: Float64Array
  ci: Float64Array
  spread: number
} {
  const D = s.maxLength
  const pr = new Float64Array(D + 1)
  const pi = new Float64Array(D + 1)
  const cr = new Float64Array(D + 1)
  const ci = new Float64Array(D + 1)
  const seen = new Uint8Array(D + 1)

  let spread = 0

  for (let w = 0; w < s.words; w++) {
    const l = s.length[w]!
    const N = l === 0 ? 1 : 24 * 23 ** (l - 1)
    const n = l === 0 ? 24 : 23
    const last = l === 0 ? -1 : s.letters[w * s.maxLength + l - 1]!

    let parent: C = [0, 0]
    let child: C | null = null

    for (let d = 0; d < 24; d++) {
      const a: C = [re[w * 24 + d]!, im[w * 24 + d]!]

      if (d === last) {
        parent = [a[0] * Math.sqrt(N), a[1] * Math.sqrt(N)]
        continue
      }

      const scaled: C = [
        a[0] * Math.sqrt(n * N),
        a[1] * Math.sqrt(n * N),
      ]

      if (child === null) {
        child = scaled
      } else {
        spread = Math.max(
          spread,
          Math.hypot(scaled[0] - child[0], scaled[1] - child[1]),
        )
      }
    }

    const c0 = child!

    if (!seen[l]) {
      seen[l] = 1
      pr[l] = parent[0]
      pi[l] = parent[1]
      cr[l] = c0[0]
      ci[l] = c0[1]
    } else {
      spread = Math.max(
        spread,
        Math.hypot(parent[0] - pr[l]!, parent[1] - pi[l]!),
        Math.hypot(c0[0] - cr[l]!, c0[1] - ci[l]!),
      )
    }
  }

  return { pr, pi, cr, ci, spread }
}

// ---- the pair on the flux space ----
//
// THE FLUX MESON: code/measure/swap-string's meson with the relative position replaced by the reduced word. Off contact
// both charges take the one-vibe shape (swap-string applyVibe, the same arithmetic), at a contact word (vector sum 0: the
// two share a dock, whatever loop of flux lies between them) the pair takes the contact map of the beat's parity
// (swap-string contactDockExact) on its 576 slot pairs and 24 stores; then the stream (next), with the phase exp(-i K .
// (r_l + r_f) / 2) of the centre's step, and the string: exp(-i sigma cost) of the word reached. A store does not
// stream and keeps its word's phase. Weight whose word passes the box is absorbed and counted.

export type FluxState = { re: Float64Array; im: Float64Array }

export type FluxMeson = {
  space: WordSpace
  table: Float64Array
  contact: [Sparse, Sparse]
  costPhase: Float64Array
  stream: Float64Array
  tr: Float64Array
  ti: Float64Array
  storeR: Float64Array
  storeI: Float64Array
}

export const fluxStateSize = (s: WordSpace): number =>
  s.size * 576 + s.contacts * 24

export const newFluxState = (s: WordSpace): FluxState => ({
  re: new Float64Array(fluxStateSize(s)),
  im: new Float64Array(fluxStateSize(s)),
})

export function setFluxString(fm: FluxMeson, sigma: number): void {
  for (let e = 0; e < fm.space.size; e++) {
    const ph = -sigma * fm.space.cost[fm.space.even[e]!]!

    fm.costPhase[2 * e] = Math.cos(ph)
    fm.costPhase[2 * e + 1] = Math.sin(ph)
  }
}

export function setFluxMomentum(
  fm: FluxMeson,
  K: readonly number[],
): void {
  for (let l = 0; l < 24; l++) {
    for (let f = 0; f < 24; f++) {
      const r1 = ROOTS[l]!
      const r2 = ROOTS[f]!
      const ph = -(
        K.reduce((sum, x, k) => sum + x * (r1[k]! + r2[k]!), 0) / 2
      )

      fm.stream[(l * 24 + f) * 2] = Math.cos(ph)
      fm.stream[(l * 24 + f) * 2 + 1] = Math.sin(ph)
    }
  }
}

export function fluxMeson(
  space: WordSpace,
  shape: VibeShape,
  contact: [Sparse, Sparse],
  sigma: number,
  K: readonly number[],
): FluxMeson {
  const fm: FluxMeson = {
    space,
    table: Float64Array.from([
      shape.c[0],
      shape.c[1],
      shape.beta[0],
      shape.beta[1],
    ]),
    contact,
    costPhase: new Float64Array(space.size * 2),
    stream: new Float64Array(1152),
    tr: new Float64Array(space.size * 576),
    ti: new Float64Array(space.size * 576),
    storeR: new Float64Array(space.contacts * 24),
    storeI: new Float64Array(space.contacts * 24),
  }

  setFluxString(fm, sigma)
  setFluxMomentum(fm, K)

  return fm
}

// one beat; writes `out` (cleared here), returns the weight absorbed at the box
export function fluxBeat(
  fm: FluxMeson,
  s: FluxState,
  out: FluxState,
  beat: number,
): number {
  const { space, table, tr, ti, storeR, storeI } = fm
  const { size, contactIndex, next } = space
  const mr = new Float64Array(576)
  const mi = new Float64Array(576)
  const vr = new Float64Array(CONTACT_STATES)
  const vi = new Float64Array(CONTACT_STATES)
  const or = new Float64Array(CONTACT_STATES)
  const oi = new Float64Array(CONTACT_STATES)
  const C = fm.contact[beat % 2]!

  tr.fill(0)
  ti.fill(0)
  storeR.fill(0)
  storeI.fill(0)

  for (let e = 0; e < size; e++) {
    const base = e * 576
    const ci = contactIndex[e]!

    if (ci >= 0) {
      // the contact map on the 576 slot pairs and the word's 24 stores
      let any = false

      for (let i = 0; i < STORE_BASE; i++) {
        vr[i] = s.re[base + i]!
        vi[i] = s.im[base + i]!

        if (vr[i] !== 0 || vi[i] !== 0) {
          any = true
        }
      }

      for (let j = 0; j < 24; j++) {
        vr[STORE_BASE + j] = s.re[size * 576 + ci * 24 + j]!
        vi[STORE_BASE + j] = s.im[size * 576 + ci * 24 + j]!

        if (vr[STORE_BASE + j] !== 0 || vi[STORE_BASE + j] !== 0) {
          any = true
        }
      }

      if (!any) {
        continue
      }

      or.fill(0)
      oi.fill(0)

      for (let f = 0; f < CONTACT_STATES; f++) {
        const xr = vr[f]!
        const xi = vi[f]!

        if (xr === 0 && xi === 0) {
          continue
        }

        const col = C.cols[f]!

        for (let k = 0; k < col.to.length; k++) {
          const t = col.to[k]!
          const cr = col.re[k]!
          const cim = col.im[k]!

          or[t] = or[t]! + cr * xr - cim * xi
          oi[t] = oi[t]! + cr * xi + cim * xr
        }
      }

      for (let i = 0; i < STORE_BASE; i++) {
        tr[base + i] = or[i]!
        ti[base + i] = oi[i]!
      }

      for (let j = 0; j < 24; j++) {
        storeR[ci * 24 + j] = or[STORE_BASE + j]!
        storeI[ci * 24 + j] = oi[STORE_BASE + j]!
      }

      continue
    }

    let empty = true

    for (let i = 0; i < 576; i++) {
      if (s.re[base + i] !== 0 || s.im[base + i] !== 0) {
        empty = false
        break
      }
    }

    if (empty) {
      continue
    }

    // A on the fear index (stride 1), then on the love index (stride 24), as swap-string mesonBeat
    for (let l = 0; l < 24; l++) {
      applyVibe(
        table,
        0,
        s.re,
        s.im,
        base + l * 24,
        1,
        mr,
        mi,
        l * 24,
        1,
      )
    }

    for (let f = 0; f < 24; f++) {
      applyVibe(table, 0, mr, mi, f, 24, tr, ti, base + f, 24)
    }
  }

  out.re.fill(0)
  out.im.fill(0)

  let lost = 0

  const phase = fm.stream

  for (let e = 0; e < size; e++) {
    for (let k = 0; k < 576; k++) {
      const i = e * 576 + k
      const xr = tr[i]!
      const xi = ti[i]!

      if (xr === 0 && xi === 0) {
        continue
      }

      const t = next[i]!

      if (t < 0) {
        lost += xr * xr + xi * xi
        continue
      }

      const c = phase[2 * k]!
      const sn = phase[2 * k + 1]!
      const zr = xr * c - xi * sn
      const zi = xr * sn + xi * c
      const gr = fm.costPhase[2 * t]!
      const gi = fm.costPhase[2 * t + 1]!
      const j = t * 576 + k

      out.re[j] = out.re[j]! + zr * gr - zi * gi
      out.im[j] = out.im[j]! + zr * gi + zi * gr
    }
  }

  // a store does not stream; it keeps its word and its word's phase
  for (let e = 0; e < size; e++) {
    const ci = contactIndex[e]!

    if (ci < 0) {
      continue
    }

    const gr = fm.costPhase[2 * e]!
    const gi = fm.costPhase[2 * e + 1]!

    for (let j = 0; j < 24; j++) {
      const xr = storeR[ci * 24 + j]!
      const xi = storeI[ci * 24 + j]!

      out.re[size * 576 + ci * 24 + j] = xr * gr - xi * gi
      out.im[size * 576 + ci * 24 + j] = xr * gi + xi * gr
    }
  }

  return lost
}

// ---- readings of a flux state (swap-string's readings, on the word space) ----

export const fluxInner = (
  a: FluxState,
  b: FluxState,
): [number, number] => {
  let r = 0
  let i = 0

  for (let k = 0; k < a.re.length; k++) {
    const ar = a.re[k]!
    const ai = a.im[k]!
    const br = b.re[k]!
    const bi = b.im[k]!

    r += ar * br + ai * bi
    i += ar * bi - ai * br
  }

  return [r, i]
}

export function fluxNormalize(s: FluxState): number {
  const w = fluxInner(s, s)[0]
  const f = 1 / Math.sqrt(w)

  for (let k = 0; k < s.re.length; k++) {
    s.re[k] = s.re[k]! * f
    s.im[k] = s.im[k]! * f
  }

  return w
}

// the weight at each word length 0 .. maxLength (stores at their word's length)
export function fluxProfile(fm: FluxMeson, v: FluxState): number[] {
  const { space } = fm
  const out = new Array<number>(space.maxLength + 1).fill(0)

  for (let e = 0; e < space.size; e++) {
    let w = 0

    for (let k = 0; k < 576; k++) {
      w += v.re[e * 576 + k]! ** 2 + v.im[e * 576 + k]! ** 2
    }

    const ci = space.contactIndex[e]!

    if (ci >= 0) {
      for (let j = 0; j < 24; j++) {
        w +=
          v.re[space.size * 576 + ci * 24 + j]! ** 2 +
          v.im[space.size * 576 + ci * 24 + j]! ** 2
      }
    }

    out[space.length[space.even[e]!]!]! += w
  }

  return out
}

// the weight on each word's uniform slot pair (both charges in their dock's singlet mode), summed
export function fluxSingletShare(fm: FluxMeson, v: FluxState): number {
  let w = 0

  for (let e = 0; e < fm.space.size; e++) {
    let r = 0
    let i = 0

    for (let k = 0; k < 576; k++) {
      r += v.re[e * 576 + k]!
      i += v.im[e * 576 + k]!
    }

    w += (r * r + i * i) / 576
  }

  return w
}

// a start: both charges in their dock's singlet mode (every slot pair alike, the two slots distinct at contact), with
// weight exp(-(L / ell)^(3/2)) on word length L (swap-string mesonStart's shape), normalized; no store
export function fluxStart(space: WordSpace, ell: number): FluxState {
  const s = newFluxState(space)

  for (let e = 0; e < space.size; e++) {
    const L = space.length[space.even[e]!]!
    const a = Math.exp(-((L / ell) ** 1.5))
    const contact = space.contactIndex[e]! >= 0

    for (let l = 0; l < 24; l++) {
      for (let f = 0; f < 24; f++) {
        if (!contact || l !== f) {
          s.re[e * 576 + l * 24 + f] = a
        }
      }
    }
  }

  fluxNormalize(s)

  return s
}

// two beats from parity 0, in place through a scratch state; the weight absorbed
export function fluxTwoBeats(
  fm: FluxMeson,
  s: FluxState,
  scratch: FluxState,
): number {
  return fluxBeat(fm, s, scratch, 0) + fluxBeat(fm, scratch, s, 1)
}

// swap-string filterMeson on the word space: v = sum_(t < S) w_t e^(-i phase2 t) U2^t psi, Blackman-Harris, normalized
export function fluxFilter(
  fm: FluxMeson,
  psi: FluxState,
  phase2: number,
  S: number,
): FluxState {
  const v = newFluxState(fm.space)
  const s: FluxState = {
    re: Float64Array.from(psi.re),
    im: Float64Array.from(psi.im),
  }
  const scratch = newFluxState(fm.space)

  for (let t = 0; t < S; t++) {
    if (t > 0) {
      fluxTwoBeats(fm, s, scratch)
    }

    const w = blackmanHarris(t, S)
    const c = Math.cos(-phase2 * t) * w
    const sn = Math.sin(-phase2 * t) * w

    for (let k = 0; k < v.re.length; k++) {
      const xr = s.re[k]!
      const xi = s.im[k]!

      if (xr === 0 && xi === 0) {
        continue
      }

      v.re[k] = v.re[k]! + xr * c - xi * sn
      v.im[k] = v.im[k]! + xr * sn + xi * c
    }
  }

  fluxNormalize(v)

  return v
}

// swap-string readLevel on the word space: lambda2 = <v|U2 v>, the residual, lambda1 = <v|U(0) v>, the phase per beat
export function fluxRead(fm: FluxMeson, v: FluxState): LevelRead {
  const zero: FluxState = {
    re: Float64Array.from(v.re),
    im: Float64Array.from(v.im),
  }
  const one = newFluxState(fm.space)

  fluxBeat(fm, zero, one, 0)

  const lambda1 = fluxInner(v, one)

  fluxBeat(fm, one, zero, 1)

  const lambda2 = fluxInner(v, zero)

  let r = 0

  for (let k = 0; k < v.re.length; k++) {
    const er =
      zero.re[k]! - (lambda2[0] * v.re[k]! - lambda2[1] * v.im[k]!)
    const ei =
      zero.im[k]! - (lambda2[0] * v.im[k]! + lambda2[1] * v.re[k]!)

    r += er * er + ei * ei
  }

  const half = Math.atan2(lambda2[1], lambda2[0]) / 2
  const p1 = Math.atan2(lambda1[1], lambda1[0])
  const wrapped = (x: number): number =>
    Math.atan2(Math.sin(x), Math.cos(x))
  const phase =
    Math.abs(wrapped(half - p1)) <=
    Math.abs(wrapped(half + Math.PI - p1))
      ? half
      : wrapped(half + Math.PI)

  return { lambda2, residual: Math.sqrt(r), lambda1, phase }
}

export function fluxBuild(
  fm: FluxMeson,
  start: FluxState,
  phase: number,
  S: number,
  passes: number,
): { v: FluxState; read: LevelRead } {
  let v = fluxFilter(fm, start, 2 * phase, S)
  let read = fluxRead(fm, v)

  for (let p = 1; p < passes; p++) {
    v = fluxFilter(fm, v, 2 * read.phase, S)
    read = fluxRead(fm, v)
  }

  return { v, read }
}

// the hold witness on the word space: from v, `beats` beats; the least weight at word length <= `window` (stores
// included) at any beat, the least fidelity |<v|psi_t>|^2 at the even beats, and the weight absorbed at the box
export function fluxWatch(
  fm: FluxMeson,
  v: FluxState,
  beats: number,
  window: number,
): { leastWindow: number; leastFidelity: number; absorbed: number } {
  let a: FluxState = {
    re: Float64Array.from(v.re),
    im: Float64Array.from(v.im),
  }
  let b = newFluxState(fm.space)
  let absorbed = 0
  let leastWindow = 1
  let leastFidelity = 1

  for (let t = 0; t < beats; t++) {
    absorbed += fluxBeat(fm, a, b, t)
    ;[a, b] = [b, a]

    const prof = fluxProfile(fm, a)

    leastWindow = Math.min(
      leastWindow,
      prof.slice(0, window + 1).reduce((x, y) => x + y, 0),
    )

    if ((t + 1) % 2 === 0) {
      const f = fluxInner(v, a)

      leastFidelity = Math.min(leastFidelity, f[0] * f[0] + f[1] * f[1])
    }
  }

  return { leastWindow, leastFidelity, absorbed }
}

// the autocorrelation of a start under U2, c_t = <psi|U2^t psi>, t < T, and its Hann-windowed spectral density on a
// grid of phase2 over (-pi, pi]: where the start's weight sits (the peaks a filter is aimed at)
export function fluxSpectrum(
  fm: FluxMeson,
  psi: FluxState,
  T: number,
  grid: number,
): { phase2: number[]; density: number[]; absorbed: number } {
  const s: FluxState = {
    re: Float64Array.from(psi.re),
    im: Float64Array.from(psi.im),
  }
  const scratch = newFluxState(fm.space)
  const auto: [number, number][] = []

  let absorbed = 0

  for (let t = 0; t < T; t++) {
    if (t > 0) {
      absorbed += fluxTwoBeats(fm, s, scratch)
    }

    auto.push(fluxInner(psi, s))
  }

  const phase2: number[] = []
  const density: number[] = []

  for (let g = 0; g < grid; g++) {
    const ph = -Math.PI + (2 * Math.PI * (g + 1)) / grid

    let re = 0

    for (let t = 0; t < T; t++) {
      const w = 0.5 + 0.5 * Math.cos((Math.PI * t) / T)
      const [a, b] = auto[t]!

      re +=
        (t === 0 ? 1 : 2) *
        w *
        (a * Math.cos(ph * t) + b * Math.sin(ph * t))
    }

    phase2.push(ph)
    density.push(re / (2 * Math.PI))
  }

  return { phase2, density, absorbed }
}

// ---- the register on the rule's own vacuum ----
//
// The exact rule (code/rule/swap-mixer swapMixedBeat, veto 'none', flat links) on a box: after each beat every vibe
// on slot d of dock x reached x from source(x, d) along root d, so the register's change is -v along that link's
// motion. On the empty box nothing moves and the register is never touched; on the love sea every link is crossed once
// each way by a love, so every change cancels. Returns whether the rule kept one branch equal to the vacuum, the
// largest number of links holding flux after any beat (0 for an inert vacuum), and the crossings counted.
export function ruleVacuumFlux(
  u: RingUnit,
  side: number,
  sea: number,
  beats: number,
): {
  cells: number
  exact: boolean
  worstLinks: number
  crossings: number
} {
  const tab = flatBoxTables(side)
  const c0 = seaConfiguration(tab.cells, sea)

  let s: LockedState = lockedState(c0)

  const reg = new Map<number, number>()

  let exact = true
  let worstLinks = 0
  let crossings = 0

  for (let t = 0; t < beats; t++) {
    s = swapMixedBeat('none', tab, s, t, u)

    if (
      s.branches.length !== 1 ||
      !sameConfiguration(s.branches[0]!, c0)
    ) {
      exact = false
      break
    }

    const br = s.branches[0]!

    for (let i = 0; i < tab.cells * 24; i++) {
      const v = br.vibe[i]!

      if (v === 0) {
        continue
      }

      const d = i % 24
      const x = Math.floor(i / 24)
      const from = Math.floor(tab.source[i]! / 24)
      const { k, s: sign } = POS_OF[d] as { k: number; s: number }
      const key = (sign > 0 ? from : x) * 12 + k
      const delta = sign > 0 ? -v : v

      reg.set(key, ((((reg.get(key) ?? 0) + delta) % 3) + 3) % 3)
      crossings++
    }

    let links = 0

    for (const v of reg.values()) {
      if (v !== 0) {
        links++
      }
    }

    worstLinks = Math.max(worstLinks, links)
    br.a = 1n
    br.b = 0n
  }

  return { cells: tab.cells, exact, worstLinks, crossings }
}
