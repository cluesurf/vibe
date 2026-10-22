// IS THE BOUND REGISTER PAIR STUCK ON LINES, READ ABOVE THE INSTRUMENT'S FLOOR (E-RLT-0118)? Decision 002 of
// vibe/roadmap/moving-matter: E-RLT-0115 stays FAIL as registered (its off-line residual 9.84e-4 is above its 2.34e-4
// "stuck" bound), but that residual is the level's own floor (1.52e-3 at K 0 after a 2048-cycle filter), so this file
// asks the same question with gates set above floors measured first. E-RLT-0116 and E-RLT-0117 (open) read lines by
// filter diagonalization on the axis and the (1, 1, 1) body diagonal only; this file reads the axis, all four body
// diagonals and the face diagonal (1, 1, 0), at two momenta neither read.
//
// THE OBJECT. E-RLT-0115 stage 1's pair (a_B 3.5, ball 16, code/measure/pair-direction's pairLevel, E_L
// 1.6133573497835847). For each direction n: the autocorrelation x_l, l = 0 .. 8,191, of the K = 0 level unfolded into
// the sector of n's little group, run at K = 0 (step 1) and at K = kappa n, kappa 0.22 and 0.28 (step 2). Both
// observables come from that one correlation (code/measure/line-mobility):
//  RESIDUAL r: the Blackman-Harris filter of 6,144 cycles at phase E0 + a kappa^2 (a = 0.0183178, E-RLT-0115's
//   isotropic K^2 coefficient; the centroid of twelve line branches and of a single band alike), its one-cycle residual
//   |U f - lambda f| / |f| read from the filtered correlation (filteredRead: residual^2 = 1 - |lambda|^2).
//  STILL SHARE s: filter diagonalization (S 4,096, J 60, window [E_L - 0.004, E_L + 0.010], E-RLT-0116's settings), the
//   weight of the lines within 2e-4 of E0 over w0 (E0, w0 the heaviest K = 0 line). Line branches with n . u = 0 never
//   move: they leave 1/2 on the axis, 1/4 on a body diagonal and 1/4 on the face diagonal (3 of 12 classes,
//   branchShifts 0, 1, 4 times a kappa^2). A single band leaves none.
//
// STEP 1, THE FLOORS, read before any K read (2026-10-22, tmp/rlt118-zero.log, tmp/rlt118-floors.log; the axis and
// (1, 1, 1) K = 0 correlations are E-RLT-0116's tmp/rlt116.json, same sector, start and engine, the other four read
// fresh, 1,291 s at 6 native threads). The six K = 0 correlations agree to 9.4e-15 at every lag (the dynamics at K = 0
// commutes with O_h, and every sector, the repaired (1, 1, -1) and (1, -1, 1) ones among them, reproduces it). The heaviest
// K = 0 line: E0 = E_L + 1.057e-4, w0 0.8235, |z| - 1 below 1.2e-11; neighbors at -3.20e-3 (0.114) and +4.04e-3
// (0.060). The correlation's own one-cycle residual is 1.5248e-3, against the level's direct read 1.5231e-3 (E-RLT-0115;
// the 0.1% is the engine's Gram drift, about 3e-9 a cycle, which the unitary formula does not see).
//  - The residual floor, by filter length (axis and body, tmp/rlt118-floor.log): 9.18e-4 at 2,048 (E-RLT-0115's filter:
//    its 9.84e-4 is this floor), 2.07e-4 at 4,096, 1.21e-5 at 6,144, 1.1e-6 at 8,191. At 6,144 the neighbors fall outside
//    the main lobe while the branches of a moving line stay inside it (at 8,191 the body diagonal's outer branch falls
//    out and the line-branch value drops toward the floor), so 6,144 it is.
//  - The controls, the same reads on the K = 0 correlation with its main line replaced (code/measure/line-mobility's
//    replaceLine, every other line left in place): by twelve equal line branches at E0 + branchShifts (LINES), or by
//    one line at E0 + a kappa^2 + b kappa^4 with E-RLT-0115's b (BAND, b -0.0037 axis, -0.0025 body, -0.0028 face):
//      kappa 0.22: residual BAND 1.06e-5 in every direction; LINES 8.87e-4 axis, 5.54e-4 body, 3.40e-4 face
//      kappa 0.28: residual BAND 4.4e-5 in every direction;  LINES 1.44e-3 axis, 3.79e-4 body, 3.80e-4 face
//      still share BAND 0.0000 everywhere; LINES 0.5000 axis, 0.2500 body and face, at both momenta
//
// GATES, fixed here before any K read. Per direction and momentum, with the anchors BAND and LINES above (recomputed
// by offLineFloors from the recorded K = 0 part, so these are the numbers the code uses):
//  MOVES on a read: r <= BAND + (LINES - BAND) / 3 AND s <= BAND + (LINES - BAND) / 3, that is
//    r <= 3.03e-4 axis, 1.92e-4 body, 1.20e-4 face at 0.22; 5.09e-4 axis, 1.56e-4 body and face at 0.28;
//    s <= 0.1667 axis, 0.0833 body and face.
//  STUCK on a read: r >= BAND + 2 (LINES - BAND) / 3 AND s >= BAND + 2 (LINES - BAND) / 3, that is
//    r >= 5.95e-4 axis, 3.73e-4 body, 2.30e-4 face at 0.22; 9.74e-4 axis, 2.67e-4 body and face at 0.28;
//    s >= 0.3333 axis, 0.1667 body and face.
//  A direction MOVES (or is STUCK) when both its reads do.
//  INSTRUMENTS: W the correlation residual within 1% of the level's direct 1.5231e-3; I1 |x_l| <= 1 + 1e-6 in every
//   correlation; I2 every K = 0 heaviest line has |z| within 1e-6 of 1; I3 the six K = 0 correlations agree to 1e-9;
//   I4 LINES >= 3 BAND for the residual at every read; I5 the still control reads LINES within 0.03 of 1/2 or 1/4 and
//   BAND at most 0.05. All hold at step 1.
//  VERDICT: open if an instrument fails or a read is missing; PASS (moves off lines) if all six directions MOVE; FAIL
//   (stuck on lines) if all six are STUCK; open otherwise.
//  G_ISO, registered, reported, moving no status (for vibe-roadmap-moving-matter-0003): the leading-order coefficient a(n)
//   = (d1 k2^2 / k1^2 - d2 k1^2 / k2^2) / (k2^2 - k1^2) from the heaviest line's shift d at the two momenta, spread
//   (max - min) / mean over the six below 0.02, and every shift above 0.
// PREDICTED: pass (the members are 3d Dirac bands, E-SPN-0140, E-SPN-0145; E-RLT-0117 left 0 at rest on (1, 1, 1)). The
//  risk: the BAND control leaves the neighbors in place, and if they move into the filter or mix with the main line
//  (E-RLT-0116 at 0.32) the reads sit between the gates and the verdict is open.
//
// THE RUN AND ITS COST, estimated before it: 12 K reads of 8,192 cycles, about 300 s each on 2,488 to 3,136
// representatives and 500 s on the face's 4,616 at 6 native threads, about 1.5 hours. It stops at 8 hours with what has
// landed (each read is written as it lands).
//
// THE RUN (2026-10-22, tmp/rlt118-moved.log, tmp/rlt118.json, tmp/rlt118-verdict.log; 3,400 s at 6 native threads for
// the 12 K reads). OPEN, as registered, by one read of twelve. No gate moved. Every instrument holds.
//  - ALL FOUR BODY DIAGONALS MOVE at both momenta, and their reads are equal to 4 digits (the repaired sectors read as
//    their partners): residual 3.34e-5 at 0.22 (moves at most 1.92e-4, lines 5.54e-4) and 6.32e-5 at 0.28 (at most
//    1.56e-4, lines 3.79e-4); still share 0.0000 at both (lines 0.25). The K = 0 line moves whole: weight 0.795 and
//    0.745 of 0.8235, shifted 8.577e-4 and 1.3605e-3 (a kappa^2 + b kappa^4 8.81e-4 and 1.421e-3).
//  - THE FACE DIAGONAL (1, 1, 0) MOVES at both: residual 6.92e-5 (at most 1.20e-4) and 9.13e-5 (at most 1.56e-4), still
//    0.0000 and 0.0075 (at most 0.0833).
//  - THE AXIS MOVES at 0.22 (residual 2.99e-4 against at most 3.03e-4, still 0.080 against at most 0.167) and is BETWEEN
//    at 0.28: still share 0.0000 (line branches would leave 0.50), but residual 5.70e-4, above 5.09e-4 and below the
//    9.74e-4 stuck bound. The axis line splits there into 0.438 at +1.724e-3 and 0.194 at +2.95e-4 from E0: the level
//    meets a neighbor (the -3.2e-3 line rises with K), the same mixing E-RLT-0116 saw at 0.32. That is not a line
//    branch (a still branch sits at exactly 0 shift and holds 0.5), but the registered residual gate reads it as
//    neither.
//  - G_ISO false: a(n) 0.018313 on every body diagonal, 0.018511 on the face, 0.021206 on the axis (spread 0.154), the
//    axis value carried by that mixing. Every shift is above 0 (smallest 8.58e-4).
//  So: no direction reads stuck on either observable, and no part of the pair stays at rest in any of the six
//  directions at either momentum (largest still share 0.080, against 0.25 to 0.5 for line branches). As registered the
//  question stays open, on the axis at 0.28 alone.
//
// Depth L2 (a two-body quantum walk on the husk quotient, exact in its moving block; the controls are synthetic).
// DETERMINISM: no random numbers; the start is placed; the native kernel, byte for byte the JavaScript.

import { existsSync, readFileSync } from 'node:fs'
import { experiment } from '@/test/scaffold/suite'
import { verdict, type Verdict } from '@/test/scaffold/verdict'
import type { KernelOptions } from '@/code/kernel/index'
import { branchShifts } from '@/code/measure/lineon-branches'
import {
  filteredRead,
  heaviestLine,
  lineSolve,
  replaceLine,
  stillShare,
  type Correlation,
} from '@/code/measure/line-mobility'
import { pairCorrelation, pairLevel } from '@/code/measure/pair-direction'
import { setup } from '@/code/measure/register-track'

const STAGE = { aB: 3.5, R: 16 } as const
const LAGS = 8191
const KAPPAS: readonly number[] = [0.22, 0.28]
const SECTOR_KAPPA = 0.28

export const DIRS: readonly { name: string; n: readonly number[]; b: number }[] = [
  { name: 'axis', n: [1, 0, 0], b: -0.0037 },
  { name: 'body', n: [1, 1, 1], b: -0.0025 },
  { name: 'body-z', n: [1, 1, -1], b: -0.0025 },
  { name: 'body-y', n: [1, -1, 1], b: -0.0025 },
  { name: 'body-yz', n: [1, -1, -1], b: -0.0025 },
  { name: 'face', n: [1, 1, 0], b: -0.0028 },
]

export const NATIVE: KernelOptions = { backend: 'native', threads: 6 }

type Plain = { re: number[]; im: number[] }

export type OffLinePart = {
  EL: number
  zero: Record<string, Plain>
  moved: { name: string; kappa: number; x: Plain }[]
  seconds: number
}

// step 1: the K = 0 correlation in each direction's sector (those in `have` are taken as given); step 2: every
// direction at every kappa. Each read is handed to `landed` as it lands, so a long run keeps what it has.
export function offLineRun(input: {
  opts: KernelOptions
  have?: OffLinePart
  moved: boolean
  log?: (what: string) => void
  landed?: (part: OffLinePart) => void
}): OffLinePart {
  const started = Date.now()
  const log = input.log ?? (() => {})
  const su = setup()
  const level = pairLevel({ su, aB: STAGE.aB, R: STAGE.R, opts: input.opts })
  const zero: Record<string, Plain> = { ...(input.have?.zero ?? {}) }
  const moved: OffLinePart['moved'] = [...(input.have?.moved ?? [])]
  const before = input.have?.seconds ?? 0
  const now = (): OffLinePart => ({
    EL: level.EL,
    zero,
    moved: [...moved],
    seconds: before + (Date.now() - started) / 1000,
  })
  const read = (n: readonly number[], k: number): Plain => {
    const x = pairCorrelation({ su, level, direction: n, kappa: SECTOR_KAPPA, k, length: LAGS, opts: input.opts })

    return { re: x.re, im: x.im }
  }

  log(`level ${level.EL}`)

  for (const d of DIRS) {
    if (!zero[d.name]) {
      zero[d.name] = read(d.n, 0)
      log(`${d.name} zero read`)
      input.landed?.(now())
    }
  }

  if (input.moved) {
    for (const kappa of KAPPAS) {
      for (const d of DIRS) {
        if (moved.some(m => m.name === d.name && m.kappa === kappa)) {
          continue
        }

        moved.push({ name: d.name, kappa, x: read(d.n, kappa) })
        log(`${d.name} kappa ${kappa} read`)
        input.landed?.(now())
      }
    }
  }

  return now()
}

// ---- the floors, the controls and the verdict ----

const A = 0.018317802430121526
const LEVEL_RESIDUAL = 0.0015231080722836088
const S_RESIDUAL = 6144
const S_LINES = 4096
const J = 60
const BELOW = 0.004
const ABOVE = 0.01
const NEAR = 2e-4
const BOUNDED = 1e-6
const MODULUS = 1e-6
const SAME = 1e-9
const WITNESS = 0.01
const RESOLVE = 3
const CONTROL = 0.03
const BAND_STILL = 0.05
const ISOTROPY = 0.02

const flag = (b: boolean): number => (b ? 1 : 0)

export type Floor = {
  name: string
  E0: number
  w0: number
  modulus: number
  residualFloor: number
  bounded: boolean
  same: number
}

export type Control = {
  name: string
  kappa: number
  stillWant: number
  lineResidual: number
  bandResidual: number
  lineStill: number
  bandStill: number
  resolved: boolean
  stillControl: boolean
  residualMoves: number
  residualStuck: number
  stillMoves: number
  stillStuck: number
}

const third = (lo: number, hi: number, k: number): number => lo + (k * (hi - lo)) / 3

// step 1 alone: every floor and control, from the K = 0 correlations (no K read is used)
export function offLineFloors(part: Pick<OffLinePart, 'EL' | 'zero'>): {
  floors: Floor[]
  controls: Control[]
  witness: number
} {
  const { EL } = part
  const solve = (x: Correlation) => lineSolve({ x, lo: EL - BELOW, hi: EL + ABOVE, basis: J, S: S_LINES })
  const ref = part.zero[DIRS[0]!.name]!
  const floors = DIRS.map(d => {
    const x = part.zero[d.name]!
    const h = heaviestLine(solve(x))!
    const same = Math.max(
      ...x.re.map((v, l) => Math.hypot(v - ref.re[l]!, x.im[l]! - ref.im[l]!)),
    )

    return {
      name: d.name,
      E0: h.E,
      w0: h.weight,
      modulus: h.modulus,
      residualFloor: filteredRead({ x, phase: h.E, S: S_RESIDUAL }).residual,
      bounded: x.re.every((v, l) => Math.hypot(v, x.im[l]!) <= 1 + BOUNDED),
      same,
    }
  })
  const controls = KAPPAS.flatMap(kappa =>
    DIRS.map((d, i) => {
      const f = floors[i]!
      const x = part.zero[d.name]!
      const shifts = branchShifts({ direction: d.n, kappa, a: A })
      const p = f.E0 + A * kappa ** 2
      const xl = replaceLine({ x, E0: f.E0, w0: f.w0, energies: shifts.map(s => f.E0 + s) })
      const xb = replaceLine({ x, E0: f.E0, w0: f.w0, energies: [f.E0 + A * kappa ** 2 + d.b * kappa ** 4] })
      const still = (y: Correlation): number => stillShare({ lines: solve(y), E0: f.E0, w0: f.w0, near: NEAR })
      const lineResidual = filteredRead({ x: xl, phase: p, S: S_RESIDUAL }).residual
      const bandResidual = filteredRead({ x: xb, phase: p, S: S_RESIDUAL }).residual
      const lineStill = still(xl)
      const bandStill = still(xb)
      const stillWant = shifts.filter(s => s <= 1e-12 * A * kappa ** 2).length / shifts.length

      return {
        name: d.name,
        kappa,
        stillWant,
        lineResidual,
        bandResidual,
        lineStill,
        bandStill,
        resolved: lineResidual >= RESOLVE * bandResidual,
        stillControl: Math.abs(lineStill - stillWant) <= CONTROL && bandStill <= BAND_STILL,
        residualMoves: third(bandResidual, lineResidual, 1),
        residualStuck: third(bandResidual, lineResidual, 2),
        stillMoves: third(bandStill, lineStill, 1),
        stillStuck: third(bandStill, lineStill, 2),
      }
    }),
  )
  const axis = part.zero[DIRS[0]!.name]!
  const witness = Math.sqrt(1 - axis.re[1]! ** 2 - axis.im[1]! ** 2)

  return { floors, controls, witness }
}

export function offLineCombine(part: OffLinePart): Verdict {
  const { EL } = part
  const { floors, controls, witness } = offLineFloors(part)
  const solve = (x: Correlation) => lineSolve({ x, lo: EL - BELOW, hi: EL + ABOVE, basis: J, S: S_LINES })
  const reads = part.moved.map(m => {
    const f = floors.find(x => x.name === m.name)!
    const c = controls.find(x => x.name === m.name && x.kappa === m.kappa)!
    const lines = solve(m.x)
    const h = heaviestLine(lines)
    const residual = filteredRead({ x: m.x, phase: f.E0 + A * m.kappa ** 2, S: S_RESIDUAL }).residual
    const still = stillShare({ lines, E0: f.E0, w0: f.w0, near: NEAR })

    return {
      name: m.name,
      kappa: m.kappa,
      residual,
      still,
      shift: (h?.E ?? NaN) - f.E0,
      weight: h?.weight ?? NaN,
      bounded: m.x.re.every((v, l) => Math.hypot(v, m.x.im[l]!) <= 1 + BOUNDED),
      moves: residual <= c.residualMoves && still <= c.stillMoves,
      stuck: residual >= c.residualStuck && still >= c.stillStuck,
      lines: lines.filter(l => l.weight >= 1e-3).map(l => `${(l.E - f.E0).toExponential(3)}:${l.weight.toFixed(4)}`),
    }
  })
  const complete = DIRS.every(d => KAPPAS.every(k => reads.some(r => r.name === d.name && r.kappa === k)))
  const W = Math.abs(witness / LEVEL_RESIDUAL - 1) <= WITNESS
  const I1 = floors.every(f => f.bounded) && reads.every(r => r.bounded)
  const I2 = floors.every(f => Math.abs(f.modulus - 1) <= MODULUS)
  const I3 = floors.every(f => f.same <= SAME)
  const I4 = controls.every(c => c.resolved)
  const I5 = controls.every(c => c.stillControl)
  const instruments = W && I1 && I2 && I3 && I4 && I5
  const perDirection = DIRS.map(d => {
    const own = reads.filter(r => r.name === d.name)

    return {
      name: d.name,
      moves: own.length === KAPPAS.length && own.every(r => r.moves),
      stuck: own.length === KAPPAS.length && own.every(r => r.stuck),
    }
  })
  const moves = complete && perDirection.every(d => d.moves)
  const stuck = complete && perDirection.every(d => d.stuck)
  const status: Verdict['status'] = !instruments ? 'open' : moves ? 'pass' : stuck ? 'fail' : 'open'
  // G_ISO, registered and reported, moving no status: the leading-order K^2 coefficient from the heaviest line's shift
  // at the two momenta (d / kappa^2 = a + b kappa^2), its spread over the six directions, and every shift above 0
  const [k1, k2] = KAPPAS as [number, number]
  const aOf = DIRS.map(d => {
    const d1 = reads.find(r => r.name === d.name && r.kappa === k1)?.shift ?? NaN
    const d2 = reads.find(r => r.name === d.name && r.kappa === k2)?.shift ?? NaN

    return ((d1 / k1 ** 2) * k2 ** 2 - (d2 / k2 ** 2) * k1 ** 2) / (k2 ** 2 - k1 ** 2)
  })
  const aMean = aOf.reduce((s, x) => s + x, 0) / aOf.length
  const isotropy = (Math.max(...aOf) - Math.min(...aOf)) / aMean
  const drift = reads.length > 0 && reads.every(r => r.shift > 0)
  const G_ISO = complete && isotropy < ISOTROPY && drift
  const e = (x: number, d = 2): string => x.toExponential(d)

  return verdict({
    status,
    claim: `W ${W} (the correlation's one-cycle residual ${e(witness, 4)} against the level's direct ${e(LEVEL_RESIDUAL, 4)}), I1 ${I1}, I2 ${I2}, I3 ${I3} (K 0 correlations of the six sectors agree to ${e(Math.max(...floors.map(f => f.same)))}), I4 ${I4}, I5 ${I5}; residual floor at K 0 ${e(floors[0]!.residualFloor)} (filter ${S_RESIDUAL}); ${reads.map(r => {
      const c = controls.find(x => x.name === r.name && x.kappa === r.kappa)!

      return `${r.name} kappa ${r.kappa}: residual ${e(r.residual)} (band ${e(c.bandResidual)}, lines ${e(c.lineResidual)}, moves at most ${e(c.residualMoves)}), still ${r.still.toFixed(4)} (band ${c.bandStill.toFixed(4)}, lines ${c.lineStill.toFixed(4)}, moves at most ${c.stillMoves.toFixed(4)}) ${r.moves ? 'MOVES' : r.stuck ? 'STUCK' : 'between'}`
    }).join('; ')}${complete ? '' : `; ${reads.length} of ${DIRS.length * KAPPAS.length} reads landed`}; G_ISO ${G_ISO} (a ${aOf.map(x => x.toFixed(6)).join(' ')}, spread ${e(isotropy)}, every shift above 0 ${drift})`,
    metrics: {
      W: flag(W),
      I1: flag(I1),
      I2: flag(I2),
      I3: flag(I3),
      I4: flag(I4),
      I5: flag(I5),
      moves: flag(moves),
      stuck: flag(stuck),
      G_ISO: flag(G_ISO),
      reads: reads.length,
      EL,
      witness,
      residualFloor: Math.max(...floors.map(f => f.residualFloor)),
      sectorAgreement: Math.max(...floors.map(f => f.same)),
      residualMax: Math.max(...reads.map(r => r.residual)),
      stillMax: Math.max(...reads.map(r => r.still)),
      isotropy,
      aMean,
      shiftMin: Math.min(...reads.map(r => r.shift)),
      seconds: part.seconds,
    },
    control: Object.fromEntries(
      controls.flatMap(c => [
        [`${c.name}${c.kappa}LineResidual`, c.lineResidual],
        [`${c.name}${c.kappa}BandResidual`, c.bandResidual],
        [`${c.name}${c.kappa}LineStill`, c.lineStill],
        [`${c.name}${c.kappa}BandStill`, c.bandStill],
      ]),
    ),
    notes: `L2. Per read (direction, kappa: residual, still share, heaviest line's shift and weight; lines at K as shift from E0 : weight, weight >= 1e-3): ${reads.map(r => `${r.name} ${r.kappa}: ${e(r.residual)}, ${r.still.toFixed(4)}, ${e(r.shift, 4)}, ${r.weight.toFixed(4)} [${r.lines.join(' ')}]`).join('; ')}. Floors (E0 - E_L, w0, residual floor): ${floors.map(f => `${f.name} ${e(f.E0 - EL)} ${f.w0.toFixed(4)} ${e(f.residualFloor)}`).join('; ')}. ${part.seconds.toFixed(0)} s.`,
  })
}

const PART = 'tmp/rlt118.json'

export default experiment({
  id: 'relativity/bound-pair-off-lines',
  code: 'E-RLT-0118',
  title:
    "the bound register pair moves off lines in 11 of 12 reads above the instrument's floor, open on the axis at K 0.28 (gates fixed before the run): with a 6,144-cycle filter the residual floor is 1.2e-5 (E-RLT-0115's 2,048 filter left 9.2e-4), and on all four body diagonals and the face diagonal at K 0.22 and 0.28 the residual (3.3e-5 to 9.1e-5) and the share left at rest (0 to 0.0075) sit far below what twelve line branches give through the same reads (3.4e-4 to 5.5e-4, and 0.25); no direction leaves any part at rest (at most 0.080, against 0.5 on the axis); the axis at 0.28 reads a residual of 5.7e-4 between the moves (5.1e-4) and stuck (9.7e-4) bounds, where its level mixes with a neighbor",
  category: 'relativity',
  substrates: ['3434'],
  depth: 'L2',
  paper: false,
  run() {
    const part = existsSync(PART)
      ? (JSON.parse(readFileSync(PART, 'utf8')) as OffLinePart)
      : offLineRun({ opts: NATIVE, moved: true })

    return offLineCombine(part)
  },
})
