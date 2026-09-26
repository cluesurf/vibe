// Decoherence and the pointer basis: a fear-weave pair in the cold vacuum, with and without a gas around it.
//
// The pair is E-RLT-0055's love-fear pair on the cold quaternion knit (E-RLT-0054: Q8 on a cold vacuum with
// stores, the knit of the cold-vacuum line, E-FLD-0032), started at |0>|0bar>, color mode, like tokens kept
// in place. The coupling is a gas of lone vibes laid on the cold vacuum at density f, from the golden Weyl
// fill: slot i holds a vibe when frac((i + 1) phi) < f, a love or a fear by frac((i + 1) sqrt 2) < 1/2, its
// role point floor(9 frac((i + 3) phi)); the pair's two slots are set as in E-RLT-0055. f runs over 0, 1/64,
// 1/32, 1/16, 1/8, 1/4.
//
// THE ENVIRONMENT, and what is approximated. In the fear weave only open tokens carry weight, and a closed
// token that meets an open one is exchanged with it, never entangled (code/rule/fear-weave header): with the
// gas closed, the pair cannot decohere at all, by construction. So here every gas token that meets a pair
// token is opened AT that meeting, as a fresh qutrit on its classical role line (the point the knit carried
// it to, read through its crossings), meets through the color-mode kernel (the swap phase if like, the
// singlet phase love first if love-fear), and is traced out at once. That is the collision (repeated
// interaction) model: exact for a gas token met once, Markovian where one is met twice (its memory of the
// first meeting is dropped), which is disclosed and counted (repeat meetings are reported).
//
// Measured per density, over 480 beats: the pair's gas meetings (the coupling g, per beat), its purity
// Tr rho^2 = 9 sum W^2 in the knot's units, its fear share F / (L + F), and the rates: the decay per beat of
// ln(purity - 1/9) and of the fear share's excess over its late value, fitted by least squares over the run
// (the purity of the fully mixed pair is 1/9).
//
// POINTER BASIS. A single token of the pair, started on each of the 12 lines of the grid (the 4 families of
// 3 mutually unbiased basis states), run through the same gas meetings at f = 1/8 (the partner's meetings
// dropped): its final purity per line and the mean per family. The family whose states keep their purity
// best is the basis the gas selects. Nothing about which family is predicted.
//
// Gates, fixed before the first run:
//   G1 isolation: at f = 0 the pair meets no gas token and its purity is exactly 1 at every beat.
//   G2 the instrument: every traced state has weights summing to its units, purity at most 1 and at least
//      1/9, at every beat of every density.
//   G3 decoherence: at every f > 0 with at least 5 gas meetings, the final purity is below 1.
//   G4 the rate law: the purity decay rate per beat divided by the gas meeting rate agrees across the
//      densities with at least 5 gas meetings within a factor of 2 (largest over smallest).
// Reported: the fear share's path and whether it decays, the per-family purities, repeat meetings.
//
// MANA (G5 to G7 added 2026-09-26, before the first run, once E-QTM-0117 to 0121 showed the fear beat is the
// magic gate). The fear share IS mana: for any normalized grid weight, sum |W| = (L + F) / (L - F), so the
// sum-negativity mana ln sum |W| = -ln(1 - 2 x fear share), for mixed wholes as well as pure. Two exact facts
// follow before any run: a grid move is a Clifford and permutes the weights, so it keeps mana; and the trace
// of a gas token is a marginal, sum over a block of W, so by the triangle inequality it never raises sum |W|.
// Mana is made only by a meeting kernel (the pair's own, or the gas meeting's) and lost only at a trace. And
// because mana is a threshold quantity (0 exactly when no weight is negative) while purity is smooth, the
// prediction is SUDDEN DEATH OF MAGIC: once the gas has mixed the pair enough that every weight is
// non-negative, the pair's own fear beat cannot make a fear again, so mana sits at exactly 0 while the purity
// is still above 1/9.
//   G5 the ledger theorem: at every density, 0 link crossings change mana and 0 traces raise it.
//   G6 magic decays: at every f > 0 with at least 5 gas meetings, the mean mana over the last 48 beats is
//      below the isolated pair's (f = 0) mean over its last 48.
//   G7 sudden death: at f = 1/4 the mana is exactly 0 on each of the last 48 beats, after being positive.
//
// FIRST RUN (2026-09-26, 37 s): G1, G2, G3, G5, G6 pass, G7 fails, and G4 PASSED BY A HARNESS ERROR: at
// f = 1/4 the purity rises over the run (0.19 at its lowest, 0.55 at the end), its fitted decay rate is
// negative, and a negative ratio made the largest-over-smallest spread negative (-0.25), under 2. G4 is
// corrected to require every ratio positive (the gate's meaning is unchanged) and fails on the same numbers.
// Readings of the first run, unchanged by the fix: f = 1/64 and 1/32 meet no gas token in 480 beats;
// f = 1/16, 1/8, 1/4 meet 207, 72, 55 (198, 51, 18 of them repeats), so the meeting rate is not monotone in
// the density; the decay rates per gas meeting are 8.2e-5, 4.2e-3 and -1.7e-2. Mana: gas kernels make
// +73.39, +33.54, +23.73 and traces take -73.31, -33.48, -23.30, own meetings add 0.02, 0.19, 0, links 0;
// late mana 0.14, 0.20, 0.23 against the isolated pair's 0.66, and never zero. Pointer basis: all 12 line
// starts end at purity 0.8320039667106544 and mana 0.2483, to every printed digit.
// SECOND RUN (G4 fixed, two readings added: the number of distinct final wholes at double precision, and
// the largest weight difference between them): every number above repeats, G4 now fails, status fail. The
// 12 line starts, after 69 gas meetings, end in ONE whole (largest weight difference 0 at double
// precision): the gas erases the start entirely. That is why no family is selected. A pointer basis needs
// a coupling that commutes with the pointer observable (a record that reads without writing); the fear
// beat is SWAP U = ((1 - omega)/2) 1 + ((1 + omega)/2) SWAP, which commutes with no local role or tilt
// observable, so every meeting hands the token a quarter of the gas token's role and the memory of the
// start decays by a fixed factor per meeting in every basis alike.
//
// CONVENTION UPDATE (2026-09-26, E-QTM-0123 and 0124, gates unchanged, no reading added but the per-density
// count of frame rewrites). The pair's weights are on the phase index 3 a + b and the knit's classical points
// on the grid index x + 3 y; a gas token's role is the phase point's first coordinate, so it is now read
// through GRID_OF_PHASE (it was read as floor(grid / 3), the grid y, which is the tilt). The pair's own link
// crossings go through moveCoordinate, which now applies each grid move by sigma-links' identification. And
// the pair carries the color mode's frames: before a meeting a coordinate whose token changed sign is
// reflected into its new frame. THIRD RUN, after the update (3 s): status fail, the same gates (G4, G7) fail
// and the rest pass. The pair's tokens never change sign here (0 frame rewrites at every density), so the
// frames change nothing; the role reading and the grid convention move the numbers: gas meetings 207, 72,
// 55 as before, gas kernels make +70.16, +33.65, +22.78 and traces take -70.07, -33.53, -22.42, late mana
// 0.19, 0.25, 0.21 (was 0.14, 0.20, 0.23), rates per gas meeting 4.6e-4, 3.7e-3, -1.3e-2, and the 12 pointer
// starts still end in one whole, now at purity 0.7797 and mana 0.1903. The title's numbers are updated to it.
//
// Depth L2. Positions are bulk dock positions of a side-3 D4 box; the husk is not read, since nothing here
// depends on where a meeting happens, only on how many and of which kind: the numbers are role-grid numbers.

import { experiment } from '@/test/scaffold/suite'
import { verdict } from '@/test/scaffold/verdict'
import { CONJUGATE_POINT, fearKernels, GRID_OF_PHASE, meetWhole, moveCoordinate, movePhaseCoordinate, wholeLovesAndFears, type Whole } from '@/code/rule/fear-weave'
import { makeColorWeave } from '@/code/rule/color-weave'
import { COLD_FIRSTS, COLD_OPPOSITE } from '@/code/rule/cold-quaternion-knit'
import { coldRecords, coldStart, lineKnot } from '@/code/measure/knot-histories'
import { gridLines } from '@/code/measure/bell-gates'
import { GOLDEN, SILVER } from '@/code/tool/weyl'

const BEATS = 480
const DENSITIES = [0, 1 / 64, 1 / 32, 1 / 16, 1 / 8, 1 / 4]
const POINTER_DENSITY = 1 / 8
const OMEGA = (2 * Math.PI) / 3

const frac = (x: number): number => x - Math.floor(x)
const unitsOf = (w: Whole): bigint => w.weight.reduce((s, x) => s + x, 0n)
// Tr rho^2 = 3^k sum W^2 for k tokens, W the weights over the units
const purityOf = (w: Whole): number => {
  const u = Number(unitsOf(w))

  return 3 ** w.tokens.length * w.weight.reduce((s, x) => s + (Number(x) / u) ** 2, 0)
}

// least-squares slope of y against x
function slope(xs: readonly number[], ys: readonly number[]): number {
  const n = xs.length
  const mx = xs.reduce((a, b) => a + b, 0) / n
  const my = ys.reduce((a, b) => a + b, 0) / n
  const d = xs.reduce((s, x) => s + (x - mx) ** 2, 0)

  return d > 0 ? xs.reduce((s, x, i) => s + (x - mx) * ((ys[i] ?? 0) - my), 0) / d : 0
}

// open a gas token on its role line as coordinate `extra` of the knot, meet it with coordinate c, trace it out
function gasMeeting(input: {
  whole: Whole
  c: number
  role: number
  kernel: readonly (readonly number[])[]
  divisor: number
  loveFirst: boolean
}): { traced: Whole; met: Whole } {
  const { whole, c, role, kernel, divisor, loveFirst } = input
  const k = whole.tokens.length
  const line = [0, 1, 2].map(t => 3 * role + t)
  const opened: Whole = {
    tokens: [...whole.tokens, -1],
    weight: Array.from({ length: whole.weight.length * 9 }, (_, i) => (line.includes(i % 9) ? (whole.weight[Math.floor(i / 9)] ?? 0n) : 0n)),
  }
  const met = meetWhole({ whole: opened, a: loveFirst ? c : k, b: loveFirst ? k : c, kernel4: kernel, divisor, fixed: false })!
  const traced = new Array<bigint>(whole.weight.length).fill(0n)

  met.weight.forEach((x, i) => {
    traced[Math.floor(i / 9)] = (traced[Math.floor(i / 9)] ?? 0n) + x
  })

  return { traced: { tokens: whole.tokens, weight: traced }, met }
}

// mana, the sum-negativity magic monotone (Veitch, Mousavian, Gottesman and Emerson 2014): ln sum |W| over a
// normalized Wigner function, which in loves and fears is ln((L + F) / (L - F)) = -ln(1 - 2 x fear share)
// (E-QTM-0119). It is 0 exactly when no fear sits on the grid.
const manaOf = (w: Whole): number => {
  const { loves, fears } = wholeLovesAndFears(w)

  // the ratio in bigints first, so knots with large units still read exactly to 1e-15
  return Math.log(Number(((loves + fears) * 10n ** 15n) / (loves - fears)) / 1e15)
}

export default experiment({
  id: 'quantum/decoherence-in-the-cold-vacuum',
  code: 'E-QTM-0114',
  title:
    'decoherence of a fear-weave pair in the cold vacuum, read as mana: isolated, the pair stays pure; in a gas of lone vibes (the collision model) mana is made at every gas kernel and lost at every trace, links never touch it, it settles at 0.19 to 0.25 and never dies, the purity does not follow the meeting rate, and no pointer basis is selected, because the fear beat replaces a token instead of dephasing it',
  category: 'quantum',
  substrates: ['3434'],
  depth: 'L2',
  paper: false,
  run() {
    const weave = makeColorWeave({ side: 3, table: 'bind' })
    const slots = weave.mesh.cellCount * 24
    const kernels = fearKernels({ like: OMEGA, unlike: OMEGA, likeExchanged: false })!
    const allOpen = Array.from({ length: slots }, (_, i) => i)
    // the love-fear pair of E-RLT-0055 (its first line of dock 0 whose love and fear meet)
    const pairLine = (() => {
      for (let l = 0; l < 12; l++) {
        const d = COLD_FIRSTS[l] ?? 0
        const o = COLD_OPPOSITE[d] ?? 0
        const vibe = new Int8Array(slots)

        vibe[d] = 1
        vibe[o] = -1

        if (coldRecords({ start: coldStart(vibe, new Int8Array(slots)), tokens: [d, o], beats: 24 }).records.some(r => r.meetings.length > 0)) {
          return [d, o]
        }
      }

      return [0, 1]
    })()
    const [pa, pb] = pairLine as [number, number]
    const fill = (f: number): { vibe: Int8Array; point: Int8Array } => {
      const vibe = new Int8Array(slots)
      const point = new Int8Array(slots)

      for (let i = 0; i < slots; i++) {
        vibe[i] = frac((i + 1) * GOLDEN) < f ? (frac((i + 1) * SILVER) < 0.5 ? 1 : -1) : 0
        point[i] = Math.floor(9 * frac((i + 3) * GOLDEN))
      }

      vibe[pa] = 1
      vibe[pb] = -1
      point[pa] = 0
      point[pb] = 0

      return { vibe, point }
    }

    // one run: the pair (or a single token) through the knit's record with gas meetings opened and traced
    const study = (f: number, start: Whole, keep: readonly number[]) => {
      const { vibe, point } = fill(f)
      const { records } = coldRecords({ start: coldStart(vibe, point), tokens: allOpen, beats: BEATS })
      const coordinate = new Map(keep.map((t, i) => [t, i]))
      const hidden = Int8Array.from(point)
      const met = new Map<number, number>()
      let whole = start
      let gas = 0
      let repeats = 0
      let rewrites = 0
      let instrumentBad = 0
      const purity: number[] = []
      const fearShare: number[] = []
      const mana: number[] = []
      // the mana ledger by step kind: the pair's own meetings, the gas meeting's kernel, the trace, the links
      const ledger = { own: 0, gasKernel: 0, trace: 0, links: 0, traceRaises: 0, linkChanges: 0 }

      // each kept coordinate's frame, the color mode's (E-QTM-0123): before a meeting a coordinate whose token
      // now carries the other sign is rewritten in the new frame (reflected), the role unchanged. A reflection
      // permutes the weights, so it moves neither mana nor purity
      const frame = keep.map(() => 0)
      const reframe = (c: number | undefined, s: number): void => {
        if (c === undefined) return

        if ((frame[c] ?? 0) !== 0 && frame[c] !== s) {
          whole = movePhaseCoordinate(whole, c, CONJUGATE_POINT)
          rewrites++
        }

        frame[c] = s
      }

      for (const record of records) {
        record.meetings.forEach(([ta, tb], m) => {
          const [sa, sb] = record.signs?.[m] ?? [1, 1]
          const ca = coordinate.get(ta)
          const cb = coordinate.get(tb)

          reframe(ca, sa)
          reframe(cb, sb)

          if (ca !== undefined && cb !== undefined) {
            const before = manaOf(whole)

            whole =
              sa === sb
                ? meetWhole({ whole, a: ca, b: cb, kernel4: kernels.like, divisor: kernels.likeDivisor, fixed: false })!
                : meetWhole({ whole, a: sa > 0 ? ca : cb, b: sa > 0 ? cb : ca, kernel4: kernels.unlike, divisor: kernels.unlikeDivisor, fixed: false })!
            ledger.own += manaOf(whole) - before
          } else if (ca !== undefined || cb !== undefined) {
            const mine = ca !== undefined ? ta : tb
            const other = ca !== undefined ? tb : ta
            const mySign = ca !== undefined ? sa : sb
            const otherSign = ca !== undefined ? sb : sa
            const like = mySign === otherSign

            gas++
            repeats += (met.get(other) ?? 0) > 0 ? 1 : 0
            met.set(other, (met.get(other) ?? 0) + 1)

            const before = manaOf(whole)
            const step = gasMeeting({
              whole,
              c: coordinate.get(mine) ?? 0,
              // the gas token's classical point is a GRID index (x + 3 y, the knit's classical layer); its role is
              // the phase point's first coordinate a = x, read through GRID_OF_PHASE (E-QTM-0124)
              role: Math.floor((GRID_OF_PHASE[hidden[other] ?? 0] ?? 0) / 3),
              kernel: like ? kernels.like : kernels.unlike,
              divisor: like ? kernels.likeDivisor : kernels.unlikeDivisor,
              loveFirst: like || mySign > 0,
            })
            const opened = manaOf(step.met)
            const traced = manaOf(step.traced)

            ledger.gasKernel += opened - before
            ledger.trace += traced - opened
            ledger.traceRaises += traced > opened + 1e-12 ? 1 : 0
            whole = step.traced
          }
        })

        for (const [tk, g] of record.crossings) {
          const c = coordinate.get(tk)
          const act = weave.moves.act[g] ?? []

          if (c !== undefined) {
            if (g !== weave.moves.identity) {
              const before = manaOf(whole)

              whole = moveCoordinate(whole, c, act)

              const after = manaOf(whole)

              ledger.links += after - before
              ledger.linkChanges += Math.abs(after - before) > 1e-12 ? 1 : 0
            }
          } else {
            hidden[tk] = act[hidden[tk] ?? 0] ?? 0
          }
        }

        const p = purityOf(whole)
        const { loves, fears } = wholeLovesAndFears(whole)

        instrumentBad += p <= 1 + 1e-12 && p >= 1 / 9 ** (keep.length / 2) - 1e-12 && unitsOf(whole) > 0n ? 0 : 1
        purity.push(p)
        fearShare.push(Number((fears * 10n ** 15n) / (loves + fears)) / 1e15)
        mana.push(manaOf(whole))
      }

      return { gas, repeats, rewrites, purity, fearShare, mana, ledger, instrumentBad, final: whole }
    }

    const pairStart = lineKnot(pairLine, [0, 1, 2], [0, 1, 2])
    const per: Record<string, number> = {}
    let isolationOk = false
    let instrumentOk = true
    let decoheres = true
    const ratios: number[] = []
    let manaTheorem = true
    const manaLates: { f: number; late: number; gas: number; lastMana: number }[] = []

    for (const f of DENSITIES) {
      const s = study(f, pairStart, pairLine)
      const beats = s.purity.map((_, t) => t + 1)
      const excess = s.purity.map(p => Math.log(Math.max(p - 1 / 9, 1e-300)))
      const rate = -slope(beats, excess)
      const late = s.fearShare.slice(-48).reduce((a, b) => a + b, 0) / 48
      const tag = `f${Math.round(f * 64)}of64`

      per[`${tag}_gasMeetings`] = s.gas
      per[`${tag}_repeatGasMeetings`] = s.repeats
      per[`${tag}_frameRewrites`] = s.rewrites
      per[`${tag}_gasPerBeat`] = s.gas / BEATS
      per[`${tag}_purityFinal`] = s.purity[s.purity.length - 1] ?? -1
      per[`${tag}_purityMin`] = Math.min(...s.purity)
      per[`${tag}_purityDecayRate`] = rate
      per[`${tag}_fearShareFirst`] = s.fearShare.find(x => x > 0) ?? 0
      per[`${tag}_fearShareMax`] = Math.max(...s.fearShare)
      per[`${tag}_fearShareLate`] = late

      const manaLate = s.mana.slice(-48).reduce((a, b) => a + b, 0) / 48
      const lastMana = s.mana.reduce((last, m, t) => (m > 1e-12 ? t : last), -1)

      per[`${tag}_manaMax`] = Math.max(...s.mana)
      per[`${tag}_manaLate`] = manaLate
      per[`${tag}_manaLastNonzeroBeat`] = lastMana
      per[`${tag}_manaMadeAtOwnMeetings`] = s.ledger.own
      per[`${tag}_manaMadeAtGasKernels`] = s.ledger.gasKernel
      per[`${tag}_manaLostAtTraces`] = s.ledger.trace
      per[`${tag}_manaChangedAtLinks`] = s.ledger.links
      manaTheorem = manaTheorem && s.ledger.traceRaises === 0 && s.ledger.linkChanges === 0
      manaLates.push({ f, late: manaLate, gas: s.gas, lastMana })
      instrumentOk = instrumentOk && s.instrumentBad === 0

      if (f === 0) {
        isolationOk = s.gas === 0 && s.purity.every(p => Math.abs(p - 1) < 1e-12)
      } else if (s.gas >= 5) {
        decoheres = decoheres && (s.purity[s.purity.length - 1] ?? 1) < 1 - 1e-12
        ratios.push(rate / (s.gas / BEATS))
        per[`${tag}_ratePerGasMeeting`] = rate / (s.gas / BEATS)
      }
    }

    // the pointer basis: a single token on each of the 12 lines, through the gas meetings at f = 1/8
    const { families } = gridLines()
    const familyRuns = families.map(family => family.map(line => study(POINTER_DENSITY, { tokens: [pa], weight: Array.from({ length: 9 }, (_, p) => (line.includes(p) ? 1n : 0n)) }, [pa])))
    const familyPurity = familyRuns.map(runs => runs.map(r => r.purity.slice(-1)[0] ?? -1))
    // a reading added after the first run: how many different final wholes the 12 line starts end in, the
    // weights scaled to a common size, and how many gas meetings the single token had
    const finals = familyRuns.flat().map(r => {
      const u = unitsOf(r.final)

      return r.final.weight.map(x => Number((x * 10n ** 30n) / u) / 1e30)
    })

    per.pointerDistinctFinalWholes = new Set(finals.map(f => f.join(','))).size
    per.pointerLargestWeightDifference = Math.max(...finals.map(f => Math.max(...f.map((x, i) => Math.abs(x - (finals[0]?.[i] ?? 0))))))
    per.pointerGasMeetings = familyRuns[0]?.[0]?.gas ?? -1

    familyPurity.forEach((ps, k) => {
      const family = families[k] ?? []
      const runs = familyRuns[k] ?? []

      per[`pointerFamily${k}_meanManaMax`] = runs.reduce((a, r) => a + Math.max(...r.mana), 0) / Math.max(runs.length, 1)
      per[`pointerFamily${k}_meanFinalMana`] = runs.reduce((a, r) => a + (r.mana.slice(-1)[0] ?? 0), 0) / Math.max(runs.length, 1)

      per[`pointerFamily${k}_isRole`] = family.every(l => l.every(p => Math.floor(p / 3) === Math.floor((l[0] ?? 0) / 3))) ? 1 : 0
      per[`pointerFamily${k}_isTilt`] = family.every(l => l.every(p => p % 3 === (l[0] ?? 0) % 3)) ? 1 : 0
      per[`pointerFamily${k}_meanFinalPurity`] = ps.reduce((a, b) => a + b, 0) / ps.length
      per[`pointerFamily${k}_minFinalPurity`] = Math.min(...ps)
    })

    const spread = ratios.length >= 2 ? Math.max(...ratios) / Math.min(...ratios) : Number.POSITIVE_INFINITY
    const gates = {
      G1: isolationOk,
      G2: instrumentOk,
      G3: decoheres && ratios.length > 0,
      // corrected after the first run: a negative ratio made the spread negative and passed it vacuously
      G4: ratios.length >= 2 && ratios.every(r => r > 0) && spread <= 2,
      G5: manaTheorem,
      G6: (() => {
        const isolated = manaLates.find(m => m.f === 0)?.late ?? 0
        const coupled = manaLates.filter(m => m.f > 0 && m.gas >= 5)

        return coupled.length > 0 && coupled.every(m => m.late < isolated)
      })(),
      G7: (() => {
        const densest = manaLates.find(m => m.f === DENSITIES[DENSITIES.length - 1])

        return densest !== undefined && densest.gas >= 5 && densest.lastMana >= 0 && densest.lastMana < BEATS - 48
      })(),
    }
    const ok = Object.values(gates).every(Boolean)

    return verdict({
      status: ok ? 'pass' : 'fail',
      claim:
        'the love-fear pair of E-RLT-0055 in the cold vacuum meets no gas and stays exactly pure, with mana 0.66 late; in a golden gas of lone vibes, each gas meeting opened and traced, its purity falls but not at a rate set by the meeting rate (at f = 1/4 it rises again), mana falls to 0.19 to 0.25 and never dies, because every gas meeting is itself a magic gate on a fresh stabilizer token (+70.2 made at gas kernels against -70.1 lost at traces at f = 1/16, links exactly 0, no trace ever raises it), and no pointer basis is selected: after 69 gas meetings all 12 grid-line starts end in one whole, identical at double precision, since the fear beat is a partial swap with the gas token that replaces the token\'s state rather than dephasing it',
      metrics: {
        pairFirst: pa,
        pairSecond: pb,
        rateRatioSpread: spread,
        ...per,
        ...Object.fromEntries(Object.entries(gates).map(([k, v]) => [`gate_${k}`, v ? 1 : 0])),
      },
      notes:
        'L2, exact BigInt knots, golden and silver Weyl fills, no random numbers. Mana is the sum-negativity monotone ln((L + F) / (L - F)), the fear share read as magic (E-QTM-0119), ledgered by step kind. The gas is opened only at its meetings with the pair and traced at once (the collision model), since a closed token cannot entangle in the fear weave: that is the approximation, and repeat meetings with one gas token are counted. The fear share is reported, not gated: the pair\'s own meetings move it too, so its decay is not a clean decoherence signal.',
    })
  },
})
