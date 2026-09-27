// Triples on a triangle, the dynamics. E-FRC-0170 measured the algebra of the hypothesis that a fermion is
// three vibes, one on each line of a zero-sum triangle (the Harari-Shupe rishon table with love = T,
// calm = V, fear = anti-T). This runs every triple and asks whether it behaves as one particle.
//
// Knits, imported and not edited:
// - committed: the turning weave (code/rule/collision), run by the difference engine (E-CMP-0015)
// - combined: the combined knit of E-FRC-0158 with COMBINED_DEFAULT (head-on turn base, scatter block, no
//   fold, no steering: the dock collision a difference engine can run), by the difference engine
// - cold: the cold weave of E-FLD-0032 (head-on turn base, matched scattering, the kinetic threshold), on
//   its cold vacuum, run by code/compute/cold-difference-engine, every store and counter 0 at the start
// All on the unbounded D4 lattice: the bulk substrate, not the three-dimensional husk.
//
// Seeds, each one dock at the origin at beat 0:
// - ON THE TRIANGLE: all 27 triples on each of the 32 zero-sum triangles (16 A2 planes, triangle and
//   antitriangle, which sit on the same three lines), the k-th vibe on the triangle's k-th direction
// - ON THE COPIES (the generation question): the 14 non-empty unmixed triples (love and fear not mixed)
//   on each of the 3 triplet and 3 antitriplet copies of every plane (E-FRC-0106), the k-th vibe on the
//   copy direction that leans toward the triangle's k-th direction
//
// Each seed runs for 8 periods (192 beats) or until 1,500 docks differ from the vacuum. At beat 0 and at
// the end of every period the difference's signature up to a shift is recorded; a repeat is an exact
// recurrence, which (the rule and the vacuum repeat with the period) is a particle forever, with speed
// |shift| / beats / sqrt 2 (1 is a vibe streaming, the light speed of the lattice). Otherwise the run is
// classified at its end: DRESSING (the cap is hit, or the support at period 8 is over 1.5 times that at
// period 4 and over 16 docks), SPLIT (bounded, in two or more pieces), BOUND (bounded, one piece, no
// exact recurrence yet), or GONE (nothing differs).
//
// Degeneracies measured: COLOR, the three arrangements of a colored kind on one triangle give the same
// outcome (class, speed and support in every period); GENERATION, the three triplet copies of a plane give
// the same outcome for the same triple and arrangement; and the 32 placements of one triple.
//
// Gates fixed before the run.
// Instruments (must hold, or the numbers mean nothing):
// - I1 the cold difference engine equals coldBeat on the side-7 box, every vibe, store and counter at
//   every beat for 48 beats, for all 27 triples on one triangle and one copy
// - I2 the difference engine in box mode equals the dense lattice gas (knit-reference boxRun) for all 27
//   triples on one triangle, side 5, 48 beats, both knits
// - I3 calm-calm-calm differs from the vacuum nowhere at any beat on every knit (it IS the vacuum)
// Physics (the hypothesis's predictions; each reported pass or fail):
// - P1 fear-fear-fear travels as one object (exact recurrence) on every triangle, on at least one knit
// - P2 on that knit it is light: speed 1
// - P3 on that knit every colored unmixed kind (love-love-calm, love-calm-calm, calm-calm-fear,
//   calm-fear-fear) travels as one object on every triangle, in all three arrangements
// - P4 on that knit the three arrangements are degenerate (the colors alike) on every triangle
// The result is PASS only if every instrument and physics gate holds.
//
// Depth L2: exact runs of constructed rules, classified by exact recurrence.

import { experiment } from '@/test/scaffold/suite'
import { verdict } from '@/test/scaffold/verdict'
import { DifferenceOverflow, makeDifferenceEngine, ROOT_STEPS } from '@/code/compute/difference-engine'
import { ColdOverflow, makeColdDifferenceEngine } from '@/code/compute/cold-difference-engine'
import { boxRun, knitForward, type KnitName } from '@/code/compute/knit-reference'
import { a2Planes, coldSpec, KIND_ORDER, TRIPLES, tripleDock } from '@/code/measure/rishon-triples'
import { coldBeat, makeColdWeave, type ColdState, type ColdWeave } from '@/code/rule/cold-weave'
import { d4BoxCell, d4BoxMesh, d4Vector } from '@/code/substrate/d4-box'

const PERIOD = 24
const PERIODS = 8
const CAP = 1500
const SIGNATURE_LIMIT = 1500

type Knit = KnitName | 'cold'

const KNITS: readonly Knit[] = ['committed', 'combined', 'cold']

type Runner = {
  readonly step: () => void
  readonly support: () => { docks: number; slots: number }
  readonly signature: () => { key: string; anchor: number[] }
  readonly coords: () => number[][]
  readonly beat: () => number
}

type Outcome = {
  readonly cls: 'particle' | 'split' | 'bound' | 'dressing' | 'gone' | 'vacuum'
  readonly speed: number
  readonly recurEvery: number
  readonly docks: number[]
  readonly slots: number
  readonly pieces: number
  readonly everDiffered: boolean
}

let COLD_WEAVE: ColdWeave | undefined

const coldWeave = (): ColdWeave => (COLD_WEAVE ??= makeColdWeave({ mesh: d4BoxMesh({ side: 3 }), spec: coldSpec() }))

function runner(knit: Knit, state: Int8Array): Runner {
  if (knit === 'cold') {
    const engine = makeColdDifferenceEngine({ weave: coldWeave(), maxDocks: CAP })

    engine.set([0, 0, 0, 0], { vibe: state, store: new Int32Array(24), demon: new Int32Array(12) })

    return {
      step: engine.step,
      support: engine.support,
      signature: engine.signature,
      coords: () => {
        const out: number[][] = []

        engine.forEach(c => out.push([...c]))

        return out
      },
      beat: engine.beat,
    }
  }

  const engine = makeDifferenceEngine({ forward: knitForward(knit), maxDocks: CAP })

  engine.set([0, 0, 0, 0], state)

  return {
    step: engine.step,
    support: engine.support,
    signature: engine.signature,
    coords: () => {
      const out: number[][] = []

      engine.forEach(c => out.push([...c]))

      return out
    },
    beat: engine.beat,
  }
}

// connected pieces of a set of docks, two docks joined when one root apart
function pieces(coords: number[][]): number {
  const key = (c: readonly number[]): string => c.join(',')
  const left = new Set(coords.map(key))
  let count = 0

  for (const c of coords) {
    if (!left.has(key(c))) {
      continue
    }

    count += 1
    left.delete(key(c))

    const stack = [c]

    while (stack.length > 0) {
      const x = stack.pop() ?? []

      for (const s of ROOT_STEPS) {
        const y = x.map((v, i) => v + (s[i] ?? 0))

        if (left.has(key(y))) {
          left.delete(key(y))
          stack.push(y)
        }
      }
    }
  }

  return count
}

function follow(knit: Knit, state: Int8Array): Outcome {
  const r = runner(knit, state)
  const seen = new Map<string, { beat: number; anchor: number[] }>()
  const docks: number[] = []
  // slots, not docks: an engine stores a seeded dock even when it equals the vacuum
  let everDiffered = r.support().slots > 0

  const record = (): Outcome | undefined => {
    const s = r.support()

    if (s.docks === 0 || s.docks > SIGNATURE_LIMIT) {
      return undefined
    }

    const sig = r.signature()
    const before = seen.get(sig.key)

    if (before) {
      const beats = r.beat() - before.beat
      const shift = sig.anchor.map((x, k) => x - (before.anchor[k] ?? 0))
      const speed = Math.hypot(...d4Vector(shift)) / beats / Math.SQRT2

      return { cls: 'particle', speed: Number(speed.toFixed(6)), recurEvery: beats, docks, slots: s.slots, pieces: pieces(r.coords()), everDiffered }
    }

    seen.set(sig.key, { beat: r.beat(), anchor: sig.anchor })

    return undefined
  }

  const statePieces = state.some(x => x !== 0)

  if (statePieces) {
    record()
  }

  try {
    for (let p = 0; p < PERIODS; p++) {
      for (let t = 0; t < PERIOD; t++) {
        r.step()
        everDiffered = everDiffered || r.support().slots > 0
      }

      docks.push(r.support().docks)

      const found = record()

      if (found) {
        return found
      }
    }
  } catch (error) {
    if (!(error instanceof DifferenceOverflow) && !(error instanceof ColdOverflow)) {
      throw error
    }

    return { cls: 'dressing', speed: -1, recurEvery: -1, docks, slots: -1, pieces: -1, everDiffered: true }
  }

  const s = r.support()

  if (!everDiffered) {
    return { cls: 'vacuum', speed: -1, recurEvery: -1, docks, slots: 0, pieces: 0, everDiffered }
  }

  if (s.docks === 0) {
    return { cls: 'gone', speed: -1, recurEvery: -1, docks, slots: 0, pieces: 0, everDiffered }
  }

  const last = docks[PERIODS - 1] ?? 0
  const middle = docks[PERIODS / 2 - 1] ?? 0
  const count = pieces(r.coords())

  if (last > 16 && last > 1.5 * middle) {
    return { cls: 'dressing', speed: -1, recurEvery: -1, docks, slots: s.slots, pieces: count, everDiffered }
  }

  return { cls: count >= 2 ? 'split' : 'bound', speed: -1, recurEvery: -1, docks, slots: s.slots, pieces: count, everDiffered }
}

const outcomeKey = (o: Outcome): string => `${o.cls}|${o.speed}|${o.docks.join(',')}`

// I1: the cold engine against coldBeat on a box
function coldExactness(seeds: Int8Array[]): number {
  const side = 7
  const mesh = d4BoxMesh({ side })
  const weave = makeColdWeave({ mesh, spec: coldSpec() })
  const center = [3, 3, 3, 3]
  const cell = d4BoxCell({ coordinates: center, side })
  let mismatches = 0

  for (const seed of seeds) {
    let dense: ColdState = { vibe: new Int8Array(mesh.cellCount * 24), store: new Int32Array(mesh.cellCount * 24), demon: new Int32Array(mesh.cellCount * 12) }

    dense.vibe.set(seed, cell * 24)

    const engine = makeColdDifferenceEngine({ weave: coldWeave(), side })

    engine.set(center, { vibe: seed, store: new Int32Array(24), demon: new Int32Array(12) })

    for (let t = 0; t < 48; t++) {
      dense = coldBeat(weave, dense, t)
      engine.step()

      const vibe = new Int8Array(dense.vibe.length)
      const store = new Int32Array(dense.store.length)
      const demon = new Int32Array(dense.demon.length)

      engine.forEach((c, d) => {
        const x = d4BoxCell({ coordinates: c, side })

        vibe.set(d.vibe, x * 24)
        store.set(d.store, x * 24)
        demon.set(d.demon, x * 12)
      })

      for (let i = 0; i < vibe.length; i++) {
        mismatches += vibe[i] === dense.vibe[i] && store[i] === dense.store[i] ? 0 : 1
      }

      for (let i = 0; i < demon.length; i++) {
        mismatches += demon[i] === dense.demon[i] ? 0 : 1
      }
    }
  }

  return mismatches
}

// I2: the difference engine in box mode against the dense lattice gas
function boxExactness(knit: KnitName, seeds: Int8Array[]): number {
  const side = 5
  let mismatches = 0

  for (const seed of seeds) {
    const forward = knitForward(knit)
    const dense = boxRun({ forward, side, seed: { name: 'triple', docks: [{ coords: [0, 0, 0, 0], state: seed }] }, center: [0, 0, 0, 0] })
    const engine = makeDifferenceEngine({ forward, side })

    engine.set([0, 0, 0, 0], seed)

    for (let t = 0; t < 48; t++) {
      dense.step()
      engine.step()

      const vac = engine.vacuum(engine.beat())
      const out = new Int8Array(side ** 4 * 24)

      for (let i = 0; i < out.length; i++) {
        out[i] = vac[i % 24] ?? 0
      }

      engine.forEach((c, s) => out.set(s, d4BoxCell({ coordinates: c, side }) * 24))

      const data = dense.data()

      for (let i = 0; i < out.length; i++) {
        mismatches += out[i] === data[i] ? 0 : 1
      }
    }
  }

  return mismatches
}

const COLORED = ['love-love-calm', 'love-calm-calm', 'calm-calm-fear', 'calm-fear-fear']
const camel = (kind: string): string => kind.replace(/-(\w)/g, (_, c: string) => c.toUpperCase())

export default experiment({
  id: 'gauge/rishon-dynamics',
  code: 'E-FRC-0171',
  title:
    'triples on a triangle, the dynamics: every one of the 27 triples on all 32 zero-sum triangles, and the unmixed triples on the three triplet and antitriplet copies, followed exactly on the unbounded bulk lattice under the committed knit, the combined knit and the cold weave, asking whether a triple travels as one particle, whether fear-fear-fear is light, whether the three arrangements are degenerate colors and whether the three copies split',
  category: 'gauge',
  substrates: ['3434'],
  depth: 'L2',
  paper: false,
  run() {
    const planes = a2Planes()
    const triangles = planes.flatMap(p => [p.triangle, p.anti])
    const plane0 = planes[0]!

    // instruments
    const i1 = coldExactness([...TRIPLES.map(t => tripleDock(plane0.triangle, t.vibes)), ...TRIPLES.map(t => tripleDock(plane0.triplets[0]!, t.vibes))])
    const i2 = Object.fromEntries((['committed', 'combined'] as KnitName[]).map(k => [k, boxExactness(k, TRIPLES.map(t => tripleDock(plane0.triangle, t.vibes)))]))

    // the triangle runs
    type Row = { knit: Knit; triangle: number; triple: number; outcome: Outcome }
    const rows: Row[] = []

    for (const knit of KNITS) {
      triangles.forEach((t, ti) => {
        TRIPLES.forEach((x, xi) => {
          rows.push({ knit, triangle: ti, triple: xi, outcome: follow(knit, tripleDock(t, x.vibes)) })
        })
      })
    }

    // the copy runs: unmixed, non-empty triples on every copy
    type CopyRow = { knit: Knit; plane: number; copy: number; triplet: boolean; triple: number; outcome: Outcome }
    const copyRows: CopyRow[] = []
    const unmixed = TRIPLES.map((x, i) => ({ x, i })).filter(({ x }) => (x.loves === 0 || x.fears === 0) && x.kind !== 'calm-calm-calm')

    for (const knit of KNITS) {
      planes.forEach((p, pi) => {
        ;[...p.triplets.map(c => ({ c, triplet: true })), ...p.antitriplets.map(c => ({ c, triplet: false }))].forEach(({ c, triplet }, ci) => {
          for (const { x, i } of unmixed) {
            copyRows.push({ knit, plane: pi, copy: ci % 3, triplet, triple: i, outcome: follow(knit, tripleDock(c, x.vibes)) })
          }
        })
      })
    }

    const metrics: Record<string, number> = {
      i1ColdEngineMismatches: i1,
      i2CommittedBoxMismatches: i2.committed ?? -1,
      i2CombinedBoxMismatches: i2.combined ?? -1,
      triangleRuns: rows.length,
      copyRuns: copyRows.length,
    }
    const control: Record<string, number> = {}
    const table: string[] = []

    let i3 = true

    for (const knit of KNITS) {
      const mine = rows.filter(r => r.knit === knit)

      for (const kind of KIND_ORDER) {
        const list = mine.filter(r => TRIPLES[r.triple]?.kind === kind)
        const count = (cls: string): number => list.filter(r => r.outcome.cls === cls).length
        const speeds = [...new Set(list.filter(r => r.outcome.cls === 'particle').map(r => r.outcome.speed))].sort((a, b) => a - b)
        const name = `${knit}_${camel(kind)}`

        metrics[`${name}_particle`] = count('particle')
        metrics[`${name}_split`] = count('split')
        metrics[`${name}_bound`] = count('bound')
        metrics[`${name}_dressing`] = count('dressing')
        metrics[`${name}_gone`] = count('gone')
        metrics[`${name}_vacuum`] = count('vacuum')
        metrics[`${name}_runs`] = list.length

        if (speeds.length > 0) {
          const particles = list.filter(r => r.outcome.cls === 'particle')

          metrics[`${name}_speedMin`] = speeds[0] ?? -1
          metrics[`${name}_speedMax`] = speeds[speeds.length - 1] ?? -1
          metrics[`${name}_lightParticles`] = particles.filter(r => Math.abs(r.outcome.speed - 1) < 1e-9).length
          metrics[`${name}_particleSlotsMax`] = Math.max(...particles.map(r => r.outcome.slots))
          metrics[`${name}_particleSlotsMin`] = Math.min(...particles.map(r => r.outcome.slots))
          metrics[`${name}_particleRecurEveryMax`] = Math.max(...particles.map(r => r.outcome.recurEvery))
        }

        metrics[`${name}_splitPiecesMax`] = Math.max(0, ...list.filter(r => r.outcome.cls === 'split').map(r => r.outcome.pieces))

        const outcomes = new Set(list.map(r => outcomeKey(r.outcome))).size

        control[`${name}_distinctOutcomes`] = outcomes
        table.push(
          `${knit} ${kind}: particle ${count('particle')}, split ${count('split')}, bound ${count('bound')}, dressing ${count('dressing')}, gone ${count('gone')}, vacuum ${count('vacuum')} of ${list.length}${speeds.length ? `, speeds ${speeds.join('/')}` : ''}`,
        )

        if (kind === 'calm-calm-calm') {
          i3 = i3 && count('vacuum') === list.length
        }
      }

      // color degeneracy: per triangle and colored kind, are the three arrangements' outcomes one?
      let alike = 0
      let cases = 0

      for (let ti = 0; ti < triangles.length; ti++) {
        for (const kind of COLORED) {
          const keys = new Set(mine.filter(r => r.triangle === ti && TRIPLES[r.triple]?.kind === kind).map(r => outcomeKey(r.outcome)))

          cases += 1
          alike += keys.size === 1 ? 1 : 0
        }
      }

      metrics[`${knit}_colorDegenerateCases`] = alike
      metrics[`${knit}_colorCases`] = cases

      // generation: per plane, triple and chirality, are the three copies' outcomes one?
      const copies = copyRows.filter(r => r.knit === knit)
      let genAlike = 0
      let genAllDifferent = 0
      let genCases = 0

      for (let pi = 0; pi < planes.length; pi++) {
        for (const { i } of unmixed) {
          for (const triplet of [true, false]) {
            const keys = new Set(copies.filter(r => r.plane === pi && r.triple === i && r.triplet === triplet).map(r => outcomeKey(r.outcome)))

            genCases += 1
            genAlike += keys.size === 1 ? 1 : 0
            genAllDifferent += keys.size === 3 ? 1 : 0
          }
        }
      }

      metrics[`${knit}_generationDegenerateCases`] = genAlike
      metrics[`${knit}_generationAllSplitCases`] = genAllDifferent
      metrics[`${knit}_generationCases`] = genCases

      for (const kind of KIND_ORDER.filter(k => !k.includes('love') || !k.includes('fear'))) {
        const list = copies.filter(r => TRIPLES[r.triple]?.kind === kind)

        if (list.length === 0) continue

        const count = (cls: string): number => list.filter(r => r.outcome.cls === cls).length
        const speeds = [...new Set(list.filter(r => r.outcome.cls === 'particle').map(r => r.outcome.speed))].sort((a, b) => a - b)

        control[`${knit}_copy_${camel(kind)}_particle`] = count('particle')
        control[`${knit}_copy_${camel(kind)}_split`] = count('split')
        control[`${knit}_copy_${camel(kind)}_dressing`] = count('dressing')
        control[`${knit}_copy_${camel(kind)}_runs`] = list.length
        table.push(
          `${knit} on copies ${kind}: particle ${count('particle')}, split ${count('split')}, bound ${count('bound')}, dressing ${count('dressing')} of ${list.length}${speeds.length ? `, speeds ${speeds.join('/')}` : ''}`,
        )
      }
    }

    // physics gates, knit by knit
    const gates = KNITS.map(knit => {
      const mine = rows.filter(r => r.knit === knit)
      const of = (kind: string) => mine.filter(r => TRIPLES[r.triple]?.kind === kind)
      const fff = of('fear-fear-fear')
      const p1 = fff.every(r => r.outcome.cls === 'particle')
      const p2 = p1 && fff.every(r => Math.abs(r.outcome.speed - 1) < 1e-9)
      const p3 = COLORED.every(k => of(k).every(r => r.outcome.cls === 'particle'))
      const p4 = (metrics[`${knit}_colorDegenerateCases`] ?? 0) === (metrics[`${knit}_colorCases`] ?? -1)

      return { knit, p1, p2, p3, p4 }
    })

    gates.forEach(g => {
      metrics[`${g.knit}_P1_fearFearFearParticleEverywhere`] = g.p1 ? 1 : 0
      metrics[`${g.knit}_P2_fearFearFearLight`] = g.p2 ? 1 : 0
      metrics[`${g.knit}_P3_coloredParticlesEverywhere`] = g.p3 ? 1 : 0
      metrics[`${g.knit}_P4_colorsDegenerate`] = g.p4 ? 1 : 0
    })

    const physics = gates.some(g => g.p1 && g.p2 && g.p3 && g.p4)
    const instruments = i1 === 0 && (i2.committed ?? 1) === 0 && (i2.combined ?? 1) === 0 && i3
    const ok = instruments && physics

    metrics.i3CalmCalmCalmIsVacuum = i3 ? 1 : 0
    metrics.physicsGatesHeldOnSomeKnit = physics ? 1 : 0

    return verdict({
      status: ok ? 'pass' : 'fail',
      claim: `instruments ${instruments ? 'exact' : 'NOT exact'} (cold engine ${i1} mismatches, box mode ${i2.committed} and ${i2.combined}, calm-calm-calm the vacuum ${i3 ? 'everywhere' : 'not everywhere'}); ${gates.map(g => `${g.knit}: fear-fear-fear a particle on every triangle ${g.p1 ? 'yes' : 'no'}, light ${g.p2 ? 'yes' : 'no'}, colored kinds particles ${g.p3 ? 'yes' : 'no'}, colors degenerate ${g.p4 ? 'yes' : 'no'}`).join('; ')}`,
      metrics,
      control,
      notes: `L2, exact, bulk substrate (the unbounded D4 lattice), not the husk. Disclosed: the first run failed I3 because "ever differed" was read from the engine's stored docks, and an engine stores a seeded dock even when it equals the vacuum, so calm-calm-calm read as "gone"; it is now read from differing slots, the only change before this run. A particle with 1 slot is a lone vibe: the one-vibe triples (love-calm-calm, calm-calm-fear) are lone vibes, and they are the only triples that recur. Per knit and kind over the 32 triangles and every arrangement: ${table.join('. ')}.`,
    })
  },
})
