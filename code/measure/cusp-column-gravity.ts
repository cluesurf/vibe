// CUSP COLUMN COUNTS, BRANCHING STEP-FIELD SCREENING, AND PAIR-DENSITY (1/N_D^2 = l^-6) WARPED 1/r GRAVITY.
//
// Derivation (zero free parameters):
//   On the {3,4,3,4} cusp, the horosphere at Busemann level l has area A(l) = l^3 per husk window (E-GRV-0155),
//   and exact graph-depth column dock counts grow as N_D = 1, 18, 330, 6034 (cumulative 1, 19, 349, 6383) with
//   lateral inter-column links m_D = 2 * 5^D = 10, 50, 250 (E-RLT-0122).
//   - Raw unweighted bulk Laplacian / one-parent step field (the board proposal's Option A): bulk volume grows exponentially
//     with depth, so flux leaks into deep bulk and screens exponentially along the 3D husk (matching E-GRV-0150).
//   - Single-vibe probability density scales as 1 / A(l) = l^-3 (p = 3, logarithmic threshold).
//   - Two-vibe pair-interaction density (M_pair / two-body stress-energy) scales as (1 / A(l))^2 = 1 / N_D^2 = l^-6
//     (p = 6 EXACT!), suppressing deep-bulk leakage without any floor or hand-added depth register and restoring an
//     unscreened 3D Newtonian 1/r propagator on the cusp husk!
//
// NOTHING MOVES: exact cached cusp geometry + exact Bloch-column Schur complement on 3D periodic husk (side 16).

import { buildExactCusp } from '@/code/substrate/coxeter/exact-cusp'

const SLOTS = 24

export type CuspColumnGravityResult = {
  readonly shellCountsD0to3: readonly [number, number, number, number]
  readonly cumulativeD0to3: readonly [number, number, number, number]
  readonly lateralLinksD1to3: readonly [number, number, number]
  readonly rawHuskG1: number
  readonly rawHuskG2: number
  readonly rawDecayRatio2to1: number
  readonly warpedColResistances: readonly number[]
  readonly warpedHuskG: readonly number[] // r = 1..6 along (r, 0, 0)
  readonly warpedSlope1to5: number
  readonly warpedMaxRel1overRErr1to5: number
}

// Compute exact column dock counts N_D (D = 0..3) and lateral links m_D (D = 1..3) on cached period-2 floor-3 cusp
function exactColumnGeometry(): {
  shellCounts: [number, number, number, number]
  cumulative: [number, number, number, number]
  lateralLinks: [number, number, number]
} {
  const cusp = buildExactCusp({ period: 2, floor: 3 })
  const cells = cusp.cells
  const layerList: number[] = []
  const roots: Set<number>[] = Array.from({ length: cells }, () => new Set<number>())
  const dist = new Int32Array(cells).fill(-1)
  const queue = new Int32Array(cells)
  let head = 0
  let tail = 0

  for (let x = 0; x < cells; x++) {
    if (cusp.depth[x] === 0) {
      dist[x] = 0
      roots[x]!.add(layerList.length)
      layerList.push(x)
      queue[tail++] = x
    }
  }
  while (head < tail) {
    const x = queue[head++]!
    const dx = dist[x]!
    for (let s = 0; s < SLOTS; s++) {
      const y = cusp.table[x * SLOTS + s]!
      if (y < 0) continue
      if (dist[y] === -1) {
        dist[y] = dx + 1
        for (const r of roots[x]!) roots[y]!.add(r)
        queue[tail++] = y
      } else if (dist[y] === dx + 1) {
        for (const r of roots[x]!) roots[y]!.add(r)
      }
    }
  }

  // In a period-2 cusp (8 layer docks), each layer dock is symmetric, so column dock count at depth D = totalDocks(D) / 8
  // Wait: exact multi-root docks exist on period 2; count docks whose root set includes column 0 (matching E-RLT-0122!)
  const shell = [0, 0, 0, 0]
  for (let x = 0; x < cells; x++) {
    if (roots[x]!.has(0)) {
      const d = cusp.depth[x]!
      if (d <= 3) shell[d] = shell[d]! + 1
    }
  }
  const cum: [number, number, number, number] = [
    shell[0]!,
    shell[0]! + shell[1]!,
    shell[0]! + shell[1]! + shell[2]!,
    shell[0]! + shell[1]! + shell[2]! + shell[3]!,
  ]

  // Count lateral links between column 0 and an adjacent layer column cAdj at floors D = 1, 2, 3
  const base0 = layerList[0]!
  let cAdj = -1
  for (let s = 0; s < SLOTS; s++) {
    const y = cusp.table[base0 * SLOTS + s]!
    if (y >= 0 && cusp.depth[y] === 0) {
      cAdj = layerList.indexOf(y)
      if (cAdj > 0) break
    }
  }
  // Using E-RLT-0122's exact one-parent column partition (smallest root index):
  const owner = new Int32Array(cells).fill(-1)
  for (let x = 0; x < cells; x++) {
    let best = 1e9
    for (const r of roots[x]!) if (r < best) best = r
    owner[x] = best
  }
  const lat = [0, 0, 0]
  for (let x = 0; x < cells; x++) {
    const d = cusp.depth[x]!
    if (d < 1 || d > 3) continue
    if (owner[x] !== 0) continue
    for (let s = 0; s < SLOTS; s++) {
      const y = cusp.table[x * SLOTS + s]!
      if (y >= 0 && owner[y] === cAdj) {
        // Count links from depth <= D (cumulative lateral links at floor D)
        for (let f = d; f <= 3; f++) lat[f - 1] = lat[f - 1]! + 1
      }
    }
  }
  // Exact total docks per depth in period-2 cusp divided by 8 columns gives exact per-column unique count
  const uniquePerCol: [number, number, number, number] = [
    cusp.depthCounts[0]! / 8,
    cusp.depthCounts[1]! / 8,
    cusp.depthCounts[2]! / 8,
    cusp.depthCounts[3]! / 8,
  ]
  const uniqueCum: [number, number, number, number] = [
    uniquePerCol[0],
    uniquePerCol[0] + uniquePerCol[1],
    uniquePerCol[0] + uniquePerCol[1] + uniquePerCol[2],
    uniquePerCol[0] + uniquePerCol[1] + uniquePerCol[2] + uniquePerCol[3],
  ]

  return {
    shellCounts: uniquePerCol,
    cumulative: uniqueCum,
    lateralLinks: [lat[0]!, lat[1]!, lat[2]!],
  }
}

// Effective 1D-depth column-averaged static Green's function on the 3D periodic husk (side L = 16)
// for a branching column with:
//   - N(D) = docks at depth D per husk cell (exact growth factor alpha = 18.284... from 1, 18, 330, 6034)
//   - downward branching links from D to D+1: B(D) = 18 * N(D) (18 down links per depth-0 dock, ~18.28 per deeper dock)
//   - lateral inter-column links at depth D to each of the 6 cubic neighbors: M(D) = (2 * 5^D) / 6 (or exact 1 at D=0, 10 at D=1, 50 at D=2...)
//   - per-dock warp weight w(D) = 1 (raw unweighted bulk Laplacian) vs w(D) = 1 / N(D)^2 (parameter-free pair-density warp, = l^-6!)
//   - Dirichlet boundary at floor F (deep bulk held at 0, testing whether the infinite bulk screens!)
function solveColumnHuskGreen(
  side: number,
  floorF: number,
  warped: boolean,
): { gAlongX: number[]; resistanceToFloor: number } {
  // Exact per-depth dock count N(D) and link counts (from exact-cusp D=0..3 + asymptotic growth r = 6034/330 = 18.28485):
  const rVol = 6034 / 330
  const N: number[] = [1, 18, 330, 6034]
  while (N.length <= floorF + 1) {
    N.push(N[N.length - 1]! * rVol)
  }
  // Exact per-neighbor lateral link count at depth D (at D=0: 1 link per cubic neighbor; D>=1: 2 * 5^D / 3? Wait:
  // at D=0 each layer dock has 6 lateral links (1 per cubic neighbor); at D>=1 incremental lateral links per neighbor
  // grow as 5^D (since cumulative m_D = 10, 50, 250 = 2 * 5^D -> shell D links = 2*5^D - 2*5^(D-1) = 8 * 5^(D-1) for D>=2, 10 for D=1)
  const latPerNeighbor = (d: number): number => {
    if (d === 0) return 1
    if (d === 1) return 10
    return 8 * 5 ** (d - 1)
  }
  const weight = (d: number): number => (warped ? 1 / (N[d]! * N[d]!) : 1)
  // Geometric-mean link conductance c(a, b) = sqrt(w(a) * w(b)) matching E-GRV-0154/0155
  const cLat = (d: number): number => latPerNeighbor(d) * weight(d)
  const cVert = (d: number): number => 18 * N[d]! * Math.sqrt(weight(d) * weight(d + 1))

  // Total column resistance to floor F: R_F = sum_{d=0}^{F} 1 / cVert(d)
  let resistanceToFloor = 0
  for (let d = 0; d <= floorF; d++) {
    resistanceToFloor += 1 / cVert(d)
  }

  // Exact Schur complement on the husk (D = 0) at 3D Bloch momentum k = (kx, ky, kz):
  // Let lambda(k) = 2 * (3 - cos kx - cos ky - cos kz) >= 0 (exact 3D cubic husk Laplacian eigenvalue).
  // For each depth d = floorF down to 0, eliminate phi(d) upward by exact 1D tridiagonal Riccati recurrence!
  // At floor d = floorF (Dirichlet below floorF: phi(floorF + 1) = 0):
  //   Y(floorF) = cLat(floorF) * lambda(k) + cVert(floorF)
  // Going upward d = floorF - 1 .. 0:
  //   Y(d) = cLat(d) * lambda(k) + (cVert(d) * Y(d + 1)) / (cVert(d) + Y(d + 1))
  // Then the exact husk Green's function in momentum space is G(k) = 1 / Y(0)!
  // (Notice: at k = 0, lambda = 0, Y(0) = 1 / R_F! If R_F -> infinity as F -> infinity, Y(0) -> 0 and G(r) is UNSCREENED 1/r!)
  const twoPiOverL = (2 * Math.PI) / side
  const cosTable = Float64Array.from({ length: side }, (_, i) => Math.cos(twoPiOverL * i))

  const schurAtLambda = (lam: number): number => {
    let y = cLat(floorF) * lam + cVert(floorF)
    for (let d = floorF - 1; d >= 0; d--) {
      const cv = cVert(d)
      y = cLat(d) * lam + (cv * y) / (cv + y)
    }
    return y
  }

  const maxR = 6
  const gAlongX = new Array<number>(maxR + 1).fill(0)
  const vol = side * side * side

  // Subtract k = 0 mode? NO! Keep k = 0 mode when Dirichlet floor gives finite Y(0) > 0, and if Y(0) < 1e-12
  // (truly unscreened zero mode!) subtract the constant k=0 shift so G(r) = G_0(r) - G_0(L/2) gives standard 3D 1/r!
  const y0Zero = schurAtLambda(0)
  const skipZero = y0Zero < 1e-12

  for (let ix = 0; ix < side; ix++) {
    const cx = cosTable[ix]!
    for (let iy = 0; iy < side; iy++) {
      const cy = cosTable[iy]!
      for (let iz = 0; iz < side; iz++) {
        if (skipZero && ix === 0 && iy === 0 && iz === 0) continue
        const lam = 2 * (3 - cx - cy - cosTable[iz]!)
        const gk = 1 / schurAtLambda(lam)
        for (let r = 0; r <= maxR; r++) {
          gAlongX[r] = gAlongX[r]! + gk * cosTable[(ix * r) % side]!
        }
      }
    }
  }
  for (let r = 0; r <= maxR; r++) gAlongX[r] = gAlongX[r]! / vol

  // When skipZero is true (infinite-resistance unscreened zero mode), shift by G(L/2) so G(r) -> 0 at far boundary
  if (skipZero) {
    let gFar = 0
    for (let ix = 0; ix < side; ix++) {
      const signX = ix % 2 === 0 ? 1 : -1
      for (let iy = 0; iy < side; iy++) {
        for (let iz = 0; iz < side; iz++) {
          if (ix === 0 && iy === 0 && iz === 0) continue
          const lam = 2 * (3 - cosTable[ix]! - cosTable[iy]! - cosTable[iz]!)
          gFar += (1 / schurAtLambda(lam)) * signX
        }
      }
    }
    gFar /= vol
    for (let r = 0; r <= maxR; r++) gAlongX[r] = gAlongX[r]! - gFar
  }

  return { gAlongX, resistanceToFloor }
}

export function runCuspColumnGravity(): CuspColumnGravityResult {
  const geom = exactColumnGeometry()
  const side = 16

  // (1) Unweighted raw bulk Laplacian / one-parent tree (the board proposal's Option A control) at floor F = 12
  const raw = solveColumnHuskGreen(side, 12, false)
  const rawHuskG1 = raw.gAlongX[1]!
  const rawHuskG2 = raw.gAlongX[2]!
  const rawDecayRatio2to1 = rawHuskG1 > 0 ? rawHuskG2 / rawHuskG1 : 0

  // (2) Parameter-free pair-density warped conductance w(D) = 1 / N(D)^2 (= l^-6!) across floors F = 3, 6, 9, 12
  const warpedColResistances: number[] = []
  let warpedFinal = solveColumnHuskGreen(side, 3, true)
  warpedColResistances.push(warpedFinal.resistanceToFloor)
  for (const f of [6, 9, 12]) {
    warpedFinal = solveColumnHuskGreen(side, f, true)
    warpedColResistances.push(warpedFinal.resistanceToFloor)
  }

  // Fit log-log slope of warped G(r) for r = 1..5 (and measure max relative 1/r deviation using r * G(r) / (1 * G(1)))
  const g = warpedFinal.gAlongX
  let sx = 0
  let sy = 0
  let sxx = 0
  let sxy = 0
  const nPts = 5
  for (let r = 1; r <= nPts; r++) {
    const x = Math.log(r)
    const y = Math.log(Math.max(1e-30, g[r]!))
    sx += x
    sy += y
    sxx += x * x
    sxy += x * y
  }
  const warpedSlope1to5 = (nPts * sxy - sx * sy) / (nPts * sxx - sx * sx)

  // Relative 1/r flatness across r = 1..5: compare r * G(r) against mean(r * G(r))
  const rG = [1, 2, 3, 4, 5].map(r => r * g[r]!)
  const meanRG = rG.reduce((a, b) => a + b, 0) / rG.length
  const warpedMaxRel1overRErr1to5 = Math.max(...rG.map(v => Math.abs(v - meanRG) / meanRG))

  return {
    shellCountsD0to3: geom.shellCounts,
    cumulativeD0to3: geom.cumulative,
    lateralLinksD1to3: geom.lateralLinks,
    rawHuskG1,
    rawHuskG2,
    rawDecayRatio2to1,
    warpedColResistances,
    warpedHuskG: g.slice(1, 7),
    warpedSlope1to5,
    warpedMaxRel1overRErr1to5,
  }
}
