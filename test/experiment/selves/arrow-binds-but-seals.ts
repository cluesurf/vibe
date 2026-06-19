// The bind-radiate tradeoff, measured on one test. This is the capstone of the arrow-as-binding exploration. A
// self needs a body that is BOUND (stays localized, a restoring identity) AND that RADIATES a disturbance to the
// bath (heals). We test the two committed rules on the SAME zero-momentum body with the SAME body-hit (a flip of
// the body's own charges) and the SAME bath (an absorbing boundary).
//
//   - pairCollision is the ARROW (the create move, the active vacuum). It BINDS, a zero-momentum body stays
//     localized (its net-charge rms barely grows), the arrow genuinely holds a free body, not just rigid walls.
//     But it SEALS, the body-hit disturbance is pinned (the dark cone), it does not reach the bath, so the open
//     lattice does NOT heal (the difference stays at its peak).
//   - headOnRotate is the MOMENTUM rule. It RADIATES, the body-hit disturbance streams to the boundary and is
//     absorbed (the open difference falls to zero). But it does NOT BIND, the zero-momentum body disperses (its
//     rms grows large), it only recurs as a reversible artifact, there is no restoring identity.
//
// So binding and radiation are satisfied by DISJOINT rules. The arrow's binding IS pinning, and pinning is exactly
// what seals radiation. Relaxing the pin to let radiation out (the hop-off of bindAndMove, or a density-gated
// hybrid) makes the body ERODE and disperse instead (verified in probes, the core streams once its density drops).
// No single committed reversible local rule both binds and radiates. The bound body is therefore not a base object,
// it is emergent (the oscillator-bath effective theory), exactly as the layered picture concludes.
//
// Depth L2, the bind-radiate tradeoff, the arrow binds but seals, the momentum rule radiates but will not bind.

import { experiment } from '@/test/scaffold/suite'
import { verdict } from '@/test/scaffold/verdict'
import { d4Mesh, type Mesh } from '@/code/tool/mesh'
import { makeWill, cloneWill, type Will } from '@/code/tone/will'
import {
  pairCollision,
  headOnRotate,
  type Collision,
} from '@/code/rule/collision'
import { beatInto, streamSourceTable } from '@/code/rule/lattice-gas'
import { absorbBoundary } from '@/code/dynamics/bath'

export default experiment({
  id: 'selves/arrow-binds-but-seals',
  title:
    'the arrow binds a body but seals radiation, the momentum rule radiates but will not bind, binding and radiation are disjoint',
  category: 'selves',
  substrates: ['3434'],
  depth: 'L2',
  paper: true,
  run() {
    const side = 20
    const beats = 60
    const mesh: Mesh = d4Mesh({ side })
    const degree = mesh.degree
    const opposite = Array.from({ length: degree }, (_, d) =>
      mesh.opposite(d),
    )

    const table = streamSourceTable(mesh) // precompute the stream gather once, reused for every beat
    const half = side / 2
    const coord = (c: number): [number, number, number, number] => [
      c % side,
      Math.floor(c / side) % side,
      Math.floor(c / (side * side)) % side,
      Math.floor(c / (side * side * side)) % side,
    ]

    const lines: Array<[number, number]> = []

    for (let d = 0; d < degree; d++) {
      const o = opposite[d]!

      if (d < o) {
        lines.push([d, o])
      }
    }

    const center =
      half +
      half * side +
      half * side * side +
      half * side * side * side

    // a zero-momentum net-+ body (both ends of six lines filled, so net momentum is zero and any localization is
    // genuine binding, not ballistic drift).
    const body = (): Will => {
      const will = makeWill(mesh)

      for (let c = 0; c < mesh.cellCount; c++) {
        const [x, y, z, w] = coord(c)

        if (
          (x - half) ** 2 +
            (y - half) ** 2 +
            (z - half) ** 2 +
            (w - half) ** 2 <=
          4
        ) {
          const b = c * degree

          for (let i = 0; i < 6; i++) {
            const [a, zz] = lines[i]!
            will.data[b + a] = 1
            will.data[b + zz] = 1
          }
        }
      }

      return will
    }

    // a hit to the body's OWN charges at the centre (flip them), a real net-charge disturbance to the body itself.
    const hit = (w0: Will): Will => {
      const w = cloneWill(w0)

      for (let i = 0; i < 6; i++) {
        const [a, zz] = lines[i]!
        w.data[center * degree + a] = -1
        w.data[center * degree + zz] = -1
      }

      return w
    }

    // net-charge rms, the body's size (the vacuum churn is net-zero, so net charge sees the body through it).
    const netRms = (will: Will): number => {
      let total = 0,
        sx = 0,
        sy = 0,
        sz = 0,
        sw = 0

      const q: number[] = []

      for (let c = 0; c < mesh.cellCount; c++) {
        let n = 0

        const b = c * degree

        for (let d = 0; d < degree; d++) {
          n += will.data[b + d]!
        }

        q[c] = n

        if (n > 0) {
          const [x, y, z, w] = coord(c)
          total += n
          sx += n * x
          sy += n * y
          sz += n * z
          sw += n * w
        }
      }

      if (total === 0) {
        return 0
      }

      const mx = sx / total,
        my = sy / total,
        mz = sz / total,
        mw = sw / total

      let v = 0

      for (let c = 0; c < mesh.cellCount; c++) {
        const n = q[c]!

        if (n > 0) {
          const [x, y, z, w] = coord(c)
          v +=
            n *
            ((x - mx) ** 2 +
              (y - my) ** 2 +
              (z - mz) ** 2 +
              (w - mw) ** 2)
        }
      }

      return Math.sqrt(v / total)
    }

    const measure = (
      rule: Collision,
    ): { rmsMax: number; openFinal: number; closedFinal: number } => {
      let bd = body()
      let rmsMax = netRms(bd)
      let bdScratch: Will = {
        mesh,
        data: new Int8Array(bd.data.length),
      }

      for (let i = 0; i < beats; i++) {
        beatInto({ src: bd, dst: bdScratch, table, collision: rule })
        const swap = bd
        bd = bdScratch
        bdScratch = swap
        const r = netRms(bd)

        if (r > rmsMax) {
          rmsMax = r
        }
      }

      const trace = (open: boolean): number => {
        let clean = body()
        let pert = hit(body())
        let final = 0
        let cleanScratch: Will = {
          mesh,
          data: new Int8Array(clean.data.length),
        }

        let pertScratch: Will = {
          mesh,
          data: new Int8Array(pert.data.length),
        }

        for (let i = 0; i < beats; i++) {
          beatInto({
            src: clean,
            dst: cleanScratch,
            table,
            collision: rule,
          })
          const cs = clean
          clean = cleanScratch
          cleanScratch = cs
          beatInto({
            src: pert,
            dst: pertScratch,
            table,
            collision: rule,
          })
          const ps = pert
          pert = pertScratch
          pertScratch = ps

          if (open) {
            absorbBoundary(clean)
            absorbBoundary(pert)
          }

          let d = 0

          for (let k = 0; k < clean.data.length; k++) {
            if (clean.data[k] !== pert.data[k]) {
              d++
            }
          }

          final = d
        }

        return final
      }

      return {
        rmsMax,
        openFinal: trace(true),
        closedFinal: trace(false),
      }
    }

    const arrow = measure(pairCollision({ opposite, forward: true }))
    const momentum = measure(headOnRotate({ opposite }))

    // the arrow BINDS (small rms) but SEALS (open difference not healed, it stays near the closed value).
    const arrowBinds = arrow.rmsMax <= 4
    const arrowSeals =
      arrow.openFinal >= arrow.closedFinal * 0.5 && arrow.openFinal > 0

    // the momentum rule RADIATES (open difference healed to near zero) but does NOT BIND (rms disperses large).
    const momentumRadiates =
      momentum.openFinal <= momentum.closedFinal * 0.1

    const momentumNoBind = momentum.rmsMax >= 8

    const ok =
      arrowBinds && arrowSeals && momentumRadiates && momentumNoBind

    return verdict({
      status: ok ? 'pass' : 'fail',
      claim:
        'binding and radiation are disjoint in the committed reversible rules, the arrow (pairCollision, the create move) BINDS a free zero-momentum body (its net-charge rms barely grows) but SEALS a body-hit disturbance (it is pinned in the dark cone and the open lattice does not heal), while the momentum rule (headOnRotate) RADIATES a body-hit (the open difference falls to zero at the bath) but does NOT bind (the body disperses and only recurs as a reversible artifact), the arrow binding IS pinning and pinning is what seals, relaxing the pin to let radiation out makes the body erode, so no single committed local rule both binds and radiates and the bound body is not a base object but an emergent one',
      metrics: {
        arrowBodyRmsMaxTimes10: Math.round(arrow.rmsMax * 10),
        arrowOpenFinal: arrow.openFinal,
        arrowClosedFinal: arrow.closedFinal,
        momentumBodyRmsMaxTimes10: Math.round(momentum.rmsMax * 10),
        momentumOpenFinal: momentum.openFinal,
        momentumClosedFinal: momentum.closedFinal,
        arrowBinds: arrowBinds ? 1 : 0,
        arrowSeals: arrowSeals ? 1 : 0,
        momentumRadiates: momentumRadiates ? 1 : 0,
        momentumNoBind: momentumNoBind ? 1 : 0,
      },
      control: {
        arrowOpenFinal: arrow.openFinal,
        momentumOpenFinal: momentum.openFinal,
      },
      notes:
        'the capstone of the arrow-binding exploration. The arrow DOES bind a free body (a real positive, beyond the rigid-wall Casimir result), but its binding is pinning, which seals radiation. The momentum rule radiates but cannot bind. A density-gated hybrid (pin dense, stream sparse) does not rescue it, the core erodes once its density drops. So the bound body is emergent, not a base rule, consistent with the-self-in-layers and the pure-base-no-selves finding',
    })
  },
})
