# The self reader: information closure on the working rule

Written 2026-11-16 for item `vibe-roadmap-grounding-0004` (records: `note/project/vibe/roadmap/grounding/` in the
ClueSurf repo). Code: `code/measure/self-reader.ts`. Experiment: `test/experiment/selves/self-reader.ts` (E-SLF-0187).

Every grounding route so far read a self by a hand-chosen weight: L(t), the share of B1's bound level still on its line
(E-SLF-0183 to E-SLF-0186). This note defines a self without choosing its shape: a region of the mesh is a self when its
own present implies its own past, beyond what its members would keep as free loves.

## 1. The definition

**The start.** A pure state psi_0 of the working rule (or B1's line rule) that differs from the calm vacuum V1 (the
empty mesh, E-RLT-0121) on finitely many docks. Its **members** are its open vibes; n is their number.

**The region.** A set A of whole docks: blocks, never points, so a dock in A counts all 24 of its slots, on every line.
The candidate's region is its **support**: every dock any branch of psi_0 occupies. The complement E is every other dock.
When the start has a named environment eps_0 (vibes the candidate is set against, such as W0's env at a shared dock),
eps_0 belongs to E.

**The self-free complement.** eps_t = U^t eps_0, the complement run with the candidate removed. With no environment it
is the vacuum at every beat.

**Closure.** Write the state at beat t in the region and complement as psi_t = sum_e a_e (x) |e>, over a basis e of E
(the env's outcomes and every placement of members outside A), and a_eps = sum_e conj(eps_t(e)) a_e. Then

    c_A(t) = sum_e |<a_eps | a_e>|^2

It is the fidelity with which the region's present ALONE implies its past: take the region's state at t, put the
complement back into the state it would have without the self, run the reversible rule back t beats, and overlap with
psi_0. In operator form, c_A(t) = <psi_0| U^-t [Tr_E(psi_t psi_t^dag) (x) |eps_t><eps_t|] U^t |psi_0>.

**Why it is reversible-aware.** The whole state never loses information (key 2: the past is what the present implies
when the rule runs back). c measures what the region can recover by itself; the rest is held by its complement.
c = 1 exactly when psi_t = a (x) eps_t, the region decoupled from a complement that is just its own self-free run.

**The null: free loves.** c0_A(t) is the same reading for the same start and region with every member a free love: the
working rule's one-love walk (split coin D D, then the stream, no drift cost, no meeting phase), fermions, so psi_0 runs
as the n-th exterior power of the one-love map u_t. In a calm complement c0 = r0^2 with
r0(t) = <psi_0| Lambda^n(u_t^dag P_A u_t) |psi_0>.

**Content.** A start with no member (n = 0) holds nothing to keep and is never a self.

**Closure time.** tau_c is the first beat with c_A(t) < 1/2 (infinite if none in the run); tau_0 the same for c0.

**A self.** A candidate is a self when n >= 1 and tau_c >= 2 tau_0: its region keeps its past at least twice as long
as its members would as free loves. The reading is decided only when tau_0 <= T/2 for a run of T beats.

**On a two-beat window** (Lemma W of [line-confinement.md](line-confinement.md) section 4, and the K instrument of
`code/measure/cross-line-dock.ts`) tau_c cannot be read. The reader then reports kappa(2) = sqrt c_A(2), the weight
the region recovers, which is comparable with L(2) (both are weights; in a calm complement kappa = r_A, below).

## 2. What it reduces to in a calm complement

**Theorem.** If the complement starts in the calm vacuum and the rule keeps the number of members (a start of loves only,
under the working rule or B1's line rule: no fear, so no pair move fires), then c_A(t) = r_A(t)^2, where r_A(t) is the
weight of the configurations with every member inside A.

*Proof.* eps_t is the vacuum, so a_eps = a_empty, the region's part paired with an empty complement, which holds all n
members in A. Every a_e with e not empty holds fewer than n members in A, so <a_empty | a_e> = 0, and
c = |<a_empty|a_empty>|^2 = r_A^2. QED.

So in a calm vacuum the closure sees whether the members stay in their region, and nothing else: binding enters only
through HOW LONG they stay, which is why the null is free loves and the reading is a closure time. A reshaping inside
the region (L(t) falling while every member stays in A) costs no closure.

With an environment (W0's env, a bath) the theorem does not apply: the environment can carry the region's information
away without taking a member, and c is computed from the formula in section 1.

## 3. Invariance

c depends on the state only through absolute values of inner products of region parts. So it is unchanged by any
relabeling of docks and slots that carries the region onto the relabeled region, by every symmetry of the rule that
carries (psi_0, A) to (g psi_0, gA), by charge conjugation (the rule commutes with C, E-SLF-0186's R5), and by the order
in which identical members are listed (only a global sign changes).

## 4. Where it runs

- The exact R = 4 ball, sparse branches (`code/measure/cross-ball.ts`), within the start's horizon (r0 + t <= R - 1).
- The line engine (`code/measure/cone-line.ts`) for a state on one mesh line in the calm vacuum: exact on the honeycomb
  for any number of beats ([line-transfer.md](line-transfer.md) Lemma 2), so tau_c can be read.
- Two beats of the line engine with K's block at a shared dock (`cross-line-dock.ts`), or with a dock mixer's on-line
  block (`mixPass`): honeycomb-exact for the P part by Lemma W. A member moved off the line at a dock of A stays in A
  only until the stream, then runs on another line at a dock off the line, outside A.

## 5. What it is not

Not L(t): L reads one chosen level. Not integrated information: c reads one region against its complement and never
partitions the region. A self here is a place that keeps its past; whether it is integrated, or valenced (key 5), is a
further reading.
