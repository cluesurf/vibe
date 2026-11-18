// A SELF WITH A KEEL AND A FLAME (item vibe-roadmap-grounding-0027; future-models.md, Living Lattice ideas 1 and 3;
// code/measure/keel-flame.ts). The flame is B1's lone 3-love cluster on the line engine (B1's line rule, clock 14,
// split). The keel is its bound level (kept for ever under B1's rule, E-SLF-0188) plus a history register in Z3 beside
// the line. Before each line beat the register may steer (the phase w^(h o), o the flame's orientation: which end of
// the cluster holds the full dock) and the flame may write into it (h -> h + o mod 3, a controlled shift). Every piece
// is opt-in, exactly unitary and reversible, with amplitudes in Z[zeta_42].
//
// ARMS: A0 bare; K the frozen keel (register held, never written or read: the majority-vote style repeat); R the
// recording keel (write only); F the flame alone (the fixed twist w^o, no register; F' its conjugate w^(2o)); C the
// coupled pair (steer then write); C0, C1, C2 the three fixed twists whose mean is C's flame (keel-flame.ts, THE
// SECTORS); the bath arm: B1's 3-love bath at the fixed slots bathLoves(W, read, 3, s), s = 0, 1, 2, from beat 0, bare
// and C (through its sectors), read as E-SLF-0184's excess g.
//
// READINGS, each arm to beat T: identity (the self reader's closure c = r^2 of the start's support against the free
// null c0, E-SLF-0191's S1, and L = F / F0); the inside (the return weight P(t) = <psi0| rho_flame |psi0>); the
// register's memory (I = 2 S(rho_register) bits, the mutual information of register and flame in the pure whole); B-50,
// building (C and R run again from beat T/2 with the register shifted by d = 1, 2, and the flame's trace distance from
// the unshifted run).
//
// The gates are the item's `what` (pre-registered before any probe). Depth L2: B1's line rule in floats on the line
// engine (honeycomb-exact for a state on one line); the register is a model piece beside the line, not the mesh.

import { experiment } from '@/test/scaffold/suite'
import { verdict } from '@/test/scaffold/verdict'
import { lineBasis, lineLightest, wholeBasis } from '@/code/measure/coined-line-bloch'
import { fitRing, levelPlacement } from '@/code/measure/held-cluster'
import type { Placed } from '@/code/measure/held-cluster'
import { bathLoves, lineReader, type LineReader } from '@/code/measure/cold-line'
import {
  ConeCap,
  coneBeat,
  coneBoundCount,
  coneNorm,
  coneStart,
  coneStore,
  copyStore,
  eachConfiguration,
  registerPass,
  shapePass,
  storeDifference,
  type ConeStore,
} from '@/code/measure/cone-line'
import { configsOf, freeNull, readSelf, regionRetention, supportOf } from '@/code/measure/self-reader'
import {
  OMEGA,
  SECTORS,
  flameDistance,
  orientationOf,
  registerEntropy,
  returnWeight,
  steerOf,
  twistOf,
  valueEntropy,
  writeOf,
  type RegisterRule,
} from '@/code/measure/keel-flame'

const RECORDED = { energy: 0.33001851839229945 }
const PI7 = 14

// E-SLF-0191's line self: L(1), L(2), tau_0; 0019's open g at W 12 k 3, beats 0 to 11 (locked-mixer's G_0019)
const L_0191 = [0.917, 0.959]
const TAU0_0191 = 11
const G_0019 = [1.017, 0.872, 0.872, 0.695, 0.705, 0.582, 0.6, 0.52, 0.563, 0.518, 0.544, 0.541]
const REF_TOL = 1e-3
const G_TOL = 6e-4
const EXACT_TOL = 1e-12
const SECTOR_TOL = 1e-10
const RELABEL_TOL = 1e-15
const DIST_FLOOR = 1e-6
const NORM_TOL = 1e-9
const WEIGHT_FLOOR = 1e-3
const HALF = 0.5
const MEMORY_BAR = 0.5
const BUILD_BAR = 0.1

type Setting = {
  name: 'smoke' | 'full'
  box: number
  levelBar: number
  W: number
  T: number
  cap: number
  bathBeats: number
  starts: number
}

const SMOKE: Setting = { name: 'smoke', box: 8, levelBar: 1e-4, W: 10, T: 12, cap: 1e7, bathBeats: 3, starts: 1 }
const FULL: Setting = { name: 'full', box: 12, levelBar: 1e-9, W: 12, T: 80, cap: 1.5e8, bathBeats: 11, starts: 3 }

const widthOf = (W: number, fit: readonly Placed[]): number =>
  W + Math.max(...fit.flatMap(p => p.ts.map(t => t[0])))

const f4 = (x: number): string => (Number.isFinite(x) ? x.toFixed(4) : String(x))
const ex = (x: number): string => (Number.isFinite(x) ? x.toExponential(1) : String(x))
const mean = (xs: readonly number[]): number => xs.reduce((s, x) => s + x, 0) / xs.length

// a run's readings: r (the support's weight) and P every beat, L and norm at the samples, the register at the samples
type Run = {
  name: string
  reach: number
  r: number[]
  P: number[]
  L: Map<number, number>
  normDrift: number
  bits: Map<number, number>
  spread: Map<number, number>
  // B-50: the shift d -> the flame's trace distance at the samples from the branch beat
  D: Map<number, Map<number, number>>
  relabel: number
}

type Frame = { start: ConeStore; lo: number; hi: number; rd: LineReader; F0: number; samples: number[] }

function blankRun(name: string, f: Frame): Run {
  return {
    name,
    reach: 0,
    r: [regionRetention(f.start, f.lo, f.hi)],
    P: [returnWeight(f.start, [f.start])],
    L: new Map([[0, 1]]),
    normDrift: Math.abs(coneNorm(f.start) - 1),
    bits: new Map(),
    spread: new Map(),
    D: new Map(),
    relabel: 0,
  }
}

// one flame with a fixed twist (table of w powers on o = 0, 1, 2), no register
function twistRun(name: string, table: readonly number[], T: number, f: Frame): Run {
  const run = blankRun(name, f)
  const twist = twistOf(table)
  const plain = table.every(j => j % 3 === 0)

  let a = copyStore(f.start)
  let b = coneStore(a.n, a.line, a.cap, a.clock)

  for (let t = 1; t <= T; t++) {
    if (!plain) {
      shapePass(a, twist)
    }

    try {
      coneBeat(a, b, true)
    } catch (err) {
      if (err instanceof ConeCap) {
        break
      }

      throw err
    }

    ;[a, b] = [b, a]
    run.reach = t
    run.r.push(regionRetention(a, f.lo, f.hi))
    run.P.push(returnWeight(f.start, [a]))

    if (f.samples.includes(t)) {
      run.L.set(t, coneBoundCount(a, f.rd) / f.F0)
      run.normDrift = Math.max(run.normDrift, Math.abs(coneNorm(a) - 1))
    }
  }

  return run
}

type Pair = { A: ConeStore[]; B: ConeStore[] }

const empty = (s: ConeStore): ConeStore => coneStore(s.n, s.line, s.cap, s.clock)

// the register's beat on (A, B): the pieces into B, the line beat back into A
function registerBeat(p: Pair, rule: RegisterRule): void {
  registerPass(p.A, p.B, writeOf(rule), steerOf(rule), OMEGA)

  for (let h = 0; h < 3; h++) {
    coneBeat(p.B[h]!, p.A[h]!, true)
  }
}

// the flame with the register (rule K, R or C); `shifts` branch at beat `at` with the register moved by d
function registerRun(
  name: string,
  rule: RegisterRule,
  T: number,
  f: Frame,
  at: number,
  shifts: readonly number[],
  log: (what: string) => void,
): Run {
  const run = blankRun(name, f)
  const main: Pair = {
    A: [copyStore(f.start), empty(f.start), empty(f.start)],
    B: [empty(f.start), empty(f.start), empty(f.start)],
  }
  const branches: { d: number; p: Pair }[] = []
  const reg0 = registerEntropy(main.A)

  run.bits.set(0, 2 * reg0.bits)
  run.spread.set(0, valueEntropy(reg0.weights))

  for (let t = 1; t <= T; t++) {
    try {
      registerBeat(main, rule)

      for (const br of branches) {
        registerBeat(br.p, rule)
      }
    } catch (err) {
      if (err instanceof ConeCap) {
        break
      }

      throw err
    }

    run.reach = t
    run.r.push(main.A.reduce((s, x) => s + regionRetention(x, f.lo, f.hi), 0))
    run.P.push(returnWeight(f.start, main.A))

    if (f.samples.includes(t)) {
      run.L.set(t, main.A.reduce((s, x) => s + coneBoundCount(x, f.rd), 0) / f.F0)
      run.normDrift = Math.max(run.normDrift, Math.abs(main.A.reduce((s, x) => s + coneNorm(x), 0) - 1))

      const reg = registerEntropy(main.A)

      run.bits.set(t, 2 * reg.bits)
      run.spread.set(t, valueEntropy(reg.weights))

      for (const br of branches) {
        run.D.get(br.d)!.set(t, flameDistance(main.A, br.p.A))
      }

      log(`${name} beat ${t}: r ${f4(run.r[t]!)} P ${f4(run.P[t]!)} L ${f4(run.L.get(t)!)} I ${f4(run.bits.get(t)!)} bits store ${main.A.map(x => x.used).join('/')}`)
    }

    if (t === at) {
      for (const d of shifts) {
        const A = [0, 1, 2].map(() => empty(f.start))

        for (let h = 0; h < 3; h++) {
          A[(h + d) % 3] = copyStore(main.A[h]!)
        }

        branches.push({ d, p: { A, B: [empty(f.start), empty(f.start), empty(f.start)] } })
        run.D.set(d, new Map([[t, flameDistance(main.A, A)]]))
      }
    }
  }

  // R's control: a write-only register commutes with the shift, so the branch is the main run relabelled, exactly
  for (const br of branches) {
    for (let h = 0; h < 3; h++) {
      run.relabel = Math.max(run.relabel, storeDifference(br.p.A[(h + br.d) % 3]!, main.A[h]!))
    }
  }

  return run
}

// X0: the register pass then its inverse on C's stores after 4 beats
function reversal(f: Frame): number {
  const p: Pair = {
    A: [copyStore(f.start), empty(f.start), empty(f.start)],
    B: [empty(f.start), empty(f.start), empty(f.start)],
  }

  for (let t = 0; t < 4; t++) {
    registerBeat(p, 'C')
  }

  const keep = p.A.map(copyStore)
  const out = [empty(f.start), empty(f.start), empty(f.start)]

  registerPass(p.A, p.B, writeOf('C'), steerOf('C'), OMEGA)
  registerPass(
    p.B,
    out,
    pos => -orientationOf(pos),
    (h, pos) => -((h - orientationOf(pos)) * orientationOf(pos)),
    OMEGA,
  )

  return Math.max(...keep.map((k, h) => storeDifference(k, out[h]!)))
}

// the bath arm: E-SLF-0184's excess g under one twist
type BathSeries = { F: number[]; reach: number; norm: number }

function bathSeries(first: ConeStore, table: readonly number[], beats: number, rd: LineReader): BathSeries {
  const twist = twistOf(table)
  const plain = table.every(j => j % 3 === 0)

  let a = first
  let b = coneStore(a.n, a.line, a.cap, a.clock)
  let norm = Math.abs(coneNorm(a) - 1)
  let reach = 0

  const F = [coneBoundCount(a, rd)]

  for (let t = 1; t <= beats; t++) {
    if (!plain) {
      shapePass(a, twist)
    }

    try {
      coneBeat(a, b, true)
    } catch (err) {
      if (err instanceof ConeCap) {
        break
      }

      throw err
    }

    ;[a, b] = [b, a]
    reach = t
    F.push(coneBoundCount(a, rd))
    norm = Math.max(norm, Math.abs(coneNorm(a) - 1))
  }

  return { F, reach, norm }
}

export default experiment({
  id: 'selves/keel-and-flame',
  code: 'E-SLF-0194',
  title:
    "a self with a keel and a flame: B1's lone cluster (the keel's bound level) with an opt-in history register in Z3 that the flame writes by a controlled shift of its orientation and that steers a phase on the flame, against the frozen keel, the recording keel, the flame alone and B1's bath, read by the self reader, the return weight, the register's memory and a mid-run change of the register (B-50)",
  category: 'selves',
  substrates: ['3434'],
  depth: 'L2',
  paper: false,
  run() {
    const started = Date.now()
    const setting = process.env.KEEL_SWEEP === 'full' ? FULL : SMOKE
    const full = setting.name === 'full'
    const log = (what: string): void => console.error(`${what} ${Math.round((Date.now() - started) / 1000)}s`)

    // ---- C1, the level ----
    const basis = lineBasis({ flavors: [0, 0, 0], statistics: 'fermion', D: 3, box: setting.box, unit: 0 })
    const level = lineLightest(basis, wholeBasis(basis)).lightest
    const placed = levelPlacement(basis, level.cre, level.cim)
    const levelOff = Math.abs(level.unwrapped - RECORDED.energy)
    const gC1 = levelOff <= setting.levelBar
    const { W, T } = setting
    const read = Math.floor((W - 1) / 2)
    const fit = fitRing(placed, W).kept
    const width = widthOf(W, fit)
    const at = T / 2
    const insideFrom = T / 4
    const samples = [...new Set([0, 1, 2, 4, 8, 12, 16, 20, 24, 32, 40, 44, 48, 56, 64, 72, 80, at, T])]
      .filter(t => t <= T)
      .sort((x, y) => x - y)

    log('C1')

    // ---- the frame: E-SLF-0191's S1 line ----
    const line = width + 2 * T + 12
    const offset = T + 5
    const rd = lineReader(placed, line, read, false)
    const start = coneStart({ n: 3, line, cap: setting.cap, W, placed: fit, bath: [], offset, clock: PI7 }).store
    const [lo, hi] = supportOf(start)
    const F0 = coneBoundCount(start, rd)
    const frame: Frame = { start, lo, hi, rd, F0, samples }
    const fn = freeNull({ psi: configsOf(start), line, lo, hi, beats: T })
    const c0 = fn.r0.map(x => x * x)

    // W0: the start's weight by orientation (T-0021a: the pieces must act on real weight)
    const byO = [0, 0, 0]

    eachConfiguration(start, (modes, re, im) => {
      const pos = Int32Array.from(modes, m => m >> 1)

      byO[orientationOf(pos)]! += re * re + im * im
    })

    const gW0 = byO[1]! + byO[2]! >= WEIGHT_FLOOR

    log(`frame: docks ${lo - offset}..${hi - offset}, orientation weights ${byO.map(f4).join(' ')}`)

    // ---- the arms ----
    const twists: Record<string, readonly number[]> = {
      A0: [0, 0, 0],
      F: [0, 1, 2],
      Fbar: [0, 2, 1],
      C0: SECTORS.C[0]!,
      C1: SECTORS.C[1]!,
      C2: SECTORS.C[2]!,
    }
    const runs = new Map<string, Run>()

    for (const [name, table] of Object.entries(twists)) {
      const run = twistRun(name, table, T, frame)

      runs.set(name, run)
      log(`${name}: reach ${run.reach}, r(T) ${f4(run.r[run.reach]!)} P(T) ${f4(run.P[run.reach]!)} L(T) ${f4(run.L.get(run.reach) ?? NaN)}`)
    }

    runs.set('K', registerRun('K', 'K', T, frame, at, [], log))
    runs.set('R', registerRun('R', 'R', T, frame, at, [1], log))
    runs.set('C', registerRun('C', 'C', T, frame, at, [1, 2], log))

    const x0 = reversal(frame)

    log(`X0 ${ex(x0)}`)

    const get = (name: string): Run => runs.get(name)!
    const reachAll = Math.min(...[...runs.values()].map(r => r.reach))
    const series = (run: Run, key: 'r' | 'P'): number[] => run[key].slice(0, reachAll + 1)
    const off = (x: Run, parts: readonly Run[]): number => {
      let worst = 0

      for (let t = 0; t <= reachAll; t++) {
        worst = Math.max(
          worst,
          Math.abs(x.r[t]! - mean(parts.map(p => p.r[t]!))),
          Math.abs(x.P[t]! - mean(parts.map(p => p.P[t]!))),
        )
      }

      for (const t of samples.filter(s => s <= reachAll)) {
        worst = Math.max(worst, Math.abs(x.L.get(t)! - mean(parts.map(p => p.L.get(t)!))))
      }

      return worst
    }
    const k0 = off(get('K'), [get('A0')])
    const d1 = off(get('R'), [get('A0'), get('F'), get('Fbar')])
    const d2 = off(get('C'), [get('C0'), get('C1'), get('C2')])
    const rD = get('R').D.get(1)
    const rDist = rD ? Math.max(...rD.values()) : NaN
    const gK0 = k0 <= EXACT_TOL
    const gD1 = d1 <= SECTOR_TOL
    const gD2 = d2 <= SECTOR_TOL
    const gR0 = get('R').relabel <= RELABEL_TOL && rDist <= DIST_FLOOR
    const gX0 = x0 <= RELABEL_TOL
    const gNorm = [...runs.values()].every(r => r.normDrift <= NORM_TOL)
    const gReach = reachAll === T

    log(`K0 ${ex(k0)} D1 ${ex(d1)} D2 ${ex(d2)} R0 relabel ${ex(get('R').relabel)} distance ${ex(rDist)}`)

    // ---- the bath arm ----
    const bathLine = Math.max(256, width + 2 * setting.bathBeats + 2)
    const bathOffset = setting.bathBeats + 1
    const bathRd = lineReader(placed, bathLine, read, false)
    const baths = Array.from({ length: setting.starts }, (_, s) => bathLoves(W, read, 3, s))
    const make = (n: number, bath: readonly (readonly [number, number])[], cluster: boolean): ConeStore =>
      coneStart({ n, line: bathLine, cap: setting.cap, W, placed: cluster ? fit : undefined, bath, offset: bathOffset }).store
    const bathOf = (table: readonly number[]) => {
      const lone = bathSeries(make(3, [], true), table, setting.bathBeats, bathRd)
      const cb = baths.map(bath => bathSeries(make(6, bath, true), table, setting.bathBeats, bathRd))
      const bt = baths.map(bath => bathSeries(make(3, bath, false), table, setting.bathBeats, bathRd))

      return { lone, cb, bt }
    }
    const bathBare = bathOf([0, 0, 0])
    const bathC = SECTORS.C.map(bathOf)
    const all = [bathBare, ...bathC]
    const reachOf = (parts: readonly ReturnType<typeof bathOf>[]): number =>
      Math.min(...parts.flatMap(x => [x.lone.reach, ...x.cb.map(s => s.reach), ...x.bt.map(s => s.reach)]))
    const bathReach = reachOf([bathBare])
    const cReach = reachOf(bathC)
    const gOf = (parts: readonly ReturnType<typeof bathOf>[]): number[] =>
      Array.from({ length: reachOf(parts) + 1 }, (_, t) => {
        const cb = mean(parts.map(p => mean(p.cb.map(s => s.F[t]!))))
        const bt = mean(parts.map(p => mean(p.bt.map(s => s.F[t]!))))
        const lone = mean(parts.map(p => p.lone.F[t]!))

        return (cb - bt) / lone
      })
    const gBare = gOf([bathBare])
    const gC = gOf(bathC)
    const bathNorm = Math.max(...all.flatMap(x => [x.lone.norm, ...x.cb.map(s => s.norm), ...x.bt.map(s => s.norm)]))
    const gOff = full
      ? Math.max(...G_0019.map((x, t) => (t <= bathReach ? Math.abs(gBare[t]! - x) : Infinity)))
      : NaN
    const gB0b = !full || (bathReach >= 11 && gOff <= G_TOL && bathNorm <= NORM_TOL)

    log(`bath: reach ${bathReach}, g bare ${gBare.map(f4).join(' ')}, g C ${gC.map(f4).join(' ')}`)

    // ---- the readings ----
    const A0 = get('A0')
    const tau0 = readSelf(3, series(A0, 'r').map(x => x * x), c0).tau0
    const gB0 =
      !full ||
      (L_0191.every((x, i) => Math.abs(A0.L.get(i + 1)! - x) <= REF_TOL) && tau0 === TAU0_0191)
    const instrument = gC1 && gW0 && gB0 && gB0b && gK0 && gD1 && gD2 && gR0 && gX0 && gNorm && gReach
    const judge = (run: Run) => {
      const c = series(run, 'r').map(x => x * x)
      const self = readSelf(3, c, c0)
      const LT = run.L.get(reachAll) ?? NaN
      const P = series(run, 'P')
      const pMax = Math.max(...P.slice(insideFrom))
      const bitsT = run.bits.get(reachAll)
      const Ds = [...run.D.values()].map(m => m.get(reachAll) ?? NaN)
      const identity = self.self === true && LT >= HALF
      const inside = pMax <= HALF
      const building = bitsT !== undefined && bitsT >= MEMORY_BAR && Ds.length > 0 && Ds.every(d => d >= BUILD_BAR)

      return { name: run.name, self, c, LT, pMax, bitsT, Ds, identity, inside, building }
    }
    const order = ['A0', 'K', 'R', 'F', 'Fbar', 'C', 'C0', 'C1', 'C2']
    const judged = order.map(n => judge(get(n)))
    const jC = judged.find(j => j.name === 'C')!
    const decided = jC.self.self !== undefined
    const status: 'pass' | 'fail' | 'open' =
      !full || !instrument || !decided
        ? 'open'
        : jC.identity && jC.inside && jC.building
          ? 'pass'
          : 'fail'
    const sample = (xs: readonly number[]): string =>
      samples.filter(t => t < xs.length).map(t => `${t}:${f4(xs[t]!)}`).join(' ')
    const arm = (j: (typeof judged)[number]): string =>
      `${j.name}: ${j.self.self === true ? 'A SELF' : j.self.self === false ? 'NOT A SELF' : 'UNDECIDED'} (tau_c ${j.self.tauC}), c(T) ${f4(j.c[reachAll]!)}, L(T) ${f4(j.LT)}, max P on [${insideFrom}, ${reachAll}] ${f4(j.pMax)}${j.bitsT === undefined ? '' : `, I(T) ${f4(j.bitsT)} bits`}${j.Ds.length ? `, D(T) ${j.Ds.map(f4).join(' ')}` : ''}; identity ${j.identity} inside ${j.inside} building ${j.building}`
    const metrics: Record<string, number> = {
      gate_C1: gC1 ? 1 : 0,
      gate_W0: gW0 ? 1 : 0,
      gate_B0: gB0 ? 1 : 0,
      gate_B0b: gB0b ? 1 : 0,
      gate_K0: gK0 ? 1 : 0,
      gate_D1: gD1 ? 1 : 0,
      gate_D2: gD2 ? 1 : 0,
      gate_R0: gR0 ? 1 : 0,
      gate_X0: gX0 ? 1 : 0,
      gate_norm: gNorm ? 1 : 0,
      gate_reach: gReach ? 1 : 0,
      levelOff,
      reach: reachAll,
      tau_0: tau0,
      weight_o0: byO[0]!,
      weight_o1: byO[1]!,
      weight_o2: byO[2]!,
      k0,
      d1,
      d2,
      x0,
      relabel: get('R').relabel,
      r_distance: rDist,
      bath_reach: bathReach,
      bath_g_off: gOff,
      g_bare_end: gBare[bathReach]!,
      bath_C_reach: cReach,
      g_C_end: gC[cReach]!,
      seconds: (Date.now() - started) / 1000,
    }

    for (const j of judged) {
      metrics[`${j.name}_cT`] = j.c[reachAll]!
      metrics[`${j.name}_LT`] = j.LT
      metrics[`${j.name}_tauC`] = j.self.tauC
      metrics[`${j.name}_pMax`] = j.pMax

      if (j.bitsT !== undefined) {
        metrics[`${j.name}_bits`] = j.bitsT
      }

      j.Ds.forEach((d, i) => {
        metrics[`${j.name}_D${i + 1}`] = d
      })
    }

    const runC = get('C')
    const runR = get('R')

    return verdict({
      status,
      claim: `${setting.name} setting, W ${W}, ${T} beats (B-50 branch at ${at}). The start's weight by orientation (none, full left, full right) ${byO.map(f4).join(' ')}. ${judged.map(arm).join('. ')}. Free null c0 ${sample(c0)} (tau_0 ${tau0}). C: c ${sample(judged.find(j => j.name === 'C')!.c)}, P ${sample(runC.P)}, I ${[...runC.bits].map(([t, x]) => `${t}:${f4(x)}`).join(' ')} bits, register spread ${[...runC.spread].map(([t, x]) => `${t}:${f4(x)}`).join(' ')} bits; B-50 D(d = 1) ${[...(runC.D.get(1) ?? new Map())].map(([t, x]) => `${t}:${f4(x)}`).join(' ')}, D(d = 2) ${[...(runC.D.get(2) ?? new Map())].map(([t, x]) => `${t}:${f4(x)}`).join(' ')}. R: I ${[...runR.bits].map(([t, x]) => `${t}:${f4(x)}`).join(' ')} bits, D(d = 1) at most ${ex(rDist)} (keeping without building). A0: c ${sample(judged[0]!.c)}, P ${sample(A0.P)}. Bath (B1's 3 loves at s 0..${setting.starts - 1}, bare ${bathReach} beats, C ${cReach}): g bare ${gBare.map(f4).join(' ')}, g C ${gC.map(f4).join(' ')}.`,
      metrics,
      notes: `L2. Setting ${setting.name}${full ? '' : ' (proves the file runs; not evidence, status open by rule)'}. Gates: C1 ${gC1} (${ex(levelOff)}); W0 ${gW0}; B0 ${gB0} (A0 L(1), L(2) ${f4(A0.L.get(1) ?? NaN)} ${f4(A0.L.get(2) ?? NaN)} against ${L_0191.join(' ')}, tau_0 ${tau0} against ${TAU0_0191}); B0b ${gB0b} (bare g off 0019 ${ex(gOff)}, reach ${bathReach}, norm ${ex(bathNorm)}); K0 ${gK0} (${ex(k0)}); D1 ${gD1} (${ex(d1)}); D2 ${gD2} (${ex(d2)}); R0 ${gR0} (relabel ${ex(get('R').relabel)}, distance ${ex(rDist)}); X0 ${gX0} (${ex(x0)}); norm ${gNorm}; reach ${gReach} (${reachAll} of ${T}). Identity: the self reader (c = r^2 of the start's support in a calm complement, against the free-love null) and L(T) >= 1/2; inside: max P on [T/4, T] <= 1/2; building: I(T) >= ${MEMORY_BAR} bits and every B-50 shift's D(T) >= ${BUILD_BAR}. The register is a model piece beside the line, not the mesh; every piece is opt-in.`,
    })
  },
})
