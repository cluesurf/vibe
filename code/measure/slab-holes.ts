// THREE HOLES IN A FILLED LOVE SEA ON A SLAB OF THE HUSK, A STAND-IN (E-SPN-0135). E-SPN-0130 found that with flat
// links, a filled love sea and the fermionic frame mixer, a lone hole moves freely; E-SPN-0132 found the sea's smallest
// string-bound neutral composite is three holes, the particle-hole image of E-SPN-0104's three-love level, and that its
// 4d window (2.8e9 amplitudes) is out of reach. This is the reduced geometry that still lets the three turn.
//
// THE GEOMETRY. The frame lattice of E-SPN-0121/0131 (a vibe keeps its frame forever, so it walks on the hypercubic Z^4
// of the frame's four orthogonal roots) cut down to `axes` of its lines:
//   axes 1  one line: two slots a dock, positions on Z. The one-line limit (E-SPN-0104's sector)
//   axes 2  the slab: two orthogonal lines of one frame, four slots a dock, positions on Z^2, and the mixer turning only
//           among those four slots. The smallest geometry with two independent directions of motion, since one line
//           gives one direction and a turn needs a second line of the same frame to turn onto
// A slot is s = 2 a + j (a the axis, j 0 streaming along +u_a, 1 along -u_a).
//
// THE HOLES, FIRST QUANTIZED. The sea fills every slot. A dock line's Fock operator before the stream is 1 on an empty
// line, the coin u on one vibe, and phi2 on a full line (det u times the meeting's w times the contact unit's lift;
// the passing knit's unit is 0, E-SPN-0093). Relative to the full sea (every full line's phi2 divided out), a hole
// c_a |full> evolves under (det u / phi2) conj(u) (the annihilator transforms by conj(u), the rest of the line gives
// det u), and two holes on one line (an empty line) take 1 / phi2. So the holes' contact beyond the product of their
// one-body matrices is g_h = (1 / phi2) / det((det u / phi2) conj(u)) = phi2 / det u, the SAME as the loves' g = phi2 /
// det u. And det u conj(u) = sigma_z u sigma_z for any unitary u = k I + c X (derived: det u conj(k) = k, det u conj(c)
// = -c), so the one-hole matrix is sigma_z u sigma_z / phi2. So on one line, mixer off, n holes evolve as
// phi2^(-n) G U_love G^-1, G the sign (-1)^(holes on a back slot): the particle-hole image is exact, a phase and a gauge
// (phi2 = w^2 for the passing knit, so phi2^(-3) = 1 for three holes). The frame mixer
// M = exp(i theta N_u) takes a full frame to its det, e^(i theta), and a hole to conj(M_theta) = I + (e^(-i theta) - 1)
// J / m (m the frame's slots): its one-body image, no contact. So every piece is one-body on the holes but the contact,
// and the holes are antisymmetric wavefunctions: Pauli and the fermion sign come with the antisymmetry.
//
// ONE BEAT, in E-SPN-0130's order: the mixer on every dock's frame (each hole, one-body), the drift cost e^(-i pi V/N)
// (N = 2 D + 1, V the route-free string: the Steiner length, the fewest frame links joining the holes, which for up to
// three docks on a hypercubic lattice is the bounding box's half perimeter; on one line the span), the coin on each
// hole's line, the contact g_h on each line holding two holes, the stream (each hole one dock along its slot). The
// Bloch form: positions anchored at the bounding box's least corner, a beat whose anchor moves by delta multiplies by
// e^(-i K . delta), K per dock step along each axis.
//
// THE WINDOW. A configuration whose V would pass `cut` is either dropped and counted as escaped ('absorb') or, as E-SPN
// 0087's box and code/measure/coined-line-bloch do, kept in place with every label flipped ('reflect', with the sign
// (-1)^n that carries that wall through the gauge G). 'reflect' is for the one-line comparison with E-SPN-0104's
// operator only.
//
// Floats, as measurement: a stand-in, not the exact rule. DETERMINISM: no random numbers; starts are placed. NOTHING
// MOVES: the cost is a phase, the coin, the contact and the mixer hand values between slots of one dock, the stream takes
// each value one dock along.

import { type Ritz } from '@/code/measure/frame-meson'
import {
  lineImage,
  type LineBasis,
} from '@/code/measure/coined-line-bloch'

type C = [number, number]

const W: C = [-0.5, Math.sqrt(3) / 2]
const cmul = (a: C, b: C): C => [
  a[0] * b[0] - a[1] * b[1],
  a[0] * b[1] + a[1] * b[0],
]

const cdiv = (a: C, b: C): C => {
  const d = b[0] * b[0] + b[1] * b[1]

  return [
    (a[0] * b[0] + a[1] * b[1]) / d,
    (a[1] * b[0] - a[0] * b[1]) / d,
  ]
}

const conjC = (a: C): C => [a[0], -a[1]]

// the working coin's entries and the contact lift e^(i pi unit / 3) (unit 0 the passing knit)
export type DockPieces = { keep: C; cross: C; contact: C }

// the loves' dock: the coin, and the contact beyond det u on a full line (the meeting's w times the lift)
export function loveDock(unit = 0): DockPieces {
  const keep: C = [(1 + W[0]) / 2, W[1] / 2]
  const cross: C = [(1 - W[0]) / 2, -W[1] / 2]
  const lift: C = [
    Math.cos((Math.PI * unit) / 3),
    Math.sin((Math.PI * unit) / 3),
  ]

  return { keep, cross, contact: cmul(W, lift) }
}

// the holes' dock, derived from the loves' Fock operator (1, u, phi2) relative to the full line: the one-hole matrix
// (det u / phi2) conj(u) and the contact (1 / phi2) / det of it
export function holeDock(unit = 0): DockPieces & { phi2: C; det: C } {
  const love = loveDock(unit)
  const det = cmul(love.keep, love.keep)
  const det2 = cmul(love.cross, love.cross)
  const detU: C = [det[0] - det2[0], det[1] - det2[1]]
  const phi2 = cmul(detU, love.contact)
  const f = cdiv(detU, phi2)
  const keep = cmul(f, conjC(love.keep))
  const cross = cmul(f, conjC(love.cross))
  const k2 = cmul(keep, keep)
  const c2 = cmul(cross, cross)
  const detH: C = [k2[0] - c2[0], k2[1] - c2[1]]

  return {
    keep,
    cross,
    contact: cdiv(cdiv([1, 0], phi2), detH),
    phi2,
    det: detU,
  }
}

export type SlabCost = 'steiner' | 'none'
export type SlabBoundary = 'absorb' | 'reflect'

export type SlabSpec = {
  readonly holes: number
  readonly axes: 1 | 2
  readonly cut: number
  // the mixer's rate n (2 - 2 cos theta = n, E-SPN-0121's convention; 3 is theta = 2 pi / 3, 0 is off)
  readonly rate: number
  readonly D: number
  readonly cost: SlabCost
  readonly boundary: SlabBoundary
  readonly unit?: number
}

export type SlabSpace = {
  spec: SlabSpec
  slots: number
  block: number
  configs: number
  // per configuration: coordinates, holes x axes, anchored at the least corner
  coords: Int8Array
  steiner: Int16Array
  // per entry (configuration * block + slot combination): the stream's target entry (-1 escaped) and anchor shift code
  target: Int32Array
  shift: Uint8Array
  // per entry: the number of lines holding two holes
  pairs: Uint8Array
  dock: ReturnType<typeof holeDock>
}

// the rectilinear Steiner length of up to three points: the bounding box's half perimeter
const steinerOf = (
  c: ArrayLike<number>,
  n: number,
  A: number,
  at = 0,
): number => {
  let v = 0

  for (let d = 0; d < A; d++) {
    let lo = Infinity
    let hi = -Infinity

    for (let i = 0; i < n; i++) {
      const x = c[at + i * A + d]!

      lo = Math.min(lo, x)
      hi = Math.max(hi, x)
    }

    v += hi - lo
  }

  return v
}

// the number of anchored three-point configurations (ordered) in `dims` dimensions with Steiner length at most w: per
// axis the triple's spread s is 1 way for s = 0 and 6 s ways otherwise (code/measure/link-holonomy steinerOffsetPairs,
// there fixed at 4 dimensions)
export function steinerWindow(dims: number, w: number): number {
  let total = 0

  const rec = (k: number, left: number, prod: number): void => {
    if (k === dims) {
      total += prod

      return
    }

    for (let s = 0; s <= left; s++) {
      rec(k + 1, left - s, prod * (s === 0 ? 1 : 6 * s))
    }
  }

  rec(0, w, 1)

  return total
}

export function slabSpace(spec: SlabSpec): SlabSpace {
  const n = spec.holes
  const A = spec.axes
  const base = spec.cut + 1
  const dims = n * A
  const size = base ** dims
  const lookup = new Int32Array(size).fill(-1)
  const list: number[] = []
  const c = new Int32Array(dims)

  for (let key = 0; key < size; key++) {
    let k = key

    for (let q = 0; q < dims; q++) {
      c[q] = k % base
      k = Math.floor(k / base)
    }

    let ok = true

    for (let d = 0; d < A && ok; d++) {
      let lo = Infinity

      for (let i = 0; i < n; i++) {
        lo = Math.min(lo, c[i * A + d]!)
      }

      if (lo !== 0) {
        ok = false
      }
    }

    if (!ok || steinerOf(c, n, A) > spec.cut) {
      continue
    }

    lookup[key] = list.length
    list.push(key)
  }

  const P = list.length
  const coords = new Int8Array(P * dims)
  const steiner = new Int16Array(P)

  list.forEach((key, p) => {
    let k = key

    for (let q = 0; q < dims; q++) {
      coords[p * dims + q] = k % base
      k = Math.floor(k / base)
    }

    steiner[p] = steinerOf(coords, n, A, p * dims)
  })

  const slots = 2 * A
  const block = slots ** n
  const target = new Int32Array(P * block)
  const shift = new Uint8Array(P * block)
  const pairs = new Uint8Array(P * block)
  const moved = new Int32Array(dims)
  const s = new Int32Array(n)

  for (let p = 0; p < P; p++) {
    for (let b = 0; b < block; b++) {
      let r = b

      for (let i = n - 1; i >= 0; i--) {
        s[i] = r % slots
        r = Math.floor(r / slots)
      }

      let two = 0

      for (let i = 0; i < n; i++) {
        for (let k = i + 1; k < n; k++) {
          if (s[i]! >> 1 !== s[k]! >> 1) {
            continue
          }

          let same = true

          for (let d = 0; d < A; d++) {
            if (
              coords[p * dims + i * A + d] !==
              coords[p * dims + k * A + d]
            ) {
              same = false
            }
          }

          if (same) {
            two++
          }
        }
      }

      pairs[p * block + b] = two

      for (let q = 0; q < dims; q++) {
        moved[q] = coords[p * dims + q]!
      }

      for (let i = 0; i < n; i++) {
        const si = s[i]!

        moved[i * A + (si >> 1)] =
          moved[i * A + (si >> 1)]! + ((si & 1) === 0 ? 1 : -1)
      }

      const lows: number[] = []

      for (let d = 0; d < A; d++) {
        let lo = Infinity

        for (let i = 0; i < n; i++) {
          lo = Math.min(lo, moved[i * A + d]!)
        }

        lows.push(lo)
      }

      for (let i = 0; i < n; i++) {
        for (let d = 0; d < A; d++) {
          moved[i * A + d] = moved[i * A + d]! - lows[d]!
        }
      }

      if (steinerOf(moved, n, A) > spec.cut) {
        if (spec.boundary === 'absorb') {
          target[p * block + b] = -1
        } else {
          let flipped = 0

          for (let i = 0; i < n; i++) {
            flipped = flipped * slots + (s[i]! ^ 1)
          }

          target[p * block + b] = p * block + flipped
        }

        // code 9: kept in place, labels flipped, with the sign (-1)^n that carries the loves' wall through the gauge G
        // (a label flip changes G by -1 per hole), so the one-line hole beat is g^(-n) G U_love G^-1 at the wall too
        shift[p * block + b] = spec.boundary === 'absorb' ? 4 : 9
        continue
      }

      let key = 0

      for (let q = dims - 1; q >= 0; q--) {
        key = key * base + moved[q]!
      }

      const to = lookup[key]!

      if (to < 0) {
        throw new Error(
          'slab-holes: a moved configuration is outside the window',
        )
      }

      target[p * block + b] = to * block + b
      // shift code: (dx + 1) * 3 + (dy + 1), dy 0 on one line
      shift[p * block + b] =
        (lows[0]! + 1) * 3 + (A === 2 ? lows[1]! : 0) + 1
    }
  }

  return {
    spec,
    slots,
    block,
    configs: P,
    coords,
    steiner,
    target,
    shift,
    pairs,
    dock: holeDock(spec.unit ?? 0),
  }
}

export type SlabState = { re: Float64Array; im: Float64Array }
export type SlabTally = { escaped: number }

export const emptyState = (space: SlabSpace): SlabState => ({
  re: new Float64Array(space.configs * space.block),
  im: new Float64Array(space.configs * space.block),
})

export function weightOfSlab(s: SlabState): number {
  let w = 0

  for (let i = 0; i < s.re.length; i++) {
    w += s.re[i]! ** 2 + s.im[i]! ** 2
  }

  return w
}

export function innerSlab(u: SlabState, v: SlabState): C {
  let r = 0
  let i = 0

  for (let k = 0; k < u.re.length; k++) {
    const ar = u.re[k]!
    const ai = u.im[k]!
    const br = v.re[k]!
    const bi = v.im[k]!

    r += ar * br + ai * bi
    i += ar * bi - ai * br
  }

  return [r, i]
}

export const thetaOfRate = (rate: number): number =>
  Math.acos(1 - rate / 2)

// one beat at momentum K (per dock step along each axis), in place of `s`'s content; returns the new state
export function slabBeat(
  space: SlabSpace,
  K: readonly number[],
  s: SlabState,
  tally: SlabTally,
): SlabState {
  const { spec, slots, block, configs } = space
  const n = spec.holes
  const { re, im } = s
  const theta = thetaOfRate(spec.rate)

  // the mixer on each hole: v + z (sum v) / slots, z = e^(-i theta) - 1
  if (spec.rate !== 0) {
    const zr = (Math.cos(theta) - 1) / slots
    const zi = -Math.sin(theta) / slots

    for (let i = 0; i < n; i++) {
      const stride = slots ** (n - 1 - i)

      for (
        let base = 0;
        base < configs * block;
        base += stride * slots
      ) {
        for (let o = 0; o < stride; o++) {
          let sr = 0
          let si = 0

          for (let q = 0; q < slots; q++) {
            sr += re[base + o + q * stride]!
            si += im[base + o + q * stride]!
          }

          const ar = zr * sr - zi * si
          const ai = zr * si + zi * sr

          for (let q = 0; q < slots; q++) {
            re[base + o + q * stride] = re[base + o + q * stride]! + ar
            im[base + o + q * stride] = im[base + o + q * stride]! + ai
          }
        }
      }
    }
  }

  // the coin on each hole's line
  const { keep, cross, contact } = space.dock

  for (let i = 0; i < n; i++) {
    const stride = slots ** (n - 1 - i)

    for (let base = 0; base < configs * block; base += stride * slots) {
      for (let o = 0; o < stride; o++) {
        for (let a = 0; a < slots / 2; a++) {
          const x = base + o + 2 * a * stride
          const y = x + stride
          const xr = re[x]!
          const xi = im[x]!
          const yr = re[y]!
          const yi = im[y]!

          re[x] =
            keep[0] * xr - keep[1] * xi + cross[0] * yr - cross[1] * yi

          im[x] =
            keep[0] * xi + keep[1] * xr + cross[0] * yi + cross[1] * yr

          re[y] =
            cross[0] * xr - cross[1] * xi + keep[0] * yr - keep[1] * yi

          im[y] =
            cross[0] * xi + cross[1] * xr + keep[0] * yi + keep[1] * yr
        }
      }
    }
  }

  // the cost and the contact, then the stream
  const N = 2 * spec.D + 1
  const contactPow: C[] = [[1, 0]]

  for (let k = 1; k <= 3; k++) {
    contactPow.push(cmul(contactPow[k - 1]!, contact))
  }

  const shiftPhase: C[] = []

  for (let code = 0; code < 9; code++) {
    const dx = Math.floor(code / 3) - 1
    const dy = (code % 3) - 1
    const ph = -((K[0] ?? 0) * dx + (K[1] ?? 0) * dy)

    shiftPhase.push([Math.cos(ph), Math.sin(ph)])
  }

  shiftPhase.push([n % 2 === 0 ? 1 : -1, 0])

  const out = emptyState(space)

  for (let p = 0; p < configs; p++) {
    const th =
      spec.cost === 'none' ? 0 : (-Math.PI * space.steiner[p]!) / N
    const cost: C = [Math.cos(th), Math.sin(th)]

    for (let b = 0; b < block; b++) {
      const e = p * block + b
      const vr = re[e]!
      const vi = im[e]!

      if (vr === 0 && vi === 0) {
        continue
      }

      const ph = cmul(
        cmul(cost, contactPow[space.pairs[e]!]!),
        shiftPhase[space.shift[e]!]!,
      )
      const t = space.target[e]!

      if (t < 0) {
        tally.escaped += vr * vr + vi * vi
        continue
      }

      out.re[t] = out.re[t]! + ph[0] * vr - ph[1] * vi
      out.im[t] = out.im[t]! + ph[0] * vi + ph[1] * vr
    }
  }

  return out
}

const copyState = (s: SlabState): SlabState => ({
  re: Float64Array.from(s.re),
  im: Float64Array.from(s.im),
})

export function slabAutocorrelation(
  space: SlabSpace,
  K: readonly number[],
  start: SlabState,
  T: number,
): { c: C[]; tally: SlabTally } {
  const tally: SlabTally = { escaped: 0 }
  const c: C[] = [innerSlab(start, start)]

  let s = copyState(start)

  for (let t = 1; t <= T; t++) {
    s = slabBeat(space, K, s, tally)
    c.push(innerSlab(start, s))
  }

  return { c, tally }
}

// v = sum_t x_t U^t start, normalized (code/measure/route-free-meson routeLevelVector on this space)
export function slabLevelVector(
  space: SlabSpace,
  K: readonly number[],
  start: SlabState,
  coefficients: readonly C[],
): SlabState {
  const tally: SlabTally = { escaped: 0 }
  const out = emptyState(space)

  let s = copyState(start)

  coefficients.forEach((x, t) => {
    if (t > 0) {
      s = slabBeat(space, K, s, tally)
    }

    for (let k = 0; k < s.re.length; k++) {
      const br = s.re[k]!
      const bi = s.im[k]!

      if (br === 0 && bi === 0) {
        continue
      }

      out.re[k] = out.re[k]! + x[0] * br - x[1] * bi
      out.im[k] = out.im[k]! + x[0] * bi + x[1] * br
    }
  })

  const w = Math.sqrt(weightOfSlab(out))

  for (let k = 0; k < out.re.length; k++) {
    out.re[k] = out.re[k]! / w
    out.im[k] = out.im[k]! / w
  }

  return out
}

// ---- placing E-SPN-0104's one-line level ----

export type LineToken = { x: number; j: number }

// a state from second-quantized configurations of loves on one line (tokens in their canonical order, amplitudes), put
// on axis `axis` of the slab as holes: every assignment of tokens to holes with the permutation's sign / sqrt(n!), the
// gauge G = (-1)^(tokens on a back slot), at y = 0 (or x = 0 on axis 1)
export function placeLine(
  space: SlabSpace,
  axis: number,
  entries: readonly { ts: readonly LineToken[]; amp: C }[],
): SlabState {
  const { spec, slots, block } = space
  const n = spec.holes
  const A = spec.axes
  const out = emptyState(space)
  const perms = permutations(n)
  const norm = 1 / Math.sqrt(perms.length)
  const index = coordIndex(space)

  for (const { ts, amp } of entries) {
    if (ts.length !== n) {
      throw new Error(
        'slab-holes: a placed configuration has the wrong number of tokens',
      )
    }

    const gauge = ts.reduce((g, t) => g * (t.j === 1 ? -1 : 1), 1)

    for (const { perm, sign } of perms) {
      const c = new Array<number>(n * A).fill(0)

      let b = 0

      for (let i = 0; i < n; i++) {
        const t = ts[perm[i]!]!

        c[i * A + axis] = t.x
        b = b * slots + 2 * axis + t.j
      }

      const p = index.get(c.join(','))

      if (p === undefined) {
        throw new Error(
          'slab-holes: a placed configuration is outside the window',
        )
      }

      const f = sign * gauge * norm
      const e = p * block + b

      out.re[e] = out.re[e]! + f * amp[0]
      out.im[e] = out.im[e]! + f * amp[1]
    }
  }

  return out
}

export function permutations(
  n: number,
): { perm: number[]; sign: number }[] {
  if (n === 1) {
    return [{ perm: [0], sign: 1 }]
  }

  const out: { perm: number[]; sign: number }[] = []

  for (const { perm, sign } of permutations(n - 1)) {
    for (let at = 0; at <= perm.length; at++) {
      const p = [...perm.slice(0, at), n - 1, ...perm.slice(at)]

      out.push({
        perm: p,
        sign: sign * ((perm.length - at) % 2 === 0 ? 1 : -1),
      })
    }
  }

  return out
}

const coordIndex = (space: SlabSpace): Map<string, number> => {
  const dims = space.spec.holes * space.spec.axes
  const m = new Map<string, number>()

  for (let p = 0; p < space.configs; p++) {
    m.set(
      Array.from(space.coords.subarray(p * dims, (p + 1) * dims)).join(
        ',',
      ),
      p,
    )
  }

  return m
}

export const addSlab = (u: SlabState, v: SlabState): SlabState => ({
  re: u.re.map((x, k) => x + v.re[k]!),
  im: u.im.map((x, k) => x + v.im[k]!),
})

export function normalizedSlab(s: SlabState): SlabState {
  const w = Math.sqrt(weightOfSlab(s))

  return { re: s.re.map(x => x / w), im: s.im.map(x => x / w) }
}

// ---- readings ----

// the weight at each Steiner length 0 .. cut
export function steinerShells(
  space: SlabSpace,
  s: SlabState,
): number[] {
  const out = new Array<number>(space.spec.cut + 1).fill(0)

  for (let p = 0; p < space.configs; p++) {
    let w = 0

    for (let b = 0; b < space.block; b++) {
      w +=
        s.re[p * space.block + b]! ** 2 +
        s.im[p * space.block + b]! ** 2
    }

    out[space.steiner[p]!] = out[space.steiner[p]!]! + w
  }

  return out
}

// the weight with the holes not all on one line of one axis: some hole on another axis's slot, or the holes' positions
// not on one line along the first hole's axis
export function offLineSlab(space: SlabSpace, s: SlabState): number {
  const { spec, slots, block } = space
  const n = spec.holes
  const A = spec.axes

  let w = 0

  for (let p = 0; p < space.configs; p++) {
    for (let b = 0; b < block; b++) {
      const e = p * block + b
      const x = s.re[e]! ** 2 + s.im[e]! ** 2

      if (x === 0) {
        continue
      }

      const axesOf: number[] = []

      let r = b

      for (let i = n - 1; i >= 0; i--) {
        axesOf[i] = (r % slots) >> 1
        r = Math.floor(r / slots)
      }

      const a0 = axesOf[0]!

      let off = axesOf.some(a => a !== a0)

      // positions across the line: the other axis's coordinates differ among holes
      for (let d = 0; d < A && !off; d++) {
        if (d === a0) {
          continue
        }

        const c0 = space.coords[p * n * A + d]!

        for (let i = 1; i < n; i++) {
          if (space.coords[p * n * A + i * A + d] !== c0) {
            off = true
          }
        }
      }

      if (off) {
        w += x
      }
    }
  }

  return w
}

// the largest |psi + P psi| over the transpositions P of hole 0 with each other hole, over the norm: 0 for an
// antisymmetric state
export function antisymmetryGap(
  space: SlabSpace,
  s: SlabState,
): number {
  const { spec, slots, block } = space
  const n = spec.holes
  const A = spec.axes

  if (n < 2) {
    return 0
  }

  const index = coordIndex(space)

  let worst = 0

  for (let k = 1; k < n; k++) {
    let gap = 0

    for (let p = 0; p < space.configs; p++) {
      const c = Array.from(
        space.coords.subarray(p * n * A, (p + 1) * n * A),
      )

      for (let d = 0; d < A; d++) {
        const t = c[d]!

        c[d] = c[k * A + d]!
        c[k * A + d] = t
      }

      const q = index.get(c.join(','))!

      for (let b = 0; b < block; b++) {
        const sl: number[] = []

        let r = b

        for (let i = n - 1; i >= 0; i--) {
          sl[i] = r % slots
          r = Math.floor(r / slots)
        }

        const t = sl[0]!

        sl[0] = sl[k]!
        sl[k] = t

        const b2 = sl.reduce((x, y) => x * slots + y, 0)
        const e = p * block + b
        const f = q * block + b2

        gap += (s.re[e]! + s.re[f]!) ** 2 + (s.im[e]! + s.im[f]!) ** 2
      }
    }

    worst = Math.max(worst, Math.sqrt(gap / weightOfSlab(s)))
  }

  return worst
}

// ---- the procedure: the dominant level, its hold, its curvature ----

export type SlabHold = {
  level: Ritz
  vector: SlabState
  fidelity: number[]
  tail: number[]
  minFidelity: number
  maxTail: number
  held: boolean
  normGap: number
  shells: number[]
  meanSteiner: number
  offLine: number
  antisymmetry: number
}

export function dominantRitz(
  c: readonly C[],
  ritz: (c: readonly C[]) => Ritz[],
): Ritz {
  return ritz(c).sort((x, y) => y.weight - x.weight)[0]!
}

export function holdLevel(
  space: SlabSpace,
  start: SlabState,
  input: {
    ritzBeats: number
    holdBeats: number
    fidelity: number
    tail: number
    tailFrom: number
    ritz: (c: readonly C[]) => Ritz[]
  },
): SlabHold {
  const K = [0, 0]
  const level = dominantRitz(
    slabAutocorrelation(space, K, start, input.ritzBeats).c,
    input.ritz,
  )
  const v = slabLevelVector(space, K, start, level.coefficients)
  const tally: SlabTally = { escaped: 0 }
  const fidelity: number[] = []
  const tail: number[] = []

  let u = copyState(v)

  for (let t = 0; t < input.holdBeats; t++) {
    u = slabBeat(space, K, u, tally)

    const [r, i] = innerSlab(v, u)
    const sh = steinerShells(space, u)

    fidelity.push(r * r + i * i)
    tail.push(
      tally.escaped +
        sh.slice(input.tailFrom).reduce((x, y) => x + y, 0),
    )
  }

  const shells = steinerShells(space, v)

  return {
    level,
    vector: v,
    fidelity,
    tail,
    minFidelity: Math.min(...fidelity),
    maxTail: Math.max(...tail),
    held:
      fidelity.every(f => f >= input.fidelity) &&
      tail.every(x => x <= input.tail),
    normGap: Math.abs(weightOfSlab(u) + tally.escaped - 1),
    shells,
    meanSteiner: shells.reduce((x, w, L) => x + w * L, 0),
    offLine: offLineSlab(space, v),
    antisymmetry: antisymmetryGap(space, u),
  }
}

// the dominant level's energy at momentum K, read from the autocorrelation of `start`
export const energyAtSlab = (
  space: SlabSpace,
  K: readonly number[],
  start: SlabState,
  beats: number,
  ritz: (c: readonly C[]) => Ritz[],
): number =>
  dominantRitz(slabAutocorrelation(space, K, start, beats).c, ritz)
    .energy

// the dominant level's energy at K of E-SPN-0104's love operator (code/measure/coined-line-bloch lineImage, its box),
// read from the autocorrelation of the configuration vector (cre, cim) exactly as energyAtSlab reads the holes
export function loveLineEnergy(
  basis: LineBasis,
  K: number,
  cre: Float64Array,
  cim: Float64Array,
  beats: number,
  ritz: (c: readonly C[]) => Ritz[],
): number {
  const c: C[] = []

  let re = Float64Array.from(cre)
  let im = Float64Array.from(cim)

  const dot = (): C => {
    let a = 0
    let b = 0

    for (let k = 0; k < re.length; k++) {
      a += cre[k]! * re[k]! + cim[k]! * im[k]!
      b += cre[k]! * im[k]! - cim[k]! * re[k]!
    }

    return [a, b]
  }

  c.push(dot())

  for (let t = 1; t <= beats; t++) {
    const w = lineImage(basis, K, re, im)

    re = w.re
    im = w.im
    c.push(dot())
  }

  return dominantRitz(c, ritz).energy
}

// E''(0) by second differences at kappa and 2 kappa, Richardson-extrapolated (the K^4 term removed)
export function richardsonCurvature(
  energy: (K: number) => number,
  kappa: number,
): { curvature: number; at: number; atDouble: number } {
  const e0 = energy(0)
  const d = (k: number): number =>
    (energy(k) + energy(-k) - 2 * e0) / (k * k)
  const at = d(kappa)
  const atDouble = d(2 * kappa)

  return { curvature: (4 * at - atDouble) / 3, at, atDouble }
}

// the inverse mass tensor d2E / dK_a dK_b in the slab (2 x 2), by second differences at step kappa along e_x, e_y and
// (e_x + e_y) / sqrt 2, and its eigenvalues ascending
export function slabTensor(
  space: SlabSpace,
  start: SlabState,
  kappa: number,
  beats: number,
  ritz: (c: readonly C[]) => Ritz[],
): { tensor: number[][]; eigen: number[]; energy: number } {
  const e0 = energyAtSlab(space, [0, 0], start, beats, ritz)
  const second = (d: readonly number[]): number =>
    (energyAtSlab(
      space,
      d.map(x => x * kappa),
      start,
      beats,
      ritz,
    ) +
      energyAtSlab(
        space,
        d.map(x => -x * kappa),
        start,
        beats,
        ritz,
      ) -
      2 * e0) /
    (kappa * kappa)
  const xx = second([1, 0])
  const yy = second([0, 1])
  const dd = second([Math.SQRT1_2, Math.SQRT1_2])
  const xy = dd - (xx + yy) / 2
  const mean = (xx + yy) / 2
  const r = Math.sqrt(((xx - yy) / 2) ** 2 + xy * xy)

  return {
    tensor: [
      [xx, xy],
      [xy, yy],
    ],
    eigen: [mean - r, mean + r],
    energy: e0,
  }
}
