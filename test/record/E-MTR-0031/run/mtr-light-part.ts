// MTR builder part runner for E-MTR-0031: the light pair's correlation at each K in a list, one JSON per K
// usage: mtr-light-part.ts <K,K,...> <threads>   (writes test/record/E-MTR-0031/mtr-light-K<K>.json, refuses to overwrite)
import { existsSync, writeFileSync } from 'node:fs'
import { softenContact } from '@/code/measure/contact-core'
import { boostCorrelation } from '@/code/measure/pair-boost'
import { setupFor, TRACK_PLAN } from '@/code/measure/register-track'
import { A_B, CYCLES, UNIT } from '@/test/experiment/matter/light-pair-dispersion'

const RECORD = `${import.meta.dirname}/..`
const [list, threadText] = process.argv.slice(2) as string[]
const su = setupFor(UNIT)
const p = TRACK_PLAN.find(x => x.aB === A_B)!
const started = Date.now()

for (const K of list!.split(',').map(Number)) {
  const out = `${RECORD}/mtr-light-K${K}.json`

  if (existsSync(out)) throw new Error(`${out} exists, refusing to overwrite`)

  const x = boostCorrelation(su, p, K, CYCLES, { backend: 'native', threads: Number(threadText) }, softenContact)

  writeFileSync(out, JSON.stringify(x))
  console.error(`K ${K} done ${Math.round((Date.now() - started) / 1000)}s`)
}
