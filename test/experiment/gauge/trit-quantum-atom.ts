// The first quantum atom on trits (E-FRC-0221): the stand-in hydrogen's fear-walk electron coupled to the
// shaped trit light, semiclassically. A STAND-IN: the electron is the band-projected fear walk of E-MTR-0001
// (mass sqrt 3), its amplitudes floats run by FFT; the nucleus is a pinned stand-in of Z = 74 units whose
// static field is the light's own lattice Coulomb field (coefficient 1 / (24 D), E-FRC-0212), so the Bohr
// radius is a = 24 D / (sqrt 3 Z) = 3.00 docks at D = 16. Nothing here is an L3 derivation.
//
// E-FRC-0216 found that a classical point charge cannot make an atom on trits: each whole-unit crossing
// radiates about 16 r times the binding, and a stand-in pair on a circular orbit flew apart (4 to 1,172.6
// docks). Here the electron's charge and current are spread by amplitudes.
//
// THE COUPLING (code/measure/trit-quantum-atom, code/rule/trit-husk-polarized, derived before any run):
//   the light sees the expectation of the electron's string over the signed whole, S*_l = sum_x (rho(x) -
//   rho0(x)) Pi_l(x) (the path-averaged string from the nucleus, the multipolar choice of path), counted into
//   the rule as X = floor(q^L S* + theta) (thresholds at a fixed golden phase theta, never a rounding) and
//   carried by a bucket whose first difference is the integer string's departure from S*, so the whole-unit
//   jumps of the integer string telescope out of the light's shadow
//   the walk feels V(x) = d I / d rho(x), I the light's shadow invariant: the line integral from the nucleus
//   of (pi / D)(E~ / g + the leapfrog's cross term), a phase on its docks
//   the beat: half potential, kinetic step, load, half potential from the same light with the new source,
//   then the light beat with the source fixed. Reversed with the previous source read from exp(+i T) psi
//   L = 5 levels of carry shaping: the atom's fractional currents are small, and at three levels the light's
//   own residual (a random walk of about 1.4e-5 per triangle per beat at D = 16) outweighs their field; five
//   levels hold a driven light to the linear leapfrog's energy within 2e-5 (tmp/compact-atom-probe6b.log).
//   With compact counters (E-FRC-0219) five levels fit: 11 counters of 4 trits in the 48 counter trits of a
//   husk triangle at D = 16, and the buckets' 2 x 16 trits per husk axis link in what is left
// WHERE IT IS SEMICLASSICAL: the light sees the expectation rho = |psi|^2, one field for the whole signed
// ensemble, and the walk moves in that one field. A single history's charge does not source its own
// branch's light, the walk feels its own Hartree field (1/Z of the binding here), and an excited stationary
// state has no expectation dipole, so it cannot begin to radiate (E-FRC-0222 measures this).
//
// DISCLOSED: probes before these gates (tmp/compact-atom-probe1.log to probe6b.log): the lattice levels and
// the decay budget; a Lie splitting (energy offset 4e-3, reversal broken by floors at exactly zero), then a
// Strang splitting whose second half read the light after its beat (energy created: walk and light both
// gained); three levels (the light's own residual heating, 7e-7 per beat, in a driven isolated light); the
// back-action without the leapfrog's cross term. The design above is the one whose 300-beat probe on side 32
// kept matter plus light energy within 7.6e-6 of its value at beat 20 while the light gained 1.6e-4, reversed
// exactly, and decayed P_2p from 0.5 to 0.4961 (tmp/compact-atom-probe2c.log). The gates below were written
// after that probe, on the longer runs it did not make.
//
// Gates (side 32, D = 16, L = 5, Z = 74):
// B  bound: from 1s and from (1s + 2p_x) / sqrt 2, over 1,500 beats (15 Bohr orbital periods 2 pi m a^2,
//    10.6 periods of the 2p - 1s beat) the chance within radius 12 (4 a) stays within 0.01 of its start at
//    every read, and the walk's energy <T + V_Z> never rises more than 1e-3 (2 percent of |E_1s|) above its
//    start
// E  energy: the light beat keeps the light's invariant to 1e-9 per beat (the counters' departure) at every
//    read, and matter plus light, <T + V_Z> + I, stays within 0.15 of the light's largest energy of its value
//    at beat 20 (after the splitting's own offset settles) over the superposition's 1,500 beats; the one-way
//    control (the light driven, no back-action) departs by at least 0.8 of its light's energy over 300 beats
// G  Gauss: the integer flux's divergence equals the integer string's at every husk dock (the charge the
//    string records), and the shadow's divergence equals the expectation charge change, |div X / q^L +
//    (rho - rho0)| <= 6 / q^L, at every read
// R  reversal: the superposition's 1,500 beats run back return every light integer (0 mismatches), the
//    source the state holds equals the one counted from the reversed walk on every link of every beat (0),
//    and the walk to within 1e-12
// Reported: P_2p and P_1s, the light's energy, the integer crossings and integer charges, the 1s run's light.
// Status: pass if every gate passes, partial if B, G and R pass, fail otherwise.

import { experiment } from '@/test/scaffold/suite'
import { verdict } from '@/test/scaffold/verdict'
import {
  atomBeat,
  atomBeatBack,
  atomLevels,
  gaussReading,
  lightEnergy,
  lightMismatches,
  lightSnapshot,
  makeQuantumAtom,
  overlap,
  setWalk,
  sourceConsistency,
  walkEnergy,
  within,
} from '@/code/measure/trit-quantum-atom'

const SIDE = 32
const DEPTH = 16
const LEVELS = 5
const CHARGE = 74
const BEATS = 1500
const EVERY = 10
const RADIUS = 12

type Run = {
  inside: number[]
  walk: number[]
  light: number[]
  total: number[]
  p2: number[]
  p1: number[]
  lightBeat: number
  gaussShadow: number
  gaussIdentity: number
  integerMax: number
  integerDocks: number
  consistency: number
  crossings: number
  reversal?: { light: number; source: number; walk: number }
}

function run(start: 'superposition' | 'ground', coupled: boolean, beats: number, reverse: boolean): Run {
  const atom = makeQuantumAtom({ side: SIDE, depth: DEPTH, levels: LEVELS, charge: CHARGE, coupled })
  const lv = atomLevels(atom)
  const re = new Float64Array(SIDE ** 3)
  const im = new Float64Array(SIDE ** 3)

  for (let i = 0; i < re.length; i++) re[i] = start === 'ground' ? lv.s[i]! : (lv.s[i]! + lv.p[i]!) / Math.SQRT2

  setWalk(atom, re, im)

  const rho0 = Float64Array.from(re, v => v * v)
  const light0 = lightSnapshot(atom)
  const re0 = Float64Array.from(atom.re)
  const out: Run = { inside: [within(atom, RADIUS).inside], walk: [walkEnergy(atom)], light: [0], total: [walkEnergy(atom)], p2: [overlap(atom, lv.p)], p1: [overlap(atom, lv.s)], lightBeat: 0, gaussShadow: 0, gaussIdentity: 0, integerMax: 0, integerDocks: 0, consistency: 0, crossings: 0 }

  for (let t = 1; t <= beats; t++) {
    const read = t % EVERY === 0
    const before = atomBeat(atom, read)

    out.consistency += sourceConsistency(atom)

    if (!read) continue

    // the light beat against its invariant: read again after the beat for the same source ('beaten')
    const after = lightEnergy(atom, 'beaten')
    const w = walkEnergy(atom)
    const g = gaussReading(atom, rho0)

    out.lightBeat = Math.max(out.lightBeat, Math.abs(after - before))
    out.inside.push(within(atom, RADIUS).inside)
    out.walk.push(w)
    out.light.push(before)
    out.total.push(w + before)
    out.p2.push(overlap(atom, lv.p))
    out.p1.push(overlap(atom, lv.s))
    out.gaussShadow = Math.max(out.gaussShadow, g.shadowMax)
    out.gaussIdentity += g.integerIdentity
    out.integerMax = Math.max(out.integerMax, g.integerMax)
    out.integerDocks = Math.max(out.integerDocks, g.integerDocks)
  }

  out.crossings = atom.tally.crossings

  if (reverse) {
    const tally = { sourceMismatches: 0, previousMismatches: 0 }

    for (let t = 0; t < beats; t++) atomBeatBack(atom, tally)

    let dev = 0

    for (let i = 0; i < re0.length; i++) dev = Math.max(dev, Math.abs(atom.re[i]! - re0[i]!), Math.abs(atom.im[i]!))

    out.reversal = { light: lightMismatches(atom.light, light0), source: tally.sourceMismatches, walk: dev }
  }

  return out
}

const maxAbsFrom = (xs: number[], from: number, ref: number): number => Math.max(...xs.slice(from).map(x => Math.abs(x - ref)))

export default experiment({
  id: 'gauge/trit-quantum-atom',
  code: 'E-FRC-0221',
  title:
    'the first quantum atom on trits: a STAND-IN fear-walk electron whose charge and current enter the five-level shaped light as the signed whole\'s expectation (semiclassical), counted into the rule by thresholds and carried by a shaped bucket, with the light\'s field acting back on the walk\'s phases, stays bound over 15 orbital periods where a classical point charge flew apart, keeps matter plus light energy, keeps Gauss exact and reverses exactly',
  category: 'gauge',
  substrates: ['3434'],
  depth: 'L2',
  paper: false,
  run() {
    const sup = run('superposition', true, BEATS, true)
    const ground = run('ground', true, BEATS, false)
    const oneWay = run('superposition', false, 300, false)
    const metrics: Record<string, number> = {}
    const ref = (r: Run): number => r.total[2] ?? 0

    for (const [name, r] of [
      ['sup', sup],
      ['ground', ground],
      ['oneWay', oneWay],
    ] as const) {
      metrics[`${name}_insideStart`] = r.inside[0] ?? 0
      metrics[`${name}_insideMaxChange`] = maxAbsFrom(r.inside, 0, r.inside[0] ?? 0)
      metrics[`${name}_walkRiseMax`] = Math.max(...r.walk.map(w => w - (r.walk[0] ?? 0)))
      metrics[`${name}_walkChangeEnd`] = (r.walk[r.walk.length - 1] ?? 0) - (r.walk[0] ?? 0)
      metrics[`${name}_lightMax`] = Math.max(...r.light)
      metrics[`${name}_lightEnd`] = r.light[r.light.length - 1] ?? 0
      metrics[`${name}_totalMaxDeparture`] = maxAbsFrom(r.total, 2, ref(r))
      metrics[`${name}_totalEndDeparture`] = (r.total[r.total.length - 1] ?? 0) - ref(r)
      metrics[`${name}_p2End`] = r.p2[r.p2.length - 1] ?? 0
      metrics[`${name}_p1End`] = r.p1[r.p1.length - 1] ?? 0
      metrics[`${name}_lightBeatMax`] = r.lightBeat
      metrics[`${name}_gaussShadowMax`] = r.gaussShadow
      metrics[`${name}_gaussIdentity`] = r.gaussIdentity
      metrics[`${name}_integerChargeMax`] = r.integerMax
      metrics[`${name}_integerChargeDocksMax`] = r.integerDocks
      metrics[`${name}_sourceConsistency`] = r.consistency
      metrics[`${name}_crossings`] = r.crossings
    }

    metrics.rev_lightMismatches = sup.reversal?.light ?? -1
    metrics.rev_sourceMismatches = sup.reversal?.source ?? -1
    metrics.rev_walk = sup.reversal?.walk ?? -1

    const q = 2 * DEPTH + 1
    const bound = 6 / q ** LEVELS
    const binding = 0.05

    metrics.gaussBound = bound

    const okB = [sup, ground].every(r => maxAbsFrom(r.inside, 0, r.inside[0] ?? 0) <= 0.01 && Math.max(...r.walk.map(w => w - (r.walk[0] ?? 0))) <= 0.02 * binding)
    const okE =
      [sup, ground].every(r => r.lightBeat <= 1e-9) &&
      (metrics.sup_totalMaxDeparture ?? 1) <= 0.15 * (metrics.sup_lightMax ?? 0) &&
      Math.abs(metrics.oneWay_totalEndDeparture ?? 0) >= 0.8 * (metrics.oneWay_lightEnd ?? 1)
    const okG = [sup, ground, oneWay].every(r => r.gaussIdentity === 0 && r.gaussShadow <= bound)
    const okR = sup.reversal !== undefined && sup.reversal.light === 0 && sup.reversal.source === 0 && sup.reversal.walk <= 1e-12 && sup.consistency === 0
    const gates = { B: okB, E: okE, G: okG, R: okR }

    for (const [gate, ok] of Object.entries(gates)) metrics[`gate${gate}`] = ok ? 1 : 0

    const status = Object.values(gates).every(v => v) ? 'pass' : gates.B && gates.G && gates.R ? 'partial' : 'fail'
    const e = (x: number | undefined): string => (x ?? 0).toExponential(2)

    return verdict({
      status,
      claim: `a STAND-IN fear-walk electron (Z = ${CHARGE}, a = 3.00 docks, D = ${DEPTH}, five shaped levels, side ${SIDE}) coupled semiclassically to the trit light stays bound over ${BEATS} beats: the chance within 4 a moves by at most ${e(metrics.sup_insideMaxChange)} (superposition) and ${e(metrics.ground_insideMaxChange)} (1s); from (1s + 2p) / sqrt 2 the light gains ${e(metrics.sup_lightEnd)} while matter plus light stays within ${e(metrics.sup_totalMaxDeparture)} of its value (one-way control: ${e(metrics.oneWay_totalEndDeparture)} created in 300 beats) and P_2p falls to ${(metrics.sup_p2End ?? 0).toFixed(4)}; the 1s radiates at most ${e(metrics.ground_lightMax)}; the light beat keeps its invariant to ${e(metrics.sup_lightBeatMax)} per beat, Gauss holds (shadow to ${e(metrics.sup_gaussShadowMax)} against ${e(bound)}), and the run reverses with ${metrics.rev_lightMismatches} light mismatches and the walk to ${e(metrics.rev_walk)}`,
      metrics,
      control: { oneWayTotalEndDeparture: metrics.oneWay_totalEndDeparture ?? 0, oneWayLightEnd: metrics.oneWay_lightEnd ?? 0 },
      notes:
        'L2, STAND-IN electron and nucleus, semiclassical coupling. FIRST RUN 2026-09-26 (tmp/frc0221.log, 1,063 s), PASS on every gate, no gate moved. B: over 1,500 beats the chance within 4 a moves by at most 5.8e-3 from (1s + 2p) / sqrt 2 and 1.5e-3 from 1s, and the walk energy never rises more than 5.9e-5 and 1.7e-4 (E-FRC-0216\'s classical pair: 4 to 1,172.6 docks). E: the light beat keeps its invariant to 6.6e-11 per beat; from the superposition the light holds up to 5.4e-4 and ends at 1.3e-4 while matter plus light stays within 3.1e-5 of its value (0.057 of the light\'s largest energy), where the one-way control (light driven, no back-action) creates 1.5e-4 in 300 beats (0.92 of its light). The 1s radiates at most 2.3e-6 (the lattice eigenvector is not an exact eigenvector of the split beat, so it breathes). G: the integer flux\'s divergence equals the integer string\'s at every dock (0 failures) and the shadow\'s divergence equals the expectation charge change to 7.5e-8 (bound 6 / 33^5 = 1.5e-7); the integer string records whole charges of at most 4 units on at most 25 docks (4,371 crossings in 1,500 beats), all of which telescope out of the shadow. R: the 1,500 beats run back return every light integer (0 mismatches), the held source equals the counted one on every link of every beat (0), the walk to 8.7e-15. P_2p falls 0.5 -> 0.4967 in 1,500 beats: E-FRC-0222 reads the rate. SEMICLASSICAL: the light sees rho = |psi|^2, one field for the whole signed ensemble; the walk feels its own Hartree field (1/Z of the binding). A fully signed coupling would give each history (each joint point of the signed whole) its own light, sourced by that history\'s own whole-unit string, and read the outcome as the net line count (the Bell-fork resolution): the light would have to carry one branch per history, which the rule does not hold.',
    })
  },
})
