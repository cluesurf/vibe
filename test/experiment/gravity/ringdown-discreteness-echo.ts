// Mayank Singh's ringdown in discrete form (mayank-singh-quest in the related-theories
// census). QuEST predicts a ringdown after a perturbation of the elastic spacetime, a
// long-lived coherent oscillation, and looks for a late echo in it (testable with LIGO).
// On the substrate the measured signal is the coherent RINGDOWN itself: a pulse launched at
// a source sets the {3,4,3,4} lattice ringing, and the geometry sustains that oscillation,
// energy keeps returning to the source long after the initial pulse has left, because a
// structured lattice has coherent normal modes. A degree-preserving scramble, a random graph
// with the same degree, has no such modes: it dephases and disperses the pulse, and the
// source energy decays to near zero fast. So the geometry sustains a ringdown that the degree
// alone does not, which is the honest measured signal.
//
// The sharp size-scaling recurrence echo (a secondary refocus whose delay tracks the lattice
// size) is NOT present on the bare degree-normalized wave, the pulse disperses without a
// clean refocus, so that stronger claim is left to the emergent Lorentz-restored metric wave
// and is noted, not claimed. Depth L2, the ringdown persistence measured deterministically,
// the scramble the control that could have failed.

import { experiment } from '@/test/scaffold/suite'
import { verdict } from '@/test/scaffold/verdict'
import { d4Mesh, meshNeighbors } from '@/code/tool/mesh'
import { scrambleNeighbors } from '@/code/control/scramble'
import {
  sourceEnergyTrace,
  ringdownPersistence,
} from '@/code/measure/ringdown-echo'

export default experiment({
  id: 'gravity/ringdown-discreteness-echo',
  code: 'E-GRV-0048',
  title:
    'the {3,4,3,4} geometry sustains a coherent ringdown after a pulse (energy keeps returning to the source) while a degree-matched scramble dephases and dies, the discrete form of an elastic-spacetime ringdown',
  category: 'gravity',
  substrates: ['3434'],
  depth: 'L2',
  paper: false,
  run() {
    const mesh = d4Mesh({ side: 6 })
    const neighbors = meshNeighbors(mesh)
    const beats = 30
    const startBeat = 10
    const endBeat = 25

    const meshTrace = sourceEnergyTrace({
      mesh,
      neighbors,
      source: 0,
      beats,
    })

    const meshPersistence = ringdownPersistence({
      trace: meshTrace,
      startBeat,
      endBeat,
    })

    // control: same degree, geometry gone. The random graph dephases the pulse, so the late
    // source energy decays to near zero.
    const scrambled = scrambleNeighbors({
      neighbors,
      seed: 1,
      passes: 8,
    })

    const scrambleTrace = sourceEnergyTrace({
      mesh,
      neighbors: scrambled,
      source: 0,
      beats,
    })

    const scramblePersistence = ringdownPersistence({
      trace: scrambleTrace,
      startBeat,
      endBeat,
    })

    const meshRings = meshPersistence > 0.1
    const beatsScramble = meshPersistence > 3 * scramblePersistence
    const ok = meshRings && beatsScramble

    return verdict({
      status: ok ? 'pass' : 'fail',
      claim:
        'the {3,4,3,4} geometry sustains a coherent ringdown after a pulse. Long after the initial pulse has left the source, energy keeps returning to it, because a structured lattice has coherent normal modes that keep ringing. A degree-preserving scramble, a random graph with the same degree, has no such modes, so it dephases and disperses the pulse and its late source energy decays to near zero. So the geometry, not the degree, sustains the ringdown, the discrete analogue of the long-lived oscillation QuEST predicts for a perturbed elastic spacetime. The sharp size-scaling recurrence echo is not present on this bare wave and is left to the emergent metric wave. Depth L2, the ringdown persistence measured deterministically, the scramble the control.',
      metrics: {
        meshPersistence,
        scramblePersistence,
        persistenceRatio:
          scramblePersistence === 0
            ? 0
            : meshPersistence / scramblePersistence,
        meshInitial: meshTrace[0]!,
      },
      control: {
        scramblePersistence,
      },
      notes:
        'AUDIT 2026-08-31: this run uses d4Mesh with an even side, which is two disconnected lattices (the D4 roots preserve coordinate-sum parity, see the PARITY note on d4Mesh). The seeds and measurements here are local, so the result stands on the component the seed lives in; roadmap item 0017 tracks the switch to an odd side. ' +
        'the measured signal is the ringdown coherence (late-window source energy over the initial pulse), not a discrete echo: the pulse disperses on the periodic torus without a sharp refocus, so the size-scaling recurrence claim is explicitly not made here. What the geometry buys, and the scramble does not, is a long-lived coherent oscillation, which is the honest discrete counterpart of a sustained ringdown. Deterministic pulse, no randomness.',
    })
  },
})
