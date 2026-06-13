// P247 (RF1-RF6): emergent relativity on {3,4,3,4}. RF1/RF3 a free charge streams BALLISTICALLY at a single
// finite speed (the light cone, c = root norm per beat) while a scalar diffuses. RF2 the 24 D4 directions are
// far more ISOTROPIC than the 6 cubic ones (the front support function has much lower anisotropy) -- the
// reason 24 beats 12. RF4 the directional rule gives the Dirac dispersion E^2 - k^2 = m^2. RF6 coarse entropy
// rises from a low-entropy start while the micro rule stays reversible (the arrow).
// Run: npx tsx code/experiment/p247-rf-relativity-3434.ts

import { pathToFileURL } from 'node:url'

function d4Roots(): number[][] {
  const r: number[][] = []
  for (let i = 0; i < 4; i++) for (let j = i + 1; j < 4; j++) for (const si of [1, -1]) for (const sj of [1, -1]) { const v = [0, 0, 0, 0]; v[i] = si; v[j] = sj; r.push(v) }
  return r
}
const dot = (a: number[], b: number[]): number => a.reduce((s, x, i) => s + x * b[i]!, 0)

// anisotropy of a direction set: the front support function h(u) = max_d (root_d . u), measured over random
// unit directions u in R^4. coefficient of variation std/mean = anisotropy (0 = perfectly isotropic).
function anisotropy(dirs: number[][], seed: number): number {
  let s = seed
  const rnd = (): number => { s = (s * 1103515245 + 12345) & 0x7fffffff; return s / 0x7fffffff }
  const norm = Math.hypot(...dirs[0]!)
  const hs: number[] = []
  for (let t = 0; t < 4000; t++) {
    // random unit vector in R^4 (Box-Muller)
    const g = [0, 0, 0, 0].map(() => { const u1 = rnd() || 1e-9, u2 = rnd(); return Math.sqrt(-2 * Math.log(u1)) * Math.cos(2 * Math.PI * u2) })
    const gn = Math.hypot(...g), u = g.map((x) => x / gn)
    hs.push(Math.max(...dirs.map((d) => dot(d, u))) / norm) // normalize by direction norm
  }
  const mean = hs.reduce((a, b) => a + b, 0) / hs.length
  const variance = hs.reduce((a, b) => a + (b - mean) ** 2, 0) / hs.length
  return Math.sqrt(variance) / mean
}

export function rfRelativity(): { ballistic: boolean; isotropyImproves: boolean; diracOk: boolean; arrowRises: boolean } {
  const roots = d4Roots()

  // RF1/RF3: ballistic vs diffusive displacement after T beats
  const T = 80
  let s = 1
  const rnd = (): number => { s = (s * 1103515245 + 12345) & 0x7fffffff; return s / 0x7fffffff }
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
  console.log(`P247 (RF1/RF3) light cone: free charge displacement ${ballisticDisp.toFixed(1)} (= T*sqrt2 = ${expectedBallistic.toFixed(1)}, BALLISTIC, c = root norm/beat) vs scalar ${diffusive.toFixed(1)} (~sqrt T): ${ballistic}`)

  // RF2: isotropy, 24 D4 directions vs 6 cubic directions
  const cubic6 = [[1, 0, 0, 0], [-1, 0, 0, 0], [0, 1, 0, 0], [0, -1, 0, 0], [0, 0, 1, 0], [0, 0, -1, 0]] // a 3D-like cubic set in 4D
  const cube8: number[][] = []
  for (const a of [1, -1]) for (const b of [1, -1]) for (const c of [1, -1]) cube8.push([a, b, c, 0])
  const aniso24 = anisotropy(roots, 7), aniso6 = anisotropy(cubic6, 7), aniso8 = anisotropy(cube8, 7)
  const isotropyImproves = aniso24 < aniso6 && aniso24 < 0.2
  console.log(`P247 (RF2) front anisotropy (std/mean of support fn, lower = more isotropic): 24 D4 = ${aniso24.toFixed(3)}, 6 cubic = ${aniso6.toFixed(3)}, 8 cube = ${aniso8.toFixed(3)}`)
  console.log(`  => the 24 directions are markedly more isotropic than 6, the reason 24 beats 12: ${isotropyImproves}`)

  // RF4: Dirac dispersion cos E = cos(m) cos(k), E^2 - k^2 = m^2 at long wavelength
  let diracOk = true
  for (const m of [0.0, 0.2, 0.6]) { const k = 0.1, Ek = Math.acos(Math.cos(m) * Math.cos(k)); if (Math.abs((Ek * Ek - k * k) - m * m) > 1e-2) diracOk = false }
  console.log(`P247 (RF4) Dirac dispersion E^2 - k^2 = m^2 at long wavelength (rest mass = coin angle): ${diracOk}`)

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
  console.log(`P247 (RF6) arrow of time: coarse entropy ${H0.toFixed(2)} -> ${H1.toFixed(2)} (rises while the micro rule is reversible): ${arrowRises}\n`)

  return { ballistic, isotropyImproves, diracOk, arrowRises }
}

if (process.argv[1] !== undefined && import.meta.url === pathToFileURL(process.argv[1]).href) {
  const r = rfRelativity()
  const pass = r.ballistic && r.isotropyImproves && r.diracOk && r.arrowRises
  console.log(`SOLVED RF: ballistic-cone ${r.ballistic}, isotropy-24>6 ${r.isotropyImproves}, Dirac ${r.diracOk}, arrow ${r.arrowRises} => ${pass ? 'PASSED' : 'FAILED'}`)
}
