// The gap-resolved bulk topological invariants of the chiral split-step walk, computed analytically
// from the Bloch Hamiltonian. A chiral 1D walk has TWO topological invariants, one for each of its two
// quasienergy gaps (the gap at 0 and the gap at pi), not one. Following Asboth-Obuse, they are read off
// TWO symmetric time frames: frame 1 is R(t1/2) T R(t2) T R(t1/2) and frame 2 is R(t2/2) T R(t1) T
// R(t2/2), each a chiral-symmetric walk whose Bloch vector winds an integer number of times around the
// Brillouin zone (windings nu1 and nu2). The gap invariants are nu0 = (nu1 + nu2)/2 and nuPi =
// (nu1 - nu2)/2. The bulk-boundary correspondence is then gap-resolved: an interface between two bulk
// phases binds 2|delta nu0| edge modes at the 0 gap and 2|delta nuPi| at the pi gap (the factor 2 is
// the two interfaces of a periodic ring), and the two gaps are INDEPENDENT.

type Complex = readonly [number, number]
type Mat2 = readonly [Complex, Complex, Complex, Complex] // [m00, m01, m10, m11]

const cadd = (a: Complex, b: Complex): Complex => [a[0] + b[0], a[1] + b[1]]
const cmul = (a: Complex, b: Complex): Complex => [
  a[0] * b[0] - a[1] * b[1],
  a[0] * b[1] + a[1] * b[0],
]
const mmul = (A: Mat2, B: Mat2): Mat2 => [
  cadd(cmul(A[0], B[0]), cmul(A[1], B[2])),
  cadd(cmul(A[0], B[1]), cmul(A[1], B[3])),
  cadd(cmul(A[2], B[0]), cmul(A[3], B[2])),
  cadd(cmul(A[2], B[1]), cmul(A[3], B[3])),
]

// coin R(theta) = e^{-i theta sigma_y / 2}, a real rotation
const coinMatrix = (theta: number): Mat2 => {
  const c = Math.cos(theta / 2)
  const s = Math.sin(theta / 2)
  return [[c, 0], [-s, 0], [s, 0], [c, 0]]
}
// spin-dependent translation in momentum space: e^{i k sigma_z} = diag(e^{ik}, e^{-ik})
const shiftMatrix = (k: number): Mat2 => [
  [Math.cos(k), Math.sin(k)],
  [0, 0],
  [0, 0],
  [Math.cos(k), -Math.sin(k)],
]

// one-step unitary of the symmetric frame R(outer/2) T R(inner) T R(outer/2) at momentum k
const frameU = (k: number, outer: number, inner: number): Mat2 =>
  mmul(
    coinMatrix(outer / 2),
    mmul(shiftMatrix(k), mmul(coinMatrix(inner), mmul(shiftMatrix(k), coinMatrix(outer / 2)))),
  )

// winding of the Bloch vector (in the plane perpendicular to the chiral axis sigma_x) around the BZ
function frameWinding(outer: number, inner: number, samples = 512): number {
  let previous = 0
  let total = 0
  for (let i = 0; i <= samples; i++) {
    const k = (i / samples) * 2 * Math.PI - Math.PI
    const m = frameU(k, outer, inner)
    // Bloch components perpendicular to sigma_x: a_y = Im(i(u01 - u10))/2, a_z = Im(u00 - u11)/2
    const ay = cmul([0, 1], [m[1][0] - m[2][0], m[1][1] - m[2][1]])[1] / 2
    const az = (m[0][1] - m[3][1]) / 2
    const phase = Math.atan2(az, ay)
    if (i > 0) {
      let d = phase - previous
      while (d > Math.PI) d -= 2 * Math.PI
      while (d < -Math.PI) d += 2 * Math.PI
      total += d
    }
    previous = phase
  }
  return total / (2 * Math.PI)
}

// The gap-resolved winding invariants (nu0 at the 0 gap, nuPi at the pi gap) of the split-step walk
// with coin angles (theta1, theta2), each rounded to the nearest integer.
export function gapResolvedWinding(input: {
  theta1: number
  theta2: number
}): { nu0: number; nuPi: number } {
  const nu1 = frameWinding(input.theta1, input.theta2)
  const nu2 = frameWinding(input.theta2, input.theta1)
  return {
    nu0: Math.round((nu1 + nu2) / 2),
    nuPi: Math.round((nu1 - nu2) / 2),
  }
}

// The smaller of the two quasienergy gaps (near 0 and near pi) of the uniform walk, to confirm a phase
// is gapped before its winding is used.
export function quasienergyGaps(input: {
  theta1: number
  theta2: number
}): { gapZero: number; gapPi: number } {
  let gapZero = Infinity
  let gapPi = Infinity
  const samples = 256
  for (let i = 0; i <= samples; i++) {
    const k = (i / samples) * 2 * Math.PI - Math.PI
    const m = frameU(k, input.theta1, input.theta2)
    const a0 = (m[0][0] + m[3][0]) / 2 // Re tr(U) / 2 = cos(quasienergy)
    const energy = Math.acos(Math.max(-1, Math.min(1, a0)))
    gapZero = Math.min(gapZero, energy)
    gapPi = Math.min(gapPi, Math.abs(energy - Math.PI))
  }
  return { gapZero, gapPi }
}
