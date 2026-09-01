// Constructor theory on the emergent layer: distinguishable states are copyable, non-orthogonal
// states are not (emergent superinformation), the substrate form of the no-cloning theorem. This
// closes the Deutsch-Marletto gap, the one bridge with no substrate experiment yet, and it is a
// strong non-obvious claim: a deterministic reversible base gives an emergent quantum that
// forbids cloning of its own non-orthogonal states.
//
// The no-cloning theorem follows from unitarity alone. If a constructor copied |a> to |a>|a> and
// |b> to |b>|b>, then taking inner products of both sides and using that the copy map preserves
// them forces <a|b> = <a|b>^2, so the overlap is 0 or 1. Distinguishable (orthogonal) states,
// overlap 0, are copyable. Non-orthogonal states, 0 < overlap < 1, are not.
//
// So the test is whether the emergent Dirac walk preserves inner products. Two states are evolved
// by the same real position-space rule, and the magnitude of their overlap is tracked. For a
// non-orthogonal pair the overlap is one over root two and is preserved to machine precision, and
// since that does not equal its own square (one half) no constructor can clone the pair. An
// orthogonal pair has overlap zero, preserved, so it is copyable.
//
// The control is a lossy (non-unitary) rule, the boundary cell damped each beat. It does not
// preserve the overlap (the overlap drifts), so the no-cloning constraint is specific to the
// reversible conserving rule, not automatic.
//
// Depth L2. It derives the no-cloning theorem on the substrate's emergent quantum from the
// unitarity of the committed rule, with a lossy control, read against constructor theory.

import { experiment } from '@/test/scaffold/suite'
import { verdict } from '@/test/scaffold/verdict'
import { diracOverlapEvolution } from '@/code/dynamics/quantum-walk'

const SIZE = 400
const MASS = 0.5
const BEATS = 400
const UNIT = { weightReal: 1, weightImag: 0 }

function maxDrift(series: number[]): number {
  const first = series[0]!

  return Math.max(...series.map(value => Math.abs(value - first)))
}

export default experiment({
  id: 'foundations/emergent-no-cloning',
  code: 'E-FND-0065',
  title:
    'the emergent quantum forbids cloning of non-orthogonal states while allowing distinguishable ones (emergent superinformation), the no-cloning theorem from the reversible rule',
  category: 'foundations',
  substrates: 'any',
  depth: 'L2',
  paper: false,
  run() {
    // a non-orthogonal pair: |a> = mode 20, |b> = (mode 20 + mode 40) normalized, overlap 1/root2
    const nonOrthogonal = diracOverlapEvolution({
      statesA: [{ index: 20, ...UNIT }],
      statesB: [
        { index: 20, ...UNIT },
        { index: 40, ...UNIT },
      ],
      size: SIZE,
      mass: MASS,
      beats: BEATS,
    })

    const nonOrthogonalOverlap = nonOrthogonal[0]!
    const nonOrthogonalDrift = maxDrift(nonOrthogonal)

    // an orthogonal pair: two distinct eigenmodes, overlap zero
    const orthogonal = diracOverlapEvolution({
      statesA: [{ index: 20, ...UNIT }],
      statesB: [{ index: 40, ...UNIT }],
      size: SIZE,
      mass: MASS,
      beats: BEATS,
    })

    const orthogonalOverlap = Math.max(...orthogonal)

    // the no-cloning witness: cloning needs overlap = overlap^2. The gap is nonzero for the
    // non-orthogonal pair (cloning forbidden) and zero for the orthogonal pair (copyable).
    const cloningGap = Math.abs(
      nonOrthogonalOverlap - nonOrthogonalOverlap ** 2,
    )

    // control: a lossy (non-unitary) rule does not preserve the overlap
    const lossy = diracOverlapEvolution({
      statesA: [{ index: 20, ...UNIT }],
      statesB: [
        { index: 20, ...UNIT },
        { index: 40, ...UNIT },
      ],
      size: SIZE,
      mass: MASS,
      beats: BEATS,
      leak: 0.05,
    })

    const lossyDrift = maxDrift(lossy)

    const overlapPreserved = nonOrthogonalDrift < 1e-9
    const orthogonalIsZero = orthogonalOverlap < 1e-9
    const cloningForbidden = cloningGap > 0.1 // overlap 0.707 vs square 0.5
    const lossyBreaksIt = lossyDrift > 0.01
    const ok =
      overlapPreserved &&
      orthogonalIsZero &&
      cloningForbidden &&
      lossyBreaksIt

    return verdict({
      status: ok ? 'pass' : 'fail',
      claim:
        'the emergent Dirac walk preserves inner products exactly, so a non-orthogonal pair keeps its overlap one over root two (which does not equal its square, so the pair cannot be cloned) while an orthogonal pair has overlap zero (copyable), the no-cloning theorem on the substrate emergent quantum, and a lossy non-unitary rule does not preserve the overlap so the constraint is specific to the reversible rule',
      metrics: {
        nonOrthogonalOverlap: Number(nonOrthogonalOverlap.toFixed(4)),
        nonOrthogonalDrift: Number(nonOrthogonalDrift.toExponential(2)),
        orthogonalOverlap: Number(orthogonalOverlap.toExponential(2)),
        cloningGap: Number(cloningGap.toFixed(4)),
      },
      // CONTROL: a lossy non-unitary rule does not preserve the overlap.
      control: { lossyOverlapDrift: Number(lossyDrift.toFixed(4)) },
      notes:
        'Constructor-theoretic no-cloning (Deutsch-Marletto, Lloyd). Distinguishable emergent states are copyable, non-orthogonal are not, derived from the unitarity of the emergent walk, itself emergent from the discrete deterministic base. The admissibility catalogue of the knit rule is the companion next step.',
    })
  },
})
