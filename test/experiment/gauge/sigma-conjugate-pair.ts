// The center phase and the flux as a conjugate pair (code/rule/sigma-links with `couple: 'center'`): every
// change of a link's flux E twists the link by the center element w to that change, so the phase and the
// flux now meet directly, not only through the matter.
//
// E-FRC-0150 showed the link's center phase cannot simply be E mod 3: against a fixed section, a center
// frame change moves the phase and would have to move E, breaking Gauss's law at 187 of 256 docks. The
// coupling here makes the phase E mod 3 relative to the link's untwisted part g w^-E instead, which a frame
// change moves along with g, so Gauss's law and every frame change survive. Two moves carry it:
// - a flux loop move round a triangle shifts E by d = +1 or -1 on its three links and multiplies each, in
//   its direction of travel, by w^d. The triangle's own transport gains w^3 = 1, every other triangle
//   through those links turns by w or w^2, and the demon pays for them
// - a hop shifts E by -v on the link it crosses and twists that link by w^-v
// Both are involutions, the center commutes with every element, and a flux loop is closed, so Gauss's law,
// reversal and covariance are kept by construction and checked here.
//
// Gates, fixed before the run, on the side-4 (256 docks) and side-5 (625 docks) D4 boxes, kappa 3, tension
// 3, demon capacity 24, 24 beats, from love and fear pairs on neighboring docks each joined by one unit of
// flux:
// - 24 beats forward and back restore everything exactly, the energy is conserved to the unit, love and
//   fear and Gauss's law hold every beat
// - a frame change by all 648 elements, and one by center elements alone, commute with the rule: 0
//   mismatches
// - the links move, and flux loops and hops happen
// - the lock: with link reflections stopped, the untwisted part g w^-E of every link is the same on every
//   beat, while the links and the flux both change. Every flux move is a phase move and no phase move is
//   made without one
// Controls, on the side-4 start:
// - `couple: 'none'`, reflections stopped: the untwisted part changes, so the lock comes from the coupling
// - `couple: 'fixed'`, a twist by a fixed element outside the center: the frame change breaks, so the
//   twist must be central
// - `priceField: false`, twists taken without paying for the triangles they turn: the energy leaks
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
  untwistedLinks,
  type SigmaLinks,
  type SigmaState,
} from '@/code/rule/sigma-links'

const SIDES = [4, 5]
const KAPPA = 3
const TENSION = 3
const CAPACITY = 24
const BEATS = 24
const GOLDEN = (Math.sqrt(5) - 1) / 2

type Extra = { couple?: 'none' | 'center' | 'fixed'; priceField?: boolean; reflect?: boolean }

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

const differ = (a: ArrayLike<number>, b: ArrayLike<number>): number => Array.from(a).filter((v, i) => v !== b[i]).length

type Run = {
  reverses: boolean
  energyExact: boolean
  drift: number
  loveFearExact: boolean
  gaussViolations: number
  frameMismatches: number
  centerFrameMismatches: number
  linksChanged: number
  fluxChanged: number
  untwistedChanged: number
  links: number
  moves: { links: number; loops: number; roles: number; hops: number }
}

function run(rule: SigmaLinks, scale: number): Run {
  const s0 = start(rule, scale)
  const e0 = sigmaEnergy(rule, s0)
  const u0 = untwistedLinks(rule, s0)
  const count = (s: SigmaState, v: number): number => s.vibe.filter(x => x === v).length
  const moves = { links: 0, loops: 0, roles: 0, hops: 0 }

  let s = s0
  let energyExact = true
  let drift = 0
  let loveFearExact = true
  let violations = sigmaGaussViolations(rule, s0)
  let untwistedChanged = 0

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
    untwistedChanged += differ(untwistedLinks(rule, s), u0)
  }

  const linksChanged = differ(s.links, s0.links)
  const fluxChanged = differ(s.flux, s0.flux)

  for (let t = BEATS - 1; t >= 0; t--) {
    s = sigmaBeatBack(rule, s, t)
  }

  const reverses = mismatches(s, s0) === 0
  const centers = centerElements(rule)
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
    fluxChanged,
    untwistedChanged,
    // linksChanged counts directed link slots, both ways round each link
    links: rule.cells * 24,
    moves,
  }
}

export default experiment({
  id: 'gauge/sigma-conjugate-pair',
  code: 'E-FRC-0154',
  title:
    "the center phase and the flux as a conjugate pair: every change of a link's flux twists the link by the center element to that change, in flux loops and in hops, so the phase is E mod 3 relative to the link's untwisted part, reversing exactly, conserving energy to the unit, love and fear, keeping Gauss's law and commuting with a frame change by all 648 elements, with the untwisted part of every link fixed whenever the links do not reflect, where the uncoupled rule breaks that lock, a non-central twist breaks the frame change and an unpaid twist leaks energy",
  category: 'gauge',
  substrates: ['3434'],
  depth: 'L2',
  paper: false,
  run() {
    const make = (side: number, extra: Extra = {}): SigmaLinks =>
      makeSigmaLinks({ side, kappa: KAPPA, tension: TENSION, capacity: CAPACITY, couple: 'center', ...extra })
    const first = SIDES[0] ?? 4

    const runs = SIDES.map(side => run(make(side), 1.37))
    const locked = SIDES.map(side => run(make(side, { reflect: false }), 1.37))
    const unlocked = run(make(first, { couple: 'none', reflect: false }), 1.37)
    const fixed = run(make(first, { couple: 'fixed' }), 1.37)
    const unpaid = run(make(first, { priceField: false }), 1.37)

    const exact = (r: Run): boolean =>
      r.reverses && r.energyExact && r.loveFearExact && r.gaussViolations === 0 && r.frameMismatches === 0 && r.centerFrameMismatches === 0

    const ok =
      runs.every(r => exact(r) && r.linksChanged > r.links / 2 && r.moves.loops > 0 && r.moves.hops > 0) &&
      locked.every(r => exact(r) && r.untwistedChanged === 0 && r.linksChanged > 0 && r.fluxChanged > 0) &&
      unlocked.untwistedChanged > 0 &&
      fixed.frameMismatches > 0 &&
      unpaid.reverses &&
      unpaid.drift > 0

    const report = (prefix: string, r: Run): [string, number][] => [
      [`${prefix}ReversesExactly`, r.reverses ? 1 : 0],
      [`${prefix}EnergyConserved`, r.energyExact ? 1 : 0],
      [`${prefix}LoveAndFearConserved`, r.loveFearExact ? 1 : 0],
      [`${prefix}GaussViolations`, r.gaussViolations],
      [`${prefix}FrameMismatches`, r.frameMismatches],
      [`${prefix}CenterFrameMismatches`, r.centerFrameMismatches],
      [`${prefix}LinksChanged`, r.linksChanged],
      [`${prefix}FluxChanged`, r.fluxChanged],
      [`${prefix}UntwistedChanges`, r.untwistedChanged],
      [`${prefix}LinkMoves`, r.moves.links],
      [`${prefix}FluxLoopMoves`, r.moves.loops],
      [`${prefix}Hops`, r.moves.hops],
    ]

    return verdict({
      status: ok ? 'pass' : 'fail',
      claim:
        "with every flux change twisting its link by the center element to that change, on the side-4 and side-5 boxes 24 beats forward and back restore everything exactly, the energy is conserved to the unit, love and fear and Gauss's law hold every beat, frame changes by all 648 elements and by the center alone commute with the rule, the links move and flux loops and hops happen, and with reflections stopped the untwisted part of every link never changes while the links and the flux do, where the uncoupled rule changes it, a non-central twist breaks the frame change and an unpaid twist leaks energy",
      metrics: Object.fromEntries([
        ...runs.flatMap((r, k) => report(`side${SIDES[k]}`, r)),
        ...locked.flatMap((r, k) => report(`side${SIDES[k]}NoReflection`, r)),
      ]),
      control: {
        uncoupledNoReflectionUntwistedChanges: unlocked.untwistedChanged,
        uncoupledNoReflectionFluxChanged: unlocked.fluxChanged,
        fixedTwistFrameMismatches: fixed.frameMismatches,
        unpaidTwistReverses: unpaid.reverses ? 1 : 0,
        unpaidTwistEnergyDrift: unpaid.drift,
      },
      notes:
        "L2, exact integers, no random numbers. The lock is exact but it is a lock, not a derivation: the rule is built so that every flux change twists its link, and the gate checks that nothing else does. What it buys is that the phase and the flux are no longer independent fields, and that a string of flux is now a line of center twists the triangles can feel. Whether that makes the field carry the string's energy is the question of E-FRC-0155.",
    })
  },
})
