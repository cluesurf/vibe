# Next pieces

One branch for this round's experiments. Each item has its own section.

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
