// The long-wave charge response read on the husk as well as in the bulk (E-RLT-0054).
//
// The physical world of the theory is the husk, the horosphere of a cusp of the {3,4,3,4} honeycomb, a flat
// three-dimensional cubic lattice ({4,3,4}); the four-dimensional bulk is the substrate the rule runs on
// (note/experiment/holography/readme.md). E-RLT-0045 to E-RLT-0053 read the rank-2 response kernel K(t) of
// long charge waves in the bulk: K[i][j] is current i for a wave along axis j, and its anisotropy is the
// symmetric traceless part against the trace. The husk reading restricts the same kernel to the husk.
//
// WHICH THREE DIRECTIONS. On the real honeycomb (code/substrate/coxeter/label-transport, cuspLayer), the
// cells touching one ideal vertex form the husk, each with six husk neighbours, across the six facets that
// contain the vertex: in a cell's own labels those are the six D4 roots r with r . n = 1, n the vertex
// direction (checked in E-RLT-0054: every layer cell of the radius-3 ball steps inside the layer by the roots
// (1, +-1, 0, 0), (1, 0, +-1, 0), (1, 0, 0, +-1), or their negatives on the cells of the other handedness).
// Their parts perpendicular to n are the three cubic axes. So a husk is the hyperplane perpendicular to an
// ideal vertex direction n, one of the 24 vertices of the 24-cell: the 8 axes +-e_i and the 16 points
// (+-1, +-1, +-1, +-1) / 2, 12 husk orientations up to sign. The husk block of the kernel is B = A K A^T,
// A the rows of an orthonormal basis of n's complement, and its anisotropy is the symmetric traceless part
// of B against B's trace, in three dimensions.
//
// This is a projection of the bulk kernel measured on the flat D4 lattice, which the repo uses as the flat
// model of the cusp (code/tool/mesh, d4Mesh). It is not a run of the rule on the hyperbolic ball: the layer
// inside the largest ball built (radius 4, 162,049 cells) reaches skin 4, 129 cells, too few for a long wave.

import { type Collision } from '@/code/rule/collision'
import { chargeWaveResponse, kernelParts, responseKernel, torusPosition } from '@/code/measure/coarse-modes'
import { goldenFill } from '@/code/measure/slot-statistics'
import { makeWill } from '@/code/tone/will'
import { d4Mesh } from '@/code/tool/mesh'
import { rootsD4 } from '@/code/algebra/group/root-system'
import {
  coldQuaternionBeat,
  coldQuaternionCollideAll,
  coldQuaternionStream,
  emptyColdState,
  makeColdQuaternionLattice,
  type ColdQuaternionKnit,
  type ColdQuaternionState,
} from '@/code/rule/cold-quaternion-knit'

export const AXIS_MODES: readonly (readonly number[])[] = [0, 1, 2, 3].map(a => [0, 1, 2, 3].map(k => (k === a ? 1 : 0)))

// the 12 husk normals up to sign: the axes and the half-diagonals with a positive first entry
export const HUSK_NORMALS: readonly (readonly number[])[] = [
  ...AXIS_MODES,
  ...Array.from({ length: 8 }, (_, m) => [0.5, ...[0, 1, 2].map(b => (Math.floor(m / 2 ** b) % 2 === 0 ? 0.5 : -0.5))]),
]

// an orthonormal basis of the complement of a unit normal, by Gram-Schmidt on the axes
export function huskBasis(normal: readonly number[]): number[][] {
  const out: number[][] = []

  for (const axis of AXIS_MODES) {
    let v = [...axis]

    for (const u of [normal, ...out]) {
      const d = v.reduce((s, x, k) => s + x * (u[k] ?? 0), 0)

      v = v.map((x, k) => x - d * (u[k] ?? 0))
    }

    const n = Math.hypot(...v)

    if (n > 1e-9 && out.length < 3) {
      out.push(v.map(x => x / n))
    }
  }

  return out
}

// the husk block's parts summed in square over time: isotropic (trace / 3 times the identity), symmetric
// traceless, antisymmetric
export function huskParts(kernel: readonly (readonly (readonly number[])[])[], normal: readonly number[]): { isotropic: number; anisotropic: number; antisymmetric: number } {
  const a = huskBasis(normal)
  let isotropic = 0
  let anisotropic = 0
  let antisymmetric = 0

  for (const m of kernel) {
    const b = [0, 1, 2].map(p =>
      [0, 1, 2].map(q => {
        let s = 0

        for (let i = 0; i < 4; i++) for (let j = 0; j < 4; j++) s += (a[p]?.[i] ?? 0) * (m[i]?.[j] ?? 0) * (a[q]?.[j] ?? 0)

        return s
      }),
    )
    const trace = ((b[0]?.[0] ?? 0) + (b[1]?.[1] ?? 0) + (b[2]?.[2] ?? 0)) / 3

    isotropic += 3 * trace * trace

    for (let p = 0; p < 3; p++) {
      for (let q = 0; q < 3; q++) {
        const sym = ((b[p]?.[q] ?? 0) + (b[q]?.[p] ?? 0)) / 2 - (p === q ? trace : 0)
        const anti = ((b[p]?.[q] ?? 0) - (b[q]?.[p] ?? 0)) / 2

        anisotropic += sym * sym
        antisymmetric += anti * anti
      }
    }
  }

  return { isotropic: Math.sqrt(isotropic), anisotropic: Math.sqrt(anisotropic), antisymmetric: Math.sqrt(antisymmetric) }
}

export type ResponseReading = {
  // the bulk anisotropy (symmetric traceless over isotropic, E-RLT-0045's number) after 1, 4, 16 starts
  readonly bulk: number[]
  // per husk normal, the husk anisotropy after the most starts run
  readonly husk: number[]
  // the mean and the largest husk anisotropy after 1, 4, 16 starts
  readonly huskMean: number[]
  readonly huskMax: number[]
  // the isotropic part's size (bulk), after the most starts
  readonly isotropicSize: number
}

type Kernel = number[][][]

function reading(kernels: Kernel[], counts: readonly number[]): ResponseReading {
  let sum: Kernel | undefined
  const bulk: number[] = []
  const huskMean: number[] = []
  const huskMax: number[] = []
  let husk: number[] = []
  let isotropicSize = 0

  kernels.forEach((kernel, j) => {
    sum = sum ? sum.map((m, t) => m.map((row, i) => row.map((x, k) => x + (kernel[t]?.[i]?.[k] ?? 0)))) : kernel.map(m => m.map(row => [...row]))

    if (counts.includes(j + 1)) {
      const mean = sum.map(m => m.map(row => row.map(x => x / (j + 1))))
      const parts = kernelParts(mean)
      const perHusk = HUSK_NORMALS.map(n => {
        const h = huskParts(mean, n)

        return h.anisotropic / h.isotropic
      })

      bulk.push(parts.anisotropic / parts.isotropic)
      huskMean.push(perHusk.reduce((a, b) => a + b, 0) / perHusk.length)
      huskMax.push(Math.max(...perHusk))
      husk = perHusk
      isotropicSize = parts.isotropic
    }
  })

  return { bulk, husk, huskMean, huskMax, isotropicSize }
}

// the reading for a tone-only knit (a schedule of dock collisions), averaged over start times 6 beats apart
export function toneResponse(input: { side: number; schedule: (t: number) => Collision; starts: number }): ResponseReading {
  const { side, schedule, starts } = input
  const kernels: Kernel[] = []

  for (let j = 0; j < starts; j++) {
    const records = chargeWaveResponse({ mesh: d4Mesh({ side }), side, schedule, directions: rootsD4(), modes: AXIS_MODES, epsilon: 0.1, warm: 48 + 6 * j, beats: 2 * side })

    kernels.push(responseKernel(records))
  }

  return reading(kernels, [1, 4, 16].filter(c => c <= starts))
}

const SILVER = Math.SQRT2 - 1

// chargeWaveResponse (code/measure/coarse-modes) for the cold quaternion knit, with the same background
// (a golden fill of 0.3 loves and 0.3 fears, every store and counter 0), the same perturbation and the same
// projection; tones added by the perturbation carry store 0
function coldKernel(input: { side: number; knit: ColdQuaternionKnit; warm: number; beats: number }): Kernel {
  const { side, knit, warm, beats } = input
  const mesh = d4Mesh({ side })
  const lattice = makeColdQuaternionLattice(mesh, knit)
  const cells = mesh.cellCount
  const roots = rootsD4()
  const will = makeWill(mesh)

  goldenFill({ will, love: 0.3, fear: 0.3 })

  let base: ColdQuaternionState = { ...emptyColdState(mesh), vibe: will.data }

  for (let t = 0; t < warm; t++) {
    base = coldQuaternionBeat(lattice, base)
  }

  const phase = (c: number, mode: readonly number[]): number => {
    const p = torusPosition(c, side)

    return (2 * Math.PI * mode.reduce((s, m, k) => s + m * (p[k] ?? 0), 0)) / side
  }
  const cosines = AXIS_MODES.map(mode => Float64Array.from({ length: cells }, (_, c) => Math.cos(phase(c, mode))))
  const sines = AXIS_MODES.map(mode => Float64Array.from({ length: cells }, (_, c) => Math.sin(phase(c, mode))))
  let copies = AXIS_MODES.map((_, m) => {
    const vibe = Int8Array.from(base.vibe)
    const cos = cosines[m] ?? new Float64Array(cells)

    for (let i = 0; i < vibe.length; i++) {
      if (vibe[i] !== 0) continue

      const value = cos[Math.floor(i / 24)] ?? 0
      const u = ((i + 1) * SILVER) % 1

      if (u < 0.1 * Math.abs(value)) vibe[i] = value > 0 ? 1 : -1
    }

    return { ...base, vibe, store: Int32Array.from(base.store), counter: Int32Array.from(base.counter) }
  })
  const project = (m: number): { cosine: number; current: number[] } => {
    const cos = cosines[m] ?? new Float64Array(cells)
    const sin = sines[m] ?? new Float64Array(cells)
    const a = copies[m]?.vibe ?? new Int8Array(0)
    const b = base.vibe
    let cosine = 0
    const current = [0, 0, 0, 0]

    for (let i = 0; i < a.length; i++) {
      const dq = (a[i] ?? 0) - (b[i] ?? 0)

      if (dq === 0) continue

      const c = Math.floor(i / 24)
      const s = dq * (sin[c] ?? 0)
      const r = roots[i % 24] ?? []

      cosine += dq * (cos[c] ?? 0)

      for (let k = 0; k < 4; k++) current[k] = (current[k] ?? 0) + s * (r[k] ?? 0)
    }

    return { cosine, current }
  }
  const amplitude0 = AXIS_MODES.map((_, m) => project(m).cosine)
  const currents: number[][][] = AXIS_MODES.map(() => [])

  // as chargeWaveResponse: collide everything, read the current, then stream everything
  for (let t = 0; t < beats; t++) {
    base = coldQuaternionCollideAll(lattice, base)
    copies = copies.map(copy => coldQuaternionCollideAll(lattice, copy))

    AXIS_MODES.forEach((_, m) => {
      const { current } = project(m)

      currents[m]?.push(current.map(x => x / (amplitude0[m] ?? 1)))
    })

    base = coldQuaternionStream(lattice, base)
    copies = copies.map(copy => coldQuaternionStream(lattice, copy))
  }

  return Array.from({ length: beats }, (_, t) => [0, 1, 2, 3].map(i => [0, 1, 2, 3].map(j => currents[j]?.[t]?.[i] ?? 0)))
}

export function coldResponse(input: { side: number; knit: ColdQuaternionKnit; starts: number }): ResponseReading {
  const kernels: Kernel[] = []

  for (let j = 0; j < input.starts; j++) {
    kernels.push(coldKernel({ side: input.side, knit: input.knit, warm: 48 + 6 * j, beats: 2 * input.side }))
  }

  return reading(kernels, [1, 4, 16].filter(c => c <= input.starts))
}
