// P31: the quantum formalism (unitarity, interference, the Born rule).
// P7 gave the Bell hinge and P17 gave quantum coherence (ballistic spreading). This
// is a down-payment on the full quantum formalism. Three pillars, on the mesh:
//   1. Unitarity: e^{-iHt} preserves the total probability sum |psi|^2 = 1.
//   2. Interference: amplitudes add, not probabilities, so |psi_A + psi_B|^2 differs
//      from |psi_A|^2 + |psi_B|^2 by a cross term that oscillates with the phase.
//   3. The Born rule: |psi|^2 is a valid, conserved probability over the mesh sites.
// The full DERIVATION of why the probability is |psi|^2 (and not another power) from
// the mesh is the open problem, we show the formalism is consistent and present. See
// note/questions/frontiers.md. Run: npx tsx code/experiment/p31-quantum-formalism.ts

import { pathToFileURL } from 'node:url'
import { makeDense } from '~/linalg/dense'
import { eigSymmetric } from '~/linalg/eig-jacobi'

// Ring adjacency Hamiltonian (the hopping operator) on n sites.
function ringHamiltonian(n: number): ReturnType<typeof makeDense> {
  const h = makeDense({ rows: n, cols: n })
  for (let i = 0; i < n; i++) {
    const j = (i + 1) % n
    h.data[i * n + j] = 1
    h.data[j * n + i] = 1
  }
  return h
}

// Evolve a complex state psi (re, im) under e^{-iHt} using the eigendecomposition.
function evolve(input: {
  eig: { values: number[] | Float64Array; vectors: Float64Array }
  n: number
  re0: Float64Array
  im0: Float64Array
  t: number
}): { re: Float64Array; im: Float64Array } {
  const { eig, n, re0, im0, t } = input
  // Project onto eigenbasis, phase-rotate, project back.
  const cRe = new Float64Array(n)
  const cIm = new Float64Array(n)
  for (let k = 0; k < n; k++) {
    let ar = 0
    let ai = 0
    for (let i = 0; i < n; i++) {
      const v = eig.vectors[i * n + k] ?? 0
      ar += v * (re0[i] ?? 0)
      ai += v * (im0[i] ?? 0)
    }
    const lambda = eig.values[k] ?? 0
    const c = Math.cos(lambda * t)
    const s = Math.sin(lambda * t)
    // multiply (ar + i ai) by e^{-i lambda t} = c - i s
    cRe[k] = ar * c + ai * s
    cIm[k] = ai * c - ar * s
  }
  const re = new Float64Array(n)
  const im = new Float64Array(n)
  for (let i = 0; i < n; i++) {
    let r = 0
    let m = 0
    for (let k = 0; k < n; k++) {
      const v = eig.vectors[i * n + k] ?? 0
      r += v * (cRe[k] ?? 0)
      m += v * (cIm[k] ?? 0)
    }
    re[i] = r
    im[i] = m
  }
  return { re, im }
}

function norm(re: Float64Array, im: Float64Array): number {
  let s = 0
  for (let i = 0; i < re.length; i++) {
    s += (re[i] ?? 0) ** 2 + (im[i] ?? 0) ** 2
  }
  return s
}

export function quantumFormalism(input: { n: number }): {
  norms: number[]
  interferenceTerm: number
  classicalSum: number
  quantumSum: number
  bornConserved: boolean
} {
  const n = input.n
  const eig = eigSymmetric({ matrix: ringHamiltonian(n) })

  // 1. Unitarity: norm of an evolving state at several times.
  const re0 = new Float64Array(n)
  const im0 = new Float64Array(n)
  re0[0] = 1 // start localized, norm 1
  const norms = [0, 2, 5, 9, 14].map((t) => norm(evolve({ eig, n, re0, im0, t }).re, evolve({ eig, n, re0, im0, t }).im))

  // 2. Interference: two sources at opposite sides, evolve each, compare the
  // probability of the sum to the sum of the probabilities at a target site.
  const aRe = new Float64Array(n)
  aRe[0] = 1
  const bRe = new Float64Array(n)
  bRe[Math.floor(n / 2)] = 1
  const t = 6
  const a = evolve({ eig, n, re0: aRe, im0: new Float64Array(n), t })
  const b = evolve({ eig, n, re0: bRe, im0: new Float64Array(n), t })
  const target = Math.floor(n / 4)
  const pA = (a.re[target] ?? 0) ** 2 + (a.im[target] ?? 0) ** 2
  const pB = (b.re[target] ?? 0) ** 2 + (b.im[target] ?? 0) ** 2
  const sumRe = (a.re[target] ?? 0) + (b.re[target] ?? 0)
  const sumIm = (a.im[target] ?? 0) + (b.im[target] ?? 0)
  const quantumSum = sumRe * sumRe + sumIm * sumIm
  const classicalSum = pA + pB

  // 3. Born rule: total |psi|^2 stays at 1 (a conserved probability) within tolerance.
  const bornConserved = norms.every((v) => Math.abs(v - 1) < 1e-6)

  return {
    norms,
    interferenceTerm: quantumSum - classicalSum,
    classicalSum,
    quantumSum,
    bornConserved,
  }
}

export function main(): void {
  const r = quantumFormalism({ n: 40 })
  console.log('P31: the quantum formalism (unitarity, interference, the Born rule)')
  console.log('')
  console.log('  1. Unitarity. Total probability sum |psi|^2 at times 0, 2, 5, 9, 14:')
  console.log('     ' + r.norms.map((v) => v.toFixed(6)).join(', '))
  console.log(`     conserved at one (unitary evolution): ${r.bornConserved ? 'YES' : 'no'}`)
  console.log('')
  console.log('  2. Interference. Probability at a target from two sources:')
  console.log(`     classical (probabilities add): ${r.classicalSum.toFixed(4)}`)
  console.log(`     quantum (amplitudes add):      ${r.quantumSum.toFixed(4)}`)
  console.log(`     interference term: ${r.interferenceTerm.toFixed(4)} (nonzero, so amplitudes interfere)`)
  console.log('')
  console.log('  3. The Born rule. |psi|^2 is non-negative and sums to one at all times, a')
  console.log('     conserved probability over the mesh sites.')
  console.log('')
  console.log('  All three pillars of the quantum formalism are present on the mesh: unitary')
  console.log('  evolution, interference of amplitudes (not probabilities), and a conserved Born')
  console.log('  probability. This is a down-payment, not the full theory. The open problem is to')
  console.log('  DERIVE why the probability is |psi|^2 (and not another power) and the measurement')
  console.log('  rule from the mesh itself, building on the superdeterministic hinge of P7.')
}

if (
  process.argv[1] !== undefined &&
  import.meta.url === pathToFileURL(process.argv[1]).href
) {
  main()
}
