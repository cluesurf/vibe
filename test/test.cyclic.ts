// Test cyclic overflow system
import {
  splitVibe,
  advanceVibe,
  printVibe,
  type Vibe,
} from '../code/vibe'
import { cyclicOverflow } from '../code/code'

console.log('='.repeat(60))
console.log('Cyclic Overflow System')
console.log('Values wrap: ...→-1→0→1→-1→0→1→...')
console.log('='.repeat(60))

// Test 1: All Pleasure initial state
console.log('\nTest 1: Starting with all Pleasure')
const root1: Vibe = { tone: 0, nest: [] }
splitVibe(root1, 'all-pleasure')

console.log('\nInitial State:')
printVibe(root1)

for (let move = 1; move <= 8; move++) {
  advanceVibe(root1, cyclicOverflow)
  console.log(`\nMove ${move}:`)
  printVibe(root1)

  // Check for wrapping
  if (root1.nest.some(c => c.tone === -1)) {
    console.log('  → Wrapped from Pleasure(1) to Pain(-1)!')
  }
}

// Test 2: Alternating pattern
console.log('\n' + '='.repeat(40))
console.log('\nTest 2: Starting with alternating pattern')
const root2: Vibe = { tone: 0, nest: [] }
splitVibe(root2, 'alternating')

console.log('\nInitial State:')
printVibe(root2)

for (let move = 1; move <= 10; move++) {
  advanceVibe(root2, cyclicOverflow)
  console.log(`\nMove ${move}:`)
  printVibe(root2)

  // Analyze patterns
  const pattern = root2.nest
    .map(c => (c.tone === -1 ? 'x' : c.tone === 0 ? 'y' : 'z'))
    .join('')

  // Check for interesting patterns
  if (
    pattern === 'xxxxxxxx' ||
    pattern === 'yyyyyyyy' ||
    pattern === 'zzzzzzzz'
  ) {
    console.log('  → Converged to uniform state')
  } else if (pattern === 'xzxzxzxz' || pattern === 'zxzxzxzx') {
    console.log('  → Stable oscillation')
  }
}
