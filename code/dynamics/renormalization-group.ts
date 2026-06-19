// One-loop renormalization-group running of gauge couplings and quark masses. At one loop a
// gauge coupling runs linearly in the inverse:
//   alpha_i^-1(t) = alpha_i^-1(0) - (b_i / 2pi) t,  t = ln(mu / mu_0)
// and two couplings meet at the scale t where their inverses are equal (gauge unification). A
// quark running mass scales by a power of the coupling ratio set by the anomalous dimension.

const TWO_PI = 2 * Math.PI

// alpha_i^-1 at RG time t = ln(mu/mu_0), from its value at t = 0 and the one-loop coefficient b_i.
export function oneLoopInverseCoupling(input: {
  inverseAtZero: number
  beta: number
  t: number
}): number {
  return input.inverseAtZero - (input.beta / TWO_PI) * input.t
}

// The RG time t at which two couplings (given by their t=0 inverse values and beta coefficients)
// have equal inverse coupling, the meeting / unification scale. Solving the linear equation:
//   inv1 - b1/2pi t = inv2 - b2/2pi t  ->  t = (inv1 - inv2) / ((b1 - b2)/2pi)
export function couplingMeetingTime(input: {
  inverseAtZeroFirst: number
  inverseAtZeroSecond: number
  betaFirst: number
  betaSecond: number
}): number {
  const {
    inverseAtZeroFirst,
    inverseAtZeroSecond,
    betaFirst,
    betaSecond,
  } = input

  return (
    (inverseAtZeroFirst - inverseAtZeroSecond) /
    ((betaFirst - betaSecond) / TWO_PI)
  )
}

// alpha_s(mu) by one-loop running from alpha_s(mu_0): alpha_s^-1(mu) = alpha_s^-1(mu_0) - b3/2pi ln(mu/mu_0).
export function oneLoopStrongCoupling(input: {
  couplingAtReference: number
  beta3: number
  scale: number
  referenceScale: number
}): number {
  const { couplingAtReference, beta3, scale, referenceScale } = input
  const inverse =
    1 / couplingAtReference -
    (beta3 / TWO_PI) * Math.log(scale / referenceScale)

  return 1 / inverse
}

// The QCD running-mass factor m(mu_0)/m(mu_high) = [alpha_s(mu_0)/alpha_s(mu_high)]^(gamma0 / (2 b0)),
// with the one-loop anomalous dimension gamma0 (= 6 C_F = 8 for QCD) and b0 = |b3|. This enhances a
// coloured quark mass run down from a high scale; a colourless lepton receives no QCD enhancement.
export function qcdRunningMassFactor(input: {
  couplingAtReference: number
  beta3: number
  referenceScale: number
  highScale: number
  anomalousDimension?: number
}): number {
  const { couplingAtReference, beta3, referenceScale, highScale } =
    input

  const gamma0 = input.anomalousDimension ?? 8
  const couplingHigh = oneLoopStrongCoupling({
    couplingAtReference,
    beta3,
    scale: highScale,
    referenceScale,
  })

  const exponent = gamma0 / (2 * Math.abs(beta3))

  return (couplingAtReference / couplingHigh) ** exponent
}

// PREDICT the low-energy weak mixing angle sin^2(theta_W) at M_Z as an OUTPUT (the Georgi-Quinn-Weinberg
// prediction). The inputs are the two measured couplings alpha_em^-1 and alpha_s^-1, the one-loop beta
// coefficients [b1, b2, b3] (GUT-normalized U(1)), and the hypercharge GUT-normalization factor h (the standard
// so(10)/su(5) value is 3/5, which is what makes the bare angle 3/8 at unification). Demanding that the three
// couplings meet at ONE scale gives two equations (alpha_1 = alpha_2 and alpha_2 = alpha_3 there) in the two
// unknowns sin^2 and the scale, which solve in closed form:
//   k = (b1 - b2) / (b2 - b3),   sin^2 = (h*A + k*S) / (A * (k + h + 1)),   A = alpha_em^-1, S = alpha_s^-1.
// sin^2 is NOT an input, so this is a genuine prediction. A wrong h (a hand-altered hypercharge) gives a wrong
// angle, the discriminating control.
export function predictWeinbergAngle(input: {
  alphaEmInverse: number
  alphaStrongInverse: number
  beta: [number, number, number]
  hyperchargeNorm?: number
}): number {
  const A = input.alphaEmInverse
  const S = input.alphaStrongInverse
  const h = input.hyperchargeNorm ?? 3 / 5
  const [b1, b2, b3] = input.beta
  const k = (b1 - b2) / (b2 - b3)

  return (h * A + k * S) / (A * (k + h + 1))
}

// The grand-unification scale (in GeV) and the unified inverse coupling, from the measured M_Z couplings run up
// at one loop until U(1) and SU(2) meet. Inputs are alpha_em^-1, alpha_s^-1, the measured sin^2, the beta
// coefficients, and the reference scale M_Z. Returns the meeting scale and the common inverse coupling there.
export function gutScaleAndCoupling(input: {
  alphaEmInverse: number
  alphaStrongInverse: number
  sin2: number
  beta: [number, number, number]
  referenceScaleGeV?: number
}): { gutScaleGeV: number; unifiedInverseCoupling: number } {
  const { alphaEmInverse: A, sin2, beta } = input
  const referenceScaleGeV = input.referenceScaleGeV ?? 91.19
  const inverseTwo = sin2 * A // SU(2)
  const inverseOne = (3 / 5) * (1 - sin2) * A // U(1), GUT-normalized
  const t = couplingMeetingTime({
    inverseAtZeroFirst: inverseOne,
    inverseAtZeroSecond: inverseTwo,
    betaFirst: beta[0],
    betaSecond: beta[1],
  })

  const unifiedInverseCoupling = oneLoopInverseCoupling({
    inverseAtZero: inverseOne,
    beta: beta[0],
    t,
  })

  return {
    gutScaleGeV: referenceScaleGeV * Math.exp(t),
    unifiedInverseCoupling,
  }
}

// The proton lifetime in YEARS from dimension-six decay mediated by the X/Y leptoquark bosons at the GUT scale.
// The standard estimate tau ~ M_X^4 / (alpha_GUT^2 * m_p^5), with M_X the GUT scale and m_p the proton mass, both
// in GeV. The result is in natural units (GeV^-1) and is converted to years. This is an order-of-magnitude
// prediction (the hadronic matrix element carries an O(1) factor), fixed once the GUT scale and coupling are set.
export function protonLifetimeYears(input: {
  gutScaleGeV: number
  unifiedInverseCoupling: number
  protonMassGeV?: number
}): number {
  const mProton = input.protonMassGeV ?? 0.938
  const alphaGut = 1 / input.unifiedInverseCoupling
  const lifetimeInverseGeV =
    input.gutScaleGeV ** 4 / (alphaGut ** 2 * mProton ** 5)

  const hbarGeVSeconds = 6.582119e-25 // GeV * s
  const secondsPerYear = 3.15576e7

  return (lifetimeInverseGeV * hbarGeVSeconds) / secondsPerYear
}
