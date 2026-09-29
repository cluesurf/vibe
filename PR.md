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
