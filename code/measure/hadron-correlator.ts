// Hadron correlators built from staggered quark propagators, and the masses read off them. A
// hadron is a colour singlet, so the correlator contracts the colour indices of its quarks into an
// invariant:
//
// - the Goldstone pion, a quark and an antiquark, delta_ab: C(t) = sum over x in slice t of
//   sum over a, c of |G_ac(x)|^2. With staggered quarks the (-1)^x phases of the pion operator
//   cancel the ones in G^dag, which is why the Goldstone channel is the plain sum of squares.
// - the nucleon, three quarks, epsilon_abc: C(t) = sum over the cube corners of slice t of
//   epsilon_abc epsilon_a'b'c' G_aa' G_bb' G_cc' = 6 det G(x). A baryon exists only because SU(3)
//   has an invariant epsilon tensor with three indices.
//
// `propagators[c]` is the propagator from a point source of colour c at the origin, one colour
// vector per site. The origin is the source, and time is the last axis.

import { Hypercubic, siteCoordinates } from '@/code/tool/hypercubic'
import { Rng } from '@/code/tool/rng'
import { GaugeLattice, gaugeUpdate } from '@/code/dynamics/gauge-lattice'
import {
  makeStaggeredOperator,
  staggeredPropagator,
} from '@/code/operator/staggered-fermion'

export type HadronCorrelators = {
  // [mass][t]
  readonly pion: number[][]
  readonly rho: number[][]
  readonly nucleon: number[][]
  // the worst |M G - source| / |source| over the colour sources, recomputed from the propagators
  readonly worstResidual: number
}

// Pion and nucleon correlators on one gauge configuration, for several quark masses at once, from a
// point source at the origin in each of the three colours.
export function measureHadronCorrelators(input: {
  lattice: GaugeLattice
  masses: readonly number[]
  tolerance: number
  maxIterations: number
}): HadronCorrelators {
  const { lattice, masses } = input
  const operator = makeStaggeredOperator({ lattice })
  const solved = [0, 1, 2].map(colour =>
    staggeredPropagator({
      operator,
      site: 0,
      colour,
      masses,
      tolerance: input.tolerance,
      maxIterations: input.maxIterations,
    }),
  )
  const perMass = masses.map((_, index) =>
    solved.map(s => s.propagators[index] ?? new Float64Array(0)),
  )

  return {
    pion: perMass.map(propagators =>
      pionCorrelator({ geometry: lattice.geometry, n: lattice.n, propagators }),
    ),
    rho: perMass.map(propagators =>
      rhoCorrelator({ geometry: lattice.geometry, n: lattice.n, propagators }),
    ),
    nucleon: perMass.map(propagators =>
      nucleonCorrelator({ geometry: lattice.geometry, propagators }),
    ),
    worstResidual: Math.max(...solved.flatMap(s => s.residuals)),
  }
}

// A quenched ensemble: thermalize the pure gauge field, then measure the hadron correlators on
// `configurations` configurations `separation` updates apart. Quenched means the quarks do not act
// back on the gluons (no fermion determinant), the standard first approximation.
export function sampleQuenchedHadrons(input: {
  lattice: GaugeLattice
  beta: number
  masses: readonly number[]
  thermalization: number
  configurations: number
  separation: number
  overrelaxation: number
  tolerance: number
  maxIterations: number
  rng: Rng
}): HadronCorrelators[] {
  const { lattice, beta, overrelaxation, rng } = input

  for (let k = 0; k < input.thermalization; k++) {
    gaugeUpdate({ lattice, beta, overrelaxation, rng })
  }

  const out: HadronCorrelators[] = []

  for (let c = 0; c < input.configurations; c++) {
    for (let k = 0; k < input.separation; k++) {
      gaugeUpdate({ lattice, beta, overrelaxation, rng })
    }

    out.push(
      measureHadronCorrelators({
        lattice,
        masses: input.masses,
        tolerance: input.tolerance,
        maxIterations: input.maxIterations,
      }),
    )
  }

  return out
}

function entry(input: {
  propagators: readonly Float64Array[]
  n: number
  site: number
  sink: number
  source: number
}): [number, number] {
  const g = input.propagators[input.source] ?? new Float64Array(0)
  const k = input.site * 2 * input.n + 2 * input.sink

  return [g[k] ?? 0, g[k + 1] ?? 0]
}

export function pionCorrelator(input: {
  geometry: Hypercubic
  n: number
  propagators: readonly Float64Array[]
}): number[] {
  const { geometry, n, propagators } = input
  const timeAxis = geometry.dim - 1
  const timeLength = geometry.lengths[timeAxis] ?? 1
  const spatialVolume = geometry.sites / timeLength
  const out = new Array<number>(timeLength).fill(0)

  for (let site = 0; site < geometry.sites; site++) {
    const t = Math.floor(site / spatialVolume)

    let total = 0

    for (let source = 0; source < n; source++) {
      for (let sink = 0; sink < n; sink++) {
        const [re, im] = entry({ propagators, n, site, sink, source })

        total += re * re + im * im
      }
    }

    out[t] = (out[t] ?? 0) + total
  }

  return out
}

// The local vector meson, the rho: the staggered bilinear with spin-taste gamma_i x xi_i, whose
// phase is eta_i(x) zeta_i(x) = (-1)^(sum of x_nu over nu != i). The G(0, x) = eps(0) eps(x) G(x, 0)^dag
// identity of staggered quarks turns the correlator into C(t) = sum over x in slice t of
// (-1)^(x_i) |G(x, 0)|^2, summed here over the three spatial directions i. It carries an oscillating
// (-1)^t partner of opposite parity, which a step-two effective mass on one parity of t reads past.
export function rhoCorrelator(input: {
  geometry: Hypercubic
  n: number
  propagators: readonly Float64Array[]
}): number[] {
  const { geometry, n, propagators } = input
  const timeAxis = geometry.dim - 1
  const timeLength = geometry.lengths[timeAxis] ?? 1
  const out = new Array<number>(timeLength).fill(0)

  for (let site = 0; site < geometry.sites; site++) {
    const x = siteCoordinates({ lattice: geometry, site })

    let sign = 0

    for (let i = 0; i < timeAxis; i++) {
      sign += (x[i] ?? 0) % 2 === 0 ? 1 : -1
    }

    let total = 0

    for (let source = 0; source < n; source++) {
      for (let sink = 0; sink < n; sink++) {
        const [re, im] = entry({ propagators, n, site, sink, source })

        total += re * re + im * im
      }
    }

    const t = x[timeAxis] ?? 0

    out[t] = (out[t] ?? 0) + sign * total
  }

  return out
}

function determinantThree(m: [number, number][][]): [number, number] {
  const mul = (a: [number, number], b: [number, number]): [number, number] => [
    a[0] * b[0] - a[1] * b[1],
    a[0] * b[1] + a[1] * b[0],
  ]
  const at = (i: number, j: number): [number, number] => m[i]?.[j] ?? [0, 0]

  const minor = (a: number, b: number, c: number, d: number): [number, number] => {
    const p = mul(at(1, a), at(2, b))
    const q = mul(at(1, c), at(2, d))

    return [p[0] - q[0], p[1] - q[1]]
  }

  const t0 = mul(at(0, 0), minor(1, 2, 2, 1))
  const t1 = mul(at(0, 1), minor(0, 2, 2, 0))
  const t2 = mul(at(0, 2), minor(0, 1, 1, 0))

  return [t0[0] - t1[0] + t2[0], t0[1] - t1[1] + t2[1]]
}

// The staggered nucleon, summed over the sites of each time slice whose spatial coordinates are all
// even (the corners of the spatial 2^3 cubes, the local nucleon operator of Golterman and Smit).
// Real part, since the imaginary part averages to zero over gauge configurations.
export function nucleonCorrelator(input: {
  geometry: Hypercubic
  propagators: readonly Float64Array[]
}): number[] {
  const { geometry, propagators } = input
  const n = 3
  const timeAxis = geometry.dim - 1
  const timeLength = geometry.lengths[timeAxis] ?? 1
  const out = new Array<number>(timeLength).fill(0)

  for (let site = 0; site < geometry.sites; site++) {
    const x = siteCoordinates({ lattice: geometry, site })

    if (x.slice(0, timeAxis).some(c => c % 2 !== 0)) {
      continue
    }

    const matrix = Array.from({ length: n }, (_, sink) =>
      Array.from({ length: n }, (_, source) =>
        entry({ propagators, n, site, sink, source }),
      ),
    )
    const t = x[timeAxis] ?? 0

    out[t] = (out[t] ?? 0) + 6 * determinantThree(matrix)[0]
  }

  return out
}

// The effective mass of a correlator that is a single cosh on a periodic time axis of length T,
// C(t) = A (exp(-m t) + exp(-m (T - t))). Then (C(t - s) + C(t + s)) / (2 C(t)) = cosh(m s) exactly,
// with no fit and no guess about the plateau. A step s of two reads one parity of t, on which a
// staggered (-1)^t partner has one sign rather than alternating, so it becomes an ordinary excited
// state that dies away at large t instead of breaking the ratio.
export function coshEffectiveMass(input: {
  correlator: readonly number[]
  t: number
  step?: number
}): number {
  const c = input.correlator
  const step = input.step ?? 1
  const before = c[input.t - step] ?? Number.NaN
  const at = c[input.t] ?? Number.NaN
  const after = c[input.t + step] ?? Number.NaN
  const ratio = (before + after) / (2 * at)

  return ratio >= 1 ? Math.acosh(ratio) / step : Number.NaN
}

// The effective mass over a step of `step` time slices, m = ln(C(t) / C(t + step)) / step. A step
// of two reads a staggered correlator on one parity of t, which removes the (-1)^t parity partner's
// sign alternation.
export function logEffectiveMass(input: {
  correlator: readonly number[]
  t: number
  step: number
}): number {
  const a = input.correlator[input.t] ?? Number.NaN
  const b = input.correlator[input.t + input.step] ?? Number.NaN

  return a > 0 && b > 0 ? Math.log(a / b) / input.step : Number.NaN
}
