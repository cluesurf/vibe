// The ringdown-echo signature, Mayank Singh's elastic-spacetime prediction in discrete
// form (mayank-singh-quest in the related-theories census). QuEST predicts a late-time
// echo in a gravitational-wave ringdown, a secondary pulse returning after the main one,
// with a delay fixed by the medium. On a discrete substrate the analogue is a wave
// recurrence: a pulse launched at a source leaves, travels the finite lattice, and
// refocuses back at the source at a delay set by the lattice size, a discreteness
// signature. This measure launches a pulse on the second-order reversible wave and reads
// the field energy back at the source over time, so an experiment can look for the
// secondary peak and check that its delay scales with the lattice, and that a
// degree-preserving scramble (no clean geometry) produces no such echo.

import { Mesh, shellDistances } from '@/code/tool/mesh'

// The energy of the wave in a small ball around the source, at each beat. The pulse
// starts at rest (previous = current) as a localized bump, then propagates. Energy is the
// squared deviation of the field from its ball mean, so a refocus (echo) shows as a
// secondary rise after the initial departure. Deterministic, no randomness.
export function sourceEnergyTrace(input: {
  mesh: Mesh
  neighbors: readonly (readonly number[])[]
  source: number
  beats: number
  amplitude?: number
  radius?: number
}): number[] {
  const { mesh, neighbors, source, beats } = input
  const amplitude = input.amplitude ?? 4
  const radius = input.radius ?? 1
  const n = mesh.cellCount

  const distance = shellDistances(mesh, source)
  const ball: number[] = []

  for (let cell = 0; cell < n; cell++) {
    if (distance[cell]! >= 0 && distance[cell]! <= radius) {
      ball.push(cell)
    }
  }

  // a degree-normalized second-order reversible wave (the reversible-wave module uses a
  // small mod-q Uint8 alphabet, which wraps a real pulse into noise, so this measure runs
  // the same leapfrog in floating point with a degree-normalized Laplacian to stay a
  // clean bounded d'Alembertian over the echo timescale).
  const prev = new Float64Array(n)
  const curr = new Float64Array(n)
  const next = new Float64Array(n)

  // a localized bump at rest: current = previous = amplitude on the source, zero else.
  curr[source] = amplitude
  prev[source] = amplitude

  const step = (): void => {
    for (let i = 0; i < n; i++) {
      let sum = 0

      const row = neighbors[i] ?? []

      for (const j of row) {
        sum += curr[j]!
      }

      // second-order reversible wave with a degree-normalized graph Laplacian, a proper
      // d'Alembertian, u_next = 2u - u_prev - L_norm u, CFL-stable so it stays bounded.
      const degree = row.length || 1
      next[i] = 2 * curr[i]! - prev[i]! + (sum / degree - curr[i]!)
    }

    for (let i = 0; i < n; i++) {
      prev[i] = curr[i]!
      curr[i] = next[i]!
    }
  }

  const trace: number[] = []

  for (let beat = 0; beat < beats; beat++) {
    let mean = 0

    for (const cell of ball) {
      mean += curr[cell]!
    }

    mean /= ball.length

    let energy = 0

    for (const cell of ball) {
      const d = curr[cell]! - mean
      energy += d * d
    }

    trace.push(energy)
    step()
  }

  return trace
}

// From a source-energy trace, find the initial departure (the first trough after beat 0)
// and then the strongest secondary peak (the echo). Returns the echo beat and its strength
// relative to the initial energy. A clean recurrence gives a distinct late peak, a
// dispersing field gives none.
export function detectEcho(trace: readonly number[]): {
  echoBeat: number
  echoStrength: number
} {
  if (trace.length < 4) {
    return { echoBeat: -1, echoStrength: 0 }
  }

  const initial = trace[0]!

  // find the first trough (local minimum) after the pulse leaves.
  let trough = 1

  while (trough < trace.length - 1 && trace[trough]! > trace[trough - 1]!) {
    trough++
  }

  while (trough < trace.length - 1 && trace[trough + 1]! <= trace[trough]!) {
    trough++
  }

  // the strongest peak after the trough is the echo.
  let echoBeat = -1
  let echoValue = 0

  for (let beat = trough + 1; beat < trace.length; beat++) {
    if (trace[beat]! > echoValue) {
      echoValue = trace[beat]!
      echoBeat = beat
    }
  }

  const echoStrength = initial === 0 ? 0 : echoValue / initial

  return { echoBeat, echoStrength }
}
