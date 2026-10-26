// Run one part of E-RLT-0119 (axes, plane or generic) and write it to test/record/E-RLT-0119/rlt119-<part>.json as each
// read lands, its log beside it (rlt119-<part>.log). A part on disk that is not finished is resumed; a finished one is
// never overwritten.
//
//   node node_modules/tsx/dist/cli.mjs --tsconfig tsconfig.json test/record/E-RLT-0119/run/run.ts <part>

import { appendFileSync, existsSync, readFileSync, writeFileSync } from 'node:fs'
import { bandRun, type BandPart } from '@/code/measure/band-curvature'
import { setup } from '@/code/measure/register-track'
import { NATIVE, PARTS, STAGE, partPath } from '@/test/experiment/relativity/bound-pair-band-isotropy'

const name = process.argv[2] ?? ''
const plans = PARTS[name]

if (!plans) {
  throw new Error(`run: no part "${name}" (parts: ${Object.keys(PARTS).join(', ')})`)
}

const path = partPath(name)
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

log(`part ${name} start${have ? ' (resumed)' : ''}, a_B ${STAGE.aB}, ball ${STAGE.R}, ${NATIVE.threads} native threads`)

const part = bandRun({
  su: setup(),
  aB: STAGE.aB,
  R: STAGE.R,
  plans,
  opts: NATIVE,
  have,
  log,
  landed: p => writeFileSync(path, JSON.stringify(p)),
})

writeFileSync(path, JSON.stringify(part))
log(`part ${name} done, ${part.seconds.toFixed(0)} s`)
