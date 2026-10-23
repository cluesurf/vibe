// Why E-SPN-0218's N1 failed: the light-off clause of clockDecomposition read bit for bit. Prints, per point, R_full - R
// and ratioDarwin - ratio at S = 0 (diagnostic after the first run, gating nothing).
// usage: n1-probe.ts
import { clockDecomposition } from '@/code/measure/pair-clock'
import { memberOf } from '@/code/measure/register-track'
import { readVerdictLog } from '@/code/tool/verdict-log'
import { POINTS } from '@/test/experiment/spin/light-breit-exchange'

const cm = readVerdictLog(`${import.meta.dirname}/../../E-SPN-0217/clock-verdict.log`)!.metrics

for (const p of POINTS) {
  const mb = memberOf(p.unit)
  const R1 = cm[`${p.name}_R1`]!
  const R2 = cm[`${p.name}_R2`]!
  const parts = clockDecomposition({ m: mb.m, M0: mb.M0, E1: cm[`${p.name}_E1`]!, E2: cm[`${p.name}_E2`]!, R1, R2, S: 0 })

  console.log(
    `${p.name}: R1full - R1 ${parts.R1full - R1}, R2full - R2 ${parts.R2full - R2}, ratioDarwin - ratio ${parts.ratioDarwin - parts.ratio} (ratio ${parts.ratio})`,
  )
}
