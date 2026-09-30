// FOUR HOLES OF THE REGISTER SEA ON THE L = 4 TORUS: THE SORTED STORE, EXACT AND VALIDATED (E-FND-0163). E-FND-0161's
// engine runs three holes on the L = 4 D4 torus and stops there: four holes in one half need 128^3 8^4 = 8.6e9
// amplitudes (137 GB), with every ordering of the members stored. This file builds the store that keeps only the
// orderings with nondecreasing momenta (code/measure/register-sorted-holes) on the Rust kernel (code/kernel/holes.ts),
// and validates it against the dense engine before anything is trusted to it. The physics it unlocks first is
// E-FND-0164.
//
// DERIVED BEFORE THE RUN (the module header of code/measure/register-sorted-holes).
// 1. ANTISYMMETRY IS A STORAGE RULE (L1). Holes are fermions of one kind, so psi(m o tau; b o tau) = sgn(tau) psi(m; b)
//    for every member permutation tau, and the amplitudes at the sorted momenta s (s_0 <= ... <= s_(n-1)), with every
//    fiber tuple, determine the rest: psi(m; b) = sgn(sigma) psi(s; b o sigma), sigma the stable sort of m.
// 2. TRANSLATION (L1). The total momentum is conserved and fixed, as in the dense engine: the last member's class is the
//    rest. Together with 1, the four-hole store at L = 4 is 91,808 sorted rows (of 2,097,152 tuples) times 8^4 fibers:
//    3.76e8 amplitudes, 6.0 GB, a factor 22.8 below the dense layout (the 4! = 24, less the rows whose momenta tie,
//    which keep both orders of their fibers so the one-body step stays a matrix product).
// 3. THE STEPS (L1). Every one-body piece keeps each member's momentum, so it maps a sorted row to itself. The pair piece
//    is a phase in relative sites and needs a whole column over every ordering: the fiber tuples fall into orbits under
//    permutation (215 with an active pair at n = 4 in one half), and one column per orbit, gathered through 1, carries
//    the dense engine's transform, phase and transform back, then is scattered to every stored entry of the orbit. The
//    pair piece commutes with member permutations, so this is the dense engine's step exactly.
// 4. WHAT IS NOT USED. The point group: the frames depend on momentum, so a rotation acts by 8 x 8 blocks on momentum
//    orbits. It would divide by up to 192 again, and is the next reduction if more is needed.
//
// PREDICTED VERDICT: PASS. The store is the dense engine's state written once instead of n! times.
//
// GATES, fixed before the gate run. The rule is E-SPN-0175's as in E-FND-0161 and E-FND-0162 (the member mixers at
// ringUnit(-1, 4), the sector string ringUnit(-2, 1) a unit of V, cap 8, the sector contact v^2 with v = ringUnit(2, 0),
// hole angles reversed), one half (fiber 8), total momentum 0. The dense engine runs on its kernel path (holeEngine's
// native option), which task/kernel/check.ts holds to its own JavaScript byte for byte.
//  S1 THE STORE IS THE DENSE ENGINE. Three holes on L = 4 and four holes on L = 2 (the one box where the dense layout
//     holds four), each from two starts, a Slater determinant of free band states and the antisymmetrized golden-ratio
//     fill (a start with weight on every tuple, ties included): the unfolded store differs from the dense state by at
//     most 1e-12 in any amplitude at cycles 1, 2, 4, 8 and 16.
//  S2 E-FND-0162 FROM THE STORE. E-FND-0162's start P1 for 64 cycles, dense and sorted: the late upper-band fraction
//     (cycles 33 to 64 every 2) and every late momentum occupation agree within 1e-10.
//  S3 FOUR HOLES ON L = 4. (a) Under the free rule a four-hole Slater determinant stays the Slater determinant of its
//     free-evolved orbitals within 1e-12 at cycles 1, 2, 4 and 8. (b) Under the rule, over 4 cycles: the norm within
//     1e-10, the occupation summing to 4 within 1e-10, and the antisymmetry at tied rows within 1e-13.
// CONTROLS, which must fail to agree (a failure makes the verdict partial at best).
//  CT1 THE SIGNS MATTER: the store with every permutation sign set to +1 (a symmetric bookkeeping) differs from the dense
//     engine by more than 1e-3 within 2 cycles (three holes on L = 4, the Slater start).
//  CT2 THE PAIR PIECE MATTERS: the store under the free rule differs from the dense engine under the rule by more than
//     1e-3 within 2 cycles (the same start).
// INSTRUMENT (a failure makes the verdict partial at best). I1 every store run keeps its norm within 1e-10.
// READ, gating nothing: the rows, amplitudes and gigabytes of each store, and the seconds a four-hole cycle on L = 4.
// Verdict: fail if S1, S2 or S3 fails; partial if all hold and a control or the instrument fails; pass otherwise.
//
// PROBES BEFORE THE GATE RUN, disclosed (no gate moved after them). tmp/fh-probe2 (4 cycles, Slater starts): three holes
//  on L = 4 agree with the dense engine to 4.6e-17 to 5.3e-17, four holes on L = 2 to 6.9e-17 to 1.0e-16; the js and
//  native stores byte for byte; the upper-band fractions and occupations agree to 2e-15; the signs-dropped control
//  differs by 2.9e-2 (L = 4) and 6.4e-2 (L = 2). tmp/fh-probe4: four holes on L = 4 build in 12 s at 6.2 GB resident,
//  keep their norm to 6e-14 over 2 cycles, sum their occupation to 4 to the printed 12 digits, ties 1.6e-18.
//  tmp/fh-smoke-0163 (2 cycles, E-FND-0162's P1 for 4) ran every path and passed.
//
// FIRST RUN (tmp/fh-gate-E-FND-0163.log, 273 s): PASS, as predicted. No gate moved and none was rerun.
//  - S1: the unfolded store against the dense engine over 16 cycles, three holes on L = 4 5.3e-17 (Slater) and 3.5e-18
//    (golden), four holes on L = 2 3.2e-16 and 1.4e-17.
//  - S2: E-FND-0162's P1 over 64 cycles, late upper-band fraction 0.932108 from both (the registered 0.9321), agreeing
//    to 4.4e-16, the late occupations to 9.7e-17.
//  - S3: four holes on L = 4, the free rule against its Slater determinant 4.7e-16 over 8 cycles; under the rule the norm
//    to 2.5e-14, the occupation summing to 4 to 2.2e-14, ties 3.0e-18.
//  - Controls: the signs dropped differ from the dense engine by 0.204, the free rule by 0.144. I1 1.5e-13.
//  - Read: 31.9 s a four-hole cycle on L = 4 at 12 native threads on a loaded machine.

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
  allPerms,
  bandLevels,
  bandVectors,
  bandWeights,
  holeCycle,
  holeEngine,
  holeFrame,
  holeGap,
  holeNorm,
  momentumWeights,
  newHoles,
  orbitalCycle,
  pairAngles,
  permSign,
  permuteHoles,
  slaterStart,
  type HoleEngine,
  type HoleFrame,
  type Holes,
} from '@/code/measure/register-holes'
import {
  foldSorted,
  sortedCycle,
  sortedEngine,
  sortedNorm,
  sortedOccupation,
  sortedSlater,
  sortedTies,
  sortedUp,
  slaterRow,
  unfoldSorted,
  type SortedEngine,
} from '@/code/measure/register-sorted-holes'
import { shellTriples } from '@/test/experiment/foundations/register-relaxation'

const LIGHT: readonly [number, number] = [-1, 4]
const STRING: readonly [number, number] = [-2, 1]
const VERTEX: readonly [number, number] = [2, 0]
const CAP = 8
const DENSE_TOL = 1e-12
const LATE_TOL = 1e-10
const SLATER_TOL = 1e-12
const NORM_TOL = 1e-10
const TIE_TOL = 1e-13
const TEETH = 1e-3
const GOLDEN = (Math.sqrt(5) - 1) / 2

export type SortedPlan = {
  cycles: number
  reads: readonly number[]
  relaxCycles: number
  lateFrom: number
  every: number
  pick: number
  freeReads: readonly number[]
  ruleCycles: number
  teethCycles: number
  threads: number
}

export const GATE_PLAN: SortedPlan = {
  cycles: 16,
  reads: [1, 2, 4, 8, 16],
  relaxCycles: 64,
  lateFrom: 33,
  every: 2,
  pick: 40,
  freeReads: [1, 2, 4, 8],
  ruleCycles: 4,
  teethCycles: 2,
  threads: 12,
}

const flag = (b: boolean): number => (b ? 1 : 0)

export default experiment({
  id: 'foundations/register-sorted-holes',
  code: 'E-FND-0163',
  title:
    'four holes of the register sea on the L = 4 torus, exact, pass: holes are fermions, so the store keeps only the momenta in increasing order (91,808 rows, 3.76e8 amplitudes, 6.0 GB against 8.6e9 and 137 GB), the one-body pieces act row by row and the pair piece on one column per fiber orbit; it matches the dense engine to 3.2e-16 (three holes on L = 4, four on L = 2), reproduces E-FND-0162 (late upper band 0.932108 from both, to 4.4e-16), and runs four holes on L = 4 on the Rust kernel at 32 s a cycle, the free rule equal to its Slater determinant to 4.7e-16 and the norm kept to 2.5e-14; dropping the permutation signs misses by 0.20',
  category: 'foundations',
  substrates: ['3434'],
  depth: 'L1',
  paper: false,
  run() {
    return registerSortedHolesRun(GATE_PLAN)
  },
})

const unit = (kj: readonly [number, number]): [number, number] => {
  const th = unitAngle(ringUnit(kj[0], kj[1]))

  return [Math.cos(th), Math.sin(th)]
}

// the antisymmetrized golden-ratio fill of a dense engine's layout, normalized
function goldenStart(e: HoleEngine): Holes {
  const s = newHoles(e.frame, e.n, e.total)

  for (let k = 0; k < s.re.length; k++) {
    s.re[k] = ((k * GOLDEN) % 1) - 0.5
    s.im[k] = ((k * GOLDEN * GOLDEN) % 1) - 0.5
  }

  const acc = newHoles(e.frame, e.n, e.total)
  const perms = allPerms(e.n)

  for (const p of perms) {
    const t = permuteHoles(e, s, p)
    const sg = permSign(p)

    for (let k = 0; k < acc.re.length; k++) {
      acc.re[k]! += sg * t.re[k]!
      acc.im[k]! += sg * t.im[k]!
    }
  }

  const nrm = Math.sqrt(holeNorm(acc))

  for (let k = 0; k < acc.re.length; k++) {
    acc.re[k]! /= nrm
    acc.im[k]! /= nrm
  }

  return acc
}

// distinct momentum classes summing to 0, the first n in index order after `from`
function distinctStart(fr: HoleFrame, n: number, from: number): number[] {
  const F = fr.fourier
  const N = F.N

  for (let a = from; a < N; a++) {
    for (let b = a + 1; b < N; b++) {
      if (n === 3) {
        const c = F.sum[F.neg[a]! * N + F.neg[b]!]!

        if (c > b) {
          return [a, b, c]
        }

        continue
      }

      for (let c = b + 1; c < N; c++) {
        const d = F.sum[F.sum[F.neg[a]! * N + F.neg[b]!]! * N + F.neg[c]!]!

        if (d > c) {
          return [a, b, c, d]
        }
      }
    }
  }

  throw new Error('register-sorted-holes: no distinct start')
}

// the dense and the sorted engines side by side from one antisymmetric dense start: the largest amplitude gap at the reads
function sideBySide(
  de: HoleEngine,
  se: SortedEngine,
  start: Holes,
  angle: Float64Array,
  sortedAngle: Float64Array | null,
  cycles: number,
  reads: readonly number[],
): { gap: number; drift: number } {
  const d = { ...start, re: Float64Array.from(start.re), im: Float64Array.from(start.im) }
  const s = foldSorted(se, start)

  let gap = 0
  let drift = 0

  for (let c = 1; c <= cycles; c++) {
    holeCycle(de, { angle }, d)
    sortedCycle(se, { angle: sortedAngle }, s)

    if (reads.includes(c)) {
      gap = Math.max(gap, holeGap(unfoldSorted(se, de, s), d))
      drift = Math.max(drift, Math.abs(sortedNorm(se, s) - 1))
    }
  }

  return { gap, drift }
}

export function registerSortedHolesRun(plan: SortedPlan): Verdict {
  const started = Date.now()
  const log = (what: string): void =>
    console.error(`${what} ${Math.round((Date.now() - started) / 1000)}s`)
  const u = unit(LIGHT)
  const sAng = unitAngle(ringUnit(STRING[0], STRING[1]))
  const vAng = unitAngle(ringUnit(VERTEX[0], VERTEX[1]))
  const qS = scaled(singletProjector24(), 24)
  const qD = scaled(partnerProjector48(), 48)
  const Ps = [registerPiece(qS, u), registerPiece(qD, [u[0], -u[1]])]
  const native = { backend: 'native' as const, threads: plan.threads }
  const T4 = torus(4)
  const T2 = torus(2)
  const fr4 = holeFrame(T4, Ps, 8)
  const fr2 = holeFrame(T2, Ps, 8)
  const angle4 = pairAngles(T4, -sAng, CAP, -2 * vAng)
  const angle2 = pairAngles(T2, -sAng, CAP, -2 * vAng)
  const drifts: number[] = []

  // ---------------- S1 ----------------
  const s1: { name: string; gap: number }[] = []

  for (const [name, fr, n, angle] of [
    ['L 4 three holes', fr4, 3, angle4],
    ['L 2 four holes', fr2, 4, angle2],
  ] as const) {
    const de = holeEngine(fr, n, 0, native)
    const se = sortedEngine(fr, n, 0, native)
    const js = distinctStart(fr, n, 1)
    const slater = slaterStart(de, js, js.map(j => bandVectors(fr, j).up[0]!))

    for (const [label, start] of [
      ['Slater', slater],
      ['golden', goldenStart(de)],
    ] as const) {
      const r = sideBySide(de, se, start, angle, angle, plan.cycles, plan.reads)

      s1.push({ name: `${name} ${label}`, gap: r.gap })
      drifts.push(r.drift)
      log(`S1 ${name} ${label}: gap ${r.gap.toExponential(2)} drift ${r.drift.toExponential(2)}`)
    }
  }

  const S1 = s1.every(r => r.gap <= DENSE_TOL)

  // ---------------- CT1, CT2 ----------------
  const de3 = holeEngine(fr4, 3, 0, native)
  const js3 = distinctStart(fr4, 3, 1)
  const slater3 = slaterStart(de3, js3, js3.map(j => bandVectors(fr4, j).up[0]!))
  const bad = sortedEngine(fr4, 3, 0, native)

  bad.pair.psign.fill(1)

  const ct1 = sideBySide(de3, bad, slater3, angle4, angle4, plan.teethCycles, [1, 2])
  const ct2 = sideBySide(de3, sortedEngine(fr4, 3, 0, native), slater3, angle4, null, plan.teethCycles, [1, 2])
  const CT1 = ct1.gap > TEETH
  const CT2 = ct2.gap > TEETH

  log(`CT1 ${ct1.gap.toExponential(3)} CT2 ${ct2.gap.toExponential(3)}`)

  // ---------------- S2 ----------------
  const E4 = bandLevels(fr4)
  const levels = [...new Set([...E4].map(x => x.toFixed(6)))].sort()
  const lev = Int32Array.from(E4, x => levels.indexOf(x.toFixed(6)))
  const p1 = shellTriples(fr4, lev, '012')[plan.pick]!
  const se3 = sortedEngine(fr4, 3, 0, native)
  const dRun = slaterStart(de3, p1, p1.map(j => bandVectors(fr4, j).up[0]!))
  const sRun = foldSorted(se3, dRun)
  const N = fr4.fourier.N
  const lateD = new Float64Array(N)
  const lateS = new Float64Array(N)

  let upD = 0
  let upS = 0
  let reads = 0

  for (let c = 1; c <= plan.relaxCycles; c++) {
    holeCycle(de3, { angle: angle4 }, dRun)
    sortedCycle(se3, { angle: angle4 }, sRun)

    if (c >= plan.lateFrom && (c - plan.lateFrom) % plan.every === 0) {
      const w = momentumWeights(de3, dRun)

      for (let i = 0; i < 3; i++) {
        for (let j = 0; j < N; j++) {
          lateD[j]! += w[i * N + j]!
        }
      }

      sortedOccupation(se3, sRun).forEach((x, j) => (lateS[j]! += x))
      upD += bandWeights(de3, dRun).reduce((a, x) => a + x, 0) / 3
      upS += sortedUp(se3, sRun)
      reads++
      drifts.push(Math.abs(sortedNorm(se3, sRun) - 1))
    }
  }

  const upGap = Math.abs(upD - upS) / reads
  const occGap = Math.max(...lateD.map((x, j) => Math.abs(x - lateS[j]!) / reads))
  const S2 = upGap <= LATE_TOL && occGap <= LATE_TOL

  log(`S2 P1 late up dense ${(upD / reads).toFixed(6)} sorted ${(upS / reads).toFixed(6)} gap ${upGap.toExponential(2)} occupation gap ${occGap.toExponential(2)}`)

  // ---------------- S3 ----------------
  const se4 = sortedEngine(fr4, 4, 0, native)
  const js4 = distinctStart(fr4, 4, 1)
  const orbitals = js4.map(j => bandVectors(fr4, j).up[0]!)
  const evolved = orbitals.map(v => ({ re: Float64Array.from(v.re), im: Float64Array.from(v.im) }))

  let slaterGap = 0
  let cycleSeconds = 0

  {
    const free = sortedSlater(se4, js4, orbitals)

    for (let c = 1; c <= Math.max(...plan.freeReads); c++) {
      sortedCycle(se4, { angle: null }, free)
      js4.forEach((j, i) => orbitalCycle(fr4, j, evolved[i]!))

      if (plan.freeReads.includes(c)) {
        // the determinant occupies one row: compare it there, and every other entry against 0
        const ref = slaterRow(se4, js4, evolved)
        const from = ref.row * se4.block

        for (let k = 0; k < free.re.length; k++) {
          const inRow = k >= from && k < from + se4.block
          const rr = inRow ? ref.re[k - from]! : 0
          const ri = inRow ? ref.im[k - from]! : 0

          slaterGap = Math.max(slaterGap, Math.hypot(free.re[k]! - rr, free.im[k]! - ri))
        }
      }
    }
  }

  log(`S3a four holes L 4 free rule against the Slater determinant ${slaterGap.toExponential(2)}`)

  const rule4 = sortedSlater(se4, js4, orbitals)

  let norm4 = 0
  let occ4 = 0
  let ties4 = 0

  for (let c = 1; c <= plan.ruleCycles; c++) {
    const t0 = Date.now()

    sortedCycle(se4, { angle: angle4 }, rule4)
    cycleSeconds = Math.max(cycleSeconds, (Date.now() - t0) / 1000)
    norm4 = Math.max(norm4, Math.abs(sortedNorm(se4, rule4) - 1))
    occ4 = Math.max(occ4, Math.abs(sortedOccupation(se4, rule4).reduce((a, x) => a + x, 0) - 4))
  }

  ties4 = sortedTies(se4, rule4)
  drifts.push(norm4)

  log(`S3b four holes L 4 under the rule: norm ${norm4.toExponential(2)} occupation ${occ4.toExponential(2)} ties ${ties4.toExponential(2)}, ${cycleSeconds.toFixed(1)} s a cycle`)

  const S3 = slaterGap <= SLATER_TOL && norm4 <= NORM_TOL && occ4 <= NORM_TOL && ties4 <= TIE_TOL
  const I1 = drifts.every(x => x <= NORM_TOL)
  const hard = S1 && S2 && S3
  const controls = CT1 && CT2
  const status = !hard ? 'fail' : !controls || !I1 ? 'partial' : 'pass'
  const metrics: Record<string, number> = {
    S1: flag(S1),
    S2: flag(S2),
    S3: flag(S3),
    CT1: flag(CT1),
    CT2: flag(CT2),
    I1: flag(I1),
    denseGap: Math.max(...s1.map(r => r.gap)),
    lateUpDense: upD / reads,
    lateUpSorted: upS / reads,
    lateUpGap: upGap,
    lateOccupationGap: occGap,
    slaterGap4: slaterGap,
    norm4,
    occupation4: occ4,
    ties4,
    teethSigns: ct1.gap,
    teethFree: ct2.gap,
    normDrift: Math.max(...drifts),
    rows4: se4.rows,
    amplitudes4: se4.rows * se4.block,
    gigabytes4: (se4.rows * se4.block * 16) / 1e9,
    amplitudesDense4: N ** 3 * 8 ** 4,
    rows3: se3.rows,
    secondsCycle4: cycleSeconds,
    seconds: (Date.now() - started) / 1000,
  }

  s1.forEach((r, i) => {
    metrics[`denseGap_${i}`] = r.gap
  })

  return verdict({
    status,
    claim: `S1 ${S1} (sorted against dense, ${s1.map(r => `${r.name} ${r.gap.toExponential(2)}`).join(', ')}); S2 ${S2} (E-FND-0162's P1 over ${plan.relaxCycles} cycles: late upper-band fraction dense ${(upD / reads).toFixed(6)} sorted ${(upS / reads).toFixed(6)}, gap ${upGap.toExponential(2)}, occupations ${occGap.toExponential(2)}); S3 ${S3} (four holes on L 4: free rule against its Slater determinant ${slaterGap.toExponential(2)}, under the rule norm ${norm4.toExponential(2)}, occupation ${occ4.toExponential(2)}, ties ${ties4.toExponential(2)}); controls CT1 ${CT1} (${ct1.gap.toExponential(3)}) CT2 ${CT2} (${ct2.gap.toExponential(3)}); instrument I1 ${I1} (${metrics.normDrift!.toExponential(2)})`,
    metrics,
    control: { CT1: flag(CT1), CT2: flag(CT2), instrument: flag(I1) },
    notes: `L1 (antisymmetry and translation are storage rules) checked by runs against the dense engine. Four holes on L 4: ${se4.rows} sorted rows, ${metrics.amplitudes4} amplitudes (${metrics.gigabytes4!.toFixed(2)} GB) against ${metrics.amplitudesDense4} dense, ${cycleSeconds.toFixed(1)} s a cycle on the native kernel at ${plan.threads} threads (a loaded machine). Three holes on L 4: ${se3.rows} rows. The point group is not used. ${((Date.now() - started) / 1000).toFixed(0)} s.`,
  })
}
