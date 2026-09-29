// THE DEPHASED TWIN: an exact witness of interference for the superposed locked rule (code/rule/doublet-locked-knit,
// code/rule/coined-locked-knit). MEASUREMENT: every weight is an exact rational p / 4^k; floats appear only in the
// readings returned for printing.
//
// A superposed state is a sum of configurations with Eisenstein amplitudes. Its Born distribution over configurations
// is |amplitude|^2. The DEPHASED TWIN runs the same rule, beat for beat, with the phases dropped after every beat: each
// configuration of the twin, weighted by its probability, is stepped one beat as a lone classical configuration, and the
// Born weights of that one beat are added as probabilities, never as amplitudes. So the twin is the Markov chain whose
// one-beat transition chances are the rule's own. Where no two histories of the rule ever reach one configuration, the
// exact distribution and the twin's are equal term for term; they differ exactly where histories that reach a common
// configuration add as amplitudes. The L1 distance between the two, on any coarse reading (the occupation, the husk
// columns), is therefore a witness of interference that sees every merge, where a reading of one branch's weight (the
// keep term against (1/4)^m) sees only merges into that one branch.
//
// GRAINS: 'full' reads every vibe with its point and open bit and every stored unit with its word and open bits;
// 'occupation' reads vibe and store trits only (where the vibes are); 'husk' reads, per husk column, how many loves,
// fears and stored units it holds (code/measure/causal-components boxHusk column).
//
// DETERMINISM: no random number; the twin enumerates. NOTHING MOVES: the readings compare values the stream took.

import {
  lockedState,
  norm,
  type Configuration,
  type LockedState,
} from '@/code/rule/doublet-locked-knit'

export type Grain =
  | { readonly kind: 'full' }
  | { readonly kind: 'occupation' }
  | { readonly kind: 'husk'; readonly column: Int32Array }

export const FULL: Grain = { kind: 'full' }
export const OCCUPATION: Grain = { kind: 'occupation' }

// a configuration's key at a grain
export function grainKey(c: Configuration, grain: Grain): string {
  if (grain.kind === 'husk') {
    const cells = c.store.length / 12
    const count = new Map<number, [number, number, number]>()

    const at = (col: number): [number, number, number] => {
      let v = count.get(col)

      if (!v) {
        v = [0, 0, 0]
        count.set(col, v)
      }

      return v
    }

    for (let i = 0; i < c.vibe.length; i++) {
      const v = c.vibe[i]!

      if (v !== 0) {
        at(grain.column[Math.floor(i / 24)]!)[v > 0 ? 0 : 1]++
      }
    }

    for (let s = 0; s < cells * 12; s++) {
      if (c.store[s] !== 0) {
        at(grain.column[Math.floor(s / 12)]!)[2]++
      }
    }

    return [...count.entries()]
      .sort((a, b) => a[0] - b[0])
      .map(([col, v]) => `${col}:${v.join('.')}`)
      .join(',')
  }

  const full = grain.kind === 'full'
  const parts: number[] = []

  for (let i = 0; i < c.vibe.length; i++) {
    if (c.vibe[i] !== 0) {
      parts.push(
        i,
        c.vibe[i]!,
        ...(full ? [c.point[i]!, c.open[i]!] : []),
      )
    }
  }

  parts.push(-1)

  for (let s = 0; s < c.store.length; s++) {
    if (c.store[s] !== 0) {
      parts.push(
        s,
        c.store[s]!,
        ...(full ? [c.spoint[s]!, c.sopen[s]!] : []),
      )
    }
  }

  return parts.join(',')
}

// a weight p / 4^k on one configuration (the configuration kept as a representative)
export type Weighted = { c: Configuration; p: bigint; k: number }

export type Distribution = Map<string, Weighted>

// add p / 4^k to a key, exactly
export function addWeight(
  d: Distribution,
  key: string,
  c: Configuration,
  p: bigint,
  k: number,
): void {
  const o = d.get(key)

  if (!o) {
    d.set(key, { c, p, k })

    return
  }

  const K = Math.max(o.k, k)

  o.p =
    o.p * (1n << BigInt(2 * (K - o.k))) +
    p * (1n << BigInt(2 * (K - k)))
  o.k = K
}

// the Born distribution of a superposed state at a grain: |a + b w|^2 / 4^k per branch, summed by key
export function bornDistribution(
  s: LockedState,
  grain: Grain = FULL,
): Distribution {
  const d: Distribution = new Map()

  for (const b of s.branches) {
    addWeight(d, grainKey(b, grain), b, norm(b.a, b.b), b.k)
  }

  return d
}

// a distribution read at a coarser grain
export function coarsen(d: Distribution, grain: Grain): Distribution {
  const out: Distribution = new Map()

  for (const w of d.values()) {
    addWeight(out, grainKey(w.c, grain), w.c, w.p, w.k)
  }

  return out
}

// the twin's start: one classical configuration with weight 1
export function dephasedStart(c: Configuration): Distribution {
  return new Map([[grainKey(c, FULL), { c, p: 1n, k: 0 }]])
}

// one beat of the twin: every configuration stepped alone by `beat`, its branches' Born weights added as probabilities
export function dephasedBeat(
  d: Distribution,
  beat: (s: LockedState) => LockedState,
): Distribution {
  const out: Distribution = new Map()

  for (const w of d.values()) {
    for (const b of beat(lockedState(w.c)).branches) {
      addWeight(
        out,
        grainKey(b, FULL),
        b,
        w.p * norm(b.a, b.b),
        w.k + b.k,
      )
    }
  }

  return out
}

// the total weight of a distribution, as numerator over 4^K (equal numerator and 4^K when it sums to one)
export function totalWeight(d: Distribution): {
  numerator: bigint
  unit: bigint
} {
  let K = 0

  for (const w of d.values()) {
    K = Math.max(K, w.k)
  }

  let numerator = 0n

  for (const w of d.values()) {
    numerator += w.p * (1n << BigInt(2 * (K - w.k)))
  }

  return { numerator, unit: 1n << BigInt(2 * K) }
}

// the L1 distance between two distributions, exactly: sum |p - q| as numerator over 4^K, and its value
export function l1Distance(
  a: Distribution,
  b: Distribution,
): { numerator: bigint; unit: bigint; value: number } {
  let K = 0

  for (const w of a.values()) {
    K = Math.max(K, w.k)
  }

  for (const w of b.values()) {
    K = Math.max(K, w.k)
  }

  const scaled = (w: Weighted | undefined): bigint =>
    w ? w.p * (1n << BigInt(2 * (K - w.k))) : 0n

  let numerator = 0n

  for (const key of new Set([...a.keys(), ...b.keys()])) {
    const x = scaled(a.get(key)) - scaled(b.get(key))

    numerator += x < 0n ? -x : x
  }

  const unit = 1n << BigInt(2 * K)
  const shift = BigInt(Math.max(0, unit.toString(2).length - 60))

  return {
    numerator,
    unit,
    value: Number(numerator >> shift) / Number(unit >> shift),
  }
}
