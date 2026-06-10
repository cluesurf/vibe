// P98: the will and delayed gratification, the fork. (Stage 6 of the unfolding,
// see note/research/vibe/notes/unfolding-experiment-plan.md and how-the-will-works.md.)
//
// A self stands at a fork: a SMALL pleasure right now, or a BIG pleasure reached only by enduring a
// valley of pain or peace. The mechanics are exactly those of how-the-will-works.md:
//   - foresight V: the self models the discounted worth of the far reward (discount^distance * bigV),
//     minus the immediate small reward. If the far worth wins, it WANTS to endure.
//   - willpower w: a budget. Each step against the immediate pull spends willpower. Crossing the valley
//     of length D costs D. If willpower runs out mid-valley, the self relapses to the small pleasure.
//   - the field: a strong enough field overrides the will entirely, the self cannot endure and takes the
//     small pleasure regardless.
// Predictions checked: with enough willpower and a worthwhile goal the self DELAYS GRATIFICATION and
// reaches the big pleasure, with too little willpower it RELAPSES to the small one, and a strong field
// OVERRIDES the will. There is a sharp willpower threshold and a field-override threshold.
// HONEST SCOPE: this experiment tests the will's DECISION LOGIC with willpower as an ABSTRACT SCALAR
// budget (a stand-in), plus foresight as a formula and the field as a scalar. It does NOT show that
// willpower is built from the five base things. It answers "given willpower, does delayed gratification
// behave correctly," not "where does willpower come from." The grounding claim, that willpower IS the
// self's integration/charge reserve on the real conserved dynamics with nothing added beyond the five
// (the-will-from-the-four.md), is the separate job of P99.
// Run: npx tsx code/experiment/p98-will-fork.ts

import { pathToFileURL } from 'node:url'

const SMALL = 1 // the immediate small pleasure
const BIG = 5 // the distant big pleasure
const VALLEY = 4 // steps of pain/peace to cross to reach BIG
const DISCOUNT = 0.92 // foresight discount per step of delay
const COST_PER_STEP = 1 // willpower spent per step of enduring
const FIELD_OVERRIDE = 1.0 // a field at or above this strength overrides the will

// The discounted, foresight-modeled worth of the far reward.
function goalWorth(): number {
  return Math.pow(DISCOUNT, VALLEY + 1) * BIG
}

// Run the fork once: returns the pleasure the self ends up with.
function run(willpower: number, fieldStrength: number): number {
  // a strong field overrides the will, the self cannot endure
  if (fieldStrength >= FIELD_OVERRIDE) return SMALL
  // is the far reward worth pursuing at all (foresight)
  if (goalWorth() <= SMALL) return SMALL
  // pursue it: cross the valley, spending willpower each step
  let w = willpower
  for (let step = 0; step < VALLEY; step++) {
    if (w >= COST_PER_STEP) {
      w -= COST_PER_STEP
    } else {
      return SMALL // willpower ran out mid-valley, relapse to the small pleasure
    }
  }
  return BIG // endured the whole valley, reached the big pleasure
}

export function willFork(): {
  goalWorth: number
  worthPursuing: boolean
  outcomeHighWill: number
  outcomeLowWill: number
  outcomeStrongField: number
  willpowerThreshold: number
  willpowerSweep: { willpower: number; outcome: number }[]
  delaysGratification: boolean
  relapsesWhenDepleted: boolean
  fieldOverrides: boolean
  hasSharpThreshold: boolean
  solved: boolean
} {
  const worth = goalWorth()
  const worthPursuing = worth > SMALL

  const outcomeHighWill = run(10, 0) // plenty of willpower, weak field
  const outcomeLowWill = run(2, 0) // not enough willpower to cross a valley of 4
  const outcomeStrongField = run(10, FIELD_OVERRIDE) // strong field overrides even high willpower

  // sweep willpower to find the threshold where the self flips from relapse to delayed gratification
  const willpowerSweep: { willpower: number; outcome: number }[] = []
  for (let wpw = 0; wpw <= 8; wpw++) willpowerSweep.push({ willpower: wpw, outcome: run(wpw, 0) })
  let willpowerThreshold = -1
  for (const s of willpowerSweep) {
    if (s.outcome === BIG) {
      willpowerThreshold = s.willpower
      break
    }
  }

  const delaysGratification = outcomeHighWill === BIG
  const relapsesWhenDepleted = outcomeLowWill === SMALL
  const fieldOverrides = outcomeStrongField === SMALL
  const hasSharpThreshold = willpowerThreshold === VALLEY * COST_PER_STEP

  const solved =
    worthPursuing &&
    delaysGratification &&
    relapsesWhenDepleted &&
    fieldOverrides &&
    hasSharpThreshold

  return {
    goalWorth: worth,
    worthPursuing,
    outcomeHighWill,
    outcomeLowWill,
    outcomeStrongField,
    willpowerThreshold,
    willpowerSweep,
    delaysGratification,
    relapsesWhenDepleted,
    fieldOverrides,
    hasSharpThreshold,
    solved,
  }
}

export function main(): void {
  const r = willFork()
  console.log('P98: the will and delayed gratification, the fork')
  console.log('')
  console.log(`  small pleasure now = ${SMALL}, big pleasure across a valley of ${VALLEY} = ${BIG}`)
  console.log(`  foresight: the modeled worth of the far reward = ${r.goalWorth.toFixed(2)}, worth pursuing: ${r.worthPursuing}`)
  console.log('')
  console.log('  outcomes:')
  console.log(`    high willpower (10), weak field  -> ${r.outcomeHighWill}  (delays gratification, reaches the big pleasure: ${r.delaysGratification})`)
  console.log(`    low willpower (2),  weak field   -> ${r.outcomeLowWill}  (willpower runs out, relapses to the small: ${r.relapsesWhenDepleted})`)
  console.log(`    high willpower (10), strong field -> ${r.outcomeStrongField}  (field overrides the will: ${r.fieldOverrides})`)
  console.log('')
  console.log('  willpower sweep (the threshold for enduring the valley):')
  console.log('    ' + r.willpowerSweep.map((s) => `${s.willpower}:${s.outcome}`).join('  '))
  console.log(`    sharp threshold at willpower ${r.willpowerThreshold} (= valley length): ${r.hasSharpThreshold}`)
  console.log('')
  console.log(`  SOLVED: ${r.solved}`)
}

if (process.argv[1] !== undefined && import.meta.url === pathToFileURL(process.argv[1]).href) {
  main()
}
