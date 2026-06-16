// Run the prototype hyperbolic computer in 2D, 3D, and 4D, and print a report for each. Each builds a finite patch
// of its tiling, computes fib(10) on a ternary register machine, runs the literal railway CA on the cell graph,
// and exercises the associative content-addressable memory. Run: pnpm call code/compute/machine/run.ts

import { make2DMachine } from '@/code/compute/machine/2d/machine'
import { make3DMachine } from '@/code/compute/machine/3d/machine'
import { make4DMachine } from '@/code/compute/machine/4d/machine'
import type { VibeComputer, VibeComputerReport } from '@/code/compute/machine/shared'

function show(label: string, machine: VibeComputer): void {
  const r: VibeComputerReport = machine.report()
  const ballHead = r.memory.capacityByRadius.slice(0, 6).join(', ')
  console.log(`\n=== ${label}  {${r.symbol.join(',')}}  (${r.dimension}D) ===`)
  console.log(`substrate : ${r.cellCount} cells, degree ${r.degree} (the cell's direction count)`)
  console.log(`compute   : ${r.compute.program} = ${r.compute.result} (${r.compute.backend}, ${r.compute.cost} digit-ops)`)
  console.log(`railway   : locomotive ${r.railway.ran ? 'traversed' : 'did NOT traverse'} a ${r.railway.cycleLength}-cell loop on the substrate`)
  console.log(`memory    : stored ${r.memory.stored} ternary words, recalled cell ${r.memory.queryCell} by content: ${r.memory.found ? 'FOUND' : 'MISS'}`)
  console.log(`          : search latency ${r.memory.searchLatency} beats, full coverage ${r.memory.coverageBeat} beats (~log N)`)
  console.log(`          : capacity by radius: ${ballHead}, ... (exponential)`)
}

show('2D heptagrid', make2DMachine())
show('3D dodecagrid', make3DMachine())
show('4D vibe base (24-cell dock)', make4DMachine())
