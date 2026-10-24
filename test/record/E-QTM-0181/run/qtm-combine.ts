// E-QTM-0181 and E-QTM-0182 verdicts from the recorded parts (test/record/E-QTM-0181/qtm-part-*.json); `plane` or `slab`
import { existsSync, readFileSync } from 'node:fs'
import type { InertiaRead } from '@/code/measure/plane-light-pair'
import {
  combinePlane,
  combineSlab,
  keyName,
  PAIR_KEYS,
  SLAB_KEYS,
  type InstrumentPart,
  type PairPart,
  type SlabInstrumentPart,
} from '@/test/experiment/quantum/plane-pair-light'

const DIR = `${import.meta.dirname}/..`
const read = <T>(name: string): T => JSON.parse(readFileSync(`${DIR}/qtm-part-${name}.json`, 'utf8')) as T
const which = process.argv[2] ?? 'plane'

if (which === 'plane') {
  const magneto: Record<string, InertiaRead> = {}

  for (const k of PAIR_KEYS) {
    if (existsSync(`${DIR}/qtm-part-ms-${keyName(k)}.json`)) {
      magneto[keyName(k)] = read<InertiaRead>(`ms-${keyName(k)}`)
    }
  }

  console.log(JSON.stringify(combinePlane(read<InstrumentPart>('inst'), PAIR_KEYS.map(k => read<PairPart>(keyName(k))), magneto), null, 2))
} else {
  const parts = SLAB_KEYS.filter(k => existsSync(`${DIR}/qtm-part-${keyName(k)}.json`)).map(k => read<PairPart>(keyName(k)))

  console.log(JSON.stringify(combineSlab(read<SlabInstrumentPart>('slab-inst'), parts), null, 2))
}
