// FOUR HOLES OF THE REGISTER SEA CAN WRAP THE CYCLE PHASE, AND STILL KEEP THEIR BAND (E-FND-0164). E-FND-0162 found three
// holes on the L = 4 torus relaxing to a state fixed by their band energy, not to infinite temperature, and traced it to
// the member's mass gap: n holes carry a band energy delta = sum s_i E(q_i), and while 2 n E_max < 2 pi no two values of
// delta agree mod 2 pi. From four holes that fails (4 E_max = 3.251 > pi), and a Floquet rule whose quasi-energies can
// meet across 2 pi is expected to heat. E-FND-0163's sorted store runs four holes on L = 4 exactly; this file asks
// whether they heat.
//
// DERIVED BEFORE THE GATE RUN (tmp/fh-probe3 lists every coincidence; remaining-pieces.md, "Four holes").
// 1. WHERE THE PHASE CAN WRAP (L1). The five levels at L = 4 are E = 0.380, 0.447, 0.558, 0.775 and 0.813 (40, 24, 32,
//    24 and 8 classes). Two free four-hole configurations have the same quasi-energy only if their delta differ by 2 pi,
//    and delta ranges over [-3.251, 3.251]: so only the two CORNERS meet, every hole in the upper-phase band at levels 3
//    and 4 (delta -3.25 to -3.10) against every hole in the other band at levels 3 and 4 (+3.10 to +3.25), within 0.007
//    of exact (u3 u3 u3 u4 against d3 d3 d3 d4, and so on). Every other configuration, and every configuration of three
//    holes, has no partner within 0.3.
// 2. WHAT HEATING WOULD LOOK LIKE (L1). A corner start in the upper band and its band mirror (the same momenta, the other
//    band) lie in ONE folded quasi-energy shell. If the rule heats, both relax to the same state of that shell, so their
//    late upper-band fractions U and U' meet, and the band memory m = U - U' falls to 0. If not, the mirror symmetry
//    E-FND-0162 found (0.932 against 0.065) keeps U + U' near 1 and m near 2 U - 1.
// 3. WHAT CARRIES THE MIXING, AND WHY IT SHOULD BE SLOW. The corners differ by every hole's band at once, so the
//    process is a four-hole band flip. Each pair piece is two-body, and its interband part is the dressing E-FND-0162
//    measured (a 0.07 of the weight); a four-fold flip is fourth order in it, and the resonant corners hold 8 and 24
//    classes of the 128. PREDICTED: no measurable heating in 48 cycles, the corners keep their band memory, and the
//    lower upper-band fraction of a corner start (0.71 to 0.75 against 0.89 for low levels, tmp/fh-heat) is a larger
//    DRESSING of the top levels, symmetric between the mirrors, not a flow.
// 3a. THE READ THAT SEPARATES THE TWO. U alone cannot: a growing dressing lowers U and raises U' just as a slow mixing
//    would. So the state is also read band-resolved (register-sorted-holes sortedBandCounts): the weight P(k) with k
//    holes in the other band. Dressing is a hole-by-hole (or pair-by-pair) effect and puts little weight on k = 4;
//    mixing of the corners moves weight into k = 4 itself, toward the mirror's own k = 0 weight (0.3 to 0.5).
// 4. WHAT IT IS NOT. The 4d torus, four holes, one half, one tone, one flavor, the register rule; no ledger row moves.
//    A slow heating below the reach of 48 cycles is not excluded, and the bound on its rate is read.
//
// THE RUN. The L = 4 torus, four holes in half + at total momentum 0, E-SPN-0175's rule as in E-FND-0162, on the native
// kernel (E-FND-0163's store). Each start is a Slater determinant of four band eigenvectors (the first of bandVectors,
// up or down) at distinct momentum classes summing to 0, named by the multiset of their levels, taken in the order of
// the enumeration a < b < c < d with d the rest. Hot shells: '3344' and '3333' (corners). The comparator: '0333', three
// top holes and one low, delta -2.71, which cannot wrap (its partner would need +3.57). None of the gate's starts is a
// probe's (the probes took pick 0 of each shell).
//
// GATES, fixed before the gate run. U is the upper-band fraction; late is its mean over cycles 25 to 48 every 2; the late
// window's halves are cycles 25 to 35 and 37 to 47. For each hot pair (X up, X' its mirror down):
//  W1 THE CORNERS KEEP THEIR BAND MEMORY: m = U(X) - U(X') >= 0.25 (full mixing gives 0; the probe read 0.49).
//  W2 THE MIRRORS STAY MIRRORS: |U(X) + U(X') - 1| <= 0.05 (heating that shares the corners would move the sum
//     only with m, so this reads the symmetry the band memory stands on).
//  W3 NO FLOW BEYOND THE COMPARATOR'S: the ratio of m over the late window's second half to its first half is at least
//     the same ratio for the non-wrapping comparator '0333' minus 0.15 (both memories fall as the momenta keep moving,
//     probe 0.877 against 0.929; a corner mixing adds a fall the comparator does not have).
//  W4 NO FOUR-FOLD FLIP: the weight with every hole flipped (P(4) from the up start, P(0) from its mirror) has a late
//     mean at most 0.08 for each hot start and its mirror (probe 0.015 to 0.036; a half-mixed corner carries 0.15 to
//     0.25), and its second-half mean at most its first-half mean plus 0.02.
// CONTROL (a failure makes the verdict partial at best). CF the free rule from the first hot start keeps U = 1 within
//  1e-10 at cycles 1 to 4 (the reading sees the band exactly).
// INSTRUMENT (a failure makes the verdict partial at best). I1 every norm within 1e-10; I2 the tie antisymmetry at the
//  last cycle within 1e-13.
// READ, gating nothing: U every 4 cycles and every 2 in the late window, the late level occupations and P(k), the
//  comparator's memory and P(4), an upper bound on a corner-mixing rate from the memory's two halves, gamma <= ln(m1 /
//  m2) / 12 per cycle, and m(hot) / m(comparator).
// Verdict: fail if W1, W2, W3 or W4 fails; partial if all hold and the control or the instrument fails; pass otherwise.
//
// PROBES BEFORE THE GATE RUN, disclosed; they set every threshold. tmp/fh-heat-3344.log and -3344-down.log (pick 0,
//  32 cycles): U 0.59 at cycle 1, near 0.74 from cycle 10, 0.70 to 0.73 over cycles 26 to 32; the mirror 0.25 at
//  cycles 10 to 17 (U + U' 0.99), with level occupations equal to the up start's to 0.01. tmp/fh-heat-0012.log (low
//  levels, delta -1.77): U 0.88 to 0.90 from cycle 4, no drift. tmp/fh-heat-0333-up.log and -0333-down.log (pick 0,
//  32 cycles): U 0.811 over cycles 10 to 16 and 0.790 over 26 to 32, the mirror 0.176 and 0.200, so m 0.635 then
//  0.590 (ratio 0.929), where the corner's m went 0.494 then 0.433 (ratio 0.877). tmp/fh-count-3344.log (the corner,
//  pick 0, again with P(k) every 4 cycles): P(4) 0.027, 0.036, 0.020, 0.021, 0.020, 0.015, 0.018, 0.025 at cycles 4 to
//  32, with no growth; P(0) 0.32 to 0.47. tmp/fh-count-0333.log (stopped at cycle 12 when the machine began to swap):
//  P(4) 0.003, 0.006, 0.003. The corner's four-fold weight is 5 to 10 times the comparator's and flat: set by the
//  dressing, not flowing. These probes are what changed the plan from U alone to U with P(k); W1, W2 and the
//  thresholds were set from them. tmp/fh-smoke-0164 (3 cycles, the gate's picks) ran every path before the gate run.
//
// FIRST RUN (tmp/fh-gate-E-FND-0164.log, 14,075 s on a loaded and swapping machine): PASS, as predicted. No gate moved
// and none was rerun. The smoke before it (3 cycles, tmp/fh-smoke-0164.log) had failed W2, W3 and W4 on its 2-cycle
// window, the early transient, as E-FND-0162's smoke failed on its 4-cycle one; nothing was changed after it.
//  - W1: band memory U - U' 0.415 ('3344', U 0.709 and 0.294) and 0.474 ('3333', 0.734 and 0.259). Full mixing is 0.
//  - W2: U + U' 1.003 and 0.993: the mirrors stay mirrors, as in E-FND-0162.
//  - W3: memory kept from the first half of the late window to the second 0.986 and 0.963, the non-wrapping comparator
//    0.965. Rate bounds on a corner mixing 1.2e-3 and 3.2e-3 a cycle.
//  - W4: every hole flipped 0.0205 (halves 0.0230 then 0.0180) and 0.0174 (0.0185 then 0.0162), the mirrors 0.0199 and
//    0.0173; falling, not growing.
//  - CF 4.9e-15; I1 2.1e-13; I2 3.4e-18.
//  - Read. The corners do differ from the comparator: memory 0.68 and 0.78 of its 0.610, and a four-fold flip weight 5
//    to 6 times its 0.0035. Hole by hole, a corner hole is dressed more (1 - U 0.29 and 0.27 against 0.20), and an
//    independent-hole dressing d^4 scales by (0.29 / 0.20)^4 = 4.4, close to what is seen. The P(k) are wider than
//    binomial (P(3) 0.12 against 0.05 for d = 0.29), as a pair piece flips holes in pairs. So what the wrap can do in 48
//    cycles is at most a small static admixture of the other corner, not a flow. Late level occupations: each start and
//    its mirror to 0.03, and the three shells apart (level 4: 0.66, 0.34, 0.29), so the shell is remembered too.

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
  holeFrame,
  pairAngles,
  type HoleFrame,
} from '@/code/measure/register-holes'
import {
  bandBasis,
  sortedBandCounts,
  sortedCycle,
  sortedEngine,
  sortedNorm,
  sortedOccupation,
  sortedSlater,
  sortedTies,
  sortedUp,
  type SortedEngine,
} from '@/code/measure/register-sorted-holes'

const LIGHT: readonly [number, number] = [-1, 4]
const STRING: readonly [number, number] = [-2, 1]
const VERTEX: readonly [number, number] = [2, 0]
const CAP = 8
const MEMORY = 0.25
const MIRROR = 0.05
const FLOW = 0.15
const FLIP = 0.08
const FLIP_GROWTH = 0.02
const FREE_TOL = 1e-10
const NORM_TOL = 1e-10
const TIE_TOL = 1e-13

export type WrapPlan = {
  cycles: number
  lateFrom: number
  every: number
  split: number
  hot: readonly { key: string; pick: number }[]
  comparator: { key: string; pick: number }
  freeCycles: number
  threads: number
}

export const GATE_PLAN: WrapPlan = {
  cycles: 48,
  lateFrom: 25,
  every: 2,
  split: 36,
  hot: [
    { key: '3344', pick: 100 },
    { key: '3333', pick: 20 },
  ],
  comparator: { key: '0333', pick: 100 },
  freeCycles: 4,
  threads: 12,
}

const flag = (b: boolean): number => (b ? 1 : 0)

export default experiment({
  id: 'foundations/register-wrap',
  code: 'E-FND-0164',
  title:
    'four holes of the register sea can wrap the cycle phase and still do not heat, pass: at L = 4, 4 E_max = 3.251 > pi, and only the two corners (every hole at the top two levels, all in one band or all in the other) meet across 2 pi; a corner start and its band mirror keep a band memory U - U\' of 0.415 and 0.474 over cycles 25 to 48 (full mixing gives 0), their sum stays 1.003 and 0.993, the memory holds from the late window\'s first half to its second (0.986 and 0.963, the non-wrapping comparator 0.965), and the weight with every hole flipped stays 0.017 to 0.021 and falls; the corners are dressed more than a non-wrapping start (memory 0.68 and 0.78 of its), as an independent-hole dressing predicts, a static admixture rather than a flow; the free rule keeps the band to 4.9e-15',
  category: 'foundations',
  substrates: ['3434'],
  depth: 'L2',
  paper: false,
  run() {
    return registerWrapRun(GATE_PLAN)
  },
})

const unit = (kj: readonly [number, number]): [number, number] => {
  const th = unitAngle(ringUnit(kj[0], kj[1]))

  return [Math.cos(th), Math.sin(th)]
}

// the quadruples of distinct momentum classes summing to 0 whose band levels form the multiset `key`, in the order
// a < b < c < d with d the rest
export function shellQuadruples(fr: HoleFrame, lev: Int32Array, key: string): number[][] {
  const F = fr.fourier
  const N = F.N
  const out: number[][] = []

  for (let a = 0; a < N; a++) {
    for (let b = a + 1; b < N; b++) {
      for (let c = b + 1; c < N; c++) {
        const d = F.sum[F.sum[F.neg[a]! * N + F.neg[b]!]! * N + F.neg[c]!]!

        if (d > c && [lev[a]!, lev[b]!, lev[c]!, lev[d]!].sort().join('') === key) {
          out.push([a, b, c, d])
        }
      }
    }
  }

  return out
}

type Run = {
  name: string
  delta: number
  // U at each read, with its cycle
  ups: { cycle: number; up: number }[]
  late: number
  first: number
  second: number
  levels: number[]
  // the late mean of P(k), and the all-flipped weight's late mean and halves
  counts: number[]
  flip: number
  flipFirst: number
  flipSecond: number
  drift: number
  ties: number
}

export function registerWrapRun(plan: WrapPlan): Verdict {
  const started = Date.now()
  const log = (what: string): void =>
    console.error(`${what} ${Math.round((Date.now() - started) / 1000)}s`)
  const u = unit(LIGHT)
  const sAng = unitAngle(ringUnit(STRING[0], STRING[1]))
  const vAng = unitAngle(ringUnit(VERTEX[0], VERTEX[1]))
  const qS = scaled(singletProjector24(), 24)
  const qD = scaled(partnerProjector48(), 48)
  const Ps = [registerPiece(qS, u), registerPiece(qD, [u[0], -u[1]])]
  const T = torus(4)
  const fr = holeFrame(T, Ps, 8)
  const F = fr.fourier
  const E = bandLevels(fr)
  const levels = [...new Set([...E].map(x => x.toFixed(6)))].sort()
  const lev = Int32Array.from(E, x => levels.indexOf(x.toFixed(6)))
  const angle = pairAngles(T, -sAng, CAP, -2 * vAng)
  const e: SortedEngine = sortedEngine(fr, 4, 0, { backend: 'native', threads: plan.threads })
  const basis = bandBasis(e)
  const show = (js: number[]): string => js.map(j => `(${F.ints[j]!.join(',')})`).join(' ')
  const byLevel = (o: Float64Array): number[] => {
    const out = levels.map(() => 0)

    o.forEach((x, j) => (out[lev[j]!]! += x))

    return out
  }
  const mean = (xs: number[]): number => xs.reduce((a, x) => a + x, 0) / xs.length

  const relax = (name: string, js: number[], band: 'up' | 'down'): Run => {
    const s = sortedSlater(e, js, js.map(j => bandVectors(fr, j)[band][0]!))
    const ups: { cycle: number; up: number }[] = []
    const late = new Float64Array(F.N)
    const counts = new Float64Array(5)
    const flips: { cycle: number; flip: number }[] = []

    let drift = 0
    let reads = 0

    for (let c = 1; c <= plan.cycles; c++) {
      sortedCycle(e, { angle }, s)

      const inLate = c >= plan.lateFrom && (c - plan.lateFrom) % plan.every === 0

      if (inLate || c % 4 === 0) {
        ups.push({ cycle: c, up: sortedUp(e, s) })
        drift = Math.max(drift, Math.abs(sortedNorm(e, s) - 1))
      }

      if (inLate) {
        const p = sortedBandCounts(e, s, basis)

        sortedOccupation(e, s).forEach((x, j) => (late[j]! += x))
        p.forEach((x, k) => (counts[k]! += x))
        // every hole flipped: all four in the other band from an up start, none there from a down start
        flips.push({ cycle: c, flip: band === 'up' ? p[4]! : p[0]! })
        reads++
      }
    }

    const lateUps = ups.filter(x => x.cycle >= plan.lateFrom && (x.cycle - plan.lateFrom) % plan.every === 0)
    const flipOf = (xs: { cycle: number; flip: number }[]): number => mean(xs.map(x => x.flip))
    const run: Run = {
      name,
      delta: js.reduce((a, j) => a + (band === 'up' ? -1 : 1) * E[j]!, 0),
      ups,
      late: mean(lateUps.map(x => x.up)),
      first: mean(lateUps.filter(x => x.cycle < plan.split).map(x => x.up)),
      second: mean(lateUps.filter(x => x.cycle >= plan.split).map(x => x.up)),
      levels: byLevel(late.map(x => x / reads)),
      counts: [...counts].map(x => x / reads),
      flip: flipOf(flips),
      flipFirst: flipOf(flips.filter(x => x.cycle < plan.split)),
      flipSecond: flipOf(flips.filter(x => x.cycle >= plan.split)),
      drift,
      ties: sortedTies(e, s),
    }

    log(`${name} ${show(js)} delta ${run.delta.toFixed(4)}: late U ${run.late.toFixed(4)} (halves ${run.first.toFixed(4)} ${run.second.toFixed(4)}) levels ${run.levels.map(x => x.toFixed(3)).join(' ')}`)

    return run
  }

  const pairOf = (key: string, pick: number): { key: string; js: number[]; up: Run; down: Run } => {
    const js = shellQuadruples(fr, lev, key)[pick]!

    return { key, js, up: relax(`${key} up`, js, 'up'), down: relax(`${key} down`, js, 'down') }
  }

  // ---- CF ----
  const firstHot = shellQuadruples(fr, lev, plan.hot[0]!.key)[plan.hot[0]!.pick]!

  let freeGap = 0

  {
    const s = sortedSlater(e, firstHot, firstHot.map(j => bandVectors(fr, j).up[0]!))

    for (let c = 1; c <= plan.freeCycles; c++) {
      sortedCycle(e, { angle: null }, s)
      freeGap = Math.max(freeGap, Math.abs(sortedUp(e, s) - 1))
    }
  }

  log(`CF free rule: |U - 1| ${freeGap.toExponential(2)}`)

  const hot = plan.hot.map(h => pairOf(h.key, h.pick))
  const comp = pairOf(plan.comparator.key, plan.comparator.pick)
  const memory = (p: { up: Run; down: Run }): number => p.up.late - p.down.late
  const memoryHalves = (p: { up: Run; down: Run }): [number, number] => [
    p.up.first - p.down.first,
    p.up.second - p.down.second,
  ]
  const mComp = memory(comp)
  const ratio = (p: { up: Run; down: Run }): number => {
    const [a, b] = memoryHalves(p)

    return b / a
  }
  const ratioComp = ratio(comp)
  const W1 = hot.every(p => memory(p) >= MEMORY)
  const W2 = hot.every(p => Math.abs(p.up.late + p.down.late - 1) <= MIRROR)
  const W3 = hot.every(p => ratio(p) >= ratioComp - FLOW)
  const W4 = hot.every(p =>
    [p.up, p.down].every(r => r.flip <= FLIP && r.flipSecond <= r.flipFirst + FLIP_GROWTH),
  )
  const CF = freeGap <= FREE_TOL
  const runs = [...hot.flatMap(p => [p.up, p.down]), comp.up, comp.down]
  const I1 = runs.every(r => r.drift <= NORM_TOL)
  const I2 = runs.every(r => r.ties <= TIE_TOL)
  const hard = W1 && W2 && W3 && W4
  const status = !hard ? 'fail' : !CF || !I1 || !I2 ? 'partial' : 'pass'
  const rate = (p: { up: Run; down: Run }): number => {
    const [a, b] = memoryHalves(p)

    return b >= a ? 0 : Math.log(a / b) / (plan.split - plan.lateFrom + 1)
  }
  const metrics: Record<string, number> = {
    W1: flag(W1),
    W2: flag(W2),
    W3: flag(W3),
    W4: flag(W4),
    CF: flag(CF),
    I1: flag(I1),
    I2: flag(I2),
    memoryComparator: mComp,
    freeGap,
    normDrift: Math.max(...runs.map(r => r.drift)),
    ties: Math.max(...runs.map(r => r.ties)),
    seconds: (Date.now() - started) / 1000,
  }

  hot.forEach(p => {
    const [a, b] = memoryHalves(p)

    metrics[`up_${p.key}`] = p.up.late
    metrics[`upMirror_${p.key}`] = p.down.late
    metrics[`memory_${p.key}`] = memory(p)
    metrics[`memoryFirst_${p.key}`] = a
    metrics[`memorySecond_${p.key}`] = b
    metrics[`mixingRateBound_${p.key}`] = rate(p)
    metrics[`delta_${p.key}`] = p.up.delta
    metrics[`memoryRatio_${p.key}`] = ratio(p)
    metrics[`memoryOverComparator_${p.key}`] = memory(p) / mComp
    metrics[`flip_${p.key}`] = p.up.flip
    metrics[`flipMirror_${p.key}`] = p.down.flip
    metrics[`flipFirst_${p.key}`] = p.up.flipFirst
    metrics[`flipSecond_${p.key}`] = p.up.flipSecond
  })
  metrics.upComparator = comp.up.late
  metrics.upMirrorComparator = comp.down.late
  metrics.memoryRatioComparator = ratioComp
  metrics.flipComparator = comp.up.flip
  metrics.flipMirrorComparator = comp.down.flip

  const lv = (r: Run): string => r.levels.map(x => x.toFixed(3)).join(' ')
  const ct = (r: Run): string => r.counts.map(x => x.toFixed(4)).join(' ')
  const curve = (r: Run): string => r.ups.map(x => `${x.cycle}:${x.up.toFixed(3)}`).join(' ')

  return verdict({
    status,
    claim: `W1 ${W1} (band memory U - U' ${hot.map(p => `${p.key} ${memory(p).toFixed(4)}`).join(', ')}; full mixing 0); W2 ${W2} (U + U' ${hot.map(p => `${p.key} ${(p.up.late + p.down.late).toFixed(4)}`).join(', ')}); W3 ${W3} (memory kept from the first half of the late window to the second ${hot.map(p => `${p.key} ${ratio(p).toFixed(4)}`).join(', ')}, the non-wrapping ${comp.key} ${ratioComp.toFixed(4)}); W4 ${W4} (every hole flipped ${hot.map(p => `${p.key} ${p.up.flip.toFixed(4)} (halves ${p.up.flipFirst.toFixed(4)} ${p.up.flipSecond.toFixed(4)}), mirror ${p.down.flip.toFixed(4)}`).join('; ')}; the comparator ${comp.up.flip.toFixed(4)}); control CF ${CF} (${freeGap.toExponential(2)}); instrument I1 ${I1} (${metrics.normDrift!.toExponential(2)}) I2 ${I2} (${metrics.ties!.toExponential(2)})`,
    metrics,
    control: { CF: flag(CF), instrument: flag(I1 && I2) },
    notes: `L2: a few-body Floquet question (heating once quasi-energies can meet across 2 pi) read on this rule's many-hole form. The 4d torus L 4, four holes in one half at total momentum 0, one tone, one flavor, not the husk: no ledger row moves. Levels ${levels.join(' ')}. Starts: ${[...hot, comp].map(p => `${p.key} ${show(p.js)} (delta ${p.up.delta.toFixed(4)} up, ${p.down.delta.toFixed(4)} down)`).join('; ')}. Late level occupations: ${runs.map(r => `${r.name} ${lv(r)}`).join('; ')}. Late P(k), k = 0 to 4 holes in the other band: ${runs.map(r => `${r.name} ${ct(r)}`).join('; ')}. Memory against the comparator's (${mComp.toFixed(4)}): ${hot.map(p => `${p.key} ${(memory(p) / mComp).toFixed(3)}`).join(', ')}. U curves: ${runs.map(r => `${r.name} ${curve(r)}`).join('; ')}. Mixing-rate bounds from the memory's halves: ${hot.map(p => `${p.key} ${rate(p).toExponential(2)} a cycle`).join(', ')}. ${((Date.now() - started) / 1000).toFixed(0)} s.`,
  })
}
