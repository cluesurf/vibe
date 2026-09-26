// The three-level shaped light in bulk trits (E-FRC-0220): E-FRC-0214's light, which made a hopping trit
// charge radiate the linear field exactly, built on the bulk's own trits with the compact counters of
// E-FRC-0219 (code/rule/trit-compact), and driven by real bulk crossings (a vibe swap that flips one string
// trit, E-FRC-0210) rather than a husk current.
//
// PREDICTIONS (fixed before the first run): the bulk rule decodes to the husk shaped rule bit for bit, so the
// hop radiates what E-FRC-0214 measured on the husk: coherent gain 1 and energy within a tenth of a percent
// of the linear light at D = 16, the one-level control heats (E-FRC-0211's 61 times at side 32), and the
// three-level light never wraps its potentials around a static string at D = 8 where one level wraps them
// hundreds of thousands of times (E-FRC-0214, tmp/smooth-probe3.log: 514,610 in 2,000 beats, husk side 8).
// A pair swap carries two units (love out, fear in), so the hop here is twice E-FRC-0214's.
//
// DISCLOSED: tmp/compact-probe2.log ran the hop on side 8 at D = 16 for 60 beats (three levels: gain 1.0003,
// energy 1.0003, 0 husk mismatches, reversal 0; one level: gain 0.67, energy 3.84) and a length-2 static string
// on side 4 at D = 8 for 400 beats (0 wraps at one and three levels), before these gates were written; the
// static gate below uses E-FRC-0214's own configuration (length 3, side 8, 2,000 beats) instead.
//
// Gates:
// X  exactness: in the hop run below the bulk trits decode to the husk shaped rule (three levels, the same
//    string, column-summed) on every angle and potential at every beat: 0 mismatches, at D = 11 and 16
// M  THE GATE: on bulk side 16, a love and a fear on the two ends of one bulk axis link swap every 12 beats
//    (forth and back, 120 beats) in the three-level bulk light; read beyond husk radius 5 against the linear
//    leapfrog with the same current: coherent gain within 0.02 of 1 and total energy within 2 percent of the
//    linear light's, at D = 11 and 16
// W  a static string of 3 bulk links (a love and a fear, D = 8, side 8, 2,000 beats) in the three-level bulk
//    light wraps no potential column (0), where the one-level light (the control) wraps them
// G  Gauss's law in the bulk and on the husk at every beat of the hop runs: 0 violations
// R  the hop runs return to every trit of the start when run back: 0 mismatches
// B  reported: the budget at the depths used (counter trits used of those each husk triangle holds)
// Reported: the one-level control's gain and energy on the same runs.
// Status: pass if X, M, W, G and R pass, partial if X, G and R pass, fail otherwise.
//
// Depth L2: a construction equal to the husk rule by an identity, measured against the linear light.

import { experiment } from '@/test/scaffold/suite'
import { verdict } from '@/test/scaffold/verdict'
import { budget, bulkHopRadiation, staticStringWraps } from '@/code/measure/trit-compact-light'
import { makeTritLight } from '@/code/rule/trit-column'

const DEPTHS = [11, 16]

export default experiment({
  id: 'gauge/trit-compact-light',
  code: 'E-FRC-0220',
  title:
    'the three-level shaped light in bulk trits: with compact counters the whole light fits the bulk, decodes to the husk shaped rule bit for bit, and a love-fear swap across one bulk link (a real crossing that flips one string trit) radiates the linear light\'s field, reversibly and with Gauss exact',
  category: 'gauge',
  substrates: ['3434'],
  depth: 'L2',
  paper: false,
  run() {
    const metrics: Record<string, number> = {}
    let okX = true
    let okM = true
    let okG = true
    let okR = true

    for (const depth of DEPTHS) {
      const light = makeTritLight({ side: 16, depth })

      for (const levels of [3, 1]) {
        const r = bulkHopRadiation({ light, levels, beats: 120, half: 12, radius: 5 })
        const key = `m_D${depth}_L${levels}`

        metrics[`${key}_gain`] = r.gain
        metrics[`${key}_incoherentOverSignal`] = r.incoherentOverSignal
        metrics[`${key}_energyRatio`] = r.energyRatio
        metrics[`${key}_huskMismatches`] = r.huskMismatches
        metrics[`${key}_crossings`] = r.crossings
        metrics[`${key}_bulkGauss`] = r.bulkGauss
        metrics[`${key}_huskGauss`] = r.huskGauss
        metrics[`${key}_reversal`] = r.reversal
        metrics[`${key}_potentialWraps`] = r.potentialWraps
        metrics[`${key}_counterFlipsPerBeat`] = r.counterFlips / 120
        metrics[`${key}_counterReach`] = r.counterReach

        if (levels === 3) {
          okX = okX && r.huskMismatches === 0
          okM = okM && Math.abs(r.gain - 1) <= 0.02 && Math.abs(r.energyRatio - 1) <= 0.02
        }

        okG = okG && r.bulkGauss === 0 && r.huskGauss === 0
        okR = okR && r.reversal === 0
      }

      const b = budget(depth, 3, 'ternary')

      metrics[`b_D${depth}_counterTritsNeed`] = b.perTriangleNeed
      metrics[`b_D${depth}_counterTritsHave`] = b.perTriangleHave
      metrics[`b_D${depth}_needOverHave`] = b.ratio
    }

    const light8 = makeTritLight({ side: 8, depth: 8 })
    const three = staticStringWraps({ light: light8, levels: 3, beats: 2000, length: 3 })
    const one = staticStringWraps({ light: light8, levels: 1, beats: 2000, length: 3 })

    metrics.w_L3_potentialWraps = three.potentialWraps
    metrics.w_L1_potentialWraps = one.potentialWraps
    metrics.w_bulkGauss = three.bulkGauss + one.bulkGauss

    const okW = three.potentialWraps === 0 && one.potentialWraps > 0
    const gates = { X: okX, M: okM, W: okW, G: okG, R: okR }

    for (const [gate, ok] of Object.entries(gates)) metrics[`gate${gate}`] = ok ? 1 : 0

    const status = Object.values(gates).every(v => v) ? 'pass' : gates.X && gates.G && gates.R ? 'partial' : 'fail'
    const f = (x: number | undefined, n = 4): string => (x ?? 0).toFixed(n)

    return verdict({
      status,
      claim: `in the three-level light on bulk trits (side 16), a love-fear swap across one bulk axis link radiates with coherent gain ${DEPTHS.map(d => f(metrics[`m_D${d}_L3_gain`])).join(', ')} and energy ${DEPTHS.map(d => f(metrics[`m_D${d}_L3_energyRatio`])).join(', ')} times the linear light's at D = ${DEPTHS.join(', ')} (one level: gain ${DEPTHS.map(d => f(metrics[`m_D${d}_L1_gain`])).join(', ')}, energy ${DEPTHS.map(d => f(metrics[`m_D${d}_L1_energyRatio`])).join(', ')}), decoding to the husk shaped rule with ${DEPTHS.map(d => metrics[`m_D${d}_L3_huskMismatches`]).join(', ')} mismatches, Gauss exact and reversal exact; a static string at D = 8 wraps ${three.potentialWraps} potentials in 2,000 beats against ${one.potentialWraps} at one level; the counters use ${metrics.b_D16_counterTritsNeed} of the ${metrics.b_D16_counterTritsHave} counter trits per husk triangle at D = 16`,
      metrics,
      control: { oneLevelGainD16: metrics.m_D16_L1_gain ?? 0, oneLevelEnergyD16: metrics.m_D16_L1_energyRatio ?? 0, oneLevelStaticWraps: one.potentialWraps },
      notes:
        'L2, exact integers in the rule, deterministic. FIRST RUN 2026-09-26 (tmp/frc0220.log, 74.4 s), PASS on every gate, no gate moved. X: the bulk trits decode to the husk shaped rule on every angle and potential at every beat (0 mismatches at D = 11 and 16). M: a love-fear swap across one bulk axis link every 12 beats (9 crossings of two units each in 120 beats) radiates beyond radius 5 with coherent gain 0.9996 and 0.9999, incoherent remainder 2.8e-3 and 7.7e-5, energy 1.0008 and 1.0000 times the linear light at D = 11 and 16; the one-level control on the same bulk reads gain 1.079 and 0.334, remainder 347 and 19, energy 254 and 13.4. W: a static string of 3 bulk links at D = 8 wraps 0 potentials in 2,000 beats in the three-level light and 483,151 in the one-level light (E-FRC-0214\'s husk probe: 514,610). G: Gauss exact in bulk and husk at every beat (0). R: every hop run returns to every trit (0). B: the counters use 21 of 33 counter trits per husk triangle at D = 11 and 28 of 48 at D = 16 (0.548 and 0.523 of the bulk\'s trits in all). The counters churn: about 7.7e5 counter trit flips per beat at D = 16 on side 16 (9 per husk triangle), against 8.8e4 at one level.',
    })
  },
})
