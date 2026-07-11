// Frontier 4, the amplitude scaling: an internal-consistency check of the standard quadrupole
// strain formula. The strain h = (2 G / r) Qddot is STATED here (it is the standard linearised-GR
// radiation result), and this experiment verifies that numerical exponent extraction on that
// formula recovers exactly the dependences the formula implies: h ~ G^1 r^-1 omega^2 a^2 mu^1.
// That is a dimensional-analysis check of the formula's internal consistency, not a measurement
// of radiation from the substrate. The formula defines the exponents, so the extraction cannot
// fail on it, and the experiment is graded accordingly.
//
// What makes the check non-vacuous is the COMPUTED control: the same exponent extraction is run
// on a dipole-type strain formula h = (2 G / r) Ddot (the time derivative of a source dipole
// moment), and its exponents come out as omega^1 and a^1, DIFFERENT from the quadrupole's
// omega^2 and a^2. So the extraction machinery genuinely discriminates quadrupole scaling from
// dipole scaling, it just cannot tell whether the substrate radiates quadrupole, because the
// formula is an input here.
//
// Why the relabel path was taken: the preferred fix would source the strain from the linearised
// Einstein operator in code/operator/ driven by the binary's stress tensor, so the exponents
// would be outputs of the derived operator. That operator (linearized-einstein.ts) is a static
// momentum-space object on a periodic lattice, and sourcing it with a retarded time-dependent
// binary stress tensor needs a full lattice wave solver, well beyond a clean bounded change. So
// this file is relabelled honestly instead: the formula is an input, the exponents verify its
// internal consistency, and the dipole control shows the extraction is discriminating.
//
// What still carries content: the G^1 dependence connects the formula to the DERIVED Newton
// constant (E-GRV-0028), and Qddot is evaluated numerically from the binary source rather than
// written as a closed form. But neither changes the fact that the formula itself is assumed.
//
// Grade L1: a dimensional-analysis consistency check of the standard quadrupole formula, with a
// computed dipole-formula control showing the exponent extraction discriminates.

import { experiment } from '@/test/scaffold/suite'
import { verdict } from '@/test/scaffold/verdict'

// the source quadrupole acceleration amplitude for an equal-mass binary (reduced mass mu,
// separation a, angular frequency omega), evaluated numerically from the source trajectory.
function qddotAmplitude(mu: number, a: number, omega: number): number {
  const steps = 4000
  const period = (2 * Math.PI) / omega
  const dt = (4 * period) / steps
  const q: number[] = []

  for (let s = 0; s < steps; s++) {
    const th = omega * (s * dt)
    const x = (a / 2) * Math.cos(th)
    const y = (a / 2) * Math.sin(th)
    const r2 = x * x + y * y

    q.push(2 * (mu / 2) * (3 * x * x - r2)) // traceless Q_xx over both masses
  }

  let maxAccel = 0

  for (let i = 1; i < steps - 1; i++) {
    const acc = (q[i + 1]! - 2 * q[i]! + q[i - 1]!) / (dt * dt)

    maxAccel = Math.max(maxAccel, Math.abs(acc))
  }

  return maxAccel
}

// the control source: the time derivative of a single-body dipole moment D = mu (a/2) cos(omega t),
// evaluated numerically the same way, so the dipole-type formula scales as omega^1 a^1
function ddotAmplitude(mu: number, a: number, omega: number): number {
  const steps = 4000
  const period = (2 * Math.PI) / omega
  const dt = (4 * period) / steps
  const d: number[] = []

  for (let s = 0; s < steps; s++) {
    const th = omega * (s * dt)

    d.push(mu * (a / 2) * Math.cos(th))
  }

  let maxV = 0

  for (let i = 1; i < steps - 1; i++) {
    const v = (d[i + 1]! - d[i - 1]!) / (2 * dt)

    maxV = Math.max(maxV, Math.abs(v))
  }

  return maxV
}

// the stated quadrupole strain formula h = (2 G / r) |Qddot|
function strain(
  G: number,
  r: number,
  mu: number,
  a: number,
  omega: number,
): number {
  return ((2 * G) / r) * qddotAmplitude(mu, a, omega)
}

// the dipole-type control formula h = (2 G / r) |Ddot|
function dipoleStrain(
  G: number,
  r: number,
  mu: number,
  a: number,
  omega: number,
): number {
  return ((2 * G) / r) * ddotAmplitude(mu, a, omega)
}

// scaling exponent of a one-parameter function, from its value at p and 2p
function exponent(f: (p: number) => number, p: number): number {
  return Math.log2(f(2 * p) / f(p))
}

export default experiment({
  id: 'gravity/quadrupole-amplitude-scale',
  code: 'E-GRV-0044',
  title:
    'the standard quadrupole strain formula h = (2G/r) Qddot is internally consistent: numerical exponent extraction on the stated formula recovers G^1 r^-1 omega^2 a^2 mu^1 exactly (a dimensional-analysis check of the formula, not a measurement of substrate radiation), and the same extraction on a dipole formula h = (2G/r) Ddot gives omega^1 a^1, so the extraction machinery discriminates quadrupole from dipole scaling',
  category: 'gravity',
  substrates: 'any',
  depth: 'L1',
  paper: true,
  run() {
    const base = { G: 1, r: 10, mu: 1, a: 1, omega: 1 }

    const expR = exponent(
      r => strain(base.G, r, base.mu, base.a, base.omega),
      base.r,
    )

    const expOmega = exponent(
      w => strain(base.G, base.r, base.mu, base.a, w),
      base.omega,
    )

    const expA = exponent(
      a => strain(base.G, base.r, base.mu, a, base.omega),
      base.a,
    )

    const expMu = exponent(
      mu => strain(base.G, base.r, mu, base.a, base.omega),
      base.mu,
    )

    const expG = exponent(
      G => strain(G, base.r, base.mu, base.a, base.omega),
      base.G,
    )

    // the computed control: the same extraction on the dipole-type formula
    const expOmegaDipole = exponent(
      w => dipoleStrain(base.G, base.r, base.mu, base.a, w),
      base.omega,
    )

    const expADipole = exponent(
      a => dipoleStrain(base.G, base.r, base.mu, a, base.omega),
      base.a,
    )

    // 1. the amplitude falls as 1/r (as the formula implies).
    const radiationFalloff = Math.abs(expR + 1) < 1e-3

    // 2. the quadrupole formula's frequency and size dependences: omega^2 and a^2.
    const quadrupoleFrequency = Math.abs(expOmega - 2) < 1e-3
    const quadrupoleSize = Math.abs(expA - 2) < 1e-3

    // 3. linear in the source mass and in G (as the formula implies).
    const linearInSource = Math.abs(expMu - 1) < 1e-3
    const linearInG = Math.abs(expG - 1) < 1e-3

    // 4. the control: the dipole formula gives DIFFERENT exponents, omega^1 and a^1,
    //    so the extraction machinery discriminates and is not vacuous.
    const dipoleDiffers =
      Math.abs(expOmegaDipole - 1) < 1e-3 &&
      Math.abs(expADipole - 1) < 1e-3

    const solved =
      radiationFalloff &&
      quadrupoleFrequency &&
      quadrupoleSize &&
      linearInSource &&
      linearInG &&
      dipoleDiffers

    return verdict({
      status: solved ? 'pass' : 'fail',
      claim:
        'numerical exponent extraction on the stated quadrupole strain formula h = (2 G / r) Qddot recovers exactly G to the first power, one over r, omega squared, a squared, and mu to the first power, which verifies the internal consistency of the standard quadrupole formula (a dimensional-analysis check, since the formula defines these exponents and is an input here, not a measurement of substrate radiation), while the same extraction on a dipole formula h = (2 G / r) Ddot gives omega to the first power and a to the first power, so the extraction machinery itself discriminates quadrupole from dipole scaling and the check is not vacuous',
      metrics: {
        exponentVsR: Number(expR.toFixed(4)),
        exponentVsOmega: Number(expOmega.toFixed(4)),
        exponentVsA: Number(expA.toFixed(4)),
        exponentVsMu: Number(expMu.toFixed(4)),
        exponentVsG: Number(expG.toFixed(4)),
        dipoleExponentVsOmega: Number(expOmegaDipole.toFixed(4)),
        dipoleExponentVsA: Number(expADipole.toFixed(4)),
      },
      control: {
        // the dipole-type formula, run through the SAME extraction, gives omega^1 and a^1
        // instead of the quadrupole omega^2 and a^2. This is computed, not quoted, so the
        // exponent extraction is shown to discriminate between the two formula classes.
        dipoleExponentVsOmega: Number(expOmegaDipole.toFixed(4)),
        dipoleExponentVsA: Number(expADipole.toFixed(4)),
        quadrupoleExponentVsOmega: Number(expOmega.toFixed(4)),
        quadrupoleExponentVsA: Number(expA.toFixed(4)),
      },
      notes:
        'L1. Relabel path taken (not the operator rewiring): the strain formula h = (2 G / r) Qddot is an INPUT stated in this file, so the recovered exponents verify the internal consistency of the standard quadrupole formula, a dimensional-analysis check, not a measurement of radiation from the substrate. The preferred rewiring (sourcing the linearised Einstein operator in code/operator/ with the binary stress tensor so the exponents are operator outputs) needs a retarded lattice wave solver and was judged beyond a clean bounded change. The computed control runs the identical extraction on a dipole formula h = (2 G / r) Ddot and gets omega^1 a^1 (quadrupole gives omega^2 a^2), so the machinery discriminates. Qddot is evaluated numerically from the binary trajectory and the G^1 dependence ties the formula to the derived Newton constant (E-GRV-0028), but the formula itself remains assumed. Deterministic, no random.',
    })
  },
})
