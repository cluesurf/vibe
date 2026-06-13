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
  const { inverseAtZeroFirst, inverseAtZeroSecond, betaFirst, betaSecond } = input
  return (inverseAtZeroFirst - inverseAtZeroSecond) / ((betaFirst - betaSecond) / TWO_PI)
}

// alpha_s(mu) by one-loop running from alpha_s(mu_0): alpha_s^-1(mu) = alpha_s^-1(mu_0) - b3/2pi ln(mu/mu_0).
export function oneLoopStrongCoupling(input: {
  couplingAtReference: number
  beta3: number
  scale: number
  referenceScale: number
}): number {
  const { couplingAtReference, beta3, scale, referenceScale } = input
  const inverse = 1 / couplingAtReference - (beta3 / TWO_PI) * Math.log(scale / referenceScale)
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
  const { couplingAtReference, beta3, referenceScale, highScale } = input
  const gamma0 = input.anomalousDimension ?? 8
  const couplingHigh = oneLoopStrongCoupling({ couplingAtReference, beta3, scale: highScale, referenceScale })
  const exponent = gamma0 / (2 * Math.abs(beta3))
  return (couplingAtReference / couplingHigh) ** exponent
}
