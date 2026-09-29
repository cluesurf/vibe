// The piece E-GRV-0139 left open (note/research/vibe/roadmap/remaining-pieces.md, "The spacetime slide"): the linear
// spacetime slide forces the ADM structure (lapse and shift multipliers, DeWitt's kinetic term, linearized
// Einstein-Hilbert potential), but the TT speed stays free, because at quadratic order the kinetic part (with the lapse's
// constraint) and the potential part are each invariant alone. The Deser / Feynman / Wald bootstrap says the next order
// ties them; Horava-Lifshitz gravity says a foliation-preserving slide does not.
//
// THE DERIVATION, before computing (the continuum, small k; the lattice adds only higher powers of k, and its symmetry
// O_h is kept in the ansatz rather than rotations, so isotropy is still derived, not assumed).
//   The ADM action with foliation-preserving symmetry, to cubic order and two derivatives, is
//     S = int dt d^3x N sqrt(g) [ alpha (K_ij K^ij - lambda K^2) + beta R + eta a_i a^i ] + (O_h anisotropies),
//   K_ij = (dt g_ij - D_i N_j - D_j N_i) / 2N, a_i = d_i ln N. Its free couplings: alpha, lambda, beta (the TT speed
//   squared is beta / alpha), eta. Under xi^0 = f(t) and xi^i(t, x) each term is invariant on its own.
//   The full slide adds xi^0(t, x). Its linear action (delta n = D_0 xi^0, delta N_i = -D_i xi^0 + ...) shifts
//   K_ij by -D_i D_j xi^0: the kinetic term moves by alpha (D_i D_j K^ij - lambda D^2 K) xi^0, which the lapse's
//   constraint n R_lin can cancel only if lambda = 1 and its coefficient is tied to alpha / c^2 (E-GRV-0139's result).
//   The potential's quadratic part (sqrt g R)_2 is invariant alone at that order, so beta is free there.
//   At cubic order, the time component's transport (xi^0 D_0 h, N D xi^0, n D_0 xi^0) moves (sqrt g R)_2 by
//   xi^0 D_0 (sqrt g R)_2, which only the cubic lapse term n (sqrt g R)_2 can cancel, and the spatial slide's
//   nonlinear part ties n (sqrt g R)_2 to n R_lin. So the chain beta -> n (sqrt g R)_2 -> n R_lin -> alpha / c^2
//   closes: beta = alpha c^2, the speed is c. Under a foliation slide the middle link (xi^0 depending on x) is absent,
//   and nothing reaches alpha.
//   The doublet: the docks carry its values (delta d = xi . D d, no index rotation). Two transported scalars can couple
//   covariantly (sqrt(-g) g^mn D d D d), which fixes their own speed to c; a linear coupling d_A (Ricci)_Eg projects a
//   tensor with a fixed cube-frame tensor, which a local rotation moves, so it should be forced out.
//
// THE COMPUTATION, exact over GF(p) for two primes (code/measure/cubic-slide, code/algebra/jet-polynomial). Fields
// h_ij, N_i, n and the doublet d_A; the ansatz is every O_h-invariant sum of d phi d phi and phi d phi d phi (these span
// every quadratic and cubic two-derivative Lagrangian up to a total derivative): 48 quadratic and 454 cubic columns.
// Invariance: delta0 S2 and delta0 S3 + delta1 S2 total derivatives, decided by the Euler derivative in xi. Couplings
// are read from the quadratic kernel q_ab(omega, k), which ignores total derivatives.
//
// THE GATES, fixed before computing:
//   Y1  full slide at cubic order: the metric kinetic block is a multiple of DeWitt with lambda = 1, and nonzero
//   Y2  full slide at cubic order: the TT speed is one value, c: the cross polarization's kinetic mu and gradient
//       gamma are proportional over the family (rank 1, mu rank 1) with gamma + c^2 mu = 0, along an axis and a face
//       diagonal, the mode decoupled, for c = 1, 2 and 3
//   Y3  control: the foliation slide at cubic order leaves the speed free: (mu, gamma) rank 2
//   Y4  reported: whether the Eg doublet keeps a kinetic term at cubic order, at what speed, and whether its linear
//       coupling to the metric survives
//   controls
//     C1 the linear slide (order-1 condition alone) reproduces E-GRV-0139 in the continuum: lambda = 1, speed free
//     C2 Fierz-Pauli (linearized Einstein-Hilbert written in H_mn, an independent route) is in the family's span
//     C3 the hand-expanded sqrt(-g) g^mn D s D s is invariant to cubic order at speed c, and not at speed^2 2 c^2
//     the two primes agree on every count
// Status: pass if Y1, Y2, Y3 and the controls hold; partial if the controls, Y1 and Y3 hold and Y2 fails; fail else.
//
// Variants, gating nothing: the frozen-time slide (xi^0 acts linearly only, its transport dropped: not a group, a probe
// of which terms tie the speed).
//
// WHAT IS PUT IN. The ADM variables and the Lie derivative (the slide of the docks with x^0 = c t, the light's c); the
// doublet transported as values; an O_h-symmetric, local, two-derivative action. L1: the bootstrap read in ADM
// variables, known math (Deser 1970, Wald 1986; Horava 2009 for the foliation control).
//
// WHAT CAME OUT (2026-09-27). Pass on every gate, both primes agreeing, 1.7 s.
//   Y1  full slide: metric kinetic rank 1, exactly DeWitt with lambda = 1 (residual rank 0)
//   Y2  full slide: the quadratic metric kernel has rank 1 and Fierz-Pauli is in it, so the family's metric sector IS
//       linearized Einstein-Hilbert: (mu, gamma) rank 1 with gamma + c^2 mu = 0 on the axis and the face diagonal,
//       the mode decoupled, at c = 1, 2 and 3. With the metric alone (257 columns) exactly 1 genuine invariant is left
//   Y3  foliation slide: metric kernel rank 4, which is Horava's non-projectable count (alpha, lambda, beta, eta):
//       (mu, gamma) rank 2 and (mu, q_xx,yy) rank 2, so the speed and lambda are both free, and (d n)^2 is allowed
//   Y4  the doublet, carried as values, keeps kinetic rank 1 with its gradient forced onto the light cone (the
//       anisotropic O_h gradient and first-order terms, rank 2 under the linear slide, go to 0) and its linear
//       couplings to the metric (rank 2 under the linear slide) forced to 0: it survives as two minimally coupled
//       scalars at speed c, not as part of gravity. The foliation slide already kills the couplings (the spatial slide's
//       local rotation does it) but leaves the doublet's speed free
//   C1  the linear slide: lambda = 1, speed free (rank 2), metric kernel rank 2: E-GRV-0139's result in the continuum
//   C2  Fierz-Pauli in the span under the full and the linear slide
//   C3  the hand-expanded minimal scalar: 0 residual rows at speed c (c = 1, 2, 3), 12 at speed^2 2 c^2
//   frozen-time probe: xi^0 with its linear action only leaves no metric kinetic term (mu rank 0) and the potential
//   alone: the time component's transport is what lets the kinetic term and the potential live together
//
// DETERMINISM: nothing is drawn. Every count is an exact rank.

import {
  addScaled,
  nullSpaceOfRows,
  parseMono,
  type Poly,
} from '@/code/algebra/jet-polynomial'
import {
  primeBelow,
  rankMod,
} from '@/code/algebra/linear/modular-linear'
import {
  cubicAnsatz,
  DOUBLET,
  type Ansatz,
  fierzPauli,
  kernelKey,
  minimalScalar,
  monomialEquations,
  monomialRows,
  quadraticKernel,
  rowContext,
  type SlideKind,
} from '@/code/measure/cubic-slide'
import { experiment } from '@/test/scaffold/suite'
import { verdict } from '@/test/scaffold/verdict'

const PRIMES = [primeBelow(2 ** 25), primeBelow(2 ** 24)]
const ANSATZ = cubicAnsatz(12, true)
const WIDTH = ANSATZ.columns.length
// the metric alone (no doublet): how many genuine invariants the full slide leaves on h, N and n
const METRIC_ANSATZ = cubicAnsatz(10, true)

type Variant = {
  name: string
  kind: SlideKind
  c: number
  maxOrder: 1 | 2
}

const VARIANTS: readonly Variant[] = [
  { name: 'full', kind: 'full', c: 1, maxOrder: 2 },
  { name: 'full c 2', kind: 'full', c: 2, maxOrder: 2 },
  { name: 'full c 3', kind: 'full', c: 3, maxOrder: 2 },
  { name: 'linear', kind: 'full', c: 1, maxOrder: 1 },
  { name: 'foliation', kind: 'foliation', c: 1, maxOrder: 2 },
  { name: 'frozen-time', kind: 'frozen-time', c: 1, maxOrder: 2 },
]

// a functional on the quadratic kernel: weighted kernel keys
type Functional = readonly (readonly [string, number])[]

const XY = 3
const XZ = 4
const YZ = 5
const k = kernelKey
const METRIC_PAIRS: [number, number][] = []

for (let s = 0; s < 6; s++) {
  for (let t = s; t < 6; t++) {
    METRIC_PAIRS.push([s, t])
  }
}

// DeWitt with lambda = 1 in the q form (|dh|^2 - (tr dh)^2): diagonal slots 0, diagonal pairs -2, off-diagonal slots 2
const dewitt = (s: number, t: number): number =>
  s === t ? (s < 3 ? 0 : 2) : s < 3 && t < 3 ? -2 : 0

const ALL_KEYS = (a: number, b: number): string[] => {
  const out: string[] = []

  for (let m = 0; m < 4; m++) {
    for (let n = m; n < 4; n++) {
      out.push(k(a, b, m, n))
    }
  }

  return out
}

type Reads = {
  invariant: number
  genuine: number
  rows: number
  metricKinetic: number
  dewittResidual: number
  lambdaPair: number
  mu: number
  pair: number
  tied: number
  decoupled: number
  faceMu: number
  facePair: number
  faceTied: number
  faceDecoupled: number
  auxKinetic: number
  lapseLapse: number
  metricKernel: number
  fierzPauliInSpan: boolean
  doubletKinetic: number
  doubletOffLight: number
  doubletMixing: number
}

function analyse(
  v: Variant,
  p: number,
  eomRank: number,
  ansatz: Ansatz = ANSATZ,
): Reads {
  const width = ansatz.columns.length
  const ctx = rowContext(
    { kind: v.kind, c: v.c, p, doublet: true },
    v.maxOrder,
  )
  const memo = new Map<string, Poly>()
  const rows = new Map<string, Map<number, number>>()

  ansatz.columns.forEach((column, col) => {
    const total: Poly = new Map()

    for (const [key, coef] of column) {
      let r = memo.get(key)

      if (!r) {
        r = monomialRows(ctx, parseMono(key))
        memo.set(key, r)
      }

      addScaled(total, r, ((coef % p) + p) % p, p)
    }

    for (const [rk, val] of total) {
      if (!rows.has(rk)) {
        rows.set(rk, new Map())
      }

      rows.get(rk)!.set(col, val)
    }
  })

  const { basis } = nullSpaceOfRows(rows.values(), width, p)
  const dim = basis.length
  // each member's quadratic kernel
  const kernels = ansatz.columns.map((column, col) => {
    if (!ansatz.quadratic[col]) {
      return new Map<string, number>()
    }

    const modded: Poly = new Map()

    addScaled(modded, column, 1, p)

    return quadraticKernel(modded, p)
  })
  const members = basis.map(theta => {
    const out: Poly = new Map()

    theta.forEach(
      (x, col) =>
        x !== 0 &&
        kernels[col]!.size > 0 &&
        addScaled(out, kernels[col]!, x, p),
    )

    return out
  })
  const value = (f: Functional, m: Poly): number =>
    f.reduce(
      (t, [key, w]) =>
        (t + (((m.get(key) ?? 0) * (((w % p) + p) % p)) % p)) % p,
      0,
    )
  const rank = (fs: readonly Functional[]): number =>
    dim === 0 || fs.length === 0
      ? 0
      : rankMod(
          fs.map(f => members.map(m => value(f, m))),
          dim,
          p,
        )
  const one = (key: string): Functional => [[key, 1]]
  const c2 = v.c * v.c

  const kinetic = METRIC_PAIRS.map(([s, t]) => one(k(s, t, 0, 0)))
  const residual = METRIC_PAIRS.map(
    ([s, t]): Functional => [
      [k(s, t, 0, 0), 2],
      [k(XY, XY, 0, 0), -dewitt(s, t)],
    ],
  )
  const mu = one(k(XY, XY, 0, 0))
  const gamma = one(k(XY, XY, 3, 3))
  const tied: Functional = [
    [k(XY, XY, 3, 3), 1],
    [k(XY, XY, 0, 0), c2],
  ]
  const decoupled: Functional[] = [one(k(XY, XY, 0, 3))]

  for (let b = 0; b < 12; b++) {
    if (b !== XY) {
      for (const [m, n] of [
        [0, 0],
        [0, 3],
        [3, 3],
      ] as const) {
        decoupled.push(one(k(XY, b, m, n)))
      }
    }
  }

  // the cross polarization on the face diagonal (1, 1, 0): h_xz = 1, h_yz = -1
  const face = (m: number, n: number): Functional => [
    [k(XZ, XZ, m, n), 1],
    [k(YZ, YZ, m, n), 1],
    [k(XZ, YZ, m, n), -1],
  ]
  const faceMu = face(0, 0)
  const faceGamma = [...face(1, 1), ...face(2, 2), ...face(1, 2)]
  const faceTied: Functional = [
    ...faceGamma,
    ...faceMu.map(([key, w]): [string, number] => [key, 2 * c2 * w]),
  ]
  const faceDecoupled = [[...face(0, 1), ...face(0, 2)]]

  const aux: Functional[] = []

  for (let a = 6; a < 10; a++) {
    for (let b = 0; b < 12; b++) {
      aux.push(one(k(a, b, 0, 0)))
    }
  }

  const metricKeys: string[] = []

  for (let a = 0; a < 10; a++) {
    for (let b = a; b < 10; b++) {
      metricKeys.push(...ALL_KEYS(a, b))
    }
  }

  const metricMatrix = metricKeys.map(key =>
    members.map(m => m.get(key) ?? 0),
  )
  const metricKernel = dim === 0 ? 0 : rankMod(metricMatrix, dim, p)
  const fp = quadraticKernel(fierzPauli(v.c, p), p)
  const withFp =
    dim === 0
      ? 1
      : rankMod(
          metricKeys.map((key, i) => [
            ...metricMatrix[i]!,
            fp.get(key) ?? 0,
          ]),
          dim + 1,
          p,
        )

  const pairs: [number, number][] = [
    [DOUBLET[0], DOUBLET[0]],
    [DOUBLET[0], DOUBLET[1]],
    [DOUBLET[1], DOUBLET[1]],
  ]
  const doubletKinetic = pairs.map(([a, b]) => one(k(a, b, 0, 0)))
  const doubletOffLight: Functional[] = []

  for (const [a, b] of pairs) {
    for (let i = 1; i < 4; i++) {
      doubletOffLight.push([
        [k(a, b, i, i), 1],
        [k(a, b, 0, 0), c2],
      ])
      doubletOffLight.push(one(k(a, b, 0, i)))

      for (let j = i + 1; j < 4; j++) {
        doubletOffLight.push(one(k(a, b, i, j)))
      }
    }
  }

  const mixing: Functional[] = []

  for (const d of DOUBLET) {
    for (let b = 0; b < 10; b++) {
      for (const key of ALL_KEYS(b, d)) {
        mixing.push(one(key))
      }
    }
  }

  return {
    invariant: dim,
    genuine: dim - (width - eomRank),
    rows: rows.size,
    metricKinetic: rank(kinetic),
    dewittResidual: rank(residual),
    lambdaPair: rank([mu, one(k(0, 1, 0, 0))]),
    mu: rank([mu]),
    pair: rank([mu, gamma]),
    tied: rank([tied]),
    decoupled: rank(decoupled),
    faceMu: rank([faceMu]),
    facePair: rank([faceMu, faceGamma]),
    faceTied: rank([faceTied]),
    faceDecoupled: rank(faceDecoupled),
    auxKinetic: rank(aux),
    lapseLapse: rank(ALL_KEYS(9, 9).map(one)),
    metricKernel,
    fierzPauliInSpan: withFp === metricKernel,
    doubletKinetic: rank(doubletKinetic),
    doubletOffLight: rank(doubletOffLight),
    doubletMixing: rank(mixing),
  }
}

// the rank of the Euler-Lagrange map on the ansatz: W minus it is the dimension of the total derivatives in the span
function equationRank(p: number, ansatz: Ansatz = ANSATZ): number {
  const rows = new Map<string, Map<number, number>>()

  ansatz.columns.forEach((column, col) => {
    const total: Poly = new Map()

    for (const [key, coef] of column) {
      addScaled(
        total,
        monomialEquations(parseMono(key), p),
        ((coef % p) + p) % p,
        p,
      )
    }

    for (const [rk, val] of total) {
      if (!rows.has(rk)) {
        rows.set(rk, new Map())
      }

      rows.get(rk)!.set(col, val)
    }
  })

  return nullSpaceOfRows(rows.values(), ansatz.columns.length, p).rank
}

// C3: the hand-expanded minimal scalar's residual rows, at speed c and at speed^2 2 c^2
function scalarResidual(p: number): {
  atLight: number[]
  offLight: number[]
} {
  const residual = (c: number, v2: number): number => {
    const ctx = rowContext({ kind: 'full', c, p, doublet: true }, 2)
    const rows: Poly = new Map()

    for (const [key, coef] of minimalScalar(DOUBLET[0], c, v2, p)) {
      addScaled(rows, monomialRows(ctx, parseMono(key)), coef, p)
    }

    return rows.size
  }

  return {
    atLight: [1, 2, 3].map(c => residual(c, c * c)),
    offLight: [1, 2, 3].map(c => residual(c, 2 * c * c)),
  }
}

export default experiment({
  id: 'gravity/cubic-slide-speed',
  code: 'E-GRV-0141',
  title:
    "the full dock slide at cubic order fixes the TT speed at c and lambda at 1, and a foliation-preserving slide fixes neither, pass at L1 (Y1, Y2, Y3; the bootstrap read in ADM variables, continuum, O_h ansatz): of 502 cube-symmetric two-derivative Lagrangians quadratic plus cubic in h_ij, N_i, n and the Eg doublet (151 of them total derivatives), 161 satisfy delta0 S2 and delta0 S3 + delta1 S2 = total derivative, exact over two primes, and their quadratic metric kernel has rank 1 and is Fierz-Pauli: DeWitt kinetic with lambda = 1, shift and lapse multipliers, and the cross polarization's gradient equal to -c^2 times its inertia on the axis and the face diagonal for c = 1, 2, 3; with the metric alone exactly 1 genuine invariant is left, Einstein-Hilbert; the linear slide alone keeps lambda = 1 but leaves the metric kernel at rank 2 (E-GRV-0139's free speed), and the foliation slide leaves rank 4 (Horava's alpha, lambda, beta, eta: speed and lambda free); the doublet, carried as values, keeps one kinetic term at speed c with its anisotropic gradient and its 2 linear couplings to the metric forced out; dropping the time component's transport kills every metric kinetic term; the hand-expanded sqrt(-g) g^mn D s D s is invariant at speed c and breaks 12 rows at speed^2 2 c^2",
  category: 'gravity',
  substrates: ['3434'],
  depth: 'L1',
  paper: false,
  run() {
    const eom = PRIMES.map(p => equationRank(p))
    const table = VARIANTS.map(v => ({
      v,
      reads: PRIMES.map((p, i) => analyse(v, p, eom[i]!)),
    }))
    const scalar = PRIMES.map(scalarResidual)
    const metricOnly = PRIMES.map(p =>
      analyse(
        VARIANTS[0]!,
        p,
        equationRank(p, METRIC_ANSATZ),
        METRIC_ANSATZ,
      ),
    )
    const agree =
      table.every(
        ({ reads }) =>
          JSON.stringify(reads[0]) === JSON.stringify(reads[1]),
      ) &&
      JSON.stringify(scalar[0]) === JSON.stringify(scalar[1]) &&
      JSON.stringify(metricOnly[0]) === JSON.stringify(metricOnly[1]) &&
      eom[0] === eom[1]
    const read = (name: string): Reads =>
      table.find(t => t.v.name === name)!.reads[0]!
    const fulls = ['full', 'full c 2', 'full c 3'].map(read)
    const full = fulls[0]!
    const linear = read('linear')
    const foliation = read('foliation')
    const frozen = read('frozen-time')

    const Y1 =
      full.metricKinetic > 0 &&
      full.dewittResidual === 0 &&
      full.mu === 1
    const speedAtC = (r: Reads): boolean =>
      r.mu === 1 &&
      r.pair === 1 &&
      r.tied === 0 &&
      r.decoupled === 0 &&
      r.faceMu === 1 &&
      r.facePair === 1 &&
      r.faceTied === 0 &&
      r.faceDecoupled === 0
    const Y2 = fulls.every(speedAtC)
    const Y3 = foliation.pair === 2
    const C1 =
      linear.dewittResidual === 0 &&
      linear.mu === 1 &&
      linear.pair === 2
    const C2 = full.fierzPauliInSpan && linear.fierzPauliInSpan
    const C3 =
      scalar[0]!.atLight.every(x => x === 0) &&
      scalar[0]!.offLight.every(x => x > 0)
    const controls = C1 && C2 && C3 && agree
    const status =
      Y1 && Y2 && Y3 && controls
        ? 'pass'
        : controls && Y1 && Y3
          ? 'partial'
          : 'fail'
    const row = (r: Reads): string =>
      `rows ${r.rows}, invariant ${r.invariant} (genuine, modulo total derivatives, ${r.genuine}); metric kernel rank ${r.metricKernel} (Fierz-Pauli in span ${r.fierzPauliInSpan}); metric kinetic rank ${r.metricKinetic}, DeWitt residual ${r.dewittResidual}, (mu, q_xx,yy) rank ${r.lambdaPair}; cross on axis: mu ${r.mu}, (mu, gamma) ${r.pair}, gamma + c^2 mu ${r.tied}, mixing ${r.decoupled}; on face: mu ${r.faceMu}, pair ${r.facePair}, tied ${r.faceTied}, mixing ${r.faceDecoupled}; shift and lapse kinetic ${r.auxKinetic}, lapse-lapse ${r.lapseLapse}; doublet kinetic ${r.doubletKinetic}, off the light cone ${r.doubletOffLight}, coupling to the metric ${r.doubletMixing}`

    return verdict({
      status,
      claim: `Y1 ${Y1}, Y2 ${Y2}, Y3 ${Y3}; C1 ${C1}, C2 ${C2}, C3 ${C3}, primes agree ${agree}. Y4: under the full slide the doublet keeps kinetic rank ${full.doubletKinetic}, off-light-cone rank ${full.doubletOffLight}, metric coupling rank ${full.doubletMixing} (linear slide: ${linear.doubletKinetic}, ${linear.doubletOffLight}, ${linear.doubletMixing}). ${table.map(({ v, reads }) => `${v.name}: ${row(reads[0]!)}`).join(' | ')}`,
      metrics: {
        columns: WIDTH,
        quadraticColumns: ANSATZ.quadratic.filter(x => x).length,
        totalDerivatives: WIDTH - eom[0]!,
        invariant: full.invariant,
        genuine: full.genuine,
        metricKernel: full.metricKernel,
        dewittResidual: full.dewittResidual,
        crossPair: full.pair,
        crossTied: full.tied,
        facePair: full.facePair,
        faceTied: full.faceTied,
        linearPair: linear.pair,
        linearMetricKernel: linear.metricKernel,
        foliationPair: foliation.pair,
        foliationLambdaPair: foliation.lambdaPair,
        foliationMetricKinetic: foliation.metricKinetic,
        frozenPair: frozen.pair,
        frozenMu: frozen.mu,
        doubletKinetic: full.doubletKinetic,
        doubletOffLight: full.doubletOffLight,
        doubletMixing: full.doubletMixing,
        linearDoubletMixing: linear.doubletMixing,
        metricOnlyColumns: METRIC_ANSATZ.columns.length,
        metricOnlyGenuine: metricOnly[0]!.genuine,
        metricOnlyMetricKernel: metricOnly[0]!.metricKernel,
      },
      control: {
        linearPair: linear.pair,
        foliationPair: foliation.pair,
        scalarOffLight: scalar[0]!.offLight[0]!,
      },
      notes: `primes ${PRIMES.join(', ')}. Ansatz ${WIDTH} columns (${ANSATZ.quadratic.filter(x => x).length} quadratic), Euler-Lagrange rank ${eom[0]} so ${WIDTH - eom[0]!} total-derivative directions. Metric alone (${METRIC_ANSATZ.columns.length} columns), full slide: ${row(metricOnly[0]!)}. Minimal scalar residual rows at c 1, 2, 3: speed c ${scalar[0]!.atLight.join(', ')}, speed^2 2c^2 ${scalar[0]!.offLight.join(', ')}.`,
    })
  },
})
