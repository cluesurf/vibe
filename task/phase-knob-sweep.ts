// The phase-knob search for the dressed species: single slab at x=8 (born at offset o),
// dressed dir 8 seeded at x=6 t=3, readout t=16: total difference number and net clock
// amplitude (magnitude at phase) versus the no-slab baseline. Wanted: offsets that change
// the PHASE while leaving the number at baseline. Incremental printing.
import { d4Mesh, meshOpposites } from '@/code/tool/mesh'
import { makeWill, Will } from '@/code/tone/will'
import { growingBeat } from '@/code/rule/lattice-gas'
import { turningWeave } from '@/code/rule/collision'
import { clockAmplitude, phaseDegrees } from '@/code/measure/clock-amplitude'
import { pairSub } from '@/code/algebra/linear/complex-pair'

const side = 17
const mesh = d4Mesh({ side })
const opposite = meshOpposites(mesh)
const rule = turningWeave({ opposite })
const coord = (c: number, a: number): number => Math.floor(c / side ** a) % side
const mid = 8

const run = (offset: number | null): string => {
  const slab = new Set<number>()
  if (offset !== null) for (let c = 0; c < mesh.cellCount; c++) if (coord(c, 0) === 8) slab.add(c)
  let vacuum: Will = makeWill(mesh)
  let seeded: Will = makeWill(mesh)
  for (let t = 0; t < 17; t++) {
    if (t === 3) {
      const slot = (6 + 4 * side + mid * side * side + mid * side ** 3) * 24 + 8
      const v = seeded.data[slot]!
      seeded.data[slot] = (((v + 1 + 4) % 3) - 1) as -1 | 0 | 1
    }
    const active = (c: number): boolean => (slab.has(c) && offset !== null ? t >= offset : true)
    vacuum = growingBeat(vacuum, rule(t), active)
    seeded = growingBeat(seeded, rule(t), active)
  }
  let n = 0
  for (let i = 0; i < seeded.data.length; i++) if (seeded.data[i] !== vacuum.data[i]) n++
  const d = pairSub(clockAmplitude(seeded), clockAmplitude(vacuum))
  const m = Math.hypot(d[0], d[1])
  return `n=${n} amp=${m.toFixed(3)}@${m > 1e-9 ? Math.round(phaseDegrees([d[0], d[1]])) : '--'}`
}

console.log(`no slab : ${run(null)}`)
for (const o of [1, 2, 3, 5, 7, 9, 11, 13, 15, 17, 19, 21]) {
  console.log(`offset ${String(o).padStart(2)}: ${run(o)}`)
}
