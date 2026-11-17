// THE SELF READER RERUN (item vibe-roadmap-grounding-0029; decision 005; note/self-reader.md). E-SLF-0187 (item 0004)
// read B1's line self as a self, but failed on S3: on the exact R = 4 ball's 3-beat horizon a lone love's closure c and
// its free null c0 both stay at or above 1/2, so tau_c = tau_0 = Infinity and "tau_c < 2 tau_0" is false by
// construction. That verdict stands. This file is the new pre-registration: S3' reads the lone love on the line engine
// over S1's horizon, where its free null can fall below 1/2, and every other gate is rerun unchanged in the same run.
//
// THE GATES, fixed in the item's what before any probe (gate 9f217e058f9d): instruments C1, B0, N1, I0, F0 and the
// line run's norm (as 0004); definition gates S1, S2, S4 (as 0004) and S3' (for each of the 24 slots of dock 0 the
// lone love on its own line of the line engine, B1's line rule at clock 14, split, region its dock and the two line
// neighbours, beats 0..T with T = 96: pass iff tau_0 is finite and tau_c < 2 tau_0 on every slot). REPORTED: max
// |c - c0| of S3', 0004's ball S3 numbers, and 0004's apply readings. Smoke (T 12) is open by rule.
//
// PREDICTION (before the first run): every instrument and S1, S2, S4 reproduce 0004's numbers (S1 tau_0 11, c(96)
// 0.914); S3' passes with c = c0 within 1e-12 and tau_0 between 4 and 12 on every slot.
//
// Depth L2: the line self and the lone love are B1's line rule in floats on the line engine (honeycomb-exact for a
// state on one line); the ball gates are the exact R = 4 ball with sparse branches.

import { experiment } from '@/test/scaffold/suite'
import { verdict } from '@/test/scaffold/verdict'
import {
  lineBasis,
  lineLightest,
  wholeBasis,
} from '@/code/measure/coined-line-bloch'
import { fitRing, levelPlacement } from '@/code/measure/held-cluster'
import type { Placed } from '@/code/measure/held-cluster'
import { lineReader } from '@/code/measure/cold-line'
import {
  ConeCap,
  addAmp,
  coneBeat,
  coneBoundCount,
  coneNorm,
  coneStart,
  coneStore,
  mixPass,
  type ConeStore,
} from '@/code/measure/cone-line'
import { crossDockRun, loneWeights, type DockEnv } from '@/code/measure/cross-line-dock'
import {
  ballParts,
  ballRetention,
  closureDockRun,
  closureOf,
  configsOf,
  freeLove,
  freeNull,
  readSelf,
  regionRetention,
  supportOf,
  type SelfReading,
} from '@/code/measure/self-reader'
import {
  D0,
  MIXERS,
  PI7,
  PI9,
  ballOf,
  ballRun,
  cutLevel,
  cutOnBall,
  findEnv,
  lineDocks,
  lineLove,
  type LineLove,
  type Mixer,
} from '@/code/measure/self-reader-ball'
import { LINE_FIRSTS, OPPOSITE } from '@/code/rule/isometric-knit'

const RECORDED = { energy: 0.33001851839229945 }

// 0020's line self (clock 14): L(1), L(2); E-SLF-0186's P0 L(2) and main L_C(2) (clock 18); E-SLF-0185's L(2)
const L_0020 = [0.917, 0.959]
const P0_0186 = 0.9524
const MAIN_0186 = 0.8868
const MIX_0185: Record<string, number> = {
  'F-G': 0.221,
  'F-L': 0.015,
  'R-w': 0.414,
  'R-w2': 0.421,
  'R-1': 0.303,
  'R-star': 0.304,
}
const REF_TOL = 1e-3
const TOL = 1e-12
const NORM_TOL = 1e-9
const HOLD = 0.9
const WINDOW = 2
const SAMPLES = [0, 1, 2, 4, 8, 16, 32, 64, 96]

// ---- settings ----

type Setting = {
  name: 'smoke' | 'full'
  box: number
  levelBar: number
  W: number
  T: number
  cap: number
  ballRadius: number
}

const SMOKE: Setting = { name: 'smoke', box: 8, levelBar: 1e-4, W: 10, T: 12, cap: 1e7, ballRadius: 3 }
const FULL: Setting = { name: 'full', box: 12, levelBar: 1e-9, W: 12, T: 96, cap: 1.5e8, ballRadius: 4 }

const widthOf = (W: number, fit: readonly Placed[]): number =>
  W + Math.max(...fit.flatMap(p => p.ts.map(t => t[0])))

const f4 = (x: number): string => (Number.isFinite(x) ? x.toFixed(4) : String(x))
const ex = (x: number): string => (Number.isFinite(x) ? x.toExponential(1) : String(x))
const maxAbs = (xs: readonly number[]): number => xs.reduce((m, x) => Math.max(m, Math.abs(x)), 0)

export default experiment({
  id: 'selves/self-reader-rerun',
  code: 'E-SLF-0191',
  title:
    "the self reader rerun with the lone-love gate read where it can be decided: E-SLF-0187's information-closure reader (a region of whole docks is a self when its present alone implies its past at least twice as long as its members' would as free loves), every instrument and the line self, vacuum and invariance gates rerun unchanged, and a lone love read on the line engine over the line self's 96 beats on each of the 24 slots of a dock, where its free null falls below 1/2",
  category: 'selves',
  substrates: ['3434'],
  depth: 'L2',
  paper: false,
  run() {
    const started = Date.now()
    const setting = process.env.SELF_SWEEP === 'full' ? FULL : SMOKE
    const full = setting.name === 'full'
    const log = (what: string): void =>
      console.error(`${what} ${Math.round((Date.now() - started) / 1000)}s`)
    const env = findEnv()

    // ---- C1, the level ----
    const basis = lineBasis({ flavors: [0, 0, 0], statistics: 'fermion', D: 3, box: setting.box, unit: 0 })
    const level = lineLightest(basis, wholeBasis(basis)).lightest
    const placed = levelPlacement(basis, level.cre, level.cim)
    const levelOff = Math.abs(level.unwrapped - RECORDED.energy)
    const gC1 = levelOff <= setting.levelBar
    const { W } = setting
    const read = Math.floor((W - 1) / 2)
    const fit = fitRing(placed, W).kept
    const width = widthOf(W, fit)

    log('C1')

    // ---- the two-beat arms (E-SLF-0186's line engine) ----
    const line = Math.max(64, width + 2 * WINDOW + 8)
    const offset = WINDOW + 2
    const rd = lineReader(placed, line, read, false)
    const make = (clock: number): ConeStore =>
      coneStart({ n: 3, line, cap: setting.cap, W, placed: fit, bath: [], offset, clock }).store
    const [lo, hi] = supportOf(make(PI9))
    const lone = loneWeights(make(PI9))
    const top = Math.max(...lone.values())
    const xs = [...lone.entries()].filter(([, w]) => w >= 1e-3 * top).map(([x]) => x).sort((a, b) => a - b)
    const xStar = [...lone.entries()].sort((a, b) => b[1] - a[1] || a[0] - b[0])[0]![0]
    const ref = (X: number, e: DockEnv | undefined) =>
      crossDockRun({ start: make(PI9), X, env: e, beats: WINDOW, rd, collision: 'pass', spanBar: 2 })
    const mine = (X: number, e: DockEnv | undefined) =>
      closureDockRun({ start: make(PI9), X, env: e, beats: WINDOW, rd, collision: 'pass', lo, hi })
    const p0 = ref(0, undefined)
    const kMain = ref(xStar, env)
    const lineArm = mine(0, undefined)
    const mainArm = mine(xStar, env)
    const Lof = (F: readonly number[]): number[] => F.map(f => f / F[0]!)
    const LP0 = Lof(p0.F)
    const LC = Lof(kMain.F)
    const fSame = Math.max(
      maxAbs(lineArm.F.map((f, i) => f - p0.F[i]!)),
      maxAbs(mainArm.F.map((f, i) => f - kMain.F[i]!)),
    )
    // I0 (line): the K variant with no env equals r_A^2
    const i0Line = maxAbs(lineArm.c.map((c, i) => c - lineArm.inside[i]! ** 2))

    log(`arms: P0 L ${LP0.map(f4).join(' ')}, main L ${LC.map(f4).join(' ')}, c ${mainArm.c.map(f4).join(' ')}`)

    const profile = xs.map(X => {
      const r = X === xStar ? mainArm : mine(X, env)

      return { X, L2: r.F[WINDOW]! / r.F[0]!, kappa: Math.sqrt(r.c[WINDOW]!), fired: r.fired, envs: r.envs }
    })

    log('profile')

    // ---- the mixers (E-SLF-0185, clock 14) ----
    const mixRead = (m: Mixer | undefined) => {
      let a = make(PI7)

      const F0 = coneBoundCount(a, rd)

      for (let t = 1; t <= WINDOW; t++) {
        if (m) {
          mixPass(a, m.lone, m.full)
        }

        const b = coneStore(a.n, a.line, a.cap, a.clock)

        coneBeat(a, b, true)
        a = b
      }

      const r = regionRetention(a, lo, hi)

      return { name: m?.name ?? 'bare', L2: coneBoundCount(a, rd) / F0, kappa: r, norm: coneNorm(a) }
    }
    const mixers = [mixRead(undefined), ...MIXERS.map(mixRead)]
    const mixOff = full ? Math.max(...mixers.filter(m => m.name !== 'bare').map(m => Math.abs(m.L2 - MIX_0185[m.name]!))) : NaN

    log(`mixers ${mixers.map(m => `${m.name} L ${f4(m.L2)} kappa ${f4(m.kappa)}`).join('; ')}`)

    // ---- F0: the free-null tensor against the determinant sum, on the cut start ----
    const cut = cutLevel(placed)
    const cutStore = coneStore(3, line, 1e6, PI7)
    const mid = Math.floor(line / 2)

    for (const p of cut) {
      addAmp(cutStore, Int32Array.from(p.ts.map(([x, j]) => 2 * (mid + x) + (j === 0 ? 1 : 0)).sort((a, b) => a - b)), p.re, p.im)
    }

    const f0 = freeNull({ psi: configsOf(cutStore), line, lo: mid - 1, hi: mid + 1, beats: WINDOW, checkBeat: WINDOW })
    const f0Off = Math.abs(f0.r0[WINDOW]! - f0.direct!)

    log(`F0 ${ex(f0Off)}`)

    // ---- S1: the line self over T beats ----
    const T = setting.T
    const longLine = width + 2 * T + 12
    const longOff = T + 5
    const rdLong = lineReader(placed, longLine, read, false)
    let a = coneStart({ n: 3, line: longLine, cap: setting.cap, W, placed: fit, bath: [], offset: longOff, clock: PI7 }).store
    const psi = configsOf(a)
    const [llo, lhi] = supportOf(a)
    const F0 = coneBoundCount(a, rdLong)
    const r = [regionRetention(a, llo, lhi)]
    const Ls = new Map<number, number>([[0, 1]])

    let normDrift = Math.abs(coneNorm(a) - 1)
    let reach = 0

    for (let t = 1; t <= T; t++) {
      const b = coneStore(a.n, a.line, a.cap, a.clock)

      try {
        coneBeat(a, b, true)
      } catch (err) {
        if (err instanceof ConeCap) {
          break
        }

        throw err
      }

      a = b
      reach = t
      r.push(regionRetention(a, llo, lhi))

      if (SAMPLES.includes(t) || t === T) {
        Ls.set(t, coneBoundCount(a, rdLong) / F0)
        normDrift = Math.max(normDrift, Math.abs(coneNorm(a) - 1))
        log(`S1 beat ${t}: r ${f4(r[t]!)}, L ${f4(Ls.get(t)!)}, store ${a.used}`)
      }
    }

    const c = r.map(x => x * x)
    const fn = freeNull({ psi, line: longLine, lo: llo, hi: lhi, beats: reach })
    const c0 = fn.r0.map(x => x * x)
    const s1 = readSelf(3, c, c0)
    const gNorm = normDrift <= NORM_TOL
    const gB0 =
      !full ||
      (L_0020.every((x, i) => Math.abs(Ls.get(i + 1)! - x) <= REF_TOL) &&
        Math.abs(LP0[WINDOW]! - P0_0186) <= REF_TOL &&
        Math.abs(LC[WINDOW]! - MAIN_0186) <= REF_TOL &&
        fSame <= TOL &&
        mixOff <= REF_TOL)

    log(`S1 ${s1.reason}`)

    // ---- S3': a lone love on the line engine over the same T beats, each of the 24 slots of dock 0 ----
    const loves: LineLove[] = Array.from({ length: 24 }, (_, s) => lineLove(s, T, PI7))
    const s3Line = loves.map(l => readSelf(1, l.c, l.c0))
    const s3LineOff = Math.max(...loves.map(l => l.off))
    const s3LineNorm = Math.max(...loves.map(l => l.norm))
    const tau0s = [...new Set(loves.map(l => l.tau0))].sort((x, y) => x - y)
    const tauCs = [...new Set(loves.map(l => l.tauC))].sort((x, y) => x - y)
    const gS3 = loves.every(l => Number.isFinite(l.tau0) && l.tauC < 2 * l.tau0)
    const love0 = loves[0]!

    log(`S3' off ${ex(s3LineOff)}, tau_0 ${tau0s.join(',')}, tau_c ${tauCs.join(',')}, ${s3Line[0]!.reason}`)

    // ---- the ball ----
    const R = setting.ballRadius
    const ball = ballOf(R)
    const loneBeats = R - 1
    const cutBeats = R - 2

    log('ball')

    // N1 (and 0004's ball S3, reported): a lone love on each slot of dock 0
    const fl = 2 * R + 10
    const fo = R + 5
    let n1 = 0
    let s3Off = 0
    let s3Frontier = 0
    const s3: SelfReading[] = []

    for (let d = 0; d < 24; d++) {
      const { pos } = lineDocks(ball, d)
      const run = ballRun(ball, [{ slots: [d], values: [1], re: 1, im: 0 }], loneBeats)
      const free = freeLove(fl, 2 * fo + 1, loneBeats)
      const inRegion = (s: number): boolean => Math.abs(pos.get(Math.floor(s / 24)) ?? 99) <= 1
      const cs: number[] = []
      const c0s: number[] = []

      s3Frontier += run.frontier

      for (let t = 0; t <= loneBeats; t++) {
        const byPos = new Map<number, number>()

        for (const term of run.per[t]!) {
          const p = pos.get(Math.floor(term.slots[0]! / 24))

          if (p === undefined) {
            n1 = Infinity
            continue
          }

          byPos.set(p, (byPos.get(p) ?? 0) + term.re ** 2 + term.im ** 2)
        }

        let inside = 0

        for (let p = -fo; p < fl - fo; p++) {
          const x = fo + p
          const v = free[t]!
          const w = v[4 * x]! ** 2 + v[4 * x + 1]! ** 2 + v[4 * x + 2]! ** 2 + v[4 * x + 3]! ** 2

          n1 = Math.max(n1, Math.abs(w - (byPos.get(p) ?? 0)))

          if (Math.abs(p) <= 1) {
            inside += w
          }
        }

        cs.push(closureOf(ballParts(run.per[t]!, inRegion)).c)
        c0s.push(inside * inside)
      }

      s3Off = Math.max(s3Off, maxAbs(cs.map((x, i) => x - c0s[i]!)))
      s3.push(readSelf(1, cs, c0s))
    }

    const gN1 = n1 <= TOL

    log(`N1 ${ex(n1)}; ball S3 (0004, reported) off ${ex(s3Off)}, ${s3[0]!.reason}`)

    // S2: the empty vacuum
    let vacuumC: number[] = []

    try {
      const run = ballRun(ball, [{ slots: [], values: [], re: 1, im: 0 }], loneBeats)

      vacuumC = run.per.map(terms => closureOf(ballParts(terms, () => true)).c)
    } catch (err) {
      vacuumC = [NaN]
      log(`S2 run: ${(err as Error).message}`)
    }

    const s2 = readSelf(0, vacuumC, vacuumC)
    const gS2 = s2.self === false

    // I0: the general formula against r_A^2, the cut start on l and W0's dock
    const cutL = cutOnBall(ball, cut, D0, 1, false)
    const cutRun = ballRun(ball, cutL.starts, cutBeats)
    const i0Cut = maxAbs(cutRun.per.map(terms => closureOf(ballParts(terms, cutL.inRegion)).c - ballRetention(terms, cutL.inRegion) ** 2))
    const w0Beats = Math.min(2, R - 1)
    const lDocks = lineDocks(ball, D0)
    const w0Region = new Set([-1, 0, 1].map(p => lDocks.dockAt.get(p)!))
    const w0In = (s: number): boolean => w0Region.has(Math.floor(s / 24))
    const w0Slots = [D0, env.single, LINE_FIRSTS[env.full]!, OPPOSITE[LINE_FIRSTS[env.full]!]!]
    const w0Run = ballRun(ball, [{ slots: w0Slots, values: w0Slots.map(() => 1), re: 1, im: 0 }], w0Beats)
    const w0C = w0Run.per.map(terms => closureOf(ballParts(terms, w0In)).c)
    const i0W0 = maxAbs(w0Run.per.map((terms, t) => w0C[t]! - ballRetention(terms, w0In) ** 2))
    const gI0 = i0Cut <= TOL && i0W0 <= TOL && i0Line <= TOL && w0Run.kFired > 0

    log(`I0 cut ${ex(i0Cut)}, W0 ${ex(i0W0)} (K fired ${w0Run.kFired}), line ${ex(i0Line)}`)

    // S4: the cut start on every line and orientation, C, and the members' order
    const cutClosure = (fwd: number, value: number, reverse: boolean): number[] => {
      const s = cutOnBall(ball, cut, fwd, value, reverse)

      return ballRun(ball, s.starts, cutBeats).per.map(terms => closureOf(ballParts(terms, s.inRegion)).c)
    }
    const refC = cutClosure(D0, 1, false)
    let s4 = 0

    for (let k = 0; k < 12; k++) {
      for (const fwd of [LINE_FIRSTS[k]!, OPPOSITE[LINE_FIRSTS[k]!]!]) {
        s4 = Math.max(s4, maxAbs(cutClosure(fwd, 1, false).map((x, i) => x - refC[i]!)))
      }
    }

    s4 = Math.max(
      s4,
      maxAbs(cutClosure(D0, -1, false).map((x, i) => x - refC[i]!)),
      maxAbs(cutClosure(D0, 1, true).map((x, i) => x - refC[i]!)),
    )

    const gS4 = s4 <= TOL

    log(`S4 ${ex(s4)} (c ${refC.map(f4).join(' ')})`)

    // ---- the verdict ----
    const gF0 = f0Off <= TOL
    const instrument = gC1 && gB0 && gN1 && gI0 && gF0 && gNorm
    const definition = [s1.self === true, gS2, gS3, gS4]
    const status: 'pass' | 'fail' | 'open' =
      !full || !instrument
        ? 'open'
        : definition.every(Boolean)
          ? 'pass'
          : s1.self === false || !gS2 || !gS3 || !gS4
            ? 'fail'
            : 'open'
    const kMainKappa = Math.sqrt(mainArm.c[WINDOW]!)
    const survives = (kappa: number, L2: number): string =>
      L2 >= HOLD ? 'L held' : kappa >= HOLD ? 'SURVIVES' : 'drops'
    const sample = (series: readonly number[]): string =>
      SAMPLES.filter(t => t < series.length).map(t => `${t}:${f4(series[t]!)}`).join(' ')
    const loveSample = (series: readonly number[]): string =>
      series.slice(0, Math.min(series.length, 13)).map((x, t) => `${t}:${f4(x)}`).join(' ')

    const metrics: Record<string, number> = {
      gate_C1: gC1 ? 1 : 0,
      gate_B0: gB0 ? 1 : 0,
      gate_N1: gN1 ? 1 : 0,
      gate_I0: gI0 ? 1 : 0,
      gate_F0: gF0 ? 1 : 0,
      gate_norm: gNorm ? 1 : 0,
      gate_S1: s1.self === true ? 1 : 0,
      gate_S2: gS2 ? 1 : 0,
      gate_S3line: gS3 ? 1 : 0,
      gate_S4: gS4 ? 1 : 0,
      levelOff,
      reach,
      tau_c: s1.tauC,
      tau_0: s1.tau0,
      line_L1: Ls.get(1) ?? NaN,
      line_L2: Ls.get(2) ?? NaN,
      line_LT: Ls.get(reach) ?? NaN,
      line_cT: c[reach]!,
      line_c0T: c0[reach]!,
      love_tau0_min: tau0s[0]!,
      love_tau0_max: tau0s[tau0s.length - 1]!,
      love_tauC_min: tauCs[0]!,
      love_tauC_max: tauCs[tauCs.length - 1]!,
      love_off: s3LineOff,
      love_norm: s3LineNorm,
      ball_s3Off: s3Off,
      P0_L2: LP0[WINDOW]!,
      main_L2: LC[WINDOW]!,
      main_kappa2: kMainKappa,
      main_fired: mainArm.fired,
      line_kappa2: Math.sqrt(lineArm.c[WINDOW]!),
      n1,
      i0Cut,
      i0W0,
      i0Line,
      f0Off,
      s4,
      normDrift,
      seconds: (Date.now() - started) / 1000,
    }

    for (const m of mixers) {
      const p = m.name.replace('-', '')

      metrics[`${p}_L2`] = m.L2
      metrics[`${p}_kappa2`] = m.kappa
    }

    return verdict({
      status,
      claim: `${setting.name} setting, W ${W} k 3. S1, B1's line self on the line engine (clock 14, split, region docks ${llo - longOff}..${lhi - longOff} of the start, ${lhi - llo + 1} docks) to beat ${reach}: c ${sample(c)}; free-love null c0 ${sample(c0)}; L ${[...Ls].map(([t, x]) => `${t}:${f4(x)}`).join(' ')}; ${s1.self === true ? 'A SELF' : s1.self === false ? 'NOT A SELF' : 'UNDECIDED'} (${s1.reason}). S2 vacuum: ${s2.reason}, c ${vacuumC.map(f4).join(' ')}. S3' lone love on the line engine (24 slots, ${T} beats, region its dock and two neighbours): tau_0 ${tau0s.join(',')}, tau_c ${tauCs.join(',')}, c equal to its free null within ${ex(s3LineOff)}, ${gS3 ? 'NOT A SELF on every slot' : 'the gate fails'} (${s3Line[0]!.reason}); slot 0 c ${loveSample(love0.c)}. 0004's ball S3 (reported): c = c0 within ${ex(s3Off)}, ${s3[0]!.reason}. S4 the cut start's c ${refC.map(f4).join(' ')} over 24 line orientations, C and order within ${ex(s4)}. APPLY, kappa(2) = sqrt c(2) against L(2): E-SLF-0186 line arm (P0, clock 18) kappa ${f4(Math.sqrt(lineArm.c[WINDOW]!))} L ${f4(LP0[WINDOW]!)}; main arm (K at shared dock X* ${xStar - offset}, W0's env slot ${env.single} line ${env.full}) kappa ${f4(kMainKappa)} L ${f4(LC[WINDOW]!)} (K fired on ${f4(mainArm.fired)}, ${mainArm.envs} env outcomes, region weight with any env ${f4(mainArm.inside[WINDOW]!)}): ${survives(kMainKappa, LC[WINDOW]!)}; profile over ${profile.length} docks ${profile.map(p => `${p.X - offset}:${f4(p.kappa)}/${f4(p.L2)}`).join(' ')} (kappa/L); E-SLF-0185 (clock 14) ${mixers.map(m => `${m.name} kappa ${f4(m.kappa)} L ${f4(m.L2)} ${survives(m.kappa, m.L2)}`).join('; ')}.`,
      metrics,
      notes: `L2. Setting ${setting.name}${full ? '' : ' (proves the file runs; not evidence, status open by rule)'}. Gates: C1 ${gC1} (level off ${ex(levelOff)}); B0 ${gB0} (L(1), L(2) ${f4(Ls.get(1) ?? NaN)} ${f4(Ls.get(2) ?? NaN)} against ${L_0020.join(' ')}; P0 ${f4(LP0[WINDOW]!)} against ${P0_0186}; main ${f4(LC[WINDOW]!)} against ${MAIN_0186}; K variant F off ${ex(fSame)}; mixers off 0185 by ${ex(mixOff)}); N1 ${gN1} (${ex(n1)}); I0 ${gI0} (cut ${ex(i0Cut)}, W0 dock ${ex(i0W0)} with K fired ${w0Run.kFired}, line ${ex(i0Line)}); F0 ${gF0} (${ex(f0Off)}); norm ${gNorm} (${ex(normDrift)}; lone loves ${ex(s3LineNorm)}); S1 ${s1.self} (tau_c ${s1.tauC}, tau_0 ${s1.tau0}, reach ${reach}); S2 ${gS2}; S3' ${gS3} (24 slots, ${loves.filter(l => l.mode % 2 === 1).length} forward and ${loves.filter(l => l.mode % 2 === 0).length} back; ball frontier hits ${s3Frontier}); S4 ${gS4}. In a calm complement c = r_A^2 (note/self-reader.md section 2, checked by I0), so the line self's and the lone love's c are read as r_A^2 every beat. A lone love has no flux link and no full dock, so the line rule gives it no phase and c = c0 is expected; S3' asks only that the null's half time is reached and the love does not outlast twice it. The arms are a two-beat window (Lemma W and cross-line-dock's argument), where tau_c cannot be read; kappa(2) is the region's recoverable weight. The free null is the working rule's one-love walk as free fermions (no drift cost, no meeting phase).`,
    })
  },
})
