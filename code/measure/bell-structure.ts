// The structural face of the emergent Bell correlations: the joint and marginal statistics of
// spin measurements on the singlet (no-signaling despite the Tsirelson violation), and the
// Horodecki CHSH value of two-qubit reduced states of three-party states (the Toner-Verstraete
// monogamy trade-off). All states here are real, so every quantity reduces to closed-form real
// arithmetic: for a real state the correlation matrix T has T_xy = T_yx = T_zy = T_yz = 0, so its
// singular values are those of the 2x2 xz block together with |T_yy|.

// The spin-measurement eigenvector at angle theta in the x-z plane, outcome +1 or -1.
function measurementVector(
  theta: number,
  outcome: 1 | -1,
): [number, number] {
  if (outcome === 1) {
    return [Math.cos(theta / 2), Math.sin(theta / 2)]
  }

  return [-Math.sin(theta / 2), Math.cos(theta / 2)]
}

// The joint outcome probability P(a, b | thetaA, thetaB) on the singlet (|01> - |10>)/sqrt(2).
export function singletJointProbability(input: {
  thetaA: number
  thetaB: number
  a: 1 | -1
  b: 1 | -1
}): number {
  const { thetaA, thetaB, a, b } = input
  const va = measurementVector(thetaA, a)
  const vb = measurementVector(thetaB, b)

  // <va vb | psi> with psi = (|01> - |10>)/sqrt(2): (va0 vb1 - va1 vb0)/sqrt(2)
  const amplitude = (va[0] * vb[1] - va[1] * vb[0]) / Math.SQRT2

  return amplitude * amplitude
}

// Alice's marginal P(a = +1 | thetaA, thetaB), summing over Bob's outcomes.
export function singletMarginalA(input: {
  thetaA: number
  thetaB: number
}): number {
  const { thetaA, thetaB } = input

  return (
    singletJointProbability({ thetaA, thetaB, a: 1, b: 1 }) +
    singletJointProbability({ thetaA, thetaB, a: 1, b: -1 })
  )
}

// The correlation E(thetaA, thetaB) = sum over outcomes of a b P(a, b).
export function singletCorrelation(input: {
  thetaA: number
  thetaB: number
}): number {
  const { thetaA, thetaB } = input

  let correlation = 0

  for (const a of [1, -1] as const) {
    for (const b of [1, -1] as const) {
      correlation +=
        a * b * singletJointProbability({ thetaA, thetaB, a, b })
    }
  }

  return correlation
}

// The CHSH value of the singlet at the standard optimal settings, 2 sqrt(2).
export function singletChsh(): number {
  const a0 = 0
  const a1 = Math.PI / 2
  const b0 = Math.PI / 4
  const b1 = -Math.PI / 4

  return Math.abs(
    singletCorrelation({ thetaA: a0, thetaB: b0 }) +
      singletCorrelation({ thetaA: a0, thetaB: b1 }) +
      singletCorrelation({ thetaA: a1, thetaB: b0 }) -
      singletCorrelation({ thetaA: a1, thetaB: b1 }),
  )
}

// A real three-qubit pure state as eight amplitudes indexed |abc> with a the leftmost qubit.
export type ThreeQubit = readonly number[]

// The W-class family a|100> + b|010> + c|001>, normalized by the caller.
export function wClassState(input: {
  a: number
  b: number
  c: number
}): ThreeQubit {
  const state = new Array<number>(8).fill(0)

  state[0b100] = input.a
  state[0b010] = input.b
  state[0b001] = input.c

  return state
}

// The GHZ state (|000> + |111>)/sqrt(2).
export function ghzState(): ThreeQubit {
  const state = new Array<number>(8).fill(0)

  state[0b000] = 1 / Math.SQRT2
  state[0b111] = 1 / Math.SQRT2

  return state
}

// The two-qubit correlation matrix entries of the reduced state of qubits (first, second) of a
// real three-qubit pure state, tracing out the third index. Returns the xz block and T_yy (the
// only nonzero entries for a real state).
export function reducedCorrelation(input: {
  state: ThreeQubit
  first: number
  second: number
}): { xx: number; xz: number; zx: number; zz: number; yy: number } {
  const { state, first, second } = input

  // bit index of qubit q in the basis label (qubit 0 is the leftmost, bit 2)
  const bitOf = (label: number, q: number): number =>
    (label >> (2 - q)) & 1

  const traced = [0, 1, 2].find(q => q !== first && q !== second)!

  // pauli action on a real state: sigma-x flips the bit; sigma-z signs the bit; sigma-y on both
  // qubits gives (i)(i) times flip-with-signs, a real total
  const expectation = (
    pauliFirst: 'x' | 'z' | 'y',
    pauliSecond: 'x' | 'z' | 'y',
  ): number => {
    let total = 0

    for (let label = 0; label < 8; label++) {
      const amplitude = state[label]!

      if (amplitude === 0) {
        continue
      }

      let target = label
      let factor = 1

      for (const [q, pauli] of [
        [first, pauliFirst],
        [second, pauliSecond],
      ] as const) {
        const bit = bitOf(target, q)

        if (pauli === 'x') {
          target ^= 1 << (2 - q)
        } else if (pauli === 'z') {
          factor *= bit === 0 ? 1 : -1
        } else {
          // sigma-y = i sigma-x sigma-z acting on real states: the two i factors across the two
          // qubits give -1 times the combined flip-and-sign action
          factor *= bit === 0 ? 1 : -1
          target ^= 1 << (2 - q)
        }
      }

      void traced

      total += factor * amplitude * state[target]!
    }

    return total
  }

  // the sigma-y sigma-y pair carries (i)(i) = -1 relative to the flip-sign action; the mixed
  // y-with-x or y-with-z entries vanish for real states, computed by the caller's structure
  return {
    xx: expectation('x', 'x'),
    xz: expectation('x', 'z'),
    zx: expectation('z', 'x'),
    zz: expectation('z', 'z'),
    yy: -expectation('y', 'y'),
  }
}

// The expectation of a three-fold Pauli product on a real three-qubit state. Each sigma-y
// contributes a factor i, so for a real state the value is nonzero only when the sigma-y count is
// even, with sign i to that count (plus for zero or four, minus for two).
export function pauliExpectation3(input: {
  state: ThreeQubit
  paulis: readonly ('x' | 'y' | 'z')[]
}): number {
  const { state, paulis } = input
  const yCount = paulis.filter(pauli => pauli === 'y').length

  if (yCount % 2 !== 0) {
    return 0
  }

  let total = 0

  for (let label = 0; label < 8; label++) {
    const amplitude = state[label]!

    if (amplitude === 0) {
      continue
    }

    let target = label
    let factor = 1

    for (let q = 0; q < 3; q++) {
      const bit = (target >> (2 - q)) & 1
      const pauli = paulis[q]!

      if (pauli === 'x') {
        target ^= 1 << (2 - q)
      } else if (pauli === 'z') {
        factor *= bit === 0 ? 1 : -1
      } else {
        factor *= bit === 0 ? 1 : -1
        target ^= 1 << (2 - q)
      }
    }

    total += factor * amplitude * state[target]!
  }

  const phase = yCount % 4 === 0 ? 1 : -1

  return phase * total
}

// The Horodecki optimal CHSH value of a two-qubit state from its correlation matrix: two times
// the square root of the sum of the two largest squared singular values. For a real state the
// singular values are those of the 2x2 xz block plus |T_yy|.
export function horodeckiChsh(input: {
  state: ThreeQubit
  first: number
  second: number
}): number {
  const t = reducedCorrelation(input)

  // singular values of the 2x2 block [[xx, xz], [zx, zz]]
  const gram1 = t.xx * t.xx + t.zx * t.zx
  const gram2 = t.xz * t.xz + t.zz * t.zz
  const cross = t.xx * t.xz + t.zx * t.zz
  const trace = gram1 + gram2
  const discriminant = Math.sqrt(
    Math.max(0, (gram1 - gram2) * (gram1 - gram2) + 4 * cross * cross),
  )

  const s1 = (trace + discriminant) / 2
  const s2 = (trace - discriminant) / 2
  const yy = t.yy * t.yy

  const squares = [s1, s2, yy].sort((p, q) => q - p)

  return 2 * Math.sqrt(squares[0]! + squares[1]!)
}
