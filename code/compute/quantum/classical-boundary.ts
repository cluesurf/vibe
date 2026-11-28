// THE BOUNDARY BETWEEN THE BARE BEAT U AND THE CLASSICAL PAIR RULES (item vibe-computation-models-0033, Q6; decision 004
// of vibe/computation/models). Four exact questions, each answered by enumeration over Q(zeta_9) (no floats, no random
// numbers):
//
//   layerCensus           which of the 8 layers of U are monomial (a permutation of basis states times phases) on the
//                         Fock states of one dock, and, for the mixing layers, whether a stated structural predicate
//                         names exactly the states they mix
//   beatMonomialCensus    for a set of start states, how many stay single basis states under U, U^2, ..., U^T, by
//                         sector (charge, excitation count); loneWitness builds, for any sector, a state U mixes
//   oneExcitationDisguise whether some dock-local change of basis could hide a permutation in the one-excitation sector:
//                         it checks the exact structure U e_s = k e_(A_s, s) + f e_(B_s, s') and the only vectors whose
//                         image lies in one dock, and whether their second image does too
//   dephasedMatrix        the dephased beat P_ij = |<i|op|j>|^2 on a set of source states as exact real cyclotomic
//                         numbers, with its column and row sums, its support graph and its entry values
//   coarseRelation        a tone map from Fock docks to ternary tones applied to the dephased support: whether the
//                         coarse images are a function of the coarse source (deterministic), with the first witness
//                         when they are not; matchPairRules tests a deterministic coarse map against the 24 pair rules
//                         on a declared edge
//
// The tone maps are declared below, before any run (DECLARED_TONE_MAPS), so the search cannot be tuned after the fact.
//
// DETERMINISM: no random numbers, no floating point, no call on the host Math object.

import { type Ninth, ONE, ZERO, add, equals, isZero, keyOf, mul, sub } from '@/code/algebra/ninth-field'
import { isReal, realSign } from '@/code/algebra/ninth-real-sign'
import { weightOf } from '@/code/measure/quantum-lab-measures'
import {
  type BeatState,
  type LayerOp,
  type Tone,
  type Vibe,
  BEAT_LAYERS,
  BEAT_LAYER_NAMES,
  LINES,
  LINE_OF_SLOT,
  OPPOSITE_SLOT,
  amplitudeOf,
  applyBeat,
  applyStream,
  basisKet,
  decodeConfig,
  dockCenterKey,
  encodeConfig,
  stepDock,
  superpose,
} from '@/code/rule/bare-beat'
import { type PairRule, pairIndex, pairRuleClasses, pairRulesFromFibers, pairTones } from '@/code/rule/pair-rule'

export type Operator = (state: BeatState) => BeatState

const SLOTS = 24
const TONE_ROLES: readonly (readonly [1 | -1, number])[] = [
  [1, 0],
  [1, 1],
  [-1, 0],
  [-1, 1],
]

// ------------------------------------------------------------------------------------------------- operators

// L: the seven per-dock layers of the beat (every layer but the stream S, which is last), so U = S o L.
export function applyDockLayers(state: BeatState): BeatState {
  return BEAT_LAYERS.slice(0, 7).reduce((cur, layer) => layer(cur, false), state)
}

export function applyDockLayersInverse(state: BeatState): BeatState {
  return BEAT_LAYERS.slice(0, 7)
    .reverse()
    .reduce((cur, layer) => layer(cur, true), state)
}

export const streamOnly: Operator = s => applyStream(s, false)

export function streamIsLastLayer(): boolean {
  return BEAT_LAYERS.length === 8 && BEAT_LAYERS[7] === applyStream
}

// ------------------------------------------------------------------------------------------------- dock states

// Every set of `size` slots out of 24, in lexicographic order.
export function slotSubsets(size: number): number[][] {
  const out: number[][] = []
  const pick: number[] = []

  const walk = (from: number): void => {
    if (pick.length === size) {
      out.push(pick.slice())

      return
    }

    for (let s = from; s <= SLOTS - (size - pick.length); s++) {
      pick.push(s)
      walk(s + 1)
      pick.pop()
    }
  }

  walk(0)

  return out
}

// Every basis state of `dock` with exactly `size` excitations (each occupied slot takes one of 4 tone-role values).
export function dockConfigs(dock: number, size: number): Vibe[][] {
  const out: Vibe[][] = []

  for (const slots of slotSubsets(size)) {
    const total = 4 ** size

    for (let code = 0; code < total; code++) {
      let rest = code

      out.push(
        slots.map(slot => {
          const [tone, role] = TONE_ROLES[rest % 4]!

          rest = (rest - (rest % 4)) / 4

          return [dock, slot, tone, role] as const
        }),
      )
    }
  }

  return out
}

// The declared four-excitation family of the base dock (Phi_odd acts only from four excitations per dock): every
// quadruple of slots with tone +1 and role 0, and every quadruple inside the first four lines with every tone and role.
export function quadrupleFamily(dock: number): Vibe[][] {
  const seen = new Set<string>()
  const out: Vibe[][] = []

  const push = (vibes: Vibe[]): void => {
    const key = encodeConfig(vibes)

    if (!seen.has(key)) {
      seen.add(key)
      out.push(vibes)
    }
  }

  for (const slots of slotSubsets(4)) {
    push(slots.map(slot => [dock, slot, 1, 0] as const))
  }

  const firstLines = LINES.slice(0, 4).flatMap(([a, b]) => [a, b])

  for (const vibes of dockConfigs(dock, 4)) {
    if (vibes.every(v => firstLines.includes(v[1]))) {
      push(vibes)
    }
  }

  return out
}

function occupantsByLine(vibes: readonly Vibe[]): Map<string, Vibe[]> {
  const out = new Map<string, Vibe[]>()

  for (const v of vibes) {
    const key = `${v[0]}:${LINE_OF_SLOT[v[1]]}`
    const list = out.get(key)

    if (list) {
      list.push(v)
    } else {
      out.set(key, [v])
    }
  }

  return out
}

// The structural predicates stated for the mixing layers (each is tested against the computed images).
export const MIXING_PREDICATES: Readonly<Record<string, (vibes: readonly Vibe[]) => boolean>> = {
  // D splits every line with exactly one occupant
  halfCoin: vibes => [...occupantsByLine(vibes).values()].some(list => list.length === 1),
  // M_pair mixes a dock with exactly two excitations that fill one line with equal tone and equal role
  pairLineMixer: vibes => {
    const byDock = new Map<number, Vibe[]>()

    for (const v of vibes) {
      byDock.set(v[0], [...(byDock.get(v[0]) ?? []), v])
    }

    return [...byDock.values()].some(
      list =>
        list.length === 2 &&
        OPPOSITE_SLOT[list[0]![1]] === list[1]![1] &&
        list[0]![2] === list[1]![2] &&
        list[0]![3] === list[1]![3],
    )
  },
  // M_meet mixes a full line of equal tones and unequal roles
  roleMeet: vibes =>
    [...occupantsByLine(vibes).values()].some(
      list => list.length === 2 && list[0]![2] === list[1]![2] && list[0]![3] !== list[1]![3],
    ),
}

// The distinct operators of the beat, by position: the predicate name for the mixing ones, null for the others.
export const LAYER_PREDICATE: readonly (string | null)[] = [
  null, // Phi_odd
  'halfCoin', // D
  null, // K
  'pairLineMixer', // M_pair
  'roleMeet', // M_meet
  'halfCoin', // D
  null, // Phi_odd
  null, // S
]

// ------------------------------------------------------------------------------------------------- layer census

export type LayerCensus = {
  readonly position: number
  readonly name: string
  readonly excitations: number
  readonly states: number
  // basis states sent to two or more basis states
  readonly mixed: number
  // basis states sent to one basis state with a phase other than 1
  readonly phased: number
  readonly largestImage: number
  // states where the mixing predicate disagrees with the computed image (null: the layer has no predicate)
  readonly predicateDisagreements: number | null
}

export function layerCensus(position: number, configs: readonly Vibe[][], excitations: number): LayerCensus {
  const layer: LayerOp = BEAT_LAYERS[position]!
  const predicateName = LAYER_PREDICATE[position]
  const predicate = predicateName === null || predicateName === undefined ? null : MIXING_PREDICATES[predicateName]!

  let mixed = 0
  let phased = 0
  let largestImage = 0
  let disagreements = 0

  for (const vibes of configs) {
    const image = layer(basisKet(vibes), false)
    const size = image.amp.size

    largestImage = size > largestImage ? size : largestImage

    if (size >= 2) {
      mixed++
    } else {
      const [key] = [...image.amp.keys()]

      if (!equals(amplitudeOf(image, key!), ONE)) {
        phased++
      }
    }

    if (predicate && predicate(vibes) !== size >= 2) {
      disagreements++
    }
  }

  return {
    position,
    name: BEAT_LAYER_NAMES[position] ?? `layer ${position}`,
    excitations,
    states: configs.length,
    mixed,
    phased,
    largestImage,
    predicateDisagreements: predicate ? disagreements : null,
  }
}

// ------------------------------------------------------------------------------------------------- beat census

export type SectorCensus = {
  readonly charge: number
  readonly excitations: number
  readonly states: number
  // monomialAfter[t - 1]: start states e with U^k e a single basis state for every k = 1..t
  readonly monomialAfter: readonly number[]
}

export function chargeOf(vibes: readonly Vibe[]): number {
  return vibes.reduce((sum, v) => sum + v[2], 0)
}

export function beatMonomialCensus(configs: readonly Vibe[][], beats: number, op: Operator = applyBeat): SectorCensus[] {
  const sectors = new Map<string, { charge: number; excitations: number; states: number; monomialAfter: number[] }>()

  for (const vibes of configs) {
    const charge = chargeOf(vibes)
    const key = `${charge}:${vibes.length}`
    const row = sectors.get(key) ?? {
      charge,
      excitations: vibes.length,
      states: 0,
      monomialAfter: new Array<number>(beats).fill(0),
    }

    row.states++
    sectors.set(key, row)

    let state = basisKet(vibes)

    for (let t = 0; t < beats; t++) {
      state = op(state)

      if (state.amp.size !== 1) {
        break
      }

      row.monomialAfter[t] = row.monomialAfter[t]! + 1
    }
  }

  return [...sectors.values()].sort((a, b) => a.excitations - b.excitations || a.charge - b.charge)
}

// A state of the sector (charge, excitations) that U mixes: one excitation per line of the base dock (so every line
// is lone), the first (excitations + charge) / 2 of tone +1, the rest -1, role 0. Needs |charge| <= excitations <= 12
// and charge = excitations mod 2.
export function loneWitness(dock: number, charge: number, excitations: number): Vibe[] {
  if (excitations < 1 || excitations > LINES.length) {
    throw new Error(`FAIL: loneWitness needs 1..${LINES.length} excitations, got ${excitations}`)
  }

  if (charge > excitations || -charge > excitations || (excitations - charge) % 2 !== 0) {
    throw new Error(`FAIL: no sector (charge ${charge}, excitations ${excitations})`)
  }

  const plus = (excitations + charge) / 2

  return LINES.slice(0, excitations).map(([slot], k) => [dock, slot, k < plus ? 1 : -1, 0] as const)
}

// ------------------------------------------------------------------------------------------------- disguise test

export type DisguiseReport = {
  // every one-excitation basis state of the dock has the two-term image k e_(A_s, s) + f e_(B_s, opp s), with the
  // same k and f for every slot, tone and role, tone and role kept, and B_s = A_(opp s)
  readonly structureHolds: boolean
  readonly structureFailures: readonly string[]
  // the 24 target docks A_s are distinct
  readonly distinctTargetDocks: number
  readonly keep: string
  readonly flip: string
  // k^2 - f^2 and k f are nonzero (the two one-dock vectors of a line are independent and each is a combination)
  readonly determinantNonzero: boolean
  // of the 2 * 96 vectors whose image lies in one dock: how many have that image a single basis state (expected all),
  // and how many have their second image in one dock (expected none)
  readonly landingVectors: number
  readonly landingSingle: number
  readonly secondImageOneDock: number
}

function docksOf(state: BeatState): Set<number> {
  const out = new Set<number>()

  for (const key of state.amp.keys()) {
    for (const v of decodeConfig(key)) {
      out.add(v[0])
    }
  }

  return out
}

export function oneExcitationDisguise(dock: number): DisguiseReport {
  const failures: string[] = []

  let keep: Ninth | null = null
  let flip: Ninth | null = null

  const targets = new Set<number>()

  for (let slot = 0; slot < SLOTS; slot++) {
    const opp = OPPOSITE_SLOT[slot]!
    const a = stepDock(dock, slot)
    const b = stepDock(dock, opp)

    targets.add(a)

    for (const [tone, role] of TONE_ROLES) {
      const image = applyBeat(basisKet([[dock, slot, tone, role]]))
      const keepKey = encodeConfig([[a, slot, tone, role]])
      const flipKey = encodeConfig([[b, opp, tone, role]])

      if (image.amp.size !== 2 || !image.amp.has(keepKey) || !image.amp.has(flipKey)) {
        failures.push(`slot ${slot} tone ${tone} role ${role}: image ${[...image.amp.keys()].join(' + ')}`)
        continue
      }

      const k = amplitudeOf(image, keepKey)
      const f = amplitudeOf(image, flipKey)

      keep ??= k
      flip ??= f

      if (!equals(k, keep) || !equals(f, flip)) {
        failures.push(`slot ${slot} tone ${tone} role ${role}: other coefficients ${keyOf(k)} ${keyOf(f)}`)
      }
    }
  }

  const k = keep ?? ZERO
  const f = flip ?? ZERO
  const determinantNonzero = !isZero(sub(mul(k, k), mul(f, f))) && !isZero(mul(k, f))

  let landingVectors = 0
  let landingSingle = 0
  let secondImageOneDock = 0

  // On the line {s, opp s} the vector k e_s - f e_opp lands only in A_s and f e_s - k e_opp only in B_s. A vector with
  // components on two lines lands in two docks or more (the lines' target docks are distinct), so these are all.
  for (let slot = 0; slot < SLOTS; slot++) {
    const opp = OPPOSITE_SLOT[slot]!

    for (const [tone, role] of TONE_ROLES) {
      for (const [x, y] of [
        [k, f],
        [f, k],
      ] as const) {
        const v = superpose([
          [[[dock, slot, tone, role]], x],
          [[[dock, opp, tone, role]], sub(ZERO, y)],
        ])
        const once = applyBeat(v)

        landingVectors++

        if (docksOf(once).size === 1 && once.amp.size === 1) {
          landingSingle++
        }

        if (docksOf(applyBeat(once)).size === 1) {
          secondImageOneDock++
        }
      }
    }
  }

  return {
    structureHolds: failures.length === 0,
    structureFailures: failures.slice(0, 8),
    distinctTargetDocks: targets.size,
    keep: keyOf(k),
    flip: keyOf(f),
    determinantNonzero,
    landingVectors,
    landingSingle,
    secondImageOneDock,
  }
}

// ------------------------------------------------------------------------------------------------- dephased matrix

export type DephasedSummary = {
  readonly sources: number
  readonly targets: number
  readonly edges: number
  // columns whose sum is exactly 1
  readonly unitColumns: number
  // rows whose preimage under the operator lies inside the sources, and how many of those sum exactly to 1
  readonly closedRows: number
  readonly closedUnitRows: number
  // rows with a preimage outside the sources whose partial sum is not strictly between 0 and 1
  readonly openRowViolations: number
  // entries not real, not strictly positive
  readonly nonRealEntries: number
  readonly nonPositiveEntries: number
  // the distinct entry values, exact keys, with their counts
  readonly entryValues: readonly (readonly [string, number])[]
  readonly outDegrees: readonly (readonly [number, number])[]
  readonly inDegrees: readonly (readonly [number, number])[]
  // weakly connected components of the support graph over sources and targets
  readonly components: number
  // the matrix itself, column by column (source key -> target key -> weight)
  readonly columns: ReadonlyMap<string, ReadonlyMap<string, Ninth>>
}

export function dephasedColumn(op: Operator, vibes: readonly Vibe[]): Map<string, Ninth> {
  const image = op(basisKet(vibes))
  const out = new Map<string, Ninth>()

  for (const [key, z] of image.amp) {
    out.set(key, weightOf(z, image.den))
  }

  return out
}

function histogram(values: Iterable<number>): [number, number][] {
  const counts = new Map<number, number>()

  for (const v of values) {
    counts.set(v, (counts.get(v) ?? 0) + 1)
  }

  return [...counts.entries()].sort((a, b) => a[0] - b[0])
}

export function dephasedMatrix(op: Operator, inverse: Operator, sources: readonly Vibe[][]): DephasedSummary {
  const columns = new Map<string, Map<string, Ninth>>()
  const rowSums = new Map<string, Ninth>()
  const inDegree = new Map<string, number>()
  const entryCounts = new Map<string, number>()
  const parent = new Map<string, string>()

  const find = (x: string): string => {
    let r = x

    while (parent.get(r) !== r) {
      r = parent.get(r)!
    }

    let c = x

    while (parent.get(c) !== r) {
      const next = parent.get(c)!

      parent.set(c, r)
      c = next
    }

    return r
  }

  const touch = (x: string): void => {
    if (!parent.has(x)) {
      parent.set(x, x)
    }
  }

  let unitColumns = 0
  let nonReal = 0
  let nonPositive = 0
  let edges = 0

  for (const vibes of sources) {
    const source = encodeConfig(vibes)
    const column = dephasedColumn(op, vibes)

    columns.set(source, column)
    touch(source)

    let sum = ZERO

    for (const [target, w] of column) {
      sum = add(sum, w)
      edges++
      rowSums.set(target, add(rowSums.get(target) ?? ZERO, w))
      inDegree.set(target, (inDegree.get(target) ?? 0) + 1)
      entryCounts.set(keyOf(w), (entryCounts.get(keyOf(w)) ?? 0) + 1)

      if (!isReal(w)) {
        nonReal++
      } else if (realSign(w) !== 1) {
        nonPositive++
      }

      touch(target)
      parent.set(find(source), find(target))
    }

    if (equals(sum, ONE)) {
      unitColumns++
    }
  }

  let closedRows = 0
  let closedUnitRows = 0
  let openRowViolations = 0

  for (const [target, sum] of rowSums) {
    const preimage = inverse(basisKet(decodeConfig(target)))
    const closed = [...preimage.amp.keys()].every(key => columns.has(key))

    if (closed) {
      closedRows++

      if (equals(sum, ONE)) {
        closedUnitRows++
      }
    } else if (realSign(sum) !== 1 || realSign(sub(ONE, sum)) !== 1) {
      openRowViolations++
    }
  }

  const roots = new Set<string>()

  for (const x of parent.keys()) {
    roots.add(find(x))
  }

  return {
    sources: sources.length,
    targets: rowSums.size,
    edges,
    unitColumns,
    closedRows,
    closedUnitRows,
    openRowViolations,
    nonRealEntries: nonReal,
    nonPositiveEntries: nonPositive,
    entryValues: [...entryCounts.entries()].sort((a, b) => (a[0] < b[0] ? -1 : a[0] > b[0] ? 1 : 0)),
    outDegrees: histogram([...columns.values()].map(c => c.size)),
    inDegrees: histogram(inDegree.values()),
    components: roots.size,
    columns,
  }
}

// P_U = Pi_S P_L: every column of the dephased beat is the dephased column of L with each target streamed.
export function dephasedFactorMismatches(sources: readonly Vibe[][]): number {
  let mismatches = 0

  for (const vibes of sources) {
    const full = dephasedColumn(applyBeat, vibes)
    const inner = dephasedColumn(applyDockLayers, vibes)
    const streamed = new Map<string, Ninth>()

    for (const [key, w] of inner) {
      const moved = streamOnly(basisKet(decodeConfig(key)))
      const [target] = [...moved.amp.keys()]

      if (moved.amp.size !== 1) {
        mismatches++
        continue
      }

      streamed.set(target!, add(streamed.get(target!) ?? ZERO, w))
    }

    const same =
      streamed.size === full.size && [...full].every(([key, w]) => equals(streamed.get(key) ?? ZERO, w))

    if (!same) {
      mismatches++
    }
  }

  return mismatches
}

// ------------------------------------------------------------------------------------------------- tone maps

export type ToneMap = {
  readonly name: string
  readonly rule: string
  // the tone of one dock from its own excitations (all of the same dock)
  readonly ofDock: (vibes: readonly Vibe[]) => Tone
}

const sign = (x: number): Tone => (x > 0 ? 1 : x < 0 ? -1 : 0)

// DECLARED BEFORE THE FIRST RUN (item 0033). These four, and no other, are the coarse-grainings tested on U. Each sends
// the empty dock to tone 0, so the vacuum goes to the all-0 tone configuration.
export const DECLARED_TONE_MAPS: readonly ToneMap[] = [
  {
    name: 'netSign',
    rule: 'the sign of the net charge (sum of tones) of the dock',
    ofDock: vibes => sign(vibes.reduce((s, v) => s + v[2], 0)),
  },
  {
    name: 'netResidue',
    rule: 'the net charge of the dock modulo 3, as a balanced residue in {-1, 0, +1}',
    ofDock: vibes => {
      const r = ((vibes.reduce((s, v) => s + v[2], 0) % 3) + 3) % 3

      return r === 2 ? -1 : (r as Tone)
    },
  },
  {
    name: 'pairedSign',
    rule: 'the sign of the net charge on the doubly occupied lines of the dock only (blind to lone excitations)',
    ofDock: vibes => {
      let s = 0

      for (const list of occupantsByLine(vibes).values()) {
        if (list.length === 2) {
          s += list[0]![2] + list[1]![2]
        }
      }

      return sign(s)
    },
  },
  {
    name: 'lowestSlotTone',
    rule: 'the tone of the occupied slot with the lowest index, 0 for an empty dock',
    ofDock: vibes => {
      let best: Vibe | null = null

      for (const v of vibes) {
        if (best === null || v[1] < best[1]) {
          best = v
        }
      }

      return best === null ? 0 : best[2]
    },
  },
]

// A tone configuration: dock center key -> nonzero tone (docks of tone 0 are left out).
export type CoarseConfig = ReadonlyMap<string, -1 | 1>

export function coarseConfig(vibes: readonly Vibe[], map: ToneMap): CoarseConfig {
  const byDock = new Map<number, Vibe[]>()

  for (const v of vibes) {
    byDock.set(v[0], [...(byDock.get(v[0]) ?? []), v])
  }

  const out = new Map<string, -1 | 1>()

  for (const [dock, list] of byDock) {
    const tone = map.ofDock(list)

    if (tone !== 0) {
      out.set(dockCenterKey(dock), tone)
    }
  }

  return out
}

export function coarseKey(config: CoarseConfig): string {
  return [...config.entries()]
    .sort((a, b) => (a[0] < b[0] ? -1 : a[0] > b[0] ? 1 : 0))
    .map(([k, t]) => `${k}=${t}`)
    .join('|')
}

export type CoarseWitness = {
  // 'branch': one source state reaches two coarse images; 'lump': two source states with one coarse image reach two
  readonly kind: 'branch' | 'lump'
  readonly sourceA: string
  readonly targetA: string
  readonly sourceB: string
  readonly targetB: string
  readonly weightA: string
  readonly weightB: string
}

export type CoarseVerdict = {
  readonly map: string
  readonly sources: number
  readonly pairs: number
  readonly coarseSources: number
  // coarse sources with two or more coarse images
  readonly multivalued: number
  readonly deterministic: boolean
  readonly branchWitness: CoarseWitness | null
  readonly lumpWitness: CoarseWitness | null
  // when deterministic: the coarse map, source key -> image key, with the configurations themselves
  readonly table: ReadonlyMap<string, { source: CoarseConfig; image: CoarseConfig }>
}

export function coarseRelation(op: Operator, sources: readonly Vibe[][], map: ToneMap): CoarseVerdict {
  const seen = new Map<string, { image: string; source: string; target: string; weight: Ninth; config: CoarseConfig; imageConfig: CoarseConfig }>()
  const multivalued = new Set<string>()

  let branchWitness: CoarseWitness | null = null
  let lumpWitness: CoarseWitness | null = null
  let pairs = 0

  for (const vibes of sources) {
    const source = encodeConfig(vibes)
    const config = coarseConfig(vibes, map)
    const cKey = coarseKey(config)

    for (const [target, weight] of dephasedColumn(op, vibes)) {
      const imageConfig = coarseConfig(decodeConfig(target), map)
      const iKey = coarseKey(imageConfig)
      const prior = seen.get(cKey)

      pairs++

      if (!prior) {
        seen.set(cKey, { image: iKey, source, target, weight, config, imageConfig })
        continue
      }

      if (prior.image === iKey) {
        continue
      }

      multivalued.add(cKey)

      const witness: CoarseWitness = {
        kind: prior.source === source ? 'branch' : 'lump',
        sourceA: prior.source,
        targetA: prior.target,
        sourceB: source,
        targetB: target,
        weightA: keyOf(prior.weight),
        weightB: keyOf(weight),
      }

      if (witness.kind === 'branch') {
        branchWitness ??= witness
      } else {
        lumpWitness ??= witness
      }
    }
  }

  const deterministic = multivalued.size === 0
  const table = new Map<string, { source: CoarseConfig; image: CoarseConfig }>()

  if (deterministic) {
    for (const [cKey, row] of seen) {
      table.set(cKey, { source: row.config, image: row.imageConfig })
    }
  }

  return {
    map: map.name,
    sources: sources.length,
    pairs,
    coarseSources: seen.size,
    multivalued: multivalued.size,
    deterministic,
    branchWitness,
    lumpWitness,
    table,
  }
}

// ------------------------------------------------------------------------------------------------- pair-rule match

export type PairRuleMatch = {
  // the pairs (a, b) on the edge that the domain covers, as pair indices
  readonly coveredPairs: readonly number[]
  // domain entries with a nonzero tone off the edge whose off-edge tones changed (a pair rule leaves them alone)
  readonly offEdgeChanges: number
  readonly matching: readonly PairRule[]
  // the class representatives (by name) of the matching rules
  readonly classes: readonly string[]
}

const PAIR_RULES = pairRulesFromFibers()

export function pairRuleClassOf(rule: PairRule): string {
  const cls = pairRuleClasses({ rules: PAIR_RULES }).find(c => c.members.some(m => m.name === rule.name))

  return cls ? cls.representative.name : '?'
}

// Which of the 24 pair rules, applied once on the edge (a, b) and leaving every other dock alone, give the coarse map on
// every entry of its domain.
export function matchPairRules(
  entries: readonly { source: CoarseConfig; image: CoarseConfig }[],
  edge: readonly [string, string],
): PairRuleMatch {
  const [a, b] = edge
  const covered = new Set<number>()

  let offEdgeChanges = 0

  for (const { source, image } of entries) {
    covered.add(pairIndex(source.get(a) ?? 0, source.get(b) ?? 0))

    const keys = new Set([...source.keys(), ...image.keys()])

    for (const key of keys) {
      if (key !== a && key !== b && source.get(key) !== image.get(key)) {
        offEdgeChanges++
        break
      }
    }
  }

  const matching = PAIR_RULES.filter(rule =>
    entries.every(({ source, image }) => {
      const [x, y] = pairTones(rule.table[pairIndex(source.get(a) ?? 0, source.get(b) ?? 0)]!)

      return (image.get(a) ?? 0) === x && (image.get(b) ?? 0) === y
    }),
  )

  return {
    coveredPairs: [...covered].sort((x, y) => x - y),
    offEdgeChanges,
    matching: offEdgeChanges === 0 ? matching : [],
    classes: [...new Set((offEdgeChanges === 0 ? matching : []).map(pairRuleClassOf))].sort(),
  }
}
