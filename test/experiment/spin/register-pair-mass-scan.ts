// DOES THE REGISTER PAIR'S REMAINING EXCESS SCALE AS ITS INTERNAL SPEED? (E-SPN-0211, OPEN-MOT-01). With the light's
// contact well removed, the tracked level's R_full stands 0.143 (a_B 8) and 0.101 (a_B 12) above the corrected static
// reference (E-SPN-0209: the member's exact band over the level's momentum density, plus the Darwin exchange), a
// remainder falling as a_B^-0.85, first order in the coupling. At fixed member mass a first-order term is a term
// first order in the pair's internal speed v ~ alpha_eff = 1 / (mu a_B). This file varies the member's mass at fixed
// a_B to ask whether the remainder is a function of that speed.
//
// WHY NOT THE DIRECTION TEST FIRST. The direction test (R along the face and body diagonals) cannot decide anything at
// this order: the tracked level lies in the O_h-trivial sector, and a symmetric rank-2 tensor invariant under the
// cubic group is a multiple of the identity, so the K^2 coefficient that R is read from is isotropic exactly, artifact
// or not (the engine has measured it so: 5e-7 in E-SPN-0162, 2e-6 in E-SPN-0173). Lattice anisotropy enters only at
// K^4, which the reads' Richardson step removes. So the mass test is the informative one, and runs in its place.
//
// THE RUN. The tracked scan (code/measure/register-track readZero and readMotion, the axis read) at a_B 8 (ball 36, N
// 8192) on the softened count (code/measure/contact-core softenContact), for three members, each a ring unit of the
// rule's ring (code/measure/register-track setupFor):
//   ringUnit(-7, 2)  m 0.283682
//   ringUnit(-5, 1)  m 0.427029  (E-SPN-0206's recorded read, tmp/spn-core-soften-a8.json, the witness)
//   ringUnit(-8, 3)  m 0.473807
// all below pi / 6. The pull is the same count, alpha = 24 pi / (mu a_B), so at fixed a_B a lighter member is bound by a
// larger alpha and moves faster inside the pair. The remainder at each is r = R_full,recorded - R_full,corrected, the
// corrected reference E-SPN-0209's (lattice-pair-inertia with the radius of the level's own binding, minus the Darwin
// term), computed the same way for every member.
//
// GATES, fixed before the run:
//   W  THE WITNESS: the m 0.427 point, read again by this file's code path, has R_full equal to the recorded
//      1.2236985226452484 within 1e-9 (setupFor(-5, 1) is setup())
//   I  each new level is a clean single line (overlap at least 0.2 and twice the next line's) and quadratic (ratio
//      within 0.1 of 4); a member whose level is not clean is reported and leaves the fit
//   V  THE SPEED LAW: the least-squares exponent b of r against m over the clean members (r proportional to m^b at
//      fixed a_B) lies in [-1.3, -0.7]: the remainder scales as 1 / (m a_B), the internal speed
//   Verdict: pass if W, I and V hold at all three masses; partial if W holds and b lies in [-2, 0] but outside V's band,
//   or a member is not clean but the two others give b inside V's band; fail otherwise (b positive points at the
//   member's own lattice mass, tan m - m, rather than the pair's speed).
// PREDICTED: under V, r(0.2837) = 0.143 x 0.427 / 0.284 = 0.215 and r(0.4738) = 0.129.
//
// FIRST RUN (2026-10-20, tmp/spn-mass-<name>.log and .json, three processes on the native kernel at 6 threads each,
// 2.3 hours; the verdict by combineMass in tmp/spn-0211-combine.ts, tmp/spn-0211-verdict.log): FAIL. No gate moved.
//  - W holds: the m 0.427 read gives R_full 1.2236985226452484, the recorded value to the bit.
//  - I fails at m 0.284: its identity is clean (overlap 0.476 against 0.213) but its K read is not quadratic (ratio
//    5.79 at K 0.04, 3.855 at the retry's K 0.02). Read anyway: R 1.674, R_full 1.550 against a corrected reference of
//    1.017, remainder 0.533. m 0.474 is clean (0.613 against 0.196, ratio 3.904): R 1.331, R_full 1.292 against 1.101,
//    remainder 0.191. m 0.427: remainder 0.143.
//  - V fails: over the two clean members the exponent is +2.79, against the speed law's -1 (the band [-1.3, -0.7]),
//    and outside [-2, 0], so the verdict is fail. The remainder is not monotone in the mass: 0.533, 0.143, 0.191 at m
//    0.284, 0.427, 0.474, so no single power of m (or of the speed 1 / (m a_B)) carries it.
// MEANING. Two pieces at least: one that grows as the member gets lighter at fixed a_B (the pair moving faster inside,
// alpha_eff = 1 / (mu a_B) rising from 0.20 to 0.30 a cycle at the first shell's scale), read here on a level whose K
// read is not clean, and one that grows as the member gets heavier (with tan m / m - 1: 0.066 to 0.082, the member's
// own lattice inertia; the remainder 0.143 to 0.191, ratios 1.25 and 1.34). Both are lattice terms of the static
// engine: in a continuum theory the static-plus-Darwin reference is the whole answer at this order (E-SPN-0209), and a
// remainder that depends on the member's lattice mass is not one a relativistic bound state can carry.
//
// Depth L2 (a two-body quantum walk on the husk quotient, exact in its moving block; the softened count is a control).
// DETERMINISM: no random numbers; the native kernel, byte for byte the JavaScript.

import { readFileSync } from 'node:fs'
import { experiment } from '@/test/scaffold/suite'
import { verdict, type Verdict } from '@/test/scaffold/verdict'
import type { KernelOptions } from '@/code/kernel/index'
import { softenContact } from '@/code/measure/contact-core'
import {
  bindingRadius,
  latticePairCurvature,
  pairR,
} from '@/code/measure/lattice-pair-inertia'
import {
  readMotion,
  readZero,
  setupFor,
  TRACK_PLAN,
  type MotionRead,
  type Setup,
  type ZeroRead,
} from '@/code/measure/register-track'

const A_B = 8
const RECORDED_RFULL = 1.2236985226452484
const WITNESS = 1e-9
const IDENTITY = 0.2
const AMBIGUOUS = 2
const QUADRATIC = 0.1
const V_BAND = [-1.3, -0.7] as const
const WIDE_BAND = [-2, 0] as const

export const MEMBERS: readonly { name: string; unit: [number, number] }[] = [
  { name: 'm0284', unit: [-7, 2] },
  { name: 'm0427', unit: [-5, 1] },
  { name: 'm0474', unit: [-8, 3] },
]

export type MassPart = { name: string; zero: ZeroRead; motion: MotionRead }

export function massPart(
  name: string,
  unit: readonly [number, number],
  opts: KernelOptions,
  log: (what: string) => void = () => {},
): MassPart {
  const su = setupFor(unit)
  const p = TRACK_PLAN.find(x => x.aB === A_B)!
  const zero = readZero(su, p, opts, log, 1, softenContact)

  return { name, zero, motion: readMotion(su, p, zero, opts, log, softenContact) }
}

// E-SPN-0209's corrected reference for one member's level
export function correctedReference(su: Setup, E: number, S: number): number {
  const Eb = 2 * su.M0 - E
  const eb = Eb / 2
  const a = latticePairCurvature({ M0: su.M0, radius: bindingRadius(su.mu, Eb) }).a

  return pairR(a, E) - ((8 / 3) * eb * S) / (2 * su.m - eb)
}

const flag = (b: boolean): number => (b ? 1 : 0)

export function combineMass(parts: MassPart[]): Verdict {
  const metrics: Record<string, number> = {}
  const rows: { name: string; m: number; r: number; clean: boolean }[] = []
  const text: string[] = []

  for (const part of parts) {
    const unit = MEMBERS.find(x => x.name === part.name)!.unit
    const su = setupFor(unit)
    const z = part.zero
    const t = part.motion.tracked
    const clean =
      z.tracked.overlap >= IDENTITY &&
      z.tracked.overlap >= AMBIGUOUS * z.next &&
      t !== null &&
      Math.abs(t.ratio - 4) <= QUADRATIC
    const ref = t ? correctedReference(su, t.E, z.darwinS) : NaN
    const r = part.motion.Rfull - ref

    rows.push({ name: part.name, m: su.m, r, clean })
    metrics[`${part.name}_m`] = su.m
    metrics[`${part.name}_tanOver`] = su.tanOver
    metrics[`${part.name}_overlap`] = z.tracked.overlap
    metrics[`${part.name}_next`] = z.next
    metrics[`${part.name}_scaled`] = z.tracked.scaled
    metrics[`${part.name}_ratio`] = t?.ratio ?? NaN
    metrics[`${part.name}_Rstatic`] = t?.R ?? NaN
    metrics[`${part.name}_Rfull`] = part.motion.Rfull
    metrics[`${part.name}_reference`] = ref
    metrics[`${part.name}_remainder`] = r
    metrics[`${part.name}_clean`] = flag(clean)
    text.push(
      `${part.name} (m ${su.m.toFixed(6)}, tan m / m ${su.tanOver.toFixed(4)}): tracked ${z.tracked.E.toFixed(7)} (overlap ${z.tracked.overlap.toFixed(3)}, next ${z.next.toFixed(3)}, scaled E_b ${z.tracked.scaled.toFixed(3)}), ${t ? `R ${t.R.toFixed(4)} (ratio ${t.ratio.toFixed(3)}, K ${part.motion.kappa})` : 'no continuation'}, R_full ${part.motion.Rfull.toFixed(4)}, corrected reference ${ref.toFixed(4)}, remainder ${r.toFixed(4)}`,
    )
  }

  const base = parts.find(p => p.name === 'm0427')!
  const W = Math.abs(base.motion.Rfull - RECORDED_RFULL) <= WITNESS
  const fit = (pts: typeof rows): number => {
    const xs = pts.map(p => Math.log(p.m))
    const ys = pts.map(p => Math.log(p.r))
    const mx = xs.reduce((s, x) => s + x, 0) / xs.length
    const my = ys.reduce((s, y) => s + y, 0) / ys.length

    let sxy = 0
    let sxx = 0

    xs.forEach((x, i) => {
      sxy += (x - mx) * (ys[i]! - my)
      sxx += (x - mx) ** 2
    })

    return sxy / sxx
  }
  const usable = rows.filter(p => p.clean && p.r > 0)
  const b = usable.length >= 2 ? fit(usable) : NaN
  const allClean = rows.every(p => p.clean)
  const inV = b >= V_BAND[0] && b <= V_BAND[1]
  const inWide = b >= WIDE_BAND[0] && b <= WIDE_BAND[1]
  const status =
    W && allClean && inV
      ? 'pass'
      : W && ((allClean && inWide) || (!allClean && usable.length >= 2 && inV))
        ? 'partial'
        : 'fail'

  metrics.W = flag(W)
  metrics.allClean = flag(allClean)
  metrics.exponent = b
  metrics.V = flag(inV)

  return verdict({
    status,
    claim: `at a_B 8 with the contact well removed, the remainder over the corrected reference reads ${rows.map(p => `${p.r.toFixed(4)} at m ${p.m.toFixed(3)}${p.clean ? '' : ' (not clean)'}`).join(', ')}: r proportional to m^${b.toFixed(2)} at fixed a_B (the speed law asks -1); W ${W}, V ${inV}`,
    metrics,
    control: { witnessRfull: base.motion.Rfull },
    notes: `L2. ${text.join('. ')}.`,
  })
}

const NATIVE: KernelOptions = { backend: 'native', threads: 12 }

export default experiment({
  id: 'spin/register-pair-mass-scan',
  code: 'E-SPN-0211',
  title:
    "explores whether the light register pair's remaining excess inertia scales as its internal speed: the member's mass varied at fixed a_B 8 with the contact well removed: fail, the remainder 0.533, 0.143, 0.191 at m 0.284, 0.427, 0.474 is not one power of the speed",
  category: 'spin',
  substrates: ['3434'],
  depth: 'L2',
  paper: false,
  run() {
    return combineMass(MEMBERS.map(x => massPart(x.name, x.unit, NATIVE)))
  },
})

// the recorded m 0.427 part, for a combine from saved reads (tmp/spn-0211-combine.ts)
export const recordedBase = (file: string): MassPart => {
  const j = JSON.parse(readFileSync(file, 'utf8'))

  return { name: 'm0427', zero: j.zero, motion: j.motion }
}
