// Conformance for code/operator/directional-charge-stream: per-port charge streaming on
// a neighbours graph. Exact integer facts:
//   - total charge is conserved exactly across any number of beats (every port maps to
//     exactly one matched back-port).
//   - one beat moves a port's charge into the neighbour's matched back-port (verified by
//     an independent hand-trace on a ring).

import { suite, check, equal } from '@/test/code/harness'
import {
  streamDirectionalChargeStep,
  streamDirectionalCharge,
  totalDirectionalCharge,
} from '@/code/operator/directional-charge-stream'

// A periodic ring of N cells. Each cell has two ports: port 0 -> previous, port 1 -> next.
function ring(n: number): number[][] {
  return Array.from({ length: n }, (_, i) => [(i - 1 + n) % n, (i + 1) % n])
}

suite('operator/directional-charge-stream: conservation', [
  check('one beat conserves total charge', () => {
    const neighbors = ring(5)
    const charge = neighbors.map((_, i) => [i - 2, 2 * i - 3])
    const next = streamDirectionalChargeStep({ neighbors, charge })
    equal(
      totalDirectionalCharge(next),
      totalDirectionalCharge(charge),
      'total charge conserved after one beat',
    )
  }),
  check('many beats conserve total charge', () => {
    const neighbors = ring(6)
    const charge = neighbors.map((_, i) => [3 * i - 7, -i])
    const total0 = totalDirectionalCharge(charge)
    const out = streamDirectionalCharge({ neighbors, charge, steps: 9 })
    equal(totalDirectionalCharge(out), total0, 'total charge conserved after 9 beats')
  }),
])

suite('operator/directional-charge-stream: transport', [
  check('a port charge lands in the neighbour matched back-port', () => {
    const n = 4
    const neighbors = ring(n)
    // place 5 on cell 0 port 1 (-> next cell 1). cell 1 lists 0 at its port 0.
    const charge = neighbors.map(row => row.map(() => 0))
    charge[0]![1] = 5
    const next = streamDirectionalChargeStep({ neighbors, charge })
    equal(next[1]![0], 5, 'charge[0][1] moves to next[1][0]')
    // everything else is zero
    let elsewhere = 0
    for (let i = 0; i < n; i++) {
      for (let k = 0; k < 2; k++) {
        if (!(i === 1 && k === 0)) {
          elsewhere += next[i]![k]!
        }
      }
    }
    equal(elsewhere, 0, 'no charge appears anywhere else')
  }),
  check('totalDirectionalCharge sums every port', () => {
    const charge = [
      [1, 2],
      [3, 4],
      [-5, 0],
    ]
    equal(totalDirectionalCharge(charge), 5, 'sum over all cells and ports')
  }),
])
