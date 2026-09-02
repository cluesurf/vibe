// The graphene registered prediction: the Poiseuille profile shape versus channel width
// in the model's viscous regime. For each width, the mid-decay velocity profile, its
// centerline-to-mean ratio, and its parabola-fit quality. Incremental printing.
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
  const interior = p.slice(1, side - 1)
  const mean = interior.reduce((a, b) => a + b, 0) / interior.length
  const centerIdx = Math.floor(interior.length / 2)
  const center = interior.length % 2 === 0
    ? (interior[centerIdx - 1]! + interior[centerIdx]!) / 2
    : interior[centerIdx]!
  // parabola fit v(y) = a(1 - ((y - c)/h)^2): R^2 against best least-squares parabola
  const n = interior.length
  const xs = interior.map((_, i) => i - (n - 1) / 2)
  const X = xs.map(x => [1, x, x * x])
  // normal equations for quadratic fit
  let s0 = 0, s1 = 0, s2 = 0, s3 = 0, s4 = 0, b0 = 0, b1 = 0, b2 = 0
  for (let i = 0; i < n; i++) {
    const x = xs[i]!, y = interior[i]!
    s0 += 1; s1 += x; s2 += x * x; s3 += x ** 3; s4 += x ** 4
    b0 += y; b1 += x * y; b2 += x * x * y
  }
  // solve 3x3 (symmetric, s1=s3=0 by symmetry of xs)
  const det = s0 * s4 - s2 * s2
  const a0 = (s4 * b0 - s2 * b2) / det
  const a2 = (s0 * b2 - s2 * b0) / det
  const a1 = b1 / s2
  let ssRes = 0, ssTot = 0
  for (let i = 0; i < n; i++) {
    const x = xs[i]!, y = interior[i]!
    const fit = a0 + a1 * x + a2 * x * x
    ssRes += (y - fit) ** 2
    ssTot += (y - mean) ** 2
  }
  const r2 = 1 - ssRes / ssTot
  console.log(`width ${side - 2}: midBeat=${midBeat} centerOverMean=${(center / mean).toFixed(3)} parabolaR2=${r2.toFixed(4)}`)
}
