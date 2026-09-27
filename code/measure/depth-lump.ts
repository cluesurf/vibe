// "Mass is depth": does a neutral lump held in the depth of the bulk delay or bend a husk light front passing through or
// beside its columns (E-GRV-0062, E-GRV-0063)? A pure reading of rules that already exist: nothing here changes a rule.
//
// THE LIGHT. The trit light of code/rule/trit-column (wave form), exactly the rule and placement of E-GRV-0059 and
// E-FRC-0241, at side 16 and depth D = 4: every husk integer (angle, potential, the three counters) is a column sum of
// bulk trits, and each husk value's front is carried down its bulk column in the thermometer code.
//
// THE LUMP. Bulk vibes placed at levels of their husk columns with code/measure/husk-coulomb placeStrung, each strung
// along +4 y, +4 z at its own level to a partner of the opposite sign, as in E-GRV-0059 (Gauss's law then holds on every
// beat). Content N is the number of lump vibes (partners not counted):
//   neutral N   N = 2: +1 on level 0, -1 on level 1 of column (0, 0, 0). N = 4: +1 on levels 0, 1 and -1 on levels 2, 3
//               of (0, 0, 0). N = 12: the N = 4 column at each of (-1, 0, 0), (0, 0, 0), (1, 0, 0). Every column sum is
//               zero (the lump, its partners and its strings), so the husk cannot see it at the start
//   split N     the SAME entries with every -1 moved to the column one step down in z (x, 0, -1), same level: the same
//               vibes, total charge zero, but every lump column's sum is NOT zero (a husk dipole). The control that
//               separates a depth effect from ordinary charge
//   flipped     either lump with every sign negated
//   empty       no lump
// WHO HOLDS IT: the rule. The trit light never reads or writes a vibe (it reads the strings through column sums), so
// the lump stays where it is placed with no reflecting surface; checked at the end of every run. This is not binding:
// the light moves no matter, and on the rules that do move matter nothing keeps a depth lump (the hop gas moves it,
// E-FRC-0210, and on the adopted knit every one of the 24 roots casts a nonzero husk step, so no vibe stays in its
// column one beat: `KNIT_COLUMN_ROOTS` counts the roots with zero husk step).
//
// THE FRONT. A twin run: the base holds the lump (or nothing); the twin also has the angle column of the +x husk link of
// SOURCE = (-3, b, 0) raised by PULSE = 7 at the start (a one-column change of the light, the husk light's analogue of
// E-GRV-0058's one-slot twin; 7 is the largest value inside the axis window of 4D = 16, and the disclosed probe showed
// smaller kicks of 1, 5 and 6 stay held in the counters for 30 beats or more). The twin difference is twin minus base,
// read on the husk (every husk integer). ARRIVAL: the first beat at which any of the 9 out-links of the DETECTOR dock
// (3, b, 0) differs between twin and base (BEATS + 1 when never). FAR: per beat the largest x offset from the source
// among husk links that differ. MISMATCH: per beat the number of husk entries (angles, potentials, counters) at which a
// lump's twin difference differs from the empty's. DEFLECTION: the y centroid of the twin difference's angle weight
// (sum of |twin - base| over each dock's 9 out-links) over the docks past the lump (min-image x > 0), at the empty's
// arrival beat for that b, lump minus empty (negative: toward the lump at y = 0 when b > 0).
//
// THE CLOSURE, checked on every run: the husk integer rule (huskLightBeat) run on the husk read at the start equals the
// husk read off the trit rule at every beat, every field. With the lump's column sums zero at the start this makes the
// neutral lump's invisibility a theorem, and the files check it rather than assume it.
//
// NO ROUNDING in the rule: trits and integers only. Reals only in the centroid reader. DETERMINISM: every configuration
// is placed; nothing is drawn.

import { rootsD4 } from '@/code/algebra/group/root-system'
import {
  bulkFlux,
  bulkGaussViolations,
  columnSumLinks,
  columnValue,
  copyTritState,
  emptyTritState,
  huskGaussViolations,
  huskLightBeat,
  makeTritLight,
  readHusk,
  tritLightBeat,
  writeColumn,
  type HuskLightState,
  type TritLight,
  type TritState,
} from '@/code/rule/trit-column'
import { dockOfColumn, placeStrung } from '@/code/measure/husk-coulomb'

export const SIDE = 16
export const DEPTH = 4
export const BEATS = 36
export const PULSE = 7
export const REACH = 3
export const IMPACTS: readonly number[] = [0, 1, 2, 3, 4]
export const CONTENTS: readonly number[] = [2, 4, 12]

// the adopted knit's roots with no husk step (a root whose first three coordinates are all zero)
export const KNIT_COLUMN_ROOTS = rootsD4().filter(r => r[0] === 0 && r[1] === 0 && r[2] === 0).length

export type Form = 'empty' | 'neutral' | 'split'
export type LumpConfig = { readonly name: string; readonly form: Form; readonly n: number; readonly flip: boolean }
type Entry = { column: [number, number, number]; level: number; sign: number }

export const CONFIGS: readonly LumpConfig[] = [
  { name: 'empty', form: 'empty', n: 0, flip: false },
  ...(['neutral', 'split'] as const).flatMap(form => CONTENTS.flatMap(n => [false, true].map(flip => ({ name: `${form}${n}${flip ? '-flipped' : ''}`, form, n, flip })))),
]

export function lumpEntries(c: LumpConfig): Entry[] {
  if (c.form === 'empty') return []

  const columns: number[] = c.n === 12 ? [-1, 0, 1] : [0]
  const signs = c.n === 2 ? [1, -1] : [1, 1, -1, -1]
  const out: Entry[] = []

  for (const x of columns) {
    signs.forEach((s, level) => {
      const sign = c.flip ? -s : s
      const z = c.form === 'split' && s < 0 ? -1 : 0

      out.push({ column: [x, 0, z], level, sign })
    })
  }

  return out
}

export function placeLump(light: TritLight, s: TritState, c: LumpConfig): void {
  for (const e of lumpEntries(c)) placeStrung(light, s, dockOfColumn(light, e.column, e.level), [0, 4, 4], e.sign)
}

const mod = (x: number, m: number): number => ((x % m) + m) % m

export const ring = (d: number): number => {
  const m = mod(d, SIDE)

  return m > SIDE / 2 ? m - SIDE : m
}

export const huskDock = (x: number, y: number, z: number): number => mod(x, SIDE) + SIDE * mod(y, SIDE) + SIDE * SIDE * mod(z, SIDE)

// raise the angle column of husk link (dock, h) by v
export function kick(light: TritLight, s: TritState, dock: number, h: number, v: number): void {
  const b = light.bulk
  const l = dock * 9 + h
  const start = b.linkColumnStart[l] as number
  const length = (b.linkColumnStart[l + 1] as number) - start

  writeColumn(s.angle, b.linkColumn, undefined, start, length, columnValue(s.angle, b.linkColumn, undefined, start, length) + v)
}

const FIELDS = ['angle', 'potential', 'counter', 'lag', 'spatial'] as const

const sameHusk = (a: HuskLightState, b: HuskLightState): boolean => FIELDS.every(f => a[f].every((v, i) => v === b[f][i])) && a.string.every((v, i) => v === b.string[i])

export type ImpactReading = {
  arrival: number
  far: number[]
  // per beat: husk entries at which this configuration's twin difference differs from the empty's
  mismatch: number[]
  // per beat: the y centroid of the twin difference's angle weight past the lump (NaN when there is none)
  centroid: number[]
}

export type LumpReading = {
  config: LumpConfig
  impacts: ImpactReading[]
  gauss: number
  closure: boolean
  lumpKept: boolean
}

export type LumpSurvey = { readings: LumpReading[]; seconds: number; beatsRun: number }

let cached: LumpSurvey | undefined

// the survey: every configuration and impact, the base and twin runs of all configurations in lockstep per impact
export function depthLumpSurvey(log?: (what: string) => void): LumpSurvey {
  if (cached) return cached

  const started = Date.now()
  const light = makeTritLight({ side: SIDE, depth: DEPTH, form: 'wave' })
  const b = light.bulk
  const readings: LumpReading[] = CONFIGS.map(config => ({ config, impacts: [], gauss: 0, closure: true, lumpKept: true }))
  let beatsRun = 0

  for (const impact of IMPACTS) {
    const source = huskDock(-REACH, impact, 0)
    const detector = huskDock(REACH, impact, 0)
    const runs = CONFIGS.map(config => {
      const base = emptyTritState(light)

      placeLump(light, base, config)

      const twin = copyTritState(base)

      kick(light, twin, source, 0, PULSE)

      return { base, twin, vibe: Int8Array.from(base.vibe), huskBase: readHusk(light, base), huskTwin: readHusk(light, twin) }
    })
    const out: ImpactReading[] = CONFIGS.map(() => ({ arrival: BEATS + 1, far: [], mismatch: [], centroid: [] }))
    const diff = (h: HuskLightState, g: HuskLightState): Record<(typeof FIELDS)[number], Int32Array> =>
      Object.fromEntries(FIELDS.map(f => [f, Int32Array.from(g[f], (v, i) => v - (h[f][i] as number))])) as Record<(typeof FIELDS)[number], Int32Array>

    for (let t = 1; t <= BEATS; t++) {
      const deltas = runs.map((r, k) => {
        const reading = readings[k] as LumpReading

        for (const s of [r.base, r.twin]) {
          tritLightBeat(light, s)
          reading.gauss += bulkGaussViolations(light, s) + huskGaussViolations(light, columnSumLinks(light, bulkFlux(light, s)), s.vibe)
          beatsRun++
        }

        huskLightBeat(light, r.huskBase)
        huskLightBeat(light, r.huskTwin)

        const hb = readHusk(light, r.base)
        const ht = readHusk(light, r.twin)

        reading.closure = reading.closure && sameHusk(hb, r.huskBase) && sameHusk(ht, r.huskTwin)

        return diff(hb, ht)
      })
      const empty = deltas[0] as Record<(typeof FIELDS)[number], Int32Array>

      deltas.forEach((d, k) => {
        const o = out[k] as ImpactReading
        let mismatch = 0

        for (const f of FIELDS) {
          const a = d[f]
          const e = empty[f]

          for (let i = 0; i < a.length; i++) if (a[i] !== e[i]) mismatch++
        }

        o.mismatch.push(mismatch)

        let far = -SIDE
        let wy = 0
        let w = 0

        for (let i = 0; i < b.huskLinks; i++) {
          const v = d.angle[i] as number

          if (v === 0) continue

          const dock = Math.floor(i / 9)

          if (dock === detector && o.arrival > BEATS) o.arrival = t

          const x = ring(dock % SIDE)

          far = Math.max(far, ring(x + REACH))

          if (x > 0) {
            wy += Math.abs(v) * ring(Math.floor(dock / SIDE) % SIDE)
            w += Math.abs(v)
          }
        }

        o.far.push(far)
        o.centroid.push(w > 0 ? wy / w : Number.NaN)
      })
    }

    runs.forEach((r, k) => {
      const reading = readings[k] as LumpReading

      reading.lumpKept = reading.lumpKept && r.base.vibe.every((v, i) => v === r.vibe[i]) && r.twin.vibe.every((v, i) => v === r.vibe[i])
      reading.impacts.push(out[k] as ImpactReading)
    })

    log?.(`b ${impact} ${Math.round((Date.now() - started) / 1000)}s`)
  }

  cached = { readings, seconds: (Date.now() - started) / 1000, beatsRun }

  return cached
}

// the reading of one configuration by name
export function readingOf(survey: LumpSurvey, name: string): LumpReading {
  const r = survey.readings.find(x => x.config.name === name)

  if (!r) throw new Error(`no configuration ${name}`)

  return r
}

// the deflection of a configuration at impact index i: its centroid minus the empty's, at the empty's arrival beat
export function deflection(survey: LumpSurvey, name: string, i: number): number {
  const empty = readingOf(survey, 'empty').impacts[i] as ImpactReading
  const at = Math.min(empty.arrival, BEATS) - 1
  const own = readingOf(survey, name).impacts[i] as ImpactReading

  return (own.centroid[at] as number) - (empty.centroid[at] as number)
}
