// IS THE BOUND REGISTER PAIR'S BAND ISOTROPIC AT A SECOND PAIR SIZE, a_B 4.5 AGAINST E-RLT-0119's 3.5 (E-RLT-0120)?
// For vibe-roadmap-moving-matter-0003: bound matter moves off every line with less than 2% leading-order anisotropy, on
// the candidate rule's swap coin and register.
//
// WHY A SECOND SIZE. E-RLT-0119 read the pair (a_B 3.5, ball 16) in five husk directions: one band, mobile everywhere,
// M = 1 / (2A) spread 0.13% against the 2% gate. Its two failing checks were instruments, not physics (the traps of
// note/project/vibe/roadmap/moving-matter/traps.md): an exact-equality check across machines (1 ulp, x86 against arm),
// and a lag check made of a half-length filter diagonalization that could not resolve satellite lines. The symmetry
// argument (the cycle commutes with the 48 elements of O_h, so a non-degenerate band's K^2 term is a scalar) makes
// isotropy come down to mobility and one band. A second size asks whether that holds as a property of the bound pair
// and not of one binding strength. a_B 4.5 is 1.29 times the size and puts the lattice term 1 / a_B^2 at 0.60 of
// E-RLT-0119's, toward the continuum the rest of the program moves to (E-MTR-0033, E-SPN-0217). The ball is
// code/measure/register-track's radiusOf(4.5) = 21, the rule E-RLT-0119's 16 = radiusOf(3.5) followed. A smaller pair
// (a stronger lattice test, cheaper) was not chosen: below 3.5 the hydrogenic start has not been used with this engine.
//
// THE OBJECT. The pair's K = 0 level (code/measure/pair-direction pairLevel, on the O_h sector of the ball) unfolded into
// the little group's sector of K = kappa n and run at K = kappa n, kappa 0.04, 0.08, 0.12, 0.16, 8,191 lags
// (code/measure/band-curvature bandRun): the same five directions and two cubic images as E-RLT-0119 (axis (1, 0, 0) and
// face (1, 1, 0) on husk lines, body (1, 1, 1), plane (2, 1, 0) and generic (1, 2, 3) off every line; the images
// (2, 3, 1) and (1, 2, -3) of the generic at kappa 0.16, 512 lags). The same kappas: the pair's mass is set by its
// members, so the same K reaches about the same velocities and the two sizes compare read for read.
//
// WHAT CHANGED FROM E-RLT-0119, and why (each a trap of the project):
//  - THE CURVATURE IS READ FROM THE LEVEL GROUP'S CENTROID (code/measure/level-group), never one filter-diagonalization
//    line. Below the resolution 2 pi / n a solver splits a group of close lines differently at each setting; the
//    group's centroid is the start's own diagonal energy on the group, which no mixing inside it moves. THE GROUP IS A
//    FIXED WINDOW [E_L - h, E_L + h] that holds the whole start, placed by a K = 0 probe before any K read
//    (test/record/E-RLT-0120/probe/, rlt120-window.ts on E-RLT-0119's recorded K = 0 axis correlation and on a
//    4,096-lag K = 0 axis read at a_B 4.5, with their logs): at both sizes the start's weight in [E_L - 0.02, E_L + 0.02] is 1.000000 and the smoothed density at the
//    edges is below 1e-8 of a line, so the edges sit in a gap, while the start itself is a cluster the solver does not
//    resolve (at 4.5 its lines read 0.28, 0.53, 0.10 and 0.04 at -2.6e-3, +0.7e-3, +2.0e-3 and +3.7e-3 from E_L at S
//    2,048, against 3.5's one line of 0.82). A peak-finding window (groupOverSettings) was tried on paper and set
//    aside: on such a cluster it picks a different peak at each sigma.
//  - WHAT THE CENTROID CAN AND CANNOT SAY. The start is O_h-invariant, so the K^2 term of its diagonal energy is an
//    O_h-invariant form and therefore a scalar: G2 read on centroids is assured by the symmetry, whatever the pair does
//    (the smoke test at a_B 1, a pair the controls call STUCK, gave the five A equal to 1.3e-6). G2 is kept because the
//    item names it and it checks the instrument and the K^4 contamination of the fit, but it carries no physics by
//    itself. Nor does the centroid tell one band from twelve line branches (the line classes form a 2-design, so the
//    branches' centroid moves isotropically too). The physics is G4: the residual and still-share reads against the
//    line-branch and band controls, as in E-RLT-0119, and G1's smallest-kappa shift with its settings spread.
//  - THE LAG CHECK IS THE SETTINGS SPREAD. Six settings, sigma 1.0e-3, 1.5e-3, 2.0e-3, each with window half-width h
//    0.02 and 0.015. sigma 1e-3 uses 7,434 lags and 2e-3 uses 3,715, so the spread of A over the settings is a
//    lag-convergence check made on centroids, which the trap asks for, and the two windows check the edges.
//  - EQUALITY ACROSS SECTORS AND MACHINES IS A TOLERANCE. I3 and I6 compare correlations lag by lag to 1e-12 (|x_l| <=
//    1, so 1e-12 is about 4,500 ulps of 1; E-RLT-0119 read 1.2e-14 to 6.1e-14, and a real difference of the cycle, a
//    phase change of 1e-9 a cycle, shows as 1e-6 by lag 1,024). The levels of the parts agree to 1e-12 of E_L (E-RLT-
//    0119's droplet and laptop levels differ by 1 ulp, 1.4e-16 relative).
//  - THE GATES ARE IN A FROZEN FILE. Every threshold and read setting is in test/record/E-RLT-0120/rlt120-gates.json,
//    written with the pre-registration (test/record/E-RLT-0120/rlt120-preregistration.md) before any run, and its
//    SHA-256 is fixed below: the combine refuses to give a verdict from a gates file that does not hash to it.
//
// THE READS (the frozen file names every number):
//   E0_s        the reference (axis) K = 0 group centroid at setting s (sigma, h): code/measure/level-group
//               groupMoments on [E_L - h, E_L + h]
//   d_s(kappa)  the centroid at K = kappa n minus E0_s, per setting; d the main setting's (the first)
//   FD lines    the reference's heaviest line (E0L, w0L) by filter diagonalization on [E_L - lines.below, E_L +
//               lines.above] (basis, S): used only for I2, the still share and the controls' line, never for a curvature
//   residual    the residualS-cycle Blackman-Harris filter at E0L + a_mean kappa^2 read in one cycle; still the weight of
//               the FD lines within `near` of E0L over w0L
//   CONTROLS    the reference with its main line replaced (code/measure/line-mobility replaceLine) by twelve line
//               branches at E0L + 4 a_mean kappa^2 (n . u)^2 (LINES), or by one line at E0L + A_n kappa^2 + C_n kappa^4
//               (BAND), with a_mean the mean of the five centroid A_n (both hypotheses give the centroid the same K^2
//               term, so a_mean favors neither) and A_n, C_n the direction's own centroid fit
// THE FIT. d = A kappa^2 + C kappa^4 over the four kappas, M = 1 / (2A). sigma_A is the quadrature sum of FIT (the fit's
// standard error), SETTINGS (max over settings |A_s - A|) and GRID (|A - A(kappa <= gridMax)|).
//
// GATES (verbatim in the pre-registration):
//  INSTRUMENTS: W the reference's one-cycle residual sqrt(1 - |x_1|^2) within `witness` (1%) of the level's own
//   residual; W2 a synthetic correlation of the frozen lines (the 4.5 probe's cluster and a far line outside the
//   window) gives the group centroid within synthCentroid (1e-7) of the exact weighted mean of the lines in its window,
//   at every setting; I1 |x_l| <= 1 + bounded in every correlation; I2 |z| of the reference's heaviest FD line within
//   modulus of 1; I3 every part's level within levelRelative of the first's (relative) and every sector's K = 0
//   correlation within sameLag of the reference at every lag it has; I6 each cubic image within sameLag of the generic
//   read at every lag it has; I5 the window keeps the start: group weight >= groupWeight (0.99) at every read and setting; I4 LINES
//   >= resolve x BAND for the residual at every gate kappa in every direction; G3 every sigma_A / A <= precision; every
//   read landed.
//  G1 MOBILE: in every direction A >= significant x sigma_A, and at the smallest kappa d > 0 and d >= significant x
//   max_s |d_s - d|.
//  G2 ISOTROPIC: max over the five directions of |M_n / M_mean - 1| < isotropy (0.02).
//  G4 ONE BAND, at each gate kappa (0.12, 0.16) in every direction: MOVES when residual <= BAND + (LINES - BAND) / 3
//   and, where LINES leaves a still share at least stillUsed above BAND's, still <= BAND + (LINES - BAND) / 3; STUCK
//   when residual >= BAND + 2 (LINES - BAND) / 3 (and still too, where used). A direction MOVES (STUCK) when both do.
//  VERDICT: open if an instrument fails; PASS if G1, G2 and every direction MOVES; FAIL if G1 or G2 fails or a direction
//   is STUCK; open otherwise.
//  REPORTED, moving no status: C_n and the fit C(n) = alpha + beta sum_i n_i^4; the FD heaviest-line A per direction
//   (E-RLT-0119's read); M_mean and the anisotropy against E-RLT-0119's 27.448 and 1.28e-3; minimum at K 0.
// PREDICTED: pass, M_mean within 2% of E-RLT-0119's 27.45 (the members carry the mass). THE RISK: the start at 4.5 is
//  a looser cluster than at 3.5 (its heaviest line holds 0.53 of it, not 0.82), so the line-branch and band controls,
//  built by replacing that one line, may differ by less than resolve x and I4 fail, which reads open.
//
// THE RUN AND ITS COST, estimated before it. Sectors at ball 21 (probe/rlt120-probe-4.5.log, K = 0, 32 lags): axis 5,468, face 10,323,
// body 6,983, plane 20,142, generic 38,911 representatives, 2.26 times E-RLT-0119's. E-RLT-0119's generic part took
// 19,602 s on the work droplet at 6 threads (3.3e-5 s a representative-lag), so the whole plan, 2.84e9
// representative-lags, is about 26 h at 6 threads and 45 to 55 h at 3 threads (the droplet is shared with one other
// run, nice 19). The laptop probe read 3.1e-5 s a representative-lag at 3 threads under load 16, the same rate.
// One droplet step runs the parts axes, plane, generic in turn (test/record/E-RLT-0120/run/droplet-step.sh), each saved
// as each read lands and resumable.
//
// Depth L2 (a two-body quantum walk on the husk quotient, exact in its moving block; the controls are synthetic).
// DETERMINISM: no random numbers; the start is placed; the native kernel, byte for byte the JavaScript.

import { createHash } from 'node:crypto'
import { existsSync, readFileSync } from 'node:fs'
import { experiment } from '@/test/scaffold/suite'
import { verdict, type Verdict } from '@/test/scaffold/verdict'
import {
  curvatureFit,
  harmonicFit,
  mergeBandParts,
  quarticHarmonic,
  type BandPart,
  type BandPlan,
} from '@/code/measure/band-curvature'
import { groupMoments, syntheticCorrelation } from '@/code/measure/level-group'
import { branchShifts } from '@/code/measure/lineon-branches'
import {
  filteredRead,
  heaviestLine,
  lineSolve,
  replaceLine,
  stillShare,
  type Correlation,
} from '@/code/measure/line-mobility'
import { radiusOf } from '@/code/measure/register-track'

const A_B = 4.5
export const STAGE = { aB: A_B, R: radiusOf(A_B) } as const
// the smoke test's tiny pair: the whole path (run, record, combine) in a few minutes, its own gates file
export const SMOKE_STAGE = { aB: 1, R: radiusOf(1) } as const

const KAPPAS: readonly number[] = [0.04, 0.08, 0.12, 0.16]
const IMAGE_KAPPA = 0.16

const plansFor = (lags: number, zeroShort: number, imageLags: number): Record<string, readonly BandPlan[]> => ({
  axes: [
    { name: 'axis', n: [1, 0, 0], zeroLags: lags, kappas: KAPPAS, lags, images: [] },
    { name: 'body', n: [1, 1, 1], zeroLags: zeroShort, kappas: KAPPAS, lags, images: [] },
    { name: 'face', n: [1, 1, 0], zeroLags: zeroShort, kappas: KAPPAS, lags, images: [] },
  ],
  plane: [{ name: 'plane', n: [2, 1, 0], zeroLags: zeroShort, kappas: KAPPAS, lags, images: [] }],
  generic: [
    {
      name: 'generic',
      n: [1, 2, 3],
      zeroLags: zeroShort,
      kappas: KAPPAS,
      lags,
      images: [
        { name: 'generic-turn', n: [2, 3, 1], kappa: IMAGE_KAPPA, lags: imageLags },
        { name: 'generic-mirror', n: [1, 2, -3], kappa: IMAGE_KAPPA, lags: imageLags },
      ],
    },
  ],
})

export const PARTS = plansFor(8191, 1024, 512)
export const SMOKE_PARTS = plansFor(1023, 256, 128)

export type Gates = {
  code: string
  read: {
    reference: string
    group: { sigmas: number[]; halfWidths: number[] }
    lines: { below: number; above: number; basis: number; S: number }
    residualS: number
    near: number
    gridMax: number
    gateKappas: number[]
    synthetic: { dE: number; o: number }[]
  }
  gates: {
    witness: number
    synthCentroid: number
    bounded: number
    modulus: number
    levelRelative: number
    sameLag: number
    groupWeight: number
    resolve: number
    precision: number
    significant: number
    isotropy: number
    stillUsed: number
  }
}

// the SHA-256 of test/record/E-RLT-0120/rlt120-gates.json as frozen with the pre-registration
export const GATES_SHA256 = 'ad33bafac423211ad74cdc4bc15774341dd0ccc97429ee59765180e5e197bd4a'

export const RECORD = `${import.meta.dirname}/../../record/E-RLT-0120`
export const GATES_PATH = `${RECORD}/rlt120-gates.json`
export const SMOKE_GATES_PATH = `${RECORD}/run/smoke-gates.json`

export const partPath = (name: string, dir: string = RECORD): string => `${dir}/rlt120-${name}.json`

export const sha256 = (path: string): string => createHash('sha256').update(readFileSync(path)).digest('hex')

const flag = (b: boolean): number => (b ? 1 : 0)
const third = (lo: number, hi: number, k: number): number => lo + (k * (hi - lo)) / 3
const gap = (x: Correlation, y: Correlation): number => {
  let m = 0
  const n = Math.min(x.re.length, y.re.length)

  for (let l = 0; l < n; l++) {
    m = Math.max(m, Math.hypot(x.re[l]! - y.re[l]!, x.im[l]! - y.im[l]!))
  }

  return m
}
const boundedBy = (x: Correlation, b: number): boolean => {
  for (let l = 0; l < x.re.length; l++) {
    if (Math.hypot(x.re[l]!, x.im[l]!) > 1 + b) {
      return false
    }
  }

  return true
}

export function sizeCombine(input: {
  parts: readonly BandPart[]
  gates: Gates
  plans: Record<string, readonly BandPlan[]>
  hashOk: boolean
  aB: number
}): Verdict {
  const { gates: G, hashOk } = input
  const rd = G.read
  const plans = Object.values(input.plans).flat()
  const part = mergeBandParts(input.parts)
  const { EL } = part
  const ref = part.zero[rd.reference]

  if (!ref) {
    return verdict({ status: 'open', claim: 'the reference K = 0 read has not landed', metrics: { reads: part.moved.length } })
  }

  // the settings: every Gaussian width with every window half-width, the first the main read
  const settings = rd.group.sigmas.flatMap(sigma => rd.group.halfWidths.map(half => ({ sigma, half })))
  const group = (x: Correlation) => {
    const reads = settings.map(s => ({
      ...groupMoments({ x, lo: EL - s.half, hi: EL + s.half, sigma: s.sigma }),
      lo: EL - s.half,
      hi: EL + s.half,
    }))
    const cs = reads.map(r => r.centroid)

    return { reads, main: reads[0]!, half: (Math.max(...cs) - Math.min(...cs)) / 2 }
  }
  const solve = (x: Correlation) =>
    lineSolve({ x, lo: EL - rd.lines.below, hi: EL + rd.lines.above, basis: rd.lines.basis, S: rd.lines.S })

  // the reference: centroids per setting, and its heaviest FD line
  const g0 = group(ref)
  const E0s = g0.reads.map(r => r.centroid)
  const E0 = E0s[0]!
  const refLines = solve(ref)
  const h0 = heaviestLine(refLines)
  const E0L = h0?.E ?? NaN
  const w0L = h0?.weight ?? NaN
  const witness = Math.sqrt(1 - ref.re[1]! ** 2 - ref.im[1]! ** 2)

  // W2: the synthetic witness of the centroid at every setting
  const synthLines = rd.synthetic.map(s => ({ E: E0 + s.dE, o: s.o }))
  const synth = group(syntheticCorrelation(synthLines, ref.re.length))
  const synthErr = Math.max(
    ...synth.reads.map(r => {
      const inside = synthLines.filter(l => l.E >= r.lo && l.E <= r.hi)
      const exact = inside.reduce((s, l) => s + l.o * l.E, 0) / inside.reduce((s, l) => s + l.o, 0)

      return Math.abs(r.centroid - exact)
    }),
  )

  // I3, I6
  const levels = input.parts.map(p => p.EL)
  const levelGap = Math.max(...levels.map(l => Math.abs(l - EL) / Math.abs(EL)))
  const sectorGaps = plans.filter(p => p.name !== rd.reference && part.zero[p.name]).map(p => gap(part.zero[p.name]!, ref))
  const sectorGap = sectorGaps.length > 0 ? Math.max(...sectorGaps) : NaN
  const imageGaps = part.image.map(g => {
    const of = part.moved.find(m => m.name === g.of && m.kappa === g.kappa)

    return { name: g.name, gap: of ? gap(g.x, of.x) : NaN }
  })
  const complete =
    plans.every(p => part.zero[p.name] && p.kappas.every(k => part.moved.some(m => m.name === p.name && m.kappa === k))) &&
    plans.every(p => p.images.every(g => part.image.some(m => m.name === g.name)))

  // the reads
  const reads = part.moved.map(m => {
    const plan = plans.find(p => p.name === m.name)!
    const g = group(m.x)
    const ds = g.reads.map((r, s) => r.centroid - E0s[s]!)
    const lines = solve(m.x)
    const h = heaviestLine(lines)

    return {
      name: m.name,
      kappa: m.kappa,
      n: plan.n,
      x: m.x,
      d: ds[0]!,
      ds,
      spread: Math.max(...ds.map(d => Math.abs(d - ds[0]!))),
      weights: g.reads.map(r => r.weight),
      width: g.main.width,
      lineShift: (h?.E ?? NaN) - E0L,
      still: stillShare({ lines, E0: E0L, w0: w0L, near: rd.near }),
      bounded: boundedBy(m.x, G.gates.bounded),
    }
  })

  const fitAt = (own: typeof reads, s: number) =>
    curvatureFit({ kappas: own.map(r => r.kappa), shifts: own.map(r => r.ds[s]!) })
  const perDirection = plans.map(p => {
    const own = reads.filter(r => r.name === p.name).sort((x, y) => x.kappa - y.kappa)
    const fit = fitAt(own, 0)
    const sigmaFit = Number.isFinite(fit.sigmaA) ? fit.sigmaA : 0
    const sigmaSettings = Math.max(0, ...settings.map((_, s) => Math.abs(fitAt(own, s).A - fit.A)))
    const small = own.filter(r => r.kappa <= rd.gridMax + 1e-12)
    const grid = curvatureFit({ kappas: small.map(r => r.kappa), shifts: small.map(r => r.d) })
    const sigmaGrid = Math.abs(fit.A - grid.A)
    const sigmaA = Math.hypot(sigmaFit, sigmaSettings, sigmaGrid)
    const line = curvatureFit({ kappas: own.map(r => r.kappa), shifts: own.map(r => r.lineShift) })
    const first = own[0]
    const dMin = first?.d ?? NaN
    const dMinErr = first?.spread ?? NaN

    return {
      name: p.name,
      n: p.n,
      own,
      reps: part.reps[p.name] ?? NaN,
      A: fit.A,
      C: fit.C,
      sigmaFit,
      sigmaSettings,
      sigmaGrid,
      sigmaA,
      M: 1 / (2 * fit.A),
      sigmaM: sigmaA / (2 * fit.A ** 2),
      lineA: line.A,
      precise: sigmaA / fit.A <= G.gates.precision,
      mobile: fit.A >= G.gates.significant * sigmaA && dMin > 0 && dMin >= G.gates.significant * dMinErr,
      dMin,
      dMinErr,
    }
  })
  const aMean = perDirection.reduce((s, d) => s + d.A, 0) / perDirection.length

  // the controls at the gate kappas, from the reference
  const controls = perDirection.flatMap(d =>
    rd.gateKappas.map(kappa => {
      const phase = E0L + aMean * kappa ** 2
      const xl = replaceLine({
        x: ref,
        E0: E0L,
        w0: w0L,
        energies: branchShifts({ direction: d.n, kappa, a: aMean }).map(s => E0L + s),
      })
      const xb = replaceLine({ x: ref, E0: E0L, w0: w0L, energies: [E0L + d.A * kappa ** 2 + d.C * kappa ** 4] })
      const still = (y: Correlation): number => stillShare({ lines: solve(y), E0: E0L, w0: w0L, near: rd.near })
      const lineResidual = filteredRead({ x: xl, phase, S: rd.residualS }).residual
      const bandResidual = filteredRead({ x: xb, phase, S: rd.residualS }).residual
      const lineStill = still(xl)
      const bandStill = still(xb)
      const r = reads.find(x => x.name === d.name && x.kappa === kappa)
      const residual = r ? filteredRead({ x: r.x, phase, S: rd.residualS }).residual : NaN
      const stillUsed = lineStill - bandStill >= G.gates.stillUsed
      const stillMoves = !stillUsed || (r !== undefined && r.still <= third(bandStill, lineStill, 1))
      const stillStuck = !stillUsed || (r !== undefined && r.still >= third(bandStill, lineStill, 2))

      return {
        name: d.name,
        kappa,
        lineResidual,
        bandResidual,
        lineStill,
        bandStill,
        residual,
        still: r?.still ?? NaN,
        stillUsed,
        resolved: lineResidual >= G.gates.resolve * bandResidual,
        moves: r !== undefined && residual <= third(bandResidual, lineResidual, 1) && stillMoves,
        stuck: r !== undefined && residual >= third(bandResidual, lineResidual, 2) && stillStuck,
      }
    }),
  )
  const direction = perDirection.map(d => {
    const own = controls.filter(c => c.name === d.name)

    return { ...d, moves: own.length === rd.gateKappas.length && own.every(c => c.moves), stuck: own.length === rd.gateKappas.length && own.every(c => c.stuck) }
  })

  const Mmean = direction.reduce((s, d) => s + d.M, 0) / direction.length
  const anisotropy = Math.max(...direction.map(d => Math.abs(d.M / Mmean - 1)))
  const W = Math.abs(witness / (part.residual ?? NaN) - 1) <= G.gates.witness
  const W2 = synthErr <= G.gates.synthCentroid
  const I1 =
    boundedBy(ref, G.gates.bounded) &&
    plans.every(p => !part.zero[p.name] || boundedBy(part.zero[p.name]!, G.gates.bounded)) &&
    reads.every(r => r.bounded) &&
    part.image.every(g => boundedBy(g.x, G.gates.bounded))
  const I2 = Math.abs((h0?.modulus ?? NaN) - 1) <= G.gates.modulus
  const I3 = levelGap <= G.gates.levelRelative && sectorGap <= G.gates.sameLag
  const I6 = imageGaps.length > 0 && imageGaps.every(g => g.gap <= G.gates.sameLag)
  const I5 =
    g0.reads.every(r => r.weight >= G.gates.groupWeight) &&
    reads.every(r => r.weights.every(w => w >= G.gates.groupWeight))
  const I4 = controls.every(c => c.resolved)
  const G3 = direction.every(d => d.precise)
  const instruments = hashOk && complete && W && W2 && I1 && I2 && I3 && I4 && I5 && I6 && G3
  const G1 = direction.every(d => d.mobile)
  const G2 = anisotropy < G.gates.isotropy
  const moves = direction.every(d => d.moves)
  const stuck = direction.some(d => d.stuck)
  const status: Verdict['status'] = !instruments ? 'open' : G1 && G2 && moves ? 'pass' : !G1 || !G2 || stuck ? 'fail' : 'open'
  const harmonic = harmonicFit({ ns: direction.map(d => d.n), Cs: direction.map(d => d.C) })
  const minimumAtRest = reads.length > 0 && reads.every(r => r.d > 0) && direction.every(d => d.A > 0)
  const e = (x: number, k = 3): string => x.toExponential(k)
  const total = plans.reduce((s, p) => s + p.kappas.length, 0)

  return verdict({
    status,
    claim: `a_B ${input.aB}; ${complete ? '' : `${reads.length} of ${total} reads landed; `}gates file ${hashOk ? 'as frozen' : 'NOT the frozen one'}; W ${W} (${e(witness, 4)} against the level's ${e(part.residual ?? NaN, 4)}), W2 ${W2} (${e(synthErr, 1)}), I1 ${I1}, I2 ${I2}, I3 ${I3} (levels ${e(levelGap, 1)} relative, sectors ${e(sectorGap, 2)}), I6 ${I6} (${imageGaps.map(g => `${g.name} ${e(g.gap, 2)}`).join(', ')}), I5 ${I5}, I4 ${I4}, G3 ${G3}; per direction, from the group centroid, M = 1 / (2A) +- sigma (FIT, SETTINGS, GRID parts of sigma_A): ${direction.map(d => `${d.name} ${d.M.toFixed(4)} +- ${e(d.sigmaM, 2)} (A ${d.A.toFixed(7)}; ${e(d.sigmaFit, 1)}, ${e(d.sigmaSettings, 1)}, ${e(d.sigmaGrid, 1)}), C ${d.C.toFixed(5)}, ${d.moves ? 'MOVES' : d.stuck ? 'STUCK' : 'between'}`).join('; ')}; G1 ${G1} (smallest-kappa shifts ${direction.map(d => `${e(d.dMin, 3)} +- ${e(d.dMinErr, 1)}`).join(', ')}), G2 ${G2} (max |M / M_mean - 1| ${e(anisotropy, 2)}, M_mean ${Mmean.toFixed(4)}; E-RLT-0119 at a_B 3.5: 1.28e-3, 27.448); C(n) = ${harmonic.alpha.toFixed(5)} + ${harmonic.beta.toFixed(5)} sum n_i^4, rms ${e(harmonic.rms, 1)}; minimum at K 0 ${minimumAtRest}`,
    metrics: {
      hashOk: flag(hashOk),
      W: flag(W),
      W2: flag(W2),
      I1: flag(I1),
      I2: flag(I2),
      I3: flag(I3),
      I4: flag(I4),
      I5: flag(I5),
      I6: flag(I6),
      G1: flag(G1),
      G2: flag(G2),
      G3: flag(G3),
      moves: flag(moves),
      stuck: flag(stuck),
      reads: reads.length,
      EL,
      E0,
      E0L,
      w0L,
      witness,
      synthErr,
      levelGap,
      sectorGap,
      imageGap: imageGaps.length > 0 ? Math.max(...imageGaps.map(g => g.gap)) : NaN,
      anisotropy,
      Mmean,
      aMean,
      ...Object.fromEntries(
        direction.flatMap(d => [
          [`${d.name}M`, d.M],
          [`${d.name}SigmaM`, d.sigmaM],
          [`${d.name}A`, d.A],
          [`${d.name}C`, d.C],
          [`${d.name}LineA`, d.lineA],
        ]),
      ),
      harmonicAlpha: harmonic.alpha,
      harmonicBeta: harmonic.beta,
      harmonicRms: harmonic.rms,
      minimumAtRest: flag(minimumAtRest),
      seconds: part.seconds,
    },
    control: Object.fromEntries(
      controls.flatMap(c => [
        [`${c.name}${c.kappa}LineResidual`, c.lineResidual],
        [`${c.name}${c.kappa}BandResidual`, c.bandResidual],
        [`${c.name}${c.kappa}LineStill`, c.lineStill],
        [`${c.name}${c.kappa}BandStill`, c.bandStill],
      ]),
    ),
    notes: `L2. K 0 group: centroid E0 - E_L ${e(E0 - EL)}, weight ${g0.main.weight.toFixed(6)}, width ${e(g0.main.width, 2)}, settings half-spread ${e(g0.half, 1)}; heaviest FD line E0L - E_L ${e(E0L - EL)}, w0 ${w0L.toFixed(4)}, |z| - 1 ${e((h0?.modulus ?? NaN) - 1, 1)}. Representatives: ${direction.map(d => `${d.name} ${d.reps}`).join(', ')}. Per read (direction kappa: centroid shift d, its settings spread, group weights min, width; FD heaviest-line shift; still): ${reads.map(r => `${r.name} ${r.kappa}: ${e(r.d, 6)}, ${e(r.spread, 1)}, ${Math.min(...r.weights).toFixed(4)}, ${e(r.width, 2)}; ${e(r.lineShift, 5)}; ${r.still.toFixed(4)}`).join('; ')}. Gate reads (direction kappa: residual against moves-at-most and stuck-at-least, still used): ${controls.map(c => `${c.name} ${c.kappa}: ${e(c.residual, 2)} (${e(third(c.bandResidual, c.lineResidual, 1), 2)}, ${e(third(c.bandResidual, c.lineResidual, 2), 2)}), ${c.stillUsed} ${c.moves ? 'MOVES' : c.stuck ? 'STUCK' : 'between'}`).join('; ')}. FD heaviest-line A (E-RLT-0119's read, reported only): ${direction.map(d => `${d.name} ${d.lineA.toFixed(7)}`).join(', ')}. ${part.seconds.toFixed(0)} s.`,
  })
}

// the verdict from the parts in `dir` read with the gates at `gatesPath`; the frozen file must hash to GATES_SHA256
export function sizeVerdict(input: {
  dir: string
  gatesPath: string
  plans: Record<string, readonly BandPlan[]>
  frozen: boolean
  aB: number
}): Verdict {
  const names = Object.keys(input.plans)
  const parts = names
    .filter(n => existsSync(partPath(n, input.dir)))
    .map(n => JSON.parse(readFileSync(partPath(n, input.dir), 'utf8')) as BandPart)

  if (parts.length === 0) {
    return verdict({ status: 'open', claim: 'no part recorded yet', metrics: { reads: 0 } })
  }

  const gates = JSON.parse(readFileSync(input.gatesPath, 'utf8')) as Gates
  const hashOk = !input.frozen || sha256(input.gatesPath) === GATES_SHA256

  return sizeCombine({ parts, gates, plans: input.plans, hashOk, aB: input.aB })
}

export default experiment({
  id: 'relativity/bound-pair-size-isotropy',
  code: 'E-RLT-0120',
  title:
    "explores whether the bound register pair's band is isotropic at a second pair size (a_B 4.5, ball 21, against E-RLT-0119's 3.5), read from level-group centroids in five husk directions with the gates frozen in a file before the run: pending, the run is on the work droplet",
  category: 'relativity',
  substrates: ['3434'],
  depth: 'L2',
  paper: false,
  run() {
    return sizeVerdict({ dir: RECORD, gatesPath: GATES_PATH, plans: PARTS, frozen: true, aB: STAGE.aB })
  },
})
