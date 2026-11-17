// THE POINTER READS OF E-QTM-0186 AS A REUSABLE CASE (E-QTM-0197). One case: C* (E-FND-0160) on code/measure/role-holes'
// exact n-hole store, member 0 the system and k = n - 1 pain-tone members the environment, read for
//   - the tone (count) coherence <Psi_F | Psi_L> of (|L, 0> + |F, 0>), the mixed one (|L, 0> + |F, 1>), and the 12 role
//     superpositions (|a> + |b>) / sqrt 2 of member 0 pleasure-tone, 3 in each of the qutrit's 4 stabilizer bases,
//   - each loss = mean over beats 1 .. beats of 1 - |coherence| / |coherence at beat 0|,
//   - the Holevo record of the tone and of each role basis in the roles of m = 1 .. k environment holes, at beat 0 and
//     as the mean of the reads from `lateFrom` on, every `readEvery` beats.
// This is E-QTM-0186's runCase and setup, moved here unchanged in what they compute so that another experiment can run
// the same case with a rule option (the reflection R, role-holes RoleRule.reflect). With `reflect` absent it is
// E-QTM-0186's case exactly.
//
// DETERMINISM: no random numbers. Floats: measurement on exact pieces.

import { ringUnit, unitAngle } from '@/code/measure/swap-string'
import {
  partnerProjector48,
  registerPiece,
  scaled,
  singletProjector24,
} from '@/code/measure/spinor-register'
import { torus } from '@/code/measure/register-sea'
import {
  bandVectors,
  holeFrame,
  pairAngles,
  type HoleFrame,
} from '@/code/measure/register-holes'
import {
  exchangeResidual,
  holevoBits,
  roleEngine,
  roleLines,
  roleStart,
  type RoleEngine,
  type RoleKernelForm,
  type RoleMember,
  type RoleRule,
  type RoleState3,
} from '@/code/measure/role-holes'

const LIGHT: readonly [number, number] = [-1, 4]
const STRING: readonly [number, number] = [-2, 1]
const VERTEX: readonly [number, number] = [2, 0]
const FEAR: readonly [number, number] = [0, 2]
const CAP = 8
const LOG3 = Math.log2(3)

export type StartName = 'D' | 'B'
export type EnvName = 'E1' | 'E2'

export type PointerPlan = {
  beats: number
  readEvery: number
  lateFrom: number
  threads: number
}

type CM = { re: Float64Array; im: Float64Array }

export const LINES = roleLines()

const CLASS_PAIRS: readonly [number, number][] = [
  [0, 1],
  [0, 2],
  [1, 2],
]

function combine(X: CM[][], chi: RoleState3, D: number): CM {
  const out = { re: new Float64Array(D * D), im: new Float64Array(D * D) }

  for (let r = 0; r < 3; r++) {
    for (let q = 0; q < 3; q++) {
      const cr = chi.re[r]! * chi.re[q]! + chi.im[r]! * chi.im[q]!
      const ci = chi.im[r]! * chi.re[q]! - chi.re[r]! * chi.im[q]!

      if (cr === 0 && ci === 0) {
        continue
      }

      const M = X[r]![q]!

      for (let k = 0; k < D * D; k++) {
        out.re[k]! += cr * M.re[k]! - ci * M.im[k]!
        out.im[k]! += cr * M.im[k]! + ci * M.re[k]!
      }
    }
  }

  return out
}

const dagger = (M: CM, D: number): CM => {
  const re = new Float64Array(D * D)
  const im = new Float64Array(D * D)

  for (let i = 0; i < D; i++) {
    for (let j = 0; j < D; j++) {
      re[i * D + j] = M.re[j * D + i]!
      im[i * D + j] = -M.im[j * D + i]!
    }
  }

  return { re, im }
}

function sandwich(rho: CM, a: RoleState3, b: RoleState3): [number, number] {
  let sr = 0
  let si = 0

  for (let i = 0; i < 3; i++) {
    for (let j = 0; j < 3; j++) {
      const pr = rho.re[i * 3 + j]! * b.re[j]! - rho.im[i * 3 + j]! * b.im[j]!
      const pi = rho.re[i * 3 + j]! * b.im[j]! + rho.im[i * 3 + j]! * b.re[j]!

      sr += a.re[i]! * pr + a.im[i]! * pi
      si += a.re[i]! * pi - a.im[i]! * pr
    }
  }

  return [sr, si]
}

const superpose = (a: RoleState3, b: RoleState3): RoleState3 => ({
  re: a.re.map((x, i) => (x + b.re[i]!) * Math.SQRT1_2),
  im: a.im.map((x, i) => (x + b.im[i]!) * Math.SQRT1_2),
})

const mean = (x: readonly number[]): number =>
  x.reduce((s, y) => s + y, 0) / x.length

// ---- the setup ----

export type PointerSetup = {
  fear: number
  frames: Map<number, HoleFrame>
  angles: Map<number, Float64Array>
}

export function pointerSetup(sides: readonly number[] = [2, 4]): PointerSetup {
  const th = unitAngle(ringUnit(LIGHT[0], LIGHT[1]))
  const u: [number, number] = [Math.cos(th), Math.sin(th)]
  const sAng = unitAngle(ringUnit(STRING[0], STRING[1]))
  const vAng = unitAngle(ringUnit(VERTEX[0], VERTEX[1]))
  const fear = unitAngle(ringUnit(FEAR[0], FEAR[1]))
  const qS = scaled(singletProjector24(), 24)
  const qD = scaled(partnerProjector48(), 48)
  const Ps = [registerPiece(qS, u), registerPiece(qD, [u[0], -u[1]])]
  const frames = new Map<number, HoleFrame>()
  const angles = new Map<number, Float64Array>()

  for (const L of sides) {
    const t = torus(L)

    frames.set(L, holeFrame(t, Ps, 8))
    angles.set(L, pairAngles(t, -sAng, CAP, -2 * vAng))
  }

  return { fear, frames, angles }
}

export function envRoles(env: EnvName, k: number): RoleState3[] {
  const pick = env === 'E1' ? [1, 2, 0] : [3, 6, 9]

  return pick.slice(0, k).map(i => LINES[i]!)
}

function startMomenta(fr: HoleFrame, n: number): number[] {
  const F = fr.fourier

  if (fr.t.L === 2) {
    return n === 3 ? [0, 1, 1] : [1, 1, 2, 2].slice(0, n)
  }

  const a = 1
  const b = 2

  if (n === 2) {
    return [a, F.neg[a]!]
  }

  if (n === 3) {
    return [0, a, F.neg[a]!]
  }

  return [a, F.neg[a]!, b, F.neg[b]!]
}

export function pointerMembers(
  fr: HoleFrame,
  start: StartName,
  roles: readonly RoleState3[],
): RoleMember[] {
  const n = roles.length

  if (start === 'D') {
    return roles.map((role, i) => ({ role, fiber: i }))
  }

  const js = startMomenta(fr, n)

  return roles.map((role, i) => ({
    role,
    momentum: js[i]!,
    vector: bandVectors(fr, js[i]!).up[i]!,
  }))
}

// ---- one case ----

export type PointerCase = {
  name: string
  L: number
  k: number
  start: StartName
  env: EnvName
  form: RoleKernelForm
  reflect: RoleRule['reflect']
  lossT: number
  lossM: number
  lossR: number
  lossRByClass: number[]
  firstT: number
  firstR: number
  toneOff: number
  normResidual: number
  // the largest |<psi_r | psi_q>| between the three orthogonal pass-A starts at the end (unitarity on their span)
  overlapResidual: number
  antiResidual: number
  multi: number
  chiT0: number[]
  chiTLate: number[]
  chiR0: number[][]
  chiRLate: number[][]
  seconds: number
}

export function pointerCase(input: {
  S: PointerSetup
  plan: PointerPlan
  L: number
  k: number
  start: StartName
  env: EnvName
  form: RoleKernelForm
  reflect?: RoleRule['reflect']
  darwin: boolean
  anti: boolean
  log: (s: string) => void
}): PointerCase {
  const { S, plan, L, k, start, env, form, reflect, darwin, anti, log } = input
  const started = Date.now()
  const n = k + 1
  const fr = S.frames.get(L)!
  const name = `L${L}k${k}${start}${env}${form === 'model' ? '' : form}${reflect ? `R${reflect === 'every' ? '' : 'first'}` : ''}`
  const species = [0, ...new Array<number>(k).fill(1)]
  const e: RoleEngine = roleEngine({
    frame: fr,
    n,
    total: 0,
    angle: S.angles.get(L)!,
    fear: S.fear,
    rules: [
      { form, species, compose: 'sum', reflect },
      { form, species: new Array<number>(n).fill(1), compose: 'sum', reflect },
    ],
    states: 3,
    threads: plan.threads,
  })
  const envR = envRoles(env, k)
  const groupL = [Array.from({ length: k }, (_, i) => i + 1)]
  const groupF = [Array.from({ length: n }, (_, i) => i)]
  const readBeats = new Set<number>()

  for (let b = 0; b <= plan.beats; b += plan.readEvery) {
    readBeats.add(b)
  }

  let normResidual = 0

  // ---- pass A: member 0 pleasure-tone in |0>, |1>, |2> ----
  for (let r = 0; r < 3; r++) {
    roleStart({
      engine: e,
      x: r,
      members: pointerMembers(fr, start, [LINES[r]!, ...envR]),
      groups: groupL,
    })
  }

  const roleCases = [0, 1, 2, 3].flatMap(c =>
    CLASS_PAIRS.map(([p, q]) => ({
      c,
      a: LINES[3 * c + p]!,
      b: LINES[3 * c + q]!,
    })),
  )
  const firstMatrices = (): CM[][] => {
    const X: CM[][] = [[], [], []]

    for (let r = 0; r < 3; r++) {
      for (let q = r; q < 3; q++) {
        const m = e.crossFirst(r, q)

        X[r]![q] = m

        if (q !== r) {
          X[q]![r] = dagger(m, 3)
        }
      }
    }

    return X
  }
  const roleCoherence = (X: CM[][]): [number, number][] =>
    roleCases.map(rc =>
      sandwich(combine(X, superpose(rc.a, rc.b), 3), rc.a, rc.b),
    )
  const fragmentRecords = (): number[][] => {
    const F: CM[][][] = [[], [], []]

    for (let r = 0; r < 3; r++) {
      for (let q = r; q < 3; q++) {
        const ms = e.crossFragments(r, q)

        F[r]![q] = ms

        if (q !== r) {
          F[q]![r] = ms.map((M, i) => dagger(M, 3 ** (i + 1)))
        }
      }
    }

    return [0, 1, 2, 3].map(c =>
      Array.from({ length: k }, (_, i) => {
        const D = 3 ** (i + 1)
        const X = F.map(row => row.map(ms => ms[i]!))
        const states = [0, 1, 2].map(j => combine(X, LINES[3 * c + j]!, D))

        return holevoBits(states, D) / LOG3
      }),
    )
  }

  const role0 = roleCoherence(firstMatrices())
  const roleLossBeats: number[][] = []
  const chiR0 = darwin ? fragmentRecords() : []
  const chiRLate: number[][] = [0, 1, 2, 3].map(() =>
    new Array<number>(k).fill(0),
  )

  let lateReads = 0

  for (let beat = 1; beat <= plan.beats; beat++) {
    const bb: 1 | 2 = beat % 2 === 1 ? 1 : 2

    for (let r = 0; r < 3; r++) {
      e.beat(r, 0, bb)
    }

    const now = roleCoherence(firstMatrices())
    const D = now.map(
      (x, i) =>
        Math.hypot(x[0], x[1]) / Math.hypot(role0[i]![0], role0[i]![1]),
    )

    roleLossBeats.push(D.map(x => 1 - x))

    if (darwin && readBeats.has(beat) && beat >= plan.lateFrom) {
      fragmentRecords().forEach((row, c) =>
        row.forEach((x, i) => {
          chiRLate[c]![i]! += x
        }),
      )
      lateReads++
    }
  }

  if (darwin) {
    chiRLate.forEach(row =>
      row.forEach((_, i) => {
        row[i]! /= lateReads
      }),
    )
  }

  let overlapResidual = 0

  for (let r = 0; r < 3; r++) {
    normResidual = Math.max(normResidual, Math.abs(e.norm(r) - 1))

    for (let q = r + 1; q < 3; q++) {
      const m = e.crossFirst(r, q)

      overlapResidual = Math.max(
        overlapResidual,
        Math.hypot(m.re[0]! + m.re[4]! + m.re[8]!, m.im[0]! + m.im[4]! + m.im[8]!),
      )
    }
  }

  const multiA = e.takeMulti()

  // ---- pass B: L |0>, F |0>, F |1> ----
  roleStart({ engine: e, x: 0, members: pointerMembers(fr, start, [LINES[0]!, ...envR]), groups: groupL })
  roleStart({ engine: e, x: 1, members: pointerMembers(fr, start, [LINES[0]!, ...envR]), groups: groupF })
  roleStart({ engine: e, x: 2, members: pointerMembers(fr, start, [LINES[1]!, ...envR]), groups: groupF })

  const tone = (): [number, number] => {
    const m = e.crossFirst(0, 1)

    return [m.re[0]! + m.re[4]! + m.re[8]!, m.im[0]! + m.im[4]! + m.im[8]!]
  }
  const mixed = (): [number, number] => {
    const m = e.crossFirst(0, 2)

    return [m.re[1]!, m.im[1]!]
  }
  const toneRecords = (): number[] => {
    const a = e.crossFragments(0, 0)
    const b = e.crossFragments(1, 1)

    return a.map((M, i) => holevoBits([M, b[i]!], 3 ** (i + 1)))
  }

  const t0 = tone()
  const m0 = mixed()
  const chiT0 = darwin ? toneRecords() : []
  const chiTLate = new Array<number>(k).fill(0)
  const toneLoss: number[] = []
  const mixedLoss: number[] = []

  let toneOff = 0

  lateReads = 0

  for (let beat = 1; beat <= plan.beats; beat++) {
    const bb: 1 | 2 = beat % 2 === 1 ? 1 : 2

    e.beat(0, 0, bb)
    e.beat(1, 1, bb)
    e.beat(2, 1, bb)

    const t = tone()
    const m = mixed()
    const dT = Math.hypot(t[0], t[1]) / Math.hypot(t0[0], t0[1])
    const dM = Math.hypot(m[0], m[1]) / Math.hypot(m0[0], m0[1])

    toneLoss.push(1 - dT)
    mixedLoss.push(1 - dM)
    toneOff = Math.max(toneOff, Math.abs(dT - 1))

    if (darwin && readBeats.has(beat) && beat >= plan.lateFrom) {
      toneRecords().forEach((x, i) => {
        chiTLate[i]! += x
      })
      lateReads++
    }
  }

  if (darwin) {
    chiTLate.forEach((_, i) => {
      chiTLate[i]! /= lateReads
    })
  }

  for (let x = 0; x < 3; x++) {
    normResidual = Math.max(normResidual, Math.abs(e.norm(x) - 1))
  }

  // branch L's environment members (1 .. k) and branch F's every member stay antisymmetric
  const antiResidual = anti
    ? Math.max(
        exchangeResidual({ engine: e, x: 0, groups: groupL }),
        exchangeResidual({ engine: e, x: 1, groups: groupF }),
      )
    : 0
  const multiB = e.takeMulti()

  e.close()

  const lossRByClass = [0, 1, 2, 3].map(c =>
    mean(
      roleLossBeats.map(row =>
        mean(row.filter((_, i) => roleCases[i]!.c === c)),
      ),
    ),
  )
  const result: PointerCase = {
    name,
    L,
    k,
    start,
    env,
    form,
    reflect,
    lossT: mean(toneLoss),
    lossM: mean(mixedLoss),
    lossR: mean(roleLossBeats.map(mean)),
    lossRByClass,
    firstT: toneLoss[0]!,
    firstR: mean(roleLossBeats[0]!),
    toneOff,
    normResidual,
    overlapResidual,
    antiResidual,
    multi:
      (multiA.weight + multiB.weight) /
      Math.max(1, multiA.steps + multiB.steps),
    chiT0,
    chiTLate,
    chiR0,
    chiRLate,
    seconds: (Date.now() - started) / 1000,
  }

  log(
    `${name}: loss tone ${result.lossT.toFixed(4)} mixed ${result.lossM.toFixed(4)} role ${result.lossR.toFixed(4)} (by basis ${lossRByClass.map(x => x.toFixed(4)).join(' ')}) ratio ${(result.lossT / result.lossR).toFixed(2)}; first ${result.firstT.toFixed(4)} ${result.firstR.toFixed(4)}; multi ${result.multi.toFixed(4)}; norm ${normResidual.toExponential(2)} overlap ${overlapResidual.toExponential(2)} anti ${antiResidual.toExponential(2)} toneOff ${toneOff.toExponential(2)}${darwin ? `; chiT0 ${chiT0.map(x => x.toFixed(4)).join(' ')} chiT ${chiTLate.map(x => x.toFixed(4)).join(' ')} chiR ${chiRLate.map(r => r.map(x => x.toFixed(4)).join('/')).join(' ')}` : ''}; ${result.seconds.toFixed(0)} s`,
  )

  return result
}
