// The spinor token's dispersion and effective mass on the husk (A STAND-IN, not the electron).
//
// The token of E-SPN-0053 (code/rule/spinor-token, schedule x, y, z, up, down, spin locked) is read in momentum
// space, with the symbol read off the walk itself on a husk torus rather than taken from its formula.
//
// What a light relativistic fermion needs from its band: a rest gap 2 m, a band E(k) = sqrt(m^2 + c^2 k^2) with
// one c in every direction, and m small against the lattice (a Compton length c / m of many docks). The fear
// coin fixes the first before any measurement: C has order 3 on the slots, so a period of n beats has rest
// operator C^n and a rest gap of 0 or 2 pi / 3, nothing else. The mass per period is quantized and, when it is
// not zero, it is a third of a turn: lattice-sized.
//
// Gates, fixed before the first run (the Hessian value 1/sqrt 3 was seen to four digits in the design probe,
// tmp/probe-token.ts, disclosed; the gate asks it to 1e-5):
// - G1 the symbol read off the walk on a 12^3 torus (one period applied to each of the 4 plane-wave components at
//   32 Weyl-sequence torus wave vectors) equals the formula scheduleSymbol to 1e-12 in every entry
// - G2 the rest phases are 0, 0, -2 pi / 3, -2 pi / 3 to 1e-12 (C^5 = C^2), so m = pi / 3 per period
// - G3 the spin-averaged particle band's curvature at k = 0 is 1/sqrt 3 per period to 1e-5 in all three axes
// - G4 THE LORENTZ TEST: with c^2 = m x curvature, the band matches sqrt(m^2 + c^2 k^2) - m to 5 percent at
//   k = m / (4c), m / (2c) and m / c along 7 directions (3 axes, 2 face and 2 body diagonals)
// - G5 THE ISOTROPY TEST: at |k| = m / (2c) the spin-averaged band varies by under 5 percent of its mean over the
//   13 directions (3 axes, 6 face and 4 body diagonals)
// PASS if all hold; PARTIAL if G1 to G3 hold and G4 or G5 fails; FAIL if any of G1 to G3 fails.
//
// Depth L2: the band of a constructed walk. The mass scale is the result that matters: it is set by the coin's
// order, not tuned.

import { experiment } from '@/test/scaffold/suite'
import { verdict } from '@/test/scaffold/verdict'
import { weyl, GOLDEN } from '@/code/tool/weyl'
import { complexEigenvalues } from '@/code/algebra/linear/complex-eigen'
import { beatWalker, dockIndex, makeWalker, scheduleSymbol, type Step } from '@/code/rule/spinor-token'

const TOKEN: readonly Step[] = ['x', 'y', 'z', 'up', 'down']
const SIDE = 12
const SAMPLES = 32
const STEP = 1e-3
const TOLERANCE = 0.05
// the E-FRC-0179 photon speed at its chosen coupling, per beat, for comparison only
const PHOTON_SPEED = 0.2023

function phases(k: readonly number[]): number[] {
  const u = scheduleSymbol(TOKEN, 'locked', k)
  const e = complexEigenvalues({ re: u.map(c => c[0]), im: u.map(c => c[1]), n: 4 })

  return e.re.map((r, i) => Math.atan2(e.im[i] ?? 0, r))
}

// the spin-averaged particle band, as an energy above the rest phase 0 (the band's phase magnitude)
function band(k: readonly number[]): number {
  const p = phases(k).sort((a, b) => Math.abs(a) - Math.abs(b))

  return Math.abs(((p[0] ?? 0) + (p[1] ?? 0)) / 2)
}

const DIRECTIONS: readonly (readonly number[])[] = [
  [1, 0, 0],
  [0, 1, 0],
  [0, 0, 1],
  [1, 1, 0],
  [1, -1, 0],
  [1, 0, 1],
  [1, 0, -1],
  [0, 1, 1],
  [0, 1, -1],
  [1, 1, 1],
  [1, 1, -1],
  [1, -1, 1],
  [-1, 1, 1],
]
const LORENTZ_DIRECTIONS = [0, 1, 2, 3, 7, 9, 12]

export default experiment({
  id: 'matter/token-dispersion',
  code: 'E-MTR-0013',
  title:
    'the spinor token\'s band on the husk, a STAND-IN: read off the walk, its rest gap is the coin\'s one quantized third of a turn per period, so its mass is lattice-sized, and its band is tested against sqrt(m^2 + c^2 k^2) with one c in thirteen directions',
  category: 'spin',
  substrates: ['3434'],
  depth: 'L2',
  paper: false,
  run() {
    // G1: the symbol read off the walk
    let readGap = 0

    for (let s = 0; s < SAMPLES; s++) {
      const n = [0, 1, 2].map(j => Math.floor(weyl(3 * s + j + 1, GOLDEN) * SIDE))
      const k = n.map(x => (2 * Math.PI * x) / SIDE)
      const formula = scheduleSymbol(TOKEN, 'locked', k)

      for (let col = 0; col < 4; col++) {
        const w = makeWalker(SIDE)

        for (let z = 0; z < SIDE; z++) {
          for (let y = 0; y < SIDE; y++) {
            for (let x = 0; x < SIDE; x++) {
              const phase = (k[0] ?? 0) * x + (k[1] ?? 0) * y + (k[2] ?? 0) * z

              w.re[4 * dockIndex(SIDE, x, y, z) + col] = Math.cos(phase)
              w.im[4 * dockIndex(SIDE, x, y, z) + col] = Math.sin(phase)
            }
          }
        }

        for (const step of TOKEN) {
          beatWalker({ walker: w, step, mode: 'locked' })
        }

        // U(k)_(row, col) = <e^(i k x) e_row | U | e^(i k x) e_col> / N
        for (let row = 0; row < 4; row++) {
          let re = 0
          let im = 0

          for (let z = 0; z < SIDE; z++) {
            for (let y = 0; y < SIDE; y++) {
              for (let x = 0; x < SIDE; x++) {
                const phase = (k[0] ?? 0) * x + (k[1] ?? 0) * y + (k[2] ?? 0) * z
                const d = dockIndex(SIDE, x, y, z)
                const vr = w.re[4 * d + row] ?? 0
                const vi = w.im[4 * d + row] ?? 0

                re += Math.cos(phase) * vr + Math.sin(phase) * vi
                im += Math.cos(phase) * vi - Math.sin(phase) * vr
              }
            }
          }

          const f = formula[row * 4 + col] ?? [0, 0]

          readGap = Math.max(readGap, Math.hypot(re / SIDE ** 3 - f[0], im / SIDE ** 3 - f[1]))
        }
      }
    }

    // G2: rest
    const rest = phases([0, 0, 0]).sort((a, b) => b - a)
    const third = (2 * Math.PI) / 3
    const restGap = Math.max(Math.abs(rest[0] ?? 1), Math.abs(rest[1] ?? 1), Math.abs((rest[2] ?? 0) + third), Math.abs((rest[3] ?? 0) + third))
    const m = Math.PI / 3

    // G3: curvature along the axes
    const curvature = [0, 1, 2].map(axis => {
      const k = [0, 0, 0]

      k[axis] = STEP

      return (2 * band(k)) / (STEP * STEP)
    })
    const curvatureGap = Math.max(...curvature.map(x => Math.abs(x - 1 / Math.sqrt(3))))
    const h = curvature.reduce((s, x) => s + x, 0) / 3
    const c = Math.sqrt(m * h)
    const compton = m / c

    // G4: Lorentz
    let lorentz = 0
    const lorentzRows: string[] = []

    for (const di of LORENTZ_DIRECTIONS) {
      const d = DIRECTIONS[di] ?? [1, 0, 0]
      const norm = Math.hypot(...d)

      for (const fraction of [0.25, 0.5, 1]) {
        const kk = fraction * compton
        const k = d.map(x => (x * kk) / norm)
        const actual = band(k)
        const dirac = Math.sqrt(m * m + c * c * kk * kk) - m
        const error = Math.abs(actual - dirac) / dirac

        lorentz = Math.max(lorentz, error)

        if (di === 0 || di === 9) {
          lorentzRows.push(`${d.join(',')} at ${fraction} m/c: ${actual.toFixed(5)} against ${dirac.toFixed(5)}`)
        }
      }
    }

    // G5: isotropy at |k| = m / (2c)
    const radius = compton / 2
    const ring = DIRECTIONS.map(d => {
      const norm = Math.hypot(...d)

      return band(d.map(x => (x * radius) / norm))
    })
    const ringMean = ring.reduce((s, x) => s + x, 0) / ring.length
    const anisotropy = (Math.max(...ring) - Math.min(...ring)) / ringMean
    // the spin splitting on the same ring, relative to the band
    const splitting = DIRECTIONS.map(d => {
      const norm = Math.hypot(...d)
      const p = phases(d.map(x => (x * radius) / norm)).sort((a, b) => Math.abs(a) - Math.abs(b))

      return Math.abs((p[0] ?? 0) - (p[1] ?? 0)) / ringMean
    })

    const g13 = readGap < 1e-12 && restGap < 1e-12 && curvatureGap < 1e-5
    const status = !g13 ? 'fail' : lorentz < TOLERANCE && anisotropy < TOLERANCE ? 'pass' : 'partial'
    const perBeat = TOKEN.length

    return verdict({
      status,
      claim: `read off the walk the symbol matches its formula (gap ${readGap.toExponential(1)}); the rest gap is 2 pi / 3 per period (gap ${restGap.toExponential(1)}), m = pi / 3 per period = ${(m / perBeat).toFixed(4)} per beat; the band's curvature is 1/sqrt 3 in all three axes (gap ${curvatureGap.toExponential(1)}), so c = ${(c / perBeat).toFixed(4)} husk docks per beat and the Compton length c / m is ${(1 / compton).toFixed(3)} docks; against sqrt(m^2 + c^2 k^2) the band is off by up to ${(100 * lorentz).toFixed(1)} percent to k = m / c, and at k = m / (2c) it varies by ${(100 * anisotropy).toFixed(2)} percent over 13 directions with a spin splitting up to ${(100 * Math.max(...splitting)).toFixed(2)} percent of the band`,
      metrics: {
        symbolReadGap: readGap,
        restPhaseGap: restGap,
        massPerPeriod: m,
        massPerBeat: m / perBeat,
        curvatureX: curvature[0] ?? 0,
        curvatureY: curvature[1] ?? 0,
        curvatureZ: curvature[2] ?? 0,
        curvatureGapFromInverseSqrt3: curvatureGap,
        tokenLightSpeedPerBeat: c / perBeat,
        comptonLengthDocks: 1 / compton,
        lorentzWorstRelativeError: lorentz,
        isotropyAtHalfCompton: anisotropy,
        spinSplittingMaxRelative: Math.max(...splitting),
        ...Object.fromEntries(ring.map((e, i) => [`bandAtHalfCompton_${(DIRECTIONS[i] ?? []).join('_').replace(/-/g, 'm')}`, Number(e.toFixed(6))])),
      },
      control: {
        photonSpeedPerBeatFrc0179: PHOTON_SPEED,
        tokenLightSpeedOverPhotonSpeed: c / perBeat / PHOTON_SPEED,
      },
      notes: `L2, STAND-IN. The mass is quantized by the coin: C has order 3, so a period's rest gap is 0 or 2 pi / 3 and a massive token has m = pi / 3 per period, a Compton length of ${(1 / compton).toFixed(3)} docks. A light fermion (Compton length many docks) cannot be made this way with a short period: the only freedom is the period length, and the husk-symmetric ones are the massless ones (E-SPN-0053). Lorentz rows: ${lorentzRows.join('; ')}. The token's own light speed (the c of its band, ${(c / perBeat).toFixed(4)} per beat) is not the photon's (E-FRC-0179, ${PHOTON_SPEED} per beat at its chosen coupling): for one relativity the photon coupling would have to be set to match, a free choice in the U(1) sector.`,
    })
  },
})
