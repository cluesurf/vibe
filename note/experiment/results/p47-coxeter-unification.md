# P47: The Coxeter Unification

**Status: demonstrated. All the tessellations come from one machine.**

## The question

The choosing-the-base analysis argues the tilings are not separate objects but special
cases of one construction, the Coxeter (reflection-group) orbit, named by a Schlafli
symbol. Can we show {7,3}, {5,4}, and {5,3,4} all come out of one generator?

## Result

Running each Schlafli symbol through the single generator `coxeterTessellation`:

| tessellation | dimension | vertices | mean degree | Lorentz anisotropy | Lorentz-safe |
| ------------ | --------- | -------- | ----------- | ------------------ | ------------ |
| heptagrid {7,3} | 2D | 2502 | 74.9 | 0.032 | yes |
| pentagrid {5,4} | 2D | 2504 | 60.6 | 0.030 | yes |
| {8,3} | 2D | 2534 | 27.0 | 0.050 | yes |
| {6,4} | 2D | 2510 | 19.1 | 0.039 | yes |
| dodecagrid {5,3,4} | 3D | 2584 | 11.6 | 0.050 | yes |

Every one comes from the same generator by changing only the symbol, and all are
Lorentz-safe.

## Reading

The heptagrid, the pentagrid, their relatives, and the 3D dodecagrid are not separate
inventions. They are one construction, the Coxeter reflection-group orbit, on different
settings of the Schlafli symbol. So the base of the model is not a chosen tiling but the
reflection-group principle itself, and the specific tiling is a special case, a gauge
choice among equivalent options.

## See also

`p40-non-random-substrates.md`, `p41-margenstern-tilings.md`, `p45-dodecagrid.md`, and
`p48-modular-base` (the parameter-free base).
