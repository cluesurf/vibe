// Measurement for the monopole count of the trit rule's husk light (the experiment in test/experiment/gauge/
// monopole-density, E-FRC-0283): each husk triangle's seam integer as the rule reads it, the closed cube surfaces
// of the husk built from husk triangles, each cube's magnetic charge as the sum of its triangles' seam integers,
// and the harmonic vacuum of the rule's linear beat, from which the field configurations are sampled.
//
// THE SEAM INTEGER. code/rule/trit-column reads a husk triangle P's field as B_P = centered(raw_P), raw_P = sum
// C(P, l) w_l A_l with the angles in their windows, centered mod N_B = 4D into -N_B/2 .. N_B/2 - 1. Its seam integer
// is n_P = (raw_P - B_P) / N_B, the branch of E-FRC-0244's Villain law (the integer string field n_t). Over a closed
// surface of triangles every link is counted twice with opposite signs, so sum eps raw = 0 exactly and the surface's
// charge sum eps n_P = -(1 / N_B) sum eps B_P is an integer that no wrap of an angle (a shift by its window, which is
// N_B / w_l) can change: it counts the Dirac strings that end inside (DeGrand and Toussaint 1980).
//
// THE CUBES. Each husk dock y is the low corner of a unit cube. Each of its six square faces is the union of the
// two husk triangles cut by the face's rising diagonal (1,1,0), (0,1,1) or (1,0,1) from the face's low corner, both
// of type axis-axis-diagonal (or, read beside it, by the falling diagonal (1,-1,0), (0,1,-1) or (1,0,-1)). A face shared by two cubes uses the same two triangles with opposite outward signs,
// so the charges of all cubes sum to 0 on the periodic box.
//
// THE HARMONIC VACUUM. In y = W^(1/2) A, eta = W^(1/2) E the rule's linear beat is y' = y + eta, eta' = eta - f
// A0 y' with A0(k) = W^(1/2) C^dag N C W^(1/2) and f = p / q (code/rule/trit-column: the kick pays n_P p B_P / q).
// Per mode (A0 v = lambda v, lambda > 0) 2 - 2 cos omega = f lambda and the beat-invariant Gaussian has <|y|^2> =
// (hbar / 2) / sin omega (code/measure/husk-light-seam, s = 1). hbar = N_B / (2 pi): the integer flux E_l is the
// conjugate of the compact phase 2 pi w_l A_l / N_B, which makes [A_l, w_l E_l] = i N_B / (2 pi) on every link.
// A sample is y(x) = sqrt 2 Re (V^(-1/2) sum_k y^(k) e^(i k x)) with y^(k) = sum over modes sigma g (v / sqrt 2), g
// normal deviates from a Kronecker stream (code/tool/weyl), then A = W^(-1/2) y rounded to integers.

import { curlAt, huskLight, jacobiEigen } from '@/code/measure/husk-balance'
import {
  centeredField,
  huskCurlWeighted,
  TRIT_HUSK_VECTORS,
  type TritLight,
} from '@/code/rule/trit-column'
import { makeWeyl } from '@/code/tool/weyl'

const mod = (x: number, m: number): number => ((x % m) + m) % m

/** Each cube's 12 surface triangles (husk triangle index) and their outward signs, cube y at entries 12 y .. 12 y + 11. */
export type Cubes = {
  readonly side: number
  readonly triangle: Int32Array
  readonly sign: Int8Array
}

export function huskCubes(
  light: TritLight,
  split: 'rising' | 'falling' = 'rising',
): Cubes {
  const { bulk } = light
  const side = bulk.side
  const dock = (p: readonly number[]): number =>
    mod(p[0] ?? 0, side) +
    side * mod(p[1] ?? 0, side) +
    side * side * mod(p[2] ?? 0, side)
  const key = new Map<string, number>()

  for (let p = 0; p < bulk.huskTriangles; p++) {
    const ls = [0, 1, 2]
      .map(j => bulk.huskTriLinks[p * 3 + j] ?? 0)
      .sort((a, b) => a - b)

    key.set(ls.join(','), p)
  }

  // the oriented husk link of the step a -> a + d
  const edge = (a: readonly number[], d: readonly number[]): [number, number] => {
    for (let h = 0; h < 9; h++) {
      const u = TRIT_HUSK_VECTORS[h] ?? []

      if (u.every((x, i) => x === d[i])) {
        return [dock(a) * 9 + h, 1]
      }

      if (u.every((x, i) => x === -(d[i] ?? 0))) {
        return [dock(a.map((x, i) => x + (d[i] ?? 0))) * 9 + h, -1]
      }
    }

    throw new Error(`no husk link along ${d.join(',')}`)
  }

  const triangle = new Int32Array(bulk.huskDocks * 12)
  const sign = new Int8Array(bulk.huskDocks * 12)

  for (let y = 0; y < bulk.huskDocks; y++) {
    const o = [y % side, Math.floor(y / side) % side, Math.floor(y / (side * side))]

    let at = 0

    for (const [u, v, w] of [
      [0, 1, 2],
      [1, 2, 0],
      [2, 0, 1],
    ] as const) {
      const eu = [0, 0, 0]
      const ev = [0, 0, 0]
      const ew = [0, 0, 0]

      eu[u] = 1
      ev[v] = 1
      ew[w] = 1

      for (const top of [true, false]) {
        const base = top ? o.map((x, i) => x + (ew[i] ?? 0)) : o
        const p0 = base
        const p1 = base.map((x, i) => x + (eu[i] ?? 0))
        const p2 = base.map((x, i) => x + (eu[i] ?? 0) + (ev[i] ?? 0))
        const p3 = base.map((x, i) => x + (ev[i] ?? 0))
        // counterclockwise seen from +w on the top face, reversed on the bottom face (outward normal -w)
        // the rising split cuts along p0 -> p2, the falling split along p1 -> p3
        const halves =
          split === 'rising'
            ? [
                [p0, p1, p2],
                [p0, p2, p3],
              ]
            : [
                [p0, p1, p3],
                [p1, p2, p3],
              ]
        const cycles = top ? halves : halves.map(c => [c[0]!, c[2]!, c[1]!])

        for (const cycle of cycles) {
          const steps = [0, 1, 2].map(j => {
            const a = cycle[j]!
            const b = cycle[(j + 1) % 3]!

            return edge(
              a,
              b.map((x, i) => x - (a[i] ?? 0)),
            )
          })
          const ls = steps.map(s => s[0]).sort((a, b) => a - b)
          const p = key.get(ls.join(','))

          if (p === undefined) {
            throw new Error('a cube face triangle is not a husk triangle')
          }

          let eps = 0

          for (let j = 0; j < 3; j++) {
            const l = bulk.huskTriLinks[p * 3 + j] ?? 0
            const s = bulk.huskTriSigns[p * 3 + j] ?? 0
            const mine = steps.find(t => t[0] === l)![1]
            const e = mine * s

            if (eps !== 0 && e !== eps) {
              throw new Error('a cube face triangle is not consistently oriented')
            }

            eps = e
          }

          triangle[y * 12 + at] = p
          sign[y * 12 + at] = eps
          at++
        }
      }
    }
  }

  return { side, triangle, sign }
}

/** Every husk triangle's seam integer n_P and centered field B_P as the rule reads them, and the exact half turns. */
export function triangleSeams(
  light: TritLight,
  angle: ArrayLike<number>,
): { n: Int32Array; field: Int32Array; halfTurns: number; strings: number } {
  const t = light.bulk.huskTriangles
  const n = new Int32Array(t)
  const field = new Int32Array(t)

  let halfTurns = 0
  let strings = 0

  for (let p = 0; p < t; p++) {
    const raw = huskCurlWeighted(light, angle, p)
    const b = centeredField(light, raw)

    field[p] = b
    n[p] = (raw - b) / light.nb
    halfTurns += b === -light.nb / 2 ? 1 : 0
    strings += n[p] !== 0 ? 1 : 0
  }

  return { n, field, halfTurns, strings }
}

export type CubeReading = {
  charges: Int32Array
  // sum |Q| over cubes, and sum Q
  monopoles: number
  net: number
  // cubes where -(1 / N_B) sum eps B_P is not the integer sum eps n_P (must be 0)
  identityFailures: number
  halfTurns: number
  // triangles with n_P != 0
  strings: number
}

export function cubeCharges(
  light: TritLight,
  cubes: Cubes,
  angle: ArrayLike<number>,
): CubeReading {
  const { n, field, halfTurns, strings } = triangleSeams(light, angle)
  const count = cubes.triangle.length / 12
  const charges = new Int32Array(count)

  let monopoles = 0
  let net = 0
  let identityFailures = 0

  for (let c = 0; c < count; c++) {
    let q = 0
    let b = 0

    for (let j = 0; j < 12; j++) {
      const p = cubes.triangle[c * 12 + j] ?? 0
      const e = cubes.sign[c * 12 + j] ?? 0

      q += e * (n[p] ?? 0)
      b += e * (field[p] ?? 0)
    }

    identityFailures += b === -light.nb * q ? 0 : 1
    charges[c] = q
    monopoles += Math.abs(q)
    net += q
  }

  return { charges, monopoles, net, identityFailures, halfTurns, strings }
}

/** The same count on a real-valued field: each triangle's branch by nearest multiple of N_B (no integer rounding). */
export function realCubeMonopoles(
  light: TritLight,
  cubes: Cubes,
  angle: ArrayLike<number>,
): number {
  const { bulk } = light
  const n = new Float64Array(bulk.huskTriangles)

  for (let p = 0; p < bulk.huskTriangles; p++) {
    n[p] = Math.round(huskCurlWeighted(light, angle, p) / light.nb)
  }

  let total = 0

  for (let c = 0; c < cubes.triangle.length / 12; c++) {
    let q = 0

    for (let j = 0; j < 12; j++) {
      q += (cubes.sign[c * 12 + j] ?? 0) * (n[cubes.triangle[c * 12 + j] ?? 0] ?? 0)
    }

    total += Math.abs(q)
  }

  return total
}

// ---------------------------------------------------------------------------------------------------------
// The harmonic vacuum

/** The eigenmodes of A0(k) on the side's momentum grid, k = 2 pi j / side per axis, j in dock order. */
export type VacuumBox = {
  readonly side: number
  readonly w: number[]
  // per momentum: the positive lambdas and their eigenvectors (real and imaginary parts, 9 each), as listed by the
  // real embedding (every complex mode twice)
  readonly lambda: number[][]
  readonly vre: number[][][]
  readonly vim: number[][][]
  readonly lambdaMax: number
}

export function vacuumBox(side: number): VacuumBox {
  const { light, w, n } = huskLight()
  const L = w.length
  const P = n.length
  const sw = w.map(Math.sqrt)
  const points = side ** 3
  const lambda: number[][] = []
  const vre: number[][][] = []
  const vim: number[][][] = []

  let lambdaMax = 0

  for (let i = 0; i < points; i++) {
    const k = [
      (2 * Math.PI * (i % side)) / side,
      (2 * Math.PI * (Math.floor(i / side) % side)) / side,
      (2 * Math.PI * Math.floor(i / (side * side))) / side,
    ]
    const { re, im } = curlAt(light, k)
    const a = Array.from({ length: 2 * L }, () => new Array<number>(2 * L).fill(0))

    for (let r = 0; r < L; r++) {
      for (let c = 0; c < L; c++) {
        let sr = 0
        let si = 0

        for (let t = 0; t < P; t++) {
          sr += n[t]! * (re[t]![r]! * re[t]![c]! + im[t]![r]! * im[t]![c]!)
          si += n[t]! * (re[t]![r]! * im[t]![c]! - im[t]![r]! * re[t]![c]!)
        }

        const x = sw[r]! * sw[c]!

        a[r]![c] = x * sr
        a[r + L]![c + L] = x * sr
        a[r]![c + L] = -x * si
        a[r + L]![c] = x * si
      }
    }

    const { values, vectors } = jacobiEigen(a)
    const top = Math.max(1, ...values.map(Math.abs))
    const ls: number[] = []
    const rs: number[][] = []
    const is: number[][] = []

    values.forEach((v, j) => {
      if (v <= 1e-9 * top) {
        return
      }

      ls.push(v)
      rs.push(vectors.slice(0, L).map(row => row[j]!))
      is.push(vectors.slice(L).map(row => row[j]!))
      lambdaMax = Math.max(lambdaMax, v)
    })

    lambda.push(ls)
    vre.push(rs)
    vim.push(is)
  }

  return { side, w, lambda, vre, vim, lambdaMax }
}

/** The vacuum variance of one mode of A0 eigenvalue lambda: (hbar / 2) / sin omega, times `scale`. */
export function modeVariance(
  lambda: number,
  depth: number,
  p: number,
  scale: number,
): number {
  const q = 2 * depth + 1
  const hbar = (4 * depth) / (2 * Math.PI)
  const omega = Math.acos(1 - (p * lambda) / q / 2)

  return (scale * hbar) / 2 / Math.sin(omega)
}

// in-place inverse DFT along one axis of a side^3 complex field (x fastest), sign +1, no normalization
function dftAxis(
  re: Float64Array,
  im: Float64Array,
  side: number,
  axis: number,
): void {
  const stride = side ** axis
  const cos = Float64Array.from({ length: side }, (_, j) => Math.cos((2 * Math.PI * j) / side))
  const sin = Float64Array.from({ length: side }, (_, j) => Math.sin((2 * Math.PI * j) / side))
  const br = new Float64Array(side)
  const bi = new Float64Array(side)
  const total = side ** 3

  for (let base = 0; base < total; base++) {
    if (Math.floor(base / stride) % side !== 0) {
      continue
    }

    for (let x = 0; x < side; x++) {
      let sr = 0
      let si = 0

      for (let j = 0; j < side; j++) {
        const at = base + j * stride
        const c = cos[(j * x) % side]!
        const s = sin[(j * x) % side]!

        sr += re[at]! * c - im[at]! * s
        si += re[at]! * s + im[at]! * c
      }

      br[x] = sr
      bi[x] = si
    }

    for (let x = 0; x < side; x++) {
      re[base + x * stride] = br[x]!
      im[base + x * stride] = bi[x]!
    }
  }
}

/** One real field A (per husk link, y * 9 + h) drawn from the harmonic vacuum with every mode variance times scale. */
export function sampleVacuum(
  box: VacuumBox,
  input: { depth: number; p?: number; scale?: number; start: number },
): Float64Array {
  const { side, w } = box
  const p = input.p ?? 1
  const scale = input.scale ?? 1
  const points = side ** 3
  const stream = makeWeyl({ start: input.start })
  const re = Array.from({ length: 9 }, () => new Float64Array(points))
  const im = Array.from({ length: 9 }, () => new Float64Array(points))

  for (let i = 0; i < points; i++) {
    const ls = box.lambda[i] ?? []

    ls.forEach((lambda, j) => {
      const amp = Math.sqrt(modeVariance(lambda, input.depth, p, scale) / 2)
      const g = stream.nextGaussian() * amp
      const vr = box.vre[i]![j]!
      const vi = box.vim[i]![j]!

      for (let h = 0; h < 9; h++) {
        re[h]![i] = re[h]![i]! + g * vr[h]!
        im[h]![i] = im[h]![i]! + g * vi[h]!
      }
    })
  }

  const a = new Float64Array(points * 9)
  const norm = Math.SQRT2 / Math.sqrt(points)

  for (let h = 0; h < 9; h++) {
    for (let axis = 0; axis < 3; axis++) {
      dftAxis(re[h]!, im[h]!, side, axis)
    }

    for (let y = 0; y < points; y++) {
      a[y * 9 + h] = (norm * re[h]![y]!) / Math.sqrt(w[h]!)
    }
  }

  return a
}

/** Round a real field to integers and put each angle in its window (axis -2D .. 2D - 1, diagonal -D .. D - 1). */
export function integerAngles(light: TritLight, a: ArrayLike<number>): Int32Array {
  return Int32Array.from({ length: light.bulk.huskLinks }, (_, l) => {
    const n = light.window[l % 9] ?? 1

    return mod(Math.round(a[l] ?? 0) + n / 2, n) - n / 2
  })
}

/**
 * The vacuum variance of the flux through each class of plaquette, from the box's modes: the husk triangle types
 * (as husk-balance lists them) and the unit square of each plane (two axis links each way, the cube's face), in
 * angle units of A (2 pi = N_B).
 */
export function vacuumFluxVariances(
  box: VacuumBox,
  input: { depth: number; p?: number; scale?: number },
): { triangle: number[]; square: number } {
  const { light } = huskLight()
  const { side, w } = box
  const p = input.p ?? 1
  const scale = input.scale ?? 1
  const points = side ** 3
  const sw = w.map(Math.sqrt)
  const triangle = new Array<number>(light.plaquettes.length).fill(0)

  let square = 0

  for (let i = 0; i < points; i++) {
    const k = [
      (2 * Math.PI * (i % side)) / side,
      (2 * Math.PI * (Math.floor(i / side) % side)) / side,
      (2 * Math.PI * Math.floor(i / (side * side))) / side,
    ]
    const { re, im } = curlAt(light, k)
    // the xy square: x link at 0, y link at +x, x link at +y (reversed), y link at 0 (reversed); and its turns
    const squares = [
      [0, 1],
      [1, 2],
      [2, 0],
    ].map(([u, v]) => {
      const sr = new Array<number>(9).fill(0)
      const si = new Array<number>(9).fill(0)
      const add = (link: number, sign: number, phase: number): void => {
        sr[link] = sr[link]! + sign * Math.cos(phase)
        si[link] = si[link]! + sign * Math.sin(phase)
      }

      add(u!, 1, 0)
      add(v!, 1, k[u!]!)
      add(u!, -1, k[v!]!)
      add(v!, -1, 0)

      return { sr, si }
    })

    ;(box.lambda[i] ?? []).forEach((lambda, j) => {
      const sigma2 = modeVariance(lambda, input.depth, p, scale) / 2
      const vr = box.vre[i]![j]!
      const vi = box.vim[i]![j]!
      const flux = (rr: number[], ri: number[]): number => {
        let ar = 0
        let ai = 0

        for (let l = 0; l < 9; l++) {
          ar += sw[l]! * (rr[l]! * vr[l]! - ri[l]! * vi[l]!)
          ai += sw[l]! * (rr[l]! * vi[l]! + ri[l]! * vr[l]!)
        }

        return ar * ar + ai * ai
      }

      re.forEach((row, t) => {
        triangle[t] = triangle[t]! + (sigma2 * flux(row, im[t]!)) / points
      })

      for (const s of squares) {
        square += (sigma2 * flux(s.sr, s.si)) / points / 3
      }
    })
  }

  return { triangle, square }
}

/** The multiplicity of each husk-balance triangle type, in its order. */
export function triangleTypeMultiplicity(): number[] {
  return huskLight().n
}

// ---------------------------------------------------------------------------------------------------------
// A planted monopole pair

/**
 * The real angles of a monopole at c1 and an antimonopole at c2 (husk coordinates), each of total flux N_B, joined by
 * a Dirac string along +x: the difference of two Dirac potentials whose strings run along +x from c1 and from c2,
 * A(r) = (N_B / 4 pi)(1 + r_x / |r|)(0, -r_z, r_y) / rho^2, rho^2 = r_y^2 + r_z^2. Each link holds its line integral
 * (midpoint rule, `points` nodes) over its weight.
 */
export function dipoleAngles(
  light: TritLight,
  c1: readonly number[],
  c2: readonly number[],
  points: number,
): Float64Array {
  const { bulk } = light
  const side = bulk.side
  const g = light.nb / (4 * Math.PI)
  const potential = (p: readonly number[], c: readonly number[]): number[] => {
    const rx = (p[0] ?? 0) - (c[0] ?? 0)
    const ry = (p[1] ?? 0) - (c[1] ?? 0)
    const rz = (p[2] ?? 0) - (c[2] ?? 0)
    const rho2 = ry * ry + rz * rz
    const r = Math.sqrt(rho2 + rx * rx)
    const f = (g * (1 + rx / r)) / rho2

    return [0, -rz * f, ry * f]
  }
  const out = new Float64Array(bulk.huskLinks)

  for (let y = 0; y < bulk.huskDocks; y++) {
    const o = [y % side, Math.floor(y / side) % side, Math.floor(y / (side * side))]

    for (let h = 0; h < 9; h++) {
      const u = TRIT_HUSK_VECTORS[h] ?? []

      let sum = 0

      for (let j = 0; j < points; j++) {
        const t = (j + 0.5) / points
        const p = o.map((x, i) => x + t * (u[i] ?? 0))
        const a1 = potential(p, c1)
        const a2 = potential(p, c2)

        for (let i = 0; i < 3; i++) {
          sum += ((a1[i] ?? 0) - (a2[i] ?? 0)) * (u[i] ?? 0)
        }
      }

      out[y * 9 + h] = sum / points / (bulk.weight[h] ?? 1)
    }
  }

  return out
}
