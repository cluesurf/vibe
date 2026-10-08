// THE DOCK ORIENTATION SIGN, READ AS A STAGGERED SIGN (E-FRC-0274). On the true mesh every step reverses orientation
// (E-FRC-0272), so each dock carries e(x) = det f_x = +-1. The guess under test: e is a center-odd scalar supplied by
// geometry. Read in an oriented frame instead of labels, a hop that keeps the label half flips the physical hand every
// step, which would be a term joining the register halves (the Higgs row's missing channel, E-FRC-0273) and an
// orientation-reading mass (the parity row's, E-FRC-0272), as in Kogut and Susskind's staggered fermions. The derivation
// is note/project/vibe/roadmap/research/remaining-pieces.md, "The orientation sign as a staggered sign".
//
// DERIVED BEFORE THE RUN (code/measure/orientation-taste, code/measure/cusp-register, code/substrate/coxeter).
// 1. THE FRAME CHANGE IS LOCAL. An oriented frame at each dock is f_x h_x with h_x = 1 where e = +1 and one reflection
//    rho where e = -1. On the register it is rho's minors on the odd docks, and they anticommute with J, so the oriented
//    frame's chirality is e(x) J. The rule in that frame is the same rule in another basis.
// 2. ONE STREAM FLIPS THE PHYSICAL HAND ENTIRELY, ONE CYCLE NOT AT ALL. Every value crosses one link a beat, to a dock
//    of the other sign, keeping its label half: after an odd number of beats all of a J_phys = +1 state is on J_phys = -1
//    (amplitude 1, the frame flip itself, which the local change removes), and after a cycle (two beats) it is back.
//    The cycle, the rule's period, commutes with e J: no joining term, no mass, no gap.
// 3. THE SIGN IS A CHARACTER, NOT A FIELD. det tau_d = -1 for all 24 transports and det is a homomorphism of the group
//    they generate, so e is single valued; on [3,4,3,4] it is chi(r0..r3) = +1, chi(r4) = -1, and every Coxeter relation
//    holds an even number of r4 (m_i4 even). As a link field e(x) e(y) = -1 everywhere, holonomy (-1)^length = +1 on
//    every loop: pure gauge. The genuine holonomy is the parallel transport read in labels: round the four cells about a
//    ridge a rotation of order 3 (E-SPN-0156), which commutes with J. On the husk e is (-1)^(h1 + h2 + h3) over the
//    cubes' integer coordinates: Kogut and Susskind's sign on the husk's cubic lattice.
// 4. TWO CLASSES. A value at dock x at beat t keeps e(x) (-1)^t, so spacetime splits into two classes that no dock-local
//    piece joins. The orientation-reading rule is, on the class that starts on e = +1 docks, the LABEL rule
//    [S(u+, u-)], [D(u-, u+)] (half + meets u+ then conj(u-)), and on the other class its mirror. The orientation-weighted
//    identity (u where e = +1, conj(u) where e = -1) is, on one class, u on both beats.
// 5. THE BAND WITH TWO FREE PHASES. U = (1 + (b - 1) P)(1 + (a - 1) Q) on each hand, so on each Jordan block of overlap
//    mu the eigenvalues solve l^2 - (a + b + (a - 1)(b - 1) mu) l + a b = 0. Label chiral: (u+-, conj u+-), masses M+ and
//    M-. Orientation-reading, one class: half + (u+, conj u-), half - (u-, conj u+): both hands the mean mass, offset
//    apart. Orientation-weighted: (u, u), massless (both rest levels at u, no gap at k = 0).
// 6. PARITY INSIDE ONE CLASS. g keeps the classes iff chi(g) = +1; the label chiral rule keeps g iff det phi(g) = +1;
//    det g = chi(g) det phi(g). So every husk mirror the label rule keeps swaps the classes, and within one class it
//    keeps none: the kept parity of E-FRC-0272 maps a class onto the other, a mirror world.
// 7. THE CENTER. 4 Gamma(-1) = -4 J in labels, every Gamma(h) commutes with J, and e is a number at each dock that no
//    local 2T move touches: center-even. In the oriented frame the center is -e J_phys, the same operator, so the center
//    count of E-FRC-0273 does not depend on the frame and psi_-^dag psi_+ stays center-odd.
//
// GATES, fixed before the gate run (GATE_PLAN: the ball of radius 3 for the flow reads, 8 beats, absorbing frontier;
// the ball of radius 2 with the cube group and the two-center region of radius 2 with the face group for parity, 6
// beats; the flat box of side 4; units: light u+ = ringUnit(-1, 4), u- = ringUnit(2, 2), E-FRC-0258's pair).
//  A CHECKERBOARD (exact). A1 m_i4 even for i = 0..3, read from the mirror normals. A2 on both balls e(x) = (-1)^distance
//    for every dock, 0 neighbour pairs of equal distance parity, 0 inconsistent steps. A3 every layer dock of the radius 3
//    ball has integer husk coordinates (1e-6) and e = (-1)^(h1 + h2 + h3), 0 exceptions, at least one layer dock. A4 every
//    closed walk of four docks through the base dock (radius 2) closes its label frame, and its parallel transport's
//    label action is a W(F4) rotation (det +1), not the identity, whose register commutes with J exactly.
//  B PER STREAM. B1 from the Weyl state projected on e J = +1, after beat 1 the weight on e J = +1 is at most 1e-24 of the
//    whole (all of it moved). B2 from the Weyl state projected on J = +1 (labels), the weight on J = -1 at most 1e-24 of
//    the whole after every beat (the local frame change removes the flip).
//  C PER CYCLE (the guess predicts > 1e-6): after beats 2, 4, 6, 8 the weight on e J = -1 at most 1e-24 of the whole;
//    and from the Weyl state on the e = +1 docks, the weight on docks of sign -(-1)^t at most 1e-24 after every beat.
//  D CENTER AND GAUGE (exact). 4 Gamma(-1) = -4 J; 4 Gamma(h) J = J 4 Gamma(h) for all 24 h; the frame reflection's
//    minors anticommute with J; and the per-half weights of B1's state after beats 1 and 2 agree with those of the same
//    state turned by a local 2T move (h_x = (7x + 3) mod 24) within 1e-12 relative.
//  E CLASSES. From the e = +1 docks the orientation-reading rule equals [S(u+, u-)], [D(u-, u+)] and the orientation-
//    weighted identity equals [S(u, u)], [D(conj u, conj u)] at every beat, from the e = -1 docks their mirrors, within
//    1e-13 relative.
//  F THE BAND (Bloch, the flat cycle, since each class runs a label rule), at K = 0, (pi/2, 0, 0, 0), (0.4, 0.9, -0.3,
//    0.2): on each half the 8 band eigenvalues are the two roots of item 5 within 1e-10, 4 on each (8 on the double
//    root), for the label chiral rule, both classes of the orientation-reading rule and the even class of the weighted
//    one; at K = 0 the weighted rule's 8 lie within 1e-10 of one another (massless) and the label rule's two roots are at
//    least 0.1 apart.
//  G PARITY INSIDE ONE CLASS, from the Weyl state on the e = +1 docks. G1 every tested element's image of it lies wholly
//    on e = +1 docks or wholly on e = -1 docks (1e-12), on e = +1 exactly when det g det phi(g) = +1. G2 the label chiral
//    rule keeps (<= 1e-12 over the beats) exactly the elements with det phi = +1 and breaks the others (>= 1e-3 at the
//    last beat); every husk mirror it keeps swaps the classes, and it keeps 0 class-keeping husk mirrors.
// CONTROLS. A0 the flat box's graph has neighbour pairs of equal distance parity (a triangle), so the parity check can
//  fail. B0 on the flat box (e = +1 everywhere, no frontier) the label chiral rule moves at most 1e-24 of a J = +1 state
//  onto J = -1 over 8 beats. E0 from the e = +1 docks the label chiral rule differs from the orientation-reading one by
//  at least 1e-3 relative at the last beat. F0 the orientation-reading class's half + misses the label law (u+, conj u+)
//  by at least 1e-3. G3 the achiral rule keeps every tested element within 1e-12.
// INSTRUMENT. I1 the structured pieces used equal the dense ones (1e-13). I2 0 inconsistent steps on every region.
// VERDICT, fixed before the run: FAIL (as derived) when A to G hold with the controls and the instrument: the joining is a
//  frame artifact, the sign a pure-gauge checkerboard and center-even. PASS (the guess) when C fails with some cycle's
//  weight on e J = -1 above 1e-6, B0 and D holding. PARTIAL otherwise.
//
// PROBES BEFORE THE GATE RUN, disclosed. tmp/ot-probe1.log (90 s, 348 MB): the radius 3 ball (8,857 docks) has 0
//  distance exceptions and 63 layer docks, all with integer husk coordinates and e = (-1)^(h1 + h2 + h3); 192 four-dock
//  walks through the base dock, every one closing, every holonomy a rotation of order 3 commuting with J; the flat box has
//  3,072 equal-parity pairs, the ball 0. Beats 1 to 8 of the label rule from e J = +1 put all the weight on e J = -1 after
//  odd beats and none after even ones (the frontier absorbing the rest); the class A start stays on its class exactly,
//  and the orientation-reading rule equals its class rule bit for bit. The Bloch law with free phases holds to 1.1e-14
//  for the label, orientation-reading and weighted rules at the three K, the weighted rule's 8 band levels at K = 0
//  coinciding. No gate was written after those numbers that is not the derivation's. tmp/ot-smoke.log (SMOKE_PLAN, 20 s):
//  every code path, the same verdict.
//
// FIRST RUN (tmp/ot-gate-E-FRC-0274.log, 130 s, 716 MB): FAIL, as derived. Every gate, control and instrument held; no
//  gate moved and none was rerun.
//  - A: m_i4 = 2, 2, 2, 4; the sign is (-1)^distance on 8,857 and 481 docks with 0 equal-parity pairs (the flat box has
//    3,072); 63 of 63 layer docks carry e = (-1)^(h1 + h2 + h3); 192 four-dock walks, every holonomy a rotation of order
//    3 commuting with J.
//  - B, C: after beat 1 the weight left on e J = +1 is exactly 0, the label halves move exactly 0, and after each of the
//    four cycles the weight on e J = -1 is exactly 0, as is the weight off the start's class. The flat box moves 0.
//  - D: 4 Gamma(-1) = -4 J, every Gamma commutes with J, the frame reflection anticommutes, local 2T moves change the
//    physical-half weights by at most 1.3e-16.
//  - E: the orientation-reading and orientation-weighted rules equal their class rules bit for bit on both classes; the
//    label chiral rule differs from the orientation-reading one by 2.5e-2.
//  - F: the two-phase law to 1.1e-14 at three K for four rules; the weighted rule's 8 rest levels within 1.4e-14 of one
//    another (massless), the label rule's split by 0.742 and 0.566; the orientation-reading class misses the label law by
//    9.4e-2.
//  - G: of 64 readings, the label chiral rule keeps 4 husk mirrors, all 4 swapping the classes, and breaks all 28
//    class-keeping husk mirrors by at least 1.09e-2; the achiral rule keeps every element to 8.5e-17.
//
// Depth L1 (the character, the frame change, the class split and the two-phase Jordan law are exact algebra) and L2 (the
// register rule run on the true mesh and read for them). DETERMINISM: no random numbers; the test vector is a Weyl
// sequence. NOTHING MOVES: pieces hand values between slots and register components of one dock, and the stream takes
// each slot's value one dock along.

import { experiment } from '@/test/scaffold/suite'
import { verdict, type Verdict } from '@/test/scaffold/verdict'
import {
  applyImage,
  denseAgreement,
  densePiece,
  imageOperator,
  newState,
  norm2,
  registerBeat,
  symmetryDefects,
  weylState,
  type ImageOperator,
  type PieceSpec,
  type State,
  type Unit,
  type Walk,
} from '@/code/measure/cusp-register'
import {
  chiralSchedules,
  classWeights,
  conjUnit,
  graphParity,
  halfBandEigenvalues,
  jordanRoots,
  labelHalves,
  localGaugeMove,
  loopHolonomies,
  matchEigenvalues,
  orientationSigns,
  physicalHalves,
  restrictToClass,
} from '@/code/measure/orientation-taste'
import { ringUnit, unitAngle } from '@/code/measure/swap-string'
import { cycleMatrix } from '@/code/measure/swap-cone'
import {
  REGISTER_ROOTS,
  f4Group,
  structureVector,
  type GroupElement,
} from '@/code/measure/spinor-register'
import { det4, volumeRight } from '@/code/measure/chiral-register'
import { registerGauge } from '@/code/measure/register-link-field'
import { hurwitzExact } from '@/code/measure/hurwitz-gauge'
import { horosphericalChart } from '@/code/measure/hyperbolic-lines'
import { d4BoxMesh } from '@/code/substrate/d4-box-integer'
import { labelledCoin } from '@/code/substrate/coxeter/label-transport'
import {
  buildLabelledRegion,
  closeGroup,
  regionImage,
} from '@/code/substrate/coxeter/labelled-region'
import {
  determinant,
  identity,
  innerJ,
  matMul,
  matVec,
  reflectionMatrix,
  type Mat,
} from '@/code/substrate/coxeter/minkowski'

const ZERO = 1e-24
const EXACT = 1e-12
const SAME = 1e-13
const BROKEN = 1e-3
const LAW = 1e-10
const GAP = 0.1
const LIGHT: readonly [number, number] = [-1, 4]
const MINUS: readonly [number, number] = [2, 2]
const KS: readonly (readonly number[])[] = [
  [0, 0, 0, 0],
  [Math.PI / 2, 0, 0, 0],
  [0.4, 0.9, -0.3, 0.2],
]

export type SignPlan = {
  flowRadius: number
  beats: number
  parityRadius: number
  parityBeats: number
  flatSide: number
}

export const GATE_PLAN: SignPlan = {
  flowRadius: 3,
  beats: 8,
  parityRadius: 2,
  parityBeats: 6,
  flatSide: 4,
}

export const SMOKE_PLAN: SignPlan = {
  flowRadius: 2,
  beats: 4,
  parityRadius: 1,
  parityBeats: 2,
  flatSide: 4,
}

const flag = (b: boolean): number => (b ? 1 : 0)

export default experiment({
  id: 'gauge/orientation-sign',
  code: 'E-FRC-0274',
  title:
    "the true mesh's orientation sign is a staggered sign and a pure-gauge checkerboard, not a center-odd scalar, fail as derived: the sign is a character of the mesh group (m_i4 = 2, 2, 2, 4), (-1)^distance on 8,857 docks with 0 odd loops, and on the husk exactly Kogut and Susskind's (-1)^(h1 + h2 + h3) on 63 of 63 cubes, while the curvature the labels hide is a rotation of order 3 on all 192 ridge loops, commuting with J; read in an oriented frame one stream moves all of a hand's weight to the other hand and one cycle moves exactly 0, so the joining is the local frame change itself, with no mass; the center stays -J in every frame, so the sign is center-even and the Higgs row is unchanged; the stream splits spacetime into two classes no dock-local piece joins, on each the orientation-reading mass is a label rule giving both hands the mean mass split by a rigid offset (two-phase Jordan law to 1.1e-14) and the orientation-weighted identity makes the member massless; every husk mirror the label chiral mass keeps swaps the classes (4 of 4) and it breaks all 28 class-keeping husk mirrors, so within one class parity is broken and the kept parity is a mirror world; controls: the flat box has 3,072 odd-parity pairs and moves 0, the achiral rule keeps every element",
  category: 'gauge',
  substrates: ['3434'],
  depth: 'L2',
  paper: false,
  run() {
    return orientationSignRun(GATE_PLAN)
  },
})

const unitOf = (k: readonly [number, number]): Unit => {
  const t = unitAngle(ringUnit(k[0], k[1]))

  return [Math.cos(t), Math.sin(t)]
}

// the state projected on (1 + e(x) J) / 2 at every dock
function projectHalf(
  s: State,
  signs: Int8Array,
  J: readonly (readonly number[])[],
): State {
  const out = newState(signs.length)

  for (let x = 0; x < signs.length; x++) {
    const e = signs[x]!

    for (let d = 0; d < 24; d++) {
      const o = (x * 24 + d) * 8

      for (let a = 0; a < 8; a++) {
        let re = s.re[o + a]!
        let im = s.im[o + a]!

        for (let b = 0; b < 8; b++) {
          const w = e * J[a]![b]!

          if (w !== 0) {
            re += w * s.re[o + b]!
            im += w * s.im[o + b]!
          }
        }

        out.re[o + a] = re / 2
        out.im[o + a] = im / 2
      }
    }
  }

  return out
}

const relGap = (a: State, b: State): number => {
  let t = 0

  for (let k = 0; k < a.re.length; k++) {
    t += (a.re[k]! - b.re[k]!) ** 2 + (a.im[k]! - b.im[k]!) ** 2
  }

  return Math.sqrt(t / Math.max(norm2(a), norm2(b), 1e-300))
}

const mulInt = (a: number[][], b: number[][]): number[][] =>
  a.map(r => b[0]!.map((_, j) => r.reduce((s, x, k) => s + x * b[k]![j]!, 0)))

export function orientationSignRun(plan: SignPlan): Verdict {
  const started = Date.now()
  const log = (what: string): void =>
    console.error(`${what} ${Math.round((Date.now() - started) / 1000)}s`)
  const coin = labelledCoin()
  const { normals, metric, center } = coin.frame
  const I5 = identity(center.length)
  const J = volumeRight()
  const group = f4Group()
  const bySlots = (slots: Int32Array): GroupElement | undefined =>
    group.find(g => g.slots.every((x, d) => x === slots[d]))
  const plus = unitOf(LIGHT)
  const minus = unitOf(MINUS)
  const sch = chiralSchedules(plus, minus)

  // ---------------- A: the checkerboard ----------------
  const unitNorm = (n: number[]): number => Math.sqrt(innerJ(n, n, metric))
  const mOuter = [0, 1, 2, 3].map(i => {
    const c =
      -innerJ(normals[i]!, normals[4]!, metric) /
      (unitNorm(normals[i]!) * unitNorm(normals[4]!))

    return Math.PI / Math.acos(Math.max(-1, Math.min(1, c)))
  })
  const A1 = mOuter.every(
    m => Math.abs(m - Math.round(m)) < 1e-9 && Math.round(m) % 2 === 0,
  )
  const flow = buildLabelledRegion({ coin, seeds: [I5], radius: plan.flowRadius })
  const small = buildLabelledRegion({ coin, seeds: [I5], radius: 2 })
  const checkBall = (r: typeof flow): { exceptions: number; equal: number } => {
    const sg = orientationSigns(r.frames)
    const exceptions = r.frames.filter(
      (_, x) => (sg[x]! > 0) !== (r.distance[x]! % 2 === 0),
    ).length

    return { exceptions, equal: graphParity(r.cells, r.neighbour).equalParityPairs }
  }
  const ballChecks = [checkBall(flow), checkBall(small)]
  const A2 =
    ballChecks.every(b => b.exceptions === 0 && b.equal === 0) &&
    flow.inconsistentSteps === 0 &&
    small.inconsistentSteps === 0
  const signs = orientationSigns(flow.frames)
  const chart = horosphericalChart(coin)

  let layerDocks = 0
  let huskExceptions = 0

  flow.frames.forEach((f, x) => {
    const p = matVec(f, center)

    if (Math.abs(chart.level(p) - chart.layerLevel) >= 1e-9 * chart.layerLevel) {
      return
    }

    layerDocks++

    const h = chart.coordinates(p)
    const hi = h.map(Math.round)
    const integer = h.every((v, a) => Math.abs(v - hi[a]!) <= 1e-6)
    const sign = (hi[0]! + hi[1]! + hi[2]!) % 2 === 0 ? 1 : -1

    if (!integer || sign !== signs[x]) {
      huskExceptions++
    }
  })

  const A3 = layerDocks > 0 && huskExceptions === 0
  const loops = loopHolonomies({ coin, region: small })
  const orders = new Map<number, number>()
  const loopOk = loops.map(l => {
    const el = l.slots ? bySlots(l.slots) : undefined

    if (!l.closes || !el) {
      return false
    }

    let k = 1
    let p = Int32Array.from(l.slots!)

    while (!p.every((x, d) => x === d) && k < 64) {
      p = Int32Array.from(p, x => l.slots![x]!)
      k++
    }

    orders.set(k, (orders.get(k) ?? 0) + 1)

    const R = el.register
    const commutes = mulInt(R, J).every((r, i) =>
      r.every((x, j) => x === mulInt(J, R)[i]![j]),
    )

    return det4(el.matrix) === 1 && k > 1 && commutes
  })
  const A4 = loops.length > 0 && loopOk.every(Boolean)

  // A0: the flat box
  const side = plan.flatSide
  const mesh = d4BoxMesh({ side })
  const flatCells = side ** 4
  const flatNb = new Int32Array(flatCells * 24)

  for (let x = 0; x < flatCells; x++) {
    for (let d = 0; d < 24; d++) {
      flatNb[x * 24 + d] = mesh.neighbour(x, d)
    }
  }

  const flatEqual = graphParity(flatCells, flatNb).equalParityPairs
  const A0 = flatEqual > 0

  log('A')

  // ---------------- B, C: the flow on the ball ----------------
  const cls = Int8Array.from(signs, s => (s > 0 ? 0 : 1))
  const walkOf = (schedule: PieceSpec[][], byClass: boolean): Walk => ({
    cells: flow.cells,
    neighbour: flow.neighbour,
    classOf: byClass ? cls : new Int8Array(flow.cells),
    schedule,
    frontier: 'absorb',
  })
  const labelWalk = walkOf(sch.label, false)
  const psi = weylState(flow.cells)
  const physStart = projectHalf(psi, signs, J)
  const labelStart = projectHalf(psi, new Int8Array(flow.cells).fill(1), J)
  const physMoved: number[] = []
  const labelMoved: number[] = []
  const gaugeGaps: number[] = []
  const G = registerGauge()
  const hurwitz = hurwitzExact()

  let s = physStart
  let l = labelStart

  for (let t = 0; t < plan.beats; t++) {
    s = registerBeat(labelWalk, s, t).state
    l = registerBeat(labelWalk, l, t).state

    const ph = physicalHalves(s, signs, J)
    const lh = labelHalves(l, flow.cells, J)

    // the weight left on e J = +1 after an odd number of beats, moved onto e J = -1 after an even number
    physMoved.push((t % 2 === 0 ? ph.plus : ph.minus) / (ph.plus + ph.minus))
    labelMoved.push(lh.minus / (lh.plus + lh.minus))

    if (t < 2) {
      const moved = localGaugeMove(s, flow.cells, G.gamma4, x => (7 * x + 3) % 24)
      const pg = physicalHalves(moved, signs, J)

      gaugeGaps.push(
        Math.max(
          Math.abs(pg.plus - ph.plus),
          Math.abs(pg.minus - ph.minus),
        ) / (ph.plus + ph.minus),
      )
    }
  }

  const B1 = physMoved[0]! <= ZERO
  const B2 = labelMoved.every(x => x <= ZERO)
  const cycleMoved = physMoved.filter((_, t) => t % 2 === 1)
  const classA = restrictToClass(psi, signs, 1)
  const classB = restrictToClass(psi, signs, -1)
  const wrongClass: number[] = []

  let a = classA

  for (let t = 0; t < plan.beats; t++) {
    a = registerBeat(labelWalk, a, t).state

    const cw = classWeights(a, signs)

    wrongClass.push((t % 2 === 0 ? cw.plus : cw.minus) / (cw.plus + cw.minus))
  }

  const C = cycleMoved.every(x => x <= ZERO) && wrongClass.every(x => x <= ZERO)
  const guessSignature = cycleMoved.some(x => x > 1e-6)

  // B0: the flat box
  const flatWalk: Walk = {
    cells: flatCells,
    neighbour: flatNb,
    classOf: new Int8Array(flatCells),
    schedule: sch.label,
    frontier: 'reflect',
  }
  const flatSigns = new Int8Array(flatCells).fill(1)

  let f = projectHalf(weylState(flatCells), flatSigns, J)

  const flatMoved: number[] = []

  for (let t = 0; t < plan.beats; t++) {
    f = registerBeat(flatWalk, f, t).state

    const ph = physicalHalves(f, flatSigns, J)

    flatMoved.push(ph.minus / (ph.plus + ph.minus))
  }

  const B0 = flatMoved.every(x => x <= ZERO)

  log('B C')

  // ---------------- D: the center and the gauge ----------------
  const minusOne = hurwitz.doubled.findIndex(
    q => q[0] === -2 && q[1] === 0 && q[2] === 0 && q[3] === 0,
  )
  const centerIsJ = G.gamma4[minusOne]!.every((r, i) =>
    r.every((x, j) => x === -4 * J[i]![j]!),
  )
  const allCommute = G.gamma4.every(g =>
    mulInt(g, J).every((r, i) => r.every((x, j) => x === mulInt(J, g)[i]![j])),
  )
  const rho = group.find(g =>
    g.matrix.every((r, i) =>
      r.every((x, j) => x === [[1, 0, 0, 0], [0, 0, 1, 0], [0, 1, 0, 0], [0, 0, 0, 1]][i]![j]),
    ),
  )!
  const anti = mulInt(rho.register, J).every((r, i) =>
    r.every((x, j) => x === -mulInt(J, rho.register)[i]![j]!),
  )
  const D =
    centerIsJ &&
    allCommute &&
    det4(rho.matrix) === -1 &&
    anti &&
    gaugeGaps.every(g => g <= EXACT)

  log('D')

  // ---------------- E: the classes ----------------
  const classPairs: [string, PieceSpec[][], PieceSpec[][], State][] = [
    ['geometric A', sch.geometric, sch.geometricEven, classA],
    ['geometric B', sch.geometric, sch.geometricOdd, classB],
    ['weighted A', sch.weighted, sch.weightedEven, classA],
    ['weighted B', sch.weighted, sch.weightedOdd, classB],
  ]
  const classGaps = classPairs.map(([name, byClass, one, start]) => {
    let p = start
    let q = start
    let worst = 0

    for (let t = 0; t < plan.beats; t++) {
      p = registerBeat(walkOf(byClass, true), p, t).state
      q = registerBeat(walkOf(one, false), q, t).state
      worst = Math.max(worst, relGap(p, q))
    }

    return { name, worst }
  })
  const E = classGaps.every(g => g.worst <= SAME)

  let e0g = classA
  let e0l = classA

  for (let t = 0; t < plan.beats; t++) {
    e0g = registerBeat(walkOf(sch.geometric, true), e0g, t).state
    e0l = registerBeat(labelWalk, e0l, t).state
  }

  const e0Gap = relGap(e0g, e0l)
  const E0 = e0Gap >= BROKEN

  log('E')

  // ---------------- F: the band ----------------
  const bar = (u: Unit): Unit => conjUnit(u)
  const lawRules: [string, PieceSpec[][], [Unit, Unit], [Unit, Unit]][] = [
    ['label', sch.label, [plus, bar(plus)], [minus, bar(minus)]],
    ['geometric A', sch.geometricEven, [plus, bar(minus)], [minus, bar(plus)]],
    ['geometric B', sch.geometricOdd, [minus, bar(plus)], [plus, bar(minus)]],
    ['weighted A', sch.weightedEven, [plus, plus], [plus, plus]],
  ]
  const lawReads: { name: string; K: number; half: number; worst: number; counts: number[]; spread: number }[] = []

  let f0 = 0

  for (const [name, specs, abPlus, abMinus] of lawRules) {
    const dense = specs.map(p => densePiece(p[0]!))

    KS.forEach((K, ki) => {
      const U = cycleMatrix(dense, REGISTER_ROOTS, K)
      const mu = structureVector(K).reduce((q, x) => q + x * x, 0) / 4

      for (const sign of [1, -1] as const) {
        const ev = halfBandEigenvalues(U, J, sign)
        const ab = sign > 0 ? abPlus : abMinus
        const roots = jordanRoots(ab[0], ab[1], mu)
        const double = Math.hypot(roots[0][0] - roots[1][0], roots[0][1] - roots[1][1]) < LAW
        const m = matchEigenvalues(ev, double ? [roots[0]] : roots, LAW)

        let spread = 0

        for (const x of ev) {
          for (const y of ev) {
            spread = Math.max(spread, Math.hypot(x[0] - y[0], x[1] - y[1]))
          }
        }

        lawReads.push({ name, K: ki, half: sign, worst: m.worst, counts: m.counts, spread })

        if (name === 'geometric A' && sign > 0) {
          const wrong = jordanRoots(plus, bar(plus), mu)

          f0 = Math.max(f0, matchEigenvalues(ev, wrong, LAW).worst)
        }
      }
    })
  }

  const lawOk = lawReads.every(
    r =>
      r.worst <= LAW &&
      (r.counts.length === 1 ? r.counts[0] === 8 : r.counts.every(c => c === 4)),
  )
  const weightedRest = lawReads.filter(r => r.name === 'weighted A' && r.K === 0)
  const labelRest = lawReads.filter(r => r.name === 'label' && r.K === 0)
  const F =
    lawOk &&
    weightedRest.every(r => r.spread <= LAW) &&
    labelRest.every(r => r.spread >= GAP)
  const F0 = f0 >= BROKEN

  log('F')

  // ---------------- G: parity inside one class ----------------
  const R = normals.map(n => reflectionMatrix(n, metric))
  const c1 = matMul(R[4]!, coin.inversion)
  const cubeGroup = closeGroup([R[1]!, R[2]!, R[3]!], 200)
  const faceGroup = closeGroup([R[1]!, R[2]!, R[4]!], 200)
  const achiralWalk = (r: typeof flow): Walk => ({
    cells: r.cells,
    neighbour: r.neighbour,
    classOf: new Int8Array(r.cells),
    schedule: sch.achiral,
    frontier: 'absorb',
  })
  const parityReads: {
    region: string
    det5: number
    detLabel: number
    keepsClass: boolean
    onPlus: number
    label: number[]
    achiral: number[]
  }[] = []

  let regionsInvariant = true
  let parityInconsistent = 0

  const parityRegions: [string, Mat[], Mat[]][] = [
    ['ball', [I5], cubeGroup],
    ['two-center', [I5, c1], faceGroup],
  ]

  for (const [name, seeds, elements] of parityRegions) {
    const region = buildLabelledRegion({ coin, seeds, radius: plan.parityRadius })
    const sg = orientationSigns(region.frames)
    const start = restrictToClass(weylState(region.cells), sg, 1)
    const ops: ImageOperator[] = []
    const meta: { det5: number; detLabel: number }[] = []

    parityInconsistent += region.inconsistentSteps

    for (const g of elements) {
      const img = regionImage({ coin, region, g })
      const el = img ? bySlots(img.slots) : undefined

      if (!img || !el || img.disagreeing > 0) {
        regionsInvariant = false
        continue
      }

      ops.push(imageOperator(img.cellMap, el))
      meta.push({ det5: Math.round(determinant(g)), detLabel: det4(el.matrix) })
    }

    const lw: Walk = {
      cells: region.cells,
      neighbour: region.neighbour,
      classOf: new Int8Array(region.cells),
      schedule: sch.label,
      frontier: 'absorb',
    }
    const labelD = symmetryDefects(lw, ops, start, plan.parityBeats)
    const achiralD = symmetryDefects(achiralWalk(region), ops, start, plan.parityBeats)

    ops.forEach((op, k) => {
      const image = applyImage(op, start)
      const cw = classWeights(image, sg)

      parityReads.push({
        region: name,
        ...meta[k]!,
        keepsClass: meta[k]!.det5 * meta[k]!.detLabel === 1,
        onPlus: cw.plus / (cw.plus + cw.minus),
        label: labelD[k]!,
        achiral: achiralD[k]!,
      })
    })

    log(`G ${name}`)
  }

  const worst = (d: number[]): number => Math.max(...d)
  const last = (d: number[]): number => d[d.length - 1]!
  const G1 = parityReads.every(r =>
    r.keepsClass ? Math.abs(r.onPlus - 1) <= EXACT : r.onPlus <= EXACT,
  )
  const labelPattern = parityReads.every(r =>
    r.detLabel === 1 ? worst(r.label) <= EXACT : last(r.label) >= BROKEN,
  )
  const keptMirrors = parityReads.filter(
    r => r.det5 === -1 && worst(r.label) <= EXACT,
  )
  const keptClassMirrors = keptMirrors.filter(r => r.keepsClass).length
  const classKeepingMirrors = parityReads.filter(r => r.det5 === -1 && r.keepsClass)
  const G2 =
    labelPattern &&
    keptMirrors.length > 0 &&
    keptClassMirrors === 0 &&
    classKeepingMirrors.length > 0 &&
    classKeepingMirrors.every(r => last(r.label) >= BROKEN)
  const G3 = parityReads.every(r => worst(r.achiral) <= EXACT)
  const Gok = G1 && G2 && regionsInvariant

  // ---------------- instrument ----------------
  const specs: PieceSpec[] = [
    ...sch.label.flat(),
    ...sch.geometricEven.flat(),
    ...sch.weightedEven.flat(),
    ...sch.achiral.flat(),
  ]
  const agreement = Math.max(...specs.map(denseAgreement))
  const I1 = agreement <= SAME
  const I2 = parityInconsistent === 0 && flow.inconsistentSteps === 0
  const instrument = I1 && I2

  const controls = B0 && E0 && F0 && G3 && A0
  const derived = A1 && A2 && A3 && A4 && B1 && B2 && C && D && E && F && Gok
  const status: Verdict['status'] =
    instrument && controls && derived
      ? 'fail'
      : guessSignature && B0 && D
        ? 'pass'
        : 'partial'
  const ex = (x: number): string => x.toExponential(2)
  const maxOf = (xs: number[]): number => Math.max(0, ...xs)
  const minClassMirrorBreak = Math.min(
    ...classKeepingMirrors.map(r => last(r.label)),
  )

  log('done')

  return verdict({
    status,
    claim: `A1 ${A1} (m_i4 ${mOuter.map(m => m.toFixed(6)).join(', ')}); A2 ${A2} (sign against distance: ${ballChecks.map(b => `${b.exceptions} exceptions, ${b.equal} equal-parity pairs`).join('; ')}); A3 ${A3} (${layerDocks} layer docks, ${huskExceptions} exceptions to (-1)^(h1+h2+h3)); A4 ${A4} (${loops.length} four-dock walks, holonomy orders ${[...orders].map(([k, n]) => `${k}:${n}`).join(' ')}); B1 ${B1} (weight left on e J = +1 after beat 1 ${ex(physMoved[0]!)}); B2 ${B2} (label half moved at most ${ex(maxOf(labelMoved))}); C ${C} (e J = -1 after each cycle ${cycleMoved.map(ex).join(' ')}, wrong-class weight at most ${ex(maxOf(wrongClass))}); D ${D} (4 Gamma(-1) = -4 J ${centerIsJ}, all Gamma commute with J ${allCommute}, frame reflection anticommutes ${anti}, gauge gaps ${gaugeGaps.map(ex).join(' ')}); E ${E} (${classGaps.map(g => `${g.name} ${ex(g.worst)}`).join(', ')}); F ${F} (law worst ${ex(maxOf(lawReads.map(r => r.worst)))}, weighted rest spread ${weightedRest.map(r => ex(r.spread)).join(' ')}, label rest spread ${labelRest.map(r => r.spread.toFixed(4)).join(' ')}); G ${Gok} (G1 ${G1}, G2 ${G2}: ${parityReads.length} readings, kept husk mirrors ${keptMirrors.length}, of them class-keeping ${keptClassMirrors}, class-keeping husk mirrors ${classKeepingMirrors.length} broken by at least ${ex(minClassMirrorBreak)}); controls A0 ${A0} (flat equal-parity pairs ${flatEqual}) B0 ${B0} (${ex(maxOf(flatMoved))}) E0 ${E0} (${ex(e0Gap)}) F0 ${F0} (${ex(f0)}) G3 ${G3} (achiral worst ${ex(maxOf(parityReads.map(r => worst(r.achiral))))}); instrument I1 ${I1} (${ex(agreement)}) I2 ${I2}`,
    metrics: {
      A1: flag(A1),
      A2: flag(A2),
      A3: flag(A3),
      A4: flag(A4),
      B1: flag(B1),
      B2: flag(B2),
      C: flag(C),
      D: flag(D),
      E: flag(E),
      F: flag(F),
      G: flag(Gok),
      A0: flag(A0),
      B0: flag(B0),
      E0: flag(E0),
      F0: flag(F0),
      G3: flag(G3),
      I1: flag(I1),
      I2: flag(I2),
      layerDocks,
      loops: loops.length,
      flowDocks: flow.cells,
      afterBeatOne: physMoved[0]!,
      cycleMovedMax: maxOf(cycleMoved),
      wrongClassMax: maxOf(wrongClass),
      labelMovedMax: maxOf(labelMoved),
      flatMovedMax: maxOf(flatMoved),
      gaugeGapMax: maxOf(gaugeGaps),
      classGapMax: maxOf(classGaps.map(g => g.worst)),
      e0Gap,
      lawWorst: maxOf(lawReads.map(r => r.worst)),
      f0,
      weightedRestSpread: maxOf(weightedRest.map(r => r.spread)),
      labelRestSpread: Math.min(...labelRest.map(r => r.spread)),
      keptMirrors: keptMirrors.length,
      keptClassMirrors,
      classKeepingMirrors: classKeepingMirrors.length,
      minClassMirrorBreak,
      achiralWorst: maxOf(parityReads.map(r => worst(r.achiral))),
      denseAgreement: agreement,
      seconds: (Date.now() - started) / 1000,
    },
    control: {
      A0: flag(A0),
      B0: flag(B0),
      E0: flag(E0),
      F0: flag(F0),
      G3: flag(G3),
    },
    notes: `L1 and L2. Flow ball radius ${plan.flowRadius} (${flow.cells} docks), ${plan.beats} beats, absorbing; parity regions radius ${plan.parityRadius}, ${plan.parityBeats} beats; flat box side ${side}. Band law per rule, K and half (worst distance to the predicted roots, then the spread of the 8 measured band levels): ${lawReads.map(r => `${r.name} K${r.K} h${r.half > 0 ? '+' : '-'} ${ex(r.worst)} ${r.spread.toFixed(4)}`).join('; ')}. Parity readings (region, det g, det of the label action, keeps the class, last-beat label defect): ${parityReads.filter(r => r.det5 === -1).map(r => `${r.region}(${r.det5},${r.detLabel},${r.keepsClass ? 'keeps' : 'swaps'})${ex(last(r.label))}`).join(' ')}. ${((Date.now() - started) / 1000).toFixed(0)} s.`,
  })
}
