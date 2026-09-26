// E-MTH-0028: verdicts over a family of link starts, and the paired adoption comparison.
//
// E-MTH-0027 replaced the vibe weave's golden link start with an integer Weyl start and moved 8 statuses among the
// 59 experiments that build a weave, among them the two batteries the user's adoptions rest on: E-FRC-0159 (the
// fear beat, "if it works with everything") and E-SPN-0063 (the comoving beat), both pass -> fail. Each studies one
// token pair, found by a search, on one side-3 box with one start. A deterministic model must not have verdicts that
// depend on an arbitrary choice of start, so this experiment reads them over a FAMILY of starts
// (code/measure/start-ensemble): "integer+k", the committed integer Weyl sequence with its phase moved by
// k * 27145 mod 2^16 (the silver rate), k = 0 .. 15, and "golden", the retired start rebuilt in exact integers.
// Each existing experiment runs UNEDITED, with the member as every weave's default start (code/rule/vibe-weave
// useLinkStart, the committed start restored after each run).
//
// In process here: the six light flippers, E-QTM-0109, E-QTM-0100, E-QTM-0105, E-QTM-0140, E-RLT-0055 and
// E-SPN-0063, over all 17 members. E-FRC-0159 (450 s a run) and E-RLT-0056 (470 s, whose start-dependent part is
// only its G7, E-RLT-0055's gates on its knit) run over 9 members (integer+0 .. 7, golden) by the same harness in
// separate processes (tmp/run-mth28.sh batch) and are reported in the notes, not gated here.
//
// THE PAIRED COMPARISON is the adoption criterion. E-SPN-0063 runs three columns on the same member: the fear beat
// off, the fixed-frame fear beat (the model's beat before 2026-09-26) and the comoving beat (adopted). The fear
// beat adoption asks whether the comoving column fails a quantum gate the off column passes; the comoving
// adoption asks whether it fails a gate the fixed-frame column passes. A control that reads nothing on both sides
// of a pair (the swap phase at love-fear meetings breaking the frame change, frameMismatchSwapAtLoveFear) makes
// that member's frame gates uninformative: reported, never counted as the change's failure.
//
// Gates, fixed before the first run:
// G1 the planted control, through the same harness: (a) a start-blind planted experiment passes on 17 of 17 and
//    reads one value per metric; (b) a planted start-sensitive experiment (pass exactly when the side-3 weave's
//    first link holds an even move) passes on exactly the members whose start puts an even move there, counted
//    directly from the family, and that count is strictly between 0 and 17; (c) a planted pair (the adopted
//    column fails exactly where the first link's move is 0 mod 3, the base always passes, and a planted control
//    reads 0 on both sides where the second link's move is even) is caught on exactly those members, with the
//    uninformative members flagged exactly; (d) after every run the default start is the committed one again
// G2 reproduction: integer+0 and golden give the statuses E-MTH-0027 recorded for the six light flippers
//    (E-QTM-0109 fail / pass, E-QTM-0100 pass / fail, E-QTM-0105 pass / fail, E-QTM-0140 fail / partial,
//    E-RLT-0055 fail / pass, E-SPN-0063 fail / pass, integer / golden)
// G3 the family: the exact golden start equals the float formula it replaced on every slot of the side 3, 5, 7,
//    9 and 11 boxes; integer+0 is the committed start on all 65,536 residues; on the side-3 weave the 17 members'
//    link tables are pairwise different and every link is inverse to its reverse link
// G4 the adoptions, paired: on every one of the 17 members and on H, HF and HFL, the comoving column fails no
//    quantum gate that the fear-off column passes (the fear beat) and none that the fixed-frame column passes (the
//    comoving beat); and the frame control is informative (above 0 in both paired columns) on at least 9 members
// Status: pass if G1 to G4 hold; partial if G1 to G3 hold and G4 does not (the method works, the adoption is not
// robust or not testable); fail otherwise.
// Predicted: G1 to G3 pass. G4 pass: the comoving kernels are Clifford conjugates of the fixed-frame ones and the
// fear-off column cannot pass the fear gates, so no member should add a failure; E-MTH-0027's flips were the
// controls reading 0, not the change.
// Reported, not gated: per flipper the fraction of members passing each status and 0/1 gate, the distribution of
// the key metrics, and E-QTM-0140's reading-beat CHSH rung per member (swap: 2, 4 / sqrt 3, sqrt 7; color: 2,
// (8 + 2 sqrt 21 + 2 sqrt 35 - 2 sqrt 15) / 9, (2 + 4 sqrt 2) / 3).
//
// Depth L1: a method gate on the measurement, with a planted control. No physics is claimed from it.

import { experiment, type Experiment } from '@/test/scaffold/suite'
import { verdict, type Verdict } from '@/test/scaffold/verdict'
import { linkStart, makeVibeWeave } from '@/code/rule/vibe-weave'
import {
  addedFailures,
  distribution,
  goldenLinkStart,
  goldenLinkStartFloat,
  passFractions,
  readKey,
  startFamily,
  withStart,
  type MemberRun,
  type StartMember,
} from '@/code/measure/start-ensemble'
import fearTurnWeave from '@/test/experiment/quantum/fear-turn-weave'
import fearWitness from '@/test/experiment/quantum/fear-witness'
import calmIsTheOneWhole from '@/test/experiment/quantum/calm-is-the-one-whole'
import bellValuesExact from '@/test/experiment/quantum/bell-values-exact'
import coldQuaternionFearBeat from '@/test/experiment/relativity/cold-quaternion-fear-beat'
import comovingBattery from '@/test/experiment/spin/comoving-battery'

const OFFSETS = 16
const CONFIGS = ['H', 'HF', 'HFL'] as const
const INFORMATIVE_NEEDED = 9

// E-MTH-0027's recorded statuses (tmp/exact-compare.md), integer then golden
const RECORDED: Record<string, readonly [string, string]> = {
  'E-QTM-0109': ['fail', 'pass'],
  'E-QTM-0100': ['pass', 'fail'],
  'E-QTM-0105': ['pass', 'fail'],
  'E-QTM-0140': ['fail', 'partial'],
  'E-RLT-0055': ['fail', 'pass'],
  'E-SPN-0063': ['fail', 'pass'],
}

const FLIPPERS: readonly Experiment[] = [fearTurnWeave, fearWitness, calmIsTheOneWhole, bellValuesExact, coldQuaternionFearBeat, comovingBattery]

function runMember(member: StartMember, run: () => Verdict): MemberRun {
  const result = withStart(member, run)

  return { member: member.name, status: result.status, metrics: result.metrics, control: result.control ?? {} }
}

// the default start is the committed one: a default weave equals one built with the committed start named
function committedRestored(): boolean {
  const def = makeVibeWeave({ side: 3 }).links
  const named = makeVibeWeave({ side: 3, start: (slot, count) => linkStart(slot, count) }).links

  return def.every((g, i) => g === named[i])
}

// the rung of a reading-beat CHSH value on E-QTM-0140's ladder
function rung(value: number | undefined, middle: number, top: number): string {
  if (value === undefined) {
    return 'missing'
  }

  if (Math.abs(value - 2) < 1e-9) {
    return 'two'
  }

  if (value < 2) {
    return 'below2'
  }

  if (Math.abs(value - middle) < 1e-6) {
    return 'middle'
  }

  if (Math.abs(value - top) < 1e-6) {
    return 'top'
  }

  return 'other'
}

const SWAP_MIDDLE = 4 / Math.sqrt(3)
const SWAP_TOP = Math.sqrt(7)
const COLOR_MIDDLE = (8 + 2 * Math.sqrt(21) + 2 * Math.sqrt(35) - 2 * Math.sqrt(15)) / 9
const COLOR_TOP = (2 + 4 * Math.sqrt(2)) / 3

const count = (xs: readonly string[], x: string): number => xs.filter(y => y === x).length

export default experiment({
  id: 'method/multi-start-robustness',
  code: 'E-MTH-0028',
  title:
    'verdicts over a family of link starts: the eight experiments the integer start flipped, rerun unedited over 17 deterministic starts (16 phases of the integer Weyl start and the retired golden start, rebuilt exactly), with per-gate pass fractions, the paired comparison of each adopted rule against its base on the same start, and a planted control',
  category: 'method',
  substrates: ['3434'],
  depth: 'L1',
  paper: false,
  run() {
    const started = Date.now()
    const log = (what: string): void => console.error(`${what} ${Math.round((Date.now() - started) / 1000)}s`)
    const family = startFamily(OFFSETS)

    // G3: the family
    let goldenChecks = 0
    let goldenMismatches = 0

    for (const side of [3, 5, 7, 9, 11]) {
      for (let i = 0; i < side ** 4 * 24; i++) {
        goldenChecks += 1
        goldenMismatches += goldenLinkStart(i, 216) === goldenLinkStartFloat(i, 216) ? 0 : 1
      }
    }

    let zeroMismatches = 0

    for (let i = 0; i < 65536; i++) {
      zeroMismatches += linkStart(i, 216, 0) === linkStart(i, 216) ? 0 : 1
    }

    const tables = family.map(m => makeVibeWeave({ side: 3, start: m.start }))
    let identicalPairs = 0
    let inverseFailures = 0

    for (let a = 0; a < tables.length; a++) {
      for (let b = a + 1; b < tables.length; b++) {
        identicalPairs += tables[a]?.links.every((g, i) => g === tables[b]?.links[i]) ? 1 : 0
      }

      const w = tables[a]

      if (w) {
        for (let x = 0; x < w.mesh.cellCount; x++) {
          for (let d = 0; d < 24; d++) {
            const back = w.links[w.mesh.neighbour(x, d) * 24 + (w.opposite[d] ?? d)] ?? -1

            inverseFailures += w.moves.compose(w.links[x * 24 + d] ?? -1, back) === w.moves.identity ? 0 : 1
          }
        }
      }
    }

    const g3 = goldenMismatches === 0 && zeroMismatches === 0 && identicalPairs === 0 && inverseFailures === 0

    // G1: the planted control
    const firstMove = (m: StartMember): number => m.start(0, 216)
    const secondMove = (m: StartMember): number => m.start(1, 216)
    const blind = family.map(m => runMember(m, () => verdict({ status: 'pass', claim: '', metrics: { gate_blind: 1, value: 7 } })))
    const blindFractions = passFractions(blind)
    const blindOk = blindFractions.every(f => f.pass === f.of && f.of === family.length) && distribution(blind.map(r => r.metrics['value'] ?? 0)).distinct === 1
    const sensitive = family.map(m =>
      runMember(m, () => {
        const even = (makeVibeWeave({ side: 3 }).links[0] ?? 1) % 2 === 0

        return verdict({ status: even ? 'pass' : 'fail', claim: '', metrics: { gate_even: even ? 1 : 0 } })
      }),
    )
    const expectedEven = family.filter(m => firstMove(m) % 2 === 0).map(m => m.name)
    const sensitivePass = sensitive.filter(r => r.status === 'pass').map(r => r.member)
    const sensitiveOk =
      sensitivePass.join(',') === expectedEven.join(',') && expectedEven.length > 0 && expectedEven.length < family.length && passFractions(sensitive)[1]?.pass === expectedEven.length
    const planted = family.map(m =>
      runMember(m, () => {
        const links = makeVibeWeave({ side: 3 }).links
        const adoptedFails = (links[0] ?? 1) % 3 === 0
        const controlReads = (links[1] ?? 0) % 2 === 0 ? 0 : 5

        return verdict({
          status: 'pass',
          claim: '',
          metrics: { new_gate_a: adoptedFails ? 0 : 1, new_gate_b: 1, new_control: controlReads },
          control: { old_gate_a: 1, old_gate_b: 1, old_control: controlReads },
        })
      }),
    )
    const expectedCaught = family.filter(m => firstMove(m) % 3 === 0).map(m => m.name)
    const caught = planted.filter(r => addedFailures(r, 'new_gate_', 'old_gate_').added.includes('a')).map(r => r.member)
    const wrongCaught = planted.filter(r => addedFailures(r, 'new_gate_', 'old_gate_').added.some(g => g !== 'a')).length
    const expectedUninformative = family.filter(m => secondMove(m) % 2 === 0).map(m => m.name)
    const uninformative = planted.filter(r => readKey(r, 'new_control') === 0 && readKey(r, 'old_control') === 0).map(r => r.member)
    const pairedOk = caught.join(',') === expectedCaught.join(',') && wrongCaught === 0 && uninformative.join(',') === expectedUninformative.join(',')
    const restoredOk = committedRestored()
    const g1 = blindOk && sensitiveOk && pairedOk && restoredOk

    log('planted control')

    // the six light flippers over the family
    const ensemble = new Map<string, MemberRun[]>()

    for (const e of FLIPPERS) {
      const runs = family.map(m => runMember(m, () => e.run({})))

      ensemble.set(e.code ?? e.id, runs)
      log(`${e.code} over ${family.length} starts`)
    }

    const restoredAfter = committedRestored()

    // G2: reproduction of E-MTH-0027's statuses
    const reproduced = Object.entries(RECORDED).filter(([code, [integer, golden]]) => {
      const runs = ensemble.get(code) ?? []

      return runs.find(r => r.member === 'integer+0')?.status === integer && runs.find(r => r.member === 'golden')?.status === golden
    }).length
    const g2 = reproduced === Object.keys(RECORDED).length

    // G4: the adoptions, paired, on E-SPN-0063
    const battery = ensemble.get('E-SPN-0063') ?? []
    const perMember = battery.map(run => {
      const fear = CONFIGS.flatMap(c => addedFailures(run, `${c}_comoving_gate_`, `${c}_off_gate_`).added.map(g => `${c}:${g}`))
      const comoving = CONFIGS.flatMap(c => addedFailures(run, `${c}_comoving_gate_`, `${c}_on_gate_`).added.map(g => `${c}:${g}`))
      const gainedOverFixed = CONFIGS.flatMap(c => addedFailures(run, `${c}_comoving_gate_`, `${c}_on_gate_`).gained.map(g => `${c}:${g}`))
      const comovingFails = CONFIGS.flatMap(c =>
        Object.keys(run.metrics)
          .filter(k => k.startsWith(`${c}_comoving_gate_`) && run.metrics[k] === 0)
          .map(k => `${c}:${k.slice(`${c}_comoving_gate_`.length)}`),
      )
      const fixedFails = CONFIGS.flatMap(c =>
        Object.keys(run.control)
          .filter(k => k.startsWith(`${c}_on_gate_`) && run.control[k] === 0)
          .map(k => `${c}:${k.slice(`${c}_on_gate_`.length)}`),
      )
      const informative = CONFIGS.every(c => (readKey(run, `${c}_comoving_frameMismatchSwapAtLoveFear`) ?? 0) > 0 && (readKey(run, `${c}_on_frameMismatchSwapAtLoveFear`) ?? 0) > 0)
      const controlsHold = CONFIGS.every(c => readKey(run, `${c}_comoving_controlsHold`) === 1 && readKey(run, `${c}_on_controlsHold`) === 1)
      const vacuumFear = CONFIGS.every(c => (readKey(run, `${c}_comoving_fearsMaxVacuum`) ?? 0) > 0)

      return { member: run.member, status: run.status, fear, comoving, gainedOverFixed, comovingFails, fixedFails, informative, controlsHold, vacuumFear }
    })
    const informativeMembers = perMember.filter(m => m.informative).length
    const fearAdds = perMember.filter(m => m.fear.length > 0).length
    const comovingAdds = perMember.filter(m => m.comoving.length > 0).length
    const g4 = battery.length === family.length && fearAdds === 0 && comovingAdds === 0 && informativeMembers >= INFORMATIVE_NEEDED

    // reported: the Bell ladder on E-QTM-0140
    const bell = ensemble.get('E-QTM-0140') ?? []
    const swapRungs = bell.map(r => rung(readKey(r, 'swapComoving_chshExactValue'), SWAP_MIDDLE, SWAP_TOP))
    const colorRungs = bell.map(r => rung(readKey(r, 'colorComoving_chshExactValue'), COLOR_MIDDLE, COLOR_TOP))

    // reported: per flipper pass fractions, and the distributions of the key metrics
    const metrics: Record<string, number> = {
      members: family.length,
      goldenChecks,
      goldenMismatches,
      committedZeroMismatches: zeroMismatches,
      identicalTablePairs: identicalPairs,
      inverseFailures,
      plantedSensitiveExpected: expectedEven.length,
      plantedSensitivePassed: sensitivePass.length,
      plantedPairExpected: expectedCaught.length,
      plantedPairCaught: caught.length,
      plantedPairWrong: wrongCaught,
      plantedUninformativeExpected: expectedUninformative.length,
      plantedUninformativeFlagged: uninformative.length,
      restoredAfter: restoredAfter ? 1 : 0,
      reproduced,
      informativeMembers,
      controlsHoldMembers: perMember.filter(m => m.controlsHold).length,
      vacuumFearMembers: perMember.filter(m => m.vacuumFear).length,
      membersWhereFearBeatAddsFailure: fearAdds,
      membersWhereComovingAddsFailure: comovingAdds,
      membersWhereComovingGainsOverFixed: perMember.filter(m => m.gainedOverFixed.length > 0).length,
      membersWithEveryComovingGatePassing: perMember.filter(m => m.comovingFails.length === 0).length,
      membersWithEveryFixedGatePassing: perMember.filter(m => m.fixedFails.length === 0).length,
      swapRungTwo: count(swapRungs, 'two'),
      swapRungMiddle: count(swapRungs, 'middle'),
      swapRungTop: count(swapRungs, 'top'),
      swapRungOther: swapRungs.length - count(swapRungs, 'two') - count(swapRungs, 'middle') - count(swapRungs, 'top'),
      colorRungTwo: count(colorRungs, 'two'),
      colorRungMiddle: count(colorRungs, 'middle'),
      colorRungTop: count(colorRungs, 'top'),
      colorRungOther: colorRungs.length - count(colorRungs, 'two') - count(colorRungs, 'middle') - count(colorRungs, 'top'),
      gateG1: g1 ? 1 : 0,
      gateG2: g2 ? 1 : 0,
      gateG3: g3 ? 1 : 0,
      gateG4: g4 ? 1 : 0,
    }
    const fractionLines: string[] = []

    for (const [code, runs] of ensemble) {
      for (const f of passFractions(runs)) {
        metrics[`${code}_pass_${f.gate}`] = f.pass
      }

      const statuses = runs.map(r => r.status)

      fractionLines.push(`${code}: pass ${count(statuses, 'pass')}, partial ${count(statuses, 'partial')}, fail ${count(statuses, 'fail')} of ${runs.length} (${runs.map(r => `${r.member} ${r.status}`).join(', ')})`)
    }

    const KEY_METRICS: Record<string, readonly string[]> = {
      'E-SPN-0063': CONFIGS.flatMap(c => [`${c}_comoving_fearsMaxVacuum`, `${c}_comoving_fearShareMax`, `${c}_comoving_chsh`, `${c}_comoving_frameMismatchSwapAtLoveFear`, `${c}_on_frameMismatchSwapAtLoveFear`]),
      'E-QTM-0140': ['swapComoving_chshExactValue', 'colorComoving_chshExactValue'],
      'E-QTM-0109': ['vacuumFearsMax', 'matterFearsMax', 'control.frameMismatchSwapAtLoveFear'],
      'E-RLT-0055': ['pairFearsMax', 'matterFearsMax', 'chsh', 'control.frameMismatchSwapAtLoveFear'],
      'E-QTM-0100': ['chshFearBeat', 'colorChsh', 'growerChshMax'],
      'E-QTM-0105': ['chshFromDeparture', 'loveMaxWholesPairs'],
    }
    const distributionLines: string[] = []

    for (const [code, keys] of Object.entries(KEY_METRICS)) {
      const runs = ensemble.get(code) ?? []

      for (const key of keys) {
        const plain = key.replace(/^control\./, '')
        const values = runs.map(r => readKey(r, plain)).filter((v): v is number => v !== undefined)

        if (values.length === 0) {
          continue
        }

        const d = distribution(values)

        metrics[`${code}_${plain}_min`] = d.min
        metrics[`${code}_${plain}_median`] = d.median
        metrics[`${code}_${plain}_max`] = d.max
        distributionLines.push(`${code} ${plain}: min ${Number(d.min.toPrecision(6))}, median ${Number(d.median.toPrecision(6))}, max ${Number(d.max.toPrecision(6))}, ${d.distinct} distinct`)
      }
    }

    const status = g1 && g2 && g3 ? (g4 ? 'pass' : 'partial') : 'fail'
    const memberLines = perMember.map(
      m =>
        `${m.member} (${m.status}${m.informative ? '' : ', frame control uninformative'}${m.controlsHold ? '' : ', controls do not hold'}): fear beat adds [${m.fear.join(' ')}], comoving adds [${m.comoving.join(' ')}], comoving gains [${m.gainedOverFixed.join(' ')}], comoving fails [${m.comovingFails.join(' ')}], fixed fails [${m.fixedFails.join(' ')}]`,
    )

    return verdict({
      status,
      claim: `over ${family.length} deterministic link starts, the comoving fear beat adds a quantum-gate failure against the fear-off column on ${fearAdds} and against the fixed-frame column on ${comovingAdds} (E-SPN-0063, H, HF and HFL, paired on the same start), with the frame control informative on ${informativeMembers}; the six light flippers pass on ${[...ensemble.entries()].map(([code, runs]) => `${code} ${count(runs.map(r => r.status), 'pass')}`).join(', ')} of ${family.length}; E-QTM-0140's reading-beat CHSH sits on the swap ladder at 2 / middle / top ${count(swapRungs, 'two')} / ${count(swapRungs, 'middle')} / ${count(swapRungs, 'top')} and the color ladder ${count(colorRungs, 'two')} / ${count(colorRungs, 'middle')} / ${count(colorRungs, 'top')}; the planted control caught ${caught.length} of ${expectedCaught.length} planted added failures and flagged ${uninformative.length} of ${expectedUninformative.length} uninformative members`,
      metrics,
      control: {
        plantedSensitivePassed: sensitivePass.length,
        plantedSensitiveExpected: expectedEven.length,
        plantedPairCaught: caught.length,
        plantedPairExpected: expectedCaught.length,
        plantedUninformativeFlagged: uninformative.length,
        plantedUninformativeExpected: expectedUninformative.length,
      },
      notes: `FIRST RUN 2026-09-26 (tmp/mth28-first.log, 760 s): PASS as predicted, every gate on the first run, no gate moved. What it says: every one of the six E-SPN-0063 fails over the family (integer+0, 4, 6, 7, 9, 12) is exactly a member where the vacuum pair's meetings make no fear, so E-FRC-0159's frame control (the swap phase at love-fear meetings) reads 0 in BOTH paired columns and controlsHold fails; on those members the comoving column fails no quantum gate at all. The paired criterion holds on 17 of 17: the fear beat adds no failure against fear-off and the comoving beat adds none against the fixed-frame beat; the comoving beat GAINS chshAbove2 on HF and HFL at integer+4, 6, 9, 12, where the fixed-frame beat reads the knot at 2. HEAVY BATTERIES, same harness, separate processes (tmp/mth28-frc0159.jsonl, tmp/mth28-rlt0056.jsonl, with E-MTH-0027's integer and golden runs as integer+0 and golden, which the harness reproduces number for number on the light flippers): E-FRC-0159 passes on 5 of 9 (integer+1, 2, 3, 5, golden) and fails on integer+0, 4, 6, 7 with fearBeatWorks 1, failsOnlyWithFearOn 0 and quantumGatesFailingWithFearOn 0 on all 9: every fail is controlsHold 0 on both the on and off columns (frame control 0 / 0, vacuum fears 0), the same members E-SPN-0063 flags; every on-column quantum gate passes on 9 of 9 on H, HF and HFL; the 12 classical failures are the base's and the same on every member. E-RLT-0056 is partial on 5 of 9 (integer+1, 4, 5, 7, golden) and fail on 4 (integer+0, 2, 3, 6), its G1 to G5 on 9 of 9, G6 and G8 on 0 of 9 (start-blind), and G7 on 5 of 9 through its frame gate alone, on the members whose vacuum pair makes no fear (pairFearsMax 0). L1, deterministic, no random numbers; ${Math.round((Date.now() - started) / 1000)} s. Per member (E-SPN-0063): ${memberLines.join('; ')}. Status over the family: ${fractionLines.join('; ')}. Distributions: ${distributionLines.join('; ')}. Swap rungs: ${bell.map((r, k) => `${r.member} ${swapRungs[k]}`).join(', ')}. Color rungs: ${bell.map((r, k) => `${r.member} ${colorRungs[k]}`).join(', ')}.`,
    })
  },
})
