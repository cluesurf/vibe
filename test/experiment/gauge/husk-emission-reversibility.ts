// E-FRC-0194. Emission runs backward: a STAND-IN emitter coupled minimally to the EXACTLY LINEAR husk leapfrog
// (the linear rule of E-FRC-0179) radiates its excitation away, and running every beat backward gathers the light
// back in and re-excites it, with Gauss's law exact in both directions. The emitter is a STAND-IN (a one-link
// dimer); nothing here is L3.
//
// The coupled beat (code/measure/stand-in-light dimerBeat) is a composite of three exactly invertible maps: the
// angle takes the flux (a <- a + e), the dimer steps by its own unitary in the Peierls phase of the new angle, and
// the flux takes the curl-curl force and exactly the charge the dimer's step moved. dimerBeatBack undoes them in
// the reverse order. So the whole map is a bijection, and the arrow of emission (light leaving, never returning on
// its own) is a statement about starts, not about the rule. The model's own rule is reversible in integers; the
// linear rule is not an integer rule (kappa is irrational), so here "exact" means to rounding, and the test says
// how far rounding goes.
//
// PREDICTIONS, written before the first run: forward, the excitation falls by e^(-A t) (E-FRC-0192) and the flux's
// husk divergence equals the charge at every dock and beat; backward the same number of beats, every link angle,
// every flux and both dimer amplitudes return to their start to rounding (about 1e-13 of their size), and the
// excitation to its start. CONTROL: a change of 1e-6 in one link's angle at the turn does not grow chaotically
// (the rule is linear in the field): the start is missed by an amount proportional to the change.
//
// Method: a 32^3 husk torus, the dimer on an axis link (omega0 = 0.3, charge 1.6, so A near 0.045 per beat),
// started with sin^2(0.1) of the excited level and no field, 150 beats forward and 150 back. No random numbers.
//
// Gates, fixed before the first run:
// 1. EMISSION HAPPENED: the excitation after 150 beats forward is under 1/50 of its start
// 2. IT RUNS BACK: after 150 beats back, every angle, flux and amplitude is within 1e-10 of its start, and the
//    excitation within 1e-10 (relative) of its start
// 3. GAUSS: the flux's husk divergence equals the charge at every dock, checked every 10 beats both ways, to 1e-12
// 4. CONTROL: with 1e-6 added to one link's angle at the turn, the start is missed by at least 1e-9 and at most
//    1e-3 (the change carried, not amplified by more than 1e3)
// Pass: all four. Partial: 1, 2 and 3. Fail: otherwise.
//
// Depth L2: reversibility of a chosen stand-in coupled to the model's exact linear light.

import { experiment } from '@/test/scaffold/suite'
import { verdict } from '@/test/scaffold/verdict'
import { H, readHuskStencil } from '@/code/measure/husk-emission'
import { dimerBeat, dimerBeatBack, linkDivergence, makeRealSpace, type DimerState } from '@/code/measure/stand-in-light'

const SIDE = 32
const OMEGA0 = 0.3
const CHARGE = 1.6
const BEATS = 150
const CHI = 0.1

function start(links: number): DimerState {
  return {
    a: new Float64Array(links),
    e: new Float64Array(links),
    c0r: Math.cos(CHI) / Math.SQRT2,
    c0i: Math.sin(CHI) / Math.SQRT2,
    c1r: Math.cos(CHI) / Math.SQRT2,
    c1i: -Math.sin(CHI) / Math.SQRT2,
  }
}

// the dimer's excited level in its current Peierls phase theta = q a / w: (|0> - e^(-i theta) |1>) / sqrt 2
function excitation(s: DimerState): number {
  const theta = (CHARGE * s.a[0]!) / 2
  const xr = Math.cos(theta) * s.c1r - Math.sin(theta) * s.c1i
  const xi = Math.cos(theta) * s.c1i + Math.sin(theta) * s.c1r

  return ((s.c0r - xr) ** 2 + (s.c0i - xi) ** 2) / 2
}

// the largest departure of s from the start
function miss(s: DimerState, s0: DimerState): number {
  let worst = Math.max(Math.abs(s.c0r - s0.c0r), Math.abs(s.c0i - s0.c0i), Math.abs(s.c1r - s0.c1r), Math.abs(s.c1i - s0.c1i))

  for (let i = 0; i < s.a.length; i++) {
    worst = Math.max(worst, Math.abs(s.a[i]! - s0.a[i]!), Math.abs(s.e[i]! - s0.e[i]!))
  }

  return worst
}

export default experiment({
  id: 'gauge/husk-emission-reversibility',
  code: 'E-FRC-0194',
  title:
    'emission on the husk runs backward: a stand-in emitter coupled to the exactly linear husk leapfrog radiates its excitation away in 150 beats, and 150 beats run backward gather the light back and re-excite it to rounding, with Gauss law exact both ways and a small change at the turn carried rather than amplified',
  category: 'gauge',
  substrates: ['3434'],
  depth: 'L2',
  paper: false,
  run() {
    const metrics: Record<string, number> = {}
    const stencil = readHuskStencil(8)
    const space = makeRealSpace(stencil, SIDE)
    const links = SIDE ** 3 * H
    const dimer = { space, dock: 0, h: 0, omega0: OMEGA0, charge: CHARGE, scratch: new Float64Array(links) }
    const s0 = start(links)
    const s = start(links)
    let gauss = 0
    const check = (): void => {
      const div = linkDivergence(SIDE, s.e)
      const rho0 = CHARGE * (s.c0r ** 2 + s.c0i ** 2 - 0.5)
      const rho1 = CHARGE * (s.c1r ** 2 + s.c1i ** 2 - 0.5)

      for (let i = 0; i < div.length; i++) {
        gauss = Math.max(gauss, Math.abs(div[i]! - (i === 0 ? rho0 : i === 1 ? rho1 : 0)))
      }
    }

    for (let t = 1; t <= BEATS; t++) {
      dimerBeat(dimer, s)

      if (t % 10 === 0) {
        check()
      }
    }

    const turned = excitation(s) / excitation(s0)
    let fieldEnergy = 0

    for (let i = 0; i < links; i++) {
      fieldEnergy += s.e[i]! ** 2
    }

    const snapshot: DimerState = { a: Float64Array.from(s.a), e: Float64Array.from(s.e), c0r: s.c0r, c0i: s.c0i, c1r: s.c1r, c1i: s.c1i }

    for (let t = 1; t <= BEATS; t++) {
      dimerBeatBack(dimer, s)

      if (t % 10 === 0) {
        check()
      }
    }

    const back = miss(s, s0)
    const excitationBack = Math.abs(excitation(s) / excitation(s0) - 1)

    // the control: the same turn with one angle changed
    const c: DimerState = { a: Float64Array.from(snapshot.a), e: Float64Array.from(snapshot.e), c0r: snapshot.c0r, c0i: snapshot.c0i, c1r: snapshot.c1r, c1i: snapshot.c1i }
    const probe = (SIDE / 2 + SIDE * (SIDE / 2 + SIDE * (SIDE / 2))) * H

    c.a[probe] = c.a[probe]! + 1e-6

    for (let t = 1; t <= BEATS; t++) {
      dimerBeatBack(dimer, c)
    }

    const perturbed = miss(c, s0)

    metrics.excitationAfterForward = turned
    metrics.fieldFluxSquaredAtTurn = fieldEnergy
    metrics.returnMiss = back
    metrics.excitationReturnMiss = excitationBack
    metrics.gaussWorst = gauss
    metrics.perturbedReturnMiss = perturbed
    metrics.perturbationGain = perturbed / 1e-6

    const gate1 = turned < 1 / 50
    const gate2 = back <= 1e-10 && excitationBack <= 1e-10
    const gate3 = gauss <= 1e-12
    const gate4 = perturbed >= 1e-9 && perturbed <= 1e-3
    const status = gate1 && gate2 && gate3 && gate4 ? 'pass' : gate1 && gate2 && gate3 ? 'partial' : 'fail'

    return verdict({
      status,
      claim: `a stand-in emitter on the husk keeps ${turned.toExponential(2)} of its excitation after 150 beats of emission into the exactly linear leapfrog, and 150 beats run backward return every angle, flux and amplitude to ${back.toExponential(1)} of the start and the excitation to ${excitationBack.toExponential(1)}, Gauss law held to ${gauss.toExponential(1)}; a change of 1e-6 at the turn misses the start by ${perturbed.toExponential(2)}`,
      metrics: {
        ...metrics,
        gateEmissionHappened: gate1 ? 1 : 0,
        gateRunsBack: gate2 ? 1 : 0,
        gateGauss: gate3 ? 1 : 0,
        gateControl: gate4 ? 1 : 0,
      },
      notes:
        'L2, a STAND-IN emitter in the LINEAR rule, in floats (the linear rule is not an integer rule, so exact means to rounding). The emitted light spreads over the torus and is gathered back only because every beat is inverted, which is what reversibility means for the model: the arrow of emission is in the start, not in the rule. Husk only.',
    })
  },
})
