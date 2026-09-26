// Links that feel the matter (code/rule/matter-links): the moving links of E-FRC-0128 with a matter term in
// their energy, so a link's move is priced by what it does to the vibes at its two ends, and every move paid
// to a demon. The last open item of note/experiment/gauge/what-the-base-needs.
//
// The energy is the triangles' 9 minus fixed points, minus kappa for every link joining two vibes that
// carries the one's role point onto the other's, plus the demons. Links reflect through a staple, role
// points reflect through a neighbor's point brought across the link, a lone vibe hops to an empty cell with
// its point carried by the link, and each move is taken only where its link's demon can pay.
//
// Gates, fixed before the run, on the side-4 D4 box (256 cells), kappa 3, demon capacity 24, a start with
// about two cells in five holding a vibe, 24 beats:
// - 24 beats forward and back restore vibes, role points, links and demons exactly
// - the energy (triangles + matter term + demons) is the same, to the unit, after every beat
// - love and fear are each conserved on every beat
// - a change of role frame in every cell commutes with the whole rule: 0 mismatches over 24 beats
// - the links move (more than half the undirected links differ from the start after 24 beats), the matter
//   term changes under some of those moves (the links feel it), and role moves and hops both happen
// - all of the above again on the side-5 box (625 cells), for robustness to size
// Controls, each run on the same start:
// - `feel: false`, a link move priced without the matter term: reversal is still exact, and the energy
//   leaks. So the matter term is what the demons pay for
// - `transport: false`, role points compared and carried without the link: energy and reversal still
//   exact, and the frame change no longer commutes. So the coupling is a gauge coupling only through the
//   link
//
// Depth L2: a constructed rule against stated gates.

import { experiment } from '@/test/scaffold/suite'
import { verdict } from '@/test/scaffold/verdict'
import {
  changeFrame,
  fieldEnergy,
  hashedLinks,
  makeMatterLinks,
  matterBeat,
  matterBeatBack,
  matterEnergy,
  totalEnergy,
  type MatterLinks,
  type MatterState,
} from '@/code/rule/matter-links'

const SIDE = 4
const LARGER_SIDE = 5
const KAPPA = 3
const CAPACITY = 24
const BEATS = 24
const GOLDEN = (Math.sqrt(5) - 1) / 2

function start(rule: MatterLinks, scale: number): MatterState {
  const vibe = new Int8Array(rule.cells)
  const role = new Int8Array(rule.cells)

  for (let x = 0; x < rule.cells; x++) {
    const u = ((x + 1) * GOLDEN * scale) % 1

    vibe[x] = u < 0.2 ? -1 : u < 0.4 ? 1 : 0
    role[x] = vibe[x] !== 0 ? Math.floor(((x + 3) * GOLDEN * scale * 9) % 9) : 0
  }

  const demon = new Int32Array(rule.cells * 24)

  for (let x = 0; x < rule.cells; x++) {
    for (const a of rule.firsts) {
      demon[x * 24 + a] = Math.floor((((x * 24 + a + 5) * GOLDEN * scale) % 1) * (CAPACITY + 1))
    }
  }

  return { vibe, role, links: hashedLinks(rule), demon }
}

const same = (a: MatterState, b: MatterState): boolean =>
  a.vibe.every((v, i) => v === b.vibe[i]) &&
  a.role.every((v, i) => v === b.role[i]) &&
  a.links.every((v, i) => v === b.links[i]) &&
  a.demon.every((v, i) => v === b.demon[i])

const mismatches = (a: MatterState, b: MatterState): number =>
  a.vibe.filter((v, i) => v !== b.vibe[i]).length +
  a.role.filter((v, i) => v !== b.role[i]).length +
  a.links.filter((v, i) => v !== b.links[i]).length +
  a.demon.filter((v, i) => v !== b.demon[i]).length

type Run = {
  reverses: boolean
  energyExact: boolean
  drift: number
  loveFearExact: boolean
  frameMismatches: number
  linksChanged: number
  links: number
  moves: { links: number; felt: number; roles: number; hops: number }
  field: number
  matter: number
}

function run(rule: MatterLinks, scale: number): Run {
  const s0 = start(rule, scale)
  const e0 = totalEnergy(rule, s0)
  const count = (s: MatterState, v: number): number => s.vibe.filter(x => x === v).length
  const moves = { links: 0, felt: 0, roles: 0, hops: 0 }

  let s = s0
  let energyExact = true
  let drift = 0
  let loveFearExact = true

  for (let t = 0; t < BEATS; t++) {
    const next = matterBeat(rule, s, t)

    s = next.state
    moves.links += next.moved.links
    moves.felt += next.moved.felt
    moves.roles += next.moved.roles
    moves.hops += next.moved.hops

    const e = totalEnergy(rule, s)

    energyExact = energyExact && e === e0
    drift = Math.max(drift, Math.abs(e - e0))
    loveFearExact = loveFearExact && count(s, 1) === count(s0, 1) && count(s, -1) === count(s0, -1)
  }

  let linksChanged = 0

  for (let x = 0; x < rule.cells; x++) {
    for (const a of rule.firsts) {
      linksChanged += s.links[x * 24 + a] !== s0.links[x * 24 + a] ? 1 : 0
    }
  }

  const field = fieldEnergy(rule, s.links)
  const matter = matterEnergy(rule, s)

  for (let t = BEATS - 1; t >= 0; t--) {
    s = matterBeatBack(rule, s, t)
  }

  const reverses = same(s, s0)

  // a change of role frame in every cell
  const frame = Array.from({ length: rule.cells }, (_, x) => Math.floor((((x + 11) * GOLDEN * 5.9) % 1) * rule.order))

  let a = start(rule, scale * 1.7)
  let b = changeFrame(rule, a, frame)
  let frameMismatches = 0

  for (let t = 0; t < BEATS; t++) {
    a = matterBeat(rule, a, t).state
    b = matterBeat(rule, b, t).state
    frameMismatches += mismatches(changeFrame(rule, a, frame), b)
  }

  return {
    reverses,
    energyExact,
    drift,
    loveFearExact,
    frameMismatches,
    linksChanged,
    links: rule.cells * rule.firsts.length,
    moves,
    field,
    matter,
  }
}

export default experiment({
  id: 'gauge/links-feel-matter',
  code: 'E-FRC-0134',
  title:
    "links that feel the matter: the moving links of E-FRC-0128 with a matter term (a link joining two vibes lowers the energy by kappa when it carries the one's role point onto the other's, the hopping term) in their energy, every link, role and hop move paid to a demon, reversing exactly, conserving the energy to the unit and love and fear, and commuting with a change of role frame in every cell, where a link move priced without the matter term leaks energy and matter coupled without the link breaks the frame change",
  category: 'gauge',
  substrates: ['3434'],
  depth: 'L2',
  paper: false,
  run() {
    const rule = makeMatterLinks({ side: SIDE, kappa: KAPPA, capacity: CAPACITY })
    const blind = makeMatterLinks({ side: SIDE, kappa: KAPPA, capacity: CAPACITY, feel: false })
    const bare = makeMatterLinks({ side: SIDE, kappa: KAPPA, capacity: CAPACITY, transport: false })

    const main = run(rule, 1.37)
    const larger = run(makeMatterLinks({ side: LARGER_SIDE, kappa: KAPPA, capacity: CAPACITY }), 1.37)
    const blindRun = run(blind, 1.37)
    const bareRun = run(bare, 1.37)

    const ok =
      [main, larger].every(
        r =>
          r.reverses &&
          r.energyExact &&
          r.loveFearExact &&
          r.frameMismatches === 0 &&
          r.linksChanged > r.links / 2 &&
          r.moves.felt > 0 &&
          r.moves.roles > 0 &&
          r.moves.hops > 0,
      ) &&
      blindRun.reverses &&
      blindRun.drift > 0 &&
      bareRun.reverses &&
      bareRun.energyExact &&
      bareRun.frameMismatches > 0

    return verdict({
      status: ok ? 'pass' : 'fail',
      claim:
        "with a matter term in the links' energy and every move paid to a demon, 24 beats forward and back restore vibes, role points, links and demons exactly, the energy is conserved to the unit and love and fear are each conserved on every beat, a change of role frame in every cell commutes with the whole rule, more than half the links move and some of those moves change the matter term, while a link move priced without the matter term leaks energy and matter coupled without the link breaks the frame change",
      metrics: {
        reversesExactly: main.reverses ? 1 : 0,
        energyConserved: main.energyExact ? 1 : 0,
        loveAndFearConserved: main.loveFearExact ? 1 : 0,
        frameMismatches: main.frameMismatches,
        linksChanged: main.linksChanged,
        links: main.links,
        linkMoves: main.moves.links,
        linkMovesThatChangedTheMatterTerm: main.moves.felt,
        roleMoves: main.moves.roles,
        hops: main.moves.hops,
        fieldEnergyAfter: main.field,
        matterEnergyAfter: main.matter,
        side5ReversesExactly: larger.reverses ? 1 : 0,
        side5EnergyConserved: larger.energyExact ? 1 : 0,
        side5LoveAndFearConserved: larger.loveFearExact ? 1 : 0,
        side5FrameMismatches: larger.frameMismatches,
        side5LinksChanged: larger.linksChanged,
        side5Links: larger.links,
        side5LinkMovesThatChangedTheMatterTerm: larger.moves.felt,
        side5Hops: larger.moves.hops,
      },
      control: {
        blindLinksReverse: blindRun.reverses ? 1 : 0,
        blindLinksEnergyDrift: blindRun.drift,
        untransportedReverses: bareRun.reverses ? 1 : 0,
        untransportedEnergyConserved: bareRun.energyExact ? 1 : 0,
        untransportedFrameMismatches: bareRun.frameMismatches,
      },
      notes:
        'L2, exact integers, no random numbers. Matter waits in cells (the second route of E-FRC-0130), not the committed slot architecture: in the slots every vibe streams every beat unconditionally, so a matter term in the energy could not be paid for. There is no pair creation, so love and fear are each conserved, not only their difference. The matter term is the classical hopping term of the role points, which see the 216 grid moves, Sigma(648) with its center divided out, so it couples the gluon-like (adjoint) part of color and not the triality.',
    })
  },
})
