// Roles on moving links (code/rule/moving-links): the color weave's roles carried by links that evolve,
// with every exact law kept. Step 2 of the path in note/experiment/gauge/what-the-base-needs.
//
// The links move by reflection through a triangle's staple, U' = A^-1 U^-1 A^-1, taken where it keeps the
// summed energy of every triangle through the link. Gates, fixed before the run, on the side-3 D4 box from
// a dense start, 24 beats:
// - 24 beats forward and back restore vibes, roles, flows and links exactly
// - the links' energy (every triangle's 9 minus fixed points) is conserved to the unit on every beat
// - the links move: more than half of them differ from the start after 24 beats
// - a change of role frame in every cell, links changed to match, commutes with the whole rule
// - charge, Gauss's law at every cell and the color content of every cell stay exact (0 color leaks)
// Control: the E-FRC-0110 kind of step, each link moved to the next grid move of equal local energy in
// index order, run on the same links. It conserves the same energy and reverses, and a frame change does
// not commute with it: its ensemble is frame-free, its steps are not, which is why the reflection is used.
//
// Depth L2: a constructed rule against stated gates.

import { experiment } from '@/test/scaffold/suite'
import { verdict } from '@/test/scaffold/verdict'
import { colorLeaks, makeColorWeave } from '@/code/rule/color-weave'
import { gaussHolds } from '@/code/rule/vibe-weave'
import { linkEnergy, makeMovingLinks, movingBeat, movingBeatBack, type LinkState, type MovingLinks } from '@/code/rule/moving-links'

const GOLDEN = (Math.sqrt(5) - 1) / 2

// the control step: every link of each line moved to the next grid move of equal local energy, in index order
function indexOrderStep(moving: MovingLinks, links: Int16Array): void {
  const { mesh, moves, opposite, lines } = moving.weave

  for (const [a] of lines) {
    const updates: [number, number][] = []

    for (let x = 0; x < mesh.cellCount; x++) {
      const u = links[x * 24 + a] ?? moves.identity
      const energy = (g: number): number => {
        let total = 0

        for (const [b, c] of moving.staples[a] ?? []) {
          const y = mesh.neighbour(x, a)
          const z = mesh.neighbour(y, b)

          total += moving.level[moves.compose(links[z * 24 + c] ?? moves.identity, moves.compose(links[y * 24 + b] ?? moves.identity, g))] ?? 0
        }

        return total
      }
      const target = energy(u)

      for (let k = 1; k < moves.act.length; k++) {
        const g = (u + k) % moves.act.length

        if (energy(g) === target) {
          updates.push([x, g])
          break
        }
      }
    }

    for (const [x, g] of updates) {
      links[x * 24 + a] = g
      links[mesh.neighbour(x, a) * 24 + (opposite[a] ?? a)] = moves.inverse[g] ?? moves.identity
    }
  }
}

export default experiment({
  id: 'gauge/roles-on-moving-links',
  code: 'E-FRC-0128',
  title:
    "roles on moving links: the color weave's roles carried by links that move by reflection through a triangle's staple, reversing exactly, conserving the links' energy to the unit, commuting with a change of role frame in every cell, and keeping charge, Gauss's law and every cell's color exact, where the index-order step of E-FRC-0110 on the same links breaks the frame change",
  category: 'gauge',
  substrates: ['3434'],
  depth: 'L2',
  paper: false,
  run() {
    const weave = makeColorWeave({ side: 3 })
    const moving = makeMovingLinks(weave)
    const { mesh, moves } = weave
    const slots = mesh.cellCount * 24
    const dense = (scale: number): LinkState => {
      const vibe = new Int8Array(slots)
      const role = new Int8Array(slots)

      for (let i = 0; i < slots; i++) {
        const u = ((i + 1) * GOLDEN * scale) % 1

        vibe[i] = u < 0.3 ? -1 : u < 0.6 ? 0 : 1
        role[i] = Math.floor(((i + 3) * GOLDEN * scale * 9) % 9)
      }

      return { vibe, role, flow: new Int32Array(slots), links: Int16Array.from(weave.links) }
    }
    const same = (a: LinkState, b: LinkState): boolean =>
      a.vibe.every((v, i) => v === b.vibe[i]) &&
      a.role.every((v, i) => v === b.role[i]) &&
      a.flow.every((v, i) => v === b.flow[i]) &&
      a.links.every((v, i) => v === b.links[i])

    const start = dense(1.37)
    const e0 = linkEnergy(moving, start.links)
    const charge = (s: LinkState): number => s.vibe.reduce((a, b) => a + b, 0)

    let s = start
    let reflections = 0
    let energyKept = true
    let chargeKept = true
    let gauss = true
    let leaks = 0

    for (let t = 0; t < 24; t++) {
      leaks += colorLeaks({ ...weave, links: s.links }, s, t)

      const next = movingBeat(moving, s, t)

      s = next.state
      reflections += next.moved
      energyKept = energyKept && linkEnergy(moving, s.links) === e0
      chargeKept = chargeKept && charge(s) === charge(start)
      gauss = gauss && gaussHolds(weave, start, s)
    }

    const linksChanged = s.links.filter((v, i) => v !== start.links[i]).length

    for (let t = 23; t >= 0; t--) {
      s = movingBeatBack(moving, s, t)
    }

    const reverses = same(s, start)

    // a change of role frame in every cell
    const frame = Array.from({ length: mesh.cellCount }, (_, x) => Math.floor((((x + 11) * GOLDEN * 5.9) % 1) * moves.act.length))
    const gaugeLinks = (links: Int16Array): Int16Array => {
      const out = new Int16Array(links.length)

      for (let x = 0; x < mesh.cellCount; x++) {
        for (let d = 0; d < 24; d++) {
          out[x * 24 + d] = moves.compose(
            moves.compose(frame[mesh.neighbour(x, d)] ?? moves.identity, links[x * 24 + d] ?? moves.identity),
            moves.inverse[frame[x] ?? moves.identity] ?? moves.identity,
          )
        }
      }

      return out
    }
    const gauge = (state: LinkState): LinkState => ({
      ...state,
      links: gaugeLinks(state.links),
      role: Int8Array.from(state.role, (p, i) => moves.act[frame[Math.floor(i / 24)] ?? moves.identity]?.[p] ?? 0),
    })

    let a = dense(2.11)
    let b = gauge(a)
    let frameFree = true

    for (let t = 0; t < 24; t++) {
      a = movingBeat(moving, a, t).state
      b = movingBeat(moving, b, t).state
      frameFree = frameFree && same(gauge(a), b)
    }

    // the control: the index-order step on the same links, and on the frame-changed ones
    const plain = Int16Array.from(weave.links)
    const changed = gaugeLinks(weave.links)
    const controlEnergy = linkEnergy(moving, plain)

    let controlMismatch = 0
    let controlEnergyKept = true

    for (let t = 0; t < 6; t++) {
      indexOrderStep(moving, plain)
      indexOrderStep(moving, changed)
      controlEnergyKept = controlEnergyKept && linkEnergy(moving, plain) === controlEnergy

      const expected = gaugeLinks(plain)

      controlMismatch += expected.filter((v, i) => v !== changed[i]).length
    }

    const ok = reverses && energyKept && linksChanged > slots / 2 && frameFree && chargeKept && gauss && leaks === 0 && controlMismatch > 0

    return verdict({
      status: ok ? 'pass' : 'fail',
      claim:
        "with links moving by reflection through a triangle's staple, 24 beats forward and back restore vibes, roles, flows and links exactly, the links' energy is conserved to the unit on every beat, more than half the links move, a change of role frame in every cell commutes with the whole rule, and charge, Gauss's law and every cell's color stay exact, while the index-order step on the same links conserves the energy but does not commute with the frame change",
      metrics: {
        reversesExactly: reverses ? 1 : 0,
        linkEnergyConserved: energyKept ? 1 : 0,
        linkEnergy: e0,
        reflections,
        linksChanged,
        slots,
        frameFree: frameFree ? 1 : 0,
        chargeConserved: chargeKept ? 1 : 0,
        gaussEveryCellEveryBeat: gauss ? 1 : 0,
        colorLeaks: leaks,
      },
      control: {
        indexOrderEnergyConserved: controlEnergyKept ? 1 : 0,
        indexOrderFrameMismatches: controlMismatch,
      },
      notes:
        'L2, exact, no random numbers. The links do not read the matter: the roles ride on moving links, but matter does not yet pull on them, so this is step 2 of the path and not binding. Binding of static color is measured on the Sigma(648) sampler in E-FRC-0126. A cold start (every link the identity) has zero energy and no reflection moves it, so the run starts from the color weave\'s own hashed links.',
    })
  },
})
