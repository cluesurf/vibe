// A REGISTER PAIR PULLED APART AND LET GO (E-SPN-0177). code/measure/register-meson runs two register members bound by the
// singlet-pair string (E-SPN-0162) exactly inside W (x) W, over their relative position. This file holds what a pull needs:
//
//   shellStart     both members in S with the registers paired by delta (the W(F4)-symmetric sector, as sStart), the
//                  relative profile a shell exp(-((V - V0) / w)^2) around the string length V0: the pair set at a
//                  separation and released at rest, with no radial momentum
//   weightWithin   the coordinate weight at string lengths V <= vMax over a reference weight (the profile of
//                  code/measure/register-meson, the diagonal of the Gram metric)
//   meanLength     the mean string length of the coordinate weight
//
// DETERMINISM: no random numbers. FLOATS: measurement on exact pieces, as in code/measure/register-meson.

import {
  BLOCK,
  newPair,
  profile,
  type PairEngine,
  type PairState,
  type RelBall,
} from '@/code/measure/register-meson'

const SITE = 256
const REG = 8

export function shellStart(
  ball: RelBall,
  V0: number,
  width: number,
): PairState {
  const s = newPair(ball)

  for (let i = 0; i < ball.points.length; i++) {
    const f = Math.exp(-(((ball.V[i]! - V0) / width) ** 2))

    for (let a = 0; a < REG; a++) {
      s.re[i * SITE + BLOCK.A + a * REG + a] = f
    }
  }

  return s
}

export function weightWithin(
  e: PairEngine,
  s: PairState,
  vMax: number,
  reference: number,
): number {
  return (
    profile(e, s)
      .slice(0, vMax + 1)
      .reduce((a, x) => a + x, 0) / reference
  )
}

export function meanLength(e: PairEngine, s: PairState): number {
  const p = profile(e, s)
  const t = p.reduce((a, x) => a + x, 0)

  return p.reduce((a, x, v) => a + v * x, 0) / t
}

export const totalWeight = (e: PairEngine, s: PairState): number =>
  profile(e, s).reduce((a, x) => a + x, 0)
