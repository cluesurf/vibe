// THE L3 FRONTIER (multi-level-selves plan). Does a persistent localized self-structure emerge from the PURE
// deterministic base rule, with no posited cohesion, no random hop, a fixed structured initial condition.
// This is the question the coarse-graining scaffold was built to approach.
//
// The measured answer is YES for the structure (a positive), with a clear control. The committed rule (the
// directional lattice gas, stream then collide) is reversible and charge-conserving. Its conserving
// interaction CONFINES a localized charge packet, the pair table reflects a charge that reaches a vacuum
// boundary back inward (the hop-past-peace move), so the packet does not spread, it settles into a
// persistent bounded breather, periodic in time, charge exactly conserved. The control isolates the cause,
// streaming ALONE (the pass-through collision, no interaction) lets the same packet fly apart to the system
// scale. So the persistence is produced by the base rule's own interaction, not imposed.
//
// Honest scope. This establishes the self-as-persistent-structure, the necessary substrate of a self, from
// the pure rule (L2, a known soliton-style result measured here with a control). It is NOT yet the full L3
// self-LEVEL, the further criteria (a Markov blanket, autopoietic closure, a cognitive light cone, causal
// emergence) on this very structure are the open frontier. Reversibility means the structure is a periodic
// orbit, not an attractor.

import { experiment } from '@/test/scaffold/suite'
import { verdict } from '@/test/scaffold/verdict'
import { squareMesh } from '@/code/tool/mesh'
import { makeWill, cellTone, type Will } from '@/code/tone/will'
import { pairCollision, passThrough } from '@/code/rule/collision'
import {
  run,
  beatInto,
  streamSourceTable,
} from '@/code/rule/lattice-gas'
import { conservesCharge, isReversible } from '@/code/check/invariant'
import { weightedGridRadiusOfGyration } from '@/code/measure/profile'

function radiusOfGyration(input: { will: Will; side: number }): number {
  return weightedGridRadiusOfGyration({
    cellCount: input.will.mesh.cellCount,
    side: input.side,
    weightOf: cell => Math.abs(cellTone(input.will, cell)),
  })
}

function uniformGyration(side: number): number {
  const c = side / 2 - 0.5

  let m2 = 0

  for (let i = 0; i < side * side; i++) {
    const dx = (i % side) - c
    const dy = Math.floor(i / side) - c
    m2 += dx * dx + dy * dy
  }

  return Math.sqrt(m2 / (side * side))
}

function packet(side: number): Will {
  const mesh = squareMesh({ side })
  const will = makeWill(mesh)
  const c = Math.floor(side / 2)

  for (let y = c - 3; y <= c + 3; y++) {
    for (let x = c - 3; x <= c + 3; x++) {
      const base = (y * side + x) * mesh.degree

      for (let d = 0; d < mesh.degree; d++) {
        will.data[base + d] = 1
      }
    }
  }

  return will
}

export default experiment({
  id: 'selves/l3-self-from-base-rule',
  code: 'E-SLF-0067',
  title:
    'the pure reversible base rule confines a packet into a persistent bounded structure, streaming alone spreads it',
  category: 'selves',
  substrates: ['square'],
  depth: 'L2',
  paper: true,
  run() {
    const side = 48
    const beats = 18
    const mesh = squareMesh({ side })
    const opposite = Array.from({ length: mesh.degree }, (_, d) =>
      mesh.opposite(d),
    )

    const collision = pairCollision({ opposite, forward: true })
    const inverse = pairCollision({ opposite, forward: false })
    const spreadMax = uniformGyration(side)
    const table = streamSourceTable(mesh) // precompute the stream gather once, reused for every beat

    // the rule is reversible and conserving, the condition that makes it a periodic orbit, not an attractor.
    const reversibleOk = isReversible(
      packet(side),
      collision,
      beats,
      inverse,
    )

    const conservesOk = conservesCharge(packet(side), collision, beats)

    // the base rule, its interaction confines the packet.
    let base = packet(side)
    let baseScratch: Will = {
      mesh: base.mesh,
      data: new Int8Array(base.data.length),
    }

    const startRg = radiusOfGyration({ will: base, side })

    let baseMaxRg = startRg

    for (let t = 0; t < beats; t++) {
      beatInto({ src: base, dst: baseScratch, table, collision })

      const swap = base
      base = baseScratch
      baseScratch = swap
      baseMaxRg = Math.max(
        baseMaxRg,
        radiusOfGyration({ will: base, side }),
      )
    }

    const baseEndRg = radiusOfGyration({ will: base, side })

    // the control, streaming alone (no interaction) lets the same packet fly apart.
    const free = run(packet(side), passThrough, beats)
    const freeEndRg = radiusOfGyration({ will: free, side })

    const confined = baseMaxRg < 0.35 * spreadMax
    const controlSpreads = freeEndRg > 0.6 * spreadMax
    const ok = reversibleOk && conservesOk && confined && controlSpreads

    return verdict({
      status: ok ? 'pass' : 'fail',
      claim:
        'the pure reversible base rule confines a localized packet into a persistent bounded structure (its radius of gyration stays small for all beats), while streaming alone spreads the same packet to the system scale, so a persistent localized self-structure emerges from the base interaction itself',
      metrics: {
        reversibleOk: reversibleOk ? 1 : 0,
        conservesOk: conservesOk ? 1 : 0,
        startRg,
        baseMaxRg,
        baseEndRg,
        freeEndRg,
        spreadMax,
        baseFraction: baseMaxRg / spreadMax,
        freeFraction: freeEndRg / spreadMax,
      },
      control: { freeEndRg },
      notes:
        'positive for self-as-structure from the pure rule. The structure is a periodic breather (reversible, no attractor). The full L3 self-LEVEL (blanket, closure, light cone, causal emergence on THIS structure) remains the open frontier',
    })
  },
})
