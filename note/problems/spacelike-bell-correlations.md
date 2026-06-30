# The open problem: spacelike Bell correlations

This is the single hardest obstacle the vibe model faces, and it is not a bug in
vibe. It is the same wall every deterministic theory of quantum mechanics runs
into. This note explains exactly what the wall is, why it stands, which way out
vibe takes, and what the model still owes. It is written to be read without prior
physics.

## The one-sentence version

Quantum experiments show correlations between far-apart measurements that are too
strong to come from any theory that is at once deterministic-or-realist, local,
and free to choose its measurements independently of the system. Vibe keeps
determinism and realism and gives up the third assumption, the free independent
choice of measurement. The bill for that choice is that the correlation has to
ride in on a past the two measurements share, and on a curved expanding mesh that
shared past shrinks with distance. Making it survive at large distance is the open
problem.

## What is being measured: the Bell setup

Picture a source in the middle that sends one particle left to Alice and one right
to Bob. Alice and Bob are far apart, far enough that no signal at lightspeed can
pass between them during the measurement. Each of them picks one of two settings
(think of two angles of a dial) and reads one of two outcomes, call them plus one
and minus one.

They run this many times, varying their dial settings, and afterwards compare
notes. The thing they compute is a **correlation**, how often their outcomes agree
or disagree for each pair of dial settings. With two settings each there are four
setting pairs, and a particular weighted sum of the four correlations is called
**S**, the CHSH quantity (after Clauser, Horne, Shimony, Holt).

> S sweeps together the four correlations into one number. The whole question is
> how large S can get.

## What exactly is Bell's theorem

Bell's theorem (John Bell, 1964) is a proof about the largest S that a certain
class of theories can ever produce. The class is theories that obey three
assumptions at once.

1. **Realism (or determinism).** Each particle carries some state, call it lambda,
   fixed when the pair is created. Given lambda and the chosen setting, the outcome
   is determined (or at least has a definite probability). The outcome is a real
   property, not conjured at the moment of looking. Lambda is the "hidden variable",
   whatever the source actually sends out.
2. **Locality.** Alice's outcome depends only on her own setting and on lambda, not
   on Bob's setting, and the reverse for Bob. Choosing a dial on one side cannot
   reach across and change the result on the other side. Nothing travels faster
   than light.
3. **Measurement independence (also called statistical independence or free
   choice).** The dial settings are chosen independently of lambda. The
   distribution of hidden states the source emits does not depend on which
   measurements Alice and Bob are about to pick. Equivalently, their choices are
   "free" of the particles' hidden state.

Bell's proof shows that any theory keeping all three of these obeys

> |S| is at most 2.

This is the Bell inequality (in its CHSH form). The argument is short. Because each
outcome is plus or minus one, for any fixed lambda the bracket that builds S works
out to plus or minus two exactly, never more. Averaging over lambda can only stay
within that, so |S| cannot exceed 2. A locally caused, independently chosen,
real-valued world is capped at 2. That cap is the theorem.

## What it is "not matching", and why that is the whole point

Quantum mechanics predicts, for the right entangled state and dial angles, that

> S reaches 2 times the square root of 2, about 2.83.

That is larger than 2. It is called the Tsirelson bound, the most S that quantum
mechanics itself allows. So quantum theory predicts correlations stronger than the
Bell cap of 2. The two predictions disagree by a clean, measurable margin.

Then the experiments were done. Aspect in the 1980s, and the loophole-free
experiments of 2015 (Hensen, Giustina, Shalm and others), measured S above 2, with
the measurements genuinely far enough apart in space and time that no slower-than-
light signal could have coordinated them. Nature sits with quantum mechanics, above
the cap.

So what is "not matched" is this: **no theory holding all three of Bell's
assumptions can reproduce the correlation strength that real experiments show.** The
correlations are too strong for a local, real, independently-chosen world. One of
the three assumptions has to go.

This is exactly the point Bell was making, and it is worth knowing his target.

## Bell's reasons: he was answering Einstein

In 1935 Einstein, Podolsky and Rosen (EPR) argued that quantum mechanics is
**incomplete**. Their reasoning: entangled particles are correlated, and if nothing
travels faster than light, the only sane explanation is that each particle already
carried the answer with it from the start, a pre-existing element of reality the
quantum wavefunction fails to mention. EPR wanted a deeper, local, deterministic
theory underneath quantum mechanics to restore those definite pre-existing values.
Einstein's instinct was that the world is local and real, and that quantum
randomness is just our ignorance of hidden details.

Bell took EPR's wish seriously and tested it. He asked: suppose Einstein is right
and there is a local hidden-variable theory underneath. What would it predict? He
derived the inequality, |S| at most 2, as the signature of any such theory. Then he
noted quantum mechanics breaks it. So Einstein's hoped-for theory, local and real
and deterministic, is not merely undiscovered. It is **impossible**, because it
would make a prediction the world refutes.

> Bell turned a philosophical argument about whether quantum mechanics is
> "complete" into a number you can measure in a lab. That is why it matters.

His reason, then, was to settle EPR. The result settled it against EPR's specific
hope: you cannot have local realism. Einstein's combination of assumptions is the
one nature throws out.

## Why a deterministic theory can still do it, contrary to first impression

Here is the nuance that the phrase "deterministic theories can't match quantum
mechanics" gets wrong, and it is the crux for vibe.

**Determinism is not the assumption that fails.** Bell's theorem is not a proof
against determinism. Look at the three assumptions again: realism (which
determinism satisfies automatically), locality, and measurement independence.
Determinism lives comfortably inside the first one. The theorem rules out the
**conjunction** of all three, not determinism by itself.

So a deterministic theory has a way through. It only has to give up one of the
**other** two assumptions, locality or measurement independence. Two known routes
prove this is real, not a loophole on paper.

- **Drop locality.** Bohmian mechanics is fully deterministic and fully real, and
  it reproduces quantum mechanics exactly. It does so by being nonlocal, a hidden
  guiding wave that connects the two particles instantly across any distance. A
  deterministic theory that matches the data, by paying with locality.
- **Drop measurement independence.** Superdeterminism keeps determinism, realism,
  and locality, and gives up the idea that the dial settings are chosen freely of
  the hidden state. If what Alice and Bob "choose" to measure is itself part of the
  one deterministic history that also produced the particles, then the settings and
  the hidden state are correlated from the start, and Bell's derivation no longer
  applies. 't Hooft built a whole cellular-automaton interpretation of quantum
  mechanics on this, and Tim Palmer and Sabine Hossenfelder have developed and
  defended it.

> The headline "no deterministic theory can match quantum mechanics" is false. The
> true statement is narrower: no theory can be deterministic-or-real AND local AND
> measurement-independent all at once. Determinism alone is fine. It is the trio
> that is forbidden.

That narrower statement is the door vibe walks through.

## Which door vibe takes, and the bill it pays

Vibe is a single deterministic reversible rule on a discrete mesh. It is committed
to determinism and to realism, those are the whole point of the program. So by the
theorem it must drop locality or measurement independence. It drops **measurement
independence**: this is the superdeterminism route, the same as 't Hooft and
Palmer.

The justification is not a conspiracy. In a single deterministic substrate,
everything traces back to one connected past. The measurement settings and the
measured system are not independent free variables. They are both later states of
the same earlier configuration. Their correlation is **structural**, a consequence
of sharing one history, not a cosmic coincidence staged to fool the experimenter.

But every choice has a bill, and here is vibe's. If the only thing that can
correlate the settings with the system is a **shared past**, then the strength of
the correlation is limited by **how much past the two measurements actually share**.
And that is a geometric quantity you can measure on the mesh.

> The price of superdeterminism is that the correlation must be carried by the
> common past of the two measurements. So the model lives or dies on how much past
> two far-apart measurements share.

## Why this is hard, now measured rather than assumed

The base rule moves information one cell per beat (a finite top speed, like a speed
of light). So the past a measurement can draw on is its **backward light cone**, the
ball of cells that could have reached it. Two measurements share whatever lies in
**both** their backward cones.

Here is the trouble. Real quantum correlations are the **same strength at any
distance**, including for measurements far enough apart that no signal connects
them. But the shared backward cone of two measurements **shrinks as you move them
apart**, and on a negatively curved (expanding) mesh, which vibe commits to, it
shrinks fast, exponentially. The volume of a hyperbolic ball piles up near its outer
edge, so two such balls, once separated, overlap in an ever-tinier fraction.

The experiments in this repo measure exactly this:

- `quantum/dynamics` (E-QTM-0010) first flagged the tension, but it ASSUMED the
  shared fraction decays as exp(-distance / scale) and sampled it randomly.
- `quantum/shared-past-curvature` (E-QTM-0029) MEASURES the shared fraction directly
  from the rule's causal cones, deterministically, with exact integer counts. It
  finds the local shared past collapsing toward zero with separation on the curved
  mesh, while a flat control holds it far longer. Mapped through the
  measurement-dependence bound, the reachable S falls back to the classical value 2
  as the measurements separate. The prior tension, now a measured fact.
- `quantum/large-hyperbolic-decay` (E-QTM-0032) confirms it on a genuine 20,000-cell
  {3,4,3,4} hyperbolic tessellation (real cycles, not a tree stand-in): shell growth
  is exponential there and polynomial on the flat lattice, which is the geometric
  cause of the collapse.

So a **locally refreshed** common cause cannot keep the correlation strong at large
distance. That is the open negative, stated honestly.

## What the follow-up experiments found

Four experiments chase the open question, and they sharpen it into measured facts.

- `quantum/seed-correlation-dynamics` (E-QTM-0030) runs the ACTUAL rule from a seed.
  A localized seed manufactures **zero** correlation beyond the causal horizon (the
  local rule cannot create spacelike correlation), while a correlation imprinted on
  the initial surface is **preserved exactly** by the reversible rule at every
  distance. So the dynamics confirms it: a distance-independent spacelike correlation
  has to be seed-anchored, not locally made.
- `quantum/boundary-shared-past` (E-QTM-0031) tests the holographic escape. On a
  genuine hyperbolic tessellation the shared past tracks the **bulk** distance, and
  with bulk distance held fixed it does **not** track the **spatial** boundary angle.
  So the simple "the correlation rides on the boundary at infinity" shortcut does not
  operate. An honest negative. The surviving distance-independent channel is the
  **past** boundary, the shared seed, not the spatial boundary.
- `quantum/measurement-independence-signature` (E-QTM-0033) turns the measured shared
  fraction into the falsifiable prediction: a finite **critical separation** beyond
  which even aligned superdeterministic settings cannot reach the quantum value,
  smaller on the curved substrate than the flat one, and a violation that **vanishes**
  if the settings are decorrelated from the shared past. Standard quantum mechanics
  predicts neither.

Together they leave the picture sharp: the local route is closed (measured), the
seed-anchored route is open and is the only survivor, the spatial-boundary shortcut
is closed, and the remaining question is whether the seed channel can carry the full
quantum value without fine-tuning.

## The escape the model has, and what it still owes

The same measurement found a survivor. Where the local shared past has fallen to
zero, the **full** backward cones of two measurements still reach all the way back
to the growth **seed**, the initial surface of the mesh. A correlation imprinted at
that seed is available to both measurements at **every** separation, because both
histories pass through the same beginning. This is the cosmological version of
superdeterminism: the correlation is set once, at the start, not refreshed locally.

The catch the measurement also shows: the weight of that seed channel **thins** with
separation. So the escape is real but it is not free, and it raises the exact worry
Hossenfelder names, that the needed correlation might look fine-tuned into the
initial conditions.

What the model still owes is therefore sharp and testable, not vague:

1. Show, by running the actual rule from a seed, that a seed-anchored correlation
   survives at spacelike separation. **Done in part** by E-QTM-0030: the rule
   preserves a seed-imprinted correlation exactly and manufactures none locally. What
   remains is to make the surviving correlation reach the full quantum strength, not
   just the classical value the bare rule gives.
2. Show it can do so **without fine-tuning** the seed. This is the deep one, still
   open, and it may be a genuine limit rather than an unfinished sum.
3. Test whether the surviving correlation rides on the **boundary**. **Done in part**
   by E-QTM-0031: the SPATIAL boundary at infinity is ruled out (the shared past is
   bulk-mediated), so the only boundary that carries it is the PAST boundary, the
   seed. The holographic route, if there is one, is past-directed.
4. Separately, derive the **single definite outcome** of a measurement from the rule,
   which is a different open problem in the same corner.

And it owes a falsifier, which it has: if a sharpened Bell or contextuality argument
ever shows that **no** deterministic substrate can reproduce a quantum result vibe
claims, the determinism commitment, and this whole superdeterministic stance, fails.
The claim is built so it can be killed.

## The short version, again

Bell did not prove that determinism is impossible. He proved that locality, realism,
and free independent measurement choice cannot all three hold, because real
experiments show correlations too strong for that combination. Vibe stays
deterministic and real, and drops the free independent choice, which is allowed. The
cost is that its correlations must be carried by a shared past, and on its curved
mesh that shared past shrinks with distance. The local part of it is measured to
collapse. A seed-anchored part survives but thins. Closing that gap, ideally on the
boundary and without fine-tuning, is the open problem, and the experiments that
chase it are listed above.

## See also

- `test/experiment/quantum/shared-past-curvature.ts` (E-QTM-0029), the measured
  shared-past collapse and the seed channel.
- `test/experiment/quantum/seed-correlation-dynamics.ts` (E-QTM-0030), the rule run
  from a seed: it preserves a seed-anchored correlation and manufactures none locally.
- `test/experiment/quantum/boundary-shared-past.ts` (E-QTM-0031), the honest negative
  for the spatial-boundary holographic route.
- `test/experiment/quantum/large-hyperbolic-decay.ts` (E-QTM-0032), the collapse
  confirmed on a genuine 20k-cell {3,4,3,4} hyperbolic tessellation.
- `test/experiment/quantum/measurement-independence-signature.ts` (E-QTM-0033), the
  critical separation and the falsifiable alignment-contingency signature.
- `test/experiment/quantum/dynamics.ts` (E-QTM-0010), the original assumed-decay
  tension this supersedes.
- `note/experimental-methodology.md`, the standard these experiments are held to,
  including why an honest negative is a result, not a failure.
