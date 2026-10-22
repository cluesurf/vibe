// ARE ALL FOUR BODY-DIAGONAL SECTORS OF THE REDUCED REGISTER-PAIR ENGINE STABLE AND NORM CONSERVING (E-SPN-0216)? In
// code/measure/register-reduced the sectors of the little groups of (1, 1, -1) and (1, -1, 1), built directly, grew the
// norm to 2.9e152 by 4,096 cycles at R 16 (E-RLT-0115's probe, test/record/E-RLT-0115/rlt115-probe.log), while (1, 1, 1)
// and (1, -1, -1) held. Since then those two are built as the images of (1, 1, 1)'s sector under the flip of one
// coordinate (register-reduced's conjugateSector, vibe-roadmap-moving-matter-0008). This file reads whether that
// repaired the engine, and which of two causes the blow-up had.
//
// TWO CANDIDATE CAUSES, stated before the run.
//  (A) THE INTERNAL STATE: the four body diagonals are related by cubic elements, and a sector built by moving
//      positions alone, without carrying the register (the 256 components) by its representation, is not unitary.
//      Read from the code before the run: the reduced engine reads every neighbour block through rho(g), the signed
//      permutation of all four pair types that the minors give (register-reduced's conv, valueAt), in every sector and
//      at every step, so (A) would show as a non-unitary step on invariant states.
//  (B) THE REMAINDER: at a representative with a stabilizer (on a mirror or the diagonal itself) the stored block
//      holds a part no invariant state has, and the cycle acts on that part through whichever neighbour element the
//      tables chose; an eigenvalue |lambda| > 1 there grows from rounding while every invariant state evolves exactly
//      (traps.md of the project). Then the step on invariant states is the same in both builds, and the growing mode
//      is pure remainder.
//
// THE READS. The member and level of E-RLT-0116 (E-SPN-0173's member, a_B 3.5, code/measure/pair-direction's pairLevel),
// K = 0.32 n along each body diagonal n.
//  R 12, ball, each body diagonal, built two ways, directly (directSector, the old tables) and by sector() (the
//   current build): the spectral radius of one cycle on the whole stored space, by power iteration from a fixed
//   pattern over 2,048 cycles (the growth per cycle over the last 512, code/measure/reduced-unitarity), the invariance
//   defect of the iterated state, and the isometry defect <U v | G U v> / <v | G v> - 1 of the invariant level v.
//  R 16, torus (closed, register-reduced's 'torus' boundary) and ball, each body diagonal as sector() builds it: the
//   level (on that boundary) unfolded and run 4,096 cycles, its Gram norm read at 256 to 4,096, and its final
//   invariance defect.
//  BIT IDENTITY: the tables of every little group of code/measure/reduced-unitarity's PROBE_MOMENTA at R 12 and 16 have
//   the fingerprints recorded from the committed file before the boundary option was added
//   (test/record/E-SPN-0216/tables-head.json); and the first 128 lags of E-RLT-0116's recorded axis K = 0 and body
//   K = 0.32 correlations (test/record/E-RLT-0116/rlt116.json) are recomputed to the bit.
//
// GATES, fixed before the run.
//  C1 THE CONTROL (the bug reproduced): the directly built (1, 1, -1) and (1, -1, 1) sectors have spectral radius at
//     least 1.01, and their iterated states an invariance defect at least 0.1; the directly built (1, 1, 1) and
//     (1, -1, -1) at most 1 + 1e-9.
//  H1 (B), NOT (A): for (1, 1, -1) and (1, -1, 1) the invariant level's isometry defect in the direct build equals the
//     current build's within 1e-12 (the same unitary-or-not step on invariant states).
//  S1 THE FIX: every body diagonal, as sector() builds it, has spectral radius at most 1 + 1e-9 at R 12.
//  S2 CONSERVED ON A CLOSED BOUNDARY: on the torus of radius 16, every body diagonal keeps |N(t) / N(0) - 1| <= 1e-12
//     at every checkpoint over 4,096 cycles, its final invariance defect at most 1e-10.
//  S3 NO GROWTH ON THE BALL: on the ball of radius 16, every body diagonal's N(t) / N(0) equals (1, 1, 1)'s within
//     1e-12 at every checkpoint and never rises (each checkpoint at most the one before, the first at most 1).
//  B1, B2 the bit identity above, every fingerprint and every lag equal.
//  VERDICT: open if C1 or H1 fails (the cause unread); fail if S1, S2, S3, B1 or B2 fails; pass otherwise.
// PREDICTED: every gate holds; cause (B). The ball's loss itself is E-SPN-0215's question. An instrument check: L1.
//
// COST, estimated before the run: R 12 about 1,400 representatives a sector, 8 x 2,048 cycles; R 16 about 3,100 (ball)
// and 6,000 (torus) a sector, 8 x 4,096 cycles: about an hour at 6 native threads.
//
// Depth L1 (an instrument read of the reduced engine; no physics claim). DETERMINISM: no random numbers; the starts are
// placed. The native kernel, byte for byte the JavaScript.

import { existsSync, readFileSync } from 'node:fs'
import { experiment } from '@/test/scaffold/suite'
import { verdict, type Verdict } from '@/test/scaffold/verdict'
import type { KernelOptions } from '@/code/kernel/index'
import { pairCorrelation, pairLevel, type PairLevel } from '@/code/measure/pair-direction'
import {
  invarianceDefect,
  isometryDefect,
  normTrack,
  patternState,
  PROBE_MOMENTA,
  sectorFingerprint,
  spectralRadius,
  stabilizers,
  type NormPoint,
} from '@/code/measure/reduced-unitarity'
import {
  directSector,
  littleGroup,
  normalizeState,
  reducedCounts,
  reducedEngine,
  sector,
  unfold,
  type Boundary,
  type Sector,
} from '@/code/measure/register-reduced'
import { setup, type Setup } from '@/code/measure/register-track'

const AB = 3.5
const KAPPA = 0.32
const DIAGONALS: readonly (readonly number[])[] = [
  [1, 1, 1],
  [1, 1, -1],
  [1, -1, 1],
  [1, -1, -1],
]
const BROKEN = [1, 2]
const RADIUS_R = 12
const RADIUS_CYCLES = 2048
const RUN_R = 16
const CHECKPOINTS: readonly number[] = [256, 512, 1024, 2048, 4096]
const LAGS = 127
const GROWS = 1.01
const REMAINDER = 0.1
const STABLE = 1e-9
const ROUNDING = 1e-12
const INVARIANT = 1e-10

export const NATIVE: KernelOptions = { backend: 'native', threads: 6 }

const along = (d: readonly number[], k: number): number[] => {
  const l = Math.hypot(...d)

  return [(k * d[0]!) / l, (k * d[1]!) / l, (k * d[2]!) / l, 0]
}

export type RadiusRead = {
  diagonal: number[]
  build: 'direct' | 'sector'
  reps: number
  radius: number
  quarters: number[]
  remainder: number
  levelDefect: number
}

export type TrackRead = {
  diagonal: number[]
  boundary: Boundary
  reps: number
  points: NormPoint[]
  defect: number
}

export type DiagonalPart = {
  radius: RadiusRead[]
  track: TrackRead[]
  fingerprints: { R: number; K: number[]; fingerprint: string }[]
  lags: { name: string; re: number[]; im: number[] }[]
  seconds: number
}

const engineOn = (su: Setup, level: PairLevel, s: Sector, K: number[], opts: KernelOptions) =>
  reducedEngine(s, su.u, K, reducedCounts(s, su.table, level.alpha, su.theta), 'vector', opts)

export function radiusRead(input: {
  su: Setup
  level: PairLevel
  diagonal: readonly number[]
  build: 'direct' | 'sector'
  opts: KernelOptions
}): RadiusRead {
  const { su, level, diagonal, build, opts } = input
  const K = along(diagonal, KAPPA)
  const members = littleGroup(su.group, K)
  const s =
    build === 'direct'
      ? directSector(su.group, members, level.R)
      : sector(su.group, members, level.R)
  const e = engineOn(su, level, s, K, opts)
  const r = spectralRadius(e, patternState(s), RADIUS_CYCLES)

  return {
    diagonal: [...diagonal],
    build,
    reps: s.count,
    radius: r.radius,
    quarters: r.quarters,
    remainder: invarianceDefect(s, r.state),
    levelDefect: isometryDefect(e, unfold(level.s, level.v, s)),
  }
}

export function trackRead(input: {
  su: Setup
  level: PairLevel
  diagonal: readonly number[]
  boundary: Boundary
  opts: KernelOptions
  log?: (what: string) => void
}): TrackRead {
  const { su, level, diagonal, boundary, opts } = input
  const K = along(diagonal, KAPPA)
  const s = sector(su.group, littleGroup(su.group, K), level.R, boundary)
  const e = engineOn(su, level, s, K, opts)
  const v = unfold(level.s, level.v, s)

  normalizeState(e, v)

  const t = normTrack(e, v, CHECKPOINTS, w => input.log?.(`${boundary} ${diagonal.join(',')} ${w}`))

  return {
    diagonal: [...diagonal],
    boundary,
    reps: s.count,
    points: t.points,
    defect: invarianceDefect(s, t.state, stabilizers(s)),
  }
}

export function diagonalRun(input: {
  opts: KernelOptions
  log?: (what: string) => void
  landed?: (part: DiagonalPart) => void
  from?: DiagonalPart
}): DiagonalPart {
  const started = Date.now()
  const log = input.log ?? (() => {})
  const opts = input.opts
  const su = setup()
  const part: DiagonalPart = input.from ?? {
    radius: [],
    track: [],
    fingerprints: [],
    lags: [],
    seconds: 0,
  }
  const before = part.seconds
  const land = (): void => {
    part.seconds = before + (Date.now() - started) / 1000
    input.landed?.(part)
  }

  if (part.fingerprints.length === 0) {
    for (const R of [12, 16]) {
      for (const K of PROBE_MOMENTA) {
        part.fingerprints.push({
          R,
          K: [...K],
          fingerprint: sectorFingerprint(sector(su.group, littleGroup(su.group, K), R)),
        })
      }
    }

    land()
  }

  if (part.radius.length < 2 * DIAGONALS.length) {
    const level = pairLevel({ su, aB: AB, R: RADIUS_R, opts })

    for (const d of DIAGONALS) {
      for (const build of ['direct', 'sector'] as const) {
        if (part.radius.some(r => r.build === build && r.diagonal.join() === d.join())) {
          continue
        }

        part.radius.push(radiusRead({ su, level, diagonal: d, build, opts }))
        log(`radius ${build} ${d.join(',')}: ${JSON.stringify({ ...part.radius.at(-1)!, quarters: undefined })}`)
        land()
      }
    }
  }

  for (const boundary of ['ball', 'torus'] as const) {
    if (part.track.filter(t => t.boundary === boundary).length === DIAGONALS.length) {
      continue
    }

    const level = pairLevel({ su, aB: AB, R: RUN_R, opts, boundary })

    if (boundary === 'ball' && part.lags.length === 0) {
      for (const [name, d, k] of [
        ['axis zero', [1, 0, 0], 0],
        ['body moved', [1, 1, 1], KAPPA],
      ] as const) {
        const x = pairCorrelation({ su, level, direction: d, kappa: KAPPA, k, length: LAGS, opts })

        part.lags.push({ name, re: x.re, im: x.im })
      }

      land()
    }

    for (const d of DIAGONALS) {
      if (part.track.some(t => t.boundary === boundary && t.diagonal.join() === d.join())) {
        continue
      }

      part.track.push(trackRead({ su, level, diagonal: d, boundary, opts, log }))
      land()
    }
  }

  land()

  return part
}

const flag = (b: boolean): number => (b ? 1 : 0)

export function diagonalCombine(input: {
  part: DiagonalPart
  head: { rows: { R: number; K: number[]; fingerprint: string }[] }
  recorded: { reads: { name: string; zero: { re: number[]; im: number[] }; moved: { re: number[]; im: number[] } }[] }
}): Verdict {
  const { part, head, recorded } = input
  const key = (d: readonly number[]): string => d.join(',')
  const rad = (d: readonly number[], b: 'direct' | 'sector'): RadiusRead =>
    part.radius.find(r => r.build === b && key(r.diagonal) === key(d))!
  const broken = BROKEN.map(i => DIAGONALS[i]!)
  const stable = DIAGONALS.filter((_, i) => !BROKEN.includes(i))
  const C1 =
    broken.every(d => rad(d, 'direct').radius >= GROWS && rad(d, 'direct').remainder >= REMAINDER) &&
    stable.every(d => rad(d, 'direct').radius <= 1 + STABLE)
  const H1 = broken.every(
    d => Math.abs(rad(d, 'direct').levelDefect - rad(d, 'sector').levelDefect) <= ROUNDING,
  )
  const S1 = DIAGONALS.every(d => rad(d, 'sector').radius <= 1 + STABLE)
  const tr = (d: readonly number[], b: Boundary): TrackRead =>
    part.track.find(t => t.boundary === b && key(t.diagonal) === key(d))!
  const torusWorst = Math.max(
    ...DIAGONALS.flatMap(d => tr(d, 'torus').points.map(p => Math.abs(p.ratio - 1))),
  )
  const torusDefect = Math.max(...DIAGONALS.map(d => tr(d, 'torus').defect))
  const S2 = torusWorst <= ROUNDING && torusDefect <= INVARIANT
  const base = tr(DIAGONALS[0]!, 'ball').points
  const ballSpread = Math.max(
    ...DIAGONALS.flatMap(d => tr(d, 'ball').points.map((p, i) => Math.abs(p.ratio - base[i]!.ratio))),
  )
  const neverRises = DIAGONALS.every(d =>
    tr(d, 'ball').points.every((p, i, ps) => p.ratio <= (i === 0 ? 1 : ps[i - 1]!.ratio)),
  )
  const S3 = ballSpread <= ROUNDING && neverRises
  const B1 =
    head.rows.length === part.fingerprints.length &&
    head.rows.every((h, i) => {
      const f = part.fingerprints[i]!

      return f.R === h.R && key(f.K) === key(h.K) && f.fingerprint === h.fingerprint
    })
  const lagOf = (name: string): { re: number[]; im: number[] } => {
    const [dir, which] = name.split(' ') as ['axis' | 'body', 'zero' | 'moved']

    return recorded.reads.find(r => r.name === dir)![which]
  }
  const B2 = part.lags.every(l => {
    const r = lagOf(l.name)

    return l.re.every((x, i) => x === r.re[i]) && l.im.every((x, i) => x === r.im[i])
  })
  const status: Verdict['status'] = !(C1 && H1)
    ? 'open'
    : !(S1 && S2 && S3 && B1 && B2)
      ? 'fail'
      : 'pass'
  const e = (x: number, d = 3): string => x.toExponential(d)
  const f = (x: number): string => x.toFixed(6)
  const ballDrift = 1 - base.at(-1)!.ratio

  return verdict({
    status,
    claim: `the reduced engine's four body-diagonal sectors at K 0.32 n: built directly, (1, 1, -1) and (1, -1, 1) have spectral radius ${broken.map(d => f(rad(d, 'direct').radius)).join(' and ')} on the whole stored space at R ${RADIUS_R}, their growing mode a remainder (invariance defect ${broken.map(d => e(rad(d, 'direct').remainder, 2)).join(', ')}), while (1, 1, 1) and (1, -1, -1) read ${stable.map(d => f(rad(d, 'direct').radius)).join(' and ')} (C1 ${C1}); the invariant level's one-cycle isometry defect is the same in both builds (${broken.map(d => `${e(rad(d, 'direct').levelDefect)} against ${e(rad(d, 'sector').levelDefect)}`).join('; ')}, H1 ${H1})${H1 ? ', so the step on invariant states was never the fault (the register is carried by rho(g) in both): the remainder at fixed points grew' : ', so the two builds step invariant states differently'}; as built now every body diagonal reads radius ${DIAGONALS.map(d => f(rad(d, 'sector').radius)).join(', ')} (S1 ${S1}); over 4,096 cycles at R ${RUN_R} on the closed torus the norm holds to ${e(torusWorst, 2)} with invariance defect at most ${e(torusDefect, 2)} (S2 ${S2}), and on the ball all four lose the same ${e(ballDrift)} (spread ${e(ballSpread, 2)}, never rising: S3 ${S3}); tables of ${part.fingerprints.length} sectors bit for bit as committed (B1 ${B1}) and 128 lags of two E-RLT-0116 correlations reproduced to the bit (B2 ${B2})`,
    metrics: {
      C1: flag(C1),
      H1: flag(H1),
      S1: flag(S1),
      S2: flag(S2),
      S3: flag(S3),
      B1: flag(B1),
      B2: flag(B2),
      ...Object.fromEntries(
        part.radius.map(r => [`radius_${r.build}_${r.diagonal.join('')}`, r.radius]),
      ),
      torusWorst,
      torusDefect,
      ballSpread,
      ballDrift,
      seconds: part.seconds,
    },
    control: Object.fromEntries(
      broken.map(d => [`directRadius${d.join('')}`, rad(d, 'direct').radius]),
    ),
    notes: `L1. Radius reads (build, diagonal: reps, radius by quarter, remainder, level isometry defect): ${part.radius.map(r => `${r.build} ${r.diagonal.join(',')}: ${r.reps}, ${r.quarters.map(q => q.toFixed(8)).join(' ')}, ${e(r.remainder, 2)}, ${e(r.levelDefect)}`).join('; ')}. Tracks (N / N0 - 1 at ${CHECKPOINTS.join(', ')}): ${part.track.map(t => `${t.boundary} ${t.diagonal.join(',')} (${t.reps} reps, defect ${e(t.defect, 2)}) ${t.points.map(p => e(p.ratio - 1)).join(' ')}`).join('; ')}. ${part.seconds.toFixed(0)} s.`,
  })
}

export const PART = `${import.meta.dirname}/../../record/E-SPN-0216/diagonal.json`
const HEAD = `${import.meta.dirname}/../../record/E-SPN-0216/tables-head.json`
const RECORDED = `${import.meta.dirname}/../../record/E-RLT-0116/rlt116.json`

export const readJson = <T>(path: string): T => JSON.parse(readFileSync(path, 'utf8')) as T

export const combineFrom = (part: DiagonalPart): Verdict =>
  diagonalCombine({ part, head: readJson(HEAD), recorded: readJson(RECORDED) })

export default experiment({
  id: 'spin/reduced-diagonal-sectors',
  code: 'E-SPN-0216',
  title:
    'explores whether all four body-diagonal sectors of the reduced register-pair engine are stable and norm conserving after the conjugate-sector fix, by their spectral radius and a closed-boundary 4,096-cycle run (running)',
  category: 'spin',
  substrates: ['3434'],
  depth: 'L1',
  paper: false,
  run() {
    const part = existsSync(PART) ? readJson<DiagonalPart>(PART) : diagonalRun({ opts: NATIVE })

    return combineFrom(part)
  },
})
