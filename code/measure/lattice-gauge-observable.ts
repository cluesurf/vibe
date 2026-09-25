// Gauge-invariant numbers read off a hypercubic lattice gauge field: the plaquette, rectangular
// Wilson loops, Creutz ratios and the Polyakov loop. Every one is a trace of a closed product of
// links, so a gauge transformation cannot change it.

import { GaugeLattice, linkSlot } from '@/code/dynamics/gauge-lattice'
import {
  MatrixSlot,
  copyMatrix,
  imaginaryTrace,
  multiplyInto,
  realTrace,
  realTraceOfProduct,
  setIdentity,
} from '@/code/algebra/group/unitary-matrix'

// The mean of (1 / N) Re Tr U_plaquette over every plaquette. One at the ordered vacuum, zero for a
// fully disordered field.
export function averagePlaquette(input: {
  lattice: GaugeLattice
}): number {
  const moments = plaquetteMoments({ lattice: input.lattice })

  return (moments[0] ?? 0) / input.lattice.n
}

// The first three moments <X>, <X^2>, <X^3> of X = Re Tr U_plaquette (not divided by N) over every
// plaquette. At beta = 0 the links are Haar distributed and these are the Haar moments of the group,
// so <X^3> is the cubic invariant: 1/4 for SU(3), whose epsilon tensor contracts three fundamental
// indices into a singlet, and zero for SU(2) and U(1), which have no such tensor.
export function plaquetteMoments(input: {
  lattice: GaugeLattice
}): number[] {
  const { lattice } = input
  const { n, geometry } = lattice
  const { dim, up, sites } = geometry
  const size = 2 * n * n
  const buffer = new Float64Array(2 * size)
  const lower: MatrixSlot = { data: buffer, offset: 0 }
  const upper: MatrixSlot = { data: buffer, offset: size }

  let first = 0
  let second = 0
  let third = 0
  let count = 0

  for (let site = 0; site < sites; site++) {
    for (let mu = 0; mu < dim; mu++) {
      for (let nu = mu + 1; nu < dim; nu++) {
        const siteMu = up[site * dim + mu] ?? 0
        const siteNu = up[site * dim + nu] ?? 0

        // U_mu(x) U_nu(x + mu)
        multiplyInto({
          n,
          a: linkSlot({ lattice, site, mu }),
          b: linkSlot({ lattice, site: siteMu, mu: nu }),
          out: lower,
        })

        // U_nu(x) U_mu(x + nu)
        multiplyInto({
          n,
          a: linkSlot({ lattice, site, mu: nu }),
          b: linkSlot({ lattice, site: siteNu, mu }),
          out: upper,
        })

        // Re Tr (lower upper^dag)
        const x = realTraceOfDaggerProduct({ n, a: lower, b: upper })

        first += x
        second += x * x
        third += x * x * x
        count += 1
      }
    }
  }

  return count === 0
    ? [0, 0, 0]
    : [first / count, second / count, third / count]
}

// Re Tr (a b^dag) = sum over i, j of Re (a_ij conj(b_ij)).
function realTraceOfDaggerProduct(input: {
  n: number
  a: MatrixSlot
  b: MatrixSlot
}): number {
  const size = input.n * input.n

  let total = 0

  for (let e = 0; e < size; e++) {
    const ka = input.a.offset + 2 * e
    const kb = input.b.offset + 2 * e

    total +=
      (input.a.data[ka] ?? 0) * (input.b.data[kb] ?? 0) +
      (input.a.data[ka + 1] ?? 0) * (input.b.data[kb + 1] ?? 0)
  }

  return total
}

// The straight line of links from every site along mu, of every length 1..maxLength. Returns a
// buffer where line (length, site) is at offset ((length - 1) * sites + site) * size.
function lineProducts(input: {
  lattice: GaugeLattice
  mu: number
  maxLength: number
}): Float64Array {
  const { lattice, mu, maxLength } = input
  const { n, geometry } = lattice
  const { dim, up, sites } = geometry
  const size = 2 * n * n
  const lines = new Float64Array(maxLength * sites * size)

  for (let site = 0; site < sites; site++) {
    copyMatrix({
      n,
      from: linkSlot({ lattice, site, mu }),
      out: { data: lines, offset: site * size },
    })
  }

  for (let length = 2; length <= maxLength; length++) {
    for (let site = 0; site < sites; site++) {
      // line(length, x) = line(length - 1, x) U_mu(x + (length - 1) mu)
      let end = site

      for (let step = 0; step < length - 1; step++) {
        end = up[end * dim + mu] ?? 0
      }

      multiplyInto({
        n,
        a: {
          data: lines,
          offset: ((length - 2) * sites + site) * size,
        },
        b: linkSlot({ lattice, site: end, mu }),
        out: {
          data: lines,
          offset: ((length - 1) * sites + site) * size,
        },
      })
    }
  }

  return lines
}

// Im Tr (a b^dag) = sum over i, j of Im (a_ij conj(b_ij)).
function imaginaryTraceOfDaggerProduct(input: {
  n: number
  a: MatrixSlot
  b: MatrixSlot
}): number {
  const size = input.n * input.n

  let total = 0

  for (let e = 0; e < size; e++) {
    const ka = input.a.offset + 2 * e
    const kb = input.b.offset + 2 * e

    total +=
      (input.a.data[ka + 1] ?? 0) * (input.b.data[kb] ?? 0) -
      (input.a.data[ka] ?? 0) * (input.b.data[kb + 1] ?? 0)
  }

  return total
}

// A Wilson loop in a representation, from the fundamental trace t = Tr W of the loop.
// - fundamental: (1 / N) Re t
// - adjoint: (|t|^2 - 1) / (N^2 - 1), the character of the adjoint of SU(N), the representation the
//   gluon itself carries. A static source in it has color charge C_A = N instead of the quark's
//   C_F = (N^2 - 1) / (2N).
export type LoopRepresentation = 'fundamental' | 'adjoint'

function character(input: {
  n: number
  representation: LoopRepresentation
  re: number
  im: number
}): number {
  const { n, re, im } = input

  return input.representation === 'fundamental'
    ? re / n
    : (re * re + im * im - 1) / (n * n - 1)
}

// W(R, T), the R x T rectangle in the chosen representation (fundamental by default), averaged over
// every site and every ordered pair of distinct directions (so both orientations of a rectangle are
// counted). table[R][T] for 0 <= R, T <= max, with W(0, T) = W(R, 0) = 1.
export function wilsonLoopTable(input: {
  lattice: GaugeLattice
  max: number
  representation?: LoopRepresentation
}): number[][] {
  const { lattice, max } = input
  const representation = input.representation ?? 'fundamental'
  const { n, geometry } = lattice
  const { dim, sites } = geometry
  const size = 2 * n * n
  const lines = Array.from({ length: dim }, (_, mu) =>
    lineProducts({ lattice, mu, maxLength: max }),
  )
  const buffer = new Float64Array(2 * size)
  const first: MatrixSlot = { data: buffer, offset: 0 }
  const second: MatrixSlot = { data: buffer, offset: size }
  const table = Array.from({ length: max + 1 }, () =>
    new Array<number>(max + 1).fill(1),
  )

  // Averaged over every ordered pair (mu, nu), an R x T rectangle and a T x R rectangle are the same
  // set of loops, so W(R, T) = W(T, R) exactly and only R <= T is computed.
  for (let r = 1; r <= max; r++) {
    for (let t = r; t <= max; t++) {
      let total = 0
      let count = 0

      for (let mu = 0; mu < dim; mu++) {
        for (let nu = 0; nu < dim; nu++) {
          if (nu === mu) {
            continue
          }

          const linesMu = lines[mu] ?? new Float64Array(0)
          const linesNu = lines[nu] ?? new Float64Array(0)

          for (let site = 0; site < sites; site++) {
            const siteR = walk({ lattice, site, mu, count: r })
            const siteT = walk({ lattice, site, mu: nu, count: t })
            const line = (
              from: Float64Array,
              length: number,
              at: number,
            ): MatrixSlot => ({
              data: from,
              offset: ((length - 1) * sites + at) * size,
            })

            // lower-right path: L_mu(x, R) L_nu(x + R mu, T)
            multiplyInto({
              n,
              a: line(linesMu, r, site),
              b: line(linesNu, t, siteR),
              out: first,
            })

            // upper-left path: L_nu(x, T) L_mu(x + T nu, R)
            multiplyInto({
              n,
              a: line(linesNu, t, site),
              b: line(linesMu, r, siteT),
              out: second,
            })

            total += character({
              n,
              representation,
              re: realTraceOfDaggerProduct({ n, a: first, b: second }),
              im:
                representation === 'fundamental'
                  ? 0
                  : imaginaryTraceOfDaggerProduct({
                      n,
                      a: first,
                      b: second,
                    }),
            })
            count += 1
          }
        }
      }

      const value = count === 0 ? 0 : total / count
      const row = table[r]
      const column = table[t]

      if (row !== undefined && column !== undefined) {
        row[t] = value
        column[r] = value
      }
    }
  }

  return table
}

// The static quark-antiquark loops W(R, T): R along a spatial axis, built from the links of
// `spatial` (usually an APE-smeared copy), and T along the time axis (the last), built from the
// links of `temporal` (the unsmeared configuration, so the transfer matrix is the true one).
// Averaged over every site and the spatial directions. table[R][T] for 1 <= R <= maxR,
// 1 <= T <= maxT. At large T, W(R, T) ~ c(R) exp(-V(R) T), V the static potential.
export function staticWilsonLoops(input: {
  spatial: GaugeLattice
  temporal: GaugeLattice
  maxR: number
  maxT: number
}): number[][] {
  const { spatial, temporal, maxR, maxT } = input
  const { n, geometry } = temporal
  const { dim, sites } = geometry
  const timeAxis = dim - 1
  const size = 2 * n * n
  const timeLines = lineProducts({
    lattice: temporal,
    mu: timeAxis,
    maxLength: maxT,
  })
  const spaceLines = Array.from({ length: timeAxis }, (_, mu) =>
    lineProducts({ lattice: spatial, mu, maxLength: maxR }),
  )
  const buffer = new Float64Array(2 * size)
  const first: MatrixSlot = { data: buffer, offset: 0 }
  const second: MatrixSlot = { data: buffer, offset: size }
  const line = (
    from: Float64Array,
    length: number,
    at: number,
  ): MatrixSlot => ({
    data: from,
    offset: ((length - 1) * sites + at) * size,
  })
  const table = Array.from({ length: maxR + 1 }, () =>
    new Array<number>(maxT + 1).fill(1),
  )

  for (let r = 1; r <= maxR; r++) {
    for (let t = 1; t <= maxT; t++) {
      let total = 0
      let count = 0

      for (let mu = 0; mu < timeAxis; mu++) {
        const lines = spaceLines[mu] ?? new Float64Array(0)

        for (let site = 0; site < sites; site++) {
          const siteR = walk({ lattice: temporal, site, mu, count: r })
          const siteT = walk({
            lattice: temporal,
            site,
            mu: timeAxis,
            count: t,
          })

          // L_mu(x, R) L_t(x + R mu, T), against L_t(x, T) L_mu(x + T t, R)
          multiplyInto({
            n,
            a: line(lines, r, site),
            b: line(timeLines, t, siteR),
            out: first,
          })

          multiplyInto({
            n,
            a: line(timeLines, t, site),
            b: line(lines, r, siteT),
            out: second,
          })
          total += realTraceOfDaggerProduct({ n, a: first, b: second })
          count += 1
        }
      }

      const row = table[r]

      if (row !== undefined) {
        row[t] = count === 0 ? 0 : total / (count * n)
      }
    }
  }

  return table
}

// The scalar glueball operator on each time slice: the sum over the slice of (1 / N) Re Tr of every
// spatial plaquette, the lightest gauge-invariant combination with the quantum numbers J^PC = 0++.
// Built from smeared links it overlaps with the glueball far better than with the ultraviolet noise.
// Returns one value per time slice (time is the last axis).
export function spatialPlaquetteSlices(input: {
  lattice: GaugeLattice
}): number[] {
  const { lattice } = input
  const { n, geometry } = lattice
  const { dim, up, sites, lengths } = geometry
  const timeAxis = dim - 1
  const timeLength = lengths[timeAxis] ?? 1
  const spatialVolume = sites / timeLength
  const size = 2 * n * n
  const buffer = new Float64Array(2 * size)
  const lower: MatrixSlot = { data: buffer, offset: 0 }
  const upper: MatrixSlot = { data: buffer, offset: size }
  const slices = new Array<number>(timeLength).fill(0)

  for (let site = 0; site < sites; site++) {
    const t = Math.floor(site / spatialVolume)

    for (let mu = 0; mu < timeAxis; mu++) {
      for (let nu = mu + 1; nu < timeAxis; nu++) {
        multiplyInto({
          n,
          a: linkSlot({ lattice, site, mu }),
          b: linkSlot({
            lattice,
            site: up[site * dim + mu] ?? 0,
            mu: nu,
          }),
          out: lower,
        })

        multiplyInto({
          n,
          a: linkSlot({ lattice, site, mu: nu }),
          b: linkSlot({ lattice, site: up[site * dim + nu] ?? 0, mu }),
          out: upper,
        })

        slices[t] =
          (slices[t] ?? 0) +
          realTraceOfDaggerProduct({ n, a: lower, b: upper }) / n
      }
    }
  }

  return slices
}

// The connected correlator C(t) = <O(t0) O(t0 + t)> - <O>^2 of per-slice operators, averaged over
// every source slice t0 and every configuration, on a periodic time axis.
export function connectedSliceCorrelator(input: {
  slices: readonly (readonly number[])[]
}): number[] {
  const { slices } = input
  const timeLength = slices[0]?.length ?? 0
  const mean =
    slices.reduce((sum, s) => sum + s.reduce((a, b) => a + b, 0), 0) /
    (slices.length * timeLength)

  return Array.from({ length: timeLength }, (_, t) => {
    let total = 0

    for (const s of slices) {
      for (let t0 = 0; t0 < timeLength; t0++) {
        total += (s[t0] ?? 0) * (s[(t0 + t) % timeLength] ?? 0)
      }
    }

    return total / (slices.length * timeLength) - mean * mean
  })
}

// The connected correlator matrix C_ij(t) = <O_i(t0) O_j(t0 + t)> - <O_i><O_j> of several per-slice
// operators (one per smearing level, say), averaged over source slices and configurations and
// symmetrized in i, j. slices[configuration][operator][t]. The input to a variational analysis.
export function connectedCorrelatorMatrix(input: {
  slices: readonly (readonly (readonly number[])[])[]
  t: number
}): number[][] {
  const { slices, t } = input
  const operators = slices[0]?.length ?? 0
  const timeLength = slices[0]?.[0]?.length ?? 0
  const count = slices.length * timeLength
  const means = Array.from(
    { length: operators },
    (_, i) =>
      slices.reduce(
        (sum, s) => sum + (s[i] ?? []).reduce((a, b) => a + b, 0),
        0,
      ) / count,
  )
  const raw = Array.from({ length: operators }, (_, i) =>
    Array.from({ length: operators }, (__, j) => {
      let total = 0

      for (const s of slices) {
        for (let t0 = 0; t0 < timeLength; t0++) {
          total +=
            (s[i]?.[t0] ?? 0) * (s[j]?.[(t0 + t) % timeLength] ?? 0)
        }
      }

      return total / count - (means[i] ?? 0) * (means[j] ?? 0)
    }),
  )

  return raw.map((row, i) =>
    row.map((value, j) => (value + (raw[j]?.[i] ?? 0)) / 2),
  )
}

function walk(input: {
  lattice: GaugeLattice
  site: number
  mu: number
  count: number
}): number {
  const { dim, up } = input.lattice.geometry

  let site = input.site

  for (let i = 0; i < input.count; i++) {
    site = up[site * dim + input.mu] ?? 0
  }

  return site
}

// The Creutz ratio chi(R, T) = -ln[W(R, T) W(R - 1, T - 1) / (W(R - 1, T) W(R, T - 1))] from an
// averaged loop table. The perimeter and corner terms cancel, so an area law W ~ exp(-sigma R T)
// gives chi = sigma. Returns NaN when a loop in the ratio is not positive (the signal is lost in
// the noise), so a caller cannot mistake a lost signal for a zero string tension.
export function creutzRatioFromTable(input: {
  table: readonly (readonly number[])[]
  r: number
  t: number
}): number {
  const w = (r: number, t: number): number =>
    input.table[r]?.[t] ?? Number.NaN
  const numerator = w(input.r, input.t) * w(input.r - 1, input.t - 1)
  const denominator = w(input.r - 1, input.t) * w(input.r, input.t - 1)

  if (!(numerator > 0) || !(denominator > 0)) {
    return Number.NaN
  }

  return -Math.log(numerator / denominator)
}

// The Polyakov loop, (1 / N) Tr of the product of time-like links winding once around the periodic
// time axis (the last axis), averaged over every spatial site, as [re, im]. It is the propagator of
// an infinitely heavy static quark, so its magnitude is exp(-F_q / T), F_q the free energy of one
// isolated quark. Zero means an isolated quark costs infinite energy (confinement).
export function polyakovLoop(input: {
  lattice: GaugeLattice
}): [number, number] {
  const { lattice } = input
  const { n, geometry } = lattice
  const timeAxis = geometry.dim - 1
  const timeLength = geometry.lengths[timeAxis] ?? 1
  const spatialVolume = geometry.sites / timeLength
  const size = 2 * n * n
  const buffer = new Float64Array(2 * size)
  const product: MatrixSlot = { data: buffer, offset: 0 }
  const next: MatrixSlot = { data: buffer, offset: size }

  let re = 0
  let im = 0

  for (let s = 0; s < spatialVolume; s++) {
    let site = s

    setIdentity({ n, out: product })

    for (let t = 0; t < timeLength; t++) {
      multiplyInto({
        n,
        a: product,
        b: linkSlot({ lattice, site, mu: timeAxis }),
        out: next,
      })
      copyMatrix({ n, from: next, out: product })
      site = geometry.up[site * geometry.dim + timeAxis] ?? 0
    }

    re += realTrace({ n, a: product })
    im += imaginaryTrace({ n, a: product })
  }

  return [re / (spatialVolume * n), im / (spatialVolume * n)]
}

// The plaquette read a second way, from the staples: summing Re Tr(U A) over every link counts each
// plaquette exactly four times, once per link it holds. A consistency check on the staple code
// against averagePlaquette.
export function plaquetteFromStaples(input: {
  lattice: GaugeLattice
  staple: (site: number, mu: number, out: MatrixSlot) => void
}): number {
  const { lattice } = input
  const { n, geometry } = lattice
  const size = 2 * n * n
  const staple: MatrixSlot = { data: new Float64Array(size), offset: 0 }

  let total = 0

  for (let site = 0; site < geometry.sites; site++) {
    for (let mu = 0; mu < geometry.dim; mu++) {
      input.staple(site, mu, staple)
      total += realTraceOfProduct({
        n,
        a: linkSlot({ lattice, site, mu }),
        b: staple,
      })
    }
  }

  const plaquettes =
    (geometry.sites * geometry.dim * (geometry.dim - 1)) / 2

  return total / (4 * plaquettes * n)
}
