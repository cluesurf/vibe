// A part is bound and a whole is free, under a rule with no random number: the triality flux as an energy
// (code/rule/string-line), on a ring of cells.
//
// The last step the path in note/experiment/gauge/what-the-base-needs asks of color: a part pulled from a
// whole drags a line of flux whose energy grows with its length. The flux is the flow of the vibe weave,
// with Gauss's law exact (E-FRC-0123), and the string is where it is not a multiple of 3. Here a charge's
// hop must be paid for, by a demon on the link it crosses, in the string energy it changes. Where the
// demon cannot pay, the charge stays and reflects off its string. Every half-step is an involution, so the
// rule reverses exactly and conserves the energy to the unit.
//
// On a ring of 256 cells, mass 4 (so calm's pairs cost 8), demons of 1 unit on every link, 6,000 beats,
// each seed run with tension 1 and, as the control, tension 0:
// - a meson, a love beside a fear. Its gap is the ring distance between them. Bound means the mean gap
//   stays small with tension while the control's wanders over the ring
// - a baryon beside its antibaryon: three loves together, three fears 40 cells away. Each is a whole
//   (triality zero), so no string joins them: their gap must be free with tension too. And each holds
//   together: the spread of the three loves stays small with tension, against the control's
// Gates: Gauss's law at every cell and the energy exact on every beat, and 6,000 beats back restore
// every vibe, flux and demon, for every run. With tension, the meson's mean gap under 8 cells, under a
// quarter of the control's, while its middle travels more than 10 cells (bound, not frozen). With tension,
// the baryons travel more than 10 cells and their gap to each other moves over a range of more than 10
// (free, and not frozen), while the baryon's mean spread stays under half the control's. Reported: the
// meson's mean gap at twice the demon energy, which a string at finite temperature should widen.
//
// The thresholds were set after a probe (tmp/probe-string-line). A first version put the demons on every
// other link: the meson bound (mean gap 1.3 against 64) and passed, but the baryons never moved (their
// gap read exactly its starting 40), so "free" passed with nothing tested. The travel gates were added
// and the demon energy set where both a bound meson and a moving baryon can be seen.
//
// Depth L2: a constructed rule on a line, the mechanism before it is put on the D4 lattice.

import { experiment } from '@/test/scaffold/suite'
import { verdict } from '@/test/scaffold/verdict'
import { gaussHolds, stringBeat, stringBeatBack, stringEnergy, stringState, type StringLine, type StringState } from '@/code/rule/string-line'

const CELLS = 256
const BEATS = 6000

// ring distance, and positions unwrapped about a reference
const ring = (a: number, b: number): number => {
  const d = Math.abs(a - b) % CELLS

  return Math.min(d, CELLS - d)
}
const unwrap = (x: number, reference: number): number => {
  let d = (x - reference) % CELLS

  if (d > CELLS / 2) {
    d -= CELLS
  }

  if (d <= -CELLS / 2) {
    d += CELLS
  }

  return reference + d
}

function cellsOf(s: StringState, sign: number): number[] {
  return [...s.vibe].flatMap((v, i) => (v === sign ? [i] : []))
}

// the circular center of some cells, unwrapped about the first
function center(cells: number[]): number {
  const reference = cells[0] ?? 0

  return cells.reduce((a, c) => a + unwrap(c, reference), 0) / Math.max(1, cells.length)
}

type Run = {
  exact: boolean
  reverses: boolean
  meanGap: number
  gapRange: number
  travel: number
  meanSpread: number
  chargesMax: number
}

function run(input: { tension: number; charges: [number, number][]; demon?: number }): Run {
  const line: StringLine = { cells: CELLS, mass: 4, tension: input.tension, capacity: 4 }
  const vibe = new Int8Array(CELLS)

  for (const [cell, v] of input.charges) {
    vibe[cell] = v
  }

  const start = stringState({ line, vibe, demon: Int32Array.from({ length: CELLS }, () => input.demon ?? 1) })
  const e0 = stringEnergy(line, start)
  const middle0 = center([...cellsOf(start, 1), ...cellsOf(start, -1)])

  let s = start
  let exact = true
  let gapSum = 0
  let gapLow = Infinity
  let gapHigh = 0
  let spreadSum = 0
  let travel = 0
  let chargesMax = 0
  let middle = middle0

  for (let t = 0; t < BEATS; t++) {
    s = stringBeat(line, s, t)
    exact = exact && gaussHolds(line, s) && stringEnergy(line, s) === e0

    const loves = cellsOf(s, 1)
    const fears = cellsOf(s, -1)
    const lovesAt = center(loves)
    const fearsAt = center(fears)

    chargesMax = Math.max(chargesMax, loves.length + fears.length)
    const gap = ring(lovesAt, fearsAt)

    gapSum += gap
    gapLow = Math.min(gapLow, gap)
    gapHigh = Math.max(gapHigh, gap)
    spreadSum += Math.max(0, ...loves.map(a => Math.max(...loves.map(b => ring(a, b)))))

    // the middle, followed continuously
    const now = unwrap(center([lovesAt, unwrap(fearsAt, lovesAt)]), middle)

    middle = now
    travel = Math.max(travel, Math.abs(middle - middle0))
  }

  let back = s

  for (let t = BEATS - 1; t >= 0; t--) {
    back = stringBeatBack(line, back, t)
  }

  const reverses =
    back.vibe.every((v, i) => v === start.vibe[i]) && back.flux.every((v, i) => v === start.flux[i]) && back.demon.every((v, i) => v === start.demon[i])

  return { exact, reverses, meanGap: gapSum / BEATS, gapRange: gapHigh - gapLow, travel, meanSpread: spreadSum / BEATS, chargesMax }
}

export default experiment({
  id: 'gauge/string-binds',
  code: 'E-FRC-0129',
  title:
    'a part is bound and a whole is free under a rule with no random number: with the triality flux as an energy that a charge must pay to move, a love and a fear stay a few cells apart while their pair travels, three loves hold together, and a baryon and an antibaryon, each a whole, separate freely, where with no tension the love and fear wander over the ring',
  category: 'gauge',
  substrates: 'any',
  depth: 'L2',
  paper: false,
  run() {
    const meson: [number, number][] = [
      [120, 1],
      [121, -1],
    ]
    const baryons: [number, number][] = [
      [100, 1],
      [101, 1],
      [102, 1],
      [140, -1],
      [141, -1],
      [142, -1],
    ]
    const mesonBound = run({ tension: 1, charges: meson })
    const mesonFree = run({ tension: 0, charges: meson })
    const baryonBound = run({ tension: 1, charges: baryons })
    const baryonFree = run({ tension: 0, charges: baryons })
    const mesonHot = run({ tension: 1, charges: meson, demon: 2 })
    const all = [mesonBound, mesonFree, baryonBound, baryonFree, mesonHot]

    const ok =
      all.every(r => r.exact && r.reverses) &&
      mesonBound.meanGap < 8 &&
      mesonBound.meanGap < mesonFree.meanGap / 4 &&
      mesonBound.travel > 10 &&
      baryonBound.travel > 10 &&
      baryonBound.gapRange > 10 &&
      baryonBound.meanSpread < baryonFree.meanSpread / 2

    return verdict({
      status: ok ? 'pass' : 'fail',
      claim:
        "with Gauss's law and the energy exact and every run reversing to the bit, a meson's mean gap stays under 8 cells and under a quarter of the tensionless control's while it travels more than 10 cells, a baryon and an antibaryon travel more than 10 cells and their gap moves over a range of more than 10 (free), and a baryon's three loves spread less than half as much as without tension",
      metrics: {
        exactAndReversible: all.every(r => r.exact && r.reverses) ? 1 : 0,
        mesonMeanGap: mesonBound.meanGap,
        mesonTravel: mesonBound.travel,
        mesonCharges: mesonBound.chargesMax,
        baryonTravel: baryonBound.travel,
        baryonAntibaryonMeanGap: baryonBound.meanGap,
        baryonAntibaryonGapRange: baryonBound.gapRange,
        baryonMeanSpread: baryonBound.meanSpread,
        baryonCharges: baryonBound.chargesMax,
        mesonMeanGapAtTwiceTheEnergy: mesonHot.meanGap,
      },
      control: {
        tensionlessMesonMeanGap: mesonFree.meanGap,
        tensionlessMesonTravel: mesonFree.travel,
        tensionlessBaryonTravel: baryonFree.travel,
        tensionlessBaryonAntibaryonMeanGap: baryonFree.meanGap,
        tensionlessBaryonMeanSpread: baryonFree.meanSpread,
      },
      notes:
        'L2, exact integers, no random numbers. A ring of 256 cells, so the tensionless meson can wander at most 128 cells apart. The rule is a line, not the D4 lattice: it shows the mechanism (the flux of the vibe weave, charged as an energy, binds a part and leaves a whole free) and what a base rule would need to carry it, a hop that is paid for, which the committed rule does not have. Charges max counts pairs made from calm, which cost 8 and so stay rare at this temperature.',
    })
  },
})
