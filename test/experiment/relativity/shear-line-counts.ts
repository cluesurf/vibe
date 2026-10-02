// The frozen shears against the line counts (E-RLT-0112), route K2a (note/research/vibe/roadmap/routes/
// gravity-cosmos-heat-classical.md, K · hydrodynamics): "in the vacuum sector the per-line love and fear counts are
// conserved (24 per dock, E-FND-0170). These are spurious invariants, the known disease of lattice gases, and a shear
// that projects onto them cannot decay. Project E-RLT-0057's frozen shears onto the line counts." Kill, in the route's
// words: "the overlap is zero".
//
// WHAT IS RUN. E-RLT-0057's cold knit rebuilt by its own rule (code/measure/color-isotropy-bound: the 15 frozen-free
// least-rank groups of W(F4), the chosen one by most moves, then largest order, then smallest rank-4 spread; its
// scatter set of quads and rotations, code/rule/cold-scatter; makeColdQuaternionKnit mode 'scatter'). Its six in-husk
// shear runs at L = 12 exactly as E-RLT-0057's hydro battery starts and reads them (code/measure/husk-hydro: Weyl-placed
// carriers, fill 0.2, bias 0.4, mode 1, 60 beats, the husk amplitude A = sum over docks of sin(2 pi (k . r) / L) times
// sum over slots of |tone| (root . a)). On each run, at beat 0 and beat 60, the k-resolved line readings: per line l (the
// slot pair d, -d), its love count, fear count and momentum at the shear's wave vector,
//   Love_l(k) = sum_x s(x) ([v_xd = +1] + [v_x,-d = +1]),  Fear_l(k) likewise for -1,
//   Mom_l(k) = sum_x s(x) (|v_xd| - |v_x,-d|),  s(x) = sin(2 pi (k . r) / L),
// and the global line counts N_l = sum_x (|v_xd| + |v_x,-d|).
//
// WHAT THE LINE COUNTS ARE. E-FND-0170 found on the WORKING rule's vacuum family 24 conserved densities, L_l and F_l,
// the love and fear count of every line direction l (12 lines, a line being the slot pair d and -d), summed over the
// mesh (support-one translation-invariant densities, so global sums), a store counted on its own line. E-RLT-0057's knit
// is a different rule (the cold quaternion knit, stores per tone as kinetic energy, no line stores). The route asks the
// overlap of E-RLT-0057's shears with L_l and F_l; this reads it in the strongest form on hand, the k-resolved counts
// Love_l(k), Fear_l(k), which would be conserved per mesh line if tones stayed on their mesh lines and k . d = 0, and in
// the global form E-FND-0170 found.
//
// DERIVED BEFORE THE GATE RUN.
// 1. THE OVERLAP IS ZERO BY PARITY. The shear amplitude is a linear functional on the occupations whose coefficient on
//    slot d of line l is s(x) (root_d . a), and root_-d = -root_d, so per line it is odd under d <-> -d: A = sum_l
//    (root_l . a) Mom_l(k) exactly. Love_l(k) and Fear_l(k) give both slots of a line the same coefficient: even. Their
//    inner product in the occupation space is (sum_x s(x)^2) times sum over the two slots of (root . a), which is 0
//    exactly, for every line, both signs, every orientation, every k. The same parity holds slot by slot for a
//    love-or-fear split, since |tone| counts love and fear alike. So the route's kill is predicted to fire.
// 2. THE GLOBAL COUNTS VANISH TWICE. Their spatial coefficient is 1, the shear's s(x), and sum_x s(x) = 0 exactly on the
//    torus when the residues k . r mod L are equally frequent (sin(2 pi j / L) = -sin(2 pi (L - j) / L)). Counted as
//    integers here.
// 3. A CONSERVED QUANTITY HOLDS A SHEAR ONLY THROUGH ITS OVERLAP (Mazur 1969): in any ensemble invariant under the knit's
//    group, which holds -1 (d <-> -d on every line), the correlation of A with an even quantity is 0, so the line counts
//    give a Mazur bound of 0 on every shear. They cannot be what keeps E-RLT-0057's three shears from decaying.
// 4. THE ODD PARTNERS DO OVERLAP. The line momenta Mom_l(k) have overlap (root_l . a) 2 sum_x s(x)^2 with A: nonzero for
//    every line with a component along a. That is the control below: the same instrument reads a nonzero overlap.
//
// PROBES BEFORE THE GATES, DISCLOSED (tmp/sl-probe1.ts, 161 s, 136 of them the group search). It rebuilt the
//  chosen group (order 16, 30 moves, 2 rotation maps, rank-4 spread 0.136) and ran the six shears at L = 12: A left
//  0.552, 0.547, 0.554 at beat 60 on axes01, axes20, axes10 and 0.001 on axes12 (the diagonals were not reached before
//  the gates were written). It printed Love_l(k) at noise level (|.| under 130 against A ~ 24,900), the global N_l
//  CHANGING over 60 beats (11,395 to 9,981 on one line), and on the frozen runs the line momenta of some lines with
//  k . d = 0 kept near 4,130 while others fell to about 1,400 and spread onto lines along k. So it was seen before the
//  gates that the line counts are not even invariants of this knit; the gates below hold the route to its words.
//
// HYPOTHESES AND GATES, fixed before the gate run, never moved.
//  I1 INSTRUMENT: the rebuilt knit is E-RLT-0057's: 15 frozen-free groups, the chosen of order 16 with 30 moves (24
//     quads, 6 rotations); on each run the decomposition A = sum_l (root_l . a) Mom_l(k) equals the husk amplitude to 1e-9
//     relative at beat 0 and beat 60; and the three orientations E-RLT-0057 found frozen (axes01, axes10, axes20) keep A
//     at beat 60 at least 0.4 of beat 0 while axes12, diagonal01, diagonal12 keep under 0.2 (E-RLT-0057: 0.55, decaying).
//  C1 CONTROL, the other outcome: for every orientation the exact overlap of A with the line momenta Mom_l(k) is nonzero
//     on every line with root_l . a nonzero (integer slot sums, times sum_x s(x)^2 > 0).
//  H1 THE ROUTE'S HYPOTHESIS: on at least one of the three frozen shears, the exact overlap of A with some k-resolved or
//     global love or fear line count is nonzero.
//  P1 FALSIFIER, the route's kill: on every frozen shear, every overlap with the 24 k-resolved and the 24 global line
//     counts is exactly 0 (integer slot sums 0, and for the global counts the residue histogram uniform as integers).
// VERDICT: pass if I1, C1 and H1 hold; fail if P1 fires or I1 or C1 fails.
// REPORTED: per orientation, A's kept fraction and decay fit (code/measure/shear-mode decayRateFit, E-RLT-0057's), the
// largest |Love_l(k)|, |Fear_l(k)| against A at beats 0 and 60 (the dynamical reading of the zero), the share of A at
// beat 60 carried by lines with k . d = 0, the line momenta kept, and whether the global N_l, L_l, F_l are kept by this
// knit over 60 beats.
//
// WHAT THIS CAN AND CANNOT SHOW. It can show exactly whether the line counts can carry any of a shear's amplitude, in
// the linear (Mazur) sense, on E-RLT-0057's knit and in general for any functional odd per line. It cannot exclude a
// nonlinear dependence of the shear on conserved counts, and it does not name what does freeze the three shears; the
// line momenta at k . d = 0 are reported as the candidate, not gated.
//
// FIRST RUN 2026-10-02 (tmp/sl-run1.log, 161 s, 132 of them the group search): FAIL, the route's kill fires as derived:
// I1 and C1 hold, H1 fails, P1 fires; no gate moved.
//  - I1: 15 frozen-free groups, the chosen of order 16 with 30 moves (rank-4 spread 0.1362); A = sum_l (root_l . a)
//    Mom_l(k) to 3.5e-14 on every run; A kept 0.552, 0.547, 0.554 at beat 60 on axes01, axes20, axes10 (decay fits r2
//    0.002 .. 0.014: no decay), 0.0009, 0.0996, 0.0026 on axes12, diagonal01, diagonal12 (r2 0.93 .. 0.98).
//  - P1: on every orientation every count overlap's slot sum is 0 (largest |.| 0) and the residues k . r mod 12 are
//    1,728 each, so sum_x s(x) = 0: the overlap of every shear with all 24 k-resolved and all 24 global love and fear
//    line counts is exactly 0. Read on the runs, the largest |Love_l(k)|, |Fear_l(k)| is 0.001 .. 0.003 of A at beat 0
//    and 0.002 .. 0.005 of A's start at beat 60: noise from the Weyl background, not carried shear.
//  - C1: the line-momentum overlaps are nonzero on 6, 6, 6, 6, 9, 9 lines (every line with root . a nonzero).
//  - THE LINE COUNTS ARE NOT INVARIANTS OF THIS KNIT: the global N_l, L_l, F_l change by 21 .. 31 percent over 60 beats
//    on every run. E-FND-0170's 24 belong to the working rule's vacuum sector; E-RLT-0057's knit moves tones between
//    lines. So the route's premise does not hold on the knit whose shears froze, and its overlap is zero besides.
//  - WHAT HOLDS THE FROZEN SHEARS (reported, not gated): at beat 60 the shear sits on the line momenta of lines with
//    k . d = 0 (share 1.009 .. 1.014 of A): on axes01 three of the four such lines keep their momentum to 1 percent
//    (4152, 4122, 4174 -> 4137, 4125, 4187) and the fourth falls to 1414, its loss appearing as 1355 and -1335 on the two lines along k
//    with no component along a; axes20 and axes10 the same pattern. On axes12, which decays, the four lines with k . d
//    = 0 and root . a nonzero all lose their momentum (to |.| < 60). So k . d = 0 is not enough; which lines keep their
//    momentum at k depends on which moves of the chosen group touch them, an odd-parity, k-resolved family the route
//    file does not yet name.
//
// Depth L1: the decisive overlaps are exact integer sums; the shear runs reproduce E-RLT-0057's float readings.
// DETERMINISM: Weyl-placed starts (code/measure/husk-hydro); nothing is drawn.

import { experiment } from '@/test/scaffold/suite'
import { verdict } from '@/test/scaffold/verdict'
import { rootsD4 } from '@/code/algebra/group/root-system'
import { linearMapOf } from '@/code/substrate/d4-box'
import {
  forcedForms,
  groupTable,
  leastRankGroups,
  rowBasis,
} from '@/code/measure/color-isotropy-bound'
import { rotationMaps, scatterMoves } from '@/code/rule/cold-scatter'
import { makeColdQuaternionKnit } from '@/code/rule/cold-quaternion-knit'
import {
  forcedIsotropySpread,
  unitSamples,
} from '@/code/measure/coarse-modes'
import {
  HUSK_SHEARS,
  coldGas,
  huskAmplitude,
  weylWaveStart,
} from '@/code/measure/husk-hydro'
import { decayRateFit } from '@/code/measure/shear-mode'

const ROOTS = rootsD4()
const GENERIC = [0.31, -0.74, 0.52, 0.29]
const SIDE = 12
const BEATS = 60
const FILL = 0.2
const BIAS = 0.4
const FROZEN = new Set(['axes01', 'axes10', 'axes20'])
const FROZEN_LEFT = 0.4
const DECAY_LEFT = 0.2
const DECOMPOSE = 1e-9

const dot = (a: readonly number[], b: readonly number[]): number =>
  a.reduce((s, x, k) => s + x * (b[k] ?? 0), 0)

type LineReading = {
  love: number[]
  fear: number[]
  mom: number[]
  count: number[]
  loveCount: number[]
  fearCount: number[]
}

export default experiment({
  id: 'relativity/shear-line-counts',
  code: 'E-RLT-0112',
  title:
    "E-RLT-0057's frozen shears have exactly zero overlap with the per-line love and fear counts, fail (the route's kill fires, as derived): a shear's amplitude is odd under d <-> -d on every line and the counts are even, so on the rebuilt knit (order 16, 30 moves) at L 12 every one of the 24 k-resolved and 24 global count overlaps is 0 on all six orientations, while the line-momentum overlaps are nonzero; axes01, axes20, axes10 keep 0.552, 0.547, 0.554 of their amplitude over 60 beats and the rest decay (0.0009 .. 0.10); the global line counts are not even kept by this knit (they move 21 .. 31 percent), and the frozen amplitude sits on the line momenta of lines perpendicular to the wave vector (share 1.01), three of four such lines keeping theirs to 1 percent",
  category: 'relativity',
  substrates: ['d4'],
  depth: 'L1',
  paper: false,
  run() {
    const started = Date.now()
    const metrics: Record<string, number> = {}
    const lines: string[] = []

    // E-RLT-0057's knit, by its own rule
    const table = groupTable()
    const mats = table.permutations.map(p => linearMapOf(p) ?? [])
    const frozenOf = (forms: number[][]): number =>
      Array.from({ length: 12 }, (_, l) => l).filter(
        l =>
          rowBasis([
            ...forms,
            Array.from({ length: 12 }, (__, k) => (k === l ? 1 : 0)),
          ]).length === forms.length,
      ).length
    const free = leastRankGroups(table).groups.filter(
      g => frozenOf(forcedForms(table, g)) === 0,
    )
    const samples = unitSamples(64)
    const rows = free.map(g => {
      const perms = g.map(x => [...(table.permutations[x] ?? [])])
      const forms = forcedForms(table, g)
      const rotations = rotationMaps({
        permutations: table.permutations,
        group: perms,
      })
      const set = scatterMoves({
        group: perms,
        forms,
        rotation: rotations[0],
      })

      return {
        set,
        order: g.length,
        moves: set.moves.length,
        spread4: forcedIsotropySpread({
          group: g.map(x => mats[x] ?? []),
          rank: 4,
          generic: GENERIC,
          samples,
        }),
      }
    })
    const chosen = [...rows].sort(
      (a, b) =>
        b.moves - a.moves || b.order - a.order || a.spread4 - b.spread4,
    )[0]!
    const system = coldGas('frozenFree', () =>
      makeColdQuaternionKnit({ mode: 'scatter', scatter: chosen.set }),
    )

    console.error(`knit ${(Date.now() - started) / 1000}s`)

    const runs = HUSK_SHEARS.map(([name, geometry]) => {
      const gas = system.make(SIDE)
      const docks = SIDE ** 4
      const pairs: [number, number][] = []

      for (let d = 0; d < 24; d++) {
        const o = gas.mesh.opposite(d)

        if (d < o) {
          pairs.push([d, o])
        }
      }

      // the spatial factor and its residue histogram (integers)
      const residue = new Int32Array(docks)
      const histogram = new Array<number>(SIDE).fill(0)

      for (let x = 0; x < docks; x++) {
        const r = [0, 1, 2, 3].map(
          k => Math.floor(x / SIDE ** k) % SIDE,
        )
        const kr = ((dot(geometry.wave, r) % SIDE) + SIDE) % SIDE

        residue[x] = kr
        histogram[kr]!++
      }

      const sine = Array.from({ length: SIDE }, (_, j) =>
        Math.sin((2 * Math.PI * j) / SIDE),
      )
      const uniform = histogram.every(h => h === histogram[0])
      const sumSquares = histogram.reduce(
        (s, h, j) => s + h * sine[j]! ** 2,
        0,
      )
      const along = pairs.map(([d]) =>
        dot(ROOTS[d]!, geometry.momentum),
      )
      const across = pairs.map(([d]) => dot(ROOTS[d]!, geometry.wave))

      // exact slot sums: the shear's coefficient (root . a, both signs alike) against each functional's
      const slot = (d: number): number =>
        dot(ROOTS[d]!, geometry.momentum)
      const countOverlap = pairs.map(([d, o]) => slot(d) + slot(o))
      const momOverlap = pairs.map(([d, o]) => slot(d) - slot(o))

      const read = (v: Int8Array): LineReading => {
        const out: LineReading = {
          love: new Array<number>(12).fill(0),
          fear: new Array<number>(12).fill(0),
          mom: new Array<number>(12).fill(0),
          count: new Array<number>(12).fill(0),
          loveCount: new Array<number>(12).fill(0),
          fearCount: new Array<number>(12).fill(0),
        }

        for (let x = 0; x < docks; x++) {
          const s = sine[residue[x]!]!

          pairs.forEach(([d, o], l) => {
            const a = v[x * 24 + d]!
            const b = v[x * 24 + o]!
            const lv = (a === 1 ? 1 : 0) + (b === 1 ? 1 : 0)
            const fr = (a === -1 ? 1 : 0) + (b === -1 ? 1 : 0)

            out.love[l]! += s * lv
            out.fear[l]! += s * fr
            out.mom[l]! += s * (Math.abs(a) - Math.abs(b))
            out.count[l]! += lv + fr
            out.loveCount[l]! += lv
            out.fearCount[l]! += fr
          })
        }

        return out
      }

      let s = gas.start(
        weylWaveStart({
          mesh: gas.mesh,
          side: SIDE,
          geometry,
          mode: 1,
          fill: FILL,
          bias: BIAS,
        }),
      )

      const series = [huskAmplitude(gas.vibe(s), SIDE, geometry, 1)]
      const r0 = read(gas.vibe(s))

      for (let t = 0; t < BEATS; t++) {
        s = gas.step(s, t)
        series.push(huskAmplitude(gas.vibe(s), SIDE, geometry, 1))
      }

      const r1 = read(gas.vibe(s))
      const a0 = series[0]!
      const a1 = series[BEATS]!
      const decomposed = (r: LineReading): number =>
        r.mom.reduce((acc, m, l) => acc + along[l]! * m, 0)
      const decomposeOff = Math.max(
        Math.abs(decomposed(r0) / a0 - 1),
        Math.abs(decomposed(r1) / a1 - 1),
      )
      const fit = decayRateFit({ series })
      const perpShare =
        r1.mom.reduce(
          (acc, m, l) => acc + (across[l] === 0 ? along[l]! * m : 0),
          0,
        ) / a1
      const countWorst = (r: LineReading): number =>
        Math.max(...r.love.map(Math.abs), ...r.fear.map(Math.abs))
      const sameList = (x: number[], y: number[]): boolean =>
        x.every((v, i) => v === y[i])

      console.error(`${name} ${(Date.now() - started) / 1000}s`)

      return {
        name,
        frozen: FROZEN.has(name),
        uniform,
        histogram,
        sumSquares,
        along,
        across,
        countOverlap,
        momOverlap,
        a0,
        a1,
        left: a1 / a0,
        gamma: fit.gamma,
        r2: fit.r2,
        decomposeOff,
        perpShare,
        countWorst0: countWorst(r0),
        countWorst1: countWorst(r1),
        mom0: r0.mom,
        mom1: r1.mom,
        globalKept: sameList(r0.count, r1.count),
        loveKept: sameList(r0.loveCount, r1.loveCount),
        fearKept: sameList(r0.fearCount, r1.fearCount),
        globalChange: Math.max(
          ...r0.count.map((c, l) => Math.abs(r1.count[l]! - c) / c),
        ),
      }
    })

    // THE GATES
    const i1 =
      rows.length === 15 &&
      chosen.order === 16 &&
      chosen.moves === 30 &&
      runs.every(
        r =>
          r.decomposeOff <= DECOMPOSE &&
          (r.frozen ? r.left >= FROZEN_LEFT : r.left < DECAY_LEFT),
      )
    const c1 = runs.every(
      r =>
        r.sumSquares > 0 &&
        r.along.every((a, l) => a === 0 || r.momOverlap[l] !== 0),
    )
    const frozenRuns = runs.filter(r => r.frozen)
    // k-resolved: (sum_x s^2) x slot sum; global: (sum_x s) x slot sum, sum_x s exactly 0 iff the histogram is uniform
    const zeroOverlap = frozenRuns.every(
      r => r.countOverlap.every(c => c === 0) && r.uniform,
    )
    const h1 = !zeroOverlap
    const p1 = zeroOverlap
    const status = i1 && c1 && h1 ? 'pass' : 'fail'

    runs.forEach(r => {
      metrics[`${r.name}_left`] = r.left
      metrics[`${r.name}_gamma`] = r.gamma
      metrics[`${r.name}_r2`] = r.r2
      metrics[`${r.name}_decomposeOff`] = r.decomposeOff
      metrics[`${r.name}_countOverlapMaxAbs`] = Math.max(
        ...r.countOverlap.map(Math.abs),
      )

      metrics[`${r.name}_momOverlapNonzero`] = r.momOverlap.filter(
        m => m !== 0,
      ).length
      metrics[`${r.name}_countWorstOverA0`] = r.countWorst0 / r.a0
      metrics[`${r.name}_countWorstOverA60`] =
        r.countWorst1 / Math.abs(r.a0)
      metrics[`${r.name}_perpShare60`] = r.perpShare
      metrics[`${r.name}_globalKept`] = r.globalKept ? 1 : 0
      metrics[`${r.name}_globalChange`] = r.globalChange
      lines.push(
        `${r.name}${r.frozen ? ' (frozen in E-RLT-0057)' : ''}: A ${r.a0.toFixed(1)} -> ${r.a1.toFixed(1)} (left ${r.left.toFixed(4)}, gamma ${r.gamma.toExponential(3)}, r2 ${r.r2.toFixed(3)}), decomposition off ${r.decomposeOff.toExponential(1)}; residues ${r.histogram.join(',')}; root.a per line ${r.along.join(' ')}, k.d ${r.across.join(' ')}; count overlaps ${r.countOverlap.join(' ')}, momentum overlaps ${r.momOverlap.join(' ')}; largest |Love_l(k)|, |Fear_l(k)| ${r.countWorst0.toFixed(0)} at beat 0, ${r.countWorst1.toFixed(0)} at beat ${BEATS}; Mom_l(k) beat 0 ${r.mom0.map(m => m.toFixed(0)).join(' ')}, beat ${BEATS} ${r.mom1.map(m => m.toFixed(0)).join(' ')}; share of A on k.d = 0 lines at beat ${BEATS} ${r.perpShare.toFixed(4)}; global N_l kept ${r.globalKept} (largest change ${r.globalChange.toFixed(4)}), L_l ${r.loveKept}, F_l ${r.fearKept}`,
      )
    })

    metrics.gate_I1 = i1 ? 1 : 0
    metrics.control_C1 = c1 ? 1 : 0
    metrics.gate_H1 = h1 ? 1 : 0
    metrics.falsifier_P1 = p1 ? 1 : 0
    metrics.frozenFreeGroups = rows.length
    metrics.chosenOrder = chosen.order
    metrics.chosenMoves = chosen.moves
    metrics.chosenSpread4 = chosen.spread4
    metrics.seconds = (Date.now() - started) / 1000

    return verdict({
      status,
      claim: `on E-RLT-0057's knit (order ${chosen.order}, ${chosen.moves} moves) at L = ${SIDE}, the frozen shears ${frozenRuns.map(r => `${r.name} (left ${r.left.toFixed(3)})`).join(', ')} have exact overlap ${zeroOverlap ? '0' : 'nonzero'} with every k-resolved and global love and fear line count, while their overlap with the line momenta is nonzero on ${runs.map(r => r.momOverlap.filter(m => m !== 0).length).join(', ')} lines; the global line counts are ${runs.every(r => r.globalKept) ? '' : 'not '}kept by this knit`,
      metrics,
      control: { c1: c1 ? 1 : 0 },
      notes: `L1. I1 ${i1}, C1 ${c1}, H1 ${h1}, P1 ${p1}. ${lines.join('. ')}.`,
    })
  },
})
