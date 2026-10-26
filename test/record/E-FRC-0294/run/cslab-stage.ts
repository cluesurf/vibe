// item 0049: run named stages of gauge/color-slab (E-FRC-0294), each to test/record/E-FRC-0294/cslab-v2-<name>.json; 'verdict' combines
// every stage file present into the verdict
import { existsSync, readdirSync, readFileSync, writeFileSync } from 'node:fs'
import {
  COLOR_SLAB_PLAN,
  colorSlabVerdict,
  controlSpecs,
  step1Specs,
  step2Specs,
  type Stage,
} from '@/test/experiment/gauge/color-slab'

const DIR = `${import.meta.dirname}/..`
const plan = COLOR_SLAB_PLAN
const all = [...step1Specs(plan), ...controlSpecs(plan), ...step2Specs(plan)]
const names = process.argv.slice(2)

if (names[0] === 'verdict') {
  // cslab-stage-step2-first-8.json is superseded (written before the Krylov confirmation of a short window): the slab
  // stages are read from cslab-v2-*, the STEP 1 and C1 stages (code unchanged) from either prefix
  const stages: Stage[] = readdirSync(DIR)
    .filter(
      f =>
        f.endsWith('.json') &&
        (f.startsWith('cslab-v2-') ||
          (f.startsWith('cslab-stage-') && !f.startsWith('cslab-stage-step2-'))),
    )
    .map(f => JSON.parse(readFileSync(`${DIR}/${f}`, 'utf8')) as Stage)

  console.log(JSON.stringify(colorSlabVerdict(plan, stages), null, 1))
} else {
  for (const name of names) {
    const spec = all.find(s => s.name === name)

    if (!spec) {
      throw new Error(`no stage ${name}: ${all.map(s => s.name).join(', ')}`)
    }

    const out = `${DIR}/cslab-v2-${name}.json`

    if (existsSync(out)) {
      throw new Error(`${out} exists: a stage file is never overwritten`)
    }

    const t0 = Date.now()
    const stage = spec.run()

    writeFileSync(out, JSON.stringify(stage, null, 1))
    console.log(`${name} done ${((Date.now() - t0) / 1000).toFixed(1)}s`)
  }
}
