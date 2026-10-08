// TWO VIBES ON TWO CROSSING MESH LINES, JOINED BY THE DRIFT COST'S STRING (E-SPN-0110). A STAND-IN for the question of
// note/project/vibe/roadmap/research/remaining-pieces.md idea 3a: can a bound composite move off a line?
//
// THE GEOMETRY. Two mesh lines of the D4 box that cross at one dock X, each closed into a ring of L docks (position 0 is
// X on both rings, position p is p docks along the line's first root). The two rings share X and nothing else: a
// figure eight. Each line has two slots at every dock (its first root, streaming to p + 1, and the opposite root,
// streaming to p - 1). At X the two lines' four slots all sit on the one dock.
//
// THE PIECES, each the working rule's own, read on this graph (code/rule/bound-line-pieces, code/rule/coined-locked-knit,
// code/rule/occupation-veto-knit, code/rule/bounce-pair-knit):
//  - THE COST: every link of the figure eight holds a center-flux trit (code/rule/drift-cost-line); every link with a
//    nonzero trit multiplies the amplitude by e^(-i pi / 7) per beat (pi / N, N = 2D + 1 = 7, the clock CLOCK = 14).
//  - THE COIN: on the line holding an open vibe, keep (1 + w)/2 or copy to the other slot of the same line with
//    (1 - w)/2, w = e^(2 pi i / 3). It acts inside one dock line, so two vibes on two lines are coined apart.
//  - THE CONTACT at X: the collision's bounce piece on the dock's occupation (bouncePermutation, the working 'pass'
//    kind, read from the committed BOUNCE_TABLE). With two single lines held at one dock it is the isometric map w_P of
//    the occupation momentum P, which (tmp/move3d-cross-probe) keeps two vibes whose roots meet at 60 degrees (dot 1) and
//    SWAPS the slots of two whose roots meet at 90 or 120 degrees (dot 0, -1): the vibe that came in on one line leaves
//    on the other. The piece is read from the table on every branch, not assumed; a slot image off the two lines is
//    refused. With `contact: 'off'` it is skipped (the separability check).
//  - THE STREAM: every vibe copied one position along its slot's root, the copy recorded on the crossed link (f - q
//    forward, f + q back, q = +1 a love, -1 a fear), so Gauss holds after every copy.
// The beat's order is bound-line-pieces': cost, coin, collision, stream. There is no like meeting (the two vibes are a
// love and a fear, or one vibe alone) and no pair move (the two never share a line at one dock: the swap exchanges
// them between the lines, so each line holds one of them). `sameLine` (the calibration) puts both vibes on line 0;
// two vibes then may share a slot, which the knit forbids and the stand-in tokens of code/rule/drift-cost-line allow
// (each is coined on its own and nothing meets): stated as the stand-in's convention, used for calibration only.
//
// THE REGISTER IS EXPLICIT: the flux on all 2L links is carried with every configuration, so nothing about the string's
// path is assumed. Gauss on the figure eight (the charge at X counts both rings' links) is checked by gaussHolds.
//
// Floats, as measurement: a stand-in, not the exact rule. DETERMINISM: no random numbers; starts are placed.

import {
  bouncePermutation,
  BOUNCE_TABLE,
} from '@/code/rule/bounce-pair-knit'
import { LINE_OF, OPPOSITE } from '@/code/rule/isometric-knit'
import { rootsD4 } from '@/code/algebra/group/integer-roots'
import { unitaryEigen, type Vec } from '@/code/measure/quantum-ladder'

export const CROSS_CLOCK = 14

const ROOTS = rootsD4()
const W: [number, number] = [-0.5, Math.sqrt(3) / 2]
const KEEP: [number, number] = [(1 + W[0]) / 2, W[1] / 2]
const FLIP: [number, number] = [(1 - W[0]) / 2, -W[1] / 2]

// a vibe on the figure eight: its line (0 or 1), its position on that line's ring (0 is X), its slot (0 the line's
// first root, 1 the opposite)
export type Body = { line: number; p: number; j: number }

export type CrossSpec = {
  readonly L: number
  // the first root (slot index 0 .. 23) of each line
  readonly roots: readonly [number, number]
  readonly charges: readonly number[]
  readonly cost: boolean
  readonly contact: 'rule' | 'off'
  // a static charge at X that never moves (the one-body problem: the string's other end)
  readonly anchor?: number
}

export type Amp = [number, number]
export type CrossState = Map<string, Amp>

const mod = (a: number, m: number): number => ((a % m) + m) % m

export const rootIndex = (r: readonly number[]): number =>
  ROOTS.findIndex(o => o.every((x, k) => x === r[k]))

export function slotOf(spec: CrossSpec, b: Body): number {
  const first = spec.roots[b.line]!

  return b.j === 0 ? first : OPPOSITE[first]!
}

function bodyOfSlot(
  spec: CrossSpec,
  d: number,
): { line: number; j: number } {
  for (let line = 0; line < 2; line++) {
    const first = spec.roots[line]!

    if (d === first) {
      return { line, j: 0 }
    }

    if (d === OPPOSITE[first]) {
      return { line, j: 1 }
    }
  }

  throw new Error(
    'crossing-lines: the contact sent a vibe off both lines',
  )
}

export function encode(
  bodies: readonly Body[],
  flux: readonly number[],
): string {
  return `${bodies.map(b => `${b.line}.${b.p}.${b.j}`).join(',')}|${flux.join('')}`
}

export function decode(key: string): {
  bodies: Body[]
  flux: number[]
} {
  const [b, f] = key.split('|') as [string, string]
  const bodies = b.split(',').map(t => {
    const [line, p, j] = t.split('.').map(Number) as [
      number,
      number,
      number,
    ]

    return { line, p, j }
  })

  return { bodies, flux: [...f].map(Number) }
}

// the string's length: the links holding a nonzero trit (what the cost reads)
export const stringLength = (flux: readonly number[]): number =>
  flux.reduce((a, v) => a + (v === 0 ? 0 : 1), 0)

// Gauss on the figure eight: at a dock off X, f_out - f_in = its charge on its ring; at X the two rings' net outflow
// is the charge there (both vibes' and the anchor's)
export function gaussHolds(
  spec: CrossSpec,
  bodies: readonly Body[],
  flux: readonly number[],
): boolean {
  const { L } = spec
  const charge = (line: number, p: number): number =>
    bodies.reduce(
      (a, b, i) =>
        a +
        (b.p === p && (p === 0 || b.line === line)
          ? spec.charges[i]!
          : 0),
      0,
    )

  for (let line = 0; line < 2; line++) {
    for (let p = 1; p < L; p++) {
      if (
        mod(
          flux[line * L + p]! -
            flux[line * L + p - 1]! -
            charge(line, p),
          3,
        ) !== 0
      ) {
        return false
      }
    }
  }

  const out = flux[0]! - flux[L - 1]! + flux[L]! - flux[2 * L - 1]!

  return mod(out - charge(0, 0) - (spec.anchor ?? 0), 3) === 0
}

const cmul = (a: Amp, b: Amp): Amp => [
  a[0] * b[0] - a[1] * b[1],
  a[0] * b[1] + a[1] * b[0],
]

function add(out: CrossState, key: string, a: Amp): void {
  const o = out.get(key)

  if (o) {
    o[0] += a[0]
    o[1] += a[1]
  } else {
    out.set(key, [a[0], a[1]])
  }
}

// the contact's slot images for the vibes at X (identity when fewer than one is there), read from the table
function contactAt(spec: CrossSpec, bodies: readonly Body[]): Body[] {
  if (spec.contact === 'off') {
    return bodies.map(b => ({ ...b }))
  }

  const at = bodies.map((b, i) => ({ b, i })).filter(t => t.b.p === 0)

  if (at.length === 0) {
    return bodies.map(b => ({ ...b }))
  }

  const vibe = new Int8Array(24)

  for (const t of at) {
    const d = slotOf(spec, t.b)

    if (vibe[d] !== 0) {
      throw new Error('crossing-lines: two vibes on one slot at X')
    }

    vibe[d] = spec.charges[t.i]!
  }

  const perm = new Int32Array(24)
  const moved =
    bouncePermutation(BOUNCE_TABLE, 'pass', vibe, 0, perm) !== 0
  const out = bodies.map(b => ({ ...b }))

  if (!moved) {
    return out
  }

  for (const t of at) {
    const image = bodyOfSlot(spec, perm[slotOf(spec, t.b)]!)

    out[t.i] = { line: image.line, p: 0, j: image.j }
  }

  return out
}

// one beat on a state: cost, coin (each vibe on its own line), contact at X, stream with the recorded copy
export function crossBeat(spec: CrossSpec, s: CrossState): CrossState {
  const { L } = spec
  const out: CrossState = new Map()
  const n = spec.charges.length

  for (const [key, a0] of s) {
    const { bodies, flux } = decode(key)
    const phase = spec.cost
      ? (-Math.PI * stringLength(flux)) / (CROSS_CLOCK / 2)
      : 0
    const a = cmul(a0, [Math.cos(phase), Math.sin(phase)])

    for (let mask = 0; mask < 1 << n; mask++) {
      let amp: Amp = a

      const coined = bodies.map((b, i) => {
        const flip = ((mask >> i) & 1) === 1

        amp = cmul(amp, flip ? FLIP : KEEP)

        return { ...b, j: flip ? 1 - b.j : b.j }
      })
      const hit = contactAt(spec, coined)
      const f = flux.slice()
      const moved = hit.map((b, i) => {
        const q = spec.charges[i]!

        if (b.j === 0) {
          f[b.line * L + b.p] = mod(f[b.line * L + b.p]! - q, 3)

          return { ...b, p: mod(b.p + 1, L) }
        }

        f[b.line * L + mod(b.p - 1, L)] = mod(
          f[b.line * L + mod(b.p - 1, L)]! + q,
          3,
        )

        return { ...b, p: mod(b.p - 1, L) }
      })

      add(out, encode(moved, f), amp)
    }
  }

  return out
}

// drop entries of weight below `floor` (a float stand-in); returns the dropped weight
export function prune(s: CrossState, floor: number): number {
  let dropped = 0

  for (const [k, a] of s) {
    const w = a[0] ** 2 + a[1] ** 2

    if (w < floor) {
      dropped += w
      s.delete(k)
    }
  }

  return dropped
}

export function weightOf(s: CrossState): number {
  let w = 0

  for (const a of s.values()) {
    w += a[0] ** 2 + a[1] ** 2
  }

  return w
}

export function overlapOf(a: CrossState, b: CrossState): Amp {
  let r = 0
  let i = 0

  for (const [k, x] of a) {
    const y = b.get(k)

    if (!y) {
      continue
    }

    r += x[0] * y[0] + x[1] * y[1]
    i += x[0] * y[1] - x[1] * y[0]
  }

  return [r, i]
}

// the signed position along a ring (the nearer way round from X)
export const signedPosition = (L: number, p: number): number =>
  p <= L / 2 ? p : p - L

// the unit direction of each line in the 4d root frame (a root has length sqrt 2; a dock step is one unit)
export const lineDirection = (
  spec: CrossSpec,
  line: number,
): number[] => ROOTS[spec.roots[line]!]!.map(x => x / Math.SQRT2)

// weight on strings longer than `n` links
export function tailWeight(s: CrossState, n: number): number {
  let w = 0

  for (const [k, a] of s) {
    if (stringLength(decode(k).flux) > n) {
      w += a[0] ** 2 + a[1] ** 2
    }
  }

  return w
}

// the centroid of the vibes (mean of their positions, docks along each line's direction), a 4d vector
export function centroid(spec: CrossSpec, s: CrossState): number[] {
  const out = [0, 0, 0, 0]

  let total = 0

  const dirs = [lineDirection(spec, 0), lineDirection(spec, 1)]

  for (const [k, a] of s) {
    const w = a[0] ** 2 + a[1] ** 2
    const { bodies } = decode(k)

    total += w

    for (const b of bodies) {
      const x = signedPosition(spec.L, b.p)

      for (let c = 0; c < 4; c++) {
        out[c] = out[c]! + (w * x * dirs[b.line]![c]!) / bodies.length
      }
    }
  }

  return out.map(x => x / total)
}

// e^(i sum_v k_line(v) x(v)) on every configuration: each vibe takes the momentum of its line
export function boost(
  spec: CrossSpec,
  s: CrossState,
  k: readonly [number, number],
): CrossState {
  const out: CrossState = new Map()

  for (const [key, a] of s) {
    const { bodies } = decode(key)
    const phase = bodies.reduce(
      (acc, b) => acc + k[b.line]! * signedPosition(spec.L, b.p),
      0,
    )

    out.set(key, cmul(a, [Math.cos(phase), Math.sin(phase)]))
  }

  return out
}

// the flux of vibes made at X and copied out to their positions along their own lines (the stream's record, step by
// step): the string runs from X along each line to its vibe
export function walkedFlux(
  spec: CrossSpec,
  bodies: readonly Body[],
): number[] {
  const { L } = spec
  const f = new Array<number>(2 * L).fill(0)

  bodies.forEach((b, i) => {
    const q = spec.charges[i]!
    const x = signedPosition(L, b.p)

    for (let s = 0; s < Math.abs(x); s++) {
      if (x > 0) {
        f[b.line * L + s] = mod(f[b.line * L + s]! - q, 3)
      } else {
        f[b.line * L + mod(-s - 1, L)] = mod(
          f[b.line * L + mod(-s - 1, L)]! + q,
          3,
        )
      }
    }
  })

  return f
}

// a placed packet: every vibe v on line lines[v] at signed positions -radius .. radius with amplitude
// envelope(x) e^(i k_v x) times the slot spinor spinors[v], the flux walked out from X; normalized
export function placedPacket(
  spec: CrossSpec,
  lines: readonly number[],
  radius: number,
  envelope: (x: number) => number,
  k: readonly number[],
  spinors: readonly (readonly [Amp, Amp])[],
): CrossState {
  const out: CrossState = new Map()
  const n = lines.length
  const xs: number[] = []

  for (let x = -radius; x <= radius; x++) {
    xs.push(x)
  }

  const choose = (v: number, acc: Body[], amp: Amp): void => {
    if (v === n) {
      add(out, encode(acc, walkedFlux(spec, acc)), amp)

      return
    }

    for (const x of xs) {
      for (const j of [0, 1]) {
        const e = envelope(x)
        const ph = k[v]! * x
        const sp = spinors[v]![j]!
        const a = cmul(
          cmul(amp, [e * Math.cos(ph), e * Math.sin(ph)]),
          sp,
        )

        choose(
          v + 1,
          [...acc, { line: lines[v]!, p: mod(x, spec.L), j }],
          a,
        )
      }
    }
  }

  choose(0, [], [1, 0])

  const w = Math.sqrt(weightOf(out))

  for (const a of out.values()) {
    a[0] /= w
    a[1] /= w
  }

  return out
}

export type CrossRun = {
  fidelity: number[]
  overlap: Amp[]
  tail: number[]
  centroid: number[][]
  dropped: number
  norm: number
  size: number
}

// `beats` beats from `start`, read every beat: fidelity with the start, weight on strings past `n`, the centroid;
// entries under `floor` are dropped every beat and the dropped weight summed
export function runCross(
  spec: CrossSpec,
  start: CrossState,
  beats: number,
  n: number,
  floor: number,
): CrossRun {
  let s = new Map([...start].map(([k, a]) => [k, [a[0], a[1]] as Amp]))

  const w0 = weightOf(start)
  const fidelity: number[] = []
  const overlap: Amp[] = [[1, 0]]
  const tail: number[] = []
  const track: number[][] = [centroid(spec, s)]

  let dropped = 0
  let size = s.size

  for (let t = 1; t <= beats; t++) {
    s = crossBeat(spec, s)
    dropped += prune(s, floor)
    size = Math.max(size, s.size)

    const o = overlapOf(start, s)

    overlap.push([o[0] / w0, o[1] / w0])
    fidelity.push((o[0] ** 2 + o[1] ** 2) / (w0 * w0))
    tail.push(tailWeight(s, n) / w0)
    track.push(centroid(spec, s))
  }

  return {
    fidelity,
    overlap,
    tail,
    centroid: track,
    dropped,
    norm: weightOf(s) / w0,
    size,
  }
}

// THE ENERGY A STATE SITS AT, read from its own run: the autocorrelation A(t) = <psi, U^t psi> (t = 0 .. T) under a
// Hann window, S(E) = |sum_t w(t) A(t) e^(i E t)|^2 (U = e^(-iH), so a level at E peaks at E), searched on a grid of
// `grid` points and refined by a parabola through the peak's neighbors. `share`: the weight of the largest peak's
// main lobe (+- 4 pi / T) in the summed spectrum. A state that is one level peaks once with share near 1.
export function spectralPeak(
  overlap: readonly Amp[],
  grid = 4096,
): { energy: number; share: number } {
  const T = overlap.length - 1

  const S = (E: number): number => {
    let r = 0
    let i = 0

    overlap.forEach((a, t) => {
      const w = 0.5 + 0.5 * Math.cos((Math.PI * t) / (T + 1))
      const c = Math.cos(E * t)
      const s = Math.sin(E * t)

      r += w * (a[0] * c - a[1] * s)
      i += w * (a[0] * s + a[1] * c)
    })

    return r * r + i * i
  }

  const values: number[] = []

  for (let g = 0; g < grid; g++) {
    values.push(S(-Math.PI + (2 * Math.PI * g) / grid))
  }

  let best = 0

  values.forEach((v, g) => {
    if (v > values[best]!) {
      best = g
    }
  })

  const h = (2 * Math.PI) / grid
  const y0 = values[mod(best - 1, grid)]!
  const y1 = values[best]!
  const y2 = values[mod(best + 1, grid)]!
  const shift =
    y0 - 2 * y1 + y2 === 0 ? 0 : (0.5 * (y0 - y2)) / (y0 - 2 * y1 + y2)
  const energy = -Math.PI + h * (best + shift)
  // the Hann window's main lobe: two bins either side
  const half = Math.round((4 * Math.PI) / (T + 1) / h)

  let near = 0
  let total = 0

  values.forEach((v, g) => {
    total += v

    const d = Math.min(mod(g - best, grid), mod(best - g, grid))

    if (d <= half) {
      near += v
    }
  })

  return { energy, share: near / total }
}

// the state with the two lines exchanged: every vibe moved to the other line at the same position and slot label, and
// the two rings' fluxes exchanged (the relabeling that the figure eight's two identical rings allow)
export function exchangeLines(
  spec: CrossSpec,
  s: CrossState,
): CrossState {
  const { L } = spec
  const out: CrossState = new Map()

  for (const [k, a] of s) {
    const { bodies, flux } = decode(k)

    out.set(
      encode(
        bodies.map(b => ({ ...b, line: 1 - b.line })),
        [...flux.slice(L), ...flux.slice(0, L)],
      ),
      [a[0], a[1]],
    )
  }

  return out
}

// a one-vibe state of a love on line 0 carried to a fear on line 1: the same amplitudes, the vibe on the other line and
// its ring's flux moved to the other ring and negated (charge conjugation with the lines exchanged)
export function conjugateOther(
  spec: CrossSpec,
  s: CrossState,
): CrossState {
  const { L } = spec
  const out: CrossState = new Map()

  for (const [k, a] of s) {
    const { bodies, flux } = decode(k)
    const f = new Array<number>(2 * L).fill(0)

    flux.forEach((v, i) => {
      f[mod(i + L, 2 * L)] = mod(-v, 3)
    })

    out.set(
      encode(
        bodies.map(b => ({ ...b, line: 1 - b.line })),
        f,
      ),
      [a[0], a[1]],
    )
  }

  return out
}

// ---------------------------------------------------------------------------------------------------------
// 3b: a line composite's band averaged over the twelve line classes of the D4 mesh

// the twelve line directions (one root of each line, unit length)
export const lineClasses = (): number[][] => {
  const seen = new Set<number>()
  const out: number[][] = []

  ROOTS.forEach((r, d) => {
    const l = LINE_OF[d]!

    if (seen.has(l)) {
      return
    }

    seen.add(l)
    out.push(r.map(x => x / Math.SQRT2))
  })

  return out
}

// sum over the twelve lines of (n . u)^m
export const designSum = (n: readonly number[], m: number): number =>
  lineClasses().reduce(
    (a, u) => a + u.reduce((s, x, c) => s + x * n[c]!, 0) ** m,
    0,
  )

// a state spread equally over the twelve line classes, each branch a one-line composite of band `band` carrying the
// momentum K n projected on its line: the mean energy, the mean velocity (4d) and the branches' rms velocity spread
export function classAverage(
  n: readonly number[],
  K: number,
  band: (k: number) => { energy: number; slope: number },
): { energy: number; velocity: number[]; spread: number } {
  const lines = lineClasses()

  let energy = 0

  const velocity = [0, 0, 0, 0]
  const vs: number[][] = []

  for (const u of lines) {
    const k = K * u.reduce((s, x, c) => s + x * n[c]!, 0)
    const b = band(k)
    const v = u.map(x => x * b.slope)

    energy += b.energy / lines.length
    v.forEach((x, c) => (velocity[c] = velocity[c]! + x / lines.length))
    vs.push(v)
  }

  const spread = Math.sqrt(
    vs.reduce(
      (a, v) =>
        a + v.reduce((s, x, c) => s + (x - velocity[c]!) ** 2, 0),
      0,
    ) / vs.length,
  )

  return { energy, velocity, spread }
}

export function sumStates(
  a: CrossState,
  b: CrossState,
  sign: number,
): CrossState {
  const out: CrossState = new Map()

  for (const [k, x] of a) {
    add(out, k, x)
  }

  for (const [k, x] of b) {
    add(out, k, [sign * x[0], sign * x[1]])
  }

  const w = Math.sqrt(weightOf(out))

  for (const x of out.values()) {
    x[0] /= w
    x[1] /= w
  }

  return out
}

// the least-squares velocity of a centroid track (docks a beat, 4d), and its two components on the lines' directions
// (v = alpha u0 + beta u1, solved on the pair's Gram matrix)
export function trackVelocity(
  spec: CrossSpec,
  track: readonly number[][],
): { velocity: number[]; alpha: number; beta: number; reach: number } {
  const T = track.length
  const tm = (T - 1) / 2

  let den = 0

  for (let t = 0; t < T; t++) {
    den += (t - tm) ** 2
  }

  const velocity = [0, 1, 2, 3].map(
    c =>
      track.reduce(
        (a, x, t) => a + (t - tm) * (x[c]! - track[0]![c]!),
        0,
      ) / den,
  )
  const u0 = lineDirection(spec, 0)
  const u1 = lineDirection(spec, 1)
  const d = (a: readonly number[], b: readonly number[]): number =>
    a.reduce((s, x, k) => s + x * b[k]!, 0)
  const g = d(u0, u1)
  const p0 = d(velocity, u0)
  const p1 = d(velocity, u1)
  const det = 1 - g * g
  const alpha = Math.abs(det) < 1e-12 ? p0 : (p0 - g * p1) / det
  const beta = Math.abs(det) < 1e-12 ? 0 : (p1 - g * p0) / det
  const reach = Math.max(
    ...track.map(x =>
      Math.sqrt(x.reduce((a, v, c) => a + (v - track[0]![c]!) ** 2, 0)),
    ),
  )

  return { velocity, alpha, beta, reach }
}

// ---------------------------------------------------------------------------------------------------------
// the one-vibe problem: one vibe on its line, the string's other end a static charge at X

export type OneBody = {
  spec: CrossSpec
  keys: string[]
  index: Map<string, number>
  re: Float64Array
  im: Float64Array
}

// the configurations the beat reaches from the vibe at X on either slot with no flux, and the beat as a dense matrix
export function oneBody(spec: CrossSpec, line: number): OneBody {
  if (spec.charges.length !== 1) {
    throw new Error('crossing-lines: oneBody takes one vibe')
  }

  const zero = new Array<number>(2 * spec.L).fill(0)
  const keys: string[] = []
  const index = new Map<string, number>()
  const queue: string[] = []

  const visit = (k: string): void => {
    if (index.has(k)) {
      return
    }

    index.set(k, keys.length)
    keys.push(k)
    queue.push(k)
  }

  for (const j of [0, 1]) {
    visit(encode([{ line, p: 0, j }], zero))
  }

  const images: CrossState[] = []

  while (queue.length > 0) {
    const k = queue.shift()!
    const image = crossBeat(spec, new Map([[k, [1, 0]]]))

    images[index.get(k)!] = image

    for (const t of image.keys()) {
      visit(t)
    }
  }

  const n = keys.length
  const re = new Float64Array(n * n)
  const im = new Float64Array(n * n)

  images.forEach((image, col) => {
    for (const [t, a] of image) {
      const row = index.get(t)!

      re[row * n + col] = a[0]
      im[row * n + col] = a[1]
    }
  })

  return { spec, keys, index, re, im }
}

export type OneLevel = {
  energy: number
  vector: Vec
  meanString: number
  tail: number
}

// the one-vibe levels (energy = minus the phase per beat), each with its mean string length and its weight past `n`
export function oneLevels(
  o: OneBody,
  n: number,
): { levels: OneLevel[]; residual: number } {
  const size = o.keys.length
  const e = unitaryEigen(size, o.re, o.im)
  const strings = o.keys.map(k => stringLength(decode(k).flux))
  const levels = e.vectors.map((v, i) => {
    let mean = 0
    let tail = 0

    for (let c = 0; c < size; c++) {
      const w = v.re[c]! ** 2 + v.im[c]! ** 2

      mean += w * strings[c]!

      if (strings[c]! > n) {
        tail += w
      }
    }

    return { energy: -e.phases[i]!, vector: v, meanString: mean, tail }
  })

  return { levels, residual: e.residual }
}

export const levelState = (o: OneBody, v: Vec): CrossState =>
  new Map(o.keys.map((k, c) => [k, [v.re[c]!, v.im[c]!] as Amp]))

// the product of two one-vibe states (vibe 0 on line 0, vibe 1 on line 1, fluxes on disjoint rings) as a two-vibe state
export function productState(a: CrossState, b: CrossState): CrossState {
  const out: CrossState = new Map()

  for (const [ka, x] of a) {
    const da = decode(ka)

    for (const [kb, y] of b) {
      const db = decode(kb)

      out.set(
        encode(
          [...da.bodies, ...db.bodies],
          da.flux.map((f, i) => mod(f + db.flux[i]!, 3)),
        ),
        cmul(x, y),
      )
    }
  }

  return out
}

// |<u, B_k v>|^2 over the one-vibe levels u, for the boost B_k of one vibe by k
export function levelWeights(
  o: OneBody,
  levels: readonly OneLevel[],
  v: Vec,
  k: number,
): number[] {
  const size = o.keys.length
  const phase = o.keys.map(
    key => k * signedPosition(o.spec.L, decode(key).bodies[0]!.p),
  )
  const bre = new Float64Array(size)
  const bim = new Float64Array(size)

  for (let c = 0; c < size; c++) {
    const cs = Math.cos(phase[c]!)
    const sn = Math.sin(phase[c]!)

    bre[c] = v.re[c]! * cs - v.im[c]! * sn
    bim[c] = v.re[c]! * sn + v.im[c]! * cs
  }

  return levels.map(l => {
    let r = 0
    let i = 0

    for (let c = 0; c < size; c++) {
      r += l.vector.re[c]! * bre[c]! + l.vector.im[c]! * bim[c]!
      i += l.vector.re[c]! * bim[c]! - l.vector.im[c]! * bre[c]!
    }

    return r * r + i * i
  })
}

// the Gauss-consistent flux assignments of a small figure eight, counted by brute force (the Z_3 obstruction)
export function gaussCount(
  spec: CrossSpec,
  bodies: readonly Body[],
): number {
  const links = 2 * spec.L

  let count = 0

  for (let x = 0; x < 3 ** links; x++) {
    const f: number[] = []

    let r = x

    for (let l = 0; l < links; l++) {
      f.push(r % 3)
      r = Math.floor(r / 3)
    }

    if (gaussHolds(spec, bodies, f)) {
      count++
    }
  }

  return count
}

// the slot fates at a crossing dock: for every ordered pair of slots on two different lines, the contact's images
export function crossingCensus(
  kinds: readonly [number, number],
): Map<string, number> {
  const tally = new Map<string, number>()
  const perm = new Int32Array(24)

  for (let d1 = 0; d1 < 24; d1++) {
    for (let d2 = 0; d2 < 24; d2++) {
      if (LINE_OF[d1] === LINE_OF[d2]) {
        continue
      }

      const vibe = new Int8Array(24)

      vibe[d1] = kinds[0]
      vibe[d2] = kinds[1]

      const moved =
        bouncePermutation(BOUNCE_TABLE, 'pass', vibe, 0, perm) !== 0
      const i1 = moved ? perm[d1]! : d1
      const i2 = moved ? perm[d2]! : d2
      const r1 = ROOTS[d1]!
      const r2 = ROOTS[d2]!
      const dot = r1.reduce((s, x, k) => s + x * r2[k]!, 0)
      const fate =
        i1 === d1 && i2 === d2
          ? 'keep'
          : i1 === d2 && i2 === d1
            ? 'swap'
            : 'other'
      const key = `${dot}:${fate}`

      tally.set(key, (tally.get(key) ?? 0) + 1)
    }
  }

  return tally
}
