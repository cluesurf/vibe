// The dressed mass from peak curvature: quasiparticle peak position omega*(k) at T=96
// (resolution 1/96), species dirs 8 and 4, k = m/12 for m in {1,2,3,4}. Peak position by
// power-weighted centroid over the central region. Incremental.
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

const peak = (dir: number, spacing: number): { wStar: number; width: number } => {
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
    for (let i = 0; i < seeded.data.length; i++) {
      const dv = seeded.data[i]! - vacuum.data[i]!
      if (dv !== 0) {
        const x = coord(Math.floor(i / 24), 0)
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
  // power spectrum over w = -12..12 (central region, quasiparticle range)
  let centroid = 0, totalP = 0, second = 0
  for (let w = -12; w <= 12; w++) {
    let re = 0, im = 0
    for (let t = 0; t < T; t++) {
      const phase = (-2 * Math.PI * w * t) / T
      re += akRe[t]! * Math.cos(phase) - akIm[t]! * Math.sin(phase)
      im += akRe[t]! * Math.sin(phase) + akIm[t]! * Math.cos(phase)
    }
    const p = re * re + im * im
    centroid += w * p
    second += w * w * p
    totalP += p
  }
  const wStar = centroid / totalP
  const width = Math.sqrt(Math.max(0, second / totalP - wStar * wStar))
  return { wStar, width }
}

for (const dir of [8, 4]) {
  for (const m of [1, 2, 3, 4]) {
    const spacing = side / m
    if (!Number.isInteger(spacing)) continue
    const { wStar, width } = peak(dir, spacing)
    // omega in cycles/beat = wStar/96; k in cycles/cell = m/12; phase velocity = omega/k cells/beat
    const vPhase = (wStar / T) / (m / side)
    console.log(`dir ${dir} k=${m}/12: omega*=${(wStar / T).toFixed(4)} cyc/beat width=${(width / T).toFixed(4)} vPhase=${vPhase.toFixed(3)} cells/beat`)
  }
}
