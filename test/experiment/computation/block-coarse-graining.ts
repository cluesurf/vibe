// M11, effective higher-scale laws: block coarse-graining of the M1 pair rules
// on the line. Library: code/compute/lab/coarse-block.ts. A re-plan fixed every
// criterion below before the first run.
//
// PART A, lumpability: for each of the 24 spin-one rules and the 48 Z3-linear rules, each line schedule (brick2,
// brick3 forward, brick3 reverse), block size b in {2, 3, 4}, every block offset that is not a schedule translate,
// coarse step tau in {1, 2} rounds and each declared block map (majority, netSign, occupancy, netResidue,
// decimation): is F(Phi^tau x) a function of F(x) on the whole line? Exact on windows of 2R + 1 blocks (the fine cone
// fits), full enumeration up to 3^12 fine windows, a larger window searched up to 3^12 and read 'cap' when clean.
// A conflict is a witness, re-run on a ring by the independent round of code/rule/partitioned-pair.
//
// PART B, simulation contracts: for each spin-one rule, schedule, b in {2, 3}, offset, tau, and each section
// consistent with a declared map (for b = 2 also every injective section): does Phi^tau keep the configurations made
// of section blocks, and which coarse rule G does it induce there? G is named identity, shift, a coarse partitioned
// rule from the 24 or the 48 (fixed point when it is the rule itself), or local r. Speeds and coarse conserved
// quantities are compared with the fine rule's.
//
// Gates (fail the run): identity lumpable under every map (G identity) wherever the window is enumerated; full swap
// lumpable under decimation with |shift| 1 (brick2, b 2, tau 1, both offsets) and not lumpable under netSign; every
// witness re-run; every non-identity contract (and the first identity contract of each instance) re-derived on every
// configuration of a coarse ring of 6 cells by the fine ring run, 0 mismatches; planted corruptions of G and of a
// section caught; C-conjugate members agree under every C-commuting map; two runs give identical bytes; no random
// number in the lab files.

import { readFileSync } from 'node:fs'
import { resolve } from 'node:path'
import { scanSource } from '@/code/check/determinism'
import {
  BLOCK_MAPS,
  BlockMap,
  Candidate,
  Contract,
  EffectiveName,
  LINE_SCHEDULES,
  LineSchedule,
  blockOffsets,
  checkWitness,
  coarseConservation,
  contractFor,
  contractRingMismatches,
  effectiveNameKey,
  fineSpeeds,
  fraction,
  lumpability,
  nameEffective,
  sections,
  tableKeyOf,
} from '@/code/compute/lab/coarse-block'
import {
  PairTable,
  conjugateTable,
  conservesExcitation,
  negatePair,
  pairRuleCensus,
  pairRuleClasses,
} from '@/code/rule/pair-rule'
import { Z3Matrix, z3Det, z3LinearRule } from '@/code/rule/z3-linear-pair'
import { experiment } from '@/test/scaffold/suite'
import { verdict } from '@/test/scaffold/verdict'

const BASE = resolve(import.meta.dirname, '../../..')
const LAB_FILES = ['code/compute/lab/coarse-block.ts', 'test/experiment/computation/block-coarse-graining.ts']

// ---- parameters, fixed before the first run ----

const TAUS = [1, 2]
const LUMP_BLOCKS = [2, 3, 4]
const CONTRACT_BLOCKS = [2, 3]
const CAP = 3 ** 12
const RING = 6
const SPEED_RING = 54
const SPEED_PERIOD = 8

type Rule = {
  name: string
  table: PairTable
  family: 'spin1' | 'z3'
  representative: string
}

function rules(): Rule[] {
  const spin = pairRuleCensus().rules
  const classes = pairRuleClasses({ rules: spin })
  const repOf = new Map<string, string>()

  for (const c of classes) {
    for (const m of c.members) {
      repOf.set(m.name, c.representative.name)
    }
  }

  const out: Rule[] = spin.map(r => ({
    name: r.name,
    table: r.table,
    family: 'spin1',
    representative: repOf.get(r.name)!,
  }))

  for (let x = 0; x < 81; x++) {
    const m = [x % 3, Math.floor(x / 3) % 3, Math.floor(x / 9) % 3, Math.floor(x / 27) % 3] as unknown as Z3Matrix

    if (z3Det(m) !== 0) {
      const r = z3LinearRule(m)

      out.push({ name: r.name, table: r.table, family: 'z3', representative: r.name })
    }
  }

  return out
}

function candidates(all: readonly Rule[]): Candidate[] {
  const out: Candidate[] = []

  for (const rounds of [1, 2]) {
    for (const schedule of LINE_SCHEDULES) {
      for (const r of all) {
        out.push({ name: r.name, table: r.table, schedule, rounds })
      }
    }
  }

  return out
}

type LumpRow = {
  rule: string
  family: string
  schedule: string
  b: number
  offset: number
  tau: number
  map: string
  verdict: string
  windowCells: number
  windowsRead: number
  effective: string | null
  witness: { base: number; coarse: number[]; images: [number, number]; left: number[]; right: number[] } | null
  witnessChecked: boolean | null
  // decided from the C-conjugate rule's negated witness (re-run with this rule's table)
  byNegation?: boolean
}

type ContractGroup = {
  rule: string
  schedule: string
  b: number
  offset: number
  tau: number
  map: string
  sectionsTested: number
  contracts: number
  byName: Record<string, number>
}

type NontrivialContract = {
  rule: string
  schedule: string
  b: number
  offset: number
  tau: number
  map: string
  sigma: number[][]
  effective: string
  fixedPoint: boolean
  coarseSpeed: string | null
  speedNew: boolean | null
  conservation: { q: boolean; d: boolean; residue: boolean }
  newConserved: string[]
}

function patternOf(code: number, b: number): number[] {
  const out: number[] = []

  let x = code

  for (let k = 0; k < b; k++) {
    out.push((x % 3) - 1)
    x = Math.floor(x / 3)
  }

  return out
}

// Every input defaults to the parameters fixed above, which E-CMP-0066 runs; the batch driver (task/batch/block-coarse.ts)
// raises the cap, adds b = 4 contracts and tau 3.
export function blockCoarseGraining(input: {
  schedules?: readonly LineSchedule[]
  taus?: readonly number[]
  contracts?: boolean
  cap?: number
  lumpBlocks?: readonly number[]
  contractBlocks?: readonly number[]
  // read only these rules (by name); default all 24 spin-one and 48 Z3-linear rules
  only?: readonly string[]
}): {
  lump: LumpRow[]
  groups: ContractGroup[]
  nontrivial: NontrivialContract[]
  ringChecks: { contracts: number; configs: number; mismatches: number }
  corruption: { gCaught: boolean; sigmaCaught: boolean }
  fineSpeedsByRule: Record<string, string[]>
} {
  const schedules = input.schedules ?? LINE_SCHEDULES
  const taus = input.taus ?? TAUS
  const cap = input.cap ?? CAP
  const lumpBlocks = input.lumpBlocks ?? LUMP_BLOCKS
  const contractBlocks = input.contractBlocks ?? CONTRACT_BLOCKS
  const every = rules()
  // the candidates for naming an effective rule are always all 72, whatever subset is read
  const cands = candidates(every)
  const all = input.only ? every.filter(r => input.only!.includes(r.name)) : every
  const nameCache = new Map<string, EffectiveName>()

  const named = (g: readonly Int8Array[], radius: number, alphabet: readonly number[]): EffectiveName => {
    const key = `${alphabet.length}|${radius}|${g.map(x => Array.from(x).join('')).join('/')}`
    const hit = nameCache.get(key)

    if (hit) {
      return hit
    }

    const e = nameEffective({ g, radius, alphabet, candidates: cands })

    nameCache.set(key, e)

    return e
  }

  const lump: LumpRow[] = []

  for (const rule of all) {
    for (const schedule of schedules) {
      for (const b of lumpBlocks) {
        for (const offset of blockOffsets(b, schedule)) {
          for (const tau of taus) {
            for (const map of BLOCK_MAPS) {
              const r = lumpability({ table: rule.table, schedule, b, offset, tau, map, cap })
              const effective = r.g ? effectiveNameKey(named(r.g, r.radius, map.alphabet)) : null
              const witnessChecked = r.witness
                ? checkWitness({ table: rule.table, schedule, b, tau, map, witness: r.witness, radius: r.radius })
                : null

              lump.push({
                rule: rule.name,
                family: rule.family,
                schedule: schedule.name,
                b,
                offset,
                tau,
                map: map.name,
                verdict: r.verdict,
                windowCells: r.windowCells,
                windowsRead: r.windowsRead,
                effective,
                witness: r.witness
                  ? {
                      base: r.witness.base,
                      coarse: r.witness.coarse,
                      images: r.witness.images,
                      left: r.witness.left,
                      right: r.witness.right,
                    }
                  : null,
                witnessChecked,
              })
            }
          }
        }
      }
    }
  }

  // A 'cap' row is undecided only because the capped search runs in one counting order, which negation does not
  // keep. When the C-conjugate rule (same schedule, block, offset, step, a C-commuting map) has a witness, its
  // negation is a witness for this rule: re-run it on the ring with this rule's own table before using it.
  const spinRules = all.filter(r => r.family === 'spin1')
  const nameOfTable = new Map(spinRules.map(s => [tableKeyOf(s.table), s.name]))
  const tableOf = new Map(spinRules.map(s => [s.name, s.table]))
  const rowKey = (x: LumpRow, rule: string): string => `${rule}|${x.schedule}|${x.b}|${x.offset}|${x.tau}|${x.map}`
  const rowByKey = new Map(lump.map(x => [rowKey(x, x.rule), x]))

  for (const x of lump) {
    const map = BLOCK_MAPS.find(m => m.name === x.map)!

    if (x.verdict !== 'cap' || x.family !== 'spin1' || !map.negationSymmetric) {
      continue
    }

    const mateName = nameOfTable.get(tableKeyOf(conjugateTable(tableOf.get(x.rule)!, negatePair)))!
    const mateRow = rowByKey.get(rowKey(x, mateName))

    if (!mateRow?.witness) {
      continue
    }

    const schedule = schedules.find(s => s.name === x.schedule)!
    const radius = (x.windowCells / x.b - 1) / 2
    const flip = (v: number): number => (map.alphabet.includes(-v) ? -v : v)
    const negated = {
      phase: 0,
      base: mateRow.witness.base,
      left: mateRow.witness.left.map(v => -v),
      right: mateRow.witness.right.map(v => -v),
      coarse: mateRow.witness.coarse.map(flip),
      images: mateRow.witness.images.map(flip) as [number, number],
    }

    if (checkWitness({ table: tableOf.get(x.rule)!, schedule, b: x.b, tau: x.tau, map, witness: negated, radius })) {
      x.verdict = 'not'
      x.witness = {
        base: negated.base,
        coarse: negated.coarse,
        images: negated.images,
        left: negated.left,
        right: negated.right,
      }
      x.witnessChecked = true
      x.byNegation = true
    }
  }

  const groups: ContractGroup[] = []
  const nontrivial: NontrivialContract[] = []
  const ringChecks = { contracts: 0, configs: 0, mismatches: 0 }
  const fineSpeedsByRule: Record<string, string[]> = {}

  let sample: { rule: Rule; schedule: LineSchedule; b: number; offset: number; tau: number; contract: Contract; a: number } | null = null

  if (input.contracts !== false) {
    const families: { map: BlockMap | null; name: string }[] = [
      ...BLOCK_MAPS.map(map => ({ map, name: map.name })),
      { map: null, name: 'any' },
    ]

    for (const rule of all.filter(r => r.family === 'spin1')) {
      for (const schedule of schedules) {
        const speeds = fineSpeeds({ table: rule.table, schedule, n: SPEED_RING, maxPeriod: SPEED_PERIOD })

        fineSpeedsByRule[`${rule.name}/${schedule.name}`] = speeds

        for (const b of contractBlocks) {
          for (const offset of blockOffsets(b, schedule)) {
            for (const tau of taus) {
              for (const fam of families) {
                if (fam.map === null && b !== 2) {
                  continue
                }

                const { alphabet, list } = sections({ b, map: fam.map })
                const group: ContractGroup = {
                  rule: rule.name,
                  schedule: schedule.name,
                  b,
                  offset,
                  tau,
                  map: fam.name,
                  sectionsTested: list.length,
                  contracts: 0,
                  byName: {},
                }

                let checkedIdentity = false

                for (const sigma of list) {
                  const contract = contractFor({
                    table: rule.table,
                    schedule,
                    b,
                    offset,
                    tau,
                    alphabetSize: alphabet.length,
                    sigma,
                  })

                  if (!contract) {
                    continue
                  }

                  group.contracts++

                  const e = named(contract.g, contract.radius, alphabet)
                  const key = effectiveNameKey(e)

                  group.byName[key] = (group.byName[key] ?? 0) + 1

                  let subsetD = true

                  if (e.kind !== 'identity' || !checkedIdentity) {
                    const c = contractRingMismatches({
                      table: rule.table,
                      schedule,
                      b,
                      offset,
                      tau,
                      contract,
                      alphabetSize: alphabet.length,
                      m: RING,
                    })

                    ringChecks.contracts++
                    ringChecks.configs += c.configs
                    ringChecks.mismatches += c.mismatches
                    checkedIdentity ||= e.kind === 'identity'
                    subsetD = c.fineD

                    if (e.kind !== 'identity') {
                      sample ??= { rule, schedule, b, offset, tau, contract, a: alphabet.length }
                    }
                  }

                  if (e.kind === 'identity') {
                    continue
                  }

                  const conservation = coarseConservation({ g: contract.g, radius: contract.radius, alphabet, m: RING })
                  // new only when the fine run does not conserve D on the subset itself (a whole-space D would be
                  // conservesExcitation; a creating rule can still conserve D on a sigma subset)
                  const fineD = conservesExcitation(rule.table) || subsetD
                  const coarseSpeed = e.kind === 'shift' ? fraction(e.shift * b, tau) : null

                  nontrivial.push({
                    rule: rule.name,
                    schedule: schedule.name,
                    b,
                    offset,
                    tau,
                    map: fam.name,
                    sigma: sigma.map(code => patternOf(code, b)),
                    effective: key,
                    fixedPoint: e.kind === 'pair' && e.rule === rule.name,
                    coarseSpeed,
                    speedNew: coarseSpeed === null ? null : !speeds.includes(coarseSpeed),
                    conservation,
                    newConserved: conservation.d && !fineD && alphabet.length === 3 ? ['D'] : [],
                  })
                }

                groups.push(group)
              }
            }
          }
        }
      }
    }
  }

  // planted corruptions on the first non-identity contract (fail closed when there is none): one entry of G changed,
  // and one section block replaced by the first unused block that the window test refuses as a contract
  let gCaught = false
  let sigmaCaught = false

  if (sample) {
    const { rule, schedule, b, offset, tau, contract, a } = sample
    const g = contract.g.map(x => Int8Array.from(x))

    g[0]![0] = (g[0]![0]! + 1) % a
    gCaught =
      contractRingMismatches({ table: rule.table, schedule, b, offset, tau, contract: { ...contract, g }, alphabetSize: a, m: RING })
        .mismatches > 0

    const used = new Set(contract.sigma)

    for (let other = 0; other < 3 ** b; other++) {
      const sigma = [...contract.sigma]

      sigma[a - 1] = other

      if (used.has(other) || contractFor({ table: rule.table, schedule, b, offset, tau, alphabetSize: a, sigma })) {
        continue
      }

      sigmaCaught =
        contractRingMismatches({ table: rule.table, schedule, b, offset, tau, contract: { ...contract, sigma }, alphabetSize: a, m: RING })
          .mismatches > 0
      break
    }
  }

  return { lump, groups, nontrivial, ringChecks, corruption: { gCaught, sigmaCaught }, fineSpeedsByRule }
}

export default experiment({
  id: 'computation/block-coarse-graining',
  code: 'E-CMP-0066',
  title:
    'Block coarse-graining of the M1 pair rules on the line: lumpability of five declared block maps and exact simulation contracts, with the effective rule each gives',
  category: 'computation',
  substrates: ['line'],
  depth: 'L2',
  paper: false,
  run() {
    const r = blockCoarseGraining({})
    const small = (): string =>
      JSON.stringify(blockCoarseGraining({ schedules: [LINE_SCHEDULES[0]!], taus: [1], contracts: true }).lump.map(x => [x.rule, x.verdict, x.effective]))
    const identicalBytes = small() === small()
    const findings = LAB_FILES.flatMap(f => scanSource(f, readFileSync(resolve(BASE, f), 'utf8')))
    const row = (rule: string, schedule: string, b: number, offset: number, tau: number, map: string): LumpRow | undefined =>
      r.lump.find(x => x.rule === rule && x.schedule === schedule && x.b === b && x.offset === offset && x.tau === tau && x.map === map)
    const identityRows = r.lump.filter(x => x.rule === 'id.ABC.id')
    const identityOk = identityRows.every(x =>
      x.windowCells <= 12 ? x.verdict === 'lumpable' && x.effective === 'identity' : x.verdict === 'cap',
    )
    const swapDec = [0, 1].map(o => row('swap.CBA.swap', 'brick2', 2, o, 1, 'decimation'))
    const swapDecOk = swapDec.every(x => x?.verdict === 'lumpable' && (x.effective === 'shift 1' || x.effective === 'shift -1'))
    const swapSign = row('swap.CBA.swap', 'brick2', 2, 0, 1, 'netSign')
    const swapSignOk = swapSign?.verdict === 'not' && swapSign.witnessChecked === true
    const witnessesOk = r.lump.every(x => x.witness === null || x.witnessChecked === true)
    // C-conjugate members of the spin-one rules agree under every C-commuting map
    const spin = pairRuleCensus().rules
    const nameOfTable = new Map(spin.map(s => [tableKeyOf(s.table), s.name]))
    const cMate = new Map(spin.map(s => [s.name, nameOfTable.get(tableKeyOf(conjugateTable(s.table, negatePair)))!]))
    const symmetric = new Set(BLOCK_MAPS.filter(m => m.negationSymmetric).map(m => m.name))
    const byKey = new Map(r.lump.map(x => [`${x.rule}|${x.schedule}|${x.b}|${x.offset}|${x.tau}|${x.map}`, x.verdict]))
    // decided verdicts only: a 'cap' row is undecided, never a disagreement
    const mateVerdict = (x: LumpRow): string | undefined =>
      byKey.get(`${cMate.get(x.rule)}|${x.schedule}|${x.b}|${x.offset}|${x.tau}|${x.map}`)
    const cDisagreements = r.lump.filter(
      x =>
        x.family === 'spin1' &&
        symmetric.has(x.map) &&
        x.verdict !== 'cap' &&
        mateVerdict(x) !== 'cap' &&
        mateVerdict(x) !== x.verdict,
    ).length
    const byNegation = r.lump.filter(x => x.byNegation).length
    const lumpable = r.lump.filter(x => x.verdict === 'lumpable')
    const lumpableNonIdentity = lumpable.filter(x => x.rule !== 'id.ABC.id')
    const spinLumpableNontrivial = lumpable.filter(x => x.family === 'spin1' && x.effective !== 'identity')
    const caps = r.lump.filter(x => x.verdict === 'cap')
    const spinCaps = caps.filter(x => x.family === 'spin1' && x.rule !== 'id.ABC.id')
    // spin-one rules other than the identity lumpable under a symmetric reading map (not decimation), with the map
    const spinReadLumpable = [
      ...new Set(
        lumpable
          .filter(x => x.family === 'spin1' && x.rule !== 'id.ABC.id' && x.map !== 'decimation')
          .map(x => `${x.rule} under ${x.map} (${x.effective})`),
      ),
    ]
    const spinDecimation = [
      ...new Set(
        lumpable
          .filter(x => x.family === 'spin1' && x.rule !== 'id.ABC.id' && x.map === 'decimation')
          .map(x => x.rule),
      ),
    ]
    const fixedPoints = r.nontrivial.filter(x => x.fixedPoint)
    const newSpeeds = r.nontrivial.filter(x => x.speedNew === true)
    const newConserved = r.nontrivial.filter(x => x.newConserved.length > 0)
    const pairNamed = r.nontrivial.filter(x => x.effective.startsWith('pair'))
    const checks: [boolean, string][] = [
      [identityOk, 'identity rule not lumpable to identity'],
      [swapDecOk, `full swap decimation ${swapDec.map(x => `${x?.verdict}/${x?.effective}`).join(' ')}`],
      [swapSignOk, `full swap netSign ${swapSign?.verdict}`],
      [witnessesOk, 'a witness failed its ring re-run'],
      [r.ringChecks.mismatches === 0 && r.ringChecks.contracts > 0, `ring re-derivation mismatches ${r.ringChecks.mismatches}`],
      [r.corruption.gCaught && r.corruption.sigmaCaught, 'planted corruption accepted'],
      [cDisagreements === 0, `C-conjugate disagreements ${cDisagreements}`],
      [identicalBytes, 'bytes differ'],
      [findings.length === 0, findings.map(f => `${f.file}:${f.line}`).join(' ')],
    ]
    const failures = checks.filter(([ok]) => !ok).map(([, why]) => why)
    const ok = failures.length === 0
    const lumpSummary = [...new Set(lumpableNonIdentity.map(x => `${x.rule}/${x.map}/${x.schedule}/b${x.b}o${x.offset}t${x.tau}=${x.effective}`))]
    const contractSummary = [...new Set(r.nontrivial.map(x => `${x.rule}:${x.effective}`))]

    return verdict({
      status: ok ? 'pass' : 'fail',
      claim: `on the line, block coarse-graining of the 24 spin-one rules (b 2 to 4, tau 1 and 2, brick2 and brick3 both orders) gives a deterministic effective rule on the whole configuration space only for the identity, for ${spinReadLumpable.join(', ') || 'none'} under a reading map, and for ${spinDecimation.join(', ') || 'none'} under decimation (${spinLumpableNontrivial.length} non-identity effective rules, all coarse shifts of a free stream); every other case has a ring-checked witness (${byNegation} decided by the negated witness of the C-conjugate) except ${spinCaps.length} spin-one cases clean to the 3^12 cap; on declared subsets (simulation contracts, every section of the declared maps, b 2 and 3) ${r.nontrivial.length} non-identity contracts exist, ${pairNamed.length} named as a coarse pair rule, ${fixedPoints.length} renormalization fixed points, ${newSpeeds.length} with a coarse speed no lone fine tone has, ${newConserved.length} with a coarse D the fine rule lacks`,
      metrics: {
        lumpCases: r.lump.length,
        lumpable: lumpable.length,
        lumpableNonIdentity: lumpableNonIdentity.length,
        spinLumpableNontrivial: spinLumpableNontrivial.length,
        notLumpable: r.lump.filter(x => x.verdict === 'not').length,
        cap: caps.length,
        contractGroups: r.groups.length,
        sectionsTested: r.groups.reduce((s, g) => s + g.sectionsTested, 0),
        contracts: r.groups.reduce((s, g) => s + g.contracts, 0),
        nontrivialContracts: r.nontrivial.length,
        pairNamedContracts: pairNamed.length,
        fixedPoints: fixedPoints.length,
        newSpeedContracts: newSpeeds.length,
        newConservedContracts: newConserved.length,
        ringCheckedContracts: r.ringChecks.contracts,
        ringConfigs: r.ringChecks.configs,
        ringMismatches: r.ringChecks.mismatches,
        cDisagreements,
        capDecidedByNegation: byNegation,
        identicalBytes: identicalBytes ? 1 : 0,
        randomFindings: findings.length,
      },
      control: {
        identityLumpable: identityRows.filter(x => x.verdict === 'lumpable').length,
        swapDecimationLumpable: swapDec.filter(x => x?.verdict === 'lumpable').length,
        swapNetSignWitness: swapSignOk ? 1 : 0,
        corruptedGCaught: r.corruption.gCaught ? 1 : 0,
        corruptedSigmaCaught: r.corruption.sigmaCaught ? 1 : 0,
      },
      notes:
        `Lumpable beyond the identity: ${lumpSummary.slice(0, 60).join('; ')}${lumpSummary.length > 60 ? ` (+${lumpSummary.length - 60})` : ''}. Contract rules: ${contractSummary.slice(0, 80).join('; ')}${contractSummary.length > 80 ? ` (+${contractSummary.length - 80})` : ''}. ${ok ? '' : `Failures: ${failures.join('; ')}`}`.trim(),
    })
  },
})
