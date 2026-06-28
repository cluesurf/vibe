// HONEST NEGATIVE. A line of co-moving charges under the momentum-conserving rule is NOT a bound self, it is free
// parallel streaming with no binding. This experiment first looked like a self because the perturbation used was
// EXTRA charges in OTHER directions, which have a different velocity and simply drift away, two non-interacting
// crowds separating, not a body repairing itself. The decisive test is a hit to the body's OWN charges, redirect
// one of the glider's charges and ask whether the body pulls it back.
//
// It does not. On the closed torus (nothing can leave) the difference from a clean glider STAYS AT ITS PEAK for
// the whole run, the body never heals, there is zero restoring force. The redirected charge flies off on its new
// heading and never rejoins, because lattice-gas particles only interact when they meet head-on, and parallel
// charges never meet. So co-motion is kinematic coincidence, not binding.
//
// The lesson, a robust self needs genuine BINDING (a restoring interaction among its parts), which free streaming
// does not provide. Confinement by reflection seals radiation (selves/leaky-confiner), free streaming has no
// restoring force (this), so neither simple rule gives a self. The open requirement is a single rule whose body is
// BOUND (a hit relaxes back) yet still radiates the excess to the bath. A topological kink (a domain wall in the
// ternary tone, protected by topology, not amplitude) is the discrete candidate not yet tried.
//
// Depth L2, a body hit on a co-moving line, measured on the closed torus (no bath, so any healing would be
// genuine), the difference staying at peak is the proof of no binding.

import { experiment } from '@/test/scaffold/suite'
import { verdict } from '@/test/scaffold/verdict'
import { d4Mesh, type Mesh } from '@/code/tool/mesh'
import { cloneWill, gliderLine, type Will } from '@/code/tone/will'
import { headOnRotate, type Collision } from '@/code/rule/collision'
import { beatInto, streamSourceTable } from '@/code/rule/lattice-gas'
import { absorbBoundary } from '@/code/dynamics/bath'

export default experiment({
  id: 'selves/co-motion-not-bound',
  code: 'E-SLF-0021',
  title:
    'co-moving charges are NOT a bound self: a hit to the body is never healed (no restoring force)',
  category: 'selves',
  substrates: ['3434'],
  depth: 'L2',
  paper: true,
  run() {
    const side = 14
    const beats = 16
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

    const dir = 0
    const table = streamSourceTable(mesh) // precompute the stream gather once, reused for every beat
    const scratchOf = (will: Will): Will => ({
      mesh,
      data: new Int8Array(will.data.length),
    })

    const cleanGlider = (): Will =>
      gliderLine({ mesh, start: center, direction: dir, length: 3 })
        .will

    // the BODY hit, redirect one of the glider's own forward charges to a sideways direction. A bound soliton would
    // pull it back into the clean form. Free parallel streaming loses it forever.
    const bodyHitGlider = (): Will => {
      const will = cloneWill(cleanGlider())

      for (let c = 0; c < mesh.cellCount; c++) {
        if (will.data[c * degree + dir] !== 0) {
          const v = will.data[c * degree + dir]!
          will.data[c * degree + dir] = 0
          will.data[c * degree + 6] = v
          break
        }
      }

      return will
    }

    // difference between a clean glider and the body-hit glider over time.
    const trace = (open: boolean): { peak: number; final: number } => {
      let clean = cleanGlider()
      let hit = bodyHitGlider()
      let cleanScratch = scratchOf(clean)
      let hitScratch = scratchOf(hit)
      let peak = 0
      let final = 0

      for (let t = 0; t < beats; t++) {
        beatInto({
          src: clean,
          dst: cleanScratch,
          table,
          collision: rule,
        })

        {
          const swap = clean
          clean = cleanScratch
          cleanScratch = swap
        }

        beatInto({ src: hit, dst: hitScratch, table, collision: rule })

        {
          const swap = hit
          hit = hitScratch
          hitScratch = swap
        }

        if (open) {
          absorbBoundary(clean)
          absorbBoundary(hit)
        }

        let diff = 0

        for (let i = 0; i < clean.data.length; i++) {
          if (clean.data[i] !== hit.data[i]) {
            diff++
          }
        }

        if (diff > peak) {
          peak = diff
        }

        final = diff
      }

      return { peak, final }
    }

    const closed = trace(false)
    const open = trace(true)

    // the forward momentum (identity) of the hit body, start vs end on the open lattice.
    const dirCharge = (will: Will, d: number): number => {
      let s = 0

      for (let c = 0; c < mesh.cellCount; c++) {
        s += Math.abs(will.data[c * degree + d]!)
      }

      return s
    }

    let hit = bodyHitGlider()
    let hitScratch = scratchOf(hit)

    const startDir0 = dirCharge(hit, dir)

    for (let t = 0; t < beats; t++) {
      beatInto({ src: hit, dst: hitScratch, table, collision: rule })

      const swap = hit
      hit = hitScratch
      hitScratch = swap
      absorbBoundary(hit)
    }

    const endDir0 = dirCharge(hit, dir)

    // the honest negative, on the closed torus the body NEVER heals (final difference stays at peak), so there is
    // no restoring force, the structure is not bound. PASS means we correctly demonstrated the absence of binding.
    const neverHeals = closed.final >= closed.peak
    const losesTheCharge = endDir0 < startDir0
    const ok = neverHeals && losesTheCharge

    return verdict({
      status: ok ? 'pass' : 'fail',
      claim:
        'a line of co-moving charges under the momentum-conserving rule is NOT a bound self, it is free parallel streaming, when one of the body charges is redirected the closed-torus difference from a clean glider stays at its peak for the whole run (the body never heals, zero restoring force) and the redirected forward momentum is lost and never rejoins, because lattice-gas particles only interact head-on and parallel charges never meet, so co-motion is kinematic coincidence not binding, a robust self requires genuine binding which free streaming does not provide',
      metrics: {
        bodyHitClosedPeak: closed.peak,
        bodyHitClosedFinal: closed.final,
        bodyHitOpenPeak: open.peak,
        bodyHitOpenFinal: open.final,
        dir0ChargeStart: startDir0,
        dir0ChargeEnd: endDir0,
        neverHeals: neverHeals ? 1 : 0,
        losesTheCharge: losesTheCharge ? 1 : 0,
        beats,
      },
      control: {
        bodyHitClosedFinal: closed.final,
        bodyHitClosedPeak: closed.peak,
      },
      notes:
        'honest negative, supersedes the earlier soliton-self over-claim. The earlier recovery was an artifact, EXTRA charges in OTHER directions drift off (different velocity), which is two crowds separating, not a body healing. The real test (a hit to the body) is never healed on the torus. A working substrate-native self needs genuine binding (a restoring interaction), free streaming has none. Next candidate, a topological kink (a domain wall in the ternary tone, protected by topology not amplitude), still discrete, not yet tried',
    })
  },
})
