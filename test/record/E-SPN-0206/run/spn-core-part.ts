// SPN builder part runner for E-SPN-0206: one transform at one a_B, the tracked scan's own identity and motion reads
// usage: spn-core-part.ts <rule|soften|cap2|cap3|only> <aB> <threads> <zeroOnly 0|1> <out.json>
import { writeFileSync } from 'node:fs'
import type { KernelOptions } from '@/code/kernel/index'
import {
  capCore,
  contactOnly,
  softenContact,
  type CountTransform,
} from '@/code/measure/contact-core'
import {
  readMotion,
  readZero,
  setup,
  TRACK_PLAN,
} from '@/code/measure/register-track'

const [form, aBText, threadText, zeroOnly, out] = process.argv.slice(2) as string[]
const transforms: Record<string, CountTransform | undefined> = {
  rule: undefined,
  soften: softenContact,
  cap2: capCore(2),
  cap3: capCore(3),
  only: contactOnly,
}
const opts: KernelOptions = { backend: 'native', threads: Number(threadText) }
const started = Date.now()
const log = (what: string): void =>
  console.error(`${form} ${what} ${Math.round((Date.now() - started) / 1000)}s`)
const su = setup()
const p = TRACK_PLAN.find(x => x.aB === Number(aBText))!
const t = transforms[form!]
const zero = readZero(su, p, opts, log, 1, t)

writeFileSync(`${out}.zero.json`, JSON.stringify(zero))

const motion = zeroOnly === '1' ? null : readMotion(su, p, zero, opts, log, t)

writeFileSync(out!, JSON.stringify({ form, zero, motion }))
log('done')
