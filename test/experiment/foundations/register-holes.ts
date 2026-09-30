// THE MANY-HOLE ENGINE FOR THE REGISTER RULE, VALIDATED (E-FND-0161). Every register-rule read so far is two holes of
// the full sea on the 4d D4 torus, on E-SPN-0175's engine, which holds each member's whole 192-mode slot-and-register
// space at every relative dock: (L^4 / 2)^(n - 1) 192^n amplitudes, 4.7e6 for two holes at L = 4 and 1.2e11 for three.
// The rows OPEN-FND-03 still names (temperature, the Bose and Fermi laws, bosons as composites, hydrodynamics, a self)
// all need more. This file builds the engine that reaches three holes exactly and validates it against E-SPN-0175 and
// E-FND-0158 before anything is trusted to it. The method is chosen in remaining-pieces.md, "A many-hole engine for the
// register rule"; the physics it unlocks first is E-FND-0162.
//
// DERIVED BEFORE THE RUN (code/measure/register-holes on code/measure/register-sea).
// 1. THE FLATS ARE EXACT SPECTATORS (L1). The free cycle is the identity on F(q), the 176 flat states a momentum, and every
//    piece of the rule is one-body or a sector pair piece on Q_S (beat 1) and Q_D (beat 2). S lies in W = range(U - 1) and
//    D in B1 W (E-SPN-0175), so a flat hole has zero sector amplitude at both stages: it never moves, never meets a pair
//    piece, and never blocks a moving hole, since the two occupy orthogonal one-body spaces. So the holes' Fock space
//    factors as Fock(F) (x) Fock(W) and the many-body cycle as 1 (x) U_W: any number of flat holes rides along exactly,
//    and only the moving holes are run. The cost drops from 192^n to 16^n a momentum tuple.
// 2. EACH HOLE KEEPS ITS HALF (L1). Every piece commutes with J on each member (E-FRC-0258), so a run whose holes all
//    start in half + stays there, and the fiber is 8 a member.
// 3. THE FRAME (L1). At each momentum the moving states get an orthonormal basis whose first four (a half) are the sector
//    states themselves, rotated to J's eigenbasis: S in beat 1's frame (W) and D in beat 2's (W2 = span B1 W). Both are
//    the same 192-vectors at every momentum. So the pair piece reads the fiber index, and the one-body beats are the
//    transfers A1 = W2^dag B1 W and A2 = W^dag B2 W2, 16 x 16 (8 x 8 on one half), with the mixer inside. They must be
//    unitary, complete (B1 W inside W2, B2 W2 inside W) and block diagonal in the halves.
// 4. THE PAIRS (L1). E-SPN-0175's two-hole piece is (M (x) M)(1 + (e^(i phi(y)) - 1) Q (x) Q). The n-hole piece is the
//    product over pairs, which commute (each is diagonal in the sector occupations), so it is the phase e^(i sum phi) over
//    the pairs whose members are both in the sector. It is applied in relative coordinates y_i = x_i - x_n by a unitary
//    Fourier transform over the D4 torus (a 4d FFT on the L^4 grid, the odd sites empty), exact for any total momentum.
// 5. THE SIZE. Two holes: N 16^2 amplitudes (32,768 at L = 4 against the dense engine's 4,718,592). Three holes in one
//    half: N^2 8^3 (8.4e6 at L = 4, 134 MB); in both halves N^2 16^3 (6.7e7). Four holes in one half at L = 4 need
//    128^3 8^4 = 8.6e9 amplitudes (137 GB): out of reach, and the antisymmetric part alone (divided by 4! = 24) is still
//    5.7 GB. So the engine reaches n = 2 at every torus run so far and n = 3 at L = 4, and n = 4 only on the L = 2 box.
//
// PREDICTED VERDICT: PASS. The reduced engine is E-SPN-0175's rule, so it must agree with the dense engine amplitude for
// amplitude from moving starts, and E-FND-0158's traded weights (whose start holds flat parts) must come out of the
// moving part alone.
//
// GATES, fixed before the gate run. The rule is E-SPN-0175's: the member mixers at the light unit ringUnit(-1, 4), the
// sector string ringUnit(-2, 1) a unit of V (cap 8) and the sector contact v^2 with v = ringUnit(2, 0), hole angles
// reversed.
//  V1 THE FRAME, at L = 4 and L = 6, both halves: every sector state lies in its moving span within 1e-12; B1 W lies in W2
//    and B2 W2 in W within 1e-12; every transfer is unitary within 1e-12; the entries between halves are at most 1e-12;
//    every half at every momentum takes exactly 4 complement states, the smallest accepted Gram-Schmidt residual at least
//    1e-2 and the largest rejected at most 1e-12.
//  V2 E-SPN-0175, AMPLITUDE FOR AMPLITUDE. Two holes at total momentum 0, from E-SPN-0175's two W (x) W starts (modes 0,
//    47 and 19, 20) on L = 4 for 64 cycles, and from the first on L = 6 for 8 cycles: the dense pair projected into the
//    reduced coordinates differs from the reduced engine's state by at most 1e-12 in any amplitude at every read (L = 4:
//    cycles 1, 2, 4, 8, 16, 32, 64; L = 6: 1, 2, 4, 8), and the dense pair's weight outside W (x) W is at most 1e-10.
//  V3 E-FND-0158, THE FLATS AS SPECTATORS. E-FND-0158's distinguishable start (one dock, slots 0 and 1, register 0), most
//    of whose weight is flat: the weight it trades between relative momenta, read on the dense engine over all modes and on
//    the reduced engine from the W (x) W part alone, agree within 1e-10 at every read over 64 cycles on L = 4.
//  V4 THREE HOLES, one half, L = 4. (a) With the pair piece on one pair only (each of the three), a product of a two-hole
//    state and a lone hole equals the two-hole engine's run times the lone hole's free cycle within 1e-14 after 4 cycles.
//    (b) Under the free rule an antisymmetrized start equals the Slater determinant of its free-evolved orbitals within
//    1e-12 at every cycle to 16. (c) Under the rule the same start's weight outside the antisymmetric sector is at most
//    1e-14 at cycles 1, 8, 16, and the norm stays within 1e-10.
// CONTROLS, which must fail to agree (a failure makes the verdict partial at best).
//  CT1 THE COMPARISON HAS TEETH: the reduced engine with the beat-2 pair angle NOT reversed differs from the dense engine
//    by more than 1e-3 in some amplitude within 4 cycles (first start, L = 4).
//  CT2 THE PAIR PIECE MATTERS: the reduced free rule differs from the dense rule by more than 1e-3 within 4 cycles.
// INSTRUMENT (a failure makes the verdict partial at best). I1 every reduced run keeps its norm within 1e-10.
// READ, gating nothing: the amplitude counts and the seconds a cycle of each engine.
// Verdict: fail if V1, V2, V3 or V4 fails; partial if all hold and a control or the instrument fails; pass otherwise.
//
// PROBES BEFORE THE GATE RUN, disclosed (no gate moved after them). tmp/mh-probe1 (3 cycles, L = 4): the frame's
//  residuals 8.7e-16 (sector), 1.4e-15 (transfer), 4.3e-15 (unitary), 6e-17 (between halves), accepted 0.219, rejected
//  9e-16; the dense and reduced two-hole states agree to 2.2e-16 to 4.8e-16 from both starts. tmp/mh-probe2: the three
//  pair masks agree with the two-hole engine to 2.0e-17 to 2.3e-17 after 3 cycles; the antisymmetric sector's
//  complement 1.1e-16 under the rule; the free rule keeps the momentum weights to the last printed digit.

import { experiment } from '@/test/scaffold/suite'
import { verdict, type Verdict } from '@/test/scaffold/verdict'
import { ringUnit, unitAngle } from '@/code/measure/swap-string'
import {
  partnerProjector48,
  registerPiece,
  scaled,
  singletProjector24,
} from '@/code/measure/spinor-register'
import {
  newPair,
  pairAt,
  pairStart,
  seaCycle,
  sectorBases,
  torus,
  FULL,
  type Pair,
  type SeaRule,
  type Torus,
} from '@/code/measure/register-sea'
import { localPair, relativeWeights } from '@/code/measure/register-crossing'
import {
  bandVectors,
  copyHoles,
  exchangeWeights,
  fromDensePair,
  holeCycle,
  holeEngine,
  holeFrame,
  holeGap,
  holeNorm,
  newHoles,
  orbitalCycle,
  pairAngles,
  slaterStart,
  vec,
  type HoleEngine,
  type HoleFrame,
  type Holes,
} from '@/code/measure/register-holes'

const LIGHT: readonly [number, number] = [-1, 4]
const STRING: readonly [number, number] = [-2, 1]
const VERTEX: readonly [number, number] = [2, 0]
const CAP = 8
const FRAME_TOL = 1e-12
const MOVE_ACCEPT = 1e-2
const MOVE_REJECT = 1e-12
const DENSE_TOL = 1e-12
const OUTSIDE_TOL = 1e-10
const TRADE_TOL = 1e-10
const MASK_TOL = 1e-14
const SLATER_TOL = 1e-12
const EXCHANGE_TOL = 1e-14
const NORM_TOL = 1e-10
const TEETH = 1e-3
const GOLDEN = (Math.sqrt(5) - 1) / 2

export type HolesPlan = {
  L: number
  cycles: number
  reads: readonly number[]
  L6: number
  cycles6: number
  reads6: readonly number[]
  maskCycles: number
  slaterCycles: number
  teethCycles: number
}

export const GATE_PLAN: HolesPlan = {
  L: 4,
  cycles: 64,
  reads: [1, 2, 4, 8, 16, 32, 64],
  L6: 6,
  cycles6: 8,
  reads6: [1, 2, 4, 8],
  maskCycles: 4,
  slaterCycles: 16,
  teethCycles: 4,
}

const flag = (b: boolean): number => (b ? 1 : 0)

export default experiment({
  id: 'foundations/register-holes',
  code: 'E-FND-0161',
  title:
    'the many-hole engine for the register rule, exact and validated, pass: the flats are exact spectators and each hole keeps its half, so n holes run on the 16 moving states a momentum (8 in one half) with the sector states as coordinates and the pair piece as a phase product over pairs in the sector; it matches E-SPN-0175 amplitude for amplitude and reproduces E-FND-0158 from the moving part alone, and it reaches three holes on the L = 4 torus exactly (8.4e6 amplitudes in one half against 1.2e11 dense) while four holes stay out of reach there',
  category: 'foundations',
  substrates: ['3434'],
  depth: 'L1',
  paper: false,
  run() {
    return registerHolesRun(GATE_PLAN)
  },
})

const unit = (kj: readonly [number, number]): [number, number] => {
  const th = unitAngle(ringUnit(kj[0], kj[1]))

  return [Math.cos(th), Math.sin(th)]
}

// the frame checks as one boolean and its numbers
function frameGate(fr: HoleFrame): boolean {
  const c = fr.checks

  return (
    c.sectorOutside <= FRAME_TOL &&
    c.transferOutside <= FRAME_TOL &&
    c.unitary <= FRAME_TOL &&
    c.offHalf <= FRAME_TOL &&
    c.minComplement === 4 &&
    c.maxComplement === 4 &&
    c.accepted >= MOVE_ACCEPT &&
    c.rejected <= MOVE_REJECT
  )
}

// run the dense and the reduced engines side by side from one dense pair, the gap at the reads
function sideBySide(
  t: Torus,
  e: HoleEngine,
  dense: Pair,
  denseRule: SeaRule,
  reducedAngle: Float64Array | null,
  cycles: number,
  reads: readonly number[],
  signs: 'reversed' | 'same' = 'reversed',
): { gap: number; outside: number; drift: number; seconds: [number, number] } {
  const B = sectorBases()
  const spare = newPair(t)
  const start = fromDensePair(e, j => pairAt(t, dense, j))
  const mine = start.holes

  let gap = 0
  let outside = Math.abs(start.outside)
  let drift = 0
  let tDense = 0
  let tMine = 0

  for (let c = 1; c <= cycles; c++) {
    let t0 = Date.now()

    seaCycle(t, denseRule, B, dense, spare)
    tDense += Date.now() - t0
    t0 = Date.now()

    // CT1's one-sign error: beat 2 takes e^(+i phi) instead of the rule's e^(-i phi)
    holeCycle(
      e,
      signs === 'reversed'
        ? { angle: reducedAngle }
        : { angle: reducedAngle, angle2: reducedAngle ? reducedAngle.map(x => -x) : null },
      mine,
    )

    tMine += Date.now() - t0

    if (reads.includes(c)) {
      const ref = fromDensePair(e, j => pairAt(t, dense, j))

      gap = Math.max(gap, holeGap(mine, ref.holes))
      outside = Math.max(outside, Math.abs(ref.outside))
      drift = Math.max(drift, Math.abs(holeNorm(mine) - 1))
    }
  }

  return {
    gap,
    outside,
    drift,
    seconds: [tDense / 1000 / cycles, tMine / 1000 / cycles],
  }
}

export function registerHolesRun(plan: HolesPlan): Verdict {
  const started = Date.now()
  const log = (what: string): void =>
    console.error(`${what} ${Math.round((Date.now() - started) / 1000)}s`)
  const u = unit(LIGHT)
  const sAng = unitAngle(ringUnit(STRING[0], STRING[1]))
  const vAng = unitAngle(ringUnit(VERTEX[0], VERTEX[1]))
  const qS = scaled(singletProjector24(), 24)
  const qD = scaled(partnerProjector48(), 48)
  const Ps = [registerPiece(qS, u), registerPiece(qD, [u[0], -u[1]])]
  const rule: SeaRule = {
    u,
    string: -sAng,
    cap: CAP,
    contact: -2 * vAng,
    dock: null,
    member: false,
  }
  // ---------------- V1 ----------------
  const T4 = torus(plan.L)
  const T6 = torus(plan.L6)
  const fr4 = holeFrame(T4, Ps, 16)
  const fr6 = holeFrame(T6, Ps, 16)
  const V1 = frameGate(fr4) && frameGate(fr6)

  log(`V1 ${V1} L4 ${JSON.stringify(fr4.checks)} L6 ${JSON.stringify(fr6.checks)}`)

  // ---------------- V2 ----------------
  const angle4 = pairAngles(T4, -sAng, CAP, -2 * vAng)
  const angle6 = pairAngles(T6, -sAng, CAP, -2 * vAng)
  const e4 = holeEngine(fr4, 2, 0)
  const e6 = holeEngine(fr6, 2, 0)
  const mv4 = fr4.moving
  const denseStarts: [number, number][] = [
    [0, 47],
    [19, 20],
  ]
  const v2 = denseStarts.map(([a, b]) =>
    sideBySide(T4, e4, pairStart(T4, mv4, 'W', a, 'W', b), rule, angle4, plan.cycles, plan.reads),
  )

  log(`V2 L4 ${v2.map(r => `gap ${r.gap.toExponential(2)} outside ${r.outside.toExponential(2)}`).join('; ')}`)

  const v26 = sideBySide(
    T6,
    e6,
    pairStart(T6, fr6.moving, 'W', 0, 'W', 47),
    rule,
    angle6,
    plan.cycles6,
    plan.reads6,
  )

  log(`V2 L6 gap ${v26.gap.toExponential(2)} outside ${v26.outside.toExponential(2)}`)

  const V2 =
    v2.every(r => r.gap <= DENSE_TOL && r.outside <= OUTSIDE_TOL) &&
    v26.gap <= DENSE_TOL &&
    v26.outside <= OUTSIDE_TOL

  // ---------------- CT1, CT2 ----------------
  const ct1 = sideBySide(
    T4,
    e4,
    pairStart(T4, mv4, 'W', 0, 'W', 47),
    rule,
    angle4,
    plan.teethCycles,
    Array.from({ length: plan.teethCycles }, (_, i) => i + 1),
    'same',
  )
  const ct2 = sideBySide(
    T4,
    e4,
    pairStart(T4, mv4, 'W', 0, 'W', 47),
    rule,
    null,
    plan.teethCycles,
    Array.from({ length: plan.teethCycles }, (_, i) => i + 1),
  )
  const CT1 = ct1.gap > TEETH
  const CT2 = ct2.gap > TEETH

  log(`CT1 ${ct1.gap.toExponential(3)} CT2 ${ct2.gap.toExponential(3)}`)

  // ---------------- V3 ----------------
  const d0 = localPair(T4, T4.origin, 0, 8, 0)
  const dSpare = newPair(T4)
  const B = sectorBases()
  const w0 = relativeWeights(T4, d0)
  const part = fromDensePair(e4, j => pairAt(T4, d0, j))
  const r0 = reducedWeights(e4, part.holes)
  const trades: { cycle: number; dense: number; reduced: number }[] = []

  for (let c = 1; c <= plan.cycles; c++) {
    seaCycle(T4, rule, B, d0, dSpare)
    holeCycle(e4, { angle: angle4 }, part.holes)

    if (plan.reads.includes(c)) {
      const w = relativeWeights(T4, d0)
      const tot = w.reduce((s, x) => s + x, 0)
      const dense = w.reduce((s, x, j) => s + Math.abs(x - w0[j]!), 0) / tot
      const r = reducedWeights(e4, part.holes)
      // the moving part in the dense engine's units, over the dense engine's own total (the flat parts keep their weight
      // at every momentum, so only the moving part can trade)
      const reduced = r.reduce((s, x, j) => s + Math.abs(x - r0[j]!), 0) / tot

      trades.push({ cycle: c, dense, reduced })
    }
  }

  const V3 = trades.every(x => Math.abs(x.dense - x.reduced) <= TRADE_TOL)

  log(`V3 ${trades.map(x => `c${x.cycle} ${x.dense.toExponential(4)} / ${x.reduced.toExponential(4)}`).join(', ')}`)

  // ---------------- V4 ----------------
  const fr8 = holeFrame(T4, Ps, 8)
  const e3 = holeEngine(fr8, 3, 0)
  const F = fr8.fourier
  const N = F.N
  const f = fr8.fiber
  const cls = (k: readonly number[]): number =>
    F.ints.findIndex(x => x.join(',') === k.join(','))
  const golden = (seed: number): { re: Float64Array; im: Float64Array } => {
    const v = vec(f)

    for (let k = 0; k < f; k++) {
      v.re[k] = (((k + 1) * (seed + 1) * GOLDEN) % 1) - 0.5
      v.im[k] = (((k + 3) * (seed + 2) * GOLDEN * GOLDEN) % 1) - 0.5
    }

    const n = Math.sqrt(v.re.reduce((s, x, i) => s + x * x + v.im[i]! ** 2, 0))

    return { re: v.re.map(x => x / n), im: v.im.map(x => x / n) }
  }

  // (a) the masks
  const maskGaps: number[] = []

  for (const [pa, pb, lone] of [
    [0, 1, 2],
    [0, 2, 1],
    [1, 2, 0],
  ] as const) {
    const qLone = cls([1, 0, 1, 0])
    const P2 = F.neg[qLone]!
    const e2 = holeEngine(fr8, 2, P2)
    const c2 = newHoles(fr8, 2, P2)

    for (let k = 0; k < c2.re.length; k++) {
      c2.re[k] = ((k * GOLDEN) % 1) - 0.5
      c2.im[k] = ((k * GOLDEN * GOLDEN) % 1) - 0.5
    }

    const n2 = Math.sqrt(holeNorm(c2))

    for (let k = 0; k < c2.re.length; k++) {
      c2.re[k]! /= n2
      c2.im[k]! /= n2
    }

    const phi = golden(7)
    const c3 = newHoles(fr8, 3, 0)
    const block = f ** 3
    const place = (write: boolean): number => {
      let gap = 0

      for (let j = 0; j < N; j++) {
        const jb = e2.mom[j * 2 + 1]!
        const mom = [0, 0, 0]

        mom[pa] = j
        mom[pb] = jb
        mom[lone] = qLone

        const Tn = mom[0]! * N + mom[1]!

        for (let b0 = 0; b0 < f; b0++) {
          for (let b1 = 0; b1 < f; b1++) {
            for (let bl = 0; bl < f; bl++) {
              const b = [0, 0, 0]

              b[pa] = b0
              b[pb] = b1
              b[lone] = bl

              const xr = c2.re[j * f * f + b0 * f + b1]!
              const xi = c2.im[j * f * f + b0 * f + b1]!
              const k = Tn * block + (b[0]! * f + b[1]!) * f + b[2]!
              const pr = xr * phi.re[bl]! - xi * phi.im[bl]!
              const pi = xr * phi.im[bl]! + xi * phi.re[bl]!

              if (write) {
                c3.re[k] = pr
                c3.im[k] = pi
              } else {
                gap = Math.max(gap, Math.hypot(c3.re[k]! - pr, c3.im[k]! - pi))
              }
            }
          }
        }
      }

      return gap
    }

    place(true)

    const mask = [
      [false, false, false],
      [false, false, false],
      [false, false, false],
    ]

    mask[Math.min(pa, pb)]![Math.max(pa, pb)] = true

    const angle = pairAngles(T4, -sAng, CAP, -2 * vAng)

    for (let c = 1; c <= plan.maskCycles; c++) {
      holeCycle(e3, { angle, pairs: mask }, c3)
      holeCycle(e2, { angle }, c2)
      orbitalCycle(fr8, qLone, phi)
    }

    maskGaps.push(place(false))
  }

  log(`V4a masks ${maskGaps.map(x => x.toExponential(2)).join(' ')}`)

  // (b) the free rule against the Slater determinant, (c) the exchange sector under the rule
  const js = [cls([1, 0, 0, 0]), cls([0, 1, 0, 0])]

  js.push(F.sum[F.neg[js[0]!]! * N + F.neg[js[1]!]!]!)

  const orbitals = js.map(j => bandVectors(fr8, j).up[0]!)
  const freeRun = slaterStart(e3, js, orbitals)
  const ruleRun = copyHoles(freeRun)
  const evolved = orbitals.map(v => ({ re: Float64Array.from(v.re), im: Float64Array.from(v.im) }))
  const angle3 = pairAngles(T4, -sAng, CAP, -2 * vAng)

  let slaterGap = 0
  let exchangeOther = 0
  let norm3 = 0

  for (let c = 1; c <= plan.slaterCycles; c++) {
    holeCycle(e3, { angle: null }, freeRun)
    holeCycle(e3, { angle: angle3 }, ruleRun)
    js.forEach((j, i) => orbitalCycle(fr8, j, evolved[i]!))

    const ref = slaterStart(e3, js, evolved)

    slaterGap = Math.max(slaterGap, holeGap(freeRun, ref))
    norm3 = Math.max(norm3, Math.abs(holeNorm(ruleRun) - 1), Math.abs(holeNorm(freeRun) - 1))

    if (c === 1 || c === 8 || c === plan.slaterCycles) {
      exchangeOther = Math.max(exchangeOther, Math.abs(exchangeWeights(e3, ruleRun).other))
    }
  }

  log(`V4b slater ${slaterGap.toExponential(2)} V4c exchange ${exchangeOther.toExponential(2)} norm ${norm3.toExponential(2)}`)

  const V4 =
    maskGaps.every(x => x <= MASK_TOL) &&
    slaterGap <= SLATER_TOL &&
    exchangeOther <= EXCHANGE_TOL &&
    norm3 <= NORM_TOL

  const drifts = [...v2.map(r => r.drift), v26.drift, norm3]
  const I1 = drifts.every(x => x <= NORM_TOL)
  const hard = V1 && V2 && V3 && V4
  const controls = CT1 && CT2
  const status = !hard ? 'fail' : !controls || !I1 ? 'partial' : 'pass'
  const metrics: Record<string, number> = {
    V1: flag(V1),
    V2: flag(V2),
    V3: flag(V3),
    V4: flag(V4),
    CT1: flag(CT1),
    CT2: flag(CT2),
    I1: flag(I1),
    sectorOutside: Math.max(fr4.checks.sectorOutside, fr6.checks.sectorOutside),
    transferOutside: Math.max(fr4.checks.transferOutside, fr6.checks.transferOutside),
    unitary: Math.max(fr4.checks.unitary, fr6.checks.unitary),
    offHalf: Math.max(fr4.checks.offHalf, fr6.checks.offHalf),
    accepted: Math.min(fr4.checks.accepted, fr6.checks.accepted),
    rejected: Math.max(fr4.checks.rejected, fr6.checks.rejected),
    denseGapL4a: v2[0]!.gap,
    denseGapL4b: v2[1]!.gap,
    denseGapL6: v26.gap,
    denseOutside: Math.max(...v2.map(r => r.outside), v26.outside),
    teethSign: ct1.gap,
    teethFree: ct2.gap,
    tradeGap: Math.max(...trades.map(x => Math.abs(x.dense - x.reduced))),
    maskGap: Math.max(...maskGaps),
    slaterGap,
    exchangeOther,
    normDrift: Math.max(...drifts),
    amplitudesDense2: T4.sites.length * FULL,
    amplitudesReduced2: e4.frame.fourier.N * 256,
    amplitudesReduced3: N * N * f ** 3,
    secondsDenseCycleL4: v2[0]!.seconds[0],
    secondsReducedCycleL4: v2[0]!.seconds[1],
    secondsDenseCycleL6: v26.seconds[0],
    secondsReducedCycleL6: v26.seconds[1],
    seconds: (Date.now() - started) / 1000,
  }

  trades.forEach(x => {
    metrics[`traded_c${x.cycle}`] = x.dense
  })

  return verdict({
    status,
    claim: `V1 ${V1} (sector outside ${metrics.sectorOutside!.toExponential(2)}, transfer outside ${metrics.transferOutside!.toExponential(2)}, unitary ${metrics.unitary!.toExponential(2)}, between halves ${metrics.offHalf!.toExponential(2)}, 4 complements a half everywhere on L 4 and 6); V2 ${V2} (dense against reduced, L 4 over ${plan.cycles} cycles ${v2.map(r => r.gap.toExponential(2)).join(' and ')}, L 6 over ${plan.cycles6} ${v26.gap.toExponential(2)}, dense weight outside W (x) W ${metrics.denseOutside!.toExponential(2)}); V3 ${V3} (E-FND-0158's traded weight, dense / reduced: ${trades.map(x => `c${x.cycle} ${x.dense.toExponential(3)} / ${x.reduced.toExponential(3)}`).join(', ')}); V4 ${V4} (masks ${maskGaps.map(x => x.toExponential(2)).join(' ')}, free rule against its Slater determinant ${slaterGap.toExponential(2)}, antisymmetric complement ${exchangeOther.toExponential(2)}); controls CT1 ${CT1} (${ct1.gap.toExponential(3)}) CT2 ${CT2} (${ct2.gap.toExponential(3)}); instrument I1 ${I1} (${metrics.normDrift!.toExponential(2)})`,
    metrics,
    control: { CT1: flag(CT1), CT2: flag(CT2), instrument: flag(I1) },
    notes: `L1 (the reduction is algebra: the flats as spectators, the halves, the frame, the pair product) checked by L2 runs against the dense engine. Two holes: ${metrics.amplitudesReduced2} amplitudes against ${metrics.amplitudesDense2} dense at L ${plan.L}, ${metrics.secondsReducedCycleL4!.toFixed(3)} s against ${metrics.secondsDenseCycleL4!.toFixed(2)} s a cycle. Three holes in one half: ${metrics.amplitudesReduced3} amplitudes. Four holes in one half at L = 4 would need 8.6e9. ${((Date.now() - started) / 1000).toFixed(0)} s.`,
  })
}

// the reduced pair's weight at each relative momentum, in the dense engine's units (sites times the weight)
function reducedWeights(e: HoleEngine, s: Holes): Float64Array {
  const N = e.frame.fourier.N
  const block = e.frame.fiber ** 2
  const w = new Float64Array(N)

  for (let j = 0; j < N; j++) {
    let x = 0

    for (let k = j * block; k < (j + 1) * block; k++) {
      x += s.re[k]! ** 2 + s.im[k]! ** 2
    }

    w[j] = x * N
  }

  return w
}
