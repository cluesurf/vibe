# P1 (the open part): Is the Hamiltonian Local?

P1 had two halves. The first, that the reversible rule is local and its energy is
bounded below, was validated. The second, whether H = i log U is itself local, was
left open. This settles it, with a clear and somewhat surprising answer: for the
linear XOR-parity rule, **the Hamiltonian is bounded below but not local**.

Reproduce: `npx tsx code/experiment/p1-locality.ts`.

## The method

We build H exactly from the permutation's cycle structure (U = e^{-iH}, principal
branch), expand it in the Pauli basis, and bucket the squared Pauli coefficients
by interaction range, the smallest arc on the ring covering the non-identity
sites. A Hamiltonian concentrated at short range and decaying is (quasi-)local. A
"locality length" (the weight-averaged range) summarises the profile.

## The control (the measure works)

A single-cell flip (s -> s XOR 1) has principal-branch Hamiltonian
H = (pi/2)(I - X_0), whose only non-identity term is X_0, exactly range 1. The
measure returns 100 percent of the weight at range 1 and a locality length of
1.00. The measure detects locality correctly.

(A useful aside found while building the control: flipping ALL cells gives instead
the nonlocal n-body term (pi/2)(I - X^{tensor n}), a reminder that the log of a
local unitary is not automatically local.)

## The result

```
control (single-cell flip): r1 = 100%, locality length 1.00

XOR-parity reversible CA:
  cells = 6:  r1 0%  r2 2%  r3 4%  r4 17%  r5 59%  r6 17%
              locality length 4.85 of 6
  cells = 8:  r1 0%  r2 0%  r3 1%  r4 2%  r5 6%  r6 25%  r7 57%  r8 10%
              locality length 6.63 of 8
```

The weight is concentrated at **near-maximal range**, and the locality length
**grows with system size** (4.85 of 6, then 6.63 of 8, both about 0.8 N). This is
the opposite of a local profile. The Hamiltonian of the XOR-parity reversible
cellular automaton is genuinely nonlocal: its interactions span essentially the
whole system, and the span grows with the system.

## What this says

P1 splits cleanly:

- **Bounded below: yes.** The cycle structure gives energies in a bounded interval,
  so a stable vacuum exists. (Validated earlier.)
- **Local: no, for this rule.** The Hamiltonian's operator weight sits at
  near-maximal range and the range grows with N. A local reversible rule does
  **not** automatically yield a local Hamiltonian.

This is exactly the subtlety 't Hooft flags in the Cellular Automaton
Interpretation: getting a bounded-below Hamiltonian is the easy half, getting one
that is also local is the hard half, and for a generic (here linear / Clifford)
reversible rule the log scrambles the Hamiltonian across the whole system. We have
now quantified that failure rather than just noting it.

## Honest caveats

- **One rule.** This is the XOR-parity (linear, Clifford) rule. The result is a
  clean negative for it. Whether SOME local reversible rule has a local
  bounded-below Hamiltonian is the remaining open direction, and is the heart of
  the 't Hooft program. Free-fermion-like (Margolus / quantum-walk) rules are the
  natural next candidates.
- **Small sizes.** 6 and 8 cells, by exact construction. The trend (length about
  0.8 N, growing) is clear at both sizes, but it is two points, not a scaling fit.
- **Principal branch.** H is the principal-branch log. A different branch is a
  different operator with the same dynamics. Locality is branch-dependent, and the
  principal branch is the natural minimal-energy choice.

## Status

P1's open sub-question is now answered for this rule: the Hamiltonian is bounded
below but nonlocal. P1 stays **validated (partial)**: local rule and bounded-below
energy confirmed, local Hamiltonian shown to fail for the XOR-parity rule. The
open direction is to search for a reversible rule whose Hamiltonian IS local.

## See also

`summary.md` (P1 overview) and `note/questions/roadmap.md` (A1).
