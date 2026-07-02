// The imaginary unit is not a base ingredient. It is the rotation between the
// lattice's forward and backward slots.
//
// Every quantum-walk experiment in the suite hand-codes a complex amplitude and its
// i (E-QTM-0004, E-QTM-0023, E-QTM-0024). The Born rule is derived (E-QTM-0005,
// E-QTM-0012) and measurement is settled (E-QTM-0016, E-QTM-0019), but the imaginary
// unit has been the one imported piece. This closes that gap on the mechanism.
//
// A quantum amplitude a + i b is a real two-component object (a, b), and multiplying
// by a phase is a real rotation of the pair. The lattice already carries a natural
// two-component structure: every direction has an opposite, so a cell holds a
// forward slot and a backward slot. This runs a PURELY REAL two-component walk on
// those two slots, with a REAL rotation coin (cos, sin, no complex arithmetic
// anywhere), and shows it produces genuine quantum-walk interference:
//   - it is unitary (the summed intensity is conserved),
//   - it spreads ballistically (support grows like the step count, not its root), and
//   - it develops the quantum-walk DOUBLE HORN, with the probability piled at the
//     ballistic edges, not the centre.
// A classical incoherent walk on the same lattice gives a single central hump. So the
// interference, the signature that normally needs i, comes from the real rotation
// between the two real slots. The effective i is that rotation.
//
// This shows the imaginary unit of quantum mechanics is emergent, a bookkeeping of
// the lattice's opposite-direction pairs, with none in the base. Honest scope: this
// is the mechanism on a minimal two-slot walk. Lifting it onto the full committed
// lattice-gas rule over the {3,4,3,4} coin's 24 opposite-paired directions is the
// next step and is noted, not claimed.
//
// Grade L2: a real two-component walk produces the quantum interference signature as
// a measured consequence, with a classical control that gives only a central hump,
// and with NO imaginary unit in the dynamics.

import { experiment } from '@/test/scaffold/suite'
import { verdict } from '@/test/scaffold/verdict'

const SITES = 600
const STEPS = 180
const THETA = Math.PI / 4 // the rotation coin angle

// A purely real two-component walk. `coupled` mixes the forward (R) and backward (L)
// slots by a real rotation (the coin); the shift moves R right and L left. No complex
// numbers. Returns the intensity R^2 + L^2 and its conserved norm.
function realTwoComponentWalk(coupled: boolean): { intensity: Float64Array; norm: number } {
  let forward = new Float64Array(SITES)
  let backward = new Float64Array(SITES)

  const start = SITES >> 1
  forward[start] = 1 / Math.SQRT2
  backward[start] = 1 / Math.SQRT2

  const c = coupled ? Math.cos(THETA) : 1
  const s = coupled ? Math.sin(THETA) : 0

  for (let t = 0; t < STEPS; t++) {
    const nextForward = new Float64Array(SITES)
    const nextBackward = new Float64Array(SITES)

    for (let x = 0; x < SITES; x++) {
      const r = forward[x] ?? 0
      const l = backward[x] ?? 0
      const rotatedForward = c * r + s * l
      const rotatedBackward = -s * r + c * l

      if (x + 1 < SITES) {
        nextForward[x + 1] += rotatedForward
      }

      if (x - 1 >= 0) {
        nextBackward[x - 1] += rotatedBackward
      }
    }

    forward = nextForward
    backward = nextBackward
  }

  const intensity = new Float64Array(SITES)

  let norm = 0

  for (let x = 0; x < SITES; x++) {
    intensity[x] = (forward[x] ?? 0) ** 2 + (backward[x] ?? 0) ** 2
    norm += intensity[x] ?? 0
  }

  return { intensity, norm }
}

// A classical incoherent walk: probabilities split and add, no phase, no rotation.
function classicalWalk(): Float64Array {
  let probability = new Float64Array(SITES)
  probability[SITES >> 1] = 1

  for (let t = 0; t < STEPS; t++) {
    const next = new Float64Array(SITES)

    for (let x = 0; x < SITES; x++) {
      if (x + 1 < SITES) {
        next[x + 1] += 0.5 * (probability[x] ?? 0)
      }

      if (x - 1 >= 0) {
        next[x - 1] += 0.5 * (probability[x] ?? 0)
      }
    }

    probability = next
  }

  return probability
}

// The support radius (99 percent of the mass) and the ratio of mass in the outer
// shells to the central shells. A double horn piles mass at the edges (ratio above
// one); a diffusive hump piles it at the centre (ratio below one).
function profile(distribution: Float64Array): { support: number; edgeOverCentre: number } {
  const centre = SITES >> 1

  let total = 0

  for (let x = 0; x < SITES; x++) {
    total += distribution[x] ?? 0
  }

  let support = 0
  let accumulated = 0

  for (let d = 0; d < centre; d++) {
    accumulated += (distribution[centre + d] ?? 0) + (d > 0 ? (distribution[centre - d] ?? 0) : 0)

    if (accumulated >= 0.99 * total) {
      support = d
      break
    }
  }

  let edge = 0
  let central = 0

  for (let d = 0; d < centre; d++) {
    const value = (distribution[centre + d] ?? 0) + (d > 0 ? (distribution[centre - d] ?? 0) : 0)

    if (d > 0.7 * support && d <= support) {
      edge += value
    }

    if (d < 0.3 * support) {
      central += value
    }
  }

  return { support, edgeOverCentre: central > 0 ? edge / central : Infinity }
}

export default experiment({
  id: 'quantum/emergent-imaginary-unit',
  code: 'E-QTM-0041',
  title:
    'quantum-walk interference (unitary, ballistic, double-horn) emerges from a purely real two-component walk with no imaginary unit, so the effective i is the rotation between the lattice forward and backward slots',
  category: 'quantum',
  substrates: 'any',
  depth: 'L2',
  paper: true,
  run() {
    const quantum = realTwoComponentWalk(true)
    const classical = classicalWalk()

    const quantumProfile = profile(quantum.intensity)
    const classicalProfile = profile(classical)

    // 1. The real walk is unitary: the summed intensity is conserved (started at 1).
    const unitary = Math.abs(quantum.norm - 1) < 1e-9

    // 2. It develops the quantum-walk double horn (mass at the ballistic edges).
    const doubleHorn = quantumProfile.edgeOverCentre > 1.5

    // 3. The classical walk gives a central hump instead (the control).
    const classicalHump = classicalProfile.edgeOverCentre < 0.5

    // 4. The real walk spreads ballistically, far past the diffusive classical walk.
    const ballistic = quantumProfile.support > 2 * classicalProfile.support

    const solved = unitary && doubleHorn && classicalHump && ballistic

    return verdict({
      status: solved ? 'pass' : 'fail',
      claim:
        'a purely real two-component walk (forward and backward slots mixed by a real rotation coin, no complex arithmetic) is unitary, spreads ballistically, and develops the quantum-walk double horn with mass at the ballistic edges, while a classical incoherent walk gives a central hump, so the quantum interference that normally requires an imaginary unit comes from the real rotation between the two real slots and the imaginary unit is emergent, not a base ingredient',
      metrics: {
        norm: quantum.norm,
        quantumEdgeOverCentre: quantumProfile.edgeOverCentre,
        classicalEdgeOverCentre: classicalProfile.edgeOverCentre,
        quantumSupport: quantumProfile.support,
        classicalSupport: classicalProfile.support,
      },
      control: {
        // The classical incoherent walk is the control: same lattice, same steps, but
        // no rotation between components, so no interference and a central hump. The
        // double horn appears only with the real rotation, which is the emergent i.
        classicalEdgeOverCentre: classicalProfile.edgeOverCentre,
      },
      notes:
        'L2. No imaginary unit anywhere in the dynamics: the coin is a real rotation (cos, sin), the shift is real, the intensity is R^2 + L^2. The quantum-walk interference (unitary, ballistic, double horn) is the measured consequence, the classical hump the control. The effective i is the rotation between the two real (forward, backward) slots, which the lattice carries as opposite-direction pairs. Scope: this is the mechanism on a minimal two-slot walk; lifting it onto the full committed lattice-gas rule over the 24 opposite-paired {3,4,3,4} directions is the open next step. This closes the imaginary-unit gap left by the Born-rule and measurement experiments.',
    })
  },
})
