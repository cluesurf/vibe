# The Spinor Coin

The exact spin algebra of the substrate. It builds the 24 directions of
the {3,4,3,4} cell as a group, shows that group is a DOUBLE COVER, and
exposes the half-angle, the minus-one at 2pi, the triality split, and
the Clifford machinery on top. This is why the cell's coin carries spin
and three generations, and why the {5,3,4} coin does not.

> The coin is the set of directions a cell can step in, but it is not
> just a set. The 24 directions of {3,4,3,4} are a GROUP (the binary
> tetrahedral group 2T), and that group is the spin double cover. A
> direction is a unit quaternion, a rotation lifts to it two ways, and a
> spinor changes sign under a full turn. The whole spin story (Dirac,
> chirality, the three generations) is read off this one structure. The
> spinor experiments in `test/experiment/spin/` all compose the
> functions documented here.

Source, `code/algebra/group/`. Validated by
`test/experiment/spin/rotation-2pi.ts` and
`test/experiment/spin/spinor-triality.ts`.

## What it does

The directions of a cell are not free. For {3,4,3,4} they are the 24
vertices of the 24-cell, and those vertices ARE a group. This layer,

- builds the 24 directions as the binary tetrahedral group 2T, the unit
  Hurwitz quaternions (`binaryTetrahedral`),
- builds the same 24 as the D4 root system, the coordinate picture
  (`rootsD4`),
- acts a rotation on a VECTOR (conjugation, period 2pi) and on a SPINOR
  (left multiply, period 4pi), so the minus-one at 2pi is explicit
  (`rotateVector`, `rotateSpinor`),
- splits the 24 directions by TRIALITY into 8v + 8s + 8c, a vector plus
  two spinor chiralities (`trialityClasses`),
- realizes the Dirac and Pauli algebra and the chirality operator on top
  (`pauli`, `diracGamma`, `diracGamma5`).

The contrast is the point. The {5,3,4} coin has 12 directions
(`icosahedronVertexDirections`). Twelve points do not close into a spin
group the way 24 do, so that coin carries integer spin only.

## The components

| file             | role                                                                                                                                                      |
|:--- |:--- |
| `quaternion.ts`  | unit quaternions, `multiply`, `negate`, `binaryTetrahedral` (2T, the 24 directions), `binaryIcosahedral` (2I), `quaternionKey`                            |
| `root-system.ts` | `rootsD4` (the 24 directions as roots), `rootsF4`, `rootsDn`, `rootsAn`, `icosahedronVertexDirections` (the 12 of {5,3,4}), `reflectRoot`, `isRootSystem` |
| `cell-24.ts`     | `trialityClasses` (the 8v/8s/8c split), `omega` (the cube root of unity that cycles them), `cell24Vertices`                                               |
| `rotation.ts`    | `rotateVector`, `rotateSpinor`, `rotateSpinorTimes`, `rotateVectorTimes`, `rotationKey`                                                                   |
| `clifford.ts`    | `pauli`, `diracGamma`, `diracGamma5`, `spinGeneratorZ`, `diracHamiltonian`, `cmMultiply`, `cmCommutator`                                                  |

Start with `quaternion.ts`. The 24 unit Hurwitz quaternions are the
whole story in one function.

## How to use it

### The 24 directions, two ways

```ts
import { binaryTetrahedral } from '@/code/algebra/group/quaternion'
import { rootsD4 } from '@/code/algebra/group/root-system'

const coin = binaryTetrahedral() // 24 unit quaternions, the group 2T, the 24-cell vertices
const roots = rootsD4() // the SAME 24 directions as coordinate vectors (+-1, +-1, 0, 0)
// coin.length  -> 24
// roots.length -> 24
```

### The 2pi sign (the heart)

```ts
import { quaternion, negate } from '@/code/algebra/group/quaternion'
import {
  rotateSpinor,
  rotateVector,
} from '@/code/algebra/group/rotation'

// a half-turn quaternion about z: g = (cos pi/2, 0, 0, sin pi/2), so two of them is a full 2pi turn
const g = quaternion(0, 0, 0, 1) // this g squared = -1
const psi = quaternion(1, 0, 0, 0)

const oncePi2 = rotateSpinor(g, rotateSpinor(g, psi)) // 2pi on a spinor
// oncePi2 equals negate(psi)  -> the spinor picked up MINUS ONE at 2pi
const fourPi = rotateSpinor(
  g,
  rotateSpinor(g, rotateSpinor(g, rotateSpinor(g, psi))),
)
// fourPi equals psi           -> the spinor returns at 4pi

const v = quaternion(0, 1, 0, 0)
const vSpun = rotateVector(g, rotateVector(g, v))
// vSpun equals v              -> a VECTOR returns at 2pi (conjugation, not left multiply)
```

`rotateSpinor` is left multiplication, the half-angle action of SU(2).
`rotateVector` is conjugation, the SO(3) action. Same group element, two
representations, and the gap between them is spin one-half.

### The triality split

```ts
import { trialityClasses } from '@/code/algebra/group/cell-24'

const [vector, spinorA, spinorB] = trialityClasses()
// each class is 8 of the 24 directions: 8v + 8s + 8c
// vector  = the quaternion group Q8 inside 2T
// spinorA = omega * Q8, spinorB = omega^2 * Q8  (omega is a cube root of unity)
```

### The Clifford layer on top

```ts
import {
  diracGamma,
  diracGamma5,
  spinGeneratorZ,
  cmCommutator,
} from '@/code/algebra/group/clifford'

const gamma = diracGamma() // 4 gamma matrices, {gamma_mu, gamma_nu} = 2 eta_mu_nu
const gamma5 = diracGamma5() // the chirality operator, i gamma0 gamma1 gamma2 gamma3
const spinZ = spinGeneratorZ() // (1/2) diag(sigma3, sigma3), eigenvalues +-1/2
// cmCommutator(gamma5, mass-term) is nonzero, chirality-flip needs mass
```

## How it works

The whole layer is one structure seen from several sides, the binary
tetrahedral group 2T.

1. **The 24 directions are a group** (`binaryTetrahedral`). The unit
   Hurwitz quaternions are the 8 of Q8 (+-1, +-i, +-j, +-k) plus the 16
   of (+-1 +-i +-j +-k)/2. That is 24, and they are closed under
   quaternion `multiply`. They are exactly the 24 vertices of the
   24-cell, the cell of {3,4,3,4}.

2. **The same 24 are the D4 roots** (`rootsD4`). All permutations of
   (+-1, +-1, 0, 0), each of norm-squared 2, are 24 vectors. This is the
   coordinate picture of the same coin. `isRootSystem` confirms they
   close under `reflectRoot`, so they are a genuine root system, the
   symmetry algebra so(8).

3. **2T is a double cover** (`rotateSpinor` vs `rotateVector`). The unit
   quaternions are SU(2), which covers the rotation group SO(3) two to
   one. A rotation lifts to TWO quaternions, g and `negate(g)`, and they
   give the same `rotationKey`. A spinor feels the difference,
   `rotateSpinor` is left multiply (the half-angle), so a g with g
   squared = -1 turns a full 2pi and lands on minus the spinor. A vector
   feels only `rotateVector` (conjugation), where g and -g cancel, so it
   returns at 2pi. Spinor closes at 4pi, vector at 2pi.

4. **Triality splits the coin** (`trialityClasses`). The quaternion
   group Q8 sits inside 2T as one coset of eight. Left multiply by
   `omega` = (-1 + i + j + k)/2, a primitive cube root of unity, and you
   cycle to the next coset, then the next. Three cosets of eight, 8v +
   8s + 8c, one vector plus two spinor chiralities. This order-three
   symmetry is the seed of the three generations of matter.

5. **The Clifford layer realizes Dirac** (`clifford.ts`). The `pauli`
   matrices are the su(2) generators the quaternions already carry (up
   to a factor of i). The `diracGamma` matrices satisfy the Clifford
   relation {gamma_mu, gamma_nu} = 2 eta_mu_nu. `spinGeneratorZ` squares
   (twice it) to the identity, so exp(i 2pi S_z) = -I, the same
   double-cover sign as the quaternions. `diracGamma5` anticommutes with
   each gamma, so it commutes with the kinetic term and anticommutes
   with the mass term, which is chirality.

6. **Why {5,3,4} carries no spinor** (`icosahedronVertexDirections`).
   The {5,3,4} coin is 12 directions, the icosahedron vertices. Their
   rotation symmetry is the icosahedral group A5, and the linear
   permutation rep on 12 points decomposes into integer-spin pieces (1 +
   3 + 3' + 5), no spinor. There is no 24-element group of unit
   quaternions sitting on those 12 directions the way 2T sits on the
   24-cell. The spinor lives only in the PROJECTIVE rep of A5 (its
   double cover 2I, the icosians, `binaryIcosahedral`), not in the bulk
   coin itself. On {3,4,3,4} the spinor is in the bulk coin. That is the
   whole {5,3,4}-versus-{3,4,3,4} distinction.

## Capabilities and limits

What it gives,

- The 24-direction coin as a group, with closure, membership keys, and
  the D4 root picture.
- The explicit 2pi minus-one and 4pi return, for both spinor and vector,
  by real composition.
- The triality 8v + 8s + 8c split and the cube-root-of-unity that cycles
  it.
- The full 3+1D Dirac and Pauli algebra and the chirality operator,
  complex-matrix exact.

What it is not,

- It is the algebra of ONE cell's coin, not the whole-mesh field. The
  mesh-wide dynamics live elsewhere (the directional rule, the substrate
  graph). This layer is what a single cell carries.
- The gamma matrices are the standard 3+1D Dirac basis, a continuum
  object. The base substrate is discrete. The Clifford layer is the
  emergent/coarse-grained companion, not a base ingredient.
- It does not by itself prove the three generations emerge dynamically.
  It shows the triality structure is PRESENT. The dynamical question is
  a separate experiment.

## Why it matters

Spin is not added to the model by hand. It is forced by the choice of
substrate. The moment the cell is the 24-cell, its directions are the
binary tetrahedral group, that group is the spin double cover, and a
spinor must change sign at 2pi. Triality then splits the directions into
a vector and two spinor chiralities, the seed of three generations, for
free. This is the strongest reason {3,4,3,4} is the candidate substrate
and not {5,3,4}, the 12-direction coin cannot hold a spinor in its bulk,
the 24-direction coin must. Everything in the spin story, the Dirac
equation, chirality, the generations, is read off this one group.

## See also

- `api/algebra.md`, the brief consumer guide to the algebra layer (this
  doc is the deeper dive on the spin group under it).
- `test/experiment/spin/rotation-2pi.ts`, the experiment that verifies
  the spinor minus-one at 2pi and the return at 4pi against the vector
  return at 2pi.
- `test/experiment/spin/spinor-triality.ts`, the experiment that
  verifies the 8v + 8s + 8c triality split and the omega cycling of the
  three classes.
- `code/algebra/group/quaternion.ts`,
  `code/algebra/group/root-system.ts`, `code/algebra/group/cell-24.ts`,
  `code/algebra/group/rotation.ts`, `code/algebra/group/clifford.ts`,
  the sources.
