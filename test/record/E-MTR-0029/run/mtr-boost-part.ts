// MTR builder part runner for E-MTR-0029: the a_B 8 softened pair boosted to each K in a list, one JSON per K
// usage: mtr-boost-part.ts <K,K,...> <threads>   (writes test/record/E-MTR-0029/mtr-boost-K<K>.json)
import { existsSync, writeFileSync } from 'node:fs'
import { softenContact } from '@/code/measure/contact-core'
import { readBoost } from '@/code/measure/pair-boost'
import { setupFor, TRACK_PLAN } from '@/code/measure/register-track'
import { A_B, recordedZero, UNIT } from '@/test/experiment/matter/composite-dispersion'

const RECORD = `${import.meta.dirname}/..`
const [list, threadText] = process.argv.slice(2) as string[]
const su = setupFor(UNIT)
const p = TRACK_PLAN.find(x => x.aB === A_B)!
const { zero } = recordedZero(`${RECORD}/../E-SPN-0206/spn-core-soften-a8.json`)
const started = Date.now()

for (const K of list!.split(',').map(Number)) {
  const out = `${RECORD}/mtr-boost-K${K}.json`

  if (existsSync(out)) throw new Error(`${out} exists, refusing to overwrite`)

  const read = readBoost(su, p, zero, K, { backend: 'native', threads: Number(threadText) }, what =>
    console.error(`${what} ${Math.round((Date.now() - started) / 1000)}s`),
  softenContact)

  writeFileSync(out, JSON.stringify(read))
  console.error(`K ${K} done ${Math.round((Date.now() - started) / 1000)}s`)
}
