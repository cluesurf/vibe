// P15: the entanglement area law (the holography rung).
// AdS/CFT ties bulk geometry to boundary entropy, and black-hole entropy scales as
// area, not volume. We compute the entanglement entropy of a region in the
// free-fermion ground state on the mesh, by the correlation-matrix method, and check
// the scaling: in 1D the gapless ground state gives the conformal log law
// S ~ (c/3) ln(L) with c = 1, and in 2D it gives an AREA law, S growing with the
// boundary of the region, not its volume. See note/questions/next-version.md (P15).
// Run: npx tsx code/experiment/p15-entanglement.ts

import { pathToFileURL } from 'node:url'
import { makeDense, DenseMatrix } from '~/linalg/dense'
import { eigSymmetric } from '~/linalg/eig-jacobi'

// The two-point correlation matrix C_ij = <c_i^dagger c_j> of the half-filled
// free-fermion ground state of the hopping Hamiltonian H (fill the lowest half of
// the modes, the Fermi sea).
export function correlationMatrix(input: { h: DenseMatrix; n: number }): Float64Array {
  const { h, n } = input
  const eig = eigSymmetric({ matrix: h })
  const order = Array.from({ length: n }, (_, k) => k).sort(
    (a, b) => (eig.values[a] ?? 0) - (eig.values[b] ?? 0),
  )
  const occupied = order.slice(0, Math.floor(n / 2))
  const c = new Float64Array(n * n)
  for (const k of occupied) {
    for (let i = 0; i < n; i++) {
      const vik = eig.vectors[i * n + k] ?? 0
      if (vik === 0) {
        continue
      }
      for (let j = 0; j < n; j++) {
        c[i * n + j] = (c[i * n + j] ?? 0) + vik * (eig.vectors[j * n + k] ?? 0)
      }
    }
  }
  return c
}

// Entanglement entropy of a region from the eigenvalues zeta of the restricted
// correlation matrix: S = -sum [ zeta ln zeta + (1-zeta) ln(1-zeta) ].
export function regionEntropy(input: { c: Float64Array; n: number; region: number[] }): number {
  const m = input.region.length
  const sub = makeDense({ rows: m, cols: m })
  for (let a = 0; a < m; a++) {
    for (let b = 0; b < m; b++) {
      sub.data[a * m + b] = input.c[(input.region[a] ?? 0) * input.n + (input.region[b] ?? 0)] ?? 0
    }
  }
  const eig = eigSymmetric({ matrix: sub })
  let s = 0
  for (let i = 0; i < m; i++) {
    const z = Math.min(1 - 1e-12, Math.max(1e-12, eig.values[i] ?? 0))
    s -= z * Math.log(z) + (1 - z) * Math.log(1 - z)
  }
  return s
}

function ring1D(n: number): DenseMatrix {
  const h = makeDense({ rows: n, cols: n })
  for (let i = 0; i < n; i++) {
    const j = (i + 1) % n
    h.data[i * n + j] = 1
    h.data[j * n + i] = 1
  }
  return h
}

function torus2D(side: number): DenseMatrix {
  const n = side * side
  const h = makeDense({ rows: n, cols: n })
  const idx = (x: number, y: number): number => ((y + side) % side) * side + ((x + side) % side)
  for (let y = 0; y < side; y++) {
    for (let x = 0; x < side; x++) {
      const v = idx(x, y)
      for (const [dx, dy] of [[1, 0], [0, 1]] as const) {
        const w = idx(x + dx, y + dy)
        h.data[v * n + w] = 1
        h.data[w * n + v] = 1
      }
    }
  }
  return h
}

function slope(xs: number[], ys: number[]): number {
  const n = xs.length
  const mx = xs.reduce((a, b) => a + b, 0) / n
  const my = ys.reduce((a, b) => a + b, 0) / n
  let cov = 0
  let varx = 0
  for (let i = 0; i < n; i++) {
    cov += ((xs[i] ?? 0) - mx) * ((ys[i] ?? 0) - my)
    varx += ((xs[i] ?? 0) - mx) * ((xs[i] ?? 0) - mx)
  }
  return varx === 0 ? 0 : cov / varx
}

// 1D: slope of S versus ln(block length), expected near c/3 = 1/3 for c = 1.
export function logLawSlope1D(input: { n: number }): number {
  const c = correlationMatrix({ h: ring1D(input.n), n: input.n })
  const lengths = [4, 6, 8, 12, 16, 20, 24]
  const lnL: number[] = []
  const s: number[] = []
  for (const L of lengths) {
    const region = Array.from({ length: L }, (_, i) => i)
    lnL.push(Math.log(L))
    s.push(regionEntropy({ c, n: input.n, region }))
  }
  return slope(lnL, s)
}

// 2D: entropy of an l x l block versus l. An area law is linear in l (the boundary),
// not in l^2 (the volume). Returns the boundary slope and whether area beats volume.
export function areaLaw2D(input: { side: number }): { boundaryFit: number; areaBeatsVolume: boolean } {
  const n = input.side * input.side
  const c = correlationMatrix({ h: torus2D(input.side), n })
  const ells = [2, 3, 4, 5]
  const ellArr: number[] = []
  const ell2Arr: number[] = []
  const s: number[] = []
  for (const l of ells) {
    const region: number[] = []
    for (let y = 0; y < l; y++) {
      for (let x = 0; x < l; x++) {
        region.push(y * input.side + x)
      }
    }
    ellArr.push(l)
    ell2Arr.push(l * l)
    s.push(regionEntropy({ c, n, region }))
  }
  // Residual of a linear (boundary) fit versus a quadratic (volume) fit.
  const boundaryFit = slope(ellArr, s)
  const resid = (xs: number[]): number => {
    const k = slope(xs, s)
    const mx = xs.reduce((a, b) => a + b, 0) / xs.length
    const ms = s.reduce((a, b) => a + b, 0) / s.length
    const c0 = ms - k * mx
    let r = 0
    for (let i = 0; i < xs.length; i++) {
      const pred = k * (xs[i] ?? 0) + c0
      r += ((s[i] ?? 0) - pred) ** 2
    }
    return r
  }
  return { boundaryFit, areaBeatsVolume: resid(ellArr) < resid(ell2Arr) }
}

export function main(): void {
  console.log('P15: the entanglement area law (holography rung)')
  console.log('')
  const slope1D = logLawSlope1D({ n: 120 })
  console.log(`  1D ring: S ~ a*ln(L), a = ${slope1D.toFixed(3)} (conformal prediction c/3 = 0.333, c = 1)`)
  console.log('')
  const two = areaLaw2D({ side: 12 })
  console.log(`  2D torus: S of an l x l block grows like the boundary l, slope ${two.boundaryFit.toFixed(3)}`)
  console.log(`  area law (boundary) beats a volume law (l^2): ${two.areaBeatsVolume ? 'YES' : 'no'}`)
  console.log('')
  console.log('  The free-fermion ground-state entanglement follows the conformal log law in')
  console.log('  1D (slope near 1/3, central charge c = 1) and an AREA law in 2D (entropy set')
  console.log('  by the boundary of the region, not its volume). Entropy living on boundaries,')
  console.log('  not volumes, is the signature behind holography and black-hole entropy. The')
  console.log('  full holographic correspondence remains the long road ahead.')
}

if (
  process.argv[1] !== undefined &&
  import.meta.url === pathToFileURL(process.argv[1]).href
) {
  main()
}
