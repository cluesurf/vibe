// THE REMAINDER TEST OF A SELF (refiled from 0046 under a recorded decision;
// code/measure/remainder.ts). A second, independent
// definition of a self beside the closure reader: a region is a self when its own surroundings cannot rebuild its next
// state. The idea is @OhWellMike's Rem(lambda) = U_lambda - U_field with his signs N1 (the prediction gap saturates
// with context), N2 (it persists under zero or uniform input), N3 (path dependence exceeds storage), Z1 (the leftover
// falls to zero as the field becomes observable), Z2 (it thermalizes when decoupled or flooded) and Z3 (a field-only
// simulator rebuilds it). Each sign is made an exact series on B1's line engine (code/measure/remainder.ts states every
// choice), read on B1's line self, the vacuum, a lone love and E-SLF-0194's twisted arms, and set cell by cell beside
// the reference closure (E-SLF-0197) computed in the same run.
//
// THE GATES are the item's `what` (frozen with task/pre-register before any probe). Depth L2: B1's line rule in floats
// on the line engine (honeycomb-exact for a state on one line); the register is a model piece beside the line.

import { experiment } from '@/test/scaffold/suite'
import { verdict } from '@/test/scaffold/verdict'
import { lineBasis, lineLightest, wholeBasis } from '@/code/measure/coined-line-bloch'
import { fitRing, levelPlacement } from '@/code/measure/held-cluster'
import type { Placed } from '@/code/measure/held-cluster'
import { addAmp, coneStart, coneStore, type ConeStore } from '@/code/measure/cone-line'
import { configsOf, readSelf, supportOf, type SelfReading } from '@/code/measure/self-reader'
import { PI7 } from '@/code/measure/self-reader-ball'
import { SECTORS } from '@/code/measure/keel-flame'
import {
  caseRun,
  freeSeries,
  regionOf,
  remWord,
  remainderSigns,
  type CaseReading,
  type FreeSeries,
  type RemWord,
  type Rule,
  type Signs,
} from '@/code/measure/remainder'

const RECORDED = { energy: 0.33001851839229945 }

// E-SLF-0197's recorded readings (note/self-reader.md section 7): B1's line self, and each arm's c_ref at beats 1, 80
const S1_CREF_96 = 0.914
const TAU0 = 11
const LOVE_TAU = 4
const ARM_CREF: Record<string, [number, number]> = {
  F: [0.128, 0.091],
  Fbar: [0.128, 0.086],
  C0: [0.231, 0.212],
  C2: [0.24, 0.218],
  R: [0.392, 0.366],
  C: [0.392, 0.228],
}
const REF_TOL = 1e-3
const TOL = 1e-12
const NORM_TOL = 1e-9
const DELTA_FLOOR = 1e-3
const CHECK_BEATS = 4
const S_TOL = 1e-24
const CONTEXT_KS = [0, 1, 2, 4, 8, 16, 32, 48, 64, 80, 96]

type Setting = { name: 'smoke' | 'full'; box: number; levelBar: number; W: number; T: number; armT: number; cap: number }

const SMOKE: Setting = { name: 'smoke', box: 8, levelBar: 1e-4, W: 10, T: 12, armT: 12, cap: 1e7 }
const FULL: Setting = { name: 'full', box: 12, levelBar: 1e-9, W: 12, T: 96, armT: 80, cap: 1.5e8 }

const widthOf = (W: number, fit: readonly Placed[]): number => W + Math.max(...fit.flatMap(p => p.ts.map(t => t[0])))
const f4 = (x: number): string => (Number.isFinite(x) ? x.toFixed(4) : String(x))
const ex = (x: number): string => (Number.isFinite(x) ? x.toExponential(1) : String(x))
const maxDiff = (xs: readonly number[], ys: readonly number[]): number =>
  xs.reduce((m, x, i) => Math.max(m, Math.abs(x - (ys[i] ?? NaN))), 0)
const word = (s: SelfReading): string => (s.self === true ? 'A SELF' : s.self === false ? 'NOT A SELF' : 'UNDECIDED')
const sign = (x: boolean | undefined): string => (x === true ? 'yes' : x === false ? 'no' : '?')

type Judged = {
  name: string
  group: 'reference' | 'arm'
  n: number
  reading?: CaseReading
  free?: FreeSeries
  signs: Signs
  rem: RemWord
  closure: SelfReading
  agree: boolean | undefined
}

const agreeOf = (rem: RemWord, closure: SelfReading): boolean | undefined =>
  rem === 'UNDECIDED' || closure.self === undefined
    ? undefined
    : (rem === 'REM SELF' && closure.self === true) || (rem === 'NO REM' && closure.self === false)

export default experiment({
  id: 'selves/remainder-test',
  code: 'E-SLF-0199',
  title:
    "the remainder test of a self: a region is a self when a simulator fed only its surroundings cannot rebuild its next state (Mike's Rem(lambda), signs N1 to N3 and Z1 to Z3 made exact on B1's line engine), read on B1's line self, the vacuum, a lone love and E-SLF-0194's twisted arms, and compared case by case with the reference closure",
  category: 'selves',
  substrates: ['3434'],
  depth: 'L2',
  paper: false,
  run() {
    const started = Date.now()
    const setting = process.env.REM_SWEEP === 'full' ? FULL : SMOKE
    const full = setting.name === 'full'
    const log = (what: string): void => console.error(`${what} ${Math.round((Date.now() - started) / 1000)}s`)

    // ---- C1, the level ----
    const basis = lineBasis({ flavors: [0, 0, 0], statistics: 'fermion', D: 3, box: setting.box, unit: 0 })
    const level = lineLightest(basis, wholeBasis(basis)).lightest
    const placed = levelPlacement(basis, level.cre, level.cim)
    const levelOff = Math.abs(level.unwrapped - RECORDED.energy)
    const gC1 = levelOff <= setting.levelBar
    const { W } = setting
    const fit = fitRing(placed, W).kept
    const width = widthOf(W, fit)

    log('C1')

    const startOn = (T: number): { start: ConeStore; line: number } => {
      const line = width + 2 * T + 12
      const start = coneStart({ n: 3, line, cap: setting.cap, W, placed: fit, bath: [], offset: T + 5, clock: PI7 }).store

      return { start, line }
    }
    const ks = CONTEXT_KS

    // ---- B1's line self, T beats ----
    const T = setting.T
    const b1 = startOn(T)
    const [lo, hi] = supportOf(b1.start)
    const b1Region = regionOf(3, lo, hi)
    const b1Margin = regionOf(3, lo - 1, hi + 1)
    const B1 = caseRun({ name: 'B1', rule: { kind: 'bare' }, start: b1.start, region: b1Region, margin: b1Margin, T, contextKs: ks, log })
    const B1free = freeSeries({ psi: configsOf(b1.start), delta: B1.delta, deltaWeight: B1.deltaWeight, line: b1.line, lo, hi, beats: T })

    log(`B1 done (region ${hi - lo + 1} docks, ${b1Region.size} configurations)`)

    // ---- A0 and the twisted arms, armT beats ----
    const armT = setting.armT
    const arm = startOn(armT)
    const [alo, ahi] = supportOf(arm.start)
    const armRegion = regionOf(3, alo, ahi)
    const armMargin = regionOf(3, alo - 1, ahi + 1)
    const A0 = caseRun({ name: 'A0', rule: { kind: 'bare' }, start: arm.start, region: armRegion, margin: armMargin, T: armT, contextKs: ks, keepParts: true, log })
    const armFree = freeSeries({ psi: configsOf(arm.start), delta: A0.delta, deltaWeight: A0.deltaWeight, line: arm.line, lo: alo, hi: ahi, beats: armT })
    const arms: { name: string; rule: Rule }[] = [
      { name: 'F', rule: { kind: 'twist', table: [0, 1, 2] } },
      { name: 'Fbar', rule: { kind: 'twist', table: [0, 2, 1] } },
      { name: 'C0', rule: { kind: 'twist', table: SECTORS.C[0]! } },
      { name: 'C2', rule: { kind: 'twist', table: SECTORS.C[2]! } },
      { name: 'R', rule: { kind: 'register', rule: 'R' } },
      { name: 'C', rule: { kind: 'register', rule: 'C' } },
    ]
    const armRuns = arms.map(a =>
      caseRun({
        name: a.name,
        rule: a.rule,
        start: arm.start,
        region: armRegion,
        margin: armMargin,
        T: armT,
        contextKs: ks,
        ref: A0.parts,
        checkBeats: a.name === 'F' || a.name === 'C' ? CHECK_BEATS : 0,
        log,
      }),
    )
    // every arm's pulse is the same (the kick acts on the shared start), so the arms share A0's free pulse null
    const armDeltaOff = Math.max(...armRuns.map(r => Math.abs(r.deltaWeight - A0.deltaWeight)))

    // ---- a lone love on each label of the line, T beats ----
    const loveLine = 2 * T + 12
    const at = T + 5
    const loves = [
      { name: 'love+', mode: 2 * at + 1 },
      { name: 'love-', mode: 2 * at },
    ].map(l => {
      const s = coneStore(1, loveLine, 1e6, PI7)

      addAmp(s, Int32Array.of(l.mode), 1, 0)

      const R = regionOf(1, at - 1, at + 1)
      const M = regionOf(1, at - 2, at + 2)
      const reading = caseRun({ name: l.name, rule: { kind: 'bare' }, start: s, region: R, margin: M, T, contextKs: ks })
      const free = freeSeries({
        psi: [{ modes: [l.mode], re: 1, im: 0 }],
        delta: reading.delta,
        deltaWeight: reading.deltaWeight,
        line: loveLine,
        lo: at - 1,
        hi: at + 1,
        beats: T,
      })

      return { name: l.name, reading, free }
    })

    log('loves done')

    // ---- the readings ----
    const judge = (name: string, group: Judged['group'], reading: CaseReading, free: FreeSeries): Judged => {
      const signs = remainderSigns(reading, free)
      const rem = remWord(signs)
      const closure = readSelf(reading.n, reading.cRef, free.r0.map(x => x * x))

      return { name, group, n: reading.n, reading, free, signs, rem, closure, agree: agreeOf(rem, closure) }
    }
    const vacuumSigns: Signs = { N1: false, Z1: true, N2: false, Z2: true, N3: false, Z3: true, rho: 0, rho0: 0, s: [] }
    const vacuumClosure = readSelf(0, [1], [1])
    const vacuum: Judged = {
      name: 'vacuum',
      group: 'reference',
      n: 0,
      signs: vacuumSigns,
      rem: remWord(vacuumSigns),
      closure: vacuumClosure,
      agree: agreeOf(remWord(vacuumSigns), vacuumClosure),
    }
    const judged: Judged[] = [
      vacuum,
      ...loves.map(l => judge(l.name, 'reference', l.reading, l.free)),
      judge('B1', 'reference', B1, B1free),
      judge('A0', 'reference', A0, armFree),
      ...armRuns.map(r => judge(r.name, 'arm', r, armFree)),
    ]
    const j = (name: string): Judged => judged.find(x => x.name === name)!

    // ---- instruments ----
    const runs = [B1, A0, ...armRuns, ...loves.map(l => l.reading)]
    const frees = [B1free, armFree, ...loves.map(l => l.free)]
    const gNorm = runs.every(r => r.normDrift <= NORM_TOL)
    const refRuns = [B1, A0, ...loves.map(l => l.reading)]
    const dMax = Math.max(...refRuns.map(r => r.dMax))
    // on a reference-rule run d is 0, so the start-known simulator's surplus S is 0 at every beat
    const sMax = Math.max(...refRuns.flatMap(r => r.S))
    const gI2 = dMax <= TOL && sMax <= S_TOL
    const simOff = Math.max(...armRuns.filter(r => r.name === 'F' || r.name === 'C').map(r => r.simOff))
    const gI3 = simOff <= TOL
    const ctxOff = Math.max(...runs.map(r => Math.abs(r.context[r.context.length - 1]![1] - r.G[r.reach]!)))
    const ctxEnd = runs.every(r => r.context[r.context.length - 1]![0] === r.reach)
    const gI4 = ctxOff <= TOL && ctxEnd
    const loveOff = Math.max(
      ...loves.map(l =>
        Math.max(
          maxDiff(l.reading.G, l.free.G0),
          maxDiff(l.reading.E, l.free.E0),
          maxDiff(l.reading.En, l.free.E0n),
          maxDiff(l.reading.D, l.free.D0),
        ),
      ),
    )
    const gI5 = loveOff <= TOL
    const upTo = (xs: readonly number[]): number[] => xs.slice(0, armT + 1)
    const transOff = Math.max(
      maxDiff(upTo(B1.G), A0.G),
      maxDiff(upTo(B1.E), A0.E),
      maxDiff(upTo(B1.En), A0.En),
      maxDiff(upTo(B1.D), A0.D),
      maxDiff(upTo(B1.cRef), A0.cRef),
      maxDiff(upTo(B1free.G0), armFree.G0),
      maxDiff(upTo(B1free.E0n), armFree.E0n),
    )
    const gI6 = transOff <= TOL && armT <= T
    const deltaMin = Math.min(...runs.map(r => r.deltaWeight))
    const gI7 = deltaMin >= DELTA_FLOOR && armDeltaOff <= TOL
    const gI8 = [B1, ...loves.map(l => l.reading)].every(r => r.reach === T) && [A0, ...armRuns].every(r => r.reach === armT)
    const nullOff = Math.max(
      // no G0 <= r0 clause: the never-left and the returned amplitude interfere (a recorded trap)
      ...frees.map(f => Math.max(f.traceOff, f.wholeOff)),
    )
    const gI9 = nullOff <= TOL

    // B0: the closure reproduces E-SLF-0197 (numbers on the full setting only)
    const b1Closure = j('B1').closure
    const armOff = Math.max(
      ...armRuns.map(r => Math.max(Math.abs(r.cRef[1]! - ARM_CREF[r.name]![0]), Math.abs(r.cRef[armT]! - ARM_CREF[r.name]![1]))),
    )
    const b0Numbers =
      Math.abs(B1.cRef[T]! - S1_CREF_96) <= REF_TOL &&
      b1Closure.tau0 === TAU0 &&
      j('A0').closure.tau0 === TAU0 &&
      armOff <= REF_TOL &&
      loves.every(l => j(l.name).closure.tauC === LOVE_TAU && j(l.name).closure.tau0 === LOVE_TAU)
    const b0Words =
      b1Closure.self === true &&
      j('A0').closure.self === true &&
      armRuns.every(r => j(r.name).closure.self === false) &&
      loves.every(l => j(l.name).closure.self === false)
    const gB0 = !full || (b0Numbers && b0Words)

    const instrument = gC1 && gB0 && gNorm && gI2 && gI3 && gI4 && gI5 && gI6 && gI7 && gI8 && gI9

    // ---- the verdict ----
    const undecided = judged.some(x => x.rem === 'UNDECIDED' || x.closure.self === undefined)
    const mixed = judged.some(x => x.rem === 'MIXED')
    const refDisagree = judged.some(x => x.group === 'reference' && x.agree === false)
    const armDisagree = judged.some(x => x.group === 'arm' && x.agree === false)
    const status: 'pass' | 'fail' | 'partial' | 'open' =
      !full || !instrument || undecided
        ? 'open'
        : mixed || refDisagree
          ? 'fail'
          : armDisagree
            ? 'partial'
            : 'pass'

    const metrics: Record<string, number> = {
      gate_C1: gC1 ? 1 : 0,
      gate_B0: gB0 ? 1 : 0,
      gate_norm: gNorm ? 1 : 0,
      gate_I2: gI2 ? 1 : 0,
      gate_I3: gI3 ? 1 : 0,
      gate_I4: gI4 ? 1 : 0,
      gate_I5: gI5 ? 1 : 0,
      gate_I6: gI6 ? 1 : 0,
      gate_I7: gI7 ? 1 : 0,
      gate_I8: gI8 ? 1 : 0,
      gate_I9: gI9 ? 1 : 0,
      levelOff,
      dMax,
      sMax,
      simOff,
      ctxOff,
      loveOff,
      transOff,
      deltaMin,
      armOff,
      nullOff,
      undecided: undecided ? 1 : 0,
      mixed: mixed ? 1 : 0,
      ref_disagree: refDisagree ? 1 : 0,
      arm_disagree: armDisagree ? 1 : 0,
      seconds: (Date.now() - started) / 1000,
    }

    const bit = (x: boolean | undefined): number => (x === true ? 1 : x === false ? 0 : NaN)

    for (const x of judged) {
      const p = x.name.replace(/[+-]/, m => (m === '+' ? 'P' : 'M'))
      const s = x.signs

      metrics[`${p}_N1`] = bit(s.N1)
      metrics[`${p}_Z1`] = bit(s.Z1)
      metrics[`${p}_N2`] = bit(s.N2)
      metrics[`${p}_Z2`] = bit(s.Z2)
      metrics[`${p}_N3`] = bit(s.N3)
      metrics[`${p}_Z3`] = bit(s.Z3)
      metrics[`${p}_rem_self`] = x.rem === 'REM SELF' ? 1 : x.rem === 'NO REM' ? 0 : NaN
      metrics[`${p}_closure_self`] = bit(x.closure.self)
      metrics[`${p}_agree`] = bit(x.agree)

      const r = x.reading

      if (r) {
        const R = r.reach

        metrics[`${p}_G_R`] = r.G[R]!
        metrics[`${p}_S_R`] = r.S[R]!
        metrics[`${p}_s_R`] = s.s[R]!
        metrics[`${p}_s_min_late`] = Math.min(...s.s.slice(Math.ceil(R / 2)))
        metrics[`${p}_GV_R`] = r.GV[R]!
        metrics[`${p}_E_R`] = r.E[R]!
        metrics[`${p}_En_R`] = r.En[R]!
        metrics[`${p}_D_R`] = r.D[R]!
        metrics[`${p}_cRef_R`] = r.cRef[R]!
        metrics[`${p}_rho`] = s.rho
        metrics[`${p}_rho0`] = s.rho0
        metrics[`${p}_tauG`] = readSelf(r.n, r.G, x.free!.G0).tauC
        metrics[`${p}_tauG0`] = readSelf(r.n, r.G, x.free!.G0).tau0
        metrics[`${p}_tauE`] = readSelf(r.n, r.E, x.free!.E0).tauC
        metrics[`${p}_tauE0`] = readSelf(r.n, r.E, x.free!.E0).tau0
        metrics[`${p}_tauEn`] = readSelf(r.n, r.En, x.free!.E0n).tauC
        metrics[`${p}_tauEn0`] = readSelf(r.n, r.En, x.free!.E0n).tau0
        metrics[`${p}_tauD`] = readSelf(r.n, r.D, x.free!.D0).tauC
        metrics[`${p}_tauD0`] = readSelf(r.n, r.D, x.free!.D0).tau0
        metrics[`${p}_surplus_mean`] = r.surplus.reduce((a, b) => a + b, 0) / Math.max(1, r.surplus.length)
        metrics[`${p}_sigma_R`] = r.sigma[R]!
      }
    }

    const samples = (series: readonly number[], at: readonly number[]): string =>
      at.filter(t => t < series.length).map(t => `${t}:${f4(series[t]!)}`).join(' ')
    const SAMPLE = [0, 1, 2, 4, 8, 16, 32, 48, 64, 80, 96]
    const line1 = (x: Judged): string => {
      const s = x.signs
      const head = `${x.name}: N1 ${sign(s.N1)} Z1 ${sign(s.Z1)} N2 ${sign(s.N2)} Z2 ${sign(s.Z2)} N3 ${sign(s.N3)} Z3 ${sign(s.Z3)} = ${x.rem}; closure ${word(x.closure)} (tau_c ${x.closure.tauC}, tau_0 ${x.closure.tau0}); ${x.agree === true ? 'AGREE' : x.agree === false ? 'DISAGREE' : 'undecided'}`
      const r = x.reading

      if (!r) {
        return `${head} (n 0, read by the definitions)`
      }

      const f = x.free!

      return `${head}. s = S/r ${samples(s.s, SAMPLE)}; S ${samples(r.S, SAMPLE)}; G ${samples(r.G, SAMPLE)} (null ${samples(f.G0, SAMPLE)}); GV(R) ${f4(r.GV[r.reach]!)}; rho ${ex(s.rho)} rho0 ${ex(s.rho0)}; context ${r.context.map(([k, v]) => `${k}:${f4(v)}`).join(' ')}; E ${samples(r.E, SAMPLE)} (null ${samples(f.E0, SAMPLE)}); En ${samples(r.En, SAMPLE)} (null ${samples(f.E0n, SAMPLE)}); D ${samples(r.D, SAMPLE)} (null ${samples(f.D0, SAMPLE)}, pulse weight ${f4(r.deltaWeight)}); c_ref ${samples(r.cRef, SAMPLE)}; surplus mean ${ex(metrics[`${x.name.replace(/[+-]/, m => (m === '+' ? 'P' : 'M'))}_surplus_mean`]!)}; sigma(R) ${f4(r.sigma[r.reach]!)}`
    }

    return verdict({
      status,
      claim: `${setting.name} setting, W ${W} k 3, B1 and loves ${T} beats, arms ${armT}. ${judged.map(line1).join('. ')}.`,
      metrics,
      notes: `L2. Setting ${setting.name}${full ? '' : ' (proves the file runs; not evidence, status open by rule)'}. Instruments: C1 ${gC1} (${ex(levelOff)}); B0 ${gB0} (B1 c_ref(T) ${f4(B1.cRef[T] ?? NaN)} tau_0 ${b1Closure.tau0}, arms off ${ex(armOff)}); norm ${gNorm}; I2 locality ${gI2} (d ${ex(dMax)}, S ${ex(sMax)}); I3 simulator ${gI3} (${ex(simOff)}); I4 context end ${gI4} (${ex(ctxOff)}); I5 lone love = null ${gI5} (${ex(loveOff)}); I6 A0 = B1 ${gI6} (${ex(transOff)}); I7 pulse ${gI7} (min ${ex(deltaMin)}, arms off ${ex(armDeltaOff)}); I8 reach ${gI8}; I9 null checks ${gI9} (${ex(nullOff)}). Verdict: undecided ${undecided}, mixed ${mixed}, reference disagree ${refDisagree}, arm disagree ${armDisagree}.`,
    })
  },
})
