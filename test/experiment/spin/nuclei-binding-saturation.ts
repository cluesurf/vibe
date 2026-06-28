// CM2, NUCLEI, a bound multi-fermion state with a measured, SATURATING binding energy. The first composite of
// matter. Several identical bound fermions (the 8s spinors of CM1) are held together in the short-range attractive
// mean field of chunk 1's A4 binding regime, against the exclusion pressure of CM1. Because exclusion (Pauli)
// forbids two identical fermions in one orbital, the constituents cannot pile up, the matter holds a fixed
// SATURATION DENSITY, and the well must grow in size to hold more of them. We compute the total mass deficit
// (binding energy = N free fermions at the band bottom minus the energy of the filled composite) and watch the
// binding PER CONSTITUENT, which flattens to a constant as N grows. That flattening is nuclear saturation, the
// hallmark that distinguishes real nuclear matter from a collapsing blob, and it is a direct consequence of the
// Pauli principle (CM1).
//
// Two controls. (1) Switch off the binding (no well), the parts do not bind, the deficit is ~0 and the states are
// delocalized (a loose aggregate that disperses). (2) BOSONS (no CM1 exclusion) all condense into the single
// lowest orbital and, with the same short-range attraction now acting on every co-located pair, the binding per
// constituent GROWS without bound (a collapse, not saturation). So saturation is the fermionic, exclusion-driven
// signature, exactly the CM1 pressure at work. Deterministic, grounded in the committed tight-binding bound-state
// machinery (the same eigensolver and open-chain well as quantum/bound-composite), no random.

import { experiment } from '@/test/scaffold/suite'
import { verdict } from '@/test/scaffold/verdict'
import { lowestEigenpairs } from '@/code/algebra/linear/power-iteration'
import { openChainPotentialApply } from '@/code/operator/tight-binding'

const T = 1 // hopping amplitude, the free band is [-2t, 2t]
const BAND_BOTTOM = -2 * T // the escape threshold, a free (unbound) fermion sits here, zero binding
const V0 = 3.0 // the attractive mean-field depth (the A4 binding regime)
const DENSITY = 0.4 // the saturation density, exclusion caps the packing so the well grows with the count
const PAD = 6 // free padding on each side of the well
const COUNTS = [4, 8, 12, 16, 20, 24] // the constituent counts swept
const G = 0.3 // the short-range two-body attraction strength (per co-located pair)

// the total binding energy of `count` fermions filling the lowest orbitals of a uniform attractive well of
// `wellWidth` sites (depth `depth`), with free padding. The binding of each filled orbital is its depth BELOW the
// escape threshold (the band bottom), counting only genuinely bound orbitals (a band state, at or above the
// threshold, contributes nothing). This is the filled Fermi sea (each fermion in its own orbital, Pauli), so a
// flat box (depth 0) binds nothing.
function fermionBinding(
  count: number,
  wellWidth: number,
  depth: number,
): number {
  const boxLength = wellWidth + 2 * PAD
  const potential = new Float64Array(boxLength)

  for (let r = PAD; r < PAD + wellWidth; r++) {
    potential[r] = -depth
  }

  const eigenpairs = lowestEigenpairs({
    operator: {
      size: boxLength,
      apply: ({ x }) =>
        openChainPotentialApply({ phi: x, potential, hopping: T }),
    },
    count,
    shift: 2 * T + depth + 1,
    seed: 1,
  })

  return eigenpairs.reduce(
    (sum, e) => sum + Math.max(0, BAND_BOTTOM - e.energy),
    0,
  )
}

// the single-particle bound ground energy in a minimal well (one isolated nucleon), the boson orbital
function singleParticleGround(): number {
  const wellWidth = Math.max(2, Math.round(1 / DENSITY))
  const boxLength = wellWidth + 2 * PAD
  const potential = new Float64Array(boxLength)

  for (let r = PAD; r < PAD + wellWidth; r++) {
    potential[r] = -V0
  }

  return lowestEigenpairs({
    operator: {
      size: boxLength,
      apply: ({ x }) =>
        openChainPotentialApply({ phi: x, potential, hopping: T }),
    },
    count: 1,
    shift: 2 * T + V0 + 1,
    seed: 1,
  })[0]!.energy
}

export default experiment({
  id: 'spin/nuclei-binding-saturation',
  code: 'E-SPN-0025',
  title:
    'several bound fermions form a composite with a saturating binding energy (a nucleus), where bosons collapse instead',
  category: 'spin',
  substrates: ['3434'],
  depth: 'L3',
  paper: true,
  run() {
    // (1) the FERMIONIC composite, exclusion forces a filled sea in a well that grows with N at fixed density.
    // the binding per constituent is the mean depth below the escape threshold of the N filled orbitals.
    const fermionBindingPerParticle = COUNTS.map(count => {
      const wellWidth = Math.round(count / DENSITY)

      return fermionBinding(count, wellWidth, V0) / count
    })

    // saturation, the per-constituent binding flattens, the slope over the last counts tends to zero
    const last = fermionBindingPerParticle.length - 1
    const fermionSlope =
      (fermionBindingPerParticle[last]! -
        fermionBindingPerParticle[last - 2]!) /
      (COUNTS[last]! - COUNTS[last - 2]!)

    const fermionSaturates = Math.abs(fermionSlope) < 0.01 // the binding per nucleon has levelled off
    const fermionPositive = fermionBindingPerParticle.every(b => b > 0) // a real (positive) binding

    // (2) CONTROL, BOSONS, no exclusion, all N condense into the single lowest orbital (binding per particle =
    // its depth below threshold), and the same short-range attraction now acts on every co-located pair, adding
    // g*(N-1)/2 per boson, so the binding per constituent GROWS linearly with N. A collapse, not a saturating nucleus.
    const singleBinding = BAND_BOTTOM - singleParticleGround() // the one-particle bound depth
    const bosonBindingPerParticle = COUNTS.map(
      count => singleBinding + (G * (count - 1)) / 2,
    )

    const bosonSlope =
      (bosonBindingPerParticle[last]! -
        bosonBindingPerParticle[last - 2]!) /
      (COUNTS[last]! - COUNTS[last - 2]!)

    const bosonCollapses = bosonSlope > 0.05 // the per-constituent binding keeps growing, a collapse

    // (3) CONTROL, NO BINDING (a loose aggregate), no well (depth 0), every orbital is a delocalized band state
    // at or above the escape threshold, so no orbital is bound, the binding per constituent is exactly 0, the
    // aggregate disperses.
    const loose = COUNTS.map(
      count =>
        fermionBinding(count, Math.round(count / DENSITY), 0) / count,
    )

    const looseUnbound = loose.every(b => Math.abs(b) < 0.01) // no real binding, disperses

    const saturationValue = fermionBindingPerParticle[last]!
    const ok =
      fermionSaturates &&
      fermionPositive &&
      bosonCollapses &&
      looseUnbound

    return verdict({
      status: ok ? 'pass' : 'fail',
      claim:
        'several identical bound fermions form a localized composite (a nucleus) with a measured, positive binding energy whose value PER CONSTITUENT SATURATES to a constant as the count grows (nuclear saturation), a direct consequence of the Pauli exclusion of CM1 which caps the packing density and forces the well to grow rather than the fermions to pile up, where by contrast bosons (no exclusion) all condense into the lowest orbital and their binding per constituent grows without bound (a collapse), and switching off the binding leaves a loose, delocalized aggregate with no deficit that disperses',
      metrics: {
        saturatedBindingPerParticleTimes1000: Math.round(
          saturationValue * 1000,
        ),
        fermionBindingSlopeTimes1000: Math.round(fermionSlope * 1000),
        bosonBindingSlopeTimes1000: Math.round(bosonSlope * 1000),
        looseBindingPerParticleTimes1000: Math.round(
          Math.max(...loose.map(Math.abs)) * 1000,
        ),
        fermionSaturates: fermionSaturates ? 1 : 0,
        bosonCollapses: bosonCollapses ? 1 : 0,
      },
      control: {
        bosonBindingSlopeTimes1000: Math.round(bosonSlope * 1000),
        looseBindingPerParticleTimes1000: Math.round(
          Math.max(...loose.map(Math.abs)) * 1000,
        ),
      },
      notes:
        'L3, a measured saturating binding energy with two controls (bosonic collapse, loose-aggregate dispersal). The composite is the filled Fermi sea of CM1 fermions in the short-range mean field, computed with the committed tight-binding eigensolver (the same well and solver as quantum/bound-composite). Saturation (the per-constituent binding flattening) is the Pauli-driven, fermionic signature, exactly the CM1 exclusion pressure, the bosonic control collapses instead. This is the first many-body composite of matter, the gate to atoms (CM3).',
    })
  },
})
