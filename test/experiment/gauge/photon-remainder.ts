// Light with a carried remainder. E-FRC-0179 and E-FRC-0180 showed the leapfrog U(1) sector is exactly a
// massless photon (c = 0.2023 per beat) where its force is linear, and traced every light failure left to the
// integer table round(K sin(2 pi B / N)) of E-FRC-0164: a dead zone at |B| <= 8, a staircase that runs a husk
// wave 0.1 to 11 percent fast, heating, and a love-fear residual at r = 1 of about 9 flux units that does not
// shrink. No integer slope is stable (kappa lambda_max = 16). The hypothesis tested here: an error-diffusion
// (sigma-delta, Bresenham) force removes all of these at once (code/rule/photon-remainder). The coupling is
// p / q; each plaquette keeps an integer remainder r in [0, q); the kick pays f = floor((T[B] + r) / q) and
// keeps r' = (T[B] + r) mod q, with T[B] = p centered(B). The force is an integer curl, has no dead zone (a
// remainder waits and pays out), and averages exactly p B / q. B is fixed during the kick, so r = r' + q f -
// T[B] runs it backward: the beat stays a bijection in integers.
//
// Choices, fixed before any run:
// - q = 65,536, p = round(q kappa) = 4,021, so p / q = 0.0613556 against the E-FRC-0164 kappa = 2 pi 80 /
//   8192 = 0.0613592 (5.9e-5 below it, a frequency shift of 3e-5). Every symbol below is taken at p / q
// - the LINEAR table, not the sine. Gate C reaches peak |B| = 1024, where the sine softens by design (E-FRC-0180
//   measured -1.4 percent there for the sine table), and E-FRC-0180 C3 counted 0 wraps of B across N / 2 in
//   2,000 hot beats with a linear table, so the non-periodic linear force is not expected to be reached at
//   its seam. The sine resolved to 1 / q and carried (T[B] = round(q K sin(2 pi B / N))) is reported beside,
//   never gated
// - the remainder sits on the plaquette. A remainder on each link (the link's summed T plus its own r) is not
//   a curl and breaks Gauss's law: it is the control
// - the start remainders are a golden-ratio Weyl sequence over the plaquette index, floor(frac((i + 1) g) q),
//   a deterministic dither. The all-zero start is reported beside
//
// Gates, fixed before the run. N = 8192, K = 80. Husk first, bulk beside. The box: section D (the E-FRC-0169
// protocol) runs on the D4 box side 12 (husk 12^3); sections B, C and E run on the side-8 box (husk 8^3). The
// first launch at side 12 everywhere was stopped before it wrote a line (tmp/frc0181.log is empty), and the
// resuming agent moved B, C and E to side 8 for machine load (about 5 times fewer docks) before any number
// was seen. The E1 threshold stays 4.5 units, half of the side-12 E-FRC-0180 reading, and the E-FRC-0164
// control is run on the same side-8 box beside it.
// A. Exact reversibility:
//    A1 on the rule itself: for every B in 0 .. N - 1 and every r in 0 .. q - 1, the kick forward then backward
//       returns r and f, and r' lies in [0, q): 0 failures over the 536,870,912 pairs, for the linear and the
//       sine tables
//    A2 the E-FRC-0164 start (love-fear pairs, angles hashed within 512, transverse flux within 181) with Weyl
//       remainders: 2,000 beats forward and 2,000 back on the side-4 box and 500 and 500 on the side-5 box
//       restore every angle, flux and remainder, 0 mismatches, for both tables
//    A3 Gauss's law holds on every beat of A2 (0 violations), and a Z_N frame change (Weyl chi in every dock)
//       commutes with 48 beats (0 mismatches)
//    Control: the per-link remainder reverses too but breaks Gauss's law within 48 beats
// B. No dead zone: the first depth-even photon at husk m1 = (1,0,0), peak targets |B| = 1 to 8, 300 beats:
//    at every target the angles move, and the three-point frequency of the flux read on the husk is within 1
//    percent of the symbol. Control, reported: the E-FRC-0164 rule stays frozen at every target whose rounded
//    peak is at most 8. Prediction stated here: at target 1 or 2 the wave's flux amplitude (omega times the
//    angle amplitude, about 0.2 per unit of target) is below one unit per link, so an integer flux cannot
//    carry it smoothly whatever the force does; B may fail there for that reason
// C. Coherent husk waves: m1, (2,0,0), (3,0,0), (2,2,1), both depth-even polarizations, peak targets 16, 64,
//    256, 1024, 300 beats: every one of the 32 readings within 1 percent of the symbol at p / q. C0, the
//    estimator control: the floating-point linear leapfrog from the same integer start reads each of the 8
//    husk photons at target 256 within 1e-9 of the symbol (the husk read now uses the dual in the 1 / w
//    metric, code/measure/photon-wave). Bulk beside, reported: the 3 bulk photons at n = (0,0,-1,1), same
//    targets. Also reported: the E-FRC-0164 rule and the sine remainder at m1, both polarizations, all targets
// D. The hot field on the husk, the E-FRC-0169 A protocol (hashed start at beta 3, 300 beats settling, 2,000
//    measured, husk m1 and m2, lag 3, track (0,0,1)): the lagged estimator (mean of the light branches, at
//    least one) and the autocorrelation zero crossing at m1 each within 2 percent of the bare symbol's photon.
//    The linear remainder force averages exactly (p / q) B, so its renormalized coupling is p / q itself.
//    Reported: the difference estimator, the branch count, the fitted m^2, <cos B>; the E-FRC-0165 bulk
//    protocol beside (side 8, (1,0,0,0) and (2,0,0,0), 500 + 3,000); the E-FRC-0164 rule on the husk
//    protocol against its own renormalized prediction kappa <cos B>
// E. The love and fear on the husk, the E-FRC-0169 C protocol (4,000 beats, the projected flux averaged over
//    beats 400 to 4,000), against the floating-point linear rule run from the same string, whose relaxed field
//    carries the conserved k = 0 flux that huskCoulomb leaves out (E-FRC-0180 D):
//    E1 r = 1: the departure from the linear rule's relaxed field, x = ||P<E> - P<E_lin>|| / ||P E_string -
//       E_C||, times the charge, under 4.5 flux units at e = 16, 64 and 256 (E-FRC-0180 read residual times
//       e of 8.5 to 9.6 for the E-FRC-0164 rule: half of that, at every charge). Control, reported: the
//       E-FRC-0164 rule on the same measure
//    E2 e = 64, r = 1 to 4: the husk energy of the averaged field within 1 percent of the linear rule's
//       (E-FRC-0180: 11 to 13 percent above for the E-FRC-0164 rule)
//    Reported: the residual against huskCoulomb and its late-window growth, as E-FRC-0180 D read them
// F. Stability and heating against the E-FRC-0164 rule, both run with no hops:
//    F1 the E-FRC-0164 energy protocol (side 4, its start, 2,000 beats): the shadow energy 1/2 E(-) . E(+) +
//       V(B) moves by under 10 percent, and grows per beat less than the E-FRC-0164 rule's on the same start
//    F2 the E-FRC-0180 C3 protocol (side 8, hashed start at beta 3, 500 beats settling then 2,000): the
//       shadow drift between the first and last 200 beats at most half the E-FRC-0164 rule's in magnitude.
//       Wraps of B across N / 2 counted and reported
// H. What the remainder is, on the side-4 start over 500 beats: the angle equals its start plus the running
//    sum of the flux (0 mismatches, E-FRC-0175's identity), and every remainder equals (r_0 + sum over past
//    beats of T[B]) mod q with B computed from that running-sum angle alone (0 mismatches), for the Weyl and
//    the zero start remainders. Reported: from the same angles and fluxes, the Weyl and zero remainders give
//    different futures (the first beat the fluxes differ, the links differing after 500 beats)
//    H2, added by the resuming agent after A and H had run once in a section probe (tmp/frc0181-AH.log, all
//    of the checks above at 0): while no plaquette wraps, every remainder equals (r_0 + p curl D) mod q, D
//    each link's second running sum of the flux copied across it (the sum over beats of its unwrapped angle),
//    mod q. 0 mismatches, over every plaquette and beat, both starts. The wrapped plaquette-beats are counted
//
// Depth L2: lattice electrodynamics with an error-diffusion force, a known numerical device (sigma-delta
// modulation, Bresenham's line algorithm), built reversible and measured against the exact linear theory.

import { experiment } from '@/test/scaffold/suite'
import { verdict } from '@/test/scaffold/verdict'
import {
  addHashedCurl,
  changePhotonFrame,
  emptyPhotonState,
  magneticSum,
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
import {
  copyRemainderState,
  emptyRemainderState,
  makeRemainderRule,
  paid,
  remainderBeatBackInPlace,
  remainderBeatInPlace,
  remainderKappa,
  repaid,
  type RemainderRule,
  type RemainderState,
} from '@/code/rule/photon-remainder'
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
import {
  autocorrelationFirstZero,
  bulkPhase,
  bulkPhotons,
  huskPhase,
  huskPhotons,
  launchWave,
  modeProjector,
  threePoint,
  type Launch,
  type Photon,
} from '@/code/measure/photon-wave'

// the E-FRC-0169 hot-field protocol (section D) keeps the side-12 box; the coherent waves (B, C), the love and
// fear (E) and the heating (F2) run on the side-8 box (husk 8^3), fixed before the first run (see the header)
const SIDE = 12
const SMALL_SIDE = 8
const N = 8192
const K = 80
const Q = 65536
const BETA = 3
const LAG = 3
const DOUBLING = [1.6, 2.1] as const
const WAVE_BEATS = 300
const CHARGE = 64
const GOLDEN = (Math.sqrt(5) - 1) / 2
const E164_KAPPA = (2 * Math.PI * K) / N
const E180_RESIDUAL_UNITS = 9

const mean = (xs: readonly number[]): number => xs.reduce((a, b) => a + b, 0) / Math.max(1, xs.length)
const modulo = (x: number, m: number): number => ((x % m) + m) % m
const q2 = (w: number): number => 4 * Math.sin(w / 2) ** 2

export const linearRule = (lattice: PhotonLattice, charge = 1, on: 'plaquette' | 'link' = 'plaquette'): RemainderRule =>
  makeRemainderRule({ lattice, n: N, k: K, q: Q, form: 'linear', on, charge })
const sineRule = (lattice: PhotonLattice, charge = 1): RemainderRule => makeRemainderRule({ lattice, n: N, k: K, q: Q, form: 'sine', charge })
const tableRule = (lattice: PhotonLattice, charge = 1): PhotonRule => makePhotonRule({ lattice, n: N, k: K, capacity: 0, hop: false, charge })

// a PhotonState view sharing the remainder state's arrays, for the photon-links helpers
export const view = (s: RemainderState): PhotonState => ({ vibe: s.vibe, angle: s.angle, flux: s.flux, demon: new Int32Array(s.flux.length) })

// a rule run one beat at a time, whatever it is
type Stepper = { readonly flux: ArrayLike<number>; readonly angle: ArrayLike<number>; beat(t: number): void }

export function remainderStepper(rule: RemainderRule, s: RemainderState): Stepper {
  return { flux: s.flux, angle: s.angle, beat: () => remainderBeatInPlace(rule, s) }
}

function tableStepper(rule: PhotonRule, s: PhotonState): Stepper {
  return { flux: s.flux, angle: s.angle, beat: t => void photonBeatInPlace(rule, s, t) }
}

export function linearStepper(lattice: PhotonLattice, kappa: number, angle0: ArrayLike<number>, flux0: ArrayLike<number>): Stepper {
  const angle = Float64Array.from(angle0, x => centered(x, N))
  const flux = Float64Array.from(flux0)
  const step = makeLinearLeapfrog(lattice, kappa)

  return { flux, angle, beat: () => step.beat(angle, flux) }
}

// the E-FRC-0164 start: love-fear pairs on hashed neighboring docks joined by one unit of flux, hashed angles
// within 512, hashed transverse flux within 181
function start164(rule: PhotonRule, s: PhotonState, scale: number): void {
  const { lattice } = rule

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

// the E-FRC-0165 / 0169 hashed start at beta 3: the curl of plaquette integers within sqrt(3 T / 4)
export function hotStart(rule: PhotonRule, s: PhotonState): void {
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

const allZero = (a: ArrayLike<number>): boolean => {
  for (let i = 0; i < a.length; i++) {
    if (a[i] !== 0) {
      return false
    }
  }

  return true
}

// A. reversibility

export function sectionA(): Record<string, number> & { ok: number } {
  const out: Record<string, number> = {}
  const small = photonLatticeD4({ side: 4 })

  // A1 exhaustive, on the tables themselves
  let exhaustiveFailures = 0

  for (const rule of [linearRule(small), sineRule(small)]) {
    for (let b = 0; b < N; b++) {
      const t = rule.table[b] ?? 0

      for (let r = 0; r < Q; r++) {
        const f = paid(t, r, Q)
        const next = t + r - Q * f
        const back = repaid(t, next, Q)

        if (next < 0 || next >= Q || back !== f || next + Q * back - t !== r) {
          exhaustiveFailures += 1
        }
      }
    }
  }

  out['a1PairsChecked'] = 2 * N * Q
  out['a1Failures'] = exhaustiveFailures

  // A2, A3
  let restored = true
  let gauss = 0
  let frame = 0

  for (const [side, beats] of [
    [4, 2000],
    [5, 500],
  ] as const) {
    const lattice = side === 4 ? small : photonLatticeD4({ side })

    for (const [name, rule] of [
      ['Linear', linearRule(lattice)],
      ['Sine', sineRule(lattice)],
    ] as const) {
      const s = emptyRemainderState(rule, 'weyl')

      start164(rule.base, view(s), 1.37)

      const s0 = copyRemainderState(s)

      for (let t = 0; t < beats; t++) {
        remainderBeatInPlace(rule, s)
        gauss += photonGaussViolations(rule.base, view(s))
      }

      const moved = differing(s.angle, s0.angle)

      for (let t = 0; t < beats; t++) {
        remainderBeatBackInPlace(rule, s)
      }

      const mismatches = differing(s.angle, s0.angle) + differing(s.flux, s0.flux) + differing(s.remainder, s0.remainder) + differing(s.vibe, s0.vibe)

      out[`a2Side${side}${name}Mismatches`] = mismatches
      out[`a2Side${side}${name}AnglesMoved`] = moved
      restored = restored && mismatches === 0 && moved > 0

      // A3 the frame change
      const chi = Array.from({ length: lattice.cells }, (_, x) => Math.floor((((x + 11) * GOLDEN * 5.9) % 1) * N))
      const a = copyRemainderState(s0)
      const b: RemainderState = { ...copyRemainderState(s0), angle: changePhotonFrame(rule.base, view(s0), chi).angle }

      for (let t = 0; t < 48; t++) {
        remainderBeatInPlace(rule, a)
        remainderBeatInPlace(rule, b)
        frame += differing(changePhotonFrame(rule.base, view(a), chi).angle, b.angle) + differing(a.flux, b.flux) + differing(a.remainder, b.remainder)
      }
    }
  }

  out['a2Restored'] = restored ? 1 : 0
  out['a3GaussViolations'] = gauss
  out['a3FrameMismatches'] = frame

  // the control: a remainder on each link
  const link = linearRule(small, 1, 'link')
  const s = emptyRemainderState(link, 'weyl')

  start164(link.base, view(s), 1.37)

  const s0 = copyRemainderState(s)

  let linkGauss = 0

  for (let t = 0; t < 48; t++) {
    remainderBeatInPlace(link, s)
    linkGauss += photonGaussViolations(link.base, view(s))
  }

  for (let t = 0; t < 48; t++) {
    remainderBeatBackInPlace(link, s)
  }

  out['aControlLinkGaussViolations'] = linkGauss
  out['aControlLinkMismatchesAfterBack'] = differing(s.angle, s0.angle) + differing(s.flux, s0.flux) + differing(s.remainder, s0.remainder)
  out['aP'] = linearRule(small).p
  out['aQ'] = Q
  out['aKappa'] = remainderKappa(linearRule(small))
  out['aKappaOverE164'] = remainderKappa(linearRule(small)) / E164_KAPPA - 1

  return { ...out, ok: exhaustiveFailures === 0 && restored && gauss === 0 && frame === 0 ? 1 : 0 }
}

// B and C. coherent waves

type WaveReading = { omega: number; stillBeats: number; frozenBeats: number; peak: number }

function runWave(stepper: Stepper, project: (flux: ArrayLike<number>) => [number, number], initial: Int32Array): WaveReading & { series: [number, number][] } {
  const series: [number, number][] = [[0, 0]]

  let still = 0
  let frozen = 0

  for (let t = 0; t < WAVE_BEATS; t++) {
    stepper.beat(t)
    series.push(project(stepper.flux))
    frozen += allZero(stepper.flux) ? 1 : 0
    still += differing(stepper.angle, initial) === 0 ? 1 : 0
  }

  return { omega: frozen === WAVE_BEATS ? 0 : threePoint(series), stillBeats: still, frozenBeats: frozen, peak: 0, series }
}

type Kind = 'remainder' | 'remainderZero' | 'sine' | 'e164' | 'linear'

type Wave = { husk?: Husk; lattice: PhotonLattice; readLattice: PhotonLattice; n: readonly number[]; phase: Float64Array; photon: Photon }

function wave(w: Wave, kind: Kind, target: number, kappa: number): WaveReading {
  const launch: Launch = launchWave({ lattice: w.lattice, n: N, phase: w.phase, v: w.photon.v, target })
  const projector = modeProjector(w.readLattice, w.n, w.photon.read)
  const husk = w.husk
  const project = husk ? (flux: ArrayLike<number>): [number, number] => projector(projectLinks(husk, flux)) : projector

  let stepper: Stepper

  if (kind === 'linear') {
    stepper = linearStepper(w.lattice, kappa, launch.angle, new Float64Array(w.lattice.links))
  } else if (kind === 'e164') {
    const rule = tableRule(w.lattice)
    const s = emptyPhotonState(rule)

    s.angle.set(launch.angle)
    stepper = tableStepper(rule, s)
  } else {
    const rule = kind === 'sine' ? sineRule(w.lattice) : linearRule(w.lattice)
    const s = emptyRemainderState(rule, kind === 'remainderZero' ? 'zero' : 'weyl')

    s.angle.set(launch.angle)
    stepper = remainderStepper(rule, s)
  }

  const reading = runWave(stepper, project, Int32Array.from(launch.angle))

  return { omega: reading.omega, stillBeats: reading.stillBeats, frozenBeats: reading.frozenBeats, peak: launch.peak }
}

export function sectionBC(bulk: PhotonLattice, husk: Husk): Record<string, number> & { okB: number; okC: number; okC0: number } {
  const out: Record<string, number> = {}
  const kappa = remainderKappa(linearRule(bulk))
  const huskWave = (m: readonly number[], photon: Photon): Wave => ({ husk, lattice: bulk, readLattice: husk.lattice, n: m, phase: huskPhase(husk, m), photon })
  const m1 = huskPhotons(husk, [1, 0, 0], kappa)

  // B
  let okB = true

  for (let target = 1; target <= 8; target++) {
    const w = huskWave([1, 0, 0], m1[0]!)
    const r = wave(w, 'remainder', target, kappa)
    const error = r.omega / w.photon.omega - 1
    const control = wave(w, 'e164', target, kappa)

    out[`bTarget${target}Peak`] = r.peak
    out[`bTarget${target}StillBeats`] = r.stillBeats
    out[`bTarget${target}OverSymbol`] = error
    out[`bTarget${target}E164FrozenBeats`] = control.frozenBeats
    out[`bTarget${target}E164OverSymbol`] = control.omega / w.photon.omega - 1
    okB = okB && r.stillBeats < WAVE_BEATS && Math.abs(error) < 0.01

    if (target === 1 || target === 4 || target === 8) {
      out[`bTarget${target}ZeroDitherOverSymbol`] = wave(w, 'remainderZero', target, kappa).omega / w.photon.omega - 1
    }
  }

  // C
  let okC = true
  let okC0 = true
  let worst = 0
  let controlWorst = 0

  for (const m of [
    [1, 0, 0],
    [2, 0, 0],
    [3, 0, 0],
    [2, 2, 1],
  ]) {
    const photons = m[0] === 1 && m[1] === 0 ? m1 : huskPhotons(husk, m, kappa)

    photons.forEach((photon, i) => {
      const w = huskWave(m, photon)
      const tag = `cM${m.join('')}Even${i + 1}`

      out[`${tag}SymbolOmega`] = photon.omega

      for (const target of [16, 64, 256, 1024]) {
        const r = wave(w, 'remainder', target, kappa)
        const error = r.omega / photon.omega - 1

        out[`${tag}Target${target}OverSymbol`] = error
        worst = Math.max(worst, Math.abs(error))
        okC = okC && Math.abs(error) < 0.01

        if (m[0] === 1 && m[1] === 0) {
          out[`${tag}Target${target}SineOverSymbol`] = wave(w, 'sine', target, kappa).omega / photon.omega - 1
          out[`${tag}Target${target}E164OverSymbol`] = wave(w, 'e164', target, kappa).omega / photon.omega - 1
        }
      }

      const control = wave(w, 'linear', 256, kappa).omega / photon.omega - 1

      out[`${tag}LinearControlOverSymbol`] = control
      controlWorst = Math.max(controlWorst, Math.abs(control))
      okC0 = okC0 && Math.abs(control) < 1e-9
    })
  }

  out['cWorstHuskError'] = worst
  out['cLinearControlWorst'] = controlWorst

  // the bulk beside: k along the depth
  const depth = [0, 0, -1, 1]
  const phase = bulkPhase(bulk, depth)

  let bulkWorst = 0

  bulkPhotons(bulk, depth, kappa).forEach((photon, i) => {
    for (const target of [16, 64, 256, 1024]) {
      const r = wave({ lattice: bulk, readLattice: bulk, n: depth, phase, photon }, 'remainder', target, kappa)
      const error = r.omega / photon.omega - 1

      out[`cBulkDepthPhoton${i + 1}Target${target}OverSymbol`] = error
      bulkWorst = Math.max(bulkWorst, Math.abs(error))
    }
  })

  out['cBulkWorstError'] = bulkWorst

  return { ...out, okB: okB ? 1 : 0, okC: okC && okC0 ? 1 : 0, okC0: okC0 ? 1 : 0 }
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

type HotRun = { probes: Probe[]; series: number[][]; meanCos: number }

export function hotRun(input: {
  stepper: Stepper
  base: PhotonRule
  lattice: PhotonLattice
  viewOf: (flux: ArrayLike<number>) => ArrayLike<number>
  settle: number
  beats: number
  modes: number[][]
  track: readonly number[]
}): HotRun {
  const probes = input.modes.map(n => makeProbe(input.lattice, n))
  const series: number[][] = []
  const cosines: number[] = []

  for (let t = 0; t < input.settle + input.beats; t++) {
    input.stepper.beat(t)

    if (t < input.settle) {
      continue
    }

    const field = input.viewOf(input.stepper.flux)

    probes.forEach((p, i) => {
      const v = p.read(field)

      feed(p, v)

      if (i === 0) {
        series.push([v.re.reduce((a, x, j) => a + x * (input.track[j] ?? 0), 0), v.im.reduce((a, x, j) => a + x * (input.track[j] ?? 0), 0)])
      }
    })

    if ((t - input.settle) % 10 === 0) {
      cosines.push(magneticSum(input.base, Int32Array.from(input.stepper.angle)).meanCos)
    }
  }

  return { probes, series, meanCos: mean(cosines) }
}

function estimate(prefix: string, run: HotRun, exact: number, lambdas: readonly [number, number], kappa: number): Record<string, number> {
  const [p1, p2] = run.probes as [Probe, Probe]
  const cut = leapfrogOmega(kappa, 12) / 2
  const out: Record<string, number> = { [`${prefix}ExactOmega`]: exact, [`${prefix}MeanCos`]: run.meanCos }

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
    out[`${prefix}${name}Omega`] = w1
    out[`${prefix}${name}OverExact`] = w1 / exact - 1
    out[`${prefix}${name}LowestOverExact`] = (at1.omega[0] ?? 0) / exact - 1
    out[`${prefix}${name}MassSquaredOverM1`] = (q2(w1) - slope * lambdas[0]) / q2(w1)
  }

  const tau0 = autocorrelationFirstZero(run.series, 80)

  out[`${prefix}DirectOmega`] = Math.PI / (2 * tau0)
  out[`${prefix}DirectOverExact`] = Math.PI / (2 * tau0) / exact - 1

  return out
}

export function sectionD(bulk: PhotonLattice, husk: Husk, bulk8: PhotonLattice): Record<string, number> & { ok: number } {
  const out: Record<string, number> = {}
  const kappa = remainderKappa(linearRule(bulk))
  const huskModes = [
    [1, 0, 0],
    [2, 0, 0],
  ]
  const track = HUSK_VECTORS.map(u => u[2] ?? 0)
  const huskExact = mean(huskPhotons(husk, [1, 0, 0], kappa).map(p => p.omega))
  const huskLambdas = [linearWaveEigenvalues(bulk, bulkModeOfHusk([1, 0, 0]))[1] ?? 0, linearWaveEigenvalues(bulk, bulkModeOfHusk([2, 0, 0]))[1] ?? 0] as const
  const huskRun = (stepper: Stepper, base: PhotonRule): HotRun =>
    hotRun({ stepper, base, lattice: husk.lattice, viewOf: f => projectLinks(husk, f), settle: 300, beats: 2000, modes: huskModes, track })

  // the remainder rule on the husk
  const rule = linearRule(bulk)
  const s = emptyRemainderState(rule, 'weyl')

  hotStart(rule.base, view(s))
  Object.assign(out, estimate('dHusk', huskRun(remainderStepper(rule, s), rule.base), huskExact, huskLambdas, kappa))

  // the E-FRC-0164 rule on the same protocol, against its renormalized prediction
  const table = tableRule(bulk)
  const ts = emptyPhotonState(table)

  hotStart(table, ts)

  const tableRun = huskRun(tableStepper(table, ts), table)
  const renormalized = leapfrogOmega(E164_KAPPA * tableRun.meanCos, huskLambdas[0])

  Object.assign(out, estimate('dE164Husk', tableRun, renormalized, huskLambdas, E164_KAPPA))

  // the bulk beside, the E-FRC-0165 protocol
  const bulkModes = [
    [1, 0, 0, 0],
    [2, 0, 0, 0],
  ]
  const rule8 = linearRule(bulk8)
  const s8 = emptyRemainderState(rule8, 'weyl')

  hotStart(rule8.base, view(s8))

  const bulkRun = hotRun({
    stepper: remainderStepper(rule8, s8),
    base: rule8.base,
    lattice: bulk8,
    viewOf: f => f,
    settle: 500,
    beats: 3000,
    modes: bulkModes,
    track: bulk8.firsts.map(d => bulk8.vectors[d]?.[2] ?? 0),
  })
  const bulkExact = mean(bulkPhotons(bulk8, [1, 0, 0, 0], kappa).map(p => p.omega))
  const bulkLambdas = [linearWaveEigenvalues(bulk8, [1, 0, 0, 0])[1] ?? 0, linearWaveEigenvalues(bulk8, [2, 0, 0, 0])[1] ?? 0] as const

  Object.assign(out, estimate('dBulk', bulkRun, bulkExact, bulkLambdas, kappa))

  const lagged = out['dHuskLaggedOverExact'] ?? Number.NaN
  const direct = out['dHuskDirectOverExact'] ?? Number.NaN
  const ok = (out['dHuskLaggedLightBranches'] ?? 0) >= 1 && Math.abs(lagged) < 0.02 && Math.abs(direct) < 0.02

  return { ...out, ok: ok ? 1 : 0 }
}

// E. the love and fear

type PairField = { all: Float64Array; late: Float64Array; stringFlux: Float64Array; coulomb: { flux: Float64Array; energy: number } }

function pairRun(bulk: PhotonLattice, husk: Husk, r: number, charge: number, kind: 'remainder' | 'e164' | 'linear'): PairField {
  const base = tableRule(bulk, charge)
  const root = (v: number[]): number => bulk.vectors.findIndex(x => x.every((y, i) => y === v[i]))
  const up = root([1, 0, 0, 1])
  const down = root([1, 0, 0, -1])
  const ps = emptyPhotonState(base)

  placePairAlong(base, ps, 0, Array.from({ length: r }, (_, i) => (i % 2 === 0 ? up : down)), 1)

  const stringFlux = projectLinks(husk, ps.flux)
  const coulomb = huskCoulomb(husk, Float64Array.from(columnSum(husk, ps.vibe), x => x * charge))

  let stepper: Stepper

  if (kind === 'linear') {
    stepper = linearStepper(bulk, remainderKappa(linearRule(bulk)), ps.angle, ps.flux)
  } else if (kind === 'e164') {
    stepper = tableStepper(base, ps)
  } else {
    const rule = linearRule(bulk, charge)
    const s = emptyRemainderState(rule, 'weyl')

    s.vibe.set(ps.vibe)
    s.flux.set(ps.flux)
    stepper = remainderStepper(rule, s)
  }

  const all = new Float64Array(stringFlux.length)
  const late = new Float64Array(stringFlux.length)
  const settle = 400
  const beats = 4000
  const half = 2200

  for (let t = 0; t < beats; t++) {
    stepper.beat(t)

    if (t >= settle) {
      const p = projectLinks(husk, stepper.flux)

      for (let i = 0; i < p.length; i++) {
        all[i] = (all[i] ?? 0) + (p[i] ?? 0) / (beats - settle)

        if (t >= half) {
          late[i] = (late[i] ?? 0) + (p[i] ?? 0) / (beats - half)
        }
      }
    }
  }

  return { all, late, stringFlux, coulomb }
}

const distance = (a: ArrayLike<number>, b: (i: number) => number): number => {
  let sum = 0

  for (let i = 0; i < a.length; i++) {
    sum += ((a[i] ?? 0) - b(i)) ** 2
  }

  return Math.sqrt(sum)
}

export function sectionE(bulk: PhotonLattice, husk: Husk): Record<string, number> & { ok: number; okE1: number; okE2: number } {
  const out: Record<string, number> = {}
  const linear = new Map<number, PairField>()

  for (const r of [1, 2, 3, 4]) {
    linear.set(r, pairRun(bulk, husk, r, CHARGE, 'linear'))
  }

  const read = (tag: string, field: PairField, r: number, charge: number): number => {
    const lin = linear.get(r)!
    const scale = charge / CHARGE
    const denominator = distance(field.stringFlux, i => field.coulomb.flux[i] ?? 0)
    const x = distance(field.all, i => scale * (lin.all[i] ?? 0)) / denominator

    out[`${tag}Residual`] = distance(field.all, i => field.coulomb.flux[i] ?? 0) / denominator
    out[`${tag}ResidualLate`] = distance(field.late, i => field.coulomb.flux[i] ?? 0) / denominator
    out[`${tag}FromLinear`] = x
    out[`${tag}FromLinearTimesCharge`] = x * charge
    out[`${tag}EnergyOverCoulomb`] = huskEnergy(field.all) / field.coulomb.energy
    out[`${tag}EnergyOverLinear`] = huskEnergy(field.all) / (scale * scale * huskEnergy(lin.all))

    return x
  }

  for (const r of [1, 2, 3, 4]) {
    const lin = linear.get(r)!

    out[`eR${r}LinearResidual`] = distance(lin.all, i => lin.coulomb.flux[i] ?? 0) / distance(lin.stringFlux, i => lin.coulomb.flux[i] ?? 0)
    out[`eR${r}LinearEnergyOverCoulomb`] = huskEnergy(lin.all) / lin.coulomb.energy
  }

  let okE1 = true
  let controlLargest = 0

  for (const charge of [16, 64, 256]) {
    const x = read(`eR1Charge${charge}`, pairRun(bulk, husk, 1, charge, 'remainder'), 1, charge)
    const control = read(`eR1Charge${charge}E164`, pairRun(bulk, husk, 1, charge, 'e164'), 1, charge)

    okE1 = okE1 && x * charge < E180_RESIDUAL_UNITS / 2
    controlLargest = Math.max(controlLargest, control * charge)
  }

  let okE2 = true

  for (const r of [1, 2, 3, 4]) {
    const field = r === 1 ? undefined : pairRun(bulk, husk, r, CHARGE, 'remainder')

    if (field) {
      read(`eR${r}Charge${CHARGE}`, field, r, CHARGE)
    }

    okE2 = okE2 && Math.abs((out[`eR${r}Charge${CHARGE}EnergyOverLinear`] ?? 0) - 1) < 0.01
  }

  out['eControlE164LargestFromLinearTimesCharge'] = controlLargest

  return { ...out, okE1: okE1 ? 1 : 0, okE2: okE2 ? 1 : 0, ok: okE1 && okE2 ? 1 : 0 }
}

// F. heating

// the potential of each form at every B: the linear (p / q) B^2 / 2, the sine (K N / 2 pi)(1 - cos 2 pi B / N)
function potentialTable(form: 'linear' | 'sine', kappa: number): Float64Array {
  return Float64Array.from({ length: N }, (_, b) => {
    const c = centered(b, N)

    return form === 'linear' ? (kappa * c * c) / 2 : ((K * N) / (2 * Math.PI)) * (1 - Math.cos((2 * Math.PI * b) / N))
  })
}

// run `beats` beats, reading the shadow energy 1/2 E(-) . E(+) + sum V(B) after each, and the wraps of B
function shadowSeries(stepper: Stepper, base: PhotonRule, potential: Float64Array, beats: number, every: number, from: number): { shadow: number[]; wraps: number } {
  const plaquettes = base.lattice.plaquetteCount
  const shadow: number[] = []

  let previous = new Int32Array(plaquettes)
  let wraps = 0

  for (let t = 0; t < beats; t++) {
    const before = Float64Array.from(stepper.flux)

    stepper.beat(t)

    const angle = Int32Array.from(stepper.angle)
    const b = new Int32Array(plaquettes)

    for (let p = 0; p < plaquettes; p++) {
      b[p] = centered(plaquetteField(base, angle, p), N)

      if (t > 0 && Math.abs((b[p] ?? 0) - (previous[p] ?? 0)) > N / 2) {
        wraps += 1
      }
    }

    previous = b

    if (t >= from && (t - from) % every === 0) {
      let e = 0

      for (let l = 0; l < before.length; l++) {
        e += ((before[l] ?? 0) * (stepper.flux[l] ?? 0)) / 2
      }

      for (let p = 0; p < plaquettes; p++) {
        e += potential[modulo(b[p] ?? 0, N)] ?? 0
      }

      shadow.push(e)
    }
  }

  return { shadow, wraps }
}

export function sectionF(bulk8: PhotonLattice): Record<string, number> & { ok: number; okF1: number; okF2: number } {
  const out: Record<string, number> = {}
  const kappa = remainderKappa(linearRule(photonLatticeD4({ side: 4 })))
  const linearV = potentialTable('linear', kappa)
  const sineV = potentialTable('sine', kappa)

  // F1 the E-FRC-0164 protocol
  const small = photonLatticeD4({ side: 4 })
  const f1 = (kind: 'remainder' | 'e164' | 'sine'): { drift: number; growth: number; wraps: number } => {
    let stepper: Stepper
    let base: PhotonRule

    if (kind === 'e164') {
      base = tableRule(small)

      const s = emptyPhotonState(base)

      start164(base, s, 1.37)
      stepper = tableStepper(base, s)
    } else {
      const rule = kind === 'sine' ? sineRule(small) : linearRule(small)
      const s = emptyRemainderState(rule, 'weyl')

      base = rule.base
      start164(base, view(s), 1.37)
      stepper = remainderStepper(rule, s)
    }

    const { shadow, wraps } = shadowSeries(stepper, base, kind === 'remainder' ? linearV : sineV, 2000, 1, 0)
    const first = shadow[0] ?? 1
    const window = 200

    return {
      drift: Math.max(...shadow.map(e => Math.abs(e - first) / first)),
      growth: (mean(shadow.slice(-window)) - mean(shadow.slice(0, window))) / (shadow.length - window),
      wraps,
    }
  }
  const r1 = f1('remainder')
  const t1 = f1('e164')
  const s1 = f1('sine')

  out['f1RemainderLargestMove'] = r1.drift
  out['f1RemainderGrowthPerBeat'] = r1.growth
  out['f1RemainderWraps'] = r1.wraps
  out['f1E164LargestMove'] = t1.drift
  out['f1E164GrowthPerBeat'] = t1.growth
  out['f1E164Wraps'] = t1.wraps
  out['f1SineRemainderLargestMove'] = s1.drift
  out['f1SineRemainderGrowthPerBeat'] = s1.growth

  const okF1 = r1.drift < 0.1 && r1.growth < t1.growth

  // F2 the E-FRC-0180 C3 protocol
  const f2 = (kind: 'remainder' | 'e164' | 'sine'): { drift: number; wraps: number; start: number } => {
    let stepper: Stepper
    let base: PhotonRule

    if (kind === 'e164') {
      base = tableRule(bulk8)

      const s = emptyPhotonState(base)

      hotStart(base, s)
      stepper = tableStepper(base, s)
    } else {
      const rule = kind === 'sine' ? sineRule(bulk8) : linearRule(bulk8)
      const s = emptyRemainderState(rule, 'weyl')

      base = rule.base
      hotStart(base, view(s))
      stepper = remainderStepper(rule, s)
    }

    const { shadow, wraps } = shadowSeries(stepper, base, kind === 'remainder' ? linearV : sineV, 2500, 10, 500)
    const startMean = mean(shadow.slice(0, 20))

    return { drift: (mean(shadow.slice(-20)) - startMean) / mean(shadow), wraps, start: startMean }
  }
  const r2 = f2('remainder')
  const t2 = f2('e164')
  const s2 = f2('sine')

  out['f2RemainderDrift'] = r2.drift
  out['f2RemainderWraps'] = r2.wraps
  out['f2RemainderShadowStart'] = r2.start
  out['f2E164Drift'] = t2.drift
  out['f2E164Wraps'] = t2.wraps
  out['f2E164ShadowStart'] = t2.start
  out['f2SineRemainderDrift'] = s2.drift
  out['f2SineRemainderWraps'] = s2.wraps
  out['f2DriftRatio'] = Math.abs(r2.drift) / Math.abs(t2.drift)

  const okF2 = Math.abs(r2.drift) <= 0.5 * Math.abs(t2.drift)

  return { ...out, okF1: okF1 ? 1 : 0, okF2: okF2 ? 1 : 0, ok: okF1 && okF2 ? 1 : 0 }
}

// H. the remainder as history

export function sectionH(): Record<string, number> & { ok: number } {
  const out: Record<string, number> = {}
  const small = photonLatticeD4({ side: 4 })
  const rule = linearRule(small)
  const plaquettes = small.plaquetteCount
  const beats = 500

  let ok = true

  const runs: RemainderState[] = []

  for (const dither of ['weyl', 'zero'] as const) {
    const s = emptyRemainderState(rule, dither)

    start164(rule.base, view(s), 1.37)

    const r0 = Int32Array.from(s.remainder)
    const history = Int32Array.from(s.angle)
    const sums = new Float64Array(plaquettes)
    // H2: each link's own records, both running sums of what the stream copied across it: the unwrapped angle
    // (its centered start plus every flux) and the second sum D of the unwrapped angle, mod q. With no wrap,
    // centered(B) is the curl of the unwrapped angles, so r = (r0 + p curl D) mod q: the remainder is the curl
    // of a per-link history
    const unwrapped = Int32Array.from(s.angle, a => centered(a, N))
    const second = new Int32Array(small.links)
    const size = small.plaquetteSize

    let angleMismatches = 0
    let remainderMismatches = 0
    let curlMismatches = 0
    let wraps = 0

    runs.push(copyRemainderState(s))

    for (let t = 0; t < beats; t++) {
      // the angle from history alone: its start plus the flux the stream copied across, beat by beat
      for (let l = 0; l < history.length; l++) {
        history[l] = modulo((history[l] ?? 0) + (s.flux[l] ?? 0), N)
        unwrapped[l] = (unwrapped[l] ?? 0) + (s.flux[l] ?? 0)
        second[l] = modulo((second[l] ?? 0) + (unwrapped[l] ?? 0), Q)
      }

      remainderBeatInPlace(rule, s)
      angleMismatches += differing(history, s.angle)

      for (let p = 0; p < plaquettes; p++) {
        sums[p] = (sums[p] ?? 0) + (rule.table[plaquetteField(rule.base, history, p)] ?? 0)
        remainderMismatches += modulo((r0[p] ?? 0) + (sums[p] ?? 0), Q) === s.remainder[p] ? 0 : 1

        let bInt = 0
        let curlD = 0

        for (let j = 0; j < size; j++) {
          const sign = small.plaquetteSigns[p * size + j] ?? 0
          const l = small.plaquetteLinks[p * size + j] ?? 0

          bInt += sign * (unwrapped[l] ?? 0)
          curlD += sign * (second[l] ?? 0)
        }

        wraps += bInt === centered(plaquetteField(rule.base, history, p), N) ? 0 : 1
        curlMismatches += modulo((r0[p] ?? 0) + modulo(rule.p * modulo(curlD, Q), Q), Q) === s.remainder[p] ? 0 : 1
      }
    }

    const tag = dither === 'weyl' ? 'Weyl' : 'Zero'

    out[`h${tag}AngleMismatches`] = angleMismatches
    out[`h${tag}RemainderMismatches`] = remainderMismatches
    out[`h2${tag}CurlOfLinkHistoryMismatches`] = curlMismatches
    out[`h2${tag}PlaquetteBeatsWrapped`] = wraps
    ok = ok && angleMismatches === 0 && remainderMismatches === 0 && (wraps > 0 || curlMismatches === 0)
  }

  // the same angles and fluxes, two remainders: do the futures differ
  const [a, b] = runs as [RemainderState, RemainderState]

  let first = -1

  for (let t = 0; t < beats; t++) {
    remainderBeatInPlace(rule, a)
    remainderBeatInPlace(rule, b)

    if (first < 0 && differing(a.flux, b.flux) > 0) {
      first = t
    }
  }

  out['hChecked'] = 2 * beats * plaquettes
  out['hDitherFirstDifferentBeat'] = first
  out['hDitherLinksDifferingAfter500'] = differing(a.flux, b.flux)
  out['hLinks'] = small.links

  return { ...out, ok: ok ? 1 : 0 }
}

export default experiment({
  id: 'gauge/photon-remainder',
  code: 'E-FRC-0181',
  title:
    "light with a carried remainder: the leapfrog U(1) sector with an error-diffusion force, f = floor((p B + r) / q) and r' = (p B + r) mod q on each plaquette, stays an exact integer bijection with Gauss's law, has no dead zone, and is tested against the exact photon symbol for coherent husk waves from |B| = 1 to 1024, the hot-field estimators, the love-fear field and heating; the remainder is the history of a triangle of links, not of one link",
  category: 'gauge',
  substrates: ['3434'],
  depth: 'L2',
  paper: false,
  run() {
    const bulk = photonLatticeD4({ side: SIDE })
    const husk = makeHusk(bulk)
    const bulk8 = photonLatticeD4({ side: SMALL_SIDE })
    const husk8 = makeHusk(bulk8)
    const a = sectionA()
    const bc = sectionBC(bulk8, husk8)
    const d = sectionD(bulk, husk, bulk8)
    const e = sectionE(bulk8, husk8)
    const f = sectionF(bulk8)
    const h = sectionH()
    const sections = [a.ok, bc.okB, bc.okC, d.ok, e.okE1, e.okE2, f.okF1, f.okF2, h.ok]
    const strip = (r: Record<string, number>): Record<string, number> => Object.fromEntries(Object.entries(r).filter(([key]) => !key.startsWith('ok')))

    return verdict({
      status: sections.every(x => x === 1) ? 'pass' : sections.some(x => x === 1) ? 'partial' : 'fail',
      claim:
        "with the remainder on each plaquette the beat reverses bit-exactly (every B and remainder, and 2,000 beats on the lattice), keeps Gauss's law and the frame change exactly, moves a husk wave at every |B| from 1 to 8 at the symbol's frequency within 1 percent, runs every coherent husk wave from |B| 16 to 1024 within 1 percent of the symbol for both polarizations, lets the hot-field estimators read the bare photon within 2 percent, relaxes a love and a fear onto the linear rule's field with a leftover under half of E-FRC-0180's at every charge and its energy within 1 percent, heats less than the E-FRC-0164 rule, and holds a remainder that is exactly the history of its triangle's angles",
      metrics: {
        ...strip(bc),
        ...strip(d),
        ...strip(e),
        ...strip(a),
        ...strip(f),
        ...strip(h),
        sectionA: a.ok,
        sectionB: bc.okB,
        sectionC: bc.okC,
        sectionC0: bc.okC0,
        sectionD: d.ok,
        sectionE1: e.okE1,
        sectionE2: e.okE2,
        sectionF1: f.okF1,
        sectionF2: f.okF2,
        sectionH: h.ok,
      },
      control: {
        linkRemainderGaussViolations: a['aControlLinkGaussViolations'] ?? -1,
        e164FrozenBeatsAtTarget4: bc['bTarget4E164FrozenBeats'] ?? -1,
        e164LoveFearFromLinearTimesCharge: e['eControlE164LargestFromLinearTimesCharge'] ?? -1,
        e164HuskLaggedOverRenormalized: d['dE164HuskLaggedOverExact'] ?? -1,
      },
      notes:
        "L2, exact integers, deterministic (golden-ratio Weyl dithers and hashed starts, no seeds). First run 2026-09-26 (tmp/frc0181.log, 568 s), partial. The first launch, at side 12 everywhere, was stopped before it printed; the resuming agent moved B, C and E to side 8 and added H2 before seeing any number from B to G (A and H had run once in a section probe), all disclosed in the header. Passes: A (0 failures over 1,073,741,824 kick pairs, 0 mismatches after 2,000 beats back, 0 Gauss violations, the link-remainder control 9,730), B (every target 1 to 8 moves and reads within 0.17 percent, the E-FRC-0164 rule frozen at all 8, and the ZERO start remainder reads 224, 34 and 5 percent off at targets 1, 4, 8, so the Weyl dither carries the small waves), C (worst husk reading 1.3e-4 of the symbol over 32, bulk 6.6e-5, where the E-FRC-0164 rule reads +2.3 percent at 16 and -1.9 at 1024 and the sine remainder -1.9 at 1024), H and H2 (0 mismatches, 0 wraps). E1 passes its threshold (2.79 to 2.85 units at e = 16, 64, 256) BUT the E-FRC-0164 control on the side-8 box also reads under it (3.88 to 4.36, against 8.5 to 9.6 at side 12 in E-FRC-0180), so the gate as moved to side 8 does not discriminate: the remainder removes about 35 percent of the leftover, not half, and what is left is a constant near 2.8 flux units at every charge, the floor of an integer flux. Fails: D, the lagged estimator reads the husk photon 25.6 percent fast (lowest branch +1.2 percent, the direct autocorrelation -0.06 percent, the difference estimator admits no light branch); E2, the husk energy of the averaged field sits 1.1 to 1.5 percent above the linear rule's at e = 64 (the E-FRC-0164 control 3.4 percent at r = 1); F1, the shadow energy moves 0.6 percent but grows 722 per beat against the E-FRC-0164 rule's 570 (3 wraps of B for the linear table on that start, 100 for the sine); F2, drift 1.0 percent against 1.6, ratio 0.63 against the 0.5 gate. Diagnosis (tmp/remainder-hot-probe.ts, side 8, not a gate): from the same start the float linear rule shows 3 frequencies at m1 (the photon at 0.15755 against 0.15763) and the remainder rule 8, its light pair split to 0.177 and 0.238. The carried error f - (p B + r) / q is a zero-mean kick of order one flux unit on every plaquette every beat. It averages away in the mean field, which is why B, C and H are exact, but it drives every husk direction as a broadband source, which the correlation-matrix estimators, the energy and the heating all see. A random-walk estimate made after the run, 1/2 x 3,072 links x 8 plaquettes per link x 1/12, gives about 1,000 per beat on the F1 box, the order of the measured 722.",
    })
  },
})
