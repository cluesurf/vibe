// Test for naturally stable root without forcing
import { splitVibe, advanceVibe, printVibe, type Vibe } from '../code/vibe'
import { peaceBiased, balancedChildren, naturalBalance } from '../code/code'

const systems = [
  { code: peaceBiased, name: 'Peace-Biased' },
  { code: balancedChildren, name: 'Balanced Children' },
  { code: naturalBalance, name: 'Natural Balance' },
]

for (const { code, name } of systems) {
  console.log('\n' + '='.repeat(60))
  console.log(`Testing ${name} for natural root stability`)
  console.log('='.repeat(60))

  const root: Vibe = { tone: 0, nest: [] }
  splitVibe(root, 'alternating')

  console.log('\nInitial State:')
  printVibe(root)

  let rootHistory: Tone[] = []
  
  // Run for 30 moves to see if root stabilizes
  for (let move = 1; move <= 30; move++) {
    advanceVibe(root, code)
    rootHistory.push(root.tone)
    
    if (move <= 10 || move % 5 === 0) {
      console.log(`\nMove ${move}:`)
      printVibe(root)
      
      // Show root stability
      const last10 = rootHistory.slice(-10)
      const peacefulMoves = last10.filter(t => t === 0).length
      console.log(`  Root stability (last 10): ${peacefulMoves}/10 at Peace`)
    }
  }
  
  // Final analysis
  const peacefulTotal = rootHistory.filter(t => t === 0).length
  console.log(`\nFinal Analysis: Root was at Peace ${peacefulTotal}/30 moves (${Math.round(peacefulTotal/30*100)}%)`)
}