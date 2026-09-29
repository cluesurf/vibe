// Every local quadratic operator on the 12 per-class depths of code/measure/line-class-metric, and the ones a slide
// of the docks leaves unchanged. Theory only: kernels, symbols and exact ranks, no rule state.
//
// THE OPERATORS. A quadratic form V = (1/2) sum_x d_a(x) (K d)_a(x), (K d)_a(x) = sum_r K_ab(r) d_b(x + r), with a real
// kernel K_ab(r) on a finite set R of husk offsets, symmetric (K_ab(r) = K_ba(-r), so the symbol K(p) =
// sum_r K(r) e^{i p.r} is Hermitian) and invariant under the husk's point group: K_{g a, g b}(g r) = K_ab(r) for the 48
// signed permutations g of the cube, acting on a class through its D4 root (x, w) -> (g x, w), a root pair up to sign.
// A depth is a scalar on an unoriented line class, so the classes are permuted without a sign. The free parameters are
// the orbits of the triples (a, b, r) under the group and the transpose: one real number per orbit.
//
// THE SLIDE. Relabeling where each dock sits by a small xi(x) changes the depths by d_a -> d_a + (G xi)_a, the
// linearized diffeomorphism on edge lengths, delta d_a = (n_a . D)(n_a . xi). Two lattice forms of the derivative:
//   central  D_i the central axis difference (f(x + e_i) - f(x - e_i)) / 2, symbol i sin p_i: the difference the
//            depths use in E-GRV-0125, so there delta d = A (q xi + xi q) with q = sin p, always inside the span map's
//            range (the six extras never move)
//   own      each class differenced along its OWN link u_a: (n_a . xi(x + u_a) - n_a . xi(x - u_a)) / (2 |u_a|),
//            symbol i sin(u_a . p) / |u_a|; the same as central on the axis classes, different at p^3 on the diagonals,
//            where it moves the extras
// V is invariant iff K(p) G(p) = 0 at every p, which on the kernels is the convolution sum_r K(r) G(s - r) = 0 at
// every s: a homogeneous linear system on the orbit parameters, solved exactly over GF(p).
//
// Everything entering is a dyadic rational (the face diagonals' n_i n_j = 1/2, the differences' 1/2 and 1/4), so each
// kernel is exact in a double and is reduced mod p without rounding (code/algebra/linear/modular-linear).
//
// DETERMINISM: nothing is drawn. NOTHING MOVES: values only.

import { lineClasses } from '@/code/measure/line-class-metric'
import { TRIT_HUSK_VECTORS } from '@/code/rule/trit-column'

export type Offset = readonly [number, number, number]

const key3 = (r: readonly number[]): string => `${r[0]},${r[1]},${r[2]}`

// the offsets reachable in at most `steps` husk steps (the husk's 18 link vectors, the 6 axis and 12 face diagonal
// ones), sorted
export function huskBall(steps: number): Offset[] {
  const links = TRIT_HUSK_VECTORS.flatMap(u => [u, u.map(x => -x)])

  let front = new Map<string, Offset>([['0,0,0', [0, 0, 0]]])

  const all = new Map(front)

  for (let s = 0; s < steps; s++) {
    const next = new Map<string, Offset>()

    for (const r of front.values()) {
      for (const u of links) {
        const v: Offset = [r[0] + u[0]!, r[1] + u[1]!, r[2] + u[2]!]

        if (!all.has(key3(v))) {
          all.set(key3(v), v)
          next.set(key3(v), v)
        }
      }
    }

    front = next
  }

  return [...all.values()].sort(
    (a, b) =>
      a[0] * a[0] +
        a[1] * a[1] +
        a[2] * a[2] -
        (b[0] * b[0] + b[1] * b[1] + b[2] * b[2]) ||
      key3(a).localeCompare(key3(b)),
  )
}

// the cube |r_i| <= radius
export function chebyshevBall(radius: number): Offset[] {
  const out: Offset[] = []

  for (let x = -radius; x <= radius; x++) {
    for (let y = -radius; y <= radius; y++) {
      for (let z = -radius; z <= radius; z++) {
        out.push([x, y, z])
      }
    }
  }

  return out
}

// the 48 signed permutation matrices of the cube, as maps on a 3-vector
export function cubicGroup(): ((v: readonly number[]) => number[])[] {
  const perms = [
    [0, 1, 2],
    [0, 2, 1],
    [1, 0, 2],
    [1, 2, 0],
    [2, 0, 1],
    [2, 1, 0],
  ]
  const out: ((v: readonly number[]) => number[])[] = []

  for (const perm of perms) {
    for (let signs = 0; signs < 8; signs++) {
      const s = [0, 1, 2].map(i => ((signs >> i) & 1 ? -1 : 1))

      out.push(v => [0, 1, 2].map(i => s[i]! * v[perm[i]!]!))
    }
  }

  return out
}

export type ClassGeometry = {
  // the D4 root and the husk vector of each class (integers)
  readonly roots: readonly (readonly number[])[]
  readonly husk: readonly (readonly number[])[]
  // n_i n_j of each class (dyadic)
  readonly nn: readonly (readonly (readonly number[])[])[]
  // the span map in PLAIN metric coordinates [h_xx, h_yy, h_zz, h_xy, h_xz, h_yz]: d_a = (1/2) n_a . h . n_a, row a is
  // [n_x^2 / 2, n_y^2 / 2, n_z^2 / 2, n_x n_y, n_x n_z, n_y n_z] (dyadic, unlike the Frobenius-orthonormal vec of
  // line-class-metric, which carries sqrt 2)
  readonly span: readonly (readonly number[])[]
}

export const PLAIN_SLOTS: readonly (readonly [number, number])[] = [
  [0, 0],
  [1, 1],
  [2, 2],
  [0, 1],
  [0, 2],
  [1, 2],
]

export function classGeometry(): ClassGeometry {
  const classes = lineClasses()
  const roots = classes.map(c => c.root.map(x => x))
  const husk = classes.map(c => c.husk.map(x => x))
  const nn = husk.map(u => {
    const n2 = u.reduce((t, x) => t + x * x, 0)

    return [0, 1, 2].map(i => [0, 1, 2].map(j => (u[i]! * u[j]!) / n2))
  })
  const span = nn.map(m =>
    PLAIN_SLOTS.map(([i, j]) => (i === j ? m[i]![i]! / 2 : m[i]![j]!)),
  )

  return { roots, husk, nn, span }
}

// a symmetry of the operators: a cube map on the offsets and the class permutation it induces
export type Symmetry = {
  readonly offset: (r: Offset) => Offset
  readonly classes: readonly number[]
}

// the cube group acting on the classes through their roots; `depthFlip` adds w -> -w (which fixes every offset and
// swaps e_i + e4 with e_i - e4), for the larger group O_h x Z2
export function classSymmetries(
  geometry: ClassGeometry,
  depthFlip: boolean,
): Symmetry[] {
  const indexOf = (root: readonly number[]): number => {
    const found = geometry.roots.findIndex(
      r =>
        r.every((x, k) => x === root[k]) ||
        r.every((x, k) => x === -root[k]!),
    )

    if (found < 0) {
      throw new Error(
        'slide-invariant-operators: a root outside the classes',
      )
    }

    return found
  }

  const out: Symmetry[] = cubicGroup().map(g => ({
    offset: (r: Offset): Offset => g(r) as unknown as Offset,
    classes: geometry.roots.map(root =>
      indexOf([...g(root.slice(0, 3)), root[3]!]),
    ),
  }))

  if (depthFlip) {
    out.push({
      offset: r => r,
      classes: geometry.roots.map(root =>
        indexOf([root[0]!, root[1]!, root[2]!, -root[3]!]),
      ),
    })
  }

  return out
}

// the parameter space: the orbits of the triples (a, b, r)
export type OperatorSpace = {
  readonly offsets: readonly Offset[]
  // orbit of triple (a * 12 + b) * offsets + r
  readonly orbitOf: Int32Array
  // the triples of each orbit, as [a, b, r index]
  readonly members: readonly (readonly (readonly [
    number,
    number,
    number,
  ])[])[]
}

export function operatorSpace(
  offsets: readonly Offset[],
  symmetries: readonly Symmetry[],
): OperatorSpace {
  const R = offsets.length
  const index = new Map(offsets.map((r, i) => [key3(r), i]))
  const triple = (a: number, b: number, r: number): number =>
    (a * 12 + b) * R + r
  const orbitOf = new Int32Array(144 * R).fill(-1)
  const members: [number, number, number][][] = []

  for (let a = 0; a < 12; a++) {
    for (let b = 0; b < 12; b++) {
      for (let r = 0; r < R; r++) {
        if (orbitOf[triple(a, b, r)]! >= 0) {
          continue
        }

        const orbit = members.length
        const list: [number, number, number][] = []
        const stack: [number, number, number][] = [[a, b, r]]

        orbitOf[triple(a, b, r)] = orbit

        while (stack.length > 0) {
          const [x, y, s] = stack.pop()!
          const o = offsets[s]!

          list.push([x, y, s])

          const images: [number, number, number][] = symmetries.map(
            g => {
              const moved = index.get(key3(g.offset(o)))

              if (moved === undefined) {
                throw new Error(
                  'slide-invariant-operators: the offset set is not closed under the group',
                )
              }

              return [g.classes[x]!, g.classes[y]!, moved]
            },
          )

          images.push([y, x, index.get(key3([-o[0], -o[1], -o[2]]))!])

          for (const [u, v, t] of images) {
            if (orbitOf[triple(u, v, t)]! < 0) {
              orbitOf[triple(u, v, t)] = orbit
              stack.push([u, v, t])
            }
          }
        }

        members.push(list)
      }
    }
  }

  return { offsets, orbitOf, members }
}

// a 12 x 3 kernel: (G xi)_a(x) = sum over entries of value * xi_component(x + offset), for entries of class a
export type GaugeEntry = {
  readonly class: number
  readonly offset: Offset
  readonly component: number
  readonly value: number
}

export type GaugeKind = 'central' | 'own'

export function slideGauge(
  geometry: ClassGeometry,
  kind: GaugeKind,
): GaugeEntry[] {
  const out: GaugeEntry[] = []

  geometry.husk.forEach((u, a) => {
    if (kind === 'central') {
      for (let i = 0; i < 3; i++) {
        for (let m = 0; m < 3; m++) {
          const v = geometry.nn[a]![i]![m]! / 2

          if (v === 0) {
            continue
          }

          const e: number[] = [0, 0, 0]

          e[i] = 1
          out.push({
            class: a,
            offset: [e[0]!, e[1]!, e[2]!],
            component: m,
            value: v,
          })

          out.push({
            class: a,
            offset: [-e[0]!, -e[1]!, -e[2]!],
            component: m,
            value: -v,
          })
        }
      }
    } else {
      const n2 = u.reduce((t, x) => t + x * x, 0)

      for (let m = 0; m < 3; m++) {
        const v = u[m]! / (2 * n2)

        if (v === 0) {
          continue
        }

        out.push({
          class: a,
          offset: [u[0]!, u[1]!, u[2]!],
          component: m,
          value: v,
        })

        out.push({
          class: a,
          offset: [-u[0]!, -u[1]!, -u[2]!],
          component: m,
          value: -v,
        })
      }
    }
  })

  return out
}

// the invariance conditions sum_r K(r) G(s - r) = 0, one row per (a, component, s), columns the orbits (dyadic)
export function invarianceRows(
  space: OperatorSpace,
  gauge: readonly GaugeEntry[],
): number[][] {
  const P = space.members.length
  const rows = new Map<string, number[]>()
  const byClass = Array.from({ length: 12 }, (_, b) =>
    gauge.filter(g => g.class === b),
  )

  space.members.forEach((list, t) => {
    for (const [a, b, ri] of list) {
      const r = space.offsets[ri]!

      for (const g of byClass[b]!) {
        const k = `${a},${g.component},${key3([r[0] + g.offset[0], r[1] + g.offset[1], r[2] + g.offset[2]])}`

        let row = rows.get(k)

        if (!row) {
          row = new Array<number>(P).fill(0)
          rows.set(k, row)
        }

        row[t]! += g.value
      }
    }
  })

  return [...rows.values()]
}

// the moments of each basis operator, sandwiched: out[(l, m)][t] = sum over the orbit's triples of
// weight(r) left[l][a] right[m][b]. With left = right = the span map's columns this is the metric block of the
// moment (A^T C A); `weight` 1, r_i, r_i r_j give the symbol's p^0, p^1, p^2 coefficients up to i and -1/2.
export function sandwichedMoment(
  space: OperatorSpace,
  left: readonly (readonly number[])[],
  right: readonly (readonly number[])[],
  weight: (r: Offset) => number,
): number[][] {
  const P = space.members.length
  const out = Array.from({ length: left.length * right.length }, () =>
    new Array<number>(P).fill(0),
  )

  space.members.forEach((list, t) => {
    for (const [a, b, ri] of list) {
      const w = weight(space.offsets[ri]!)

      if (w === 0) {
        continue
      }

      left.forEach((l, i) => {
        if (l[a] === 0) {
          return
        }

        right.forEach((m, j) => {
          if (m[b] !== 0) {
            out[i * right.length + j]![t]! += w * l[a]! * m[b]!
          }
        })
      })
    }
  })

  return out
}

// the same block kept per offset (every offset except `skip`), for asking whether a block has ANY derivative term
export function sandwichedKernel(
  space: OperatorSpace,
  left: readonly (readonly number[])[],
  right: readonly (readonly number[])[],
  skip: (r: Offset) => boolean,
): number[][] {
  const P = space.members.length
  const R = space.offsets.length
  const out = Array.from(
    { length: R * left.length * right.length },
    () => new Array<number>(P).fill(0),
  )

  space.members.forEach((list, t) => {
    for (const [a, b, ri] of list) {
      if (skip(space.offsets[ri]!)) {
        continue
      }

      left.forEach((l, i) => {
        if (l[a] === 0) {
          return
        }

        right.forEach((m, j) => {
          if (m[b] !== 0) {
            out[(ri * left.length + i) * right.length + j]![t]! +=
              l[a]! * m[b]!
          }
        })
      })
    }
  })

  return out.filter(row => row.some(x => x !== 0))
}

// the extras: 3 depth tilts (e_i + e4 against e_i - e4) and 3 axis-diagonal mismatches (the two diagonals of the
// (i, j) face against half the four axis classes of i and j), each a 12-vector with A^T v = 0 (dyadic)
export function extraBasis(geometry: ClassGeometry): number[][] {
  const indexOf = (root: readonly number[]): number =>
    geometry.roots.findIndex(
      r =>
        r.every((x, k) => x === root[k]) ||
        r.every((x, k) => x === -root[k]!),
    )
  const unit = (i: number): number[] =>
    [0, 1, 2].map(k => (k === i ? 1 : 0))
  const axis = (i: number, s: number): number =>
    indexOf([...unit(i), s])
  const diag = (i: number, j: number, s: number): number =>
    indexOf(
      [0, 1, 2].map(m => (m === i ? 1 : m === j ? s : 0)).concat([0]),
    )
  const tilts = [0, 1, 2].map(i =>
    Array.from({ length: 12 }, (_, a) =>
      a === axis(i, 1) ? 1 : a === axis(i, -1) ? -1 : 0,
    ),
  )
  const mismatches = [
    [0, 1],
    [0, 2],
    [1, 2],
  ].map(([i, j]) =>
    Array.from({ length: 12 }, (_, a) => {
      if (a === diag(i!, j!, 1) || a === diag(i!, j!, -1)) {
        return 1
      }

      if (
        a === axis(i!, 1) ||
        a === axis(i!, -1) ||
        a === axis(j!, 1) ||
        a === axis(j!, -1)
      ) {
        return -0.5
      }

      return 0
    }),
  )

  return [...tilts, ...mismatches]
}

// the linearized Einstein-Hilbert density in plain metric coordinates:
//   Q(h) = q^2 |h|^2 - 2 |q h|^2 + 2 (q.h.q) tr h - q^2 (tr h)^2 = h . 2 G(q) h
// (|h|^2 Frobenius, G the linearized Einstein tensor); returned as its 6 x 6 matrix in plain coordinates
export function einsteinHilbertForm(q: readonly number[]): number[][] {
  const matrixOf = (v: readonly number[]): number[][] => {
    const h = [
      [0, 0, 0],
      [0, 0, 0],
      [0, 0, 0],
    ]

    PLAIN_SLOTS.forEach(([i, j], s) => {
      h[i]![j] = v[s]!
      h[j]![i] = v[s]!
    })

    return h
  }

  const Q = (v: readonly number[]): number => {
    const h = matrixOf(v)
    const q2 = q.reduce((t, x) => t + x * x, 0)
    const tr = h[0]![0]! + h[1]![1]! + h[2]![2]!

    let frob = 0
    let qh2 = 0
    let qhq = 0

    for (let i = 0; i < 3; i++) {
      let row = 0

      for (let j = 0; j < 3; j++) {
        frob += h[i]![j]! * h[i]![j]!
        row += q[j]! * h[j]![i]!
        qhq += q[i]! * h[i]![j]! * q[j]!
      }

      qh2 += row * row
    }

    return q2 * frob - 2 * qh2 + 2 * qhq * tr - q2 * tr * tr
  }

  const e = (s: number): number[] =>
    PLAIN_SLOTS.map((_, k) => (k === s ? 1 : 0))

  return PLAIN_SLOTS.map((_, s) =>
    PLAIN_SLOTS.map((__, t) =>
      s === t
        ? Q(e(s))
        : (Q(e(s).map((x, k) => x + e(t)[k]!)) - Q(e(s)) - Q(e(t))) / 2,
    ),
  )
}

// the real-space kernel of a symbol that is a quadratic form in q_i = sin p_i: form(q) = sum c_ij q_i q_j, with
// sin p_i sin p_j (i != j) at offsets +-(e_i - e_j) with 1/4 and +-(e_i + e_j) with -1/4, and sin^2 p_i at 0 with 1/2
// and at +-2 e_i with -1/4; returned as a map from offset to the 6 x 6 matrix
export function centralSymbolKernel(
  form: (q: readonly number[]) => number[][],
): Map<string, { offset: Offset; value: number[][] }> {
  const e = (i: number): number[] =>
    [0, 1, 2].map(k => (k === i ? 1 : 0))
  const at = form([0, 0, 0])
  const zero = (): number[][] => at.map(row => row.map(() => 0))
  const out = new Map<string, { offset: Offset; value: number[][] }>()

  const add = (
    r: readonly number[],
    m: number[][],
    w: number,
  ): void => {
    const k = key3(r)

    if (!out.has(k)) {
      out.set(k, { offset: [r[0]!, r[1]!, r[2]!], value: zero() })
    }

    const v = out.get(k)!.value

    m.forEach((row, i) => row.forEach((x, j) => (v[i]![j]! += w * x)))
  }

  for (let i = 0; i < 3; i++) {
    // the coefficient matrix of q_i^2
    const ci = form(e(i))

    add([0, 0, 0], ci, 1 / 2)
    add(
      e(i).map(x => 2 * x),
      ci,
      -1 / 4,
    )

    add(
      e(i).map(x => -2 * x),
      ci,
      -1 / 4,
    )

    for (let j = i + 1; j < 3; j++) {
      const cj = form(e(j))
      const both = form(e(i).map((x, k) => x + e(j)[k]!))
      // the coefficient of q_i q_j (both orders together)
      const cij = both.map((row, a) =>
        row.map((x, b) => x - ci[a]![b]! - cj[a]![b]!),
      )
      const minus = e(i).map((x, k) => x - e(j)[k]!)
      const plus = e(i).map((x, k) => x + e(j)[k]!)

      add(minus, cij, 1 / 4)
      add(
        minus.map(x => -x),
        cij,
        1 / 4,
      )
      add(plus, cij, -1 / 4)
      add(
        plus.map(x => -x),
        cij,
        -1 / 4,
      )
    }
  }

  return out
}
