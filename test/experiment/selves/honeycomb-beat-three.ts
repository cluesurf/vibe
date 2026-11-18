// THE LINE SELF AT 4pi/9 ON THE HONEYCOMB AT BEAT 3 (item vibe-roadmap-grounding-0031, grounding decision 008). E-SLF-0189
// swept the frame mixer F-G at strength theta and found no theta that both moves a lone love past sqrt 2 and keeps
// B1's line self 80 beats. Its motion read is honeycomb-exact, so pi/3, 2pi/9 and pi/9 fail exactly, and pi and 8pi/9
// cross L = 1/2 before beat 1, inside Lemma W's exact window. 4pi/9 is the one theta that rests on the model: motion
// passes there, L(2) >= 1/2 is exact, and the crossing (tau 2.03) comes at beat 3, the first beat at which weight the
// mixer sent off the line can come back (note/line-confinement.md section 4). Here beat 3 is read on the whole
// honeycomb.
//
// THE REGION: the exact tube (code/substrate/coxeter/exact-tube), every dock within 3 facet steps of the line l's docks
// at positions -4 to width + 3, the start's 23 docks with 4 more each side.
//
// THE RULE AND THE READ (code/measure/tube-self): B1's line rule as proposal 012 writes it on any state (sign and cost
// on, clock 14, split), G_theta on every lone frame before each beat with u = e^(4 i pi / 9) carried exactly as a
// power, the hop's sign by modeIndex parity (B) or none (A). L(t) = F(t) / F0, B1's bound-trio count of the terms with
// every love on l, grouped by register. A prune that keeps every term that can still be on l after beat 3.
//
// GATES, fixed in the item's what before any probe (gate 8f5abd2e2f4c, 2026-11-18T01:19Z): T0, C1, S0, N0, R0,
// R1, P0 instruments, the main read L(3) under both signs. Verdict: open if an instrument fails or L(3) is within 1e-6
// of 1/2; pass if L(3) < 1/2 under both signs (E-SLF-0189's fail is then honeycomb-exact at every theta); fail if
// L(3) >= 1/2 under both (4pi/9 open, a new item reads later beats); partial if the signs split. Smoke is open by rule.
//
// PREDICTION (before any probe): every gate holds. The line engine's L(3) at 4pi/9 is under 1/2, the weight that comes
// back at beat 3 is small (|dL(3)| < 0.02), the two signs agree within 1e-3, and the verdict is pass.
//
// SETTINGS. Default SMOKE (box 8, W 10; the tube and every read in full, seconds to minutes). BEAT_THREE=full for the
// M3 (box 12, W 12, E-SLF-0189's full start).
//
// Depth L2: the honeycomb runs exact per power in Z[w][1/2] from an exactly written float start; the read is floats.

import { experiment } from '@/test/scaffold/suite'
import { verdict } from '@/test/scaffold/verdict'
import { lineBasis, lineLightest, wholeBasis } from '@/code/measure/coined-line-bloch'
import { fitRing, levelPlacement } from '@/code/measure/held-cluster'
import type { Placed } from '@/code/measure/held-cluster'
import { lineReader, type LineReader } from '@/code/measure/cold-line'
import { coneBoundCount, coneStart, type ConeStore } from '@/code/measure/cone-line'
import {
  lineEngineL,
  loneLove,
  newStepTally,
  onLPart,
  onLWeight,
  powerDiffer,
  termCount,
  thetaBlock,
  tubeOf,
  tubeRead,
  tubeStart,
  tubeStep,
  type HopSign,
  type Stage,
  type StepTally,
  type Tube,
  type TubePart,
  type TubeRead,
} from '@/code/measure/tube-self'
import { currentCoinPlace, setCoinPlace } from '@/code/rule/coined-locked-knit'

const RECORDED = { energy: 0.33001851839229945 }
const BEATS = 3
const U: [number, number] = [Math.cos((4 * Math.PI) / 9), Math.sin((4 * Math.PI) / 9)]
const SIGNS: readonly HopSign[] = ['parity', 'none']
const STAGES: readonly Stage[] = ['free', 'return', 'land']

const FLOOR = 1e-20
const DROP_BAR = 1e-14
const S0_TOL = 1e-12
const NORM_TOL = 1e-10
const MATCH_TOL = 1e-10
const OFF_TOL = 1e-12
const BARE_L = [0.9167, 0.9589]
const REPRO_TOL = 5e-4
const HALF = 0.5
const MARGIN = 1e-6
const RADIUS = 3
const SEGMENT_PAD = 4

type Setting = { name: 'smoke' | 'full'; box: number; levelBar: number; W: number; lineBeats: number; cap: number }

const SMOKE: Setting = { name: 'smoke', box: 8, levelBar: 1e-4, W: 10, lineBeats: 24, cap: 2e6 }
const FULL: Setting = { name: 'full', box: 12, levelBar: 1e-9, W: 12, lineBeats: 256, cap: 1.5e8 }

type Arm = { name: string; reads: TubeRead[]; L: number[]; terms: number[]; seconds: number; tally: StepTally }

function runArm(
  name: string,
  tube: Tube,
  parts0: readonly TubePart[],
  mix: HopSign | null,
  prune: boolean,
  F0: number,
  offset: number,
  line: number,
  rd: LineReader,
  log: (what: string) => void,
): Arm {
  const started = Date.now()
  const tally = newStepTally()
  const read0 = tubeRead(tube, parts0, U, offset, line, rd, true)
  const reads = [read0]
  const terms = [parts0.reduce((n, p) => n + termCount(p.state), 0)]

  let parts = parts0

  for (let t = 1; t <= BEATS; t++) {
    parts = parts.map(p => ({ state: tubeStep(tube, p.state, t - 1, { mix, stage: STAGES[t - 1]!, prune }, tally), unit: p.unit }))

    const r = tubeRead(tube, parts, U, offset, line, rd, t === 1 || !prune)

    reads.push(r)
    terms.push(parts.reduce((n, p) => n + termCount(p.state), 0))
    log(`${name} beat ${t}: L ${(r.F / F0).toFixed(6)}, terms ${terms[t]}, on-l ${r.onL.toFixed(6)}, norm ${r.norm.toFixed(12)}, K ${tally.kFired}, frontier ${tally.frontier}`)
  }

  return { name, reads, L: reads.map(r => r.F / F0), terms, seconds: (Date.now() - started) / 1000, tally }
}

type PruneCheck = { slot: number; sign: HopSign; differ: number[]; onL3: number; frontier: number }

function pruneCheck(tube: Tube, slot: number, sign: HopSign): PruneCheck {
  const tally = newStepTally()
  const differ: number[] = []

  let a = loneLove(slot)
  let b = loneLove(slot)

  for (let t = 1; t <= BEATS; t++) {
    a = tubeStep(tube, a, t - 1, { mix: sign, stage: STAGES[t - 1]!, prune: true }, tally)
    b = tubeStep(tube, b, t - 1, { mix: sign, stage: STAGES[t - 1]!, prune: false }, tally)
    differ.push(powerDiffer(onLPart(tube, a), onLPart(tube, b)))
  }

  return { slot, sign, differ, onL3: onLWeight(tube, [{ state: a, unit: [1, 0] }], U), frontier: tally.frontier }
}

export default experiment({
  id: 'selves/honeycomb-beat-three',
  code: 'E-SLF-0198',
  title:
    "the line self at 4pi/9 on the honeycomb at beat 3: B1's line self under the frame mixer at strength 4pi/9, the one theta of E-SLF-0189 whose verdict rested on the line-restricted engine, run on the exact {3,4,3,4} tube around its 23 docks with proposal 012's sign and cost, exact per power of u, so weight the mixer sends off the line can come back, and read for L(3) against 1/2",
  category: 'selves',
  substrates: ['3434'],
  depth: 'L2',
  paper: false,
  run() {
    const started = Date.now()
    const setting = process.env.BEAT_THREE === 'full' ? FULL : SMOKE
    const log = (what: string): void => console.error(`${what} ${Math.round((Date.now() - started) / 1000)}s`)
    const place0 = currentCoinPlace()

    setCoinPlace('split')

    try {
      // ---- the level, C1 ----
      const basis = lineBasis({ flavors: [0, 0, 0], statistics: 'fermion', D: 3, box: setting.box, unit: 0 })
      const level = lineLightest(basis, wholeBasis(basis)).lightest
      const placed = levelPlacement(basis, level.cre, level.cim)
      const levelOff = Math.abs(level.unwrapped - RECORDED.energy)
      const gC1 = levelOff <= setting.levelBar
      const { W } = setting
      const read = Math.floor((W - 1) / 2)
      const kept = fitRing(placed, W).kept
      const width = W + Math.max(...kept.flatMap((p: Placed) => p.ts.map(t => t[0])))
      const line = Math.max(256, width + 2 * setting.lineBeats + 2)
      const offset = setting.lineBeats + 1
      const rd = lineReader(placed, line, read, false)
      const first = (): ConeStore =>
        coneStart({ n: 3, line, cap: setting.cap, W, placed: kept, bath: [], offset }).store
      const F0 = coneBoundCount(first(), rd)

      log(`C1 level off ${levelOff.toExponential(1)}, width ${width}`)

      // ---- T0, the tube ----
      const tube = tubeOf({ from: -SEGMENT_PAD, to: width - 1 + SEGMENT_PAD, radius: RADIUS })
      const seeds = width + 2 * SEGMENT_PAD
      const tubeGates = tube.exact.gates
      const gTube = Object.values(tubeGates).every(Boolean) && tube.dockAt.size === seeds

      log(`T0 tube ${tube.cells} docks, shells ${tube.exact.shells.join(' ')}, seeds ${tube.dockAt.size} of ${seeds}`)

      // ---- S0, the start ----
      const start = tubeStart(tube, first(), offset, FLOOR)
      const parts0: TubePart[] = [
        { state: start.re, unit: [1, 0] },
        ...(start.im ? [{ state: start.im, unit: [0, 1] as const }] : []),
      ]
      const read0 = tubeRead(tube, parts0, U, offset, line, rd, true)
      const gS0 = Math.abs(read0.F / F0 - 1) <= S0_TOL && start.dropped <= DROP_BAR

      log(`S0 F(0)/F0 ${read0.F / F0}, kept ${start.kept} of ${start.configs}, dropped ${start.dropped.toExponential(2)}`)

      // ---- the line engine (E-SLF-0189's lineRun) ----
      const lineBare = lineEngineL(first, null, BEATS, rd)
      const lineTheta = lineEngineL(first, thetaBlock(U), BEATS, rd)

      log(`line bare ${lineBare.map(x => x.toFixed(6)).join(' ')}, 4pi/9 ${lineTheta.map(x => x.toFixed(6)).join(' ')}`)

      // ---- R0, the bare control ----
      const bare = runArm('bare', tube, parts0, null, false, F0, offset, line, rd, log)
      const bareOff = bare.reads.map(r => Math.abs(r.norm - r.onL))
      const gR0 =
        bare.L.every((x, t) => t === 0 || Math.abs(x - lineBare[t]!) <= MATCH_TOL) &&
        bareOff.every(x => x <= OFF_TOL) &&
        (setting.name !== 'full' || BARE_L.every((x, i) => Math.abs(bare.L[i + 1]! - x) <= REPRO_TOL))

      // ---- P0, the prune ----
      const checks: PruneCheck[] = []

      for (const sign of SIGNS) {
        for (let d = 0; d < 24; d++) {
          checks.push(pruneCheck(tube, tube.dockAt.get(0)! * 24 + d, sign))
        }
      }

      const gP0 = checks.every(c => c.differ.every(x => x === 0))

      log(`P0 differing ${checks.reduce((n, c) => n + c.differ.reduce((s, x) => s + x, 0), 0)} over ${checks.length} lone loves`)

      // ---- the main arms, N0, R1 ----
      const arms = SIGNS.map(sign => runArm(`4pi/9 ${sign}`, tube, parts0, sign, true, F0, offset, line, rd, log))
      const gN0 = arms.every(a => [0, 1].every(t => Math.abs(a.reads[t]!.norm - 1) <= NORM_TOL))
      const gR1 = arms.every(a => [1, 2].every(t => Math.abs(a.L[t]! - lineTheta[t]!) <= MATCH_TOL))
      const frontier = bare.tally.frontier + arms.reduce((n, a) => n + a.tally.frontier, 0) + checks.reduce((n, c) => n + c.frontier, 0)
      const gT0 = gTube && frontier === 0

      // ---- verdict ----
      const gates = { T0: gT0, C1: gC1, S0: gS0, N0: gN0, R0: gR0, R1: gR1, P0: gP0 }
      const instrument = Object.values(gates).every(Boolean)
      const L3 = arms.map(a => a.L[BEATS]!)
      const close = L3.some(x => Math.abs(x - HALF) <= MARGIN)
      const below = L3.filter(x => x < HALF).length
      const status: 'pass' | 'fail' | 'partial' | 'open' =
        setting.name === 'smoke' || !instrument || close
          ? 'open'
          : below === L3.length
            ? 'pass'
            : below === 0
              ? 'fail'
              : 'partial'

      const f6 = (x: number): string => (Number.isFinite(x) ? x.toFixed(6) : String(x))
      const e2 = (x: number): string => (Number.isFinite(x) ? x.toExponential(2) : String(x))
      const armRow = (a: Arm): string =>
        `${a.name}: L ${a.L.map(f6).join(' ')} (line ${lineTheta.map(f6).join(' ')}, dL(3) ${e2(a.L[BEATS]! - lineTheta[BEATS]!)}), on-l ${a.reads.map(r => f6(r.onL)).join(' ')}, deviant ${a.reads.map(r => e2(r.deviant)).join(' ')}, terms ${a.terms.join(' ')}, K ${a.tally.kFired}, mixed ${a.tally.mixed}, generated ${a.tally.generated}, pruned choices ${a.tally.droppedChoices} terms ${a.tally.droppedTerms}, ${a.seconds.toFixed(0)} s`

      const metrics: Record<string, number> = {
        levelOff,
        F0,
        tubeDocks: tube.cells,
        startKept: start.kept,
        startConfigs: start.configs,
        startDropped: start.dropped,
        s0: read0.F / F0,
        frontier,
        lineBareL1: lineBare[1]!,
        lineBareL2: lineBare[2]!,
        lineBareL3: lineBare[3]!,
        lineThetaL1: lineTheta[1]!,
        lineThetaL2: lineTheta[2]!,
        lineThetaL3: lineTheta[3]!,
        bareL1: bare.L[1]!,
        bareL2: bare.L[2]!,
        bareL3: bare.L[3]!,
        bareOffMax: Math.max(...bareOff),
        pruneDiffering: checks.reduce((n, c) => n + c.differ.reduce((s, x) => s + x, 0), 0),
        seconds: (Date.now() - started) / 1000,
      }

      for (const [k, v] of Object.entries(gates)) {
        metrics[`gate_${k}`] = v ? 1 : 0
      }

      arms.forEach((a, i) => {
        const p = SIGNS[i]!

        a.L.forEach((x, t) => (metrics[`${p}_L${t}`] = x))
        metrics[`${p}_dL3`] = a.L[BEATS]! - lineTheta[BEATS]!
        metrics[`${p}_norm1`] = a.reads[1]!.norm
        metrics[`${p}_deviant3`] = a.reads[BEATS]!.deviant
        metrics[`${p}_terms2`] = a.terms[2]!
        metrics[`${p}_seconds`] = a.seconds
      })

      return verdict({
        status,
        claim: `${setting.name} setting, box ${setting.box} W ${W}, theta 4pi/9 on the exact tube (${tube.cells} docks, radius ${RADIUS} around line positions ${-SEGMENT_PAD}..${width - 1 + SEGMENT_PAD}): ${arms.map(armRow).join(' || ')} || bare: L ${bare.L.map(f6).join(' ')} against the line engine ${lineBare.map(f6).join(' ')}, off-l ${e2(Math.max(...bareOff))}`,
        metrics,
        notes: `L2. Setting ${setting.name}${setting.name === 'smoke' ? ' (proves the file runs; not evidence, status open by rule)' : ''}. T0 ${gT0} (tube gates ${JSON.stringify(tubeGates)}, seeds ${tube.dockAt.size} of ${seeds}, frontier ${frontier}). C1 ${gC1} (level off ${e2(levelOff)}). S0 ${gS0} (F(0)/F0 ${read0.F / F0}, start ${start.kept} of ${start.configs} configurations kept, dropped ${e2(start.dropped)}). N0 ${gN0} (norm at beats 0 and 1: ${arms.map(a => `${a.name} ${a.reads[0]!.norm.toFixed(12)} ${a.reads[1]!.norm.toFixed(12)}`).join(', ')}). R0 ${gR0}. R1 ${gR1} (L(1), L(2) against the line engine: ${arms.map(a => `${a.name} ${e2(a.L[1]! - lineTheta[1]!)} ${e2(a.L[2]! - lineTheta[2]!)}`).join(', ')}). P0 ${gP0} (${checks.length} lone loves, 24 slots of dock 0 under both signs, on-l weight at beat 3 ${e2(Math.min(...checks.map(c => c.onL3)))} to ${e2(Math.max(...checks.map(c => c.onL3)))}). Scope: B1's line rule written on the honeycomb by proposal 012's opt-in sign and cost; beats 1 to 3 only.`,
      })
    } finally {
      setCoinPlace(place0)
    }
  },
})
