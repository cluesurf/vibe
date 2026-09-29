// LANDAUER'S PRINCIPLE ON THE ADOPTED KNIT (E-CMP-0018). The ledger row: "Landauer's principle, erasing a trit costs
// heat", none. The knit is E-FND-0146's: the coset-union vacuum under the lone bounce collision, run with its exact
// inverse beat (code/measure/second-law-husk), side 8 (4,096 docks, 6,144 mesh lines of 8 docks), the husk cut into 8
// blocks of 4 x 4 x 4 columns.
//
// DERIVED BEFORE THE RUNS.
// 1. THE BOUND IS AN EQUALITY HERE. Landauer (as Bennett stated it): making a register of entropy H independent of its
//    starting value moves at least H into the rest of the world. The beat is a bijection (E-FND-0146 G1), so three
//    starts that differ only in the register (fear, calm, love, equally weighted, H = ln 3) stay three distinct
//    configurations at every beat. Whenever the register reads the same value in all three, the rest of the box must
//    tell them apart: the environment carries exactly ln 3, never less (nothing can be erased without a record) and never
//    more (the fine-grained entropy of the three-member ensemble is ln 3 at every beat). Landauer's bound is met with
//    equality, at zero dissipation: the reversible computation Bennett described.
// 2. WHERE THE RECORD GOES. The line law (E-SPN-0098, E-RLT-0091: a lone change stays on its line) puts the whole record
//    on the register's own mesh line: the three runs differ on that line and nowhere else.
// 3. WHY THE REGISTER IS ERASED AT ONCE. The stream takes each slot's value from the dock one step back along its root,
//    and that dock is the same in all three starts, so after beat 1 the register reads one value in all three. On a
//    finite box the line is a closed cycle of 8 docks, so the record comes back round: erasure on a finite reversible
//    box is never final (reported, not gated).
// 4. THE HEAT IS WHAT THE COARSE MAP CANNOT SEE. Read through E-FND-0146's coarse map (the husk block energies), fear and
//    love weigh the same (one held slot each) and calm weighs nothing, so at beat 1, before the two wakes can differ,
//    the three runs make exactly two coarse states with weights 2/3 and 1/3: H_coarse = H(1/3, 2/3) = 0.636514 nats, and
//    ln 3 - 0.636514 = 0.462098 nats of the erased trit sit in fine structure the coarse description does not hold. That
//    part is the heat, in the coarse (thermodynamic) account; it shrinks only while the love and fear wakes come to
//    weigh differently in some block.
//
// GATES, fixed before the gate run (probe 2, disclosed below, ran one start):
//  L1 BIJECTION: on every one of the 17 link starts the three runs are three distinct configurations at every beat 1..24
//  L2 THE RECORD ON ONE LINE: at every beat 1..24 on every start the runs differ only on the register's mesh line
//  L3 ERASED AT ONCE: at beat 1 the register reads one value in all three runs, on every start
//  L4 THE COARSE HEAT: at beat 1, H_coarse = H(1/3, 2/3) to 1e-12 on every start
// INSTRUMENT (partial on failure): 24 beats forward then 24 back returns every start bit for bit (sameState, which reads
//  a point only where a vibe or a stored unit is)
// CONTROLS (partial on failure):
//  C1 L1's reader can fail: an OVERWRITE (set the register to calm in all three before beat 1, a map that is not a
//     bijection) leaves one configuration at every beat (fine entropy 0: an erasure with no record, which only a
//     non-bijective step allows)
//  C2 L2's reader can fail: with a second difference placed on another line (line 40) at the start, the runs differ on
//     two lines
// REPORTED, gating nothing: per beat, the share of starts whose register reads one value in all three runs (the record
//  coming back round the line), and H_coarse over the 24 beats (its mean, and the beats where it reaches ln 3).
// Verdict: pass if L1 to L4 hold with the instrument and controls; fail if they hold and a gate fails; partial otherwise.
//
// PROBE BEFORE THE GATE RUN, disclosed. tmp/hl-probe2.log (one start, the first of the family): three distinct runs at
// every beat, the difference on the register's line only, the register erased at beats 1 to 6 and back at 7 (the line's
// period is 8), H_coarse 0.6365 through beat 9 and ln 3 at some later beats; a lone change on lines 5, 40 and 77 reached
// no other line in 21 beats forward nor pulled back. Its return check read false on a READER defect: it compared the
// point of empty slots, which the inverse beat leaves stale; sameState now reads a point only where a vibe or stored
// unit is. The gates were written after the probe, which set nothing but the reader fix.
//
// FIRST RUN (tmp/hl-landauer-run1.log, 12.8 s): pass, every gate, instrument and control, on 17 of 17 starts. H_coarse
// at beat 1 is 0.636514168295 = H(1/3, 2/3) exactly, 0.462098 nats of the trit invisible to the coarse map; over the 24
// beats the mean H_coarse is 0.7067 (mean heat 0.3919 nats), reaching ln 3 on up to 6 of 17 starts at a beat as the
// love and fear wakes come to weigh differently. The register reads one value on all starts at beats 1 to 6, then the
// record comes back round the line (shares 0.12, 0.06, 0.00, 0.65 ... at later beats). The title was written after it.
//
// NOT MEASURED: the energy side of Landauer, kT ln 3 per erased trit, which needs a temperature (E-FND-0148 reads one
// through the depth) and an erasure that drives the register to a fixed value against a bath. This row's claim is the
// information side, exactly.
//
// Depth L1 (the bijection argument) and L2 (measured on the adopted knit, 17 starts, read through the husk coarse map).
// DETERMINISM: the 17 link starts; nothing is drawn. NOTHING MOVES: the stream copies.

import { experiment } from '@/test/scaffold/suite'
import { verdict } from '@/test/scaffold/verdict'
import { arrowBox, twoWay, vacuumState, type ArrowBox } from '@/code/measure/second-law-husk'
import { cloneReduced, type Reduced } from '@/code/measure/living-pair-kernel'
import { startFamily, withStart } from '@/code/measure/start-ensemble'
import { LINE_FIRSTS } from '@/code/rule/isometric-knit'
import { coarseKey, differingLines, keyEntropy, lineSlot, meshLineMap, sameState, type MeshLineMap } from '@/code/measure/line-information'

const SIDE = 8
const BLOCK = 4
const BEATS = 24
const VALUES: readonly number[] = [-1, 0, 1]
const H_COARSE_ONE = -((1 / 3) * Math.log(1 / 3) + (2 / 3) * Math.log(2 / 3))
const COARSE_TOLERANCE = 1e-12
const SECOND_LINE = 40
const REGISTER = 0 * 24 + (LINE_FIRSTS[0] as number)

type MemberReading = { distinct: boolean; oneLine: boolean; erasedAtOne: boolean; coarseAtOne: number; erasedBeats: boolean[]; coarse: number[]; returns: boolean; overwriteDistinct: boolean; secondLines: number }

function startsOf(vac: Reduced, extra?: number): Reduced[] {
  return VALUES.map(v => {
    const s = cloneReduced(vac)

    s.vibe[REGISTER] = v
    s.point[REGISTER] = 0

    if (extra !== undefined) {
      s.vibe[extra] = v
      s.point[extra] = 0
    }

    return s
  })
}

function readMember(box: ArrowBox, map: MeshLineMap): MemberReading {
  const vac = vacuumState(box)
  const starts = startsOf(vac)
  const runs = starts.map(s => twoWay(box, s))
  const registerLine = map.slotLine[REGISTER] as number
  let distinct = true
  let oneLine = true
  const erasedBeats: boolean[] = []
  const coarse: number[] = []

  for (let t = 1; t <= BEATS; t++) {
    for (const r of runs) r.forward()

    const st = runs.map(r => r.state())

    distinct = distinct && !sameState(st[0]!, st[1]!) && !sameState(st[1]!, st[2]!) && !sameState(st[0]!, st[2]!)

    const lines = new Set([...differingLines(map, st[0]!, st[1]!), ...differingLines(map, st[1]!, st[2]!), ...differingLines(map, st[0]!, st[2]!)])

    oneLine = oneLine && lines.size === 1 && lines.has(registerLine)
    erasedBeats.push(st.every(s => s.vibe[REGISTER] === st[0]!.vibe[REGISTER]))
    coarse.push(keyEntropy(st.map(s => coarseKey(box, s))))
  }

  for (let t = 0; t < BEATS; t++) for (const r of runs) r.backward()

  const returns = runs.every((r, i) => sameState(r.state(), starts[i]!))

  // C1: the overwrite, one configuration from three
  const over = starts.map(s => {
    const o = cloneReduced(s)

    o.vibe[REGISTER] = 0

    return twoWay(box, o)
  })
  let overwriteDistinct = false

  for (let t = 1; t <= BEATS; t++) {
    for (const r of over) r.forward()

    const st = over.map(r => r.state())

    overwriteDistinct = overwriteDistinct || !sameState(st[0]!, st[1]!) || !sameState(st[1]!, st[2]!)
  }

  // C2: a second difference on another line
  const extra = lineSlot(map, SECOND_LINE, 3)
  const two = startsOf(vac, extra).map(s => twoWay(box, s))

  for (const r of two) r.forward()

  const s2 = two.map(r => r.state())
  const secondLines = new Set([...differingLines(map, s2[0]!, s2[1]!), ...differingLines(map, s2[1]!, s2[2]!)]).size

  return { distinct, oneLine, erasedAtOne: erasedBeats[0] as boolean, coarseAtOne: coarse[0] as number, erasedBeats, coarse, returns, overwriteDistinct, secondLines }
}

export default experiment({
  id: 'computation/landauer-line',
  code: 'E-CMP-0018',
  title:
    'Landauer on the adopted knit, pass on the information side: three starts differing only in a register trit (fear, calm, love) stay three distinct configurations at every beat on all 17 link starts, so erasing the register (it reads one value from beat 1) puts exactly ln 3 into the rest of the box, the bound met with equality at zero dissipation, and the whole record sits on the register own mesh line (line law); read through the husk coarse map the three runs make two coarse states at beat 1 (fear and love weigh the same), so ln 3 - H(1/3, 2/3) = 0.462 nats of the erased trit are invisible to the coarse description, the heat (0.392 nats on average over 24 beats); the record comes back round the 8-dock line (a finite reversible box never erases for good); the kT ln 3 energy cost is not measured',
  category: 'computation',
  substrates: ['3434'],
  depth: 'L2',
  paper: false,
  run() {
    const started = Date.now()
    const members = startFamily(16)
    const readings = members.map(member => {
      const box = withStart(member, () => arrowBox(SIDE, BLOCK))

      return readMember(box, meshLineMap(box))
    })

    const L1 = readings.every(r => r.distinct)
    const L2 = readings.every(r => r.oneLine)
    const L3 = readings.every(r => r.erasedAtOne)
    const L4 = readings.every(r => Math.abs(r.coarseAtOne - H_COARSE_ONE) <= COARSE_TOLERANCE)
    const instrument = readings.every(r => r.returns)
    const C1 = readings.every(r => !r.overwriteDistinct)
    const C2 = readings.every(r => r.secondLines === 2)
    const controls = C1 && C2
    const status = !instrument || !controls ? 'partial' : L1 && L2 && L3 && L4 ? 'pass' : 'fail'
    const erasedShare = Array.from({ length: BEATS }, (_, t) => readings.filter(r => r.erasedBeats[t]).length / readings.length)
    const coarseMean = readings.reduce((s, r) => s + r.coarse.reduce((a, b) => a + b, 0) / BEATS, 0) / readings.length
    const fullBeats = Array.from({ length: BEATS }, (_, t) => readings.filter(r => Math.abs((r.coarse[t] as number) - Math.log(3)) < 1e-12).length)
    const flag = (b: boolean): number => (b ? 1 : 0)
    const metrics: Record<string, number> = {
      L1: flag(L1),
      L2: flag(L2),
      L3: flag(L3),
      L4: flag(L4),
      instrument: flag(instrument),
      C1: flag(C1),
      C2: flag(C2),
      starts: readings.length,
      coarseAtOne: readings[0]?.coarseAtOne ?? NaN,
      heatAtOne: Math.log(3) - (readings[0]?.coarseAtOne ?? NaN),
      coarseMean,
      heatMean: Math.log(3) - coarseMean,
      erasedShareFirst6: erasedShare.slice(0, 6).reduce((a, b) => a + b, 0) / 6,
      erasedShareAll: erasedShare.reduce((a, b) => a + b, 0) / BEATS,
      seconds: (Date.now() - started) / 1000,
    }

    return verdict({
      status,
      claim: `on ${readings.length} link starts, side ${SIDE}: L1 ${L1} (three distinct configurations at every beat 1..${BEATS}); L2 ${L2} (the runs differ only on the register's line); L3 ${L3} (register erased at beat 1); L4 ${L4} (H_coarse at beat 1 ${(readings[0]?.coarseAtOne ?? NaN).toFixed(12)} against H(1/3, 2/3) ${H_COARSE_ONE.toFixed(12)}, so ${(Math.log(3) - H_COARSE_ONE).toFixed(6)} nats invisible to the coarse map); mean H_coarse over the beats ${coarseMean.toFixed(4)} (mean heat ${(Math.log(3) - coarseMean).toFixed(4)} nats); instrument ${instrument} (24 forward, 24 back, bit for bit); controls C1 ${C1} (the overwrite leaves one configuration), C2 ${C2} (a second difference reads two lines)`,
      metrics,
      control: { C1: flag(C1), C2: flag(C2), instrument: flag(instrument) },
      notes: `L1 and L2. Per beat, the share of starts whose register reads one value in all three runs: ${erasedShare.map(x => x.toFixed(2)).join(' ')}. Per beat, the starts where H_coarse reaches ln 3: ${fullBeats.join(' ')}. ${((Date.now() - started) / 1000).toFixed(1)} s.`,
    })
  },
})
