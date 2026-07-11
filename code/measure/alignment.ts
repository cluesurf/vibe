// Alignment measures: coherence, conflict, resonance, and decisiveness, read off tone patterns. These are the
// computable definitions behind the alignment notes. Resonance between two patterns is the normalized tone
// overlap (see code/operator/hopfield). Coherence and conflict come in a graph form (over a substrate's edges)
// and a parts form (over a self's sub-selves as vectors), so both the substrate experiments and the deliberation
// experiments can use one source of truth.

type Edge = [number, number]

// graph coherence: the mean product of tones over edges, the Ising-style order parameter. +1 fully agreeing,
// -1 fully opposed, 0 mixed. Edges touching a rest tone (0) contribute 0.
export function coherenceOrder(tone: Int8Array, edges: Edge[]): number {
  if (edges.length === 0) return 0

  let sum = 0

  for (const [u, v] of edges) sum += (tone[u] ?? 0) * (tone[v] ?? 0)

  return sum / edges.length
}

// graph conflict: the fraction of edges that join opposed nonzero tones (+1 against -1). 0 none, 1 all.
export function conflictFraction(
  tone: Int8Array,
  edges: Edge[],
): number {
  if (edges.length === 0) return 0

  let opposed = 0

  for (const [u, v] of edges) {
    if ((tone[u] ?? 0) * (tone[v] ?? 0) === -1) {
      opposed++
    }
  }

  return opposed / edges.length
}

// the fraction of sites at which two equal-length patterns oppose (one +1, the other -1)
export function pairConflict(a: Int8Array, b: Int8Array): number {
  const n = Math.min(a.length, b.length)

  if (n === 0) return 0

  let opposed = 0

  for (let i = 0; i < n; i++) {
    if ((a[i] ?? 0) * (b[i] ?? 0) === -1) {
      opposed++
    }
  }

  return opposed / n
}

// the mean pairwise conflict among a self's parts (sub-selves), the internal conflict of the self
export function meanPairwiseConflict(parts: Int8Array[]): number {
  let sum = 0
  let count = 0

  for (let i = 0; i < parts.length; i++) {
    for (let j = i + 1; j < parts.length; j++) {
      sum += pairConflict(parts[i]!, parts[j]!)
      count++
    }
  }

  return count > 0 ? sum / count : 0
}

// decisiveness: how strong and unanimous the parts' aggregate signal is, the mean normalized magnitude of their
// summed tone per site. Near 1 the parts agree and the urge is clear, near 0 they cancel and the self is torn.
export function decisiveness(parts: Int8Array[]): number {
  const k = parts.length
  const n = parts[0]?.length ?? 0

  if (k === 0 || n === 0) return 0

  let sum = 0

  for (let i = 0; i < n; i++) {
    let s = 0

    for (const p of parts) s += p[i] ?? 0

    sum += Math.abs(s) / k
  }

  return sum / n
}
