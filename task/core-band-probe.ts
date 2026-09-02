// Core-weighted omega(k): project A_k on the SEEDED SLOT only (the coherent core), not
// the whole difference field, T = 96. Species dirs 8 and 4, massless dir 0 sanity.
import { d4Mesh, meshOpposites } from '@/code/tool/mesh'
import { makeWill, Will } from '@/code/tone/will'
import { beat } from '@/code/rule/lattice-gas'
import { turningWeave } from '@/code/rule/collision'

const side = 12
const mesh = d4Mesh({ side })
const opposite = meshOpposites(mesh)
const rule = turningWeave({ opposite })
const coord = (c: number, a: number): number => Math.floor(c / side ** a) % side
const cellAt = (v: number[]): number => v[0]! + v[1]! * side + v[2]! * side * side + v[3]! * side ** 3
const mid = 6
const T = 96

const peak = (dir: number, spacing: number): { wStar: number; share: number } => {
  const mFund = side / spacing
  let vacuum: Will = makeWill(mesh)
  let seeded: Will = makeWill(mesh)
  for (let x = 0; x < side; x += spacing) {
    seeded.data[cellAt([x, 0, mid, mid]) * 24 + dir] = 1
  }
  const akRe: number[] = [], akIm: number[] = []
  for (let t = 0; t < T; t++) {
    vacuum = beat(vacuum, rule(t % 24))
    seeded = beat(seeded, rule(t % 24))
    let re = 0, im = 0
    for (let cell = 0; cell < mesh.cellCount; cell++) {
      const i = cell * 24 + dir
      const dv = seeded.data[i]! - vacuum.data[i]!
      if (dv !== 0) {
        const x = coord(cell, 0)
        const angle = (2 * Math.PI * (((dv % 3) + 3) % 3)) / 3
        const fre = Math.cos(angle) - 1, fim = Math.sin(angle)
        const phase = (-2 * Math.PI * mFund * x) / side
        const c = Math.cos(phase), s = Math.sin(phase)
        re += fre * c - fim * s
        im += fre * s + fim * c
      }
    }
    akRe.push(re); akIm.push(im)
  }
  let bestW = 0, bestP = 0, total = 0
  for (let w = -T / 2; w < T / 2; w++) {
    let re = 0, im = 0
    for (let t = 0; t < T; t++) {
      const phase = (-2 * Math.PI * w * t) / T
      re += akRe[t]! * Math.cos(phase) - akIm[t]! * Math.sin(phase)
      im += akRe[t]! * Math.sin(phase) + akIm[t]! * Math.cos(phase)
    }
    const p = re * re + im * im
    total += p
    if (p > bestP) { bestP = p; bestW = w }
  }
  return { wStar: bestW, share: bestP / (total || 1) }
}

for (const dir of [0, 8, 4]) {
  for (const m of [1, 2, 3, 4]) {
    const spacing = side / m
    if (!Number.isInteger(spacing)) continue
    const { wStar, share } = peak(dir, spacing)
    const vPhase = (wStar / T) / (m / side)
    console.log(`dir ${String(dir).padStart(2)} k=${m}/12: w*=${wStar}/96 share=${share.toFixed(2)} vPhase=${vPhase.toFixed(3)}`)
  }
}
