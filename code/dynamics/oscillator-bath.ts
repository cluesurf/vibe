// A bound coordinate (a captured body's internal degree of freedom, in an attractive well) coupled to a
// radiative field-chain bath. This is the reduced canonical model of "a captured body coupled to a bath", the
// well is the binding, the chain is the bath, and an absorbing far end is radiation leaving to infinity.
//
// With an ABSORBING end the body radiates its excess into the bath and SETTLES (the bath makes the dynamics
// effectively irreversible, giving an attractor at the ground state). With a REFLECTING end the radiated energy
// returns and the body oscillates forever (a reversible periodic orbit, no attractor). This is the difference
// between a body that can become a self (bath-coupled, has a basin) and one that cannot (closed, reversible).

export type OscillatorBathInput = {
  absorbing: boolean // an absorbing far end is the bath, a reflecting end is the closed control
  stiffness: number // the binding-well stiffness (positive attracts, the bound state)
  start: number // initial displacement r0
  velocity?: number // initial velocity v0
  steps: number
  kickStep?: number // optional perturbation, the step at which to apply a velocity kick
  kickVelocity?: number // the size of the kick
  fieldSpeed2?: number // the bath field's wave speed squared. Positive = a PROPAGATING (massless) field that
  // carries radiation away. Zero = a LOCAL (non-propagating) field that cannot radiate (the body's energy has
  // nowhere to go even with an absorbing end). Default 1 (propagating).
}

// Run the oscillator-bath dynamics, returning the displacement trajectory r over time.
export function oscillatorBathTrajectory(
  input: OscillatorBathInput,
): number[] {
  const chain = 80 // bath field sites
  const sponge = 24 // absorbing layer width at the far end
  const couple = 0.35 // body-to-bath coupling (radiation strength)
  const waveSpeed2 = input.fieldSpeed2 ?? 1.0
  const dt = 0.2

  let r = input.start
  let vr = input.velocity ?? 0

  const u = new Array<number>(chain).fill(0)
  const w = new Array<number>(chain).fill(0)
  const trajectory: number[] = []

  for (let t = 0; t < input.steps; t++) {
    if (input.kickStep !== undefined && t === input.kickStep) {
      vr += input.kickVelocity ?? 0
    }

    const ar = -input.stiffness * r - couple * (r - u[0]!)
    const au = new Array<number>(chain).fill(0)

    for (let x = 0; x < chain; x++) {
      const left = x > 0 ? u[x - 1]! : 0
      const right = x < chain - 1 ? u[x + 1]! : 0

      au[x] = waveSpeed2 * (left - 2 * u[x]! + right)
    }

    au[0]! += couple * (r - u[0]!)
    vr += ar * dt
    r += vr * dt

    if (r > 1000) {
      r = 1000
      vr = 0
    } else if (r < -1000) {
      r = -1000
      vr = 0
    }

    for (let x = 0; x < chain; x++) {
      w[x]! += au[x]! * dt
      u[x]! += w[x]! * dt
    }

    if (input.absorbing) {
      for (let x = chain - sponge; x < chain; x++) {
        const depth = (x - (chain - sponge)) / sponge
        const damp = 1 - 0.06 * depth

        u[x]! *= damp
        w[x]! *= damp
      }
    }

    trajectory.push(r)
  }

  return trajectory
}

// Two bodies, each in its own well, mutually attracting, both radiating into a shared bath. Under an absorbing
// bath they settle to a JOINT ground state, the two sub-bodies bind into one composite, a self of selves. The
// returned trajectories are the two body coordinates over time.
export type TwoBodyBathInput = {
  absorbing: boolean
  stiffness: number // each body's own well
  mutual: number // the attraction between the two bodies (binds them into a composite)
  start1: number
  start2: number
  steps: number
  kickStep?: number // optional perturbation of body 1
  kickVelocity?: number
}

export function twoBodyBathTrajectory(input: TwoBodyBathInput): {
  body1: number[]
  body2: number[]
} {
  const chain = 80
  const sponge = 24
  const couple = 0.35
  const waveSpeed2 = 1.0
  const dt = 0.2

  let r1 = input.start1
  let r2 = input.start2
  let v1 = 0
  let v2 = 0

  // each body radiates into its OWN bath chain, so BOTH the centre-of-mass and the relative (internal) modes
  // radiate and damp. (A single shared chain leaves the relative mode dark to the bath, undamped.)
  const u1 = new Array<number>(chain).fill(0)
  const w1 = new Array<number>(chain).fill(0)
  const u2 = new Array<number>(chain).fill(0)
  const w2 = new Array<number>(chain).fill(0)
  const body1: number[] = []
  const body2: number[] = []

  const stepChain = (u: number[], w: number[], drive: number): void => {
    const au = new Array<number>(chain).fill(0)

    for (let x = 0; x < chain; x++) {
      const left = x > 0 ? u[x - 1]! : 0
      const right = x < chain - 1 ? u[x + 1]! : 0

      au[x] = waveSpeed2 * (left - 2 * u[x]! + right)
    }

    au[0]! += drive

    for (let x = 0; x < chain; x++) {
      w[x]! += au[x]! * dt
      u[x]! += w[x]! * dt
    }

    if (input.absorbing) {
      for (let x = chain - sponge; x < chain; x++) {
        const depth = (x - (chain - sponge)) / sponge
        const damp = 1 - 0.06 * depth

        u[x]! *= damp
        w[x]! *= damp
      }
    }
  }

  for (let t = 0; t < input.steps; t++) {
    if (input.kickStep !== undefined && t === input.kickStep) {
      v1 += input.kickVelocity ?? 0
    }

    // each body, its own well, mutual attraction toward the other, and coupling to its own bath.
    const a1 =
      -input.stiffness * r1 +
      input.mutual * (r2 - r1) -
      couple * (r1 - u1[0]!)

    const a2 =
      -input.stiffness * r2 +
      input.mutual * (r1 - r2) -
      couple * (r2 - u2[0]!)

    v1 += a1 * dt
    v2 += a2 * dt
    r1 += v1 * dt
    r2 += v2 * dt
    stepChain(u1, w1, couple * (r1 - u1[0]!))
    stepChain(u2, w2, couple * (r2 - u2[0]!))
    body1.push(r1)
    body2.push(r2)
  }

  return { body1, body2 }
}

// The late amplitude, the maximum absolute displacement over the final fraction of the run. Near zero means the
// body settled (an attractor), large means it is still oscillating (no attractor).
export function lateAmplitude(
  trajectory: number[],
  lateFraction = 0.3,
): number {
  const from = Math.floor(trajectory.length * (1 - lateFraction))

  let max = 0

  for (let t = from; t < trajectory.length; t++) {
    const a = Math.abs(trajectory[t]!)

    if (a > max) {
      max = a
    }
  }

  return max
}
