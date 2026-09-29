// Curvature from shared information around a source, read on the QUANTUM state of the working vacuum (E-GRV-0069), the
// source-side companion of E-GRV-0068 as E-GRV-0065 was of E-GRV-0064. Nothing in the rule is changed or added.
//
// THE SOURCE the rule makes without a stand-in: a lone vibe on the working vacuum (the coined no-veto store under the
// pass, E-RLT-0104, 0105), which the coin puts in superposition over positions (E-RLT-0105 Q4b). The like knot of
// E-RLT-0103 is the other source the rule provides, but it holds one occupation (E-RLT-0105 Q4a, 0 of 17), so its only
// shared information is its own two registers; the lone vibe is read.
//
// THE STATES, side 8, pass contact, 17 starts, each held exactly as its sum of terms (code/rule/coined-locked-knit
// coinedVetoBeat, veto 'none', stored pairs closed as the working vacuum is run):
//  control  no source: the working vacuum alone, 16 beats (E-GRV-0068's S1)
//  love     one open love at the center dock, first slot of line (member index mod 12), 16 beats (E-GRV-0068's S3)
//  fear     the same slot holding one open fear instead, the vacuum unchanged (the source flipped, not the world)
//
// THE READING (code/measure/quantum-shared-distance): regions are husk columns; I(A : B) the von Neumann mutual
// information of the reduced states, in bits. Around the source column (the center dock's), with r the mesh distance
// (code/measure/shared-distance meshDistance, minimal image):
//  I1(r)    the mean I over ordered column pairs at mesh distance 1 whose first column is at distance r from the source:
//           the emergent metric's local element, whose change with r is the curvature a deficit would show
//  Isrc(r)  the mean I between the source column and the columns at distance r (reported, never gated)
// Errors: jackknife over the 17 members.
//
// STAND-IN, disclosed: E-GRV-0065 read the deficit 1 - d_emergent / d_mesh against a calibrated background distance.
// Here the background is the control state; if it carries no shared information (E-GRV-0068 predicts one term, I = 0),
// no emergent distance exists to deform, and the deficit is undefined. K2 therefore reads I1(r) itself, the quantity
// the deficit would be built from, for a 1/r law; K1 asks first whether a background exists at all.
//
// Gates, fixed before the first run of this file:
//  K0 exact: the control is one term at every beat on all 17; the love and fear runs keep the norm exactly at every beat
//  K1 a background geometry: the control state carries shared information between neighboring columns: its I1, pooled
//     over all columns, is above 3 errors and above 1e-12
//  K2 the source curves it as 1/r: with the love source, I1(r) is above 3 errors and above 1e-12 at r = 1, 2, 3, 4, and
//     the least-squares slope of ln I1(r) on ln r over r = 1 to 4 lies in [-1.25, -0.75]
//  K3 charge blind: at every r = 0 to 4, I1 with the love source and with the fear source differ by at most 3 jackknife
//     errors of the difference, and by at most 1e-12 where that error is 0
// Verdict: partial if K0 fails; pass if K1, K2 and K3 hold; fail otherwise.
//
// PREDICTED, before any run: fail on K1 (the control is one term, so there is no background to curve) and on K2 (a lone
// walk spreads ballistically along its own line, so I1(r) is supported on the line and does not fall as 1/r). K3 is not
// predicted: flipping the source alone is not a symmetry of the rule, since the vacuum is not flipped with it.
//
// PROBES: none of this file's own; E-GRV-0068's tmp/grv68-probe1 timed the lone runs (side 8, 16 beats, 3.4 s).
//
// FIRST RUN (122 s, tmp/grv69-run1.log): fail on K1 and K2, as predicted, no gate moved. K0 holds: the control is ONE
// term at every beat on 17 of 17, and the love and fear runs keep the norm exactly (16 to 130 terms at beat 16). K1
// FAILS EXACTLY: the control's shared information between neighbors is 0 bits (0 +- 0), so the working vacuum has no
// emergent geometry for a source to curve. K2 FAILS: the love source's I1(r) is 4.21e-2 +- 1.55e-2 at r = 0, 5.93e-3
// +- 2.11e-3 at r = 1 (2.8 errors, under the 3 the gate asks), 1.77e-3, 6.31e-4, 2.21e-4 at r = 2 to 4, and 0 from
// r = 5; its log slope over r = 1 to 4 is -2.31, not -1. This is not a field: the lone walk lives on 4 to 8 husk columns
// of 512 (its own line), and the mean over each shell dilutes that one line's correlation by the shell's size. K3
// HOLDS: love and fear differ by far less than their errors at every r (r = 0: -1.5e-4 +- 1.2e-2), since the flipped vibe walks
// the same line. Title written after the run.
//
// DETERMINISM: no random numbers; the start family; the line fixed by the member index. Exact in Z[w]; entropies are
// floats (measurement). Depth L2. Read on the husk. NOTHING MOVES: the stream takes its neighbor's value.

import { experiment } from '@/test/scaffold/suite'
import { verdict } from '@/test/scaffold/verdict'
import { LINE_FIRSTS } from '@/code/rule/isometric-knit'
import { boxHusk } from '@/code/measure/causal-components'
import { centerOf } from '@/code/measure/wall-reading'
import { startFamily, withStart } from '@/code/measure/start-ensemble'
import {
  lockedNorm,
  lockedState,
  newTally,
  type LockedState,
} from '@/code/rule/doublet-locked-knit'
import { toWords } from '@/code/rule/occupation-veto-knit'
import {
  coinedVetoBeat,
  newCoinTally,
} from '@/code/rule/coined-locked-knit'
import { vacuumConfiguration } from '@/code/measure/doublet-locked-readings'
import { contactFresh } from '@/code/measure/occupation-veto-readings'
import { jackknife, meshDistance } from '@/code/measure/shared-distance'
import {
  displacement,
  huskGeometry,
  quantumReader,
  type HuskGeometry,
} from '@/code/measure/quantum-shared-distance'

const SIDE = 8
const BEATS = 16
const R_MAX = 6
const R_GATE = 4

type Profile = {
  near: Float64Array
  source: Float64Array
  pooled: number
  terms: number
  normExact: boolean
}

// the sums of one state: I1 summed per r (R_MAX + 1 entries), Isrc per r, the pooled neighbor sum
function profileOf(
  branches: LockedState['branches'],
  g: HuskGeometry,
  src: number,
  normExact: boolean,
): Profile {
  const reader = quantumReader(branches, g)
  const near = new Float64Array(R_MAX + 1)
  const source = new Float64Array(R_MAX + 1)

  let pooled = 0

  for (const a of reader.active) {
    for (const b of reader.active) {
      if (a === b) {
        continue
      }

      const i = reader.information(a, b)

      if (meshDistance(displacement(g, a, b)) === 1) {
        const r = meshDistance(displacement(g, src, a))

        if (r <= R_MAX) {
          near[r]! += i
        }

        pooled += i
      }

      if (a === src) {
        const r = meshDistance(displacement(g, src, b))

        if (r <= R_MAX) {
          source[r]! += i
        }
      }
    }
  }

  return { near, source, pooled, terms: branches.length, normExact }
}

// the least-squares slope of y on x
function slopeOf(pts: readonly (readonly [number, number])[]): number {
  const mx = pts.reduce((a, p) => a + p[0], 0) / pts.length
  const my = pts.reduce((a, p) => a + p[1], 0) / pts.length

  return (
    pts.reduce((a, p) => a + (p[0] - mx) * (p[1] - my), 0) /
    pts.reduce((a, p) => a + (p[0] - mx) ** 2, 0)
  )
}

function runOf(
  f: ReturnType<typeof contactFresh>,
  tone: number,
  slot: number,
): {
  branches: LockedState['branches']
  normExact: boolean
  most: number
} {
  const start = toWords(vacuumConfiguration(f, 'none'))

  if (tone !== 0) {
    start.vibe[slot] = tone
    start.open[slot] = 1
  }

  let s: LockedState = lockedState(start)
  let normExact = true
  let most = 1

  for (let t = 0; t < BEATS; t++) {
    s = coinedVetoBeat(
      'none',
      f.tables,
      s,
      t,
      newTally(),
      newCoinTally(),
    )

    const n = lockedNorm(s)

    normExact = normExact && n.total === n.unit
    most = Math.max(most, s.branches.length)
  }

  return { branches: s.branches, normExact, most }
}

export default experiment({
  id: 'gravity/quantum-shared-curvature',
  code: 'E-GRV-0069',
  title:
    'no curvature from shared information around a lone vibe on the quantum state of the working vacuum, fail on K1 and K2: the vacuum with the coin (side 8, 17 starts, 16 beats) is one term at every beat, so its neighboring husk columns share exactly 0 bits and there is no background geometry to curve; a lone love, in superposition over 16 to 130 terms, correlates only the 4 to 8 columns of its own line, and the shell mean of neighbor information around it falls from 4.2e-2 at r = 0 to 5.9e-3 (2.8 errors), 1.8e-3, 6.3e-4 and 2.2e-4 at r = 1 to 4 and to 0 from r = 5, a log slope of -2.31 that is one line diluted over growing shells, not 1/r; charge blind (love and fear agree within errors at every r), norm exact',
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

    let geometry: HuskGeometry | undefined
    let src = 0

    const perStart = family.map((member, index) =>
      withStart(member, () => {
        const f = contactFresh(SIDE, 'pass')

        geometry = huskGeometry(
          SIDE,
          boxHusk(f.weave.mesh, SIDE).column,
        )

        const center = centerOf(SIDE)
        const slot = center * 24 + LINE_FIRSTS[index % 12]!

        src = geometry.column[center]!

        const control = runOf(f, 0, slot)
        const love = runOf(f, 1, slot)
        const fear = runOf(f, -1, slot)
        const out = {
          name: member.name,
          controlMost: control.most,
          control: profileOf(
            control.branches,
            geometry,
            src,
            control.normExact,
          ),
          love: profileOf(love.branches, geometry, src, love.normExact),
          fear: profileOf(fear.branches, geometry, src, fear.normExact),
        }

        log(
          `start ${member.name}: control ${control.most}, love ${love.branches.length}, fear ${fear.branches.length} terms`,
        )

        return out
      }),
    )

    const g = geometry!
    // the number of ordered neighbor pairs whose first column is at distance r, and of columns at distance r
    const nearCount = new Float64Array(R_MAX + 1)
    const sourceCount = new Float64Array(R_MAX + 1)

    let pooledCount = 0

    for (let a = 0; a < g.columns; a++) {
      const r = meshDistance(displacement(g, src, a))

      if (a !== src && r <= R_MAX) {
        sourceCount[r]!++
      }

      for (let b = 0; b < g.columns; b++) {
        if (a === b || meshDistance(displacement(g, a, b)) !== 1) {
          continue
        }

        pooledCount++

        if (r <= R_MAX) {
          nearCount[r]!++
        }
      }
    }

    const sums = (pick: (p: (typeof perStart)[number]) => Profile) =>
      perStart.map(p =>
        Float64Array.from([
          ...pick(p).near,
          ...pick(p).source,
          pick(p).pooled,
          1,
        ]),
      )
    const at = (r: number) => (total: Float64Array) =>
      total[r]! / (nearCount[r]! * total[2 * (R_MAX + 1) + 1]!)
    const fromSource = (r: number) => (total: Float64Array) =>
      total[R_MAX + 1 + r]! /
      (Math.max(1, sourceCount[r]!) * total[2 * (R_MAX + 1) + 1]!)
    const pooledOf = (total: Float64Array) =>
      total[2 * (R_MAX + 1)]! /
      (pooledCount * total[2 * (R_MAX + 1) + 1]!)
    const loveSums = sums(p => p.love)
    const fearSums = sums(p => p.fear)
    const controlSums = sums(p => p.control)
    const above = (x: { value: number; error: number }): boolean =>
      x.value > 3 * x.error && x.value > 1e-12
    const rs = Array.from({ length: R_MAX + 1 }, (_, r) => r)
    const love = rs.map(r => jackknife(loveSums, at(r)))
    const fear = rs.map(r => jackknife(fearSums, at(r)))
    const loveSrc = rs.map(r => jackknife(loveSums, fromSource(r)))
    const fearSrc = rs.map(r => jackknife(fearSums, fromSource(r)))
    const background = jackknife(controlSums, pooledOf)
    const flipGap = rs.map(r =>
      jackknife(
        loveSums.map((s, m) =>
          Float64Array.from(s, (v, i) =>
            i === s.length - 1 ? v : v - fearSums[m]![i]!,
          ),
        ),
        total => total[r]! / (nearCount[r]! * total[total.length - 1]!),
      ),
    )

    const k0 = perStart.every(
      p => p.controlMost === 1 && p.love.normExact && p.fear.normExact,
    )
    const k1 = above(background)
    const gateRs = rs.filter(r => r >= 1 && r <= R_GATE)
    const positive = gateRs.every(r => above(love[r]!))
    const pts = gateRs
      .filter(r => love[r]!.value > 0)
      .map(r => [Math.log(r), Math.log(love[r]!.value)] as const)
    const slope = pts.length >= 2 ? slopeOf(pts) : Number.NaN
    const k2 =
      positive &&
      pts.length === gateRs.length &&
      slope >= -1.25 &&
      slope <= -0.75
    const k3 = rs
      .filter(r => r <= R_GATE)
      .every(r => {
        const d = flipGap[r]!

        return d.error > 0
          ? Math.abs(d.value) <= 3 * d.error
          : Math.abs(d.value) <= 1e-12
      })
    const status = !k0 ? 'partial' : k1 && k2 && k3 ? 'pass' : 'fail'
    const e = (v: number): string =>
      Number.isFinite(v) ? v.toExponential(3) : 'nan'
    const line = (xs: { value: number; error: number }[]): string =>
      xs
        .map((x, r) => `r${r} ${e(x.value)} +- ${e(x.error)}`)
        .join(', ')
    const range = (xs: number[]): string =>
      Math.min(...xs) === Math.max(...xs)
        ? `${Math.min(...xs)}`
        : `${Math.min(...xs)} to ${Math.max(...xs)}`

    return verdict({
      status,
      claim: `exact ${k0} (control ${range(perStart.map(p => p.controlMost))} term(s)); background shared information between neighbors ${e(background.value)} +- ${e(background.error)} bits (K1 ${k1}); love source I1(r): ${line(love.slice(0, R_GATE + 1))}, slope ${e(slope)} (K2 ${k2}); fear source I1(r): ${line(fear.slice(0, R_GATE + 1))} (K3 ${k3})`,
      metrics: {
        gate_K0: k0 ? 1 : 0,
        gate_K1: k1 ? 1 : 0,
        gate_K2: k2 ? 1 : 0,
        gate_K3: k3 ? 1 : 0,
        background: background.value,
        slope,
        ...Object.fromEntries(
          rs.map(r => [`love_I1_r${r}`, love[r]!.value]),
        ),
        ...Object.fromEntries(
          rs.map(r => [`fear_I1_r${r}`, fear[r]!.value]),
        ),
        ...Object.fromEntries(
          rs.map(r => [`love_Isrc_r${r}`, loveSrc[r]!.value]),
        ),
        loveTermsMax: Math.max(...perStart.map(p => p.love.terms)),
        fearTermsMax: Math.max(...perStart.map(p => p.fear.terms)),
        seconds: (Date.now() - started) / 1000,
      },
      control: {
        controlTermsMax: Math.max(...perStart.map(p => p.controlMost)),
        background: background.value,
      },
      notes: `L2. K0 ${k0}, K1 ${k1}, K2 ${k2} (positive ${positive}, slope ${e(slope)}), K3 ${k3}. I1 love: ${line(love)}. I1 fear: ${line(fear)}. love - fear: ${line(flipGap)}. Isrc love: ${line(loveSrc)}. Isrc fear: ${line(fearSrc)}. Pairs per r (neighbor pairs, columns): ${rs.map(r => `${nearCount[r]}, ${sourceCount[r]}`).join('; ')}. Terms per start (control, love, fear): ${perStart.map(p => `${p.name} ${p.controlMost}, ${p.love.terms}, ${p.fear.terms}`).join('; ')}. ${((Date.now() - started) / 1000).toFixed(0)} s.`,
    })
  },
})
