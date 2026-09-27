// A knot whose content reaches out: does a knot's content act on a test vibe through the husk light, with a
// separation-dependent energy, and is any part of it CHARGE-BLIND (the same for a love and a fear test vibe, so
// gravity-like rather than electric) (E-GRV-0059)? E-GRV-0056 found a held knot's content invisible outside on the bare
// knit; the husk light's column field is the one channel the model has that does reach out (E-FRC-0241).
//
// THE LIGHT. The trit light of code/rule/trit-column (wave form), side 12, depth D = 4, every husk integer a column sum
// of bulk trits, run 48 beats on each configuration, exactly E-FRC-0241's rule and readers. A charge is a bulk vibe; a
// charge is placed with its partner of the opposite sign at the end of a string of trits (placeStrung), since Gauss's
// law holds on every beat and the torus is neutral.
//
// THE KNOT, at husk column A = (0, 0, 0), each of its charges on its own depth level of that column (levels 0 .. 3 of
// the D = 4 docks) and strung along the path +4 y, +4 z at that level to its partner at Z1 = (0, 4, 4) (four disjoint
// strings, one per level):
//   charge4    +1 on all four levels: a point knot of charge +4
//   charge-4   -1 on all four levels: charge -4
//   charge1    +1 on level 0 only: charge +1
//   neutral    +1 on levels 0, 1 and -1 on levels 2, 3: a lump of four vibes with zero net charge in its column
// THE TEST VIBE: q = +1 (love) or -1 (fear) on level 0 of B = (r, 0, 0), r = 1 .. 5, strung the same way to Z2 = (r, 4, 4).
// A STAND-IN, disclosed: the charges are placed and never move (the knot is held by placement, not bound), as in E-FRC-0241.
//
// THE INTERACTION. W(kind, q, r) = U(knot + test) - U(knot) - U(test), U the Coulomb (longitudinal) energy read off
// the rule's own flux (code/measure/husk-coulomb longitudinalEnergy: the charge from the flux's divergence, then its
// field) at the start and checked constant over the 48 beats. With the partners it is the bilinear form
//   W = Q q (pi / D) [ -V(A - B) + V(A - Z2) + V(Z1 - B) - V(Z1 - Z2) ] = Q q (pi / D) [ -2 V(r, 0, 0) + V(r, 4, 4) + V(r, -4, -4) ]
// with V = G(0) - G the side-12 torus Green's difference of the husk Laplacian (E-FRC-0241's huskGreenDifference);
// the knot-test term is -Q q (pi / D) V(r), whose infinite-lattice tail is Q q (pi / D) / (24 pi r) plus a constant.
// THE ELECTRIC PART is (W(+1) - W(-1)) / 2 and THE CHARGE-BLIND PART is (W(+1) + W(-1)) / 2.
//
// WHY THE CHARGE-BLIND PART IS DECIDED IN ADVANCE, and why the file measures it anyway. The flux is E = S - C^T U and
// the curl part has no divergence, so the longitudinal energy is exactly (pi / D) 1/2 rho^T L^-1 rho, a quadratic form
// in the charge (code/measure/trit-hop-light), and a quadratic form's cross term is odd in each charge. So on this rule
// the static potential between a knot and a test vibe has NO charge-blind part, for any knot, as a theorem. The file
// checks the theorem on the rule's own flux (a numerical check of an identity: L1 for this clause), and measures what
// the theorem does not cover: the time-averaged TOTAL field energy (longitudinal plus the transverse light the strings
// radiate, which the rule's integer counters touch), reported, not gated.
//
// THE MATTER, reported: on the hop rule (code/rule/trit-hop, E-FRC-0210) a crossing reads the two vibes and the string
// trit only, never the light. Checked: the charge4 knot and a test vibe at r = 3 run 48 hop-gas steps with the light
// beaten after every step and with it never beaten; the vibes and strings are compared at every step.
//
// Gates, fixed before the first run of this file:
//  J1 instrument: every configuration's 48 beats keep 0 bulk and 0 husk Gauss violations and the longitudinal energy
//     constant to 1e-9
//  J2 the content reaches out: for charge4, charge-4 and charge1, the electric part equals the bilinear prediction to
//     1e-9 at every r = 1 .. 5 and differs between r = 1 and r = 5 by more than 1e-6; charge4's electric part is 4
//     times charge1's and minus charge-4's, each to 1e-9
//  J3 a charge-blind attraction: for some knot kind the charge-blind part at r = 1 differs from its value at r = 5 by
//     more than 1e-9, and it rises strictly from r = 1 to r = 5 (lower energy nearer: a pull on both a love and a fear)
// Verdict: pass if all hold; fail if J1 holds and J2 or J3 fails; partial if J1 fails.
//
// Reported, not gated: the knot-test term alone and its r-dependence against 1/(24 pi r) on the torus; the neutral lump's
// electric and charge-blind parts, and whether its husk state (every husk integer: angles, potentials, counters,
// strings) equals the test vibe's alone at every beat (two 32-bit hashes, a reader); the time-averaged total field
// energy's electric and charge-blind parts; the light-blindness of the hop.
//
// FIRST RUN (tmp/grv0059-run1.log, 42 s, the record): fail on J3 alone, recorded as is, no gate moved. J1 and J2
// hold. The reported total field energy is NOT a static potential: the per-beat 1/2 sum E^2 / g of the rule's flux
// (the transverse light the placed strings radiate, with its potential and angle wraps) runs to 1e4 to 1e5 in these
// units, three to six orders above the Coulomb term, and its charge-blind part is -2.2e4 to -5.7e4, negative on
// every kind and r but not monotone in r (charge4: -5.18e4, -4.49e4, -4.67e4, -4.48e4, -4.25e4). It depends on the
// string paths and is not the conserved leapfrog invariant, so it is a lead on the light's nonlinearity, not a
// charge-blind force. Title written after the run.
//
// DISCLOSED: no probe of this file's readings ran before the gates; the machinery is E-FRC-0241's (passed). Depth: L2
// for J2 (the rule's own flux against the lattice Coulomb form, with a knot of several charges), L1 for J3's
// longitudinal clause (an identity checked). DETERMINISM: no start is drawn; every configuration is placed.

import { experiment } from '@/test/scaffold/suite'
import { verdict } from '@/test/scaffold/verdict'
import {
  bulkFlux,
  bulkGaussViolations,
  columnSumLinks,
  copyTritState,
  emptyTritState,
  huskGaussViolations,
  makeTritLight,
  readHusk,
  tritLightBeat,
  type TritLight,
  type TritState,
} from '@/code/rule/trit-column'
import { buildHopTable, gasStep, hopStep } from '@/code/rule/trit-hop'
import { huskGreenDifference } from '@/code/measure/trit-hop-light'
import { dockOfColumn, longitudinalEnergy, placeStrung } from '@/code/measure/husk-coulomb'

const SIDE = 12
const DEPTH = 4
const BEATS = 48
const RS = [1, 2, 3, 4, 5]
const KINDS = ['charge4', 'charge-4', 'charge1', 'neutral'] as const
type Kind = (typeof KINDS)[number]
const LEVEL_SIGNS: Record<Kind, readonly number[]> = {
  charge4: [1, 1, 1, 1],
  'charge-4': [-1, -1, -1, -1],
  charge1: [1],
  neutral: [1, 1, -1, -1],
}
const chargeOf = (k: Kind): number => LEVEL_SIGNS[k].reduce((a, b) => a + b, 0)

type Run = { energy: number; drift: number; gauss: number; totalMean: number; husk: string[] }

function hashHusk(light: TritLight, s: TritState): string {
  const h = readHusk(light, s)
  let a = 0
  let b = 0

  for (const part of [h.angle, h.potential, h.counter, h.lag, h.spatial, h.string]) {
    for (let i = 0; i < part.length; i++) {
      const v = (part[i] as number) + 1000

      a = Math.imul(a ^ (v + i * 7), 0x9e3779b1)
      b = Math.imul(b + v * 31 + i, 0x85ebca6b) ^ (b >>> 13)
    }

    a = Math.imul(a ^ 0x5bd1e995, 0x9e3779b1)
  }

  return `${a}:${b}`
}

function run(light: TritLight, place: (s: TritState) => void): Run {
  const s = emptyTritState(light)

  place(s)

  const first = longitudinalEnergy(light, s)
  let drift = 0
  let gauss = bulkGaussViolations(light, s) + huskGaussViolations(light, columnSumLinks(light, bulkFlux(light, s)), s.vibe)
  let total = 0
  const husk: string[] = []

  for (let t = 1; t <= BEATS; t++) {
    tritLightBeat(light, s)
    gauss += bulkGaussViolations(light, s) + huskGaussViolations(light, columnSumLinks(light, bulkFlux(light, s)), s.vibe)

    const e = longitudinalEnergy(light, s)

    drift = Math.max(drift, Math.abs(e.longitudinal - first.longitudinal))
    total += e.total
    husk.push(hashHusk(light, s))
  }

  return { energy: first.longitudinal, drift, gauss, totalMean: total / BEATS, husk }
}

const placeKnot = (light: TritLight, s: TritState, kind: Kind): void => {
  LEVEL_SIGNS[kind].forEach((sign, level) => void placeStrung(light, s, dockOfColumn(light, [0, 0, 0], level), [0, 4, 4], sign))
}
const placeTest = (light: TritLight, s: TritState, q: number, r: number): void => void placeStrung(light, s, dockOfColumn(light, [r, 0, 0], 0), [0, 4, 4], q)

export default experiment({
  id: 'gravity/knot-light-reach',
  code: 'E-GRV-0059',
  title:
    "a charged knot's content reaches out through the husk light but nothing in it is charge-blind, fail on J3 alone: on the trit light (side 12, D 4, 48 beats) a point knot of charge +4, -4 or +1 gives a test vibe a Coulomb energy that matches the lattice form to 3.5e-15 and is linear in the knot's charge to 6.2e-15 (charge 4 against a love test vibe 6.14e-2, 2.51e-2, 1.25e-2, 7.14e-3, 4.76e-3 at r = 1 to 5), while its charge-blind part is at most 1.4e-14, the quadratic Coulomb form's odd cross term; a neutral four-vibe lump is invisible to the husk light on 480 of 480 beats, since the light reads column sums; the hop that moves matter reads no light on 48 of 48 steps, so the field acts on no test vibe's motion; Gauss and the Coulomb energy exact on every beat",
  category: 'gravity',
  substrates: ['3434'],
  depth: 'L2',
  paper: false,
  run() {
    const started = Date.now()
    const light = makeTritLight({ side: SIDE, depth: DEPTH, form: 'wave' })
    const scale = Math.PI / DEPTH
    const runs: Run[] = []
    const keep = (r: Run): Run => {
      runs.push(r)

      return r
    }
    const alone = Object.fromEntries(KINDS.map(k => [k, keep(run(light, s => placeKnot(light, s, k)))])) as Record<Kind, Run>
    const test = new Map<string, Run>()
    const four = new Map<string, Run>()

    for (const q of [1, -1]) {
      for (const r of RS) {
        test.set(`${q},${r}`, keep(run(light, s => placeTest(light, s, q, r))))

        for (const k of KINDS) {
          four.set(`${k},${q},${r}`, keep(run(light, s => {
            placeKnot(light, s, k)
            placeTest(light, s, q, r)
          })))
        }
      }
    }

    const W = (k: Kind, q: number, r: number, field: 'energy' | 'totalMean' = 'energy'): number =>
      (four.get(`${k},${q},${r}`) as Run)[field] - alone[k][field] - (test.get(`${q},${r}`) as Run)[field]
    const electric = (k: Kind, r: number, field: 'energy' | 'totalMean' = 'energy'): number => (W(k, 1, r, field) - W(k, -1, r, field)) / 2
    const blind = (k: Kind, r: number, field: 'energy' | 'totalMean' = 'energy'): number => (W(k, 1, r, field) + W(k, -1, r, field)) / 2
    const predicted = (k: Kind, r: number): number =>
      chargeOf(k) * scale * (-2 * huskGreenDifference(SIDE, [r, 0, 0]) + huskGreenDifference(SIDE, [r, 4, 4]) + huskGreenDifference(SIDE, [r, -4, -4]))
    const knotTest = (k: Kind, r: number): number => -chargeOf(k) * scale * huskGreenDifference(SIDE, [r, 0, 0])

    // J1
    const g1 = runs.every(x => x.gauss === 0 && x.drift < 1e-9)

    // J2
    const charged: Kind[] = ['charge4', 'charge-4', 'charge1']
    let worstPrediction = 0
    let worstLinear = 0

    for (const k of charged) for (const r of RS) worstPrediction = Math.max(worstPrediction, Math.abs(electric(k, r) - predicted(k, r)))
    for (const r of RS) worstLinear = Math.max(worstLinear, Math.abs(electric('charge4', r) - 4 * electric('charge1', r)), Math.abs(electric('charge4', r) + electric('charge-4', r)))

    const reaches = charged.every(k => Math.abs(electric(k, 1) - electric(k, 5)) > 1e-6)
    const g2 = worstPrediction < 1e-9 && worstLinear < 1e-9 && reaches

    // J3
    const attracts = (k: Kind): boolean => Math.abs(blind(k, 1) - blind(k, 5)) > 1e-9 && RS.every((r, i) => i === 0 || blind(k, r) > blind(k, RS[i - 1] as number))
    const g3 = KINDS.some(attracts)
    const status = !g1 ? 'partial' : g2 && g3 ? 'pass' : 'fail'

    // reported: the neutral lump's husk state against the test vibe's alone, at every beat
    let neutralSame = 0
    let neutralBeats = 0

    for (const q of [1, -1]) {
      for (const r of RS) {
        const a = (four.get(`neutral,${q},${r}`) as Run).husk
        const b = (test.get(`${q},${r}`) as Run).husk

        a.forEach((h, i) => {
          neutralBeats++
          if (h === b[i]) neutralSame++
        })
      }
    }

    // reported: the hop never reads the light
    const table = buildHopTable(light.bulk)
    const withLight = emptyTritState(light)

    placeKnot(light, withLight, 'charge4')
    placeTest(light, withLight, 1, 3)

    const without = copyTritState(withLight)
    let hopSame = 0

    for (let t = 0; t < BEATS; t++) {
      const [k, phase] = gasStep(t)

      hopStep(table, withLight, k, phase)
      tritLightBeat(light, withLight)
      hopStep(table, without, k, phase)

      if (withLight.vibe.every((v, i) => v === without.vibe[i]) && withLight.string.every((v, i) => v === without.string[i])) hopSame++
    }

    const metrics: Record<string, number> = {
      gate_J1: g1 ? 1 : 0,
      gate_J2: g2 ? 1 : 0,
      gate_J3: g3 ? 1 : 0,
      worstPrediction,
      worstLinear,
      worstGauss: Math.max(...runs.map(x => x.gauss)),
      worstDrift: Math.max(...runs.map(x => x.drift)),
      configurations: runs.length,
      neutralHuskSameBeats: neutralSame,
      neutralHuskBeats: neutralBeats,
      hopLightBlindSteps: hopSame,
      hopSteps: BEATS,
    }

    for (const k of KINDS) {
      for (const r of RS) {
        metrics[`electric_${k}_r${r}`] = electric(k, r)
        metrics[`predicted_${k}_r${r}`] = predicted(k, r)
        metrics[`blind_${k}_r${r}`] = blind(k, r)
        metrics[`knotTest_${k}_r${r}`] = knotTest(k, r)
        metrics[`totalElectric_${k}_r${r}`] = electric(k, r, 'totalMean')
        metrics[`totalBlind_${k}_r${r}`] = blind(k, r, 'totalMean')
      }
    }

    const list = (g: (r: number) => number): string => RS.map(r => g(r).toExponential(3)).join(', ')
    const worstBlind = Math.max(...KINDS.flatMap(k => RS.map(r => Math.abs(blind(k, r)))))
    const worstTotalBlind = Math.max(...KINDS.flatMap(k => RS.map(r => Math.abs(blind(k, r, 'totalMean')))))

    metrics.worstBlind = worstBlind
    metrics.worstTotalBlind = worstTotalBlind
    metrics.seconds = (Date.now() - started) / 1000

    return verdict({
      status,
      claim: `a point knot of charge +4, -4, +1 or a neutral four-vibe lump at the husk origin and a love or fear test vibe at r = 1 .. 5 (trit light, side 12, D 4, 48 beats): the electric part of the Coulomb interaction for charge 4 is ${list(r => electric('charge4', r))}, matching the lattice form to ${worstPrediction.toExponential(1)} and linear in the charge to ${worstLinear.toExponential(1)}; the charge-blind part is at most ${worstBlind.toExponential(1)} in magnitude; the neutral lump's electric part is ${list(r => electric('neutral', r))}; the time-averaged total field energy's charge-blind part is at most ${worstTotalBlind.toExponential(1)}; the hop reads no light on ${hopSame} of ${BEATS} steps`,
      metrics,
      control: {
        neutralInvisibleBeats: neutralSame,
        hopLightBlind: hopSame === BEATS ? 1 : 0,
      },
      notes: `L2 (J2), L1 (J3's longitudinal clause, an identity). Gates J1 ${g1}, J2 ${g2}, J3 ${g3}. Per kind (r = 1 .. 5): ${KINDS.map(k => `${k}: electric ${list(r => electric(k, r))}; predicted ${list(r => predicted(k, r))}; charge-blind ${list(r => blind(k, r))}; knot-test term ${list(r => knotTest(k, r))}; total-energy electric ${list(r => electric(k, r, 'totalMean'))}, total-energy charge-blind ${list(r => blind(k, r, 'totalMean'))}`).join('; ')}. The knot-test term's r-dependence against 1/(24 pi r): (G(r) - G(5)) / ((1/r - 1/5) / (24 pi)) at r = 1 .. 4, on the side-12 torus (images included): ${RS.slice(0, -1).map(r => (((knotTest('charge1', r) - knotTest('charge1', 5)) / scale) / ((1 / r - 1 / 5) / (24 * Math.PI))).toFixed(4)).join(', ')}. Neutral lump husk state equal to the test vibe's alone on ${neutralSame} of ${neutralBeats} beats. Hop steps with and without the light identical on ${hopSame} of ${BEATS}. Worst Gauss ${metrics.worstGauss}, worst longitudinal drift ${metrics.worstDrift!.toExponential(1)} over ${runs.length} configurations. ${((Date.now() - started) / 1000).toFixed(0)} s.`,
    })
  },
})
