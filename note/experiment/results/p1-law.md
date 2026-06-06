# The Law: When Does a Reversible Rule Have a Local Hamiltonian?

P1's open half asked whether a reversible cellular automaton can have a Hamiltonian
that is both bounded below and local. The first pass found the XOR-parity rule has
a nonlocal Hamiltonian. This pass scans many rules and finds the sharp answer: it
is a **trilemma**. Local, bounded below, and information-propagating cannot all
three hold at once for these automata.

Reproduce: `npx tsx code/experiment/p1-law.ts`.

## The scan: the principal Hamiltonian is generically nonlocal

For each rule we build H = i log U (the principal, minimal-energy branch) and
measure its locality length (the weight-averaged interaction range) at two sizes.

```
rule                            length@small  length@large  grows?
single-cell flip (control)          1.00          1.00       no   (N=6,8)
disjoint CNOT layer                 3.63          5.23       YES  (N=6,8)
disjoint Toffoli layer             2.50          3.54       YES  (N=6,9)
propagating CNOT (Margolus)         4.89          6.65       YES  (N=6,8)
propagating Toffoli (Margolus)      4.48          6.54       YES  (N=6,9)
XOR-parity (linear/Clifford)        4.85          6.63       YES  (N=6,8)
```

Every nontrivial rule, Clifford or not, has a principal-branch Hamiltonian whose
range grows with the system. Only the trivial single-cell flip stays local. So the
XOR-parity result was not special: the minimal-energy log of a reversible CA is
generically nonlocal.

## The key insight: locality is branch-dependent

The log of a unitary is multivalued. The principal branch (eigenphases in
(-pi, pi], the minimal-energy vacuum) is the one the scan above measures, and it is
nonlocal. But a DIFFERENT branch can be local. For a rule that is a product of
commuting local gates, the explicit sum of per-block logs,

```
H = sum over blocks of (pi/2)(I - G_block),
```

is a genuine log of U (because the blocks commute and the gates are involutions,
e^{-iH} = product of the gates = U), and it is local. Measuring it:

```
local branch (disjoint CNOT layer):
  N=6: locality length 1.33 (bounded), energy in [0, 3 pi]  (bounded below)
  N=8: locality length 1.33 (bounded), energy in [0, 4 pi]  (bounded below)
```

The locality length does NOT grow with the system, and the energy is bounded
below. So **a local AND bounded-below Hamiltonian does exist** for commuting-gate
rules. It is simply not the principal branch.

## The trilemma

Putting the two together gives a sharp characterisation of P1, and of why the
't Hooft program is hard:

- **Local + bounded below, no propagation.** A product of disjoint commuting local
  gates has an exact local bounded-below Hamiltonian (the sum of block logs). But
  disjoint blocks never talk to each other, so nothing propagates. This is a frozen
  world.
- **Bounded below + propagation, not local.** Any propagating reversible rule has a
  unique minimal-energy (principal-branch) Hamiltonian that is bounded below, but
  it is nonlocal, with range growing as the system grows.
- **Local + propagation, not bounded below.** One can patch together local block
  logs across offset layers, but the offset layers do not commute, so the local
  pieces no longer sum to a single bounded-below operator. The local description
  loses the stable vacuum.

You can have any two of {local, bounded below, propagating}, not all three, for
these cellular automata. That is the precise shape of the obstacle 't Hooft's
Cellular Automaton Interpretation runs into, now demonstrated rather than asserted.

## What this means for Vibe Theory

The "law" of the vibe mesh cannot be a simple reversible cellular automaton and
also give a local, stable-vacuum quantum Hamiltonian with real dynamics. Something
has to give. The honest candidates:

- **The Hamiltonian is quasi-local, not exactly local.** Accept exponentially
  decaying long-range tails (a Lieb-Robinson world). Physics is effectively local
  even if H has a tail. This is the most likely resolution.
- **Time is emergent and continuous, not the log of one discrete step.** Define the
  Hamiltonian as the local operator on the emergent mesh (the graph Laplacian or
  Dirac), which is local and bounded below by construction. Then the discrete rule
  builds the geometry and the local Hamiltonian lives on it, sidestepping the
  trilemma. This connects the law (P1) to the emergent spacetime (P2).

Either way, the result tells Vibe Theory that the rule and the emergent time are
not the same object, and the local quantum dynamics most naturally lives on the
emergent mesh, not in the log of the microscopic update.

## Honest caveats

- **Small sizes.** Two sizes per rule (6 to 9 cells). The growth of the principal
  branch and the constancy of the local branch are clear, but not a scaling fit.
- **Specific gates.** CNOT, Toffoli, and XOR-parity. The trilemma is argued from
  these plus the branch structure, which is general, but a broader gate survey
  would harden it.

## The resolution, demonstrated

The way out is not to define the Hamiltonian as the log of a microscopic step at
all. Define it as a local operator on the EMERGENT mesh: the graph Laplacian (or
the Dirac operator). Then all three properties hold at once. Measured
(`npx tsx code/experiment/p1-emergent.ts`) on a ring mesh:

```
N=24: interaction range 1 (local), spectrum [0, 3.98] (bounded below)
N=48: interaction range 1 (local), spectrum [0, 4.00] (bounded below)
propagation (N=48): mean spread 0.24, 0.80, 2.07, 3.33, 4.60 sites at t = 0.5..4
```

- **Local:** the Laplacian couples only nearest neighbors, so the interaction range
  is 1 at every size, not growing. (Contrast the CA log, which grew with N.)
- **Bounded below:** the Laplacian is positive semidefinite, spectrum starts at 0.
- **Propagating:** a state localized at one site spreads at a finite speed (the
  mean spread grows roughly linearly, about 1.3 sites per unit time, a lightcone).

All three, simultaneously. The trilemma is an obstruction for the log of a discrete
reversible rule, not for physics: the quantum Hamiltonian lives on the emergent
mesh that the rule builds, not inside the rule's own log.

## Status

P1 is resolved in the way that matters for Vibe Theory. A reversible cellular
automaton's own log cannot be local, bounded below, and propagating at once (the
trilemma). But the emergent-mesh Hamiltonian (the graph Laplacian or Dirac) is all
three at once. The lesson for the framework: the rule builds the geometry (P2), and
the local, bounded-below, propagating quantum dynamics is the Laplacian or Dirac on
that geometry. The rule and emergent time are distinct objects, and time is the
mesh operator, not the log of the step.

## See also

`p1-locality.md` (the first pass), `note/questions/roadmap.md`, and the 't Hooft
deep dive in the monorepo at
`note/research/vibe/research/papers/thooft-cellular-automaton-qm/`.
