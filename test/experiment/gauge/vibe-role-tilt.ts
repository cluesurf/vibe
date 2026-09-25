// The three-trit slot run as one rule: vibe, role and tilt (note/experiment/gauge/what-the-base-needs,
// Names). The pieces were measured one at a time. This runs them together and asks whether they fit.
//
// Each slot holds a vibe (the tone, moved by the committed turning weave, untouched) and a point of
// the 3 x 3 role grid (role and tilt, 9 states). Each link holds one of the 216 grid moves, the
// affine maps of Z3^2 with determinant one, which is Sigma(648) as the grid sees it (E-FRC-0104).
// A beat:
// - collide: the committed collision on the vibes, and where both slots of a line carry a vibe
//   before the collision (two vibes meeting head-on) their role points swap, the pairwise exchange
//   of E-FRC-0101
// - stream: every slot moves one link along its direction, and its role point is moved by that
//   link's grid move. A link and its reverse hold inverse moves
// The links are a fixed background field here, not updated (their dynamics is E-FRC-0110).
//
// Gates, on the side-3 D4 box, 24 beats:
// - charge (the vibe sum) exact at every beat
// - reversal: 24 beats forward and back restore vibes and role points exactly
// - local gauge invariance: pick an independent grid move g_x in every cell, move every role point
//   in cell x by g_x and every link x -> y to g_y U g_x^-1. Evolving the transformed state gives
//   exactly the transform of the evolved state, at every beat
// Controls, each expected to fail the gauge test:
// - roles carried with no links (every link the identity, and the links not transformed): the frame
//   of each cell is then physical
// - roles turned by one fixed move per direction, as the coin reading would have it (E-FRC-0115):
//   the rule, not a field, fixes the move, so a cell-by-cell change of frame is visible
//
// What this cannot show: a whole. A colour-neutral whole of three roles is a quantum singlet with no
// classical state (best classical overlap 1/6, E-FRC-0101), so binding needs the phase on the swap,
// the amplitude the base lacks everywhere else too.
//
// Depth L2: a constructed rule against stated gates.

import { experiment } from '@/test/scaffold/suite'
import { verdict } from '@/test/scaffold/verdict'
import { meshOpposites } from '@/code/tool/mesh'
import { turningWeave } from '@/code/rule/collision'
import { collide, stream, streamInverse } from '@/code/rule/lattice-gas'
import { makeWill, type Will } from '@/code/tone/will'
import { d4BoxMesh } from '@/code/substrate/d4-box'

const GOLDEN = (Math.sqrt(5) - 1) / 2
const mod3 = (x: number): number => ((x % 3) + 3) % 3

// the 216 grid moves as tables on the 9 points (x + 3 y), with composition and inverses
function gridMoves(): {
  act: Int8Array[]
  inverse: number[]
  compose: (g: number, h: number) => number
} {
  const act: Int8Array[] = []

  for (let m = 0; m < 81; m++) {
    const [a, b, c, d] = [0, 1, 2, 3].map(
      k => Math.floor(m / 3 ** k) % 3,
    ) as [number, number, number, number]

    if (mod3(a * d - b * c) !== 1) {
      continue
    }

    for (let s = 0; s < 9; s++) {
      const table = new Int8Array(9)

      for (let p = 0; p < 9; p++) {
        const x = p % 3
        const y = Math.floor(p / 3)

        table[p] =
          mod3(a * x + b * y + (s % 3)) +
          3 * mod3(c * x + d * y + Math.floor(s / 3))
      }

      act.push(table)
    }
  }

  const key = (table: Int8Array): string => table.join('')
  const index = new Map(act.map((table, i) => [key(table), i]))

  const compose = (g: number, h: number): number => {
    const table = new Int8Array(9)

    for (let p = 0; p < 9; p++) {
      table[p] = act[g]?.[act[h]?.[p] ?? 0] ?? 0
    }

    return index.get(key(table)) ?? -1
  }

  const identity = index.get('012345678') ?? 0
  const inverse = act.map((_, g) =>
    act.findIndex((__, h) => compose(g, h) === identity),
  )

  return { act, inverse, compose }
}

type State = { vibe: Will; role: Int8Array }

export default experiment({
  id: 'gauge/vibe-role-tilt',
  code: 'E-FRC-0117',
  title:
    'the three-trit slot as one rule: vibes move by the committed rule, role points ride the links and swap where vibes meet, and the whole conserves charge, reverses exactly, and is exactly invariant under an independent change of role frame in every cell, which neither links-free transport nor a fixed move per direction is',
  category: 'gauge',
  substrates: ['3434'],
  depth: 'L2',
  paper: false,
  run() {
    const box = d4BoxMesh({ side: 3 })
    const opposite = meshOpposites(box)
    const forward = turningWeave({ opposite: [...opposite] })
    const backward = turningWeave({
      opposite: [...opposite],
      forward: false,
    })
    const { act, inverse, compose } = gridMoves()
    const identity = act.findIndex(t => t.join('') === '012345678')
    const slots = box.cellCount * 24
    const lines: [number, number][] = []

    for (let d = 0; d < 24; d++) {
      if (d < (opposite[d] ?? d)) {
        lines.push([d, opposite[d] ?? d])
      }
    }

    // a background link field, a link and its reverse inverse to each other
    const links = new Int16Array(slots).fill(-1)

    for (let x = 0; x < box.cellCount; x++) {
      for (let d = 0; d < 24; d++) {
        if ((links[x * 24 + d] ?? -1) >= 0) {
          continue
        }

        const g = Math.floor(
          (((x * 24 + d + 1) * GOLDEN * 7.31) % 1) * act.length,
        )
        const y = box.neighbour(x, d)

        links[x * 24 + d] = g
        links[y * 24 + (opposite[d] ?? d)] = inverse[g] ?? identity
      }
    }

    const exchange = (vibe: Int8Array, role: Int8Array): void => {
      for (let x = 0; x < box.cellCount; x++) {
        for (const [a, b] of lines) {
          if (vibe[x * 24 + a] !== 0 && vibe[x * 24 + b] !== 0) {
            const t = role[x * 24 + a] ?? 0

            role[x * 24 + a] = role[x * 24 + b] ?? 0
            role[x * 24 + b] = t
          }
        }
      }
    }

    // transport: 'links' uses the field, 'none' carries roles unchanged, 'fixed' turns them by one
    // move per direction chosen by the rule
    const fixedMove = Array.from({ length: 24 }, (_, d) =>
      Math.floor((((d + 1) * GOLDEN * 3.7) % 1) * act.length),
    )
    const moveOf = (
      mode: string,
      field: Int16Array,
      x: number,
      d: number,
    ): number =>
      mode === 'links'
        ? (field[x * 24 + d] ?? identity)
        : mode === 'fixed'
          ? (fixedMove[d] ?? identity)
          : identity

    const beatOnce = (
      state: State,
      t: number,
      mode: string,
      field: Int16Array,
    ): State => {
      const vibe: Will = {
        mesh: box,
        data: Int8Array.from(state.vibe.data),
      }
      const role = Int8Array.from(state.role)

      exchange(vibe.data, role)
      collide(vibe, forward(t))

      const moved = new Int8Array(slots)

      for (let x = 0; x < box.cellCount; x++) {
        for (let d = 0; d < 24; d++) {
          const y = box.neighbour(x, d)

          moved[y * 24 + d] =
            act[moveOf(mode, field, x, d)]?.[role[x * 24 + d] ?? 0] ?? 0
        }
      }

      return { vibe: stream(vibe), role: moved }
    }

    const beatBack = (
      state: State,
      t: number,
      field: Int16Array,
    ): State => {
      const back = streamInverse(state.vibe)
      const role = new Int8Array(slots)

      for (let y = 0; y < box.cellCount; y++) {
        for (let d = 0; d < 24; d++) {
          const x = box.neighbour(y, opposite[d] ?? d)

          role[x * 24 + d] =
            act[inverse[field[x * 24 + d] ?? identity] ?? identity]?.[
              state.role[y * 24 + d] ?? 0
            ] ?? 0
        }
      }

      collide(back, backward(t))
      exchange(back.data, role)

      return { vibe: back, role }
    }

    const start = (scale: number): State => {
      const vibe = makeWill(box)
      const role = new Int8Array(slots)

      for (let i = 0; i < slots; i++) {
        const u = ((i + 1) * GOLDEN * scale) % 1

        vibe.data[i] = u < 0.3 ? -1 : u < 0.6 ? 0 : 1
        role[i] = Math.floor(((i + 3) * GOLDEN * scale * 9) % 9)
      }

      return { vibe, role }
    }

    const charge = (w: Will): number =>
      w.data.reduce((a, b) => a + b, 0)

    // charge and reversal
    let chargeKept = true
    let reverses = true

    for (const scale of [1.37, 2.11]) {
      const s0 = start(scale)

      let s = s0

      for (let t = 0; t < 24; t++) {
        s = beatOnce(s, t, 'links', links)
        chargeKept = chargeKept && charge(s.vibe) === charge(s0.vibe)
      }

      for (let t = 23; t >= 0; t--) {
        s = beatBack(s, t, links)
      }

      reverses =
        reverses &&
        s.vibe.data.every((v, i) => v === s0.vibe.data[i]) &&
        s.role.every((v, i) => v === s0.role[i])
    }

    // a change of frame in every cell
    const frame = Array.from({ length: box.cellCount }, (_, x) =>
      Math.floor((((x + 11) * GOLDEN * 5.9) % 1) * act.length),
    )
    const gaugeRoles = (role: Int8Array): Int8Array =>
      Int8Array.from(
        role,
        (p, i) => act[frame[Math.floor(i / 24)] ?? identity]?.[p] ?? 0,
      )

    const gaugeLinks = (field: Int16Array): Int16Array => {
      const out = new Int16Array(slots)

      for (let x = 0; x < box.cellCount; x++) {
        for (let d = 0; d < 24; d++) {
          const y = box.neighbour(x, d)

          out[x * 24 + d] = compose(
            compose(
              frame[y] ?? identity,
              field[x * 24 + d] ?? identity,
            ),
            inverse[frame[x] ?? identity] ?? identity,
          )
        }
      }

      return out
    }

    // how many role slots differ between evolving the changed state and changing the evolved one
    const gaugeMismatch = (
      mode: string,
      transformLinks: boolean,
    ): number => {
      const field =
        mode === 'links' ? links : new Int16Array(slots).fill(identity)
      const changedField = transformLinks ? gaugeLinks(field) : field

      let a = start(1.37)
      let b: State = {
        vibe: { mesh: box, data: Int8Array.from(a.vibe.data) },
        role: gaugeRoles(a.role),
      }
      let mismatch = 0

      for (let t = 0; t < 24; t++) {
        a = beatOnce(a, t, mode, field)
        b = beatOnce(b, t, mode, changedField)

        const expected = gaugeRoles(a.role)

        mismatch += expected.reduce(
          (n, p, i) => n + (p === b.role[i] ? 0 : 1),
          0,
        )

        mismatch += a.vibe.data.reduce(
          (n, v, i) => n + (v === b.vibe.data[i] ? 0 : 1),
          0,
        )
      }

      return mismatch
    }

    const withLinks = gaugeMismatch('links', true)
    const noLinks = gaugeMismatch('none', false)
    const fixedPerDirection = gaugeMismatch('fixed', false)

    const ok =
      act.length === 216 &&
      inverse.every(i => i >= 0) &&
      chargeKept &&
      reverses &&
      withLinks === 0 &&
      noLinks > 0 &&
      fixedPerDirection > 0

    return verdict({
      status: ok ? 'pass' : 'fail',
      claim:
        'vibes under the committed rule with role points carried along links and swapped where vibes meet head-on conserve charge exactly, reverse exactly after 24 beats, and are exactly invariant under an independent change of role frame in every cell, while carrying roles without links or turning them by one fixed move per direction is not',
      metrics: {
        gridMoves: act.length,
        chargeConserved: chargeKept ? 1 : 0,
        reversesExactly: reverses ? 1 : 0,
        gaugeMismatchWithLinks: withLinks,
      },
      control: {
        gaugeMismatchNoLinks: noLinks,
        gaugeMismatchFixedPerDirection: fixedPerDirection,
      },
      notes:
        'L2, a constructed rule, exact, no random numbers (the frames, links and starts are golden-ratio fills). The links are a fixed background field. What it cannot show is a whole: a colour-neutral whole of three roles is a quantum singlet with no classical state (E-FRC-0101), so binding needs the phase on the swap. The mismatch counts are summed over 24 beats, role slots and vibe slots.',
    })
  },
})
