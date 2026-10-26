// SPN builder part runner for E-SPN-0208: the boost partners (x . reference, C4v sector at K = 0) of the tracked level
// usage: spn-partner-part.ts <rule|soften|cap2|cap3> <aB> <threads> <trackedE> <out.json>
import { writeFileSync } from 'node:fs'
import type { KernelOptions } from '@/code/kernel/index'
import { capCore, softenContact, type CountTransform } from '@/code/measure/contact-core'
import { axisMoment, partnerPull } from '@/code/measure/boost-partner'
import {
  littleGroup,
  normalizeState,
  reducedCounts,
  reducedEngine,
  reducedHydrogenStart,
  referenceCorrelation,
  sector,
  unfold,
} from '@/code/measure/register-reduced'
import { alphaOf, linesOf, setup, TRACK_PLAN, windowOf } from '@/code/measure/register-track'

const [form, aBText, threadText, EText, out] = process.argv.slice(2) as string[]
const transforms: Record<string, CountTransform | undefined> = {
  rule: undefined,
  soften: softenContact,
  cap2: capCore(2),
  cap3: capCore(3),
}
const opts: KernelOptions = { backend: 'native', threads: Number(threadText) }
const started = Date.now()
const su = setup()
const p = TRACK_PLAN.find(x => x.aB === Number(aBText))!
const N = 4096
const E = Number(EText)
const s = sector(su.group, [...su.group.elements.keys()], p.R)
const sk = sector(su.group, littleGroup(su.group, [0.04, 0, 0, 0]), p.R)
const rule = reducedCounts(sk, su.table, alphaOf(su, p.aB), su.theta)
const t = transforms[form!]
const count = t ? t(sk, rule) : rule
const e = reducedEngine(sk, su.u, [0, 0, 0, 0], count, 'vector', opts)
const xr = axisMoment(sk, unfold(s, reducedHydrogenStart(s, p.aB), sk), 0)

normalizeState(e, xr)

const w = windowOf(su, p.aB, N)
const x = referenceCorrelation(e, xr, N + w.S - 1)
const lines = linesOf(su, p.aB, { re: [...x.re], im: [...x.im] }, N).filter(
  l => Math.abs(l.modulus - 1) <= 1e-6,
)
const pull = partnerPull(
  E,
  lines.map(l => ({ E: l.E, weight: l.overlap })),
  1e-3,
)

console.log(
  `${form} a${p.aB} tracked ${E}: pull ${pull.pull} (lines total ${pull.total}); above ${JSON.stringify(pull.above)} below ${JSON.stringify(pull.below)}; ${Math.round((Date.now() - started) / 1000)}s`,
)
console.log(
  `lines ${lines.filter(l => l.overlap >= 1e-3).map(l => `${l.E.toFixed(6)}:${l.overlap.toFixed(4)}`).join(' ')}`,
)
writeFileSync(out!, JSON.stringify({ form, aB: p.aB, E, pull, lines }))
