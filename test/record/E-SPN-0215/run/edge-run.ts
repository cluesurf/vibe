// E-SPN-0215's run: every read of edgeRun at 6 native threads, landed into ../edge-landed.json after each (a stopped run
// resumes from it), the finished part written to ../edge.json (refuses to overwrite it) and the verdict printed.
import { existsSync, readFileSync, writeFileSync } from 'node:fs'
import {
  edgeCombine,
  edgeRun,
  NATIVE,
  PART,
  type EdgePart,
} from '@/test/experiment/spin/reduced-edge-leak'

const LANDED = `${import.meta.dirname}/../edge-landed.json`
const started = Date.now()
const log = (what: string): void => console.log(`${what} ${Math.round((Date.now() - started) / 1000)}s`)

if (existsSync(PART)) {
  throw new Error(`refusing to overwrite ${PART}`)
}

const from = existsSync(LANDED) ? (JSON.parse(readFileSync(LANDED, 'utf8')) as EdgePart) : undefined
const part = edgeRun({
  opts: NATIVE,
  log,
  from,
  landed: p => writeFileSync(LANDED, JSON.stringify(p)),
})

writeFileSync(PART, JSON.stringify(part))
console.log(JSON.stringify(edgeCombine(part), null, 1))
log('done')
