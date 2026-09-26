// Smooth hops (E-FRC-0214): a trit charge hopping on one link radiates the linear light's field once the
// light's carries are shaped level after level. E-FRC-0211 found the hop heating the integer light (61 times
// the linear energy at D = 16, coherent gain 0.88).
//
// The rule, code/rule/trit-husk-shaped: the husk integer light of code/rule/trit-husk with its spatial carry
// fed back through the same second difference as the first carry, level after level (L levels, 2 L + 1
// counters per husk triangle, each a cycling number in -D .. D, a column of D trits). One level is the wave
// form of E-FRC-0185 / 0205 exactly.
//
// The derivation, written before any run (the rule file's header): with one level the shadow's drift carries
// C^T R / q^2, R the last counter's remainder, which does not telescope, so the shadow angle random-walks
// wherever the counters are awake and the light heats in proportion to the awake volume and the time, at a
// rate ~ D^-4. The hop is not the cause: it only wakes the counters while its own field is small. With L
// levels the residual is C^T R / q^(L+1), so the heating should fall by about q^2 per level (1,089 at D = 16).
//
// Why not spread the hop over the column instead: a crossing carries a whole unit of charge, and the husk
// current in any beat is the column sum of whole crossings, an integer. Spreading a unit hop over a column of
// D bulk crossings in D beats would carry D units, not one, and spreading it over time cannot make any beat's
// current fractional. The impulse is exact physics (a charge that jumps a link radiates every frequency, and
// the linear light radiates it too); what needed fixing was the integer light's response to it.
//
// DISCLOSED: probes ran before these gates (tmp/smooth-probe1..3.log): at side 16, D = 16, 120 beats, the hop
// read gain 0.818, 0.9992, 1.0005 and energy 55.1, 1.159, 1.001 times linear at one, two and three levels;
// one level equals fastBeat bit for bit over 100 beats; every level reverses exactly; a unit impulse's
// energy at D = 16 grows 4.8 -> 23.7 over 240 beats at one level and holds at 0.049 at three; a free wave
// drifts 15 percent in 400 beats at one level and 0.02 percent at two; at D = 8 a static string's light
// wrapped its potentials 514,610 times in 2,000 beats at one level and 0 at three. The measured fall per
// level at D = 16 (340, then 167) is below the q^2 = 1,089 the derivation gives; it is reported, not gated.
//
// Gates, fixed before the first run of this file (the adopted rule is three levels):
// X  exactness: one level equals code/rule/trit-husk's fastBeat on every value of every beat (side 8, D 16,
//    100 beats from a golden Weyl start with a hop every 7 beats); two and three levels, with and without the
//    cyclic potential, run back to 0 mismatches after 150 beats with hops
// M  THE GATE: the hopping charge of E-FRC-0211 section M (side 32, one hop every 12 beats forth and back, 120
//    beats, read beyond radius 5) in the three-level light: coherent gain within 0.02 of 1 and total energy
//    within 2 percent of the linear light's at D = 16, and at D = 32, 64, 128
// H  heating: a unit impulse (side 8, 240 beats) in the three-level light: its shadow energy at beat 240
//    within 2 percent of its value at beat 80, at D = 11 and 16
// F  a free wave (side 8, D 16, k = (2 pi / 8)(1, 0, 0), peak |B| 8, 400 beats) in the three-level light:
//    frequency within 1e-4 of the symbol and energy drift under 1e-3
// Reported: levels 1 and 2 on M (level 1 is E-FRC-0211's rerun), the fall per level, the storage each level
//   needs in the bulk.
// Status: pass if every gate passes, partial if X and M pass, fail otherwise.
//
// Depth L2: a construction whose shadow runs the linear leapfrog by an exact identity, measured against it.

import { experiment } from '@/test/scaffold/suite'
import { verdict } from '@/test/scaffold/verdict'
import { weyl } from '@/code/tool/weyl'
import { energyMask, fastWave } from '@/code/measure/trit-hop-light'
import { hopRadiation, impulseHeating, makeShadowScratch, shadowReading } from '@/code/measure/trit-shaped-light'
import { addCurrent, emptyHusk, fastBeat, huskGeometry, makeHuskEngine } from '@/code/rule/trit-husk'
import { copyShaped, emptyShaped, makeShapedScratch, shapedArrays, shapedBeat, shapedBeatBack } from '@/code/rule/trit-husk-shaped'
import type { HuskLightState } from '@/code/rule/trit-column'

const ADOPTED = 3

function sectionX(): { levelOneMismatches: number; reversal: Record<string, number> } {
  const g = huskGeometry(8)
  const e = makeHuskEngine(g, 16)
  const a = emptyHusk(e)
  const b = emptyShaped(g, 1)

  for (let l = 0; l < a.angle.length; l++) {
    const n = l % 9 < 3 ? 64 : 32

    a.angle[l] = Math.floor(weyl(l + 1) * n) - n / 2
    b.angle[l] = a.angle[l] ?? 0
  }

  for (let p = 0; p < a.counter.length; p++) {
    a.counter[p] = Math.floor(weyl(p + 3) * 33) - 16
    a.lag[p] = Math.floor(weyl(p + 11) * 33) - 16
    a.spatial[p] = Math.floor(weyl(p + 13) * 33) - 16
    b.counter[p] = a.counter[p] ?? 0
    b.lag[p] = a.lag[p] ?? 0
    b.spatial[p] = a.spatial[p] ?? 0
  }

  const sc = makeShapedScratch(g, 1)
  let levelOneMismatches = 0

  for (let t = 0; t < 100; t++) {
    if (t % 7 === 0) {
      addCurrent(a, (t * 37) % a.string.length, 1)
      addCurrent(b, (t * 37) % b.string.length, 1)
    }

    fastBeat(e, a)
    shapedBeat(e, b, sc, { levels: 1, cyclic: false })

    for (const key of ['angle', 'potential', 'counter', 'lag', 'spatial', 'string'] as const) {
      for (let i = 0; i < a[key].length; i++) levelOneMismatches += a[key][i] === b[key][i] ? 0 : 1
    }
  }

  const reversal: Record<string, number> = {}

  for (const levels of [2, 3]) {
    for (const cyclic of [false, true]) {
      const s = emptyShaped(g, levels)
      const scratch = makeShapedScratch(g, levels)
      const options = { levels, cyclic }

      for (let l = 0; l < s.angle.length; l++) {
        const n = l % 9 < 3 ? 64 : 32

        s.angle[l] = Math.floor(weyl(l + 1) * n) - n / 2
      }

      const s0 = copyShaped(s)
      const at = (t: number): number => (t * 13) % s.string.length

      for (let t = 0; t < 150; t++) {
        if (t % 5 === 0) addCurrent(s, at(t), 1)
        shapedBeat(e, s, scratch, options)
      }

      for (let t = 149; t >= 0; t--) {
        shapedBeatBack(e, s, scratch, options)
        if (t % 5 === 0) addCurrent(s, at(t), -1)
      }

      const x = shapedArrays(s)
      const y = shapedArrays(s0)
      let m = 0

      x.forEach((arr, i) => arr.forEach((v, j) => (m += v === (y[i]?.[j] ?? 0) ? 0 : 1)))
      reversal[`L${levels}_${cyclic ? 'cyclic' : 'window'}`] = m
    }
  }

  return { levelOneMismatches, reversal }
}

function sectionF(): { relative: number; drift: number } {
  const g = huskGeometry(8)
  const e = makeHuskEngine(g, 16)
  const all = energyMask(g, 0, -1)
  const reading = makeShadowScratch(g)
  const options = { levels: ADOPTED, cyclic: false }
  const scratch = makeShapedScratch(g, ADOPTED)
  const shaped = emptyShaped(g, ADOPTED)
  const energies: number[] = []
  let started = false

  // fastWave builds the wave on a plain husk state; the three-level rule steps a mirror of it
  const wave = fastWave(e, g, [(2 * Math.PI) / 8, 0, 0], 1, 8, 400, (st: HuskLightState) => {
    if (!started) {
      shaped.angle.set(st.angle)
      shaped.potential.set(st.potential)
      shaped.counter.set(st.counter)
      shaped.lag.set(st.lag)
      shaped.spatial.set(st.spatial)
      shaped.string.set(st.string)
      started = true
      energies.push(shadowReading(e, shaped, options, all, reading))
    }

    shapedBeat(e, shaped, scratch, options)
    st.angle.set(shaped.angle)
    st.potential.set(shaped.potential)
    st.counter.set(shaped.counter)
    st.lag.set(shaped.lag)
    st.spatial.set(shaped.spatial)
    energies.push(shadowReading(e, shaped, options, all, reading))
  })

  return { relative: wave.relative, drift: (energies[energies.length - 1] ?? 0) / (energies[0] ?? 1) - 1 }
}

export default experiment({
  id: 'gauge/trit-smooth-hop',
  code: 'E-FRC-0214',
  title:
    'smooth hops: the integer light\'s heating after a charge\'s hop is its last carry\'s remainder pushing the shadow angle, and with the carries shaped level after level (the wave form applied to its own spatial term, three levels, 7 counters of D trits per husk triangle) a trit charge hopping on one link radiates the linear light\'s field, coherent gain 1 and energy within a tenth of a percent at D = 16',
  category: 'gauge',
  substrates: ['3434'],
  depth: 'L2',
  paper: false,
  run() {
    const x = sectionX()
    const g32 = huskGeometry(32)
    const g8 = huskGeometry(8)
    const metrics: Record<string, number> = { x_levelOneMismatches: x.levelOneMismatches }

    for (const [key, value] of Object.entries(x.reversal)) metrics[`x_reversal_${key}`] = value

    let okM = true

    for (const depth of [16, 32, 64, 128]) {
      for (const levels of [1, 2, 3]) {
        const r = hopRadiation({ geometry: g32, depth, options: { levels, cyclic: false }, beats: 120, half: 12, radius: 5 })

        metrics[`m_D${depth}_L${levels}_gain`] = r.gain
        metrics[`m_D${depth}_L${levels}_incoherentOverSignal`] = r.incoherentOverSignal
        metrics[`m_D${depth}_L${levels}_energyRatio`] = r.integerOverLinearTotal

        if (levels === ADOPTED) okM = okM && Math.abs(r.gain - 1) <= 0.02 && Math.abs(r.integerOverLinearTotal - 1) <= 0.02
      }

      metrics[`m_D${depth}_fallLevel1to2`] = ((metrics[`m_D${depth}_L1_energyRatio`] ?? 1) - 1) / ((metrics[`m_D${depth}_L2_energyRatio`] ?? 1) - 1)
      metrics[`m_D${depth}_fallLevel2to3`] = ((metrics[`m_D${depth}_L2_energyRatio`] ?? 1) - 1) / ((metrics[`m_D${depth}_L3_energyRatio`] ?? 1) - 1)
      metrics[`m_D${depth}_qSquared`] = (2 * depth + 1) ** 2
    }

    let okH = true

    for (const depth of [11, 16]) {
      for (const levels of [1, 2, 3]) {
        const h = impulseHeating({ geometry: g8, depth, options: { levels, cyclic: false }, beats: 240, every: 80 })

        metrics[`h_D${depth}_L${levels}_beat80`] = h[0] ?? 0
        metrics[`h_D${depth}_L${levels}_beat240`] = h[2] ?? 0

        if (levels === ADOPTED) okH = okH && Math.abs((h[2] ?? 0) / (h[0] ?? 1) - 1) <= 0.02
      }
    }

    const f = sectionF()

    metrics.f_relative = f.relative
    metrics.f_drift = f.drift

    // the bulk storage each level needs, per husk dock: the potential columns (sum of n_P D over the 20 husk
    // triangles of a dock, 32 D) and 2 L + 1 counter columns of D per husk triangle, against the bulk's 32 D
    // bulk triangles of 4 trits each (u and three counters): in units of D trits
    for (const levels of [1, 2, 3]) metrics[`storage_L${levels}_needOverHave`] = (32 + 20 * (2 * levels + 1)) / 128

    const gates = {
      X: x.levelOneMismatches === 0 && Object.values(x.reversal).every(v => v === 0),
      M: okM,
      H: okH,
      F: Math.abs(f.relative) <= 1e-4 && Math.abs(f.drift) < 1e-3,
    }

    for (const [gate, ok] of Object.entries(gates)) metrics[`gate${gate}`] = ok ? 1 : 0

    const status = Object.values(gates).every(v => v) ? 'pass' : gates.X && gates.M ? 'partial' : 'fail'
    const row = (levels: number): string => [16, 32, 64, 128].map(d => (metrics[`m_D${d}_L${levels}_gain`] ?? 0).toFixed(4)).join(', ')
    const erow = (levels: number): string => [16, 32, 64, 128].map(d => (metrics[`m_D${d}_L${levels}_energyRatio`] ?? 0).toFixed(4)).join(', ')

    return verdict({
      status,
      claim: `a trit charge hopping on one link (side 32, 120 beats) radiates with coherent gain ${row(3)} and energy ${erow(3)} times the linear light's at D = 16, 32, 64, 128 in the three-level light, against gain ${row(1)} and energy ${erow(1)} with one level (E-FRC-0211's light) and ${erow(2)} with two; one level equals the wave form bit for bit and every level reverses exactly; a free wave reads its symbol to ${f.relative.toExponential(1)} and drifts ${f.drift.toExponential(1)} in 400 beats`,
      metrics,
      control: { levelOneGainD16: metrics.m_D16_L1_gain ?? 0, levelOneEnergyD16: metrics.m_D16_L1_energyRatio ?? 0 },
      notes:
        'L2, exact integers in the rule, deterministic (golden Weyl starts). FIRST RUN 2026-09-26 (tmp/frc0214.log, 91.5 s), PASS on every gate, no gate moved. X: one level equals fastBeat on every value of 100 beats (0 mismatches), and two and three levels reverse to 0 mismatches with and without the cyclic potential. M, THE GATE: in the three-level light the hopping trit charge radiates with coherent gain 1.0004, 1.0000, 1.0000, 1.0000, incoherent remainder 1.3e-3, 2.9e-5, 1.1e-7, 4.0e-9 and total energy 1.0013, 1.0001, 1.0000, 1.0000 times the linear light at D = 16, 32, 64, 128. One level reproduces E-FRC-0211 exactly (gain 0.8845, 0.2103, 0.5434, 0.5632, energy 60.67, 15.08, 1.61, 1.05), which is the control; two levels give energy 1.548, 1.046, 1.0000, 1.0000. H: a unit impulse in the three-level light holds its energy (0.04903 at beat 80, 0.04897 at 240, D = 16; 0.07187 both at D = 11), where one level heats it 4.8 -> 23.7 and 28.9 -> 116.5. F: a free wave reads its symbol to 1.9e-5 and its energy drifts 3.8e-6 in 400 beats (one level: 15 percent, tmp/smooth-probe1.log). THE CAUSE, confirmed: the heating was never the hop. It was the last carry\'s remainder entering the shadow\'s drift as C^T R / q^2, which does not telescope; each shaped level pushes it one power of q down. The measured fall per level is 109 then 411 at D = 16 and 307 then 472 at D = 32, below the q^2 (1,089 and 4,225) the one-remainder picture predicts: the reported, ungated prediction fails, so the remainder is not white (the levels\' remainders correlate), and the fall is one to two and a half decades per level, not four. ALSO FOUND (tmp/smooth-probe3.log): the one-level light at D = 8 around a static string wraps its potential columns 514,610 times in 2,000 beats, and the three-level light never does; this is what failed E-FRC-0213\'s gate E. WHAT IT COSTS: 2 L + 1 counters per husk triangle, each a column of D trits. Per husk dock the potentials need 32 D trits and the counters 20 (2 L + 1) D, against 128 D in the bulk triangles (32 D triangles, four trits each: u and three counters): 0.72 of the room at one level, 1.03 at two, 1.34 at three. So the three-level light does not fit the bulk\'s present trits: it needs 44 D more trits per husk dock (1.4 more per bulk triangle; two levels need 4 D more), or a counter held in fewer trits than a thermometer. This is the open cost of the result. NOT BUILT: the three-level rule in bulk trits (code/rule/trit-column is one level); a hop spread over the column (argued impossible above: a crossing carries a whole unit).',
    })
  },
})
