// A STAND-IN, not the electron: a particle token on the husk carrying the fear walk's two slots and a spin
// doublet, used by E-SPN-0053, E-MTR-0013 and E-MTR-0014 to ask what content a spin one half charge needs.
//
// The pieces, and where each comes from in the model:
// - the slots: the fear walk's two slots, forward (index 0) and back (index 1), mixed each beat by the fear
//   coin C = SWAP^(2/3) = (1 + omega)/2 + (1 - omega)/2 SWAP (code/rule/fear-walk, E-CMP-0017). In slot
//   language C = e^(i pi/3) e^(-i (pi/3) tau_x): it is a Dirac mass term with angle pi/3, and C^3 = SWAP^2 = I
// - the spin: a doublet, the parity-even subspace of one role, which carries the natural spin one half of 2T
//   (E-SPN-0051). Written here in its SU(2) basis, index 0 up and 1 down along the husk's z axis
// - the charge: a weight crossing a husk link is multiplied by e^(i q theta) going forward and e^(-i q theta)
//   going back (the Peierls phase of code/measure/charged-walk). q = 1 is love minus fear 3, one whole
// - the stream: each beat copies along ONE husk direction (the husk's own light cone: a bulk root casts a husk
//   step of length 1 or sqrt 2, code/measure/photon-husk). Two kinds of beat:
//     'x', 'y', 'z'  a husk axis. In 'locked' mode the component with tau_z sigma_a = +1 is copied one dock
//                    forward and the component with -1 one dock back, so the spin decides the direction of the
//                    copy (the Dirac alpha_a = tau_z sigma_a). In 'spectator' mode the slot alone decides
//                    (tau_z), as in the one-dimensional fear walk, and the spin rides along untouched
//     'up', 'down'   a depth excursion: a bulk root (0, 0, +-1, 1) casts a husk step +z or -z, copied the same
//                    way for every component. A pair returns every column, so on the husk it is a beat with a
//                    coin and no net motion
//   Every beat applies the coin first, then its stream.
//
// The state is 4 complex amplitudes per husk dock, index 2 slot + spin, on an L x L x L torus. Exact up to
// floating rounding, deterministic.

export type Step = 'x' | 'y' | 'z' | 'up' | 'down'
export type Mode = 'locked' | 'spectator'

export type Complex = [number, number]

const OMEGA: Complex = [-0.5, Math.sqrt(3) / 2]
// (1 + omega)/2 and (1 - omega)/2
export const COIN_A: Complex = [(1 + OMEGA[0]) / 2, OMEGA[1] / 2]
export const COIN_B: Complex = [(1 - OMEGA[0]) / 2, -OMEGA[1] / 2]

const mul = (p: Complex, q: Complex): Complex => [p[0] * q[0] - p[1] * q[1], p[0] * q[1] + p[1] * q[0]]
const add = (p: Complex, q: Complex): Complex => [p[0] + q[0], p[1] + q[1]]

// 4 x 4 complex matrices, row-major, as arrays of Complex
export type Matrix4 = Complex[]

export function identity4(): Matrix4 {
  return Array.from({ length: 16 }, (_, i) => [i % 5 === 0 ? 1 : 0, 0] as Complex)
}

export function multiply4(a: Matrix4, b: Matrix4): Matrix4 {
  const out: Matrix4 = Array.from({ length: 16 }, () => [0, 0] as Complex)

  for (let i = 0; i < 4; i++) {
    for (let k = 0; k < 4; k++) {
      const x = a[i * 4 + k] ?? [0, 0]

      if (x[0] === 0 && x[1] === 0) {
        continue
      }

      for (let j = 0; j < 4; j++) {
        out[i * 4 + j] = add(out[i * 4 + j] ?? [0, 0], mul(x, b[k * 4 + j] ?? [0, 0]))
      }
    }
  }

  return out
}

// the coin on the slots, the identity on the spin
export function coinMatrix(): Matrix4 {
  const out: Matrix4 = Array.from({ length: 16 }, () => [0, 0] as Complex)

  for (let spin = 0; spin < 2; spin++) {
    out[(0 + spin) * 4 + (0 + spin)] = COIN_A
    out[(0 + spin) * 4 + (2 + spin)] = COIN_B
    out[(2 + spin) * 4 + (0 + spin)] = COIN_B
    out[(2 + spin) * 4 + (2 + spin)] = COIN_A
  }

  return out
}

// the Pauli matrices, 2 x 2 row-major
const PAULI: Record<'x' | 'y' | 'z', Complex[]> = {
  x: [[0, 0], [1, 0], [1, 0], [0, 0]],
  y: [[0, 0], [0, -1], [0, 1], [0, 0]],
  z: [[1, 0], [0, 0], [0, 0], [-1, 0]],
}

// the generator Gamma of a step: tau_z sigma_a (locked), tau_z (spectator), or the identity (a depth step,
// whose copy goes the same way for every component)
export function stepGenerator(step: Step, mode: Mode): Matrix4 {
  const out: Matrix4 = Array.from({ length: 16 }, () => [0, 0] as Complex)

  if (step === 'up' || step === 'down') {
    return identity4()
  }

  for (let slot = 0; slot < 2; slot++) {
    const tau = slot === 0 ? 1 : -1

    for (let s = 0; s < 2; s++) {
      for (let t = 0; t < 2; t++) {
        const sigma: Complex = mode === 'locked' ? (PAULI[step][s * 2 + t] ?? [0, 0]) : s === t ? [1, 0] : [0, 0]

        out[(2 * slot + s) * 4 + (2 * slot + t)] = [tau * sigma[0], tau * sigma[1]]
      }
    }
  }

  return out
}

// the husk axis a step copies along, and the sign of a depth step's husk shadow
export function stepAxis(step: Step): { axis: number; sign: number } {
  if (step === 'up') {
    return { axis: 2, sign: 1 }
  }

  if (step === 'down') {
    return { axis: 2, sign: -1 }
  }

  return { axis: step === 'x' ? 0 : step === 'y' ? 1 : 2, sign: 1 }
}

// the free symbol of one step at wave vector k: C, then e^(-i sign k_a Gamma), which for Gamma^2 = I is
// cos(k_a) - i sin(k_a) Gamma
export function stepSymbol(step: Step, mode: Mode, k: readonly number[]): Matrix4 {
  const { axis, sign } = stepAxis(step)
  const phase = sign * (k[axis] ?? 0)
  const gamma = stepGenerator(step, mode)
  const shift: Matrix4 = identity4().map((v, i) => [v[0] * Math.cos(phase) + (gamma[i] ?? [0, 0])[1] * Math.sin(phase), -(gamma[i] ?? [0, 0])[0] * Math.sin(phase) + v[1] * Math.cos(phase)] as Complex)

  return multiply4(shift, coinMatrix())
}

// the symbol of a whole schedule, first step applied first
export function scheduleSymbol(schedule: readonly Step[], mode: Mode, k: readonly number[]): Matrix4 {
  let out = identity4()

  for (const step of schedule) {
    out = multiply4(stepSymbol(step, mode, k), out)
  }

  return out
}

// A walker on the husk torus. `theta[axis]` holds each dock's link angle toward +axis (radians), or is absent
// for no field. Amplitudes are stored as re and im arrays of length 4 L^3, index 4 dock + component.
export type Walker = { readonly side: number; re: Float64Array; im: Float64Array }

export function makeWalker(side: number): Walker {
  return { side, re: new Float64Array(4 * side ** 3), im: new Float64Array(4 * side ** 3) }
}

export function copyWalker(w: Walker): Walker {
  return { side: w.side, re: Float64Array.from(w.re), im: Float64Array.from(w.im) }
}

const modulo = (x: number, m: number): number => ((x % m) + m) % m

export function dockIndex(side: number, x: number, y: number, z: number): number {
  return modulo(x, side) + side * modulo(y, side) + side * side * modulo(z, side)
}

function applyLocal(w: Walker, m: Matrix4): void {
  const docks = w.side ** 3

  for (let d = 0; d < docks; d++) {
    const inRe = [0, 1, 2, 3].map(c => w.re[4 * d + c] ?? 0)
    const inIm = [0, 1, 2, 3].map(c => w.im[4 * d + c] ?? 0)

    for (let i = 0; i < 4; i++) {
      let re = 0
      let im = 0

      for (let j = 0; j < 4; j++) {
        const [mr, mi] = m[i * 4 + j] ?? [0, 0]

        re += mr * (inRe[j] ?? 0) - mi * (inIm[j] ?? 0)
        im += mr * (inIm[j] ?? 0) + mi * (inRe[j] ?? 0)
      }

      w.re[4 * d + i] = re
      w.im[4 * d + i] = im
    }
  }
}

// One beat: the coin, then the stream of `step`, charge q in the field theta (or none). Returns, when asked, the
// probability carried across each dock's +axis link this beat (forward minus back), for the continuity check.
export function beatWalker(input: {
  walker: Walker
  step: Step
  mode: Mode
  charge?: number
  theta?: readonly (Float64Array | undefined)[]
  currents?: Float64Array
}): void {
  const { walker: w, step, mode } = input
  const side = w.side
  const docks = side ** 3
  const q = input.charge ?? 0
  const { axis, sign } = stepAxis(step)
  const theta = input.theta?.[axis]
  const gamma = stepGenerator(step, mode)
  // the projectors (1 +- Gamma)/2
  const plus: Matrix4 = identity4().map((v, i) => [(v[0] + (gamma[i] ?? [0, 0])[0]) / 2, (v[1] + (gamma[i] ?? [0, 0])[1]) / 2] as Complex)
  const minus: Matrix4 = identity4().map((v, i) => [(v[0] - (gamma[i] ?? [0, 0])[0]) / 2, (v[1] - (gamma[i] ?? [0, 0])[1]) / 2] as Complex)

  applyLocal(w, coinMatrix())

  const nextRe = new Float64Array(4 * docks)
  const nextIm = new Float64Array(4 * docks)
  const step3 = [0, 0, 0]

  step3[axis] = sign

  for (let z = 0; z < side; z++) {
    for (let y = 0; y < side; y++) {
      for (let x = 0; x < side; x++) {
        const d = dockIndex(side, x, y, z)
        const forward = dockIndex(side, x + (step3[0] ?? 0), y + (step3[1] ?? 0), z + (step3[2] ?? 0))
        const back = dockIndex(side, x - (step3[0] ?? 0), y - (step3[1] ?? 0), z - (step3[2] ?? 0))
        // the link d -> forward carries theta at the lower dock along +axis; a depth step down crosses the
        // link below d backward
        const forwardAngle = sign > 0 ? (theta?.[d] ?? 0) : -(theta?.[forward] ?? 0)
        const backAngle = sign > 0 ? -(theta?.[back] ?? 0) : theta?.[d] ?? 0
        const inRe = [0, 1, 2, 3].map(c => w.re[4 * d + c] ?? 0)
        const inIm = [0, 1, 2, 3].map(c => w.im[4 * d + c] ?? 0)
        let carriedForward = 0
        let carriedBack = 0

        for (const [projector, target, angle, isForward] of [
          [plus, forward, forwardAngle, true],
          [minus, back, backAngle, false],
        ] as const) {
          const c = Math.cos(q * angle)
          const s = Math.sin(q * angle)

          for (let i = 0; i < 4; i++) {
            let re = 0
            let im = 0

            for (let j = 0; j < 4; j++) {
              const [mr, mi] = projector[i * 4 + j] ?? [0, 0]

              re += mr * (inRe[j] ?? 0) - mi * (inIm[j] ?? 0)
              im += mr * (inIm[j] ?? 0) + mi * (inRe[j] ?? 0)
            }

            nextRe[4 * target + i] = (nextRe[4 * target + i] ?? 0) + re * c - im * s
            nextIm[4 * target + i] = (nextIm[4 * target + i] ?? 0) + re * s + im * c

            if (isForward) {
              carriedForward += re * re + im * im
            } else {
              carriedBack += re * re + im * im
            }
          }
        }

        if (input.currents) {
          // the flow on the link from dock e to dock e + axis is stored at 3 e + axis, positive along +axis. With
          // sign +1 the forward copy crosses d's own link along +axis and the back copy crosses back's link
          // against it; with sign -1 the roles swap
          if (sign > 0) {
            input.currents[3 * d + axis] = (input.currents[3 * d + axis] ?? 0) + carriedForward
            input.currents[3 * back + axis] = (input.currents[3 * back + axis] ?? 0) - carriedBack
          } else {
            input.currents[3 * forward + axis] = (input.currents[3 * forward + axis] ?? 0) - carriedForward
            input.currents[3 * d + axis] = (input.currents[3 * d + axis] ?? 0) + carriedBack
          }
        }
      }
    }
  }

  w.re.set(nextRe)
  w.im.set(nextIm)
}

// The exact inverse of beatWalker: undo the stream (P_+ of the dock ahead, P_- of the dock behind, each with
// its phase taken off), then the coin's adjoint.
export function inverseBeatWalker(input: { walker: Walker; step: Step; mode: Mode; charge?: number; theta?: readonly (Float64Array | undefined)[] }): void {
  const { walker: w, step, mode } = input
  const side = w.side
  const docks = side ** 3
  const q = input.charge ?? 0
  const { axis, sign } = stepAxis(step)
  const theta = input.theta?.[axis]
  const gamma = stepGenerator(step, mode)
  const plus: Matrix4 = identity4().map((v, i) => [(v[0] + (gamma[i] ?? [0, 0])[0]) / 2, (v[1] + (gamma[i] ?? [0, 0])[1]) / 2] as Complex)
  const minus: Matrix4 = identity4().map((v, i) => [(v[0] - (gamma[i] ?? [0, 0])[0]) / 2, (v[1] - (gamma[i] ?? [0, 0])[1]) / 2] as Complex)
  const nextRe = new Float64Array(4 * docks)
  const nextIm = new Float64Array(4 * docks)
  const step3 = [0, 0, 0]

  step3[axis] = sign

  for (let z = 0; z < side; z++) {
    for (let y = 0; y < side; y++) {
      for (let x = 0; x < side; x++) {
        const d = dockIndex(side, x, y, z)
        const forward = dockIndex(side, x + (step3[0] ?? 0), y + (step3[1] ?? 0), z + (step3[2] ?? 0))
        const back = dockIndex(side, x - (step3[0] ?? 0), y - (step3[1] ?? 0), z - (step3[2] ?? 0))
        const forwardAngle = sign > 0 ? (theta?.[d] ?? 0) : -(theta?.[forward] ?? 0)
        const backAngle = sign > 0 ? -(theta?.[back] ?? 0) : theta?.[d] ?? 0

        for (const [projector, source, angle] of [
          [plus, forward, forwardAngle],
          [minus, back, backAngle],
        ] as const) {
          const c = Math.cos(q * angle)
          const s = -Math.sin(q * angle)

          for (let i = 0; i < 4; i++) {
            let re = 0
            let im = 0

            for (let j = 0; j < 4; j++) {
              const [mr, mi] = projector[i * 4 + j] ?? [0, 0]
              const vr = w.re[4 * source + j] ?? 0
              const vi = w.im[4 * source + j] ?? 0

              re += mr * vr - mi * vi
              im += mr * vi + mi * vr
            }

            nextRe[4 * d + i] = (nextRe[4 * d + i] ?? 0) + re * c - im * s
            nextIm[4 * d + i] = (nextIm[4 * d + i] ?? 0) + re * s + im * c
          }
        }
      }
    }
  }

  w.re.set(nextRe)
  w.im.set(nextIm)

  // the coin's adjoint: conjugate transpose of a symmetric matrix is its conjugate
  applyLocal(
    w,
    coinMatrix().map(v => [v[0], -v[1]] as Complex),
  )
}

// the probability on each dock
export function density(w: Walker): Float64Array {
  const docks = w.side ** 3
  const out = new Float64Array(docks)

  for (let d = 0; d < docks; d++) {
    for (let c = 0; c < 4; c++) {
      out[d] = (out[d] ?? 0) + (w.re[4 * d + c] ?? 0) ** 2 + (w.im[4 * d + c] ?? 0) ** 2
    }
  }

  return out
}

export function norm(w: Walker): number {
  return density(w).reduce((a, b) => a + b, 0)
}
