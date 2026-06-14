// The working substrate-native self, ONE field, no additions (one-tone-photon-as-phonon, the soliton resolution).
// The static-body attempts sealed their own radiation, a confining rule reflects lone charges at the body edge,
// trapping the disturbance. The resolution, make the body a MOVING SOLITON (a co-moving glider). It coheres by
// CO-MOTION, not by trapping, so lone charges stream FREELY (disturbances radiate) while the body stays together
// because its charges share one velocity. Confinement and radiation no longer conflict, the body holds by
// co-motion, disturbances leave by streaming.
//
// Under the momentum-conserving rule (headOnRotate) on the OPEN lattice, a glider is a soliton, it stays a tight
// unit and travels, and a perturbation propagates AWAY from it (different velocity) and is absorbed at the bath,
// so the glider returns to its clean form, it CORRECTS the disturbance. On the closed torus the disturbance
// persists and wraps back. So the soliton is a self, identity (it keeps its clean form) and agency (it sheds
// perturbations), in one tone field, with only the momentum-conserving collision and the open substrate, no
// photon field, no second tone, no real numbers.
//
// Depth L2, a soliton body that radiates and recovers a perturbation on the open lattice, with the closed torus
// as the no-recovery control.

import { defineExperiment } from '@/test/scaffold/suite'
import { verdict } from '@/test/scaffold/verdict'
import { d4Mesh, shellDistances, type Mesh } from '@/code/tool/mesh'
import { makeWill, cloneWill, gliderLine, type Will } from '@/code/tone/will'
import { headOnRotate, type Collision } from '@/code/rule/collision'
import { beat } from '@/code/rule/lattice-gas'
import { absorbBoundary } from '@/code/dynamics/bath'

export default defineExperiment({
  id: 'selves/soliton-self',
  title: 'a moving soliton is a self: it holds by co-motion, radiates a perturbation, and recovers via the bath',
  category: 'selves',
  substrates: ['3434'],
  depth: 'L2',
  paper: true,
  run() {
    const side = 14
    const beats = 16
    const mesh: Mesh = d4Mesh({ side })
    const degree = mesh.degree
    const opposite = Array.from({ length: degree }, (_, d) => mesh.opposite(d))
    const rule: Collision = headOnRotate({ opposite })
    const half = side / 2
    const center = half + half * side + half * side * side + half * side * side * side
    const dir = 0

    const cleanGlider = (): Will => gliderLine({ mesh, start: center, direction: dir, length: 3 }).will
    const perturbedGlider = (): Will => {
      const will = cloneWill(cleanGlider())
      // a real disturbance, a cluster of charges in OFF-glider directions at the centre (different velocities, so
      // they separate from the glider and radiate). Dirs 6..13 are not the glider's dir 0.
      for (let d = 6; d <= 13; d++) will.data[center * degree + d] = (d % 2 === 0 ? 1 : -1) as -1 | 1
      return will
    }

    // 1, the glider is a soliton, it stays a tight unit over the run.
    const cluster = (will: Will): { occupied: number; diameter: number } => {
      const occ: number[] = []
      for (let c = 0; c < mesh.cellCount; c++) {
        const base = c * degree
        for (let d = 0; d < degree; d++) if (will.data[base + d] !== 0) { occ.push(c); break }
      }
      if (occ.length <= 1) return { occupied: occ.length, diameter: 0 }
      const dd = shellDistances(mesh, occ[0]!)
      let m = 0
      for (const c of occ) if (dd[c]! > m) m = dd[c]!
      return { occupied: occ.length, diameter: m }
    }
    let g = cleanGlider()
    let maxOcc = 0
    let maxDiam = 0
    for (let t = 0; t < beats; t++) { g = beat(g, rule); const s = cluster(g); if (s.occupied > maxOcc) maxOcc = s.occupied; if (s.diameter > maxDiam) maxDiam = s.diameter }
    const solitonHolds = maxOcc <= 4 && maxDiam <= 3 // stayed a tight 3-cell unit (no dispersal)

    // 2, recovery, the difference between the perturbed and clean runs (the perturbation) over time. The glider
    // motion is common to both runs and cancels, so the difference IS the disturbance. Open absorbs it (recovery),
    // closed keeps it (persists).
    const differenceTrace = (open: boolean): { peak: number; final: number } => {
      let clean = cleanGlider()
      let pert = perturbedGlider()
      let peak = 0
      let final = 0
      for (let t = 0; t < beats; t++) {
        clean = beat(clean, rule); pert = beat(pert, rule)
        if (open) { absorbBoundary(clean); absorbBoundary(pert) }
        let diff = 0
        for (let i = 0; i < clean.data.length; i++) if (clean.data[i] !== pert.data[i]) diff++
        if (diff > peak) peak = diff
        final = diff
      }
      return { peak, final }
    }
    const open = differenceTrace(true)
    const closed = differenceTrace(false)

    // the open lattice RECOVERS (the disturbance radiates away and is absorbed, final difference far below peak),
    // the closed torus does NOT (the disturbance persists and wraps).
    const openRecovers = open.final < open.peak * 0.3
    const closedPersists = closed.final > open.final * 2

    const ok = solitonHolds && openRecovers && closedPersists
    return verdict({
      status: ok ? 'pass' : 'fail',
      claim:
        'a co-moving glider is a soliton that holds together by shared velocity (not by trapping), so under the momentum-conserving rule it stays a tight unit while a perturbation streams away from it, and on the open lattice the disturbance radiates to the bath and is absorbed so the glider returns to its clean form (recovery), while on the closed torus the disturbance persists and wraps back, so a moving soliton is a self with identity and agency, in one tone field with no additions',
      metrics: {
        solitonMaxOccupied: maxOcc,
        solitonMaxDiameter: maxDiam,
        openPeakDiff: open.peak,
        openFinalDiff: open.final,
        closedFinalDiff: closed.final,
        solitonHolds: solitonHolds ? 1 : 0,
        openRecovers: openRecovers ? 1 : 0,
        closedPersists: closedPersists ? 1 : 0,
        beats,
      },
      control: { closedFinalDiff: closed.final },
      notes:
        'the soliton self, one tone field, momentum-conserving collision, open substrate, no photon field, no second tone, no real numbers. The body holds by CO-MOTION so radiation is not sealed, a perturbation streams away and the bath absorbs it, the glider recovers. The closed torus cannot recover (the disturbance recurs). This is the substrate-native self the reduced bath-coupled model stood in for',
    })
  },
})
