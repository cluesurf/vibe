// Starts and readings for the spanned husk light's electrostatics (code/rule/depth-span-light) and the matter that
// reads it (E-FRC-0254, 0255). Real numbers live here only; the rule holds integers. Starts built here from reals
// are CONSTRUCTION: they choose the integer state a run begins from and are disclosed as such.
//
// THE CHARGE. The flux is S - C^T U and C^T U has no divergence for any U, so each dock's charge is the divergence of
// the strings S alone, fixed for the whole run. Gauss is then that the flux's divergence equals it on every beat.
//
// THE HARMONIC PART. On the torus a string between two charges winds a net flux, a uniform field no potential can
// remove. With the light's metric <a, b> = sum a b / g (g 2 on an axis, 1 on a diagonal) the three parts of a flux
// (the Coulomb gradient g grad phi, the curl C^T u, the uniform e0 g (u . n)) are orthogonal, so the uniform part
// along axis n is e0_n = sum_l S_l (u_l . n) / sum_l g_l (u_l . n)^2.
//
// A RELAXED START (code/measure/trit-kinetic-light relaxStart, the counters in the spanned light's radix). The
// Coulomb flux E_long of the charges (code/measure/trit-hop-light coulombFlux), the potential u solving
// C W C^T u = C W (S - E_long - E_harmonic), U = round(u), and the counters carrying U - u in the triangle's radix
// M_P = q_P^2 (three levels: to M^-3), every lag 0. The spanned rule's shadow E~ = (S - C^T U) + C^T (f_(t+1) - f_t)
// then starts at the static field S - C^T u, and the shadow angle A~ = (Q A + r + C^T f_t) / Q at 0. On a UNIFORM
// depth this is a static solution of the spanned light's linear leapfrog (the kick reads C W A~, which grows as
// C W E / Q = 0 for a curl-free E). On a varying depth the static field is a dielectric's (div of Q grad phi), not
// this one, so the start is built for a uniform depth only and refuses any other.
//
// DETERMINISM: every start is placed; nothing is drawn.

import { TRIT_HUSK_VECTORS } from '@/code/rule/trit-column'
import { coulombFlux } from '@/code/measure/trit-hop-light'
import { solvePotential } from '@/code/measure/trit-kinetic-light'
import { spanFlux, type SpanMedium, type SpanState } from '@/code/rule/depth-span-light'

const G = [2, 2, 2, 1, 1, 1, 1, 1, 1]

// the charge on each dock: the divergence of the strings
export function stringCharge(m: SpanMedium, s: SpanState): Float64Array {
  const g = m.geometry
  const rho = new Float64Array(g.huskDocks)

  for (let l = 0; l < g.huskLinks; l++) {
    const v = s.string[l]!

    if (v === 0) continue
    rho[Math.floor(l / 9)] = rho[Math.floor(l / 9)]! + v
    rho[g.huskNeighbour[l]!] = rho[g.huskNeighbour[l]!]! - v
  }

  return rho
}

// the docks where the divergence of the flux S - C^T U differs from the given charge
export function spanGaussFailures(m: SpanMedium, s: SpanState, rho: Float64Array, flux: Int32Array): number {
  const g = m.geometry
  const div = new Float64Array(g.huskDocks)

  spanFlux(m, s, flux)

  for (let l = 0; l < g.huskLinks; l++) {
    div[Math.floor(l / 9)] = div[Math.floor(l / 9)]! + flux[l]!
    div[g.huskNeighbour[l]!] = div[g.huskNeighbour[l]!]! - flux[l]!
  }

  let failures = 0

  for (let y = 0; y < g.huskDocks; y++) if (div[y] !== rho[y]) failures++

  return failures
}

// the uniform (harmonic) part of a flux on the torus, axis by axis
export function harmonicPart(m: SpanMedium, flux: ArrayLike<number>): Float64Array {
  const g = m.geometry
  const out = new Float64Array(g.huskLinks)

  for (let axis = 0; axis < 3; axis++) {
    let num = 0
    let den = 0

    for (let l = 0; l < g.huskLinks; l++) {
      const u = TRIT_HUSK_VECTORS[l % 9]![axis]!

      if (u === 0) continue
      num += flux[l]! * u
      den += G[l % 9]! * u * u
    }

    const e0 = num / den

    for (let l = 0; l < g.huskLinks; l++) out[l] = out[l]! + e0 * G[l % 9]! * TRIT_HUSK_VECTORS[l % 9]![axis]!
  }

  return out
}

export type SpanRelaxed = {
  // the lattice Coulomb flux of the charges, the harmonic part, and the static field S - C^T u the start holds
  long: Float64Array
  harmonic: Float64Array
  field: Float64Array
  // the largest |S - C^T u - E_long - E_harmonic| left after the solve
  residual: number
}

export function spanRelaxStart(m: SpanMedium, s: SpanState): SpanRelaxed {
  const g = m.geometry
  const q0 = m.count[0]!

  if (m.count.some(q => q !== q0)) throw new Error('the relaxed start is built for a uniform depth only')

  const levels = 1 + s.upper.length
  const long = coulombFlux(g, stringCharge(m, s))
  const harmonic = harmonicPart(m, s.string)
  const t = new Float64Array(g.huskLinks)

  for (let l = 0; l < g.huskLinks; l++) t[l] = s.string[l]! - long[l]! - harmonic[l]!

  const u = solvePotential(g, t)
  const curl = new Float64Array(g.huskLinks)

  for (let p = 0; p < g.triangles; p++) for (let j = p * 3; j < p * 3 + 3; j++) curl[g.triLinks[j]!] = curl[g.triLinks[j]!]! + g.triSigns[j]! * u[p]!

  const field = new Float64Array(g.huskLinks)
  let residual = 0

  for (let l = 0; l < g.huskLinks; l++) {
    residual = Math.max(residual, Math.abs(t[l]! - curl[l]!))
    field[l] = s.string[l]! - curl[l]!
  }

  for (let p = 0; p < g.triangles; p++) {
    const big = m.square[p]!
    const h = (big - 1) / 2
    const whole = Math.round(u[p]!)
    let rest = (whole - u[p]!) * big

    s.potential[p] = whole
    s.lag[p] = 0

    const c1 = Math.max(-h, Math.min(h, Math.round(rest)))

    s.counter[p] = c1
    rest = (rest - c1) * big

    for (let i = 0; i < levels - 1; i++) {
      const c = Math.max(-h, Math.min(h, Math.round(rest)))

      s.upper[i]![p] = c
      s.upperLag[i]![p] = 0
      rest = (rest - c) * big
    }

    s.spatial[p] = 0
  }

  return { long, harmonic, field, residual }
}

export type SpanShadowScratch = { now: Float64Array; next: Float64Array; flux: Int32Array }

export const makeSpanShadowScratch = (m: SpanMedium): SpanShadowScratch => ({
  now: new Float64Array(m.geometry.triangles),
  next: new Float64Array(m.geometry.triangles),
  flux: new Int32Array(m.geometry.huskLinks),
})

// the carried fractions f_t (the lags) and f_(t+1) (the counters) of every triangle, in the triangle's radix
function carried(m: SpanMedium, s: SpanState, w: SpanShadowScratch): void {
  const g = m.geometry

  for (let p = 0; p < g.triangles; p++) {
    const big = m.square[p]!
    let a = s.lag[p]! / big
    let b = s.counter[p]! / big
    let scale = big

    for (let i = 0; i < s.upper.length; i++) {
      scale *= big
      a += s.upperLag[i]![p]! / scale
      b += s.upper[i]![p]! / scale
    }

    w.now[p] = a
    w.next[p] = b
  }
}

// the shadow angle A~ = (Q A + r + C^T f_t) / Q and the shadow flux E~ = (S - C^T U) + C^T (f_(t+1) - f_t), per link
export function spanShadow(m: SpanMedium, s: SpanState, w: SpanShadowScratch, angle: Float64Array, flux: Float64Array): void {
  const g = m.geometry

  carried(m, s, w)
  spanFlux(m, s, w.flux)

  for (let l = 0; l < g.huskLinks; l++) {
    angle[l] = s.angle[l]! * m.span[l]! + s.remainder[l]!
    flux[l] = w.flux[l]!
  }

  for (let p = 0; p < g.triangles; p++) {
    const a = w.now[p]!
    const d = w.next[p]! - a

    if (a === 0 && d === 0) continue

    for (let j = p * 3; j < p * 3 + 3; j++) {
      angle[g.triLinks[j]!] = angle[g.triLinks[j]!]! + g.triSigns[j]! * a
      flux[g.triLinks[j]!] = flux[g.triLinks[j]!]! + g.triSigns[j]! * d
    }
  }

  for (let l = 0; l < g.huskLinks; l++) angle[l] = angle[l]! / m.span[l]!
}

// the shadow invariant of code/measure/depth-span with the electric term's weight w_l / (4 Q_l) replaced by
// w_l / (4 Q_l^power): power 1 is the invariant the rule keeps, power 0 the unspanned light's normalization (a
// control: on a light holding transverse waves it is not constant). The magnetic term is the rule's own either way
export function spanEnergyWeighted(m: SpanMedium, s: SpanState, w: SpanShadowScratch, power: number): number {
  const g = m.geometry
  const angle = new Float64Array(g.huskLinks)
  const flux = new Float64Array(g.huskLinks)

  spanShadow(m, s, w, angle, flux)

  let e = 0

  for (let l = 0; l < g.huskLinks; l++) e += ((g.weight[l % 9]! / 4) * flux[l]! * flux[l]!) / m.span[l]! ** power

  // the magnetic term: B' = C W A~ now and C W (A~ + E~ / Q) next, the angle read centered as the rule reads it
  for (let p = 0; p < g.triangles; p++) {
    const nb = 4 * m.triDepth[p]!
    let raw = 0
    let shadow = 0
    let step = 0

    for (let j = p * 3; j < p * 3 + 3; j++) {
      const l = g.triLinks[j]!
      const c = g.triSigns[j]! * g.weight[l % 9]!

      raw += c * s.angle[l]!
      shadow += c * (angle[l]! - s.angle[l]!)
      step += (c * flux[l]!) / m.span[l]!
    }

    const b0 = ((((raw + nb / 2) % nb) + nb) % nb) - nb / 2 + shadow

    e += ((m.p * g.multiplicity[p]!) / (4 * m.count[p]!)) * b0 * (b0 + step)
  }

  return e
}
