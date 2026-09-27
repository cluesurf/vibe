// One omega? The Hurwitz cube root of unity acts on the D4 bulk by left multiplication, L_omega, a triality
// (E-MTH-0009), and color's center acts on a knot as omega^q. This asks, by measurement, whether the two can
// be the same omega, and what identifying them would force.
//
// What L_omega is, exactly. Left multiplication by a unit u of order 3 commutes with every right
// multiplication, so R^4 = H becomes C^2 with u acting as the SCALAR e^(2 pi i / 3): L_u is the center of the
// bulk's U(2), the geometric twin of color's center on C^3. It has no fixed vector, so it selects no color
// plane, and it is not one of E-FRC-0106's 32 color trialities.
//
// Pre-registered measurements (gates):
// A orbits: for each of the 8 order-3 Hurwitz units u, L_u and R_u permute the 24 D4 root directions in 8
//   orbits of 3, and every orbit sums to zero (r + u r + u^2 r = (1 + u + u^2) r = 0): an A2 triangle, the
//   geometric knot. The four left maps (u up to inverse) together realize each of the 32 zero-sum triangles
//   exactly once, and so do the four right maps
// B factorization: each L_u keeps exactly 4 of the 16 color planes (the complex lines through the roots),
//   and on each it is sigma_P rho_P, sigma_P the color triality of E-FRC-0106 that fixes P (cycling the three
//   triplet copies, the generation cycle) and rho_P an order-3 element of W(F4) fixing the orthogonal plane
//   and rotating P by a third of a turn (the cyclic permutation of the three colors); sigma_P and rho_P commute
// C the charge lock: every L_u-invariant dock state (3^8 = 6,561 of them) has charge = 0 mod 3 and zero
//   momentum, so "L_u acts as omega^q" is consistent on every invariant state and forces its center phase
//   to be 1, while every charge-q sector holds L_u eigenvectors of eigenvalue omega^q on each free orbit
// D the knit survey: for the committed turning weave, the color turn weave, the combined knit, the quaternion
//   knit (E-RLT-0051) and the triality weave (the control, which must keep its own color triality), every
//   order-3 element of W(F4), both tone maps (identity, charge conjugation) and every time shift: the exact
//   glides, classified. The prediction is written before the run: no knit keeps any fixed-point-free
//   order-3 element, so no existing knit carries the same-omega rule
// E the quaternion knit's Q8 is RIGHT multiplication (R_Q8), so every L_u commutes with it; reported: whether
//   the knit itself commutes with any L_u
// Reported: whether the knot seed of code/compute/knit-reference (directions 0, 8, 16) is an L_u or R_u orbit.
// Reported, added after the first run (2026-09-26, not gated, disclosed): the two sevens through the E-MTH-0010
// null. CHSH^2 = 4 (1 + sin^2 phi) = 7 for the swap-phase pair at phi = 2 pi / 3, and the fear share 2/7 of
// E-FRC-0122's round 2 is (N - 1) / (2 N) at N = sum |W| = 7/3. A shared small integer is a common origin only
// if the chance of it recurring is under 0.01; among the budget's integers 1 to 12 that chance is 1/12
// (code/measure/coincidence-null). Both 7s are norms in Z[omega] (7 = |2 - omega|^2 = |3 + omega|^2), but so
// are 6 of the integers 1 to 12 (1, 3, 4, 7, 9, 12), so that link carries no weight either. PREDICTION: rate
// 0.083, inadmissible, and the swap pair's own N is 3/2, not 7/3 (E-MTH-0010), so the 7s come from two states.
//
// Depth L2: exact group computation, then the rules themselves.

import { experiment } from '@/test/scaffold/suite'
import { verdict } from '@/test/scaffold/verdict'
import { rootsD4 } from '@/code/algebra/group/root-system'
import { zeroSumTriangles } from '@/code/measure/collision-anatomy'
import { type Collision, turningWeave } from '@/code/rule/collision'
import { colorTurnWeave } from '@/code/rule/color-turn-weave'
import { combinedCollision, COMBINED_DEFAULT } from '@/code/rule/combined-knit'
import { quaternionKnit, Q8_GENERATORS } from '@/code/rule/quaternion-knit'
import { colorTriality, trialityWeave, trialityWeaveLayout, TRIALITY_WEAVE_PERIOD } from '@/code/rule/triality-weave'
import {
  doubledClosure,
  doubledReflection,
  f4Roots,
  hurwitzUnits,
  leftMultiplication,
  matrixKey,
  multiplyDoubled,
  quaternionOrder,
  rightMultiplication,
  type DoubledMatrix,
} from '@/code/algebra/group/hurwitz-f4'
import { sharedIntegerRate } from '@/code/measure/coincidence-null'

const ROOTS = rootsD4()
const OPPOSITE = ROOTS.map(r => ROOTS.findIndex(o => o.every((x, k) => x === -(r[k] ?? 0))))
const rootIndex = new Map(ROOTS.map((r, i) => [r.join(','), i]))
const GOLDEN = (Math.sqrt(5) - 1) / 2
const STATES = 60

// a doubled matrix as a permutation of the root directions: (2 g) r / 2
function permutationOf(m: DoubledMatrix): number[] {
  return ROOTS.map(r => {
    const image = [0, 1, 2, 3].map(i => [0, 1, 2, 3].reduce((s, j) => s + m[i * 4 + j]! * r[j]!, 0) / 2)

    return rootIndex.get(image.join(',')) ?? -1
  })
}

const applyMatrix = (m: DoubledMatrix, v: readonly number[]): number[] => [0, 1, 2, 3].map(i => [0, 1, 2, 3].reduce((s, j) => s + m[i * 4 + j]! * v[j]!, 0) / 2)

function orbitsOf(p: readonly number[]): number[][] {
  const seen = new Set<number>()
  const out: number[][] = []

  p.forEach((_, d) => {
    if (seen.has(d)) {
      return
    }

    const orbit = [d]
    let e = p[d]!

    while (e !== d) {
      orbit.push(e)
      e = p[e]!
    }

    orbit.forEach(x => seen.add(x))
    out.push(orbit)
  })

  return out
}

const setKey = (xs: readonly number[]): string => [...xs].sort((a, b) => a - b).join(',')

function order(m: DoubledMatrix): number {
  let p = m
  let n = 1

  while (matrixKey(p) !== matrixKey(Int32Array.from({ length: 16 }, (_, i) => (i % 5 === 0 ? 2 : 0))) && n < 50) {
    p = multiplyDoubled(p, m)
    n++
  }

  return n
}

// a dock state from a golden hash
function stateOf(n: number): Int8Array {
  return Int8Array.from({ length: 24 }, (_, i) => {
    const u = (((n + 1) * 24 + i + 1) * GOLDEN * 3.7) % 1

    return u < 0.3 ? -1 : u < 0.6 ? 0 : 1
  })
}

// mismatches of C_(t+s)(g x) against g C_t(x), g the direction permutation p with tone map sign
function glideMismatches(rule: (t: number) => Collision, period: number, p: readonly number[], sign: number, shift: number, budget: number): number {
  let bad = 0

  for (let t = 0; t < period && bad < budget; t++) {
    for (let n = 0; n < STATES && bad < budget; n++) {
      const x = stateOf(n + 97 * t)
      const gx = new Int8Array(24)

      x.forEach((v, d) => (gx[p[d]!] = sign * v))

      const left = Int8Array.from(gx)

      rule(t + shift)(left, 0, 24)

      const cx = Int8Array.from(x)

      rule(t)(cx, 0, 24)

      const right = new Int8Array(24)

      cx.forEach((v, d) => (right[p[d]!] = sign * v))
      bad += left.every((v, d) => v === right[d]) ? 0 : 1
    }
  }

  return bad
}

export default experiment({
  id: 'method/one-omega',
  code: 'E-MTH-0012',
  title:
    'one omega, measured: left multiplication by a Hurwitz cube root of unity is the center of the bulk\'s U(2), its orbits on the 24 root directions are exactly the 32 zero-sum triangles (knot = momentum closure), on each of its 4 kept color planes it is the generation cycle times the color cycle, and its invariant states all have charge 0 mod 3 (the lock); but no knit in the repo keeps any fixed-point-free order-3 element, so the same-omega rule is a constraint no current knit meets',
  category: 'method',
  substrates: ['3434'],
  depth: 'L2',
  paper: true,
  run() {
    const f4 = doubledClosure(f4Roots().map(doubledReflection))
    const orderThree = [...f4.values()].filter(m => order(m) === 3)
    const units = hurwitzUnits().filter(u => quaternionOrder(u) === 3)
    const triangles = zeroSumTriangles({ directions: ROOTS }).map(t => setKey(t))
    const triangleSet = new Set(triangles)

    // A. orbits
    let orbitsAreTriangles = true
    const leftTriangles = new Map<string, number>()
    const rightTriangles = new Map<string, number>()

    for (const u of units) {
      for (const [m, tally] of [
        [leftMultiplication(u), leftTriangles],
        [rightMultiplication(u), rightTriangles],
      ] as const) {
        const orbits = orbitsOf(permutationOf(m))

        orbitsAreTriangles =
          orbitsAreTriangles &&
          orbits.length === 8 &&
          orbits.every(o => o.length === 3 && [0, 1, 2, 3].every(k => o.reduce((s, d) => s + ROOTS[d]![k]!, 0) === 0) && triangleSet.has(setKey(o)))

        // u and u^-1 give the same orbits: count each map once by taking units with positive i-part sign pattern
        orbits.forEach(o => tally.set(setKey(o), (tally.get(setKey(o)) ?? 0) + 1))
      }
    }

    // each triangle is met by u and u^-1: twice per left pair
    const leftCover = triangles.every(t => leftTriangles.get(t) === 2) && leftTriangles.size === triangles.length
    const rightCover = triangles.every(t => rightTriangles.get(t) === 2) && rightTriangles.size === triangles.length

    // B. factorization on the kept color planes
    const planeOf = (triangle: readonly number[]): string => setKey([...triangle, ...triangle.map(d => OPPOSITE[d]!)])
    const colorTrialities = orderThree.filter(m => {
      const p = permutationOf(m)
      const fixed = p.flatMap((image, d) => (image === d ? [d] : []))

      return fixed.length === 6
    })
    let factorizations = 0
    let keptPlanes = 0
    let commuting = 0

    for (const u of units) {
      const left = leftMultiplication(u)
      const p = permutationOf(left)
      const planes = [...new Set(orbitsOf(p).map(planeOf))]

      keptPlanes += planes.length

      for (const plane of planes) {
        const directions = plane.split(',').map(Number)
        const sigma = colorTrialities.find(m => {
          const q = permutationOf(m)

          return directions.every(d => q[d] === d)
        })

        if (!sigma) {
          continue
        }

        // try sigma and sigma^-1: rho = L sigma^-1 must fix the orthogonal plane pointwise
        for (const s of [sigma, multiplyDoubled(sigma, sigma)]) {
          const inverse = multiplyDoubled(s, s)
          const rho = multiplyDoubled(left, inverse)
          // two independent roots of the plane (the sorted list can open with a root and its opposite)
          const second = directions.find(d => d !== directions[0] && d !== OPPOSITE[directions[0]!]) ?? directions[1]!
          const basis = [directions[0]!, second].map(d => ROOTS[d]!)
          // the orthogonal plane: project the unit vectors off P (Gram-Schmidt on P's basis)
          const e1 = basis[0]!.map(x => x / Math.hypot(...basis[0]!))
          const b2 = basis[1]!.map((x, i) => x - e1.reduce((a, y, j) => a + y * basis[1]![j]!, 0) * e1[i]!)
          const e2 = b2.map(x => x / Math.hypot(...b2))
          const perp = [0, 1, 2, 3]
            .map(k => [0, 1, 2, 3].map(i => (i === k ? 1 : 0)))
            .map(v => {
              const a = e1.reduce((s2, y, j) => s2 + y * v[j]!, 0)
              const b = e2.reduce((s2, y, j) => s2 + y * v[j]!, 0)

              return v.map((x, i) => x - a * e1[i]! - b * e2[i]!)
            })
          const fixesPerp = perp.every(v => applyMatrix(rho, v).every((x, i) => Math.abs(x - v[i]!) < 1e-12))
          const rotatesPlane = directions.every(d => permutationOf(rho)[d] !== d)
          const commutes = matrixKey(multiplyDoubled(rho, s)) === matrixKey(multiplyDoubled(s, rho))

          if (fixesPerp && rotatesPlane && order(rho) === 3 && f4.has(matrixKey(rho))) {
            factorizations++
            commuting += commutes ? 1 : 0
            break
          }
        }
      }
    }

    const factored = keptPlanes === 4 * units.length && factorizations === keptPlanes && commuting === keptPlanes

    // C. the charge lock on invariant states
    let invariantStates = 0
    let lockHolds = true
    const lOmega = permutationOf(leftMultiplication(units[0]!))
    const lOrbits = orbitsOf(lOmega)

    for (let m = 0; m < 3 ** 8; m++) {
      const state = new Array<number>(24).fill(0)

      lOrbits.forEach((o, k) => {
        const tone = (Math.floor(m / 3 ** k) % 3) - 1

        o.forEach(d => (state[d] = tone))
      })

      const charge = state.reduce((s, x) => s + x, 0)
      const momentum = [0, 1, 2, 3].map(k => state.reduce((s, x, d) => s + x * ROOTS[d]![k]!, 0))

      invariantStates++
      lockHolds = lockHolds && ((charge % 3) + 3) % 3 === 0 && momentum.every(x => x === 0)
    }

    // D. the knit survey
    const trialityPermutation = colorTriality({ opposite: OPPOSITE })
    const knits: [string, (t: number) => Collision, number][] = [
      ['committed', turningWeave({ opposite: OPPOSITE }) as unknown as (t: number) => Collision, 24],
      ['colorTurn', colorTurnWeave({ opposite: OPPOSITE }), 24],
      ['combined', combinedCollision({ spec: COMBINED_DEFAULT, opposite: OPPOSITE }), 24],
      ['quaternion', quaternionKnit({ opposite: OPPOSITE }), 1],
      ['triality', trialityWeave({ layout: trialityWeaveLayout({ opposite: OPPOSITE, triality: trialityPermutation }) }), TRIALITY_WEAVE_PERIOD],
    ]
    const survey: Record<string, number> = {}
    let controlFound = false
    let fixedPointFreeKept = 0

    for (const [name, rule, period] of knits) {
      let exactColor = 0
      let exactFree = 0

      for (const m of orderThree) {
        const p = permutationOf(m)
        const fixedCount = p.filter((image, d) => image === d).length

        for (const sign of [1, -1]) {
          for (let shift = 0; shift < period; shift++) {
            if (glideMismatches(rule, period, p, sign, shift, 1) === 0 && glideMismatches(rule, period, p, sign, shift, 1e9) === 0) {
              if (fixedCount > 0) {
                exactColor++
              } else {
                exactFree++
              }

              if (name === 'triality' && p.every((x, d) => x === trialityPermutation[d])) {
                controlFound = true
              }
            }
          }
        }
      }

      survey[`${name}KeptColorTrialities`] = exactColor
      survey[`${name}KeptFixedPointFree`] = exactFree
      fixedPointFreeKept += exactFree
    }

    // E. the quaternion knit's Q8 is right multiplication
    const q8 = Q8_GENERATORS.map(g => Int32Array.from(g.flat().map(x => 2 * x)))
    const rightI = rightMultiplication([0, 0, 0, 2])
    const rightJ = rightMultiplication([0, 0, 2, 0])
    const q8IsRight = matrixKey(q8[0]!) === matrixKey(rightI) && matrixKey(q8[1]!) === matrixKey(rightJ)
    const leftCommutesWithQ8 = units.every(u => q8.every(g => matrixKey(multiplyDoubled(leftMultiplication(u), g)) === matrixKey(multiplyDoubled(g, leftMultiplication(u)))))

    // the knot seed of code/compute/knit-reference
    const seed = setKey([0, 8, 16])
    const seedIsTriangle = triangleSet.has(seed)
    const seedLeft = units.filter(u => orbitsOf(permutationOf(leftMultiplication(u))).some(o => setKey(o) === seed)).length
    const seedRight = units.filter(u => orbitsOf(permutationOf(rightMultiplication(u))).some(o => setKey(o) === seed)).length

    // the two sevens
    const chshSquared = 4 * (1 + Math.sin((2 * Math.PI) / 3) ** 2)
    const roundTwoN = 7 / 3
    const roundTwoShare = (roundTwoN - 1) / (2 * roundTwoN)
    const eisensteinNorms = Array.from({ length: 12 }, (_, i) => i + 1).filter(m => {
      for (let a = -6; a <= 6; a++) {
        for (let b = -6; b <= 6; b++) {
          if (a * a - a * b + b * b === m) {
            return true
          }
        }
      }

      return false
    })

    const solved = orbitsAreTriangles && leftCover && rightCover && factored && lockHolds && invariantStates === 6561 && controlFound && q8IsRight && leftCommutesWithQ8

    return verdict({
      status: solved ? 'pass' : 'fail',
      claim: `left multiplication by a Hurwitz cube root of unity makes the bulk C^2 with omega as its scalar; its orbits on the 24 directions are zero-sum triangles, the four left maps realizing each of the ${triangles.length} triangles once (and the four right maps again), so the knot condition 1 + omega + omega^2 = 0 is the momentum closure of an orbit; it keeps 4 color planes and on each is the color triality that cycles the generations times a commuting third-turn of the color plane (${factorizations} of ${keptPlanes}); all 6,561 invariant dock states have charge 0 mod 3 and zero momentum, the charge lock; the quaternion knit's Q8 is right multiplication, which every L_u commutes with; and of the five knits surveyed ${fixedPointFreeKept === 0 ? 'none keeps' : `${fixedPointFreeKept} glides keep`} a fixed-point-free order-3 element, so no current knit carries the same-omega rule`,
      metrics: {
        orderThreeElements: orderThree.length,
        colorTrialities: colorTrialities.length,
        zeroSumTriangles: triangles.length,
        keptPlanes,
        factorizations,
        commutingFactors: commuting,
        invariantStates,
        fixedPointFreeKept,
        seedIsTriangle: seedIsTriangle ? 1 : 0,
        seedLeftOrbits: seedLeft,
        seedRightOrbits: seedRight,
        ...survey,
        chshSquaredSwap: chshSquared,
        fearShareRoundTwo: roundTwoShare,
        sevensSharedIntegerRate: sharedIntegerRate(),
        sevensAdmissible: sharedIntegerRate() < 0.01 ? 1 : 0,
        eisensteinNormsUpToTwelve: eisensteinNorms.length,
      },
      control: {
        trialityWeaveKeepsItsTriality: controlFound ? 1 : 0,
        q8IsRightMultiplication: q8IsRight ? 1 : 0,
      },
      notes:
        'L2. The exact statements (A to C, E) hold for the group, not for a rule: they say what identifying the bulk omega with the color center would mean, namely a knit that commutes with L_u and whose physical states satisfy L_u psi = omega^q psi. Such a rule would make the knot of three different roles the same thing as a closed triangle of momenta, and would lock charge to the center on every invariant state, and it would cycle generations and colors together, never apart (L_u = sigma_P rho_P). What it would NOT do is select one color plane: L_u keeps four, which is why it is not E-FRC-0106\'s selector. The survey (D) says no existing knit is such a rule. Building one is the open step: its schedule must be L_u-invariant up to a time shift, and E-FRC-0107 already shows that a rule of line pairs cannot keep a triality that fixes a plane; a fixed-point-free triality keeps no line and permutes the 12 lines in 4 orbits of 3, so a pair rule is not excluded by that argument. The knot seed of code/compute/knit-reference (loves on directions 0, 8, 16) is color-neutral only by charge mod 3: it is not a zero-sum triangle, so it is not a geometric knot in this sense. Survey: 60 golden-hash dock states per beat (deterministic), every beat of the period, every shift, both tone maps; a glide is counted only with zero mismatches. First run 2026-09-26, pass: 80 order-3 elements of W(F4), 32 color trialities, 32 zero-sum triangles, 32 of 32 factorizations, all commuting, 6,561 invariant states locked, 0 fixed-point-free glides in five knits (the triality weave keeps its own color triality, 2 glides). Disclosed: gate C\'s second clause (every charge-q sector holds L_u eigenvectors of eigenvalue omega^q) is not computed; it holds for any free orbit of three states, whose three Fourier sums have eigenvalues 1, omega and omega^2 whatever their charge, so it says nothing about the model. The two sevens (reported, added after the first run): the shared-integer rate is 1/12 = 0.083, over the 0.01 an identification needs, and 6 of the integers 1 to 12 are Eisenstein norms, so neither the number nor the ring ties CHSH^2 = 7 to the round-two share 2/7; the swap pair that makes the first has N = 3/2 (E-MTH-0010), so the second comes from another state. No common origin.',
    })
  },
})
