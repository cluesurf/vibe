// Random access into the Kronecker stream of code/tool/weyl: the value makeWeyl({ start }) returns at draw
// 64 index + slot, without reading the draws before it.
//
// makeWeyl's draw k is frac(m r_j) with j = k mod 64, m = floor(k / 64) + 1 and r_j = frac(sqrt(q_j P)),
// q_j the j-th prime and P the prime the start owns, in exact 32-bit fixed point. So the 64 values of one
// index are one point of a 64-dimensional Kronecker sequence, and by Besicovitch and Kronecker the points
// over index = 0, 1, 2, ... are equidistributed in the 64-cube: up to 64 choices made per index (per slot
// of a dock, per draw of a product measure) are jointly equidistributed, which a single weylCell value per
// (key, beat, salt) is not (two beats of one key differ by a fixed shift, so a threshold on one decides the
// other).
//
// Deterministic and bit-identical on every machine: the same rounding as makeWeyl (checked, draw for draw,
// in test/code/tool/weyl-point).

import { WEYL_DIMENSION, weylStreamPrime } from '@/code/tool/weyl'

const TWO_32 = 4294967296

function firstPrimes(count: number): number[] {
  const primes: number[] = []

  for (let n = 2; primes.length < count; n++) {
    if (primes.every(p => n % p !== 0)) {
      primes.push(n)
    }
  }

  return primes
}

const SLOT_PRIMES = firstPrimes(WEYL_DIMENSION)
const RATES = new Map<number, Uint32Array>()

// the 64 slot rates of the stream at `start`, as odd 32-bit integers (makeWeyl's rounding)
export function weylRates(start: number): Uint32Array {
  const prime = weylStreamPrime(start)
  const known = RATES.get(prime)

  if (known) {
    return known
  }

  const rates = Uint32Array.from(SLOT_PRIMES, q => {
    const x = Math.sqrt(q * prime)

    return (Math.floor((x - Math.floor(x)) * TWO_32) | 1) >>> 0
  })

  RATES.set(prime, rates)

  return rates
}

// makeWeyl({ start }) at draw 64 index + slot, 0 <= slot < 64, index >= 0
export function weylPoint(input: { start: number; index: number; slot: number }): number {
  const rate = weylRates(input.start)[input.slot] ?? 0

  return (Math.imul((input.index + 1) | 0, rate) >>> 0) / TWO_32
}
