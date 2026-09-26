// An audit of E-FRC-0169's isotropy reading. E-FRC-0169 read the thermal husk light at |k| = pi / 2 on two
// cubic orbits, (3,0,0) and (2,2,1) with their axis permutations, and found the two orbit means of the two light
// branches equal to 0.005 percent. The exact linear symbol (E-MTH-0008) puts them 0.18 percent apart, and a
// thermal renormalization kappa -> kappa <cos B> rescales every direction alike, so it cannot close the gap.
//
// What is audited, gates fixed before the run:
// 1 the linear prediction: the husk symbol's two light eigenvalues on each orbit, and the orbit-mean frequency
//   ratio omega_B / omega_A - 1 at kappa <cos B>
// 2 the noise: the same thermal run as E-FRC-0169 (side 12, N 8192, K 80, beta 3, 300 settle and 2,000 read
//   beats, lag 3) from the original start (hash 5.3) and three more deterministic starts (hashes 6.1, 7.9,
//   9.7). The three modes of one orbit are related by an exact symmetry of the box, so their spread is the
//   measurement's own error. Gate: the audit is conclusive if the standard error of the orbit difference,
//   sd x sqrt(2/3) averaged over starts, is reported beside the difference
// 3 the estimator: the exactly linear leapfrog (code/measure/photon-symbol) at kappa <cos B> from the same
//   start, read by the same lagged estimator, must reproduce the linear prediction per mode to 1e-3; the
//   thermal minus linear difference is then the dynamics', not the estimator's
// The corrected number is the mean orbit ratio over the four starts with its standard error.
//
// Depth L2: a re-measurement against the exact symbol, with a noise floor. Deterministic: the starts are hashed,
// no seed.

import { experiment } from '@/test/scaffold/suite'
import { verdict } from '@/test/scaffold/verdict'
import { addHashedCurl, emptyPhotonState, magneticSum, makePhotonRule, photonBeatInPlace, photonLatticeD4, type PhotonRule, type PhotonState } from '@/code/rule/photon-links'
import { accumulate, accumulateCross, leapfrogOmega, makeCorrelator, modeFrequencies, modeReader, type ModeVector } from '@/code/measure/photon-modes'
import { makeHusk, projectLinks, type Husk } from '@/code/measure/photon-husk'
import { centered, curlSymbol, eigenvalues, huskSymbol, makeLinearLeapfrog, plaquetteShapes } from '@/code/measure/photon-symbol'

const SIDE = 12
const N = 8192
const K = 80
const BETA = 3
const LAG = 3
const SETTLE = 300
const BEATS = 2000
const HASHES = [5.3, 6.1, 7.9, 9.7]
const ORBIT_A = [
  [3, 0, 0],
  [0, 3, 0],
  [0, 0, 3],
]
const ORBIT_B = [
  [2, 2, 1],
  [1, 2, 2],
  [2, 1, 2],
]
const MODES = [...ORBIT_A, ...ORBIT_B]
const KAPPA = (2 * Math.PI * K) / N

const mean = (xs: readonly number[]): number => xs.reduce((a, b) => a + b, 0) / xs.length
const sd = (xs: readonly number[]): number => Math.sqrt(xs.reduce((a, x) => a + (x - mean(xs)) ** 2, 0) / (xs.length - 1))

function thermalStart(rule: PhotonRule, hash: number): PhotonState {
  const s = emptyPhotonState(rule)
  const target = (rule.k * rule.n) / (2 * Math.PI * BETA)

  addHashedCurl(rule, s, Math.max(1, Math.round(Math.sqrt((3 * target) / 4))), hash)

  return s
}

// read the two lowest frequencies of each mode of the husk projection of the flux, over BEATS beats after SETTLE
function read(husk: Husk, step: (t: number) => ArrayLike<number>, onBeat?: (t: number) => void): number[][] {
  const f = husk.lattice.firsts.length
  const probes = MODES.map(n => ({ reader: modeReader(husk.lattice, n), c0: makeCorrelator(f), c1: makeCorrelator(f), history: [] as ModeVector[] }))

  for (let t = 0; t < SETTLE + BEATS; t++) {
    const flux = step(t)

    onBeat?.(t)

    if (t < SETTLE) {
      continue
    }

    const field = projectLinks(husk, flux)

    for (const p of probes) {
      const v = p.reader.read(field)

      accumulate(p.c0, v)

      const past = p.history[p.history.length - LAG]

      if (p.history.length >= LAG && past) {
        accumulateCross(p.c1, v, past)
      }

      p.history.push(v)

      if (p.history.length > LAG) {
        p.history.shift()
      }
    }
  }

  return probes.map(p => modeFrequencies({ c0: p.c0, c1: p.c1, lag: LAG, tolerance: 1e-9 }).omega.slice(0, 2))
}

export default experiment({
  id: 'method/husk-light-isotropy-audit',
  code: 'E-MTH-0014',
  title:
    'an audit of E-FRC-0169\'s 0.005 percent husk light isotropy: the exact linear symbol puts the (3,0,0) and (2,2,1) orbits apart by its own amount, the lagged estimator on the exactly linear leapfrog reproduces it, and four deterministic thermal starts give the corrected thermal ratio with a noise floor from the symmetry-equivalent modes',
  category: 'method',
  substrates: ['3434'],
  depth: 'L2',
  paper: false,
  run() {
    const bulk = photonLatticeD4({ side: SIDE })
    const husk = makeHusk(bulk)
    const shapes = plaquetteShapes(bulk)
    const rule = makePhotonRule({ lattice: bulk, n: N, k: K, capacity: 0, hop: false })
    const lambdas = MODES.map(m => {
      const k = m.map(x => (2 * Math.PI * x) / SIDE)
      const h = eigenvalues(huskSymbol(husk, curlSymbol(bulk, shapes, [k[0]!, k[1]!, k[2]!, 0])).hermitian)

      return [h[1]!, h[2]!]
    })
    const orbitRatio = (omegas: readonly number[][]): number => mean(omegas.slice(3).map(mean)) / mean(omegas.slice(0, 3).map(mean)) - 1
    const withinSd = (omegas: readonly number[][]): number => {
      const a = omegas.slice(0, 3).map(mean)
      const b = omegas.slice(3).map(mean)

      return Math.sqrt((sd(a) ** 2 / mean(a) ** 2 + sd(b) ** 2 / mean(b) ** 2) / 2)
    }
    const runs: { hash: number; meanCos: number; ratio: number; noise: number; linearRatio: number; predictedRatio: number; linearGap: number; omegas: number[][] }[] = []

    for (const hash of HASHES) {
      // thermal
      const state = thermalStart(rule, hash)
      const cosines: number[] = []
      const thermal = read(
        husk,
        t => {
          photonBeatInPlace(rule, state, t)

          return state.flux
        },
        t => {
          if (t >= SETTLE && (t - SETTLE) % 10 === 0) {
            cosines.push(magneticSum(rule, state.angle).meanCos)
          }
        },
      )
      const meanCos = mean(cosines)
      const kappa = KAPPA * meanCos
      const predicted = lambdas.map(pair => pair.map(l => leapfrogOmega(kappa, l)))

      // the exactly linear leapfrog from the same start at the renormalized coupling
      const start = thermalStart(rule, hash)
      const angle = Float64Array.from(start.angle, a => centered(a, N))
      const flux = Float64Array.from(start.flux)
      const linear = makeLinearLeapfrog(bulk, kappa)
      const linearOmegas = read(husk, () => {
        linear.beat(angle, flux)

        return flux
      })
      const linearGap = Math.max(...linearOmegas.flatMap((pair, i) => pair.map((w, j) => Math.abs(w / predicted[i]![j]! - 1))))

      runs.push({ hash, meanCos, ratio: orbitRatio(thermal), noise: withinSd(thermal) * Math.sqrt(2 / 3), linearRatio: orbitRatio(linearOmegas), predictedRatio: orbitRatio(predicted), linearGap, omegas: thermal })
    }

    const corrected = mean(runs.map(r => r.ratio))
    const correctedError = sd(runs.map(r => r.ratio)) / Math.sqrt(runs.length)
    const noiseFloor = mean(runs.map(r => r.noise))
    const predictedRatio = mean(runs.map(r => r.predictedRatio))
    const estimatorExact = runs.every(r => r.linearGap < 1e-3)
    const original = runs[0]!

    const metrics: Record<string, number> = {
      predictedOrbitRatio: predictedRatio,
      correctedThermalRatio: corrected,
      correctedStandardError: correctedError,
      withinOrbitNoiseFloor: noiseFloor,
      originalStartRatio: original.ratio,
      axisLambda: lambdas[0]![0]!,
      axisLambdaMinusSixMinusTwoRootFive: lambdas[0]![0]! - (6 - 2 * Math.sqrt(5)),
    }

    runs.forEach(r => {
      metrics[`ratioHash${r.hash}`] = r.ratio
      metrics[`noiseHash${r.hash}`] = r.noise
      metrics[`linearRatioHash${r.hash}`] = r.linearRatio
      metrics[`linearGapHash${r.hash}`] = r.linearGap
      metrics[`meanCosHash${r.hash}`] = r.meanCos
    })

    return verdict({
      status: estimatorExact ? 'pass' : 'fail',
      claim: `E-FRC-0169's husk light isotropy re-read: the exact linear symbol puts the (2,2,1) orbit ${(predictedRatio * 100).toFixed(3)} percent above (3,0,0) at the thermal coupling, the lagged estimator on the exactly linear leapfrog reproduces every mode to ${estimatorExact ? 'under 1e-3' : 'more than 1e-3'}, and over four deterministic thermal starts the orbit ratio is ${(corrected * 100).toFixed(3)} +- ${(correctedError * 100).toFixed(3)} percent (the original start ${(original.ratio * 100).toFixed(3)}), against a noise floor of ${(noiseFloor * 100).toFixed(3)} percent from the symmetry-equivalent modes`,
      metrics,
      control: {
        linearRatioOriginal: original.linearRatio,
        estimatorExact: estimatorExact ? 1 : 0,
      },
      notes:
        'L2. The noise floor is the spread of the three axis-permuted modes of each orbit, which an exact symmetry of the box and the start ensemble makes equal in expectation, times sqrt(2/3) for a difference of two three-mode means. The starts differ only in the hash of addHashedCurl, as E-FRC-0169\'s did, so the whole audit is deterministic. The axis light eigenvalue at |k| = pi / 2 is reported against 6 - 2 sqrt 5, an observation from the symbol with no proof here.',
    })
  },
})
