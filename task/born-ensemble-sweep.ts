// Born as ensemble over the vacuum clock: one heavy packet, prepared at seed beats 3..26
// (a full schedule period of preparation phases), fixed readout 9 beats after seeding.
// If the transmitted number varies with preparation phase, single-particle probabilities
// are frequencies over the clock ensemble, with the vacuum phase the hidden variable.
import { d4Mesh, meshOpposites } from '@/code/tool/mesh'
import { makeWill, Will } from '@/code/tone/will'
import { growingBeat } from '@/code/rule/lattice-gas'
import { turningWeave } from '@/code/rule/collision'

const side = 25
const mesh = d4Mesh({ side })
const opposite = meshOpposites(mesh)
const rule = turningWeave({ opposite })
const coord = (c: number, a: number): number => Math.floor(c / side ** a) % side
const cellAt = (v: number[]): number => v[0]! + v[1]! * side + v[2]! * side * side + v[3]! * side ** 3
const mid = 12

const slabCells = new Set<number>()
for (let c = 0; c < mesh.cellCount; c++) if (coord(c, 0) === 13) slabCells.add(c)

const run = (seedBeat: number, tone: number): number => {
  let vacuum: Will = makeWill(mesh)
  let seeded: Will = makeWill(mesh)
  const readout = seedBeat + 9
  let far = 0
  for (let t = 0; t <= readout; t++) {
    if (t === seedBeat) {
      const slot = cellAt([12, 4, mid, mid]) * 24 + 8
      const v = seeded.data[slot]!
      seeded.data[slot] = (((v + tone + 4) % 3) - 1) as -1 | 0 | 1
    }
    const active = (c: number): boolean => (slabCells.has(c) ? t >= 2 : true)
    vacuum = growingBeat(vacuum, rule(t), active)
    seeded = growingBeat(seeded, rule(t), active)
    if (t === readout) {
      for (let i = 0; i < seeded.data.length; i++) {
        if (seeded.data[i] !== vacuum.data[i]) {
          const x = coord(Math.floor(i / 24), 0)
          if (x >= 14 && x <= 20) far++
        }
      }
    }
  }
  return far
}

const plusSeries: number[] = []
const minusSeries: number[] = []
for (let seedBeat = 3; seedBeat < 27; seedBeat++) {
  plusSeries.push(run(seedBeat, 1))
  minusSeries.push(run(seedBeat, -1))
}
console.log('plus  transmitted by prep beat 3..26:', plusSeries.join(' '))
console.log('minus transmitted by prep beat 3..26:', minusSeries.join(' '))
const stats = (xs: number[]): string => {
  const mean = xs.reduce((a, b) => a + b, 0) / xs.length
  const hist = new Map<number, number>()
  for (const x of xs) hist.set(x, (hist.get(x) ?? 0) + 1)
  const h = [...hist.entries()].sort((a, b) => a[0] - b[0]).map(([v, n]) => `${v}:${n}`).join(' ')
  return `mean=${mean.toFixed(2)} histogram {${h}}`
}
console.log('plus ', stats(plusSeries))
console.log('minus', stats(minusSeries))
