/**
 * The M3-B signal of level 4: the second-order Z3 wave
 *
 *   s(t+1) = (sum of s(t) over the in-neighbours) + self * s(t) - s(t-1)   (mod 3)
 *
 * on a graph given as in-neighbour lists. Residues 0, 1, 2 stand for the tones 0, +1, -1. With symmetric lists
 * and self 0 this is the linear self-0 law of code/rule/second-order-z3.ts, which a candidate may not import
 * (check:layers rule 2 and the sandbox bundle forbid the rules), so this is the solver's own copy, certified
 * against the original in E-CMP-0056 step for step. Exact integer arithmetic, no imports, no random numbers.
 */

/** One forward step on in-neighbour lists, every node at once; `self` is 0 for the M3-B wave. */
export function waveStep(inArcs: readonly (readonly number[])[], previous: readonly number[], current: readonly number[], self: number): number[] {
  const n = inArcs.length
  const next: number[] = new Array<number>(n)

  for (let i = 0; i < n; i++) {
    let sum = self * (current[i] ?? 0)

    for (const u of inArcs[i]!) {
      sum += current[u]!
    }

    next[i] = ((sum % 3) + 3 - (previous[i] ?? 0)) % 3
  }

  return next
}

/** The tone of a residue. */
export function toneOf(residue: number): number {
  return residue === 2 ? -1 : residue
}

/** The residue of a tone. */
export function residueOf(tone: number): number {
  return tone === -1 ? 2 : tone
}

export const DIGEST_MODULUS = 2_147_483_647

/** A key's hash for the digests: a polynomial over its char codes, mod 1,000,003. */
export function keyHash(key: string): number {
  let h = 7

  for (let at = 0; at < key.length; at++) {
    h = (h * 31 + key.charCodeAt(at)) % 1_000_003
  }

  return h
}
