// The light battery of E-FRC-0181, generalized to any force rule, for the shaped carried-remainder forms
// (code/rule/photon-shaped, E-FRC-0184 and E-FRC-0185). Each section is the E-FRC-0181 protocol of the same
// letter, on the side-8 box unless named otherwise, and every rule is run beside the E-FRC-0164 table rule,
// the E-FRC-0181 first-order remainder and the floating-point linear leapfrog from the same integer start.
//
// A. reversibility: the pay arithmetic exhaustively, then the lattice forward and back, Gauss's law on every
//    beat, and a Z_N frame change that commutes with the beat
// B, C. coherent husk waves from |B| 1 to 1024, read by the three-point recurrence on the husk flux
// D. the hot field on the husk: the lagged and difference estimators and the autocorrelation zero crossing
// E. a love and a fear at r = 1 on the husk, the averaged field against the linear rule's
// F. heating: the shadow energy's growth on the E-FRC-0164 start (side 4) and its drift on the hot start
// S. (wave form) the shadow: A + C^T u_(t-2) and E + C^T (u_(t-1) - u_(t-2)) against the linear leapfrog
// H. the carried integers from the angle history alone

import {
  addHashedCurl,
  changePhotonFrame,
  emptyPhotonState,
  makePhotonRule,
  photonBeatInPlace,
  photonGaussViolations,
  photonLatticeD4,
  photonLink,
  placePairAlong,
  plaquetteField,
  setHashedAngles,
  type PhotonLattice,
  type PhotonRule,
  type PhotonState,
} from '@/code/rule/photon-links'
import { emptyRemainderState, makeRemainderRule, remainderBeatInPlace } from '@/code/rule/photon-remainder'
import {
  copyShapedState,
  emptyShapedState,
  makeShapedRule,
  payBack,
  payForward,
  shapedBeatBackInPlace,
  shapedBeatInPlace,
  waveShadow,
  type ShapedForm,
  type ShapedRule,
  type ShapedState,
} from '@/code/rule/photon-shaped'
import {
  accumulate,
  accumulateCross,
  difference,
  leapfrogOmega,
  linearWaveEigenvalues,
  makeCorrelator,
  modeFrequencies,
  modeReader,
  type Correlator,
  type ModeFrequencies,
  type ModeVector,
} from '@/code/measure/photon-modes'
import { bulkModeOfHusk, columnSum, HUSK_VECTORS, huskCoulomb, huskEnergy, makeHusk, projectLinks, type Husk } from '@/code/measure/photon-husk'
import { centered, makeLinearLeapfrog } from '@/code/measure/photon-symbol'
import { autocorrelationFirstZero, huskPhase, huskPhotons, launchWave, modeProjector, threePoint, type Photon } from '@/code/measure/photon-wave'
import { GOLDEN } from '@/code/tool/weyl'

export const N = 8192
export const K = 80
export const Q = 65536
export const KAPPA = Math.round(((2 * Math.PI * K) / N) * Q) / Q
export const E164_KAPPA = (2 * Math.PI * K) / N
const BETA = 3
const LAG = 3
const DOUBLING = [1.6, 2.1] as const
const WAVE_BEATS = 300

const mean = (xs: readonly number[]): number => xs.reduce((a, b) => a + b, 0) / Math.max(1, xs.length)
const modulo = (x: number, m: number): number => ((x % m) + m) % m
const q2 = (w: number): number => 4 * Math.sin(w / 2) ** 2

export type Kind = ShapedForm | 'remainder' | 'e164' | 'linear'

export type Stepper = {
  readonly flux: ArrayLike<number>
  readonly angle: ArrayLike<number>
  beat(): void
  // the wave form's shadow flux, E + C^T (u_(t-1) - u_(t-2))
  shadowFlux?: () => Float64Array
  readonly base: PhotonRule
  readonly shaped?: { rule: ShapedRule; state: ShapedState }
}

export type Start = (base: PhotonRule, state: PhotonState) => void

const viewOf = (s: { vibe: Int8Array; angle: Int32Array; flux: Int32Array }): PhotonState => ({ vibe: s.vibe, angle: s.angle, flux: s.flux, demon: new Int32Array(s.flux.length) })

// a stepper of any kind from an integer start on the lattice
export function build(kind: Kind, lattice: PhotonLattice, input: { start: Start; charge?: number; dither?: 'zero' | 'weyl'; notch?: number }): Stepper {
  const charge = input.charge ?? 1
  const dither = input.dither ?? 'weyl'

  if (kind === 'e164' || kind === 'linear') {
    const base = makePhotonRule({ lattice, n: N, k: K, capacity: 0, hop: false, charge })
    const s = emptyPhotonState(base)

    input.start(base, s)

    if (kind === 'e164') {
      let t = 0

      return { flux: s.flux, angle: s.angle, base, beat: () => void photonBeatInPlace(base, s, t++) }
    }

    const angle = Float64Array.from(s.angle, x => centered(x, N))
    const flux = Float64Array.from(s.flux)
    const step = makeLinearLeapfrog(lattice, KAPPA)

    return { flux, angle, base, beat: () => step.beat(angle, flux) }
  }

  if (kind === 'remainder') {
    const rule = makeRemainderRule({ lattice, n: N, k: K, q: Q, form: 'linear', charge })
    const s = emptyRemainderState(rule, dither)

    input.start(rule.base, viewOf(s))

    return { flux: s.flux, angle: s.angle, base: rule.base, beat: () => remainderBeatInPlace(rule, s) }
  }

  const rule = makeShapedRule({ lattice, n: N, k: K, q: Q, form: kind, charge, notch: input.notch })
  const s = emptyShapedState(rule, dither)

  input.start(rule.base, viewOf(s))

  return {
    flux: s.flux,
    angle: s.angle,
    base: rule.base,
    shaped: { rule, state: s },
    beat: () => shapedBeatInPlace(rule, s),
    shadowFlux: kind === 'wave' ? () => waveShadow(rule, s).flux : undefined,
  }
}

// the E-FRC-0164 start: love-fear pairs on hashed neighboring docks joined by one unit of flux, hashed angles
// within 512, hashed transverse flux within 181
export const start164: Start = (rule, s) => {
  const { lattice } = rule
  const scale = 1.37

  for (let x = 0; x < lattice.cells; x++) {
    const u = ((x + 1) * GOLDEN * scale) % 1
    const d = Math.floor(((x + 2) * GOLDEN * scale * 24) % 24)
    const y = lattice.neighbour[x * lattice.degree + d] ?? 0

    if (u < 0.3 && s.vibe[x] === 0 && s.vibe[y] === 0 && x !== y) {
      const v = u < 0.15 ? 1 : -1
      const [l, sign] = photonLink(lattice, x, d)

      s.vibe[x] = v
      s.vibe[y] = -v
      s.flux[l] = (s.flux[l] ?? 0) + sign * v * rule.charge
    }
  }

  setHashedAngles(rule, s, 512, 3.7 * scale)
  addHashedCurl(rule, s, 181, 5.3 * scale)
}

// the E-FRC-0165 / 0169 hashed start at beta 3
export const hotStart: Start = (rule, s) => {
  const target = (rule.k * rule.n) / (2 * Math.PI * BETA)

  addHashedCurl(rule, s, Math.max(1, Math.round(Math.sqrt((3 * target) / 4))), 5.3)
}

const differing = (a: ArrayLike<number>, b: ArrayLike<number>): number => {
  let n = 0

  for (let i = 0; i < a.length; i++) {
    n += a[i] === b[i] ? 0 : 1
  }

  return n
}

// A. reversibility

// A1: the pay arithmetic, exhaustively. For every table value p centered(B), B in 0 .. N - 1, and every
// value 0 .. q - 1 of the carried integer the kick drops, with the other carried terms a golden Weyl offset
// per B: forward f and U_t, then backward from U_t, f and the dropped value both recovered and U_t in [0, q)
export function exhaustivePay(last: 1 | -1): { checked: number; failures: number } {
  const p = Math.round(KAPPA * Q)

  let failures = 0
  let checked = 0

  for (let b = 0; b < N; b++) {
    const offset = Math.floor(((b + 1) * GOLDEN) % 1 * 8 * Q) - 4 * Q
    const y = p * centered(b, N) + offset

    for (let dropped = 0; dropped < Q; dropped++) {
      const x = y + last * dropped
      const f = payForward(x, Q)
      const next = Q * f - x
      const [back, recovered] = payBack(y + next, Q, last)

      checked += 1

      if (next < 0 || next >= Q || back !== f || recovered !== dropped) {
        failures += 1
      }
    }
  }

  return { checked, failures }
}

export function sectionA(kind: ShapedForm, notch?: number): Record<string, number> & { ok: number } {
  const out: Record<string, number> = {}
  const last = (makeShapedRule({ lattice: photonLatticeD4({ side: 2 }), n: N, k: K, q: Q, form: kind, notch }).taps.at(-1) ?? 1) as 1 | -1
  const pay = exhaustivePay(last)

  out['a1Checked'] = pay.checked
  out['a1Failures'] = pay.failures

  let restored = true
  let gauss = 0
  let frame = 0

  for (const [side, beats] of [
    [4, 2000],
    [5, 500],
  ] as const) {
    const lattice = photonLatticeD4({ side })

    for (const dither of ['weyl', 'zero'] as const) {
      const rule = makeShapedRule({ lattice, n: N, k: K, q: Q, form: kind, notch })
      const s = emptyShapedState(rule, dither)

      start164(rule.base, viewOf(s))

      const s0 = copyShapedState(s)

      for (let t = 0; t < beats; t++) {
        shapedBeatInPlace(rule, s)
        gauss += photonGaussViolations(rule.base, viewOf(s))
      }

      const moved = differing(s.angle, s0.angle)

      for (let t = 0; t < beats; t++) {
        shapedBeatBackInPlace(rule, s)
      }

      let mismatches = differing(s.angle, s0.angle) + differing(s.flux, s0.flux) + differing(s.vibe, s0.vibe)

      s.carried.forEach((c, j) => (mismatches += differing(c, s0.carried[j]!)))
      out[`a2Side${side}${dither}Mismatches`] = mismatches
      out[`a2Side${side}${dither}AnglesMoved`] = moved
      restored = restored && mismatches === 0 && moved > 0

      if (dither === 'weyl') {
        const chi = Array.from({ length: lattice.cells }, (_, x) => Math.floor((((x + 11) * GOLDEN * 5.9) % 1) * N))
        const a = copyShapedState(s0)
        const b = { ...copyShapedState(s0), angle: changePhotonFrame(rule.base, viewOf(s0), chi).angle }

        for (let t = 0; t < 48; t++) {
          shapedBeatInPlace(rule, a)
          shapedBeatInPlace(rule, b)
          frame += differing(changePhotonFrame(rule.base, viewOf(a), chi).angle, b.angle) + differing(a.flux, b.flux)
          a.carried.forEach((c, j) => (frame += differing(c, b.carried[j]!)))
        }
      }
    }
  }

  out['a2Restored'] = restored ? 1 : 0
  out['a3GaussViolations'] = gauss
  out['a3FrameMismatches'] = frame

  return { ...out, ok: pay.failures === 0 && restored && gauss === 0 && frame === 0 ? 1 : 0 }
}

// B and C. coherent husk waves

type Reading = { omega: number; shadowOmega: number; peak: number }

function wave(kind: Kind, bulk: PhotonLattice, husk: Husk, m: readonly number[], photon: Photon, target: number, dither: 'zero' | 'weyl', notch?: number): Reading {
  const launch = launchWave({ lattice: bulk, n: N, phase: huskPhase(husk, m), v: photon.v, target })
  const projector = modeProjector(husk.lattice, m, photon.read)
  const stepper = build(kind, bulk, { start: (_, s) => s.angle.set(launch.angle), dither, notch })
  const series: [number, number][] = [[0, 0]]
  const shadow: [number, number][] = [[0, 0]]

  for (let t = 0; t < WAVE_BEATS; t++) {
    stepper.beat()
    series.push(projector(projectLinks(husk, stepper.flux)))

    if (stepper.shadowFlux) {
      shadow.push(projector(projectLinks(husk, stepper.shadowFlux())))
    }
  }

  return { omega: threePoint(series), shadowOmega: stepper.shadowFlux ? threePoint(shadow) : Number.NaN, peak: launch.peak }
}

export function sectionBC(kind: Kind, input: { dither: 'zero' | 'weyl'; other: 'zero' | 'weyl'; notch?: number; bound: number }): Record<string, number> & { okB: number; okC: number } {
  const out: Record<string, number> = {}
  const bulk = photonLatticeD4({ side: 8 })
  const husk = makeHusk(bulk)
  const m1 = huskPhotons(husk, [1, 0, 0], KAPPA)

  let okB = true
  let worstB = 0

  for (let target = 1; target <= 8; target++) {
    const r = wave(kind, bulk, husk, [1, 0, 0], m1[0]!, target, input.dither, input.notch)
    const error = r.omega / m1[0]!.omega - 1

    out[`bTarget${target}Peak`] = r.peak
    out[`bTarget${target}OverSymbol`] = error
    worstB = Math.max(worstB, Math.abs(error))

    if (Number.isFinite(r.shadowOmega)) {
      out[`bTarget${target}ShadowOverSymbol`] = r.shadowOmega / m1[0]!.omega - 1
    }

    if (target === 1 || target === 4 || target === 8) {
      out[`bTarget${target}${input.other}DitherOverSymbol`] = wave(kind, bulk, husk, [1, 0, 0], m1[0]!, target, input.other, input.notch).omega / m1[0]!.omega - 1
    }

    okB = okB && Math.abs(error) < input.bound
  }

  out['bWorst'] = worstB

  let okC = true
  let worstC = 0
  let worstShadow = 0

  for (const m of [
    [1, 0, 0],
    [2, 0, 0],
    [3, 0, 0],
    [2, 2, 1],
  ]) {
    const photons = m[0] === 1 && m[1] === 0 ? m1 : huskPhotons(husk, m, KAPPA)

    photons.forEach((photon, i) => {
      for (const target of [16, 64, 256, 1024]) {
        const r = wave(kind, bulk, husk, m, photon, target, input.dither, input.notch)
        const error = r.omega / photon.omega - 1

        out[`cM${m.join('')}Even${i + 1}Target${target}OverSymbol`] = error
        worstC = Math.max(worstC, Math.abs(error))
        okC = okC && Math.abs(error) < input.bound

        if (Number.isFinite(r.shadowOmega)) {
          worstShadow = Math.max(worstShadow, Math.abs(r.shadowOmega / photon.omega - 1))
        }
      }
    })
  }

  out['cWorst'] = worstC

  if (worstShadow > 0) {
    out['cShadowWorst'] = worstShadow
  }

  return { ...out, okB: okB ? 1 : 0, okC: okC ? 1 : 0 }
}

// D. the hot field

type Probe = { read: (field: ArrayLike<number>) => ModeVector; diff0: Correlator; diff1: Correlator; last: ModeVector | undefined; lag0: Correlator; lag1: Correlator; history: ModeVector[] }

function makeProbe(lattice: PhotonLattice, n: readonly number[]): Probe {
  const f = lattice.firsts.length
  const reader = modeReader(lattice, n)

  return { read: field => reader.read(field), diff0: makeCorrelator(f), diff1: makeCorrelator(f), last: undefined, lag0: makeCorrelator(f), lag1: makeCorrelator(f), history: [] }
}

function feed(p: Probe, v: ModeVector): void {
  if (p.last) {
    accumulate(p.diff0, v)
    accumulate(p.diff1, difference(v, p.last))
  }

  p.last = v
  accumulate(p.lag0, v)

  const past = p.history.length >= LAG ? p.history[p.history.length - LAG] : undefined

  if (past) {
    accumulateCross(p.lag1, v, past)
  }

  p.history.push(v)

  if (p.history.length > LAG) {
    p.history.shift()
  }
}

function estimate(prefix: string, probes: Probe[], series: number[][], exact: number, lambdas: readonly [number, number]): Record<string, number> {
  const [p1, p2] = probes as [Probe, Probe]
  const cut = leapfrogOmega(KAPPA, 12) / 2
  const out: Record<string, number> = {}

  for (const [name, at1, at2] of [
    ['Difference', modeFrequencies({ c0: p1.diff0, c1: p1.diff1, tolerance: 1e-9 }), modeFrequencies({ c0: p2.diff0, c1: p2.diff1, tolerance: 1e-9 })],
    ['Lagged', modeFrequencies({ c0: p1.lag0, c1: p1.lag1, lag: LAG, tolerance: 1e-9 }), modeFrequencies({ c0: p2.lag0, c1: p2.lag1, lag: LAG, tolerance: 1e-9 })],
  ] as [string, ModeFrequencies, ModeFrequencies][]) {
    const light = at1.omega.flatMap((w, i) => {
      const ratio = (at2.omega[i] ?? 0) / w

      return w < cut && ratio >= DOUBLING[0] && ratio <= DOUBLING[1] ? [i] : []
    })
    const w1 = light.length > 0 ? mean(light.map(i => at1.omega[i] ?? 0)) : Number.NaN
    const w2 = light.length > 0 ? mean(light.map(i => at2.omega[i] ?? 0)) : Number.NaN
    const slope = (q2(w2) - q2(w1)) / (lambdas[1] - lambdas[0])

    out[`${prefix}${name}LightBranches`] = light.length
    out[`${prefix}${name}Branches`] = at1.omega.length
    out[`${prefix}${name}OverExact`] = w1 / exact - 1
    out[`${prefix}${name}LowestOverExact`] = (at1.omega[0] ?? 0) / exact - 1
    out[`${prefix}${name}MassSquaredOverM1`] = (q2(w1) - slope * lambdas[0]) / q2(w1)
  }

  const tau0 = autocorrelationFirstZero(series, 80)

  out[`${prefix}DirectOverExact`] = Math.PI / (2 * tau0) / exact - 1

  return out
}

export function hotHusk(kind: Kind, prefix: string, input: { notch?: number; dither: 'zero' | 'weyl'; side: number }): Record<string, number> {
  const bulk = photonLatticeD4({ side: input.side })
  const husk = makeHusk(bulk)
  const modes = [
    [1, 0, 0],
    [2, 0, 0],
  ]
  const track = HUSK_VECTORS.map(u => u[2] ?? 0)
  const exact = mean(huskPhotons(husk, [1, 0, 0], KAPPA).map(p => p.omega))
  const lambdas = [linearWaveEigenvalues(bulk, bulkModeOfHusk([1, 0, 0]))[1] ?? 0, linearWaveEigenvalues(bulk, bulkModeOfHusk([2, 0, 0]))[1] ?? 0] as const
  const stepper = build(kind, bulk, { start: hotStart, dither: input.dither, notch: input.notch })
  const probes = modes.map(n => makeProbe(husk.lattice, n))
  const shadowProbes = modes.map(n => makeProbe(husk.lattice, n))
  const series: number[][] = []
  const shadowSeries: number[][] = []
  const settle = 300
  const beats = 2000
  const trackOf = (v: ModeVector): number[] => [v.re.reduce((a, x, j) => a + x * (track[j] ?? 0), 0), v.im.reduce((a, x, j) => a + x * (track[j] ?? 0), 0)]

  for (let t = 0; t < settle + beats; t++) {
    stepper.beat()

    if (t < settle) {
      continue
    }

    probes.forEach((p, i) => {
      const v = p.read(projectLinks(husk, stepper.flux))

      feed(p, v)

      if (i === 0) {
        series.push(trackOf(v))
      }
    })

    if (stepper.shadowFlux) {
      const shadow = projectLinks(husk, stepper.shadowFlux())

      shadowProbes.forEach((p, i) => {
        const v = p.read(shadow)

        feed(p, v)

        if (i === 0) {
          shadowSeries.push(trackOf(v))
        }
      })
    }
  }

  return {
    ...estimate(prefix, probes, series, exact, lambdas),
    ...(stepper.shadowFlux ? estimate(`${prefix}Shadow`, shadowProbes, shadowSeries, exact, lambdas) : {}),
    [`${prefix}ExactOmega`]: exact,
  }
}

// E. the love and fear at r = 1

type PairField = { all: Float64Array; shadow: Float64Array | undefined; stringFlux: Float64Array; coulomb: { flux: Float64Array; energy: number } }

function pairRun(kind: Kind, bulk: PhotonLattice, husk: Husk, charge: number, input: { dither: 'zero' | 'weyl'; notch?: number }): PairField {
  const base = makePhotonRule({ lattice: bulk, n: N, k: K, capacity: 0, hop: false, charge })
  const root = (v: number[]): number => bulk.vectors.findIndex(x => x.every((y, i) => y === v[i]))
  const up = root([1, 0, 0, 1])
  const ps = emptyPhotonState(base)

  placePairAlong(base, ps, 0, [up], 1)

  const stringFlux = projectLinks(husk, ps.flux)
  const coulomb = huskCoulomb(husk, Float64Array.from(columnSum(husk, ps.vibe), x => x * charge))
  const stepper = build(kind, bulk, {
    start: (_, s) => {
      s.vibe.set(ps.vibe)
      s.flux.set(ps.flux)
      s.angle.set(ps.angle)
    },
    charge,
    dither: input.dither,
    notch: input.notch,
  })
  const all = new Float64Array(stringFlux.length)
  const shadow = stepper.shadowFlux ? new Float64Array(stringFlux.length) : undefined
  const settle = 400
  const beats = 4000

  for (let t = 0; t < beats; t++) {
    stepper.beat()

    if (t >= settle) {
      const p = projectLinks(husk, stepper.flux)

      for (let i = 0; i < p.length; i++) {
        all[i] = (all[i] ?? 0) + (p[i] ?? 0) / (beats - settle)
      }

      if (shadow && stepper.shadowFlux) {
        const s = projectLinks(husk, stepper.shadowFlux())

        for (let i = 0; i < s.length; i++) {
          shadow[i] = (shadow[i] ?? 0) + (s[i] ?? 0) / (beats - settle)
        }
      }
    }
  }

  return { all, shadow, stringFlux, coulomb }
}

const distance = (a: ArrayLike<number>, b: (i: number) => number): number => {
  let sum = 0

  for (let i = 0; i < a.length; i++) {
    sum += ((a[i] ?? 0) - b(i)) ** 2
  }

  return Math.sqrt(sum)
}

export function sectionE(kind: Kind, input: { dither: 'zero' | 'weyl'; other: 'zero' | 'weyl'; notch?: number; floor: number }): Record<string, number> & { ok: number; okE1: number; okE2: number } {
  const out: Record<string, number> = {}
  const bulk = photonLatticeD4({ side: 8 })
  const husk = makeHusk(bulk)
  const reference = 64
  const linear = pairRun('linear', bulk, husk, reference, { dither: 'zero' })

  let ok = true

  const read = (tag: string, field: PairField, charge: number): number => {
    const scale = charge / reference
    const denominator = distance(field.stringFlux, i => field.coulomb.flux[i] ?? 0)
    const x = distance(field.all, i => scale * (linear.all[i] ?? 0)) / denominator

    out[`${tag}FromLinear`] = x
    out[`${tag}FromLinearTimesCharge`] = x * charge
    out[`${tag}EnergyOverLinear`] = huskEnergy(field.all) / (scale * scale * huskEnergy(linear.all))

    if (field.shadow) {
      out[`${tag}ShadowFromLinearTimesCharge`] = (distance(field.shadow, i => scale * (linear.all[i] ?? 0)) / denominator) * charge
    }

    return x
  }

  for (const charge of [16, 64, 256]) {
    const x = read(`eCharge${charge}`, pairRun(kind, bulk, husk, charge, input), charge)

    ok = ok && x * charge < input.floor
  }

  read(`eCharge64${input.other}Dither`, pairRun(kind, bulk, husk, 64, { ...input, dither: input.other }), 64)

  const falling = (out['eCharge256FromLinearTimesCharge'] ?? 0) < (out['eCharge16FromLinearTimesCharge'] ?? 0)

  out['eFalling'] = falling ? 1 : 0

  return { ...out, okE1: ok ? 1 : 0, okE2: falling ? 1 : 0, ok: ok && falling ? 1 : 0 }
}

// F. heating

function potentialTable(kind: Kind): Float64Array {
  return Float64Array.from({ length: N }, (_, b) => {
    const c = centered(b, N)

    return kind === 'e164' ? ((K * N) / (2 * Math.PI)) * (1 - Math.cos((2 * Math.PI * b) / N)) : (KAPPA * c * c) / 2
  })
}

function shadowSeries(stepper: Stepper, potential: Float64Array, beats: number, every: number, from: number, husk: Husk | undefined): { shadow: number[]; wraps: number; huskEnergy: number[] } {
  const base = stepper.base
  const plaquettes = base.lattice.plaquetteCount
  const shadow: number[] = []
  const huskEnergies: number[] = []
  const angle = new Int32Array(base.lattice.links)
  const b = new Int32Array(plaquettes)
  const previous = new Int32Array(plaquettes)
  const before = new Float64Array(base.lattice.links)

  let wraps = 0

  for (let t = 0; t < beats; t++) {
    before.set(stepper.flux)
    stepper.beat()

    for (let l = 0; l < angle.length; l++) {
      angle[l] = modulo(Math.round(stepper.angle[l] ?? 0), N)
    }

    for (let p = 0; p < plaquettes; p++) {
      b[p] = centered(plaquetteField(base, angle, p), N)

      if (t > 0 && Math.abs((b[p] ?? 0) - (previous[p] ?? 0)) > N / 2) {
        wraps += 1
      }
    }

    previous.set(b)

    if (t >= from && (t - from) % every === 0) {
      let e = 0

      for (let l = 0; l < before.length; l++) {
        e += ((before[l] ?? 0) * (stepper.flux[l] ?? 0)) / 2
      }

      for (let p = 0; p < plaquettes; p++) {
        e += potential[modulo(b[p] ?? 0, N)] ?? 0
      }

      shadow.push(e)

      if (husk) {
        huskEnergies.push(huskEnergy(projectLinks(husk, stepper.flux)))
      }
    }
  }

  return { shadow, wraps, huskEnergy: huskEnergies }
}

export function heatF1(kind: Kind, input: { notch?: number; dither: 'zero' | 'weyl' }): { growth: number; largestMove: number; wraps: number; huskGrowth: number } {
  const lattice = photonLatticeD4({ side: 4 })
  const husk = makeHusk(lattice)
  const stepper = build(kind, lattice, { start: start164, dither: input.dither, notch: input.notch })
  const { shadow, wraps, huskEnergy: he } = shadowSeries(stepper, potentialTable(kind), 2000, 1, 0, husk)
  const first = shadow[0] ?? 1
  const window = 200

  return {
    growth: (mean(shadow.slice(-window)) - mean(shadow.slice(0, window))) / (shadow.length - window),
    largestMove: Math.max(...shadow.map(e => Math.abs(e - first) / first)),
    wraps,
    huskGrowth: (mean(he.slice(-window)) - mean(he.slice(0, window))) / (he.length - window),
  }
}

export function heatF2(kind: Kind, input: { notch?: number; dither: 'zero' | 'weyl' }): { drift: number; wraps: number } {
  const lattice = photonLatticeD4({ side: 8 })
  const stepper = build(kind, lattice, { start: hotStart, dither: input.dither, notch: input.notch })
  const { shadow, wraps } = shadowSeries(stepper, potentialTable(kind), 2500, 10, 500, undefined)

  return { drift: (mean(shadow.slice(-20)) - mean(shadow.slice(0, 20))) / mean(shadow), wraps }
}

export type HeatControls = { t1: ReturnType<typeof heatF1>; c1: ReturnType<typeof heatF1>; t2: ReturnType<typeof heatF2>; c2: ReturnType<typeof heatF2> }

// the E-FRC-0164 table rule and the E-FRC-0181 first-order remainder on both heating protocols, run once
export function heatControls(): HeatControls {
  return { t1: heatF1('e164', { dither: 'weyl' }), c1: heatF1('remainder', { dither: 'weyl' }), t2: heatF2('e164', { dither: 'weyl' }), c2: heatF2('remainder', { dither: 'weyl' }) }
}

export function controlMetrics(c: HeatControls): Record<string, number> {
  return {
    f1E164Growth: c.t1.growth,
    f1E164Wraps: c.t1.wraps,
    f1E164HuskGrowth: c.t1.huskGrowth,
    f1RemainderGrowth: c.c1.growth,
    f1RemainderWraps: c.c1.wraps,
    f1RemainderHuskGrowth: c.c1.huskGrowth,
    f2E164Drift: c.t2.drift,
    f2E164Wraps: c.t2.wraps,
    f2RemainderDrift: c.c2.drift,
    f2RemainderWraps: c.c2.wraps,
  }
}

export function sectionF(kind: Kind, input: { notch?: number; dither: 'zero' | 'weyl' }, controls: HeatControls): Record<string, number> & { ok: number; okF1: number; okF2: number } {
  const out: Record<string, number> = {}
  const r1 = heatF1(kind, input)
  const t1 = controls.t1
  const r2 = heatF2(kind, input)
  const t2 = controls.t2

  out['f1Growth'] = r1.growth
  out['f1LargestMove'] = r1.largestMove
  out['f1Wraps'] = r1.wraps
  out['f1HuskGrowth'] = r1.huskGrowth
  out['f1GrowthOverE164'] = r1.growth / t1.growth
  out['f2Drift'] = r2.drift
  out['f2Wraps'] = r2.wraps
  out['f2DriftRatio'] = Math.abs(r2.drift) / Math.abs(t2.drift)

  const okF1 = r1.growth <= 0.5 * t1.growth
  const okF2 = Math.abs(r2.drift) <= 0.5 * Math.abs(t2.drift)

  return { ...out, okF1: okF1 ? 1 : 0, okF2: okF2 ? 1 : 0, ok: okF1 && okF2 ? 1 : 0 }
}

// S. the wave form's shadow against the linear leapfrog from the same integer start (zero carried start)

export function sectionS(): Record<string, number> {
  const out: Record<string, number> = {}

  for (const [tag, side, start, beats] of [
    ['F1', 4, start164, 2000],
    ['Hot', 8, hotStart, 2000],
  ] as const) {
    const lattice = photonLatticeD4({ side })
    const shaped = build('wave', lattice, { start, dither: 'zero' })
    const linear = build('linear', lattice, { start, dither: 'zero' })
    const size = lattice.plaquetteSize

    let worst = 0
    let worstDither = 0
    let wraps = 0

    for (let t = 0; t < beats; t++) {
      shaped.beat()
      linear.beat()

      const flux = shaped.shadowFlux!()

      for (let l = 0; l < flux.length; l++) {
        worst = Math.max(worst, Math.abs((flux[l] ?? 0) - (linear.flux[l] ?? 0)))
        worstDither = Math.max(worstDither, Math.abs((flux[l] ?? 0) - (shaped.flux[l] ?? 0)))
      }

      if (t % 50 === 0) {
        // plaquettes whose integer B differs from the linear run's unwrapped B by a multiple of N
        for (let p = 0; p < lattice.plaquetteCount; p++) {
          let bl = 0
          let bi = 0

          for (let j = 0; j < size; j++) {
            const l = lattice.plaquetteLinks[p * size + j] ?? 0
            const s = lattice.plaquetteSigns[p * size + j] ?? 0

            bl += s * (linear.angle[l] ?? 0)
            bi += s * (shaped.angle[l] ?? 0)
          }

          wraps += Math.abs(centered(bi, N) - bl) > N / 4 ? 1 : 0
        }
      }
    }

    out[`s${tag}ShadowFromLinearWorst`] = worst
    out[`s${tag}DitherInFluxWorst`] = worstDither
    out[`s${tag}WrappedPlaquetteSamples`] = wraps
  }

  return out
}

// H. the carried integers from the angle history alone: the angle is its start plus the running sum of the
// flux the stream copied, and the carried integers are recomputed from those angles and their own start by
// the rule's own arithmetic on a scratch state that holds no flux of its own

export function sectionH(kind: ShapedForm, notch?: number): Record<string, number> & { ok: number } {
  const lattice = photonLatticeD4({ side: 4 })
  const rule = makeShapedRule({ lattice, n: N, k: K, q: Q, form: kind, notch })
  const s = emptyShapedState(rule, 'weyl')

  start164(rule.base, viewOf(s))

  const history = Int32Array.from(s.angle)
  const scratch = copyShapedState(s)

  let angleMismatches = 0
  let carriedMismatches = 0

  for (let t = 0; t < 500; t++) {
    for (let l = 0; l < history.length; l++) {
      history[l] = modulo((history[l] ?? 0) + (s.flux[l] ?? 0), N)
    }

    shapedBeatInPlace(rule, s)
    angleMismatches += differing(history, s.angle)
    // the scratch state: the history's angles, no flux, so its drift leaves them and its kick reads B from them
    scratch.angle.set(history)
    scratch.flux.fill(0)
    shapedBeatInPlace(rule, scratch)
    scratch.carried.forEach((c, j) => (carriedMismatches += differing(c, s.carried[j]!)))
  }

  return { hAngleMismatches: angleMismatches, hCarriedMismatches: carriedMismatches, hChecked: 500 * lattice.plaquetteCount * rule.taps.length, ok: angleMismatches === 0 && carriedMismatches === 0 ? 1 : 0 }
}
