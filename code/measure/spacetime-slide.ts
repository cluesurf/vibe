// The dock slide with a time part: every local quadratic ACTION on the 12 per-class depths (kinetic, first order in
// time, and potential), and the ones a slide that mixes the beat with space leaves unchanged. Theory only: kernels and
// exact ranks, no rule state. It extends code/measure/slide-invariant-operators (the static, spatial slide) in two
// ways: a kernel may be antisymmetric (a first-order-in-time term), and the invariance rows are keyed so several
// kernels can meet in one equation.
//
// THE ACTION. L = (1/2) d-dot M d-dot + d-dot N d - (1/2) d K d, with M and K symmetric kernels (M_ab(r) = M_ba(-r))
// and only the antisymmetric part of N mattering (N_ab(r) = -N_ba(-r); the symmetric part is a total time derivative).
// In Fourier, e^{i(p.x - omega t)}, the action's matrix is S(omega, p) = omega^2 M(p) + i omega N(p) - K(p), Hermitian.
//
// THE SLIDE. Four fields xi_mu(x, t): the spatial slide xi_i and a time slide xi_0, x^0 = c t. Linearized, a
// spacetime diffeomorphism is delta h_mu nu = D_mu xi_nu + D_nu xi_mu, read on the 12 depths as
//   h_ij   the span map's range (delta d = (n_a . D)(n_a . xi), central differences, as in E-GRV-0138)
//   h_0i   the 3 depth tilts T_i = d(e_i + e4) - d(e_i - e4): delta tau_i = s (D_i xi_0 + (1/c) dt xi_i)
//   h_00   the one cube-scalar extra, the sum L of the 3 axis-diagonal mismatches: delta lapse = 2 s' (1/c) dt xi_0
// The assignment is by representation, the only one there is: under the cube group and the depth flip w -> -w (which
// swaps e_i + e4 with e_i - e4, as time reversal flips h_0i and fixes h_00) the 6 extras are T1u (odd) plus A1g and Eg
// (even), and the ADM variables are h_0i (T1u, odd) and h_00 (A1g, even). The Eg doublet has no slot in a 4d metric.
// With G(omega, p) = G0(p) - i omega G1 (G0 the spatial differences, G1 on-site and carrying 1/c), invariance is
// S G = 0 at every omega, one equation per power:
//   omega^3  M G1 = 0        omega^2  M G0 + N G1 = 0        omega^1  N G0 + K G1 = 0        omega^0  K G0 = 0
// each a convolution of kernels, a homogeneous linear system on the orbit parameters, solved exactly over GF(p).
// A STATIC slide (xi independent of t, E-GRV-0138's) imposes the omega^0 row alone.
//
// Every entry is dyadic (the face diagonals' 1/2, the differences' 1/2, c and the scales powers of 2), so each is exact
// in a double and reduced mod p without rounding (code/algebra/linear/modular-linear).
//
// DETERMINISM: nothing is drawn. NOTHING MOVES: values only.

import { dyadicMod, inverseMatrixMod, multiplyMod } from '@/code/algebra/linear/modular-linear'
import { centralSymbolKernel, einsteinHilbertForm, extraBasis, slideGauge, type ClassGeometry, type Offset, type Symmetry } from '@/code/measure/slide-invariant-operators'

const key3 = (r: readonly number[]): string => `${r[0]},${r[1]},${r[2]}`

// ---------------------------------------------------------------------------------------------------------
// the extras by representation

export type ExtraVectors = {
  // the 3 depth tilts (T1u, odd under w -> -w): the shift's slot
  readonly tilts: readonly (readonly number[])[]
  // the sum of the 3 mismatches (A1g, even): +1 on each face-diagonal class, -1 on each axis class: the lapse's slot
  readonly lapse: readonly number[]
  // two independent differences of the mismatches (Eg, even): no slot in a 4d metric
  readonly doublet: readonly (readonly number[])[]
}

export function extraVectors(geometry: ClassGeometry): ExtraVectors {
  const e = extraBasis(geometry)
  const [m0, m1, m2] = [e[3]!, e[4]!, e[5]!]

  return {
    tilts: [e[0]!, e[1]!, e[2]!],
    lapse: m0.map((x, a) => x + m1[a]! + m2[a]!),
    doublet: [m0.map((x, a) => x - m1[a]!), m0.map((x, a) => x - m2[a]!)],
  }
}

// ---------------------------------------------------------------------------------------------------------
// kernels with a transpose sign

// orbit members as [a, b, r index, sign]: the kernel entry of the triple is sign times the orbit's parameter
export type SignedSpace = {
  readonly offsets: readonly Offset[]
  readonly members: readonly (readonly (readonly [number, number, number, number])[])[]
  // orbits dropped because the group and the transpose sign force them to zero
  readonly forcedZero: number
}

// the orbits of (a, b, r) under the symmetries (sign +1) and the transpose (a, b, r) -> (b, a, -r) with sign
// `transpose` (+1 a symmetric kernel, -1 an antisymmetric one)
export function signedSpace(offsets: readonly Offset[], symmetries: readonly Symmetry[], transpose: 1 | -1): SignedSpace {
  const R = offsets.length
  const index = new Map(offsets.map((r, i) => [key3(r), i]))
  const triple = (a: number, b: number, r: number): number => (a * 12 + b) * R + r
  const seen = new Uint8Array(144 * R)
  const signOf = new Int8Array(144 * R)
  const members: [number, number, number, number][][] = []
  let forcedZero = 0

  for (let a = 0; a < 12; a++) {
    for (let b = 0; b < 12; b++) {
      for (let r = 0; r < R; r++) {
        if (seen[triple(a, b, r)]) continue

        const list: [number, number, number, number][] = []
        const stack: [number, number, number, number][] = [[a, b, r, 1]]
        let conflict = false

        seen[triple(a, b, r)] = 1
        signOf[triple(a, b, r)] = 1
        while (stack.length > 0) {
          const [x, y, s, sign] = stack.pop()!
          const o = offsets[s]!

          list.push([x, y, s, sign])

          const images: [number, number, number, number][] = symmetries.map(g => {
            const moved = index.get(key3(g.offset(o)))

            if (moved === undefined) throw new Error('spacetime-slide: the offset set is not closed under the group')

            return [g.classes[x]!, g.classes[y]!, moved, sign]
          })

          images.push([y, x, index.get(key3([-o[0], -o[1], -o[2]]))!, sign * transpose])
          for (const [u, v, t, sg] of images) {
            const k = triple(u, v, t)

            if (!seen[k]) {
              seen[k] = 1
              signOf[k] = sg
              stack.push([u, v, t, sg])
            } else if (signOf[k] !== sg) conflict = true
          }
        }
        if (conflict) forcedZero++
        else members.push(list)
      }
    }
  }

  return { offsets, members, forcedZero }
}

// ---------------------------------------------------------------------------------------------------------
// the slide

// a 12 x 4 kernel entry: (G xi)_class(x) gets value * xi_component(x + offset); component 3 is xi_0
export type SlideEntry = { readonly class: number; readonly offset: Offset; readonly component: number; readonly value: number }

// static: E-GRV-0138's slide, time independent. foliation: xi_i may depend on time, with the tilts as the shift; no
// xi_0. no-lapse: xi_0 too, acting on the tilts, with no depth to carry h_00. spacetime: the full linearized
// diffeomorphism, the lapse on L.
export type SlideKind = 'static' | 'foliation' | 'no-lapse' | 'spacetime'

export type Slide = {
  readonly kind: SlideKind
  // the light's speed in docks per beat: the unit of x^0
  readonly c: number
  // s and s': the tilt per unit h_0i and the lapse per unit h_00
  readonly shiftScale: number
  readonly lapseScale: number
}

export type SlideKernels = { readonly space: SlideEntry[]; readonly time: SlideEntry[]; readonly components: number }

export function spacetimeSlide(geometry: ClassGeometry, slide: Slide): SlideKernels {
  const { tilts, lapse } = extraVectors(geometry)
  const space: SlideEntry[] = slideGauge(geometry, 'central').map(g => ({ class: g.class, offset: g.offset, component: g.component, value: g.value }))
  const time: SlideEntry[] = []
  const withTime = slide.kind === 'no-lapse' || slide.kind === 'spacetime'
  const unit = (i: number, s: number): Offset => [i === 0 ? s : 0, i === 1 ? s : 0, i === 2 ? s : 0]

  tilts.forEach((t, i) =>
    t.forEach((x, a) => {
      if (x === 0) return
      if (withTime) {
        space.push({ class: a, offset: unit(i, 1), component: 3, value: (slide.shiftScale * x) / 2 })
        space.push({ class: a, offset: unit(i, -1), component: 3, value: -(slide.shiftScale * x) / 2 })
      }
      if (slide.kind !== 'static') time.push({ class: a, offset: [0, 0, 0], component: i, value: (slide.shiftScale * x) / slide.c })
    }),
  )
  if (slide.kind === 'spacetime') lapse.forEach((x, a) => x !== 0 && time.push({ class: a, offset: [0, 0, 0], component: 3, value: (2 * slide.lapseScale * x) / slide.c }))

  return { space, time, components: withTime ? 4 : 3 }
}

// ---------------------------------------------------------------------------------------------------------
// the invariance system

export type ActionSpaces = { readonly kinetic: SignedSpace; readonly first: SignedSpace; readonly potential: SignedSpace }

export type ActionColumns = { readonly kinetic: number; readonly first: number; readonly potential: number; readonly width: number }

export function actionColumns(spaces: ActionSpaces): ActionColumns {
  const m = spaces.kinetic.members.length
  const n = spaces.first.members.length

  return { kinetic: 0, first: m, potential: m + n, width: m + n + spaces.potential.members.length }
}

// the rows of (X * Y)(s) = sum_r X(r) Y(s - r) = 0, keyed by `tag` and (a, component, s), added into `rows`
function addConvolution(rows: Map<string, number[]>, width: number, tag: string, space: SignedSpace, column: number, entries: readonly SlideEntry[]): void {
  const byClass = Array.from({ length: 12 }, (_, b) => entries.filter(e => e.class === b))

  space.members.forEach((list, t) => {
    for (const [a, b, ri, sign] of list) {
      const r = space.offsets[ri]!

      for (const e of byClass[b]!) {
        const k = `${tag}|${a},${e.component},${key3([r[0] + e.offset[0], r[1] + e.offset[1], r[2] + e.offset[2]])}`
        let row = rows.get(k)

        if (!row) {
          row = new Array<number>(width).fill(0)
          rows.set(k, row)
        }
        row[column + t]! += sign * e.value
      }
    }
  })
}

// every invariance row, over the columns [kinetic | first | potential] (dyadic)
export function slideRows(spaces: ActionSpaces, kernels: SlideKernels, kind: SlideKind): number[][] {
  const col = actionColumns(spaces)
  const rows = new Map<string, number[]>()

  addConvolution(rows, col.width, '0', spaces.potential, col.potential, kernels.space)
  if (kind !== 'static') {
    addConvolution(rows, col.width, '3', spaces.kinetic, col.kinetic, kernels.time)
    addConvolution(rows, col.width, '2', spaces.kinetic, col.kinetic, kernels.space)
    addConvolution(rows, col.width, '2', spaces.first, col.first, kernels.time)
    addConvolution(rows, col.width, '1', spaces.first, col.first, kernels.space)
    addConvolution(rows, col.width, '1', spaces.potential, col.potential, kernels.time)
  }

  return [...rows.values()].filter(row => row.some(x => x !== 0))
}

// ---------------------------------------------------------------------------------------------------------
// reading a kernel's blocks as functionals of the parameters

// rows over the full width: row (l, m) is sum over the orbit's triples of sign weight(r) left[l][a] right[m][b], one
// row per offset when `perOffset` (offsets where `skip` holds left out), else summed (a moment of the symbol); row
// index (offset * left * right) + l * right + m, zero rows kept
export function sandwichRows(
  space: SignedSpace,
  column: number,
  width: number,
  left: readonly (readonly number[])[],
  right: readonly (readonly number[])[],
  weight: (r: Offset) => number,
  perOffset: boolean,
  skip: (r: Offset) => boolean = () => false,
): number[][] {
  const blocks = left.length * right.length
  const out = Array.from({ length: (perOffset ? space.offsets.length : 1) * blocks }, () => new Array<number>(width).fill(0))

  space.members.forEach((list, t) => {
    for (const [a, b, ri, sign] of list) {
      const r = space.offsets[ri]!
      const w = weight(r)

      if (w === 0 || skip(r)) continue
      left.forEach((l, i) => {
        if (l[a] === 0) return
        right.forEach((m, j) => {
          if (m[b] !== 0) out[(perOffset ? ri : 0) * blocks + i * right.length + j]![column + t]! += sign * w * l[a]! * m[b]!
        })
      })
    }
  })

  // unfiltered, so row (offset, l, m) keeps its index for comparing against a target block
  return out
}

// ---------------------------------------------------------------------------------------------------------
// E-GRV-0125's potential on the 12 depths, K = A^+T Q(sin p) A^+, per offset, mod p

export function einsteinHilbertDepthKernel(geometry: ClassGeometry, p: number): Map<string, number[][]> {
  const a = geometry.span.map(row => row.map(x => dyadicMod(x, p)))
  const at = a[0]!.map((_, j) => a.map(row => row[j]!))
  const plus = multiplyMod(inverseMatrixMod(multiplyMod(at, a, p), p), at, p)
  const plusT = plus[0]!.map((_, j) => plus.map(row => row[j]!))
  const out = new Map<string, number[][]>()

  for (const [k, { value }] of centralSymbolKernel(q => einsteinHilbertForm(q))) {
    out.set(
      k,
      multiplyMod(
        multiplyMod(
          plusT,
          value.map(row => row.map(x => dyadicMod(x, p))),
          p,
        ),
        plus,
        p,
      ),
    )
  }

  return out
}

// the 4d span map in plain coordinates: row a is the D4 root's (1/2) r r^T / |r|^2 over [h_11 .. h_44, h_12, h_13,
// h_14, h_23, h_24, h_34] (off-diagonal slots doubled, as in the 3d plain span map)
export function plainSpan4(geometry: ClassGeometry): number[][] {
  return geometry.roots.map(r => {
    const n2 = r.reduce((t, x) => t + x * x, 0)
    const row: number[] = []

    for (let i = 0; i < 4; i++) row.push((r[i]! * r[i]!) / (2 * n2))
    for (let i = 0; i < 4; i++) for (let j = i + 1; j < 4; j++) row.push((r[i]! * r[j]!) / n2)

    return row
  })
}
