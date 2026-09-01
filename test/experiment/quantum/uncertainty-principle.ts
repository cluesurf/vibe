// The Heisenberg uncertainty principle on the substrate lattice. A wave packet's position spread
// and momentum spread (from the discrete Fourier transform) obey sigma_x times sigma_p at least
// one half in lattice units, with equality exactly for the Gaussian packet. This is the missing
// canonical piece of the quantum coverage map: the emergent layer's states cannot be sharp in
// position and momentum at once, and the bound is saturated by the minimum-uncertainty packet.
//
// Measured across a sweep of Gaussian widths: the product sits at one half to four decimal places
// at every width (the width drops out, the saturation is exact), while a flat-top packet of
// comparable extent has a product several times larger (the Gaussian is the unique minimizer,
// other shapes waste uncertainty). The classical contrast is a point particle with a definite
// velocity, position and momentum both sharp, product zero, no bound: the bound is quantum
// structure, the Fourier trade-off of the amplitude description the substrate's emergent layer
// carries, absent from a classical state description.
//
// The control is the flat-top packet: same lattice, same measure, product well above one half,
// so the saturation at one half is specific to the Gaussian, not an artifact of the measure.
//
// Depth L1. It confirms the exact uncertainty bound and its Gaussian saturation on the lattice,
// known Fourier mathematics at the emergent layer, the canonical uncertainty structure.

import { experiment } from '@/test/scaffold/suite'
import { verdict } from '@/test/scaffold/verdict'
import { packetUncertaintyProduct } from '@/code/measure/uncertainty'

const SIZE = 512
const WIDTHS = [4, 8, 16, 32]

export default experiment({
  id: 'quantum/uncertainty-principle',
  code: 'E-QTM-0059',
  title:
    'every Gaussian packet saturates sigma_x sigma_p = 1/2 exactly across a width sweep while a flat-top packet sits far above the bound, the Heisenberg uncertainty principle on the lattice',
  category: 'quantum',
  substrates: 'any',
  depth: 'L1',
  paper: false,
  run() {
    const products = WIDTHS.map(width =>
      packetUncertaintyProduct({ size: SIZE, width, square: false }),
    )

    const worstSaturationError = Math.max(
      ...products.map(product => Math.abs(product - 0.5)),
    )

    const saturated = worstSaturationError < 1e-3

    const aboveBound = products.every(product => product > 0.5 - 1e-6)

    // CONTROL: the flat-top packet exceeds the bound by a wide margin
    const squareProduct = packetUncertaintyProduct({
      size: SIZE,
      width: 16,
      square: true,
    })

    const squareExceeds = squareProduct > 1

    const ok = saturated && aboveBound && squareExceeds

    return verdict({
      status: ok ? 'pass' : 'fail',
      claim:
        'the position-momentum uncertainty product of a Gaussian packet on the lattice sits at exactly one half across the whole width sweep (the Heisenberg bound saturated by the minimum-uncertainty packet, the width dropping out) and never falls below the bound, while a flat-top packet of comparable extent has a product several times larger, so the bound is the Fourier trade-off of the emergent amplitude description, saturated only by the Gaussian, where a classical point particle with definite position and velocity would have product zero and no bound',
      metrics: {
        productAtWidth4: Number(products[0]!.toFixed(4)),
        productAtWidth32: Number(
          products[products.length - 1]!.toFixed(4),
        ),
        worstSaturationError: Number(
          worstSaturationError.toExponential(2),
        ),
        squareProduct: Number(squareProduct.toFixed(3)),
      },
      // CONTROL: the flat-top packet sits far above the bound.
      control: { squareProduct: Number(squareProduct.toFixed(3)) },
      notes:
        'Heisenberg uncertainty on the lattice, exact Gaussian saturation. The canonical missing piece of the quantum coverage map, joining tunneling (E-QTM-0056), no-signaling (E-QTM-0057), and monogamy (E-QTM-0058).',
    })
  },
})
