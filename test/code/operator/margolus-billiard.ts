// Conformance for code/operator/margolus-billiard: the reversible Margolus BBMCA. Exact
// bit facts:
//   - each parity step is an involution (its own inverse).
//   - a full beat (parity 0 then 1) run forward then backward (1 then 0) recovers the field.
//   - the block rule conserves the particle count.
//   - a diagonal two-particle block (a wall) is left fixed.
//   - a lone ball is rotated to the opposite corner of its block.

import { suite, check, equal, ok } from '@/test/code/harness'
import { margolusStep } from '@/code/operator/margolus-billiard'
import { makeRng } from '@/code/tool/rng'

const at = (length: number, x: number, y: number): number =>
  (((y % length) + length) % length) * length +
  (((x % length) + length) % length)

function fillBits(length: number, seed: number): Uint8Array {
  const g = new Uint8Array(length * length)
  const rng = makeRng({ seed })

  for (let i = 0; i < g.length; i++) g[i] = rng.next() < 0.5 ? 1 : 0

  return g
}

const bitsEqual = (a: Uint8Array, b: Uint8Array): boolean =>
  a.length === b.length && a.every((v, i) => v === b[i])

const count = (g: Uint8Array): number => g.reduce((s, v) => s + v, 0)

suite('operator/margolus-billiard: reversibility', [
  check('each parity step is an involution', () => {
    for (const parity of [0, 1]) {
      const start = fillBits(4, 100 + parity)
      const g = start.slice()

      margolusStep(4, g, parity)
      margolusStep(4, g, parity)
      ok(
        bitsEqual(g, start),
        `parity ${parity} applied twice is the identity`,
      )
    }
  }),
  check(
    'a full beat run forward then backward recovers the field',
    () => {
      const L = 6
      const start = fillBits(L, 7)
      const g = start.slice()

      // beat: parity 0 then parity 1
      margolusStep(L, g, 0)
      margolusStep(L, g, 1)
      // inverse: parity 1 then parity 0 (each step is its own inverse)
      margolusStep(L, g, 1)
      margolusStep(L, g, 0)
      ok(bitsEqual(g, start), 'the beat is exactly reversible')
    },
  ),
])

suite('operator/margolus-billiard: conservation and collisions', [
  check('the block rule conserves the particle count', () => {
    for (const parity of [0, 1]) {
      const start = fillBits(4, 55 + parity)
      const g = start.slice()

      margolusStep(4, g, parity)
      equal(
        count(g),
        count(start),
        `count conserved under parity ${parity}`,
      )
    }
  }),
  check('a diagonal two-particle block is fixed', () => {
    const L = 4
    const g = new Uint8Array(L * L)

    g[at(L, 0, 0)] = 1
    g[at(L, 1, 1)] = 1

    const start = g.slice()

    margolusStep(L, g, 0)
    ok(bitsEqual(g, start), 'a diagonal pair (a wall) does not move')
  }),
  check(
    'a lone ball rotates to the opposite corner of its block',
    () => {
      const L = 4
      const g = new Uint8Array(L * L)

      g[at(L, 0, 0)] = 1
      margolusStep(L, g, 0)
      equal(g[at(L, 0, 0)], 0, 'the original corner is now empty')
      equal(
        g[at(L, 1, 1)],
        1,
        'the ball is at the opposite corner (180 rotation)',
      )
      equal(count(g), 1, 'still one ball')
    },
  ),
])
