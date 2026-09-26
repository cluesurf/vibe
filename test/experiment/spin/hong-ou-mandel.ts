// Hong-Ou-Mandel on the fear walk: the knit's swap phase as a beam splitter for two identical vibes.
//
// THE SET-UP. One line of the husk (one husk axis), with the fear walk's coin C = [[a, b], [b, a]],
// 2 a = 1 + omega, 2 b = 1 - omega (the swap phase at phi = 2 pi / 3, E-QTM-0103, the fear beat of
// E-FRC-0158 on where a lone vibe is), at ONE dock, and pure streaming everywhere else (the stream copies
// each slot one dock along). Two packets are launched at that dock from the two sides, with a delay tau
// between their arrivals. The two-vibe amplitude is built from the one-vibe weights in the bosonic
// combination phi_A x phi_B + phi_B x phi_A, the fermionic one with a minus, or the plain product
// (distinguishable). Every weight is a whole number of Z[omega] over 2^t, so every coincidence (one vibe
// leaving on each side) is an exact fraction, computed with bigints and compared for equality.
//
// THE SLOT. A slot holds one vibe, so the model's own two-vibe state is a set of two slots, and the
// history that puts both vibes into one outgoing slot has nowhere to go. The hard-core walk M_chi of
// code/measure/identical-particles runs from the same start with the direct and exchanged histories added
// with a relative phase chi. Run for chi = -1 and chi = +1.
//
// PREDICTIONS, written before the run from the coin alone (p = |a|^2 = 1/4, and a conj(b) purely
// imaginary because C is unitary): distinguishable 5/8 at every delay, bosons 5/8 - (3/8) I^2, fermions
// 5/8 + (3/8) I^2, with I the overlap of the two arrival profiles; so at zero delay bosons 1/4 and fermions
// 1, a dip of visibility 3/5, never a full dip, because the fear coin splits 1 : 3, not 1 : 1. The slot's
// chi = -1 walk keeps its norm and equals the fermions; chi = +1 loses exactly the bosons' both-in-one-slot
// weight, the bunched part the slot forbids.
//
// GATES, fixed before the first run:
//   G1 (the physics demand of the roadmap) bosonic coincidence at zero delay on the fear coin is 0.
//      PREDICTED TO FAIL, at 1/4 exactly.
//   G2 fermionic coincidence at zero delay is 1 exactly.
//   G3 at every delay 0 to 6, for two envelopes, bosons, fermions and distinguishable equal the closed
//      form exactly (bigint equality).
//   G4 the slot: the chi = -1 hard-core walk keeps norm 1 exactly and its coincidence equals the
//      fermions' at every delay; the chi = +1 walk's norm equals 1 minus the bosons' chance of both vibes
//      in one slot, exactly, at every delay (at zero delay with one-slot packets that is the coincidence
//      1/4; the envelopes here spread the arrivals, so it is the general form that is gated).
//   C1 (control, the harness can show a full dip) the balanced coin in Z[i], 2 a = 1 + i: bosonic
//      coincidence 0 exactly at zero delay.
//   C2 (control, the classical knit) the hop (phi = pi, the committed table on a lone vibe) and the stay
//      (phi = 0, the bind table): coincidence 1 for all three statistics at every delay, no dip.
// Status: pass if every gate holds, partial if only G1 fails, fail otherwise.
//
// Depth L2: a known construction (Hong, Ou and Mandel 1987; two-particle quantum walks, Peruzzo et al
// 2010) on the model's own coin, exact.

import { experiment } from '@/test/scaffold/suite'
import { verdict } from '@/test/scaffold/verdict'
import {
  BALANCED_LINE_COIN,
  FEAR_LINE_COIN,
  HOP_LINE_COIN,
  STAY_LINE_COIN,
  fractionValue,
  hongOuMandel,
  sameFraction,
  type HongOuMandel,
  type LineCoin,
} from '@/code/measure/identical-particles'

// two binomial packets, and (added after the first run, disclosed in the notes) the one-slot start, whose
// arrivals cannot spread
const ENVELOPES: readonly (readonly bigint[])[] = [
  [1n, 4n, 6n, 4n, 1n],
  [1n, 6n, 15n, 20n, 15n, 6n, 1n],
  [1n],
]
const DELAYS = [0, 1, 2, 3, 4, 5, 6]
const DISTANCE = 3

type Run = { envelope: number; delay: number; result: HongOuMandel }

function sweep(coin: LineCoin, chis: readonly number[]): Run[] {
  return ENVELOPES.flatMap((envelope, e) =>
    DELAYS.map(delay => ({ envelope: e, delay, result: hongOuMandel({ coin, envelope, distance: DISTANCE, delay, chis }) })),
  )
}

const closedFormHolds = (r: HongOuMandel): boolean =>
  sameFraction(r.boson, r.predicted.boson) &&
  sameFraction(r.fermion, r.predicted.fermion) &&
  sameFraction(r.distinguishable, r.predicted.distinguishable)

export default experiment({
  id: 'spin/hong-ou-mandel',
  code: 'E-SPN-0046',
  title:
    'Hong-Ou-Mandel on the fear walk, partial: the swap phase at one husk dock is a 1 : 3 beam splitter, so two identical vibes coincide at 1/4 as bosons, 1 as fermions and 5/8 as distinguishable, exactly as 5/8 -+ (3/8) I^2 at every delay (visibility 3/5, never a full dip), while the slot, which has no configuration for two vibes in one slot, forces the pair phase to -1 and makes identical vibes antibunch as fermions',
  category: 'spin',
  substrates: ['3434'],
  depth: 'L2',
  paper: false,
  run() {
    const fear = sweep(FEAR_LINE_COIN, [-1, 1])
    const balanced = sweep(BALANCED_LINE_COIN, [-1, 1])
    const hop = sweep(HOP_LINE_COIN, [])
    const stay = sweep(STAY_LINE_COIN, [])
    const zero = fear.find(r => r.envelope === 0 && r.delay === 0)?.result
    const balancedZero = balanced.find(r => r.envelope === 0 && r.delay === 0)?.result

    const g1 = zero !== undefined && zero.boson.num === 0n
    const g2 = zero !== undefined && zero.fermion.num === zero.fermion.den
    const g3 = fear.every(r => closedFormHolds(r.result))
    const g4 = fear.every(r => {
      const minus = r.result.hardCore.find(h => h.chi === -1)
      const plus = r.result.hardCore.find(h => h.chi === 1)

      return (
        minus !== undefined &&
        plus !== undefined &&
        minus.norm.num === minus.norm.den &&
        sameFraction(minus.coincidence, r.result.fermion) &&
        sameFraction(plus.norm, { num: r.result.bosonSameSlot.den - r.result.bosonSameSlot.num, den: r.result.bosonSameSlot.den })
      )
    })
    const c1 = balancedZero !== undefined && balancedZero.boson.num === 0n && balanced.every(r => closedFormHolds(r.result))
    const classicalFlat = (runs: Run[]): boolean =>
      runs.every(
        r =>
          r.result.boson.num === r.result.boson.den &&
          r.result.fermion.num === r.result.fermion.den &&
          r.result.distinguishable.num === r.result.distinguishable.den,
      )
    const c2 = classicalFlat(hop) && classicalFlat(stay)

    const rest = g2 && g3 && g4 && c1 && c2
    const status = rest ? (g1 ? 'pass' : 'partial') : 'fail'
    const at = (runs: Run[], envelope: number, delay: number): HongOuMandel | undefined =>
      runs.find(r => r.envelope === envelope && r.delay === delay)?.result
    const metrics: Record<string, number> = {
      bosonCoincidenceZeroDelay: zero ? fractionValue(zero.boson) : -1,
      fermionCoincidenceZeroDelay: zero ? fractionValue(zero.fermion) : -1,
      distinguishableCoincidence: zero ? fractionValue(zero.distinguishable) : -1,
      visibility: zero ? (fractionValue(zero.distinguishable) - fractionValue(zero.boson)) / fractionValue(zero.distinguishable) : -1,
      closedFormExactRuns: fear.filter(r => closedFormHolds(r.result)).length,
      runs: fear.length,
      slotMinusOneNormZeroDelay: zero ? fractionValue(zero.hardCore.find(h => h.chi === -1)?.norm ?? { num: -1n, den: 1n }) : -1,
      slotPlusOneNormZeroDelay: zero ? fractionValue(zero.hardCore.find(h => h.chi === 1)?.norm ?? { num: -1n, den: 1n }) : -1,
      bosonSameSlotZeroDelay: zero ? fractionValue(zero.bosonSameSlot) : -1,
    }
    const single = at(fear, 2, 0)

    if (single) {
      metrics.oneSlotBosonCoincidence = fractionValue(single.boson)
      metrics.oneSlotBosonSameSlot = fractionValue(single.bosonSameSlot)
      metrics.oneSlotPlusOneNorm = fractionValue(single.hardCore.find(h => h.chi === 1)?.norm ?? { num: -1n, den: 1n })
      metrics.oneSlotMinusOneNorm = fractionValue(single.hardCore.find(h => h.chi === -1)?.norm ?? { num: -1n, den: 1n })
    }

    DELAYS.forEach(delay => {
      const r = at(fear, 0, delay)

      if (r) {
        metrics[`bosonDelay${delay}`] = Number(fractionValue(r.boson).toFixed(6))
        metrics[`fermionDelay${delay}`] = Number(fractionValue(r.fermion).toFixed(6))
        metrics[`overlapDelay${delay}`] = Number(fractionValue(r.overlap).toFixed(6))
      }
    })

    return verdict({
      status,
      claim:
        'on the fear coin two identical vibes coincide at exactly 1/4 as bosons, 1 as fermions and 5/8 as distinguishable at zero delay, and at every delay and envelope exactly as 5/8 -+ (3/8) I^2, so the Hong-Ou-Mandel dip is present but not full (visibility 3/5); the balanced splitter gives a full dip and the classical knit none; the slot, having no configuration for two vibes in one slot, keeps its norm only with the pair phase -1, and then equals the fermions exactly',
      metrics,
      control: {
        balancedBosonZeroDelay: balancedZero ? fractionValue(balancedZero.boson) : -1,
        balancedFermionZeroDelay: balancedZero ? fractionValue(balancedZero.fermion) : -1,
        hopFlatRuns: hop.filter(r => r.result.boson.num === r.result.boson.den).length,
        stayFlatRuns: stay.filter(r => r.result.boson.num === r.result.boson.den).length,
        g1BosonZero: g1 ? 1 : 0,
        g2FermionOne: g2 ? 1 : 0,
        g3ClosedForm: g3 ? 1 : 0,
        g4Slot: g4 ? 1 : 0,
        c1Balanced: c1 ? 1 : 0,
        c2Classical: c2 ? 1 : 0,
      },
      notes:
        'L2. G1 fails, as predicted in the header before the run: the fear coin is the swap phase at 2 pi / 3, |a|^2 = 1/4 and |b|^2 = 3/4, and the bosonic coincidence of a p : 1 - p splitter is (1 - 2 p)^2 = 1/4, not 0. A full dip needs phi = pi / 2 (control C1, exactly 0). So the model has the Hong-Ou-Mandel interference, measured exactly, but its splitter is unbalanced. What decides the statistics is the slot. From one-slot starts arriving together, the bosons put 3/4 of their weight into one outgoing slot (both vibes in it), and the slot has no configuration for that. The hard-core two-vibe walk built from the one-vibe coin keeps its norm only when the exchanged history enters with the phase -1 (the determinant), and then it IS the fermionic walk, coincidence 1: identical vibes antibunch. With +1 it keeps exactly the bosonic coincidence 1/4 and loses the other 3/4, the unitarity failure E-SPN-0047 generalizes. With spread packets the arrivals do not all coincide, so the same-slot share of the bosons at zero delay is smaller (0.277 for the 1 4 6 4 1 envelope) and the +1 walk keeps 0.723, again exactly 1 minus that share. FIRST RUN: every number as predicted, G1 failing at 1/4 as the header said. The one-slot envelope was added after the first run to show the 3/4 directly; it changed no gate and every gate holds on it. The classical knit (the committed hop and the bind stay, phi = pi and 0) is a permutation and shows no dip at all, for any statistics. This is the line of one husk axis. Positions stay classical in the fear weave (E-FRC-0158 carries amplitudes on roles, not on where a vibe is), so the two-vibe position amplitude is the fear walk extended by the slot, not a sector the committed knit already runs.',
    })
  },
})
