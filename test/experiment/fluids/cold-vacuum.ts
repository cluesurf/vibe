// A cold vacuum with a kinetic threshold: energy, a quiet vacuum, sound and a viscosity on one rule.
//
// E-FLD-0028 kept an exact energy by paying the pair clock from per-line demons, but only a hot vacuum (a
// counter of 2 on every line) clocks, and it answers a lone love with a pair avalanche (E-FLD-0029). The
// true vacuum is cold: nothing is lying around to pay for a pair. code/rule/cold-weave keeps the paid clock
// with every counter empty, gives each tone a kinetic store that streams with it, and adds the threshold:
// two tones head on, each bringing at least one unit of kinetic energy, make a real pair on a calm line,
// and the reverse. It keeps E = sum of (1 + store) over tones + counters, P, and the energy current P_E.
// The rule is the viscous scatter weave of E-FLD-0026 (head-on turn base, matched condition, 36
// scatterings a beat), with scattering and the head-on exchange taken only between tones of equal store
// so that P_E is kept.
//
// Measured on this one rule:
// 1. the exact laws (side 3, dense tones with stores 0 to 2, role points, empty counters, 48 beats): E, P,
//    P_E, charge, no color leak, no store or counter below zero, reversal of vibes, stores, counters, role
//    points and flows, and CPT at the collision level with stores and counters, over all 24 phases;
// 2. THE THRESHOLD: two tones sent head on through one dock (side 7, every direction and every beat of the
//    period, 576 collisions each) with stores (0, 0), (0, 2), (1, 1), (2, 2) and (1, 3); a collision made a
//    pair if the tone count rises within four beats;
// 3. THE COLD VACUUM: born empty with empty counters it never changes (side 5, 48 beats), and a lone love
//    on it, with store 0 or 5, on every direction (side 9, 96 beats), never differs from the vacuum in more
//    than the one slot it occupies;
// 4. SOUND: a longitudinal wave in a gas below threshold (fill 0.2, every store 0, counters empty) on d4Mesh
//    at L = 12, 16, 20 and 24, 144 beats, damped-cosine fit, the speed extrapolated to k = 0 in k^2 against
//    c / 2 = 1 / sqrt 2; the speed along axis 2 and the diagonal (1, 1, 0, 0) at L = 16 and 22; the share of
//    the energy parked in counters and in stores at the end;
// 5. HYDRODYNAMICS: a transverse wave in the same gas at L = 12, 16, 20 and 24 (mode 1) and L = 20
//    (mode 2), 60 beats, decay rate by the exponential window, nu = Gamma / k^2, the exponent of Gamma
//    against k, and nu along five orientations at L = 16.
// Control: the same threshold on the flip table (no clock, so no counter ever holds energy), sound and
// shear at L = 12 to 20.
//
// Gates, fixed before this run: 1 exact with CPT at the base phase; no pair below threshold ((0, 0) and
// (0, 2) make none) and pairs above it ((1, 1), (2, 2), (1, 3) make some); 3 exact (the vacuum still, the
// lone love's support 1 at every beat); E exact in every run; nu constant to within 10 percent from L = 12
// to 24 with r2 above 0.99 and the exponent within 0.2 of 2; every sound run oscillates below the streaming
// speed. The extrapolated speed, the anisotropies and the control are reported.
//
// Depth L2: a constructed rule with its conservation laws checked exactly and its physics measured.

import { experiment } from '@/test/scaffold/suite'
import { verdict } from '@/test/scaffold/verdict'
import { colorLocalCollision } from '@/code/rule/color-local-weave'
import { cptMirrorPhase } from '@/code/measure/weave-acceptance'
import { d4BoxCell, d4BoxMesh } from '@/code/substrate/d4-box'
import { d4Mesh } from '@/code/tool/mesh'
import { rootsD4 } from '@/code/algebra/group/root-system'
import { linearFit } from '@/code/measure/regression'
import { slopeError } from '@/code/measure/charge-mode'
import { decayRateFit } from '@/code/measure/shear-mode'
import { FLIP_TABLE } from '@/code/rule/momentum-weave'
import { dockColor, HEAD_TURN_SPEC, scatterSchedule, type ScatterWeaveSpec } from '@/code/rule/scatter-weave'
import { coldBeat, coldBeatBack, coldDockCollide, coldEnergy, coldMomenta, makeColdWeave, type ColdState } from '@/code/rule/cold-weave'
import { dampedCosineFit, momentumWaveAmplitude, momentumWaveStart, type WaveGeometry } from '@/code/measure/momentum-transport'

const GOLDEN = (Math.sqrt(5) - 1) / 2

const ORIENTATIONS: readonly (readonly [string, WaveGeometry])[] = [
  ['axes01', { momentum: [1, 0, 0, 0], wave: [0, 1, 0, 0] }],
  ['axes23', { momentum: [0, 0, 1, 0], wave: [0, 0, 0, 1] }],
  ['axes12', { momentum: [0, 1, 0, 0], wave: [0, 0, 1, 0] }],
  ['diagonal01', { momentum: [1, 1, 0, 0], wave: [1, -1, 0, 0] }],
  ['diagonal23', { momentum: [0, 0, 1, 1], wave: [0, 0, 1, -1] }],
]

function specFor(base: ScatterWeaveSpec['base']): ScatterWeaveSpec {
  const mirror = cptMirrorPhase((o, f) => colorLocalCollision({ spec: base, opposite: o, forward: f }))

  return { base, mirror, sets: scatterSchedule({ partitions: 2, pairs: 3 }), condition: 'matched' }
}

function laws(spec: ScatterWeaveSpec) {
  const weave = makeColdWeave({ side: 3, spec, roles: true })
  const n = weave.mesh.cellCount * 24
  const vibe = Int8Array.from({ length: n }, (_, i) => {
    const u = ((i + 1) * GOLDEN * 1.37) % 1

    return u < 0.3 ? -1 : u < 0.6 ? 0 : 1
  })
  const start: ColdState = {
    vibe,
    store: Int32Array.from({ length: n }, (_, i) => (vibe[i] === 0 ? 0 : Math.floor((((i + 7) * GOLDEN * 2.3) % 1) * 3))),
    demon: new Int32Array(weave.mesh.cellCount * 12),
    role: Int8Array.from({ length: n }, (_, i) => Math.floor(((i + 3) * GOLDEN * 1.37 * 9) % 9)),
    flow: new Int32Array(n),
  }
  const e0 = coldEnergy(start)
  const m0 = coldMomenta(start)
  const q0 = vibe.reduce((a, b) => a + b, 0)

  let s = start
  let exact = true
  let leaks = 0
  let lowest = 0
  let made = 0

  for (let t = 0; t < 48; t++) {
    const a = { vibe: Int8Array.from(s.vibe), store: Int32Array.from(s.store), demon: Int32Array.from(s.demon), role: Int8Array.from(s.role ?? []) }

    for (let x = 0; x < weave.mesh.cellCount; x++) {
      const before = dockColor(a.vibe, a.role, x)

      coldDockCollide(weave, a, x * 24, t, true)
      leaks += dockColor(a.vibe, a.role, x) === before ? 0 : 1
    }

    const n0 = s.vibe.reduce((c, v) => c + Math.abs(v), 0)

    s = coldBeat(weave, s, t)
    made += Math.max(0, s.vibe.reduce((c, v) => c + Math.abs(v), 0) - n0)

    const m = coldMomenta(s)

    exact =
      exact &&
      coldEnergy(s) === e0 &&
      s.vibe.reduce((a, b) => a + b, 0) === q0 &&
      m.p.every((x, k) => x === m0.p[k]) &&
      m.pe.every((x, k) => x === m0.pe[k])
    lowest = Math.min(lowest, ...s.demon, ...s.store)
  }

  for (let t = 47; t >= 0; t--) {
    s = coldBeatBack(weave, s, t)
  }

  const same = (x: ArrayLike<number> | undefined, y: ArrayLike<number> | undefined): boolean =>
    x !== undefined && y !== undefined && Array.from(x).every((v, i) => v === y[i])
  const reverses = same(s.vibe, start.vibe) && same(s.store, start.store) && same(s.demon, start.demon) && same(s.role, start.role) && same(s.flow, start.flow)

  return { exact, leaks, lowest, made, reverses }
}

function cptPhase(spec: ScatterWeaveSpec): number {
  const weave = makeColdWeave({ mesh: d4BoxMesh({ side: 3 }), spec })

  for (let c = 0; c < 24; c++) {
    let holds = true

    for (let t = 0; t < 24 && holds; t++) {
      for (let k = 0; k < 150 && holds; k++) {
        const v = Int8Array.from({ length: 24 }, (_, i) => ((k * 31 + i * 7 + ((k * i) % 5)) % 3) - 1)
        const store = Int32Array.from({ length: 24 }, (_, i) => (v[i] === 0 ? 0 : (k + i) % 3))
        const demon = Int32Array.from({ length: 12 }, (_, i) => (k + i) % 4)
        const a = { vibe: Int8Array.from(v), store: Int32Array.from(store), demon: Int32Array.from(demon), role: undefined }
        const b = { vibe: Int8Array.from(v, x => -x), store: Int32Array.from(store), demon: Int32Array.from(demon), role: undefined }

        coldDockCollide(weave, a, 0, t, true)
        coldDockCollide(weave, b, 0, (((c - t) % 24) + 24) % 24, false)
        holds = b.vibe.every((x, i) => -x === a.vibe[i]) && b.store.every((x, i) => x === a.store[i]) && b.demon.every((x, i) => x === a.demon[i])
      }
    }

    if (holds) {
      return c
    }
  }

  return -1
}

function thresholdRuns(spec: ScatterWeaveSpec, stores: readonly [number, number]): { pairs: number; collisions: number; energyExact: boolean } {
  const side = 7
  const mesh = d4BoxMesh({ side })
  const weave = makeColdWeave({ mesh, spec })
  const roots = rootsD4()
  const m = d4BoxCell({ coordinates: [3, 3, 3, 3], side })

  let pairs = 0
  let collisions = 0
  let energyExact = true

  for (let d = 0; d < 24; d++) {
    const o = roots.findIndex(r => r.every((x, k) => x === -(roots[d]?.[k] ?? 0)))

    for (let phase = 0; phase < 24; phase++) {
      let s: ColdState = { vibe: new Int8Array(mesh.cellCount * 24), store: new Int32Array(mesh.cellCount * 24), demon: new Int32Array(mesh.cellCount * 12) }

      s.vibe[mesh.neighbour(m, o) * 24 + d] = 1
      s.store[mesh.neighbour(m, o) * 24 + d] = stores[0]
      s.vibe[mesh.neighbour(m, d) * 24 + o] = 1
      s.store[mesh.neighbour(m, d) * 24 + o] = stores[1]

      const e0 = coldEnergy(s)
      let tones = 0

      for (let t = 0; t < 4; t++) {
        s = coldBeat(weave, s, phase + t)
        tones = Math.max(tones, s.vibe.reduce((c, v) => c + Math.abs(v), 0))
      }

      collisions++
      pairs += tones > 2 ? 1 : 0
      energyExact = energyExact && coldEnergy(s) === e0
    }
  }

  return { pairs, collisions, energyExact }
}

function coldVacuum(spec: ScatterWeaveSpec): { still: boolean; loneLargest: number } {
  const small = d4BoxMesh({ side: 5 })
  const smallWeave = makeColdWeave({ mesh: small, spec })

  let v: ColdState = { vibe: new Int8Array(small.cellCount * 24), store: new Int32Array(small.cellCount * 24), demon: new Int32Array(small.cellCount * 12) }
  let still = true

  for (let t = 0; t < 48; t++) {
    v = coldBeat(smallWeave, v, t)
    still = still && v.vibe.every(x => x === 0) && v.demon.every(x => x === 0)
  }

  const mesh = d4BoxMesh({ side: 9 })
  const weave = makeColdWeave({ mesh, spec })
  const center = d4BoxCell({ coordinates: [4, 4, 4, 4], side: 9 })

  let loneLargest = 0

  for (const store of [0, 5]) {
    for (let d = 0; d < 24; d++) {
      let s: ColdState = { vibe: new Int8Array(mesh.cellCount * 24), store: new Int32Array(mesh.cellCount * 24), demon: new Int32Array(mesh.cellCount * 12) }

      s.vibe[center * 24 + d] = 1
      s.store[center * 24 + d] = store

      for (let t = 0; t < 96; t++) {
        s = coldBeat(weave, s, t)
        loneLargest = Math.max(loneLargest, s.vibe.reduce((c, x) => c + Math.abs(x), 0))
      }
    }
  }

  return { still, loneLargest }
}

function wave(spec: ScatterWeaveSpec, side: number, geometry: WaveGeometry, beats: number, mode = 1) {
  const mesh = d4Mesh({ side })
  const weave = makeColdWeave({ mesh, spec })
  const will = momentumWaveStart({ mesh, side, geometry, mode, fill: 0.2, bias: 0.4, salt: 7 })

  let s: ColdState = { vibe: will.data, store: new Int32Array(will.data.length), demon: new Int32Array(mesh.cellCount * 12) }

  const e0 = coldEnergy(s)
  const series = [momentumWaveAmplitude({ will: { mesh, data: s.vibe }, side, geometry, mode })]

  for (let t = 0; t < beats; t++) {
    s = coldBeat(weave, s, t)
    series.push(momentumWaveAmplitude({ will: { mesh, data: s.vibe }, side, geometry, mode }))
  }

  const k = (2 * Math.PI * mode * Math.hypot(...geometry.wave)) / side
  const counters = s.demon.reduce((a, b) => a + b, 0)
  const stores = s.vibe.reduce((a, v, i) => a + (v === 0 ? 0 : (s.store[i] ?? 0)), 0)

  return { side, k, series, energyExact: coldEnergy(s) === e0, counterShare: counters / e0, storeShare: stores / e0 }
}

function sound(spec: ScatterWeaveSpec, side: number, geometry: WaveGeometry = { momentum: [1, 0, 0, 0], wave: [1, 0, 0, 0] }) {
  const w = wave(spec, side, geometry, 144)
  const s0 = w.series[0] ?? 1
  const fit = dampedCosineFit({ series: w.series.map(x => x / s0) })

  return { ...w, speed: fit.omega / w.k, gamma: fit.gamma, r2: fit.r2, oscillates: fit.omega > fit.gamma && fit.r2 > 0.9 }
}

function shear(spec: ScatterWeaveSpec, side: number, geometry: WaveGeometry = { momentum: [1, 0, 0, 0], wave: [0, 1, 0, 0] }, mode = 1) {
  const w = wave(spec, side, geometry, 60, mode)
  const fit = decayRateFit({ series: w.series })

  return { ...w, mode, gamma: fit.gamma, r2: fit.r2, nu: fit.gamma / (w.k * w.k) }
}

export default experiment({
  id: 'fluids/cold-vacuum',
  code: 'E-FLD-0032',
  title:
    'a cold vacuum with a kinetic threshold has energy, a quiet vacuum, sound and a viscosity on one rule: tones carry kinetic stores, two tones head on make a real pair only when each brings a unit (0 of 576 collisions below, 288 of 576 above), the empty vacuum never changes and a lone love never makes anything, and a gas below threshold rings at 0.694 extrapolated to k = 0 (2 percent under c / 2) and relaxes a shear as nu k^2 with nu = 0.56 constant to 7 percent from L = 12 to 24 (exponent 1.95), with energy, P, the energy current, charge, local color, reversal and CPT exact; the viscosity is anisotropic by 12',
  category: 'fluids',
  substrates: ['3434'],
  depth: 'L2',
  paper: false,
  run() {
    const spec = specFor(HEAD_TURN_SPEC)
    const flip = specFor({ ...HEAD_TURN_SPEC, tables: [FLIP_TABLE] })

    const law = laws(spec)
    const cpt = cptPhase(spec)
    const thresholds = ([
      [0, 0],
      [0, 2],
      [1, 1],
      [2, 2],
      [1, 3],
    ] as const).map(stores => ({ stores, ...thresholdRuns(spec, stores) }))
    const vacuum = coldVacuum(spec)

    const sounds = [12, 16, 20, 24].map(side => sound(spec, side))
    const extrapolation = linearFit({ xs: sounds.map(s => s.k * s.k), ys: sounds.map(s => s.speed) })
    const soundDirections = [
      { name: 'axis0', ...(sounds[1] ?? sound(spec, 16)) },
      { name: 'axis2', ...sound(spec, 16, { momentum: [0, 0, 1, 0], wave: [0, 0, 1, 0] }) },
      { name: 'diagonal01', ...sound(spec, 22, { momentum: [1, 1, 0, 0], wave: [1, 1, 0, 0] }) },
    ]
    const speedSpread = Math.max(...soundDirections.map(s => s.speed)) / Math.min(...soundDirections.map(s => s.speed))

    const shears = [12, 16, 20, 24].map(side => shear(spec, side))
    const modeTwo = shear(spec, 20, undefined, 2)
    const allShears = [...shears, modeTwo]
    const xs = allShears.map(r => Math.log(r.k))
    const ys = allShears.map(r => Math.log(r.gamma))
    const exponentFit = linearFit({ xs, ys })
    const exponentError = slopeError(xs, ys, exponentFit.slope, exponentFit.intercept)
    const nus = shears.map(r => r.nu)
    const nuSpread = Math.max(...nus) / Math.min(...nus)
    const oriented = ORIENTATIONS.map(([name, geometry]) => ({ name, ...(name === 'axes01' ? (shears[1] ?? shear(spec, 16)) : shear(spec, 16, geometry)) }))
    const anisotropy = Math.max(...oriented.map(o => o.nu)) / Math.min(...oriented.map(o => o.nu))

    const flipSounds = [12, 16, 20].map(side => sound(flip, side))
    const flipShears = [12, 16, 20].map(side => shear(flip, side))

    const thresholdGate =
      thresholds.every(r => r.energyExact) &&
      thresholds.filter(r => r.stores[0] < 1 || r.stores[1] < 1).every(r => r.pairs === 0) &&
      thresholds.filter(r => r.stores[0] >= 1 && r.stores[1] >= 1).every(r => r.pairs > 0)
    const everyRun = [...sounds, ...soundDirections, ...allShears, ...oriented, ...flipSounds, ...flipShears]

    const ok =
      law.exact &&
      law.leaks === 0 &&
      law.lowest >= 0 &&
      law.reverses &&
      cpt === spec.mirror &&
      thresholdGate &&
      vacuum.still &&
      vacuum.loneLargest === 1 &&
      everyRun.every(r => r.energyExact) &&
      nuSpread <= 1.1 &&
      shears.every(r => r.r2 > 0.99) &&
      Math.abs(exponentFit.slope - 2) <= 0.2 &&
      sounds.every(s => s.oscillates && s.speed < 1)

    const metrics: Record<string, number> = {
      lawsExact: law.exact ? 1 : 0,
      colorLeaks: law.leaks,
      lowestStoreOrCounter: law.lowest,
      tonesMadeInLawRun: law.made,
      reverses: law.reverses ? 1 : 0,
      cptMirrorPhase: cpt,
      baseMirrorPhase: spec.mirror,
      coldVacuumStill: vacuum.still ? 1 : 0,
      loneLoveLargestToneCount: vacuum.loneLargest,
      speedAtZeroK: extrapolation.intercept,
      halfC: Math.SQRT1_2,
      speedSpread,
      nuSpreadL12to24: nuSpread,
      nuMean: nus.reduce((a, b) => a + b, 0) / nus.length,
      exponent: exponentFit.slope,
      exponentError,
      anisotropy,
    }

    thresholds.forEach(r => {
      metrics[`pairsFromStores${r.stores[0]}${r.stores[1]}`] = r.pairs
      metrics[`collisionsStores${r.stores[0]}${r.stores[1]}`] = r.collisions
    })
    sounds.forEach(s => {
      metrics[`soundSpeedL${s.side}`] = s.speed
      metrics[`soundGammaL${s.side}`] = s.gamma
      metrics[`soundR2L${s.side}`] = s.r2
      metrics[`counterShareSoundL${s.side}`] = s.counterShare
      metrics[`storeShareSoundL${s.side}`] = s.storeShare
    })
    soundDirections.forEach(s => (metrics[`soundSpeed_${s.name}`] = s.speed))
    allShears.forEach(r => {
      metrics[`nuL${r.side}M${r.mode}`] = r.nu
      metrics[`gammaL${r.side}M${r.mode}`] = r.gamma
      metrics[`r2L${r.side}M${r.mode}`] = r.r2
    })
    oriented.forEach(o => (metrics[`nu_${o.name}`] = o.nu))

    const control: Record<string, number> = {}

    flipSounds.forEach(s => {
      control[`flipSoundSpeedL${s.side}`] = s.speed
      control[`flipStoreShareL${s.side}`] = s.storeShare
    })
    flipShears.forEach(r => (control[`flipNuL${r.side}`] = r.nu))

    return verdict({
      status: ok ? 'pass' : 'fail',
      claim:
        'the exact laws hold with CPT at the base phase; stores (0, 0) and (0, 2) make no pair and (1, 1), (2, 2), (1, 3) make pairs, energy exact in every threshold run; the cold vacuum never changes and a lone love of store 0 or 5 stays one tone; energy exact in every run; nu constant to within 10 percent over L = 12 to 24 with r2 above 0.99 and the exponent within 0.2 of 2; every sound run oscillates below streaming',
      metrics,
      control,
      notes:
        'L2, exact, no random numbers. THE THRESHOLD is per tone: each head-on tone must bring at least one unit, so (0, 2), two units in all, makes nothing; it fires in half the (direction, beat) cases because the tones must sit on the line of a couple whose wire is calm at that beat. THE QUIET VACUUM is structural: every move needs two tones in a dock or a counter holding 2, so one tone on an empty, cold vacuum only streams; a lone love cannot avalanche whatever its store. The price is the gate the committed knit was adopted by: a lone tone on this vacuum meets nothing, so its line graph falls into twelve pieces, as for the flip table (E-FLD-0027). SOUND: the gas starts below threshold (every store 0), yet pairs that annihilate on a wire refund their mass to that line (4 to 5 percent of the energy ends in counters) and pairs unmade by the threshold give stores (3 to 7 percent); the speed falls from 0.80 at L = 12 to 0.716 at L = 24 and extrapolates to 0.694, against c / 2 = 0.707 and the 0.710 of the counter-free flip table (E-FLD-0027): the parked energy slows it by about 2 percent. The speed differs by direction (0.765 axis 0, 0.736 axis 2, 0.668 on the diagonal at a slightly larger k), a spread of 1.15. HYDRODYNAMICS as in E-FLD-0026: nu = 0.535, 0.565, 0.566, 0.574 at L = 12 to 24 and 0.561 at L = 20 mode 2, exponent 1.952 +- 0.032, but strongly anisotropic: nu along axes 2 and 3 is 0.047, a twelfth of axes 0 and 1. CONTROL, the threshold on the flip table: no counter ever holds energy, but the threshold keeps turning pairs into stores, and scattering, which needs equal stores, thins out: sound 0.85 to 0.78 and nu drifting 0.56 to 0.64 over L = 12 to 20. So the paid clock with empty counters, not its absence, is what keeps the gas collisional.',
    })
  },
})
