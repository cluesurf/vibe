// The quantitative port law: transmitted number versus packet composition. Four heavy
// quanta on separated lanes adjacent to the port, composition (N+, N-) swept from (4,0)
// to (0,4). Linearity check: far(N+,N-) =? N+ * T+ + N- * T- with T's from the pure runs.
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

const lanes = [
  [12, 4, mid, mid],
  [12, 8, 6, mid],
  [12, 16, 18, mid],
  [12, 20, 3, mid],
]

const run = (tones: number[]): number => {
  let vacuum: Will = makeWill(mesh)
  let seeded: Will = makeWill(mesh)
  let farAt12 = 0
  for (let t = 0; t < 13; t++) {
    if (t === 3) {
      tones.forEach((tone, i) => {
        if (tone === 0) return
        const slot = cellAt(lanes[i]!) * 24 + 8
        const v = seeded.data[slot]!
        seeded.data[slot] = (((v + tone + 4) % 3) - 1) as -1 | 0 | 1
      })
    }
    const active = (c: number): boolean => (slabCells.has(c) ? t >= 2 : true)
    vacuum = growingBeat(vacuum, rule(t), active)
    seeded = growingBeat(seeded, rule(t), active)
    if (t === 12) {
      for (let i = 0; i < seeded.data.length; i++) {
        if (seeded.data[i] !== vacuum.data[i]) {
          const x = coord(Math.floor(i / 24), 0)
          if (x >= 14 && x <= 20) farAt12++
        }
      }
    }
  }
  return farAt12
}

const soloPlus = run([1, 0, 0, 0])
const soloMinus = run([-1, 0, 0, 0])
console.log(`per-quantum: T+ = ${soloPlus}, T- = ${soloMinus}`)
const comps: [string, number[]][] = [
  ['4+0-', [1, 1, 1, 1]],
  ['3+1-', [1, 1, 1, -1]],
  ['2+2-', [1, 1, -1, -1]],
  ['1+3-', [1, -1, -1, -1]],
  ['0+4-', [-1, -1, -1, -1]],
]
for (const [label, tones] of comps) {
  const far = run(tones)
  const nPlus = tones.filter(t => t === 1).length
  const nMinus = tones.filter(t => t === -1).length
  const predicted = nPlus * soloPlus + nMinus * soloMinus
  console.log(`${label}: far=${far}  linear prediction=${predicted}  ${far === predicted ? 'EXACT' : `deviation ${far - predicted}`}`)
}
