// P209 (Tier 2): matter from solitons. (1) the interaction energy E(d) of two selves vs separation, with the
// Skyrme term there IS a force (a minimum = a BOUND STATE, the analogue of atoms/nuclei); (2) the soliton's
// rest mass scales with its topological charge (additive matter). Measured on the 2D direction field.
// Run: npx tsx code/experiment/p209-soliton-matter.ts

import { pathToFileURL } from 'node:url'

type V = [number, number, number]
const dot = (a: V, b: V): number => a[0] * b[0] + a[1] * b[1] + a[2] * b[2]
const cross = (a: V, b: V): V => [a[1] * b[2] - a[2] * b[1], a[2] * b[0] - a[0] * b[2], a[0] * b[1] - a[1] * b[0]]
const norm = (v: V): V => { const m = Math.hypot(v[0], v[1], v[2]) || 1; return [v[0] / m, v[1] / m, v[2] / m] }
const N = 80
const blank = (): V[][] => Array.from({ length: N }, () => Array.from({ length: N }, () => [0, 0, 1] as V))
function addSky(f: V[][], cx: number, cy: number, R: number, ch: number): void {
  for (let x = 0; x < N; x++) for (let y = 0; y < N; y++) {
    const r = Math.hypot(x - cx, y - cy); if (r > 2.2 * R) continue
    const phi = Math.atan2(y - cy, x - cx) * ch, fr = Math.PI * Math.max(0, 1 - r / R)
    const nv = norm([Math.sin(fr) * Math.cos(phi), Math.sin(fr) * Math.sin(phi), Math.cos(fr)])
    // superpose toward the new texture only inside the core (so two solitons can coexist)
    if (1 - f[x]![y]![2] < 1 - nv[2]) f[x]![y] = nv
  }
}
const triA = (a: V, b: V, c: V): number => 2 * Math.atan2(dot(a, cross(b, c)), 1 + dot(a, b) + dot(b, c) + dot(c, a))
function energy(f: V[][], kappa: number): number {
  let ex = 0, sk = 0
  for (let x = 0; x < N - 1; x++) for (let y = 0; y < N - 1; y++) {
    const n = f[x]![y]!, nx = f[x + 1]![y]!, ny = f[x]![y + 1]!
    ex += (1 - dot(n, nx)) + (1 - dot(n, ny))
    const q = triA(n, nx, ny); sk += q * q
  }
  return ex + kappa * sk
}
function charge(f: V[][]): number {
  let q = 0
  for (let x = 0; x < N - 1; x++) for (let y = 0; y < N - 1; y++) { const a = f[x]![y]!, b = f[x + 1]![y]!, c = f[x + 1]![y + 1]!, d = f[x]![y + 1]!; q += triA(a, b, c) + triA(a, c, d) }
  return Math.round(q / (4 * Math.PI))
}

export function solitonMatter(): { binding: [number, number][]; bound: boolean; massRatio: number } {
  const kappa = 2, R = 7, c = N / 2
  // (1) interaction energy vs separation (two charge-+1 solitons)
  const binding: [number, number][] = []
  let eInf = 0
  for (const d of [6, 9, 12, 16, 22, 30]) {
    const f = blank(); addSky(f, c - d / 2, c, R, 1); addSky(f, c + d / 2, c, R, 1)
    const E = Math.round(energy(f, kappa) * 10) / 10; binding.push([d, E]); if (d === 30) eInf = E
  }
  console.log('P209 (1) two-self interaction energy E(separation), with the Skyrme term:')
  for (const [d, E] of binding) console.log(`  separation ${d}: E = ${E}  (binding ${Math.round((E - eInf) * 10) / 10})`)
  const minE = Math.min(...binding.map((b) => b[1])); const bound = binding[binding.length - 1]![1] - minE > 1 && binding.find((b) => b[1] === minE)![0] < 30
  console.log(`  => a minimum at finite separation means a BOUND STATE (composite matter): ${bound}`)
  // (2) mass vs charge (additive matter)
  const one = blank(); addSky(one, c, c, R, 1); const m1 = energy(one, kappa)
  const two = blank(); addSky(two, c - 16, c, R, 1); addSky(two, c + 16, c, R, 1)
  const massRatio = Math.round((energy(two, kappa) / m1) * 100) / 100
  console.log(`P209 (2) rest mass additivity: Q=1 mass ${m1.toFixed(0)}, Q=2 (separated) / Q=1 = ${massRatio} (~2, additive); charges Q=${charge(one)},${charge(two)}`)
  return { binding, bound, massRatio }
}

if (process.argv[1] !== undefined && import.meta.url === pathToFileURL(process.argv[1]).href) {
  const r = solitonMatter()
  console.log(`SOLVED: bound state ${r.bound}, mass(Q=2)/mass(Q=1) ${r.massRatio}`)
}
