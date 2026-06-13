// Verifies the generic lattice-gas engine against the known-good 2D reference
// (the discrete rule of p229): on a periodic square mesh with the momentum-rotate
// involution, the rule conserves charge exactly and is exactly reversible.
// Run: npx tsx code/check/verify-lattice-gas.ts

import { squareMesh } from '@/code/tool/mesh'
import { makeWill } from '@/code/tone/will'
import { momentumRotate2D } from '@/code/rule/collision'
import { conservesCharge, isReversible } from '@/code/check/invariant'

const mesh = squareMesh({ side: 64 })
const will = makeWill(mesh)

// deterministic ternary fill, the same LCG seed as the reference
let state = 7
const random = (): number => {
  state = (state * 1103515245 + 12345) & 0x7fffffff
  return state / 0x7fffffff
}
for (let index = 0; index < will.data.length; index++) {
  will.data[index] = Math.floor(random() * 3) - 1
}

const beats = 200
const charged = conservesCharge(will, momentumRotate2D, beats)
const reversible = isReversible(will, momentumRotate2D, beats)

console.log(
  `lattice-gas engine over ${beats} beats: charge conserved ${charged}, reversible ${reversible}`,
)
if (!charged || !reversible) {
  console.error('FAILED: the engine does not match the reference invariants')
  process.exit(1)
}
console.log('OK')
