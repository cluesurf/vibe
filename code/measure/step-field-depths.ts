// The per-class depths written as step fields (E-GRV-0090's register kind), and what that does to the metric's wave
// speed and to the slide. Theory plus one read of the rule: the scalar step field's kernel is READ from one beat of
// code/rule/step-depth (an impulse, then the rates), never typed in; everything after is exact kernel arithmetic.
//
// THE SCALAR STEP FIELD. One beat is v += kappa (rho - div F), F += g (v_tail - v_head), so with F = g (x_tail -
// x_head) the found depth runs x(t+1) - 2 x(t) + x(t-1) = -kappa (A x)(t), A the husk Laplacian with link stiffness g
// (2 on an axis, 1 on a face diagonal) and per-dock inertia 1 / kappa, kappa = a / Q. Its long-wave speed along n is
//   c^2 = kappa S(n) / |n|^2,   S(n) = (1/2) sum_r (-A_r) (r . n)^2
// the inertia against the stiffness, and S(n) = 6 |n|^2 on the husk (sum over the 18 links of g r r^T = 12 I).
//
// THE CLASS STEP FIELDS. Every per-class depth d_a is a register of the same kind: inertia 1 / kappa per dock, the
// same kappa, the same leapfrog. Two readings of "a step field along its own line class":
//   line   d_a's steps live on the links of its own class only (husk vector u_a, stiffness g(u_a)): a 1d wave along u_a,
//          omega^2 = kappa g_a 2 (1 - cos k . u_a)
//   full   d_a is a scalar step field over all 18 husk links: every class runs the scalar's own omega(k)
// Both are local, cube symmetric and quadratic, so each is a point of the action space of code/measure/spacetime-slide
// (M on-site, N = 0, K within one husk step), and the slide's invariance rows can be evaluated on it directly.
//
// DETERMINISM: nothing is drawn. NOTHING MOVES: values only.

import { dyadicMod, mod, mulMod } from '@/code/algebra/linear/modular-linear'
import { PLAIN_SLOTS, type ClassGeometry, type Offset } from '@/code/measure/slide-invariant-operators'
import type { SlideKernels } from '@/code/measure/spacetime-slide'
import { emptyStep, stepBeat, stepBeatBack, stepRule, stepScratch, duplicateStep, sameStep } from '@/code/rule/step-depth'
import { radionMesh, radionWeight } from '@/code/rule/trit-radion'

const key3 = (r: readonly number[]): string => `${r[0]},${r[1]},${r[2]}`

// ---------------------------------------------------------------------------------------------------------
// the scalar step field, read from the rule

export type StepKernel = {
  readonly depth: number
  // kappa = a / q
  readonly a: number
  readonly q: number
  // the husk Laplacian A's kernel: offset -> A_r (integers read from the rule)
  readonly kernel: ReadonlyMap<string, { readonly offset: Offset; readonly value: number }>
  // every rate the impulse produced was a whole multiple of a (so A_r = -rate / a exactly)
  readonly exact: boolean
  // the beat reversed bit for bit
  readonly reversed: boolean
}

// one beat of the step rule on a periodic side-5 husk from rest, with the found depth an impulse of Q register units
// at the center dock: the rates after the beat are v = -kappa A x, so A_r = -v(center + r) / a
export function readStepKernel(depth: number): StepKernel {
  const side = 5
  const mesh = radionMesh([side, side, side])
  const rule = stepRule(depth, 2)
  const state = emptyStep(mesh)
  const center = 2 + side * (2 + side * 2)
  const height = rule.q
  const x = (y: number): number => (y === center ? height : 0)

  for (let y = 0; y < mesh.docks; y++) for (let k = 0; k < 9; k++) state.step[y * 9 + k] = radionWeight(k) * (x(y) - x(mesh.neighbour[y * 9 + k]!))

  const start = duplicateStep(state)
  const scratch = stepScratch(mesh)

  stepBeat(mesh, rule, state, scratch)

  const kernel = new Map<string, { offset: Offset; value: number }>()
  let exact = true
  const wrap = (v: number): number => ((((v + 2) % side) + side) % side) - 2

  for (let y = 0; y < mesh.docks; y++) {
    const v = state.rate[y]!

    if (v === 0) continue
    if (v % rule.a !== 0) exact = false

    const offset: Offset = [wrap((y % side) - 2), wrap((Math.floor(y / side) % side) - 2), wrap(Math.floor(y / (side * side)) - 2)]

    kernel.set(key3(offset), { offset, value: -v / rule.a })
  }

  const back = duplicateStep(state)

  stepBeatBack(mesh, rule, back, scratch)

  return { depth, a: rule.a, q: rule.q, kernel, exact, reversed: sameStep(back, start) }
}

// S(n) = (1/2) sum_r (-A_r) (r . n)^2: c^2 = kappa S(n) / |n|^2 (an integer for integer n)
export function stepStiffness(k: StepKernel, n: readonly number[]): number {
  let s = 0

  for (const { offset, value } of k.kernel.values()) {
    const rn = offset[0] * n[0]! + offset[1] * n[1]! + offset[2] * n[2]!

    s -= value * rn * rn
  }

  return s / 2
}

// ---------------------------------------------------------------------------------------------------------
// the class step fields as kernels on the 12 depths

export type StepReading = 'line' | 'full'

// a kernel entry: K_ab(offset) = value
export type KernelEntry = { readonly a: number; readonly b: number; readonly offset: Offset; readonly value: number }

// the potential K of every class a step field, from the scalar's read kernel: `full` copies A onto every class;
// `line` keeps each class's own link pair (A at +-u_a) and the on-site term that makes its row sum zero
export function classStepPotential(geometry: ClassGeometry, scalar: StepKernel, reading: StepReading): KernelEntry[] {
  const out: KernelEntry[] = []

  geometry.husk.forEach((u, a) => {
    if (reading === 'full') {
      for (const { offset, value } of scalar.kernel.values()) out.push({ a, b: a, offset, value })

      return
    }

    const link = scalar.kernel.get(key3(u))!.value
    const back = scalar.kernel.get(key3(u.map(x => -x)))!.value

    out.push({ a, b: a, offset: [u[0]!, u[1]!, u[2]!], value: link })
    out.push({ a, b: a, offset: [-u[0]!, -u[1]!, -u[2]!], value: back })
    out.push({ a, b: a, offset: [0, 0, 0], value: -(link + back) })
  })

  return out
}

// the per-register inertia, one unit on every class on-site (the 1 / kappa scale drops out of every row and ratio)
export const classStepInertia = (): KernelEntry[] => Array.from({ length: 12 }, (_, a) => ({ a, b: a, offset: [0, 0, 0] as Offset, value: 1 }))

// ---------------------------------------------------------------------------------------------------------
// the slide's invariance rows evaluated on one action

// (X * G)(a, component, s) = sum_r X_ab(r) G_b(s - r), mod p, added into `out` under `tag`
// (a kernel already reduced mod p, like einsteinHilbertDepthKernel's, passes `residues`)
function convolve(out: Map<string, number>, tag: string, kernel: readonly KernelEntry[], entries: SlideKernels['space'], p: number, residues: boolean): void {
  for (const k of kernel) {
    const kv = residues ? mod(k.value, p) : dyadicMod(k.value, p)

    for (const e of entries) {
      if (e.class !== k.b) continue

      const s = [k.offset[0] + e.offset[0], k.offset[1] + e.offset[1], k.offset[2] + e.offset[2]]
      const id = `${tag}|${k.a},${e.component},${key3(s)}`

      out.set(id, mod((out.get(id) ?? 0) + mulMod(kv, dyadicMod(e.value, p), p), p))
    }
  }
}

export type TagResidual = {
  // rows of this power of omega that are not zero, split by the slide component they come from
  readonly spatial: number
  readonly time: number
}

// the residual of S(omega) G(omega) = 0 per power of omega for the action (M, N = 0, K):
//   omega^3  M G1    omega^2  M G0    omega^1  K G1    omega^0  K G0
// (N = 0, so each power reads one kernel). With `static` only the omega^0 row exists.
export function slideResidual(
  inertia: readonly KernelEntry[],
  potential: readonly KernelEntry[],
  kernels: SlideKernels,
  withTime: boolean,
  p: number,
  residues = false,
): Record<'3' | '2' | '1' | '0', TagResidual> {
  const rows = new Map<string, number>()

  convolve(rows, '0', potential, kernels.space, p, residues)
  if (withTime) {
    convolve(rows, '3', inertia, kernels.time, p, residues)
    convolve(rows, '2', inertia, kernels.space, p, residues)
    convolve(rows, '1', potential, kernels.time, p, residues)
  }

  const out = { '3': { spatial: 0, time: 0 }, '2': { spatial: 0, time: 0 }, '1': { spatial: 0, time: 0 }, '0': { spatial: 0, time: 0 } }

  for (const [id, v] of rows) {
    if (v % p === 0) continue

    const [tag, rest] = id.split('|') as ['3' | '2' | '1' | '0', string]
    const component = Number(rest.split(',')[1])

    if (component === 3) out[tag].time++
    else out[tag].spatial++
  }

  return out
}

// ---------------------------------------------------------------------------------------------------------
// the metric's forms under the class step fields

// the kinetic block sum_a w_a span_a span_a^T (6 x 6 plain), per unit 1 / kappa
export function stepKineticBlock(geometry: ClassGeometry, weight: (a: number) => number): number[][] {
  return PLAIN_SLOTS.map((_, s) => PLAIN_SLOTS.map((__, t) => geometry.span.reduce((u, row, a) => u + weight(a) * row[s]! * row[t]!, 0)))
}

// the long-wave potential block along n (the k^2 coefficient, k = n): sum_a w_a s_a(n) span_a span_a^T with s_a(n) the
// class's own stiffness moment (1/2) sum_r (-K_aa(r)) (r . n)^2
export function stepPotentialBlock(geometry: ClassGeometry, potential: readonly KernelEntry[], n: readonly number[], weight: (a: number) => number): number[][] {
  const moment = new Array<number>(12).fill(0)

  for (const k of potential) {
    if (k.a !== k.b) throw new Error('step-field-depths: a class step field couples no two classes')

    const rn = k.offset[0] * n[0]! + k.offset[1] * n[1]! + k.offset[2] * n[2]!

    moment[k.a]! -= (k.value * rn * rn) / 2
  }

  return PLAIN_SLOTS.map((_, s) => PLAIN_SLOTS.map((__, t) => geometry.span.reduce((u, row, a) => u + weight(a) * moment[a]! * row[s]! * row[t]!, 0)))
}

// the class moments s_a(n) themselves (the 12 decoupled branches' omega^2 / (kappa k^2) times |n|^2)
export function classMoments(potential: readonly KernelEntry[], n: readonly number[]): number[] {
  const moment = new Array<number>(12).fill(0)

  for (const k of potential) {
    const rn = k.offset[0] * n[0]! + k.offset[1] * n[1]! + k.offset[2] * n[2]!

    moment[k.a]! -= (k.value * rn * rn) / 2
  }

  return moment
}

// the two TT polarizations along integer n (a, b integer, orthogonal to n and each other), in plain coordinates
export function ttPolarizations(a: readonly number[], b: readonly number[]): { plus: number[]; cross: number[] } {
  const aa = a.reduce((t, x) => t + x * x, 0)
  const bb = b.reduce((t, x) => t + x * x, 0)

  return {
    plus: PLAIN_SLOTS.map(([i, j]) => bb * a[i]! * a[j]! - aa * b[i]! * b[j]!),
    cross: PLAIN_SLOTS.map(([i, j]) => a[i]! * b[j]! + b[i]! * a[j]!),
  }
}

export const quadratic = (f: readonly (readonly number[])[], h: readonly number[]): number => f.reduce((t, row, s) => t + h[s]! * row.reduce((u, x, j) => u + x * h[j]!, 0), 0)
