// Light as a bilinear of two fear walks, solved through the walk's symbol (E-FRC-0186).
//
// The fear walk is exactly linear and unitary (code/rule/fear-walk, E-QTM-0103): a lone vibe's weight on two
// slots, the coin U = a + b HOP with 2 a = 1 + omega and 2 b = 1 - omega, then slot 0 streams one dock forward
// and slot 1 one back. On the husk a beat is a sequence of such substeps along the three axes; here the
// palindrome x y z z y x (code/measure/charged-walk uses x y y x in two dimensions, the order with a bowl at
// the bottom of the band). A plane wave is carried to itself times the 2 x 2 symbol
//
//   U(k) = S_x(k) C S_y(k) C S_z(k) C S_z(k) C S_y(k) C S_x(k) C,   C = [[a, b], [b, a]],
//   S_axis(k) = diag(e^(-i k_axis), e^(i k_axis))
//
// A composite photon is a bilinear of two walks, O_sigma(K) = sum_p psi(p)^dagger sigma phi(p + K), sigma a
// 2 x 2 matrix on the slots. Both walks are free and linear, so the pair amplitude R_p = phi(p + K) psi(p)^dagger
// is carried to U(p + K) R_p U(p)^dagger: the pair sector at total momentum K is block diagonal in the
// relative momentum p, and its spectrum is the set of differences theta_s'(p + K) - theta_s(p) over every p.
// An isolated photon branch would need a difference that does not depend on p. The infinite-temperature
// correlator of a bilinear,
//
//   C_sigma(t) = (1 / 2V) sum_p Tr[U(p)^(-t) sigma U(p + K)^t sigma^dagger]
//              = (1 / 2V) sum_p sum_(s, s') e^(i (theta_s'(p + K) - theta_s(p)) t) Tr[P_s(p) sigma P_s'(p + K) sigma^dagger]
//
// is what a coherent composite mode would keep: a photon keeps |C| near its weight on the mode forever, a
// continuum dephases it.

type Complex = [number, number]
type Matrix = [Complex, Complex, Complex, Complex]

const OMEGA: Complex = [-0.5, Math.sqrt(3) / 2]
const A: Complex = [(1 + OMEGA[0]) / 2, OMEGA[1] / 2]
const B: Complex = [(1 - OMEGA[0]) / 2, -OMEGA[1] / 2]

const mul = (x: Complex, y: Complex): Complex => [x[0] * y[0] - x[1] * y[1], x[0] * y[1] + x[1] * y[0]]
const add = (x: Complex, y: Complex): Complex => [x[0] + y[0], x[1] + y[1]]
const sub = (x: Complex, y: Complex): Complex => [x[0] - y[0], x[1] - y[1]]
const conj = (x: Complex): Complex => [x[0], -x[1]]
const div = (x: Complex, y: Complex): Complex => {
  const d = y[0] * y[0] + y[1] * y[1]

  return [(x[0] * y[0] + x[1] * y[1]) / d, (x[1] * y[0] - x[0] * y[1]) / d]
}

// row-major [m00, m01, m10, m11]
const matMul = (x: Matrix, y: Matrix): Matrix => [
  add(mul(x[0], y[0]), mul(x[1], y[2])),
  add(mul(x[0], y[1]), mul(x[1], y[3])),
  add(mul(x[2], y[0]), mul(x[3], y[2])),
  add(mul(x[2], y[1]), mul(x[3], y[3])),
]

const COIN: Matrix = [A, B, B, A]
export const ORDER = [0, 1, 2, 2, 1, 0] as const

// the symbol at k: the substeps applied in ORDER, each the coin then the stream
export function walkSymbol(k: readonly number[], order: readonly number[] = ORDER): Matrix {
  let u: Matrix = [[1, 0], [0, 0], [0, 0], [1, 0]]

  for (const axis of order) {
    const phase = k[axis] ?? 0
    const stream: Matrix = [[Math.cos(phase), -Math.sin(phase)], [0, 0], [0, 0], [Math.cos(phase), Math.sin(phase)]]

    u = matMul(stream, matMul(COIN, u))
  }

  return u
}

export type Eigen = { theta: [number, number]; projector: [Matrix, Matrix] }

// the eigenphases and spectral projectors of a 2 x 2 unitary, theta in (-pi, pi], sorted
export function eigen2(u: Matrix): Eigen {
  const trace = add(u[0], u[3])
  const det = sub(mul(u[0], u[3]), mul(u[1], u[2]))
  // lambda^2 - trace lambda + det = 0
  const disc = sub(mul(trace, trace), mul([4, 0], det))
  const r = Math.hypot(disc[0], disc[1])
  const root: Complex = [Math.sqrt((r + disc[0]) / 2), Math.sign(disc[1] || 1) * Math.sqrt(Math.max(0, (r - disc[0]) / 2))]
  const l1 = mul(add(trace, root), [0.5, 0])
  const l2 = mul(sub(trace, root), [0.5, 0])
  const projector = (l: Complex, other: Complex): Matrix => {
    const gap = sub(l, other)

    return [div(sub(u[0], other), gap), div(u[1], gap), div(u[2], gap), div(sub(u[3], other), gap)]
  }
  const t1 = Math.atan2(l1[1], l1[0])
  const t2 = Math.atan2(l2[1], l2[0])

  // a degenerate unitary is a multiple of the identity: the whole space is one eigenspace
  if (Math.hypot(l1[0] - l2[0], l1[1] - l2[1]) < 1e-12) {
    const identity: Matrix = [[1, 0], [0, 0], [0, 0], [1, 0]]
    const zero: Matrix = [[0, 0], [0, 0], [0, 0], [0, 0]]

    return { theta: [t1, t1], projector: [identity, zero] }
  }

  return t1 <= t2 ? { theta: [t1, t2], projector: [projector(l1, l2), projector(l2, l1)] } : { theta: [t2, t1], projector: [projector(l2, l1), projector(l1, l2)] }
}

// the unitarity defect of the symbol, max |U^dagger U - I|
export function unitarityDefect(u: Matrix): number {
  const d: Matrix = [conj(u[0]), conj(u[2]), conj(u[1]), conj(u[3])]
  const p = matMul(d, u)

  return Math.max(Math.hypot(p[0][0] - 1, p[0][1]), Math.hypot(p[1][0], p[1][1]), Math.hypot(p[2][0], p[2][1]), Math.hypot(p[3][0] - 1, p[3][1]))
}

export const PAULI: readonly Matrix[] = [
  [[1, 0], [0, 0], [0, 0], [1, 0]],
  [[0, 0], [1, 0], [1, 0], [0, 0]],
  [[0, 0], [0, -1], [0, 1], [0, 0]],
  [[1, 0], [0, 0], [0, 0], [-1, 0]],
]

const traceOf = (m: Matrix): Complex => add(m[0], m[3])
const dagger = (m: Matrix): Matrix => [conj(m[0]), conj(m[2]), conj(m[1]), conj(m[3])]
const wrap = (x: number): number => x - 2 * Math.PI * Math.round(x / (2 * Math.PI))

export type PairSpectrum = {
  // every pair frequency theta_s'(p + K) - theta_s(p), wrapped to (-pi, pi], with its weight for each sigma
  readonly omega: Float64Array
  readonly weight: Float64Array[]
  // same-branch pairs (s = s') flagged 1
  readonly same: Uint8Array
}

// the pair sector at K on the side^3 torus
export function pairSpectrum(side: number, kIndex: readonly number[]): PairSpectrum {
  const volume = side ** 3
  const step = (2 * Math.PI) / side
  const eig: Eigen[] = []

  for (let i = 0; i < volume; i++) {
    eig.push(eigen2(walkSymbol([(i % side) * step, (Math.floor(i / side) % side) * step, Math.floor(i / (side * side)) * step])))
  }

  const omega = new Float64Array(volume * 4)
  const weight = PAULI.map(() => new Float64Array(volume * 4))
  const same = new Uint8Array(volume * 4)

  for (let i = 0; i < volume; i++) {
    const x = i % side
    const y = Math.floor(i / side) % side
    const z = Math.floor(i / (side * side))
    const j = ((x + (kIndex[0] ?? 0)) % side) + side * ((y + (kIndex[1] ?? 0)) % side) + side * side * ((z + (kIndex[2] ?? 0)) % side)
    const here = eig[i]!
    const there = eig[j]!

    for (let s = 0; s < 2; s++) {
      for (let r = 0; r < 2; r++) {
        const at = i * 4 + s * 2 + r

        omega[at] = wrap(there.theta[r]! - here.theta[s]!)
        same[at] = s === r ? 1 : 0

        PAULI.forEach((sigma, n) => {
          const t = traceOf(matMul(matMul(here.projector[s]!, sigma), matMul(there.projector[r]!, dagger(sigma))))

          weight[n]![at] = t[0] / (2 * volume)
        })
      }
    }
  }

  return { omega, weight, same }
}

// |C_sigma(t)| from a pair spectrum, the correlator of bilinear n at beat t
export function correlator(spectrum: PairSpectrum, n: number, t: number): number {
  const w = spectrum.weight[n]!

  let re = 0
  let im = 0

  for (let i = 0; i < spectrum.omega.length; i++) {
    const phase = (spectrum.omega[i] as number) * t

    re += (w[i] as number) * Math.cos(phase)
    im += (w[i] as number) * Math.sin(phase)
  }

  return Math.hypot(re, im)
}

// the occupation of every pair eigenmode, |<s'(p + K)| R_p |s(p)>|^2, of a pair amplitude R_p after `beats`
// beats of the two free walks, R_p -> U(p + K) R_p U(p)^dagger, carried by repeated multiplication (not by the
// eigenphases, so that conservation is measured, not assumed), with the pair frequency of each mode
export function pairOccupation(side: number, kIndex: readonly number[], start: (p: number) => Matrix, beats: number): { omega: Float64Array; occupation: Float64Array } {
  const volume = side ** 3
  const step = (2 * Math.PI) / side
  const kOf = (i: number): number[] => [(i % side) * step, (Math.floor(i / side) % side) * step, Math.floor(i / (side * side)) * step]
  const omega = new Float64Array(volume * 4)
  const occupation = new Float64Array(volume * 4)

  for (let i = 0; i < volume; i++) {
    const x = i % side
    const y = Math.floor(i / side) % side
    const z = Math.floor(i / (side * side))
    const j = ((x + (kIndex[0] ?? 0)) % side) + side * ((y + (kIndex[1] ?? 0)) % side) + side * side * ((z + (kIndex[2] ?? 0)) % side)
    const u = walkSymbol(kOf(i))
    const v = walkSymbol(kOf(j))
    const here = eigen2(u)
    const there = eigen2(v)

    let r = start(i)

    for (let t = 0; t < beats; t++) {
      r = matMul(matMul(v, r), dagger(u))
    }

    for (let s = 0; s < 2; s++) {
      for (let q = 0; q < 2; q++) {
        // |<q| R |s>|^2 = Tr[P_q R P_s R^dagger]
        const t = traceOf(matMul(matMul(there.projector[q]!, r), matMul(here.projector[s]!, dagger(r))))

        omega[i * 4 + s * 2 + q] = wrap(there.theta[q]! - here.theta[s]!)
        occupation[i * 4 + s * 2 + q] = t[0]
      }
    }
  }

  return { omega, occupation }
}

// the largest same-branch pair frequency at K over the torus: the edge of the pair continuum
export function continuumEdge(spectrum: PairSpectrum): { top: number; bottom: number; count: number } {
  let top = -Infinity
  let bottom = Infinity
  let count = 0

  for (let i = 0; i < spectrum.omega.length; i++) {
    if (spectrum.same[i] === 1) {
      top = Math.max(top, spectrum.omega[i] as number)
      bottom = Math.min(bottom, spectrum.omega[i] as number)
      count += 1
    }
  }

  return { top, bottom, count }
}

// the smallest |omega| of an opposite-branch pair: the gap of the massive pair band
export function crossGap(spectrum: PairSpectrum): number {
  let gap = Infinity

  for (let i = 0; i < spectrum.omega.length; i++) {
    if (spectrum.same[i] === 0) {
      gap = Math.min(gap, Math.abs(spectrum.omega[i] as number))
    }
  }

  return gap
}
