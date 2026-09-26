// The frame change of four batteries' quantum items, fixed to carry the comoving own points, compared with the old
// frame change at four deterministic frames (E-RLT-0088).
//
// THE BUG (E-RLT-0085). Under the adopted comoving fear beat a meeting's kernel is read about the two vibes' own role
// points, so a change of frame must carry each coordinate's own point with its weights (carryCoordinate). The quantum
// items of code/measure/candidate-battery (E-RLT-0070), living-pair-battery (E-RLT-0075), sparse-living-battery
// (E-RLT-0079) and varying-living-battery (E-RLT-0082) moved the weights only (moveCoordinate), which is an operation
// on the state (a kick), not a frame change; E-RLT-0085 found E-RLT-0082's frameCommutesMatter failure (3,670
// mismatches) becomes 0 with the own points carried. THE FIX: those four files now take `carryOwnPoints` (default
// true, the fix) and `frameSalt` (the frame field's Weyl offset, default 11, the old frame) on quantum; nothing else in
// them changed.
//
// THIS FILE runs each battery's quantum items (fear beat on, each battery's own vacuum and side) with the old frame
// change and the fixed one at four frames (salts 11, 23, 37, 53, Weyl fields (x + salt) GOLDEN 5.9 mod 1 over the
// frame group), per E-MTH-0027's rule that a single-start verdict is start-sensitive. The link start of the weave is
// E-MTH-0028's to vary (code/rule/vibe-weave.ts, not touched here); the frame is the start the frame gates read.
//
// Gates, fixed before the first run:
//  F1 the fix touches only the frame change: at every frame, every quantum gate other than frameCommutesVacuum and
//     frameCommutesMatter, and every metric outside the frame readings, is identical between the old and the fixed
//     frame change, on all four batteries
//  F2 with the own points carried, frameCommutesVacuum (where the battery has a vacuum pair) and frameCommutesMatter
//     hold at every frame on all four batteries
//  F3 the swap-phase control keeps its teeth: with the own points carried it reads more than 0 mismatches at every
//     frame on all four batteries
// Verdict: pass if F1, F2, F3 hold; fail if F1 holds and F2 does not; partial otherwise (F1 or only F3 failing).
//
// PREDICTED before running: F1 and F2 hold (E-RLT-0085's probe on the hub); F3 is NOT predicted to hold: E-RLT-0085
// found the control reads 0 on the hub's vacuum pair once the own points are carried.
//
// The four experiment files themselves are rerun one at a time after the fix (tmp/sym-after-*.log against
// tmp/sym-before-*.log) and their moved gates reported in this file's registry note, not here.
//
// FIRST RUN (25 s): partial (F3), recorded as is, no gate moved; title written after the run. F1 and F2 hold on 32
// runs. NO frame gate moves at any of the four frames: under the current code (E-MTH-0027's integer link start) the
// old frame change already reads 0 matter and vacuum mismatches on all four batteries, so E-RLT-0082's 3,670 was
// specific to the golden start it ran on. What the fix moves is the swap-phase control, at one frame only: 465 -> 0 at
// frame 11 on E-RLT-0075, 0079 and 0082; at frames 23 and 37 it reads 1,767 under both; at frame 53 it reads 0 under
// both; on E-RLT-0070 it reads 0 everywhere (its matter pair does not meet within the frame run). So the control is
// frame-start-sensitive, not fix-sensitive. The four experiment files rerun one at a time after the fix: E-RLT-0075,
// 0079 and 0082 go fail -> partial (their X1 control gate fails, controlsHold 1 -> 0 through that one control),
// E-RLT-0070 stays partial; no other metric moves.
//
// Depth L1 (an instrument correction). DETERMINISM: each battery's golden fills and Weyl frames, no draw.

import { experiment } from '@/test/scaffold/suite'
import { verdict } from '@/test/scaffold/verdict'
import { rootsD4 } from '@/code/algebra/group/root-system'
import { LINE_FIRSTS } from '@/code/rule/isometric-knit'
import { groupTable } from '@/code/measure/color-isotropy-bound'
import { coinData, orientedHubStore } from '@/code/measure/varying-vacuum'
import { d4BoxCoordinates, d4Coordinates } from '@/code/substrate/d4-box'
import { ONE_LINE } from '@/code/measure/sparse-living-vacuum'
import { quantum as candidateQuantum } from '@/code/measure/candidate-battery'
import { quantum as livingQuantum } from '@/code/measure/living-pair-battery'
import { quantum as sparseQuantum } from '@/code/measure/sparse-living-battery'
import { EVEN_SIDES, quantum as varyingQuantum, type QuantumRun, type VaryingVacuum } from '@/code/measure/varying-living-battery'

const SALTS = [11, 23, 37, 53]
const FRAME_GATES = ['frameCommutesVacuum', 'frameCommutesMatter']
const FRAME_METRICS = ['frameMismatchVacuum', 'frameMismatchMatter', 'frameMismatchSwapControl', 'controlsHold']

export default experiment({
  id: 'relativity/frame-carry-batteries',
  code: 'E-RLT-0088',
  title:
    "the frame change of four batteries fixed to carry the comoving own points, partial (the swap-phase control): at four frames the fixed and old frame changes agree on every gate and every non-frame metric (32 runs), and every frame gate holds under both (0 matter and vacuum mismatches, so E-RLT-0082's 3,670 was specific to its golden start); the fix moves only the control, 465 -> 0 at the battery's own frame on E-RLT-0075, 0079 and 0082, while at the other frames it reads 1,767 (twice) or 0 under both: the control is start-sensitive, and the three experiments go fail -> partial on their control gate alone",
  category: 'relativity',
  substrates: ['3434'],
  depth: 'L1',
  paper: false,
  run() {
    const started = Date.now()
    const log = (what: string): void => console.error(`${what} ${Math.round((Date.now() - started) / 1000)}s`)
    const coins = coinData(groupTable())
    const r0 = d4Coordinates(rootsD4()[LINE_FIRSTS[0] as number] as number[])
    const hubFor = (side: number, anchor: number): number[] => d4BoxCoordinates({ cell: anchor, side }).map((v, k) => v - (r0[k] as number))
    const HUB: VaryingVacuum = { key: 'hub', store: (side, anchor) => orientedHubStore(coins, side, hubFor(side, anchor)) }
    const batteries: { code: string; run: (carry: boolean, salt: number) => QuantumRun }[] = [
      { code: 'E-RLT-0070', run: (carry, salt) => candidateQuantum(1, 'on', carry, salt) },
      { code: 'E-RLT-0075', run: (carry, salt) => livingQuantum(1, 'on', 'alternate', carry, salt) },
      { code: 'E-RLT-0079', run: (carry, salt) => sparseQuantum(ONE_LINE, 'on', 'alternate', carry, salt) },
      { code: 'E-RLT-0082', run: (carry, salt) => varyingQuantum(HUB, 'on', EVEN_SIDES.q, carry, salt) },
    ]
    const rows: string[] = []
    const metrics: Record<string, number> = {}
    let f1 = true
    let f2 = true
    let f3 = true
    const moved = new Set<string>()

    for (const b of batteries) {
      for (const salt of SALTS) {
        const old = b.run(false, salt)
        const fixed = b.run(true, salt)
        const gates = Object.keys(fixed.gates)
        const changedOther = gates.filter(g => !FRAME_GATES.includes(g) && old.gates[g] !== fixed.gates[g])
        const changedMetrics = Object.keys(fixed.metrics).filter(m => !FRAME_METRICS.includes(m) && old.metrics[m] !== fixed.metrics[m] && !(Number.isNaN(old.metrics[m]) && Number.isNaN(fixed.metrics[m])))
        const hasVacuum = (fixed.metrics.hasVacuumPair ?? 1) === 1 && (fixed.metrics.frameMismatchVacuum ?? 0) >= 0
        const frameOk = (fixed.metrics.frameMismatchMatter ?? 1) === 0 && (!hasVacuum || (fixed.metrics.frameMismatchVacuum ?? 1) === 0)
        const control = fixed.metrics.frameMismatchSwapControl ?? 0

        f1 = f1 && changedOther.length === 0 && changedMetrics.length === 0
        f2 = f2 && frameOk
        f3 = f3 && control > 0

        for (const g of gates) if (old.gates[g] !== fixed.gates[g]) moved.add(`${b.code} ${g} ${old.gates[g] ? 'pass' : 'fail'} -> ${fixed.gates[g] ? 'pass' : 'fail'} (frame ${salt})`)

        const key = `${b.code.slice(-4)}_s${salt}`

        metrics[`${key}_oldMatter`] = old.metrics.frameMismatchMatter ?? -1
        metrics[`${key}_fixedMatter`] = fixed.metrics.frameMismatchMatter ?? -1
        metrics[`${key}_oldVacuum`] = old.metrics.frameMismatchVacuum ?? -1
        metrics[`${key}_fixedVacuum`] = fixed.metrics.frameMismatchVacuum ?? -1
        metrics[`${key}_oldControl`] = old.metrics.frameMismatchSwapControl ?? -1
        metrics[`${key}_fixedControl`] = control
        metrics[`${key}_oldGatesFailing`] = gates.filter(g => !old.gates[g]).length
        metrics[`${key}_fixedGatesFailing`] = gates.filter(g => !fixed.gates[g]).length
        rows.push(
          `${b.code} frame ${salt}: matter ${old.metrics.frameMismatchMatter} -> ${fixed.metrics.frameMismatchMatter}, vacuum ${old.metrics.frameMismatchVacuum} -> ${fixed.metrics.frameMismatchVacuum}, swap control ${old.metrics.frameMismatchSwapControl} -> ${control}, failing old [${gates.filter(g => !old.gates[g]).join(', ')}] fixed [${gates.filter(g => !fixed.gates[g]).join(', ')}], other gates changed ${changedOther.length}, other metrics changed ${changedMetrics.length}${changedMetrics.length > 0 ? ` (${changedMetrics.join(', ')})` : ''}`,
        )
        log(`${b.code} frame ${salt}`)
      }
    }

    const status = f1 && f2 && f3 ? 'pass' : f1 && !f2 ? 'fail' : 'partial'

    return verdict({
      status,
      claim: `with the comoving own points carried by the frame change, the four batteries' frame gates ${f2 ? 'hold at all four frames' : 'do not all hold'}; moved gates: ${moved.size > 0 ? [...moved].join('; ') : 'none'}; the swap-phase control ${f3 ? 'keeps' : 'loses'} its teeth on at least one battery and frame`,
      metrics: { gateF1: f1 ? 1 : 0, gateF2: f2 ? 1 : 0, gateF3: f3 ? 1 : 0, movedGates: moved.size, ...metrics, seconds: (Date.now() - started) / 1000 },
      notes: `L1. Gates: F1 ${f1}, F2 ${f2}, F3 ${f3}. ${rows.join(' | ')}. ${((Date.now() - started) / 1000).toFixed(0)} s.`,
    })
  },
})
