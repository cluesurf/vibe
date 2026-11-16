# A reversible lean, the cost of keeping, and the open mesh: what holds and at what scope

Depth **L1** (known math, see [experimental-methodology.md](experimental-methodology.md), section 2). Written
2026-11-12 for the advisory board, round 01 (objections S-2, S-3, G-8, C-1, P-3), and restated the same day after
round 02 found scope errors (G2-1, G2-2, Q2-6, Q2-7, S2-1, S2-2, S2-4, S2-6, S2-7, K2-2, K2-7, K2-8). Records:
`note/project/vibe/roadmap/board/round-0N/response.md` in the ClueSurf repo. It extends the theorem note
`no-attractor-and-the-cost-of-keeping.md` (research/intention-grounding worktree), which covers a finite closed box.
Nothing here is a run. Every section states its scope first.

## 1. Symmetric rule, symmetric start: every odd reading is zero forever

**Scope.** A finite box, an ensemble of starts.

**Statement.** Let f be a bijection of a finite set X, and C an involution of X with f∘C = C∘f. Let V be a reading
with V∘C = −V. If the start distribution ρ has ρ∘C = ρ, then the mean of V is 0 at every beat.

**Proof.** ρ_t = ρ∘f^{−t} is C-invariant at every t, because f commutes with C. Then
Σ ρ_t(x)V(x) = Σ ρ_t(Cx)V(Cx) = −Σ ρ_t(x)V(x), so the sum is 0.

**Consequence and its limit.** With the working rule's exact C (`07-open.tex`:17-19, E-SLF-0149), no reader can tell
pleasure from pain on average from a C-symmetric start. One asymmetric start is not C-symmetric, and a C-odd reading
can then keep a sign forever, but that is the start telling pleasure from pain, not the rule, which is not what key 5
asks (objection S2-6). The working vacuum itself "keeps C" (`02-the-rule.tex`:34), so it gives no sign of its own
(round 03, S3 on m-26, which corrects this note's round 02 wording).

**The unitary form.** The working rule with the coin on is a unitary, not a bijection of configurations, and has no
cycles (`02-the-rule.tex`:25). The same statement holds for a C-symmetric state under a unitary that commutes with C,
with the trace in place of the sum.

## 2. The lean of a C-odd reading under any reversible rule

**Scope.** A finite box and an ensemble of starts near uniform. It says nothing about one history, one configuration,
one pure present, or the infinite mesh (objections S2-1, G2-1, Q2-7, K2-2).

**Statement.** Let f be any bijection of a finite X, C an involution, V∘C = −V and |V| ≤ M. For every start
distribution ρ and every beat t, |⟨V⟩_t| ≤ M · ‖ρ − u‖₁ ≤ M · √(2 (ln|X| − H(ρ))), with u uniform on X.

**Proof.** u is invariant under every bijection, and Σ_x V(x) = 0 because C negates V. So ⟨V⟩_t =
Σ_x (ρ(x) − u(x))V(f^t x), whose size is at most M‖ρ − u‖₁. Pinsker gives ‖ρ − u‖₁ ≤ √(2 KL(ρ‖u)), and
KL(ρ‖u) = ln|X| − H(ρ), which a bijection keeps.

**What it limits.** The bound beats the trivial |⟨V⟩| ≤ M only when ‖ρ − u‖₁ < 1, that is, for an ensemble close to
uniform. For one configuration H = 0 and the bound is many times M, so it limits nothing. One history on a finite box
is limited only through its cycle: its long-time average of V is the cycle mean. A nonzero cycle mean marks nothing,
since even a C-commuting rule maps a cycle c to Cc with the opposite mean (the identity map is an example). The mark
of a C-odd rule is that cycle means of equal length stop pairing as ± (and, for a unitary, that eigenstate expectations
of V stop pairing as ±). On the infinite mesh there is no uniform u and no cap, and a history kept by export never
repeats, so it has no cycle mean at all: an arrow for one radiating history needs another quantity (round 03, S3-2,
K3-1). The earlier claim
that a C-odd piece "can only lean, capped by the start" is withdrawn.

## 3. A C-odd piece that keeps CPT breaks PT

**Scope.** Any rule, any mesh.

**Statement.** Let T-type symmetries reverse the rule (S f S^{−1} = f^{−1}) and C-type ones keep it. If CPT reverses
f and C does not keep f, then PT does not reverse f.

**Proof.** If PT and CPT both reverse f, then C = CPT·(PT)^{−1} gives C f C^{−1} = CPT (PT)^{−1} f PT (CPT)^{−1} =
CPT f^{−1} (CPT)^{−1} = f, so C keeps f. Two reversals compose to a symmetry (objections K2-8, S2-7).

**Consequence.** The value piece of grounding decision 001 pays in P or T. What the data bound is the size of each
broken symmetry in few-body physics (atomic and molecular parity tests, the weak sector's CP), not the piece's form.
So the constraint is on its few-body size: whatever it breaks must sit below those bounds where they are measured.

## 4. Keeping costs what the repairer does not already hold

**Scope.** A classical ensemble. Under a pure quantum present the same bookkeeping can go negative (objection S2-4).

**Statement (classical).** Split the box as S × E with a bijective repair that ends with S in the fixed pattern p.
Then H(E after) = H(E before) + H(S before) − I(S : E)_before.

**Proof.** A bijection keeps H(S, E). Before, H(S, E) = H(S) + H(E) − I(S : E). After, H(S, E) = H(E after).

**Quantum.** For a global pure state the mutual information is 2S(S), so a global unitary can restore S while E's
entropy falls by S(S) (del Rio, Åberg, Renner, Dahlsten and Vedral, Nature 474, 2011). A cost appears only when the
repair's reach is limited: the cost is the conditional entropy of S given the part of E the repair can act on, inside
its light cone. Under board proposal 001 (the present is one pure amplitude state) this is the form that applies, and
the theorem note's theorem 2 holds only for errors whose correlations have left the repair's reach.

**The target must depend on the branch** (round 03, S3-1). Under proposals 001 and 007, a record is a correlation of
S with what lies outside it, and each record branch is lived. A repair to one fixed pattern p would count a self's own
records as errors and erase which branch it is in. The cost of keeping a form F is the conditional entropy
H(F | R, E_R), with R the self's records and E_R the part of the rest within the repair's reach.

## 5. The infinite mesh is not a closed box, and what an outward channel needs

**Scope.** The infinite {3,4,3,4} honeycomb with a local rule.

**Statement.**
1. On an infinite set a bijection can map a set strictly into itself (on the integers, x to x + 1 sends {x ≥ 0} onto
   {x ≥ 1}). So no attractor and no repair do not follow from reversibility alone.
2. Let the rule be local, moving a value at most one dock a beat (the stream, `01-the-base.tex`:26-27, not the coin's
   group speed 1/2), and let the far state be a known vacuum orbit. Then the global map is a bijection on the states
   that differ from that orbit on a finite set, since each beat a difference spreads at most one step and the inverse
   is local too.
3. **What a region can lose is limited by its surface.** A pattern in a ball B can pass at most about 2 |∂B| ln d nats
   a beat across the links leaving B, d being the states one slot or link passes (von Neumann entropy, round 03 G3-3),
   less the entropy of what comes in uncorrelated with B (S3-4), a margin a volume-law vacuum shrinks. On the honeycomb |∂B| is a fixed share of |B| (a positive Cheeger constant, the
   outer shell being most of every ball, E-GMT-0027), while on a flat 3d lattice it is |B|^{2/3}. So keeping becomes an
   error-rate threshold: a pattern can be kept only if its errors per beat are below what its surface can export
   (objection G2-2). A larger reservoir alone is not the point, since t³ is unbounded too.

**What the outward channel needs, none of which reversibility supplies** (objections Q2-6, S2-2, K2-1):
- **Reach.** Under the line law every piece acts inside one line and every line is a geodesic (E-SPN-0156), so a
  pattern is a set of one-dimensional patterns, each with two exits, and the Cheeger constant never enters. The surface
  bound needs a line mixer (board proposal 004).
- **What physics reads keeps on a flat budget** (round 03, G3-2). Under board proposal 005, a quantity the stream
  carries dock by dock changes a column sum only through links that join two columns, so the column-sum field obeys a
  3d continuity law on the flat cusp layer, where the surface grows as |B|^{2/3}. The hyperbolic surface helps only
  errors whose column sum is zero, which is the part key 1 calls experience, not physics.
- **The amplitude form.** Under proposal 001 the present is an amplitude state and the working vacuum is entangled
  with a volume law (E-GRV-0083), so statement 2 should be read in the quantum cellular automaton form (Schumacher and
  Werner 2004): a vacuum state the global unitary keeps, disturbed by local operators (round 03, K3-5).
- **A locally cold vacuum.** The working vacuum is known globally but volume-law locally (E-GRV-0083), and a small lump
  knocks it off its orbit (E-GRV-0081, E-GRV-0073). The one mixer run on the honeycomb melts it (E-SPN-0157).
- **Selectivity.** Exporting errors while keeping shape is error correction, which the rule must be built to do (an
  atom radiating is unitary, but it needs a bound state, coupling to outgoing modes and no incoming radiation).

## What this note does not settle

- Whether any vacuum is stationary and locally cold under a mixer the author adopts.
- Whether any rule exports a bound pattern's errors faster than they arrive.
- Whether a C-odd piece acting on a charge-neutral reading changes anything a self does while its few-body effects
  stay below the measured bounds.
