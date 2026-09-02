// The rule-space search harness: brute-force whole families of candidate collisions through staged
// gates, cheap algebra first, tiny-mesh dynamics second, so millions of rules are affordable. The hunt
// (roadmap: the sixth thing) is for a rule whose vacuum keeps the cancelling three-beat clock while a
// lone matter defect MOVES with bounded magnitude and a ROTATING phase, the e^{i(kx - wt)} signature.
//
//   stage 1  vacuum orbit on one line couple (81 states, pure algebra): the orbit closes within 36 beats and the Z_3 amplitude cancels over the full cycle
//   stage 2  lone-defect dynamics on a side-5 mesh, 9 beats: bounded magnitude, movement, rotation
//   stage 3  re-verify survivors on a side-7 mesh, 15 beats, plus the union gate
//
// Families are generators of named collisions. The built-in family conditions each matter line on its
// clock wire's state class, choosing among atom tables per class; the wire always runs the committed
// charge table so the clock survives. Run: pnpm tsx task/rule-search.ts [maxReport]
import { d4Mesh, meshOpposites, shellDistances } from '@/code/tool/mesh'
import { makeWill, Will } from '@/code/tone/will'
import { Collision, PAIR_FORWARD } from '@/code/rule/collision'
import { beat } from '@/code/rule/lattice-gas'
import { clockAmplitude, phaseDegrees } from '@/code/measure/clock-amplitude'
import { pairAbs2, pairAdd, pairSub, ComplexPair } from '@/code/algebra/linear/complex-pair'

type Tone = -1 | 0 | 1

const TONES: Tone[] = [-1, 0, 1]
const ROOT3 = Math.sqrt(3)

const pairKey = (a: number, b: number): number => (a + 1) * 3 + (b + 1)

// every conserving bijection on one pair (the 24 of E-FND-0088), plus each composed with the swap
function conservingTables(): [number, number][][] {
  const classes: [Tone, Tone][][] = [-2, -1, 0, 1, 2].map(sum =>
    TONES.flatMap(a => TONES.filter(b => a + b === sum).map(b => [a, b] as [Tone, Tone])),
  )
  const permute = <T>(xs: T[]): T[][] =>
    xs.length <= 1 ? [xs] : xs.flatMap((x, i) => permute([...xs.slice(0, i), ...xs.slice(i + 1)]).map(rest => [x, ...rest]))
  const out: [number, number][][] = []
  const parts = classes.map(c => permute(c))

  for (const p0 of parts[0]!) {for (const p1 of parts[1]!) {for (const p2 of parts[2]!) {for (const p3 of parts[3]!) {for (const p4 of parts[4]!) {
    const table = new Array<[number, number]>(9)

    classes.forEach((states, ci) => {
      const image = [p0, p1, p2, p3, p4][ci]!

      states.forEach((st, i) => { table[pairKey(st[0], st[1])] = [image[i]![0], image[i]![1]] })
    })
    out.push(table)
    out.push(table.map(([x, y]) => [y, x] as [number, number])) // swap-composed
  }}}}}

  // dedupe
  const seen = new Set<string>()

  return out.filter(t => { const k = t.map(p => p.join(':')).join(',');

 if (seen.has(k)) {return false;}

 seen.add(k);

 return true })
}

export const ATOMS = conservingTables()
export const CHARGE = ATOMS.findIndex(t => TONES.every(a => TONES.every(b => {
  const o = PAIR_FORWARD[pairKey(a, b)]!
  const u = t[pairKey(a, b)]!

  return o[0] === u[0] && o[1] === u[1]
})))

// wire state classes: empty, marked, anti, other
function wireClass(a: number, b: number): number {
  if (a === 0 && b === 0) {return 0}

  if (a === 1 && b === -1) {return 1}

  if (a === -1 && b === 1) {return 2}

  return 3
}

export type Candidate = { name: string; choice: [number, number, number, number] }

export function candidateCollision(mesh: ReturnType<typeof d4Mesh>, choice: number[]): Collision {
  const opposite = meshOpposites(mesh)
  const lines: [number, number][] = []

  for (let d = 0; d < mesh.degree; d++) { const o = opposite[d]!;

 if (d < o) {lines.push([d, o])} }

  const couples: [[number, number], [number, number]][] = []

  for (let k = 0; k + 1 < lines.length; k += 2) {couples.push([lines[k]!, lines[k + 1]!])}

  return (slots, base) => {
    for (const [lineA, wire] of couples) {
      const wa = slots[base + wire[0]]!, wb = slots[base + wire[1]]!
      const atom = ATOMS[choice[wireClass(wa, wb)]!]!
      const image = atom[pairKey(slots[base + lineA[0]]!, slots[base + lineA[1]]!)]!

      slots[base + lineA[0]] = image[0]; slots[base + lineA[1]] = image[1]

      const wireImage = ATOMS[CHARGE]![pairKey(wa, wb)]!

      slots[base + wire[0]] = wireImage[0]; slots[base + wire[1]] = wireImage[1]
    }
  }
}

// stage 1: the vacuum on a single couple: (matter pair, wire pair) from ((0,0),(0,0)), does the wire
// cycle with period three and does the couple's Z_3 amplitude cancel over the cycle
export function stage1(choice: number[]): boolean {
  let matter: [number, number] = [0, 0]
  let wire: [number, number] = [0, 0]
  let re = 0, im = 0

  const THIRD = (2 * Math.PI) / 3
  const CAP = 36

  for (let t = 0; t < CAP; t++) {
    const atom = ATOMS[choice[wireClass(wire[0], wire[1])]!]!
    const m = atom[pairKey(matter[0], matter[1])]!
    const w = ATOMS[CHARGE]![pairKey(wire[0], wire[1])]!

    matter = [m[0], m[1]]; wire = [w[0], w[1]]

    for (const v of [...matter, ...wire]) { re += Math.cos(THIRD * v); im += Math.sin(THIRD * v) }

    if (matter[0] === 0 && matter[1] === 0 && wire[0] === 0 && wire[1] === 0) {
      return Math.hypot(re, im) < 1e-9
    }
  }

  return false
}

// stage 2 and 3: lone matter defect on a periodic mesh
export function defectRun(side: number, beats: number, choice: number[]): {
  bounded: boolean; moves: boolean; rotates: boolean; unionExact?: boolean
} {
  const mesh = d4Mesh({ side })
  const rule = candidateCollision(mesh, choice)
  const centre = Math.floor(mesh.cellCount / 2)

  const run = (seeds: number[]): { d: ComplexPair; cells: Set<number> }[] => {
    let vac: Will = makeWill(mesh), s: Will = makeWill(mesh)

    for (const cell of seeds) {s.data[cell * mesh.degree] = 1}

    const out: { d: ComplexPair; cells: Set<number> }[] = []

    for (let t = 0; t < beats; t++) {
      vac = beat(vac, rule); s = beat(s, rule)

      const cells = new Set<number>()

      for (let i = 0; i < s.data.length; i++) {if (s.data[i] !== vac.data[i]) {cells.add(Math.floor(i / mesh.degree))}}

      out.push({ d: pairSub(clockAmplitude(s), clockAmplitude(vac)), cells })
    }

    return out
  }

  const one = run([centre])
  const mags = one.map(x => Math.sqrt(pairAbs2(x.d)))
  const bounded = mags.every(m => m > 0.5 && m < 2.5 * ROOT3) && one.every(x => x.cells.size <= 4)
  const first = one[0]!.cells
  const area = new Set<number>()

  for (const c of first) { area.add(c);

 for (let d = 0; d < mesh.degree; d++) {area.add(mesh.neighbour(c, d))} }

  const moves = [...one[beats - 1]!.cells].some(c => !area.has(c))
  const phases = one.map(x => (Math.sqrt(pairAbs2(x.d)) > 1e-9 ? phaseDegrees(x.d) : null)).filter(p => p !== null)
  const rotates = new Set(phases).size >= 3
  const result: { bounded: boolean; moves: boolean; rotates: boolean; unionExact?: boolean } = { bounded, moves, rotates }

  if (bounded && moves) {
    const far = [0, 1, 2].reduce(c => mesh.neighbour(c, 4), centre)
    const two = run([far]); const both = run([centre, far])

    let worst = 0

    for (let t = 0; t < beats; t++) {worst = Math.max(worst, Math.sqrt(pairAbs2(pairSub(both[t]!.d, pairAdd(one[t]!.d, two[t]!.d)))))}

    result.unionExact = worst < 1e-9
  }

  return result
}

// score one stage-1 survivor: exact magnitude preservation, how far the defect travels, how many
// phases it visits, and whether the travel is ballistic (monotone distance growth to at least 4)
export function scoreRule(side: number, beats: number, choice: number[]): {
  exactMagnitude: boolean
  maxDistance: number
  distinctPhases: number
  ballistic: boolean
  compact: boolean
} {
  const mesh = d4Mesh({ side })
  const rule = candidateCollision(mesh, choice)
  const centre = Math.floor(mesh.cellCount / 2)
  const distance = shellDistances(mesh, centre)

  let vac: Will = makeWill(mesh)
  let seeded: Will = makeWill(mesh)

  seeded.data[centre * mesh.degree] = 1

  let exactMagnitude = true
  let maxDistance = 0
  let compact = true
  let monotone = true
  let previousDistance = 0

  const phases = new Set<number>()

  for (let t = 0; t < beats; t++) {
    vac = beat(vac, rule)
    seeded = beat(seeded, rule)

    const cells = new Set<number>()

    for (let i = 0; i < seeded.data.length; i++) {
      if (seeded.data[i] !== vac.data[i]) {
        cells.add(Math.floor(i / mesh.degree))
      }
    }

    if (cells.size === 0 || cells.size > 4) {
      compact = false
    }

    const difference = pairSub(clockAmplitude(seeded), clockAmplitude(vac))
    const magnitude = Math.sqrt(pairAbs2(difference))

    if (Math.abs(magnitude - ROOT3) > 1e-9) {
      exactMagnitude = false
    }

    if (magnitude > 1e-9) {
      phases.add(phaseDegrees(difference))
    }

    const reach = Math.max(0, ...[...cells].map(c => distance[c] ?? 0))

    if (reach < previousDistance - 1) {
      monotone = false
    }

    previousDistance = reach
    maxDistance = Math.max(maxDistance, reach)
  }

  return {
    exactMagnitude,
    maxDistance,
    distinctPhases: phases.size,
    ballistic: monotone && maxDistance >= 4,
    compact,
  }
}

export function searchWireConditionedFamily(report: (line: string) => void, maxReport = 25): {
  total: number
  pass1: number
  scored: number
  top: { choice: number[]; score: ReturnType<typeof scoreRule> }[]
} {
  const n = ATOMS.length
  const top: { choice: number[]; score: ReturnType<typeof scoreRule> }[] = []

  let total = 0
  let pass1 = 0
  let scored = 0

  const rank = (s: ReturnType<typeof scoreRule>): number =>
    (s.compact ? 1000 : 0) +
    (s.exactMagnitude ? 500 : 0) +
    (s.ballistic ? 300 : 0) +
    s.maxDistance * 20 +
    s.distinctPhases

  for (let c0 = 0; c0 < n; c0++) {
    for (let c1 = 0; c1 < n; c1++) {
      for (let c2 = 0; c2 < n; c2++) {
        // the "other" wire class never occurs in the pure vacuum; tie it to c2 to keep the space cubic
        const choice = [c0, c1, c2, c2]

        total++

        if (!stage1(choice)) {
          continue
        }

        pass1++

        const score = scoreRule(5, 16, choice)

        if (!score.compact || score.maxDistance < 2) {
          continue
        }

        scored++
        top.push({ choice, score })
        top.sort((a, b) => rank(b.score) - rank(a.score))

        if (top.length > maxReport) {
          top.pop()
        }
      }
    }
  }

  for (const { choice, score } of top) {
    report(
      `[${choice.join(',')}] exactMag ${score.exactMagnitude ? 1 : 0} maxDist ${score.maxDistance} phases ${score.distinctPhases} ballistic ${score.ballistic ? 1 : 0}`,
    )
  }

  return { total, pass1, scored, top }
}

const isMain = process.argv[1]?.endsWith('rule-search.ts')

if (isMain) {
  const started = Date.now()
  const result = searchWireConditionedFamily(line => console.log(line))

  console.log(
    `searched ${result.total} rules (atoms ${ATOMS.length}): stage1 ${result.pass1}, scored ${result.scored}, ${((Date.now() - started) / 1000).toFixed(1)}s`,
  )
}
