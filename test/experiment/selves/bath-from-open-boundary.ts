// The bath, demonstrated (what-the-bath-is). The recent capture experiments ran on a periodic torus, which is a
// closed box with mirrored walls, anything radiated outward wraps around and comes back (Poincare recurrence).
// A torus has NO bath, there is no "away" for an excitation to disappear into, which is exactly why a reversible
// rule on it can only scatter elastically and never capture. An INFINITE lattice does have an away, a local
// excitation radiates outward forever and never returns, and that endless surrounding lattice IS the bath.
//
// We model a finite window onto the infinite lattice with an ABSORBING boundary, a shell of edge cells reset to
// peace every beat, so whatever radiates to the edge is removed (it left to infinity and never comes back). The
// bulk rule is the reversible momentum rotate either way. We launch the same localized burst on the torus and on
// the absorbing-boundary lattice and watch the centre.
//  - TORUS, the charge is exactly conserved (reversible) and the burst RECURS, it streams out, wraps around, and
//    returns to the centre. No bath.
//  - ABSORBING BOUNDARY, the burst radiates to the edge and is absorbed, the centre RELAXES to empty and the
//    total charge decays. This is dissipation, irreversible relaxation, the signature of a bath.
//
// This is the foundation under the whole self arc, capture, the arrow, and selves all need a bath, and the
// infinite lattice (here its absorbing-boundary proxy) supplies it while the torus does not.
//
// Depth L2, the same burst measured on the torus and on the absorbing-boundary lattice, the torus as the
// no-bath control.

import { experiment } from '@/test/scaffold/suite'
import { verdict } from '@/test/scaffold/verdict'
import { d4Mesh, shellDistances, type Mesh } from '@/code/tool/mesh'
import { makeWill, cloneWill, type Will } from '@/code/tone/will'
import { headOnRotate, type Collision } from '@/code/rule/collision'
import { beatInto, streamSourceTable } from '@/code/rule/lattice-gas'
import { absorbBoundary } from '@/code/dynamics/bath'

// the total absolute charge, the amount of structure present. Conserved by the bulk, drained by the boundary.
function totalCharge(will: Will): number {
  let sum = 0

  for (const value of will.data) sum += Math.abs(value)

  return sum
}

// the absolute charge within graph radius `radius` of the centre, the structure still at the middle.
function centralCharge(input: {
  will: Will
  center: number
  radius: number
}): number {
  const dist = shellDistances(input.will.mesh, input.center)
  const degree = input.will.mesh.degree

  let sum = 0

  for (let cell = 0; cell < input.will.mesh.cellCount; cell++) {
    if (dist[cell]! >= 0 && dist[cell]! <= input.radius) {
      const base = cell * degree

      for (let d = 0; d < degree; d++)
        sum += Math.abs(input.will.data[base + d]!)
    }
  }

  return sum
}

export default experiment({
  id: 'selves/bath-from-open-boundary',
  code: 'E-SLF-0011',
  title:
    'an absorbing boundary is a bath (the burst radiates away and relaxes), the torus is not (it recurs)',
  category: 'selves',
  substrates: ['3434'],
  depth: 'L2',
  paper: true,
  run() {
    const side = 12
    const beats = side + 6 // long enough for a torus wrap-around (recurrence) to return to the centre
    const radius = 2
    const mesh: Mesh = d4Mesh({ side })
    const degree = mesh.degree
    const opposite = Array.from({ length: degree }, (_, d) =>
      mesh.opposite(d),
    )

    const rule: Collision = headOnRotate({ opposite })
    const half = side / 2
    const center =
      half +
      half * side +
      half * side * side +
      half * side * side * side

    // a localized burst, eight charges at the centre cell flying out along the first eight directions.
    const burst = (): Will => {
      const will = makeWill(mesh)

      for (let d = 0; d < 8; d++) will.data[center * degree + d] = 1

      return will
    }

    const startCharge = totalCharge(burst())
    const startCentral = centralCharge({
      will: burst(),
      center,
      radius,
    })

    const table = streamSourceTable(mesh) // precompute the stream gather once, reused for every beat

    // the torus run, no absorbing boundary.
    let torus = cloneWill(burst())
    let torusScratch: Will = {
      mesh,
      data: new Int8Array(torus.data.length),
    }

    let torusCentralReturn = 0

    for (let t = 0; t < beats; t++) {
      beatInto({
        src: torus,
        dst: torusScratch,
        table,
        collision: rule,
      })

      const swap = torus

      torus = torusScratch
      torusScratch = swap

      if (t >= beats / 2) {
        const c = centralCharge({ will: torus, center, radius })

        if (c > torusCentralReturn) torusCentralReturn = c
      }
    }

    const torusChargeFinal = totalCharge(torus)

    // the absorbing-boundary run, the bath drains the edge each beat.
    let open = cloneWill(burst())
    let openScratch: Will = {
      mesh,
      data: new Int8Array(open.data.length),
    }

    for (let t = 0; t < beats; t++) {
      beatInto({ src: open, dst: openScratch, table, collision: rule })

      const swap = open

      open = openScratch
      openScratch = swap
      absorbBoundary(open)
    }

    const openChargeFinal = totalCharge(open)
    const openCentralFinal = centralCharge({
      will: open,
      center,
      radius,
    })

    // the torus conserves charge and the burst recurs to the centre, the open lattice dissipates and relaxes.
    const torusConserves = torusChargeFinal === startCharge
    const torusRecurs = torusCentralReturn >= startCentral * 0.4
    const openDissipates = openChargeFinal <= startCharge * 0.2
    const openRelaxes = openCentralFinal <= startCentral * 0.2

    const ok =
      torusConserves && torusRecurs && openDissipates && openRelaxes

    return verdict({
      status: ok ? 'pass' : 'fail',
      claim:
        'on a periodic torus a localized burst conserves its charge exactly and recurs to the centre (it wraps around and returns, no bath), while on an absorbing-boundary lattice the burst radiates to the edge and is removed, the centre relaxes to empty and the total charge decays, irreversible dissipation, so the open lattice (a finite window onto the infinite one) is a genuine bath and the torus is not',
      metrics: {
        startCharge,
        startCentral,
        torusChargeFinal,
        torusCentralReturn,
        openChargeFinal,
        openCentralFinal,
        beats,
      },
      control: { torusChargeFinal, torusCentralReturn },
      notes:
        'the torus is reversible and recurrent (no away, no bath), the absorbing boundary models radiation to infinity and is dissipative (the away that a bath provides). This is why capture failed on the torus and why the infinite lattice, or its absorbing-boundary proxy, is the bath the self arc needs. Growth is one alternative bath, the infinity is the natural one',
    })
  },
})
