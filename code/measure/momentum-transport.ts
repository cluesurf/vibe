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

function position(cell: number, side: number): number[] {
  return [0, 1, 2, 3].map(k => Math.floor(cell / side ** k) % side)
}

// the slab of a dock, q . r mod L
export function slabOf(cell: number, side: number, wave: readonly number[]): number {
  const s = dot(wave, position(cell, side))

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

  for (let cell = 0; cell < mesh.cellCount; cell++) {
    const local = bias * Math.sin((2 * Math.PI * mode * slabOf(cell, side, geometry.wave)) / side)

    lines.forEach(([d, o], line) => {
      const along = dot(ROOTS[d] ?? [], geometry.momentum)

      if (along === 0 || hashRand(cell, 3 + line, salt) >= Math.abs(local)) {
        return
      }

      const forward = along * local > 0 ? d : o
      const backward = forward === d ? o : d

      will.data[cell * 24 + forward] = hashRand(cell, 20 + line, salt) < 0.5 ? -1 : 1
      will.data[cell * 24 + backward] = 0
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

  for (let cell = 0; cell < will.mesh.cellCount; cell++) {
    let p = 0

    for (let d = 0; d < 24; d++) {
      p += Math.abs(will.data[cell * 24 + d] ?? 0) * (along[d] ?? 0)
    }

    amplitude += p * (sines[slabOf(cell, side, geometry.wave)] ?? 0)
  }

  return amplitude
}

// the (P . a) per slab carried on lines perpendicular to q, the invariant of a line-keeping rule
export function perpendicularSlabs(input: { will: Will; side: number; geometry: WaveGeometry }): number[] {
  const { will, side, geometry } = input
  const weight = ROOTS.map(r => (dot(r, geometry.wave) === 0 ? dot(r, geometry.momentum) : 0))
  const slabs = new Array<number>(side).fill(0)

  for (let cell = 0; cell < will.mesh.cellCount; cell++) {
    const s = slabOf(cell, side, geometry.wave)

    for (let d = 0; d < 24; d++) {
      slabs[s] = (slabs[s] ?? 0) + Math.abs(will.data[cell * 24 + d] ?? 0) * (weight[d] ?? 0)
    }
  }

  return slabs
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
