// One Sigma(648) element per link (code/rule/sigma-links): the rule of E-FRC-0144 with each link's grid
// move replaced by the full element of the classical color group, priced on its character Re Tr, so the
// gauge field itself feels the center. The grid move a role point rides is the element's quotient.
//
// First, the group, checked rather than assumed: 648 elements, each acting on the 9 phase points by one of
// the 216 grid moves, the quotient a homomorphism on all 648 x 648 pairs, and its kernel exactly 3 elements,
// the center, with |Tr| = 3. The center element w costs level 9 where its grid move costs nothing.
//
// Then the rule. Gates, fixed before the run, on the side-4 D4 box (256 docks) and again on side 5 (625
// docks), kappa 3, tension 3, demon capacity 24, 24 beats, from love and fear pairs on neighboring docks each
// joined by one unit of flux:
// - 24 beats forward and back restore vibes, role points, links, flux and demons exactly
// - the energy (triangles on Re Tr + matter term + tension + demons) is the same, to the unit, every beat
// - love and fear are each conserved, and Gauss's law holds at every dock, on every beat
// - a change of frame by elements of all 648 in every dock commutes with the whole rule, and so does a
//   change by center elements alone: 0 mismatches over 24 beats each
// - the links move (more than half), flux loops, role moves and hops happen, and some triangles hold a
//   transport that is a center element other than 1 (the field carries center content the grid cannot see)
// Controls, on the side-4 start:
// - `gauss: false`, `priceFlux: false`, `transport: false`, as in E-FRC-0144: Gauss's law breaks, energy
//   leaks, the frame change breaks
// - the identification the note asked for, the link's center phase equal to E mod 3: under a center frame
//   change z in every dock the phase of each link moves by z_y - z_x, so E would move by it too, and the
//   flux out of a dock would change by the sum of z_y - z_x over its 24 links. Counted: the docks where
//   that sum is not 0 mod 3, so Gauss's law would break
//
// Depth L2: a constructed rule against stated gates.

import { experiment } from '@/test/scaffold/suite'
import { verdict } from '@/test/scaffold/verdict'
import {
  addSigmaFlux,
  centerElements,
  changeSigmaFrame,
  hashedSigmaLinks,
  makeSigmaLinks,
  sigmaBeat,
  sigmaBeatBack,
  sigmaEnergy,
  sigmaGaussViolations,
  pathTransport,
  type SigmaLinks,
  type SigmaState,
} from '@/code/rule/sigma-links'

const SIDES = [4, 5]
const KAPPA = 3
const TENSION = 3
const CAPACITY = 24
const BEATS = 24
const GOLDEN = (Math.sqrt(5) - 1) / 2

function start(rule: SigmaLinks, scale: number): SigmaState {
  const vibe = new Int8Array(rule.cells)
  const role = new Int8Array(rule.cells)
  const flux = new Int32Array(rule.cells * 24)

  for (let x = 0; x < rule.cells; x++) {
    const u = ((x + 1) * GOLDEN * scale) % 1
    const d = Math.floor(((x + 2) * GOLDEN * scale * 24) % 24)
    const y = rule.neighbour[x * 24 + d] ?? 0

    if (u < 0.3 && vibe[x] === 0 && vibe[y] === 0) {
      const love = u < 0.15

      vibe[x] = love ? 1 : -1
      vibe[y] = love ? -1 : 1
      role[x] = Math.floor(((x + 3) * GOLDEN * scale * 9) % 9)
      role[y] = Math.floor(((y + 5) * GOLDEN * scale * 9) % 9)
      addSigmaFlux(rule, flux, x, d, love ? 1 : -1)
    }
  }

  const demon = new Int32Array(rule.cells * 24)

  for (let x = 0; x < rule.cells; x++) {
    for (const a of rule.firsts) {
      demon[x * 24 + a] = Math.floor((((x * 24 + a + 5) * GOLDEN * scale) % 1) * (CAPACITY + 1))
    }
  }

  return { vibe, role, links: hashedSigmaLinks(rule), demon, flux }
}

const fields = (s: SigmaState): ArrayLike<number>[] => [s.vibe, s.role, s.links, s.demon, s.flux]

const mismatches = (a: SigmaState, b: SigmaState): number => {
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
  centerFrameMismatches: number
  linksChanged: number
  links: number
  moves: { links: number; loops: number; roles: number; hops: number }
  centerTriangles: number
}

function run(rule: SigmaLinks, scale: number): Run {
  const s0 = start(rule, scale)
  const e0 = sigmaEnergy(rule, s0)
  const count = (s: SigmaState, v: number): number => s.vibe.filter(x => x === v).length
  const moves = { links: 0, loops: 0, roles: 0, hops: 0 }
  const center = new Set(centerElements(rule))

  let s = s0
  let energyExact = true
  let drift = 0
  let loveFearExact = true
  let violations = sigmaGaussViolations(rule, s0)

  for (let t = 0; t < BEATS; t++) {
    const next = sigmaBeat(rule, s, t)

    s = next.state
    moves.links += next.moved.links
    moves.loops += next.moved.loops
    moves.roles += next.moved.roles
    moves.hops += next.moved.hops

    const e = sigmaEnergy(rule, s)

    energyExact = energyExact && e === e0
    drift = Math.max(drift, Math.abs(e - e0))
    loveFearExact = loveFearExact && count(s, 1) === count(s0, 1) && count(s, -1) === count(s0, -1)
    violations += sigmaGaussViolations(rule, s)
  }

  // triangles whose transport is a center element other than 1, after 24 beats
  let centerTriangles = 0

  for (let x = 0; x < rule.cells; x++) {
    for (const a of rule.firsts) {
      for (const [b, c] of rule.staples[a] ?? []) {
        const g = pathTransport(rule, s.links, x, [a, b, c])

        centerTriangles += center.has(g) && g !== rule.identity ? 1 : 0
      }
    }
  }

  let linksChanged = 0

  for (let x = 0; x < rule.cells; x++) {
    for (const a of rule.firsts) {
      linksChanged += s.links[x * 24 + a] !== s0.links[x * 24 + a] ? 1 : 0
    }
  }

  for (let t = BEATS - 1; t >= 0; t--) {
    s = sigmaBeatBack(rule, s, t)
  }

  const reverses = mismatches(s, s0) === 0
  const centers = [...center]
  const frames = [
    Array.from({ length: rule.cells }, (_, x) => Math.floor((((x + 11) * GOLDEN * 5.9) % 1) * rule.order)),
    Array.from({ length: rule.cells }, (_, x) => centers[Math.floor((((x + 13) * GOLDEN * 4.3) % 1) * 3)] ?? rule.identity),
  ]
  const frameCounts = frames.map(frame => {
    let a = start(rule, scale * 1.7)
    let b = changeSigmaFrame(rule, a, frame)
    let n = 0

    for (let t = 0; t < BEATS; t++) {
      a = sigmaBeat(rule, a, t).state
      b = sigmaBeat(rule, b, t).state
      n += mismatches(changeSigmaFrame(rule, a, frame), b)
    }

    return n
  })

  return {
    reverses,
    energyExact,
    drift,
    loveFearExact,
    gaussViolations: violations,
    frameMismatches: frameCounts[0] ?? -1,
    centerFrameMismatches: frameCounts[1] ?? -1,
    linksChanged,
    links: rule.cells * rule.firsts.length,
    moves,
    centerTriangles: centerTriangles / 3,
  }
}

export default experiment({
  id: 'gauge/sigma-flux-links',
  code: 'E-FRC-0150',
  title:
    "one Sigma(648) element per link: the rule of E-FRC-0144 with each link's grid move replaced by the full element of the classical color group, priced on Re Tr so the field feels the center, the grid move its quotient (a homomorphism with kernel exactly the 3 center elements), reversing exactly, conserving energy to the unit, love and fear, keeping Gauss's law and commuting with a frame change by all 648 elements, while identifying the link's center phase with E mod 3 would break Gauss's law under a center frame change",
  category: 'gauge',
  substrates: ['3434'],
  depth: 'L2',
  paper: false,
  run() {
    const make = (side: number, extra: { gauss?: boolean; priceFlux?: boolean; transport?: boolean } = {}): SigmaLinks =>
      makeSigmaLinks({ side, kappa: KAPPA, tension: TENSION, capacity: CAPACITY, ...extra })
    const base = make(SIDES[0] ?? 4)
    const { group, quotient } = base

    // the quotient is a homomorphism, and its kernel is the center
    let homomorphismFailures = 0

    for (let g = 0; g < group.order; g++) {
      for (let h = 0; h < group.order; h++) {
        const gh = group.product[g * group.order + h] ?? 0
        const composed = base.act.slice((quotient[g] ?? 0) * 9, (quotient[g] ?? 0) * 9 + 9)
        const inner = base.act.slice((quotient[h] ?? 0) * 9, (quotient[h] ?? 0) * 9 + 9)
        const outer = base.act.slice((quotient[gh] ?? 0) * 9, (quotient[gh] ?? 0) * 9 + 9)

        homomorphismFailures += inner.some((p, q) => composed[p] !== outer[q]) ? 1 : 0
      }
    }

    const kernel = centerElements(base)
    const kernelIsCenter = kernel.every(g => Math.abs(Math.hypot(group.trace[g] ?? 0, base.traceIm[g] ?? 0) - 3) < 1e-9)
    const omega = kernel.find(g => g !== base.identity) ?? base.identity

    const runs = SIDES.map(side => run(make(side), 1.37))
    const leftBehind = run(make(SIDES[0] ?? 4, { gauss: false }), 1.37)
    const unpaid = run(make(SIDES[0] ?? 4, { priceFlux: false }), 1.37)
    const bare = run(make(SIDES[0] ?? 4, { transport: false }), 1.37)

    // the literal identification: docks where a center frame change would break Gauss's law
    const z = Array.from({ length: base.cells }, (_, x) => Math.floor((((x + 13) * GOLDEN * 4.3) % 1) * 3))

    let brokenDocks = 0

    for (let x = 0; x < base.cells; x++) {
      let sum = 0

      for (let d = 0; d < 24; d++) {
        sum += (z[base.neighbour[x * 24 + d] ?? 0] ?? 0) - (z[x] ?? 0)
      }

      brokenDocks += ((sum % 3) + 3) % 3 !== 0 ? 1 : 0
    }

    const ok =
      group.order === 648 &&
      homomorphismFailures === 0 &&
      kernel.length === 3 &&
      kernelIsCenter &&
      runs.every(
        r =>
          r.reverses &&
          r.energyExact &&
          r.loveFearExact &&
          r.gaussViolations === 0 &&
          r.frameMismatches === 0 &&
          r.centerFrameMismatches === 0 &&
          r.linksChanged > r.links / 2 &&
          r.moves.loops > 0 &&
          r.moves.roles > 0 &&
          r.moves.hops > 0 &&
          r.centerTriangles > 0,
      ) &&
      leftBehind.reverses &&
      leftBehind.gaussViolations > 0 &&
      unpaid.reverses &&
      unpaid.drift > 0 &&
      bare.frameMismatches > 0

    return verdict({
      status: ok ? 'pass' : 'fail',
      claim:
        "the group has 648 elements, its action on the phase points is a homomorphism onto grid moves with kernel exactly the 3 center elements, and on the side-4 and side-5 boxes 24 beats forward and back restore everything exactly, the energy is conserved to the unit, love and fear and Gauss's law hold every beat, a frame change by all 648 elements and one by center elements alone commute with the rule, the links move, flux loops, role moves and hops happen and some triangles carry a center element other than 1, while a hop that leaves its flux behind breaks Gauss's law, unpaid flux leaks energy and matter carried without the link breaks the frame change",
      metrics: {
        groupOrder: group.order,
        homomorphismFailures,
        kernelSize: kernel.length,
        kernelIsCenter: kernelIsCenter ? 1 : 0,
        centerElementLevel: base.level[omega] ?? -1,
        ...Object.fromEntries(
          runs.flatMap((r, k) => {
            const p = `side${SIDES[k]}`

            return [
              [`${p}ReversesExactly`, r.reverses ? 1 : 0],
              [`${p}EnergyConserved`, r.energyExact ? 1 : 0],
              [`${p}LoveAndFearConserved`, r.loveFearExact ? 1 : 0],
              [`${p}GaussViolations`, r.gaussViolations],
              [`${p}FrameMismatches`, r.frameMismatches],
              [`${p}CenterFrameMismatches`, r.centerFrameMismatches],
              [`${p}LinksChanged`, r.linksChanged],
              [`${p}Links`, r.links],
              [`${p}LinkMoves`, r.moves.links],
              [`${p}FluxLoopMoves`, r.moves.loops],
              [`${p}RoleMoves`, r.moves.roles],
              [`${p}Hops`, r.moves.hops],
              [`${p}CenterTriangles`, r.centerTriangles],
            ]
          }),
        ),
      },
      control: {
        fluxLeftBehindReverses: leftBehind.reverses ? 1 : 0,
        fluxLeftBehindGaussViolations: leftBehind.gaussViolations,
        unpaidFluxReverses: unpaid.reverses ? 1 : 0,
        unpaidFluxEnergyDrift: unpaid.drift,
        untransportedFrameMismatches: bare.frameMismatches,
        phaseAsFluxBrokenDocks: brokenDocks,
        docks: base.cells,
      },
      notes:
        "L2, exact integers, no random numbers. The link's center phase is carried by the element itself, round loops, and the flux E beside it is its conjugate, gauge invariant, with Gauss's law. The two are not identified: a center frame change moves the phase and must leave E alone, or Gauss's law breaks at the docks counted in the control. They meet only through the matter, as in E-FRC-0144, so the center phase and the triality flux are two faces of the center that this rule does not yet join.",
    })
  },
})
