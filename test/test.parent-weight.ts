// Test parent weight systems
import { splitVibe, advanceVibe, printVibe, type Vibe } from '../code/vibe'
import { parentWeight, parentWeightGradual, immediateAdoption } from '../code/code'

console.log('='.repeat(60))
console.log('Parent Weight Systems - Parent counts 3x')
console.log('='.repeat(60))

// Test scenario: Parent is Pain, most children are Pleasure
// Without weighting, children should become Pleasure
// With weighting, Pain parent should have more influence

console.log('\nTest Setup: Pain parent with 6 Pleasure + 2 Pain children')
console.log('Without weight: 1 Pain parent + 2 Pain = 3 Pain vs 6 Pleasure')
console.log('With 3x weight: 3 Pain parent + 2 Pain = 5 Pain vs 6 Pleasure')

// First test without parent weight
console.log('\n' + '-'.repeat(40))
console.log('WITHOUT Parent Weight (standard):')
const root1: Vibe = { tone: -1, nest: [] } // Pain parent
// Add 6 Pleasure children
for (let i = 0; i < 6; i++) {
  root1.nest.push({ tone: 1, home: root1, nest: [] })
}
// Add 2 Pain children
for (let i = 0; i < 2; i++) {
  root1.nest.push({ tone: -1, home: root1, nest: [] })
}

console.log('\nInitial:')
printVibe(root1)

for (let move = 1; move <= 5; move++) {
  advanceVibe(root1, immediateAdoption)
  console.log(`\nMove ${move}:`)
  printVibe(root1)
}

// Now test WITH parent weight
console.log('\n' + '-'.repeat(40))
console.log('WITH Parent Weight (3x):')
const root2: Vibe = { tone: -1, nest: [] } // Pain parent
// Add 6 Pleasure children
for (let i = 0; i < 6; i++) {
  root2.nest.push({ tone: 1, home: root2, nest: [] })
}
// Add 2 Pain children
for (let i = 0; i < 2; i++) {
  root2.nest.push({ tone: -1, home: root2, nest: [] })
}

console.log('\nInitial:')
printVibe(root2)

for (let move = 1; move <= 5; move++) {
  advanceVibe(root2, parentWeight)
  console.log(`\nMove ${move}:`)
  printVibe(root2)
}

// Test with gradual transitions
console.log('\n' + '-'.repeat(40))
console.log('WITH Parent Weight Gradual (3x):')
const root3: Vibe = { tone: -1, nest: [] } // Pain parent
// Add 6 Pleasure children
for (let i = 0; i < 6; i++) {
  root3.nest.push({ tone: 1, home: root3, nest: [] })
}
// Add 2 Pain children
for (let i = 0; i < 2; i++) {
  root3.nest.push({ tone: -1, home: root3, nest: [] })
}

console.log('\nInitial:')
printVibe(root3)

for (let move = 1; move <= 5; move++) {
  advanceVibe(root3, parentWeightGradual)
  console.log(`\nMove ${move}:`)
  printVibe(root3)
}