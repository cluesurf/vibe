// P18: dark matter from nonlocal gravity (no dark particle).
// The gravitational potential is the Green's function of the kinetic operator. With
// the local Laplacian it is Newtonian (1/r in 3D, P16), giving Keplerian rotation
// curves (orbital speed falls with radius). A NONLOCAL gravitational kinetic term
// adds a long-range (infrared) piece to the propagator, here modelled as a 1/L^2
// component, which makes the potential fall more slowly and FLATTENS the rotation
// curve, the signature attributed to dark matter, with no dark particle added. We
// solve the modified Poisson equation by conjugate gradient and read off the
// rotation curve. See note/questions/frontiers.md (dark matter route 1).
// Run: npx tsx code/experiment/p18-dark-matter.ts

import { pathToFileURL } from 'node:url'
import { cubicLattice } from '~/experiment/p16-newtonian'

function applyLaplacian(neighbors: number[][], x: Float64Array, out: Float64Array): void {
  for (let i = 0; i < x.length; i++) {
    const row = neighbors[i] ?? []
    let v = row.length * (x[i] ?? 0)
    for (const j of row) {
      v -= x[j] ?? 0
    }
    out[i] = v
  }
}

function subtractMean(x: Float64Array): void {
  let m = 0
  for (let i = 0; i < x.length; i++) {
    m += x[i] ?? 0
  }
  m /= x.length
  for (let i = 0; i < x.length; i++) {
    x[i] = (x[i] ?? 0) - m
  }
}

function dot(a: Float64Array, b: Float64Array): number {
  let s = 0
  for (let i = 0; i < a.length; i++) {
    s += (a[i] ?? 0) * (b[i] ?? 0)
  }
  return s
}

// Solve L phi = b (zero-mean) by conjugate gradient, projecting out the constant.
function cgSolve(neighbors: number[][], b: Float64Array): Float64Array {
  const n = b.length
  const phi = new Float64Array(n)
  const r = new Float64Array(b)
  subtractMean(r)
  const p = new Float64Array(r)
  const tmp = new Float64Array(n)
  let rs = dot(r, r)
  for (let it = 0; it < 5 * n; it++) {
    applyLaplacian(neighbors, p, tmp)
    subtractMean(tmp)
    const alpha = rs / Math.max(dot(p, tmp), 1e-300)
    for (let i = 0; i < n; i++) {
      phi[i] = (phi[i] ?? 0) + alpha * (p[i] ?? 0)
      r[i] = (r[i] ?? 0) - alpha * (tmp[i] ?? 0)
    }
    const rsNew = dot(r, r)
    if (rsNew < 1e-18) {
      break
    }
    const beta = rsNew / rs
    for (let i = 0; i < n; i++) {
      p[i] = (r[i] ?? 0) + beta * (p[i] ?? 0)
    }
    rs = rsNew
  }
  subtractMean(phi)
  return phi
}

// Rotation curve v^2(r) = r * |dphi/dr| from the modified potential phi = L^-1 b +
// w * L^-2 b of a central point source.
export function rotationCurve(input: { side: number; nonlocal: number }): { r: number[]; v2: number[]; outerSlope: number; flatnessRatio: number } {
  const lat = cubicLattice(input.side, 3)
  const n = lat.size
  const mid = Math.floor(input.side / 2)
  const center = mid + input.side * (mid + input.side * mid)
  const b = new Float64Array(n).fill(-1 / n)
  b[center] = 1 - 1 / n
  const phi1 = cgSolve(lat.neighbors, b)
  const phi = new Float64Array(n)
  if (input.nonlocal !== 0) {
    const phi2 = cgSolve(lat.neighbors, phi1) // L^-2 b
    for (let i = 0; i < n; i++) {
      phi[i] = (phi1[i] ?? 0) + input.nonlocal * (phi2[i] ?? 0)
    }
  } else {
    for (let i = 0; i < n; i++) {
      phi[i] = phi1[i] ?? 0
    }
  }
  // Bin the potential by distance from the center.
  const cx = mid
  const maxR = input.side / 2 - 1
  const bins = Math.floor(maxR)
  const sum = new Float64Array(bins + 1)
  const cnt = new Int32Array(bins + 1)
  for (let i = 0; i < n; i++) {
    const x = (lat.coords[i * 3] ?? 0) - cx
    const y = (lat.coords[i * 3 + 1] ?? 0) - cx
    const z = (lat.coords[i * 3 + 2] ?? 0) - cx
    const d = Math.sqrt(x * x + y * y + z * z)
    const bin = Math.round(d)
    if (bin >= 1 && bin <= bins) {
      sum[bin] = (sum[bin] ?? 0) + (phi[i] ?? 0)
      cnt[bin] = (cnt[bin] ?? 0) + 1
    }
  }
  const r: number[] = []
  const phiR: number[] = []
  for (let bn = 1; bn <= bins; bn++) {
    if ((cnt[bn] ?? 0) > 0) {
      r.push(bn)
      phiR.push((sum[bn] ?? 0) / (cnt[bn] ?? 1))
    }
  }
  // v^2(r) = r * |dphi/dr| (circular-orbit speed squared).
  const rr: number[] = []
  const v2: number[] = []
  for (let k = 1; k < r.length - 1; k++) {
    const dphi = ((phiR[k + 1] ?? 0) - (phiR[k - 1] ?? 0)) / ((r[k + 1] ?? 1) - (r[k - 1] ?? 1))
    rr.push(r[k] ?? 0)
    v2.push((r[k] ?? 0) * Math.abs(dphi))
  }
  // Slope of v^2 over the outer half (negative = Keplerian decline, near zero = flat).
  const half = Math.floor(rr.length / 2)
  const ox = rr.slice(half)
  const oy = v2.slice(half)
  const mx = ox.reduce((a, b2) => a + b2, 0) / Math.max(1, ox.length)
  const my = oy.reduce((a, b2) => a + b2, 0) / Math.max(1, oy.length)
  let cov = 0
  let varx = 0
  for (let i = 0; i < ox.length; i++) {
    cov += ((ox[i] ?? 0) - mx) * ((oy[i] ?? 0) - my)
    varx += ((ox[i] ?? 0) - mx) * ((ox[i] ?? 0) - mx)
  }
  // Flatness ratio: mean v^2 over the outer third versus the inner third. Below one
  // is a Keplerian decline, at or above one is a flat (or rising) curve.
  const third = Math.max(1, Math.floor(v2.length / 3))
  const innerMean = v2.slice(0, third).reduce((a, b2) => a + b2, 0) / third
  const outerMean = v2.slice(v2.length - third).reduce((a, b2) => a + b2, 0) / third
  const flatnessRatio = innerMean > 0 ? outerMean / innerMean : 0
  return { r: rr, v2, outerSlope: varx === 0 ? 0 : cov / varx, flatnessRatio }
}

export function main(): void {
  console.log('P18: dark matter from nonlocal gravity (flat rotation curves, no dark particle)')
  console.log('')
  for (const w of [0, 1.5]) {
    const r = rotationCurve({ side: 27, nonlocal: w })
    const label = w === 0 ? 'Newtonian (local gravity)' : `nonlocal gravity (1/L^2 weight ${w})`
    console.log(`  ${label}:`)
    console.log('    r:    ' + r.r.map((x) => x.toFixed(0).padStart(5)).join(''))
    console.log('    v^2:  ' + r.v2.map((x) => x.toFixed(2).padStart(5)).join(''))
    console.log(`    outer/inner v^2 ratio ${r.flatnessRatio.toFixed(2)} (below 1 = Keplerian decline, at or above 1 = flat or rising)`)
    console.log('')
  }
  console.log('  With local (Newtonian) gravity the rotation curve falls with radius, the')
  console.log('  Keplerian decline. With a nonlocal (infrared-enhanced) gravitational kinetic')
  console.log('  term the curve FLATTENS, the signature attributed to dark matter, produced here')
  console.log('  with no dark particle, purely from a modification of gravity at long range.')
  console.log('  Honest note: this shows the mechanism and the flattening. Whether the nonlocal')
  console.log('  scale lands at galactic radii (true MOND phenomenology) is a separate question.')
}

if (
  process.argv[1] !== undefined &&
  import.meta.url === pathToFileURL(process.argv[1]).href
) {
  main()
}
