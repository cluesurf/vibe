# A' gates, frozen 2026-10-09T21:39:01Z before any read (item vibe-roadmap-moving-matter-0084)

The gates are the item's (fixed 2026-10-09 by lead 0062). This file fixes only how each quantity is read. Never edited
after this timestamp; any later change goes in a new file.

## The starts (L 4 D4 torus, one half, K 0, E-SPN-0193's register rule, 0004's engine and frame)

- SYM (gated): three holes on one site in the beat-1 sector, the fiber state (|012> summed over all 6 orders, each +1),
  normalized: the totally symmetric partner of 0004's start, same register content. Symmetric in the register, so with
  role epsilon it is the color singlet and Pauli-allowed.
- SYM000 (read, not gated): |000> on one site, a second Sym^3 state.
- ANTI (control): 0004's contactStart (the color 10 with role epsilon).

## STEP 1 BINDS

Bound fraction = 0004's BND read: the mean contact share (all-three-on-one-site sector weight over all-sector weight),
read every 8 cycles over cycles 128 to 255 of a 256-cycle run under the rule. The ten crossing times rest on 0004's
item 3 (a bound level is an eigenvector of the translation-invariant rule and keeps its weight for all time), as in
0004. BINDS when SYM's bound fraction >= 0.5, else NO SINGLET (stop, A' dead). The free rule's share is read beside it.

## STEP 2 (on the bound level)

The bound level phi: the Hann filter (T 256) at the strongest line of the start's own spectrum under the rule (trap:
never the Rayleigh mean), normalized.

- s: the cycle ends on beat 2's stream (cycleMatrix: S P per beat, stream last), so the W-frame 192-mode amplitude at a
  cycle boundary names the slot each member just crossed and the dock it landed on. s = sum over docks x and slots d of
  the weight with all three members in slot d at dock x, over phi's norm. Read gauge-invariantly from the 192-mode
  vectors W(q) c (never from complement fibers alone): Phi_d(a0, a1, a2) = (1/N) sum over tuples and fibers of
  W(q0)[d a0, b0] W(q1)[d a1, b1] W(q2)[d a2, b2] c(b), s = sum_d sum_a |Phi_d|^2. Translation invariance makes every
  dock equal, so the relative read at y = 0 is the sum over x.
- I-SEC (instrument): the same sum over sector fibers only must equal sectorContact's contact / 576 to 1e-12 (the
  sector states are slot-uniform and momentum independent).
- E: 0080's color error E with eta = det(S / N) on R*'s hash (bulk side 8, roleLinks on makeColorWeave(8)), 2 and 3
  beats, sections first and weyl, 0080's weights w(z) = N(z)^3 (members hopping independently, slot-uniform). Stated in
  advance: this E does not depend on the start, so it reads the field, and s is the start's own number.

## Verdict (the item's)

CROSSES TOGETHER when s >= 0.75 or E <= 0.25. FAILS when s <= 0.25 and E >= 0.75. PARTIAL otherwise.

## Controls

- C-ANTI: ANTI's s within 1e-3 of 1/576 (absolute), and E reproduces 0080's 0.945 (first, 2 beats) to 1e-3.
- C-ID: identity links give E 0 (<= 1e-24).
- Instruments: norm drift <= 1e-10 per run, 0004's frame checks (1e-12, 4 complements), I-SEC.
