// rcw part: read one point of register-coulomb-weak's gate plan (or the witness and instrument) and write it as JSON (the
// gate run reads the points in parallel processes, each on its own worker pool; rcw-combine gives the verdict, the same
// function run() calls)
import { writeFileSync } from 'node:fs'
import { startPool, stopPool } from '@/code/measure/register-reduced'
import { memberInstrument, setup } from '@/code/measure/register-track'
import { GATE_PLAN, readPoint, witnessRun, WITNESS_BALL, WITNESS_CYCLES } from '@/test/experiment/spin/register-coulomb-weak'

const name = process.argv[2] as string
const out = process.argv[3] as string
const started = Date.now()
const log = (what: string): void => console.error(`${what} ${Math.round((Date.now() - started) / 1000)}s`)
const su = setup()

if (name === 'witness') {
  const w = { witness: witnessRun(su, WITNESS_BALL, WITNESS_CYCLES), instrument: memberInstrument(su) }

  writeFileSync(out, JSON.stringify(w))
  console.log(JSON.stringify(w))
} else {
  const p = GATE_PLAN.points.find(x => x.name === name)

  if (!p) {
    console.error(`no point ${name}`)
    process.exit(2)
  }

  if (p.workers > 0) startPool(p.workers)

  const read = readPoint(su, p, log)

  stopPool()
  writeFileSync(out, JSON.stringify(read))
  console.log(JSON.stringify(read))
}
