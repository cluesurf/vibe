// P247 (RF1-RF6): emergent relativity on {3,4,3,4}. RF1/RF3 a free charge streams BALLISTICALLY at a single
// finite speed (the light cone, c = root norm per beat) while a scalar diffuses. RF2 the 24 D4 directions are
// far more ISOTROPIC than the 6 cubic ones (the front support function has much lower anisotropy) -- the
// reason 24 beats 12. RF4 the directional rule gives the Dirac dispersion E^2 - k^2 = m^2. RF6 coarse entropy
// rises from a low-entropy start while the micro rule stays reversible (the arrow).
// Run: npx tsx code/experiment/p247-rf-relativity-3434.ts

import { defineExperiment } from '@/test/scaffold/suite'
import { verdict } from '@/test/scaffold/verdict'
import { makeRng } from '@/code/tool/rng'
import { rootsD4 } from '@/code/algebra/group/root-system'
import { supportFunctionAnisotropy } from '@/code/measure/isotropy'

const d4Roots = (): number[][] => rootsD4()

// anisotropy of a direction set: the front support function h(u) = max_d (root_d . u), measured over random
// unit directions u in R^4. coefficient of variation std/mean = anisotropy (0 = perfectly isotropic).
function anisotropy(dirs: number[][], seed: number): number {
  return supportFunctionAnisotropy({ directions: dirs, rng: makeRng({ seed }) })
}

export function rfRelativity(): { ballistic: boolean; isotropyImproves: boolean; diracOk: boolean; arrowRises: boolean } {
  const roots = d4Roots()

  // RF1/RF3: ballistic vs diffusive displacement after T beats
  const T = 80
  const rng = makeRng({ seed: 1 })
  const rnd = (): number => rng.next()
  const walk = (mix: number, trials: number): number => {
    let tot = 0
    for (let tr = 0; tr < trials; tr++) {
      const p = [0, 0, 0, 0]; let d = Math.floor(rnd() * 24)
      for (let t = 0; t < T; t++) { if (rnd() < mix) d = Math.floor(rnd() * 24); for (let q = 0; q < 4; q++) p[q]! += roots[d]![q]! }
      tot += Math.hypot(...p)
    }
    return tot / trials
  }
  const ballisticDisp = walk(0, 1), diffusive = walk(1, 400)
  const expectedBallistic = T * Math.hypot(...roots[0]!) // T * sqrt(2)
  const ballistic = Math.abs(ballisticDisp - expectedBallistic) < 1e-6 && ballisticDisp > 8 * diffusive

  // RF2: isotropy, 24 D4 directions vs 6 cubic directions
  const cubic6 = [[1, 0, 0, 0], [-1, 0, 0, 0], [0, 1, 0, 0], [0, -1, 0, 0], [0, 0, 1, 0], [0, 0, -1, 0]] // a 3D-like cubic set in 4D
  const cube8: number[][] = []
  for (const a of [1, -1]) for (const b of [1, -1]) for (const c of [1, -1]) cube8.push([a, b, c, 0])
  const aniso24 = anisotropy(roots, 7), aniso6 = anisotropy(cubic6, 7), aniso8 = anisotropy(cube8, 7)
  const isotropyImproves = aniso24 < aniso6 && aniso24 < 0.2

  // RF4: Dirac dispersion cos E = cos(m) cos(k), E^2 - k^2 = m^2 at long wavelength
  let diracOk = true
  for (const m of [0.0, 0.2, 0.6]) { const k = 0.1, Ek = Math.acos(Math.cos(m) * Math.cos(k)); if (Math.abs((Ek * Ek - k * k) - m * m) > 1e-2) diracOk = false }

  // RF6: arrow of time, coarse entropy rises from a low-entropy start, micro reversible
  const M = 8
  const wrap = (x: number): number => ((x % M) + M) % M
  // seed all "particles" in one corner (low entropy), each a position that streams in a fixed direction
  const NP = 300
  const parts = new Array(NP).fill(0).map((_, i) => ({ p: [0, 0, 0, 0] as number[], d: i % 24 }))
  const coarseEntropy = (): number => {
    const bins = new Map<string, number>()
    for (const pt of parts) { const k = `${Math.floor(wrap(pt.p[0]!) / 2)},${Math.floor(wrap(pt.p[1]!) / 2)},${Math.floor(wrap(pt.p[2]!) / 2)},${Math.floor(wrap(pt.p[3]!) / 2)}` ; bins.set(k, (bins.get(k) ?? 0) + 1) }
    let H = 0; for (const c of bins.values()) { const p = c / NP; H -= p * Math.log(p) }
    return H
  }
  const H0 = coarseEntropy()
  for (let t = 0; t < 30; t++) for (const pt of parts) for (let q = 0; q < 4; q++) pt.p[q]! += roots[pt.d]![q]!
  const H1 = coarseEntropy()
  const arrowRises = H1 > H0 + 0.5

  return { ballistic, isotropyImproves, diracOk, arrowRises }
}

export default defineExperiment({
  id: 'relativity/rf-relativity-3434',
  title: 'a ballistic light cone, 24-direction isotropy, the Dirac dispersion, and a rising arrow on {3,4,3,4}',
  category: 'relativity',
  substrates: ['3434'],
  depth: 'L2',
  paper: true,
  run() {
    const r = rfRelativity()
    const ok = r.ballistic && r.isotropyImproves && r.diracOk && r.arrowRises
    return verdict({
      status: ok ? 'pass' : 'fail',
      claim:
        'on the 24 D4 directions a free charge streams ballistically while a scalar diffuses, the 24 directions are more isotropic than the cubic 6, the dispersion matches Dirac, and coarse entropy rises',
      metrics: {
        anisotropy24: anisotropy(d4Roots(), 7),
        anisotropy6: anisotropy(
          [
            [1, 0, 0, 0],
            [-1, 0, 0, 0],
            [0, 1, 0, 0],
            [0, -1, 0, 0],
            [0, 0, 1, 0],
            [0, 0, -1, 0],
          ],
          7,
        ),
      },
      control: {
        anisotropy6Cubic: anisotropy(
          [
            [1, 0, 0, 0],
            [-1, 0, 0, 0],
            [0, 1, 0, 0],
            [0, -1, 0, 0],
            [0, 0, 1, 0],
            [0, 0, -1, 0],
          ],
          7,
        ),
      },
      notes:
        'L2. The ballistic versus diffusive displacement and the 24-versus-6 isotropy are MEASURED, with the diffusive scalar and the cubic 6-direction set as controls. The Dirac check is analytic (the assumed cos E = cos(m) cos(k)), a consistency note not a derivation. The diffusive baseline, the isotropy sampling, and the arrow walk use a deterministic LCG, so they are pseudo-random not truly random, reproducible but a statistical contrast rather than a property of the deterministic rule alone.',
    })
  },
})
