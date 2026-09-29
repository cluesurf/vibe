// The even second-order response (E-FRC-0253): with matter reading the light (E-FRC-0252), is there a
// CHARGE-BLIND residue in the interaction of two NEUTRAL lumps, the same for either sign of either lump, and does
// it fall as 1/r (gravity-like, Sakharov's induced gravity) or faster (van der Waals)?
//
// WHY THIS IS THE QUESTION. The light's static energy is the quadratic form (pi / D) 1/2 rho^T L^-1 rho
// (E-FRC-0212, 0241), so between two FIXED charge distributions the cross term is bilinear and odd in each
// (E-GRV-0059: charge-blind part 0 by an identity). An even part needs the lumps to RESPOND: a lump whose
// charges hop, reading the light, is polarized by the other lump's field, and the second-order energy of that
// response is even in each lump's sign.
//
// THE LUMPS, a STAND-IN, disclosed. Lump i on the husk x axis: a fixed charge f_i at c_i and the opposite charge
// -f_i on one of two docks c_i + s e_x, s = +1 or -1, with tunneling t between the two (a two-level system,
// H_i = -t sigma_x). c_2 = c_1 + r e_x, r = 4 .. 12. t = 2 pi / 1024 per beat, E-FRC-0252's hop angle, so the
// lump's internal hop is the same size as the test vibe's. f_i = +1 or -1 (a lump and its charge-flipped copy).
// THE COUPLING. A hop reading a static field through its Peierls phase is, in the scalar gauge, the charge
// times the potential; with the light's static form that is the Coulomb energy. So the lumps interact by the
// cross term -(pi / D) sum_(a in 1, b in 2) q_a q_b V(r_ab), V = G(0) - G the husk Laplacian's infinite-lattice
// Green's difference (code/measure/husk-coulomb infiniteGreenDifferences, tori of side 64 and 128, Richardson),
// D = 32 as in E-FRC-0252 (the G(0) terms cancel because each lump is neutral). This is the NON-RETARDED limit:
// the light's transverse part and its finite speed (c = sqrt(2 kappa / 3) = 0.143 docks per beat at D = 32,
// so c / (2 t) = 11.6 docks) are not included; retardation turns a van der Waals 1/r^6 into Casimir-Polder
// 1/r^7 beyond about that range. The energy is read by diagonalizing the two-lump 4 x 4 Hamiltonian
// (measurement, doubles):
//   W(f1, f2, r) = E0(-t (sigma_x1 + sigma_x2) + V_cross) - E0(lumps apart) = E0(...) + 2 t
// THE CHARGE-BLIND PART B(r) is the mean of W over the four sign patterns (f1, f2); the odd part is what is
// left, W(f1, f2) - B.
// CONTROLS: FIXED lumps (s_1 = s_2 = +1 held, no tunneling): W is the bilinear cross term, charge-blind part 0 by
// the identity. DEGENERATE lumps (t = 0, each lump free to take either s): W = min over (s_1, s_2) of V_cross.
//
// Gates, fixed before the first run of this file:
//  V1 instrument: the fixed lumps' charge-blind part is 0 to 1e-15 at every r, and every diagonalization's
//     residual |H v - E v| is below 1e-14
//  V2 a charge-blind residue: with tunneling, B(r) < 0 at every r = 4 .. 12 and rises strictly with r
//  V3 gravity-like: the least-squares slope of ln |B| against ln r over r = 6 .. 12 lies in [-1.2, -0.8]
// Verdict: pass if all hold; fail if V1 holds and V2 or V3 fails; partial if V1 fails.
// Reported, not gated: the slope over 6 .. 12 and 4 .. 12, B(r) r^6, the odd part's largest share of |B|, the
// degenerate lumps' charge-blind part and its slope (orientation, not polarization), second-order perturbation
// theory -K^2 / (4 t) beside B with K the dipole-dipole coupling.
//
// FIRST RUN (tmp/frc0253-run1.log, 0.4 s, the record): fail on V3 alone, no gate moved. V1 and V2 hold: fixed
// lumps give a charge-blind part of exactly 0, and tunneling lumps a charge-blind attraction B = -1.96e-7,
// -3.46e-8, -9.45e-9, -3.31e-9, -1.37e-9, -6.41e-10, -3.27e-10, -1.79e-10, -1.04e-10 at r = 4 .. 12, falling as
// r^-6.49 over 6 .. 12 (B r^6 -8.0e-4 falling to -3.1e-4, second order -K^2 / (4 t) at 0.94 of B by r = 12):
// London's van der Waals, not 1/r. The reported odd share is large (56 to 312 times |B|). SECOND RUN
// (tmp/frc0253-run2.log), readings added, gates unchanged: each sign pattern is W = f1 f2 a(r) + B(r) with a(r)
// the first-order cross energy of the lumps' mean charges (1.09e-5 at r = 4 to 3.25e-8 at r = 12, about
// r^-5.3, quadrupole on quadrupole): like lumps repel and a lump and its flipped copy attract at first order,
// and only B, a hundred to three hundred times smaller, is even. Degenerate lumps (t = 0) orient and attract as
// r^-3.41, also charge-blind and also not 1/r. Title written after the first run.
//
// DISCLOSED: no probe of this file's readings ran before the gates. DETERMINISM: nothing is drawn. Depth: L1 for V1
// (an identity), L2 for V2 and V3 (the light's own static form with a quantum lump).

import { experiment } from '@/test/scaffold/suite'
import { verdict } from '@/test/scaffold/verdict'
import { infiniteGreenDifferences } from '@/code/measure/husk-coulomb'

const DEPTH = 32
const T = (2 * Math.PI) / 1024
const RS = [4, 5, 6, 7, 8, 9, 10, 11, 12]
const SIGNS: readonly [number, number][] = [
  [1, 1],
  [1, -1],
  [-1, 1],
  [-1, -1],
]

// Jacobi eigenvalues and vectors of a small symmetric matrix (measurement)
function eigenSymmetric(a0: number[][]): {
  values: number[]
  vectors: number[][]
} {
  const n = a0.length
  const a = a0.map(r => r.slice())
  const v: number[][] = Array.from({ length: n }, (_, i) =>
    Array.from({ length: n }, (_, j) => (i === j ? 1 : 0)),
  )

  for (let sweep = 0; sweep < 100; sweep++) {
    let off = 0

    for (let i = 0; i < n; i++) {
      for (let j = i + 1; j < n; j++) {
        off += a[i]![j]! ** 2
      }
    }

    if (off < 1e-40) {
      break
    }

    for (let p = 0; p < n; p++) {
      for (let q = p + 1; q < n; q++) {
        if (Math.abs(a[p]![q]!) < 1e-300) {
          continue
        }

        const theta = (a[q]![q]! - a[p]![p]!) / (2 * a[p]![q]!)
        const t =
          Math.sign(theta || 1) /
          (Math.abs(theta) + Math.sqrt(theta * theta + 1))
        const c = 1 / Math.sqrt(t * t + 1)
        const s = t * c

        for (let k = 0; k < n; k++) {
          const akp = a[k]![p]!
          const akq = a[k]![q]!

          a[k]![p] = c * akp - s * akq
          a[k]![q] = s * akp + c * akq
        }

        for (let k = 0; k < n; k++) {
          const apk = a[p]![k]!
          const aqk = a[q]![k]!

          a[p]![k] = c * apk - s * aqk
          a[q]![k] = s * apk + c * aqk
        }

        for (let k = 0; k < n; k++) {
          const vkp = v[k]![p]!
          const vkq = v[k]![q]!

          v[k]![p] = c * vkp - s * vkq
          v[k]![q] = s * vkp + c * vkq
        }
      }
    }
  }

  return {
    values: a.map((r, i) => r[i]!),
    vectors: Array.from({ length: n }, (_, j) => v.map(r => r[j]!)),
  }
}

function slope(xs: number[], ys: number[]): number {
  const lx = xs.map(Math.log)
  const ly = ys.map(Math.log)
  const mx = lx.reduce((a, b) => a + b, 0) / lx.length
  const my = ly.reduce((a, b) => a + b, 0) / ly.length

  let num = 0
  let den = 0

  lx.forEach((x, i) => {
    num += (x - mx) * (ly[i]! - my)
    den += (x - mx) ** 2
  })

  return num / den
}

export default experiment({
  id: 'gauge/induced-neutral-residue',
  code: 'E-FRC-0253',
  title:
    "the even second-order residue between two neutral lumps is van der Waals, not gravity, fail on V3 alone: two two-level love-fear lumps on the husk x axis reading the light's static Coulomb form (D 32, tunneling 2 pi / 1024, non-retarded) attract charge-blind by -1.96e-7 at r = 4 falling to -1.04e-10 at r = 12, as r^-6.49 over r = 6 .. 12 (London's r^-6 with higher multipoles; second order -K^2 / (4 t) at 0.94 of it by r = 12), where fixed lumps give exactly 0; the odd first-order quadrupole term f1 f2 a(r), about r^-5.3, is 56 to 312 times larger, so like lumps repel and a lump and its flipped copy attract; degenerate lumps (no tunneling) orient and attract as r^-3.41; no charge-blind 1/r term",
  category: 'gauge',
  substrates: ['3434'],
  depth: 'L2',
  paper: false,
  run() {
    const started = Date.now()
    const distances = Array.from({ length: 16 }, (_, d) => d)
    const green = infiniteGreenDifferences(
      'husk',
      64,
      distances.map(d => [d, 0, 0]),
    )
    const V = (d: number): number => green.value[Math.abs(d)]!
    const scale = Math.PI / DEPTH
    // the cross energy of lump 1 (f1 at 0, -f1 at s1) and lump 2 (f2 at r, -f2 at r + s2)
    const cross = (
      f1: number,
      f2: number,
      s1: number,
      s2: number,
      r: number,
    ): number =>
      -scale *
      (f1 * f2 * V(r) -
        f1 * f2 * V(r + s2) -
        f1 * f2 * V(r - s1) +
        f1 * f2 * V(r + s2 - s1))

    let worstResidual = 0

    const W = (
      f1: number,
      f2: number,
      r: number,
      t: number,
    ): number => {
      // basis (s1, s2): (+,+), (+,-), (-,+), (-,-)
      const states: [number, number][] = [
        [1, 1],
        [1, -1],
        [-1, 1],
        [-1, -1],
      ]
      const h = states.map((a, i) =>
        states.map((b, j) => {
          if (i === j) {
            return cross(f1, f2, a[0], a[1], r)
          }

          const flips =
            (a[0] !== b[0] ? 1 : 0) + (a[1] !== b[1] ? 1 : 0)

          return flips === 1 ? -t : 0
        }),
      )
      const { values, vectors } = eigenSymmetric(h)

      let k = 0

      values.forEach((v, i) => (k = v < values[k]! ? i : k))

      const vec = vectors[k]!

      for (let i = 0; i < 4; i++) {
        const hv = h[i]!.reduce((a, x, j) => a + x * vec[j]!, 0)

        worstResidual = Math.max(
          worstResidual,
          Math.abs(hv - values[k]! * vec[i]!),
        )
      }

      return values[k]! + 2 * t
    }

    const blindOf = (g: (f1: number, f2: number) => number): number =>
      SIGNS.reduce((a, [f1, f2]) => a + g(f1, f2), 0) / 4
    const fixedBlind = RS.map(r =>
      blindOf((f1, f2) => cross(f1, f2, 1, 1, r)),
    )
    const B = RS.map(r => blindOf((f1, f2) => W(f1, f2, r, T)))
    const oddShare = RS.map(
      (r, i) =>
        Math.max(
          ...SIGNS.map(([f1, f2]) => Math.abs(W(f1, f2, r, T) - B[i]!)),
        ) / Math.abs(B[i]!),
    )
    const degenerate = RS.map(r =>
      blindOf((f1, f2) =>
        Math.min(...SIGNS.map(([s1, s2]) => cross(f1, f2, s1, s2, r))),
      ),
    )
    // second order: the dipole-dipole coupling K is the s1 s2 part of V_cross
    const K = RS.map(
      r =>
        SIGNS.reduce(
          (a, [s1, s2]) => a + s1 * s2 * cross(1, 1, s1, s2, r),
          0,
        ) / 4,
    )
    const pt2 = K.map(k => -(k * k) / (4 * T))
    const g1 =
      fixedBlind.every(x => Math.abs(x) < 1e-15) &&
      worstResidual < 1e-14
    const g2 =
      B.every(x => x < 0) && B.every((x, i) => i === 0 || x > B[i - 1]!)
    const far = RS.map((r, i) => [r, B[i]!] as const).filter(
      ([r]) => r >= 6,
    )
    const slopeFar = slope(
      far.map(([r]) => r),
      far.map(([, b]) => Math.abs(b)),
    )
    const slopeAll = slope(RS, B.map(Math.abs))
    const g3 = slopeFar >= -1.2 && slopeFar <= -0.8
    const status = !g1 ? 'partial' : g2 && g3 ? 'pass' : 'fail'
    const degenerateSlope = slope(RS, degenerate.map(Math.abs))
    const list = (xs: number[], d = 3): string =>
      xs.map(x => x.toExponential(d)).join(', ')
    const metrics: Record<string, number> = {
      gate_V1: g1 ? 1 : 0,
      gate_V2: g2 ? 1 : 0,
      gate_V3: g3 ? 1 : 0,
      worstFixedBlind: Math.max(...fixedBlind.map(Math.abs)),
      worstResidual,
      slopeFar,
      slopeAll,
      degenerateSlope,
      worstOddShare: Math.max(...oddShare),
      greenImageChange: Math.max(
        ...distances.map((_, i) =>
          Math.abs(green.large[i]! - green.small[i]!),
        ),
      ),
    }

    // readings added after the first run (tmp/frc0253-run1.log), gates unchanged: each sign pattern, and the
    // first-order part the odd share comes from, the s-averaged cross energy (the lumps' mean charge distributions)
    const firstOrder = RS.map(
      r =>
        SIGNS.reduce((a, [s1, s2]) => a + cross(1, 1, s1, s2, r), 0) /
        4,
    )

    RS.forEach((r, i) => {
      metrics[`W_pp_r${r}`] = W(1, 1, r, T)
      metrics[`W_pm_r${r}`] = W(1, -1, r, T)
      metrics[`W_mp_r${r}`] = W(-1, 1, r, T)
      metrics[`W_mm_r${r}`] = W(-1, -1, r, T)
      metrics[`firstOrder_r${r}`] = firstOrder[i]!
      metrics[`blind_r${r}`] = B[i]!
      metrics[`blindR6_r${r}`] = B[i]! * r ** 6
      metrics[`pt2_r${r}`] = pt2[i]!
      metrics[`degenerateBlind_r${r}`] = degenerate[i]!
      metrics[`oddShare_r${r}`] = oddShare[i]!
    })

    metrics.seconds = (Date.now() - started) / 1000

    return verdict({
      status,
      claim: `two neutral two-level lumps on the husk x axis reading the light's static form (D 32, tunneling 2 pi / 1024): the charge-blind part of their interaction is ${list(B)} at r = 4 .. 12, falling as r^${slopeFar.toFixed(2)} over 6 .. 12 (r^${slopeAll.toFixed(2)} over 4 .. 12); fixed lumps give a charge-blind part of at most ${metrics.worstFixedBlind!.toExponential(1)}; degenerate lumps (t = 0) ${list(degenerate)}, r^${degenerateSlope.toFixed(2)}`,
      metrics,
      control: {
        fixedBlind: metrics.worstFixedBlind!,
        degenerateSlope,
      },
      notes: `L1 (V1), L2 (V2, V3). Gates V1 ${g1}, V2 ${g2}, V3 ${g3}. Per r = 4 .. 12: B r^6 ${RS.map((r, i) => (B[i]! * r ** 6).toExponential(4)).join(', ')}; second-order -K^2 / (4 t) ${list(pt2)}; the four sign patterns' largest departure from B, as a share of |B|: ${oddShare.map(x => x.toExponential(2)).join(', ')}; the Green's difference's change between the two tori at most ${metrics.greenImageChange!.toExponential(2)}. ${((Date.now() - started) / 1000).toFixed(1)} s.`,
    })
  },
})
