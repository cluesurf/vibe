// E-MTR-0021. Are the doublet's two components the two ends of a link? STAND-IN electrons (the spinor token of
// code/rule/spinor-token and its two-component reduction), the role qutrit, and the husk torus.
//
// E-MTR-0018 found the slot's exclusion (one vibe per slot whatever its label) stricter than Pauli's: the moving
// token's copy along +a is the rank-2 part Gamma_a = tau_z sigma_a = +1, so one slot held a two-dimensional label, and
// Pauli's sign appeared only when each label component was its own slot, a choice of basis. THE HYPOTHESIS: every link
// is shared by two slots, one from each end (a link is the relation between the two vibes on it), and the doublet's
// two components ARE those two slots, so "each component its own slot" is the link's own structure.
//
// WHAT THE ENDS ARE, fixed before any computation. A slot is one direction on one link: the vibe the stream copies
// from dock x toward x + a occupies the link's end at x, the one copied from x + a toward x its end at x + a. So a
// link's two ends are its two directions. For the ends to be the doublet's components, the component must decide the
// direction, and there are only two ways that can be read:
// (a) THE FOUR-COMPONENT (MASSIVE) TOKEN, ends = directions: a component (tau, sigma_a = s) is at the end its copy
//     direction tau s names. Two components share each end, so this is E-MTR-0018's slot reading, here on a MASSIVE
//     schedule (x, y, z, x: the coin C appears four times, C^4 = C, a gap at k = 0; E-MTR-0018's x, y, z has C^3 = 1
//     and is massless).
// (b) THE TWO-COMPONENT TOKEN, the doublet alone copied along +a where sigma_a = +1 and along -a where -1
//     (code/measure/doublet-slots weylSubsteps): each end holds exactly one component, the hypothesis literally.
// A third reading, the end set by sigma_a whatever the copy direction, is not a slot rule (it puts a vibe copied
// toward x + a at the end x + a, where the stream never writes) and forbids, besides |c c> at one dock, pairs of
// DIFFERENT modes on neighboring docks; such a forbidden functional is not exchange-symmetric, so it removes
// antisymmetric directions by the theorem below. It is stated, not computed.
//
// THE THEOREM that makes the Pauli gates decidable (the beat commutes with the exchange X and the forbidden set is
// X-invariant): the antisymmetric sector is kept whole if and only if every forbidden pair functional is exchange-
// even, which for product functionals means |c> |c> for single-token modes c at one dock. So a slot rule is Pauli's
// exactly when every slot is ONE mode: rank one. (The bad space is the X-invariant Krylov closure of the forbidden
// functionals; its antisymmetric part is the closure of their antisymmetric parts.)
//
// THE MASS. A Dirac mass anticommutes with every copy generator. On the doublet alone the generators are sigma_x,
// sigma_y, sigma_z, and nothing anticommutes with all three; a coin that commutes with the doublet's turns is a scalar
// (the doublet is irreducible, E-SPN-0051). So the two-component token is massless (Weyl), and the massive token
// needs four components, whose direction projectors have rank 2.
//
// Gates, fixed before the first run:
// G1 COVARIANT (the role, E-SPN-0051/0054): about each of the 9 grid points the lifts of the three pi turns q_a
//    have two doublet eigenlines each, rank one to 1e-12, summing to Q_x = (1 + A(x)) / 2 per axis, with the 2 pi
//    turn about x equal to -1 on each (Pi R_x Pi = -Pi); and all 216 frame moves D(v) L(M) carry the six lines about
//    x onto the six about M x + v: 11,664 of 11,664
// G2 THE COMOVING FERMION NUMBER (E-SPN-0059): N = <Q_x_own> is the sum of the two end occupations of every axis,
//    so G1's covariance carries N and its split into ends with the own point (a consequence of G1, checked there)
// G3 THE HYPOTHESIS, PAULI FOR THE MOVING TOKEN: reading (a) keeps the whole antisymmetric sector on every one of the
//    27 blocks of the L = 3 husk torus, schedule x, y, z, x. PREDICTED TO FAIL by the theorem (rank-2 ends)
// G4 THE TWO-COMPONENT TOKEN: reading (b) keeps the whole antisymmetric sector and cuts the symmetric one on every
//    block of L = 3 (schedule x, y, z), and is massless: the anticommutant of sigma_x, sigma_y, sigma_z is 0, and
//    its two bands meet at k = 0 (splitting under 1e-12) and open linearly (the splitting over |k| equal to 2 within
//    1e-2 at |k| = 1e-3 and 1e-4 along three directions)
// G5 FOUR COMPONENTS FOR A MASS: the anticommutant of tau_z sigma_a (a = x, y, z) has complex dimension 2 (tau_x and
//    tau_y), so a massive token has rank-2 direction projectors: four slots per husk link, and a link has two ends
// Every block's kept space closes under the period map to 1e-8 and the exchange commutes with the beat to 1e-12, or
// the run is void.
// Status: pass if G1, G2 and G3 hold (the hypothesis). Fail if G3 fails. Partial otherwise. G4 and G5 are the
// diagnosis of a failure, reported with their own verdict.
//
// Depth L2: exact linear algebra on constructed stand-in tokens with the model's slot rule, and the model's own role
// algebra (L1 for G1, G2 and G5).
//
// The first run, recorded as it came out (15.8 s, tmp/mtr0021.log): VOID by its soundness clause, with every verdict
// as predicted (G1 11,664 of 11,664, G2, G4, G5 pass, G3 fails: 5,340 of 5,778 antisymmetric directions removed).
// The worst closure was 0.081 against 1e-8 and the smallest residual taken as a direction (1.4e-7) sat below the
// largest dismissed (9.9e-8): at the massive schedule the rounding floor of the shared kept-space estimator
// (code/measure/moving-exclusion, Krylov tolerance 1e-7) is about 5.6e-7, so rounding was being taken as
// directions. A probe after that run (tmp/py-probe-krylov.ts, tmp/py-probe-krylov.log: two blocks, every schedule
// and reading, tolerances 1e-4 to 1e-9) found the counts stable for tolerances 1e-4 to 1e-6 (the K = 0 block of
// x, y, z, x removes 92 of 214 there; 124 at 1e-7 and 154 at 1e-9 are rounding) with five decades between accepted
// and rejected residuals. CHANGED AFTER THE FIRST RUN, disclosed: the Krylov tolerance is 1e-5, and the soundness
// rule is closure under 1e-6 with at least three decades between the smallest accepted and the largest rejected
// residual on every block (the 1e-8 closure is below this schedule's rounding floor). No physics gate moved, and G3's
// verdict cannot change: the rank-one theorem refuses it for any count above 0.
// The second run (14.7 s, tmp/mtr0021-second.log): fail, sound (worst closure 8.2e-7, at least 3.4 decades between
// accepted and rejected residuals on every block). G1 and G2: 11,664 of 11,664 end lines carried, rank one to 9e-16,
// summing to the doublet to 3e-15, 2 pi sign -1 to 2e-15. G3 fails as predicted: the ends read as slots remove 4,892 of
// 5,778 antisymmetric directions on L = 3, in all 27 blocks (92 of 214 at K = 0). G4: the doublet-only token removes 0
// of 1,431 and keeps 180 of 1,485 symmetric ones, anticommutant 0, bands meeting at k = 0 (splitting 0) and opening at
// 2.000 |k|. G5: anticommutant 2, direction rank 2.

import { experiment } from '@/test/scaffold/suite'
import { verdict } from '@/test/scaffold/verdict'
import { keptSpace, tokenSubsteps, type KeptSpace, type Substep, type TokenStep } from '@/code/measure/moving-exclusion'
import { anticommutantDimension, diracGenerators, roleEndCovariance, roleEnds, weylBand, weylSubsteps } from '@/code/measure/doublet-slots'

const SIDE = 3
const MASSIVE: readonly TokenStep[] = ['x', 'y', 'z', 'x']
const XYZ: readonly TokenStep[] = ['x', 'y', 'z']
// the soundness rule and the Krylov tolerance as changed after the first run (see the header)
const CLOSURE = 1e-6
const GAP = 1e3
const KRYLOV = 1e-5
const COMMUTES = 1e-12
const EXACT = 1e-12

function blocks(side: number, n: number, substeps: readonly Substep[]): KeptSpace[] {
  const out: KeptSpace[] = []

  for (let a = 0; a < side; a++) {
    for (let b = 0; b < side; b++) {
      for (let c = 0; c < side; c++) {
        out.push(keptSpace({ side, n, k: [a, b, c], substeps, tolerance: KRYLOV }))
      }
    }
  }

  return out
}

const total = (list: readonly KeptSpace[], f: (b: KeptSpace) => number): number => list.reduce((a, b) => a + f(b), 0)
// sound: the kept space closes to CLOSURE, the exchange commutes, and at least GAP between the smallest residual taken
// as a direction and the largest dismissed as rounding (a block with nothing dismissed has no gap to read)
const sound = (list: readonly KeptSpace[]): boolean =>
  list.every(b => b.closureResidual < CLOSURE && b.exchangeCommutes < COMMUTES && (b.largestRejected === 0 || b.smallestAccepted / b.largestRejected > GAP))

export default experiment({
  id: 'matter/doublet-link-ends',
  code: 'E-MTR-0021',
  title:
    "are the doublet's two components the two ends of a link: stand-in electrons on the husk and the role qutrit, the ends read as the link's two slots, for covariance, the comoving fermion number, Pauli's exclusion and a mass",
  category: 'spin',
  substrates: ['3434'],
  depth: 'L2',
  paper: false,
  run() {
    // G1, G2: the role
    const ends = roleEnds()
    const cov = roleEndCovariance(ends)
    const g1 = cov.carried === cov.checks && cov.checks === 216 * 9 * 6 && cov.rankOne < EXACT && cov.sumToDoublet < EXACT && cov.twoPiSign < EXACT
    const g2 = g1

    // G3: the four-component token, ends = directions (the slot reading), massive schedule
    const massive = blocks(SIDE, 4, tokenSubsteps(MASSIVE, 'locked', 'slot'))
    const g3 = massive.every(b => b.antisymmetricRemoved === 0)

    // G4: the two-component token
    const weyl = blocks(SIDE, 2, weylSubsteps(XYZ))
    const pauli = (list: readonly KeptSpace[]): boolean => list.every(b => b.antisymmetricRemoved === 0 && b.symmetricKept < b.sector.dimension - b.antisymmetric)
    const sigmas = (['x', 'y', 'z'] as const).map(a => {
      const s = weylSubsteps([a])[0] as Substep
      // sigma_a = P+ - P-
      return { n: 2, re: Float64Array.from(s.plus.re, (v, i) => v - (s.minus.re[i] as number)), im: Float64Array.from(s.plus.im, (v, i) => v - (s.minus.im[i] as number)) }
    })
    const weylAnti = anticommutantDimension(sigmas)
    const gapAtZero = (() => {
      const [e1, e2] = weylBand(XYZ, [0, 0, 0])

      return Math.abs(e1 - e2)
    })()
    const directions = [
      [1, 0, 0],
      [0, 1, 0],
      [1, 1, 1].map(v => v / Math.sqrt(3)),
    ]
    const slopes = [1e-3, 1e-4].flatMap(size =>
      directions.map(dir => {
        const [e1, e2] = weylBand(
          XYZ,
          dir.map(v => v * size),
        )

        return Math.abs(e1 - e2) / size
      }),
    )
    const conical = slopes.every(s => Math.abs(s - 2) < 1e-2)
    const g4 = pauli(weyl) && weylAnti === 0 && gapAtZero < EXACT && conical

    // G5: the four-component generators leave room for a mass
    const dirac = diracGenerators()
    const diracAnti = anticommutantDimension(dirac.gammas)
    const directionRank = (() => {
      const s = tokenSubsteps(['x'], 'locked', 'slot')[0] as Substep
      let trace = 0

      for (let i = 0; i < 4; i++) {
        trace += s.plus.re[5 * i] as number
      }

      return trace
    })()
    const g5 = diracAnti === 2 && Math.abs(directionRank - 2) < EXACT
    const void_ = !sound(massive) || !sound(weyl)
    const status = void_ ? 'fail' : g1 && g2 && g3 ? 'pass' : !g3 ? 'fail' : 'partial'
    const removed = total(massive, b => b.antisymmetricRemoved)
    const anti = total(massive, b => b.antisymmetric)
    const metrics: Record<string, number> = {
      roleEndChecks: cov.checks,
      roleEndCarried: cov.carried,
      roleEndSwaps: cov.swaps,
      roleEndRankOne: cov.rankOne,
      roleEndSumToDoublet: cov.sumToDoublet,
      roleEndTwoPiSign: cov.twoPiSign,
      massiveDimension: total(massive, b => b.sector.dimension),
      massiveAntisymmetric: anti,
      massiveAntisymmetricRemoved: removed,
      massiveBlocksWithRemoved: massive.filter(b => b.antisymmetricRemoved > 0).length,
      massiveK0AntisymmetricRemoved: massive[0]?.antisymmetricRemoved ?? -1,
      massiveSymmetricKept: total(massive, b => b.symmetricKept),
      weylDimension: total(weyl, b => b.sector.dimension),
      weylAntisymmetric: total(weyl, b => b.antisymmetric),
      weylAntisymmetricRemoved: total(weyl, b => b.antisymmetricRemoved),
      weylSymmetric: total(weyl, b => b.sector.dimension - b.antisymmetric),
      weylSymmetricKept: total(weyl, b => b.symmetricKept),
      weylAnticommutant: weylAnti,
      weylGapAtZero: gapAtZero,
      ...Object.fromEntries(slopes.map((s, i) => [`weylSplittingOverK${i}`, s])),
      diracAnticommutant: diracAnti,
      diracDirectionRank: directionRank,
      worstClosure: Math.max(...[...massive, ...weyl].map(b => b.closureResidual)),
      worstExchangeCommutator: Math.max(...[...massive, ...weyl].map(b => b.exchangeCommutes)),
      smallestAcceptedResidual: Math.min(...[...massive, ...weyl].map(b => b.smallestAccepted)),
      largestRejectedResidual: Math.max(...[...massive, ...weyl].map(b => b.largestRejected)),
      smallestGapDecades: Math.min(...[...massive, ...weyl].filter(b => b.largestRejected > 0).map(b => Math.log10(b.smallestAccepted / b.largestRejected))),
      runVoid: void_ ? 1 : 0,
      gateCovariant: g1 ? 1 : 0,
      gateFermionNumber: g2 ? 1 : 0,
      gateHypothesis: g3 ? 1 : 0,
      gateTwoComponent: g4 ? 1 : 0,
      gateFourForAMass: g5 ? 1 : 0,
    }

    return verdict({
      status,
      claim: `the ends of a link as the doublet's components: covariant in the role (${cov.carried} of ${cov.checks} end lines carried onto the end lines about the moved point, 2 pi sign -1, the two lines of each axis summing to the doublet, so the comoving fermion number is their sum); but a link's two ends are its two directions, and the massive token (schedule x, y, z, x) holds two components per direction, so reading its ends as slots removes ${removed} of ${anti} antisymmetric directions on L = 3 (${g3 ? 'NONE' : 'as the rank-one theorem predicts'}); the only token whose components are the ends, the doublet copied along sigma_a, keeps the whole antisymmetric sector (${total(weyl, b => b.antisymmetricRemoved)} removed) but is massless (anticommutant ${weylAnti}, bands meeting at k = 0, splitting ${slopes[0]?.toFixed(6)} |k|), while a mass needs the four-component token (anticommutant ${diracAnti}, direction rank ${directionRank.toFixed(0)}): four slots per husk link, and a link has two ends`,
      metrics,
      control: {
        weylAntisymmetricRemoved: total(weyl, b => b.antisymmetricRemoved),
        massiveAntisymmetricRemoved: removed,
      },
      notes:
        'L2 (G1, G2, G5 are L1 algebra). Stand-ins: the spinor token of code/rule/spinor-token and its doublet-only reduction; the role algebra is the Weil lift of SL(2, 3) (code/algebra/weil-representation), the same projectors for all three lifts since Q8 is the commutator subgroup. Exact linear algebra on every total-momentum block, floating rounding only; the exchange is read after the kept space is found, never imposed. The knit\'s stream copies one vibe per (link, direction), so it respects reading (b) and not (a): (a) needs two vibes per direction. The third reading (end set by sigma_a whatever the direction) is refused by the theorem in the header and is not a slot rule.',
    })
  },
})
