// Where the amplitude is NOT: the Koopman operator of the charge rule, compressed to the two-point
// sector, measured exactly. The permutation theorem closed the configuration sector (the lift of a
// bijection is a permutation matrix, nothing interferes there). The natural next place to look for a
// linear structure with phases is the space of few-point observables, the constants, the tones s_a, and
// the products s_a s_b. On a ring of four cells (3^8 = 6561 states, the exact rule, no sampling) the
// compression of the Koopman operator onto that 45-dimensional sector gives, under the uniform measure:
//
//   - the pure STREAM closes the sector exactly (zero worst closure residual) and conserves 13
//     independent quadratic observables, the method finds closure when it exists,
//   - the charge rule does NOT close the sector: the worst basis function loses 48 percent of its norm
//     to higher-order observables in one beat, and only 7 conserved modes remain,
//   - the vacuum clock does NOT appear: the number of period-three eigenmodes (the dimension fixed by
//     K cubed but not by K) is ZERO for every rule tried, so the Z_3 clock phase lives in trajectories
//     (the flash) and coarse sums, not in any two-point spectral mode,
//   - the irreversible sorting collision keeps 5 conserved modes, so the counts discriminate rules.
//
// The exact negative for the linear route of the amplitude search (roadmap base-model 0006): no basis
// of pair observables carries the clock as an eigenvalue, and the sector's leakage is the measured
// obstruction to a unitary induced dynamics at this order. Depth L1, finite exact linear algebra.

import { experiment } from '@/test/scaffold/suite'
import { verdict } from '@/test/scaffold/verdict'
import { PAIR_FORWARD } from '@/code/rule/collision'
import {
  matrixProduct,
  realMatrixRank,
} from '@/code/algebra/linear/dense'

const CELLS = 4
const SLOTS = 2 * CELLS
const STATES = 3 ** SLOTS
const DIM = 1 + SLOTS + (SLOTS * (SLOTS - 1)) / 2 + SLOTS
const TOLERANCE = 1e-7

type Rule = 'stream' | 'charge' | 'sort'

function toneAt(state: number, slot: number): number {
  return (Math.floor(state / 3 ** slot) % 3) - 1
}

// one beat on the ring: collide the per-cell head-on pair, then stream right-movers right and
// left-movers left. The charge rule uses the committed 9-state table.
function step(state: number, rule: Rule): number {
  const tones: number[] = []

  for (let slot = 0; slot < SLOTS; slot++) {
    tones.push(toneAt(state, slot))
  }

  if (rule !== 'stream') {
    for (let cell = 0; cell < CELLS; cell++) {
      const a = tones[cell * 2]!
      const b = tones[cell * 2 + 1]!

      if (rule === 'charge') {
        const out = PAIR_FORWARD[(a + 1) * 3 + (b + 1)]!

        tones[cell * 2] = out[0]
        tones[cell * 2 + 1] = out[1]
      } else {
        tones[cell * 2] = Math.max(a, b)
        tones[cell * 2 + 1] = Math.min(a, b)
      }
    }
  }

  const out = new Array<number>(SLOTS)

  for (let cell = 0; cell < CELLS; cell++) {
    out[((cell + 1) % CELLS) * 2] = tones[cell * 2]!
    out[((cell - 1 + CELLS) % CELLS) * 2 + 1] = tones[cell * 2 + 1]!
  }

  let code = 0

  for (let slot = 0; slot < SLOTS; slot++) {
    code += (out[slot]! + 1) * 3 ** slot
  }

  return code
}

// the sector basis at a state: 1, every tone, every product of two distinct tones, every square
function basisValues(state: number): number[] {
  const tones: number[] = []

  for (let slot = 0; slot < SLOTS; slot++) {
    tones.push(toneAt(state, slot))
  }

  const values: number[] = [1, ...tones]

  for (let i = 0; i < SLOTS; i++) {
    for (let j = i + 1; j < SLOTS; j++) {
      values.push(tones[i]! * tones[j]!)
    }
  }

  for (let i = 0; i < SLOTS; i++) {
    values.push(tones[i]! * tones[i]!)
  }

  return values
}

// solve G K = C for K by Gaussian elimination with all right-hand columns at once
function solveAll(G: number[][], C: number[][]): number[][] {
  const n = G.length
  const M = G.map((row, j) => [...row, ...C[j]!])

  for (let col = 0, row = 0; col < n && row < n; col++, row++) {
    let pivot = row

    for (let r = row + 1; r < n; r++) {
      if (Math.abs(M[r]![col]!) > Math.abs(M[pivot]![col]!)) {
        pivot = r
      }
    }

    const swap = M[pivot]!

    M[pivot] = M[row]!
    M[row] = swap

    const value = M[row]![col]!

    for (let c = col; c < 2 * n; c++) {
      M[row]![c]! /= value
    }

    for (let r = 0; r < n; r++) {
      if (r !== row) {
        const factor = M[r]![col]!

        for (let c = col; c < 2 * n; c++) {
          M[r]![c]! -= factor * M[row]![c]!
        }
      }
    }
  }

  return Array.from({ length: n }, (_, a) =>
    Array.from({ length: n }, (_, i) => M[a]![n + i]!),
  )
}

function analyze(rule: Rule): {
  conserved: number
  clockModes: number
  worstResidual: number
} {
  const G = Array.from({ length: DIM }, () =>
    new Array<number>(DIM).fill(0),
  )
  const C = Array.from({ length: DIM }, () =>
    new Array<number>(DIM).fill(0),
  )
  const uNorm = new Array<number>(DIM).fill(0)

  for (let state = 0; state < STATES; state++) {
    const f = basisValues(state)
    const uf = basisValues(step(state, rule))

    for (let j = 0; j < DIM; j++) {
      uNorm[j]! += uf[j]! * uf[j]!

      for (let i = 0; i < DIM; i++) {
        G[j]![i]! += f[j]! * f[i]!
        C[j]![i]! += f[j]! * uf[i]!
      }
    }
  }

  const K = solveAll(G, C)

  // the closure residual of basis function i: ||U f_i||^2 minus the norm of its projection
  let worstResidual = 0

  for (let i = 0; i < DIM; i++) {
    let projected = 0

    for (let a = 0; a < DIM; a++) {
      for (let b = 0; b < DIM; b++) {
        projected += K[a]![i]! * G[a]![b]! * K[b]![i]!
      }
    }

    worstResidual = Math.max(
      worstResidual,
      (uNorm[i]! - projected) / uNorm[i]!,
    )
  }

  const identity = (m: number[][]): number[][] =>
    m.map((row, a) => row.map((x, b) => x - (a === b ? 1 : 0)))

  const cubed = matrixProduct(matrixProduct(K, K), K)
  const conserved = DIM - realMatrixRank(identity(K), TOLERANCE)
  const fixedByCube = DIM - realMatrixRank(identity(cubed), TOLERANCE)

  return { conserved, clockModes: fixedByCube - conserved, worstResidual }
}

export default experiment({
  id: 'foundations/two-point-koopman-closure',
  code: 'E-FND-0089',
  title:
    'the amplitude is not in the two-point sector: on the exact 6561-state ring the Koopman compression of the charge rule onto constants, tones and pair products leaks 48 percent of the worst basis norm per beat, keeps 7 conserved quadratic observables against the closed stream sector with 13, and carries ZERO period-three eigenmodes for every rule tried, so the vacuum clock lives in trajectories and coarse sums, never as a two-point spectral phase',
  category: 'foundations',
  substrates: ['3434'],
  depth: 'L1',
  paper: true,
  run() {
    const stream = analyze('stream')
    const charge = analyze('charge')
    const sort = analyze('sort')

    const streamCloses = stream.worstResidual < 1e-9
    const chargeLeaks =
      charge.worstResidual > 0.4 && charge.worstResidual < 0.6
    const noClockModes =
      stream.clockModes === 0 &&
      charge.clockModes === 0 &&
      sort.clockModes === 0
    const countsDiscriminate =
      stream.conserved > charge.conserved &&
      charge.conserved > sort.conserved

    const ok =
      streamCloses && chargeLeaks && noClockModes && countsDiscriminate

    return verdict({
      status: ok ? 'pass' : 'fail',
      claim:
        'the pure stream closes the 45-dimensional two-point sector exactly with 13 conserved quadratic observables, the charge rule leaks 48 percent of the worst basis norm to higher order in one beat and keeps 7, the irreversible sort keeps 5, and no rule has any period-three eigenmode in the sector, so the linear route to the amplitude is closed at this order: the clock phase of the coarse Z_3 sum is a property of trajectories, not of any pair-observable spectrum',
      metrics: {
        sectorDimension: DIM,
        states: STATES,
        streamConserved: stream.conserved,
        chargeConserved: charge.conserved,
        sortConserved: sort.conserved,
        chargeWorstResidual: Number(charge.worstResidual.toFixed(4)),
        sortWorstResidual: Number(sort.worstResidual.toFixed(4)),
        chargeClockModes: charge.clockModes,
      },
      // CONTROL: the stream shows the method reports exact closure when closure exists
      control: {
        streamWorstResidual: Number(
          stream.worstResidual.toExponential(2),
        ),
        streamClockModes: stream.clockModes,
      },
      notes:
        'Prior art: Koopman 1931 for the lift, t Hooft 2016 for permutation dynamics in Hilbert space. The compression is over the uniform measure on the full state space, exact (every state enumerated). What survives at this order is conservation counting, not phases. Together with permutation-rule-cannot-interfere (configurations) and pair-coarse-map-is-permutation (pair states at one cell, on its own branch) this closes the first three rungs of the linear-search ladder, and the surviving amplitude constructions are the trajectory-level ones, the Z_3 clock sums (E-FND-0084 to 0088) and the signed density wave (E-FLD-0014).',
    })
  },
})
