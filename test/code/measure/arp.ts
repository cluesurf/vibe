// Conformance for the primitives added for the Chronoflux base mapping: the metric-free region
// continuity balance, the conserving-but-irreversible sorting collision, the ARP gates and the support
// share, the coarse-density resolution, and the deterministic integer mix. These are library checks, not
// physics claims, so they assert the primitives behave as documented before any experiment leans on them.

import { suite, check, equal, ok, notOk } from '@/test/code/harness'
import {
  d4Mesh,
  squareMesh,
  cubicMesh,
  SQUARE_DIRECTIONS,
  CUBIC_DIRECTIONS,
} from '@/code/tool/mesh'
import { makeWill, fillWillPattern, charge } from '@/code/tone/will'
import { passThrough, pairCollision } from '@/code/rule/collision'
import { collide } from '@/code/rule/lattice-gas'
import { sortingCollision } from '@/code/control/conserving-irreversible-collision'
import { drainingCollision } from '@/code/control/lossy-collision'
import { regionContinuityResidual } from '@/code/measure/continuity'
import { arpGates, supportFraction } from '@/code/measure/arp'
import { coarseDensityResolution } from '@/code/measure/resolution'
import { blockCount, blockIndexer } from '@/code/tool/block'
import { integerMix } from '@/code/tool/integer'

const SIDE = 4

function patternWill() {
  const will = makeWill(d4Mesh({ side: SIDE }))

  fillWillPattern(will)

  return will
}

suite('tool/block: the coordinate blocking is consistent', [
  check('block count is the fourth power of the block grid', () => {
    equal(blockCount({ meshSide: 4, blockSide: 2 }), 16)
    equal(blockCount({ meshSide: 4, blockSide: 1 }), 256)
  }),
  check('every cell lands in a valid block index', () => {
    const indexOf = blockIndexer({ meshSide: 4, blockSide: 2 })
    const blocks = blockCount({ meshSide: 4, blockSide: 2 })

    let allInRange = true

    for (let cell = 0; cell < 4 ** 4; cell++) {
      const b = indexOf(cell)

      if (!Number.isInteger(b) || b < 0 || b >= blocks) {
        allInRange = false
      }
    }

    ok(allInRange, 'block indices must be integers inside the range')
  }),
])

suite('tool/integer: the mix is deterministic and not a random source', [
  check('the same input always gives the same output', () => {
    equal(integerMix(12345), integerMix(12345))
    equal(integerMix(0), integerMix(0))
  }),
  check('different inputs generally give different outputs', () => {
    notOk(
      integerMix(1) === integerMix(2),
      'the mix must separate nearby inputs',
    )
  }),
  check('the output is a non-negative 32-bit integer', () => {
    const value = integerMix(987654)

    ok(
      Number.isInteger(value) && value >= 0 && value <= 0xffffffff,
      'the mix must stay in unsigned 32-bit range',
    )
  }),
])

suite(
  'measure/continuity: the balance is exact for partitions with no geometry',
  [
    check('singleton regions give exactly zero residual', () => {
      const will = patternWill()
      const out = regionContinuityResidual({
        will,
        collision: passThrough,
        regionOf: cell => cell,
        regionCount: will.mesh.cellCount,
      })

      equal(out.absResidual, 0)
      equal(out.maxRegionResidual, 0)
    }),
    check('index-interleaved regions give exactly zero residual', () => {
      const out = regionContinuityResidual({
        will: patternWill(),
        collision: passThrough,
        regionOf: cell => cell % 7,
        regionCount: 7,
      })

      equal(out.absResidual, 0)
      equal(out.maxRegionResidual, 0)
      ok(out.totalFlux > 0, 'the partition must actually carry flux')
    }),
    check('a one-signed sink breaks the balance', () => {
      // The one-signed sink removes POSITIVE charge from slot 0 only, so it is inert on a fill whose
      // slot 0 is never positive. fillWillPattern is exactly such a fill (slot 0 is negative in every
      // cell), which would leave this control dead and the check vacuous. So the fill is built here
      // with a positive slot 0, and liveness is asserted before the balance is read.
      const will = makeWill(d4Mesh({ side: SIDE }))
      const degree = will.mesh.degree

      for (let cell = 0; cell < will.mesh.cellCount; cell++) {
        for (let d = 0; d < degree; d++) {
          will.data[cell * degree + d] = d === 0 ? 1 : ((cell + d) % 3) - 1
        }
      }

      const before = charge(will)
      const drained = makeWill(d4Mesh({ side: SIDE }))

      drained.data.set(will.data)
      collide(drained, drainingCollision)

      ok(
        charge(drained) !== before,
        'the sink must actually remove charge, else the control is dead',
      )

      const out = regionContinuityResidual({
        will,
        collision: drainingCollision,
        regionOf: cell => cell % 7,
        regionCount: 7,
      })

      ok(out.absResidual > 0, 'a lossy rule must fail the balance')
    }),
  ],
)

suite(
  'control/conserving-irreversible-collision: conserves charge, destroys order',
  [
    check('sorting preserves the total charge exactly', () => {
      const will = patternWill()
      const before = charge(will)

      collide(will, sortingCollision)

      equal(charge(will), before)
    }),
    check('sorting is idempotent, so it cannot be inverted', () => {
      const once = patternWill()

      collide(once, sortingCollision)

      const twice = makeWill(d4Mesh({ side: SIDE }))

      twice.data.set(once.data)
      collide(twice, sortingCollision)

      // applying it again changes nothing, the signature of a many-to-one map
      let identical = true

      for (let i = 0; i < once.data.length; i++) {
        if (once.data[i] !== twice.data[i]) {
          identical = false
        }
      }

      ok(identical, 'sorting an already sorted cell must be a no-op')
    }),
    check('sorting actually reorders a mixed cell', () => {
      const will = patternWill()
      const original = Int8Array.from(will.data)

      collide(will, sortingCollision)

      let changed = false

      for (let i = 0; i < will.data.length; i++) {
        if (will.data[i] !== original[i]) {
          changed = true
        }
      }

      ok(changed, 'the control must be live on a patterned fill')
    }),
  ],
)

suite('measure/arp: the support share and the three gates', [
  check('support share is one when everything is inside', () => {
    equal(
      supportFraction({ will: patternWill(), inSupport: () => true }),
      1,
    )
  }),
  check('support share is zero when everything is outside', () => {
    equal(
      supportFraction({ will: patternWill(), inSupport: () => false }),
      0,
    )
  }),
  check('the reversible knit conserves and recovers', () => {
    const mesh = d4Mesh({ side: SIDE })
    const opposite: number[] = []

    for (let d = 0; d < mesh.degree; d++) {
      opposite.push(mesh.opposite(d))
    }

    const gates = arpGates({
      will: patternWill(),
      collision: pairCollision({ opposite }),
      inverseCollision: pairCollision({ opposite, forward: false }),
      beats: 3,
      inSupport: () => true,
      persistenceFloor: 0.5,
    })

    ok(gates.chargeConserved, 'the knit must conserve charge')
    ok(gates.stateRecoverable, 'the knit must be reversible')
    equal(gates.supportTrajectory.length, 3)
  }),
  check('the sorting rule conserves but does not recover', () => {
    const gates = arpGates({
      will: patternWill(),
      collision: sortingCollision,
      beats: 3,
      inSupport: () => true,
      persistenceFloor: 0.5,
    })

    ok(gates.chargeConserved, 'sorting must conserve charge')
    notOk(gates.stateRecoverable, 'sorting must not be recoverable')
  }),
])

suite('measure/resolution: the coarse reading is finite and quantised', [
  check('the quantum is exactly one over the block volume', () => {
    const out = coarseDensityResolution({
      will: patternWill(),
      meshSide: SIDE,
      blockSide: 2,
    })

    equal(out.blockVolume, 16)
    equal(out.quantum, 1 / 16)
  }),
  check('the attainable value set is finite and bounded', () => {
    const out = coarseDensityResolution({
      will: patternWill(),
      meshSide: SIDE,
      blockSide: 2,
    })

    equal(out.attainableValues, 2 * out.slotsPerBlock + 1)
    ok(
      Number.isFinite(out.attainableValues),
      'the attainable set must be finite',
    )
    ok(out.onLattice, 'every block total must respect the slot bound')
  }),
  check('a finer block has a coarser quantum than a bigger block', () => {
    const fine = coarseDensityResolution({
      will: patternWill(),
      meshSide: SIDE,
      blockSide: 1,
    })
    const coarse = coarseDensityResolution({
      will: patternWill(),
      meshSide: SIDE,
      blockSide: 2,
    })

    ok(
      coarse.quantum < fine.quantum,
      'growing the block must shrink the quantum',
    )
    ok(coarse.quantum > 0, 'the quantum never reaches zero')
  }),
])

suite('tool/mesh: the exported coin vectors match their builders', [
  check('square vectors are unit and opposite-paired', () => {
    const mesh = squareMesh({ side: 4 })

    equal(SQUARE_DIRECTIONS.length, mesh.degree)

    // each direction's opposite vector is the negation, the condition streaming needs
    let allNegated = true

    for (let d = 0; d < mesh.degree; d++) {
      const here = SQUARE_DIRECTIONS[d]!
      const there = SQUARE_DIRECTIONS[mesh.opposite(d)]!

      for (let axis = 0; axis < here.length; axis++) {
        if (there[axis] !== -here[axis]!) {
          allNegated = false
        }
      }
    }

    ok(allNegated, 'opposite directions must be negated vectors')
  }),
  check('cubic vectors are unit and opposite-paired', () => {
    const mesh = cubicMesh({ side: 4 })

    equal(CUBIC_DIRECTIONS.length, mesh.degree)

    let allNegated = true

    for (let d = 0; d < mesh.degree; d++) {
      const here = CUBIC_DIRECTIONS[d]!
      const there = CUBIC_DIRECTIONS[mesh.opposite(d)]!

      for (let axis = 0; axis < here.length; axis++) {
        if (there[axis] !== -here[axis]!) {
          allNegated = false
        }
      }
    }

    ok(allNegated, 'opposite directions must be negated vectors')
  }),
])
