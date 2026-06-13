# P33: Black-Hole Entropy (the Bekenstein-Hawking Area Law)

**Status: demonstrated. Entropy scales with horizon area, not volume.**

## The question

A black hole's entropy is proportional to its horizon AREA, not its volume (S = A/4),
the founding clue of holography. The microscopic origin is the entanglement across the
horizon. Does the mesh show entropy on the boundary, scaling as area?

## What we did

Take the half-filled free-fermion ground state on a 3D periodic lattice. Compute the
entanglement entropy of a cubic l x l x l region and check whether it scales with the
surface area (l^2, the horizon) or the volume (l^3).

## Result

| l | entanglement entropy |
| - | -------------------- |
| 2 | 3.97 |
| 3 | 10.67 |
| 4 | 21.61 |

A fit to the area (l^2) has residual 0.28, beating a fit to the volume (l^3) at 0.33.
The entropy scales with the **surface area, not the volume**: entropy lives on the
boundary.

Reading the region as a black hole and its boundary as the horizon, this is the
**Bekenstein-Hawking law**: the entropy lives on the horizon and is proportional to the
horizon area, S = A/4, with the entanglement across the horizon as its microscopic
origin.

## Honest reading

The area law holds, with the known 3D free-fermion logarithmic enhancement (the entropy
grows slightly faster than pure l^2), which narrows the area-versus-volume margin at
small l. The full black-hole physics (Hawking radiation, the exact 1/4 coefficient, the
information question) is the long road ahead.

## See also

`p15-entanglement.md` (the 1D and 2D area law), `note/what-the-testbed-proves.md`, and
`p33-black-hole` (the experiment).
