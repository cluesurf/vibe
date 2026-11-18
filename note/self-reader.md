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

## 5. The readings (E-SLF-0187, then its rerun E-SLF-0191)

**E-SLF-0187 (item 0004): fail on one gate.** Every instrument held and B1's line self read as A SELF over 96 beats
of the line engine (c(96) 0.914, never below 1/2, against its free null's tau_0 = 11). The vacuum read not a self, and
the reading was the same to 0 over 24 line orientations, C and member order. The lone-love gate S3 failed as an
undecidable test: on the R = 4 ball's 3-beat horizon a lone love's c equals its null to 0 but never falls below 1/2,
so tau_c = tau_0 = Infinity and "tau_c < 2 tau_0" cannot hold. That verdict stands as recorded (decision 005 of the
grounding project).

**E-SLF-0191 (item 0029): pass.** A new pre-registration reads the lone love on the line engine over the same 96 beats
(one love has no flux link and no full dock, so the line rule runs it as on the honeycomb), each of the 24 slots of
dock 0 on its own line, region its dock and the two line neighbours. Its c equals its free null to 0 on every slot:
1, 1, 0.56, 0.88, 0.11 at beats 0 to 4. So tau_c = tau_0 = 4 and a lone love is not a self. Every other gate, rerun in
the same run, reproduced 0004's numbers to the digits printed (S1 tau_0 11, c(96) 0.914; E-SLF-0186's main arm
kappa(2) 0.913 against L(2) 0.887, so closure survives where L dropped; E-SLF-0185's six mixers drop under both,
kappa 0.02 to 0.44).

A lone love's c is not monotone (it falls to 0.56 at beat 2 and climbs back to 0.88 at beat 3, as the walk returns to
the region), so the first beat below 1/2 is what the closure time reads.

## 6. Against the literature (added after the gates were set, 2026-11-16)

The survey `note/project/vibe/roadmap/grounding/research_notes/Self persistence in reversible dynamics/defining-a-self.md`
(ClueSurf repo) names the forms this reader sits beside:

- Krakauer, Bertschinger, Olbrich, Flack, Ay 2020: A* = I(S_{n+1}; S_n), A = I(S_{n+1}; S_n | E_n), non-closure
  nC = I(S_{n+1}; E_n | S_n). They need an ensemble of starts. With one pure start in a calm vacuum the environment
  carries nothing, so nC = 0 for every region, and section 2's theorem says what is left is retention. The reader's
  c_A is the single-start operational form: recovery of the past from the region alone.
- A* and A only grow with the region, so a raw score cannot pick a boundary. Here the region is the start's support and
  the bar is a closure TIME against free loves, which a larger region does not buy for free (the free null grows with it).
- Hosur, Qi, Roberts, Yoshida 2016: the channel mutual information I(S : S'_t) of U's Choi state, over EVERY input of
  the region, with I(S : E'_t) what leaked. For one walker it is the singular values of P_S U^t P_S. It reads
  distinguishability (two different starting selves), which retention of one start cannot see. Not computed here.
- Taati 2021: a reversible surjective CA under noise forgets its start within O(log n) beats. Persistence must come
  from the rule (a conserved charge, a bound or localized eigenstate, a flat band, fragmentation, topology). A closure
  time over a finite run cannot tell a localized eigenstate from a slow leak; a spectral test (an eigenvector of the
  n-member sector with its weight on a finite region) can.

## 7. The reference closure (E-SLF-0197, item 0035)

**The blind spot (E-SLF-0194, trap T-0027a).** E-SLF-0194 put B1's line self under opt-in shape phases (a twist w^o on
the cluster's orientation, and a register that steers and records it). The reader called every arm a self (c 0.77 to
0.92 at beat 80) though the twisted arms broke B1's bound level (L 0.13 against 0.949 bare).

**Why c stayed high.** The parts formula c = sum_e |<a_eps|a_e>|^2 equals the operator form of section 1 only when
psi_t = U^t psi_0: the state ran under the rule that runs it back. E-SLF-0194 read c (as r^2) on runs under V, the
rule times a shape phase. So it read closure under V, and with the region the whole support in a calm complement that
is retention alone (section 2). The twist is diagonal in the configurations and keeps every shape, so it commutes with
every whole-dock projector: it moves no member and costs c nothing when it acts. V still binds the three loves (r(80)
0.88 to 0.96 while the free null is gone by beat 24), so nothing leaves the support while B1's level breaks.

**The amended reader.** Read the region against the start's own run phi_t = U^t psi_0 under the reference rule U, the
rule the reading names without the candidate's opt-in pieces:

    c_ref_A(t) = <phi_t| [Tr_E(psi_t psi_t^dag) (x) |eps_t><eps_t|] |phi_t>

In parts it is the old formula with a_eps taken from the reference run (b_eps). In a calm complement with conserved
members, c_ref = sum_h |<P_A phi_t | P_A psi_h(t)>|^2 over the complement's other records h (a register with self-free
run |h = 0>). When the run is the reference rule, phi = psi and c_ref = c operation for operation, so every reading of
sections 5 and 6 stands unchanged. Code: `code/measure/self-reference.ts`.

**The readings (E-SLF-0197): pass.** One run on the M3 (1,052 s). Every E-SLF-0191 gate reproduces under c_ref,
equal to the old c to 0: B1's line self A SELF (c_ref(96) 0.914, tau_0 11), the vacuum not, a lone love tau_c = tau_0
= 4 on all 24 slots, invariance to 0. On E-SLF-0194's arms (80 beats, tau_0 11):

| arm | c_ref(1) | c_ref(80) | new | old c(80) | old | L(80) |
| --- | --- | --- | --- | --- | --- | --- |
| A0 bare | 0.918 | 0.921 | A SELF | 0.921 | A SELF | 0.949 |
| K frozen keel | 0.918 | 0.921 | A SELF | 0.921 | A SELF | 0.949 |
| R write only | 0.392 | 0.366 | not (tau_c 1) | 0.855 | A SELF | 0.402 |
| F | 0.128 | 0.091 | not (tau_c 1) | 0.805 | A SELF | 0.130 |
| F' | 0.128 | 0.086 | not (tau_c 1) | 0.841 | A SELF | 0.127 |
| C coupled | 0.392 | 0.228 | not (tau_c 1) | 0.849 | A SELF | 0.295 |
| C0 | 0.231 | 0.212 | not (tau_c 1) | 0.852 | A SELF | 0.292 |
| C1 | 0.704 | 0.254 | not (tau_c 3) | 0.773 | A SELF | 0.286 |
| C2 | 0.240 | 0.218 | not (tau_c 1) | 0.924 | A SELF | 0.306 |

At beat 1 c_ref is close to |<psi_0|T|psi_0>|^2 for the twist T (orientation weights 0.082, 0.459, 0.459), and a
register arm reads the mean of its three fixed-phase sectors exactly (to 1e-14). E-SLF-0185's mixers, read against
the bare line rule, give kappa_ref(2) 0.12 to 0.65 (old kappa 0.02 to 0.44): both drop.

**Its limit.** c_ref asks whether the region keeps the start's own past under a named rule. A candidate whose own
pieces define a new rule is a self of that rule only when the reading names it as the reference, and then c_ref is
the old c. Which rule a reading names is a choice the reading states, not one the reader makes.

## 8. What it is not

Not L(t): L reads one chosen level. Not integrated information: c reads one region against its complement and never
partitions the region. A self here is a place that keeps its past; whether it is integrated, or valenced (key 5), is a
further reading.
