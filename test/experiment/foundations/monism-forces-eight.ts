// The FLOOR of the pinch-point, forced from the base by MONISM, not by observed three families. The earlier
// argument ("three observed families need triality, so dimension >= 8") looks ahead: it imports the empirical
// three-family fact. The forced version uses the framework's foundational monism: the only entity is the vibe,
// so the DIRECTIONS a tone can move (the vector, the coin) and the STATES matter can occupy (the spinor) are ONE
// substance, hence the same structure: VECTOR = SPINOR. The vector of Spin(n) has dimension n; the Weyl
// half-spinor has dimension 2^(n/2 - 1). These are equal at EXACTLY one even dimension, n = 8 (8 = 2^3), and
// nowhere else. So monism forces dimension eight (where reversibility's Hurwitz ceiling also sits), and the THREE
// generations (8v, 8s, 8c) then EMERGE as the three faces of the triality self-duality, an output not an input.

import { experiment } from '@/test/scaffold/suite'
import { verdict } from '@/test/scaffold/verdict'

// Spin(n), n even: vector dimension n, Weyl half-spinor dimension 2^(n/2 - 1).
function vectorDim(n: number): number {
  return n
}
function halfSpinorDim(n: number): number {
  return 2 ** (n / 2 - 1)
}

export default experiment({
  id: 'foundations/monism-forces-eight',
  title:
    'monism (vector = spinor) forces dimension eight uniquely, the pinch-point floor from the base not from observed families; three generations emerge as the three faces 8v 8s 8c',
  category: 'foundations',
  substrates: 'any',
  depth: 'L1',
  paper: true,
  run() {
    // scan even dimensions, find where the vector dimension equals the half-spinor dimension
    const matches: number[] = []
    for (let n = 2; n <= 64; n += 2) {
      if (vectorDim(n) === halfSpinorDim(n)) {
        matches.push(n)
      }
    }
    const uniqueAtEight = matches.length === 1 && matches[0] === 8

    // at n = 8 the vector and BOTH half-spinors are 8-dimensional (triality): 8v + 8s + 8c = 24 (the 24-cell)
    const eightV = vectorDim(8),
      eightS = halfSpinorDim(8)
    const threeFacesEqual = eightV === 8 && eightS === 8
    const tripletSumsTo24 = eightV + eightS + eightS === 24 // the dual 24-cell, the three generations

    // control: a NON-self-dual dimension (n = 10, the so(10) GUT dimension) has vector != spinor (10 vs 16)
    const tenVector = vectorDim(10),
      tenSpinor = halfSpinorDim(10)
    const controlBreaks = tenVector !== tenSpinor

    const ok =
      uniqueAtEight &&
      threeFacesEqual &&
      tripletSumsTo24 &&
      controlBreaks

    return verdict({
      status: ok ? 'pass' : 'fail',
      claim:
        'monism, the requirement that the directions a tone moves (the vector) and the states matter occupies (the spinor) are one substance, hence vector = spinor, forces dimension EIGHT uniquely: the vector dimension n equals the Weyl half-spinor dimension 2^(n/2-1) at exactly n = 8 (8 = 2^3) among all even dimensions. So the pinch-point floor is forced from the base, not from observed families. At dimension eight the vector and the two half-spinors are all 8-dimensional and cycled by triality (8v + 8s + 8c = 24, the dual 24-cell), so the THREE generations emerge as the three faces of the self-duality, an output. A non-self-dual dimension (n = 10, vector 10 vs spinor 16) is the control.',
      metrics: {
        selfDualDimensionsFound: matches.length,
        theDimension: matches[0] ?? 0,
        vectorDimAt8: eightV,
        halfSpinorDimAt8: eightS,
        tripletSum: eightV + eightS + eightS,
      },
      control: {
        tenVectorDim: tenVector,
        tenSpinorDim: tenSpinor,
        controlBreaks: controlBreaks ? 1 : 0,
      },
      notes:
        'L1 exact dimensional fact. The vector = spinor self-duality is the geometric expression of monism, the framework foundational principle, stated as a principle (like reversibility), not derived from observed families. The advance over the old floor ("three families need triality") is that this is a BASE principle, not empirical input, and it makes the three generations an OUTPUT (the three triality faces). Combined with the Hurwitz reversibility ceiling (dim <= 8), the two base principles squeeze the octonion at dimension eight. See foundations/dynamics-forces-octonions for the ceiling and the pinch-point.',
    })
  },
})
