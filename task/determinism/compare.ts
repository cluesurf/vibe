// Read the determinism sweep (task/determinism/expose.ts) and say which experiments would print different numbers on
// x86-64. A permanent audit, the second half of expose.ts.
//
//   tsx task/determinism/compare.ts [--dir tmp/determinism] [--also <file>]
//
// Reads every expose*.jsonl, plain*.jsonl, flip*.jsonl and native*.jsonl in the directory (a sweep may be split into
// shards). Also writes <dir>/hard.txt, every experiment that makes a hard pow call, for the flip pass.
//
// 1. From the expose rows: how many experiments make a disagreeing fdlibm call, how many a pow call this Mac rounds
//    differently from the correctly rounded value with room to spare (a definite difference, since glibc's pow is
//    within 0.54 ULP), how many only a HARD pow call (undetermined), and how many none. Writes the experiments to
//    rerun under plain Math to <dir>/exposed.txt (plus any listed in --also, such as the users of a table a module
//    builds on import, which no per-experiment count can see).
// 2. From the plain rows: every exposed experiment whose verdict differs from its expose verdict, with what moved:
//    the status, the claim text, and each metric and control value.
// 3. From the native rows: the control. Each must equal its expose verdict, or the experiment is not deterministic on
//    one machine, and its move under plain Math means nothing.
import { existsSync, readdirSync, readFileSync, writeFileSync } from 'node:fs'
import { join } from 'node:path'
import { fileURLToPath } from 'node:url'

type Verdict = {
  status?: string
  claim?: string
  metrics?: Record<string, unknown>
  control?: Record<string, unknown>
}

type Row = {
  id: string
  code: string | null
  ms: number
  calls: number
  differ: number
  byFunction: Record<string, number>
  firstDiffer: string
  unrestated: Record<string, number>
  pow: {
    calls: number
    hard: number
    macMiss: number
    unchecked: number
    minMargin: number
    firstMiss: string
  }
  crash: string | null
  verdict: Verdict | null
  importSites?: string[]
}

const args = process.argv.slice(2)

const option = (name: string): string | undefined => {
  const i = args.indexOf(name)

  return i < 0 ? undefined : args[i + 1]
}

const dir = option('--dir') ?? fileURLToPath(new URL('../../tmp/determinism/', import.meta.url))
const also = option('--also')

const read = (prefix: string): Row[] =>
  readdirSync(dir)
    .filter(f => f.startsWith(prefix) && f.endsWith('.jsonl'))
    .sort()
    .flatMap(f =>
      readFileSync(join(dir, f), 'utf8')
        .split('\n')
        .filter(l => l.length > 0)
        .map(l => JSON.parse(l) as Row),
    )

const name = (r: Row): string => `${r.code ?? ''} ${r.id}`.trim()

// ---- 1. exposure ----

const exposeAll = read('expose')
const imports = exposeAll.filter(r => r.id === '(import)')
const byId = new Map<string, Row>()

for (const r of exposeAll) {
  if (r.id !== '(import)') {
    byId.set(r.id, r)
  }
}

const mac = [...byId.values()]

const fdlibm = mac.filter(r => r.differ > 0)
const powMiss = mac.filter(r => r.differ === 0 && r.pow.macMiss > 0)
const powHard = mac.filter(r => r.differ === 0 && r.pow.macMiss === 0 && r.pow.hard > 0)
const powHardTight = powHard.filter(r => r.pow.minMargin <= 0.01)
const large = mac.filter(
  r => r.differ === 0 && r.pow.macMiss === 0 && r.pow.hard === 0 && Object.keys(r.unrestated).length > 0,
)
const unchecked = mac.filter(r => r.pow.unchecked > 0)
const clean = mac.filter(
  r => r.differ === 0 && r.pow.macMiss === 0 && r.pow.hard === 0 && Object.keys(r.unrestated).length === 0,
)
const crashed = mac.filter(r => r.crash !== null)

console.log(`${mac.length} experiments run (${crashed.length} crashed)`)
console.log(`  ${fdlibm.length} make an fdlibm call whose x86-64 result differs`)
console.log(`  ${powMiss.length} more make a pow call this Mac rounds wrong with margin to spare (a definite difference)`)
console.log(
  `  ${powHard.length} more make only HARD pow calls, within 0.05 ULP of a midpoint (undetermined), ${powHardTight.length} of them within 0.01`,
)
console.log(`  ${large.length} more call sin, cos or tan past 2^19 pi/2, not restated (undetermined)`)
console.log(`  ${clean.length} make none of these: platform-free`)

if (unchecked.length > 0) {
  console.log(`  ${unchecked.length} hit the pow check budget: ${unchecked.map(name).join(', ')}`)
}

const fn = new Map<string, number>()

for (const r of fdlibm) {
  for (const k of Object.keys(r.byFunction)) {
    fn.set(k, (fn.get(k) ?? 0) + 1)
  }
}

console.log(`  disagreeing function, by experiments: ${[...fn].sort((a, b) => b[1] - a[1]).map(([k, v]) => `${k} ${v}`).join(', ')}`)

for (const r of imports.slice(0, 1)) {
  console.log(`\non import: ${r.differ} disagreeing fdlibm calls, ${r.pow.hard} hard pow calls, ${r.pow.macMiss} pow misses`)

  for (const s of r.importSites ?? []) {
    console.log(`  ${s}`)
  }
}

const alsoList = also && existsSync(also) ? readFileSync(also, 'utf8').split('\n').filter(l => l.trim().length > 0) : []
const rerun = [...new Set([...fdlibm, ...powMiss].map(r => r.code ?? r.id).concat(alsoList))]

writeFileSync(join(dir, 'exposed.txt'), rerun.join('\n') + '\n')

const anyHard = mac.filter(r => r.pow.hard > 0)

writeFileSync(join(dir, 'hard.txt'), anyHard.map(r => r.code ?? r.id).join('\n') + '\n')
console.log(`wrote ${anyHard.length} experiments with any hard pow call to ${join(dir, 'hard.txt')}`)
console.log(`\nwrote ${rerun.length} experiments to rerun under plain Math to ${join(dir, 'exposed.txt')}`)

if (crashed.length > 0) {
  console.log(`\ncrashed under the instrument:`)

  for (const r of crashed) {
    console.log(`  ${name(r)}: ${r.crash}`)
  }
}

// ---- 2. what moves ----

function diff(a: Verdict | null, b: Verdict | null, crashA: string | null, crashB: string | null): string[] {
  const out: string[] = []

  if (crashA !== crashB) {
    out.push(`crash ${crashA} -> ${crashB}`)
  }

  const va = a ?? {}
  const vb = b ?? {}

  if (va.status !== vb.status) {
    out.push(`STATUS ${va.status} -> ${vb.status}`)
  }

  if (va.claim !== vb.claim) {
    out.push(`claim "${va.claim}" -> "${vb.claim}"`)
  }

  for (const part of ['metrics', 'control'] as const) {
    for (const k of Object.keys({ ...va[part], ...vb[part] })) {
      const x = va[part]?.[k]
      const y = vb[part]?.[k]

      if (JSON.stringify(x) !== JSON.stringify(y)) {
        out.push(`${part}.${k} ${JSON.stringify(x)} -> ${JSON.stringify(y)}`)
      }
    }
  }

  if (out.length === 0 && JSON.stringify(a) !== JSON.stringify(b)) {
    out.push('another field (notes or details)')
  }

  return out
}

const plain = new Map(read('plain').filter(r => r.id !== '(import)').map(r => [r.id, r]))
const native = new Map(read('native').filter(r => r.id !== '(import)').map(r => [r.id, r]))

if (plain.size > 0) {
  const moved: Row[] = []

  let same = 0

  for (const p of plain.values()) {
    const r = byId.get(p.id)

    if (!r) {
      continue
    }

    if (JSON.stringify(r.verdict) === JSON.stringify(p.verdict) && r.crash === p.crash) {
      same++
    } else {
      moved.push(r)
    }
  }

  const statusMoved = moved.filter(r => r.verdict?.status !== plain.get(r.id)!.verdict?.status)

  console.log(
    `\nunder x86-64 Math: ${moved.length} of ${plain.size} rerun experiments print a different verdict (${statusMoved.length} a different status), ${same} the same`,
  )

  for (const r of moved) {
    const p = plain.get(r.id)!
    const d = diff(r.verdict, p.verdict, r.crash, p.crash)
    const control = native.get(r.id)
    const check = control
      ? JSON.stringify(control.verdict) === JSON.stringify(r.verdict)
        ? '  [native control equal]'
        : '  [NATIVE CONTROL DIFFERS: not deterministic on this machine]'
      : ''
    const cause = r.differ > 0 ? Object.keys(r.byFunction).join(' ') : 'pow'

    console.log(`  ${name(r)} (${cause})${check}`)

    for (const line of d.slice(0, 12)) {
      console.log(`      ${line}`)
    }

    if (d.length > 12) {
      console.log(`      and ${d.length - 12} more`)
    }
  }

  writeFileSync(join(dir, 'moved.txt'), moved.map(r => r.code ?? r.id).join('\n') + '\n')
}

// ---- 2b. the hard pow calls, every one rounded the other way ----

const flip = new Map(read('flip').filter(r => r.id !== '(import)').map(r => [r.id, r]))

if (flip.size > 0) {
  const moved: Row[] = []

  for (const f of flip.values()) {
    const r = byId.get(f.id)

    if (r && (JSON.stringify(r.verdict) !== JSON.stringify(f.verdict) || r.crash !== f.crash)) {
      moved.push(r)
    }
  }

  console.log(
    `\nevery hard pow call misrounded: ${flip.size - moved.length} of ${flip.size} rerun experiments print the same verdict, ${moved.length} do not`,
  )

  for (const r of moved) {
    const f = flip.get(r.id)!
    const d = diff(r.verdict, f.verdict, r.crash, f.crash)

    console.log(`  ${name(r)} (${r.pow.hard} hard calls)`)

    for (const line of d.slice(0, 8)) {
      console.log(`      ${line}`)
    }

    if (d.length > 8) {
      console.log(`      and ${d.length - 8} more`)
    }
  }

  writeFileSync(join(dir, 'flip-moved.txt'), moved.map(r => r.code ?? r.id).join('\n') + '\n')
}

// ---- 3. the control ----

if (native.size > 0) {
  const off = [...native.values()].filter(n => {
    const r = byId.get(n.id)

    return r && JSON.stringify(r.verdict) !== JSON.stringify(n.verdict)
  })

  console.log(`\nnative control: ${native.size - off.length} of ${native.size} equal their expose verdict`)

  for (const n of off) {
    console.log(`  ${name(n)}: ${diff(byId.get(n.id)!.verdict, n.verdict, null, null).slice(0, 4).join('; ')}`)
  }
}
