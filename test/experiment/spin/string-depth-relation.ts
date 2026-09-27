// Does the flux string give any integer relation to the depth D that could bear on alpha? A pre-registered
// reading of E-SPN-0075 and 0076's string, under the E-MTH-0010 null.
//
// The depth already sets the light's coupling, kappa = 2 / (2D + 1) and alpha = sqrt(3 (2D + 1)) / (48 D)
// (E-FRC-0207, 0212), with D chosen, not derived (1/77 at D = 16, 1/137 would need D near 49). A mechanism that
// fixed D would fix alpha. The flux string is the first bound object whose range is set by D, so it is the place to
// ask. The question is asked once, here, with the answer written first.
//
// THE PREDICTION, written before this file ran: NO. The string yields exactly one integer relation to D, its range
// l <= 2D, and that is built in (the column's 2D + 1 values, E-SPN-0075), so it cannot select D. What the string
// does with D beyond that is continuum scaling, not integer relation: the cost per unit of flux is pi / N (N = 2D + 1),
// a walk of effective mass O(1) in a linear potential of slope sigma binds at a size sigma^(-1/3) with a binding
// energy sigma^(2/3), so the pair's lightest level grows as N^(1/3) and its energy falls as N^(-2/3), and the
// three-love level's size is set by its meetings, not by D. Nothing here names a D, so alpha stays a chosen knob.
//
// GATES, fixed with the prediction (Q2 to Q4 were written after E-SPN-0076's disclosed design probes had printed
// these levels, tmp/fsx-probe3 to 5, so they are checks of a scaling argument against seen numbers, not blind; Q1
// and Q5 were not probed):
// Q1 The range: over the relative configurations the string reaches, the largest l is 2D exactly, D = 1 .. 16.
// Q2 The pair's lightest size (C, c = N, the definition of E-SPN-0076) fits <l> = a N^p over D = 4, 6, 8, 12, 16
//    with p in [0.25, 0.42] (the continuum Airy exponent is 1/3).
// Q3 Its unwrapped energy fits E = b N^q over the same depths with q in [-0.80, -0.55] (Airy: -2/3).
// Q4 The three-love lightest level's <l> varies by less than 10 percent over D = 2 .. 5.
// Q5 No number is identified: for the pair's <l> and E at the committed depth D = 16 and the fitted exponents p
//    and q, every E-MTH-0010 budget hit at the number's own precision has a null rate of at least 0.01 (or there
//    is no hit); so no relation to D, alpha or any small closed form is admitted.
// Status pass if all hold (a pass here is the NEGATIVE answer holding).
// HUSK: one husk line; every number is a husk number. START FAMILY: nothing here reads a color link.
//
// Depth L1: a pre-registered negative with its null; the stand-in string is E-SPN-0075 and 0076's.

import { experiment } from '@/test/scaffold/suite'
import { verdict } from '@/test/scaffold/verdict'
import { blochSpace, lightestUnwrapped, spectrumAt, stringMoments, type BlochSpec } from '@/code/measure/flux-store-bloch'
import { nullMatchRate, relationHits } from '@/code/measure/integer-relation'

const FIT_DEPTHS = [4, 6, 8, 12, 16] as const
const NULL_SAMPLES = 2000

const pairSpec = (D: number): BlochSpec => {
  const N = 2 * D + 1

  return { kinds: ['love', 'fear'], convention: 'C', unlike: 'knit', depth: D, cost: N, root: 2 * N * N, labels: 2 }
}

const threeSpec = (D: number): BlochSpec => {
  const N = 2 * D + 1

  return { kinds: ['love', 'love', 'love'], convention: 'C', unlike: 'knit', depth: D, cost: N, root: 2 * N * N, labels: 2 }
}

// least squares of log y on log x: slope and its standard error
function logFit(x: readonly number[], y: readonly number[]): { slope: number; intercept: number; se: number } {
  const lx = x.map(Math.log)
  const ly = y.map(Math.log)
  const n = lx.length
  const mx = lx.reduce((a, b) => a + b, 0) / n
  const my = ly.reduce((a, b) => a + b, 0) / n
  let sxx = 0
  let sxy = 0

  for (let i = 0; i < n; i++) {
    sxx += (lx[i]! - mx) ** 2
    sxy += (lx[i]! - mx) * (ly[i]! - my)
  }

  const slope = sxy / sxx
  const intercept = my - slope * mx
  let rss = 0

  for (let i = 0; i < n; i++) rss += (ly[i]! - intercept - slope * lx[i]!) ** 2

  return { slope, intercept, se: Math.sqrt(rss / (n - 2) / sxx) }
}

type Candidate = { name: string; value: number; delta: number; hits: number; best: string; nullRate: number }

function underNull(name: string, value: number, delta: number): Candidate {
  const hits = relationHits(value, delta)

  return { name, value, delta, hits: hits.length, best: hits[0]?.form ?? 'none', nullRate: hits.length > 0 ? nullMatchRate(value, delta, NULL_SAMPLES) : Number.NaN }
}

export default experiment({
  id: 'spin/string-depth-relation',
  code: 'E-SPN-0078',
  title: "the flux string gives no integer relation to the depth beyond its built-in range 2D, a pre-registered negative: the bound pair grows as N^(1/3) and its energy falls as N^(-2/3) (continuum Airy scaling of a slope pi / N), the three-love state's size is set by its meetings, and no size or energy at D = 16 passes the E-MTH-0010 null, so the string does not select D and alpha stays a chosen knob",
  category: 'spin',
  substrates: ['3434'],
  depth: 'L1',
  paper: false,
  run() {
    const started = Date.now()

    // ---- Q1 ----
    const ranges = Array.from({ length: 16 }, (_, i) => i + 1).map(D => ({ D, max: Math.max(...blochSpace(pairSpec(D)).strings) }))
    const threeRanges = [1, 2, 3, 4].map(D => ({ D, max: Math.max(...blochSpace(threeSpec(D)).strings) }))
    const q1 = ranges.every(r => r.max === 2 * r.D) && threeRanges.every(r => r.max === 2 * r.D)

    // ---- Q2, Q3 ----
    const pair = FIT_DEPTHS.map(D => {
      const r = spectrumAt(pairSpec(D), 0)
      const lp = lightestUnwrapped(r.bloch, r.all, 4 * D + 6)

      return { D, N: 2 * D + 1, mean: stringMoments(r.bloch, lp.level.vector).mean, energy: lp.unwrapped, residual: r.residual }
    })
    const sizeFit = logFit(
      pair.map(p => p.N),
      pair.map(p => p.mean),
    )
    const energyFit = logFit(
      pair.map(p => p.N),
      pair.map(p => p.energy),
    )
    const q2 = sizeFit.slope >= 0.25 && sizeFit.slope <= 0.42
    const q3 = energyFit.slope >= -0.8 && energyFit.slope <= -0.55

    // ---- Q4 ----
    const three = [2, 3, 4, 5].map(D => {
      const r = spectrumAt(threeSpec(D), 0)
      const lp = lightestUnwrapped(r.bloch, r.all, 4 * D + 6)

      return { D, mean: stringMoments(r.bloch, lp.level.vector).mean, energy: lp.unwrapped }
    })
    const means = three.map(t => t.mean)
    const spread = (Math.max(...means) - Math.min(...means)) / Math.min(...means)
    const q4 = spread < 0.1

    // ---- Q5 ----
    const at16 = pair.find(p => p.D === 16)!
    const precision = Math.max(1e-6, at16.residual)
    const candidates = [
      underNull('pair <l> at D = 16', at16.mean, precision),
      underNull('pair E at D = 16', at16.energy, precision),
      underNull('size exponent p', sizeFit.slope, sizeFit.se),
      underNull('energy exponent q', Math.abs(energyFit.slope), energyFit.se),
    ]
    const q5 = candidates.every(c => c.hits === 0 || c.nullRate >= 0.01)
    const alpha16 = Math.sqrt(3 * 33) / (48 * 16)
    const ok = q1 && q2 && q3 && q4 && q5

    return verdict({
      status: ok ? 'pass' : 'fail',
      claim: `the string's one integer relation to D is its range, 2D exactly at D = 1 to 16 and built in; beyond it the pair's lightest level grows as N^${sizeFit.slope.toFixed(3)} (+- ${sizeFit.se.toFixed(3)}; Airy 1/3) and its energy falls as N^${energyFit.slope.toFixed(3)} (+- ${energyFit.se.toFixed(3)}; Airy -2/3) over D = 4 to 16, the three-love level holds <l> ${means.map(m => m.toFixed(3)).join(', ')} at D = 2 to 5 (spread ${(100 * spread).toFixed(1)} percent, set by its meetings), and under the E-MTH-0010 budget ${candidates.map(c => `${c.name} ${c.value.toPrecision(7)}: ${c.hits} hits${c.hits > 0 ? `, null rate ${c.nullRate.toFixed(3)}` : ''}`).join('; ')}: nothing is identified, so the string selects no D and alpha (${alpha16.toFixed(5)} = 1/${(1 / alpha16).toFixed(1)} at D = 16) stays a chosen knob`,
      metrics: {
        gate_Q1: q1 ? 1 : 0,
        gate_Q2: q2 ? 1 : 0,
        gate_Q3: q3 ? 1 : 0,
        gate_Q4: q4 ? 1 : 0,
        gate_Q5: q5 ? 1 : 0,
        sizeExponent: sizeFit.slope,
        sizeExponentSE: sizeFit.se,
        energyExponent: energyFit.slope,
        energyExponentSE: energyFit.se,
        ...Object.fromEntries(pair.flatMap(p => [[`pair_D${p.D}_meanString`, p.mean], [`pair_D${p.D}_energy`, p.energy]])),
        ...Object.fromEntries(three.flatMap(t => [[`three_D${t.D}_meanString`, t.mean], [`three_D${t.D}_energy`, t.energy]])),
        threeSizeSpread: spread,
        ...Object.fromEntries(candidates.flatMap((c, i) => [[`candidate${i}_hits`, c.hits], [`candidate${i}_nullRate`, c.nullRate]])),
        seconds: (Date.now() - started) / 1000,
      },
      control: {
        alphaAtD16: alpha16,
        rangeMaxD16: ranges[15]!.max,
      },
      notes: `L1, a pre-registered negative. Gates Q1 ${q1}, Q2 ${q2}, Q3 ${q3}, Q4 ${q4}, Q5 ${q5}. Pair lightest (C, c = N): ${pair.map(p => `D ${p.D} (N ${p.N}): <l> ${p.mean.toFixed(4)}, E ${p.energy.toFixed(5)}`).join('; ')}. Fits: size a N^p with p ${sizeFit.slope.toFixed(4)} +- ${sizeFit.se.toFixed(4)}, energy b N^q with q ${energyFit.slope.toFixed(4)} +- ${energyFit.se.toFixed(4)}. Three loves: ${three.map(t => `D ${t.D}: <l> ${t.mean.toFixed(4)}, E ${t.energy.toFixed(5)}`).join('; ')}. Null: ${candidates.map(c => `${c.name} = ${c.value} at delta ${c.delta.toExponential(1)}: ${c.hits} hits (simplest ${c.best}), null rate ${Number.isNaN(c.nullRate) ? 'not needed' : c.nullRate.toFixed(4)}`).join('; ')}. The Q2 to Q4 windows were set after the disclosed probes of E-SPN-0076 had printed these levels, so they check a scaling argument against seen numbers; Q1 and Q5 were not probed. MEANING: the depth caps the string at 2D and sets its tension at pi / (2D + 1), and that is all: the bound state it makes sits about one link wide, far inside the cap, with continuum exponents that name no integer. So the string does not fix D, and alpha, which the depth also sets, is still a knob. A D that the model selects would need a quantity that is an integer function of D and also something the dynamics chooses, which this string is not. The one structural fact worth keeping: the store and the cost are one integer read twice, and the column's range is exactly what keeps the cost below half a turn (the longest string costs pi - pi / N).`,
    })
  },
})
