// Gravity, the rule: does a reversible, integer, local, occupancy-gated take exist on the adopted knit (E-GRV-0060)? A
// dock's slots take their neighbor's value less often where the dock is crowded, so the gate reads every vibe alike and
// is charge-blind by construction. The candidate the roadmap recommends after E-GRV-0056 to E-GRV-0059 found no channel
// for gravity on the current rules. This file is the gate that can kill it: the rule must be a bijection with an exact
// inverse, conserve energy and charge, keep the old knit exactly where every dock is alike, and commute with the knit's
// symmetries.
//
// THE RULE: code/measure/gated-take (header). In short: one integer counter and one parity bit per dock; a dock takes
// only on the beats its counter is 0; its counter counts to a threshold L(E) set by its energy E after the take (held
// slots + 2 per stored unit) and carries to 0; a slot whose neighbor is paused turns back into the opposite slot of its
// own dock; the dock's own parity picks the collision order. The law: L(E) = 1 + max(0, E - 32), so the counter runs
// over 0 .. 16 (a full dock, E = 48, takes once in 17 beats).
//
// WHY ENERGY AND NOT FILLED SLOTS, AND WHY 32 (from the probe below, disclosed): the adopted vacuum is not uniform. Its
// docks hold 0, 8 or 24 energy in their stores, and its pair exchange fills all 24 slots of a hub dock at some beats. So
// a gate on the filled-slot count fires in the vacuum at every threshold below 24 and never fires at 24: a filled-slot
// gate cannot leave the vacuum untouched and slow anything. The dock energy reaches 24 in the vacuum and at most 25 in
// a gas of 2 per dock; the threshold 32 leaves both untouched with room for a dilute test population.
//
// THE NATURAL DESIGNS, refuted by witnesses on the knit (store emptied, side 8):
//   N1 take-or-keep (a slot takes when its dock's gate is open, keeps otherwise): an active dock beside a paused one
//      loses the vibe headed into it; two states that differ by that vibe map to one state, and charge is not kept
//   N2 the carry gate (counter + (A - E) mod M, take on the carry, E read at the take; A = M = 49): a paused dock
//      holding one vibe and an active empty dock receiving the same vibe from its neighbor map to one state
// THE THEOREM (Liouville on the counter), checked exhaustively: a gate that reads only a counter, and a counter that
// runs a permutation for each E, keep the uniform distribution over counter values. So averaged over counter starts,
// the fraction of docks that take is exactly 1 / M at every beat whatever the occupancy: a counter-gated take slows a
// crowded dock only from a special start (the rest start, every counter 0), never on average.
//
// Gates, fixed before the first run of this file:
//  R1 a bijection with its inverse built: on every start (vacuum, gas, crowd, crowd flipped, crowd in a gas, a full
//     torus, and a crowd whose counters fill 0 .. 16 including the upper cycle), on every member, the inverse of every
//     beat returns the state before it exactly (slots and points, stores and points, counters, parities), and 40 beats
//     forward then 40 back return the start exactly; and the counter step is a permutation of 0 .. 16 for every E
//  R2 energy and charge exact at every beat of every run
//  R3 the old knit kept: the vacuum and a gas of 2 per dock at sides 8 and 16 run bit for bit as the old knit at every
//     beat with no dock above the threshold; a full torus (every slot and store held, every dock alike) runs as the old
//     knit on a clock 17 times slower, bit for bit at every beat; the constant law L = 3 on the vacuum likewise at 3
//  R4 covariance: the rule commutes with global charge conjugation (a crowd in a gas) and with the lattice translation
//     by 2 e4 (on the identity-link box, where the old knit has it; a crowd off center in a gas) at every beat
//  R5 the gate acts as designed: from the rest start of a crowd, every interval between two takes of a dock equals L of
//     its energy after the first (0 violations), no counter enters the upper cycle, and the crowd takes on fewer than
//     half of its dock-beats
//  R6 the witnesses: N1 and N2 each map two different states to one
//  R7 the theorem: for every L and for a varying sequence of L, exactly 1 of the 17 counter values is at 0 at every beat
//     of 578, and from rest a dock with fixed L takes at exactly the beats divisible by L
//  R8 the vacuum's occupancy: some dock holds 24 of 24 slots at some beat, and no dock's energy exceeds 24
// Verdict: pass if all hold (a reversible occupancy-gated take exists, of this form); fail otherwise.
//
// DISCLOSED: one probe before this file (tmp/grv60-probe1.ts, the OLD knit only, no gate, no crowd): the per-dock
// filled-slot and energy histograms of the vacuum and of Weyl gases (1, 2 and 4 per dock) at side 16, which set the
// threshold and the choice of energy (above). A smoke run of this file's code path (side 8, one member, 4 beats) printed
// only R1's booleans.
//
// FIRST RUN (tmp/grv0060-run1.log, 9 s, the record): fail on R5 alone, recorded as is, no gate moved. R1 to R4 and R6 to
// R8 hold. R5's interval law holds (0 of 472,897 intervals off L(E), 0 upper-cycle visits), but the crowd started at rest
// takes on beat 0 like every dock, its outer docks give their vibes away and fall below the threshold, and from then
// on they take every beat: the crowd took on 25,345 of 31,680 of its dock-beats, not fewer than half. The rule keeps no
// crowd. The PARITY bit is not needed for the bijection: with the global schedule the rule is still one (the gate
// reads only counters). It is needed only for R3's slowed full torus to be the old knit exactly. The minimal rule is
// one integer counter per dock and the turn-back. Title written after the run.
//
// Depth L2: exact checks of a constructed rule on the adopted knit's own vacuum, gases and crowds, against the old knit.
// DETERMINISM: the link starts and Weyl fills; nothing is drawn. NOTHING MOVES: a slot takes its neighbor's value.

import { experiment } from '@/test/scaffold/suite'
import { verdict } from '@/test/scaffold/verdict'
import { arrowBox, chargeOf, energyOf, twoWay, vacuumState, type ArrowBox } from '@/code/measure/second-law-husk'
import { sameReduced } from '@/code/measure/living-pair-kernel'
import { startFamily, withStart } from '@/code/measure/start-ensemble'
import { GOLDEN } from '@/code/tool/weyl'
import {
  ballDocks,
  carryBeat,
  cloneGated,
  conjugate,
  constantLaw,
  counterStep,
  counterStepBack,
  crowdStart,
  dockEnergy,
  gasFill,
  gatedBeatBack,
  gatedRunner,
  gatedTake,
  occupancyLaw,
  restState,
  sameGated,
  takeOrKeep,
  translate,
  uncollide,
  type BeatTally,
  type GateLaw,
  type GatedState,
} from '@/code/measure/gated-take'

export const REVERSIBLE = {
  side: 8,
  checkSide: 16,
  threshold: 32,
  beats: 40,
  radius: 2,
  gasPerDock: 2,
  offsets: 2,
  torusBlocks: 4,
  constant: 3,
  theoremBeats: 578,
} as const

const frac = (x: number): number => x - Math.floor(x)

export default experiment({
  id: 'gravity/gated-take-reversible',
  code: 'E-GRV-0060',
  title:
    'a reversible occupancy-gated take exists on the adopted knit, but only as a counter-gated mirror, and it keeps no crowd, fail on R5 alone: one integer counter per dock (counting to L(E) = 1 + max(0, E - 32), E the dock energy after its take) gates the take, a slot beside a paused dock turns back into its own opposite slot, and the rule is a bijection with its inverse built (840 of 840 beats inverted exactly over 21 runs, every run returned, the counter step a permutation for all 17 lengths), conserves energy and charge, keeps the old knit bit for bit on 288 vacuum and gas beats, runs a full torus as the old knit at 1/17 on 204 beats, commutes with charge conjugation and the 2 e4 shift, and takes on exactly L(E) on 472,897 of 472,897 intervals; but the two natural designs are not bijections (take-or-keep loses a vibe, the carry gate read at the take maps two states to one), a counter-only gate slows nothing on average over counter starts (exactly 1 of 17 values at 0 on every beat, for every L), a filled-slot gate cannot spare the vacuum (a hub dock holds 24 of 24 slots on 12,288 of 159,744 dock-beats), and a crowd started at rest melts, taking on 25,345 of 31,680 crowd dock-beats',
  category: 'gravity',
  substrates: ['3434'],
  depth: 'L2',
  paper: false,
  run() {
    const started = Date.now()
    const S = REVERSIBLE
    const law = occupancyLaw(S.threshold)
    const members = startFamily(S.offsets)
    let r1 = true
    let r1Beats = 0
    let r1Returns = 0
    let r1Runs = 0
    let r2 = true
    let r3Plain = true
    let r3PlainBeats = 0
    let r3MaxEnergy = 0
    let r3Torus = true
    let r3TorusBeats = 0
    let r3Constant = true
    let r3ConstantBeats = 0
    let r4Charge = true
    let r4ChargeOld = true
    let r4Shift = true
    let r4ShiftOld = true
    let r4Beats = 0
    let r5Violations = 0
    let r5Intervals = 0
    let r5Upper = 0
    let r5CrowdActive = 0
    let r5CrowdDockBeats = 0
    let turned = 0
    let r6N1 = false
    let r6N1ChargeLost = 0
    let r6N2 = false
    let r7 = true
    let r8Full = 0
    let r8DockBeats = 0
    let r8MaxEnergy = 0
    let r8MaxFilled = 0

    // R1 part: the counter step is a permutation for every L, with the inverse
    for (let L = 1; L <= law.top; L++) {
      const seen = new Set<number>()

      for (let c = 0; c < law.top; c++) {
        const n = counterStep(c, L, law.top)

        seen.add(n)
        if (counterStepBack(n, L, law.top) !== c) r1 = false
      }

      if (seen.size !== law.top) r1 = false
    }

    // R7: the theorem on the counter
    for (let L = 1; L <= law.top; L++) {
      const cs = Array.from({ length: law.top }, (_, c) => c)
      let rest = 0

      for (let t = 0; t < S.theoremBeats; t++) {
        if (cs.filter(c => c === 0).length !== 1) r7 = false
        if ((rest === 0) !== (t % L === 0)) r7 = false
        for (let i = 0; i < cs.length; i++) cs[i] = counterStep(cs[i] as number, L, law.top)
        rest = counterStep(rest, L, law.top)
      }
    }

    {
      const cs = Array.from({ length: law.top }, (_, c) => c)

      for (let t = 0; t < S.theoremBeats; t++) {
        const L = 1 + Math.floor(law.top * frac((t + 1) * GOLDEN))

        if (cs.filter(c => c === 0).length !== 1) r7 = false
        for (let i = 0; i < cs.length; i++) cs[i] = counterStep(cs[i] as number, L, law.top)
      }
    }

    // run a start forward, checking every beat's inverse and the conservation, then back to the start
    const reversible = (box: ArrowBox, useLaw: GateLaw, start: GatedState, watch?: { docks: Uint8Array }): void => {
      const g = gatedTake(box, useLaw)
      const r = gatedRunner(g, start)
      const e0 = energyOf(start.s)
      const q0 = chargeOf(start.s)
      const tmp = cloneGated(start)
      const lastTake = new Int32Array(box.cells).fill(-1)
      const lastL = new Int32Array(box.cells)

      r1Runs++

      for (let t = 0; t < S.beats; t++) {
        const before = cloneGated(r.state())
        const tally: BeatTally = { active: 0, turned: 0, upper: 0 }

        r.forward(tally)
        turned += tally.turned

        const after = r.state()

        gatedBeatBack(g, after, tmp)
        if (!sameGated(tmp, before)) r1 = false
        r1Beats++
        if (energyOf(after.s) !== e0 || chargeOf(after.s) !== q0) r2 = false

        if (watch) {
          r5Upper += tally.upper

          for (let x = 0; x < box.cells; x++) {
            if (before.counter[x] !== 0) {
              if (watch.docks[x]) r5CrowdDockBeats++
              continue
            }

            if (watch.docks[x]) {
              r5CrowdActive++
              r5CrowdDockBeats++
            }

            if ((lastTake[x] as number) >= 0) {
              r5Intervals++
              if (t - (lastTake[x] as number) !== lastL[x]) r5Violations++
            }

            lastTake[x] = t
            lastL[x] = useLaw.length(dockEnergy(after.s, x))
          }
        }
      }

      for (let t = 0; t < S.beats; t++) r.backward()

      if (sameGated(r.state(), start) && r.time() === 0) r1Returns++
      else r1 = false
    }

    // the gated run against the old knit: gated beat t equals old beat oldTime(t)
    const againstOld = (box: ArrowBox, useLaw: GateLaw, start: GatedState, beats: number, oldTime: (t: number) => number): { same: boolean; maxEnergy: number } => {
      const g = gatedTake(box, useLaw)
      const r = gatedRunner(g, start)
      const old = twoWay(box, start.s)
      let same = true
      let maxEnergy = 0

      for (let t = 1; t <= beats; t++) {
        r.forward()
        while (old.time() < oldTime(t)) old.forward()
        if (!sameReduced(r.state().s, old.state())) same = false
        for (let x = 0; x < box.cells; x++) maxEnergy = Math.max(maxEnergy, dockEnergy(r.state().s, x))
      }

      return { same, maxEnergy }
    }

    // the covariance of a transform T: run(T s) against T(run s), both rules
    const covariant = (box: ArrowBox, start: GatedState, T: (g: GatedState) => GatedState): { gated: boolean; old: boolean } => {
      const g = gatedTake(box, law)
      const a = gatedRunner(g, start)
      const b = gatedRunner(g, T(start))
      const oa = twoWay(box, start.s)
      const ob = twoWay(box, T(restState(start.s, box.cells)).s)
      let gated = true
      let old = true

      for (let t = 0; t < S.beats; t++) {
        a.forward()
        b.forward()
        oa.forward()
        ob.forward()
        if (!sameGated(T(a.state()), b.state())) gated = false
        if (!sameReduced(T(restState(oa.state(), box.cells)).s, ob.state())) old = false
        r4Beats++
      }

      return { gated, old }
    }

    const memberNotes: string[] = []

    members.forEach((member, k) => {
      const box = withStart(member, () => arrowBox(S.side, 4))
      const vacuum = restState(vacuumState(box), box.cells)
      const ball = ballDocks(box, S.radius, [0, 0, 0])
      const all = new Uint8Array(box.cells).fill(1)
      const outside = Uint8Array.from(ball, v => 1 - v)
      const crowd = crowdStart(box, vacuum, { docks: ball, phase: k, sign: 1, counter: 0 })
      const crowdFlip = crowdStart(box, vacuum, { docks: ball, phase: k, sign: -1, counter: 0 })
      const gas = gasFill(box, vacuum, { perDock: S.gasPerDock, phase: k })
      const crowdGas = gasFill(box, crowd, { perDock: S.gasPerDock, phase: k, only: outside })
      const torus = crowdStart(box, vacuum, { docks: all, phase: k, sign: 1, counter: 0 })
      const scrambled = cloneGated(crowdGas)

      for (let x = 0; x < box.cells; x++) scrambled.counter[x] = Math.floor(law.top * frac((x + 1) * GOLDEN + k * 0.5))

      // R1, R2 (and R5 on the rest-start crowd)
      reversible(box, law, vacuum)
      reversible(box, law, gas)
      reversible(box, law, crowd, { docks: ball })
      reversible(box, law, crowdFlip)
      reversible(box, law, crowdGas)
      reversible(box, law, torus)
      reversible(box, law, scrambled)

      // R3
      for (const start of [vacuum, gas]) {
        const o = againstOld(box, law, start, S.beats, t => t)

        r3Plain = r3Plain && o.same
        r3PlainBeats += S.beats
        r3MaxEnergy = Math.max(r3MaxEnergy, o.maxEnergy)
      }

      {
        const L = law.length(48)
        const o = againstOld(box, law, torus, L * S.torusBlocks, t => Math.floor((t - 1) / L) + 1)

        r3Torus = r3Torus && o.same
        r3TorusBeats += L * S.torusBlocks
      }

      {
        const L = S.constant
        const o = againstOld(box, constantLaw(L), vacuum, S.beats, t => Math.floor((t - 1) / L) + 1)

        r3Constant = r3Constant && o.same
        r3ConstantBeats += S.beats
      }

      // R4: charge conjugation
      {
        const c = covariant(box, crowdGas, conjugate)

        r4Charge = r4Charge && c.gated
        r4ChargeOld = r4ChargeOld && c.old
      }

      // R4: the translation on the identity-link box (a crowd off center in a gas)
      {
        const idBox = withStart(member, () => arrowBox(S.side, 4, 'union', 'lone', true))
        const idVacuum = restState(vacuumState(idBox), idBox.cells)
        const idBall = ballDocks(idBox, S.radius, [1, 2, 3])
        const idCrowd = crowdStart(idBox, idVacuum, { docks: idBall, phase: k, sign: 1, counter: 0 })
        const idStart = gasFill(idBox, idCrowd, { perDock: S.gasPerDock, phase: k, only: Uint8Array.from(idBall, v => 1 - v) })
        const c = covariant(idBox, idStart, g => translate(idBox, g))

        r4Shift = r4Shift && c.gated
        r4ShiftOld = r4ShiftOld && c.old
      }

      // R8: the vacuum's occupancy under the old knit
      {
        const old = twoWay(box, vacuum.s)

        for (let t = 0; t <= 12; t++) {
          if (t > 0) old.forward()

          for (let x = 0; x < box.cells; x++) {
            let filled = 0

            for (let d = 0; d < 24; d++) if (old.state().vibe[x * 24 + d] !== 0) filled++
            r8MaxFilled = Math.max(r8MaxFilled, filled)
            if (filled === 24) r8Full++
            r8DockBeats++
            r8MaxEnergy = Math.max(r8MaxEnergy, dockEnergy(old.state(), x))
          }
        }
      }

      memberNotes.push(`${member.name} ${((Date.now() - started) / 1000).toFixed(0)}s`)
    })

    // R3 at the larger side (the vacuum and the gas, first member)
    {
      const box = withStart(members[0]!, () => arrowBox(S.checkSide, 4))
      const vacuum = restState(vacuumState(box), box.cells)

      for (const start of [vacuum, gasFill(box, vacuum, { perDock: S.gasPerDock, phase: 0 })]) {
        const o = againstOld(box, law, start, 24, t => t)

        r3Plain = r3Plain && o.same
        r3PlainBeats += 24
        r3MaxEnergy = Math.max(r3MaxEnergy, o.maxEnergy)
      }
    }

    // R6: the witnesses (store emptied, first member)
    {
      const box = withStart(members[0]!, () => arrowBox(S.side, 4))
      const empty = restState(vacuumState(box), box.cells)

      empty.s.store.fill(0)

      const g = gatedTake(box, law)
      const x = 100
      const d = 0
      const slot = x * 24 + d
      const y = ((box.kernel.target[slot] as number) / 24) | 0
      // N1
      const takes = new Uint8Array(box.cells).fill(1)

      takes[y] = 0

      const s2 = cloneGated(empty)

      s2.s.vibe[slot] = 1
      s2.s.point[slot] = 3

      const i1 = takeOrKeep(box, g.source, empty.s, takes)
      const i2 = takeOrKeep(box, g.source, s2.s, takes)

      r6N1 = !sameReduced(empty.s, s2.s) && sameReduced(i1, i2)
      r6N1ChargeLost = chargeOf(s2.s) - chargeOf(i2)

      // N2: dock y paused holding one vibe, against dock x active sending it
      const top = 49
      const z = y * 24 + d
      const p = 3
      const p1 = cloneGated(empty)

      p1.s.vibe[z] = 1
      p1.s.point[z] = p

      const p2 = cloneGated(empty)
      const src = g.source[z] as number
      const xs = (src / 24) | 0

      p2.s.vibe[src] = 1
      p2.s.point[src] = (box.inverseMove[src] as Int8Array)[p] as number
      uncollide(box, p2.s, xs, 0)
      p2.counter[xs] = 1
      p2.counter[y] = 48

      const j1 = carryBeat(box, { advance: top, top }, p1, 0)
      const j2 = carryBeat(box, { advance: top, top }, p2, 0)

      r6N2 = !sameGated(p1, p2) && sameGated(j1, j2)
    }

    const r3 = r3Plain && r3Torus && r3Constant && r3MaxEnergy <= S.threshold
    const r4 = r4Charge && r4Shift
    const r5 = r5Violations === 0 && r5Upper === 0 && r5Intervals > 0 && 2 * r5CrowdActive < r5CrowdDockBeats
    const r6 = r6N1 && r6N2 && r6N1ChargeLost !== 0
    const r8 = r8MaxFilled === 24 && r8MaxEnergy <= 24
    const gates = [r1, r2, r3, r4, r5, r6, r7, r8]
    const status = gates.every(Boolean) ? 'pass' : 'fail'
    const metrics: Record<string, number> = {
      gate_R1: r1 ? 1 : 0,
      gate_R2: r2 ? 1 : 0,
      gate_R3: r3 ? 1 : 0,
      gate_R4: r4 ? 1 : 0,
      gate_R5: r5 ? 1 : 0,
      gate_R6: r6 ? 1 : 0,
      gate_R7: r7 ? 1 : 0,
      gate_R8: r8 ? 1 : 0,
      inverseBeatsChecked: r1Beats,
      runsReturned: r1Returns,
      runs: r1Runs,
      oldKnitPlainBeats: r3PlainBeats,
      oldKnitPlainSame: r3Plain ? 1 : 0,
      plainMaxDockEnergy: r3MaxEnergy,
      oldKnitTorusBeats: r3TorusBeats,
      oldKnitTorusSame: r3Torus ? 1 : 0,
      oldKnitConstantBeats: r3ConstantBeats,
      oldKnitConstantSame: r3Constant ? 1 : 0,
      chargeCovariant: r4Charge ? 1 : 0,
      chargeCovariantOld: r4ChargeOld ? 1 : 0,
      shiftCovariant: r4Shift ? 1 : 0,
      shiftCovariantOld: r4ShiftOld ? 1 : 0,
      covarianceBeats: r4Beats,
      takeIntervals: r5Intervals,
      takeIntervalViolations: r5Violations,
      upperCycleVisits: r5Upper,
      crowdActiveDockBeats: r5CrowdActive,
      crowdDockBeats: r5CrowdDockBeats,
      turnedBack: turned,
      witnessN1: r6N1 ? 1 : 0,
      witnessN1ChargeLost: r6N1ChargeLost,
      witnessN2: r6N2 ? 1 : 0,
      vacuumMaxFilledSlots: r8MaxFilled,
      vacuumFullDockBeats: r8Full,
      vacuumDockBeats: r8DockBeats,
      vacuumMaxDockEnergy: r8MaxEnergy,
      counterTop: law.top,
      seconds: (Date.now() - started) / 1000,
    }

    return verdict({
      status,
      claim: `the gated take (L(E) = 1 + max(0, E - ${S.threshold}), counter 0 .. ${law.top - 1}): inverse exact on ${r1Beats} beats over ${r1Runs} runs (${r1Returns} returned); old knit kept on ${r3PlainBeats} vacuum and gas beats (max dock energy ${r3MaxEnergy}), on ${r3TorusBeats} full-torus beats at 1/17 and ${r3ConstantBeats} constant-law beats; charge and 2 e4 covariant ${r4Charge}/${r4Shift} (old ${r4ChargeOld}/${r4ShiftOld}); ${r5Violations} of ${r5Intervals} take intervals off L(E), ${r5Upper} upper-cycle visits, crowd took on ${r5CrowdActive} of ${r5CrowdDockBeats} dock-beats; witnesses N1 ${r6N1} (charge lost ${r6N1ChargeLost}), N2 ${r6N2}; Liouville ${r7}; vacuum max filled ${r8MaxFilled} (${r8Full} of ${r8DockBeats} dock-beats full), max energy ${r8MaxEnergy}`,
      metrics,
      control: {
        oldKnitPlainSame: r3Plain ? 1 : 0,
        chargeCovariantOld: r4ChargeOld ? 1 : 0,
        shiftCovariantOld: r4ShiftOld ? 1 : 0,
      },
      notes: `L2. Gates R1 ${r1}, R2 ${r2}, R3 ${r3}, R4 ${r4}, R5 ${r5}, R6 ${r6}, R7 ${r7}, R8 ${r8}. Side ${S.side} (R3 also at ${S.checkSide}), ${members.length} members, ${S.beats} beats per run. Members: ${memberNotes.join(', ')}.`,
    })
  },
})
