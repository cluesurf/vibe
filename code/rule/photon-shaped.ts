// The leapfrog U(1) sector with a SHAPED carried-remainder force: E-FRC-0181's error diffusion with its
// quantization noise put where it does no harm (E-FRC-0183 to E-FRC-0185).
//
// E-FRC-0181 paid f = floor((p B + r) / q) and carried r' = (p B + r) mod q on each plaquette. Its force
// is kappa B plus e_t = u_t - u_(t-1), u = r / q in [0, 1): the error is first-order shaped in time, and that
// is all. Here the fresh error u_t enters the kick through a noise transfer function (NTF) chosen before
// the run:
//
//   f_t = kappa B_t + u_t + h_1 u_(t-1) + ... + h_L u_(t-L) + s kappa (C C^T u_(t-1))
//
// with C the plaquette incidence (the curl), so C C^T u_(t-1) is each plaquette's error spread to the
// plaquettes that share a link with it: spatial error diffusion. The forms:
// - `first`  h = [-1]                        NTF 1 - z                    (E-FRC-0181, as a control)
// - `second` h = [-2, 1]                     NTF (1 - z)^2
// - `third`  h = [-3, 3, -1]                 NTF (1 - z)^3
// - `notch`  h = [-c, 1]                     NTF 1 - c z + z^2, a zero pair on the unit circle at 2 cos omega = c,
//                                            c the lambda-weighted mean of 2 cos omega over the band
//                                            (E-FRC-0183), the first tap rounded to 1 / q like the spatial term
// - `wave`   h = [-2, 1] and s = 1           NTF 1 - (2 - kappa M) z + z^2, the leapfrog's own wave operator
// (z the one-beat delay, M = C^T C the curl-curl). The `wave` form is the one this file exists for. With
// w_t = C^T u_t on the links, its kick noise is C^T e_t = w_t - 2 w_(t-1) + w_(t-2) + kappa M w_(t-1), which is
// the leapfrog A_(t+1) - 2 A_t + A_(t-1) = -kappa M A_t applied to w. So the shifted angle
//
//   A~_t = A_t + C^T u_(t-1)
//
// obeys the exactly linear leapfrog, with no noise term at all: the quantization error is a bounded change of
// variables, not a force. From a stored state (A, E, u_(t-1), u_(t-2)) the linear state it shadows is
// A~ = A + C^T u_(t-2) and E~ = E + C^T (u_(t-1) - u_(t-2)).
//
// Integers. u is carried as U = q u in [0, q). The spatial term kappa C C^T u = p S / q^2 with S = C C^T U an
// integer is rounded to V = round(p S / q) in units of 1 / q, a function of U_(t-1) alone; its residual, at
// most 1 / (2 q) per plaquette per beat, is the one noise the `wave` form leaves, white and 1 / q^2 in power.
// In units of 1 / q the kick is
//
//   x = p B + h_1 U_(t-1) + ... + h_L U_(t-L) + s V(U_(t-1)),   f = ceil(x / q),   U_t = q f - x in [0, q)
//
// Reversible. B is fixed during the kick and U_(t-1) .. U_(t-L+1) are kept, so everything but U_(t-L) is
// known backward, and U_(t-L) enters with h_L = +1 or -1: from y = x - h_L U_(t-L), q f - h_L U_(t-L) = y + U_t
// fixes f and U_(t-L) uniquely (f = ceil((y + U_t) / q) for h_L = 1, floor for h_L = -1). So one beat is a
// bijection of (angle, flux, the L carried integers).
//
// Gauss's law and the frame: the kick is the curl of plaquette integers, and x depends only on B and the
// carried integers, both frame invariant.
//
// History. U_t is fixed by U_(t-1) .. U_(t-L), B_t, and, for `wave`, the U_(t-1) of the 24 plaquettes that
// share a link with it: given the start values, the carried integers are a function of the angle history,
// each angle the running sum of the flux the stream copied across its link. No link gets storage of its own.

import { makePhotonRule, type PhotonLattice, type PhotonRule } from '@/code/rule/photon-links'

export type ShapedForm = 'first' | 'second' | 'third' | 'notch' | 'wave'

// the integer taps h_1 .. h_L. The notch's first tap is not an integer: it is carried as the rounded term
// round(lead U_(t-1) / q), lead = -round(c q), beside an integer tap of 0 (1 - c z + z^2, E-FRC-0183)
export const SHAPED_TAPS: Record<ShapedForm, readonly number[]> = {
  first: [-1],
  second: [-2, 1],
  third: [-3, 3, -1],
  notch: [0, 1],
  wave: [-2, 1],
}

export type ShapedRule = {
  readonly base: PhotonRule
  readonly lattice: PhotonLattice
  readonly n: number
  readonly form: ShapedForm
  readonly p: number
  readonly q: number
  // h_1 .. h_L
  readonly taps: readonly number[]
  // 1 when the spatial term kappa C C^T u_(t-1) is on
  readonly spread: number
  // the notch's rounded first tap, in units of 1 / q (0 for every other form)
  readonly lead: number
  // table[B] = p centered(B), the linear force in units of 1 / q
  readonly table: Int32Array
}

export type ShapedState = {
  readonly vibe: Int8Array
  readonly angle: Int32Array
  readonly flux: Int32Array
  // carried[j][p] = U_(t-1-j) of plaquette p, in 0 .. q - 1, j = 0 .. L - 1
  readonly carried: Int32Array[]
}

const modulo = (x: number, m: number): number => ((x % m) + m) % m

function centeredOf(b: number, n: number): number {
  const c = modulo(b, n)

  if (2 * c === n) {
    return 0
  }

  return 2 * c > n ? c - n : c
}

export function makeShapedRule(input: { lattice: PhotonLattice; n: number; k: number; q: number; form: ShapedForm; charge?: number; notch?: number }): ShapedRule {
  const { n, k, q, form } = input
  const base = makePhotonRule({ lattice: input.lattice, n, k, capacity: 0, hop: false, charge: input.charge ?? 1 })
  const p = Math.round(((2 * Math.PI * k) / n) * q)
  const table = Int32Array.from({ length: n }, (_, b) => p * centeredOf(b, n))
  const lead = form === 'notch' ? -Math.round((input.notch ?? 0) * q) : 0

  return { base, lattice: input.lattice, n, form, p, q, taps: SHAPED_TAPS[form], spread: form === 'wave' ? 1 : 0, lead, table }
}

export const shapedKappa = (rule: ShapedRule): number => rule.p / rule.q

// the empty state, every carried integer 0 ('zero') or a golden-ratio Weyl sequence over the plaquette index
// and the tap, floor(frac((i + 1 + j P) golden) q) ('weyl')
export function emptyShapedState(rule: ShapedRule, dither: 'zero' | 'weyl'): ShapedState {
  const golden = (Math.sqrt(5) - 1) / 2
  const count = rule.lattice.plaquetteCount
  const carried = rule.taps.map((_, j) =>
    dither === 'zero' ? new Int32Array(count) : Int32Array.from({ length: count }, (_, i) => Math.floor((((i + 1 + j * count) * golden) % 1) * rule.q)),
  )

  return { vibe: new Int8Array(rule.lattice.cells), angle: new Int32Array(rule.lattice.links), flux: new Int32Array(rule.lattice.links), carried }
}

export function copyShapedState(s: ShapedState): ShapedState {
  return { vibe: Int8Array.from(s.vibe), angle: Int32Array.from(s.angle), flux: Int32Array.from(s.flux), carried: s.carried.map(c => Int32Array.from(c)) }
}

// scratch buffers, one set per lattice size, so the beat allocates nothing
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

// the kick forward: f = ceil(x / q), and the fresh carried integer is q f - x, in [0, q)
export function payForward(x: number, q: number): number {
  return Math.ceil(x / q)
}

// the kick backward: from total = y + U_t (y the kick's sum without its last tap), q f - last U_(t-L) = total
// fixes f and the dropped U_(t-L) in [0, q). The same arithmetic as the kick's backward branch
export function payBack(total: number, q: number, last: 1 | -1): [number, number] {
  if (last > 0) {
    const f = Math.ceil(total / q)

    return [f, q * f - total]
  }

  const f = Math.floor(total / q)

  return [f, total - q * f]
}

// w = C^T U on the links
export function curlTranspose(lattice: PhotonLattice, u: ArrayLike<number>, out: Float64Array): void {
  const size = lattice.plaquetteSize
  const links = lattice.plaquetteLinks
  const signs = lattice.plaquetteSigns

  out.fill(0)

  for (let p = 0, o = 0; p < lattice.plaquetteCount; p++, o += size) {
    const v = u[p] as number

    if (v === 0) {
      continue
    }

    for (let j = 0; j < size; j++) {
      const l = links[o + j] as number

      out[l] = (out[l] as number) + (signs[o + j] as number) * v
    }
  }
}

function drift(rule: ShapedRule, s: ShapedState, sign: number): void {
  const { angle, flux } = s
  const n = rule.n

  for (let l = 0; l < angle.length; l++) {
    let a = (angle[l] as number) + sign * (flux[l] as number)

    a %= n
    angle[l] = a < 0 ? a + n : a
  }
}

// the kick forward (sign 1) or backward (sign -1), in place
function kick(rule: ShapedRule, s: ShapedState, sign: number): void {
  const { lattice, q, table, n, taps, spread, lead, p: numerator } = rule
  const size = lattice.plaquetteSize
  const links = lattice.plaquetteLinks
  const signs = lattice.plaquetteSigns
  const { angle, flux, carried } = s
  const depth = taps.length
  const last = taps[depth - 1] as number
  const scratch = scratchOf(lattice)
  const w = scratch.spreadLinks
  const out = scratch.next
  const paid = scratch.paid
  // forward, the spatial term reads U_(t-1) = carried[0]; backward, the state holds U_t in carried[0] and
  // U_(t-1) in carried[1] (every form with a spatial term has depth 2)
  const previous = sign > 0 ? carried[0]! : carried[1]!

  if (spread) {
    curlTranspose(lattice, previous, w)
  }

  for (let pl = 0, o = 0; pl < lattice.plaquetteCount; pl++, o += size) {
    let b = 0

    for (let j = 0; j < size; j++) {
      b += (signs[o + j] as number) * (angle[links[o + j] as number] as number)
    }

    b %= n

    let x = table[b < 0 ? b + n : b] as number

    if (spread) {
      let sum = 0

      for (let j = 0; j < size; j++) {
        sum += (signs[o + j] as number) * (w[links[o + j] as number] as number)
      }

      x += Math.round((numerator * sum) / q)
    }

    if (lead !== 0) {
      x += Math.round((lead * (previous[pl] as number)) / q)
    }

    if (sign > 0) {
      for (let j = 0; j < depth; j++) {
        x += (taps[j] as number) * ((carried[j] as Int32Array)[pl] as number)
      }

      const f = payForward(x, q)

      out[pl] = q * f - x
      paid[pl] = f
    } else {
      // the state holds U_t .. U_(t-L+1) in carried[0 .. L-1]; x without its last tap is y
      for (let j = 0; j < depth - 1; j++) {
        x += (taps[j] as number) * ((carried[j + 1] as Int32Array)[pl] as number)
      }

      const total = x + ((carried[0] as Int32Array)[pl] as number)

      const [f, dropped] = payBack(total, q, last > 0 ? 1 : -1)

      out[pl] = dropped
      paid[pl] = f
    }
  }

  // shift the carried integers
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

export function shapedBeatInPlace(rule: ShapedRule, s: ShapedState): void {
  drift(rule, s, 1)
  kick(rule, s, 1)
}

export function shapedBeatBackInPlace(rule: ShapedRule, s: ShapedState): void {
  kick(rule, s, -1)
  drift(rule, s, -1)
}

// the linear state the `wave` form shadows: A~ = centered(A) + C^T U_(t-2) / q, E~ = E + C^T (U_(t-1) - U_(t-2)) / q
export function waveShadow(rule: ShapedRule, s: ShapedState): { angle: Float64Array; flux: Float64Array } {
  const lattice = rule.lattice
  const older = new Float64Array(lattice.links)
  const newer = new Float64Array(lattice.links)

  curlTranspose(lattice, s.carried[1]!, older)
  curlTranspose(lattice, s.carried[0]!, newer)

  return {
    angle: Float64Array.from(s.angle, (a, l) => centeredOf(a, rule.n) + (older[l] as number) / rule.q),
    flux: Float64Array.from(s.flux, (e, l) => e + ((newer[l] as number) - (older[l] as number)) / rule.q),
  }
}
