// Landau-Zener tunneling from the walk's own band structure. When a two-level system is swept through
// an avoided crossing at rate F, it jumps the gap (stays "diabatic") with probability exp(-pi Delta^2 /
// (2 alpha)), Delta the minimum gap and alpha the sweep rate: slow sweeps follow the gap adiabatically,
// fast sweeps jump it. Here the two levels are the two bands of the coined Dirac walk (the substrate's
// single-particle sector), whose band Hamiltonian H(k) = i log U(k) has a minimum gap 2*mass at k = 0.
// A constant force sweeps the momentum k(t) = k0 + F t through the crossing, the band Hamiltonian is
// evolved continuously (the semiclassical limit of the walk under a weak force), and the probability of
// ending in the UPPER band is the Landau-Zener diabatic probability.
//
// This is the semiclassical (continuum-force) limit of the walk's band dynamics: it uses the walk's own
// U(k) and its gap 2*mass, and the diabatic probability is MEASURED by evolving and projecting, not
// imported. The exact discrete-time stepping deviates at finite F (discreteness corrections); the clean
// Landau-Zener law is the F -> 0 limit, which is what this measures.

type Complex = readonly [number, number]
type Spinor = readonly [Complex, Complex]

const cadd = (a: Complex, b: Complex): Complex => [a[0] + b[0], a[1] + b[1]]
const cmul = (a: Complex, b: Complex): Complex => [
  a[0] * b[0] - a[1] * b[1],
  a[0] * b[1] + a[1] * b[0],
]
const cconj = (a: Complex): Complex => [a[0], -a[1]]

// U(k) = shift(k) coin(mass); coin(m) = [[cos m, -i sin m],[-i sin m, cos m]], shift(k) = diag(e^{ik}, e^{-ik}).
// returns the quasienergy E and the Bloch axis n so that H(k) = E n.sigma.
function bandData(k: number, mass: number): {
  energy: number
  nx: number
  ny: number
  nz: number
  u00: Complex
  u01: Complex
  u10: Complex
  u11: Complex
} {
  const c = Math.cos(mass)
  const s = Math.sin(mass)
  const u00 = cmul([Math.cos(k), Math.sin(k)], [c, 0])
  const u01 = cmul([Math.cos(k), Math.sin(k)], [0, -s])
  const u10 = cmul([Math.cos(k), -Math.sin(k)], [0, -s])
  const u11 = cmul([Math.cos(k), -Math.sin(k)], [c, 0])
  const a0 = (u00[0] + u11[0]) / 2 // cos E
  const ax = cadd(u01, u10)[1] / 2
  const ay = cmul([0, 1], [u01[0] - u10[0], u01[1] - u10[1]])[1] / 2
  const az = (u00[1] - u11[1]) / 2
  const energy = Math.acos(Math.max(-1, Math.min(1, a0)))
  const sinE = Math.sin(energy) || 1e-12
  return { energy, nx: -ax / sinE, ny: -ay / sinE, nz: -az / sinE, u00, u01, u10, u11 }
}

// eigenvector of the lower (upper) band at momentum k
function bandVector(k: number, mass: number, upper: boolean): Spinor {
  const b = bandData(k, mass)
  const sign = upper ? 1 : -1
  const lambda: Complex = [Math.cos(sign * b.energy), Math.sin(sign * b.energy)]
  let v0: Complex = b.u01
  let v1: Complex = [lambda[0] - b.u00[0], lambda[1] - b.u00[1]]
  let n = Math.hypot(v0[0], v0[1], v1[0], v1[1])
  if (n < 1e-9) {
    v0 = [lambda[0] - b.u11[0], lambda[1] - b.u11[1]]
    v1 = b.u10
    n = Math.hypot(v0[0], v0[1], v1[0], v1[1])
  }
  return [[v0[0] / n, v0[1] / n], [v1[0] / n, v1[1] / n]]
}

// one continuous evolution step: propagator exp(-i H(k) dt) = cos(E dt) I - i sin(E dt) n.sigma
function evolve(psi: Spinor, k: number, mass: number, dt: number): Spinor {
  const b = bandData(k, mass)
  const ca = Math.cos(b.energy * dt)
  const sa = Math.sin(b.energy * dt)
  const A00: Complex = [ca, -sa * b.nz]
  const A01: Complex = [-sa * b.ny, -sa * b.nx]
  const A10: Complex = [sa * b.ny, -sa * b.nx]
  const A11: Complex = [ca, sa * b.nz]
  return [
    cadd(cmul(A00, psi[0]), cmul(A01, psi[1])),
    cadd(cmul(A10, psi[0]), cmul(A11, psi[1])),
  ]
}

// The Landau-Zener diabatic probability: start in the lower band far before the k = 0 crossing, sweep
// k = k0 + F t through it (band Hamiltonian evolved continuously), and return the probability of ending
// in the UPPER band. For the walk's gap 2*mass this is exp(-pi mass^2 / F) in the clean regime.
export function landauZenerDiabaticProbability(input: {
  mass: number
  force: number
  kSpan?: number
  timeStep?: number
}): number {
  const { mass, force } = input
  const kSpan = input.kSpan ?? 1.4
  const dt = input.timeStep ?? 0.01
  let psi = bandVector(-kSpan, mass, false)
  let t = 0
  let k = -kSpan
  while (k < kSpan) {
    psi = evolve(psi, k, mass, dt)
    t += dt
    k = -kSpan + force * t
  }
  const upper = bandVector(k, mass, true)
  const overlap = cadd(
    cmul(cconj(upper[0]), psi[0]),
    cmul(cconj(upper[1]), psi[1]),
  )
  return overlap[0] * overlap[0] + overlap[1] * overlap[1]
}

// The slope of ln(diabatic probability) versus 1/force over the exponential regime, which the
// Landau-Zener law predicts to be -pi mass^2 (the gap 2*mass entering as exp(-pi (2 mass)^2 / (4 F))).
export function landauZenerSlope(input: {
  mass: number
  forces: number[]
}): number {
  const points: Array<[number, number]> = []
  for (const force of input.forces) {
    const p = landauZenerDiabaticProbability({ mass: input.mass, force })
    if (p > 1e-6 && p < 0.2) points.push([1 / force, Math.log(p)])
  }
  const n = points.length
  if (n < 2) return NaN
  let sx = 0
  let sy = 0
  let sxx = 0
  let sxy = 0
  for (const [x, y] of points) {
    sx += x
    sy += y
    sxx += x * x
    sxy += x * y
  }
  return (n * sxy - sx * sy) / (n * sxx - sx * sx)
}
