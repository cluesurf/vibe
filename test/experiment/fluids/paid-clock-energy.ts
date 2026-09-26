// Energy and the pair clock together: the scatter weave with its pair clock paid from demons.
//
// E-FLD-0027 proved that no rule that makes a love and a fear from calm keeps an additive energy over the
// slots, so energy (and with it sound) and the vacuum's clock excluded each other in the scatter weave.
// The proof covers sums over slots only. A demon is a second kind of degree of freedom: code/rule/paid-weave
// gives every line of every dock a counter, a whole number at least zero that does not stream, and pays the
// pair clock from it, calm becoming a pair only when its line's counter holds 2, a pair annihilating
// giving 2 back. Then E = (tones) + (counters) is kept exactly, and the clock runs wherever a line holds
// energy. The rule is the viscous scatter weave of E-FLD-0026 (head-on turn base, matched condition, 36
// scatterings a beat) with the paid clock.
//
// Measured on this one rule:
// 1. the exact laws (side 3, a dense start with role points and counters of 2 on half the lines, 48 beats):
//    E, charge and P every beat, no color leak, no counter below zero, and reversal of vibes, role points,
//    flows and counters; CPT at the collision level with counters, the mirror phase searched over all 24;
// 2. the vacuum (side 5, born empty of tones, counters uniform at 0, 1, 2 or 4 on every line, or 2 on a
//    hashed fraction 0.25, 0.5 or 0.9 of the lines): whether it clocks (the largest tone count reached) and
//    its period, looked for at every multiple of 24 up to 480 beats;
// 3. sound: the longitudinal momentum wave of E-FLD-0027 (fill 0.2) on d4Mesh at L = 12, 16, 20 and 24,
//    counters uniform at 0 (the clock cannot start) and at 2 (the clock runs everywhere), damped-cosine
//    fit, speed omega / k against c / 2 = 1 / sqrt 2, and E exact in every run;
// 4. dressing: a lone love on the vacuum with counters at 2 (side 9, four periods, 24 directions), against
//    the committed rule's 33, 160, 565, 1,508.
//
// Gates, fixed before this run: 1 holds exactly with CPT at the base phase; the vacuum with counters of 2
// or more clocks with period 24 and the one with 0 or 1 does not clock; E is exact in every sound run. The
// sound speeds, the vacuum periods of the hashed fills and the dressing are reported as measured.
//
// Depth L2: a constructed rule with its conservation laws checked exactly and its physics measured.

import { experiment } from '@/test/scaffold/suite'
import { verdict } from '@/test/scaffold/verdict'
import { colorLocalCollision } from '@/code/rule/color-local-weave'
import { turningWeave } from '@/code/rule/collision'
import { cptMirrorPhase, dressing } from '@/code/measure/weave-acceptance'
import { d4BoxCell, d4BoxMesh } from '@/code/substrate/d4-box'
import { d4Mesh } from '@/code/tool/mesh'
import { rootsD4 } from '@/code/algebra/group/root-system'
import { linearFit } from '@/code/measure/regression'
import { momentumOf } from '@/code/rule/momentum-weave'
import { buildScatterWeave, dockCollide, dockColor, HEAD_TURN_SPEC, scatterSchedule, type ScatterWeaveSpec } from '@/code/rule/scatter-weave'
import {
  demonFill,
  makePaidRoleWeave,
  makePaidWeave,
  paidBeat,
  paidEnergy,
  paidRoleBeat,
  paidRoleBeatBack,
  type PaidState,
} from '@/code/rule/paid-weave'
import { dampedCosineFit, momentumWaveAmplitude, momentumWaveStart, type WaveGeometry } from '@/code/measure/momentum-transport'

const GOLDEN = (Math.sqrt(5) - 1) / 2
const SOUND_SIDES = [12, 16, 20, 24]
const VACUUM_FILLS: readonly { readonly name: string; readonly uniform?: number; readonly fraction?: number }[] = [
  { name: 'uniform0', uniform: 0 },
  { name: 'uniform1', uniform: 1 },
  { name: 'uniform2', uniform: 2 },
  { name: 'uniform4', uniform: 4 },
  { name: 'fraction25', fraction: 0.25 },
  { name: 'fraction50', fraction: 0.5 },
  { name: 'fraction90', fraction: 0.9 },
]

function laws(spec: ScatterWeaveSpec) {
  const weave = makePaidRoleWeave({ side: 3, spec })
  const slots = weave.mesh.cellCount * 24
  const start = {
    vibe: Int8Array.from({ length: slots }, (_, i) => {
      const u = ((i + 1) * GOLDEN * 1.37) % 1

      return u < 0.3 ? -1 : u < 0.6 ? 0 : 1
    }),
    role: Int8Array.from({ length: slots }, (_, i) => Math.floor(((i + 3) * GOLDEN * 1.37 * 9) % 9)),
    flow: new Int32Array(slots),
    demon: demonFill({ docks: weave.mesh.cellCount, fraction: 0.5 }),
  }
  const e0 = paidEnergy(start)
  const q0 = start.vibe.reduce((a, b) => a + b, 0)
  const p0 = momentumOf(start.vibe).p

  let s = start
  let energyKept = true
  let chargeKept = true
  let pDrift = 0
  let leaks = 0
  let lowest = 0
  let made = 0

  for (let t = 0; t < 48; t++) {
    const vibe = Int8Array.from(s.vibe)
    const role = Int8Array.from(s.role)
    const demon = Int32Array.from(s.demon)

    for (let x = 0; x < weave.mesh.cellCount; x++) {
      const before = dockColor(vibe, role, x)

      dockCollide(weave.spec, weave.built, vibe, role, x * 24, t, true, undefined, demon)
      leaks += dockColor(vibe, role, x) === before ? 0 : 1
    }

    const n0 = s.vibe.reduce((a, b) => a + Math.abs(b), 0)

    s = paidRoleBeat(weave, s, t)
    made += Math.max(0, s.vibe.reduce((a, b) => a + Math.abs(b), 0) - n0)
    energyKept = energyKept && paidEnergy(s) === e0
    chargeKept = chargeKept && s.vibe.reduce((a, b) => a + b, 0) === q0
    pDrift = Math.max(pDrift, ...momentumOf(s.vibe).p.map((x, k) => Math.abs(x - (p0[k] ?? 0))))
    lowest = Math.min(lowest, ...s.demon)
  }

  for (let t = 47; t >= 0; t--) {
    s = paidRoleBeatBack(weave, s, t)
  }

  const reverses =
    s.vibe.every((x, i) => x === start.vibe[i]) &&
    s.role.every((x, i) => x === start.role[i]) &&
    s.flow.every((x, i) => x === start.flow[i]) &&
    s.demon.every((x, i) => x === start.demon[i])

  return { energyKept, chargeKept, pDrift, leaks, lowest, made, reverses }
}

// CPT at the collision level with counters: negated vibes, the same counters
function cptPhase(spec: ScatterWeaveSpec): number {
  const opposite = rootsD4().map((r, _, all) => all.findIndex(o => o.every((x, k) => x === -(r[k] ?? 0))))
  const built = buildScatterWeave(spec, opposite)

  for (let c = 0; c < 24; c++) {
    let holds = true

    for (let t = 0; t < 24 && holds; t++) {
      for (let n = 0; n < 200 && holds; n++) {
        const v = Int8Array.from({ length: 24 }, (_, i) => ((n * 31 + i * 7 + ((n * i) % 5)) % 3) - 1)
        const d = Int32Array.from({ length: 12 }, (_, i) => (n + i) % 4)
        const a = Int8Array.from(v)
        const da = Int32Array.from(d)
        const b = Int8Array.from(v, x => -x)
        const db = Int32Array.from(d)

        dockCollide(spec, built, a, undefined, 0, t, true, undefined, da)
        dockCollide(spec, built, b, undefined, 0, (((c - t) % 24) + 24) % 24, false, undefined, db)
        holds = b.every((x, k) => -x === a[k]) && db.every((x, k) => x === da[k])
      }
    }

    if (holds) {
      return c
    }
  }

  return -1
}

function vacuum(spec: ScatterWeaveSpec, fill: (typeof VACUUM_FILLS)[number]) {
  const mesh = d4BoxMesh({ side: 5 })
  const weave = makePaidWeave({ mesh, spec })
  const start: PaidState = { vibe: new Int8Array(mesh.cellCount * 24), demon: demonFill({ docks: mesh.cellCount, uniform: fill.uniform, fraction: fill.fraction }) }
  const key = (s: PaidState): string => `${s.vibe.join('')}|${s.demon.join(',')}`
  const first = key(start)

  let s = start
  let period = 0
  let tones = 0

  for (let t = 0; t < 480 && period === 0; t++) {
    s = paidBeat(weave, s, t)
    tones = Math.max(tones, s.vibe.reduce((a, b) => a + Math.abs(b), 0))

    if ((t + 1) % 24 === 0 && key(s) === first) {
      period = t + 1
    }
  }

  return { period, tones }
}

function sound(spec: ScatterWeaveSpec, side: number, uniform: number) {
  const geometry: WaveGeometry = { momentum: [1, 0, 0, 0], wave: [1, 0, 0, 0] }
  const mesh = d4Mesh({ side })
  const weave = makePaidWeave({ mesh, spec })
  const will = momentumWaveStart({ mesh, side, geometry, mode: 1, fill: 0.2, bias: 0.4, salt: 7 })

  let s: PaidState = { vibe: will.data, demon: demonFill({ docks: mesh.cellCount, uniform }) }

  const e0 = paidEnergy(s)
  const series = [momentumWaveAmplitude({ will: { mesh, data: s.vibe }, side, geometry, mode: 1 })]

  for (let t = 0; t < 144; t++) {
    s = paidBeat(weave, s, t)
    series.push(momentumWaveAmplitude({ will: { mesh, data: s.vibe }, side, geometry, mode: 1 }))
  }

  const s0 = series[0] ?? 1
  const fit = dampedCosineFit({ series: series.map(x => x / s0) })
  const k = (2 * Math.PI) / side

  return { side, k, omega: fit.omega, gamma: fit.gamma, r2: fit.r2, speed: fit.omega / k, energyKept: paidEnergy(s) === e0 }
}

// a lone love's dressing on the vacuum with counters at 2, as code/measure/weave-acceptance counts it
function paidDressing(spec: ScatterWeaveSpec): number[] {
  const mesh = d4BoxMesh({ side: 9 })
  const weave = makePaidWeave({ mesh, spec })
  const center = d4BoxCell({ coordinates: [4, 4, 4, 4], side: 9 })
  const largest = [0, 0, 0, 0]

  for (let d = 0; d < 24; d++) {
    let a: PaidState = { vibe: new Int8Array(mesh.cellCount * 24), demon: demonFill({ docks: mesh.cellCount, uniform: 2 }) }
    let b: PaidState = { vibe: Int8Array.from(a.vibe), demon: Int32Array.from(a.demon) }

    b.vibe[center * 24 + d] = 1

    for (let t = 0; t < 96; t++) {
      a = paidBeat(weave, a, t)
      b = paidBeat(weave, b, t)

      let diff = 0

      for (let i = 0; i < a.vibe.length; i++) {
        diff += a.vibe[i] === b.vibe[i] ? 0 : 1
      }

      const p = Math.floor(t / 24)

      largest[p] = Math.max(largest[p] ?? 0, diff)
    }
  }

  return largest
}

export default experiment({
  id: 'fluids/paid-clock-energy',
  code: 'E-FLD-0028',
  title:
    'a pair clock paid from per-line demons keeps an exact energy (tones plus counters) with the pair clock: reversal, charge, P, local color and CPT at the base phase all exact, the vacuum clocking with period 24 when every line holds at least the pair mass 2 and not at all below it; but the energy does not buy sound where the clock runs: with counters of 2 the longitudinal wave slows as k shrinks (omega about k^1.89, speed 0.70 to 0.38 from L = 12 to 24), a mode that does not propagate at long wavelength, and a lone love sets off a pair avalanche (89,010 slots by the fourth period against 1,508); with the counters empty the clock cannot start and the wave rings, extrapolating to 0.66',
  category: 'fluids',
  substrates: ['3434'],
  depth: 'L2',
  paper: false,
  run() {
    const mirror = cptMirrorPhase((o, f) => colorLocalCollision({ spec: HEAD_TURN_SPEC, opposite: o, forward: f }))
    const spec: ScatterWeaveSpec = { base: HEAD_TURN_SPEC, mirror, sets: scatterSchedule({ partitions: 2, pairs: 3 }), condition: 'matched' }

    const law = laws(spec)
    const cpt = cptPhase(spec)
    const vacua = VACUUM_FILLS.map(fill => ({ name: fill.name, uniform: fill.uniform, ...vacuum(spec, fill) }))
    const quiet = SOUND_SIDES.map(side => sound(spec, side, 0))
    const clocked = SOUND_SIDES.map(side => sound(spec, side, 2))
    const quietExtrapolation = linearFit({ xs: quiet.map(w => w.k * w.k), ys: quiet.map(w => w.speed) })
    const clockedLaw = linearFit({ xs: clocked.map(w => Math.log(w.k)), ys: clocked.map(w => Math.log(w.omega)) })
    const dress = paidDressing(spec)
    const committedDressing = dressing((o, f) => turningWeave({ opposite: o, forward: f }), { tone: 1 }).periodLargest

    const vacuumGate = vacua
      .filter(v => v.uniform !== undefined)
      .every(v => ((v.uniform ?? 0) >= 2 ? v.period === 24 && v.tones > 0 : v.tones === 0))

    const ok =
      law.energyKept &&
      law.chargeKept &&
      law.pDrift === 0 &&
      law.leaks === 0 &&
      law.lowest >= 0 &&
      law.reverses &&
      cpt === mirror &&
      vacuumGate &&
      [...quiet, ...clocked].every(w => w.energyKept)

    const metrics: Record<string, number> = {
      energyKept: law.energyKept ? 1 : 0,
      chargeKept: law.chargeKept ? 1 : 0,
      momentumDrift: law.pDrift,
      colorLeaks: law.leaks,
      lowestCounter: law.lowest,
      tonesMadeInLawRun: law.made,
      reverses: law.reverses ? 1 : 0,
      cptMirrorPhase: cpt,
      baseMirrorPhase: mirror,
      quietSpeedAtZeroK: quietExtrapolation.intercept,
      clockedOmegaExponent: clockedLaw.slope,
      halfC: Math.SQRT1_2,
    }

    vacua.forEach(v => {
      metrics[`vacuumPeriod_${v.name}`] = v.period
      metrics[`vacuumLargestToneCount_${v.name}`] = v.tones
    })
    quiet.forEach(w => {
      metrics[`quietSpeedL${w.side}`] = w.speed
      metrics[`quietGammaL${w.side}`] = w.gamma
      metrics[`quietR2L${w.side}`] = w.r2
    })
    clocked.forEach(w => {
      metrics[`clockedSpeedL${w.side}`] = w.speed
      metrics[`clockedOmegaL${w.side}`] = w.omega
      metrics[`clockedGammaL${w.side}`] = w.gamma
      metrics[`clockedR2L${w.side}`] = w.r2
    })
    dress.forEach((v, p) => (metrics[`loveSupportPeriod${p + 1}`] = v))

    return verdict({
      status: ok ? 'pass' : 'fail',
      claim:
        'energy, charge and P exact every beat, no color leak, no counter below zero, reversal of vibes, role points, flows and counters exact, CPT with counters at the base mirror phase; the vacuum with counters of 2 or 4 on every line clocks with period 24 and with 0 or 1 does not clock; energy exact in every sound run. The sound speeds, the hashed-fill vacua and the dressing are reported',
      metrics,
      control: Object.fromEntries(committedDressing.map((v, p) => [`committedLoveSupportPeriod${p + 1}`, v])),
      notes:
        'L2, exact, no random numbers. THE ENERGY: a demon per line escapes the additive-energy proof of E-FLD-0027 because it is a second kind of variable that does not stream; the paid clock is a bijection on (wire state, counter) for the bind cycle, a calm wire whose counter holds less than 2 staying calm, so reversal is exact, and negation leaves counters alone, so CPT holds where it held. THE VACUUM: with the same counter on every line the vacuum stays the same in every dock and clocks exactly as the unpaid one does, period 24, when that counter is at least 2 (a pair made in one dock annihilates in another, but every dock is alike, so every counter is paid back); with 0 or 1 nothing is made, and the empty state stands still (its "period" of 24 is a state that never changes). Hashed fills, 2 on a quarter, half or 90 percent of the lines, make a vacuum that is no longer the same in every dock; it did not return within 480 beats (reversible and finite, so it returns eventually, but not within any period the gates use). SOUND: the counters are energy that does not move, so they join the density the momentum pushes against without adding to the pressure. With counters empty at the start the clock is idle and a wave rings as on the flip table, its speed 0.79 to 0.69 from L = 12 to 24, extrapolating to 0.66 in k^2, below the c / 2 = 0.707 of E-FLD-0027 as annihilations fill the counters. With counters of 2 everywhere, the clocking vacuum, the fitted speed keeps falling as k shrinks, omega about k^1.89 over L = 12 to 24, so there is no sound speed at long wavelength on any mesh run here: the energy moves more like a diffusing density than a wave. DRESSING: on the clocking vacuum a lone love sets off a pair avalanche, 38, 124, 818 and 89,010 slots by period against the committed 33, 160, 565, 1,508 (E-FLD-0029 shows the support is pairs). So the demon escapes the proof but not the fork: energy and the clocking vacuum coexist exactly, while sound and a quiet vacuum response do not come with them in this rule.',
    })
  },
})
