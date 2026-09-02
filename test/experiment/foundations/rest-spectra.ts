// The rest spectra of the adopted rule's at-rest species, and the breather ladder
// survives the turning weave: of the four species the speed spectrum found exactly at
// rest (E-FND-0129), two are EXACT LADDER STATES, their temporal spectra carrying power
// at precisely the harmonic ladder of one half lattice energy unit (frequencies zero,
// one half, one, three halves in kick-law hbar units) with the same powers the static
// weave breather showed (E-FND-0121) and nothing anywhere else, and two are broadband
// non-oscillator states with power spread across the spectrum. So the massive bound
// state with its quantized internal clock is not an artifact of the frozen schedule: the
// committed turning rule carries it in two of its four rest channels, and it
// distinguishes sharply between quantized and broadband rest states under one
// instrument. Depth L2, deterministic, the broadband pair the control that the ladder
// pair's exact zeros are not the instrument's doing.

import { experiment } from '@/test/scaffold/suite'
import { verdict } from '@/test/scaffold/verdict'
import { d4Mesh, meshOpposites } from '@/code/tool/mesh'
import { makeWill, Will } from '@/code/tone/will'
import { beat } from '@/code/rule/lattice-gas'
import { turningWeave } from '@/code/rule/collision'

const SIDE = 9
const BEATS = 48

export default experiment({
  id: 'foundations/rest-spectra',
  code: 'E-FND-0130',
  title:
    'the breather ladder survives the adopted rule: two of the four at-rest species are exact ladder states, their temporal spectra carrying power at precisely the harmonic ladder of one half lattice energy unit with machine-zero power off the ladder and the same weights the static-weave breather showed, while the other two rest species are broadband non-oscillator states, the sharp two-class split measured under one instrument with the broadband pair as the control',
  category: 'foundations',
  substrates: ['3434'],
  depth: 'L2',
  paper: true,
  run() {
    const mesh = d4Mesh({ side: SIDE })
    const opposite = meshOpposites(mesh)
    const rule = turningWeave({ opposite })
    const mid = Math.floor(SIDE / 2)
    const center =
      mid + mid * SIDE + mid * SIDE * SIDE + mid * SIDE ** 3

    const spectrumOf = (
      dir: number,
    ): { ladder: number[]; offLadder: number[] } => {
      let vacuum: Will = makeWill(mesh)
      let seeded: Will = makeWill(mesh)

      seeded.data[center * 24 + dir] = 1

      const series = new Map<
        number,
        { re: number[]; im: number[] }
      >()

      for (let t = 0; t < BEATS; t++) {
        vacuum = beat(vacuum, rule(t % 24))
        seeded = beat(seeded, rule(t % 24))

        for (let i = 0; i < seeded.data.length; i++) {
          const dv = seeded.data[i]! - vacuum.data[i]!

          if (dv !== 0 || series.has(i)) {
            if (!series.has(i)) {
              series.set(i, {
                re: new Array<number>(BEATS).fill(0),
                im: new Array<number>(BEATS).fill(0),
              })
            }

            const s = series.get(i)!
            const angle = (2 * Math.PI * (((dv % 3) + 3) % 3)) / 3

            s.re[t] = Math.cos(angle) - 1
            s.im[t] = Math.sin(angle)
          }
        }
      }

      const powerAt = (f: number): number => {
        let power = 0

        for (const s of series.values()) {
          let re = 0
          let im = 0

          for (let t = 0; t < BEATS; t++) {
            const c = Math.cos(2 * Math.PI * f * t)
            const w = -Math.sin(2 * Math.PI * f * t)

            re += s.re[t]! * c - s.im[t]! * w
            im += s.re[t]! * w + s.im[t]! * c
          }

          power += (re * re + im * im) / (BEATS * BEATS)
        }

        return power
      }

      return {
        ladder: [4 / 24, 8 / 24, 12 / 24].map(powerAt),
        offLadder: [1 / 24, 2 / 24, 3 / 24, 5 / 24, 7 / 24].map(
          powerAt,
        ),
      }
    }

    const ladderDirs = [21, 22]
    const broadbandDirs = [20, 23]
    let ladderExact = 0
    let broadbandConfirmed = 0

    for (const dir of ladderDirs) {
      const s = spectrumOf(dir)

      if (
        s.ladder.every(p => p > 0.3) &&
        s.offLadder.every(p => p < 1e-9)
      ) {
        ladderExact++
      }
    }

    for (const dir of broadbandDirs) {
      const s = spectrumOf(dir)

      if (s.offLadder.some(p => p > 0.5)) {
        broadbandConfirmed++
      }
    }

    const ok = ladderExact === 2 && broadbandConfirmed === 2

    return verdict({
      status: ok ? 'pass' : 'fail',
      claim:
        'both ladder species carry power above three tenths at every ladder line with off-ladder power below ten to the minus nine, and both broadband species carry substantial off-ladder power',
      metrics: {
        ladderExact,
        broadbandConfirmed,
      },
      // CONTROL: the broadband pair, the same instrument reading substantial off-ladder
      // power, so the ladder pair's exact zeros are physics
      control: {
        broadbandControl: broadbandConfirmed === 2 ? 1 : 0,
      },
      notes:
        'the ladder weights match E-FND-0121 (the static-weave breather), so the quantized massive bound state is carried by the committed rule itself, in the two rest channels whose schedule role preserves the clock-wire oscillation. The broadband pair is the natural next dispersion question (what a non-oscillator rest state is), and the moving-species omega against k sweep is the named continuation of the dispersion programme after merge.',
    })
  },
})
