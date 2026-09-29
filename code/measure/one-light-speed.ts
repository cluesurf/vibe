// Measurement for E-MTR-0023 to 0025: the husk photon's speed, the lazy root token's symbol and bands (code/rule/
// lazy-root-token), and the locked token's band, all read husk first. Floats are measurement only.

import { photonLatticeD4 } from '@/code/rule/photon-links'
import { makeHusk, type Husk } from '@/code/measure/photon-husk'
import {
  curlSymbol,
  eigenvalues,
  huskSymbol,
  plaquetteShapes,
  huskLaplacianSymbol,
  type PlaquetteShape,
} from '@/code/measure/photon-symbol'
import { complexEigenvalues } from '@/code/algebra/linear/complex-eigen'
import { ROOTS, OPPOSITE } from '@/code/rule/lazy-root-token'

type PhotonLattice = ReturnType<typeof photonLatticeD4>

let photonCache:
  | { bulk: PhotonLattice; husk: Husk; shapes: PlaquetteShape[] }
  | undefined

function photon(): {
  bulk: PhotonLattice
  husk: Husk
  shapes: PlaquetteShape[]
} {
  if (!photonCache) {
    const bulk = photonLatticeD4({ side: 4 })

    photonCache = {
      bulk,
      husk: makeHusk(bulk),
      shapes: plaquetteShapes(bulk),
    }
  }

  return photonCache
}

// the husk photon's transverse eigenvalue lambda(k) (the lowest nonzero of the husk symbol; the gauge mode is 0)
export function huskPhotonLambda(k: readonly number[]): number {
  const p = photon()
  const v = eigenvalues(
    huskSymbol(
      p.husk,
      curlSymbol(p.bulk, p.shapes, [
        k[0] ?? 0,
        k[1] ?? 0,
        k[2] ?? 0,
        0,
      ]),
    ).hermitian,
  )

  return v[1] ?? Number.NaN
}

export const kappaOf = (depth: number): number => 2 / (2 * depth + 1)

// the photon's frequency per beat from 2 - 2 cos omega = kappa lambda
export const photonOmega = (kappa: number, lambda: number): number =>
  Math.acos(1 - (kappa * lambda) / 2)

// the closed form the photon's long-wave speed takes on the husk, c^2 = 2 kappa / 3 = 4 / (3 (2D + 1))
export const huskLightSpeed = (depth: number): number =>
  Math.sqrt((2 * kappaOf(depth)) / 3)

export { huskLaplacianSymbol }

// ---------------------------------------------------------------------------------------------------------
// the lazy root token's symbol

// sum over the 24 roots of (1 - cos k . r), k with 3 (husk) or 4 (bulk) components
export function rootLaplacian(k: readonly number[]): number {
  let s = 0

  for (const r of ROOTS) {
    let t = 0

    for (let i = 0; i < 4; i++) {
      t += (r[i] ?? 0) * (k[i] ?? 0)
    }

    s += 1 - Math.cos(t)
  }

  return s
}

// the one-beat symbol W(k) = S(k) R, Q x Q, row-major
export function lazySymbol(
  Q: number,
  phi: number,
  k: readonly number[],
): { re: Float64Array; im: Float64Array } {
  const re = new Float64Array(Q * Q)
  const im = new Float64Array(Q * Q)
  const cr = (1 + Math.cos(phi)) / Q
  const ci = Math.sin(phi) / Q

  for (let col = 0; col < Q; col++) {
    for (let row = 0; row < Q; row++) {
      const rr = cr - (row === col ? 1 : 0)
      const ri = ci

      let target = row
      let pr = 1
      let pi = 0

      if (row < 24) {
        const r = ROOTS[row]!

        let t = 0

        for (let i = 0; i < 4; i++) {
          t += (r[i] ?? 0) * (k[i] ?? 0)
        }

        target = OPPOSITE[row]!
        pr = Math.cos(-t)
        pi = Math.sin(-t)
      }

      re[target * Q + col] = re[target * Q + col]! + rr * pr - ri * pi
      im[target * Q + col] = im[target * Q + col]! + rr * pi + ri * pr
    }
  }

  return { re, im }
}

export function lazyPhases(
  Q: number,
  phi: number,
  k: readonly number[],
): number[] {
  const m = lazySymbol(Q, phi, k)
  const e = complexEigenvalues({ re: m.re, im: m.im, n: Q })

  return e.re.map((r, i) => Math.atan2(e.im[i] ?? 0, r))
}

// the dispersive band from the symbol's own spectrum. phi = 0: the two eigenphases farthest from the flat +-1 bands
// are +-E. phi != 0: the eigenphase nearest phi (isolated from the flat bands) is phi / 2 + E.
export function lazyEnergyFromSpectrum(
  Q: number,
  phi: number,
  k: readonly number[],
): number {
  const ph = lazyPhases(Q, phi, k)

  if (phi === 0) {
    const sorted = ph
      .slice()
      .sort((a, b) => Math.abs(Math.sin(b)) - Math.abs(Math.sin(a)))

    return Math.abs(
      Math.atan2(
        Math.sin((sorted[0]! - sorted[1]!) / 2),
        Math.cos((sorted[0]! - sorted[1]!) / 2),
      ),
    )
  }

  let best = ph[0]!
  let gap = Infinity

  for (const p of ph) {
    const g = Math.abs(Math.atan2(Math.sin(p - phi), Math.cos(p - phi)))

    if (g < gap) {
      gap = g
      best = p
    }
  }

  return best - phi / 2
}

// the closed form (Szegedy): cos E = cos(phi / 2) (1 - L(k) / Q)
export const lazyEnergy = (
  Q: number,
  phi: number,
  k: readonly number[],
): number => Math.acos(Math.cos(phi / 2) * (1 - rootLaplacian(k) / Q))

// ---------------------------------------------------------------------------------------------------------
// the locked token (code/rule/locked-token-line): U(k) = diag(e^(-ik), e^(ik)) C on its doublet, C = (1 / 2)
// [[1 + w, 1 - w], [1 - w, 1 + w]], so cos E_D = (1 / 2) cos k about the phase pi / 3, E_D(0) = pi / 3; with the
// coin off (C = 1) it is the bare copy, E = k
export function lockedTokenEnergy(k: number, coin: boolean): number {
  if (!coin) {
    return Math.abs(k)
  }

  return Math.acos(0.5 * Math.cos(k))
}

// least squares of E(K) = a + b K^2 + c K^4: returns [a, b, c]
export function evenFit(
  K: readonly number[],
  E: readonly number[],
): [number, number, number] {
  const rows = K.map(k => [1, k * k, k ** 4])
  const ata = [0, 0, 0, 0, 0, 0, 0, 0, 0]
  const atb = [0, 0, 0]

  rows.forEach((r, i) => {
    for (let a = 0; a < 3; a++) {
      atb[a] = atb[a]! + r[a]! * E[i]!

      for (let b = 0; b < 3; b++) {
        ata[3 * a + b] = ata[3 * a + b]! + r[a]! * r[b]!
      }
    }
  })

  // Gaussian elimination
  const m = [0, 1, 2].map(a => [
    ata[3 * a]!,
    ata[3 * a + 1]!,
    ata[3 * a + 2]!,
    atb[a]!,
  ])

  for (let c = 0; c < 3; c++) {
    let p = c

    for (let r = c + 1; r < 3; r++) {
      if (Math.abs(m[r]![c]!) > Math.abs(m[p]![c]!)) {
        p = r
      }
    }

    const t = m[c]!

    m[c] = m[p]!
    m[p] = t

    for (let r = 0; r < 3; r++) {
      if (r === c) {
        continue
      }

      const f = m[r]![c]! / m[c]![c]!

      for (let x = c; x < 4; x++) {
        m[r]![x] = m[r]![x]! - f * m[c]![x]!
      }
    }
  }

  return [
    m[0]![3]! / m[0]![0]!,
    m[1]![3]! / m[1]![1]!,
    m[2]![3]! / m[2]![2]!,
  ]
}
