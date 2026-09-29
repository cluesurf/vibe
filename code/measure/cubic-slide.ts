// The dock slide at CUBIC order, in the continuum: every local two-derivative action in the ADM variables, quadratic
// plus cubic in the fields, and the ones the full nonlinear slide (a spacetime diffeomorphism, x^0 = c t) leaves
// unchanged to that order. Theory only: exact ranks over GF(p), no rule state.
//
// WHY THE CONTINUUM. E-GRV-0139 read the slide on the 12 per-class depths and found the ADM structure at quadratic
// order, with the TT speed free. The question here is what the NEXT order adds, and at small k the lattice's only
// role is its symmetry: the ansatz keeps the cube group O_h (not rotations), so isotropy must still be derived, and the
// fields are the ones E-GRV-0139 sorted the depths into (h_ij, the shift N_i from the tilts, the lapse n from the
// mismatches' sum, and the Eg doublet d_A). Everything else the lattice adds is a higher power of k.
//
// THE FIELDS. g_ij = delta_ij + h_ij, g_0i = N_i, g_00 = -N^2 + N^k N_k with N = 1 + n, and a doublet d_A carried by
// the docks as values. The doublet is written through the cube-covariant triple q = (d_1, d_2, -d_1 - d_2) (the traceless
// diagonal, Eg), which O_h permutes.
//
// THE SLIDE. The Lie derivative delta g = xi . D g + g D xi + (D xi)^T g of the 4d metric, rewritten on the ADM
// variables and kept to first order in the fields (D_0 = (1/c) d_t):
//   delta h_ij = D_i xi^j + D_j xi^i + xi^r D_r h_ij + h_kj D_i xi^k + h_ik D_j xi^k + N_j D_i xi^0 + N_i D_j xi^0
//   delta N_i  = D_0 xi^i - D_i xi^0 + xi^r D_r N_i + N_i D_0 xi^0 + h_ki D_0 xi^k + N_k D_i xi^k - 2 n D_i xi^0
//   delta n    = D_0 xi^0 + xi^r D_r n + n D_0 xi^0 - N_k D_k xi^0
//   delta d_A  = xi^r D_r d_A                                   (values carried along, no index rotation)
// The terms in xi^0 beyond the first are the time component's transport: the part that mixes the foliation, carried by
// the lapse and the shift. A FOLIATION slide (Horava's foliation-preserving diffeomorphisms) takes xi^0 = f(t).
//
// THE CONDITIONS (the Noether procedure). With S = S2 + S3 and delta = delta0 + delta1 (field-independent, linear):
//   order 1   delta0 S2 = total derivative
//   order 2   delta0 S3 + delta1 S2 = total derivative
// Each is decided exactly by the Euler derivative in xi (code/algebra/jet-polynomial). delta1 S3 is quartic: not tested.
//
// DETERMINISM: nothing is drawn. NOTHING MOVES: values only.

import {
  addScaled,
  addTerm,
  countFactors,
  deriveBy,
  gaugeEuler,
  jet,
  jetField,
  jetOrders,
  monoKey,
  monomial,
  multiply,
  norm,
  parseMono,
  spatialEuler,
  substitute,
  type Poly,
} from '@/code/algebra/jet-polynomial'

// ---------------------------------------------------------------------------------------------------------
// the fields

export const H_FIELDS = 6
export const SHIFT = [6, 7, 8] as const
export const LAPSE = 9
export const DOUBLET = [10, 11] as const
export const FIELDS = 12
export const XI0 = 12
export const XI = [13, 14, 15] as const
export const FIELD_NAMES = [
  'h_xx',
  'h_yy',
  'h_zz',
  'h_xy',
  'h_xz',
  'h_yz',
  'N_x',
  'N_y',
  'N_z',
  'n',
  'd_1',
  'd_2',
]

export const hField = (i: number, j: number): number =>
  i === j ? i : i + j === 1 ? 3 : i + j === 2 ? 4 : 5
export const isField = (f: number): boolean => f < FIELDS
export const isGauge = (f: number): boolean => f >= FIELDS

const unit = (axis: number): number[] =>
  [0, 1, 2, 3].map(a => (a === axis ? 1 : 0))
const ORIGIN = [0, 0, 0, 0]

// ---------------------------------------------------------------------------------------------------------
// the slide

// full: the whole diffeomorphism. foliation: xi^0 = f(t). frozen-time: xi^0 keeps its linear action but none of its
// transport (the terms that mix the foliation are dropped; not a group, a probe of which terms do the work)
export type SlideKind = 'full' | 'foliation' | 'frozen-time'

export type SlideSpec = {
  readonly kind: SlideKind
  readonly c: number
  readonly p: number
  readonly doublet: boolean
}

// delta phi_a for every field, as polynomials linear in the xi jets (mod p)
export function slideAction(spec: SlideSpec): Poly[] {
  const { p } = spec
  const cInv = inverse(spec.c, p)
  const out = Array.from({ length: FIELDS }, (): Poly => new Map())

  const add = (field: number, c: number, jets: number[]): void => {
    const nonlinearTime =
      jets.length === 2 && jets.some(j => jetField(j) === XI0)

    if (spec.kind === 'frozen-time' && nonlinearTime) {
      return
    }

    addTerm(
      out[field]!,
      monoKey([...jets].sort((a, b) => a - b)),
      norm(c, p),
      p,
    )
  }

  const d = (f: number, axis: number): number => jet(f, unit(axis))
  const z = (f: number): number => jet(f)

  for (let i = 0; i < 3; i++) {
    for (let j = i; j < 3; j++) {
      const f = hField(i, j)

      add(f, 1, [d(XI[j]!, i + 1)])
      add(f, 1, [d(XI[i]!, j + 1)])
      add(f, cInv, [z(XI0), d(f, 0)])

      for (let k = 0; k < 3; k++) {
        add(f, 1, [z(XI[k]!), d(f, k + 1)])
        add(f, 1, [z(hField(k, j)), d(XI[k]!, i + 1)])
        add(f, 1, [z(hField(i, k)), d(XI[k]!, j + 1)])
      }

      add(f, 1, [z(SHIFT[j]!), d(XI0, i + 1)])
      add(f, 1, [z(SHIFT[i]!), d(XI0, j + 1)])
    }
  }

  for (let i = 0; i < 3; i++) {
    const f = SHIFT[i]!

    add(f, cInv, [d(XI[i]!, 0)])
    add(f, -1, [d(XI0, i + 1)])
    add(f, cInv, [z(XI0), d(f, 0)])
    add(f, cInv, [z(f), d(XI0, 0)])
    add(f, -2, [z(LAPSE), d(XI0, i + 1)])

    for (let k = 0; k < 3; k++) {
      add(f, 1, [z(XI[k]!), d(f, k + 1)])
      add(f, cInv, [z(hField(k, i)), d(XI[k]!, 0)])
      add(f, 1, [z(SHIFT[k]!), d(XI[k]!, i + 1)])
    }
  }

  add(LAPSE, cInv, [d(XI0, 0)])
  add(LAPSE, cInv, [z(XI0), d(LAPSE, 0)])
  add(LAPSE, cInv, [z(LAPSE), d(XI0, 0)])

  for (let k = 0; k < 3; k++) {
    add(LAPSE, 1, [z(XI[k]!), d(LAPSE, k + 1)])
    add(LAPSE, -1, [z(SHIFT[k]!), d(XI0, k + 1)])
  }

  if (spec.doublet) {
    for (const f of DOUBLET) {
      add(f, cInv, [z(XI0), d(f, 0)])

      for (let k = 0; k < 3; k++) {
        add(f, 1, [z(XI[k]!), d(f, k + 1)])
      }
    }
  }

  return out
}

function inverse(a: number, p: number): number {
  let r = 1
  let b = norm(a, p)
  let e = p - 2

  while (e > 0) {
    if (e % 2 === 1) {
      r = (r * b) % p
    }

    b = (b * b) % p
    e = Math.floor(e / 2)
  }

  return r
}

// ---------------------------------------------------------------------------------------------------------
// the Noether rows of one monomial

export type RowContext = {
  readonly spec: SlideSpec
  // 1: the order-1 condition only (the linear slide); 2: both
  readonly maxOrder: 1 | 2
  readonly action: Poly[]
  readonly derived: Map<number, Poly>
}

export function rowContext(
  spec: SlideSpec,
  maxOrder: 1 | 2,
): RowContext {
  return {
    spec,
    maxOrder,
    action: slideAction(spec),
    derived: new Map(),
  }
}

// D^alpha (delta phi_a), with xi^0's spatial derivatives dropped for a foliation slide
function derivedAction(ctx: RowContext, id: number): Poly {
  const hit = ctx.derived.get(id)

  if (hit) {
    return hit
  }

  const raw = deriveBy(
    ctx.action[jetField(id)]!,
    jetOrders(id),
    ctx.spec.p,
  )

  let out = raw

  if (ctx.spec.kind === 'foliation') {
    out = new Map()

    for (const [k, c] of raw) {
      const xi0 = parseMono(k).find(j => jetField(j) === XI0)

      if (
        xi0 === undefined ||
        jetOrders(xi0)
          .slice(1)
          .every(x => x === 0)
      ) {
        out.set(k, c)
      }
    }
  }

  ctx.derived.set(id, out)

  return out
}

// the invariance rows one monomial of the action contributes: key -> coefficient (mod p)
export function monomialRows(
  ctx: RowContext,
  mono: readonly number[],
): Poly {
  const { p } = ctx.spec
  const variation: Poly = new Map()

  mono.forEach((id, i) => {
    const rest = mono.filter((_, j) => j !== i)

    for (const [k, c] of derivedAction(ctx, id)) {
      const m = [...rest, ...parseMono(k)].sort((a, b) => a - b)

      if (countFactors(m, isField) <= ctx.maxOrder) {
        addTerm(variation, monoKey(m), c, p)
      }
    }
  })

  const rows: Poly = new Map()

  for (const [f, e] of gaugeEuler(variation, isGauge, p)) {
    if (f === XI0 && ctx.spec.kind === 'foliation') {
      for (const [k, c] of spatialEuler(e, p)) {
        addTerm(rows, `F|${k}`, c, p)
      }
    } else {
      for (const [k, c] of e) {
        addTerm(rows, `${f}|${k}`, c, p)
      }
    }
  }

  return rows
}

// the Euler-Lagrange derivatives of a monomial in every field: zero exactly for a total derivative
export function monomialEquations(
  mono: readonly number[],
  p: number,
): Poly {
  const out: Poly = new Map()

  mono.forEach((id, i) => {
    const rest = mono.filter((_, j) => j !== i)
    const orders = jetOrders(id)
    const sign = orders.reduce((t, x) => t + x, 0) % 2 === 0 ? 1 : -1

    for (const [k, c] of deriveBy(
      new Map([[monoKey(rest), 1]]),
      orders,
      p,
    )) {
      addTerm(out, `${jetField(id)}|${k}`, sign * c, p)
    }
  })

  return out
}

// ---------------------------------------------------------------------------------------------------------
// the ansatz: O_h-invariant sums of dL = d phi d phi (quadratic) and phi d phi d phi (cubic), which span every local
// two-derivative Lagrangian of those orders up to a total derivative

type Signed = {
  readonly perm: readonly number[]
  readonly signs: readonly number[]
}

export function cubeGroup(): Signed[] {
  const perms = [
    [0, 1, 2],
    [0, 2, 1],
    [1, 0, 2],
    [1, 2, 0],
    [2, 0, 1],
    [2, 1, 0],
  ]
  const out: Signed[] = []

  for (const perm of perms) {
    for (let s = 0; s < 8; s++) {
      out.push({
        perm,
        signs: [0, 1, 2].map(i => ((s >> i) & 1 ? -1 : 1)),
      })
    }
  }

  return out
}

// the image of one jet under a signed permutation (as a polynomial: the doublet maps to sums)
function jetImage(g: Signed, id: number): Poly {
  const f = jetField(id)
  const [t, ...space] = jetOrders(id)
  const orders = [t, 0, 0, 0]

  let sign = 1

  space.forEach((n, k) => {
    orders[g.perm[k]! + 1] = n

    if (n % 2 === 1) {
      sign *= g.signs[k]!
    }
  })

  const one = (field: number, s: number): Poly =>
    new Map([[monoKey([jet(field, orders)]), s * sign]])

  if (f < H_FIELDS) {
    const [i, j] =
      f < 3 ? [f, f] : f === 3 ? [0, 1] : f === 4 ? [0, 2] : [1, 2]

    return one(
      hField(g.perm[i]!, g.perm[j]!),
      g.signs[i]! * g.signs[j]!,
    )
  }

  if (f >= SHIFT[0] && f <= SHIFT[2]) {
    return one(SHIFT[g.perm[f - SHIFT[0]]!]!, g.signs[f - SHIFT[0]]!)
  }

  if (f === LAPSE) {
    return one(LAPSE, 1)
  }

  // the doublet: q_x = d_1, q_y = d_2, q_z = -d_1 - d_2, and q_i -> q_perm(i)
  const target = g.perm[f - DOUBLET[0]]!

  if (target < 2) {
    return one(DOUBLET[target]!, 1)
  }

  return new Map([
    [monoKey([jet(DOUBLET[0], orders)]), -sign],
    [monoKey([jet(DOUBLET[1], orders)]), -sign],
  ])
}

export type Ansatz = {
  // each column an O_h-invariant polynomial with integer coefficients
  readonly columns: Poly[]
  readonly quadratic: boolean[]
}

export function cubicAnsatz(
  fields: number,
  withCubic: boolean,
): Ansatz {
  const group = cubeGroup()
  const first: number[] = []
  const zero: number[] = []

  for (let f = 0; f < fields; f++) {
    zero.push(jet(f, ORIGIN))

    for (let a = 0; a < 4; a++) {
      first.push(jet(f, unit(a)))
    }
  }

  const monos: number[][] = []

  for (let a = 0; a < first.length; a++) {
    for (let b = a; b < first.length; b++) {
      monos.push([first[a]!, first[b]!])
    }
  }

  if (withCubic) {
    for (const z of zero) {
      for (let a = 0; a < first.length; a++) {
        for (let b = a; b < first.length; b++) {
          monos.push([z, first[a]!, first[b]!].sort((x, y) => x - y))
        }
      }
    }
  }

  const seen = new Set<string>()
  const covered = new Set<string>()
  const columns: Poly[] = []
  const quadratic: boolean[] = []

  for (const m of monos) {
    const key = monoKey(m)
    const plain = m.every(id => jetField(id) < DOUBLET[0])

    if (plain && covered.has(key)) {
      continue
    }

    const sum: Poly = new Map()

    for (const g of group) {
      addScaled(
        sum,
        substitute(monomial(m), id => jetImage(g, id), 0),
        1,
        0,
      )
    }

    if (sum.size === 0) {
      continue
    }

    const canonical = canonicalString(sum)

    for (const k of sum.keys()) {
      covered.add(k)
    }

    if (seen.has(canonical)) {
      continue
    }

    seen.add(canonical)
    columns.push(sum)
    quadratic.push(m.length === 2)
  }

  return { columns, quadratic }
}

function canonicalString(poly: Poly): string {
  const terms = [...poly].sort(([a], [b]) =>
    a < b ? -1 : a > b ? 1 : 0,
  )
  const gcd = (a: number, b: number): number =>
    b === 0 ? Math.abs(a) : gcd(b, a % b)
  const g = terms.reduce((t, [, c]) => gcd(t, c), 0)
  const s = Math.sign(terms[0]![1]) * g

  return terms.map(([k, c]) => `${k}:${c / s}`).join(';')
}

// ---------------------------------------------------------------------------------------------------------
// the quadratic kernel: a quadratic Lagrangian's form Q(phi, k) = sum_(a <= b) q_ab(k) phi_a phi_b, each q_ab a quadratic
// polynomial in k = (omega, k_x, k_y, k_z); keyed `${a},${b}|${mu}${nu}` (a <= b, mu <= nu, axis 0 = time). Total
// derivatives give 0, so it reads a Lagrangian's content, not its representative.

export const kernelKey = (
  a: number,
  b: number,
  mu: number,
  nu: number,
): string =>
  `${Math.min(a, b)},${Math.max(a, b)}|${Math.min(mu, nu)}${Math.max(mu, nu)}`

export function quadraticKernel(poly: Poly, p: number): Poly {
  const out: Poly = new Map()

  for (const [k, c] of poly) {
    const m = parseMono(k)

    if (
      m.length !== 2 ||
      m.some(id => jetOrders(id).reduce((t, x) => t + x, 0) !== 1)
    ) {
      continue
    }

    const axis = (id: number): number =>
      jetOrders(id).findIndex(x => x === 1)

    addTerm(
      out,
      kernelKey(
        jetField(m[0]!),
        jetField(m[1]!),
        axis(m[0]!),
        axis(m[1]!),
      ),
      c,
      p,
    )
  }

  return out
}

// the Fierz-Pauli Lagrangian (linearized Einstein-Hilbert, x^0 = c t, eta = diag(-1, 1, 1, 1)) on H_00 = -2 n,
// H_0i = N_i, H_ij = h_ij: an independent second route to the answer
//   -(1/2) dH_mn dH^mn + dH^ml d^n H_nl - dH^mn d_n H + (1/2) dH d H
export function fierzPauli(c: number, p: number): Poly {
  const cInv = inverse(c, p)
  const eta = (m: number): number => (m === 0 ? -1 : 1)

  // D_l H_mn as a linear polynomial
  const dH = (l: number, m: number, n: number): Poly => {
    const scale = l === 0 ? cInv : 1
    const o = unit(l)

    if (m === 0 && n === 0) {
      return new Map([[monoKey([jet(LAPSE, o)]), norm(-2 * scale, p)]])
    }

    if (m === 0 || n === 0) {
      return new Map([
        [monoKey([jet(SHIFT[m + n - 1]!, o)]), norm(scale, p)],
      ])
    }

    return new Map([
      [monoKey([jet(hField(m - 1, n - 1), o)]), norm(scale, p)],
    ])
  }

  const sum = (terms: Poly[]): Poly => {
    const out: Poly = new Map()

    for (const t of terms) {
      addScaled(out, t, 1, p)
    }

    return out
  }

  const scaled = (poly: Poly, s: number): Poly => {
    const out: Poly = new Map()

    addScaled(out, poly, norm(s, p), p)

    return out
  }

  const half = inverse(2, p)
  // V_l = d^m H_ml, trace derivative T_l = d_l (eta^mn H_mn)
  const V = (l: number): Poly =>
    sum([0, 1, 2, 3].map(m => scaled(dH(m, m, l), eta(m))))
  const T = (l: number): Poly =>
    sum([0, 1, 2, 3].map(m => scaled(dH(l, m, m), eta(m))))
  const out: Poly = new Map()

  for (let l = 0; l < 4; l++) {
    for (let m = 0; m < 4; m++) {
      for (let n = 0; n < 4; n++) {
        addScaled(
          out,
          multiply(dH(l, m, n), dH(l, m, n), p),
          norm(-half * eta(l) * eta(m) * eta(n), p),
          p,
        )
      }
    }

    addScaled(out, multiply(V(l), V(l), p), norm(eta(l), p), p)
    addScaled(out, multiply(V(l), T(l), p), norm(-eta(l), p), p)
    addScaled(out, multiply(T(l), T(l), p), norm(half * eta(l), p), p)
  }

  return out
}

// the minimally coupled scalar -(1/2) sqrt(-g) g^mn d_m s d_n s to cubic order, expanded by hand (sqrt(-g) = 1 + n + h/2,
// g^00 = -(1 - 2n), g^0i = N_i, g^ij = delta_ij - h_ij), with the gradient term's quadratic part scaled by v2 / c^2: a
// third route, and at v2 != c^2 a Lagrangian that must fail the order-2 condition
export function minimalScalar(
  field: number,
  c: number,
  v2: number,
  p: number,
): Poly {
  const cInv = inverse(c, p)
  const half = inverse(2, p)
  const out: Poly = new Map()
  const d = (a: number): number => jet(field, unit(a))
  const z = (f: number): number => jet(f)
  // a product of residues, reduced after every factor so nothing leaves the exact range
  const times = (...xs: number[]): number =>
    xs.reduce((t, x) => (t * norm(x, p)) % p, 1)
  const put = (coef: number, jets: number[]): void =>
    addTerm(
      out,
      monoKey([...jets].sort((x, y) => x - y)),
      norm(coef, p),
      p,
    )
  const t2 = times(cInv, cInv)
  const trace = [0, 1, 2]

  put(times(half, t2), [d(0), d(0)])

  for (let i = 1; i <= 3; i++) {
    put(times(-1, half, v2, t2), [d(i), d(i)])
  }

  // -(1/2) [ n (D0 s)^2 + n (Ds)^2 - (h/2)(D0 s)^2 + (h/2)(Ds)^2 + 2 N_i D0 s D_i s - h_ij D_i s D_j s ]
  put(times(-1, half, t2), [z(LAPSE), d(0), d(0)])

  for (let i = 1; i <= 3; i++) {
    put(-half, [z(LAPSE), d(i), d(i)])
  }

  for (const k of trace) {
    put(times(half, half, t2), [z(k), d(0), d(0)])

    for (let i = 1; i <= 3; i++) {
      put(times(-1, half, half), [z(k), d(i), d(i)])
    }
  }

  for (let i = 0; i < 3; i++) {
    put(-cInv, [z(SHIFT[i]!), d(0), d(i + 1)])
  }

  for (let i = 0; i < 3; i++) {
    for (let j = 0; j < 3; j++) {
      put(half, [z(hField(i, j)), d(i + 1), d(j + 1)])
    }
  }

  return out
}
