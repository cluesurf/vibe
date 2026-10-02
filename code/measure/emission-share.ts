// Measurement for E-FRC-0288: a STAND-IN emitter's emission into the linear husk light, and how the light it emits
// shares its fill between the link registers (e) and the plaquette registers (B = C W x) at a given split.
//
// THE LIGHT. The linear husk light of code/rule/trit-column, in real space on a side^3 husk torus (buildTritBulk): per
// beat the drift x <- x + s e on the 9 side^3 husk links, then the kick e <- e - f C^T N C W x (C the husk curl, N the
// triangle multiplicities, W the link weights). This is E-FRC-0276's beat T = [[1, s], [-f K, 1 - kappa K]], kappa = s f,
// rho = f / s. The canonical pair is (x, p = W e) and the energy H = (s / 2) e^T W e + (f / 2) |N^(1/2) C W x|^2.
//
// THE EMITTER. A harmonic oscillator (q, p) of gap delta per beat (H = delta (q^2 + p^2) / 2), turned exactly by the
// angle delta each beat: the single-excitation reading of a two-level member, exact for a harmonic one. It couples to
// one husk link l0 (dock 0, axis 0) by one of two exact shears per beat, each the time-one flow of its coupling:
//   through the field E      the link's energy completed to (s w / 2) (e_l0 + gE q / (s w))^2, so beside the light
//                            H = gE q e_l0 + gE^2 q^2 / (2 s w) (the dipole's self-energy, as the ladder's drift
//                            phase bal(x + R)^2 carries the string's own x^2, E-FRC-0233):
//                            p <- p - gE (e_l0 + gE q / (s w)),  x_l0 <- x_l0 + gE q / w_l0
//   through the potential A  minimal coupling, the emitter's energy delta ((p - gA x_l0)^2 + q^2) / 2, so beside the
//                            turn H = -delta gA p x_l0 + delta gA^2 x_l0^2 / 2 (the A^2 term keeps it bounded below):
//                            q <- q - delta gA x_l0,  e_l0 <- e_l0 + delta gA (p - gA x_l0) / w_l0
// Each shear moves only what its own coupling does not read, so it is that coupling's exact time-one flow. When both
// act they are applied in a fixed order, E then A. A bare A coupling gA p x_l0 without the A^2 term is unbounded below
// (the gauge line of x has no stiffness) and runs away (tmp/em-probe1).
//
// THE UNIT CHANGE (E-FRC-0276). With x = sqrt(s) a and e = b / sqrt(s) the light's beat holds kappa only, and the
// couplings become (gE / sqrt s) q b_l0 and (gA sqrt s) p a_l0. So a run at split rho1 with (gE, gA) is, link for
// link, sqrt(s1 / s2) times (x) and sqrt(s2 / s1) times (e) a run at rho2 with (gE sqrt(s2 / s1), gA sqrt(s1 / s2)).
//
// DETERMINISM: no random numbers; every run starts from the emitter at (q, p) = (0, 1) and an empty light.

import { buildTritBulk, type TritBulk } from '@/code/rule/trit-column'

export type EmissionBox = {
  bulk: TritBulk
  side: number
  // per link: its weight; per triangle: n
  w: Float64Array
  n: Float64Array
  // per link and per triangle: the torus distance (Euclidean, minimal image) of its dock from dock 0
  linkDistance: Float64Array
  triangleDistance: Float64Array
}

export function emissionBox(side: number): EmissionBox {
  const bulk = buildTritBulk({ side, depth: 2 })
  const w = Float64Array.from(
    { length: bulk.huskLinks },
    (_, l) => bulk.weight[l % 9] ?? 1,
  )
  const n = Float64Array.from(bulk.multiplicity)
  const wrap = (v: number): number => Math.min(v, side - v)
  const dockDistance = (y: number): number =>
    Math.hypot(
      wrap(y % side),
      wrap(Math.floor(y / side) % side),
      wrap(Math.floor(y / (side * side))),
    )
  const linkDistance = Float64Array.from(
    { length: bulk.huskLinks },
    (_, l) => dockDistance(Math.floor(l / 9)),
  )
  const triangleDistance = Float64Array.from(
    { length: bulk.huskTriangles },
    (_, p) =>
      Math.min(
        ...[0, 1, 2].map(
          j => linkDistance[bulk.huskTriLinks[p * 3 + j] ?? 0]!,
        ),
      ),
  )

  return { bulk, side, w, n, linkDistance, triangleDistance }
}

export type EmissionRun = {
  // the split's drift and force
  s: number
  f: number
  // the emitter's gap, and its couplings through E and through A
  delta: number
  gE: number
  gA: number
  beats: number
  // the beats over which the fills are averaged, [from, to)
  window: readonly [number, number]
  // the far field: links and triangles whose dock lies beyond this distance from the emitter
  far: number
}

export type EmissionRead = {
  // the final light, for the conjugation check
  x: Float64Array
  e: Float64Array
  // window means of sum e^2 and sum B^2, whole box and far field
  linkFill: number
  plaquetteFill: number
  farLinkFill: number
  farPlaquetteFill: number
  // the emitter's energy (q^2 + p^2) / 2 at the end, and at the window's start
  emitterEnd: number
  emitterAtWindow: number
  // the light's conserved part at the end, (s / 2) e^T W e + (f / 2) |N^(1/2) C W x|^2, and the total with the
  // emitter (not exactly conserved by a leapfrog; reported)
  lightEnergy: number
}

/** B = C W x on every husk triangle. */
export function plaquetteField(
  box: EmissionBox,
  x: Float64Array,
  out: Float64Array,
): void {
  const { bulk, w } = box

  for (let p = 0; p < bulk.huskTriangles; p++) {
    let b = 0

    for (let j = 0; j < 3; j++) {
      const l = bulk.huskTriLinks[p * 3 + j]!

      b += bulk.huskTriSigns[p * 3 + j]! * w[l]! * x[l]!
    }

    out[p] = b
  }
}

/** One coupled run: emitter turn, coupling shears, drift, kick; fills averaged over the window. */
export function runEmission(
  box: EmissionBox,
  run: EmissionRun,
): EmissionRead {
  const { bulk, w, n } = box
  const L = bulk.huskLinks
  const P = bulk.huskTriangles
  const x = new Float64Array(L)
  const e = new Float64Array(L)
  const B = new Float64Array(P)
  const l0 = 0
  const c = Math.cos(run.delta)
  const sn = Math.sin(run.delta)

  let q = 0
  let p = 1
  let linkFill = 0
  let plaquetteFill = 0
  let farLinkFill = 0
  let farPlaquetteFill = 0
  let emitterAtWindow = 0

  for (let beat = 0; beat < run.beats; beat++) {
    // the emitter's own turn
    const q1 = c * q + sn * p
    const p1 = -sn * q + c * p

    q = q1
    p = p1

    // through E, a complete square: H = gE q e_l0 + gE^2 q^2 / (2 s w)
    if (run.gE !== 0) {
      p -= run.gE * (e[l0]! + (run.gE * q) / (run.s * w[l0]!))
      x[l0] = x[l0]! + (run.gE * q) / w[l0]!
    }

    // through A, minimal: H = -delta gA p x_l0 + delta gA^2 x_l0^2 / 2
    if (run.gA !== 0) {
      const a = x[l0]!

      q -= run.delta * run.gA * a
      e[l0] = e[l0]! + (run.delta * run.gA * (p - run.gA * a)) / w[l0]!
    }

    // drift
    for (let l = 0; l < L; l++) {
      x[l] = x[l]! + run.s * e[l]!
    }

    // kick: e <- e - f C^T N C W x
    plaquetteField(box, x, B)

    for (let t = 0; t < P; t++) {
      const v = run.f * n[t]! * B[t]!

      for (let j = 0; j < 3; j++) {
        const l = bulk.huskTriLinks[t * 3 + j]!

        e[l] = e[l]! - bulk.huskTriSigns[t * 3 + j]! * v
      }
    }

    if (beat === run.window[0]) {
      emitterAtWindow = (q * q + p * p) / 2
    }

    if (beat >= run.window[0] && beat < run.window[1]) {
      plaquetteField(box, x, B)

      for (let l = 0; l < L; l++) {
        const v = e[l]! * e[l]!

        linkFill += v

        if (box.linkDistance[l]! > run.far) {
          farLinkFill += v
        }
      }

      for (let t = 0; t < P; t++) {
        const v = B[t]! * B[t]!

        plaquetteFill += v

        if (box.triangleDistance[t]! > run.far) {
          farPlaquetteFill += v
        }
      }
    }
  }

  plaquetteField(box, x, B)

  let lightEnergy = 0

  for (let l = 0; l < L; l++) {
    lightEnergy += (run.s / 2) * w[l]! * e[l]! * e[l]!
  }

  for (let t = 0; t < P; t++) {
    lightEnergy += (run.f / 2) * n[t]! * B[t]! * B[t]!
  }

  const span = run.window[1] - run.window[0]

  return {
    x,
    e,
    linkFill: linkFill / span,
    plaquetteFill: plaquetteFill / span,
    farLinkFill: farLinkFill / span,
    farPlaquetteFill: farPlaquetteFill / span,
    emitterEnd: (q * q + p * p) / 2,
    emitterAtWindow,
    lightEnergy,
  }
}
