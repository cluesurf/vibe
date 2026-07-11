// Conformance for code/substrate/coxeter/growth: the exact hyperbolic growth series. The hardcoded layer
// series must obey their stated recurrences and agree with the general {p,q} formula; the first terms are
// fixed by the geometry independently (heptagrid layer 1 = 7 = p, pentagrid = 5, dodecagrid = 12); the
// cumulative is a running sum; and a spherical symbol must be rejected. All bigint, so EXACT.

import { suite, check, equal, ok, throws } from '@/test/code/harness'
import {
  sequence,
  polygonsAddedPerLayer73,
  polygonsAddedPerLayer54,
  cellsAddedPerLayer5354,
  regular2DFaceLayers,
  cumulative,
} from '@/code/substrate/coxeter/growth'

const eqBig = (a: bigint[], b: bigint[], msg: string): void => {
  equal(a.length, b.length, `${msg} length`)

  for (let i = 0; i < a.length; i++)
    ok(a[i] === b[i], `${msg} at ${i}: ${a[i]} vs ${b[i]}`)
}

suite('substrate/coxeter/growth: layer recurrences', [
  check('a generic linear recurrence is computed correctly', () => {
    // Fibonacci as a sanity anchor: seed 1,1, coeffs [1,1].
    eqBig(
      sequence(8, { seed: [1n, 1n], coeffs: [1n, 1n] }),
      [1n, 1n, 2n, 3n, 5n, 8n, 13n, 21n],
      'fibonacci',
    )
  }),
  check(
    'heptagrid {7,3} first layers and recurrence a(n)=3a(n-1)-a(n-2)',
    () => {
      const seq = polygonsAddedPerLayer73(6)

      equal(seq[0], 1n, 'layer 0 = 1')
      equal(seq[1], 7n, 'layer 1 = 7 heptagons')
      equal(seq[2], 21n, 'layer 2 = 21')

      for (let n = 3; n < seq.length; n++) {
        ok(
          seq[n] === 3n * seq[n - 1]! - seq[n - 2]!,
          `recurrence at ${n}`,
        )
      }
    },
  ),
  check(
    'pentagrid {5,4} layer 1 = 5 and matches the general formula',
    () => {
      equal(polygonsAddedPerLayer54(4)[1], 5n, 'layer 1 = 5')
      eqBig(
        polygonsAddedPerLayer54(10),
        regular2DFaceLayers(5, 4, 10),
        '{5,4} vs general',
      )

      eqBig(
        polygonsAddedPerLayer73(10),
        regular2DFaceLayers(7, 3, 10),
        '{7,3} vs general',
      )
    },
  ),
  check('dodecagrid {5,3,4} first cell layers and recurrence', () => {
    const seq = cellsAddedPerLayer5354(6)

    equal(seq[0], 1n, 'layer 0 = 1')
    equal(seq[1], 12n, 'layer 1 = 12 dodecahedron faces')
    equal(seq[2], 102n, 'layer 2 = 102')
    equal(seq[3], 812n, 'layer 3 = 812')

    for (let n = 4; n < seq.length; n++) {
      ok(
        seq[n] === 9n * seq[n - 1]! - 9n * seq[n - 2]! + seq[n - 3]!,
        `recurrence at ${n}`,
      )
    }
  }),
])

suite('substrate/coxeter/growth: cumulative and guards', [
  check('cumulative is the running sum', () => {
    eqBig(
      cumulative([1n, 5n, 15n, 40n]),
      [1n, 6n, 21n, 61n],
      'cumulative',
    )
  }),
  check('a spherical {p,q} and an unsupported q are rejected', () => {
    throws(() => regular2DFaceLayers(3, 3, 5), '{3,3} is spherical')
    throws(
      () => regular2DFaceLayers(5, 5, 5),
      'q=5 has no built-in recurrence',
    )
  }),
])
