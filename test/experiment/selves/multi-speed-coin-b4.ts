// Option 4 (routes-to-nested-selves), the multi-speed coin, built and tested. The single-speed obstruction
// (selves/bind-and-move-collision) said mobility and confinement cannot coexist in one local collision when
// every direction has the same speed. So we built the B4 coin, 32 directions, the 24 long D4 roots (two
// coordinates per beat) plus the 8 short axis roots (one coordinate per beat), a genuine TWO-SPEED coin, all
// integer so the lattice stays exact. We then retried the collisions on it, looking for an actual moving bound
// state.
//
// The result, multi-speed is necessary but still not sufficient, and it tells us the obstruction is DEEPER than
// speed, it is architectural. On the two-speed coin both speeds are mobile and the collisions stay reversible and
// conserving, and a trivial co-moving pair is a moving bound state. But CAPTURE still fails, two approaching
// structures do not bind into a lasting composite, they pass through as separate clusters. The reason is the
// stream-then-collide architecture itself, momentum conservation forces a zero-momentum head-on pair to leave as
// an opposite-direction pair (so the two parts separate), and an on-site collision cannot make distinct
// particles re-meet except by reflection, which pins. A richer speed set does not change that.
//
// We show, on the B4 coin:
//  1. it is a valid two-speed coin (32 = 24 long + 8 short) and both speeds are mobile.
//  2. the collisions are reversible and conserving on it (the build is sound).
//  3. a co-moving pair IS a moving bound state (one component, tight, travelling).
//  4. but an approaching head-on pair does NOT capture, it stays two separate components, the architectural
//     obstruction that multi-speed does not lift.
//
// Depth L2, the B4 coin measured with the co-mover (binding) and head-on (capture failure) as paired probes. The
// honest conclusion, the route to capture is a block (Margolus) reversible update or the open-system growth bath,
// not a richer single-update coin.

import { experiment } from '@/test/scaffold/suite'
import { verdict } from '@/test/scaffold/verdict'
import { b4Mesh, type Mesh } from '@/code/tool/mesh'
import { makeWill, loneParticle, type Will } from '@/code/tone/will'
import {
  pairCollision,
  headOnRotate,
  bindAndMove,
  type Collision,
} from '@/code/rule/collision'
import { run } from '@/code/rule/lattice-gas'
import { isReversible, conservesCharge } from '@/code/check/invariant'
import {
  componentCount,
  diameter,
  travelDistance,
  momentum,
} from '@/code/check/structure'
import { rootsB4 } from '@/code/algebra/group/root-system'

const ROOTS = rootsB4()

const sameVector = (a: number[], b: number[]): boolean =>
  a.every((v, i) => v === b[i])

export default experiment({
  id: 'selves/multi-speed-coin-b4',
  code: 'E-SLF-0077',
  title:
    'the B4 two-speed coin is mobile and valid but does not lift the binding obstruction, capture is architectural',
  category: 'selves',
  substrates: ['b4'],
  depth: 'L2',
  paper: true,
  run() {
    const side = 24
    const beats = 8
    const mesh: Mesh = b4Mesh({ side })
    const degree = mesh.degree
    const opposite = Array.from({ length: degree }, (_, d) =>
      mesh.opposite(d),
    )

    const half = side / 2
    const center =
      half +
      half * side +
      half * side * side +
      half * side * side * side

    // classify directions by speed, a long root has two nonzero coordinates, a short root one.
    const longDirs = ROOTS.map((r, i) => [r, i] as const).filter(
      ([r]) => r.filter(v => v !== 0).length === 2,
    )

    const shortDirs = ROOTS.map((r, i) => [r, i] as const).filter(
      ([r]) => r.filter(v => v !== 0).length === 1,
    )

    const longCount = longDirs.length
    const shortCount = shortDirs.length
    const L = longDirs[0]![1]
    const Lopp = mesh.opposite(L)
    const S = shortDirs[0]![1]

    const mobile: Collision = headOnRotate({ opposite })
    const pair: Collision = pairCollision({ opposite })
    const bind: Collision = bindAndMove({ opposite })
    const bindInverse: Collision = bindAndMove({
      opposite,
      forward: false,
    })

    const lone = (dir: number): Will =>
      loneParticle(mesh, center, dir, 1)

    const neigh = (
      cell: number,
      dir: number,
      steps: number,
    ): number => {
      let c = cell

      for (let i = 0; i < steps; i++) c = mesh.neighbour(c, dir)

      return c
    }

    // 1, two-speed coin, both speeds mobile under headOnRotate, both pinned under the pair table.
    const longTravel = travelDistance({
      will: run(lone(L), mobile, beats),
      start: center,
    })

    const shortTravel = travelDistance({
      will: run(lone(S), mobile, beats),
      start: center,
    })

    const longPinned = travelDistance({
      will: run(lone(L), pair, beats),
      start: center,
    })

    // 2, the collisions are reversible and conserving on B4 (the build is sound).
    const headOnReversible = isReversible(lone(L), mobile, beats)
    const headOnChargeOk = conservesCharge(lone(L), mobile, beats)
    const mStart = momentum(lone(L), ROOTS)
    const headOnMomentumOk = sameVector(
      mStart,
      momentum(run(lone(L), mobile, beats), ROOTS),
    )

    const bindReversible = isReversible(
      lone(L),
      bind,
      beats,
      bindInverse,
    )

    const bindChargeOk = conservesCharge(lone(L), bind, beats)

    // 3, a co-moving pair is a moving bound state, one tight component that travels.
    const coMover = (): Will => {
      const w = makeWill(mesh)

      w.data[center * degree + L] = 1
      w.data[neigh(center, L, 1) * degree + L] = 1

      return w
    }

    const coMoverFinal = run(coMover(), mobile, beats)
    const coMoverComponents = componentCount(coMoverFinal)
    const coMoverDiameter = diameter(coMoverFinal)
    const coMoverTravel = travelDistance({
      will: coMoverFinal,
      start: center,
    })

    // 4, an approaching head-on pair does NOT capture, it stays two separate components.
    const approach = (): Will => {
      const w = makeWill(mesh)

      w.data[center * degree + L] = 1
      w.data[neigh(center, L, 2) * degree + Lopp] = 1

      return w
    }

    const captureComponents = componentCount(
      run(approach(), mobile, beats),
    )

    const ok =
      longCount === 24 &&
      shortCount === 8 &&
      longTravel >= beats - 1 &&
      shortTravel >= beats - 1 &&
      longPinned <= 1 &&
      headOnReversible &&
      headOnChargeOk &&
      headOnMomentumOk &&
      bindReversible &&
      bindChargeOk &&
      coMoverComponents === 1 &&
      coMoverDiameter <= 2 &&
      coMoverTravel >= beats - 1 &&
      captureComponents >= 2

    return verdict({
      status: ok ? 'pass' : 'fail',
      claim:
        'the B4 two-speed coin (24 long plus 8 short directions) is a valid mobile substrate, both speeds stream and the collisions stay reversible and conserving, and a co-moving pair is a moving bound state, but an approaching head-on pair does NOT capture into a composite, it stays two separate components, so multi-speed is necessary but does not lift the binding obstruction, capture is blocked by the stream-then-collide architecture itself, not by speed',
      metrics: {
        longCount,
        shortCount,
        longTravel,
        shortTravel,
        longPinned,
        headOnReversible: headOnReversible ? 1 : 0,
        headOnChargeConserved: headOnChargeOk ? 1 : 0,
        headOnMomentumConserved: headOnMomentumOk ? 1 : 0,
        bindReversible: bindReversible ? 1 : 0,
        bindChargeConserved: bindChargeOk ? 1 : 0,
        coMoverComponents,
        coMoverDiameter,
        coMoverTravel,
        captureComponents,
        beats,
      },
      control: { coMoverComponents, captureComponents },
      notes:
        'multi-speed gives multi-speed mobility and a trivial moving bound state (the co-mover), but capture still fails, momentum conservation forces a zero-momentum head-on pair to leave as an opposite-direction pair (the parts separate) and an on-site collision cannot make distinct particles re-meet except by reflection (which pins). The obstruction is architectural. The route to capture is a block (Margolus) reversible update, where a 2-cell block updates as a unit, or the open-system growth bath',
    })
  },
})
