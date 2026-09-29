// DOES A DISTURBANCE OF THE VACUUM REACH EVERY LINE? (E-FND-0157). The constraint "a disturbance on the vacuum reaches
// every line" is broken on the adopted knit: every piece of the working rule acts inside one line, so a lone change
// stays on its own line by a theorem (the line law, E-SPN-0098: 6,144 of 6,144 mesh lines keep their tone), and the
// turning weave before it split its vacuum into 3 sectors (E-FRC-0109). This file asks the same question of the smallest
// rule change the notes already hold that mixes lines while keeping the vacuum: the dock-wide mixer on a filled love sea
// (E-SPN-0140), with the swap coin and the Cl+(4) register (E-SPN-0160), and its chiral Wilson variant (E-SPN-0168).
//
// DIAGNOSIS (the cause, on the knit). A line is a pair of opposite slots. The knit's collision, meeting, contact, store
// and coin each act on the slots of one line, and the stream moves a slot's value along that slot's own root, so the
// tone on every straight line of the mesh is conserved (E-SPN-0098). A piece that hands a value from one line to another
// inside a dock is the only way out. Every such mixer tried on the working vacuum cascades (E-SPN-0094 to 0099), and no
// mixer in the ring fixes that vacuum and still mixes (E-SPN-0096, a theorem). The escape is a different vacuum: on a
// FULL sea a dock-wide mixer is Pauli blocked (every mode it would move a member into is filled), so the sea is fixed
// while a hole mixes (E-SPN-0140).
//
// DERIVED BEFORE THE RUN (L1, the algebra; L2, the run).
// 1. ONE HOLE IS ONE MEMBER. Every register piece is one-body, so its lift to the sea is Gaussian and a hole's amplitude
//    is a member's (E-SPN-0163, by Jacobi, exact to 1.8e-15). The support of one member's amplitude is therefore the
//    support of a disturbance of the full sea. The same holds on any Slater background (a dense one included), since a
//    quasi-free rule moves an added member or hole by the one-body cycle whatever else is filled.
// 2. EVERY LINE IN ONE BEAT. Beat 1's mixer is G1 = 1 + (u - 1) Q_S, Q_S = Pi1 (x) 1 (the uniform slot mode, register
//    kept). On a start e_(x, s, a) it adds (u - 1) / 24 on every slot of dock x, a nonzero element of Z[w][1/42] (u != 1).
//    So after one piece all 12 lines at the start dock hold amplitude, and the stream carries them to the 24 neighbours.
// 3. THE CONE IS TWO ROOT STEPS A CYCLE. The cycle is U = T G2 T^dag G1 (E-SPN-0159 point 1): out one root, the partner
//    mixer G2 inside a dock, back one root. A value at x ends a cycle at x + r - r' for roots r, r', at most two root
//    steps from x, and x + 2r when G2 connects a slot to its opposite. So the reach after t cycles is at most 2t, and a
//    box of root diameter R is covered by cycle ceil(R / 2) at the earliest.
// 4. MOMENTUM IS THE NOETHER CHARGE OF TRANSLATION. Every piece is the same at every dock and the stream is the root
//    shift, so U commutes with every translation of the box exactly: crystal momentum is conserved, exactly, whatever
//    the mixer does to lines. What the mixer does not keep is sum_d r_d n_d, the occupation-weighted root sum. For a
//    classical permutation (the knit) that sum is the momentum; for a quantum walk it is the displacement per beat, the
//    velocity, which does not commute with the cycle (Zitterbewegung, as alpha does not commute with the Dirac
//    Hamiltonian). So a rule that mixes lines keeps the constraint "momentum is conserved" in its stated, Noether sense,
//    and gives up only a reading the knit's classical collision made equal to it.
// 5. THE SEA IS KEPT. The full sea's amplitude under a piece is its determinant, the product of each mixer's unit to
//    the power of its projector's rank: u^8 conj(u)^8 = 1 for E-SPN-0160; u^8 y^4 conj(u)^8 v^4 = 1 for the chiral
//    Wilson schedule (y = u^2 on Q_D P+, v = conj(u)^2 on Q_S P+, ranks 4). One branch, unit amplitude, every beat.
// 6. WHAT DOES NOT MOVE. 176 of 192 bands are flat at phase 0 (E-SPN-0160): on them the cycle is the identity. A start on
//    one slot has most of its weight there, so most of a one-slot disturbance never leaves its dock, while its moving
//    part reaches every line. This is read (the weight left on the start dock), not gated.
//
// PREDICTED: A1 to A5 hold for both rules; C1 and C2 read as controls; I1 holds. The constraint then holds on these rules.
//
// GATES, fixed before the gate run.
//  A1 REACH. For E-SPN-0160 (u = ringUnit(-1, 4)) and its chiral Wilson variant (u = ringUnit(-2, 5), E-SPN-0168's), on
//     boxes of side 4 and 6, from e_(cell 0, slot 0, blade 0): by cycle `side` every (cell, line) pair of the box holds a
//     nonzero amplitude mod p1 (a proof, point 1 of code/measure/sea-reach), so every dock is reached (one causal world)
//     on every one of the 12 lines.
//  A2 THE CONE. At every cycle t up to the full cover, the reached cells lie within root distance 2t of cell 0 (point 3).
//  A3 REVERSAL. Forward to the full cover and back again returns the start exactly, mod p1 and mod p2.
//  A4 TRANSLATION. For each of the 24 roots, one cycle of the translated start equals the translation of one cycle of
//     the start, mod p1 and mod p2, for both rules (point 4).
//  A5 THE SEA. The determinant products of point 5 equal one exactly (Eisenstein integers, BigInt), and the ranks (the
//     integer traces of 24 Q_S, 48 Q_D, 96 Q_D P+, 48 Q_S P+ over their scales) are 8, 8, 4, 4.
// CONTROLS (a failure makes the verdict partial). C1 NO MIXER (u = 1): the cycle returns every value to its slot, so the
//  cover is the start alone (1 pair) at every cycle end, mod p1 and p2. C2 A LINE MIXER (the mixer on the uniform mode of
//  line 0's two slots, register kept, units u and conj u): it moves along its line and reaches exactly 1 line (the line
//  law, reproduced by a mixer that does not leave the line), on more than 1 cell.
// INSTRUMENT (a failure makes the verdict partial). I1 the float cycle (the float pieces of code/measure/spinor-register
//  and code/measure/wilson-register) has the same support at |amplitude| > 1e-12 as the residues mod p1 and mod p2, on
//  side 4 for 2 cycles, for both rules; and every unit maps to a norm-one residue (u conj(u) = 1 mod p).
// READ, gating nothing: the first cycle of the full cover, the cover per cycle, the weight left on the start dock (the
//  flat share, point 6) and the root sum sum_d r_d |psi_d|^2 over 6 cycles on side 6 (point 4).
// Verdict: fail if A1 to A5 fail; partial if a control or the instrument fails; pass otherwise.
//
// SMOKE RUN BEFORE THE GATE RUN, disclosed (no gate moved after it): tmp/bc-sea-smoke.log, side 4 only, every code path,
//  every gate and control held (full cover at cycles 3 and 2).
//
// FIRST RUN (tmp/bc-sea-gate-run1.log, 96 s): PASS, as predicted. Rerun after the field helpers moved to
//  code/algebra/linear/modular-linear (tmp/bc-sea-gate-run2.log): the same numbers. No gate moved.
//  - A1: every (cell, line) pair covered, mod p1 = 33554383: E-SPN-0160 by cycle 3 on side 4 (3,072 pairs, 256 cells)
//    and side 6 (15,552, 1,296 cells); the chiral Wilson variant by cycle 2 (side 4) and 3 (side 6). Cycle 1 reaches 552
//    pairs on 157 cells (side 4) and 564 on 169 (side 6).
//  - A2: the reach is 2, 4, 6 root steps after cycles 1, 2, 3: the cone of point 3, attained. A3 and A4 exact at both
//    primes (p2 = 33554371). A5: ranks 8, 8, 4, 4, both determinant products 1.
//  - C1: the start alone at every cycle. C2: 1 line, on 2 cells. I1: float and residue supports agree.
//  - Read: the weight left on the start dock after 6 cycles is 0.842 (E-SPN-0160) and 0.850 (chiral Wilson), swinging
//    0.82 to 0.96: most of a one-slot disturbance sits in the flat bands (point 6). The root sum along the start's root
//    runs 0.70, 0.91, 0.84, 0.76, 0.95, 0.72 while every translation commutes exactly: it is not the conserved momentum.
//
// DETERMINISM: no random numbers; fixed starts and a fixed prime search. EXACT: mod p (code/measure/sea-reach) and in
// Eisenstein integers; floats only for I1 and the reads. NOTHING MOVES: a mixer hands a value to another slot of the same
// dock, and the stream takes each slot's value one dock along its root.

import { experiment } from '@/test/scaffold/suite'
import { verdict, type Verdict } from '@/test/scaffold/verdict'
import { ringUnit } from '@/code/measure/swap-string'
import { eisMul, eisPow, type Eis } from '@/code/measure/swap-cone'
import { DOCK_ROOTS, type CMatrix } from '@/code/measure/dock-mixer'
import {
  matMul,
  partnerProjector48,
  registerPiece,
  scaled,
  singletProjector24,
  trace,
} from '@/code/measure/spinor-register'
import { chirality2, volumeRight } from '@/code/measure/chiral-register'
import { mixerPiece } from '@/code/measure/wilson-register'
import { type RingUnit } from '@/code/rule/swap-mixer'
import { OPPOSITE } from '@/code/rule/isometric-knit'
import {
  boxOf,
  conjUnit,
  fieldBeat,
  fieldBeatBack,
  fieldPiece,
  floatBeat,
  floatReads,
  floatSupport,
  lineCover,
  mulUnit,
  newFloat,
  newState,
  primeField,
  sameState,
  translate,
  unitValue,
  type Box,
  type Cover,
  type Field,
  type FieldMatrix,
  type FieldMixer,
  type FloatState,
  type IntProjector,
} from '@/code/measure/sea-reach'

const MODES = 192
const LIGHT: readonly [number, number] = [-1, 4]
const HEAVY: readonly [number, number] = [-2, 5]
const FLOAT_ZERO = 1e-12

export type SeaReachPlan = {
  sides: readonly number[]
  instrumentCycles: number
  readSide: number
  readCycles: number
}

export const GATE_PLAN: SeaReachPlan = {
  sides: [4, 6],
  instrumentCycles: 2,
  readSide: 6,
  readCycles: 6,
}

const flag = (b: boolean): number => (b ? 1 : 0)

export default experiment({
  id: 'foundations/sea-reach',
  code: 'E-FND-0157',
  title:
    'a disturbance of the full sea reaches every line and every dock under the dock-wide mixer, exactly: on the register rule (E-SPN-0160) and its chiral Wilson variant, one member (a hole of the sea, by E-SPN-0163) started on one slot holds a nonzero amplitude on all 12 lines of every dock of D4 boxes of side 4 and 6, proved mod p in the map Z[w][1/42] -> F_p, inside a cone of two root steps a cycle; the run reverses exactly, commutes with every translation (momentum as the Noether charge of translation is kept exactly, while the root sum, a velocity, is not), and keeps the full sea as one branch with unit amplitude; with no mixer the start returns to its slot and with a mixer inside one line the reach is one line, which is the line law of the adopted knit',
  category: 'foundations',
  substrates: ['3434'],
  depth: 'L2',
  paper: false,
  run() {
    return seaReachRun(GATE_PLAN)
  },
})

type Rule = {
  name: string
  beats: [FieldMixer[], FieldMixer[]]
  floats: [CMatrix, CMatrix]
}

const unitFloat = (u: RingUnit): [number, number] => {
  const [a, b] = [Number(u.num[0]), Number(u.num[1])]
  const d = Number(u.den)

  // a + b w, w = (-1 + i sqrt 3) / 2
  return [(a - b / 2) / d, ((b * Math.sqrt(3)) / 2) / d]
}

// u^n as an Eisenstein number over den^n
const eisUnitPow = (u: RingUnit, n: number): { num: Eis; den: bigint } => ({
  num: eisPow([u.num[0], u.num[1]], n),
  den: u.den ** BigInt(n),
})

export function seaReachRun(plan: SeaReachPlan): Verdict {
  const started = Date.now()
  const log = (what: string): void =>
    console.error(
      `${what} ${Math.round((Date.now() - started) / 1000)}s`,
    )
  const f1 = primeField(2 ** 25)
  const f2 = primeField(f1.p)
  const fields: Field[] = [f1, f2]

  // ---- the integer projectors ----
  const S24 = singletProjector24()
  const D48 = partnerProjector48()
  const chi2 = chirality2(volumeRight(), 1)
  const DP96 = matMul(D48, chi2)
  const SP48 = matMul(S24, chi2)
  const ranks = [
    trace(S24) / 24,
    trace(D48) / 48,
    trace(DP96) / 96,
    trace(SP48) / 48,
  ]
  const qS: IntProjector = { M: S24, scale: 24 }
  const qD: IntProjector = { M: D48, scale: 48 }
  const qDP: IntProjector = { M: DP96, scale: 96 }
  const qSP: IntProjector = { M: SP48, scale: 48 }

  // the line mixer of C2: the uniform mode of line 0's two slots, register kept (2 q an integer matrix)
  const L2 = new Float64Array(MODES * MODES)
  const line0 = [0, OPPOSITE[0]!]

  for (const d of line0) {
    for (const e of line0) {
      for (let a = 0; a < 8; a++) {
        L2[(d * 8 + a) * MODES + e * 8 + a] = 1
      }
    }
  }

  const qL: IntProjector = { M: L2, scale: 2 }

  // ---- the rules ----
  const uL = ringUnit(LIGHT[0], LIGHT[1])
  const uH = ringUnit(HEAVY[0], HEAVY[1])
  const one = ringUnit(0, 0)
  const vH = mulUnit(conjUnit(uH), conjUnit(uH))
  const yH = conjUnit(vH)
  const fq = (q: IntProjector): Float64Array => scaled(q.M, q.scale)
  const plain: Rule = {
    name: 'E-SPN-0160',
    beats: [[{ q: qS, unit: uL }], [{ q: qD, unit: conjUnit(uL) }]],
    floats: [
      registerPiece(fq(qS), unitFloat(uL)),
      registerPiece(fq(qD), unitFloat(conjUnit(uL))),
    ],
  }
  const chiral: Rule = {
    name: 'chiral Wilson',
    beats: [
      [
        { q: qS, unit: uH },
        { q: qDP, unit: yH },
      ],
      [
        { q: qD, unit: conjUnit(uH) },
        { q: qSP, unit: vH },
      ],
    ],
    floats: [
      mixerPiece([
        { q: fq(qS), unit: unitFloat(uH) },
        { q: fq(qDP), unit: unitFloat(yH) },
      ]),
      mixerPiece([
        { q: fq(qD), unit: unitFloat(conjUnit(uH)) },
        { q: fq(qSP), unit: unitFloat(vH) },
      ]),
    ],
  }
  const still: Rule = {
    name: 'no mixer',
    beats: [[{ q: qS, unit: one }], [{ q: qD, unit: one }]],
    floats: plain.floats,
  }
  const lineRule: Rule = {
    name: 'line mixer',
    beats: [[{ q: qL, unit: uL }], [{ q: qL, unit: conjUnit(uL) }]],
    floats: plain.floats,
  }

  type Pieces = { forward: FieldMatrix; back: FieldMatrix }[]

  const piecesOf = (r: Rule, f: Field): Pieces =>
    r.beats.map(b => fieldPiece(f, b))

  const cycle = (
    box: Box,
    P: Pieces,
    v: Float64Array,
    f: Field,
  ): Float64Array =>
    fieldBeat(box, P[1]!.forward, fieldBeat(box, P[0]!.forward, v, f.p), f.p)
  const cycleBack = (
    box: Box,
    P: Pieces,
    v: Float64Array,
    f: Field,
  ): Float64Array =>
    fieldBeatBack(
      box,
      P[0]!.back,
      fieldBeatBack(box, P[1]!.back, v, f.p),
      f.p,
    )
  const startOf = (box: Box): Float64Array => {
    const v = newState(box)

    v[0] = 1

    return v
  }

  // ---- A5 and the unit check: exact ----
  const detOne = (units: { u: RingUnit; rank: number }[]): boolean => {
    let num: Eis = [1n, 0n]
    let den = 1n

    for (const { u, rank } of units) {
      const p = eisUnitPow(u, rank)

      num = eisMul(num, p.num)
      den *= p.den
    }

    return num[0] === den && num[1] === 0n
  }
  const A5 =
    ranks.join(',') === '8,8,4,4' &&
    detOne([
      { u: uL, rank: 8 },
      { u: conjUnit(uL), rank: 8 },
    ]) &&
    detOne([
      { u: uH, rank: 8 },
      { u: yH, rank: 4 },
      { u: conjUnit(uH), rank: 8 },
      { u: vH, rank: 4 },
    ])
  const unitsOk = fields.every(f =>
    [uL, uH, vH, yH].every(
      u => (unitValue(f, u) * unitValue(f, conjUnit(u))) % f.p === 1,
    ),
  )
  log('A5')

  // ---- A1 to A4 per rule and side ----
  type RuleRead = {
    rule: string
    side: number
    cells: number
    coverAt: number
    covers: Cover[]
    cone: boolean
    reversal: boolean
    translation: boolean
  }

  const reads: RuleRead[] = []

  for (const side of plan.sides) {
    const box = boxOf(side)

    for (const rule of [plain, chiral]) {
      const P1 = piecesOf(rule, f1)
      const P2 = piecesOf(rule, f2)
      const covers: Cover[] = []

      let v = startOf(box)
      let coverAt = -1

      for (let t = 1; t <= side; t++) {
        v = cycle(box, P1, v, f1)

        const c = lineCover(box, v)

        covers.push(c)

        if (c.pairs === box.cells * 12) {
          coverAt = t
          break
        }
      }

      const T = coverAt > 0 ? coverAt : side
      const cone = covers.every((c, i) => c.reach <= 2 * (i + 1))
      const reversal = [
        { f: f1, P: P1 },
        { f: f2, P: P2 },
      ].every(({ f, P }) => {
        let w = startOf(box)

        for (let t = 0; t < T; t++) {
          w = cycle(box, P, w, f)
        }

        for (let t = 0; t < T; t++) {
          w = cycleBack(box, P, w, f)
        }

        return sameState(w, startOf(box))
      })
      const translation = [
        { f: f1, P: P1 },
        { f: f2, P: P2 },
      ].every(({ f, P }) => {
        const Ue = cycle(box, P, startOf(box), f)

        return DOCK_ROOTS.every((_, d) =>
          sameState(
            cycle(box, P, translate(box, startOf(box), d), f),
            translate(box, Ue, d),
          ),
        )
      })

      reads.push({
        rule: rule.name,
        side,
        cells: box.cells,
        coverAt,
        covers,
        cone,
        reversal,
        translation,
      })
      log(`A1 to A4 ${rule.name} side ${side}`)
    }
  }

  const A1 = reads.every(r => r.coverAt > 0)
  const A2 = reads.every(r => r.cone)
  const A3 = reads.every(r => r.reversal)
  const A4 = reads.every(r => r.translation)

  // ---- controls ----
  const controlBox = boxOf(plan.sides[0]!)
  const controlCovers = (rule: Rule, f: Field): Cover[] => {
    const P = piecesOf(rule, f)
    const out: Cover[] = []

    let v = startOf(controlBox)

    for (let t = 1; t <= plan.sides[0]!; t++) {
      v = cycle(controlBox, P, v, f)
      out.push(lineCover(controlBox, v))
    }

    return out
  }
  const still1 = fields.map(f => controlCovers(still, f))
  const lines1 = fields.map(f => controlCovers(lineRule, f))
  const C1 = still1.every(cs => cs.every(c => c.pairs === 1))
  const C2 =
    lines1.every(cs => cs.every(c => c.lines === 1)) &&
    lines1.every(cs => cs.some(c => c.cells > 1))

  log('C1 C2')

  // ---- I1: floats against residues ----
  let I1support = true

  for (const rule of [plain, chiral]) {
    const Ps = fields.map(f => piecesOf(rule, f))

    let fl: FloatState = newFloat(controlBox)

    fl.re[0] = 1

    const vs = fields.map(() => startOf(controlBox))

    for (let t = 0; t < plan.instrumentCycles; t++) {
      fl = floatBeat(
        controlBox,
        rule.floats[1],
        floatBeat(controlBox, rule.floats[0], fl),
      )
      fields.forEach((f, k) => {
        vs[k] = cycle(controlBox, Ps[k]!, vs[k]!, f)
      })

      const fs = floatSupport(fl, FLOAT_ZERO)

      for (const v of vs) {
        if (!fs.every((x, i) => (x !== 0) === (v[i] !== 0))) {
          I1support = false
        }
      }
    }
  }

  const I1 = I1support && unitsOk

  log('I1')

  // ---- reads: the flat share and the root sum ----
  const readBox = boxOf(plan.readSide)
  const floatRead = [plain, chiral].map(rule => {
    let fl: FloatState = newFloat(readBox)

    fl.re[0] = 1

    const out: { home: number; rootSum: number[] }[] = []

    for (let t = 0; t < plan.readCycles; t++) {
      fl = floatBeat(
        readBox,
        rule.floats[1],
        floatBeat(readBox, rule.floats[0], fl),
      )

      const r = floatReads(readBox, fl, DOCK_ROOTS)

      out.push({ home: r.home / r.total, rootSum: r.rootSum })
    }

    return { rule: rule.name, out }
  })

  log('reads')

  const hard = A1 && A2 && A3 && A4 && A5
  const status = !hard ? 'fail' : !C1 || !C2 || !I1 ? 'partial' : 'pass'
  const readLine = (r: RuleRead): string =>
    `${r.rule} side ${r.side} (${r.cells} cells): full cover at cycle ${r.coverAt}, pairs by cycle ${r.covers.map(c => `${c.pairs}/${c.cells}c/r${c.reach}`).join(' ')}; cone ${r.cone}, reversal ${r.reversal}, translation ${r.translation}`
  const floatLine = floatRead
    .map(
      r =>
        `${r.rule}: home ${r.out.map(x => x.home.toFixed(4)).join(' ')}, root sum ${r.out.map(x => `(${x.rootSum.map(y => y.toFixed(4)).join(',')})`).join(' ')}`,
    )
    .join('; ')

  return verdict({
    status,
    claim: `A1 ${A1} A2 ${A2} A3 ${A3} A4 ${A4} A5 ${A5} (ranks ${ranks.join(' ')}); ${reads.map(readLine).join('; ')}; controls C1 ${C1} (no mixer: pairs ${still1[0]!.map(c => c.pairs).join(' ')}) C2 ${C2} (line mixer: lines ${lines1[0]!.map(c => c.lines).join(' ')}, cells ${lines1[0]!.map(c => c.cells).join(' ')}); instrument I1 ${I1}`,
    metrics: {
      A1: flag(A1),
      A2: flag(A2),
      A3: flag(A3),
      A4: flag(A4),
      A5: flag(A5),
      C1: flag(C1),
      C2: flag(C2),
      I1: flag(I1),
      p1: f1.p,
      p2: f2.p,
      ...Object.fromEntries(
        reads.map(r => [
          `coverAt_${r.rule === 'E-SPN-0160' ? 'plain' : 'chiral'}_${r.side}`,
          r.coverAt,
        ]),
      ),
      homeAfter6Plain: floatRead[0]!.out[floatRead[0]!.out.length - 1]!.home,
      homeAfter6Chiral: floatRead[1]!.out[floatRead[1]!.out.length - 1]!.home,
      seconds: (Date.now() - started) / 1000,
    },
    control: {
      C1: flag(C1),
      C2: flag(C2),
      I1: flag(I1),
    },
    notes: `L1 (the reach in one beat, the cone, Noether's momentum, the sea's determinant) and L2 (the run). Primes p1 ${f1.p} (w ${f1.w}) and p2 ${f2.p} (w ${f2.w}). Reads, the weight left on the start dock and the root sum per cycle on side ${plan.readSide}: ${floatLine}. ${((Date.now() - started) / 1000).toFixed(0)} s.`,
  })
}
