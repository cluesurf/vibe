// Conformance for code/measure/aharonov-bohm. The AB phase is charge times the Wilson-loop phase
// (the summed link phases around a closed cycle). We build a square loop whose four U(1) links each
// carry phase 2 pi / 12, so the loop phase is 4 * 2 pi / 12 = 2 pi / 3, and the AB phase is the
// charge times that. The expected value is computed by hand from the link integers, not the impl.

import { suite, check, close } from '@/test/code/harness'
import { aharonovBohmPhase } from '@/code/measure/aharonov-bohm'
import { GaugeField, edgeKey } from '@/code/tool/gauge-field'

// A 4-cycle 0->1->2->3->0 with U(1) clock q = 12 and every link integer = 1
// (so each directed traversal contributes 2 pi / 12).
function squareField(linkValue: number): GaugeField {
  const edges = [
    { from: 0, to: 1 },
    { from: 1, to: 2 },
    { from: 2, to: 3 },
    { from: 3, to: 0 },
  ]

  const edgeIndex = new Map<string, number>()
  edges.forEach((e, i) => edgeIndex.set(edgeKey(e), i))

  return {
    form: 'gauge-field',
    group: { form: 'u1', q: 12 },
    edges,
    edgeIndex,
    link: Int32Array.from([linkValue, linkValue, linkValue, linkValue]),
  }
}

const loop = Uint32Array.from([0, 1, 2, 3])

suite('measure/aharonov-bohm: phase = charge * Wilson loop phase', [
  check('charge 1 around a 2 pi / 3 loop gives 2 pi / 3', () => {
    // 4 links * 2 pi / 12 = 2 pi / 3.
    close(aharonovBohmPhase({ field: squareField(1), loop, charge: 1 }), (2 * Math.PI) / 3, 1e-12)
  }),
  check('charge 3 scales it to 2 pi', () => {
    close(aharonovBohmPhase({ field: squareField(1), loop, charge: 3 }), 2 * Math.PI, 1e-12)
  }),
  check('a doubled link integer doubles the loop phase', () => {
    close(aharonovBohmPhase({ field: squareField(2), loop, charge: 1 }), (4 * Math.PI) / 3, 1e-12)
  }),
  check('a flat field (all links zero) gives zero phase for any charge', () => {
    close(aharonovBohmPhase({ field: squareField(0), loop, charge: 5 }), 0, 1e-12)
  }),
])
