// Verifies the 9-state pair table and the 24-slot D4 collide: the collision
// conserves the per-cell charge and is exactly reversible through its paired
// inverse, both as a local map (24 slots in isolation) and inside the full
// stream-collide engine. Run: npx tsx code/check/verify-collision.ts

import { squareMesh, d4Mesh } from '@/code/tool/mesh'
import { makeWill } from '@/code/tone/will'
import { pairCollision, PAIR_FORWARD, PAIR_INVERSE } from '@/code/rule/collision'
import { conservesCharge, isReversible } from '@/code/check/invariant'
import { rootsD4 } from '@/code/algebra/group/root-system'

let state = 7
const random = (): number => {
  state = (state * 1103515245 + 12345) & 0x7fffffff
  return state / 0x7fffffff
}
const randomTone = (): number => Math.floor(random() * 3) - 1

// The D4 coin: opposite[direction] is the index of the negated root, so the two
// tones moving head-on through a {3,4,3,4} cell pair up.
const roots = rootsD4()
const oppositeD4 = roots.map((root) => {
  const index = roots.findIndex((other) =>
    other.every((value, axis) => value === -(root[axis] ?? 0)),
  )
  return index
})
const everyDirectionPaired = oppositeD4.every(
  (other, direction) => other >= 0 && oppositeD4[other] === direction,
)

// Test 1: the 24-slot collide in isolation conserves the cell sum and reverses.
const forward = pairCollision({ opposite: oppositeD4, forward: true })
const inverse = pairCollision({ opposite: oppositeD4, forward: false })
let localConserves = true
let localReverses = true
for (let trial = 0; trial < 5000; trial++) {
  const original = new Int8Array(24)
  for (let slot = 0; slot < 24; slot++) original[slot] = randomTone()
  const sumBefore = original.reduce((total, value) => total + value, 0)
  const work = original.slice()
  forward(work, 0, 24)
  const sumAfter = work.reduce((total, value) => total + value, 0)
  if (sumAfter !== sumBefore) localConserves = false
  inverse(work, 0, 24)
  for (let slot = 0; slot < 24; slot++) {
    if (work[slot] !== original[slot]) localReverses = false
  }
}

// The forward and inverse tables are a permutation and its inverse (9 states).
const tablePermutes =
  new Set(PAIR_FORWARD.map((pair) => pair.join(','))).size === 9 &&
  new Set(PAIR_INVERSE.map((pair) => pair.join(','))).size === 9

// Test 2: the same pair collision inside the engine, on a periodic square mesh
// (four directions, two opposite pairs), conserves charge and reverses exactly.
const mesh = squareMesh({ side: 48 })
const will = makeWill(mesh)
for (let index = 0; index < will.data.length; index++) {
  will.data[index] = randomTone()
}
const opposite = Array.from({ length: mesh.degree }, (_, d) => mesh.opposite(d))
const engineForward = pairCollision({ opposite, forward: true })
const engineInverse = pairCollision({ opposite, forward: false })
const beats = 200
const engineConserves = conservesCharge(will, engineForward, beats)
const engineReverses = isReversible(will, engineForward, beats, engineInverse)

// Test 3: the directional rule on the real 24-direction {3,4,3,4} D4 coin.
const d4 = d4Mesh({ side: 6 })
const d4Will = makeWill(d4)
for (let index = 0; index < d4Will.data.length; index++) {
  d4Will.data[index] = randomTone()
}
const d4Opposite = Array.from({ length: d4.degree }, (_, d) => d4.opposite(d))
const d4Forward = pairCollision({ opposite: d4Opposite, forward: true })
const d4Inverse = pairCollision({ opposite: d4Opposite, forward: false })
const d4Conserves = conservesCharge(d4Will, d4Forward, 60)
const d4Reverses = isReversible(d4Will, d4Forward, 60, d4Inverse)

console.log(`D4 coin closes under opposite: ${everyDirectionPaired}`)
console.log(`9-state table is a permutation and its inverse: ${tablePermutes}`)
console.log(`24-slot collide conserves charge (5000 cells): ${localConserves}`)
console.log(`24-slot collide reverses (5000 cells): ${localReverses}`)
console.log(`engine over ${beats} beats: charge conserved ${engineConserves}, reversible ${engineReverses}`)
console.log(`d4Mesh (24 directions) over 60 beats: charge conserved ${d4Conserves}, reversible ${d4Reverses}`)

if (
  !everyDirectionPaired ||
  !tablePermutes ||
  !localConserves ||
  !localReverses ||
  !engineConserves ||
  !engineReverses ||
  !d4Conserves ||
  !d4Reverses
) {
  console.error('FAILED: the 9-state collision is not conserving or reversible')
  process.exit(1)
}
console.log('OK')
