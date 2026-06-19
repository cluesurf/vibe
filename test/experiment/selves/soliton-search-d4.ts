// The search for genuinely bound, persistent, MOBILE structures on the {3,4,3,4} D4 coin, the missing
// basin-forming ingredient (the-degeneracy-trick, base-rule-options-for-a-self-level). A self-level needs
// solitons or gliders whose collisions form LASTING composites, so that many microscopic variations realize the
// same moving entity. We test, under the momentum-conserving reversible collision (headOnRotate), three things.
//  1. PERSISTENCE plus MOBILITY. A co-moving glider (several particles sharing one direction) stays localized
//     (its occupied-cell count holds) and travels (it leaves its start cells). A free glider is a soliton.
//  2. BINDING ON COLLISION. Two gliders launched head-on, after they meet, do they form a lasting localized
//     composite (occupied-cell count stays bounded) or DISPERSE (count grows)? This is the real test.
//  3. The control, the streaming-only rule (passThrough), where gliders move but pass straight through with no
//     interaction at all.
//
// Depth L2, a measured structure search with a control. We report the honest outcome, free gliders persist and
// move (solitons exist), but head-on collisions DISPERSE rather than bind under the conserving rule, so a
// lasting bound composite, the basin-forming ingredient, is still missing. This is the precise gap a future
// binding mechanism (growth and the arrow, Option F) must fill.

import { experiment } from '@/test/scaffold/suite'
import { verdict } from '@/test/scaffold/verdict'
import { d4Mesh, type Mesh } from '@/code/tool/mesh'
import { makeWill, gliderLine } from '@/code/tone/will'
import {
  passThrough,
  headOnRotate,
  type Collision,
} from '@/code/rule/collision'
import { run } from '@/code/rule/lattice-gas'
import {
  occupiedCells,
  occupiedSet,
  componentCount,
} from '@/code/check/structure'

const movedOff = (start: number[], after: Set<number>): boolean =>
  start.every(c => !after.has(c))

export default experiment({
  id: 'selves/soliton-search-d4',
  title:
    'free gliders are solitons (persist and move), but head-on collisions disperse rather than bind',
  category: 'selves',
  substrates: ['3434'],
  depth: 'L2',
  paper: true,
  run() {
    const side = 16
    const mesh: Mesh = d4Mesh({ side })
    const dir = 0
    const opp = mesh.opposite(dir)
    const gliderLength = 3
    const beats = 8

    // 1, a single free glider, persistence and mobility under the momentum-conserving rule.
    const center =
      8 + 8 * side + 8 * side * side + 8 * side * side * side
    const g = gliderLine({
      mesh,
      start: center,
      direction: dir,
      length: gliderLength,
    })
    const mobile: Collision = headOnRotate({
      opposite: Array.from({ length: mesh.degree }, (_, d) =>
        mesh.opposite(d),
      ),
    })
    const gliderFinal = run(
      { mesh, data: g.will.data.slice() },
      mobile,
      beats,
    )
    const gliderCells = occupiedCells(gliderFinal)
    const gliderPersists = gliderCells === gliderLength // stayed exactly as tight as it began
    const gliderMoved = movedOff(g.cells, occupiedSet(gliderFinal))

    // 2, two gliders launched head-on with a clean gap between them, do they bind into one cluster or part?
    const a = gliderLine({
      mesh,
      start: center,
      direction: dir,
      length: gliderLength,
    })
    // the second glider sits a clear gap ahead along dir and travels the opposite way, so they approach, meet,
    // and (if they survive) part. The gap keeps the two clusters disjoint at the start (two components).
    let bStart = center
    for (let i = 0; i < gliderLength + 3; i++)
      bStart = mesh.neighbour(bStart, dir)
    const b = gliderLine({
      mesh,
      start: bStart,
      direction: opp,
      length: gliderLength,
    })
    const collide = makeWill(mesh)
    for (let i = 0; i < collide.data.length; i++)
      collide.data[i] = (a.will.data[i] || b.will.data[i]) as -1 | 0 | 1
    const startComponents = componentCount(collide) // two disjoint gliders

    const collideFinal = run(
      { mesh, data: collide.data.slice() },
      mobile,
      beats,
    )
    const collideComponents = componentCount(collideFinal)
    const collideCells = occupiedCells(collideFinal)
    // a bound composite is ONE persistent tight cluster, parting (pass-through or scatter) leaves two or more.
    const bound =
      collideComponents === 1 && collideCells <= gliderLength * 2

    // 3, the control, streaming only, gliders pass straight through. Compare to detect that the collision rule
    // actually interacted (a different final state from free crossing).
    const crossFinal = run(
      { mesh, data: collide.data.slice() },
      passThrough,
      beats,
    )
    const crossComponents = componentCount(crossFinal)
    const interacted = collideFinal.data.some(
      (v, i) => v !== crossFinal.data[i],
    )

    // the honest verdict, free gliders are solitons (persist and move), the collision INTERACTS (differs from
    // free crossing) but does NOT bind into one lasting composite, the structures part again. The pass records
    // this characterization, solitons yes, binding no.
    const ok =
      gliderPersists &&
      gliderMoved &&
      interacted &&
      !bound &&
      collideComponents >= 2
    return verdict({
      status: ok ? 'pass' : 'fail',
      claim:
        'on the D4 coin under the momentum-conserving rule a co-moving glider is a soliton (it stays exactly as localized as it began and travels), and two gliders launched head-on do interact (their outcome differs from free crossing) but do NOT bind into one lasting composite, they part again into separate clusters, so persistent mobile structures exist while the lasting bound composite a self-level needs does not, confirming a binding mechanism is still missing',
      metrics: {
        gliderLength,
        gliderCellsAfter: gliderCells,
        gliderPersists: gliderPersists ? 1 : 0,
        gliderMoved: gliderMoved ? 1 : 0,
        collisionStartComponents: startComponents,
        collisionComponentsAfter: collideComponents,
        collisionCellsAfter: collideCells,
        interactedVsCrossing: interacted ? 1 : 0,
        bound: bound ? 1 : 0,
        crossingComponentsAfter: crossComponents,
        beats,
      },
      control: {
        crossingComponentsAfter: crossComponents,
        interactedVsCrossing: interacted ? 1 : 0,
      },
      notes:
        'solitons exist (free gliders persist and move), the head-on collision interacts but parts into separate clusters rather than binding into one composite, there is no attraction to hold a composite together. The missing basin-forming ingredient is exactly a binding mechanism, the leading candidate being growth and the arrow (Option F), which supplies a real arrow (selves/growth-arrow-irreversibility) and so a way for structure to be retained rather than dispersed',
    })
  },
})
