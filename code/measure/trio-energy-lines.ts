// Measurement for E-GRV-0127: E-GRV-0106's dragged energy lines on E-SPN-0104's held trio (the working rule with the
// drift cost and the fermion sign, the parallel placement), read as a depth the way E-GRV-0119 reads its source.
//
// THE REGISTER ON A LINE. The trio's three loves stay on the axis ring (the line law; E-SPN-0104 leak 0) and the vacuum
// is untouched on every branch (E-GRV-0119 E0), so the seeded-minus-vacuum lines are the loves' own drag and live on the
// ring's links only. E-GRV-0106's drag (code/measure/energy-lines dragLines) reads the state just after the stream: a
// love in the first slot came forward across the link behind it (that link falls by one), a love in the second slot
// came back across the link ahead of it (that link rises by one). So the drag of a beat is a function of the post-stream
// state alone, and in the ring form (code/measure/bound-line pointBeatWith) it is read entry by entry.
//
// WHY THE REGISTER IS THE STATE PLUS ONE INTEGER. On a ring Gauss fixes every link from one: L(k) = L(k - 1) + n_k -
// n [k = s], with n_k the loves at position k, n = 3 of them, and s the sink (below). So an entry's lines are its
// positions plus the line on one reference link. The reference is the ring's CUT, link L - 1 (position L - 1 to 0), the
// link the drift cost's cut trit c lives on: L(L - 1) = -N, N the net loves that crossed the cut forward since beat 0,
// so L(k) = Q(k) - N - n [k >= s], Q(k) the loves at positions 0 .. k. N changes by a function of the post-stream entry
// (loves at 0 in the first slot minus loves at L - 1 in the second), so the ring form carries N EXACTLY by running each
// N sector separately and re-keying every output entry to N + its crossing: entries merged inside one sector have one
// output state and so one crossing. Carrying N changes the dynamics only if two sectors reach one state, which needs a
// love to wind the ring (c = -N mod 3 is already in the key); `sectorGap` measures it.
//
// BEAT-0 LINES. The only choice. The trio's 3 units must end somewhere on a closed box (E-GRV-0090's far sinks): here on
// the ring's dock s opposite the trio's start center c0. The beat-0 register must be ONE function of each entry's
// positions, or entries that later meet would carry different lines and stop interfering; N = 0 on every entry is that
// function (the 3 units leave the trio forward and end at s). Lines placed off the ring are not used: they would be
// fixed at beat 0 and depend on where each entry's loves started, the same objection.
//
// THE Z3 IDENTITY. The drift cost's string (code/rule/bound-line-pieces fluxLinks) holds c + Q(l) mod 3 on link l, and
// c starts at 0 and falls by one when a love crosses the cut forward (cutCrossing), as L(L - 1) does. The sink's n is 0
// mod 3. So in this gauge L(l) = c + Q(l) mod 3 on every link, entry and beat: the working rule's string IS the energy
// register mod 3. `z3` collects the residues L(l) - c - Q(l) mod 3 seen (the prediction: only 0).
//
// NOTHING MOVES: the lines are read off the ring form's entries. Floats (amplitudes, expectations) are measurement; the
// per-entry register is exact integers.

import { LINE_FIRSTS, LINE_OF } from '@/code/rule/isometric-knit'
import { lockedNorm, sameConfiguration, type Branch, type LockedState, type LockedTables } from '@/code/rule/doublet-locked-knit'
import { coinedVetoBeat } from '@/code/rule/coined-locked-knit'
import { boundBeat, boundBeatBack, boundStart, type BoundOptions, type BoundState } from '@/code/rule/bound-line-pieces'
import { divergence, stepDepth } from '@/code/rule/step-depth'
import { radionMesh } from '@/code/rule/trit-radion'
import { bulkLinks, huskCast, shellMeans, staticDepth, type HuskCast } from '@/code/measure/energy-lines'
import { pointBeatWith, readBound, type CutState, type PieceOptions } from '@/code/measure/bound-line'
import { fitRing, type AxisRing, type Placed, type PointLove } from '@/code/measure/held-cluster'
import { placeCutFramed, placeExactFramed, windowContext, type LineGauge } from '@/code/measure/permutation-meeting'

type C = [number, number]
const weightOf = (a: C): number => a[0] ** 2 + a[1] ** 2
const mod = (a: number, m: number): number => ((a % m) + m) % m

// ---- the ring's links as bulk links ----

export type RingLinks = { L: number; line: number; bulk: Int32Array }

// ring link k (position k to k + 1) is the bulk link of dock k along the ring's line; the drag of dragLines on a ring
// love lands on these links only when every first slot's source is the dock behind it, which is checked
export function ringLinks(tables: LockedTables, ring: AxisRing): RingLinks {
  const L = ring.docks.length
  const line = LINE_OF[ring.first] as number

  if (LINE_FIRSTS[line] !== ring.first) throw new Error('trio-energy-lines: the ring streams forward along its line first slot')

  for (let x = 0; x < L; x++) {
    const here = ring.docks[x] as number
    const from = Math.floor((tables.source[here * 24 + ring.first] as number) / 24)

    if (from !== ring.docks[mod(x - 1, L)]) throw new Error('trio-energy-lines: a first slot on the ring is not taken from the dock behind it')
  }

  return { L, line, bulk: Int32Array.from(ring.docks, d => d * 12 + line) }
}

// the drag of one post-stream love, E-GRV-0106's rule (dragLines, sense -1) on the ring's links, weighted
export function dragLove(L: number, t: { x: number; j: number }, out: Float64Array, w: number): void {
  if (t.j === 0) out[mod(t.x - 1, L)]! -= w
  else out[t.x]! += w
}

// the cut link's forward crossings in one post-stream entry
export const cutForward = (L: number, ts: readonly { x: number; j: number }[]): number => ts.reduce((a, t) => a + (t.j === 0 && t.x === 0 ? 1 : 0) - (t.j === 1 && t.x === L - 1 ? 1 : 0), 0)

// an entry's integer lines from its positions and N (see the header): L(k) = Q(k) - N - n [k >= s]
export function gaussLines(L: number, s: number, ts: readonly { x: number }[], N: number, out: Int32Array): Int32Array {
  const n = new Int32Array(L)

  for (const t of ts) n[t.x]!++

  let Q = 0

  for (let k = 0; k < L; k++) {
    Q += n[k] as number
    out[k] = Q - N - (k >= s ? ts.length : 0)
  }

  return out
}

// ---- the husk ----

// ring lines (per ring link) cast to husk links
export function ringHuskFlux(links: RingLinks, cast: HuskCast, lines: Float64Array, out: Float64Array, weight = 1): void {
  for (let k = 0; k < links.L; k++) {
    const b = links.bulk[k] as number

    out[cast.link[b] as number]! += weight * (cast.sign[b] as number) * (lines[k] as number)
  }
}

// least squares of y = a + k / r
export function inverseFit(rs: readonly number[], ys: readonly number[]): { a: number; k: number } {
  const xs = rs.map(r => 1 / r)
  const mx = xs.reduce((s, v) => s + v, 0) / xs.length
  const my = ys.reduce((s, v) => s + v, 0) / ys.length
  const k = xs.reduce((s, v, i) => s + (v - mx) * ((ys[i] as number) - my), 0) / xs.reduce((s, v) => s + (v - mx) ** 2, 0)

  return { a: my - k * mx, k }
}

export type DepthReading = { profile: number[]; k: number; curl: number; helmProfile: number[]; helmK: number; freeShare: number }

// G2's reading: the depth found by SUMMING the flux itself (code/rule/step-depth stepDepth, x_head = x_tail - F / g
// along its fixed path), its profile x(r) - x(ref) about `col` and its 1/r fit on `fitR`; beside it E-GRV-0107's
// reading, the divergence-fixed part (a Poisson solve), and the share of the flux that part leaves out
export function depthReading(side: number, col: number, flux: Float64Array, ref: number, fitR: readonly number[]): DepthReading {
  const mesh = radionMesh([side, side, side])
  const raw = stepDepth(mesh, flux)
  const depth = Float64Array.from(raw.twice, v => v / 2)
  const prof = (d: Float64Array): number[] => {
    const m = shellMeans(side, col, d)

    return m.map(v => v - (m[ref] as number))
  }
  const profile = prof(depth)
  const div = new Float64Array(mesh.docks)

  divergence(mesh, flux, div)

  const helm = staticDepth(side, div)
  const helmProfile = prof(helm.depth)
  let num = 0
  let den = 0

  for (let l = 0; l < flux.length; l++) {
    num += ((flux[l] as number) - (helm.flux[l] as number)) ** 2
    den += (flux[l] as number) ** 2
  }

  return {
    profile,
    k: inverseFit(fitR, fitR.map(r => profile[r] as number)).k,
    curl: raw.curl,
    helmProfile,
    helmK: inverseFit(fitR, fitR.map(r => helmProfile[r] as number)).k,
    freeShare: den > 0 ? Math.sqrt(num / den) : 0,
  }
}

// ---- the sectored ring run ----

export type Sectors = Map<number, CutState>

function addEntry(out: CutState, key: string, e: { ts: PointLove[]; c: number; amp: C }): void {
  const o = out.get(key)

  if (o) o.amp = [o.amp[0] + e.amp[0], o.amp[1] + e.amp[1]]
  else out.set(key, { ts: e.ts, c: e.c, amp: [e.amp[0], e.amp[1]] })
}

// one beat of the ring form per N sector, every output entry re-keyed to N + its cut crossing
export function sectorBeat(options: PieceOptions, tables: LockedTables, ring: AxisRing, state: Sectors): Sectors {
  const L = ring.docks.length
  const out: Sectors = new Map()

  for (const [N, st] of state) {
    for (const [key, e] of pointBeatWith(options, tables, ring, st)) {
      const M = N + cutForward(L, e.ts)
      let m = out.get(M)

      if (!m) {
        m = new Map()
        out.set(M, m)
      }

      addEntry(m, key, e)
    }
  }

  return out
}

export function sectorDensity(L: number, state: Sectors): Float64Array {
  const out = new Float64Array(L)

  for (const st of state.values()) for (const { ts, amp } of st.values()) for (const t of ts) out[t.x]! += weightOf(amp)

  return out
}

// what one beat's entries give: the expected drag, the expected Gauss register, the register's circulation moments,
// the weight off N = 0, the largest per-entry |L|, and the Z3 residues L(l) - c - Q(l) mod 3 seen
export type SectorReading = { drag: Float64Array; gauss: Float64Array; circulation: number; circulation2: number; offSector: number; largest: number; z3: Set<number> }

export function readSectors(L: number, s: number, state: Sectors, withDrag: boolean): SectorReading {
  const drag = new Float64Array(L)
  const gauss = new Float64Array(L)
  const g = new Int32Array(L)
  const z3 = new Set<number>()
  let circulation = 0
  let circulation2 = 0
  let offSector = 0
  let largest = 0

  for (const [N, st] of state) {
    for (const { ts, c, amp } of st.values()) {
      const w = weightOf(amp)

      if (withDrag) for (const t of ts) dragLove(L, t, drag, w)
      gaussLines(L, s, ts, N, g)

      let sum = 0
      let Q = 0

      for (let k = 0; k < L; k++) {
        const v = g[k] as number

        Q += ts.filter(t => t.x === k).length
        gauss[k]! += w * v
        sum += v
        if (w > 1e-15) largest = Math.max(largest, Math.abs(v))
        z3.add(mod(v - c - Q, 3))
      }

      circulation += (w * sum) / L
      circulation2 += (w * (sum / L) ** 2)
      if (N !== 0) offSector += w
    }
  }

  return { drag, gauss, circulation, circulation2, offSector, largest, z3 }
}

// ---- the exact window: the lines on the rule's own branches ----

export type ExactLines = { side: number; beats: number; branches: number[]; continuityOff: number; offRing: number; disturbed: number; leak: number; dragGap: number; reversed: boolean }

// the side-`side` exact window of E-GRV-0119's E0, run `beats` beats: on every branch at every beat, the loves' drag
// (each love's source dock read from the rule's own stream table) equals the change of the Gauss register from the
// source positions to the branch's, on every ring link but the reference, where it equals minus the crossing (the
// continuity of the register, integers); the expected drag of the coherent reading equals the ring form's; the window
// runs back to its start bit for bit
export function exactLines(options: BoundOptions, side: number, beats: number, placed: readonly Placed[], P: number): ExactLines {
  const ctx = windowContext(side)
  const { f, ring, husk, L } = ctx
  const gauge: LineGauge = ctx.gauge
  const fit = fitRing(placed, L)
  const s0 = boundStart(placeExactFramed(ctx.vac, ring, gauge, fit.kept, P, 'parallel'))
  const startCut = placeCutFramed(gauge, fit.kept, P, 'parallel')
  const n0 = lockedNorm({ branches: [...s0.values()].flatMap(x => x.branches) })
  const c0 = ringCenterOf(L, startCut)
  const sink = mod(Math.round(c0) + L / 2, L)
  const pieceOptions: PieceOptions = { ...options, unit: 0, flat: false }
  let st: BoundState = s0
  let ps = startCut
  let v: LockedState = { branches: [{ ...ctx.vac, a: 1n, b: 0n, k: 0 }] }
  const branches: number[] = []
  let continuityOff = 0
  let offRing = 0
  let disturbed = 0
  let leak = 0
  let dragGap = 0
  const gb = new Int32Array(L)
  const gu = new Int32Array(L)

  for (let t = 0; t < beats; t++) {
    st = boundBeat(options, f.tables, ring, st, t)
    v = coinedVetoBeat('none', f.tables, v, t)
    ps = pointBeatWith(pieceOptions, f.tables, ring, ps)

    let count = 0

    for (const slice of st.values()) {
      for (const b of slice.branches) {
        count++

        const now: { x: number; j: number }[] = []
        const was: { x: number }[] = []

        for (let i = 0; i < b.vibe.length; i++) {
          if (b.vibe[i] === 0 || b.open[i] !== 1) continue

          const x = ring.position.get(Math.floor(i / 24))
          const y = ring.position.get(Math.floor((f.tables.source[i] as number) / 24))
          const d = i % 24

          if (x === undefined || y === undefined || (d !== ring.first && d !== ring.second)) {
            offRing++
            continue
          }

          now.push({ x, j: d === ring.first ? 0 : 1 })
          was.push({ x: y })
        }

        const drag = new Float64Array(L)

        for (const u of now) dragLove(L, u, drag, 1)
        gaussLines(L, sink, now, 0, gb)
        gaussLines(L, sink, was, 0, gu)

        const cross = cutForward(L, now)

        // g(., N) is g(., 0) - N on every link, so L_b - L_u = g(b, 0) - g(u, 0) - cross must be the drag everywhere
        for (let k = 0; k < L; k++) if ((gb[k] as number) - (gu[k] as number) - cross !== (drag[k] as number)) continuityOff++
      }
    }

    branches.push(count)

    const r = readBound(st, ring, v.branches[0] as Branch, husk, n0)
    const exact = new Float64Array(L)
    const form = new Float64Array(L)

    disturbed += r.disturbed + (v.branches.length === 1 ? 0 : 1)
    leak += r.leak

    for (const [key, w] of r.pointProbability) {
      for (const part of (key.split('#')[0] as string).split('|')) {
        const [x, j] = part.split(',').map(Number) as [number, number]

        dragLove(L, { x, j }, exact, w)
      }
    }

    for (const { ts, amp } of ps.values()) for (const u of ts) dragLove(L, u, form, weightOf(amp))
    for (let k = 0; k < L; k++) dragGap = Math.max(dragGap, Math.abs((exact[k] as number) - (form[k] as number)))
  }

  let back = st

  for (let t = beats - 1; t >= 0; t--) back = boundBeatBack(options, f.tables, ring, back, t)

  const reversed =
    back.size === s0.size &&
    [...s0].every(([k, slice]) => {
      const got = back.get(k)

      return got !== undefined && got.branches.length === slice.branches.length && slice.branches.every(b => got.branches.some(c => c.a === b.a && c.b === b.b && c.k === b.k && sameConfiguration(c, b)))
    })

  return { side, beats, branches, continuityOff, offRing, disturbed, leak, dragGap, reversed }
}

// the circular mean position of a ring form's density
export function ringCenterOf(L: number, s: CutState): number {
  let cx = 0
  let sx = 0

  for (const { ts, amp } of s.values()) {
    const w = weightOf(amp)

    for (const t of ts) {
      cx += w * Math.cos((2 * Math.PI * t.x) / L)
      sx += w * Math.sin((2 * Math.PI * t.x) / L)
    }
  }

  return mod((Math.atan2(sx, cx) * L) / (2 * Math.PI), L)
}

// every husk link's cast, for a side's tables (bulkLinks + huskCast)
export function ringCast(tables: LockedTables, husk: Parameters<typeof huskCast>[1]): HuskCast {
  return huskCast(bulkLinks(tables), husk)
}
