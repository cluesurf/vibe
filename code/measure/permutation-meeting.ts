// Measurement for E-SPN-0104: the working rule with the two pieces of code/rule/bound-line-pieces and the like meeting
// of code/rule/permutation-meeting, read the way E-SPN-0103 reads it (code/measure/bound-line).
//
// THE LINE'S OWN TRANSPORT (lineGauge). A love streamed along the axis line takes each link's point move. The move of the
// second slot at x + 1 undoes the first slot's at x on every link of every side read (tmp/split-probe1.log: 8 of 8, 12
// of 12, 16 of 16), so the transport along the line is FLAT: a love's point at x is T(x0 -> x) of its point at x0,
// whatever zigzag it took, and only a winding of the ring adds the holonomy h = T(0 -> L). So "two loves carry equal
// points" is a statement about their frames that transport keeps, and a placement can put every love in ONE frame:
// the parallel placement, point T(0 -> x)(0) at x. E-SPN-0103 placed every love at point 0 in the table's gauge, which
// is a different frame at every dock.
//
// THE FRAMED LABEL (cutRelativeFramed): the relative reading of code/measure/bound-line cutRelative, with each love's
// point read in the parallel frame (T(0 -> x)^(-1) of it, along the cluster's own arc from its anchor, so a love past
// the ring's cut from the anchor takes h^(-1)) and the tuple taken to its least image under the powers of h
// (a translate that wound the ring carries every point moved by the same power of h, the same relative state). A run on
// flat links is read in the flat links' own gauge (flatGauge, every transport the identity), where the label is
// cutRelative's; reading it in the mesh's gauge would be the wrong frame (tmp/split-probe2.log: Fab read 0.39 so).
//
// THE EXACT WINDOW (meetingWindow): code/measure/bound-line boundWindow with the meeting and the placement chosen, and
// gate L's readings on the rule's own branches: the tone of every mesh line (E-SPN-0098's law) on every branch at every
// beat against the start's, and the light cone (every open love at beat t within one ring step of a position some
// branch held at beat t - 1: nothing goes faster than one dock a beat; an open love off the line counts as outside).

import {
  lockedNorm,
  sameConfiguration,
  mergeBranches,
  cloneConfiguration,
  type Branch,
  type Configuration,
  type LockedState,
  type LockedTables,
} from '@/code/rule/doublet-locked-knit'
import {
  coinedVetoBeat,
  coinBranch,
} from '@/code/rule/coined-locked-knit'
import { toWords } from '@/code/rule/occupation-veto-knit'
import {
  boundBeat,
  boundBeatBack,
  boundStart,
  type BoundOptions,
  type BoundState,
} from '@/code/rule/bound-line-pieces'
import { meetingBeat } from '@/code/rule/permutation-meeting'
import { ringKey } from '@/code/measure/coined-line-bloch'
import { boxHusk } from '@/code/measure/causal-components'
import { centerOf } from '@/code/measure/wall-reading'
import { contactFresh } from '@/code/measure/occupation-veto-readings'
import { vacuumConfiguration } from '@/code/measure/doublet-locked-readings'
import { lineCharges, meshLines } from '@/code/measure/full-key-paths'
import {
  axisRing,
  eisenstein,
  eisensteinValue,
  fitRing,
  ringColumns,
  type AxisRing,
  type Placed,
  type Relative,
} from '@/code/measure/held-cluster'
import {
  cutDensity,
  cutGap,
  fluxBeat,
  fluxStart,
  pointBeatWith,
  readBound,
  type CutState,
  type PieceOptions,
} from '@/code/measure/bound-line'

type C = [number, number]

export type Placement = 'zero' | 'parallel'

export type LineGauge = {
  L: number
  to: number[][]
  from: number[][]
  holonomy: number[]
  flatLinks: number
  order: number
  powers: number[][]
}

// the transport along the ring from dock 0: to[x] = T(0 -> x), from[x] its inverse, the holonomy T(0 -> L), how many
// links the zigzag (the second slot at x + 1 after the first at x) leaves every point alone, and the powers of h
export function lineGauge(
  tables: LockedTables,
  ring: AxisRing,
): LineGauge {
  const L = ring.docks.length
  const id = [...Array(9).keys()]
  const fw = (x: number): number[] =>
    id.map(
      p => tables.move[(ring.docks[x]! * 24 + ring.first) * 9 + p]!,
    )
  const bw = (x: number): number[] =>
    id.map(
      p => tables.move[(ring.docks[x]! * 24 + ring.second) * 9 + p]!,
    )
  const to: number[][] = [id]

  let flatLinks = 0

  for (let x = 0; x < L; x++) {
    const a = fw(x)
    const b = bw((x + 1) % L)

    if (a.every((v, p) => b[v] === p)) {
      flatLinks++
    }

    if (x < L - 1) {
      to.push(to[x]!.map(p => a[p]!))
    }
  }

  const last = fw(L - 1)
  const holonomy = to[L - 1]!.map(p => last[p]!)
  const from = to.map(g => {
    const inv = new Array<number>(9)

    g.forEach((v, p) => (inv[v] = p))

    return inv
  })
  const powers: number[][] = [id]

  for (;;) {
    const next = powers[powers.length - 1]!.map(p => holonomy[p]!)

    if (next.every((v, p) => v === p)) {
      break
    }

    powers.push(next)
  }

  return {
    L,
    to,
    from,
    holonomy,
    flatLinks,
    order: powers.length,
    powers,
  }
}

// the flat links' transport (every move the identity): the gauge to read a flat-link run in
export function flatGauge(L: number): LineGauge {
  const id = [...Array(9).keys()]

  return {
    L,
    to: Array.from({ length: L }, () => id),
    from: Array.from({ length: L }, () => id),
    holonomy: id,
    flatLinks: L,
    order: 1,
    powers: [id],
  }
}

// the point a placed love at ring position x takes: 0 in the table's gauge, or T(0 -> x)(0) in the parallel frame
export const placedPoint = (
  gauge: LineGauge,
  placement: Placement,
  x: number,
): number => (placement === 'zero' ? 0 : gauge.to[x]![0]!)

export function placeCutFramed(
  gauge: LineGauge,
  placed: readonly Placed[],
  P: number,
  placement: Placement,
): CutState {
  const L = gauge.L
  const out: CutState = new Map()

  for (const p of placed) {
    const { a, b } = eisenstein(p.re, p.im, P)

    if (a === 0n && b === 0n) {
      continue
    }

    const ts = p.ts.map(([x, j]) => {
      const at = ((x % L) + L) % L

      return { x: at, j, p: placedPoint(gauge, placement, at) }
    })
    const key = `${ts
      .slice()
      .sort(
        (u, v) =>
          2 * u.x +
          (u.j === 0 ? 1 : 0) -
          (2 * v.x + (v.j === 0 ? 1 : 0)),
      )
      .map(t => `${t.x},${t.j},${t.p}`)
      .join('|')}#0`
    const o = out.get(key)
    const v = eisensteinValue(a, b, P)

    if (o) {
      o.amp = [o.amp[0] + v[0], o.amp[1] + v[1]]
    } else {
      out.set(key, { ts, c: 0, amp: v })
    }
  }

  return out
}

export function placeExactFramed(
  base: Configuration,
  ring: AxisRing,
  gauge: LineGauge,
  placed: readonly Placed[],
  P: number,
  placement: Placement,
): LockedState {
  const L = ring.docks.length
  const list: Branch[] = []

  for (const p of placed) {
    const { a, b } = eisenstein(p.re, p.im, P)

    if (a === 0n && b === 0n) {
      continue
    }

    const c = cloneConfiguration(base)

    for (const [x0, j] of p.ts) {
      const x = ((x0 % L) + L) % L
      const slot =
        ring.docks[x]! * 24 + (j === 0 ? ring.first : ring.second)

      if (c.vibe[slot] !== 0) {
        throw new Error(
          'permutation-meeting: a placed love lands on a held slot',
        )
      }

      c.vibe[slot] = 1
      c.point[slot] = placedPoint(gauge, placement, x)
      c.open[slot] = 1
    }

    list.push({ ...c, a, b, k: P })
  }

  return { branches: mergeBranches(list) }
}

const modeOf = (t: { x: number; j: number }): number =>
  2 * t.x + (t.j === 0 ? 1 : 0)

// the K = 0 part with the framed, winding-free point label (see the header)
export function cutRelativeFramed(
  gauge: LineGauge,
  s: CutState,
): Relative {
  const L = gauge.L
  const out: Relative = new Map()

  for (const { ts, c, amp } of s.values()) {
    const xs = [...new Set(ts.map(t => t.x))].sort((a, b) => a - b)

    let anchor = xs[0]!
    let gap = -1

    xs.forEach((x, i) => {
      const prev = xs[(i - 1 + xs.length) % xs.length]!
      const g = (((x - prev) % L) + L) % L || L

      if (g > gap) {
        gap = g
        anchor = x
      }
    })

    // each point in dock 0's frame along the cluster's own arc: a love past the cut from the anchor (x < anchor) is
    // reached across the cut link, which carries h, so its framed point takes h^(-1)
    const back = gauge.powers[gauge.order - 1]!
    const rel = ts
      .map(t => {
        const framed = gauge.from[t.x]![t.p]!

        return {
          x: (((t.x - anchor) % L) + L) % L,
          j: t.j,
          p: t.x < anchor ? back[framed]! : framed,
        }
      })
      .sort((u, v) => modeOf(u) - modeOf(v))
    const key = ringKey(rel.map(t => ({ x: t.x, j: t.j, f: 0 })))

    let label = ''

    for (const h of gauge.powers) {
      const l = rel.map(t => h[t.p]!).join(',')

      if (label === '' || l < label) {
        label = l
      }
    }

    const before = (((anchor - 1) % L) + L) % L
    const outside =
      (((c + ts.filter(t => t.x <= before).length) % 3) + 3) % 3
    const q = `${label}#${outside}`
    const m = out.get(key) ?? new Map<string, C>()
    const o = m.get(q) ?? [0, 0]

    m.set(q, [o[0] + amp[0], o[1] + amp[1]])
    out.set(key, m)
  }

  return out
}

// ---- the exact window, with gate L's readings ----

export type MeetingWindowBeat = {
  branches: number
  slices: number
  normKept: boolean
  physicalNormOff: number
  leak: number
  disturbed: number
  pointGap: number
  energyGap: number
  toneBroken: number
  outsideCone: number
  reach: number
}

export type MeetingWindow = {
  side: number
  L: number
  lines: number
  startBranches: number
  beats: MeetingWindowBeat[]
  reversed: boolean
  seconds: number
}

// the side's working vacuum, its husk, its axis ring, the ring's transport and its mesh lines: what a window reads
export type WindowContext = {
  side: number
  f: ReturnType<typeof contactFresh>
  vac: Configuration
  husk: ReturnType<typeof boxHusk>
  ring: AxisRing
  gauge: LineGauge
  lines: ReturnType<typeof meshLines>
  L: number
}

export function windowContext(side: number): WindowContext {
  const center = centerOf(side)
  const f = contactFresh(side, 'pass', center)
  const vac = toWords(vacuumConfiguration(f, 'none'))
  const ring = axisRing(f.tables, center)

  return {
    side,
    f,
    vac,
    husk: boxHusk(f.weave.mesh, side),
    ring,
    gauge: lineGauge(f.tables, ring),
    lines: meshLines(f.tables),
    L: ring.docks.length,
  }
}

export function meetingWindow(
  options: BoundOptions,
  placement: Placement,
  side: number,
  beats: number,
  placed: readonly Placed[],
  P: number,
): MeetingWindow {
  const started = Date.now()
  const ctx = windowContext(side)
  const fit = fitRing(placed, ctx.L)
  const start = placeExactFramed(
    ctx.vac,
    ctx.ring,
    ctx.gauge,
    fit.kept,
    P,
    placement,
  )

  return runWindow(
    options,
    ctx,
    boundStart(start),
    placeCutFramed(ctx.gauge, fit.kept, P, placement),
    beats,
    started,
  )
}

// the window's loop on any start given twice, as the rule's sliced state and as the ring form's (the same amplitudes):
// every slice (clock count, cut trit) of the start is run; the reversal must give back every slice exactly
export function runWindow(
  options: BoundOptions,
  ctx: WindowContext,
  s0: BoundState,
  ps0: CutState,
  beats: number,
  started = Date.now(),
): MeetingWindow {
  const { side, f, vac, husk, ring, lines, L } = ctx
  const startBranches = [...s0.values()].flatMap(x => x.branches)
  const tone0 = lineCharges(lines, startBranches[0]!).tone
  const support = new Set<number>()

  for (const b of startBranches) {
    for (let i = 0; i < b.vibe.length; i++) {
      if (b.vibe[i] !== 0 && b.open[i] === 1) {
        support.add(ring.position.get(Math.floor(i / 24))!)
      }
    }
  }

  let previous = support

  const n0 = lockedNorm({ branches: startBranches })
  const physical0 = Number(n0.total) / Number(n0.unit)

  let s: BoundState = s0
  let v: LockedState = { branches: [{ ...vac, a: 1n, b: 0n, k: 0 }] }
  let ps = ps0

  const pieceOptions: PieceOptions = {
    ...options,
    unit: 0,
    flat: false,
  }
  const out: MeetingWindowBeat[] = []
  const ringDistance = (a: number, b: number): number =>
    Math.min((((a - b) % L) + L) % L, (((b - a) % L) + L) % L)

  for (let t = 0; t < beats; t++) {
    s = boundBeat(options, f.tables, ring, s, t)
    v = coinedVetoBeat('none', f.tables, v, t)
    ps = pointBeatWith(pieceOptions, f.tables, ring, ps)

    const r = readBound(s, ring, v.branches[0]!, husk, n0)
    const expected = ringColumns(husk, ring, cutDensity(L, ps))

    let energyGap = 0
    let toneBroken = 0
    let outsideCone = 0
    let reach = 0

    const now = new Set<number>()

    for (let c = 0; c < husk.columns; c++) {
      energyGap = Math.max(
        energyGap,
        Math.abs(r.columnExcess[c]! - expected[c]!),
      )
    }

    for (const slice of s.values()) {
      for (const b of slice.branches) {
        const tone = lineCharges(lines, b).tone

        for (let k = 0; k < tone.length; k++) {
          if (tone[k] !== tone0[k]) {
            toneBroken++
          }
        }

        for (let i = 0; i < b.vibe.length; i++) {
          if (b.vibe[i] === 0 || b.open[i] !== 1) {
            continue
          }

          const x = ring.position.get(Math.floor(i / 24))

          if (x === undefined) {
            outsideCone++
            continue
          }

          now.add(x)
          reach = Math.max(
            reach,
            Math.min(...[...support].map(y => ringDistance(x, y))),
          )

          if (
            Math.min(...[...previous].map(y => ringDistance(x, y))) > 1
          ) {
            outsideCone++
          }
        }
      }
    }

    previous = now

    out.push({
      branches: [...s.values()].reduce(
        (a, x) => a + x.branches.length,
        0,
      ),
      slices: s.size,
      normKept: r.freeNormKept,
      physicalNormOff: Math.abs(r.physicalNorm - physical0),
      leak: r.leak,
      disturbed: r.disturbed + (v.branches.length === 1 ? 0 : 1),
      pointGap: cutGap(r.pointProbability, ps),
      energyGap,
      toneBroken,
      outsideCone,
      reach,
    })
  }

  let back = s

  for (let t = beats - 1; t >= 0; t--) {
    back = boundBeatBack(options, f.tables, ring, back, t)
  }

  const reversed =
    back.size === s0.size &&
    [...s0].every(([k, slice]) => {
      const got = back.get(k)

      return (
        got?.branches.length === slice.branches.length &&
        slice.branches.every(b =>
          got.branches.some(
            c =>
              c.a === b.a &&
              c.b === b.b &&
              c.k === b.k &&
              sameConfiguration(c, b),
          ),
        )
      )
    })

  return {
    side,
    L,
    lines: lines.count,
    startBranches: startBranches.length,
    beats: out,
    reversed,
    seconds: (Date.now() - started) / 1000,
  }
}

// ---- the confinement reading: n loves with the drift cost's full link register ----
//
// n loves at positions 0 .. n - 1 (slots alternating first, second), every link's trit 0 at the start (the string
// starts empty: each love's string runs from where it started), run by code/measure/bound-line fluxBeat (flat links, the
// full per-link register, no Gauss reduction) with the cost and without, the sign on in both. Read at the end: the
// weight whose centroid lies more than beats / 4 from the start's (the far weight), the expected number of costly
// links (the string), the expected number of costly links OUTSIDE the loves' current span (the outside string), and
// per beat the rms distance of the centroid from the start's (how far the cluster as a whole goes). By
// Gauss a link outside both the start and the current span holds the charge that crossed it, n mod 3; the reading
// counts the register as it is, it does not assume this.

export type ChargeReading = {
  n: number
  beats: number
  L: number
  farWith: number
  farWithout: number
  stringWith: number
  stringWithout: number
  outsideWith: number
  outsideWithout: number
  states: number
  rmsWith: number[]
  rmsWithout: number[]
}

// `gauss` (n a multiple of 3 only: a ring holds no net charge mod 3): the start register is Gauss's, the flux inside
// the loves' span and none outside, the string of a neutral cluster closed at the start instead of anchored where
// each love began
export function chargeReading(
  n: number,
  beats: number,
  gauss = false,
): ChargeReading {
  if (gauss && n % 3 !== 0) {
    throw new Error(
      'permutation-meeting: a Gauss start needs a neutral cluster',
    )
  }

  const L = 2 * beats + 4 + n
  const start = [
    {
      ts: [...Array(n).keys()].map(k => [k, k % 2] as const),
      amp: [1, 0] as C,
    },
  ]
  const unwrap = (x: number): number => (x > L / 2 ? x - L : x)
  const c0 = (n - 1) / 2

  const read = (
    cost: boolean,
  ): {
    far: number
    string: number
    outside: number
    states: number
    rms: number[]
  } => {
    let s = fluxStart(L, start, gauss)

    const rms: number[] = []

    for (let t = 0; t < beats; t++) {
      s = fluxBeat({ cost, sign: true }, L, s)

      let m2 = 0

      for (const { ts, amp } of s.values()) {
        m2 +=
          (amp[0] ** 2 + amp[1] ** 2) *
          (ts.reduce((a, u) => a + unwrap(u.x), 0) / n - c0) ** 2
      }

      rms.push(Math.sqrt(m2))
    }

    let far = 0
    let string = 0
    let outside = 0

    for (const { ts, f, amp } of s.values()) {
      const w = amp[0] ** 2 + amp[1] ** 2
      const xs = ts.map(t => unwrap(t.x))
      const lo = Math.min(...xs)
      const hi = Math.max(...xs)

      if (
        Math.abs(xs.reduce((a, x) => a + x, 0) / n - c0) >
        beats / 4
      ) {
        far += w
      }

      for (let l = 0; l < L; l++) {
        if (f[l] === 0) {
          continue
        }

        string += w

        // link l joins positions l and l + 1: outside the span when both ends are
        const a = unwrap(l)
        const b = a + 1

        if (b <= lo || a >= hi) {
          outside += w
        }
      }
    }

    return { far, string, outside, states: s.size, rms }
  }

  const a = read(true)
  const b = read(false)

  return {
    n,
    beats,
    L,
    farWith: a.far,
    farWithout: b.far,
    stringWith: a.string,
    stringWithout: b.string,
    outsideWith: a.outside,
    outsideWithout: b.outside,
    states: a.states,
    rmsWith: a.rms,
    rmsWithout: b.rms,
  }
}

// ---- the controls: the vacuum alone, and a lone love, under the permutation meeting against the working rule ----

const sameState = (a: LockedState, b: LockedState): boolean =>
  a.branches.length === b.branches.length &&
  a.branches.every(x =>
    b.branches.some(
      y =>
        y.a === x.a &&
        y.b === x.b &&
        y.k === x.k &&
        sameConfiguration(x, y),
    ),
  )

export type SameAsWorking = {
  side: number
  beats: number
  vacuumSame: boolean
  loneSame: boolean
  loneBranches: number
  loneReach: number
}

// the side-`side` working vacuum, alone and with one open love on the axis line's first slot at the center, `beats`
// beats under the working rule (coin, the split meeting) and under the coin with the permutation meeting: equal bit for
// bit at every beat, and the lone love's reach along the line
export function sameAsWorking(
  meeting: 'keep' | 'exchange',
  side: number,
  beats: number,
): SameAsWorking {
  const center = centerOf(side)
  const f = contactFresh(side, 'pass', center)
  const vac = toWords(vacuumConfiguration(f, 'none'))
  const ring = axisRing(f.tables, center)
  const L = ring.docks.length
  const lone = cloneConfiguration(vac)
  const slot = center * 24 + ring.first

  if (lone.vibe[slot] !== 0) {
    throw new Error(
      'permutation-meeting: the lone love lands on a held slot',
    )
  }

  lone.vibe[slot] = 1
  lone.point[slot] = 0
  lone.open[slot] = 1

  const replaced = (s: LockedState, t: number): LockedState => {
    const coined: Branch[] = []

    for (const br of s.branches) {
      coined.push(
        ...coinBranch(
          f.tables.cells,
          { ...cloneConfiguration(br), a: br.a, b: br.b, k: br.k },
          false,
        ),
      )
    }

    return meetingBeat(
      meeting,
      'none',
      f.tables,
      { branches: mergeBranches(coined) },
      t,
    )
  }

  let va: LockedState = { branches: [{ ...vac, a: 1n, b: 0n, k: 0 }] }
  let vb = va
  let la: LockedState = { branches: [{ ...lone, a: 1n, b: 0n, k: 0 }] }
  let lb = la
  let vacuumSame = true
  let loneSame = true
  let loneReach = 0

  for (let t = 0; t < beats; t++) {
    va = coinedVetoBeat('none', f.tables, va, t)
    vb = replaced(vb, t)
    la = coinedVetoBeat('none', f.tables, la, t)
    lb = replaced(lb, t)

    if (!sameState(va, vb)) {
      vacuumSame = false
    }

    if (!sameState(la, lb)) {
      loneSame = false
    }
  }

  for (const b of lb.branches) {
    for (let i = 0; i < b.vibe.length; i++) {
      if (b.vibe[i] === 0 || b.open[i] !== 1) {
        continue
      }

      const x = ring.position.get(Math.floor(i / 24))!

      loneReach = Math.max(loneReach, Math.min(x, L - x))
    }
  }

  return {
    side,
    beats,
    vacuumSame,
    loneSame,
    loneBranches: lb.branches.length,
    loneReach,
  }
}
