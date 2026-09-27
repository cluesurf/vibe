// Where the vacuum clock lives if the classical vacuum is cold: the fear clock's vacuum fluctuations, and
// what they cost.
//
// The committed knit's 24-beat vacuum clock is classical pairs made from calm. E-FLD-0032's cold vacuum
// makes none: it keeps an exact energy, and with empty counters and no tone it never changes. The fear
// clock (code/rule/fear-clock, E-QTM-0108) puts the one-third swap phase into the pair clock and carries
// amplitudes on whole configurations, vacuum included, so its vacuum is a superposition. This asks whether
// that superposition gives vacuum fluctuations on top of a quiet classical layer, and at what price.
//
// Measured:
// 1. the classical layer: the cold weave (E-FLD-0032's rule) born empty with empty counters, side 5,
//    48 beats: it never changes;
// 2. the quantum layer: the fear clock's vacuum (every slot calm) on rings of 3, 4, 5 and 6 docks, one line
//    each, 24 beats, beside the committed clock (phi = pi, the classical flash): the total chance exact
//    at every beat, every configuration charge zero, and per beat the pair number per dock (tones over 2L),
//    the variance of the tone count, the same-line correlation <t0 t1> (the two slots of one line), the
//    neighbor correlation <t0 t2> and the mean vibe <t0>. Averaged over the 24 beats: the pair density
//    against the classical flash's 2/3, and its dependence on the ring size (a Casimir-like response is a
//    density that depends on L; here it is read, not assumed to go as 1 / L);
// 3. the price: whether the quantum step keeps the tone count. It does not (the vacuum's count leaves 0 on
//    the first beat), and the argument is short: a step that commutes with a conserved count keeps the
//    empty vacuum, the count's only zero state, exactly where it is, so no vacuum that is cold in an exact
//    energy can fluctuate in the configurations that energy counts.
//
// Gates, fixed before this run: the classical layer still; the total chance exact and every configuration
// charge zero on every ring; the fear vacuum's tone-count variance positive at some beat on every ring
// where the committed one is zero at every beat; the fear vacuum's 24-beat pair density within 0.05 of the
// flash's 2/3 on every ring; its same-line correlation negative on average; and its tone count not kept
// (the price). The size dependence and the neighbor correlation are reported.
//
// Depth L2: known facts about a constructed amplitude rule read exactly, and one short argument checked.

import { experiment } from '@/test/scaffold/suite'
import { verdict } from '@/test/scaffold/verdict'
import { colorLocalCollision } from '@/code/rule/color-local-weave'
import { cptMirrorPhase } from '@/code/measure/weave-acceptance'
import { d4BoxMesh } from '@/code/substrate/d4-box'
import { HEAD_TURN_SPEC, scatterSchedule, type ScatterWeaveSpec } from '@/code/rule/scatter-weave'
import { coldBeat, makeColdWeave, type ColdState } from '@/code/rule/cold-weave'
import { configOf, ringBeat, toneAt, totalNorm, type Amplitudes, type ClockMode } from '@/code/rule/fear-clock'
import { norm } from '@/code/rule/fear-walk'

const BEATS = 24
const RINGS = [3, 4, 5, 6]
const FLASH = 2 / 3

type RingRun = {
  readonly normExact: boolean
  readonly chargeZero: boolean
  readonly density: number[]
  readonly variance: number[]
  readonly sameLine: number[]
  readonly neighbor: number[]
  readonly slotMean: number[]
}

function ring(docks: number, mode: ClockMode): RingRun {
  let s: Amplitudes = { weights: new Map([[configOf(new Array<number>(2 * docks).fill(0)), [1n, 0n]]]), halvings: 0 }

  const out: RingRun = { normExact: true, chargeZero: true, density: [], variance: [], sameLine: [], neighbor: [], slotMean: [] }
  let normExact = true
  let chargeZero = true

  for (let t = 0; t < BEATS; t++) {
    s = ringBeat(s, docks, mode, true)
    normExact = normExact && totalNorm(s) === 4n ** BigInt(s.halvings)

    const scale = Number(4n ** BigInt(s.halvings))

    let mean = 0
    let square = 0
    let sameLine = 0
    let neighbor = 0
    let slotMean = 0

    for (const [config, w] of s.weights) {
      const p = Number(norm(w)) / scale

      let n = 0
      let q = 0

      for (let i = 0; i < 2 * docks; i++) {
        const v = toneAt(config, i)

        n += v === 0 ? 0 : 1
        q += v
      }

      chargeZero = chargeZero && q === 0
      mean += p * n
      square += p * n * n
      sameLine += p * toneAt(config, 0) * toneAt(config, 1)
      neighbor += p * toneAt(config, 0) * toneAt(config, 2)
      slotMean += p * toneAt(config, 0)
    }

    out.density.push(mean / 2 / docks)
    out.variance.push(square - mean * mean)
    out.sameLine.push(sameLine)
    out.neighbor.push(neighbor)
    out.slotMean.push(slotMean)
  }

  return { ...out, normExact, chargeZero }
}

const average = (xs: readonly number[]): number => xs.reduce((a, b) => a + b, 0) / xs.length

export default experiment({
  id: 'fluids/quantum-vacuum',
  code: 'E-FLD-0033',
  title:
    "the fear clock's vacuum fluctuates where the classical cold vacuum stands still (tone-count variance 2.1 to 4.3 on rings of 3 to 6 docks against exactly 0 for the committed flash, the two slots of a line anticorrelated, pair density 0.65 to 0.69 per dock beside the flash's 2/3, depending on the ring size), but these are not fluctuations of a cold vacuum: the quantum step makes pairs from calm at no cost (the first beat is a full flash) and keeps no energy, and a step that keeps an exact energy leaves the empty vacuum, that energy's only zero state, where it is, so no cold vacuum in this configuration model can fluctuate",
  category: 'fluids',
  substrates: ['3434'],
  depth: 'L2',
  paper: false,
  run() {
    // 1. the classical layer
    const mirror = cptMirrorPhase((o, f) => colorLocalCollision({ spec: HEAD_TURN_SPEC, opposite: o, forward: f }))
    const spec: ScatterWeaveSpec = { base: HEAD_TURN_SPEC, mirror, sets: scatterSchedule({ partitions: 2, pairs: 3 }), condition: 'matched' }
    const mesh = d4BoxMesh({ side: 5 })
    const weave = makeColdWeave({ mesh, spec })

    let v: ColdState = { vibe: new Int8Array(mesh.cellCount * 24), store: new Int32Array(mesh.cellCount * 24), demon: new Int32Array(mesh.cellCount * 12) }
    let classicalStill = true

    for (let t = 0; t < 48; t++) {
      v = coldBeat(weave, v, t)
      classicalStill = classicalStill && v.vibe.every(x => x === 0) && v.demon.every(x => x === 0)
    }

    // 2 and 3. the quantum layer
    const fear = RINGS.map(docks => ({ docks, ...ring(docks, 'fear') }))
    const committed = RINGS.map(docks => ({ docks, ...ring(docks, 'committed') }))

    const exact = [...fear, ...committed].every(r => r.normExact && r.chargeZero)
    const fluctuates = fear.every(r => r.variance.some(x => x > 1e-9)) && committed.every(r => r.variance.every(x => Math.abs(x) < 1e-12))
    const matchesFlash = fear.every(r => Math.abs(average(r.density) - FLASH) < 0.05)
    const pairCorrelated = fear.every(r => average(r.sameLine) < 0)
    const countNotKept = fear.every(r => (r.density[0] ?? 0) > 0)

    const ok = classicalStill && exact && fluctuates && matchesFlash && pairCorrelated && countNotKept

    const metrics: Record<string, number> = { classicalStill: classicalStill ? 1 : 0, exact: exact ? 1 : 0, flash: FLASH }

    for (const r of fear) {
      metrics[`fearDensityL${r.docks}`] = average(r.density)
      metrics[`fearVarianceL${r.docks}`] = average(r.variance)
      metrics[`fearVariancePerDockL${r.docks}`] = average(r.variance) / r.docks
      metrics[`fearSameLineL${r.docks}`] = average(r.sameLine)
      metrics[`fearNeighborL${r.docks}`] = average(r.neighbor)
      metrics[`fearSlotMeanL${r.docks}`] = average(r.slotMean)
      metrics[`fearFirstBeatDensityL${r.docks}`] = r.density[0] ?? 0
    }

    const control: Record<string, number> = {}

    for (const r of committed) {
      control[`committedDensityL${r.docks}`] = average(r.density)
      control[`committedVarianceL${r.docks}`] = average(r.variance)
    }

    return verdict({
      status: ok ? 'pass' : 'fail',
      claim:
        'the classical cold vacuum never changes; the fear and committed vacua keep the total chance exactly with every configuration at charge zero; the fear vacuum has positive tone-count variance on every ring where the committed flash has none; its 24-beat pair density is within 0.05 of 2/3 on every ring; the two slots of a line are anticorrelated; and its tone count leaves zero on the first beat (the price)',
      metrics,
      control,
      notes:
        'L2, exact amplitudes (Eisenstein integers), no random numbers. WHAT IS THERE: the fear vacuum is a superposition over its charge-zero sector with a variance in its tone count (2.1, 3.5, 2.7 and 4.3 at 3, 4, 5 and 6 docks; per dock 0.71, 0.87, 0.54, 0.71), a same-line correlation <t0 t1> of -0.24, -0.42, -0.17, -0.24 (a love on one slot comes with a fear on the other: pairs), a weak neighbor correlation (0.04 to 0.11) and a mean vibe near zero (under 0.03). Its pair density averages 0.658, 0.691, 0.653 and 0.658 per dock against the classical flash 2/3, so the mean matches the classical clock as E-QTM-0108 found. The density depends on the ring size (3 and 6 docks agree to every digit, 4 and 5 do not), a finite-size response of the vacuum, read here and not fitted to a law. WHAT IT IS NOT: a cold vacuum fluctuating. The first beat is a full flash (density 1): the quantum clock makes a pair from calm on every line with certainty, as the classical committed one does, and the tone count leaves zero at once. The fluctuations are the hot vacuum superposed, not virtual pairs about an empty one. The argument that nothing else is possible here: if the quantum step keeps an exact energy (tones plus counters, E-FLD-0028, E-FLD-0032), it maps each energy sector into itself; the empty vacuum is the only configuration of energy zero, so the step keeps it, and the cold vacuum stays one configuration with no variance. Virtual pairs need what this model does not have: a ground state that is not a configuration, that is an energy that is not diagonal in the configurations. So the clock can live in the quantum layer only as a hot vacuum there, and the arrow must come from the wake (E-FND-0051), which does not need a vacuum clock at all.',
    })
  },
})
