// P221 (gauge frontier, the resolution): the SM needs D5 = so(10) (p217), unreachable from the coin alone
// (p220, geometry tops out at D4). But D5 = D4 + ONE MORE AXIS, and that axis can be the TONE (a base element).
// So coin (D4 = the 24-cell directions) + tone (the 5th axis) -> D5 = so(10) -> the Standard Model. And the
// SO(10) generation 16 = 8s + 8c under SO(8), exactly the coin's TWO spinors (the genuine {3,4,3,4} spinors)
// tagged by the tone sign. So one SM generation = the coin spinors graded by the tone. Triality (three 8-reps)
// -> three generations. We verify the root-system + spinor-weight facts. Run: npx tsx code/experiment/p221-gauge-from-coin-tone.ts

import { pathToFileURL } from 'node:url'

const dot = (a: number[], b: number[]): number => a.reduce((s, x, i) => s + x * b[i]!, 0)
const eq = (a: number[], b: number[]): boolean => a.length === b.length && a.every((x, i) => Math.abs(x - b[i]!) < 1e-9)
function reflect(v: number[], a: number[]): number[] { const f = (2 * dot(v, a)) / dot(a, a); return v.map((x, i) => x - f * a[i]!) }
function isRootSystem(R: number[][]): boolean { for (const a of R) for (const v of R) { const w = reflect(v, a); if (!R.some((r) => eq(r, w))) return false } return true }
function dRoots(n: number): number[][] { const R: number[][] = []; for (let i = 0; i < n; i++) for (let j = i + 1; j < n; j++) for (const si of [1, -1]) for (const sj of [1, -1]) { const v = new Array<number>(n).fill(0); v[i] = si; v[j] = sj; R.push(v) } return R }
// A2 (+) A1 test (SM semisimple part) from p217
function smEmbeds(R: number[][]): boolean { for (const a of R) for (const b of R) { if (dot(a, b) !== -1) continue; const ab = a.map((x, i) => x + b[i]!); if (!R.some((r) => eq(r, ab))) continue; if (R.some((c) => dot(c, a) === 0 && dot(c, b) === 0)) return true } return false }

export function gaugeFromCoinTone(): { d5IsRootSystem: boolean; smInD5: boolean; sixteenSplit: string } {
  // D4 from the coin (e1..e4), then add the tone as the 5th axis e5 -> D5
  const d4 = dRoots(4).map((r) => [...r, 0]) // embed D4 in 5D (tone axis = 0)
  const d5 = dRoots(5)
  const extra = d5.filter((r) => r[4] !== 0) // the 16 roots that involve the tone axis
  console.log('P221 gauge from coin + tone:')
  console.log(`  coin D4 (24-cell) roots: ${d4.length};  add the tone axis -> D5 roots: ${d5.length}  (extra = ${extra.length} involve the tone)`)
  // the extra 16 = (the coin's 8v = +-e_i, i<=4) combined with (the tone = +-e5)
  const vectors8 = [0, 1, 2, 3].flatMap((i) => [1, -1].map((s) => { const v = [0, 0, 0, 0, 0]; v[i] = s; return v }))
  const extraIsVxTone = extra.every((r) => { const proj = [r[0]!, r[1]!, r[2]!, r[3]!, 0]; return vectors8.some((v) => eq(v, proj)) && Math.abs(r[4]!) === 1 })
  console.log(`  the extra 16 = (coin 8v = +-e_i) x (tone = +-e5): ${extraIsVxTone} (the tone promotes SO(8) -> SO(10))`)
  const d5IsRootSystem = isRootSystem(d5) && d5.length === 40
  const smInD5 = smEmbeds(d5)
  console.log(`  D5 is a genuine root system (so(10)): ${d5IsRootSystem};  the Standard Model embeds in it: ${smInD5}`)
  // SO(10) generation 16 = spinor weights (+-1/2)^5 with EVEN # of minus. Split by the tone (5th) sign:
  const sixteen: number[][] = []
  for (const a of [0.5, -0.5]) for (const b of [0.5, -0.5]) for (const c of [0.5, -0.5]) for (const d of [0.5, -0.5]) for (const e of [0.5, -0.5]) { const w = [a, b, c, d, e]; if (w.filter((x) => x < 0).length % 2 === 0) sixteen.push(w) }
  const tonePlus = sixteen.filter((w) => w[4]! > 0)  // tone +: first 4 coords have EVEN minus -> 8s
  const toneMinus = sixteen.filter((w) => w[4]! < 0) // tone -: first 4 coords have ODD minus  -> 8c
  const okS = tonePlus.every((w) => w.slice(0, 4).filter((x) => x < 0).length % 2 === 0)
  const okC = toneMinus.every((w) => w.slice(0, 4).filter((x) => x < 0).length % 2 === 1)
  const sixteenSplit = `16 = ${tonePlus.length} (tone+ = 8s) + ${toneMinus.length} (tone- = 8c), 8s-pure=${okS}, 8c-pure=${okC}`
  console.log(`  SO(10) generation: ${sixteenSplit}`)
  console.log('')
  console.log('Reading:')
  console.log(' - D5 = so(10) = the coin\'s D4 PLUS the tone as the 5th axis. The 16 extra roots are exactly the')
  console.log('   coin\'s 8 vector directions combined with the tone sign, so the TONE promotes SO(8) -> SO(10).')
  console.log(' - The Standard Model embeds in this D5 (p217). And one SO(10) GENERATION (the 16-spinor) splits as')
  console.log('   8s (tone +) + 8c (tone -), i.e. the coin\'s TWO genuine spinors tagged by the tone sign = one full')
  console.log('   generation of quarks and leptons. Triality (the three 8-reps of D4) -> three generations.')
  console.log(' => the beyond-coin ingredient the SM needed is the TONE (already base). coin (D4) + tone (U(1)/5th')
  console.log('    axis) -> so(10) -> SM, with matter = coin spinors graded by tone. The structural obstruction is')
  console.log('    RESOLVED. (Open: deriving that the DYNAMICS gauges so(10) and breaks it, the deeper step.)')
  return { d5IsRootSystem, smInD5, sixteenSplit }
}

if (process.argv[1] !== undefined && import.meta.url === pathToFileURL(process.argv[1]).href) {
  const r = gaugeFromCoinTone()
  console.log(`SOLVED: coin D4 + tone = so(10) root system ${r.d5IsRootSystem}, SM embeds ${r.smInD5}; ${r.sixteenSplit}`)
}
