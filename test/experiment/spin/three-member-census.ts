// THE THREE-MEMBER CENSUS ON THE REGISTER, BY THE RULE'S OWN CHARGE AND SPIN (E-SPN-0192, OPEN-MAT-01, E-SPN-0189's open
// census; note/project/vibe/roadmap/moving-matter item 0003, spec row B1). RULE: the candidate (register) rule, so the
// result is provisional until the rule is adopted (moving-matter item 0006).
//
// E-SPN-0189 found that one register member carries (love - fear)/3 = -1/3 or +1/3 in each half and spin one half, so
// charge one needs three like-tone members. This file asks the next question: which three-member states does the
// members' exchange symmetry allow, and with what spin. Three members on ONE level (one orbital, spatially symmetric),
// so the whole exchange symmetry falls on register (x) tone: 16 modes per member (code/measure/three-member-census).
// Charge is the vibe count of the holes, the spin is the register's own rotation action (left multiplication by e_ij
// over the husk planes 01, 02, 12), the chirality is each member's J half. Everything is integer and every
// multiplicity an exact rank.
//
// STATISTICS. Item 0002 (the exchange sign from the rule) has not landed, so the gate runs on the fermionic default
// (wedges) and the bosonic table (monomials) is read beside it, gating nothing.
//
// DERIVED BEFORE THE GATE RUN (L1).
// 1. One member's half is 4 real = H, complexified spin 2 (x) isospin 2 (the right-multiplication index, E-SPN-0189
//    point 6). The like-tone member space is 8 = spin 2 (x) flavour 4 (2 per half). Fermionic three-member states are
//    Lambda^3 (2 (x) 4) = S^3 2 (x) Lambda^3 4 + S^(2,1) 2 (x) S^(2,1) 4: J = 3/2 x 4 multiplets (16 states) and J = 1/2
//    x 20 multiplets (40 states), 56 per tone (E-SPN-0189's C2). By n+ (members in the J = +1 half): J = 1/2 in 2, 8,
//    8, 2 multiplets at n+ = 3, 2, 1, 0, and J = 3/2 in 2 and 2 at n+ = 2, 1. So |Q| = 1 with J = 1/2 survives.
// 2. 3Q is a sum of three terms -1 or +1, so it is odd: three members carry |Q| = 1 or 1/3 only, never 2/3 (and never
//    0). The quark row of charge 2/3 has no three-member state on this rule; two members carry it (read below).
// 3. The prediction against the spec's gates: not killed, and PARTIAL, since PASS also asks for |Q| = 2/3 multiplets.
//
// PROBE BEFORE THE GATES, DISCLOSED. tmp/census-probe.log (under 10 s, the code module alone, before this file was written):
//  every table as derived in 1, the twisted rotation integer spin only, the unprojected table 4096 states. The gates
//  below were written after it and were not tuned to it: they are the spec's B1 gates and the brief's control.
//
// HYPOTHESES AND GATES, fixed before the gate run, never moved.
//  I1 INSTRUMENT: (a) the husk generators L(e_01), L(e_02), L(e_12) keep each J half as integer 4 x 4 matrices, square
//     to -1 on each half and close as su(2) ([A_i, A_j] = +-2 A_k); the twisted ones keep the halves and close; (b) one
//     member: 16 states, all J = 1/2, 3Q = -1 on 8 and +1 on 8 (E-SPN-0189's readout); (c) dimensions 560 (fermi), 816
//     (bose), 4096 (none), every sector's Casimir nullities summing to its size (no eigenvalue outside 4J(J+1)) and
//     every multiplicity divisible by 2J + 1.
//  C1 CONTROL, the exchange projection matters: the unprojected (distinguishable) table, states per (Q, J), differs
//     from the fermionic one.
//  C2 CONTROL, the spin reading can return another value: with the twisted rotation (conjugation, the lattice's genuine
//     representation, E-FRC-0267) in place of the spinor action, no fermionic three-member state has half-integer J.
//  PASS (spec B1): a fermionic three-member state with |Q| = 1 and J = 1/2 exists, AND fermionic three-member multiplets
//     with |Q| = 1/3 and with |Q| = 2/3 are listed; with I1, C1, C2.
//  KILL (spec section 3 row B1): with I1, C1, C2, no fermionic three-member state with |Q| = 1 and J = 1/2: FAIL.
//  PARTIAL otherwise, the gap named.
// READ, gating nothing: the table head per n+, the rows under SU(2)+'s Gauss law (n+ even, E-FRC-0273), the bosonic
//  table, and the two-member fermionic rows (the |Q| = 2/3 and 0 states).
//
// WHAT THIS CAN AND CANNOT SHOW. It counts which (Q, J, chirality) a three-member state on one level can have, by the
// rule's own charge and rotation. It does not bind them (item 0004), does not place members on different levels (with
// distinct orbitals any spatial symmetry is available and the table is the unprojected one, C1), and does not count the
// slot structure of a level beyond the register: the member's level is the register's 8-fold copy (E-SPN-0160), which
// is what the spin acts on here.
//
// FIRST RUN 2026-10-08 (tmp/census.log, 3.2 s): PARTIAL, as derived. No gate moved, none rerun.
//  - The electron route lives: |Q| = 1, J = 1/2 in 10 doublets per tone (2, 8, 8, 2 at n+ = 3, 2, 1, 0), J = 3/2 in 2
//    and 2 at n+ = 2, 1; 56 states per tone. Under Gauss (n+ even): 8 doublets at n+ = 2 and 2 at n+ = 0.
//  - |Q| = 1/3: 448 states (J = 1/2 and 3/2 at every n+). |Q| = 2/3: 0 three-member states, the gap; two members carry
//    it (56 states, J = 0 and 1).
//  - Bosonic, read: the same 10 J = 1/2 doublets per tone, more J = 3/2 (816 states), so B1 does not hang on item 0002.
//  - I1 holds, C1 (unprojected 512 states of |Q| = 1, J = 1/2 against 80) and C2 (48 twisted rows, none half-integer).
//
// DETERMINISM: no random numbers. EXACT: integer matrices, BigInt ranks.

import { experiment } from '@/test/scaffold/suite'
import { verdict, type Verdict } from '@/test/scaffold/verdict'
import {
  byChargeSpin,
  census,
  formatRow,
  rotationGenerators,
  su2Closure,
  type Census,
} from '@/code/measure/three-member-census'

export default experiment({
  id: 'spin/three-member-census',
  code: 'E-SPN-0192',
  title:
    'three like-tone register members on one level carry charge one with spin one half under fermionic exchange, partial as derived: of the 56 like-tone wedge states per tone, 40 are J = 1/2 (10 doublets, 2, 8, 8, 2 at n+ = 3, 2, 1, 0) and 16 are J = 3/2, read from the register\'s own rotation and the vibe count, exactly; |Q| = 1/3 fills 448 states, but |Q| = 2/3 has no three-member state at all (3Q is odd), only two-member ones; the unprojected table differs and the twisted rotation gives no half-integer J',
  category: 'spin',
  substrates: ['3434'],
  depth: 'L1',
  paper: false,
  run() {
    return threeMemberCensusRun()
  },
})

const sameTable = (a: Census, b: Census): boolean => {
  const x = byChargeSpin(a)
  const y = byChargeSpin(b)

  return x.size === y.size && [...x].every(([k, v]) => y.get(k) === v)
}

export function threeMemberCensusRun(): Verdict {
  const started = Date.now()

  // ---------------- I1 ----------------
  const gU = rotationGenerators('untwisted')
  const gT = rotationGenerators('twisted')
  const sU = su2Closure(gU)
  const sT = su2Closure(gT)
  const I1a =
    gU.halvesKept &&
    sU.squares.every(s => s === 1) &&
    sU.closes &&
    gT.halvesKept &&
    sT.closes

  const one = census(1, 'fermi')
  const I1b =
    one.dimension === 16 &&
    one.rows.every(r => r.twoJ === 1) &&
    one.rows
      .filter(r => r.charge3 === -1)
      .reduce((s, r) => s + r.states, 0) === 8 &&
    one.rows
      .filter(r => r.charge3 === 1)
      .reduce((s, r) => s + r.states, 0) === 8

  const fermi = census(3, 'fermi')
  const bose = census(3, 'bose')
  const none = census(3, 'none')
  const twisted = census(3, 'fermi', 'twisted')
  const pair = census(2, 'fermi')
  const all = [one, fermi, bose, none, twisted, pair]
  const I1c =
    fermi.dimension === 560 &&
    bose.dimension === 816 &&
    none.dimension === 4096 &&
    all.every(c => c.complete && c.wholeMultiplets)
  const I1 = I1a && I1b && I1c

  // ---------------- controls ----------------
  const C1 = !sameTable(fermi, none)
  const twistedHalfInteger = twisted.rows.filter(r => r.twoJ % 2 === 1)
  const C2 = twisted.rows.length > 0 && twistedHalfInteger.length === 0

  // ---------------- the gate ----------------
  const states = (c: Census, abs3Q: number, twoJ?: number): number =>
    c.rows
      .filter(
        r =>
          Math.abs(r.charge3) === abs3Q &&
          (twoJ === undefined || r.twoJ === twoJ),
      )
      .reduce((s, r) => s + r.states, 0)
  const electronStates = states(fermi, 3, 1)
  const thirdStates = states(fermi, 1)
  const twoThirdStates = states(fermi, 2)
  const controls = I1 && C1 && C2
  const status: Verdict['status'] = !controls
    ? 'partial'
    : electronStates === 0
      ? 'fail'
      : thirdStates > 0 && twoThirdStates > 0
        ? 'pass'
        : 'partial'

  // ---------------- READ ----------------
  const fermiOne = fermi.rows.filter(r => Math.abs(r.charge3) === 3)
  const gauss = fermiOne.filter(r => r.charge3 === -3 && r.nPlus % 2 === 0)
  const boseOne = bose.rows.filter(
    r => r.charge3 === -3 && r.twoJ === 1,
  )
  const pairRows = pair.rows.filter(r => r.charge3 >= 0)
  const quarkRows = fermi.rows.filter(r => r.charge3 === 1)
  const seconds = (Date.now() - started) / 1000

  return verdict({
    status,
    claim: `fermionic three-member states on one register level (560): |Q| = 1 with J = 1/2 in ${electronStates / 2} doublets (${electronStates} states, both tones; per tone ${fermiOne
      .filter(r => r.charge3 === -3)
      .map(r => `n+ ${r.nPlus} J ${r.twoJ}/2 x${r.multiplets}`)
      .join(', ')}), |Q| = 1/3 in ${thirdStates} states, |Q| = 2/3 in ${twoThirdStates} (3Q is odd for three members); the unprojected table differs (${C1}), the twisted rotation gives no half-integer J (${C2}), instrument ${I1}`,
    metrics: {
      I1: I1 ? 1 : 0,
      C1: C1 ? 1 : 0,
      C2: C2 ? 1 : 0,
      electronStates,
      thirdStates,
      twoThirdStates,
      fermiDimension: fermi.dimension,
      boseDimension: bose.dimension,
      noneDimension: none.dimension,
      gaussElectronDoublets: gauss
        .filter(r => r.twoJ === 1)
        .reduce((s, r) => s + r.multiplets, 0),
      boseElectronDoublets: boseOne.reduce((s, r) => s + r.multiplets, 0),
      pairTwoThirdStates: states(pair, 2),
      seconds,
    },
    control: {
      noneElectronStates: states(none, 3, 1),
      twistedHalfIntegerRows: twistedHalfInteger.length,
      twistedRows: twisted.rows.length,
    },
    notes: `L1, exact. Fermionic default (item 0002 not landed). |Q| = 1 per tone (Q = -1, love-sea holes): ${fermiOne
      .filter(r => r.charge3 === -3)
      .map(formatRow)
      .join('; ')}. Under Gauss (n+ even): ${gauss.map(formatRow).join('; ')}. Quark rows, Q = +1/3: ${quarkRows
      .map(formatRow)
      .join('; ')}. Bosonic Q = -1, J = 1/2: ${boseOne
      .map(formatRow)
      .join('; ')}. Two members, Q >= 0: ${pairRows.map(formatRow).join('; ')}. ${seconds.toFixed(1)} s.`,
  })
}
