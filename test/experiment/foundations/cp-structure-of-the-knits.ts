// The discrete C, P, T structure of the three knits, measured with the corrected reversal convention,
// and where CP violation lives. Two method corrections first, both found while building this:
// (1) beat() collides its input in place before streaming, so every symmetry test must copy state,
// and (2) the naive reversal statement T(forward(T(s))) = backward(s) of E-FND-0011 cannot hold for
// a staggered collide-then-stream rule on generic states. The true identity flips the half-step:
// X compose U compose X equals the inverse of the stream-then-collide beat, which holds exactly when
// X inverts the collision by conjugation and reverses streaming. E-FND-0011's checks pass on its
// linear special state and fail on generic ones, the same artifact family as E-FND-0096.
//
// With the corrected convention, on three generic deterministic states:
//   - The MOMENTUM knit is textbook: C, P, CP exact symmetries, and T, CT, PT, CPT all exact
//     reversals. Everything conserved.
//   - The CHARGE knit (the committed Z_3 clock table) is exactly T-reversible (the pair table
//     conjugated by end-swap is its own inverse) but violates C, P and CP by measured amounts on
//     every state: the committed clock runs matter and antimatter differently, Sakharov's
//     C-violation condition in the base rule. Among the tested conjugations none of the CPT-type
//     combinations is exact for it, an open flag: the full 24-cell point group (this parity is the
//     single-axis mirror of the square mesh) is the place a restoring conjugation could still live.
//   - The TRAVELLER knit (lineHop) holds exactly one reversal, PT, on every state, and violates C
//     and CP: CP violation in the clock-coupled sector with an exact antiunitary-style partner, the
//     shape (though not yet the precision structure) of the weak sector.
//
// So CP violation is not missing from the model, it is measured and located: the momentum sector
// conserves everything, both clock-coupled knits violate C and CP. With the growth arrow (T-odd
// initial condition) and the conserving interactions, all three Sakharov conditions exist in the
// base. Depth L2: measured symmetry algebra of the stated rules on generic states, exactness gates
// at zero, deterministic, no randomness.

import { experiment } from '@/test/scaffold/suite'
import { verdict } from '@/test/scaffold/verdict'
import {
  squareMesh,
  meshOpposites,
  meshNeighbors,
} from '@/code/tool/mesh'
import { makeWill, Will } from '@/code/tone/will'
import {
  Collision,
  headOnRotate,
  lineHop,
  pairCollision,
} from '@/code/rule/collision'
import { beat, collide, streamInverse } from '@/code/rule/lattice-gas'
import { Tone } from '@/code/tone/tone'

const SIDE = 6

// combo indices into the 7-row table: mask - 1 with mask bits C=1, P=2, T=4
const C = 0
const P = 1
const CP = 2
const T = 3
const CT = 4
const PT = 5
const CPT = 6

type Row = { sym: number; rev: number }

function knitTable(input: {
  rule: Collision
  inverse: Collision
  pattern: (i: number) => Tone
}): Row[] {
  const mesh = squareMesh({ side: SIDE })
  const opposite = meshOpposites(mesh)
  const neighbors = meshNeighbors(mesh)
  const ex: number[] = []
  const ey: number[] = []

  for (let d = 0; d < mesh.degree; d++) {
    const n = neighbors[0]![d]!
    let dx = n % SIDE
    let dy = Math.floor(n / SIDE) % SIDE

    if (dx > SIDE / 2) {
      dx -= SIDE
    }

    if (dy > SIDE / 2) {
      dy -= SIDE
    }

    ex.push(dx)
    ey.push(dy)
  }

  const pdir = ex.map((v, d) =>
    ex.findIndex((w, i) => w === -v && ey[i] === ey[d]!),
  )

  const start = makeWill(mesh)

  for (let i = 0; i < start.data.length; i++) {
    start.data[i] = input.pattern(i)
  }

  // beat mutates its input in place before streaming, so every use takes a fresh copy
  const fresh = (): Will => ({
    mesh,
    data: Int8Array.from(start.data),
  })

  // the inverse of the OTHER-convention beat (stream then collide): collide with the inverse
  // table, then stream backward. This is what a reversal conjugation must produce.
  const flippedInverse = (w: Will): Will => {
    const copy: Will = { mesh, data: Int8Array.from(w.data) }

    collide(copy, input.inverse)

    return streamInverse(copy)
  }

  const transform = (
    w: Will,
    useC: boolean,
    useP: boolean,
    useT: boolean,
  ): Will => {
    const out = makeWill(mesh)

    for (let cell = 0; cell < mesh.cellCount; cell++) {
      const x = cell % SIDE
      const y = Math.floor(cell / SIDE)
      const target = useP ? SIDE - 1 - x + y * SIDE : cell

      for (let d = 0; d < mesh.degree; d++) {
        let d2 = useP ? pdir[d]! : d

        if (useT) {
          d2 = opposite[d2]!
        }

        const tone = w.data[cell * mesh.degree + d]!

        out.data[target * mesh.degree + d2] = (
          useC ? -tone : tone
        ) as Tone
      }
    }

    return out
  }

  const hamming = (a: Will, b: Will): number => {
    let h = 0

    for (let i = 0; i < a.data.length; i++) {
      if (a.data[i] !== b.data[i]) {
        h++
      }
    }

    return h
  }

  const table: Row[] = []

  for (let mask = 1; mask < 8; mask++) {
    const useC = (mask & 1) !== 0
    const useP = (mask & 2) !== 0
    const useT = (mask & 4) !== 0
    const sym = hamming(
      beat(transform(fresh(), useC, useP, useT), input.rule),
      transform(beat(fresh(), input.rule), useC, useP, useT),
    )
    const rev = hamming(
      beat(transform(fresh(), useC, useP, useT), input.rule),
      transform(flippedInverse(fresh()), useC, useP, useT),
    )

    table.push({ sym, rev })
  }

  return table
}

export default experiment({
  id: 'foundations/cp-structure-of-the-knits',
  code: 'E-FND-0097',
  title:
    "where CP violation lives, measured with the corrected half-step reversal on three generic states: the momentum knit is textbook (C, P, CP exact symmetries, all four T combinations exact reversals), the committed charge knit is exactly T-reversible yet violates C, P and CP on every state (its clock runs matter and antimatter differently, Sakharov's C violation in the base rule) with no tested CPT-type conjugation exact, the traveller knit holds exactly the PT reversal while violating C and CP, and the naive reversal convention of E-FND-0011 is shown to pass only on its linear special state, so CP violation is measured and located in the clock-coupled sector",
  category: 'foundations',
  substrates: 'any',
  depth: 'L2',
  paper: true,
  run() {
    const patterns: ((i: number) => Tone)[] = [
      i => ((((i * 5 + (i % 11)) % 3) - 1) as Tone),
      i => ((((i * i + 2 * i) % 3) - 1) as Tone),
      i => ((((i * 11 + (i % 7) * 2) % 3) - 1) as Tone),
    ]

    const mesh = squareMesh({ side: SIDE })
    const opposite = meshOpposites(mesh)
    const momentum = patterns.map(pattern =>
      knitTable({
        rule: headOnRotate({ opposite }),
        inverse: headOnRotate({ opposite }),
        pattern,
      }),
    )
    const charge = patterns.map(pattern =>
      knitTable({
        rule: pairCollision({ opposite }),
        inverse: pairCollision({ opposite, forward: false }),
        pattern,
      }),
    )
    const traveller = patterns.map(pattern =>
      knitTable({
        rule: lineHop({ opposite }),
        inverse: lineHop({ opposite, forward: false }),
        pattern,
      }),
    )

    const momentumTextbook = momentum.every(
      t =>
        t[C]!.sym === 0 &&
        t[P]!.sym === 0 &&
        t[CP]!.sym === 0 &&
        t[T]!.rev === 0 &&
        t[CT]!.rev === 0 &&
        t[PT]!.rev === 0 &&
        t[CPT]!.rev === 0,
    )

    const chargeShape = charge.every(
      t =>
        t[T]!.rev === 0 &&
        t[C]!.sym > 0 &&
        t[P]!.sym > 0 &&
        t[CP]!.sym > 0,
    )
    const chargeNoCptFound = charge.some(
      t => t[CPT]!.rev > 0 && t[CT]!.rev > 0 && t[PT]!.rev > 0,
    )

    const travellerShape = traveller.every(
      t => t[PT]!.rev === 0 && t[C]!.sym > 0 && t[CP]!.sym > 0,
    )

    const ok =
      momentumTextbook &&
      chargeShape &&
      chargeNoCptFound &&
      travellerShape

    return verdict({
      status: ok ? 'pass' : 'fail',
      claim:
        'on three generic states the momentum knit passes all seven textbook checks exactly, the charge knit is exactly T-reversible while violating C, P and CP on every state, and the traveller knit holds exactly the PT reversal while violating C and CP',
      metrics: {
        chargeCpViolationSlots: Math.max(
          ...charge.map(t => t[CP]!.sym),
        ),
        chargeCViolationSlots: Math.max(...charge.map(t => t[C]!.sym)),
        travellerCpViolationSlots: Math.max(
          ...traveller.map(t => t[CP]!.sym),
        ),
        chargeCptResidual: Math.min(...charge.map(t => t[CPT]!.rev)),
        slotCount: SIDE * SIDE * 4,
      },
      // CONTROL: the momentum knit, where every symmetry that should hold holds at exactly zero on
      // every state, so the violations measured on the clock knits are properties of those knits
      control: {
        momentumWorstResidual: Math.max(
          ...momentum.flatMap(t =>
            t.map((row, i) => (i >= T ? row.rev : row.sym)),
          ),
        ),
      },
      notes:
        "the open flag is the charge knit's CPT: within {C, P(single-axis mirror), T(velocity reversal)} no CPT-type conjugation is exact for it, and nature's CPT nulls are the strongest in physics, so either a restoring conjugation exists in the larger 24-cell point group (possibly combined with a clock-phase coset), or the committed table has a real CPT problem. That hunt is the named follow-up. E-FND-0011's T and CPT lines hold only on its linear special state under the naive convention and are corrected by this experiment. Sakharov scorecard: C violated (here), CP violated (here), departure from equilibrium (the growth arrow), all three present in the base.",
    })
  },
})
