// P149: the PERCEPTION rule reformulated as a deterministic, reversible, charge-conserving block CA, and
// re-running transport / dispersion on it. (P148, momentum-from-determinism.md.)
//
// P148 showed a generic deterministic reversible rule is ballistic (z=1). Here we reformulate the ACTUAL
// perception rule (share, hop, arrow) as a deterministic reversible Margolus block CA that keeps its
// content, and confirm it is charge-conserving, reversible, AND ballistic. Each pair-update is a
// charge-conserving reversible PERMUTATION of the 9 pair-states:
//   hop:                 (+1,0) <-> (0,+1),  (-1,0) <-> (0,-1)      (a deterministic swap = transport)
//   create/flip/annih:   (0,0) -> (+1,-1) -> (-1,+1) -> (0,0)       (a reversible 3-cycle, the arrow and
//                                                                    share are inverses, forced by reversibility)
//   inert:               (+1,+1), (-1,-1) fixed
// The Margolus alternating partition gives left- AND right-movers (set by parity), so charges propagate
// ballistically and can collide. Run: npx tsx code/experiment/p149-deterministic-perception.ts

import { makeRng } from '@/code/tool/rng'
import { powerLawExponent } from '@/code/measure/regression'
import { differenceRmsWidthRing } from '@/code/measure/front-speed'
import { totalCharge } from '@/code/measure/tone-census'
import {
  PERCEPTION_FORWARD as FWD,
  PERCEPTION_INVERSE as INV,
  perceptionBlockBeat,
} from '@/code/rule/perception-permutation'
import { experiment } from '@/test/scaffold/suite'
import { verdict } from '@/test/scaffold/verdict'

function blockBeat(tone: Int8Array, L: number, parity: number, table: number[]): void {
  perceptionBlockBeat({ tone, length: L, parity, table })
}

export function deterministicPerception(input?: { L?: number; beats?: number }): {
  L: number
  chargeConserved: boolean
  reversible: boolean
  spreadExponent: number
  isBallistic: boolean
  solved: boolean
} {
  const L = input?.L ?? 2000
  const beats = input?.beats ?? 90
  const rng = makeRng({ seed: 7 })

  // (1) charge conservation over a run
  const tone = new Int8Array(L)
  for (let i = 0; i < L; i++) tone[i] = (rng.next() < 0.4 ? (rng.next() < 0.5 ? 1 : -1) : 0) as -1 | 0 | 1
  const q0 = totalCharge(tone)
  for (let t = 0; t < 200; t++) blockBeat(tone, L, t % 2, FWD)
  const chargeConserved = totalCharge(tone) === q0

  // (2) reversibility: forward T beats then backward T beats recovers the initial state exactly
  const init = new Int8Array(L)
  const r2 = makeRng({ seed: 3 })
  for (let i = 0; i < L; i++) init[i] = (r2.next() < 0.4 ? (r2.next() < 0.5 ? 1 : -1) : 0) as -1 | 0 | 1
  const work = init.slice()
  const T = 80
  for (let t = 0; t < T; t++) blockBeat(work, L, t % 2, FWD)
  // reverse: undo each beat in reverse order with the inverse permutation and the same partition parity
  for (let t = T - 1; t >= 0; t--) blockBeat(work, L, t % 2, INV)
  let reversible = true
  for (let i = 0; i < L; i++) if (work[i] !== init[i]) {
    reversible = false
    break
  }

  // (3) transport: a localized perturbation spreads BALLISTICALLY (RMS width ~ t), the butterfly method
  // isolates the perturbation from the deterministic vacuum oscillation
  const center = Math.floor(L / 2)
  const r3 = makeRng({ seed: 11 })
  const base = new Int8Array(L)
  for (let i = 0; i < L; i++) base[i] = (r3.next() < 0.4 ? (r3.next() < 0.5 ? 1 : -1) : 0) as -1 | 0 | 1
  const a = base.slice()
  const b = base.slice()
  b[center] = ((b[center]! + 1) % 3 === 0 ? -1 : (b[center]! + 1)) as -1 | 0 | 1 // perturb one cell
  if (b[center] === base[center]) b[center] = (base[center]! === 1 ? 0 : 1) as -1 | 0 | 1
  const times: number[] = []
  const spreads: number[] = []
  for (let t = 1; t <= beats; t++) {
    blockBeat(a, L, (t - 1) % 2, FWD)
    blockBeat(b, L, (t - 1) % 2, FWD)
    if (t % 5 === 0) {
      times.push(t)
      spreads.push(differenceRmsWidthRing({ a, b, length: L, center }))
    }
  }
  const spreadExponent = powerLawExponent({ times, spreads })
  const isBallistic = spreadExponent > 0.8

  const solved = chargeConserved && reversible && isBallistic

  return { L, chargeConserved, reversible, spreadExponent, isBallistic, solved }
}

export default experiment({
  id: 'relativity/deterministic-perception',
  title: 'the perception rule as a reversible block CA is charge-conserving and ballistic',
  category: 'relativity',
  substrates: 'any',
  depth: 'L2',
  paper: true,
  run() {
    const r = deterministicPerception({ L: 2000 })
    const ok = r.solved && r.chargeConserved && r.reversible && r.isBallistic
    return verdict({
      status: ok ? 'pass' : 'fail',
      claim:
        'the hop create annihilate content as a deterministic reversible charge-conserving block CA is ballistic with z=1',
      metrics: {
        chargeConserved: r.chargeConserved ? 1 : 0,
        reversible: r.reversible ? 1 : 0,
        spreadExponent: r.spreadExponent,
      },
    })
  },
})
