// What it costs to carry quantum steps with whole loves and fears. E-FRC-0121 found the swap phase at
// the cube-root angle moves grid weights by a kernel in quarters, so whole loves and fears carry it
// exactly. Each such step makes the weights finer. The question is where the cost goes: into the
// number of units (the grain) or into the share of fear.
//
// Two roles, 81 grid points, from the classical state |00>. Each round: the swap phase at 2 pi / 3,
// then a classical entangling move (SUM, |a, b> -> |a, a + b>) and a color move (the Fourier matrix)
// on the first role only. A first version put the color move on both roles, which keeps every state
// symmetric in the two roles, where the swap phase acts as the identity: every round stayed classical
// (negativity exactly 1, no fear) and the run measured nothing. The move on one role breaks the
// symmetry. After each of 8 rounds: N, the fewest units that write the state exactly in whole
// loves and fears, the negativity sum |W| (at most 3 for any pure state of two roles, by
// Cauchy-Schwarz, since sum W^2 = 1/9 on 81 points), and the share of fear among the vibes.
//
// Predicted before the run: the grain grows by a whole factor each round and the negativity stays
// under its bound, so a finite number of vibes carries quantum steps at a finite resolution.
// Gates: every state's weights sum to 1, every state is written exactly by whole loves and fears
// (N found), the negativity never exceeds 3, and the grain after 8 rounds is finer than after 1.
// Reported: N, negativity and the fear share round by round.
//
// Depth L1: exact phase-space arithmetic.

import { experiment } from '@/test/scaffold/suite'
import { verdict } from '@/test/scaffold/verdict'
import {
  applyOperator,
  gridWeights,
  multiplyOperators,
  operator,
  phasePointOperators,
  tensorOperators,
  wholeUnits,
  type Operator,
} from '@/code/measure/grid-weights'

function swapPhase(phi: number): Operator {
  const u = operator(9)
  const c = Math.cos(phi)
  const s = Math.sin(phi)

  for (let i = 0; i < 3; i++) {
    for (let j = 0; j < 3; j++) {
      const row = 3 * i + j
      const swapped = 3 * j + i

      u.re[row * 9 + row] = (u.re[row * 9 + row] ?? 0) + (1 + c) / 2
      u.im[row * 9 + row] = (u.im[row * 9 + row] ?? 0) + s / 2
      u.re[row * 9 + swapped] =
        (u.re[row * 9 + swapped] ?? 0) + (1 - c) / 2
      u.im[row * 9 + swapped] = (u.im[row * 9 + swapped] ?? 0) - s / 2
    }
  }

  return u
}

function sum(): Operator {
  const u = operator(9)

  for (let a = 0; a < 3; a++) {
    for (let b = 0; b < 3; b++) {
      u.re[(3 * a + ((a + b) % 3)) * 9 + (3 * a + b)] = 1
    }
  }

  return u
}

function fourier(): Operator {
  const u = operator(3)

  for (let j = 0; j < 3; j++) {
    for (let k = 0; k < 3; k++) {
      const angle = (2 * Math.PI * j * k) / 3

      u.re[j * 3 + k] = Math.cos(angle) / Math.sqrt(3)
      u.im[j * 3 + k] = Math.sin(angle) / Math.sqrt(3)
    }
  }

  return u
}

export default experiment({
  id: 'gauge/fear-resolution',
  code: 'E-FRC-0122',
  title:
    'carrying quantum steps with whole loves and fears costs grain, not fear: over rounds of the cube-root swap phase and classical moves every state is written exactly by whole loves and fears, the units grow each round while the negativity stays under its bound, so a finite number of vibes gives quantum steps at a finite resolution',
  category: 'gauge',
  substrates: 'any',
  depth: 'L1',
  paper: false,
  run() {
    const points = phasePointOperators(2)
    const f = fourier()
    const identity = operator(3)

    for (let i = 0; i < 3; i++) {
      identity.re[i * 3 + i] = 1
    }

    const classical = multiplyOperators(
      tensorOperators(f, identity),
      sum(),
    )
    const round = multiplyOperators(
      classical,
      swapPhase((2 * Math.PI) / 3),
    )

    let re: number[] = Array.from({ length: 9 }, (_, i) =>
      i === 0 ? 1 : 0,
    )
    let im: number[] = Array.from({ length: 9 }, () => 0)

    const rounds: {
      units: number
      negativity: number
      fearShare: number
      total: number
    }[] = []

    for (let r = 1; r <= 8; r++) {
      const next = applyOperator(round, re, im)

      re = next.re
      im = next.im

      const weights = gridWeights({ re, im, points })
      const total = weights.reduce((a, b) => a + b, 0)
      const negativity = weights.reduce((a, b) => a + Math.abs(b), 0)
      const whole = wholeUnits({ weights, limit: 200000 })

      rounds.push({
        units: whole.n,
        negativity,
        fearShare:
          whole.n > 0
            ? whole.fears / (whole.loves + whole.fears)
            : Number.NaN,
        total,
      })
    }

    const ok =
      rounds.every(r => Math.abs(r.total - 1) < 1e-9) &&
      rounds.every(r => r.units > 0) &&
      rounds.every(r => r.negativity <= 3 + 1e-9) &&
      (rounds[7]?.units ?? 0) > (rounds[0]?.units ?? 0)

    return verdict({
      status: ok ? 'pass' : 'fail',
      claim:
        'after every round every state has weights summing to 1 and is written exactly by whole loves and fears, the negativity stays at or under 3, and the units after 8 rounds are finer than after 1',
      metrics: {
        ...Object.fromEntries(
          rounds.flatMap((r, k) => [
            [`units${k + 1}`, r.units],
            [`negativity${k + 1}`, r.negativity],
            [`fearShare${k + 1}`, r.fearShare],
          ]),
        ),
      },
      control: {
        points: points.length,
        negativityBound: 3,
      },
      notes:
        'L1, exact up to the unit search, which stops at 200,000. Units: the fewest N making N W whole on every point, loves minus fears = N. Negativity: sum |W|, 1 for a classical state. Fear share: fears over all vibes.',
    })
  },
})
