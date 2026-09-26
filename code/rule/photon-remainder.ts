// The leapfrog U(1) sector of code/rule/photon-links with a carried-remainder force: an error-diffusion
// (sigma-delta, Bresenham) kick in place of the rounded table (E-FRC-0181).
//
// Why. E-FRC-0179 and E-FRC-0180 showed that the leapfrog is exactly a massless photon where its force is
// linear, and that every light failure left comes from the integer table round(K sin(2 pi B / N)): a dead
// zone at |B| <= 8, a staircase that runs a coherent husk wave 0.1 to 11 percent fast, and heating. No integer
// slope is stable (kappa lambda_max = 16 against the limit 4), so an exactly linear integer table is ruled out.
//
// The rule. The coupling is a fraction p / q. Each plaquette keeps an integer remainder r in [0, q). The kick
// reads B from the angles (which the kick does not change) and pays
//
//   x = T[B] + r,  f = floor(x / q),  r' = x - q f  (so r' = x mod q, in [0, q))
//
// and E <- E - C^T f as before, C^T f the curl of the plaquette integers. T is an odd integer table, the force
// in units of 1 / q:
// - `linear`: T[B] = p centered(B), so the force averages exactly p B / q: no dead zone (a remainder below q
//   waits and pays out later) and no staircase (the rounding error is carried, never dropped)
// - `sine`: T[B] = round(q K sin(2 pi B / N)), the E-FRC-0164 force resolved to 1 / q and carried
// Summed over beats, the kicks a plaquette has paid are exactly (sum of T[B_t] + r_0 - r_t) / q: the
// cumulative force is the exact integral of T / q to within one unit, forever.
//
// Reversible in integers. B is fixed during the kick, so given B and r' the paid f is the one integer with
// r = r' + q f - T[B] in [0, q), f = ceil((T[B] - r') / q): the kick runs backward exactly. The drift is the
// same shear as before. So one beat is a bijection of (angle, flux, remainder).
//
// Gauss's law and the frame. The kick is a curl of plaquette integers, so the divergence of E never changes.
// B is frame invariant and the remainder is a function of B's history, so the rule commutes with a Z_N frame
// change in every dock. This is why the remainder sits on the PLAQUETTE: `on: 'link'` puts it on each link
// instead (x = the link's summed T + its own r), which is not a curl and breaks Gauss's law. It is kept as the
// control that shows where the remainder has to live.
//
// What the remainder is. r_t = (r_0 + sum over past beats of T[B]) mod q, and B is the oriented sum of three
// angles, each the running sum of the flux the stream copied across its link (E-FRC-0175). So the remainder
// is history, fixed by its initial value and the angle history, like the angle itself. But it is the history
// of a triangle of three links, not of one link: a relation of three vibe-vibe relations.
//
// No vibes hop in this form: it is the light sector alone (the photon-links `hop: false`), with the charges
// entering only through Gauss's law in the start.

import { makePhotonRule, plaquetteField, type PhotonLattice, type PhotonRule } from '@/code/rule/photon-links'

const GOLDEN = (Math.sqrt(5) - 1) / 2

const modulo = (x: number, m: number): number => ((x % m) + m) % m

// the centered representative of b mod n, in -n/2 < c < n/2, with n/2 sent to 0 so every table is odd
function centeredOf(b: number, n: number): number {
  const c = modulo(b, n)

  if (2 * c === n) {
    return 0
  }

  return 2 * c > n ? c - n : c
}

export type RemainderForm = 'linear' | 'sine'

export type RemainderRule = {
  // the lattice, N and K of the photon-links rule it replaces (its own force table is not used)
  readonly base: PhotonRule
  readonly lattice: PhotonLattice
  readonly n: number
  readonly form: RemainderForm
  // the coupling numerator (linear form) and the denominator: kappa = p / q
  readonly p: number
  readonly q: number
  // table[B], odd, the force in units of 1 / q
  readonly table: Int32Array
  // where the remainder lives: one per plaquette (the rule) or one per link (the Gauss-breaking control)
  readonly on: 'plaquette' | 'link'
}

export type RemainderState = {
  readonly vibe: Int8Array
  // angle[l] in 0 .. N - 1
  readonly angle: Int32Array
  readonly flux: Int32Array
  // remainder[p] in 0 .. q - 1, one per plaquette (or per link, for `on: 'link'`)
  readonly remainder: Int32Array
}

export function makeRemainderRule(input: {
  lattice: PhotonLattice
  n: number
  k: number
  q: number
  form: RemainderForm
  on?: 'plaquette' | 'link'
  charge?: number
}): RemainderRule {
  const { n, k, q } = input
  const base = makePhotonRule({ lattice: input.lattice, n, k, capacity: 0, hop: false, charge: input.charge ?? 1 })
  const p = Math.round(((2 * Math.PI * k) / n) * q)
  const table = Int32Array.from({ length: n }, (_, b) => {
    if (input.form === 'linear') {
      return p * centeredOf(b, n)
    }

    const s = q * k * Math.sin((2 * Math.PI * b) / n)

    return Math.sign(s) * Math.round(Math.abs(s))
  })

  return { base, lattice: input.lattice, n, form: input.form, p, q, table, on: input.on ?? 'plaquette' }
}

// the coupling the rule's force averages to about B = 0: p / q for the linear form, the sine's slope for the
// sine form
export function remainderKappa(rule: RemainderRule): number {
  return rule.form === 'linear' ? rule.p / rule.q : (2 * Math.PI * rule.base.k) / rule.n
}

// the number of remainders the rule keeps
export function remainderCount(rule: RemainderRule): number {
  return rule.on === 'plaquette' ? rule.lattice.plaquetteCount : rule.lattice.links
}

// the empty state: no vibes, every angle 0, no flux, and the remainders either all 0 or a golden-ratio Weyl
// sequence over their index, floor(frac((i + 1) golden) q): a deterministic, evenly spread dither
export function emptyRemainderState(rule: RemainderRule, dither: 'weyl' | 'zero'): RemainderState {
  const count = remainderCount(rule)
  const remainder = new Int32Array(count)

  if (dither === 'weyl') {
    for (let i = 0; i < count; i++) {
      remainder[i] = Math.floor((((i + 1) * GOLDEN) % 1) * rule.q)
    }
  }

  return {
    vibe: new Int8Array(rule.lattice.cells),
    angle: new Int32Array(rule.lattice.links),
    flux: new Int32Array(rule.lattice.links),
    remainder,
  }
}

export function copyRemainderState(s: RemainderState): RemainderState {
  return { vibe: Int8Array.from(s.vibe), angle: Int32Array.from(s.angle), flux: Int32Array.from(s.flux), remainder: Int32Array.from(s.remainder) }
}

// one kick forward: the f paid from T[B] = t and the remainder r. The new remainder is t + r - q f
export function paid(t: number, r: number, q: number): number {
  return Math.floor((t + r) / q)
}

// one kick backward: the f that was paid, from t and the new remainder r'. The old remainder is r' + q f - t,
// the one value in [0, q) that the forward kick could have started from
export function repaid(t: number, next: number, q: number): number {
  return Math.ceil((t - next) / q)
}

function drift(rule: RemainderRule, s: RemainderState, sign: number): void {
  for (let l = 0; l < s.angle.length; l++) {
    s.angle[l] = modulo((s.angle[l] ?? 0) + sign * (s.flux[l] ?? 0), rule.n)
  }
}

// the kick, forward (sign 1) or backward (sign -1), in place
function kick(rule: RemainderRule, s: RemainderState, sign: number): void {
  const { lattice, q, table } = rule
  const size = lattice.plaquetteSize
  // the paid f, and the remainder after (forward) or before (backward) the kick
  const settle = (t: number, r: number): [number, number] => {
    if (sign > 0) {
      const f = paid(t, r, q)

      return [f, t + r - q * f]
    }

    const f = repaid(t, r, q)

    return [f, r + q * f - t]
  }

  if (rule.on === 'plaquette') {
    for (let p = 0; p < lattice.plaquetteCount; p++) {
      const [f, r] = settle(table[plaquetteField(rule.base, s.angle, p)] ?? 0, s.remainder[p] ?? 0)

      s.remainder[p] = r

      if (f === 0) {
        continue
      }

      for (let j = 0; j < size; j++) {
        const l = lattice.plaquetteLinks[p * size + j] ?? 0

        s.flux[l] = (s.flux[l] ?? 0) - sign * (lattice.plaquetteSigns[p * size + j] ?? 0) * f
      }
    }

    return
  }

  // the control: each link sums its plaquettes' T and carries its own remainder
  const summed = new Float64Array(lattice.links)

  for (let p = 0; p < lattice.plaquetteCount; p++) {
    const t = table[plaquetteField(rule.base, s.angle, p)] ?? 0

    for (let j = 0; j < size; j++) {
      const l = lattice.plaquetteLinks[p * size + j] ?? 0

      summed[l] = (summed[l] ?? 0) + (lattice.plaquetteSigns[p * size + j] ?? 0) * t
    }
  }

  for (let l = 0; l < lattice.links; l++) {
    const [f, r] = settle(summed[l] ?? 0, s.remainder[l] ?? 0)

    s.remainder[l] = r
    s.flux[l] = (s.flux[l] ?? 0) - sign * f
  }
}

// one beat, in place: drift, then the carried kick
export function remainderBeatInPlace(rule: RemainderRule, s: RemainderState): void {
  drift(rule, s, 1)
  kick(rule, s, 1)
}

// the inverse of one beat, in place: the kick backward, then the drift backward
export function remainderBeatBackInPlace(rule: RemainderRule, s: RemainderState): void {
  kick(rule, s, -1)
  drift(rule, s, -1)
}

// the centered B of every plaquette
export function centeredFields(rule: RemainderRule, angle: Int32Array): Int32Array {
  return Int32Array.from({ length: rule.lattice.plaquetteCount }, (_, p) => centeredOf(plaquetteField(rule.base, angle, p), rule.n))
}
