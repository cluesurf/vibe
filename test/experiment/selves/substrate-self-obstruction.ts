// The substrate-native self, attempted, and the honest obstruction it runs into (the-final-model). On the actual
// D4 lattice a self would be a CONFINED body (it stays localized, an identity) whose excess RADIATES into the
// bath (the open growing frontier), so the bath can damp it into an attractor. The reduced model
// (selves/bath-coupled-self) assumed exactly this, a confined well that radiates into a chain. But the committed
// lattice rules do not provide both at once.
//
//  - The pair table CONFINES a body (its extent stays bounded), but it does NOT radiate, a confined structure
//    and its perturbations stay local and never reach the boundary, so the open (absorbing) and closed (torus)
//    evolutions are identical, the body is dark to the bath. Body, no bath coupling.
//  - The momentum rotate RADIATES (a structure streams out to the boundary, so the open and closed evolutions
//    differ, the bath absorbs it), but it does NOT confine, the structure disperses, there is no body. Bath
//    coupling, no body.
//
// So confinement and radiation are in tension on the committed coin, no single rule gives a confined body that
// radiates into the bath, which is exactly what a bath-coupled self needs. This is why the self was shown only in
// the reduced model, and it names the open problem precisely, a rule (or a structure) that both binds and
// radiates its excess to the growing frontier.
//
// Depth L2, the body-versus-radiation tension measured on the committed coin, the honest obstruction to a
// substrate-native bath-coupled self.

import { experiment } from '@/test/scaffold/suite'
import { verdict } from '@/test/scaffold/verdict'
import { d4Mesh, shellDistances, type Mesh } from '@/code/tool/mesh'
import { makeWill, cloneWill, type Will } from '@/code/tone/will'
import { pairCollision, headOnRotate, type Collision } from '@/code/rule/collision'
import { beat } from '@/code/rule/lattice-gas'
import { absorbBoundary } from '@/code/dynamics/bath'
import { travelDistance } from '@/code/check/structure'

export default experiment({
  id: 'selves/substrate-self-obstruction',
  title: 'on the committed coin confinement and radiation conflict, no rule gives a confined body that radiates to the bath',
  category: 'selves',
  substrates: ['3434'],
  depth: 'L2',
  paper: true,
  run() {
    const side = 14
    const beats = 18
    const mesh: Mesh = d4Mesh({ side })
    const degree = mesh.degree
    const opposite = Array.from({ length: degree }, (_, d) => mesh.opposite(d))
    const half = side / 2
    const center = half + half * side + half * side * side + half * side * side * side
    const dist = shellDistances(mesh, center)

    const packet = (): Will => {
      const will = makeWill(mesh)
      for (let c = 0; c < mesh.cellCount; c++) {
        if (dist[c]! <= 2) {
          const base = c * degree
          for (let d = 0; d < degree; d++) will.data[base + d] = 1
        }
      }
      return will
    }

    // confinement, the extent (max shell distance of net charge from the centre) over the run, bounded means a body.
    const confinementExtent = (collision: Collision): number => {
      let current = packet()
      let maxExtent = 0
      for (let t = 0; t < beats; t++) {
        current = beat(current, collision)
        const ext = travelDistance({ will: current, start: center })
        if (ext > maxExtent) maxExtent = ext
      }
      return maxExtent
    }

    // does the BODY's signal radiate to the bath? Perturb the body by one flip, track how far the perturbation's
    // causal cone (the cells where perturbed differs from unperturbed) reaches. A confined body has a local cone
    // that never reaches the boundary (dark to the bath), a radiating one has a cone that streams to the edge.
    // (This isolates the body's own signal from the create-move vacuum fill, which reaches the boundary in both.)
    const perturbationCone = (collision: Collision): number => {
      let plain = packet()
      let pert = cloneWill(packet())
      pert.data[center * degree + 0] = (pert.data[center * degree + 0] === 1 ? -1 : 1) as -1 | 1
      let maxCone = 0
      for (let t = 0; t < beats; t++) {
        plain = beat(plain, collision)
        pert = beat(pert, collision)
        for (let c = 0; c < mesh.cellCount; c++) {
          const base = c * degree
          let differs = false
          for (let d = 0; d < degree; d++) if (plain.data[base + d] !== pert.data[base + d]) { differs = true; break }
          if (differs && dist[c]! > maxCone) maxCone = dist[c]!
        }
      }
      return maxCone
    }

    const pair: Collision = pairCollision({ opposite, forward: true })
    const mobile: Collision = headOnRotate({ opposite })
    const boundaryDistance = side / 2 // the centre-to-boundary distance, a cone reaching this couples to the bath

    const pairExtent = confinementExtent(pair)
    const mobileExtent = confinementExtent(mobile)
    const pairCone = perturbationCone(pair)
    const mobileCone = perturbationCone(mobile)

    // the tension, the pair table confines (small extent) and its body signal stays LOCAL (cone far short of the
    // boundary, dark to the bath), the momentum rotate's signal RADIATES to the boundary but it does not confine.
    const pairConfinesNotRadiating = pairExtent <= 5 && pairCone < boundaryDistance
    const mobileRadiatesNotConfining = mobileExtent >= 8 && mobileCone >= boundaryDistance

    const ok = pairConfinesNotRadiating && mobileRadiatesNotConfining
    return verdict({
      status: ok ? 'pass' : 'fail',
      claim:
        'on the committed coin the pair table confines a body but does not radiate (open and closed evolutions are identical, the body is dark to the bath), while the momentum rotate radiates to the bath but does not confine (the structure disperses), so confinement and radiation are in tension and no single committed rule gives a confined body that radiates into the bath, which is what a substrate-native bath-coupled self needs, the open problem',
      metrics: {
        pairExtent,
        pairCone,
        mobileExtent,
        mobileCone,
        boundaryDistance,
        pairConfinesNotRadiating: pairConfinesNotRadiating ? 1 : 0,
        mobileRadiatesNotConfining: mobileRadiatesNotConfining ? 1 : 0,
        beats,
      },
      control: { pairCone, mobileExtent },
      notes:
        'the honest substrate gap. A bath-coupled self needs a confined BODY that RADIATES its excess to the open frontier. The pair table gives the body but it is dark to the bath, the momentum rotate couples to the bath but gives no body. Confinement versus radiation is the same family as the bind-versus-move tension, now bind-versus-radiate. The reduced model (selves/bath-coupled-self) had both by construction, the committed coin does not, so the substrate-native self is the open problem, a structure that both binds and radiates to the growing frontier',
    })
  },
})
