// Links in the signed whole (E-FRC-0223): the link's flow register and its conjugate join the vibes' grid in the
// whole, so each history carries its own light, and which vibe-link couplings keep that whole physical.
//
// THE DESIGN, derived before any run.
//   the link in the whole   A link holds its flow as an integer; mod 3 it is the center of its grid move, and a
//                           column of D trits holds it mod 2D + 1 (odd). As a register of odd dimension d it has a
//                           phase space Z_d^2: its POSITION a is the flow, its CONJUGATE b is new (the link's
//                           angle). A joint point (v, p; a, b) of a vibe (value v, conjugate p) and its link is one
//                           history, with its own flow and its own angle.
//   the flow update         |v, a> -> |v, a + v> is SUM (E-QTM-0127). Its Wigner action is the symplectic
//                           permutation (v, p, a, b) -> (v, p - b, a + v, b): every history records its own vibe,
//                           and the vibe's conjugate is kicked by the link's angle b, the back-action a classical
//                           light has no room for. SUM is Clifford: mana never moves (E-QTM-0119's theorem).
//   Gauss per history       THEOREM. If a unitary conserves a linear function G of the positions mod d as an
//                           operator, its Wigner kernel conserves G point by point: a point's position is the
//                           midpoint (x + y)/2 of a row and a column basis state, so it carries G = (G(x) + G(y))/2,
//                           and the unitary maps the (G, G') block of rho to itself. So Gauss's law, linear in the
//                           flows and the charges, holds in every history for ANY Gauss-conserving coupling,
//                           Clifford or not, PROVIDED charge and flow share one modulus. With a trit charge and a
//                           flow mod 9 the midpoint of a charge is taken mod 3 and of a flow mod 9, so a
//                           Gauss-sector state has histories off the sector (the half unit: (0 + 1)/2 is 2 mod 3
//                           but 5 mod 9).
//   the smallest coupling   A coupling at a fixed dock that keeps Gauss conserves the charge and the flow, so it is
//                           diagonal in (v, a): a phase w^(c(v, a)). Degree 2 is Clifford. The smallest
//                           non-Clifford one is degree 3, w^(v^2 a) (level 3 of the hierarchy), below the fear
//                           beat's own singlet phase (degree 4, E-QTM-0118). The swap phase (the fear beat's like
//                           law) applied to (vibe, link) is not diagonal: it trades the vibe for the flow and
//                           breaks Gauss.
//   what a history may be   THEOREM (Gross 2006, with Hudson's for odd d): a unitary moves the Wigner function by a
//                           permutation of points only if it is Clifford (affine symplectic). So a light run
//                           history by history with a NONLINEAR integer step (a kick by a^2, or a fractional kick
//                           paid by threshold counting, the shaped light's carry) is no quantum map: it sends some
//                           states to operators with a negative eigenvalue.
//   the mixed modulus       SUM of a trit vibe into a flow mod 9 conjugates the link's Z into diag(zeta9^v) (x) Z:
//                           the back-action phase is a ninth root, the qutrit T gate class, so an integer flow
//                           register makes the coupling non-Clifford with no new gate, at the price of Gauss per
//                           history.
//
// Gates, fixed before the first run:
// G1 SUM's exact integer kernel (code/rule/fear-kernel-exact arithmetic) is the permutation (v, p, a, b) ->
//    (v, p - b, a + v, b) on all 81 points, divisor 1, 0 mismatches
// G2 the classical limit: the fear-off couplings (w^0) are the identity, and on the two-dock ring (slots s_y, s_z,
//    flows f_yz, f_zy) the fear-off beat takes each of the 81 basis starts through 6 beats to one basis state whose
//    flows equal the current light's integer record mod 3: 0 mismatches (a consistency check)
// G3 a valid whole: the exact kernels of w^(v^2 a) and of the swap phase send every state of the family (144
//    stabilizer products and 64 golden-Weyl pure states) to a state (smallest eigenvalue >= -1e-12); the
//    per-history nonlinear kicks (a, b) -> (a, b + a^2) on a qutrit link and (a, b) -> (a, b + floor(a~/2)) on a
//    flow mod 9 send at least one family state to a non-state (smallest eigenvalue < -1e-6)
// G4 reversal: K(U) K(U^dagger) = div div' 1 exactly in integers for SUM, w^(v^2 a) and the swap phase
// G5 Gauss per history on the ring, 9 sector starts, 4 beats of (record, stream, coupling on each slot and the
//    link it crossed): SUM alone and SUM + w^(v^2 a) leave 0 points of nonzero weight off the sector at every
//    beat; the swap phase leaves more than 0 (and leaks weight); with flows mod 9 and trit slots, more than 0
//    points sit off the sector at the start while the weight outside the sector stays 0
// G6 magic between vibe and link: over the 144 stabilizer product starts SUM changes the whole's mana on 0, and
//    w^(v^2 a) and the swap phase each on more than 0; from the Strange vibe (|1> - |2>)/sqrt 2 and a flow-sharp
//    link, one swap-phase meeting leaves negative weight in the link's own whole, and SUM leaves none
// Reported: the Clifford levels of w^(v^2 a) and of the mixed modulus back-action diag(1, zeta9, zeta9^-1).
// Status: pass if every gate passes, partial if G1, G3, G4, G5 pass, fail otherwise.
//
// Depth L2: known quantum information (Gross, Gottesman) on the model's registers; the rule-level couplings are
// candidates, not the committed knit.

import { experiment } from '@/test/scaffold/suite'
import { verdict } from '@/test/scaffold/verdict'
import { applyKernel, cubicPhaseKernel, stabilizerLines, sumKernel, swapPhaseKernel, type Kernel } from '@/code/rule/light-register-kernels'
import { cliffordLevel, displacementOperators } from '@/code/measure/qutrit-clifford'
import { operator } from '@/code/measure/grid-weights'
import {
  applyExchange,
  applyPhase,
  applySum,
  applySwapPhase,
  balanced,
  densityFromWigner,
  densityOf,
  digitOf,
  emptyState,
  marginal,
  negativeWeight,
  normalize,
  pointPositions,
  registers,
  smallestEigenvalue,
  weightOutside,
  wigner,
  type Registers,
  type State,
} from '@/code/measure/quantum-light'

const GOLDEN = (Math.sqrt(5) - 1) / 2
const SILVER = Math.SQRT2 - 1
const RING_BEATS = 4
const RECORD_BEATS = 6
const WEYL_STATES = 64
const WEIGHT_FLOOR = 1e-12

// a golden-Weyl pure state on `size` basis states (a deterministic start, no seed)
function weylState(size: number, start: number): State {
  const s = emptyState(registers([size]))

  for (let i = 0; i < size; i++) {
    const phase = 2 * Math.PI * (((start + i) * GOLDEN) % 1)
    const radius = 0.5 + (((start + i) * SILVER) % 1)

    s.re[i] = radius * Math.cos(phase)
    s.im[i] = radius * Math.sin(phase)
  }

  return normalize(s)
}

// ---------------------------------------------------------------------------------------------------------
// the two-dock ring: registers [s_y, s_z, f_yz, f_zy]

type Coupling = 'none' | 'cubic' | 'swap'

function ringBeat(r: Registers, s: State, coupling: Coupling): State {
  // the record: each flow counts the vibe the stream copies across it
  let x = applySum(r, s, 0, 2)

  x = applySum(r, x, 1, 3)
  // the stream copies: y's vibe to z and z's to y
  x = applyExchange(r, x, 0, 1)

  // the coupling of each slot with the link it just crossed: s_y came over f_zy, s_z over f_yz
  if (coupling === 'cubic') {
    x = applyPhase(r, x, i => {
      const sy = balanced(digitOf(r, i, 0), r.dims[0]!)
      const sz = balanced(digitOf(r, i, 1), r.dims[1]!)

      return (sy * sy * digitOf(r, i, 3) + sz * sz * digitOf(r, i, 2)) / 3
    })
  } else if (coupling === 'swap') {
    x = applySwapPhase(r, x, 0, 3, 1)
    x = applySwapPhase(r, x, 1, 2, 1)
  }

  return x
}

// Gauss at the two docks of a basis index or a point's positions (flow dimension d, slots read balanced)
function gaussOf(dims: readonly number[], position: (q: number) => number): [number, number] {
  const d = dims[2]!
  const sy = balanced(position(0), dims[0]!)
  const sz = balanced(position(1), dims[1]!)
  const fyz = position(2)
  const fzy = position(3)

  return [(((fyz - fzy + sy) % d) + d) % d, (((fzy - fyz + sz) % d) + d) % d]
}

function sectorStart(r: Registers, sector: [number, number], salt: number): State {
  const s = emptyState(r)
  let k = 0

  for (let i = 0; i < r.size; i++) {
    const g = gaussOf(r.dims, q => digitOf(r, i, q))

    if (g[0] !== sector[0] || g[1] !== sector[1]) continue

    const phase = 2 * Math.PI * (((salt + k) * GOLDEN) % 1)
    const radius = 0.5 + (((salt + k) * SILVER) % 1)

    s.re[i] = radius * Math.cos(phase)
    s.im[i] = radius * Math.sin(phase)
    k++
  }

  return normalize(s)
}

// points of nonzero weight off the sector
function offSector(r: Registers, s: State, sector: [number, number], positions: Int32Array): number {
  const { w } = wigner(r, densityOf(s))
  const count = r.dims.length
  let off = 0

  for (let x = 0; x < w.length; x++) {
    if (Math.abs(w[x]!) <= WEIGHT_FLOOR) continue

    const g = gaussOf(r.dims, q => positions[x * count + q]!)

    if (g[0] !== sector[0] || g[1] !== sector[1]) off++
  }

  return off
}

function gaussRun(coupling: Coupling, flowDimension: number, beats: number, sectors: [number, number][]): { off: number; offStart: number; leak: number } {
  const r = registers([3, 3, flowDimension, flowDimension])
  const positions = pointPositions(r)
  let off = 0
  let offStart = 0
  let leak = 0

  sectors.forEach((sector, n) => {
    let s = sectorStart(r, sector, 7 * n + 1)
    const inside = (i: number): boolean => {
      const g = gaussOf(r.dims, q => digitOf(r, i, q))

      return g[0] === sector[0] && g[1] === sector[1]
    }

    offStart += offSector(r, s, sector, positions)

    for (let t = 0; t < beats; t++) {
      s = ringBeat(r, s, coupling)
      off += offSector(r, s, sector, positions)
      leak = Math.max(leak, weightOutside(s, i => inside(i)))
    }
  })

  return { off, offStart, leak }
}

// ---------------------------------------------------------------------------------------------------------

export default experiment({
  id: 'gauge/links-in-the-whole',
  code: 'E-FRC-0223',
  title:
    "links in the signed whole: each history carries its own flow and the link's conjugate angle; the flow update is a permutation that kicks the vibe by the angle, Gauss holds history by history for any Gauss-conserving coupling on one modulus, the smallest non-Clifford such coupling is w^(v^2 a), and a nonlinear per-history light leaves the state space",
  category: 'gauge',
  substrates: ['3434'],
  depth: 'L2',
  paper: false,
  run() {
    // G1: SUM's kernel
    const sum = sumKernel(1)
    let g1Mismatch = 0

    for (let y = 0; y < 81; y++) {
      const v = Math.floor(y / 27)
      const p = Math.floor(y / 9) % 3
      const a = Math.floor(y / 3) % 3
      const b = y % 3
      const image = 9 * (3 * v + ((p - b + 3) % 3)) + 3 * ((a + v) % 3) + b

      for (let x = 0; x < 81; x++) g1Mismatch += sum.kernel[x]![y] === (x === image ? sum.divisor : 0) ? 0 : 1
    }

    // G2: the fear-off ring against the integer record
    const ring = registers([3, 3, 3, 3])
    let g2Mismatch = 0

    for (let i = 0; i < 81; i++) {
      const digits = [0, 1, 2, 3].map(q => digitOf(ring, i, q))
      let s = emptyState(ring)

      s.re[i] = 1

      let sy = balanced(digits[0]!, 3)
      let sz = balanced(digits[1]!, 3)
      let fyz = digits[2]!
      let fzy = digits[3]!

      for (let t = 0; t < RECORD_BEATS; t++) {
        s = ringBeat(ring, s, 'none')
        fyz += sy
        fzy += sz
        ;[sy, sz] = [sz, sy]

        const at = [...s.re.keys()].filter(j => s.re[j]! ** 2 + s.im[j]! ** 2 > 0.5)

        if (at.length !== 1) {
          g2Mismatch++
          continue
        }

        const j = at[0]!
        const ok =
          balanced(digitOf(ring, j, 0), 3) === sy &&
          balanced(digitOf(ring, j, 1), 3) === sz &&
          digitOf(ring, j, 2) === ((fyz % 3) + 3) % 3 &&
          digitOf(ring, j, 3) === ((fzy % 3) + 3) % 3

        g2Mismatch += ok ? 0 : 1
      }
    }

    // G3: validity of the whole
    const cubic = cubicPhaseKernel(1)
    const swap = swapPhaseKernel(1)
    const two = registers([3, 3])
    const lines = stabilizerLines()
    const products = lines.flatMap(x => lines.map(y => x.flatMap(u => y.map(t => u * t))))
    const family: number[][] = [
      ...products.map(w => w.map(u => u / 9)),
      ...Array.from({ length: WEYL_STATES }, (_, n) => Array.from(wigner(two, densityOf(weylState(9, 11 * n + 3))).w)),
    ]
    let g3Least = Infinity

    for (const k of [cubic, swap]) {
      for (const w of family) {
        const out = Float64Array.from(applyKernel(k, w), x => x / k.divisor)

        g3Least = Math.min(g3Least, smallestEigenvalue(densityFromWigner(two, out)))
      }
    }

    const kickLeast = (d: number, f: (a: number) => number): number => {
      const r = registers([d])
      const starts: State[] = [
        ...Array.from({ length: d }, (_, j) => {
          const s = emptyState(r)

          s.re[j] = 1

          return s
        }),
        ...Array.from({ length: d }, (_, k) => {
          const s = emptyState(r)

          for (let j = 0; j < d; j++) {
            s.re[j] = Math.cos((2 * Math.PI * j * k) / d)
            s.im[j] = Math.sin((2 * Math.PI * j * k) / d)
          }

          return normalize(s)
        }),
        ...Array.from({ length: WEYL_STATES }, (_, n) => weylState(d, 5 * n + 2)),
      ]
      let least = Infinity

      for (const s of starts) {
        const { w } = wigner(r, densityOf(s))
        const out = new Float64Array(w.length)

        for (let a = 0; a < d; a++) for (let b = 0; b < d; b++) out[a * d + ((((b + f(a)) % d) + d) % d)] = w[a * d + b]!

        least = Math.min(least, smallestEigenvalue(densityFromWigner(r, out)))
      }

      return least
    }

    const kickSquare = kickLeast(3, a => a * a)
    const kickCarry = kickLeast(9, a => Math.floor(balanced(a, 9) / 2))

    // G4: reversal in integers
    const identityDefect = (forward: Kernel, back: Kernel): number => {
      let bad = 0

      for (let i = 0; i < 81; i++) {
        for (let j = 0; j < 81; j++) {
          let s = 0

          for (let k = 0; k < 81; k++) s += back.kernel[i]![k]! * forward.kernel[k]![j]!

          bad += s === (i === j ? forward.divisor * back.divisor : 0) ? 0 : 1
        }
      }

      return bad
    }

    const g4 =
      identityDefect(sum, sumKernel(-1)) + identityDefect(cubic, cubicPhaseKernel(-1)) + identityDefect(swap, swapPhaseKernel(2))

    // G5: Gauss per history
    const sectors: [number, number][] = [0, 1, 2].flatMap(g => [0, 1, 2].map(h => [g, h] as [number, number]))
    const gaussSum = gaussRun('none', 3, RING_BEATS, sectors)
    const gaussCubic = gaussRun('cubic', 3, RING_BEATS, sectors)
    const gaussSwap = gaussRun('swap', 3, RING_BEATS, sectors)
    const gaussMixed = gaussRun('none', 9, 1, [
      [0, 0],
      [1, 8],
      [2, 0],
    ])

    // G6: mana
    const manaChanges = (k: Kernel): number =>
      products.reduce((n, w) => {
        const out = applyKernel(k, w)

        return n + (out.reduce((s, x) => s + Math.abs(x), 0) === 9 * k.divisor ? 0 : 1)
      }, 0)

    const manaSum = manaChanges(sum)
    const manaCubic = manaChanges(cubic)
    const manaSwap = manaChanges(swap)
    const strange = emptyState(two)

    strange.re[3] = Math.SQRT1_2
    strange.re[6] = -Math.SQRT1_2

    const linkNegative = (s: State): number => negativeWeight(marginal(two, wigner(two, densityOf(s)).w, [1]).w)
    const afterSwap = linkNegative(applySwapPhase(two, strange, 0, 1, 1))
    const afterSum = linkNegative(applySum(two, strange, 0, 1))

    // reported: Clifford levels
    const displacements = displacementOperators(2)
    const cubicOperator = operator(9)

    for (let v = 0; v < 3; v++) {
      for (let a = 0; a < 3; a++) {
        const t = (2 * Math.PI * ((balanced(v, 3) ** 2 * a) % 3)) / 3

        cubicOperator.re[(3 * v + a) * 10] = Math.cos(t)
        cubicOperator.im[(3 * v + a) * 10] = Math.sin(t)
      }
    }

    const cubicLevel = cliffordLevel(cubicOperator, displacements, 3)
    const backAction = operator(3)

    for (let v = 0; v < 3; v++) {
      const t = (2 * Math.PI * balanced(v, 3)) / 9

      backAction.re[v * 4] = Math.cos(t)
      backAction.im[v * 4] = Math.sin(t)
    }

    const backActionLevel = cliffordLevel(backAction, displacementOperators(1), 3)

    const metrics: Record<string, number> = {
      sumDivisor: sum.divisor,
      g1Mismatch,
      g2Mismatch,
      g3Least,
      kickSquareLeast: kickSquare,
      kickCarryLeast: kickCarry,
      cubicDivisor: cubic.divisor,
      swapDivisor: swap.divisor,
      g4Defects: g4,
      gaussSumOffStart: gaussSum.offStart,
      gaussSumOff: gaussSum.off,
      gaussSumLeak: gaussSum.leak,
      gaussCubicOff: gaussCubic.off,
      gaussCubicLeak: gaussCubic.leak,
      gaussSwapOff: gaussSwap.off,
      gaussSwapLeak: gaussSwap.leak,
      gaussMixedOffStart: gaussMixed.offStart,
      gaussMixedOffAfter: gaussMixed.off,
      gaussMixedLeak: gaussMixed.leak,
      manaChangesSum: manaSum,
      manaChangesCubic: manaCubic,
      manaChangesSwap: manaSwap,
      linkNegativeAfterSwap: afterSwap,
      linkNegativeAfterSum: afterSum,
      cubicCliffordLevel: cubicLevel,
      mixedBackActionLevel: backActionLevel,
    }

    const gates = {
      G1: sum.divisor === 1 && g1Mismatch === 0,
      G2: g2Mismatch === 0,
      G3: g3Least >= -1e-12 && kickSquare < -1e-6 && kickCarry < -1e-6,
      G4: g4 === 0,
      G5: gaussSum.off === 0 && gaussCubic.off === 0 && gaussSwap.off > 0 && gaussSwap.leak > 0 && gaussMixed.offStart > 0 && gaussMixed.leak < 1e-20,
      G6: manaSum === 0 && manaCubic > 0 && manaSwap > 0 && afterSwap > 1e-9 && afterSum < 1e-12,
    }

    for (const [gate, ok] of Object.entries(gates)) metrics[`gate${gate}`] = ok ? 1 : 0

    const status = Object.values(gates).every(v => v) ? 'pass' : gates.G1 && gates.G3 && gates.G4 && gates.G5 ? 'partial' : 'fail'
    const e = (x: number): string => x.toExponential(2)

    return verdict({
      status,
      claim: `the flow update SUM is the permutation (v, p, a, b) -> (v, p - b, a + v, b) on all 81 joint points (${g1Mismatch} mismatches): each history records its vibe and the link's angle b kicks the vibe; fear off it is the current light (${g2Mismatch} mismatches over 81 starts x ${RECORD_BEATS} beats); Gauss holds in every history under SUM (${gaussSum.off} points off) and SUM + w^(v^2 a) (${gaussCubic.off}), fails under the swap phase on (vibe, link) (${gaussSwap.off} points off, leak ${e(gaussSwap.leak)}) and, with flows mod 9 and trit charges, in ${gaussMixed.offStart} histories of the start with the operator exact (leak ${e(gaussMixed.leak)}); w^(v^2 a) is level ${cubicLevel} and moves mana on ${manaCubic} of 144 stabilizer starts (SUM ${manaSum}, swap phase ${manaSwap}); a nonlinear per-history kick leaves the state space (smallest eigenvalue ${e(kickSquare)} for a^2, ${e(kickCarry)} for the carry), the exact kernels do not (${e(g3Least)}), and reverse exactly (${g4} defects)`,
      metrics,
      control: { kickSquareLeast: kickSquare, kickCarryLeast: kickCarry, gaussSwapOff: gaussSwap.off, manaChangesSum: manaSum },
      notes:
        'L2, candidate couplings, not the committed knit. FIRST RUN 2026-09-26 (tmp/frc0223.log, 1.1 s), PASS, no gate moved; a refactor moving the kernels to code/rule/light-register-kernels reproduced every number (tmp/frc0223-refactor.log) and added the reading gaussSumOffStart (0). SUM is the permutation (v, p, a, b) -> (v, p - b, a + v, b), divisor 1: each history records its vibe, and the link angle b kicks the vibe conjugate, the back-action a single classical light has no room for. Gauss per history: 0 of the nonzero points leave the sector over 9 sectors x 4 ring beats under SUM and under SUM + w^(v^2 a); the swap phase on (slot, link) puts 52,308 points off and leaks 0.897 of the weight; flows mod 9 with trit slots put 26,244 points off at the START while leaking 0 weight (the operator keeps Gauss, the histories do not: the half unit). w^(v^2 a) is level 3 (divisor 3) and moves mana on 81 of 144 stabilizer products (SUM 0, swap phase 132, divisor 4); one swap-phase meeting from the Strange vibe leaves the link negative weight 1/6 exactly as derived, SUM leaves none. The per-history kicks a^2 and the carry floor(a~/2) send states to operators with smallest eigenvalue -0.293 and -0.466: a light run history by history with the shaped light carry is no quantum map. The mixed-modulus back-action diag(1, zeta9, zeta9^-1) is level 3, the qutrit T class. The Gauss theorem is proved in the header; the ring counts are its check.',
    })
  },
})
