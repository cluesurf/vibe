// P207 (Tier 2): this is an ANALYTIC / CONSISTENCY CHECK that ASSUMES the spin-statistics theorem. It hardcodes
// the textbook relations spin = H/2 and exchange phase = e^(i*pi*H) = (-1)^H, then confirms (trivially) that the
// 2-pi rotation sign cos(2*pi*s) equals that exchange sign for each H. That identity is a known consequence of
// the assumed formulas, ASSUMED here, not produced by the vibe substrate. This file does NOT show the substrate
// generates spin-statistics, and it does NOT independently compute an exchange phase. The fermion conclusion at
// H=1 follows purely from the assumed spin = H/2 rule applied to the measured Hopf charge. An actual emergent
// test would be the adiabatic-exchange Berry-phase simulation, which is not done here.
// Run: npx tsx code/experiment/p207-exchange-phase.ts

import { defineExperiment } from '@/test/scaffold/suite'
import { verdict } from '@/test/scaffold/verdict'

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
  console.log(`  => ANALYTIC CHECK (assumes spin-statistics): rotation sign equals exchange sign for every H = ${consistent} (this identity follows from the assumed formulas, it is not emergent).`)
  console.log('  => under the assumed rule the measured Hopf charge ~1 (p206) gives spin 1/2, exchange -1, labelled a FERMION. This is a labelling from the assumed theorem, not derived from the substrate.')
  console.log('  NOTE: an independent emergent test would be the adiabatic Berry-phase exchange simulation, which is not done here.')
  return { table: table.map((r) => ({ H: r.H, spin: r.spin, exchange: r.exchange, kind: r.kind })), consistent }
}

export default defineExperiment({
  id: 'spin/exchange-phase',
  title: 'an analytic consistency check that the assumed spin-statistics formulas agree, not an emergent result',
  category: 'spin',
  substrates: ['any'],
  depth: 'L0',
  paper: false,
  run() {
    const r = exchangePhase()
    return verdict({
      status: 'open',
      claim:
        'assuming the textbook relations spin equals H over two and exchange phase equals e to the i pi H, the 2pi rotation sign and the exchange sign agree for every Hopf charge, an identity that follows from the assumed formulas rather than from the substrate',
      metrics: {
        consistent: r.consistent ? 1 : 0,
        hopfChargeChecked: r.table.length,
      },
      notes:
        'L0, circular. The file header is explicit, this ASSUMES the spin-statistics theorem (spin = H/2 and exchange = e^(i pi H)) and then confirms the two assumed formulas agree, which they must. It does NOT independently compute an exchange phase from the dynamics and it is NOT evidence the substrate generates spin-statistics. Reported as a consistency note with status open, not a pass. The real test is an adiabatic Berry-phase exchange simulation, which is not done here.',
    })
  },
})
