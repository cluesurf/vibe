# Links: Vibe to other theories

One file per theory, each a cheatsheet of how Vibe maps onto that theory, mapping by
mapping, with the experiment behind each and a grade. The direction is always **Vibe to the other author's theory**. We do not adopt their framework, we ask what part of it Vibe derives.

These are the curated, experiment-backed correspondences. The broader by-author research
notes live elsewhere in the monorepo. This folder holds only the theories Vibe has
actually run experiments against, starting with the most complete.

For the cross-theory picture, the structures that recur across several of these theories
at once, see [../triangulating-invariants.md](../triangulating-invariants.md).

## The theories

Sorted by how many recurring invariants they share with vibe. The shared invariants are
the point, the structures each theory derives that vibe also derives.

| theory | thinker | their primitive | exp | shared invariants |
|:--- |:--- |:--- | ---: |:--- |
| [Timeless Dynamics](timeless-dynamics.md) | James Lombardo | continuous distinguishability | 10 | time-as-distinction, records-as-arrow, Fisher-Rao forced, Born-from-norm, Lyapunov ceiling |
| [Chronoflux](chronoflux.md) | Roy Herbert | a conserved temporal current | 5 | one conserved quantity, time-as-divergence, recoverability, entropic gravity |
| [Orch-OR](orch-or.md) | Hameroff and Penrose | gravitational state collapse | 6 | records persist under noise (divergent on the mechanism) |
| [CRFT](crft.md) | Brent Borgers | high-D to low-D projection | 5 | the area law, selection-as-law, conservation-makes-selves |
| [Perspectival Plurality](perspectival-plurality.md) | Joseph McCard | immanently registering activity | 6 | experience-first, self-as-recursive-persistence, choice-determined-yet-irreducible, jointly-constituted-invariants |
| [Cosmopsychism](cosmopsychism.md) | Philip Goff | consciousness as intrinsic nature | 6 | experience-first, many-selves-by-decomposition, combination-as-a-measured-transition |
| [Multisense Realism](multisense-realism.md) | Craig Weinberg | sense as felt appearance | 3 | experience-first, self-as-partial-window (divergent on discrete vs computable) |

The last three are experience-first consciousness models rather than physics frameworks. They map onto vibe's selves experiments where a genuine invariant exists, and diverge on physics: they carry no substrate or law, and Multisense Realism diverges further on whether the base may be discrete and computable at all.

## The grades

Each mapping in a cheatsheet carries one:

- **firm.** A tight structural match, and Vibe has measured it.
- **structural.** The target is shared and Vibe has partial results, the full derivation
  is open.
- **conjectural.** A well-posed match with a clear test Vibe has not yet run.
- **divergent.** The two genuinely disagree, named so the agreements stay meaningful.

## How to add a theory

1. Confirm Vibe has experiments that touch it (grep the registry for the mechanism).
2. Write `<theory-name>.md`, preferring the theory name over the author name.
3. Open with the theory in one paragraph, then the correspondence table (vibe structure,
   their structure, the experiment code, the grade), then the divergences, then the tie
   to the recurring invariants in [../triangulating-invariants.md](../triangulating-invariants.md).
4. Add a row to the table above.
