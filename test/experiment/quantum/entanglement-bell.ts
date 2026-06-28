// P173: genuine entanglement and a Bell-CHSH violation from the substrate's own dynamics. (P131, P151, P158.)
//
// We have interference and the Born rule (P158), a Dirac dispersion, and reflection positivity (P151, P169).
// The deepest untested quantum signature is ENTANGLEMENT, a two-part correlation that no classical theory
// can reproduce. The substrate's hop IS the spin exchange (P131), and the exchange interaction is an
// entangling gate. We apply the exchange unitary to a PRODUCT state of two charge-qubits, show it produces
// a maximally entangled state (concurrence 1), and show the resulting correlations violate the CHSH
// inequality (S > 2, up to the Tsirelson bound 2 sqrt(2)), which is impossible for any local hidden-variable
// theory. A product-state control gives concurrence 0 and S <= 2. Run: npx tsx code/experiment/p173-entanglement-bell.ts

import { experiment } from '@/test/scaffold/suite'
import { verdict } from '@/test/scaffold/verdict'
import {
  twoQubitConcurrence,
  twoQubitCorrelationMatrix,
  horodeckiMaxChsh,
} from '@/code/measure/two-qubit'
import { applyExchangeUnitary } from '@/code/operator/exchange-unitary'

// the exchange unitary on the {|01>,|10>} subspace from H = XX + YY lives in
// code/operator/exchange-unitary.
const applyExchange = (
  re: Float64Array,
  im: Float64Array,
  theta: number,
): void => applyExchangeUnitary({ re, im, theta })

function analyze(
  re: Float64Array,
  im: Float64Array,
): { concurrence: number; chsh: number } {
  const t = twoQubitCorrelationMatrix({ re, im }) // T_ij = <sigma_i (x) sigma_j>
  const chsh = horodeckiMaxChsh(t) // Horodecki maximal CHSH = 2 sqrt(two largest eig of T^T T)
  const concurrence = twoQubitConcurrence({ re, im })

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
  const productIsClassical =
    prod.concurrence < 1e-6 && prod.chsh <= 2 + 1e-6

  const solved =
    bellViolated &&
    maximallyEntangled &&
    productIsClassical &&
    Math.abs(ent.chsh - tsirelson) < 1e-3

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

export default experiment({
  id: 'quantum/entanglement-bell',
  code: 'E-QTM-0011',
  title: 'the exchange dynamics violates CHSH at the Tsirelson bound',
  category: 'quantum',
  substrates: 'any',
  depth: 'L3',
  paper: true,
  run() {
    const r = entanglementBell()
    const ok =
      r.solved &&
      r.bellViolated &&
      r.maximallyEntangled &&
      r.productIsClassical

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
