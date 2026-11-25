// KEY 5 VALUE ARROW FOR A RADIATING HISTORY & BOX CYCLE-MEAN FINGERPRINT (E-FND-0183, item vibe-roadmap-board-0013, gaps B-01, B-54, m-24).
// Verifies that the adopted ODD value piece (grounding decision 003) under split coin produces a nonzero C-odd
// interference arrow on a non-repeating radiating history on the cached exact R = 2 {3,4,3,4} ball (breaking C-pairing
// while keeping exact CP-pairing) and breaks C-conjugate cycle-mean pairing on the period-4 D4 box.
//
// Depth L2: exact Z[w][1/2] valueBeat arithmetic on cached R = 2 ball and period-4 box. Zero random numbers.

import { experiment } from '@/test/scaffold/suite'
import { verdict } from '@/test/scaffold/verdict'
import { runValueArrowCheck } from '@/code/measure/value-arrow-check'

export default experiment({
  id: 'foundations/value-arrow-check',
  code: 'E-FND-0183',
  title:
    'Key 5 value arrow on a non-repeating radiating history on the exact R = 2 ball and period-4 box cycle-mean fingerprint under ODD',
  category: 'foundations',
  substrates: ['3434'],
  depth: 'L2',
  paper: false,
  run() {
    const res = runValueArrowCheck()
    const i0 = res.reversibleAll && res.frontierHits === 0
    const g1 = Math.abs(res.bareCPairingSum) <= 1e-13
    const g2 = Math.abs(res.oddCPairingSum) > 1e-3 && Math.abs(res.oddCPPairingSum) <= 1e-13
    const g3 = Math.abs(res.boxBareCPairingSum) <= 1e-13 && Math.abs(res.boxOddCPairingSum) > 1e-3
    const ok = i0 && g1 && g2 && g3

    return verdict({
      status: ok ? 'pass' : 'fail',
      claim:
        `On cached exact R = 2 ball (${res.ballCells} docks, split coin, reversible=${res.reversibleAll ? 1 : 0}, ` +
        `frontierHits=${res.frontierHits}): bare rule keeps exact C-pairing on radiating history ` +
        `(bare(X1)+bare(C(X1))=${res.bareCPairingSum.toExponential(2)}); adopted ODD ` +
        `${g2 ? 'breaks C-pairing' : 'preserves C-pairing (zero asymmetry, gate g2 fail; multi-chi_odd interference required)'} on the ` +
        `non-repeating radiating history (odd(X1)=${res.oddRadX1.toFixed(6)}, odd(C(X1))=${res.oddRadCX1.toFixed(6)}, ` +
        `sum=${res.oddCPairingSum.toFixed(6)}) while keeping exact CP-pairing (sum=${res.oddCPPairingSum.toExponential(2)}); ` +
        `on the period-4 D4 box, 4-beat cycle-mean C-pairing sum is ${res.boxBareCPairingSum.toExponential(2)} (bare) ` +
        `vs ${res.boxOddCPairingSum.toFixed(6)} (ODD, g3=${g3 ? 1 : 0})`,
      metrics: {
        i0: i0 ? 1 : 0,
        g1: g1 ? 1 : 0,
        g2: g2 ? 1 : 0,
        g3: g3 ? 1 : 0,
        bareRadX1: res.bareRadX1,
        bareRadCX1: res.bareRadCX1,
        bareCPairingSum: res.bareCPairingSum,
        oddRadX1: res.oddRadX1,
        oddRadCX1: res.oddRadCX1,
        oddCPairingSum: res.oddCPairingSum,
        oddCPPairingSum: res.oddCPPairingSum,
        boxBareCPairingSum: res.boxBareCPairingSum,
        boxOddCPairingSum: res.boxOddCPairingSum,
      },
    })
  },
})
