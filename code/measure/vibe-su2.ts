// Which SU(2) acts on the vibe and survives a rule. The three vibes fear, calm, love carry the charges
// -1, 0, +1, which are exactly the weights m of the spin-one representation of SU(2): a trit is a
// spin-one site with the vibe as its m. On n slots the total spin J = sum of the one-site spin-one
// matrices acts on the 3^n states, J_z is the total charge, and J_x, J_y move charge by one unit.
//
// A reversible rule on n slots is a permutation P of the 3^n states. It respects the generator X
// (a real combination a J_x + b J_y + c J_z) when P X = X P. The generators it respects form a linear
// subspace of the three-dimensional su(2), and its dimension says what survives: 3 all of SU(2),
// 1 a U(1) (charge conservation alone gives J_z), 0 nothing.
//
// A state index uses the base-three encoding of blockMap in code/measure/collision-anatomy (slot k of
// a block is digit k, lowest first, digit = tone + 1), so a block map read there is a permutation here.
//
// Everything is exact: the spin-one matrices have entries 0 and 1 / sqrt 2 (J_x, J_y) and the
// commutators are computed on the basis, with a tolerance only on floating sums of those.

// tone of digit k in a base-three state index, digit value = tone + 1, slot 0 the lowest digit
export function toneAt(index: number, slot: number): number {
  return (Math.floor(index / 3 ** slot) % 3) - 1
}

// one matrix entry (row, re, im) of a generator in the column of a basis state
type Entry = readonly [number, number, number]

const GENERATOR_CACHE = new Map<number, Entry[][][]>()

// J_x, J_y, J_z on n spin-one slots as sparse columns: generators[g][x] lists the entries of column x.
// J_+ on one site has matrix elements sqrt 2, J_x = (J_+ + J_-) / 2, J_y = (J_+ - J_-) / (2 i), and
// J_z is the total charge.
export function spinOneGenerators(slots: number): Entry[][][] {
  const cached = GENERATOR_CACHE.get(slots)

  if (cached) {
    return cached
  }

  const size = 3 ** slots
  const half = Math.SQRT2 / 2
  const jx: Entry[][] = []
  const jy: Entry[][] = []
  const jz: Entry[][] = []

  for (let x = 0; x < size; x++) {
    const cx: Entry[] = []
    const cy: Entry[] = []
    let charge = 0

    for (let s = 0; s < slots; s++) {
      const tone = toneAt(x, s)

      charge += tone

      if (tone !== 1) {
        // J_+ |x> = sqrt 2 |x + 3^s>
        cx.push([x + 3 ** s, half, 0])
        cy.push([x + 3 ** s, 0, -half])
      }

      if (tone !== -1) {
        // J_- |x> = sqrt 2 |x - 3^s>
        cx.push([x - 3 ** s, half, 0])
        cy.push([x - 3 ** s, 0, half])
      }
    }

    jx.push(cx)
    jy.push(cy)
    jz.push(charge === 0 ? [] : [[x, charge, 0]])
  }

  const out = [jx, jy, jz]

  GENERATOR_CACHE.set(slots, out)

  return out
}

// the commutator P G - G P of a permutation with one generator, dense, as interleaved re and im
function commutatorOf(
  permutation: readonly number[],
  columns: readonly Entry[][],
  size: number,
  out: Float64Array,
): void {
  out.fill(0)

  for (let x = 0; x < size; x++) {
    // (P G)[P(y), x] = G[y, x]
    for (const [y, vr, vi] of columns[x] ?? []) {
      const k = 2 * ((permutation[y] ?? 0) * size + x)

      out[k] = (out[k] ?? 0) + vr
      out[k + 1] = (out[k + 1] ?? 0) + vi
    }

    // (G P)[y, x] = G[y, P(x)]
    for (const [y, vr, vi] of columns[permutation[x] ?? 0] ?? []) {
      const k = 2 * (y * size + x)

      out[k] = (out[k] ?? 0) - vr
      out[k + 1] = (out[k + 1] ?? 0) - vi
    }
  }
}

// the dimension of the subspace of su(2) a permutation respects. The squared commutator norm of
// a J_x + b J_y + c J_z is the quadratic form with Gram matrix Re <[P, J_i], [P, J_j]>, and its kernel
// is the respected subspace, found by elimination.
export function respectedSu2Dimension(input: {
  permutation: readonly number[]
  slots: number
}): { dimension: number; form: number[][] } {
  const { permutation, slots } = input
  const size = 3 ** slots
  const generators = spinOneGenerators(slots)
  const commutators = [0, 1, 2].map(g => {
    const buffer = new Float64Array(2 * size * size)

    commutatorOf(permutation, generators[g] ?? [], size, buffer)

    return buffer
  })
  const inner = (i: number, j: number): number => {
    const a = commutators[i] ?? new Float64Array(0)
    const b = commutators[j] ?? new Float64Array(0)
    let sum = 0

    for (let k = 0; k < a.length; k++) {
      sum += (a[k] ?? 0) * (b[k] ?? 0)
    }

    return sum
  }
  const form = [0, 1, 2].map(i => [0, 1, 2].map(j => inner(i, j)))
  // rank by Gaussian elimination with a tolerance well above rounding of sqrt 2 sums
  const m = form.map(row => row.slice())
  let rank = 0

  for (let col = 0; col < 3 && rank < 3; col++) {
    let pivot = rank

    for (let r = rank; r < 3; r++) {
      if (Math.abs(m[r]?.[col] ?? 0) > Math.abs(m[pivot]?.[col] ?? 0)) {
        pivot = r
      }
    }

    if (Math.abs(m[pivot]?.[col] ?? 0) < 1e-9) {
      continue
    }

    const swap = m[pivot] ?? []

    m[pivot] = m[rank] ?? []
    m[rank] = swap

    for (let r = 0; r < 3; r++) {
      if (r !== rank) {
        const factor = (m[r]?.[col] ?? 0) / (m[rank]?.[col] ?? 1)

        for (let k = 0; k < 3; k++) {
          ;(m[r] as number[])[k] =
            (m[r]?.[k] ?? 0) - factor * (m[rank]?.[k] ?? 0)
        }
      }
    }

    rank++
  }

  return { dimension: 3 - rank, form }
}

// every permutation of `size` items, in lexicographic order, passed to the visitor one at a time
export function forEachPermutation(
  size: number,
  visit: (permutation: readonly number[]) => void,
): void {
  const current = Array.from({ length: size }, (_, i) => i)

  visit(current)

  for (;;) {
    let i = size - 2

    while (i >= 0 && (current[i] ?? 0) >= (current[i + 1] ?? 0)) {
      i--
    }

    if (i < 0) {
      return
    }

    let j = size - 1

    while ((current[j] ?? 0) <= (current[i] ?? 0)) {
      j--
    }

    const t = current[i] ?? 0

    current[i] = current[j] ?? 0
    current[j] = t

    for (let lo = i + 1, hi = size - 1; lo < hi; lo++, hi--) {
      const u = current[lo] ?? 0

      current[lo] = current[hi] ?? 0
      current[hi] = u
    }

    visit(current)
  }
}
