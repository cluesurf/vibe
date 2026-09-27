// The depth as the husk's heat bath, on the adopted knit: does the husk's coarse entropy rise to Gibbs when the depth
// takes part, and at what temperature, read from the husk's own occupation law (E-FND-0148).
//
// THE QUESTION. E-SPN-0048 and E-SPN-0056 found, on the cold weave, that the depth step 2 e4 commutes with the beat, so
// a depth-uniform fill is a closed sector: the husk alone, which never reaches Fermi-Dirac (its Fano factor stays L times
// the Fermi value). E-SPN-0057 broke the depth step with a stand-in (the cusp's measure as each layer's clock) and
// FAILED as gated: the deep layers' clocks never tick, so their slots keep the start. This file asks the same question
// on the ADOPTED knit (the coset-union vacuum under the lone bounce collision L), with no stand-in.
//
// DERIVED BEFORE THE RUN.
//  (a) The adopted knit has no husk sector. Two things break the depth step: the coset-union store is not invariant
//      under 2 e4 (its orientation has period 4 D4, and 2 e4 is not in it), and the link start gives every link its own
//      grid move, so role points copied along a column come apart and the neutral veto then acts differently along it.
//      So a depth-uniform fill leaves its sector at once and the depth is always a bath.
//  (b) A CONTROL where the depth step IS exact (labeled a control, not the adopted knit): every link's grid move the
//      identity and the empty vacuum. The stream and the collision are the same in every dock and the veto reads only
//      points, which then never change along the stream, so the beat commutes with 2 e4 and a depth-uniform fill stays
//      depth-uniform forever, at every beat, exactly. Its husk mode then counts L equal copies: Fano = L (1 - f).
//  (c) Gibbs with the role points counted. A held slot carries one of P = 9 role points, a stored unit one (its two
//      tokens share it, E-RLT-0075), a pair on a line P^2. The energy is 1 per held slot and 2 per stored unit
//      (E-RLT-0064), the charge a love minus a fear, and the stored unit is neutral. The Gibbs weights are then
//      P e^(-beta (1 -+ mu)) for a love or fear against 1 for a calm slot, and P e^(-2 beta) for either stored sign
//      against 1 for an empty store. So p+ p- / p0^2 = P^2 e^(-2 beta) and s+ s- / s0^2 = P^2 e^(-4 beta), and the two
//      raw readings b_slot = -(1/2) ln(p+ p- / p0^2), b_store = -(1/4) ln(s+ s- / s0^2) must differ by exactly
//      (1/2) ln P = (1/2) ln 9 = 1.0986. The temperature is 1 / beta with beta = b_slot + ln 9, in units where one held
//      slot costs 1.
//
// THE RUNS. Side 12, the husk cut into 27 blocks of 4 x 4 x 4 columns, 17 link starts (phase k for member k). Two fills
// with the same husk block energies (12,288 extra vibes in block 0): DEPTH-UNIFORM (one dock per column filled by the
// Weyl ranks and copied down the column) and DEPTH-BROKEN (every dock ranked on its own). Arm A: the adopted knit. Arm B:
// the control of (b). 300 beats; the husk law read every 5th beat from 150 to 300.
//
// Gates, fixed before the first run of this file:
//  D1 instrument: energy and charge exact in every run; arm B's depth-uniform fill differs from its depth image in 0
//     slots and stores at every beat, on 17 of 17
//  D2 the adopted knit has no husk sector: its vacuum store differs from its depth image on more than 0 lines, and arm
//     A's depth-uniform fill's late mean depth mismatch is within 5 percent of the depth-broken fill's, on 17 of 17
//  D3 Gibbs with the depth included (arm A, both fills, 17 of 17): per husk class the held-count law is within total
//     variation 0.01 of the binomial of its mean, its Fano factor within 0.02 of 1 - f, and |b_store - b_slot - (1/2)
//     ln 9| <= 0.02 (MOVED after the first run, see below: the first run's line read b_slot - b_store)
//  D4 with the depth excluded it is not Gibbs (arm B): the depth-uniform fill's Fano factor is at least 0.8 L (1 - f) in
//     both classes, while arm B's depth-broken fill's is within 0.05 of 1 - f, on 17 of 17
//  D5 the depth lowers the coarse floor: arm B's depth-uniform late deficit (mean over beats 150 to 300) is at least 3
//     times its depth-broken late deficit, on 17 of 17 (predicted near L = 12: L equal copies make every block
//     fluctuation L times larger in variance)
// Verdict: pass if all hold; fail if D1 holds and any other fails; partial if D1 fails.
//
// Reported, not gated: the first beat with deficit <= D(0) / 10 for every arm and fill (how fast), the temperature, the
// fills, arm B's thermometers.
//
// DISCLOSED: probes before this file (tmp/arrow-probe2.ts, side 8, one start) ran arm A's two fills on the coset-union
// vacuum (mismatch at the vacuum's 6,144 store lines, both fills Fano within 0.004 of 1 - f and binomial to 0.003, b_slot
// - b_store = 1.1008 and 1.0983) and the same with the empty vacuum and member links (b_slot - b_store 1.0939 and
// 1.0888, the uniform fill leaving its sector by beat 2). The (1/2) ln 9 reading of that gap was derived after those
// probes showed the raw readings disagreeing; D3's form was written then. D4 and D5 (identity links) were not probed.
//
// FIRST RUN (151 s): FAIL on D3, D4 and D5, recorded as is. D1 and D2 held. D3 failed only on the thermometer clause,
// whose sign was written backward: derivation (c) gives b_slot = beta - ln 9 and b_store = beta - (1/2) ln 9, so b_store
// - b_slot = +(1/2) ln 9, and the first run measured b_slot - b_store = -1.1046 to -1.0947 (the magnitude within 0.006 of
// 1.0986, every other D3 clause holding: Fano within 0.005 of 1 - f, binomial to 0.0036). The sign was corrected after
// seeing that run, a moved gate, disclosed here and in the report. D4 and D5 failed on real numbers and are NOT moved:
// arm B's depth-broken fill is not Gibbs either (axis Fano 1.67 to 1.76 times 1 - f), because the empty vacuum leaves the
// gas dilute (fill 0.025), where most docks hold one single line and L passes it unscattered; and so the coarse floor with
// the depth excluded is 0.9 to 1.2 times the floor with it, not 3 times. Arm B's sector closure held exactly (0
// mismatches, Fano 12.63 to 13.16 times 1 - f, the L = 12 predicted). The second run adds arm C, REPORTED ONLY and chosen
// after the first run: the same identity grid moves on a dense depth-invariant vacuum (every line of every dock stored,
// every store point 0), to see whether a dense control separates the two fills where the dilute one could not.
//
// SECOND RUN (289 s, the record): fail on D4 and D5 with the first run's numbers unchanged, D3 holding with the corrected
// sign (gap 1.0947 to 1.1046). Arm C: its depth-uniform fill keeps 0 mismatches at every beat with husk Fano 11.97 to
// 12.0 times 1 - f, its depth-broken fill is Gibbs (Fano 0.997 to 1.004 of 1 - f, binomial to 0.0031, fill 0.57), and
// the late coarse deficit is 10.6 to 13.2 times higher in the sector than with the depth broken (near L = 12); both
// reach a tenth of D(0) by beat 7. Its thermometer gap is 0.034 to 0.042, not (1/2) ln 9: every store point is 0 and the
// identity grid moves never change a point, so the 9-fold point degeneracy is not explored there. Title written after
// the runs.
//
// E-SPN-0057, honestly: this file does not rescue it. 0057's gate failed on the warped layer clock, a stand-in this file
// does not use; the flat box here has no warp. What this file can say is that on the adopted knit the husk needs no
// stand-in to reach the bath, because the knit itself breaks the depth step. Whether the warped cusp freezes deep
// layers is still open.
//
// Depth L2. Husk first: the Fano factors and temperatures are read on husk modes (a column and a directed husk
// direction); the bulk beside is the per-slot trit law, which the husk sum inherits. DETERMINISM: Weyl fills and the 17
// link starts. NOTHING MOVES: the stream copies.

import { experiment } from '@/test/scaffold/suite'
import { verdict } from '@/test/scaffold/verdict'
import { arrowBox, blockEnergy, chargeOf, depthMismatch, energyOf, lowEntropyStart, makeHuskLaw, readHuskLaw, sampleHuskLaw, shannon, twoWay, vacuumState, type LawReading } from '@/code/measure/second-law-husk'
import { startFamily, withStart } from '@/code/measure/start-ensemble'
import { uniformStore } from '@/code/measure/varying-vacuum'

const SIDE = 12
const BLOCK = 4
const PER_DOCK = 16
const BEATS = 300
const FROM = 150
const EVERY = 5
const HALF_LN9 = 0.5 * Math.log(9)

type Run = { exact: boolean; law: LawReading; lateMismatch: number; mismatchMax: number; d0: number; late: number; t10: number; storeMismatch: number }

export default experiment({
  id: 'foundations/depth-bath-entropy',
  code: 'E-FND-0148',
  title:
    'the depth as the husk heat bath, fail as gated (D4, D5 on the dilute control; one D3 sign moved after run 1, disclosed): on the adopted knit (coset-union vacuum, lone bounce, side 12, 17 starts) the vacuum store (31,104 lines off its depth image) and the link start break the depth step, so a depth-uniform fill leaves its sector and both fills reach the husk exclusive-slot Gibbs law (Fano 0.994 to 1.005 of 1 - f, binomial to 0.0036) with the slot and store thermometers apart by 1.095 to 1.105 against (1/2) ln 9 = 1.099 once the 9 role points are counted, beta = 3.898 per unit (T = 0.257); in a control where the depth step is exact the depth-uniform fill stays in its sector at every beat with husk Fano 12 times Fermi-Dirac (L = 12); on the dilute empty-vacuum control the depth-broken fill is not Gibbs either (1.67 to 1.76), so D4 and D5 fail, while on a dense all-line control (reported, added after run 1) it is (0.997 to 1.004) and the coarse floor is 10.6 to 13.2 times higher without the depth; the depth does not make the rise faster (tenfold at beat 4 and 7 either way)',
  category: 'foundations',
  substrates: ['3434'],
  depth: 'L2',
  paper: false,
  run() {
    const started = Date.now()
    const log = (what: string): void => console.error(`${what} ${Math.round((Date.now() - started) / 1000)}s`)
    const members = startFamily(16)
    // arm 'A' the adopted knit, 'B' the control of (b) (identity grid moves, empty vacuum), 'C' (added after the first
    // run, reported only) identity grid moves on the all-line vacuum, every line of every dock stored, all store points 0
    const runOne = (arm: 'A' | 'B' | 'C', uniform: boolean, k: number): Run => {
      const control = arm !== 'A'
      const box = withStart(members[k]!, () => arrowBox(SIDE, BLOCK, 'union', 'lone', control))
      const start = lowEntropyStart(box, {
        blocks: [0],
        perDock: PER_DOCK,
        phase: k,
        depthUniform: uniform,
        emptyVacuum: arm === 'B',
        ...(arm === 'C' ? { store: uniformStore(box.cells, [0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11]), storePoint: 0 } : {}),
      })
      const r = twoWay(box, start)
      const e = new Float64Array(box.blocks)
      const lnB = Math.log(box.blocks)
      const law = makeHuskLaw(SIDE)
      const energy = energyOf(start)
      const charge = chargeOf(start)
      const deficit: number[] = []
      let exact = true
      let lateMismatch = 0
      let mismatchMax = depthMismatch(box, start)
      let late = 0
      let samples = 0

      blockEnergy(box, start, e)
      deficit.push(lnB - shannon(e))

      for (let t = 1; t <= BEATS; t++) {
        r.forward()

        const s = r.state()

        blockEnergy(box, s, e)
        deficit.push(lnB - shannon(e))

        if (control && uniform) mismatchMax = Math.max(mismatchMax, depthMismatch(box, s))

        if (t >= FROM && t % EVERY === 0) {
          exact = exact && energyOf(s) === energy && chargeOf(s) === charge
          sampleHuskLaw(box, law, s)
          lateMismatch += depthMismatch(box, s)
          late += deficit[t] as number
          samples++
        }
      }

      const d0 = deficit[0] as number

      return {
        exact,
        law: readHuskLaw(law),
        lateMismatch: lateMismatch / samples,
        mismatchMax,
        d0,
        late: late / samples,
        t10: deficit.findIndex(x => x <= d0 / 10),
        storeMismatch: depthMismatch(box, vacuumState(box)),
      }
    }

    const arms = members.map((_, k) => {
      const out = {
        aUniform: runOne('A', true, k),
        aBroken: runOne('A', false, k),
        bUniform: runOne('B', true, k),
        bBroken: runOne('B', false, k),
        cUniform: runOne('C', true, k),
        cBroken: runOne('C', false, k),
      }

      log(`member ${k}`)

      return out
    })

    const all = arms.flatMap(a => [a.aUniform, a.aBroken, a.bUniform, a.bBroken])
    const d1 = all.every(r => r.exact) && arms.every(a => a.bUniform.mismatchMax === 0)
    const d2 = arms.every(a => a.aUniform.storeMismatch > 0 && Math.abs(a.aUniform.lateMismatch - a.aBroken.lateMismatch) <= 0.05 * a.aBroken.lateMismatch)
    const gibbs = (r: Run): boolean => [0, 1].every(c => (r.law.tvBinomial[c] as number) <= 0.01 && Math.abs((r.law.fano[c] as number) - (r.law.fermi[c] as number)) <= 0.02) && Math.abs(r.law.betaStore - r.law.betaSlot - HALF_LN9) <= 0.02
    const d3 = arms.every(a => gibbs(a.aUniform) && gibbs(a.aBroken))
    const d4 = arms.every(a => [0, 1].every(c => (a.bUniform.law.fano[c] as number) >= 0.8 * SIDE * (a.bUniform.law.fermi[c] as number) && Math.abs((a.bBroken.law.fano[c] as number) - (a.bBroken.law.fermi[c] as number)) <= 0.05))
    const d5 = arms.every(a => a.bUniform.late >= 3 * a.bBroken.late)
    const status = !d1 ? 'partial' : d2 && d3 && d4 && d5 ? 'pass' : 'fail'
    const pick = (f: (r: Run) => number, which: keyof (typeof arms)[number]): number[] => arms.map(a => f(a[which]))
    const range = (xs: number[], digits = 3): string => `${Math.min(...xs).toFixed(digits)} to ${Math.max(...xs).toFixed(digits)}`
    const beta = (r: Run): number => r.law.betaSlot + 2 * HALF_LN9
    const gap = (r: Run): number => r.law.betaStore - r.law.betaSlot
    const fanoRatio = (r: Run, c: number): number => (r.law.fano[c] as number) / (r.law.fermi[c] as number)
    const a0 = arms[0]!

    return verdict({
      status,
      claim: `on the adopted knit (coset-union vacuum, lone bounce, side ${SIDE}, 17 starts) the vacuum and the link start break the depth step, so a depth-uniform fill leaves its sector (late mismatch ${range(pick(r => r.lateMismatch, 'aUniform'), 0)} against ${range(pick(r => r.lateMismatch, 'aBroken'), 0)} depth-broken) and both fills reach the husk's exclusive-slot Gibbs law (axis Fano / (1 - f) ${range(pick(r => fanoRatio(r, 0), 'aUniform'))} and ${range(pick(r => fanoRatio(r, 0), 'aBroken'))}, binomial to ${Math.max(...pick(r => Math.max(...r.law.tvBinomial), 'aUniform'), ...pick(r => Math.max(...r.law.tvBinomial), 'aBroken')).toFixed(4)}), with the slot and store thermometers apart by ${range([...pick(gap, 'aUniform'), ...pick(gap, 'aBroken')], 4)} against (1/2) ln 9 = ${HALF_LN9.toFixed(4)} (the 9 role points counted), beta = ${range([...pick(beta, 'aUniform'), ...pick(beta, 'aBroken')])} per unit; in the control where the depth step is exact (identity grid moves, empty vacuum) the depth-uniform fill stays in its sector at every beat and its husk Fano is ${range(pick(r => fanoRatio(r, 0), 'bUniform'), 2)} times Fermi-Dirac (L = ${SIDE}), the depth-broken fill ${range(pick(r => fanoRatio(r, 0), 'bBroken'))}, and the husk's coarse deficit floor is ${range(arms.map(a => a.bUniform.late / a.bBroken.late), 1)} times higher without the depth`,
      metrics: {
        gate_D1: d1 ? 1 : 0,
        gate_D2: d2 ? 1 : 0,
        gate_D3: d3 ? 1 : 0,
        gate_D4: d4 ? 1 : 0,
        gate_D5: d5 ? 1 : 0,
        vacuumStoreMismatch: a0.aUniform.storeMismatch,
        aUniformLateMismatchMin: Math.min(...pick(r => r.lateMismatch, 'aUniform')),
        aBrokenLateMismatchMin: Math.min(...pick(r => r.lateMismatch, 'aBroken')),
        bUniformMismatchMax: Math.max(...pick(r => r.mismatchMax, 'bUniform')),
        aFanoRatioAxisMax: Math.max(...pick(r => fanoRatio(r, 0), 'aUniform'), ...pick(r => fanoRatio(r, 0), 'aBroken')),
        aFanoRatioDiagonalMax: Math.max(...pick(r => fanoRatio(r, 1), 'aUniform'), ...pick(r => fanoRatio(r, 1), 'aBroken')),
        aTvBinomialMax: Math.max(...pick(r => Math.max(...r.law.tvBinomial), 'aUniform'), ...pick(r => Math.max(...r.law.tvBinomial), 'aBroken')),
        aThermometerGapMin: Math.min(...pick(gap, 'aUniform'), ...pick(gap, 'aBroken')),
        aThermometerGapMax: Math.max(...pick(gap, 'aUniform'), ...pick(gap, 'aBroken')),
        aBetaMin: Math.min(...pick(beta, 'aUniform'), ...pick(beta, 'aBroken')),
        aBetaMax: Math.max(...pick(beta, 'aUniform'), ...pick(beta, 'aBroken')),
        aFillAxis: a0.aBroken.law.fill[0] as number,
        bUniformFanoRatioAxisMin: Math.min(...pick(r => fanoRatio(r, 0), 'bUniform')),
        bUniformFanoRatioDiagonalMin: Math.min(...pick(r => fanoRatio(r, 1), 'bUniform')),
        bBrokenFanoRatioAxisMax: Math.max(...pick(r => fanoRatio(r, 0), 'bBroken')),
        bThermometerGapMin: Math.min(...pick(gap, 'bUniform'), ...pick(gap, 'bBroken')),
        bThermometerGapMax: Math.max(...pick(gap, 'bUniform'), ...pick(gap, 'bBroken')),
        bLateDeficitRatioMin: Math.min(...arms.map(a => a.bUniform.late / a.bBroken.late)),
        aUniformTenfoldMax: Math.max(...pick(r => r.t10, 'aUniform')),
        aBrokenTenfoldMax: Math.max(...pick(r => r.t10, 'aBroken')),
        bUniformTenfoldMax: Math.max(...pick(r => r.t10, 'bUniform')),
        bBrokenTenfoldMax: Math.max(...pick(r => r.t10, 'bBroken')),
        cExact: arms.every(a => a.cUniform.exact && a.cBroken.exact) ? 1 : 0,
        cUniformMismatchMax: Math.max(...pick(r => r.mismatchMax, 'cUniform')),
        cUniformFanoRatioAxisMin: Math.min(...pick(r => fanoRatio(r, 0), 'cUniform')),
        cUniformFanoRatioDiagonalMin: Math.min(...pick(r => fanoRatio(r, 1), 'cUniform')),
        cBrokenFanoRatioAxisMin: Math.min(...pick(r => fanoRatio(r, 0), 'cBroken')),
        cBrokenFanoRatioAxisMax: Math.max(...pick(r => fanoRatio(r, 0), 'cBroken')),
        cBrokenTvBinomialMax: Math.max(...pick(r => Math.max(...r.law.tvBinomial), 'cBroken')),
        cThermometerGapMin: Math.min(...pick(gap, 'cUniform'), ...pick(gap, 'cBroken')),
        cThermometerGapMax: Math.max(...pick(gap, 'cUniform'), ...pick(gap, 'cBroken')),
        cLateDeficitRatioMin: Math.min(...arms.map(a => a.cUniform.late / a.cBroken.late)),
        cLateDeficitRatioMax: Math.max(...arms.map(a => a.cUniform.late / a.cBroken.late)),
        cUniformTenfoldMax: Math.max(...pick(r => r.t10, 'cUniform')),
        cBrokenTenfoldMax: Math.max(...pick(r => r.t10, 'cBroken')),
        cFillAxis: a0.cBroken.law.fill[0] as number,
        seconds: (Date.now() - started) / 1000,
      },
      control: {
        sectorClosedInControl: arms.every(a => a.bUniform.mismatchMax === 0) ? 1 : 0,
        controlUniformFanoRatioAxis: a0.bUniform.law.fano[0]! / a0.bUniform.law.fermi[0]!,
      },
      notes: `L2. Gates D1 ${d1}, D2 ${d2}, D3 ${d3}, D4 ${d4}, D5 ${d5}. Committed start (arm A uniform; broken; arm B uniform; broken): fill ${[a0.aUniform, a0.aBroken, a0.bUniform, a0.bBroken].map(r => r.law.fill.map(x => x.toFixed(4)).join('/')).join('; ')}; Fano/(1 - f) axis ${[a0.aUniform, a0.aBroken, a0.bUniform, a0.bBroken].map(r => fanoRatio(r, 0).toFixed(3)).join('; ')}; diagonal ${[a0.aUniform, a0.aBroken, a0.bUniform, a0.bBroken].map(r => fanoRatio(r, 1).toFixed(3)).join('; ')}; b_slot ${[a0.aUniform, a0.aBroken, a0.bUniform, a0.bBroken].map(r => r.law.betaSlot.toFixed(4)).join('; ')}; b_store ${[a0.aUniform, a0.aBroken, a0.bUniform, a0.bBroken].map(r => r.law.betaStore.toFixed(4)).join('; ')}; deficit D(0) ${[a0.aUniform, a0.aBroken, a0.bUniform, a0.bBroken].map(r => r.d0.toFixed(4)).join('; ')}, late ${[a0.aUniform, a0.aBroken, a0.bUniform, a0.bBroken].map(r => r.late.toExponential(2)).join('; ')}, tenfold beat ${[a0.aUniform, a0.aBroken, a0.bUniform, a0.bBroken].map(r => r.t10).join('; ')}. Arm B thermometer gap ${range([...pick(gap, 'bUniform'), ...pick(gap, 'bBroken')], 4)} (not gated: identity grid moves keep every token's point, so the point degeneracy need not be ergodic there). ${((Date.now() - started) / 1000).toFixed(0)} s.`,
    })
  },
})
