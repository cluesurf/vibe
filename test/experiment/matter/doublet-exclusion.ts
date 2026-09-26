// E-MTR-0018. Is the electron's label the doublet, and does the slot supply its antisymmetry? Two STAND-IN
// electrons (the spinor token of code/rule/spinor-token) on small husk tori, under the slot's exclusion, with no
// exchange symmetry put in.
//
// Two results measured separately point at one connection. E-SPN-0051: each role is 3 = 2 + 1 under the 2 pi turn.
// E-SPN-0066: a covariantly MOVING token cannot occupy the role's scalar line, so it lives in the spin one half
// doublet by force: a moving electron's label is two-valued. E-SPN-0047 and 0049: the slot's exclusion (one vibe
// per slot) keeps the two-vibe fear walk unitary only with exchange phase -1. If both hold together, the doublet
// label plus the slot's exclusion is Pauli's principle with a two-valued label: two per orbital, the sign supplied
// by the dynamics, not by hand (where E-MTR-0012's three-valued role filled three per orbital).
//
// THE COMPUTATION (code/measure/moving-exclusion). Two tokens are given coordinates and evolved in the full product
// space, one total-momentum block at a time (every block of the L = 3 torus, 27 of them). A two-token state is
// KEPT when no substep ever puts amplitude on a forbidden configuration, so the dynamics is unitary on it without
// any rule for two vibes reaching one slot. The kept states are the orthogonal complement of the Krylov closure of
// every forbidden functional. Only then is the exchange read: which of its two sectors the kept space holds. A
// uniform statistics (one exchange phase for every pair) is consistent with the slot exactly when its whole
// sector is kept.
//
// THE EXCLUSION, as the model reads it: a slot is one direction on one link and holds ONE vibe, whatever role the
// vibe carries (the doublet is the role's parity-even part, carried by the vibe, not a slot of its own). So after
// the coin, two tokens on one dock may not both be in the part copied forward, nor both in the part copied back.
// The CONTROL reading, 'component', makes each one-dimensional component of the copied part (the eigenbasis of tau_z
// and sigma_a) a slot of its own: under it a two-valued label is Pauli's by construction, so it shows what the
// hypothesis looks like in this harness when it holds.
//
// Modes: 'walk' is the bare fear walk (no label, E-SPN-0049's walk, the calibration); 'locked' is the moving token,
// its spin setting the copy direction (Gamma = tau_z sigma_a); 'spectator' is the label the motion never reads.
// Schedule x, y, z (every substep a husk step, every substep checked).
//
// THE ORBITAL. Two tokens both in one uniform k = 0 orbital, the label pair in its singlet (the only antisymmetric
// pair of a two-valued label), the slot in a coin eigenvector (tau_x = +1 or -1, the two k = 0 levels of the nested
// g = 2 schedule, E-SPN-0064). At k = 0 the stream copies a uniform state onto itself, so the pair's forbidden
// weight per period is its internal CONTACT WEIGHT c times the chance the two share a dock (1 / L^3 on the torus,
// sum |phi|^4 in an atom). c = 0 means the doubly occupied orbital is exactly allowed.
//
// PREDICTION, written before the gates (and after the probe disclosed below). The label count is algebra: C(2, k) =
// 2, 1, 0 antisymmetric states for k = 1, 2, 3 doublet labels, so at most two per orbital whatever the slot does.
// Whether the slot supplies the sign is the open part.
//
// Gates, fixed before the first run of this file:
// G1 CALIBRATION (walk, every block of L = 3): the whole antisymmetric sector is kept (0 antisymmetric directions
//    removed) and the symmetric sector is not (fewer symmetric directions kept than it has): E-SPN-0047 as subspaces
// G2 THE HYPOTHESIS (locked, the slot as the model reads it, every block of L = 3): the same two statements
// G3 CONTROL, Pauli by construction (locked, component reading, every block): the whole antisymmetric sector kept
// G4 THE ORBITAL (locked, the slot as the model reads it, nested schedule): the singlet pair in one k = 0 orbital
//    has contact weight c = 0 at both k = 0 levels, and C(2, k) = 2, 1, 0
// Status: pass if all four hold. Fail if G2 fails (the model's slot is not Pauli's exclusion for the doublet).
// Partial otherwise. Every block's kept space must close under the period map to 1e-8 and the exchange must commute
// with the beat to 1e-12, or the run is void.
// Reported: spectator under both readings, L = 4 at two blocks, the kept, bad, antisymmetric and symmetric counts.
//
// Depth L2: exact linear algebra on a constructed stand-in token (the spinor token), with the model's slot rule.
//
// DISCLOSED: before this file was written, an unregistered probe (tmp/bind-exclusion-probe.ts, three blocks of L = 3,
// tmp/bind-exclusion-*.log) showed that the walk keeps every antisymmetric direction and that the locked and
// spectator doublets under the slot reading remove 82 and 30 antisymmetric directions of 214 at K = 0. The gates
// are the hypothesis as the task stated it, written after that probe and not moved for it.
//
// The first run, recorded as it came out (174.8 s, tmp/mtr0018.log): fail, on G2, G3 and G4. G3 failing was a
// DEFECT OF THE ESTIMATOR, found and fixed after that run, disclosed here: the bad space was grown in the whole
// block with a relative tolerance of 1e-8, so rounding residuals were taken as new directions, and the count of
// antisymmetric directions inside it was read by a second tolerance test; the Pauli control, which cannot remove an
// antisymmetric direction (every forbidden pair state c x c is symmetric), read 2,304 removed in 12 blocks. The bad
// space is now grown inside each exchange sector separately (the beat commutes with the exchange to 1e-15), every
// vector projected back into its sector, with a relative tolerance of 1e-7, and the smallest accepted and largest
// rejected residuals are printed so the gap between directions and rounding is on the record. No gate moved.
// The second run (79.4 s, tmp/mtr0018-second.log, without the residual printout): fail, on G2 and G4 alone. The
// walk keeps all 1,431 antisymmetric directions and 99 of 1,485 symmetric ones (G1). The Pauli control keeps every
// antisymmetric direction in all 27 blocks (G3). The moving doublet under the slot as the model reads it removes
// 4,296 of 5,778 antisymmetric directions, in every one of the 27 blocks (82 of 214 at K = 0), the same count as the
// first run; on L = 4 it removes 18 of 510 at K = 0 and 60 in the two blocks read, a falling share. The singlet pair
// in one k = 0 orbital puts exactly 1/2 of its contact weight on a forbidden slot at every husk step (3 per period
// of the nested schedule), and 0 under the component reading. The spectator label removes 1,386.
// The third run (23.4 s, tmp/mtr0018-third.log) adds the residual printout and repeats every count: the smallest
// residual taken as a direction is 5.3e-3 and the largest dismissed as rounding 1.7e-8 across all readings, a gap of
// five decades.

import { experiment } from '@/test/scaffold/suite'
import { verdict } from '@/test/scaffold/verdict'
import {
  antisymmetricLabels,
  contactWeight,
  keptSpace,
  tokenSubsteps,
  type ExclusionReading,
  type KeptSpace,
  type TokenMode,
  type TokenStep,
  type Vector,
} from '@/code/measure/moving-exclusion'

const SIDE = 3
const XYZ: readonly TokenStep[] = ['x', 'y', 'z']
const NESTED: readonly TokenStep[] = ['z', 'up', 'down', 'x', 'up', 'down', 'y', 'up', 'down', 'y', 'up', 'down', 'x', 'up', 'down', 'z']
const CLOSURE = 1e-8
const COMMUTES = 1e-12
const BIG_SIDE = 4
const BIG_BLOCKS: readonly (readonly [number, number, number])[] = [
  [0, 0, 0],
  [1, 2, 3],
]

type Scan = { mode: TokenMode; reading: ExclusionReading; blocks: KeptSpace[] }

function scan(mode: TokenMode, reading: ExclusionReading, side: number, blocks?: readonly (readonly [number, number, number])[]): Scan {
  const substeps = tokenSubsteps(XYZ, mode, reading)
  const n = mode === 'walk' ? 2 : 4
  const ks: (readonly [number, number, number])[] = []

  if (blocks) {
    ks.push(...blocks)
  } else {
    for (let a = 0; a < side; a++) {
      for (let b = 0; b < side; b++) {
        for (let c = 0; c < side; c++) {
          ks.push([a, b, c])
        }
      }
    }
  }

  return { mode, reading, blocks: ks.map(k => keptSpace({ side, n, k: [k[0], k[1], k[2]], substeps })) }
}

const sum = (s: Scan, f: (b: KeptSpace) => number): number => s.blocks.reduce((a, b) => a + f(b), 0)
// the symmetric sector's dimension in a block
const symmetricDimension = (b: KeptSpace): number => b.sector.dimension - b.antisymmetric
const antisymmetricKept = (s: Scan): boolean => s.blocks.every(b => b.antisymmetricRemoved === 0)
const symmetricCut = (s: Scan): boolean => s.blocks.every(b => b.symmetricKept < symmetricDimension(b))
const sound = (s: Scan): boolean => s.blocks.every(b => b.closureResidual < CLOSURE && b.exchangeCommutes < COMMUTES)

// the singlet of the label in one k = 0 orbital, the slot in the coin eigenvector tau_x = sign
function singletPair(sign: 1 | -1): Vector {
  const re = new Float64Array(16)
  const im = new Float64Array(16)
  const slot = [Math.SQRT1_2, sign * Math.SQRT1_2]

  for (let i = 0; i < 4; i++) {
    for (let j = 0; j < 4; j++) {
      const si = i % 2
      const sj = j % 2
      const label = si === 0 && sj === 1 ? Math.SQRT1_2 : si === 1 && sj === 0 ? -Math.SQRT1_2 : 0

      re[i * 4 + j] = (slot[Math.floor(i / 2)] as number) * (slot[Math.floor(j / 2)] as number) * label
    }
  }

  return { re, im }
}

export default experiment({
  id: 'matter/doublet-exclusion',
  code: 'E-MTR-0018',
  title:
    "the electron's label is the doublet, tested with stand-ins: two spinor tokens on the husk under the slot's exclusion, with no exchange symmetry put in, against the hypothesis that the moving token's two-valued label and the slot together are Pauli's principle (the whole antisymmetric sector kept, the symmetric one cut, two per orbital)",
  category: 'spin',
  substrates: ['3434'],
  depth: 'L2',
  paper: false,
  run() {
    const walk = scan('walk', 'slot', SIDE)
    const locked = scan('locked', 'slot', SIDE)
    const pauli = scan('locked', 'component', SIDE)
    const spectator = scan('spectator', 'slot', SIDE)
    const spectatorComponent = scan('spectator', 'component', SIDE)
    const big = scan('locked', 'slot', BIG_SIDE, BIG_BLOCKS)
    const scans = [walk, locked, pauli, spectator, spectatorComponent, big]
    const void_ = !scans.every(sound)
    const nested = tokenSubsteps(NESTED, 'locked', 'slot')
    const plus = contactWeight({ substeps: nested, pair: singletPair(1) })
    const minus = contactWeight({ substeps: nested, pair: singletPair(-1) })
    const nestedComponent = tokenSubsteps(NESTED, 'locked', 'component')
    const plusComponent = contactWeight({ substeps: nestedComponent, pair: singletPair(1) })
    const labels = [1, 2, 3].map(k => antisymmetricLabels(2, k))
    const roles = [1, 2, 3, 4].map(k => antisymmetricLabels(3, k))

    const g1 = antisymmetricKept(walk) && symmetricCut(walk)
    const g2 = antisymmetricKept(locked) && symmetricCut(locked)
    const g3 = antisymmetricKept(pauli)
    const g4 = plus.total === 0 && minus.total === 0 && labels.join(',') === '2,1,0'
    const status = void_ ? 'fail' : g1 && g2 && g3 && g4 ? 'pass' : !g2 ? 'fail' : 'partial'
    const metrics: Record<string, number> = {}

    for (const s of scans) {
      const name = s === big ? 'lockedSlotSide4' : `${s.mode}${s.reading === 'slot' ? 'Slot' : 'Component'}`

      metrics[`${name}Dimension`] = sum(s, b => b.sector.dimension)
      metrics[`${name}Kept`] = sum(s, b => b.kept)
      metrics[`${name}Antisymmetric`] = sum(s, b => b.antisymmetric)
      metrics[`${name}AntisymmetricRemoved`] = sum(s, b => b.antisymmetricRemoved)
      metrics[`${name}Symmetric`] = sum(s, symmetricDimension)
      metrics[`${name}SymmetricKept`] = sum(s, b => b.symmetricKept)
      metrics[`${name}BlocksWithAntisymmetricRemoved`] = s.blocks.filter(b => b.antisymmetricRemoved > 0).length
      metrics[`${name}WorstClosure`] = Math.max(...s.blocks.map(b => b.closureResidual))
      metrics[`${name}WorstExchangeCommutator`] = Math.max(...s.blocks.map(b => b.exchangeCommutes))
      metrics[`${name}K0AntisymmetricRemoved`] = s.blocks[0]?.antisymmetricRemoved ?? -1
      metrics[`${name}K0SymmetricKept`] = s.blocks[0]?.symmetricKept ?? -1
      metrics[`${name}SmallestAcceptedResidual`] = Math.min(...s.blocks.map(b => b.smallestAccepted))
      metrics[`${name}LargestRejectedResidual`] = Math.max(...s.blocks.map(b => b.largestRejected))
    }

    plus.perSubstep.forEach((c, i) => (metrics[`orbitalPlusContactSubstep${i + 1}`] = c))
    metrics.orbitalPlusContactPerPeriod = plus.total
    metrics.orbitalMinusContactPerPeriod = minus.total
    metrics.orbitalPlusContactComponentReading = plusComponent.total
    labels.forEach((v, i) => (metrics[`doubletAntisymmetricK${i + 1}`] = v))
    roles.forEach((v, i) => (metrics[`roleAntisymmetricK${i + 1}`] = v))
    metrics.gateCalibration = g1 ? 1 : 0
    metrics.gateHypothesis = g2 ? 1 : 0
    metrics.gatePauliControl = g3 ? 1 : 0
    metrics.gateOrbital = g4 ? 1 : 0

    const removed = sum(locked, b => b.antisymmetricRemoved)
    const anti = sum(locked, b => b.antisymmetric)

    return verdict({
      status,
      claim: `two stand-in electrons under the slot's exclusion, no exchange symmetry put in: the bare fear walk keeps its whole antisymmetric sector and cuts the symmetric one (${g1 ? 'as E-SPN-0047' : 'NOT as E-SPN-0047'}); the moving doublet (locked), with one vibe per slot whatever its label, ${g2 ? 'does the same, so the slot supplies Pauli\'s sign' : `removes ${removed} of ${anti} antisymmetric directions on L = 3, so the slot is harder than Pauli's exclusion: two tokens may not share a link direction even with opposite labels`}; with each label component its own slot the antisymmetric sector is ${g3 ? 'whole' : 'NOT whole'} (the control); a singlet pair in one k = 0 orbital puts ${plus.total.toFixed(4)} of its contact weight per period on a forbidden slot (${plusComponent.total.toFixed(4)} under the component reading), and the doublet's antisymmetric counts are ${labels.join(', ')}, so at most two per orbital`,
      metrics,
      control: {
        pauliReadingAntisymmetricRemoved: sum(pauli, b => b.antisymmetricRemoved),
        spectatorSlotAntisymmetricRemoved: sum(spectator, b => b.antisymmetricRemoved),
        spectatorComponentAntisymmetricRemoved: sum(spectatorComponent, b => b.antisymmetricRemoved),
        walkAntisymmetricRemoved: sum(walk, b => b.antisymmetricRemoved),
      },
      notes: `L2, stand-ins (the spinor token of code/rule/spinor-token on the husk torus; its label is the role's doublet by E-SPN-0066). Exact linear algebra over every total-momentum block of L = 3 (dimension ${sum(locked, b => b.sector.dimension)} for the token, ${sum(walk, b => b.sector.dimension)} for the walk), floating rounding only; the exchange is read after the kept space is found, never imposed. The label count C(2, k) is algebra (L1). The contact weight is the forbidden weight of a pair's internal state, summed over the checked substeps of one period of the nested g = 2 schedule (its depth steps are not checked: a husk shadow does not tell depths apart). The component reading is a choice of basis, stated as one; it is the control, not the model.`,
    })
  },
})
