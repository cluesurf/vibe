// HEADER PENDING (E-RLT-0118): the gates are written here after the floors are read and before any K read.

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
  title: 'pending',
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
