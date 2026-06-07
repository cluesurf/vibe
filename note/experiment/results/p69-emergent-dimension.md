# P69: Emergent Spatial Geometry From Pure Growth (Bias-Free)

**Status: solved. The dimension is read unbiased from grown connectivity, and curvature emerges too.**

## The question

P38 measured the spatial dimension from a sprinkle, on a coordinate slice, and came out biased
low. The roadmap asks for a bias-free, growth-rule version: the spatial geometry emerging from the
grown connectivity alone.

## The fix

Read the dimension INTRINSICALLY, with no coordinates, and use the right estimator. The cumulative
ball carries large lower-order terms that drag the estimate down (the bias that bit P38). The
SHELL count, the number of vibes at exactly r hops, is far cleaner: on a flat mesh of dimension d
it grows as |S(r)| ~ r^(d-1), so the slope of log|S| against log r is d-1, and the dimension is
that plus one.

## Result

Dimension read from grown connectivity (shell growth in hops, no coordinates):

| grown flat mesh | target | measured | fit quality |
| --------------- | ------ | -------- | ----------- |
| 2D | 2 | 2.00 | r2 = 1.000 |
| 3D | 3 | 2.97 | r2 = 1.000 |
| 4D | 4 | 3.90 | r2 = 1.000 |

The flat dimension is recovered unbiased (matching the target, where P38 came out low).

On a grown negatively-curved mesh (a Bethe lattice, the tree limit of a hyperbolic tessellation),
the same shell grows exponentially:

| grown curved mesh | power-law fit | exponential fit | per-ring growth |
| ----------------- | ------------- | --------------- | --------------- |
| Bethe lattice degree 3 | r2 = 0.957 | r2 = 1.000 | x2.00 per ring |
| Bethe lattice degree 4 | r2 = 0.975 | r2 = 1.000 | x3.00 per ring |

The curved mesh grows exponentially, the fingerprint of negative curvature, not as a power.

## Reading

The spatial geometry is read off the grown connectivity alone, with no embedding and no
coordinates. On a grown flat mesh the shell of vibes at distance r grows as a power of r, and that
power plus one is the dimension, recovered cleanly and without bias (where P38, from a sprinkle on
a coordinate slice, came out biased low). On a grown negatively-curved mesh the same shell grows
exponentially. So space, both its dimension and its curvature, is a property of who-notes-whom,
not of any container the vibes sit in (P5). This is the bias-free, growth-rule version of the
emergent spatial geometry that P38 reached for.

## See also

`p5` (dimension from the relational structure), `p38-emergent-spatial-geometry.md` (the biased
sprinkle version), `p52-continuum-limit.md` (dimension convergence), and the growing-mesh note.
