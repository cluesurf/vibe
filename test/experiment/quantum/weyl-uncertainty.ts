// UNCERTAINTY BOUNDS FROM MATTER'S WEYL PAIR ON THE LONE VIBE'S LINE (E-QTM-0195, OPEN-QTM-03, quantum-coverage item
// 0023). The ledger holds uncertainty relations partial: entropic for role and tilt only (E-QTM-0115), E-QTM-0059 is
// textbook. OPEN-QTM-03 asks for the Robertson and entropic bounds on position and momentum observables of the rule.
// E-QTM-0167 found matter's Weyl pair on a ring of L docks: the lone vibe's beat B commutes exactly with the transported
// shift T (one dock, the vibe's point carried across the link), U T = zeta_L T U with U the dock clock, and T^L is the
// link holonomy, so on the orbit of a start the pair is that of Z_M on the covering ring of M = L c docks (c the
// holonomy cycle through the start's point). This explores whether the rule's own states meet the Robertson,
// Schrodinger-Robertson and Maassen-Uffink bounds of that pair, and which of them meet the bounds with equality.
//
// WHAT IS RUN (code/measure/column-uncertainty).
// - The E-QTM-0167 setup: the D4 weave of side L (L = 3, 6, 9, 27), the slot-0 line from the box's center (a ring of
//   L docks), the 17-member start family (startFamily(16)), B assembled from the rule's tables and checked against the
//   rule's beat on sampled columns, T the transported shift.
// - States: the lone vibe started at dock 0, slot 0, on each of the 9 points, run 2M beats by B (exact, Z[w] over 2).
//   Its amplitudes on the covering ring, psi(n, dir) = <T^n s_dir | psi>, carry every reading.
// - Observables: the dock X = n mod L (U's eigenvalue, L outcomes), the covering position N = n (dock and point
//   together, M outcomes), the T-momentum K (T's eigenphase, M outcomes, by a discrete Fourier sum). Maassen-Uffink:
//   every dock projector meets every T eigenvector with weight c / M = 1/L, so H(X) + H(K) >= log L; for the covering
//   pair H(N) + H(K) >= log M. Robertson and Schrodinger-Robertson: Schwinger's Hermitian pair on Z_M, x = s m,
//   p = F^-1 diag(s b) F, s = sqrt(2 pi / M), m and b centered.
// - Role and tilt: the role and tilt families' stabilizer states (code/measure/role-berry lineStates, exact) and their
//   overlaps, which fix the qutrit's entropic bound H(role) + H(tilt) >= log 3; and, as a reading only, the lone
//   vibe's point weight per beat sorted by role and tilt.
//
// DERIVED BEFORE THE RUN.
// - B T = T B (E-QTM-0167) and B unitary, so B maps each T eigenspace into itself: the T-momentum distribution is
//   conserved exactly. A start on one site has it flat, 1/M on each of the M values. So H(K) = log M at every beat, the
//   rule never sharpens momentum, and H(X) + H(K) = H(X) + log L + log c: the dock bound is met only where the vibe sits
//   on one dock and c = 1, the covering bound only where it sits on one covering site.
// - Flatness is exact: P(k) = 1/M for all k if and only if the autocorrelation sum_(dir, n) conj psi(n) psi(n + d) is
//   0 for every d != 0, a statement in Z[w].
// - sigma_p^2 is pinned at s^2 (M^2 - 1)/12 (the uniform spread of M consecutive integers) at every beat.
// - Robertson in a finite pair is weak: tr [x, p] = 0, and on a site state both sides are 0, so the start meets it
//   trivially. The ground state of (x^2 + p^2)/2 on Z_M nearly meets it (E-QTM-0167's column: c_0 = 1 to 1e-10 at
//   N = 17), the control that the pair can.
// - Role and tilt: any two families of grid lines give mutually unbiased bases, |<r|t>|^2 = 1/3, so Maassen and Uffink
//   give log 3, the bound E-QTM-0115 read on 209,088 token states. The lone vibe's point is a classical label: at beat 0
//   it sits on one point, H(role) + H(tilt) = 0, as E-QTM-0115's control.
//
// HYPOTHESES AND GATES, fixed before any run, never moved.
// I1 (instrument) on 17 starts x 4 rings: B closed on the line, every back slot returns, B exactly unitary, [B, T] = 0 on
//    every column, and B read off the rule equals the table B on every sampled column (18 at L = 3, 6, 9; 3 at L = 27).
// I2 at every beat of every run: the state lies on its two T orbits with exact norm 4^t; the autocorrelation is exactly 0
//    for every d != 0 at beats 0, 1 and M; the float momentum distribution is within 1e-12 of 1/M at every beat.
// C1 (control, the entropic readout) a T eigenvector (plane wave) on Z_27 reads H(N) = log 27 and H(K) = 0 (1e-12): a
//    state on the covering bound, read as such.
// C2 (control, Robertson can be met in this pair) the ground state of (x^2 + p^2)/2 on Z_M, M = 27 and 81, reads
//    sigma_x^2 sigma_p^2 / (|<[x, p]>|^2 / 4) within 1e-6 of 1.
// H1 (Maassen-Uffink, dock and T-momentum) on every start, ring, point and beat H(X) + H(K) >= log L - 1e-12, H(K) =
//    log M (1e-12), and the sum is within 1e-12 of log L only on beats where H(X) = 0 and c = 1.
// H2 (Maassen-Uffink, covering position) H(N) + H(K) >= log M - 1e-12 at every beat, within 1e-12 of log M exactly on
//    the beats where the vibe has one nonzero covering amplitude.
// H3 (Robertson and Schrodinger-Robertson) at every beat sigma_x^2 sigma_p^2 >= cov^2 + |<[x, p]>|^2 / 4 - 1e-9 (which
//    holds Robertson too) and sigma_p^2 = s^2 (M^2 - 1)/12 (1e-9).
// H4 (role and tilt) every pair of the 6 pairs of families has |<a|b>|^2 = <a|a><b|b>/3 exactly (54 pairs), so
//    H(role) + H(tilt) >= log 3 holds for every role state, with equality on the line states of either family.
// P1 (an instrument fault, since the bounds are theorems) any violation in H1, H2 or H3 beyond tolerance.
// Readings, not gates: beats t >= 1 where the vibe refocuses on one site (predicted none within 2M beats); the
// smallest Robertson ratio after beat 0 (predicted well above 1); the lone vibe's H(role) + H(tilt) per beat.
// VERDICT, fixed before the run: fail if I1, I2, C1 or C2 fails or P1 fires; pass if H1 to H4 hold; partial otherwise.
//
// WHAT THIS CAN AND CANNOT SHOW. It reads the bounds of matter's Weyl pair on the lone vibe's own states, one line, one
// vibe, the empty box (no vacuum, no meeting), love only, as E-QTM-0167. It does not reach the whole husk. Entropies and
// Robertson moments are floats; the facts they rest on (conserved flat momentum, the occupations, the overlaps of the
// role states) are exact.
//
// FIRST RUN 2026-10-27 (test/record/E-QTM-0195/run-2026-10-27.log, 89 s): PASS, every gate as registered, none moved,
// run once, no probe before it. 612 runs (17 starts x 4 rings x 9 points), c in {1, 2, 3, 4, 6} on every ring. I1, I2:
// [B, T] = 0 and B equal to the rule on every sampled column; the T-momentum exactly flat (autocorrelation 0 in Z[w] at
// beats 0, 1, M; float worst 1.7e-16). H1: H(X) + H(K) >= log L, met on 68 runs, all at beat 0 on c = 1 orbits, never
// after. H2: H(N) + H(K) >= log M (worst -7e-15, rounding), met only at beat 0; no run refocuses on one site in 2M beats.
// H3: Schrodinger-Robertson holds at every beat, sigma_p^2 pinned; Robertson is met only trivially at beat 0, and after
// it the smallest ratio sigma_x^2 sigma_p^2 / (|<[x, p]>|^2 / 4) is 1.70 (L = 3), 17.9 (6), 2.96 (9), 25.4 (27), while
// the oscillator ground state reads 1.000000 (C2). H4: 54 of 54 family pairs mutually unbiased exactly, so
// H(role) + H(tilt) >= log 3. Reading: the lone vibe's point weight falls below log 3 on 2,201 run-beats and reads 0
// after beat 0 on some runs (its point stays sharp), so the vibe's point is a classical label, not a role state.
//
// DETERMINISM: no random numbers; starts are E-MTH-0028's family. Depth L2.

import { experiment } from '@/test/scaffold/suite'
import { verdict } from '@/test/scaffold/verdict'
import { centerOf } from '@/code/measure/wall-reading'
import { startFamily, withStart } from '@/code/measure/start-ensemble'
import { makeColorWeave } from '@/code/rule/color-weave'
import { lockedTables } from '@/code/rule/doublet-locked-knit'
import { norm as eNorm, type Eisenstein } from '@/code/rule/fear-walk'
import {
  applyLine,
  commutatorColumns,
  coveringAmplitudes,
  eisensteinFloat,
  emptyConfiguration,
  flatAutocorrelation,
  lineBeat,
  lineIndex,
  lineRing,
  lineRuleColumn,
  orbitOf,
  pointOf,
  ringMoments,
  ringOscillatorGround,
  sameColumn,
  shannon,
  transportedShift,
  unitaryLine,
  type LineVector,
} from '@/code/measure/column-uncertainty'
import {
  gridLines,
  inner,
  lineOverlaps,
  lineStates,
} from '@/code/measure/role-berry'
import { conj, equals, mul, scale } from '@/code/algebra/ninth-field'

const RINGS = [3, 6, 9, 27]
const SAMPLE: Record<number, number> = { 3: 18, 6: 18, 9: 18, 27: 3 }
const LOG3 = Math.log(3)
const ETOL = 1e-12
const RTOL = 1e-9

const bitLength = (x: bigint): number => (x === 0n ? 0 : x.toString(2).length)
const ratio = (num: bigint, den: bigint): number => {
  const shift = BigInt(Math.max(0, bitLength(den) - 60))

  return Number(num >> shift) / Number(den >> shift)
}

type OrbitReading = {
  L: number
  point: number
  M: number
  c: number
  complete: boolean
  normExact: boolean
  autoExact: boolean
  flatWorst: number
  muDockWorst: number
  muDockEqual: number[]
  muDockEqualOk: boolean
  muFineWorst: number
  muFineEqualOk: boolean
  refocus: number[]
  srWorst: number
  varPWorst: number
  minRatio: number
  roleTiltMin: number
  roleTiltBelow: number
}

function runOrbit(
  op: ReturnType<typeof lineBeat>['op'],
  T: Int32Array,
  L: number,
  point: number,
): OrbitReading {
  const right = orbitOf(T, lineIndex(0, 0, point))
  const left = orbitOf(T, lineIndex(0, 1, point))
  const M = right.length
  const c = M / L
  const beats = 2 * M
  const s2 = (2 * Math.PI) / M
  const varPWant = (s2 * (M * M - 1)) / 12
  const out: OrbitReading = {
    L,
    point,
    M,
    c,
    complete: left.length === M,
    normExact: true,
    autoExact: true,
    flatWorst: 0,
    muDockWorst: Infinity,
    muDockEqual: [],
    muDockEqualOk: true,
    muFineWorst: Infinity,
    muFineEqualOk: true,
    refocus: [],
    srWorst: Infinity,
    varPWorst: 0,
    minRatio: Infinity,
    roleTiltMin: Infinity,
    roleTiltBelow: 0,
  }

  let v: LineVector = new Map([[lineIndex(0, 0, point), [1n, 0n] as Eisenstein]])

  for (let t = 0; t <= beats; t++) {
    if (t > 0) {
      v = applyLine(op, v)
    }

    const cov = coveringAmplitudes(v, right, left)

    out.complete &&= cov.complete

    let total = 0n

    for (const row of cov.amp) {
      for (const x of row) {
        total += eNorm(x)
      }
    }

    out.normExact &&= total === 4n ** BigInt(t)

    if (t === 0 || t === 1 || t === M) {
      const auto = flatAutocorrelation(cov.amp)

      out.autoExact &&= auto.every(
        (z, d) => d === 0 || (z[0] === 0n && z[1] === 0n),
      )
    }

    const re = cov.amp.map(row =>
      Float64Array.from(row.map(x => eisensteinFloat(x, t)[0])),
    )
    const im = cov.amp.map(row =>
      Float64Array.from(row.map(x => eisensteinFloat(x, t)[1])),
    )
    const r = ringMoments(re, im, M, L)

    // the exact occupations for the entropies
    const den = 4n ** BigInt(t)
    const fineExact = new Array<bigint>(M).fill(0n)

    cov.amp.forEach(row =>
      row.forEach((x, n) => {
        fineExact[n]! += eNorm(x)
      }),
    )

    const fine = fineExact.map(x => ratio(x, den))
    const dock = new Array<number>(L).fill(0)

    fine.forEach((w, n) => {
      dock[n % L]! += w
    })

    const sites = fineExact.filter(x => x !== 0n).length
    const hX = shannon(dock)
    const hN = shannon(fine)
    const hK = shannon(r.momentum)

    out.flatWorst = Math.max(
      out.flatWorst,
      ...r.momentum.map(p => Math.abs(p - 1 / M)),
    )

    const dockExcess = hX + hK - Math.log(L)
    const fineExcess = hN + hK - Math.log(M)

    out.muDockWorst = Math.min(out.muDockWorst, dockExcess)
    out.muFineWorst = Math.min(out.muFineWorst, fineExcess)

    if (Math.abs(dockExcess) <= ETOL) {
      out.muDockEqual.push(t)
      out.muDockEqualOk &&= c === 1 && dock.filter(w => w > 0).length === 1
    }

    out.muFineEqualOk &&= (Math.abs(fineExcess) <= ETOL) === (sites === 1)

    if (t > 0 && sites === 1) {
      out.refocus.push(t)
    }

    const lhs = r.varX * r.varP
    const rob = (r.comm * r.comm) / 4
    const sr = r.cov * r.cov + rob

    out.srWorst = Math.min(out.srWorst, lhs - sr)
    out.varPWorst = Math.max(out.varPWorst, Math.abs(r.varP - varPWant))

    if (t > 0 && rob > RTOL) {
      out.minRatio = Math.min(out.minRatio, lhs / rob)
    }

    // the lone vibe's point weight by role (p / 3) and tilt (p mod 3)
    const roleW = [0, 0, 0]
    const tiltW = [0, 0, 0]

    for (const [i, x] of v) {
      const w = ratio(eNorm(x), den)
      const p = pointOf(i)

      roleW[Math.floor(p / 3)]! += w
      tiltW[p % 3]! += w
    }

    const hrt = shannon(roleW) + shannon(tiltW)

    if (t > 0) {
      out.roleTiltMin = Math.min(out.roleTiltMin, hrt)
    }

    if (hrt < LOG3 - ETOL) {
      out.roleTiltBelow++
    }
  }

  return out
}

type RingRun = {
  L: number
  closed: boolean
  backOk: boolean
  unitary: boolean
  commuteT: number
  ruleMatch: boolean
  orbits: OrbitReading[]
}

function runRing(L: number): RingRun {
  const weave = makeColorWeave({ side: L, table: 'bind' })
  const ring = lineRing(weave, centerOf(L))
  const t = lockedTables(weave, 'pass')
  const { op, closed } = lineBeat(t, ring)
  const T = transportedShift(t, ring)
  const base = emptyConfiguration(weave.mesh.cellCount)

  let ruleMatch = ring.L === L

  for (let k = 0; k < SAMPLE[L]!; k++) {
    const i = lineIndex((k * 7) % ring.L, k % 2, k % 9)
    const col = lineRuleColumn(t, ring, base, i, 0)

    ruleMatch &&= col !== undefined && sameColumn(col, op[i]!)
  }

  return {
    L,
    closed,
    backOk: ring.backOk,
    unitary: unitaryLine(op),
    commuteT: commutatorColumns(op, T),
    ruleMatch,
    orbits: Array.from({ length: 9 }, (_, p) => runOrbit(op, T, ring.L, p)),
  }
}

export default experiment({
  id: 'quantum/weyl-uncertainty',
  code: 'E-QTM-0195',
  title:
    "uncertainty from matter's Weyl pair on the lone vibe's line, pass: the beat never sharpens the transported-shift momentum (exactly flat, 1/M, at every beat of 612 runs, 17 starts, L = 3, 6, 9, 27), so H(X) + H(K) >= log L holds and is met only at the start on orbits with trivial holonomy cycle (68 runs, never after), H(N) + H(K) >= log M likewise, and Schrodinger-Robertson holds with Robertson met only trivially at the start (smallest ratio after it 1.70, while the ring oscillator's ground state reads 1.000000); the role and tilt bases are mutually unbiased exactly (54 of 54 family pairs), so H(role) + H(tilt) >= log 3, while the lone vibe's own point weight is a classical label that reads below it",
  category: 'quantum',
  substrates: ['3434'],
  depth: 'L2',
  paper: false,
  run() {
    const started = Date.now()
    const log = (what: string): void =>
      console.error(`${what} ${Math.round((Date.now() - started) / 1000)}s`)
    const family = startFamily(16)
    const perStart = family.map(member =>
      withStart(member, () => {
        const rings = RINGS.map(runRing)

        log(`start ${member.name}`)

        return { name: member.name, rings }
      }),
    )

    // ---- controls ----
    const plane = (() => {
      const M = 27
      const re = [Float64Array.from({ length: M }, (_, n) => Math.cos((2 * Math.PI * n) / M) / Math.sqrt(M))]
      const im = [Float64Array.from({ length: M }, (_, n) => Math.sin((2 * Math.PI * n) / M) / Math.sqrt(M))]
      const r = ringMoments(re, im, M, M)

      return { hN: shannon(r.fine), hK: shannon(r.momentum), M }
    })()
    const C1 =
      Math.abs(plane.hN - Math.log(plane.M)) <= ETOL && plane.hK <= ETOL
    const ground = [27, 81].map(M => {
      const g = ringOscillatorGround(M)
      const r = ringMoments([g], [new Float64Array(M)], M, M)

      return { M, ratio: (r.varX * r.varP) / ((r.comm * r.comm) / 4), comm: r.comm }
    })
    const C2 = ground.every(g => Math.abs(g.ratio - 1) <= 1e-6)

    // ---- role and tilt ----
    const lines = gridLines()
    const states = lineStates(lines)
    const G = lineOverlaps(states)

    let unbiased = 0
    let pairs = 0

    for (let a = 0; a < 12; a++) {
      for (let b = 0; b < 12; b++) {
        if (lines[a]!.direction >= lines[b]!.direction) {
          continue
        }

        pairs++

        const left = mul(G[a]![b]!, conj(G[a]![b]!))
        const right = scale(
          mul(inner(states[a]!.ket, states[a]!.ket), inner(states[b]!.ket, states[b]!.ket)),
          1,
          3,
        )

        if (equals(left, right)) {
          unbiased++
        }
      }
    }

    const H4 = pairs === 54 && unbiased === 54

    // ---- gates ----
    const rings = perStart.flatMap(p => p.rings)
    const orbits = rings.flatMap(r => r.orbits)
    const I1 = rings.every(
      r => r.closed && r.backOk && r.unitary && r.commuteT === 0 && r.ruleMatch,
    )
    const I2 = orbits.every(
      o => o.complete && o.normExact && o.autoExact && o.flatWorst <= ETOL,
    )
    const H1 = orbits.every(o => o.muDockWorst >= -ETOL && o.muDockEqualOk)
    const H2 = orbits.every(o => o.muFineWorst >= -ETOL && o.muFineEqualOk)
    const H3 = orbits.every(o => o.srWorst >= -RTOL && o.varPWorst <= RTOL)
    const P1 =
      orbits.some(o => o.muDockWorst < -ETOL || o.muFineWorst < -ETOL) ||
      orbits.some(o => o.srWorst < -RTOL)
    const instrument = I1 && I2 && C1 && C2
    const status = !instrument || P1 ? 'fail' : H1 && H2 && H3 && H4 ? 'pass' : 'partial'

    const metrics: Record<string, number> = {
      starts: family.length,
      orbits: orbits.length,
      gate_I1: I1 ? 1 : 0,
      gate_I2: I2 ? 1 : 0,
      gate_C1: C1 ? 1 : 0,
      gate_C2: C2 ? 1 : 0,
      gate_H1: H1 ? 1 : 0,
      gate_H2: H2 ? 1 : 0,
      gate_H3: H3 ? 1 : 0,
      gate_H4: H4 ? 1 : 0,
      P1: P1 ? 1 : 0,
      flatWorst: Math.max(...orbits.map(o => o.flatWorst)),
      muDockWorst: Math.min(...orbits.map(o => o.muDockWorst)),
      muFineWorst: Math.min(...orbits.map(o => o.muFineWorst)),
      srWorst: Math.min(...orbits.map(o => o.srWorst)),
      minRobertsonRatio: Math.min(...orbits.map(o => o.minRatio)),
      refocusRuns: orbits.filter(o => o.refocus.length > 0).length,
      dockEqualRuns: orbits.filter(o => o.muDockEqual.length > 0).length,
      dockEqualAfterStart: orbits.filter(o => o.muDockEqual.some(t => t > 0)).length,
      roleTiltMinAfterStart: Math.min(...orbits.map(o => o.roleTiltMin)),
      roleTiltBelowBeats: orbits.reduce((s, o) => s + o.roleTiltBelow, 0),
      groundRatio27: ground[0]!.ratio,
      groundRatio81: ground[1]!.ratio,
      seconds: (Date.now() - started) / 1000,
    }

    for (const L of RINGS) {
      const at = orbits.filter(o => o.L === L)

      metrics[`L${L}_cValues`] = Number([...new Set(at.map(o => o.c))].sort((a, b) => a - b).join(''))
      metrics[`L${L}_cOne`] = at.filter(o => o.c === 1).length
      metrics[`L${L}_minRatio`] = Math.min(...at.map(o => o.minRatio))
      metrics[`L${L}_roleTiltMin`] = Math.min(...at.map(o => o.roleTiltMin))
    }

    const perRing = RINGS.map(L => {
      const at = orbits.filter(o => o.L === L)
      const cs = [...new Set(at.map(o => o.c))].sort((a, b) => a - b)

      return `L ${L}: c in {${cs.join(', ')}} (c = 1 on ${at.filter(o => o.c === 1).length} of ${at.length}), dock bound met on beats {${[...new Set(at.flatMap(o => o.muDockEqual))].join(', ')}}, refocus beats {${[...new Set(at.flatMap(o => o.refocus))].sort((a, b) => a - b).join(', ')}}, min Robertson ratio after beat 0 ${Math.min(...at.map(o => o.minRatio)).toFixed(4)}, min H(role) + H(tilt) after beat 0 ${Math.min(...at.map(o => o.roleTiltMin)).toFixed(4)}`
    })

    return verdict({
      status,
      claim: `on ${orbits.length} lone-vibe runs (17 starts, L = ${RINGS.join(', ')}, 9 points, 2M beats) the T-momentum stays exactly flat (${I2}), so H(K) = log M at every beat; H(X) + H(K) >= log L (worst excess ${metrics.muDockWorst!.toExponential(2)}), met only at the start on c = 1 orbits (${metrics.dockEqualRuns} runs, ${metrics.dockEqualAfterStart} after beat 0); H(N) + H(K) >= log M (${metrics.muFineWorst!.toExponential(2)}); Schrodinger-Robertson holds (${metrics.srWorst!.toExponential(2)}), met only trivially at the start, smallest ratio after it ${metrics.minRobertsonRatio!.toFixed(4)}; role and tilt bases mutually unbiased exactly (${unbiased} of ${pairs}), so H(role) + H(tilt) >= log 3`,
      metrics,
      control: {
        planeWaveHN: plane.hN,
        planeWaveHK: plane.hK,
        groundRatio27: ground[0]!.ratio,
        groundRatio81: ground[1]!.ratio,
      },
      notes: `L2. Gates I1 ${I1}, I2 ${I2}, C1 ${C1}, C2 ${C2}, H1 ${H1}, H2 ${H2}, H3 ${H3}, H4 ${H4}; P1 ${P1}. ${perRing.join('; ')}. Lone vibe point weight below log 3 on ${metrics.roleTiltBelowBeats} run-beats (beat 0 is one point, 0). Ground state comm ${ground.map(g => g.comm.toFixed(9)).join(', ')}. ${metrics.seconds!.toFixed(0)} s.`,
    })
  },
})
