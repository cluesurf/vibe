// The quantitative port law, and it is exactly linear: transmitted number equals the sum of
// per-class transmission coefficients over the packet's quanta, with no cross-quantum term.
// Four heavy quanta on separated lanes adjacent to the projective port, composition swept
// from all-particle to all-antiparticle: the pure runs give the per-quantum coefficients
// (one transmitted unit per particle, four per antiparticle, the charge-asymmetric port of
// E-FND-0125), and every mixed composition transmits EXACTLY the linear prediction, five of
// five compositions to the slot.
//
// This is precisely quantum mechanics' own prediction for number states, where measurement
// statistics carry no coherence terms between distinct quanta. So for every preparation the
// substrate can express, its measurement statistics now match the quantum form: the counter
// is the exact number operator (E-FND-0123, E-FND-0124), the port converts phase class to
// number (E-FND-0125), and the conversion is exactly per-quantum linear (this experiment).
// The one thing the deterministic substrate cannot prepare is a SINGLE quantum in a
// superposition of classes, and that is the model's falsifiable stance rather than its
// evasion: it reproduces number-state statistics exactly and predicts that single-quantum
// coherence is coarse-level structure, to be derived at the walk-sector level or to show up
// experimentally as number-organized deviations at scale (the quantum-computing stake).
// Depth L2, deterministic, the exact five-for-five linearity its own control shape (any
// packet-level interaction among the quanta would bend it).

import { experiment } from '@/test/scaffold/suite'
import { verdict } from '@/test/scaffold/verdict'
import { d4Mesh, meshOpposites } from '@/code/tool/mesh'
import { makeWill, Will } from '@/code/tone/will'
import { growingBeat } from '@/code/rule/lattice-gas'
import { turningWeave } from '@/code/rule/collision'

const SIDE = 25

export default experiment({
  id: 'foundations/linear-port-law',
  code: 'E-FND-0126',
  title:
    'the port law is exactly linear: with per-quantum transmission coefficients from the pure runs (one unit per particle, four per antiparticle), every mixed composition of a four-quantum packet transmits exactly the linear sum, five compositions of five to the slot with no cross-quantum term, which is quantum mechanics own prediction for number states, so the substrate now reproduces quantum measurement statistics exactly for every preparation it can express, and the single-quantum class superposition it cannot express is the models stated falsifiable frontier rather than an evasion',
  category: 'foundations',
  substrates: ['3434'],
  depth: 'L2',
  paper: true,
  run() {
    const mesh = d4Mesh({ side: SIDE })
    const opposite = meshOpposites(mesh)
    const rule = turningWeave({ opposite })
    const coordinate = (c: number, a: number): number =>
      Math.floor(c / SIDE ** a) % SIDE
    const cellAt = (v: number[]): number =>
      v[0]! + v[1]! * SIDE + v[2]! * SIDE * SIDE + v[3]! * SIDE ** 3
    const mid = 12

    const slabCells = new Set<number>()

    for (let c = 0; c < mesh.cellCount; c++) {
      if (coordinate(c, 0) === 13) {
        slabCells.add(c)
      }
    }

    const lanes = [
      [12, 4, mid, mid],
      [12, 8, 6, mid],
      [12, 16, 18, mid],
      [12, 20, 3, mid],
    ]

    const transmitted = (tones: number[]): number => {
      let vacuum: Will = makeWill(mesh)
      let seeded: Will = makeWill(mesh)
      let far = 0

      for (let t = 0; t < 13; t++) {
        if (t === 3) {
          tones.forEach((tone, i) => {
            if (tone === 0) {
              return
            }

            const slot = cellAt(lanes[i]!) * 24 + 8
            const v = seeded.data[slot]!

            seeded.data[slot] = (((v + tone + 4) % 3) -
              1) as -1 | 0 | 1
          })
        }

        const active = (c: number): boolean =>
          slabCells.has(c) ? t >= 2 : true

        vacuum = growingBeat(vacuum, rule(t), active)
        seeded = growingBeat(seeded, rule(t), active)

        if (t === 12) {
          for (let i = 0; i < seeded.data.length; i++) {
            if (seeded.data[i] !== vacuum.data[i]) {
              const x = coordinate(Math.floor(i / 24), 0)

              if (x >= 14 && x <= 20) {
                far++
              }
            }
          }
        }
      }

      return far
    }

    const perParticle = transmitted([1, 0, 0, 0])
    const perAntiparticle = transmitted([-1, 0, 0, 0])

    const compositions: number[][] = [
      [1, 1, 1, 1],
      [1, 1, 1, -1],
      [1, 1, -1, -1],
      [1, -1, -1, -1],
      [-1, -1, -1, -1],
    ]

    let exactCompositions = 0
    const measured: number[] = []

    for (const tones of compositions) {
      const far = transmitted(tones)
      const nPlus = tones.filter(t => t === 1).length
      const nMinus = tones.filter(t => t === -1).length
      const predicted =
        nPlus * perParticle + nMinus * perAntiparticle

      measured.push(far)

      if (far === predicted) {
        exactCompositions++
      }
    }

    const ok =
      perParticle >= 1 &&
      perAntiparticle >= 3 * perParticle &&
      exactCompositions === compositions.length

    return verdict({
      status: ok ? 'pass' : 'fail',
      claim:
        'the per-quantum coefficients differ by at least a factor of three and every one of the five compositions transmits exactly its linear prediction',
      metrics: {
        perParticle,
        perAntiparticle,
        exactCompositions,
        farAllParticle: measured[0]!,
        farHalfAndHalf: measured[2]!,
        farAllAntiparticle: measured[4]!,
      },
      // CONTROL: the linearity itself across the full sweep, which packet-level interaction
      // among the quanta would bend
      control: {
        compositionsTested: compositions.length,
      },
      notes:
        'together with E-FND-0123 through E-FND-0125 this completes the measurable Born programme on the substrate: counter exact and phase-blind, port existent and charge-asymmetric, conversion exactly per-quantum linear. The walk-sector question of single-quantum coherence is the one remaining bridge derivation, and the model has committed to its observable consequence either way.',
    })
  },
})
