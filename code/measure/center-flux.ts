// COHERENT CENTRE FLUX (moving-matter item 0058, candidate e of decision 012). Colour as a Z3 centre field: every directed
// link carries omega^n times 1 (omega = e^(2 pi i / 3)), its reverse the conjugate, with no coupling to choose: the
// patterns are the most frustrated periodic ones.
//
// The smallest translation cell is the dock itself. A field periodic under every translation is one phase per root,
// n(x, d) = c_d, odd (c_-d = -c_d) so the reverse is the conjugate, and a triangle (roots a, b with a + b = c a root) sees
// the flux F(a, b) = c_a + c_b - c_c mod 3, the same at every dock. c linear on D4 (c_d = k . r_d) is flat, so a
// non-flat triangle needs a non-linear c, which exists already on the one-dock cell: the cell admits a non-flat triangle.
// On the infinite mesh two c differing by a linear function are one gauge class (g(x) = k . x mod 3), so the classes are
// the 3^12 odd functions modulo the 81 additive ones, and a class is its flux vector over the 192 oriented triangles at a
// dock. Classes are taken modulo the 192 rotations of the D4 box (signed permutations of determinant +1, the only point
// maps that keep a side-L D4 box: traps.md, E-SLF-0180).
//
// On a finite box a linear shift is a gauge transform only when it is periodic there (k . P = 0 mod 3 for every period P),
// so on side 8 the 81 members of a class are flat twists of one another and are NOT gauge equivalent. The box field takes
// the class member with no knob (boxRepresentative): the one whose link pattern is kept by the largest group of the
// pattern's own rotations, then the fewest non-identity links, then the least index.
//
// DETERMINISM: no random numbers; the enumeration is exhaustive and ordered.

import { DOCK_ROOTS } from '@/code/measure/dock-mixer'
import { OPPOSITE } from '@/code/rule/isometric-knit'
import { sigmaTable, TRIANGLES, type ColorField } from '@/code/measure/color-gates'
import { colorPieces } from '@/code/measure/color-slab'
import { chiralSlab } from '@/code/measure/anomaly-matching-walls'
import { complexEigenvalues } from '@/code/algebra/linear/complex-eigen'

const SLOTS = 24
const mod3 = (v: number): number => ((v % 3) + 3) % 3

// one slot of each opposite pair, in slot order: c is set on these, the rest by oddness
export const POSITIVE_SLOTS: readonly number[] = Array.from({ length: SLOTS }, (_, d) => d).filter(d => d < OPPOSITE[d]!)

// a centre pattern: c[d] in {0, 1, 2} for every slot d, c[OPPOSITE[d]] = -c[d] mod 3
export type CenterPattern = { name: string; c: Int8Array }

export function patternOf(name: string, positive: readonly number[]): CenterPattern {
  const c = new Int8Array(SLOTS)

  POSITIVE_SLOTS.forEach((d, i) => {
    c[d] = mod3(positive[i]!)
    c[OPPOSITE[d]!] = mod3(-positive[i]!)
  })

  return { name, c }
}

// the flux of every oriented triangle at a dock, in TRIANGLES order (0, 1 or 2 in units of 2 pi / 3)
export function triangleFlux(c: Int8Array): Int8Array {
  return Int8Array.from(TRIANGLES, ([a, b, s]) => mod3(c[a]! + c[b]! - c[s]!))
}

// ---- the D4 basis and the additive functions ----

// D4 basis b0 = e0 - e1, b1 = e1 - e2, b2 = e2 - e3, b3 = e2 + e3: integer coordinates of a D4 point
export function basisCoords(p: readonly number[]): number[] {
  const c0 = p[0]!
  const c1 = p[1]! + c0
  const c3 = (p[2]! + c1 + p[3]!) / 2
  const c2 = (p[2]! + c1 - p[3]!) / 2

  return [c0, c1, c2, c3]
}

const ROOT_COORDS = DOCK_ROOTS.map(basisCoords)

// the 81 additive Z3 functions on D4, as values on every slot
export const ADDITIVE: readonly Int8Array[] = Array.from({ length: 81 }, (_, i) => {
  const v = [Math.floor(i / 27), Math.floor(i / 9) % 3, Math.floor(i / 3) % 3, i % 3]

  return Int8Array.from(ROOT_COORDS, m => mod3(m.reduce((s, mi, j) => s + mi * v[j]!, 0)))
})

// ---- the box rotations ----

export type Rotation = { perm: number[]; sign: number[]; slot: Int32Array }

export const ROTATIONS: readonly Rotation[] = (() => {
  const perms: number[][] = []
  const permute = (rest: number[], acc: number[]): void => {
    if (rest.length === 0) {
      perms.push(acc)
    }

    rest.forEach((v, i) => permute([...rest.slice(0, i), ...rest.slice(i + 1)], [...acc, v]))
  }

  permute([0, 1, 2, 3], [])

  const parity = (p: number[]): number => {
    let s = 1

    for (let i = 0; i < 4; i++) {
      for (let j = i + 1; j < 4; j++) {
        if (p[i]! > p[j]!) {
          s = -s
        }
      }
    }

    return s
  }
  const out: Rotation[] = []

  for (const perm of perms) {
    for (let m = 0; m < 16; m++) {
      const sign = [0, 1, 2, 3].map((i): number => ((m >> i) & 1 ? -1 : 1))

      if (parity(perm) * sign.reduce((a, b) => a * b, 1) !== 1) {
        continue
      }

      // (g r)_i = sign_i r_perm(i)
      const slot = Int32Array.from(DOCK_ROOTS, r => {
        const g = [0, 1, 2, 3].map(i => sign[i]! * r[perm[i]!]!)
        const d = DOCK_ROOTS.findIndex(q => q.every((v, i) => v === g[i]))

        if (d < 0) {
          throw new Error('ROTATIONS: a root left the root set')
        }

        return d
      })

      out.push({ perm, sign, slot })
    }
  }

  return out
})()

// the pattern moved by a rotation: (g c)(g r) = c(r)
export function rotatePattern(c: Int8Array, g: Rotation): Int8Array {
  const out = new Int8Array(SLOTS)

  for (let d = 0; d < SLOTS; d++) {
    out[g.slot[d]!] = c[d]!
  }

  return out
}

const keyOf = (v: Int8Array): string => v.join('')

// ---- STEP 1: the enumeration ----

export type PatternClass = {
  // the class's box representative
  pattern: CenterPattern
  // non-flat oriented triangles at a dock (of 192) and the fraction
  nonflat: number
  fraction: number
  // the flux histogram over the 192 oriented triangles [flat, +2 pi / 3, -2 pi / 3]
  fluxHistogram: [number, number, number]
  // translation invariant by construction; whether every non-flat triangle carries 2 pi / 3 one way round (always, in Z3)
  uniform: boolean
  // gauge classes (flux vectors) in the rotation orbit, and the rotations keeping the flux vector
  orbit: number
  stabilizer: number
  // the representative's own symmetry (rotations keeping its link pattern) and its non-identity links a dock
  linkStabilizer: number
  linksOn: number
}

export type CenterEnumeration = {
  oddFunctions: number
  gaugeClasses: number
  rotationClasses: number
  // the non-flat count of every rotation class, descending, with the classes at each count
  spectrum: { nonflat: number; classes: number }[]
  maxNonflat: number
  kept: PatternClass[]
  seconds: number
}

function stabilizerOf(c: Int8Array, ofFlux: boolean): number {
  const key = ofFlux ? keyOf(triangleFlux(c)) : keyOf(c)

  return ROTATIONS.filter(g => {
    const r = rotatePattern(c, g)

    return (ofFlux ? keyOf(triangleFlux(r)) : keyOf(r)) === key
  }).length
}

// the class member the box uses: the largest own link symmetry, then the fewest non-identity links, then the least index
export function boxRepresentative(c: Int8Array): Int8Array {
  let best: { c: Int8Array; sym: number; on: number; key: string } | undefined

  for (const f of ADDITIVE) {
    const m = Int8Array.from(c, (v, d) => mod3(v + f[d]!))
    const sym = stabilizerOf(m, false)
    const on = m.reduce((s, v) => s + (v !== 0 ? 1 : 0), 0)
    const key = keyOf(m)

    if (!best || sym > best.sym || (sym === best.sym && (on < best.on || (on === best.on && key < best.key)))) {
      best = { c: m, sym, on, key }
    }
  }

  return best!.c
}

export function enumerateCenterPatterns(maxKept = 6): CenterEnumeration {
  const started = Date.now()
  const total = 3 ** POSITIVE_SLOTS.length
  const gauge = new Map<string, { c: Int8Array; nonflat: number }>()

  for (let i = 0; i < total; i++) {
    const positive = POSITIVE_SLOTS.map((_, j) => Math.floor(i / 3 ** j) % 3)
    const { c } = patternOf('', positive)
    const flux = triangleFlux(c)
    const key = keyOf(flux)

    if (!gauge.has(key)) {
      gauge.set(key, { c, nonflat: flux.reduce((s, v) => s + (v !== 0 ? 1 : 0), 0) })
    }
  }

  // rotation classes
  const seen = new Set<string>()
  const classes: { c: Int8Array; nonflat: number; orbit: number }[] = []

  for (const [key, g] of gauge) {
    if (seen.has(key)) {
      continue
    }

    const orbit = new Set(ROTATIONS.map(r => keyOf(triangleFlux(rotatePattern(g.c, r)))))

    orbit.forEach(k => seen.add(k))
    classes.push({ c: g.c, nonflat: g.nonflat, orbit: orbit.size })
  }

  const counts = new Map<number, number>()

  for (const k of classes) {
    counts.set(k.nonflat, (counts.get(k.nonflat) ?? 0) + 1)
  }

  const spectrum = [...counts].map(([nonflat, n]) => ({ nonflat, classes: n })).sort((a, b) => b.nonflat - a.nonflat)
  const maxNonflat = spectrum[0]!.nonflat
  const top = classes.filter(k => k.nonflat === maxNonflat)

  if (top.length > maxKept) {
    throw new Error(`enumerateCenterPatterns: ${top.length} maximal classes, more than ${maxKept}: escalate`)
  }

  const kept = top.map((k, i): PatternClass => {
    const rep = boxRepresentative(k.c)
    const flux = triangleFlux(rep)
    const hist: [number, number, number] = [0, 0, 0]

    flux.forEach(v => hist[v]!++)

    return {
      pattern: { name: `cf${i}`, c: rep },
      nonflat: k.nonflat,
      fraction: k.nonflat / TRIANGLES.length,
      fluxHistogram: hist,
      uniform: hist[1] === hist[2],
      orbit: k.orbit,
      stabilizer: stabilizerOf(rep, true),
      linkStabilizer: stabilizerOf(rep, false),
      linksOn: rep.reduce((s, v) => s + (v !== 0 ? 1 : 0), 0),
    }
  })

  return {
    oddFunctions: total,
    gaugeClasses: gauge.size,
    rotationClasses: classes.length,
    spectrum,
    maxNonflat,
    kept,
    seconds: (Date.now() - started) / 1000,
  }
}

// ---- the diagnostic: the member's bulk bands by Bloch blocks over the cell ----

// The cell is one dock and the field is uniform, so the triplet is three copies of one U(1) walk whose slot d carries
// omega^(c_d): the full-space Bloch cycle T(k) P1 T(k) P0 (96 square, half 0 as colorGates' slab reads it), T(k)
// diagonal with e^(i (2 pi c_d / 3 - theta . m_d)) on slot d's four modes, m_d the root's basis coordinates. On nk = 8
// it is exactly the side-8 bulk box's spectrum (the box momenta are theta = 2 pi j / 8), which checks bulkWallRead.

export type CenterBands = {
  set: 'plain' | 'wilson'
  nk: number
  // the least distance of any quasienergy from pi
  gapPi: number
  // states per k at quasienergy 0 (the walk's flat modes; 80 on identity links)
  atZero: number
  // the widths of the 96 sorted bands over the grid, and how many are flat (width < 1e-9) away from 0
  widths: number[]
  flatAway: number
  // the widest band and the least width of a band not at 0
  widest: number
  narrowestAway: number
  seconds: number
}

export function centerBands(c: Int8Array, set: 0 | 1, nk: number): CenterBands {
  const started = Date.now()
  const cs = chiralSlab(8)
  const pieces = colorPieces(cs.sets[0]!, cs.ranges[0]!.sR, cs.ranges[0]!.dR)
  const P0 = pieces.P[set]![0]!
  const P1 = pieces.P[set]![1]!
  const n = P0.re.length ** 0.5
  const hreg = n / SLOTS
  const lo = Array<number>(n).fill(Infinity)
  const hi = Array<number>(n).fill(-Infinity)

  let gapPi = Infinity
  let atZero = Infinity

  for (let i = 0; i < nk ** 4; i++) {
    const theta = [Math.floor(i / nk ** 3), Math.floor(i / nk ** 2) % nk, Math.floor(i / nk) % nk, i % nk].map(
      v => (2 * Math.PI * v) / nk,
    )
    const t = ROOT_COORDS.map((m, d) => (2 * Math.PI * c[d]!) / 3 - m.reduce((s, v, k) => s + v * theta[k]!, 0))
    // U = T P1 T P0, T diagonal
    const tp = (A: { re: ArrayLike<number>; im: ArrayLike<number> }): { re: Float64Array; im: Float64Array } => {
      const re = new Float64Array(n * n)
      const im = new Float64Array(n * n)

      for (let r = 0; r < n; r++) {
        const a = t[Math.floor(r / hreg)]!
        const cr = Math.cos(a)
        const ci = Math.sin(a)

        for (let q = 0; q < n; q++) {
          re[r * n + q] = cr * A.re[r * n + q]! - ci * A.im[r * n + q]!
          im[r * n + q] = cr * A.im[r * n + q]! + ci * A.re[r * n + q]!
        }
      }

      return { re, im }
    }
    const left = tp(P1)
    const right = tp(P0)
    const re = new Float64Array(n * n)
    const im = new Float64Array(n * n)

    for (let r = 0; r < n; r++) {
      for (let l = 0; l < n; l++) {
        const ar = left.re[r * n + l]!
        const ai = left.im[r * n + l]!

        if (ar === 0 && ai === 0) {
          continue
        }

        for (let q = 0; q < n; q++) {
          re[r * n + q]! += ar * right.re[l * n + q]! - ai * right.im[l * n + q]!
          im[r * n + q]! += ar * right.im[l * n + q]! + ai * right.re[l * n + q]!
        }
      }
    }

    const e = complexEigenvalues({ re, im, n })
    const eps = e.re.map((x, j) => Math.atan2(e.im[j]!, x)).sort((a, b) => a - b)

    eps.forEach((v, j) => {
      lo[j] = Math.min(lo[j]!, v)
      hi[j] = Math.max(hi[j]!, v)
      gapPi = Math.min(gapPi, Math.PI - Math.abs(v))
    })
    atZero = Math.min(atZero, eps.filter(v => Math.abs(v) < 1e-9).length)
  }

  const widths = lo.map((v, j) => hi[j]! - v)
  const away = widths.filter((_, j) => Math.max(Math.abs(lo[j]!), Math.abs(hi[j]!)) > 1e-9)

  return {
    set: set === 0 ? 'plain' : 'wilson',
    nk,
    gapPi,
    atZero,
    widths,
    flatAway: away.filter(w => w < 1e-9).length,
    widest: Math.max(...widths),
    narrowestAway: away.length > 0 ? Math.min(...away) : NaN,
    seconds: (Date.now() - started) / 1000,
  }
}

// ---- the field ----

// the element omega^n times 1 of Sigma(648) for n = 0, 1, 2 (index into gridLifts())
export function centerElements(): [number, number, number] {
  const t = sigmaTable()
  const w = (n: number): number => {
    const re = Math.cos((2 * Math.PI * n) / 3)
    const im = Math.sin((2 * Math.PI * n) / 3)
    const e = t.lifts.floats.findIndex(m =>
      [0, 1, 2].every(i =>
        [0, 1, 2].every(j => {
          const r = m[2 * (3 * i + j)]!
          const s = m[2 * (3 * i + j) + 1]!

          return i === j ? Math.abs(r - re) < 1e-12 && Math.abs(s - im) < 1e-12 : Math.abs(r) < 1e-12 && Math.abs(s) < 1e-12
        }),
      ),
    )

    if (e < 0) {
      throw new Error(`centerElements: omega^${n} is not in the group`)
    }

    return e
  }

  return [w(0), w(1), w(2)]
}

// the uniform centre field of a pattern on any box: link x * 24 + d carries omega^(c_d)
export function centerField(p: CenterPattern): ColorField {
  return {
    name: p.name,
    on: box => {
      const z = centerElements()
      const out = new Int32Array(box.cells * SLOTS)

      for (let l = 0; l < out.length; l++) {
        out[l] = z[p.c[l % SLOTS]!]!
      }

      return out
    },
  }
}
