// IS A BOUND STATE STUCK ON LINES? TWO READS OF ONE AUTOCORRELATION, AND WHAT LINE BRANCHES WOULD MAKE OF THEM (E-RLT-0118).
//
// A composite whose parts keep their lines splits, at total momentum K = kappa n, into twelve branches at E0 + 4 a
// kappa^2 (n . u)^2 (code/measure/lineon-branches' branchShifts). A single 3d band moves whole, by a kappa^2 + b kappa^4.
// Both reads here take the autocorrelation x_l = <v | G U^l v> of the K = 0 level v run at K (code/measure/
// pair-direction's pairCorrelation), so one run serves both.
//
//   filteredRead   the Blackman-Harris filter of S cycles at phase p applied to v, read in one cycle: its phase and its
//                  residual |U f - lambda f| / |f|. From the filtered correlation c (code/measure/register-reduced's
//                  filteredCorrelation): lambda = c_1 / c_0 and, U being unitary in the Gram metric, residual^2 =
//                  1 - |lambda|^2. This is reducedFilter then reducedRead without a second run, exactly as far as U is
//                  unitary (the engine's Gram norm drifts 1.17e-5 over 4,096 cycles, about 3e-9 a cycle, so below a
//                  residual of about 1e-4 the two differ).
//   stillShare     the weight of the lines within `near` of E0 (filter diagonalization) over the K = 0 line's weight w0:
//                  the share of the level that did not move. Line branches with n . u = 0 never move, so they leave the
//                  share of such classes; a band leaves none.
//   replaceLine    the instrument's controls: the K = 0 correlation with its main line (energy E0, weight w0) replaced by
//                  the same weight at other energies, every other line of the K = 0 spectrum left in place. With the
//                  twelve branch energies it is what a line-branch pair would hand the reads; with one moved energy, what
//                  a single band would.
//
// DETERMINISM: no random numbers. FLOATS: measurement on a recorded correlation.

import { filterDiagonalize, type FilterLine } from '@/code/algebra/linear/filter-diagonalization'
import { filteredCorrelation } from '@/code/measure/register-reduced'

export type Correlation = { re: ArrayLike<number>; im: ArrayLike<number> }

export function filteredRead(input: {
  x: Correlation
  phase: number
  S: number
}): { phase: number; residual: number } {
  const c = filteredCorrelation(
    { re: Float64Array.from(input.x.re), im: Float64Array.from(input.x.im) },
    input.phase,
    input.S,
    1,
  )
  const n = c.re[0]!
  const lr = c.re[1]! / n
  const li = c.im[1]! / n

  return {
    phase: Math.atan2(li, lr),
    residual: Math.sqrt(Math.max(0, 1 - lr * lr - li * li)),
  }
}

export const heaviestLine = (ls: readonly FilterLine[]): FilterLine | undefined =>
  ls.length === 0 ? undefined : ls.reduce((b, l) => (l.weight > b.weight ? l : b))

export function lineSolve(input: {
  x: Correlation
  lo: number
  hi: number
  basis: number
  S: number
}): FilterLine[] {
  return filterDiagonalize({ x: input.x, lo: input.lo, hi: input.hi, basis: input.basis, length: input.S })
}

export function stillShare(input: {
  lines: readonly FilterLine[]
  E0: number
  w0: number
  near: number
}): number {
  return (
    input.lines
      .filter(l => Math.abs(l.E - input.E0) <= input.near)
      .reduce((s, l) => s + l.weight, 0) / input.w0
  )
}

// x_l - w0 e^(i E0 l) + (w0 / m) sum_k e^(i E_k l), l = 0 .. x's last lag, for the m energies E_k
export function replaceLine(input: {
  x: Correlation
  E0: number
  w0: number
  energies: readonly number[]
}): { re: number[]; im: number[] } {
  const { x, E0, w0, energies } = input
  const re: number[] = []
  const im: number[] = []

  for (let l = 0; l < x.re.length; l++) {
    let r = x.re[l]! - w0 * Math.cos(E0 * l)
    let i = x.im[l]! - w0 * Math.sin(E0 * l)

    for (const E of energies) {
      r += (w0 / energies.length) * Math.cos(E * l)
      i += (w0 / energies.length) * Math.sin(E * l)
    }

    re.push(r)
    im.push(i)
  }

  return { re, im }
}
