// The spectral function A(k, omega) of the dressed species: full omega spectrum per k,
// T = 48 beats, looking for the two-branch structure (quasiparticle ridge near k v,
// radiation ridge near k c). Also dir 0 as the single-branch control. Incremental.
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
const T = 48

const measure = (dir: number, label: string): void => {
  for (const d of [3, 4, 6]) {
    const mFund = side / d
    let vacuum: Will = makeWill(mesh)
    let seeded: Will = makeWill(mesh)
    for (let x = 0; x < side; x += d) {
      seeded.data[cellAt([x, 0, mid, mid]) * 24 + dir] = 1
    }
    const Ak = { re: [] as number[], im: [] as number[] }
    for (let t = 0; t < T; t++) {
      vacuum = beat(vacuum, rule(t % 24))
      seeded = beat(seeded, rule(t % 24))
      let re = 0, im = 0
      for (let i = 0; i < seeded.data.length; i++) {
        const dv = seeded.data[i]! - vacuum.data[i]!
        if (dv !== 0) {
          const cell = Math.floor(i / 24)
          const x = coord(cell, 0)
          const angle = (2 * Math.PI * (((dv % 3) + 3) % 3)) / 3
          const fre = Math.cos(angle) - 1
          const fim = Math.sin(angle)
          const phase = (-2 * Math.PI * mFund * x) / side
          const c = Math.cos(phase), s = Math.sin(phase)
          re += fre * c - fim * s
          im += fre * s + fim * c
        }
      }
      Ak.re.push(re)
      Ak.im.push(im)
    }
    const powers: number[] = []
    let total = 0
    for (let w = -T / 2; w <= T / 2; w++) {
      let re = 0, im = 0
      for (let t = 0; t < T; t++) {
        const phase = (-2 * Math.PI * w * t) / T
        re += Ak.re[t]! * Math.cos(phase) - Ak.im[t]! * Math.sin(phase)
        im += Ak.re[t]! * Math.sin(phase) + Ak.im[t]! * Math.cos(phase)
      }
      const p = re * re + im * im
      powers.push(p)
      total += p
    }
    const ridge: string[] = []
    powers.forEach((p, i) => {
      const w = i - T / 2
      const share = p / (total || 1)
      if (share > 0.05) ridge.push(`w${w}/48:${(share * 100).toFixed(0)}%`)
    })
    console.log(`${label} k=${mFund}/12: ${ridge.join(' ')}`)
  }
}

measure(0, 'massless')
measure(4, 'dressed ')
measure(8, 'heavy   ')
