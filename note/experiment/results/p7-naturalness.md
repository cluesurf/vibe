# The Quantum Link: Is the Setting-State Correlation Natural?

P7's cost curve showed that quantum-strength CHSH violation needs the measurement
settings to be correlated with the hidden state. The open question was whether a
monist mesh produces that correlation on its own, or whether it must be fine-tuned.
This study gives a two-part answer: determinism makes violation possible, but a
generic shared past is not enough. The correlation must take a specific form.

Reproduce: `npx tsx code/experiment/p7-naturalness.ts`.

## The setup

We model a shared past. With probability eta (the shared-past fraction) a
measurement setting is determined by the common cause, the hidden state lambda.
With probability 1 - eta it is set by independent local randomness. We sweep eta
and run two modes:

- **aligned**: the setting tracks the same feature of lambda that the outcomes use.
- **random**: the setting tracks a generic, high-frequency feature of lambda,
  unrelated to the outcomes.

## The result

```
eta    aligned S    random S
0.00     0.99         0.98
0.25     1.54         1.00
0.50     2.24         1.01
0.75     3.08         0.99
1.00     4.00         1.03

bounds: classical 2, quantum (Tsirelson) 2.83, algebraic max 4
```

Two clear behaviours:

- **Aligned: S climbs from 1 to 4 as the shared past grows.** When the settings are
  determined by the same substrate as the hidden state, and that dependence is
  aligned with the outcomes, the correlation crosses the classical bound near
  eta = 0.5, passes the quantum bound, and reaches the algebraic maximum at full
  sharing. Determinism enables violation.
- **Random: S stays near 1 at every eta, including full sharing.** A generic shared
  past, where the settings depend on lambda but not in the way the outcomes do,
  produces no violation at all, even when the settings are entirely determined by
  the common cause.

## What this says for Vibe Theory

This converts the vague "superdeterminism is conspiratorial" objection into a
precise, two-part statement:

1. **Monism removes the obstacle in principle.** The theorem that blocks local
   hidden variables assumes the measurement settings are statistically independent
   of the hidden state (the free-choice assumption). A monist mesh with no hidden
   independent randomness denies exactly that: the settings and the hidden state
   are both the one substrate, so they share a common cause by construction
   (eta = 1). At eta = 1 the aligned model reaches the quantum value and beyond. So
   Vibe Theory's no-hidden-state monism is not refuted by Bell. It is the kind of
   theory Bell's independence assumption was designed to exclude, and it pays the
   price the cost curve quantifies.
2. **But monism does not give it for free.** A generic shared-past correlation
   produces no violation (the random mode stays classical). The mesh must produce
   the SPECIFIC correlation that matches the measured outcomes. So the residual
   problem is sharp and real: Vibe Theory must explain why the mesh's setting-state
   correlation takes the quantum form, not merely that some correlation exists.

So the quantum link is half-built. Determinism opens the door (point 1), and the
remaining work is to show the mesh's own dynamics produce the aligned correlation,
not a generic one (point 2). That is a concrete target, not a vague hope.

## Aligned bits, not bits (the sharpening)

Hall (2010) showed reproducing quantum correlations requires a minimum
measurement dependence, the mutual information between the settings and the hidden
state. We measured that mutual information alongside CHSH for three correlations
(`npx tsx code/experiment/p7-alignment.ts`):

```
mode         eta    CHSH S    I(setting; lambda) bits
aligned      1.0    4.00      1.00
misaligned   1.0    1.00      1.00
random       1.0    1.00      ~0
```

At full sharing the aligned and misaligned correlations carry the SAME one bit of
measurement dependence, yet aligned reaches S = 4 and misaligned stays at S = 1.
The random correlation carries no measurable dependence and gives nothing. So:

- **Measurement dependence is necessary** (the random case, ~0 bits, never
  violates), confirming the Hall direction.
- **But it is radically insufficient.** One bit of dependence can buy anything from
  no violation to maximal violation, depending entirely on whether it is ALIGNED
  with the measured observables. The currency of Bell violation is aligned bits,
  not bits.

This refines the superdeterminism cost from "how much free choice must you give up"
to "you must give up free choice IN THE SPECIFIC DIRECTION the observables select."
That is a far stronger and more specific requirement, and it is exactly what a
monist mesh would have to produce dynamically.

## Honest caveats

- **A constructed outcome model.** The outcomes are the engineered
  superdeterministic model (A always +1, B set by the lambda region) that can reach
  S = 4. It demonstrates the mechanism and the alignment requirement cleanly, but
  it is not derived from mesh dynamics. Deriving the aligned correlation from an
  actual mesh evolution is the open step.
- **Alignment is hand-set here.** The aligned mode puts in the right correlation by
  hand. The point of the random control is precisely to show that this alignment is
  a nontrivial requirement, not that the mesh supplies it.

## Status

P7 moves from "mechanism quantified" to "the naturalness question made precise."
Determinism (monism, no hidden state) makes quantum violation possible, and the
cost is the shared-past fraction. But the correlation must be aligned, not generic.
The open work is to derive an aligned setting-state correlation from mesh dynamics,
which would complete the quantum link.

## See also

`deck/vibe/note/experiment/results/summary.md` (the original P7 cost curve),
`note/research/vibe/implications-for-vibe-theory.md` (the synthesis).
