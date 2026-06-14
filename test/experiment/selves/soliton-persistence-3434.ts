// P263 (FRONTIER 3, the stronger move): p262 found persistence needs an amplitude-preserving nonlinearity.
// But a REVERSIBLE CONSERVING lattice gas, the exact class of the {3,4,3,4} directional rule, is KNOWN to
// support persistent SOLITONS (the box-ball system, a reversible conserving cellular automaton). We test it
// directly: (1) a single soliton PERSISTS and moves at constant speed = its size, (2) two solitons of
// different sizes COLLIDE and emerge with their sizes PRESERVED (identity survives the collision, like KdV
// solitons), (3) the conserved charge (ball count) is exactly preserved. So a conserving reversible rule of
// the {3,4,3,4} type DOES produce persistent particles, the nonlinearity is the gas collision itself.
//   VERDICT: persistence is realizable in the rule CLASS, the bare-rule churn (P101) is not the whole story,
//   conserving reversible dynamics support solitons. Whether the specific 24-direction rule's solitons are the
//   spinor defects is the remaining link.
// Run: npx tsx code/experiment/p263-soliton-persistence-3434.ts

import { experiment } from '@/test/scaffold/suite'
import { verdict } from '@/test/scaffold/verdict'

// box-ball system: a reversible conserving CA. carrier sweeps left to right, picks up balls, drops them.
function bbsStep(s: number[]): number[] {
  const out = new Array(s.length).fill(0)
  let carrier = 0
  for (let i = 0; i < s.length; i++) {
    if (s[i] === 1) carrier++ // pick up a ball
    else if (carrier > 0) { out[i] = 1; carrier-- } // drop a ball into an empty box
  }
  return out
}
// soliton sizes = the maximal runs of consecutive balls
function solitonSizes(s: number[]): number[] {
  const sizes: number[] = []; let run = 0
  for (const b of s) { if (b === 1) run++; else { if (run > 0) sizes.push(run); run = 0 } }
  if (run > 0) sizes.push(run)
  return sizes.sort((a, b) => b - a)
}
const ballCount = (s: number[]): number => s.reduce((a, b) => a + b, 0)
const centerOfMass = (s: number[]): number => { let c = 0, n = 0; s.forEach((b, i) => { if (b) { c += i; n++ } }); return c / (n || 1) }

export function solitonPersistence(): { singlePersists: boolean; constantSpeed: boolean; identityPreserved: boolean; chargeConserved: boolean; solitonsExist: boolean } {
  const L = 200
  // (1) single soliton (a block of 3 balls) persists and moves at speed = size
  let s = new Array(L).fill(0); s[5] = 1; s[6] = 1; s[7] = 1
  const positions: number[] = []
  let sz = solitonSizes(s)
  for (let t = 0; t < 30; t++) { positions.push(centerOfMass(s)); s = bbsStep(s) }
  const sizesStable = solitonSizes(s).join(',') === sz.join(',')
  const speeds = positions.slice(1).map((p, i) => p - positions[i]!)
  const constantSpeed = speeds.every((v) => Math.abs(v - 3) < 0.01) // size-3 soliton moves at speed 3
  const singlePersists = sizesStable && solitonSizes(s).length === 1

  // (2) two solitons (sizes 3 and 1) collide, emerge with sizes PRESERVED (the big one overtakes the small)
  // runs(s) = list of {size, pos} for each maximal ball-run
  const runs = (s: number[]): { size: number; pos: number }[] => { const out: { size: number; pos: number }[] = []; let run = 0, start = 0; s.forEach((b, i) => { if (b === 1) { if (run === 0) start = i; run++ } else if (run > 0) { out.push({ size: run, pos: start + (run - 1) / 2 }); run = 0 } }); if (run > 0) out.push({ size: run, pos: start + (run - 1) / 2 }); return out }
  let s2 = new Array(L).fill(0); s2[3] = s2[4] = s2[5] = 1; s2[12] = 1 // a 3 behind a 1, the 3 is faster
  const before = solitonSizes(s2)
  const startRuns = runs(s2); const big0 = startRuns.find((r) => r.size === 3)!, small0 = startRuns.find((r) => r.size === 1)!
  for (let t = 0; t < 50; t++) s2 = bbsStep(s2)
  const after = solitonSizes(s2)
  const endRuns = runs(s2); const big1 = endRuns.find((r) => r.size === 3), small1 = endRuns.find((r) => r.size === 1)
  // overtaking: the size-3 started BEHIND (smaller pos) and ends AHEAD (larger pos) of the size-1
  const overtook = !!big1 && !!small1 && big0.pos < small0.pos && big1.pos > small1.pos
  const sizesPreserved = before.join(',') === after.join(',') && after.length === 2
  const identityPreserved = sizesPreserved && overtook

  // (3) charge (ball count) conserved exactly through everything
  const chargeConserved = ballCount(s2) === before.reduce((a, b) => a + b, 0)

  const solitonsExist = singlePersists && constantSpeed && identityPreserved && chargeConserved

  return { singlePersists, constantSpeed, identityPreserved, chargeConserved, solitonsExist }
}

export default experiment({
  id: 'selves/soliton-persistence-3434',
  title: 'a reversible conserving box-ball rule produces persistent solitons that survive collisions',
  category: 'selves',
  substrates: ['3434'],
  depth: 'L2',
  paper: false,
  run() {
    const r = solitonPersistence()
    const ok = r.solitonsExist
    return verdict({
      status: ok ? 'pass' : 'fail',
      claim:
        'the box-ball system, a reversible conserving lattice gas of the same class as the directional rule, gives a single soliton that moves at constant speed equal to its size and two solitons that collide and emerge with their sizes preserved, with the ball count exactly conserved',
      metrics: {
        singlePersists: r.singlePersists ? 1 : 0,
        constantSpeed: r.constantSpeed ? 1 : 0,
        identityPreserved: r.identityPreserved ? 1 : 0,
        chargeConserved: r.chargeConserved ? 1 : 0,
      },
      notes:
        'L2, known physics reproduced. The box-ball system is a known reversible conserving cellular automaton with KdV-like soliton identity, fully deterministic. This shows persistence is realizable in the rule CLASS, the collision nonlinearity is the gas itself. It does NOT show the specific 24-direction rule produces these solitons, nor that they are the spinor defects, which is the remaining link.',
    })
  },
})
