// The quotient of Z^n by the lattice a set of integer vectors spans, by the Smith normal form.
//
// A reversible rule conserves an integer linear quantity (or its residue mod m) exactly when that
// quantity vanishes (or vanishes mod m) on every change the rule's pieces can make. Collect the possible
// changes as rows, and Z^n / span(rows) = Z^free + Z_d1 + ... + Z_dk lists every such invariant: `free`
// independent exact linear invariants and one residue invariant mod each d > 1. Exact integer
// arithmetic throughout; the entries in use here are small, so plain numbers do not overflow.

export type LatticeQuotient = {
  // the rank of the spanned lattice
  readonly rank: number
  // the invariant factors greater than one, in increasing order (the torsion of the quotient)
  readonly torsion: number[]
  // n - rank, the number of independent exact linear invariants
  readonly free: number
}

export function latticeQuotient(rows: readonly (readonly number[])[], n: number): LatticeQuotient {
  const seen = new Set<string>()
  const m: number[][] = []

  for (const row of rows) {
    const key = row.join(',')

    if (!seen.has(key) && row.some(x => x !== 0)) {
      seen.add(key)
      m.push(Array.from({ length: n }, (_, i) => row[i] ?? 0))
    }
  }

  const factors: number[] = []

  let top = 0

  for (let col = 0; col < n && top < m.length; col++) {
    // bring the smallest nonzero entry of the remaining block to (top, col) and clear its row and column
    for (;;) {
      let best: [number, number] | undefined

      for (let i = top; i < m.length; i++) {
        for (let j = col; j < n; j++) {
          const v = Math.abs(m[i]?.[j] ?? 0)

          if (v !== 0 && (best === undefined || v < Math.abs(m[best[0]]?.[best[1]] ?? 0))) {
            best = [i, j]
          }
        }
      }

      if (best === undefined) {
        return finish(factors, n)
      }

      const [bi, bj] = best

      ;[m[top], m[bi]] = [m[bi] ?? [], m[top] ?? []]

      for (const row of m) {
        const x = row[col] ?? 0

        row[col] = row[bj] ?? 0
        row[bj] = x
      }

      const pivot = m[top]?.[col] ?? 1
      let clean = true

      for (let i = 0; i < m.length; i++) {
        if (i === top) {
          continue
        }

        const q = Math.trunc((m[i]?.[col] ?? 0) / pivot)

        if (q !== 0) {
          for (let j = col; j < n; j++) {
            ;(m[i] as number[])[j] = (m[i]?.[j] ?? 0) - q * (m[top]?.[j] ?? 0)
          }
        }

        clean = clean && (m[i]?.[col] ?? 0) === 0
      }

      for (let j = col + 1; j < n; j++) {
        const q = Math.trunc((m[top]?.[j] ?? 0) / pivot)

        if (q !== 0) {
          for (let i = 0; i < m.length; i++) {
            ;(m[i] as number[])[j] = (m[i]?.[j] ?? 0) - q * (m[i]?.[col] ?? 0)
          }
        }

        clean = clean && (m[top]?.[j] ?? 0) === 0
      }

      if (!clean) {
        continue
      }

      // the pivot must divide every remaining entry; if one does not, fold that row in and repeat
      let bad = -1

      for (let i = top + 1; i < m.length && bad < 0; i++) {
        for (let j = col + 1; j < n; j++) {
          if ((m[i]?.[j] ?? 0) % pivot !== 0) {
            bad = i
            break
          }
        }
      }

      if (bad >= 0) {
        for (let j = col; j < n; j++) {
          ;(m[top] as number[])[j] = (m[top]?.[j] ?? 0) + (m[bad]?.[j] ?? 0)
        }

        continue
      }

      factors.push(Math.abs(pivot))
      top++
      break
    }
  }

  return finish(factors, n)
}

function finish(factors: number[], n: number): LatticeQuotient {
  return {
    rank: factors.length,
    torsion: factors.filter(d => d > 1).sort((a, b) => a - b),
    free: n - factors.length,
  }
}
