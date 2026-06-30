// CHSH: the Bell hinge (P7). Runs a deterministic local hidden-variable Bell
// experiment on the substrate. The settingCorrelation knob interpolates from
// statistical independence (settings free of the hidden state) to full
// superdeterminism (settings determined by the hidden state). With
// settingCorrelation = 0 and any local model, |S| <= 2 (the classical bound).

import { makeRng, Rng } from '@/code/tool/rng'

// A hidden ontological value carried by the substrate.
export type Lambda = number

// The shared-past fraction at which the measurement-dependence bound reaches the
// Tsirelson value 2 root 2. A superdeterministic model whose settings share less
// than this fraction of the system's causal past cannot reach the quantum
// correlation, at or above it can.
export const TSIRELSON_SHARED_PAST = Math.SQRT2 - 1

// The CHSH value reachable from a measurement-setting correlation of strength eta,
// the linear measurement-dependence bound. With a fraction eta of runs where the
// setting is fixed by the shared hidden state (so the wings can be perfectly
// anti-aligned, the algebraic value 4) and the rest genuinely free (the local
// bound 2), the reachable value is S = 2 + 2 eta, capped at the algebraic maximum
// 4. Quantum mechanics sits at eta = root 2 minus 1, where S = 2 root 2, the
// Tsirelson value. This is exact and deterministic, no sampling, so a MEASURED
// shared-past fraction maps straight to a CHSH bound with no random draw. It is
// the eta-to-S map that replaces the Monte Carlo chshShared. The bound itself is
// standard (the measurement-dependence relation), cited not derived.
export function chshFromSharedPast(eta: number): number {
  const clamped = eta < 0 ? 0 : eta > 1 ? 1 : eta

  return Math.min(4, 2 + 2 * clamped)
}

// Default outcome functions: Malus-law-style deterministic responses around a
// hidden polarization angle lambda (interpreted as radians). The caller can
// override these to model a different ontology. These defaults already respect
// the classical bound under independent settings.
function defaultOutcome(input: {
  angle: number
  lambda: Lambda
}): -1 | 1 {
  return Math.cos(2 * (input.angle - input.lambda)) >= 0 ? 1 : -1
}

// Choose the two measurement angles for a trial. With probability
// settingCorrelation the choice is biased by lambda (a superdeterministic
// correlation between hidden state and settings); otherwise the two pairs are
// picked independently and uniformly. We return one side-A angle and one side-B
// angle drawn from the two-element option sets.
function chooseSetting(input: {
  options: [number, number]
  lambda: Lambda
  settingCorrelation: number
  side: 'a' | 'b'
  rng: Rng
}): number {
  const [first, second] = input.options

  if (input.rng.next() < input.settingCorrelation) {
    // Bias the setting using lambda. The two wings key on DIFFERENT functions of
    // lambda (sin for A, cos for B), so all four setting pairs remain reachable.
    // This injects a correlation between the hidden state and the chosen angle.
    const bit =
      input.side === 'a'
        ? Math.sin(2 * input.lambda) >= 0
        : Math.cos(2 * input.lambda) >= 0

    return bit ? first : second
  }

  return input.rng.next() < 0.5 ? first : second
}

// Run the CHSH protocol. For each trial draw lambda, choose an (a-side, b-side)
// setting pair (possibly biased by lambda), record A*B, and accumulate the four
// correlators E(a,b), E(a,b'), E(a',b), E(a',b'). S = E(a,b) - E(a,b') +
// E(a',b) + E(a',b').
export function chsh(input: {
  drawHidden: (input: { rng: Rng }) => Lambda
  settingCorrelation: number
  outcomeA?: (input: { angle: number; lambda: Lambda }) => -1 | 1
  outcomeB?: (input: { angle: number; lambda: Lambda }) => -1 | 1
  angles: { a: number; aPrime: number; b: number; bPrime: number }
  trials: number
  rng: Rng
}): {
  s: number
  correlators: {
    ab: number
    abPrime: number
    aPrimeB: number
    aPrimeBPrime: number
  }
} {
  const outcomeA = input.outcomeA ?? defaultOutcome
  const outcomeB = input.outcomeB ?? defaultOutcome
  const aOptions: [number, number] = [
    input.angles.a,
    input.angles.aPrime,
  ]

  const bOptions: [number, number] = [
    input.angles.b,
    input.angles.bPrime,
  ]

  // Per-pair running sums and counts, keyed by which setting pair was chosen.
  const sum = { ab: 0, abPrime: 0, aPrimeB: 0, aPrimeBPrime: 0 }
  const count = { ab: 0, abPrime: 0, aPrimeB: 0, aPrimeBPrime: 0 }

  for (let trial = 0; trial < input.trials; trial++) {
    const lambda = input.drawHidden({ rng: input.rng })
    const angleA = chooseSetting({
      options: aOptions,
      lambda,
      settingCorrelation: input.settingCorrelation,
      side: 'a',
      rng: input.rng,
    })

    const angleB = chooseSetting({
      options: bOptions,
      lambda,
      settingCorrelation: input.settingCorrelation,
      side: 'b',
      rng: input.rng,
    })

    const product =
      outcomeA({ angle: angleA, lambda }) *
      outcomeB({ angle: angleB, lambda })

    const isA = angleA === input.angles.a
    const isB = angleB === input.angles.b

    if (isA && isB) {
      sum.ab += product
      count.ab++
    } else if (isA && !isB) {
      sum.abPrime += product
      count.abPrime++
    } else if (!isA && isB) {
      sum.aPrimeB += product
      count.aPrimeB++
    } else {
      sum.aPrimeBPrime += product
      count.aPrimeBPrime++
    }
  }

  const average = (s: number, c: number): number =>
    c === 0 ? 0 : s / c

  const ab = average(sum.ab, count.ab)
  const abPrime = average(sum.abPrime, count.abPrime)
  const aPrimeB = average(sum.aPrimeB, count.aPrimeB)
  const aPrimeBPrime = average(sum.aPrimeBPrime, count.aPrimeBPrime)

  const s = ab - abPrime + aPrimeB + aPrimeBPrime

  return {
    s,
    correlators: { ab, abPrime, aPrimeB, aPrimeBPrime },
  }
}

// A high-frequency bit of lambda, decorrelated from the outcome's region
// structure: a generic shared-past dependence that is not aligned with physics.
function randomBit(lambda: number, salt: number): number {
  return Math.sin(lambda * 137.0 + salt) >= 0 ? 0 : 1
}

// The shared-past CHSH (P7 naturalness). With probability eta the measurement setting is determined
// by the common cause (the hidden state lambda), else by independent local randomness. In ALIGNED
// mode the setting tracks the same feature of lambda the outcomes use, in RANDOM mode an unrelated
// one. Returns S = E(0,0) - E(0,1) + E(1,0) + E(1,1).
export function chshShared(input: {
  eta: number
  mode: 'aligned' | 'random'
  trials: number
  seed: number
}): number {
  const rng = makeRng({ seed: input.seed })
  const sum = [0, 0, 0, 0] // cells (ai*2+bi)
  const count = [0, 0, 0, 0]

  for (let t = 0; t < input.trials; t++) {
    const lambda = rng.next() * Math.PI
    // The setting bit determined by the common cause (the hidden state).
    const sharedA =
      input.mode === 'aligned'
        ? Math.sin(2 * lambda) >= 0
          ? 0
          : 1
        : randomBit(lambda, 1)

    const sharedB =
      input.mode === 'aligned'
        ? Math.cos(2 * lambda) >= 0
          ? 0
          : 1
        : randomBit(lambda, 2)

    // With probability eta the setting comes from the shared past, else local.
    const ai =
      rng.next() < input.eta ? sharedA : rng.next() < 0.5 ? 0 : 1

    const bi =
      rng.next() < input.eta ? sharedB : rng.next() < 0.5 ? 0 : 1

    // The superdeterministic outcomes: A always +1, B set by the lambda region.
    const a = 1
    const b = lambda >= Math.PI / 4 && lambda < Math.PI / 2 ? -1 : 1
    const cell = ai * 2 + bi
    sum[cell] = (sum[cell] ?? 0) + a * b
    count[cell] = (count[cell] ?? 0) + 1
  }

  const e = (i: number): number =>
    (count[i] ?? 0) === 0 ? 0 : (sum[i] ?? 0) / (count[i] ?? 1)

  // S = E(0,0) - E(0,1) + E(1,0) + E(1,1)
  return e(0) - e(1) + e(2) + e(3)
}
