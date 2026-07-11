// The nuclear binding curve, the Bethe-Weizsacker semi-empirical mass formula (the liquid-drop model). The binding
// energy of a nucleus of mass number A and proton number Z (in MeV) is a sum of competing terms,
//
//   B(A, Z) = a_V A - a_S A^(2/3) - a_C Z(Z-1)/A^(1/3) - a_A (A - 2Z)^2 / A + pairing,
//
// the volume term (each nucleon binds to its neighbors, favors large A), the surface term (the surface nucleons bind
// less, penalizes small A), the Coulomb term (the protons repel, penalizes large Z, so large A), the asymmetry term
// (a neutron-proton imbalance costs energy), and the pairing term (paired nucleons bind more). The binding energy per
// nucleon B/A rises from light nuclei, PEAKS in the iron region (A about 56 to 62) at about 8.8 MeV, and slowly
// declines for heavy nuclei. The peak is the competition between the surface term (hurts light nuclei) and the
// Coulomb term (hurts heavy nuclei). Turning off the Coulomb term removes the decline, B/A then rises monotonically,
// no iron peak, the proof that the Coulomb repulsion is what makes iron the most bound nucleus.

const VOLUME = 15.75
const SURFACE = 17.8
const COULOMB = 0.711
const ASYMMETRY = 23.7
const PAIRING = 11.18

function pairingTerm(input: {
  massNumber: number
  protonNumber: number
}): number {
  const a = input.massNumber
  const z = input.protonNumber
  const n = a - z
  const zEven = z % 2 === 0
  const nEven = n % 2 === 0

  if (zEven && nEven) return PAIRING / Math.sqrt(a)

  if (!zEven && !nEven) return -PAIRING / Math.sqrt(a)

  return 0
}

// the total binding energy B(A, Z) in MeV. With includeCoulomb false the Coulomb term is dropped (the control that
// removes the iron peak).
export function nuclearBindingEnergy(input: {
  massNumber: number
  protonNumber: number
  includeCoulomb?: boolean
}): number {
  const a = input.massNumber
  const z = input.protonNumber
  const coulomb =
    input.includeCoulomb === false
      ? 0
      : (COULOMB * z * (z - 1)) / Math.cbrt(a)

  return (
    VOLUME * a -
    SURFACE * Math.pow(a, 2 / 3) -
    coulomb -
    (ASYMMETRY * (a - 2 * z) * (a - 2 * z)) / a +
    pairingTerm({ massNumber: a, protonNumber: z })
  )
}

// the binding energy per nucleon B/A (MeV) for the most-bound (valley-of-stability) isobar at a given A, the Z that
// maximizes B/A
export function bindingPerNucleonAtMass(input: {
  massNumber: number
  includeCoulomb?: boolean
}): {
  protonNumber: number
  bindingPerNucleon: number
} {
  let best = {
    protonNumber: 0,
    bindingPerNucleon: Number.NEGATIVE_INFINITY,
  }

  for (let z = 1; z < input.massNumber; z++) {
    const bpa =
      nuclearBindingEnergy({
        massNumber: input.massNumber,
        protonNumber: z,
        includeCoulomb: input.includeCoulomb,
      }) / input.massNumber

    if (bpa > best.bindingPerNucleon)
      best = { protonNumber: z, bindingPerNucleon: bpa }
  }

  return best
}

// the peak of the binding curve, the mass number A that maximizes B/A along the valley of stability (the iron peak)
export function bindingCurvePeak(
  input: { maxMass?: number; includeCoulomb?: boolean } = {},
): {
  massNumber: number
  protonNumber: number
  bindingPerNucleon: number
} {
  const maxMass = input.maxMass ?? 250

  let best = {
    massNumber: 0,
    protonNumber: 0,
    bindingPerNucleon: Number.NEGATIVE_INFINITY,
  }

  for (let a = 2; a <= maxMass; a++) {
    const at = bindingPerNucleonAtMass({
      massNumber: a,
      includeCoulomb: input.includeCoulomb,
    })

    if (at.bindingPerNucleon > best.bindingPerNucleon) {
      best = {
        massNumber: a,
        protonNumber: at.protonNumber,
        bindingPerNucleon: at.bindingPerNucleon,
      }
    }
  }

  return best
}
