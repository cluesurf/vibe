// E-SPN-0217's verdict from the saved reads (no engine run); with `stage1`, the re-read of the two saved points alone
// usage: clock-combine.ts [stage1]
import { combineClock, POINTS, readClock, runClock } from '@/test/experiment/spin/register-pair-clock-continuum'

if (process.argv[2] === 'stage1') {
  for (const p of POINTS.slice(0, 2)) {
    const r = readClock(p)

    console.log(r ? r.text : `${p.name}: no read`)
    if (r) for (const [k, x] of Object.entries(r.metrics)) console.log(`  ${p.name} ${k} ${x}`)
  }
  const two = POINTS.slice(0, 2).map(p => readClock(p)!)
  const v = combineClock(two)

  console.log(`two-point extrapolation (not the verdict): ${v.claim}`)
  for (const k of ['C1', 'sigmaC1', 'B1', 'Cdelta', 'sigmaCdelta', 'Bdelta', 'Lambda', 'ratioInf', 'sigmaInf', 'neededSigmaCdelta', 'mNeed', 'aBNeed']) console.log(`  ${k} ${v.metrics[k]}`)
  process.exit(0)
}

const v = runClock()

console.log(`status ${v.status}`)
console.log(`claim ${v.claim}`)
for (const [k, x] of Object.entries(v.metrics)) console.log(`  ${k} ${x}`)
console.log(`notes ${v.notes}`)
process.exit(0)
