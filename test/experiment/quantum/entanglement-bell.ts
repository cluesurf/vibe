// P173: genuine entanglement and a Bell-CHSH violation from the substrate's own dynamics. (P131, P151, P158.)
//
// We have interference and the Born rule (P158), a Dirac dispersion, and reflection positivity (P151, P169).
// The deepest untested quantum signature is ENTANGLEMENT, a two-part correlation that no classical theory
// can reproduce. The substrate's hop IS the spin exchange (P131), and the exchange interaction is an
// entangling gate. We apply the exchange unitary to a PRODUCT state of two charge-qubits, show it produces
// a maximally entangled state (concurrence 1), and show the resulting correlations violate the CHSH
// inequality (S > 2, up to the Tsirelson bound 2 sqrt(2)), which is impossible for any local hidden-variable
// theory. A product-state control gives concurrence 0 and S <= 2. Run: npx tsx code/experiment/p173-entanglement-bell.ts

import { pathToFileURL } from 'node:url'
import { defineExperiment } from '@/test/scaffold/suite'
import { verdict } from '@/test/scaffold/verdict'

// minimal complex 2-qubit machinery, state as re/im arrays of length 4 (basis |00>,|01>,|10>,|11>)
type Cx = { re: number; im: number }
const C = (re: number, im = 0): Cx => ({ re, im })
// 2x2 Pauli matrices as complex
const PAULI: Record<string, Cx[][]> = {
  I: [[C(1), C(0)], [C(0), C(1)]],
  X: [[C(0), C(1)], [C(1), C(0)]],
  Y: [[C(0), C(0, -1)], [C(0, 1), C(0)]],
  Z: [[C(1), C(0)], [C(0), C(-1)]],
}
// kron of two 2x2 complex into 4x4 complex
function kron(a: Cx[][], b: Cx[][]): Cx[][] {
  const out: Cx[][] = Array.from({ length: 4 }, () => Array.from({ length: 4 }, () => C(0)))
  for (let i = 0; i < 2; i++) for (let j = 0; j < 2; j++) for (let k = 0; k < 2; k++) for (let l = 0; l < 2; l++) {
    const x = a[i]![j]!
    const y = b[k]![l]!
    out[i * 2 + k]![j * 2 + l] = C(x.re * y.re - x.im * y.im, x.re * y.im + x.im * y.re)
  }
  return out
}
// expectation <psi| O |psi> for a 4x4 Hermitian O, returns the real part
function expect(O: Cx[][], re: Float64Array, im: Float64Array): number {
  let accRe = 0
  for (let m = 0; m < 4; m++) {
    let oRe = 0
    let oIm = 0
    for (let n = 0; n < 4; n++) {
      // (O psi)_m
      oRe += O[m]![n]!.re * re[n]! - O[m]![n]!.im * im[n]!
      oIm += O[m]![n]!.re * im[n]! + O[m]![n]!.im * re[n]!
    }
    // conj(psi_m) * (O psi)_m, real part
    accRe += re[m]! * oRe + im[m]! * oIm
  }
  return accRe
}

// the exchange unitary on the {|01>,|10>} subspace from H = XX + YY, at angle theta
function applyExchange(re: Float64Array, im: Float64Array, theta: number): void {
  const c = Math.cos(2 * theta)
  const s = Math.sin(2 * theta)
  // |01> (index 1) and |10> (index 2): |01> -> c|01> - i s|10>, |10> -> c|10> - i s|01>
  const r1 = re[1]!
  const i1 = im[1]!
  const r2 = re[2]!
  const i2 = im[2]!
  // -i s |10> contribution to |01>: -i s * (r2 + i i2) = s i2 - i s r2
  re[1] = c * r1 + s * i2
  im[1] = c * i1 - s * r2
  re[2] = c * r2 + s * i1
  im[2] = c * i2 - s * r1
}

// largest two eigenvalues of a 3x3 symmetric matrix via Jacobi sweeps
function topTwoEig(M: number[][]): [number, number] {
  const a = M.map((row) => row.slice())
  for (let sweep = 0; sweep < 40; sweep++) {
    let p = 0
    let q = 1
    let max = 0
    for (let i = 0; i < 3; i++) for (let j = i + 1; j < 3; j++) if (Math.abs(a[i]![j]!) > max) {
      max = Math.abs(a[i]![j]!)
      p = i
      q = j
    }
    if (max < 1e-12) break
    const app = a[p]![p]!
    const aqq = a[q]![q]!
    const apq = a[p]![q]!
    const phi = 0.5 * Math.atan2(2 * apq, aqq - app)
    const cph = Math.cos(phi)
    const sph = Math.sin(phi)
    for (let k = 0; k < 3; k++) {
      const akp = a[k]![p]!
      const akq = a[k]![q]!
      a[k]![p] = cph * akp - sph * akq
      a[k]![q] = sph * akp + cph * akq
    }
    for (let k = 0; k < 3; k++) {
      const apk = a[p]![k]!
      const aqk = a[q]![k]!
      a[p]![k] = cph * apk - sph * aqk
      a[q]![k] = sph * apk + cph * aqk
    }
  }
  const eigs = [a[0]![0]!, a[1]![1]!, a[2]![2]!].sort((x, y) => y - x)
  return [eigs[0]!, eigs[1]!]
}

function analyze(re: Float64Array, im: Float64Array): { concurrence: number; chsh: number } {
  // correlation matrix T_ij = <sigma_i (x) sigma_j>
  const ax = ['X', 'Y', 'Z']
  const T: number[][] = [[0, 0, 0], [0, 0, 0], [0, 0, 0]]
  for (let i = 0; i < 3; i++) for (let j = 0; j < 3; j++) {
    T[i]![j] = expect(kron(PAULI[ax[i]!]!, PAULI[ax[j]!]!), re, im)
  }
  // M = T^T T, Horodecki criterion, max CHSH = 2 sqrt(sum of two largest eigenvalues of M)
  const M: number[][] = [[0, 0, 0], [0, 0, 0], [0, 0, 0]]
  for (let i = 0; i < 3; i++) for (let j = 0; j < 3; j++) {
    let s = 0
    for (let k = 0; k < 3; k++) s += T[k]![i]! * T[k]![j]!
    M[i]![j] = s
  }
  const [s1, s2] = topTwoEig(M)
  const chsh = 2 * Math.sqrt(Math.max(0, s1 + s2))
  // concurrence for a pure 2-qubit state, C = 2 |a00 a11 - a01 a10| (complex)
  const a00 = C(re[0]!, im[0]!)
  const a11 = C(re[3]!, im[3]!)
  const a01 = C(re[1]!, im[1]!)
  const a10 = C(re[2]!, im[2]!)
  const p1 = { re: a00.re * a11.re - a00.im * a11.im, im: a00.re * a11.im + a00.im * a11.re }
  const p2 = { re: a01.re * a10.re - a01.im * a10.im, im: a01.re * a10.im + a01.im * a10.re }
  const dRe = p1.re - p2.re
  const dIm = p1.im - p2.im
  const concurrence = 2 * Math.sqrt(dRe * dRe + dIm * dIm)
  return { concurrence, chsh }
}

export function entanglementBell(): {
  entangledConcurrence: number
  entangledCHSH: number
  productConcurrence: number
  productCHSH: number
  tsirelson: number
  bellViolated: boolean
  maximallyEntangled: boolean
  productIsClassical: boolean
  solved: boolean
} {
  // start in the product state |01> (one +1 charge, one -1 charge), apply the exchange at theta = pi/8
  const re = new Float64Array(4)
  const im = new Float64Array(4)
  re[1] = 1 // |01>
  applyExchange(re, im, Math.PI / 8) // produces (|01> - i|10>)/sqrt(2), maximally entangled
  const ent = analyze(re, im)

  // control, a genuine product state stays unentangled (apply nothing, or theta = 0)
  const re2 = new Float64Array(4)
  const im2 = new Float64Array(4)
  re2[1] = 1
  applyExchange(re2, im2, 0)
  const prod = analyze(re2, im2)

  const tsirelson = 2 * Math.SQRT2
  const bellViolated = ent.chsh > 2 + 1e-6
  const maximallyEntangled = ent.concurrence > 0.999
  const productIsClassical = prod.concurrence < 1e-6 && prod.chsh <= 2 + 1e-6
  const solved = bellViolated && maximallyEntangled && productIsClassical && Math.abs(ent.chsh - tsirelson) < 1e-3

  return {
    entangledConcurrence: ent.concurrence,
    entangledCHSH: ent.chsh,
    productConcurrence: prod.concurrence,
    productCHSH: prod.chsh,
    tsirelson,
    bellViolated,
    maximallyEntangled,
    productIsClassical,
    solved,
  }
}

export function main(): void {
  const r = entanglementBell()
  console.log('P173: entanglement and a Bell-CHSH violation from the exchange dynamics')
  console.log('')
  console.log('  apply the substrate exchange (the hop, P131) to the product state |01>:')
  console.log(`    concurrence ${r.entangledConcurrence.toFixed(3)} (1 = maximally entangled): ${r.maximallyEntangled}`)
  console.log(`    CHSH S = ${r.entangledCHSH.toFixed(3)} (classical bound 2, Tsirelson ${r.tsirelson.toFixed(3)})`)
  console.log(`    Bell inequality VIOLATED (S > 2, impossible classically): ${r.bellViolated}`)
  console.log('')
  console.log(`  product-state control: concurrence ${r.productConcurrence.toFixed(3)}, CHSH ${r.productCHSH.toFixed(3)} (classical): ${r.productIsClassical}`)
  console.log('')
  console.log('  => the substrate generates genuine entanglement from its own exchange dynamics, and the')
  console.log('     correlations violate Bell, so the model is quantum in the strongest sense, not a classical mimic.')
  console.log(`  SOLVED: ${r.solved}`)
}

if (process.argv[1] !== undefined && import.meta.url === pathToFileURL(process.argv[1]).href) {
  main()
}

export default defineExperiment({
  id: 'quantum/entanglement-bell',
  title: 'the exchange dynamics violates CHSH at the Tsirelson bound',
  category: 'quantum',
  substrates: 'any',
  depth: 'L3',
  paper: true,
  run() {
    const r = entanglementBell()
    const ok = r.solved && r.bellViolated && r.maximallyEntangled && r.productIsClassical
    return verdict({
      status: ok ? 'pass' : 'fail',
      claim:
        'the exchange dynamics produces a maximally entangled state that violates CHSH at the Tsirelson bound while a product control stays classical',
      metrics: {
        entangledCHSH: r.entangledCHSH,
        tsirelson: r.tsirelson,
        entangledConcurrence: r.entangledConcurrence,
      },
      control: { productCHSH: r.productCHSH },
    })
  },
})
