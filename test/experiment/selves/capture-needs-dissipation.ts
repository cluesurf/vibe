// The capstone of the binding search (routes-to-nested-selves, the-degeneracy-trick). Nested selves need
// CAPTURE, two approaching structures binding into one lasting composite. We have now tried every reversible
// bulk collision the framework offers, the momentum rotate (selves/scatter-d4), the pair table and bindAndMove
// (selves/bind-and-move-collision), the B4 two-speed coin (selves/multi-speed-coin-b4), and here the
// purpose-built sticky reflection, the most capture-shaped reversible rule we can write. It leaves a lone charge
// alone (mobility) but REFLECTS every charge in a crowded cell, meaning to bounce colliding structures back
// together. It is a reversible involution and charge-conserving.
//
// The result is decisive, it still does NOT capture. Reflecting a two-charge head-on cell merely exchanges and
// reverses the charges, which then stream apart, an ELASTIC bounce. This is not a tuning failure, it is forced,
// a reversible (information-preserving) collision cannot turn two incoming structures into one bound outgoing
// structure, because that would erase the distinction between the captured state and the many ways it could
// later come apart. Capture sheds the relative motion, and shedding is dissipation, which a reversible rule
// forbids in the bulk. So capture must come from the open bath (growth, Option F), never from the bulk
// collision, which confirms and sharpens the whole arc.
//
// We show, on the D4 coin:
//  1. sticky reflection is reversible, charge-conserving, and mobile for a lone charge.
//  2. it does NOT capture two approaching gliders, they stay two separate components, exactly as the elastic
//     momentum rotate (the control) does.
//
// Depth L2, the purpose-built reversible capture rule measured against the momentum rotate as a control,
// establishing that capture is forbidden in the reversible bulk and must come from dissipation at the bath.

import { experiment } from '@/test/scaffold/suite'
import { verdict } from '@/test/scaffold/verdict'
import { d4Mesh, type Mesh } from '@/code/tool/mesh'
import {
  makeWill,
  loneParticle,
  gliderLine,
  type Will,
} from '@/code/tone/will'
import {
  headOnRotate,
  stickyReflect,
  type Collision,
} from '@/code/rule/collision'
import { run } from '@/code/rule/lattice-gas'
import { isReversible, conservesCharge } from '@/code/check/invariant'
import { componentCount, travelDistance } from '@/code/check/structure'

export default experiment({
  id: 'selves/capture-needs-dissipation',
  title:
    'a reversible collision cannot capture, sticky reflection scatters elastically, so binding needs the bath',
  category: 'selves',
  substrates: ['3434'],
  depth: 'L2',
  paper: true,
  run() {
    const side = 24
    const beats = 10
    const mesh: Mesh = d4Mesh({ side })
    const opposite = Array.from({ length: mesh.degree }, (_, d) =>
      mesh.opposite(d),
    )

    const dir = 0
    const opp = mesh.opposite(dir)
    const half = side / 2
    const center =
      half +
      half * side +
      half * side * side +
      half * side * side * side

    const sticky: Collision = stickyReflect({ opposite })
    const elastic: Collision = headOnRotate({ opposite })

    // 1, sticky reflection is reversible, charge-conserving, and mobile for a lone charge.
    const lone = loneParticle(mesh, center, dir)
    const stickyReversible = isReversible(lone, sticky, beats)
    const stickyChargeOk = conservesCharge(lone, sticky, beats)
    const loneTravel = travelDistance({
      will: run(loneParticle(mesh, center, dir), sticky, beats),
      start: center,
    })

    // two gliders approaching head-on with a clean gap (two disjoint components at the start).
    const twoGliders = (): Will => {
      const a = gliderLine({
        mesh,
        start: center,
        direction: dir,
        length: 3,
      })

      let bStart = center

      for (let i = 0; i < 6; i++) {
        bStart = mesh.neighbour(bStart, dir)
      }

      const b = gliderLine({
        mesh,
        start: bStart,
        direction: opp,
        length: 3,
      })

      const will = makeWill(mesh)

      for (let i = 0; i < will.data.length; i++) {
        will.data[i] = (a.will.data[i] || b.will.data[i]) as -1 | 0 | 1
      }

      return will
    }

    // 2, capture fails, the gliders stay separate under sticky reflection, just as under the elastic control.
    const stickyCapture = componentCount(
      run(twoGliders(), sticky, beats),
    )

    const elasticCapture = componentCount(
      run(twoGliders(), elastic, beats),
    )

    const ok =
      stickyReversible &&
      stickyChargeOk &&
      loneTravel >= beats - 1 &&
      stickyCapture >= 2 &&
      elasticCapture >= 2

    return verdict({
      status: ok ? 'pass' : 'fail',
      claim:
        'sticky reflection, the most capture-shaped reversible collision we can write, is reversible, charge-conserving, and mobile, yet it does NOT capture two approaching gliders, they stay two separate components exactly as under the elastic momentum rotate, because a reversible collision can only scatter elastically, capture sheds relative motion and shedding is dissipation, so binding must come from the open bath, never from the reversible bulk',
      metrics: {
        stickyReversible: stickyReversible ? 1 : 0,
        stickyChargeConserved: stickyChargeOk ? 1 : 0,
        loneTravel,
        stickyCaptureComponents: stickyCapture,
        elasticCaptureComponents: elasticCapture,
        beats,
      },
      control: { elasticCaptureComponents: elasticCapture },
      notes:
        'capture is forbidden in the reversible bulk, established now across five rules (momentum rotate, pair table, bindAndMove, B4, sticky reflection), every one scatters elastically. Reflecting a crowded cell exchanges and reverses the charges, which then stream apart. Binding requires dissipation, which lives only at the open growing boundary (Option F), or a different state space (multi-occupancy, a block update), not in a local reversible collision',
    })
  },
})
