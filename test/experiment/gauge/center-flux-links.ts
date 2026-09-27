// The whole three-trit link (code/rule/center-links): each link holds the grid move of E-FRC-0134 and the
// center flux of E-FRC-0131 together, the grid move priced with the hopping term and the flux with Gauss's
// law and a tension on E mod 3, every move paid to a demon.
//
// Gates, fixed before the run, on the side-4 D4 box (256 cells) and again on side 5 (625 cells), kappa 3,
// tension 3, demon capacity 24, 24 beats, from a start of love and fear pairs on neighboring cells each
// joined by one unit of flux (so Gauss's law holds at the start):
// - 24 beats forward and back restore vibes, role points, links, flux and demons exactly
// - the energy (triangles + matter term + tension + demons) is the same, to the unit, after every beat
// - love and fear are each conserved, and Gauss's law holds at every cell, on every beat
// - a change of role frame in every cell commutes with the whole rule: 0 mismatches over 24 beats
// - the links move (more than half of them), and flux loops, role moves and hops all happen
// Controls, each on the side-4 start:
// - `gauss: false`, a hop that leaves the flux behind: reversal still exact, Gauss's law breaks
// - `priceFlux: false`, flux moves taken without paying the tension: reversal still exact, energy leaks
// - `transport: false`, role points carried without the link: the frame change no longer commutes
//
// Depth L2: a constructed rule against stated gates.

import { experiment } from '@/test/scaffold/suite'
import { verdict } from '@/test/scaffold/verdict'
import { hashedLinks } from '@/code/rule/matter-links'
import {
  addFlux,
  centerBeat,
  centerBeatBack,
  centerEnergy,
  changeCenterFrame,
  gaussViolations,
  makeCenterLinks,
  stringLinks,
  type CenterLinks,
  type CenterState,
} from '@/code/rule/center-links'

const SIDES = [4, 5]
const KAPPA = 3
const TENSION = 3
const CAPACITY = 24
const BEATS = 24
const GOLDEN = (Math.sqrt(5) - 1) / 2

// love and fear pairs on neighboring cells, each joined by one unit of flux from the love to the fear
function start(rule: CenterLinks, scale: number): CenterState {
  const { matter } = rule
  const vibe = new Int8Array(matter.cells)
  const role = new Int8Array(matter.cells)
  const flux = new Int32Array(matter.cells * 24)

  for (let x = 0; x < matter.cells; x++) {
    const u = ((x + 1) * GOLDEN * scale) % 1
    const d = Math.floor(((x + 2) * GOLDEN * scale * 24) % 24)
    const y = matter.neighbour[x * 24 + d] ?? 0

    if (u < 0.3 && vibe[x] === 0 && vibe[y] === 0) {
      const love = u < 0.15

      vibe[x] = love ? 1 : -1
      vibe[y] = love ? -1 : 1
      role[x] = Math.floor(((x + 3) * GOLDEN * scale * 9) % 9)
      role[y] = Math.floor(((y + 5) * GOLDEN * scale * 9) % 9)
      addFlux(rule, flux, x, d, love ? 1 : -1)
    }
  }

  const demon = new Int32Array(matter.cells * 24)

  for (let x = 0; x < matter.cells; x++) {
    for (const a of matter.firsts) {
      demon[x * 24 + a] = Math.floor((((x * 24 + a + 5) * GOLDEN * scale) % 1) * (CAPACITY + 1))
    }
  }

  return { vibe, role, links: hashedLinks(matter), demon, flux }
}

const fields = (s: CenterState): ArrayLike<number>[] => [s.vibe, s.role, s.links, s.demon, s.flux]

const mismatches = (a: CenterState, b: CenterState): number => {
  const right = fields(b)

  return fields(a).reduce((n, f, k) => n + Array.from(f).filter((v, i) => v !== right[k]?.[i]).length, 0)
}

type Run = {
  reverses: boolean
  energyExact: boolean
  drift: number
  loveFearExact: boolean
  gaussViolations: number
  frameMismatches: number
  linksChanged: number
  links: number
  moves: { links: number; loops: number; roles: number; hops: number }
  stringLinks: [number, number]
}

function run(rule: CenterLinks, scale: number): Run {
  const { matter } = rule
  const s0 = start(rule, scale)
  const e0 = centerEnergy(rule, s0)
  const count = (s: CenterState, v: number): number => s.vibe.filter(x => x === v).length
  const moves = { links: 0, loops: 0, roles: 0, hops: 0 }

  let s = s0
  let energyExact = true
  let drift = 0
  let loveFearExact = true
  let violations = gaussViolations(rule, s0)

  for (let t = 0; t < BEATS; t++) {
    const next = centerBeat(rule, s, t)

    s = next.state
    moves.links += next.moved.links
    moves.loops += next.moved.loops
    moves.roles += next.moved.roles
    moves.hops += next.moved.hops

    const e = centerEnergy(rule, s)

    energyExact = energyExact && e === e0
    drift = Math.max(drift, Math.abs(e - e0))
    loveFearExact = loveFearExact && count(s, 1) === count(s0, 1) && count(s, -1) === count(s0, -1)
    violations += gaussViolations(rule, s)
  }

  let linksChanged = 0

  for (let x = 0; x < matter.cells; x++) {
    for (const a of matter.firsts) {
      linksChanged += s.links[x * 24 + a] !== s0.links[x * 24 + a] ? 1 : 0
    }
  }

  const strings: [number, number] = [stringLinks(rule, s0.flux), stringLinks(rule, s.flux)]

  for (let t = BEATS - 1; t >= 0; t--) {
    s = centerBeatBack(rule, s, t)
  }

  const reverses = mismatches(s, s0) === 0
  const frame = Array.from({ length: matter.cells }, (_, x) => Math.floor((((x + 11) * GOLDEN * 5.9) % 1) * matter.order))

  let a = start(rule, scale * 1.7)
  let b = changeCenterFrame(rule, a, frame)
  let frameMismatches = 0

  for (let t = 0; t < BEATS; t++) {
    a = centerBeat(rule, a, t).state
    b = centerBeat(rule, b, t).state
    frameMismatches += mismatches(changeCenterFrame(rule, a, frame), b)
  }

  return {
    reverses,
    energyExact,
    drift,
    loveFearExact,
    gaussViolations: violations,
    frameMismatches,
    linksChanged,
    links: matter.cells * matter.firsts.length,
    moves,
    stringLinks: strings,
  }
}

export default experiment({
  id: 'gauge/center-flux-links',
  code: 'E-FRC-0144',
  title:
    "the whole three-trit link: each link holds the grid move (priced with the hopping term) and the center flux (Gauss's law, a tension on E mod 3) together, every link, flux loop, role and hop move paid to a demon, reversing exactly, conserving the energy to the unit and love and fear, keeping Gauss's law at every cell and commuting with a change of role frame in every cell, where a hop that leaves its flux behind breaks Gauss's law, unpaid flux leaks energy and matter carried without the link breaks the frame change",
  category: 'gauge',
  substrates: ['3434'],
  depth: 'L2',
  paper: false,
  run() {
    const make = (side: number, extra: { gauss?: boolean; priceFlux?: boolean; transport?: boolean } = {}): CenterLinks =>
      makeCenterLinks({ side, kappa: KAPPA, tension: TENSION, capacity: CAPACITY, ...extra })

    const runs = SIDES.map(side => run(make(side), 1.37))
    const leftBehind = run(make(SIDES[0] ?? 4, { gauss: false }), 1.37)
    const unpaid = run(make(SIDES[0] ?? 4, { priceFlux: false }), 1.37)
    const bare = run(make(SIDES[0] ?? 4, { transport: false }), 1.37)

    const ok =
      runs.every(
        r =>
          r.reverses &&
          r.energyExact &&
          r.loveFearExact &&
          r.gaussViolations === 0 &&
          r.frameMismatches === 0 &&
          r.linksChanged > r.links / 2 &&
          r.moves.loops > 0 &&
          r.moves.roles > 0 &&
          r.moves.hops > 0,
      ) &&
      leftBehind.reverses &&
      leftBehind.gaussViolations > 0 &&
      unpaid.reverses &&
      unpaid.drift > 0 &&
      bare.frameMismatches > 0

    return verdict({
      status: ok ? 'pass' : 'fail',
      claim:
        "on the side-4 and side-5 boxes, 24 beats forward and back restore vibes, role points, links, flux and demons exactly, the energy is conserved to the unit, love and fear are each conserved and Gauss's law holds at every cell on every beat, a change of role frame in every cell commutes with the whole rule, more than half the links move, and flux loops, role moves and hops all happen, while a hop that leaves its flux behind breaks Gauss's law, unpaid flux moves leak energy and matter carried without the link breaks the frame change",
      metrics: Object.fromEntries(
        runs.flatMap((r, k) => {
          const p = `side${SIDES[k]}`

          return [
            [`${p}ReversesExactly`, r.reverses ? 1 : 0],
            [`${p}EnergyConserved`, r.energyExact ? 1 : 0],
            [`${p}LoveAndFearConserved`, r.loveFearExact ? 1 : 0],
            [`${p}GaussViolations`, r.gaussViolations],
            [`${p}FrameMismatches`, r.frameMismatches],
            [`${p}LinksChanged`, r.linksChanged],
            [`${p}Links`, r.links],
            [`${p}LinkMoves`, r.moves.links],
            [`${p}FluxLoopMoves`, r.moves.loops],
            [`${p}RoleMoves`, r.moves.roles],
            [`${p}Hops`, r.moves.hops],
            [`${p}StringLinksAtStart`, r.stringLinks[0]],
            [`${p}StringLinksAfter`, r.stringLinks[1]],
          ]
        }),
      ),
      control: {
        fluxLeftBehindReverses: leftBehind.reverses ? 1 : 0,
        fluxLeftBehindGaussViolations: leftBehind.gaussViolations,
        unpaidFluxReverses: unpaid.reverses ? 1 : 0,
        unpaidFluxEnergyDrift: unpaid.drift,
        untransportedFrameMismatches: bare.frameMismatches,
      },
      notes:
        "L2, exact integers, no random numbers. The link holds the grid move and the center's electric flux side by side, 216 x 3 labels, the Sigma(648) element read as the grid move and its center's conjugate. The center phase is not a separate variable, and U and E do not enter one another's energy: they meet only through the matter. Matter waits in cells, as in E-FRC-0131 and 0134, and there is no pair creation.",
    })
  },
})
