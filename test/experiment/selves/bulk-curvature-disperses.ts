// Cusp versus bulk (the 0E question). Could the hyperbolic BULK curvature supply the binding a self needs, with no
// added field, closing the self at five things? No. Negative curvature DISPERSES, it does not bind. We measure the
// growth of a disturbance's reach (the shell sizes around a point) on a hyperbolic mesh (a Bethe tree, whose shells
// grow exponentially, the hallmark of negative curvature) versus the flat cusp (the D4 horosphere, whose shells
// grow polynomially). The hyperbolic shells grow EXPONENTIALLY, so a disturbance spreads into exponentially more
// space each step, the OPPOSITE of confinement (hyperbolic geometry is transient, things escape to infinity). So
// the bulk is a STRONGER BATH (radiation dilutes exponentially) but NOT a binder. The attraction must be added at
// the cusp (a field), it does not come free from bulk curvature.
//
// Depth L2, shell-growth on a hyperbolic tree versus the flat cusp, curvature disperses, it does not bind.

import { experiment } from '@/test/scaffold/suite'
import { verdict } from '@/test/scaffold/verdict'
import {
  betheMesh,
  d4Mesh,
  shellDistances,
  type Mesh,
} from '@/code/tool/mesh'

// the geometric-mean ratio of consecutive shell sizes over a mid-range of radii (how fast the reach grows).
function shellGrowthRatio(input: {
  mesh: Mesh
  source: number
  lo: number
  hi: number
}): number {
  const { mesh, source, lo, hi } = input
  const dist = shellDistances(mesh, source)
  const shell = new Map<number, number>()
  for (let c = 0; c < mesh.cellCount; c++) {
    const d = dist[c]!
    if (d >= 0) shell.set(d, (shell.get(d) ?? 0) + 1)
  }
  let logSum = 0
  let count = 0
  for (let r = lo; r < hi; r++) {
    const a = shell.get(r) ?? 0
    const b = shell.get(r + 1) ?? 0
    if (a > 0 && b > 0) {
      logSum += Math.log(b / a)
      count++
    }
  }
  return count > 0 ? Math.exp(logSum / count) : 0
}

export default experiment({
  id: 'selves/bulk-curvature-disperses',
  title:
    'bulk curvature disperses, it does not bind: hyperbolic shells grow exponentially, the flat cusp polynomially',
  category: 'selves',
  substrates: ['bethe', '3434'],
  depth: 'L2',
  paper: true,
  run() {
    // hyperbolic bulk, a Bethe tree (coordination 3), shells grow ~ coordination^r (exponential).
    const tree: Mesh = betheMesh({ coordination: 3, depth: 9 })
    const treeRatio = shellGrowthRatio({
      mesh: tree,
      source: 0,
      lo: 2,
      hi: 7,
    })

    // flat cusp, the D4 horosphere, shells grow ~ r^3 (polynomial), the ratio falls toward 1 with radius.
    const side = 16
    const flat: Mesh = d4Mesh({ side })
    const half = side / 2
    const center =
      half +
      half * side +
      half * side * side +
      half * side * side * side
    const flatRatio = shellGrowthRatio({
      mesh: flat,
      source: center,
      lo: 3,
      hi: 7,
    })

    // the hyperbolic shells grow exponentially (ratio near the coordination, well above 1), the flat shells grow
    // polynomially (ratio near 1, falling). So curvature disperses far faster, it cannot confine. PASS demonstrates
    // the cusp-versus-bulk resolution, the bulk is a stronger bath, not a binder.
    const bulkDispersesExponentially = treeRatio >= 2.5
    const cuspGrowsSlower = flatRatio < treeRatio * 0.75
    const ok = bulkDispersesExponentially && cuspGrowsSlower

    return verdict({
      status: ok ? 'pass' : 'fail',
      claim:
        'bulk hyperbolic curvature disperses rather than binds, the shell sizes around a point on a hyperbolic tree grow EXPONENTIALLY (the consecutive-shell ratio sits near the coordination number, far above one) while on the flat D4 cusp they grow POLYNOMIALLY (the ratio sits near one and falls with radius), so a disturbance on the curved bulk spreads into exponentially more space each step, the opposite of confinement, hyperbolic geometry is transient and things escape, therefore the bulk is a STRONGER BATH (radiation dilutes exponentially) but provides NO restoring force, the binding attraction must be added at the cusp (a field), it does not come free from bulk curvature',
      metrics: {
        bulkShellGrowthTimes100: Math.round(treeRatio * 100),
        cuspShellGrowthTimes100: Math.round(flatRatio * 100),
        bulkDispersesExponentially: bulkDispersesExponentially ? 1 : 0,
        cuspGrowsSlower: cuspGrowsSlower ? 1 : 0,
      },
      control: { cuspShellGrowthTimes100: Math.round(flatRatio * 100) },
      notes:
        'the cusp-versus-bulk resolution. Negative curvature is transient (exponential shells), so it disperses a structure faster, it cannot supply the restoring force a bound body needs. It does make a stronger bath (faster radiation). So 0E does not close the self at five things, the attraction must be added at the cusp (the discrete gravity field, the-discrete-gravity-field.md). Bulk curvature helps agency (radiation), not identity-binding',
    })
  },
})
