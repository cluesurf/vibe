// Conformance for code/tone/pack: the (current, previous) ternary bit-pack. The pack
// is (previous << 2) | current with each code in {0,1,2}, nine states. We check the
// round-trip currentOf/previousOf recovers exactly what was packed for ALL nine pairs,
// that the packed integer equals the hand formula, and the signed-tone map. All exact.

import { suite, check, equal } from '@/test/code/harness'
import { pack, currentOf, previousOf, signedTone } from '@/code/tone/pack'

const CODES = [0, 1, 2]

suite('tone/pack: pack / unpack round-trip', [
  check('currentOf(pack) and previousOf(pack) recover all nine pairs', () => {
    for (const previous of CODES) {
      for (const current of CODES) {
        const packed = pack({ current, previous })
        equal(currentOf(packed), current, `current of (${previous},${current})`)
        equal(previousOf(packed), previous, `previous of (${previous},${current})`)
      }
    }
  }),
  check('packed integer equals the hand formula (previous << 2) | current', () => {
    for (const previous of CODES) {
      for (const current of CODES) {
        equal(
          pack({ current, previous }),
          (previous << 2) | current,
          `pack(${previous},${current})`,
        )
      }
    }
  }),
  check('the nine states map to nine distinct packed integers', () => {
    const seen = new Set<number>()
    for (const previous of CODES) {
      for (const current of CODES) {
        seen.add(pack({ current, previous }))
      }
    }
    equal(seen.size, 9, 'nine distinct codes')
  }),
])

suite('tone/pack: signed tone map', [
  check('code {0,1,2} -> signed {0, +1, -1}', () => {
    equal(signedTone(0), 0, 'peace')
    equal(signedTone(1), 1, 'pleasure')
    equal(signedTone(2), -1, 'pain')
  }),
])
