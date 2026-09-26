// E-MTR-0022. If not the two ends of one link (E-MTR-0021), what holds the moving electron's components as slots of
// their own? The two bulk links over one husk link. STAND-IN electrons (the spinor token of code/rule/spinor-token).
//
// THE CANDIDATE. The husk is the shadow of the D4 bulk along the depth e4. A unit husk step +-e_a is cast by exactly
// two roots, +-e_a + e4 and +-e_a - e4 (a root of the form e_a + e_b, both husk axes, casts a step of length sqrt 2 and
// no unit step). So over every husk link lie two bulk links, four bulk slots (two links, two directions each), and a
// slot is a bulk object: the exclusion is the bulk's, while the physics is read on the husk. E-MTR-0018 read the
// exclusion on the husk shadow, merging two bulk slots into one.
//
// THE LABEL THAT PICKS THE BULK LINK IS NOT A CHOICE. The massive token has copy generators Gamma_a = tau_z sigma_a and
// a mass tau_x (the fear coin C = e^(i pi/3) e^(-i (pi/3) tau_x)). The product of the three generators is a scalar
// times the one involution that commutes with every Gamma_a: chi = -i Gamma_x Gamma_y Gamma_z = tau_z, the
// chirality, which the mass anticommutes with. Its eigenspaces split each rank-2 direction projector into two rank-one
// pieces, and those pieces are E-MTR-0018's component projectors, (tau, sigma_a = s). THE BULK READING: component
// (tau, s) of axis a is the root tau (s e_a + e4). Then the husk direction is tau s (the eigenvalue of Gamma_a), the
// depth is tau (the chirality), sigma_a = s picks the bulk LINE (s e_a + e4 up to sign), tau picks the direction along
// it (the fear walk's forward and back, its original meaning), and the mass, flipping tau at fixed sigma, is the
// reversal r -> -r along one bulk line: the fear coin between a slot and its opposite. Each component is one bulk
// slot, so the bulk's own slot rule is the component rule, which the rank-one theorem of E-MTR-0021 makes Pauli's.
//
// Gates, fixed before the first run:
// G1 THE BULK COUNT (exact integers): each of the 6 unit husk steps is the shadow of exactly 2 of the 24 D4 roots and
//    each of the 12 steps of length sqrt 2 of exactly 1; the 12 components (tau, s, a) map one to one onto the 12
//    roots with a depth part, each with husk shadow tau s e_a and depth tau
// G2 CANONICAL: chi = -i Gamma_x Gamma_y Gamma_z equals tau_z (1e-15), commutes with every Gamma_a and anticommutes
//    with the mass tau_x (1e-15); the joint eigenprojectors of chi and Gamma_a equal E-MTR-0018's component
//    projectors (code/measure/moving-exclusion tokenSubsteps, 'component'), 12 of 12
// G3 COVARIANT: the 24 spin lifts of the husk's tetrahedral turns (Hurwitz units, code/algebra/binary-tetrahedral)
//    carry each of the 12 component projectors onto a component projector (288 of 288), onto the component whose
//    root the turn's husk rotation (depth kept) sends the first one's root to (288 of 288); the 24 units give 12
//    distinct proper signed permutations; the 2 pi turn is -1 on the doublet (1e-15); and in the role the same
//    sigma_a lines are carried with the own point by all 216 frame moves (E-MTR-0021 G1, recomputed here)
// G4 PAULI, THE BULK READING: on every one of the 27 blocks of the L = 3 husk torus, for the massive schedules x, y,
//    z, x and x, y, z, y, x, the whole antisymmetric sector is kept and the symmetric one is cut; the spin-singlet pair
//    in one k = 0 orbital (slot in a coin eigenvector, both signs) has contact weight 0 (1e-15) and the triplet's
//    m = 0 member has more than 0.1 per period
// G5 CONTROL, THE HUSK READING (two bulk slots merged into one): the same schedules remove antisymmetric directions
//    (more than 0 on L = 3)
// G6 MASSIVE: the two k = 0 levels of each schedule's symbol (code/rule/spinor-token) are split by more than 0.1
//    radian
// Every block's kept space closes to 1e-6, the exchange commutes to 1e-12, and at least three decades separate the
// smallest residual taken as a direction from the largest dismissed as rounding, with the Krylov tolerance at 1e-5, or
// the run is void. (Set from E-MTR-0021's void first run and its probe, tmp/py-probe-krylov.log, which ran two blocks
// of every schedule and reading used here at five tolerances before this file ran: the husk reading of the massive
// schedules has a rounding floor near 6e-7, and the counts are stable from 1e-4 to 1e-6. That probe printed the
// bulk reading's counts on those two blocks, 0 antisymmetric directions removed.)
// Status: pass if all six hold. Fail if G4 fails. Partial otherwise.
// Reported, not gated: the comoving fermion number (chi acts on tau only, so it commutes with the role doublet's Q_x
// about any point: the reading leaves N untouched, and G3's role part carries the split with the own point); what the
// knit supplies (its stream copies one vibe per root slot at every dock, so it holds the four components apart; the
// one-token reversal r <-> -r the mass needs is a superposition of two slots, which the knit's classical collision,
// a permutation of vibes, never performs: the moving token's mass is not a move of the knit).
//
// Depth L2 for G4 to G6 (exact linear algebra on a stand-in with the model's slot rule read in the bulk); L1 for G1 to
// G3 (algebra and root geometry). G4's antisymmetric half holds by the rank-one theorem once the identification is
// made; what the run adds is the identification's consistency (G1 to G3), the cut symmetric sector, the orbital
// counts, and the control.
//
// The first run, recorded as it came out (50.2 s, tmp/mtr0022.log): pass. Every unit husk step cast by exactly 2 roots,
// the 12 components onto the 12 depth roots; chi - tau_z, [chi, Gamma_a] and {chi, tau_x} all 0; 12 of 12 projectors
// equal the component reading's; 288 of 288 turn images on components and on the rotated roots, 12 distinct rotations,
// U(-1) = -1; 11,664 of 11,664 role lines carried. Bulk reading: 0 of 5,778 antisymmetric directions removed on both
// massive schedules, symmetric kept 279 and 526 of 5,886; singlet contact 0, triplet 1.5 and 2.0 per period. Husk
// reading: 4,892 and 4,033 removed, every block. k = 0 gap 2 pi / 3 on both. Sound: worst closure 8.2e-7.

import { experiment } from '@/test/scaffold/suite'
import { verdict } from '@/test/scaffold/verdict'
import { contactWeight, keptSpace, tokenSubsteps, type KeptSpace, type Substep, type TokenStep, type Vector } from '@/code/measure/moving-exclusion'
import { commutes, componentCovariance, componentProjector, componentRoot, diracGenerators, huskShadows, orbitalPair, roleEndCovariance, roleEnds } from '@/code/measure/doublet-slots'
import { scheduleSymbol } from '@/code/rule/spinor-token'
import { matrixDistance } from '@/code/algebra/weil-representation'
import { type ComplexMatrix } from '@/code/algebra/linear/complex-matrix'
import { rootsD4 } from '@/code/algebra/group/root-system'

const SIDE = 3
const SCHEDULES: readonly (readonly TokenStep[])[] = [
  ['x', 'y', 'z', 'x'],
  ['x', 'y', 'z', 'y', 'x'],
]
const CLOSURE = 1e-6
const GAP = 1e3
const KRYLOV = 1e-5
const COMMUTES = 1e-12
const EXACT = 1e-15
const LOOSE = 1e-12
const TRIPLET_FLOOR = 0.1
const GAP_FLOOR = 0.1

function blocks(substeps: readonly Substep[]): KeptSpace[] {
  const out: KeptSpace[] = []

  for (let a = 0; a < SIDE; a++) {
    for (let b = 0; b < SIDE; b++) {
      for (let c = 0; c < SIDE; c++) {
        out.push(keptSpace({ side: SIDE, n: 4, k: [a, b, c], substeps, tolerance: KRYLOV }))
      }
    }
  }

  return out
}

const total = (list: readonly KeptSpace[], f: (b: KeptSpace) => number): number => list.reduce((a, b) => a + f(b), 0)
const sound = (list: readonly KeptSpace[]): boolean =>
  list.every(b => b.closureResidual < CLOSURE && b.exchangeCommutes < COMMUTES && (b.largestRejected === 0 || b.smallestAccepted / b.largestRejected > GAP))

// the eigenphases of a 4 x 4 unitary symbol at k = 0 that the coin alone sets: C^n has eigenvalues 1 (tau_x = +1)
// and e^(2 pi i n / 3) (tau_x = -1), read from the symbol's action on the two tau_x eigenvectors
function zeroGap(schedule: readonly TokenStep[]): number {
  const m = scheduleSymbol(schedule as ('x' | 'y' | 'z')[], 'locked', [0, 0, 0])
  // <v| M |v> for v = (|0> + sign |1>)_tau / sqrt 2 (x) |up>
  const expectation = (sign: number): [number, number] => {
    const v = [Math.SQRT1_2, 0, sign * Math.SQRT1_2, 0]
    let re = 0
    let im = 0

    for (let i = 0; i < 4; i++) {
      for (let j = 0; j < 4; j++) {
        const [a, b] = m[i * 4 + j] ?? [0, 0]

        re += (v[i] as number) * a * (v[j] as number)
        im += (v[i] as number) * b * (v[j] as number)
      }
    }

    return [re, im]
  }
  const [p, q] = [expectation(1), expectation(-1)]
  const angle = Math.atan2(p[1] * q[0] - p[0] * q[1], p[0] * q[0] + p[1] * q[1])

  return Math.abs(angle)
}

export default experiment({
  id: 'matter/doublet-bulk-slots',
  code: 'E-MTR-0022',
  title:
    "what holds the moving electron's two components as slots of their own: the two bulk links over one husk link, picked by the chirality -i Gamma_x Gamma_y Gamma_z, tested with stand-ins for covariance, Pauli's exclusion on massive schedules, and against the husk reading",
  category: 'spin',
  substrates: ['3434'],
  depth: 'L2',
  paper: false,
  run() {
    // G1: the bulk count
    const shadows = huskShadows()
    const unitSteps = [...shadows.entries()].filter(([key]) => key.split(',').map(Number).reduce((a, v) => a + v * v, 0) === 1)
    const longSteps = [...shadows.entries()].filter(([key]) => key.split(',').map(Number).reduce((a, v) => a + v * v, 0) === 2)
    const rootKeys = new Set(rootsD4().map(r => r.join(',')))
    const componentRoots: string[] = []
    let shadowsAgree = 0

    for (const tau of [1, -1]) {
      for (const s of [1, -1]) {
        for (let a = 0; a < 3; a++) {
          const r = componentRoot(tau, s, a)

          componentRoots.push(r.join(','))
          shadowsAgree += r[a] === tau * s && r[3] === tau && rootKeys.has(r.join(',')) ? 1 : 0
        }
      }
    }

    const depthRoots = rootsD4().filter(r => r[3] !== 0).map(r => r.join(','))
    const g1 =
      unitSteps.length === 6 &&
      unitSteps.every(([, list]) => list.length === 2) &&
      longSteps.length === 12 &&
      longSteps.every(([, list]) => list.length === 1) &&
      shadowsAgree === 12 &&
      new Set(componentRoots).size === 12 &&
      depthRoots.length === 12 &&
      depthRoots.every(r => componentRoots.includes(r))

    // G2: the chirality
    const dirac = diracGenerators()
    const tauZ: ComplexMatrix = { n: 4, re: Float64Array.from({ length: 16 }, (_, i) => (i % 5 === 0 ? (i < 8 ? 1 : -1) : 0)), im: new Float64Array(16) }
    const chiIsTauZ = matrixDistance(dirac.chirality, tauZ)
    const chiCommutes = Math.max(...dirac.gammas.map(g => commutes(dirac.chirality, g, 1)))
    const chiAnticommutesMass = commutes(dirac.chirality, dirac.mass, -1)
    let projectorsMatch = 0

    ;(['x', 'y', 'z'] as const).forEach((axis, a) => {
      const reference = (tokenSubsteps([axis], 'locked', 'component')[0] as Substep).components ?? []

      for (const tau of [1, -1]) {
        for (const s of [1, -1]) {
          const mine = componentProjector(tau, s, a)

          projectorsMatch += reference.some(r => matrixDistance(mine, { n: 4, re: r.re, im: r.im }) < LOOSE) ? 1 : 0
        }
      }
    })

    const g2 = chiIsTauZ < EXACT && chiCommutes < EXACT && chiAnticommutesMass < EXACT && projectorsMatch === 12

    // G3: covariance
    const comp = componentCovariance()
    const role = roleEndCovariance(roleEnds())
    const g3 =
      comp.monomial === 288 && comp.rootsAgree === 288 && comp.checks === 288 && comp.properSigned === 24 && comp.distinct === 12 && comp.twoPi < EXACT && role.carried === role.checks

    // G4, G5: Pauli in the bulk reading, and the husk reading as control
    const bulk = SCHEDULES.map(s => blocks(tokenSubsteps(s, 'locked', 'component')))
    const husk = SCHEDULES.map(s => blocks(tokenSubsteps(s, 'locked', 'slot')))
    const contacts = SCHEDULES.map(s => {
      const substeps = tokenSubsteps(s, 'locked', 'component')
      const pair = (sign: 1 | -1, spin: 'singlet' | 'triplet'): number => contactWeight({ substeps, pair: orbitalPair(sign, spin) as Vector }).total

      return { singlet: Math.max(pair(1, 'singlet'), pair(-1, 'singlet')), triplet: Math.min(pair(1, 'triplet'), pair(-1, 'triplet')) }
    })
    const g4 =
      bulk.every(list => list.every(b => b.antisymmetricRemoved === 0 && b.symmetricKept < b.sector.dimension - b.antisymmetric)) &&
      contacts.every(c => c.singlet < EXACT && c.triplet > TRIPLET_FLOOR)
    const g5 = husk.every(list => total(list, b => b.antisymmetricRemoved) > 0)

    // G6: massive
    const gaps = SCHEDULES.map(zeroGap)
    const g6 = gaps.every(g => g > GAP_FLOOR)
    const void_ = ![...bulk, ...husk].every(sound)
    const status = void_ ? 'fail' : g1 && g2 && g3 && g4 && g5 && g6 ? 'pass' : !g4 ? 'fail' : 'partial'
    const metrics: Record<string, number> = {
      unitHuskSteps: unitSteps.length,
      rootsPerUnitStep: Math.max(...unitSteps.map(([, l]) => l.length)),
      longHuskSteps: longSteps.length,
      componentRootsOnDepthRoots: depthRoots.filter(r => componentRoots.includes(r)).length,
      chiralityMinusTauZ: chiIsTauZ,
      chiralityCommutator: chiCommutes,
      chiralityMassAnticommutator: chiAnticommutesMass,
      projectorsMatchComponentReading: projectorsMatch,
      turnImagesOnComponents: comp.monomial,
      turnImagesOnRotatedRoots: comp.rootsAgree,
      distinctHuskRotations: comp.distinct,
      twoPiPlusOne: comp.twoPi,
      roleLinesCarried: role.carried,
      roleLinesChecked: role.checks,
      runVoid: void_ ? 1 : 0,
      gateBulkCount: g1 ? 1 : 0,
      gateCanonical: g2 ? 1 : 0,
      gateCovariant: g3 ? 1 : 0,
      gatePauliBulk: g4 ? 1 : 0,
      gateHuskControl: g5 ? 1 : 0,
      gateMassive: g6 ? 1 : 0,
    }

    SCHEDULES.forEach((s, i) => {
      const name = s.join('')
      const b = bulk[i] as KeptSpace[]
      const h = husk[i] as KeptSpace[]

      metrics[`${name}Dimension`] = total(b, x => x.sector.dimension)
      metrics[`${name}Antisymmetric`] = total(b, x => x.antisymmetric)
      metrics[`${name}BulkAntisymmetricRemoved`] = total(b, x => x.antisymmetricRemoved)
      metrics[`${name}BulkSymmetricKept`] = total(b, x => x.symmetricKept)
      metrics[`${name}Symmetric`] = total(b, x => x.sector.dimension - x.antisymmetric)
      metrics[`${name}HuskAntisymmetricRemoved`] = total(h, x => x.antisymmetricRemoved)
      metrics[`${name}HuskBlocksWithRemoved`] = h.filter(x => x.antisymmetricRemoved > 0).length
      metrics[`${name}SingletContact`] = contacts[i]?.singlet as number
      metrics[`${name}TripletContact`] = contacts[i]?.triplet as number
      metrics[`${name}ZeroGap`] = gaps[i] as number
      metrics[`${name}WorstClosure`] = Math.max(...[...b, ...h].map(x => x.closureResidual))
      metrics[`${name}WorstExchangeCommutator`] = Math.max(...[...b, ...h].map(x => x.exchangeCommutes))
      metrics[`${name}SmallestAccepted`] = Math.min(...[...b, ...h].map(x => x.smallestAccepted))
      metrics[`${name}LargestRejected`] = Math.max(...[...b, ...h].map(x => x.largestRejected))
    })

    const bulkRemoved = bulk.map(list => total(list, b => b.antisymmetricRemoved))
    const huskRemoved = husk.map(list => total(list, b => b.antisymmetricRemoved))

    return verdict({
      status,
      claim: `the moving token's four components are the four bulk slots over one husk link: every unit husk step is cast by exactly 2 D4 roots (${g1 ? 'all 6' : 'NOT all'}), the component (tau, sigma_a = s) is the root tau (s e_a + e4), picked by the chirality -i Gamma_x Gamma_y Gamma_z = tau_z (${chiIsTauZ.toExponential(1)}), which the mass anticommutes with; the husk turns carry components onto components as they carry roots (${comp.rootsAgree} of 288), 2 pi sign -1; read in the bulk the slot rule keeps the whole antisymmetric sector on massive schedules x y z x and x y z y x (${bulkRemoved.join(' and ')} removed, L = 3, every block) with the singlet pair allowed in one orbital (contact ${Math.max(...contacts.map(c => c.singlet)).toExponential(1)}) and the triplet cut (${Math.min(...contacts.map(c => c.triplet)).toFixed(3)} per period), while read on the husk (two bulk slots merged) it removes ${huskRemoved.join(' and ')}`,
      metrics,
      control: {
        huskReadingAntisymmetricRemoved: huskRemoved.reduce((a, b) => a + b, 0),
      },
      notes:
        'L2 for the exclusion (exact linear algebra on every total-momentum block, stand-in tokens), L1 for the root count, the chirality and the covariance. The bulk reading is an identification, not a derivation: the stand-in token carries no depth, and the identification says which bulk slot each of its components would occupy. Its depth excursions (the up and down steps of E-SPN-0064\'s nested schedule) copy every component through one root and are not slot-respecting under it, so the massive schedules here get their mass from the coin alone (C^4 = C, C^5 = C^2). The fermion number is untouched (chi acts on tau, the role doublet is sigma). The knit\'s stream holds one vibe per root slot and so keeps the four components apart; the mass, a one-token superposition of a slot and its opposite, is not a move of the knit\'s classical collision.',
    })
  },
})
