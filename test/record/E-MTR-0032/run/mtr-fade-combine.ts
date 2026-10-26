// MTR builder combine for E-MTR-0032: the verdict from the saved K = 0 and K correlations of P2 and P3
// usage: mtr-fade-combine.ts [witness]   (witness: the K = 0 gates alone, before any K read is used)
import { existsSync, readFileSync } from 'node:fs'
import { combineFading, MOMENTA, POINTS, readPoint, savedZero } from '@/test/experiment/matter/light-pair-fading'

const RECORD = `${import.meta.dirname}/..`
const witnessOnly = process.argv[2] === 'witness'
const reads = POINTS.flatMap(point => {
  const z = savedZero(point.name)

  if (!z) {
    console.log(`${point.name}: no K = 0 read`)
    return []
  }

  const ks = witnessOnly
    ? []
    : MOMENTA.filter(K => existsSync(`${RECORD}/mtr-fade-${point.name}-K${K}.json`)).map(K =>
        JSON.parse(readFileSync(`${RECORD}/mtr-fade-${point.name}-K${K}.json`, 'utf8')),
      )
  const r = readPoint({ point, zero: z.x, zeroRef: z.ref, reads: ks })

  console.log(r.text)
  for (const [k, x] of Object.entries(r.metrics)) console.log(`  ${point.name} ${k} ${x}`)

  return [r]
})

if (!witnessOnly) {
  const v = combineFading(reads)

  console.log(`status ${v.status}`)
  console.log(`claim ${v.claim}`)
  for (const [k, x] of Object.entries(v.metrics)) if (!k.startsWith('m0284a8_K') && !k.startsWith('m0380a10_K')) console.log(`  ${k} ${x}`)
}
process.exit(0)
