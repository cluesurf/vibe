// Test cyclic overflow with forced scenarios
import { advanceVibe, printVibe, type Vibe } from '../code/vibe'
import { cyclicOverflow } from '../code/code'

console.log('='.repeat(60))
console.log('Cyclic Overflow - Forced Wrapping Scenarios')
console.log('='.repeat(60))

// Scenario 1: Pleasure surrounded by Pain - should wrap
console.log('\nScenario 1: Single Pleasure (z) surrounded by Pain (x)')
const root1: Vibe = { tone: 0, nest: [] }
// Create custom pattern: 1 Pleasure, 7 Pain
root1.nest.push({ tone: 1, home: root1, nest: [] }) // Pleasure
for (let i = 0; i < 7; i++) {
  root1.nest.push({ tone: -1, home: root1, nest: [] }) // Pain
}

console.log('Initial:')
printVibe(root1)

for (let move = 1; move <= 5; move++) {
  advanceVibe(root1, cyclicOverflow)
  console.log(`\nMove ${move}:`)
  printVibe(root1)

  const firstChild = root1.nest[0]!
  if (move === 1 && firstChild.tone === -1) {
    console.log('  → Pleasure wrapped around to Pain!')
  }
}

// Scenario 2: Pain surrounded by Pleasure - should wrap
console.log('\n' + '='.repeat(40))
console.log('\nScenario 2: Single Pain (x) surrounded by Pleasure (z)')
const root2: Vibe = { tone: 0, nest: [] }
// Create custom pattern: 1 Pain, 7 Pleasure
root2.nest.push({ tone: -1, home: root2, nest: [] }) // Pain
for (let i = 0; i < 7; i++) {
  root2.nest.push({ tone: 1, home: root2, nest: [] }) // Pleasure
}

console.log('Initial:')
printVibe(root2)

for (let move = 1; move <= 5; move++) {
  advanceVibe(root2, cyclicOverflow)
  console.log(`\nMove ${move}:`)
  printVibe(root2)

  const firstChild = root2.nest[0]!
  if (move === 1 && firstChild.tone === 1) {
    console.log('  → Pain wrapped around to Pleasure!')
  }
}

// Scenario 3: Peace trying to reach Pain from Pleasure
console.log('\n' + '='.repeat(40))
console.log('\nScenario 3: Mixed forcing wraparound')
const root3: Vibe = { tone: 0, nest: [] }
// Pattern designed to force wrapping
for (let i = 0; i < 8; i++) {
  root3.nest.push({
    tone: i < 2 ? 1 : i < 4 ? 0 : -1, // 2 Pleasure, 2 Peace, 4 Pain
    home: root3,
    nest: [],
  })
}

console.log('Initial:')
printVibe(root3)

for (let move = 1; move <= 8; move++) {
  advanceVibe(root3, cyclicOverflow)
  console.log(`\nMove ${move}:`)
  printVibe(root3)
}
