// M11 on the tilings: block coarse-graining of the 24 spin-one pair rules on the
// matched pairs {4,4}/{4,5}, {6,3}/{6,4}, {3,6}/{3,7}, read on exact coset tilings under one schedule
// family on both sides of every pair: the coloring lifted from a finite quotient of the triangle group, two colorings
// per tiling (variants 0 and 1), colors in index order. Libraries: code/compute/lab/coarse-tiling.ts (frame, blocks,
// lone-mover theorem, sparse and dense runs, witnesses) and coarse-tiling-contract.ts (exact contracts). A plan
// fixed every criterion below before the first run.
//
// PART A, the lone-mover no-go of the line slice on every tiling and blocking. The product permutation P of a round's
// matchings is the track of every lone mover (theorem in coarse-tiling.ts). For every tiling, coloring, declared
// blocking (edge blocks E(c), cosets of the edge stabilizer <s_0, s_2> on one color; orbit blocks D(c, c') of
// <M_c, M_c'>, admitted when every orbit closes) and tau in {1, 2}: does P^tau split a block? One block per quotient
// class decides it on the whole tiling (P and the blocks commute with the deck group N). Also P^tau for tau up to 6:
// the identity, commuting with each M_c, a tile-graph automorphism.
//
// PART B, lumpability of every rule, block map (majority, netSign, occupancy, netResidue; decimation on edge blocks),
// blocking, tau in {1, 2}, under both orientations (radial, the M1 schedule; lifted, N-periodic). A rule is decided
//   - 'not' by the theorem (a lone mover on a fixed background, F reads a lone excitation, P^tau splits a block) or by
//     a bounded search (every state with at most 3 excitations on the radius-1 ball and 2 on the radius-2 ball, each
//     fixed background), every witness re-checked by the dense path (code/rule/partitioned-pair on the exact backward
//     dependency set);
//   - 'proved' when an argument holds on the whole tiling: the identity (G identity); a rule that keeps each cell's
//     occupancy, under occupancy (G identity); the full swap, whose round is P itself, under a permutation-invariant F
//     when P^tau maps every block onto a block (G a transport of letters), and under decimation (lifted orientation)
//     when P^-tau maps first cells to first cells;
//   - 'clean' otherwise (no witness in the bounded search; never called lumpable).
//
// PART C, exact simulation contracts on edge blocks under the lifted orientation (N-periodic, so exact on the whole
// tiling), tau 1 (tau 2 left to a larger run), every section of the five declared maps (75 distinct ordered sections of b = 2), every rule.
// Each contract's G is named identity, onsite (each block maps its own letter by a fixed map of its class), transport
// (each block copies one other block's letter; at the lone speed when that block holds the P^-tau image of the
// target's cells), or local. Flat against degree-matched hyperbolic: counts per kind and the rule classes that have
// them, compared within each coloring variant.
//
// Gates (fail the run): every quotient class found; the lone-mover theorem's track equals the sparse run of every lone
// mover (every rule, background, frame); every theorem split gives a witness the dense path confirms; every witness
// re-checked; the full swap under netSign has a witness wherever P^tau splits; the identity rule has no witness and
// every section is an identity contract; a proved case never has a witness; two planted bad witnesses refused; a
// planted wrong G refused; contract images re-derived by the dense path on structured configurations, 0 mismatches;
// two runs give identical bytes; no random number in the lab files.

import { readFileSync } from 'node:fs'
import { resolve } from 'node:path'
import { scanSource } from '@/code/check/determinism'
import { BLOCK_MAPS, BlockMap, blockOfCode, sections } from '@/code/compute/lab/coarse-block'
import {
  Blocking,
  LoneSplit,
  Orientation,
  TileFrame,
  TilingWitness,
  Tones,
  boundedConfigs,
  checkTilingWitness,
  denseRead,
  edgeBlocking,
  fixesBackground,
  loneMotion,
  loneSplit,
  loneWitness,
  motion,
  orbitBlocking,
  readsLoneExcitation,
  sparseRounds,
  witnessSearch,
} from '@/code/compute/lab/coarse-tiling'
import {
  Cone,
  coneHolds,
  edgeCone,
  evaluateCone,
  patternCode,
  sigmaMask,
} from '@/code/compute/lab/coarse-tiling-contract'
import { PairTable, pairRuleCensus, pairRuleClasses, swapPair } from '@/code/rule/pair-rule'
import { experiment } from '@/test/scaffold/suite'
import { verdict } from '@/test/scaffold/verdict'

const BASE = resolve(import.meta.dirname, '../../..')
const LAB_FILES = [
  'code/compute/lab/coarse-tiling.ts',
  'code/compute/lab/coarse-tiling-contract.ts',
  'test/experiment/computation/tiling-coarse-graining.ts',
]

// ---- parameters, fixed before the first run ----

const PAIRS: { flat: [number, number]; hyperbolic: [number, number] }[] = [
  { flat: [4, 4], hyperbolic: [4, 5] },
  { flat: [6, 3], hyperbolic: [6, 4] },
  { flat: [3, 6], hyperbolic: [3, 7] },
]
const VARIANTS = [0, 1]
const ORIENTATIONS: Orientation[] = ['radial', 'lifted']
const TAUS = [1, 2]
const MOTION_TAUS = [1, 2, 3, 4, 6]
// tau 2 contracts leave classes undecided at the node budget unevenly across a pair (probe: 307 on {4,4}, 17 on
// {4,5}), which would bias the comparison: left to a larger run
const CONTRACT_TAUS = [1]
const CONTRACT_BUDGET = 400_000
const BACKGROUNDS = [-1, 0, 1]
// the bounded witness search: at most 3 excitations on the radius-1 ball and 2 on the radius-2 ball
const SEARCH_BALL1 = 3
const SEARCH_BALL2 = 2

// The sizes a larger run may raise (task/batch/tiling-coarse.ts); every default is the parameter fixed above, which
// E-CMP-0069 runs.
export type TilingKnobs = {
  contractTaus: readonly number[]
  contractBudget: number
  searchBall1: number
  searchBall2: number
}

const DEFAULT_KNOBS: TilingKnobs = {
  contractTaus: CONTRACT_TAUS,
  contractBudget: CONTRACT_BUDGET,
  searchBall1: SEARCH_BALL1,
  searchBall2: SEARCH_BALL2,
}

type Rule = { name: string; table: PairTable; representative: string }

function rules(): Rule[] {
  const spin = pairRuleCensus().rules
  const repOf = new Map<string, string>()

  for (const c of pairRuleClasses({ rules: spin })) {
    for (const m of c.members) {
      repOf.set(m.name, c.representative.name)
    }
  }

  return spin.map(r => ({ name: r.name, table: r.table, representative: repOf.get(r.name)! }))
}

const isFullSwap = (table: PairTable): boolean => Array.from({ length: 9 }, (_, p) => p).every(p => table[p] === swapPair(p))
const isIdentity = (table: PairTable): boolean => Array.from({ length: 9 }, (_, p) => p).every(p => table[p] === p)

// the rule keeps each cell's occupancy (zero or not) at every pair
function keepsOccupancy(table: PairTable): boolean {
  for (let p = 0; p < 9; p++) {
    const o = table[p]!

    if ((Math.floor(p / 3) === 1) !== (Math.floor(o / 3) === 1) || (p % 3 === 1) !== (o % 3 === 1)) {
      return false
    }
  }

  return true
}

type FrameSet = {
  frame: TileFrame
  tiling: string
  side: 'flat' | 'hyperbolic'
  variant: number
  reps: number[]
  colors: number[]
  blockings: { blocking: Blocking; sizes: number[] }[]
}

function frameSet(p: number, q: number, side: 'flat' | 'hyperbolic', variant: number, orientation: Orientation): FrameSet {
  const frame = new TileFrame({ p, q, variant, orientation })
  const reps = frame.representatives()
  const blockings: { blocking: Blocking; sizes: number[] }[] = []

  for (let c = 0; c < p; c++) {
    blockings.push({ blocking: edgeBlocking(frame, c), sizes: [2] })
  }

  for (let a = 0; a < p; a++) {
    for (let b = a + 1; b < p; b++) {
      const o = orbitBlocking(frame, a, b, reps)

      if (o.blocking) {
        blockings.push({ blocking: o.blocking, sizes: o.sizes })
      }
    }
  }

  return {
    frame,
    tiling: `{${p},${q}}`,
    side,
    variant,
    reps,
    colors: Array.from({ length: p }, (_, k) => k),
    blockings,
  }
}

// ---- part A ----

type MotionRow = {
  tiling: string
  side: string
  variant: number
  tau: number
  identity: boolean
  commutes: boolean[]
  automorphism: boolean
}

type SplitRow = { tiling: string; side: string; variant: number; blocking: string; sizes: number[]; tau: number; split: boolean }

function motionRows(fs: FrameSet): MotionRow[] {
  const { frame, reps, colors } = fs

  return MOTION_TAUS.map(tau => {
    const image = (t: number): number => motion(frame, colors, t, tau)

    return {
      tiling: fs.tiling,
      side: fs.side,
      variant: fs.variant,
      tau,
      identity: reps.every(r => image(r) === r),
      commutes: colors.map(c => reps.every(r => image(frame.partner(c, r)) === frame.partner(c, image(r)))),
      automorphism: reps.every(r => {
        const around = new Set(frame.neighbors(image(r)))

        return frame.neighbors(r).every(w => around.has(image(w)))
      }),
    }
  })
}

// ---- part B ----

type LumpRow = {
  tiling: string
  side: string
  variant: number
  orientation: Orientation
  rule: string
  representative: string
  blocking: string
  tau: number
  map: string
  verdict: 'not' | 'proved' | 'clean'
  how: 'theorem' | 'search' | 'identity' | 'occupancy' | 'transport' | 'none'
  checked: boolean | null
}

function inverseMotion(frame: TileFrame, colors: readonly number[], tile: number, tau: number): number {
  return motion(frame, [...colors].reverse(), tile, tau)
}

// the full swap's transport proofs on one blocking (decided on one block per quotient class)
function transportProof(fs: FrameSet, blocking: Blocking, tau: number, split: LoneSplit | null): { symmetric: boolean; decimation: boolean } {
  const { frame, reps, colors } = fs
  const symmetric = split === null
  const decimation =
    fs.frame.orientation === 'lifted' &&
    blocking.kind === 'edge' &&
    reps.every(r => {
      const first = blocking.cells(r)[0]!
      const source = inverseMotion(frame, colors, first, tau)

      return blocking.cells(source)[0] === source
    })

  return { symmetric, decimation }
}

type PartB = {
  rows: LumpRow[]
  trackChecks: number
  trackFailures: number
  theoremSplits: number
  theoremUnconfirmed: number
  witnesses: { fs: FrameSet; rule: Rule; tau: number; blocking: Blocking; map: BlockMap; witness: TilingWitness; beta: number }[]
}

function partB(fs: FrameSet, all: readonly Rule[], splits: Map<string, LoneSplit | null>, knobs: TilingKnobs): PartB {
  const { frame, reps, colors } = fs
  const rows: LumpRow[] = []
  const witnesses: PartB['witnesses'] = []
  const ball1 = frame.ball(1)
  const ball2 = frame.ball(2)

  let trackChecks = 0
  let trackFailures = 0
  let theoremSplits = 0
  let theoremUnconfirmed = 0

  for (const rule of all) {
    const backgrounds = BACKGROUNDS.filter(beta => fixesBackground(rule.table, beta))
    const movers = backgrounds.flatMap(beta =>
      [-1, 0, 1].filter(u => u !== beta && loneMotion(rule.table, beta, u) === 'mover').map(u => ({ beta, u })),
    )

    // the theorem's track: a lone mover's sparse run is the single tone at P^tau(a)
    for (const { beta, u } of movers) {
      for (const tau of TAUS) {
        for (const r of reps) {
          const after = sparseRounds({ frame, table: rule.table, colors, beta, start: new Map([[r, u]]), rounds: tau })
          const at = motion(frame, colors, r, tau)

          trackChecks++
          trackFailures += after.size === 1 && after.get(at) === u ? 0 : 1
        }
      }
    }

    for (const tau of TAUS) {
      const readings: { blocking: Blocking; sizes: number[]; map: BlockMap }[] = []

      for (const { blocking, sizes } of fs.blockings) {
        for (const map of BLOCK_MAPS) {
          if (map.name === 'decimation' && blocking.kind !== 'edge') {
            continue
          }

          readings.push({ blocking, sizes, map })
        }
      }

      const decided = new Map<number, LumpRow>()

      readings.forEach(({ blocking, sizes, map }, i) => {
        const base = {
          tiling: fs.tiling,
          side: fs.side,
          variant: fs.variant,
          orientation: frame.orientation,
          rule: rule.name,
          representative: rule.representative,
          blocking: blocking.name,
          tau,
          map: map.name,
        }
        const split = splits.get(`${blocking.name}|${tau}`) ?? null

        if (isIdentity(rule.table)) {
          decided.set(i, { ...base, verdict: 'proved', how: 'identity', checked: null })

          return
        }

        if (map.name === 'occupancy' && keepsOccupancy(rule.table)) {
          decided.set(i, { ...base, verdict: 'proved', how: 'occupancy', checked: null })

          return
        }

        if (isFullSwap(rule.table)) {
          const t = transportProof(fs, blocking, tau, split)

          if ((map.name === 'decimation' && t.decimation) || (map.name !== 'decimation' && t.symmetric)) {
            decided.set(i, { ...base, verdict: 'proved', how: 'transport', checked: null })

            return
          }
        }

        if (!split || map.name === 'decimation') {
          return
        }

        for (const { beta, u } of movers) {
          if (!readsLoneExcitation(map, beta, u, sizes)) {
            continue
          }

          theoremSplits++

          const witness = loneWitness({ frame, table: rule.table, colors, beta, u, tau, blocking, map, split })
          const checked = witness
            ? checkTilingWitness({ frame, table: rule.table, colors, beta, tau, blocking, map, witness })
            : false

          if (!witness || !checked) {
            theoremUnconfirmed++

            continue
          }

          witnesses.push({ fs, rule, tau, blocking, map, witness, beta })
          decided.set(i, { ...base, verdict: 'not', how: 'theorem', checked })

          return
        }
      })

      // the bounded search for every reading still open, per fixed background
      let open = readings.map((_, i) => i).filter(i => !decided.has(i))

      for (const beta of backgrounds) {
        if (open.length === 0) {
          break
        }

        const configs = [...boundedConfigs(ball1, beta, knobs.searchBall1), ...boundedConfigs(ball2, beta, knobs.searchBall2)]
        const found = witnessSearch({
          frame,
          table: rule.table,
          colors,
          beta,
          tau,
          configs,
          readings: open.map(i => readings[i]!),
        })

        found.forEach((witness, k) => {
          if (!witness) {
            return
          }

          const i = open[k]!
          const { blocking, map } = readings[i]!
          const checked = checkTilingWitness({ frame, table: rule.table, colors, beta, tau, blocking, map, witness })

          witnesses.push({ fs, rule, tau, blocking, map, witness, beta })
          decided.set(i, {
            tiling: fs.tiling,
            side: fs.side,
            variant: fs.variant,
            orientation: frame.orientation,
            rule: rule.name,
            representative: rule.representative,
            blocking: blocking.name,
            tau,
            map: map.name,
            verdict: 'not',
            how: 'search',
            checked,
          })
        })

        open = open.filter(i => !decided.has(i))
      }

      // proved cases are also searched: a witness there is a contradiction (gate)
      readings.forEach(({ blocking, map }, i) => {
        const row = decided.get(i) ?? {
          tiling: fs.tiling,
          side: fs.side,
          variant: fs.variant,
          orientation: frame.orientation,
          rule: rule.name,
          representative: rule.representative,
          blocking: blocking.name,
          tau,
          map: map.name,
          verdict: 'clean' as const,
          how: 'none' as const,
          checked: null,
        }

        rows.push(row)
      })
    }
  }

  return { rows, trackChecks, trackFailures, theoremSplits, theoremUnconfirmed, witnesses }
}

// a proved case searched anyway: no witness may exist
function provedContradictions(fs: FrameSet, all: readonly Rule[], rows: readonly LumpRow[], knobs: TilingKnobs): number {
  const { frame, colors } = fs
  const configsOf = new Map<number, Tones[]>()
  const ball1 = frame.ball(1)
  const ball2 = frame.ball(2)

  let contradictions = 0

  for (const row of rows) {
    if (row.verdict !== 'proved' || row.tiling !== fs.tiling || row.variant !== fs.variant || row.orientation !== frame.orientation) {
      continue
    }

    const rule = all.find(r => r.name === row.rule)!
    const { blocking } = fs.blockings.find(b => b.blocking.name === row.blocking)!
    const map = BLOCK_MAPS.find(m => m.name === row.map)!

    for (const beta of BACKGROUNDS.filter(b => fixesBackground(rule.table, b))) {
      let configs = configsOf.get(beta)

      if (!configs) {
        configs = [...boundedConfigs(ball1, beta, knobs.searchBall1), ...boundedConfigs(ball2, beta, knobs.searchBall2)]
        configsOf.set(beta, configs)
      }

      const [w] = witnessSearch({ frame, table: rule.table, colors, beta, tau: row.tau, configs, readings: [{ blocking, map }] })

      contradictions += w ? 1 : 0
    }
  }

  return contradictions
}

// ---- part C ----

type ContractRow = {
  tiling: string
  side: string
  variant: number
  rule: string
  representative: string
  color: number
  tau: number
  maps: string[]
  sigma: number[][]
  kind: 'identity' | 'onsite' | 'transport' | 'local'
  loneSpeed: boolean | null
}

type ContractGroup = { tiling: string; side: string; variant: number; rule: string; color: number; tau: number; tested: number; contracts: number; caps: number }

function declaredSections(): { sigma: number[]; maps: string[] }[] {
  const out = new Map<string, { sigma: number[]; maps: string[] }>()

  for (const map of BLOCK_MAPS) {
    for (const s of sections({ b: 2, map }).list) {
      const sigma = s.map(code => {
        const [a, b] = blockOfCode(code, 2) as [number, number]

        return patternCode(a, b)
      })
      const key = sigma.join(',')
      const hit = out.get(key)

      if (hit) {
        hit.maps.push(map.name)
      } else {
        out.set(key, { sigma, maps: [map.name] })
      }
    }
  }

  return [...out.values()]
}

const toPattern = (code: number): number[] => [Math.floor(code / 3) - 1, (code % 3) - 1]

type ClassCone = { cone: Cone; rep: number }

function classCones(fs: FrameSet, blocking: Blocking, tau: number): ClassCone[] {
  const seen = new Set<number>()
  const out: ClassCone[] = []

  for (const r of fs.reps) {
    const k = blocking.key(r)

    // one block per class of blocks: the block of each class representative (duplicates within an N-orbit are
    // harmless, they only repeat a check)
    if (seen.has(k)) {
      continue
    }

    seen.add(k)
    out.push({ cone: edgeCone({ frame: fs.frame, blocking, colors: fs.colors, tau, tile: r }), rep: r })
  }

  return out
}

const targetBlock = (cone: Cone): number => cone.blockOf[cone.target[0]]!

function holdsEverywhere(
  cones: readonly ClassCone[],
  table: PairTable,
  sigma: readonly number[],
  allowedOf: (cc: ClassCone) => (letters: Int8Array) => number,
  budget: number,
): 'holds' | 'fails' | 'cap' {
  let capped = false

  for (const cc of cones) {
    const v = coneHolds({ cone: cc.cone, table, sigma, allowed: allowedOf(cc), budget })

    if (v.verdict === 'fails') {
      return 'fails'
    }

    capped ||= v.verdict === 'cap'
  }

  return capped ? 'cap' : 'holds'
}

function nameContract(input: {
  fs: FrameSet
  blocking: Blocking
  tau: number
  cones: readonly ClassCone[]
  table: PairTable
  sigma: readonly number[]
  budget: number
}): { kind: ContractRow['kind']; loneSpeed: boolean | null } {
  const { fs, blocking, tau, cones, table, sigma, budget } = input
  const a = sigma.length
  const mask = sigmaMask(sigma)
  const letterOf = (code: number): number => sigma.indexOf(code)

  const exact = (cc: ClassCone, f: (letters: Int8Array) => number | null) => (letters: Int8Array) => {
    const t = f(letters)

    return t === null ? mask : 1 << sigma[t]!
  }

  if (holdsEverywhere(cones, table, sigma, cc => exact(cc, l => (l[targetBlock(cc.cone)]! < 0 ? null : l[targetBlock(cc.cone)]!)), budget) === 'holds') {
    return { kind: 'identity', loneSpeed: null }
  }

  // onsite: the image letter under the uniform configuration of each letter, per class
  const uniformImage = (cc: ClassCone, t: number): number =>
    letterOf(evaluateCone({ cone: cc.cone, table, sigma, letters: new Int8Array(cc.cone.blocks.length).fill(t) }))
  const onsite = holdsEverywhere(cones, table, sigma, cc => {
    const f = Array.from({ length: a }, (_, t) => uniformImage(cc, t))

    return exact(cc, l => (l[targetBlock(cc.cone)]! < 0 ? null : f[l[targetBlock(cc.cone)]!]!))
  }, budget)

  if (onsite === 'holds') {
    return { kind: 'onsite', loneSpeed: null }
  }

  // transport: one block whose single change alters the target's image, and the image is its letter
  const sources = cones.map(cc => {
    const influencing = new Set<number>()

    for (let t = 0; t < a; t++) {
      const letters = new Int8Array(cc.cone.blocks.length).fill(t)
      const base = evaluateCone({ cone: cc.cone, table, sigma, letters })

      for (let i = 0; i < letters.length; i++) {
        for (let t2 = 0; t2 < a; t2++) {
          if (t2 === t) {
            continue
          }

          letters[i] = t2

          if (evaluateCone({ cone: cc.cone, table, sigma, letters }) !== base) {
            influencing.add(i)
          }

          letters[i] = t
        }
      }
    }

    return influencing.size === 1 ? [...influencing][0]! : -1
  })

  if (sources.every(s => s >= 0)) {
    const transport = holdsEverywhere(cones, table, sigma, cc => {
      const s = sources[cones.indexOf(cc)]!

      return exact(cc, l => (l[s]! < 0 ? null : l[s]!))
    }, budget)

    if (transport === 'holds') {
      const loneSpeed = cones.every((cc, k) => {
        const sourceKey = cc.cone.blocks[sources[k]!]!
        const cells = blocking.cells(cc.rep)

        return cells.some(c => blocking.key(inverseMotion(fs.frame, fs.colors, c, tau)) === sourceKey)
      })

      return { kind: 'transport', loneSpeed }
    }
  }

  return { kind: 'local', loneSpeed: null }
}

type PartC = {
  rows: ContractRow[]
  groups: ContractGroup[]
  denseChecks: number
  denseMismatches: number
  identityControlFailures: number
  plantedWrongG: { tried: number; refused: number }
}

function partC(fs: FrameSet, all: readonly Rule[], knobs: TilingKnobs): PartC {
  const budget = knobs.contractBudget
  const declared = declaredSections()
  const rows: ContractRow[] = []
  const groups: ContractGroup[] = []

  let denseChecks = 0
  let denseMismatches = 0
  let identityControlFailures = 0

  const planted = { tried: 0, refused: 0 }

  for (let color = 0; color < fs.frame.p; color++) {
    const blocking = edgeBlocking(fs.frame, color)

    for (const tau of knobs.contractTaus) {
      const cones = classCones(fs, blocking, tau)

      for (const rule of all) {
        const group: ContractGroup = {
          tiling: fs.tiling,
          side: fs.side,
          variant: fs.variant,
          rule: rule.name,
          color,
          tau,
          tested: declared.length,
          contracts: 0,
          caps: 0,
        }

        let densePerGroup = 0

        for (const { sigma, maps } of declared) {
          const mask = sigmaMask(sigma)
          // uniform pre-test, an exact refusal when it fails
          const uniformOk = cones.every(cc =>
            [0, 1, 2].every(
              t => (mask & (1 << evaluateCone({ cone: cc.cone, table: rule.table, sigma, letters: new Int8Array(cc.cone.blocks.length).fill(t) }))) !== 0,
            ),
          )
          const v = uniformOk ? holdsEverywhere(cones, rule.table, sigma, () => () => mask, budget) : 'fails'

          if (isIdentity(rule.table) && v !== 'holds') {
            identityControlFailures++
          }

          if (v === 'cap') {
            group.caps++
          }

          if (v !== 'holds') {
            continue
          }

          group.contracts++

          const named = nameContract({ fs, blocking, tau, cones, table: rule.table, sigma, budget })

          if (isIdentity(rule.table) && named.kind !== 'identity') {
            identityControlFailures++
          }

          rows.push({
            tiling: fs.tiling,
            side: fs.side,
            variant: fs.variant,
            rule: rule.name,
            representative: rule.representative,
            color,
            tau,
            maps,
            sigma: sigma.map(toPattern),
            kind: named.kind,
            loneSpeed: named.loneSpeed,
          })

          // planted wrong G: a non-identity contract claimed as the identity must be refused
          if (named.kind !== 'identity' && planted.tried < 50) {
            planted.tried++

            const wrong = holdsEverywhere(cones, rule.table, sigma, cc => (letters: Int8Array) => {
              const t = letters[targetBlock(cc.cone)]!

              return t < 0 ? mask : 1 << sigma[t]!
            }, budget)

            planted.refused += wrong === 'fails' ? 1 : 0
          }

          // the dense path on structured configurations (uniform and single defects), first contracts of each group
          if (densePerGroup < 2) {
            densePerGroup++

            for (const cc of cones) {
              const k = cc.cone.blocks.length
              const configs: Int8Array[] = []

              for (let t = 0; t < 3; t++) {
                configs.push(new Int8Array(k).fill(t))

                for (let i = 0; i < Math.min(k, 12); i++) {
                  const l = new Int8Array(k).fill(t)

                  l[i] = (t + 1) % 3
                  configs.push(l)
                }
              }

              for (const letters of configs) {
                const start: Tones = new Map()

                cc.cone.cells.forEach((cell, i) => {
                  const code = sigma[letters[cc.cone.blockOf[i]!]!]!

                  start.set(cell, cc.cone.position[i] === 0 ? Math.floor(code / 3) - 1 : (code % 3) - 1)
                })

                const cells = blocking.cells(cc.rep)
                const dense = denseRead({ frame: fs.frame, table: rule.table, colors: fs.colors, beta: 0, start, rounds: tau, cells })

                denseChecks++
                denseMismatches +=
                  patternCode(dense.tones[0]!, dense.tones[1]!) === evaluateCone({ cone: cc.cone, table: rule.table, sigma, letters }) &&
                  dense.size === cc.cone.cells.length
                    ? 0
                    : 1
              }
            }
          }
        }

        groups.push(group)
      }
    }
  }

  return { rows, groups, denseChecks, denseMismatches, identityControlFailures, plantedWrongG: planted }
}

// ---- the run ----

type Run = {
  motion: MotionRow[]
  splits: SplitRow[]
  lump: LumpRow[]
  contracts: ContractRow[]
  groups: ContractGroup[]
  stats: {
    classes: number
    classFailures: number
    trackChecks: number
    trackFailures: number
    theoremSplits: number
    theoremUnconfirmed: number
    witnesses: number
    witnessFailures: number
    provedContradictions: number
    plantedWitnessRefused: number
    plantedWitnessTried: number
    denseChecks: number
    denseMismatches: number
    identityControlFailures: number
    plantedWrongGTried: number
    plantedWrongGRefused: number
  }
}

export function tilingCoarseGraining(input: {
  pairs?: typeof PAIRS
  contracts?: boolean
  knobs?: Partial<TilingKnobs>
  // read only these orientations (default both); the contracts run under the lifted one
  orientations?: readonly Orientation[]
  // read only these variants (default 0 and 1)
  variants?: readonly number[]
}): Run {
  const all = rules()
  const knobs: TilingKnobs = { ...DEFAULT_KNOBS, ...input.knobs }
  const run: Run = {
    motion: [],
    splits: [],
    lump: [],
    contracts: [],
    groups: [],
    stats: {
      classes: 0,
      classFailures: 0,
      trackChecks: 0,
      trackFailures: 0,
      theoremSplits: 0,
      theoremUnconfirmed: 0,
      witnesses: 0,
      witnessFailures: 0,
      provedContradictions: 0,
      plantedWitnessRefused: 0,
      plantedWitnessTried: 0,
      denseChecks: 0,
      denseMismatches: 0,
      identityControlFailures: 0,
      plantedWrongGTried: 0,
      plantedWrongGRefused: 0,
    },
  }

  for (const pair of input.pairs ?? PAIRS) {
    for (const [side, [p, q]] of [
      ['flat', pair.flat],
      ['hyperbolic', pair.hyperbolic],
    ] as const) {
      for (const variant of input.variants ?? VARIANTS) {
        for (const orientation of input.orientations ?? ORIENTATIONS) {
          const fs = frameSet(p, q, side, variant, orientation)

          run.stats.classes += fs.reps.length
          run.stats.classFailures += fs.reps.length === fs.frame.coloring.quotientTiles ? 0 : 1

          const splits = new Map<string, LoneSplit | null>()

          for (const { blocking, sizes } of fs.blockings) {
            for (const tau of TAUS) {
              const split = loneSplit({ frame: fs.frame, blocking, colors: fs.colors, tau, tiles: fs.reps })

              splits.set(`${blocking.name}|${tau}`, split)

              // P and the blocks do not depend on the orientation: record once
              if (orientation === 'lifted') {
                run.splits.push({ tiling: fs.tiling, side, variant, blocking: blocking.name, sizes, tau, split: split !== null })
              }
            }
          }

          if (orientation === 'lifted') {
            run.motion.push(...motionRows(fs))
          }

          const b = partB(fs, all, splits, knobs)

          run.lump.push(...b.rows)
          run.stats.trackChecks += b.trackChecks
          run.stats.trackFailures += b.trackFailures
          run.stats.theoremSplits += b.theoremSplits
          run.stats.theoremUnconfirmed += b.theoremUnconfirmed
          run.stats.witnesses += b.witnesses.length
          run.stats.witnessFailures += b.rows.filter(r => r.verdict === 'not' && r.checked !== true).length
          run.stats.provedContradictions += provedContradictions(fs, all, b.rows, knobs)

          // planted bad witnesses: unequal coarse starts, and a block where the futures agree
          const sample = b.witnesses[0]

          if (sample) {
            const { rule, tau, blocking, map, witness, beta } = sample
            const far = fs.frame.ball(4).at(-1)!
            const unequal: TilingWitness = { ...witness, right: [...witness.right, [far, beta === 1 ? -1 : 1]] }
            const sameBlock: TilingWitness = { ...witness, block: far }
            const ctx = { frame: fs.frame, table: rule.table, colors: fs.colors, beta, tau, blocking, map }

            run.stats.plantedWitnessTried += 2
            run.stats.plantedWitnessRefused +=
              (checkTilingWitness({ ...ctx, witness: unequal }) ? 0 : 1) + (checkTilingWitness({ ...ctx, witness: sameBlock }) ? 0 : 1)
          }

          if (orientation === 'lifted' && input.contracts !== false) {
            const c = partC(fs, all, knobs)

            run.contracts.push(...c.rows)
            run.groups.push(...c.groups)
            run.stats.denseChecks += c.denseChecks
            run.stats.denseMismatches += c.denseMismatches
            run.stats.identityControlFailures += c.identityControlFailures
            run.stats.plantedWrongGTried += c.plantedWrongG.tried
            run.stats.plantedWrongGRefused += c.plantedWrongG.refused
          }
        }
      }
    }
  }

  return run
}

// ---- comparisons ----

const countBy = <T>(xs: readonly T[], key: (x: T) => string): Record<string, number> => {
  const out: Record<string, number> = {}

  for (const x of xs) {
    out[key(x)] = (out[key(x)] ?? 0) + 1
  }

  return out
}

export default experiment({
  id: 'computation/tiling-coarse-graining',
  code: 'E-CMP-0069',
  title:
    'Block coarse-graining of the M1 pair rules on the coset tilings, flat against degree-matched hyperbolic: the lone-mover no-go, lumpability and exact simulation contracts with blocks from the tile group',
  category: 'computation',
  substrates: ['{4,4}', '{4,5}', '{6,3}', '{6,4}', '{3,6}', '{3,7}'],
  depth: 'L2',
  paper: false,
  run() {
    const r = tilingCoarseGraining({})

    const small = (): string => {
      const x = tilingCoarseGraining({ pairs: [PAIRS[2]!], contracts: true })

      return JSON.stringify([x.splits, x.lump.map(y => [y.rule, y.blocking, y.verdict, y.how]), x.contracts.map(y => [y.rule, y.kind])])
    }

    const identicalBytes = small() === small()
    const findings = LAB_FILES.flatMap(f => scanSource(f, readFileSync(resolve(BASE, f), 'utf8')))
    const s = r.stats

    // part A: where P^tau keeps every block
    const kept = r.splits.filter(x => !x.split)
    const keptBySide = countBy(kept, x => x.side)
    const splitRows = r.splits.length
    const keptList = kept.map(x => `${x.tiling} v${x.variant} ${x.blocking} tau ${x.tau}`)
    const hyperAut = r.motion.filter(x => x.side === 'hyperbolic' && (x.automorphism || x.identity || x.commutes.some(Boolean))).length
    const flatMotion = r.motion
      .filter(x => x.side === 'flat' && (x.identity || x.commutes.some(Boolean)))
      .map(x => `${x.tiling} v${x.variant} tau ${x.tau}: ${x.identity ? 'identity' : `commutes with M${x.commutes.map((c, i) => (c ? i : -1)).filter(i => i >= 0).join(',M')}`}`)

    // part B
    const verdicts = countBy(r.lump, x => `${x.side} ${x.verdict} ${x.how}`)
    const readMaps = new Set(['majority', 'netSign', 'netResidue'])
    const nonIdentity = r.lump.filter(x => x.representative !== 'id.ABC.id')
    const readNotNot = nonIdentity.filter(x => readMaps.has(x.map) && x.verdict !== 'not')
    const readNotNotBySide = countBy(readNotNot, x => `${x.side} ${x.verdict} ${x.how}`)
    const readNotNotList = [...new Set(readNotNot.map(x => `${x.tiling} v${x.variant} ${x.orientation} ${x.rule} ${x.blocking} t${x.tau} ${x.map} ${x.verdict}/${x.how}`))]
    const swapSign = r.lump.filter(x => x.rule === 'swap.CBA.swap' && x.map === 'netSign')
    const swapSignOk = swapSign.every(x => {
      const split = r.splits.find(y => y.tiling === x.tiling && y.variant === x.variant && y.blocking === x.blocking && y.tau === x.tau)!

      return split.split ? x.verdict === 'not' : x.verdict === 'proved'
    })
    const identityWitness = r.lump.filter(x => x.representative === 'id.ABC.id' && x.verdict !== 'proved').length
    const transportProved = r.lump.filter(x => x.how === 'transport')
    const transportBySide = countBy(transportProved, x => x.side)

    // part C
    const contractsBySide = countBy(r.contracts, x => `${x.side} v${x.variant} t${x.tau} ${x.kind}`)
    const caps = r.groups.reduce((n, g) => n + g.caps, 0)
    const nonIdentityContracts = r.contracts.filter(x => x.kind !== 'identity')
    const pairDiff = PAIRS.flatMap(pair =>
      VARIANTS.flatMap(variant =>
        CONTRACT_TAUS.map(tau => {
          const pick = (side: string, tiling: [number, number]): ContractRow[] =>
            r.contracts.filter(x => x.side === side && x.tiling === `{${tiling[0]},${tiling[1]}}` && x.variant === variant && x.tau === tau)
          const flat = pick('flat', pair.flat)
          const hyper = pick('hyperbolic', pair.hyperbolic)
          const classes = (xs: ContractRow[], kind: string): string =>
            [...new Set(xs.filter(x => x.kind === kind).map(x => x.representative))].sort().join(',') || '-'
          const kinds = ['identity', 'onsite', 'transport', 'local']

          return {
            label: `${`{${pair.flat.join(',')}}`}/${`{${pair.hyperbolic.join(',')}}`} v${variant} t${tau}`,
            flat: kinds.map(k => flat.filter(x => x.kind === k).length),
            hyper: kinds.map(k => hyper.filter(x => x.kind === k).length),
            transportClasses: [classes(flat, 'transport'), classes(hyper, 'transport')],
            localClasses: [classes(flat, 'local'), classes(hyper, 'local')],
          }
        }),
      ),
    )
    const transportNewSpeed = r.contracts.filter(x => x.kind === 'transport' && x.loneSpeed === false).length

    const checks: [boolean, string][] = [
      [s.classFailures === 0, `quotient classes missing in ${s.classFailures} frames`],
      [s.trackFailures === 0 && s.trackChecks > 0, `lone track failures ${s.trackFailures} of ${s.trackChecks}`],
      [s.theoremUnconfirmed === 0 && s.theoremSplits > 0, `theorem splits unconfirmed ${s.theoremUnconfirmed}`],
      [s.witnessFailures === 0, `witnesses failing the dense check ${s.witnessFailures}`],
      [swapSignOk, 'full swap netSign does not follow the split'],
      [identityWitness === 0, `identity rows not proved ${identityWitness}`],
      [s.provedContradictions === 0, `proved cases with a witness ${s.provedContradictions}`],
      [s.plantedWitnessTried > 0 && s.plantedWitnessRefused === s.plantedWitnessTried, `planted witnesses accepted ${s.plantedWitnessTried - s.plantedWitnessRefused}`],
      [s.plantedWrongGTried > 0 && s.plantedWrongGRefused === s.plantedWrongGTried, `planted wrong G accepted ${s.plantedWrongGTried - s.plantedWrongGRefused}`],
      [s.denseChecks > 0 && s.denseMismatches === 0, `dense contract mismatches ${s.denseMismatches}`],
      [s.identityControlFailures === 0, `identity contract control failures ${s.identityControlFailures}`],
      [identicalBytes, 'bytes differ'],
      [findings.length === 0, findings.map(f => `${f.file}:${f.line}`).join(' ')],
    ]
    const failures = checks.filter(([ok]) => !ok).map(([, why]) => why)
    const ok = failures.length === 0
    const diffText = pairDiff
      .map(d => `${d.label}: flat ${d.flat.join('/')} hyper ${d.hyper.join('/')} (transport ${d.transportClasses.join(' | ')}; local ${d.localClasses.join(' | ')})`)
      .join('; ')

    return verdict({
      status: ok ? 'pass' : 'fail',
      claim: `on the coset tilings under one schedule family (lifted colorings, two per tiling), the lone-mover no-go of the line holds on every hyperbolic blocking (P^tau splits a block in ${splitRows - kept.length} of ${splitRows} blocking x tau cases, ${keptBySide.hyperbolic ?? 0} kept on the hyperbolic side) but fails on ${keptBySide.flat ?? 0} flat ones, where the product of the matchings is a translation along one color (or the identity after 2 rounds on {3,6}); there the full swap is lumpable under every permutation-invariant block map with G a transport (${transportBySide.flat ?? 0} flat rows proved, ${transportBySide.hyperbolic ?? 0} hyperbolic), while every other non-identity rule under majority, netSign or netResidue has a dense-checked witness except ${readNotNot.length} rows; exact contracts on edge blocks (lifted orientation, tau 1, 75 sections) number ${r.contracts.length}, ${nonIdentityContracts.length} non-identity, ${transportNewSpeed} transports off the lone track, ${caps} undecided at the node budget`,
      metrics: {
        frames: PAIRS.length * 2 * VARIANTS.length * ORIENTATIONS.length,
        quotientClasses: s.classes,
        blockingTauCases: splitRows,
        keptFlat: keptBySide.flat ?? 0,
        keptHyperbolic: keptBySide.hyperbolic ?? 0,
        hyperbolicMotionCommuting: hyperAut,
        lumpRows: r.lump.length,
        notTheorem: r.lump.filter(x => x.how === 'theorem').length,
        notSearch: r.lump.filter(x => x.how === 'search').length,
        provedIdentity: r.lump.filter(x => x.how === 'identity').length,
        provedOccupancy: r.lump.filter(x => x.how === 'occupancy').length,
        provedTransportFlat: transportBySide.flat ?? 0,
        provedTransportHyperbolic: transportBySide.hyperbolic ?? 0,
        clean: r.lump.filter(x => x.verdict === 'clean').length,
        readingRowsNotRefused: readNotNot.length,
        trackChecks: s.trackChecks,
        theoremSplits: s.theoremSplits,
        witnesses: s.witnesses,
        contractGroups: r.groups.length,
        sectionsTested: r.groups.reduce((n, g) => n + g.tested, 0),
        contracts: r.contracts.length,
        nonIdentityContracts: nonIdentityContracts.length,
        onsiteContracts: r.contracts.filter(x => x.kind === 'onsite').length,
        transportContracts: r.contracts.filter(x => x.kind === 'transport').length,
        localContracts: r.contracts.filter(x => x.kind === 'local').length,
        transportOffLoneTrack: transportNewSpeed,
        contractCaps: caps,
        denseContractChecks: s.denseChecks,
        denseContractMismatches: s.denseMismatches,
        identicalBytes: identicalBytes ? 1 : 0,
        randomFindings: findings.length,
      },
      control: {
        identityRowsProved: r.lump.filter(x => x.representative === 'id.ABC.id' && x.verdict === 'proved').length,
        provedContradictions: s.provedContradictions,
        plantedWitnessRefused: s.plantedWitnessRefused,
        plantedWrongGRefused: s.plantedWrongGRefused,
        identityContractFailures: s.identityControlFailures,
      },
      notes:
        `Blocks kept by P^tau: ${keptList.join('; ') || 'none'}. Flat motion: ${flatMotion.join('; ') || 'none'}. Verdicts: ${JSON.stringify(verdicts)}. Reading rows not refused: ${JSON.stringify(readNotNotBySide)} ${readNotNotList.slice(0, 40).join('; ')}${readNotNotList.length > 40 ? ` (+${readNotNotList.length - 40})` : ''}. Contracts by side: ${JSON.stringify(contractsBySide)}. Pairs (identity/onsite/transport/local): ${diffText}. ${ok ? '' : `Failures: ${failures.join('; ')}`}`.trim(),
    })
  },
})
