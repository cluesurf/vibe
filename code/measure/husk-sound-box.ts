// A rectangular D4 box and a fast longitudinal momentum-wave reader, for sound on the husk (E-MTH-0013).
//
// A wave whose vector q has q4 = 0 lives on the husk: its Fourier amplitude is the column sum's. It needs the
// box to be long only along the axes q spans, so an axis wave runs on an L x T x T x T box, a face-diagonal
// wave on L x L x T x T and a body-diagonal one on L x L x L x T, where the transverse side T sets only the
// number of docks the wave is averaged over. The rule is the same rule on a smaller flat torus, and the
// stream copies each value one dock along, as on d4Mesh; on an L x L x L x L box every table here equals
// d4Mesh's (checked in the experiment).
//
// The start is momentum-transport's with its hash replaced by the Weyl lattice point weylCell (no generator):
// a background of tones of both signs at a fixed fill, plus carriers on lines with a component along the
// momentum, placed where the Weyl value falls under |bias sin(2 pi m q . r / L)| and pointed along the bias.

import { type Mesh } from '@/code/tool/mesh'
import { makeWill, type Will } from '@/code/tone/will'
import { type Collision } from '@/code/rule/collision'
import { beatInto, streamSourceTable } from '@/code/rule/lattice-gas'
import { rootsD4 } from '@/code/algebra/group/root-system'
import { weylCell } from '@/code/tool/weyl'

const ROOTS = rootsD4()
const OPPOSITE = ROOTS.map(r => ROOTS.findIndex(o => o.every((x, k) => x === -(r[k] ?? 0))))

export type BoxSides = readonly [number, number, number, number]

export function boxMeshD4(sides: BoxSides): Mesh {
  const [a, b, c, d] = sides
  const count = a * b * c * d
  const wrap = (v: number, n: number): number => ((v % n) + n) % n

  return {
    id: `d4-box-${sides.join('x')}`,
    degree: 24,
    cellCount: count,
    neighbour(dock, direction) {
      const x = dock % a
      const y = Math.floor(dock / a) % b
      const z = Math.floor(dock / (a * b)) % c
      const w = Math.floor(dock / (a * b * c)) % d
      const r = ROOTS[direction]!

      return wrap(x + r[0]!, a) + a * (wrap(y + r[1]!, b) + b * (wrap(z + r[2]!, c) + c * wrap(w + r[3]!, d)))
    },
    opposite(direction) {
      return OPPOSITE[direction] ?? direction
    },
  }
}

// q . r mod L per dock, L the long side (every axis q spans has side L)
export function boxSlabs(sides: BoxSides, wave: readonly number[], long: number): Int32Array {
  const [a, b, c] = sides
  const count = sides[0] * sides[1] * sides[2] * sides[3]
  const out = new Int32Array(count)

  for (let dock = 0; dock < count; dock++) {
    const r = [dock % a, Math.floor(dock / a) % b, Math.floor(dock / (a * b)) % c, Math.floor(dock / (a * b * c))]
    const s = r.reduce((sum, x, k) => sum + x * (wave[k] ?? 0), 0)

    out[dock] = ((s % long) + long) % long
  }

  return out
}

export function boxWaveStart(input: { mesh: Mesh; slabs: Int32Array; long: number; momentum: readonly number[]; fill: number; bias: number; salt: number }): Will {
  const { mesh, slabs, long, momentum, fill, bias, salt } = input
  const will = makeWill(mesh)
  const along = ROOTS.map(r => r.reduce((s, x, k) => s + x * (momentum[k] ?? 0), 0))

  for (let i = 0; i < will.data.length; i++) {
    if (weylCell(i, 1, salt) < fill) {
      will.data[i] = weylCell(i, 2, salt) < 0.5 ? -1 : 1
    }
  }

  const lines: [number, number][] = []

  for (let d = 0; d < 24; d++) {
    if (d < OPPOSITE[d]!) {
      lines.push([d, OPPOSITE[d]!])
    }
  }

  for (let dock = 0; dock < mesh.cellCount; dock++) {
    const local = bias * Math.sin((2 * Math.PI * slabs[dock]!) / long)

    lines.forEach(([d, o], line) => {
      if (along[d] === 0 || weylCell(dock, 3 + line, salt) >= Math.abs(local)) {
        return
      }

      const forward = along[d]! * local > 0 ? d : o
      const backward = forward === d ? o : d

      will.data[dock * 24 + forward] = weylCell(dock, 20 + line, salt) < 0.5 ? -1 : 1
      will.data[dock * 24 + backward] = 0
    })
  }

  return will
}

// the mode amplitude of (P . a) on sin(2 pi q . r / L), P = sum |tone| root
export function boxWaveAmplitude(input: { data: Int8Array; slabs: Int32Array; long: number; momentum: readonly number[] }): number {
  const { data, slabs, long, momentum } = input
  const along = Float64Array.from(ROOTS, r => r.reduce((s, x, k) => s + x * (momentum[k] ?? 0), 0))
  const sines = Float64Array.from({ length: long }, (_, s) => Math.sin((2 * Math.PI * s) / long))
  let amplitude = 0

  for (let dock = 0; dock < slabs.length; dock++) {
    let p = 0
    const base = dock * 24

    for (let d = 0; d < 24; d++) {
      const v = data[base + d]!

      if (v !== 0) {
        p += along[d]!
      }
    }

    amplitude += p * sines[slabs[dock]!]!
  }

  return amplitude
}

export function boxWaveSeries(input: { will: Will; slabs: Int32Array; long: number; momentum: readonly number[]; collision: (t: number) => Collision; beats: number }): number[] {
  const { slabs, long, momentum, collision, beats } = input
  const mesh = input.will.mesh
  const table = streamSourceTable(mesh)
  let current: Will = { mesh, data: input.will.data.slice() }
  let scratch = makeWill(mesh)
  const series = [boxWaveAmplitude({ data: current.data as Int8Array, slabs, long, momentum })]

  for (let t = 0; t < beats; t++) {
    beatInto({ src: current, dst: scratch, table, collision: collision(t) })
    ;[current, scratch] = [scratch, current]
    series.push(boxWaveAmplitude({ data: current.data as Int8Array, slabs, long, momentum }))
  }

  return series
}
