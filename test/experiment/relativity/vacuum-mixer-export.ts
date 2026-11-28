// VACUUM COLD STATIONARITY UNDER F-G AND CUSP LATERAL LINKS (E-RLT-0122).
// Verifies V1 (empty mesh) is an exact fixed point of F-G + ODD + working rule on R = 2 and R = 3 exact balls,
// confirms s_in = 0 outside a lump's light cone (closing B-43 and giving exact export-bound.md E1 numbers for B-38),
// and computes exact lateral links m_D between adjacent cusp columns at depths D = 1, 2, 3 (export-bound.md E2).
//
// Depth L2: exact working rule + F-G + ODD on exact balls and exact cusp neighborhood. Zero random numbers.

import { experiment } from '@/test/scaffold/suite'
import { verdict } from '@/test/scaffold/verdict'
import { runVacuumExportCheck } from '@/code/measure/vacuum-export'

export default experiment({
  id: 'relativity/vacuum-mixer-export',
  code: 'E-RLT-0122',
  title:
    'Empty vacuum V1 stationarity and s_in = 0 under F-G and ODD, plus exact cusp lateral link count m_D',
  category: 'relativity',
  substrates: ['3434'],
  depth: 'L2',
  paper: false,
  run() {
    const res = runVacuumExportCheck()
    const v0 = res.v0Exact
    const e1 = res.e1Exceptions === 0
    const e2 = res.cuspCounts.every(c => c.symmetricAcrossSixNeighbors && c.lateralLinksPerPair > 0)

    const c1 = res.cuspCounts[0]!
    const c2 = res.cuspCounts[1]!
    const c3 = res.cuspCounts[2]!

    const ok = v0 && e1 && e2

    return verdict({
      status: ok ? 'pass' : 'fail',
      claim:
        `V1 is an exact fixed point of F-G + ODD + working rule (both coin places, R = 2 and R = 3, s_in = 0, ` +
        `Delta_slot = ${res.deltaSlot.toFixed(6)}, Cheeger floor = ${res.cheegerFloorSlot.toFixed(4)} nats/dock/beat); ` +
        `cusp lateral links m_D (D = 1, 2, 3) = ${c1.lateralLinksPerPair.toFixed(2)}, ${c2.lateralLinksPerPair.toFixed(2)}, ` +
        `${c3.lateralLinksPerPair.toFixed(2)} against column docks ${c1.columnDocks.toFixed(1)}, ${c2.columnDocks.toFixed(1)}, ${c3.columnDocks.toFixed(1)}`,
      metrics: {
        v0: v0 ? 1 : 0,
        e1: e1 ? 1 : 0,
        e2: e2 ? 1 : 0,
        e1Exceptions: res.e1Exceptions,
        sIn: res.sIn,
        deltaSlot: res.deltaSlot,
        deltaTone: res.deltaTone,
        cheegerFloorSlot: res.cheegerFloorSlot,
        m1: c1.lateralLinksPerPair,
        m2: c2.lateralLinksPerPair,
        m3: c3.lateralLinksPerPair,
        colDocks1: c1.columnDocks,
        colDocks2: c2.columnDocks,
        colDocks3: c3.columnDocks,
        ratio1: c1.mDOverColumnDocks,
        ratio2: c2.mDOverColumnDocks,
        ratio3: c3.mDOverColumnDocks,
      },
    })
  },
})
