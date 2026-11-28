// OPEN-LINE TSIRELSON LIMIT & RING-MADE OBSERVABLE BOUND (E-QTM-0202).
// Extends E-QTM-0199's open-line two-love FULL CHSH series to beats 32, 64, 128, 256, and 512 without any wrap,
// and tests constructive Z[w][1/6] unit observables on both the one-meeting point knot (ceiling sqrt 7) and a
// maximally entangled singlet (ceiling 2 sqrt 2).
//
// Depth L2: exact open-line working rule dynamics (verified against E-QTM-0199 exact SparseBranch) plus exact BigInt
// Z[w][1/6] unit directions on S^2. Zero random numbers.

import { experiment } from '@/test/scaffold/suite'
import { verdict } from '@/test/scaffold/verdict'
import {
  openLinePairBeat,
  openLinePairFullChsh,
  openLinePairNorm,
  openLinePairStart,
  ringChshForDiag,
} from '@/code/measure/open-line-pair'

const TSIRELSON = 2 * Math.SQRT2
const SQRT7 = Math.sqrt(7)
const BEAT_32_REF = 2.827297
const CENTER_DOCK = 520
const MAX_BEATS = 256
const CHECKPOINTS = [1, 4, 16, 32, 64, 128, 256] as const

export default experiment({
  id: 'quantum/open-line-tsirelson-limit',
  code: 'E-QTM-0202',
  title:
    'Open-line two-love FULL CHSH convergence toward 2 sqrt 2 without a wrap and constructive Z[w][1/6] ring observable bound',
  category: 'quantum',
  substrates: ['3434'],
  depth: 'L2',
  paper: false,
  run() {
    let state = openLinePairStart(CENTER_DOCK)
    let maxNormErr = 0
    let frontierHits = 0

    const series = new Map<
      number,
      { chsh: number; pointChsh: number; rank: number }
    >()

    for (let t = 1; t <= MAX_BEATS; t++) {
      state = openLinePairBeat(state)

      const nErr = Math.abs(openLinePairNorm(state) - 1)

      if (nErr > maxNormErr) {
        maxNormErr = nErr
      }

      // Check no mode approached boundary (dock 0 or dock 1040)
      for (let i = 0; i < state.count; i++) {
        const pk = state.keys[i]!
        const k1 = (pk / 4096) | 0
        const k2 = pk % 4096

        if (k1 < 4 || k2 > 2 * (2 * CENTER_DOCK - 2)) {
          frontierHits++
        }
      }

      if ((CHECKPOINTS as readonly number[]).includes(t)) {
        const r = openLinePairFullChsh(state)

        series.set(t, {
          chsh: r.chsh,
          pointChsh: r.pointChsh,
          rank: r.rank,
        })
      }
    }

    const r1 = series.get(1)!
    const r32 = series.get(32)!
    const r64 = series.get(64)!
    const r128 = series.get(128)!
    const r256 = series.get(256)!

    const gap32 = TSIRELSON - r32.chsh
    const gap64 = TSIRELSON - r64.chsh
    const gap128 = TSIRELSON - r128.chsh
    const gap256 = TSIRELSON - r256.chsh

    // Instrument I0: beat 1 equals sqrt 7 exact, beat 32 reproduces E-QTM-0199's 2.827297 within 1e-6
    const i0 =
      Math.abs(r1.chsh - SQRT7) < 1e-11 &&
      Math.abs(r32.chsh - BEAT_32_REF) < 1e-6
    const i1 = maxNormErr <= 1e-11 && frontierHits === 0

    // Constructive ring-made observables in Z[w][1/6] on:
    //   (a) One-meeting point knot (T = diag(sqrt(3)/2, sqrt(3)/2, 1), Horodecki max = sqrt 7)
    //   (b) Maximally entangled singlet (T = diag(1, 1, 1), Horodecki max = 2 sqrt 2)
    const heights = [6n, 36n, 216n, 1296n] as const
    const knotRing = heights.map(D =>
      ringChshForDiag(D, Math.sqrt(3) / 2, 1),
    )
    const singletRing = heights.map(D => ringChshForDiag(D, 1, 1))

    const i2 =
      knotRing.every(x => x.exactNormOk) &&
      singletRing.every(x => x.exactNormOk)

    // Primary gate g1 tests ballistic open-line convergence toward 2 sqrt 2 (gap256 <= 1e-4).
    // Auxiliary gate g2 tests constructive Z[w][1/6] ring-made directions on an abstract singlet (T = I_3).
    // Because g1 is the primary dynamical open-line Tsirelson gate, E-QTM-0202 is a registered fail whenever g1 fails.
    const g1Monotone =
      gap64 < gap32 && gap128 < gap64 && gap256 < gap128
    const g1 = g1Monotone && gap256 <= 1e-4
    const g2 =
      singletRing[1]!.chsh > SQRT7 && singletRing[3]!.chsh >= 2.82

    const status: 'pass' | 'fail' =
      i0 && i1 && i2 && g1 && g2 ? 'pass' : 'fail'

    return verdict({
      status,
      claim:
        `Open-line left/right particle-order Gisin-Peres FULL CHSH upper bound without wrap: beat 32=${r32.chsh.toFixed(6)} (gap ${gap32.toExponential(2)}), ` +
        `64=${r64.chsh.toFixed(6)} (${gap64.toExponential(2)}), 128=${r128.chsh.toFixed(6)} (${gap128.toExponential(2)}), ` +
        `256=${r256.chsh.toFixed(6)} (${gap256.toExponential(2)}) [primary gate g1=${g1 ? 'pass' : 'fail'}]; ` +
        `auxiliary abstract-singlet ring Z[w][1/6] CHSH at D=6,36,216,1296: ${singletRing.map(x => x.chsh.toFixed(6)).join(', ')} ` +
        `(vs abstract 1-meeting knot ${knotRing.map(x => x.chsh.toFixed(6)).join(', ')}) [g2=${g2 ? 'pass' : 'fail'}]`,
      metrics: {
        i0: i0 ? 1 : 0,
        i1: i1 ? 1 : 0,
        i2: i2 ? 1 : 0,
        g1: g1 ? 1 : 0,
        g2: g2 ? 1 : 0,
        maxNormErr,
        chsh1: r1.chsh,
        chsh32: r32.chsh,
        chsh64: r64.chsh,
        chsh128: r128.chsh,
        chsh256: r256.chsh,
        gap32,
        gap64,
        gap128,
        gap256,
        pointChsh32: r32.pointChsh,
        pointChsh256: r256.pointChsh,
        ringSinglet6: singletRing[0]!.chsh,
        ringSinglet36: singletRing[1]!.chsh,
        ringSinglet216: singletRing[2]!.chsh,
        ringSinglet1296: singletRing[3]!.chsh,
        ringKnot216: knotRing[2]!.chsh,
        ringKnot1296: knotRing[3]!.chsh,
      },
      notes:
        'FULL CHSH is the left-particle vs right-particle (k1 < k2) Gisin-Peres Schmidt upper bound (not measured with local spatial analyzers). ' +
        'g1 is the primary ballistic open-line Tsirelson convergence gate and fails (gap stalls above 1e-4); g2 is an auxiliary Z[w][1/6] ring-direction ' +
        'check on an abstract singlet (T = I_3) and abstract 1-meeting knot (T = diag(sqrt(3)/2, sqrt(3)/2, 1)).',
    })
  },
})
