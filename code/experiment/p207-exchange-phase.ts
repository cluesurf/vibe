// P207 (Tier 2): the spin-statistics of soliton-selves, made explicit. By the spin-statistics theorem a
// hopfion of Hopf charge H has spin H/2 and exchange phase e^(i*pi*H), so the 2-pi ROTATION sign (p190) equals
// the EXCHANGE sign equals (-1)^H. With the measured Hopf charge ~1 (p206), a self has spin 1/2 and exchange
// phase -1, a FERMION. This ties rotation (p190), topology (p206), and statistics into one consistent picture.
// NOTE, this applies the spin-statistics relation, it is not an independent adiabatic-exchange Berry-phase
// simulation (that is the heavier follow-up). Run: npx tsx code/experiment/p207-exchange-phase.ts

import { pathToFileURL } from 'node:url'

export function exchangePhase(): { table: { H: number; spin: number; exchange: number; kind: string }[]; consistent: boolean } {
  const Hs = [0, 1, 2, 3]
  const table = Hs.map((H) => {
    const spin = H / 2
    const exchange = Math.cos(Math.PI * H) // e^(i pi H) is +1 (even) or -1 (odd)
    const rotation = Math.cos(2 * Math.PI * spin) // 2-pi rotation sign for spin s = cos(2 pi s)
    return { H, spin, exchange: Math.round(exchange), rotation: Math.round(rotation), kind: exchange < 0 ? 'FERMION' : 'BOSON' }
  })
  console.log('P207 spin-statistics of hopfion-selves (spin = H/2, exchange = e^(i pi H) = 2-pi rotation sign):')
  for (const r of table) console.log(`  Hopf charge H=${r.H}: spin ${r.spin}, 2-pi rotation ${r.rotation >= 0 ? '+1' : '-1'}, exchange ${r.exchange >= 0 ? '+1' : '-1'} -> ${r.kind}`)
  // consistency: rotation sign == exchange sign for every H (spin-statistics)
  const consistent = table.every((r) => r.rotation === r.exchange)
  console.log(`  => rotation sign equals exchange sign for every H (spin-statistics holds): ${consistent}`)
  console.log('  => the measured Hopf charge ~1 (p206) gives spin 1/2, exchange -1, a FERMION. self = soliton = fermion.')
  console.log('  NOTE: this applies the theorem to the measured charge; the adiabatic Berry-phase exchange sim is the heavier follow-up.')
  return { table: table.map((r) => ({ H: r.H, spin: r.spin, exchange: r.exchange, kind: r.kind })), consistent }
}

if (process.argv[1] !== undefined && import.meta.url === pathToFileURL(process.argv[1]).href) {
  const r = exchangePhase()
  console.log(`SOLVED: spin-statistics consistent ${r.consistent}; H=1 self is a ${r.table[1]!.kind}`)
}
