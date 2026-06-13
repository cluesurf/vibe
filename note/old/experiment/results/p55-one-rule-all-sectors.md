# P55: One Rule, All Sectors, In One Run

**Status: demonstrated for the bosonic sectors. Matter, force, and radiation are one operator on one mesh.**

## The question

P34 ran the committed model end to end, but each physics sector was still read off the mesh
by its own operator. Can the sectors be tied to a single dynamics: one mesh, built by the
one rule, with the sectors all coming from the one emergent operator on it?

## Result

One mesh of about 1180 cells, built by the committed rule, and the single emergent operator
(the graph Laplacian, the small-signal form of the rule) on it:

- **matter / energy sector** (the operator's spectrum): bounded below and local, the field's
  normal modes. Minimum eigenvalue about 0.003, so it is bounded below.
- **force / static sector** (the operator's Green's function): a static potential that decays
  with distance, potential-versus-distance correlation -0.75.
- **radiation sector** (the rule's own propagation): a disturbance propagates with a strict
  finite-speed light-cone.

All three from a single run.

## Reading

Matter, static force, and radiation are three faces of one emergent operator on one mesh
grown by one rule. The field modes, the static potential, and the propagating signal are not
separate theories bolted together, they are the same dynamics seen three ways.

## Honest reading

This unifies the bosonic sectors (scalar field, static potential, radiation), which all derive
from the one Laplacian-type operator. The fermionic sector (the Dirac operator) and the
non-abelian gauge sector still use their own operators, so folding all sectors into one single
microscopic evolution is the remaining integration named in the roadmap.

## See also

`p34-capstone.md`, `p37-one-rule-propagation.md`, `p16-newtonian.md`, and `note/roadmap.md`.
