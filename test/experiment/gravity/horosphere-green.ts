// THE BULK'S OWN GREEN'S FUNCTION ON THE HUSK (E-GRV-0150, OPEN-GRV-01, OPEN-GRV-12, routes H3b, I11a, I12b). Route H3b
// asks whether Newton's 1/r is the bulk mesh's own harmonic function: content sources a massless field on the true
// {3,4,3,4} mesh, read on the cusp horosphere (the husk), as a brane in a hyperbolic bulk localizes gravity (Karch and
// Randall 2001). The same solve answers I11a (a power law on the horosphere, r^(-2 Delta), whose Delta would be the
// ripples' tilt) and I12b (an l = 4 cubic pattern that falls as (k b)^2). The routes file names the kill in advance:
// "it falls faster than 1/r past r = 10 (a massive brane mode), or 0.549 does not come out".
//
// WHAT IS SOLVED. The graph Laplacian 24 - A of the mesh's cells (24 facets each, E-GMT-0027), its inverse G read
// between husk cells, G(r) for a husk offset r in the husk's cubic lattice. The cells below the husk are taken modulo
// the cusp's cubic translations (code/measure/cusp-green buildCuspQuotient), so G(r) is the inverse transform of one
// Bloch solve per husk momentum k, N^3 momenta, of which only the cubic wedge is solved. The mesh is cut at a floor,
// a Busemann level (the husk is level 1, every center at an odd level, E-CSM-0060):
//  DIRICHLET: a link below the floor ends on a cell held at 0. As the floor deepens, G rises to the infinite mesh's
//    minimal Green's function (fewer paths are removed), which is what "the bulk's own Green's function" names.
//  REFLECTING: the truncated graph's own Laplacian, nothing crosses the floor: a finite bulk ending on a second wall.
//    It has a zero mode, so G_husk(k) -> 1 / (K k^2) and G(r) -> 1 / (4 pi K r), K the husk-axis stiffness,
//    computed exactly by second-order perturbation of the zero mode (cusp-green stiffness). The husk alone has K = 1.
//
// DERIVED BEFORE THE GATE RUN.
// 1. THE HUSK IS THE TOP OF THE MESH. Each husk cell touches the cusp; its 6 husk facets meet its husk neighbours and
//    its other 18 lead down (E-SPN-0184's 18 down slots). Nothing lies above. In the upper half-space picture with the
//    cusp at infinity, a cell at level l has height about 1/l, so its horizontal size in husk units is about 1/l:
//    the deeper a cell, the smaller its horizontal step. The hyperbolic geodesic between two husk points rises toward
//    the cusp, through the husk cells' own interiors, which the graph collapses into one step per husk spacing.
// 2. LEMMA (exact once its input is measured): if a link whose shallower end is at level l moves each horizontal
//    coordinate by at most 1/l, every link moves each coordinate by at most 1, so a path between husk cells at offset
//    r has at least |r|_inf steps. With G = sum_n A^n / 24^(n+1), (A^n)_{0r} = 0 for n < |r|_inf, and the infinite
//    graph's adjacency norm is 24 rho with rho < 1 (the mesh is non-amenable, Kesten 1959), G(r) <= rho^|r|_inf /
//    (24 (1 - rho)). So G falls exponentially along the husk: no power law, a massive brane mode. The bulk acts as a
//    sink: a husk walker steps down with probability 18/24 and the transient bulk rarely returns it.
// 3. THE SCALE. If the bulk never returned a walker, the husk would be the cubic lattice with operator 24 - A, whose
//    axis decay is e^(-mu0 r) with cosh(mu0) = 10, mu0 = 2.9932 per dock. Returns lower the effective mass, so the
//    true decay is somewhat slower. The cubic lattice decays faster along a body diagonal than along an axis per unit
//    Euclidean length, so the anisotropy does not fall with r: it grows.
// 4. THE REFLECTING FLOOR. A zero mode makes the husk's static field 1/r at long range with strength 1/K. Each odd
//    level adds about l^2 cells per window with horizontal steps about 1/l, so each level adds about one unit of
//    stiffness, and K grows without bound with the floor: Newton's coupling 1/(4 pi K) of a finite bulk falls as one
//    over its depth, and vanishes for the infinite mesh, where the Dirichlet reading holds.
//
// PROBES BEFORE THE GATES, DISCLOSED (tmp/hg-probe1.ts to tmp/hg-probe4.ts, under 30 s each). The quotient at floors 9,
//  17, 33: 0 missing neighbours, 0 inconsistent steps, window counts per level equal to E-CSM-0060's, and the largest
//  horizontal step at level l exactly 1/l. Dirichlet G on N = 16 at floors 9 and 17: G(0) 0.04358, G(1,0,0) 1.926e-3,
//  G(2,0,0) 8.58e-5, axis ratios about 22 a dock, G(1,1,1) 2.25e-5, G(2,2,2) 2.92e-8, floors 9 and 17 within 1 percent
//  at r = 8 (whose value carried a periodic image at N = 16). The control (24 - A on the cubic lattice, N = 32)
//  against the Bessel integral: 2e-15 relative at r <= 4, 3.5e-6 at (8,0,0), the transform's float floor. The
//  reflecting stiffness: K 1 at floor 1 (the husk alone), 5.9966 at floor 9 (direct solve at k = 2 pi / 512 within
//  3.4e-5), 20.229 at floor 33. So P1, P2 and P3 below were seen at small size, and H2's ratio was set from floors 9
//  and 33 (K over the number of levels 1.199 and 1.190). The gate run extends to N = 32 and floors 17 and 49, which the
//  probes did not run, and holds the routes to their own words.
//
// HYPOTHESES AND GATES, fixed before the gate run, never moved.
//  I1 INSTRUMENT: every quotient (floors 1, 9, 17, 33, 49) has 0 missing in-range neighbours, 0 inconsistent steps and
//     every level an integer, and its window counts per level equal E-CSM-0060's (1, 12, 30, 56, 108, 132, 182, 360,
//     306, 380, 672, 552, 750, 972, 870, 992, 1584 to level 33); the largest horizontal step times the shallower level
//     is 1 to 1e-9 at every level (the lemma's input); every Bloch solve's true residual is under 1e-12 and its
//     imaginary part under 1e-12; six momenta off the wedge, permuted and negated, give the wedge value to 1e-10
//     relative; the Bloch transform on N = 4 at floor 9 equals a direct solve on the unfolded 4^3 periodic box at
//     all 64 husk offsets to 1e-10 relative; at floor 9 the stiffness from perturbation and from a direct reflecting
//     solve at k = 2 pi / 512 agree to 1e-3 relative.
//  C1 CONTROL: the same transform on the cubic lattice with operator 24 - A (the husk with an absorbing bulk) equals
//     the Bessel integral to 1e-8 relative at (0,0,0) to (6,0,0), (1,1,0), (1,1,1), (2,2,2), and to 1e-4 at (8,0,0).
//  F1 FLOOR: Dirichlet G at the axis offsets 0 to 8 and at (1,1,1), (2,2,2) agrees between floors 33 and 49 to 1e-3
//     relative (the floor has stopped mattering on the offsets read).
//  H1 THE ROUTE (H3b as written): along the husk axis r G(r) does not fall from r = 4 to r = 8 (the field falls no
//     faster than 1/r), at floor 49.
//  P1 THE FALSIFIER (point 2): every axis decay rate mu(r) = ln(G(r) / G(r + 1)) for r = 1 to 7 is at least 2. A power
//     law r^(-p) would give mu(7) = p ln(8/7), under 2 for any p below 15, and I11a's slow falloff (Delta near 0) far
//     less. P1 kills H3b and I11a together.
//  P2 (I12b): the decay rate per unit Euclidean length along the body diagonal, ln(G(2,2,2) / G(4,4,4)) / (2 sqrt 3),
//     and along the axis, ln(G(4,0,0) / G(8,0,0)) / 4, differ by more than 10 percent: the cubic pattern does not fall
//     as (k b)^2 on the offsets read.
//  P3 (H3b's number): 1 / K at the floor of four levels below the husk (floor 9, the depth of E-GRV-0100's stack) is
//     not within 5 percent of E-GRV-0100's 0.549.
//  H2 THE REFLECTING FLOOR (point 4): K rises strictly through floors 1, 9, 17, 33, 49, and K(49) / K(17) is within
//     10 percent of 25 / 9, the ratio of the number of levels (one unit of stiffness a level, near 1.19).
// VERDICT, fixed before the run: FAIL (as derived) when I1, C1, F1 and P1 hold (H3b and I11a fail: a massive brane
//  mode); PASS when I1, C1, F1 and H1 hold; PARTIAL otherwise. P2, P3 and H2 are reported and do not move the status.
// WHAT THIS CAN AND CANNOT SHOW. It reads the graph Laplacian of the true mesh, the simplest massless field on it; it
//  does not run the rule. A fail rules out the bulk's own harmonic function as Newton's kernel on this mesh, with the
//  husk as the cusp layer; it does not touch the depth register (E-GRV-0090, 0148), which is an added piece, nor a
//  field with a different kinetic term. The reflecting reading shows what a bulk with a floor would give, not that the
//  mesh has one.
//
// FIRST RUN 2026-10-02 (tmp/hg-grv-run1.log, 88 s): PARTIAL, every gate as registered, none moved or rerun. I1 missed
//  on one check: the direct reflecting solve at k = 2 pi / 512 (the stiffness cross-check) ended with a true residual
//  of 3.7e-11 against its 1e-12 gate, on a value of 1107, so 3e-14 of it, the float floor of a solve near a zero mode
//  (tmp/hg-probe5.ts, after the run). Its answer agrees with the perturbative K to 3.5e-5. Every other I1 check held:
//  the quotients exact at floors 1 to 49 (25,083 cells a husk cell at 49), the lemma's input 1 to 2.9e-12 at every
//  level, every Bloch residual under 1e-12, the off-wedge momenta equal to 0, the 4^3 box against the transform to
//  6.0e-12, the stiffness solves' residuals under 1e-12. C1 8.4e-9 (tight) and 3.5e-6 (at 8), F1 2.3e-4. H1 fails and
//  P1 holds: G along the axis 0.04359, 1.927e-3, 8.583e-5, 3.854e-6, 1.744e-7, 7.95e-9, 3.65e-10, 1.69e-11, 7.89e-13,
//  decay rates 3.111 falling to 3.066 a dock (the local power exponent climbs 4.5, 7.7, 10.8, ... 23.0), a brane mode
//  of length 0.325 docks against the absorbing husk's 0.334, so the bulk's returns lower the mass by 3 percent. P2: per
//  unit length 3.682 along the diagonal against 3.077 along the axis, 20 percent apart. P3: the four-level share 1/K is
//  0.1668. H2: K 1, 5.997, 10.701, 20.229, 29.823 at floors 1, 9, 17, 33, 49, K(49)/K(17) 2.787 against 2.778, about
//  1.19 a level. Dirichlet G(0) 0.0435817, 0.0435918, 0.0435925 at floors 17, 33, 49.
//
// Depth L1: exact linear algebra on the true mesh against a derived prediction; no rule is run.
// DETERMINISM: the mesh, its quotients and the momentum grid are fixed; no start, no random number.

import { experiment } from '@/test/scaffold/suite'
import { verdict, type Verdict } from '@/test/scaffold/verdict'
import {
  besselLatticeGreen,
  blochSolve,
  buildCuspQuotient,
  cubicGraph,
  fieldAt,
  huskTransform,
  quotientGraph,
  stiffness,
  type CuspQuotient,
  type HuskField,
  type PeriodicGraph,
} from '@/code/measure/cusp-green'

export type GreenPlan = {
  side: number
  floors: number[]
  read: number
  check: number
  boxSide: number
  boxFloor: number
  stiffFloors: number[]
  shallow: number
  directSide: number
}

export const GATE_PLAN: GreenPlan = {
  side: 32,
  floors: [17, 33, 49],
  read: 49,
  check: 33,
  boxSide: 4,
  boxFloor: 9,
  stiffFloors: [1, 9, 17, 33, 49],
  shallow: 9,
  directSide: 512,
}

// E-CSM-0060's window counts per odd level, 1 to 33
const WINDOW_COUNTS = [
  1, 12, 30, 56, 108, 132, 182, 360, 306, 380, 672, 552, 750, 972, 870,
  992, 1584,
]

const huskCell = (q: CuspQuotient): number =>
  Array.from(q.level).indexOf(1)

function dirichletField(q: CuspQuotient, side: number): HuskField {
  const g = quotientGraph(q, 'dirichlet')
  const source = huskCell(q)

  return huskTransform(side, k => {
    const s = blochSolve(g, k, source)

    return {
      re: s.re[source]!,
      im: s.im[source]!,
      residual: s.residual,
      iterations: s.iterations,
    }
  })
}

// the unfolded side^3 periodic box of a quotient, as a graph with no shifts (a k = 0 solve is the real solve)
function unfold(g: PeriodicGraph, side: number): PeriodicGraph {
  const n = g.cells * side ** 3
  const neighbour = new Int32Array(n * g.width).fill(-1)
  const diagonal = new Float64Array(n)
  const w = (v: number): number => ((v % side) + side) % side
  const id = (a: number, x: number, y: number, z: number): number =>
    ((x * side + y) * side + z) * g.cells + a

  for (let x = 0; x < side; x++) {
    for (let y = 0; y < side; y++) {
      for (let z = 0; z < side; z++) {
        for (let a = 0; a < g.cells; a++) {
          const here = id(a, x, y, z)

          diagonal[here] = g.diagonal[a]!

          for (let d = 0; d < g.width; d++) {
            const e = a * g.width + d
            const b = g.neighbour[e]!

            if (b < 0) {
              continue
            }

            neighbour[here * g.width + d] = id(
              b,
              w(x + g.shift[3 * e]!),
              w(y + g.shift[3 * e + 1]!),
              w(z + g.shift[3 * e + 2]!),
            )
          }
        }
      }
    }
  }

  return {
    cells: n,
    width: g.width,
    neighbour,
    shift: new Int32Array(3 * n * g.width),
    diagonal,
  }
}

const relative = (a: number, b: number): number =>
  Math.abs(a - b) / Math.max(Math.abs(a), Math.abs(b))

export function horosphereGreenRun(plan: GreenPlan): Verdict {
  const started = Date.now()
  const log = (what: string): void =>
    console.error(
      `${what} ${Math.round((Date.now() - started) / 1000)}s`,
    )

  // ---- quotients ----
  const floors = [
    ...new Set([...plan.stiffFloors, ...plan.floors, plan.boxFloor]),
  ].sort((a, b) => a - b)
  const quotients = new Map<number, CuspQuotient>()

  for (const f of floors) {
    quotients.set(f, buildCuspQuotient(f))
    log(`quotient ${f}: ${quotients.get(f)!.cells} cells`)
  }

  let quotientsExact = true
  let worstLemma = 0

  for (const [f, q] of quotients) {
    const counts = new Map<number, number>()

    for (const l of q.level) {
      counts.set(l, (counts.get(l) ?? 0) + 1)
    }

    const countsAgree = WINDOW_COUNTS.every(
      (c, i) => 2 * i + 1 > f || counts.get(2 * i + 1) === c,
    )

    for (const v of q.worstStepTimesLevel.values()) {
      worstLemma = Math.max(worstLemma, Math.abs(v - 1))
    }

    quotientsExact &&=
      q.missing === 0 &&
      q.inconsistent === 0 &&
      q.offInteger === 0 &&
      countsAgree
  }

  const lemma = worstLemma < 1e-9

  // ---- Dirichlet fields ----
  const fields = new Map<number, HuskField>()

  for (const f of plan.floors) {
    fields.set(f, dirichletField(quotients.get(f)!, plan.side))
    log(`dirichlet ${f}: ${fields.get(f)!.solves} solves`)
  }

  const solvesClean = [...fields.values()].every(
    f => f.worstResidual < 1e-12 && f.worstImaginary < 1e-12,
  )

  // ---- symmetry off the wedge ----
  const readQ = quotients.get(plan.read)!
  const readG = quotientGraph(readQ, 'dirichlet')
  const source = huskCell(readQ)
  const unit = (2 * Math.PI) / plan.side
  const wedge = blochSolve(
    readG,
    [1, 3, 5].map(v => v * unit),
    source,
  ).re[source]!
  const offWedge = [
    [5, -3, 1],
    [-1, 5, 3],
    [3, 1, -5],
    [-5, -1, -3],
    [1, -5, 3],
    [3, -5, -1],
  ].map(
    m =>
      blochSolve(
        readG,
        m.map(v => v * unit),
        source,
      ).re[source]!,
  )
  const symmetryGap = Math.max(...offWedge.map(v => relative(v, wedge)))
  const symmetric = symmetryGap < 1e-10

  log('symmetry')

  // ---- the transform against a direct periodic box ----
  const boxQ = quotients.get(plan.boxFloor)!
  const boxG = quotientGraph(boxQ, 'dirichlet')
  const boxSource = huskCell(boxQ)
  const bloch = dirichletField(boxQ, plan.boxSide)
  const direct = blochSolve(
    unfold(boxG, plan.boxSide),
    [0, 0, 0],
    boxSource,
  )

  let boxGap = 0

  for (let x = 0; x < plan.boxSide; x++) {
    for (let y = 0; y < plan.boxSide; y++) {
      for (let z = 0; z < plan.boxSide; z++) {
        const at =
          ((x * plan.boxSide + y) * plan.boxSide + z) * boxQ.cells +
          boxSource

        boxGap = Math.max(
          boxGap,
          relative(direct.re[at]!, fieldAt(bloch, x, y, z)),
        )
      }
    }
  }

  const boxAgrees = boxGap < 1e-10 && direct.residual < 1e-12

  log('box')

  // ---- reflecting stiffness ----
  const K = new Map<number, number>()

  let stiffClean = true

  for (const f of plan.stiffFloors) {
    const s = stiffness(quotients.get(f)!, 0)

    K.set(f, s.K)
    stiffClean &&= f === 1 || s.residual < 1e-10
  }

  const shallowQ = quotients.get(plan.shallow)!
  const kDirect = (2 * Math.PI) / plan.directSide
  const reflect = blochSolve(
    quotientGraph(shallowQ, 'reflecting'),
    [kDirect, 0, 0],
    huskCell(shallowQ),
  )
  const KDirect = 1 / (kDirect ** 2 * reflect.re[huskCell(shallowQ)]!)
  const stiffAgrees =
    relative(KDirect, K.get(plan.shallow)!) < 1e-3 &&
    reflect.residual < 1e-12 &&
    stiffClean

  log('stiffness')

  const i1 =
    quotientsExact &&
    lemma &&
    solvesClean &&
    symmetric &&
    boxAgrees &&
    stiffAgrees

  // ---- C1: the absorbing husk against the Bessel integral ----
  const cubic = cubicGraph(24)
  const control = huskTransform(plan.side, k => {
    const s = blochSolve(cubic, k, 0)

    return {
      re: s.re[0]!,
      im: s.im[0]!,
      residual: s.residual,
      iterations: s.iterations,
    }
  })
  const tight = [
    [0, 0, 0],
    [1, 0, 0],
    [2, 0, 0],
    [3, 0, 0],
    [4, 0, 0],
    [5, 0, 0],
    [6, 0, 0],
    [1, 1, 0],
    [1, 1, 1],
    [2, 2, 2],
  ]
  const controlTight = Math.max(
    ...tight.map(([x, y, z]) =>
      relative(
        fieldAt(control, x!, y!, z!),
        besselLatticeGreen(24, x!, y!, z!),
      ),
    ),
  )
  const controlFar = relative(
    fieldAt(control, 8, 0, 0),
    besselLatticeGreen(24, 8, 0, 0),
  )
  const c1 = controlTight < 1e-8 && controlFar < 1e-4

  log('control')

  // ---- F1 ----
  const G = fields.get(plan.read)!
  const Gc = fields.get(plan.check)!
  const floorOffsets = [
    ...Array.from({ length: 9 }, (_, r) => [r, 0, 0]),
    [1, 1, 1],
    [2, 2, 2],
  ]
  const floorGap = Math.max(
    ...floorOffsets.map(([x, y, z]) =>
      relative(fieldAt(G, x!, y!, z!), fieldAt(Gc, x!, y!, z!)),
    ),
  )
  const f1 = floorGap < 1e-3

  // ---- H1, P1, P2, P3, H2 ----
  const axis = Array.from({ length: 9 }, (_, r) => fieldAt(G, r, 0, 0))
  const rG = axis.map((v, r) => r * v)
  const h1 = rG[8]! >= rG[4]!
  const mu = axis.slice(0, 8).map((v, r) => Math.log(v / axis[r + 1]!))
  const p1 = mu.slice(1, 8).every(m => m >= 2)
  const exponent = mu.map((m, r) =>
    r ? m / Math.log((r + 1) / r) : NaN,
  )
  const muAxis = Math.log(axis[4]! / axis[8]!) / 4
  const muDiagonal =
    Math.log(fieldAt(G, 2, 2, 2) / fieldAt(G, 4, 4, 4)) /
    (2 * Math.sqrt(3))
  const p2 = Math.abs(muDiagonal / muAxis - 1) > 0.1
  const share = 1 / K.get(plan.shallow)!
  const p3 = Math.abs(share / 0.549 - 1) > 0.05
  const Ks = plan.stiffFloors.map(f => K.get(f)!)
  const levels = (f: number): number => (f + 1) / 2
  const KRatio = K.get(49)! / K.get(17)!
  const h2 =
    Ks.every((v, i) => i === 0 || v > Ks[i - 1]!) &&
    Math.abs(KRatio / (levels(49) / levels(17)) - 1) < 0.1
  const mu0 = Math.acosh(10)

  const status =
    i1 && c1 && f1 && p1
      ? 'fail'
      : i1 && c1 && f1 && h1
        ? 'pass'
        : 'partial'

  const metrics: Record<string, number> = {
    gate_I1: i1 ? 1 : 0,
    gate_C1: c1 ? 1 : 0,
    gate_F1: f1 ? 1 : 0,
    gate_H1: h1 ? 1 : 0,
    gate_P1: p1 ? 1 : 0,
    gate_P2: p2 ? 1 : 0,
    gate_P3: p3 ? 1 : 0,
    gate_H2: h2 ? 1 : 0,
    quotientsExact: quotientsExact ? 1 : 0,
    lemmaWorst: worstLemma,
    symmetryGap,
    boxGap,
    stiffnessDirectGap: relative(KDirect, K.get(plan.shallow)!),
    stiffnessDirectResidual: reflect.residual,
    stiffnessDirectValue: reflect.re[huskCell(shallowQ)]!,
    controlTight,
    controlFar,
    floorGap,
    G0: axis[0]!,
    ...Object.fromEntries(
      axis.slice(1).map((v, r) => [`G_axis${r + 1}`, v]),
    ),
    G_110: fieldAt(G, 1, 1, 0),
    G_111: fieldAt(G, 1, 1, 1),
    G_222: fieldAt(G, 2, 2, 2),
    G_333: fieldAt(G, 3, 3, 3),
    G_444: fieldAt(G, 4, 4, 4),
    ...Object.fromEntries(mu.map((m, r) => [`mu_axis${r}`, m])),
    muAxis,
    muDiagonal,
    mu0,
    huskShare9: share,
    ...Object.fromEntries(
      plan.stiffFloors.map(f => [`K_floor${f}`, K.get(f)!]),
    ),
    KRatio49over17: KRatio,
    ...Object.fromEntries(
      floors.map(f => [`cells_floor${f}`, quotients.get(f)!.cells]),
    ),
    seconds: (Date.now() - started) / 1000,
  }

  return verdict({
    status,
    claim: `${p1 ? "the bulk mesh's own Green's function does not give Newton's 1/r on the husk" : "the bulk mesh's Green's function was read on the husk"}: on the true {3,4,3,4} mesh below a cusp (floor at level ${plan.read}, ${readQ.cells} cells a husk cell, ${G.solves} Bloch solves) the graph Laplacian's inverse falls along the husk axis as ${axis
      .slice(0, 5)
      .map(v => v.toExponential(3))
      .join(', ')} at r = 0 to 4, a decay rate of ${mu
      .slice(1, 8)
      .map(m => m.toFixed(3))
      .join(
        ', ',
      )} a dock, exponential and not a power law (r G(r) falls from ${rG[4]!.toExponential(2)} at r = 4 to ${rG[8]!.toExponential(2)} at 8), because the husk is the top layer and every link moves at most 1/level horizontally, so the bulk is a sink, not a shortcut: a massive brane mode of length ${(1 / muAxis).toFixed(3)} docks (the absorbing husk alone gives ${(1 / mu0).toFixed(3)}); the cubic pattern grows with distance (diagonal ${muDiagonal.toFixed(3)} against axis ${muAxis.toFixed(3)} per unit length); a reflecting floor gives 1/(4 pi K r) with K ${Ks.map(v => v.toFixed(3)).join(', ')} at floors ${plan.stiffFloors.join(', ')}, growing with the depth, so a finite bulk's Newton coupling falls as one over its depth and the four-level share is ${share.toFixed(3)}, not 0.549`,
    metrics,
    control: {
      controlTight,
      controlFar,
      mu0,
      K_husk: K.get(1)!,
    },
    notes: `L1. Gates I1 ${i1} (quotients ${quotientsExact}, lemma ${lemma} worst ${worstLemma.toExponential(2)}, solves ${solvesClean}, symmetry ${symmetric} ${symmetryGap.toExponential(2)}, box ${boxAgrees} ${boxGap.toExponential(2)}, stiffness ${stiffAgrees} direct ${KDirect.toFixed(5)}), C1 ${c1} (${controlTight.toExponential(2)}, far ${controlFar.toExponential(2)}), F1 ${f1} (${floorGap.toExponential(2)} between floors ${plan.check} and ${plan.read}), H1 ${h1}, P1 ${p1}, P2 ${p2}, P3 ${p3}, H2 ${h2} (K(49)/K(17) ${KRatio.toFixed(4)} against ${(levels(49) / levels(17)).toFixed(4)}; K per level ${plan.stiffFloors.map(f => (K.get(f)! / levels(f)).toFixed(4)).join(', ')}). Axis local exponent ln(G(r)/G(r+1))/ln((r+1)/r): ${exponent
      .slice(1)
      .map(e => e.toFixed(2))
      .join(
        ', ',
      )}. Floors: ${floors.map(f => `${f}: ${quotients.get(f)!.cells} cells, region ${quotients.get(f)!.regionCells}, ${quotients.get(f)!.floorLinks} floor links`).join('; ')}. Dirichlet G(0) by floor: ${plan.floors.map(f => `${f}: ${fieldAt(fields.get(f)!, 0, 0, 0).toPrecision(10)}`).join(', ')}. ${((Date.now() - started) / 1000).toFixed(0)} s.`,
  })
}

export default experiment({
  id: 'gravity/horosphere-green',
  code: 'E-GRV-0150',
  title:
    "the bulk mesh's own Green's function read on the husk, partial (the direct reflecting cross-check's residual missed its 1e-12 gate at 3.7e-11, 3e-14 of its value, the float floor), every physics gate as derived: the graph Laplacian's inverse on the true {3,4,3,4} mesh below a cusp falls exponentially along the husk, 3.07 to 3.11 a dock (0.0436, 1.93e-3, 8.58e-5, ... 7.9e-13 at r = 8), not as any power, because the husk is the top layer and a link at level l moves at most 1/l horizontally, so the bulk is a sink and not a shortcut: a massive brane mode of length 0.325 docks, which kills H3b (Newton's kernel) and I11a (a power-law spectrum), and the cubic pattern grows with distance (3.68 against 3.08 per unit length), which kills I12b; a reflecting floor gives 1/(4 pi K r) with K growing 1.19 a level (1, 6.00, 10.70, 20.23, 29.82 at floors 1 to 49), so a finite bulk's Newton coupling falls as one over its depth, and the four-level share 1/K = 0.167 is not E-GRV-0100's 0.549",
  category: 'gravity',
  substrates: ['3434'],
  depth: 'L1',
  paper: false,
  run() {
    return horosphereGreenRun(GATE_PLAN)
  },
})
