# compute (the vibe computer and GPU runners)

Two things live here. First, the vibe COMPUTER, a prototype hyperbolic computer that assembles the three planes of the combined architecture (substrate, compute, memory) on a finite patch of a regular tiling. It compiles TypeScript to a register machine, runs a literal railway cellular automaton on the actual cell graph, and stores content-addressable memory per cell. Second, the headless WebGPU RUNNERS that evolve the rule on the GPU (via the `webgpu` package, no browser) and self-check against a CPU reference. The runners need a real GPU, so they are NOT in the test suite, run them directly. This file is the module index. For the friendly using-guide and the selfhood result, read `../api/draw-and-render.md` and `code/compute/readme.md`.

Import from `@/code/compute/<file>`.

## The computer (compile and run)

| module | key exports | what it does |
|:--- |:--- |:--- |
| `machine/shared` | `makeVibeComputer`, `VibeComputer`, `VibeComputerReport` | the dimension-general hyperbolic computer, assembles substrate, compute, and memory on a tiling patch |
| `machine/2d`, `machine/3d`, `machine/4d` | `make2DMachine`, `make3DMachine`, `make4DMachine` | the per-dimension configs (pick the tiling, `{7,3}`, `{5,3,4}`, `{3,4,3,4}`) |
| `compile` | `compileMachine`, `runMachine`, `Backend`, `CompiledMachine` | the one entry point, compile TypeScript and choose the register representation |
| `ts-to-binary` | `compileToBinary`, `CompiledBinary` | the modern-CPU binary backend (bit-words, ripple-carry) |
| `ts-to-railway` | `compileToRailway`, `CompiledRailway` | the classic Minsky unary backend (token piles) |
| `binary-machine` | `runBinary`, `BinaryProgram`, `WORD_BITS` | run a compiled binary program |
| `ternary-machine` | `runTernary`, `TernaryStep`, `TERNARY_TRITS` | the vibe-aligned balanced-ternary machine |
| `railway` | `runRailway`, `makeRegister`, `railIncrement`, `RailProgram`, `RailSwitch` | the railway register machine (switches and locomotives) |
| `railway-ca` | `makeRailwayCa`, `makeTrackLoop`, `makeBinaryCounter`, `makeSelfExtendingCounter` | the literal railway CA on the cell graph |
| `railway-adder` | `addInto`, `copyInto`, `fibOnRailway` | arithmetic on the railway |

## The hyperbolic cellular automata (Margenstern)

| module | key exports | what it does |
|:--- |:--- |:--- |
| `margenstern-ca` | `compileMargensternCa`, `cyclicRotations`, `doubleRingRotations` | the shared Margenstern hyperbolic-CA compiler |
| `margenstern-pentagrid` | `stepPentagridCA`, `buildPentagridRuleTable`, `pentagridNext` | the pentagrid `{5,4}` automaton |
| `margenstern-pentagrid-2state`, `margenstern-pentagrid-3state` | `pentagrid2State`, `pentagrid3State` | the 2-state and 3-state pentagrid rules |
| `margenstern-heptagrid` | `heptagrid4State`, `HEPTAGRID_RULES` | the heptagrid `{7,3}` automaton |
| `margenstern-dodecagrid` | `dodecagrid5State`, `DODECAGRID_RULES` | the 3D dodecagrid `{5,3,4}` automaton |
| `margenstern-dodecagrid-totalistic` | `dodecagridTotalisticNext`, `dodecagridWeight` | the totalistic dodecagrid rule |

## The GPU compute (WGSL and runners)

| module | key exports | what it does |
|:--- |:--- |:--- |
| `wave.wgsl` | `WAVE_STEP_WGSL`, `BULK_STEP_WGSL`, `WAVE_RENDER_WGSL` | the shared WGSL for the wave and bulk step, used by runners and the browser viz |
| `associative.wgsl`, `associative-wave.wgsl`, `hopfield.wgsl` | `ASSOCIATIVE_MATCH_WGSL`, `ASSOCIATIVE_WAVE_WGSL`, `HOPFIELD_OVERLAP_WGSL`, `HOPFIELD_UPDATE_WGSL` | the memory and Hopfield WGSL |
| `run-model` | `runModel` | exports `runModel(graph, seed)`, returns `{ deterministic, evolves, nonzeroFraction }` |
| `run-*.ts` (scripts) | (no exports) | the self-checked GPU runners, run with `pnpm call` |

Key runners: `run-pure-rule` (the reversible 9-state permutation, checks conservation and reversibility), `run-wave` (the flat-field wave), `run-bulk` (the `{5,3,4}` bulk), `run-bulk-3434` (the `{3,4,3,4}` 24-neighbour bulk), `run-emergent-layers` (coarse-grains to hunt persistent middle layers), `run-self-persistence` (the selfhood test), `run-associative*` (the memory runners), `run-skyrmion-3d` and `run-skyrme-twist` (Skyrmions).

## Entry points

### `makeVibeComputer({ symbol, ... })`
Build the prototype hyperbolic computer on a finite tiling patch. It exposes `compute(source, backend)` (compile and run TypeScript on the register machine), a railway CA on the actual cell graph, and content-addressable memory (`storeWord`, `searchExact` in `O(log N)` beats with exponentially growing capacity). `VibeComputerReport` summarizes substrate degree, compute cost, railway cycle, and memory latency and capacity. Pick the dimension with `make2DMachine`, `make3DMachine`, or `make4DMachine`.

### `compileMachine(source, { backend })` and `runMachine(...)`
Compile TypeScript to a register machine. `backend` is `'binary'` (the modern-CPU default, `O(word)` per op), `'unary'` (the classic Minsky counter, `O(value)` per op, what the token-wedge animation visualizes), or `'ternary'` (the vibe-aligned balanced-ternary machine). The backends live in their own modules, `compileMachine` is the thin selector.

### The GPU runners
Run with `pnpm call code/compute/run-pure-rule.ts` (and the others). Each self-checks the GPU against a CPU reference of the same rule on a small grid, then benchmarks at scale. A green run proves correctness. Output goes to `make/` (gitignored). Use ffmpeg (or `task/render-video.sh`) to assemble frames into video.

## Used by

The vibe computer realizes the computation plane of the combined architecture, using `code/operator/associative-memory` for memory and `code/substrate/coxeter/cell-direct` for the substrate. The GPU runners drive the large-scale wave, bulk, and selfhood demonstrations. The associative and Hopfield WGSL back the memory arena (`../associative-memory-engine.md`). The pure-rule runner is the GPU witness for `../rule-engine.md`.

## See also

- `code/compute/readme.md`, the GPU renderer catalog, tuning knobs, and the selfhood test.
- `../api/draw-and-render.md`, the friendly using-guide.
- `render.md`, `draw.md`, the rendering side.
