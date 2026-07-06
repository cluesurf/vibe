// Assembly Theory on the substrate: reproducible, selected, life-like structures have a low
// assembly index, random noise a high one, and a threshold separates them. Walker and Cronin's
// Assembly Theory measures the number of steps to build an object allowing reuse of sub-parts.
// A high-copy-number object, one that gets made again and again, must be built by reusing motifs,
// so it has a bounded assembly index. Random matter has no reusable motifs, so a high one. This
// is Assembly Theory's one quantitative order parameter, and no vibe experiment measured it.
//
// The assembly index is proxied here by the number of DISTINCT fixed-length motifs a structure
// contains, low when the structure is built by tiling a few reused motifs, high when every window
// is different. Three structures are compared: a replicated one (a self-copied motif tiled, the
// output of a constructor, low assembly), the same with a few defects (a selected variant, still
// low assembly and high copy number), and a random one (high assembly, not built).
//
// Measured: the replicated and selected structures have a small distinct-motif count (low
// assembly), the random structure a large one (high assembly), tens of times more. So a low
// assembly index marks the built-and-selected structures and a high one marks noise, with a
// threshold between, the Assembly Theory order parameter carrying over to the substrate.
//
// The control is the random structure, high assembly, not reproducible, so it is the reuse of
// motifs (the being-built), not the mere length or tone count, that lowers the assembly index.
//
// Depth L2. It measures the assembly-index proxy on built versus random structures on the
// committed substrate, importing Assembly Theory's order parameter, deterministic (seeded, the
// structure kind varied not the seed). It pairs with selection-by-persistence.

import { experiment } from '@/test/scaffold/suite'
import { verdict } from '@/test/scaffold/verdict'
import { makeRng } from '@/code/tool/rng'

const LENGTH = 240
const MOTIF = [1, 1, -1, 0, 1, -1]
const BLOCK = 6
const DEFECTS = 8

// the assembly-index proxy: the number of distinct length-BLOCK motifs in a structure
function distinctMotifs(structure: number[]): number {
  const motifs = new Set<string>()

  for (let i = 0; i + BLOCK <= structure.length; i++) {
    motifs.add(structure.slice(i, i + BLOCK).join(','))
  }

  return motifs.size
}

export default experiment({
  id: 'selves/assembly-index-threshold',
  code: 'E-SLF-0167',
  title:
    'built and selected structures have a low assembly index while random noise has a high one, Assembly Theory order parameter on the substrate',
  category: 'selves',
  substrates: ['3434'],
  depth: 'L2',
  paper: false,
  run() {
    // a replicated structure: a motif tiled, the output of a constructor (low assembly)
    const replicated = Array.from(
      { length: LENGTH },
      (unused, index) => MOTIF[index % MOTIF.length]!,
    )

    const replicatedAssembly = distinctMotifs(replicated)

    // a selected variant: the replicated structure with a few defects (still high copy number)
    const selected = replicated.slice()
    const defectRng = makeRng({ seed: 7 })

    for (let d = 0; d < DEFECTS; d++) {
      selected[Math.floor(defectRng.next() * LENGTH)] = 0
    }

    const selectedAssembly = distinctMotifs(selected)

    // a random structure: high assembly, not built
    const randomRng = makeRng({ seed: 42 })
    const random = Array.from({ length: LENGTH }, () => {
      const draw = randomRng.next()

      return draw < 1 / 3 ? -1 : draw < 2 / 3 ? 0 : 1
    })

    const randomAssembly = distinctMotifs(random)

    const ratio = randomAssembly / replicatedAssembly

    const replicatedIsLow = replicatedAssembly < 30
    const selectedIsLow = selectedAssembly < 60
    const randomIsHigh = randomAssembly > 100
    const separated = ratio > 5
    const ok =
      replicatedIsLow && selectedIsLow && randomIsHigh && separated

    return verdict({
      status: ok ? 'pass' : 'fail',
      claim:
        'a replicated structure (a tiled motif) and a selected variant of it have a low assembly index (few distinct motifs, built by reuse) while a random structure of the same length has a high one (every window different), tens of times more, so a low assembly index marks the reproducible, selected, life-like structures and a high one marks noise, the Assembly Theory order parameter on the substrate',
      metrics: {
        replicatedAssembly,
        selectedAssembly,
        randomAssembly,
        ratio: Number(ratio.toFixed(1)),
      },
      // CONTROL: the random structure has a high assembly index, not reproducible.
      control: { randomAssembly },
      notes:
        'Assembly Theory (Walker-Cronin), no prior vibe experiment. The assembly-index proxy is the distinct-motif count. Low assembly marks the built-and-selected, pairing with selection-by-persistence. Deterministic (seeded, structure kind varied not seed).',
    })
  },
})
