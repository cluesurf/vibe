// item 0083 stage runner: npx tsx test/record/E-FRC-0304/run/hloc-main.ts <stage> [args]
//   step0 <side>                    the field's spectrum (Fourier of Re Tr R / 3 per slot)
//   witness <side>                  sector, reduction identity, dense against Lanczos, dense gauge control
//   levels <side> <rule|gauge|identity> <theta>   Lanczos levels until complete, saved to test/record/E-FRC-0304/hloc-levels-*.json
//   verdict                         read every saved level file and print the gates
import { readFileSync, writeFileSync, existsSync } from 'node:fs'
import {
  QUANTILES,
  MU,
  SIDES,
  THETA,
  denseLevels,
  epsLevels,
  fieldSpectrum,
  fields,
  goodLevels,
  lanczosStart,
  lanczosSteps,
  localizationVerdict,
  reductionWitness,
  registerSector,
  sectorOp,
  summarize,
  windowOf,
  type SideRead,
} from '@/test/experiment/gauge/hash-localization'
import { bulkBox } from '@/code/measure/color-slab'
import { sigmaTable } from '@/code/measure/color-gates'
import { OPPOSITE } from '@/code/rule/isometric-knit'
import { hashHarmonics } from '@/test/experiment/gauge/hash-localization'

const T = `${import.meta.dirname}/..`
const TOL = 1e-10
const ID_TWIST = [0.3, 0.7, 1.1, 1.9]
const [stage, a1, a2, a3] = process.argv.slice(2)
const t0 = Date.now()
const el = (): string => `${((Date.now() - t0) / 1000).toFixed(1)}s`

const twistOf = (name: string, theta: number): number[] =>
  name === 'identity' ? ID_TWIST.map((v, q) => v + (q === 0 ? theta : 0)) : [theta, 0, 0, 0]

function opOf(side: number, name: string, theta: number) {
  const sector = registerSector(0)
  const link = name === 'identity' ? null : (name === 'gauge' ? fields.gauge : fields.rule).on(bulkBox(side), 'bulk')

  return sectorOp({ side, link, sector, twist: twistOf(name, theta) })
}

function levels(side: number, name: string, theta: number, maxFactor = 6): SideRead {
  const op = opOf(side, name, theta)
  const run = lanczosStart(op)
  const n = op.n

  console.log(`levels side ${side} ${name} theta ${theta}: n ${n}, built ${el()}`)

  let prev: Float64Array | undefined
  let read: SideRead | undefined

  for (let f = 2; f <= maxFactor; f++) {
    lanczosSteps(run, f * n - run.alpha.length)

    const g = goodLevels(run, f * n, TOL)
    const complete = g.good.length === n
    const e = epsLevels(g.good)
    const w = QUANTILES.map(q => windowOf(e, q))
    const stable = prev !== undefined && prev.length === g.good.length && prev.every((v, i) => Math.abs(v - g.good[i]!) < 1e-9)

    console.log(`  m ${f}n: good ${g.good.length} of ${n}, spurious ${g.spurious}, copies ${g.copies}, lanczos ${run.seconds.toFixed(0)}s, ${el()}; windows ${w.map(x => `[${x.lo.toFixed(5)}, ${x.hi.toFixed(5)}] r ${x.r.toFixed(4)}`).join(' ')}; stable ${stable}`)

    read = { side, name, theta, n, m: f * n, goodCount: g.good.length, spurious: g.spurious, complete, levels: g.good, seconds: run.seconds }
    prev = g.good

    if (complete || (name === 'identity' && stable && 2 * g.good.length === n)) {
      break
    }
  }

  return read!
}

const file = (side: number, name: string, theta: number): string => `${T}/hloc-levels-${side}-${name}-${theta}.json`

if (stage === 'step0') {
  const side = Number(a1 ?? 12)
  const s = fieldSpectrum(side)

  console.log(JSON.stringify({ ...s, peaks: undefined }, null, 1))
  s.peaks.forEach(p => console.log(`peak j ${p.j.map(v => v.toFixed(4)).join(',')} frac ${p.frac.toFixed(4)} nearest n ${p.n} q dist ${p.dist.toFixed(4)}`))

  // the box field is the one-phase hash: every link is the direct hash of its slot or the inverse of its reverse's
  const tb = sigmaTable()
  const box = bulkBox(side)
  const link = fields.rule.on(box, 'bulk')
  const direct = (i: number): number => {
    const w = (Math.imul(i + 1, 40503) >>> 0) & 0xffff

    return tb.lifts.lifts[(w * 216) >>> 16]![(((w + 27145) & 0xffff) * 3) >>> 16]!
  }
  let fwd = 0
  let rev = 0
  let bad = 0

  for (let x = 0; x < box.cells; x++) {
    for (let d = 0; d < 24; d++) {
      const l = x * 24 + d
      const back = box.nb[l]! * 24 + OPPOSITE[d]!

      if (link[l] === direct(l)) fwd++
      else if (link[l] === tb.inverse[direct(back)]) rev++
      else bad++
    }
  }

  console.log(`box links: direct hash ${fwd}, inverse of the reverse slot's hash ${rev}, neither ${bad}`)

  for (const d of [0, 1, 5, 13]) {
    const h = hashHarmonics(d)

    console.log(`slot ${d} harmonics over period ${h.period}: top10 ${h.top10.toFixed(4)} top100 ${h.top100.toFixed(4)} participation ${h.participation.toFixed(1)} (hashed reference ${h.refParticipation.toFixed(1)}); top ${h.top.map(t => `${t.n}:${t.frac.toFixed(4)}`).join(' ')}`)
  }
  console.log('done', el())
}

if (stage === 'witness') {
  const side = Number(a1 ?? 4)
  const sec = registerSector(0)

  console.log('mu', MU, 'commutant', sec.commutantDim, 'J values', sec.jValues.map(v => v.toFixed(6)).join(' '), 'invariance gap', sec.invarianceGap.toExponential(2))

  const other = registerSector(1)
  const red = reductionWitness(side, fields.rule, sec)

  console.log('reduction: cycle gap', red.cycleGap.toExponential(2), 'X gap', red.xGap.toExponential(2), 'T^2 gap', red.t2Gap.toExponential(2), el())

  const op = opOf(side, 'rule', 0)
  const dense = denseLevels(op)

  console.log('dense n', op.n, 'min', dense[0], 'max', dense[dense.length - 1], el())

  // the other sectors: the second copy of the same irrep must match; the second irrep is another operator
  const link = fields.rule.on(bulkBox(side), 'bulk')
  const op1 = sectorOp({ side, link, sector: other, twist: [0, 0, 0, 0] })
  const d1 = denseLevels(op1)
  const op2 = sectorOp({ side, link, sector: registerSector(2), twist: [0, 0, 0, 0] })
  const d2 = denseLevels(op2)
  const gap = (a: Float64Array, b: Float64Array): number => Math.max(...Array.from(a, (v, i) => Math.abs(v - b[i]!)))

  console.log('sector 0 vs 1 gap', gap(dense, d1).toExponential(2), 'sector 0 vs 2 gap', gap(dense, d2).toExponential(2), el())

  // least spacing (exact degeneracies within the sector)
  let least = Infinity

  for (let i = 1; i < dense.length; i++) {
    least = Math.min(least, dense[i]! - dense[i - 1]!)
  }

  console.log('least dense spacing', least.toExponential(2))

  const gd = denseLevels(opOf(side, 'gauge', 0))

  console.log('gauge control (dense) gap', gap(dense, gd).toExponential(2), el())

  const lz = levels(side, 'rule', 0)
  const lzGap = lz.levels.length === dense.length ? gap(dense, lz.levels) : NaN

  console.log('lanczos good', lz.levels.length, 'of', dense.length, 'max gap to dense', lzGap.toExponential(2), el())
}

if (stage === 'levels') {
  const side = Number(a1)
  const name = a2!
  const theta = Number(a3)
  const r = levels(side, name, theta)

  writeFileSync(file(side, name, theta), JSON.stringify({ ...r, levels: Array.from(r.levels) }))
  console.log('saved', file(side, name, theta), 'complete', r.complete, el())
}

if (stage === 'verdict') {
  const load = (side: number, name: string, theta: number): SideRead | undefined => {
    const f = file(side, name, theta)

    if (!existsSync(f)) {
      return undefined
    }

    const j = JSON.parse(readFileSync(f, 'utf8'))

    return { ...j, levels: Float64Array.from(j.levels) }
  }
  const sides = (a1 ? a1.split(',').map(Number) : [...SIDES])
  const sum = (name: string) =>
    sides.flatMap(s => {
      const r0 = load(s, name, 0)
      const r1 = load(s, name, THETA)

      return r0 && r1 ? [summarize(r0, r1)] : []
    })
  const rule = sum('rule')
  const identity = sum('identity')
  const g0 = load(sides[0]!, 'gauge', 0)
  const r0 = load(sides[0]!, 'rule', 0)
  const gaugeGap = g0 && r0 && g0.levels.length === r0.levels.length
    ? Math.max(...Array.from(g0.levels, (v, i) => Math.abs(v - r0.levels[i]!)))
    : NaN

  for (const s of [...rule, ...identity]) {
    console.log(`side ${s.side} complete ${s.complete} missing ${s.missing}:${s.windows.map((w, i) => `center ${w.center.toFixed(3)} eps [${w.lo.toFixed(5)}, ${w.hi.toFixed(5)}] spacing ${w.spacing.toExponential(3)} <r> ${w.r.toFixed(4)} g ${s.g[i]!.toFixed(4)}`).join(' | ')}`)
  }

  console.log(JSON.stringify(localizationVerdict(rule, identity, gaugeGap), null, 1))
}
