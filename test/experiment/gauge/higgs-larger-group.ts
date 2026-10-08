// A LARGER LINK GROUP, OR A WILSON LINE TO THE SCREEN? (E-FRC-0279, routes 3 and 4 of "G · the Higgs mechanism" in
// note/project/vibe/roadmap/research/routes/matter-forces-numbers.md, OPEN-WKF-03, decision 1 in gaps.md). Nothing breaks SU(2)+
// (E-FRC-0268). The center of each dock's 2T acts as -J (E-FRC-0273), a link is odd under it at both ends, so every
// gauge-invariant operator holds an even number of half + fields, and a Higgs needs a scalar odd under that center.
// E-FRC-0277 closed "the frame is the Higgs" as a reading of the rule. This file runs the two routes left that could
// still find such a scalar inside the model, one hypothesis each.
//  (a) A LARGER LINK GROUP (Manton 1979, Hosotani 1983: gauge-Higgs unification). If the links take values in a group G
//      larger than the dock's 2T, the components of the link outside 2T can carry 2T charge, as SU(3)'s adjoint holds
//      two doublets under its SU(2). The route's candidates: Sigma(648) (the links' color group, E-QTM-0117, E-FRC-0278),
//      2O, 2I, or W(F4) itself. Its test: a character count of the restriction to the dock's 2T. Its kill: zero
//      center-odd pieces for every candidate.
//  (b) A WILSON LINE TO THE SCREEN (Dirac 1955, dressed charges). A link is odd under the center at both ends, so a line
//      that ends where gauge moves are frozen is odd at one end only. If the moves were frozen at the screen's 18 down
//      slots, psi_+ dressed by a line to the screen would be center-odd and gauge-invariant in the bulk. Its test: whether
//      SU(2)+'s Gauss law holds exactly at screen docks. Its kill: it does, so nothing is frozen.
// The two are one question asked two ways (is there a center-odd object the rule already carries?), so they share a file.
//
// WHAT IS RUN. (a) Each candidate is realized as a group acting on the member WITH the dock's 2T inside it (the 24
// Hurwitz units acting by Gamma(h) = P- + P+ R(h) on half +, code/measure/register-link-field registerGauge), because the
// route asks for the restriction to THAT 2T, whose center z = Gamma(-1) is -J:
//   2T     the dock's 2T alone (the baseline, 24 elements).
//   2O, 2I the binary octahedral and icosahedral groups acting by right multiplication on half + (the linear extension
//          of Gamma to all of H is an algebra map, since 2T spans H), group tables from code/measure/hurwitz-gauge.
//   2T x Sigma(648)  the links' color group acts on the role, a separate factor (E-FND-0160), so the smallest group
//          holding it and the dock's 2T is the direct product.
//   W+     the group generated on the 192 modes by the 2T and W(F4)'s rotations (det +1), acting as code/measure/
//          spinor-register f4Group does (slot permutation times the minors on the register). W(F4) alone holds no element
//          acting as a nontrivial Gamma(h) (E-FRC-0277), so "W(F4) itself" needs the generated group.
//   W      the same with all of W(F4), mirrors included.
// For a finite link group the link's components are functions on G, and a gauge move h at the link's end turns them by
// conjugation (the finite group's adjoint). Its character is chi(g) = |C_G(g)|, so the center-odd part restricted to
// the 2T has dimension (|G| - |C_G(z)|) / 2 and the multiplicity of each 2T irrep R is (1/24) sum_h |C_G(phi(h))|
// conj(chi_R(h)), exact over the Eisenstein integers (hurwitzCharacters). A link group can be gauged on the rule only if
// every element keeps the rule's pieces at a dock (the condition E-FRC-0271 G1 checked for the 2T), so each group's
// generators are checked against 24 Q_S, 48 Q_D, 48 Q_D chi and chi (registerGap, integers).
// (b) The true mesh at a cusp (code/substrate/coxeter/labelled-region cuspRegion, skin 4, depth 1, the region of
// E-SPN-0181), a 2T link on every link, the transport rule of code/measure/cusp-register (slot d of dock x goes to slot d
// of the neighbour across label d; the link back is slot -d there, read). The beat is an integer dock piece K = X (1 +
// 24 Q_S + 48 Q_D + 48 Q_D chi + chi), built from the same projectors the rule's pieces are, then the stream with each
// value turned by 4 Gamma(U) of the link it crosses. Gauss's law at a dock is the statement that a local move there
// (register and the ends of its links) commutes with the beat; it is read exactly, integer state against integer state,
// with the moves on the layer docks only and on every dock.
//
// DERIVED BEFORE THE GATE RUN.
// 1. A COUNT IS NONZERO EXACTLY WHEN z IS NOT CENTRAL IN G. (|G| - |C_G(z)|) / 2 is 0 iff C_G(z) = G. In 2O and 2I the
//    element -1 is the center of the whole group, so every component of their links is center-even: 0. In 2T x
//    Sigma(648) the 2T factor's center commutes with the other factor: 0. In W+ a rotation acts on half + of the even
//    forms as conjugation by a unit quaternion, which commutes with -1 there, so z = -J is central: 0. A mirror swaps the
//    halves (E-FRC-0277 C1, C+ rho C+ = -rho), so in W it sends z = -J to +J: z is not central, and the count is nonzero.
//    Its center-odd components sit on the half-swapping elements: z g z^-1 = -g there (the scalar -1 on the 192 modes),
//    and the same under the SU(2)- center J, so they are odd under both centers, a (2, 2).
// 2. ONLY W FAILS TO KEEP THE RULE. Right multiplications commute with every piece (E-FRC-0268), Sigma(648) does not act
//    on the register, rotations keep the rule (E-FRC-0274 G2), but a mirror sends chi = 2 P+ to 2 P-, so the chiral
//    pieces break. So the one nonzero count belongs to a group that cannot be gauged on the chiral register rule.
// 3. THE SCREEN DOCK IS AN ORDINARY DOCK. At a layer dock all 24 slots are links: 6 on the layer, 18 down, 0 up
//    (E-SPN-0181 M1), and nothing lies above. The dock piece commutes with 1 x Gamma(h) (E-FRC-0271), and a stream across
//    a link is covariant link by link. So a local move at a layer dock commutes with the beat exactly, as at any dock:
//    Gauss's law holds at the screen and no end is frozen. A frozen end would be a link whose far end no move turns,
//    which is a new boundary piece.
// 4. WHAT A LARGER GROUP CAN CARRY, AS SU(3) DOES. Sigma(648) holds copies of 2T = SL(2, 3) (the qutrit Clifford
//    group's symplectic part) up to its scalar center Z3, whose center is an involution of SU(3), trace -1, not central. Restricted to such
//    a copy the adjoint 8 has center-odd dimension (8 - (|tr z|^2 - 1)) / 2 = 4, two doublets, and the triplet has 2:
//    Manton's mechanism in the finite group. That copy acts on the role and not on half +, so it is not the dock's 2T;
//    it is the control that the count can read nonzero.
//
// PROBES BEFORE THE GATES, disclosed (no gate was moved after the gate run).
//  tmp/hl-probe1.log (killed after 210 s, a slow closure over all 600 elements as generators): Gamma is a homomorphism,
//   W(F4) holds 1 element acting as a Gamma(h) (the identity), and the group of the 576 rotations with the 2T has 13,824
//   elements with |C(z)| = 13,824, center-odd dimension 0 (point 1). The mirror group was not reached. This file uses
//   small generating sets instead.
//  tmp/hl-probe2.log (2 s): the skin 4 depth 1 region has 2,451 docks, 0 inconsistent steps; reading the link back as
//   slot d at the neighbour gave 0 two-sided links, slot -d gave 7,284 of 7,284 (so the link back is slot -d); 63 layer
//   docks with all 24 neighbours, all 6 on the layer, 18 down, 0 up; the integer beat's covariance gap 0 with the moves on
//   the layer docks and on every dock; with the down links carried bare (no link value) the gap is 4,160 and 4,016.
//  tmp/hl-smoke.log (178 s, after the gates were written, gating nothing): every code path of this file on the skin 2
//   region (475 docks, 7 full layer docks). It showed the group counts the gate run reads (they do not depend on the
//   region): 2T, 2O, 2I, 2T x Sigma(648) and W+ count 0 and keep the rule; W has 663,552 elements, not the 27,648 first
//   expected (its mirrors bring the SU(2)- copy of the 2T in too), |C(z)| = 331,776 = |W| / 2, center-odd dimension
//   165,888, and breaks the rule (gap 4); the screen gap 0 in both modes, the bare control 4,016, the float read
//   1.1e-15. C1 failed in its first form (no 2T of order 24 found); see C1. Nothing else was changed.
//  tmp/hl-probe3.log: Sigma(648) has 9 involutions (trace -1), 6 square roots of each, a Q8 from two of them, and 62
//   normalizing elements outside the Q8, each closing with it at 72 with one involution, none of order 3.
//  tmp/hl-smoke2.log (skin 2, after C1 was restated): C1 holds (order 72, |C(z)| 72, conjugation count 288, adjoint 8
//   count 4, triplet 2), the rest as in the first smoke.
//
// HYPOTHESES AND GATES, fixed before the gate run.
//  I1 INSTRUMENT (a). Gamma is an exact homomorphism and 4 Gamma(-1) = -4 J; the two chosen units generate exactly the 24
//     Gamma(h); 2O and 2I close at 48 and 120 with associative tables, and each holds the 24 Hurwitz units; Sigma(648)'s
//     generators (rebuilt in Q(zeta_9) as in E-FRC-0278) close at 648; 2T's seven characters are exactly orthogonal; for
//     every candidate the seven multiplicities are nonnegative integers and twice the sum over the center-odd irreps (2,
//     2', 2'') equals the dimension count (|G| - |C_G(z)|) / 2; P-, P+ and P+ A_k keep every rule projector (gap 0).
//  I2 INSTRUMENT (b). The region has 0 inconsistent steps; every link is two-sided (slot d at x reaches n, slot -d at n
//     reaches x); at least one layer dock has all 24 neighbours in the region and every such dock splits 6 on the layer,
//     18 down, 0 up; K is an integer matrix and commutes exactly with 1 x 4 Gamma(h) for all 24 h.
//  C1 THE COUNT CAN READ NONZERO. Inside Sigma(648) a subgroup of order 72 with exactly one involution z, generated by
//     two non-commuting elements squaring to z (a Q8) and an element w outside it that normalizes it with w^3 a scalar,
//     is found: a 2T times Sigma(648)'s center Z3 (72 / 3 = 24); z is not central in Sigma(648); its conjugation count
//     (648 - |C(z)|) / 2 is positive, the adjoint 8's center-odd dimension is 4 and the triplet's is 2. (Written first
//     as a subgroup of order 24 with w of order 3; the smoke below found none, and tmp/hl-probe3.log showed why: every
//     normalizing w outside Q8 has w^3 = a nontrivial scalar, so 2T sits in Sigma(648) only with its center Z3
//     attached. C1 was restated so before the gate run; the count it reads depends only on z.)
//  C2 GAUSS'S LAW CAN READ BROKEN. The same beat with the screen's down links carried bare (a frozen end, the route's
//     premise built by hand), the moves on the layer docks: the covariance gap at the layer docks is positive.
//  H1 ROUTE (a): some candidate that keeps the rule (every generator's gap 0) has a positive center-odd count.
//  H2 ROUTE (b): Gauss's law fails at the screen: with the link field on every link, the covariance gap at some layer
//     dock is positive, for the moves on the layer docks or on every dock.
//  P1 FALSIFIER (both routes closed): every rule-keeping candidate counts 0, and the gap at the screen is exactly 0.
//  PREDICTED: P1. 2T, 2O, 2I, 2T x Sigma(648) and W+ count 0 and keep the rule; W counts |W| / 4 (|C_W(z)| = |W| / 2,
//   the half-keeping elements) and breaks the rule through its mirrors; the screen gap is 0 in both gauge modes.
// VERDICT, fixed before the gate run: FAIL (as derived) when H1 and H2 both fail with I1, I2, C1, C2 holding; PASS when H1
// or H2 holds with them; PARTIAL when an instrument or control fails.
// READ, gating nothing. Each group's order, |C(z)| and the seven multiplicities; for W the elements that move z, whether
// they are exactly the half-swapping ones and whether z and J both send each to its negative; |C_Sigma(z)|; the same
// covariance read in floats with the rule's own chiral pieces (sector S at u+ = ringUnit(-1, 4), u- = ringUnit(2, 2), then
// sector D at the conjugates, E-FRC-0274's units) for the moves on the layer docks.
//
// WHAT THIS CAN AND CANNOT SHOW. It can show, exactly, which link groups holding the dock's 2T carry center-odd link
// components, and whether the screen's docks keep Gauss's law under the rule's transport. It cannot rule out a link group
// outside the list (any group in which z is central counts 0, by point 1, so the list's reach is that criterion), and it
// does not re-read the link field's electric and magnetic pieces on the true mesh (their covariance is the class-function
// argument of E-FRC-0271, which holds on any closed loop). A region is finite; its frontier docks lack neighbours deep in
// the bulk, not at the screen, and the screen docks read are the ones with all 24 neighbours present.
//
// FIRST RUN 2026-10-02 (tmp/hl-frc-run1.log, 176 s): FAIL, as derived. P1 holds; I1, I2, C1 and C2 hold; no gate moved
// and none was rerun.
//  - H1 fails. Center-odd dimension of the link components restricted to the dock's 2T, by (|G| - |C_G(z)|) / 2 and by
//    the seven exact multiplicities: 2T 0 (order 24), 2O 0 (48), 2I 0 (120), 2T x Sigma(648) 0 (15,552), W+ 0 (13,824);
//    every one keeps the rule (gap 0), and in every one the 2, 2' and 2'' appear 0 times. Only W, the group the 2T and
//    all of W(F4) generate, counts: 663,552 elements, |C(z)| = 331,776, center-odd dimension 165,888 (27,648 each of 2,
//    2', 2''), and its mirrors break the rule's chiral pieces (gap 4). The 331,776 elements of W that move z are exactly
//    its half-swapping elements, and z and J each send every one to its negative: odd under both centers, a (2, 2).
//    W(F4) alone holds 1 element acting as a Gamma(h), the identity.
//  - H2 fails. On the cusp region (2,451 docks, 7,284 links, all two-sided, 0 inconsistent steps) the 63 layer docks with
//    all 24 neighbours split 6 on the layer, 18 down, 0 up, and the integer covariance gap is exactly 0 at every layer dock
//    with the moves on the layer docks, and 0 everywhere with the moves on every dock. Gauss's law holds at the screen.
//  - C1: a 2T x Z3 of order 72 inside Sigma(648), its involution z (trace -1) not central, |C(z)| = 72, conjugation
//    count 288, adjoint 8 count 4 (two doublets), triplet 2. C2: with the down links carried bare the gap at the layer
//    docks is 4,160. READ: the rule's own chiral pieces keep the covariance in floats to 1.1e-15.
// WHAT IT MEANS. Neither route finds a center-odd object in the present model. A link group's components carry the
// dock's center only if that center stops being central, and every group that keeps the chiral register rule (2O, 2I,
// the color group beside it, the rotations) leaves it central. The one group that does not is the one with mirrors,
// whose center-odd components are exactly the half-swapping elements, odd under both centers: the bidoublet's quantum
// numbers, reached only by gauging a parity the chiral rule does not keep. The screen is not a boundary for SU(2)+: its
// docks have all 24 links and keep Gauss's law exactly, so a Wilson line has no frozen end to stop at. For decision 1
// this removes the last two internal routes; the added scalar's options stay the diagonal frame (E-FRC-0277) and the
// bidoublet, and this run shows the bidoublet is what a mirror-holding link group would supply.
//
// PRIOR ART: Manton 1979, NPB 158, 141; Hosotani 1983, PLB 126, 309; Dirac 1955, Can. J. Phys. 33, 650; Elitzur 1975;
// the qutrit Clifford group (Appleby 2005) for SL(2, 3) inside Sigma(648).
//
// Depth L1: exact group theory and integer covariance. DETERMINISM: no random numbers; the link field and gauge functions
// are fixed index formulas. EXACT: register matrices are integers (4 x entries), characters Eisenstein integers, Sigma(648)
// in Q(zeta_9); the 2O and 2I tables come from a float quaternion closure keyed at 1e-8 and are checked as groups; the
// float covariance read is measurement.

import { experiment } from '@/test/scaffold/suite'
import { verdict, type Verdict } from '@/test/scaffold/verdict'
import {
  f4Group,
  matMul as matMul192,
  partnerProjector48,
  singletProjector24,
} from '@/code/measure/spinor-register'
import { chirality2 } from '@/code/measure/chiral-register'
import {
  IDENTITY_SLOTS,
  registerGap,
} from '@/code/measure/register-symmetry'
import { registerGauge } from '@/code/measure/register-link-field'
import {
  binaryIcosahedral,
  binaryOctahedral,
  hurwitzCharacters,
  type GaugeGroup,
} from '@/code/measure/hurwitz-gauge'
import { eisConj, eisMul, type Eis } from '@/code/measure/swap-cone'
import { cuspRegion } from '@/code/substrate/coxeter/labelled-region'
import { labelledCoin } from '@/code/substrate/coxeter/label-transport'
import { OPPOSITE } from '@/code/rule/isometric-knit'
import {
  applyPiece,
  type PieceSpec,
  type Unit,
} from '@/code/measure/cusp-register'
import { ringUnit, unitAngle } from '@/code/measure/swap-string'
import {
  cappedClosure,
  equals,
  identityMatrix,
  matMul,
  matrixKey,
  MINUS_I_OVER_ROOT3,
  mul,
  ONE,
  sameMatrix,
  toComplex,
  trace,
  ZERO,
  zetaPower,
  type Ninth,
  type NinthMatrix,
} from '@/code/algebra/ninth-field'

const SLOTS = 24
const REG = 8
const MODES = SLOTS * REG
const SKIN = 4
const DEPTH = 1
const FLOAT_READ = 1e-12

const flag = (b: boolean): number => (b ? 1 : 0)

export default experiment({
  id: 'gauge/higgs-larger-group',
  code: 'E-FRC-0279',
  title:
    "no larger link group and no Wilson line to the screen gives SU(2)+ a center-odd scalar, fail as derived: restricted to the dock's 2T, the link components of 2O, 2I, 2T x Sigma(648) and the group with W(F4)'s rotations hold 0 center-odd pieces, because the center -J stays central in each; only the group with W(F4)'s mirrors counts (165,888 center-odd dimensions of 663,552, all on the half-swapping elements, odd under both centers like a bidoublet), and its mirrors break the chiral register rule; at the cusp screen every layer dock keeps all 24 links (6 on the layer, 18 down) and Gauss's law holds exactly (gap 0, 4,160 with the down links frozen), so nothing is frozen",
  category: 'gauge',
  substrates: ['3434'],
  depth: 'L1',
  paper: false,
  run() {
    return higgsLargerGroupRun()
  },
})

// ---------------- elements on the 192 modes: slot map and 4 x the register matrix (integers) ----------------

type El = { s: Int8Array; m: Float64Array }

let nonInteger = 0

function elMul(a: El, b: El): El {
  const s = new Int8Array(SLOTS)

  for (let d = 0; d < SLOTS; d++) {
    s[d] = a.s[b.s[d]!]!
  }

  const m = new Float64Array(REG * REG)

  for (let i = 0; i < REG; i++) {
    for (let j = 0; j < REG; j++) {
      let t = 0

      for (let k = 0; k < REG; k++) {
        t += a.m[i * REG + k]! * b.m[k * REG + j]!
      }

      if (t % 4 !== 0) {
        nonInteger++
      }

      m[i * REG + j] = t / 4
    }
  }

  return { s, m }
}

const elKey = (e: El): string => `${e.s.join(',')}|${e.m.join(',')}`
const elEq = (a: El, b: El): boolean =>
  a.s.every((x, d) => x === b.s[d]) && a.m.every((x, k) => x === b.m[k])

const fromRegister = (
  slots: ArrayLike<number>,
  reg4: readonly (readonly number[])[],
): El => ({
  s: Int8Array.from(slots),
  m: Float64Array.from(reg4.flat()),
})

function closeEls(gens: readonly El[]): El[] {
  const id = fromRegister(
    IDENTITY_SLOTS,
    Array.from({ length: REG }, (_, i) =>
      Array.from({ length: REG }, (__, j) => (i === j ? 4 : 0)),
    ),
  )
  const out = [id]
  const seen = new Set([elKey(id)])

  for (const e of out) {
    for (const g of gens) {
      const x = elMul(g, e)
      const k = elKey(x)

      if (!seen.has(k)) {
        seen.add(k)
        out.push(x)
      }
    }
  }

  return out
}

const centralizerSize = (group: readonly El[], t: El): number =>
  group.filter(g => elEq(elMul(g, t), elMul(t, g))).length

// ---------------- the 2T characters and the multiplicities ----------------

type Count = {
  name: string
  order: number
  cz: number
  oddDim: number
  mult: number[]
  multOk: boolean
  keepsRule: boolean
  ruleGap: number
}

function countFrom(
  name: string,
  order: number,
  cent: readonly number[],
  z: number,
  chars: readonly (readonly Eis[])[],
  keep: number,
): Count {
  const cz = cent[z]!
  const oddDim = (order - cz) / 2
  const mult = chars.map(chi => {
    let s: Eis = [0n, 0n]

    cent.forEach((c, h) => {
      const t = eisMul([BigInt(c), 0n], eisConj(chi[h]!))

      s = [s[0] + t[0], s[1] + t[1]]
    })

    return s[1] === 0n && s[0] % 24n === 0n
      ? Number(s[0] / 24n)
      : Number.NaN
  })
  const oddPieces = mult[3]! + mult[4]! + mult[5]!
  const multOk =
    mult.every(m => Number.isInteger(m) && m >= 0) &&
    2 * oddPieces === oddDim

  return {
    name,
    order,
    cz,
    oddDim,
    mult,
    multOk,
    keepsRule: keep === 0,
    ruleGap: keep,
  }
}

// ---------------- Sigma(648), as E-FRC-0278 builds it ----------------

const omegaPower = (k: number): Ninth => zetaPower(3 * k)
const diag3 = (d: readonly Ninth[]): Ninth[][] =>
  d.map((x, i) => d.map((_, j) => (i === j ? x : ZERO)))
const SIGMA_GENERATORS: NinthMatrix[] = [
  diag3([ONE, omegaPower(1), omegaPower(2)]),
  [
    [ZERO, ONE, ZERO],
    [ZERO, ZERO, ONE],
    [ONE, ZERO, ZERO],
  ],
  [0, 1, 2].map(j =>
    [0, 1, 2].map(k => mul(omegaPower(j * k), MINUS_I_OVER_ROOT3)),
  ),
  diag3([zetaPower(2), zetaPower(2), zetaPower(5)]),
]

function sigmaTwoT(sigma: readonly NinthMatrix[]): {
  found: boolean
  order: number
  involutions: number
  zCentralInSigma: boolean
  cz: number
  traceZ: [number, number]
  su3Odd: number
  fundOdd: number
} {
  const I3 = identityMatrix(3)
  const isScalar = (a: NinthMatrix): boolean =>
    a.every((row, i) =>
      row.every((x, j) =>
        i === j ? equals(x, a[0]![0]!) : equals(x, ZERO),
      ),
    )
  const sq = sigma.map(x => matMul(x, x))
  const zIndex = sigma.findIndex(
    (x, k) => !sameMatrix(x, I3) && sameMatrix(sq[k]!, I3),
  )
  const fail = {
    found: false,
    order: 0,
    involutions: 0,
    zCentralInSigma: true,
    cz: 0,
    traceZ: [0, 0] as [number, number],
    su3Odd: 0,
    fundOdd: 0,
  }

  if (zIndex < 0) {
    return fail
  }

  const z = sigma[zIndex]!
  const roots = sigma.filter((_, k) => sameMatrix(sq[k]!, z))
  const i = roots[0]!
  const j = roots.find(
    x =>
      !sameMatrix(matMul(i, x), matMul(x, i)) &&
      cappedClosure([i, x], 30).elements.length === 8,
  )

  if (j === undefined) {
    return fail
  }

  const q8 = new Set(cappedClosure([i, j], 30).elements.map(matrixKey))
  const w = sigma.find(x => {
    if (isScalar(x)) {
      return false
    }

    const x2 = matMul(x, x)

    // x^3 a scalar of Sigma(648), x outside Q8; x^-1 = x^2 / x^3
    if (!isScalar(matMul(x2, x)) || q8.has(matrixKey(x))) {
      return false
    }

    const xInv = sigma.find(y => sameMatrix(matMul(x, y), I3))!
    const normalizes = [i, j].every(y =>
      q8.has(matrixKey(matMul(matMul(x, y), xInv))),
    )

    return (
      normalizes && cappedClosure([i, j, x], 100).elements.length === 72
    )
  })

  if (w === undefined) {
    return fail
  }

  const sub = cappedClosure([i, j, w], 100).elements
  const involutions = sub.filter(
    x => !sameMatrix(x, I3) && sameMatrix(matMul(x, x), I3),
  ).length
  const cz = sigma.filter(x =>
    sameMatrix(matMul(x, z), matMul(z, x)),
  ).length
  const tz = toComplex(trace(z))
  // chi_8(z) = |tr z|^2 - 1 and chi_3(z) = tr z; z real-traced (an involution of SU(3))
  const chi8 = tz[0] * tz[0] + tz[1] * tz[1] - 1
  const su3Odd = (8 - chi8) / 2
  const fundOdd = (3 - tz[0]) / 2

  return {
    found: true,
    order: sub.length,
    involutions,
    zCentralInSigma: cz === sigma.length,
    cz,
    traceZ: tz,
    su3Odd,
    fundOdd,
  }
}

// ---------------- route (b): the gauged beat on the true mesh ----------------

const unitOf = (k: readonly [number, number]): Unit => {
  const t = unitAngle(ringUnit(k[0], k[1]))

  return [Math.cos(t), Math.sin(t)]
}

export function higgsLargerGroupRun(skin = SKIN): Verdict {
  const started = Date.now()
  const log = (what: string): void =>
    console.error(
      `${what} ${Math.round((Date.now() - started) / 1000)}s`,
    )

  // ---------------- the dock's 2T, I1 ----------------
  const G = registerGauge()
  const n24 = G.group.order
  const J = G.J
  const zIdx = G.hurwitz.doubled.findIndex(
    q => q.join(',') === '-2,0,0,0',
  )
  const centerIsMinusJ = G.gamma4[zIdx]!.every((row, a) =>
    row.every((x, b) => x === -4 * J[a]![b]!),
  )
  const twoT: El[] = G.gamma4.map(m => fromRegister(IDENTITY_SLOTS, m))
  const iIdx = G.hurwitz.doubled.findIndex(
    q => q.join(',') === '0,2,0,0',
  )
  const wIdx = G.hurwitz.doubled.findIndex(
    q => q.join(',') === '1,1,1,1',
  )
  const twoTGens = [twoT[iIdx]!, twoT[wIdx]!]
  const twoTClosed = closeEls(twoTGens)
  const twoTKeys = new Set(twoT.map(elKey))
  const twoTGenerated =
    twoTClosed.length === 24 &&
    twoTClosed.every(e => twoTKeys.has(elKey(e)))
  const H = hurwitzCharacters(G.hurwitz)
  const chars = H.chars

  // the rule's projectors and the gap of an element
  const S24 = singletProjector24()
  const D48 = partnerProjector48()
  const chi = chirality2(J, 1)
  const ruleQ = [S24, D48, matMul192(D48, chi), chi]
  const ruleGap = (
    slots: ArrayLike<number>,
    reg: readonly (readonly number[])[],
  ): number =>
    Math.max(
      ...ruleQ.map(q => registerGap(q, Int32Array.from(slots), reg)),
    )
  const I8 = J.map((row, a) => row.map((_, b) => (a === b ? 1 : 0)))
  const twoPlus = I8.map((row, a) => row.map((x, b) => x + J[a]![b]!))
  const twoMinus = I8.map((row, a) => row.map((x, b) => x - J[a]![b]!))
  const mul8 = (a: number[][], b: number[][]): number[][] =>
    a.map(row =>
      b[0]!.map((_, j) =>
        row.reduce((s, x, k) => s + x * b[k]![j]!, 0),
      ),
    )
  const basis = [
    twoMinus,
    twoPlus,
    ...G.units.map(u => mul8(twoPlus, u)),
  ]
  const basisGap = Math.max(
    ...basis.map(m => ruleGap(IDENTITY_SLOTS, m)),
  )
  const twoTGap = Math.max(
    ...G.gamma4.map(m => ruleGap(IDENTITY_SLOTS, m)),
  )

  log('2T')

  // ---------------- 2T, 2O, 2I from tables ----------------
  const tableCount = (
    name: string,
    g: GaugeGroup,
    keep: number,
  ): { count: Count; ok: boolean } => {
    const n = g.order
    const quat = g.quat!
    const phi = G.hurwitz.doubled.map(q =>
      quat.findIndex(p =>
        p.every((x, k) => Math.abs(x - q[k]! / 2) < 1e-9),
      ),
    )

    let assoc = true

    for (let a = 0; a < n && assoc; a++) {
      for (let b = 0; b < n && assoc; b++) {
        for (let c = 0; c < n; c++) {
          if (
            g.table[g.table[a * n + b]! * n + c] !==
            g.table[a * n + g.table[b * n + c]!]
          ) {
            assoc = false
            break
          }
        }
      }
    }

    const centralizer = (x: number): number => {
      let c = 0

      for (let y = 0; y < n; y++) {
        if (g.table[x * n + y] === g.table[y * n + x]) {
          c++
        }
      }

      return c
    }

    const cent = phi.map(x => (x < 0 ? Number.NaN : centralizer(x)))

    return {
      count: countFrom(name, n, cent, zIdx, chars, keep),
      ok: assoc && phi.every(x => x >= 0),
    }
  }

  const t2 = tableCount('2T', G.group, twoTGap)
  const o2 = tableCount('2O', binaryOctahedral(), basisGap)
  const i2 = tableCount('2I', binaryIcosahedral(), basisGap)

  log('2O 2I')

  // ---------------- 2T x Sigma(648) ----------------
  const sigma = cappedClosure(SIGMA_GENERATORS, 700)
  const sigmaOk = sigma.closed && sigma.elements.length === 648
  const productCount = countFrom(
    '2T x Sigma(648)',
    24 * sigma.elements.length,
    G.hurwitz.doubled.map((_, h) => {
      let c = 0

      for (let y = 0; y < n24; y++) {
        if (G.group.table[h * n24 + y] === G.group.table[y * n24 + h]) {
          c++
        }
      }

      return c * sigma.elements.length
    }),
    zIdx,
    chars,
    twoTGap,
  )

  log('Sigma')

  // ---------------- W+ and W on the 192 modes ----------------
  const F = f4Group()

  const reflection = (a: readonly number[]): number[][] => {
    const n = a.reduce((s, x) => s + x * x, 0)

    return [0, 1, 2, 3].map(i =>
      [0, 1, 2, 3].map(
        j => (i === j ? 1 : 0) - (2 * a[i]! * a[j]!) / n,
      ),
    )
  }

  const simple = [
    [0, 1, -1, 0],
    [0, 0, 1, -1],
    [0, 0, 0, 1],
    [0.5, -0.5, -0.5, -0.5],
  ].map(reflection)
  const reflections = simple.map(
    r =>
      F.find(g =>
        g.matrix.every((row, i) =>
          row.every((x, j) => x === r[i]![j]!),
        ),
      )!,
  )
  const reflEls = reflections.map(g =>
    fromRegister(
      g.slots,
      g.register.map(row => row.map(x => 4 * x)),
    ),
  )
  const rotEls = [1, 2, 3].map(k => elMul(reflEls[0]!, reflEls[k]!))
  const f4AsGamma = F.filter(g =>
    twoTKeys.has(
      elKey(
        fromRegister(
          g.slots,
          g.register.map(row => row.map(x => 4 * x)),
        ),
      ),
    ),
  ).length
  const reflGap = Math.max(
    ...reflections.map(g => ruleGap(g.slots, g.register)),
  )
  const rotGap = Math.max(
    ...rotEls.map(e =>
      ruleGap(
        e.s,
        [...Array(REG).keys()].map(i =>
          [...e.m.slice(i * REG, i * REG + REG)].map(x => x / 4),
        ),
      ),
    ),
  )
  const Wp = closeEls([...rotEls, ...twoTGens])

  log(`W+ ${Wp.length}`)

  const W = closeEls([...reflEls, ...twoTGens])

  log(`W ${W.length}`)

  const wpCount = countFrom(
    'W+',
    Wp.length,
    twoT.map(t => centralizerSize(Wp, t)),
    zIdx,
    chars,
    Math.max(rotGap, twoTGap),
  )
  const wCount = countFrom(
    'W',
    W.length,
    twoT.map(t => centralizerSize(W, t)),
    zIdx,
    chars,
    Math.max(reflGap, twoTGap),
  )

  log('centralizers')

  // READ: the elements of W that move z
  const z = twoT[zIdx]!
  const J4 = fromRegister(
    IDENTITY_SLOTS,
    J.map(row => row.map(x => 4 * x)),
  )
  const negate = (e: El): El => ({ s: e.s, m: e.m.map(x => -x) })
  const movers = W.filter(g => !elEq(elMul(g, z), elMul(z, g)))
  // g swaps the halves: g J = -J g
  const swaps = (g: El): boolean =>
    elEq(elMul(g, J4), negate(elMul(J4, g)))
  const swappers = W.filter(swaps).length
  const moversSwap = movers.every(swaps)
  // z g z^-1 = -g and J g J^-1 = -g (z and J are involutions, z^-1 = z)
  const oddUnderBoth = movers.every(g => {
    const zg = elMul(elMul(z, g), z)
    const jg = elMul(elMul(J4, g), J4)

    return elEq(zg, negate(g)) && elEq(jg, negate(g))
  })

  // ---------------- C1: a 2T inside Sigma(648) ----------------
  const inner = sigmaTwoT(sigma.elements)
  const C1 =
    inner.found &&
    inner.order === 72 &&
    inner.involutions === 1 &&
    !inner.zCentralInSigma &&
    (648 - inner.cz) / 2 > 0 &&
    inner.su3Odd === 4 &&
    inner.fundOdd === 2

  log('C1')

  const counts = [
    t2.count,
    o2.count,
    i2.count,
    productCount,
    wpCount,
    wCount,
  ]
  const I1 =
    G.homomorphism &&
    centerIsMinusJ &&
    twoTGenerated &&
    o2.ok &&
    i2.ok &&
    t2.ok &&
    o2.count.order === 48 &&
    i2.count.order === 120 &&
    sigmaOk &&
    H.orthogonal &&
    counts.every(c => c.multOk) &&
    basisGap === 0 &&
    nonInteger === 0
  const H1 = counts.some(c => c.keepsRule && c.oddDim > 0)

  // ---------------- route (b) ----------------
  const coin = labelledCoin()
  const R = cuspRegion({ coin, skin, depth: DEPTH })
  const N = R.cells

  let twoSided = 0
  let oneSided = 0

  for (let x = 0; x < N; x++) {
    for (let d = 0; d < SLOTS; d++) {
      const n = R.neighbour[x * SLOTS + d]!

      if (n < 0) {
        continue
      }

      if (R.neighbour[n * SLOTS + OPPOSITE[d]!] === x) {
        twoSided++
      } else {
        oneSided++
      }
    }
  }

  let fullLayer = 0
  let fullLayerSplit = 0

  for (let x = 0; x < N; x++) {
    if (R.depth[x] !== 0) {
      continue
    }

    const ns = Array.from(
      { length: SLOTS },
      (_, d) => R.neighbour[x * SLOTS + d]!,
    )

    if (ns.some(n => n < 0)) {
      continue
    }

    fullLayer++

    const on = ns.filter(
      n => Math.abs(R.levelRatio[n]! - 1) < 1e-9,
    ).length
    const down = ns.filter(n => R.levelRatio[n]! > 1 + 1e-9).length
    const up = ns.filter(n => R.levelRatio[n]! < 1 - 1e-9).length

    if (on === 6 && down === 18 && up === 0) {
      fullLayerSplit++
    }
  }

  // the integer dock piece K = X (1 + S24 + D48 + D48 chi + chi)
  const DC = matMul192(D48, chi)
  const K = new Float64Array(MODES * MODES)

  for (let d = 0; d < SLOTS; d++) {
    for (let a = 0; a < REG; a++) {
      const row = d * REG + a
      const src = OPPOSITE[d]! * REG + a

      for (let c = 0; c < MODES; c++) {
        K[row * MODES + c] =
          (src === c ? 1 : 0) +
          S24[src * MODES + c]! +
          D48[src * MODES + c]! +
          DC[src * MODES + c]! +
          chi[src * MODES + c]!
      }
    }
  }

  const kInteger = K.every(Number.isInteger)

  // K (1 x 4 Gamma(h)) = (1 x 4 Gamma(h)) K
  let kGap = 0

  for (const g4 of G.gamma4) {
    for (let r = 0; r < MODES; r++) {
      const dr = Math.floor(r / REG)
      const ar = r % REG

      for (let c = 0; c < MODES; c++) {
        const dc = Math.floor(c / REG)
        const ac = c % REG

        let left = 0
        let right = 0

        for (let b = 0; b < REG; b++) {
          left += K[r * MODES + dc * REG + b]! * g4[b]![ac]!
          right += g4[ar]![b]! * K[(dr * REG + b) * MODES + c]!
        }

        kGap = Math.max(kGap, Math.abs(left - right))
      }
    }
  }

  const I2 =
    R.inconsistentSteps === 0 &&
    oneSided === 0 &&
    fullLayer > 0 &&
    fullLayerSplit === fullLayer &&
    kInteger &&
    kGap === 0

  // the link field: link[x * 24 + d] the element a value crossing from x along d is turned by
  const table = G.group.table
  const inv = G.group.inverse
  const link = new Int32Array(N * SLOTS).fill(-1)

  let counter = 0

  for (let x = 0; x < N; x++) {
    for (let d = 0; d < SLOTS; d++) {
      const n = R.neighbour[x * SLOTS + d]!

      if (n < 0 || link[x * SLOTS + d]! >= 0) {
        continue
      }

      const u = (counter * 7 + 5) % n24

      counter++
      link[x * SLOTS + d] = u

      if (R.neighbour[n * SLOTS + OPPOSITE[d]!] === x) {
        link[n * SLOTS + OPPOSITE[d]!] = inv[u]!
      }
    }
  }

  const hOf = (x: number, mode: 'layer' | 'all'): number =>
    mode === 'layer' && R.depth[x] !== 0
      ? G.group.identity
      : (x * 11 + 3) % n24

  const apply4 = (
    u: number,
    v: Float64Array,
    o: number,
    out: Float64Array,
    oo: number,
  ): void => {
    const m = G.gamma4[u]!

    for (let a = 0; a < REG; a++) {
      let s = 0

      for (let b = 0; b < REG; b++) {
        s += m[a]![b]! * v[o + b]!
      }

      out[oo + a] = s
    }
  }

  const isDown = (x: number, n: number): boolean =>
    R.depth[x] !== R.depth[n]

  const beat = (
    psi: Float64Array,
    L: Int32Array,
    bareDown: boolean,
  ): Float64Array => {
    const out = new Float64Array(N * MODES)
    const p = new Float64Array(MODES)

    for (let x = 0; x < N; x++) {
      const o = x * MODES

      for (let r = 0; r < MODES; r++) {
        let s = 0

        for (let k = 0; k < MODES; k++) {
          const kk = K[r * MODES + k]!

          if (kk !== 0) {
            s += kk * psi[o + k]!
          }
        }

        p[r] = s
      }

      for (let d = 0; d < SLOTS; d++) {
        const n = R.neighbour[x * SLOTS + d]!

        if (n < 0) {
          continue
        }

        if (bareDown && isDown(x, n)) {
          for (let a = 0; a < REG; a++) {
            out[(n * SLOTS + d) * REG + a] = 4 * p[d * REG + a]!
          }
        } else {
          apply4(
            L[x * SLOTS + d]!,
            p,
            d * REG,
            out,
            (n * SLOTS + d) * REG,
          )
        }
      }
    }

    return out
  }

  const gaugeState = (
    psi: Float64Array,
    mode: 'layer' | 'all',
  ): Float64Array => {
    const out = new Float64Array(N * MODES)

    for (let x = 0; x < N; x++) {
      const h = hOf(x, mode)

      for (let d = 0; d < SLOTS; d++) {
        apply4(
          h,
          psi,
          (x * SLOTS + d) * REG,
          out,
          (x * SLOTS + d) * REG,
        )
      }
    }

    return out
  }

  // U'(x, d) = h_n U h_x^-1
  const gaugeLinks = (mode: 'layer' | 'all'): Int32Array => {
    const L = new Int32Array(N * SLOTS).fill(-1)

    for (let x = 0; x < N; x++) {
      for (let d = 0; d < SLOTS; d++) {
        const n = R.neighbour[x * SLOTS + d]!

        if (n >= 0) {
          L[x * SLOTS + d] =
            table[
              table[hOf(n, mode) * n24 + link[x * SLOTS + d]!]! * n24 +
                inv[hOf(x, mode)]!
            ]!
        }
      }
    }

    return L
  }

  const psi0 = Float64Array.from(
    { length: N * MODES },
    (_, k) => ((k * 7) % 11) - 5,
  )

  const gaussGap = (
    mode: 'layer' | 'all',
    bare: boolean,
  ): { layer: number; all: number } => {
    const lhs = beat(gaugeState(psi0, mode), gaugeLinks(mode), bare)
    const rhs = gaugeState(beat(psi0, link, bare), mode)

    let layer = 0
    let all = 0

    for (let x = 0; x < N; x++) {
      for (let k = 0; k < MODES; k++) {
        const g = Math.abs(lhs[x * MODES + k]! - rhs[x * MODES + k]!)

        all = Math.max(all, g)

        if (R.depth[x] === 0) {
          layer = Math.max(layer, g)
        }
      }
    }

    return { layer, all }
  }

  const gLayer = gaussGap('layer', false)
  const gAll = gaussGap('all', false)
  const gBare = gaussGap('layer', true)
  const C2 = gBare.layer > 0
  const H2 = gLayer.layer > 0 || gAll.layer > 0

  log('route b')

  // READ: the same covariance in floats with the rule's own chiral pieces, S then D
  const uPlus = unitOf([-1, 4])
  const uMinus = unitOf([2, 2])
  const specs: PieceSpec[] = [
    { sector: 'S', plus: uPlus, minus: uMinus },
    {
      sector: 'D',
      plus: [uPlus[0], -uPlus[1]],
      minus: [uMinus[0], -uMinus[1]],
    },
  ]

  const floatBeat = (
    re: Float64Array,
    im: Float64Array,
    L: Int32Array,
    spec: PieceSpec,
  ): [Float64Array, Float64Array] => {
    const oRe = new Float64Array(N * MODES)
    const oIm = new Float64Array(N * MODES)
    const pRe = new Float64Array(MODES)
    const pIm = new Float64Array(MODES)

    for (let x = 0; x < N; x++) {
      applyPiece(spec, re, im, x * MODES, pRe, pIm)

      for (let d = 0; d < SLOTS; d++) {
        const n = R.neighbour[x * SLOTS + d]!

        if (n < 0) {
          continue
        }

        const m = G.gamma4[L[x * SLOTS + d]!]!

        for (let a = 0; a < REG; a++) {
          let sr = 0
          let si = 0

          for (let b = 0; b < REG; b++) {
            sr += (m[a]![b]! / 4) * pRe[d * REG + b]!
            si += (m[a]![b]! / 4) * pIm[d * REG + b]!
          }

          oRe[(n * SLOTS + d) * REG + a] = sr
          oIm[(n * SLOTS + d) * REG + a] = si
        }
      }
    }

    return [oRe, oIm]
  }

  const floatGauge = (v: Float64Array): Float64Array => {
    const g = gaugeState(v, 'layer')

    return g.map(x => x / 4)
  }

  const reStart = Float64Array.from({ length: N * MODES }, (_, k) =>
    Math.cos(0.6180339887 * k * 7.1),
  )
  const imStart = Float64Array.from({ length: N * MODES }, (_, k) =>
    Math.sin(0.6180339887 * k * 3.3),
  )
  const Lg = gaugeLinks('layer')

  let floatGap = 0

  {
    let [aRe, aIm] = [floatGauge(reStart), floatGauge(imStart)]
    let [bRe, bIm] = [reStart, imStart]

    for (const spec of specs) {
      ;[aRe, aIm] = floatBeat(aRe, aIm, Lg, spec)
      ;[bRe, bIm] = floatBeat(bRe, bIm, link, spec)
    }

    const gRe = floatGauge(bRe)
    const gIm = floatGauge(bIm)

    for (let x = 0; x < N; x++) {
      if (R.depth[x] !== 0) {
        continue
      }

      for (let k = 0; k < MODES; k++) {
        floatGap = Math.max(
          floatGap,
          Math.hypot(
            aRe[x * MODES + k]! - gRe[x * MODES + k]!,
            aIm[x * MODES + k]! - gIm[x * MODES + k]!,
          ),
        )
      }
    }
  }

  log('float read')

  const status: Verdict['status'] = !(I1 && I2 && C1 && C2)
    ? 'partial'
    : H1 || H2
      ? 'pass'
      : 'fail'
  const describe = (c: Count): string =>
    `${c.name}: order ${c.order}, |C(z)| ${c.cz}, center-odd dimension ${c.oddDim}, multiplicities ${c.mult.join(' ')} (1 1' 1'' 2 2' 2'' 3), keeps the rule ${c.keepsRule} (gap ${c.ruleGap})`

  return verdict({
    status,
    claim: `H1 ${H1}: ${counts.map(describe).join('; ')}. W(F4) holds ${f4AsGamma} element acting as a Gamma(h). In W the ${movers.length} elements that move z are the half-swapping ones ${moversSwap} (${swappers} swap), each sent to its negative by z and by J ${oddUnderBoth}. H2 ${H2}: on the cusp region (${N} docks, ${fullLayer} layer docks with all 24 neighbours, ${fullLayerSplit} of them 6 on the layer, 18 down, 0 up; ${twoSided} two-sided links, ${oneSided} one-sided) the integer covariance gap at the layer docks is ${gLayer.layer} (moves on the layer docks) and ${gAll.layer} (moves on every dock; ${gAll.all} anywhere). Controls: C1 ${C1} (a 2T inside Sigma(648): order ${inner.order}, ${inner.involutions} involution, z central in Sigma ${inner.zCentralInSigma}, |C(z)| ${inner.cz}, conjugation center-odd dimension ${(648 - inner.cz) / 2}, tr z ${inner.traceZ[0]}, adjoint 8 center-odd ${inner.su3Odd}, triplet ${inner.fundOdd}); C2 ${C2} (bare down links: gap ${gBare.layer} at the layer docks). Instruments: I1 ${I1} I2 ${I2} (K integer ${kInteger}, K-Gamma gap ${kGap}, inconsistent steps ${R.inconsistentSteps}). Read: the float covariance with the rule's chiral pieces S then D, gap ${floatGap.toExponential(2)} at the layer docks.`,
    metrics: {
      H1: flag(H1),
      H2: flag(H2),
      C1: flag(C1),
      C2: flag(C2),
      I1: flag(I1),
      I2: flag(I2),
      oddDim2T: t2.count.oddDim,
      oddDim2O: o2.count.oddDim,
      oddDim2I: i2.count.oddDim,
      oddDimSigmaProduct: productCount.oddDim,
      oddDimWplus: wpCount.oddDim,
      oddDimW: wCount.oddDim,
      orderWplus: Wp.length,
      orderW: W.length,
      czW: wCount.cz,
      ruleGapW: wCount.ruleGap,
      ruleGapWplus: wpCount.ruleGap,
      f4AsGamma,
      moversW: movers.length,
      swappersW: swappers,
      moversSwap: flag(moversSwap),
      oddUnderBoth: flag(oddUnderBoth),
      sigmaInnerCz: inner.cz,
      sigmaInnerSu3Odd: inner.su3Odd,
      gaussLayer: gLayer.layer,
      gaussAll: gAll.all,
      gaussBare: gBare.layer,
      fullLayerDocks: fullLayer,
      floatGap,
      floatGapOk: flag(floatGap <= FLOAT_READ),
      seconds: (Date.now() - started) / 1000,
    },
    control: {
      sigmaInnerOddDim: (648 - inner.cz) / 2,
      sigmaInnerSu3Odd: inner.su3Odd,
      gaussBare: gBare.layer,
    },
    notes: `L1. z = Gamma(-1) = -J. The count of a group is (|G| - |C_G(z)|) / 2, zero exactly when z is central in G. ${((Date.now() - started) / 1000).toFixed(0)} s.`,
  })
}
