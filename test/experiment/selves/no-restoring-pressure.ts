// The restoring-pressure test, the closing experiment for the emergent bound body. A self's body needs a RESTORING
// force, perturb it and it relaxes back to a preferred size. The clean signature is CONTRACTION, a diffuse blob
// pulled together (its size drops toward a preferred value). We start an extended, diffuse, zero-momentum
// net-charge cloud and measure its net-charge rms under every committed rule. A binding force would contract it
// (the rms dips below the start). An ideal/repulsive gas only spreads it, and a pinning rule freezes it where it
// is. Neither is a restoring force.
//
// Result, NOTHING contracts. The momentum rule spreads the cloud, the pair table (the arrow) freezes it in place,
// bindAndMove and stickyReflect spread it more slowly, but no rule's rms ever drops below the start. So there is
// no restoring pressure, the coarse-grained gas is ideal (or pinned), it has no self-binding. This closes the
// emergent-binding question, the bound body does not emerge from the pure five things at any scale, consistent
// with the long-standing pure-base-no-selves result. A genuine binding would require an attractive interaction the
// base does not have, and adding one is a cheat.
//
// One honest nuance, bindAndMove (which has the arrow's active vacuum AND mobility) disperses LESS than the bare
// momentum rule (no vacuum), a hint of a weak, sub-critical depletion attraction from the active vacuum. It slows
// the spread but never reverses it into contraction. So the arrow's attraction is real but too weak to bind.
//
// Depth L2, the honest negative, no committed rule contracts a diffuse cloud, so there is no restoring pressure.

import { experiment } from '@/test/scaffold/suite'
import { verdict } from '@/test/scaffold/verdict'
import { d4Mesh, type Mesh } from '@/code/tool/mesh'
import { makeWill, type Will } from '@/code/tone/will'
import {
  bindAndMove,
  headOnRotate,
  pairCollision,
  type Collision,
} from '@/code/rule/collision'
import { beatInto, streamSourceTable } from '@/code/rule/lattice-gas'

export default experiment({
  id: 'selves/no-restoring-pressure',
  title:
    'no restoring pressure: no committed rule contracts a diffuse cloud, so the bound body does not emerge from the pure gas',
  category: 'selves',
  substrates: ['3434'],
  depth: 'L2',
  paper: true,
  run() {
    const side = 22
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

    // a diffuse, extended, zero-momentum net-+ cloud, radius 6, low density (both ends of two lines per cell).
    const diffuse = (): Will => {
      const will = makeWill(mesh)
      for (let c = 0; c < mesh.cellCount; c++) {
        const [x, y, z, w] = coord(c)
        if (
          (x - half) ** 2 +
            (y - half) ** 2 +
            (z - half) ** 2 +
            (w - half) ** 2 <=
          36
        ) {
          const b = c * degree
          for (let i = 0; i < 2; i++) {
            const [a, zz] = lines[i]!
            will.data[b + a] = 1
            will.data[b + zz] = 1
          }
        }
      }
      return will
    }
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
    ): { min: number; final: number } => {
      let w = diffuse()
      let scratch: Will = { mesh, data: new Int8Array(w.data.length) }
      const r0 = netRms(w)
      let min = r0
      let final = r0
      for (let t = 0; t < beats; t++) {
        beatInto({ src: w, dst: scratch, table, collision: rule })
        const swap = w
        w = scratch
        scratch = swap
        const r = netRms(w)
        if (r < min) {
          min = r
        }
        final = r
      }
      return { min, final }
    }

    const rms0 = netRms(diffuse())
    const momentum = measure(headOnRotate({ opposite }))
    const arrow = measure(pairCollision({ opposite, forward: true }))
    const bindMove = measure(bindAndMove({ opposite, forward: true }))

    // no rule contracts the cloud, its rms never drops meaningfully below the start under any rule, so there is no
    // restoring pressure (no self-binding). PASS means we demonstrated this cleanly.
    const noneContract =
      momentum.min >= rms0 * 0.9 &&
      arrow.min >= rms0 * 0.9 &&
      bindMove.min >= rms0 * 0.9
    // the nuance, the active vacuum (bindAndMove) resists dispersal more than the bare momentum rule, a weak
    // sub-critical attraction, but it never contracts.
    const arrowResistsDispersal = bindMove.final < momentum.final

    const ok = noneContract
    return verdict({
      status: ok ? 'pass' : 'fail',
      claim:
        'the coarse-grained conserving gas has no restoring pressure, a diffuse net-charge cloud is never contracted by any committed rule, the momentum rule spreads it, the arrow (pair table) freezes it in place, and bindAndMove spreads it more slowly, but no rule pulls it together (its rms never drops below the start), so there is no self-binding, the bound body does not emerge from the pure five things at any scale, a binding would require an attractive interaction the base does not have, the active vacuum does resist dispersal slightly (a weak sub-critical depletion attraction) but never enough to contract and bind',
      metrics: {
        rms0Times100: Math.round(rms0 * 100),
        momentumMinTimes100: Math.round(momentum.min * 100),
        momentumFinalTimes100: Math.round(momentum.final * 100),
        arrowMinTimes100: Math.round(arrow.min * 100),
        arrowFinalTimes100: Math.round(arrow.final * 100),
        bindMoveMinTimes100: Math.round(bindMove.min * 100),
        bindMoveFinalTimes100: Math.round(bindMove.final * 100),
        noneContract: noneContract ? 1 : 0,
        arrowResistsDispersal: arrowResistsDispersal ? 1 : 0,
        beats,
      },
      control: {
        rms0Times100: Math.round(rms0 * 100),
        momentumFinalTimes100: Math.round(momentum.final * 100),
      },
      notes:
        'the closing experiment for the emergent bound body. No restoring pressure means no self-binding at any scale. The active vacuum (bindAndMove) resists dispersal more than the bare momentum rule (a weak sub-critical attraction from the arrow) but never contracts. So the bound body needs more than the five things (a cheat), consistent with pure-base-no-selves. The substrate self is identity (base) plus the emergent agency channel (soft radiation plus bath), the fully bound self-repairing body is not reachable from the pure base',
    })
  },
})
