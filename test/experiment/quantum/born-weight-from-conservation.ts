// The Born-weight FORM checked against the model walk's conservation, stated honestly. The
// question the Born rule answers: given an amplitude, why is the outcome PROBABILITY the square
// |psi|^2 and not, say, the amplitude itself or its magnitude? Any consistent probability must be a
// CONSERVED, ADDITIVE quantity, so the total probability stays one as the state evolves.
//
// What this experiment actually shows, and what it assumes. The coin of the E-QTM-0041 walk was
// CHOSEN to be an orthogonal rotation, and an orthogonal map conserves the L2 norm BY CONSTRUCTION,
// that is known unitarity mathematics, not a discovery. So the content here is a consistency
// check, not a uniqueness proof: among the tested candidate measures,
//   - the INTENSITY sum of a^2 + b^2, which is |psi|^2, the quadratic Born measure,
//   - the L1 norm, sum of sqrt(a^2 + b^2),
//   - the signed sum of a + b,
// only the quadratic one is conserved under the rotation coin. It holds to machine precision
// (drift about 1e-15) while the L1 norm drifts by a factor of about ten and the signed sum by
// order one. A wrong-coin control (a non-orthogonal coin) breaks even the intensity conservation,
// which makes the assumption visible: the conservation comes from the orthogonality that was put
// in, and given it, the quadratic measure is the conserved one among the candidates tested.
//
// So this complements the functional-equation route (E-QTM-0005) and the envariance route
// (E-QTM-0012) with a conservation CONSISTENCY check on the walk: if the outcome probability must
// be a conserved additive measure, then among quadratic, L1, and signed candidates the walk singles
// out the quadratic. It does not prove no other conserved additive measure exists, and it does not
// derive the orthogonality of the coin, which is the inserted ingredient.
//
// Grade L1: known unitarity mathematics (orthogonal maps conserve L2) verified on the walk, with
// the non-quadratic candidates and the non-orthogonal coin as controls that the check can fail.

import { experiment } from '@/test/scaffold/suite'
import { verdict } from '@/test/scaffold/verdict'

const SITES = 600
const STEPS = 180
const THETA = Math.PI / 4 // the real rotation coin

// the E-QTM-0041 two-component walk with coin entries (c, s), tracking three candidate
// additive measures each step. The committed coin is the orthogonal rotation
// (cos theta, sin theta), the control coin is deliberately non-orthogonal.
function measureDrifts(
  c: number,
  s: number,
): {
  intensity: number
  l1: number
  signed: number
} {
  let forward = new Float64Array(SITES)
  let backward = new Float64Array(SITES)

  const start = SITES >> 1

  forward[start] = 1 / Math.SQRT2
  backward[start] = 1 / Math.SQRT2

  const intensity: number[] = []
  const l1: number[] = []
  const signed: number[] = []

  const record = (): void => {
    let intensitySum = 0
    let l1Sum = 0
    let signedSum = 0

    for (let x = 0; x < SITES; x++) {
      const a = forward[x] ?? 0
      const b = backward[x] ?? 0

      intensitySum += a * a + b * b
      l1Sum += Math.sqrt(a * a + b * b)
      signedSum += a + b
    }

    intensity.push(intensitySum)
    l1.push(l1Sum)
    signed.push(signedSum)
  }

  record()

  for (let t = 0; t < STEPS; t++) {
    const nextForward = new Float64Array(SITES)
    const nextBackward = new Float64Array(SITES)

    for (let x = 0; x < SITES; x++) {
      const a = forward[x] ?? 0
      const b = backward[x] ?? 0
      const rotatedForward = c * a + s * b
      const rotatedBackward = -s * a + c * b

      if (x + 1 < SITES) nextForward[x + 1]! += rotatedForward

      if (x - 1 >= 0) nextBackward[x - 1]! += rotatedBackward
    }

    forward = nextForward
    backward = nextBackward
    record()
  }

  const drift = (arr: number[]): number =>
    (Math.max(...arr) - Math.min(...arr)) / Math.abs(arr[0] ?? 1)

  return {
    intensity: drift(intensity),
    l1: drift(l1),
    signed: drift(signed),
  }
}

export default experiment({
  id: 'quantum/born-weight-from-conservation',
  code: 'E-QTM-0046',
  title:
    'given the orthogonal rotation coin (an inserted ingredient that conserves the L2 norm by construction), the quadratic intensity a^2+b^2 is the only conserved measure among the tested candidates (quadratic, L1, signed) on the emergent-i walk, a conservation consistency check on the Born-weight form, with a non-orthogonal coin control that breaks the conservation',
  category: 'quantum',
  substrates: 'any',
  depth: 'L1',
  paper: true,
  run() {
    const drifts = measureDrifts(Math.cos(THETA), Math.sin(THETA))

    // the wrong-coin control: a deliberately NON-orthogonal coin (0.8, 0.4), which
    // does not preserve the L2 norm, so even the intensity should drift
    const wrongCoin = measureDrifts(0.8, 0.4)

    // 1. the intensity |psi|^2 is conserved (drift near machine precision).
    const intensityConserved = drifts.intensity < 1e-9

    // 2. the L1 norm is NOT conserved (drifts by order one or more).
    const l1NotConserved = drifts.l1 > 0.1

    // 3. the signed sum is NOT conserved either.
    const signedNotConserved = drifts.signed > 0.1

    // 4. the non-orthogonal coin breaks even the intensity conservation, so the
    //    conservation is the coin orthogonality showing itself, and the check can fail.
    const wrongCoinBreaks = wrongCoin.intensity > 0.1

    const solved =
      intensityConserved &&
      l1NotConserved &&
      signedNotConserved &&
      wrongCoinBreaks

    return verdict({
      status: solved ? 'pass' : 'fail',
      claim:
        'on the emergent-i two-component walk (E-QTM-0041) with the orthogonal rotation coin, the intensity a^2+b^2 which is |psi|^2 is conserved to machine precision while the L1 norm sqrt(a^2+b^2) and the signed sum a+b drift by order one or more, and a non-orthogonal control coin breaks even the intensity conservation, so among the tested candidate measures only the quadratic is conserved under the rotation coin, which is the known consequence of orthogonal maps conserving the L2 norm (the coin orthogonality is the inserted ingredient), a conservation consistency check that the Born-weight form |psi|^2 is the conserved additive candidate on the walk, not a uniqueness proof',
      metrics: {
        intensityDrift: Number(drifts.intensity.toExponential(2)),
        l1NormDrift: Number(drifts.l1.toExponential(2)),
        signedSumDrift: Number(drifts.signed.toExponential(2)),
        wrongCoinIntensityDrift: Number(
          wrongCoin.intensity.toExponential(2),
        ),
      },
      control: {
        // the L1 norm and the signed sum both drift substantially, so it is specifically the
        // quadratic intensity that the orthogonal coin conserves, not any additive measure. And
        // the non-orthogonal coin breaks the intensity conservation itself, so the conservation
        // is the chosen orthogonality, made visible rather than hidden.
        l1NormDrift: Number(drifts.l1.toExponential(2)),
        signedSumDrift: Number(drifts.signed.toExponential(2)),
        wrongCoinIntensityDrift: Number(
          wrongCoin.intensity.toExponential(2),
        ),
      },
      notes:
        'L1. The coin was CHOSEN orthogonal, and orthogonal maps conserve the L2 norm by construction, so the intensity conservation is known unitarity mathematics, not a substrate discovery. What is shown: among the tested candidate measures (quadratic, L1, signed) only the quadratic is conserved under the rotation coin (drift about 1e-15 against about 9 and about 2), and the non-orthogonal control coin (0.8, 0.4) breaks even the intensity conservation (drift order one), so the check can fail and the inserted orthogonality is visible. This is a conservation CONSISTENCY check on the Born-weight form, complementing the functional-equation route (E-QTM-0005) and the envariance route (E-QTM-0012), not a uniqueness proof: no claim is made that the quadratic is the only conserved additive measure in general, only that it is the conserved one among these candidates. The value of |psi|^2 for a given state remains the per-setup input, as in ordinary quantum mechanics.',
    })
  },
})
