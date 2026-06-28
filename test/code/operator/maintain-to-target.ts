// Conformance for code/operator/maintain-to-target: conserving maintenance back toward a
// target pattern. Facts:
//   - the net charge (sum of tones) is preserved exactly (only swaps and balanced pair-fills).
//   - the number of cells matching the target never decreases.
//   - constructed cases reach the target exactly, with the hand-counted operation count.

import { suite, check, equal, ok } from '@/test/code/harness'
import { conservingMaintainToTarget } from '@/code/operator/maintain-to-target'

const sum = (a: Int8Array): number => a.reduce((s, v) => s + v, 0)
const matches = (a: Int8Array, b: Int8Array): number => {
  let m = 0
  for (let i = 0; i < a.length; i++) {
    if (a[i] === b[i]) m++
  }
  return m
}

suite('operator/maintain-to-target: conservation', [
  check('net charge is preserved exactly', () => {
    const cases: [number[], number[]][] = [
      [[1, -1, 0, 1], [0, 0, 1, -1]],
      [[1, 1, -1, -1, 0, 0], [0, -1, 1, 0, 1, -1]],
      [[-1, 0, 1, 0], [1, 1, -1, -1]],
    ]
    for (const [t, g] of cases) {
      const tone = Int8Array.from(t)
      const target = Int8Array.from(g)
      const before = sum(tone)
      conservingMaintainToTarget(tone, target, tone.length)
      equal(sum(tone), before, 'sum of tones unchanged by maintenance')
    }
  }),
  check('the count of target-matching cells never decreases', () => {
    const tone = Int8Array.from([1, 1, -1, -1, 0, 0])
    const target = Int8Array.from([0, -1, 1, 0, 1, -1])
    const before = matches(tone, target)
    conservingMaintainToTarget(tone, target, tone.length)
    ok(matches(tone, target) >= before, 'maintenance does not move further from target')
  }),
])

suite('operator/maintain-to-target: reaching the target', [
  check('a single swap fixes a high/low drift exactly', () => {
    // cell 0 too low (-1 < 1), cell 1 too high (1 > -1): one swap fixes both.
    const tone = Int8Array.from([-1, 1])
    const target = Int8Array.from([1, -1])
    const ops = conservingMaintainToTarget(tone, target, 2)
    equal(ops, 1, 'one swap')
    ok(tone.every((v, i) => v === target[i]), 'tone reaches the target')
    equal(sum(tone), 0, 'charge preserved')
  }),
  check('a pair-fill recreates a +1/-1 pair into matched holes', () => {
    // holes at 0 (wants +1) and 1 (wants -1): swap is a no-op then pair-fill completes it.
    const tone = Int8Array.from([0, 0])
    const target = Int8Array.from([1, -1])
    const ops = conservingMaintainToTarget(tone, target, 2)
    ok(tone.every((v, i) => v === target[i]), 'tone reaches the target via pair-fill')
    ok(ops >= 1, 'at least the pair-fill operation ran')
    equal(sum(tone), 0, 'a balanced pair keeps net charge zero')
  }),
])
