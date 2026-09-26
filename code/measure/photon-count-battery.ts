// The light battery for code/rule/photon-count (E-FRC-0203 to E-FRC-0205): light by threshold counting, read
// in real numbers here and only here. Each section follows the E-FRC-0181 / E-FRC-0185 protocol of the same
// letter (code/measure/photon-battery) on the same boxes and starts, with the coupling kappa = 1/Q.
//
// A. reversibility: the counters' arithmetic exhaustively, then the lattice forward and back, Gauss's law on
//    every beat, a frame change that commutes with the beat, and the leapfrog against Fredkin's second-order
//    form bit for bit
// B, C. coherent husk waves at peak |B| 1 to 1024, read by the three-point recurrence on the husk flux, raw
//    and (wave form) in the shadow E~ = E + C^T (d_(t-1) - d_(t-2))
// D. the hot field on the husk: the lagged estimator and the autocorrelation zero crossing
// F. heating: the energy drift on the hot start, against the E-FRC-0164 table rule
// S. the shadow against the floating-point linear leapfrog at kappa = 1/Q from the same integer start, with
//    the seam crossings (compact U(1)'s monopole events) counted, at N = 2^13 and 2^16
// L. the continuity audit (E-MTH-0025) on the rule file and its value imports

import { resolve } from 'node:path'
import { readFileSync } from 'node:fs'
import { importClosure, scanContinuity, type ContinuityFinding } from '@/code/check/continuity'
import { changePhotonFrame, emptyPhotonState, makePhotonRule, photonLatticeD4, type PhotonLattice, type PhotonRule, type PhotonState } from '@/code/rule/photon-links'
import {
  centeredCount,
  copyCountState,
  countBeatBackInPlace,
  countBeatInPlace,
  countGaussViolations,
  emptyCountState,
  fredkinBeatBackInPlace,
  fredkinBeatInPlace,
  fredkinOf,
  makeCountRule,
  payCounters,
  type CountForm,
  type CountRule,
  type CountState,
} from '@/code/rule/photon-count'
import { accumulate, accumulateCross, difference, leapfrogOmega, linearWaveEigenvalues, makeCorrelator, modeFrequencies, modeReader, type Correlator, type ModeFrequencies, type ModeVector } from '@/code/measure/photon-modes'
import { bulkModeOfHusk, HUSK_VECTORS, makeHusk, projectLinks, type Husk } from '@/code/measure/photon-husk'
import { centered, makeLinearLeapfrog } from '@/code/measure/photon-symbol'
import { autocorrelationFirstZero, huskPhase, huskPhotons, launchWave, modeProjector, threePoint, type Photon } from '@/code/measure/photon-wave'
import { heatF2, hotStart, start164, type Start } from '@/code/measure/photon-battery'

// the committed compact U(1): angles mod 2^13 = 8192, as E-FRC-0164 to E-FRC-0185
export const N_BITS = 13
// kappa = 1/16
export const Q_BITS = 4
export const KAPPA_COUNT = 1 / (1 << Q_BITS)
// the wave form's fresh-error counter: 4 base-16 digits, 2^16
export const DIGITS = 4
// the starts are written by code/measure/photon-battery for N = 8192, K = 80
const START_N = 8192
const START_K = 80
const WAVE_BEATS = 300
const LAG = 3
const DOUBLING = [1.6, 2.1] as const

const mean = (xs: readonly number[]): number => xs.reduce((a, b) => a + b, 0) / Math.max(1, xs.length)
const q2 = (w: number): number => 4 * Math.sin(w / 2) ** 2

export type CountKind = CountForm | 'linear'

export type CountStepper = {
  readonly lattice: PhotonLattice
  readonly flux: ArrayLike<number>
  // the angles, centered, as reals: for the integer rule the centered residue, for the linear rule its own
  angles(): Float64Array
  beat(): void
  // the wave form's shadow flux E~ = E + C^T (D_(t-1) - D_(t-2)) / 2^S
  shadowFlux?: () => Float64Array
  readonly rule?: CountRule
  readonly state?: CountState
}

const startBase = (lattice: PhotonLattice, charge: number): PhotonRule => makePhotonRule({ lattice, n: START_N, k: START_K, capacity: 0, hop: false, charge })

// a start written for N = 8192, carried to angles mod 2^nBits through the centered residue
export function countStart(rule: CountRule, s: CountState, start: Start): void {
  const base = startBase(rule.lattice, rule.charge)
  const ps: PhotonState = emptyPhotonState(base)

  start(base, ps)
  s.vibe.set(ps.vibe)
  s.flux.set(ps.flux)

  for (let l = 0; l < s.angle.length; l++) {
    s.angle[l] = centered(ps.angle[l] ?? 0, START_N) & (rule.n - 1)
  }
}

export function shadowOf(rule: CountRule, s: CountState): Float64Array {
  const lattice = rule.lattice
  const size = lattice.plaquetteSize
  const out = Float64Array.from(s.flux)
  const scale = 2 ** -rule.sBits

  if (rule.form !== 'wave') {
    return out
  }

  const newer = s.carried[0]!
  const older = s.carried[1]!

  for (let p = 0, o = 0; p < lattice.plaquetteCount; p++, o += size) {
    const d = ((newer[p] ?? 0) - (older[p] ?? 0)) * scale

    if (d === 0) {
      continue
    }

    for (let j = 0; j < size; j++) {
      const l = lattice.plaquetteLinks[o + j] ?? 0

      out[l] = (out[l] ?? 0) + (lattice.plaquetteSigns[o + j] ?? 0) * d
    }
  }

  return out
}

// the counters' start: all zero, or (the first form's counter only) an integer Weyl sequence over the
// plaquette index at the golden rate 40503 / 65536, the top qBits bits of (p + 1) 40503 mod 2^16
export type Dither = 'zero' | 'weyl'

export function buildCount(kind: CountKind, lattice: PhotonLattice, input: { start: Start; nBits?: number; charge?: number; dither?: Dither; digits?: number }): CountStepper {
  const nBits = input.nBits ?? N_BITS

  if (kind === 'linear') {
    const base = startBase(lattice, input.charge ?? 1)
    const ps = emptyPhotonState(base)

    input.start(base, ps)

    const angle = Float64Array.from(ps.angle, x => centered(x, START_N))
    const flux = Float64Array.from(ps.flux)
    const step = makeLinearLeapfrog(lattice, KAPPA_COUNT)

    return { lattice, flux, angles: () => angle, beat: () => step.beat(angle, flux) }
  }

  const rule = makeCountRule({ lattice, form: kind, nBits, qBits: Q_BITS, digits: input.digits ?? DIGITS, charge: input.charge })
  const s = emptyCountState(rule)

  countStart(rule, s, input.start)

  if (input.dither === 'weyl' && kind === 'first') {
    for (let p = 0; p < s.counter.length; p++) {
      s.counter[p] = (((p + 1) * 40503) & 65535) >> (16 - Q_BITS)
    }
  }

  return {
    lattice,
    flux: s.flux,
    rule,
    state: s,
    angles: () => Float64Array.from(s.angle, a => centeredCount(rule, a)),
    beat: () => countBeatInPlace(rule, s),
    shadowFlux: kind === 'wave' ? () => shadowOf(rule, s) : undefined,
  }
}

const differing = (a: ArrayLike<number>, b: ArrayLike<number>): number => {
  let n = 0

  for (let i = 0; i < a.length; i++) {
    n += a[i] === b[i] ? 0 : 1
  }

  return n
}

// A. reversibility

// A lattice of `count` disjoint triangles, three links each, with no docks: the counters' arithmetic run
// through the rule's own payCounters on as many independent plaquettes as there are cases. On it the
// spatial sum of a plaquette is 3 D_(t-1).
function disjointTriangles(count: number): PhotonLattice {
  const links = Int32Array.from({ length: 3 * count }, (_, i) => i)
  const signs = Int8Array.from({ length: 3 * count }, () => 1)

  return {
    id: `triangles-${count}`,
    side: 0,
    dimension: 0,
    cells: 0,
    degree: 0,
    neighbour: new Int32Array(0),
    opposite: [],
    firsts: [],
    firstOf: new Int32Array(0),
    vectors: [],
    coordinates: new Int32Array(0),
    wave: [],
    links: 3 * count,
    plaquetteSize: 3,
    plaquetteCount: count,
    plaquetteLinks: links,
    plaquetteSigns: signs,
    linkOffsets: new Int32Array(0),
    linkEntries: new Int32Array(0),
  }
}

// A1: every B in -N/2 .. N/2 - 1 against every value of the counter the backward step must recover (first:
// r in 0 .. Q - 1; wave: D_(t-2) in 0 .. 2^S - 1, with D_(t-1) and R running over integer Weyl sequences):
// forward, then backward, and the recovered counters and the paid kick must match
export function exhaustiveCounters(form: CountForm): { checked: number; failures: number } {
  const probe = makeCountRule({ lattice: photonLatticeD4({ side: 2 }), form, nBits: N_BITS, qBits: Q_BITS, digits: DIGITS })
  const n = probe.n
  const inner = form === 'first' ? probe.q : 1 << probe.sBits
  const lattice = disjointTriangles(inner)
  const rule = makeCountRule({ lattice, form, nBits: N_BITS, qBits: Q_BITS, digits: DIGITS })
  const angle = new Int32Array(lattice.links)
  const counter = new Int32Array(inner)
  const carried = form === 'wave' ? [new Int32Array(inner), new Int32Array(inner)] : []
  const saved = { counter: new Int32Array(inner), carried: carried.map(() => new Int32Array(inner)) }
  const paid = new Int32Array(inner)
  const sMask = (1 << probe.sBits) - 1

  let checked = 0
  let failures = 0

  for (let b = -(n >> 1); b < n >> 1; b++) {
    for (let i = 0; i < inner; i++) {
      angle[3 * i] = b & (n - 1)

      if (form === 'first') {
        counter[i] = i
      } else {
        // integer Weyl sequences over the case index and B: 40503 and 25717 are odd, so each is a bijection mod 2^16
        counter[i] = (i * 40503 + b * 25717) & (probe.q - 1)
        carried[0]![i] = (i * 25717 + b * 40503 + 12345) & sMask
        carried[1]![i] = i
      }
    }

    saved.counter.set(counter)
    carried.forEach((c, j) => saved.carried[j]!.set(c))
    payCounters(rule, angle, counter, carried, 1)
    paid.set(rule.paid)

    let range = 0

    if (form === 'wave') {
      for (let i = 0; i < inner; i++) {
        const d = carried[0]![i] ?? 0

        range += d < 0 || d > sMask ? 1 : 0
      }
    }

    for (let i = 0; i < inner; i++) {
      const r = counter[i] ?? 0

      range += r < 0 || r >= probe.q ? 1 : 0
    }

    payCounters(rule, angle, counter, carried, -1)
    checked += inner
    failures += range + differing(counter, saved.counter) + differing(rule.paid, paid) + carried.reduce((a, c, j) => a + differing(c, saved.carried[j]!), 0)
  }

  return { checked, failures }
}

export function sectionA(form: CountForm): Record<string, number> & { ok: number } {
  const out: Record<string, number> = {}
  const pay = exhaustiveCounters(form)

  out['a1Checked'] = pay.checked
  out['a1Failures'] = pay.failures

  let restored = true
  let gauss = 0
  let frame = 0
  let fredkinMismatches = 0
  let fredkinGauss = 0
  let fredkinRestored = true

  for (const [side, beats] of [
    [4, 2000],
    [5, 500],
  ] as const) {
    const lattice = photonLatticeD4({ side })
    const rule = makeCountRule({ lattice, form, nBits: N_BITS, qBits: Q_BITS, digits: DIGITS })
    const s = emptyCountState(rule)

    countStart(rule, s, start164)

    const s0 = copyCountState(s)
    const fk = fredkinOf(rule, s)
    const fk0 = fredkinOf(rule, s)
    const mask = rule.n - 1
    const fluxOf = new Int32Array(lattice.links)

    for (let t = 0; t < beats; t++) {
      countBeatInPlace(rule, s)
      fredkinBeatInPlace(rule, fk)
      gauss += countGaussViolations(rule, s.vibe, s.flux, false)

      // Fredkin (A_(t+1), A_t) against leapfrog (A_t, E_t): previous = angle, current - previous = E mod N
      for (let l = 0; l < lattice.links; l++) {
        const e = ((fk.current[l] ?? 0) - (fk.previous[l] ?? 0)) & mask

        fluxOf[l] = e
        fredkinMismatches += fk.previous[l] === s.angle[l] && e === ((s.flux[l] ?? 0) & mask) ? 0 : 1
      }

      fredkinMismatches += differing(fk.counter, s.counter) + fk.carried.reduce((a, c, j) => a + differing(c, s.carried[j]!), 0)
      fredkinGauss += countGaussViolations(rule, fk.vibe, fluxOf, true)
    }

    const moved = differing(s.angle, s0.angle)

    for (let t = 0; t < beats; t++) {
      countBeatBackInPlace(rule, s)
      fredkinBeatBackInPlace(rule, fk)
    }

    let mismatches = differing(s.angle, s0.angle) + differing(s.flux, s0.flux) + differing(s.vibe, s0.vibe) + differing(s.counter, s0.counter)

    s.carried.forEach((c, j) => (mismatches += differing(c, s0.carried[j]!)))

    const fkBack = differing(fk.current, fk0.current) + differing(fk.previous, fk0.previous) + differing(fk.counter, fk0.counter) + fk.carried.reduce((a, c, j) => a + differing(c, fk0.carried[j]!), 0)

    out[`a2Side${side}Mismatches`] = mismatches
    out[`a2Side${side}AnglesMoved`] = moved
    out[`a2Side${side}FredkinBackMismatches`] = fkBack
    restored = restored && mismatches === 0 && moved > 0
    fredkinRestored = fredkinRestored && fkBack === 0

    if (side === 4) {
      // a frame change chi in every dock, from an integer Weyl sequence: A -> A + chi_y - chi_x mod N
      const chi = Array.from({ length: lattice.cells }, (_, x) => ((x + 11) * 40503) & mask)
      const base = startBase(lattice, 1)
      const frameOf = (a: Int32Array): Int32Array => changePhotonFrame(base, { vibe: s0.vibe, angle: a, flux: s0.flux, demon: new Int32Array(s0.flux.length) }, chi).angle
      const x = copyCountState(s0)
      const y = { ...copyCountState(s0), angle: frameOf(s0.angle) }

      for (let t = 0; t < 48; t++) {
        countBeatInPlace(rule, x)
        countBeatInPlace(rule, y)
        frame += differing(frameOf(x.angle), y.angle) + differing(x.flux, y.flux) + differing(x.counter, y.counter)
        x.carried.forEach((c, j) => (frame += differing(c, y.carried[j]!)))
      }
    }
  }

  out['a2Restored'] = restored ? 1 : 0
  out['a3GaussViolations'] = gauss
  out['a3FrameMismatches'] = frame
  out['a4FredkinMismatches'] = fredkinMismatches
  out['a4FredkinGaussViolations'] = fredkinGauss
  out['a4FredkinRestored'] = fredkinRestored ? 1 : 0

  const ok = pay.failures === 0 && restored && gauss === 0 && frame === 0

  return { ...out, ok: ok ? 1 : 0 }
}

// B and C. coherent husk waves

type Reading = { omega: number; shadowOmega: number; peak: number }

function wave(form: CountForm, bulk: PhotonLattice, husk: Husk, m: readonly number[], photon: Photon, target: number, dither: Dither): Reading {
  const launch = launchWave({ lattice: bulk, n: START_N, phase: huskPhase(husk, m), v: photon.v, target })
  const projector = modeProjector(husk.lattice, m, photon.read)
  const stepper = buildCount(form, bulk, { start: (_, s) => s.angle.set(launch.angle), dither })
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

// the gate reads the shadow when the form has one (`read: 'shadow'`), the raw flux otherwise
export function sectionBC(form: CountForm, input: { bound: number; read: 'raw' | 'shadow'; dither: Dither; other?: Dither }): Record<string, number> & { okB: number; okC: number } {
  const out: Record<string, number> = {}
  const bulk = photonLatticeD4({ side: 8 })
  const husk = makeHusk(bulk)
  const m1 = huskPhotons(husk, [1, 0, 0], KAPPA_COUNT)
  const gated = (r: Reading): number => (input.read === 'shadow' ? r.shadowOmega : r.omega)

  let okB = true
  let worstB = 0
  let worstBRaw = 0

  for (let target = 1; target <= 8; target++) {
    const r = wave(form, bulk, husk, [1, 0, 0], m1[0]!, target, input.dither)
    const error = gated(r) / m1[0]!.omega - 1
    const raw = r.omega / m1[0]!.omega - 1

    out[`bTarget${target}Peak`] = r.peak
    out[`bTarget${target}OverSymbol`] = error
    out[`bTarget${target}RawOverSymbol`] = raw
    worstB = Math.max(worstB, Math.abs(error))
    worstBRaw = Math.max(worstBRaw, Math.abs(raw))
    okB = okB && Math.abs(error) < input.bound

    if (input.other && (target === 1 || target === 4 || target === 8)) {
      out[`bTarget${target}${input.other}StartRawOverSymbol`] = wave(form, bulk, husk, [1, 0, 0], m1[0]!, target, input.other).omega / m1[0]!.omega - 1
    }
  }

  out['bWorst'] = worstB
  out['bWorstRaw'] = worstBRaw

  let okC = true
  let worstC = 0
  let worstCRaw = 0

  for (const m of [
    [1, 0, 0],
    [2, 0, 0],
    [3, 0, 0],
    [2, 2, 1],
  ]) {
    const photons = m[0] === 1 && m[1] === 0 ? m1 : huskPhotons(husk, m, KAPPA_COUNT)

    photons.forEach((photon, i) => {
      for (const target of [16, 64, 256, 1024]) {
        const r = wave(form, bulk, husk, m, photon, target, input.dither)
        const error = gated(r) / photon.omega - 1
        const raw = r.omega / photon.omega - 1

        out[`cM${m.join('')}Even${i + 1}Target${target}OverSymbol`] = error
        out[`cM${m.join('')}Even${i + 1}Target${target}RawOverSymbol`] = raw
        worstC = Math.max(worstC, Math.abs(error))
        worstCRaw = Math.max(worstCRaw, Math.abs(raw))
        okC = okC && Math.abs(error) < input.bound
      }
    })
  }

  out['cWorst'] = worstC
  out['cWorstRaw'] = worstCRaw

  return { ...out, okB: okB ? 1 : 0, okC: okC ? 1 : 0 }
}

// D. the hot field on the husk (the E-FRC-0181 protocol, code/measure/photon-battery hotHusk)

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
  const cut = leapfrogOmega(KAPPA_COUNT, 12) / 2
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
    out[`${prefix}${name}MassSquaredOverM1`] = (q2(w1) - slope * lambdas[0]) / q2(w1)
  }

  const tau0 = autocorrelationFirstZero(series, 80)

  out[`${prefix}DirectOverExact`] = Math.PI / (2 * tau0) / exact - 1

  return out
}

export function hotHusk(kind: CountKind, prefix: string, side: number, dither: Dither): Record<string, number> {
  const bulk = photonLatticeD4({ side })
  const husk = makeHusk(bulk)
  const modes = [
    [1, 0, 0],
    [2, 0, 0],
  ]
  const track = HUSK_VECTORS.map(u => u[2] ?? 0)
  const exact = mean(huskPhotons(husk, [1, 0, 0], KAPPA_COUNT).map(p => p.omega))
  const lambdas = [linearWaveEigenvalues(bulk, bulkModeOfHusk([1, 0, 0]))[1] ?? 0, linearWaveEigenvalues(bulk, bulkModeOfHusk([2, 0, 0]))[1] ?? 0] as const
  const stepper = buildCount(kind, bulk, { start: hotStart, dither })
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

// F. heating on the hot start: the staggered energy 1/2 E(-) . E(+) + sum B^2 / 2Q every 10 beats from beat
// 500 to 2,500, its drift (last 20 samples minus first 20, over the mean), against E-FRC-0164's on the same
// protocol (code/measure/photon-battery heatF2)

function energyDrift(stepper: CountStepper, read: 'raw' | 'shadow'): { drift: number; seams: number } {
  const lattice = stepper.lattice
  const size = lattice.plaquetteSize
  const before = new Float64Array(lattice.links)
  const previousB = new Float64Array(lattice.plaquetteCount)
  const samples: number[] = []

  let seams = 0

  for (let t = 0; t < 2500; t++) {
    before.set(read === 'shadow' && stepper.shadowFlux ? stepper.shadowFlux() : stepper.flux)
    stepper.beat()

    const after = read === 'shadow' && stepper.shadowFlux ? stepper.shadowFlux() : stepper.flux
    const angle = stepper.angles()

    let magnetic = 0

    for (let p = 0, o = 0; p < lattice.plaquetteCount; p++, o += size) {
      let b = 0

      for (let j = 0; j < size; j++) {
        b += (lattice.plaquetteSigns[o + j] ?? 0) * (angle[lattice.plaquetteLinks[o + j] ?? 0] ?? 0)
      }

      if (stepper.rule) {
        b = centeredCount(stepper.rule, b)
        seams += t > 0 && Math.abs(b - (previousB[p] ?? 0)) > stepper.rule.n / 2 ? 1 : 0
      }

      previousB[p] = b
      magnetic += (KAPPA_COUNT * b * b) / 2
    }

    if (t >= 500 && (t - 500) % 10 === 0) {
      let electric = 0

      for (let l = 0; l < before.length; l++) {
        electric += ((before[l] ?? 0) * (after[l] ?? 0)) / 2
      }

      samples.push(electric + magnetic)
    }
  }

  return { drift: (mean(samples.slice(-20)) - mean(samples.slice(0, 20))) / mean(samples), seams }
}

export function sectionF(form: CountForm, input: { bound: number; dither: Dither }): Record<string, number> & { okF: number } {
  const e164 = heatF2('e164', { dither: 'weyl' })
  const raw = energyDrift(buildCount(form, photonLatticeD4({ side: 8 }), { start: hotStart, dither: input.dither }), 'raw')
  const linear = energyDrift(buildCount('linear', photonLatticeD4({ side: 8 }), { start: hotStart }), 'raw')
  const out: Record<string, number> = {
    fE164Drift: e164.drift,
    fLinearDrift: linear.drift,
    fDrift: raw.drift,
    fDriftOverE164: Math.abs(raw.drift) / Math.abs(e164.drift),
    fSeamCrossings: raw.seams,
  }

  const okF = Math.abs(raw.drift) <= input.bound * Math.abs(e164.drift)

  return { ...out, okF: okF ? 1 : 0 }
}

// S. the shadow (or the raw flux, for the first form) against the linear leapfrog at kappa = 1/Q from the
// same integer start, worst over links and beats, and the seam crossings of the integer run, at N = 2^13 and
// (on the rough E-FRC-0164 start) N = 2^16

export function sectionS(form: CountForm, dither: Dither, runs?: readonly (readonly [string, number, Start, number, number, number])[]): Record<string, number> {
  const out: Record<string, number> = {}

  for (const [tag, side, start, beats, nBits, digits] of runs ?? [
    ['F1', 4, start164, 2000, N_BITS, DIGITS],
    ['F1Wide', 4, start164, 2000, 16, DIGITS],
    ['Hot', 8, hotStart, 2000, N_BITS, DIGITS],
  ]) {
    const lattice = photonLatticeD4({ side })
    const counted = buildCount(form, lattice, { start, nBits, dither, digits })
    const linear = buildCount('linear', lattice, { start })
    const rule = counted.rule!
    const size = lattice.plaquetteSize
    const previousB = new Int32Array(lattice.plaquetteCount)

    let worst = 0
    let worstRaw = 0
    let seams = 0
    let largestB = 0

    for (let t = 0; t < beats; t++) {
      counted.beat()
      linear.beat()

      const flux = counted.shadowFlux ? counted.shadowFlux() : counted.flux

      for (let l = 0; l < lattice.links; l++) {
        worst = Math.max(worst, Math.abs((flux[l] ?? 0) - (linear.flux[l] ?? 0)))
        worstRaw = Math.max(worstRaw, Math.abs((counted.flux[l] ?? 0) - (linear.flux[l] ?? 0)))
      }

      const angle = counted.state!.angle

      for (let p = 0, o = 0; p < lattice.plaquetteCount; p++, o += size) {
        let b = 0

        for (let j = 0; j < size; j++) {
          b += (lattice.plaquetteSigns[o + j] ?? 0) * (angle[lattice.plaquetteLinks[o + j] ?? 0] ?? 0)
        }

        b = centeredCount(rule, b)
        largestB = Math.max(largestB, Math.abs(b))
        seams += t > 0 && Math.abs(b - (previousB[p] ?? 0)) > rule.n / 2 ? 1 : 0
        previousB[p] = b
      }
    }

    out[`s${tag}FromLinearWorst`] = worst
    out[`s${tag}RawFromLinearWorst`] = worstRaw
    out[`s${tag}SeamCrossings`] = seams
    out[`s${tag}LargestB`] = largestB
  }

  return out
}

// L. the continuity audit on the rule file and its value imports: every finding of every kind, integer
// divisions included
export function sectionL(): { files: number; findings: ContinuityFinding[]; ok: number } {
  const base = resolve(import.meta.dirname, '../..')
  const closure = importClosure(base, ['code/rule/photon-count.ts'])
  const findings = [...closure.keys()].flatMap(file => scanContinuity(file, readFileSync(resolve(base, file), 'utf8')))

  return { files: closure.size, findings, ok: findings.length === 0 && closure.size >= 1 ? 1 : 0 }
}
