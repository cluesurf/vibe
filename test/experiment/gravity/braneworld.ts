// P90: the short-range gravity test, 3D substrate versus 4D bulk. (Implements todo T6.)
//
// Matter is effectively three-dimensional (orbit stability, P68), but the substrate could be a bare
// 3D crystal OR a 4D bulk with matter on a 3D slice (a braneworld, see
// note/research/vibe/notes/is-the-substrate-3d-or-4d.md). These differ observationally at short
// range. A bare 3D substrate gives pure inverse-square gravity (force ~ 1/r^2) at every scale. A 4D
// bulk with a compact extra dimension of size L gives genuinely 4D gravity (force ~ 1/r^3) at short
// range r << L, crossing over to 3D (1/r^2) at long range r >> L. Summing the Kaluza-Klein modes
// over the compact dimension has a clean closed form,
//   G_brane(r) = 1 / (4 pi L r (1 - exp(-2 pi r / L))),
// which is 1/r^2 (4D) for r << L and 1/r (3D) for r >> L. So the SIGNATURE is the force-law
// exponent at short range: -2 means a 3D substrate, a deviation toward -3 means a 4D bulk, and the
// crossover scale is the size of the extra dimension. Gravity is measured inverse-square down to
// tens of microns, so a bulk's extra dimension must be smaller than that, or the substrate is 3D.
// Run: npx tsx code/experiment/p90-braneworld.ts

import { pathToFileURL } from 'node:url'
import { defineExperiment } from '@/test/scaffold/suite'
import { verdict } from '@/test/scaffold/verdict'

const PI = Math.PI

// Potential felt on the brane in a 4D bulk with a compact extra dimension of size L (the KK sum).
function potentialBrane(r: number, L: number): number {
  return 1 / (4 * PI * L * r * (1 - Math.exp((-2 * PI * r) / L)))
}

// Potential in a bare 3D substrate (matter fills all three dimensions): pure 1/r.
function potential3D(r: number): number {
  return 1 / (4 * PI * r)
}

// The local force-law exponent d ln(force) / d ln(r), force = -dG/dr.
function forceExponent(potential: (r: number) => number, r: number): number {
  const h = r * 0.01
  const force = (rr: number): number => -(potential(rr + h) - potential(rr - h)) / (2 * h)
  return (
    (Math.log(force(r * 1.05)) - Math.log(force(r * 0.95))) /
    (Math.log(r * 1.05) - Math.log(r * 0.95))
  )
}

export function braneworld(): {
  substrateShortExponent: number
  substrateLongExponent: number
  substrateFlat: boolean
  braneShortExponent: number
  braneLongExponent: number
  braneShowsCrossover: boolean
  crossoverScaleOverL: number
  distinguishable: boolean
  solved: boolean
} {
  const L = 1
  const rShort = 0.03 * L
  const rLong = 20 * L

  // bare 3D substrate: inverse-square at every scale
  const substrateShortExponent = forceExponent((r) => potential3D(r), rShort)
  const substrateLongExponent = forceExponent((r) => potential3D(r), rLong)
  const substrateFlat =
    Math.abs(substrateShortExponent + 2) < 0.05 && Math.abs(substrateLongExponent + 2) < 0.05

  // 4D bulk with a compact extra dimension: 4D short, 3D long
  const braneShortExponent = forceExponent((r) => potentialBrane(r, L), rShort)
  const braneLongExponent = forceExponent((r) => potentialBrane(r, L), rLong)
  const braneShowsCrossover =
    braneShortExponent < -2.7 && Math.abs(braneLongExponent + 2) < 0.05

  // the crossover scale: where the exponent passes the midpoint -2.5
  let crossover = L
  for (let lr = -2; lr <= 2; lr += 0.01) {
    const r = Math.pow(10, lr) * L
    if (forceExponent((rr) => potentialBrane(rr, L), r) > -2.5) {
      crossover = r
      break
    }
  }
  const crossoverScaleOverL = crossover / L

  // the test: at short range the brane deviates from inverse-square, the 3D substrate does not
  const distinguishable = Math.abs(braneShortExponent + 2) > 0.3 && Math.abs(substrateShortExponent + 2) < 0.05

  const solved =
    substrateFlat &&
    braneShowsCrossover &&
    distinguishable &&
    crossoverScaleOverL > 0.2 &&
    crossoverScaleOverL < 5

  return {
    substrateShortExponent,
    substrateLongExponent,
    substrateFlat,
    braneShortExponent,
    braneLongExponent,
    braneShowsCrossover,
    crossoverScaleOverL,
    distinguishable,
    solved,
  }
}

export function main(): void {
  const r = braneworld()
  console.log('P90: short-range gravity test, 3D substrate versus 4D bulk')
  console.log('')
  console.log('  force-law exponent (inverse-square is -2, 4D is -3):')
  console.log(`    bare 3D substrate:  short ${r.substrateShortExponent.toFixed(2)}   long ${r.substrateLongExponent.toFixed(2)}  (flat at -2: ${r.substrateFlat})`)
  console.log(`    4D bulk + 3D brane: short ${r.braneShortExponent.toFixed(2)}   long ${r.braneLongExponent.toFixed(2)}  (crossover: ${r.braneShowsCrossover})`)
  console.log('')
  console.log(`  crossover scale (in units of the extra-dimension size L): ${r.crossoverScaleOverL.toFixed(2)}`)
  console.log('')
  console.log('  the signature: a short-range deviation from inverse-square means a 4D bulk;')
  console.log('  pure inverse-square at all scales means a bare 3D substrate.')
  console.log(`  distinguishable: ${r.distinguishable}`)
  console.log('  (gravity is inverse-square down to tens of microns, so any extra dimension is')
  console.log('   smaller than that, or the substrate is simply 3D)')
  console.log('')
  console.log(`  SOLVED: ${r.solved}`)
}

if (process.argv[1] !== undefined && import.meta.url === pathToFileURL(process.argv[1]).href) {
  main()
}

export default defineExperiment({
  id: 'gravity/braneworld',
  title: '3D substrate inverse-square at all scales, 4D bulk deviates to -3 at short range',
  category: 'gravity',
  substrates: 'any',
  depth: 'L2',
  paper: true,
  run() {
    const r = braneworld()
    const ok =
      r.solved &&
      r.substrateFlat &&
      r.braneShowsCrossover &&
      r.distinguishable
    return verdict({
      status: ok ? 'pass' : 'fail',
      claim:
        'a bare 3D substrate is inverse-square at every scale while a 4D bulk deviates to exponent minus three at short range, crossing over at the bulk size',
      metrics: {
        substrateShortExponent: r.substrateShortExponent,
        braneShortExponent: r.braneShortExponent,
        braneLongExponent: r.braneLongExponent,
        crossoverScaleOverL: r.crossoverScaleOverL,
      },
    })
  },
})
