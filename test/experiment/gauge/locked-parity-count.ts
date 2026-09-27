// A PARITY-ODD COUNT ON THE HUSK FOR THE DOUBLET-LOCKED KNIT (E-FRC-0249): does any husk reading tell the locked world
// from its mirror image? The measurement half of E-FRC-0248.
//
// THE COUNT (code/measure/locked-parity). The husk current J of a configuration: per husk column, the husk shadows of
// the slots its vibes hold, each the direction the stream just copied the vibe along, counted per vibe (the number
// current) or signed (the charge current). Its helicity H = sum over columns of J . curl J (central differences on the
// periodic husk) is an integer with H(image) = det(s) H for every signed axis permutation s of the husk: a parity-odd
// count. Summed over a run of 48 beats, from a start psi and from its mirror image P psi. The pair {psi, P psi} is a
// P-symmetric ensemble, a count over two deterministic histories, so a rule with P reads H(psi) + H(P psi) = 0, and a
// rule without P can read anything. P is the husk inversion, lifted with the depth kept (a bulk reflection) and with
// the depth reversed (a bulk rotation).
//
// THE RUNS, each from psi and from both images, on the side-4 coset-union vacuum, E-MTH-0028's 17 link starts:
//  OLD    the old knit (no vibe open, the lock's bookkeeping reading, which is the old knit bit for bit): a lone love on
//         the first axis slot of dock 0 (depth +-1, one husk axis)
//  EXCH   the locked rule, every vibe open, along its exchange path (every unequal-point like meeting exchanges: one
//         term of the all-open state, with no key that could pick a dock order), the same lone love
//  SUPER  the locked rule's exact superposed state from E-RLT-0097's L8 start (two vacuum vibes that meet with
//         different points, opened), H as an exact expectation over its terms
//  toys   PLANTED, never the model: the old knit with the chiral twist (a dock whose momentum casts a husk axis n turns a
//         quarter turn about n, right- or left-handed), and with the fixed quarter turn about x3 (anisotropic, achiral)
//
// THE LOCK'S OWN HELICITY. For each vibe, its label read along its motion (+1 on every slot under C, E-FRC-0248's T1),
// and the axial reading (love +1, fear -1). Summed over the run. And the love-fear meetings (a love and a fear on one
// line before the collision), split by the fear's label along the motion: under C every one is +1 and each meeting is
// the identity (E-RLT-0097's L3).
//
// GATES, fixed before this file's first run. Probe run first, disclosed: tmp/par-probe1 (one start, integer+0: OLD
// H_n 0 and 0, H_q -128 and 128; SUPER 0 and 0 on both; EXCH H_n -70 and 70; twist toy H_n -1242 and 454; left twist
// the negatives; fixed turn 3180 and -3180).
//  G1  the locked world has no parity-odd count: for OLD, EXCH and SUPER, under both lifts, H_n(psi) + H_n(P psi) = 0
//      and H_q(psi) + H_q(P psi) = 0 exactly, on 17 of 17
//  G2  the count is informative on the locked runs: on 17 of 17 starts at least one of the six (OLD, EXCH, SUPER) x
//      (H_n, H_q) readings of psi is nonzero
//  G3  the count detects a planted handedness: the right twist's ensemble sum (H_n, H_q) is not (0, 0) under both
//      lifts on 17 of 17; the left twist's is exactly its negative on 17 of 17; the fixed turn's is exactly (0, 0) on
//      17 of 17
//  G4  the lock's helicity is mirror-even: for EXCH and SUPER, the label count and the axial count read the same on psi
//      and on P psi (both lifts), the label count equals the vibe count and the axial count the charge count, summed
//      over beats; the love-fear meetings are as many on psi as on P psi, and every one has the fear's label along its
//      motion +1 (none -1), on 17 of 17
// Verdict: pass if G1 to G4 hold; fail otherwise.
//
// FIRST RUN (10 s, tmp/frc0249-run1.log): pass, no gate moved. G1 to G4 on 17 of 17. SUPER reads H = 0 exactly on psi
// itself on every start, so its cancellation carries no weight here (E-FRC-0248's L4 is the exact test of that state);
// G2 rests on OLD's charge helicity (128 on every start: the lone love's line) and EXCH's (number up to 5,418, charge up
// to 4,992, different on every start). Reported, not gated: the depth-kept and depth-reversed images read the same on
// every count of every run, the toys included, as a column sum must. The planted twist's ensemble sign is not fixed
// across starts (-6,838 to 4,836): each start's vacuum and links add a hand of their own (E-RLT-0076), and the twist's
// part is what survives the ensemble. Title written after the run.
//
// DETERMINISM: no random numbers; E-MTH-0028's starts; the exchange path has no key. Exact integers, and bigint
// rationals for the superposed state. Depth L2: an exact measurement on the adopted rule, with planted controls.

import { experiment } from '@/test/scaffold/suite'
import { verdict } from '@/test/scaffold/verdict'
import { LINE_FIRSTS, OPPOSITE } from '@/code/rule/isometric-knit'
import { lockedBeat, lockedState, lockedTables, type Configuration, type LockedState, type LockedTables } from '@/code/rule/doublet-locked-knit'
import { lockedFresh, pathRunner, vacuumConfiguration, THRESHOLD_EXCHANGE } from '@/code/measure/doublet-locked-readings'
import { startFamily, withStart } from '@/code/measure/start-ensemble'
import {
  addExact,
  axialAlongMotion,
  axisSlot,
  chiralTwist,
  expectation,
  exactFloat,
  fixedTurn,
  helicity,
  huskCurrent,
  huskFrame,
  huskInversion,
  labelAlongMotion,
  mirrorConfiguration,
  mirrorLinks,
  mirrorOf,
  superposingStart,
  toyBeat,
  type DockTurn,
  type Exact,
  type HuskFrame,
  type Mirror,
} from '@/code/measure/locked-parity'

const BOX = 4
const BEATS = 48
const LINE_SECONDS = LINE_FIRSTS.map(f => OPPOSITE[f] as number)

type Reading = { hn: Exact; hq: Exact; label: Exact; axial: Exact; vibes: Exact; charge: Exact; unlike: Exact; fearMinus: Exact }

const zeroExact = (): Exact => ({ num: 0n, den: 1n })

// the per-configuration integers of one beat
function readConfiguration(frame: HuskFrame, c: Configuration): number[] {
  let label = 0
  let axial = 0
  let vibes = 0
  let charge = 0
  let unlike = 0
  let fearMinus = 0

  for (let slot = 0; slot < c.vibe.length; slot++) {
    const v = c.vibe[slot] as number

    if (v === 0) continue
    label += labelAlongMotion(v, slot % 24)
    axial += axialAlongMotion(v, slot % 24)
    vibes++
    charge += v
  }

  // the love-fear meetings this configuration holds (before its collision)
  for (let x = 0; x < c.vibe.length / 24; x++) {
    for (let l = 0; l < 12; l++) {
      const i = x * 24 + (LINE_FIRSTS[l] as number)
      const j = x * 24 + (LINE_SECONDS[l] as number)
      const a = c.vibe[i] as number
      const b = c.vibe[j] as number

      if (a === 0 || b !== -a) continue
      unlike++

      const fear = a < 0 ? i : j

      fearMinus += labelAlongMotion(-1, fear % 24) === -1 ? 1 : 0
    }
  }

  return [helicity(frame, huskCurrent(frame, c, false)), helicity(frame, huskCurrent(frame, c, true)), label, axial, vibes, charge, unlike, fearMinus]
}

function readState(frame: HuskFrame, s: LockedState, into: Reading): void {
  const keys = ['hn', 'hq', 'label', 'axial', 'vibes', 'charge', 'unlike', 'fearMinus'] as const
  const cache = new Map<unknown, number[]>()
  const values = (c: Configuration): number[] => {
    let v = cache.get(c)

    if (!v) {
      v = readConfiguration(frame, c)
      cache.set(c, v)
    }

    return v
  }

  keys.forEach((key, k) => {
    into[key] = addExact(
      into[key],
      expectation(s, c => values(c)[k] as number),
    )
  })
}

const newReading = (): Reading => ({ hn: zeroExact(), hq: zeroExact(), label: zeroExact(), axial: zeroExact(), vibes: zeroExact(), charge: zeroExact(), unlike: zeroExact(), fearMinus: zeroExact() })

// a run of the locked rule (or a toy) from a start, read at every beat: the meetings on the state before each beat,
// the husk current on the state after each stream
function lockedReading(frame: HuskFrame, tables: LockedTables, start: Configuration, turn?: DockTurn): Reading {
  const r = newReading()
  let s = lockedState(start)

  for (let t = 0; t < BEATS; t++) {
    s = turn ? toyBeat(tables, s, t, turn) : lockedBeat(tables, s, t)
    readState(frame, s, r)
  }

  return r
}

function exchangeReading(frame: HuskFrame, tables: LockedTables, start: Configuration): Reading {
  const r = newReading()
  const run = pathRunner(tables, start, THRESHOLD_EXCHANGE)

  for (let t = 0; t < BEATS; t++) {
    run.beat()
    readState(frame, lockedState(run.state()), r)
  }

  return r
}

type Triple = { psi: Reading; images: Reading[] }

const sumZero = (x: Exact, y: Exact): boolean => addExact(x, y).num === 0n
const equal = (x: Exact, y: Exact): boolean => x.num * y.den === y.num * x.den
const f2 = (x: Exact): number => Number(exactFloat(x).toFixed(4))

function perStart(name: string): { name: string; old: Triple; exch: Triple; sup: Triple; right: Triple; left: Triple; fixed: Triple } {
  const f = lockedFresh(BOX)
  const frame = huskFrame(BOX)
  const vac = vacuumConfiguration(f, 'none')
  const lone: Configuration = { ...vac, vibe: Int8Array.from(vac.vibe), point: Int8Array.from(vac.point) }

  lone.vibe[axisSlot()] = 1

  const sup = superposingStart(f.tables, f.weave, vac)

  if (!sup) throw new Error(`no superposing start on ${name}`)

  const mirrors: Mirror[] = [false, true].map(depth => mirrorOf(huskInversion(depth), BOX))
  const tablesOf = (m?: Mirror): LockedTables => (m ? lockedTables(f.weave, 'lone', mirrorLinks(m, f.weave.links, f.weave.moves)) : f.tables)
  const triple = (start: Configuration, read: (tables: LockedTables, s: Configuration) => Reading): Triple => ({ psi: read(tablesOf(), start), images: mirrors.map(m => read(tablesOf(m), mirrorConfiguration(m, start))) })

  return {
    name,
    old: triple(lone, (t, s) => lockedReading(frame, t, s)),
    exch: triple(lone, (t, s) => exchangeReading(frame, t, s)),
    sup: triple(sup, (t, s) => lockedReading(frame, t, s)),
    right: triple(lone, (t, s) => lockedReading(frame, t, s, chiralTwist(1))),
    left: triple(lone, (t, s) => lockedReading(frame, t, s, chiralTwist(-1))),
    fixed: triple(lone, (t, s) => lockedReading(frame, t, s, fixedTurn(1))),
  }
}

export default experiment({
  id: 'gauge/locked-parity-count',
  code: 'E-FRC-0249',
  title:
    "a parity-odd count on the husk reads zero for the doublet-locked knit, pass: the helicity J . curl J of the husk vibe current, number and charge, summed over 48 beats, cancels exactly between each start and its husk inversion (both bulk lifts) for the old knit, the locked exchange path and the locked superposed state on 17 of 17 starts, while one run alone reads up to 5,418; a planted chiral twist reads a nonzero ensemble sum on 17 of 17 (-6,838 to 4,836), its mirror exactly the negative, and an achiral fixed turn exactly 0; the lock's own helicity reads the same in the world and its mirror (the label along the motion is the vibe count, its axial reading the charge count, and every love-fear meeting, 7,409 to 11,981 a run, has a fear of one label), and the two bulk lifts read the same on every husk count, toys included",
  category: 'gauge',
  substrates: ['3434'],
  depth: 'L2',
  paper: false,
  run() {
    const started = Date.now()
    const family = startFamily(16)
    const runs = family.map(member =>
      withStart(member, () => {
        const r = perStart(member.name)

        console.error(`start ${member.name} ${Math.round((Date.now() - started) / 1000)}s`)

        return r
      }),
    )
    const n = family.length
    const oddZero = (t: Triple): boolean => t.images.every(im => sumZero(t.psi.hn, im.hn) && sumZero(t.psi.hq, im.hq))
    const nG1 = runs.filter(r => oddZero(r.old) && oddZero(r.exch) && oddZero(r.sup)).length
    const nG2 = runs.filter(r => [r.old, r.exch, r.sup].some(t => t.psi.hn.num !== 0n || t.psi.hq.num !== 0n)).length
    const ensemble = (t: Triple, k: number): [Exact, Exact] => [addExact(t.psi.hn, t.images[k]!.hn), addExact(t.psi.hq, t.images[k]!.hq)]
    const nG3right = runs.filter(r => [0, 1].every(k => ensemble(r.right, k).some(e => e.num !== 0n))).length
    const nG3left = runs.filter(r => [0, 1].every(k => ensemble(r.right, k).every((e, i) => sumZero(e, ensemble(r.left, k)[i] as Exact)))).length
    const nG3fixed = runs.filter(r => [0, 1].every(k => ensemble(r.fixed, k).every(e => e.num === 0n))).length
    const helicityEven = (t: Triple): boolean =>
      t.images.every(im => equal(t.psi.label, im.label) && equal(t.psi.axial, im.axial) && equal(t.psi.unlike, im.unlike) && im.fearMinus.num === 0n) && equal(t.psi.label, t.psi.vibes) && equal(t.psi.axial, t.psi.charge) && t.psi.fearMinus.num === 0n
    const nG4 = runs.filter(r => helicityEven(r.exch) && helicityEven(r.sup)).length
    const status = nG1 === n && nG2 === n && nG3right === n && nG3left === n && nG3fixed === n && nG4 === n ? 'pass' : 'fail'
    const show = (t: Triple): string => `${f2(t.psi.hn)}/${t.images.map(im => f2(im.hn)).join('/')} q ${f2(t.psi.hq)}/${t.images.map(im => f2(im.hq)).join('/')}`
    const range = (xs: number[]): string => (Math.min(...xs) === Math.max(...xs) ? `${Math.min(...xs)}` : `${Math.min(...xs)} to ${Math.max(...xs)}`)
    const rightSums = runs.map(r => exactFloat(ensemble(r.right, 0)[0]))

    return verdict({
      status,
      claim: `the husk helicity of the vibe current, a parity-odd integer, sums to 0 exactly over {psi, P psi} for the old knit, the locked exchange path and the locked superposed state on ${nG1} of ${n} starts under both lifts of the husk inversion, while nonzero on psi on ${nG2} of ${n}; the planted chiral twist sums to nonzero on ${nG3right} of ${n} (number current ${range(rightSums)}), its mirror exactly the negative, and the achiral fixed turn to 0; the lock's own helicity reads the same on psi and P psi (${nG4} of ${n}): the label along the motion is the vibe count, its axial reading the charge count, and every love-fear meeting has a fear of one label, in the world and in its mirror`,
      metrics: {
        gateG1: nG1,
        gateG2: nG2,
        gateG3right: nG3right,
        gateG3left: nG3left,
        gateG3fixed: nG3fixed,
        gateG4: nG4,
        starts: n,
        exchangeHnMaxAbs: Math.max(...runs.map(r => Math.abs(exactFloat(r.exch.psi.hn)))),
        oldHqMaxAbs: Math.max(...runs.map(r => Math.abs(exactFloat(r.old.psi.hq)))),
        superHnMaxAbs: Math.max(...runs.map(r => Math.abs(exactFloat(r.sup.psi.hn)))),
        superHqMaxAbs: Math.max(...runs.map(r => Math.abs(exactFloat(r.sup.psi.hq)))),
        exchangeLoveFearMeetings: Math.max(...runs.map(r => exactFloat(r.exch.psi.unlike))),
        exchangeLabelCount: exactFloat(runs[0]!.exch.psi.label),
        exchangeAxialCount: exactFloat(runs[0]!.exch.psi.axial),
        seconds: (Date.now() - started) / 1000,
      },
      control: {
        rightTwistEnsembleHnMin: Math.min(...rightSums),
        rightTwistEnsembleHnMax: Math.max(...rightSums),
        fixedTurnPsiHnMaxAbs: Math.max(...runs.map(r => Math.abs(exactFloat(r.fixed.psi.hn)))),
      },
      notes: `L2. Gates: G1 ${nG1}, G2 ${nG2}, G3 right ${nG3right} left ${nG3left} fixed ${nG3fixed}, G4 ${nG4} of ${n}. Per start, H_n psi/depth-kept image/depth-reversed image, then H_q (OLD; EXCH; SUPER; right twist; left twist; fixed turn), and EXCH label/axial/vibes/charge/love-fear meetings: ${runs.map(r => `${r.name}: ${show(r.old)}; ${show(r.exch)}; ${show(r.sup)}; ${show(r.right)}; ${show(r.left)}; ${show(r.fixed)}; ${f2(r.exch.psi.label)}/${f2(r.exch.psi.axial)}/${f2(r.exch.psi.vibes)}/${f2(r.exch.psi.charge)}/${f2(r.exch.psi.unlike)}`).join(' | ')}. ${((Date.now() - started) / 1000).toFixed(0)} s.`,
    })
  },
})
