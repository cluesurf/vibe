// A U(1) link sector for the knit, compact U(1) as Z_N (code/rule/photon-links): each link holds an angle in
// Z_N and its conjugate electric flux, an integer, with Gauss's law sourced by the vibes. Built in two forms
// of the same Hamiltonian, E^2 / 2 per link plus (K N / 2 pi)(1 - cos(2 pi B / N)) per plaquette:
// - the leapfrog, two shears per beat, A <- A + E mod N and E <- E - curl f(B), f = round(K sin(2 pi B / N)):
//   exactly reversible, Gauss's law exact (the kick is a curl) and frame covariant (B is frame invariant),
//   but its energy is not an integer that is kept
// - the demon form, each move an involution paid to its link's demon (a link reflecting through one
//   plaquette, a flux loop round one plaquette): energy conserved to the unit
// Both carry vibes that hop across empty neighbors, the flux of the crossed link changing by the vibe's
// charge, paid in E^2 by the link's demon: a moving charge drags its flux.
//
// N = 8192 and K = 80, fixed before any run from the linear theory alone (tmp/photon-probe-linear.ts):
// - stability: the leapfrog is stable while kappa lambda_max < 4, kappa = 2 pi K / N, and the largest
//   curl-curl eigenvalue of the D4 triangles is 16 (every mode of the side-8 box). A first choice with
//   kappa lambda_max = 3.1 heated without bound at moderate amplitude (the nonlinear resonance of a
//   leapfrog near its limit), so kappa lambda_max = 0.98, the highest mode turning 1.04 rad per beat
// - rounding: f is rounded per plaquette, which adds noise of variance 1/12 per plaquette and beat. That is
//   small only against a large flux, so the working temperature must be large, and the Coulomb phase,
//   which ends near T = K N / (2 pi beta_c), needs K N large: N = 8192 puts it near T = 10^5
// - compactness: B is an angle mod N, so the field is compact. N = 8192 is U(1) to 0.04 degrees
//
// Gates, fixed before the run, on the side-4 (256 docks) and side-5 (625 docks) D4 boxes, 48 beats, from
// love and fear pairs on neighboring docks each joined by one unit of flux, hashed angles within 512 and
// a hashed transverse flux (the curl of plaquette integers within 181), demons hashed to 4,096:
// - both forms: 48 beats forward and back restore everything exactly, love and fear counts and Gauss's
//   law hold every beat, a change of Z_N frame in every dock commutes with the rule (0 mismatches), the
//   angles move, and vibes hop
// - the demon form: the integer energy is the same on every beat, and flux loops happen
// - the leapfrog's energy, over 2,000 beats on the side-4 box: the shadow energy 1/2 E(-) . E(+) + V moves
//   by less than 10 percent, and its growth rate is within a factor 2 of the rounding estimate, links x
//   (plaquettes per link) / 24 per beat (variance 1/12 per plaquette on E, half of it in E^2 / 2)
// Controls, on the side-4 start:
// - a hop that leaves its flux behind (`gauss: false`) breaks Gauss's law
// - a kick onto one link of each plaquette (`kick: 'link'`), not a curl, breaks Gauss's law
// - a force read from the link's own angle (`kick: 'angle'`), not from B, breaks the frame change
// - K = 400, kappa lambda_max = 4.9, past the stability limit: the shadow energy grows by more than 100
//   times within 300 beats
//
// Depth L2: lattice gauge theory in its Hamiltonian form, constructed and checked against stated gates.

import { experiment } from '@/test/scaffold/suite'
import { verdict } from '@/test/scaffold/verdict'
import {
  addHashedCurl,
  changePhotonFrame,
  copyPhotonState,
  emptyPhotonState,
  fillHashedDemons,
  makePhotonRule,
  photonBeatBackInPlace,
  photonBeatInPlace,
  photonEnergy,
  photonGaussViolations,
  photonLatticeD4,
  photonLevelEnergy,
  photonLink,
  setHashedAngles,
  type PhotonLattice,
  type PhotonRule,
  type PhotonState,
} from '@/code/rule/photon-links'

const SIDES = [4, 5]
const N = 8192
const K = 80
const UNSTABLE_K = 400
const CAPACITY = 4096
const DEMON_CAPACITY = 1 << 22
const BEATS = 48
const ENERGY_BEATS = 2000
const UNSTABLE_BEATS = 300
const ANGLE_AMPLITUDE = 512
const FLUX_AMPLITUDE = 181
const GOLDEN = (Math.sqrt(5) - 1) / 2

type Extra = { mode?: 'leapfrog' | 'demon'; gauss?: boolean; kick?: 'curl' | 'link' | 'angle'; k?: number }

function makeRule(lattice: PhotonLattice, extra: Extra = {}): PhotonRule {
  const mode = extra.mode ?? 'leapfrog'

  return makePhotonRule({
    lattice,
    mode,
    n: N,
    k: extra.k ?? K,
    capacity: mode === 'demon' ? DEMON_CAPACITY : CAPACITY,
    ...(extra.gauss === undefined ? {} : { gauss: extra.gauss }),
    ...(extra.kick === undefined ? {} : { kick: extra.kick }),
  })
}

function start(rule: PhotonRule, scale: number): PhotonState {
  const { lattice } = rule
  const s = emptyPhotonState(rule)

  for (let x = 0; x < lattice.cells; x++) {
    const u = ((x + 1) * GOLDEN * scale) % 1
    const d = Math.floor(((x + 2) * GOLDEN * scale * 24) % 24)
    const y = lattice.neighbour[x * lattice.degree + d] ?? 0

    if (u < 0.3 && s.vibe[x] === 0 && s.vibe[y] === 0 && x !== y) {
      const v = u < 0.15 ? 1 : -1
      const [l, sign] = photonLink(lattice, x, d)

      s.vibe[x] = v
      s.vibe[y] = -v
      s.flux[l] = (s.flux[l] ?? 0) + sign * v * rule.charge
    }
  }

  setHashedAngles(rule, s, ANGLE_AMPLITUDE, 3.7 * scale)
  addHashedCurl(rule, s, FLUX_AMPLITUDE, 5.3 * scale)
  fillHashedDemons(s, rule.capacity, 2.9 * scale)

  return s
}

const fields = (s: PhotonState): ArrayLike<number>[] => [s.vibe, s.angle, s.flux, s.demon]

const mismatches = (a: PhotonState, b: PhotonState): number => {
  const right = fields(b)

  return fields(a).reduce((n, f, k) => n + Array.from(f).filter((v, i) => v !== right[k]?.[i]).length, 0)
}

type Run = {
  reverses: boolean
  loveFearExact: boolean
  gaussViolations: number
  frameMismatches: number
  levelExact: boolean
  shadowDrift: number
  anglesChanged: number
  moves: { links: number; loops: number; hops: number }
}

function run(rule: PhotonRule, scale: number): Run {
  const s0 = start(rule, scale)
  const s = copyPhotonState(s0)
  const count = (x: PhotonState, v: number): number => x.vibe.filter(q => q === v).length
  const level0 = photonLevelEnergy(rule, s0)
  const shadow0 = photonEnergy(rule, s0).shadow
  const moves = { links: 0, loops: 0, hops: 0 }

  let loveFearExact = true
  let violations = photonGaussViolations(rule, s0)
  let levelExact = true
  let shadowDrift = 0

  for (let t = 0; t < BEATS; t++) {
    const m = photonBeatInPlace(rule, s, t)

    moves.links += m.links
    moves.loops += m.loops
    moves.hops += m.hops
    loveFearExact = loveFearExact && count(s, 1) === count(s0, 1) && count(s, -1) === count(s0, -1)
    violations += photonGaussViolations(rule, s)

    if (rule.mode === 'demon') {
      levelExact = levelExact && photonLevelEnergy(rule, s) === level0
    } else {
      shadowDrift = Math.max(shadowDrift, Math.abs(photonEnergy(rule, s).shadow - shadow0) / shadow0)
    }
  }

  const anglesChanged = Array.from(s.angle).filter((v, i) => v !== s0.angle[i]).length

  for (let t = BEATS - 1; t >= 0; t--) {
    photonBeatBackInPlace(rule, s, t)
  }

  const reverses = mismatches(s, s0) === 0
  const chi = Array.from({ length: rule.lattice.cells }, (_, x) => Math.floor((((x + 11) * GOLDEN * 5.9) % 1) * N))
  const a = start(rule, scale * 1.7)
  const b = changePhotonFrame(rule, a, chi)

  let frameMismatches = 0

  for (let t = 0; t < BEATS; t++) {
    photonBeatInPlace(rule, a, t)
    photonBeatInPlace(rule, b, t)
    frameMismatches += mismatches(changePhotonFrame(rule, a, chi), b)
  }

  return { reverses, loveFearExact, gaussViolations: violations, frameMismatches, levelExact, shadowDrift, anglesChanged, moves }
}

// the leapfrog's shadow energy over many beats: its largest relative move and its growth per beat
function energyRun(rule: PhotonRule, beats: number): { drift: number; growth: number; final: number } {
  const s = start(rule, 1.37)
  const shadow0 = photonEnergy(rule, s).shadow
  const window = Math.max(1, Math.floor(beats / 10))
  const series: number[] = []

  let drift = 0

  for (let t = 0; t < beats; t++) {
    photonBeatInPlace(rule, s, t)

    const shadow = photonEnergy(rule, s).shadow

    series.push(shadow)
    drift = Math.max(drift, Math.abs(shadow - shadow0) / shadow0)

    if (!Number.isFinite(shadow) || drift > 1e6) {
      break
    }
  }

  const mean = (xs: number[]): number => xs.reduce((a, b) => a + b, 0) / Math.max(1, xs.length)
  const first = mean(series.slice(0, window))
  const last = mean(series.slice(-window))
  const growth = (last - first) / Math.max(1, series.length - window)

  return { drift, growth, final: (series[series.length - 1] ?? shadow0) / shadow0 }
}

export default experiment({
  id: 'gauge/photon-links',
  code: 'E-FRC-0164',
  title:
    "a U(1) link sector for the knit, compact U(1) as Z_8192 with each link's angle beside its integer flux: as a leapfrog of two shears it reverses exactly, keeps Gauss's law with the vibes as sources at every dock and beat, commutes with a Z_N frame change in every dock and drags a hopping charge's flux, with its shadow energy bounded but slowly heated by the rounding of the force, and as demon-paid involutions it does the same with the energy conserved to the unit",
  category: 'gauge',
  substrates: ['3434'],
  depth: 'L2',
  paper: false,
  run() {
    const lattices = SIDES.map(side => photonLatticeD4({ side }))
    const first = lattices[0] ?? photonLatticeD4({ side: 4 })
    const leap = lattices.map(lattice => run(makeRule(lattice), 1.37))
    const demon = lattices.map(lattice => run(makeRule(lattice, { mode: 'demon' }), 1.37))
    const energy = energyRun(makeRule(first), ENERGY_BEATS)
    const noFlux = run(makeRule(first, { gauss: false }), 1.37)
    const linkKick = run(makeRule(first, { kick: 'link' }), 1.37)
    const angleKick = run(makeRule(first, { kick: 'angle' }), 1.37)
    const unstable = energyRun(makeRule(first, { k: UNSTABLE_K }), UNSTABLE_BEATS)
    const perLink = (first.plaquetteSize * first.plaquetteCount) / first.links
    const roundingGrowth = (first.links * perLink) / 24
    const growthRatio = energy.growth / roundingGrowth

    const exact = (r: Run): boolean =>
      r.reverses && r.loveFearExact && r.gaussViolations === 0 && r.frameMismatches === 0 && r.anglesChanged > 0 && r.moves.hops > 0

    const ok =
      leap.every(exact) &&
      demon.every(r => exact(r) && r.levelExact && r.moves.loops > 0 && r.moves.links > 0) &&
      energy.drift < 0.1 &&
      growthRatio > 0.5 &&
      growthRatio < 2 &&
      noFlux.gaussViolations > 0 &&
      linkKick.gaussViolations > 0 &&
      angleKick.frameMismatches > 0 &&
      unstable.drift > 100

    const report = (prefix: string, r: Run): [string, number][] => [
      [`${prefix}ReversesExactly`, r.reverses ? 1 : 0],
      [`${prefix}LoveAndFearConserved`, r.loveFearExact ? 1 : 0],
      [`${prefix}GaussViolations`, r.gaussViolations],
      [`${prefix}FrameMismatches`, r.frameMismatches],
      [`${prefix}AnglesChanged`, r.anglesChanged],
      [`${prefix}Hops`, r.moves.hops],
    ]

    return verdict({
      status: ok ? 'pass' : 'fail',
      claim:
        "on the side-4 and side-5 D4 boxes both forms reverse exactly over 48 beats, keep love and fear and Gauss's law at every dock and beat while vibes hop, and commute with a Z_8192 frame change in every dock, the demon form keeping its integer energy on every beat, while the leapfrog's shadow energy stays within 10 percent over 2,000 beats and grows at the rate the rounding of the force predicts, where a hop that leaves its flux behind or a kick that is not a curl breaks Gauss's law, a force read from the angle breaks the frame change, and a coupling past the stability limit blows up",
      metrics: Object.fromEntries([
        ...leap.flatMap((r, k) => [...report(`leapfrogSide${SIDES[k]}`, r), [`leapfrogSide${SIDES[k]}ShadowDrift48`, r.shadowDrift] as [string, number]]),
        ...demon.flatMap((r, k) => [
          ...report(`demonSide${SIDES[k]}`, r),
          [`demonSide${SIDES[k]}EnergyExact`, r.levelExact ? 1 : 0] as [string, number],
          [`demonSide${SIDES[k]}LinkMoves`, r.moves.links] as [string, number],
          [`demonSide${SIDES[k]}FluxLoops`, r.moves.loops] as [string, number],
        ]),
        ['leapfrogShadowDrift2000', energy.drift],
        ['leapfrogShadowGrowthPerBeat', energy.growth],
        ['roundingGrowthEstimatePerBeat', roundingGrowth],
        ['growthOverEstimate', growthRatio],
        ['kappaLambdaMax', ((2 * Math.PI * K) / N) * 16],
      ]),
      control: {
        hopWithoutFluxGaussViolations: noFlux.gaussViolations,
        kickOnOneLinkGaussViolations: linkKick.gaussViolations,
        forceFromAngleFrameMismatches: angleKick.frameMismatches,
        unstableCouplingShadowGrowth: unstable.drift,
        unstableKappaLambdaMax: ((2 * Math.PI * UNSTABLE_K) / N) * 16,
      },
      notes:
        "L2, exact integers, no random numbers. Two forms because no integer rule found here does both things at once: the leapfrog carries E and A as a conjugate pair (the drift is what makes light, E-FRC-0165), and its energy is kept only as a leapfrog keeps it, with a slow heating from the rounded force; the demon form keeps its energy to the unit but has no drift, so nothing turns E into A. Gauss's law and the frame change are exact in both by construction (the kick and the loops are curls, B and E are frame invariant), and the controls show each is what the construction buys. A hop dragging its flux is the E-FRC-0144 coupling: the vibe feels E through what the demon can pay, not B, since a vibe carries no Z_N phase here.",
    })
  },
})
