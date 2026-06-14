# Findings 30, The Knit in Full, the Exact Law

The complete law of the model, shown not named. The knit is collide then stream, and the collision is one small
integer table on a dock's opposite-direction pairs. This doc gives the exact nine-state table, proves it conserves
charge and is reversible by inspection, and catalogs the handful of variant tables that were the rule's one remaining
freedom. Everything here is the committed code, not an idealization. Companion to `findings.md`, anchors `findings-7.md`
(the base spec) and `findings-29.md` (the lexicon). Cite `\cite{pollard2026vibetest}`.

## What the knit is, and why it is called that

Each beat the knit does two things, COLLIDE (a local in-place map on one dock's 24 directional slots) then STREAM
(each tone moves one dock along its site direction). The word rule comes from cellular-automata research, the
transition that updates the automaton's cells each step. The model says knit instead to carry the feel of the act, the
merging, turning, and blending the collision does to the tones meeting at a dock, the bonding and churning from beat to
beat. Why it matters, the dynamics is entirely local and entirely discrete, a dock knits its own tones together and
then passes them on, and there is nothing else to the law. (`code/rule/collision.ts`, `findings-29.md`.)

## The collision acts on opposite-direction pairs

A dock has 24 sites, and the collision pairs each site with its opposite, so the 24 sites form 12 head-on lines. On
each line the two tones moving toward each other interact through a single nine-state table (the two tones can each be
`-1`, `0`, or `+1`, giving `3 x 3 = 9` inputs). The collision conserves the sum of each pair, hence the sum of the
dock, hence the global charge Q, and it is a bijection on the nine states, hence reversible. Why it matters, the whole
interaction is one tiny lookup applied independently on twelve lines, the simplest possible local law that still
conserves and reverses. (`code/rule/collision.ts`.)

## The exact nine-state table

This is the committed forward table (`PAIR_FORWARD`), the input pair of tones on a line maps to the output pair.

| input (left, right) | output (left, right) | what it does |
| --- | --- | --- |
| `(-1, -1)` | `(-1, -1)` | like signs, inert |
| `(+1, +1)` | `(+1, +1)` | like signs, inert |
| `(-1, 0)` | `(0, -1)` | a charge hops past a peace |
| `(0, -1)` | `(-1, 0)` | a charge hops past a peace |
| `(+1, 0)` | `(0, +1)` | a charge hops past a peace |
| `(0, +1)` | `(+1, 0)` | a charge hops past a peace |
| `(0, 0)` | `(+1, -1)` | the arrow, peace creates a balanced pair (the active vacuum) |
| `(+1, -1)` | `(-1, +1)` | the pair flips |
| `(-1, +1)` | `(0, 0)` | annihilation closes the cycle |

Read it as three behaviors. Like-signed pairs do nothing. A lone charge HOPS across a peace, which is how a charge
moves through the collision step. And peace, a flip, and annihilation form a three-step cycle, `(0,0)` to `(+1,-1)` to
`(-1,+1)` to `(0,0)`, the create-flip-annihilate engine that fills empty space with balanced pairs (the active vacuum)
and is where the lean, the create direction, picks an orientation. Why it matters, the entire interaction of matter and
vacuum is these nine lines, charge motion is the hop, the active vacuum is the create cycle, and the arrow's bias is
the one choice the create move makes. (`code/rule/collision.ts`.)

## Conservation and reversibility, by inspection

Both invariants are visible in the table.

- CONSERVATION. Every output pair has the same sum as its input. The like-signed pairs are fixed. The hops swap a
  charge with a peace, sum unchanged. The three-cycle runs among `(0,0)`, `(+1,-1)`, `(-1,+1)`, all of sum 0. So each
  line preserves its pair sum, the dock preserves its sum, and the global charge Q is exactly conserved.
- REVERSIBILITY. The nine outputs are the nine inputs in a different order (a permutation), the hops are two-cycles,
  the create engine is a three-cycle, the like-signed states are fixed points. A permutation has an exact inverse, so
  the engine can run time backward by applying the inverse table (`PAIR_INVERSE`), which is the table read in reverse.

Why it matters, conservation and reversibility are not approximate or statistical here, they are exact properties of a
nine-element permutation that anyone can check by reading the table, which is what lets the model carry a conserved
quantum field and an honestly earned arrow. (`code/rule/collision.ts`, `findings-26.md`, `findings-28.md`.)

## The rule's one freedom, the variant tables

Which collision to commit was the law's last open choice, and the variants are the honest exploration of it. Each is a
reversible, charge-conserving table on the same opposite-direction lines, differing only in how it treats the lone-
charge and neutral-pair states.

| variant | lone charge `(s, 0)` | neutral pair `(+1, -1)` | peace `(0, 0)` | character |
| --- | --- | --- | --- | --- |
| committed pair table | hops past peace | enters the create-flip-annihilate cycle | creates a pair | charge motion plus an active vacuum, hops pin a body |
| bind-and-move | left to stream (hop off) | enters the create cycle | creates a pair | one rule that both moves lone charges and binds a pair into a breather |
| leaky-confine | reflects (bounces inward) | streams apart | left alone, no create | a one-field photon-as-phonon, matter confined, neutral ripples radiate, vacuum stays empty |
| head-on-rotate | left to stream | rotates a head-on pair to an empty line | left alone | conserves charge AND momentum, lone charges stream ballistically |
| sticky-reflect | streams if alone, reflects if the dock is crowded | (reflects when crowded) | left alone | a capture channel, free particles move and colliding ones are trapped |

Two notes. The canonical 2D reference is `momentumRotate2D`, a head-on pair `(s, s, 0, 0)` on one axis rotates to the
other `(0, 0, s, s)`, conserving charge and momentum and self-inverse. And the bind-versus-radiate tension lives
exactly here, the committed pair table confines a body but seals it (the hop pins), while a rule that radiates freely
disperses the body, which the leaky-confine and shadow-pressure resolutions answer (`findings-3.md`). Why it matters,
the law is not arbitrary, the variants map the small space of reversible conserving tables and show what each buys,
mobility, binding, radiation, or capture, and the committed choice plus its resolution is what gives both a moving
charge and a bound self. (`code/rule/collision.ts`, `findings-3.md`, `findings-23.md`.)

## The one-line reading

The knit is collide then stream, the collision is one nine-state integer table applied to each of a dock's twelve
opposite-direction lines (like signs inert, a charge hops past peace, and a create-flip-annihilate three-cycle that is
the active vacuum), it conserves charge and is reversible by inspection, and the one remaining freedom, which variant
table to commit, is the small catalog above that trades between mobility, binding, radiation, and capture.

## Where to look (code and notes)

- The exact tables and collisions: `code/rule/collision.ts` (`PAIR_FORWARD`, `PAIR_INVERSE`, `bindAndMove`,
  `leakyConfine`, `headOnRotate`, `stickyReflect`, `momentumRotate2D`).
- The base spec and the worked trace of a dock through a beat: `findings-7.md`.
- The bind-versus-radiate resolution: `findings-3.md`, `theory-v0.7.0/paper/the-self-binding-resolution.md`.
- Reversibility, conservation, and the arrow: `findings-26.md`, `findings-28.md`.