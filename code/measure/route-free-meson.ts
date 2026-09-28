// THE ROUTE-FREE STRING, A STAND-IN (E-SPN-0131). code/measure/frame-meson's vacuum-free meson (a love and a fear on
// one frame's lattice, the frame mixer, the drift cost, the coin, the stream) with the string REGISTER replaced by a
// function of where the two members are. A class is the fear's offset n from the love (4 frame integers) and nothing
// else; the drift cost a beat is e^(-i pi V(n) / N), N = 2 D + 1, with V one of:
//   'frame'  the fewest frame links joining the two, |n|_1 = sum_a |n_a|. On the frame's hypercubic lattice this is the
//            length of every monotone staircase, which is the Gauss-fixed flux of an axial gauge (the string laid axis
//            by axis) and the minimum over all strings on the links the members can cross
//   'd4'     the fewest D4 root steps joining the two docks in the whole mesh: with v = sum_a n_a r_a in integer
//            coordinates (r_a the frame's roots), max(|v|_inf, |v|_1 / 2)
//   'none'   no cost
// On one line (n = d e_a) both read |d|, which is what the recorded register holds there (a straight string of |d|
// links, each a nonzero trit): the stand-in is frame-meson's beat exactly on one line.
//
// HOW IT IS BUILT. A route-free space IS a frame-meson FrameSpace whose classes carry no links, a `costly` equal to
// V(n), both mixer gates open exactly when the two are apart (Gauss makes this the recorded register's gate too: a
// lone charge always has a nonzero trit on one of its frame links), and a successor table filled here before the beat
// reads it (the stream: n -> n + s_f e_(a_f) - s_l e_(a_l)). frame-meson's frameBeat, ritzLevels, momentsOf,
// innerOf and weightOf then run unchanged. The window is the frame string's length: an offset with |n|_1 over `cut`
// is dropped and its weight counted as escaped, for every cost, so the three costs share one window.
//
// Floats, as measurement: a stand-in, not the exact rule. DETERMINISM: no random numbers; starts are placed. NOTHING
// MOVES: the cost is a phase read off the offset, the coin and the mixer hand a value between slots of one dock, and
// the stream takes each value one dock along. The price, derived in test/experiment/spin/route-free-string: the phase
// is read from BOTH positions at once, with no register between them.

import { frameAxes, frameBeat, innerOf, type BeatTally, type FrameSpace, type FrameSpec, type FrameState } from '@/code/measure/frame-meson'

export type RouteCost = 'frame' | 'd4' | 'none'

type Klass = FrameSpace['classes'][number]

export type RouteSpace = FrameSpace & { cost: RouteCost; roots: number[][] }

const BLOCK = 128

// the frame's roots in integer coordinates (length sqrt 2), in FRAME_LINES order
export const frameRoots = (frame: number): number[][] => frameAxes(frame).map(u => u.map(x => Math.round(x * Math.SQRT2)))

export const frameLength = (n: ArrayLike<number>): number => {
  let s = 0

  for (let i = 0; i < n.length; i++) s += Math.abs(n[i] as number)

  return s
}

// the D4 graph distance from 0 to an integer vector v of even coordinate sum, the roots being +-e_i +- e_j
export function d4Distance(v: readonly number[]): number {
  const inf = Math.max(...v.map(Math.abs))
  const one = v.reduce((s, x) => s + Math.abs(x), 0)

  return Math.max(inf, one / 2)
}

export function routeLength(cost: RouteCost, roots: readonly number[][], n: readonly number[]): number {
  if (cost === 'none') return 0
  if (cost === 'frame') return frameLength(n)

  return d4Distance([0, 1, 2, 3].map(k => n.reduce((s, x, a) => s + x * ((roots[a] as number[])[k] as number), 0)))
}

export const routeSpace = (spec: FrameSpec, cost: RouteCost): RouteSpace => ({ spec, classes: [], index: new Map(), cost, roots: frameRoots(spec.frame) })

// the class of an offset, registered on first sight
export function routeClass(space: RouteSpace, offset: readonly number[]): number {
  const key = offset.join(',')
  const found = space.index.get(key)

  if (found !== undefined) return found

  const apart = offset.some(x => x !== 0)
  const klass: Klass = {
    key,
    offset: Int32Array.from(offset),
    links: new Int32Array(0),
    costly: routeLength(space.cost, space.roots, offset),
    loveGated: apart,
    fearGated: apart,
    next: undefined,
  }

  space.classes.push(klass)
  space.index.set(key, space.classes.length - 1)

  return space.classes.length - 1
}

// fill class c's successor table: love slot sl, fear slot sf (slot 2 a + j, j 0 streaming along +u_a)
function ensure(space: RouteSpace, c: number): void {
  const k = space.classes[c] as Klass

  if (k.next) return

  const next = new Int32Array(64)

  for (let idx = 0; idx < 64; idx++) {
    const sl = idx >> 3
    const sf = idx & 7
    const al = sl >> 1
    const af = sf >> 1
    const sgl = (sl & 1) === 0 ? 1 : -1
    const sgf = (sf & 1) === 0 ? 1 : -1
    const to = Array.from(k.offset, (x, i) => x + (i === af ? sgf : 0) - (i === al ? sgl : 0))

    next[idx] = frameLength(to) > space.spec.cut ? -1 : routeClass(space, to)
  }

  ;(space.classes[c] as Klass).next = next
}

// one beat at momentum K (Cartesian): frame-meson's beat on the route-free classes
export function routeBeat(space: RouteSpace, K: readonly number[], s: FrameState, tally: BeatTally): FrameState {
  for (const c of s.keys()) ensure(space, c)

  return frameBeat(space, K, s, tally)
}

export function routeAutocorrelation(space: RouteSpace, K: readonly number[], start: FrameState, T: number): { c: [number, number][]; tally: BeatTally } {
  const tally: BeatTally = { escaped: 0, dropped: 0 }
  const c: [number, number][] = [innerOf(start, start)]
  let s = start

  for (let t = 1; t <= T; t++) {
    s = routeBeat(space, K, s, tally)
    c.push(innerOf(start, s))
  }

  return { c, tally }
}

// v = sum_t x_t U^t start, normalized
export function routeLevelVector(space: RouteSpace, K: readonly number[], start: FrameState, coefficients: readonly [number, number][]): FrameState {
  const tally: BeatTally = { escaped: 0, dropped: 0 }
  const out: FrameState = new Map()
  let s = start

  coefficients.forEach((x, t) => {
    if (t > 0) s = routeBeat(space, K, s, tally)
    for (const [c, b] of s) {
      let o = out.get(c)

      if (!o) {
        o = new Float64Array(BLOCK)
        out.set(c, o)
      }

      for (let i = 0; i < BLOCK; i += 2) {
        o[i] = (o[i] as number) + x[0] * (b[i] as number) - x[1] * (b[i + 1] as number)
        o[i + 1] = (o[i + 1] as number) + x[0] * (b[i + 1] as number) + x[1] * (b[i] as number)
      }
    }
  })

  let w = 0

  for (const b of out.values()) for (let i = 0; i < BLOCK; i++) w += (b[i] as number) ** 2
  w = Math.sqrt(w)
  for (const b of out.values()) for (let i = 0; i < BLOCK; i++) b[i] = (b[i] as number) / w

  return out
}

// a state from amplitudes on (fear offset d along frame axis `axis`, love slot, fear slot), as frame-meson lineState
// places them, with no register
export function routeLineState(space: RouteSpace, axis: number, entries: readonly { d: number; jl: number; jf: number; amp: [number, number] }[]): FrameState {
  const out: FrameState = new Map()

  for (const e of entries) {
    const c = routeClass(space, [0, 1, 2, 3].map(k => (k === axis ? e.d : 0)))
    let o = out.get(c)

    if (!o) {
      o = new Float64Array(BLOCK)
      out.set(c, o)
    }

    const idx = (2 * axis + e.jl) * 8 + 2 * axis + e.jf

    o[2 * idx] = (o[2 * idx] as number) + e.amp[0]
    o[2 * idx + 1] = (o[2 * idx + 1] as number) + e.amp[1]
  }

  return out
}

// the weight at each frame string length 0 .. cut (and past it, for a placed start the window has not cut yet)
export function shellWeights(space: RouteSpace, s: FrameState): number[] {
  const out = new Array<number>(space.spec.cut + 1).fill(0)

  for (const [c, b] of s) {
    const L = frameLength((space.classes[c] as Klass).offset)
    let w = 0

    for (let i = 0; i < BLOCK; i++) w += (b[i] as number) ** 2
    while (out.length <= L) out.push(0)
    out[L] = (out[L] as number) + w
  }

  return out
}

// the weight with the two on different frame axes (the pair turned off one line)
export function offLineWeight(space: RouteSpace, s: FrameState): number {
  let w = 0

  for (const [c, b] of s) {
    const n = (space.classes[c] as Klass).offset
    const axes = [0, 1, 2, 3].filter(a => n[a] !== 0).length

    for (let idx = 0; idx < 64; idx++) {
      const x = (b[2 * idx] as number) ** 2 + (b[2 * idx + 1] as number) ** 2

      if (x === 0) continue
      if (axes > 1 || idx >> 4 !== (idx & 7) >> 1) w += x
    }
  }

  return w
}
