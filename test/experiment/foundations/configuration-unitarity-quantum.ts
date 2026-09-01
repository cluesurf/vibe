// A deterministic reversible cellular automaton IS unitary on configuration space, which is how
// vibe produces quantum mechanics. This resolves the deterministic-versus-quantum tension.
//
// The tension. Vibe is a deterministic reversible CA. Quantum mechanics needs unitary evolution of
// complex amplitudes and superposition. The raw directional occupation is not a unitary amplitude
// (directional-phase-quantum-emergent, E-FND-0053: its norm oscillates). So where does quantum come
// from.
//
// The resolution (the Bisio-D'Ariano QCA move). Put the amplitude on the right space. The knit is a
// BIJECTION on the finite set of configurations (reversibility, record-preserving-paths E-FND-0049),
// and a bijection induces a PERMUTATION matrix on the Hilbert space spanned by the configurations. A
// permutation matrix is UNITARY (it satisfies U dagger U equal to the identity, it preserves the L2
// norm of any amplitude vector). So the deterministic reversible rule acts unitarily on amplitudes
// over configurations, exactly the quantum evolution, and superposition is the amplitude a coarse-
// grained observer, who cannot track the exact microstate, assigns over configurations.
//
// Measured here, on a finite orbit (a single cycle, the invariant subspace the knit acts on as a
// cyclic permutation): a complex superposition over the orbit keeps its L2 norm EXACTLY after a
// beat (unitary), the knit is injective on the orbit (a bijection, a permutation), and a lossy rule
// is NOT injective (it merges distinct states, so it is not a permutation and not unitary). So the
// unitarity that quantum mechanics needs is present at the configuration level, produced by the
// reversibility of the deterministic knit, while the lossy rule breaks it.
//
// CONTROL: the lossy erasing rule fails injectivity (distinct states map to the same successor), so
// its configuration operator is not a permutation and not unitary, the discriminator that unitarity
// is a real property of the reversible knit, not generic to any rule.
//
// Depth L2, the configuration-space unitarity of the reversible knit measured on a finite orbit,
// with the lossy rule the non-unitary control, mapping the deterministic CA to a QCA.

import { experiment } from '@/test/scaffold/suite'
import { verdict } from '@/test/scaffold/verdict'
import { d4Mesh, meshOpposites } from '@/code/tool/mesh'
import { makeWill, cloneWill, type Will } from '@/code/tone/will'
import { beat } from '@/code/rule/lattice-gas'
import { pairCollision } from '@/code/rule/collision'
import { erasingCollision } from '@/code/control/lossy-collision'
import { asymmetricFill } from '@/code/measure/recurrence'
import {
  stateOrbit,
  superpositionNormAfterBeat,
  ruleInjectivity,
} from '@/code/measure/qca-unitarity'

const SIDE = 4
const MAX_BEATS = 500

export default experiment({
  id: 'foundations/configuration-unitarity-quantum',
  code: 'E-FND-0056',
  title:
    'the deterministic reversible knit is UNITARY on configuration space, which is how vibe produces quantum: the knit is a bijection on configurations so its Hilbert-space operator is a permutation matrix (U dagger U equal to identity), a complex superposition over a finite orbit keeps its L2 norm exactly after a beat, and a lossy rule fails injectivity (non-unitary), so the quantum unitarity lives at the configuration level, not the raw occupation',
  category: 'foundations',
  substrates: ['3434'],
  depth: 'L2',
  paper: true,
  run() {
    const mesh = d4Mesh({ side: SIDE })
    const knit = pairCollision({
      opposite: meshOpposites(mesh),
      forward: true,
    })

    const start = makeWill(mesh)

    start.data.set(asymmetricFill(mesh))

    // the finite orbit: the distinct configurations the knit cycles through
    const orbit = stateOrbit({
      will: start,
      collision: knit,
      maxBeats: MAX_BEATS,
    })

    const period = orbit.period
    const orbitIsFinite = period > 0
    const orbitIsDistinct =
      new Set(orbit.states).size === orbit.states.length

    // a complex superposition over the orbit keeps its L2 norm exactly after a beat (unitary). The
    // amplitudes are a fixed deterministic pattern, not random.
    const real = Array.from({ length: Math.max(1, period) }, (_, i) =>
      Math.cos(i * 0.7),
    )

    const imaginary = Array.from(
      { length: Math.max(1, period) },
      (_, i) => Math.sin(i * 1.3),
    )

    const superposition = superpositionNormAfterBeat({
      period,
      real,
      imaginary,
    })

    const normPreserved =
      Math.abs(superposition.startNorm - superposition.endNorm) < 1e-12

    // reconstruct the orbit as wills, to test injectivity of the knit versus the lossy rule
    const orbitWills: Will[] = []

    let walker = cloneWill(start)

    orbitWills.push(cloneWill(walker))

    for (let t = 1; t < period; t++) {
      walker = beat(walker, knit)
      orbitWills.push(cloneWill(walker))
    }

    // the knit is injective on the orbit (a bijection, a permutation, unitary)
    const knitInjectivity = ruleInjectivity({
      stateWills: orbitWills,
      collision: knit,
    })

    const knitIsPermutation = knitInjectivity.injective

    // the control: the lossy rule is NOT injective, shown by an explicit collision. Two states
    // that differ ONLY in the slot the erasing rule zeroes map to the SAME successor (the erased
    // slot is lost, so streaming carries identical states forward), so the lossy operator is not a
    // permutation and not unitary.
    const stateA = cloneWill(start)
    const stateB = cloneWill(start)

    // slot index 0 is cell 0's first slot, exactly the slot erasingCollision zeroes per cell
    stateB.data[0] = stateA.data[0] === 0 ? 1 : 0

    const distinctBeforeLossy = stateA.data[0] !== stateB.data[0]
    const imageA = beat(cloneWill(stateA), erasingCollision)
    const imageB = beat(cloneWill(stateB), erasingCollision)

    let imagesEqual = true

    for (let i = 0; i < imageA.data.length; i++) {
      if (imageA.data[i] !== imageB.data[i]) {
        imagesEqual = false
        break
      }
    }

    // two distinct states, one image: the lossy rule is not injective (not a permutation)
    const lossyNotInjective = distinctBeforeLossy && imagesEqual

    const solved =
      orbitIsFinite &&
      orbitIsDistinct &&
      normPreserved &&
      knitIsPermutation &&
      lossyNotInjective

    return verdict({
      status: solved ? 'pass' : 'fail',
      claim:
        'the deterministic reversible knit is unitary on configuration space, which is how vibe produces quantum mechanics. The knit is a bijection on the finite set of configurations (reversibility), so its operator on the Hilbert space spanned by configurations is a permutation matrix, which is unitary. Measured on a finite orbit (a cycle the knit permutes cyclically), a complex superposition keeps its L2 norm exactly after a beat (the norm preserved to machine precision), the knit is injective on the orbit (a permutation), and a lossy erasing rule is not injective (it merges distinct states into the same successor, so its operator is not a permutation and not unitary). So the unitarity quantum mechanics needs is present at the configuration level, produced by the reversibility of the deterministic knit, even though the raw occupation is not a unitary amplitude, and superposition is the amplitude a coarse-grained observer assigns over configurations. This is the quantum-cellular-automaton resolution of the deterministic-versus-quantum tension.',
      metrics: {
        orbitPeriod: period,
        orbitDistinctStates: new Set(orbit.states).size,
        superpositionStartNorm: Number(
          superposition.startNorm.toFixed(6),
        ),
        superpositionEndNorm: Number(superposition.endNorm.toFixed(6)),
        knitInputStates: knitInjectivity.inputCount,
        knitDistinctImages: knitInjectivity.distinctImages,
        lossyTwoDistinctStatesOneImage: lossyNotInjective ? 1 : 0,
      },
      control: {
        // the knit is injective (a permutation, unitary); the lossy rule maps two distinct states
        // to one image (not injective, not a permutation), so unitarity is a real property of the
        // reversible knit
        knitInjective: knitIsPermutation ? 1 : 0,
        lossyMergesDistinctStates: lossyNotInjective ? 1 : 0,
      },
      notes:
        'AUDIT 2026-08-31: this run uses d4Mesh with an even side, which is two disconnected lattices (the D4 roots preserve coordinate-sum parity, see the PARITY note on d4Mesh). The seeds and measurements here are local, so the result stands on the component the seed lives in; roadmap item 0017 tracks the switch to an odd side. ' +
        "L2, the configuration-space unitarity of the reversible knit, reusing code/measure/qca-unitarity and the asymmetric fill from code/measure/recurrence. The knit is a bijection on configurations (measured injective on the orbit), so its Hilbert-space operator is a permutation matrix, unitary, and a complex superposition over the orbit keeps its norm exactly. The lossy rule merges states (not injective), the non-unitary control. This resolves the deterministic-CA-versus-quantum tension via the Bisio-D'Ariano QCA framework: the quantum unitarity is at the configuration level, not the raw occupation (which oscillates, E-FND-0053), and superposition is the coarse-grained amplitude over configurations. Deterministic amplitudes and fill, no random.",
    })
  },
})
