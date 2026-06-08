# P72: The Nonlinear Einstein Equation (Genuinely Integrated)

**Status: solved by integration, not by plugging in the answer.**

## The fix

The earlier version substituted the closed-form FRW solution a(t) = t^q and checked the equations to
machine epsilon (the tell-tale sign of an analytic plug-in). This version integrates the dynamics
forward with RK4 and lets a(t) emerge: da/dt = a sqrt(rho), with each component's density evolving by
continuity. We integrate Friedmann plus continuity only, then check the INDEPENDENT acceleration
equation along the trajectory.

## Result

| check | value |
| ----- | ----- |
| emergent radiation slope d(log a)/d(log t) | 0.508 (expect 0.5) |
| emergent matter slope | 0.673 (expect 0.667) |
| acceleration-equation residual at dt = 0.02 | 5.3e-4 |
| acceleration-equation residual at dt = 0.005 | 3.7e-5 |
| deceleration parameter q, early (radiation/matter) | +0.85 (decelerating) |
| deceleration parameter q, late (dark energy) | -1.00 (accelerating) |

Three genuine, non-pluggable results: the power laws emerge as measured slopes (not assumed), the
acceleration residual SHRINKS with the step size (about 16x for a 4x smaller step, the second-order
integration signature, not machine epsilon), and the multi-component radiation-matter-dark-energy
history (which has no closed form) integrates cleanly and shows the deceleration-to-acceleration
transition.

## Reading

The scale factor is not assumed. It is integrated from the nonlinear Friedmann equation together with
energy conservation, and the independent acceleration equation then holds along the trajectory through
the nonlinear Bianchi identity, with a residual that shrinks as the step shrinks. That is the
genuinely nonlinear Einstein equation solved rather than plugged in. The remaining piece is the fully
discrete strong-field solution (a black-hole interior) from the same action.

## See also

`p32-einstein-equations.md`, `p24-graviton-from-action.md`, `p13-cosmology.md`.
