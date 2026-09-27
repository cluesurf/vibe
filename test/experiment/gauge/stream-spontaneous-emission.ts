// Spontaneous emission from a light in the signed whole (E-FRC-0224): a STAND-IN two-level emitter (level 0 the
// "1s", level 1 the "2p", level 2 unused, one qutrit of the grid) meets, each beat, the light register the
// stream copies to its dock, through the fear beat's own swap phase U = P_sym + w P_anti. The emitter and the
// register are labeled stand-ins: no rule of the model has produced this atom or chosen this register.
//
// WHY IT MUST DECAY, derived before any run. On the exchange block {|1, 0>, |0, 1>} the swap is sigma_x, so U =
// e^(i pi/3) e^(-i (pi/3) sigma_x): |1, 0> -> ((1 + w)/2) |1, 0> + ((1 - w)/2) |0, 1>, amplitudes of size 1/2 and
// sqrt 3/2, while |0, 0> is symmetric and stays. The stream brings a register that has never met the emitter
// (flow-sharp, the vacuum |0>), so each meeting is the amplitude damping channel with transfer 3/4:
//   P_2p(n) = 4^(-n) P_2p(0),  |rho_01(n)| = 2^(-n) |rho_01(0)|  (the coherence also turns by -pi/3 a meeting)
// EXACTLY, while the stream keeps bringing fresh registers: a pure 2p decays, the loss is linear in P (a slope
// ratio 0.9 / 0.5 = 1.8), and the excitation leaves as one photon spread over the registers, (3/4) 4^(-k) on the
// k-th. U commutes with H (x) 1 + 1 (x) H for any H, so the level is conserved; the total level is linear in the
// positions, so by E-FRC-0223's theorem it is conserved in every history. SWAP is Clifford and U is not, so the
// light carries the magic of the photon away.
//   the semiclassical rule  The emitter sees the register's expectation and the register the emitter's: the
//                           mean-field meeting d rho_A/dt = -i (pi/3) [rho_L, rho_A], d rho_L/dt = -i (pi/3)
//                           [rho_A, rho_L] over the meeting. From |1> and |0> the commutator vanishes: a pure 2p
//                           never decays (E-FRC-0222's failure, here by symmetry)
//   fear off                The swap phase at w^0 is the identity; the meeting is then the current light's SUM
//                           record, which never changes the emitter's populations
//   the golden rule         For a stream of registers the weak-coupling (Markov) golden rule is theta^2 per
//                           meeting, theta the exchange angle; the exact rate is -ln cos^2 theta = ln 4. With
//                           theta = pi/3 the ratio is ln 4 / (pi^2 / 9) = 1.264: the fear beat is a STRONG meeting,
//                           and a golden-rule gate at 0.8 to 1.25 is PREDICTED TO FAIL. The finer swap phases
//                           SWAP^(2/N) (a stand-in family outside Z[w], floats) have theta = pi/N and approach it
//   the box                 A ring of K docks returns the first register after K beats. The start of the decay
//                           shows at K = 1; P_2p = 1e-6 takes ln(1e6)/ln 4 = 10 meetings, so K = 10 docks, and
//                           10 Q docks if the emitter meets the stream once in Q beats
//
// Gates, fixed before the first run:
// D1 the exact exponential: over 60 meetings with fresh registers (the unbounded stream, BigInt weights), P_2p(n)
//    4^n = P_2p(0) exactly from P_2p(0) = 1, 9/10 and 1/2; the kernel changes the total level (a1 + a2 mod 3) on 0
//    of its nonzero entries
// D2 the controls: the mean-field meeting keeps P_2p of the pure 2p within 1e-15 of 1 over 60 meetings, and the
//    fear-off meeting (SUM record) keeps it exactly 1
// D3 the quantum law: the first meeting's loss from 9/10 is exactly 1.8 times its loss from 1/2
// D4 the box: a ring of K = 4 docks (the whole over the emitter and 4 registers, 59,049 integer weights) equals
//    the unbounded stream exactly for beats 1 to 4 and departs at beat 5; after 4 beats register k holds level 1
//    with chance exactly (3/4) 4^(-k); the light's joint whole (the emitter traced out) holds negative weight
//    above 1e-9 while each register alone holds none above 1e-12
// D5 the golden rule: ln 4 / theta^2, theta = asin sqrt(transfer), lies in 0.8 to 1.25 (PREDICTED TO FAIL at 1.264)
// Status: pass if every gate passes, partial if D1 to D4 pass, fail otherwise.
//
// Depth L2, STAND-IN emitter and light register: amplitude damping by a collision stream (a known construction:
// Rau 1963, Scarani et al. 2002, Ciccarello et al. 2022) on the model's own non-Clifford gate.

import { experiment } from '@/test/scaffold/suite'
import { verdict } from '@/test/scaffold/verdict'
import { levelOne, meetFresh, qubitWhole, sumKernel, swapPhaseKernel, type Kernel, type Whole } from '@/code/rule/light-register-kernels'
import { applySwapPhase, emptyState, negativeWeight, registers, type State } from '@/code/measure/quantum-light'

const MEETINGS = 60
const RING = 4
const RING_BEATS = 8
const MEAN_FIELD_STEPS = 2000
const WEAK_FAMILY = [3, 5, 7, 9, 15, 31]

// one meeting with a fresh vacuum register (weight 1 on (0, 0), (0, 1), (0, 2) at grain 3), the register traced
const meet = (k: Kernel, e: Whole): Whole => meetFresh(k, e)

// the whole of the emitter and RING registers in integer (Number) weights, exact while below 2^52
function ringRun(k: Kernel): { p: number[]; packet: number[]; lightNegative: number; registerNegative: number } {
  const count = RING + 1
  const size = 9 ** count
  let w = new Float64Array(size)
  const strideOf = (q: number): number => 9 ** (count - 1 - q)

  // the emitter |1> (weight 1 at points 3, 4, 5) and every register |0> (points 0, 1, 2), grain 3^count
  for (let i = 0; i < size; i++) {
    let ok = true

    for (let q = 0; q < count; q++) {
      const x = Math.floor(i / strideOf(q)) % 9

      ok = ok && (q === 0 ? x >= 3 && x <= 5 : x <= 2)
    }

    if (ok) w[i] = 1
  }

  let grain = 3 ** count
  const p: number[] = [1]
  const limit = 2 ** 52
  let packet: number[] = []
  let lightNegative = 0
  let registerNegative = 0

  for (let t = 0; t < RING_BEATS; t++) {
    const q = 1 + (t % RING)
    const sq = strideOf(q)
    const se = strideOf(0)
    const next = new Float64Array(size)

    for (let base = 0; base < size; base++) {
      if (Math.floor(base / se) % 9 !== 0 || Math.floor(base / sq) % 9 !== 0) continue

      for (let x1 = 0; x1 < 9; x1++) {
        for (let x2 = 0; x2 < 9; x2++) {
          const row = k.kernel[9 * x1 + x2]!
          let s = 0

          for (let y1 = 0; y1 < 9; y1++) {
            for (let y2 = 0; y2 < 9; y2++) {
              const c = row[9 * y1 + y2]!

              if (c !== 0) s += c * w[base + y1 * se + y2 * sq]!
            }
          }

          if (Math.abs(s) >= limit) throw new Error('stream-spontaneous-emission: a weight left the exact range')

          next[base + x1 * se + x2 * sq] = s
        }
      }
    }

    w = next
    grain *= k.divisor

    let one = 0

    for (let i = 0; i < size; i++) {
      const x = Math.floor(i / se) % 9

      if (x >= 3 && x <= 5) one += w[i]!
    }

    p.push(one / grain)

    if (t === RING - 1) {
      packet = Array.from({ length: RING }, (_, r) => {
        const s = strideOf(r + 1)
        let m = 0

        for (let i = 0; i < size; i++) {
          const x = Math.floor(i / s) % 9

          if (x >= 3 && x <= 5) m += w[i]!
        }

        return m / grain
      })

      // the light's joint whole: sum out the emitter
      const light = new Float64Array(9 ** RING)

      for (let i = 0; i < size; i++) light[i % 9 ** RING] = light[i % 9 ** RING]! + w[i]! / grain

      lightNegative = negativeWeight(light)

      for (let r = 0; r < RING; r++) {
        const alone = new Float64Array(9)
        const s = 9 ** (RING - 1 - r)

        for (let i = 0; i < light.length; i++) alone[Math.floor(i / s) % 9] = alone[Math.floor(i / s) % 9]! + light[i]!

        registerNegative = Math.max(registerNegative, negativeWeight(alone))
      }
    }
  }

  return { p, packet, lightNegative, registerNegative }
}

// the mean-field meeting, RK4 on (rho_A, rho_L), 3 x 3 complex, over unit time; returns rho_A
type C3 = { re: Float64Array; im: Float64Array }

function commutatorTimes(x: C3, y: C3, k: number): C3 {
  // k * (-i) [x, y]
  const out: C3 = { re: new Float64Array(9), im: new Float64Array(9) }

  for (let i = 0; i < 3; i++) {
    for (let j = 0; j < 3; j++) {
      let cr = 0
      let ci = 0

      for (let m = 0; m < 3; m++) {
        cr += x.re[3 * i + m]! * y.re[3 * m + j]! - x.im[3 * i + m]! * y.im[3 * m + j]! - (y.re[3 * i + m]! * x.re[3 * m + j]! - y.im[3 * i + m]! * x.im[3 * m + j]!)
        ci += x.re[3 * i + m]! * y.im[3 * m + j]! + x.im[3 * i + m]! * y.re[3 * m + j]! - (y.re[3 * i + m]! * x.im[3 * m + j]! + y.im[3 * i + m]! * x.re[3 * m + j]!)
      }

      out.re[3 * i + j] = k * ci
      out.im[3 * i + j] = -k * cr
    }
  }

  return out
}

const axpy = (x: C3, a: number, y: C3): C3 => ({ re: x.re.map((v, i) => v + a * y.re[i]!), im: x.im.map((v, i) => v + a * y.im[i]!) })

function meanFieldMeeting(rhoA: C3): C3 {
  let a = rhoA
  let l: C3 = { re: new Float64Array(9), im: new Float64Array(9) }

  l.re[0] = 1

  const h = 1 / MEAN_FIELD_STEPS
  const k = Math.PI / 3
  const f = (x: C3, y: C3): [C3, C3] => [commutatorTimes(y, x, k), commutatorTimes(x, y, k)]

  for (let s = 0; s < MEAN_FIELD_STEPS; s++) {
    const [a1, l1] = f(a, l)
    const [a2, l2] = f(axpy(a, h / 2, a1), axpy(l, h / 2, l1))
    const [a3, l3] = f(axpy(a, h / 2, a2), axpy(l, h / 2, l2))
    const [a4, l4] = f(axpy(a, h, a3), axpy(l, h, l3))

    a = axpy(axpy(axpy(axpy(a, h / 6, a1), h / 3, a2), h / 3, a3), h / 6, a4)
    l = axpy(axpy(axpy(axpy(l, h / 6, l1), h / 3, l2), h / 3, l3), h / 6, l4)
  }

  return a
}

function qubitDensity(p: number, c: number): C3 {
  const x: C3 = { re: new Float64Array(9), im: new Float64Array(9) }

  x.re[0] = 1 - p
  x.re[1] = c
  x.re[3] = c
  x.re[4] = p

  return x
}

// the stand-in weak family: the survival of |1> through one meeting with a fresh |0> under SWAP^(2/N), from a
// state vector (from |1> the channel keeps the emitter diagonal, so one meeting gives the per-meeting survival)
function weakSurvival(n: number): number {
  const r = registers([3, 3])
  const s: State = emptyState(r)

  s.re[3] = 1

  const out = applySwapPhase(r, s, 0, 1, 1, n)
  let p = 0

  for (let i = 0; i < 9; i++) if (Math.floor(i / 3) === 1) p += out.re[i]! ** 2 + out.im[i]! ** 2

  return p
}

export default experiment({
  id: 'gauge/stream-spontaneous-emission',
  code: 'E-FRC-0224',
  title:
    'spontaneous emission from a light in the signed whole: a STAND-IN excited emitter meeting the registers the stream copies past it, through the fear beat, decays exactly as 4^-n from a pure 2p where the semiclassical rule gives 0, and the photon leaves with the magic; the rate is not the golden rule, the meeting is strong',
  category: 'gauge',
  substrates: ['3434'],
  depth: 'L2',
  paper: false,
  run() {
    const kernel = swapPhaseKernel(1)
    const record = sumKernel(1)

    // the kernel conserves the total level in every history
    let levelChanges = 0

    for (let x = 0; x < 81; x++) {
      for (let y = 0; y < 81; y++) {
        if (kernel.kernel[x]![y] === 0) continue

        const before = (Math.floor(Math.floor(y / 9) / 3) + Math.floor((y % 9) / 3)) % 3
        const after = (Math.floor(Math.floor(x / 9) / 3) + Math.floor((x % 9) / 3)) % 3

        levelChanges += before === after ? 0 : 1
      }
    }

    // D1: the exact exponential, and D3
    const starts: [number, number, number][] = [
      [1, 0, 1],
      [9, 3, 10],
      [1, 1, 2],
    ]
    let exponentialMismatch = 0
    const firstLoss: number[] = []
    const series: number[][] = []

    for (const [pn, cn, den] of starts) {
      let e = qubitWhole(pn, cn, den)
      const p0 = levelOne(e.w)
      const g0 = e.grain
      const values: number[] = [Number(p0) / Number(g0)]

      for (let n = 1; n <= MEETINGS; n++) {
        e = meet(kernel, e)
        exponentialMismatch += levelOne(e.w) * 4n ** BigInt(n) * g0 === p0 * e.grain ? 0 : 1
        values.push(Number((levelOne(e.w) * 10n ** 18n) / e.grain) / 1e18)
      }

      series.push(values)
      firstLoss.push(values[0]! - values[1]!)
    }

    // D3 exactly: loss = (3/4) P(0), so the ratio is 9/10 over 1/2
    const lossRatio = firstLoss[1]! / firstLoss[2]!
    const lossExact = (() => {
      const a = meet(kernel, qubitWhole(9, 3, 10))
      const b = meet(kernel, qubitWhole(1, 1, 2))
      const pa0 = qubitWhole(9, 3, 10)
      const pb0 = qubitWhole(1, 1, 2)
      // loss_a = P_a0 - P_a1, as fractions; test loss_a * 5 = loss_b * 9
      const la = { n: levelOne(pa0.w) * a.grain - levelOne(a.w) * pa0.grain, d: pa0.grain * a.grain }
      const lb = { n: levelOne(pb0.w) * b.grain - levelOne(b.w) * pb0.grain, d: pb0.grain * b.grain }

      return la.n * lb.d * 5n === lb.n * la.d * 9n
    })()

    // D2: controls
    let meanFieldDeparture = 0
    let rhoA = qubitDensity(1, 0)

    for (let n = 0; n < MEETINGS; n++) {
      rhoA = meanFieldMeeting(rhoA)
      meanFieldDeparture = Math.max(meanFieldDeparture, Math.abs(1 - rhoA.re[4]!))
    }

    const meanFieldHalf = meanFieldMeeting(qubitDensity(0.5, 0.5))
    const meanFieldNinety = meanFieldMeeting(qubitDensity(0.9, 0.3))
    const meanFieldRatio = (0.9 - meanFieldNinety.re[4]!) / (0.5 - meanFieldHalf.re[4]!)
    let fearOff = qubitWhole(1, 0, 1)
    let fearOffMismatch = 0

    for (let n = 1; n <= MEETINGS; n++) {
      fearOff = meet(record, fearOff)
      fearOffMismatch += levelOne(fearOff.w) === fearOff.grain ? 0 : 1
    }

    // D4: the ring
    const ring = ringRun(kernel)
    const stream = series[0]!
    let ringAgree = 0

    // the ring's P is a ratio of exact integers, and 4^-t is a float exactly
    for (let t = 1; t <= RING; t++) ringAgree += ring.p[t] === 4 ** -t ? 1 : 0

    const ringDeparts = Math.abs(ring.p[RING + 1]! - 4 ** -(RING + 1))
    let packetMismatch = 0

    ring.packet.forEach((m, k) => (packetMismatch += m === 0.75 * 4 ** -k ? 0 : 1))

    // D5: the golden rule
    const transfer = 1 - stream[1]!
    const theta = Math.asin(Math.sqrt(transfer))
    const rate = -Math.log(stream[1]!)
    const goldenRatio = rate / (theta * theta)
    const weak = WEAK_FAMILY.map(n => {
      const survival = weakSurvival(n)

      return { n, ratio: -Math.log(survival) / (Math.PI / n) ** 2, survival }
    })

    const metrics: Record<string, number> = {
      kernelDivisor: kernel.divisor,
      levelChanges,
      exponentialMismatch,
      p1: stream[1]!,
      p10: stream[10]!,
      p20: stream[20]!,
      lossRatio,
      lossExact: lossExact ? 1 : 0,
      meanFieldDeparture,
      meanFieldRatio,
      meanFieldHalfLoss: 0.5 - meanFieldHalf.re[4]!,
      fearOffMismatch,
      ringAgree,
      ringDeparts,
      ringP5: ring.p[RING + 1]!,
      streamP5: stream[RING + 1]!,
      ringP8: ring.p[RING_BEATS]!,
      packetMismatch,
      lightNegative: ring.lightNegative,
      registerNegative: ring.registerNegative,
      transfer,
      theta,
      rate,
      goldenRatio,
      boxForMillionth: Math.log(1e6) / Math.log(4),
    }

    weak.forEach(x => {
      metrics[`weakRatioN${x.n}`] = x.ratio
    })

    const gates = {
      D1: exponentialMismatch === 0 && levelChanges === 0,
      D2: meanFieldDeparture <= 1e-15 && fearOffMismatch === 0,
      D3: lossExact,
      D4: ringAgree === RING && ringDeparts > 1e-12 && packetMismatch === 0 && ring.lightNegative > 1e-9 && ring.registerNegative <= 1e-12,
      D5: goldenRatio >= 0.8 && goldenRatio <= 1.25,
    }

    for (const [gate, ok] of Object.entries(gates)) metrics[`gate${gate}`] = ok ? 1 : 0

    const status = Object.values(gates).every(v => v) ? 'pass' : gates.D1 && gates.D2 && gates.D3 && gates.D4 ? 'partial' : 'fail'
    const e = (x: number): string => x.toExponential(3)

    return verdict({
      status,
      claim: `a STAND-IN pure 2p meeting a fresh light register each beat through the fear beat's swap phase decays as P_2p = 4^-n exactly over ${MEETINGS} meetings (${exponentialMismatch} mismatches, integer weights), from 9/10 and 1/2 as P(0) 4^-n, the first loss ratio 1.8 exactly (a quantum exponential, where the mean-field rule gives ${meanFieldRatio.toFixed(3)}); the mean-field rule holds the pure 2p to ${e(meanFieldDeparture)} and fear off holds it exactly; the total level is conserved in every history (${levelChanges} kernel entries change it); a ring of ${RING} docks agrees for ${ringAgree} beats and departs by ${e(ringDeparts)} when its first register returns, the photon sits (3/4) 4^-k on register k (${packetMismatch} mismatches), and the light's joint whole holds negative weight ${e(ring.lightNegative)} (each register alone ${e(ring.registerNegative)}); the rate ln 4 per meeting is ${goldenRatio.toFixed(3)} of the golden rule theta^2 = (pi/3)^2: the meeting is strong (SWAP^(2/N): ${weak.map(x => `${x.n}: ${x.ratio.toFixed(3)}`).join(', ')})`,
      metrics,
      control: { meanFieldDeparture, fearOffMismatch, meanFieldRatio },
      notes:
        "L2, STAND-IN emitter and register. FIRST RUN 2026-09-26 (tmp/frc0224.log, 1.0 s), PARTIAL as predicted, no gate moved; a refactor to code/rule/light-register-kernels reproduced every number (tmp/frc0224-refactor.log; the reading p60, which printed 0 through a 1e-18 fixed-point read, was replaced by p20). D1: P_2p(n) 4^n = P_2p(0) with 0 mismatches over 60 meetings from 1, 9/10, 1/2 (BigInt weights, kernel divisor 4), and the kernel changes the total level on 0 entries. D2: the mean-field meeting holds the pure 2p at exactly 1 (the commutator of |0><0| and |1><1| vanishes), fear off (the SUM record) holds it exactly. D3: first loss from 9/10 over that from 1/2 is 9/5 exactly; the mean-field rule gives 0.418 (P (1 - P) would give 0.36). D4: the ring of 4 docks equals 4^-t for t = 1 to 4, then at t = 5 its first register (holding 3/4) returns and P_2p jumps to 0.6104 against 4^-5; the packet is (3/4) 4^-k on register k, 0 mismatches; the light's joint whole holds negative weight 0.547, each register alone 3e-17: the photon's magic is in its spread over registers, a W-like state. D5 FAILS as predicted: ln 4 = 1.386 per meeting is 1.264 of the golden rule (pi/3)^2 = 1.097; SWAP^(2/N) stand-ins give 1.074, 1.035, 1.021, 1.007, 1.002 at N = 5, 7, 9, 15, 31. The fear beat's meeting is strong (transfer 3/4), so the decay is an exact exponential at the resummed rate, not the golden rule's weak limit; a golden-rule rate needs a finer phase ring than Z[w]. Box: the start shows at K = 1; P_2p = 1e-6 needs 10 meetings, so K = 10 docks (10 Q with one meeting in Q beats). WHAT THIS IS NOT: the stand-in hydrogen of E-FRC-0222 radiating into the husk light. The light register here is a streamed register the meeting may rewrite, which Gauss forbids for a flow register (E-FRC-0223 G5, E-FRC-0226 K1).",
    })
  },
})
