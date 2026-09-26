// Light by threshold counting (E-FRC-0203 to E-FRC-0205): the U(1) link sector with no sine, no rounding and
// no real number anywhere in the rule. Every quantity is an integer or a cycling number (an integer mod a
// power of two), and every fractional coupling is paid by a counter that carries, never by a rounding.
//
// The state. Each link holds an angle A, a cycling number mod N = 2^nBits (compact U(1): the phase is A in
// units of 2 pi / N), and its flux E, an integer. A plaquette's magnetic field B is the oriented sum of its
// angles, read as the centered residue in -N/2 .. N/2 - 1 (a sign extension of the low nBits bits). The
// beat is the leapfrog of code/rule/photon-links: drift A <- A + E mod N, then kick E <- E - C^T f, f an
// integer on each plaquette and C^T f its curl, so Gauss's law is untouched.
//
// The force. The coupling is kappa = 1/Q, Q = 2^qBits. The force is LINEAR in B, with no table: each
// plaquette keeps a counter mod Q, the counter takes B each beat, and the number of times it wraps is the
// kick. With r in 0 .. Q - 1,
//
//   f = (r + B) >> qBits,   r' = (r + B) & (Q - 1)
//
// so f = B/Q + (r - r')/Q exactly: the kick pays one unit per threshold Q crossed and the counter keeps the
// rest. Summed over beats, the paid kicks are sum(B)/Q + (r_0 - r_t)/Q, the exact integral of B/Q to within
// one unit, forever. Nothing is dropped. This is the `first` form: its carried error is first-order shaped,
// (1 - z) u with u = r/Q, the error of E-FRC-0181.
//
// The `wave` form (E-FRC-0185 with its one rounded term carried instead). The fresh error is carried on a
// finer counter D mod 2^S, S = digits * qBits, whose top digit is the plain counter above and whose lower
// digits carry the shaping. Written with d = D / 2^S, the kick is
//
//   f_t = B_t/Q + d_t - 2 d_(t-1) + d_(t-2) + (1/Q) C C^T d_(t-1) + (rho_(t-1) - rho_t) / 2^S
//
// where the spatial term (1/Q) C C^T d_(t-1), each plaquette's previous error spread to the plaquettes that
// share a link with it, is paid by a SECOND counter R mod Q (rho = R/Q): it takes the integer S_p =
// (C C^T D_(t-1))_p and emits V = (R + S_p) >> qBits, keeping R' = (R + S_p) & (Q - 1). In integers:
//
//   X = (B << (S - qBits)) - 2 D_(t-1) + D_(t-2) + V,   f = ceil(X / 2^S),   D_t = (f << S) - X in 0 .. 2^S - 1
//
// The noise is the leapfrog's own wave operator applied to w = C^T d, so the shifted field
// A~ = A + C^T d_(t-1), E~ = E + C^T (d_(t-1) - d_(t-2)) obeys the linear leapfrog with coupling exactly 1/Q,
// forced only by the second counter's carry C^T (rho_t - rho_(t-1)) / 2^S: bounded by 2^-S per plaquette-beat,
// first-order shaped, and carried rather than dropped. It cannot be zero: no rule with a bounded integer
// state has an exactly linear shadow at a stable kappa = 1/Q (E-FRC-0204).
//
// Reversible by construction. B is fixed during the kick. Each counter is a translation mod its modulus
// given what it reads, so it runs backward by subtracting: r = (r' - B) & (Q - 1), R = (R' - S_p) & (Q - 1),
// and D_(t-2), the one value in 0 .. 2^S - 1 the forward kick could have started from, is recovered with f
// as ceil((y + D_t) / 2^S) where y is X without its D_(t-2). The drift is a shear. So a beat is a bijection
// of (angles, fluxes, counters).
//
// Fredkin's second-order form. The same beat written on two angle layers, the current A_t and the previous
// A_(t-1), both mod N, with no flux array:
//
//   A_(t+1) = 2 A_t - A_(t-1) - C^T f(B(A_t), counters) mod N
//
// It is invertible for any force (A_(t-1) = 2 A_t - A_(t+1) - C^T f), and it IS the leapfrog: the flux is
// E_t = A_(t+1) - A_t mod N, so the leapfrog state (A_t, E_t) and the Fredkin state (A_(t+1), A_t) run the
// same orbit (fredkinBeatInPlace and countBeatInPlace, compared bit for bit in E-FRC-0203). Its flux lives
// mod N and Gauss's law holds mod N.
//
// The frame: B is invariant under A -> A + chi_y - chi_x mod N, and the counters read only B and their own
// past, so the rule commutes with a frame change in every dock. History: the counters are a function of the
// start and of the angle history, each angle the running sum of the flux the stream copied across its link,
// so no link gets storage of its own; the counters sit on plaquettes, relations of three links.
//
// The line between rule and measurement: this file holds only integers and bit operations. The lattice it
// runs on is handed in (code/rule/photon-links builds it, measurement code starts it), and every reading in
// real numbers, the shadow field included, is computed in code/measure/photon-count-battery. The continuity
// audit E-MTH-0025 scans this file and its value imports.

import type { PhotonLattice } from '@/code/rule/photon-links'

export type CountForm = 'first' | 'wave'

export type CountRule = {
  readonly lattice: PhotonLattice
  readonly form: CountForm
  // angles mod N = 2^nBits, 2 <= nBits <= 20
  readonly nBits: number
  readonly n: number
  // the coupling 1/Q, Q = 2^qBits
  readonly qBits: number
  readonly q: number
  // the wave form's fresh-error counter holds `digits` base-Q digits: S = digits * qBits bits
  readonly digits: number
  readonly sBits: number
  // the flux one vibe carries (Gauss's law reads divergence = charge * vibe)
  readonly charge: number
  // scratch, one set per rule, so a beat allocates nothing
  readonly spread: Int32Array
  readonly paid: Int32Array
  readonly fresh: Int32Array
  readonly kick: Int32Array
  readonly next: Int32Array
}

export type CountState = {
  readonly vibe: Int8Array
  // angle[l] in 0 .. N - 1
  readonly angle: Int32Array
  readonly flux: Int32Array
  // `first`: counter[p] = r in 0 .. Q - 1. `wave`: counter[p] = R, the spatial term's counter, in 0 .. Q - 1
  readonly counter: Int32Array
  // `wave` only: carried[0][p] = D_(t-1) and carried[1][p] = D_(t-2), each in 0 .. 2^S - 1
  readonly carried: readonly Int32Array[]
}

// Fredkin's form: the current and previous angles, both mod N, and the same counters
export type FredkinState = {
  readonly vibe: Int8Array
  readonly current: Int32Array
  readonly previous: Int32Array
  readonly counter: Int32Array
  readonly carried: readonly Int32Array[]
}

export function makeCountRule(input: { lattice: PhotonLattice; form: CountForm; nBits: number; qBits: number; digits?: number; charge?: number }): CountRule {
  const { lattice, form, nBits, qBits } = input
  const digits = form === 'wave' ? (input.digits ?? 4) : 1
  const sBits = digits * qBits

  if (nBits < 2 || nBits > 20 || qBits < 1 || sBits > 20) {
    throw new Error(`photon-count: nBits ${nBits}, qBits ${qBits}, digits ${digits} out of range`)
  }

  return {
    lattice,
    form,
    nBits,
    n: 1 << nBits,
    qBits,
    q: 1 << qBits,
    digits,
    sBits,
    charge: input.charge ?? 1,
    spread: new Int32Array(lattice.links),
    paid: new Int32Array(lattice.plaquetteCount),
    fresh: new Int32Array(lattice.plaquetteCount),
    kick: new Int32Array(lattice.links),
    next: new Int32Array(lattice.links),
  }
}

// the empty state: no vibes, every angle, flux and counter 0
export function emptyCountState(rule: CountRule): CountState {
  const count = rule.lattice.plaquetteCount

  return {
    vibe: new Int8Array(rule.lattice.cells),
    angle: new Int32Array(rule.lattice.links),
    flux: new Int32Array(rule.lattice.links),
    counter: new Int32Array(count),
    carried: rule.form === 'wave' ? [new Int32Array(count), new Int32Array(count)] : [],
  }
}

export function copyCountState(s: CountState): CountState {
  return { vibe: Int8Array.from(s.vibe), angle: Int32Array.from(s.angle), flux: Int32Array.from(s.flux), counter: Int32Array.from(s.counter), carried: s.carried.map(c => Int32Array.from(c)) }
}

// the Fredkin state of a leapfrog state: previous = A_t, current = A_t + E_t mod N
export function fredkinOf(rule: CountRule, s: CountState): FredkinState {
  const mask = rule.n - 1

  return {
    vibe: Int8Array.from(s.vibe),
    current: Int32Array.from(s.angle, (a, l) => (a + (s.flux[l] as number)) & mask),
    previous: Int32Array.from(s.angle),
    counter: Int32Array.from(s.counter),
    carried: s.carried.map(c => Int32Array.from(c)),
  }
}

// the centered residue of an integer mod N = 2^nBits, in -N/2 .. N/2 - 1 (a sign extension)
export function centeredCount(rule: CountRule, b: number): number {
  const shift = 32 - rule.nBits

  return (b << shift) >> shift
}

// w = C^T u on the links, u on the plaquettes
function curlTransposeInto(lattice: PhotonLattice, u: Int32Array, out: Int32Array): void {
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

// The counters' step on every plaquette, from the angles `angle` (which it does not change): forward
// (sign 1) the kick f is paid and the counters advance, backward (sign -1) the counters are restored and
// the f the forward step paid is recovered. f is written to rule.paid.
export function payCounters(rule: CountRule, angle: Int32Array, counter: Int32Array, carried: readonly Int32Array[], sign: number): void {
  const { lattice, qBits, sBits, paid } = rule
  const size = lattice.plaquetteSize
  const links = lattice.plaquetteLinks
  const signs = lattice.plaquetteSigns
  const qMask = rule.q - 1
  const shift = 32 - rule.nBits

  if (rule.form === 'first') {
    for (let p = 0, o = 0; p < lattice.plaquetteCount; p++, o += size) {
      let b = 0

      for (let j = 0; j < size; j++) {
        b += (signs[o + j] as number) * (angle[links[o + j] as number] as number)
      }

      b = (b << shift) >> shift

      if (sign > 0) {
        const x = (counter[p] as number) + b

        paid[p] = x >> qBits
        counter[p] = x & qMask
      } else {
        const r = ((counter[p] as number) - b) & qMask

        paid[p] = (r + b) >> qBits
        counter[p] = r
      }
    }

    return
  }

  // the wave form. Forward the state holds D_(t-1), D_(t-2) in carried[0], carried[1]; backward it holds
  // D_t, D_(t-1). The spatial term reads D_(t-1) either way
  const newer = carried[0] as Int32Array
  const older = carried[1] as Int32Array
  const previous = sign > 0 ? newer : older
  const w = rule.spread
  const out = rule.fresh
  const lift = sBits - qBits

  curlTransposeInto(lattice, previous, w)

  for (let p = 0, o = 0; p < lattice.plaquetteCount; p++, o += size) {
    let b = 0
    let spreadSum = 0

    for (let j = 0; j < size; j++) {
      const l = links[o + j] as number
      const s = signs[o + j] as number

      b += s * (angle[l] as number)
      spreadSum += s * (w[l] as number)
    }

    b = (b << shift) >> shift

    if (sign > 0) {
      const y = spreadSum + (counter[p] as number)
      const v = y >> qBits
      const x = (b << lift) - 2 * (newer[p] as number) + (older[p] as number) + v
      const f = -(-x >> sBits)

      counter[p] = y & qMask
      out[p] = (f << sBits) - x
      paid[p] = f
    } else {
      const r = ((counter[p] as number) - spreadSum) & qMask
      const v = (spreadSum + r) >> qBits
      const total = (b << lift) - 2 * (older[p] as number) + v + (newer[p] as number)
      const f = -(-total >> sBits)

      counter[p] = r
      out[p] = (f << sBits) - total
      paid[p] = f
    }
  }

  if (sign > 0) {
    older.set(newer)
    newer.set(out)
  } else {
    newer.set(older)
    older.set(out)
  }
}

function drift(rule: CountRule, s: CountState, sign: number): void {
  const { angle, flux } = s
  const mask = rule.n - 1

  for (let l = 0; l < angle.length; l++) {
    angle[l] = ((angle[l] as number) + sign * (flux[l] as number)) & mask
  }
}

// E <- E - sign C^T paid
function applyKick(rule: CountRule, flux: Int32Array, sign: number): void {
  const { lattice, paid } = rule
  const size = lattice.plaquetteSize
  const links = lattice.plaquetteLinks
  const signs = lattice.plaquetteSigns

  for (let p = 0, o = 0; p < lattice.plaquetteCount; p++, o += size) {
    const f = paid[p] as number

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

// one beat, in place: drift, then the counted kick
export function countBeatInPlace(rule: CountRule, s: CountState): void {
  drift(rule, s, 1)
  payCounters(rule, s.angle, s.counter, s.carried, 1)
  applyKick(rule, s.flux, 1)
}

// the inverse of one beat, in place: the kick backward, then the drift backward
export function countBeatBackInPlace(rule: CountRule, s: CountState): void {
  payCounters(rule, s.angle, s.counter, s.carried, -1)
  applyKick(rule, s.flux, -1)
  drift(rule, s, -1)
}

// Fredkin's beat, in place: A_(t+1) = 2 A_t - A_(t-1) - C^T f(A_t) mod N
export function fredkinBeatInPlace(rule: CountRule, s: FredkinState): void {
  const mask = rule.n - 1
  const kick = rule.kick

  payCounters(rule, s.current, s.counter, s.carried, 1)
  kick.fill(0)
  applyKick(rule, kick, 1)

  for (let l = 0; l < kick.length; l++) {
    const a = s.current[l] as number

    rule.next[l] = (2 * a - (s.previous[l] as number) + (kick[l] as number)) & mask
    s.previous[l] = a
  }

  s.current.set(rule.next)
}

// Fredkin's beat backward, in place: the same formula with the two layers exchanged,
// A_(t-1) = 2 A_t - A_(t+1) - C^T f(A_t), the counters restored from A_t = previous
export function fredkinBeatBackInPlace(rule: CountRule, s: FredkinState): void {
  const mask = rule.n - 1
  const kick = rule.kick

  payCounters(rule, s.previous, s.counter, s.carried, -1)
  kick.fill(0)
  applyKick(rule, kick, 1)

  for (let l = 0; l < kick.length; l++) {
    const a = s.previous[l] as number

    rule.next[l] = (2 * a - (s.current[l] as number) + (kick[l] as number)) & mask
    s.current[l] = a
  }

  s.previous.set(rule.next)
}

// Gauss's law: the number of docks whose outgoing flux differs from charge * vibe (exactly, for the leapfrog
// state; mod N for a Fredkin state, whose flux current - previous lives mod N)
export function countGaussViolations(rule: CountRule, vibe: Int8Array, flux: ArrayLike<number>, modular: boolean): number {
  const { lattice } = rule
  const f = lattice.firsts.length
  const divergence = new Int32Array(lattice.cells)
  const mask = rule.n - 1

  for (let x = 0; x < lattice.cells; x++) {
    for (let k = 0; k < f; k++) {
      const y = lattice.neighbour[x * lattice.degree + (lattice.firsts[k] as number)] as number
      const e = flux[x * f + k] as number

      divergence[x] = (divergence[x] as number) + e
      divergence[y] = (divergence[y] as number) - e
    }
  }

  let violations = 0

  for (let x = 0; x < lattice.cells; x++) {
    const want = rule.charge * (vibe[x] as number)
    const have = divergence[x] as number

    violations += (modular ? ((have - want) & mask) === 0 : have === want) ? 0 : 1
  }

  return violations
}
