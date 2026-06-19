// The Hamiltonian of a reversible cellular automaton, and its locality profile.
// P1 asks not just whether H = i log U is bounded below (it is, from the cycle
// structure) but whether H is LOCAL. We build H exactly from the permutation's
// cycles, expand it in the Pauli basis, and measure how its operator weight is
// distributed over interaction range. A profile concentrated at short range and
// decaying means H is (quasi-)local. See note/questions/roadmap.md (A1).

import {
  ComplexMatrix,
  makeComplexMatrix,
} from '@/code/algebra/linear/dense'

// Build H (Hermitian) from a permutation U via U = e^{-iH}. On each cycle of
// length L the eigenphases are theta_m = 2 pi m / L wrapped to (-pi, pi], so H is
// the circulant H[s_a][s_b] = (1/L) sum_m theta_m exp(2 pi i m (a-b)/L). The
// principal branch keeps the energies minimal, the natural choice for locality.
export function hamiltonianMatrix(input: {
  perm: Int32Array
}): ComplexMatrix {
  const perm = input.perm
  const n = perm.length
  const h = makeComplexMatrix({ rows: n, cols: n })
  const visited = new Uint8Array(n)

  for (let start = 0; start < n; start++) {
    if ((visited[start] ?? 0) === 1) {
      continue
    }

    // Collect the cycle in order: cycle[j+1] = perm[cycle[j]].
    const cycle: number[] = []

    let cursor = start

    while ((visited[cursor] ?? 0) === 0) {
      visited[cursor] = 1
      cycle.push(cursor)
      cursor = perm[cursor] ?? cursor
    }

    const L = cycle.length

    if (L === 1) {
      continue // fixed point: theta = 0, zero block
    }

    // Precompute the wrapped eigenphases.
    const theta = new Float64Array(L)

    for (let m = 0; m < L; m++) {
      let t = (2 * Math.PI * m) / L

      if (t > Math.PI) {
        t -= 2 * Math.PI
      }

      theta[m] = t
    }

    // H[s_a][s_b] over the cycle.
    for (let a = 0; a < L; a++) {
      const sa = cycle[a] ?? 0

      for (let b = 0; b < L; b++) {
        const sb = cycle[b] ?? 0

        let re = 0
        let im = 0

        for (let m = 0; m < L; m++) {
          const angle = (2 * Math.PI * m * (a - b)) / L
          const th = theta[m] ?? 0
          re += th * Math.cos(angle)
          im += th * Math.sin(angle)
        }

        h.re[sa * n + sb] = re / L
        h.im[sa * n + sb] = im / L
      }
    }
  }

  return h
}

// The smallest arc on a ring of `cells` sites that covers the given non-identity
// positions (the interaction range of a Pauli string on a periodic lattice).
function ringExtent(input: { sites: number[]; cells: number }): number {
  if (input.sites.length === 0) {
    return 0
  }

  if (input.sites.length === 1) {
    return 1
  }

  const sorted = [...input.sites].sort((a, b) => a - b)

  // The smallest covering arc excludes the largest empty span between two
  // consecutive occupied sites: extent = cells - (largestStep - 1).
  let largestStep = 0

  for (let i = 0; i < sorted.length; i++) {
    const cur = sorted[i] ?? 0
    const next = sorted[(i + 1) % sorted.length] ?? 0
    const step =
      i + 1 < sorted.length
        ? next - cur
        : input.cells - cur + (sorted[0] ?? 0)

    if (step > largestStep) {
      largestStep = step
    }
  }

  return input.cells - largestStep + 1
}

// Expand H in the Pauli basis and bucket the squared coefficients by interaction
// range. Returns the fraction of the total (identity-removed) operator weight at
// each range 1..cells, plus a weighted-average range (the "locality length").
export function pauliLocalityProfile(input: {
  matrix: ComplexMatrix
  cells: number
}): {
  weightByRange: Float64Array
  localityLength: number
  totalWeight: number
} {
  const h = input.matrix
  const n = h.rows
  const cells = input.cells
  const stringCount = 4 ** cells

  const weightByRange = new Float64Array(cells + 1) // index 0 = identity

  // Single-site Pauli action on input bit value v: returns {coeffRe, coeffIm}.
  // I -> 1; X -> 1; Y -> i*(-1)^v; Z -> (-1)^v. flip is handled by flipMask.
  for (let p = 0; p < stringCount; p++) {
    // Decode the per-site operators.
    let flipMask = 0

    const sites: number[] = []

    let rest = p
    let hasNonIdentity = false

    const ops = new Uint8Array(cells)

    for (let c = 0; c < cells; c++) {
      const op = rest & 3
      rest >>= 2
      ops[c] = op

      if (op !== 0) {
        hasNonIdentity = true
        sites.push(c)
      }

      if (op === 1 || op === 2) {
        flipMask |= 1 << c
      }
    }

    // Tr(P H) = sum_s phase(u) * H[u][s], u = s XOR flipMask.
    let trRe = 0
    let trIm = 0

    for (let s = 0; s < n; s++) {
      const u = s ^ flipMask

      // phase(u) = product over sites of single-site coeff at input bit u_site.
      let phRe = 1
      let phIm = 0

      for (let c = 0; c < cells; c++) {
        const op = ops[c] ?? 0

        if (op === 0 || op === 1) {
          continue // I or X contribute coefficient 1
        }

        const bit = (u >> c) & 1

        if (op === 3) {
          // Z: (-1)^bit
          if (bit === 1) {
            phRe = -phRe
            phIm = -phIm
          }
        } else {
          // Y: i * (-1)^bit, multiply (phRe+i phIm) by (0 + i*sign)
          const sign = bit === 1 ? -1 : 1
          const nr = -phIm * sign
          const ni = phRe * sign
          phRe = nr
          phIm = ni
        }
      }

      const hr = h.re[u * n + s] ?? 0
      const hi = h.im[u * n + s] ?? 0
      // trace += phase * H[u][s]
      trRe += phRe * hr - phIm * hi
      trIm += phRe * hi + phIm * hr
    }

    const cRe = trRe / n
    const cIm = trIm / n
    const weight = cRe * cRe + cIm * cIm

    if (!hasNonIdentity) {
      weightByRange[0] = (weightByRange[0] ?? 0) + weight
      continue
    }

    const range = ringExtent({ sites, cells })
    weightByRange[range] = (weightByRange[range] ?? 0) + weight
  }

  // Total interaction weight (excluding the identity / constant offset).
  let total = 0

  for (let r = 1; r <= cells; r++) {
    total += weightByRange[r] ?? 0
  }

  let lengthSum = 0

  const fractions = new Float64Array(cells + 1)

  for (let r = 1; r <= cells; r++) {
    const frac = total > 0 ? (weightByRange[r] ?? 0) / total : 0
    fractions[r] = frac
    lengthSum += r * frac
  }

  return {
    weightByRange: fractions,
    localityLength: lengthSum,
    totalWeight: total,
  }
}
