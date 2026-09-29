// C FROM THE SEA (E-SPN-0164). E-SPN-0163 ended at C: its register exchange makes the trimaximal phase physical but is
// C-even, so it read C and CP as not breaking together. Two routes were set, in order: (A) C broken spontaneously by the
// vacuum, the rule kept exactly C-symmetric, since the candidate rule's vacuum is a love sea and not a fear sea
// (E-SPN-0134); (B) only if A is impossible, an explicit C-odd vertex. Then the Sakharov count: can the pair table's
// 1/2 (+, -) and 1/2 (-, +) split be biased into a net asymmetry. This file decides both, exactly, on E-SPN-0163's rest
// pair toy with the tones carried (code/measure/sea-conjugation).
//
// DERIVED BEFORE THE RUN (E-SPN-0160's branches, E-FRC-0258's C, E-FRC-0259's partner beat, E-SPN-0163's rule and toy).
// 1. THREE MAPS ARE CALLED C, AND ONLY ONE IS A SYMMETRY WITHIN A VACUUM (L1).
//    (a) C_v, the tone mirror v -> -v (E-SPN-0134's C): love <-> fear, a unitary mode permutation. Every piece of the
//        register rule is tone-blind (the stream, the coin, the mixers, the masses, the flavor mixing, and the register
//        exchange, which swaps registers and keeps each member's tone and flavor), so C_v commutes with the rule exactly.
//        It maps the love sea onto the fear sea: a superselection of the sea, not a symmetry inside one.
//    (b) Xi, the second-quantized particle-hole map (E-SPN-0163's G): the empty background onto the full one. Xi Gamma(b)
//        Xi^-1 = det(b) Gamma(conj b) and Xi H' Xi^-1 = H' + 12 - 4N, so Xi maps the rule (V, D, v) to (conj V, conj D, v)
//        up to a phase constant on each member-number sector. It too relates two backgrounds, not two excitations of one.
//    (c) C_b, the member's own particle-antiparticle map (E-FRC-0258's C, "phases at K to minus the phases at -K"): at
//        rest the member's band is two branches, S at +M (E-SPN-0160's 8 states at +theta) and D at -M (the 8 at
//        -theta), and C_b takes one to the other. S's rest beat is restToy(A+, A-), D's is restToy(A+^dag, A-^dag)
//        (E-FRC-0259's partner beat), so b_D = b_S^dag exactly: the D branch runs the S branch backward. This is the only
//        one of the three that compares a particle with its antiparticle inside one vacuum.
// 2. THE SECTOR CONSTANT IS NOT OBSERVABLE (L1). Member number is kept exactly by Gamma(b) and by the vertex, so every
//    probability lives in one member-number sector, and the constant 12 - 4N of point 1 (b) is a phase on a whole sector:
//    it drops out of every probability. A relative phase between sectors could show only in a superposition across
//    member number, which number conservation (and charge superselection) never makes. So it is no source of C
//    violation.
// 3. ROUTE A IS IMPOSSIBLE (a theorem, L1). If the rule commutes with C_v, then for every observable O, <O> on the fear
//    sea equals <C_v O C_v^-1> on the love sea, beat by beat. So every rate of a love-sea excitation equals the rate of
//    its C_v image, which is a fear-sea excitation: the sea fixes the sign of every C_v-odd quantity (the charge: every
//    love-sea excitation carries -1, E-SPN-0134 point 4) and makes no rate differ between an excitation and its C
//    image. Spontaneous breaking by the sea gives superselection, not a C-odd rate. PREDICTED: love-sea hole rates equal
//    fear-sea hole rates exactly, all transitions, all beats; the charge-weighted asymmetry q A exactly opposite.
// 4. BUT C AND CP ALREADY BREAK TOGETHER, INSIDE ONE SEA, WITH NO C-ODD PIECE (L1 for the identities, L2 for the values).
//    On the love sea every excitation is a hole, of the S or the D branch. By Xi (point 1 b) a hole moves as a particle
//    of the conjugate beat; with b_D = b_S^dag and restToy's real structure:
//      an S hole moves as an S particle of (conj V, conj D, v), whose rates equal the S particle's at (V, D, conj v) by
//        complex conjugation in the real basis;
//      a D hole moves as a D particle of the conjugate beat, restToy(conj V D V^T, D) = the S beat of (conj V, D).
//    E-SPN-0163 showed A_T = Q(0 -> 1) - Q(1 -> 0) is odd in V (the transpose of its palindrome is the step of conj V).
//    READ AS C AND CP (corrected after the smoke run, before the gate run, disclosed below). CPT (point 5) gives
//    Q_D(a -> b) = Q_S(b -> a), so A_D = -A_S follows from CPT alone and is no sign of C violation by itself. C_b as a
//    symmetry would demand the particle and antiparticle rates equal, Q_S(a -> b) = Q_D(a -> b), hence A_D = +A_S. Both
//    hold only if A_S = 0. So the witness is A_CP(a -> b) = Q_S(a -> b) - Q_D(a -> b), the same flavor transition for the
//    particle branch and the antiparticle branch; by CPT it equals A_T of the S branch exactly. At rest P_rot (-I, which
//    acts on the register as the identity, E-FRC-0258 point 2) is trivial, so a nonzero A_CP breaks C_b and C_b P_rot
//    together. CP with the physical, depth-keeping parity (CP_imp) is already broken by the chiral structure, read on
//    spectra, basis-free (E-FRC-0258). PREDICTED: A_D = -A_S exactly, A_S nonzero, A_CP = A_T,S rate by rate, and X =
//    A_S - A_D (C-odd) rephasing invariant and zero for a real mixing, V = 1 and v = 1 on the - member, whose flavor
//    basis is its mass basis (A- = D diagonal), so no relabeling reaches it. E-SPN-0163's G read Xi, which compares the
//    full background with the empty one, and so could not see this.
//    NOT A WITNESS: the between-halves comparison Y = A_S(-) - A_D(+). The + half's flavor label is fixed only by the
//    vertex (E-FRC-0259: with no vertex, W = P+ (x) V + P- (x) 1 relabels it away), so at v = 1 the + member still shows
//    a T-odd asymmetry in the - half's labels (-3.1e-4 at t = 1, tmp/csea-probe4.log), a labeling artifact. Y is read and
//    gates nothing.
// 5. CPT FIXES THE D BRANCH'S MEETING PHASE (L1). The rest toy cannot say how the register exchange acts on two D-branch
//    members (their register content is spread over the slots). CPT (C_b P_rot T, E-FRC-0258) requires Q_S(a -> b) =
//    Q_D(b -> a) rate by rate, and with b_D = b_S^dag that holds exactly when U_D = U_S^-1, that is when the D branch's
//    meeting phase is conj(v): the D branch runs the whole S cycle backward, the free part (b_D = b_S^dag) and the vertex
//    alike. So the gate reads the D branch with conj(v), and READS (gating nothing) the D branch with v, where CPT fails
//    rate by rate but A_D = -A_S still holds (point 4 does not depend on this choice, since A_T is even in v, probe 1).
// 6. THE SAKHAROV COUNT (L1). The pair table's support is an empty line (E-RLT-0103); on the love sea every slot holds a
//    love, so the table has no support there. On the empty line, the pair it makes is a love and a fear in the invariant
//    register state psi = e_1 (x) e_1 - e_vol (x) e_vol (E-SPN-0163 point 6), weight 1/2 on (love +, fear -) and 1/2 on
//    (love -, fear +). C_v maps psi to -psi and the one branch onto the other, and commutes with the rule: so the two
//    branches keep equal weight at every beat, exactly, and the net charge moved into the + half is 0 at every beat. A
//    bias needs a start or a piece that is not C_v symmetric AND a piece that changes member number (the member number
//    in each half is kept by every piece: the one-body beat keeps chirality, the vertex turns (+, -) into (-, +)). So the
//    first number is 0, exactly, and number violation is still lacking.
// 7. ROUTE B IS NOT NEEDED. C and CP break together already (point 4), so the explicit C-odd vertex (love-love and
//    fear-fear meetings given different phases) is not built. It would cost the valence mirror (E-SLF-0149) its
//    exactness, which point 4 shows is not required for C violation.
//
// PREDICTED VERDICT: PARTIAL. Route A fails as derived (the sea gives superselection only); C and CP break together
// inside one sea (G holds); CPT holds with the derived D-branch phase; the Sakharov count is 0 (number violation lacking).
//
// GATES, fixed before the gate run (12 beats, the trimaximal V, masses and vertex of E-SPN-0163).
//  A ROUTE A, THE SEA. A1 C_v commutes with the two-tone rule on the (1 love, 1 fear) sector (36 states), state by
//    state, exactly, and love-sea two-hole rates equal fear-sea two-hole rates for all 18 transitions at every beat,
//    exactly. A2 (PREDICTED FALSE: route A) some love-sea rate differs from its C_v image's. A3 the love sea adds nothing
//    to the branch asymmetry: A_S and A_D on holes equal A_S and A_D on particles, exactly.
//  G C AND CP TOGETHER (the - member, on holes). G1 A_D = -A_S exactly at every beat (CPT's consequence) and A_S
//    nonzero. G2 A_CP(a -> b) = Q_S(a -> b) - Q_D(a -> b) equals A_T,S(a -> b) exactly for all 9 transitions at every
//    beat, and is nonzero for some. G3 X = A_S - A_D exactly 0 at every beat for the Householder mixing, V = 1 and v = 1.
//    G4 X unchanged exactly under all 36 rephasings of V.
//  K CPT. b_D = b_S^dag exactly, and with the D branch's phase conj(v), Q_S(a -> b) = Q_D(b -> a) for all 18 transitions
//    at every beat on holes, exactly.
//  P THE PAIR TABLE. From psi (love flavor 0, fear flavor 0) on the empty line: weights (love +, fear -) and (love -,
//    fear +) equal at every beat t = 0 .. 12, exactly, and 1/2 each at t = 0.
// INSTRUMENT. I1 Xi U Xi^dag = lambda U(conj V, conj D, v) on the 2-member block for one exact unit lambda. I2 the sector
//  Gamma of the 12-mode toy on the 4-love-hole sector equals E-SPN-0163's dense fockGamma on 6 modes, entry by entry.
// CONTROLS. C1 E-SPN-0163's A_T for the S particle: A_T(1) = -3047158125 / 10851569165584 exactly and its 12 recorded
//  values to 1e-8 relative. C2 the fear sea: q A (q = -1 for love-sea holes, +1 for fear-sea holes) exactly opposite.
//  C3 Xi H' Xi^dag = H' + 12 - 4N exactly (E-SPN-0163's G reading reproduced).
// READ, gating nothing: A_S, A_D, the + member's A_S(+) and A_D(+), Y per beat (and Y at v = 1, the labeling
//  artifact); the D branch read with v (CPT rate by rate, and A_D); individual love-sea rates against the empty
//  background's.
// Verdict: fail if A1, A3, G, K or P fails; partial if all hold and the net transfer is 0 (predicted), or if the
// instrument or a control fails; pass if all hold with a nonzero net transfer.
//
// PROBES BEFORE THE GATE RUN, disclosed (no gate moved after them).
//  tmp/csea-probe1.log: on the 6-mode toy, A_T of two holes below the full background equals two particles' exactly
//   (-2.8080e-4 ... -2.2396e-2), A_T is even in v, A_T(conj V, conj D, v) equals the holes', A_T(conj V, D, v) is the
//   exact negative; Xi U Xi^dag proportional to the step of (conj V, conj D, v); Householder, V = 1, v = 1 give 0; the
//   particle - hole difference 0 under 9 rephasings.
//  tmp/csea-probe2.log: individual rates Q(a -> b), 18 transitions: particle = hole for 6 (palindrome) and exactly the
//   6 that are even in v; the largest particle - hole gap 1.1e-5. This is what showed Xi compares two backgrounds (rates
//   under v against conj v), not a particle with its antiparticle.
//  tmp/csea-probe3.log: the D branch as restToy(A+^dag, A-^dag): A_D = -A_S exactly on holes and on particles, with the
//   D vertex v or conj v alike; A_S(+) = -9.5416e-7 at t = 1 against A_S(-) = -2.8080e-4; with the D vertex v, CPT
//   rate by rate fails on all 18 (which led to point 5, derived after this probe and before the gate run); Householder,
//   V = 1 and v = 1 give 0.
//  tmp/csea-smoke.log: every code path on 3 beats. Two gates failed as first written, and both were corrected before
//   the gate run. G3 had required Y = 0 at v = 1, and Y read -2.8e-4 there. tmp/csea-probe4.log traced it to the +
//   member (-3.145e-4, -2.499e-3, -8.344e-3 at v = 1, the - member exactly 0), the labeling artifact of point 4, so Y
//   left the gates and G was rewritten around A_CP and X, both on the - member. I1 computed lambda as a conj(b), which is
//   lambda |b|^2, so its unit test failed; it now divides by b. Every other gate held as predicted (A1, A3, K, P, I2, C1
//   to C3; A2 false as predicted).
//
// FIRST RUN (tmp/csea-exp-run1.log, 147 s, 12 beats): PARTIAL, as predicted. A1, A3, G, K and P hold, the instrument and
//  all three controls hold, A2 is false (route A impossible, as derived), and the pair table's net transfer is 0 at every
//  beat. No gate moved and none was rerun.
//  - A: C_v commutes with the two-tone rule on all 36 (1 love, 1 fear) states; love-sea and fear-sea hole rates equal on
//    18 transitions x 12 beats, exactly; the love sea's A_S and A_D equal the empty background's.
//  - G: A_S (holes, - member) -2.8080e-4, -1.4551e-3, -2.0637e-3, -7.3595e-4, -1.5061e-4, -5.2174e-3, -1.5571e-2,
//    -2.2396e-2, -1.7206e-2, -5.0487e-3, -4.7397e-3, -2.9995e-2 (A_S(1) = -3047158125 / 10851569165584); A_D its exact
//    negative; A_CP = A_T,S on all 9 transitions, nonzero; X = A_S - A_D (-5.6161e-4 ... -5.9991e-2) exactly 0 for
//    Householder, V = 1 and v = 1 and unchanged under 36 rephasings.
//  - K: b_D = b_S^dag, and Q_S(a -> b) = Q_D(b -> a) on all 18 transitions x 12 beats with the D phase conj(v); read
//    with v it fails, as derived.
//  - P: weights 1/2 and 1/2 at every beat t = 0 .. 12, net 0.
//  - Read: Y at v = 1 grows to -3.9e-1 by t = 12, the + half's labeling artifact; love-sea rates equal the empty
//    background's on 6 of 18 transitions (the ones even in v).
// NEXT. (1) A member-number-changing piece, the one Sakharov condition left (the pair table keeps each half's number
//  and its split is fixed at 1/2 by C_v). (2) The + member's flavor basis fixed by a coupling other than the vertex, so
//  the between-halves comparison becomes physical. (3) The asymmetry read against the moving band (two members with
//  momentum).
//
// Depth L1 (the maps, the theorem of point 3, the identities of point 4, CPT's fix, the pair-table symmetry) and L2 (the
// asymmetries read off the exact rule). DETERMINISM: no random numbers; exact arithmetic throughout. NOTHING MOVES: the
// rule hands values between the modes of a dock, and the vertex exchanges register content between two members that
// meet.

import { experiment } from '@/test/scaffold/suite'
import { verdict, type Verdict } from '@/test/scaffold/verdict'
import { ringUnit, unitAngle } from '@/code/measure/swap-string'
import { trimaximal } from '@/code/measure/chiral-register'
import {
  HOUSEHOLDER,
  qw,
  qwAdd,
  qwConj,
  qwDiag,
  qwFromEisQMatrix,
  qwFromUnit,
  qwIsZero,
  qwMul,
  qwSub,
  qwValue,
  rephase,
  QW_ONE,
  QW_ZERO,
  type QW,
  type QWMatrix,
} from '@/code/measure/flavor-register'
import {
  exchangeCount,
  fockGamma,
  fockGammaBlock,
  fockStates,
  numberOperator,
  particleHole,
  qwDaggerSq,
  qwIdentityOf,
  qwInv,
  qwMatEqual,
  qwMatMulSq,
  qwMatSub,
  unitPower,
} from '@/code/measure/register-many-body'
import {
  applySector,
  braket,
  branchBeat,
  groupedStates,
  holeImage,
  onTone,
  pairRate,
  sectorExchangeCount,
  sectorGamma,
  toneBlind,
  toneMirror,
  toneMode,
  type FockVector,
} from '@/code/measure/sea-conjugation'

const H_VALUES: readonly number[] = [0, 2, 3, 4, 6, 8, 12]
const SECTOR_VALUES: readonly number[] = [
  0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12,
]
const FLAVOR_UNITS: readonly (readonly [number, number])[] = [
  [2, 2],
  [-1, 4],
  [-4, 0],
]
const VERTEX: readonly [number, number] = [2, 0]
const SIXTH_ROOTS: readonly (readonly [bigint, bigint])[] = [
  [1n, 0n],
  [1n, 1n],
  [0n, 1n],
  [-1n, 0n],
  [-1n, -1n],
  [0n, -1n],
]
const RECORDED_AT1 = qw(-3047158125n, 0n, 10851569165584n)
const RECORDED_AT: readonly number[] = [
  -2.808e-4, -1.4551e-3, -2.0637e-3, -7.3595e-4, -1.5061e-4, -5.2174e-3,
  -1.5571e-2, -2.2396e-2, -1.7206e-2, -5.0487e-3, -4.7397e-3,
  -2.9995e-2,
]
const RECORDED_TOLERANCE = 1e-4

export type SeaPlan = { beats: number }

export const GATE_PLAN: SeaPlan = { beats: 12 }

const flag = (b: boolean): number => (b ? 1 : 0)
const num = (x: QW): number => qwValue(x)[0]
const same = (a: readonly QW[], b: readonly QW[]): boolean =>
  a.length === b.length && a.every((x, t) => qwIsZero(qwSub(x, b[t]!)))
const neg = (a: readonly QW[]): QW[] => a.map(x => qwSub(QW_ZERO, x))
const add = (a: readonly QW[], b: readonly QW[]): QW[] =>
  a.map((x, t) => qwAdd(x, b[t]!))
const sub = (a: readonly QW[], b: readonly QW[]): QW[] =>
  a.map((x, t) => qwSub(x, b[t]!))
const zeros = (a: readonly QW[]): boolean => a.every(qwIsZero)
const line = (xs: readonly QW[]): string =>
  xs.map(x => num(x).toExponential(4)).join(' ')

export default experiment({
  id: 'spin/sea-conjugation',
  code: 'E-SPN-0164',
  title:
    "C and CP break together inside one sea with no C-odd piece, and the sea itself adds nothing, partial (the pair table's split stays 1/2 and 1/2, so number violation is still lacking): the tone mirror (E-SPN-0134's C) commutes with the register rule exactly, so the love sea only selects a sector and every love-sea rate equals its mirror image's on the fear sea (route A, spontaneous C from the sea, is impossible); inside one sea the member's particle branch (S, +M) and antiparticle branch (D, -M, the S branch run backward) carry exactly opposite T-odd asymmetries once the register exchange makes the trimaximal phase physical, so C (the branch map) and CP (with the depth-keeping parity) break together, CPT holds exactly when the D branch's meeting phase is the conjugate, and the C- and CP-odd observable is rephasing invariant and vanishes for a real mixing; E-SPN-0163's C-even reading compared the full background with the empty one, not a particle with its antiparticle; the pair table's two branches keep equal weight at every beat by the mirror, so the net transfer is 0",
  category: 'spin',
  substrates: ['3434'],
  depth: 'L1',
  paper: false,
  run() {
    return seaConjugationRun(GATE_PLAN)
  },
})

export function seaConjugationRun(plan: SeaPlan): Verdict {
  const started = Date.now()
  const log = (what: string): void =>
    console.error(
      `${what} ${Math.round((Date.now() - started) / 1000)}s`,
    )
  const beats = plan.beats
  const D = qwDiag(
    FLAVOR_UNITS.map(([k, j]) => qwFromUnit(ringUnit(k, j))),
  )
  const Dbar = D.map(r => r.map(qwConj))
  const V = qwFromEisQMatrix(trimaximal())
  const Vbar = V.map(r => r.map(qwConj))
  const vUnit = ringUnit(VERTEX[0], VERTEX[1])
  const v = qwFromUnit(vUnit)
  const vbar = qwConj(v)
  const Hx = exchangeCount(2, 3)
  const Xi = particleHole(6)
  const two = fockStates(6, 2)
  const four = fockStates(6, 4)

  // ---- the 6-mode branch steps (dense, 64 states) ----
  const vertexPower = (w: QW): QWMatrix =>
    (unitPower(Hx, H_VALUES, w) as { U: QWMatrix }).U

  const step6 = (
    W: QWMatrix,
    masses: QWMatrix,
    branch: 'S' | 'D',
    w: QW,
  ): QWMatrix => {
    const P = vertexPower(w)

    return qwMatMulSq(
      qwMatMulSq(P, fockGamma(branchBeat(W, masses, branch))),
      P,
    )
  }

  const dense =
    (U: QWMatrix, block: readonly number[]) =>
    (x: FockVector): FockVector => {
      const out: FockVector = new Map()

      for (const to of block) {
        let s = QW_ZERO

        for (const [from, a] of x) {
          const u = (U[to] as QW[])[from]!

          if (!qwIsZero(u)) {
            s = qwAdd(s, qwMul(u, a))
          }
        }

        if (!qwIsZero(s)) {
          out.set(to, s)
        }
      }

      return out
    }

  const asHole = (x: FockVector): FockVector => holeImage(x, 6)
  const same6 = (x: FockVector): FockVector => x
  const rate6 = (
    U: QWMatrix,
    h1: number,
    a: number,
    b: number,
    hole: boolean,
  ): QW[] =>
    pairRate(
      dense(U, hole ? four : two),
      hole ? asHole : same6,
      h1,
      a,
      b,
      beats,
    )
  const asym6 = (U: QWMatrix, h1: number, hole: boolean): QW[] =>
    sub(rate6(U, h1, 0, 1, hole), rate6(U, h1, 1, 0, hole))

  const US = step6(V, D, 'S', v)
  const UD = step6(V, D, 'D', vbar)
  const UDv = step6(V, D, 'D', v)

  log('steps')

  // ---------------- A: route A, the sea (the 12-mode two-tone toy) ----------------
  const loveModes = [0, 1, 2, 3, 4, 5]
  const fearModes = [6, 7, 8, 9, 10, 11]
  const mixed = groupedStates(12, [loveModes, fearModes], [1, 1])
  const loveHoles = groupedStates(12, [loveModes, fearModes], [4, 0])
  const fearHoles = groupedStates(12, [loveModes, fearModes], [0, 4])
  const b12 = toneBlind(branchBeat(V, D, 'S'))

  const sectorStep = (states: readonly number[]): QWMatrix => {
    const P = (
      unitPower(sectorExchangeCount(states), SECTOR_VALUES, v) as {
        U: QWMatrix
      }
    ).U

    return qwMatMulSq(qwMatMulSq(P, sectorGamma(b12, states)), P)
  }

  const Umixed = sectorStep(mixed)
  const Ulove = sectorStep(loveHoles)
  const Ufear = sectorStep(fearHoles)

  // C_v covariance, state by state, on the mixed sector
  let mirrorCommutes = true

  for (const s of mixed) {
    const x: FockVector = new Map([[s, QW_ONE]])
    const lhs = toneMirror(applySector(Umixed, mixed, x))
    const rhs = applySector(Umixed, mixed, toneMirror(x))

    for (const k of new Set([...lhs.keys(), ...rhs.keys()])) {
      if (
        !qwIsZero(qwSub(lhs.get(k) ?? QW_ZERO, rhs.get(k) ?? QW_ZERO))
      ) {
        mirrorCommutes = false
      }
    }
  }

  const loveRate = (h1: number, a: number, b: number): QW[] =>
    pairRate(
      x => applySector(Ulove, loveHoles, x),
      x => onTone(asHole(x), 0),
      h1,
      a,
      b,
      beats,
    )
  const fearRate = (h1: number, a: number, b: number): QW[] =>
    pairRate(
      x => applySector(Ufear, fearHoles, x),
      x => onTone(asHole(x), 1),
      h1,
      a,
      b,
      beats,
    )

  let seasEqual = true
  let anyDiffers = false
  let loveEqualsEmpty = 0

  for (const h1 of [-1, 1]) {
    for (let a = 0; a < 3; a++) {
      for (let b = 0; b < 3; b++) {
        const l = loveRate(h1, a, b)
        const f = fearRate(h1, a, b)

        if (!same(l, f)) {
          seasEqual = false
          anyDiffers = true
        }

        if (same(l, rate6(US, h1, a, b, false))) {
          loveEqualsEmpty++
        }
      }
    }
  }

  const A1 = mirrorCommutes && seasEqual
  const A2 = anyDiffers
  const holeS = asym6(US, -1, true)
  const holeD = asym6(UD, -1, true)
  const partS = asym6(US, -1, false)
  const partD = asym6(UD, -1, false)
  const A3 = same(holeS, partS) && same(holeD, partD)

  log('A')

  // ---------------- G: C and CP together inside one sea ----------------
  const holeSplus = asym6(US, 1, true)
  const holeDplus = asym6(UD, 1, true)
  const X = sub(holeS, holeD)
  const Y = sub(holeS, holeDplus)
  const G1 = same(holeD, neg(holeS)) && !zeros(holeS)

  // A_CP(a -> b) = Q_S(a -> b) - Q_D(a -> b), against A_T,S(a -> b) = Q_S(a -> b) - Q_S(b -> a)
  let acpMatches = true
  let acpNonzero = false

  for (let a = 0; a < 3; a++) {
    for (let b = 0; b < 3; b++) {
      const qs = rate6(US, -1, a, b, true)
      const acp = sub(qs, rate6(UD, -1, a, b, true))

      if (!same(acp, sub(qs, rate6(US, -1, b, a, true)))) {
        acpMatches = false
      }

      if (!zeros(acp)) {
        acpNonzero = true
      }
    }
  }

  const G2 = acpMatches && acpNonzero
  const Xof = (W: QWMatrix, w: QW): QW[] =>
    sub(
      asym6(step6(W, D, 'S', w), -1, true),
      asym6(step6(W, D, 'D', qwConj(w)), -1, true),
    )
  const G3 = [
    Xof(HOUSEHOLDER, v),
    Xof(qwIdentityOf(3), v),
    Xof(V, QW_ONE),
  ].every(zeros)

  let G4 = true

  for (const a of SIXTH_ROOTS) {
    for (const b of SIXTH_ROOTS) {
      if (!same(Xof(rephase(V, [a[0], a[1]], [b[0], b[1]]), v), X)) {
        G4 = false
      }
    }
  }

  const G = G1 && G2 && G3 && G4
  // read: Y at v = 1, the + half's labeling artifact
  const Yat1 = sub(
    asym6(step6(V, D, 'S', QW_ONE), -1, true),
    asym6(step6(V, D, 'D', QW_ONE), 1, true),
  )

  log('G')

  // ---------------- K: CPT ----------------
  const bS = branchBeat(V, D, 'S')
  const bD = branchBeat(V, D, 'D')
  const adjoint = qwMatEqual(bD, qwDaggerSq(bS))

  let cpt = true
  let cptWithV = true

  for (const h1 of [-1, 1]) {
    for (let a = 0; a < 3; a++) {
      for (let b = 0; b < 3; b++) {
        const qs = rate6(US, h1, a, b, true)

        if (!same(qs, rate6(UD, h1, b, a, true))) {
          cpt = false
        }

        if (!same(qs, rate6(UDv, h1, b, a, true))) {
          cptWithV = false
        }
      }
    }
  }

  const K = adjoint && cpt
  const holeDwithV = asym6(UDv, -1, true)

  log('K')

  // ---------------- P: the pair table on the empty line ----------------
  const L = (s: number, f: number): number => toneMode(0, s, f)
  const F = (s: number, f: number): number => toneMode(1, s, f)
  const pairOf = (a: number, b: number): number => (1 << a) | (1 << b)
  // psi = c^dag_L(1,0) c^dag_F(1,0) - c^dag_L(vol,0) c^dag_F(vol,0), both in ascending order (love modes below fear)
  const psi: FockVector = new Map([
    [pairOf(L(0, 0), F(0, 0)), QW_ONE],
    [pairOf(L(1, 0), F(1, 0)), qw(-1n, 0n)],
  ])

  // the chiral one-member states c~^dag_(h f) = c^dag_(0 f) + h c^dag_(1 f) on a tone, and the pair (love h, fear -h)
  const branchWeight = (x: FockVector, h: number): QW => {
    let total = QW_ZERO

    for (let f = 0; f < 3; f++) {
      for (let g = 0; g < 3; g++) {
        const y: FockVector = new Map()

        const put = (state: number, c: bigint): void => {
          y.set(state, qwAdd(y.get(state) ?? QW_ZERO, qw(c, 0n)))
        }

        for (const [sl, cl] of [
          [0, 1n],
          [1, BigInt(h)],
        ] as const) {
          for (const [sf, cf] of [
            [0, 1n],
            [1, BigInt(-h)],
          ] as const) {
            put(pairOf(L(sl, f), F(sf, g)), cl * cf)
          }
        }

        const amp = braket(y, x)

        total = qwAdd(
          total,
          qwMul(qw(1n, 0n, 4n), qwMul(amp, qwConj(amp))),
        )
      }
    }

    return total
  }

  const psiNorm = qw(1n, 0n, 2n)

  let x = psi

  const plus: QW[] = [qwMul(branchWeight(x, 1), psiNorm)]
  const minus: QW[] = [qwMul(branchWeight(x, -1), psiNorm)]

  for (let t = 0; t < beats; t++) {
    x = applySector(Umixed, mixed, x)
    plus.push(qwMul(branchWeight(x, 1), psiNorm))
    minus.push(qwMul(branchWeight(x, -1), psiNorm))
  }

  const half = qw(1n, 0n, 2n)
  const P = same(plus, minus) && qwIsZero(qwSub(plus[0]!, half))
  const net = sub(plus, minus)

  log('P')

  // ---------------- instrument ----------------
  const XiU = qwMatMulSq(qwMatMulSq(Xi, US), qwDaggerSq(Xi))
  const Uconj = step6(Vbar, Dbar, 'S', v)

  let lambda: QW | null = null
  let I1 = true

  for (const i of two) {
    for (const j of two) {
      const a = (XiU[i] as QW[])[j]!
      const b = (Uconj[i] as QW[])[j]!

      if (qwIsZero(b)) {
        if (!qwIsZero(a)) {
          I1 = false
        }

        continue
      }

      if (lambda === null) {
        lambda = qwMul(a, qwInv(b))
      }

      if (!qwIsZero(qwSub(a, qwMul(lambda, b)))) {
        I1 = false
      }
    }
  }

  const lambdaUnit =
    lambda !== null &&
    qwIsZero(qwSub(qwMul(lambda, qwConj(lambda)), QW_ONE))

  I1 = I1 && lambdaUnit

  const sectorG = sectorGamma(toneBlind(bS), loveHoles)
  const denseG = fockGammaBlock(bS, 4)
  const I2 = qwMatEqual(sectorG, denseG)
  const instrument = I1 && I2

  log('instrument')

  // ---------------- controls ----------------
  const AT = asym6(US, -1, false)
  const C1 =
    qwIsZero(qwSub(AT[0]!, RECORDED_AT1)) &&
    AT.every(
      (y, t) =>
        t >= RECORDED_AT.length ||
        Math.abs(num(y) / RECORDED_AT[t]! - 1) <= RECORDED_TOLERANCE,
    )
  const loveA = sub(loveRate(-1, 0, 1), loveRate(-1, 1, 0))
  const fearA = sub(fearRate(-1, 0, 1), fearRate(-1, 1, 0))
  // q A: a love-sea hole carries charge -1, a fear-sea hole +1
  const qLove = neg(loveA)
  const qFear = fearA
  const C2 = same(qLove, neg(qFear)) && !zeros(loveA)
  const Nop = numberOperator(6)
  const XiH = qwMatMulSq(qwMatMulSq(Xi, Hx), qwDaggerSq(Xi))
  const C3 = qwMatEqual(
    qwMatSub(XiH, Hx),
    Nop.map((r, i) =>
      r.map((y, j) => (i === j ? qw(12n - 4n * y.a, 0n) : QW_ZERO)),
    ),
  )
  const controls = C1 && C2 && C3

  log('controls')

  // ---------------- verdict ----------------
  const hard = A1 && A3 && G && K && P
  const netNonzero = !zeros(net)
  const status = !hard
    ? 'fail'
    : !instrument || !controls
      ? 'partial'
      : netNonzero
        ? 'pass'
        : 'partial'
  const metrics: Record<string, number> = {
    A1: flag(A1),
    A2: flag(A2),
    A3: flag(A3),
    G: flag(G),
    G1: flag(G1),
    G2: flag(G2),
    G3: flag(G3),
    G4: flag(G4),
    K: flag(K),
    P: flag(P),
    instrument: flag(instrument),
    C1: flag(C1),
    C2: flag(C2),
    C3: flag(C3),
    cptWithVertexV: flag(cptWithV),
    loveEqualsEmpty,
    netNonzero: flag(netNonzero),
    vertexAngle: unitAngle(vUnit),
    seconds: (Date.now() - started) / 1000,
  }

  holeS.forEach((y, t) => (metrics[`AS_${t + 1}`] = num(y)))
  X.forEach((y, t) => (metrics[`X_${t + 1}`] = num(y)))

  return verdict({
    status,
    claim: `A1 ${A1} (C_v commutes with the two-tone rule on ${mixed.length} states ${mirrorCommutes}; love-sea and fear-sea hole rates equal, 18 transitions x ${beats} beats, ${seasEqual}); A2 ${A2} (route A: a love-sea rate differing from its mirror's; predicted false); A3 ${A3} (the love sea's A_S, A_D equal the empty background's); G ${G} (G1 A_D = -A_S ${G1}: A_S ${line(holeS)}; G2 A_CP = Q_S - Q_D equals A_T,S on all 9 transitions and nonzero ${G2}; G3 X = A_S - A_D zero for Householder, V = 1, v = 1 ${G3}; G4 X under 36 rephasings ${G4}); K ${K} (b_D = b_S^dag ${adjoint}, Q_S(a -> b) = Q_D(b -> a) with the D phase conj(v) ${cpt}; read with v: ${cptWithV}); P ${P} (pair table weights + ${line(plus)}, - ${line(minus)}, net ${line(net)}); instrument I1 ${I1} (lambda unit ${lambdaUnit}) I2 ${I2}; controls C1 ${C1} C2 ${C2} C3 ${C3}`,
    metrics,
    control: {
      C1: flag(C1),
      C2: flag(C2),
      C3: flag(C3),
      instrument: flag(instrument),
    },
    notes: `L1 and L2. Vertex v = ringUnit(${VERTEX.join(', ')}), angle ${unitAngle(vUnit).toFixed(6)}; masses ringUnit ${FLAVOR_UNITS.map(u => `(${u.join(', ')})`).join(', ')}. A_S (holes, - member) ${line(holeS)}; A_D ${line(holeD)}; A_S(+) ${line(holeSplus)}; A_D(+) ${line(holeDplus)}; X = A_S - A_D ${line(X)}; Y (read) ${line(Y)}, at v = 1 ${line(Yat1)}. Read: A_D with the D phase v ${line(holeDwithV)} (= -A_S ${same(holeDwithV, neg(holeS))}), CPT rate by rate with v ${cptWithV}; love-sea rates equal to the empty background's on ${loveEqualsEmpty} of 18 transitions. Exact A_S(1) = (${holeS[0]!.a}) / ${holeS[0]!.d}, Y(1) = (${Y[0]!.a}) / ${Y[0]!.d}. Pair table net transfer ${line(net)}. ${((Date.now() - started) / 1000).toFixed(0)} s.`,
  })
}
