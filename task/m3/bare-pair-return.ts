// Batch driver: the identical pair of E-CMP-0037 (Q2,
// test/experiment/computation/bare-u-particles.ts) run under the bare beat U on {3,4,3,4} and the flat {3,4,3,3} for
// more beats, to find the first beat at which its return probability differs between the two meshes. Library only: bare-beat withGeometry, particles pairRunReadings, the same start, the same hop
// table (radius 3) and the same mesh line through dock 0 as the experiment.
//
//   pnpm call task/batch/bare-pair-return.ts [--beats 8]
//
// With no flags it reproduces E-CMP-0037's identical-pair rows (8 beats) exactly. Each beat prints one JSON line per
// mesh (configurations, docks, configurations off the start line, the exact return probability and its weight by hop
// distance 0..3 and beyond); the closing SUMMARY line holds every row and the first differing beat per observable, read
// as in the experiment (0 = no difference through the last beat).
import { createHash } from 'node:crypto'
import { keyOf, toComplex } from '@/code/algebra/ninth-field'
import { lineChain, pairRunReadings, type PairReading } from '@/code/compute/quantum/particles'
import { hopDistances } from '@/code/measure/quantum-lab-measures'
import { type BeatGeometry, BEAT_GEOMETRIES, OPPOSITE_SLOT, basisKet, withGeometry } from '@/code/rule/bare-beat'
import { flags, intFlag, seconds, summary } from './args'

// as in the experiment: the hop table stops at radius 3 (radius 4 builds 162,033 exact docks), and the line
// table reaches LINE_PAIR_BEATS + 2 = 14 docks each way (longer runs extend it so the pair never leaves it)
const DISTANCE_RADIUS = 3
const LINE_PAIR_BEATS = 12

const f = flags()
const beats = intFlag(f, 'beats', 8)
const lineRadius = (beats > LINE_PAIR_BEATS ? beats : LINE_PAIR_BEATS) + 2
const start = performance.now()
const sha = (text: string): string => createHash('sha256').update(text).digest('hex').slice(0, 16)
const display = (x: PairReading['returnProbability']): number => Number(toComplex(x)[0].toPrecision(8))

let peakRss = 0

const sampleRss = (): void => {
  const rss = process.memoryUsage().rss

  peakRss = rss > peakRss ? rss : peakRss
}

function readMesh(geometry: BeatGeometry): PairReading[] {
  return withGeometry(geometry, () => {
    const t0 = performance.now()
    const distance = hopDistances(0, DISTANCE_RADIUS)
    const line = lineChain(0, 0, lineRadius)
    const identical = basisKet([
      [0, 0, 1, 0],
      [0, OPPOSITE_SLOT[0]!, 1, 0],
    ])
    const readings = pairRunReadings(identical, beats, distance, line)

    sampleRss()

    readings.forEach((r, t) =>
      console.log(
        JSON.stringify({
          mesh: geometry,
          beat: t + 1,
          configurations: r.configurations,
          supportDocks: r.supportDocks,
          offLine: r.offLineConfigurations,
          returnProbability: keyOf(r.returnProbability),
          returnDisplay: display(r.returnProbability),
          distanceWeights: r.distanceWeights,
          norm: keyOf(r.norm),
        }),
      ),
    )
    console.log(`mesh ${geometry}: ${beats} beats in ${seconds(t0)} s, rss ${(peakRss / 2 ** 30).toFixed(2)} GB`)

    return readings
  })
}

// the first beat (1-based) at which two lists differ, 0 when they agree on every beat read (the experiment's rule)
function firstDifference(a: readonly string[], b: readonly string[]): number {
  for (let t = 0; t < a.length && t < b.length; t++) {
    if (a[t] !== b[t]) {
      return t + 1
    }
  }

  return 0
}

console.log(`identical pair, ${beats} beats, line radius ${lineRadius}`)

const [h, flat] = BEAT_GEOMETRIES.map(readMesh) as [PairReading[], PairReading[]]
const first = {
  configurations: firstDifference(h.map(r => String(r.configurations)), flat.map(r => String(r.configurations))),
  weightPattern: firstDifference(h.map(r => sha(r.weightPattern)), flat.map(r => sha(r.weightPattern))),
  returnProbability: firstDifference(h.map(r => keyOf(r.returnProbability)), flat.map(r => keyOf(r.returnProbability))),
  supportDocks: firstDifference(h.map(r => String(r.supportDocks)), flat.map(r => String(r.supportDocks))),
  occupationPattern: firstDifference(h.map(r => sha(r.occupationPattern)), flat.map(r => sha(r.occupationPattern))),
  distanceWeights: firstDifference(h.map(r => r.distanceWeights.join(' ')), flat.map(r => r.distanceWeights.join(' '))),
}
// the experiment's notes, in its own format, so a default run can be compared with E-CMP-0037's log text
const notes = {
  pairConfigurations: `${h.map(r => r.configurations).join(',')} | ${flat.map(r => r.configurations).join(',')}`,
  pairSupportDocks: `${h.map(r => r.supportDocks).join(',')} | ${flat.map(r => r.supportDocks).join(',')}`,
  pairReturn: `${h.map(r => keyOf(r.returnProbability)).join(', ')} | ${flat.map(r => keyOf(r.returnProbability)).join(', ')}`,
  pairOffLine: `${h.map(r => r.offLineConfigurations).join(',')} | ${flat.map(r => r.offLineConfigurations).join(',')}`,
  pairDistanceWeights4: beats >= 4 ? `${h[3]!.distanceWeights.join(', ')} | ${flat[3]!.distanceWeights.join(', ')}` : '',
}
const unitNorm = [...h, ...flat].every(r => keyOf(r.norm) === '1 0 0 0 0 0/1')

console.log(`Identical pair per beat, configurations ${notes.pairConfigurations}; docks ${notes.pairSupportDocks}; return ${notes.pairReturn}; configurations off the starting line ${notes.pairOffLine}; weight by hop distance 0..3 and beyond at beat 4: ${notes.pairDistanceWeights4}.`)
console.log(`first difference ${JSON.stringify(first)}, unit norm ${unitNorm}`)

summary({
  driver: 'bare-pair-return',
  part: 'b',
  beats,
  firstDifference: first,
  unitNorm,
  notes,
  rows: { '3434': h.map(r => ({ c: r.configurations, d: r.supportDocks, p: keyOf(r.returnProbability) })), '3433': flat.map(r => ({ c: r.configurations, d: r.supportDocks, p: keyOf(r.returnProbability) })) },
  peakRssGB: Number((peakRss / 2 ** 30).toFixed(2)),
  seconds: seconds(start),
})

if (!unitNorm) {
  process.exitCode = 1
}
