// THE STRING-BOUND MESON WITH THE STRING-GATED MIXER, A STAND-IN (E-SPN-0121). E-SPN-0112 and 0115's love-fear meson
// (code/measure/string-binding, the drift cost only, no meeting, no contact at a full dock) with the string-gated line
// mixer of code/measure/string-gated-mixer, in the unbounded mesh with no vacuum.
//
// THE FRAME. The mixer moves a single only among the eight slots of its own frame, the coin only between the two slots
// of its own line, and the stream along its slot's root, so each vibe keeps its frame forever. A love and a fear placed
// on one line share its frame F, whose four lines are mutually orthogonal roots u_0 .. u_3 (length sqrt 2, one dock
// step each). So both walk on the frame's lattice {sum n_a u_a}, a hypercubic Z^4, and a configuration is read in
// frame coordinates: the fear's offset from the love n (4 integers), each vibe's frame slot s = 2 a + j (a its axis, j 0
// the first slot, streaming along +u_a, 1 the opposite), and the drift cost's register: every link holding a nonzero
// trit, as (its dock relative to the love, its axis, the trit).
//
// THE PIECES, in the order of code/measure/string-gated-mixer's track (the mixer, then bound-line-pieces' beat):
//  - THE MIXER M_n = I + (e^(i theta) - 1) J / 8 on a vibe's eight frame slots, where the vibe is the one single of
//    its dock (the other vibe elsewhere), its frame holds nothing else (true here whenever it is alone), and a link of
//    its frame at its dock holds a nonzero trit. Gauss holds on the register (every trit is a recorded copy), so a lone
//    charged vibe always has one; the clause is read from the register, not assumed.
//  - THE COST: e^(-i pi n_c / N) a beat, n_c the links holding a nonzero trit, N = 2 D + 1.
//  - THE COIN on each vibe's own line: keep (1 + w)/2, cross (1 - w)/2, w = e^(2 pi i/3).
//  - THE STREAM: each vibe one dock along its slot's root, recording the copy on the link it crosses (f - q forward,
//    f + q back, q = +1 the love, -1 the fear: code/measure/two-hub-bound writeFluxAfterStream).
// Love and fear on one dock pass through each other with no meeting and no contact, exactly as in the one-line meson.
//
// BLOCH FORM. The beat commutes with translations by the frame lattice, so at total momentum K (a Cartesian 4-vector,
// per dock) the state is held relative to the love, and a beat that moves the love by delta multiplies by
// e^(-i K . delta) (string-binding pairColumn's convention, the love its token 0). On the love's line at mixer rate 0
// this is the one-line meson's beat exactly, with no wall: a configuration whose string exceeds `cut` links is
// dropped and its weight counted.
//
// THE LEVEL. A level of the beat U_K is read from the autocorrelation c(t) = <psi_0|U^t psi_0> alone: in the Krylov
// basis psi_t = U^t psi_0 the overlaps are S_st = c(t - s), <psi_s|U|psi_t> = c(t - s + 1), so (U + U^+)/2 and
// (U - U^+)/(2i) are Hermitian Toeplitz matrices of c, and their generalized Ritz pairs against S give cos E, sin E,
// the start's weight on each Ritz level and its residual |U v - lambda v|, with nothing stored but c. `levelVector`
// builds v = sum_t x_t psi_t on a second pass.
//
// Floats, as measurement: a stand-in, not the exact rule. DETERMINISM: no random numbers; starts are placed.
// NOTHING MOVES: the cost is a phase, the coin and the mixer hand a value between slots of one dock, and the stream
// takes each value one dock along, writing the register as it goes.

import { rootsD4 } from '@/code/algebra/group/integer-roots'
import {
  FRAME_LINES,
  FRAME_OF_LINE,
} from '@/code/rule/coined-locked-knit'
import { LINE_FIRSTS, LINE_OF } from '@/code/rule/isometric-knit'
import { hermitianEigen } from '@/code/measure/quantum-ladder'

const ROOTS = rootsD4()
const W: [number, number] = [-0.5, Math.sqrt(3) / 2]
const KEEP: [number, number] = [(1 + W[0]) / 2, W[1] / 2]
const CROSS: [number, number] = [(1 - W[0]) / 2, -W[1] / 2]
const BLOCK = 128

export type FrameSpec = {
  // the frame (0 .. 2) and the mixer's rate n (theta with 2 - 2 cos theta = n; 0 is off)
  readonly frame: number
  readonly n: number
  readonly D: number
  // a configuration whose string holds more than `cut` costly links is dropped
  readonly cut: number
  // a class whose weight falls under `floor` after a beat is dropped
  readonly floor: number
}

// the frame's axes as unit Cartesian vectors (a dock step), in FRAME_LINES order
export function frameAxes(frame: number): number[][] {
  return FRAME_LINES[frame]!.map(l =>
    ROOTS[LINE_FIRSTS[l]!]!.map(x => x / Math.SQRT2),
  )
}

// the frame axis of a mesh line class
export const axisOfLine = (frame: number, l: number): number =>
  FRAME_LINES[frame]!.indexOf(l)

export const lineFrame = (slot: number): number =>
  FRAME_OF_LINE[LINE_OF[slot]!]!

// ---- the classes: (fear offset, register) with a block of 64 slot pairs ----

type Klass = {
  key: string
  offset: Int32Array
  // links: [p0, p1, p2, p3, axis, trit] per link, relative to the love, sorted
  links: Int32Array
  costly: number
  loveGated: boolean
  fearGated: boolean
  // targets of the 64 slot pairs (love slot * 8 + fear slot), -1 past the cut, -2 not yet computed
  next: Int32Array | undefined
}

export type FrameSpace = {
  spec: FrameSpec
  classes: Klass[]
  index: Map<string, number>
}

export const frameSpace = (spec: FrameSpec): FrameSpace => ({
  spec,
  classes: [],
  index: new Map(),
})

const linkCompare = (a: number[], b: number[]): number => {
  for (let k = 0; k < 5; k++) {
    if (a[k] !== b[k]) {
      return a[k]! - b[k]!
    }
  }

  return 0
}

// the class of an offset and a register (a map "p0,p1,p2,p3,axis" -> trit), registered on first sight
function classOf(
  space: FrameSpace,
  offset: readonly number[],
  register: Map<string, number>,
): number {
  const entries: number[][] = []

  for (const [k, v] of register) {
    if (v % 3 === 0) {
      continue
    }

    entries.push([...k.split(',').map(Number), ((v % 3) + 3) % 3])
  }

  entries.sort(linkCompare)

  const key = `${offset.join(',')}|${entries.map(e => e.join(',')).join(';')}`
  const found = space.index.get(key)

  if (found !== undefined) {
    return found
  }

  const links = Int32Array.from(entries.flat())
  const alone = offset.some(x => x !== 0)
  // a link of the frame at a dock p: (p, a) or (p - e_a, a), for any axis a (every link here is a frame link)
  const touches = (p: readonly number[]): boolean =>
    entries.some(e => {
      const a = e[4]!

      return (
        [0, 1, 2, 3].every(k => e[k] === p[k]) ||
        [0, 1, 2, 3].every(k => e[k] === p[k]! - (k === a ? 1 : 0))
      )
    })
  const klass: Klass = {
    key,
    offset: Int32Array.from(offset),
    links,
    costly: entries.length,
    loveGated: alone && touches([0, 0, 0, 0]),
    fearGated: alone && touches(offset),
    next: undefined,
  }

  space.classes.push(klass)
  space.index.set(key, space.classes.length - 1)

  return space.classes.length - 1
}

const registerOf = (k: Klass): Map<string, number> => {
  const out = new Map<string, number>()

  for (let i = 0; i < k.links.length; i += 6) {
    out.set(
      `${k.links[i]},${k.links[i + 1]},${k.links[i + 2]},${k.links[i + 3]},${k.links[i + 4]}`,
      k.links[i + 5]!,
    )
  }

  return out
}

const addTrit = (
  reg: Map<string, number>,
  p: readonly number[],
  a: number,
  v: number,
): void => {
  const k = `${p.join(',')},${a}`
  const x = ((((reg.get(k) ?? 0) + v) % 3) + 3) % 3

  if (x === 0) {
    reg.delete(k)
  } else {
    reg.set(k, x)
  }
}

const unit = (a: number, s: number): number[] =>
  [0, 1, 2, 3].map(k => (k === a ? s : 0))

// the target of class c's slot pair idx (love slot * 8 + fear slot), -1 past the cut; computed on first use (-2 unset)
function nextOf(space: FrameSpace, c: number, idx: number): number {
  const k = space.classes[c]!

  if (!k.next) {
    k.next = new Int32Array(64).fill(-2)
  }

  const known = k.next[idx]!

  if (known !== -2) {
    return known
  }

  const sl = idx >> 3
  const sf = idx & 7
  const reg = registerOf(k)
  const al = sl >> 1
  const sgl = (sl & 1) === 0 ? 1 : -1
  const af = sf >> 1
  const sgf = (sf & 1) === 0 ? 1 : -1
  const fear = Array.from(k.offset)

  // the love (q = +1) from the origin, the fear (q = -1) from its offset
  if (sgl > 0) {
    addTrit(reg, [0, 0, 0, 0], al, -1)
  } else {
    addTrit(reg, unit(al, -1), al, 1)
  }

  if (sgf > 0) {
    addTrit(reg, fear, af, 1)
  } else {
    addTrit(
      reg,
      fear.map((x, i) => x - (i === af ? 1 : 0)),
      af,
      -1,
    )
  }

  let to = -1

  if (reg.size <= space.spec.cut) {
    // re-anchor on the love's new dock
    const shifted = new Map<string, number>()

    for (const [key, v] of reg) {
      const q = key.split(',').map(Number)

      shifted.set(
        `${q[0]! - (al === 0 ? sgl : 0)},${q[1]! - (al === 1 ? sgl : 0)},${q[2]! - (al === 2 ? sgl : 0)},${q[3]! - (al === 3 ? sgl : 0)},${q[4]}`,
        v,
      )
    }

    to = classOf(
      space,
      fear.map(
        (x, i) => x + (i === af ? sgf : 0) - (i === al ? sgl : 0),
      ),
      shifted,
    )
  }

  space.classes[c]!.next![idx] = to

  return to
}

// ---- states ----

// a state: class id -> 64 complex amplitudes, [re, im] interleaved, index 2 (love slot * 8 + fear slot)
export type FrameState = Map<number, Float64Array>

export function frameClass(
  space: FrameSpace,
  offset: readonly number[],
  register: Map<string, number>,
): number {
  return classOf(space, offset, register)
}

export const weightOf = (s: FrameState): number => {
  let w = 0

  for (const b of s.values()) {
    for (let i = 0; i < BLOCK; i++) {
      w += b[i]! ** 2
    }
  }

  return w
}

export function innerOf(
  u: FrameState,
  v: FrameState,
): [number, number] {
  let r = 0
  let i = 0

  for (const [c, a] of u) {
    const b = v.get(c)

    if (!b) {
      continue
    }

    for (let k = 0; k < BLOCK; k += 2) {
      r += a[k]! * b[k]! + a[k + 1]! * b[k + 1]!
      i += a[k]! * b[k + 1]! - a[k + 1]! * b[k]!
    }
  }

  return [r, i]
}

// the mixer on the love's (side 0) or the fear's (side 1) slot index of a block
function mixBlock(
  b: Float64Array,
  side: number,
  c: [number, number],
): void {
  for (let o = 0; o < 8; o++) {
    let sr = 0
    let si = 0

    for (let s = 0; s < 8; s++) {
      const i = 2 * (side === 0 ? s * 8 + o : o * 8 + s)

      sr += b[i]!
      si += b[i + 1]!
    }

    const ar = c[0] * sr - c[1] * si
    const ai = c[0] * si + c[1] * sr

    for (let s = 0; s < 8; s++) {
      const i = 2 * (side === 0 ? s * 8 + o : o * 8 + s)

      b[i] = b[i]! + ar
      b[i + 1] = b[i + 1]! + ai
    }
  }
}

function coinBlock(b: Float64Array, side: number): void {
  for (let o = 0; o < 8; o++) {
    for (let a = 0; a < 4; a++) {
      const i = 2 * (side === 0 ? 2 * a * 8 + o : o * 8 + 2 * a)
      const j =
        2 * (side === 0 ? (2 * a + 1) * 8 + o : o * 8 + 2 * a + 1)
      const xr = b[i]!
      const xi = b[i + 1]!
      const yr = b[j]!
      const yi = b[j + 1]!

      b[i] = KEEP[0] * xr - KEEP[1] * xi + CROSS[0] * yr - CROSS[1] * yi
      b[i + 1] =
        KEEP[0] * xi + KEEP[1] * xr + CROSS[0] * yi + CROSS[1] * yr
      b[j] = CROSS[0] * xr - CROSS[1] * xi + KEEP[0] * yr - KEEP[1] * yi
      b[j + 1] =
        CROSS[0] * xi + CROSS[1] * xr + KEEP[0] * yi + KEEP[1] * yr
    }
  }
}

export type BeatTally = { escaped: number; dropped: number }

// one beat at momentum K (Cartesian); returns the new state
export function frameBeat(
  space: FrameSpace,
  K: readonly number[],
  s: FrameState,
  tally: BeatTally,
): FrameState {
  const { spec } = space
  const N = 2 * spec.D + 1
  const theta = Math.acos(1 - spec.n / 2)
  const mix: [number, number] = [
    (Math.cos(theta) - 1) / 8,
    Math.sin(theta) / 8,
  ]
  const axes = frameAxes(spec.frame)
  // the love's step phase for each of its 8 slots
  const step: [number, number][] = Array.from(
    { length: 8 },
    (_, sl) => {
      const u = axes[sl >> 1]!
      const ph =
        -((sl & 1) === 0 ? 1 : -1) *
        u.reduce((x, v, k) => x + v * K[k]!, 0)

      return [Math.cos(ph), Math.sin(ph)]
    },
  )
  const out: FrameState = new Map()

  for (const [c, b0] of s) {
    const k = space.classes[c]!
    const b = Float64Array.from(b0)

    if (spec.n > 0 && k.loveGated) {
      mixBlock(b, 0, mix)
    }

    if (spec.n > 0 && k.fearGated) {
      mixBlock(b, 1, mix)
    }

    const th = (-Math.PI * k.costly) / N
    const cr = Math.cos(th)
    const ci = Math.sin(th)

    for (let i = 0; i < BLOCK; i += 2) {
      const r = b[i]!
      const m = b[i + 1]!

      b[i] = r * cr - m * ci
      b[i + 1] = r * ci + m * cr
    }

    coinBlock(b, 0)
    coinBlock(b, 1)

    for (let idx = 0; idx < 64; idx++) {
      const r = b[2 * idx]!
      const m = b[2 * idx + 1]!

      if (r === 0 && m === 0) {
        continue
      }

      const to = nextOf(space, c, idx)

      if (to < 0) {
        tally.escaped += r * r + m * m
        continue
      }

      const p = step[idx >> 3]!

      let o = out.get(to)

      if (!o) {
        o = new Float64Array(BLOCK)
        out.set(to, o)
      }

      o[2 * idx] = o[2 * idx]! + r * p[0] - m * p[1]
      o[2 * idx + 1] = o[2 * idx + 1]! + r * p[1] + m * p[0]
    }
  }

  for (const [c, b] of out) {
    let w = 0

    for (let i = 0; i < BLOCK; i++) {
      w += b[i]! ** 2
    }

    if (w < spec.floor) {
      tally.dropped += w
      out.delete(c)
    }
  }

  return out
}

// ---- readings ----

export type Moments = {
  weight: number
  tail: number
  meanString: number
  meanOffset: number
  lines: number[]
  bent: number
}

// weight; weight with at least `from` costly links or an offset of at least `from` dock steps (Euclidean, in docks);
// the mean string and |offset|; the weight with both vibes on each frame axis; the weight with the two on different
// axes or a register off one straight segment (a bent string)
export function momentsOf(
  space: FrameSpace,
  s: FrameState,
  from: number,
): Moments {
  const out: Moments = {
    weight: 0,
    tail: 0,
    meanString: 0,
    meanOffset: 0,
    lines: [0, 0, 0, 0],
    bent: 0,
  }

  for (const [c, b] of s) {
    const k = space.classes[c]!
    const r = Math.sqrt(k.offset.reduce((x, v) => x + v * v, 0))
    const axesUsed = new Set<number>()

    for (let i = 0; i < k.links.length; i += 6) {
      axesUsed.add(k.links[i + 4]!)
    }

    for (let idx = 0; idx < 64; idx++) {
      const w = b[2 * idx]! ** 2 + b[2 * idx + 1]! ** 2

      if (w === 0) {
        continue
      }

      out.weight += w

      if (k.costly >= from || r >= from) {
        out.tail += w
      }

      out.meanString += w * k.costly
      out.meanOffset += w * r

      const al = idx >> 4
      const af = (idx & 7) >> 1

      if (al === af && axesUsed.size <= 1) {
        out.lines[al]! += w
      } else {
        out.bent += w
      }
    }
  }

  if (out.weight > 0) {
    out.tail /= out.weight
    out.meanString /= out.weight
    out.meanOffset /= out.weight
    out.lines = out.lines.map(x => x / out.weight)
    out.bent /= out.weight
  }

  return out
}

// ---- the level from the autocorrelation ----

export type Ritz = {
  energy: number
  weight: number
  residual: number
  coefficients: [number, number][]
}

// c(t) for t = 0 .. T and the tallies
export function autocorrelation(
  space: FrameSpace,
  K: readonly number[],
  start: FrameState,
  T: number,
): { c: [number, number][]; tally: BeatTally } {
  const tally: BeatTally = { escaped: 0, dropped: 0 }
  const c: [number, number][] = [innerOf(start, start)]

  let s = start

  for (let t = 1; t <= T; t++) {
    s = frameBeat(space, K, s, tally)
    c.push(innerOf(start, s))
  }

  return { c, tally }
}

const conj = (a: [number, number]): [number, number] => [a[0], -a[1]]

// the Ritz levels of U on span{psi_0 .. psi_(M-1)}, M = floor(T/2), from c(0 .. T); rank cut `eps` on S
export function ritzLevels(
  c: readonly [number, number][],
  eps = 1e-11,
): Ritz[] {
  const M = Math.floor((c.length - 1) / 2)
  const at = (tau: number): [number, number] =>
    tau >= 0 ? c[tau]! : conj(c[-tau]!)
  const S = { re: new Float64Array(M * M), im: new Float64Array(M * M) }
  const A = { re: new Float64Array(M * M), im: new Float64Array(M * M) }
  const B = { re: new Float64Array(M * M), im: new Float64Array(M * M) }

  for (let s = 0; s < M; s++) {
    for (let t = 0; t < M; t++) {
      const z = at(t - s)
      const up = at(t - s + 1)
      const dn = at(t - s - 1)

      S.re[s * M + t] = z[0]
      S.im[s * M + t] = z[1]
      A.re[s * M + t] = (up[0] + dn[0]) / 2
      A.im[s * M + t] = (up[1] + dn[1]) / 2
      // (U - U^+)/(2i): (up - dn)/(2i)
      B.re[s * M + t] = (up[1] - dn[1]) / 2
      B.im[s * M + t] = -(up[0] - dn[0]) / 2
    }
  }

  const se = hermitianEigen(M, S.re, S.im, 1e-13)
  const top = Math.max(...se.values)
  const keep = se.values
    .map((v, i) => ({ v, i }))
    .filter(e => e.v > eps * top)
  const r = keep.length
  // W = V Lambda^(-1/2), M x r
  const Wre = new Float64Array(M * r)
  const Wim = new Float64Array(M * r)

  keep.forEach((e, j) => {
    const vec = se.vectors[e.i] as {
      re: Float64Array
      im: Float64Array
    }
    const f = 1 / Math.sqrt(e.v)

    for (let s = 0; s < M; s++) {
      Wre[s * r + j] = vec.re[s]! * f
      Wim[s * r + j] = vec.im[s]! * f
    }
  })

  // W^+ X W for a Hermitian X
  const project = (X: {
    re: Float64Array
    im: Float64Array
  }): { re: Float64Array; im: Float64Array } => {
    const XWre = new Float64Array(M * r)
    const XWim = new Float64Array(M * r)

    for (let s = 0; s < M; s++) {
      for (let j = 0; j < r; j++) {
        let xr = 0
        let xi = 0

        for (let t = 0; t < M; t++) {
          const ar = X.re[s * M + t]!
          const ai = X.im[s * M + t]!
          const br = Wre[t * r + j]!
          const bi = Wim[t * r + j]!

          xr += ar * br - ai * bi
          xi += ar * bi + ai * br
        }

        XWre[s * r + j] = xr
        XWim[s * r + j] = xi
      }
    }

    const out = {
      re: new Float64Array(r * r),
      im: new Float64Array(r * r),
    }

    for (let i = 0; i < r; i++) {
      for (let j = 0; j < r; j++) {
        let xr = 0
        let xi = 0

        for (let s = 0; s < M; s++) {
          const ar = Wre[s * r + i]!
          const ai = -Wim[s * r + i]!
          const br = XWre[s * r + j]!
          const bi = XWim[s * r + j]!

          xr += ar * br - ai * bi
          xi += ar * bi + ai * br
        }

        out.re[i * r + j] = xr
        out.im[i * r + j] = xi
      }
    }

    return out
  }

  const Ap = project(A)
  const Bp = project(B)
  // A + t B = sqrt(1 + t^2) cos(E + phi) on an exact level (A and B commute there), t the golden ratio's inverse, as
  // quantum-ladder unitaryEigen: E and its mirror 2 phi - E coincide only by accident. Each Ritz vector's energy is then
  // read from its own Rayleigh quotient of U, not from this combination
  const t = (Math.sqrt(5) - 1) / 2
  const Cp = {
    re: Ap.re.map((v, i) => v + t * Bp.re[i]!),
    im: Ap.im.map((v, i) => v + t * Bp.im[i]!),
  }
  const ae = hermitianEigen(r, Cp.re, Cp.im, 1e-13)
  const out: Ritz[] = []

  ae.values.forEach((mu, k) => {
    const y = ae.vectors[k] as { re: Float64Array; im: Float64Array }
    // x = W y
    const x: [number, number][] = []

    for (let s = 0; s < M; s++) {
      let xr = 0
      let xi = 0

      for (let j = 0; j < r; j++) {
        xr += Wre[s * r + j]! * y.re[j]! - Wim[s * r + j]! * y.im[j]!
        xi += Wre[s * r + j]! * y.im[j]! + Wim[s * r + j]! * y.re[j]!
      }

      x.push([xr, xi])
    }

    // quadratic forms x^+ X x on the Toeplitz matrices
    const form = (
      f: (tau: number) => [number, number],
    ): [number, number] => {
      let qr = 0
      let qi = 0

      for (let s = 0; s < M; s++) {
        for (let t = 0; t < M; t++) {
          const a = x[s]!
          const b = x[t]!
          const z = f(t - s)
          // conj(a) z b
          const zr = z[0] * b[0] - z[1] * b[1]
          const zi = z[0] * b[1] + z[1] * b[0]

          qr += a[0] * zr + a[1] * zi
          qi += a[0] * zi - a[1] * zr
        }
      }

      return [qr, qi]
    }

    const norm = form(at)[0]
    const u1 = form(tau => at(tau + 1))
    const lam: [number, number] = [u1[0] / norm, u1[1] / norm]
    const energy = -Math.atan2(lam[1], lam[0])
    // |U v - lambda v|^2 = |Uv|^2 - |lambda|^2 |v|^2 for the Rayleigh lambda, |Uv|^2 = |v|^2 when U is unitary
    const residual = Math.sqrt(
      Math.max(0, 1 - (lam[0] ** 2 + lam[1] ** 2)),
    )

    // the start's weight on v: |<v|psi_0>|^2 / <v|v>, <v|psi_0> = sum_t conj(x_t) conj(c(t))
    let wr = 0
    let wi = 0

    for (let t = 0; t < M; t++) {
      const a = x[t]!
      const z = conj(at(t))

      wr += a[0] * z[0] + a[1] * z[1]
      wi += a[0] * z[1] - a[1] * z[0]
    }

    void mu
    out.push({
      energy,
      weight: (wr * wr + wi * wi) / (norm * c[0]![0]),
      residual,
      coefficients: x.map(
        v =>
          [v[0] / Math.sqrt(norm), v[1] / Math.sqrt(norm)] as [
            number,
            number,
          ],
      ),
    })
  })

  return out
}

// v = sum_t x_t psi_t, normalized (a second pass of the evolution)
export function levelVector(
  space: FrameSpace,
  K: readonly number[],
  start: FrameState,
  coefficients: readonly [number, number][],
): FrameState {
  const tally: BeatTally = { escaped: 0, dropped: 0 }
  const out: FrameState = new Map()

  let s = start

  coefficients.forEach((x, t) => {
    if (t > 0) {
      s = frameBeat(space, K, s, tally)
    }

    for (const [c, b] of s) {
      let o = out.get(c)

      if (!o) {
        o = new Float64Array(BLOCK)
        out.set(c, o)
      }

      for (let i = 0; i < BLOCK; i += 2) {
        o[i] = o[i]! + x[0] * b[i]! - x[1] * b[i + 1]!
        o[i + 1] = o[i + 1]! + x[0] * b[i + 1]! + x[1] * b[i]!
      }
    }
  })

  const w = Math.sqrt(weightOf(out))

  for (const b of out.values()) {
    for (let i = 0; i < BLOCK; i++) {
      b[i] = b[i]! / w
    }
  }

  return out
}

// a state from amplitudes on (fear offset along one axis d, love slot, fear slot), the register the straight string
// between them (trit 1 on links 0 .. d - 1 for d > 0, trit 2 on links d .. -1 for d < 0, as the stream writes it)
export function lineState(
  space: FrameSpace,
  axis: number,
  entries: readonly {
    d: number
    jl: number
    jf: number
    amp: [number, number]
  }[],
): FrameState {
  const out: FrameState = new Map()

  for (const e of entries) {
    const reg = new Map<string, number>()

    if (e.d > 0) {
      for (let k = 0; k < e.d; k++) {
        reg.set(`${unit(axis, k).join(',')},${axis}`, 1)
      }
    }

    if (e.d < 0) {
      for (let k = e.d; k < 0; k++) {
        reg.set(`${unit(axis, k).join(',')},${axis}`, 2)
      }
    }

    const c = classOf(space, unit(axis, e.d), reg)

    let o = out.get(c)

    if (!o) {
      o = new Float64Array(BLOCK)
      out.set(c, o)
    }

    const idx = (2 * axis + e.jl) * 8 + 2 * axis + e.jf

    o[2 * idx] = o[2 * idx]! + e.amp[0]
    o[2 * idx + 1] = o[2 * idx + 1]! + e.amp[1]
  }

  return out
}

export function addStates(
  a: FrameState,
  b: FrameState,
  f = 1,
): FrameState {
  const out: FrameState = new Map(
    [...a].map(([c, x]) => [c, Float64Array.from(x)]),
  )

  for (const [c, x] of b) {
    let o = out.get(c)

    if (!o) {
      o = new Float64Array(BLOCK)
      out.set(c, o)
    }

    for (let i = 0; i < BLOCK; i++) {
      o[i] = o[i]! + f * x[i]!
    }
  }

  return out
}

export function normalized(s: FrameState): FrameState {
  const w = Math.sqrt(weightOf(s))

  return new Map([...s].map(([c, x]) => [c, x.map(v => v / w)]))
}
