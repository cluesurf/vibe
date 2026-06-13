// Verifies the spin and gauge algebra: the D4 and F4 root counts, the binary
// tetrahedral group closure, and the triality coset structure.
// Run: npx tsx code/algebra/group/verify-group.ts

import {
  binaryTetrahedral,
  quaternionGroup,
  multiply,
  equals,
} from '@/code/algebra/group/quaternion'
import { trialityClasses } from '@/code/algebra/group/cell-24'
import { rootsD4, rootsF4 } from '@/code/algebra/group/root-system'

let allPassed = true
function check(name: string, condition: boolean): void {
  console.log(`  ${condition ? 'ok  ' : 'FAIL'} ${name}`)
  if (!condition) allPassed = false
}

const d4 = rootsD4()
check('D4 has 24 roots', d4.length === 24)
check(
  'every D4 root has norm squared 2',
  d4.every((root) => root.reduce((sum, value) => sum + value * value, 0) === 2),
)

check('F4 has 48 roots', rootsF4().length === 48)

const group = binaryTetrahedral()
check('the binary tetrahedral group has 24 elements', group.length === 24)
const closed = group.every((left) =>
  group.every((right) =>
    group.some((candidate) => equals(multiply(left, right), candidate)),
  ),
)
check('it is closed under multiplication (a group)', closed)

check('Q8 has 8 elements', quaternionGroup().length === 8)

const [vector, spinorA, spinorB] = trialityClasses()
check(
  'triality has three classes of eight',
  vector.length === 8 && spinorA.length === 8 && spinorB.length === 8,
)
const all = [...vector, ...spinorA, ...spinorB]
const distinct = all.every(
  (element, index) => all.findIndex((other) => equals(other, element)) === index,
)
check('the three classes are disjoint, 24 distinct vertices', distinct)

console.log(allPassed ? 'OK' : 'FAILED')
if (!allPassed) process.exit(1)
