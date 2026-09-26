// Links as vibe-vibe relations, the physics (code/rule/relational-links). E-FRC-0174 found what a relation of
// an edge's two slots can carry: a covariant link needs each slot to hold a whole frame of the gauged group
// (role and tilt give the 9 translations only), and that frame must stay at its port, since a frame riding a
// vibe that crosses the edge is carried onto its partner's. So the best relational encoding is the port form:
// each of a dock's 24 slots holds a frame P(x, d) of Sigma(648), the link is P(y, -d) P(x, d)^-1, and the
// flux is the difference of two port counts, each what has left through its port. And the history form:
// what has crossed, and when. This re-runs the key gauge results in those forms and says what each needed.
//
// A. Frame covariance (E-FRC-0154's coupled rule, couple 'center', kappa 3, tension 3, capacity 24, its
//    start, 24 beats, the side-4 and side-5 D4 boxes). The port form beside the stored rule, beat by beat
//    A1 the links and flux derived from the ports equal the stored rule's at every beat: 0 mismatches
//    A2 the part of each flux change not made by a hop has zero divergence at every dock and beat, so it
//       reads as circulation round triangles, counted on the ports: 0 violations
//    A3 24 beats forward and back restore every port, vibe, role point and demon exactly, and the counts up
//       to one shared shift on the two ports of an edge, which the flux does not see
//    A4 a Sigma(648) frame change in every dock, a center frame change, and a change at the middle of every
//       edge commute with the port form: 0 mismatches each
//    Control: the dock form, one frame per dock, read off a spanning tree of the start's links: its
//    triangles are all trivial, where the port form's start has nontrivial ones
// B. The flux string (E-FRC-0151's melted branch, side 8, kappa 12, tension 12, capacity 200, drain 150,
//    fill 4, settle 200, a static love line and fear line at R = 1 to 4, 300 beats, the string read from
//    the flux connected to the sources)
//    B1 the port form equals the stored rule at every beat (0 mismatches), and the stored rule's excess
//       lengths match E-FRC-0151's printed 0.12, 0.35, 0.45, 0.60 within 0.006
//    B2 history alone: the flux with its tension, and no element read at all (kappa 0, no link moves), from
//       the same field and demons: the string taut, excess under 1 per slice at every R and V rising
//       strictly, where the same with tension 0 wanders (excess over 1 at R = 4)
// C. Confinement readings on the field alone (the same branch, 300 beats, E-FRC-0151's instruments): the
//    fundamental Polyakov loop |<P>|, W(1,1), W(1,2), W(2,2), chi(2,2)
//    C1 the port form's readings equal the stored rule's, with 0 state mismatches, and |<P>| under 0.01
//    History alone holds no element, so it has no Polyakov loop or Wilson loop to read: reported, no gate
// D. Light (E-FRC-0164's leapfrog, N 8192, K 80). The history form: each port counts the flux that left
//    through it and the time integral of that count, so E is a difference of counts and A of integrals,
//    A = sum of past E, and no angle is stored
//    D1 from A = 0, E and A and every vibe and demon equal the stored leapfrog's at every beat, 2,000 beats,
//       on the side-4 D4 box (the bulk substrate) and the side-8 cubic torus (the stand-in for the 3D husk),
//       Gauss's law at every dock and beat, and 48 beats forward and back restore the history exactly
//    D2 covariance: the stored leapfrog from a pure-gauge start A = chi_y - chi_x keeps E equal to the
//       history form's and A offset by exactly chi_y - chi_x, 200 beats: 0 mismatches
//    D3 control: the stored leapfrog from hashed angles (a magnetic field at the start) does not: E differs
//    D4 light on the husk stand-in, the side-12 cubic torus with no vibes: a standing wave of E along y and
//       another along z, both at k = 2 pi / 12 along x, 2,000 beats in the history form. Each frequency
//       within 2 percent of the leapfrog's, 4 sin^2(omega / 2) = kappa (2 - 2 cos k), and the longitudinal
//       flux (along x) exactly 0 on every link and beat: 2 polarizations of 3
//
// The run, recorded as it came out. Every gate passed.
// - A: 0 derived mismatches, 0 loop divergence, energy exact, 0 Gauss violations, exact reversal and 0
//   count-shift violations on both boxes (6,132 and 14,980 link slots moved), 0 mismatches under the 648,
//   center and midpoint changes. The port start's triangles are nontrivial 0.998 of the time, the dock
//   form's never (it changes 5,632 of the side-4 links)
// - B: stored excess 0.117, 0.352, 0.451, 0.602 (E-FRC-0151: 0.12, 0.35, 0.45, 0.60), the port form 0
//   mismatches at every R. History alone: excess 0.057, 0.173, 0.234, 0.591, rising, and with tension 0
//   the flux spreads over 4,228 links
// - C: 0 mismatches, |<P>| 0.0001, W(1,1) 0.0023, W(1,2) -0.00045, W(2,2) -0.00015, so chi(2,2) cannot
//   be read, as in E-FRC-0151
// - D: 0 mismatches over 2,000 beats on both lattices, Gauss and reversal exact, 0 under the pure-gauge
//   start, 613,685 flux mismatches from the magnetic start. On the side-12 cubic torus omega 0.12807 and
//   0.12818 against the leapfrog's 0.12831 (ratios 0.998, 0.999), longitudinal flux exactly 0
//
// Depth L2: lattice gauge theory rewritten, measured against stated gates. The port and history forms are
// changes of variables, so A1, B1, C1 and D1 are identities checked, not discoveries: what they establish
// is where the state lives.

import { experiment } from '@/test/scaffold/suite'
import { verdict } from '@/test/scaffold/verdict'
import { rootsD4 } from '@/code/algebra/group/root-system'
import { unitDemonBeta } from '@/code/dynamics/finite-kinetic'
import { jackknife } from '@/code/measure/jackknife'
import { leapfrogOmega } from '@/code/measure/photon-modes'
import {
  addHashedCurl,
  copyPhotonState,
  emptyPhotonState,
  fillHashedDemons,
  makePhotonRule,
  photonBeatInPlace,
  photonGaussViolations,
  photonLatticeCubic,
  photonLatticeD4,
  photonLink,
  setHashedAngles,
  type PhotonLattice,
  type PhotonRule,
  type PhotonState,
} from '@/code/rule/photon-links'
import {
  changePortFrame,
  changePortMiddle,
  connectedFluxString,
  copyHistory,
  dockFormLinks,
  historyBeatBackInPlace,
  historyBeatInPlace,
  historyFields,
  historyFromFlux,
  portBeat,
  portBeatBack,
  portsFromState,
  stateFromPorts,
  triangleHolonomies,
  type HistoryState,
  type PortState,
} from '@/code/rule/relational-links'
import {
  addSigmaFlux,
  centerElements,
  hashedSigmaLinks,
  makeSigmaLinks,
  pathTransport,
  sigmaBeat,
  sigmaEnergy,
  sigmaGaussViolations,
  sigmaLine,
  type SigmaLinks,
  type SigmaState,
} from '@/code/rule/sigma-links'

const GOLDEN = (Math.sqrt(5) - 1) / 2
const COVARIANCE_SIDES = [4, 5]
const COVARIANCE_BEATS = 24
const STRING_SIDE = 8
const STRING_KAPPA = 12
const STRING_TENSION = 12
const STRING_CAPACITY = 200
const DRAIN = 150
const MELTED = { fill: 4, settle: 200 }
const BEATS = 300
const BIN = 25
const SEPARATIONS = [1, 2, 3, 4]
const PRINTED_EXCESS_0151 = [0.12, 0.35, 0.45, 0.6]
const N = 8192
const K = 80
const LIGHT_CAPACITY = 4096
const LIGHT_BEATS = 2000
const GAUGE_BEATS = 200
const REVERSE_BEATS = 48
const WAVE_SIDE = 12
const WAVE_AMPLITUDE = [60, 45]

const hash = (i: number, scale: number, range: number): number => Math.floor((((i + 1) * GOLDEN * scale) % 1) * range)
const differ = (a: ArrayLike<number>, b: ArrayLike<number>): number => Array.from(a).filter((v, i) => v !== b[i]).length
const sigmaFields = (s: SigmaState): ArrayLike<number>[] => [s.vibe, s.role, s.links, s.demon, s.flux]
const sigmaMismatch = (a: SigmaState, b: SigmaState): number => {
  const right = sigmaFields(b)

  return sigmaFields(a).reduce((n, f, k) => n + differ(f, right[k] ?? []), 0)
}
const portFields = (s: PortState): ArrayLike<number>[] => [s.vibe, s.role, s.ports, s.demon, s.counts]
const portMismatch = (a: PortState, b: PortState): number => {
  const right = portFields(b)

  return portFields(a).reduce((n, f, k) => n + differ(f, right[k] ?? []), 0)
}

// A. frame covariance on E-FRC-0154's rule and start
function covariance(side: number): Record<string, number> {
  const rule = makeSigmaLinks({ side, kappa: 3, tension: 3, capacity: 24, couple: 'center' })
  const start = (scale: number): SigmaState => {
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
        demon[x * 24 + a] = Math.floor((((x * 24 + a + 5) * GOLDEN * scale) % 1) * 25)
      }
    }

    return { vibe, role, links: hashedSigmaLinks(rule), demon, flux }
  }
  const anchor = (slot: number): number => hash(slot, 6.1, rule.order)
  const s0 = start(1.37)
  const p0 = portsFromState(rule, s0, anchor)
  const e0 = sigmaEnergy(rule, s0)

  let stored = s0
  let ports = p0
  let derivedMismatches = sigmaMismatch(stateFromPorts(rule, p0), s0)
  let loopDivergence = 0
  let energyExact = true
  let gauss = 0

  for (let t = 0; t < COVARIANCE_BEATS; t++) {
    stored = sigmaBeat(rule, stored, t).state

    const next = portBeat(rule, ports, t)

    ports = next.state
    loopDivergence += next.loopDivergence
    derivedMismatches += sigmaMismatch(stateFromPorts(rule, ports), stored)
    energyExact = energyExact && sigmaEnergy(rule, stored) === e0
    gauss += sigmaGaussViolations(rule, stored)
  }

  const linksMoved = differ(stored.links, s0.links)
  const fluxMoved = differ(stored.flux, s0.flux)

  let back = ports

  for (let t = COVARIANCE_BEATS - 1; t >= 0; t--) {
    back = portBeatBack(rule, back, t)
  }

  const restored = differ(back.ports, p0.ports) + differ(back.vibe, p0.vibe) + differ(back.role, p0.role) + differ(back.demon, p0.demon)

  // the counts come back up to one shift shared by the two ports of an edge
  let countShifts = 0

  for (let x = 0; x < rule.cells; x++) {
    for (const a of rule.firsts) {
      const y = rule.neighbour[x * 24 + a] ?? 0
      const second = y * 24 + (rule.opposite[a] ?? a)

      countShifts += (back.counts[x * 24 + a] ?? 0) - (p0.counts[x * 24 + a] ?? 0) === (back.counts[second] ?? 0) - (p0.counts[second] ?? 0) ? 0 : 1
    }
  }

  const centers = centerElements(rule)
  const frames = [
    Array.from({ length: rule.cells }, (_, x) => hash(x + 10, 5.9, rule.order)),
    Array.from({ length: rule.cells }, (_, x) => centers[hash(x + 12, 4.3, 3)] ?? rule.identity),
  ]
  const covariant = (change: (s: PortState) => PortState): number => {
    let a = portsFromState(rule, start(2.33), anchor)
    let b = change(a)
    let n = 0

    for (let t = 0; t < COVARIANCE_BEATS; t++) {
      a = portBeat(rule, a, t).state
      b = portBeat(rule, b, t).state
      n += portMismatch(change(a), b)
    }

    return n
  }
  const frameMismatches = covariant(s => changePortFrame(rule, s, frames[0] ?? []))
  const centerMismatches = covariant(s => changePortFrame(rule, s, frames[1] ?? []))
  const middleMismatches = covariant(s => changePortMiddle(rule, s, (x, a) => hash(x * 24 + a + 7, 2.9, rule.order)))

  // the dock form against the port form's start: triangles that are not the identity
  const mesh = { cells: rule.cells, neighbour: rule.neighbour, opposite: rule.opposite, staples: rule.staples }
  const table = { order: rule.order, product: rule.group.product, inverse: rule.group.inverse, identity: rule.identity }
  const portHolonomy = triangleHolonomies({ mesh, frames: p0.ports, table })
  const dock = dockFormLinks(rule, s0.links)
  const dockHolonomy = triangleHolonomies({ mesh, frames: Int16Array.from({ length: rule.cells * 24 }, (_, i) => dock.frames[Math.floor(i / 24)] ?? 0), table })
  const nontrivial = (h: Float64Array): number => 1 - (h[rule.identity] ?? 0) / h.reduce((a, b) => a + b, 0)

  return {
    derivedMismatches,
    loopDivergence,
    energyExact: energyExact ? 1 : 0,
    gaussViolations: gauss,
    linksMoved,
    fluxMoved,
    restoredMismatches: restored,
    countShiftViolations: countShifts,
    frameMismatches,
    centerFrameMismatches: centerMismatches,
    middleMismatches,
    portStartNontrivialTriangles: nontrivial(portHolonomy),
    dockFormNontrivialTriangles: nontrivial(dockHolonomy),
    dockFormLinksChanged: differ(dock.links, s0.links),
  }
}

// B and C. E-FRC-0151's melted branch
function stringAndLoops(): Record<string, number> {
  const roots = rootsD4()
  const tau = roots.findIndex(r => r.join(',') === '1,-1,0,0')
  const along = roots.findIndex(r => r.join(',') === '0,0,1,1')
  const back = (d: number): number => roots.findIndex(r => r.every((x, k) => x === -(roots[d]?.[k] ?? 0)))
  const make = (input: { kappa: number; tension: number; hop: boolean; roles: boolean; reflect?: boolean }): SigmaLinks =>
    makeSigmaLinks({ side: STRING_SIDE, capacity: STRING_CAPACITY, ...input })
  const plain = make({ kappa: STRING_KAPPA, tension: STRING_TENSION, hop: false, roles: true })
  const { cells, group } = plain
  const anchor = (slot: number): number => hash(slot, 6.1, plain.order)
  const walk = (x: number, d: number, n: number): number => {
    let c = x

    for (let k = 0; k < n; k++) {
      c = plain.neighbour[c * 24 + d] ?? 0
    }

    return c
  }
  const line = (x: number): number[] => Array.from({ length: STRING_SIDE }, (_, t) => walk(x, tau, t))
  const rectangle = (r: number, h: number): number[] => [
    ...new Array<number>(r).fill(along),
    ...new Array<number>(h).fill(tau),
    ...new Array<number>(r).fill(back(along)),
    ...new Array<number>(h).fill(back(tau)),
  ]

  let drained: SigmaState = {
    vibe: new Int8Array(cells),
    role: new Int8Array(cells),
    links: hashedSigmaLinks(plain),
    demon: new Int32Array(cells * 24),
    flux: new Int32Array(cells * 24),
  }

  for (let k = 0; k < DRAIN; k++) {
    drained = sigmaBeat(plain, drained, k).state
    drained.demon.fill(0)
  }

  let base: SigmaState = { ...drained, links: Int16Array.from(drained.links), flux: Int32Array.from(drained.flux), demon: new Int32Array(cells * 24) }

  for (let x = 0; x < cells; x++) {
    for (const a of plain.firsts) {
      base.demon[x * 24 + a] = Math.floor(2 * MELTED.fill * (((x * 24 + a + 5) * GOLDEN) % 1) + 0.5)
    }
  }

  for (let t = 0; t < MELTED.settle; t++) {
    base = sigmaBeat(plain, base, t).state
  }

  const t0 = MELTED.settle
  const fresh = (): SigmaState => ({
    vibe: new Int8Array(cells),
    role: new Int8Array(cells),
    links: Int16Array.from(base.links),
    demon: Int32Array.from(base.demon),
    flux: Int32Array.from(base.flux),
  })

  // C: the field alone, stored and port form in step
  const sizes = [
    [1, 1],
    [1, 2],
    [2, 2],
  ] as const
  const paths = sizes.map(([r, h]) => rectangle(r, h))
  const starts = Array.from({ length: cells }, (_, x) => x).filter(x => x % STRING_SIDE === 0)
  const samples: number[][] = []

  let stored = fresh()
  let ports = portsFromState(plain, stored, anchor)
  let fieldMismatches = 0
  let re = 0
  let im = 0
  let demon = 0

  for (let t = 0; t < BEATS; t++) {
    stored = sigmaBeat(plain, stored, t0 + t).state
    ports = portBeat(plain, ports, t0 + t).state

    const derived = stateFromPorts(plain, ports)

    fieldMismatches += sigmaMismatch(derived, stored)
    samples.push(
      paths.map(path => {
        let sum = 0

        for (let x = 0; x < cells; x++) {
          sum += (group.trace[pathTransport(plain, derived.links, x, path)] ?? 0) / 3 / cells
        }

        return sum
      }),
    )

    let sr = 0
    let si = 0

    for (const x of starts) {
      const g = sigmaLine(plain, derived.links, x, tau)

      sr += (group.trace[g] ?? 0) / 3 / starts.length
      si += (plain.traceIm[g] ?? 0) / 3 / starts.length
    }

    re += sr / BEATS
    im += si / BEATS
    demon += derived.demon.reduce((a, v) => a + v, 0) / (cells * plain.firsts.length) / BEATS
  }

  const mean = (xs: readonly number[][], k: number): number => xs.reduce((a, x) => a + (x[k] ?? 0), 0) / xs.length
  const chi = jackknife({ samples, estimator: picked => -Math.log((mean(picked, 2) * mean(picked, 0)) / mean(picked, 1) ** 2), binSize: BIN })

  // B: the static lines
  const pair = (rule: SigmaLinks, r: number, lockstep: boolean): { excess: number; exact: boolean; mismatches: number } => {
    const s0 = fresh()
    const y0 = walk(0, along, r)

    line(0).forEach((c, t) => {
      s0.vibe[c] = 1
      s0.role[c] = Math.floor(((c + 3) * GOLDEN * 9) % 9)

      for (let j = 0; j < r; j++) {
        addSigmaFlux(rule, s0.flux, walk(c, along, j), along, 1)
      }

      const f = walk(y0, tau, t)

      s0.vibe[f] = -1
      s0.role[f] = Math.floor(((f + 10) * GOLDEN * 9) % 9)
    })

    const e0 = sigmaEnergy(rule, s0)
    const sources = [...line(0), ...line(y0)]

    let s = s0
    let p = portsFromState(rule, s0, anchor)
    let exact = sigmaGaussViolations(rule, s0) === 0
    let connected = 0
    let mismatches = 0

    for (let t = 0; t < BEATS; t++) {
      s = sigmaBeat(rule, s, t0 + t).state
      exact = exact && sigmaEnergy(rule, s) === e0 && sigmaGaussViolations(rule, s) === 0
      connected += connectedFluxString(rule, s.flux, sources) / STRING_SIDE / BEATS

      if (lockstep) {
        p = portBeat(rule, p, t0 + t).state
        mismatches += sigmaMismatch(stateFromPorts(rule, p), s)
      }
    }

    return { excess: connected - r, exact, mismatches }
  }

  const staticRule = make({ kappa: STRING_KAPPA, tension: STRING_TENSION, hop: false, roles: false })
  const historyRule = make({ kappa: 0, tension: STRING_TENSION, hop: false, roles: false, reflect: false })
  const historySlack = make({ kappa: 0, tension: 0, hop: false, roles: false, reflect: false })
  const storedPairs = SEPARATIONS.map(r => pair(staticRule, r, true))
  const historyPairs = SEPARATIONS.map(r => pair(historyRule, r, false))
  const slack = pair(historySlack, SEPARATIONS[SEPARATIONS.length - 1] ?? 4, false)
  const rising = (xs: { excess: number }[]): boolean =>
    xs.every((p, k) => k === 0 || p.excess + (SEPARATIONS[k] ?? 0) > (xs[k - 1]?.excess ?? 0) + (SEPARATIONS[k - 1] ?? 0))

  return {
    fieldMismatches,
    polyakov: Math.hypot(re, im),
    demonBeta: unitDemonBeta({ meanDemon: demon, capacity: STRING_CAPACITY }),
    wilson11: mean(samples, 0),
    wilson12: mean(samples, 1),
    wilson22: mean(samples, 2),
    creutz22: Number.isFinite(chi.value) ? chi.value : -1,
    creutz22Error: Number.isFinite(chi.error) ? chi.error : -1,
    creutz22Readable: Number.isFinite(chi.value) && mean(samples, 1) > 0 && mean(samples, 2) > 0 ? 1 : 0,
    ...Object.fromEntries(storedPairs.map((p, k) => [`storedExcessR${SEPARATIONS[k]}`, p.excess])),
    ...Object.fromEntries(storedPairs.map((p, k) => [`portMismatchesR${SEPARATIONS[k]}`, p.mismatches])),
    ...Object.fromEntries(historyPairs.map((p, k) => [`historyExcessR${SEPARATIONS[k]}`, p.excess])),
    historySlackExcessR4: slack.excess,
    storedExact: storedPairs.every(p => p.exact) ? 1 : 0,
    historyExact: [...historyPairs, slack].every(p => p.exact) ? 1 : 0,
    storedRising: rising(storedPairs) ? 1 : 0,
    historyRising: rising(historyPairs) ? 1 : 0,
    storedMatches0151: storedPairs.every((p, k) => Math.abs(p.excess - (PRINTED_EXCESS_0151[k] ?? 0)) < 0.006) ? 1 : 0,
  }
}

// D. light
function lightStart(rule: PhotonRule, scale: number, angles: boolean): PhotonState {
  const { lattice } = rule
  const s = emptyPhotonState(rule)

  for (let x = 0; x < lattice.cells; x++) {
    const u = ((x + 1) * GOLDEN * scale) % 1
    const d = Math.floor(((x + 2) * GOLDEN * scale * lattice.degree) % lattice.degree)
    const y = lattice.neighbour[x * lattice.degree + d] ?? 0

    if (u < 0.3 && s.vibe[x] === 0 && s.vibe[y] === 0 && x !== y) {
      const v = u < 0.15 ? 1 : -1
      const [l, sign] = photonLink(lattice, x, d)

      s.vibe[x] = v
      s.vibe[y] = -v
      s.flux[l] = (s.flux[l] ?? 0) + sign * v * rule.charge
    }
  }

  if (angles) {
    setHashedAngles(rule, s, 512, 3.7 * scale)
  }

  addHashedCurl(rule, s, 181, 5.3 * scale)
  fillHashedDemons(s, rule.capacity, 2.9 * scale)

  return s
}

function lightIdentity(lattice: PhotonLattice): Record<string, number> {
  const rule = makePhotonRule({ lattice, n: N, k: K, capacity: LIGHT_CAPACITY })
  const s = lightStart(rule, 1.37, false)
  const h = historyFromFlux(rule, s)
  const h0 = copyHistory(h)

  let mismatches = 0
  let gauss = 0

  const compare = (): number => {
    const { flux, angle } = historyFields(rule, h)

    return differ(flux, s.flux) + differ(angle, s.angle) + differ(h.vibe, s.vibe) + differ(h.demon, s.demon)
  }

  mismatches += compare()

  for (let t = 0; t < LIGHT_BEATS; t++) {
    photonBeatInPlace(rule, s, t)
    historyBeatInPlace(rule, h)
    mismatches += compare()
    gauss += photonGaussViolations(rule, s)
  }

  const r = copyHistory(h0)

  for (let t = 0; t < REVERSE_BEATS; t++) {
    historyBeatInPlace(rule, r)
  }

  for (let t = 0; t < REVERSE_BEATS; t++) {
    historyBeatBackInPlace(rule, r)
  }

  const restored = differ(r.vibe, h0.vibe) + differ(r.count, h0.count) + differ(r.elapsed, h0.elapsed) + differ(r.demon, h0.demon)

  return { mismatches, gauss, restored, anglesMoved: differ(historyFields(rule, h).angle, new Int32Array(lattice.links)) }
}

function lightGauge(lattice: PhotonLattice): { pureGauge: number; magnetic: number } {
  const rule = makePhotonRule({ lattice, n: N, k: K, capacity: LIGHT_CAPACITY })
  const f = lattice.firsts.length
  const chi = Array.from({ length: lattice.cells }, (_, x) => hash(x + 10, 5.9, N))
  const offset = (l: number): number => {
    const x = Math.floor(l / f)
    const y = lattice.neighbour[x * lattice.degree + (lattice.firsts[l % f] ?? 0)] ?? 0

    return (chi[y] ?? 0) - (chi[x] ?? 0)
  }
  const plain = lightStart(rule, 1.37, false)
  const h = historyFromFlux(rule, plain)
  const gauged = copyPhotonState(plain)
  const magnetic = lightStart(rule, 1.37, true)

  gauged.angle.forEach((_, l) => (gauged.angle[l] = (((offset(l) % N) + N) % N)))

  let pureGauge = 0
  let differs = 0

  for (let t = 0; t < GAUGE_BEATS; t++) {
    photonBeatInPlace(rule, gauged, t)
    photonBeatInPlace(rule, magnetic, t)
    historyBeatInPlace(rule, h)

    const { flux, angle } = historyFields(rule, h)

    pureGauge += differ(flux, gauged.flux)
    pureGauge += Array.from(angle).filter((a, l) => (((a + offset(l) - (gauged.angle[l] ?? 0)) % N) + N) % N !== 0).length
    differs += differ(flux, magnetic.flux)
  }

  return { pureGauge, magnetic: differs }
}

// the frequency of a sampled series: the peak of |sum a(t) e^(-i omega t)|, refined by golden section
function peakFrequency(series: readonly number[], guess: number): number {
  const power = (w: number): number => {
    let c = 0
    let s = 0

    series.forEach((a, t) => {
      c += a * Math.cos(w * t)
      s += a * Math.sin(w * t)
    })

    return c * c + s * s
  }

  let best = guess
  let top = -1

  for (let k = 0; k <= 400; k++) {
    const w = guess * (0.5 + k / 400)
    const p = power(w)

    if (p > top) {
      top = p
      best = w
    }
  }

  let lo = best - guess / 400
  let hi = best + guess / 400

  for (let k = 0; k < 60; k++) {
    const a = hi - (hi - lo) * GOLDEN
    const b = lo + (hi - lo) * GOLDEN

    if (power(a) > power(b)) {
      hi = b
    } else {
      lo = a
    }
  }

  return (lo + hi) / 2
}

function lightOnHusk(): Record<string, number> {
  const lattice = photonLatticeCubic({ side: WAVE_SIDE })
  const rule = makePhotonRule({ lattice, n: N, k: K, capacity: LIGHT_CAPACITY })
  const f = lattice.firsts.length
  const k = (2 * Math.PI) / WAVE_SIDE
  const axis = (v: readonly number[]): number => lattice.firsts.findIndex(d => (lattice.vectors[d] ?? []).every((x, i) => x === (v[i] ?? 0)))
  const [ex, ey, ez] = [axis([1, 0, 0]), axis([0, 1, 0]), axis([0, 0, 1])]
  const xOf = (x: number): number => lattice.coordinates[x * lattice.dimension] ?? 0
  const flux = new Int32Array(lattice.links)

  for (let x = 0; x < lattice.cells; x++) {
    flux[x * f + ey] = Math.round((WAVE_AMPLITUDE[0] ?? 0) * Math.cos(k * xOf(x)))
    flux[x * f + ez] = Math.round((WAVE_AMPLITUDE[1] ?? 0) * Math.cos(k * xOf(x)))
  }

  const h = historyFromFlux(rule, { vibe: new Int8Array(lattice.cells), flux, demon: new Int32Array(lattice.links) })
  const series: number[][] = [[], []]

  let longitudinal = 0
  let gauss = 0

  for (let t = 0; t < LIGHT_BEATS; t++) {
    historyBeatInPlace(rule, h)

    const e = historyFields(rule, h).flux
    const amplitude = [0, 0]

    for (let x = 0; x < lattice.cells; x++) {
      const c = Math.cos(k * xOf(x))

      amplitude[0] = (amplitude[0] ?? 0) + (e[x * f + ey] ?? 0) * c
      amplitude[1] = (amplitude[1] ?? 0) + (e[x * f + ez] ?? 0) * c
      longitudinal = Math.max(longitudinal, Math.abs(e[x * f + ex] ?? 0))
    }

    series[0]?.push(amplitude[0] ?? 0)
    series[1]?.push(amplitude[1] ?? 0)
    gauss += photonGaussViolations(rule, { vibe: h.vibe, angle: new Int32Array(lattice.links), flux: e, demon: h.demon })
  }

  const kappa = (2 * Math.PI * K) / N
  const predicted = leapfrogOmega(kappa, 2 - 2 * Math.cos(k))
  const omegaY = peakFrequency(series[0] ?? [], predicted)
  const omegaZ = peakFrequency(series[1] ?? [], predicted)

  return { predicted, omegaY, omegaZ, ratioY: omegaY / predicted, ratioZ: omegaZ / predicted, longitudinal, gauss }
}

export default experiment({
  id: 'gauge/relational-link-physics',
  code: 'E-FRC-0175',
  title:
    "links as vibe-vibe relations, the physics: held as two port frames and two port counts, the coupled Sigma(648) rule, its flux string and its confinement readings are the stored rule's to the bit, frame covariant by all 648 in every dock and at the middle of every edge; the flux string needs no element at all, only the count of what crossed; the Polyakov loop and Creutz ratios need the element and history cannot hold them; and light needs only history, the count of what crossed and its time integral, with 2 polarizations on the husk stand-in",
  category: 'gauge',
  substrates: ['3434'],
  depth: 'L2',
  paper: false,
  run() {
    const cov = COVARIANCE_SIDES.map(covariance)
    const loops = stringAndLoops()
    const bulk = lightIdentity(photonLatticeD4({ side: 4 }))
    const huskStandIn = lightIdentity(photonLatticeCubic({ side: 8 }))
    const gauge = lightGauge(photonLatticeD4({ side: 4 }))
    const wave = lightOnHusk()

    const a = cov.every(
      c =>
        c.derivedMismatches === 0 &&
        c.loopDivergence === 0 &&
        c.energyExact === 1 &&
        c.gaussViolations === 0 &&
        c.restoredMismatches === 0 &&
        c.countShiftViolations === 0 &&
        c.frameMismatches === 0 &&
        c.centerFrameMismatches === 0 &&
        c.middleMismatches === 0 &&
        (c.portStartNontrivialTriangles ?? 0) > 0 &&
        c.dockFormNontrivialTriangles === 0,
    )
    const b =
      SEPARATIONS.every(r => loops[`portMismatchesR${r}`] === 0) &&
      loops.storedMatches0151 === 1 &&
      loops.storedExact === 1 &&
      loops.historyExact === 1 &&
      loops.historyRising === 1 &&
      SEPARATIONS.every(r => (loops[`historyExcessR${r}`] ?? 1) < 1) &&
      (loops.historySlackExcessR4 ?? 0) > 1
    const c = loops.fieldMismatches === 0 && (loops.polyakov ?? 1) < 0.01
    const d =
      bulk.mismatches === 0 &&
      bulk.gauss === 0 &&
      bulk.restored === 0 &&
      huskStandIn.mismatches === 0 &&
      huskStandIn.gauss === 0 &&
      huskStandIn.restored === 0 &&
      gauge.pureGauge === 0 &&
      gauge.magnetic > 0 &&
      Math.abs((wave.ratioY ?? 0) - 1) < 0.02 &&
      Math.abs((wave.ratioZ ?? 0) - 1) < 0.02 &&
      wave.longitudinal === 0

    const prefixed = (prefix: string, r: Record<string, number>): [string, number][] =>
      Object.entries(r).map(([key, value]) => [`${prefix}${key[0]?.toUpperCase() ?? ''}${key.slice(1)}`, value])

    return verdict({
      status: a && b && c && d ? 'pass' : 'fail',
      claim:
        "in the port form (each slot a Sigma(648) frame that stays at its port, each link the relation of its two, each flux the difference of two counts) the coupled rule equals the stored one at every beat, reverses, and commutes with a frame change by all 648, by the center and at the middle of every edge, while one frame per dock leaves every triangle trivial; the melted flux string and the field's confinement readings are the stored rule's to the bit, and the string stays taut with no element read at all, from the flux's tension alone; the leapfrog's light runs with no stored angle, the angle the time integral of what crossed, equal to the stored rule from a zero or pure-gauge angle and not from a magnetic start, with 2 polarizations at the leapfrog frequency on the husk stand-in",
      metrics: Object.fromEntries([
        ...cov.flatMap((r, k) => prefixed(`covarianceSide${COVARIANCE_SIDES[k]}`, r)),
        ...prefixed('string', loops),
        ...prefixed('lightBulkD4', bulk),
        ...prefixed('lightHuskStandIn', huskStandIn),
        ['lightPureGaugeMismatches', gauge.pureGauge],
        ...prefixed('lightWave', wave),
      ]),
      control: {
        dockFormNontrivialTrianglesSide4: cov[0]?.dockFormNontrivialTriangles ?? -1,
        dockFormLinksChangedSide4: cov[0]?.dockFormLinksChanged ?? -1,
        historyTensionZeroExcessR4: loops.historySlackExcessR4 ?? -1,
        lightMagneticStartFluxMismatches: gauge.magnetic,
        printedExcess0151R1: PRINTED_EXCESS_0151[0] ?? 0,
        printedExcess0151R4: PRINTED_EXCESS_0151[3] ?? 0,
      },
      notes:
        "L2, exact integers, no random numbers. The port form holds each link as two frames and each flux as two counts, a change of variables, so the identities in A1, B1, C1 and D1 say where the state lives, not that new physics appears: the links' state can live in the slots, one frame per slot, provided the frame stays at the port. What the rewrite separates is which result needs what. The flux string is carried by the flux alone, and the flux is what crossed: history. The confinement readings (Polyakov loop, Creutz ratios) are built from the element, the magnetic side, and there is no history form of it under these link moves, since a reflection U -> V U^-1 V is set by the field, not by anything that crossed. The U(1) angle does have one, A = A(0) + sum of past E: the leapfrog's drift is exactly that sum, so with A(0) zero or pure gauge the angle is the elapsed-time ledger of what crossed and of the kicks' circulation, and a magnetic field at the start cannot be held. Light on the true husk (the horosphere projection) is not measured here: the cubic torus is the stand-in E-FRC-0165 used.",
    })
  },
})
