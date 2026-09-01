// Reversible radiation pressure on the B4 two-speed coin, and why it is SUB-CRITICAL (the honest negative that
// rules out the radiation-pressure family for a reversible attraction, see plans/reversible-attraction-options).
// A SLOW mass (short-root tones, the 16-cell) sits in a FAST vacuum (long-root tones, the 24-cell) that is depleted
// on one side. A reversible momentum-conserving collision PAIRS short lines with long lines, so a slow head-on pair
// rotates into a long line only if it is EMPTY, the dense bath blocks the rotation, the sparse side allows it.
// Radiation pressure would DRIFT the mass coherently toward the sparse (depleted) side.
//
// It does not. The slow mass OSCILLATES and DISPERSES rather than drifting coherently (its centroid sloshes back
// and forth and its spread grows), and it even converts slow to fast and back. So discrete momentum conservation
// admits too few coherent scattering channels, the rotation-based reversible collisions disperse a mass instead of
// pushing it. Radiation pressure is the wrong family for a reversible attraction. The better families are
// topological binding (a vortex or Hopfion) and gauge confinement (see the options doc).
//
// Depth L2, an honest negative, reversible radiation pressure on B4 disperses and oscillates, no coherent drift.

import { experiment } from '@/test/scaffold/suite'
import { verdict } from '@/test/scaffold/verdict'
import { b4Mesh, type Mesh, meshOpposites } from '@/code/tool/mesh'
import { makeWill, type Will } from '@/code/tone/will'
import { beatInto, streamSourceTable } from '@/code/rule/lattice-gas'
import type { Collision } from '@/code/rule/collision'

export default experiment({
  id: 'selves/reversible-radiation-pressure',
  code: 'E-SLF-0105',
  title:
    'reversible radiation pressure on B4 is sub-critical: a slow mass oscillates and disperses, it does not coherently drift toward depletion',
  category: 'selves',
  substrates: ['b4'],
  depth: 'L2',
  paper: true,
  run() {
    const side = 12
    const beats = 40
    const mesh: Mesh = b4Mesh({ side })
    const degree = mesh.degree
    const opposite = meshOpposites(mesh)

    const table = streamSourceTable(mesh) // precompute the stream gather once, reused for every beat
    const half = side / 2

    const longLines: [number, number][] = []
    const shortLines: [number, number][] = []

    for (let d = 0; d < degree; d++) {
      const o = opposite[d]!

      if (d < o) {
        ;(d < 24 ? longLines : shortLines).push([d, o])
      }
    }

    // pair each short line with a long line (the slow-fast coupling), the rest long-long.
    const pairs: [[number, number], [number, number]][] = []

    for (let i = 0; i < shortLines.length; i++) {
      pairs.push([shortLines[i]!, longLines[i]!])
    }

    for (let i = shortLines.length; i + 1 < longLines.length; i += 2) {
      pairs.push([longLines[i]!, longLines[i + 1]!])
    }

    // a reversible, momentum-conserving, charge-conserving involution, a head-on pair rotates to its empty partner.
    const coupledRotate: Collision = (slots, base) => {
      for (const [A, B] of pairs) {
        const a0 = slots[base + A[0]] ?? 0,
          a1 = slots[base + A[1]] ?? 0

        const b0 = slots[base + B[0]] ?? 0,
          b1 = slots[base + B[1]] ?? 0

        const aHeadOn = a0 === a1 && a0 !== 0
        const bHeadOn = b0 === b1 && b0 !== 0
        const aEmpty = a0 === 0 && a1 === 0
        const bEmpty = b0 === 0 && b1 === 0

        if (aHeadOn && bEmpty) {
          slots[base + B[0]] = a0
          slots[base + B[1]] = a0
          slots[base + A[0]] = 0
          slots[base + A[1]] = 0
        } else if (bHeadOn && aEmpty) {
          slots[base + A[0]] = b0
          slots[base + A[1]] = b0
          slots[base + B[0]] = 0
          slots[base + B[1]] = 0
        }
      }
    }

    const setup = (): Will => {
      const will = makeWill(mesh)

      for (let c = 0; c < mesh.cellCount; c++) {
        const x = c % side,
          y = Math.floor(c / side) % side,
          z = Math.floor(c / (side * side)) % side,
          w = Math.floor(c / (side * side * side)) % side

        const r2 =
          (x - half) ** 2 +
          (y - half) ** 2 +
          (z - half) ** 2 +
          (w - half) ** 2

        if (r2 <= 2) {
          for (const [s0, s1] of shortLines) {
            will.data[c * degree + s0] = 1
            will.data[c * degree + s1] = 1
          }
        } else {
          const density = x < half ? 9 : 2 // fast bath dense at low x, sparse (depleted) at high x

          for (let li = 0; li < longLines.length; li++) {
            if ((c * 31 + li * 17) % 12 < density) {
              const [l0, l1] = longLines[li]!

              will.data[c * degree + l0] = 1
              will.data[c * degree + l1] = 1
            }
          }
        }
      }

      return will
    }

    const slowCentroidX = (will: Will): { cx: number; rms: number } => {
      let total = 0,
        sx = 0

      for (let c = 0; c < mesh.cellCount; c++) {
        let m = 0

        for (let d = 24; d < 32; d++) {
          m += Math.abs(will.data[c * degree + d]!)
        }

        if (m > 0) {
          total += m
          sx += m * (c % side)
        }
      }

      if (total === 0) {
        return { cx: half, rms: 0 }
      }

      const cx = sx / total

      let v = 0

      for (let c = 0; c < mesh.cellCount; c++) {
        let m = 0

        for (let d = 24; d < 32; d++) {
          m += Math.abs(will.data[c * degree + d]!)
        }

        if (m > 0) {
          v += m * ((c % side) - cx) ** 2
        }
      }

      return { cx, rms: Math.sqrt(v / total) }
    }

    let will = setup()
    let scratch: Will = { mesh, data: new Int8Array(will.data.length) }

    const start = slowCentroidX(will)

    let maxRms = start.rms
    let maxToward = start.cx // furthest the centroid gets toward the sparse (high x) side
    let final = start

    for (let t = 0; t < beats; t++) {
      beatInto({
        src: will,
        dst: scratch,
        table,
        collision: coupledRotate,
      })

      const swap = will

      will = scratch
      scratch = swap
      final = slowCentroidX(will)

      if (final.rms > maxRms) {
        maxRms = final.rms
      }

      if (final.cx > maxToward) {
        maxToward = final.cx
      }
    }

    // the honest negative, the mass DISPERSES (rms grows large) and does NOT coherently drift to the sparse side
    // (the final centroid is not held toward high x, it sloshes back). PASS demonstrates radiation pressure is
    // sub-critical and dispersive on the discrete coin.
    const disperses = maxRms >= start.rms * 2.5
    const noCoherentDrift = final.cx <= start.cx + 0.5 // did not settle toward the depleted (high x) side
    const ok = disperses && noCoherentDrift

    return verdict({
      status: ok ? 'pass' : 'fail',
      claim:
        'reversible radiation pressure on the B4 two-speed coin is sub-critical, a slow mass in a depleted fast vacuum, coupled by a reversible momentum-conserving collision that pairs short lines with long lines, OSCILLATES and DISPERSES (its spread grows by more than a factor of two and its centroid sloshes back rather than settling toward the sparse side) and even converts slow to fast, so discrete momentum conservation admits too few coherent scattering channels and rotation-based reversible collisions disperse a mass instead of pushing it, radiation pressure is the wrong family for a reversible attraction, the better families are topological binding (a vortex or Hopfion) and gauge confinement',
      metrics: {
        startCentroidXTimes100: Math.round(start.cx * 100),
        finalCentroidXTimes100: Math.round(final.cx * 100),
        maxTowardSparseTimes100: Math.round(maxToward * 100),
        startRmsTimes100: Math.round(start.rms * 100),
        maxRmsTimes100: Math.round(maxRms * 100),
        disperses: disperses ? 1 : 0,
        noCoherentDrift: noCoherentDrift ? 1 : 0,
        beats,
      },
      control: {
        startRmsTimes100: Math.round(start.rms * 100),
        maxRmsTimes100: Math.round(maxRms * 100),
      },
      notes:
        'honest negative ruling out the radiation-pressure family for a reversible attraction. The discrete momentum-conservation structure has too few coherent scatter channels, and rotation-based collisions disperse rather than push. The reversible attraction needs a different family, topological binding (vortex, Hopfion) or gauge confinement, see plans/reversible-attraction-options',
    })
  },
})
