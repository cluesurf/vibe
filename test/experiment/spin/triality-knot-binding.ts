// Does a lepton-like knot bind when triality is kept?
//
// E-FRC-0171 found that no triple of two or three vibes travels as one object on the committed knit, the
// combined knit or the cold weave. None of the three keeps triality. The triality weave (code/rule/triality-weave,
// E-FRC-0109) does: under it the three triplet copies are exactly degenerate (E-FRC-0140) and a condensate on one
// splits them 1 + 2 (E-FRC-0141). Its four-line vertex trades one charge on a color line for three identical
// charges across a triality orbit, so it is the one knit whose own move is three-way. The question of the
// roadmap's route 2: does a knot of three loves (the three directions of a zero-sum triangle, love minus fear 3,
// whole charge 1 by Q = (love - fear)/3) travel as one object when triality is kept?
//
// Knits, imported and not edited:
// - triality: the triality weave as built (colorTriality, trialityWeaveLayout, trialityWeave defaults)
// - aligned: the same weave with every orbit listed from its copy-0 line (code/measure/generation-copies,
//   alignedLayout), which keeps each copy's charge on its own copy (E-FRC-0140)
// - committed: the turning weave, the control that keeps no triality (E-FRC-0171's instrument, rerun here)
// All on the unbounded D4 lattice, read in the bulk and on the husk (code/measure/triple-fate).
//
// Seeds, one dock at the origin at beat 0: all 27 triples on all 32 zero-sum triangles, and the 14 non-empty
// unmixed triples on the three triplet and three antitriplet copies of the COLOR plane, the plane the triality
// fixes (the committed control on the color plane's two triangles and copies only, after a timing probe showed
// it dresses to the cap at seconds a seed; E-FRC-0171 ran it on all 32). Each runs for 8 recurrence periods (the least common period of the knit's schedule and its vacuum,
// measured) or until 1,500 docks differ.
//
// Gates fixed before the first run.
// Instruments:
// - I1 the difference engine in box mode equals the dense lattice gas (knit-reference boxRun) for all 27 triples
//   on the color triangle, side 5, 48 beats, for both triality weaves: 0 mismatches
// - I2 calm-calm-calm is the vacuum on every triangle, every knit
// - I3 on the color plane the three copies of every unmixed triple meet the same fate under both triality
//   weaves (the symmetry, on this instrument), and the committed knit splits at least one case (the instrument
//   can see a split)
// Hypothesis (route 2 of the roadmap):
// - H1 under some triality weave, a knot (love-love-love or fear-fear-fear on a triangle) recurs exactly as one
//   object with at least 2 differing slots, so it is not a lone vibe
// - H2 on that weave the knot does so on both triangles of the color plane
// - H3 its husk speed is above 0 and below 1 (it moves, slower than a husk axis stream)
// PASS only if every instrument and H1, H2, H3 hold on one weave.
//
// Depth L2: exact runs of constructed rules, classified by exact recurrence, with a knit that breaks the
// symmetry as the control.

import { experiment } from '@/test/scaffold/suite'
import { verdict } from '@/test/scaffold/verdict'
import { makeDifferenceEngine } from '@/code/compute/difference-engine'
import { boxRun } from '@/code/compute/knit-reference'
import { turningWeave, type Collision } from '@/code/rule/collision'
import { colorTriality, trialityWeave, trialityWeaveLayout, TRIALITY_WEAVE_PERIOD } from '@/code/rule/triality-weave'
import { alignedLayout, copyLayout } from '@/code/measure/generation-copies'
import { a2Planes, KIND_ORDER, OPPOSITE, ROOTS, TRIPLES, tripleDock } from '@/code/measure/rishon-triples'
import { followSeed, vacuumPeriod, type Fate } from '@/code/measure/triple-fate'
import { d4BoxCell } from '@/code/substrate/d4-box'

const PERIODS = 8
const CAP = 1500
const BOX_SIDE = 5
const BOX_BEATS = 48
const VACUUM_LIMIT = 2400
const COMMITTED_SCHEDULE = 24
const KNOTS = ['love-love-love', 'fear-fear-fear']

type Knit = { name: string; forward: (t: number) => Collision; schedule: number }

const fateKey = (f: Fate): string => `${f.cls}|${f.bulkSpeed}|${f.docks.join(',')}`

function boxExactness(forward: (t: number) => Collision, seeds: readonly Int8Array[]): number {
  let mismatches = 0

  for (const seed of seeds) {
    const dense = boxRun({ forward, side: BOX_SIDE, seed: { name: 'triple', docks: [{ coords: [0, 0, 0, 0], state: seed }] }, center: [0, 0, 0, 0] })
    const engine = makeDifferenceEngine({ forward, side: BOX_SIDE })

    engine.set([0, 0, 0, 0], seed)

    for (let t = 0; t < BOX_BEATS; t++) {
      dense.step()
      engine.step()

      const vacuum = engine.vacuum(engine.beat())
      const out = new Int8Array(BOX_SIDE ** 4 * 24)

      for (let i = 0; i < out.length; i++) {
        out[i] = vacuum[i % 24] ?? 0
      }

      engine.forEach((c, s) => out.set(s, d4BoxCell({ coordinates: c, side: BOX_SIDE }) * 24))

      const data = dense.data()

      for (let i = 0; i < out.length; i++) {
        mismatches += out[i] === data[i] ? 0 : 1
      }
    }
  }

  return mismatches
}

const camel = (kind: string): string => kind.replace(/-(\w)/g, (_, c: string) => c.toUpperCase())

export default experiment({
  id: 'spin/triality-knot-binding',
  code: 'E-SPN-0052',
  title:
    'does a knot bind when triality is kept: every triple on every zero-sum triangle, and the unmixed triples on the color plane\'s copies, followed exactly on the unbounded bulk lattice under the triality weave, its aligned form and the committed knit, asking whether three loves (love minus fear 3, one whole charge) travel as one object, read in the bulk and on the husk',
  category: 'spin',
  substrates: ['3434'],
  depth: 'L2',
  paper: false,
  run() {
    const opposite = [...OPPOSITE]
    const triality = colorTriality({ opposite })
    const layout = trialityWeaveLayout({ opposite, triality })
    const aligned = alignedLayout({ layout, copies: copyLayout({ roots: ROOTS, opposite, triality }) })
    const knits: Knit[] = [
      { name: 'triality', forward: trialityWeave({ layout }), schedule: TRIALITY_WEAVE_PERIOD },
      { name: 'aligned', forward: trialityWeave({ layout: aligned }), schedule: TRIALITY_WEAVE_PERIOD },
      { name: 'committed', forward: turningWeave({ opposite }), schedule: COMMITTED_SCHEDULE },
    ]
    const periods = knits.map(k => vacuumPeriod({ forward: k.forward, schedule: k.schedule, limit: VACUUM_LIMIT }))
    const planes = a2Planes()
    const fixed = new Set(triality.map((image, d) => (image === d ? d : -1)).filter(d => d >= 0))
    const colorPlane = planes.findIndex(p => p.triangle.every(d => fixed.has(d)))
    const triangles = planes.flatMap((p, pi) => [
      { plane: pi, directions: p.triangle },
      { plane: pi, directions: p.anti },
    ])
    const color = planes[colorPlane]

    // instruments
    const i1 = knits.slice(0, 2).map(k => boxExactness(k.forward, color ? TRIPLES.map(t => tripleDock(color.triangle, t.vibes)) : []))

    type Row = { knit: string; triangle: number; plane: number; triple: number; fate: Fate }
    const rows: Row[] = []

    knits.forEach((k, ki) => {
      const period = periods[ki] ?? k.schedule

      triangles.forEach((t, ti) => {
        // the committed knit is the control, run on the color plane only: it dresses to the cap at seconds a
        // seed (timing probe), and E-FRC-0171 already ran it on all 32 triangles
        if (k.name === 'committed' && t.plane !== colorPlane) {
          return
        }

        TRIPLES.forEach((x, xi) => {
          rows.push({ knit: k.name, triangle: ti, plane: t.plane, triple: xi, fate: followSeed({ forward: k.forward, state: tripleDock(t.directions, x.vibes), period, periods: PERIODS, cap: CAP }) })
        })
      })
    })

    type CopyRow = { knit: string; triplet: boolean; copy: number; triple: number; fate: Fate }
    const copyRows: CopyRow[] = []
    const unmixed = TRIPLES.map((x, i) => ({ x, i })).filter(({ x }) => (x.loves === 0 || x.fears === 0) && x.kind !== 'calm-calm-calm')

    knits.forEach((k, ki) => {
      const period = periods[ki] ?? k.schedule

      if (!color) {
        return
      }

      ;[...color.triplets.map(c => ({ c, triplet: true })), ...color.antitriplets.map(c => ({ c, triplet: false }))].forEach(({ c, triplet }, ci) => {
        for (const { x, i } of unmixed) {
          copyRows.push({ knit: k.name, triplet, copy: ci % 3, triple: i, fate: followSeed({ forward: k.forward, state: tripleDock(c, x.vibes), period, periods: PERIODS, cap: CAP }) })
        }
      })
    })

    const metrics: Record<string, number> = {
      colorPlane,
      i1TrialityBoxMismatches: i1[0] ?? -1,
      i1AlignedBoxMismatches: i1[1] ?? -1,
      ...Object.fromEntries(knits.map((k, ki) => [`${k.name}RecurrencePeriod`, periods[ki] ?? -1])),
    }
    const control: Record<string, number> = {}
    const table: string[] = []
    let i2 = true
    const generation: Record<string, { alike: number; cases: number }> = {}

    for (const k of knits) {
      const mine = rows.filter(r => r.knit === k.name)

      for (const kind of KIND_ORDER) {
        const list = mine.filter(r => TRIPLES[r.triple]?.kind === kind)
        const count = (cls: string): number => list.filter(r => r.fate.cls === cls).length
        const particles = list.filter(r => r.fate.cls === 'particle')
        const name = `${k.name}_${camel(kind)}`

        for (const cls of ['particle', 'bound', 'split', 'dressing', 'gone', 'vacuum']) {
          metrics[`${name}_${cls}`] = count(cls)
        }

        if (particles.length > 0) {
          metrics[`${name}_particleSlotsMax`] = Math.max(...particles.map(r => r.fate.slots))
          metrics[`${name}_huskSpeedMax`] = Math.max(...particles.map(r => r.fate.huskSpeed))
          metrics[`${name}_huskSpeedMin`] = Math.min(...particles.map(r => r.fate.huskSpeed))
          metrics[`${name}_bulkSpeedMax`] = Math.max(...particles.map(r => r.fate.bulkSpeed))
          metrics[`${name}_twoSlotParticles`] = particles.filter(r => r.fate.slots >= 2).length
          metrics[`${name}_twoSlotBulkSpeedMax`] = Math.max(0, ...particles.filter(r => r.fate.slots >= 2).map(r => r.fate.bulkSpeed))
        }

        if (kind === 'calm-calm-calm') {
          i2 = i2 && count('vacuum') === list.length
        }

        table.push(`${k.name} ${kind}: particle ${count('particle')}, bound ${count('bound')}, split ${count('split')}, dressing ${count('dressing')}, gone ${count('gone')}, vacuum ${count('vacuum')} of ${list.length}`)
      }

      // generation degeneracy on the color plane's copies
      const copies = copyRows.filter(r => r.knit === k.name)
      let alike = 0
      let cases = 0

      for (const { i } of unmixed) {
        for (const triplet of [true, false]) {
          const keys = new Set(copies.filter(r => r.triple === i && r.triplet === triplet).map(r => fateKey(r.fate)))

          cases += 1
          alike += keys.size === 1 ? 1 : 0
        }
      }

      generation[k.name] = { alike, cases }
      metrics[`${k.name}_copiesAlike`] = alike
      metrics[`${k.name}_copyCases`] = cases
    }

    const i3 =
      (generation.triality?.alike ?? -1) === (generation.triality?.cases ?? 0) &&
      (generation.aligned?.alike ?? -1) === (generation.aligned?.cases ?? 0) &&
      (generation.committed?.alike ?? 0) < (generation.committed?.cases ?? 0)

    // the hypothesis, weave by weave
    const hypothesis = knits.slice(0, 2).map(k => {
      const knots = rows.filter(r => r.knit === k.name && KNOTS.includes(TRIPLES[r.triple]?.kind ?? ''))
      const carriers = knots.filter(r => r.fate.cls === 'particle' && r.fate.slots >= 2)
      const onColor = knots.filter(r => r.plane === colorPlane)
      const h1 = carriers.length > 0
      const h2 = h1 && KNOTS.some(kind => onColor.filter(r => TRIPLES[r.triple]?.kind === kind).every(r => r.fate.cls === 'particle' && r.fate.slots >= 2))
      const h3 = h1 && carriers.some(r => r.fate.huskSpeed > 0 && r.fate.huskSpeed < 1)

      metrics[`${k.name}_H1_knotCarriers`] = carriers.length
      metrics[`${k.name}_H2_knotOnColorPlane`] = h2 ? 1 : 0
      metrics[`${k.name}_H3_movesBelowHuskAxisSpeed`] = h3 ? 1 : 0
      metrics[`${k.name}_colorPlaneKnotParticles`] = onColor.filter(r => r.fate.cls === 'particle').length
      metrics[`${k.name}_colorPlaneKnotRuns`] = onColor.length

      return { h1, h2, h3 }
    })

    const committedKnots = rows.filter(r => r.knit === 'committed' && KNOTS.includes(TRIPLES[r.triple]?.kind ?? ''))

    control.committedKnotCarriers = committedKnots.filter(r => r.fate.cls === 'particle' && r.fate.slots >= 2).length
    control.committedCopiesAlike = generation.committed?.alike ?? -1
    control.committedCopyCases = generation.committed?.cases ?? -1

    const instruments = (i1[0] ?? 1) === 0 && (i1[1] ?? 1) === 0 && i2 && i3
    const physics = hypothesis.some(h => h.h1 && h.h2 && h.h3)
    const ok = instruments && physics

    metrics.i2CalmCalmCalmIsVacuum = i2 ? 1 : 0
    metrics.i3CopySymmetry = i3 ? 1 : 0

    return verdict({
      status: ok ? 'pass' : 'fail',
      claim: `instruments ${instruments ? 'exact' : 'NOT exact'} (box ${i1.join(' and ')} mismatches, calm-calm-calm the vacuum ${i2 ? 'everywhere' : 'not everywhere'}, copies alike ${generation.triality?.alike}/${generation.triality?.cases} and ${generation.aligned?.alike}/${generation.aligned?.cases} under the triality weaves against ${generation.committed?.alike}/${generation.committed?.cases} committed); knots of three that travel as one object: ${knits.slice(0, 2).map((k, i) => `${k.name} ${metrics[`${k.name}_H1_knotCarriers`]} of ${rows.filter(r => r.knit === k.name && KNOTS.includes(TRIPLES[r.triple]?.kind ?? '')).length}${hypothesis[i]?.h2 ? ', every color-plane knot' : ''}`).join(', ')}, committed ${control.committedKnotCarriers}`,
      metrics,
      control,
      notes: `L2, exact, bulk substrate with the husk read by column. Recurrence periods measured as the least multiple of the schedule at which the vacuum returns: ${knits.map((k, i) => `${k.name} ${periods[i]}`).join(', ')}. A particle with 1 slot is a lone vibe. Per knit and kind over the 32 triangles: ${table.join('. ')}. First run: every gate as fixed and the same status and counts; the bulk speed and the two-slot particle metrics were added after it as reported numbers and rerun. They show that every recurring object of two slots sits still (bulk and husk speed 0), so the only movers are lone vibes.`,
    })
  },
})
