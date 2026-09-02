// The first sixth-thing candidate, built and measured, and the exact negative it earns. The Madelung
// gap (foundations/madelung-gap) specifies what a quantum needs that the base lacks: a law coupling
// clock-phase gradients to currents. The minimal reversible candidate is built here, the CLOCK-COUPLED
// SWAP: the twelve lines of a cell are coupled in directed pairs, and a line swaps its two slots
// exactly when its partner line (the clock wire, never itself swapped) reads the clock marker (+1,-1).
// Conditioned on an untouched part of the state, the swap is an involution, so the composite rule
// (the charge table then the swap) is a bijection, and it conserves every pair sum.
//
// Measured:
//
//   - THE COMPOSITE IS A LEGAL RULE. Twenty beats forward and twenty inverse return the exact
//     microstate (Hamming distance zero) with zero charge drift.
//   - IT DOES COUPLE THE CLOCK TO TRANSPORT. At the domain wall of the growing gas, where the bare
//     rule holds a defect's regional intensity exactly constant beat after beat (phases without
//     currents), the composite moves the difference out of the region within one beat.
//   - AND IT AMPLIFIES. In the uniform bulk a lone defect under the composite does not keep its
//     sqrt 3 magnitude: its difference cluster grows several-fold within nine beats, because every
//     vacuum cell's clock wire is marked once per cycle and the swap spreads the difference.
//
// So the minimal clock-coupling buys transport at the price of the defect's identity, and the
// sixth-thing specification tightens by one exact clause: the coupling must move the density along
// phase gradients WHILE preserving the defect's coarse magnitude, and this candidate proves the two
// demands conflict in the simplest design. Depth L2, an ADDITION under test, never part of the base:
// the bare rule is the control on both sides (static at the wall, stable in the bulk).

import { experiment } from '@/test/scaffold/suite'
import { verdict } from '@/test/scaffold/verdict'
import { d4Mesh, meshOpposites, shellDistances } from '@/code/tool/mesh'
import { makeWill, Will, charge } from '@/code/tone/will'
import { Collision, pairCollision } from '@/code/rule/collision'
import {
  beat,
  growingBeat,
  stream,
  streamInverse,
} from '@/code/rule/lattice-gas'
import { regionClockAmplitude } from '@/code/measure/clock-amplitude'
import { pairAbs2, pairSub } from '@/code/algebra/linear/complex-pair'

const SIDE = 7
const EXACT = 1e-9
const ROOT3 = Math.sqrt(3)

function makeRules(mesh: ReturnType<typeof d4Mesh>): {
  bare: Collision
  composite: Collision
  compositeInverse: Collision
} {
  const opposite = meshOpposites(mesh)
  const lines: [number, number][] = []

  for (let d = 0; d < mesh.degree; d++) {
    const o = opposite[d]!

    if (d < o) {
      lines.push([d, o])
    }
  }

  const couples: [[number, number], [number, number]][] = []

  for (let k = 0; k + 1 < lines.length; k += 2) {
    couples.push([lines[k]!, lines[k + 1]!])
  }

  // a line swaps its slots exactly when its clock wire reads (+1, -1); the wire is never swapped
  const clockHop = (slots: Int8Array, base: number): void => {
    for (const [line, wire] of couples) {
      if (slots[base + wire[0]] === 1 && slots[base + wire[1]] === -1) {
        const held = slots[base + line[0]]!

        slots[base + line[0]] = slots[base + line[1]]!
        slots[base + line[1]] = held
      }
    }
  }

  const bare = pairCollision({ opposite })
  const bareInverse = pairCollision({ opposite, forward: false })

  return {
    bare,
    composite: (slots, base, degree) => {
      bare(slots, base, degree)
      clockHop(slots, base)
    },
    compositeInverse: (slots, base, degree) => {
      clockHop(slots, base)
      bareInverse(slots, base, degree)
    },
  }
}

export default experiment({
  id: 'foundations/clock-coupled-swap-addition',
  code: 'E-FND-0092',
  title:
    'the minimal clock-transport addition, built and measured: the clock-coupled swap (a line swaps its slots when its partner wire reads the clock marker) composes with the charge rule into an exactly reversible conserving rule that DOES move a defect out of the wall region in one beat where the bare rule is exactly static, and AMPLIFIES in the bulk (a lone defect grows several-fold instead of keeping sqrt 3), so the simplest coupling of phase to transport destroys the particle it transports and the sixth-thing specification gains an exact clause: move the density along phase gradients while preserving the coarse magnitude',
  category: 'foundations',
  substrates: ['3434'],
  depth: 'L2',
  paper: true,
  run() {
    const mesh = d4Mesh({ side: SIDE })
    const { bare, composite, compositeInverse } = makeRules(mesh)
    const all = Array.from({ length: mesh.cellCount }, (_, i) => i)

    // 1. legality: the exact echo with charge conserved
    let will: Will = makeWill(mesh)

    for (let i = 0; i < will.data.length; i += 7) {
      will.data[i] = ((i / 7) % 3) - 1
    }

    const start = Int8Array.from(will.data)

    for (let t = 0; t < 20; t++) {
      for (let cell = 0; cell < mesh.cellCount; cell++) {
        composite(will.data, cell * mesh.degree, mesh.degree)
      }

      will = stream(will)
    }

    for (let t = 0; t < 20; t++) {
      will = streamInverse(will)

      for (let cell = 0; cell < mesh.cellCount; cell++) {
        compositeInverse(will.data, cell * mesh.degree, mesh.degree)
      }
    }

    let echoHamming = 0

    for (let i = 0; i < will.data.length; i++) {
      if (will.data[i] !== start[i]) {
        echoHamming++
      }
    }

    const chargeDrift =
      charge(will) - charge({ mesh, data: start })

    // 2. the bulk: a lone defect's magnitude under each rule over nine beats
    const bulkMagnitudes = (rule: Collision): number[] => {
      let vacuum: Will = makeWill(mesh)
      let seeded: Will = makeWill(mesh)

      seeded.data[Math.floor(mesh.cellCount / 2) * mesh.degree] = 1

      const out: number[] = []

      for (let t = 0; t < 9; t++) {
        vacuum = beat(vacuum, rule)
        seeded = beat(seeded, rule)
        out.push(
          Math.sqrt(
            pairAbs2(
              pairSub(
                regionClockAmplitude(seeded, all),
                regionClockAmplitude(vacuum, all),
              ),
            ),
          ),
        )
      }

      return out
    }

    const bareBulk = bulkMagnitudes(bare)
    const compositeBulk = bulkMagnitudes(composite)

    // 3. the wall: the regional defect intensity, static under bare, moved out under the composite
    const distance = shellDistances(mesh, 0)
    const late = new Set<number>()

    for (let cell = 0; cell < mesh.cellCount; cell++) {
      if ((distance[cell] ?? 99) <= 2) {
        late.add(cell)
      }
    }

    const lateCells = [...late]
    const nearWall = lateCells.find(cell => distance[cell] === 2)!

    const wallIntensities = (rule: Collision): number[] => {
      const finals: Will[][] = [[], []]

      for (let which = 0; which < 2; which++) {
        let state: Will = makeWill(mesh)

        for (let t = 0; t < 16; t++) {
          if (which === 1 && t === 4) {
            state.data[nearWall * mesh.degree] = 1
          }

          state = growingBeat(state, rule, cell =>
            late.has(cell) ? t >= 1 : true,
          )
          finals[which]!.push({ mesh, data: Int8Array.from(state.data) })
        }
      }

      const out: number[] = []

      for (let t = 6; t < 16; t++) {
        out.push(
          pairAbs2(
            pairSub(
              regionClockAmplitude(finals[1]![t]!, lateCells),
              regionClockAmplitude(finals[0]![t]!, lateCells),
            ),
          ),
        )
      }

      return out
    }

    const bareWall = wallIntensities(bare)
    const compositeWall = wallIntensities(composite)

    const legal = echoHamming === 0 && chargeDrift === 0
    const bareStable = bareBulk.every(m => Math.abs(m - ROOT3) < EXACT)
    const compositeAmplifies =
      Math.max(...compositeBulk) > 3 * ROOT3
    const bareStatic = bareWall.every(
      value => Math.abs(value - bareWall[0]!) < EXACT,
    )
    const compositeMoves = compositeWall.every(value => value < EXACT)

    const ok =
      legal &&
      bareStable &&
      compositeAmplifies &&
      bareStatic &&
      compositeMoves

    return verdict({
      status: ok ? 'pass' : 'fail',
      claim:
        'the clock-coupled swap composed with the charge rule passes the exact echo over twenty beats with zero charge drift (a legal reversible conserving rule), the bare rule keeps a bulk lone defect at exactly sqrt 3 while the composite grows it beyond three times that within nine beats, and at the domain wall the bare rule holds the regional defect intensity exactly constant while the composite empties the region within a beat, so the minimal phase-transport coupling works and destroys the particle at once, tightening the sixth-thing specification to transport with magnitude preservation',
      metrics: {
        echoHamming,
        chargeDrift,
        bareBulkMax: Number(Math.max(...bareBulk).toFixed(6)),
        compositeBulkMax: Number(Math.max(...compositeBulk).toFixed(4)),
        compositeWallMax: Number(
          Math.max(...compositeWall).toExponential(2),
        ),
        bareWallIntensity: Number(bareWall[0]!.toFixed(4)),
      },
      // CONTROL: the bare rule on both measurements, stable in the bulk and static at the wall
      control: {
        bareBulkDeviation: Number(
          Math.max(
            ...bareBulk.map(m => Math.abs(m - ROOT3)),
          ).toExponential(2),
        ),
        bareWallDrift: Number(
          Math.max(
            ...bareWall.map(value => Math.abs(value - bareWall[0]!)),
          ).toExponential(2),
        ),
      },
      notes:
        'Roadmap base-model 0014, the exhibit clause: the item asks for a minimal extension with a passing experiment or the exact negative, and this is both, the extension is legal and couples phase to transport, and the negative is exact, it amplifies what it moves. The design space this rules out: any coupling that swaps a line on the vacuum clock marker acts on the vacuum itself once per cycle, so it cannot leave the defect background invariant. A coupling conditioned on a DIFFERENCE from the local vacuum cycle rather than on the cycle state itself is the next candidate, and it needs memory of the local birth beat, which is exactly what the fills could store, tying the gauge addition (E-FRC-0073) and the transport addition into one design question.',
    })
  },
})
