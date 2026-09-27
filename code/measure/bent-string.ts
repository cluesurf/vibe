// A LOVE AND A FEAR ON CROSSING LINES WHOSE STRING CAN BEND (E-SPN-0116). The stand-in of code/measure/crossing-lines
// (E-SPN-0110) carried into the PLANE of the two lines: the two lines are the torus cycles b = 0 (line 0, first root
// u_A) and a = 0 (line 1, first root u_B) of an L x L patch (code/rule/plaquette-mixer), the flux a trit on every link
// of the patch, and the beat E-SPN-0110's with one piece put first:
//   mixer (code/rule/plaquette-mixer, its live faces, class 0 then class 1), cost, coin, contact at X, stream with the
//   recorded copy.
// The vibes never leave their lines (nothing here moves a vibe off one); only the string can leave them. With the mixer
// off, the flux off the two lines is never written and the beat is E-SPN-0110's crossBeat, entry for entry.
//
// The cost reads every link of the patch: e^(-i pi / 7) per beat per link with a nonzero trit, so a bent string pays
// for its length wherever it runs.
//
// THE REGISTER, WITHOUT LOSS, AS ONE INTEGER. Every flux the beat reaches is
//   f = walked(vibes) + c_0 (ring of line 0) + c_1 (ring of line 1) + sum over live faces g of m_g (boundary of g)
// walked: each vibe's charge copied from X out to its place along its own line the short way (what the stream records);
// c: the two windings (a figure eight has two independent cycles, the torus's two, and they are the lines' rings);
// m: the live faces' loop counts (independent: the live faces tile a disk). The stream changes the vibes and, crossing
// the far side of a ring, the winding; the mixer changes one m_g. So a configuration is (vibes, c, m), packed in one
// integer, and every register is rebuilt from it (checked against the directly tracked flux by `strict`).
//
// Floats, as measurement (the mixer's exactness is code/rule/plaquette-mixer's exactMixer). DETERMINISM: no random
// numbers; starts are placed or read off levels.

import { bouncePermutation, BOUNCE_TABLE } from '@/code/rule/bounce-pair-knit'
import { OPPOSITE } from '@/code/rule/isometric-knit'
import { CROSS_CLOCK, decode, encode, lineDirection, signedPosition, slotOf, type Body, type CrossSpec, type CrossState } from '@/code/measure/crossing-lines'
import { addTrit, mixerAmplitudes, type Flux, type Mixer, type PlanePatch } from '@/code/rule/plaquette-mixer'

export type Amp = [number, number]

export type BentSpec = { readonly cross: CrossSpec; readonly patch: PlanePatch; readonly mix: Mixer | null }

// configuration id -> amplitude
export type BentState = Map<number, Amp>

const W: Amp = [-0.5, Math.sqrt(3) / 2]
const KEEP: Amp = [(1 + W[0]) / 2, W[1] / 2]
const FLIP: Amp = [(1 - W[0]) / 2, -W[1] / 2]

const mod = (a: number, m: number): number => ((a % m) + m) % m
const cmul = (a: Amp, b: Amp): Amp => [a[0] * b[0] - a[1] * b[1], a[0] * b[1] + a[1] * b[0]]
const norm2 = (a: Amp): number => a[0] * a[0] + a[1] * a[1]

// the patch link of line `line`'s ring link p (p -> p + 1)
export const lineLink = (L: number, line: number, p: number): number => (line === 0 ? mod(p, L) : L * L + mod(p, L) * L)

// is patch link l on one of the two lines
export function onLines(L: number, l: number): boolean {
  const dir = Math.floor(l / (L * L))
  const d = l % (L * L)

  return (dir === 0 && Math.floor(d / L) === 0) || (dir === 1 && d % L === 0)
}

// ---------------------------------------------------------------------------------------------------------
// the codec

export type Codec = {
  readonly spec: BentSpec
  readonly L: number
  readonly vibes: number
  // the live faces in the mixer's order, and 3^k for each
  readonly faces: readonly number[]
  readonly slot: Map<number, number>
  readonly pow: readonly number[]
  readonly loops: number
  // per live face, its boundary links: sign, the line and ring index (line -1 off the lines), and every live face's
  // (slot, sign) on that link
  readonly boundary: readonly (readonly { sign: number; line: number; ring: number; loops: readonly (readonly [number, number])[] }[])[]
}

export type Config = { bodies: Body[]; sector: number; m: number }

export function bentCodec(spec: BentSpec): Codec {
  const faces: number[] = []

  for (const c of [0, 1]) for (let g = 0; g < spec.patch.faces; g++) if (spec.patch.faceLive[g] === 1 && spec.patch.faceClass[g] === c) faces.push(g)

  const pow = faces.map((_, k) => 3 ** k)
  const loops = 3 ** faces.length
  const L = spec.cross.L
  const vibes = spec.cross.charges.length

  if ((4 * L) ** vibes * 9 * loops > Number.MAX_SAFE_INTEGER) throw new Error('bent-string: the configuration does not fit one integer')
  if (spec.patch.L !== L) throw new Error('bent-string: the patch and the rings differ in L')

  const { patch } = spec
  const slot = new Map(faces.map((g, k) => [g, k]))
  const boundary = faces.map(g =>
    Array.from({ length: patch.size }, (_, t) => {
      const l = patch.faceLink[g * patch.size + t] as number
      const dir = Math.floor(l / (L * L))
      const d = l % (L * L)
      const line = dir === 0 && Math.floor(d / L) === 0 ? 0 : dir === 1 && d % L === 0 ? 1 : -1
      const ring = line === 0 ? d : line === 1 ? Math.floor(d / L) : -1
      const on: [number, number][] = []

      for (const h of [patch.linkFaces[l * 2] as number, patch.linkFaces[l * 2 + 1] as number]) {
        const k = slot.get(h)

        if (k === undefined) continue
        for (let u = 0; u < patch.size; u++) if (patch.faceLink[h * patch.size + u] === l) on.push([k, patch.faceSign[h * patch.size + u] as number])
      }

      return { sign: patch.faceSign[g * patch.size + t] as number, line, ring, loops: on }
    }),
  )

  return { spec, L, vibes, faces, slot, pow, loops, boundary }
}

// is live face k ON for configuration x: its oriented boundary values, each read directly from (walked, winding, loops)
export function faceOnConfig(c: Codec, x: Config, k: number): boolean {
  const { L } = c
  const charges = c.spec.cross.charges
  let first = -1
  const edges = c.boundary[k] as (typeof c.boundary)[number]

  for (let t = 0; t < edges.length; t++) {
    const e = edges[t] as (typeof edges)[number]
    let v = 0

    if (e.line >= 0) {
      v += e.line === 0 ? x.sector % 3 : Math.floor(x.sector / 3)
      x.bodies.forEach((b, i) => {
        if (b.line !== e.line) return

        const s = signedPosition(L, b.p)

        if (s > 0 && e.ring < s) v -= charges[i] as number
        if (s < 0 && e.ring >= L + s) v += charges[i] as number
      })
    }

    for (const [h, sg] of e.loops) v += loopOf(c, x.m, h) * sg

    const o = mod(e.sign * v, 3)

    if (t === 0) first = o
    else if (o !== first) return true
  }

  return false
}

export function packConfig(c: Codec, x: Config): number {
  let b = 0

  for (let i = x.bodies.length - 1; i >= 0; i--) {
    const v = x.bodies[i] as Body

    b = b * 4 * c.L + v.line * 2 * c.L + v.p * 2 + v.j
  }

  return (b * 9 + x.sector) * c.loops + x.m
}

export function unpackConfig(c: Codec, id: number): Config {
  const m = id % c.loops
  let rest = Math.floor(id / c.loops)
  const sector = rest % 9

  rest = Math.floor(rest / 9)

  const bodies: Body[] = []

  for (let i = 0; i < c.vibes; i++) {
    const v = rest % (4 * c.L)

    rest = Math.floor(rest / (4 * c.L))
    bodies.push({ line: Math.floor(v / (2 * c.L)), p: Math.floor((v % (2 * c.L)) / 2), j: v % 2 })
  }

  return { bodies, sector, m }
}

export const loopOf = (c: Codec, m: number, k: number): number => Math.floor(m / (c.pow[k] as number)) % 3

// the register of a configuration
export function fluxOf(c: Codec, x: Config): Flux {
  const { L } = c
  const { patch, cross } = c.spec
  const f: Flux = new Map()

  x.bodies.forEach((b, i) => {
    const q = cross.charges[i] as number
    const s = signedPosition(L, b.p)

    for (let t = 0; t < Math.abs(s); t++) {
      if (s > 0) addTrit(f, lineLink(L, b.line, t), -q)
      else addTrit(f, lineLink(L, b.line, -t - 1), q)
    }
  })

  const c0 = x.sector % 3
  const c1 = Math.floor(x.sector / 3)

  for (let p = 0; p < L; p++) {
    if (c0) addTrit(f, lineLink(L, 0, p), c0)
    if (c1) addTrit(f, lineLink(L, 1, p), c1)
  }

  c.faces.forEach((g, k) => {
    const mk = loopOf(c, x.m, k)

    if (mk === 0) return
    for (let t = 0; t < patch.size; t++) addTrit(f, patch.faceLink[g * patch.size + t] as number, mk * (patch.faceSign[g * patch.size + t] as number))
  })

  return f
}

// is live face k ON for this register (its oriented values not all equal)
function faceOnIn(c: Codec, f: Flux, g: number): boolean {
  const { patch } = c.spec
  let first = -1

  for (let t = 0; t < patch.size; t++) {
    const o = mod((patch.faceSign[g * patch.size + t] as number) * (f.get(patch.faceLink[g * patch.size + t] as number) ?? 0), 3)

    if (t === 0) first = o
    else if (o !== first) return true
  }

  return false
}

// the configuration of a directly tracked register (vibes and flux): the winding read on each ring's far link, which no
// walked path and no live face reaches; `strict` rebuilds it and throws on any difference
function configOf(c: Codec, bodies: Body[], f: Flux, m: number, strict: boolean): number {
  const far = Math.floor(c.L / 2)
  const c0 = f.get(lineLink(c.L, 0, far)) ?? 0
  const c1 = f.get(lineLink(c.L, 1, far)) ?? 0
  const x: Config = { bodies, sector: c0 + 3 * c1, m }

  if (strict) {
    const g = fluxOf(c, x)

    if (g.size !== f.size || [...f].some(([l, v]) => g.get(l) !== v)) throw new Error('bent-string: the register is not (walked, winding, loops)')
  }

  return packConfig(c, x)
}

function add(out: BentState, id: number, a: Amp): void {
  const o = out.get(id)

  if (o) {
    o[0] += a[0]
    o[1] += a[1]
  } else out.set(id, [a[0], a[1]])
}

function bodyOfSlot(spec: CrossSpec, d: number): { line: number; j: number } {
  for (let line = 0; line < 2; line++) {
    const first = spec.roots[line] as number

    if (d === first) return { line, j: 0 }
    if (d === OPPOSITE[first]) return { line, j: 1 }
  }

  throw new Error('bent-string: the contact sent a vibe off both lines')
}

// E-SPN-0110's contact at X, read from the committed bounce table on every branch
function contactAt(spec: CrossSpec, bodies: readonly Body[]): Body[] {
  const out = bodies.map(b => ({ ...b }))

  if (spec.contact === 'off') return out

  const at = bodies.map((b, i) => ({ b, i })).filter(t => t.b.p === 0)

  if (at.length === 0) return out

  const vibe = new Int8Array(24)

  for (const t of at) {
    const d = slotOf(spec, t.b)

    if (vibe[d] !== 0) throw new Error('bent-string: two vibes on one slot at X')
    vibe[d] = spec.charges[t.i] as number
  }

  const perm = new Int32Array(24)

  if (bouncePermutation(BOUNCE_TABLE, 'pass', vibe, 0, perm) === 0) return out

  for (const t of at) {
    const image = bodyOfSlot(spec, perm[slotOf(spec, t.b)] as number)

    out[t.i] = { line: image.line, p: 0, j: image.j }
  }

  return out
}

// ---------------------------------------------------------------------------------------------------------
// the beat

// the mixer on a whole state, one live face at a time (faces of one class commute, so this is the class product),
// merging after every face. Entries under `floor` are dropped after every face (a projection: the weight only falls)
export function mixState(c: Codec, mix: Mixer, s: BentState, floor = 0, strict = false): BentState {
  const amps = mixerAmplitudes(mix)
  let cur = s

  c.faces.forEach((g, k) => {
    const next: BentState = new Map()
    const step = c.pow[k] as number

    for (const [id, a] of cur) {
      const x = unpackConfig(c, id)
      const on = faceOnConfig(c, x, k)

      if (strict && on !== faceOnIn(c, fluxOf(c, x), g)) throw new Error('bent-string: the direct face reading disagrees with the register')
      if (!on) {
        add(next, id, a)
        continue
      }

      const mk = loopOf(c, x.m, k)

      for (let t = 0; t < 3; t++) add(next, id + (((mk + t) % 3) - mk) * step, cmul(a, amps[t] as Amp))
    }

    if (floor > 0) pruneBent(next, floor)
    cur = next
  })

  return cur
}

// one beat: mixer, cost, coin, contact, stream (`floor` prunes inside the mixer; the beat's output is the caller's)
export function bentBeat(c: Codec, s: BentState, floor = 0, strict = false): BentState {
  const { cross, mix } = c.spec
  const L = c.L
  const out: BentState = new Map()
  const n = cross.charges.length
  const mixed = mix && mix.r !== 0 ? mixState(c, mix, s, floor, strict) : s

  for (const [id, a0] of mixed) {
    const x = unpackConfig(c, id)
    const flux = fluxOf(c, x)
    const phase = cross.cost ? (-Math.PI * flux.size) / (CROSS_CLOCK / 2) : 0
    const a = cmul(a0, [Math.cos(phase), Math.sin(phase)])

    for (let mask = 0; mask < 1 << n; mask++) {
      let amp: Amp = a
      const coined = x.bodies.map((b, i) => {
        const flip = ((mask >> i) & 1) === 1

        amp = cmul(amp, flip ? FLIP : KEEP)

        return { ...b, j: flip ? 1 - b.j : b.j }
      })
      const hit = contactAt(cross, coined)
      const f: Flux = new Map(flux)
      const moved = hit.map((b, i) => {
        const q = cross.charges[i] as number

        if (b.j === 0) {
          addTrit(f, lineLink(L, b.line, b.p), -q)

          return { ...b, p: mod(b.p + 1, L) }
        }

        addTrit(f, lineLink(L, b.line, b.p - 1), q)

        return { ...b, p: mod(b.p - 1, L) }
      })

      add(out, configOf(c, moved, f, x.m, strict), amp)
    }
  }

  return out
}

// ---------------------------------------------------------------------------------------------------------
// states and readings

export function pruneBent(s: BentState, floor: number): number {
  let dropped = 0

  for (const [k, a] of s) {
    const w = norm2(a)

    if (w < floor) {
      dropped += w
      s.delete(k)
    }
  }

  return dropped
}

export const bentWeight = (s: BentState): number => [...s.values()].reduce((a, x) => a + norm2(x), 0)

export function bentOverlap(a: BentState, b: BentState): Amp {
  let r = 0
  let i = 0

  for (const [k, x] of a) {
    const y = b.get(k)

    if (!y) continue
    r += x[0] * y[0] + x[1] * y[1]
    i += x[0] * y[1] - x[1] * y[0]
  }

  return [r, i]
}

export function normalizeBent(s: BentState): void {
  const w = Math.sqrt(bentWeight(s))

  for (const a of s.values()) {
    a[0] /= w
    a[1] /= w
  }
}

export const cloneBent = (s: BentState): BentState => new Map([...s].map(([k, a]) => [k, [a[0], a[1]] as Amp]))

// a figure-eight state of code/measure/crossing-lines carried into the patch (its ring links are the lines' links)
export function fromCross(c: Codec, s: CrossState): BentState {
  const out: BentState = new Map()

  for (const [k, a] of s) {
    const { bodies, flux } = decode(k)
    const f: Flux = new Map()

    flux.forEach((v, i) => {
      if (v !== 0) f.set(lineLink(c.L, i < c.L ? 0 : 1, i % c.L), v)
    })
    add(out, configOf(c, bodies, f, 0, true), a)
  }

  return out
}

// the patch state read back on the figure eight, or null when any flux is off the lines
export function toCross(c: Codec, s: BentState): CrossState | null {
  const L = c.L
  const out: CrossState = new Map()

  for (const [id, a] of s) {
    const x = unpackConfig(c, id)
    const f = new Array<number>(2 * L).fill(0)

    for (const [l, v] of fluxOf(c, x)) {
      if (!onLines(L, l)) return null
      if (l < L * L) f[l] = v
      else f[L + Math.floor((l - L * L) / L)] = v
    }

    out.set(encode(x.bodies, f), [a[0], a[1]])
  }

  return out
}

// the largest amplitude difference between two figure-eight states
export function crossDistance(a: CrossState, b: CrossState): number {
  let worst = 0

  for (const k of new Set([...a.keys(), ...b.keys()])) {
    const x = a.get(k) ?? [0, 0]
    const y = b.get(k) ?? [0, 0]

    worst = Math.max(worst, Math.hypot(x[0] - y[0], x[1] - y[1]))
  }

  return worst
}

// weight on strings longer than `n` links (the whole patch counted)
export function bentTail(c: Codec, s: BentState, n: number): number {
  let w = 0

  for (const [id, a] of s) if (fluxOf(c, unpackConfig(c, id)).size > n) w += norm2(a)

  return w
}

// the centroid of the vibes, a 4d vector (docks along each line's direction)
export function bentCentroid(c: Codec, s: BentState): number[] {
  const out = [0, 0, 0, 0]
  let total = 0
  const dirs = [lineDirection(c.spec.cross, 0), lineDirection(c.spec.cross, 1)]

  for (const [id, a] of s) {
    const w = norm2(a)
    const { bodies } = unpackConfig(c, id)

    total += w
    for (const b of bodies) {
      const x = signedPosition(c.L, b.p)

      for (let d = 0; d < 4; d++) out[d] = (out[d] as number) + (w * x * ((dirs[b.line] as number[])[d] as number)) / bodies.length
    }
  }

  return out.map(x => x / total)
}

// e^(i sum_v k_line(v) x(v))
export function bentBoost(c: Codec, s: BentState, k: readonly [number, number]): BentState {
  const out: BentState = new Map()

  for (const [id, a] of s) {
    const phase = unpackConfig(c, id).bodies.reduce((acc, b) => acc + (k[b.line] as number) * signedPosition(c.L, b.p), 0)

    out.set(id, cmul(a, [Math.cos(phase), Math.sin(phase)]))
  }

  return out
}

export type BentRun = { fidelity: number[]; overlap: Amp[]; tail: number[]; centroid: number[][]; lost: number[]; size: number; end: BentState }

// `beats` beats from `start`, read every beat: fidelity with the start, weight on strings past `n`, the centroid, and
// the weight the floor has dropped so far (1 - norm, the norm falling only by the drops)
export function runBent(c: Codec, start: BentState, beats: number, n: number, floor: number): BentRun {
  let s = cloneBent(start)
  const w0 = bentWeight(start)
  const fidelity: number[] = []
  const overlap: Amp[] = [[1, 0]]
  const tail: number[] = []
  const lost: number[] = []
  const track: number[][] = [bentCentroid(c, s)]
  let size = s.size

  for (let t = 1; t <= beats; t++) {
    s = bentBeat(c, s, floor)
    pruneBent(s, floor)
    size = Math.max(size, s.size)

    const o = bentOverlap(start, s)

    overlap.push([o[0] / w0, o[1] / w0])
    fidelity.push((o[0] ** 2 + o[1] ** 2) / (w0 * w0))
    tail.push(bentTail(c, s, n) / w0)
    lost.push(1 - bentWeight(s) / w0)
    track.push(bentCentroid(c, s))
  }

  return { fidelity, overlap, tail, centroid: track, lost, size, end: s }
}

// A LEVEL BY FILTER: psi_E = sum_t w(t) e^(i E t) U^t psi, t = 0 .. T, w a sin^2 window, normalized (U = e^(-iH): a
// level at E adds in phase, the rest averages out outside the window's main lobe)
export function filterLevel(c: Codec, start: BentState, beats: number, energy: number, floor: number): BentState {
  let s = cloneBent(start)
  const acc: BentState = new Map()
  const put = (t: number): void => {
    const h = Math.sin((Math.PI * (t + 1)) / (beats + 2)) ** 2
    const ph: Amp = [h * Math.cos(energy * t), h * Math.sin(energy * t)]

    for (const [id, a] of s) add(acc, id, cmul(a, ph))
  }

  put(0)
  for (let t = 1; t <= beats; t++) {
    s = bentBeat(c, s, floor)
    pruneBent(s, floor)
    put(t)
  }

  pruneBent(acc, floor)
  normalizeBent(acc)

  return acc
}

// the lattice distance between the love at s_A u_A and the fear at s_B u_B, from the patch's steps: square, |s_A| + |s_B|;
// triangle (steps (1,0), (0,1), (-1,1)), the hex distance of (s_A, -s_B)
export function pairDistance(c: Codec, bodies: readonly Body[]): number {
  const pos = bodies.map(b => ({ line: b.line, x: signedPosition(c.L, b.p) }))

  if (pos.length !== 2) return 0
  if (pos[0]?.line === pos[1]?.line) return Math.abs((pos[0]?.x ?? 0) - (pos[1]?.x ?? 0))

  const at = (line: number): number => pos.filter(p => p.line === line).reduce((a, p) => a + p.x, 0)
  const da = at(0)
  const db = -at(1)

  if (c.spec.patch.kind === 'square') return Math.abs(da) + Math.abs(db)

  return da * db < 0 ? Math.max(Math.abs(da), Math.abs(db)) : Math.abs(da) + Math.abs(db)
}

// THE STRING'S SHAPES: weight by length (links with flux), by the number of those off the two lines, the weight bent
// (any flux off the lines), the mean length over the vibes' lattice distance, and the weight by the live faces' loop
// pattern's count of turned faces
export type Shapes = { length: number[]; offLine: number[]; turned: number[]; bent: number; meanLength: number; meanOffLine: number; meanExcess: number; meanDistance: number }

export function shapes(c: Codec, s: BentState, cap: number): Shapes {
  const length = new Array<number>(cap + 2).fill(0)
  const offLine = new Array<number>(cap + 2).fill(0)
  const turned = new Array<number>(c.faces.length + 1).fill(0)
  let bent = 0
  let meanLength = 0
  let meanOffLine = 0
  let meanExcess = 0
  let meanDistance = 0
  let total = 0

  for (const [id, a] of s) {
    const w = norm2(a)
    const x = unpackConfig(c, id)
    const f = fluxOf(c, x)
    const off = [...f.keys()].filter(l => !onLines(c.L, l)).length
    const d = pairDistance(c, x.bodies)
    let k = 0

    c.faces.forEach((_, i) => (k += loopOf(c, x.m, i) === 0 ? 0 : 1))
    total += w
    const li = Math.min(f.size, cap + 1)
    const oi = Math.min(off, cap + 1)

    length[li] = (length[li] as number) + w
    offLine[oi] = (offLine[oi] as number) + w
    turned[k] = (turned[k] as number) + w
    if (off > 0) bent += w
    meanLength += w * f.size
    meanOffLine += w * off
    meanExcess += w * (f.size - d)
    meanDistance += w * d
  }

  const by = (xs: number[]): number[] => xs.map(v => v / total)

  return { length: by(length), offLine: by(offLine), turned: by(turned), bent: bent / total, meanLength: meanLength / total, meanOffLine: meanOffLine / total, meanExcess: meanExcess / total, meanDistance: meanDistance / total }
}

// the vibes' position distribution: weight per (line, signed position) of every vibe
export function positionWeights(c: Codec, s: BentState): Map<string, number> {
  const out = new Map<string, number>()

  for (const [id, a] of s) {
    const key = unpackConfig(c, id)
      .bodies.map(b => `${b.line}:${signedPosition(c.L, b.p)}`)
      .join(',')

    out.set(key, (out.get(key) ?? 0) + norm2(a))
  }

  return out
}

// the total variation distance between two position distributions
export function totalVariation(a: Map<string, number>, b: Map<string, number>): number {
  let d = 0

  for (const k of new Set([...a.keys(), ...b.keys()])) d += Math.abs((a.get(k) ?? 0) - (b.get(k) ?? 0))

  return d / 2
}
