// The spinor token's magnetic moment in a husk field: is g = 2? (A STAND-IN, not the electron.)
//
// A Dirac particle's g = 2 is not put in: it follows from the spin deciding how the particle moves, since the
// square of sigma . (p - q A) is (p - q A)^2 - q sigma . B. Its fingerprint in a uniform field B is in the Landau
// levels: in the slow limit a level sits at (n + 1/2) omega_c - (g / 4) omega_c s for spin s = +-1, so with g = 2
// the lowest level sits exactly at the rest energy and every level above it is a spin pair ((n, down) with
// (n + 1, up)), while with g = 0 every level is a spin pair and the lowest sits at omega_c / 2. From the two
// lowest levels e_0 <= e_1, measured from the rest energy, r = e_0 / e_1 = (2 - g) / (2 + g), so
// g = 2 (1 - r) / (1 + r).
//
// Walks, all in a husk plane at k_z = 0 (code/measure/token-landau, one k_y block of the Landau gauge):
// - the token of E-SPN-0053: schedule x, y, z, up, down with the spin locked to the copy direction. At k_z = 0 its
//   z and depth beats are the coin alone
// - the control: the fear walk of E-FRC-0176's palindrome x, y, y, x with the spin a spectator, whose levels are
//   spin pairs by construction (g = 0), so the estimator must read 0
// - the palindrome x, y, y, x with the spin locked, reported beside the token
// Fields B = 2 pi / L on rings of L = 48, 96 and 192 docks, charge q = 1, k_y = 0. The rest energy is phase 0 (the
// rest eigenvalue 1 of C^n) and the particle band rises on the side the band's own curvature says.
//
// Gates, fixed before the first run:
// - I1 at B = 0 the chain's phases equal the free symbol's phases over the ring's k_x, for the token at k_y = 0.3
//   and L = 48, to 1e-10 (the chain is the walk)
// - I2 the spectator control reads r = 1 (g = 0) to 1e-9 at every B
// - H1 the token reads |g - 2| < 0.1 at L = 192
// - H2 the token's lowest level sits within 0.05 omega_c of the rest energy at L = 192, omega_c read as e_1 - e_0
// - H3 |g - 2| falls as B falls, over L = 48, 96, 192
// PASS only if all hold.
//
// Depth L2: a known consequence of the Dirac structure (Pauli 1927, Dirac 1928), measured on a lattice walk built
// with the model's coin. It tests whether the locked stream carries the Dirac structure far enough for the moment
// to come out right, not whether the model makes an electron.

import { experiment } from '@/test/scaffold/suite'
import { verdict } from '@/test/scaffold/verdict'
import { complexEigenvalues } from '@/code/algebra/linear/complex-eigen'
import { scheduleSymbol, type Mode, type Step } from '@/code/rule/spinor-token'
import { chainPhases } from '@/code/measure/token-landau'

const TOKEN: readonly Step[] = ['x', 'y', 'z', 'up', 'down']
const PALINDROME: readonly Step[] = ['x', 'y', 'y', 'x']
const SIDES = [48, 96, 192]
const CHARGE = 1
const REST_WINDOW = 0.05
const BAND_WINDOW = 1
const CURVATURE_STEP = 1e-3

// the curvature sign of the particle band: + when the phase rises away from 0 along k_x
function bandSign(schedule: readonly Step[], mode: Mode): number {
  const phases = (k: number[]): number[] => {
    const u = scheduleSymbol(schedule, mode, k)
    const e = complexEigenvalues({ re: u.map(c => c[0]), im: u.map(c => c[1]), n: 4 })

    return e.re.map((r, i) => Math.atan2(e.im[i] ?? 0, r))
  }
  const near = phases([CURVATURE_STEP, 0, 0]).sort((a, b) => Math.abs(a) - Math.abs(b))

  return Math.sign(((near[0] ?? 0) + (near[1] ?? 0)) / 2)
}

type Reading = { side: number; field: number; levels: number[]; r: number; g: number; omega: number; pairSplit: number }

function reading(schedule: readonly Step[], mode: Mode, side: number): Reading {
  const field = (2 * Math.PI) / side
  const sign = bandSign(schedule, mode)
  const levels = chainPhases({ side, schedule, mode, field, charge: CHARGE, ky: 0 })
    .map(p => sign * p)
    .filter(e => e > -REST_WINDOW && e < BAND_WINDOW)
    .sort((a, b) => a - b)
  const [e0 = 0, e1 = 0, e2 = 0] = levels
  const r = e1 === 0 ? 1 : e0 / e1

  return { side, field, levels: levels.slice(0, 6), r, g: (2 * (1 - r)) / (1 + r), omega: e1 - e0, pairSplit: e1 === 0 ? 0 : (e2 - e1) / e1 }
}

export default experiment({
  id: 'matter/token-g-factor',
  code: 'E-MTR-0014',
  title:
    'the magnetic moment of the spinor token, a STAND-IN: in a uniform husk field its Landau levels are read one k_y block at a time, and g is read off the two lowest levels, against a spectator-spin control that must read 0',
  category: 'spin',
  substrates: ['3434'],
  depth: 'L2',
  paper: false,
  run() {
    // I1
    const side0 = SIDES[0] ?? 48
    const ky = 0.3
    const chain = chainPhases({ side: side0, schedule: TOKEN, mode: 'locked', field: 0, charge: CHARGE, ky }).sort((a, b) => a - b)
    const free: number[] = []

    for (let n = 0; n < side0; n++) {
      const u = scheduleSymbol(TOKEN, 'locked', [(2 * Math.PI * n) / side0, ky, 0])
      const e = complexEigenvalues({ re: u.map(c => c[0]), im: u.map(c => c[1]), n: 4 })

      e.re.forEach((r, i) => free.push(Math.atan2(e.im[i] ?? 0, r)))
    }

    free.sort((a, b) => a - b)

    const i1Gap = Math.max(...chain.map((p, i) => Math.abs(p - (free[i] ?? 0))))
    const token = SIDES.map(s => reading(TOKEN, 'locked', s))
    const control = SIDES.map(s => reading(PALINDROME, 'spectator', s))
    const lockedPalindrome = SIDES.map(s => reading(PALINDROME, 'locked', s))
    const last = token[token.length - 1]
    const i1 = i1Gap < 1e-10
    const i2 = control.every(c => Math.abs(c.r - 1) < 1e-9)
    const h1 = !!last && Math.abs(last.g - 2) < 0.1
    const h2 = !!last && (last.levels[0] ?? 1) < REST_WINDOW * last.omega && (last.levels[0] ?? -1) > -REST_WINDOW * last.omega
    const h3 = token.every((t, i) => i === 0 || Math.abs(t.g - 2) < Math.abs((token[i - 1]?.g ?? 0) - 2))
    const ok = i1 && i2 && h1 && h2 && h3
    const row = (name: string, list: Reading[]): Record<string, number> =>
      Object.fromEntries(
        list.flatMap(t => [
          [`${name}L${t.side}_g`, Number(t.g.toFixed(6))],
          [`${name}L${t.side}_r`, Number(t.r.toFixed(6))],
          [`${name}L${t.side}_omega`, Number(t.omega.toFixed(6))],
          [`${name}L${t.side}_omegaOverB`, Number((t.omega / t.field).toFixed(6))],
          [`${name}L${t.side}_pairSplit`, Number(t.pairSplit.toFixed(6))],
          ...t.levels.slice(0, 5).map((e, i) => [`${name}L${t.side}_level${i}`, Number(e.toFixed(6))]),
        ]),
      )

    return verdict({
      status: ok ? 'pass' : 'fail',
      claim: `the chain is the walk (gap ${i1Gap.toExponential(1)}); the spectator control reads g = ${control.map(c => c.g.toFixed(3)).join(', ')}; the token reads g = ${token.map(t => t.g.toFixed(4)).join(', ')} at B = 2 pi / ${SIDES.join(', ')}, its lowest level at ${token.map(t => ((t.levels[0] ?? 0) / (t.omega || 1)).toFixed(4)).join(', ')} of omega_c above the rest energy and its next pair split by ${token.map(t => t.pairSplit.toFixed(4)).join(', ')} of omega_c; the locked palindrome reads g = ${lockedPalindrome.map(t => t.g.toFixed(4)).join(', ')}`,
      metrics: { i1ChainGap: i1Gap, ...row('token', token), ...row('lockedPalindrome', lockedPalindrome) },
      control: row('spectator', control),
      notes:
        'L2, STAND-IN. The token\'s spin-averaged mass per period is sqrt 3 (E-SPN-0053: Hessian 1/sqrt 3), so omega_c = q B / sqrt 3 per period in the slow limit; omegaOverB is the measured omega_c over B, to be compared with 1/sqrt 3 = 0.5774 (E-FRC-0176 found its cyclotron 0.77 to 0.91 of the prediction for the spinless walk). g is read from level positions alone, so it needs no fitted mass. A g near 2 would say the locked stream carries the Dirac square root; a g near 0 would say the spin rides along. Neither says the model makes an electron. FIRST RUN, DISCLOSED: the estimator is defective. Every level of every walk, the control included, came out exactly doubly degenerate in the k_y block, so e_0 = e_1, r = 1 and g = 0 by construction, and I2 passed for that reason, not for physics. The raw token levels at L = 192 are -0.0095 (x2), 0.0091 (x2), 0.0272, spaced 0.0183 per period (omega_c / B = 0.56 against 1/sqrt 3 = 0.577), with no unpaired lowest level: the degeneracy pattern of g = 2 is absent, but the lowest pair sits half a spacing BELOW the rest phase, which the g = 0 pattern does not predict either, so the reading is unresolved. Gates not moved; a corrected estimator (count multiplicities, fix the band side from the free chain) is future work under a new code.',
    })
  },
})
