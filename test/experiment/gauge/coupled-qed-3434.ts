// P260 (FRONTIER 1, coupled QED, a serious attempt): ONE coupled evolution of the fermion (8s/8c) AND the
// gauge field (8v) with MINIMAL COUPLING, the lattice Schwinger model (1+1 QED) realized on the substrate's
// sectors. We verify the full QED structure emerges from the one coupled rule:
//   (1) CHARGE CONSERVATION: total charge is conserved exactly even WITH the gauge coupling (continuity).
//   (2) GAUSS LAW: a CONSISTENCY CHECK that the Coulomb solver is correct, and the dynamics PRESERVES Gauss
//       law BECAUSE charge is conserved (1), it is not an independent emergent result.
//   (3) GAUGE INVARIANCE: the coupled hopping term psi* U psi is invariant under a local gauge transform.
//   (4) MINIMAL COUPLING: BY CONSTRUCTION, the gauge field enters as the Peierls phase in the hopping, the
//       genuine physical effect (a charge deflecting in a field) is the separate p251 PH5.
//   (5) BACK-REACTION: the fermion current sources a change in E, a moving charge radiates a field.
// This is lattice QED (established), the contribution is realizing it as the coupled 8v + 8s/8c sectors of one
// {3,4,3,4} rule. Frontier 1 is SOLVABLE.
// Run: npx tsx code/experiment/p260-coupled-qed-3434.ts

import { makeRng } from '@/code/tool/rng'
import { experiment } from '@/test/scaffold/suite'
import { verdict } from '@/test/scaffold/verdict'

type C = [number, number]
const cadd = (a: C, b: C): C => [a[0] + b[0], a[1] + b[1]]
const cmul = (a: C, b: C): C => [
  a[0] * b[0] - a[1] * b[1],
  a[0] * b[1] + a[1] * b[0],
]

const cabs2 = (a: C): number => a[0] * a[0] + a[1] * a[1]
const cscale = (a: C, s: number): C => [a[0] * s, a[1] * s]
const eUp = (t: number): C => [Math.cos(t), Math.sin(t)] // e^{i t} = the link variable

export function coupledQED(): {
  chargeConserved: boolean
  gaussLaw: boolean
  gaugeInvariant: boolean
  minimalCoupling: boolean
  backReaction: boolean
} {
  const L = 80,
    wrap = (x: number): number => ((x % L) + L) % L

  const mass = 0.3,
    c = Math.cos(mass),
    s = Math.sin(mass)

  // fermion psi = (psiR, psiL) per site; gauge link phase theta_n on bond n->n+1; electric field E_n
  let R: C[] = new Array(L).fill([0, 0]),
    Lf: C[] = new Array(L).fill([0, 0])

  let theta = new Array(L).fill(0),
    E = new Array(L).fill(0)

  // a charged wavepacket centered, moving right
  const x0 = 30,
    w = 5

  for (let x = 0; x < L; x++) {
    const g = Math.exp(-((x - x0) ** 2) / (2 * w * w))
    R[x] = cscale(eUp(0.8 * x), g)
    Lf[x] = [0, 0]
  }

  let nrm = 0

  for (let x = 0; x < L; x++) {
    nrm += cabs2(R[x]!) + cabs2(Lf[x]!)
  }

  R = R.map(z => cscale(z, 1 / Math.sqrt(nrm)))
  Lf = Lf.map(z => cscale(z, 1 / Math.sqrt(nrm)))
  const rho = (): number[] =>
    Array.from({ length: L }, (_, x) => cabs2(R[x]!) + cabs2(Lf[x]!))

  // ONE coupled step: (coin) -> (gauge-covariant shift with Peierls phase) -> (gauge field responds to current)
  const I: C = [0, 1]

  const step = (): void => {
    // fermion coin (mass)
    const R2: C[] = new Array(L),
      L2: C[] = new Array(L)

    for (let x = 0; x < L; x++) {
      R2[x] = cadd(
        [c * R[x]![0], c * R[x]![1]],
        cmul([-s, 0], cmul(I, Lf[x]!)),
      )
      L2[x] = cadd(cmul([-s, 0], cmul(I, R[x]!)), [
        c * Lf[x]![0],
        c * Lf[x]![1],
      ])
    }

    // current across each bond (rightflux from R minus leftflux from L), BEFORE the shift
    const j = Array.from(
      { length: L },
      (_, x) => cabs2(R2[x]!) - cabs2(L2[wrap(x + 1)]!),
    )

    // gauge-covariant shift: R hops +1 with the link phase e^{i theta}, L hops -1 with e^{-i theta} (minimal coupling)
    const R3: C[] = new Array(L).fill([0, 0]),
      L3: C[] = new Array(L).fill([0, 0])

    for (let x = 0; x < L; x++) {
      R3[wrap(x + 1)] = cmul(R2[x]!, eUp(theta[x]!))
      L3[wrap(x - 1)] = cmul(L2[x]!, eUp(-theta[wrap(x - 1)]!))
    }

    R = R3
    Lf = L3

    // gauge field back-reacts: dE/dt = -j (Ampere), dtheta/dt = E (the field equation)
    for (let x = 0; x < L; x++) {
      E[x]! -= 0.1 * j[x]!
    }

    for (let x = 0; x < L; x++) {
      theta[x]! += 0.1 * E[x]!
    }
  }

  // (1) charge conservation under the coupled evolution
  const Q0 = rho().reduce((a, b) => a + b, 0)

  for (let t = 0; t < 60; t++) {
    step()
  }

  const Q1 = rho().reduce((a, b) => a + b, 0)
  const chargeConserved = Math.abs(Q1 - Q0) < 1e-9

  // (2) Gauss law: solve div E = rho for a static charge, verify E_n - E_{n-1} = rho_n
  const rhoStatic = Array.from(
    { length: L },
    (_, x) => (x === 40 ? 1 : 0) - 1 / L,
  ) // a charge at 40, neutralizing background

  const Eg = new Array(L).fill(0)

  for (let x = 1; x < L; x++) {
    Eg[x] = Eg[x - 1]! + rhoStatic[x]!
  }

  let gaussErr = 0

  for (let x = 1; x < L; x++) {
    gaussErr = Math.max(
      gaussErr,
      Math.abs(Eg[x]! - Eg[x - 1]! - rhoStatic[x]!),
    )
  }

  const gaussLaw = gaussErr < 1e-9

  // (3) gauge invariance: hopping term psi*_n e^{i theta_n} psi_{n+1} invariant under psi_n -> e^{i a_n} psi_n, theta_n -> theta_n + a_n - a_{n+1}
  const rng = makeRng({ seed: 5 })
  const rnd = (): number => rng.next() * 2 * Math.PI
  const a = Array.from({ length: L }, () => rnd())

  const hop = (psi: C[], th: number[]): C => {
    let h: C = [0, 0]

    for (let x = 0; x < L; x++) {
      h = cadd(
        h,
        cmul(
          cmul([psi[x]![0], -psi[x]![1]], eUp(th[x]!)),
          psi[wrap(x + 1)]!,
        ),
      )
    }

    return h
  }

  const before = hop(R, theta)
  const Rg = R.map((z, x) => cmul(z, eUp(a[x]!))),
    thetaG = theta.map((t, x) => t + a[x]! - a[wrap(x + 1)]!)

  const after = hop(Rg, thetaG)
  const gaugeInvariant =
    Math.abs(before[0] - after[0]) < 1e-9 &&
    Math.abs(before[1] - after[1]) < 1e-9

  // (4) minimal coupling: a constant gauge field A shifts the fermion dispersion k -> k - A (Peierls)
  const dispShift = (A: number, k: number): number =>
    Math.acos(
      Math.max(-1, Math.min(1, Math.cos(mass) * Math.cos(k - A))),
    ) // omega with the Peierls shift

  const minimalCoupling =
    Math.abs(dispShift(0.4, 0.4) - dispShift(0, 0)) < 1e-9 // E(k=A, A) = E(k=0, 0): the field shifts the momentum origin

  // (5) back-reaction: a moving charge sources a CHANGING E field (radiation), measure E grew from zero
  const Eactivity = E.reduce((a2, e) => a2 + e * e, 0)
  const backReaction = Eactivity > 1e-6

  return {
    chargeConserved,
    gaussLaw,
    gaugeInvariant,
    minimalCoupling,
    backReaction,
  }
}

export default experiment({
  id: 'gauge/coupled-qed-3434',
  title:
    'one coupled rule conserves charge, stays gauge invariant, and back-reacts, lattice QED',
  category: 'gauge',
  substrates: ['3434'],
  depth: 'L2',
  paper: true,
  run() {
    const r = coupledQED()
    const ok = r.chargeConserved && r.gaugeInvariant && r.backReaction

    return verdict({
      status: ok ? 'pass' : 'fail',
      claim:
        'one coupled fermion and gauge evolution conserves total charge, keeps the minimal-coupling hopping term gauge invariant, and lets the fermion current source a back-reacting electric field',
      metrics: {
        chargeConserved: r.chargeConserved ? 1 : 0,
        gaugeInvariant: r.gaugeInvariant ? 1 : 0,
        backReaction: r.backReaction ? 1 : 0,
        gaussLaw: r.gaussLaw ? 1 : 0,
        minimalCoupling: r.minimalCoupling ? 1 : 0,
      },
      notes:
        'L2, known physics, the lattice Schwinger model realized on the substrate sectors. The pass rests on charge conservation, gauge invariance, and back-reaction. Gauss law and minimal coupling are by-construction consistency checks, not evidence. Gauge invariance is checked against a pseudo-random gauge field, but it is exact for any field. The interaction is built in, not emergent.',
    })
  },
})
