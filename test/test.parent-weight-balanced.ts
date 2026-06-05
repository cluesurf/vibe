// Test parent weight with balanced scenarios
import { splitVibe, advanceVibe, printVibe, type Vibe } from '../code/vibe'
import { parentWeight, immediateAdoption } from '../code/code'

console.log('='.repeat(60))
console.log('Parent Weight - Scenarios where 3x makes a difference')
console.log('='.repeat(60))

// Scenario 1: 5 vs 3 becomes 5 vs 5 with weight
console.log('\nScenario 1: Pain parent with 5 Pleasure + 3 Pain children')
console.log('Without weight: 1+3=4 Pain vs 5 Pleasure → Pleasure wins')
console.log('With 3x weight: 3+3=6 Pain vs 5 Pleasure → Pain wins!')

console.log('\n--- WITHOUT Parent Weight:')
const root1: Vibe = { tone: -1, nest: [] }
for (let i = 0; i < 5; i++) {
  root1.nest.push({ tone: 1, home: root1, nest: [] }) // Pleasure
}
for (let i = 0; i < 3; i++) {
  root1.nest.push({ tone: -1, home: root1, nest: [] }) // Pain
}

console.log('Initial:')
printVibe(root1)

for (let move = 1; move <= 3; move++) {
  advanceVibe(root1, immediateAdoption)
  console.log(`Move ${move}:`)
  printVibe(root1)
}

console.log('\n--- WITH Parent Weight (3x):')
const root2: Vibe = { tone: -1, nest: [] }
for (let i = 0; i < 5; i++) {
  root2.nest.push({ tone: 1, home: root2, nest: [] }) // Pleasure
}
for (let i = 0; i < 3; i++) {
  root2.nest.push({ tone: -1, home: root2, nest: [] }) // Pain
}

console.log('Initial:')
printVibe(root2)

for (let move = 1; move <= 3; move++) {
  advanceVibe(root2, parentWeight)
  console.log(`Move ${move}:`)
  printVibe(root2)
}

// Scenario 2: Exact tie broken by parent
console.log('\n' + '='.repeat(40))
console.log('\nScenario 2: Peace parent with 4 Pain + 4 Pleasure children')
console.log('Without weight: 4 Pain vs 4 Pleasure (tie)')
console.log('With 3x weight: Parent Peace tips the balance')

console.log('\n--- WITHOUT Parent Weight:')
const root3: Vibe = { tone: 0, nest: [] }
for (let i = 0; i < 4; i++) {
  root3.nest.push({ tone: -1, home: root3, nest: [] }) // Pain
}
for (let i = 0; i < 4; i++) {
  root3.nest.push({ tone: 1, home: root3, nest: [] }) // Pleasure
}

console.log('Initial:')
printVibe(root3)

for (let move = 1; move <= 3; move++) {
  advanceVibe(root3, immediateAdoption)
  console.log(`Move ${move}:`)
  printVibe(root3)
}

console.log('\n--- WITH Parent Weight (3x):')
const root4: Vibe = { tone: 0, nest: [] }
for (let i = 0; i < 4; i++) {
  root4.nest.push({ tone: -1, home: root4, nest: [] }) // Pain
}
for (let i = 0; i < 4; i++) {
  root4.nest.push({ tone: 1, home: root4, nest: [] }) // Pleasure
}

console.log('Initial:')
printVibe(root4)

for (let move = 1; move <= 3; move++) {
  advanceVibe(root4, parentWeight)
  console.log(`Move ${move}:`)
  printVibe(root4)
}