// The Standard Model fermion charges of one generation, the 16 of so(10) (15 SM Weyl fermions
// plus one right-handed neutrino), and the group-theory numbers they force at the unification
// scale: the weak mixing angle sin^2(theta_W) = sum T_3^2 / sum Q^2 = 3/8, and the GUT-normalized
// hypercharge trace Tr Y = sum mult (Q - T_3) = 0 (the discrete fact behind the determinant mass
// relation). All exact rational arithmetic over the charges.

// (name, weak isospin T_3, electric charge Q, multiplicity = colour x weak)
export type GenerationFermion = {
  name: string
  t3: number
  q: number
  mult: number
}

export const STANDARD_MODEL_GENERATION: GenerationFermion[] = [
  { name: 'u', t3: 0.5, q: 2 / 3, mult: 3 },
  { name: 'd', t3: -0.5, q: -1 / 3, mult: 3 },
  { name: 'nu', t3: 0.5, q: 0, mult: 1 },
  { name: 'e', t3: -0.5, q: -1, mult: 1 },
  { name: 'uc', t3: 0, q: -2 / 3, mult: 3 },
  { name: 'dc', t3: 0, q: 1 / 3, mult: 3 },
  { name: 'ec', t3: 0, q: 1, mult: 1 },
  { name: 'nuc', t3: 0, q: 0, mult: 1 },
]

// Total Weyl-fermion count of one generation (16 = 15 + 1 right-handed neutrino).
export function generationFermionCount(
  generation: GenerationFermion[] = STANDARD_MODEL_GENERATION,
): number {
  return generation.reduce((s, f) => s + f.mult, 0)
}

// sin^2(theta_W) at the unification scale: sum mult T_3^2 / sum mult Q^2 (the GUT-normalized value 3/8).
export function weinbergAngleAtUnification(
  generation: GenerationFermion[] = STANDARD_MODEL_GENERATION,
): number {
  const sumT3sq = generation.reduce(
    (s, f) => s + f.mult * f.t3 * f.t3,
    0,
  )

  const sumQsq = generation.reduce((s, f) => s + f.mult * f.q * f.q, 0)

  return sumT3sq / sumQsq
}

// The GUT-normalized hypercharge trace Tr Y = sum mult (Q - T_3) over the 16, which vanishes.
export function hyperchargeTrace(
  generation: GenerationFermion[] = STANDARD_MODEL_GENERATION,
): number {
  return generation.reduce((s, f) => s + f.mult * (f.q - f.t3), 0)
}
