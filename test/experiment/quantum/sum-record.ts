// A SUM record: the qutrit SUM gate as a move between two slots, and as a measurement of a role.
//
// E-QTM-0114 and E-QTM-0116 found the model has no rule that reads a role without writing one: every
// coupling it has is the fear beat, a partial swap that commutes with no local observable. The candidate is
// SUM, |a>|b> -> |a>|a + b>, which E-QTM-0118 places inside the two-role Clifford group. Its grid action is
// not assumed: code/measure/sum-record reads it off SUM's Wigner kernel (the kernel every meeting of the
// fear weave is built from). The first run of the probe gave, in (role, tilt) per token,
//
//   (a1, b1), (a2, b2)  ->  (a1, b1 - b2), (a1 + a2, b2)
//
// so the record's role gains the system's role (the copy), and the system's tilt loses the record's tilt
// (the back-action, the dual SUM (x, y) -> (x - y, y) on the tilt). A permutation of the joint points, so a
// knot's loves and fears ride along unchanged.
//
// THE MEASUREMENT. The system is token A of each of the six Bell histories (code/measure/knot-histories),
// at every one of 480 beats, read in the physical convention (sum-record's physicalFrame, which reads the
// whole's per-coordinate frames of E-QTM-0123). The record is a fresh token
// opened on role line 0 (the points 0, 1, 2: the role-0 stabilizer state). SUM acts with A as control.
//
// Gates, fixed before the first run:
//   G1 the instrument: SUM's kernel is a 0/1 permutation of the 81 joint points, affine and symplectic;
//      the full-point copy (p1, p1 + p2), which a Z3^2 flux on a link would make, is affine and NOT
//      symplectic (so it is no quantum gate).
//   G2 the copy: on all 27 enumerated classical starts (A on each of 9 points, the record on each point of
//      role line 0) the record's role after equals A's role, and A's role is unchanged; on every state the
//      joint (A role, record role) weight is 0 off the diagonal.
//   G3 reads without writing: A's role distribution and partner B's whole marginal are unchanged exactly on
//      every state.
//   G4 erases coherence: after SUM, A's weight is flat along the tilt, 3 W(a, b) = P(a) at every point, on
//      every state, so the tilt reads exactly uniform.
//   G5 records agree: a second SUM record of A agrees with the first, (record 1 role, record 2 role) weight 0
//      off the diagonal on every state, and on all 81 enumerated classical starts.
//   G6 every line class: SUM conjugated by a determinant-1 map S that turns a class into the role lines
//      reads that class, the record's role distribution equal to A's line sums of the class exactly on
//      every state, and A's line sums of that class unchanged, for all 4 classes.
//   G7 a move of the knit: SUM^3 is the identity on the 81 points (the backward beat applies SUM^2), and it
//      keeps the loves and the fears of every whole it acts on.
//   G8 the flow is a SUM: on the color weave (side-3 D4 box, a golden Weyl fill of loves and fears), every
//      slot and beat, the flow's change equals the vibe the stream copied across the link, (v, F) ->
//      (v, F + v), whose reduction mod 3 is the classical permutation of SUM; 0 mismatches.
// Controls, which must give NO:
//   C1 a record opened on a tilt line (0, 3, 6) learns nothing: A's whole marginal is unchanged and the
//      record's role is uniform on every state.
//   C2 the model's own record (E-QTM-0116: a fear-beat meeting with the same fresh token) disagrees with A's
//      role, or changes A's role distribution, on at least one state.
//   C3 complementary records do not agree: after a role record, a tilt record reads uniform.
// Reported, with predictions written before the run:
//   - frame covariance: of the 216 grid moves g, the number with (g x g) SUM = SUM (g x g) on the 81 points.
//     Predicted 2 (the identity and -1): a record of the role picks the role axis, which a frame change moves.
//   - the commutant of {C x C} over Sigma(648)'s generators, and of {C x C*}, by exact linear algebra in
//     floating point. Predicted dimension 2 each (span{1, SWAP}, span{1, P_Phi}): a meeting that commutes
//     with every frame change is then U(phi) = P_sym + e^(i phi) P_anti up to a phase, and one that also
//     commutes with a token's role is the identity. The fear beat cannot read without writing, by symmetry.
//   - the color content Q of the dock (code/rule/color-weave cellColor) under SUM between two slots: over
//     every pair of point pairs and signs, how often it changes. Predicted: nearly always, since copying the
//     role adds the system's role to the record's slot (Q counts role points).
//   - the center flux of code/rule/center-links changes by -v at a hop (line 198), the vibe and never the
//     role point: it records the vibe mod 3, not the role (a code reading, stated).
//
// FIRST RUN (2026-09-26, 2.8 s): every gate and control as fixed, every prediction held. 2,880 states, 1,208
// with a fear on token A and 1,813 with a non-uniform tilt before the record: copy, reads-without-writing,
// flatness, agreement and all 4 class readers at 0 mismatches. The model's own record disagrees with or
// writes A's role on 2,843 of 2,880. Frame covariance: 2 of 216 grid moves commute with SUM (identity and
// -1, as predicted: SUM(s, s) = (s, s) forces no shift, and commuting with the copy forces a diagonal
// linear part). Commutants: dimension 2 for C x C and 2 for C x C* over Sigma(648), so the only meetings
// that commute with every frame change are U(phi) (and the singlet phase), and ||[U(2 pi / 3), Z x 1]|| =
// 3.674: the fear beat moves every role. Color: SUM changes the dock's color content in 288 of 324 cases,
// exactly the ones with a1 != 0 or b2 != 0, since dQ = w2 (a1, 0) + w1 (0, -b2). Flow: 93,312 slot-beats,
// 0 mismatches, all 9 residue pairs seen.
// SECOND RUN (same day, 2.8 s), after the shared fear weave changed under this session (E-QTM-0123 frames,
// E-QTM-0124 grid-move convention) and the physical reading moved to sum-record's physicalFrame: every
// number above repeats exactly. No gate was changed.
//
// Depth L2 (a known gate, SUM, placed on the knit's grid and its measurement read exactly). The husk is not
// read: SUM acts on roles, never on where a vibe is, so every number is a role-grid number; the flow check
// G8 runs on the bulk D4 box, the substrate, and is a statement about the substrate's link variable.

import { experiment } from '@/test/scaffold/suite'
import { verdict } from '@/test/scaffold/verdict'
import { meetWhole, meetingKernel, swapPhase, wholeLovesAndFears, type Whole } from '@/code/rule/fear-weave'
import { makeColorWeave, colorBeat } from '@/code/rule/color-weave'
import { gridMoves } from '@/code/rule/vibe-weave'
import { advanceKnot, bellHistories, lineKnot } from '@/code/measure/knot-histories'
import {
  LINE_CLASSES,
  lineSums,
  marginalOne,
  openToken,
  permuteTwo,
  physicalFrame,
  pointVector,
  readerPermutation,
  sumPermutation,
  symplecticCheck,
  traceOut,
} from '@/code/measure/sum-record'
import { operatorFrom3 } from '@/code/measure/qutrit-clifford'
import { tensorOperators, type Operator } from '@/code/measure/grid-weights'
import { SU3_SUBGROUPS } from '@/code/algebra/group/su3-subgroups'
import { GOLDEN, SILVER } from '@/code/tool/weyl'

const BEATS = 480
const FLOW_BEATS = 48
const OMEGA = (2 * Math.PI) / 3
const ROLE_LINE_0 = [0, 1, 2]
const TILT_LINE_0 = [0, 3, 6]
const RANK_TOLERANCE = 1e-9

const frac = (x: number): number => x - Math.floor(x)
const roleOf = (p: number): number => Math.floor(p / 3)
const same = (a: readonly bigint[], b: readonly bigint[]): boolean => a.length === b.length && a.every((x, i) => x === b[i])
const roleShares = (m: readonly bigint[]): bigint[] => [0, 1, 2].map(a => (m[3 * a] ?? 0n) + (m[3 * a + 1] ?? 0n) + (m[3 * a + 2] ?? 0n))

// the joint (coordinate c role, coordinate d role) weights, 9 entries, index 3 role_c + role_d
function jointRoles(w: Whole, c: number, d: number): bigint[] {
  const k = w.tokens.length
  const sc = 9 ** (k - 1 - c)
  const sd = 9 ** (k - 1 - d)
  const out = new Array<bigint>(9).fill(0n)

  w.weight.forEach((x, i) => {
    const j = 3 * roleOf(Math.floor(i / sc) % 9) + roleOf(Math.floor(i / sd) % 9)

    out[j] = (out[j] ?? 0n) + x
  })

  return out
}

const offDiagonalZero = (j: readonly bigint[]): boolean => j.every((x, i) => Math.floor(i / 3) === i % 3 || x === 0n)

// the real dimension of the solution space of G X = X G for every G, X a complex n x n matrix, by rank
function commutantDimension(generators: readonly Operator[]): number {
  const n = generators[0]?.n ?? 1
  const unknowns = 2 * n * n
  const rows: number[][] = []

  for (const g of generators) {
    // the columns: the image G E - E G of each real basis element E (E_ij and i E_ij)
    const columns: number[][] = []

    for (let u = 0; u < unknowns; u++) {
      const ij = Math.floor(u / 2)
      const imaginary = u % 2 === 1
      const i = Math.floor(ij / n)
      const j = ij % n
      const re = new Float64Array(n * n)
      const im = new Float64Array(n * n)

      // (G E)_rk = G_ri E_ik: nonzero only at k = j; (E G)_rk = E_rj G_jk: nonzero only at r = i
      for (let r = 0; r < n; r++) {
        const gr = g.re[r * n + i] ?? 0
        const gi = g.im[r * n + i] ?? 0

        re[r * n + j] = (re[r * n + j] ?? 0) + (imaginary ? -gi : gr)
        im[r * n + j] = (im[r * n + j] ?? 0) + (imaginary ? gr : gi)
      }

      for (let k = 0; k < n; k++) {
        const gr = g.re[j * n + k] ?? 0
        const gi = g.im[j * n + k] ?? 0

        re[i * n + k] = (re[i * n + k] ?? 0) - (imaginary ? -gi : gr)
        im[i * n + k] = (im[i * n + k] ?? 0) - (imaginary ? gr : gi)
      }

      columns.push([...re, ...im])
    }

    for (let r = 0; r < 2 * n * n; r++) {
      rows.push(columns.map(c => c[r] ?? 0))
    }
  }

  // rank by Gaussian elimination with partial pivoting
  let rank = 0

  for (let col = 0; col < unknowns && rank < rows.length; col++) {
    let pivot = rank

    for (let r = rank + 1; r < rows.length; r++) {
      if (Math.abs(rows[r]?.[col] ?? 0) > Math.abs(rows[pivot]?.[col] ?? 0)) {
        pivot = r
      }
    }

    if (Math.abs(rows[pivot]?.[col] ?? 0) < RANK_TOLERANCE) {
      continue
    }

    ;[rows[rank], rows[pivot]] = [rows[pivot]!, rows[rank]!]

    const top = rows[rank]!

    for (let r = rank + 1; r < rows.length; r++) {
      const row = rows[r]!
      const f = (row[col] ?? 0) / (top[col] ?? 1)

      if (f !== 0) {
        for (let c = col; c < unknowns; c++) {
          row[c] = (row[c] ?? 0) - f * (top[c] ?? 0)
        }
      }
    }

    rank++
  }

  return unknowns - rank
}

export default experiment({
  id: 'quantum/sum-record',
  code: 'E-QTM-0127',
  title:
    'a SUM record: the qutrit SUM, read off its own Wigner kernel as a symplectic permutation of the joint grid, copies a role into a fresh token exactly, leaves the role distribution and the partner untouched, erases the tilt, agrees with a second record, and reads any line class when conjugated; the knit\'s own flow update is SUM on the vibe, but no frame-covariant meeting can read a role',
  category: 'quantum',
  substrates: ['3434'],
  depth: 'L2',
  paper: false,
  run() {
    const sum = sumPermutation()
    const sumCheck = symplecticCheck(sum)
    const fullCopy = Int16Array.from({ length: 81 }, (_, j) => {
      const [a1, b1] = pointVector(Math.floor(j / 9))
      const [a2, b2] = pointVector(j % 9)

      return 9 * Math.floor(j / 9) + 3 * ((a1 + a2) % 3) + ((b1 + b2) % 3)
    })
    const fullCheck = symplecticCheck(fullCopy)

    // G2 and G5 on the classical starts
    let classicalCopyBad = 0
    let classicalAgreeBad = 0

    for (let x = 0; x < 9; x++) {
      for (const r of ROLE_LINE_0) {
        const image = sum[9 * x + r] ?? 0

        classicalCopyBad += roleOf(image % 9) === roleOf(x) && roleOf(Math.floor(image / 9)) === roleOf(x) ? 0 : 1

        for (const r2 of ROLE_LINE_0) {
          const second = sum[9 * Math.floor(image / 9) + r2] ?? 0

          classicalAgreeBad += roleOf(second % 9) === roleOf(image % 9) ? 0 : 1
        }
      }
    }

    // G7: SUM^3 = 1
    const cubeIsIdentity = Array.from({ length: 81 }, (_, j) => sum[sum[sum[j] ?? 0] ?? 0]).every((v, j) => v === j)

    const readers = LINE_CLASSES.map(c => ({ c, ...readerPermutation(c.direction) }))
    const readersSymplectic = readers.every(r => symplecticCheck(r.perm).symplectic)
    const tiltReader = readers.find(r => r.c.name === 'tilt')!
    const modelKernel = meetingKernel(swapPhase(OMEGA)) ?? []

    const counts = {
      states: 0,
      statesWithFearOnA: 0,
      statesWithNonUniformTiltBefore: 0,
      copyBad: 0,
      readsBad: 0,
      flatBad: 0,
      agreeBad: 0,
      classBad: 0,
      lovesFearsBad: 0,
      tiltRecordLearned: 0,
      tiltRecordDisturbed: 0,
      modelRecordDisagrees: 0,
      modelRecordWrites: 0,
      complementaryAgree: 0,
    }

    for (const h of bellHistories(BEATS)) {
      let w: Whole = lineKnot(h.tokens, [0, 1, 2].map(k => 3 * (h.start[0] ?? 0) + k), [0, 1, 2].map(k => 3 * (h.start[1] ?? 0) + k))

      for (const record of h.records) {
        w = advanceKnot(h, w, record)

        const state = physicalFrame(w, h.conjugated)
        // opening a token on 3 points triples the units, so every before is read times 3
        const beforeA = marginalOne(state, 0).map(x => 3n * x)
        const beforeB = marginalOne(state, 1).map(x => 3n * x)
        const tiltBefore = [0, 1, 2].map(b => (beforeA[b] ?? 0n) + (beforeA[3 + b] ?? 0n) + (beforeA[6 + b] ?? 0n))

        counts.states++
        counts.statesWithFearOnA += beforeA.some(x => x < 0n) ? 1 : 0
        counts.statesWithNonUniformTiltBefore += tiltBefore.every(x => x === tiltBefore[0]) ? 0 : 1

        // the role record
        const measured = permuteTwo(openToken(state, -1, ROLE_LINE_0), 0, 2, sum)
        const afterA = marginalOne(measured, 0)
        const afterB = marginalOne(measured, 1)
        const pa = roleShares(afterA)
        const { loves: l0, fears: f0 } = wholeLovesAndFears(openToken(state, -1, ROLE_LINE_0))
        const { loves: l1, fears: f1 } = wholeLovesAndFears(measured)

        counts.lovesFearsBad += l0 === l1 && f0 === f1 ? 0 : 1
        counts.copyBad += offDiagonalZero(jointRoles(measured, 0, 2)) ? 0 : 1
        counts.readsBad += same(roleShares(beforeA), pa) && same(beforeB, afterB) ? 0 : 1
        counts.flatBad += afterA.every((x, p) => 3n * x === (pa[roleOf(p)] ?? 0n)) ? 0 : 1

        // a second record of A, on A's reduced whole
        const alone = traceOut(state, 1)
        const twice = permuteTwo(openToken(permuteTwo(openToken(alone, -1, ROLE_LINE_0), 0, 1, sum), -2, ROLE_LINE_0), 0, 2, sum)

        counts.agreeBad += offDiagonalZero(jointRoles(twice, 1, 2)) ? 0 : 1

        // every line class
        for (const r of readers) {
          const read = permuteTwo(openToken(alone, -1, ROLE_LINE_0), 0, 1, r.perm)
          const recordRoles = roleShares(marginalOne(read, 1))
          const byLabel = [0, 1, 2].map(k => beforeA.reduce((s, x, p) => (r.label[p] === k ? s + x : s), 0n))
          const keeps = same(lineSums(marginalOne(read, 0), r.c), lineSums(beforeA, r.c))

          counts.classBad += same(recordRoles, byLabel) && keeps ? 0 : 1
        }

        // C1: a record on a tilt line
        const tiltRecord = permuteTwo(openToken(alone, -1, TILT_LINE_0), 0, 1, sum)
        const tiltRoles = roleShares(marginalOne(tiltRecord, 1))

        counts.tiltRecordDisturbed += same(marginalOne(tiltRecord, 0), beforeA) ? 0 : 1
        counts.tiltRecordLearned += tiltRoles.every(x => x === tiltRoles[0]) ? 0 : 1

        // C2: the model's own record, the fear beat with the same fresh token
        const met = meetWhole({ whole: openToken(alone, -1, ROLE_LINE_0), a: 0, b: 1, kernel4: modelKernel, divisor: 4, fixed: false })!
        const metRoles = roleShares(marginalOne(met, 0))
        const scale = (xs: readonly bigint[]): bigint => xs.reduce((s, x) => s + x, 0n)

        counts.modelRecordDisagrees += offDiagonalZero(jointRoles(met, 0, 1)) ? 0 : 1
        counts.modelRecordWrites += roleShares(beforeA).every((x, a) => x * scale(metRoles) === (metRoles[a] ?? 0n) * scale(roleShares(beforeA))) ? 0 : 1

        // C3: a role record, then a tilt record of A
        const both = permuteTwo(openToken(permuteTwo(openToken(alone, -1, ROLE_LINE_0), 0, 1, sum), -2, ROLE_LINE_0), 0, 2, tiltReader.perm)

        counts.complementaryAgree += offDiagonalZero(jointRoles(both, 1, 2)) ? 1 : 0
      }
    }

    // frame covariance on the grid: g x g commuting with SUM
    const moves = gridMoves()
    const covariantMoves = moves.act.filter(g => {
      for (let j = 0; j < 81; j++) {
        const moved = 9 * (g[Math.floor(j / 9)] ?? 0) + (g[j % 9] ?? 0)
        const image = sum[j] ?? 0

        if ((sum[moved] ?? 0) !== 9 * (g[Math.floor(image / 9)] ?? 0) + (g[image % 9] ?? 0)) {
          return false
        }
      }

      return true
    }).length

    // the commutants of the frame changes on two roles, love-love and love-fear
    const frames = SU3_SUBGROUPS.sigma648.generators.map(operatorFrom3)
    const conjugateOf = (c: Operator): Operator => ({ n: c.n, re: Float64Array.from(c.re), im: Float64Array.from(c.im, x => -x) })
    const likeCommutant = commutantDimension(frames.map(c => tensorOperators(c, c))) / 2
    const unlikeCommutant = commutantDimension(frames.map(c => tensorOperators(c, conjugateOf(c)))) / 2

    // the fear beat against a token's role: || [U, Z x 1] ||, Z = diag(1, omega, omega^2), at the model's angle
    const u = swapPhase(OMEGA)
    const zRe = [1, Math.cos(OMEGA), Math.cos(2 * OMEGA)]
    const zIm = [0, Math.sin(OMEGA), Math.sin(2 * OMEGA)]
    let commutatorSquared = 0

    for (let r = 0; r < 9; r++) {
      for (let c = 0; c < 9; c++) {
        // (U Z)_rc - (Z U)_rc = U_rc (z_c - z_r), z indexed by the first role
        const ur = u.re[r * 9 + c] ?? 0
        const ui = u.im[r * 9 + c] ?? 0
        const dr = (zRe[Math.floor(c / 3)] ?? 0) - (zRe[Math.floor(r / 3)] ?? 0)
        const di = (zIm[Math.floor(c / 3)] ?? 0) - (zIm[Math.floor(r / 3)] ?? 0)

        commutatorSquared += (ur * dr - ui * di) ** 2 + (ur * di + ui * dr) ** 2
      }
    }

    // the dock's color content Q = w1 p1 + w2 p2 (each component mod 3) under SUM, over signs and points
    let colorCases = 0
    let colorChanged = 0

    for (const w1 of [-1, 1]) {
      for (const w2 of [-1, 1]) {
        for (let j = 0; j < 81; j++) {
          const image = sum[j] ?? 0
          const q = (x: number, y: number): string => {
            const [a1, b1] = pointVector(x)
            const [a2, b2] = pointVector(y)

            return `${(((w1 * a1 + w2 * a2) % 3) + 3) % 3},${(((w1 * b1 + w2 * b2) % 3) + 3) % 3}`
          }

          colorCases++
          colorChanged += q(Math.floor(j / 9), j % 9) === q(Math.floor(image / 9), image % 9) ? 0 : 1
        }
      }
    }

    // G8: the flow update on the color weave is SUM on (copied vibe, flow)
    const weave = makeColorWeave({ side: 3, table: 'bind' })
    const slots = weave.mesh.cellCount * 24
    let state = {
      vibe: Int8Array.from({ length: slots }, (_, i) => (frac((i + 1) * GOLDEN) < 0.25 ? (frac((i + 1) * SILVER) < 0.5 ? 1 : -1) : 0)),
      role: Int8Array.from({ length: slots }, (_, i) => Math.floor(9 * frac((i + 3) * GOLDEN))),
      flow: new Int32Array(slots),
    }
    let flowChecks = 0
    let flowBad = 0
    const flowPairs = new Set<number>()

    for (let t = 0; t < FLOW_BEATS; t++) {
      const next = colorBeat(weave, state, t)

      for (let x = 0; x < weave.mesh.cellCount; x++) {
        for (let d = 0; d < 24; d++) {
          const slot = x * 24 + d
          const copied = next.vibe[weave.mesh.neighbour(x, d) * 24 + d] ?? 0
          const before = state.flow[slot] ?? 0

          flowChecks++
          flowBad += (next.flow[slot] ?? 0) === before + copied ? 0 : 1
          flowPairs.add(3 * (((copied % 3) + 3) % 3) + (((before % 3) + 3) % 3))
        }
      }

      state = next
    }

    const gates = {
      G1: sumCheck.symplectic && !fullCheck.symplectic && fullCheck.affine,
      G2: classicalCopyBad === 0 && counts.copyBad === 0,
      G3: counts.readsBad === 0,
      G4: counts.flatBad === 0,
      G5: classicalAgreeBad === 0 && counts.agreeBad === 0,
      G6: readersSymplectic && counts.classBad === 0,
      G7: cubeIsIdentity && counts.lovesFearsBad === 0,
      G8: flowChecks > 0 && flowBad === 0,
      C1: counts.tiltRecordDisturbed === 0 && counts.tiltRecordLearned === 0,
      C2: counts.modelRecordDisagrees + counts.modelRecordWrites > 0,
      C3: counts.complementaryAgree < counts.states,
    }
    const ok = Object.values(gates).every(Boolean)

    return verdict({
      status: ok ? 'pass' : 'fail',
      claim:
        'SUM, read off its own Wigner kernel as the symplectic permutation (a1, b1), (a2, b2) -> (a1, b1 - b2), (a1 + a2, b2), is a von Neumann measurement of the role on every state six Bell histories reach: the record copies the role exactly, the role distribution and the partner are untouched, the tilt is erased to exactly uniform, a second record always agrees, and conjugated by a determinant-1 map it reads any of the 4 line classes as that class\'s line sums; the color weave\'s own flow update is SUM with the copied vibe as control, but it reads the vibe, and no meeting that commutes with every frame change can read a role',
      metrics: {
        ...counts,
        classicalCopyBad,
        classicalAgreeBad,
        fullPointCopyAffine: fullCheck.affine ? 1 : 0,
        fullPointCopySymplectic: fullCheck.symplectic ? 1 : 0,
        covariantMovesOf216: covariantMoves,
        likeCommutantDimension: likeCommutant,
        unlikeCommutantDimension: unlikeCommutant,
        fearBeatRoleCommutatorNorm: Math.sqrt(commutatorSquared),
        colorCases,
        colorChangedBySum: colorChanged,
        flowChecks,
        flowMismatches: flowBad,
        flowResiduePairsSeenOf9: flowPairs.size,
        ...Object.fromEntries(Object.entries(gates).map(([k, v]) => [`gate_${k}`, v ? 1 : 0])),
      },
      notes:
        "RERUN 2026-09-26 under the adopted comoving fear beat: status pass as before; states with fear on A 1,208 -> 995. " + ('L2, exact BigInt wholes; the commutants in floating point with rank tolerance 1e-9. The SUM permutation is derived from the SUM operator through the fear weave\'s own wignerKernel, never typed in. G2 to G6 are theorems for a Clifford record (Gross 2006) checked on the model\'s own reached states; what is measured is that the knit\'s states, including those with fears, obey them. G8 is a code identity (colorBeat adds the post-collision vibe to the flow) checked on the running rule.'),
    })
  },
})
