// Conformance for code/operator/unitary-evolution: psi(t) = e^{-iHt} psi(0) via the
// eigendecomposition of a real-symmetric H. Facts:
//   - t = 0 is the identity.
//   - a diagonal H phases each component by e^{-i lambda t} (hand-checked).
//   - the off-diagonal H = [[0,1],[1,0]] sends |0> to (cos t)|0> - i(sin t)|1> (exact
//     known solution).
//   - evolution preserves the norm (unitarity) at every time tested.

import { suite, check, close } from '@/test/code/harness'
import { evolveByEigendecomposition } from '@/code/operator/unitary-evolution'

const norm = (re: Float64Array, im: Float64Array): number => {
  let s = 0

  for (let i = 0; i < re.length; i++) {
    s += re[i]! * re[i]! + im[i]! * im[i]!
  }

  return s
}

// A diagonal H: eigenvectors are the standard basis (flat identity), eigenvalues given.
const diag = {
  values: [0.7, -1.3],
  vectors: Float64Array.from([1, 0, 0, 1]),
}

// H = [[0,1],[1,0]]: eigenvalues +1,-1; eigenvectors (1,1)/sqrt2 and (1,-1)/sqrt2.
const a = 1 / Math.sqrt(2)
const flip = {
  values: [1, -1],
  vectors: Float64Array.from([a, a, a, -a]),
}

suite('operator/unitary-evolution: identity at t = 0', [
  check('t = 0 returns the input state', () => {
    const re0 = Float64Array.from([0.6, 0.8])
    const im0 = Float64Array.from([0, 0])
    const { re, im } = evolveByEigendecomposition({
      eig: flip,
      n: 2,
      re0,
      im0,
      t: 0,
    })

    close(re[0]!, 0.6, 1e-12, 're[0] unchanged')
    close(re[1]!, 0.8, 1e-12, 're[1] unchanged')
    close(im[0]!, 0, 1e-12, 'im[0] zero')
    close(im[1]!, 0, 1e-12, 'im[1] zero')
  }),
])

suite('operator/unitary-evolution: diagonal H', [
  check('each component is phased by e^{-i lambda t}', () => {
    const re0 = Float64Array.from([1, 1])
    const im0 = Float64Array.from([0, 0])
    const t = 0.9
    const { re, im } = evolveByEigendecomposition({
      eig: diag,
      n: 2,
      re0,
      im0,
      t,
    })

    close(re[0]!, Math.cos(0.7 * t), 1e-12, 're[0] = cos(l0 t)')
    close(im[0]!, -Math.sin(0.7 * t), 1e-12, 'im[0] = -sin(l0 t)')
    close(re[1]!, Math.cos(-1.3 * t), 1e-12, 're[1] = cos(l1 t)')
    close(im[1]!, -Math.sin(-1.3 * t), 1e-12, 'im[1] = -sin(l1 t)')
  }),
])

suite('operator/unitary-evolution: off-diagonal H', [
  check('|0> evolves to cos(t)|0> - i sin(t)|1>', () => {
    const re0 = Float64Array.from([1, 0])
    const im0 = Float64Array.from([0, 0])
    const t = 0.5
    const { re, im } = evolveByEigendecomposition({
      eig: flip,
      n: 2,
      re0,
      im0,
      t,
    })

    close(re[0]!, Math.cos(t), 1e-12, 're[0] = cos t')
    close(im[0]!, 0, 1e-12, 'im[0] = 0')
    close(re[1]!, 0, 1e-12, 're[1] = 0')
    close(im[1]!, -Math.sin(t), 1e-12, 'im[1] = -sin t')
  }),
])

suite('operator/unitary-evolution: norm preservation', [
  check('the norm is conserved at every time', () => {
    const re0 = Float64Array.from([0.6, 0.8])
    const im0 = Float64Array.from([0.0, 0.0])
    const n0 = norm(re0, im0)

    for (const t of [0.3, 1.1, 2.7, 5.0]) {
      const { re, im } = evolveByEigendecomposition({
        eig: flip,
        n: 2,
        re0,
        im0,
        t,
      })

      close(norm(re, im), n0, 1e-12, `norm preserved at t=${t}`)
    }
  }),
])
