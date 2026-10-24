// Run one part of E-RLT-0120 (axes, plane or generic) and write it to test/record/E-RLT-0120/rlt120-<part>.json as each
// read lands, its log beside it (rlt120-<part>.log). A part on disk that is not finished is resumed; a finished one is
// never overwritten. The native kernel's threads come from THREADS (default 3). With --smoke the tiny pair
// (SMOKE_STAGE, SMOKE_PARTS) is run instead and written to the package's tmp/rlt120-smoke/, never to the record.
//
//   THREADS=3 node node_modules/tsx/dist/cli.mjs --tsconfig tsconfig.json test/record/E-RLT-0120/run/run.ts <part> [--smoke]

import { appendFileSync, existsSync, mkdirSync, readFileSync, writeFileSync } from 'node:fs'
import { bandRun, type BandPart } from '@/code/measure/band-curvature'
import { setup } from '@/code/measure/register-track'
import {
  PARTS,
  RECORD,
  SMOKE_PARTS,
  SMOKE_STAGE,
  STAGE,
  partPath,
} from '@/test/experiment/relativity/bound-pair-size-isotropy'

const smoke = process.argv.includes('--smoke')
const name = process.argv[2] ?? ''
const plans = (smoke ? SMOKE_PARTS : PARTS)[name]
const stage = smoke ? SMOKE_STAGE : STAGE
const dir = smoke ? `${import.meta.dirname}/../../../../tmp/rlt120-smoke` : RECORD
const threads = Number(process.env.THREADS ?? 3)

if (!plans) {
  throw new Error(`run: no part "${name}" (parts: ${Object.keys(PARTS).join(', ')})`)
}

if (!Number.isInteger(threads) || threads < 1) {
  throw new Error(`run: THREADS must be a positive integer, not ${process.env.THREADS}`)
}

mkdirSync(dir, { recursive: true })

const path = partPath(name, dir)
const logPath = path.replace(/\.json$/, '.log')
const have = existsSync(path) ? (JSON.parse(readFileSync(path, 'utf8')) as BandPart) : undefined
const finished = (p: BandPart): boolean =>
  plans.every(
    q =>
      p.zero[q.name] &&
      q.kappas.every(k => p.moved.some(m => m.name === q.name && m.kappa === k)) &&
      q.images.every(g => p.image.some(m => m.name === g.name)),
  )

if (have && finished(have)) {
  throw new Error(`run: ${path} is finished; refusing to overwrite it`)
}

const log = (what: string): void => appendFileSync(logPath, `${new Date().toISOString()} ${what}\n`)

log(`part ${name} start${have ? ' (resumed)' : ''}${smoke ? ' SMOKE' : ''}, a_B ${stage.aB}, ball ${stage.R}, ${threads} native threads`)

const part = bandRun({
  su: setup(),
  aB: stage.aB,
  R: stage.R,
  plans,
  opts: { backend: 'native', threads },
  have,
  log,
  landed: p => writeFileSync(path, JSON.stringify(p)),
})

writeFileSync(path, JSON.stringify(part))
log(`part ${name} done, ${part.seconds.toFixed(0)} s`)
