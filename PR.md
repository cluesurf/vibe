# Next pieces

One branch for this round's experiments. Each item has its own section.

## The kernel on a GPU: float64 hip and cuda backends, byte for byte, measured on an MI325X

The kernel's primitives now run on a data-center GPU in float64 and give the JavaScript reference's bytes. The CPU
backends and every engine's default are unchanged. The architecture note is `note/research/vibe/kernel.md` in the
parent repo, in the section "The GPU backends".

### What changed

- **`kernel/src/gpu.cu`**, new: every primitive as a GPU kernel, in one C-like source that compiles as HIP, as CUDA and,
  with `-DVK_EMU`, as plain C++ on one CPU thread.
  - Each output element is summed by one thread, in the reference's order. There are no atomics and no tree
    reductions.
  - The sea piece runs as five ordered passes. The hole pair piece runs as gather, transform axis by axis, phase, then
    scatter.
  - Contraction is off through the compile options and a pragma.
- **`kernel/src/gpu.rs`**, new: the binding, behind the cargo features `hip`, `cuda` and `emu`. The default build is
  unchanged.
  - It opens the runtime with dlopen and compiles gpu.cu at load: hiprtc with `-ffp-contract=off`, NVRTC with
    `--fmad=false`.
  - It owns device memory, checks every buffer size, and synchronizes after each launch.
  - `node.rs` changed only to share its helpers and the pair-operator reader.
- **`code/kernel/gpu.ts`**, new: the backends `hip`, `cuda` and `gpu-emu`, with three kinds of array (held, table,
  copied).
- **`code/kernel/device.ts`**, new: `onDevice`, `setInto`, fetch and put.
- **`Kernel.device`**: `fastCycles`, `fastSeaCycles` and `fastHoleCycles` are new, and `fastFilter` and
  `fastAutocorrelation` now hold their state on the device. The engines take `{ backend: 'hip' }`.
- **`task/kernel/build.ts native hip|cuda|emu`**: writes `kernel/host/vibe-kernel-gpu.node`, and renames every artifact
  into place.
- **`task/kernel/check.ts`**: takes `CHECK_BACKENDS` and covers the GPU backends, the held paths and the GPU wired
  paths.
- **`task/kernel/bench.ts`**: adds `holes` and `sorted`, the GPU backends, `BENCH_THREADS`, and a warm-up cycle.
- **`task/kernel/parity.ts`**, new: 57 short cases on every backend, with golden files in `task/kernel/parity/`
  (`pnpm kernel:parity`).
- **`task/kernel/gpu-run.ts`**, **`gpu-watchdog.ts`** and **`gpu-job.sh`**, new (`pnpm gpu:run`, `pnpm gpu:watchdog`).
  - They rent exactly one tagged droplet and run the job on it.
  - A detached watchdog destroys the droplet at creation plus the cap, and `--sweep` removes any leftover.
  - Nothing account-specific is in them. The token comes from the environment only.

### Results

- **Mac, gpu-emu** (the GPU kernels on the CPU):
  - `check.ts` with native, wasm and gpu-emu: PASS, 2,425 comparisons, 0 failures.
  - The contracted emulator fails 168 of 439, as required.
  - `parity.ts --golden`: 57 of 57 cases on both paths.
- **MI325X, hip** (tor1, 20 EPYC 9575F cores; DigitalOcean offered no MI300X that day):
  - `check.ts` with native and hip: PASS, 2,097 comparisons, 0 failures.
  - Its contracted control fails 168 of 439, as required.
  - `parity.ts` live against the droplet's JavaScript: 57 of 57 cases (copy path) and 50 of 50 (held path).
  - `parity.ts --golden`: 3 cases differ, because the Mac's JavaScript reference and the droplet's differ there (native
    x20 differs in the same three). The golden files are not yet byte-portable across x86 and arm64 in those cases.
  - The parity FMA control fails 97 runs, as required.

**Seconds a cycle, every row bytes-equal to the reference:**

| engine | droplet native x20 | MI325X hip | hip vs droplet CPU |
| --- | --- | --- | --- |
| ball radius 24 | 0.0101 | 0.0045 | 2.2x |
| ball radius 40 | 0.0690 | 0.0257 | 2.7x |
| reduced vector R 30 | 0.0088 | 0.0051 | 1.7x |
| sea L 4 | 0.0088 | 0.0084 | 1.05x |
| three holes L 4 | 0.0486 | 0.0147 | 3.3x |
| four holes L 4, sorted store | 8.19 | 1.70 | 4.8x |

Against the Mac's native 16 in kernel.md, hip is 8 to 29 times faster. That Mac was loaded, at a load average of 70 to
105, so the droplet column is the fair comparison.

**Cost:** two droplet sessions, 2.8 min (the first lost to the image's first-boot login gate) and 6.9 min, about $0.76
in total. Both were destroyed and confirmed gone by tag.

### Status and follow-ups

- **cuda is compile-ready and UNTESTED.** No NVIDIA GPU has run it. kernel.md lists what a Lambda GH200 needs: aarch64
  Grace, linux-arm64 node, and `build.ts native cuda`, with the check run first.
- **The three golden cases** need their cross-platform difference pinned down: a NaN sign bit, or a `Math` function that
  differs between the node builds.
- **The sea on the GPU is memory-bound.** Fusing its passes, and dropping the synchronize after each launch, are the
  next speedups.

## OPEN-LGT-02 and OPEN-LGT-12: the split by spectral flow from the identity (E-FRC-0275)

### What changed

- `code/measure/spectral-flow.ts`: the ladder light split into symmetry blocks (momentum, the charge mirror C, the
  reflection P), the block beat written exactly as Y^dag diag(F) Y diag(D), a tracker that carries every level's
  phase from U(0) = 1 with an exact increment window (Hellmann-Feynman for a product) and eigenvector matching,
  the trace identity checked at every step, turn and line meetings counted, the cyclic (analytic) lift, and the
  Planck ratio of any lift. A unitary eigensolver on the complex Householder solver, 3 to 5 times faster than
  quantum-ladder's real embedding, with the same phases to 1.3e-15.
- `test/experiment/gauge/spectral-flow.ts` (E-FRC-0275), registered in `test/registry.csv`, the barrel and the
  catalog.

### The derivation (in the header, before the gate run)

- The trace identity catches a miscounted increment, not a swap. Where two levels of one block meet on the circle
  a whole turn apart, the two matchings differ by a turn moved between them and have the same sum.
- Inside one block, levels avoid each other, so the exact continuation keeps their cyclic order: the lifted phases
  stay d consecutive points of the periodic set, fixed by the trace. That is the cyclic lift. It needs no path, it
  is continuous in ρ, and every block spans under one turn. A lift that spans more has crossed avoided meetings for
  lack of resolution, so it depends on the step and the path.
- Predicted, frozen: the exact lift folds levels into the vacuum gap and is not an energy.

### Results (gates fixed in the header before the gate run, probes on N = 7 disclosed)

- **E-FRC-0275, fail as derived, 1 of 6 gates.** A1 held: the block beat matches the ladder's to 1.8e-15, the
  trace identity holds to 1.8e-12 on every tracked step, the cyclic window integer to 3.4e-13.
- A2 held on (9, 2): the resolved blocks equal the cyclic lift to 1.8e-15. It failed on (11, 2): at window π/32 and
  overlap 0.999 the tracker still crossed 1 to 11 turn meetings in every block, so none could be compared.
- E failed on every box: the cyclic lift puts 7 to 136 levels inside the vacuum gap. The harmonic reading's control
  keeps the gap on (9, 2) and (9, 3).
- The tracked lifts are not branch-free: quarter step against coarse differs by 1.0 to 2.9 radians, and a carried
  path by 0.7 to 2.0, with the trace exact on all of them.
- Read on the exact lift: the departure is 1.9 to 25.5, a thermal energy 3 to 26 times Planck's, not a Planck
  criterion. The 2-square spread is 0.012 to 0.06 up to N = 21, then 0.33 and 0.36 at N = 25 and 29: fit slope +2.7,
  so it does not fall. R = 0.872 (N 9) and 0.862 (N 11), separated and nearer 5/6, and 0.63 with error 0.38 at
  N = 13. Those picks are of a folded spectrum and are not read as evidence. The control ρ*(2) lands at 3.18, 2.53
  and 3.91, not at 3.

### How it was tested

```
node_modules/.bin/tsx test/rerun.ts E-FRC-0275          # 1,771 s, fail
node_modules/.bin/tsc --noEmit -p tsconfig.check.json   # exit 0
node_modules/.bin/tsx test/catalog.ts                   # 1,545 rows
node_modules/.bin/tsx task/check-labels.ts
node_modules/.bin/tsx task/check-coverage.ts
node_modules/.bin/tsx test/result.ts check
```

### Status and follow-ups

- OPEN-LGT-02 stays open at 0.4614 or 0.4146. Spectral flow from the identity is not a branch-free energy: the
  exact lift is choice-free but folds, and any lift that keeps the harmonic turns depends on how finely the path
  resolves avoided meetings. The Planck criterion on the ladder's Floquet light has now failed three ways (0269,
  0270, 0275). What is left: a seam criterion that reads no energies at all, or the 3d light.
- OPEN-LGT-12 stays open.
- Notes changed outside this repo: `open.md` (Next up item 3, LGT-02, LGT-12), `remaining-pieces.md` (part B of
  "Two exact reductions"), `solutions.md` (section 7).

## OPEN-LGT-02 and OPEN-LGT-03: the light's balance and the two alphas (E-FRC-0265, E-FRC-0266)

### What changed

- `code/measure/trit-wraps.ts`: hot deterministic starts for the trit light, the integer kernel vector of the husk
  curl's transpose, exact per-triangle forces, and paired runs of two lights or two starts.
- `code/measure/two-alphas.ts`: the long-wave speed, static permittivity (Gauss's law) and radiative permittivity
  (a one-link dimer's golden rule) of any light symbolizer, and the simple cubic control.
- `test/experiment/gauge/trit-rule-wraps.ts` (E-FRC-0265) and `test/experiment/gauge/two-alphas.ts` (E-FRC-0266),
  registered in `test/registry.csv`, the barrel and the catalog.
- `task/run-experiment.ts`: runs one experiment by file and prints its verdict, so a note's proof can name one
  command.

### Results (both blind: gates frozen in the headers, no probe, first run recorded)

- **E-FRC-0266, pass, 7 of 7 gates.** On the husk light the bulk rule's own stencil defines, the static
  permittivity is 5.99999999997, the radiative one is 5.99999995 to 6.00000003 on all 9 link directions, and
  c²/κ = 0.666666664. So the Coulomb α and the golden-rule α of the husk are one number, √(3/(2ρ))/(12N), to 1e-8.
  The cubic control reads 1, 1, 1 and reproduces E-FRC-0240's 1/(2N√ρ) to 1e-11. √24 = 6 × √(2/3), read as
  4.898979476: per link against per dock, times the husk's speed against the strip's. A convention, not a
  disagreement (which would need a radiative permittivity of 1.22). Rays at ω = 0.01 read 1.0046 and 1.0077 of it.
- **E-FRC-0265, partial as predicted, 7 of 7 gates.** The trit rule run hot, 0 mismatches against the husk
  integers over 600 beats with every kind of wrap present. Angle wraps change nothing the rule reads, a potential
  wrap is timed by a kernel part of U that nothing reads (the first flux difference is the first wrap difference
  on all six runs), and |e| exceeds D on 65 to 67 percent of link-beats. The rule has a seam on the magnetic side
  only, so it cannot choose the light's split. Every bulk trit is a function of its column and fills by its depth
  position (0.939 to 0.062 down an axis column), so 3/8's premise is false in the rule.

### How it was tested

```
pnpm call task/run-experiment.ts test/experiment/gauge/two-alphas.ts        # 83 s, pass
pnpm call task/run-experiment.ts test/experiment/gauge/trit-rule-wraps.ts   # 181 s, partial
node_modules/.bin/tsc --noEmit -p tsconfig.check.json
node_modules/.bin/tsx test/catalog.ts
pnpm check:labels
pnpm check:coverage
pnpm result check
```

The two gate runs were made in the experiment/light-balance worktree before the move here. The files are the same
apart from the recorded first-run paragraphs.

### Status and follow-ups

- OPEN-LGT-03 closed with proof. OPEN-LGT-02 stays open, narrowed: it now depends on OPEN-LGT-12 (a 3d quantum
  light with a seam on each side). The equal-capacity reading 0.4614 is argued for it, not measured blind.
- OPEN-LGT-04 now uses only the Coulomb form. The frozen α prediction was not rerun through E-MTH-0010's null,
  because the split is not settled blind.
- Notes changed outside this repo: `note/research/vibe/roadmap/remaining-pieces.md` (two new sections after
  E-FRC-0262), `open.md` (LGT-01 to 04), `everything.md` (the "value of α" row's text, no status change).

## OPEN-LGT-02 and OPEN-LGT-12: the split by its ratio alone (E-FRC-0270)

### What changed

- `code/measure/ratio-balance.ts`: the ladder beat at any real split ratio (root 1, fractional exponents), the
  Planck departure on a grid uniform in ln ρ, the sub-grid optima with a running median, the spread, a power fit,
  and the Gaussian-tail model of the finite-N Planck optimum (each register a Gaussian with its exact harmonic
  thermal variance, seam weight erfc).
- `test/experiment/gauge/ratio-balance.ts` (E-FRC-0270), registered in `test/registry.csv`, the barrel and the
  catalog.

### Results (gates fixed in the header before the gate run, probes disclosed)

- **E-FRC-0270, fail, the clean negative, 1 of 4 gates.** Held, Q1: the beat is a function of ρ alone, a theorem
  (its phases are c/M and r/M, and every exact split of one ratio is a multiple of the least one), checked bit for
  bit on a split and its double, and to 1.2e-15 against all 24 of E-FRC-0269's (13, 2) exact splits. So "averaged
  over the splits of one ratio" is one operator, and 0269's "follows the root" was fine structure in ρ. A probe
  traced one jump to a single level whose harmonic reading (7.14) and phase (4.00) differ by π, so its unwrap turn
  flips: the jitter sits on the seam levels that carry the signal.
- Failed, Q2 to Q4. The split-to-split spread of the Planck-optimal ratio (10 shifted sub-grids at 0269's density,
  5-point running median) on 2 squares, N = 9 to 29: 0.30 to 0.05 at x = 1 (fit slope −0.41), 0.26 to 0.07 at x = 2
  (slope +0.48). R = ρ*(3)/ρ*(2): 1.128, 0.831 (N 9), 1.442, 1.243 (N 11), errors 0.29 to 0.64 against the 0.0912
  a separation needs. The x = 1 trend reaches separation only at N ≈ 590 (λ = 1) to 123,187 (λ = 12.5 measured),
  against a dense reach of N = 25 on 3 squares. No sparse method helps: on (11, 3) the levels holding all but 1e-9
  of the x = 2 weight span 4.0 turns of 2π and are 1,316 of 1,331.
- Read: the 2-square control lands at 2.75 to 2.91 (x = 2, N 21 to 29), below 3 as the Gaussian-tail model's
  finite-N shift puts it (2.64 to 2.74). The model's own R on the run's boxes is 0.92 to 1.00, so at these N even
  a smooth statistic would sit nearer the average.

### How it was tested

```
pnpm call task/run-experiment.ts test/experiment/gauge/ratio-balance.ts   # 8,616 s, fail
node_modules/.bin/tsc --noEmit -p tsconfig.check.json
node_modules/.bin/tsx test/catalog.ts
pnpm check:labels
pnpm check:coverage
pnpm result check
```

### Status and follow-ups

- OPEN-LGT-02 stays open at 0.4614 or 0.4146. The ladder's Planck criterion cannot pick the split at any N a dense
  spectrum reaches, and the thermal sum of a Floquet light is not a function of U, so no sparse method computes it.
  What is left: a seam criterion that does not unwrap energies, or the 3d light.
- OPEN-LGT-12 stays open.
- Notes changed outside this repo: `open.md` (Next up item 3, LGT-02, LGT-12), `remaining-pieces.md` (a new section
  after E-FRC-0269), `solutions.md` (section 7).

## OPEN-LGT-12 for OPEN-LGT-02: what a quantum light's seams balance (E-FRC-0269)

### What changed

- `code/measure/quantum-balance.ts`: the exact split of κ = 2/N nearest any rational ratio (integer search over
  w/c = p/q), the Planck ratio of one ladder split at given temperatures from its dense Floquet spectrum, and the
  husk's register graph (links joined through shared triangles, per-link triangle classes).
- `test/experiment/gauge/quantum-balance.ts` (E-FRC-0269), registered in `test/registry.csv`, the barrel and the
  catalog.

### Results (gates fixed in the header before the gate run, probes disclosed)

- **E-FRC-0269, fail, 3 of 5 gates.** Held: one modulus reaches every husk register (576 links, one component,
  every link in an n_P = 2 triangle, seen in a smoke probe first and disclosed), E-FRC-0262's fills reproduced
  (average 0.4613818491, class fills to 1e-6), and the ladder box fills exactly as derived. So a quantum light adds
  only which statistic of the fills its seams balance: the average (0.4613818 on the husk) or the worst register
  (0.4146386).
- Failed: P1 (the least Planck departure at the scan's end at N = 9) and P2 (2 of 8 ratios R nearer the predicted
  worst-register reading: 0.934, 0.934, 0.889, 1.151, 1.016, 1.016 on 3 squares, 0.781, 1.038 on 4, against 5/6 and
  4/5). The Planck departure jumps by up to 2.4 times between neighboring exact splits, so it follows each split's
  root and not its ratio, and the 2-square control (both readings 3) lands at 2.27 to 3.82. Read, not gated: at
  x = 1 all four R fall on the worst-register side.

### How it was tested

```
pnpm call task/run-experiment.ts test/experiment/gauge/quantum-balance.ts   # 3,507 s, fail
node_modules/.bin/tsc --noEmit -p tsconfig.check.json
node_modules/.bin/tsx test/catalog.ts
pnpm check:labels
pnpm check:coverage
pnpm result check
```

### Status and follow-ups

- OPEN-LGT-02 stays open, narrowed to 0.4614 or 0.4146. The Planck-optimal split on the ladder cannot pick between
  them at N ≤ 13. Next: a criterion that depends on ρ alone (Planck averaged over the splits of one ratio, or gated at
  the onset against its split-to-split spread) on larger N with a sparse spectrum.
- OPEN-LGT-12 stays open. The 3d light has about N^(8V) gauge-invariant states and does not run exactly. Its
  dependencies form a loop (LGT-12 on LGT-01, LGT-01 on LGT-02, LGT-02 on LGT-12).
- Notes changed outside this repo: `open.md` (Next up item 3, LGT-02, LGT-12), `remaining-pieces.md` (a new section
  after E-FRC-0266), `solutions.md` (section 7 and the loose-ends table).

## OPEN-FND-07: the kept branch of a like meeting (E-QTM-0163)

### What changed

- `code/measure/kept-branch.ts`: a switch on the kept branch's interference. Each term carries a record of its
  like-meeting outcomes. 'on' is the rule. 'off' adds two terms only when their records agree on every meeting but
  the last, which is the channel "every meeting but the last dephased". 'strict' records the last one too. The coin is
  never recorded. Also a circuit on the rule's line-of-two gate over the point registers, with 'on', 'off' and
  'once'.
- `test/experiment/quantum/kept-branch.ts` (E-QTM-0163), with its rows in `test/registry.csv`,
  `test/experiment/all.ts`, the regenerated `test/catalog.csv` and the readme count (1,520 rows, which includes the
  other agents' rows at the time).

### Results (gates fixed in the header before the first run, probes disclosed)

Pass, every gate held on the first run (795 s):

- **The premise was wrong.** The working vacuum keeps the interference. E-RLT-0105's like pair meets again every 3
  beats on side 4 and every 6 on side 8 (every 12 on integer+6), on 17 of 17 starts, as its line wraps the box. The
  rule adds terms whose meeting outcomes differ 42 to 140 times (side 4) and 4 to 44 times (side 8) by beat 47. On
  against off: L1 0.61 to 1.20 and 0.56 to 0.84 at beat 20.
- **The knot passes one meeting's ceiling.** CHSH above √7 on 17 and 16 of 17 starts, up to 2.828403 (Schmidt
  0.5030, 0.4970), never reaching 2√2. With the switch off no member exceeds √7 (control C1).
- **Exact where one meeting is all there is.** On and off are the same state at the first split (R0, 34 of 34). A
  lone love makes 0 splits (L0, 17 of 17).
- **The held rows.** Of the 13 held rows in ledger section A, only Tsirelson's "reached" clause needs the
  interference: E-QTM-0133's 18 words reach (1/2, 1/2, 0) on and 0 off (best off member 4/√3). E-QTM-0100's
  three-meeting clause reads 1/4, 3/4, 1 on and 1/4, 3/8, 7/16 off. Every other held row rests on one meeting, on
  love-fear meetings, on the coin, or on identities that hold on every state.

### How it was tested

In next-pieces, after the move: `node_modules/.bin/tsc -p tsconfig.check.json` (clean), `test/catalog.ts` (1,520
experiments), `task/check-labels.ts` (1 contradicted label, `gravity/cubic-slide-speed.ts`, not from this item, and
20 held for review, all octonion files), `task/check-coverage.ts` (0 unknown, 0 mismatches), `test/result.ts check`
(0 problems). The gate run (`pnpm rerun E-QTM-0163`) was made in the experiment/kept-branch worktree before the
move. The file is the same apart from the title and the recorded first-run paragraph. Log: `tmp/qtm163-run1.log`.

### Status and follow-ups

- OPEN-FND-07 ticked with proof. The frame-exchange fallback was not built, because no held row loses the
  interference.
- Not measured: whether a free pair re-meets on the honeycomb's open lines. On the box the re-meeting comes from the
  wrap.
- Notes changed outside this repo: `remaining-pieces.md` (a new section before "A coincidence worth testing"),
  `open.md` (FND-07), `solutions.md` (§1, the answer), `everything.md` (the superposition row adds E-QTM-0163, and the
  Tsirelson row gets a note, no status change).

## OPEN-MOT-01: the Coulomb pull split around the stream (E-SPN-0176)

### What changed

- `code/measure/register-coulomb-split.ts`: E-SPN-0173's pull taken out of the beats as one operator. It has the two
  in-beat pieces (P_SS, P_DD) with the mixer set to 1, and the whole pull V in the order that makes "free cycle, then V"
  E-SPN-0173's cycle conjugated. There are three placements: 'coulomb' (E-SPN-0173's cycle, untouched), 'factored' (V K)
  and 'strang' (V_h K V_h, every piece at half the phase). `dockCounts` puts each sector's pull at its members' true
  docks.
- `test/experiment/spin/register-coulomb-split.ts` (E-SPN-0176), with its rows in `test/registry.csv`,
  `test/experiment/all.ts`, the regenerated `test/catalog.csv` and the readme count (1,521 rows, spin 180, L2 1,145).

### Results (gates fixed in the header before the gate run, probes disclosed)

Fail on H1, H3, H4, H5 and H6, as predicted. H0, H2, the instrument and every control hold.

- **The first-order [V, K] error is exactly a conjugation of the cycle, so it never moved R.** P_SS U = V K P_SS to
  1.1e-15. So the split can change R only through the pull pieces' own commutators.
- **Split against unsplit, one ball and one filter schedule each:** R 11.55 against 12.98 (a_B 3), 10.79 against 10.25
  (a_B 3.5), 15.05 against 15.31 (a_B 5), with formulas of 1.31, 1.23 and 1.15. The change is −11%, +5% and −2%, and it
  falls with the commutator (2.3e-2 to 8.8e-4). H6 (split removes half the excess) fails at every coupling.
- **The true dock is the label.** The D content's centroid is exactly its label (6.9e-18). Its pull equals G beyond one
  link to 8e-15 and differs only at the core. It reads R 11.92.
- **Witness:** the free cycle and the half-phase pull pieces against the full 192×192 rule, 3e-17 to 1.1e-16. The unsplit
  form is E-SPN-0173's cycle bit for bit. With the light off, the split is the free cycle bit for bit.
- **H5 is not a clean read.** The a_B 5 point is on a radius-14 ball (2.8 a_B) with a 512-cycle filter, residual 9e-3.

### How it was tested

The gate run was made in the open-pieces worktree before the move (the points in five parallel processes, the longest
15,908 s). Logs and part files: `tmp/rcs-exp-run1.log`, `tmp/rcs-gate-*.log`, `tmp/rcs-part-*.json`, the probes
`tmp/rcs-probe1.log` to `tmp/rcs-probe3.log`, the smoke `tmp/rcs-smoke.log`. The engine is byte-identical to the one
run. The experiment file differs only in two sentences that pointed at the weak-pull experiment by a code it does not
hold here. In next-pieces, after the move (`tmp/rcs-checks-next.log`): `tsc -p tsconfig.check.json` exit 0,
`test/catalog.ts` 1,521 experiments, `task/check-labels.ts` (1 contradicted 3434 label, not from this item, 20 held for
review), `task/check-coverage.ts` (0 unknown, 0 mismatches), `test/result.ts check` (0 problems).

### Status and follow-ups

- OPEN-MOT-01 stays open. Where the pull is placed does not cause the R excess: it is a second-order core term (about
  a_B^−4.8 on E-SPN-0173's balls). What remains is the weak pull, spin/register-coulomb-weak's symmetry-reduced engine
  at a_B 6, 8 and 12.
- That file is registered as E-SPN-0183 (see its section). E-SPN-0176 is taken by this item.
- Notes changed outside this repo: `remaining-pieces.md` (a new section after E-SPN-0173's), `open.md` (MOT-01: a ladder
  row, the result, and the closing route).

## OPEN-FND-02: the many-body register rule run with the sea present (E-SPN-0175)

### What changed

- `code/measure/register-sea.ts`: the D4 torus (relative moves, shortest-image string length, Bloch momenta), a two-hole
  engine on the full 192 x 192 slot-and-register space with no reduction (the member mixers, the sector string and the
  sector contact in one sector piece, the swap coin and the stream), the moving blocks W(q) = range(U(q) - 1) at every
  torus momentum, the flat count N_F by a Fourier transform over the relative docks, projected contact starts, and the
  lifted K and store triggers counted over every two-hole configuration.
- `code/measure/register-meson.ts`: `betaOf`, `partnerBasis` and `pieceAt` exported (no other change). The new sector
  piece is checked against `pieceAt` in the experiment.
- `test/experiment/spin/register-sea.ts` (E-SPN-0175), with its rows in `test/registry.csv`, `test/experiment/all.ts`,
  the regenerated `test/catalog.csv` and the readme count (1,525 rows, spin 181, foundations 157, gauge 267, L2 1,149).

### Results (gates fixed in the header before the gate run, probes disclosed)

Pass, as predicted. Every gate, the instrument and every control hold on the first run (1,351 s).

- **R, the sea map, exact.** On every Fock state of an 8-mode toy: Xi Gamma(P) Xi^-1 = det P Gamma(conj P), sector
  pair phases map to hole counts, raw counts add a one-body Hartree phase, and the register exchange's image is
  O + (R F^2 - R^2 F) / 2 + (R - F) N at five (R, F). Literally on the real 192-mode pieces: 72 complementary minors of
  size 189 to 191 (38 nonzero) match Jacobi within 3.6e-13.
- **V.** X even, the stream even on L 4, 6, 8, u^8 conj(u)^8 = 1: the full sea is one branch. A sea with one member a
  slot in register 0 is kept by beat 1 (24 rows) and branched by beat 2 (144).
- **F, the flats.** Two holes on the L = 4 torus, 64 cycles: N_F within 3.5e-14 and 3.3e-14 of 0 from two moving
  starts, within 1.1e-13 of 1 with one hole frozen, while up to 0.2 to 0.4 of the weight sits at contact.
- **K.** 4,718,592 two-hole configurations: least slot occupancy 6, K 0, store 0.
- **Controls.** E-SPN-0163's register exchange as a plain dock contact moves N_F by 0.339, 0.687 and 0.154.
  E-SPN-0147's member string moves it by 8.6e-3, 8.4e-3 and 1.3e-3. Two members on an empty mesh put 0.217 on K's
  trigger.
- **Read.** A raw (not sea-counted) string's Hartree phase is 0.577, -1.900 and 0.106 a beat on L 4, 6, 8, so the hole
  mass would depend on the box. A hole-relative K would fire on 0.18 to 0.39 of the weight at its peak.

### How it was tested

Probes in the experiment/register-many-body worktree (`tmp/rs-probe1.ts` to `rs-probe3.ts`, `rs-smoke.ts`), before the
move. The gate run here: `test/rerun.ts E-SPN-0175`, log `tmp/spn-sea-gate.log`. Checks here, log
`tmp/spn-sea-checks.log`: `test/catalog.ts` (1,525), `tsc -p tsconfig.check.json` exit 0, `task/check-labels.ts`,
`task/check-coverage.ts`, `test/result.ts check`.

### Status and follow-ups

- OPEN-FND-02 ticked with proof, under two conditions the run found: every pair piece acts inside the beat's sector,
  and it is counted from the sea.
- Limits: K is lifted by occupancy (a hole-relative lift would fire). One tone, one flavor in the runs, two holes.
- `spin/register-coulomb-weak.ts` once declared E-SPN-0175 too. It is registered as E-SPN-0183.
- /vibe/physics/vacuum still says the rule is "not written".
- Notes changed outside this repo: `remaining-pieces.md` (a new section after E-SPN-0163's, and "Order of work" step
  3), `open.md` (FND-02 ticked, "Next up" item 2, disagreement 7), `everything.md` (the "one rule" and "Pauli exclusion"
  rows' text, no status change).

## The four broken constraints (E-FND-0157, E-FRC-0267, E-FRC-0268, E-SPN-0177)

The constraints page listed 4 of 46 as broken: a disturbance of the vacuum reaching every line, a part pulled from a
knot coming back, handedness at long wavelength, and SU(2) broken by the vacuum and not the knit. Each was diagnosed on
the knit and worked on the register rule (the candidate rule with the Cl⁺(4) register, not adopted), with the chiral
Wilson wall where a hand is needed.

### What changed

- `code/measure/sea-reach.ts`: the register rule on a periodic D4 box, one member at a time, mod p. The map
  Z[ω][1/42] → F_p is a ring map, so a nonzero residue proves a nonzero amplitude. Line cover, translation, exact
  inverse beats, and a float twin for the instrument.
- `code/measure/register-symmetry.ts`: Clifford products on the 16 blades, left and right multiplication on the
  register, the spin lift of a W(F4) rotation, and the commutator gap of a register map with a piece.
- `code/measure/pulled-pair.ts`: a pair set at string length V0 at rest (a shell start), and the knot-region weight.
- `code/measure/chiral-register.ts`: `clifford` exported, no other change.
- `test/experiment/foundations/sea-reach.ts` (E-FND-0157), `test/experiment/gauge/register-handedness.ts` (E-FRC-0267),
  `test/experiment/gauge/register-internal-su2.ts` (E-FRC-0268), `test/experiment/spin/pulled-member-returns.ts`
  (E-SPN-0177), with rows in `test/registry.csv`, the barrel and the regenerated catalog.
- `research/problem.ts`: OP-16's unknown and source cite the register results.

### Results (gates fixed in each header before its gate run, probes disclosed)

- **E-FND-0157, pass.** A one-slot start reaches all 12 lines of every dock by cycle 3 on boxes of 256 and 1,296 docks,
  proved mod p, on the register rule and its chiral Wilson variant. Cone of 2 root steps a cycle, exact reversal, every
  translation commutes (crystal momentum kept), the full sea one branch. No mixer: the start returns. A mixer inside
  one line: 1 line. Read: 0.84 of a one-slot start's weight stays on its dock (flat bands), and the root sum is not
  conserved (a velocity on a quantum walk).
- **E-FRC-0267, pass.** Face chirality at k = 0: +2 and −2, the mirror rule −2 and +2, the symmetric slab 0 and 0. The
  chiral pieces keep 576 of 576 rotations and 0 of 576 reflections. Every piece commutes with the right
  multiplications, so the untwisted rotation L(s) = ρ(g)R(s) is exact (4.4e-16 over 576 rotations), and a turn by π
  lifts to e₀₁ with L(e₀₁)² = −1: spin one half, while the lattice's own action by minors reads integer spin. Charge per
  half exact, CPT 2.2e-15.
- **E-FRC-0268, fail as derived.** The rule keeps SU(2)₊ × SU(2)₋ (right multiplications, one on each half) exactly,
  internal to spin. The full sea keeps it too (every generator traceless on 192 modes). The chiral face's 8 light
  levels (±1.22e-4) all lie in the Wilson half, as doublets of one hand.
- **E-SPN-0177, fail on R3 (the free control).** With E-SPN-0162's string a pair set at length 5 or 6 stays (norm
  1.0001, 1.0024) and its knot weight rises to late means 0.25 and 0.08. But with no string it also stays 64 cycles on
  the radius-8 ball (norm 0.9999) and fills the knot region more (0.30, 0.31): a light register member is slow, and
  the string at this strength Stark-localizes the pair instead of pulling it in. The return is not shown. The level
  filter was not converged on radius 8 (phase 1.928, residual 3.2e-2), disclosed, and the level is a read only.

### How it was tested

All in next-pieces, one process at a time where the machine allowed. Gate runs: `tmp/bc-sea-gate-run1.log` (96 s, and
`run2` after a helper moved to `code/algebra/linear/modular-linear`, the same numbers), `tmp/bc-hand-gate-run1.log`
(192 s), `tmp/bc-su2-gate-run1.log` (6 s, and `pnpm rerun E-FRC-0268` reproduced it), `tmp/bc-pulled-gate-run1.log`.
Probes: `tmp/bc-sea-smoke.log`, `tmp/bc-sym-probe.log`, `tmp/bc-return-probe1.log` (stopped early, disclosed in the
header). Checks: `node_modules/.bin/tsc --noEmit -p tsconfig.check.json` exit 0, `test/catalog.ts`,
`task/check-labels.ts` (1 contradicted label and 20 for review, none from this item), `task/check-coverage.ts` (0
unknown, 0 mismatches), `test/result.ts check` (0 problems). `pnpm rerun` reproduced E-FND-0157 and E-FRC-0267.

### Status and follow-ups

- Constraints page (`mesh/site/clue.surf/home/site/tool/vibe/constraints.ts`, edited in the mesh tree):
  universality on the vacuum and handedness move broken → variant; SU(2) by the vacuum and the pulled part stay broken
  with new reasons; momentum and spin one half cite the register results. That makes 24 hold, 16 variant, 2 broken, 4
  open. The new codes print "not yet registered" until make:vibe runs from a branch that holds them.
- No rule is shown to break none of the 46. The Higgs row fails on the register rule (nothing breaks SU(2)₊, and only
  an energy ledger could select a breaking sea), the pulled part needs the weak-string test on a larger ball, and
  about 18 rows are unread on the register rule because it carries no roles, fear beat or Σ(648) links.
- Real tension, recorded: a rising string (a return from any distance, confinement) meets the D D ladder, while the
  capped string that holds exactly does not confine (E-SPN-0161, 0162).
- Notes changed outside this repo: `remaining-pieces.md` (a new section, "The four broken constraints, worked", before
  "A coincidence worth testing", and "Order of work" steps 5 and 7), `open.md` (FND-12, FND-14, the new FND-15, WKF-01,
  WKF-03, CPA-01), `everything.md` (the parity, Higgs and one-rule rows' text, no status change), `solutions.md` (§8).

## OPEN-FND-03: the rows the line law blocked, rerun on the register rule (E-FND-0158)

OPEN-FND-03 covers nine ledger rows: C no anyons and bosons, J temperature and the Bose and Fermi laws, K
hydrodynamics and viscosity, and P binding, persistence and integration (with Q "matter and mind" waiting on them). Each
was blocked because two vibes on different lines never meet on the knit. The one engine that runs the register rule
with the sea present is E-SPN-0175's two-hole torus, so every row was read on it in one experiment, for the one thing
the line law forbade.

### What changed

- `code/measure/register-crossing.ts`: two holes on one relative dock in pure (slot, register) modes, antisymmetric,
  symmetric or distinguishable; the exchange-sector weights; the weight at each relative momentum; each member's weight
  on the 12 lines; the one-slot and one-mode weights; a one-member sector piece (for a control that treats the members
  differently).
- `code/measure/register-sea.ts`: `pairAt` exported, and `pairStart` takes an optional symmetry (default −1, the old
  behavior, bit for bit).
- `test/experiment/foundations/register-crossing.ts` (E-FND-0158), with its rows in `test/registry.csv`,
  `test/experiment/all.ts`, the regenerated `test/catalog.csv` and the readme count (1,527 rows, spin 182, foundations
  158, L2 1,151).

### Results (gates fixed in the header before the gate run, probes disclosed)

Pass, as predicted, on the first run (457 s). Depth L2. No ledger row changes status: it is two holes on the 4d torus,
one tone, and the register rule is not the adopted one.

- **X, exchange is a conserved sign.** Under the rule the other exchange sector stays below 2e-30 for 64 cycles.
  L(e₀₁)² = −1, (L⊗L)² = +1, (L⊗L⊗L)² = −1 exactly: a two-member composite turns and exchanges as a boson (kinematics).
- **H, Pauli across lines.** Under the member mixers a distinguishable pair started on lines 0 and 1 reaches one mode
  (8.8e-3), an antisymmetric pair never does (4e-33). One-slot exchange term 8.8e-3.
- **S, momentum traded.** The pair pieces move 9.8e-5 to 2.1e-3 of the pair's weight between relative momenta. The free
  rule keeps every momentum's weight to 1.2e-13: one-body, the register rule cannot equilibrate.
- **I, one member changes another across lines.** Member 1's line weights, rule against free: up to 1.0e-2,
  oscillating (1.5e-4 at cycle 64). The knit reads exactly 0 across lines (E-SLF-0178).
- **Controls.** Mixers off: every one-slot weight and member 1's off-line weight exactly 0 (the line law). A rule that
  treats the members differently puts 0.145 into the other sector. A member held in the flats is changed by 1.8e-15.
- **Honest size.** A one-slot start keeps most of its weight in the flat bands, so only thousandths of the pair trade.
  S and I are close to the definition of an interaction, and the momentum-spread read said nothing (a one-dock start is
  already flat in momentum). Disclosed in the header's audit paragraph.

### How it was tested

Probes: `tmp/ofd3-probe1.log` (4 cycles), `tmp/ofd3-probe2.log` (16 cycles), `tmp/ofd3-smoke.log` (two cycles of the
file). The gate run: `test/rerun.ts E-FND-0158`, log `tmp/ofd3-gate-run1.log`. Checks, log `tmp/ofd3-checks.log`:
`tsc --noEmit -p tsconfig.check.json` exit 0, `test/catalog.ts` (1,527), `task/check-labels.ts` (the same 1 contradicted
label and 20 for review as before, none from this item, and 1 registry row not in the barrel, `foundations/energy-ledger`
E-FND-0159, another agent's reservation), `task/check-coverage.ts` (0 unknown, 0 mismatches), `test/result.ts check` (0
problems).

### Status and follow-ups

- OPEN-FND-03 narrowed, not ticked: the two-body step is done, and each row's remaining need is listed in open.md
  (a many-hole interacting run for J and K, four holes and a light composite for the bosons, roles and a tone for P, the
  husk for all).
- Notes changed outside this repo: `open.md` (FND-03 rewritten with the exact row list and each row's need, MAT-07,
  CSM-13, CSM-14, MND-01, MND-03), `remaining-pieces.md` (a new section, "The rows the line law blocked, on the register
  rule", before "A coincidence worth testing", and "Order of work" step 4), `everything.md` (notes on the C, J, K and P
  rows and the one-rule row, no status change).

## A part pulled from a knot comes back: the decisive test (E-SPN-0178)

E-SPN-0177 failed on its free control: a free pair also stayed on its radius-8 ball. This item derives why, builds a
test with teeth, and runs it.

### What changed

- `code/measure/register-ball-reduced.ts`: register-meson's pair cycle on the sector every signed permutation of the
  four coordinates keeps (384 elements of W(F4), covariance counted), one representative an orbit. Radius 32 is 15,336
  representatives for 4,464,769 sites, 63 MB a state and about 2 s a cycle. Also the Gram inner product, the filter,
  the level read, the profile, a graded absorbing layer (an instrument), and `unfoldBall` for the witness.
- `test/experiment/spin/pulled-pair-weak.ts` (E-SPN-0178), with its rows in `test/registry.csv`,
  `test/experiment/all.ts` and the regenerated `test/catalog.csv` (1,527 rows, which the readme already states).

### Results (gates fixed in the header before the gate run, probes disclosed)

Pass, as predicted. Every gate and instrument holds on the first run.

- **Why E-SPN-0177's control stayed.** The relative ball's edge reflects: in the exact coordinates the truncated cycle
  stays nearly unitary, so a free pair on radius 4 keeps its norm to 3.5e-4 over 128 cycles. The members are not slow
  (median 0.59 in V a cycle).
- **Derived from the band before any run.** The opposite-band part of a pair has relative phase 2π at every momentum and
  never moves (0.32 of a pull). A string τ lets the moving part rise at most W/τ = 9.8 at the weak string (3.3 at
  E-SPN-0177's), so the weak string's swing reaches the knot. The free pair's norm through an absorber from V 23 on
  radius 32 was predicted at about 0.42 and 0.36 by cycle 128.
- **Measured, weak string (τ 0.0936, cap 24).** Pulls to 8 and 10: the knot weight (V ≤ 5) goes from 3e-17 and 6e-46 to
  late means 0.230 and 0.102, the norm stays 1 to 4e-10, and at most 8e-6 lies past V0 + 10. With no string: norm
  0.384 and 0.389, late knot weight 0.029 and 0.024. A half-strength absorber gives the same (0.379, 0.0288).
- **The level converged.** Phase 1.2592028, residual 2.8e-7 on the radius-16 sector and 8.5e-6 on radius 32, where
  E-SPN-0177's stopped at 3.2e-2.
- **What returns is the swing, not the bound level.** The pulls overlap the level only 6.6e-3 and 2.9e-4.
- **The string, and the tension.** The capped weak string both holds exactly and rises over every length the pair
  reaches. It returns a part only from within about (2π − E_L − 2S_max − W)/τ ≈ 26, and that range scales as 1/τ.

### How it was tested

Probes: `tmp/pr-derive1.log`, `tmp/pr-derive2.log` (the momentum-space derivation), `tmp/pr-edge1.log` (the reflecting
edge), `tmp/pr-probe2.log` (covariance, witness, speed), `tmp/pr-probe3.log` (the level on radius 16, fixing the knot
region), `tmp/pr-smoke.log` (every path on a small plan). Gate run in two processes: `tmp/pr-gate-one.log`,
`tmp/pr-gate-two.log`, combined in `tmp/pr-exp-run1.log`. Checks, `tmp/pr-checks.log`: `test/catalog.ts` 1,527,
`task/check-coverage.ts` 0 unknown and 0 mismatches, `test/result.ts check` 0 problems. `task/check-labels.ts` shows 1
contradicted label and 20 held for review (none from this item). It also shows `foundations/energy-ledger` registered but
not in the barrel, and `tsc -p tsconfig.check.json` fails only in that file (4 errors), which is another item's work in
progress. `tsc` was clean on this item's files before it appeared (`tmp/pr-tsc.log`).

### Status and follow-ups

- Constraints page (`mesh/site/clue.surf/home/site/tool/vibe/constraints.ts`): "a part pulled from a knot can come back"
  moves broken → variant, citing E-SPN-0178. `physics.json`'s one-rule row now says R* keeps three of the four broken rows.
- Open: a return from any distance needs τ → 0 on this rule. Every fixed string meets its cap or the D D ladder.
- Notes changed outside this repo: `remaining-pieces.md` (a new subsection after E-SPN-0177's, the R* table's two rows,
  the "what blocks it" paragraph), `open.md` (FND-15's pulled-member bullet and the tension bullet).

## OPEN-FND-14: an energy ledger, and whether it selects the SU(2)₊-breaking sea (E-FND-0159)

E-FRC-0268 left the Higgs row waiting on an energy: the register rule holds a stationary sea that breaks SU(2)₊ and
nothing prefers it to a symmetric one. This item defines an energy native to the rule and asks whether it selects that
sea. It does not.

### What changed

- `code/measure/energy-ledger.ts`: the prime-unit count. Every unit of the rule is ringUnit(k, j) = ρ^k ω^j with one
  prime unit ρ of infinite order, so the exponent of ρ in an eigenvalue is an integer. The ledger is E = −d arg λ/dθ,
  read by Hellmann–Feynman as the pieces' integer counts times their exponents (a mixer's sector occupancy, the pair
  pieces' normal-ordered hole counts), with no branch cut. Per torus momentum it clusters the one-body cycle's
  eigenvalues, restricts each cluster to a register projector (a half, or one SU(2)₊ eigenspace), and keeps its count
  and its 8 × 8 sector blocks. A Slater sea of holes is then read by Wick's
  theorem: one-body count, the sector string's direct and exchange terms, the contact, the count variances, and each
  sector's SU(2)₊ Casimir.
- `test/experiment/foundations/energy-ledger.ts` (E-FND-0159), with its rows in `test/registry.csv`,
  `test/experiment/all.ts`, the regenerated `test/catalog.csv` and the readme count.

### Results (gates fixed in the header before the gate run, probes disclosed)

Fail on S alone, as predicted. Depth L1 (the count, the midpoint, the blind flats) and L2 (the torus numbers). Runs:
R0 (E-SPN-0175's many-body register rule) at L = 4 and 6, R1 (its chiral Wilson variant) at L = 4.

- **E, an exact count.** B (the full sea less the −i eigenspace of X₁ on half +) has one-body count 0 + 0i from integer
  traces, sharp sector counts n_S = n_D = 2, and reads 0 (within 1.2e-12) along X₁, X₂, X₃: the full sea's value.
- **H.** Hellmann–Feynman counts match finite differences of the phases within 2.9e-8. **F.** The flats read ≤ 9.6e-15.
- **M, the midpoint.** The two complementary SU(2)₊-symmetric band seas read ±3,121.78 (R0, L 4), ±3,564.32 (R1) and
  ±23,136.11 (R0, L 6) a dock, B exactly between. The whole ledger is E = E1 + (n_S − n_D)(4W − 6), W = Σ min(V, 8) =
  260 and 1,976: the string's singlet-minus-partner imbalance rules it and grows with the box.
- **S fails.** Under either sign a symmetric sea is below B by thousands a dock.
- **Controls hold.** C1 a sea one momentum away is higher than the lower band sea. C2 the one-body ledger alone also
  fails to select B. C3 B lies strictly between rivals on every run.
- **Read.** The sector Casimir ⟨T²⟩ is 2 for B, 0.19 to 0.35 for the band seas: what an isospin piece would reward.
  B is diagonal in the halves, so no mass and no gap follow even in principle.
- **Dropped before the gate run, disclosed.** A spin-polarized symmetric sea built from the singlet's copies, meant to
  show an exact tie, failed its own reconstruction check (it missed B by 2 and 8 in a count), so no tie is claimed.

### How it was tested

Probes: `tmp/el-probe1.log` (spectra), `tmp/el-probe2.log`, `tmp/el-probe2b.log` (register parts, the antisymmetry),
`tmp/el-probe3.log` (the file at L = 4, with the dropped copy construction). Gate run: `pnpm rerun E-FND-0159`, log
`tmp/el-gate-run1.log` (2,806 s). Checks, `tmp/el-checks-final.log`: `tsc --noEmit -p tsconfig.check.json` exit 0,
`test/catalog.ts` 1,529 (one row is another agent's), `task/check-labels.ts` (the same 1 contradicted label and 20 for
review, none from this item, 0 registry rows outside the barrel), `task/check-coverage.ts` (0 unknown, 0 mismatches),
`test/result.ts check` (0 problems).

### Status and follow-ups

- OPEN-FND-14 is not ticked: the ledger is defined and does not select the vacuum, and the Casimir row's density is
  not read. The Higgs row now waits on pieces the rule lacks (a neutral string, a sector piece that reads the isospin,
  a channel between the halves), not on the ledger.
- Notes changed outside this repo: `remaining-pieces.md` (a new section, "An energy ledger, and whether it selects the
  vacuum", before "A coincidence worth testing", the R* table's fail row and "what blocks it" paragraph, "Order of
  work" step 7), `open.md` (FND-14 rewritten with its proof command, FND-15's SU(2) bullet, what closing it takes and
  proof commands, WKF-03, "Next up" item 8), `solutions.md` (§8), `everything.md` (the Higgs row's text, no status
  change).

## OPEN-FND-01: roles and a tone on the register rule (E-FND-0160, E-SPN-0179)

The adopted knit carries tones, role points, the fear beat and Σ(648) links, and R* (the register rule) carries none,
so about 18 of the 46 constraints and the self rows were unread on it. This item derives how they fit on R*, builds one
construction (C*), gates what R* already held, and reads the rows it makes readable.

### What changed

- `code/measure/role-register.ts`: C*'s pieces and readings. The role is a qutrit (the 9 grid points are its phase
  space), the fear-tone role in the conjugate representation. The two fear-beat kernels are diagonal in a fixed split of
  the role pair and everything else is role-blind, so a pair is two orbital runs of E-SPN-0175's engine, and an unlike
  pair's traced role state is fixed by one overlap g (`reducedRole`). Two-role Wigner function, the 40 Lagrangian
  context sums, mana, the Schmidt block CHSH, the Σ(648) and grid checks, the knit-literal control (`dockPhaseCycle`),
  and the fear beat on E-SPN-0178's reduced ball (`fearBallEngine`).
- `code/measure/register-sea.ts`: `seaTriggers` takes a slot capacity (default 8, unchanged for every caller).
- `test/experiment/foundations/register-roles.ts` (E-FND-0160) and `test/experiment/spin/pulled-pair-fear.ts`
  (E-SPN-0179), with their rows in `test/registry.csv`, `test/experiment/all.ts`, the regenerated `test/catalog.csv`
  and the readme count.

### The construction, and why this one

- **The grid is not in the register.** Both have an 8, but the central grid move fixes 0 of the 8 nonzero points while
  −1 acts on the register with trace ±8 under every action, so no 2T-map joins them. The 9 points are the phase space
  of a qutrit, so the role is C³ on every member.
- **The tone is a species**, not the Dirac branch (both branches are holes of one sea, charge −1). A love-sea hole is
  fear-tone, a fear-sea hole love-tone, the mirror swaps the fields, and the fear-tone role carries the conjugate
  representation, forced by the unlike kernel's singlet.
- **The links are flat Σ(648) on the role.** A curved field makes the member heavy (E-SPN-0161), so link curvature is
  given up: the rows that need it stay unread. The links' linear part (SL(2, 3) ≅ 2T) could act on the register by
  right multiplication, an SU(2)₊ gauge field: noted, not built.
- **The fear beat is a sector contact counted from the sea**, the one placement E-SPN-0175 allows. The two kernels are
  diagonal in a fixed split of the role pair, so a pair is two orbital runs of R*'s engine.

### Results (gates fixed in each header before its gate run, probes disclosed)

E-FND-0160, pass, as predicted (378 s). Depth L1 (algebra) and L2 (runs), the L = 4 D4 torus, 64 cycles.

- **What R* held holds on C*.** One branch (stream even, Q_S and Q_D rank 8). Flats within 4.8e-14, 6.1e-14 of 1 and
  2.0e-14, while the knit-literal placement (a phase on every pair sharing a dock) releases 0.115. K blocked (least
  occupancy 46 of 48 over 4,718,592 configurations). Q_S and Q_D commute with J and all 1,152 W(F4) elements, and the
  register exchange (the teeth) moves J ⊗ 1. The like channel's other exchange sector stays at 1.2e-29.
- **The links are the grid.** Σ(648)'s 648 elements carry the phase points by exactly the 216 grid moves, 3 as the
  identity. V commutes with g ⊗ ḡ (6.5e-16) and not with g ⊗ g (1.0).
- **Bell on the roles.** An unlike pair started in the moving states and read with both orbits traced reaches CHSH
  2.060 from |0⟩|+⟩ and 2.159 from |0⟩|0⟩, never past 2√2, 2 with the fear beat off. The knit's one clean meeting gives
  2.361 and 2.552 (the reader reproduces both to 1e-8). The orbit dephases the kernel: |g| 0.57 to 0.92.
- **Contextual.** Least context sum 3.615 from |0⟩|+⟩ (4 is the noncontextual floor), none with the fear beat off.
- **Mirror** exact to 3.3e-13.
- **Read.** From |0⟩|0⟩ the traced state passes CHSH 2 at cycles with no negative Wigner weight, as the knit's own top
  color rung does: the escape through fears is about the model's own readings. Per configuration the role states reach
  2.748 and 2.828, on 0.4% and 3.8% of the weight above 2.5.

E-SPN-0179, pass (two processes, 793 s and about 900 s). E-SPN-0178's gates on the singlet channel of a love-fear pair.

- **R1 to R3 hold.** Late knot weight 0.187 and 0.095 (pulls 8, 10) against E-SPN-0178's 0.230 and 0.102, held norm 1 to
  4.4e-10, free pair norm 0.387 and 0.392 with late knot 0.019 and 0.020. At pull 10 the free-to-held ratio is 0.21,
  within 16% of the gate's quarter.
- **E holds.** The Φ⊥ channel reproduces E-SPN-0178's late means to the last digit.
- **Read.** The returning pair's roles grow entangled and contextual (|g| to 0.850, CHSH 2.023, least context sum 3.849).

### What C* answers for E-FND-0159

Neither piece. Both kernels are (Q ⊗ Q) ⊗ (a role projector): on a role-blind sea their count is the sector-contact
count times a fixed factor, blind to SU(2)₊, and both commute with J, so they join no halves. The one lead is the links'
2T image acting by right multiplication on half +, an SU(2)₊ gauge field, which needs curved links.

### How it was tested

Probes: `tmp/rt-probe1.log`, `tmp/rt-probe1-slot.log`, `tmp/rt-probe1-move.log` (the channel overlap and role readings;
the first used the wrong unit, ringUnit(0, 1) = e^(iπ/3), and a flat-heavy slot start, both corrected before any gate),
`tmp/rt-probe2.log` (the invariants, Σ(648), the control). Smokes: `tmp/rt-smoke.log` (E-FND-0160 at 2 cycles, which
moved M's tolerance to 1e-10 before the gate run), `tmp/rt-pull-smoke.log` (E-SPN-0179 on a radius-12 ball). Gate runs:
`pnpm rerun E-FND-0160`, log `tmp/rt-gate-E-FND-0160.log`; E-SPN-0179 as `tmp/rt-pull-part.ts 8` and `10` combined by
`tmp/rt-pull-combine.ts` (`tmp/rt-pull-combine.log`). Checks, `tmp/rt-checks.log` and the final rerun of it:
`tsc --noEmit -p tsconfig.check.json` exit 0, `test/catalog.ts` 1,532, `task/check-labels.ts` (the same 1 contradicted
label and 20 for review, none from this item, 0 registry rows outside the barrel), `task/check-coverage.ts` (0 unknown,
0 mismatches), `test/result.ts check` exit 0.

### Status and follow-ups

- OPEN-FND-01 is not ticked: C* is a candidate, not the adopted rule, read on two members on the 4d torus and ball.
- Unread on C*: everything on link curvature (color, Gauss's law for color, Tsirelson by a link move, the start-picked
  rungs), the like pair's role Bell (confounded by exchange), the Born rule as a count, grain, purity, no signaling, and
  the P rows (many members). The fear beat as the one quantum source fails as stated on C*.
- Next: a curved link field on C* that keeps the member light, and a many-member run for the P rows.
- Notes changed outside this repo: `remaining-pieces.md` (a new section, "Roles and a tone on the register rule", the
  R* table and its paragraph, "What each row still needs", "Order of work" step 4), `open.md` (FND-01 status, proof and
  closing text, FND-03's P bullet, FND-15, MND-01, "Next up" item 4), `solutions.md` (§8, §12), `everything.md` (Bell,
  Bell's escape, contextuality, binding, integration and one-rule rows, text only, no status change). And
  `mesh/site/clue.surf/home/site/tool/vibe/constraints.ts`: the codes and a clause on the quantum-roles, fear-is-magic,
  love-fear, classical-steps, pulled-part and Higgs rows (no status change, and the Higgs row's stale "without an energy
  ledger" now cites E-FND-0159).

## OPEN-FND-01 and OPEN-WKF-03: a curved link field that keeps the member light, and the SU(2)₊ gauge field (E-SPN-0180, E-FRC-0271)

C* kept its links flat because a curved field made E-SPN-0161's member heavy. This item derives why, finds that the
register member rests where curvature cannot reach, builds the 2T link field on half + of the register (SU(2)₊'s
gauge field), and reads what it allows for Gauss's law and E-FND-0159's vacuum question.

### What changed

- `code/measure/register-link-field.ts`: 2T as the 24 Hurwitz units acting on half + by right multiplication (an exact
  homomorphism found by search, 4Γ integer), static fields on the D4 torus (trivial, Weyl, pure gauge, dilute, −1,
  gauge-transformed), the covariant Clifford hop's C†C on half + (`diracHalf`), E-SPN-0161's averaged hop in the same
  field (`hopHalf`), the same hop with a link on a separate factor (`roleDirac`, `roleHop`, for C*'s Σ(648) role),
  the one-member cycle with the field, the plane check, the exact gauge checks, triangle curvature, the breaking sea's
  one-cycle leak and its exact Gauss weight.
- `test/experiment/spin/register-curved-links.ts` (E-SPN-0180) and `test/experiment/gauge/register-su2-gauge.ts`
  (E-FRC-0271), with their rows in `test/registry.csv`, `test/experiment/all.ts`, the regenerated `test/catalog.csv` and
  the readme count.

### The derivation, and the construction chosen

- **Why 0161's member was heavy.** It rests at the TOP of its averaged hop (m = π/2 − arcsin(sin(θ/2) λ_top)), which
  reaches 1 only in a flat field. Disorder pulls a spectrum's edges in, to the Kesten radius. Its color commuted with
  its coin, so commuting was never the issue.
- **Where the register member rests.** V (coin and stream) is an involution in every static field, so the cycle is a
  product of phases on two projectors, and Jordan's lemma gives cos E = cos M − 2cos²(M/2)μ in any field, μ the
  spectrum of C†C with C = Q_D V Q_S = c₀ Σ γ(r_d) G_d T_d, a naive Dirac operator. The member rests at a ZERO of C,
  the middle of a chiral spectrum, which disorder fills rather than empties.
- **Chosen:** a curvature that commutes with the mixer (right multiplication on half +). Curvature kept off the
  member's line is impossible on D4 (every triangle uses three roots), and a field small in its vacuum does not exist
  for a finite group. Commuting makes it the rule's gauge field; the Dirac zero is what keeps the member light. No
  plaquette term is needed for lightness. The field's own electric and magnetic pieces (E-SPN-0152's) are built and
  checked exactly, not run with members.

### Results (gates fixed in each header before its gate run, probes disclosed)

E-SPN-0180, pass, as predicted (389 s). In 9 curved 2T fields (three Weyl fields at L = 4 and one at L = 6, curving
0.955 to 0.963 of the D4 triangles, and five dilute fields) the register member stays within 7.4e-7 of 0.190126, while
E-SPN-0161's law on the same hop reads 1.170 to 1.180 (Weyl) and 0.214 to 1.007 (dilute). μ_min falls with the box
(3e-8 at L = 4, 6.3e-9 at L = 6). The law closes on the explicit cycle to 2.9e-11 and holds to 6e-15; gauge covariance
exact (dynamic 1.8e-17); one branch, 176 flats a dock (μ_max 0.163), K, chirality and the pure-gauge identity kept. A
curved Σ(648) field on C*'s role reads the same (μ_min 4.3e-8, 0161's law 1.168). Depth L2: the member's rest level,
not free motion, is what is read.

E-FRC-0271, fail on H and S, as derived (0.5 s): Gauss's law exact (the
homomorphism over 576 products, projector gaps 0, link covariance, electric and magnetic class functions), a half +
member two doublets and a half − member none, a lone triplet pair must emit 3-flux (least a triangle loop, electric
count 12) where a singlet needs none, the field commutes with J (no channel joins the halves), and the breaking sea
leaks 7.5e-2 a cycle in a curved field and lies in each dock's Gauss sector with weight exactly 1/6 + (2/3)·2⁻²⁴, its
X₁ averaging to 0 there (Elitzur).

### How it was tested

Probes `tmp/lf-probe1.log` (L = 4), `tmp/lf-probe1-6.log` (L = 6, stopped after the Weyl and dilute 0.01 fields to free
the machine for the gate run), `tmp/lf-probe2.log`. Smokes `tmp/lf-smoke.log`, `tmp/lf-smoke2.log`. Gate runs
`tmp/lf-gate-E-SPN-0180.log`, `tmp/lf-gate-E-FRC-0271.log`. Checks `tmp/lf-checks.log`: `tsc --noEmit -p
tsconfig.check.json` exit 0, `test/catalog.ts` 1,534, `task/check-labels.ts` (the same 1 contradicted label and 20 for
review, none from this item, 0 registry rows outside the barrel), `task/check-coverage.ts` (0 unknown, 0 mismatches),
`test/result.ts check` exit 0 (0 problems).

### Status and follow-ups

- No row is ticked. OPEN-FND-01's rows on link curvature are now unblocked on the member side; the field's own
  dynamics with members (a 24-state register a link) is not run, and a moving field moves the flat space.
- The Higgs row stays broken, now sharper: a local SU(2)₊ cannot be broken by a sea, and the field joins no halves, so
  the missing piece is still a channel between the halves, read gauge-invariantly.
- Notes changed outside this repo: `remaining-pieces.md` (a new section, "A curved link field that keeps the member
  light"), `open.md` (Next up 4 and 8, FND-01, FND-14, FND-15, WKF-01, WKF-03, text only), `solutions.md` (§8),
  `everything.md` (the Higgs and one-rule rows, text only). `constraints.ts` is unchanged: no status moved.

## OPEN-GRV-13: gravity's count field under the register rule (E-GRV-0146)

### What changed

- `code/measure/register-count.ts`: the husk depth kernel as a pair angle per relative dock of a register-sea torus,
  the raw count's Hartree angle, the rest gap against the mixer angle, one member on the D4 torus of any even side
  (full 192-mode state, mixers, swap coin, stream) with its sector and dock counts per dock, projected one-member starts,
  and the pair's separation.
- `code/measure/register-sea.ts`: `SeaRule` takes an optional `kernel` (a pair angle per relative dock in place of
  string min(V, cap)) and `whole` (the control: the angle on the whole relative dock, the dock count). `projected` is
  exported. With neither field set the engine is unchanged.
- `test/experiment/gravity/register-count-field.ts` (E-GRV-0146), with its rows in `test/registry.csv`,
  `test/experiment/all.ts`, the regenerated `test/catalog.csv` and the readme (1,535 rows, gravity 143, L2 1,157, and a
  sentence under the register section).

### Results (gates fixed in the header before the gate run, probes disclosed)

Pass, as predicted (436 s). No gate moved, none rerun.

- **G1, the source.** A member projected on the flats has sector count below 1.6e-31 at every dock and beat and
  returns to its start every cycle (2.4e-16). A moving member holds 0.500. So the source is the sector count, and the
  flats neither source nor feel it.
- **G2.** Under the gravity piece N_F stays within 1.9e-14 of 0, 0 and 1 for 64 cycles (L = 4).
- **G3, the pull.** Mean separation over cycles 1 to L/2: gravity 1.4910, 1.4592, 1.6570 against free 1.5028,
  1.4775, 1.7192 (L 4 two starts, L 6).
- **G4, the far field.** One hole on L = 16, its sector count averaged over 16 beats: k per unit charge on r 5..7 is
  0.99969 of the point unit's. Charge 0.524 a beat (1.000, 0.042, 0.852, 0.273, ... by beat).
- **Controls.** The same piece read as members pushes them apart (1.5106, 1.4915, 1.7716): the sector phase is odd
  under particle-hole. The dock count releases N_F to 0.12, 0.22 and 1.001. Raw counts put a Hartree angle of 318 to
  94,149 on each hole (as L⁴) and move the rest gap to 1.21 to 2.87 against 0.380.
- **Instrument.** The point unit's k at 1.000013 of E-GRV-0119's. M = π − |θ| with slope 1.000000000, which fixed the
  sign before any pair ran.
- **A read that failed.** The husk solve of the raw count (64 − n a column) returned −2.9e5, and NaN on a probe after
  the run: the solver does not survive the sea's uniform count. The raw sign rests on the algebra.

### How it was tested

Probes `tmp/gc-probe1.log`, `gc-probe2A.log`, `gc-probe2B.log`, `gc-probe3F.log`, `gc-probe3six.log`, and after the run
`gc-probe4.log`. Smoke `tmp/gc-smoke.log`. Gate run `tmp/gc-gate-run1.log` (`test/rerun.ts E-GRV-0146`). Checks
`tmp/gc-checks.log`: `test/catalog.ts` 1,535, `tsc --noEmit -p tsconfig.check.json` exit 0, `task/check-labels.ts`,
`task/check-coverage.ts`, `test/result.ts check`.

### Status and follow-ups

- OPEN-GRV-13 is not ticked. The count field runs, but the pull is read as slower spreading on small tori, not as a
  force law, and the rereadings at c/4 (G's units) are not done. The kernel is the depth register's float Green's
  function, a stand-in.
- New question: the gravity piece attracts holes and repels members. It is universal on the love sea because every
  excitation is a hole. C*'s fear-sea holes need their own check.
- New question: the charge is 0.524 a beat, not 1. Whether it equals the hole's inertia is idea 1d (OPEN-GRV-02).
- Notes changed outside this repo: `remaining-pieces.md` (a new section after E-SPN-0175's, and a pointer in
  E-GRV-0145's), `open.md` (Next up 2, GRV-13), `everything.md` (Newton's inverse square and the equivalence principle,
  text only). `constraints.ts` is unchanged: no status moved.

## OPEN-GRV-02 and OPEN-GRV-01: the equivalence principle and the pull's falloff under the register (E-GRV-0147, E-GRV-0148)

### What changed

- `code/measure/register-count.ts`: `oneTorus(L, wSide)` takes a fourth side, and at 2 it is the slab (one dock a
  husk column, exact for column-uniform states); `oneBeat` takes an optional per-dock angle (a static source's sector
  field); `columnKernel` (shared with `huskKernel`); `bandCharges` (each band's S and D weights by Hellmann-Feynman, and
  its energy); `envelopeStart`, `meanOffset` and `packetRun` (a column packet of either band in a static field). With
  the new arguments absent every existing call is unchanged.
- `test/experiment/gravity/register-equivalence.ts` (E-GRV-0147) and `register-falloff.ts` (E-GRV-0148), with rows in
  `test/registry.csv`, `test/experiment/all.ts`, the regenerated catalog and the readme count.

### Results (gates fixed in each header before its gate run, probes disclosed)

Both pass, as predicted, first run (322 s and 725 s). No gate moved.

- **E-GRV-0147. Charge is number, the piece is two fields.** Every hole state's stage weights sum to 1 (8e-11 over 24
  momenta, both bands), so the active charge is exactly 1/2 a beat at every momentum and at every rest gap (0.1 to 2).
  The passive charge is dE/dM on the closed band (8e-11): 1 at rest, 0.447 at |K| 1.6. The inertia is
  4 tan(M/2) = 0.7698 against a rest energy 0.3803. The 0.524 was a 17-beat window (16 beats: 0.505, 0.494). The piece
  pairs S with S and D with D, so at rest a hole feels only its own band: on the slab (side 40, r 10, sigma 3, 8 cycles)
  A|A = B|B = 2.174e-2 to 2e-14, and A|B at most 0.082 of that, swinging in sign. The members' image is pushed
  (−4.06e-2). The fall is 1.21 of the local-mass prediction (M + 0.2867 k = 0.746) and 0.59 of the bare one.
- **E-GRV-0148. The pull follows the kernel.** On slabs of side 40 and 48, one hole in a static hole's field: 4.09e-2
  at r 3 to 6.72e-3 at r 8; over r 5 to 8 the pull over the kernel's gradient is flat to 3.3%, power −2.04 and −2.02
  against the gradient's −2.11 and −2.09. A planar ramp gives a flat pull (1%). Torus term at r 8 derived as
  4πr³/(3L³), 1.9% at side 48.
- **The solver.** coulombFlux stops at an absolute |r|² ≤ 1e-28 on a singular Laplacian; a uniform 64 with a
  float-weighted hole leaves a null-space residual far above that, and the solve returns NaN. Counting from the sea
  before the solve bypasses it (exactly minus the hole's depth). The shared solver is not changed.

### How it was tested

Probes `tmp/eq-probe1.log`, `eq-probe2-small.log`, `eq-probe2-s3.log`, `eq-probe2-s4.log`, `eq-probe3-s1.log`,
`eq-probe3-s15.log`, `eq-probe4.log`. Smoke `tmp/eq-smoke.log`. Gate runs `tmp/eq-gate-E-GRV-0147.log`,
`tmp/eq-gate-E-GRV-0148.log` (`test/rerun.ts`). Checks `tmp/eq-checks.log`.

### Status and follow-ups

- OPEN-GRV-02 and OPEN-GRV-01 are not ticked. Ledger H's two rows stay stand-in: the kernel is the added depth
  register's, and both runs are the test-particle limit (one hole in a static field), not the two-body engine.
- New finding: the kernel is 0 at contact, so a hole's rest gap grows by 0.2867 k (about 0.37) for every other
  like-band hole anywhere. E-GRV-0146's "light by construction" holds for one hole alone.
- Next: whether a physical source is band-mixed; a kernel measured from infinity, gated against this one; G at c/4.
- Notes changed outside this repo: `remaining-pieces.md` (a new section after E-GRV-0146's), `open.md` (Next up 2,
  GRV-01, GRV-02, GRV-13), `everything.md` (both rows, text only), and one sentence on /vibe/gravity
  (`component/page/vibe/gravity/page.tsx`). `constraints.ts` is unchanged: no status moved.

## OPEN-CPA-01 and OPEN-MOT-03: parity and motion on the true mesh, at a cusp (E-FRC-0272, E-SPN-0181)

Every earlier parity and register-motion read ran on a flat stand-in, and the code says which: E-SPN-0167 on the flat
D4 mesh's depth-period-2 quotient, E-SPN-0168 and E-FRC-0267 on a flat Wilson slab, E-FRC-0258 and E-SPN-0160 as Bloch
bands of the flat mesh. Only lines, line waves and the Hopf reading had been run on {3,4,3,4} (E-SPN-0156 to 0158).
This item runs the register rule itself on the true mesh near a cusp, dock by dock.

### What changed

- `code/substrate/coxeter/labelled-region.ts`: a labelled region of the true mesh grown from any seed frames
  (`buildLabelledRegion`), the husk neighbourhood of a cusp (`cuspRegion`: the layer patch to a skin radius and every
  cell below it to a depth cut, with depth, Busemann level and husk position), the image of a region under a mesh
  isometry with its one label action (`regionImage`), and group closure (`closeGroup`). Keys are the hyperboloid
  centers on a half-unit grid, safe because distinct centers are at least 2 apart.
- `code/measure/cusp-register.ts`: E-SPN-0160's pieces and E-FRC-0258's chiral mass applied structurally (about 3,000
  multiplications a dock, checked against the dense 192 x 192 pieces to 1.3e-15), a beat on any labelled region with a
  per-dock class (so a rule may read a dock property), a reflecting or absorbing frontier, mesh symmetries as operators,
  the symmetry defect of the dynamics, and the upper-band member at a momentum (a spectral projection).
- `test/experiment/gauge/cusp-parity.ts` (E-FRC-0272) and `test/experiment/spin/cusp-motion.ts` (E-SPN-0181), with their
  rows in `test/registry.csv`, `test/experiment/all.ts`, the regenerated `test/catalog.csv` and the readme count.

### The derivation (in each header, before its gate run)

- **The labelling reverses orientation at every step.** The translation-like transport carries holonomy on {3,4,3,4}
  (E-SPN-0156), so the antipodal one is what the mesh admits, and each step (a facet reflection times the cell's point
  inversion) has det -1. Relative to parallel transport a step is -R_d, a W(F4) reflection, which swaps the register
  halves. So a rule written in labels holds each half left-handed on even docks and right-handed on odd ones.
- **The cusp orients the depth.** The layer is the top of the mesh: 6 slots along it, 18 down, none up.
- **The labels hide it from the chiral mass.** The cusp's face mirror r4 acts on the labels as -I, the register identity.
  A rotation-covariant rule keeps g exactly when g's label action is a rotation: r4 and the husk inversion about a face
  center kept, the cube-center mirrors and the half-turns such as r1 r4 broken.
- **Motion.** The swap coin's bounce returns an excursion below the screen to the dock it left (every depth-1 dock hangs
  under one layer dock), so only 6 of 24 slots can carry the member along the husk.

### Results (gates fixed in each header before its gate run, probes disclosed)

E-FRC-0272, fail as derived (270 s). 24 of 24 transports det -1 and 0 neighbour pairs of equal orientation on regions of
481 to 16,800 docks. The label chiral rule keeps every element whose label action is a rotation to 3.6e-16 over 6
beats (r4, the face-center inversion, two improper quarter turns) and breaks every other by at least 5.7e-2 (0.22 with
a massless half). E-FRC-0258's argument that the cusp picks the depth-keeping reflection is refuted. A mass that reads
each dock's orientation keeps every husk rotation and breaks all 128 husk-mirror readings. Controls: the achiral rule
keeps all 64 elements (3.8e-16); the flat box reproduces E-SPN-0167 in real space (-I kept, P_imp and R4 broken by
7.5e-2). Depth L1 and L2.

E-SPN-0181, fail as derived (45 s). The screen: 2,625 of 2,625 layer docks split 6, 18, 0; 47,250 of 47,250 depth-1
docks under one layer dock. The member at rest puts exactly 1/4 on the layer after one beat (flat: 1/2, 1/4, 1/4,
mirror-symmetric to 8.3e-17). The upper-band member at husk momentum 0.6 moves +0.060, +0.019 (depth cut 1, light and
massless) and +0.054, +0.015 (depth cut 2) husk docks in 8 beats, against -0.748, -1.003, -0.456, -0.598 on the flat
quotient; 0.10 to 0.39 passes below the cut. The pair census on the true horosphere is not reached. Depth L2.

### How it was tested

Probes `tmp/hm-probe1.log`, `tmp/hm-probe2.log`, `tmp/hm-motion-probe-6-1.log`, `tmp/hm-packet-probe.log` and the three
`tmp/hm-packet-probe2-*.log`. Engine smoke `tmp/hm-smoke.log`. Smokes `tmp/hm-parity-smoke.log`,
`tmp/hm-motion-smoke.log`; after the motion smoke, before its gate run, I2 and I3 (float sums of up to 2.6e7 squared
amplitudes) moved from 1e-12 to 1e-10, disclosed in the header; the gate run read 1.4e-12. Gate runs
`tmp/hm-parity-gate-run1.log`, `tmp/hm-motion-gate-run1.log`. Checks `tmp/hm-checks.log`: `tsc --noEmit -p
tsconfig.check.json` exit 0, `test/catalog.ts` 1,537 (one row, `E-SPN-XXXX` spin/route-free-string, is another item's),
`task/check-labels.ts` (the same 1 contradicted label and 20 for review, none from this item, 0 registry rows outside the
barrel), `task/check-coverage.ts` (0 unknown, 0 mismatches), `test/result.ts check` exit 0 (0 problems).

### Status and follow-ups

- No row is ticked. The named test of OPEN-CPA-01 ran and found no P violation from the chiral mass; the named mover of
  OPEN-MOT-03 ran and does not travel. Both stay open with sharper requirements.
- Next for parity: whether a mass that reads each dock's orientation keeps E-FRC-0258's one-body results when a member
  meets m+ and m- on alternate beats, and whether reading the orientation can be a local piece at all; E-FRC-0267's
  Wilson half at the cusp's one-sided screen.
- Next for motion: the rule's own eigenmodes on the layer and the docks under it, Bloch along the horosphere's
  translations, asked whether any stays on the screen; then the census.
- Notes changed outside this repo: `remaining-pieces.md` (a new section, "Parity and motion on the true mesh, at a
  cusp", and pointers in E-FRC-0258's, E-FRC-0267's and E-SPN-0167's), `open.md` (Next up 7, CPA-01, MOT-03, text only),
  `solutions.md` (§8), `everything.md` (the parity violation row, text only). `constraints.ts` is unchanged: no status
  moved, though its handedness reason still says the true mesh's cusp is not read. Site sentences corrected, since they
  stated the refuted argument: `pages-matter.tsx` (two), `pages-open.tsx` (two), `figures-open.tsx` (one).

## OPEN-WKF-03 and OPEN-FND-14: a channel that joins the register halves, and the Higgs row read on it (E-FRC-0273)

E-FRC-0271 left the Higgs row as a gauge invariant condensate ⟨ψ₋†ψ₊⟩ joining the register halves, dressed by the
SU(2)₊ field. This item derives what can join the halves and keep R*'s invariants, builds the one channel that survives,
and reads the condensate.

### What changed

- `code/measure/register-join.ts`: the rule's symmetries restricted to the sector ranges S and D (Γ₊, a half − 2T Γ₋
  found by the same exact search, the 576 rotations and reflections, the untwisted rotations L(s)), the channel census
  by characters, the intertwiner from the isospin singlet of Λ²(X₊) to Λ²(Y₋) by a rotation average with Schur's check,
  the S → D join as a piece in E-SPN-0175's relative engine (source: the pre-stream S contact in beat 2's frame;
  target: the D contact), its control, and the half-weight and contact-pair readers.
- `test/experiment/gauge/register-join.ts` (E-FRC-0273), with its row in `test/registry.csv`, `test/experiment/all.ts`,
  the regenerated `test/catalog.csv` and the readme count.

### The derivation, and the construction chosen

- **The center.** 4Γ(−1) = −4J, and a link is odd under the center at both ends, so a gauge invariant operator holds an
  even number of half + fields. The dressed ⟨ψ₋†ψ₊⟩ does not exist for any field, and a physical state holds N₊ even.
- **The candidates.** A + with − contact keeps N₊ and N₋ (a Fierz relabeling of a J-commuting piece). The chiral wall,
  Σ(648), the roles and the field all commute with J. A dressed ψ₋†Uψ₊ is center-odd. So the least join is new: two
  half + members in an isospin singlet to two half − members.
- **The census** (13,824 and 331,776 elements): S → S 0, D → D 1 (0 with SU(2)₋), S → D 1 and 1, D → S 2 and 1. The
  chosen join is S → D, unique, keeping rotations, SU(2)₋ and spin one half. A sector contact counted from the sea, at
  the ledger's prime unit ρ, in beat 2's frame where both channels are orthogonal to the flats.

### Results (gates fixed in the header before the gate run, probes disclosed)

E-FRC-0273, fail on H alone, as derived (833 s). Z, N, B, I, X, C1, C2 and the instrument hold. One cycle converts
exactly 3/28 of a contact pair into half − at ρ (L = 4 and 6) and 3/4 at ω; the same phase with nothing joined keeps it
at 1.4e-29 or less. N_F within 3.2e-13 of 0, N₊ odd at most 2.4e-29, least occupancy 6 over 4,718,592 configurations.
D → D misses Γ₋ and the untwisted rotations by 0.125. H fails: ⟨ψ₋†ψ₊⟩ stays at 2e-29. Read: the gauge invariant
coherence κ's running mean settles near 0.04 over 16 to 64 cycles (not claimed stationary), and its ledger term flips
with the ledger's sign.

### How it was tested

Probes `tmp/hc-probe1.log` (the census), `tmp/hc-probe2.log` (the channels). Smokes `tmp/hc-smoke.log` (4 cycles),
`tmp/hc-smoke2.log` (every path of the experiment). Gate run `tmp/hc-gate-E-FRC-0273.log`. Checks `tmp/hc-checks.log`:
`tsc --noEmit -p tsconfig.check.json` exit 0, `test/catalog.ts` 1,538, `task/check-labels.ts` (the same 1 contradicted
label and 20 for review, none from this item, 0 registry rows outside the barrel), `task/check-coverage.ts` (0 unknown,
0 mismatches), `test/result.ts check` exit 0 (0 problems). The readme's category counts were stale for gauge and spin
and now read the catalog (272, 185).

### Status and follow-ups

- No row is ticked, and the Higgs row stays broken. It now needs a center-odd scalar on the docks, which the rule does
  not have, or a vacuum other than the full sea that some ledger selects (every hole-counted piece is the identity on
  the full sea). The mass to read is a gauge invariant pair's level shift, not a lone doublet's.
- Not read: whether κ's settled mean is a stationary part, the mirror join (S₋S₋ to D₊D₊, also admissible), the join in
  a curved field and on the chiral slab.
- Notes changed outside this repo: `remaining-pieces.md` (a new section, "A channel that joins the register halves",
  and the one-rule table), `open.md` (Next up 8, FND-14, FND-15, WKF-01, WKF-03, text only), `solutions.md` (§8),
  `everything.md` (the Higgs row, text only). `constraints.ts` is unchanged: the Higgs row stays broken.

## The kernel: the heavy engines' inner loops in Rust, native and wasm, byte for byte

The pair engines and the sea engine spend nearly all their time in a few loops. This moves them into one Rust crate
built two ways, and proves every backend gives the TypeScript's bytes at every thread count. No experiment was rerun and
no engine's default changed. The architecture note is `note/research/vibe/kernel.md` in the parent repo.

### What was built

- `kernel/`, one Rust crate with no dependencies: `src/prim.rs` (the arithmetic, each primitive a restatement of an
  engine loop over a range of rows), `src/pool.rs` (a persistent `std::thread` pool, fixed contiguous row split),
  `src/node.rs` (a Node-API addon, the dozen `napi_*` calls declared by hand, so no crate and no npm package; it reads
  and writes the engine's typed arrays in place), `src/wasm.rs` (the same primitives as wasm exports), `build.rs`.
- `code/kernel/`: `types.ts` (the `Kernel` interface), `js.ts` (the reference backend, the engines' loops restated),
  `native.ts`, `wasm.ts` (one instance, copies in and out), `wasm-threads.ts` (one instance per `worker_thread` over
  one shared memory, states adopted into it so no copy), `pair.ts` (the ball and reduced cycles, Gram, inner, filter,
  read, autocorrelation on a kernel), `sea.ts` (seaBeat, seaCycle, pairAt, flatCount on a kernel), `index.ts`.
- `task/kernel/build.ts` (runs cargo, writes `kernel/host/vibe-kernel.node` and `vibe-kernel.wasm`; `wasm-threads`
  writes `vibe-kernel-threads.wasm`), `task/kernel/check.ts` (the proof), `task/kernel/bench.ts` (the timings).
- Three engines take an opt-in last argument `{ backend: 'native', threads: 12 }`. Without it, nothing changes:
  - `code/measure/register-ball-reduced.ts`: `ballEngine(s, params, opts)`. `ballCycle`, `ballGram`, `ballInner` and
    `ballFilter` (and so `ballRead`, `ballNorm2`) run on the kernel.
  - `code/measure/register-reduced.ts`: `reducedEngine(s, u, K, count, form, opts)`. `reducedCycle` (vector form
    included), `reducedGram`, `reducedInner`, `reducedFilter` and `autocorrelation` (and so `reducedRead`,
    `reducedNorm2`) run on the kernel.
  - `code/measure/register-sea.ts`: `seaCycle(t, rule, E, s, spare, opts)` and `flatCount(t, mv, s, opts)`.
- **Every registered experiment still defaults to js.** No experiment file passes the option, so no registered number
  can change. A new gate run opts in by passing it.

The artifacts under `kernel/host/` are generated and gitignored by the `host/` rule. The addon is machine specific, so
it should not be committed: each machine runs the build.

### The primitives

`conv` (the gathered block convolution: the sparse 8 x 8 overlap per root on member 1 or 2, over a neighbour read
through a signed index permutation), `pairBeat`, `crossApply`, `blockAdd`, `blockInner` (per-representative partials,
summed in TypeScript in the reference's order), `axpy`, `scale`, `seaPiece`, `seaStream`, `phaseSum`. Chosen by the
profile: `conv` was 67% and 11% of the profiled run (over 95% of each pair engine), `sectorPiece` 805 of 940 ms of a sea
cycle. Transcendentals stay in TypeScript and are passed in, since V8's `Math.cos` is its own fdlibm port.

### The equivalence proof

`pnpm call task/kernel/check.ts` (or `--quick`). Every primitive on fixed inputs with planted zeros and negative zeros,
on real ball and reduced tables (K = 0 and an axis), against the js backend, byte for byte; then whole engine steps
against the engines' own functions: `ballCycle`, `ballInner`, `ballFilter`, `ballRead` (also through the wired
`ballEngine` option), `reducedCycle` in the vector form at K = 0 and on the axis, `reducedInner`, `autocorrelation`,
`seaCycle` under the plain rule and the dock, member and whole controls, `pairAt`, `flatCount`. Backends: native at 1,
2, 4, 8 and 16 threads, wasm, and wasm-threads at 1, 2, 4, 8 and 16. The wired paths are held to each engine's default path through the engine's own functions: `ballEngine`
at every native count, and `reducedEngine` (`reducedCycle`, `reducedGram`, `reducedInner`, `autocorrelation`,
`reducedFilter`, `reducedRead`, at K = 0 and on the axis), `seaCycle` (three rules) and `flatCount` at 1, 4 and 16
threads. Result: **PASS, 3,202 comparisons (full), 0 differences.** The comparison first proves it sees one ulp and a
signed zero. Negative control (`tmp/kn-control.sh`): the same crate built with `-C llvm-args=-fp-contract=fast` fails
599 of 3,177 quick comparisons, every wired path of all three engines among them, and exits 1.

A bug found and fixed on the way: the wasm-threads handshake could lose a wakeup when a worker that sat out one call
woke late and read the next call's parameters (the full check hung at 0% CPU). Every worker now acknowledges every
call. The native pool reads its parameters under the same mutex as the generation and never had the race.

No primitive had to stay on the JS path: every one holds byte equality.

### Speedups (wall time a cycle, the machine at a load average of 70 to 105 on 18 cores)

Every row below had its final state compared byte for byte with the js engine's (all equal). The machine carried other
experiment runs throughout, so each thread got well under a core and these figures understate the gain on an idle
machine. Measured by CPU time on one thread, the native `conv` runs at 4.6 GFLOPS against JavaScript's 1.6 (2.9x a
core), the wasm one at 4.2 (2.6x).

| threads | ball radius 24 (5,401 reps, js 3.19 s) | reduced vector R 30 (2,805 reps, js 1.83 s) | sea L 4 (4.7M amplitudes, js 1.28 s) |
| --- | --- | --- | --- |
| native 1 | 3.0x | 2.8x | 2.7x |
| native 2 | 5.2x | 4.7x | |
| native 4 | 7.3x | 9.2x | 8.2x |
| native 8 | 16.0x | 16.3x | 17.9x |
| native 12 | 19.1x | 19.2x | |
| native 16 | 24.2x | 24.3x | 19.0x |
| wasm 1 | 2.2x | 2.0x | 1.6x |
| wasm-threads 16 | 30.4x | 16.1x | 5.9x (copies the state every call) |

An earlier run of the ball at a lower load gave native 5.0x on 1 thread and 22.9x on 16, and wasm-threads 34.2x on
16. The spread between runs is the contention. The two backends are close at high thread counts; native needs no copy
anywhere, runs outside the JS heap, and is the one wired. For the gate filter this means a radius-24 cycle drops from
about 3.2 s to about 0.13 s, and a 2,048-cycle filter from about 1.8 hours to about 4.5 minutes, at this load.

### What each engine needs to adopt it

- **register-ball-reduced** (E-SPN-0178): wired. `ballAbsorb`, `ballProfile`, `ballStart` stay JavaScript (cheap).
- **register-reduced** (the weak pull): wired. With the option set, its own worker pool is bypassed (it is no longer
  needed). The open-pieces worktree running the weak-pull gate has its own copy of the code and is untouched.
- **register-sea** (E-SPN-0175): wired for `seaCycle` and `flatCount`. `seaBeat` alone, `movingBlocks` and
  `pairStart` stay JavaScript (once a run).
- **register-link-field** (E-SPN-0180): its time is dense Hermitian eigensolves (`eig-hermitian-tridiagonal`,
  Householder then QL). A kernel for it means porting that solver operation for operation, including its `Math.sqrt`
  and `Math.hypot` calls (sqrt is exact in IEEE, but hypot is not, so hypot would have to be passed through or
  restated as V8 computes it). Not built.
- **harmonicLines**: 3% of the profile, trigonometric in its inner loop. Stays JavaScript.

### Phase two, not built: integer engines on the GPU

GPUs have no float64 (WGSL and Metal), so no float gate may run there. But purely integer or modular engines can run
exactly: `sea-reach`'s mod-p beats (a sparse 192 x 192 matrix mod p < 2^25 at every cell, then the stream, needing
50-bit products done as 16-bit limbs or Barrett reduction on 32-bit lanes), ring-unit counts mapped to F_p, and census
and trigger counts (per-lane counts, a tree sum, exact since integer addition is associative). The `Kernel` interface
would take an exact family beside the float one, with the same row contract, so a `webgpu` backend could implement
only that family. In Node it needs an npm WebGPU binding the user would add (`webgpu` is already a dependency here,
unused by the kernel) or a Swift and Metal worker; in the browser, native WebGPU.

### How it was tested

`tsc --noEmit -p tsconfig.check.json` exit 0. `task/kernel/check.ts` PASS (quick and full). `tmp/kn-control.sh` FAIL
as required. `task/kernel/bench.ts ball 24 8`, `reduced 30 6`, `sea 3`, `primitive 24`, and `tmp/kn-cpu.ts` (CPU
against wall time). Profile: `tmp/kn-profile.ts` under `tmp/kn-prof.sh`, read by `tmp/kn-prof-read.ts`.

### Toolchain notes

rustc here is an x86_64 nightly (1.96, 2026-03-02) with only the x86_64 std installed. The build cross-compiles for
aarch64 (what node runs as) and for wasm32 with `-Z build-std`, which compiles std from `rust-src` and installs nothing.
No rustup target was added. `rustup target add aarch64-apple-darwin wasm32-unknown-unknown` would skip the std build,
except for wasm-threads, which always rebuilds std with atomics (nightly, about 17 minutes under this load). No crate
was needed; rayon was not, since the row partition is static and a hand pool keeps the split fixed and visible.

## OPEN-WKF-03 and OPEN-CPA-01: the true mesh's orientation sign, read as a staggered sign (E-FRC-0274)

The guess: the orientation sign ε(x) = det f_x that the true mesh's labelling alternates is a center-odd scalar from
geometry, and in an oriented frame a label hop joins the register halves, supplying both the Higgs row's channel and the
parity row's orientation-reading mass, as staggered fermions do. Derived in the note first, then run.

### What changed

- `code/measure/orientation-taste.ts`: the graph parity, the dock signs, the per-half weights in labels and in the
  oriented frame, the class weights and restriction, a local 2T move on a state, the four-dock loop holonomies of the
  parallel transport read in labels, a cycle's band on one half, the Jordan roots with two free phases, and the
  schedules (achiral, label chiral, orientation-reading, orientation-weighted, and the one-class label rules each
  becomes).
- `test/experiment/gauge/orientation-sign.ts` (E-FRC-0274), with its row in `test/registry.csv`,
  `test/experiment/all.ts`, the regenerated `test/catalog.csv` and the readme count.

### The derivation

- **The frame change is local** (a reflection's minors on the ε = −1 docks), and the oriented frame's chirality is ε J.
- **One stream flips the physical hand entirely, one cycle not at all**, because every value crosses one link a beat.
  The cycle commutes with ε J. So the joining is the frame change: no mass, no gap.
- **ε is a character of the mesh group** (every relation of [3,4,3,4] has an even number of r₄), a checkerboard with no
  holonomy, and on the husk it is Kogut and Susskind's (−1)^(h₁ + h₂ + h₃). The holonomy the labels hide is a rotation.
- **ε is center-even**, and the center is −J in every frame, so E-FRC-0273's obstruction does not depend on the frame.
- **Two classes.** The stream splits spacetime into two classes no dock-local piece joins. On a class the
  orientation-reading mass is a label rule, with both hands at the mean mass and a rigid offset (the Jordan law with two
  free phases). The orientation-weighted identity, the staggered mass's analog, makes the member massless, because the
  model's own u, ū schedule is already the staggered mass.
- **Parity inside a class.** det g = χ(g) det φ(g), so every husk mirror the label chiral rule keeps swaps the classes.

### Results (gates fixed in the header before the gate run, probes disclosed)

E-FRC-0274, fail as derived (130 s, 716 MB). Every gate, control and instrument held. m_i4 = 2, 2, 2, 4; 0 odd loops
on 8,857 docks against 3,072 on the flat box; 63 of 63 husk cubes on Kogut and Susskind's sign; 192 ridge loops, each
holonomy a rotation of order 3 commuting with J. In the oriented frame, one beat moves all the weight across and each of
4 cycles moves exactly 0, and the label halves and the classes never mix. 4Γ(−1) = −4J, 2T moves change nothing
(1.3e-16). The two-phase law to 1.1e-14. The label chiral mass keeps 4 husk mirrors, all class-swapping, and breaks all
28 class-keeping ones (at least 1.09e-2). Controls: flat box 0 moved, achiral rule keeps every element (8.5e-17), the
label rule is not the orientation-reading one (2.5e-2), the orientation-reading class misses the label law (9.4e-2).

### How it was tested

Probe `tmp/ot-probe1.log`, smoke `tmp/ot-smoke.log`, gate run `tmp/ot-gate-E-FRC-0274.log`. Checks `tmp/ot-checks.log`:
`tsc --noEmit -p tsconfig.check.json`, `test/catalog.ts`, `task/check-labels.ts`, `task/check-coverage.ts`,
`test/result.ts check`.

### Status and follow-ups

- No row is ticked. The Higgs row stays broken, now with the geometric candidate ruled out. The parity row is restated:
  within one class the chiral mass breaks P. Whether the true mesh violates P turns on whether the two classes interact,
  which dock-local pieces and static links never do and a dynamical link field would.
- Not read: the classes under the SU(2)₊ field with its own dynamics, the two-phase law on the true region's own C†C
  spectrum (derived for any static field, read here on the flat cycle, which each class's label rule is).
- Notes changed outside this repo: `remaining-pieces.md` (a new section, "The orientation sign as a staggered sign"),
  `open.md` (Next up 7, CPA-01, WKF-01, WKF-03, FND-14, FND-15, text only), `everything.md` (the parity and Higgs rows,
  text only). `constraints.ts` is unchanged: no status changes.

## OPEN-MOT-01 and OPEN-LGT-02: two exact reductions against the long time series (derived, neither applies)

Two proposals to replace the long runs: E-SPN-0180's Jordan law as a Hermitian eigen-solve for the weak-pull pair, and
E-FND-0159's prime-unit count as a branch-free energy for the ladder light's balance. Both were derived first. Neither
applies, so nothing was built and no row was added.

### What changed

- No code or experiment. One probe, `tmp/hr-probe1.ts` (log `tmp/hr-probe1.log`), and the runners `tmp/hr-tsx.sh`,
  `tmp/hr-checks.sh`.
- Notes outside this repo: `remaining-pieces.md` (a new section, "Two exact reductions tested against the long time
  series"), `open.md` (OPEN-MOT-01, OPEN-LGT-02, OPEN-LGT-12, text only), `solutions.md` (§7).

### The derivations

- **A, no.** E-SPN-0180's law needs each beat to be a phase on one projector with V an involution. The pair's beat 1 is
  (1 + (u − 1)Q₁)(1 + (u − 1)Q₂) Σₙ ρ^(−n) Πₙ with Πₙ = Q₁Q₂[n(Y) = n], hundreds of eigenvalues, and the vector form adds
  two cross pieces. Without the pull a tensor form survives (±E(μ₁) ± E(μ₂), exact thresholds). The pull is a scalar
  potential, which no static link field can carry. A (+,+)-branch Hermitian projection errs by about 1.7e-3 at a_B 8,
  50 times the 3e-5 K shifts R needs. A Krylov method on U needs about 2/δ products for lines δ apart, the same order as
  the autocorrelation.
- **B, no.** The light's units are ζ_M, of finite order, so an exponent lives in Z/M, which is the seam. The count's
  analog c⟨N_D⟩ + r⟨N_F⟩ is real and reads 2 tan(ω/2), not ω. Named instead: the spectral flow from the identity
  (scale both exponents from 0, follow each phase), with integer turns, a lifted spectrum continuous in ρ, and an exact
  integer trace per sector. Its gates are listed in the note. Not run.

### Probe (read, not gated)

a_B 3, ball 10, O_h sector, 512 cycles. Vector form: bound lines 1.42123, 1.52013, 1.54061, 1.54933, and no mirror
partner from an S S or a D D start, so the gate's cycle is not a two-projector product for any projectors. Scalar form
(the control): the D D start's lines mirror the S S start's to 1e-6 with equal weights.

### How it was tested

`tmp/hr-checks.log`: `task/check-labels.ts` (the same 1 contradicted label and 20 for review, 0 registry rows outside
the barrel), `task/check-coverage.ts` (0 unknown, 0 mismatches), `test/result.ts check` (0 problems). `tsc --noEmit -p
tsconfig.check.json` exits 2 on one error in `test/experiment/gauge/orientation-sign.ts` line 634 (a readonly tuple cast
to `Mat[]`). That file is another item's, in progress in this worktree, and this item adds no code.

### Status and follow-ups

- The weak-pull class stays days long. No speedup from A.
- B's spectral-flow lift is the one new route for OPEN-LGT-02, about 30 minutes on (9, 3).

## OPEN-MOT-03: the rule's own modes below a cusp, read for one that stays on the screen (E-SPN-0182)

E-SPN-0181 found that the register member, carried over from the flat band, does not travel on the true husk. Its named
next step was a mover built for the screen: the rule's own eigenmodes on the layer and the docks under it, Bloch-reduced
along the horosphere, asked whether any stays on the screen and moves. This item reads them.

### What changed

- `code/algebra/linear/eig-hermitian-householder.ts`: eigenvalues and eigenvectors of a complex Hermitian matrix
  (Householder with complex reflections, then tql2 on the real tridiagonal, vectors as rows), O(n^3) once. The library
  had the values only, or Jacobi on the 2n embedding. Checked against the values-only solver (gap 0) and by residual.
- `code/measure/cusp-bloch.ts`: the husk's unit translations with their label actions; the region below a cusp modulo
  the unit lattice (twisted by the label action) or the even lattice (label-trivial), to a depth cut; the flat quotient
  and a finite region in the same form; E-SPN-0180's covariant Clifford hop C(k) with a reflecting or open frontier;
  H = C^dag C; every band with its layer share and Hellmann-Feynman velocity; the top eigenspaces by a block Krylov space
  from the layer; and the register rule itself on the even quotient at a momentum (the check that H is the rule's).
- `test/experiment/spin/screen-modes.ts` (E-SPN-0182), with its row in `test/registry.csv`, `test/experiment/all.ts`,
  the regenerated `test/catalog.csv` and the readme count (1,545).

### The derivation (in the header, before the gate run)

- **The husk's translations move the labels.** A unit translation is r4 times the parallel cube mirror, and φ(r4) = −I,
  so its label action is minus a reflection (diag(−1, 1, −1, −1) for one axis). A Bloch reduction along the horosphere
  is twisted by it, and 2Z³ is the label-trivial kernel.
- **The modes are one Hermitian matrix.** By E-SPN-0180's law every moving level is cos E = cos M − 2cos²(M/2)μ over the
  spectrum of H(k) = C(k)†C(k), for any member mass. A mode's layer share is where its S and D mixers act.
- **The leak is fixed.** Each depth-1 dock has one layer parent, so the layer block is exactly C_LL†C_LL + 1/32 at every
  k, no phase can cancel the 1/32, and a layer-held state sits at most at 1/16, inside the depth's band.

### Results (gates fixed in the header before the gate run, probes disclosed)

E-SPN-0182, partial on the instrument (5,474 s on a loaded machine). G1, G2, G3, C1, C2, C3, I1, I2 and I4 hold; M fails
as derived; I3 fails. The cut 3 Krylov reading left Ritz residuals of 5.5e-5 against the 1e-10 set before the run. No
gate moved and none was rerun.

- The twisted cell: 1, 19, 349 and 6,383 docks at depth cuts 0 to 3. The leak is I/32 to 6.9e-18 at all five k, and
  the along hop reaches exactly 1/32 at most.
- The largest layer share at cuts 1, 2, 3: 0.704, 0.554, 0.412 at k = 0 and (π, 0, 0); 0.616, 0.432, 0.288 at (π/2, 0,
  0); 0.477, 0.344, 0.228 at (π/2, π/2, π/2); 0.697, 0.544, 0.402 at the generic k. Falling everywhere, below 1/2 at cut
  3, and at three momenta faster than cut 2's deepest-shell weight allows a bound state. The band rides the top of the
  spectrum (μ 0.084, 0.096, 0.106 at k = 0). Husk speed at most 0.025 docks a beat, 0.072 of √2/4.
- Controls: the flat quotient gives √2/4 to 6 digits at small q and diracSpeed at q = 0.6. The closed screen (the 18 down
  slots returned to the dock) carries a band on the layer at 0.046 docks a beat.
- Instrument: the twist 8.7e-15, the plane of an H eigenvector closes under the rule itself (7.4e-12) with the law's
  phases (3.8e-12), dense residuals 1.4e-13, the Krylov reading against the dense one at cut 2 4.5e-14.
- The cut 3 shares are read, not certified. A 300-vector probe at the same cut read the top eigenspace, the one of
  largest share at every k, at 1.4e-15, and the unconverged ones at the 7th and 8th places.

### How it was tested

Probes `tmp/ms-probe1.log` to `tmp/ms-probe7.log` (with `ms-probe2-d2`, `ms-probe3-d2`, `ms-probe6-d1/d2/d3`,
`ms-probe6b-d2/d3`) and `tmp/ms-eig-probe.log`. Smokes `tmp/ms-smoke.log` and `tmp/ms-smoke2.log`: the first caught
two faults before the gate run, both fixed and disclosed in the header (G3 summed the six along blocks' Grams where they
land on one dock, and the smoke's 120-vector space was too small). Gate run `tmp/ms-gate-run1.log`. Checks
`tmp/ms-checks.log`: `tsc --noEmit -p tsconfig.check.json` exit 0, `test/catalog.ts` 1,545, `task/check-labels.ts` (the
same 1 contradicted label and 20 for review, none from this item, 0 registry rows outside the barrel),
`task/check-coverage.ts` (0 unknown, 0 mismatches), `test/result.ts check` exit 0 (0 problems).

### Status and follow-ups

- No row is ticked, and OPEN-MOT-03 stays open. No mode of the register rule stays on the true screen. The share falls
  at every cut and momentum read, and even the best band moves at most 0.07 of √2/4.
- Why none: the down coupling is geometry, 1/32 on the diagonal at every k, as large as the along hop's whole reach, into
  shells whose band reaches past 0.106. What would make one: a rule whose screen docks do not stream their 18 down slots
  into the bulk. The closed screen shows such a band exists and moves, at 0.13 of √2/4.
- Not done: the wave packet (there is no screen mode to launch), the pair census (it needs one), a certified cut 3
  reading (more Krylov vectors), and cut 4.
- Notes changed outside this repo: `remaining-pieces.md` (a new subsection under "Parity and motion on the true mesh, at
  a cusp"), `open.md` (Next up 7, MOT-03, text only), `everything.md` (the Lorentz dispersion row, text only).
  `constraints.ts` is unchanged: no status moves. No site sentence changes.

## OPEN-FND-03, OPEN-CSM-13: a many-hole engine for the register rule, and three holes relaxing (E-FND-0161, E-FND-0162)

Every register-rule read was two holes on the 4d torus, on E-SPN-0175's engine, which holds 192^n amplitudes a momentum
tuple. This item derives which method reaches more holes, builds it exactly, validates it as a gate, and runs the
first physics it unlocks.

### What changed

- `code/measure/register-holes.ts`: the exact reduction (flat holes are spectators, each hole keeps its half), the
  per-momentum frames with the sector states as coordinates, the transfers A1, A2, the n-hole engine at any total
  momentum (one-body beats, the pair phase product over in-sector pairs through a 4d FFT on the torus), reads (momentum,
  band, half, exchange weights), Slater starts, the bridge from E-SPN-0175's dense pair, the band levels, the exact free
  energy shell and the infinite-temperature count.
- `test/experiment/foundations/register-holes.ts` (E-FND-0161) and `register-relaxation.ts` (E-FND-0162), their rows
  in `test/registry.csv`, `test/experiment/all.ts`, the regenerated `test/catalog.csv` and the readme count (1,545).

### The derivation, and the method chosen

Four methods weighed in `remaining-pieces.md`, "A many-hole engine for the register rule". Free fermions plus pair
pieces at low density have no small parameter (the sector string acts at every separation). Time-dependent
Hartree–Fock keeps natural occupations at 0 and 1 and, from plane-wave starts, every momentum: it cannot decide
equilibration, and its error bar on the J rows is the whole effect. A 3d slab gives the same reach, not more. The exact
engine in the moving space reaches two holes on every torus run so far and three on L = 4 (8.4e6 amplitudes a half
against 1.2e11 dense); four holes on L = 4 need 8.6e9 a half, out of reach. It offers one other vacuum, seas of flat
holes, exactly stationary and tied with the full sea by E-FND-0159's ledger; a partly filled band sea is Hartree–Fock's
only. And few holes carry an energy: the member is a massive Dirac band, and while n E_max < π (n ≤ 3 on L = 4) the band
quasi-energy cannot wrap.

### Results (gates fixed in each header before its gate run, probes disclosed)

E-FND-0161, pass (1,532 s). The frame to 3.0e-15 on L = 4 and 6; the dense and reduced two-hole states agree to 8.3e-15
over 64 cycles on L = 4 and 3.0e-16 over 8 on L = 6; E-FND-0158's traded weights (9.750e-5 to 2.139e-3) come out of
the moving part alone to 1.5e-14; the three pair masks match the two-hole engine to 2.3e-17, the free rule its Slater
determinant to 5.1e-15. A one-sign error (5.1e-2) and the free rule (6.1e-2) fail to agree, as they must. Depth L1.

E-FND-0162, pass (4,862 s on a loaded machine). Three holes on L = 4: momenta end 5.57 of 6 from the start; two starts
in one shell end 0.51 apart, a start and its band mirror 0.10, a start in another shell 1.27; 0.932 of the weight stays
in the starting band (0.065 from the other), with no drift across the late window, where infinite temperature gives
0.5. The free rule moves nothing (3.8e-13). No temperature is resolved on five band levels. Depth L2.

### How it was tested

Probes `tmp/mh-probe1.log` to `tmp/mh-probe4.log`, `tmp/mh-bands.log`, `tmp/mh-levels.log`, `tmp/mh-micro.log`,
`tmp/mh-shell.log`; smoke `tmp/mh-smoke.log` (after it, P2 of E-FND-0162 was moved because it equalled a probe start,
disclosed). Gate runs `tmp/mh-gate-E-FND-0161.log`, `tmp/mh-gate-E-FND-0162.log`. Checks `tmp/mh-checks.log`: `tsc
--noEmit -p tsconfig.check.json` exit 0, catalog 1,545, `task/check-labels.ts` (the standing 1 contradicted label and
20 for review, 0 registry rows outside the barrel), `task/check-coverage.ts` (0 unknown, 0 mismatches), `test/result.ts
check` (0 problems).

### Status and follow-ups

- No row is ticked and no status moves: three holes on the 4d torus, one half, one tone, not the husk.
- Next: four holes on the L = 2 box (2.1e6 amplitudes a half) for the Bose composite and for whether the band energy
  heats once it can wrap; a symmetry-reduced engine for four holes on L = 4; a box whose band is dense enough to
  resolve a temperature; the husk.
- Notes changed outside this repo: `remaining-pieces.md` (a new section, "A many-hole engine for the register rule",
  and pointers in E-FND-0158's row table and "Order of work" step 4), `open.md` (FND-03, CSM-13, CSM-14, MAT-07,
  MND-01, FND-14, text only), `everything.md` (bosons, temperature and equilibrium, Bose and Fermi distributions, text
  only). `constraints.ts` is unchanged. No site sentence changes.

## OPEN-FND-03, OPEN-CSM-13: the many-hole engine on the Rust kernel, and four holes on L = 4 (E-FND-0163, E-FND-0164)

E-FND-0161's engine stopped at three holes on L = 4: four need 8.6e9 amplitudes a half (137 GB). This item moves the
engine's hot loops onto the kernel, byte for byte, derives a storage that fits four holes, validates it as a gate, and
runs the first question four holes unlock: whether the rule heats once the band energy can wrap.

### What changed

- `kernel/src/prim.rs`, `node.rs`, `wasm.rs`: three primitives, `hole_one_body` (register-holes `oneBody`, a tuple a
  row), `hole_band` (`bandWeights`' local sums) and `hole_pair` (`pairPhases`: an orbit of fiber indices a row, its
  column gathered, the 4d FFT to sites on every axis with the reference's own butterflies, the phase, the FFT back,
  scattered). The binding checks every size and index, the orbits disjoint and the gather a bijection.
- `code/kernel/types.ts`, `js.ts` (the reference restated), `native.ts`, `wasm.ts`, `wasm-threads.ts` (its argument
  block raised to 32), and `code/kernel/holes.ts`: the tables (Fourier, flattened transfers, the dense engine's
  orbits, the pair phases computed in TypeScript exactly as `pairPhases` computes them), `fastHoleCycle`,
  `fastBandWeights`, and the shape checks the wasm backends run.
- `code/measure/register-holes.ts`: `holeEngine(fr, n, total, { backend, threads })` opts in; the default path is
  unchanged, so no registered number moves.
- `code/measure/register-sorted-holes.ts` (new): the sorted store, antisymmetric by construction, on a kernel (js by
  default, its reference): the engine, the cycle, Slater starts, fold and unfold to the dense layout, and the reads
  (norm, occupation, upper-band fraction, the band-resolved count P(k), tie antisymmetry).
- `task/kernel/check.ts`: the holes section. `test/experiment/foundations/register-sorted-holes.ts` (E-FND-0163) and
  `register-wrap.ts` (E-FND-0164), their rows, the barrel, the catalog and the readme count; `register-relaxation.ts`
  exports `shellTriples` (no number moves).

### The kernel

Profiled on three holes at L = 4: 5.6 s a cycle, half in `oneBody`, half in `pairPhases` (the FFTs), 1.3 s a band
read. On the kernel, byte for byte: `holeCycle` 6.9 s to 0.41 s (16.6x) and `bandWeights` 1.32 s to 0.061 s (21.6x) at
12 native threads on the loaded machine. The full check is 3,614 comparisons, 0 failures (the ball, reduced and sea
paths as before, plus 412 hole comparisons: the three primitives alone on L = 2, 4 and 6 tables, the dense and sorted
orbit tables, both phase signs and a stream of phases, against js, native at 1 to 16 threads, wasm and threaded wasm;
`holeCycle` and `bandWeights` wired against the engine's own JavaScript under the rule, the one-sign control, a pair
mask and the free rule; the sorted store against its js reference). The FMA build fails 749 of 3,539 in the quick check,
every hole path among them.

### The reduction (E-FND-0163, pass, 273 s)

Antisymmetry as a storage rule: keep the rows whose momenta are nondecreasing, with every fiber tuple (ties keep both
orders, so the one-body step stays a product). Translation was already used. Four holes at L = 4: 91,808 rows, 3.76e8
amplitudes, 6.0 GB, a factor 22.8. The point group (up to 192 more) was not needed and is the next reduction. Gates in
the header before the run: the unfolded store equals the dense engine to 5.3e-17 (three holes, L = 4) and 3.2e-16 (four
holes, L = 2) over 16 cycles; E-FND-0162's P1 gives 0.932108 from both engines (to 4.4e-16); four holes on L = 4 keep
the free Slater determinant to 4.7e-16 and the norm to 2.5e-14 under the rule. Dropping the permutation signs misses by
0.20, the free rule by 0.14. 32 s a four-hole cycle at 12 threads. Depth L1.

### Four holes can wrap, and do not heat (E-FND-0164, pass, 14,075 s)

Derived before the run: at L = 4, 4 E_max = 3.251 > π, and only the two corners of the four-hole spectrum (every hole at
the top two levels, all in one band against all in the other) meet across 2π, a four-fold band flip. Predicted: no
heating. Probes (disclosed) showed U alone cannot tell a flow from a larger dressing, so the store is also read
band-resolved, P(k) with k holes in the other band. Gates in the header before the run, starts not the probes':

- W1: band memory U − U′ 0.415 ('3344', U 0.709, U′ 0.294) and 0.474 ('3333'); full mixing gives 0.
- W2: U + U′ 1.003 and 0.993.
- W3: memory kept from the late window's first half to its second 0.986 and 0.963, the non-wrapping comparator 0.965.
- W4: every hole flipped 0.0205 and 0.0174, falling across the window (a half-mixed corner carries 0.15 to 0.25).
- CF: the free rule keeps the band to 4.9e-15. I1 2.1e-13, I2 3.4e-18.

Read: the corners carry 0.68 and 0.78 of the comparator's memory and 5 to 6 times its four-fold weight, close to an
independent-hole dressing ((0.29 / 0.20)⁴ = 4.4): at most a small static admixture of the other corner, no flow; a
mixing rate above about 1e-3 a cycle is excluded. The smoke's 2-cycle window had failed W2 to W4 (the transient),
disclosed; nothing changed after it. Depth L2.

### How it was tested

Profile `tmp/fh-prof.ts` (`tmp/kn-prof/`), the wired smoke `tmp/fh-smoke1.ts`, probes `tmp/fh-probe1.ts` to
`tmp/fh-probe5.ts`, the heating probes `tmp/fh-heat-*.log` and `tmp/fh-count-*.log`, smokes `tmp/fh-smoke-0163.ts` and
`tmp/fh-smoke-0164.log`. The check `tmp/fh-check.log` (3,614, 0 failures), the FMA control `tmp/fh-control.log`. Gate
runs `tmp/fh-gate-E-FND-0163.log`, `tmp/fh-gate-E-FND-0164.log`. Checks `tmp/fh-checks.log`: `tsc --noEmit -p
tsconfig.check.json` exit 0, catalog 1,547, `task/check-labels.ts` (the standing 1 contradicted and 20 for review, 0
rows outside the barrel), `task/check-coverage.ts` (0 unknown, 0 mismatches), `test/result.ts check` (0 problems).
Both experiments need the native kernel built (`pnpm call task/kernel/build.ts native`) to rerun.

### Status and follow-ups

- No row is ticked and no status moves: four holes on the 4d torus, one half, one tone, not the husk.
- (b), the two-plus-two composite read for Bose statistics (OPEN-MAT-07), was not run: the row also needs a composite
  that is light (E-SPN-0162's is 35 times too heavy), and heating was the question closer to J's bar. The store makes
  it cheap to start: two bound pairs at total momentum 0 are 6 GB.
- Next: the point group on the store for five holes or L = 6 four holes (4.7e10 amplitudes after antisymmetry, 750
  GB); three holes on L = 6 fit already (3.6e7 amplitudes), the box where a temperature might resolve.
- Notes changed outside this repo: `kernel.md` (the three primitives, the holes check, the counts), `remaining-pieces.md`
  (two new sections under "A many-hole engine for the register rule", its row table and "Next", and "Order of work"
  step 4), `open.md` (FND-03, FND-14, MAT-07, CSM-13, MND-01, text only), `everything.md` (bosons, temperature and
  equilibrium, text only). No status moves.
- Site sentences that change: none required. Where a page says four holes are out of reach, or that whether the rule
  heats once four holes can wrap is open, it should now say four holes on the L = 4 torus run exactly and keep their
  band over 48 cycles where they can wrap (E-FND-0164).

## OPEN-CSM-13, OPEN-CSM-14, OPEN-MAT-07: a temperature on L = 6, and two composites read for Bose bunching (E-FND-0165, E-FND-0166)

The sorted store (E-FND-0163) unlocked two reads: three holes on the L = 6 torus, whose band has 11 levels rather than
5, for a temperature; and two composites of two holes each on L = 4, for Bose statistics in the dynamics. Both run on
the native kernel at 12 threads.

### What changed

- `code/measure/level-temperature.ts` (new): an occupation grouped by level, the Gibbs and Fermi-Dirac fits in the
  level energy weighted by class counts, the flat line, the residual-scaled error, and a fit that leaves levels out.
- `code/measure/register-composites.ts` (new): the two-contact-composite start in the sorted store, the relative
  amplitude of two composites in site space for any pair of internal states, the same read for two single holes, the
  exchange-fixed separations, the fixed-point bunching ratio (with a start's own separations left out) and the evenness
  check.
- `code/measure/register-sorted-holes.ts`: `sortedBandOccupation`, the band-resolved occupation per momentum class.
- `code/measure/register-holes.ts`: `freeShell`'s `ups` filter now applies (a local of the same name had shadowed it;
  its one caller, E-FND-0162, never passed it, so no registered number moves).
- `test/experiment/foundations/register-temperature.ts` (E-FND-0165) and `register-bosons.ts` (E-FND-0166), their rows,
  the barrel, the catalog and the readme count.

### A temperature on L = 6 (E-FND-0165, partial: every physics gate passes, the instrument fails)

Derived before the run from exact counts: L = 6 has 11 levels (9 degrees of freedom for a two-parameter fit, against 3
at L = 4); if the free band energy were kept, three holes would leave 7 of 11 levels empty at δ = −1.218, so a Gibbs
form that fills every level can only come from the pair pieces acting as the bath; and at a filling of 1.2e-3 a mode
Fermi-Dirac and Gibbs differ by about f in the log, below any fit. Probes (disclosed) showed each start's own levels keep
a memory, so the gate fits the levels the start left empty. Gates in the header before the run:

- T1: Gibbs in the band level, β 2.662 ± 0.139, 2.647 ± 0.121, −1.990 ± 0.150, −2.012 ± 0.249, rms 0.040 to 0.072
  in the log against 0.233 to 0.356 for the flat line.
- T2: one free δ, two level contents, one β: 2.662 and 2.647; −1.990 and −2.012.
- T3: positive below the band's middle, negative above it.
- CF: the free rule moves no occupation (5.0e-14).
- I1 and I2 FAIL: norm 5.7e-10, tie antisymmetry 8.6e-7. Diagnosed after the run against the dense engine on L = 6
  (`tmp/tp-diag.log`): equal to 3.8e-17 at cycle 16, then the store's redundant tie entries grow about 1.25 times a
  cycle (8.9e-12 at cycle 80), the amplitude gap half of that, the occupation still within 9.8e-16. It moves no reported
  digit, but the store's tie rows need a projection onto their antisymmetric part each cycle (not made: it would change
  every registered store run). L = 4's exact radix-4 twiddles are why E-FND-0164 read 3.4e-18.

Read: the band energy is not what is kept (the up-band holes' mean level moves toward the middle, 12 to 27 percent of the
weight sits in the other band); Fermi-Dirac and Gibbs differ by 1.4e-5 to 7.3e-5 in rms. A2 and B2 read the probes'
pick-0 fits to every digit (symmetry images, disclosed). Depth L2.

### Two composites, read for Bose bunching (E-FND-0166, fail as derived)

Derived before the run: exchange of two two-hole composites is (13)(24), +1 in every antisymmetric state, so it is
kinematic; the dynamical read is Hanbury Brown and Twiss bunching at the 15 separations that are their own negatives,
where an even relative amplitude doubles (the two paths from +R₀ and −R₀ add, as in Hong-Ou-Mandel) and a composite pair
in disjoint internal states gives the no-statistics reference: bosons 2, none 1, fermions 0. The composite is a contact
pair in the sector, bound by the −2.668 contact. Predicted to fail: the composite's band is at most 0.032 a cycle wide
and the string pins two composites' separation, so the bunching has too little weight to form. Gates in the header
before the run:

- B0: the contact pair keeps 0.933 of its sector weight at contact, 0.298 free.
- B1 FAILS: Bose ratio 0.820 (S1) and 7.69 (S2), unresolved; 2.6e-3 and 2.3e-4 of the weight left the start's shell.
- B2: two single holes vanish at the fixed points to 3.3e-29 in one fiber (0.719 in different fibers).
- B3: 0.378 and 0.372 of the weight stays in two contact pairs (bar 0.042).
- CF: the free rule leaves 0.0033. I1: even to 2.3e-17. I2: norm 1.8e-13, ties 5.1e-19.

The smoke exposed two errors in the read, fixed before the gate run with no gate moved (the lone composite's weight was
per site, and a start's own separations sat inside the reference means); a launch made before the fix was stopped after
its two-hole parts (`tmp/tb-gate-E-FND-0166-stopped.log`). Depth L2.

### How it was tested

Probes `tmp/tp-levels.ts`, `tmp/tp-probe1.ts`, `tmp/tp-probe2.ts` (six shells), `tmp/tp-free-shells.ts`,
`tmp/tp-l4-fit.ts`, `tmp/tp-refit.ts`; `tmp/bs-pair-probe.ts` (L = 4 and 6), `tmp/bs-probe2.ts`, `tmp/bs-read-test.ts`
(the read against a direct sum on L = 2, 4.0e-16), `tmp/bs-probe3.ts` (rule and free), `tmp/bs-probe5.ts`. Smokes
`tmp/tb-smoke-0165.ts`, `tmp/tb-smoke-0166.ts`. Gate runs `tmp/tb-gate-E-FND-0165.log` (1,456 s),
`tmp/tb-gate-E-FND-0166.log` (3,169 s). Diagnosis `tmp/tp-diag.ts`. Checks `tmp/tb-checks.log`. Both need the native
kernel built.

### Status and follow-ups

- No status moves: three and four holes on the 4d torus (L2 at most), one half, one tone, not the husk and not a
  subsystem with a bath. OPEN-CSM-13 gains a resolved temperature, OPEN-CSM-14 learns the Fermi law needs a filling near
  1, OPEN-MAT-07 learns the rule's composites do not move.
- Next: project the store's tie rows each cycle (and re-run E-FND-0165's instrument), the point group on the store for
  more holes or a larger box, a composite that moves.
- Notes changed outside this repo: `remaining-pieces.md` (two sections, the row table, "Next", "Order of work" step 4),
  `open.md` (FND-03, FND-14, MAT-07, CSM-13, CSM-14, text only), `everything.md` (bosons, temperature and equilibrium,
  Bose and Fermi distributions, text only). `constraints.ts` unchanged: no status moves.
- Site sentences that change: where the heat-and-time page says no temperature is resolved on the register rule, it
  should say three holes on the L = 6 torus relax to a Gibbs occupation with one temperature per energy, negative above
  the band's middle (E-FND-0165); where the spinor page says the two-plus-two composite read is not run, it should say
  it is run and fails as derived: the composites bind and exchange as bosons exactly, but do not move, so Bose
  statistics in the dynamics is not readable on L = 4 (E-FND-0166).

## OPEN-FND-14, OPEN-GRV-02, OPEN-GRV-13: is the sector imbalance a charge the rule could gauge? (E-FND-0167)

One guess would have unified three blocks: E-FND-0159's ledger grows with the box through n_S − n_D, E-GRV-0147's
gravity piece is two fields (S with S in beat 1, D with D in beat 2), and E-FRC-0273's only gauge invariant join takes
an S pair to a D pair. If n_S − n_D were a conserved charge the model treats as long-range without a Gauss law, gauging
it would make only neutral seas physical, might make gravity one field, and might make the join its charged matter.
This item derives whether the charge exists. It does not.

### What changed

- `code/measure/sector-charge.ts`: one member's pieces at Bloch momentum K (the mixers, the coin with the stream, beat 1
  and the cycle), the two-frame charge the ledger counts O₂ = Q_S − B₁†Q_D B₁ and the one-frame O₁ = Q_S − Q_D, their
  commutators with the cycle and each piece, O₂'s minimal polynomial, the hop C = Q_D V Q_S and V's leak out of S ⊕ D,
  the Z_n gaps, [Q_D, V Q_S V], and one member's total charge per cycle both as a Bloch sum and in real space.
- `test/experiment/foundations/sector-charge.ts` (E-FND-0167), with its row in `test/registry.csv`,
  `test/experiment/all.ts`, the regenerated `test/catalog.csv` and the readme count (1,550; L1 314; foundations 167).

### The derivation (in the header, before the gate run)

- **The pair pieces keep it, the mixers keep it, the stream breaks it.** A pair piece is a phase diagonal in its stage's
  counts, and the mixers are phases on Q_S and Q_D. The coin with the stream carries S into D through the Clifford hop
  C, ‖C‖² = 8g².
- **The law.** In each Jordan block O₂² = 1 − g², its band diagonal is ±p = ±sin M (1 − g²)/sin E (E-GRV-0147's passive
  charge), so ‖[U, O₂]‖ = 8|sin E|√(1 − g² − p²), 0 only at rest. n_S − n_D is Dirac's scalar density ψ̄ψ.
- **Nothing to gauge.** O₂'s spectrum ±√(1 − g²) is not quantized. The integer O₁ keeps no U(1) and no Z_n, since the
  hop picks up e^(−2iα) and V's leak e^(−iα). The conserved time average is m/E, velocity dependent.
- **The capped string is not a gauge field in axial gauge.** Its direct term is W(n_S² − n_D²), odd in the imbalance and
  without S–D cross terms, where a gauge field gives W q². Neutral seas are already extensive with no field.
- **(b)** A field of this shape is a mass shift on the probe, so only the source's count matters. Counted as n_S − n_D a
  band-B hole pushes every hole. The shared count is n_S + n_D, the moving number, and a one-stage pair piece on it
  needs counts that fail to commute by the hop, ‖[Q_D, V Q_S V]‖² = 16g²(1 − g²).
- **(c)** The join takes an S pair to a D pair, the hop's pair form: a second breaking of the would-be charge, with no
  field to be charged under.

### Results (gates fixed in the header before the gate run, probes disclosed)

E-FND-0167, fail on H as derived and on one tolerance in B1 (62 s). D1 to D6, C1, C2 and the instrument hold.

- The law to 3.0e-12 at 10 momenta (‖[U, O₂]‖ 1.07836, 3.66134, 4.77152 at |K| 0.2, 0.8, 1.6 on the axis, 1.5e-15 at
  rest). O₂³ = (1 − g²)O₂ to 2.2e-13. The mixers commute with O₁ to 1.9e-15, the stream misses it by at least 0.890.
  The Z_n gaps are at least 0.736 for n 2 to 12 away from rest and at most 4.4e-14 at rest.
- One hole on the L = 4 torus: n_S − n_D spans 0.640 over 32 cycles (the run on the Bloch sum to 2.6e-14). A hole at
  rest holds it at 1 to 2.9e-14.
- On E-GRV-0147's slab: the two-field control reproduces 2.1739e-2 with cross at most 0.0816. Under the S − D field a
  band-A source pulls both bands +1.786e-2 and a band-B source pushes both −8.603e-3, negative at every cycle.
- B1's band mirror between the two pushes missed its 1e-9 relative tolerance at cycle 1 only: 2.57e-9, which is
  1.4e-14 absolute on a push of 5.35e-6 (read after the run, `tmp/sd-probe3.log`). Cycles 2 to 8 hold within 2.2e-11.
  The gate was worded badly, relative on a small number. It stands as written.

### How it was tested

Probes `tmp/sd-probe1.log` (the readings at five momenta, the torus series against the Bloch sum),
`tmp/sd-probe2.log` (the three sourcings on a side-20 slab). Smoke `tmp/sd-smoke.log` (every path, small plan). Gate
run `tmp/sd-gate-E-FND-0167.log`. After the run, read only: `tmp/sd-probe3.log`. Checks `tmp/sd-checks.log`:
`tsc --noEmit -p tsconfig.check.json` exit 0, `test/catalog.ts` 1,550, `task/check-labels.ts` (the same 1 contradicted
label and 20 for review, none from this item, 0 registry rows outside the barrel), `task/check-coverage.ts` (0 unknown,
0 mismatches), `test/result.ts check` exit 0 (0 problems).

### Status and follow-ups

- No status moves. The guess dies at its first step: n_S − n_D is not conserved, and the piece that breaks it is the
  stream's Clifford hop. What the three blocks share is one fact, not a charge: the pair pieces count S at beat 1 and D
  at beat 2, the two sectors the hop joins.
- What each needs now. OPEN-FND-14: a string whose direct term falls off (neutrality cannot be imposed). OPEN-GRV-02 and
  13: a source counted as n_S + n_D, which as an instantaneous pair piece is blocked by the hop, so the candidate is a
  field with its own state that takes the source's S count at beat 1 and D count at beat 2. The join: unchanged, the
  Higgs row still needs a center-odd scalar.
- Notes changed outside this repo: `remaining-pieces.md` (a new section, "Is the sector imbalance a charge?", and
  "Order of work" step 7), `open.md` (Next up 8, FND-14, FND-15, GRV-02, GRV-13, text only), `solutions.md` (§8),
  `everything.md` (the Higgs mechanism and the equivalence principle rows, text only). `constraints.ts` unchanged.
- Site sentences that change: on /vibe/gravity, after "(E-GRV-0147)", add that counting the source as the difference of
  the two sectors does not join the two fields, since that count is the scalar density the stream breaks and it makes a
  hole of one band push every hole away (E-FND-0167); on /vibe/physics/weak-force, "no energy picks it" should add that
  the imbalance ordering the seas is not a charge any field could hold neutral (E-FND-0167); the SU(2) row's reason in
  `constraints.ts` may cite E-FND-0167 the same way, with no status change.

## OPEN-FND-14, OPEN-FND-15: is the vacuum chosen by history? (E-FND-0168)

A reversible rule has no ground state and E-FND-0159's ledger selects nothing, so the Higgs row was left needing "a
vacuum other than the full sea that something selects" (E-FRC-0273). The mesh grows, and a new dock enters in the state
growth writes. This item finds what the wake writes, derives the least growth rule for the register rule, and reads what
a grown region is. History does choose the vacuum, exactly, and every growth law built from the rule's pieces chooses a
symmetric one.

### What changed

- `code/measure/register-growth.ts`: the register rule's one-body cycle on a growing torus region (the plain wake from
  a seed, the lattice gas's reflecting frontier, a born dock written in a fixed state), run through a Slater state's
  minority orbitals (holes of the full sea or members on the empty mesh); readers for number, SU(2)₊ ⟨T_k⟩ and ⟨T²⟩,
  sector counts, band and flat content through E-FND-0161's frame, stationarity (the part of a cycle's image outside the
  span), B's dock and its projector, and the dock-local commutant of the pieces.
- `test/experiment/foundations/growth-vacuum.ts` (E-FND-0168), with its row in `test/registry.csv`,
  `test/experiment/all.ts`, the regenerated `test/catalog.csv` and the readme count (1,551; L1 315; foundations 168).

### The derivation (in the header, before the gate run)

- **What the wake writes today.** Birth beats and no state. The adopted knit has no edge rule (E-GRV-0066) and its
  vacuum's store is prepared, not grown. The one growing dynamics in code is the lattice gas's (E-FND-0086): unborn
  docks hold peace, the frontier reflects, a born dock starts from calm. The register rule has none.
- **The least rule.** That one, ported: reversible (isometric birth, bijective frontier), local, one branch for a Fock
  χ. It does not force χ. The knit's calm is χ empty; R*'s sea is χ full.
- **The commutant decides the rest.** A stationary uniform product sea is 1 ⊗ V₀ with V₀'s projector in the dock-local
  commutant of the pieces. If that is R(Cl⁺(4)) only, there are nine families (each half empty, one isospin line, or
  full), and a law built from the pieces writes one of the four symmetric ones.
- **The light cone.** The plain wake births one shell a beat and content moves one root step a beat, so after beat 0
  nothing reaches the frontier: the grown vacuum is χ, with no attractor. Number, J and SU(2)± are conserved through
  growth, so a breaking seed dilutes as 1/N.
- **Elitzur.** The four symmetric dock states lie wholly in the trivial Gauss sector (det Γ(h) = 1).

### Results (gates fixed in the header before the gate run, probes disclosed)

E-FND-0168, fail on B alone, as derived (735 s). V0, V1, W1, W2, LC, H, BD, S, G and all three controls hold.

- The engine equals E-FND-0161's frame to 1.1e-16. Both commutants (R0, and R1 with the chiral projectors) are exactly 8,
  accepted 0.242, rejected 1.7e-16. Every 4Γ(h) has determinant 4⁸.
- C (calm law, full seed, 192 members) and D (full law, B's dock as seed, 48 holes) on L = 4 (128 docks) and L = 6
  (648): no weight on an unborn dock ever; number within 3.5e-9; ⟨T⟩ 0 and (24, 0, 0), ⟨T²⟩ 0 and 600 at start and end.
  Moving and positive-band content C 16 and 8, D 4 and 2; S − D 0 within 6e-12. Neither seeded state is stationary
  (residuals 207/7 and 207/28).
- B fails: the order parameter per dock is 0.1875 and 0.0370, 24/N.
- Controls: D's seed in a hand-prepared full sea keeps every conserved total with a different path (seed weight 45.25
  against 0.0064); the breaking law writes B, stationary to 9.7e-29, ⟨T₁⟩ 1/2 a hole, Gauss weight E-FRC-0271's exact
  value; the knit's unchanged stream loses all 192 members at beat 0.
- Read: a wake at half light speed moves a seed's band content (moving 2.56, positive band 0.53 on L = 4; 2.55 and 0.49
  on L = 6) and nothing conserved.

### How it was tested

Probe `tmp/vg-probe1.log` (the engine against the frame, the commutants, C and D for 8 cycles on L = 4). Smoke
`tmp/vg-smoke.log` (every path, L = 4, 6 cycles). Gate run `tmp/vg-gate-E-FND-0168.log`. Checks `tmp/vg-checks.log`:
`tsc --noEmit -p tsconfig.check.json` exit 0, `test/catalog.ts` 1,551, `task/check-labels.ts` (the same 1 contradicted
label and 20 for review, none from this item, 0 registry rows outside the barrel), `task/check-coverage.ts` (0 unknown,
0 mismatches), `test/result.ts check` exit 0 (0 problems). The code was renumbered from E-FND-0167 to E-FND-0168 before
the gate run, when a parallel item registered 0167.

### Status and follow-ups

- No status moves. The Higgs row stays failed on R*, with its last escape closed: the vacuum is chosen by history, and a
  covariant history chooses a symmetric one. What is left is a center-odd scalar on the docks (E-FRC-0273).
- A tension named: the knit's own growth (calm) writes the empty mesh, where K is not blocked (E-SPN-0175), so R*'s full
  sea is a choice of growth law, not something the knit's growth gives. One rule (OPEN-FND-01) has to say which.
- Not done: the {3,4,3,4} mesh (the arguments use only graph distance and one dock), a gated wake near a crowd, and a
  χ entangled across docks (a band sea needs a nonlocal write).
- Notes changed outside this repo: `remaining-pieces.md` (a new section, "Is the vacuum chosen by history?", the "One
  rule for all 46" table's failed row, and "Order of work" step 7), `open.md` (Next up 8, FND-14, FND-15, text only),
  `solutions.md` (§8), `everything.md` (the Higgs mechanism row, text only). `constraints.ts` unchanged.
- Site sentences that change: on /vibe/model/wake, "on the next beat they are born, calm in every slot" can add that on
  the register rule calm is the empty mesh, and the Open item "A rule for the knit at the growing edge" can say one is
  written for the register rule (the reflecting frontier) and that the wake moves at the stream's own speed, so the grown
  vacuum is exactly what growth writes (E-FND-0168); on /vibe/physics/weak-force, "no energy picks it" should add that
  growth does not either, since every growth law built from the rule's pieces writes a symmetric vacuum (E-FND-0168);
  on /vibe/physics/vacuum, the vacuum is chosen by the growth law, not by an energy; the SU(2) row's reason in
  `constraints.ts` may cite E-FND-0168 the same way, with no status change.

## OPEN-MOT-01: the light register pair under a weak pull, read line by line (E-SPN-0183)

The light register pair of E-SPN-0173 (m 0.427), held by the husk light's Coulomb pull, run where the pull is weak
across a link (a_B 6, 8, 12) on balls of radius 40 to 60, to see whether its inertia approaches its energy.

### What changed

- `code/measure/register-reduced.ts`: E-SPN-0173's pair engine reduced exactly by the cubic group. The 48 signed
  permutations of the husk coordinates lie in W(F4) and act on the register by minors, so the cycle commutes with each
  of them. A state is stored once an orbit (O_h at K = 0, C4v on an axis, C2v on a face diagonal). It adds a worker pool
  for the convolution, the hydrogenic start, unfolding between sectors, and E-SPN-0169's S on the O_h-canonical
  momenta. It also adds `autocorrelation` and `harmonicLines`, filter diagonalization, which gives every line of a state
  and its weight from c_l = <v | G U^l v> with no stored vectors, since U is unitary in the Gram metric.
- `test/experiment/spin/register-coulomb-weak.ts` (E-SPN-0183), with its rows in `test/registry.csv`,
  `test/experiment/all.ts`, the regenerated `test/catalog.csv` and the readme count. `readPoint` takes an optional
  kernel, so a rerun can use the native kernel. The gate run used the JavaScript engines.

### The derivation (in the header, before the gate run)

- Neither sum rule offered for R is exact here. The f-sum and the center-of-mass response give only the first-order
  curvature, and the second-order term runs through every state the K coupling reaches. What is exact and cheap is to
  read the cycle's lines at K = 0, K and K / 2 in the little group of K.
- **The filtered level is a multiplet.** Probes 6 and 7 found it holds several register-channel lines of the trivial
  sector closer together than any affordable filter separates. So a filter's mean phase moves with K through the weights
  as well as through the lines. E-SPN-0173's own differential read gives R between -53.5 and 30.7 depending on the
  filter history, and 8.459326 only after its exact schedule.

### Results (gates fixed in the header before the gate run, probes disclosed)

Fail on H2, H3, H4, H5, H6 and P. H0, C1, I1 and I2 hold.

| gate | result |
| --- | --- |
| H0 the witness | pass: no covariance failure in 1,152 checks, gaps 9.9e-16 of 0.854 in O_h, C4v and C2v against E-SPN-0173's unreduced engine |
| C1 the control | pass: E_L 1.6133573497835847 against 1.6133573497836755, E-SPN-0173's read R 8.459326019 against 8.459326180 |
| H2 the hold | fail at a_B 6 only, on the quadratic test. Every point keeps its norm (3e-7 or better over 64 cycles), its edge (4e-5 or below) and a main line with \|u\| within 7e-9 of 1 |
| H3 isotropy (a_B 6) | fail: the main line is not quadratic on either direction, R -2.0 on the axis and 22.9 on the face. The control reads 8.4967 and 8.5737 (9.0e-3) |
| H4 the weakest excess within 0.1 | fail: 0.169 at a_B 12 |
| H5 R_full within 0.05 of tan m / m | fail: 1.2495 against 1.0656 |
| H6 the excess falls | fail: 5.93, -2.81, 8.37, 0.17 at a_B 3.5, 6, 8, 12 |
| P the predicted bands | fail: a_B 6 outside [0.4, 0.7], 8 outside [0.1, 0.2], 12 outside [0.015, 0.05] |

The main line (the heaviest at K = 0) at each point:

| a_B | ball | E (w) | E_b against hydrogen | R against the formula | excess |
| --- | --- | --- | --- | --- | --- |
| 3.5 | 16 | 1.613463 (0.82) | 0.0947 against 0.0897 | 8.4967 against 1.2259 | 5.93 |
| 6 | 40 | 1.678103 (0.62) | 0.0300 against 0.0305 | not quadratic (ratio -0.75 axis, 5.75 face) | |
| 8 | 48 | 1.681188 (0.54) | 0.0269 against 0.0172 | 10.3946 against 1.1093 | 8.37 |
| 12 | 60 | 1.695612 (0.92) | 0.0125 against 0.0076 | 1.2693 against 1.0857 | 0.169 |

- **a_B 12 is the clean point.** One line carries 0.92 of the level, quadratic (ratio 4.024), and R is within 17% of
  the formula. With the Darwin exchange it is 1.2495 against tan m / m 1.0656.
- **a_B 6 has no single curvature over K = 0.02 to 0.04.** At K ≠ 0 the little group lets the main line mix with near
  lines of other cubic representations. Its d(K) and d(K / 2) have opposite signs.
- **a_B 8's main line is a channel the filters chose.** The line at 1.674964 (E_b 0.0332) reads R 1.534 (excess 0.37).
  An audit after the run found that it carries 23 times the start overlap the main line does. The filters, centered on
  the running mean, favored the 1.681188 channel. So "the heaviest line of the filtered level" is not the tracked bound
  level, and H6 compares different channels. The gates are left as run.
- a_B 20 was not run. It needs a ball of about 120 (about 820,000 C4v representatives) and about 90 hours on the axis.

### How it was tested

- The probes were run in the open-pieces worktree before the gate run: probes 1 to 7 and 7a, logs `tmp/rcw-probe*.log`.
- The gate run was four parallel processes there, from 2026-09-29 to 2026-10-01. Logs are `tmp/rcw-gate-*.log` and
  parts `tmp/rcw-part-*.json`. `tmp/rcw-combine.ts` combined them with the file's own `combine`. The longest leg (a_B 6
  with the face) took 143,493 s.
- **The native kernel, as an equivalence record.** On exactly the a_B 6 face configuration, the kernel at 12 threads
  and the open-pieces JavaScript engine gave 74,014,850 doubles equal bit for bit (`tmp/rcw-eq.ts`,
  `tmp/rcw-eq-compare.ts` in open-pieces, 10.4 min against 38 min). That configuration was the level from the
  hydrogenic start through filters 256, 1024 and 2048, the C2v unfolding, 64 cycles at K and a 64-lag autocorrelation
  at K / 2. The full kernel point (next-pieces `tmp/rcw-part-kernel.ts`) reproduced the JavaScript level, K = 0 lines
  and axis lines to every printed digit in 2.8 h against 15.2 h. The JavaScript leg finished first and is the record,
  and the kernel run was stopped in its face leg.
- Checks here (`tmp/rcw-checks.log`): the row appended as E-SPN-0183 (next-code gave 0183 at that moment),
  `test/catalog.ts` 1,552, `task/check-labels.ts` (the same 1 contradicted label and 20 for review, none from this
  item, 0 registry rows outside the barrel), `task/check-coverage.ts` (0 unknown, 0 mismatches), `test/result.ts
  check` (0 problems), `tsc --noEmit -p tsconfig.check.json` exit 0.

### Status and follow-ups

- OPEN-MOT-01 stays open. At a_B 12 the main line reads R 1.2693 against 1.0857, the first light-pair line within 20%
  of the formula. But which line is the bound level is not settled at a_B 6 and 8. The dense tracked scan
  (spin/register-coulomb-track) follows one level by its overlap with a fixed reference, and is the follow-up that
  settles it.
- Notes changed outside this repo: `remaining-pieces.md` (a new section after E-SPN-0176's), `open.md` (MOT-01: two
  ladder rows and the result).
