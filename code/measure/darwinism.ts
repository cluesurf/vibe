// Quantum Darwinism, the macroscopic measurement chain made quantitative. A microscopic
// superposition alpha |0> + beta |1> copies its pointer value onto N environment cells, each copy
// imperfect (the two environment states overlap by c per cell). The branch overlap factorizes, so
// everything is exact without building the exponential state: the system coherence decays as c to
// the N (amplified decoherence), any small fragment of k cells carries nearly the whole pointer
// information (the classical plateau), and the record is redundant (many disjoint fragments each
// suffice). That is the amplification chain: micro superposition in, macroscopic redundant
// definite record out.

function binaryEntropy(p: number): number {
  if (p <= 0 || p >= 1) {
    return 0
  }

  return -p * Math.log2(p) - (1 - p) * Math.log2(1 - p)
}

// The entropy of a rank-two density matrix with branch weights w0, w1 and branch overlap c: its
// eigenvalues are the eigenvalues of [[w0, sqrt(w0 w1) c], [sqrt(w0 w1) c, w1]].
function rankTwoEntropy(input: {
  w0: number
  w1: number
  overlap: number
}): number {
  const { w0, w1, overlap } = input
  const cross = Math.sqrt(w0 * w1) * overlap
  const mean = (w0 + w1) / 2
  const radius = Math.sqrt(((w0 - w1) / 2) ** 2 + cross * cross)

  return binaryEntropy(Math.min(1, Math.max(0, mean + radius)))
}

// The mutual information I(S : F_k) between the system and a fragment of k environment cells,
// for the branch structure alpha |0>|e0...> + beta |1>|e1...> with per-cell overlap c. The
// system's reduced state has off-diagonal suppressed by c^N restricted to the traced-out cells,
// the fragment by c^k, and the joint by the complement.
export function fragmentMutualInformation(input: {
  weight0: number
  weight1: number
  overlap: number
  total: number
  fragment: number
}): number {
  const { weight0, weight1, overlap, total, fragment } = input

  // tracing out the complement of the fragment leaves the joint suppressed by c^(N-k)
  const entropySystem = rankTwoEntropy({
    w0: weight0,
    w1: weight1,
    overlap: Math.pow(overlap, total),
  })

  const entropyFragment = rankTwoEntropy({
    w0: weight0,
    w1: weight1,
    overlap: Math.pow(overlap, fragment),
  })

  const entropyJoint = rankTwoEntropy({
    w0: weight0,
    w1: weight1,
    overlap: Math.pow(overlap, total - fragment),
  })

  return entropySystem + entropyFragment - entropyJoint
}

// The system's surviving coherence after the copy chain: the off-diagonal suppression c^N.
export function chainCoherence(input: {
  overlap: number
  total: number
}): number {
  return Math.pow(input.overlap, input.total)
}
