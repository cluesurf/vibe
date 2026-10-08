// DOES A CURVED LINK FIELD MAKE THE REGISTER MEMBER HEAVY? (E-SPN-0180). E-SPN-0161 found that every link field that is not
// flat makes the swap-coin member heavy (mass 1.16 to 1.20 against 0.190 in a disordered field), and C* (E-FND-0160)
// kept its links flat for that reason, leaving color, Gauss's law, the start-picked rungs and the SU(2)+ gauge field of
// the Higgs row unread. This file builds the SU(2)+ link field E-FRC-0268 said R* lacks, 2T acting on half + of the
// register by right multiplication, and asks whether it makes the register member heavy. The derivation is
// note/project/vibe/roadmap/research/remaining-pieces.md, "A curved link field that keeps the member light".
//
// DERIVED BEFORE THE RUN (code/measure/register-link-field).
// 1. WHY 0161'S MEMBER WAS HEAVY (L1). Its lightest level is m = pi/2 - arcsin(sin(theta/2) lambda_top), lambda_top the TOP
//    of the averaged hop T = (1/24) sum_d g(x, d). The top reaches 1 only for a color vector every hop carries parallel, a
//    flat field; curvature pulls the top in, and disorder pulls it to the Kesten radius 0.39965. The member rests at an
//    EDGE of a positive spectrum, and disorder shrinks edges. Its color commuted with its coin, so commuting is not what
//    decides it.
// 2. THE REGISTER MEMBER'S LAW IN ANY STATIC FIELD (L1). U = V M2 V M1 with V (swap coin and stream) an involution in every
//    static field, so U = (1 + (conj u - 1) P)(1 + (u - 1) Q_S), P = V Q_D V. Jordan's lemma on the two projectors:
//        cos E = cos M - 2 cos^2(M/2) mu,    mu in spec(C^dag C),  C = Q_D V Q_S = c0 sum_d gamma(r_d) G_d T_d
//    E read from pi, M the free mass a cycle (0.380251, m0 = M/2 = 0.190126 a beat). C is the naive lattice Dirac operator
//    on the D4 roots, even register to odd, covariant in the links. E >= M always, and E = M exactly at a ZERO of C.
// 3. A ZERO IS A CENTER, NOT AN EDGE (L2 prediction). C's singular values are the positive half of a chiral spectrum,
//    and disorder fills the center of a spectrum (Banks and Casher; for a square random matrix the least singular value
//    falls like 1/n). PREDICTED: in every curved 2T field, however disordered, the register member stays at m0 (within
//    1e-4 a beat), while E-SPN-0161's member in the SAME field is heavy (the Kesten range, mass above 1.1 when disordered).
// 4. THE CONSTRUCTION, chosen over two others (the note's table): curvature kept off the member's line is impossible on D4
//    (every triangle uses three roots, and a resting member is spread over all 24 slots), and a field small in its vacuum is
//    unavailable for a finite group (no element near the identity). Right multiplication commutes with every piece, which
//    makes it the rule's SU(2)+ gauge field; the lightness comes from 2 and 3.
// 5. WHAT R* HELD (L1). One branch: 4 Gamma is orthogonal with det 4^8, so every link move has det 1. Frozen flats: the flat
//    space is ker Q_S n ker(Q_D V), 176 a dock when mu < 1, and every sector piece keeps it (E-SPN-0175's argument with the
//    field's V), in any STATIC field. K: Gamma acts inside a slot. Chirality: Gamma commutes with J and is the identity on
//    half -. The pulled pair: a pure gauge is a gauge transform of the free field, and E-SPN-0178's readings are gauge
//    invariant, so it carries over exactly in a flat vacuum (in a curved field it is not read: that engine needs
//    translation invariance).
//
// PREDICTED VERDICT: PASS.
//
// GATES, fixed before the gate run. Fields: 2T Weyl fields (golden streams) at L = 4 (offsets 0.5, 0.29, 0.73) and L = 6
// (0.5); dilute fields at L = 4 (a share 0.01, 0.03, 0.1, 0.3, 1 of links on 2T's 8 nearest elements, the rest the
// identity). The mixer unit ringUnit(-1, 4) (m0 0.190126 a beat).
//  L1 LIGHT: in every such field the register member's lightest level a beat, registerMass(M, mu_min) / 2, is within 1e-4
//     of m0.
//  L2 CURVED: every Weyl field has at least half its D4 triangles with a holonomy other than 1, and every dilute field
//     some (the fields are not flat in disguise).
//  L3 HEAVY IN THE SAME FIELD: E-SPN-0161's member, its law on the same field's averaged hop (half +), is at least 1.10 a
//     beat in every Weyl field and at least 0.90 in the dilute field at share 1.
//  L4 THE LAW ON THE CYCLE: at L = 4, eigenvectors of C^dag C (trivial field j = 0, 300, 511; the 0.5 Weyl field j = 0, 5,
//     100, 300, 511) lifted to the explicit one-member cycle close their plane to 1e-10 and give phases on the law to 1e-12.
//  G  GAUGE INVARIANCE UNDER LOCAL 2T MOVES, EXACTLY: g -> Gamma(g) a homomorphism over all 576 products; 4 Gamma(h)
//     commutes exactly with 24 Q_S, 48 Q_D, 96 Q_D P+, 48 Q_S P+ and 2 P+ for all 24 h; the reverse rule and the link-by-link
//     covariance exact on the 0.5 Weyl field at L = 4 under the gauge function of offset 0.29; the gauged run equals the
//     turned run to 1e-12 after 8 cycles; the gauged field's mu spectrum equals the field's to 1e-12.
//  B1 ONE BRANCH: every 4 Gamma(h) is orthogonal (4 Gamma 4 Gamma^T = 16) and has determinant 4^8, exactly.
//  B2 FROZEN FLATS: mu_max <= 0.999 in every field, so no block has mu = 1, W holds S and the flats are exactly 176 a dock.
//  B3 K BLOCKED: E-SPN-0175's two-hole trigger count on the L = 4 torus: least occupancy 6, K and the store 0 (the field
//     acts inside a slot and does not enter it).
//  B4 CHIRALITY: 4 Gamma(h) commutes with J and (4 Gamma - 4)(1 - J) = 0, exactly, for all 24.
//  B5 THE PULLED PAIR: the pure-gauge field's mu spectrum equals the trivial field's to 1e-12 at L = 4.
// CONTROLS (a failure makes the verdict partial at best).
//  C1 E-SPN-0160 REPRODUCED: the trivial field's mu spectrum is |s(K)|^2 / 4, four times per torus momentum, to 1e-12 at
//     L = 4 and L = 6.
//  C2 A FIELD THAT IS NOT A SYMMETRY IS CAUGHT: the same construction with LEFT multiplication fails to commute with
//     48 Q_D for some h.
//  C3 THE CURVATURE COUNTER READS FLAT FIELDS AS FLAT: 0 curved triangles in the trivial and the pure-gauge field.
//  C4 E-SPN-0161'S LAW IS NOT HEAVY BY CONSTRUCTION: in the trivial field it reads m0 to 1e-9.
// READ, gating nothing: the dilute sweep (both masses), the number of mu below 1e-4 in each Weyl field (the center filled),
//  the Sigma(648) role field of C* on a separate qutrit (both masses at L = 4), the central -1 field.
// Verdict: fail if L1, L2, L3, L4, G or B1 to B5 fails; partial if all hold and a control fails; pass otherwise.
//
// PROBES BEFORE THE GATE RUN, disclosed (no gate moved after the gate run).
//  tmp/lf-probe1.log (L = 4): the free spectrum matches |s|^2/4 to 8.7e-15; the Weyl field's mu_min 3.1e-8 (register mass
//   0.190126) against 0161's law 1.1796 on the same field; the dilute sweep 0.01 to 1 keeps 0.190126 while 0161's law reads
//   0.214, 0.252, 0.356, 0.558, 1.007; mu_max 0.163 at most. This is what suggested L1's 1e-4 and L3's 1.10 and 0.90.
//  tmp/lf-probe2.log: every exact check held (homomorphism with signs (-1, 1, 1), the five projector gaps 0, the left
//   control 8, orthogonal, det 4^8, trace law, 2 doublets and 4 singlets); covariance after 8 cycles 1.8e-17, gauged
//   spectrum 3.3e-15; the plane law at the Weyl field closes to 2.9e-11 at mu = 3.1e-8 (the plane's second vector is
//   normalized by sqrt mu, which amplifies rounding) and to 1.9e-13 or better elsewhere, which set L4's 1e-10; at mu = 0
//   the plane is a line (fixed in planeCheck before this header); the role field keeps mu_min 4.3e-8 against 0161's 1.168.
//  tmp/lf-probe1-6.log (L = 6, running when this header was written): the free spectrum to 2.8e-14, 130 s a field.
//  tmp/lf-smoke.log: every code path on a small plan (pass, 59 s; checks the code, gates nothing).
//
// FIRST RUN (tmp/lf-gate-E-SPN-0180.log, 389 s): PASS, as predicted. No gate moved and none was rerun.
//  - L1: in 9 curved fields the register member stays within 7.4e-7 of m0 0.190126 (worst at dilute 0.3). mu_min
//    1.9e-8 to 9.5e-8 in the L = 4 Weyl fields and 6.3e-9 at L = 6: the least mu falls with the box, a filled center.
//  - L2: the Weyl fields curve 0.955 to 0.963 of the triangles, the dilute fields 0.031 to 0.945.
//  - L3: E-SPN-0161's law on the same hop reads 1.1736, 1.1764, 1.1796 (L = 4) and 1.1704 (L = 6); the dilute sweep 0.2136,
//    0.2517, 0.3558, 0.5585, 1.0071 while the register member holds 0.190126.
//  - L4: planes close to 2.9e-11 at worst (mu = 3.1e-8), 1.9e-13 or better elsewhere, the law to 6.0e-15.
//  - G: homomorphism, projector gaps 0, reverse rule and link covariance exact, gauged run 1.8e-17, gauged spectrum 3.3e-15.
//  - B1 to B5 hold (mu_max 0.1626, least occupancy 6, pure gauge equal to trivial to 1.1e-14). C1 (2.8e-14 at L = 6), C2
//    (left gap 8), C3, C4 hold.
//  - READ: the Sigma(648) Weyl field on C*'s role keeps mu_min 4.3e-8 (member 0.1901257) where 0161's law reads 1.1679.
//    The central -1 field curves every triangle and changes nothing for either member (C -> -C, T -> -T).
//  THE AUDIT, as harshly as a stranger's. The law and the gauge checks are L1. The finding is L2: a known lattice fact
//  (Banks and Casher: disorder fills a Dirac spectrum's center) read off this rule, against 0161's Kesten edge on the same
//  field, a control that fails wherever the field is curved. What is not shown: the member MOVES freely in a curved
//  field (a disordered field has no momentum; only its rest level is read), the field's own dynamics with members, and
//  the pulled pair in a curved field.
//
// DETERMINISM: no random numbers; every field and start is a golden-ratio Weyl stream. EXACT: the group, 4 Gamma, J, the
// projectors and the covariance are integer checks; spectra are float measurement. NOTHING MOVES: a link holds a value,
// and a member's register is turned by the link its slot crosses.

import { experiment } from '@/test/scaffold/suite'
import { verdict, type Verdict } from '@/test/scaffold/verdict'
import { ringUnit, unitAngle } from '@/code/measure/swap-string'
import { seaTriggers, torus } from '@/code/measure/register-sea'
import {
  matMul,
  partnerProjector48,
  singletProjector24,
  structureVector,
} from '@/code/measure/spinor-register'
import { chirality2 } from '@/code/measure/chiral-register'
import { IDENTITY_SLOTS, registerGap } from '@/code/measure/register-symmetry'
import { eigSymmetric } from '@/code/algebra/linear/eig-jacobi'
import { makeDense } from '@/code/algebra/linear/dense'
import { generateGroup } from '@/code/dynamics/finite-gauge'
import { SU3_SUBGROUPS } from '@/code/algebra/group/su3-subgroups'
import {
  complexWeylLinks,
  covariantExact,
  diracHalf,
  exactGauge,
  gaugeApply,
  gaugedField,
  gaugeFunction,
  halfBasis,
  hopHalf,
  memberCycle,
  memberDistance,
  neighbors,
  planeCheck,
  registerField,
  registerGauge,
  registerMass,
  reverseExact,
  roleDirac,
  roleHop,
  scalarMass,
  spectrum,
  triangleCurvature,
  weylMember,
  type FieldKind,
  type RegisterField,
  type RegisterGauge,
} from '@/code/measure/register-link-field'

const LIGHT: readonly [number, number] = [-1, 4]
const LIGHT_TOL = 1e-4
const CURVED_WEYL = 0.5
const HEAVY_WEYL = 1.1
const HEAVY_DILUTE = 0.9
const CLOSURE = 1e-10
const LAW = 1e-12
const SPECTRUM = 1e-12
const COVARIANCE = 1e-12
const MU_MAX = 0.999
const SCALAR_FREE = 1e-9
const CENTER = 1e-4

export type CurvedPlan = {
  weyl: readonly { L: number; offset: number }[]
  dilute: readonly number[]
  diluteSide: number
  planeTrivial: readonly number[]
  planeWeyl: readonly number[]
  freeSides: readonly number[]
  cycles: number
  gaugeOffset: number
  role: boolean
}

export const GATE_PLAN: CurvedPlan = {
  weyl: [
    { L: 4, offset: 0.5 },
    { L: 4, offset: 0.29 },
    { L: 4, offset: 0.73 },
    { L: 6, offset: 0.5 },
  ],
  dilute: [0.01, 0.03, 0.1, 0.3, 1],
  diluteSide: 4,
  planeTrivial: [0, 300, 511],
  planeWeyl: [0, 5, 100, 300, 511],
  freeSides: [4, 6],
  cycles: 8,
  gaugeOffset: 0.29,
  role: true,
}

const flag = (b: boolean): number => (b ? 1 : 0)

export default experiment({
  id: 'spin/register-curved-links',
  code: 'E-SPN-0180',
  title:
    'a curved SU(2)+ link field keeps the register member light, where E-SPN-0161 made its member heavy: in any static field the register cycle obeys cos E = cos M - 2 cos^2(M/2) mu with mu the spectrum of the covariant Clifford hop C = Q_D V Q_S, a naive Dirac operator, so the member rests at a ZERO of C, the center of a chiral spectrum, which disorder fills, where 0161\'s member rests at the TOP of its averaged hop, an edge disorder pulls in; 2T acting on half + by right multiplication, exactly gauge covariant, keeps one branch, the flats, K blocked and chirality',
  category: 'spin',
  substrates: ['3434'],
  depth: 'L2',
  paper: false,
  run() {
    return curvedLinksRun(GATE_PLAN)
  },
})

type FieldRead = {
  label: string
  L: number
  muMin: number
  muMax: number
  center: number
  mReg: number
  lambda: number
  mScalar: number
  curved: number
}

function readField(
  label: string,
  f: RegisterField,
  G: RegisterGauge,
  b: Float64Array,
  M: number,
): FieldRead {
  const n = 4 * f.t.sites.length
  const mu = spectrum(n, diracHalf(f, G, b))
  const T = spectrum(n, hopHalf(f, G, b), undefined, 2)
  const lambda = Math.max(T[n - 1]!, -T[0]!)

  return {
    label,
    L: f.t.L,
    muMin: mu[0]!,
    muMax: mu[n - 1]!,
    center: mu.filter(x => x < CENTER).length,
    mReg: registerMass(M, Math.max(0, mu[0]!)) / 2,
    lambda,
    mScalar: scalarMass(M / 2, lambda),
    curved: triangleCurvature(f, G).curved,
  }
}

export function curvedLinksRun(plan: CurvedPlan): Verdict {
  const started = Date.now()
  const log = (what: string): void =>
    console.error(`${what} ${Math.round((Date.now() - started) / 1000)}s`)
  const th = unitAngle(ringUnit(LIGHT[0], LIGHT[1]))
  const u: [number, number] = [Math.cos(th), Math.sin(th)]
  const M = Math.acos(-Math.cos(th))
  const m0 = M / 2
  const G = registerGauge()
  const b = halfBasis(G.J)
  const tori = new Map<number, ReturnType<typeof torus>>()
  const at = (L: number): { t: ReturnType<typeof torus>; nb: Int32Array } => {
    if (!tori.has(L)) {
      tori.set(L, torus(L))
    }

    const t = tori.get(L)!

    return { t, nb: neighbors(t) }
  }
  const field = (
    L: number,
    kind: FieldKind,
    offset = 0.5,
    density = 0,
  ): RegisterField => {
    const { t, nb } = at(L)

    return registerField(t, nb, G, kind, offset, density)
  }

  // ---------------- the curved fields ----------------
  const weylReads = plan.weyl.map(w => {
    const r = readField(`weyl ${w.offset}`, field(w.L, 'weyl', w.offset), G, b, M)

    log(
      `L ${r.L} ${r.label}: mu ${r.muMin.toExponential(3)}..${r.muMax.toFixed(5)} (below 1e-4: ${r.center}) m_reg ${r.mReg.toFixed(9)}; 0161 lambda ${r.lambda.toFixed(6)} m ${r.mScalar.toFixed(6)}; curved ${r.curved.toFixed(4)}`,
    )

    return r
  })
  const diluteReads = plan.dilute.map(p => {
    const r = readField(
      `dilute ${p}`,
      field(plan.diluteSide, 'dilute', 0.5, p),
      G,
      b,
      M,
    )

    log(
      `L ${r.L} ${r.label}: mu ${r.muMin.toExponential(3)}..${r.muMax.toFixed(5)} m_reg ${r.mReg.toFixed(9)}; 0161 m ${r.mScalar.toFixed(6)}; curved ${r.curved.toFixed(4)}`,
    )

    return r
  })
  const curvedReads = [...weylReads, ...diluteReads]
  const L1 = curvedReads.every(r => Math.abs(r.mReg - m0) <= LIGHT_TOL)
  const L2 =
    weylReads.every(r => r.curved >= CURVED_WEYL) &&
    diluteReads.every(r => r.curved > 0)
  const L3 =
    weylReads.every(r => r.mScalar >= HEAVY_WEYL) &&
    diluteReads.filter(r => r.label === 'dilute 1').every(r => r.mScalar >= HEAVY_DILUTE)

  // ---------------- flat fields and the free control ----------------
  const flatReads = (['trivial', 'pure-gauge', 'minus'] as const).map(kind =>
    readField(kind, field(4, kind), G, b, M),
  )
  const trivial4 = flatReads[0]!
  const free = plan.freeSides.map(L => {
    const f = field(L, 'trivial')
    const n = 4 * f.t.sites.length
    const mu = spectrum(n, diracHalf(f, G, b))
    const pred = f.t.momenta
      .flatMap(K => {
        const g2 = structureVector(K).reduce((a, x) => a + x * x, 0) / 4

        return [g2, g2, g2, g2]
      })
      .sort((x, y) => x - y)

    return { L, gap: Math.max(...pred.map((x, i) => Math.abs(x - mu[i]!))), mu }
  })
  const C1 = free.every(x => x.gap <= SPECTRUM)

  log(`C1 ${C1}: ${free.map(x => `L ${x.L} ${x.gap.toExponential(2)}`).join(', ')}`)

  const C3 =
    flatReads[0]!.curved === 0 && flatReads[1]!.curved === 0
  const C4 = Math.abs(trivial4.mScalar - m0) <= SCALAR_FREE

  // ---------------- the law on the explicit cycle ----------------
  const n4 = 4 * at(4).t.sites.length
  const planeRun = (f: RegisterField, js: readonly number[]) => {
    const m = makeDense({ rows: n4, cols: n4 })

    m.data.set(diracHalf(f, G, b))

    const e = eigSymmetric({ matrix: m })

    return js.map(j => {
      const y = Float64Array.from({ length: n4 }, (_, i) => e.vectors[i * n4 + j]!)

      return { j, mu: e.values[j]!, ...planeCheck({ f, G, u, M, b, y, mu: Math.max(0, e.values[j]!) }) }
    })
  }
  const planes = [
    ...planeRun(field(4, 'trivial'), plan.planeTrivial),
    ...planeRun(field(4, 'weyl', 0.5), plan.planeWeyl),
  ]
  const L4 = planes.every(p => p.closure <= CLOSURE && p.lawGap <= LAW)

  log(
    `L4 ${L4}: ${planes.map(p => `j ${p.j} mu ${p.mu.toExponential(2)} closure ${p.closure.toExponential(1)} law ${p.lawGap.toExponential(1)}`).join('; ')}`,
  )

  // ---------------- gauge invariance ----------------
  const S24 = singletProjector24()
  const D48 = partnerProjector48()
  const chi2 = chirality2(G.J, 1)
  const ex = exactGauge(
    G,
    [S24, D48, matMul(D48, chi2), matMul(S24, chi2), chi2],
    registerGap,
    IDENTITY_SLOTS,
  )
  const w4 = field(4, 'weyl', 0.5)
  const h = gaugeFunction(w4.t.sites.length, G.group.order, plan.gaugeOffset)
  const w4h = gaugedField(w4, G, h)
  const reverse = reverseExact(w4, G) && reverseExact(w4h, G)
  const linkCovariant = covariantExact(w4, w4h, G, h)

  let a = weylMember(w4.t.sites.length, 0.1)
  let c = gaugeApply(G, h, a)

  for (let k = 0; k < plan.cycles; k++) {
    a = memberCycle(w4, G, u, a)
    c = memberCycle(w4h, G, u, c)
  }

  const dynamic = memberDistance(gaugeApply(G, h, a), c)
  const s1 = spectrum(n4, diracHalf(w4, G, b))
  const s2 = spectrum(n4, diracHalf(w4h, G, b))
  const gaugedGap = Math.max(...s1.map((x, i) => Math.abs(x - s2[i]!)))
  const Gate =
    ex.homomorphism &&
    ex.projectorGaps.every(x => x === 0) &&
    reverse &&
    linkCovariant &&
    dynamic <= COVARIANCE &&
    gaugedGap <= SPECTRUM
  const C2 = ex.leftGap > 0

  log(
    `G ${Gate}: hom ${ex.homomorphism} (signs ${G.signs.join(',')}), projector gaps ${ex.projectorGaps.join(' ')}, reverse ${reverse}, link covariance ${linkCovariant}, dynamic ${dynamic.toExponential(2)}, gauged spectrum ${gaugedGap.toExponential(2)}; C2 left gap ${ex.leftGap}`,
  )

  // ---------------- what R* held ----------------
  const B1 = ex.orthogonal && ex.unitDeterminant
  const allReads = [...curvedReads, ...flatReads]
  const B2 = allReads.every(r => r.muMax <= MU_MAX)
  const trig = seaTriggers(at(4).t)
  const B3 = trig.leastOccupancy === 6 && trig.kTriggers === 0 && trig.storeTriggers === 0
  const B4 = ex.commutesJ && ex.halfMinusIdentity
  const pureTriv = (() => {
    const f = field(4, 'pure-gauge')
    const mu = spectrum(n4, diracHalf(f, G, b))

    return Math.max(...mu.map((x, i) => Math.abs(x - free[0]!.mu[i]!)))
  })()
  const B5 = pureTriv <= SPECTRUM

  log(
    `B1 ${B1} B2 ${B2} (mu_max ${Math.max(...allReads.map(r => r.muMax)).toFixed(5)}) B3 ${B3} (least ${trig.leastOccupancy}, K ${trig.kTriggers}, store ${trig.storeTriggers}) B4 ${B4} B5 ${B5} (${pureTriv.toExponential(2)})`,
  )

  // ---------------- reads ----------------
  let role = ''

  if (plan.role) {
    const sigma = generateGroup({ generators: SU3_SUBGROUPS.sigma648.generators })
    const mats = sigma.matrices.map(x => Float64Array.from(x))
    const inv = Int32Array.from(sigma.inverse)
    const { t, nb } = at(4)
    const links = complexWeylLinks(t, nb, mats, inv, 0, 'weyl')
    const D = roleDirac(t, nb, links, b)
    const mu = spectrum(D.n, D.re, D.im)
    const T = roleHop(t, nb, links)
    const ts = spectrum(T.n, T.re, T.im, 2)
    const lam = Math.max(ts[T.n - 1]!, -ts[0]!)

    role = `Sigma(648) role field (Weyl, L 4, order ${sigma.order}): mu_min ${mu[0]!.toExponential(3)}, register member ${(registerMass(M, Math.max(0, mu[0]!)) / 2).toFixed(9)}; 0161's law lambda ${lam.toFixed(6)} mass ${scalarMass(m0, lam).toFixed(6)}`
    log(role)
  }

  const controls = C1 && C2 && C3 && C4
  const hard = L1 && L2 && L3 && L4 && Gate && B1 && B2 && B3 && B4 && B5
  const status = !hard ? 'fail' : !controls ? 'partial' : 'pass'
  const worstLight = Math.max(...curvedReads.map(r => Math.abs(r.mReg - m0)))
  const fmt = (r: FieldRead): string =>
    `${r.label} L ${r.L}: mu_min ${r.muMin.toExponential(2)} m ${r.mReg.toFixed(7)} / 0161 ${r.mScalar.toFixed(4)} (lambda ${r.lambda.toFixed(4)}), curved ${r.curved.toFixed(3)}, below 1e-4 ${r.center}`

  return verdict({
    status,
    claim: `L1 ${L1} (the register member within ${worstLight.toExponential(1)} of m0 ${m0.toFixed(6)} in ${curvedReads.length} curved 2T fields) L2 ${L2} (Weyl fields curved on ${Math.min(...weylReads.map(r => r.curved)).toFixed(3)} of triangles or more) L3 ${L3} (E-SPN-0161's member in the same fields ${Math.min(...weylReads.map(r => r.mScalar)).toFixed(4)} to ${Math.max(...weylReads.map(r => r.mScalar)).toFixed(4)}, dilute share 1 ${diluteReads[diluteReads.length - 1]!.mScalar.toFixed(4)}) L4 ${L4} (planes close to ${Math.max(...planes.map(p => p.closure)).toExponential(1)}, law ${Math.max(...planes.map(p => p.lawGap)).toExponential(1)}) G ${Gate} (exact homomorphism, projector gaps 0, link covariance exact, dynamic ${dynamic.toExponential(1)}, gauged spectrum ${gaugedGap.toExponential(1)}) B1 ${B1} B2 ${B2} B3 ${B3} B4 ${B4} B5 ${B5}; controls C1 ${C1} C2 ${C2} C3 ${C3} C4 ${C4}`,
    metrics: {
      L1: flag(L1),
      L2: flag(L2),
      L3: flag(L3),
      L4: flag(L4),
      G: flag(Gate),
      B1: flag(B1),
      B2: flag(B2),
      B3: flag(B3),
      B4: flag(B4),
      B5: flag(B5),
      C1: flag(C1),
      C2: flag(C2),
      C3: flag(C3),
      C4: flag(C4),
      m0,
      worstLight,
      heavyMin: Math.min(...weylReads.map(r => r.mScalar)),
      muMinWeyl: Math.max(...weylReads.map(r => r.muMin)),
      dynamic,
      seconds: (Date.now() - started) / 1000,
    },
    control: { C1: flag(C1), C2: flag(C2), C3: flag(C3), C4: flag(C4) },
    notes: `Mixer ringUnit(${LIGHT.join(', ')}), M ${M.toFixed(6)} a cycle. Weyl: ${weylReads.map(fmt).join('; ')}. Dilute (L ${plan.diluteSide}): ${diluteReads.map(fmt).join('; ')}. Flat: ${flatReads.map(fmt).join('; ')}. Planes: ${planes.map(p => `j ${p.j} mu ${p.mu.toExponential(2)} closure ${p.closure.toExponential(1)} law ${p.lawGap.toExponential(1)}`).join('; ')}. Exact: ${JSON.stringify(ex)}. ${role}. ${((Date.now() - started) / 1000).toFixed(0)} s.`,
  })
}
