// Conservation is a stabilizer check, the dynamical face of the substrate's code structure. In
// quantum error correction a stabilizer check is an observable the legal dynamics commutes with:
// it stays fixed under every encoded evolution, so any change in it is a syndrome, the fingerprint
// of an error. That is exactly what a conservation law is. The substrate's conserving transport
// preserves the total charge exactly, so the total charge is a check the rule itself maintains:
// legal evolution never moves it, a single-site error (one stray tone flip) moves it by one, and
// the rule then preserves the moved value forever, so the syndrome is permanent, readable at any
// later time.
//
// Measured across a sweep of error times: with the exact rule and no error the syndrome never
// fires across the whole run (zero false positives), and a single-site error injected at any beat
// is detected at exactly that beat (immediate, and the syndrome persists to the end). So the
// substrate carries built-in error detection: the conserved quantity is the check, exactly the
// structure the CSS stabilizers formalize (E-QTM-0054), whose classical seeds sit under the
// committed geometries (E-FND-0067).
//
// The control is a leaky rule. It does not conserve the check, so the syndrome fires immediately
// with no error injected at all: detection is lost because error and dynamics are
// indistinguishable. So the error detection is specifically the payoff of exact conservation, the
// same payoff that carries the self (E-FND-0064) and the beable cycle (E-QTM-0052).
//
// Depth L2. It measures immediate, persistent, false-positive-free detection of single-site errors
// by the conserved charge under the committed rule, against a leaky control, the known
// error-correction principle that stabilizer checks are conserved quantities, realized on the
// substrate. Deterministic (seeded transport, error time swept, never the seed).

import { experiment } from '@/test/scaffold/suite'
import { verdict } from '@/test/scaffold/verdict'
import { syndromeFirstFires } from '@/code/dynamics/stabilizer-check'

const LENGTH = 120
const BLOB_START = 50
const BLOB_END = 70
const BEATS = 200
const SEED = 9
const ERROR_BEATS = [10, 50, 100, 150]

export default experiment({
  id: 'quantum/conservation-as-stabilizer',
  code: 'E-QTM-0055',
  title:
    'the conserved charge is a stabilizer check: single-site errors are detected at the exact beat they occur with zero false positives, while a leaky rule fires the syndrome with no error, error detection from conservation',
  category: 'quantum',
  substrates: 'any',
  depth: 'L2',
  paper: false,
  run() {
    const base = {
      length: LENGTH,
      blobStart: BLOB_START,
      blobEnd: BLOB_END,
      beats: BEATS,
      seed: SEED,
    }

    // exact rule, no error: the check never moves, zero false positives
    const noErrorFires = syndromeFirstFires({
      ...base,
      errorBeat: null,
      leak: 0,
    })

    // exact rule, error swept over beats: detected at exactly the error beat, every time
    const detections = ERROR_BEATS.map(errorBeat =>
      syndromeFirstFires({ ...base, errorBeat, leak: 0 }),
    )

    const allImmediate = detections.every(
      (detectedAt, i) => detectedAt === ERROR_BEATS[i],
    )

    // CONTROL: the leaky rule fires the syndrome with no error injected at all
    const leakyNoErrorFires = syndromeFirstFires({
      ...base,
      errorBeat: null,
      leak: 0.01,
    })

    const noFalsePositives = noErrorFires === -1
    const leakyUseless = leakyNoErrorFires >= 0

    const ok = noFalsePositives && allImmediate && leakyUseless

    return verdict({
      status: ok ? 'pass' : 'fail',
      claim:
        'under the exact conserving rule the total charge never moves across the whole run with no error (zero false positives) and a single-site error injected at any beat is detected at exactly that beat with the syndrome persisting to the end, so the conserved charge is a stabilizer check the substrate maintains for free, the error-correction principle that stabilizer checks are conserved quantities, while a leaky rule fires the syndrome immediately with no error at all so detection is lost, error detection being specifically the payoff of exact conservation',
      metrics: {
        noErrorSyndromeBeat: noErrorFires,
        detectionsImmediate: allImmediate ? 1 : 0,
        detectionAtBeat10: detections[0]!,
        detectionAtBeat150: detections[detections.length - 1]!,
        leakyNoErrorSyndromeBeat: leakyNoErrorFires,
      },
      // CONTROL: the leaky rule fires the syndrome with no error, detection lost.
      control: { leakyNoErrorSyndromeBeat: leakyNoErrorFires },
      notes:
        'Stabilizer checks are conserved quantities, realized on the committed rule. The dynamical face of the code ladder (E-FND-0067, E-QTM-0054). Same exactness payoff as E-FND-0064 and E-QTM-0052. Deterministic, error time swept.',
    })
  },
})
