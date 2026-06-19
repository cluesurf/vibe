// 1A WORKING (plans/bound-body-base-modifications), the full self on LEGITIMATE ingredients. The positive control
// showed a self needs one added thing, an attraction. Here that attraction is a genuine discrete FIELD (gravity),
// not the centroid cheat, an integer potential sourced by the body's mass, with masses falling down its gradient.
// This is at the CUSP (d4Mesh is the flat D4 horosphere lattice of the {3,4,3,4} cusp, where physics lives).
//
// The complete self, all discrete, no real numbers.
//   - IDENTITY, the rest slot (0C) holds a persistent body, and excluded volume (one mass per cell) keeps it from
//     collapsing under the attraction.
//   - SELF-REPAIR, the gravity field's gradient pulls a displaced piece back to the body (a real restoring force
//     from a field, sourced by the bulk mass so a lone piece feels the body's well without a self-force).
//   - RADIATION, a moving disturbance still streams to the bath and is absorbed (the energy scale of the rest slot
//     separates bound rest mass from free moving radiation).
//
// So the bare five things are missing exactly ONE ingredient, a discrete attraction, and a discrete gravity field
// supplies it legitimately (a field with its own dynamics, integer-valued). The cost is a sixth ingredient (the
// field). Whether the attraction should instead come from the hyperbolic BULK geometry (curvature confinement, no
// added field) is the open cusp-versus-bulk question.
//
// Depth L2, the full self with a legitimate discrete gravity field at the cusp.

import { experiment } from '@/test/scaffold/suite'
import { verdict } from '@/test/scaffold/verdict'
import { d4Mesh, d4MeshWithRest, type Mesh } from '@/code/tool/mesh'
import { makeWill, cloneWill, type Will } from '@/code/tone/will'
import { headOnRotate } from '@/code/rule/collision'
import { beatInto, streamSourceTable } from '@/code/rule/lattice-gas'
import { absorbBoundary } from '@/code/dynamics/bath'
import {
  bulkMass,
  relaxPotential,
  gravityMoves,
} from '@/code/dynamics/gravity-field'

export default experiment({
  id: 'selves/gravity-bound-self',
  title:
    'the full self on legitimate ingredients: a discrete gravity field (at the cusp) binds and self-repairs while disturbances radiate',
  category: 'selves',
  substrates: ['3434-rest'],
  depth: 'L2',
  paper: true,
  run() {
    const side = 14
    const beats = 30
    const coin: Mesh = d4MeshWithRest({ side })
    const base: Mesh = d4Mesh({ side })
    const degree = coin.degree
    const rest = degree - 1
    const spatialDegree = 24
    const opposite = Array.from({ length: degree }, (_, d) =>
      coin.opposite(d),
    )
    const rule = headOnRotate({ opposite })
    const half = side / 2
    // a BOUNDED few-bit field, phi in [-cap, cap], the count of at most `cap` token-bits per cell, NOT an arbitrary
    // integer. cap 6 is thirteen levels (about four bits) and repairs displacements out to three.
    const cap = 6
    const strength = 6
    const coord = (c: number): [number, number, number, number] => [
      c % side,
      Math.floor(c / side) % side,
      Math.floor(c / (side * side)) % side,
      Math.floor(c / (side * side * side)) % side,
    ]
    const center =
      half +
      half * side +
      half * side * side +
      half * side * side * side
    const neighbour = (c: number, d: number): number =>
      base.neighbour(c, d)

    const table = streamSourceTable(coin) // precompute the stream gather once, reused for every beat
    const restBody = (): Will => {
      const will = makeWill(coin)
      for (let c = 0; c < coin.cellCount; c++) {
        const [x, y, z, w] = coord(c)
        if (
          (x - half) ** 2 +
            (y - half) ** 2 +
            (z - half) ** 2 +
            (w - half) ** 2 <=
          4
        )
          will.data[c * degree + rest] = 1
      }
      return will
    }
    const scratchOf = (will: Will): Will => ({
      mesh: coin,
      data: new Int8Array(will.data.length),
    })
    const occupiedOf = (will: Will): Uint8Array => {
      const o = new Uint8Array(coin.cellCount)
      for (let c = 0; c < coin.cellCount; c++)
        o[c] = will.data[c * degree + rest]! > 0 ? 1 : 0
      return o
    }
    const extent = (will: Will): number => {
      let e = 0
      for (let c = 0; c < coin.cellCount; c++) {
        let on = false
        const b = c * degree
        for (let d = 0; d < degree; d++)
          if (will.data[b + d] !== 0) {
            on = true
            break
          }
        if (on) {
          const [x, y, z, w] = coord(c)
          const dd =
            Math.abs(x - half) +
            Math.abs(y - half) +
            Math.abs(z - half) +
            Math.abs(w - half)
          if (dd > e) e = dd
        }
      }
      return e
    }

    // one beat, stream and collide the moving charges (radiation), then gravity moves the rest masses, then the
    // bath. The potential is warm-started across beats (the body moves little).
    const evolve = (
      will: Will,
      scratch: Will,
      phi: Int32Array,
      warmSweeps: number,
      open: boolean,
    ): { will: Will; phi: Int32Array } => {
      beatInto({ src: will, dst: scratch, table, collision: rule })
      const next = scratch
      const occupied = occupiedOf(next)
      const source = bulkMass({
        occupied,
        neighbour,
        cellCount: coin.cellCount,
        spatialDegree,
        minNeighbours: 3,
      })
      const newPhi = relaxPotential({
        source,
        neighbour,
        cellCount: coin.cellCount,
        spatialDegree,
        sweeps: warmSweeps,
        strength,
        cap,
        warm: phi,
      })
      // the force, each isolated rest mass hops down the gradient to the lowest-potential empty neighbour.
      for (const [from, to] of gravityMoves({
        occupied,
        phi: newPhi,
        neighbour,
        cellCount: coin.cellCount,
        spatialDegree,
        minNeighbours: 3,
      })) {
        next.data[from * degree + rest] = 0
        next.data[to * degree + rest] = 1
      }
      if (open) absorbBoundary(next)
      return { will: next, phi: newPhi }
    }
    const initialPhi = (will: Will): Int32Array =>
      relaxPotential({
        source: bulkMass({
          occupied: occupiedOf(will),
          neighbour,
          cellCount: coin.cellCount,
          spatialDegree,
          minNeighbours: 3,
        }),
        neighbour,
        cellCount: coin.cellCount,
        spatialDegree,
        sweeps: 30,
        strength,
        cap,
      })

    // 1. identity, the body persists and does not collapse.
    let body = restBody()
    let phiB = initialPhi(body)
    let bodyScratch = scratchOf(body)
    const bodyExtent = extent(body)
    const startOcc = occupiedOf(body).reduce((a, b) => a + b, 0)
    for (let t = 0; t < beats; t++) {
      const r = evolve(body, bodyScratch, phiB, 4, false)
      bodyScratch = body
      body = r.will
      phiB = r.phi
    }
    const endExtent = extent(body)
    const endOcc = occupiedOf(body).reduce((a, b) => a + b, 0)
    const persists = endExtent === bodyExtent && endOcc === startOcc

    // 2. self-repair, a piece broken off three cells away returns (the field pulls it back).
    const farDisplaced = (): Will => {
      const w = cloneWill(restBody())
      let nb = center
      for (let k = 0; k < 3; k++) nb = base.neighbour(nb, 0)
      w.data[center * degree + rest] = 0
      w.data[nb * degree + rest] = 1
      return w
    }
    let displaced = farDisplaced()
    let phiD = initialPhi(displaced)
    let displacedScratch = scratchOf(displaced)
    const displacedStart = extent(displaced)
    for (let t = 0; t < beats; t++) {
      const r = evolve(displaced, displacedScratch, phiD, 4, false)
      displacedScratch = displaced
      displaced = r.will
      phiD = r.phi
    }
    const displacedEnd = extent(displaced)
    const selfRepairs =
      displacedStart > bodyExtent && displacedEnd <= bodyExtent

    // 3. radiation, a moving disturbance sheds to the bath (open) and persists on the closed torus.
    const withDisturbance = (): Will => {
      const w = cloneWill(restBody())
      for (let d = 0; d < 8; d++) w.data[center * degree + d] = 1
      return w
    }
    const radiation = (open: boolean): number => {
      let clean = restBody(),
        pert = withDisturbance()
      let phiC = initialPhi(clean),
        phiP = initialPhi(pert)
      let cleanScratch = scratchOf(clean),
        pertScratch = scratchOf(pert)
      let final = 0
      for (let t = 0; t < beats; t++) {
        const a = evolve(clean, cleanScratch, phiC, 4, open)
        cleanScratch = clean
        clean = a.will
        phiC = a.phi
        const b = evolve(pert, pertScratch, phiP, 4, open)
        pertScratch = pert
        pert = b.will
        phiP = b.phi
        let d = 0
        for (let i = 0; i < clean.data.length; i++)
          if (clean.data[i] !== pert.data[i]) d++
        final = d
      }
      return final
    }
    const openFinal = radiation(true)
    const closedFinal = radiation(false)
    const radiates = openFinal === 0 && closedFinal > 0

    const ok = persists && selfRepairs && radiates
    return verdict({
      status: ok ? 'pass' : 'fail',
      claim:
        'the full self stands on legitimate discrete ingredients, a rest slot for identity and the energy scale, a discrete gravity field for the attraction (an integer potential sourced by the bulk mass, masses falling down its gradient, the way physics adds a force, not a coded cohesion bias), excluded volume for the short-range repulsion that prevents collapse, and the open lattice as the bath, the body persists without collapsing (identity), a piece broken off three cells away is pulled back by the field (self-repair), and a moving disturbance streams to the bath and is absorbed while persisting on the closed torus (radiation), all discrete with no real numbers, at the cusp (the flat D4 horosphere where physics lives), the cost is one added ingredient, the field',
      metrics: {
        bodyExtent,
        bodyEndExtent: endExtent,
        bodyStartOccupied: startOcc,
        bodyEndOccupied: endOcc,
        displacedStartExtent: displacedStart,
        displacedEndExtent: displacedEnd,
        radiationOpenFinal: openFinal,
        radiationClosedFinal: closedFinal,
        persists: persists ? 1 : 0,
        selfRepairs: selfRepairs ? 1 : 0,
        radiates: radiates ? 1 : 0,
        beats,
      },
      control: {
        displacedStartExtent: displacedStart,
        displacedEndExtent: displacedEnd,
      },
      notes:
        'the first full self on legitimate ingredients (no cheat). The attraction is a real discrete field (gravity), not a hand-set move-toward-centroid. Identity (rest slot) and the energy scale and the bath are all already legitimate and discrete, so the whole self closes with one added field. This gravity is at the CUSP (the flat D4 horosphere). The open alternative is to source the attraction from the hyperbolic BULK geometry (curvature confinement) instead of an added field',
    })
  },
})
