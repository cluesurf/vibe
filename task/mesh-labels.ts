// The mesh each experiment builds, and the grade its verdict can carry (vibe-roadmap-board-0024).
//
// Reads every row of test/registry.csv, finds the meshes the experiment's code builds (task/mesh-reach.ts, which
// follows the code, never the title or the `3434` tag), and grades each mesh by honeycomb decisions 001 and 002:
//
//   box-specific   the flat D4 box (or the flat D4 lattice): a result there is box-specific until it is rerun on the
//                  honeycomb (decision 001, keys 6)
//   periodic       a finite quotient of the honeycomb, or the cusp modulo its translations: exact for any number of
//                  beats, but only for states that repeat under the subgroup (decision 002)
//   honeycomb      a ball or a cusp region of the honeycomb read within its horizon (beats <= radius), or read for
//                  geometry alone (shells, labels, distances)
//   mirrored       a ball or a cusp region read past its horizon, where the frontier answers (decision 002)
//                  (an open honeycomb line read while no love reaches an end is honeycomb too: LINE_HORIZON)
//   unread         a ball, a cusp region or an open honeycomb line whose horizon nobody has checked yet
//   stand-in       a cubic grid, a ring or line, or another graph: not the model's mesh
//   no-mesh        algebra, one dock, or a closed form: no mesh built
//
// The honeycomb and mirrored grades need a reading of the run's beats against its radius, so they come from the
// HORIZON table below, each with its reason. Every other grade follows from the mesh.
//
// Writes test/mesh.csv (code, mesh, grade, rule, vacuum, evidence) only with --commit. Without it, checks that every
// registry code has a row, that every row's mesh, grade and evidence equal what the code builds today, and that no row
// names a code the registry lacks. Exit 1 on any difference.
//
//   pnpm exec tsx task/mesh-labels.ts            check
//   pnpm exec tsx task/mesh-labels.ts --commit   write test/mesh.csv
//   pnpm exec tsx task/mesh-labels.ts --counts   also print the counts per mesh and grade

import { existsSync, readFileSync, writeFileSync } from 'node:fs'
import { dirname, join, resolve } from 'node:path'
import { fileURLToPath } from 'node:url'
import { MeshReader, type MeshKind, type MeshReach } from './mesh-reach'

const cwd = process.cwd()
const root = existsSync(join(cwd, 'test', 'registry.csv'))
  ? cwd
  : resolve(dirname(fileURLToPath(import.meta.url)), '..')
const registryPath = join(root, 'test', 'registry.csv')
const labelPath = join(root, 'test', 'mesh.csv')
const commit = process.argv.includes('--commit')
const showCounts = process.argv.includes('--counts')

type Grade =
  | 'box-specific'
  | 'periodic'
  | 'honeycomb'
  | 'mirrored'
  | 'unread'
  | 'stand-in'
  | 'no-mesh'

// ball and cusp-region runs whose beats were read against their radius (decision 002: t <= R is honeycomb)
const HORIZON: Record<string, [Grade, string]> = {
  'E-GMT-0040': ['honeycomb', 'geometry only: shells, labels, triangles and squares'],
  'E-GMT-0041': ['honeycomb', 'the cusp quotient is compared with the exact ball only while t <= F - depth'],
  'E-RLT-0121': ['mirrored', 'R = 4 ball, 96 inverse beats and period-4 orbits read past t = 4 through the frontier'],
  'E-FND-0178': ['honeycomb', 'R = 4 ball, 3 beats'],
  'E-FND-0179': ['honeycomb', 'R = 3 and R = 4 balls, 3 beats'],
  'E-FND-0180': ['honeycomb', "reruns E-FND-0179's ball gates, 3 beats"],
  'E-SPN-0156': ['mirrored', 'balls of R = 3 and 4, 48 beats; the holonomy reads are geometry'],
  'E-SPN-0157': ['mirrored', 'R = 4 ball, 96 beats'],
  'E-SPN-0158': ['mirrored', 'an 8-beat walk on the ball; the shadow reads are geometry'],
  'E-SPN-0181': ['mirrored', '8 beats on a finite cusp region with depth cuts'],
  'E-SPN-0182': ['honeycomb', 'ball reads are labels only; the bands are on the cusp quotient'],
  'E-SPN-0184': ['honeycomb', 'ball reads are labels only; the count is on the cusp quotient'],
  'E-SLF-0183': ['mirrored', 'L1 and O1: R 3 and R 2 balls, 4 beats, read past t = R through the frontier'],
  'E-SLF-0186': ['honeycomb', 'X0: R = 4 ball, 2 beats from radius 1, 0 frontier hits; the R 1 to R 3 balls check the rule exactly (reversal, norm, sparse = dense, reduction), they are not read'],
  'E-SLF-0185': ['honeycomb', 'W0: R = 1 ball, 1 beat from the centre; X2: R = 2 ball, 2 beats from the centre, t <= R; X1 reverses 2 beats on the R = 1 ball exactly (reversal and norm), not read'],
  'E-SLF-0187': ['honeycomb', 'R = 4 ball: a lone love from the centre 3 beats (N1, S3), the cut start and W0 dock 2 beats from radius 1 (I0, S4), the empty ball 3 beats (S2), r0 + t <= R - 1, 0 frontier hits'],
  'E-SLF-0189': ['honeycomb', 'motion: one lone love from the centre of the R = 4 ball, beats 1 to 4, t <= R, 0 frontier hits (M0); V: the empty R = 4 ball, 4 beats; the R = 2 ball reads the kernel from the centre, 1 beat (K1); X1 reverses 2 beats on the R = 1 ball exactly (reversal and norm), not read'],
  'E-SLF-0191': ['honeycomb', 'R = 4 ball: a lone love from the centre 3 beats (N1, and 0004 S3 reported), the cut start and W0 dock 2 beats from radius 1 (I0, S4), the empty ball 3 beats (S2), r0 + t <= R - 1, 0 frontier hits'],
  'E-SLF-0197': ['honeycomb', "E-SLF-0191's ball gates under both readers: a lone love from the centre 3 beats (N1), the cut start and W0 dock 2 beats from radius 1 (I0, S4), the empty ball 3 beats (S2), r0 + t <= R - 1, 0 frontier hits"],
  'E-SLF-0190': ['honeycomb', 'motion: a comoving pair from the centre and distance 1 of the R = 4 ball, beats 1 to 3, t + r0 <= R, and a lone love from the centre, beats 1 to 4, 0 frontier hits (K3); the R = 2 ball reads the kernels and checks the pair engine against the branch code, 1 beat from distance 1 or 2 beats from the centre (K1P); X1 reverses on the R = 1 ball exactly, V0 and V1 compare the R = 2 ball exactly, not read'],
  'E-SLF-0192': ['honeycomb', 'R = 4 ball: the cut start and the hand starts from radius 1 for R - 1 beats and W0 dock from the centre for 3, r0 + t <= R, 0 frontier hits (I2); the R = 2 ball checks the sparse beats against the branch code, 1 beat from radius 1 (I1); the (sqrt 2)^6 quotient is coloured only, geometry, no rule runs'],
  'E-SLF-0195': ['honeycomb', 'R = 4 ball: the cut start and the hand starts R - r0 beats from radius 0, 1 or 2, every held dock at distance <= R - 1 before every stream, 0 frontier hits (I2); the R = 2 ball checks the instrumented beat and lock against the branch code, 1 beat, not read'],
  'E-FRC-0317': ['honeycomb', 'geometry only: the plaquette slot patterns from the R = 2 ball; the ensembles run on the cusp quotient, where the floor is felt'],
  'E-FRC-0318': ['honeycomb', "geometry only: E-FRC-0317's plaquette slot patterns from the R = 2 ball; the ensembles run on the cusp quotient, where the floor is felt"],
  'E-FRC-0321': ['honeycomb', 'rerun of E-FRC-0320 (same reads, same horizons); the two-body read and the C, P, CP table run 2 beats on the exact R = 2 ball from the base dock, t <= R, no frontier hits; the binding ensembles run on the cusp quotient, where the floor is felt'],
  'E-FRC-0320': ['honeycomb', 'motion: one lone love from the centre of the R = 4 ball, beats 1 to 4, t <= R, 0 frontier hits (K3); the R = 2 ball reads the kernel and checks it against the branch code (K1), 2 beats from the centre or 1 beat from distance 1, t + r0 <= R; the binding ensembles run on the cusp quotient, where the floor is felt'],
  'E-QTM-0199': ['honeycomb', 'R = 4 ball, 4 beats from the centre on one line, end hits 0 (I4); its LINE arm is an inline open line of 71 docks equal to the ball term for term over 4 beats (I5), 32 beats, end hits 0'],
  'E-NVG-0014':['mirrored', 'R = 4 ball, 8 beats, absorbing and reflecting frontiers'],
  'E-CSM-0058': ['honeycomb', 'R = 4 ball, beats 0 to 4'],
  'E-CSM-0059': ['honeycomb', 'breadth-first counts, no rule'],
  'E-CSM-0060': ['honeycomb', 'horosphere counting, geometry only'],
  'E-GRV-0154': ['honeycomb', 'geometry only: the labelled region only builds the cusp column (a copy of buildCuspQuotient), no rule runs; the static solves are on the cusp quotient'],
  'E-GRV-0155': ['honeycomb', 'E-GRV-0154 rerun with a relative residual gate: geometry only, the labelled region only builds the cusp column, no rule runs'],
  'E-SPN-0220': ['honeycomb', 'exact R = 3 ball (8,857 docks), 1 beat from radius <= 2, 0 frontier hits'],
  'E-RLT-0122': ['honeycomb', 'exact R = 2 and R = 3 balls, V1 fixed point + cusp lateral link count m_D (geometry only)'],
  'E-GMT-0045': ['honeycomb', 'exact R = 2 ball (481 docks), 1 beat from base dock, 24 exact Z[sqrt 2] cusps'],
  'E-GMT-0046': ['honeycomb', 'exact R = 2 and R = 3 balls, geometry only (shell recurrence and loop holonomy)'],
  'E-FND-0181': ['honeycomb', 'exact R = 2 ball (481 docks), 1 beat from base dock, 0 frontier hits'],
  'E-FND-0182': ['mirrored', 'exact R = 2 and R = 3 balls evolved to t = R specifically to test boundary-condition crossover past horizon'],
  'E-FND-0183': ['honeycomb', 'exact R = 2 ball (481 docks), 1 beat from base dock, 0 frontier hits'],
  'E-FND-0184': ['honeycomb', 'exact R = 2 ball (481 docks), 1 beat from base dock, distinct chi_odd pair, 0 frontier hits'],
  'E-QTM-0203': ['honeycomb', 'exact R = 3 ball (8,857 docks), 3 beats from base dock inside proven window m + 2t <= L, 0 frontier hits'],
  'E-QTM-0205': ['honeycomb', 'exact R = 2 ball (481 docks), 1 beat from base dock, 0 frontier hits'],
  'E-SLF-0199': ['honeycomb', 'exact R = 3 ball (8,857 docks), 1 beat from base dock via slot-sparse engine, 0 frontier hits'],
  'E-SLF-0200': ['honeycomb', 'exact R = 3 ball (8,857 docks), 3 beats from base dock (t <= R, 0 frontier hits), plus L = 32 sparse error-boundary bath check'],
  'E-RLT-0123': ['honeycomb', 'exact R = 3 ball (8,857 docks), 3 beats from base dock projected to cusp chart (t <= R, 0 frontier hits), plus exact 24x24 cusp Bloch dispersion'],
}

// open honeycomb-line runs whose beats were read against the line's length: the run is the infinite line of empty
// docks, so honeycomb, only while no love reaches an end; past that the ends answer, so mirrored
const LINE_HORIZON: Record<string, [Grade, string]> = {
  'E-SLF-0183': ['honeycomb', 'open line of Lo docks run T = floor((Lo - width) / 2) beats; I3: the far-link weight is exactly 0 every beat'],
  'E-SLF-0184': ['honeycomb', 'open line of max(256, width + 2 beats + 2) docks; E3: no love reaches an end (end hits 0)'],
  'E-SLF-0186': ['honeycomb', 'open line of max(64, width + 2 beats + 8) docks from offset 4, 2 beats: no love reaches an end'],
  'E-SLF-0185': ['honeycomb', 'open line of max(256, width + 2 beats + 2) docks from offset beats + 1; the mixers read beats 0 to 2 (Lemma W), the bare rule to beat 4 or 11: no love reaches an end'],
  'E-SLF-0187': ['honeycomb', 'S1: open line of width + 2T + 12 docks from offset T + 5, T = 96 beats; the arms: max(64, width + 2 beats + 8) docks from offset 4, 2 beats (Lemma W): no love reaches an end (the free null throws if one does)'],
  'E-SLF-0188': ['honeycomb', 'open line of 32 docks: E1 runs 6 beats from 7 docks off each end, the dark set reads windows at docks 11 to 19 to tau 10; D-exact: the end weight is exactly 0'],
  'E-SLF-0189': ['honeycomb', 'open line of max(256, width + 2 beats + 2) docks from offset beats + 1: no love reaches an end; with a theta mixer the line self is honeycomb-exact to beat 2 (Lemma W) and line-restricted after (exported weight never returns)'],
  'E-SLF-0191': ['honeycomb', "S1: open line of width + 2T + 12 docks from offset T + 5, T = 96 beats; S3': a lone love on an open line of 2T + 12 docks from dock T + 5, T = 96 beats; the arms: max(64, width + 2 beats + 8) docks from offset 4, 2 beats (Lemma W): no love reaches an end (the free null throws if one does)"],
  'E-SLF-0190': ['honeycomb', 'open line of max(256, width + 2 beats + 2) docks from offset beats + 1: no love reaches an end; with the locked mixer the line self is honeycomb-exact to beat 2 (Lemma W) and line-restricted after (exported weight never returns)'],
  'E-SLF-0193': ['honeycomb', 'E-SLF-0188 rerun with a size-scaled E4: open line of 32 docks, E1 runs 6 beats from 7 docks off each end, the dark set reads windows at docks 11 to 19 to tau 10; D-exact: the end weight is exactly 0'],
  'E-SLF-0194': ['honeycomb', "the arms: open line of width + 2T + 12 docks from offset T + 5, T = 80 beats (E-SLF-0191's S1 line); the bath arm: max(256, width + 2 beats + 2) docks from offset beats + 1, 11 beats: no love reaches an end (the free null throws if one does); the register is a model piece beside the line"],
  'E-SLF-0197': ['honeycomb', "S1: open line of width + 2T + 12 docks from offset T + 5, T = 96 beats; S3': a lone love on an open line of 2T + 12 docks from dock T + 5, T = 96 beats; E-SLF-0194's arms and their reference: width + 2T + 12 docks from offset T + 5, T = 80 beats; the two-beat arms and mixers: max(64, width + 2 beats + 8) docks from offset 4, 2 beats (Lemma W): no love reaches an end (the free null throws if one does); the register is a model piece beside the line"],
}

const CUSP_QUOTIENT =/honeycomb-cusp:(cuspQuotient|buildCuspQuotient|buildExactCusp|cuspTranslations)\b/

function gradeOf(code: string, mesh: MeshKind, reach: MeshReach): Grade {
  switch (mesh) {
    case 'd4-box':
      return 'box-specific'
    case 'honeycomb-quotient':
      return 'periodic'
    case 'honeycomb-cusp':
      if (CUSP_QUOTIENT.test(reach.evidence.join(' '))) {
        return 'periodic'
      }

      return HORIZON[code]?.[0] ?? 'unread'
    case 'honeycomb-ball':
      return HORIZON[code]?.[0] ?? 'unread'
    case 'honeycomb-line':
      return LINE_HORIZON[code]?.[0] ?? 'unread'
    case 'cubic':
    case 'ring':
    case 'other':
      return 'stand-in'
    case 'none':
      return 'no-mesh'
  }
}

type Bijectivity = 'bijective' | 'injective' | 'lossy' | 'static'

const LOSSY_RE =
  /\b(dephasedBeat|dephasedStart|THRESHOLD_BORN|fullKeyPaths|full-key-paths|lindblad|Lindblad|calm_open|absorbing|traceOut|partialTrace|collapse|error-boundary|runBoundary|runSparseBoundary)\b/
const INJECTIVE_RE = /\b(growth-vacuum|growMesh|appendLayer|addShell|growBall)\b/

function bijectivityOf(file: string, rule: string): Bijectivity {
  if (rule === 'none') return 'static'
  const full = join(root, file)
  if (!existsSync(full)) return 'bijective'
  const src = readFileSync(full, 'utf8')
  if (LOSSY_RE.test(src)) return 'lossy'
  if (INJECTIVE_RE.test(src)) return 'injective'
  return 'bijective'
}

type Row = {
  code: string
  mesh: string
  grade: string
  rule: string
  vacuum: string
  evidence: string
  bijectivity: Bijectivity
}

const HEADER = 'code,mesh,grade,rule,vacuum,evidence,bijectivity'
const quote = (s: string): string => (/[",\n]/.test(s) ? `"${s.replace(/"/g, '""')}"` : s)

function parseCsvLine(line: string): string[] {
  const out: string[] = []
  let field = ''
  let quoted = false

  for (let i = 0; i < line.length; i++) {
    const c = line[i]!

    if (quoted) {
      if (c === '"' && line[i + 1] === '"') {
        field += '"'
        i++
      } else if (c === '"') {
        quoted = false
      } else {
        field += c
      }
    } else if (c === '"') {
      quoted = true
    } else if (c === ',') {
      out.push(field)
      field = ''
    } else {
      field += c
    }
  }

  out.push(field)

  return out
}

const reader = new MeshReader(root)
const missing = reader.missingBuilders()

if (missing.length > 0) {
  console.error(`mesh-labels: builders not found (renamed or moved?): ${missing.join(', ')}`)
  process.exit(1)
}

const registry = readFileSync(registryPath, 'utf8')
  .trim()
  .split('\n')
  .slice(1)
  .map(line => {
    const cells = parseCsvLine(line)

    return { code: cells[0]!, file: cells[cells.length - 1]!.trim() }
  })

const rows: Row[] = registry.map(({ code, file }) => {
  const reach = reader.read(file)
  const meshes = reach.meshes
  const rule = reach.workingRule ? 'working' : reach.runsRule ? 'other' : 'none'

  return {
    code,
    mesh: meshes.join(' '),
    grade: meshes.map(m => gradeOf(code, m, reach)).join(' '),
    rule,
    vacuum: reach.boxStore ? 'box-store' : '',
    evidence: reach.evidence.join(' '),
    bijectivity: bijectivityOf(file, rule),
  }
})

// a HORIZON entry whose code no longer builds a ball or a cusp region is stale
const stale = Object.keys(HORIZON).filter(code => {
  const row = rows.find(r => r.code === code)

  return row === undefined || !/honeycomb-(ball|cusp)/.test(row.mesh)
}).concat(
  Object.keys(LINE_HORIZON).filter(code => {
    const row = rows.find(r => r.code === code)

    return row === undefined || !/honeycomb-line/.test(row.mesh)
  }),
)

if (showCounts || commit) {
  const perMesh = new Map<string, number>()
  const perGrade = new Map<string, number>()
  const perLabel = new Map<string, number>()
  const perBij = new Map<string, number>()

  for (const row of rows) {
    perLabel.set(`${row.mesh} | ${row.grade}`, (perLabel.get(`${row.mesh} | ${row.grade}`) ?? 0) + 1)
    perBij.set(row.bijectivity, (perBij.get(row.bijectivity) ?? 0) + 1)

    for (const m of new Set(row.mesh.split(' '))) {
      perMesh.set(m, (perMesh.get(m) ?? 0) + 1)
    }

    for (const g of new Set(row.grade.split(' '))) {
      perGrade.set(g, (perGrade.get(g) ?? 0) + 1)
    }
  }

  const show = (m: Map<string, number>): string =>
    [...m]
      .sort((a, b) => b[1] - a[1])
      .map(([k, v]) => `  ${String(v).padStart(5)}  ${k}`)
      .join('\n')

  console.log(`experiments per mesh (an experiment on two meshes counts in both):\n${show(perMesh)}`)
  console.log(`experiments per grade:\n${show(perGrade)}`)
  console.log(`experiments per bijectivity (m-15):\n${show(perBij)}`)
  console.log(`experiments per exact label:\n${show(perLabel)}`)
}

if (commit) {
  const text = [
    HEADER,
    ...rows.map(r =>
      [r.code, r.mesh, r.grade, r.rule, r.vacuum, r.evidence, r.bijectivity].map(quote).join(','),
    ),
  ].join('\n')

  writeFileSync(labelPath, `${text}\n`)
  console.log(`mesh-labels  wrote ${rows.length} rows to test/mesh.csv${stale.length > 0 ? `, ${stale.length} stale HORIZON entries: ${stale.join(' ')}` : ''}`)
  process.exit(stale.length > 0 ? 1 : 0)
}

if (!existsSync(labelPath)) {
  console.error('mesh-labels: test/mesh.csv is missing (run with --commit)')
  process.exit(1)
}

const written = new Map<string, Row>()

for (const line of readFileSync(labelPath, 'utf8').trim().split('\n').slice(1)) {
  const [code, mesh, grade, rule, vacuum, evidence, bijectivity] = parseCsvLine(line)

  written.set(code!, {
    code: code!,
    mesh: mesh!,
    grade: grade!,
    rule: rule!,
    vacuum: vacuum!,
    evidence: evidence!,
    bijectivity: (bijectivity ?? 'static') as Bijectivity,
  })
}

let unlabeled = 0
let differ = 0

for (const row of rows) {
  const have = written.get(row.code)

  if (have === undefined) {
    unlabeled++
    console.log(`  unlabeled  ${row.code}  builds ${row.mesh}`)
    continue
  }

  for (const field of ['mesh', 'grade', 'rule', 'vacuum', 'evidence', 'bijectivity'] as const) {
    if (have[field] !== row[field]) {
      differ++
      console.log(`  differs    ${row.code}  ${field}: label '${have[field]}', code '${row[field]}'`)
    }
  }
}

const registryCodes = new Set(registry.map(r => r.code))
const orphans = [...written.keys()].filter(code => !registryCodes.has(code))

for (const code of orphans) {
  console.log(`  orphan     ${code}  labeled but not in test/registry.csv`)
}

for (const code of stale) {
  console.log(`  stale      ${code}  has a HORIZON grade but builds no ball or cusp region`)
}

const honeycomb = rows.filter(r => /honeycomb-/.test(r.mesh)).length
const boxOnly = rows.filter(r => r.mesh === 'd4-box').length

console.log(
  `\nmesh-labels  ${rows.length} registry codes, ${written.size} labels, ${unlabeled} unlabeled, ${differ} fields differ from the code, ${orphans.length} orphans, ${stale.length} stale horizon grades; ${honeycomb} touch the honeycomb, ${boxOnly} run on the box alone`,
)

process.exit(unlabeled + differ + orphans.length + stale.length > 0 ? 1 : 0)
