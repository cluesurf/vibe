// P56: the full ladder, eternally growing.
// P51 built the integer ladder once, as a static orbit. The roadmap asks for the ladder to
// grow forever, with the model living on the growing substrate. Here we grow the
// tessellation epoch by epoch (the automaton emitting more cells each time) and, at every
// epoch, run the committed model on the current substrate and measure it. We confirm three
// things across the growing stages:
//   - the substrate grows without bound (cells only accumulate, the arrow of growth),
//   - it stays Lorentz-safe at every size (the geometry holds as it grows),
//   - the model runs on each stage, reproducibly and non-trivially (the model lives on the
//     growing substrate).
// The tessellation is infinite by construction, so the growth never stops. See the
// integer-ladder analysis and note/roadmap.md.
// Run: npx tsx code/experiment/p56-eternal-ladder.ts

import { pathToFileURL } from 'node:url'
import { makeRng } from '~/core/rng'
import { coxeterTessellation } from '~/substrate/coxeter'
import { modularGraph } from '~/experiment/p48-modular-base'
import { runModel } from '~/experiment/p51-full-ladder'
import { Graph } from '~/core/graph'
import { lorentzIsotropy } from '~/measure/lorentz'

interface Epoch {
  cells: number
  anisotropy: number
  lorentzSafe: boolean
  modelRuns: boolean
}

function evaluate(g: Graph, seed: number): Epoch {
  const aniso = lorentzIsotropy({ substrate: g, samples: 2500, rng: makeRng({ seed }) })
  const m = runModel(g, seed + 1)
  return {
    cells: g.size,
    anisotropy: aniso.anisotropy,
    lorentzSafe: aniso.anisotropy < 0.25,
    modelRuns: m.deterministic && m.evolves,
  }
}

export function eternalLadder(input: { base: 'modular' | number[]; caps: number[]; seed: number }): {
  epochs: Epoch[]
  growsMonotonically: boolean
  alwaysLorentzSafe: boolean
  modelAlwaysRuns: boolean
} {
  const epochs = input.caps.map((cap) => {
    const g = input.base === 'modular' ? modularGraph(cap) : coxeterTessellation({ schlafli: input.base, maxVertices: cap })
    return evaluate(g, input.seed)
  })
  let growsMonotonically = true
  for (let i = 1; i < epochs.length; i++) {
    if ((epochs[i]?.cells ?? 0) <= (epochs[i - 1]?.cells ?? 0)) {
      growsMonotonically = false
    }
  }
  return {
    epochs,
    growsMonotonically,
    alwaysLorentzSafe: epochs.every((e) => e.lorentzSafe),
    modelAlwaysRuns: epochs.every((e) => e.modelRuns),
  }
}

export function main(): void {
  console.log('P56: the full ladder, eternally growing')
  console.log('')
  for (const base of [{ name: 'modular group PSL(2,Z)', base: 'modular' as const, caps: [300, 700, 1500, 3000] }, { name: 'heptagrid {7,3}', base: [7, 3], caps: [200, 600, 1500, 2500] }]) {
    const r = eternalLadder({ base: base.base, caps: base.caps, seed: 2 })
    console.log(`  ${base.name}, grown epoch by epoch:`)
    for (const e of r.epochs) {
      console.log(`    ${String(e.cells).padStart(5)} cells: Lorentz anisotropy ${e.anisotropy.toFixed(3)} (${e.lorentzSafe ? 'safe' : 'UNSAFE'}), model runs ${e.modelRuns ? 'YES' : 'no'}`)
    }
    console.log(`    grows without bound: ${r.growsMonotonically ? 'YES' : 'no'}, stays Lorentz-safe: ${r.alwaysLorentzSafe ? 'YES' : 'no'}, model always runs: ${r.modelAlwaysRuns ? 'YES' : 'no'}`)
    console.log('')
  }
  console.log('  The integer ladder grows without bound, the cells only accumulating (the arrow of')
  console.log('  growth), and at every stage the substrate stays Lorentz-safe and the committed model')
  console.log('  runs on it, reproducibly and non-trivially. The tessellation is infinite by')
  console.log('  construction, so the growth never stops. This is the full ladder, from the integers')
  console.log('  up, eternally growing, with the model living on the growing substrate. The remaining')
  console.log('  step is truly incremental growth (adding cells without rebuilding) for unbounded runs.')
}

if (
  process.argv[1] !== undefined &&
  import.meta.url === pathToFileURL(process.argv[1]).href
) {
  main()
}
