// THE SELF-PORT SHARE of the lazy root token's moving band (E-MTR-0027). MEASUREMENT code, floats throughout.
//
// The lazy root token (code/rule/lazy-root-token, a STAND-IN) holds Q = 9 (2D + 1) ports per dock: 24 root ports that
// copy along their husk shadows and Q - 24 self ports that copy nowhere. Its one-beat symbol W(k) = S(k) R
// (code/measure/one-light-speed lazySymbol) has a dispersive band e^(i phi / 2) e^(+- i E) with cos E = cos(phi / 2)
// (1 - L(k) / Q). This file reads the band's eigenvector straight off the symbol (inverse iteration on the measured
// eigenvalue, no closed form used) and returns how its weight splits between self ports and root ports.

import {
  complexEigenvalues,
  complexEigenvector,
} from '@/code/algebra/linear/complex-eigen'
import { lazySymbol } from '@/code/measure/one-light-speed'

const FLAT = 1e-7

// the upper dispersive band: the eigenvalue off the flat +-1 bands whose phase sits at phi / 2 + E with E in (0, pi)
export function lazyUpperBand(
  Q: number,
  phi: number,
  k: readonly number[],
): { phase: number; energy: number; re: number; im: number } {
  const m = lazySymbol(Q, phi, k)
  const e = complexEigenvalues({ re: m.re, im: m.im, n: Q })

  let best: { phase: number; energy: number; re: number; im: number } | null =
    null

  for (let i = 0; i < Q; i++) {
    const re = e.re[i] ?? 0
    const im = e.im[i] ?? 0

    if (Math.abs(im) < FLAT) {
      continue
    }

    const phase = Math.atan2(im, re)
    const energy = Math.atan2(
      Math.sin(phase - phi / 2),
      Math.cos(phase - phi / 2),
    )

    if (energy > 0 && (!best || energy < best.energy)) {
      best = { phase, energy, re, im }
    }
  }

  if (!best) {
    throw new Error('self-port-share: no dispersive band off the flat bands')
  }

  return best
}

// the band's weight on self ports (p >= 24) and root ports, from its eigenvector
export function selfPortShare(
  Q: number,
  phi: number,
  k: readonly number[],
): { self: number; root: number; energy: number } {
  const band = lazyUpperBand(Q, phi, k)
  const m = lazySymbol(Q, phi, k)
  const v = complexEigenvector({
    re: m.re,
    im: m.im,
    n: Q,
    value: [band.re, band.im],
  })

  let self = 0
  let root = 0

  for (let p = 0; p < Q; p++) {
    const w = (v.re[p] ?? 0) ** 2 + (v.im[p] ?? 0) ** 2

    if (p >= 24) {
      self += w
    } else {
      root += w
    }
  }

  return { self: self / (self + root), root: root / (self + root), energy: band.energy }
}

// the band's group speed along a unit direction, by a central difference of its measured energy
export function lazyGroupSpeed(input: {
  Q: number
  phi: number
  direction: readonly number[]
  K: number
  step?: number
}): number {
  const h = input.step ?? 1e-5
  const at = (K: number): number =>
    lazyUpperBand(
      input.Q,
      input.phi,
      input.direction.map(x => x * K),
    ).energy

  return (at(input.K + h) - at(input.K - h)) / (2 * h)
}
