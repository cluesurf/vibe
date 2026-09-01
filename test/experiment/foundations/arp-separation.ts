// EXTERNAL THEORY: Roy Herbert (Chronoflux), the July 2026 Descendancy refactor (DPL-02, Conservation,
// Admissibility and Recoverability). Above his one primitive law Herbert puts a governing triad that
// decides which structures may be promoted: conservation (the total is preserved), recoverability (the
// evolution is injective, so a later state identifies its antecedent), and persistence (the identity
// actually endures). His central structural claim is that these three are NOT substitutable. A quantity
// can be conserved while the field carrying it becomes unrecoverable, and a state can be recoverable
// while no identifiable structure survives.
//
// The claim is easy to state and easy to assert without evidence, so this experiment demands a witness
// for each gap on the lattice. Three rules and one localized structure give the counterexamples:
//
// - the committed knit conserves and is reversible, yet a localized blob streams away, so recoverability
//   does NOT imply persistence.
// - the sorting collision permutes each cell's slots into canonical order. It conserves charge to the
//   integer and destroys which direction carried which tone, so conservation does NOT imply
//   recoverability. This is precisely the case Herbert names.
// - the erasing collision fails conservation outright, the floor of the ladder.
//
// Measured content. On periodic {3,4,3,4} d4 meshes of side 6 and 8 the three gates are read for each
// rule from a deterministic localized initial condition (a charged blob inside a coordinate window,
// vacuum outside). Charge equality is exact integer, recoverability is a forward-then-backward
// bit-for-bit comparison, persistence is the MEAN share of absolute tone inside the starting cells over
// the whole run against a declared floor. The result is a table where each gate fails somewhere while
// the ones below it still hold, which is what makes the triad a real hierarchy rather than three names
// for conservation.
//
// Why the mean and not the final beat, measured rather than assumed. A reversible rule on a finite
// periodic mesh has exact Poincare recurrences. On the side-6 mesh with this symmetric blob the knit
// returns the structure to the starting cells exactly at beat 6, so a single endpoint snapshot reads
// persistence as 1.0 and hides that the structure spent the run spread over the whole lattice. The
// recurrence is real and is reported, and persistence is judged on the mean so a momentary reassembly
// cannot pass as endurance. Both mesh sizes are checked so the conclusion is not a one-size artifact.

import { d4Mesh, meshOpposites } from '@/code/tool/mesh'
import { pairCollision } from '@/code/rule/collision'
import { erasingCollision } from '@/code/control/lossy-collision'
import { sortingCollision } from '@/code/control/conserving-irreversible-collision'
import { makeWill, cloneWill } from '@/code/tone/will'
import { collide } from '@/code/rule/lattice-gas'
import { arpGates, supportFraction } from '@/code/measure/arp'
import { experiment } from '@/test/scaffold/suite'
import { verdict } from '@/test/scaffold/verdict'

// the share of absolute tone that must stay inside the starting cells for a structure to count as
// persistent. Declared here rather than hidden in the measure.
const PERSISTENCE_FLOOR = 0.5

// how many beats each rule runs
const BEATS = 6

// the half-width of the coordinate window that holds the initial structure
const SUPPORT_WIDTH = 2

export default experiment({
  id: 'foundations/arp-separation',
  code: 'E-FND-0074',
  title:
    'conservation, recoverability and persistence are three independent gates on the lattice: a conserving rule can be unrecoverable, and a reversible rule can lose all local structure',
  category: 'foundations',
  substrates: ['3434'],
  depth: 'L2',
  paper: true,
  run() {
    // both sizes must give the same verdict, so the conclusion is not a one-size artifact
    const meshSides = [6, 8]

    const perSize = meshSides.map(meshSide => {
      const mesh = d4Mesh({ side: meshSide })
      const degree = mesh.degree
      const opposite = meshOpposites(mesh)

      const knit = pairCollision({ opposite })
      const knitInverse = pairCollision({ opposite, forward: false })

      const coordinate = (cell: number, axis: number): number =>
        Math.floor(cell / meshSide ** axis) % meshSide

      // the structure sits in a coordinate window near the origin corner, vacuum elsewhere
      const inSupport = (cell: number): boolean => {
        for (let axis = 0; axis < 4; axis++) {
          if (coordinate(cell, axis) >= SUPPORT_WIDTH) {
            return false
          }
        }

        return true
      }

      // a deterministic localized blob: charge only inside the window, arranged so the slot order is
      // deliberately NOT already sorted, so the sorting control genuinely has something to destroy.
      const start = makeWill(mesh)

      for (let cell = 0; cell < mesh.cellCount; cell++) {
        if (!inSupport(cell)) {
          continue
        }

        for (let d = 0; d < degree; d++) {
          start.data[cell * degree + d] = (d % 3) - 1
        }
      }

      // sanity: the sorting control must actually change this state, else its failure would be vacuous
      const sorted = cloneWill(start)

      collide(sorted, sortingCollision)

      let sortingChangesState = false

      for (let i = 0; i < start.data.length; i++) {
        if (sorted.data[i] !== start.data[i]) {
          sortingChangesState = true
          break
        }
      }

      const gatesFor = (
        collision: typeof knit,
        inverseCollision: typeof knit,
      ) =>
        arpGates({
          will: start,
          collision,
          inverseCollision,
          beats: BEATS,
          inSupport,
          persistenceFloor: PERSISTENCE_FLOOR,
        })

      return {
        meshSide,
        startSupport: supportFraction({ will: start, inSupport }),
        sortingChangesState,
        knit: gatesFor(knit, knitInverse),
        sorting: gatesFor(sortingCollision, sortingCollision),
        erasing: gatesFor(erasingCollision, erasingCollision),
      }
    })

    // GAP 1: conservation does not imply recoverability (the sorting rule), at every size
    const conservationWithoutRecoverability = perSize.every(
      s => s.sorting.chargeConserved && !s.sorting.stateRecoverable,
    )

    // GAP 2: recoverability does not imply persistence (the knit on a localized blob), at every size
    const recoverabilityWithoutPersistence = perSize.every(
      s =>
        s.knit.chargeConserved &&
        s.knit.stateRecoverable &&
        !s.knit.structurePersistent,
    )

    // the floor: the erasing rule fails the first gate, at every size
    const erasingFailsConservation = perSize.every(
      s => !s.erasing.chargeConserved,
    )

    const sortingChangesState = perSize.every(s => s.sortingChangesState)

    const first = perSize[0]!
    const second = perSize[1]!

    const ok =
      sortingChangesState &&
      conservationWithoutRecoverability &&
      recoverabilityWithoutPersistence &&
      erasingFailsConservation

    return verdict({
      status: ok ? 'pass' : 'fail',
      claim:
        "Herbert's governing triad is a real hierarchy on the lattice and not three words for one property: the sorting rule conserves the total charge to the integer while destroying which direction carried which tone, so it is conserving but unrecoverable, and the committed knit conserves and reverses bit for bit while a localized blob streams out of the cells it started in, so it is recoverable but not persistent, with the erasing rule failing conservation outright as the floor, which gives an independent witness for each gap in the ladder",
      metrics: {
        beats: BEATS,
        persistenceFloor: PERSISTENCE_FLOOR,
        meshSideA: first.meshSide,
        meshSideB: second.meshSide,
        startSupport: first.startSupport,
        knitConservedA: first.knit.chargeConserved ? 1 : 0,
        knitRecoverableA: first.knit.stateRecoverable ? 1 : 0,
        knitPersistentA: first.knit.structurePersistent ? 1 : 0,
        knitSupportMeanA: first.knit.supportMean,
        knitSupportMinA: first.knit.supportMin,
        knitSupportFinalA: first.knit.supportAfter,
        knitSupportMeanB: second.knit.supportMean,
        sortingConservedA: first.sorting.chargeConserved ? 1 : 0,
        sortingRecoverableA: first.sorting.stateRecoverable ? 1 : 0,
        sortingConservedB: second.sorting.chargeConserved ? 1 : 0,
        sortingRecoverableB: second.sorting.stateRecoverable ? 1 : 0,
        conservationWithoutRecoverability:
          conservationWithoutRecoverability ? 1 : 0,
        recoverabilityWithoutPersistence: recoverabilityWithoutPersistence
          ? 1
          : 0,
      },
      control: {
        erasingConservedA: first.erasing.chargeConserved ? 1 : 0,
        erasingRecoverableA: first.erasing.stateRecoverable ? 1 : 0,
        erasingChargeBeforeA: first.erasing.chargeBefore,
        erasingChargeAfterA: first.erasing.chargeAfter,
        erasingConservedB: second.erasing.chargeConserved ? 1 : 0,
        sortingChangesState: sortingChangesState ? 1 : 0,
      },
      notes:
        'L2, the lattice realization of the Chronoflux governing triad (DPL-02). Each gap gets its own witness rather than an assertion. The sorting collision is a counting sort over the three tone values, so it permutes the multiset of a cell slots and preserves charge exactly while being many-to-one, which is why it conserves but cannot be inverted. It is verified to actually change this state, so its recoverability failure is not vacuous. The knit is the committed reversible pair collision with its explicit paired inverse, and the persistence failure is measured as the share of absolute tone still inside the starting window, against a floor declared in the experiment. Persistence here is about a LOCAL identity surviving, which is why a globally reversible rule can fail it: nothing is destroyed, it simply is not there any more. Fully deterministic, one fixed localized fill, vacuum outside, no random source anywhere.',
    })
  },
})
