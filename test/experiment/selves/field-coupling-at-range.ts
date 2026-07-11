// Do bodies couple through the shared field at a distance, with nothing passing
// between them but the mesh itself? Two localized bodies are stamped in one world
// and evolved under the COMMITTED deterministic reversible rule (no randomness
// anywhere, so the causal attribution is exact). One body is hit (a body-hit, its
// OWN slots flipped, not junk added elsewhere) and the readout is the field record
// in a window around the other body. Two runs differ only in the hit, so any
// divergence of the far window is influence transmitted from the hit. Three
// comparisons close the case:
//   - coupled world: the far window diverges after the hit, influence crosses the
//     shared field,
//   - severed world (each half wrapped onto its own torus, every cell kept, no
//     crossing path): the divergence is EXACTLY zero, no path, no influence, an
//     exact dynamical zero, not a bookkeeping one,
//   - distance: within the same beat budget the response at small separation
//     exceeds the response at large separation, influence attenuates with range.
//
// An earlier draft ran this at the selves layer and failed its own control: the
// selves-layer beat draws from one shared rng stream, and a hit changes how many
// draws the near half consumes, which shifts every later draw and fakes influence
// across a severed mesh. The committed base rule has no rng at all, so that hidden
// channel does not exist here. That failure is kept in this header as the honest
// reason for the design.
//
// Grade L2: a controlled causal demonstration on the committed rule with an exact
// zero control and a measured distance attenuation. The bodies are charge blobs
// (bound selves are not base-emergent, per the standing negatives), so this is a
// field-transmission result, the selves-layer reading is interpretive.

import { squareMesh, type Mesh } from '@/code/tool/mesh'
import { makeWill, charge, type Will } from '@/code/tone/will'
import { run } from '@/code/rule/lattice-gas'
import {
  headOnRotate,
  pairCollision,
  type Collision,
} from '@/code/rule/collision'
import { experiment } from '@/test/scaffold/suite'
import { verdict } from '@/test/scaffold/verdict'

const L = 64
const BEATS = 56
const HIT_BEAT = 16

// the severed world: hops that would cross the midline wrap within their own half
// instead, so each half is its own torus. Every cell is kept, no path crosses the
// seam, and the neighbour map stays a bijection per direction, which keeps the
// stream exact and the charge conserved (a bounce-back seam is NOT bijective, two
// sources would stream into one slot and lose charge, so the wrap is the clean cut)
function severedMesh(base: Mesh, seam: number): Mesh {
  return {
    id: `${base.id}-severed`,
    degree: base.degree,
    cellCount: base.cellCount,
    neighbour(cell, direction) {
      const next = base.neighbour(cell, direction)
      const x = cell % L
      const fromWest = x < seam
      const toWest = next % L < seam

      if (fromWest === toWest) {
        return next
      }

      // wrap within the half: the x step folds back into [lo, lo + width)
      const lo = fromWest ? 0 : seam
      const width = fromWest ? seam : L - seam
      const nxRaw = next % L
      const step =
        nxRaw - x > L / 2 ? -1 : nxRaw - x < -L / 2 ? 1 : nxRaw - x

      const nx = lo + ((x - lo + step + width) % width)

      return next - nxRaw + nx
    },
    opposite(direction) {
      return base.opposite(direction)
    },
  }
}

// a compact body: a diamond of cells with all four slots filled
function stampBody(will: Will, px: number, py: number): void {
  const { mesh, data } = will

  for (let dy = -2; dy <= 2; dy++) {
    for (let dx = -2; dx <= 2; dx++) {
      if (Math.abs(dx) + Math.abs(dy) <= 2) {
        const cell = (py + dy) * L + (px + dx)

        for (let d = 0; d < mesh.degree; d++) {
          data[cell * mesh.degree + d] = (dx + dy) % 2 === 0 ? 1 : -1
        }
      }
    }
  }
}

// signed charge in a window around a point, the far body's field record
function windowCharge(
  will: Will,
  px: number,
  py: number,
  radius: number,
): number {
  const { mesh, data } = will

  let s = 0

  for (let y = py - radius; y <= py + radius; y++) {
    for (let x = px - radius; x <= px + radius; x++) {
      if (x >= 0 && x < L && y >= 0 && y < L) {
        const cell = y * L + x

        for (let d = 0; d < mesh.degree; d++) {
          s += data[cell * mesh.degree + d] ?? 0
        }
      }
    }
  }

  return s
}

// evolve one world beat by beat, recording the far window, with an optional
// body-hit (flip the center slots of the first body) at HIT_BEAT
function runWorld(input: {
  mesh: Mesh
  collision: Collision
  ax: number
  bx: number
  hit: boolean
}): number[] {
  const { mesh, collision, ax, bx, hit } = input
  const cy = L >> 1

  let will = makeWill(mesh)

  stampBody(will, ax, cy)
  stampBody(will, bx, cy)

  const series: number[] = []

  for (let b = 0; b < BEATS; b++) {
    if (hit && b === HIT_BEAT) {
      // the body-hit: flip every slot of the first body's center cell and its
      // four neighbours, a perturbation of its OWN charges
      for (const [dx, dy] of [
        [0, 0],
        [1, 0],
        [-1, 0],
        [0, 1],
        [0, -1],
      ] as const) {
        const cell = (cy + dy) * L + (ax + dx)

        for (let d = 0; d < mesh.degree; d++) {
          will.data[cell * mesh.degree + d] = -1
        }
      }
    }

    will = run(will, collision, 1)
    series.push(windowCharge(will, bx, cy, 5))
  }

  return series
}

// root-mean-square post-hit divergence of the far window between the hit world
// and the unhit world, exact because the dynamics is fully deterministic
function response(input: {
  mesh: Mesh
  collision: Collision
  ax: number
  bx: number
}): number {
  const { mesh, collision, ax, bx } = input
  const withHit = runWorld({ mesh, collision, ax, bx, hit: true })
  const without = runWorld({ mesh, collision, ax, bx, hit: false })

  let s = 0
  let n = 0

  for (let b = HIT_BEAT; b < BEATS; b++) {
    const d = (withHit[b] ?? 0) - (without[b] ?? 0)

    s += d * d
    n++
  }

  return Math.sqrt(s / Math.max(n, 1))
}

export default experiment({
  id: 'selves/field-coupling-at-range',
  code: 'E-SLF-0157',
  title:
    'a body-hit on one body changes the field record at a distant body through nothing but the shared mesh under the committed deterministic rule, the severed-mesh control gives an exact dynamical zero, and the response attenuates with separation, so influence between bodies is carried by the shared medium and only by it',
  category: 'selves',
  substrates: 'any',
  depth: 'L2',
  paper: true,
  run() {
    const seam = L >> 1
    const intact = squareMesh({ side: L })
    const severed = severedMesh(intact, seam)
    const oppositeOf = (mesh: Mesh): number[] =>
      Array.from({ length: mesh.degree }, (_, d) => mesh.opposite(d))

    // the radiating rule candidate carries influence, the sealing rule does not
    const rotate = headOnRotate({ opposite: oppositeOf(intact) })
    const sealed = pairCollision({ opposite: oppositeOf(intact) })
    const rotateSevered = headOnRotate({
      opposite: oppositeOf(severed),
    })

    const nearResponse = response({
      mesh: intact,
      collision: rotate,
      ax: seam - 8,
      bx: seam + 8,
    })

    const farResponse = response({
      mesh: intact,
      collision: rotate,
      ax: seam - 20,
      bx: seam + 20,
    })

    const severedResponse = response({
      mesh: severed,
      collision: rotateSevered,
      ax: seam - 8,
      bx: seam + 8,
    })

    const sealedResponse = response({
      mesh: intact,
      collision: sealed,
      ax: seam - 8,
      bx: seam + 8,
    })

    // charge conservation sanity on the severed mesh (the seam reflects, never leaks)
    const probe = makeWill(severed)

    stampBody(probe, seam - 8, L >> 1)

    const conserved =
      charge(run(probe, rotateSevered, 20)) === charge(probe)

    // 1. the coupled world transmits: the near response is nonzero
    const transmits = nearResponse > 1

    // 2. the severed world transmits exactly nothing
    const severedZero = severedResponse === 0

    // 3. influence attenuates with range inside the same beat budget
    const attenuates = farResponse < 0.75 * nearResponse

    // 4. the sealing rule carries nothing: the same hit under the pair table
    // stays a bounded local difference and the far window never diverges
    const sealedZero = sealedResponse === 0

    const solved =
      transmits && severedZero && attenuates && sealedZero && conserved

    return verdict({
      status: solved ? 'pass' : 'fail',
      claim:
        'under the committed deterministic reversible rule with two bodies in one world, a body-hit on the first body diverges the signed-charge record at the second body after the hit (transmitted influence, exactly attributed because the two runs are identical except the hit), the same protocol on the severed mesh (each half wrapped onto its own torus, no crossing path, charge conserved exactly) gives a divergence of exactly zero, the same hit under the sealing pair rule also transmits exactly nothing (the difference stays a bounded local oscillation, so influence needs the radiating channel), and the response at sixteen cells separation exceeds the response at forty cells in the same beat budget, so influence between bodies is carried by the shared medium through the radiating rule candidate, vanishes rather than weakens when the medium is severed or the sealing rule is used, and attenuates with distance',
      metrics: {
        nearResponse: Number(nearResponse.toFixed(4)),
        farResponse: Number(farResponse.toFixed(4)),
        severedResponse: Number(severedResponse.toFixed(6)),
        sealedRuleResponse: Number(sealedResponse.toFixed(6)),
        seamConservesCharge: conserved ? 1 : 0,
      },
      control: {
        // the severed mesh is the control: identical bodies, identical hit, zero
        // shared medium, and the far-window divergence is exactly zero by the
        // dynamics (not by construction, the halves still evolve their own waves)
        severedResponse: Number(severedResponse.toFixed(6)),
        nearResponse: Number(nearResponse.toFixed(4)),
      },
      notes:
        'L2 on the committed rule, fully deterministic, no rng anywhere, so the hit-versus-no-hit divergence is exact causal attribution. The earlier selves-layer draft failed its own severed control because the shared rng stream was a hidden channel (a hit shifts the draw sequence for the far half), which is recorded in the header as the design lesson: causal-isolation controls need rng-free dynamics or per-region streams. The bodies are charge blobs, not bound selves (bound bodies are not base-emergent per the standing negatives), so the result is field transmission between localized structures, with the selves-layer reading interpretive. The severed seam reflects crossing hops in both directions and conserves charge exactly, verified in-run.',
    })
  },
})
