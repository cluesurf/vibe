// The string's cost from the light's own drift term, and a defined lightest level, on LOCKED STAND-IN tokens
// (code/rule/flux-store-line, code/measure/flux-store-bloch).
//
// E-SPN-0075 put the store on the flux: l <= 2D, a wall. A wall alone binds every relative state and orders none,
// and on a circle of quasi-energy nothing is lowest by itself. The light already charges for flux: its drift term
// is zeta_M^(-c sum bal(e)^2) per beat (code/rule/plaquette-ladder, M = 2 N^2, N = 2D + 1). Read on the string's
// links that is zeta_M^(-c l): no new parameter. c = N, the classical light's own split (E-FRC-0207), is the
// primary choice: pi / N per unit of flux per beat. c = 2 (the other split E-FRC-0230 compares) is reported.
//
// THE ARGUMENT, before any number.
// (1) Integer: the cost multiplies by a root of unity, zeta_(2N)^(-l) at c = N, so the rule stays exact over
//     Z[zeta_K], K = lcm(M, 3), and stays reversible (its inverse is the conjugate phase).
// (2) The cost never wraps inside the column: the longest string the store allows costs 2D pi / (2D + 1) < pi.
//     So the store and the cost are one integer read twice, as a count (the capacity) and as a phase (the cost),
//     and the column is exactly what keeps the phase single-valued. E-SPN-0074 showed a phase alone cannot confine
//     (it repeats); here the count bounds the range and the phase gives the slope.
// (3) With a slope, energy grows with the string, so the most compact particle state is the lightest, and its
//     size is set by the cost, not the wall: a linear potential of slope sigma = pi / N on a walk of effective mass
//     O(1) binds at a size (sigma)^(-1/3), far inside the column once D is large; with no cost the wall sets it.
//
// HOW "LIGHTEST" IS DEFINED on a circle (pre-registered here, written AFTER three disclosed probes of the spectrum,
// tmp/fsx-probe2, 3, 4, 5, which showed that the naive "level nearest the free band bottom E = 0" picks a wrapped
// long-string level, and that measuring E upward from 0 fails once a bound level sinks below 0):
//   * the PARTICLE SECTOR: each level is read in momentum space; a token in the antiparticle branch A at k is the
//     lattice doubler of a particle in B at k + pi (U(k + pi) = -U(k)); every token moves every beat, so each pair's
//     sublattice parity is kept and a level's all-particle content sits equally on the tuples with an EVEN number of
//     A tokens; a level is in the particle sector when that weight is at least 1/2
//   * each level's quasi-energy E is UNWRAPPED by its own content: the representative of E mod 2 pi nearest its
//     reference energy (its kinetic energy read as particles, each in [0, pi / 3], plus sigma <l>, plus each
//     meeting's principal phase -2 pi / 3 times the weight on that meeting's eigenspace)
//   * the LIGHTEST is the particle-sector level of least unwrapped energy
// The naive reading (nearest E = 0 on the circle) is reported beside it.
//
// PREDICTIONS (P3 was written after the probes above had shown these levels; P4's wall-only half and P1 are blind).
// P1 Exact with the cost: the walled pair under C (ring 12, D = 2, c = N = 5, M = 50, K = 150, 12 beats) and three
//    loves (ring 7, D = 1, c = 3, M = 18, K = 18, 6 beats) equal the float runner with the cost phase to 1e-12, the
//    norms sum to den^2, the exact inverse returns the start, every supported register holds Gauss and D - l.
// P2 The cost never wraps inside the column: 2 c (2D) < M for c = N at every D = 1 .. 64 (an integer identity).
// P3 The lightest is defined: for the pair under C at D = 1, 2, 3, 4, 6, 8, 12, 16 the particle sector is not
//    empty, the lightest's own unwrap offset is under pi / 2, the next particle-sector level is at least 1e-3
//    higher, and the lightest is the most compact particle-sector level (least <l>).
// P4 The cost sets the size: at D = 4, 8, 16 the lightest's <l> is at most D / 4 with c = N and at least D / 3
//    with c = 0 (the wall alone).
//
// Gates, fixed with the predictions: C1 = P1, C2 = P2, C3 = P3, C4 = P4. Status pass if all hold.
// THE FEAR'S STREAM SIGN: C is the user's choice (2026-09-26) and the only one gated; C' (with the love-fear
// meeting on the dock) is run at the same depths and reported. START FAMILY: nothing here reads a color link
// (E-SPN-0077 runs the 17 starts where the field enters). HUSK: one husk line; every number is a husk number.
//
// Depth L2: a constructed stand-in; the string's cost and the definition of lightest are the model's own drift
// term and walk, but locked tokens on one line are a stand-in for the knit's tokens.

import { experiment } from '@/test/scaffold/suite'
import { verdict } from '@/test/scaffold/verdict'
import { type FluxStoreSpec } from '@/code/rule/flux-store-line'
import {
  antisymmetrized,
  type LockedStart,
} from '@/code/measure/locked-run'
import { exactCheck } from '@/code/measure/flux-store-exact'
import {
  lightestUnwrapped,
  lineShare,
  nearestBandBottom,
  spectrumAt,
  stringMoments,
  type BlochSpec,
} from '@/code/measure/flux-store-bloch'

const DEPTHS = [1, 2, 3, 4, 6, 8, 12, 16] as const
const SIZE_DEPTHS = [4, 8, 16] as const

const pairSpec = (
  D: number,
  convention: 'C' | 'Cprime',
  cost: number,
): BlochSpec => {
  const N = 2 * D + 1

  return {
    kinds: ['love', 'fear'],
    convention,
    unlike: convention === 'C' ? 'knit' : 'dock',
    depth: D,
    cost,
    root: 2 * N * N,
    labels: convention === 'C' ? 2 : 3,
  }
}

type Reading = {
  D: number
  dim: number
  residual: number
  leak: number
  energy: number
  unwrapped: number
  offset: number
  gapNext: number
  mean: number
  rms: number
  compactest: number
  even: number
  line: number
  particleLevels: number
  naiveMean: number
  naiveEnergy: number
}

function readPair(
  D: number,
  convention: 'C' | 'Cprime',
  cost: number,
): Reading {
  const spec = pairSpec(D, convention, cost)
  const r = spectrumAt(spec, 0)
  const lp = lightestUnwrapped(r.bloch, r.all, 4 * D + 6)
  const m = stringMoments(r.bloch, lp.level.vector)
  const naive = nearestBandBottom(r.all)

  return {
    D,
    dim: r.dim,
    residual: r.residual,
    leak: r.leak,
    energy: lp.level.energy,
    unwrapped: lp.unwrapped,
    offset: Math.abs(lp.unwrapped - lp.reference),
    gapNext: lp.nextUnwrapped - lp.unwrapped,
    mean: m.mean,
    rms: m.rms,
    compactest: lp.compactestMean,
    even: lp.reading.even,
    line: lineShare(r.bloch, lp.level.vector),
    particleLevels: lp.particleLevels,
    naiveMean: stringMoments(r.bloch, naive.level.vector).mean,
    naiveEnergy: naive.level.energy,
  }
}

export default experiment({
  id: 'spin/string-cost-lightest',
  code: 'E-SPN-0076',
  title:
    "the string's cost is the light's own drift term read on the flux, zeta^(-c l) with c = N the classical light's split, and it never wraps inside the column (the longest string costs 2D pi / (2D + 1) < pi); a STAND-IN on locked tokens: the rule stays exact and reversible, and with the particle sector read in momentum space and each level unwrapped by its own content the lightest level is defined, unique, and the most compact, its size set by the cost and not the wall",
  category: 'spin',
  substrates: ['3434'],
  depth: 'L2',
  paper: false,
  run() {
    const started = Date.now()
    const log = (what: string): void =>
      console.error(
        `${what} ${Math.round((Date.now() - started) / 1000)}s`,
      )

    // ---- C1 ----
    const pairStart: LockedStart[] = [
      { x: [6, 6], j: [0, 1], amp: [1, 0] },
    ]
    const pairExact: FluxStoreSpec = {
      ring: 12,
      kinds: ['love', 'fear'],
      convention: 'C',
      unlike: 'knit',
      depth: 2,
      cost: 5,
      root: 50,
    }
    const threeExact: FluxStoreSpec = {
      ring: 7,
      kinds: ['love', 'love', 'love'],
      convention: 'C',
      unlike: 'knit',
      depth: 1,
      cost: 3,
      root: 18,
    }
    const variantExact: FluxStoreSpec = {
      ring: 12,
      kinds: ['love', 'fear'],
      convention: 'Cprime',
      unlike: 'dock',
      depth: 2,
      cost: 5,
      root: 50,
    }
    const e1 = exactCheck(pairExact, pairStart, 12)
    const e2 = exactCheck(
      threeExact,
      antisymmetrized({ x: [3, 3, 4], j: [0, 1, 0] }),
      6,
    )
    const e3 = exactCheck(variantExact, pairStart, 8)
    const exactOk = (e: typeof e1): boolean =>
      e.gap < 1e-12 &&
      e.norm &&
      e.reverses &&
      e.registersOk &&
      e.merged === 0
    const c1 = exactOk(e1) && exactOk(e2)

    log('c1')

    // ---- C2 ----
    let c2 = true

    for (let D = 1; D <= 64; D++) {
      const N = 2 * D + 1

      if (!(2 * N * (2 * D) < 2 * N * N)) {
        c2 = false
      }
    }

    // ---- C3 ----
    const primary = DEPTHS.map(D => readPair(D, 'C', 2 * D + 1))

    log('c3 primary')

    const variant = DEPTHS.map(D => readPair(D, 'Cprime', 2 * D + 1))

    log('c3 variant')

    const c3 = primary.every(
      r =>
        r.particleLevels > 0 &&
        r.offset < Math.PI / 2 &&
        r.gapNext >= 1e-3 &&
        r.mean <= r.compactest + 1e-9,
    )

    // ---- C4 ----
    const wallOnly = SIZE_DEPTHS.map(D => readPair(D, 'C', 0))
    const costSized = SIZE_DEPTHS.map(
      D => primary.find(r => r.D === D)!,
    )
    const c4 =
      costSized.every(r => r.mean <= r.D / 4) &&
      wallOnly.every(r => r.mean >= r.D / 3)
    const otherSplit = readPair(8, 'C', 2)

    log('c4')

    const ok = c1 && c2 && c3 && c4
    const row = (r: Reading): string =>
      `D ${r.D}: E ${r.unwrapped.toFixed(4)}, <l> ${r.mean.toFixed(3)}, next +${r.gapNext.toFixed(4)}`

    return verdict({
      status: ok ? 'pass' : 'fail',
      claim: `the drift's cost zeta_(2N)^(-l) keeps the rule exact over Z[zeta_K] (pair ${e1.gap.toExponential(1)} from the float runner, three loves ${e2.gap.toExponential(1)}, norm identity ${e1.norm && e2.norm}, exact reversal ${e1.reverses && e2.reverses}) and never wraps inside the column (2D pi / (2D + 1) < pi at every D); with the particle sector read in momentum space and each level unwrapped by its own kinetic, string and meeting content, the love-fear pair's lightest level under C is defined and the most compact particle level at every depth (${primary.map(row).join('; ')}), its size set by the cost: at D = 4, 8, 16 <l> = ${costSized.map(r => r.mean.toFixed(2)).join(', ')} with the cost against ${wallOnly.map(r => r.mean.toFixed(2)).join(', ')} with the wall alone; C' (reported): ${variant
        .filter(r => [2, 8, 16].includes(r.D))
        .map(row)
        .join(
          '; ',
        )}; the naive nearest-to-zero level holds <l> = ${primary.map(r => r.naiveMean.toFixed(1)).join(', ')}`,
      metrics: {
        gate_C1: c1 ? 1 : 0,
        gate_C2: c2 ? 1 : 0,
        gate_C3: c3 ? 1 : 0,
        gate_C4: c4 ? 1 : 0,
        exactPairGap: e1.gap,
        exactPairNorm: e1.norm ? 1 : 0,
        exactPairReverses: e1.reverses ? 1 : 0,
        exactPairRegisters: e1.registersOk ? 1 : 0,
        exactPairDenominatorBits: e1.bits,
        exactThreeGap: e2.gap,
        exactThreeNorm: e2.norm ? 1 : 0,
        exactThreeReverses: e2.reverses ? 1 : 0,
        exactThreeRegisters: e2.registersOk ? 1 : 0,
        ...Object.fromEntries(
          primary.flatMap(r => [
            [`pairC_D${r.D}_energy`, r.unwrapped],
            [`pairC_D${r.D}_meanString`, r.mean],
            [`pairC_D${r.D}_rmsString`, r.rms],
            [`pairC_D${r.D}_gapNext`, r.gapNext],
            [`pairC_D${r.D}_unwrapOffset`, r.offset],
            [`pairC_D${r.D}_evenShare`, r.even],
            [`pairC_D${r.D}_particleLevels`, r.particleLevels],
            [`pairC_D${r.D}_dim`, r.dim],
            [`pairC_D${r.D}_eigenResidual`, r.residual],
            [`pairC_D${r.D}_naiveMeanString`, r.naiveMean],
          ]),
        ),
        ...Object.fromEntries(
          wallOnly.flatMap(r => [
            [`wallOnly_D${r.D}_meanString`, r.mean],
            [`wallOnly_D${r.D}_energy`, r.unwrapped],
          ]),
        ),
        otherSplitD8_energy: otherSplit.unwrapped,
        otherSplitD8_meanString: otherSplit.mean,
        seconds: (Date.now() - started) / 1000,
      },
      control: {
        variantExactGap: e3.gap,
        variantExactNorm: e3.norm ? 1 : 0,
        variantExactReverses: e3.reverses ? 1 : 0,
        ...Object.fromEntries(
          variant.flatMap(r => [
            [`pairCprime_D${r.D}_energy`, r.unwrapped],
            [`pairCprime_D${r.D}_meanString`, r.mean],
            [`pairCprime_D${r.D}_evenShare`, r.even],
            [`pairCprime_D${r.D}_lineShare`, r.line],
            [`pairCprime_D${r.D}_gapNext`, r.gapNext],
            [
              `pairCprime_D${r.D}_mostCompact`,
              r.mean <= r.compactest + 1e-9 ? 1 : 0,
            ],
          ]),
        ),
      },
      notes: `L2, a STAND-IN. Gates C1 ${c1}, C2 ${c2}, C3 ${c3}, C4 ${c4}. C2 is an integer identity (2D < 2D + 1), gated so the claim cannot outrun it. Primary (C, c = N): ${primary.map(r => `D ${r.D} dim ${r.dim}: E ${r.unwrapped.toFixed(5)} (raw ${r.energy.toFixed(5)}, offset ${r.offset.toFixed(3)}), <l> ${r.mean.toFixed(3)} (compactest ${r.compactest.toFixed(3)}), even ${r.even.toFixed(3)}, ${r.particleLevels} particle levels, residual ${r.residual.toExponential(1)}`).join('; ')}. C' (reported; the user chose C): ${variant.map(r => `D ${r.D}: E ${r.unwrapped.toFixed(5)}, <l> ${r.mean.toFixed(3)}, even ${r.even.toFixed(3)}, line ${r.line.toFixed(3)}, most compact ${r.mean <= r.compactest + 1e-9}`).join('; ')}. Wall alone (c = 0): ${wallOnly.map(r => `D ${r.D}: E ${r.unwrapped.toFixed(5)}, <l> ${r.mean.toFixed(3)}`).join('; ')}. The other split (c = 2, D = 8): E ${otherSplit.unwrapped.toFixed(5)}, <l> ${otherSplit.mean.toFixed(3)}. The naive nearest-to-zero reading: ${primary.map(r => `D ${r.D} E ${r.naiveEnergy.toFixed(4)} <l> ${r.naiveMean.toFixed(2)}`).join('; ')}. DISCLOSED: the definition of lightest and P3 were written after probes (tmp/fsx-probe2 to 5) had printed these spectra; P1, P2 and the wall-only half of P4 were not probed. The spectrum has three families: a confining ladder (particle sector, energy rising with <l>), comoving string states with frozen separation and E = -2 pi / 3 + (pi / N) l (to the four decimals tmp/fsx-probe2 printed at D = 8, one token in each branch), and wrapped particle-antiparticle levels; only the first is the bound pair. MEANING: the store and the cost are one integer, the drift's exponent l, read as a count and as a phase, and the column is exactly what keeps the phase from wrapping (the longest string costs pi - pi / N). With both, the bound spectrum has a defined lightest level, the most compact particle state, and its size is set by the cost (about one link) and not by the depth's wall, which only caps it at 2D.`,
    })
  },
})
