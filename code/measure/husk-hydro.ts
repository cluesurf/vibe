// Hydrodynamics, sound and connectivity read on the husk as well as in the bulk (E-RLT-0056, E-RLT-0057).
//
// The physics is on the husk, the flat 3D horosphere of a {3,4,3,4} cusp; the 4D bulk is the substrate. The
// projection is code/measure/photon-husk's: the depth runs along a 24-cell vertex direction, here the fourth
// axis of d4Mesh, and each husk dock is a column, the bulk docks with the same first three coordinates. A
// husk density is the column sum of the bulk density, which on the torus is the depth-constant (k4 = 0) part
// of the bulk field. So a husk wave has its wave vector and its momentum direction in the husk (both with no
// fourth component), and its amplitude is the column-summed P . a against sin(2 pi m (k . r) / L). For such a
// wave the husk amplitude equals the bulk amplitude at the same (a, k) exactly (checked in E-RLT-0056): the
// husk and the bulk differ in which waves they admit, and so in what isotropy means (among in-husk
// orientations), not in the number a given in-husk wave reads.
//
// CONNECTIVITY. Each root casts a husk direction by dropping its depth coordinate: the 12 roots with a depth
// component fall on the 3 cubic axes (weight 2, two lines each), the 12 without on the 6 face diagonals
// (weight 1). A knit's husk connectivity is the union of the husk directions a lone tone's disturbance
// touches, over every starting direction, from the line sets the bulk line-graph instrument finds, with the
// two lines of one axis counted as one husk direction.

import { type Mesh, d4Mesh } from '@/code/tool/mesh'
import { type Collision } from '@/code/rule/collision'
import { rootsD4 } from '@/code/algebra/group/root-system'
import { dampedCosineFit, type WaveGeometry } from '@/code/measure/momentum-transport'
import { decayRateFit } from '@/code/measure/shear-mode'
import { linearFit } from '@/code/measure/regression'
import { collide, streamSourceTable } from '@/code/rule/lattice-gas'
import {
  coldQuaternionBeat,
  coldQuaternionEnergy,
  emptyColdState,
  makeColdQuaternionLattice,
  type ColdQuaternionKnit,
  type ColdQuaternionState,
} from '@/code/rule/cold-quaternion-knit'

const ROOTS = rootsD4()

// a gas on d4Mesh: how to start it from tones, step it, and read its tones and energy
export type GasSystem<S> = {
  readonly name: string
  readonly make: (side: number) => {
    mesh: Mesh
    start: (vibe: Int8Array) => S
    step: (s: S, t: number) => S
    vibe: (s: S) => Int8Array
    energy: (s: S) => number
  }
}

export function coldGas(name: string, knit: () => ColdQuaternionKnit): GasSystem<ColdQuaternionState> {
  return {
    name,
    make: side => {
      const mesh = d4Mesh({ side })
      const lattice = makeColdQuaternionLattice(mesh, knit())

      return {
        mesh,
        start: vibe => ({ ...emptyColdState(mesh), vibe }),
        step: s => coldQuaternionBeat(lattice, s),
        vibe: s => s.vibe,
        energy: s => coldQuaternionEnergy(s),
      }
    },
  }
}

// a tone-only knit (a schedule of dock collisions); its energy is the tone count, reported, not kept
export function toneGas(name: string, schedule: (side: number) => (t: number) => Collision): GasSystem<Int8Array> {
  return {
    name,
    make: side => {
      const mesh = d4Mesh({ side })
      const rule = schedule(side)
      const table = streamSourceTable(mesh)

      return {
        mesh,
        start: vibe => vibe,
        step: (s, t) => {
          const will = { mesh, data: Int8Array.from(s) }

          collide(will, rule(t))

          const out = new Int8Array(s.length)

          for (let i = 0; i < out.length; i++) out[i] = will.data[table[i] ?? 0] ?? 0

          return out
        },
        vibe: s => s,
        energy: s => s.reduce((c, v) => c + Math.abs(v), 0),
      }
    },
  }
}

const dot = (a: readonly number[], b: readonly number[]): number => a.reduce((s, x, k) => s + x * (b[k] ?? 0), 0)

// the husk amplitude: column sums of P . a, against sin(2 pi m (k . r) / L), r the column's three coordinates
export function huskAmplitude(vibe: ArrayLike<number>, side: number, geometry: WaveGeometry, mode: number): number {
  const along = ROOTS.map(r => dot(r, geometry.momentum))
  const columns = new Float64Array(side ** 3)
  const docks = side ** 4

  for (let x = 0; x < docks; x++) {
    let p = 0

    for (let d = 0; d < 24; d++) p += Math.abs(vibe[x * 24 + d] ?? 0) * (along[d] ?? 0)

    columns[x % side ** 3] = (columns[x % side ** 3] ?? 0) + p
  }

  let amplitude = 0

  for (let c = 0; c < side ** 3; c++) {
    const r = [c % side, Math.floor(c / side) % side, Math.floor(c / side ** 2)]
    const phase = (2 * Math.PI * mode * (((dot(geometry.wave, r) % side) + side) % side)) / side

    amplitude += (columns[c] ?? 0) * Math.sin(phase)
  }

  return amplitude
}

// the bulk amplitude of code/measure/momentum-transport, on d4Mesh's integer torus
export function bulkAmplitude(vibe: ArrayLike<number>, side: number, geometry: WaveGeometry, mode: number): number {
  const along = ROOTS.map(r => dot(r, geometry.momentum))
  let amplitude = 0

  for (let x = 0; x < side ** 4; x++) {
    let p = 0

    for (let d = 0; d < 24; d++) p += Math.abs(vibe[x * 24 + d] ?? 0) * (along[d] ?? 0)

    const r = [0, 1, 2, 3].map(k => Math.floor(x / side ** k) % side)

    amplitude += p * Math.sin((2 * Math.PI * mode * (((dot(geometry.wave, r) % side) + side) % side)) / side)
  }

  return amplitude
}

// DETERMINISTIC FILLS. No random numbers and no seeds: every choice is a Weyl sequence, frac((n + 1) alpha) with
// alpha the fractional part of the square root of a prime, one prime per kind of choice.
const WEYL = [2, 3, 5, 7, 11, 13, 17, 19].map(p => Math.sqrt(p) % 1)

export const weyl = (n: number, kind: number): number => ((n + 1) * (WEYL[kind % WEYL.length] ?? 0.4142135623730951)) % 1

// a deterministic stream for sampling states: the n-th draw is weyl(n, kind), n counting up
export function weylStream(kind: number): () => number {
  let n = 0

  return () => weyl(n++, kind)
}

// code/measure/momentum-transport momentumWaveStart with its hash replaced by Weyl sequences: a background
// of tones of both signs at the given fill, plus lone carriers on lines with a component along a, placed where
// the Weyl value is under |bias sin(2 pi m (q . r) / L)| and pointed along the sign of the bias
export function weylWaveStart(input: { mesh: Mesh; side: number; geometry: WaveGeometry; mode: number; fill: number; bias: number }): Int8Array {
  const { mesh, side, geometry, mode, fill, bias } = input
  const data = new Int8Array(mesh.cellCount * 24)

  for (let i = 0; i < data.length; i++) {
    if (weyl(i, 0) < fill) data[i] = weyl(i, 1) < 0.5 ? -1 : 1
  }

  const lines: [number, number][] = []

  for (let d = 0; d < 24; d++) {
    const o = mesh.opposite(d)

    if (d < o) lines.push([d, o])
  }

  for (let x = 0; x < mesh.cellCount; x++) {
    const r = [0, 1, 2, 3].map(k => Math.floor(x / side ** k) % side)
    const local = bias * Math.sin((2 * Math.PI * mode * (((dot(geometry.wave, r) % side) + side) % side)) / side)

    lines.forEach(([d, o], line) => {
      const along = dot(ROOTS[d] ?? [], geometry.momentum)

      if (along === 0 || weyl(x * 12 + line, 2) >= Math.abs(local)) return

      const forward = along * local > 0 ? d : o

      data[x * 24 + forward] = weyl(x * 12 + line, 3) < 0.5 ? -1 : 1
      data[x * 24 + (forward === d ? o : d)] = 0
    })
  }

  return data
}

export type WaveRun = { side: number; mode: number; k: number; series: number[]; energyExact: boolean; huskEqualsBulk: boolean }

// one wave run (fill 0.2, bias 0.4 as E-FLD-0032, Weyl-placed), read in the husk when the geometry lies in it
export function waveRun<S>(system: GasSystem<S>, side: number, geometry: WaveGeometry, beats: number, mode = 1): WaveRun {
  const gas = system.make(side)
  let s = gas.start(weylWaveStart({ mesh: gas.mesh, side, geometry, mode, fill: 0.2, bias: 0.4 }))
  const e0 = gas.energy(s)
  const inHusk = (geometry.momentum[3] ?? 0) === 0 && (geometry.wave[3] ?? 0) === 0
  const read = (v: ArrayLike<number>): number => (inHusk ? huskAmplitude(v, side, geometry, mode) : bulkAmplitude(v, side, geometry, mode))
  const series = [read(gas.vibe(s))]
  let huskEqualsBulk = true

  for (let t = 0; t < beats; t++) {
    s = gas.step(s, t)

    const v = gas.vibe(s)
    const a = read(v)

    if (inHusk && t % 20 === 0) huskEqualsBulk = huskEqualsBulk && Math.abs(a - bulkAmplitude(v, side, geometry, mode)) < 1e-6 * (1 + Math.abs(a))

    series.push(a)
  }

  return { side, mode, k: (2 * Math.PI * mode * Math.hypot(...geometry.wave)) / side, series, energyExact: gas.energy(s) === e0, huskEqualsBulk }
}

export type ShearReading = { nu: number; gamma: number; r2: number; left: number } & WaveRun
export type SoundReading = { speed: number; gamma: number; r2: number; oscillates: boolean } & WaveRun

export function shearRun<S>(system: GasSystem<S>, side: number, geometry: WaveGeometry, mode = 1): ShearReading {
  const w = waveRun(system, side, geometry, 60, mode)
  const fit = decayRateFit({ series: w.series })

  return { ...w, nu: fit.gamma / (w.k * w.k), gamma: fit.gamma, r2: fit.r2, left: (w.series[w.series.length - 1] ?? 0) / (w.series[0] || 1) }
}

export function soundRun<S>(system: GasSystem<S>, side: number, geometry: WaveGeometry): SoundReading {
  const w = waveRun(system, side, geometry, 144)
  const s0 = w.series[0] || 1
  const fit = dampedCosineFit({ series: w.series.map(x => x / s0) })

  return { ...w, speed: fit.omega / w.k, gamma: fit.gamma, r2: fit.r2, oscillates: fit.omega > fit.gamma && fit.r2 > 0.9 }
}

// in-husk shear orientations (momentum, wave), depth along the fourth axis
export const HUSK_SHEARS: readonly (readonly [string, WaveGeometry])[] = [
  ['axes01', { momentum: [1, 0, 0, 0], wave: [0, 1, 0, 0] }],
  ['axes12', { momentum: [0, 1, 0, 0], wave: [0, 0, 1, 0] }],
  ['axes20', { momentum: [0, 0, 1, 0], wave: [1, 0, 0, 0] }],
  ['axes10', { momentum: [0, 1, 0, 0], wave: [1, 0, 0, 0] }],
  ['diagonal01', { momentum: [1, 1, 0, 0], wave: [1, -1, 0, 0] }],
  ['diagonal12', { momentum: [0, 1, 1, 0], wave: [0, 1, -1, 0] }],
]

// bulk-only shear orientations (one of the two vectors along the depth)
export const BULK_SHEARS: readonly (readonly [string, WaveGeometry])[] = [
  ['axes23', { momentum: [0, 0, 1, 0], wave: [0, 0, 0, 1] }],
  ['axes30', { momentum: [0, 0, 0, 1], wave: [1, 0, 0, 0] }],
  ['diagonal23', { momentum: [0, 0, 1, 1], wave: [0, 0, 1, -1] }],
]

export const HUSK_SOUNDS: readonly (readonly [string, WaveGeometry])[] = [
  ['axis0', { momentum: [1, 0, 0, 0], wave: [1, 0, 0, 0] }],
  ['axis1', { momentum: [0, 1, 0, 0], wave: [0, 1, 0, 0] }],
  ['axis2', { momentum: [0, 0, 1, 0], wave: [0, 0, 1, 0] }],
  ['diagonal01', { momentum: [1, 1, 0, 0], wave: [1, 1, 0, 0] }],
]

const SIDES = [12, 16, 20, 24]

export type HydroBattery = {
  // per husk orientation, the shear at L = 12, 16, 20, 24: nu, r2, fraction left, and the law's verdict
  readonly husk: { name: string; runs: ShearReading[]; nuSpread: number; exponent: number; law: boolean }[]
  // bulk-only orientations at L = 16
  readonly bulk: { name: string; run: ShearReading }[]
  // sound along the husk directions at L = 16, 20, 24, speed extrapolated to k = 0 in k^2
  readonly sound: { name: string; runs: SoundReading[]; speedAtZero: number }[]
  // spread of nu over the husk orientations at L = 16 (max over min; infinite if any is not positive)
  readonly huskNuSpread: number
  readonly huskSpeedSpread: number
  readonly energyExact: boolean
  readonly huskEqualsBulk: boolean
}

export function hydroBattery<S>(system: GasSystem<S>): HydroBattery {
  const husk = HUSK_SHEARS.map(([name, geometry]) => {
    const runs = SIDES.map(side => shearRun(system, side, geometry))
    const nus = runs.map(r => r.nu)
    const nuSpread = Math.min(...nus) > 0 ? Math.max(...nus) / Math.min(...nus) : Number.POSITIVE_INFINITY
    const fit = linearFit({ xs: runs.map(r => Math.log(r.k)), ys: runs.map(r => Math.log(Math.max(1e-12, r.gamma))) })
    const law = nuSpread <= 1.1 && runs.every(r => r.r2 > 0.99) && Math.abs(fit.slope - 2) <= 0.2

    return { name, runs, nuSpread, exponent: fit.slope, law }
  })
  const bulk = BULK_SHEARS.map(([name, geometry]) => ({ name, run: shearRun(system, 16, geometry) }))
  const sound = HUSK_SOUNDS.map(([name, geometry]) => {
    const runs = [16, 20, 24].map(side => soundRun(system, side, geometry))
    const fit = linearFit({ xs: runs.map(r => r.k * r.k), ys: runs.map(r => r.speed) })

    return { name, runs, speedAtZero: fit.intercept }
  })
  const at16 = husk.map(h => h.runs[1]?.nu ?? 0)
  const speeds = sound.map(s => s.runs[0]?.speed ?? 0)

  return {
    husk,
    bulk,
    sound,
    huskNuSpread: Math.min(...at16) > 0 ? Math.max(...at16) / Math.min(...at16) : Number.POSITIVE_INFINITY,
    huskSpeedSpread: Math.max(...speeds) / Math.min(...speeds),
    energyExact: [...husk.flatMap(h => h.runs), ...bulk.map(b => b.run), ...sound.flatMap(s => s.runs)].every(r => r.energyExact),
    huskEqualsBulk: [...husk.flatMap(h => h.runs), ...sound.flatMap(s => s.runs)].every(r => r.huskEqualsBulk),
  }
}

// the battery flattened to metrics under a prefix
export function hydroMetrics(prefix: string, b: HydroBattery): Record<string, number> {
  const out: Record<string, number> = {}

  for (const h of b.husk) {
    h.runs.forEach(r => {
      out[`${prefix}HuskShear_${h.name}_L${r.side}_nu`] = r.nu
      out[`${prefix}HuskShear_${h.name}_L${r.side}_r2`] = r.r2
      out[`${prefix}HuskShear_${h.name}_L${r.side}_left`] = r.left
    })
    out[`${prefix}HuskShear_${h.name}_nuSpread`] = h.nuSpread
    out[`${prefix}HuskShear_${h.name}_exponent`] = h.exponent
    out[`${prefix}HuskShear_${h.name}_law`] = h.law ? 1 : 0
  }

  for (const x of b.bulk) {
    out[`${prefix}BulkShear_${x.name}_L16_nu`] = x.run.nu
    out[`${prefix}BulkShear_${x.name}_L16_r2`] = x.run.r2
    out[`${prefix}BulkShear_${x.name}_L16_left`] = x.run.left
  }

  for (const s of b.sound) {
    s.runs.forEach(r => {
      out[`${prefix}HuskSound_${s.name}_L${r.side}_speed`] = r.speed
      out[`${prefix}HuskSound_${s.name}_L${r.side}_oscillates`] = r.oscillates ? 1 : 0
    })
    out[`${prefix}HuskSound_${s.name}_speedAtZeroK`] = s.speedAtZero
  }

  out[`${prefix}HuskNuSpreadL16`] = b.huskNuSpread
  out[`${prefix}HuskSpeedSpreadL16`] = b.huskSpeedSpread
  out[`${prefix}EnergyExactEveryRun`] = b.energyExact ? 1 : 0
  out[`${prefix}HuskEqualsBulkForInHuskWaves`] = b.huskEqualsBulk ? 1 : 0

  return out
}

// the husk direction (0..8: three axes, then six face diagonals) each line casts, depth the fourth axis
export const HUSK_DIRECTION_OF_LINE: readonly number[] = (() => {
  const opposite = ROOTS.map(r => ROOTS.findIndex(o => o.every((x, k) => x === -(r[k] ?? 0))))
  const firsts = ROOTS.map((_, d) => d).filter(d => d < (opposite[d] ?? d))
  const keys: string[] = []

  return firsts.map(d => {
    const r = ROOTS[d] ?? []
    const s = [r[0] ?? 0, r[1] ?? 0, r[2] ?? 0]
    const lead = s.find(x => x !== 0) ?? 1
    const k = s.map(x => x * lead).join(',')
    const axis = (r[3] ?? 0) !== 0

    if (!keys.includes(k)) keys.push(k)

    return axis ? s.findIndex(x => x !== 0) : 3 + keys.filter(x => x.split(',').filter(y => y !== '0').length === 2).indexOf(k)
  })
})()

// the line sectors of a cold knit, as code/measure/weave-acceptance reads them for a tone-only one: side-5 box,
// every direction of the center flipped, 24 beats, the lines where the flipped run differs in a tone or a
// store, joined with the flipped line; on the empty vacuum or on the dense background of that instrument
export function coldLineSectors(knit: ColdQuaternionKnit, dense: boolean, boxMesh: Mesh): number[][] {
  const lattice = makeColdQuaternionLattice(boxMesh, knit)
  const opposite = ROOTS.map(r => ROOTS.findIndex(o => o.every((x, k) => x === -(r[k] ?? 0))))
  const lineOf = ROOTS.map((_, d) => ROOTS.map((__, e) => e).filter(e => e < (opposite[e] ?? e)).indexOf(Math.min(d, opposite[d] ?? d)))
  const center = 2 * (1 + 5 + 25 + 125)
  const background = emptyColdState(boxMesh)
  const golden = (Math.sqrt(5) - 1) / 2

  if (dense) {
    for (let i = 0; i < background.vibe.length; i++) {
      const u = ((i + 1) * golden * 1.37) % 1

      background.vibe[i] = u < 0.2 ? -1 : u < 0.8 ? 0 : 1
    }
  }

  const parent = Array.from({ length: 12 }, (_, i) => i)
  const find = (x: number): number => (parent[x] === x ? x : (parent[x] = find(parent[x] ?? x)))
  const copy = (s: ColdQuaternionState): ColdQuaternionState => ({ vibe: Int8Array.from(s.vibe), store: Int32Array.from(s.store), counter: Int32Array.from(s.counter) })

  for (let direction = 0; direction < 24; direction++) {
    let a = copy(background)
    let b = copy(background)
    const slot = center * 24 + direction
    const touched = new Set<number>()

    b.vibe[slot] = b.vibe[slot] === 1 ? -1 : 1

    for (let t = 0; t < 24; t++) {
      a = coldQuaternionBeat(lattice, a)
      b = coldQuaternionBeat(lattice, b)

      for (let i = 0; i < a.vibe.length; i++) {
        if (a.vibe[i] !== b.vibe[i] || a.store[i] !== b.store[i]) touched.add(lineOf[i % 24] ?? 0)
      }
    }

    for (const line of touched) parent[find(line)] = find(lineOf[direction] ?? 0)
  }

  const sectors = new Map<number, number[]>()

  for (let l = 0; l < 12; l++) sectors.set(find(l), [...(sectors.get(find(l)) ?? []), l])

  return [...sectors.values()]
}

// husk components from bulk line sectors (unions of lines): lines casting one husk direction are one
export function huskComponents(sectors: readonly (readonly number[])[]): number {
  const parent = Array.from({ length: 9 }, (_, i) => i)
  const find = (x: number): number => (parent[x] === x ? x : (parent[x] = find(parent[x] ?? x)))

  for (const s of sectors) {
    const first = HUSK_DIRECTION_OF_LINE[s[0] ?? 0] ?? 0

    for (const l of s) parent[find(HUSK_DIRECTION_OF_LINE[l] ?? 0)] = find(first)
  }

  return new Set(Array.from({ length: 9 }, (_, i) => find(i))).size
}
