// DO THE REGISTER MEMBER'S 88 FLAT MODES PER HALF STAY OUT OF LOW-ENERGY PHYSICS WHEN THE LIGHT OR THE SU(2)+ FIELD IS ON?
// (E-FRC-0284). The route "flat bands decouple" (roadmap routes/matter-forces-numbers.md, G · the particle count): each
// register half holds 96 modes a dock, 4 + 4 moving and 88 flat (E-FRC-0258); the 88 must not carry charge into low-energy
// physics. Read whether any flat mode couples to the light or the SU(2)+ field on a side-4 box. Kill: a flat mode carries
// charge and mixes with moving ones.
//
// WHAT IS RUN. E-FRC-0258's chiral register member (mixer u+ = ringUnit(-1, 4) on half +, u- = ringUnit(2, 2) on half -,
// beat 1 on Q_S, beat 2 conjugate on Q_D, each after the swap coin and the stream) on the D4 torus of side 4 (128 docks,
// 24,576 modes, code/measure/register-sea), with the light as E-SPN-0169's register-blind Peierls phase e^(i theta) on each
// link and the SU(2)+ field as E-SPN-0180's 2T link value acting on half + by right multiplication (code/measure/
// register-link-field), together or apart (code/measure/flat-bands). Static fields: trivial, a Weyl U(1) field over the
// whole circle (theta = 2 pi (w - 1/2), curved on almost every plaquette), a Weyl 2T field, and both. Changing fields: a
// field switched on for one beat only, and a slow drive that turns a field on and off over P beats.
//
// DERIVED BEFORE THE GATE RUN.
// 1. THE CHARGE OF A FLAT MODE (L1, a reading of E-SPN-0189). The tone is a species label no piece touches, so the charge
//    operator is a constant on a member's 192 modes, (pleasure - pain)/3 = +1/3 or -1/3, flat modes included; the Peierls
//    phase multiplies all 192 alike. SU(2)+ acts on half + by right multiplication, which commutes with every piece, so
//    the half + flat space is SU(2)+ invariant and holds 88 / 2 = 44 doublets a dock; half - flats are singlets. So the
//    first half of the kill (a flat mode carries charge) holds by construction. The route turns on the second half.
// 2. THE FLATS IN A STATIC FIELD (L1). U = V (1 + (conj u - 1) Q_D) V (1 + (u - 1) Q_S), where V, the swap coin and the
//    stream, is an involution in any static field whose reverse link carries the inverse (theta -> -theta, g -> g^-1): a
//    member that goes out over a link comes back over it. If Q_S f = 0 and Q_D V f = 0 then U f = V V f = f. So the
//    whole complement of W = range(Q_S) + V range(Q_D) is fixed by the cycle, in ANY static U(1) or SU(2)+ field, curved
//    or not, and since U is unitary W is invariant too: the flat space and the moving space do not mix. Per half W has
//    dimension 4N + 4N - #(mu = 1), mu the eigenvalues of B^dag B, B = E_S^dag V E_D the covariant Clifford hop between
//    the sectors (Jordan's lemma, as in E-SPN-0180): the moving levels sit at pi +- E(mu), cos E = cos M - 2 cos^2(M / 2)
//    mu, so a moving level reaches the flats' phase 0 only at mu = 1. On the free box mu is |s(K)|^2 / 4 at the 128 box
//    momenta, 4-fold per half, the exact values 0, 1/72, 1/24, 1/9, 1/8. PREDICTED: no mu = 1 in any of the four fields,
//    so 88 N = 11,264 flats per half exactly, fixed by the cycle to rounding, separated from the moving band by
//    pi - E(mu_max), above 2 rad a cycle (mu_max at most 0.2, from probe 1), against a light rest level at pi - M.
// 3. THE FLATS IN A CHANGING FIELD (argued, L2 measured). If the field differs between the out beat and the back beat,
//    V2 V1 is the change of the link value across a beat (the electric field), not 1, and U f = V2 V1 f leaves the flat
//    space at first order in the change: the flat mode is a charge bouncing across one link and it reads the electric
//    field. So a flat mode DOES couple to a changing light, with weight in the moving space quadratic in the change. But
//    the flats are degenerate at phase 0 in every static field and gapped from the moving band, so under a slow drive the
//    adiabatic theorem returns the state to the flat space: the leak falls at least as P^-2 with the drive's period P
//    (faster for a smooth envelope). A leak that stays finite at slow drive would be the flats carrying charge into
//    low-energy physics. PREDICTED: a one-beat field leaks (control), quadratically in its strength; the slow drive's
//    leak falls by at least 4 for each doubling of P from 32 to 512 beats and is below 1e-6 at P = 512.
//
// PROBES BEFORE THE GATES, disclosed. tmp/fb-probe1.log: on the four static fields every reverse rule holds, no mu = 1,
//  mu_max 0.125 (trivial), 0.156 (U(1)), 0.157 (half + in the 2T field; half - 0.125, the field acts on half + only),
//  0.155 (both); a Weyl start's flat part is fixed by the cycle to 5.6e-16 and its moving weight after one cycle is 9e-32;
//  the moving share of a Weyl start is 0.056 to 0.067 (8 / 96 = 0.083 on average). tmp/fb-probe2.log: on the free box mu
//  is |s(K)|^2 / 4 at the 128 momenta, 4-fold: 0 (160), 1/72 (96), 1/24 (128), 1/9 (96), 1/8 (32). tmp/fb-probe3.log: a
//  curved U(1) field on beat 1 only leaks 0.086 (strength 1), 2.7e-3 (0.1), 2.8e-5 (0.01) of a free flat state into the
//  moving space, the 2T field on beat 1 only 0.087; a sin^2 drive of amplitude 0.5 over P beats leaks, uniform field:
//  1.9e-3, 2.7e-2, 5.6e-4, 1.2e-5, 5.0e-7, 5.0e-8 at P = 4 .. 128; curved field: 8.0e-3, 2.4e-2, 5.2e-3, 1.1e-4,
//  5.7e-6, 3.6e-7. The gate thresholds below (mu_max <= 0.2, gap >= 2, the factor 4 per doubling, 1e-6 at P = 512, the
//  fast-drive control at P = 8) were set from these and the derivation; no gate was set after the gate run.
//
// HYPOTHESES AND GATES, fixed before the gate run.
//  I1 INSTRUMENT: on the free box, the mu spectrum of each half equals |s(K)|^2 / 4 at the 128 box momenta, each 4-fold,
//     sorted, to 1e-12; and the flat-part solver leaves a moving weight below 1e-26 of the flat part's norm.
//  C1 CONTROL (the instrument reads mixing): a curved U(1) field (strength 1) on beat 1 only leaks at least 1e-2 of a free
//     flat state's weight into the moving space, and the leaks at strengths 0.1 and 0.01 differ by a factor 80 to 120
//     (first order in the change); the fast drive (P = 8) leaks at least 1e-3 in both drive kinds.
//  H1 THE FLATS DECOUPLE: (a) on each of the four static fields, in each half: the reverse rule holds, no eigenvalue mu of
//     B^dag B above 1 - 1e-9 (so exactly 88 N = 11,264 flats per half), mu_max <= 0.2 and the gap pi - E(mu_max) >= 2;
//     a Weyl start's flat part f satisfies |U f - f| / |f| <= 1e-13 and moving weight of U f <= 1e-26 |f|^2; in the free
//     field every global SU(2)+ move Gamma(h) (24) keeps a half + flat state flat (moving weight <= 1e-26). (b) the slow
//     drive, uniform and curved: the leak at P = 32, 64, 128, 256, 512 falls by at least 4 per doubling and is <= 1e-6 at
//     P = 512.
//  P1 FALSIFIER: in some static field a flat state leaves the flat space (|U f - f| / |f| > 1e-12 or moving weight of U f
//     > 1e-24), or some mu reaches 1 (a moving level at the flats' phase), or the slow-drive leak at P = 512 is above 1e-4
//     or rises on a doubling from 128 on.
// VERDICT: fail if P1 fires; pass if I1, C1 and H1 hold; partial if P1 does not fire but I1, C1 or H1 misses (a miss at
// the float floor counts as partial).
//
// WHAT THIS CAN AND CANNOT SHOW. It reads one member (one-body) on a 128-dock box with static and driven link fields,
// the light as a Peierls phase on the bulk stream (as E-SPN-0169 coupled it; the husk light's own dynamics and split,
// E-FRC-0261, 0262, are not run, only its value on the links), and the SU(2)+ field as fixed 2T values. It shows whether
// the flat space is invariant and gapped. It cannot show what the many-body vacuum does with the flats (whether they are
// filled, E-SPN-0175's flat count), whether a pair piece or a collision mixes them in (E-FRC-0273's join acts on the
// sectors, not on the flats), or what flats do on the true hyperbolic mesh. A flat mode stays a charge: if one is
// occupied it is a static charge of 1/3 that sources the light; this experiment reads only that it cannot move or mix
// at low energy.

import { experiment } from '@/test/scaffold/suite'
import { verdict, type Verdict } from '@/test/scaffold/verdict'
import { torus } from '@/code/measure/register-sea'
import {
  neighbors,
  registerGauge,
  spectrum,
} from '@/code/measure/register-link-field'
import { ringUnit, unitAngle } from '@/code/measure/swap-string'
import { structureVector } from '@/code/measure/spinor-register'
import {
  cycleField,
  flatPart,
  halfBases,
  halfProject,
  hopBlock,
  hopGram,
  linkField,
  movingWeight,
  newVec,
  normSq,
  reverseHolds,
  rootDot,
  weylStart,
  weylValue,
  type CVec,
  type LinkField,
} from '@/code/measure/flat-bands'

const SLOTS = 24
const REG = 8
const MODES = SLOTS * REG
const PLUS: readonly [number, number] = [-1, 4]
const MINUS: readonly [number, number] = [2, 2]
const DRIVE_AMPLITUDE = 0.5
const SLOW_PERIODS = [32, 64, 128, 256, 512]
const FAST_PERIOD = 8

const flag = (b: boolean): number => (b ? 1 : 0)

export default experiment({
  id: 'gauge/flat-bands-decouple',
  code: 'E-FRC-0284',
  title:
    'the register member\'s 88 flat modes per half decouple from the light and the SU(2)+ field at low energy, flat bands decouple (pending the gate run)',
  category: 'gauge',
  substrates: ['3434'],
  depth: 'L2',
  paper: false,
  run() {
    return flatBandsRun()
  },
})

export function flatBandsRun(): Verdict {
  const started = Date.now()
  const t = torus(4)
  const nb = neighbors(t)
  const G = registerGauge()
  const N = t.sites.length
  const angP = unitAngle(ringUnit(PLUS[0], PLUS[1]))
  const angM = unitAngle(ringUnit(MINUS[0], MINUS[1]))
  const u = {
    plus: [Math.cos(angP), Math.sin(angP)] as const,
    minus: [Math.cos(angM), Math.sin(angM)] as const,
  }
  const MP = Math.PI - Math.abs(angP)
  const MM = Math.PI - Math.abs(angM)
  const bases = { plus: halfBases(1), minus: halfBases(-1) }
  const weyl2T = (_x: number, _d: number, k: number): number =>
    Math.floor(weylValue(k, 0.5) * G.group.order) % G.group.order
  const curvedTheta =
    (lam: number, offset: number) =>
    (_x: number, _d: number, k: number): number =>
      lam * 2 * Math.PI * (weylValue(k, offset) - 0.5)
  const free = linkField(t, nb, () => 0, null, null)
  const fields: { name: string; f: LinkField }[] = [
    { name: 'trivial', f: free },
    { name: 'U(1)', f: linkField(t, nb, curvedTheta(1, 0.5), null, null) },
    { name: '2T', f: linkField(t, nb, () => 0, G, weyl2T) },
    { name: 'both', f: linkField(t, nb, curvedTheta(1, 0.37), G, weyl2T) },
  ]
  const gOf = (f: LinkField): typeof G | null => (f.link ? G : null)
  const E = (M: number, mu: number): number =>
    Math.acos(Math.max(-1, Math.min(1, Math.cos(M) - 2 * Math.cos(M / 2) ** 2 * mu)))

  // ---- I1: the free box's mu against |s(K)|^2 / 4 ----
  const g2 = t.momenta
    .flatMap(K => {
      const s = structureVector(K)
      const v = s.reduce((a, x) => a + x * x, 0) / 4

      return [v, v, v, v]
    })
    .sort((a, b) => a - b)

  // ---- H1a: the static fields ----
  type StaticRead = {
    field: string
    half: number
    reverse: boolean
    ones: number
    muMax: number
    gap: number
    flats: number
    fixed: number
    leak: number
    solverLeak: number
  }

  const reads: StaticRead[] = []
  let i1Dev = 0
  let i1Solver = 0

  for (const { name, f } of fields) {
    const Gf = gOf(f)
    const reverse = reverseHolds(f, Gf)

    for (const [h, b] of [
      [1, bases.plus],
      [-1, bases.minus],
    ] as const) {
      const B = hopBlock(f, Gf, b)
      const H = hopGram(B)
      const mu = spectrum(B.n, H.re, H.im)
      const ones = mu.filter(x => x > 1 - 1e-9).length
      const muMax = mu[mu.length - 1]!
      const M = h === 1 ? MP : MM
      const gap = Math.PI - E(M, muMax)
      const psi = halfProject(weylStart(N * MODES, 0.21), h)
      const fl = flatPart(f, Gf, b, B, psi)
      const nf = normSq(fl)
      const Uf = cycleField(f, f, Gf, bases, u, fl)

      let d = 0

      for (let k = 0; k < Uf.re.length; k++) {
        d += (Uf.re[k]! - fl.re[k]!) ** 2 + (Uf.im[k]! - fl.im[k]!) ** 2
      }

      const solverLeak = movingWeight(f, Gf, b, B, fl).weight / nf
      const leak = movingWeight(f, Gf, b, B, Uf).weight / nf

      if (name === 'trivial') {
        i1Dev = Math.max(i1Dev, ...mu.map((x, k) => Math.abs(x - g2[k]!)))
        i1Solver = Math.max(i1Solver, solverLeak)
      }

      reads.push({
        field: name,
        half: h,
        reverse,
        ones,
        muMax,
        gap,
        flats: 96 * N - (8 * N - ones),
        fixed: Math.sqrt(d / nf),
        leak,
        solverLeak,
      })
    }
  }

  // the global SU(2)+ moves on a free half + flat state
  const B0 = hopBlock(free, null, bases.plus)
  const f0 = flatPart(free, null, bases.plus, B0, halfProject(weylStart(N * MODES, 0.21), 1))
  const n0 = normSq(f0)
  const globalMove = (hIndex: number, s: CVec): CVec => {
    const M = G.gamma4[hIndex]!
    const out = newVec(s.re.length)

    for (let o = 0; o < s.re.length; o += REG) {
      for (let i = 0; i < REG; i++) {
        let r = 0
        let m = 0

        for (let j = 0; j < REG; j++) {
          r += M[i]![j]! * s.re[o + j]!
          m += M[i]![j]! * s.im[o + j]!
        }

        out.re[o + i] = r / 4
        out.im[o + i] = m / 4
      }
    }

    return out
  }

  let su2Leak = 0

  for (let h = 0; h < G.group.order; h++) {
    const g = globalMove(h, f0)

    su2Leak = Math.max(su2Leak, movingWeight(free, null, bases.plus, B0, g).weight / n0)
  }

  // ---- C1: a field on one beat only ----
  const oneBeat = (f1: LinkField, Gf: typeof G | null): number =>
    movingWeight(free, null, bases.plus, B0, cycleField(f1, free, Gf, bases, u, f0)).weight / n0
  const sudden = [1, 0.1, 0.01].map(lam => oneBeat(linkField(t, nb, curvedTheta(lam, 0.5), null, null), null))
  const sudden2T = oneBeat(fields[2]!.f, G)

  // ---- H1b and C1: the drives ----
  const AXIS = [1, 0.5, 0.25, 0]
  const driveLeak = (kind: 'uniform' | 'curved', P: number): number => {
    const mk = (a: number): LinkField =>
      kind === 'uniform'
        ? linkField(t, nb, (_x, d) => a * rootDot(AXIS, d), null, null)
        : linkField(t, nb, curvedTheta(a, 0.5), null, null)

    let s = f0

    for (let c = 0; c < P / 2; c++) {
      const a1 = DRIVE_AMPLITUDE * Math.sin((2 * Math.PI * (2 * c + 0.5)) / P) ** 2
      const a2 = DRIVE_AMPLITUDE * Math.sin((2 * Math.PI * (2 * c + 1.5)) / P) ** 2

      s = cycleField(mk(a1), mk(a2), null, bases, u, s)
    }

    return movingWeight(free, null, bases.plus, B0, s).weight / n0
  }
  const drives = (['uniform', 'curved'] as const).map(kind => ({
    kind,
    fast: driveLeak(kind, FAST_PERIOD),
    slow: SLOW_PERIODS.map(P => driveLeak(kind, P)),
  }))

  // ---- gates ----
  const I1 = i1Dev <= 1e-12 && i1Solver <= 1e-26
  const suddenRatio = sudden[1]! / sudden[2]!
  const C1 =
    sudden[0]! >= 1e-2 &&
    suddenRatio >= 80 &&
    suddenRatio <= 120 &&
    drives.every(d => d.fast >= 1e-3)
  const H1a =
    reads.every(
      r =>
        r.reverse &&
        r.ones === 0 &&
        r.flats === 88 * N &&
        r.muMax <= 0.2 &&
        r.gap >= 2 &&
        r.fixed <= 1e-13 &&
        r.leak <= 1e-26,
    ) && su2Leak <= 1e-26
  const H1b = drives.every(
    d =>
      d.slow.every((x, k) => k === 0 || d.slow[k - 1]! / x >= 4) &&
      d.slow[d.slow.length - 1]! <= 1e-6,
  )
  const P1 =
    reads.some(r => r.fixed > 1e-12 || r.leak > 1e-24 || r.ones > 0) ||
    drives.some(
      d =>
        d.slow[d.slow.length - 1]! > 1e-4 ||
        d.slow.some((x, k) => SLOW_PERIODS[k]! > 128 && x > d.slow[k - 1]!),
    )
  const status: Verdict['status'] = P1 ? 'fail' : I1 && C1 && H1a && H1b ? 'pass' : 'partial'
  const worst = (key: 'fixed' | 'leak' | 'muMax' | 'gap', min = false): number =>
    reads.reduce((a, r) => (min ? Math.min(a, r[key]) : Math.max(a, r[key])), min ? Infinity : 0)
  const readLine = reads
    .map(
      r =>
        `${r.field}/${r.half > 0 ? '+' : '-'}: mu_max ${r.muMax.toFixed(6)}, mu=1 ${r.ones}, flats ${r.flats}, gap ${r.gap.toFixed(4)}, |Uf-f| ${r.fixed.toExponential(2)}, leak ${r.leak.toExponential(2)}`,
    )
    .join('; ')
  const driveLine = drives
    .map(
      d =>
        `${d.kind}: fast (P ${FAST_PERIOD}) ${d.fast.toExponential(3)}; slow ${d.slow.map((x, k) => `P ${SLOW_PERIODS[k]} ${x.toExponential(3)}`).join(', ')}`,
    )
    .join('; ')

  return verdict({
    status,
    claim: `I1 ${I1} (free mu against |s|^2/4 at the 128 box momenta, worst ${i1Dev.toExponential(2)}; solver leak ${i1Solver.toExponential(2)}); C1 ${C1} (one-beat curved U(1) leak ${sudden.map(x => x.toExponential(3)).join(', ')} at strength 1, 0.1, 0.01, ratio ${suddenRatio.toFixed(2)}; one-beat 2T ${sudden2T.toExponential(3)}); H1a ${H1a} (static fields: worst |Uf-f|/|f| ${worst('fixed').toExponential(2)}, worst moving leak ${worst('leak').toExponential(2)}, mu_max ${worst('muMax').toFixed(6)}, least gap ${worst('gap', true).toFixed(4)}, flats ${88 * N} per half in every field: ${reads.every(r => r.flats === 88 * N)}; global SU(2)+ leak ${su2Leak.toExponential(2)}); H1b ${H1b} (${driveLine}); P1 ${P1}`,
    metrics: {
      I1: flag(I1),
      C1: flag(C1),
      H1a: flag(H1a),
      H1b: flag(H1b),
      P1: flag(P1),
      freeMuDeviation: i1Dev,
      solverLeak: i1Solver,
      worstFixed: worst('fixed'),
      worstLeak: worst('leak'),
      muMax: worst('muMax'),
      leastGap: worst('gap', true),
      flatsPerHalf: 88 * N,
      muAtOne: reads.reduce((a, r) => a + r.ones, 0),
      su2Leak,
      sudden1: sudden[0]!,
      sudden01: sudden[1]!,
      sudden001: sudden[2]!,
      sudden2T,
      fastUniform: drives[0]!.fast,
      fastCurved: drives[1]!.fast,
      slowUniform512: drives[0]!.slow[SLOW_PERIODS.length - 1]!,
      slowCurved512: drives[1]!.slow[SLOW_PERIODS.length - 1]!,
      seconds: (Date.now() - started) / 1000,
    },
    control: {
      sudden1: sudden[0]!,
      suddenRatio,
      fastUniform: drives[0]!.fast,
      fastCurved: drives[1]!.fast,
    },
    notes: `L2 (L1 for the invariance and the count). Box L = 4, ${N} docks, ${N * MODES} modes. M+ ${MP.toFixed(6)}, M- ${MM.toFixed(6)} (rest levels at pi - M). Static reads: ${readLine}. Drive amplitude ${DRIVE_AMPLITUDE} (sin^2 envelope, axis ${AXIS.join(', ')} for the uniform field). ${((Date.now() - started) / 1000).toFixed(0)} s.`,
  })
}
