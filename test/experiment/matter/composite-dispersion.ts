// THE BOUND PAIR'S DISPERSION ALONG THE WHOLE CURVE, AND ITS MOVING CLOCK (E-MTR-0029, OPEN-MOT-01). The light
// register pair's inertia has been read only as a K^2 coefficient, at K 0.04 and 0.02 (E-SPN-0200 to E-SPN-0211). A
// relativistic bound state does more: its energy follows E(K) = sqrt(M^2 + c^2 K^2) at every K, not only at small K,
// and its internal energy carries inertia, so an internal clock (the beat between two of its levels) runs slower by
// the same Lorentz factor its centre of mass shows, 1 / gamma = M / E(K): internal and centre-of-mass motion add in
// quadrature, (clock rate)^2 + (v / c)^2 = 1. A rigid lattice composite does neither: two members each at K / 2 with a
// fixed binding have E(K) = 2 E_member(K / 2) - E_b, and the beat between two levels then does not change with K. This
// file boosts the a_B 8 pair with the contact well removed (E-SPN-0206's clean level, R 1.2735) to K up to 1.6.
//
// THE RUN. code/measure/pair-boost readBoost at K 0.04, 0.4, 0.8, 1.2, 1.6 along the axis: readMotion's sector, count
// (code/measure/contact-core softenContact) and start, with the window moved by the lone member's threshold rise. The
// K = 0 read is E-SPN-0206's (tmp/spn-core-soften-a8.json), whose base lines give the ground E0 1.676673975509106
// (overlap 0.638) and the 2s-like level 1.7026982168978484 (overlap 0.256), and whose K 0.04 and 0.02 reads give the
// ground's curvature a 0.11708484206118808, so c^2 = 2 a E0 = 0.392626 and R 1.27348. Levels are named by overlap rank.
//
// THE LONE MEMBER, THE CONTROL (computed before the run, tmp/mtr-boost-probe.log). The member's own band at this mass
// (M0 0.854 a cycle) is not relativistic beyond K^2: against sqrt(M0^2 + c_m^2 k^2) with c_m^2 from its own curvature
// its quartic is 2.81, 2.80, 2.78, 2.77 times relativity's at k = K / 2 = 0.2, 0.4, 0.6, 0.8 (relativity fraction rho,
// 1 relativistic, 0 Galilean). A rigid composite carries its members' rho exactly (the K^4 terms of 2 E_member(K / 2)
// over the pair's own relativistic quartic give rho_member). So D below is expected to fail as the members' own lattice
// band, which E-MTR-0024 showed turns Lorentzian only at a light mass, and L is the gate that reads the pair against it.
//
// GATES, fixed before the run:
//   W  THE WITNESS: the ground at K 0.04 reads E-SPN-0206's recorded 1.6768597364704667 within 1e-8
//   I  CLEAN LEVELS at every K: the ground's overlap at least 0.2 and twice the next line's, the 2s-like line's at
//      least twice the third's, all lines genuine (|u| within 1e-6 of 1)
//   D  RELATIVISTIC ALONG THE CURVE: rho_pair(K) = (E_gal - E) / (E_gal - E_rel) in [0.8, 1.2] at K 0.8, 1.2 and 1.6
//      (the Galilean and relativistic forms from E0 and a differ there by 1.6e-3 to 2.3e-2)
//   L  THE MEMBERS' BAND: |rho_pair(K) - rho_member(K / 2)| <= 0.5 at K 0.8, 1.2 and 1.6
//   Q  QUADRATURE: the clock's dilation share delta(K) = (1 - x) / (1 - E0 / E(K)), x = (E_2(K) - E(K)) / (E_2(0) -
//      E0), in [0.8, 1.2] at K 0.8, 1.2 and 1.6 (1 is relativity, 0 the rigid composite); Q_loose: in [0.5, 1.5]
//   Verdict: pass if W, I, D and Q; partial if W, I, (D or L) and Q_loose; fail otherwise.
// PREDICTED: the ground at E_rel 1.695304, 1.750005, 1.837557, 1.953550 (K 0.4 to 1.6) if relativistic, E_gal
// 1.695408, 1.751608, 1.845276, 1.976411 if Galilean, and with the members' rho near 1.6951, 1.7471, 1.8237, 1.9124: D
// fails and L holds. The clock: the 2s-like level's own small-K curvature (0.115281, from the same recorded reads, R
// 1.2736) gives delta 0.993 at small K, so Q is expected to hold if the curvature difference persists along the curve.
// Expected verdict: partial. Runtime estimate before the run: one K read took 2,800 s at 6 threads with three such
// processes sharing the machine (tmp/spn-mass-m0427.log), so five reads at 6 threads take about 2 to 4 hours.
//
// FIRST RUN (below, after the run).
//
// Depth L2 (a two-body quantum walk on the husk quotient, exact in its moving block; the softened count is a control,
// the lone member's band the comparison). DETERMINISM: no random numbers; the native kernel, byte for byte the
// JavaScript.

import { readFileSync } from 'node:fs'
import { experiment } from '@/test/scaffold/suite'
import { verdict, type Verdict } from '@/test/scaffold/verdict'
import type { KernelOptions } from '@/code/kernel/index'
import { softenContact } from '@/code/measure/contact-core'
import {
  boostLevels,
  galileanEnergy,
  readBoost,
  relativisticEnergy,
  relativityFraction,
  type BoostRead,
} from '@/code/measure/pair-boost'
import { diracPhase } from '@/code/measure/spinor-register'
import {
  genuine,
  linesOf,
  readZero,
  setupFor,
  TRACK_PLAN,
  type LineOut,
  type ZeroRead,
} from '@/code/measure/register-track'

export const UNIT: readonly [number, number] = [-5, 1]
export const A_B = 8
export const MOMENTA: readonly number[] = [0.04, 0.4, 0.8, 1.2, 1.6]
const GATED: readonly number[] = [0.8, 1.2, 1.6]
const WITNESS_K = 0.04
const WITNESS_E = 1.6768597364704667
const WITNESS = 1e-8
const IDENTITY = 0.2
const AMBIGUOUS = 2
const D_BAND = [0.8, 1.2] as const
const L_BAND = 0.5
const Q_BAND = [0.8, 1.2] as const
const Q_LOOSE = [0.5, 1.5] as const
// the K = 0 and small-K reads this file builds on (E-SPN-0206): the curvature a = (4 d2 / 0.02^2 - d1 / 0.04^2) / 3
const RECORDED_D1 = 0.00018576096136069253
const RECORDED_D2 = 0.000046735512703399706

const flag = (b: boolean): number => (b ? 1 : 0)
const inside = (x: number, band: readonly [number, number]): boolean =>
  x >= band[0] && x <= band[1]

export function combineBoost(input: {
  base: readonly LineOut[]
  reads: readonly BoostRead[]
}): Verdict {
  const su = setupFor(UNIT)
  const [g0, s0] = boostLevels(input.base)
  const E0 = g0!.E
  const E20 = s0!.E
  const a = (4 * (RECORDED_D2 / 0.02 ** 2) - RECORDED_D1 / 0.04 ** 2) / 3
  const cm2 = 2 * su.aMember * su.M0
  const metrics: Record<string, number> = { E0, E20, a, c2: 2 * a * E0 }
  const text: string[] = []

  let W = false
  let I = true
  let D = true
  let L = true
  let Q = true
  let QLoose = true

  for (const read of input.reads) {
    const K = read.K
    const ranked = boostLevels(read.lines)
    const [g, s, t] = ranked
    const tag = `K${K}`
    const clean =
      g !== undefined &&
      s !== undefined &&
      g.overlap >= IDENTITY &&
      g.overlap >= AMBIGUOUS * s.overlap &&
      s.overlap >= AMBIGUOUS * (t?.overlap ?? 0) &&
      genuine(g) &&
      genuine(s)
    const E = g?.E ?? NaN
    const E2 = s?.E ?? NaN
    const rel = relativisticEnergy({ E0, a, K })
    const gal = galileanEnergy({ E0, a, K })
    const rho = relativityFraction({ E, E0, a, K })
    const k = K / 2
    const Em = diracPhase([k, 0, 0, 0], su.M0)
    const rhoMember = relativityFraction({
      E: Em,
      E0: su.M0,
      a: cm2 / (2 * su.M0),
      K: k,
    })
    const x = (E2 - E) / (E20 - E0)
    const delta = (1 - x) / (1 - E0 / E)

    if (K === WITNESS_K) {
      W = Math.abs(E - WITNESS_E) <= WITNESS
    }

    I = I && clean

    if (GATED.includes(K)) {
      D = D && inside(rho, D_BAND)
      L = L && Math.abs(rho - rhoMember) <= L_BAND
      Q = Q && inside(delta, Q_BAND)
      QLoose = QLoose && inside(delta, Q_LOOSE)
    }

    metrics[`${tag}_E`] = E
    metrics[`${tag}_E2`] = E2
    metrics[`${tag}_rel`] = rel
    metrics[`${tag}_gal`] = gal
    metrics[`${tag}_rho`] = rho
    metrics[`${tag}_rhoMember`] = rhoMember
    metrics[`${tag}_clock`] = x
    metrics[`${tag}_delta`] = delta
    metrics[`${tag}_overlap`] = g?.overlap ?? NaN
    metrics[`${tag}_overlap2`] = s?.overlap ?? NaN
    metrics[`${tag}_overlap3`] = t?.overlap ?? NaN
    metrics[`${tag}_clean`] = flag(clean)
    text.push(
      `K ${K}: ground ${E.toFixed(9)} (overlap ${(g?.overlap ?? NaN).toFixed(3)}), 2s-like ${E2.toFixed(9)} (${(s?.overlap ?? NaN).toFixed(3)}, third ${(t?.overlap ?? NaN).toFixed(3)}), relativistic ${rel.toFixed(6)}, Galilean ${gal.toFixed(6)}, rho ${rho.toFixed(3)} against the member's ${rhoMember.toFixed(3)}, clock ${x.toFixed(5)}, delta ${delta.toFixed(3)}${clean ? '' : ', not clean'}`,
    )
  }

  const status =
    W && I && D && Q ? 'pass' : W && I && (D || L) && QLoose ? 'partial' : 'fail'

  metrics.W = flag(W)
  metrics.I = flag(I)
  metrics.D = flag(D)
  metrics.L = flag(L)
  metrics.Q = flag(Q)
  metrics.QLoose = flag(QLoose)

  return verdict({
    status,
    claim: `the a_B 8 pair with the contact well removed, boosted to K ${input.reads.map(r => r.K).join(', ')}: relativity fraction ${GATED.map(K => (metrics[`K${K}_rho`] ?? NaN).toFixed(3)).join(', ')} at K ${GATED.join(', ')} against the lone member's ${GATED.map(K => (metrics[`K${K}_rhoMember`] ?? NaN).toFixed(3)).join(', ')}, and the clock's dilation share ${GATED.map(K => (metrics[`K${K}_delta`] ?? NaN).toFixed(3)).join(', ')} (relativity 1, a rigid composite 0): W ${W}, I ${I}, D ${D}, L ${L}, Q ${Q}`,
    metrics,
    control: Object.fromEntries(
      GATED.map(K => [`rhoMember_K${K}`, metrics[`K${K}_rhoMember`] ?? NaN]),
    ),
    notes: `L2. ${text.join('. ')}.`,
  })
}

const NATIVE: KernelOptions = { backend: 'native', threads: 6 }

export default experiment({
  id: 'matter/composite-dispersion',
  code: 'E-MTR-0029',
  title:
    "explores whether the light register pair disperses relativistically along its whole curve and whether its internal clock dilates with its centre-of-mass motion (quadrature): the a_B 8 pair with the contact well removed boosted to K 0.04 to 1.6, against the lone member's own lattice band",
  category: 'spin',
  substrates: ['3434'],
  depth: 'L2',
  paper: false,
  run() {
    const su = setupFor(UNIT)
    const p = TRACK_PLAN.find(x => x.aB === A_B)!
    const zero = readZero(su, p, NATIVE, () => {}, 1, softenContact)
    const reads = MOMENTA.map(K =>
      readBoost(su, p, zero, K, NATIVE, () => {}, softenContact),
    )

    return combineBoost({ base: linesOf(su, p.aB, zero.x, reads[0]!.NK), reads })
  },
})

// the recorded K = 0 read (E-SPN-0206, tmp/spn-core-soften-a8.json), for a part run and a combine from saved reads
export const recordedZero = (
  file: string,
): { zero: ZeroRead; base: LineOut[] } => {
  const j = JSON.parse(readFileSync(file, 'utf8'))

  return { zero: j.zero, base: j.motion.base }
}
