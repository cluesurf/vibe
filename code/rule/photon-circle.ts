// The wave-shaped light with its seam read on the light itself: E-FRC-0185's rule (code/rule/photon-shaped, form
// `wave`) with ONE change, the branch of the compact force taken on the shadow's plaquette flux instead of on the raw
// integer one (E-FRC-0244, E-FRC-0245).
//
// WHY. Every stored angle lives on the circle Z_N (a column of 2D + 1 trit values is one, E-FRC-0207, and a wrap is
// the only saturation that keeps a bounded column a bijection, E-FRC-0208), so the force on a plaquette is a function
// of its flux mod N: the sawtooth kappa (B - N n), n the branch that brings B into (-N/2, N/2]. That is the Villain
// form of compact U(1), and a branch change is a Dirac string moving through the plaquette, not an error. E-FRC-0244
// proves the wave form's shadow obeys the Villain leapfrog EXACTLY,
//
//   A~_(t+1) = A~_t + E~_t,    E~_t - E~_(t-1) = -kappa C^T (C A~_t - N n_t) - C^T r_t,    |r_t| <= 1 / (2 q),
//
// with n_t the rule's branch. But E-FRC-0185 reads the branch on the raw flux B_t = C A~_t - C w_(t-1), w = C^T U / q,
// so its seam sits where the dither puts it, a few flux units off the light's own seam: the shadow's law is compact
// U(1) with a seam that jitters with the carried integers.
//
// THE CHANGE. The kick already computes S = C C^T U_(t-1) (an integer) for its spatial term, and the shadow's flux is
// B + S / q. Take the branch there: n is the integer with q (B - N n) + S in (-q N / 2, q N / 2], and pay
// x = p (B - N n) + round(p S / q) + the taps, exactly as before. Nothing is added: no register, no knob, the same
// sawtooth read at the field the physics runs on. The shadow then obeys the Villain leapfrog of its OWN flux,
//
//   E~_t - E~_(t-1) = -kappa C^T [C A~_t]_N - C^T r_t,
//
// [.]_N the centered representative, which is compact U(1) light and, while no plaquette's flux reaches N / 2, the
// exactly linear light of E-FRC-0185.
//
// Reversible for the same reason as the wave form: B is fixed during the kick, S is read from U_(t-1), which the
// state keeps in both directions, so x without its last tap is known backward and the last tap enters with +1.
// Gauss's law and the frame: the kick is a curl, and x depends on B mod N (the branch absorbs any multiple of N a
// frame change adds) and on the carried integers.
//
// Integer arithmetic only. Every quantity is an integer below 2^53.

import { curlTranspose, makeShapedRule, payBack, payForward, type ShapedRule, type ShapedState } from '@/code/rule/photon-shaped'
import { type PhotonLattice } from '@/code/rule/photon-links'

export type CircleRule = ShapedRule

// the rule: E-FRC-0185's wave form, same N, K, q, kappa
export function makeCircleRule(input: { lattice: PhotonLattice; n: number; k: number; q: number; charge?: number }): CircleRule {
  return makeShapedRule({ ...input, form: 'wave' })
}

type Scratch = { spreadLinks: Float64Array; next: Int32Array; paid: Int32Array }

const scratches = new Map<PhotonLattice, Scratch>()

function scratchOf(lattice: PhotonLattice): Scratch {
  let s = scratches.get(lattice)

  if (!s) {
    s = { spreadLinks: new Float64Array(lattice.links), next: new Int32Array(lattice.plaquetteCount), paid: new Int32Array(lattice.plaquetteCount) }
    scratches.set(lattice, s)
  }

  return s
}

function drift(rule: CircleRule, s: ShapedState, sign: number): void {
  const { angle, flux } = s
  const n = rule.n

  for (let l = 0; l < angle.length; l++) {
    let a = (angle[l] as number) + sign * (flux[l] as number)

    a %= n
    angle[l] = a < 0 ? a + n : a
  }
}

// the branch of the shadow's flux: the integer n with q (b - N n) + spread in (-q N / 2, q N / 2]
export function shadowBranch(b: number, spread: number, n: number, q: number): number {
  const span = q * n

  return Math.ceil((q * b + spread - span / 2) / span)
}

// the kick forward (sign 1) or backward (sign -1), in place
function kick(rule: CircleRule, s: ShapedState, sign: number): void {
  const { lattice, q, n, taps, p: numerator } = rule
  const size = lattice.plaquetteSize
  const links = lattice.plaquetteLinks
  const signs = lattice.plaquetteSigns
  const { angle, flux, carried } = s
  const depth = taps.length
  const scratch = scratchOf(lattice)
  const w = scratch.spreadLinks
  const out = scratch.next
  const paid = scratch.paid
  // forward the state holds U_(t-1) in carried[0]; backward it holds U_t in carried[0] and U_(t-1) in carried[1]
  const previous = sign > 0 ? carried[0]! : carried[1]!

  curlTranspose(lattice, previous, w)

  for (let pl = 0, o = 0; pl < lattice.plaquetteCount; pl++, o += size) {
    let b = 0
    let spread = 0

    for (let j = 0; j < size; j++) {
      const l = links[o + j] as number
      const g = signs[o + j] as number

      b += g * (angle[l] as number)
      spread += g * (w[l] as number)
    }

    const branch = shadowBranch(b, spread, n, q)
    let x = numerator * (b - n * branch) + Math.round((numerator * spread) / q)

    if (sign > 0) {
      for (let j = 0; j < depth; j++) {
        x += (taps[j] as number) * ((carried[j] as Int32Array)[pl] as number)
      }

      const f = payForward(x, q)

      out[pl] = q * f - x
      paid[pl] = f
    } else {
      for (let j = 0; j < depth - 1; j++) {
        x += (taps[j] as number) * ((carried[j + 1] as Int32Array)[pl] as number)
      }

      const [f, dropped] = payBack(x + ((carried[0] as Int32Array)[pl] as number), q, 1)

      out[pl] = dropped
      paid[pl] = f
    }
  }

  if (sign > 0) {
    for (let j = depth - 1; j > 0; j--) {
      ;(carried[j] as Int32Array).set(carried[j - 1] as Int32Array)
    }

    ;(carried[0] as Int32Array).set(out)
  } else {
    for (let j = 0; j < depth - 1; j++) {
      ;(carried[j] as Int32Array).set(carried[j + 1] as Int32Array)
    }

    ;(carried[depth - 1] as Int32Array).set(out)
  }

  for (let pl = 0, o = 0; pl < lattice.plaquetteCount; pl++, o += size) {
    const f = paid[pl] as number

    if (f === 0) {
      continue
    }

    const g = sign * f

    for (let j = 0; j < size; j++) {
      const l = links[o + j] as number

      flux[l] = (flux[l] as number) - (signs[o + j] as number) * g
    }
  }
}

export function circleBeatInPlace(rule: CircleRule, s: ShapedState): void {
  drift(rule, s, 1)
  kick(rule, s, 1)
}

export function circleBeatBackInPlace(rule: CircleRule, s: ShapedState): void {
  kick(rule, s, -1)
  drift(rule, s, -1)
}
