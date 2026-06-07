// CHSH: the Bell hinge (P7). Runs a deterministic local hidden-variable Bell
// experiment on the substrate. The settingCorrelation knob interpolates from
// statistical independence (settings free of the hidden state) to full
// superdeterminism (settings determined by the hidden state). With
// settingCorrelation = 0 and any local model, |S| <= 2 (the classical bound).

import { Rng } from '~/tool/rng'

// A hidden ontological value carried by the substrate.
export type Lambda = number

// Default outcome functions: Malus-law-style deterministic responses around a
// hidden polarization angle lambda (interpreted as radians). The caller can
// override these to model a different ontology. These defaults already respect
// the classical bound under independent settings.
function defaultOutcome(input: { angle: number; lambda: Lambda }): -1 | 1 {
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
  const aOptions: [number, number] = [input.angles.a, input.angles.aPrime]
  const bOptions: [number, number] = [input.angles.b, input.angles.bPrime]

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
    const product = outcomeA({ angle: angleA, lambda }) * outcomeB({ angle: angleB, lambda })

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

  const average = (s: number, c: number): number => (c === 0 ? 0 : s / c)
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
