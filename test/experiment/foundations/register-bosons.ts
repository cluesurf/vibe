// TWO COMPOSITES OF THE REGISTER SEA BUNCH LIKE BOSONS (E-FND-0166). OPEN-MAT-07 asks for bosons as even composites.
// E-FND-0158 showed it kinematically: N members turn by (-1)^N, and swapping two composites of two members is an even
// permutation, so their exchange sign is +1. This file asks for it in the dynamics, on four holes of the register rule
// in E-FND-0163's sorted store (the L = 4 D4 torus, one half, total momentum 0).
//
// DERIVED BEFORE THE GATE RUN (code/measure/register-composites; probes disclosed below).
// 1. WHAT IS KINEMATIC (L1). Every hole is a fermion of one kind, so any four-hole state is antisymmetric, and the
//    exchange of two two-hole composites is the even permutation (13)(24): +1 in every state, at every time. Reading the
//    composites' exchange sign therefore tests nothing the store does not already hold. Nor does a composite occupation
//    alone: the free rule is one-body, and a one-body unitary keeps every eigenvalue of the two-hole density matrix, so
//    it keeps any pair occupation exactly without making or keeping a composite.
// 2. WHAT A COMPOSITE IS HERE. Two holes on one site, both in the beat's sector (fiber 0 .. 3, the sector states
//    themselves at every momentum, so the site basis is exact there). The pair piece's contact angle is -2.668 a beat
//    (the contact v^2 and the string at V = 0), against 0.287 a unit of V for the string. A contact term that large
//    splits a bound band off the two-hole spectrum whatever its sign (on a lattice a strong contact binds a pair either
//    way; Winkler et al. 2006 for the repulsive case): the autocorrelation of a contact start is dominated by one pair of
//    lines at 2.04 and 2.11 a cycle under the rule, and has none there under the free rule (tmp/bs-pair-probe). B0
//    measures the binding: started at contact, the rule keeps the pair there, the free rule does not.
// 3. WHAT IS DYNAMICAL: BUNCHING AT THE EXCHANGE-FIXED SEPARATIONS (L1 counting, then the run). With composite A at site
//    R in internal state (a, b) and composite B at 0 in (c, d), the amplitude amp(R) is even in R when (a, b) = (c, d)
//    (item 1 and translation invariance). On the torus, 15 separations are their own negatives (R* = -R*: 10 at V = 2,
//    4 at V = 3, 1 at V = 4). An even function has no constraint there, an odd one vanishes there, and one with no
//    symmetry is free. A state spread uniformly over the allowed relative functions puts, per site, twice the weight at
//    a fixed point as at a non-fixed site of the same V for an even function (the Hanbury Brown and Twiss factor: the
//    symmetric basis state on {R, -R} spends half its weight on each site, the one on R* all of it), the same weight
//    with no symmetry, and none for an odd function. The start puts both composites at a NON-fixed separation, so any
//    weight at a fixed point is made by the dynamics, and whether it arrives at twice the rate is what the statistics of
//    the composites decide. The mechanism is the Hong-Ou-Mandel one, and it needs no ergodicity: an even start sits at
//    +R0 and -R0 at once, so a fixed point R* is reached by two paths of equal amplitude (from +R0, and from -R0, the same
//    path reflected) that add, while a non-fixed site is reached by two unrelated ones; in the disjoint channel the two
//    paths land in the two different orders and never meet. The factor is 2 when the two paths to a non-fixed site are
//    uncorrelated in phase. So the gate reads
//      Bose ratio = [fixed-point over non-fixed weight, equal internal states] / [the same, disjoint internal states],
//    pooled over the V = 2 and V = 3 shells. The disjoint channel (A in (0, 1), B in (2, 3) and the like) has no exchange
//    constraint of its own (exchange maps it to the other order), so it carries the geometry's and the dynamics' own
//    bias at fixed points, and dividing by it cancels that bias: polarizers parallel and crossed. Bosons read 2,
//    distinguishable composites 1, fermionic composites 0.
// 4. THE TEETH (L1, then run). The same read on two single holes (fermions), same fiber against different fibers: the
//    relative amplitude of one fiber state is odd, so its fixed-point weight is exactly zero (B2). A read that could not
//    see fermions could not see bosons.
// 5. WHAT THE BUNCHING NEEDS, AND WHY THIS RULE'S COMPOSITES CANNOT GIVE IT (derived from the probes below, before the
//    gate run). Every factor in item 3 is made by the composites' RELATIVE motion: weight has to leave the start's
//    separation and reach the fixed points. A contact composite moves only by both holes hopping together, a process
//    second order in the hop and off resonance by the contact phase: its band is at most 0.032 a cycle wide over the
//    total momenta of L = 4 (the width is at the 512-cycle spectrum's resolution, so it is an upper bound). And two
//    composites feel the pair string between all four cross pairs, a phase that changes with V, so a hop that changes
//    their separation is off resonance too. So the composites stay near their start's separation: in probe 3 the
//    two-contact-pair weight outside the start's shell was 1e-3 of it at cycle 20 and 4e-3 at cycle 32. And at V = 1 and
//    2 two composites overlap, so the Pauli exclusion between their parts (two holes of one fiber state cannot share a
//    site) can act on the equal channel and not on the disjoint one, which the division by the disjoint channel does not
//    cancel. The Bose ratio read on that thin weight swung 1.55, 1.62, 0.87, 1.18, 0.69, 0.73, 0.49, 0.83 at cycles 4 to
//    32. PREDICTED: B0, B2 and B3 pass, and the bunching is not resolved (B1 fails): FAIL, as derived. What the
//    dynamical read needs is a composite that moves (the row's standing need for a light composite, OPEN-MOT-01) under a
//    pair interaction that does not pin it, in a box where two composites can be far apart.
// 6. WHAT IT IS NOT. The 4d torus, not the husk (L2 at most); four holes in one half, one tone, one flavor, the register
//    rule; composites that are heavy (E-SPN-0162's register meson is 35 times too heavy, and this contact pair moves only
//    by the dressing). No ledger row can become held from it. The distinguishable control is the disjoint channel of the
//    same state, not a run with distinguishable parts: holes of one kind in one half have no label to tell them apart,
//    and a store without the cross-composite antisymmetry needs 34 GB at L = 4.
//
// PROBES BEFORE THE GATE RUN, disclosed; they set every threshold. tmp/bs-pair-probe (two holes at contact, 512 cycles,
//  late half): under the rule 0.934 of the sector-sector weight stays at contact on L = 4 (0.931 on L = 6), where the
//  free rule keeps 0.284 (a small torus refocuses a free pair) and 0.181; the contact start's spectrum has its two
//  strongest lines at 2.043 and 2.105 under the rule, the free rule's at 5.52 and 0. tmp/bs-probe2 (two single holes
//  from a V = 1 start, 256 cycles, late half): the same-fiber fixed-point weight 3.3e-29 (odd, as derived), different
//  fibers 0.719 of the non-fixed weight at the same V: the geometry alone biases fixed points, which is why the gate
//  divides by the disjoint channel. tmp/bs-read-test (L = 2): the start's two-contact-pair weight is 1 to 2e-16 and the
//  read equals a direct sum over the unfolded dense state to 4.0e-16. tmp/bs-probe5 (two holes at contact at 16 total
//  momenta, 512 cycles): the strongest line lies between 2.019 and 2.051 a cycle, so the composite band is at most
//  0.032 wide. tmp/bs-probe3 (four holes, both composites (0, 1) at the first non-fixed V = 1 site, 32 cycles, read
//  every 4): the two-contact-pair weight 1, 0.756, 0.690, 0.532, 0.516, 0.393, 0.321, 0.240, 0.208, falling as the
//  adjacent composites dissolve; the Bose ratio as in item 5; the equal channel even to 1.5e-17 at every read.
//  tmp/bs-probe3-free.log (the same start under the free rule, 8 cycles): 0.512, 0.109, 0.052, 0.091, 0.095, 0.028,
//  0.005, 0.003, and the disjoint channel stays empty (below 3e-37), so under the rule the disjoint channel is filled
//  by the pair pieces alone.
//  SMOKE (tmp/tb-smoke-0166.ts, 4 cycles; tmp/tb-smoke-E-FND-0166.log) ran every path and exposed two errors in the
//  code, both fixed before the gate run, with no gate or threshold moved: the lone composite's contact weight was per
//  site (N = 128 times too small, so B3's bar was 4.5e-6), and the start's own separations +-R0 were inside the
//  non-fixed means, which for S2 (a V = 2 start, in the pooled shell) put the start's own weight in the disjoint
//  channel's reference and read a Bose ratio of 22,933. Both reads now leave +-R0 out. A gate launch made before the
//  fix was stopped after its two-hole parts (tmp/tb-gate-E-FND-0166-stopped.log: B0 0.933 and 0.298, B2 3.3e-29 and
//  0.719); the gate run is the one after.
//
// THE RUN. The L = 4 torus, E-SPN-0175's rule as in E-FND-0162 (the member mixers at ringUnit(-1, 4), the sector string
// ringUnit(-2, 1) a unit of V, cap 8, the sector contact v^2 with v = ringUnit(2, 0), hole angles reversed), one half.
// B0 and B2 on two holes (E-FND-0161's dense engine, 256 cycles, late 129 to 256). The composites on four holes in the
// sorted store on the native kernel, 48 cycles, the late window cycles 25 to 48 read every 2, from two starts, each two
// contact composites at a non-fixed separation: S1 both in internal state (0, 1) at the 8th non-fixed site of V = 1
// (index 7), S2 in the disjoint states (0, 2) and (1, 3) at the 21st non-fixed site of V = 2 (index 20). S2 starts with
// no weight in the equal channel at all, so there every bit of the equal channel's weight is made by the dynamics.
// Neither composite start is a probe's (the probe took S1's states at index 0). B0 and B2 reuse the probes' two-hole
// starts (contact, and the first V = 1 site), so their outcomes were known before the run and gate only the machinery.
//
// GATES, fixed before the gate run.
//  B0 THE COMPOSITE EXISTS: two holes started at contact in the sector keep at least 0.8 of their late sector-sector
//     weight at contact under the rule, and at most 0.4 under the free rule (probe 0.934 and 0.284).
//  B1 THE COMPOSITES BUNCH LIKE BOSONS: for both starts, the late Bose ratio is at least 1.5, the midpoint between
//     bosons (2) and no statistics (1). Set from the derivation, not the probe (which is predicted to fail it).
//  B2 THE READ SEES FERMIONS: two single holes (from a V = 1 start in fibers 0 and 1) give a late same-fiber fixed-point
//     ratio at most 1e-12, while the different-fiber ratio is at least 0.1 (so the zero is not an empty read).
//  B3 THERE ARE COMPOSITES TO READ: the late two-contact-pair weight (the probability that the four holes form two
//     contact pairs in the sector) is at least a quarter of the square of a lone composite's late contact weight (two
//     lone composites would keep that square) for both starts. It asks that composites remain, not that they are
//     unperturbed: the probe's adjacent composites fell to 0.208 by cycle 32.
// CONTROL (a failure makes the verdict partial at best). CF the free rule from S1's start leaves a two-contact-pair
//  weight below B3's bar (a quarter of the lone composite's square) after 8 cycles: without the pair pieces there are
//  no composites (probe 0.003).
// INSTRUMENT (a failure makes the verdict partial at best). I1 the equal channel is even, |amp(R) - amp(-R)| at most
//  1e-12 at every read (an exact consequence of item 1: a sign or gather error breaks it); I2 every norm within 1e-10
//  and the tie antisymmetry within 1e-13.
// READ, gating nothing: the late share of the two-contact-pair weight outside the start's V shell (how far the
//  composites moved apart), each channel's fixed-point ratio, the Bose ratio over each half of the late window, the
//  two-contact-pair weight by cycle, and the single holes' oddness.
// Verdict: fail if B0, B1, B2 or B3 fails; partial if all hold and the control or the instrument fails; pass otherwise.

import { experiment } from '@/test/scaffold/suite'
import { verdict, type Verdict } from '@/test/scaffold/verdict'
import { ringUnit, unitAngle } from '@/code/measure/swap-string'
import {
  partnerProjector48,
  registerPiece,
  scaled,
  singletProjector24,
} from '@/code/measure/spinor-register'
import { torus, type Torus } from '@/code/measure/register-sea'
import {
  holeCycle,
  holeEngine,
  holeFrame,
  newHoles,
  pairAngles,
  type HoleEngine,
  type HoleFrame,
  type Holes,
} from '@/code/measure/register-holes'
import { sortedCycle, sortedEngine, sortedNorm, sortedTies, type Sorted, type SortedEngine } from '@/code/measure/register-sorted-holes'
import {
  compositeAmplitudes,
  compositeStart,
  exchangeParity,
  fixedBunching,
  fixedSites,
  holePairAmplitude,
  type Channel,
} from '@/code/measure/register-composites'

const LIGHT: readonly [number, number] = [-1, 4]
const STRING: readonly [number, number] = [-2, 1]
const VERTEX: readonly [number, number] = [2, 0]
const CAP = 8
const BOUND = 0.8
const UNBOUND = 0.4
const BOSE = 1.5
const KEPT = 0.25
const FERMI_TOL = 1e-12
const CROSS_SEEN = 0.1
const EVEN_TOL = 1e-12
const NORM_TOL = 1e-10
const TIE_TOL = 1e-13

export type Start = { name: string; shell: number; index: number; A: [number, number]; B: [number, number] }

export type BosonPlan = {
  L: number
  pairCycles: number
  pairLateFrom: number
  cycles: number
  lateFrom: number
  every: number
  starts: readonly Start[]
  freeCycles: number
  threads: number
}

export const GATE_PLAN: BosonPlan = {
  L: 4,
  pairCycles: 256,
  pairLateFrom: 129,
  cycles: 48,
  lateFrom: 25,
  every: 2,
  starts: [
    { name: 'S1', shell: 1, index: 7, A: [0, 1], B: [0, 1] },
    { name: 'S2', shell: 2, index: 20, A: [0, 2], B: [1, 3] },
  ],
  freeCycles: 8,
  threads: 12,
}

const flag = (b: boolean): number => (b ? 1 : 0)

export default experiment({
  id: 'foundations/register-bosons',
  code: 'E-FND-0166',
  title: 'DRAFT',
  category: 'foundations',
  substrates: ['3434'],
  depth: 'L2',
  paper: false,
  run() {
    return registerBosonsRun(GATE_PLAN)
  },
})

const unit = (kj: readonly [number, number]): [number, number] => {
  const th = unitAngle(ringUnit(kj[0], kj[1]))

  return [Math.cos(th), Math.sin(th)]
}

const SECTOR_PAIRS: [number, number][] = [
  [0, 1],
  [0, 2],
  [0, 3],
  [1, 2],
  [1, 3],
  [2, 3],
]
// both composites in one internal state, and in disjoint ones
const SAME: Channel[] = SECTOR_PAIRS.map(p => ({ A: p, B: p }))
const CROSS: Channel[] = SECTOR_PAIRS.flatMap(p =>
  SECTOR_PAIRS.filter(q => !q.some(x => p.includes(x))).map(q => ({ A: p, B: q })),
)
const ALL: Channel[] = SECTOR_PAIRS.flatMap(p => SECTOR_PAIRS.map(q => ({ A: p, B: q })))

// the two-hole state at total momentum 0 with hole 1 at site R0 in fiber a and hole 2 at 0 in fiber b, antisymmetrized
// (member 0 at class j, member 1 at its negative): psi(j; a, b) = e^(-i q_j . R0), psi(j; b, a) = -e^(+i q_j . R0)
function holePairStart(fr: HoleFrame, t: Torus, R0: number, a: number, b: number): Holes {
  const F = fr.fourier
  const f = fr.fiber
  const s = newHoles(fr, 2, 0)
  const y = t.sites[R0]!

  for (let j = 0; j < F.N; j++) {
    const th = (2 * Math.PI * F.ints[j]!.reduce((x, k, m) => x + k * y[m]!, 0)) / t.L

    s.re[j * f * f + a * f + b]! += Math.cos(-th)
    s.im[j * f * f + a * f + b]! += Math.sin(-th)
    s.re[j * f * f + b * f + a]! -= Math.cos(th)
    s.im[j * f * f + b * f + a]! -= Math.sin(th)
  }

  let nrm = 0

  for (let k = 0; k < s.re.length; k++) {
    nrm += s.re[k]! ** 2 + s.im[k]! ** 2
  }

  for (let k = 0; k < s.re.length; k++) {
    s.re[k]! /= Math.sqrt(nrm)
    s.im[k]! /= Math.sqrt(nrm)
  }

  return s
}

// two holes: the sector-sector weight at each relative site, summed over sector fiber pairs
function pairSectorWeights(e: HoleEngine, s: Holes, N: number): Float64Array {
  const w = new Float64Array(N)

  for (let a = 0; a < 4; a++) {
    for (let b = 0; b < 4; b++) {
      const amp = holePairAmplitude(e, s, a, b)

      amp.re.forEach((x, R) => (w[R]! += x * x + amp.im[R]! ** 2))
    }
  }

  return w
}

type CompositeRun = {
  name: string
  R0: number
  // the late sums of the equal-internal and disjoint-internal weights over sites
  same: Float64Array
  cross: Float64Array
  // the late share of the two-contact-pair weight outside the start's V shell
  moved: number
  // the two-contact-pair weight at each read, and its late mean
  contact: { cycle: number; weight: number }[]
  lateContact: number
  ratioSame: number
  ratioCross: number
  bose: number
  // the same ratio over each half of the late window
  boseFirst: number
  boseSecond: number
  even: number
  drift: number
  ties: number
}

export function registerBosonsRun(plan: BosonPlan): Verdict {
  const started = Date.now()
  const log = (what: string): void =>
    console.error(`${what} ${Math.round((Date.now() - started) / 1000)}s`)
  const u = unit(LIGHT)
  const sAng = unitAngle(ringUnit(STRING[0], STRING[1]))
  const vAng = unitAngle(ringUnit(VERTEX[0], VERTEX[1]))
  const qS = scaled(singletProjector24(), 24)
  const qD = scaled(partnerProjector48(), 48)
  const Ps = [registerPiece(qS, u), registerPiece(qD, [u[0], -u[1]])]
  const T = torus(plan.L)
  const fr = holeFrame(T, Ps, 8)
  const N = fr.fourier.N
  const angle = pairAngles(T, -sAng, CAP, -2 * vAng)
  const fixed = fixedSites(T)
  const shellSite = (v: number, index: number): number =>
    T.sites.map((_, i) => i).filter(i => T.V[i] === v && !fixed.includes(i))[index]!
  const at = (R: number): string => `(${T.sites[R]!.join(',')})`

  // ---------------- B0: the composite exists (two holes) ----------------
  const e2 = holeEngine(fr, 2, 0)
  // the late share of the sector-sector weight at contact, and the late contact weight itself (of the whole pair)
  const contactFraction = (free: boolean): { share: number; weight: number } => {
    const s = holePairStart(fr, T, T.origin, 0, 1)
    const late = new Float64Array(N)

    let reads = 0

    for (let c = 1; c <= plan.pairCycles; c++) {
      holeCycle(e2, { angle: free ? null : angle }, s)

      if (c >= plan.pairLateFrom) {
        pairSectorWeights(e2, s, N).forEach((x, R) => (late[R]! += x))
        reads++
      }
    }

    // the per-site weight times N is the probability of contact over the whole torus
    return { share: late[T.origin]! / late.reduce((a, x) => a + x, 0), weight: (N * late[T.origin]!) / reads }
  }
  const rule2 = contactFraction(false)
  const free2 = contactFraction(true)
  const boundRule = rule2.share
  const boundFree = free2.share
  // two composites as intact as two lone ones would put the square of a lone one's contact weight in two contact pairs
  const loneSquared = rule2.weight ** 2
  const B0 = boundRule >= BOUND && boundFree <= UNBOUND

  log(`B0 two holes started at contact: late sector weight at contact ${boundRule.toFixed(4)} under the rule, ${boundFree.toFixed(4)} free`)

  // ---------------- B2: the read sees fermions (two single holes) ----------------
  let fermiSame = 0
  let fermiCross = 0
  let fermiOdd = 0

  {
    const R0 = shellSite(1, 0)
    const s = holePairStart(fr, T, R0, 0, 1)
    const same = new Float64Array(N)
    const cross = new Float64Array(N)

    for (let c = 1; c <= plan.pairCycles; c++) {
      holeCycle(e2, { angle }, s)

      if (c >= plan.pairLateFrom) {
        for (let a = 0; a < 4; a++) {
          for (let b = 0; b < 4; b++) {
            const amp = holePairAmplitude(e2, s, a, b)

            if (a === b) {
              fermiOdd = Math.max(fermiOdd, exchangeParity(T, amp, -1))
            }

            amp.re.forEach((x, R) => ((a === b ? same : cross)[R]! += x * x + amp.im[R]! ** 2))
          }
        }
      }
    }

    const own = [R0, T.neg[R0]!]

    fermiSame = fixedBunching(T, same, own).ratio
    fermiCross = fixedBunching(T, cross, own).ratio
  }

  const B2 = fermiSame <= FERMI_TOL && fermiCross >= CROSS_SEEN

  log(`B2 two single holes: fixed-point ratio same fiber ${fermiSame.toExponential(2)}, different ${fermiCross.toFixed(4)}, oddness ${fermiOdd.toExponential(2)}`)

  // ---------------- the composites ----------------
  const e4: SortedEngine = sortedEngine(fr, 4, 0, { backend: 'native', threads: plan.threads })
  const read = (
    s: Sorted,
  ): { same: Float64Array; cross: Float64Array; all: Float64Array; contact: number; even: number } => {
    const amps = compositeAmplitudes(e4, s, ALL)
    const weigh = (chs: Channel[]): Float64Array => {
      const w = new Float64Array(N)

      chs.forEach(ch => {
        const a = amps[ALL.findIndex(x => x.A === ch.A && x.B === ch.B)]!

        a.re.forEach((x, R) => (w[R]! += x * x + a.im[R]! ** 2))
      })

      return w
    }
    const all = weigh(ALL)

    return {
      same: weigh(SAME),
      cross: weigh(CROSS),
      all,
      // 12 N sum over R != 0: the probability of two contact pairs (4! orderings, halved for the two ways to name them)
      contact: 12 * N * all.reduce((x, v, R) => x + (R === T.origin ? 0 : v), 0),
      even: Math.max(...SAME.map(ch => exchangeParity(T, amps[ALL.findIndex(x => x.A === ch.A && x.B === ch.B)]!, 1))),
    }
  }
  const split = plan.lateFrom + (plan.cycles - plan.lateFrom + 1) / 2

  const relax = (st: Start): CompositeRun => {
    const R0 = shellSite(st.shell, st.index)
    const s = compositeStart(e4, T, R0, st.A, st.B)
    const same = new Float64Array(N)
    const cross = new Float64Array(N)
    const whole = new Float64Array(N)
    const halves = [0, 1].map(() => ({ same: new Float64Array(N), cross: new Float64Array(N) }))
    const contact: { cycle: number; weight: number }[] = [{ cycle: 0, weight: read(s).contact }]

    let even = 0
    let drift = 0

    for (let c = 1; c <= plan.cycles; c++) {
      sortedCycle(e4, { angle }, s)

      const inLate = c >= plan.lateFrom && (c - plan.lateFrom) % plan.every === 0

      if (inLate || c % 8 === 0) {
        const r = read(s)

        contact.push({ cycle: c, weight: r.contact })
        even = Math.max(even, r.even)
        drift = Math.max(drift, Math.abs(sortedNorm(e4, s) - 1))

        if (inLate) {
          const h = halves[c < split ? 0 : 1]!

          r.same.forEach((x, R) => {
            same[R]! += x
            h.same[R]! += x
          })
          r.cross.forEach((x, R) => {
            cross[R]! += x
            h.cross[R]! += x
          })
          r.all.forEach((x, R) => (whole[R]! += x))
        }
      }
    }

    // the start's own separations hold weight that was put there, not moved there: left out of the non-fixed means
    const own = [R0, T.neg[R0]!]
    const ratio = (a: Float64Array, b: Float64Array): number =>
      fixedBunching(T, a, own).ratio / fixedBunching(T, b, own).ratio
    const late = contact.filter(x => x.cycle >= plan.lateFrom && (x.cycle - plan.lateFrom) % plan.every === 0)
    const pairsWeight = whole.reduce((a, x, R) => a + (R === T.origin ? 0 : x), 0)
    const outside = whole.reduce((a, x, R) => a + (R === T.origin || T.V[R] === T.V[R0] ? 0 : x), 0)
    const run: CompositeRun = {
      name: st.name,
      R0,
      same,
      cross,
      moved: outside / pairsWeight,
      contact,
      lateContact: late.reduce((a, x) => a + x.weight, 0) / late.length,
      ratioSame: fixedBunching(T, same, own).ratio,
      ratioCross: fixedBunching(T, cross, own).ratio,
      bose: ratio(same, cross),
      boseFirst: ratio(halves[0]!.same, halves[0]!.cross),
      boseSecond: ratio(halves[1]!.same, halves[1]!.cross),
      even,
      drift,
      ties: sortedTies(e4, s),
    }

    log(`${st.name} composites ${st.A.join('')} and ${st.B.join('')} at ${at(R0)} (V ${T.V[R0]}): late two-contact-pair weight ${run.lateContact.toFixed(4)}, ${run.moved.toExponential(2)} of it outside the start's shell; fixed-point ratio equal ${run.ratioSame.toFixed(4)}, disjoint ${run.ratioCross.toFixed(4)}, Bose ratio ${run.bose.toFixed(4)} (halves ${run.boseFirst.toFixed(4)} ${run.boseSecond.toFixed(4)}); evenness ${run.even.toExponential(2)}`)

    return run
  }

  // ---------------- CF: the free rule breaks the composites ----------------
  let freeContact = 0
  let startContact = 0

  {
    const st = plan.starts[0]!
    const s = compositeStart(e4, T, shellSite(st.shell, st.index), st.A, st.B)

    startContact = read(s).contact

    for (let c = 1; c <= plan.freeCycles; c++) {
      sortedCycle(e4, { angle: null }, s)
    }

    freeContact = read(s).contact
  }

  log(`CF free rule: two-contact-pair weight ${startContact.toFixed(4)} at the start, ${freeContact.toFixed(4)} after ${plan.freeCycles} cycles`)

  const runs = plan.starts.map(relax)
  const B1 = runs.every(r => r.bose >= BOSE)
  const B3 = runs.every(r => r.lateContact >= KEPT * loneSquared)
  const CF = freeContact < KEPT * loneSquared
  const I1 = runs.every(r => r.even <= EVEN_TOL)
  const I2 = runs.every(r => r.drift <= NORM_TOL && r.ties <= TIE_TOL)
  const hard = B0 && B1 && B2 && B3
  const status = !hard ? 'fail' : !CF || !I1 || !I2 ? 'partial' : 'pass'
  const metrics: Record<string, number> = {
    B0: flag(B0),
    B1: flag(B1),
    B2: flag(B2),
    B3: flag(B3),
    CF: flag(CF),
    I1: flag(I1),
    I2: flag(I2),
    boundRule,
    boundFree,
    loneContact: rule2.weight,
    loneSquared,
    fermiSame,
    fermiCross,
    fermiOdd,
    freeContact,
    startContact,
    even: Math.max(...runs.map(r => r.even)),
    normDrift: Math.max(...runs.map(r => r.drift)),
    ties: Math.max(...runs.map(r => r.ties)),
    seconds: (Date.now() - started) / 1000,
  }

  runs.forEach(r => {
    metrics[`bose_${r.name}`] = r.bose
    metrics[`boseFirst_${r.name}`] = r.boseFirst
    metrics[`boseSecond_${r.name}`] = r.boseSecond
    metrics[`ratioSame_${r.name}`] = r.ratioSame
    metrics[`ratioCross_${r.name}`] = r.ratioCross
    metrics[`lateContact_${r.name}`] = r.lateContact
    metrics[`moved_${r.name}`] = r.moved
  })

  const curve = (r: CompositeRun): string => r.contact.map(x => `${x.cycle}:${x.weight.toFixed(3)}`).join(' ')

  return verdict({
    status,
    claim: `B0 ${B0} (two holes started at contact keep ${boundRule.toFixed(4)} of their sector weight there under the rule, ${boundFree.toFixed(4)} free); B1 ${B1} (Bose ratio, fixed-point bunching for equal internal states over disjoint ones: ${runs.map(r => `${r.name} ${r.bose.toFixed(4)} (equal ${r.ratioSame.toFixed(4)}, disjoint ${r.ratioCross.toFixed(4)})`).join('; ')}; bosons 2, no statistics 1, fermions 0); B2 ${B2} (two single holes: same fiber ${fermiSame.toExponential(2)}, different fibers ${fermiCross.toFixed(4)}); B3 ${B3} (late two-contact-pair weight ${runs.map(r => `${r.name} ${r.lateContact.toFixed(4)}`).join(', ')}); read: its share outside the start's V shell ${runs.map(r => `${r.name} ${r.moved.toExponential(2)}`).join(', ')}; control CF ${CF} (free rule ${startContact.toFixed(4)} to ${freeContact.toFixed(4)} in ${plan.freeCycles} cycles); instrument I1 ${I1} (evenness ${metrics.even!.toExponential(2)}) I2 ${I2} (norm ${metrics.normDrift!.toExponential(2)}, ties ${metrics.ties!.toExponential(2)})`,
    metrics,
    control: { CF: flag(CF), instrument: flag(I1 && I2) },
    notes: `L2: Hanbury Brown and Twiss counting at exchange-fixed separations, read on two bound composites of the rule's own holes, with the disjoint internal channel as the no-statistics reference and single holes as the fermion reference. The 4d torus L ${plan.L} (${fixed.length} fixed separations), four holes in one half at total momentum 0, one tone, one flavor, not the husk; the composites are heavy. No ledger row is held. Starts: ${plan.starts.map(st => `${st.name} ${st.A.join('')} and ${st.B.join('')} at ${at(shellSite(st.shell, st.index))} (V ${st.shell})`).join('; ')}. Bose ratio over the late window's halves: ${runs.map(r => `${r.name} ${r.boseFirst.toFixed(4)} then ${r.boseSecond.toFixed(4)}`).join('; ')}. Two-contact-pair weight by cycle: ${runs.map(r => `${r.name} ${curve(r)}`).join('; ')}. Single holes' same-fiber oddness ${fermiOdd.toExponential(2)}. ${((Date.now() - started) / 1000).toFixed(0)} s.`,
  })
}
