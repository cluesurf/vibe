// The GOY shell model of turbulence, the standard reduced model of the Kolmogorov energy cascade. Complex shell
// velocities u_n live at logarithmically spaced wavenumbers k_n = 2^n, coupled by the same quadratic advective
// nonlinearity as the Navier-Stokes equation but restricted to neighbouring shells, with forcing at a low shell and
// viscous dissipation at high shells. In the inertial range between them the energy cascades at a constant rate and
// the shell energy follows |u_n|^2 proportional to k_n^(-2/3), so the energy spectrum E(k) = |u_n|^2 / k_n is
// proportional to k^(-5/3), the Kolmogorov law. Turning the nonlinearity off removes the cascade, the control.

type Complex = [number, number]
const mul = (a: Complex, b: Complex): Complex => [
  a[0] * b[0] - a[1] * b[1],
  a[0] * b[1] + a[1] * b[0],
]
const conj = (a: Complex): Complex => [a[0], -a[1]]
const add = (a: Complex, b: Complex): Complex => [
  a[0] + b[0],
  a[1] + b[1],
]
const scale = (a: Complex, s: number): Complex => [a[0] * s, a[1] * s]

// the time-averaged shell energy spectrum |u_n|^2 of the GOY model, integrated to a statistical steady state. With
// `nonlinear` false the advective coupling is removed (no cascade, the control).
export function goyShellSpectrum(input: {
  shells: number
  viscosity: number
  dt: number
  steps: number
  nonlinear: boolean
}): number[] {
  const { shells: n, viscosity: nu, dt, steps, nonlinear } = input
  const epsilon = 0.5
  const k = Array.from({ length: n }, (_, i) => Math.pow(2, i))

  const derivative = (u: Complex[]): Complex[] => {
    const du: Complex[] = u.map(() => [0, 0] as Complex)
    for (let i = 0; i < n; i++) {
      let advection: Complex = [0, 0]
      if (nonlinear) {
        let nl: Complex = [0, 0]
        if (i + 2 < n) {
          nl = add(nl, scale(mul(u[i + 1]!, u[i + 2]!), k[i]!))
        }

        if (i - 1 >= 0 && i + 1 < n) {
          nl = add(
            nl,
            scale(mul(u[i - 1]!, u[i + 1]!), -epsilon * k[i - 1]!),
          )
        }

        if (i - 2 >= 0) {
          nl = add(
            nl,
            scale(
              mul(u[i - 1]!, u[i - 2]!),
              -(1 - epsilon) * k[i - 2]!,
            ),
          )
        }

        advection = mul([0, 1], conj(nl)) // i times the conjugate of the nonlinear term
      }

      const dissipation: Complex = scale(u[i]!, -nu * k[i]! * k[i]!)
      du[i] = add(advection, dissipation)
      if (i === 1) {
        du[i] = add(du[i]!, [0.01, 0.01])
      } // constant forcing at a low shell
    }

    return du
  }

  let u: Complex[] = k.map((kn, i) =>
    i < 3
      ? [1e-2 * Math.cos(i), 1e-2 * Math.sin(i)]
      : [1e-4 / kn, 1e-4 / kn],
  )
  const energy = new Array<number>(n).fill(0)
  let samples = 0
  const transient = Math.floor(steps / 2)
  for (let step = 0; step < steps; step++) {
    const d1 = derivative(u)
    const mid = u.map((ui, i) => add(ui, scale(d1[i]!, dt / 2)))
    const d2 = derivative(mid)
    u = u.map((ui, i) => add(ui, scale(d2[i]!, dt)))
    if (step > transient && step % 100 === 0) {
      for (let i = 0; i < n; i++) {
        energy[i]! += u[i]![0] ** 2 + u[i]![1] ** 2
      }

      samples++
    }
  }

  return energy.map(e => e / Math.max(1, samples))
}

// the least-squares slope of log(spectrum) versus log(k) over the inertial-range shells [lo, hi]
export function spectrumSlope(input: {
  spectrum: number[]
  lo: number
  hi: number
}): number {
  const xs: number[] = []
  const ys: number[] = []
  for (let i = input.lo; i <= input.hi; i++) {
    const e = input.spectrum[i]!
    if (e > 0) {
      xs.push(Math.log(Math.pow(2, i)))
      ys.push(Math.log(e))
    }
  }

  const mx = xs.reduce((a, b) => a + b, 0) / xs.length
  const my = ys.reduce((a, b) => a + b, 0) / ys.length
  let sxy = 0
  let sxx = 0
  for (let i = 0; i < xs.length; i++) {
    sxy += (xs[i]! - mx) * (ys[i]! - my)
    sxx += (xs[i]! - mx) ** 2
  }

  return sxy / sxx
}
