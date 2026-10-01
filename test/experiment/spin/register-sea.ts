// THE MANY-BODY REGISTER RULE RUN WITH THE SEA PRESENT (E-SPN-0175). E-SPN-0163 wrote the many-body rule with registers
// (the second quantization Gamma(P) of E-SPN-0160's one-body pieces) and read it on the full sea and on one hole. What
// OPEN-FND-02 still asks: the rule run with the sea present and with the pair interaction on, K checked never to fire,
// and the flats (the 176 of 192 one-body modes on which the free cycle is the identity, the register's form of
// E-SPN-0143's 22 frozen modes) checked to stay decoupled once holes interact. This file does that.
//
// DERIVED BEFORE THE RUN (code/measure/register-sea; the pieces of E-SPN-0160, the string of E-SPN-0162, the vertex of
// E-SPN-0163).
// 1. THE SEA IS RUN THROUGH ITS HOLES, EXACTLY (L1). A filled sea on M modes cannot be stored, but it does not need to
//    be. Jacobi: the (M - n)-member block of Gamma(P) is det P times the n-hole block of Gamma(conj P), with the sign
//    (-1)^(sum H + sum H'). A pair piece built from sector counts, f(N_Q(x), N_Q(y)), maps under particle-hole Xi to
//    f(r - N_Q(x), r - N_Q(y)) with r = rank Q, since Xi N_Q Xi^-1 = r - N_Q for real Q. So holes in the sea are fermions
//    under conj P with the pair piece in hole counts, and nothing else: the sea itself never appears. The complex
//    conjugate of that is holes under P with every pair angle reversed, which is what the run evolves.
// 2. COUNT FROM THE SEA (L1). Written on raw counts, f = N_x N_y becomes (r - n_x)(r - n_y) = r^2 - r n_x - r n_y + n_x n_y:
//    the hole pair piece plus a ONE-BODY Hartree phase, rho^(-r) on each hole in Q (exactly Gamma(1 + (rho^-r - 1) Q)).
//    For E-SPN-0162's string on Q_S (beat 1) and Q_D (beat 2, reversed) the Hartree phase is a hole's S mixer shifted by
//    8 sum_(y != x) theta min(V(x - y), 8) and its D mixer by the opposite: a mass that depends on the size of the box,
//    because the capped string never falls off. Counting from the sea, f = (N_x - r)(N_y - r), removes it exactly and
//    leaves the same string on hole pairs. That is normal ordering, the fix E-SPN-0134 named for gravity's sign.
// 3. THE CONTACT VERTEX'S IMAGE (L1). For the register exchange O on R registers and F kept labels, normal ordering gives
//    Xi O Xi^-1 = O + (R F^2 - R^2 F) / 2 + (R - F) N (E-SPN-0163's 3 - N is R 2, F 3). Summed over docks the N term is
//    a global phase, so a hole pair feels the same vertex as a member pair.
// 4. THE FLATS (L1). W = range(U - 1) is invariant under the free cycle and contains S (E-SPN-0160). A pair piece of
//    the form 1 + a (Q (x) 1 + 1 (x) Q) + b Q (x) Q with Q = Q_S in beat 1 and Q_D in beat 2 commutes with P_W (x) 1 at
//    each stage, so the number of holes in F is conserved at every n, sea or no sea: the flats stay decoupled and a flat
//    hole stays frozen while another hole passes through it. E-SPN-0163's register exchange placed as a plain DOCK
//    contact (swap two members' registers, keep their slots) does not have that form: on S_x a (x) T D_y eta it leaves
//    S_x c (x) |x, d0, a> - S_x a (x) |x, d0, c>, and a single slot is mostly flat. So the admissible contact is the
//    exchange restricted to the beat's sector, which on an antisymmetric pair is the phase v^2 on Q (x) Q at V = 0.
// 5. K AND THE STORE (L1). The slot rule's K fires at a dock with two or more single lines (one slot of a line empty,
//    the other not), the store on an empty line. Lifted by occupancy, a slot is empty only when all 8 of its register
//    members are gone. In the full sea with n holes a slot holds at least 8 - n, so for n < 8 no slot empties and
//    neither trigger can appear: K is Pauli-blocked by the register's capacity. The same configurations of two MEMBERS
//    on an empty mesh (one dock, two different lines) do trigger K. A hole-relative lift (a line short one member counts
//    as single) would fire there; that lift is read, not gated.
// 6. THE SEA, ONE BRANCH (L1). The stream permutes (slot, register) modes, 8 copies of the slot stream, so its parity
//    on any box is even; X is 96 transpositions; det(1 + (u - 1) Q) = u^8. So the full sea is one branch with amplitude
//    u^(8V) in beat 1 and conj(u)^(8V) in beat 2, exactly 1 a cycle, and the normal-ordered pieces are 1 on it. A sea
//    full in slots but not in the register (one member a slot, register 0) is NOT kept: Q_D mixes registers.
//
// PREDICTED VERDICT: PASS. The rule, written as the one-body pieces plus the sector string and the sector contact
// counted from the sea, runs with the sea present through its holes; the flats stay decoupled; K and the store cannot
// fire below 8 holes in one slot; and the dock contact and E-SPN-0147's member string both couple the flats (controls).
//
// GATES, fixed before the gate run.
//  R THE SEA MAP, EXACT. On an 8-mode toy (two docks of 4 modes, a rank-2 non-coordinate projector at each, a mixer at
//    the light unit, a mode reversal and a stream between the docks, a pair unit rho = ringUnit(1, 0)) on all 256 Fock
//    states: Xi Gamma(P) Xi^-1 = det P Gamma(conj P); Xi N_x Xi^-1 = 2 - N_x; Xi rho^(N_x N_y) Gamma(P) Xi^-1 =
//    det P rho^((2 - N_x)(2 - N_y)) Gamma(conj P); Xi rho^((N_x - 2)(N_y - 2)) Gamma(P) Xi^-1 = det P rho^(N_x N_y)
//    Gamma(conj P); rho^((2 - N_x)(2 - N_y)) = rho^4 Gamma(1 + (rho^-2 - 1)(Q_x + Q_y)) rho^(N_x N_y); and the exchange
//    image Xi O Xi^-1 = O + (R F^2 - R^2 F) / 2 + (R - F) N for (R, F) = (2, 2), (2, 3), (3, 2), (4, 2), (2, 4). And
//    LITERALLY on the real 192-mode pieces of both beats: 72 complementary minors (1, 2 and 3 holes, sizes 191 to 189)
//    equal (-1)^(sum H + sum H') det P conj(det P[H', H]) within 1e-10, with at least 20 of them nonzero.
//  V THE SEA, EXACT: X on 192 modes even; the stream even on the tori L = 4, 6, 8; u^8 conj(u)^8 = 1 at the light unit;
//    the register-full sea's image under beat 1 and beat 2 is its own configuration (the pieces map span(all) onto
//    itself, trivially), so one branch, unit amplitude, 1 a cycle.
//  F THE FLATS, two holes in the sea on the torus L = 4 (128 relative docks, 36,864 amplitudes each) at total momentum
//    0, 64 cycles, the rule = the member mixers at the light unit, the sector string (unit ringUnit(-2, 1) a unit of V,
//    cap 8) and the sector contact (vertex v = ringUnit(2, 0), phase v^2), hole angles reversed: from two W (x) W
//    starts N_F stays within 1e-10 of 0 at every read (cycles 1, 2, 4, 8, 16, 32, 64); from an F (x) W start N_F stays
//    within 1e-10 of 1.
//  K THE TRIGGERS: over every two-hole configuration of the torus (exhaustive), the least slot occupancy is 6 and K's and
//    the store's triggers appear 0 times.
// INSTRUMENT (a failure makes the verdict partial at best). I1 the engine's sector piece equals E-SPN-0162's pieceAt
//  within 1e-13 on a Weyl-filled dock, both sectors. I2 W(q) has rank 16 at all 128 torus momenta, the smallest accepted
//  residual at least 1e-2 and the largest rejected at most 1e-12, and S lies in W within 1e-12. I3 Parseval: the Fourier
//  norm over the sites equals the pair norm within 1e-10. I4 every run keeps its norm within 1e-10 over 64 cycles.
// CONTROLS (a failure makes the verdict partial at best). CF1 the dock contact (E-SPN-0163's register exchange as a dock
//  contact, v^(1 - swap)) moves N_F by more than 1e-4 from each of the three starts. CF2 E-SPN-0147's member string moves
//  N_F by more than 1e-4 from each start. CK the same two-body dynamics read as MEMBERS on an empty mesh puts more than
//  1e-3 of its weight on K's trigger (one dock, two lines) at some read. CV the sea with one member a slot in register 0
//  is kept by beat 1 (its image has 24 rows) and branched by beat 2 (more than 24 rows).
// READ, gating nothing: the Hartree phase a raw string would add on L = 4, 6, 8; N_F against time under the controls;
//  the contact weight; the weight a hole-relative K would fire on.
// Verdict: fail if R, V, F or K fails; partial if all hold and the instrument or a control fails; pass otherwise.
//
// PROBES BEFORE THE GATE RUN, disclosed (no gate moved after them). tmp/rs-probe1: the torus (128 docks, V at most 4),
//  stream parity even, the triggers 0 with least occupancy 6, W rank 16 everywhere (accepted 0.375, rejected 4.9e-16),
//  N_F 1e-13 under the free cycle and the rule for 4 cycles on the slow pieceAt engine. tmp/rs-probe2: every exact toy
//  identity true, the exchange formula at all five (R, F), the literal minors within 3.6e-13 (38 of 72 nonzero).
//  tmp/rs-probe3 (16 cycles, 4 printed digits): sectorPiece equals pieceAt to 3.1e-16; the rule keeps N_F at 1e-14 from
//  two W (x) W starts and at 1.0000 from F (x) W; the dock contact moves it to 0.34 and 0.60 (W (x) W) and to 1.15 then
//  0.985 (F (x) W: it pushes holes both ways); the member string moves it by 6e-3 to 9e-3 (W (x) W) and 1.3e-3 (F (x) W).
//  A two-cycle smoke of this file (tmp/rs-smoke) exercised every code path before the gate run.
//
// FIRST RUN (tmp/spn-sea-gate.log, 1,351 s): PASS, as predicted. No gate moved and none was rerun.
//  - R: every toy identity exact on 256 Fock states, the exchange image at all five (R, F), 72 literal minors of the real
//    pieces (38 nonzero) within 3.6e-13.
//  - V: X even, the stream even on L 4, 6, 8, u^8 conj(u)^8 = 1.
//  - F: the rule keeps N_F within 3.5e-14 and 3.3e-14 of 0 (two W (x) W starts) and within 1.1e-13 of 1 (F (x) W) at
//    cycles 1 to 64.
//  - K: 4,718,592 two-hole configurations, least occupancy 6, K 0, store 0.
//  - Instrument: sector piece against pieceAt 3.1e-16, W rank 16 at 128 momenta (accepted 0.375, rejected 4.9e-16),
//    Parseval and norm within 4.1e-12.
//  - Controls: the dock contact moves N_F by 0.339, 0.687 and 0.154; the member string by 8.6e-3, 8.4e-3 and 1.3e-3;
//    members on an empty mesh put up to 0.217 on K's trigger; the register-0 sea reaches 24 rows under beat 1 and 144
//    under beat 2.
//  - Read: the hole pair sits at contact up to 0.20 to 0.42 of its weight, 0.18 to 0.39 on two different lines (where a
//    hole-relative K would fire). A raw string's Hartree phase a beat: 0.577 (L 4), -1.900 (L 6), 0.106 (L 8).

import { experiment } from '@/test/scaffold/suite'
import { verdict, type Verdict } from '@/test/scaffold/verdict'
import { ringUnit, unitAngle } from '@/code/measure/swap-string'
import { eisConj, eisMul, eisPow, type Eis } from '@/code/measure/swap-cone'
import { complexDeterminant } from '@/code/measure/chiral-flow'
import { OPPOSITE } from '@/code/rule/isometric-knit'
import {
  partnerProjector48,
  registerPiece,
  scaled,
  singletProjector24,
} from '@/code/measure/spinor-register'
import {
  betaOf,
  partnerBasis,
  pieceAt,
} from '@/code/measure/register-meson'
import {
  qw,
  qwAdd,
  qwConj,
  qwFromUnit,
  qwMul,
  qwSub,
  QW_ONE,
  QW_ZERO,
  type QW,
  type QWMatrix,
} from '@/code/measure/flavor-register'
import {
  fockGamma,
  fockOperator,
  numberOperator,
  particleHole,
  qwDaggerSq,
  qwDet,
  qwIdentityOf,
  qwMatEqual,
  qwMatMulSq,
  qwMatSub,
  qwScalar,
  registerExchange,
  unitPower,
} from '@/code/measure/register-many-body'
import {
  contactWeights,
  flatCount,
  FULL,
  MODES,
  movingBlocks,
  newPair,
  pairNorm,
  pairStart,
  seaCycle,
  sectorBases,
  sectorPiece,
  seaTriggers,
  streamParity,
  torus,
  type Pair,
  type SeaRule,
} from '@/code/measure/register-sea'

const LIGHT: readonly [number, number] = [-1, 4]
const STRING: readonly [number, number] = [-2, 1]
const VERTEX: readonly [number, number] = [2, 0]
const TOY_PAIR: readonly [number, number] = [1, 0]
const CAP = 8
const READS: readonly number[] = [1, 2, 4, 8, 16, 32, 64]
const EXCHANGES: readonly [number, number][] = [
  [2, 2],
  [2, 3],
  [3, 2],
  [4, 2],
  [2, 4],
]
const EXACT_FLOAT = 1e-10
const PIECE_TOL = 1e-13
const MOVE_ACCEPT = 1e-2
const MOVE_REJECT = 1e-12
const CONTROL_MOVE = 1e-4
const CONTROL_K = 1e-3

export type SeaPlan = { L: number; cycles: number; reads: readonly number[] }

export const GATE_PLAN: SeaPlan = { L: 4, cycles: 64, reads: READS }

const flag = (b: boolean): number => (b ? 1 : 0)

export default experiment({
  id: 'spin/register-sea',
  code: 'E-SPN-0175',
  title:
    "the many-body register rule run with the sea present, pass: the sea is run exactly through its holes (Jacobi and particle-hole checked on every Fock state of an exact toy and on 72 literal complementary minors of the real 192-mode pieces, worst 3.6e-13), a pair piece must be counted from the sea or its Hartree phase makes the hole's mass depend on the box, the full sea is one branch with a unit amplitude every beat, two holes interacting through the sector string and the sector contact keep the 176 flat modes exactly decoupled for 64 cycles on the L = 4 torus (N_F within 1.2e-13 of 0 from two moving starts and of 1 from a frozen-plus-moving start), and K and the store never fire (least slot occupancy 6 over all 4,718,592 two-hole configurations: the register's capacity blocks them); E-SPN-0163's register exchange placed as a dock contact releases flat weight (N_F to 0.69) and E-SPN-0147's member string leaks 8.6e-3, so only sector pieces keep the flats",
  category: 'spin',
  substrates: ['3434'],
  depth: 'L1',
  paper: false,
  run() {
    return registerSeaRun(GATE_PLAN)
  },
})

// ---------------- R: the exact toy ----------------

function toyChecks(): Record<string, boolean> {
  const n = 8
  const half = qw(1n, 0n, 2n)
  const Z = (): QWMatrix =>
    Array.from({ length: n }, () =>
      Array.from({ length: n }, () => QW_ZERO),
    )
  const Qx = Z()
  const Qy = Z()

  for (const [a, b] of [
    [0, 1],
    [2, 3],
  ] as const) {
    for (const i of [a, b]) {
      for (const j of [a, b]) {
        Qx[i]![j] = half
        Qy[i + 4]![j + 4] = half
      }
    }
  }

  const u = qwFromUnit(ringUnit(LIGHT[0], LIGHT[1]))
  const rho = qwFromUnit(ringUnit(TOY_PAIR[0], TOY_PAIR[1]))
  // the mode reversal in each dock, then modes 1 <-> 5 and 2 <-> 6 stream between the docks
  const perm = [3, 6, 5, 0, 7, 2, 1, 4]
  const Q = Z().map((r, i) => r.map((_, j) => qwAdd(Qx[i]![j]!, Qy[i]![j]!)))
  const mixer = (w: QW): QWMatrix =>
    Z().map((r, i) =>
      r.map((_, j) =>
        qwAdd(i === j ? QW_ONE : QW_ZERO, qwMul(qwSub(w, QW_ONE), Q[i]![j]!)),
      ),
    )
  const mix = mixer(u)
  const P = Z().map((r, i) =>
    r.map((_, j) =>
      perm.reduce((s, to, k) => (to === i ? qwAdd(s, mix[k]![j]!) : s), QW_ZERO),
    ),
  )
  const NQ = (A: QWMatrix): QWMatrix =>
    fockOperator(
      n,
      A.flatMap((r, i) =>
        r.flatMap((x, j) =>
          x.a === 0n && x.b === 0n
            ? []
            : [
                {
                  coef: x,
                  ops: [
                    { dag: true, mode: i },
                    { dag: false, mode: j },
                  ],
                },
              ],
        ),
      ),
    )
  const Nx = NQ(Qx)
  const Ny = NQ(Qy)
  const two = qwScalar(qwIdentityOf(256), qw(2n, 0n))
  const raw = qwMatMulSq(Nx, Ny)
  const ordered = qwMatMulSq(qwMatSub(Nx, two), qwMatSub(Ny, two))
  const hole = qwMatMulSq(qwMatSub(two, Nx), qwMatSub(two, Ny))
  const pw = (H: QWMatrix): QWMatrix => unitPower(H, [0, 1, 2, 4], rho)!.U
  const G = fockGamma(P)
  const Gc = fockGamma(P.map(r => r.map(qwConj)))
  const dP = qwDet(P)
  const Xi = particleHole(n)
  const by = (A: QWMatrix): QWMatrix =>
    qwMatMulSq(qwMatMulSq(Xi, A), qwDaggerSq(Xi))
  const rm2 = qwMul(qwConj(rho), qwConj(rho))
  const rho4 = qwMul(qwMul(rho, rho), qwMul(rho, rho))
  const out: Record<string, boolean> = {
    gamma: qwMatEqual(by(G), qwScalar(Gc, dP)),
    number: qwMatEqual(by(Nx), qwMatSub(two, Nx)),
    raw: qwMatEqual(
      by(qwMatMulSq(pw(raw), G)),
      qwScalar(qwMatMulSq(pw(hole), Gc), dP),
    ),
    ordered: qwMatEqual(
      by(qwMatMulSq(pw(ordered), G)),
      qwScalar(qwMatMulSq(pw(raw), Gc), dP),
    ),
    hartree: qwMatEqual(
      pw(hole),
      qwScalar(qwMatMulSq(fockGamma(mixer(rm2)), pw(raw)), rho4),
    ),
  }

  for (const [R, F] of EXCHANGES) {
    const m = R * F
    const O = registerExchange(R, F)
    const X = particleHole(m)
    const c = (R * F * F - R * R * F) / 2
    const want = qwMatSub(
      O,
      qwMatSub(
        qwScalar(numberOperator(m), qw(BigInt(F - R), 0n)),
        qwScalar(qwIdentityOf(1 << m), qw(BigInt(c), 0n)),
      ),
    )

    out[`exchange ${R},${F}`] = qwMatEqual(
      qwMatMulSq(qwMatMulSq(X, O), qwDaggerSq(X)),
      want,
    )
  }

  return out
}

// the literal complementary minors of the real 192-mode pieces
function literalMinors(
  pieces: readonly { re: Float64Array; im: Float64Array }[],
): { worst: number; nonzero: number; count: number } {
  const M = MODES
  const phi = (Math.sqrt(5) - 1) / 2
  const value = (d: { phase: number; logAbs: number }): [number, number] =>
    Number.isFinite(d.logAbs)
      ? [
          Math.exp(d.logAbs) * Math.cos(d.phase),
          Math.exp(d.logAbs) * Math.sin(d.phase),
        ]
      : [0, 0]
  const sub = (
    P: { re: Float64Array; im: Float64Array },
    rows: readonly number[],
    cols: readonly number[],
  ): { re: Float64Array; im: Float64Array } => {
    const k = rows.length
    const re = new Float64Array(k * k)
    const im = new Float64Array(k * k)

    rows.forEach((r, i) =>
      cols.forEach((c, j) => {
        re[i * k + j] = P.re[r * M + c]!
        im[i * k + j] = P.im[r * M + c]!
      }),
    )

    return { re, im }
  }
  const pick = (off: number, h: number): number[] => {
    const out: number[] = []

    for (let s = 1; out.length < h; s++) {
      const x = Math.floor((((off + s) * phi) % 1) * M)

      if (!out.includes(x)) {
        out.push(x)
      }
    }

    return out.sort((a, b) => a - b)
  }
  const comp = (S: readonly number[]): number[] =>
    Array.from({ length: M }, (_, i) => i).filter(i => !S.includes(i))

  let worst = 0
  let nonzero = 0
  let count = 0

  for (const P of pieces) {
    const full = value(complexDeterminant(P, M))

    for (let h = 1; h <= 3; h++) {
      for (let k = 0; k < 12; k++) {
        const H = pick(k * 7 + h, h)
        const Hp =
          k % 2 === 0
            ? H.map(x => (x + 24) % M).sort((a, b) => a - b)
            : pick(k * 11 + 5, h)
        const big = value(complexDeterminant(sub(P, comp(Hp), comp(H)), M - h))
        const small = value(complexDeterminant(sub(P, Hp, H), h))
        const sign =
          (H.reduce((a, b) => a + b, 0) + Hp.reduce((a, b) => a + b, 0)) %
            2 ===
          0
            ? 1
            : -1
        const pr = sign * (full[0] * small[0] + full[1] * small[1])
        const pi = sign * (full[1] * small[0] - full[0] * small[1])

        worst = Math.max(worst, Math.hypot(big[0] - pr, big[1] - pi))
        nonzero += Math.hypot(small[0], small[1]) > 1e-9 ? 1 : 0
        count++
      }
    }
  }

  return { worst, nonzero, count }
}

export function registerSeaRun(plan: SeaPlan): Verdict {
  const started = Date.now()
  const log = (what: string): void =>
    console.error(`${what} ${Math.round((Date.now() - started) / 1000)}s`)
  const uL = ringUnit(LIGHT[0], LIGHT[1])
  const th = unitAngle(uL)
  const u: [number, number] = [Math.cos(th), Math.sin(th)]
  const qS = scaled(singletProjector24(), 24)
  const qD = scaled(partnerProjector48(), 48)
  const Ps = [registerPiece(qS, u), registerPiece(qD, [u[0], -u[1]])]

  // ---------------- R ----------------
  const toy = toyChecks()
  const minors = literalMinors(Ps)
  const R =
    Object.values(toy).every(Boolean) &&
    minors.worst <= EXACT_FLOAT &&
    minors.nonzero >= 20

  log('R')

  // ---------------- V ----------------
  const seen = new Uint8Array(MODES)

  let xParity = 0

  for (let i = 0; i < MODES; i++) {
    let j = i
    let len = 0

    while (!seen[j]) {
      seen[j] = 1
      j = OPPOSITE[Math.floor(j / 8)]! * 8 + (j % 8)
      len++
    }

    if (len > 0) {
      xParity ^= (len - 1) & 1
    }
  }

  const tori = [4, 6, 8].map(L => ({ L, T: torus(L) }))
  const parities = tori.map(({ T }) => streamParity(T))
  const num: Eis = [uL.num[0], uL.num[1]]
  const cyc = eisMul(eisPow(num, 8), eisPow(eisConj(num), 8))
  const unitCycle = cyc[0] === uL.den ** 16n && cyc[1] === 0n
  const V = xParity === 0 && parities.every(p => p.whole === 0) && unitCycle

  // CV: one member a slot in register 0: the rows its columns reach under each beat's piece (exact: integer 24 Q_S,
  // 48 Q_D; a column reaches a row where the identity or Q is nonzero)
  const S24 = singletProjector24()
  const D48 = partnerProjector48()
  const reached = (q: Float64Array): number => {
    const rows = new Set<number>()

    for (let d = 0; d < 24; d++) {
      const col = d * 8

      for (let r = 0; r < MODES; r++) {
        if (r === col || q[r * MODES + col] !== 0) {
          rows.add(r)
        }
      }
    }

    return rows.size
  }
  const cvS = reached(S24)
  const cvD = reached(D48)
  const CV = cvS === 24 && cvD > 24

  log('V')

  // ---------------- instrument I1, I2 ----------------
  const phi = (Math.sqrt(5) - 1) / 2
  const fill = (): { re: Float64Array; im: Float64Array } => ({
    re: Float64Array.from({ length: FULL }, (_, k) => ((k * phi) % 1) - 0.5),
    im: Float64Array.from(
      { length: FULL },
      (_, k) => ((k * phi * phi) % 1) - 0.5,
    ),
  })
  const B = sectorBases()
  const beta = betaOf(u[0], u[1], unitAngle(ringUnit(STRING[0], STRING[1])))

  let pieceGap = 0

  for (const sector of ['S', 'D'] as const) {
    const a = fill()
    const b = fill()

    pieceAt(a.re, a.im, 0, sector, u[0], u[1], beta[0], beta[1], partnerBasis())
    sectorPiece(
      b.re,
      b.im,
      0,
      sector === 'S' ? B.S : B.D,
      [u[0] - 1, u[1]],
      beta,
    )

    for (let k = 0; k < FULL; k++) {
      pieceGap = Math.max(
        pieceGap,
        Math.hypot(a.re[k]! - b.re[k]!, a.im[k]! - b.im[k]!),
      )
    }
  }

  const T = torus(plan.L)
  const mv = movingBlocks(T, Ps)
  const I1 = pieceGap <= PIECE_TOL
  const I2 =
    mv.rank.every(k => k === 16) &&
    mv.accepted >= MOVE_ACCEPT &&
    mv.rejected <= MOVE_REJECT &&
    mv.sOutsideW <= MOVE_REJECT

  log('I1 I2')

  // ---------------- K ----------------
  const trig = seaTriggers(T)
  const K =
    trig.leastOccupancy === 6 &&
    trig.kTriggers === 0 &&
    trig.storeTriggers === 0

  // ---------------- F: the runs ----------------
  const sAng = unitAngle(ringUnit(STRING[0], STRING[1]))
  const vAng = unitAngle(ringUnit(VERTEX[0], VERTEX[1]))
  // hole angles reversed (derived point 1)
  const rules: Record<string, SeaRule> = {
    rule: {
      u,
      string: -sAng,
      cap: CAP,
      contact: -2 * vAng,
      dock: null,
      member: false,
    },
    dock: {
      u,
      string: 0,
      cap: CAP,
      contact: 0,
      dock: [Math.cos(-vAng), Math.sin(-vAng)],
      member: false,
    },
    member: {
      u,
      string: -sAng,
      cap: CAP,
      contact: 0,
      dock: null,
      member: true,
    },
  }
  const starts: { name: string; flat: number; make: () => Pair }[] = [
    { name: 'WW a', flat: 0, make: () => pairStart(T, mv, 'W', 0, 'W', 47) },
    { name: 'WW b', flat: 0, make: () => pairStart(T, mv, 'W', 19, 'W', 20) },
    { name: 'FW', flat: 1, make: () => pairStart(T, mv, 'F', 0, 'W', 47) },
  ]
  const runs: {
    start: string
    rule: string
    flat: number
    nF: number[]
    drift: number
    parseval: number
    contact: number
    twoLines: number
  }[] = []

  for (const st of starts) {
    const s0 = st.make()

    for (const [name, rule] of Object.entries(rules)) {
      const s: Pair = { re: Float64Array.from(s0.re), im: Float64Array.from(s0.im) }
      const spare = newPair(T)
      const nF: number[] = []

      let drift = 0
      let parseval = 0
      let contact = 0
      let twoLines = 0

      for (let c = 1; c <= plan.cycles; c++) {
        seaCycle(T, rule, B, s, spare)

        const cw = contactWeights(T, s)

        contact = Math.max(contact, cw.contact)
        twoLines = Math.max(twoLines, cw.twoLines)

        if (plan.reads.includes(c)) {
          const norm = pairNorm(s)
          const f = flatCount(T, mv, s)

          nF.push(f.nF)
          drift = Math.max(drift, Math.abs(norm - 1))
          parseval = Math.max(
            parseval,
            Math.abs(f.fourier / T.sites.length - norm),
          )
        }
      }

      runs.push({
        start: st.name,
        rule: name,
        flat: st.flat,
        nF,
        drift,
        parseval,
        contact,
        twoLines,
      })
      log(`${st.name} ${name}: nF ${nF.map(x => x.toExponential(3)).join(' ')}`)
    }
  }

  // CK: the same two-body dynamics read as MEMBERS on an empty mesh (the angles not reversed), from the first start
  const members: SeaRule = {
    u,
    string: sAng,
    cap: CAP,
    contact: 2 * vAng,
    dock: null,
    member: false,
  }
  const m0 = starts[0]!.make()
  const mSpare = newPair(T)

  let memberTwoLines = 0

  for (let c = 1; c <= plan.cycles; c++) {
    seaCycle(T, members, B, m0, mSpare)
    memberTwoLines = Math.max(memberTwoLines, contactWeights(T, m0).twoLines)
  }

  log(`members on the empty mesh: K trigger weight max ${memberTwoLines.toExponential(3)}`)

  const ruleRuns = runs.filter(r => r.rule === 'rule')
  const F = ruleRuns.every(r =>
    r.nF.every(x => Math.abs(x - r.flat) <= EXACT_FLOAT),
  )
  const moved = (r: (typeof runs)[number]): number =>
    Math.max(...r.nF.map(x => Math.abs(x - r.flat)))
  const CF1 = runs.filter(r => r.rule === 'dock').every(r => moved(r) > CONTROL_MOVE)
  const CF2 = runs
    .filter(r => r.rule === 'member')
    .every(r => moved(r) > CONTROL_MOVE)
  const CK = memberTwoLines > CONTROL_K
  const I3 = runs.every(r => r.parseval <= EXACT_FLOAT)
  const I4 = runs.every(r => r.drift <= EXACT_FLOAT)
  const instrument = I1 && I2 && I3 && I4
  const controls = CF1 && CF2 && CK && CV

  // READ: the Hartree phase a raw string would put on a hole's S mixer each beat, 8 theta sum_(y != 0) min(V, 8)
  const hartree = tori.map(({ L, T: t }) => {
    let s = 0

    for (let i = 0; i < t.sites.length; i++) {
      if (i !== t.origin) {
        s += Math.min(t.V[i]!, CAP)
      }
    }

    const ph = 8 * sAng * s
    const wrapped = Math.atan2(Math.sin(ph), Math.cos(ph))

    return { L, sum: s, phase: wrapped }
  })

  const hard = R && V && F && K
  const status = !hard ? 'fail' : !instrument || !controls ? 'partial' : 'pass'
  const metrics: Record<string, number> = {
    R: flag(R),
    V: flag(V),
    F: flag(F),
    K: flag(K),
    I1: flag(I1),
    I2: flag(I2),
    I3: flag(I3),
    I4: flag(I4),
    CF1: flag(CF1),
    CF2: flag(CF2),
    CK: flag(CK),
    CV: flag(CV),
    minorsWorst: minors.worst,
    minorsNonzero: minors.nonzero,
    pieceGap,
    moveAccepted: mv.accepted,
    moveRejected: mv.rejected,
    sOutsideW: mv.sOutsideW,
    leastOccupancy: trig.leastOccupancy,
    kTriggers: trig.kTriggers,
    storeTriggers: trig.storeTriggers,
    configurations: trig.configurations,
    cvRowsS: cvS,
    cvRowsD: cvD,
    memberTwoLines,
    seconds: (Date.now() - started) / 1000,
  }

  for (const r of runs) {
    const key = `${r.start.replace(' ', '')}_${r.rule}`

    metrics[`${key}_nFmove`] = moved(r)
    metrics[`${key}_drift`] = r.drift
    metrics[`${key}_contact`] = r.contact
    metrics[`${key}_twoLines`] = r.twoLines
  }

  hartree.forEach(h => (metrics[`hartree_L${h.L}`] = h.phase))

  const runText = runs
    .map(
      r =>
        `${r.start}/${r.rule}: N_F ${r.nF.map(x => x.toExponential(3)).join(' ')} (drift ${r.drift.toExponential(1)}, contact max ${r.contact.toExponential(3)}, two lines max ${r.twoLines.toExponential(3)})`,
    )
    .join('; ')

  return verdict({
    status,
    claim: `R ${R} (toy ${Object.entries(toy)
      .map(([k, v]) => `${k} ${v}`)
      .join(', ')}; ${minors.count} literal minors, ${minors.nonzero} nonzero, worst ${minors.worst.toExponential(2)}); V ${V} (X parity ${xParity}, stream parity ${parities.map(p => p.whole).join(' ')} on L 4 6 8, u^8 conj(u)^8 = 1 ${unitCycle}); F ${F}; K ${K} (${trig.configurations} configurations, least occupancy ${trig.leastOccupancy}, K ${trig.kTriggers}, store ${trig.storeTriggers}); instrument I1 ${I1} (${pieceGap.toExponential(2)}) I2 ${I2} I3 ${I3} I4 ${I4}; controls CF1 ${CF1} CF2 ${CF2} CK ${CK} CV ${CV} (rows ${cvS}, ${cvD}). Runs: ${runText}`,
    metrics,
    control: {
      CF1: flag(CF1),
      CF2: flag(CF2),
      CK: flag(CK),
      CV: flag(CV),
      instrument: flag(instrument),
    },
    notes: `L1 (the sea map, the counts, the flats' algebra) and L2 (the two-hole runs). Light unit ${th.toFixed(6)}, string ${sAng.toFixed(6)} a unit of V (cap ${CAP}), vertex ${vAng.toFixed(6)}. Torus L ${plan.L}: ${T.sites.length} relative docks, ${T.momenta.length} momenta, W accepted ${mv.accepted.toExponential(3)}, rejected ${mv.rejected.toExponential(3)}. Hartree phase of a raw string a beat: ${hartree.map(h => `L ${h.L} sum ${h.sum} phase ${h.phase.toFixed(6)}`).join('; ')}. ${((Date.now() - started) / 1000).toFixed(0)} s.`,
  })
}
