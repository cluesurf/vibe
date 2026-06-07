# P44: Computational Universality (Turing-Completeness)

**Status: demonstrated. The model's rule is functionally complete, so the substrate is computation-universal.**

## The question

Margenstern proved cellular automata on the hyperbolic tilings are universal. Can we make
universality concrete at the level of the model's own rule, the ternary signed-majority
update?

## Result

1. **The rule realizes NAND.** Applied as a two-input gate with bias +1 and fills -1, the
   signed-majority rule computes NAND exactly. NAND is functionally complete.
2. **It builds working arithmetic.** From rule-NANDs alone we build NOT, AND, OR, XOR, and
   a full adder, and the adder computes a + b + carry correctly for all eight inputs.
3. **It expresses the universal Rule 110.** Built from rule-NANDs as a sum of minterms,
   the elementary cellular automaton Rule 110 (proven Turing-complete by Cook) is
   reproduced exactly, and it runs and evolves non-trivially on the rule's gates.

## Reading

The model's own local rule realizes a functionally complete gate, so it computes any
Boolean function, any circuit, real arithmetic, and the universal Rule 110. Combined with
the unbounded, exactly-addressable space of the hyperbolic tilings (P42) for memory, that
is full computational universality, Margenstern's result realized on the model substrate.

This grounds the framework's claim that one substrate can host any computable structure:
matter, fields, observers, machines. The lawful sector has no in-principle expressive
ceiling below the limit of computation itself.

## Honest reading

Universality is about the computable and the structural. It establishes that the lawful
sector can host any process. It does not, by itself, establish the felt interior, the
qualia, the wild face. Turing-completeness is a strong grounding for the expressiveness of
the lawful sector and an honest non-answer for the hard part.

## See also

`p42-fibonacci-navigation.md` (the addressable space for memory), the universality
writeup, and `p44-universality` (the experiment).
