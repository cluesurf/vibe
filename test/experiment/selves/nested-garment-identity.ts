// The self wears nested garments, and keeps one identity through all of them. A monist nesting
// cosmology (the Zohar's worlds enclothed one within the next, its three-level soul enclothed in the
// body, "as above so below") holds that the same pattern recurs at every scale, each layer wearing
// the next, and the human is a microcosm carrying the identity of the whole. On the substrate this
// has a clean form: a state coarse-grains into nested layers, each layer exactly the block-sum of the
// finer (the coarser wears the finer), and the self's identity (its total charge) is carried
// unchanged through every layer and through time, but only because the rule conserves. A leak
// dissolves the identity while leaving the wearing intact, so conservation is what lets the same self
// persist across the garments.
//
// Measured on three nested layers (216 fine cells, then 36, then 6): each coarser layer equals the
// block-sum of the finer exactly, before and after evolution (the wearing is exact at every scale),
// and under the committed conserving rule the total charge (the identity) is retained in full through
// the whole evolution. Under a leak the wearing stays exact (the garments still nest) but the identity
// is almost entirely lost (the total charge collapses to a fraction), so the nesting is structural but
// the persistence of the one identity across the layers is the payoff of conservation.
//
// The control is the leaky rule: same nesting, same measurement, differing only in that charge can
// vanish, and the identity dissolves, so the enduring cross-scale identity is the conservation, not
// the coarse-graining.
//
// Depth L2. It measures the exact nesting of the coarse-grained garments and the conservation of the
// total-charge identity through them (retained in full under the rule, dissolved under a leak), the
// self-similar-enclothing shape settled on the substrate. Deterministic. A structural rhyme with an
// emanation cosmology, tested on vibe's own terms.

import { experiment } from '@/test/scaffold/suite'
import { verdict } from '@/test/scaffold/verdict'
import { nestedGarmentIdentity } from '@/code/measure/monism-rhymes'

const LENGTH = 216
const BLOCKS = [1, 6, 36]
const BEATS = 200

export default experiment({
  id: 'selves/nested-garment-identity',
  code: 'E-SLF-0176',
  title:
    'a state coarse-grains into nested garments each exactly the block-sum of the finer, and the self total-charge identity is carried in full through every layer and through time under the conserving rule, while a leak dissolves the identity though the nesting stays exact',
  category: 'selves',
  substrates: 'any',
  depth: 'L2',
  paper: false,
  run() {
    const conserved = nestedGarmentIdentity({
      length: LENGTH,
      blocks: BLOCKS,
      beats: BEATS,
      leak: 0,
      seed: 9,
    })

    // CONTROL: a leak dissolves the identity while the nesting stays exact
    const leaky = nestedGarmentIdentity({
      length: LENGTH,
      blocks: BLOCKS,
      beats: BEATS,
      leak: 0.01,
      seed: 9,
    })

    const nestingExact = conserved.worstWearingError === 0
    const identityFullyRetained =
      Math.abs(conserved.identityRetained - 1) < 1e-9

    const leakStillNests = leaky.worstWearingError === 0
    const leakDissolvesIdentity = leaky.identityRetained < 0.5

    const ok =
      nestingExact &&
      identityFullyRetained &&
      leakStillNests &&
      leakDissolvesIdentity

    return verdict({
      status: ok ? 'pass' : 'fail',
      claim:
        'across three nested layers each coarser garment equals the block-sum of the finer exactly, before and after evolution (the coarser wears the finer at every scale to machine precision), and under the committed conserving rule the self total-charge identity is carried through every layer and through the whole evolution in full (retained fraction one), so the same self is recognizable at every scale and every time, while a leak that lets charge vanish keeps the nesting exact but dissolves the identity to a small fraction, so the self-similar enclothing is structural but the enduring one identity across the garments is specifically the payoff of conservation',
      metrics: {
        conservedWearingError: conserved.worstWearingError,
        conservedIdentityRetained: Number(
          conserved.identityRetained.toFixed(3),
        ),
        leakyWearingError: leaky.worstWearingError,
        leakyIdentityRetained: Number(
          leaky.identityRetained.toFixed(3),
        ),
      },
      // CONTROL: the leaky rule keeps the nesting but dissolves the identity.
      control: {
        leakyIdentityRetained: Number(
          leaky.identityRetained.toFixed(3),
        ),
      },
      notes:
        'Self-similar enclothing on the substrate: nested garments (exact block-sum nesting) carrying one conserved identity, dissolved by a leak. A structural rhyme with emanation cosmology (the Zohar enclothed worlds and soul), settled on vibe own rule. Pairs with the coarse-graining and self-tower work.',
    })
  },
})
