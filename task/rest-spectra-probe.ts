// The dispersion programme, part one:
// (a) rest frequencies of the at-rest species (dirs 20..23): temporal spectrum of the
//     difference field over 48 beats at side 9, power at frequencies m/24 (m = 0..12).
// (b) omega(k) for the massless protected species (dir 0) and a slow species (dir 4):
//     seed a comb along the motion axis, track the complex spatial mode A_k(t), extract
//     the temporal frequency. Incremental printing.
import { d4Mesh, meshOpposites } from '@/code/tool/mesh'
import { makeWill, Will } from '@/code/tone/will'
import { beat } from '@/code/rule/lattice-gas'
import { turningWeave } from '@/code/rule/collision'

const side = 9
const mesh = d4Mesh({ side })
const opposite = meshOpposites(mesh)
const rule = turningWeave({ opposite })
const mid = 4
const center = mid + mid * side + mid * side * side + mid * side ** 3
const T = 48

// (a) rest spectra
for (const dir of [20, 21, 22, 23]) {
  let vacuum: Will = makeWill(mesh)
  let seeded: Will = makeWill(mesh)
  seeded.data[center * 24 + dir] = 1
  const series = new Map<number, { re: number[]; im: number[] }>()
  for (let t = 0; t < T; t++) {
    vacuum = beat(vacuum, rule(t % 24))
    seeded = beat(seeded, rule(t % 24))
    for (let i = 0; i < seeded.data.length; i++) {
      const dv = seeded.data[i]! - vacuum.data[i]!
      if (dv !== 0 || series.has(i)) {
        if (!series.has(i)) series.set(i, { re: new Array(T).fill(0), im: new Array(T).fill(0) })
        const s = series.get(i)!
        const angle = (2 * Math.PI * (((dv % 3) + 3) % 3)) / 3
        s.re[t] = Math.cos(angle) - 1
        s.im[t] = Math.sin(angle)
      }
    }
  }
  const powers: string[] = []
  for (let m = 0; m <= 12; m++) {
    const f = m / 24
    let power = 0
    for (const s of series.values()) {
      let re = 0, im = 0
      for (let t = 0; t < T; t++) {
        const c = Math.cos(2 * Math.PI * f * t)
        const w = -Math.sin(2 * Math.PI * f * t)
        re += s.re[t]! * c - s.im[t]! * w
        im += s.re[t]! * w + s.im[t]! * c
      }
      power += (re * re + im * im) / (T * T)
    }
    if (power > 1e-6) powers.push(`f=${m}/24(E=${(m / 24 * 3).toFixed(2)}):${power.toFixed(3)}`)
  }
  console.log(`dir ${dir} rest spectrum: ${powers.join(' ')}`)
}
