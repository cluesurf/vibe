// vibe-roadmap-moving-matter-0008: E-RLT-0115 stage 1 redo after the reduced engine's fix. Reads the recorded stage
// (test/record/E-RLT-0115/rlt115-one.json, untouched), reads directions 10 and 11 again, witnesses the axis and face reads to the bit, and
// writes the spliced stage to test/record/E-RLT-0115/rlt115-one-fixed.json (refuses to overwrite it). 3 native threads.
import { existsSync, readFileSync, writeFileSync } from 'node:fs'
import { stageOneRedo, type StageOne } from '@/test/experiment/relativity/bound-pair-direction'

const W = `${import.meta.dirname}/..`
const OUT = `${W}/rlt115-one-fixed.json`
const started = Date.now()
const log = (what: string): void => console.log(`${what} ${Math.round((Date.now() - started) / 1000)}s`)

if (existsSync(OUT)) {
  throw new Error(`refusing to overwrite ${OUT}`)
}

const old = JSON.parse(readFileSync(`${W}/rlt115-one.json`, 'utf8')) as StageOne
const { one, witness, level } = stageOneRedo(old, { backend: 'native', threads: 3 }, log)

log(`level E_L bit-identical: ${level}; witnesses ${witness.map(w => `${w.index} ${w.same ? 'bit-identical' : 'DIFFERENT'}`).join(', ')}`)
writeFileSync(OUT, JSON.stringify(one))
log('done')
