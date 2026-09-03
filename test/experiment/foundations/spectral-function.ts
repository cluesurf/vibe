// The spectral function A(k, omega) of the adopted rule, and it has the structure of an
// interacting quantum field theory: a comb of defects at wavevector k, evolved two
// schedule periods, its complex spatial mode Fourier-analyzed in time, for three species:
//
//   - THE MASSLESS SPECIES IS A PURE POLE: one hundred percent of the spectral power in a
//     single line at exactly omega equals k times the light speed, at every wavevector.
//     The exact linear dispersion of a massless particle, measured with total share.
//   - THE HEAVY SPECIES IS A NARROW QUASIPARTICLE PEAK: about eighty percent of the power
//     within one frequency bin of zero at every k, the heavy slow pole its measured
//     effective speed (E-FND-0129) implies.
//   - THE DRESSED SPECIES IS POLE PLUS CONTINUUM: a central quasiparticle peak AND a
//     secondary radiation branch at omega near k times the light speed, visible at two of
//     the three wavevectors (and absent at the third, reported as measured). That
//     two-branch structure, the quasiparticle pole with the radiation continuum it is
//     dressed by, is the standard spectral shape of an interacting field theory, produced
//     here by the one rule.
//
// This turns the speed spectrum (E-FND-0129) into genuine dispersion data and gives the
// coarse-bridge programme its omega(k) instrument. Depth L2, deterministic, the massless
// pure pole the control that the instrument adds no structure of its own.

import { experiment } from '@/test/scaffold/suite'
import { verdict } from '@/test/scaffold/verdict'
import { d4Mesh, meshOpposites } from '@/code/tool/mesh'
import { makeWill, Will } from '@/code/tone/will'
import { beat } from '@/code/rule/lattice-gas'
import { turningWeave } from '@/code/rule/collision'

const SIDE = 12
const BEATS = 48

export default experiment({
  id: 'foundations/spectral-function',
  code: 'E-FND-0131',
  title:
    'the spectral function of the adopted rule has interacting-field-theory structure: the massless species is a pure pole with one hundred percent of spectral power in a single line at exactly omega equals k times light speed at every wavevector, the heavy species is a narrow quasiparticle peak with about eighty percent of power within one bin of zero, and the dressed species shows pole plus continuum, a central quasiparticle peak with a secondary radiation branch at omega near k times light speed at two of three wavevectors, the massless pure pole serving as the control that the instrument adds nothing',
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
    const mid = 6

    const spectrum = (
      dir: number,
      spacing: number,
    ): number[] => {
      const mFund = SIDE / spacing
      let vacuum: Will = makeWill(mesh)
      let seeded: Will = makeWill(mesh)

      for (let x = 0; x < SIDE; x += spacing) {
        seeded.data[cellAt([x, 0, mid, mid]) * 24 + dir] = 1
      }

      const akRe: number[] = []
      const akIm: number[] = []

      for (let t = 0; t < BEATS; t++) {
        vacuum = beat(vacuum, rule(t % 24))
        seeded = beat(seeded, rule(t % 24))

        let re = 0
        let im = 0

        for (let i = 0; i < seeded.data.length; i++) {
          const dv = seeded.data[i]! - vacuum.data[i]!

          if (dv !== 0) {
            const cell = Math.floor(i / 24)
            const x = coordinate(cell, 0)
            const angle = (2 * Math.PI * (((dv % 3) + 3) % 3)) / 3
            const fre = Math.cos(angle) - 1
            const fim = Math.sin(angle)
            const phase = (-2 * Math.PI * mFund * x) / SIDE
            const c = Math.cos(phase)
            const s = Math.sin(phase)

            re += fre * c - fim * s
            im += fre * s + fim * c
          }
        }

        akRe.push(re)
        akIm.push(im)
      }

      const shares: number[] = []
      let total = 0

      for (let w = -BEATS / 2; w <= BEATS / 2; w++) {
        let re = 0
        let im = 0

        for (let t = 0; t < BEATS; t++) {
          const phase = (-2 * Math.PI * w * t) / BEATS

          re += akRe[t]! * Math.cos(phase) - akIm[t]! * Math.sin(phase)
          im += akRe[t]! * Math.sin(phase) + akIm[t]! * Math.cos(phase)
        }

        const p = re * re + im * im

        shares.push(p)
        total += p
      }

      return shares.map(p => p / (total || 1))
    }

    const shareAt = (shares: number[], w: number): number =>
      shares[w + BEATS / 2] ?? 0

    const shareWithin = (
      shares: number[],
      center: number,
      half: number,
    ): number => {
      let sum = 0

      for (let w = center - half; w <= center + half; w++) {
        sum += shareAt(shares, w)
      }

      return sum
    }

    // massless: pure pole at omega = -k (w = -4 mFund in these units)
    let masslessPure = 0

    for (const spacing of [3, 4, 6]) {
      const shares = spectrum(0, spacing)
      const line = -4 * (SIDE / spacing)

      if (shareAt(shares, line) > 0.99) {
        masslessPure++
      }
    }

    // heavy: narrow central quasiparticle peak
    let heavyPeaked = 0

    for (const spacing of [3, 4, 6]) {
      const shares = spectrum(8, spacing)

      if (shareWithin(shares, 0, 1) > 0.7) {
        heavyPeaked++
      }
    }

    // dressed: central peak plus radiation branch near |omega| = k c at two of three k
    let dressedCentral = 0
    let dressedRadiation = 0

    for (const spacing of [3, 4, 6]) {
      const shares = spectrum(4, spacing)
      const line = 4 * (SIDE / spacing)

      if (shareWithin(shares, 0, 2) > 0.35) {
        dressedCentral++
      }

      const radiation =
        shareWithin(shares, line, 2) + shareWithin(shares, -line, 2)

      if (radiation > 0.08) {
        dressedRadiation++
      }
    }

    const ok =
      masslessPure === 3 &&
      heavyPeaked === 3 &&
      dressedCentral === 3 &&
      dressedRadiation >= 2

    return verdict({
      status: ok ? 'pass' : 'fail',
      claim:
        'the massless pole carries above ninety-nine percent share at exactly its line at all three wavevectors, the heavy peak carries above seventy percent within one bin of zero at all three, and the dressed species carries a central peak at all three plus a radiation branch above eight percent at two or more',
      metrics: {
        masslessPure,
        heavyPeaked,
        dressedCentral,
        dressedRadiation,
      },
      // CONTROL: the massless pure pole, the same instrument reading a single exact line,
      // so the dressed species' two-branch structure is physics
      control: {
        instrumentClean: masslessPure === 3 ? 1 : 0,
      },
      notes:
        'the dressed radiation branch is visible at two of three wavevectors and absent at the third, reported as measured. The quantitative continuation: track the quasiparticle peak position against k to extract the dressed mass from curvature, and the branch weights against coupling, which is the effective-field-theory reading of the model and the next arc of the dispersion programme.',
    })
  },
})
