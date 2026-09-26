// What a quantum light costs the substrate (E-FRC-0226): the state it adds per link and per history, whether a
// link stays a relation between vibes, the grain the signed whole pays, and the obstruction that decides where a
// quantum light may live.
//
// DERIVED before any run.
//   the angle is storage    The flow update SUM moves a joint point (v, p, a, b) to (v, p - b, a + v, b)
//                           (E-FRC-0223): the flow a is the record of the vibes the stream copied across (a
//                           relation between vibes), but the angle b is written by no flow update. In the vacuum
//                           every vibe history carries all three angles. So a per-history light needs one more
//                           register per link, the conjugate of the flow: the link holds storage of its own, which
//                           the user's rule flags. The classical light already keeps an angle column per link;
//                           the quantum light can reuse it only if that column steps by an affine symplectic map
//                           (E-FRC-0223 G3: the carry step is no quantum map).
//   THE UNITAL OBSTRUCTION  A meeting at a fixed dock that keeps Gauss conserves the charge and the flow, so it is
//                           diagonal in (v, a) (E-FRC-0223). With a register the stream brings fresh, the vibe's
//                           channel is rho -> sum_a P(a) D_a rho D_a^dagger with D_a diagonal unitaries: a mixture
//                           of unitaries, so UNITAL (it keeps 1/3 fixed) and it never raises purity. Spontaneous
//                           emission takes a pure 2p to a pure 1s and a mixed vibe toward the vacuum: it is not
//                           unital. So NO Gauss-safe meeting with fresh light registers can make a vibe decay.
//                           E-FRC-0224's decay needs the swap phase, which breaks Gauss on a flow register
//                           (E-FRC-0223 G5), so its light register must be one Gauss does not see (a streamed
//                           vibe's role, or a loop's circulation), not the flow. A flow light can make a vibe
//                           decay only through memory: the same register meeting again after the light's own
//                           step has turned flow into angle (the E x coupling of QED, where the atom's hop moves
//                           the charge and the light's leapfrog carries the correlation back)
//   the grain               The swap phase's kernel has divisor 4 (fear-kernel-exact), so the whole's integer
//                           grain grows by 2 bits a meeting; w^(v^2 a) has divisor 3
//
// Gates, fixed before the first run:
// K1 the unital obstruction: for SUM and w^(v^2 a) and every fresh register start (12 stabilizer states, exact
//    integers; 16 golden-Weyl pure states, floats), the maximally mixed vibe leaves the meeting maximally mixed
//    (0 exceptions, exact or to 1e-12), and over 12 stabilizer and 32 Weyl vibe starts no meeting raises the
//    vibe's purity by more than 1e-12 (0 exceptions); the swap phase fails both (more than 0 exceptions each)
//    DISCLOSED, changed after the first run: the vibe starts of the purity clause now also hold the 44 half-mixed
//    starts (rho + 1/3)/2. The first run used pure starts only, whose purity cannot rise, so the clause was
//    vacuous for every coupling and its swap-phase control read 0; the first run FAILED K1 on that clause.
// K2 who writes the angle: SUM's kernel keeps the angle b of all 81 points (0 changes); w^(v^2 a)'s kernel has
//    nonzero entries that change b (more than 0): the vibe's value writes the angle only through the non-Clifford
//    coupling
// K3 the grain: from the pure 2p through 60 swap-phase meetings with fresh vacuum registers, the reduced grain
//    multiplies by exactly 4 each meeting after the first (0 exceptions)
// Reported: the trit budget per husk link per history (flow and conjugate registers mod 2D + 1 in balanced
// ternary, 2 ceil(log3(2D + 1)), against ceil(log3(2D + 1)) for the flow alone), the whole's size for E-FRC-0224's
// ring and for E-FRC-0221's box, and whether memory lifts the obstruction: the maximally mixed vibe meeting ONE
// register again and again under w^(v^2 a), with the register turned by the Fourier Clifford (flow to angle)
// between meetings (its largest purity over 24 beats). DISCLOSED: the first two runs also turned the vibe's own
// charge register by F, which changes the charge with no crossing and so breaks Gauss (purity 121/243 = 0.4979);
// that reading is kept, labeled, beside the Gauss-safe one (register turned only). A reading, not a gate.
// Status: pass if every gate passes, fail otherwise.
//
// Depth L2: known channel theory (a mixture of unitaries is unital; unital channels are purity-nonincreasing,
// Uhlmann) applied to the model's candidate couplings; the budget is bookkeeping.

import { experiment } from '@/test/scaffold/suite'
import { verdict } from '@/test/scaffold/verdict'
import { applyKernel, cubicPhaseKernel, levelOne, meetFresh, qubitWhole, stabilizerLines, sumKernel, swapPhaseKernel, type Kernel } from '@/code/rule/light-register-kernels'
import { densityOf, emptyState, normalize, registers, wigner, type State } from '@/code/measure/quantum-light'

const GOLDEN = (Math.sqrt(5) - 1) / 2
const SILVER = Math.SQRT2 - 1
const WEYL_REGISTERS = 16
const WEYL_VIBES = 32
const MEETINGS = 60
const MEMORY_BEATS = 24
const DEPTHS = [4, 8, 16, 32, 64]
const HUSK_SIDE = 32

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

// the vibe's whole after one meeting with a register: sum over the register's points of K (vibe (x) register)
function vibeAfter(k: Kernel, vibe: readonly number[], register: readonly number[]): number[] {
  const joint = vibe.flatMap(u => register.map(t => u * t))
  const out = applyKernel(k, joint)

  return Array.from({ length: 9 }, (_, x1) => out.slice(9 * x1, 9 * x1 + 9).reduce((s, x) => s + x, 0))
}

// purity Tr rho^2 = 3 sum W^2 for a qutrit whole W (weights over `grain`)
const purity = (w: readonly number[], grain: number): number => 3 * w.reduce((s, x) => s + (x / grain) ** 2, 0)

// ---------------------------------------------------------------------------------------------------------
// the memory reading: 9 x 9 density matrices, unitaries as dense complex 9 x 9

type Matrix = { re: Float64Array; im: Float64Array }

function multiply(a: Matrix, b: Matrix, n: number): Matrix {
  const out: Matrix = { re: new Float64Array(n * n), im: new Float64Array(n * n) }

  for (let i = 0; i < n; i++) {
    for (let k = 0; k < n; k++) {
      const ar = a.re[i * n + k]!
      const ai = a.im[i * n + k]!

      if (ar === 0 && ai === 0) continue

      for (let j = 0; j < n; j++) {
        out.re[i * n + j] = out.re[i * n + j]! + ar * b.re[k * n + j]! - ai * b.im[k * n + j]!
        out.im[i * n + j] = out.im[i * n + j]! + ar * b.im[k * n + j]! + ai * b.re[k * n + j]!
      }
    }
  }

  return out
}

const dagger = (a: Matrix, n: number): Matrix => {
  const out: Matrix = { re: new Float64Array(n * n), im: new Float64Array(n * n) }

  for (let i = 0; i < n; i++) {
    for (let j = 0; j < n; j++) {
      out.re[i * n + j] = a.re[j * n + i]!
      out.im[i * n + j] = -a.im[j * n + i]!
    }
  }

  return out
}

// `turnVibe`: whether the vibe's register is also turned by F between meetings. A turn of the vibe's CHARGE
// register changes the charge with no crossing, so it breaks Gauss; the honest (Gauss-safe) reading turns only the
// light register
function memoryReading(turnVibe: boolean): number {
  // U_meet = w^(v^2 a) (index 3 v + a); U_turn = F (x) F, F|j> = sum_k w^(jk) |k> / sqrt 3
  const meet: Matrix = { re: new Float64Array(81), im: new Float64Array(81) }

  for (let v = 0; v < 3; v++) {
    for (let a = 0; a < 3; a++) {
      const t = (2 * Math.PI * ((v * v * a) % 3)) / 3

      meet.re[(3 * v + a) * 10] = Math.cos(t)
      meet.im[(3 * v + a) * 10] = Math.sin(t)
    }
  }

  const turn: Matrix = { re: new Float64Array(81), im: new Float64Array(81) }

  for (let i = 0; i < 9; i++) {
    for (let j = 0; j < 9; j++) {
      const vi = Math.floor(i / 3)
      const vj = Math.floor(j / 3)
      const t = (2 * Math.PI * ((turnVibe ? vi * vj : 0) + (i % 3) * (j % 3))) / 3
      const scale = turnVibe ? 1 / 3 : vi === vj ? 1 / Math.sqrt(3) : 0

      turn.re[i * 9 + j] = scale * Math.cos(t)
      turn.im[i * 9 + j] = scale * Math.sin(t)
    }
  }

  const beat = multiply(turn, meet, 9)
  const beatDagger = dagger(beat, 9)
  // rho = (1/3) 1 (x) |0><0|
  let rho: Matrix = { re: new Float64Array(81), im: new Float64Array(81) }

  for (let v = 0; v < 3; v++) rho.re[(3 * v) * 10] = 1 / 3

  let best = 1 / 3

  for (let t = 0; t < MEMORY_BEATS; t++) {
    rho = multiply(multiply(beat, rho, 9), beatDagger, 9)

    // the vibe's reduced purity
    let p = 0

    for (let v = 0; v < 3; v++) {
      for (let u = 0; u < 3; u++) {
        let re = 0
        let im = 0

        for (let a = 0; a < 3; a++) {
          re += rho.re[(3 * v + a) * 9 + 3 * u + a]!
          im += rho.im[(3 * v + a) * 9 + 3 * u + a]!
        }

        p += re * re + im * im
      }
    }

    best = Math.max(best, p)
  }

  return best
}

export default experiment({
  id: 'gauge/quantum-light-cost',
  code: 'E-FRC-0226',
  title:
    "what a quantum light costs: a per-history light needs the flow's conjugate angle on every link, written by no flow update (independent storage), and a Gauss-safe meeting with fresh light registers is a unital channel on the vibe, so it can never make a vibe decay",
  category: 'gauge',
  substrates: ['3434'],
  depth: 'L2',
  paper: false,
  run() {
    const kernels: Record<string, Kernel> = { sum: sumKernel(1), cubic: cubicPhaseKernel(1), swap: swapPhaseKernel(1) }
    const lines = stabilizerLines()
    const one = registers([3])
    const weylRegisters = Array.from({ length: WEYL_REGISTERS }, (_, n) => Array.from(wigner(one, densityOf(weylState(3, 13 * n + 5))).w))
    const weylVibes = Array.from({ length: WEYL_VIBES }, (_, n) => Array.from(wigner(one, densityOf(weylState(3, 17 * n + 2))).w))
    const mixed = new Array<number>(9).fill(1)
    const counts: Record<string, { mixedExact: number; mixedFloat: number; purityRise: number }> = {}

    for (const [name, k] of Object.entries(kernels)) {
      let mixedExact = 0
      let mixedFloat = 0
      let purityRise = 0

      // the maximally mixed vibe (weight 1 at grain 9) with exact stabilizer registers (grain 3)
      for (const r of lines) {
        const out = vibeAfter(k, mixed, r)

        mixedExact += out.every(x => x === out[0]) ? 0 : 1
      }

      for (const r of weylRegisters) {
        const out = vibeAfter(k, mixed.map(x => x / 9), r).map(x => x / k.divisor)

        mixedFloat += out.every(x => Math.abs(x - 1 / 9) <= 1e-12) ? 0 : 1
      }

      // purity never rises: vibe starts (stabilizer at grain 3, Weyl as floats) against every register start
      // SECOND RUN (disclosed): the half-mixed starts (rho + 1/3)/2 are added; the first run had pure starts only,
      // whose purity cannot rise, so the clause could not fail for any coupling
      const vibes: [number[], number][] = [
        ...lines.map(w => [w, 3] as [number[], number]),
        ...weylVibes.map(w => [w, 1] as [number[], number]),
        ...lines.map(w => [w.map(x => 3 * x + 1), 18] as [number[], number]),
        ...weylVibes.map(w => [w.map(x => (x + 1 / 9) / 2), 1] as [number[], number]),
      ]
      const registerStarts: [number[], number][] = [...lines.map(w => [w, 3] as [number[], number]), ...weylRegisters.map(w => [w, 1] as [number[], number])]

      for (const [v, vg] of vibes) {
        const before = purity(v, vg)

        for (const [r, rg] of registerStarts) {
          const after = purity(vibeAfter(k, v, r), vg * rg * k.divisor)

          purityRise += after > before + 1e-12 ? 1 : 0
        }
      }

      counts[name] = { mixedExact, mixedFloat, purityRise }
    }

    // K2: who writes the angle (the conjugate b of the second register, point x2 = 3 a + b)
    const angleChanges = (k: Kernel): number => {
      let n = 0

      for (let x = 0; x < 81; x++) for (let y = 0; y < 81; y++) if (k.kernel[x]![y] !== 0 && x % 3 !== y % 3) n++

      return n
    }

    const angleSum = angleChanges(kernels.sum!)
    const angleCubic = angleChanges(kernels.cubic!)
    const angleSwap = angleChanges(kernels.swap!)

    // K3: the grain
    let e = qubitWhole(1, 0, 1)
    let grainExceptions = 0
    const grains: bigint[] = [e.grain]

    for (let n = 1; n <= MEETINGS; n++) {
      e = meetFresh(kernels.swap!, e)
      grains.push(e.grain)

      if (n >= 2 && e.grain !== grains[n - 1]! * 4n) grainExceptions++
    }

    const survival = Number(levelOne(e.w)) / Number(e.grain)
    let cubicWhole = qubitWhole(1, 1, 2)
    const cubicGrains: number[] = []

    for (let n = 1; n <= 12; n++) {
      cubicWhole = meetFresh(kernels.cubic!, cubicWhole, [0, 0, 0, 1, 1, 1, 0, 0, 0])
      cubicGrains.push(Number(cubicWhole.grain))
    }

    // reported: the budget
    const metrics: Record<string, number> = {}
    const digits = (d: number): number => Math.ceil(Math.log(2 * d + 1) / Math.log(3) - 1e-12)

    for (const d of DEPTHS) {
      metrics[`tritsPerLinkFlowD${d}`] = digits(d)
      metrics[`tritsPerLinkQuantumD${d}`] = 2 * digits(d)
      metrics[`pointsPerLinkD${d}`] = (2 * d + 1) ** 2
    }

    const huskLinks = 9 * HUSK_SIDE ** 3

    metrics.huskLinks = huskLinks
    metrics.huskWholeLog10PointsD16 = 2 * huskLinks * Math.log10(33)
    metrics.ringWholePoints = 9 ** 5

    const memory = memoryReading(false)
    const memoryVibeTurned = memoryReading(true)

    Object.assign(metrics, {
      mixedExactSum: counts.sum!.mixedExact,
      mixedFloatSum: counts.sum!.mixedFloat,
      purityRiseSum: counts.sum!.purityRise,
      mixedExactCubic: counts.cubic!.mixedExact,
      mixedFloatCubic: counts.cubic!.mixedFloat,
      purityRiseCubic: counts.cubic!.purityRise,
      mixedExactSwap: counts.swap!.mixedExact,
      mixedFloatSwap: counts.swap!.mixedFloat,
      purityRiseSwap: counts.swap!.purityRise,
      angleChangesSum: angleSum,
      angleChangesCubic: angleCubic,
      angleChangesSwap: angleSwap,
      grainExceptions,
      grainBitsAfter60: grains[MEETINGS]!.toString(2).length - 1,
      survivalAfter60: survival,
      cubicGrainAfter12: cubicGrains[11]!,
      memoryLargestPurity: memory,
      memoryVibeTurnedLargestPurity: memoryVibeTurned,
    })

    const gates = {
      K1:
        counts.sum!.mixedExact === 0 &&
        counts.sum!.mixedFloat === 0 &&
        counts.sum!.purityRise === 0 &&
        counts.cubic!.mixedExact === 0 &&
        counts.cubic!.mixedFloat === 0 &&
        counts.cubic!.purityRise === 0 &&
        counts.swap!.mixedExact + counts.swap!.mixedFloat > 0 &&
        counts.swap!.purityRise > 0,
      K2: angleSum === 0 && angleCubic > 0,
      K3: grainExceptions === 0,
    }

    for (const [gate, ok] of Object.entries(gates)) metrics[`gate${gate}`] = ok ? 1 : 0

    const status = Object.values(gates).every(v => v) ? 'pass' : 'fail'

    return verdict({
      status,
      claim: `with fresh light registers the Gauss-safe meetings are unital on the vibe: the maximally mixed vibe stays maximally mixed (SUM ${counts.sum!.mixedExact + counts.sum!.mixedFloat}, w^(v^2 a) ${counts.cubic!.mixedExact + counts.cubic!.mixedFloat} exceptions over ${lines.length + WEYL_REGISTERS} registers) and no vibe's purity rises (${counts.sum!.purityRise}, ${counts.cubic!.purityRise} of ${2 * (lines.length + WEYL_VIBES) * (lines.length + WEYL_REGISTERS)}), so neither can make a vibe decay, while the swap phase can (${counts.swap!.mixedExact + counts.swap!.mixedFloat} and ${counts.swap!.purityRise}); the flow update writes the link's angle on ${angleSum} of 81 points and w^(v^2 a) on ${angleCubic} kernel entries, so the angle is storage no flow update writes; the grain grows by exactly 2 bits a swap-phase meeting (${grainExceptions} exceptions); a per-history link costs ${2 * digits(16)} trits at D = 16 against ${digits(16)} for the flow alone; one register met again and again, turned flow to angle between meetings, leaves the charge's purity at ${memory.toFixed(4)} (1/3: memory does not lift the obstruction at a fixed dock, the charge is conserved), and ${memoryVibeTurned.toFixed(4)} only if the vibe's charge register is turned too, which breaks Gauss`,
      metrics,
      control: { purityRiseSwap: counts.swap!.purityRise, angleChangesSum: angleSum },
      notes:
        "L2. FIRST RUN 2026-09-26 (tmp/frc0226.log), FAIL on K1's purity clause: every vibe start was pure, so no purity could rise and the swap-phase control read 0 (a vacuous clause, a design error in the gate). SECOND RUN (tmp/frc0226-second.log), PASS, with 44 half-mixed starts added, DISCLOSED in the header. THIRD RUN (tmp/frc0226-third.log), PASS, no gate changed: the memory reading, which in the first two runs also turned the vibe's charge register (breaking Gauss, purity 121/243), is split into that labeled reading and the Gauss-safe one (the register turned only), which stays at 1/3 exactly. K1: SUM and w^(v^2 a) keep the maximally mixed vibe exactly maximally mixed for all 28 fresh registers and raise no purity over 2,464 pairs; the swap phase moves it on 28 of 28 and raises purity on 1,232. K2: SUM writes the angle on 0 of 81 points; w^(v^2 a) on 405 kernel entries; the swap phase on 378. K3: the grain multiplies by 4 each meeting (121 bits after 60 meetings, survival 4^-60 = 7.5e-37). Budget: flow and conjugate mod 2D + 1 take 2 ceil(log3(2D + 1)) trits per link per history, 8 at D = 16 against 4 for the flow alone (4, 6, 8, 8, 10 at D = 4, 8, 16, 32, 64); (2D + 1)^2 = 1,089 points per link at D = 16; E-FRC-0221's box (294,912 husk links) would need a whole of 10^895,656 points; E-FRC-0224's ring 59,049.",
    })
  },
})
