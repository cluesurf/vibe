// The end state: the coarse entropy's long-run limit on the adopted knit, read on the husk, at three box sizes
// (E-FND-0155).
//
// THE QUESTION. The rule is a bijection, so the fine-grained state never dies: no heat death there (E-FND-0146). The
// ledger asks what the COARSE state tends to, and on a growing mesh.
//
// THE KNIT AND THE COARSE MAP are E-FND-0146's: the coset-union vacuum under the lone bounce, the husk cut into cubic
// blocks of 4 x 4 x 4 columns, E_b the knit's conserved energy per block, H = - sum p_b ln p_b, the deficit ln B - H.
// Here at sides 8, 12 and 16 (B = 8, 27, 64 blocks), three link starts each, 400 beats from a start holding 16 extra
// vibes per dock in block 0.
//
// DERIVATION, before the gate run.
//  1. On a fixed box the coarse entropy cannot rise without limit: it is at most ln B. A reversible finite system
//     returns exactly (E-FND-0146 G5 measured the recurrence: 6 beats for the side-4 vacuum, 360 for one vibe, over
//     524,288 for six), so its coarse entropy cannot stay at any value forever either. What it does between is
//     equilibrium: the blocks share the energy and fluctuate.
//  2. That equilibrium has a predicted deficit. Near equal filling ln B - H = (B / 2) sum_b (dp_b)^2 + ..., and with
//     p_b = E_b / E and the total E exactly conserved, the mean is (B - 1) F / (2 E), where F = Var(E_b) / mean(E_b) is
//     the block Fano factor, read independently from the same late blocks. So the end state of a fixed box is the
//     largest coarse entropy less exactly this fluctuation term: a coarse heat death with fluctuations, then exact
//     recurrence, never a fine one.
//  3. On a growing mesh the largest value itself grows. The coarse map's block count grows with the mesh, so ln B grows
//     without bound: on the {3,4,3,4} mesh by ln 18.28 = 2.9 each shell in the bulk (E-GMT-0027), and as 3 ln t on a
//     husk grown from one seed (E-CSM-0059). The coarse entropy then has no final value while the mesh grows: it can
//     only chase a rising ceiling, lagging it by at least the time the blocks take to share energy. The relaxation time
//     is read here at three sizes; the adopted knit is defined on the D4 torus box, so a growing run of the knit itself
//     is NOT made here, and statement 3 is argued from the fixed-box readings, not measured.
//
// GATES, fixed before the gate run:
//  E1 instrument: energy and charge exact at every beat of every run; on one start per side, 400 beats forward then 400
//     back returns the start bit for bit
//  E2 the ceiling: on every run the mean deficit over beats 201 to 400 is at most 0.02 of its start
//  E3 the floor is equilibrium: on every run that mean deficit is within 0.8 to 1.25 of (B - 1) F / (2 E), with F the
//     Fano factor of the same late block energies
// Verdict: pass if all hold; partial if E1 fails.
//
// Reported, not gated: per side the first beat with deficit at most a tenth of its start, the floor against its
// prediction, and F.
//
// DISCLOSED: probe tmp/hc-probe2 (before this file) ran one start per side for 120 beats: late deficit to start 5e-4 to
// 2.2e-3, and read against (B - 1) / (2E) with F = 1 it came out 0.75 to 0.87, which suggested the Fano factor below 1
// (the knit's slots exclude, E-FND-0148). E3's form was derived after that probe; its band was set before this run.
//
// FIRST RUN (tmp/hc-exp34-run1.log, 133 s): pass, every gate, recorded as is. Late deficit over its start 0.00047 to
// 0.00201, over the predicted floor 1.016 to 1.143 (side 8 the widest, the fewest blocks), Fano 0.613 to 0.790, a tenth
// of the start by beat 3 to 4 at every size. Title written after the run.
//
// Depth L2. DETERMINISM: Weyl starts and the 17-member link family; nothing is drawn. NOTHING MOVES.

import { experiment } from '@/test/scaffold/suite'
import { verdict } from '@/test/scaffold/verdict'
import { arrowBox, blockEnergy, chargeOf, energyOf, lowEntropyStart, shannon, twoWay } from '@/code/measure/second-law-husk'
import { sameReduced } from '@/code/measure/living-pair-kernel'
import { startFamily, withStart } from '@/code/measure/start-ensemble'
import { variance } from '@/code/measure/fluctuation-dissipation'

const SIDES = [8, 12, 16]
const BLOCK = 4
const PER_DOCK = 16
const BEATS = 400
const LATE = 200
const MEMBERS = 3

type Run = { side: number; blocks: number; energy: number; d0: number; late: number; fano: number; predicted: number; t10: number; exact: boolean; returns: boolean | null }

export function coarseEndRun() {
  const started = Date.now()
  const members = startFamily(16).slice(0, MEMBERS)
  const runs: Run[] = []

  for (const side of SIDES) {
    members.forEach((member, k) => {
      const box = withStart(member, () => arrowBox(side, BLOCK))
      const start = lowEntropyStart(box, { blocks: [0], perDock: PER_DOCK, phase: k })
      const r = twoWay(box, start)
      const e = new Float64Array(box.blocks)
      const lnB = Math.log(box.blocks)
      const energy = energyOf(start)
      const charge = chargeOf(start)
      const deficit: number[] = []
      const lateBlocks: number[] = []
      let exact = true

      blockEnergy(box, start, e)
      deficit.push(lnB - shannon(e))

      for (let t = 1; t <= BEATS; t++) {
        r.forward()

        const s = r.state()

        exact = exact && energyOf(s) === energy && chargeOf(s) === charge
        blockEnergy(box, s, e)
        deficit.push(lnB - shannon(e))

        if (t > BEATS - LATE) for (const v of e) lateBlocks.push(v)
      }

      let returns: boolean | null = null

      if (k === 0) {
        for (let t = 0; t < BEATS; t++) r.backward()

        returns = sameReduced(r.state(), start) && r.time() === 0
      }

      const d0 = deficit[0] as number
      const late = deficit.slice(BEATS - LATE + 1).reduce((a, b) => a + b, 0) / LATE
      const { mean, variance: v } = variance(lateBlocks)
      const fano = v / mean
      const predicted = ((box.blocks - 1) * fano) / (2 * energy)

      runs.push({ side, blocks: box.blocks, energy, d0, late, fano, predicted, t10: deficit.findIndex(x => x <= d0 / 10), exact, returns })
    })
    console.error(`side ${side} ${Math.round((Date.now() - started) / 1000)}s`)
  }

  const e1 = runs.every(r => r.exact && r.returns !== false)
  const e2 = runs.every(r => r.late <= 0.02 * r.d0)
  const e3 = runs.every(r => r.late / r.predicted >= 0.8 && r.late / r.predicted <= 1.25)
  const status = !e1 ? 'partial' : e2 && e3 ? 'pass' : 'fail'
  const bySide = SIDES.map(side => {
    const of = runs.filter(r => r.side === side)

    return {
      side,
      blocks: (of[0] as Run).blocks,
      ratio: of.map(r => r.late / r.predicted),
      fano: of.map(r => r.fano),
      t10: of.map(r => r.t10),
      late: of.map(r => r.late),
      d0: of.map(r => r.d0),
    }
  })
  const range = (xs: number[], digits = 3): string => `${Math.min(...xs).toFixed(digits)} to ${Math.max(...xs).toFixed(digits)}`

  return verdict({
    status,
    claim: `on the adopted knit at sides ${SIDES.join(', ')} (${bySide.map(b => b.blocks).join(', ')} husk blocks, ${MEMBERS} starts each, ${BEATS} beats), the coarse entropy rises to its ceiling ln B and stays within the equilibrium fluctuation floor: the late deficit is ${bySide.map(b => `${range(b.late.map((l, i) => l / (b.d0[i] as number)), 5)} of its start at side ${b.side}`).join(', ')}, and ${range(runs.map(r => r.late / r.predicted))} of the predicted floor (B - 1) F / (2 E), with block Fano factors ${range(runs.map(r => r.fano))}; energy and charge exact and the start returned bit for bit; so a fixed box ends in a coarse heat death with fluctuations and exact recurrence, and a growing mesh, whose ceiling ln B rises without bound, has no coarse end state (argued, not run on a growing mesh)`,
    metrics: {
      gate_E1: e1 ? 1 : 0,
      gate_E2: e2 ? 1 : 0,
      gate_E3: e3 ? 1 : 0,
      floorRatioMin: Math.min(...runs.map(r => r.late / r.predicted)),
      floorRatioMax: Math.max(...runs.map(r => r.late / r.predicted)),
      fanoMin: Math.min(...runs.map(r => r.fano)),
      fanoMax: Math.max(...runs.map(r => r.fano)),
      ...Object.fromEntries(bySide.map(b => [`tenfoldBeatMaxSide${b.side}`, Math.max(...b.t10)])),
      ...Object.fromEntries(bySide.map(b => [`lateOverStartMaxSide${b.side}`, Math.max(...b.late.map((l, i) => l / (b.d0[i] as number)))])),
      seconds: (Date.now() - started) / 1000,
    },
    control: {
      floorPredictedIndependently: e3 ? 1 : 0,
    },
    notes: `L2. Gates E1 ${e1}, E2 ${e2}, E3 ${e3}. Per side (blocks; start deficit; late / start; late / predicted floor; Fano; tenfold beat): ${bySide.map(b => `side ${b.side} (${b.blocks}): ${range(b.d0, 4)}; ${range(b.late.map((l, i) => l / (b.d0[i] as number)), 5)}; ${range(b.ratio)}; ${range(b.fano)}; ${b.t10.join(', ')}`).join('; ')}. The floor is set by the energy per block, not the box: (B - 1) F / (2 E) is about F / (2 E_b), so a mesh that grows with a fixed energy density keeps the same floor under a ceiling that rises as ln B. Exact recurrence on the side-4 box is E-FND-0146's (6 to over 524,288 beats). Not run: the adopted knit on a growing mesh, which it is not defined on. ${((Date.now() - started) / 1000).toFixed(0)} s.`,
  })
}

export default experiment({
  id: 'foundations/coarse-end-state',
  code: 'E-FND-0155',
  title:
    'the end state, read on the husk, pass: on the adopted knit at sides 8, 12 and 16 (3 starts each, 400 beats) the coarse entropy rises to its ceiling ln B within 4 beats and stays at the equilibrium fluctuation floor predicted from the blocks\' own Fano factor (1.016 to 1.143 of it), so a fixed box ends in a coarse heat death with fluctuations and exact recurrence and never a fine one; on a growing mesh the ceiling rises without bound, so there is no coarse end state (argued from the fixed-box readings, not run on a growing mesh)',
  category: 'foundations',
  substrates: ['3434'],
  depth: 'L2',
  paper: false,
  run: coarseEndRun,
})
