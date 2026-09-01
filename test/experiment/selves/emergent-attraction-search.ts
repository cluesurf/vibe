// The deep L3 probe (inspiral-capture-design, the real open question). Capture needs an attractive interaction.
// The survey found that every attraction in the corpus is ADDED (a gauge field, a Skyrme term, an assumed
// Laplacian), never emergent from the committed reversible rule. Here we test that directly, does the bare rule
// produce ANY force between two charges, or is it strictly contact-only with no action at a distance.
//
// The rigorous test is SUPERPOSITION. A force at a distance would make two charges evolve differently together
// than the overlay of each evolving alone, even before they touch. We launch two charges on PARALLEL,
// non-colliding tracks (so they never share a cell) and compare the joint run to the overlay of the two solo
// runs. If they match EXACTLY, the charges never influenced each other, there is no force at a distance, so the
// rule cannot produce attraction by itself. We do this at a far and a near separation (a force would show at
// both). Then a head-on COLLISION shows the only interaction the rule has is contact, and that contact SCATTERS
// (two components leave), it does not bind.
//
// The honest expected result is a negative, the committed local reversible rule has no emergent attraction, it
// is strictly contact-interacting and the contact is repulsive (elastic scatter). So attraction must be mediated
// by an added field (the emergent gauge sector), it does not fall out of the five things. This is the boundary
// the whole self arc runs into.
//
// Depth L2, exact superposition measured at two separations with a head-on collision as the contact control.

import { experiment } from '@/test/scaffold/suite'
import { verdict } from '@/test/scaffold/verdict'
import { d4Mesh, type Mesh, meshOpposites } from '@/code/tool/mesh'
import { makeWill, loneParticle, type Will } from '@/code/tone/will'
import { headOnRotate, type Collision } from '@/code/rule/collision'
import { run } from '@/code/rule/lattice-gas'
import { componentCount } from '@/code/check/structure'

// the largest slot-wise difference between two wills, zero iff they are identical.
function maxDifference(a: Will, b: Will): number {
  let max = 0

  for (let i = 0; i < a.data.length; i++) {
    const d = Math.abs(a.data[i]! - b.data[i]!)

    if (d > max) {
      max = d
    }
  }

  return max
}

// the overlay of two wills, slot-wise sum (valid while they never co-occupy a slot).
function overlay(a: Will, b: Will): Will {
  const data = new Int8Array(a.data.length)

  for (let i = 0; i < data.length; i++) {
    data[i] = a.data[i]! + b.data[i]!
  }

  return { mesh: a.mesh, data }
}

// a cell index from explicit 4D coordinates on a side^4 lattice.
function cellAt(
  side: number,
  x: number,
  y: number,
  z: number,
  w: number,
): number {
  const m = (v: number): number => ((v % side) + side) % side

  return (
    m(w) * side * side * side + m(z) * side * side + m(y) * side + m(x)
  )
}

export default experiment({
  id: 'selves/emergent-attraction-search',
  code: 'E-SLF-0043',
  title:
    'the bare reversible rule has no emergent attraction, two separated charges obey exact superposition',
  category: 'selves',
  substrates: ['3434'],
  depth: 'L2',
  paper: true,
  run() {
    const side = 16
    const beats = 6
    const mesh: Mesh = d4Mesh({ side })
    const rule: Collision = headOnRotate({
      opposite: meshOpposites(mesh),
    })

    const half = side / 2
    const dir = 0 // the root [1, 1, 0, 0], streaming adds (1,1,0,0) per beat
    const opp = mesh.opposite(dir)

    // two charges on PARALLEL tracks, offset in z so they share the (x, y) drift but never the same cell.
    const superpositionGap = (gap: number): number => {
      const cellA = cellAt(side, half, half, half, half)
      const cellB = cellAt(side, half, half, half + gap, half)
      const a = loneParticle(mesh, cellA, dir)
      const b = loneParticle(mesh, cellB, dir)
      const joint = makeWill(mesh)

      for (let i = 0; i < joint.data.length; i++) {
        joint.data[i] = a.data[i]! + b.data[i]!
      }

      const jointFinal = run(joint, rule, beats)
      const overlayFinal = overlay(
        run({ mesh, data: a.data.slice() }, rule, beats),
        run({ mesh, data: b.data.slice() }, rule, beats),
      )

      return maxDifference(jointFinal, overlayFinal)
    }

    // a force at a distance would break superposition at BOTH a near and a far separation.
    const farMatch = superpositionGap(6)
    const nearMatch = superpositionGap(2)

    // the contact control, two charges head-on. Superposition BREAKS (they interact on contact), and the contact
    // scatters into two separate clusters, it does not bind.
    const cellA = cellAt(side, half, half, half, half)
    const cellB = cellAt(side, half + 2, half + 2, half, half) // two steps along dir, so they meet head-on
    const a = loneParticle(mesh, cellA, dir)
    const b = loneParticle(mesh, cellB, opp)
    const collide = makeWill(mesh)

    for (let i = 0; i < collide.data.length; i++) {
      collide.data[i] = a.data[i]! + b.data[i]!
    }

    const collideFinal = run(collide, rule, beats)
    const collideOverlay = overlay(
      run({ mesh, data: a.data.slice() }, rule, beats),
      run({ mesh, data: b.data.slice() }, rule, beats),
    )

    const contactBreaksSuperposition =
      maxDifference(collideFinal, collideOverlay) > 0

    const contactScattersNotBinds = componentCount(collideFinal) >= 2

    // the honest negative, no force at a distance (exact superposition at every separation), only contact, and
    // the contact scatters rather than binds, so the bare rule produces no attraction.
    const noForceAtDistance = farMatch === 0 && nearMatch === 0
    const ok =
      noForceAtDistance &&
      contactBreaksSuperposition &&
      contactScattersNotBinds

    return verdict({
      status: ok ? 'pass' : 'fail',
      claim:
        'two charges on parallel non-colliding tracks evolve as the EXACT overlay of each alone at both near and far separation, so the committed reversible rule exerts no force at a distance, and its only interaction is contact, which scatters rather than binds, therefore the bare rule produces no emergent attraction and an attractive interaction must be mediated by an added field (the emergent gauge sector)',
      metrics: {
        farSeparationMismatch: farMatch,
        nearSeparationMismatch: nearMatch,
        contactBreaksSuperposition: contactBreaksSuperposition ? 1 : 0,
        contactComponentsAfter: componentCount(collideFinal),
        noForceAtDistance: noForceAtDistance ? 1 : 0,
        beats,
      },
      control: {
        contactBreaksSuperposition: contactBreaksSuperposition ? 1 : 0,
      },
      notes:
        'honest negative, the local reversible rule has no action at a distance (exact superposition for separated charges), so no emergent attraction, and contact is repulsive (elastic scatter, two clusters leave). Attraction is the one ingredient that must be added (an emergent gauge field), it does not fall out of the five things. This is the L3 boundary, capture, and so nested selves, need a mediating force the bare substrate does not supply',
    })
  },
})
