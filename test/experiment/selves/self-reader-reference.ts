// THE SELF READER AGAINST A REFERENCE RULE (a recorded trap; note/self-reader.md
// section 7; code/measure/self-reference.ts). E-SLF-0194 read every keel-and-flame arm as a self (c 0.77 to 0.92 at beat
// 80) though the twisted arms broke B1's bound level (L 0.13). The diagnosis: the reader's parts formula is the
// definition's closure only when the state ran under the rule that runs it back, and 0194 applied it to runs under the
// bare rule times an opt-in shape phase, where with the support as region it is retention alone. The amended reader is
// the definition with the reference rule U run back: c_ref = <phi_t| Tr_E(psi_t psi_t^dag) (x) |eps_t><eps_t| |phi_t>,
// phi_t = U^t psi_0. It equals the old reader exactly when psi = phi.
//
// ONE RUN: every gate of E-SLF-0191 (its instruments, S1, S2, S3', S4) read again by c_ref, and E-SLF-0194's arms (A0,
// K, R, F, F', C, C0, C1, C2) each run beside its reference A0 in lockstep. The old reader's readings print beside,
// ungated. E-SLF-0191's PASS and E-SLF-0194's FAIL stay on the record unchanged.
//
// THE GATES are the item's `what` (gate d8d782664d9a, set before any probe). Depth L2: B1's line rule in floats on the
// line engine (honeycomb-exact for a state on one line); the ball gates are the exact R = 4 ball with sparse branches;
// the register is a model piece beside the line, not the mesh.

import { experiment } from '@/test/scaffold/suite'
import { verdict } from '@/test/scaffold/verdict'
import { lineBasis, lineLightest, wholeBasis } from '@/code/measure/coined-line-bloch'
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
  type BallTerm,
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
  type Mixer,
} from '@/code/measure/self-reader-ball'
import {
  armRun,
  closureAgainst,
  lineLoveReference,
  referenceClosure,
  type Arm,
  type ArmRun,
  type LoveReference,
} from '@/code/measure/self-reference'
import { SECTORS } from '@/code/measure/keel-flame'
import { LINE_FIRSTS, OPPOSITE } from '@/code/rule/isometric-knit'

const RECORDED = { energy: 0.33001851839229945 }

// E-SLF-0191's references (as there)
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
// E-SLF-0194's recorded c(80) and L(80) per arm, and its tau_0
const C_0194: Record<string, number> = {
  A0: 0.9208,
  K: 0.9208,
  R: 0.8547,
  F: 0.8046,
  Fbar: 0.8407,
  C: 0.8488,
  C0: 0.8522,
  C1: 0.7734,
  C2: 0.924,
}
const L_0194: Record<string, number> = {
  A0: 0.9486,
  K: 0.9486,
  R: 0.4017,
  F: 0.1297,
  Fbar: 0.1269,
  C: 0.2948,
  C0: 0.292,
  C1: 0.286,
  C2: 0.3063,
}
const TAU0_0194 = 11
const REF_TOL = 1e-3
const TOL = 1e-12
const SECTOR_TOL = 1e-10
const NORM_TOL = 1e-9
const HOLD = 0.9
const WINDOW = 2
const PARTS_BEATS = 4
const SAMPLES = [0, 1, 2, 4, 8, 16, 32, 64, 96]
const ARM_SAMPLES = [0, 1, 2, 4, 8, 12, 16, 20, 24, 32, 40, 48, 56, 64, 72, 80]

type Setting = {
  name: 'smoke' | 'full'
  box: number
  levelBar: number
  W: number
  T: number
  armT: number
  cap: number
  ballRadius: number
}

const SMOKE: Setting = { name: 'smoke', box: 8, levelBar: 1e-4, W: 10, T: 12, armT: 12, cap: 1e7, ballRadius: 3 }
const FULL: Setting = { name: 'full', box: 12, levelBar: 1e-9, W: 12, T: 96, armT: 80, cap: 1.5e8, ballRadius: 4 }

const widthOf = (W: number, fit: readonly Placed[]): number =>
  W + Math.max(...fit.flatMap(p => p.ts.map(t => t[0])))

const f4 = (x: number): string => (Number.isFinite(x) ? x.toFixed(4) : String(x))
const ex = (x: number): string => (Number.isFinite(x) ? x.toExponential(1) : String(x))
const maxAbs = (xs: readonly number[]): number => xs.reduce((m, x) => Math.max(m, Math.abs(x)), 0)
const maxDiff = (xs: readonly number[], ys: readonly number[]): number =>
  xs.reduce((m, x, i) => Math.max(m, Math.abs(x - (ys[i] ?? NaN))), 0)
const word = (s: SelfReading): string =>
  s.self === true ? 'A SELF' : s.self === false ? 'NOT A SELF' : 'UNDECIDED'

// both readers on one set of ball terms: the old closure and the reference closure with the run as its own reference
const bothOn = (terms: Iterable<BallTerm>, inRegion: (slot: number) => boolean): { c: number; cRef: number } => {
  const parts = ballParts(terms, inRegion)

  return { c: closureOf(parts).c, cRef: closureAgainst(parts, parts).c }
}

export default experiment({
  id: 'selves/self-reader-reference',
  code: 'E-SLF-0197',
  title:
    "the self reader read against a reference rule (a recorded trap): the closure's run back made with the rule the reading names, so a state run under an opt-in piece is read against the start's own run without it; every gate of E-SLF-0191 rerun under the amended reader, and E-SLF-0194's keel-and-flame arms read again, the old reader printed beside",
  category: 'selves',
  substrates: ['3434'],
  depth: 'L2',
  paper: false,
  run() {
    const started = Date.now()
    const setting = process.env.SELF_SWEEP === 'full' ? FULL : SMOKE
    const full = setting.name === 'full'
    const log = (what: string): void => console.error(`${what} ${Math.round((Date.now() - started) / 1000)}s`)
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

    // ---- the two-beat arms (E-SLF-0186's line engine), as E-SLF-0191 ----
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
    const i0Line = maxAbs(lineArm.c.map((c, i) => c - lineArm.inside[i]! ** 2))

    log(`arms: P0 L ${LP0.map(f4).join(' ')}, main L ${LC.map(f4).join(' ')}, c ${mainArm.c.map(f4).join(' ')}`)

    // ---- the mixers (E-SLF-0185, clock 14): the old kappa and kappa_ref against the bare line rule ----
    const mixRun = (m: Mixer | undefined): ConeStore => {
      let a = make(PI7)

      for (let t = 1; t <= WINDOW; t++) {
        if (m) {
          mixPass(a, m.lone, m.full)
        }

        const b = coneStore(a.n, a.line, a.cap, a.clock)

        coneBeat(a, b, true)
        a = b
      }

      return a
    }
    const bareMix = mixRun(undefined)
    const mixF0 = coneBoundCount(make(PI7), rd)
    const mixers = [undefined, ...MIXERS].map(m => {
      const a = m ? mixRun(m) : bareMix

      return {
        name: m?.name ?? 'bare',
        L2: coneBoundCount(a, rd) / mixF0,
        kappa: regionRetention(a, lo, hi),
        kappaRef: Math.sqrt(referenceClosure(bareMix, [a], lo, hi)),
      }
    })
    const mixOff = full
      ? Math.max(...mixers.filter(m => m.name !== 'bare').map(m => Math.abs(m.L2 - MIX_0185[m.name]!)))
      : NaN

    log(`mixers ${mixers.map(m => `${m.name} L ${f4(m.L2)} kappa ${f4(m.kappa)} kappa_ref ${f4(m.kappaRef)}`).join('; ')}`)

    // ---- F0 ----
    const cut = cutLevel(placed)
    const cutStore = coneStore(3, line, 1e6, PI7)
    const mid = Math.floor(line / 2)

    for (const p of cut) {
      addAmp(cutStore, Int32Array.from(p.ts.map(([x, j]) => 2 * (mid + x) + (j === 0 ? 1 : 0)).sort((a, b) => a - b)), p.re, p.im)
    }

    const f0 = freeNull({ psi: configsOf(cutStore), line, lo: mid - 1, hi: mid + 1, beats: WINDOW, checkBeat: WINDOW })
    const f0Off = Math.abs(f0.r0[WINDOW]! - f0.direct!)

    log(`F0 ${ex(f0Off)}`)

    // ---- S1: the line self over T beats, both readers ----
    const T = setting.T
    const longLine = width + 2 * T + 12
    const longOff = T + 5
    const rdLong = lineReader(placed, longLine, read, false)
    let a = coneStart({ n: 3, line: longLine, cap: setting.cap, W, placed: fit, bath: [], offset: longOff, clock: PI7 }).store
    const psi = configsOf(a)
    const [llo, lhi] = supportOf(a)
    const F0 = coneBoundCount(a, rdLong)
    const r = [regionRetention(a, llo, lhi)]
    const s1Ref = [referenceClosure(a, [a], llo, lhi)]
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
      s1Ref.push(referenceClosure(a, [a], llo, lhi))

      if (SAMPLES.includes(t) || t === T) {
        Ls.set(t, coneBoundCount(a, rdLong) / F0)
        normDrift = Math.max(normDrift, Math.abs(coneNorm(a) - 1))
        log(`S1 beat ${t}: c ${f4(r[t]! ** 2)} c_ref ${f4(s1Ref[t]!)}, L ${f4(Ls.get(t)!)}, store ${a.used}`)
      }
    }

    const c = r.map(x => x * x)
    const fn = freeNull({ psi, line: longLine, lo: llo, hi: lhi, beats: reach })
    const c0 = fn.r0.map(x => x * x)
    const s1 = readSelf(3, c, c0)
    const s1Star = readSelf(3, s1Ref, c0)
    const a1S1 = maxDiff(s1Ref, c)
    const gNorm = normDrift <= NORM_TOL
    const gB0 =
      !full ||
      (L_0020.every((x, i) => Math.abs(Ls.get(i + 1)! - x) <= REF_TOL) &&
        Math.abs(LP0[WINDOW]! - P0_0186) <= REF_TOL &&
        Math.abs(LC[WINDOW]! - MAIN_0186) <= REF_TOL &&
        fSame <= TOL &&
        mixOff <= REF_TOL)

    log(`S1 old ${s1.reason}, ref ${s1Star.reason}, A1 ${ex(a1S1)}`)

    // ---- S3': a lone love on the line engine, both readers ----
    const loves: LoveReference[] = Array.from({ length: 24 }, (_, s) => lineLoveReference(s, T, PI7))
    const s3Old = loves.map(l => readSelf(1, l.c, l.c0))
    const s3Star = loves.map(l => readSelf(1, l.cRef, l.c0))
    const a1S3 = Math.max(...loves.map(l => l.refOff))
    const s3Off = Math.max(...loves.map(l => l.off))
    const s3Norm = Math.max(...loves.map(l => l.norm))
    const tau0s = [...new Set(loves.map(l => l.tau0))].sort((x, y) => x - y)
    const tauRefs = [...new Set(loves.map(l => l.tauRef))].sort((x, y) => x - y)
    const gS3old = loves.every(l => Number.isFinite(l.tau0) && l.tauC < 2 * l.tau0)
    const gS3 = loves.every(l => Number.isFinite(l.tau0) && l.tauRef < 2 * l.tau0)

    log(`S3' A1 ${ex(a1S3)}, off c0 ${ex(s3Off)}, tau_0 ${tau0s.join(',')}, tau_ref ${tauRefs.join(',')}`)

    // ---- the ball, both readers ----
    const R = setting.ballRadius
    const ball = ballOf(R)
    const loneBeats = R - 1
    const cutBeats = R - 2
    let a1Ball = 0

    log('ball')

    // N1: a lone love on each slot of dock 0 against the free walk
    const fl = 2 * R + 10
    const fo = R + 5
    let n1 = 0

    for (let d = 0; d < 24; d++) {
      const run = ballRun(ball, [{ slots: [d], values: [1], re: 1, im: 0 }], loneBeats)
      const free = freeLove(fl, 2 * fo + 1, loneBeats)
      const { pos } = lineDocks(ball, d)

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

        for (let p = -fo; p < fl - fo; p++) {
          const x = fo + p
          const v = free[t]!
          const w = v[4 * x]! ** 2 + v[4 * x + 1]! ** 2 + v[4 * x + 2]! ** 2 + v[4 * x + 3]! ** 2

          n1 = Math.max(n1, Math.abs(w - (byPos.get(p) ?? 0)))
        }

        const inRegion = (s: number): boolean => Math.abs(pos.get(Math.floor(s / 24)) ?? 99) <= 1
        const both = bothOn(run.per[t]!, inRegion)

        a1Ball = Math.max(a1Ball, Math.abs(both.c - both.cRef))
      }
    }

    const gN1 = n1 <= TOL

    log(`N1 ${ex(n1)}`)

    // S2: the empty vacuum
    let vacuum: { c: number; cRef: number }[] = []

    try {
      const run = ballRun(ball, [{ slots: [], values: [], re: 1, im: 0 }], loneBeats)

      vacuum = run.per.map(terms => bothOn(terms, () => true))
    } catch (err) {
      vacuum = [{ c: NaN, cRef: NaN }]
      log(`S2 run: ${(err as Error).message}`)
    }

    const s2 = readSelf(0, vacuum.map(v => v.c), vacuum.map(v => v.c))
    const s2Star = readSelf(0, vacuum.map(v => v.cRef), vacuum.map(v => v.cRef))
    const gS2old = s2.self === false
    const gS2 = s2Star.self === false

    a1Ball = Math.max(a1Ball, ...vacuum.map(v => Math.abs(v.c - v.cRef)))

    // I0: the general formula against r_A^2, the cut start on l and W0's dock, both readers
    const cutL = cutOnBall(ball, cut, D0, 1, false)
    const cutRun = ballRun(ball, cutL.starts, cutBeats)
    const cutBoth = cutRun.per.map(terms => bothOn(terms, cutL.inRegion))
    const i0Cut = maxAbs(cutRun.per.map((terms, t) => cutBoth[t]!.c - ballRetention(terms, cutL.inRegion) ** 2))
    const i0CutRef = maxAbs(cutRun.per.map((terms, t) => cutBoth[t]!.cRef - ballRetention(terms, cutL.inRegion) ** 2))
    const w0Beats = Math.min(2, R - 1)
    const lDocks = lineDocks(ball, D0)
    const w0Region = new Set([-1, 0, 1].map(p => lDocks.dockAt.get(p)!))
    const w0In = (s: number): boolean => w0Region.has(Math.floor(s / 24))
    const w0Slots = [D0, env.single, LINE_FIRSTS[env.full]!, OPPOSITE[LINE_FIRSTS[env.full]!]!]
    const w0Run = ballRun(ball, [{ slots: w0Slots, values: w0Slots.map(() => 1), re: 1, im: 0 }], w0Beats)
    const w0Both = w0Run.per.map(terms => bothOn(terms, w0In))
    const i0W0 = maxAbs(w0Run.per.map((terms, t) => w0Both[t]!.c - ballRetention(terms, w0In) ** 2))
    const i0W0Ref = maxAbs(w0Run.per.map((terms, t) => w0Both[t]!.cRef - ballRetention(terms, w0In) ** 2))
    const gI0 = i0Cut <= TOL && i0W0 <= TOL && i0Line <= TOL && w0Run.kFired > 0

    a1Ball = Math.max(a1Ball, ...cutBoth.map(v => Math.abs(v.c - v.cRef)), ...w0Both.map(v => Math.abs(v.c - v.cRef)))

    log(`I0 cut ${ex(i0Cut)} (ref ${ex(i0CutRef)}), W0 ${ex(i0W0)} (ref ${ex(i0W0Ref)}, K fired ${w0Run.kFired}), line ${ex(i0Line)}`)

    // S4: the cut start on every line and orientation, C, and the members' order, both readers
    const cutBothOf = (fwd: number, value: number, reverse: boolean): { c: number; cRef: number }[] => {
      const s = cutOnBall(ball, cut, fwd, value, reverse)

      return ballRun(ball, s.starts, cutBeats).per.map(terms => bothOn(terms, s.inRegion))
    }
    const refBoth = cutBothOf(D0, 1, false)
    const variants: { c: number; cRef: number }[][] = []

    for (let k = 0; k < 12; k++) {
      for (const fwd of [LINE_FIRSTS[k]!, OPPOSITE[LINE_FIRSTS[k]!]!]) {
        variants.push(cutBothOf(fwd, 1, false))
      }
    }

    variants.push(cutBothOf(D0, -1, false), cutBothOf(D0, 1, true))

    let s4 = 0
    let s4Ref = 0

    for (const v of [refBoth, ...variants]) {
      a1Ball = Math.max(a1Ball, ...v.map(x => Math.abs(x.c - x.cRef)))
    }

    for (const v of variants) {
      s4 = Math.max(s4, maxAbs(v.map((x, i) => x.c - refBoth[i]!.c)))
      s4Ref = Math.max(s4Ref, maxAbs(v.map((x, i) => x.cRef - refBoth[i]!.cRef)))
    }

    const gS4old = s4 <= TOL
    const gS4 = s4Ref <= TOL
    const gF0 = f0Off <= TOL

    log(`S4 ${ex(s4)} ref ${ex(s4Ref)}; A1 ball ${ex(a1Ball)}`)

    // ---- E-SLF-0194's frame and arms ----
    const armT = setting.armT
    const armLine = width + 2 * armT + 12
    const armOff = armT + 5
    const armRd = lineReader(placed, armLine, read, false)
    const armStart = coneStart({ n: 3, line: armLine, cap: setting.cap, W, placed: fit, bath: [], offset: armOff, clock: PI7 }).store
    const [alo, ahi] = supportOf(armStart)
    const armF0 = coneBoundCount(armStart, armRd)
    const armNull = freeNull({ psi: configsOf(armStart), line: armLine, lo: alo, hi: ahi, beats: armT })
    const armC0 = armNull.r0.map(x => x * x)
    const samples = [...new Set([...ARM_SAMPLES.filter(t => t <= armT), armT])]
    const arms: Arm[] = [
      { name: 'A0', kind: 'twist', table: [0, 0, 0] },
      { name: 'F', kind: 'twist', table: [0, 1, 2] },
      { name: 'Fbar', kind: 'twist', table: [0, 2, 1] },
      { name: 'C0', kind: 'twist', table: SECTORS.C[0]! },
      { name: 'C1', kind: 'twist', table: SECTORS.C[1]! },
      { name: 'C2', kind: 'twist', table: SECTORS.C[2]! },
      { name: 'K', kind: 'register', rule: 'K' },
      { name: 'R', kind: 'register', rule: 'R' },
      { name: 'C', kind: 'register', rule: 'C' },
    ]
    const runs = new Map<string, ArmRun>()

    for (const arm of arms) {
      const run = armRun({
        arm,
        start: armStart,
        lo: alo,
        hi: ahi,
        rd: armRd,
        F0: armF0,
        T: armT,
        samples,
        partsBeats: arm.name === 'F' || arm.name === 'C' ? PARTS_BEATS : -1,
        log: arm.kind === 'register' ? log : undefined,
      })

      runs.set(arm.name, run)
      log(`${arm.name}: reach ${run.reach}, c(T) ${f4(run.c[run.reach]!)} c_ref(T) ${f4(run.cRef[run.reach]!)} c_ref(1) ${f4(run.cRef[1] ?? NaN)} L(T) ${f4(run.L.get(run.reach) ?? NaN)}`)
    }

    const get = (name: string): ArmRun => runs.get(name)!
    const reachAll = Math.min(...[...runs.values()].map(x => x.reach))
    const gReach = reachAll === armT
    const gArmNorm = [...runs.values()].every(x => x.normDrift <= NORM_TOL)
    const i1 = Math.max(get('F').partsOff, get('C').partsOff)
    const gI1 = i1 <= TOL
    const e0Self = Math.max(maxDiff(get('A0').cRef, get('A0').c), maxDiff(get('K').cRef, get('K').c))
    const meanOf = (names: readonly string[]): number[] =>
      Array.from({ length: reachAll + 1 }, (_, t) => names.reduce((s, n) => s + get(n).cRef[t]!, 0) / names.length)
    const e0R = maxDiff(get('R').cRef.slice(0, reachAll + 1), meanOf(['A0', 'F', 'Fbar']))
    const e0C = maxDiff(get('C').cRef.slice(0, reachAll + 1), meanOf(['C0', 'C1', 'C2']))
    const gE0 = e0Self <= TOL && e0R <= SECTOR_TOL && e0C <= SECTOR_TOL
    const armTau0 = readSelf(3, get('A0').c, armC0).tau0
    const A0 = get('A0')
    const b1Off = full
      ? Math.max(
          ...L_0020.map((x, i) => Math.abs(A0.L.get(i + 1)! - x)),
          ...arms.map(x => Math.abs(get(x.name).c[armT]! - C_0194[x.name]!)),
          ...arms.map(x => Math.abs(get(x.name).L.get(armT)! - L_0194[x.name]!)),
        )
      : NaN
    const gB1 = !full || (b1Off <= REF_TOL && armTau0 === TAU0_0194)

    log(`I1 ${ex(i1)}; E0 self ${ex(e0Self)} R ${ex(e0R)} C ${ex(e0C)}; B1 off ${ex(b1Off)} tau_0 ${armTau0}`)

    const judged = arms.map(x => {
      const run = get(x.name)
      const old = readSelf(3, run.c.slice(0, reachAll + 1), armC0)
      const star = readSelf(3, run.cRef.slice(0, reachAll + 1), armC0)

      return { name: x.name, old, star, run }
    })
    const j = (name: string) => judged.find(x => x.name === name)!
    const gG0 = j('A0').star.self === true
    const gG1 = j('F').star.self === false
    const gG2 = j('Fbar').star.self === false
    const gG3 = j('C').star.self === false

    // ---- the verdict ----
    const gA1 = a1S1 <= TOL && a1S3 <= TOL && a1Ball <= TOL
    const instrument = gC1 && gB0 && gN1 && gI0 && gF0 && gNorm && gA1 && gI1 && gB1 && gE0 && gArmNorm && gReach
    const definition = [s1Star.self === true, gS2, gS3, gS4, gG0, gG1, gG2, gG3]
    const status: 'pass' | 'fail' | 'open' =
      !full || !instrument ? 'open' : definition.every(Boolean) ? 'pass' : 'fail'
    const kMainKappa = Math.sqrt(mainArm.c[WINDOW]!)
    const survives = (kappa: number, L2: number): string =>
      L2 >= HOLD ? 'L held' : kappa >= HOLD ? 'SURVIVES' : 'drops'
    const sample = (series: readonly number[], at: readonly number[]): string =>
      at.filter(t => t < series.length).map(t => `${t}:${f4(series[t]!)}`).join(' ')
    const loveSample = (series: readonly number[]): string =>
      series.slice(0, Math.min(series.length, 6)).map((x, t) => `${t}:${f4(x)}`).join(' ')
    const armLine1 = (x: (typeof judged)[number]): string =>
      `${x.name}: NEW ${word(x.star)} (tau_c ${x.star.tauC}, c_ref(1) ${f4(x.run.cRef[1]!)}, c_ref(T) ${f4(x.run.cRef[reachAll]!)}), OLD ${word(x.old)} (tau_c ${x.old.tauC}, c(T) ${f4(x.run.c[reachAll]!)}), L(T) ${f4(x.run.L.get(reachAll) ?? NaN)}`

    const metrics: Record<string, number> = {
      gate_C1: gC1 ? 1 : 0,
      gate_B0: gB0 ? 1 : 0,
      gate_N1: gN1 ? 1 : 0,
      gate_I0: gI0 ? 1 : 0,
      gate_F0: gF0 ? 1 : 0,
      gate_norm: gNorm ? 1 : 0,
      gate_A1: gA1 ? 1 : 0,
      gate_I1: gI1 ? 1 : 0,
      gate_B1: gB1 ? 1 : 0,
      gate_E0: gE0 ? 1 : 0,
      gate_arm_norm: gArmNorm ? 1 : 0,
      gate_reach: gReach ? 1 : 0,
      gate_S1: s1Star.self === true ? 1 : 0,
      gate_S2: gS2 ? 1 : 0,
      gate_S3line: gS3 ? 1 : 0,
      gate_S4: gS4 ? 1 : 0,
      gate_G0: gG0 ? 1 : 0,
      gate_G1: gG1 ? 1 : 0,
      gate_G2: gG2 ? 1 : 0,
      gate_G3: gG3 ? 1 : 0,
      old_S1: s1.self === true ? 1 : 0,
      old_S2: gS2old ? 1 : 0,
      old_S3line: gS3old ? 1 : 0,
      old_S4: gS4old ? 1 : 0,
      levelOff,
      reach,
      tau_0: s1.tau0,
      line_cT: c[reach]!,
      line_cRefT: s1Ref[reach]!,
      a1S1,
      a1S3,
      a1Ball,
      i1,
      e0Self,
      e0R,
      e0C,
      b1Off,
      arm_tau_0: armTau0,
      arm_reach: reachAll,
      s4,
      s4Ref,
      i0CutRef,
      i0W0Ref,
      love_tau0_min: tau0s[0]!,
      love_tau0_max: tau0s[tau0s.length - 1]!,
      love_tauRef_min: tauRefs[0]!,
      love_tauRef_max: tauRefs[tauRefs.length - 1]!,
      main_kappa2: kMainKappa,
      seconds: (Date.now() - started) / 1000,
    }

    for (const x of judged) {
      metrics[`${x.name}_cT`] = x.run.c[reachAll]!
      metrics[`${x.name}_cRefT`] = x.run.cRef[reachAll]!
      metrics[`${x.name}_cRef1`] = x.run.cRef[1] ?? NaN
      metrics[`${x.name}_LT`] = x.run.L.get(reachAll) ?? NaN
      metrics[`${x.name}_tauC_old`] = x.old.tauC
      metrics[`${x.name}_tauC_ref`] = x.star.tauC
      metrics[`${x.name}_self_ref`] = x.star.self === true ? 1 : x.star.self === false ? 0 : NaN
    }

    for (const m of mixers) {
      const p = m.name.replace('-', '')

      metrics[`${p}_L2`] = m.L2
      metrics[`${p}_kappa2`] = m.kappa
      metrics[`${p}_kappaRef2`] = m.kappaRef
    }

    return verdict({
      status,
      claim: `${setting.name} setting, W ${W} k 3. E-SLF-0191 UNDER THE REFERENCE CLOSURE: S1 B1's line self (region ${lhi - llo + 1} docks) to beat ${reach}: c_ref ${sample(s1Ref, SAMPLES)} (old c within ${ex(a1S1)}), null c0 ${sample(c0, SAMPLES)}, L ${[...Ls].map(([t, x]) => `${t}:${f4(x)}`).join(' ')}: NEW ${word(s1Star)} (${s1Star.reason}), OLD ${word(s1)}. S2 vacuum NEW ${s2Star.reason}, OLD ${s2.reason}. S3' lone love, 24 slots, ${T} beats: tau_0 ${tau0s.join(',')}, tau_c (new) ${tauRefs.join(',')}, c_ref = c within ${ex(a1S3)}, ${gS3 ? 'NOT A SELF on every slot' : 'the gate fails'} (OLD ${gS3oldWord(gS3old)}), slot 0 c_ref ${loveSample(loves[0]!.cRef)}. S4 c_ref over 24 orientations, C and order within ${ex(s4Ref)} (old ${ex(s4)}). Ball readings c_ref = c within ${ex(a1Ball)}. E-SLF-0194'S ARMS (${armT} beats, support ${ahi - alo + 1} docks, null tau_0 ${armTau0}, c0 ${sample(armC0, samples)}): ${judged.map(armLine1).join('. ')}. c_ref by beat: ${judged.map(x => `${x.name} ${sample(x.run.cRef, samples)}`).join('; ')}. Old c by beat: ${judged.map(x => `${x.name} ${sample(x.run.c, samples)}`).join('; ')}. APPLY (reported): E-SLF-0186 main arm kappa(2) ${f4(kMainKappa)} against L ${f4(LC[WINDOW]!)} (${survives(kMainKappa, LC[WINDOW]!)}, its reference is its own rule, so unchanged); E-SLF-0185 against the bare line rule ${mixers.map(m => `${m.name} kappa ${f4(m.kappa)} kappa_ref ${f4(m.kappaRef)} L ${f4(m.L2)}`).join('; ')}.`,
      metrics,
      notes: `L2. Setting ${setting.name}${full ? '' : ' (proves the file runs; not evidence, status open by rule)'}. Instruments: C1 ${gC1} (${ex(levelOff)}); B0 ${gB0} (L(1), L(2) ${f4(Ls.get(1) ?? NaN)} ${f4(Ls.get(2) ?? NaN)}; P0 ${f4(LP0[WINDOW]!)}; main ${f4(LC[WINDOW]!)}; K variant F off ${ex(fSame)}; mixers off 0185 ${ex(mixOff)}); N1 ${gN1} (${ex(n1)}); I0 ${gI0} (cut ${ex(i0Cut)}, W0 ${ex(i0W0)} K fired ${w0Run.kFired}, line ${ex(i0Line)}); F0 ${gF0} (${ex(f0Off)}); norm ${gNorm} (${ex(normDrift)}, lone loves ${ex(s3Norm)}); A1 ${gA1} (S1 ${ex(a1S1)}, S3' ${ex(a1S3)}, ball ${ex(a1Ball)}); I1 ${gI1} (${ex(i1)}); B1 ${gB1} (off ${ex(b1Off)}, tau_0 ${armTau0}); E0 ${gE0} (self ${ex(e0Self)}, R ${ex(e0R)}, C ${ex(e0C)}); arm norm ${gArmNorm}; reach ${gReach} (${reachAll} of ${armT}). Definition, new reader: S1 ${s1Star.self}, S2 ${gS2}, S3' ${gS3}, S4 ${gS4}, G0 A0 ${j('A0').star.self}, G1 F ${j('F').star.self}, G2 F' ${j('Fbar').star.self}, G3 C ${j('C').star.self}. The reference closure reads the region's state against the start's own run under the reference rule (B1's line rule, clock 14, split, no twist, steer or write); it equals the old closure when the run is the reference rule.`,
    })
  },
})

const gS3oldWord = (ok: boolean): string => (ok ? 'NOT A SELF on every slot' : 'fails')
