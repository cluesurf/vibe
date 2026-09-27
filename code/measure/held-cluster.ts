// A ONE-LINE CLUSTER PLACED IN A MESH (E-SPN-0102, E-GRV-0108). E-SPN-0093's one-line three-love cluster is a level of
// the one-line operator (code/measure/coined-line-bloch), read at total momentum K = 0 in relative coordinates. Here it
// is PLACED: its relative amplitudes put on one axis mesh line of a D4 box with its least position at one dock (a
// localized packet, every K at once), and run by the exact superposed rule, or by the line's ring form for long runs.
//
// THE PLACEMENT, exactly. A level's amplitudes are floats (an eigenvector, measurement). The rule's ring is Z[w][1/2],
// so each amplitude psi is written as (a + b w) / 2^P with a, b the nearest integers (b = round(2^P Im psi 2 / sqrt 3),
// a = round(2^P Re psi + b / 2)); the rounding is in the start alone, the rule then runs exactly, and the start's norm
// (an exact rational) is what the run must keep. Positions are taken mod the ring's length, so configurations of span
// L / 2 or more can land on one ring configuration (their amplitudes add, exactly); the placed state is then that sum,
// and its weight is reported against the level's.
//
// THE READINGS of an exact superposed state, per beat: the probability of every love configuration of the line (open
// vibes on the ring's two slots), the weight on branches holding an open vibe off the line (a leak), the branches whose
// every other slot and store differs from a given vacuum configuration (the vacuum is not left alone), and the expected
// dock energy e = held slots + 2 stores (code/measure/energy-lines dockEnergies) minus the vacuum's, per husk column.
//
// NOTHING MOVES: the placement writes a start; the rule takes every value. The floats are measurement.

import { LINE_FIRSTS, LINE_OF, OPPOSITE } from '@/code/rule/isometric-knit'
import { rootsD4 } from '@/code/algebra/group/root-system'
import { cloneConfiguration, lockedNorm, mergeBranches, newTally, norm, sameConfiguration, type Branch, type Configuration, type LockedState, type LockedTables } from '@/code/rule/doublet-locked-knit'
import { coinedVetoBeat, coinedVetoBeatBack } from '@/code/rule/coined-locked-knit'
import { toWords } from '@/code/rule/occupation-veto-knit'
import { firstQuantized, lineImage, readingBloch, ringKey, type LineBasis, type RingState } from '@/code/measure/coined-line-bloch'
import { quartetShare } from '@/code/measure/flux-store-bloch'
import { dockEnergies } from '@/code/measure/energy-lines'
import { boxHusk, type BoxHusk } from '@/code/measure/causal-components'
import { centerOf } from '@/code/measure/wall-reading'
import { contactFresh } from '@/code/measure/occupation-veto-readings'
import { vacuumConfiguration } from '@/code/measure/doublet-locked-readings'

const ROOTS = rootsD4()

// the axis line through `start` along root (1, 0, 0, 1): its docks in stream order, and its two slots
export type AxisRing = { readonly docks: number[]; readonly first: number; readonly second: number; readonly position: Map<number, number> }

export function axisRing(tables: LockedTables, start: number): AxisRing {
  const r = ROOTS.findIndex(v => v[0] === 1 && v[1] === 0 && v[2] === 0 && v[3] === 1)
  const first = LINE_FIRSTS[LINE_OF[r] as number] as number
  const second = OPPOSITE[first] as number
  const docks = [start]
  const position = new Map<number, number>([[start, 0]])

  for (;;) {
    const next = Math.floor((tables.target[docks[docks.length - 1]! * 24 + first] as number) / 24)

    if (next === start) break
    position.set(next, docks.length)
    docks.push(next)
  }

  return { docks, first, second, position }
}

// one relative configuration of the level: positions and labels (0 the first slot, 1 the second), and its amplitude
export type Placed = { ts: readonly (readonly [number, number])[]; re: number; im: number }

// the relative configurations that fit a ring of L (no two loves on one slot once taken mod L), and the weight of the
// ones that do not (they are left out of the placement, a disclosed truncation)
export function fitRing(placed: readonly Placed[], L: number): { kept: Placed[]; dropped: number } {
  const kept: Placed[] = []
  let dropped = 0

  for (const p of placed) {
    const modes = new Set(p.ts.map(([x, j]) => 2 * (((x % L) + L) % L) + j))

    if (modes.size === p.ts.length) kept.push(p)
    else dropped += p.re ** 2 + p.im ** 2
  }

  return { kept, dropped }
}

// a float amplitude as an element of Z[w] over 2^P
export function eisenstein(re: number, im: number, P: number): { a: bigint; b: bigint } {
  const scale = 2 ** P
  const b = Math.round((scale * im * 2) / Math.sqrt(3))
  const a = Math.round(scale * re + b / 2)

  return { a: BigInt(a), b: BigInt(b) }
}

// the float value of (a + b w) / 2^k
export function eisensteinValue(a: bigint, b: bigint, k: number): [number, number] {
  const s = 2 ** k

  return [(Number(a) - Number(b) / 2) / s, (Number(b) * Math.sqrt(3)) / 2 / s]
}

// the placed state on a configuration `base` (the vacuum, or an empty mesh): every relative configuration at `anchor`
// + x (mod the ring), open loves of point 0, amplitude rounded into Z[w] / 2^P; coincident placements are added by the
// rule's own merge
export function placeExact(base: Configuration, ring: AxisRing, placed: readonly Placed[], anchor: number, P: number): LockedState {
  const L = ring.docks.length
  const list: Branch[] = []

  for (const p of placed) {
    const { a, b } = eisenstein(p.re, p.im, P)

    if (a === 0n && b === 0n) continue

    const c = cloneConfiguration(base)

    for (const [x, j] of p.ts) {
      const slot = (ring.docks[(((anchor + x) % L) + L) % L] as number) * 24 + (j === 0 ? ring.first : ring.second)

      if (c.vibe[slot] !== 0) throw new Error('held-cluster: a placed love lands on a held slot')
      c.vibe[slot] = 1
      c.point[slot] = 0
      c.open[slot] = 1
    }

    list.push({ ...c, a, b, k: P })
  }

  return { branches: mergeBranches(list) }
}

// the same placement in the ring form (floats), with the SAME rounded amplitudes, so the two starts are equal
export function placeRing(L: number, placed: readonly Placed[], anchor: number, P: number): RingState {
  const out: RingState = new Map()

  for (const p of placed) {
    const { a, b } = eisenstein(p.re, p.im, P)

    if (a === 0n && b === 0n) continue

    const [re, im] = eisensteinValue(a, b, P)
    const ts = p.ts.map(([x, j]) => ({ x: (((anchor + x) % L) + L) % L, j, f: 0 }))
    const key = ringKey(ts)
    const o = out.get(key)

    if (o) out.set(key, { ts: o.ts, amp: [o.amp[0] + re, o.amp[1] + im] })
    else {
      const sorted = ts.slice().sort((u, v) => 2 * u.x + (u.j === 0 ? 1 : 0) - (2 * v.x + (v.j === 0 ? 1 : 0)))

      out.set(key, { ts: sorted, amp: [re, im] })
    }
  }

  return out
}

// one beat of a superposed rule taken a few branches at a time and merged as it goes: the beat is linear, so this is
// the same state as the beat on all branches at once, with at most `chunk` branches split at a time
export function chunkedBeat(beat: (s: LockedState) => LockedState, s: LockedState, chunk: number): LockedState {
  const acc: Branch[] = []

  for (let i = 0; i < s.branches.length; i += chunk) for (const b of beat({ branches: s.branches.slice(i, i + chunk) }).branches) acc.push(b)

  return { branches: mergeBranches(acc) }
}

export type ExactReading = {
  // love configuration key -> probability (the ring form's key), and with each love's point (pointKey)
  probability: Map<string, number>
  pointProbability: Map<string, number>
  leak: number
  // branches (and their weight) whose slots and stores other than the loves' differ from the vacuum given
  disturbed: number
  disturbedWeight: number
  total: number
  // expected dock energy minus the vacuum's, per husk column
  columnExcess: Float64Array
}

export function readExact(s: LockedState, ring: AxisRing, vacuum: Configuration, husk: BoxHusk): ExactReading {
  const probability = new Map<string, number>()
  const pointProbability = new Map<string, number>()
  const cells = vacuum.vibe.length / 24
  const columnExcess = new Float64Array(husk.columns)
  const ev = dockEnergies(vacuum, new Int32Array(cells))
  const eb = new Int32Array(cells)
  let leak = 0
  let disturbed = 0
  let disturbedWeight = 0
  let total = 0

  for (const b of s.branches) {
    const w = Number(norm(b.a, b.b)) / 4 ** b.k
    const ts: { x: number; j: number; f: number }[] = []
    const ps: PointLove[] = []
    let off = false
    let differs = false

    total += w

    for (let i = 0; i < b.vibe.length; i++) {
      const loveHere = b.vibe[i] !== 0 && b.open[i] === 1

      if (loveHere) {
        const x = ring.position.get(Math.floor(i / 24))
        const d = i % 24

        if (x === undefined || (d !== ring.first && d !== ring.second)) off = true
        else {
          ts.push({ x, j: d === ring.first ? 0 : 1, f: 0 })
          ps.push({ x, j: d === ring.first ? 0 : 1, p: b.point[i] as number })
        }

        if (vacuum.vibe[i] !== 0) differs = true
        continue
      }

      if (b.vibe[i] !== vacuum.vibe[i] || b.open[i] !== vacuum.open[i] || (b.vibe[i] !== 0 && b.point[i] !== vacuum.point[i])) differs = true
    }

    for (let i = 0; i < b.store.length && !differs; i++) if (b.store[i] !== vacuum.store[i] || b.sopen[i] !== vacuum.sopen[i] || (b.store[i] !== 0 && b.spoint[i] !== vacuum.spoint[i])) differs = true

    if (off) leak += w
    else {
      const key = ringKey(ts)
      const pk = pointKey(ps)

      probability.set(key, (probability.get(key) ?? 0) + w)
      pointProbability.set(pk, (pointProbability.get(pk) ?? 0) + w)
    }

    if (differs) {
      disturbed++
      disturbedWeight += w
    }

    dockEnergies(b, eb)

    for (let x = 0; x < cells; x++) {
      const d = (eb[x] as number) - (ev[x] as number)

      if (d !== 0) columnExcess[husk.column[x] as number]! += w * d
    }
  }

  return { probability, pointProbability, leak, disturbed, disturbedWeight, total, columnExcess }
}

// the largest difference between an exact reading's configuration probabilities and a ring state's
export function ringGap(p: Map<string, number>, ring: RingState): number {
  let worst = 0

  for (const [k, v] of ring) worst = Math.max(worst, Math.abs((p.get(k) ?? 0) - (v.amp[0] ** 2 + v.amp[1] ** 2)))
  for (const [k, v] of p) if (!ring.has(k)) worst = Math.max(worst, v)

  return worst
}

// a ring state's expected love count per ring position
export function ringDensity(L: number, s: RingState): Float64Array {
  const out = new Float64Array(L)

  for (const { ts, amp } of s.values()) {
    const w = amp[0] ** 2 + amp[1] ** 2

    for (const t of ts) out[t.x]! += w
  }

  return out
}

// the least arc about `center` on a ring of L holding `share` of a density, as a radius (0: the center alone)
export function ringRadius(density: Float64Array, center: number, share: number): number {
  const L = density.length
  const total = density.reduce((s, v) => s + v, 0)

  for (let r = 0; r <= L / 2; r++) {
    let held = 0

    for (let d = -r; d <= r; d++) held += density[(((center + d) % L) + L) % L] as number
    if (held >= share * total - 1e-12) return r
  }

  return L / 2
}

// the circular mean position of a density on a ring of L (its phase), and the least integer center
export function ringCenter(density: Float64Array): number {
  const L = density.length
  let c = 0
  let s = 0

  density.forEach((v, x) => {
    c += v * Math.cos((2 * Math.PI * x) / L)
    s += v * Math.sin((2 * Math.PI * x) / L)
  })

  const phase = Math.atan2(s, c)

  return (((phase * L) / (2 * Math.PI)) % L + L) % L
}

// the K = 0 part of a ring state in relative coordinates: every configuration anchored at its least position (valid
// while every span is under L / 2), amplitudes summed over the anchor, keyed by the anchored configuration
export function relativePart(L: number, s: RingState): Map<string, [number, number]> {
  const out = new Map<string, [number, number]>()

  for (const { ts, amp } of s.values()) {
    // the anchor: the position after the largest gap
    const xs = [...new Set(ts.map(t => t.x))].sort((a, b) => a - b)
    let anchor = xs[0] as number
    let gap = -1

    xs.forEach((x, i) => {
      const prev = xs[(i - 1 + xs.length) % xs.length] as number
      const g = (((x - prev) % L) + L) % L || L

      if (g > gap) {
        gap = g
        anchor = x
      }
    })

    const rel = ts.map(t => ({ x: ((((t.x - anchor) % L) + L) % L), j: t.j, f: 0 }))
    const key = ringKey(rel)
    const o = out.get(key) ?? [0, 0]

    out.set(key, [o[0] + amp[0], o[1] + amp[1]])
  }

  return out
}

// ---- the line's ring form WITH POINTS: the loves alone, their points taken along the mesh's own links ----
//
// E-SPN-0093's ring form (code/measure/coined-line-bloch ringBeat) holds every point equal, as on flat links. The
// working vacuum's weave has its own links (code/rule/color-weave, table 'bind'), so a love streamed along the line
// takes a new point (the link's move table), two loves meeting on one line of one dock can carry unequal points, and the
// meeting then splits (keep (1 + w)/2, exchange -(1 - w)/2 with the points swapped) where equal points take the phase w.
// This form holds three loves on the ring's two slots with their points, no vacuum and no sign (the working vacuum's
// rule is the configuration code plus the coin, code/rule/coined-locked-knit coinedVetoBeat), in the beat's order: the
// coin (a lone love keep (1 + w)/2 or cross (1 - w)/2; a full line of two open loves det w), the meeting, the collision
// (a lone love keeps its slot and a full like line passes, as derived in code/rule/bounce-pair-knit), the stream.
// It is a MEASUREMENT OF THE RULE ON ONE SECTOR, not a rule: it is checked against the exact rule in the experiments
// that use it, and says nothing where they have not checked it.

export type PointLove = { x: number; j: number; p: number }
export type PointState = Map<string, { ts: PointLove[]; amp: [number, number] }>

const SQ3 = Math.sqrt(3)
const P_W: [number, number] = [-0.5, SQ3 / 2]
const P_KEEP: [number, number] = [0.25, SQ3 / 4]
const P_CROSS: [number, number] = [0.75, -SQ3 / 4]
const P_EXCHANGE: [number, number] = [-0.75, SQ3 / 4]
const cm = (x: [number, number], y: [number, number]): [number, number] => [x[0] * y[0] - x[1] * y[1], x[0] * y[1] + x[1] * y[0]]
const modeOf = (t: PointLove): number => 2 * t.x + (t.j === 0 ? 1 : 0)

export const pointKey = (ts: readonly PointLove[]): string =>
  ts
    .slice()
    .sort((u, v) => modeOf(u) - modeOf(v))
    .map(t => `${t.x},${t.j},${t.p}`)
    .join('|')

function addPoint(out: PointState, ts: PointLove[], amp: [number, number]): void {
  const key = pointKey(ts)
  const o = out.get(key)

  if (o) o.amp = [o.amp[0] + amp[0], o.amp[1] + amp[1]]
  else out.set(key, { ts, amp })
}

// the placed state with every love at point 0 (the placement's)
export function placePoints(L: number, placed: readonly Placed[], anchor: number, P: number): PointState {
  const out: PointState = new Map()

  for (const p of placed) {
    const { a, b } = eisenstein(p.re, p.im, P)

    if (a === 0n && b === 0n) continue

    addPoint(
      out,
      p.ts.map(([x, j]) => ({ x: (((anchor + x) % L) + L) % L, j, p: 0 })),
      eisensteinValue(a, b, P),
    )
  }

  return out
}

export function pointBeat(tables: LockedTables, ring: AxisRing, state: PointState): PointState {
  const L = ring.docks.length
  const out: PointState = new Map()

  for (const { ts, amp } of state.values()) {
    // the coin and the meeting, dock by dock: the pieces each branch becomes
    let pieces: { ts: PointLove[]; amp: [number, number] }[] = [{ ts: ts.map(t => ({ ...t })), amp }]
    const docks = [...new Set(ts.map(t => t.x))]

    for (const x of docks) {
      const at = ts.map((t, i) => (t.x === x ? i : -1)).filter(i => i >= 0)
      const next: typeof pieces = []

      for (const piece of pieces) {
        if (at.length === 1) {
          const i = at[0] as number

          next.push({ ts: piece.ts, amp: cm(piece.amp, P_KEEP) })

          const crossed = piece.ts.map(t => ({ ...t }))

          crossed[i]!.j = 1 - crossed[i]!.j
          next.push({ ts: crossed, amp: cm(piece.amp, P_CROSS) })
          continue
        }

        // a full line: det w, then the meeting
        const [i, k] = at as [number, number]
        const detAmp = cm(piece.amp, P_W)

        if (piece.ts[i]!.p === piece.ts[k]!.p) {
          next.push({ ts: piece.ts, amp: cm(detAmp, P_W) })
          continue
        }

        next.push({ ts: piece.ts, amp: cm(detAmp, P_KEEP) })

        const swapped = piece.ts.map(t => ({ ...t }))
        const q = swapped[i]!.p

        swapped[i]!.p = swapped[k]!.p
        swapped[k]!.p = q
        next.push({ ts: swapped, amp: cm(detAmp, P_EXCHANGE) })
      }

      pieces = next
    }

    for (const piece of pieces) {
      const moved = piece.ts.map(t => {
        const slot = (ring.docks[t.x] as number) * 24 + (t.j === 0 ? ring.first : ring.second)

        return { x: (((t.x + (t.j === 0 ? 1 : -1)) % L) + L) % L, j: t.j, p: tables.move[slot * 9 + t.p] as number }
      })

      addPoint(out, moved, piece.amp)
    }
  }

  return out
}

// the largest difference between an exact reading's point-carrying probabilities and a point state's
export function pointGap(p: Map<string, number>, s: PointState): number {
  let worst = 0

  for (const [k, v] of s) worst = Math.max(worst, Math.abs((p.get(k) ?? 0) - (v.amp[0] ** 2 + v.amp[1] ** 2)))
  for (const [k, v] of p) if (!s.has(k)) worst = Math.max(worst, v)

  return worst
}

// a point state's expected love count per ring position, and its occupation-only amplitudes per point assignment:
// relative configuration (anchored after the largest gap) -> point assignment -> amplitude (the K = 0 part)
export function pointDensity(L: number, s: PointState): Float64Array {
  const out = new Float64Array(L)

  for (const { ts, amp } of s.values()) for (const t of ts) out[t.x]! += amp[0] ** 2 + amp[1] ** 2

  return out
}

export function pointRelative(L: number, s: PointState): Map<string, Map<string, [number, number]>> {
  const out = new Map<string, Map<string, [number, number]>>()

  for (const { ts, amp } of s.values()) {
    const xs = [...new Set(ts.map(t => t.x))].sort((a, b) => a - b)
    let anchor = xs[0] as number
    let gap = -1

    xs.forEach((x, i) => {
      const prev = xs[(i - 1 + xs.length) % xs.length] as number
      const g = (((x - prev) % L) + L) % L || L

      if (g > gap) {
        gap = g
        anchor = x
      }
    })

    const rel = ts.map(t => ({ x: (((t.x - anchor) % L) + L) % L, j: t.j, p: t.p })).sort((u, v) => modeOf(u) - modeOf(v))
    const key = ringKey(rel.map(t => ({ x: t.x, j: t.j, f: 0 })))
    const points = rel.map(t => t.p).join(',')
    const m = out.get(key) ?? new Map<string, [number, number]>()
    const o = m.get(points) ?? [0, 0]

    m.set(points, [o[0] + amp[0], o[1] + amp[1]])
    out.set(key, m)
  }

  return out
}

// ---- the stand-in's own operator on a placed packet: a Bloch sum ----
//
// E-SPN-0093's operator (the drift cost included, flat links, the box of its basis) is translation invariant, so a
// packet placed at one anchor is the sum over the ring's L momenta K = 2 pi n / L of the Bloch states |K, c> =
// sum_X e^(i K X) |X + c>, each with the relative vector psi and weight 1 / L, and each K evolves by its own Bloch
// operator (code/measure/coined-line-bloch lineImage). The amplitude on |X + c> is (1 / L) sum_K e^(i K X) phi_K(c);
// the K = 0 part summed over X is phi_0 itself.

export type Relative = Map<string, Map<string, [number, number]>>

export type BlochPacket = { step: () => void; density: () => Float64Array; relative: () => Relative }

export function blochPacket(basis: LineBasis, L: number, cre: Float64Array, cim: Float64Array, withCost: boolean): BlochPacket {
  const dim = basis.configs.length
  let phis = Array.from({ length: L }, () => ({ re: Float64Array.from(cre), im: Float64Array.from(cim) }))

  return {
    step() {
      phis = phis.map((phi, n) => lineImage(basis, (2 * Math.PI * n) / L, phi.re, phi.im, withCost))
    },
    density() {
      const out = new Float64Array(L)

      for (let X = 0; X < L; X++) {
        for (let c = 0; c < dim; c++) {
          let re = 0
          let im = 0

          phis.forEach((phi, n) => {
            const th = (2 * Math.PI * n * X) / L
            const zr = phi.re[c] as number
            const zi = phi.im[c] as number

            re += zr * Math.cos(th) - zi * Math.sin(th)
            im += zr * Math.sin(th) + zi * Math.cos(th)
          })

          const p = (re * re + im * im) / (L * L)

          if (p === 0) continue
          for (const t of basis.configs[c]!) out[(X + t.x) % L]! += p
        }
      }

      return out
    },
    relative() {
      const out: Relative = new Map()
      const phi = phis[0]!

      basis.configs.forEach((ts, c) => {
        const zr = phi.re[c] as number
        const zi = phi.im[c] as number

        if (zr !== 0 || zi !== 0) out.set(ringKey(ts), new Map([['', [zr, zi]]]))
      })

      return out
    },
  }
}

// a ring state's K = 0 part in the same shape (one point assignment, '')
export const plainRelative = (L: number, s: RingState): Relative => new Map([...relativePart(L, s)].map(([k, z]) => [k, new Map([['', z]])]))

export type LevelReading = { fidelity: number; amplitude: [number, number]; share: number; weight: number; outside: number }

// a K = 0 part read against a level of `basis` (its configuration vector): the fidelity sum_q |<v|phi_q>|^2 / (<v|v>
// sum_q <phi_q|phi_q>) over the point assignments q (the occupation-reduced state's weight on the level), the summed
// overlap sum_q <v|phi_q>, and (with `share`) the spin one half share of the part inside the basis's reading box, the
// point assignments' shares weighted by their weights (the quartet share is a quadratic form, so this is the mixture's)
export function levelReading(basis: LineBasis, vre: Float64Array, vim: Float64Array, part: Relative, share: boolean): LevelReading {
  const dim = basis.configs.length
  const byQ = new Map<string, { re: Float64Array; im: Float64Array }>()
  let weight = 0
  let outside = 0
  let vv = 0

  for (let i = 0; i < dim; i++) vv += (vre[i] as number) ** 2 + (vim[i] as number) ** 2

  for (const [key, m] of part) {
    const i = basis.index.get(key)

    for (const [q, z] of m) {
      const p = z[0] ** 2 + z[1] ** 2

      weight += p

      if (i === undefined) {
        outside += p
        continue
      }

      let vq = byQ.get(q)

      if (!vq) {
        vq = { re: new Float64Array(dim), im: new Float64Array(dim) }
        byQ.set(q, vq)
      }

      vq.re[i] = vq.re[i]! + z[0]
      vq.im[i] = vq.im[i]! + z[1]
    }
  }

  let fid = 0
  let ar = 0
  let ai = 0
  let shareNum = 0
  let shareDen = 0
  const b = share ? readingBloch(basis.sector) : undefined

  for (const vq of byQ.values()) {
    let r = 0
    let i = 0
    let w = 0

    for (let k = 0; k < dim; k++) {
      const xr = vq.re[k] as number
      const xi = vq.im[k] as number

      r += (vre[k] as number) * xr + (vim[k] as number) * xi
      i += (vre[k] as number) * xi - (vim[k] as number) * xr
      w += xr * xr + xi * xi
    }

    fid += r * r + i * i
    ar += r
    ai += i

    if (b && w > 1e-14) {
      shareNum += w * (1 - quartetShare(b, firstQuantized(basis, b, vq.re, vq.im)))
      shareDen += w
    }
  }

  return { fidelity: fid / (vv * weight), amplitude: [ar, ai], share: shareDen > 0 ? shareNum / shareDen : Number.NaN, weight, outside }
}

// a level of a line basis as a placement (its nonzero amplitudes)
export function levelPlacement(basis: LineBasis, cre: Float64Array, cim: Float64Array): Placed[] {
  const out: Placed[] = []

  basis.configs.forEach((ts, i) => {
    const re = cre[i] as number
    const im = cim[i] as number

    if (re !== 0 || im !== 0) out.push({ ts: ts.map(t => [t.x, t.j] as const), re, im })
  })

  return out
}

// a ring density put on the husk columns its docks cast
export function ringColumns(husk: BoxHusk, ring: AxisRing, density: Float64Array): Float64Array {
  const out = new Float64Array(husk.columns)

  density.forEach((v, x) => (out[husk.column[ring.docks[x] as number] as number]! += v))

  return out
}

// THE EXACT WINDOW: the placed level in the working vacuum (no veto, the pass contact, the coin, the vacuum's stored
// pairs closed as E-RLT-0105's superposed runs) on a side-`side` box, run by the exact superposed rule for `beats` beats
// (a few branches at a time), beside the vacuum's own run and the point-carrying ring form, then run back
export type WindowBeat = { branches: number; normKept: boolean; leak: number; disturbed: number; pointGap: number; energyGap: number; splits: number }

export type ExactWindow = { side: number; L: number; dropped: number; startNorm: number; startBranches: number; beats: WindowBeat[]; reversed: boolean; seconds: number }

export function exactWindow(side: number, beats: number, placed: readonly Placed[], P: number): ExactWindow {
  const started = Date.now()
  const center = centerOf(side)
  const f = contactFresh(side, 'pass', center)
  const vac = toWords(vacuumConfiguration(f, 'none'))
  const husk = boxHusk(f.weave.mesh, side)
  const ring = axisRing(f.tables, center)
  const L = ring.docks.length
  const fit = fitRing(placed, L)
  const start = placeExact(vac, ring, fit.kept, 0, P)
  const n0 = lockedNorm(start)
  const tally = newTally()
  let s = start
  let v: LockedState = { branches: [{ ...cloneConfiguration(vac), a: 1n, b: 0n, k: 0 }] }
  let ps = placePoints(L, fit.kept, 0, P)
  const out: WindowBeat[] = []

  for (let t = 0; t < beats; t++) {
    s = chunkedBeat(x => coinedVetoBeat('none', f.tables, x, t, tally), s, 16)
    v = coinedVetoBeat('none', f.tables, v, t)
    ps = pointBeat(f.tables, ring, ps)

    const r = readExact(s, ring, v.branches[0] as Branch, husk)
    const n = lockedNorm(s)
    const expected = ringColumns(husk, ring, pointDensity(L, ps))
    let energyGap = 0

    for (let c = 0; c < husk.columns; c++) energyGap = Math.max(energyGap, Math.abs((r.columnExcess[c] as number) - (expected[c] as number)))

    out.push({ branches: s.branches.length, normKept: n.total * n0.unit === n0.total * n.unit, leak: r.leak, disturbed: r.disturbed + (v.branches.length === 1 ? 0 : 1), pointGap: pointGap(r.pointProbability, ps), energyGap, splits: tally.splitMeetings })
  }

  let back = s

  for (let t = beats - 1; t >= 0; t--) back = chunkedBeat(x => coinedVetoBeatBack('none', f.tables, x, t), back, 16)

  const reversed = back.branches.length === start.branches.length && start.branches.every(b => back.branches.some(c => c.a === b.a && c.b === b.b && c.k === b.k && sameConfiguration(c, b)))

  return { side, L, dropped: fit.dropped, startNorm: Number(n0.total) / Number(n0.unit), startBranches: start.branches.length, beats: out, reversed, seconds: (Date.now() - started) / 1000 }
}

// ---- one placed packet followed on a ring, beat by beat ----

export type Track = {
  // per beat 1 .. beats: the least radius about the start's center holding 90% of the love density, the circular
  // distance of the density's center from the start's, the fidelity with the level
  r90: number[]
  drift: number[]
  fidelity: number[]
  // the spin one half share at every `shareEvery`-th beat
  share: { t: number; share: number }[]
  // the level's energy read off the overlap's phase: minus its unwrapped advance over the run, per beat
  energy: number
  // the love density summed over beats 1 .. beats, and over the first `window` beats
  densitySum: Float64Array
  windowSum: Float64Array
  r90Start: number
  weight: number
}

export function trackRun(input: {
  L: number
  beats: number
  window: number
  center: number
  startDensity: Float64Array
  step: () => void
  density: () => Float64Array
  relative: () => Relative
  basis: LineBasis
  vre: Float64Array
  vim: Float64Array
  shareEvery: number
}): Track {
  const { L, beats, window, center, startDensity, step, density, relative, basis, vre, vim, shareEvery } = input
  const c0 = ringCenter(startDensity)
  const out: Track = { r90: [], drift: [], fidelity: [], share: [], energy: 0, densitySum: new Float64Array(L), windowSum: new Float64Array(L), r90Start: ringRadius(startDensity, center, 0.9), weight: 0 }
  let prev = levelReading(basis, vre, vim, relative(), false)
  let phase = 0

  for (let t = 1; t <= beats; t++) {
    step()

    const d = density()
    const withShare = t % shareEvery === 0
    const lr = levelReading(basis, vre, vim, relative(), withShare)
    let drift = Math.abs(ringCenter(d) - c0)

    drift = Math.min(drift, L - drift)
    phase += Math.atan2(prev.amplitude[0] * lr.amplitude[1] - prev.amplitude[1] * lr.amplitude[0], prev.amplitude[0] * lr.amplitude[0] + prev.amplitude[1] * lr.amplitude[1])
    prev = lr
    out.r90.push(ringRadius(d, center, 0.9))
    out.drift.push(drift)
    out.fidelity.push(lr.fidelity)
    if (withShare) out.share.push({ t, share: lr.share })

    for (let x = 0; x < L; x++) {
      out.densitySum[x]! += d[x] as number
      if (t <= window) out.windowSum[x]! += d[x] as number
    }

    out.weight = lr.weight
  }

  out.energy = -phase / beats

  return out
}
