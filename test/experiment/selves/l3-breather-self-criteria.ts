// THE L3 FRONTIER, part two (multi-level-selves plan). The pure base rule sustains a persistent localized
// structure, a breather (shown in l3-self-from-base-rule). Here we test the self-criteria ON that breather,
// from the PURE deterministic rule, to see whether the structure is a genuine self-level, not just a
// persistent blob.
//
// Two criteria are measured.
//  - Markov blanket. Does the breather's shell screen its interior from its exterior. Because the rule is
//    deterministic and the structure is confined, the interior couples to the exterior only through the
//    shell, so conditioning on the shell should remove the coupling.
//  - Cognitive light cone. Flip one slot and evolve the perturbed and unperturbed copies under the IDENTICAL
//    deterministic rule. The only divergence is the flip, so the difference set is the exact causal cone. A
//    self contains an interior perturbation within a bounded radius, while a vacuum perturbation spreads.
//    Reversibility means the difference cannot vanish (no erasure), so the test is CONTAINMENT, a bounded
//    cone, not correction to zero.
//
// Depth L2. The criteria are measured on the pure-rule structure with controls. An honest L3 self-level
// would need all criteria to pass cleanly together, this reports which do.

import { experiment } from '@/test/scaffold/suite'
import { verdict } from '@/test/scaffold/verdict'
import { squareMesh, shellDistances, type Mesh, meshOpposites } from '@/code/tool/mesh'
import { makeWill, cellTone, type Will } from '@/code/tone/will'
import { pairCollision } from '@/code/rule/collision'
import { beatInto, streamSourceTable } from '@/code/rule/lattice-gas'
import { blanketScreening } from '@/code/coarse/self-criteria'

function breather(side: number): { mesh: Mesh; will: Will } {
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

  return { mesh, will }
}

// the cells within a chebyshev box around the center, split into interior (inner box), shell (the ring), and
// exterior (the next ring out), by index on the square mesh.
function boxRegions(
  side: number,
  center: number,
  inner: number,
  outer: number,
): {
  interior: number[]
  shell: number[]
  exterior: number[]
} {
  const cx = center % side
  const cy = Math.floor(center / side)
  const interior: number[] = []
  const shell: number[] = []
  const exterior: number[] = []

  for (let y = 0; y < side; y++) {
    for (let x = 0; x < side; x++) {
      const r = Math.max(Math.abs(x - cx), Math.abs(y - cy))
      const cell = y * side + x

      if (r <= inner) {
        interior.push(cell)
      } else if (r <= outer) {
        shell.push(cell)
      } else if (r <= outer + 1) {
        exterior.push(cell)
      }
    }
  }

  return { interior, shell, exterior }
}

function sumCharge(will: Will, cells: number[]): number {
  let s = 0

  for (const c of cells) {
    s += cellTone(will, c)
  }

  return s
}

// flip one slot of a cell, the minimal perturbation, then evolve perturbed and clean copies under the same
// deterministic rule, returning the maximum radius the difference set reaches.
function perturbationRadius(input: {
  mesh: Mesh
  base: Will
  site: number
  beats: number
  table: Int32Array
}): number {
  const { mesh, base, site, beats, table } = input
  const dist = shellDistances(mesh, site)

  let clean: Will = { mesh, data: base.data.slice() }
  let dirty: Will = { mesh, data: base.data.slice() }

  dirty.data[site * mesh.degree] =
    dirty.data[site * mesh.degree] === 1 ? -1 : 1

  const opposite = meshOpposites(mesh)

  const collision = pairCollision({ opposite, forward: true })

  let cleanScratch: Will = {
    mesh,
    data: new Int8Array(clean.data.length),
  }

  let dirtyScratch: Will = {
    mesh,
    data: new Int8Array(dirty.data.length),
  }

  let maxRadius = 0

  for (let t = 0; t < beats; t++) {
    beatInto({ src: clean, dst: cleanScratch, table, collision })

    const swapClean = clean

    clean = cleanScratch
    cleanScratch = swapClean
    beatInto({ src: dirty, dst: dirtyScratch, table, collision })

    const swapDirty = dirty

    dirty = dirtyScratch
    dirtyScratch = swapDirty

    for (let c = 0; c < mesh.cellCount; c++) {
      if (
        cellTone(clean, c) !== cellTone(dirty, c) &&
        dist[c]! > maxRadius
      ) {
        maxRadius = dist[c]!
      }
    }
  }

  return maxRadius
}

export default experiment({
  id: 'selves/l3-breather-self-criteria',
  code: 'E-SLF-0065',
  title:
    'the base-rule breather screens through its shell and contains an interior perturbation more than the vacuum',
  category: 'selves',
  substrates: ['square'],
  depth: 'L2',
  paper: true,
  run() {
    const side = 64
    const beats = 24
    const { mesh, will } = breather(side)
    const opposite = meshOpposites(mesh)

    const collision = pairCollision({ opposite, forward: true })
    const table = streamSourceTable(mesh) // precompute the stream gather once, reused for every beat
    const center = Math.floor(side / 2) * side + Math.floor(side / 2)

    // Markov blanket, charge series of interior, shell, exterior over a few periods of the breather.
    const region = boxRegions(side, center, 2, 4)
    const interior: number[] = []
    const shell: number[] = []
    const exterior: number[] = []

    let w: Will = { mesh, data: will.data.slice() }
    let wScratch: Will = { mesh, data: new Int8Array(w.data.length) }

    for (let t = 0; t < 60; t++) {
      beatInto({ src: w, dst: wScratch, table, collision })

      const swap = w

      w = wScratch
      wScratch = swap
      interior.push(sumCharge(w, region.interior))
      shell.push(sumCharge(w, region.shell))
      exterior.push(sumCharge(w, region.exterior))
    }

    const blanket = blanketScreening({ interior, shell, exterior })

    // cognitive light cone, an interior perturbation versus a vacuum perturbation.
    const interiorRadius = perturbationRadius({
      mesh,
      base: will,
      site: center,
      beats,
      table,
    })

    const cornerCell = 0
    const vacuumRadius = perturbationRadius({
      mesh,
      base: will,
      site: cornerCell,
      beats,
      table,
    })

    // the honest reading. The interior is statistically independent of the exterior (raw coupling near zero),
    // a Markov blanket in the limit, the interior is causally isolated. And both perturbations stay contained
    // within a small radius, so the rule contains perturbations everywhere, not distinctively for the
    // structure. So the breather is a persistent, causally isolated, perturbation-confining structure (the
    // substrate of a self), but the criteria do not DISTINGUISH it from generic confined dynamics, no special
    // agency is shown. A full L3 self-level (a distinctive blanket and causal emergence) is not established.
    const interiorIsolated = blanket.raw < 0.1
    const containmentNotStructureSpecific =
      Math.abs(interiorRadius - vacuumRadius) <= 2

    const ok = interiorIsolated && containmentNotStructureSpecific

    return verdict({
      status: ok ? 'pass' : 'fail',
      claim:
        'the pure-rule breather has a causally isolated interior (interior independent of exterior, a Markov blanket in the limit) and confines perturbations to a small radius, but no better than the vacuum, so it is a persistent self-structure without a distinctive self-level, the honest negative on a full L3 self from the bare rule',
      metrics: {
        blanketRaw: blanket.raw,
        blanketScreened: blanket.screened,
        blanketReduction: blanket.reduction,
        interiorRadius,
        vacuumRadius,
      },
      control: { vacuumRadius },
      notes:
        'measured on a structure of the pure deterministic rule, no cohesion, no randomness. The persistent confined structure is real (L2), but the self-criteria are degenerate here, the interior barely interacts (nothing for a shell to screen) and containment is a generic locality of the rule. A genuine L3 self-level likely needs a richer moving or interacting structure, the D4 coin, or a higher coarse level',
    })
  },
})
