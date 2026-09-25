// Coarse response of a lattice-gas rule, read from long-wavelength charge waves, and the group
// averages that say which tensors a symmetry forces to be isotropic.
//
// THE CHARGE WAVE. A dense deterministic fill (code/measure/slot-statistics goldenFill) is run for
// `warm` beats so the rule has mixed it. It is then copied once per wavevector n (integer, on the
// integer torus d4Mesh of side L, k = 2 pi n / L), and in each copy calm slots are turned into love
// where cos(k.x) > 0 and into fear where it is negative, with a deterministic chance epsilon |cos(k.x)|
// (a silver-ratio sequence, never a random draw). The unperturbed copy is the baseline, and every copy
// runs in lockstep under the same schedule. The perturbation is the difference dq = copy - baseline,
// so the background's own fluctuations cancel until the two histories decorrelate.
//
// Per beat, after the collision and before streaming (a collision keeps every cell's charge, so the
// charge read here is the charge the beat started with):
//   relaxation(t) = sum dq cos(k.x) / a0,   the wave's amplitude, 1 at the start
//   current(t)_i  = sum dq d_i sin(k.x) / a0,  the charge current in quadrature with the wave, the
//                   flux a density gradient drives (streaming along d moves cos(k.x) by -sin(k.x) k.d)
// with a0 the starting amplitude.
//
// For a wave along axis j, current(t) is column j of the response kernel K(t): the current that a
// gradient along j drives, in every direction. Four axis waves give the whole 4 x 4 K(t). Its
// symmetric part is the rotational content of the response (a diffusion or sound tensor), and its
// antisymmetric part is a two-form (a current transverse to the gradient) that splits into self-dual
// and anti-self-dual halves.
//
// THE GROUP AVERAGE. A symmetry group G forces a rank-r tensor to be isotropic when every
// G-invariant homogeneous polynomial of degree r is a multiple of |x|^r. The check: average the
// generic polynomial (a . x)^r over G, sample it on unit vectors, and read the spread relative to the
// mean. Zero means G forces rank r; a nonzero spread means it does not.

import { Collision } from '@/code/rule/collision'
import { Mesh } from '@/code/tool/mesh'
import { makeWill, Will } from '@/code/tone/will'
import { streamSourceTable } from '@/code/rule/lattice-gas'
import { goldenFill } from '@/code/measure/slot-statistics'

export type ModeRecord = {
  mode: readonly number[]
  amplitude0: number
  relaxation: number[]
  current: number[][]
}

const SILVER = Math.SQRT2 - 1

// cell coordinates on the integer torus d4Mesh (cell = x + L y + L^2 z + L^3 w)
function phaseOf(cell: number, side: number, mode: readonly number[]): number {
  let p = 0

  for (let axis = 0; axis < 4; axis++) {
    p += (mode[axis] ?? 0) * (Math.floor(cell / side ** axis) % side)
  }

  return (2 * Math.PI * p) / side
}

export function chargeWaveResponse(input: {
  mesh: Mesh
  side: number
  schedule: (beat: number) => Collision
  directions: readonly (readonly number[])[]
  modes: readonly (readonly number[])[]
  epsilon: number
  warm: number
  beats: number
  fill?: { love: number; fear: number }
}): ModeRecord[] {
  const { mesh, side, schedule, directions, modes, epsilon, warm, beats } =
    input
  const degree = mesh.degree
  const cells = mesh.cellCount
  const table = streamSourceTable(mesh)
  const fill = input.fill ?? { love: 0.3, fear: 0.3 }

  // thermalize the shared background
  let src: Will = makeWill(mesh)
  let dst: Will = makeWill(mesh)

  goldenFill({ will: src, love: fill.love, fear: fill.fear })

  const step = (from: Will, to: Will): void => {
    const f = from.data
    const d = to.data

    for (let i = 0; i < table.length; i++) {
      d[i] = f[table[i] ?? 0] ?? 0
    }
  }

  const collideAll = (will: Will, collision: Collision): void => {
    for (let c = 0; c < cells; c++) {
      collision(will.data, c * degree, degree)
    }
  }

  for (let t = 0; t < warm; t++) {
    collideAll(src, schedule(t))
    step(src, dst)

    const swap = src

    src = dst
    dst = swap
  }

  // per-mode cos and sin tables and the perturbed copies
  const cosines = modes.map(mode =>
    Float64Array.from({ length: cells }, (_, c) =>
      Math.cos(phaseOf(c, side, mode)),
    ),
  )
  const sines = modes.map(mode =>
    Float64Array.from({ length: cells }, (_, c) =>
      Math.sin(phaseOf(c, side, mode)),
    ),
  )
  const baseline = { now: src, next: dst }
  const copies = modes.map((_, m) => {
    const now: Will = { mesh, data: Int8Array.from(baseline.now.data) }
    const cos = cosines[m] ?? new Float64Array(cells)

    for (let i = 0; i < now.data.length; i++) {
      if (now.data[i] !== 0) {
        continue
      }

      const value = cos[Math.floor(i / degree)] ?? 0
      const u = ((i + 1) * SILVER) % 1

      if (u < epsilon * Math.abs(value)) {
        now.data[i] = value > 0 ? 1 : -1
      }
    }

    return { now, next: makeWill(mesh) }
  })

  const project = (m: number): { cosine: number; current: number[] } => {
    const cos = cosines[m] ?? new Float64Array(cells)
    const sin = sines[m] ?? new Float64Array(cells)
    const a = copies[m]?.now.data ?? new Int8Array(0)
    const b = baseline.now.data
    let cosine = 0
    const current = [0, 0, 0, 0]

    for (let i = 0; i < a.length; i++) {
      const dq = (a[i] ?? 0) - (b[i] ?? 0)

      if (dq === 0) {
        continue
      }

      const c = Math.floor(i / degree)
      const direction = directions[i % degree] ?? []
      const s = dq * (sin[c] ?? 0)

      cosine += dq * (cos[c] ?? 0)

      for (let k = 0; k < 4; k++) {
        current[k] = (current[k] ?? 0) + s * (direction[k] ?? 0)
      }
    }

    return { cosine, current }
  }

  const amplitude0 = modes.map((_, m) => project(m).cosine)
  const records: ModeRecord[] = modes.map((mode, m) => ({
    mode,
    amplitude0: amplitude0[m] ?? 0,
    relaxation: [],
    current: [],
  }))

  for (let t = 0; t < beats; t++) {
    const collision = schedule(warm + t)

    collideAll(baseline.now, collision)

    copies.forEach((copy, m) => {
      collideAll(copy.now, collision)

      const { cosine, current } = project(m)
      const a0 = amplitude0[m] ?? 1

      records[m]?.relaxation.push(cosine / a0)
      records[m]?.current.push(current.map(x => x / a0))
    })

    step(baseline.now, baseline.next)

    const swap = baseline.now

    baseline.now = baseline.next
    baseline.next = swap

    for (const copy of copies) {
      step(copy.now, copy.next)

      const other = copy.now

      copy.now = copy.next
      copy.next = other
    }
  }

  return records
}

// K(t)[i][j] = current_i of the wave along axis j, from the four axis records in axis order
export function responseKernel(axisRecords: readonly ModeRecord[]): number[][][] {
  const beats = axisRecords[0]?.current.length ?? 0

  return Array.from({ length: beats }, (_, t) =>
    [0, 1, 2, 3].map(i =>
      [0, 1, 2, 3].map(j => axisRecords[j]?.current[t]?.[i] ?? 0),
    ),
  )
}

// the rotational content of a sequence of 4 x 4 matrices, each part summed in square over time:
// isotropic (trace / 4 times the identity), symmetric traceless, and the antisymmetric part's
// self-dual and anti-self-dual halves (the su(2)_L and su(2)_R of so(4), epsilon_0123 = +1)
export function kernelParts(kernel: readonly (readonly (readonly number[])[])[]): {
  isotropic: number
  anisotropic: number
  selfDual: number
  antiSelfDual: number
} {
  let isotropic = 0
  let anisotropic = 0
  let selfDual = 0
  let antiSelfDual = 0

  for (const m of kernel) {
    const at = (i: number, j: number): number => m[i]?.[j] ?? 0
    const trace = (at(0, 0) + at(1, 1) + at(2, 2) + at(3, 3)) / 4

    isotropic += 4 * trace * trace

    for (let i = 0; i < 4; i++) {
      for (let j = 0; j < 4; j++) {
        const s = (at(i, j) + at(j, i)) / 2 - (i === j ? trace : 0)

        anisotropic += s * s
      }
    }

    const f = (i: number, j: number): number => (at(i, j) - at(j, i)) / 2
    const plus = [f(0, 1) + f(2, 3), f(0, 2) - f(1, 3), f(0, 3) + f(1, 2)]
    const minus = [f(0, 1) - f(2, 3), f(0, 2) + f(1, 3), f(0, 3) - f(1, 2)]

    selfDual += plus.reduce((s, x) => s + x * x, 0)
    antiSelfDual += minus.reduce((s, x) => s + x * x, 0)
  }

  return {
    isotropic: Math.sqrt(isotropic),
    anisotropic: Math.sqrt(anisotropic),
    selfDual: Math.sqrt(selfDual),
    antiSelfDual: Math.sqrt(antiSelfDual),
  }
}

// how far a set of relaxation curves disagrees, relative to how far they relax: the rms spread across
// the set, over all beats, divided by the rms of (1 - mean curve)
export function curveSpread(curves: readonly (readonly number[])[]): number {
  const beats = curves[0]?.length ?? 0
  let spread = 0
  let relaxed = 0

  for (let t = 0; t < beats; t++) {
    const values = curves.map(c => c[t] ?? 0)
    const mean = values.reduce((a, b) => a + b, 0) / values.length

    for (const v of values) {
      spread += (v - mean) ** 2
    }

    relaxed += values.length * (1 - mean) ** 2
  }

  return relaxed === 0 ? 0 : Math.sqrt(spread / relaxed)
}

// the least-squares exponent p of y = c x^-p
export function powerLawExponent(
  xs: readonly number[],
  ys: readonly number[],
): number {
  const lx = xs.map(Math.log)
  const ly = ys.map(Math.log)
  const mx = lx.reduce((a, b) => a + b, 0) / lx.length
  const my = ly.reduce((a, b) => a + b, 0) / ly.length
  let num = 0
  let den = 0

  lx.forEach((x, k) => {
    num += (x - mx) * ((ly[k] ?? 0) - my)
    den += (x - mx) ** 2
  })

  return den === 0 ? 0 : -num / den
}

// deterministic unit vectors in four dimensions: a Kronecker sequence with the irrational steps
// sqrt 2, 3, 5, 7 (none an integer, so no coordinate sticks at a pole of the tangent), each coordinate
// mapped through the tangent onto the line, the vector normalized
const KRONECKER_STEPS = [2, 3, 5, 7].map(Math.sqrt)

export function unitSamples(count: number): number[][] {
  const out: number[][] = []

  for (let n = 0; n < count; n++) {
    const u = KRONECKER_STEPS.map(step => ((n + 1) * step) % 1)
    const v = u.map(x => Math.tan(Math.PI * (x - 0.5)))
    const norm = Math.hypot(...v)

    out.push(v.map(x => x / norm))
  }

  return out
}

// the spread over unit vectors of the group average of (a . x)^rank, divided by its mean: zero when
// the group forces every rank-r symmetric tensor to be isotropic
export function forcedIsotropySpread(input: {
  group: readonly (readonly (readonly number[])[])[]
  rank: number
  generic: readonly number[]
  samples: readonly (readonly number[])[]
}): number {
  const { group, rank, generic, samples } = input
  const values = samples.map(x => {
    let sum = 0

    for (const g of group) {
      // (a . g x)
      let dot = 0

      for (let i = 0; i < 4; i++) {
        let gx = 0

        for (let j = 0; j < 4; j++) {
          gx += (g[i]?.[j] ?? 0) * (x[j] ?? 0)
        }

        dot += (generic[i] ?? 0) * gx
      }

      sum += dot ** rank
    }

    return sum / group.length
  })
  const mean = values.reduce((a, b) => a + b, 0) / values.length
  const rms = Math.sqrt(
    values.reduce((a, b) => a + (b - mean) ** 2, 0) / values.length,
  )

  return rms / Math.abs(mean)
}
