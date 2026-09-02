// The Madelung gap: the rule has the density and the phase, and no law couples them. A quantum theory
// in Madelung form is a conserved density rho and a phase theta with the current J = rho grad(theta)/m,
// which is how Chronoflux reconstructs its quantum regime from a conserved current, and it is the most
// direct donor mechanism the program could borrow. Both halves are measured here.
//
// THE WALK OBEYS IT (the positive control). On a positive-band packet of the coined Dirac walk the norm
// is conserved to machine precision, and the chirality current tracks rho times the phase gradient with
// r squared above 0.9 and a fitted coefficient within ten percent of 1/tan(mass), at masses 0.9 and 0.7, the
// discrete effective-mass form of J = rho grad(theta)/m.
//
// THE RULE DOES NOT. On the growing charge-rule gas with two clock-offset domains (the setting of
// growth-shifts-the-clock), each domain's defect amplitude has CONSTANT magnitude beat after beat, so
// the coarse density rho = |A|^2 is static and the coarse current is exactly zero, while the phase
// differs across the domain wall, so rho times the phase difference is far from zero. The Madelung
// relation demands a current a phase gradient drives; the charge rule supplies none. The momentum rule
// is the mirror gap: its ballistic defect moves the coarse density, a genuine current, with no phase.
//
// So the measured gap is exact: phase gradients without currents. A sixth thing that made the clock
// phase drive transport would close it, and that is now a specification, not a hope. Depth L2: exact
// and fitted measurements on the committed rule and the walk model, with controls both ways.

import { experiment } from '@/test/scaffold/suite'
import { verdict } from '@/test/scaffold/verdict'
import {
  coinedWalkNorm,
  coinedWalkStep,
  makeCoinedWalk,
  massProfile,
  normalizeCoinedWalk,
} from '@/code/dynamics/coined-dirac-walk'
import { addPositiveBandPacket } from '@/code/dynamics/walk-band'
import { linearFit } from '@/code/measure/regression'
import { d4Mesh, meshOpposites, shellDistances } from '@/code/tool/mesh'
import { makeWill, Will } from '@/code/tone/will'
import {
  Collision,
  headOnRotate,
  pairCollision,
} from '@/code/rule/collision'
import { growingBeat } from '@/code/rule/lattice-gas'
import {
  regionClockAmplitude,
  relativeDegrees,
} from '@/code/measure/clock-amplitude'
import {
  ComplexPair,
  pairAbs2,
  pairSub,
} from '@/code/algebra/linear/complex-pair'

const WALK_SIZE = 240
const WALK_BEATS = 30
const EXACT = 1e-9

// the walk half: does the chirality current track rho times the phase gradient with coefficient 1/tan m
function walkMadelung(mass: number): {
  normDrift: number
  slope: number
  expected: number
  r2: number
} {
  const walk = makeCoinedWalk({ size: WALK_SIZE })

  addPositiveBandPacket({
    walk,
    center: WALK_SIZE >> 1,
    width: 14,
    momentum: 0.25,
    mass,
  })
  normalizeCoinedWalk(walk)

  const { cosMass, sinMass } = massProfile({
    size: WALK_SIZE,
    massAt: () => mass,
  })

  const normBefore = coinedWalkNorm(walk)

  for (let t = 0; t < WALK_BEATS; t++) {
    coinedWalkStep({ walk, cosMass, sinMass, boundary: 'periodic' })
  }

  const rho: number[] = []
  const theta: number[] = []
  const current: number[] = []

  for (let x = 0; x < WALK_SIZE; x++) {
    const right = walk.rightRe[x]! ** 2 + walk.rightIm[x]! ** 2
    const left = walk.leftRe[x]! ** 2 + walk.leftIm[x]! ** 2

    rho.push(right + left)
    current.push(right - left)
    theta.push(
      Math.atan2(
        walk.rightIm[x]! + walk.leftIm[x]!,
        walk.rightRe[x]! + walk.leftRe[x]!,
      ),
    )
  }

  const xs: number[] = []
  const ys: number[] = []

  for (let x = 1; x < WALK_SIZE - 1; x++) {
    if (rho[x]! < 1e-6) {
      continue
    }

    let gradient = theta[x + 1]! - theta[x - 1]!

    while (gradient > Math.PI) {
      gradient -= 2 * Math.PI
    }

    while (gradient < -Math.PI) {
      gradient += 2 * Math.PI
    }

    xs.push(rho[x]! * (gradient / 2))
    ys.push(current[x]!)
  }

  const fit = linearFit({ xs, ys })

  return {
    normDrift: Math.abs(coinedWalkNorm(walk) - normBefore),
    slope: fit.slope,
    expected: 1 / Math.tan(mass),
    r2: fit.r2,
  }
}

// the rule half: two clock-offset domains, a defect in each, the coarse density static while the phase
// differs across the wall
function ruleMadelung(rule: Collision): {
  densityDrift: number
  relativePhase: number
  phaseDrive: number
} {
  const side = 7
  const beats = 16
  const mesh = d4Mesh({ side })
  const distance = shellDistances(mesh, 0)
  const late = new Set<number>()
  const interior: number[] = []

  for (let cell = 0; cell < mesh.cellCount; cell++) {
    const d = distance[cell] ?? 99

    if (d <= 2) {
      late.add(cell)
    } else if (d >= 4) {
      interior.push(cell)
    }
  }

  const seedInterior = interior.reduce((best, cell) =>
    (distance[cell] ?? 0) > (distance[best] ?? 0) ? cell : best,
  )

  const birth = 1

  function evolve(seeds: { cell: number; beat: number }[]): {
    a: ComplexPair
    b: ComplexPair
  }[] {
    let will: Will = makeWill(mesh)

    const out: { a: ComplexPair; b: ComplexPair }[] = []

    for (let t = 0; t < beats; t++) {
      for (const seed of seeds) {
        if (seed.beat === t) {
          will.data[seed.cell * mesh.degree] = 1
        }
      }

      will = growingBeat(will, rule, cell =>
        late.has(cell) ? t >= birth : true,
      )

      out.push({
        a: regionClockAmplitude(will, interior),
        b: regionClockAmplitude(will, [...late]),
      })
    }

    return out
  }

  const clean = evolve([])
  const seeded = evolve([
    { cell: seedInterior, beat: 6 },
    { cell: 0, beat: 7 },
  ])

  let densityDrift = 0
  let relativePhase = 0
  let phaseDrive = 0
  let previousA = -1
  let previousB = -1

  for (let t = 9; t < 12; t++) {
    const defectA = pairSub(seeded[t]!.a, clean[t]!.a)
    const defectB = pairSub(seeded[t]!.b, clean[t]!.b)
    const rhoA = pairAbs2(defectA)
    const rhoB = pairAbs2(defectB)

    if (previousA >= 0) {
      densityDrift = Math.max(
        densityDrift,
        Math.abs(rhoA - previousA),
        Math.abs(rhoB - previousB),
      )
    }

    previousA = rhoA
    previousB = rhoB

    if (rhoA > EXACT && rhoB > EXACT) {
      const relative = relativeDegrees(defectA, defectB)
      const folded = Math.min(relative, 360 - relative)

      relativePhase = Math.max(relativePhase, folded)
      phaseDrive = Math.max(
        phaseDrive,
        Math.sqrt(rhoA * rhoB) * Math.abs((folded * Math.PI) / 180),
      )
    }
  }

  return { densityDrift, relativePhase, phaseDrive }
}

export default experiment({
  id: 'foundations/madelung-gap',
  code: 'E-FND-0090',
  title:
    'the Madelung gap of the rule, measured: the coined walk obeys the quantum current-phase law (chirality current tracks rho times the phase gradient with coefficient 1/tan mass, r squared above 0.9, norm exact), while the growing charge-rule gas holds a nonzero phase difference across its clock-domain wall with the coarse density exactly static, phase gradients with zero current, so the coupling a Madelung (Chronoflux-style) quantum needs is the exact thing the five base things do not supply',
  category: 'foundations',
  substrates: ['3434'],
  depth: 'L2',
  paper: true,
  run() {
    const walkA = walkMadelung(0.9)
    const walkB = walkMadelung(0.7)
    const opposite = meshOpposites(d4Mesh({ side: 7 }))
    const chargeGas = ruleMadelung(pairCollision({ opposite }))
    const momentumGas = ruleMadelung(headOnRotate({ opposite }))

    const walkObeys =
      walkA.normDrift < EXACT &&
      walkB.normDrift < EXACT &&
      walkA.r2 > 0.9 &&
      walkB.r2 > 0.9 &&
      Math.abs(walkA.slope - walkA.expected) / walkA.expected < 0.1 &&
      Math.abs(walkB.slope - walkB.expected) / walkB.expected < 0.1
    const ruleDensityStatic = chargeGas.densityDrift < EXACT
    const rulePhaseGradient = chargeGas.relativePhase >= 60
    const gapExists = chargeGas.phaseDrive > 1
    // the momentum rule is the mirror gap: its ballistic defect MOVES the coarse density (a genuine
    // current) while carrying no phase at all
    const momentumMirror =
      momentumGas.relativePhase === 0 && momentumGas.densityDrift > 1

    const ok =
      walkObeys &&
      ruleDensityStatic &&
      rulePhaseGradient &&
      gapExists &&
      momentumMirror

    return verdict({
      status: ok ? 'pass' : 'fail',
      claim:
        'on positive-band packets at masses 0.9 and 0.7 the coined walk conserves its norm to machine precision and its chirality current fits rho times the phase gradient with r squared above 0.9 and a coefficient within ten percent of 1/tan mass, while on the growing charge-rule gas the two domain defects hold intensities that are exactly constant from beat to beat (zero coarse current) with a relative phase of at least 60 degrees across the wall, so the Madelung drive rho grad theta is far from zero where the current is exactly zero, and under the momentum rule the mirror gap shows: the ballistic defect moves the coarse density (drift far above zero) while carrying no phase whatever, so one committed rule has phases without currents, the other currents without phases, and the current-phase coupling that makes a conserved density quantum is measurably absent from both',
      metrics: {
        walkSlopeMass09: Number(walkA.slope.toFixed(4)),
        walkExpectedMass09: Number(walkA.expected.toFixed(4)),
        walkR2Mass09: Number(walkA.r2.toFixed(4)),
        walkSlopeMass07: Number(walkB.slope.toFixed(4)),
        walkExpectedMass07: Number(walkB.expected.toFixed(4)),
        walkR2Mass07: Number(walkB.r2.toFixed(4)),
        ruleDensityDrift: Number(chargeGas.densityDrift.toExponential(2)),
        ruleRelativePhase: chargeGas.relativePhase,
        rulePhaseDrive: Number(chargeGas.phaseDrive.toFixed(4)),
      },
      // CONTROL: the walk shows the relation holds where a quantum exists, the momentum rule shows the
      // mirror gap, currents without phases
      control: {
        walkNormDrift: Number(
          Math.max(walkA.normDrift, walkB.normDrift).toExponential(2),
        ),
        momentumRelativePhase: momentumGas.relativePhase,
        momentumDensityDrift: Number(
          momentumGas.densityDrift.toExponential(2),
        ),
      },
      notes:
        'Roadmap base-model 0015, the Chronoflux donor route (Herbert reconstructs the quantum from a conserved current in Madelung form, see the 2026-09-01 corpus changelog). The rule has both ingredients separately, a conserved density with real hydrodynamics (E-FLD-0014) and a dynamical phase (the vacuum clock, E-FND-0084 to 0088), and this experiment measures that nothing couples them: the clock phase does not drive transport. Closing the gap is now a specification for a sixth thing: a rule term making the tone current respond to the clock-phase gradient, which would be tested by exactly this experiment coming out the other way.',
    })
  },
})
