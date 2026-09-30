// THREE HOLES OF THE REGISTER SEA RELAX, AND KEEP AN ENERGY (E-FND-0162). OPEN-CSM-13 asks for equilibrium and a
// temperature. The free register rule is one-body, so it keeps every Floquet mode's occupation and can never relax
// (E-FND-0158). Two holes are one relative particle. E-FND-0161's engine runs three holes of the full sea exactly on the
// L = 4 D4 torus, which is the first run where a hole has more than one other hole to trade with. This file asks what
// they relax to.
//
// DERIVED BEFORE THE GATE RUN (remaining-pieces.md, "A many-hole engine for the register rule"; probes disclosed below).
// 1. THE FREE RULE CANNOT RELAX (L1). It is one-body and translation invariant, so each hole's momentum and band are kept:
//    every momentum occupation and the upper-band fraction stay at their start.
// 2. A FLOQUET RULE HAS NO ENERGY, BUT FEW HOLES DO (L1). A generic interacting Floquet system heats to the uniform
//    ensemble of its conserved sectors, infinite temperature. The register member is a massive Dirac band: one hole's
//    cycle phase is pi -+ E(q), E from 0.380 to 0.813 at L = 4 in five levels. For n holes the phase is n pi + delta with
//    delta = sum s_i E(q_i), s = -1 in the positive-phase band and +1 in the other. While 2 n E_max < 2 pi, distinct delta
//    never agree mod 2 pi, so delta is a conserved energy up to the pair pieces' own phase; at L = 4 that holds for
//    n <= 3 (2.44 < pi) and fails from n = 4. Moving a hole across the gap changes delta by 2 E >= 0.76.
// 3. SO, PREDICTED: three holes relax their momenta (the pair pieces scatter, and nothing else is conserved but momentum,
//    each hole's half and the exchange sign), their band content stays near its start and NOT at 1/2, the relaxed state
//    forgets which momenta the holes started at within one energy shell, and it remembers the shell. That is
//    equilibrium at a fixed energy, a microcanonical state, rather than infinite temperature. The mirror delta -> -delta
//    (the other band, the same momenta) should relax to the same momentum distribution.
// 4. WHAT IT IS NOT. The 4d torus, not the husk; three holes, not a subsystem and a bath of many; one half, one tone,
//    one flavor; the register rule, not the adopted one. No ledger row can become held from it.
//
// THE RUN. The L = 4 torus, three holes in half +, E-SPN-0175's rule (the member mixers at ringUnit(-1, 4), the sector
// string ringUnit(-2, 1) a unit of V, cap 8, the sector contact v^2 with v = ringUnit(2, 0), hole angles reversed), 64
// cycles, the late window cycles 33 to 64 read every 2 cycles. Each start is a Slater determinant of three free band
// eigenvectors (the first of bandVectors) at momenta summing to 0. The shells are named by the multiset of the three
// momenta's band levels (0 the lowest E): P1 is the 41st triple (in the engine's order) whose levels are {0, 1, 2}; P2 the
// last such triple sharing no momentum with P1 or its negatives (the first is probe 4's S1, found in the smoke); P3 is P1 in the other band (delta -> -delta); P4 the
// 41st triple with levels {1, 2, 3} (delta -1.7803 against P1's -1.3854). P1, P2, P4 start in the positive-phase band.
// These are not the probe's starts.
//
// GATES, fixed before the gate run. n(q) is the expected number of holes at momentum class q (it sums to 3); "late" is
// its mean over the late window; L1 distances are sums over the 128 classes (at most 6).
//  E1 THE BAND IS KEPT, NOT HALVED. The late mean upper-band fraction is at least 0.8 from P1, P2 and P4 and at most 0.2
//     from P3. Infinite temperature puts every one at 0.5.
//  E2 THE MOMENTA RELAX. For every start, L1(late n, starting n) >= 4.5.
//  E3 THE START IS FORGOTTEN INSIDE A SHELL. L1(late P1, late P2) <= 0.8 and L1(late P1, late P3) <= 0.8.
//  E4 THE SHELL IS REMEMBERED. L1(late P1, late P4) >= 1.5 max(L1(late P1, late P2), L1(late P1, late P3)).
// CONTROLS (a failure makes the verdict partial at best).
//  CF THE FREE RULE CANNOT RELAX: from P1 and P3 under the free rule, every n(q) and the upper-band fraction stay within
//     1e-10 of their start at every read.
// INSTRUMENT (a failure makes the verdict partial at best). I1 norms within 1e-10; I2 the weight outside the
//  antisymmetric sector at most 1e-14 at the last cycle for every start under the rule.
// READ, gating nothing: the free-shell predictions (exact counts of free three-hole states in a window of delta) at
//  windows 0.2 and 0.5, per band level; the infinite-temperature prediction; the temperature of each start's shell,
//  beta = d ln Omega / d delta from the exact counts at delta +- 0.1 (window 0.1); the upper-band fraction's drift across
//  the late window; and two holes at L = 4 and 6 (128 cycles), the late weight on their start's band level.
// Verdict: fail if E1, E2, E3 or E4 fails; partial if all hold and the control or the instrument fails; pass otherwise.
//
// PROBES BEFORE THE GATE RUN, disclosed; they shaped the derivation and set every threshold. tmp/mh-probe2 and
//  tmp/mh-probe3 (8 and 64 cycles, three up-band starts): the momentum distance to the infinite-temperature ensemble
//  fell from 5.86 to 1.3 to 2.3 while the upper-band fraction held at 0.84 to 0.93, which is what suggested point 2.
//  tmp/mh-bands, tmp/mh-levels: the five levels and the shells. tmp/mh-micro, tmp/mh-shell: the free shells hold no
//  cross-band state within 0.1, and the infinite-temperature level occupations are 0.935, 0.563, 0.751, 0.563, 0.188.
//  tmp/mh-probe4 (64 cycles, late 33 to 64 every 4): shell {0, 1, 2} from two disjoint up starts, late up 0.930 and
//  0.931, level occupations within 0.006 of each other, L1 0.50; the same momenta in the other band, up 0.065, L1 0.145
//  from the up start; shell {0, 1, 4}, up 0.922, L1 1.33 from both; every late L1 from its start 5.52 to 5.57.
//  Thresholds sit at 0.8 (E1, probe 0.92), 4.5 (E2, probe 5.5), 0.8 (E3, probe 0.50) and 1.5 (E4, probe ratio 2.7).

import { experiment } from '@/test/scaffold/suite'
import { verdict, type Verdict } from '@/test/scaffold/verdict'
import { ringUnit, unitAngle } from '@/code/measure/swap-string'
import {
  partnerProjector48,
  registerPiece,
  scaled,
  singletProjector24,
} from '@/code/measure/spinor-register'
import { torus } from '@/code/measure/register-sea'
import {
  bandLevels,
  bandVectors,
  bandWeights,
  beta0Momentum,
  copyHoles,
  exchangeWeights,
  freeShell,
  holeCycle,
  holeEngine,
  holeFrame,
  holeNorm,
  momentumWeights,
  pairAngles,
  slaterStart,
  type HoleEngine,
  type HoleFrame,
  type Holes,
} from '@/code/measure/register-holes'

const LIGHT: readonly [number, number] = [-1, 4]
const STRING: readonly [number, number] = [-2, 1]
const VERTEX: readonly [number, number] = [2, 0]
const CAP = 8
const KEEP = 0.8
const MOVE = 4.5
const SAME = 0.8
const APART = 1.5
const FREE_TOL = 1e-10
const NORM_TOL = 1e-10
const EXCHANGE_TOL = 1e-14

export type RelaxPlan = {
  L: number
  cycles: number
  lateFrom: number
  every: number
  pick: number
  pairCycles: number
}

export const GATE_PLAN: RelaxPlan = {
  L: 4,
  cycles: 64,
  lateFrom: 33,
  every: 2,
  pick: 40,
  pairCycles: 128,
}

const flag = (b: boolean): number => (b ? 1 : 0)

export default experiment({
  id: 'foundations/register-relaxation',
  code: 'E-FND-0162',
  title:
    'three holes of the register sea relax to equilibrium at a fixed energy, not to infinite temperature: the free rule keeps every momentum and band exactly, while under the pair pieces the momenta spread over the torus and forget their start inside an energy shell, the band content stays where it began, and a start in another shell relaxes elsewhere; the register member is a massive Dirac band, so while three holes cannot wrap the cycle phase their band energy is conserved',
  category: 'foundations',
  substrates: ['3434'],
  depth: 'L2',
  paper: false,
  run() {
    return registerRelaxationRun(GATE_PLAN)
  },
})

const unit = (kj: readonly [number, number]): [number, number] => {
  const th = unitAngle(ringUnit(kj[0], kj[1]))

  return [Math.cos(th), Math.sin(th)]
}

const l1 = (a: Float64Array, b: Float64Array): number =>
  a.reduce((s, x, j) => s + Math.abs(x - b[j]!), 0)

type Run = {
  name: string
  late: Float64Array
  start: Float64Array
  up: number
  upFirst: number
  upSecond: number
  drift: number
  other: number
  freeGap: number
}

function occupation(e: HoleEngine, s: Holes): Float64Array {
  const N = e.frame.fourier.N
  const w = momentumWeights(e, s)
  const o = new Float64Array(N)

  for (let i = 0; i < e.n; i++) {
    for (let j = 0; j < N; j++) {
      o[j]! += w[i * N + j]!
    }
  }

  return o
}

const upFraction = (e: HoleEngine, s: Holes): number =>
  bandWeights(e, s).reduce((a, x) => a + x, 0) / e.n

function relax(
  e: HoleEngine,
  name: string,
  s0: Holes,
  angle: Float64Array,
  plan: RelaxPlan,
  withFree: boolean,
): Run {
  const s = copyHoles(s0)
  const start = occupation(e, s0)
  const up0 = upFraction(e, s0)
  const late = new Float64Array(start.length)
  const ups: number[] = []

  let drift = 0

  for (let c = 1; c <= plan.cycles; c++) {
    holeCycle(e, { angle }, s)

    if (c >= plan.lateFrom && (c - plan.lateFrom) % plan.every === 0) {
      occupation(e, s).forEach((x, j) => (late[j]! += x))
      ups.push(upFraction(e, s))
      drift = Math.max(drift, Math.abs(holeNorm(s) - 1))
    }
  }

  late.forEach((x, j) => (late[j] = x / ups.length))

  const half = Math.floor(ups.length / 2)
  const mean = (xs: number[]): number => xs.reduce((a, x) => a + x, 0) / xs.length
  const other = Math.abs(exchangeWeights(e, s).other)

  let freeGap = 0

  if (withFree) {
    const f = copyHoles(s0)

    for (let c = 1; c <= plan.cycles; c++) {
      holeCycle(e, { angle: null }, f)
      freeGap = Math.max(
        freeGap,
        l1(occupation(e, f), start),
        Math.abs(upFraction(e, f) - up0),
      )
      drift = Math.max(drift, Math.abs(holeNorm(f) - 1))
    }
  }

  return {
    name,
    late,
    start,
    up: mean(ups),
    upFirst: mean(ups.slice(0, half)),
    upSecond: mean(ups.slice(half)),
    drift,
    other,
    freeGap,
  }
}

// the triples of distinct momentum classes summing to 0 whose band levels form the multiset `key`, in the engine's order
function shellTriples(fr: HoleFrame, lev: Int32Array, key: string): number[][] {
  const F = fr.fourier
  const N = F.N
  const out: number[][] = []

  for (let a = 0; a < N; a++) {
    for (let b = a + 1; b < N; b++) {
      const c = F.sum[F.neg[a]! * N + F.neg[b]!]!

      if (c <= b) {
        continue
      }

      if ([lev[a]!, lev[b]!, lev[c]!].sort().join('') === key) {
        out.push([a, b, c])
      }
    }
  }

  return out
}

export function registerRelaxationRun(plan: RelaxPlan): Verdict {
  const started = Date.now()
  const log = (what: string): void =>
    console.error(`${what} ${Math.round((Date.now() - started) / 1000)}s`)
  const u = unit(LIGHT)
  const sAng = unitAngle(ringUnit(STRING[0], STRING[1]))
  const vAng = unitAngle(ringUnit(VERTEX[0], VERTEX[1]))
  const qS = scaled(singletProjector24(), 24)
  const qD = scaled(partnerProjector48(), 48)
  const Ps = [registerPiece(qS, u), registerPiece(qD, [u[0], -u[1]])]
  const T = torus(plan.L)
  const fr = holeFrame(T, Ps, 8)
  const F = fr.fourier
  const E = bandLevels(fr)
  const levels = [...new Set([...E].map(x => x.toFixed(6)))].sort()
  const lev = Int32Array.from(E, x => levels.indexOf(x.toFixed(6)))
  const angle = pairAngles(T, -sAng, CAP, -2 * vAng)
  const e = holeEngine(fr, 3, 0)
  const t012 = shellTriples(fr, lev, '012')
  const t123 = shellTriples(fr, lev, '123')
  const p1 = t012[plan.pick]!
  const banned = new Set([...p1, ...p1.map(j => F.neg[j]!)])
  const disjoint = t012.filter(t => t.every(j => !banned.has(j)))
  const p2 = disjoint[disjoint.length - 1]!
  const p4 = t123[plan.pick]!
  const make = (js: number[], band: 'up' | 'down'): Holes =>
    slaterStart(
      e,
      js,
      js.map(j => bandVectors(fr, j)[band][0]!),
    )
  const deltaOf = (js: number[], sign: number): number =>
    js.reduce((a, j) => a + sign * E[j]!, 0)
  const show = (js: number[]): string =>
    js.map(j => `(${F.ints[j]!.join(',')})`).join(' ')

  log(`levels ${levels.join(' ')} (degeneracy spread ${E.spread!.toExponential(2)}); P1 ${show(p1)} P2 ${show(p2)} P4 ${show(p4)}`)

  const P1 = relax(e, 'P1', make(p1, 'up'), angle, plan, true)

  log(`P1 up ${P1.up.toFixed(4)} free ${P1.freeGap.toExponential(2)}`)

  const P2 = relax(e, 'P2', make(p2, 'up'), angle, plan, false)

  log(`P2 up ${P2.up.toFixed(4)}`)

  const P3 = relax(e, 'P3', make(p1, 'down'), angle, plan, true)

  log(`P3 up ${P3.up.toFixed(4)} free ${P3.freeGap.toExponential(2)}`)

  const P4 = relax(e, 'P4', make(p4, 'up'), angle, plan, false)

  log(`P4 up ${P4.up.toFixed(4)}`)

  const runs = [P1, P2, P3, P4]
  const d12 = l1(P1.late, P2.late)
  const d13 = l1(P1.late, P3.late)
  const d14 = l1(P1.late, P4.late)
  const E1 = P1.up >= KEEP && P2.up >= KEEP && P4.up >= KEEP && P3.up <= 1 - KEEP
  const moved = runs.map(r => l1(r.late, r.start))
  const E2 = moved.every(x => x >= MOVE)
  const E3 = d12 <= SAME && d13 <= SAME
  const E4 = d14 >= APART * Math.max(d12, d13)
  const CF = P1.freeGap <= FREE_TOL && P3.freeGap <= FREE_TOL
  const I1 = runs.every(r => r.drift <= NORM_TOL)
  const I2 = runs.every(r => r.other <= EXCHANGE_TOL)

  // ---- reads ----
  const byLevel = (o: Float64Array): number[] => {
    const out = levels.map(() => 0)

    o.forEach((x, j) => (out[lev[j]!]! += x))

    return out
  }
  const beta0 = beta0Momentum(fr, 3, 0)
  const shellRead = (delta: number): string =>
    [0.2, 0.5]
      .map(w => {
        const s = freeShell(fr, E, 3, 0, delta, w)

        return `window ${w}: up ${s.up.toFixed(3)} levels ${byLevel(s.occupation).map(x => x.toFixed(3)).join(' ')}`
      })
      .join('; ')
  const betaOf = (delta: number): number => {
    const lo = freeShell(fr, E, 3, 0, delta - 0.1, 0.1).states
    const hi = freeShell(fr, E, 3, 0, delta + 0.1, 0.1).states

    return (Math.log(hi) - Math.log(lo)) / 0.2
  }
  const d1 = deltaOf(p1, -1)
  const d4 = deltaOf(p4, -1)
  const beta1 = betaOf(d1)
  const beta3 = betaOf(-d1)
  const beta4 = betaOf(d4)

  log(`reads: beta P1 ${beta1.toFixed(3)} P3 ${beta3.toFixed(3)} P4 ${beta4.toFixed(3)}`)

  // two holes at L = 4 and 6, one up-band pair at a level-0 momentum and its negative: the late weight on that level
  const pairs = [4, 6].map(L => {
    const t = torus(L)
    const f2 = holeFrame(t, Ps, 8)
    const E2l = bandLevels(f2)
    const e2 = holeEngine(f2, 2, 0)
    const a2 = pairAngles(t, -sAng, CAP, -2 * vAng)
    // a momentum at the lowest level, not its own negative
    const lowest = Math.min(...E2l)
    const j = [...E2l.keys()].find(
      k => Math.abs(E2l[k]! - lowest) < 1e-9 && f2.fourier.neg[k] !== k,
    )!
    const s = slaterStart(e2, [j, f2.fourier.neg[j]!], [
      bandVectors(f2, j).up[0]!,
      bandVectors(f2, f2.fourier.neg[j]!).up[0]!,
    ])
    const onLevel = (st: Holes): number => {
      const w = momentumWeights(e2, st)
      const N = f2.fourier.N

      let x = 0

      for (let i = 0; i < 2; i++) {
        for (let k = 0; k < N; k++) {
          if (Math.abs(E2l[k]! - E2l[j]!) < 1e-9) {
            x += w[i * N + k]!
          }
        }
      }

      return x / 2
    }
    const classes = [...E2l].filter(x => Math.abs(x - E2l[j]!) < 1e-9).length

    let late = 0
    let lateUp = 0
    let count = 0

    for (let c = 1; c <= plan.pairCycles; c++) {
      holeCycle(e2, { angle: a2 }, s)

      if (c > plan.pairCycles / 2) {
        late += onLevel(s)
        lateUp += upFraction(e2, s)
        count++
      }
    }

    return {
      L,
      classes,
      N: f2.fourier.N,
      onLevel: late / count,
      up: lateUp / count,
      beta0: classes / f2.fourier.N,
    }
  })

  log(`pairs ${pairs.map(p => `L ${p.L}: on the start level ${p.onLevel.toFixed(4)} (${p.classes} of ${p.N} classes), up ${p.up.toFixed(4)}`).join('; ')}`)

  const hard = E1 && E2 && E3 && E4
  const status = !hard ? 'fail' : !CF || !I1 || !I2 ? 'partial' : 'pass'
  const lv = (o: Float64Array): string => byLevel(o).map(x => x.toFixed(3)).join(' ')
  const metrics: Record<string, number> = {
    E1: flag(E1),
    E2: flag(E2),
    E3: flag(E3),
    E4: flag(E4),
    CF: flag(CF),
    I1: flag(I1),
    I2: flag(I2),
    upP1: P1.up,
    upP2: P2.up,
    upP3: P3.up,
    upP4: P4.up,
    upDriftP1: P1.upSecond - P1.upFirst,
    upDriftP3: P3.upSecond - P3.upFirst,
    movedP1: moved[0]!,
    movedP2: moved[1]!,
    movedP3: moved[2]!,
    movedP4: moved[3]!,
    lateP1P2: d12,
    lateP1P3: d13,
    lateP1P4: d14,
    lateP2P4: l1(P2.late, P4.late),
    freeGap: Math.max(P1.freeGap, P3.freeGap),
    normDrift: Math.max(...runs.map(r => r.drift)),
    exchangeOther: Math.max(...runs.map(r => r.other)),
    deltaP1: d1,
    deltaP4: d4,
    betaP1: beta1,
    betaP3: beta3,
    betaP4: beta4,
    infiniteTemperatureP1: l1(P1.late, beta0),
    seconds: (Date.now() - started) / 1000,
  }

  pairs.forEach(p => {
    metrics[`pairOnLevel_L${p.L}`] = p.onLevel
    metrics[`pairUp_L${p.L}`] = p.up
    metrics[`pairBeta0_L${p.L}`] = p.beta0
  })

  return verdict({
    status,
    claim: `E1 ${E1} (late upper-band fraction P1 ${P1.up.toFixed(4)}, P2 ${P2.up.toFixed(4)}, P4 ${P4.up.toFixed(4)}, P3 in the other band ${P3.up.toFixed(4)}; infinite temperature 0.5); E2 ${E2} (late momentum distance from the start ${moved.map(x => x.toFixed(3)).join(', ')} of 6); E3 ${E3} (late P1 against P2 ${d12.toFixed(4)}, against its band mirror P3 ${d13.toFixed(4)}); E4 ${E4} (late P1 against the other shell P4 ${d14.toFixed(4)}); control CF ${CF} (the free rule moves nothing: ${metrics.freeGap!.toExponential(2)}); instrument I1 ${I1} (${metrics.normDrift!.toExponential(2)}) I2 ${I2} (${metrics.exchangeOther!.toExponential(2)})`,
    metrics,
    control: { CF: flag(CF), instrument: flag(I1 && I2) },
    notes: `L2: a known phenomenon (few-body Floquet systems keep a quasi-energy that cannot wrap) read on this rule's many-hole form, with the free rule as control. The 4d torus L ${plan.L}, three holes in one half, one tone, one flavor, not the husk and not a bath: no ledger row is held. Band levels ${levels.join(' ')}. Starts P1 ${show(p1)} (delta ${d1.toFixed(4)}), P2 ${show(p2)}, P3 = P1 in the other band (delta ${(-d1).toFixed(4)}), P4 ${show(p4)} (delta ${d4.toFixed(4)}). Late level occupations: P1 ${lv(P1.late)}, P2 ${lv(P2.late)}, P3 ${lv(P3.late)}, P4 ${lv(P4.late)}; infinite temperature ${lv(beta0)}. Free shells, P1: ${shellRead(d1)}. P4: ${shellRead(d4)}. Shell temperatures beta = d ln Omega / d delta: P1 ${beta1.toFixed(3)}, P3 ${beta3.toFixed(3)}, P4 ${beta4.toFixed(3)} (a cycle's phase as the unit). Upper-band fraction, first and second half of the late window: P1 ${P1.upFirst.toFixed(4)}, ${P1.upSecond.toFixed(4)}; P3 ${P3.upFirst.toFixed(4)}, ${P3.upSecond.toFixed(4)}. Two holes: ${pairs.map(p => `L ${p.L} ${p.onLevel.toFixed(4)} of the weight on the start's level (${p.classes} of ${p.N} classes, infinite temperature ${p.beta0.toFixed(4)}), up ${p.up.toFixed(4)}`).join('; ')}. ${((Date.now() - started) / 1000).toFixed(0)} s.`,
  })
}
