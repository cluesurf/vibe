// P209 (Tier 2): matter from solitons. (1) the interaction energy E(d) of two selves vs separation, with the
// Skyrme term there IS a force (a minimum = a BOUND STATE, the analogue of atoms/nuclei); (2) the soliton's
// rest mass scales with its topological charge (additive matter). Measured on the 2D direction field.
// Run: npx tsx code/experiment/p209-soliton-matter.ts

import { directionFieldDerrickEnergy2d } from '@/code/measure/skyrme-energy'
import { defineExperiment } from '@/test/scaffold/suite'
import { verdict } from '@/test/scaffold/verdict'

type V = [number, number, number]
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
const energy = (f: V[][], kappa: number): number => directionFieldDerrickEnergy2d(f, kappa)

export function solitonMatter(): { binding: [number, number][]; bound: boolean; massRatio: number } {
  const kappa = 2, R = 7, c = N / 2
  // (1) interaction energy vs separation (two charge-+1 solitons)
  const binding: [number, number][] = []
  let eInf = 0
  for (const d of [6, 9, 12, 16, 22, 30]) {
    const f = blank(); addSky(f, c - d / 2, c, R, 1); addSky(f, c + d / 2, c, R, 1)
    const E = Math.round(energy(f, kappa) * 10) / 10; binding.push([d, E]); if (d === 30) eInf = E
  }
  const minE = Math.min(...binding.map((b) => b[1])); const bound = binding[binding.length - 1]![1] - minE > 1 && binding.find((b) => b[1] === minE)![0] < 30
  // (2) mass vs charge (additive matter)
  const one = blank(); addSky(one, c, c, R, 1); const m1 = energy(one, kappa)
  const two = blank(); addSky(two, c - 16, c, R, 1); addSky(two, c + 16, c, R, 1)
  const massRatio = Math.round((energy(two, kappa) / m1) * 100) / 100
  return { binding, bound, massRatio }
}

export default defineExperiment({
  id: 'gauge/soliton-matter',
  title: 'two solitons bind at a finite separation and the rest mass is additive in topological charge',
  category: 'gauge',
  substrates: 'any',
  depth: 'L2',
  paper: true,
  run() {
    const r = solitonMatter()
    const ok = r.bound && r.massRatio > 1.7 && r.massRatio < 2.3
    return verdict({
      status: ok ? 'pass' : 'fail',
      claim:
        'with the Skyrme term, two charge-one solitons have an interaction energy with a minimum at finite separation, a bound state, and a charge-two configuration has roughly twice the rest mass of a charge-one one',
      metrics: {
        bound: r.bound ? 1 : 0,
        massRatio: r.massRatio,
      },
      notes:
        'L2, known physics, measured on a 2D direction field with the Skyrme coefficient kappa set by hand. The binding and the additive mass are the measured content. Whether the rule actually supplies a positive kappa is the open Skyrme-sign question, assumed here.',
    })
  },
})
