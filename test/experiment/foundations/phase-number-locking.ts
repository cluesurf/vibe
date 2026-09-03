// Phase-number locking, the coherence bridge's measured answer. The Born programme needed
// one more instrument: a PHASE KNOB for the dressed species, a slab regime that changes a
// packet's phase while leaving its excitation number untouched, so an interferometer
// could test whether accumulated phase redistributes number at recombination. The knob
// search (a full offset sweep at fixed geometry) found the structural law instead:
//
//   - BLIND REGIMES ARE EXACT: three offsets reproduce the no-slab baseline identically,
//     in number AND in amplitude to the last decimal.
//   - EVERY PHASE-SHIFTING REGIME ALSO CHANGES NUMBER, and one regime adds number at
//     fixed phase, but NO regime in the sweep moves phase at fixed number. For the
//     dressed species, phase and number are LOCKED.
//   - THE MODIFIED AMPLITUDES QUANTIZE EXACTLY: the sweep's amplitude levels are two
//     root three, root thirty-nine, and two root twenty-one, discrete to machine
//     precision, another quantized ladder where a continuum could have appeared.
//
// The consequence, stated as the committed physics: a dressed packet cannot be split
// into equal-number branches differing only in phase, so single-quantum-style coherence
// between detector classes does not exist for dressed packets on the substrate in this
// regime. Combined with the exact number-operator detection (E-FND-0123, E-FND-0124)
// and the port law (E-FND-0125, E-FND-0126), the model's quantum statistics are
// complete for every preparable state, and its committed observable consequence stands:
// if single-quantum coherence is real at scale in nature, this substrate predicts a
// number-organized visibility floor, the falsifiable stake of the programme. Depth L2,
// deterministic, the exact blind regimes the control.

import { experiment } from '@/test/scaffold/suite'
import { verdict } from '@/test/scaffold/verdict'
import { d4Mesh, meshOpposites } from '@/code/tool/mesh'
import { makeWill, Will } from '@/code/tone/will'
import { growingBeat } from '@/code/rule/lattice-gas'
import { turningWeave } from '@/code/rule/collision'
import { clockAmplitude } from '@/code/measure/clock-amplitude'
import { pairSub } from '@/code/algebra/linear/complex-pair'

const SIDE = 17

export default experiment({
  id: 'foundations/phase-number-locking',
  code: 'E-FND-0140',
  title:
    'phase and number are locked for the dressed species: the full slab-offset sweep finds exact blind regimes (identical to the no-slab baseline in number and amplitude), regimes that change both together, one that adds number at fixed phase, and NONE that moves phase at fixed number, with the modified amplitudes quantizing exactly to two root three, root thirty-nine, and two root twenty-one, so a dressed packet cannot be split into equal-number phase branches, single-quantum-style coherence between detector classes does not exist on the substrate in this regime, and the number-organized visibility floor stands as the programme committed falsifiable observable',
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
    const mid = 8

    const run = (
      offset: number | null,
    ): { n: number; amp: number } => {
      const slab = new Set<number>()

      if (offset !== null) {
        for (let c = 0; c < mesh.cellCount; c++) {
          if (coordinate(c, 0) === 8) {
            slab.add(c)
          }
        }
      }

      let vacuum: Will = makeWill(mesh)
      let seeded: Will = makeWill(mesh)

      for (let t = 0; t < 17; t++) {
        if (t === 3) {
          const slot =
            (6 + 4 * SIDE + mid * SIDE * SIDE + mid * SIDE ** 3) * 24 +
            8
          const v = seeded.data[slot]!

          seeded.data[slot] = (((v + 1 + 4) % 3) - 1) as -1 | 0 | 1
        }

        const active = (c: number): boolean =>
          slab.has(c) && offset !== null ? t >= offset : true

        vacuum = growingBeat(vacuum, rule(t), active)
        seeded = growingBeat(seeded, rule(t), active)
      }

      let n = 0

      for (let i = 0; i < seeded.data.length; i++) {
        if (seeded.data[i] !== vacuum.data[i]) {
          n++
        }
      }

      const d = pairSub(clockAmplitude(seeded), clockAmplitude(vacuum))

      return { n, amp: Math.hypot(d[0], d[1]) }
    }

    const baseline = run(null)
    const blind = [17, 19, 21].map(run)
    const locked = [3, 7].map(run)
    const numberOnly = run(1)

    const blindExact = blind.every(
      r =>
        r.n === baseline.n &&
        Math.abs(r.amp - baseline.amp) < 1e-9,
    )
    const lockedBoth = locked.every(
      r =>
        r.n !== baseline.n &&
        Math.abs(r.amp - baseline.amp) > 0.5 &&
        Math.abs(r.amp - 2 * Math.sqrt(3)) < 1e-9,
    )
    const numberAtFixedPhase =
      numberOnly.n > baseline.n &&
      Math.abs(numberOnly.amp - baseline.amp) < 1e-9
    const baselineQuantized =
      Math.abs(baseline.amp - 2 * Math.sqrt(21)) < 1e-9

    const ok =
      blindExact && lockedBoth && numberAtFixedPhase && baselineQuantized

    return verdict({
      status: ok ? 'pass' : 'fail',
      claim:
        'the three blind offsets reproduce the baseline exactly in number and amplitude, both locked offsets change number and drop the amplitude to exactly two root three, the number-only offset adds number at exactly the baseline amplitude, and the baseline amplitude itself is exactly two root twenty-one',
      metrics: {
        baselineNumber: baseline.n,
        baselineAmp: Number(baseline.amp.toFixed(4)),
        blindExact: blindExact ? 1 : 0,
        lockedAmp: Number(locked[0]!.amp.toFixed(4)),
        numberOnlyN: numberOnly.n,
      },
      // CONTROL: the exact blind regimes, the same instrument reading identity to the
      // last decimal where the theory says nothing happens
      control: {
        blindRegimesExact: blindExact ? 1 : 0,
      },
      notes:
        'the full sweep (task/phase-knob-sweep.ts) covered twelve offsets: no regime moves phase at fixed number, and the three amplitude levels across the sweep are exactly two root three, root thirty-nine, and two root twenty-one. The locking is measured at one geometry and one species, stated; its structural reading (no independent phase degree of freedom for dressed packets) matches the deterministic substrate having no continuous phase to steer, and the committed observable (a number-organized visibility floor at scale) is recorded in note/prediction/intelligence.md.',
    })
  },
})
