// Measurement for E-SPN-0103: the working rule with the two pieces of code/rule/bound-line-pieces (the
// drift cost as a cut trit and a clock count, the fermion sign of the line block), read the way E-SPN-0102 reads the
// working rule (code/measure/held-cluster).
//
// THE EXACT READING. A bound state's physical amplitude on a configuration and cut trit c is the sum over its clock
// slices of A_e zeta_14^e (floats, measurement). The rule's own conserved quantity is the slices' summed norm, exact.
//
// THE RING FORM WITH THE PIECES (pointBeatWith): E-SPN-0102's point-carrying ring form (the three loves alone, their
// points taken by the mesh's own links) with the cost (zeta_14^(-n), n the flux links, c carried in the key), the line
// block's sign, a contact unit on a full line (the bounce's -1, the control), and `flat` (every point held at 0: the
// flat-link form, which with both pieces is the stand-in's own operator on a ring, the calibration against run A),
// and `meeting` (E-SPN-0104: the like meeting at unequal points, the working split or a permutation meeting).
// It is a MEASUREMENT OF THE RULE ON ONE SECTOR, checked against the exact rule in the experiments that use it.
//
// THE SIGN'S HOLONOMY (signHolonomy): on the rule's own line tables, every labelled three-love configuration and every
// coin outcome, the line block's sign followed around the transition graph: consistent iff the product of signs
// around every closed loop is the parity of the loop's net label permutation, so an exchange loop is -1 and a loop
// returning each love to its own mode is +1, whatever the path.

import { lockedNorm, norm, sameConfiguration, type Branch, type Configuration, type LockedState, type LockedTables } from '@/code/rule/doublet-locked-knit'
import { coinedVetoBeat } from '@/code/rule/coined-locked-knit'
import { toWords } from '@/code/rule/occupation-veto-knit'
import { boundBeat, boundBeatBack, boundStart, CLOCK, cutCrossing, fluxLinks, lineSign, slantLinks, type BoundOptions, type BoundState } from '@/code/rule/bound-line-pieces'
import { fineCoin, ringKey } from '@/code/measure/coined-line-bloch'
import { dockEnergies } from '@/code/measure/energy-lines'
import { boxHusk, type BoxHusk } from '@/code/measure/causal-components'
import { centerOf } from '@/code/measure/wall-reading'
import { contactFresh } from '@/code/measure/occupation-veto-readings'
import { vacuumConfiguration } from '@/code/measure/doublet-locked-readings'
import { axisRing, eisenstein, eisensteinValue, fitRing, placeExact, ringColumns, type AxisRing, type Placed, type PointLove, type Relative } from '@/code/measure/held-cluster'

const SQ3 = Math.sqrt(3)
type C = [number, number]
const cm = (x: C, y: C): C => [x[0] * y[0] - x[1] * y[1], x[0] * y[1] + x[1] * y[0]]
const W: C = [-0.5, SQ3 / 2]
const KEEP: C = [0.25, SQ3 / 4]
const CROSS: C = [0.75, -SQ3 / 4]
const EXCHANGE: C = [-0.75, SQ3 / 4]
const clockPhase = (e: number): C => [Math.cos((2 * Math.PI * e) / CLOCK), Math.sin((2 * Math.PI * e) / CLOCK)]
// the fine coin's count u read as zeta^u, zeta = e^(2 pi i/(3 fine)) (code/rule/fine-coin)
const finePhase = (u: number, fine: number): C => [Math.cos((2 * Math.PI * u) / (3 * fine)), Math.sin((2 * Math.PI * u) / (3 * fine))]
const modeOf = (t: PointLove): number => 2 * t.x + (t.j === 0 ? 1 : 0)

export const pointKeyOf = (ts: readonly PointLove[]): string =>
  ts
    .slice()
    .sort((u, v) => modeOf(u) - modeOf(v))
    .map(t => `${t.x},${t.j},${t.p}`)
    .join('|')

// ---- the ring form with the pieces ----

export type PieceOptions = BoundOptions & { readonly unit: 0 | 3; readonly flat: boolean }

export type CutState = Map<string, { ts: PointLove[]; c: number; amp: C }>

function addCut(out: CutState, ts: PointLove[], c: number, amp: C): void {
  const key = `${pointKeyOf(ts)}#${c}`
  const o = out.get(key)

  if (o) o.amp = [o.amp[0] + amp[0], o.amp[1] + amp[1]]
  else out.set(key, { ts, c, amp })
}

export function placeCut(L: number, placed: readonly Placed[], anchor: number, P: number): CutState {
  const out: CutState = new Map()

  for (const p of placed) {
    const { a, b } = eisenstein(p.re, p.im, P)

    if (a === 0n && b === 0n) continue
    addCut(
      out,
      p.ts.map(([x, j]) => ({ x: (((anchor + x) % L) + L) % L, j, p: 0 })),
      0,
      eisensteinValue(a, b, P),
    )
  }

  return out
}

export function pointBeatWith(options: PieceOptions, tables: LockedTables, ring: AxisRing, state: CutState): CutState {
  const L = ring.docks.length
  const out: CutState = new Map()
  // the coin's entries: the working coin's, or the fine coin's (E-SPN-0107), a full dock kept at w by the full-dock
  // correction (E-SPN-0108)
  const fine = options.fine === undefined ? undefined : fineCoin(options.fine)
  const coin = fine === undefined ? { keep: KEEP, cross: CROSS, det: W } : options.fullDock ? { ...fine, det: W } : fine

  for (const { ts, c, amp } of state.values()) {
    let start = amp

    if (options.cost && !options.slant) {
      const th = (-2 * Math.PI * fluxLinks(L, ts, c)) / CLOCK

      start = cm(start, [Math.cos(th), Math.sin(th)])
    }

    let pieces: { ts: PointLove[]; amp: C }[] = [{ ts: ts.map(t => ({ ...t })), amp: start }]

    for (const x of [...new Set(ts.map(t => t.x))]) {
      const at = ts.map((t, i) => (t.x === x ? i : -1)).filter(i => i >= 0)
      const next: typeof pieces = []

      for (const piece of pieces) {
        if (at.length === 1) {
          const i = at[0] as number
          const crossed = piece.ts.map(t => ({ ...t }))

          next.push({ ts: piece.ts, amp: cm(piece.amp, coin.keep) })
          crossed[i]!.j = 1 - crossed[i]!.j
          next.push({ ts: crossed, amp: cm(piece.amp, coin.cross) })
          continue
        }

        const [i, k] = at as [number, number]
        let det = cm(piece.amp, coin.det)

        if (options.unit === 3) det = [-det[0], -det[1]]

        if (piece.ts[i]!.p === piece.ts[k]!.p || options.meeting === 'keep') {
          next.push({ ts: piece.ts, amp: cm(det, W) })
          continue
        }

        if (options.meeting === 'exchange') {
          const swapped = piece.ts.map(t => ({ ...t }))
          const q = swapped[i]!.p

          swapped[i]!.p = swapped[k]!.p
          swapped[k]!.p = q
          next.push({ ts: swapped, amp: cm(det, W) })
          continue
        }

        const swapped = piece.ts.map(t => ({ ...t }))
        const q = swapped[i]!.p

        next.push({ ts: piece.ts, amp: cm(det, KEEP) })
        swapped[i]!.p = swapped[k]!.p
        swapped[k]!.p = q
        next.push({ ts: swapped, amp: cm(det, EXCHANGE) })
      }

      pieces = next
    }

    for (const piece of pieces) {
      let a = piece.amp

      if (options.cost && options.slant) {
        const th = (-2 * Math.PI * slantLinks(L, piece.ts, c)) / CLOCK

        a = cm(a, [Math.cos(th), Math.sin(th)])
      }

      if (options.sign && lineSign(L, piece.ts) < 0) a = [-a[0], -a[1]]

      const c1 = options.cost ? (((c + cutCrossing(L, piece.ts)) % 3) + 3) % 3 : c
      const moved = piece.ts.map(t => {
        const slot = (ring.docks[t.x] as number) * 24 + (t.j === 0 ? ring.first : ring.second)

        return { x: (((t.x + (t.j === 0 ? 1 : -1)) % L) + L) % L, j: t.j, p: options.flat ? 0 : (tables.move[slot * 9 + t.p] as number) }
      })

      addCut(out, moved, c1, a)
    }
  }

  return out
}

export function cutDensity(L: number, s: CutState): Float64Array {
  const out = new Float64Array(L)

  for (const { ts, amp } of s.values()) for (const t of ts) out[t.x]! += amp[0] ** 2 + amp[1] ** 2

  return out
}

// the K = 0 part: anchored after the largest gap, the point assignment and the cut trit as the label q (branches of
// different labels are orthogonal, so the level reading sums them as E-SPN-0102's point assignments)
export function cutRelative(L: number, s: CutState): Relative {
  const out: Relative = new Map()

  for (const { ts, c, amp } of s.values()) {
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
    // the flux OUTSIDE the cluster (on the link just before the anchor, in the largest gap), f = c + Q(anchor - 1):
    // the translation-invariant part of the register. c alone is the flux on the ring's cut, a gauge relative to the
    // cut, so a cluster translated across the cut carries another c with the same string (run 1's reading bug)
    const before = (((anchor - 1) % L) + L) % L
    const outside = (((c + ts.filter(t => t.x <= before).length) % 3) + 3) % 3
    const q = `${rel.map(t => t.p).join(',')}#${outside}`
    const m = out.get(key) ?? new Map<string, [number, number]>()
    const o = m.get(q) ?? [0, 0]

    m.set(q, [o[0] + amp[0], o[1] + amp[1]])
    out.set(key, m)
  }

  return out
}

// ---- the exact reading ----

function configurationKey(b: Configuration): string {
  const parts: number[] = []

  for (let i = 0; i < b.vibe.length; i++) if (b.vibe[i] !== 0) parts.push(i, b.vibe[i] as number, b.point[i] as number, b.open[i] as number)
  parts.push(-1)
  for (let i = 0; i < b.store.length; i++) if (b.store[i] !== 0) parts.push(i, b.store[i] as number, b.spoint[i] as number, b.sopen[i] as number)

  return parts.join(',')
}

export type BoundReading = { pointProbability: Map<string, number>; leak: number; disturbed: number; total: number; columnExcess: Float64Array; freeNormKept: boolean; physicalNorm: number }

export function readBound(s: BoundState, ring: AxisRing, vacuum: Configuration, husk: BoxHusk, start: { total: bigint; unit: bigint }): BoundReading {
  const coherent = new Map<string, { b: Branch; c: number; amp: C }>()
  let disturbed = 0
  const all: Branch[] = []

  for (const { e, c, u, fine, branches } of s.values()) {
    const z = u === undefined || fine === undefined ? clockPhase(e) : cm(clockPhase(e), finePhase(u, fine))

    for (const b of branches) {
      all.push(b)

      const key = `${configurationKey(b)}#${c}`
      const v = cm(eisensteinValue(b.a, b.b, b.k), z)
      const o = coherent.get(key)

      if (o) o.amp = [o.amp[0] + v[0], o.amp[1] + v[1]]
      else coherent.set(key, { b, c, amp: v })

      // the vacuum part: every slot and store but the open loves' as the vacuum's own run
      let differs = false

      for (let i = 0; i < b.vibe.length && !differs; i++) {
        if (b.vibe[i] !== 0 && b.open[i] === 1) {
          if (vacuum.vibe[i] !== 0) differs = true
          continue
        }

        if (b.vibe[i] !== vacuum.vibe[i] || b.open[i] !== vacuum.open[i] || (b.vibe[i] !== 0 && b.point[i] !== vacuum.point[i])) differs = true
      }

      for (let i = 0; i < b.store.length && !differs; i++) if (b.store[i] !== vacuum.store[i] || b.sopen[i] !== vacuum.sopen[i] || (b.store[i] !== 0 && b.spoint[i] !== vacuum.spoint[i])) differs = true
      if (differs) disturbed++
    }
  }

  const n = lockedNorm({ branches: all })
  const pointProbability = new Map<string, number>()
  const cells = vacuum.vibe.length / 24
  const columnExcess = new Float64Array(husk.columns)
  const ev = dockEnergies(vacuum, new Int32Array(cells))
  const eb = new Int32Array(cells)
  let leak = 0
  let total = 0

  for (const { b, c, amp } of coherent.values()) {
    const w = amp[0] ** 2 + amp[1] ** 2
    const ps: PointLove[] = []
    let off = false

    total += w

    for (let i = 0; i < b.vibe.length; i++) {
      if (b.vibe[i] === 0 || b.open[i] !== 1) continue

      const x = ring.position.get(Math.floor(i / 24))
      const d = i % 24

      if (x === undefined || (d !== ring.first && d !== ring.second)) off = true
      else ps.push({ x, j: d === ring.first ? 0 : 1, p: b.point[i] as number })
    }

    if (off) leak += w
    else {
      const k = `${pointKeyOf(ps)}#${c}`

      pointProbability.set(k, (pointProbability.get(k) ?? 0) + w)
    }

    dockEnergies(b, eb)

    for (let x = 0; x < cells; x++) {
      const d = (eb[x] as number) - (ev[x] as number)

      if (d !== 0) columnExcess[husk.column[x] as number]! += w * d
    }
  }

  return { pointProbability, leak, disturbed, total, columnExcess, freeNormKept: n.total * start.unit === start.total * n.unit, physicalNorm: total }
}

export function cutGap(p: Map<string, number>, s: CutState): number {
  let worst = 0
  const q = new Map<string, number>()

  for (const [k, v] of s) q.set(k, v.amp[0] ** 2 + v.amp[1] ** 2)
  for (const [k, v] of q) worst = Math.max(worst, Math.abs((p.get(k) ?? 0) - v))
  for (const [k, v] of p) if (!q.has(k)) worst = Math.max(worst, v)

  return worst
}

// ---- the exact window with the pieces ----

export type BoundWindowBeat = { branches: number; slices: number; normKept: boolean; physicalNormOff: number; leak: number; disturbed: number; pointGap: number; energyGap: number }

export type BoundWindow = { side: number; L: number; dropped: number; startBranches: number; beats: BoundWindowBeat[]; reversed: boolean; seconds: number }

export function boundWindow(options: BoundOptions, side: number, beats: number, placed: readonly Placed[], P: number): BoundWindow {
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
  const physical0 = Number(n0.total) / Number(n0.unit)
  let s = boundStart(start)
  let v: LockedState = { branches: [{ ...vac, a: 1n, b: 0n, k: 0 }] }
  let ps = placeCut(L, fit.kept, 0, P)
  const pieceOptions: PieceOptions = { ...options, unit: 0, flat: false }
  const out: BoundWindowBeat[] = []

  for (let t = 0; t < beats; t++) {
    s = boundBeat(options, f.tables, ring, s, t)
    v = coinedVetoBeat('none', f.tables, v, t)
    ps = pointBeatWith(pieceOptions, f.tables, ring, ps)

    const r = readBound(s, ring, v.branches[0] as Branch, husk, n0)
    const expected = ringColumns(husk, ring, cutDensity(L, ps))
    let energyGap = 0

    for (let c = 0; c < husk.columns; c++) energyGap = Math.max(energyGap, Math.abs((r.columnExcess[c] as number) - (expected[c] as number)))

    out.push({
      branches: [...s.values()].reduce((a, x) => a + x.branches.length, 0),
      slices: s.size,
      normKept: r.freeNormKept,
      physicalNormOff: Math.abs(r.physicalNorm - physical0),
      leak: r.leak,
      disturbed: r.disturbed + (v.branches.length === 1 ? 0 : 1),
      pointGap: cutGap(r.pointProbability, ps),
      energyGap,
    })
  }

  let back = s

  for (let t = beats - 1; t >= 0; t--) back = boundBeatBack(options, f.tables, ring, back, t)

  const only = back.get('0,0')
  const reversed = back.size === 1 && only !== undefined && only.branches.length === start.branches.length && start.branches.every(b => only.branches.some(c => c.a === b.a && c.b === b.b && c.k === b.k && sameConfiguration(c, b)))

  return { side, L, dropped: fit.dropped, startBranches: start.branches.length, beats: out, reversed, seconds: (Date.now() - started) / 1000 }
}

// ---- the link register in full: every link's trit, no Gauss reduction (flat points) ----
//
// The cost's register written out on every link of a ring of L, each a trit, each written only by a love's copy across
// it (forward f_l - 1, back f_l + 1), each read only by its own link's phase. It checks the reduction to one cut trit
// on a cluster of three (Gauss with total charge 3 = 0 mod 3), and it is the only honest form for a LONE love, whose
// charge 1 is not 0 mod 3: its string runs from its start to wherever it is.

export type FluxState = Map<string, { ts: { x: number; j: number }[]; f: Int8Array; amp: C }>

function addFlux(out: FluxState, ts: { x: number; j: number }[], f: Int8Array, amp: C): void {
  const sorted = ts.slice().sort((u, v) => 2 * u.x + (u.j === 0 ? 1 : 0) - (2 * v.x + (v.j === 0 ? 1 : 0)))
  const key = `${sorted.map(t => `${t.x},${t.j}`).join('|')}#${f.join('')}`
  const o = out.get(key)

  if (o) o.amp = [o.amp[0] + amp[0], o.amp[1] + amp[1]]
  else out.set(key, { ts: sorted, f, amp })
}

// the start: each configuration with its Gauss flux f_l = Q(l) mod 3 (Q the loves at positions 0 .. l; none outside an
// arc from 0 that holds a multiple of three), or with every trit 0 (`gauss` false: a lone love's string starts empty)
export function fluxStart(L: number, loves: readonly { ts: readonly (readonly [number, number])[]; amp: C }[], gauss: boolean): FluxState {
  const out: FluxState = new Map()

  for (const { ts, amp } of loves) {
    const at = ts.map(([x, j]) => ({ x: (((x % L) + L) % L), j }))
    const f = new Int8Array(L)

    if (gauss) {
      let Q = 0

      for (let l = 0; l < L; l++) {
        Q += at.filter(t => t.x === l).length
        f[l] = Q % 3
      }
    }

    addFlux(out, at, f, amp)
  }

  return out
}

export function fluxBeat(options: BoundOptions, L: number, state: FluxState): FluxState {
  const out: FluxState = new Map()

  for (const { ts, f, amp } of state.values()) {
    let start = amp

    if (options.cost) {
      let n = 0

      for (let l = 0; l < L; l++) if (f[l] !== 0) n++

      const th = (-2 * Math.PI * n) / CLOCK

      start = cm(start, [Math.cos(th), Math.sin(th)])
    }

    let pieces: { ts: { x: number; j: number }[]; amp: C }[] = [{ ts: ts.map(t => ({ ...t })), amp: start }]

    for (const x of [...new Set(ts.map(t => t.x))]) {
      const at = ts.map((t, i) => (t.x === x ? i : -1)).filter(i => i >= 0)
      const next: typeof pieces = []

      for (const piece of pieces) {
        if (at.length === 2) {
          next.push({ ts: piece.ts, amp: cm(cm(piece.amp, W), W) })
          continue
        }

        const i = at[0] as number
        const crossed = piece.ts.map(t => ({ ...t }))

        next.push({ ts: piece.ts, amp: cm(piece.amp, KEEP) })
        crossed[i]!.j = 1 - crossed[i]!.j
        next.push({ ts: crossed, amp: cm(piece.amp, CROSS) })
      }

      pieces = next
    }

    for (const piece of pieces) {
      let a = piece.amp

      if (options.sign && lineSign(L, piece.ts) < 0) a = [-a[0], -a[1]]

      const g = Int8Array.from(f)
      const moved = piece.ts.map(t => {
        if (t.j === 0) g[t.x] = (((g[t.x] as number) + 2) % 3) as number
        else {
          const l = (((t.x - 1) % L) + L) % L

          g[l] = (((g[l] as number) + 1) % 3) as number
        }

        return { x: (((t.x + (t.j === 0 ? 1 : -1)) % L) + L) % L, j: t.j }
      })

      addFlux(out, moved, g, a)
    }
  }

  return out
}

export function fluxDensity(L: number, s: FluxState): Float64Array {
  const out = new Float64Array(L)

  for (const { ts, amp } of s.values()) for (const t of ts) out[t.x]! += amp[0] ** 2 + amp[1] ** 2

  return out
}

export type LoneFront = { L: number; beats: number; supportSame: boolean; densityOff: number; reachWith: number; reachWithout: number; farWith: number; farWithout: number }

// one love at position 0 of a ring long enough that nothing wraps, `beats` beats with the full register's cost and
// without: whether the support is the same at every beat, the largest density difference, the farthest position
// reached either way, and the weight beyond half the reach at the end
export function loneFront(beats: number): LoneFront {
  const L = 2 * beats + 4
  let a = fluxStart(L, [{ ts: [[0, 0]], amp: [1, 0] }], false)
  let b = fluxStart(L, [{ ts: [[0, 0]], amp: [1, 0] }], false)
  let supportSame = true
  let densityOff = 0
  let da = new Float64Array(L)
  let db = new Float64Array(L)

  for (let t = 0; t < beats; t++) {
    a = fluxBeat({ cost: true, sign: false }, L, a)
    b = fluxBeat({ cost: false, sign: false }, L, b)
    da = fluxDensity(L, a)
    db = fluxDensity(L, b)

    for (let x = 0; x < L; x++) {
      if (((da[x] as number) > 1e-15) !== ((db[x] as number) > 1e-15)) supportSame = false
      densityOff = Math.max(densityOff, Math.abs((da[x] as number) - (db[x] as number)))
    }
  }

  const reach = (d: Float64Array): number => Math.max(...[...d].map((v, x) => (v > 1e-15 ? Math.min(x, L - x) : 0)))
  const far = (d: Float64Array): number => [...d].reduce((s, v, x) => s + (Math.min(x, L - x) > beats / 4 ? v : 0), 0)

  return { L, beats, supportSame, densityOff, reachWith: reach(da), reachWithout: reach(db), farWith: far(da), farWithout: far(db) }
}

const sortedKey = (ts: readonly { x: number; j: number }[]): string =>
  ts
    .map(t => ({ m: 2 * t.x + (t.j === 0 ? 1 : 0), s: `${t.x},${t.j}` }))
    .sort((u, v) => u.m - v.m)
    .map(u => u.s)
    .join('|')

// the largest gap between the cut-trit form (flat) and the full register, over `beats` beats of a placed cluster
export function reductionGap(options: BoundOptions, tables: LockedTables, ring: AxisRing, placed: readonly Placed[], P: number, beats: number): number {
  const L = ring.docks.length
  let cut = placeCut(L, placed, 0, P)
  let full = fluxStart(
    L,
    [...cut.values()].map(v => ({ ts: v.ts.map(t => [t.x, t.j] as const), amp: v.amp })),
    true,
  )
  let worst = 0

  for (let t = 0; t < beats; t++) {
    cut = pointBeatWith({ ...options, unit: 0, flat: true }, tables, ring, cut)
    full = fluxBeat(options, L, full)

    const p = new Map<string, number>()

    for (const v of cut.values()) {
      const k = sortedKey(v.ts)

      p.set(k, (p.get(k) ?? 0) + v.amp[0] ** 2 + v.amp[1] ** 2)
    }

    const q = new Map<string, number>()

    for (const v of full.values()) {
      const k = sortedKey(v.ts)

      q.set(k, (q.get(k) ?? 0) + v.amp[0] ** 2 + v.amp[1] ** 2)
    }

    for (const [k, v] of p) worst = Math.max(worst, Math.abs(v - (q.get(k) ?? 0)))
    for (const [k, v] of q) if (!p.has(k)) worst = Math.max(worst, v)
  }

  return worst
}

// ---- the sign's holonomy ----

export type Holonomy = { L: number; states: number; edges: number; consistent: boolean; exchangeLoops: number; exchangeMinus: boolean; windingPlus: boolean }

// the line block's sign on labelled configurations of three loves on the side's axis line, the transitions the rule's
// own tables give (each lone love kept or crossed by the coin, a full line kept, then streamed by tables.target): a
// potential phi is spread from one start along a spanning tree, and every edge is checked against it. Consistent: every
// edge agrees, so the product around every closed loop of the labelled graph is +1. Then every reached labelled state
// with two labels swapped must carry -phi (an exchange loop, back to the same occupation with two loves exchanged, is
// -1), and every cyclic relabelling +phi (three loves, an even permutation: a loop that winds one love past the others
// is +1).
export function signHolonomy(side: number): Holonomy {
  const center = centerOf(side)
  const f = contactFresh(side, 'pass', center)
  const ring = axisRing(f.tables, center)
  const L = ring.docks.length
  const M = 2 * L
  const code = (m: readonly number[]): number => ((m[0] as number) * M + (m[1] as number)) * M + (m[2] as number)
  const modeX = (m: number): number => m >> 1
  const modeJ = (m: number): number => m & 1
  const step = (m: number, j: number): number => {
    const slot = (ring.docks[modeX(m)] as number) * 24 + (j === 0 ? ring.first : ring.second)
    const to = f.tables.target[slot] as number
    const x = ring.position.get(Math.floor(to / 24))
    const d = to % 24

    if (x === undefined || (d !== ring.first && d !== ring.second)) throw new Error('bound-line: the stream leaves the line')
    if (x !== (((modeX(m) + (j === 0 ? 1 : -1)) % L) + L) % L || (d === ring.first ? 0 : 1) !== j) throw new Error('bound-line: the stream is not one position along the line')

    return 2 * x + (d === ring.first ? 0 : 1)
  }
  const phi = new Map<number, number>()
  const start = [0, 2, 4]
  const queue: number[][] = [start]
  let edges = 0
  let consistent = true

  phi.set(code(start), 1)

  while (queue.length > 0) {
    const m = queue.shift() as number[]
    const here = phi.get(code(m)) as number
    const xs = m.map(modeX)
    const lone = [0, 1, 2].filter(i => xs.filter(x => x === xs[i]).length === 1)

    for (let mask = 0; mask < 1 << lone.length; mask++) {
      const js = m.map(modeJ)

      lone.forEach((i, n) => {
        if ((mask >> n) & 1) js[i] = 1 - (js[i] as number)
      })

      const loves = m.map((_, i) => ({ x: xs[i] as number, j: js[i] as number }))
      const sign = lineSign(L, loves)
      const next = m.map((_, i) => step(2 * (xs[i] as number) + (js[i] as number), js[i] as number))
      const k = code(next)
      const want = here * sign

      edges++

      const seen = phi.get(k)

      if (seen === undefined) {
        phi.set(k, want)
        queue.push(next)
      } else if (seen !== want) consistent = false
    }
  }

  let exchangeLoops = 0
  let exchangeMinus = true
  let windingPlus = true

  for (const [k, p] of phi) {
    const m = [Math.floor(k / (M * M)), Math.floor(k / M) % M, k % M]

    for (const [a, b] of [
      [0, 1],
      [0, 2],
      [1, 2],
    ] as const) {
      const s = m.slice()

      s[a] = m[b] as number
      s[b] = m[a] as number

      const q = phi.get(code(s))

      if (q === undefined) continue
      exchangeLoops++
      if (q !== -p) exchangeMinus = false
    }

    const q = phi.get(code([m[1] as number, m[2] as number, m[0] as number]))

    if (q !== undefined && q !== p) windingPlus = false
  }

  return { L, states: phi.size, edges, consistent, exchangeLoops, exchangeMinus, windingPlus }
}

export const boundNorm = (s: BoundState): { total: bigint; unit: bigint } => lockedNorm({ branches: [...s.values()].flatMap(x => x.branches) })

export const physicalWeight = (b: Branch): number => Number(norm(b.a, b.b)) / 4 ** b.k
