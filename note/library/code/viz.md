# viz (browser-facing visualization exports)

The scripts that turn a real vibe run into something a browser page or a paper figure can show. Two kinds live here. The static SVG figures (the 24-clock, the three curvatures) are minimal geometric diagrams written straight to `make/`. The export scripts (`horosphere-export`, `maintenance-export`, `gravity-test`) run a genuine experiment on the real `{5,3,4}` crystal and record the result as JSON the browser replays or as a console report. These are run directly, not part of the test suite. Each names the exact experiment or note it mirrors, and each is explicit about scope (a placed probe versus an emergent self).

Run with `npx tsx code/viz/<file>.ts`. Output goes to `make/` (gitignored).

## Modules

| module | key exports | what it does |
|:--- |:--- |:--- |
| `clock-24` | (script) | the 24-clock, two concentric rings of 12 radial tick-bars with 12 spokes, minimal SVG to `make/24-clock.svg` |
| `curvature` | (script) | the three curvatures (spherical, Euclidean, hyperbolic) as geodesic-triangle SVGs to `make/curvature-*.svg` |
| `gravity-test` | `gravityTest`, `main` | the gravity hole-finder, does the bare `{5,3,4}` rule pull two matter lumps together (an adversarial no-gravity test) |
| `horosphere-export` | `exportHorosphere` | run the cohesive perception rule on the real `{5,3,4}`, take a horosphere slice, project it flat, and record the tones beat by beat as JSON for `/vibe/horosphere` |
| `maintenance-export` | `exportMaintenance` | the P171 self-maintenance experiment, a maintained self keeps its identity while an unmaintained one dissolves, exported flat for `/vibe/maintenance` |

## Entry points

### `exportHorosphere(input?)`
The faithful selves pipeline. The cohesive perception rule (a charge hops toward where it has more same-sign neighbours, conserving) runs on the genuine hyperbolic `{5,3,4}` crystal. It then takes a horosphere slice (a flat Busemann level set), projects its cells to flat 2D, and records the slice's tones per beat. The integrated self-patches live in the 3D bulk and cross the horosphere as 2D regions, so the flat render is the cross-section of real selves growing, merging, and healing. Nothing about the rule changes, only the view. Writes a JSON the browser page replays.

### `exportMaintenance(input?)`
Replicates experiment P171 exactly. A controlled self region (a placed ball of cells) is given a balanced identity pattern (equal pleasure and pain, net charge zero). Two copies run under the same conserved-exchange rule, one MAINTAINED (the will restores the region to its identity each beat), one left alone. The maintained self keeps its identity, the unmaintained one dissolves into the churn. A local patch is projected flat for viewing. Scope: the region is a placed probe, not an emergent self, but the dynamics, conservation, and dissolution are the genuine model.

### `gravityTest(input?)`
The gravity hole-finder. Places two lumps of matter on the genuine `{5,3,4}`, separated by peace, runs the cohesive conserved-exchange rule, and measures whether their separation shrinks over time for several starting gaps. The suspected hole is that the rule is local with no long-range force, so the lumps should only interact on contact. An adversarial test of whether the bare rule has gravity.

## Used by

The clue.surf `/vibe/*` pages replay the JSON these exports produce. They mirror the selves and gravity experiments in `test/experiment/selves/` and the notes in `note/research/vibe/notes/` (`what-counts-as-a-self.md`, `visualizing-the-selves.md`, P171, P110). The horosphere and maintenance work is the deep dive `../coarse-graining-and-selves.md`.

## See also

- `draw.md`, the canvas and PNG primitives.
- `render.md`, the `run/534/band/` horosphere scripts that render the same slices.
- `../coarse-graining-and-selves.md`, the selves and coarse-graining deep dive.
