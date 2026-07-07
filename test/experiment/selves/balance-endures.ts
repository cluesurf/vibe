// Only balanced structure endures as a self. A monist emanation cosmology (here the Zohar's kings
// of Edom, who "reigned and died", with "none enduring except he who was comprised of male and
// female") holds that unbalanced, unpaired configurations collapse, and only the balanced, paired
// one holds together. This is a shape worth settling on the substrate's own rule: does a balanced
// (paired) charge cluster hold together as a bound self while an unbalanced (same-sign) cluster
// disperses? It does, and the reason is the conserving rule itself, no extra assumption.
//
// A cluster of charges sits at the centre of a ring under the conserving transport with
// annihilation. When the charges are balanced (alternating sign, each with a partner) the opposite
// neighbours annihilate and the cluster self-organizes to a compact, low-charge bound remnant, so it
// holds together in place. When the charges are unbalanced (all the same sign, no partner to pair
// with) none can annihilate, and like charges only diffuse apart, so the cluster disperses across
// the ring and does not endure as a bound structure.
//
// Measured: the balanced cluster annihilates almost all its charge (settling to peace) and stays
// compact (a small final spread), while the unbalanced cluster keeps all its charge (nothing can
// pair) and spreads out several-fold wider, so only the balanced configuration endures as a compact
// bound self. This is the substrate's own version of balance-as-persistence, with the failure mode
// (the unbalanced cluster falling apart) as the dead-kings analogue.
//
// The control is the unbalanced cluster itself: same size, same rule, same seed, differing only in
// that its charges cannot pair, and it disperses instead of holding, so the endurance is the balance
// (the pairing), not the cluster.
//
// Depth L2. It measures whether a balanced versus an unbalanced charge cluster holds together under
// the committed conserving rule (balanced compact and resolved, unbalanced dispersed and
// unresolved), the balance-as-persistence shape settled on the substrate. Deterministic. A
// structural rhyme with an emanation cosmology, tested on vibe's own terms, not imported from it.

import { experiment } from '@/test/scaffold/suite'
import { verdict } from '@/test/scaffold/verdict'
import { evolveCluster } from '@/code/measure/monism-rhymes'

const LENGTH = 200
const COUNT = 40
const BEATS = 400
const SHARE = 0.5

export default experiment({
  id: 'selves/balance-endures',
  code: 'E-SLF-0175',
  title:
    'a balanced (paired) charge cluster self-organizes to a compact bound remnant (it holds together) while an unbalanced (same-sign) cluster cannot pair and disperses, so only balanced structure endures as a self',
  category: 'selves',
  substrates: ['3434'],
  depth: 'L2',
  paper: false,
  run() {
    const balanced = evolveCluster({
      length: LENGTH,
      count: COUNT,
      beats: BEATS,
      balanced: true,
      share: SHARE,
      seed: 7,
    })

    const unbalanced = evolveCluster({
      length: LENGTH,
      count: COUNT,
      beats: BEATS,
      balanced: false,
      share: SHARE,
      seed: 7,
    })

    // the balanced cluster resolves (annihilates most charge) and stays compact
    const balancedResolves = balanced.annihilatedFraction > 0.8
    const balancedCompact = balanced.finalSpread < 20

    // the unbalanced cluster cannot pair and disperses much wider
    const unbalancedUnresolved = unbalanced.annihilatedFraction < 0.05
    const unbalancedDisperses =
      unbalanced.finalSpread > balanced.finalSpread * 3

    const ok =
      balancedResolves &&
      balancedCompact &&
      unbalancedUnresolved &&
      unbalancedDisperses

    return verdict({
      status: ok ? 'pass' : 'fail',
      claim:
        'under the committed conserving rule with annihilation a balanced charge cluster (alternating sign, each charge with a partner) annihilates more than eighty percent of its charge and settles to a compact bound remnant (it holds together in place), while an unbalanced cluster of the same size (all the same sign, no partner) annihilates almost nothing and disperses to more than three times the balanced spread (it falls apart), so only the balanced, paired configuration endures as a compact bound self and the unbalanced one collapses as a structure, the substrate own version of balance-as-persistence with the dispersing unbalanced cluster as the failure mode',
      metrics: {
        balancedFinalSpread: Number(balanced.finalSpread.toFixed(1)),
        balancedAnnihilated: Number(
          balanced.annihilatedFraction.toFixed(2),
        ),
        unbalancedFinalSpread: Number(
          unbalanced.finalSpread.toFixed(1),
        ),
        unbalancedAnnihilated: Number(
          unbalanced.annihilatedFraction.toFixed(2),
        ),
        spreadRatio: Number(
          (unbalanced.finalSpread / balanced.finalSpread).toFixed(1),
        ),
      },
      // CONTROL: the unbalanced cluster (same rule, same size, cannot pair) disperses.
      control: {
        unbalancedFinalSpread: Number(
          unbalanced.finalSpread.toFixed(1),
        ),
      },
      notes:
        'Balance-as-persistence on the substrate: paired charge holds together, unpaired disperses. A structural rhyme with emanation cosmology (the Zohar dead kings), settled on vibe own conserving rule, not imported. Pairs with conservation-exactness (E-FND-0064) and conflict-resolves-toward-peace.',
    })
  },
})
