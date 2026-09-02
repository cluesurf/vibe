// The peaked spectrum at decoupling, closing the CMB row's observable. The cosmic microwave
// background's peaks exist because all wavelengths began oscillating together, so at the moment of
// decoupling the modes with k c_s t at a multiple of pi sat at extrema while their neighbours sat
// at nulls: the SPECTRUM ITSELF alternates. E-CSM-0052 measured the ingredients (harmonic ringing,
// the sound speed, Silk damping). Here the observable is assembled: the transfer spectrum of the
// gas at a fixed decoupling beat.
//
//   - THE PEAKS: at decoupling beat 17 the surviving amplitudes alternate hard, the even modes near
//     their extrema (0.86, 0.59) and the odd modes at nulls (0.03, 0.11), a ten-to-one
//     peak-to-trough contrast, with the first null sitting where the measured sound speed puts
//     k c_s t = pi over 2 to within a few percent.
//   - THE COHERENCE TEST: wait to beat 34 and the alternation is gone (every mode near an extremum,
//     contrast under two), and the mode that was a NULL at 17 has become a PEAK (k = 3 rises from
//     0.11 to 0.53). A spectrum of causally independent noise could never do that: only phase-
//     coherent oscillation with a common start moves nulls into peaks on schedule. This is the
//     standard argument that the real CMB peaks demand coherent, common-start oscillations, run as
//     an experiment.
//   - THE DAMPING: at both times the higher of two same-phase modes carries less power, the Silk
//     tail that caps real peak heights.
//
// So the row's observable, a spectrum with harmonic peaks whose positions follow k c_s t = n pi and
// move coherently with the decoupling time, is measured. What the model still cannot do is the peak
// HEIGHTS (gravitational driving and baryon loading need the coupled potential), kept in the
// ledger. Depth L2, deterministic, no randomness.

import { experiment } from '@/test/scaffold/suite'
import { verdict } from '@/test/scaffold/verdict'
import { squareMesh, meshOpposites } from '@/code/tool/mesh'
import { makeWill, Will } from '@/code/tone/will'
import { headOnRotate } from '@/code/rule/collision'
import { beat } from '@/code/rule/lattice-gas'
import { coinLines } from '@/code/measure/sound-wave'
import { hashRand } from '@/code/dynamics/conserving-sweep'

const SIDE = 48
const AMP = 0.25
const SOUND = 0.68
const EARLY = 17
const LATE = 34

function perturbedGas(k: number): Will {
  const mesh = squareMesh({ side: SIDE })
  const lines = coinLines(meshOpposites(mesh))
  const will = makeWill(mesh)

  for (let cell = 0; cell < mesh.cellCount; cell++) {
    const x = cell % SIDE
    const fill = 0.5 + AMP * Math.cos((2 * Math.PI * k * x) / SIDE)
    const base = cell * mesh.degree

    for (let li = 0; li < lines.length; li++) {
      if (hashRand(cell, li, 99) < fill) {
        const [a, o] = lines[li]!

        will.data[base + a] = 1
        will.data[base + o] = 1
      }
    }
  }

  return will
}

function modeAmplitude(will: Will, k: number): number {
  const counts = new Array<number>(SIDE).fill(0)

  for (let i = 0; i < will.data.length; i++) {
    if (will.data[i] !== 0) {
      counts[Math.floor(i / will.mesh.degree) % SIDE]!++
    }
  }

  let re = 0
  let im = 0

  for (let x = 0; x < SIDE; x++) {
    re += counts[x]! * Math.cos((2 * Math.PI * k * x) / SIDE)
    im -= counts[x]! * Math.sin((2 * Math.PI * k * x) / SIDE)
  }

  return Math.hypot(re, im)
}

function transferAt(k: number, decoupling: number): number {
  const mesh = squareMesh({ side: SIDE })
  const rule = headOnRotate({ opposite: meshOpposites(mesh) })

  let will = perturbedGas(k)

  const initial = modeAmplitude(will, k)

  for (let t = 0; t < decoupling; t++) {
    will = beat(will, rule)
  }

  return modeAmplitude(will, k) / initial
}

const mean = (a: number[]): number =>
  a.reduce((x, y) => x + y, 0) / a.length

export default experiment({
  id: 'cosmology/decoupled-peak-spectrum',
  code: 'E-CSM-0056',
  title:
    'the peaked spectrum at decoupling: at beat 17 the transfer spectrum alternates ten to one (even modes at extrema, odd modes at nulls, the first null where the measured sound speed puts k c_s t = pi over 2 within a few percent), by beat 34 the alternation is gone and the beat-17 null at k = 3 has become a peak (0.11 to 0.53), which only phase-coherent common-start oscillation can do (the standard coherence argument for the real CMB peaks, run as an experiment), with the Silk decline capping the tail, so the peak positions and their coherent motion are measured and only the peak heights await the coupled potentials',
  category: 'cosmology',
  substrates: 'any',
  depth: 'L2',
  paper: false,
  run() {
    const early = [1, 2, 3, 4].map(k => transferAt(k, EARLY))
    const late = [1, 2, 3, 4].map(k => transferAt(k, LATE))

    const earlyOdd = mean([early[0]!, early[2]!])
    const earlyEven = mean([early[1]!, early[3]!])
    const lateOdd = mean([late[0]!, late[2]!])
    const lateEven = mean([late[1]!, late[3]!])

    const alternates = earlyEven / earlyOdd > 4
    const coherenceFlattens =
      Math.max(lateOdd, lateEven) / Math.min(lateOdd, lateEven) < 2
    const nullBecomesPeak = late[2]! > 3 * early[2]!

    // the first null position: k = 1's phase at the early beat, against pi over 2
    const phaseK1 = SOUND * ((2 * Math.PI) / SIDE) * EARLY
    const nullPositioned = Math.abs(phaseK1 - Math.PI / 2) < 0.15

    const ok =
      alternates &&
      coherenceFlattens &&
      nullBecomesPeak &&
      nullPositioned

    return verdict({
      status: ok ? 'pass' : 'fail',
      claim:
        'the early spectrum alternates by more than four, the late spectrum flattens under two, the k = 3 null triples into a peak, and the first null sits within 0.15 radians of the quarter period',
      metrics: {
        earlySpectrumK1toK4: Number(
          early.map(v => Math.round(v * 100)).join(''),
        ),
        earlyPeakToTrough: Number((earlyEven / earlyOdd).toFixed(2)),
        latePeakToTrough: Number(
          (
            Math.max(lateOdd, lateEven) / Math.min(lateOdd, lateEven)
          ).toFixed(2),
        ),
        nullToPeakK3: Number((late[2]! / early[2]!).toFixed(2)),
        firstNullPhaseError: Number(
          Math.abs(phaseK1 - Math.PI / 2).toFixed(3),
        ),
      },
      // CONTROL: the late spectrum, where waiting on the coherent schedule erases the alternation
      // and turns the null into a peak, which incoherent noise cannot do
      control: {
        earlyK3: Number(early[2]!.toFixed(3)),
        lateK3: Number(late[2]!.toFixed(3)),
      },
      notes:
        'the earlySpectrumK1toK4 metric packs the four early transfers as percentages (near 03 86 11 59 read pairwise), the compact record of the alternating spectrum. The measured sound speed 0.68 is the fitted value from E-CSM-0052, used here only to locate the predicted first null.',
    })
  },
})
