// Like-for-like kappa: refit the mid-decay profiles over the CENTRAL 60 percent of the
// channel only (the Sulpizio et al. protocol), extract kappa = -(a2/a0)(W/2)^2 with W the
// full bulk width, per channel width. Incremental printing.
import { d4Mesh, meshOpposites } from '@/code/tool/mesh'
import { rootsD4 } from '@/code/algebra/group/root-system'
import { saturatedViscousRotate } from '@/code/rule/viscous-collision'
import { slotReversal, channelCollision } from '@/code/rule/channel'
import { plugSetup, channelDecaySeries } from '@/code/measure/hydrodynamics'

const coordAlong = (cell: number, axis: number, side: number): number =>
  Math.floor(cell / side ** axis) % side

for (const side of [12, 16, 20]) {
  const mesh = d4Mesh({ side })
  const directions = rootsD4()
  const opposite = meshOpposites(mesh)
  const bulk = saturatedViscousRotate({ directions })
  const isWall = (cell: number): boolean => {
    const y = coordAlong(cell, 1, side)
    return y === 0 || y === side - 1
  }
  const thermal = (cell: number, line: number): boolean => {
    const x = coordAlong(cell, 0, side)
    const z = coordAlong(cell, 2, side)
    const w = coordAlong(cell, 3, side)
    return (x + 2 * z + 3 * w + line) % 3 === 0
  }
  const will = plugSetup({ mesh, directions, momAxis: 0, isWall, thermal })
  const collision = channelCollision({ bulk, wall: slotReversal({ opposite }), isWall })
  const { profiles } = channelDecaySeries({
    will, collision, beats: 140, directions, side, gradAxis: 1, momAxis: 0,
  })
  const bulkTotal = (p: number[]): number => {
    let s = 0
    for (let y = 1; y < side - 1; y++) s += p[y]!
    return s
  }
  let midBeat = -1
  for (let t = 1; t < profiles.length; t++) {
    if (Math.abs(bulkTotal(profiles[t]!)) <= 0.5 * Math.abs(bulkTotal(profiles[0]!))) { midBeat = t; break }
  }
  const p = profiles[midBeat]!
  const W = side - 2
  const centerY = (side - 1) / 2
  // central 60 percent: |y - center| <= 0.3 W
  const ys: number[] = []
  const vs: number[] = []
  for (let y = 1; y < side - 1; y++) {
    if (Math.abs(y - centerY) <= 0.3 * W) { ys.push(y - centerY); vs.push(p[y]!) }
  }
  let s0 = 0, s2 = 0, s4 = 0, b0 = 0, b2 = 0
  for (let i = 0; i < ys.length; i++) {
    const x = ys[i]!, v = vs[i]!
    s0 += 1; s2 += x * x; s4 += x ** 4
    b0 += v; b2 += x * x * v
  }
  const det = s0 * s4 - s2 * s2
  const a0 = (s4 * b0 - s2 * b2) / det
  const a2 = (s0 * b2 - s2 * b0) / det
  const kappa = -(a2 / a0) * (W / 2) ** 2
  console.log(`width ${W}: midBeat=${midBeat} pointsInFit=${ys.length} kappa=${kappa.toFixed(3)}`)
}
