// P131: verify the Doi-Peliti transcription. (doi-peliti-transcription.md.)
//
// The derivation claims the conserved-exchange rule is a spin-1, S^z-conserving EXCHANGE model. We build
// the exact single-edge transition matrix from the rule (9 states, the tone pair) and check the three
// structural claims: (1) every move CONSERVES total S^z (the tone sum), the U(1) symmetry, (2) every move
// is a single +1/-1 UNIT EXCHANGE across the edge (creation, annihilation, hop are all the same operator,
// transferring one S^z quantum), and (3) the matrix satisfies DETAILED BALANCE (reversible), which is what
// makes the Doi-Peliti Hamiltonian Hermitian / genuinely quantum. Run: npx tsx code/experiment/p131-doi-peliti-check.ts

import { experiment } from '@/test/scaffold/suite'
import { verdict } from '@/test/scaffold/verdict'

// tone t in {-1,0,1} -> index t+1 in {0,1,2}; state = 3*ai + bi (the ordered pair)
const toneOf = (i: number): number => i - 1
const sz = (state: number): number =>
  toneOf(Math.floor(state / 3)) + toneOf(state % 3)

// the rule's single-edge transition matrix (isolated edge, one update)
function buildT(c: number, s: number, h: number): number[][] {
  const T: number[][] = Array.from({ length: 9 }, () =>
    new Array<number>(9).fill(0),
  )

  for (let st = 0; st < 9; st++) {
    const a = toneOf(Math.floor(st / 3))
    const b = toneOf(st % 3)

    const set = (na: number, nb: number, p: number): void => {
      const ns = 3 * (na + 1) + (nb + 1)

      T[st]![ns]! += p
    }

    if ((a === 1 && b === -1) || (a === -1 && b === 1)) {
      set(0, 0, s) // annihilate
      set(a, b, 1 - s)
    } else if ((a === 0) !== (b === 0)) {
      // charge + empty -> hop (swap) with prob h
      set(b, a, h)
      set(a, b, 1 - h)
    } else if (a === 0 && b === 0) {
      set(1, -1, c / 2) // create +-
      set(-1, 1, c / 2) // create -+
      set(0, 0, 1 - c)
    } else {
      set(a, b, 1)
    } // (+,+) or (-,-): inert
  }

  return T
}

// stationary distribution by power iteration (pi T = pi)
function stationary(T: number[][]): number[] {
  let pi = new Array<number>(9).fill(1 / 9)

  for (let it = 0; it < 5000; it++) {
    const next = new Array<number>(9).fill(0)

    for (let a = 0; a < 9; a++) {
      for (let b = 0; b < 9; b++) {
        next[b]! += pi[a]! * T[a]![b]!
      }
    }

    let sum = 0

    for (const v of next) {
      sum += v
    }

    for (let i = 0; i < 9; i++) {
      next[i]! /= sum
    }

    pi = next
  }

  return pi
}

export function doiPelitiCheck(): {
  conservesSz: boolean
  unitExchange: boolean
  detailedBalanceViolation: number
  detailedBalance: boolean
  solved: boolean
} {
  const c = 0.2
  const s = 1
  const h = 0.5
  const T = buildT(c, s, h)

  // (1) S^z conservation: off-diagonal transitions connect only equal-S^z states
  let conservesSz = true

  for (let a = 0; a < 9; a++) {
    for (let b = 0; b < 9; b++) {
      if (a !== b && T[a]![b]! > 0) {
        if (sz(a) !== sz(b)) {
          conservesSz = false
        }
      }
    }
  }

  // (2) unit exchange: every move changes (n_i, n_j) by (+1,-1) or (-1,+1)
  let unitExchange = true

  for (let a = 0; a < 9; a++) {
    for (let b = 0; b < 9; b++) {
      if (a !== b && T[a]![b]! > 0) {
        const dai =
          toneOf(Math.floor(b / 3)) - toneOf(Math.floor(a / 3))

        const dbi = toneOf(b % 3) - toneOf(a % 3)

        if (!((dai === 1 && dbi === -1) || (dai === -1 && dbi === 1))) {
          unitExchange = false
        }
      }
    }
  }

  // (3) detailed balance: pi_a T_ab = pi_b T_ba for all a,b
  const pi = stationary(T)

  let dbv = 0
  let scale = 0

  for (let a = 0; a < 9; a++) {
    for (let b = a + 1; b < 9; b++) {
      const fwd = pi[a]! * T[a]![b]!
      const rev = pi[b]! * T[b]![a]!

      dbv += Math.abs(fwd - rev)
      scale += fwd + rev
    }
  }

  const detailedBalanceViolation = scale > 0 ? dbv / scale : 0
  const detailedBalance = detailedBalanceViolation < 1e-6

  const solved = conservesSz && unitExchange && detailedBalance

  return {
    conservesSz,
    unitExchange,
    detailedBalanceViolation,
    detailedBalance,
    solved,
  }
}

export default experiment({
  id: 'foundations/doi-peliti-check',
  code: 'E-FND-0014',
  title:
    'the rule is a spin-1 charge-conserving reversible exchange model',
  category: 'foundations',
  substrates: 'any',
  depth: 'L1',
  paper: false,
  run() {
    const r = doiPelitiCheck()
    const ok =
      r.solved && r.conservesSz && r.unitExchange && r.detailedBalance

    return verdict({
      status: ok ? 'pass' : 'fail',
      claim:
        'the single-edge operator conserves S^z, exchanges a single unit across the edge, and satisfies detailed balance, making its Doi-Peliti Hamiltonian Hermitian',
      metrics: { detailedBalanceViolation: r.detailedBalanceViolation },
    })
  },
})
