# The counting-signature search in quantum hardware data

The externally checkable half of the Born question, written so that
someone with published benchmark data can run it this month without
touching this repo.

## The claim under test

This model reproduces quantum measurement statistics exactly for
every state it can prepare (E-FND-0123 through E-FND-0126), but at
the substrate its detector weighs by excitation NUMBER, not squared
amplitude, and single-particle randomness is ensemble-over-phase
(E-FND-0127). If the squared-amplitude rule fails to emerge exactly
at the coarse level, the deviation inherits the substrate's
structure: organized by NUMBER, blind to amplitude.

## The discriminator

For a circuit family with fault-tolerant error correction, collect
the residual logical error rate per circuit as a function of two
separately varied quantities:

1. the total EXCITATION NUMBER of the encoded states (for photonic
   or bosonic platforms: photon number; for qubit platforms: the
   Hamming weight of the dominant computational components),
2. the AMPLITUDE STRUCTURE at fixed number (states of equal weight
   but different phase or superposition composition).

Standard quantum mechanics predicts the corrected residual floor is
organized by neither (error correction sees syndromes, not states).
The counting substrate predicts a residual floor that:

- rises with excitation number at fixed amplitude structure,
- stays FLAT across amplitude structure at fixed number,
- and resists error correction, because it is not noise but a
  systematic weighing difference.

## What to do

1. From published surface-code and bosonic-code benchmark datasets,
   bin logical error rates by the two axes above wherever the
   published state families allow it.
2. A floor flat in amplitude and rising in number, common across
   platforms, is the signature. Its absence at current scales sets a
   bound on where the counting scale could live, which is also
   publishable and constrains this model.
3. Either outcome is a result: the signature found would be
   revolutionary, and every clean scaling run pushes the model's
   deviation scale up, which the model must then locate or die by.

## Status

Prescription only. Nobody has run it. The in-model half (what the
floor's magnitude would be at a given coarse-graining scale) awaits
the dispersion half of the coarse bridge.
