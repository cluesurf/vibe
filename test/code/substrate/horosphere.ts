// Conformance for code/substrate/horosphere: the bulk-to-cusp geometry. The ideal direction is the unit
// normalization of the farthest cell; the Busemann height vanishes at the origin toward any boundary point;
// the horosphere frame is orthonormal and perpendicular to the ideal direction; and a band extracts the
// cells near a chosen level. The frame orthonormality is the load-bearing check (tight tolerance).

import { suite, check, equal, close } from '@/test/code/harness'
import {
  idealDirection,
  busemann,
  horoFrame,
  extractBand,
} from '@/code/substrate/horosphere'
import { dot, norm } from '@/code/algebra/vector'

suite('substrate/horosphere: ideal direction and Busemann height', [
  check(
    'the ideal direction is the unit-normalized farthest cell',
    () => {
      const xi = idealDirection([
        [0.1, 0],
        [0.5, 0],
        [0.9, 0],
      ])

      close(xi[0]!, 1, 1e-12, 'points along +x')
      close(xi[1]!, 0, 1e-12, 'no y component')
      close(norm(xi), 1, 1e-12, 'unit length')
    },
  ),
  check('the Busemann height vanishes at the origin', () => {
    // b(0) = log(|0 - xi|^2 / (1 - 0)) = log(|xi|^2) = log 1 = 0 for a unit ideal point.
    const b = busemann({ coords: [[0, 0]], ideal: [1, 0] })
    close(b[0]!, 0, 1e-12, 'b(origin) = 0')
  }),
])

suite('substrate/horosphere: the horosphere frame', [
  check(
    'the 2D frame is one unit vector perpendicular to the ideal point',
    () => {
      const frame = horoFrame([1, 0])
      equal(frame.length, 1, 'dim - 1 vectors')
      close(norm(frame[0]!), 1, 1e-12, 'unit')
      close(dot(frame[0]!, [1, 0]), 0, 1e-12, 'perpendicular to xi')
    },
  ),
  check(
    'the 3D frame is orthonormal and perpendicular to the ideal point',
    () => {
      const ideal = [0, 0, 1]
      const frame = horoFrame(ideal)
      equal(frame.length, 2, 'dim - 1 vectors')

      for (const e of frame) {
        close(norm(e), 1, 1e-12, 'unit')
        close(dot(e, ideal), 0, 1e-12, 'perpendicular to xi')
      }

      close(dot(frame[0]!, frame[1]!), 0, 1e-12, 'mutually orthogonal')
    },
  ),
  check('extractBand keeps the cells near the level', () => {
    const band = extractBand({
      busemann: [-0.4, 0, 0.4, 1.2],
      level: 0,
      half: 0.5,
    })

    // |b - 0| < 0.5 for indices 0,1,2; index 3 (1.2) is out.
    equal(band.join(','), '0,1,2', 'in-band indices')
  }),
])
