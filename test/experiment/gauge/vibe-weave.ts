// The vibe weave as one rule (code/rule/vibe-weave): vibes by the committed weave, role points carried
// by the links and swapped where vibes meet, and a flow on every link counting the vibe that crosses
// it. E-FRC-0117 ran the first two. This adds the flow, the link's own conjugate, which the notes found
// is the law flow <- flow + vibe of E-FRC-0116 put on the link rather than the slot.
//
// Gates, on the side-3 D4 box, 24 beats, from dense starts:
// - charge: love minus fear exact at every beat
// - reversal: 24 beats forward and back restore vibes, role points and flows exactly
// - Gauss's law at every cell at every beat: the change in its love minus fear equals the flow in
//   minus the flow out
// - a change of role frame in every cell, links changed to match, commutes with the rule exactly, and
//   leaves vibes and flows untouched
// Measured and reported, the two seams the notes name:
// - color made at creation: each time calm gives rise to a fear and a love on a line, whether their
//   two role points differ (color charge from nothing), as a count over a vacuum run
// - the string: on a side-5 box, how many links carry a triality flux in a run seeded with one lone
//   love, beyond those of the vacuum run, at beats 6, 12 and 24
//
// Depth L2: a constructed rule against stated gates.

import { experiment } from '@/test/scaffold/suite'
import { verdict } from '@/test/scaffold/verdict'
import {
  fluxLinks,
  gaussHolds,
  makeVibeWeave,
  vibeBeat,
  vibeBeatBack,
  type VibeState,
  type VibeWeave,
} from '@/code/rule/vibe-weave'
import { collide } from '@/code/rule/lattice-gas'

const GOLDEN = (Math.sqrt(5) - 1) / 2

function dense(weave: VibeWeave, scale: number): VibeState {
  const slots = weave.mesh.cellCount * 24
  const vibe = new Int8Array(slots)
  const role = new Int8Array(slots)

  for (let i = 0; i < slots; i++) {
    const u = ((i + 1) * GOLDEN * scale) % 1

    vibe[i] = u < 0.3 ? -1 : u < 0.6 ? 0 : 1
    role[i] = Math.floor(((i + 3) * GOLDEN * scale * 9) % 9)
  }

  return { vibe, role, flow: new Int32Array(slots) }
}

const same = (a: VibeState, b: VibeState): boolean =>
  a.vibe.every((v, i) => v === b.vibe[i]) &&
  a.role.every((v, i) => v === b.role[i]) &&
  a.flow.every((v, i) => v === b.flow[i])

export default experiment({
  id: 'gauge/vibe-weave',
  code: 'E-FRC-0123',
  title:
    "the vibe weave as one rule, with a flow on every link: charge exact, reversal exact with the flows, Gauss's law exact at every cell on every beat, and a change of role frame in every cell commuting with it, with the color made at pair creation and the string a lone love leaves measured",
  category: 'gauge',
  substrates: ['3434'],
  depth: 'L2',
  paper: false,
  run() {
    const weave = makeVibeWeave({ side: 3 })
    const { moves } = weave
    const charge = (s: VibeState): number =>
      s.vibe.reduce((a, b) => a + b, 0)

    // charge, Gauss and reversal
    let chargeKept = true
    let gauss = true
    let reverses = true

    for (const scale of [1.37, 2.11]) {
      const start = dense(weave, scale)

      let s = start

      for (let t = 0; t < 24; t++) {
        s = vibeBeat(weave, s, t)
        chargeKept = chargeKept && charge(s) === charge(start)
        gauss = gauss && gaussHolds(weave, start, s)
      }

      for (let t = 23; t >= 0; t--) {
        s = vibeBeatBack(weave, s, t)
      }

      reverses = reverses && same(s, start)
    }

    // a change of role frame in every cell, links changed to match
    const frame = Array.from({ length: weave.mesh.cellCount }, (_, x) =>
      Math.floor((((x + 11) * GOLDEN * 5.9) % 1) * moves.act.length),
    )
    const gaugedLinks = new Int16Array(weave.links.length)

    for (let x = 0; x < weave.mesh.cellCount; x++) {
      for (let d = 0; d < 24; d++) {
        const y = weave.mesh.neighbour(x, d)

        gaugedLinks[x * 24 + d] = moves.compose(
          moves.compose(
            frame[y] ?? moves.identity,
            weave.links[x * 24 + d] ?? moves.identity,
          ),
          moves.inverse[frame[x] ?? moves.identity] ?? moves.identity,
        )
      }
    }

    const gaugedWeave: VibeWeave = { ...weave, links: gaugedLinks }
    const gaugeRoles = (s: VibeState): VibeState => ({
      ...s,
      role: Int8Array.from(
        s.role,
        (p, i) =>
          moves.act[frame[Math.floor(i / 24)] ?? moves.identity]?.[p] ??
          0,
      ),
    })

    let frameFree = true
    let a = dense(weave, 1.37)
    let b = gaugeRoles(a)

    for (let t = 0; t < 24; t++) {
      a = vibeBeat(weave, a, t)
      b = vibeBeat(gaugedWeave, b, t)
      frameFree = frameFree && same(gaugeRoles(a), b)
    }

    // color made at creation, over a vacuum run with roles filled in
    let creations = 0
    let coloredCreations = 0
    let v = dense(weave, 1.37)

    v = { ...v, vibe: new Int8Array(v.vibe.length) }

    for (let t = 0; t < 24; t++) {
      const before = Int8Array.from(v.vibe)
      const after = { mesh: weave.mesh, data: Int8Array.from(v.vibe) }

      collide(after, weave.forward(t))

      for (let x = 0; x < weave.mesh.cellCount; x++) {
        for (const [p, q] of weave.lines) {
          const i = x * 24 + p
          const j = x * 24 + q

          if (
            before[i] === 0 &&
            before[j] === 0 &&
            (after.data[i] !== 0 || after.data[j] !== 0)
          ) {
            creations += 1
            coloredCreations += v.role[i] === v.role[j] ? 0 : 1
          }
        }
      }

      v = vibeBeat(weave, v, t)
    }

    // the string: one lone love on a side-5 box, flux links beyond the vacuum's
    const big = makeVibeWeave({ side: 5 })
    const slots = big.mesh.cellCount * 24
    const empty = (): VibeState => ({
      vibe: new Int8Array(slots),
      role: new Int8Array(slots),
      flow: new Int32Array(slots),
    })

    let vacuum = empty()
    let seeded = empty()

    const center = Math.floor(big.mesh.cellCount / 2)

    seeded.vibe[center * 24] = 1

    const string: Record<number, number> = {}

    for (let t = 0; t < 24; t++) {
      vacuum = vibeBeat(big, vacuum, t)
      seeded = vibeBeat(big, seeded, t)

      if ([5, 11, 23].includes(t)) {
        string[t + 1] = fluxLinks(big, seeded) - fluxLinks(big, vacuum)
      }
    }

    const ok = chargeKept && gauss && reverses && frameFree

    return verdict({
      status: ok ? 'pass' : 'fail',
      claim:
        "charge is exact, 24 beats forward and back restore vibes, role points and flows exactly, Gauss's law holds at every cell on every beat, and a change of role frame in every cell commutes with the rule, with the color made at pair creation and the lone love's string reported",
      metrics: {
        chargeConserved: chargeKept ? 1 : 0,
        reversesExactly: reverses ? 1 : 0,
        gaussEveryCellEveryBeat: gauss ? 1 : 0,
        frameFree: frameFree ? 1 : 0,
        pairCreations: creations,
        coloredCreations,
        stringLinksBeat6: string[6] ?? Number.NaN,
        stringLinksBeat12: string[12] ?? Number.NaN,
        stringLinksBeat24: string[24] ?? Number.NaN,
      },
      control: {
        cells: weave.mesh.cellCount,
        bigCells: big.mesh.cellCount,
      },
      notes:
        'L2, a constructed rule, exact, no random numbers. Colored creations: a fear and a love made from calm with different role points, color charge from nothing, the seam a latent role on each calm line would close. The string: links whose net flow is not a multiple of 3 in the seeded run, beyond the vacuum run. Nothing makes a string cost anything yet, so it binds nothing.',
    })
  },
})
