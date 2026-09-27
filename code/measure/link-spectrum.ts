// The thermal spectrum of the link field on the flat husk torus (E-SPN-0058): per-mode electric and magnetic
// energy against the mode's frequency, and the temperature read off the demons.
//
// The lattice is code/rule/photon-links' cubic torus of side L (the flat 3D space of the horosphere, three
// squares per dock), in the demon form: integer flux E on each link, an angle A in Z_N, integer energy
//   H2 = sum E^2 + sum over plaquettes round((K N / pi)(1 - cos(2 pi B / N))) + sum of demons
// (units of one half), conserved to the unit, the demons the link sector's own stores. For small B/N the
// magnetic level is kappa B^2 with kappa = 2 pi K / N, so H = H2 / 2 = sum E^2 / 2 + (kappa / 2) sum B^2 and a
// transverse mode of wave vector k has omega^2 = kappa lambda(k), lambda = 4 sum sin^2(k_i / 2) the
// curl-curl eigenvalue of the torus.
//
// Mode energies. With V = L^3 docks and hat f(k) = sum_x f(x) e^(-i k x), Parseval gives
//   sum over links E^2 / 2 = sum_k sum_d |hat E_d(k)|^2 / (2 V)
// and the same for kappa B^2 / 2 over the three plaquette orientations. With no vibes Gauss's law makes E
// transverse, so each k != 0 holds two polarizations, and the energy per polarization is half the sum over
// d. The same holds for B = curl A (its divergence is zero). The k = 0 terms (a uniform flux, the holonomy)
// are not photon modes and are left out.

import { plaquetteField, type PhotonRule, type PhotonState } from '@/code/rule/photon-links'

export type ModeTable = { k: number[][]; lambda: number[]; cos: Float64Array[]; sin: Float64Array[] }

// the wave vectors k = 2 pi n / L of the torus, n in 0 .. L - 1 per axis, without k = 0
export function torusModes(side: number): { n: number[][]; lambda: number[] } {
  const n: number[][] = []
  const lambda: number[] = []

  for (let a = 0; a < side; a++) {
    for (let b = 0; b < side; b++) {
      for (let c = 0; c < side; c++) {
        if (a === 0 && b === 0 && c === 0) {
          continue
        }

        n.push([a, b, c])
        lambda.push([a, b, c].reduce((s, x) => s + 4 * Math.sin((Math.PI * x) / side) ** 2, 0))
      }
    }
  }

  return { n, lambda }
}

// |hat f(k)|^2 for every nonzero k, for a field on the docks (one value per dock), by a separable DFT
export function powerSpectrum(field: ArrayLike<number>, side: number): Float64Array {
  const v = side ** 3
  let re = Float64Array.from({ length: v }, (_, i) => field[i] ?? 0)
  let im = new Float64Array(v)
  const cos = Array.from({ length: side }, (_, j) => Math.cos((2 * Math.PI * j) / side))
  const sin = Array.from({ length: side }, (_, j) => Math.sin((2 * Math.PI * j) / side))

  for (let axis = 0; axis < 3; axis++) {
    const stride = side ** axis
    const nre = new Float64Array(v)
    const nim = new Float64Array(v)

    for (let x = 0; x < v; x++) {
      const coord = Math.floor(x / stride) % side
      const base = x - coord * stride

      for (let q = 0; q < side; q++) {
        const y = base + q * stride
        const phase = (coord * q) % side
        const c = cos[phase] ?? 1
        const s = -(sin[phase] ?? 0)
        const fr = re[y] ?? 0
        const fi = im[y] ?? 0

        nre[x] = (nre[x] ?? 0) + fr * c - fi * s
        nim[x] = (nim[x] ?? 0) + fr * s + fi * c
      }
    }

    re = nre
    im = nim
  }

  // index a + L b + L^2 c of the output, k = 0 dropped, in the order of torusModes
  const out: number[] = []

  for (let a = 0; a < side; a++) {
    for (let b = 0; b < side; b++) {
      for (let c = 0; c < side; c++) {
        if (a === 0 && b === 0 && c === 0) {
          continue
        }

        const i = a + side * b + side * side * c

        out.push((re[i] ?? 0) ** 2 + (im[i] ?? 0) ** 2)
      }
    }
  }

  return Float64Array.from(out)
}

const centered = (b: number, n: number): number => {
  const c = ((b % n) + n) % n

  return 2 * c > n ? c - n : c
}

// the electric and magnetic energy per polarization of every nonzero mode, at one beat
export function modeEnergies(rule: PhotonRule, state: PhotonState, side: number): { electric: Float64Array; magnetic: Float64Array } {
  const v = side ** 3
  const f = rule.lattice.firsts.length
  const kappa = (2 * Math.PI * rule.k) / rule.n
  let electric: Float64Array | undefined
  let magnetic: Float64Array | undefined

  for (let d = 0; d < f; d++) {
    const field = new Float64Array(v)

    for (let x = 0; x < v; x++) {
      field[x] = state.flux[x * f + d] ?? 0
    }

    const p = powerSpectrum(field, side)

    electric = electric ? electric.map((y, i) => y + (p[i] ?? 0)) : p
  }

  const orientations = rule.lattice.plaquetteCount / v

  for (let o = 0; o < orientations; o++) {
    const field = new Float64Array(v)

    for (let x = 0; x < v; x++) {
      field[x] = centered(plaquetteField(rule, state.angle, x * orientations + o), rule.n)
    }

    const p = powerSpectrum(field, side)

    magnetic = magnetic ? magnetic.map((y, i) => y + (p[i] ?? 0)) : p
  }

  // energy per polarization: sum over d of |hat E|^2 / (2 V), halved for two polarizations
  return {
    electric: (electric ?? new Float64Array(0)).map(y => y / (4 * v)),
    magnetic: (magnetic ?? new Float64Array(0)).map(y => (kappa * y) / (4 * v)),
  }
}

// the demons' inverse temperature: least squares of ln(count) against the demon energy d (half units), over
// the values with at least `floor` counts; returns beta per unit of H (= 2 x the slope in half units) and R^2
export function demonTemperature(histogram: Float64Array, floor: number): { beta: number; r2: number; points: number } {
  const xs: number[] = []
  const ys: number[] = []

  histogram.forEach((c, d) => {
    if (c >= floor) {
      xs.push(d)
      ys.push(Math.log(c))
    }
  })

  const n = xs.length
  const mx = xs.reduce((a, b) => a + b, 0) / n
  const my = ys.reduce((a, b) => a + b, 0) / n
  let sxy = 0
  let sxx = 0
  let syy = 0

  for (let i = 0; i < n; i++) {
    sxy += ((xs[i] ?? 0) - mx) * ((ys[i] ?? 0) - my)
    sxx += ((xs[i] ?? 0) - mx) ** 2
    syy += ((ys[i] ?? 0) - my) ** 2
  }

  const slope = sxy / sxx

  return { beta: -2 * slope, r2: (sxy * sxy) / (sxx * syy), points: n }
}
