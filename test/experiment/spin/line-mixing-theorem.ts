// WHICH COVARIANT MAPS LET A VIBE LEAVE ITS LINE (E-SPN-0094). Every lone vibe of the working vacuum stays on its own
// line (E-RLT-0103, 0105; E-SPN-0091, 0093): the coin of E-SPN-0090 is lock-keeping, span(I, R) on the dock, so it hands
// a vibe only to the other slot of its own line. That line locality blocks the electron off its line and its g, bounded
// selves (E-SLF-0177, 0178), gravity's reach and measurement. The rule acts inside one dock at a time, so the candidate
// fix is a covariant map on a dock's slots that MIXES LINES. Here every such map is classified.
//
// THE THEOREM (derived before the run, code/measure/line-mixing, each clause gated below).
// (1) The dock commutant is 5-dimensional (E-SPN-0090 H5), spanned by the orbitals A2 = I, A1, A0, A-1, A-2 = R (named
//     by inner product). A1, A0 and A-1 take a slot off its line, so there are exactly THREE independent line-mixing
//     covariant linear maps, the classes 1, 0 and -1.
// (2) No covariant permutation mixes lines: a permutation matrix in the commutant is a 0/1 sum of orbitals with one 1
//     per row, which only I and R are. The rule's classical pieces (slot permutations) cannot do it; a line-mixing
//     piece must carry amplitude, like the coin.
// (3) The five orbitals share five eigenspaces (the table in code/measure/line-mixing: frame-uniform 1, frame-contrast
//     2, even rest 9, odd vector 4, odd rest 8). A covariant unitary is sum mu_j E_j, |mu_j| = 1, a 5-torus, and every
//     one of the three classes is reachable over the complex numbers. In the RULE'S RING Z[w][1/2] each mu_j is a unit
//     (2 is inert) and 3 is not invertible, which forces mu_1 = mu_2 and mu_4 = mu_5: the coefficients on A1 and A-1
//     VANISH. Of 6^5 = 7,776 unit choices exactly 6^3 = 216 lie in the ring, 36 lock-keeping (up to the global phase,
//     E-SPN-0090's six coins) and 180 line-mixing, every one through A0 alone: a vibe can leave its line only for an
//     ORTHOGONAL line, the other three lines of its FRAME (the 24 slots fall into three frames of four orthogonal lines).
// (4) Every ring unitary factors as (lock-keeping) x M_alpha, M_alpha = I + (alpha - 1) Q, Q the projector on the
//     frame-uniform vectors (one per frame): the line mixing is one sixth root alpha != 1 on one mode per frame. Of the
//     five, exactly one is real and exactly one is an involution, the same one, alpha = -1, and it has the least
//     denominator (4, the other four 8): G = I - 2Q = (3/4) I - (1/4) R - (1/4) A0, the Grover diffusion on each frame
//     (Grover 1996). No free parameter: the algebra fixes it. G fixes e_r - e_-r (the line's P-) and sends P+ into the
//     frame; it commutes with the coin 2C, so adding it changes nothing the coin does.
// (5) The store and the pass contact. Lifted to the configurations as the coin is (acting on a frame that holds exactly
//     one open vibe, identity on every other frame), G never touches a store and never touches a full line, so the pass
//     contact and the working vacuum's stored pairs are untouched. The second-quantized lift would not: it keeps a full
//     line's pair with the line block's determinant, which has modulus 1 for none of the 180 line-mixing ring unitaries
//     (1/2 for G).
//
// GATES, fixed before the first run.
//  H1 W(F4) has 1,152 elements; a greedy generating set closes at 1,152; the pair orbits under the generators alone
//     number 5 = Burnside's count = the number of inner products
//  H2 exactly 3 of the 5 orbitals take a slot off its line (inner 1, 0, -1)
//  H3 the covariant permutation matrices are exactly I and R (2 of the 31 nonzero 0/1 orbital sums), neither
//     line-mixing
//  H4 the hand-derived table is right: the five 576 E_j are idempotent, pairwise orthogonal, sum to 576 I, carry the
//     tabled eigenvalue of every orbital, and have traces 1, 2, 9, 4, 8 (exact integers)
//  H5 of 7,776 unit choices 216 lie in Z[w][1/2]; 0 of them have an A1 or A-1 coefficient; 180 mix lines and 36 do not;
//     all 216 have mu_1 = mu_2 and mu_4 = mu_5; up to the global phase 36 classes (30 mixing, 6 lock-keeping); and every
//     one of the 216, built as a 24 x 24 matrix, is unitary and commutes with all 1,152 elements (0 failures)
//  H6 the frame phases alpha != 1: exactly one real, exactly one involution, the same (alpha = -1), the least
//     denominator (4 against 8); its coefficients are (3/4, 0, -1/4, 0, -1/4) on (I, A1, A0, A-1, R); it fixes
//     e_r - e_-r on every line and commutes with 2C
//  H7 the rule's piece (code/rule/coined-locked-knit mixBranch) is G: on the 24 single-vibe docks its images are G's
//     columns exactly; applied twice it returns each with amplitude 1; it commutes with the generators on all 24 one-vibe
//     and 276 two-vibe docks; it leaves all 84 docks with two vibes in one frame unchanged; it changes no store
//  H8 controls: (a) NON-COVARIANT: the reflection I - v v^T, v = e_r + e_s (s orthogonal to r), integer and orthogonal,
//     mixes lines and fails to commute with more than half of the 1,152 elements; (b) OUT OF THE RING: I - 2 E_contrast
//     is covariant (0 of 1,152 off) and orthogonal and reaches inner +-1, but a coefficient needs 1/3; (c) the
//     second-quantized lift keeps a full line (|det| = 1) for 0 of the 180 line-mixing ring unitaries
//  Verdict: pass if H1 to H8 hold.
//
// PREDICTIONS: all pass (the theorem). The answer: three linear line-mixing classes, none of them a permutation; in the
// rule's ring only the orthogonal class survives, as a sixth root on each frame's uniform vector, and its one real
// involution G is the canonical mixer. E-SPN-0095 adds G to the working vacuum and measures it.
//
// PRIOR WORK DISCLOSED: a session before this file wrote G into code/rule/coined-locked-knit (mixBranch, mixedVetoBeat)
// and code/measure/occupation-veto-readings (pathMix) with the claim of (3) in a comment; no experiment had run on it.
// H7 checks that code against the algebra here; nothing of it is assumed.
//
// FIRST RUN (2.0 s, tmp/spn94-exp1.log): pass, every gate as predicted, no gate moved. 1,152 elements from 6
// generators; 5 pair orbits by both counts; line-mixing orbitals inner 1, 0, -1; covariant permutations I and R only;
// the table exact (traces 1, 2, 9, 4, 8); 216 of 7,776 unit choices in the ring, 0 reaching inner +-1, 180 mixing
// (30 classes up to phase) and 36 lock-keeping (6), all 216 unitary and covariant; G = (3/4, 0, -1/4, 0, -1/4), the
// one real involution, denominator 4 against 8 for the other four frame phases; mixBranch is G (24 of 24 columns, an
// involution, covariant on 300 of 300 docks, 84 of 84 two-vibe frames untouched); controls: the reflection fails on
// 1,136 of 1,152 elements, I - 2 E_contrast is covariant but needs 1/3, and the second-quantized lift keeps a full line
// for 0 of 180 (G's line block determinant 1/2).
//
// Depth L1: exhaustive exact algebra (integer and Eisenstein matrices, 7,776 unit choices, 1,152 group elements).
// Bulk identities of the dock: they hold on every husk column by holding on every dock.

import { experiment } from '@/test/scaffold/suite'
import { verdict } from '@/test/scaffold/verdict'
import { LINE_OF } from '@/code/rule/isometric-knit'
import { dockOrbitals, eConj, eEq, eMul, eZero, UNITS, weylF4, type Eis } from '@/code/measure/covariant-coin'
import {
  checkEigenspaces,
  covarianceFailures,
  covariantPermutations,
  eNorm,
  framePhaseMu,
  generatorsOf,
  innerOf,
  INNERS,
  isUnitary,
  lineBlockDeterminant,
  multiplyEis,
  ORBITALS,
  pairOrbits,
  ringCoefficient,
  ringMatrix,
  ringUnitaries,
  sameEis,
  scaledIdempotent,
  type Dyadic,
  type EisMatrix,
} from '@/code/measure/line-mixing'
import { FRAME_OF_SLOT, mixBranch } from '@/code/rule/coined-locked-knit'
import { type Branch } from '@/code/rule/doublet-locked-knit'

const OPP = Array.from({ length: 24 }, (_, d) => Array.from({ length: 24 }, (__, e) => e).find(e => innerOf(d, e) === -2) as number)

// a one-dock branch holding vibes (love, open, point 0) on the given slots
function dock(slots: readonly number[], stores = false): Branch {
  const vibe = new Int8Array(24)
  const open = new Uint8Array(24)

  for (const s of slots) {
    vibe[s] = 1
    open[s] = 1
  }

  return { vibe, point: new Int8Array(24), open, store: stores ? new Int8Array(12).fill(1) : new Int8Array(12), spoint: new Int8Array(12), sopen: new Uint8Array(12), a: 1n, b: 0n, k: 0 }
}

// a branch's occupied slots and its amplitude times 2^8, as a key
const slotsOf = (b: Branch): number[] => Array.from(b.vibe, (v, i) => (v !== 0 ? i : -1)).filter(i => i >= 0)
const amp8 = (b: Branch): string => `${b.a * (1n << BigInt(8 - b.k))},${b.b * (1n << BigInt(8 - b.k))}`
const imageKey = (bs: readonly Branch[], g?: readonly number[]): string =>
  bs
    .map(b => `${slotsOf(b)
      .map(s => (g ? (g[s] as number) : s))
      .sort((p, q) => p - q)
      .join('.')}:${amp8(b)}`)
    .sort()
    .join('|')

export default experiment({
  id: 'spin/line-mixing-theorem',
  code: 'E-SPN-0094',
  title:
    "which covariant maps on a dock's slots let a vibe leave its line: three linear classes (inner product 1, 0, -1), none a permutation; in the rule's ring Z[w][1/2] the unitaries reduce to 216, whose line mixing is only to the orthogonal lines of the vibe's frame, a sixth root on each frame's uniform vector, and the one real involution G = I - 2Q (the Grover diffusion on each frame) is the canonical mixer, fixed by the algebra",
  category: 'spin',
  substrates: ['3434'],
  depth: 'L1',
  paper: false,
  run() {
    const started = Date.now()
    const group = weylF4()

    // ---- H1 ----
    const gens = generatorsOf(group)
    const orbitsByGenerators = pairOrbits(gens.generators)
    const burnside = dockOrbitals(group).burnside
    const h1 = group.length === 1152 && gens.closes === 1152 && orbitsByGenerators === 5 && burnside === 5 && INNERS.length === 5

    // ---- H2 ----
    const offLine = ORBITALS.map(A => A.some((row, d) => row.some((v, e) => v === 1 && LINE_OF[d] !== LINE_OF[e])))
    const mixingInners = INNERS.filter((_, k) => offLine[k])
    const h2 = mixingInners.length === 3 && [1, 0, -1].every(v => mixingInners.includes(v as (typeof INNERS)[number]))

    // ---- H3 ----
    const perms = covariantPermutations()
    const h3 = perms.length === 2 && perms.some(p => p.length === 1 && p[0] === 2) && perms.some(p => p.length === 1 && p[0] === -2)

    // ---- H4 ----
    const eig = checkEigenspaces()
    const h4 = eig.idempotent.every(Boolean) && eig.orthogonal && eig.complete && eig.eigenvalues && eig.traces.join(',') === '1,2,9,4,8'

    // ---- H5 ----
    const ring = ringUnitaries()
    const us = ring.unitaries
    const mixing = us.filter(u => u.lineMixing)
    const tiedPairs = us.filter(u => eEq(u.mu[0] as Eis, u.mu[1] as Eis) && eEq(u.mu[3] as Eis, u.mu[4] as Eis)).length
    // up to the global phase: fix mu_3 (the even rest) to 1
    const classes = us.filter(u => u.units[2] === 0)
    let unitaryCount = 0
    let covariantCount = 0

    for (const u of us) {
      const m = ringMatrix(u.coefficients)

      if (isUnitary(m)) unitaryCount++
      if (covarianceFailures(group, (d, e) => (m.entries[d] as Eis[])[e] as Eis) === 0) covariantCount++
    }

    const h5 = ring.tried === 7776 && us.length === 216 && us.filter(u => u.reachesInnerOne).length === 0 && mixing.length === 180 && us.length - mixing.length === 36 && tiedPairs === 216 && classes.length === 36 && classes.filter(u => u.lineMixing).length === 30 && unitaryCount === 216 && covariantCount === 216

    // ---- H6 ----
    const phases = UNITS.filter(u => u.sixths !== 0).map(u => {
      const mu = framePhaseMu(u.value)
      const coefficients = [0, 1, 2, 3, 4].map(k => ringCoefficient(mu, k)) as Dyadic[]
      const m = ringMatrix(coefficients)
      const square = multiplyEis(m, m)
      const identity: EisMatrix = { entries: Array.from({ length: 24 }, (_, i) => Array.from({ length: 24 }, (__, j) => [i === j ? 1 : 0, 0] as Eis)), p: 0 }

      return { name: u.name, alpha: u.value, coefficients, matrix: m, real: coefficients.every(c => c.num[1] === 0), involution: sameEis(square, identity), denominator: Math.max(...coefficients.map(c => c.p)) }
    })
    const reals = phases.filter(p => p.real)
    const involutions = phases.filter(p => p.involution)
    const G = phases.find(p => eEq(p.alpha, [-1, 0]))!
    const least = Math.min(...phases.map(p => p.denominator))
    const gWant = [
      [3, 2],
      [0, 0],
      [-1, 2],
      [0, 0],
      [-1, 2],
    ]
    const gCoefficientsRight = G.coefficients.every((c, k) => (eZero(c.num) ? gWant[k]![0] === 0 : c.num[0] === gWant[k]![0] && c.num[1] === 0 && c.p === gWant[k]![1]))
    // G on e_r - e_-r, every line
    let fixesMinus = true

    for (let d = 0; d < 24; d++) {
      const e = OPP[d] as number

      for (let i = 0; i < 24; i++) {
        const gi = G.matrix.entries[i] as Eis[]
        const v: Eis = [(gi[d] as Eis)[0] - (gi[e] as Eis)[0], (gi[d] as Eis)[1] - (gi[e] as Eis)[1]]
        const want = (i === d ? 1 : i === e ? -1 : 0) * 2 ** G.matrix.p

        if (!eEq(v, [want, 0])) fixesMinus = false
      }
    }

    // the coin 2C on the dock: (1 + w) on the diagonal, (1 - w) at the opposite slot, 0 elsewhere
    const coin: EisMatrix = { entries: Array.from({ length: 24 }, (_, i) => Array.from({ length: 24 }, (__, j) => (i === j ? ([1, 1] as Eis) : j === OPP[i] ? ([1, -1] as Eis) : ([0, 0] as Eis)))), p: 1 }
    const commutesCoin = sameEis(multiplyEis(G.matrix, coin), multiplyEis(coin, G.matrix))
    const h6 = phases.length === 5 && reals.length === 1 && involutions.length === 1 && reals[0] === G && involutions[0] === G && G.denominator === least && phases.filter(p => p.denominator === least).length === 1 && gCoefficientsRight && fixesMinus && commutesCoin

    // ---- H7: the rule's piece ----
    let columnsRight = 0
    let involutive = 0

    for (let s = 0; s < 24; s++) {
      const out = mixBranch(1, dock([s]))
      let right = out.length === 8

      for (const b of out) {
        const [to] = slotsOf(b)
        const want = to === s ? 3 : FRAME_OF_SLOT[to as number] === FRAME_OF_SLOT[s] ? -1 : 0
        const g4 = (G.matrix.entries[to as number] as Eis[])[s] as Eis

        right = right && b.b === 0n && b.a * 4n === BigInt(want) * (1n << BigInt(b.k)) && g4[1] === 0 && g4[0] * 4 === want * 2 ** G.matrix.p
      }

      if (right) columnsRight++

      // twice, merged by configuration
      const twice = new Map<string, bigint>()

      for (const b of out) {
        for (const c of mixBranch(1, b)) {
          const key = slotsOf(c).join('.')

          twice.set(key, (twice.get(key) ?? 0n) + c.a * (1n << BigInt(8 - c.k)))
        }
      }

      const nonzero = [...twice].filter(([, v]) => v !== 0n)

      if (nonzero.length === 1 && nonzero[0]![0] === String(s) && nonzero[0]![1] === 256n) involutive++
    }

    const docks: number[][] = []

    for (let s = 0; s < 24; s++) docks.push([s])
    for (let s = 0; s < 24; s++) for (let t = s + 1; t < 24; t++) docks.push([s, t])

    let covariantDocks = 0

    for (const slots of docks) {
      const mixed = mixBranch(1, dock(slots))
      let ok = true

      for (const g of gens.generators) {
        if (!ok) break
        ok = imageKey(mixed, g) === imageKey(mixBranch(1, dock(slots.map(s => g[s] as number))))
      }

      if (ok) covariantDocks++
    }

    const sameFrame = docks.filter(d => d.length === 2 && FRAME_OF_SLOT[d[0]!] === FRAME_OF_SLOT[d[1]!])
    const untouched = sameFrame.filter(d => {
      const out = mixBranch(1, dock(d))

      return out.length === 1 && out[0]!.a === 1n && out[0]!.b === 0n && out[0]!.k === 0 && slotsOf(out[0]!).join('.') === d.join('.')
    }).length
    let storesKept = 0

    for (let s = 0; s < 24; s++) if (mixBranch(1, dock([s], true)).every(b => b.store.every(v => v === 1))) storesKept++

    const h7 = columnsRight === 24 && involutive === 24 && covariantDocks === docks.length && docks.length === 300 && sameFrame.length === 84 && untouched === 84 && storesKept === 24

    // ---- H8: controls ----
    // (a) the reflection through e_r + e_s
    const r = 0
    const s = Array.from({ length: 24 }, (_, e) => e).find(e => innerOf(r, e) === 0) as number
    const house = (d: number, e: number): Eis => [(d === e ? 1 : 0) - ((d === r || d === s) && (e === r || e === s) ? 1 : 0), 0]
    let houseOrthogonal = true

    for (let i = 0; i < 24; i++) {
      for (let j = 0; j < 24; j++) {
        let v = 0

        for (let k = 0; k < 24; k++) v += house(i, k)[0] * house(j, k)[0]

        if (v !== (i === j ? 1 : 0)) houseOrthogonal = false
      }
    }

    const houseMixes = house(s, r)[0] !== 0 && LINE_OF[s] !== LINE_OF[r]
    const houseFailures = covarianceFailures(group, house)
    const c8a = houseOrthogonal && houseMixes && houseFailures > 576

    // (b) I - 2 E_contrast
    const e1 = scaledIdempotent(1)
    const contrast = (d: number, e: number): Eis => [(d === e ? 576 : 0) - 2 * ((e1[d] as number[])[e] as number), 0]
    let contrastOrthogonal = true

    for (let i = 0; i < 24; i++) {
      for (let j = 0; j < 24; j++) {
        let v = 0

        for (let k = 0; k < 24; k++) v += contrast(i, k)[0] * contrast(j, k)[0]

        if (v !== (i === j ? 576 * 576 : 0)) contrastOrthogonal = false
      }
    }

    const contrastFailures = covarianceFailures(group, contrast)
    const innerOnePair = Array.from({ length: 24 }, (_, e) => e).find(e => innerOf(0, e) === 1) as number
    const contrastReaches = contrast(0, innerOnePair)[0] !== 0
    const contrastMu: Eis[] = [
      [1, 0],
      [-1, 0],
      [1, 0],
      [1, 0],
      [1, 0],
    ]
    const contrastOutOfRing = [0, 1, 2, 3, 4].some(k => ringCoefficient(contrastMu, k) === undefined)
    const c8b = contrastFailures === 0 && contrastOrthogonal && contrastReaches && contrastOutOfRing

    // (c) the second-quantized lift on a full line
    const fullKept = mixing.filter(u => {
      const m = ringMatrix(u.coefficients)

      return eNorm(lineBlockDeterminant(m, 0)) === 16 ** m.p
    }).length
    const gDet = lineBlockDeterminant(G.matrix, 0)
    const c8c = fullKept === 0

    const h8 = c8a && c8b && c8c

    const ok = h1 && h2 && h3 && h4 && h5 && h6 && h7 && h8
    const fmt = (c: Dyadic): string => (eZero(c.num) ? '0' : `${c.num[1] === 0 ? c.num[0] : `(${c.num[0]} + ${c.num[1]}w)`}/${2 ** c.p}`)

    return verdict({
      status: ok ? 'pass' : 'fail',
      claim: `W(F4) (${group.length}, generated by ${gens.generators.length}) has a ${orbitsByGenerators}-dimensional dock commutant (Burnside ${burnside}); ${mixingInners.length} orbitals take a slot off its line (inner ${mixingInners.join(', ')}), so there are 3 independent line-mixing covariant maps, and the only covariant permutations are ${perms.map(p => (p[0] === 2 ? 'I' : 'R')).join(' and ')}: no permutation mixes lines; the table's five idempotents are exact (traces ${eig.traces.join(', ')}); of ${ring.tried.toLocaleString('en-US')} unit choices ${us.length} give unitaries in Z[w][1/2] (all unitary and covariant, 0 failures), ${us.filter(u => u.reachesInnerOne).length} reach inner +-1, ${mixing.length} mix lines through A0 alone (${classes.filter(u => u.lineMixing).length} classes up to phase, beside the ${classes.filter(u => !u.lineMixing).length} lock-keeping coins): a vibe can leave its line only for the orthogonal lines of its frame; the line mixing is one sixth root on each frame's uniform vector, and its one real involution G = (${G.coefficients.map(fmt).join(', ')}) on (I, A1, A0, A-1, R) (the Grover diffusion on each frame, denominator ${2 ** G.denominator}, the others ${phases.filter(p => p !== G).map(p => 2 ** p.denominator).join(', ')}) fixes e_r - e_-r and commutes with 2C; the rule's mixBranch is G on ${columnsRight} of 24 columns, an involution, covariant on ${covariantDocks} of ${docks.length} docks, and leaves ${untouched} of ${sameFrame.length} two-vibe frames and every store alone; controls: a non-covariant reflection fails on ${houseFailures} of 1,152 elements, I - 2E_contrast is covariant and reaches inner +-1 but needs 1/3, and the second-quantized lift keeps a full line for ${fullKept} of ${mixing.length} (G: |det|^2 = ${eNorm(gDet)}/${16 ** G.matrix.p})`,
      metrics: {
        gate_H1: h1 ? 1 : 0,
        gate_H2: h2 ? 1 : 0,
        gate_H3: h3 ? 1 : 0,
        gate_H4: h4 ? 1 : 0,
        gate_H5: h5 ? 1 : 0,
        gate_H6: h6 ? 1 : 0,
        gate_H7: h7 ? 1 : 0,
        gate_H8: h8 ? 1 : 0,
        groupOrder: group.length,
        generators: gens.generators.length,
        commutantByGenerators: orbitsByGenerators,
        commutantBurnside: burnside,
        lineMixingClasses: mixingInners.length,
        covariantPermutations: perms.length,
        unitChoices: ring.tried,
        ringUnitaries: us.length,
        ringReachingInnerOne: us.filter(u => u.reachesInnerOne).length,
        ringLineMixing: mixing.length,
        ringClassesUpToPhase: classes.length,
        ringMixingClassesUpToPhase: classes.filter(u => u.lineMixing).length,
        ringUnitaryChecked: unitaryCount,
        ringCovariantChecked: covariantCount,
        framePhasesReal: reals.length,
        framePhasesInvolution: involutions.length,
        mixColumnsRight: columnsRight,
        mixInvolutive: involutive,
        mixCovariantDocks: covariantDocks,
        mixUntouchedFrames: untouched,
        controlHouseFailures: houseFailures,
        controlContrastFailures: contrastFailures,
        controlFullLineKept: fullKept,
        seconds: (Date.now() - started) / 1000,
      },
      control: {
        houseFailures,
        contrastFailures,
        contrastOutOfRing: contrastOutOfRing ? 1 : 0,
      },
      notes: `L1. Gates H1 ${h1}, H2 ${h2}, H3 ${h3}, H4 ${h4}, H5 ${h5}, H6 ${h6}, H7 ${h7}, H8 ${h8} (a ${c8a}, b ${c8b}, c ${c8c}). Eigenspace checks: idempotent ${eig.idempotent.join(',')}, orthogonal ${eig.orthogonal}, complete ${eig.complete}, eigenvalues ${eig.eigenvalues}. Covariant permutations (orbital sets): ${JSON.stringify(perms)}. Ring unitaries with mu_1 = mu_2 and mu_4 = mu_5: ${tiedPairs} of ${us.length}. Frame phases alpha (real, involution, denominator; coefficients on I, A1, A0, A-1, R): ${phases.map(p => `${p.name}: ${p.real}, ${p.involution}, ${2 ** p.denominator}; ${p.coefficients.map(fmt).join(' ')}`).join(' | ')}. G fixes e_r - e_-r: ${fixesMinus}; commutes with 2C: ${commutesCoin}. Line block determinant of G on a full line: ${gDet.join(' + ')}w over ${16 ** G.matrix.p}. The conj of a unit is its inverse: ${UNITS.every(u => eEq(eMul(u.value, eConj(u.value)), [1, 0]))}.`,
    })
  },
})
