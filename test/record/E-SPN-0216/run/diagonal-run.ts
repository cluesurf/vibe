// E-SPN-0216's run: every read of diagonalRun at 6 native threads, landed into ../diagonal-landed.json after each (a
// stopped run resumes from it), the finished part written to ../diagonal.json (refuses to overwrite it) and the
// verdict printed.
import { existsSync, writeFileSync } from 'node:fs'
import {
  combineFrom,
  diagonalRun,
  NATIVE,
  PART,
  readJson,
  type DiagonalPart,
} from '@/test/experiment/spin/reduced-diagonal-sectors'

const LANDED = `${import.meta.dirname}/../diagonal-landed.json`
const started = Date.now()
const log = (what: string): void => console.log(`${what} ${Math.round((Date.now() - started) / 1000)}s`)

if (existsSync(PART)) {
  throw new Error(`refusing to overwrite ${PART}`)
}

const from = existsSync(LANDED) ? readJson<DiagonalPart>(LANDED) : undefined
const part = diagonalRun({
  opts: NATIVE,
  log,
  from,
  landed: p => writeFileSync(LANDED, JSON.stringify(p)),
})

writeFileSync(PART, JSON.stringify(part))
console.log(JSON.stringify(combineFrom(part), null, 1))
log('done')
