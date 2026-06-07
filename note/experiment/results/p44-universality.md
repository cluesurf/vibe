# P44: Computational Universality (On the Running Substrate)

**Status: solved. Gates now run on the model's own dynamics as stable fixed points.**

## The fix

The earlier version verified gates as stateless functions and never ran them on the actual
substrate, and it cited Rule 110 rather than demonstrating computation end to end. The auditor also
noted P37's dynamics are dissipative, raising the worry that a gate could not hold a signal. This
version builds gates as real subgraphs of cells with symmetric ternary fills, clamps the inputs and a
+1 bias, runs the asynchronous signed-majority rule to a fixed point, and reads the output.

## Result

| check | result |
| ----- | ------ |
| the rule realizes NAND (functionally complete) | YES |
| a full adder from rule-NANDs computes a+b+carry | YES |
| the universal Rule 110 reproduced from rule-NANDs | YES |
| NAND as a real subgraph, settled by the rule to a fixed point | YES |
| a 6-gate XOR composed and run entirely by the dynamics | YES |
| every output is a stable fixed point (no dissipation) | YES |

The XOR is XOR = AND(OR(a,b), NAND(a,b)) with AND = NOT . NAND and OR = NAND(NOT a, NOT b), six gates
wired together. Bus widths decrease downstream (11, 9, 7, 5, 3) so each gate's margin exceeds the
feedback it receives, which is why the correct answer is a genuine fixed point.

## Reading

The model's own local rule realizes NAND, and not just as a function: built as a real subgraph and
run by the asynchronous rule itself, NAND and a multi-gate XOR settle to the correct answer as stable
fixed points on the live substrate. That directly answers the dissipation worry (a clamped-input gate
is an attractor, not a decaying pulse) and shows gates compose on the dynamics. Circuit universality
on the running substrate follows. Unbounded-tape Turing completeness additionally needs the growing,
exactly-addressable space of the tilings (P42, P83) for memory, which is Margenstern's result. The
felt interior is a separate question, untouched by universality.

## See also

`p37-one-rule-propagation.md`, `p42-fibonacci-navigation.md`, `p83-deterministic-growth.md`.
