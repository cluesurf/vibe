// A lump's first-order change of the vacuum's knot entanglement against its energy, and the Newton's constant the
// knots' eta sets (E-GRV-0084): the second half of Jacobson's route (2015). E-GRV-0083 read the entanglement of the
// working vacuum's husk regions from its exact superposed state (code/measure/knot-network); here a lump of content is
// placed as E-GRV-0081 places one (code/measure/vacuum-response lumpStart: open loves on the first slot of a frame in
// the center column) and the same kind of region is read with and without it.
//
// THE RULE READ. The lump's vibes sit alone on their lines, and the covariant coin acts on exactly such a line (keep or
// hand the vibe to the line's other slot), which puts the lump's POSITION in superposition. The knot network holds one
// occupation history and cannot hold that. So this file reads E-RLT-0103's rule, the no-veto two-point store under the
// pass WITHOUT the coin (code/rule/occupation-veto-knit vetoBeat), where positions carry no amplitude on any start
// (E-RLT-0103 Q4). On the vacuum alone the two rules agree up to a global phase (E-GRV-0083 A3: no line of one open vibe
// at any beat); with the lump they differ, and what the coin would add is not in this state.
//
// JACOBSON'S FIRST LAW. For a small region in the vacuum, delta S = delta <K> with K the modular Hamiltonian; for a ball
// of radius R in a conformal vacuum K = 2 pi integral (R^2 - r^2) / (2 R) T00, so a lump at the center changes S by
// delta E / T with an entanglement temperature T of order 1 / R: T falls as the region grows. Equilibrium (delta S_total
// = 0 at fixed volume) then gives G = 1 / (4 eta).
//
// PROBES before this file, disclosed (tmp/lump-probe1.log: side 8, integer+0, the network without the coin, loves of
// content 1, 2, 3 and the control, cubes about the lump of a = 1 .. 7, read every 3 beats and stopped after beat 23):
// the lump's loves never join a component (largest 4 tokens, as in the vacuum): no lump love meets a like vibe. The
// lump changes the entanglement only by changing the vacuum's own occupation flow, and delta S is NEGATIVE (about -1.5
// to -4 nats for content 1 at beats 11 to 23, -8 to -17 for content 2), of one size on every cube (the change runs
// along the rings, which span the box); content 3 read the same delta S as content 2 on every cube through beat 17
// while its count was one higher, and differs from beat 20 on. delta E wanders in sign (-15 to +17). The equilibrium
// window was not reached and no gate was read.
//
// GATES, fixed before this file's first run.
//  F0 the instrument: every run keeps each component exactly normed at every reading and returns exactly under 48
//     inverse beats; a masked lump start (content 1, the lump's love and the two stored units of the vacuum's first knot
//     open, the rest closed) agrees with the rule's own vetoBeat term for term (up to one global unit) on 36 of 36 beats
//  F1 a first-order change: on every cube about the lump (a = 1 .. 7 husk steps, side 8, the mean over beats 36 .. 47,
//     E-GRV-0083's equilibrium window) delta S for content 1 is nonzero, and delta S grows linearly with the content:
//     delta S(2) / delta S(1) within 2 +- 0.2 and delta S(3) / delta S(1) within 3 +- 0.3
//  F2 an entanglement temperature: T_a = delta E_a / delta S_a (delta E the change of the region's count, the rule's
//     conserved energy: vibes plus two per stored unit, the mean over the same beats) is positive and finite on every
//     cube for content 1, and falls as a grows (T_7 < T_1)
// Verdict: fail if F0 fails; pass if F1 and F2 hold; partial if exactly one holds; fail if neither.
// PREDICTED from the probe: F0 holds, F1 fails (content 2 changes S about four times content 1, content 3 about as
// much as content 2), F2 fails (delta S < 0 while delta E wanders in sign): fail.
// REPORTED, whatever the verdict: G = 1 / (4 eta) from E-GRV-0083's eta_1 (the knot phase, its only exact area law) and
// from its equilibrium area-fit slope, both re-read here on the control run (the vacuum, integer+0) rather than
// copied, and the depth per content b / a of the radion (code/rule/trit-radion) each fixes,
// with E-GRV-0080's light-bending factor 0.00582 (b / a) against 1 (Newton) and 2 (general relativity). The radion's
// pull: a unit of content at depth x has energy -(pi / D) x and its static depth is (b / a) G_T * rho, G_T(r) ->
// 1 / (24 pi r), so its Newton's constant is G_N = (b / a) / (24 D) (E-GRV-0079's k = sa sb / (24 D)). Setting
// G_N = G gives b / a = 24 D G = 6 D / eta with hbar = c = 1 and content read as mass (the brief's units). Where c is
// the husk light's own c(D) = 2 / sqrt(3 (2D + 1)) and hbar = 1 per beat, Jacobson's G = c^3 / (4 hbar eta) and the
// pull of energies E_a, E_b is G E_a E_b / (c^4 r), so b / a = 6 D / (c eta). Both are printed; neither is a gate.
//
// FIRST RUN (tmp/grv84-run1.log, 187 s, the record): fail on F1 and F2 as predicted, no gate moved; F0 holds (every run
// exactly normed and returned, the masked lump start agrees with vetoBeat on 36 of 36 beats). By the window the lump's
// loves HAVE joined rings (largest component 5, 6, 8 tokens for content 1, 2, 3; the probe stopped at beat 23, before
// they met). delta S on cubes a = 1 .. 7 about the lump: content 1 -1.19, -1.39, -1.14, -3.06, -1.39, -1.37, -1.11;
// content 2 -7.2 to -15.3; content 3 -6.1 to -12.3 (less than content 2): not linear in content. delta E (mean count
// change) for content 1 -0.33, 0.25, 0.83, 0.58, 0.50, 0.92, 1.17, so T = delta E / delta S is 0.28 on the smallest cube
// and NEGATIVE on the other six (-0.18 to -1.05): adding content lowers the vacuum's entanglement near it, with no first
// law and no temperature. REPORTED: from eta_1 = 8.435 (side 8, the knot phase) G = 0.0296 husk steps squared, b / a =
// 11.4, bending 0.066 (with c = c(16): b / a 56.6, bending 0.33); from the equilibrium slope 34.37 (r2 0.72, not an area
// law) G = 0.0073, b / a 2.8, bending 0.016 (with c(16): 13.9, 0.081). Newton's 1 and general relativity's 2 need b / a
// 172 and 344: the knots' G is 3 to 60 times too weak for either. And E-GRV-0083 found eta_1 proportional to the bulk
// depth, so this G falls as 1 / depth and is not a constant of the rule. Title written after the run.
//
// DETERMINISM: no random numbers; the start is E-MTH-0028's integer+0; the lump is placed; the state is exact in
// Z[w][1/2]; entropies are floats (measurement). Depth L2. HUSK FIRST: every region is a cube of husk columns about the
// lump's column, with everything in their bulk columns. No path is read, so the path key plays no part.

import { experiment } from '@/test/scaffold/suite'
import { verdict } from '@/test/scaffold/verdict'
import { startFamily, withStart } from '@/code/measure/start-ensemble'
import {
  lumpStart,
  responseBox,
  type ResponseBox,
} from '@/code/measure/vacuum-response'
import { lightSpeed } from '@/code/measure/varying-depth-light'
import { RADION_DEPTH } from '@/code/measure/radion'
import {
  cloneConfiguration,
  lockedState,
  type LockedState,
} from '@/code/rule/doublet-locked-knit'
import { vetoBeat } from '@/code/rule/occupation-veto-knit'
import { linearFit } from '@/code/measure/regression'
import {
  componentsOf,
  huskCubeAbout,
  huskRegionFamily,
  KNOT_ENTROPY,
  knotNetwork,
  networkBeat,
  networkBeatBack,
  networkNormExact,
  networkReturned,
  regionEntropy,
  sameAsBranches,
  tokenDocks,
  type HuskRegion,
} from '@/code/measure/knot-network'

const SIDE = 8
const SIZES = [0, 1, 2, 3] as const
const CUBES = [1, 2, 3, 4, 5, 6, 7] as const
const EQUILIBRIUM = [36, 47] as const
const BEATS = 48
const MASKED_BEATS = 36
// E-GRV-0080: the light-bending factor of the radion at b = a, of the Newtonian falling-light count
const RADION_FACTOR = 0.00582
const KNOT_BEAT = 2

type Run = {
  size: number
  S: number[]
  E: number[]
  normExact: boolean
  returned: boolean
  largest: number
  lumpJoined: boolean
  family: number[]
}

// one run: the mean S and count of each cube over the window; for the control also every region of E-GRV-0083's
// family (its eta is re-read here, on the same run, rather than copied)
function lumpRun(
  box: ResponseBox,
  size: number,
  cubes: readonly HuskRegion[],
  family: readonly HuskRegion[],
): Run {
  const start = lumpStart(box, 1, size).start
  const net = knotNetwork('none', box.tables, start)
  const lumpTokens = Array.from(
    { length: size },
    (_, i) => net.tokens - size + i,
  )
  const S = new Array<number>(cubes.length).fill(0)
  const E = new Array<number>(cubes.length).fill(0)
  const F = new Array<number>(family.length).fill(0)

  let count = 0
  let normExact = true

  for (let t = 0; t < BEATS; t++) {
    networkBeat(net)

    if (t < EQUILIBRIUM[0] || t > EQUILIBRIUM[1]) {
      continue
    }

    const docks = tokenDocks(net)
    const cache = new Map<number, { entropy: number; rows: number }>()
    const within =
      (q: HuskRegion) =>
      (tk: number): boolean =>
        q.inside[box.column[docks[tk]!]!] === 1

    cubes.forEach((c, i) => {
      const inside = within(c)

      let n = 0

      for (let tk = 0; tk < net.tokens; tk++) {
        n += inside(tk) ? 1 : 0
      }

      S[i] = S[i]! + regionEntropy(net, inside, cache).entropy
      E[i] = E[i]! + n
    })

    family.forEach((q, i) => {
      F[i] = F[i]! + regionEntropy(net, within(q), cache).entropy
    })
    count++
    normExact = normExact && networkNormExact(net)
  }

  const largest = net.tally.largest
  const lumpJoined = lumpTokens.some(
    tk => (net.components[net.comp[tk]!]?.members.length ?? 1) > 1,
  )

  for (let t = 0; t < BEATS; t++) {
    networkBeatBack(net)
  }

  return {
    size,
    S: S.map(v => v / count),
    E: E.map(v => v / count),
    normExact,
    returned: networkReturned(
      net,
      knotNetwork('none', box.tables, start),
    ),
    largest,
    lumpJoined,
    family: F.map(v => v / count),
  }
}

// eta_1: E-GRV-0083's knot phase, the width-2 slab's S over its area at beat 2
function knotEta(box: ResponseBox): number {
  const net = knotNetwork('none', box.tables, box.vacuum)
  const slab = huskRegionFamily(SIDE).find(q => q.name === 'slab0-2')!

  for (let t = 0; t <= KNOT_BEAT; t++) {
    networkBeat(net)
  }

  const docks = tokenDocks(net)

  return (
    regionEntropy(net, tk => slab.inside[box.column[docks[tk]!]!] === 1)
      .entropy / slab.area
  )
}

// F0: the network against vetoBeat on a masked lump start
function maskedAgreement(box: ResponseBox): number {
  const probe = knotNetwork('none', box.tables, box.vacuum)
  const lineOf = new Map<number, number>()

  for (let h = 0; h < probe.storeToken.length; h++) {
    if (probe.storeToken[h]! >= 0) {
      lineOf.set(probe.storeToken[h]!, h >> 1)
    }
  }

  for (let t = 0; t < 3; t++) {
    networkBeat(probe)
  }

  const first = componentsOf(probe).find(c => c.members.length === 2)
  const masked = cloneConfiguration(lumpStart(box, 1, 1).start)

  masked.sopen.fill(0)

  for (const t of first?.members ?? []) {
    masked.sopen[lineOf.get(t)!] = 3
  }

  const net = knotNetwork('none', box.tables, masked)

  let rule: LockedState = lockedState(masked)
  let agree = 0

  for (let t = 0; t < MASKED_BEATS; t++) {
    rule = vetoBeat('none', box.tables, rule, t)
    networkBeat(net)
    agree += sameAsBranches(net, rule) ? 1 : 0
  }

  return agree
}

export default experiment({
  id: 'gravity/knot-first-law',
  code: 'E-GRV-0084',
  title:
    "a lump lowers the vacuum's knot entanglement with no first law, and the knots' G bends light 0.07 to 0.33 of Newton's count, not 2, fail on F1 and F2 with the instrument exact: in the exact state of the uncoined no-veto vacuum (side 8, checked term for term against vetoBeat, reversed exactly) a lump of content 1, 2, 3 changes S on cubes about it by -1.1 to -3.1, -7.0 to -15.3 and -6.1 to -12.3 nats (not linear in content) while the count changes by -0.3 to +1.2, so delta E / delta S is negative on 6 of 7 cubes: no entanglement temperature; G = 1 / (4 eta) from E-GRV-0083's knot phase (eta 8.435 per husk plaquette) is 0.0296 husk steps squared, fixing the radion's depth per content at b / a = 11.4 (56.6 with c = c(16)), a light-bending factor 0.066 (0.33) against Newton's 1 and general relativity's 2 (b / a 172, 344); the equilibrium slope gives 0.016 (0.081); and eta grows with the bulk depth, so this G is not a constant of the rule",
  category: 'gravity',
  substrates: ['3434'],
  depth: 'L2',
  paper: false,
  run() {
    const started = Date.now()
    const log = (what: string): void =>
      console.error(
        `${what} ${Math.round((Date.now() - started) / 1000)}s`,
      )
    const family = startFamily(16)
    const out = withStart(family[0]!, () => {
      const box = responseBox(SIDE)
      const cubes = CUBES.map(a => huskCubeAbout(SIDE, box.center, a))
      const family = huskRegionFamily(SIDE)
      const runs = SIZES.map(size => {
        const r = lumpRun(box, size, cubes, size === 0 ? family : [])

        log(`content ${size}`)

        return r
      })
      const fit = linearFit({
        xs: family.map(q => q.area),
        ys: runs[0]!.family,
      })

      return {
        runs,
        agree: maskedAgreement(box),
        cubes,
        etaKnot: knotEta(box),
        etaEquilibrium: fit.slope,
        fitR2: fit.r2,
      }
    })
    const [control, ...lumps] = out.runs as [Run, ...Run[]]
    const dS = lumps.map(r => r.S.map((s, i) => s - control.S[i]!))
    const dE = lumps.map(r => r.E.map((e, i) => e - control.E[i]!))
    const f0 =
      out.runs.every(r => r.normExact && r.returned) &&
      out.agree === MASKED_BEATS
    const one = dS[0]!
    const f1 =
      one.every(v => v !== 0) &&
      CUBES.every(
        (_, i) =>
          Math.abs(dS[1]![i]! / one[i]! - 2) <= 0.2 &&
          Math.abs(dS[2]![i]! / one[i]! - 3) <= 0.3,
      )
    const T = CUBES.map((_, i) => dE[0]![i]! / one[i]!)
    const f2 =
      T.every(v => Number.isFinite(v) && v > 0) &&
      T[T.length - 1]! < T[0]!
    const status = !f0
      ? 'fail'
      : f1 && f2
        ? 'pass'
        : f1 || f2
          ? 'partial'
          : 'fail'

    // Newton's constant and the radion coupling it fixes
    const c = lightSpeed(RADION_DEPTH)
    const newton = [
      { name: 'knot', eta: out.etaKnot },
      { name: 'equilibrium', eta: out.etaEquilibrium },
    ].map(x => {
      const G = 1 / (4 * x.eta)
      const ba = (6 * RADION_DEPTH) / x.eta
      const baLight = (6 * RADION_DEPTH) / (c * x.eta)

      return {
        ...x,
        G,
        ba,
        baLight,
        factor: RADION_FACTOR * ba,
        factorLight: RADION_FACTOR * baLight,
      }
    })
    const f4 = (x: number): string => x.toPrecision(4)
    const metrics: Record<string, number> = {
      gate_F0: f0 ? 1 : 0,
      gate_F1: f1 ? 1 : 0,
      gate_F2: f2 ? 1 : 0,
      maskedAgree: out.agree,
      knotEntropy: KNOT_ENTROPY,
      lightSpeed: c,
      radionDepth: RADION_DEPTH,
      equilibriumAreaFitR2: out.fitR2,
      seconds: (Date.now() - started) / 1000,
    }

    for (const n of newton) {
      metrics[`${n.name}_eta`] = n.eta
      metrics[`${n.name}_G`] = n.G
      metrics[`${n.name}_ba`] = n.ba
      metrics[`${n.name}_factor`] = n.factor
      metrics[`${n.name}_baLight`] = n.baLight
      metrics[`${n.name}_factorLight`] = n.factorLight
    }

    lumps.forEach((r, k) => {
      metrics[`content${r.size}_largest`] = r.largest
      metrics[`content${r.size}_lumpJoined`] = r.lumpJoined ? 1 : 0
      CUBES.forEach((a, i) => {
        metrics[`content${r.size}_dS_a${a}`] = dS[k]![i]!
        metrics[`content${r.size}_dE_a${a}`] = dE[k]![i]!
      })
    })

    CUBES.forEach((a, i) => {
      metrics[`T_a${a}`] = T[i]!
    })

    return verdict({
      status,
      claim: `a lump of content 1, 2, 3 in the vacuum without the coin (side ${SIDE}, mean of beats ${EQUILIBRIUM[0]} .. ${EQUILIBRIUM[1]}): delta S on cubes a = ${CUBES.join(', ')} about it ${lumps.map((r, k) => `content ${r.size}: ${dS[k]!.map(f4).join(', ')}`).join('; ')}; delta E ${lumps.map((r, k) => `content ${r.size}: ${dE[k]!.map(f4).join(', ')}`).join('; ')}; the lump's loves join a component: ${lumps.map(r => r.lumpJoined).join('/')}; linear in content ${f1}; T = delta E / delta S for content 1: ${T.map(f4).join(', ')} (positive and falling ${f2}); ${newton.map(n => `from eta_${n.name} ${f4(n.eta)}: G ${f4(n.G)} husk steps squared, b / a ${f4(n.ba)} (bending ${f4(n.factor)}), with c = c(${RADION_DEPTH}) b / a ${f4(n.baLight)} (bending ${f4(n.factorLight)})`).join('; ')}, against 1 (Newton) and 2 (general relativity), which need b / a 172 and 344`,
      metrics,
      control: {
        controlS_a1: control.S[0]!,
        controlS_a7: control.S[CUBES.length - 1]!,
      },
      notes: `L2. Gates F0 ${f0}, F1 ${f1}, F2 ${f2}. Runs (content, norm exact, returned, largest component): ${out.runs.map(r => `${r.size} ${r.normExact} ${r.returned} ${r.largest}`).join('; ')}. Cube areas and volumes: ${out.cubes.map(q => `a ${q.name.split('-')[1]} A ${q.area} V ${q.volume}`).join(', ')}. Control S by cube ${control.S.map(f4).join(', ')}, count ${control.E.map(f4).join(', ')}. Masked lump start against vetoBeat: ${out.agree} of ${MASKED_BEATS}. ${((Date.now() - started) / 1000).toFixed(0)} s.`,
    })
  },
})
