// Conformance for code/operator/exchange-unitary: the spin-exchange unitary on two
// charge-qubits, acting on the {|01>,|10>} subspace. Facts:
//   - theta = 0 is the identity.
//   - it touches only amplitudes 1 and 2 (|00> and |11> untouched).
//   - theta = pi/8 sends |01> to the maximally entangled (|01> - i|10>)/sqrt(2).
//   - it preserves the norm (unitarity).
//   - applying theta then -theta recovers the input.

import { suite, check, close } from '@/test/code/harness'
import { applyExchangeUnitary } from '@/code/operator/exchange-unitary'

const norm = (re: Float64Array, im: Float64Array): number => {
  let s = 0

  for (let i = 0; i < 4; i++) {
    s += re[i]! * re[i]! + im[i]! * im[i]!
  }

  return s
}

suite('operator/exchange-unitary: identity and locality', [
  check('theta = 0 is the identity', () => {
    const re = Float64Array.from([0.1, 0.5, 0.3, 0.2])
    const im = Float64Array.from([0.0, 0.4, -0.2, 0.1])
    const re0 = re.slice()
    const im0 = im.slice()
    applyExchangeUnitary({ re, im, theta: 0 })

    for (let i = 0; i < 4; i++) {
      close(re[i]!, re0[i]!, 1e-12, `re[${i}] unchanged`)
      close(im[i]!, im0[i]!, 1e-12, `im[${i}] unchanged`)
    }
  }),
  check('the |00> and |11> amplitudes are untouched', () => {
    const re = Float64Array.from([0.7, 0.5, 0.3, -0.9])
    const im = Float64Array.from([0.2, 0.1, 0.4, 0.6])
    applyExchangeUnitary({ re, im, theta: 0.37 })
    close(re[0]!, 0.7, 1e-12, '|00> real untouched')
    close(im[0]!, 0.2, 1e-12, '|00> imag untouched')
    close(re[3]!, -0.9, 1e-12, '|11> real untouched')
    close(im[3]!, 0.6, 1e-12, '|11> imag untouched')
  }),
])

suite('operator/exchange-unitary: entangling action', [
  check('theta = pi/8 sends |01> to (|01> - i|10>)/sqrt(2)', () => {
    const re = Float64Array.from([0, 1, 0, 0])
    const im = Float64Array.from([0, 0, 0, 0])
    applyExchangeUnitary({ re, im, theta: Math.PI / 8 })

    const inv = 1 / Math.sqrt(2)
    close(re[1]!, inv, 1e-12, '|01> amplitude cos(pi/4)')
    close(im[1]!, 0, 1e-12, '|01> imag zero')
    close(re[2]!, 0, 1e-12, '|10> real zero')
    close(im[2]!, -inv, 1e-12, '|10> amplitude -sin(pi/4)')
  }),
])

suite('operator/exchange-unitary: unitarity', [
  check('the norm is preserved', () => {
    const re = Float64Array.from([0.2, 0.5, -0.4, 0.3])
    const im = Float64Array.from([0.1, -0.3, 0.2, 0.5])
    const n0 = norm(re, im)
    applyExchangeUnitary({ re, im, theta: 0.6 })
    close(norm(re, im), n0, 1e-12, 'norm conserved')
  }),
  check('theta then -theta recovers the input', () => {
    const re = Float64Array.from([0.2, 0.5, -0.4, 0.3])
    const im = Float64Array.from([0.1, -0.3, 0.2, 0.5])
    const re0 = re.slice()
    const im0 = im.slice()
    applyExchangeUnitary({ re, im, theta: 0.6 })
    applyExchangeUnitary({ re, im, theta: -0.6 })

    for (let i = 0; i < 4; i++) {
      close(re[i]!, re0[i]!, 1e-12, `re[${i}] recovered`)
      close(im[i]!, im0[i]!, 1e-12, `im[${i}] recovered`)
    }
  }),
])
