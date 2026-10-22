// IS THERE A CP-ODD FLAVOR PIECE ON THE WILSON HALF OF R*, AND CAN A DYNAMICAL LIGHT IT BIASES BE RUN? (E-FRC-0293,
// moving-matter item 0012, readme step 5). E-SPN-0171: the wall's member flow is an index, +4 per flavor per E . B
// winding on face A and exactly -4 for the CP-conjugate winding, so a CP-symmetric history nets 0 and a net asymmetry
// needs the windings biased by a dynamical light pushed by CP-odd flavor currents. E-FRC-0258 is the baseline: exact P
// and CP violation, C kept, no asymmetry (partial). The item's order: first check the piece (on one half only, covariant,
// exact, keeping the full sea, as E-FRC-0267 did for handedness; a piece that fails ends the item as fail), then drive the
// wall with at least three dynamical field histories.
//
// DERIVED BEFORE THE RUN (code/measure/wall-asymmetry).
// 1. WHERE A CP-ODD FLAVOR STRUCTURE CAN LIVE. On one half, one flavor basis is removable (E-FRC-0259 point 2: W = P+ (x)
//    V + P- (x) 1 commutes with the stream, the Peierls phases and every projector). R*'s Wilson half holds two
//    flavor-carrying structures: the mass A+ (Q_S P+ in beat 1, A+^dag on Q_D P+ in beat 2) and the Wilson units Wv (Q_S
//    P+ in beat 2, Y on Q_D P+ in beat 1). Put the trimaximal V on the mass, A+ = V D V^dag, and the Wilson units diagonal
//    in the weak basis, Wv = diag(conj u_f^2) (each flavor's E-SPN-0166 Wilson unit). One W cannot diagonalize both, so
//    the phase is physical on the one half: the invariant det[H_m, H_w], H = (A + A^dag) / 2, is purely imaginary,
//    nonzero, and flips under V -> conj V; with Wv aligned (V conj D^2 V^dag) it is exactly 0 and W removes it.
// 2. ONE HALF, COVARIANT, EXACT. Every factor is a flavor matrix on Q_S P+-, Q_D P+-, so the piece keeps J (leak 0) and
//    its - half is E-FRC-0259's flavor-diagonal mass alone. W(F4) acts on slot (x) register and not on flavor, and Q_S P+,
//    Q_D P+ commute with the 576 rotations and no reflection (E-FRC-0267 P2), so the piece is covariant under the
//    rotations exactly as R* is. Every flavor matrix is unitary over Q(w), so the 576-mode pieces are unitary.
// 3. THE FULL SEA. Y = Wv^dag pairs S and D as the scalar Wilson schedule's y = conj v does: at K = 0 the S branch sees
//    A+ Wv and the D branch Y A+^dag = (A+ Wv)^dag, minus the same phases. PREDICTED: the + half's spectrum is minus itself
//    (CPT) at every K, and its flats (the frozen part of the sea, E-SPN-0175) number exactly the three flavor-diagonal
//    copies' flats. A Y that breaks the pairing (Y = Wv) breaks CPT: the check has teeth.
// 4. THE DYNAMICAL RUN IS BEYOND THE EXACT ENGINE (arithmetic, dynamicalLightCost). The flow is an index, so a bias needs
//    the winding itself moved, and a static sea carries no current (its sea energy is periodic in the uniform A2, which
//    only shifts k2): the bias is a non-equilibrium response of the whole sea. The light's uniform mode A2 couples to
//    every transverse momentum at once, so the run evolves every band state of the sea over the transverse grid,
//    together, each beat. On E-SPN-0171's slab (L 12, qa 15, three flavors, one half: 51,840 modes, 2,160 lower-band
//    states a momentum) over the smallest grid that resolves the supercell (15 x 15) and 2,000 beats (a few windings at a
//    field 0.01 a beat, below the 0.49 gap), the run is 2.3e17 flops and holds 4.0e11 bytes. Any reduction of the depth,
//    the supercell or the grid is a shrink the item forbids.
//
// GATES, fixed before the gate run (after wasym-probe, disclosed below).
//  K1 ONE HALF: each flavored piece leaves weight at most 1e-14 between the halves, and its - half block equals the - half
//     block of the same schedule with V = 1 and no Wilson flavor change, entry for entry, to 1e-14.
//  K2 COVARIANT: Q_S P+, Q_D P+, Q_S P-, Q_D P- commute exactly with each of the 576 rotations; Q_S P+ and Q_D P+ with
//     none of the 576 reflections.
//  K3 EXACT: A+ A+^dag = 1, Wv Wv^dag = 1, Y Y^dag = 1 exactly over Q(w); each 576-mode piece unitary to 1e-12.
//  K4 KEEPS THE FULL SEA: at K = 0 and 16 Weyl momenta the + half's 288-mode cycle has exactly the flats of the three
//     flavor-diagonal copies (|phase| <= 1e-8) and is minus itself up to a rephasing to 1e-9 (CPT).
//  CP1 THE PHASE IS PHYSICAL: det[H_m, H_w] is nonzero with real part exactly 0, and conj V gives exactly its negative.
// CONTROLS (a failure makes the verdict partial). C1 ALIGNED: with Wv = V conj D^2 V^dag the invariant is exactly 0 and
//  the + half's spectrum equals the union of the three copies to 1e-10 at every momentum. C2 TEETH: Y = Wv (the pairing
//  broken) misses CPT by more than 1e-3 at every momentum.
// INSTRUMENT (a failure makes the verdict partial). I1 with V = 1 the + half's spectrum equals the union of the three
//  one-flavor halfPieces(wilsonSchedule(..., half P+)) spectra of E-FRC-0267 / E-SPN-0171 to 1e-10 at every momentum.
// READ, gating nothing: the rest phases, the invariant's value, the run's cost.
// Verdict: fail if K1 to K4 or CP1 fails (the piece fails and ends the item); partial if a control or the instrument
// fails; open otherwise, since the dynamical-light run the gates need is beyond the exact engine (point 4).
//
// PROBE BEFORE THE GATE RUN, disclosed (tmp/wasym-probe.log, 14 s, no gate moved after it): invariant (0, 1.82e-5 i),
//  conj V the negative, aligned 0; unitarity 4.8e-15; leak 6.9e-18; at K = 0 and 2 momenta flats 264 / 240 against the
//  copies' 264 / 240, CPT 1.3e-15 to 3.3e-15, V = 1 and aligned against the copies 2.2e-15 to 4.4e-15, the flavored half
//  off the copies by 3.3e-2 to 1.9e-1 (the phase is physical), Y = Wv off CPT by 1.1 to 1.3. Rest phases +-1.9093,
//  +-2.2921, +-2.5556 against the copies' +-2.0944, +-2.2815, +-2.3811.
//
// FIRST RUN (tmp/wasym-run1.log, 46 s): FAIL on K2 alone, an instrument error, not the piece: K2 fed commutesExactly the
//  scaled products Q_D P+- (1 / 48 times 1 / 2, rounded), and the exact comparison kept 192 of 576 rotations, where
//  E-FRC-0267 P2 reads the integer 96 Q_D P+ at 576. Commuting is scale-free, so K2 now reads the integer multiples
//  48 Q_S P+-, 96 Q_D P+- (the gate's statement unchanged). Every other gate held as in the probe: K1 leak 6.9e-18, K3
//  4.8e-15, K4 flats equal at 17 momenta and CPT 4.9e-15, CP1 1.820248e-5 i, C1 4.4e-15, C2 at least 0.88, I1 4.2e-15.
// SECOND RUN (tmp/wasym.log, 47 s): OPEN, as derived. K2 576/576/576/576 rotations, 0/0 reflections; every other gate,
//  control and the instrument as in the first run. The dynamical-light run: 2.3e17 flops and 4.0e11 bytes a history.
//
// PART 'symmetry' (item 0044, decision 009 point 2): every exact symmetry of the flavored slab cycle (E-SPN-0171's slab,
// L 12, qa 15, p 1: depths 0 .. 5 the flavored Wilson half, 6 .. 11 the mass alone, A+ = V D V^dag in both) that commutes
// with a uniform A2 and the wall-side member number N (depths 3 .. 8, E-SPN-0171's flow depths).
//  CANDIDATES: the 16 sign maps x -> signs x (the only W(F4) elements that keep the depth axis, the field's x0 supercell
//   and the drive's x2 axis each to itself up to sign; a reversed depth comes with the shift 5 - c that keeps the
//   profile), each unitary or antiunitary, with the stream kept or inverted (the T-type pairing) and the beats kept or
//   exchanged: 128, and the magnetic step x0 -> x0 + 1. The dock part is the slot map times a 12 x 12 operator on (half
//   register, flavor) SOLVED from the null space of the linear map on both regions' two pieces, never assumed.
//  GATES (fixed before the run): a candidate survives when its operator is unitary and intertwines every 288-mode piece
//   to 1e-12, the one-dock cycle at 2 Weyl momenta with A2 in {0, 0.3, 0.7} to 1e-12, and on the slab the profile is
//   kept, every mapped hop lands on its target, the field's mismatch is a lattice gradient (holonomy 1e-12 on every
//   inverse, triangle and square of roots), the class gauge holds at the test momenta with the drive sent to +A2 or -A2
//   (1e-12), and N is kept or exchanged with the other wall's side. KILL (fixed 2026-10-08, 0012 by proof): a survivor
//   that maps every history to itself (rev false, drive kept) and the flow to minus itself (a unitary that exchanges
//   the wall sides, or a beat-order-keeping antiunitary, phi -> -phi, that keeps them: the sea goes to its complement).
//   Else report the orbits of the 15 x 15 (k0, k1) grid under the history-keeping unitaries, the flops a history, and
//   three histories with zero net E . B winding built from the slab's own frequencies, none self-mirror.
//  CONTROL C1: the aligned piece (Wv = V conj D^2 V^dag) shows an E . B-flipping symmetry the trimaximal lacks.
//  INSTRUMENT I1: the identity survives on both, and the magnetic step survives with dK = B e1 (mod the reciprocal
//   lattice). H1: every history's winding is 0 to 1e-12 and none is within 1e-3 of its image under a non-identity
//   survivor.
//  Status: fail on KILL; partial when I1, C1 or H1 fails; open otherwise (the flow is not run under this item).
// SYMMETRY FIRST RUN (tmp/wasym-sym-run1.log, 404 s): PARTIAL by an instrument error, I1 false: the identity's operator
//  read 1.9e-8 (the Gram's null vectors carry about sqrt(eps), and the twirl refinement did not converge). The twirl was
//  replaced by iterative refinement from the direct residual; no gate moved.
// SYMMETRY SECOND RUN (tmp/wasym-sym.log, 384 s): OPEN. Trimaximal survivors 5, residuals at most 2.9e-17 (dock) and
//  3.4e-16 (cycle): the identity, the magnetic step (dK = 2 pi / 15 e1), the rotation (--++) (history kept, N kept),
//  and (++--), (----) (the CP mirror -A2, N exchanged: flow(-h) = -flow(h) EXACTLY, by a parity, for any flavors).
//  No KILL. Orbits 8 of 225 (15 under the magnetic step alone): 17,280 (momentum, band state) vectors, 8.3e15 flops a
//  history (from 2.3e17). C1: the aligned piece adds the antiunitary T-type maps (-+-+) anti rev and (+--+) anti rev
//  (E . B flipped by time reversal), which the trimaximal breaks (residual 2.3e-3). Histories: winding 3e-35 or less.
//
// DETERMINISM: no random numbers (Weyl sequences). EXACT: the flavor algebra in Q(w) BigInt, the projectors integer or
// dyadic; the spectra are floats, as measurement. NOTHING MOVES: the pieces act on a dock's own slots, register and
// flavor, and the stream takes each slot's value one dock along.

import { experiment } from '@/test/scaffold/suite'
import { verdict, type Verdict } from '@/test/scaffold/verdict'
import { ringUnit, unitAngle } from '@/code/measure/swap-string'
import { DOCK_ROOTS } from '@/code/measure/dock-mixer'
import { weylMomenta } from '@/code/measure/singlet-kinematics'
import {
  commutesExactly,
  f4Group,
  matMul,
  partnerProjector48,
  scaled,
  singletProjector24,
} from '@/code/measure/spinor-register'
import {
  chirality2,
  det4,
  phaseMismatch,
  sectorBasis,
  trimaximal,
  volumeRight,
} from '@/code/measure/chiral-register'
import { halfPhases, halfPieces } from '@/code/measure/chiral-flow'
import { wilsonSchedule } from '@/code/measure/wilson-register'
import {
  qwConj,
  qwDagger,
  qwDiag,
  qwEq,
  qwFromEisQMatrix,
  qwFromUnit,
  qwIdentity,
  qwMatEq,
  qwMatMul,
  qwMul,
  qwSub,
  qwValue,
  QW_ZERO,
  type QWMatrix,
} from '@/code/measure/flavor-register'
import {
  cConj,
  cDagger,
  cpInvariant,
  dockCycleResidual,
  dockIntertwiner,
  dynamicalLightCost,
  flavoredHalfSchedule,
  flavorHalfBlock,
  flavorHalfPhases,
  HALF_FLAVOR_MODES,
  momentumOrbits,
  qwConjugate,
  qwRealIsZero,
  slabPeriods,
  slabSymmetry,
  slotMap,
  unitarityGap,
  type Candidate,
  type DockPair,
  type Signs,
} from '@/code/measure/wall-asymmetry'
import { type Slab } from '@/code/measure/wilson-register'
import { type CMatrix } from '@/code/measure/dock-mixer'

// E-SPN-0171's three flavor units, whose Wilson walls keep the field gap (its FLAVORS)
const FLAVOR_UNITS: readonly (readonly [number, number])[] = [
  [-2, 5],
  [6, 0],
  [0, 4],
]

export type WallAsymmetryPlan = {
  momenta: number
  slab: { L: number; qa: number; transverse: number; beats: number }
}

export const GATE_PLAN: WallAsymmetryPlan = {
  momenta: 16,
  slab: { L: 12, qa: 15, transverse: 225, beats: 2000 },
}

const flag = (b: boolean): number => (b ? 1 : 0)

export default experiment({
  id: 'gauge/wall-asymmetry',
  code: 'E-FRC-0293',
  title:
    'a CP-odd flavor structure on the Wilson half of R* passes the piece check, and the dynamical light it would bias is beyond the exact engine, open: the trimaximal mixing on the mass and the Wilson units diagonal in the weak basis make two flavor bases on one half, so the phase is physical there (det[H_m, H_w] imaginary, nonzero, odd under conj V, exactly 0 when aligned); the pieces keep J, are covariant under the 576 rotations, unitary, keep CPT and the flats of the sea; the flow it would bias is an index, so a net asymmetry needs the whole sea evolved under a dynamical uniform light, 2.3e17 flops and 4e11 bytes on E-SPN-0171 slab, not run',
  category: 'gauge',
  substrates: ['3434'],
  depth: 'L2',
  paper: false,
  run() {
    const piece = wallAsymmetryRun(GATE_PLAN)
    const symmetry = symmetryRun(SYMMETRY_PLAN)
    const rank = { fail: 3, partial: 2, open: 1, pass: 0 } as Record<string, number>
    const status = [piece.status, symmetry.status].sort(
      (a, b) => (rank[b] ?? 0) - (rank[a] ?? 0),
    )[0]!

    return verdict({
      status,
      claim: `PART piece: ${piece.claim}. ${symmetry.claim}`,
      metrics: {
        ...piece.metrics,
        ...Object.fromEntries(
          Object.entries(symmetry.metrics).map(([k, v]) => [`symmetry_${k}`, v]),
        ),
      },
      control: {
        ...piece.control,
        symmetryC1: symmetry.metrics['C1'] ?? 0,
        symmetryI1: symmetry.metrics['I1'] ?? 0,
      },
      notes: `${piece.notes} ${symmetry.notes}`,
    })
  },
})

const unitValue = (kj: readonly [number, number]): [number, number] => {
  const t = unitAngle(ringUnit(kj[0], kj[1]))

  return [Math.cos(t), Math.sin(t)]
}

const isUnitary = (A: QWMatrix): boolean =>
  qwMatEq(qwMatMul(A, qwDagger(A)), qwIdentity(3))

export function wallAsymmetryRun(plan: WallAsymmetryPlan): Verdict {
  const started = Date.now()
  const log = (what: string): void =>
    console.error(`${what} ${Math.round((Date.now() - started) / 1000)}s`)
  const S24 = singletProjector24()
  const D48 = partnerProjector48()
  const J = volumeRight()
  const qS = scaled(S24, 24)
  const qD = scaled(D48, 48)
  const pPlus = scaled(chirality2(J, 1), 2)
  const pMinus = scaled(chirality2(J, -1), 2)
  const basis = sectorBasis(J)
  const proj = {
    qSPlus: matMul(qS, pPlus),
    qSMinus: matMul(qS, pMinus),
    qDPlus: matMul(qD, pPlus),
    qDMinus: matMul(qD, pMinus),
  }

  // ---- the exact flavor algebra ----
  const units = FLAVOR_UNITS.map(k => qwFromUnit(ringUnit(k[0], k[1])))
  const D = qwDiag(units)
  const Wv = qwDiag(units.map(u => qwMul(qwConj(u), qwConj(u))))
  const V = qwFromEisQMatrix(trimaximal())
  const aPlus = qwMatMul(qwMatMul(V, D), qwDagger(V))
  const aligned = qwMatMul(qwMatMul(V, Wv), qwDagger(V))
  const inv = cpInvariant(aPlus, Wv)
  const invConj = cpInvariant(qwConjugate(aPlus), qwConjugate(Wv))
  const invAligned = cpInvariant(aPlus, aligned)
  const CP1 =
    !qwEq(inv, QW_ZERO) &&
    qwRealIsZero(inv) &&
    qwEq(invConj, qwSub(QW_ZERO, inv))
  const K3exact = [aPlus, D, Wv, qwDagger(Wv), aligned].every(isUnitary)

  // ---- the pieces ----
  const schedule = (aP: QWMatrix, wv: QWMatrix, y?: QWMatrix) =>
    flavoredHalfSchedule({ ...proj, aPlus: aP, aMinus: D, wv, ...(y ? { y } : {}) })
  const flavored = schedule(aPlus, Wv)
  const plain = schedule(D, Wv)
  const unitGaps = flavored.map(P => unitarityGap(P, 576))
  const K3 = K3exact && unitGaps.every(g => g <= 1e-12)

  log('pieces')

  const plusBlocks = flavored.map(P => flavorHalfBlock(P, basis, 0))
  const minusBlocks = flavored.map(P => flavorHalfBlock(P, basis, 1))
  const plainMinus = plain.map(P => flavorHalfBlock(P, basis, 1))
  const leak = Math.max(...[...plusBlocks, ...minusBlocks].map(b => b.leak))

  let minusGap = 0

  minusBlocks.forEach((b, k) => {
    const c = plainMinus[k]!.block

    for (let i = 0; i < b.block.re.length; i++) {
      minusGap = Math.max(
        minusGap,
        Math.hypot(b.block.re[i]! - c.re[i]!, b.block.im[i]! - c.im[i]!),
      )
    }
  })

  const K1 = leak <= 1e-14 && minusGap <= 1e-14

  // ---- K2: covariance ----
  const group = f4Group()
  const rotations = group.filter(g => det4(g.matrix) === 1)
  const reflections = group.filter(g => det4(g.matrix) === -1)
  // the integer multiples 48 Q_S P+-, 96 Q_D P+- (E-FRC-0267 P2's matrices): commuting is scale-free, and the scaled
  // products carry rounding (1 / 48 is not dyadic), which an exact comparison reads as a failure (first run, disclosed)
  const chiPlus = chirality2(J, 1)
  const chiMinus = chirality2(J, -1)
  const integerProj = [
    matMul(S24, chiPlus),
    matMul(D48, chiPlus),
    matMul(S24, chiMinus),
    matMul(D48, chiMinus),
  ]
  const rotKept = integerProj.map(
    q => rotations.filter(g => commutesExactly(g, q)).length,
  )
  const refKept = integerProj.slice(0, 2).map(
    q => reflections.filter(g => commutesExactly(g, q)).length,
  )
  const K2 =
    rotations.length === 576 &&
    reflections.length === 576 &&
    rotKept.every(n => n === 576) &&
    refKept.every(n => n === 0)

  log('K2')

  // ---- K4, C1, C2, I1: the spectra ----
  const blocksOf = (P: ReturnType<typeof schedule>) =>
    P.map(x => flavorHalfBlock(x, basis, 0).block)
  const plainPlus = blocksOf(plain)
  const alignedPlus = blocksOf(schedule(aPlus, aligned))
  const teethPlus = blocksOf(schedule(aPlus, Wv, Wv))
  const copies = FLAVOR_UNITS.map(
    kj =>
      halfPieces(
        wilsonSchedule(qS, qD, unitValue(kj), { wilson: true, half: pPlus }),
        basis,
        0,
      ).pieces,
  )
  const flats = (ph: readonly number[]): number =>
    ph.filter(x => Math.abs(x) <= 1e-8).length
  const momenta = [[0, 0, 0, 0], ...weylMomenta(plan.momenta)]

  let flatsOk = true
  let cpt = 0
  let alignedGap = 0
  let instrumentGap = 0
  let teethMin = Infinity
  let physical = Infinity
  let restPhases: number[] = []
  let restCopies: number[] = []

  for (const K of momenta) {
    const ph = flavorHalfPhases(plusBlocks.map(b => b.block), K, DOCK_ROOTS)
    const union = copies.flatMap(c => halfPhases(c, { q: 1, p: 0 }, K))
    const pv = flavorHalfPhases(plainPlus, K, DOCK_ROOTS)
    const pa = flavorHalfPhases(alignedPlus, K, DOCK_ROOTS)
    const pt = flavorHalfPhases(teethPlus, K, DOCK_ROOTS)

    flatsOk = flatsOk && flats(ph) === flats(union)
    cpt = Math.max(cpt, phaseMismatch(ph, ph.map(x => -x), true))
    alignedGap = Math.max(alignedGap, phaseMismatch(pa, union, false))
    instrumentGap = Math.max(instrumentGap, phaseMismatch(pv, union, false))
    teethMin = Math.min(teethMin, phaseMismatch(pt, pt.map(x => -x), true))
    physical = Math.min(physical, phaseMismatch(ph, union, false))

    if (K.every(x => x === 0)) {
      const nonFlat = (x: readonly number[]): number[] =>
        x.filter(v => Math.abs(v) > 1e-8).sort((a, b) => a - b)

      restPhases = nonFlat(ph)
      restCopies = nonFlat(union)
    }
  }

  log('spectra')

  const K4 = flatsOk && cpt <= 1e-9
  const C1 = qwEq(invAligned, QW_ZERO) && alignedGap <= 1e-10
  const C2 = teethMin > 1e-3
  const I1 = instrumentGap <= 1e-10
  const hard = K1 && K2 && K3 && K4 && CP1
  const status = !hard ? 'fail' : !C1 || !C2 || !I1 ? 'partial' : 'open'
  const cost = dynamicalLightCost({
    L: plan.slab.L,
    qa: plan.slab.qa,
    flavors: 3,
    transverse: plan.slab.transverse,
    beats: plan.slab.beats,
  })
  const invValue = qwValue(inv)
  const uniq = (x: readonly number[]): string =>
    [...new Set(x.map(v => v.toFixed(4)))].join(' ')

  return verdict({
    status,
    claim: `K1 ${K1} (leak ${leak.toExponential(1)}, - half against the unflavored ${minusGap.toExponential(1)}) K2 ${K2} (Q_S P+, Q_D P+, Q_S P-, Q_D P- keep ${rotKept.join('/')} of 576 rotations; Q_S P+, Q_D P+ keep ${refKept.join('/')} of 576 reflections) K3 ${K3} (flavor matrices unitary over Q(w) ${K3exact}; pieces ${unitGaps.map(g => g.toExponential(1)).join(', ')}) K4 ${K4} (flats equal to the copies at ${momenta.length} momenta ${flatsOk}, CPT ${cpt.toExponential(1)}) CP1 ${CP1} (det[H_m, H_w] = ${invValue[0]} + ${invValue[1].toExponential(6)} i, conj V the negative, aligned ${qwEq(invAligned, QW_ZERO) ? 0 : 'nonzero'}; the flavored half off the copies by at least ${physical.toExponential(1)}); controls C1 ${C1} (aligned against the copies ${alignedGap.toExponential(1)}) C2 ${C2} (Y = Wv off CPT by at least ${teethMin.toExponential(1)}); instrument I1 ${I1} (V = 1 against the copies ${instrumentGap.toExponential(1)}). The dynamical-light run (at least three histories on the slab L ${plan.slab.L}, qa ${plan.slab.qa}, ${plan.slab.transverse} transverse momenta, ${plan.slab.beats} beats): ${cost.modes} modes and ${cost.bandStates} band states a momentum, ${cost.flops.toExponential(1)} flops a history, ${cost.bytes.toExponential(1)} bytes: not run`,
    metrics: {
      K1: flag(K1),
      K2: flag(K2),
      K3: flag(K3),
      K4: flag(K4),
      CP1: flag(CP1),
      C1: flag(C1),
      C2: flag(C2),
      I1: flag(I1),
      invariantIm: invValue[1],
      leak,
      cpt,
      physical,
      teethMin,
      runFlops: cost.flops,
      runBytes: cost.bytes,
      seconds: (Date.now() - started) / 1000,
    },
    control: { C1: flag(C1), C2: flag(C2), I1: flag(I1) },
    notes: `L1 (the flavor algebra, exact) and L2 (the 576-mode pieces and the + half's spectra). Rest phases of the flavored half ${uniq(restPhases)} against the copies ${uniq(restCopies)} (read). ${((Date.now() - started) / 1000).toFixed(0)} s.`,
  })
}

// ================= PART 'symmetry' (item 0044, decision 009 point 2) =================

export type SymmetryPlan = {
  slab: { L: number; qa: number; p: number }
  /** Weyl test momenta for the stream checks. */
  momenta: number
  /** Uniform A2 values (0 and two drives). */
  drives: readonly number[]
  /** The transverse grid side (k0, k1). */
  grid: number
  beats: number
  /** The largest field a beat, max |A2(t + 1) - A2(t)|. */
  peakField: number
}

export const SYMMETRY_PLAN: SymmetryPlan = {
  slab: { L: 12, qa: 15, p: 1 },
  momenta: 2,
  drives: [0, 0.3, 0.7],
  grid: 15,
  beats: 2000,
  peakField: 0.01,
}

const TOL = 1e-12

const signName = (s: Signs): string =>
  `(${s.map(x => (x > 0 ? '+' : '-')).join('')})`

export function censusCandidates(): Candidate[] {
  const out: Candidate[] = []

  for (let bits = 0; bits < 16; bits++) {
    const signs = [0, 1, 2, 3].map(k => (bits >> k) & 1 ? -1 : 1) as unknown as Signs

    for (const anti of [false, true]) {
      for (const rev of [false, true]) {
        for (const swap of [false, true]) {
          out.push({
            name: `${signName(signs)}${anti ? ' anti' : ''}${rev ? ' rev' : ''}${swap ? ' swap' : ''}`,
            signs,
            anti,
            rev,
            swap,
            shift0: 0,
          })
        }
      }
    }
  }

  out.push({
    name: 'magnetic step x0',
    signs: [1, 1, 1, 1],
    anti: false,
    rev: false,
    swap: false,
    shift0: 1,
  })

  return out
}

export type CensusRow = {
  name: string
  candidate: Candidate
  nullity: number
  lowest: number
  dockResidual: number
  unitarity: number
  cycleResidual: number
  profileKept: boolean
  landing: boolean
  holonomy: number
  dK: number[]
  driveKept: number
  driveFlipped: number
  nMap: string
  survives: boolean
  /** The image of a history: itself, CP mirror (-A2), time reverse (A2(T - t)), time-reversed CP mirror. */
  history: string
  /** E . B of the image against the history's: +1 kept, -1 flipped. */
  eDotB: number
  /** flow(image) = flowSign * flow(history), for the maps that keep the sea (rev false); 0 when no statement. */
  flowSign: number
  kill: boolean
}

function censusOf(
  slab: Slab,
  regions: readonly (readonly CMatrix[])[],
  candidates: readonly Candidate[],
  plan: SymmetryPlan,
  depths: ReadonlySet<number>,
  slabCache: Map<string, ReturnType<typeof slabSymmetry>>,
): CensusRow[] {
  const n = HALF_FLAVOR_MODES
  const conj = regions.map(r => r.map(cConj))
  const dag = regions.map(r => r.map(P => cDagger(P, n)))
  const momenta = weylMomenta(plan.momenta)

  return candidates.map(c => {
    const slot = slotMap(DOCK_ROOTS, c.signs, c.rev)
    const pairs: DockPair[] = []

    regions.forEach((pieces, r) => {
      for (let b = 0; b < 2; b++) {
        const t = c.swap ? 1 - b : b

        pairs.push({
          x: c.anti ? conj[r]![b]! : pieces[b]!,
          y: c.rev ? dag[r]![t]! : pieces[t]!,
        })
      }
    })

    const dock = dockIntertwiner(pairs, slot)
    const sl =
      slabCache.get(c.name) ??
      slabSymmetry(slab, c, DOCK_ROOTS, slot, momenta, plan.drives, depths)

    slabCache.set(c.name, sl)

    const dockOk = dock.residual <= TOL && dock.unitarity <= TOL
    const driveOk = sl.driveKept <= TOL || sl.driveFlipped <= TOL
    const slabOk =
      sl.profileKept && sl.landing && sl.holonomy <= TOL && driveOk && sl.nMap !== 'other'

    let cycleResidual = Infinity

    if (dockOk && dock.M) {
      cycleResidual = 0

      for (const pieces of regions) {
        for (const K of momenta) {
          for (const A2 of plan.drives) {
            cycleResidual = Math.max(
              cycleResidual,
              dockCycleResidual(pieces, c, slot, dock.M, [K[0]!, K[1]!, K[2]! + A2, K[3]!], DOCK_ROOTS),
            )
          }
        }
      }
    }

    const survives = dockOk && slabOk && cycleResidual <= TOL
    const sA = sl.driveKept <= TOL ? 1 : -1
    const history = !c.rev
      ? sA > 0
        ? 'itself'
        : 'CP mirror'
      : sA > 0
        ? 'time reverse'
        : 'time-reversed CP mirror'
    // E = -dA2/dt: reversing time flips it once more
    const eDotB = c.rev ? -sA : sA
    // a map that keeps the sea's phases (unitary) keeps the sea; an antiunitary that keeps the beat order (phi -> -phi)
    // sends the sea to its complement, so a member count to minus itself; the depth map multiplies by -1 when it
    // exchanges the wall sides (the total is conserved). A time-reversing map sends the sea to an evolved state, so it
    // says nothing about a flow from the sea.
    const flowSign = c.rev
      ? 0
      : (c.anti ? -1 : 1) * (sl.nMap === 'exchanged' ? -1 : 1)
    const kill = survives && history === 'itself' && flowSign === -1

    return {
      name: c.name,
      candidate: c,
      nullity: dock.nullity,
      lowest: dock.lowest,
      dockResidual: dock.residual,
      unitarity: dock.unitarity,
      cycleResidual,
      profileKept: sl.profileKept,
      landing: sl.landing,
      holonomy: sl.holonomy,
      dK: sl.dK,
      driveKept: sl.driveKept,
      driveFlipped: sl.driveFlipped,
      nMap: sl.nMap,
      survives,
      history,
      eDotB,
      flowSign,
      kill,
    }
  })
}

export function symmetryRun(plan: SymmetryPlan): Verdict {
  const started = Date.now()
  const log = (what: string): void =>
    console.error(`${what} ${Math.round((Date.now() - started) / 1000)}s`)
  const S24 = singletProjector24()
  const D48 = partnerProjector48()
  const J = volumeRight()
  const qS = scaled(S24, 24)
  const qD = scaled(D48, 48)
  const pPlus = scaled(chirality2(J, 1), 2)
  const pMinus = scaled(chirality2(J, -1), 2)
  const basis = sectorBasis(J)
  const proj = {
    qSPlus: matMul(qS, pPlus),
    qSMinus: matMul(qS, pMinus),
    qDPlus: matMul(qD, pPlus),
    qDMinus: matMul(qD, pMinus),
  }
  const units = FLAVOR_UNITS.map(k => qwFromUnit(ringUnit(k[0], k[1])))
  const D = qwDiag(units)
  const Wv = qwDiag(units.map(u => qwMul(qwConj(u), qwConj(u))))
  const V = qwFromEisQMatrix(trimaximal())
  const aPlus = qwMatMul(qwMatMul(V, D), qwDagger(V))
  const aligned = qwMatMul(qwMatMul(V, Wv), qwDagger(V))
  const plusOf = (wv: QWMatrix): CMatrix[] =>
    flavoredHalfSchedule({ ...proj, aPlus, aMinus: D, wv }).map(
      P => flavorHalfBlock(P, basis, 0).block,
    )
  // E-SPN-0171's slab: depth classes 0 .. L/2 - 1 carry the Wilson units (set 1), the rest the mass alone (set 0)
  const plain = plusOf(qwIdentity(3))
  const regionsOf = (wv: QWMatrix): CMatrix[][] => [plain, plusOf(wv)]
  const { L, qa, p } = plan.slab
  const slab: Slab = {
    L,
    qa,
    p,
    profile: Array.from({ length: L }, (_, c) => (c < L / 2 ? 1 : 0)),
  }
  const depths = new Set(Array.from({ length: L / 2 }, (_, i) => (L / 4 + i) % L))
  const candidates = censusCandidates()
  const slabCache = new Map<string, ReturnType<typeof slabSymmetry>>()
  const tri = censusOf(slab, regionsOf(Wv), candidates, plan, depths, slabCache)

  log('census trimaximal')

  const ali = censusOf(slab, regionsOf(aligned), candidates, plan, depths, slabCache)

  log('census aligned')

  const triSurv = tri.filter(r => r.survives)
  const aliSurv = ali.filter(r => r.survives)
  const kills = triSurv.filter(r => r.kill)
  const KILL = kills.length > 0

  // ---- instrument: the identity and the magnetic step ----
  const identity = tri.find(r => r.name === '(++++)')!
  const magnetic = tri.find(r => r.name === 'magnetic step x0')!
  const B = (2 * Math.PI * p) / qa
  const periods = slabPeriods(slab)
  const sameMod = (a: readonly number[], b: readonly number[]): boolean =>
    periods.every(t => {
      const x = t.reduce((s, v, k) => s + v * (a[k]! - b[k]!), 0) / (2 * Math.PI)

      return Math.abs(x - Math.round(x)) <= 1e-9
    })
  const magneticShift =
    sameMod(magnetic.dK, [0, B, 0, 0]) || sameMod(magnetic.dK, [0, -B, 0, 0])
  const I1 =
    identity.survives &&
    ali.find(r => r.name === '(++++)')!.survives &&
    magnetic.survives &&
    magneticShift

  // ---- the orbits of the transverse grid under the history-keeping unitaries ----
  const keepers = triSurv.filter(
    r => !r.candidate.anti && !r.candidate.rev && !r.candidate.swap && r.history === 'itself',
  )
  const grid: number[][] = []

  for (let i = 0; i < plan.grid; i++) {
    for (let j = 0; j < plan.grid; j++) {
      grid.push([(2 * Math.PI * i) / (qa * plan.grid), (2 * Math.PI * j) / plan.grid, 0, 0])
    }
  }

  const orbitsMagnetic = momentumOrbits(grid, [magnetic].map(r => ({ signs: r.candidate.signs, dK: r.dK })), periods)
  const orbits = momentumOrbits(
    grid,
    keepers.map(r => ({ signs: r.candidate.signs, dK: r.dK })),
    periods,
  )
  const cost = dynamicalLightCost({ L, qa, flavors: 3, transverse: grid.length, beats: plan.beats })
  const reducedFlops = (cost.flops * orbits.orbits) / grid.length

  // ---- three zero-winding histories from the slab's own frequencies ----
  const wilsonBlocks = regionsOf(Wv)[1]!
  const rest = [
    ...new Set(
      flavorHalfPhases(wilsonBlocks, [0, 0, 0, 0], DOCK_ROOTS)
        .filter(x => x > 1e-8)
        .map(x => x.toFixed(10)),
    ),
  ]
    .map(Number)
    .sort((a, b) => a - b)
  const [p0, p1, p2] = [rest[0]!, rest[1]!, rest[2]!]
  const pairsW: [number, number][] = [
    [p1 - p0, p2 - p1],
    [p2 - p1, p2 - p0],
    [p1 - p0, p2 - p0],
  ]
  const T = plan.beats
  const shape = (wa: number, wb: number) => (t: number): number =>
    Math.sin((Math.PI * t) / T) ** 2 * (Math.sin(wa * t) + 0.5 * Math.sin(wb * t + Math.PI / 3))
  const histories = pairsW.map(([wa, wb]) => {
    const f = shape(wa, wb)

    let step = 0

    for (let t = 0; t < T; t++) {
      step = Math.max(step, Math.abs(f(t + 1) - f(t)))
    }

    const amp = plan.peakField / step
    const h = Array.from({ length: T + 1 }, (_, t) => amp * f(t))

    return { wa, wb, amp, h, winding: (h[T]! - h[0]!) / (2 * Math.PI) }
  })
  const imageOf = (h: readonly number[], r: CensusRow): number[] => {
    const sA = r.driveKept <= TOL ? 1 : -1

    return h.map((_, t) => sA * h[r.candidate.rev ? T - t : t]!)
  }
  const mirrors = triSurv.filter(r => r.history !== 'itself')

  let selfMirror = Infinity

  for (const hi of histories) {
    const top = Math.max(...hi.h.map(Math.abs))

    for (const r of mirrors) {
      const img = imageOf(hi.h, r)

      selfMirror = Math.min(selfMirror, Math.max(...img.map((x, t) => Math.abs(x - hi.h[t]!))) / top)
    }
  }

  const H1 =
    histories.every(x => Math.abs(x.winding) <= 1e-12) && selfMirror > 1e-3

  // ---- CONTROL: the aligned piece shows a CP symmetry the trimaximal lacks ----
  const triNames = new Set(triSurv.map(r => r.name))
  const cpOnlyAligned = aliSurv.filter(r => r.eDotB < 0 && !triNames.has(r.name))
  const aliNames = new Set(aliSurv.map(r => r.name))
  const triOnly = triSurv.filter(r => !aliNames.has(r.name))
  const C1 = cpOnlyAligned.length > 0

  const status = KILL ? 'fail' : !I1 || !C1 || !H1 ? 'partial' : 'open'
  const row = (r: CensusRow): string =>
    `${r.name} [${r.history}, E.B ${r.eDotB > 0 ? 'kept' : 'flipped'}, N ${r.nMap}, flow ${r.flowSign === 0 ? 'no statement' : r.flowSign > 0 ? 'kept' : 'minus'}, commutant ${r.nullity}, dock ${r.dockResidual.toExponential(1)}, cycle ${r.cycleResidual.toExponential(1)}, dK (${r.dK.map(x => x.toFixed(4)).join(', ')})]`
  const failReason = (r: CensusRow): string =>
    r.dockResidual > TOL
      ? `dock ${Number.isFinite(r.dockResidual) ? r.dockResidual.toExponential(1) : 'singular'}`
      : !r.profileKept
        ? 'profile'
        : !r.landing
          ? 'landing'
          : r.holonomy > TOL
            ? `field holonomy ${r.holonomy.toFixed(3)}`
            : r.nMap === 'other'
              ? 'N'
              : `stream ${Math.min(r.driveKept, r.driveFlipped).toExponential(1)}`
  const historyLine = histories
    .map(
      (x, i) =>
        `h${i + 1}(t) = ${x.amp.toPrecision(10)} sin^2(pi t / ${T}) [sin(${x.wa.toFixed(10)} t) + 0.5 sin(${x.wb.toFixed(10)} t + pi/3)], t = 0 .. ${T} beats, winding ${x.winding.toExponential(1)}; CP mirror -h${i + 1}`,
    )
    .join('; ')
  const failCounts = new Map<string, number>()

  tri
    .filter(r => !r.survives)
    .forEach(r => {
      const k = failReason(r).split(' ')[0]!

      failCounts.set(k, (failCounts.get(k) ?? 0) + 1)
    })

  return verdict({
    status,
    claim: `PART symmetry. Candidates ${candidates.length} (16 sign maps x unitary/antiunitary x stream kept/inverted x beats kept/exchanged, and the magnetic step), each checked on the 288-mode dock blocks of both slab regions (12 x 12 operator solved, residual <= 1e-12), the one-dock cycle and the slab stream at ${plan.momenta} momenta with A2 in {${plan.drives.join(', ')}}, the field, the profile and N. Trimaximal survivors ${triSurv.length}: ${triSurv.map(row).join('; ')}. Failures by first reason: ${[...failCounts].map(([k, v]) => `${k} ${v}`).join(', ')}. KILL ${KILL}${KILL ? ` (${kills.map(r => r.name).join(', ')}: maps every history to itself and the flow to minus itself)` : ' (no survivor maps every history to itself and the flow to minus itself)'}. Instrument I1 ${I1} (identity survives on both, the magnetic step survives with dK = (${magnetic.dK.map(x => x.toFixed(6)).join(', ')}) = B e1 ${magneticShift}). Orbits of the ${plan.grid} x ${plan.grid} (k0, k1) grid: ${orbitsMagnetic.orbits} under the magnetic step, ${orbits.orbits} under all ${keepers.length} history-keeping unitaries (grid closed ${orbits.closed}), so ${orbits.orbits} x ${cost.bandStates} = ${orbits.orbits * cost.bandStates} (momentum, band state) vectors and ${reducedFlops.toExponential(2)} flops a history (from ${cost.flops.toExponential(2)}). Histories H1 ${H1}: ${historyLine}; nearest to self-mirror under a surviving non-identity map ${selfMirror.toFixed(3)} of its peak. CONTROL C1 ${C1}: aligned survivors ${aliSurv.length}, E . B-flipping ones the trimaximal lacks: ${cpOnlyAligned.map(row).join('; ') || 'none'}; trimaximal-only survivors: ${triOnly.map(r => r.name).join(', ') || 'none'}`,
    metrics: {
      KILL: flag(KILL),
      I1: flag(I1),
      C1: flag(C1),
      H1: flag(H1),
      candidates: candidates.length,
      survivorsTrimaximal: triSurv.length,
      survivorsAligned: aliSurv.length,
      orbits: orbits.orbits,
      orbitsMagnetic: orbitsMagnetic.orbits,
      reducedFlops,
      fullFlops: cost.flops,
      selfMirror,
      seconds: (Date.now() - started) / 1000,
    },
    control: { C1: flag(C1), I1: flag(I1) },
    notes: `L2 (the dock blocks and the slab stream, the operators solved, never assumed). Frequencies: the flavored Wilson half's rest phases at K 0 (${rest.map(x => x.toFixed(6)).join(', ')}), spacings ${pairsW.flat().map(x => x.toFixed(6)).join(', ')}. Per candidate (trimaximal): ${tri.map(r => `${r.name}: ${r.survives ? 'SURVIVES' : failReason(r)}, null ${r.nullity}`).join('; ')}. ${((Date.now() - started) / 1000).toFixed(0)} s.`,
  })
}
