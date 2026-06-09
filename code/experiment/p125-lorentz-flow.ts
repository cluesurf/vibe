// P125: does the residual lattice anisotropy SHRINK with scale (Lorentz restoration)? (P124.)
//
// P124 showed the one-step diffusion tensor is isotropic (rank-2). But the regular lattice can still be
// anisotropic at HIGHER order (the measure/lorentz sprinkling test). The question for emergent Lorentz:
// does that higher-order anisotropy wash out as a charge propagates over more steps (coarse time)? The
// central limit theorem says it should, an isotropic rank-2 step drives the multi-step distribution toward
// an isotropic Gaussian, killing higher cumulants.
//
// We measure the ANGULAR anisotropy at orders 2, 4, 6, that is the spread of <(n.u)^p> over many axes u,
// where n is the charge's direction from the ball origin (directions are conformally faithful from the
// origin, so no Poincare distortion). We do it after 1, 2, 4, 8 steps and check the higher-order
// anisotropy decreases. Run: npx tsx code/experiment/p125-lorentz-flow.ts

import { pathToFileURL } from 'node:url'
import { buildCellGraph } from '~/substrate/coxeter/cell-direct'
import { makeRng } from '~/tool/rng'

type Rng = { next: () => number }

export function lorentzFlow(input?: { maxCells?: number; runs?: number }): {
  cellCount: number
  steps: number[]
  a2: number[]
  a4: number[]
  a6: number[]
  a4Shrinks: boolean
  a6Shrinks: boolean
  rank2AtFloor: boolean
  solved: boolean
} {
  const maxCells = input?.maxCells ?? 9000
  const runs = input?.runs ?? 6000
  const g = buildCellGraph({ symbol: [5, 3, 4], maxCells })
  const N = g.cellCount
  const r2 = (i: number): number => g.coords[i]!.reduce((s, x) => s + x * x, 0)
  let origin = 0
  for (let i = 1; i < N; i++) if (r2(i) < r2(origin)) origin = i
  const c0 = g.coords[origin]!

  // a fixed set of probe axes (unit vectors): coordinate axes plus random directions
  const axRng = makeRng({ seed: 1 })
  const axes: number[][] = [
    [1, 0, 0],
    [0, 1, 0],
    [0, 0, 1],
  ]
  for (let a = 0; a < 40; a++) {
    let x = axRng.next() * 2 - 1
    let y = axRng.next() * 2 - 1
    let z = axRng.next() * 2 - 1
    const len = Math.hypot(x, y, z) || 1
    x /= len
    y /= len
    z /= len
    axes.push([x, y, z])
  }

  // anisotropy of <(n.u)^p> across axes, given a list of unit directions
  const anisotropyAtOrder = (dirs: number[][], p: number): number => {
    const vals = axes.map((u) => {
      let s = 0
      for (const n of dirs) {
        const dot = n[0]! * u[0]! + n[1]! * u[1]! + n[2]! * u[2]!
        s += Math.pow(dot, p)
      }
      return s / dirs.length
    })
    const mn = Math.min(...vals)
    const mx = Math.max(...vals)
    const mean = vals.reduce((a, b) => a + b, 0) / vals.length
    return mean > 0 ? (mx - mn) / mean : 0
  }

  const steps = [1, 2, 4, 8]
  const a2: number[] = []
  const a4: number[] = []
  const a6: number[] = []
  for (const k of steps) {
    const dirs: number[][] = []
    for (let run = 0; run < runs; run++) {
      // single charge random walk from the origin cell for k steps
      let cur = origin
      const rng = makeRng({ seed: 7000 + run * 17 + k })
      for (let t = 0; t < k; t++) {
        const nbrs = g.neighbors[cur]!
        cur = nbrs[Math.floor(rng.next() * nbrs.length)]!
      }
      const d = [g.coords[cur]![0]! - c0[0]!, g.coords[cur]![1]! - c0[1]!, g.coords[cur]![2]! - c0[2]!]
      const len = Math.hypot(d[0]!, d[1]!, d[2]!)
      if (len < 1e-9) continue
      dirs.push([d[0]! / len, d[1]! / len, d[2]! / len])
    }
    a2.push(anisotropyAtOrder(dirs, 2))
    a4.push(anisotropyAtOrder(dirs, 4))
    a6.push(anisotropyAtOrder(dirs, 6))
  }

  // Lorentz restoration: the higher-order angular anisotropy (rank-4 and rank-6) shrinks with scale,
  // while rank-2 already sits at the measurement floor (icosahedral isotropy at leading order)
  const a4Shrinks = a4[a4.length - 1]! < a4[0]! * 0.8
  const a6Shrinks = a6[a6.length - 1]! < a6[0]! * 0.8
  const rank2AtFloor = Math.max(...a2) < 0.12
  const solved = a4Shrinks && a6Shrinks && rank2AtFloor

  return { cellCount: N, steps, a2, a4, a6, a4Shrinks, a6Shrinks, rank2AtFloor, solved }
}

export function main(): void {
  const r = lorentzFlow()
  console.log('P125: Lorentz restoration, does higher-order anisotropy shrink with scale')
  console.log('')
  console.log(`  ${r.cellCount.toLocaleString()} cells (float {5,3,4} ball), angular anisotropy vs number of steps`)
  console.log('')
  console.log('  steps:  ' + r.steps.map((s) => String(s).padStart(7)).join(''))
  console.log('  rank-2: ' + r.a2.map((a) => a.toFixed(3).padStart(7)).join(''))
  console.log('  rank-4: ' + r.a4.map((a) => a.toFixed(3).padStart(7)).join(''))
  console.log('  rank-6: ' + r.a6.map((a) => a.toFixed(3).padStart(7)).join(''))
  console.log('')
  console.log(`  rank-2 already at the floor (icosahedral leading-order isotropy): ${r.rank2AtFloor}`)
  console.log(`  rank-4 anisotropy shrinks with scale: ${r.a4Shrinks}`)
  console.log(`  rank-6 anisotropy shrinks with scale: ${r.a6Shrinks}`)
  console.log(`  => higher-order anisotropy washes out with coarse-graining: rotational Lorentz RESTORES: ${r.solved}`)
  console.log(`  SOLVED: ${r.solved}`)
}

if (process.argv[1] !== undefined && import.meta.url === pathToFileURL(process.argv[1]).href) {
  main()
}
