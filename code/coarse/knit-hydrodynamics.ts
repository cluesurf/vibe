// The Navier-Stokes level the knit's lattice Boltzmann equation implies, and the flows that tie the
// three levels together (code/coarse/knit-boltzmann is the kinetic level below this one).
//
// THE HYDRODYNAMIC GENERATOR. The conserved densities of the knit (charge, the four components of P, the
// line sum S, and the tone count when the rule keeps it) are the slow fields. At a small wave vector
// k0 * direction the period map M(k0) of the lattice Boltzmann equation has exactly that many slow
// eigenvalues; with their right eigenvectors X and the densities' left vectors L, the period map restricted
// to the slow subspace, written in density coordinates, is T = (L X) Lambda (L X)^-1. Its logarithm over
// the period is the generator H(k0), and from H at +k0 and -k0 the first-order part (the Euler flux
// matrix C, sound) and the second-order part (the transport matrix D, viscosities and diffusivities)
// separate by parity: H(k) = -i k C - k^2 D. This is the Chapman-Enskog result to Navier-Stokes order,
// read off the kinetic equation rather than derived by hand, for a fluid with no lattice symmetry left to
// simplify D, so D is a full matrix per direction.
//
// A FLOW. A plane-wave component of the densities with complex amplitude z evolves as e^{t H(k)} z; a
// real profile rho(s) on a reduced lattice (code/coarse/knit-boltzmann ReducedLattice) is the real part of
// the sum over its waves of z_w e^{i phi_w(s)}.
//
// STARTS. A momentum field g(s) on the reduced lattice becomes a knit start (momentumFieldStart) the way
// code/measure/momentum-transport makes a wave: a hashed background of both signs at a fill, then on each
// line whose root has e . g != 0 a lone carrier pointing along the sign of e . g, placed with probability
// min(1, |e . g|), its sign hashed. momentumFieldExpectation is the same start's ensemble mean on the
// reduced lattice, for lattice Boltzmann runs on flows too large for the knit.

import { makeWill, type Will } from '@/code/tone/will'
import { type Mesh } from '@/code/tool/mesh'
import { rootsD4 } from '@/code/algebra/group/root-system'
import { hashRand } from '@/code/dynamics/conserving-sweep'
import { complexEigenvalues, complexEigenvector } from '@/code/algebra/linear/complex-eigen'
import {
  type ComplexMatrix,
  complexApply,
  complexCombine,
  complexExp,
  complexInverse,
  complexLogNearIdentity,
  complexMultiply,
} from '@/code/algebra/linear/complex-matrix'
import { SLOT_STATES, densityProfile, periodMap, reducedCoordinates, reducedSiteCount, type ReducedLattice } from '@/code/coarse/knit-boltzmann'

const ROOTS = rootsD4()
const dot = (a: readonly number[], b: readonly number[]): number => a.reduce((s, x, k) => s + x * (b[k] ?? 0), 0)

export type Hydrodynamics = {
  readonly names: readonly string[]
  readonly lefts: readonly Float64Array[]
  // the unit direction the generator belongs to
  readonly direction: readonly number[]
  readonly flux: ComplexMatrix
  readonly transport: ComplexMatrix
}

// T = (L X) Lambda (L X)^-1 at the wave vector k0 * direction, and its logarithm per beat
function slowGenerator(matrices: readonly Float64Array[], wave: readonly number[], lefts: readonly Float64Array[]): ComplexMatrix {
  const n = SLOT_STATES
  const m = lefts.length
  const period = matrices.length
  const map = periodMap({ matrices, wave })
  const ev = complexEigenvalues({ re: map.re, im: map.im, n })
  const order = ev.re.map((re, i) => ({ re, im: ev.im[i] ?? 0 })).sort((a, b) => Math.hypot(b.re, b.im) - Math.hypot(a.re, a.im))
  const slow = order.slice(0, m)
  const lx: ComplexMatrix = { re: new Float64Array(m * m), im: new Float64Array(m * m), n: m }
  const lambda: ComplexMatrix = { re: new Float64Array(m * m), im: new Float64Array(m * m), n: m }

  slow.forEach((value, i) => {
    const x = complexEigenvector({ re: map.re, im: map.im, n, value: [value.re, value.im] })

    lefts.forEach((left, q) => {
      let sr = 0
      let si = 0

      for (let c = 0; c < n; c++) {
        sr += (left[c] ?? 0) * (x.re[c] ?? 0)
        si += (left[c] ?? 0) * (x.im[c] ?? 0)
      }

      lx.re[q * m + i] = sr
      lx.im[q * m + i] = si
    })

    lambda.re[i * m + i] = value.re
    lambda.im[i * m + i] = value.im
  })

  const t = complexMultiply(complexMultiply(lx, lambda), complexInverse(lx))
  const log = complexLogNearIdentity(t)

  return complexCombine(log, [1 / period, 0], log, [0, 0])
}

export function hydrodynamicGenerator(input: {
  matrices: readonly Float64Array[]
  direction: readonly number[]
  k0: number
  densities: Record<string, Float64Array>
}): Hydrodynamics {
  const names = Object.keys(input.densities)
  const lefts = names.map(name => input.densities[name] ?? new Float64Array(SLOT_STATES))
  const size = Math.hypot(...input.direction)
  const unit = input.direction.map(x => x / size)
  const plus = slowGenerator(input.matrices, unit.map(x => x * input.k0), lefts)
  const minus = slowGenerator(input.matrices, unit.map(x => -x * input.k0), lefts)
  const k0 = input.k0

  // D = -(H+ + H-) / (2 k0^2), C = (H+ - H-) i / (2 k0)
  return {
    names,
    lefts,
    direction: unit,
    transport: complexCombine(plus, [-1 / (2 * k0 * k0), 0], minus, [-1 / (2 * k0 * k0), 0]),
    flux: complexCombine(plus, [0, 1 / (2 * k0)], minus, [0, -1 / (2 * k0)]),
  }
}

// H(k) = -i k C - k^2 D
export function generatorAt(h: Hydrodynamics, k: number): ComplexMatrix {
  return complexCombine(h.flux, [0, -k], h.transport, [-k * k, 0])
}

// e^{t H(k)} z
export function hydrodynamicEvolve(h: Hydrodynamics, k: number, t: number, z: { re: ArrayLike<number>; im: ArrayLike<number> }): { re: Float64Array; im: Float64Array } {
  const g = generatorAt(h, k)

  return complexApply(complexExp(complexCombine(g, [t, 0], g, [0, 0])), z)
}

// The complex amplitude z of each density on one wave of a reduced lattice: rho = Re(z e^{i phi}) with
// phi(s) = 2 pi (w . s) / side, z = (2 / N) sum over sites of rho e^{-i phi}
export function waveAmplitudes(input: {
  field: Float64Array
  lattice: ReducedLattice
  lefts: readonly Float64Array[]
  wave: readonly number[]
}): { re: Float64Array; im: Float64Array } {
  const { field, lattice, lefts, wave } = input
  const sites = reducedSiteCount(lattice)
  const re = new Float64Array(lefts.length)
  const im = new Float64Array(lefts.length)

  lefts.forEach((left, q) => {
    const rho = densityProfile(field, left)

    for (let s = 0; s < sites; s++) {
      const phi = (2 * Math.PI * dot(wave, reducedCoordinates(lattice, s))) / lattice.side

      re[q] = (re[q] ?? 0) + (rho[s] ?? 0) * Math.cos(phi)
      im[q] = (im[q] ?? 0) - (rho[s] ?? 0) * Math.sin(phi)
    }

    re[q] = ((re[q] ?? 0) * 2) / sites
    im[q] = ((im[q] ?? 0) * 2) / sites
  })

  return { re, im }
}

// A momentum field on a reduced lattice as a knit start (see the header)
export function momentumFieldStart(input: {
  mesh: Mesh
  side: number
  lattice: ReducedLattice
  field: (coords: readonly number[]) => readonly number[]
  fill: number
  salt: number
}): Will {
  const { mesh, side, lattice, field, fill, salt } = input
  const will = makeWill(mesh)

  for (let i = 0; i < will.data.length; i++) {
    if (hashRand(i, 1, salt) < fill) {
      will.data[i] = hashRand(i, 2, salt) < 0.5 ? -1 : 1
    }
  }

  const r = [0, 0, 0, 0]

  for (let dock = 0; dock < mesh.cellCount; dock++) {
    for (let k = 0; k < 4; k++) {
      r[k] = Math.floor(dock / side ** k) % side
    }

    const coords = lattice.axes.map(axis => (((dot(axis, r) % side) + side) % side))
    const g = field(coords)
    let line = 0

    for (let d = 0; d < 24; d++) {
      const o = mesh.opposite(d)

      if (d > o) {
        continue
      }

      const w = dot(ROOTS[d] ?? [], g)

      if (w !== 0 && hashRand(dock, 3 + line, salt) < Math.min(1, Math.abs(w))) {
        const forward = w > 0 ? d : o
        const backward = forward === d ? o : d

        will.data[dock * 24 + forward] = hashRand(dock, 20 + line, salt) < 0.5 ? -1 : 1
        will.data[dock * 24 + backward] = 0
      }

      line++
    }
  }

  return will
}

// the same start's ensemble mean on the reduced lattice: love and fear at every slot of every site
export function momentumFieldExpectation(input: {
  lattice: ReducedLattice
  field: (coords: readonly number[]) => readonly number[]
  fill: number
  opposite: readonly number[]
}): Float64Array {
  const { lattice, field, fill, opposite } = input
  const sites = reducedSiteCount(lattice)
  const out = new Float64Array(sites * SLOT_STATES)

  for (let s = 0; s < sites; s++) {
    const g = field(reducedCoordinates(lattice, s))
    const base = s * SLOT_STATES

    for (let d = 0; d < 24; d++) {
      out[base + d * 2] = fill / 2
      out[base + d * 2 + 1] = fill / 2
    }

    for (let d = 0; d < 24; d++) {
      const o = opposite[d] ?? d

      if (d > o) {
        continue
      }

      const w = dot(ROOTS[d] ?? [], g)
      const p = Math.min(1, Math.abs(w))

      if (w === 0) {
        continue
      }

      const forward = w > 0 ? d : o
      const backward = forward === d ? o : d

      for (const sign of [0, 1]) {
        out[base + forward * 2 + sign] = p / 2 + ((1 - p) * fill) / 2
        out[base + backward * 2 + sign] = ((1 - p) * fill) / 2
      }
    }
  }

  return out
}

// the projection of density profiles on a pattern: sum over densities and sites of profile times pattern,
// over the pattern's own square
export function patternAmplitude(field: Float64Array, pattern: readonly { left: Float64Array; shape: Float64Array }[]): number {
  let num = 0
  let den = 0

  for (const { left, shape } of pattern) {
    const rho = densityProfile(field, left)

    for (let s = 0; s < shape.length; s++) {
      num += (rho[s] ?? 0) * (shape[s] ?? 0)
      den += (shape[s] ?? 0) ** 2
    }
  }

  return den > 0 ? num / den : 0
}
