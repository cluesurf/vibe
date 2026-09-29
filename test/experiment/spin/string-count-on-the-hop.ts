// The string's count carried by the light's copy on a husk line, which is the RECORDED HOP (E-SPN-0084): built as a
// rule, a STAND-IN on locked tokens on one husk line (code/rule/end-store-line).
//
// E-SPN-0084 proved that on a husk line the light's columns hold nothing Gauss does not fix, so the only copy that
// ever writes a line's column is a charge's recorded hop, and the only hops that change the string count l are those
// at the string's two ends. So the user's candidate (the count is the column's occupation, carried by the light's
// own copy, no flavor, no new register, the read one link) takes exactly one form on a line: each end's share of
// the count held at its END PORT, a column of D bulk trits, copied to the new end dock with the end. A group whose
// crossing changes l is paid by the end it happens at; an end that cannot pay bounces its group (E-SPN-0074).
// Nothing is held by a token, so Pauli keeps its lock. The rule is built here and gated as the user asked.
//
// THE THEOREM, written before this file ran (the mechanics probes below found where it breaks, and where it does not).
// Each end pays one unit per link it adds and gets one back per link it gives up, and on a cluster whose end docks
// never move without a change of l, the left end dock moves exactly when rL does, the same way: x_left - rL and
// x_right + rR are kept by every copy. With each port in -D .. D, each end stays within 2D + 1 docks of where it
// began, so the cluster cannot travel. In momentum space the kept quantity fixes the absolute position from the
// relative coordinates, so the one-beat operator at total momentum K is G(K) U(0) G(K)^dagger with G diagonal:
// every band is exactly flat. The one escape is a whole center-singlet cluster on one dock moving as one (l stays 0,
// no end pays): a love-fear pair at contact. Three loves on one dock carry no amplitude in the doublet sector (the
// antisymmetric cube of a doublet is zero), so three loves are pinned exactly.
//
// DISCLOSED MECHANICS PROBES (tmp/end-probe1.ts, tmp/end-probe2.ts), run before the predictions were written, read
// no level: the stream is a permutation with flip . stream . flip its inverse on six small sectors, keeps Gauss and
// rL + rR + l, reaches l = 2D from contact at D = 1 to 4 for both clusters, and breaks the end invariants only on
// contact states whose whole cluster moves as one; the three-love Bloch dimensions are 20, 120, 364 at D = 1, 2, 3.
//
// PREDICTIONS AND GATES, fixed before the first run (the user's list: husk-local, reversible, integer, Gauss exact,
// range 2D, E-SPN-0077's lightest charge-one state recovered: natural spin one half share >= 0.95, N = 3, 2 pi sign
// -1, travels, over the 17-start family).
// E1 Husk-local: over the reach sets from contact (the love-fear pair and three loves, D = 1, 2, 3, ring 4D + 7) and
//    the whole contact sector (both clusters, ring 9, D = 1, every label including the line), no register held 2 or
//    more docks from a token (another token's label, a port) changes that token's copy, and no token's label changes
//    a port 2 or more docks away: 0 witnesses over a nonzero number of checks in every case.
// E2 Reversible and Gauss exact: on the whole sectors (pair ring 9 D 1 with rL + rR + l = 0 and 1, three loves ring 9
//    D 1 with 0 and -1, pair and three loves ring 13 D 2 with 0) the stream is a permutation, flip . stream . flip is
//    its inverse, Gauss mod 3 and rL + rR + l hold on every image: 0 exceptions.
// E3 Integer: with the cost (c = N, M = 2 N^2) the pair (ring 11, D = 2, 12 beats) and three loves (ring 7, D = 1,
//    6 beats) run exactly in Z[x] / (x^K - 1) and equal the float runner (code/measure/end-run) to 1e-12; the norms
//    sum to den^2, the exact inverse returns the start, every supported register holds Gauss and rL + rR + l = 0.
// E4 The ends are pinned (the theorem): on E2's sectors x_left - rL and x_right + rR change only on contact states
//    whose whole cluster moves as one (0 other changes), and in the three-love doublet sector no antisymmetric vector
//    has weight on three loves on one dock (D = 1 to 3).
// E5 Range 2D: from contact under every doublet label sequence, the largest l reached is exactly 2D (the pair and
//    three loves, D = 1 to 4).
// E6 N = 3 and 2 pi sign -1: on the 27-label space (D = 1, 2; K = 0 and 0.7) the beat moves no weight from the
//    doublet-only states onto a state with a token on the line (below 1e-14).
// E7 Spin one half: the lightest three-love level (E-SPN-0076's definition) holds at least 0.95 of its weight in role
//    [2,1], D = 1 to 4.
// E8 It travels: tracked by overlap from K = 0 to pi in 12 steps at D = 2, 3, the lightest level's band is at least
//    0.01 wide and its group velocity reaches 0.02 docks per beat (consecutive overlaps at least 0.5). PREDICTED TO
//    FAIL by the theorem: every band flat below 1e-10.
// E9 The operator is the rule: one beat of the ring runner on a momentum state of ring 16 (K = 3 pi / 8, a
//    Weyl-filled relative state) equals the Bloch operator's image to 1e-12, three loves (D = 2) and the pair (D = 3).
// E10 The 17 link starts: with each start's color field, the costed three loves (ring 12, D = 2, 5 beats) and pair
//    (ring 24, D = 2, 10 beats) keep the no-field positions to 1e-12.
// E11 (4, 1) is not held as one: three loves at a dock and a love-fear pair s docks away carry no string for every
//    s = 1 .. 20, while four loves at a dock and a fear s away carry a string of s.
// Status pass if E1 .. E11 all hold. PREDICTED: fail, on E8 alone.
//
// FIRST RUN (2026-09-26, 37 s), recorded: FAIL on E7 and E8; E1 .. E6 and E9 .. E11 pass. E8 as predicted: every
// three-love band is flat to 1.1e-15 (the whole spectrum moves by at most 1.4e-15 between K = 0 and pi / 2, the
// pair's by 0.24 to 0.34 through its contact escape). E7 was a WRONG PREDICTION: the lightest level's role [2,1]
// share is 0.602, 0.574, 0.742, 0.758 at D = 1 to 4 (port store 0.965, 0.980, 0.983), with no three loves ever on one
// dock. No gate was moved. Argued after the run, not tested: Pauli's lock is intact (no flavor, triple weight 0), so
// the loss is not a flavor. The pinning makes every level a standing wave in a box whose walls are the ports, so the
// spatial part is no longer the travelling ground E-SPN-0071's argument assumed, and a spatially antisymmetric level
// with a symmetric role (spin three halves) can be as light. Also, E-SPN-0076's lightest-level reader grades levels
// against free-particle branches, and here the particle share is 0.51 to 0.59, barely above its 0.5 cut, so the
// reader itself is near the edge of its meaning on a pinned cluster.
// REPORTED, not gated: the lightest level's unwrapped energy, <l>, weight at the capacity, dock sharing, port use,
// particle share and next level; the largest change of the sorted three-love spectrum between K = 0 and K = pi / 2
// (the theorem says 0) beside the same reading for the pair (which can move at contact); and E-SPN-0077's port-store
// readings at the same D as a paired control.
// HUSK: one husk line, every number a husk number; the ports are the bulk columns under the ends' slots.
// THE FEAR'S STREAM SIGN: C (the user's choice, 2026-09-26).
//
// Depth L2: a constructed stand-in (locked tokens on one husk line). The electron's charge, spin and statistics are
// read on it, not derived for the knit's tokens.

import { experiment } from '@/test/scaffold/suite'
import { verdict } from '@/test/scaffold/verdict'
import {
  decodeRegisters,
  encodeRegisters,
  endDocks,
  endInvariants,
  gaussHolds,
  placedRegisters,
  runOf,
  streamIndex,
  streamIndexBack,
  streamRegisters,
  stringCount,
  type EndRegisters,
  type EndSpec,
} from '@/code/rule/end-store-line'
import {
  endBlochColumn,
  endBlochSpace,
  endContactEnergy,
  endSpan,
  endSpectrumAt,
  endSubspace,
  portUse,
} from '@/code/measure/end-store-bloch'
import { endRun, type EndRun } from '@/code/measure/end-run'
import {
  antisymmetrizedTokens,
  endExactCheck,
} from '@/code/measure/end-exact'
import {
  dockSharing,
  reelLightest,
  reelOverlap,
  reelQuartetShare,
  reelStringMoments,
  type Level,
  type ReelBlochSpec,
} from '@/code/measure/reel-string-bloch'
import {
  lightestUnwrapped,
  lineString,
  quartetShare,
  spectrumAt,
  stringMoments,
  type BlochSpec,
} from '@/code/measure/flux-store-bloch'
import { spanOf } from '@/code/measure/locked-run'
import { arcFlux } from '@/code/measure/reel-run'
import { cliffordTable } from '@/code/measure/clifford-words'
import { eisValue } from '@/code/measure/eisenstein-words'
import { phaseMove } from '@/code/rule/fear-weave'
import { gridMoves } from '@/code/rule/vibe-weave'
import { startFamily } from '@/code/measure/start-ensemble'
import { type M3 } from '@/code/measure/token-pair-run'
import { weyl, GOLDEN, SILVER } from '@/code/tool/weyl'
import { type Vibe } from '@/code/rule/locked-token-line'

const mod = (a: number, m: number): number => ((a % m) + m) % m
const ringDistance = (L: number, a: number, b: number): number =>
  Math.min(mod(a - b, L), mod(b - a, L))

const ruleSpec = (
  ring: number,
  kinds: Vibe[],
  depth: number,
  cost = false,
): EndSpec => {
  const N = 2 * depth + 1

  return {
    ring,
    kinds,
    convention: 'C',
    depth,
    cost: cost ? N : 0,
    root: cost ? 2 * N * N : 3,
  }
}

const threeSpec = (D: number, labels: 2 | 3 = 2): ReelBlochSpec => {
  const N = 2 * D + 1

  return {
    kinds: ['love', 'love', 'love'],
    convention: 'C',
    unlike: 'knit',
    depth: D,
    cost: N,
    root: 2 * N * N,
    labels,
  }
}

const pairSpec = (D: number): ReelBlochSpec => {
  const N = 2 * D + 1

  return {
    kinds: ['love', 'fear'],
    convention: 'C',
    unlike: 'knit',
    depth: D,
    cost: N,
    root: 2 * N * N,
    labels: 2,
  }
}

const gridOf = (s: ReelBlochSpec): number => 2 * endSpan(s) + 6

// ---- sectors and reach ----
function sector(s: EndSpec, T: number): EndRegisters[] {
  const n = s.kinds.length
  const L = s.ring
  const out: EndRegisters[] = []

  for (let p = 0; p < L ** n; p++) {
    const x = Array.from(
      { length: n },
      (_, t) => Math.floor(p / L ** (n - 1 - t)) % L,
    )

    if (spanOf(L, x) > 2 * s.depth + Math.max(T, 0) + 1) {
      continue
    }

    const f = arcFlux(L, s.kinds, x)
    const l = stringCount(f)

    for (let lab = 0; lab < 3 ** n; lab++) {
      const j = Array.from(
        { length: n },
        (_, t) => Math.floor(lab / 3 ** (n - 1 - t)) % 3,
      )

      for (let rL = -s.depth; rL <= s.depth; rL++) {
        const rR = T - l - rL

        if (rR < -s.depth || rR > s.depth) {
          continue
        }

        out.push({ x, j, f, rL, rR })
      }
    }
  }

  return out
}

function reach(s: EndSpec): {
  states: EndRegisters[]
  maxString: number
} {
  const n = s.kinds.length
  const x0 = Math.floor(s.ring / 2)
  const start = placedRegisters(
    s,
    new Array<number>(n).fill(x0),
    new Array<number>(n).fill(0),
  )
  const key = (g: EndRegisters): number =>
    encodeRegisters(s, { ...g, j: new Array<number>(n).fill(0) })
  const seen = new Map<number, EndRegisters>([[key(start), start]])
  const queue = [start]

  let maxString = 0

  while (queue.length > 0) {
    const g = queue.pop()!

    maxString = Math.max(maxString, stringCount(g.f))

    for (let c = 0; c < 2 ** n; c++) {
      const out = streamRegisters(s, {
        ...g,
        j: Array.from({ length: n }, (_, t) => (c >> t) & 1),
      })
      const k = key(out)

      if (!seen.has(k)) {
        const norm = { ...out, j: new Array<number>(n).fill(0) }

        seen.set(k, norm)
        queue.push(norm)
      }
    }
  }

  return { states: [...seen.values()], maxString }
}

// ---- E1 ----
type Locality = { witnesses: number; checked: number }

function locality(
  s: EndSpec,
  states: readonly EndRegisters[],
  labels: readonly number[],
): Locality {
  const n = s.kinds.length
  const Q = labels.length

  let witnesses = 0
  let checked = 0

  for (const g0 of states) {
    for (let c = 0; c < Q ** n; c++) {
      const j = Array.from(
        { length: n },
        (_, t) => labels[Math.floor(c / Q ** t) % Q]!,
      )
      const g = { ...g0, j }
      const base = streamRegisters(s, g)
      const [pl, pr] = endDocks(s, runOf(s, g))
      const same = (a: EndRegisters, t: number): boolean =>
        a.x[t] === base.x[t] && a.j[t] === base.j[t]

      for (let t = 0; t < n; t++) {
        // another token's label, far from t
        for (let u = 0; u < n; u++) {
          if (u === t || ringDistance(s.ring, g.x[t]!, g.x[u]!) < 2) {
            continue
          }

          for (const ju of labels) {
            if (ju === j[u]) {
              continue
            }

            const j2 = j.slice()

            j2[u] = ju
            checked++

            if (!same(streamRegisters(s, { ...g, j: j2 }), t)) {
              witnesses++
            }
          }
        }

        // a port far from t
        for (const [which, dock] of [
          ['left', pl],
          ['right', pr],
        ] as const) {
          if (ringDistance(s.ring, g.x[t]!, dock) < 2) {
            continue
          }

          for (let v = -s.depth; v <= s.depth; v++) {
            if (v === (which === 'left' ? g.rL : g.rR)) {
              continue
            }

            checked++

            if (
              !same(
                streamRegisters(
                  s,
                  which === 'left' ? { ...g, rL: v } : { ...g, rR: v },
                ),
                t,
              )
            ) {
              witnesses++
            }
          }
        }
      }

      // a port against a far token's label
      for (const [which, dock] of [
        ['left', pl],
        ['right', pr],
      ] as const) {
        for (let u = 0; u < n; u++) {
          if (ringDistance(s.ring, g.x[u]!, dock) < 2) {
            continue
          }

          for (const ju of labels) {
            if (ju === j[u]) {
              continue
            }

            const j2 = j.slice()

            j2[u] = ju
            checked++

            const other = streamRegisters(s, { ...g, j: j2 })

            if (
              (which === 'left' ? other.rL : other.rR) !==
              (which === 'left' ? base.rL : base.rR)
            ) {
              witnesses++
            }
          }
        }
      }
    }
  }

  return { witnesses, checked }
}

// ---- E2, E4 ----
type SectorCheck = {
  states: number
  permutation: boolean
  inverse: boolean
  gaussBroken: number
  countBroken: number
  invariantBroken: number
  invariantAtContactMove: number
}

function sectorCheck(s: EndSpec, T: number): SectorCheck {
  const states = sector(s, T)
  const keys = new Set(states.map(g => encodeRegisters(s, g)))
  const images = new Set<number>()

  let inverse = true
  let gaussBroken = 0
  let countBroken = 0
  let invariantBroken = 0
  let invariantAtContactMove = 0

  for (const g of states) {
    const i = encodeRegisters(s, g)
    const k = streamIndex(s, i)
    const o = decodeRegisters(s, k)

    images.add(k)

    if (streamIndexBack(s, k) !== i) {
      inverse = false
    }

    if (!gaussHolds(s, o)) {
      gaussBroken++
    }

    if (o.rL + o.rR + stringCount(o.f) !== T) {
      countBroken++
    }

    const a = endInvariants(s, g)
    const b = endInvariants(s, o)

    if (a[0] !== b[0] || a[1] !== b[1]) {
      const wholeMoved =
        stringCount(g.f) === 0 &&
        o.x.every(v => v === o.x[0]) &&
        o.x[0] !== g.x[0]

      if (wholeMoved) {
        invariantAtContactMove++
      } else {
        invariantBroken++
      }
    }
  }

  return {
    states: states.length,
    permutation:
      images.size === states.length &&
      [...images].every(k => keys.has(k)),
    inverse,
    gaussBroken,
    countBroken,
    invariantBroken,
    invariantAtContactMove,
  }
}

// three loves on one dock in the antisymmetric doublet sector
function tripleWeight(D: number): number {
  const b = endBlochSpace(threeSpec(D))
  const sub = endSubspace(b, 0)

  let w = 0

  for (const v of sub.vectors) {
    v.idx.forEach((i, k) => {
      const d = b.positions[Math.floor(i / b.labelCount)]!

      if (d[1] === 0 && d[2] === 0) {
        w += v.re[k]! ** 2 + v.im[k]! ** 2
      }
    })
  }

  return w
}

// ---- E6 ----
function lineLeak(
  D: number,
  K: number,
): { leak: number; columns: number } {
  const b = endBlochSpace(threeSpec(D, 3))

  let leak = 0
  let columns = 0

  const hasLine = (lab: number): boolean =>
    [Math.floor(lab / 9), Math.floor(lab / 3) % 3, lab % 3].includes(2)

  for (let col = 0; col < b.size; col++) {
    if (hasLine(col % b.labelCount)) {
      continue
    }

    columns++

    const img = endBlochColumn(b, K, col)

    let w = 0

    img.idx.forEach((i, m) => {
      if (hasLine(i % b.labelCount)) {
        w += img.re[m]! ** 2 + img.im[m]! ** 2
      }
    })
    leak = Math.max(leak, w)
  }

  return { leak, columns }
}

// ---- E7 ----
type LightRow = {
  D: number
  dim: number
  energy: number
  raw: number
  mean: number
  atCapacity: number
  spinHalf: number
  even: number
  gapNext: number
  portMean: number
  portEdge: number
  residual: number
  level: Level
  sharing: { apart: number; pair: number; triple: number }
}

function lightestThree(D: number): LightRow {
  const spec = threeSpec(D)
  const r = endSpectrumAt(spec, 0)
  const lp = reelLightest(
    r.bloch,
    r.all,
    gridOf(spec),
    endContactEnergy,
  )
  const S = endSpan(spec)

  let cap = 0
  let tot = 0

  for (let i = 0; i < r.bloch.size; i++) {
    const p = lp.level.vector.re[i]! ** 2 + lp.level.vector.im[i]! ** 2

    tot += p

    if (r.bloch.strings[Math.floor(i / r.bloch.labelCount)] === S) {
      cap += p
    }
  }

  const use = portUse(r.bloch, lp.level.vector)

  return {
    D,
    dim: r.dim,
    energy: lp.unwrapped,
    raw: lp.level.energy,
    mean: reelStringMoments(r.bloch, lp.level.vector).mean,
    atCapacity: cap / tot,
    spinHalf: 1 - reelQuartetShare(r.bloch, lp.level.vector),
    even: lp.reading.even,
    gapNext: lp.nextUnwrapped - lp.unwrapped,
    portMean: use.meanAbs,
    portEdge: use.atEdge,
    residual: r.residual,
    level: lp.level,
    sharing: dockSharing(r.bloch, lp.level.vector),
  }
}

// ---- E8 ----
function dispersion(
  D: number,
  start: Level,
): {
  bandwidth: number
  velocity: number
  minOverlap: number
  energies: number[]
} {
  const steps = 12
  const energies = [start.energy]

  let prev = start
  let minOverlap = 1
  let velocity = 0

  for (let s = 1; s <= steps; s++) {
    const K = (Math.PI * s) / steps
    const r = endSpectrumAt(threeSpec(D), K)

    let best = r.all[0]!
    let bestOverlap = -1

    for (const lv of r.all) {
      const o = reelOverlap(prev.vector, lv.vector)

      if (o > bestOverlap) {
        bestOverlap = o
        best = lv
      }
    }

    let e = best.energy

    while (e - energies[s - 1]! > Math.PI) {
      e -= 2 * Math.PI
    }

    while (e - energies[s - 1]! < -Math.PI) {
      e += 2 * Math.PI
    }

    velocity = Math.max(
      velocity,
      Math.abs(e - energies[s - 1]!) / (Math.PI / steps),
    )
    energies.push(e)
    minOverlap = Math.min(minOverlap, bestOverlap)
    prev = best
  }

  return {
    bandwidth: Math.max(...energies) - Math.min(...energies),
    velocity,
    minOverlap,
    energies,
  }
}

// REPORTED: the largest change of the sorted spectrum between K = 0 and K = pi / 2
function spectrumShift(spec: ReelBlochSpec): number {
  const a = endSpectrumAt(spec, 0)
    .all.map(l => l.energy)
    .sort((x, y) => x - y)
  const b = endSpectrumAt(spec, Math.PI / 2)
    .all.map(l => l.energy)
    .sort((x, y) => x - y)

  return Math.max(...a.map((e, i) => Math.abs(e - b[i]!)))
}

// ---- E9 ----
function ringAgreement(
  spec: ReelBlochSpec,
  ring: number,
  m: number,
): { gap: number; outside: number } {
  const b = endBlochSpace(spec)
  const K = (2 * Math.PI * m) / ring
  const n = spec.kinds.length
  const phi = {
    re: new Float64Array(b.size),
    im: new Float64Array(b.size),
  }

  for (let i = 0; i < b.size; i++) {
    phi.re[i] = weyl(i + 1, GOLDEN) - 0.5
    phi.im[i] = weyl(i + 1, SILVER) - 0.5
  }

  const run: EndRun = endRun({
    ring,
    kinds: spec.kinds,
    depth: spec.depth,
    cost: spec.cost,
    root: spec.root,
  })
  const R = 3 ** n

  const ringIndex = (x0: number, i: number): number => {
    const c = Math.floor(i / b.labelCount)
    const x = b.positions[c]!.map(v => mod(x0 + v, ring))
    const cc = run.indexOf(x, b.reels[c]!)

    if (cc < 0) {
      throw new Error(
        'ring agreement: a Bloch configuration is not on the ring',
      )
    }

    let code = i % b.labelCount

    const digits: number[] = []

    for (let t = n - 1; t >= 0; t--) {
      digits[t] = code % b.q
      code = Math.floor(code / b.q)
    }

    return cc * R + digits.reduce((a, v) => a * 3 + v, 0)
  }

  for (let x0 = 0; x0 < ring; x0++) {
    const cs = Math.cos(K * x0)
    const sn = Math.sin(K * x0)

    for (let i = 0; i < b.size; i++) {
      const at = ringIndex(x0, i)

      run.re[at] = run.re[at]! + phi.re[i]! * cs - phi.im[i]! * sn
      run.im[at] = run.im[at]! + phi.re[i]! * sn + phi.im[i]! * cs
    }
  }

  run.beat()

  const img = {
    re: new Float64Array(b.size),
    im: new Float64Array(b.size),
  }

  for (let col = 0; col < b.size; col++) {
    const c = endBlochColumn(b, K, col)

    c.idx.forEach((i, k) => {
      img.re[i] =
        img.re[i]! + c.re[k]! * phi.re[col]! - c.im[k]! * phi.im[col]!

      img.im[i] =
        img.im[i]! + c.re[k]! * phi.im[col]! + c.im[k]! * phi.re[col]!
    })
  }

  let gap = 0

  const covered = new Uint8Array(run.re.length)

  for (let x0 = 0; x0 < ring; x0++) {
    const cs = Math.cos(K * x0)
    const sn = Math.sin(K * x0)

    for (let i = 0; i < b.size; i++) {
      const at = ringIndex(x0, i)
      const wr = img.re[i]! * cs - img.im[i]! * sn
      const wi = img.re[i]! * sn + img.im[i]! * cs

      covered[at] = 1
      gap = Math.max(
        gap,
        Math.hypot(wr - run.re[at]!, wi - run.im[at]!),
      )
    }
  }

  let outside = 0

  for (let a = 0; a < run.re.length; a++) {
    if (!covered[a]) {
      outside += run.re[a]! ** 2 + run.im[a]! ** 2
    }
  }

  return { gap, outside }
}

// ---- E10 ----
function unitaryOf(k: number): M3 {
  const g = cliffordTable().group[k]!
  const vals = g.num.map(x => eisValue(x, 3 ** g.den3))

  let n2 = 0

  for (let c = 0; c < 3; c++) {
    n2 += (vals[3 * c]![0] ?? 0) ** 2 + (vals[3 * c]![1] ?? 0) ** 2
  }

  const f = 1 / Math.sqrt(n2)

  return {
    re: Float64Array.from(vals, v => v[0] * f),
    im: Float64Array.from(vals, v => v[1] * f),
  }
}

// the paired control: E-SPN-0077's port store at the same depth
function portLightest(D: number): {
  spinHalf: number
  mean: number
  energy: number
} {
  const N = 2 * D + 1
  const spec: BlochSpec = {
    kinds: ['love', 'love', 'love'],
    convention: 'C',
    unlike: 'knit',
    depth: D,
    cost: N,
    root: 2 * N * N,
    labels: 2,
  }
  const r = spectrumAt(spec, 0)
  const lp = lightestUnwrapped(r.bloch, r.all, 4 * D + 6)

  return {
    spinHalf: 1 - quartetShare(r.bloch, lp.level.vector),
    mean: stringMoments(r.bloch, lp.level.vector).mean,
    energy: lp.unwrapped,
  }
}

export default experiment({
  id: 'spin/string-count-on-the-hop',
  code: 'E-SPN-0085',
  title:
    "the string's count carried by the light's copy on a husk line (the recorded hop at the string's two end ports), a STAND-IN on locked tokens on a husk line, fail on E7 and E8: the rule is husk-local, reversible, integer, Gauss exact, reaches exactly 2D and keeps Pauli's lock with no flavor, but its two end invariants pin three loves exactly (every band flat to 1e-15, the cluster cannot travel) and the lightest level is not the natural spin one half (0.57 to 0.76)",
  category: 'spin',
  substrates: ['3434'],
  depth: 'L2',
  paper: false,
  run() {
    const started = Date.now()
    const log = (what: string): void =>
      console.error(
        `${what} ${Math.round((Date.now() - started) / 1000)}s`,
      )
    const kindsOf = (name: 'pair' | 'three'): Vibe[] =>
      name === 'pair' ? ['love', 'fear'] : ['love', 'love', 'love']

    // ---- E5 and the reach sets ----
    const reaches = (['pair', 'three'] as const).flatMap(name =>
      [1, 2, 3, 4].map(D => {
        const s = ruleSpec(4 * D + 7, kindsOf(name), D)
        const r = reach(s)

        return { name, D, s, states: r.states, maxString: r.maxString }
      }),
    )
    const e5 = reaches.every(r => r.maxString === 2 * r.D)

    log('e5')

    // ---- E1 ----
    const localRows = reaches
      .filter(r => r.D <= 3)
      .map(r => ({
        name: `${r.name} D ${r.D}`,
        ...locality(r.s, r.states, [0, 1]),
      }))
    const sectorLocal = (['pair', 'three'] as const).map(name => {
      const s = ruleSpec(9, kindsOf(name), 1)
      const states = sector(s, 0).filter(g => g.j.every(v => v === 0))

      return {
        name: `${name} ring 9 D 1 sector`,
        ...locality(s, states, [0, 1, 2]),
      }
    })
    const e1 = [...localRows, ...sectorLocal].every(
      r => r.witnesses === 0 && r.checked > 0,
    )

    log('e1')

    // ---- E2, E4 ----
    const sectors = [
      {
        name: 'pair ring 9 D 1 T 0',
        ...sectorCheck(ruleSpec(9, ['love', 'fear'], 1), 0),
      },
      {
        name: 'pair ring 9 D 1 T 1',
        ...sectorCheck(ruleSpec(9, ['love', 'fear'], 1), 1),
      },
      {
        name: 'three ring 9 D 1 T 0',
        ...sectorCheck(ruleSpec(9, ['love', 'love', 'love'], 1), 0),
      },
      {
        name: 'three ring 9 D 1 T -1',
        ...sectorCheck(ruleSpec(9, ['love', 'love', 'love'], 1), -1),
      },
      {
        name: 'pair ring 13 D 2 T 0',
        ...sectorCheck(ruleSpec(13, ['love', 'fear'], 2), 0),
      },
      {
        name: 'three ring 13 D 2 T 0',
        ...sectorCheck(ruleSpec(13, ['love', 'love', 'love'], 2), 0),
      },
    ]
    const e2 = sectors.every(
      r =>
        r.permutation &&
        r.inverse &&
        r.gaussBroken === 0 &&
        r.countBroken === 0,
    )
    const triples = [1, 2, 3].map(D => ({ D, weight: tripleWeight(D) }))
    const e4 =
      sectors.every(r => r.invariantBroken === 0) &&
      triples.every(t => t.weight === 0)

    log('e2 e4')

    // ---- E3 ----
    const exactPair = endExactCheck(
      ruleSpec(11, ['love', 'fear'], 2, true),
      [{ x: [5, 5], j: [0, 1], amp: 1 }],
      [0, 0],
      12,
    )
    const exactThree = endExactCheck(
      ruleSpec(7, ['love', 'love', 'love'], 1, true),
      antisymmetrizedTokens({ x: [3, 3, 4], j: [0, 1, 0] }),
      [0, -1],
      6,
    )
    const exactOk = (e: typeof exactPair): boolean =>
      e.gap < 1e-12 &&
      e.norm &&
      e.reverses &&
      e.registersOk &&
      e.merged === 0
    const e3 = exactOk(exactPair) && exactOk(exactThree)

    log('e3')

    // ---- E6 ----
    const leaks = [1, 2].flatMap(D =>
      [0, 0.7].map(K => ({ D, K, ...lineLeak(D, K) })),
    )
    const e6 = leaks.every(l => l.leak < 1e-14 && l.columns > 0)

    log('e6')

    // ---- E7 ----
    const rows = [1, 2, 3, 4].map(D => {
      const row = lightestThree(D)

      log(`e7 D ${D}`)

      return row
    })
    const e7 = rows.every(r => r.spinHalf >= 0.95)

    // ---- E8 ----
    const bands = [2, 3].map(D => {
      const band = {
        D,
        ...dispersion(D, rows.find(r => r.D === D)!.level),
      }

      log(`e8 D ${D}`)

      return band
    })
    const e8 = bands.every(
      b =>
        b.bandwidth >= 0.01 &&
        b.velocity >= 0.02 &&
        b.minOverlap >= 0.5,
    )
    const shifts = {
      three: [1, 2, 3].map(D => spectrumShift(threeSpec(D))),
      pair: [1, 2, 3].map(D => spectrumShift(pairSpec(D))),
    }

    log('shifts')

    // ---- E9 ----
    const agreeThree = ringAgreement(threeSpec(2), 16, 3)
    const agreePair = ringAgreement(pairSpec(3), 16, 3)
    const e9 =
      agreeThree.gap < 1e-12 &&
      agreePair.gap < 1e-12 &&
      agreeThree.outside < 1e-24 &&
      agreePair.outside < 1e-24

    log('e9')

    // ---- E10 ----
    const moves = gridMoves()
    const table = cliffordTable()
    const unitaries = Array.from({ length: 216 }, (_, k) =>
      unitaryOf(k),
    )
    const cases: {
      L: number
      kinds: Vibe[]
      D: number
      beats: number
      ports: [number, number]
      start: {
        x: readonly number[]
        j: readonly number[]
        amp: number
      }[]
    }[] = [
      {
        L: 12,
        kinds: ['love', 'love', 'love'],
        D: 2,
        beats: 5,
        ports: [0, -1],
        start: antisymmetrizedTokens({ x: [5, 5, 6], j: [0, 1, 0] }),
      },
      {
        L: 24,
        kinds: ['love', 'fear'],
        D: 2,
        beats: 10,
        ports: [0, 0],
        start: [{ x: [12, 12], j: [0, 1], amp: 1 }],
      },
    ]
    const ensemble = startFamily(16).map(member => {
      const linksOf = (L: number): M3[] =>
        Array.from(
          { length: L },
          (_, x) =>
            unitaries[
              table.indexOf(
                phaseMove(
                  moves.act[member.start(x, moves.act.length)] ?? [],
                ),
              )
            ]!,
        )

      let gap = 0

      for (const c of cases) {
        const N = 2 * c.D + 1

        const make = (links?: M3[]): EndRun => {
          const run = endRun({
            ring: c.L,
            kinds: c.kinds,
            depth: c.D,
            cost: N,
            root: 2 * N * N,
            links,
          })

          run.place(
            c.start.map(e => ({
              x: e.x,
              ports: c.ports,
              j: e.j,
              amp: [e.amp, 0] as [number, number],
            })),
          )

          return run
        }

        const field = make(linksOf(c.L))
        const plain = make()

        for (let t = 0; t < c.beats; t++) {
          field.beat()
          plain.beat()

          const a = field.positions()
          const b = plain.positions()

          for (let i = 0; i < a.length; i++) {
            gap = Math.max(gap, Math.abs(a[i]! - b[i]!))
          }
        }
      }

      return { member: member.name, gap }
    })
    const e10 =
      ensemble.length === 17 && ensemble.every(e => e.gap < 1e-12)

    log('e10')

    // ---- E11 ----
    let e11 = true

    const split: number[] = []

    for (let s = 1; s <= 20; s++) {
      const apart = lineString(
        [0, 0, 0, s, s],
        ['love', 'love', 'love', 'love', 'fear'],
      )
      const held = lineString(
        [0, 0, 0, 0, s],
        ['love', 'love', 'love', 'love', 'fear'],
      )

      split.push(apart)

      if (apart !== 0 || held !== s) {
        e11 = false
      }
    }

    // ---- the paired control ----
    const port = [1, 2, 3].map(D => ({ D, ...portLightest(D) }))

    log('control')

    const ok =
      e1 && e2 && e3 && e4 && e5 && e6 && e7 && e8 && e9 && e10 && e11

    return verdict({
      status: ok ? 'pass' : 'fail',
      claim: `with the string's count carried by the recorded hop at its two end ports (the only copy a husk line's light has, E-SPN-0084), the rule reads nothing past one link (${[...localRows, ...sectorLocal].reduce((a, r) => a + r.witnesses, 0)} of ${[...localRows, ...sectorLocal].reduce((a, r) => a + r.checked, 0).toLocaleString('en-US')} far changes matter), permutes every sector tried (${sectors.map(r => r.states.toLocaleString('en-US')).join(', ')} states, flip . stream . flip its inverse, Gauss and rL + rR + l kept), runs exactly with the cost (${exactPair.gap.toExponential(1)}, ${exactThree.gap.toExponential(1)}), and reaches exactly l = 2D (${reaches.map(r => r.maxString).join(', ')}); no token carries a flavor, so Pauli keeps its lock (no three loves on a dock) and the line sector stays closed (worst ${Math.max(...leaks.map(l => l.leak)).toExponential(1)}, N = 3, 2 pi sign -1), yet the lightest three-love level has role [2,1] share only ${rows.map(r => r.spinHalf.toFixed(3)).join(', ')} at D = 1 to 4 (port store ${port.map(p => p.spinHalf.toFixed(3)).join(', ')}), not the natural spin one half; and the ends are pinned: x_left - rL and x_right + rR change only when a whole center-singlet cluster moves off one dock (${sectors.reduce((a, r) => a + r.invariantBroken, 0)} other changes), which three loves never do (weight ${triples.map(t => t.weight.toExponential(0)).join(', ')}), so the band is ${bands.map(b => b.bandwidth.toExponential(1)).join(', ')} wide at D = 2, 3 (group velocity ${bands.map(b => b.velocity.toExponential(1)).join(', ')}) and the whole three-love spectrum moves by at most ${Math.max(...shifts.three).toExponential(1)} between K = 0 and pi / 2 (the pair's, which can move at contact, by ${shifts.pair.map(x => x.toFixed(3)).join(', ')}): the charge-one cluster cannot travel; the Bloch operator is the ring rule (${agreeThree.gap.toExponential(1)}, ${agreePair.gap.toExponential(1)}) and the 17 link starts keep the no-field positions (worst ${Math.max(...ensemble.map(e => e.gap)).toExponential(1)})`,
      metrics: {
        gate_E1: e1 ? 1 : 0,
        gate_E2: e2 ? 1 : 0,
        gate_E3: e3 ? 1 : 0,
        gate_E4: e4 ? 1 : 0,
        gate_E5: e5 ? 1 : 0,
        gate_E6: e6 ? 1 : 0,
        gate_E7: e7 ? 1 : 0,
        gate_E8: e8 ? 1 : 0,
        gate_E9: e9 ? 1 : 0,
        gate_E10: e10 ? 1 : 0,
        gate_E11: e11 ? 1 : 0,
        localityWitnesses: [...localRows, ...sectorLocal].reduce(
          (a, r) => a + r.witnesses,
          0,
        ),
        localityChecked: [...localRows, ...sectorLocal].reduce(
          (a, r) => a + r.checked,
          0,
        ),
        ...Object.fromEntries(
          reaches.map(r => [
            `reach_${r.name}_D${r.D}_maxString`,
            r.maxString,
          ]),
        ),
        ...Object.fromEntries(
          sectors.flatMap(r => [
            [`sector_${r.name.replace(/ /g, '_')}_states`, r.states],
            [
              `sector_${r.name.replace(/ /g, '_')}_invariantBroken`,
              r.invariantBroken,
            ],
            [
              `sector_${r.name.replace(/ /g, '_')}_contactMoves`,
              r.invariantAtContactMove,
            ],
          ]),
        ),
        exactPairGap: exactPair.gap,
        exactThreeGap: exactThree.gap,
        lineLeakWorst: Math.max(...leaks.map(l => l.leak)),
        ...Object.fromEntries(
          rows.flatMap(r => [
            [`three_D${r.D}_spinHalfShare`, r.spinHalf],
            [`three_D${r.D}_energy`, r.energy],
            [`three_D${r.D}_rawEnergy`, r.raw],
            [`three_D${r.D}_meanString`, r.mean],
            [`three_D${r.D}_atCapacity`, r.atCapacity],
            [`three_D${r.D}_evenShare`, r.even],
            [`three_D${r.D}_gapNext`, r.gapNext],
            [`three_D${r.D}_portMeanAbs`, r.portMean],
            [`three_D${r.D}_portAtEdge`, r.portEdge],
            [`three_D${r.D}_dim`, r.dim],
            [`three_D${r.D}_eigenResidual`, r.residual],
            [`three_D${r.D}_sharedPair`, r.sharing.pair],
            [`three_D${r.D}_sharedTriple`, r.sharing.triple],
          ]),
        ),
        ...Object.fromEntries(
          bands.flatMap(b => [
            [`band_D${b.D}_width`, b.bandwidth],
            [`band_D${b.D}_velocity`, b.velocity],
            [`band_D${b.D}_minOverlap`, b.minOverlap],
          ]),
        ),
        ringGapThree: agreeThree.gap,
        ringGapPair: agreePair.gap,
        ensembleWorstGap: Math.max(...ensemble.map(e => e.gap)),
        ensembleMembers: ensemble.length,
        fourOneSplitString: Math.max(...split),
        seconds: (Date.now() - started) / 1000,
      },
      control: {
        ...Object.fromEntries(
          shifts.three.map((x, i) => [
            `spectrumShift_three_D${i + 1}`,
            x,
          ]),
        ),
        ...Object.fromEntries(
          shifts.pair.map((x, i) => [
            `spectrumShift_pair_D${i + 1}`,
            x,
          ]),
        ),
        ...Object.fromEntries(
          port.flatMap(p => [
            [`port_D${p.D}_spinHalfShare`, p.spinHalf],
            [`port_D${p.D}_meanString`, p.mean],
            [`port_D${p.D}_energy`, p.energy],
          ]),
        ),
      },
      notes: `L2, a STAND-IN (locked tokens on one husk line). Gates E1 ${e1}, E2 ${e2}, E3 ${e3}, E4 ${e4}, E5 ${e5}, E6 ${e6}, E7 ${e7}, E8 ${e8}, E9 ${e9}, E10 ${e10}, E11 ${e11}. Locality: ${[...localRows, ...sectorLocal].map(r => `${r.name} ${r.witnesses} of ${r.checked}`).join('; ')}. Sectors: ${sectors.map(r => `${r.name}: ${r.states} states, permutation ${r.permutation}, inverse ${r.inverse}, Gauss broken ${r.gaussBroken}, count broken ${r.countBroken}, end invariants broken ${r.invariantBroken} (plus ${r.invariantAtContactMove} whole-cluster moves at contact)`).join('; ')}. Three loves on one dock in the doublet sector: ${triples.map(t => `D ${t.D} ${t.weight}`).join(', ')}. Exact: pair ${JSON.stringify(exactPair)}, three loves ${JSON.stringify(exactThree)}. Line leak: ${leaks.map(l => `(${l.D}, ${l.K}) ${l.leak.toExponential(1)} over ${l.columns}`).join(', ')}. Lightest three-love level: ${rows.map(r => `D ${r.D} (dim ${r.dim}): E ${r.energy.toFixed(5)} (raw ${r.raw.toFixed(5)}), spin one half ${r.spinHalf.toFixed(4)}, <l> ${r.mean.toFixed(3)} of 2D = ${2 * r.D} (at capacity ${r.atCapacity.toFixed(3)}), particle ${r.even.toFixed(3)}, next +${r.gapNext.toFixed(4)}, mean |port| ${r.portMean.toFixed(3)}, a port at its edge ${r.portEdge.toFixed(3)}, a like pair on a dock ${r.sharing.pair.toFixed(3)}, three on a dock ${r.sharing.triple.toFixed(3)}, residual ${r.residual.toExponential(1)}`).join('; ')}. Bands (K = 0 to pi, 12 steps): ${bands.map(b => `D ${b.D}: ${b.energies.map(e => e.toFixed(6)).join(' ')} (min overlap ${b.minOverlap.toFixed(3)})`).join('; ')}. Spectrum shift K = 0 to pi / 2: three loves ${shifts.three.map(x => x.toExponential(1)).join(', ')}, pair ${shifts.pair.map(x => x.toExponential(2)).join(', ')}. Port-store control (E-SPN-0077's rule): ${port.map(p => `D ${p.D} spin one half ${p.spinHalf.toFixed(4)}, <l> ${p.mean.toFixed(3)}, E ${p.energy.toFixed(4)}`).join('; ')}. Ring agreement: three loves ${agreeThree.gap.toExponential(1)} (outside ${agreeThree.outside.toExponential(1)}), pair ${agreePair.gap.toExponential(1)} (outside ${agreePair.outside.toExponential(1)}). Start members: ${ensemble.map(e => `${e.member} ${e.gap.toExponential(1)}`).join(', ')}.`,
    })
  },
})
