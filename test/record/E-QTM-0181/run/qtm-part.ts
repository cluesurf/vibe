// E-QTM-0181 parts: `inst` or pair keys like a8-L24-N1; each writes test/record/E-QTM-0181/qtm-part-<name>.json and refuses to overwrite one
import { existsSync, writeFileSync } from 'node:fs'
import {
  instrumentPart,
  keyName,
  magnetoPart,
  PAIR_KEYS,
  pairPart,
  SLAB_KEYS,
  slabInstrumentPart,
} from '@/test/experiment/quantum/plane-pair-light'

const DIR = `${import.meta.dirname}/..`
const started = Date.now()
const log = (line: string): void => console.log(`${Math.round((Date.now() - started) / 1000)}s ${line}`)

for (const name of process.argv.slice(2)) {
  const path = `${DIR}/qtm-part-${name}.json`

  if (existsSync(path)) {
    log(`${name}: ${path} exists, not overwritten`)
    continue
  }

  if (name === 'inst') {
    const r = instrumentPart()

    writeFileSync(path, JSON.stringify(r, null, 2))
    log(`inst: ${JSON.stringify(r)}`)
    continue
  }

  const magneto = name.startsWith('ms-')
  if (name === 'slab-inst') {
    const r = slabInstrumentPart()

    writeFileSync(path, JSON.stringify(r, null, 2))
    log(`slab-inst: ${JSON.stringify(r)}`)
    continue
  }

  const key = [...PAIR_KEYS, ...SLAB_KEYS].find(k => keyName(k) === name.replace(/^ms-/, ''))

  if (!key) {
    throw new Error(`no key ${name}`)
  }

  if (magneto) {
    const r = magnetoPart(key)

    writeFileSync(path, JSON.stringify(r, null, 2))
    log(`${name}: R ${r.R} ratio ${r.ratio} residuals ${r.residuals.join(' ')}`)
    continue
  }

  const part = pairPart(key, line => {
    if (!line.includes('lanczos step')) {
      log(line)
    }
  })

  writeFileSync(path, JSON.stringify(part, null, 2))
  log(`${name} written (${part.seconds} s)`)
}
