// Mayank Singh's ringdown echo in discrete form (mayank-singh-quest in the related-theories
// census). QuEST predicts a late-time echo after a gravitational-wave ringdown, a secondary
// pulse with a delay fixed by the elastic medium, testable now with LIGO. On a discrete
// substrate the analogue is a wave recurrence: a pulse launched at a source travels the
// finite lattice and refocuses back, a secondary energy peak whose delay is set by the
// lattice size, a genuine discreteness signature. This is the one census experiment that
// points at a real-world falsifiable number (Kleiner-Hartmann say vibe's testable content
// must live in exactly such a physics departure), so it is worth setting up even where the
// current bare wave gives only a partial signal.
//
// The claim is measured with two controls. SCALING: a finer lattice pushes the echo later
// (the delay tracks the lattice size, so it is a discreteness feature, not a continuum one).
// SCRAMBLE: a degree-preserving scramble disperses the pulse and gives no clean echo, so the
// echo needs the geometry. Depth L2 if the echo is clean and scales, reported open if the
// bare wave only hints at it.

import { experiment } from '@/test/scaffold/suite'
import { verdict } from '@/test/scaffold/verdict'
import { d4Mesh, meshNeighbors } from '@/code/tool/mesh'
import { scrambleNeighbors } from '@/code/control/scramble'
import { sourceEnergyTrace, detectEcho } from '@/code/measure/ringdown-echo'

export default experiment({
  id: 'gravity/ringdown-discreteness-echo',
  code: 'E-GRV-0048',
  title:
    'a pulse on {3,4,3,4} refocuses into a late echo whose delay scales with the lattice size (a discreteness signature) and vanishes on a degree-matched scramble',
  category: 'gravity',
  substrates: ['3434'],
  depth: 'L2',
  paper: false,
  run() {
    const smallMesh = d4Mesh({ side: 6 })
    const smallNeighbors = meshNeighbors(smallMesh)
    const smallTrace = sourceEnergyTrace({
      mesh: smallMesh,
      neighbors: smallNeighbors,
      source: 0,
      beats: 60,
    })

    const smallEcho = detectEcho(smallTrace)

    // SCALING control: a larger lattice should push the echo later.
    const largeMesh = d4Mesh({ side: 8 })
    const largeNeighbors = meshNeighbors(largeMesh)
    const largeTrace = sourceEnergyTrace({
      mesh: largeMesh,
      neighbors: largeNeighbors,
      source: 0,
      beats: 100,
    })

    const largeEcho = detectEcho(largeTrace)

    // SCRAMBLE control: same degree, geometry gone, the pulse should disperse with no echo.
    const scrambled = scrambleNeighbors({ neighbors: smallNeighbors, seed: 1, passes: 8 })
    const scrambleTrace = sourceEnergyTrace({
      mesh: smallMesh,
      neighbors: scrambled,
      source: 0,
      beats: 60,
    })

    const scrambleEcho = detectEcho(scrambleTrace)

    const hasEcho = smallEcho.echoStrength > 0.2 && smallEcho.echoBeat > 2
    const scalesWithSize = largeEcho.echoBeat > smallEcho.echoBeat
    const beatsScramble = smallEcho.echoStrength > 1.5 * scrambleEcho.echoStrength
    const clean = hasEcho && scalesWithSize && beatsScramble

    return verdict({
      status: clean ? 'pass' : 'open',
      claim: clean
        ? 'a localized pulse on {3,4,3,4} travels the finite lattice and refocuses into a late secondary energy peak, a wave echo, whose delay scales with the lattice size, so it is a discreteness signature and not a continuum artifact, and it vanishes on a degree-preserving scramble. This is the discrete form of Mayank Singh QuEST ringdown echo, the census experiment that points at a real-world falsifiable signature (a horizon-scale reflection in a ringdown). Depth L2, the echo delay and its size-scaling measured deterministically with the scramble the control.'
        : 'the ringdown-echo measurement is set up on the substrate (a pulse launched on the second-order reversible wave, source energy traced, echo delay read and compared across lattice sizes and against a scramble), but the bare degree-normalized wave gives only a partial refocus, so the discreteness echo is an open frontier here, not yet a clean pass. This is the highest-value real-world target in the census (a horizon-scale reflection a detector could see), and the honest reading is that it needs the emergent (Lorentz-restored) metric wave, not the bare knit, to sharpen.',
      metrics: {
        smallEchoBeat: smallEcho.echoBeat,
        smallEchoStrength: smallEcho.echoStrength,
        largeEchoBeat: largeEcho.echoBeat,
        largeEchoStrength: largeEcho.echoStrength,
        scrambleEchoStrength: scrambleEcho.echoStrength,
        delayScaling: smallEcho.echoBeat > 0 ? largeEcho.echoBeat / smallEcho.echoBeat : 0,
      },
      control: {
        scrambleEchoStrength: scrambleEcho.echoStrength,
        largeEchoBeat: largeEcho.echoBeat,
      },
      notes:
        'the discreteness signature is the delay scaling: an echo whose delay grows with the lattice size is a finite-lattice reflection, the discrete analogue of a QuEST horizon echo, not a continuum feature. The scramble is the null: no geometry, no clean refocus. Graded open rather than forced to pass if the bare wave only hints at the echo, per the methodology preference for a reported frontier over a dressed-up positive.',
    })
  },
})
