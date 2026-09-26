// Momentum transport of a signed lattice gas on the integer D4 torus (d4Mesh), in the particle momentum.
//
// code/measure/shear-mode reads a shear from the signed tones (tone times root), which is the particle
// momentum only when every tone is a love. A rule whose vacuum makes a love and a fear from calm carries
// both signs, and its conserved momentum is P = sum over slots of |tone| times the root (E-FLD-0021). These
// helpers prepare and read a momentum wave in P, for any direction of momentum a and any wave vector
// q (both integer 4-vectors): the mode amplitude is the sum over docks of (P . a) sin(2 pi m (q . r) / L),
// where r is the dock's position. On the torus Z^4 / L Z^4 the phase q . r is defined mod L for any integer
// q, so a diagonal wave is as good as an axis one. a perpendicular to q is a transverse (shear) wave, a
// parallel to q a longitudinal one.
//
// The start is a deterministic hash: a background of tones of both signs at a fixed fill, plus lone
// carriers on lines with a component along a, placed with probability |bias sin(2 pi m (q . r) / L)| and
// pointed along the sign of the bias, each carrier's tone sign hashed so the charge stays near zero.
//
// The exact spurious invariant that a rule keeping every line momentum has (E-FLD-0022), read per slab:
// the (P . a) carried on lines whose root is perpendicular to q never leaves its slab q . r, since those
// tones stream inside it. Integer, compared exactly.

import { makeWill, type Will } from '@/code/tone/will'
import { type Mesh } from '@/code/tool/mesh'
import { type Collision } from '@/code/rule/collision'
import { beatInto, streamSourceTable } from '@/code/rule/lattice-gas'
import { rootsD4 } from '@/code/algebra/group/root-system'
import { hashRand } from '@/code/dynamics/conserving-sweep'

export type WaveGeometry = {
  // the momentum direction a and the wave vector q, integer 4-vectors
  readonly momentum: readonly number[]
  readonly wave: readonly number[]
}

const ROOTS = rootsD4()
const dot = (a: readonly number[], b: readonly number[]): number => a.reduce((s, x, k) => s + x * (b[k] ?? 0), 0)

function position(dock: number, side: number): number[] {
  return [0, 1, 2, 3].map(k => Math.floor(dock / side ** k) % side)
}

// the slab of a dock, q . r mod L
export function slabOf(dock: number, side: number, wave: readonly number[]): number {
  const s = dot(wave, position(dock, side))

  return ((s % side) + side) % side
}

export function momentumWaveStart(input: {
  mesh: Mesh
  side: number
  geometry: WaveGeometry
  mode: number
  fill: number
  bias: number
  salt: number
}): Will {
  const { mesh, side, geometry, mode, fill, bias, salt } = input
  const will = makeWill(mesh)

  for (let i = 0; i < will.data.length; i++) {
    if (hashRand(i, 1, salt) < fill) {
      will.data[i] = hashRand(i, 2, salt) < 0.5 ? -1 : 1
    }
  }

  const lines: [number, number][] = []

  for (let d = 0; d < 24; d++) {
    const o = mesh.opposite(d)

    if (d < o) {
      lines.push([d, o])
    }
  }

  for (let dock = 0; dock <mesh.cellCount; dock++) {
    const local = bias * Math.sin((2 * Math.PI * mode * slabOf(dock, side, geometry.wave)) / side)

    lines.forEach(([d, o], line) => {
      const along = dot(ROOTS[d] ?? [], geometry.momentum)

      if (along === 0 || hashRand(dock,3 + line, salt) >= Math.abs(local)) {
        return
      }

      const forward = along * local > 0 ? d : o
      const backward = forward === d ? o : d

      will.data[dock * 24 + forward] = hashRand(dock,20 + line, salt) < 0.5 ? -1 : 1
      will.data[dock * 24 + backward] = 0
    })
  }

  return will
}

// the mode amplitude of (P . a) on sin(2 pi m (q . r) / L)
export function momentumWaveAmplitude(input: { will: Will; side: number; geometry: WaveGeometry; mode: number }): number {
  const { will, side, geometry, mode } = input
  const along = ROOTS.map(r => dot(r, geometry.momentum))
  const sines = Array.from({ length: side }, (_, s) => Math.sin((2 * Math.PI * mode * s) / side))

  let amplitude = 0

  for (let dock = 0; dock <will.mesh.cellCount; dock++) {
    let p = 0

    for (let d = 0; d < 24; d++) {
      p += Math.abs(will.data[dock * 24 + d] ?? 0) * (along[d] ?? 0)
    }

    amplitude += p * (sines[slabOf(dock, side, geometry.wave)] ?? 0)
  }

  return amplitude
}

// the (P . a) per slab carried on lines perpendicular to q, the invariant of a line-keeping rule
export function perpendicularSlabs(input: { will: Will; side: number; geometry: WaveGeometry }): number[] {
  const { will, side, geometry } = input
  const weight = ROOTS.map(r => (dot(r, geometry.wave) === 0 ? dot(r, geometry.momentum) : 0))
  const slabs = new Array<number>(side).fill(0)

  for (let dock = 0; dock <will.mesh.cellCount; dock++) {
    const s = slabOf(dock, side, geometry.wave)

    for (let d = 0; d < 24; d++) {
      slabs[s] = (slabs[s] ?? 0) + Math.abs(will.data[dock * 24 + d] ?? 0) * (weight[d] ?? 0)
    }
  }

  return slabs
}

// Fit a normalized series to exp(-gamma t) (a cos(omega t) + b sin(omega t)) + c, by scanning omega over
// (0, pi] and gamma over [0, gammaMax] on fine grids with a, b and c solved by least squares at each point
// (the smallest omega, pi / 400, stands for a pure decay). Returns the best omega and gamma and the r2 of that fit. Unlike
// a running-mean split this has no window, so an oscillation slower than the mesh period is not removed.
export function dampedCosineFit(input: { series: readonly number[]; gammaMax?: number; from?: number }): { omega: number; gamma: number; r2: number } {
  const from = input.from ?? 0
  const ys = input.series.slice(from)
  const ts = ys.map((_, i) => i + from)
  const mean = ys.reduce((s, y) => s + y, 0) / ys.length
  const total = ys.reduce((s, y) => s + (y - mean) ** 2, 0)
  const gammaMax = input.gammaMax ?? 0.3

  let best = { omega: 0, gamma: 0, r2: Number.NEGATIVE_INFINITY }

  const tryPoint = (omega: number, gamma: number): void => {
    // least squares on the basis [e cos, e sin, 1]
    const basis = ts.map(t => {
      const e = Math.exp(-gamma * t)

      return [e * Math.cos(omega * t), e * Math.sin(omega * t), 1]
    })
    const m = [0, 1, 2].map(i => [0, 1, 2].map(j => basis.reduce((s, row) => s + (row[i] ?? 0) * (row[j] ?? 0), 0)))
    const v = [0, 1, 2].map(i => basis.reduce((s, row, n) => s + (row[i] ?? 0) * (ys[n] ?? 0), 0))
    const solution = solve3(m, v)

    if (!solution) {
      return
    }

    const residual = basis.reduce((s, row, n) => s + ((ys[n] ?? 0) - row.reduce((a, x, i) => a + x * (solution[i] ?? 0), 0)) ** 2, 0)
    const r2 = 1 - residual / total

    if (r2 > best.r2) {
      best = { omega, gamma, r2 }
    }
  }

  for (let g = 0; g <= 60; g++) {
    const gamma = (gammaMax * g) / 60

    for (let w = 1; w <= 400; w++) {
      tryPoint((Math.PI * w) / 400, gamma)
    }
  }

  // refine around the best point
  const coarse = best

  for (let g = -10; g <= 10; g++) {
    for (let w = -20; w <= 20; w++) {
      const gamma = coarse.gamma + (gammaMax / 600) * g
      const omega = coarse.omega + (Math.PI / 8000) * w

      if (gamma >= 0 && omega >= 0) {
        tryPoint(omega, gamma)
      }
    }
  }

  return best
}

function solve3(m: number[][], v: number[]): number[] | undefined {
  const a = m.map((row, i) => [...row, v[i] ?? 0])

  for (let c = 0; c < 3; c++) {
    let p = c

    for (let r = c + 1; r < 3; r++) {
      if (Math.abs(a[r]?.[c] ?? 0) > Math.abs(a[p]?.[c] ?? 0)) p = r
    }

    if (Math.abs(a[p]?.[c] ?? 0) < 1e-12) {
      return undefined
    }

    ;[a[c], a[p]] = [a[p] ?? [], a[c] ?? []]

    for (let r = 0; r < 3; r++) {
      if (r !== c) {
        const f = (a[r]?.[c] ?? 0) / (a[c]?.[c] ?? 1)

        a[r] = (a[r] ?? []).map((x, j) => x - f * (a[c]?.[j] ?? 0))
      }
    }
  }

  return [0, 1, 2].map(i => (a[i]?.[3] ?? 0) / (a[i]?.[i] ?? 1))
}

// run a scheduled collision and return the amplitude series (index 0 the start) and the final state
export function momentumWaveSeries(input: {
  will: Will
  collision: (t: number) => Collision
  beats: number
  side: number
  geometry: WaveGeometry
  mode: number
}): { series: number[]; final: Will } {
  const { collision, beats, side, geometry, mode } = input
  const mesh = input.will.mesh
  const table = streamSourceTable(mesh)

  let current: Will = { mesh, data: input.will.data.slice() }
  let scratch = makeWill(mesh)

  const series = [momentumWaveAmplitude({ will: current, side, geometry, mode })]

  for (let t = 0; t < beats; t++) {
    beatInto({ src: current, dst: scratch, table, collision: collision(t) })
    ;[current, scratch] = [scratch, current]
    series.push(momentumWaveAmplitude({ will: current, side, geometry, mode }))
  }

  return { series, final: current }
}
