import Vibe.Fock.Ring

/-!
# Vibe Theory: the Dephased Bare Beat is Doubly Stochastic (Q6)

Item `vibe-computation-models-0033` (decision 004 of `vibe/computation/models`). The boundary between the bare beat
`U` and the classical pair rules is read through the dephased beat `P i j = |U i j|^2 = conj (U i j) * U i j`, the
classical process left when every phase is forgotten.

- `thm_q_dephased_unitary_doubly_stochastic`: for ANY square matrix `U` over `NinthLoc6 = ℤ[ζ_9][1/6]` that is
  unitary on both sides (`U† U = U U† = I`, entry by entry, indices below `n`), the dephased matrix has every column
  sum and every row sum exactly `1`, and every entry is self-conjugate (a real number of the cyclotomic field). The
  statement is proved for any star ring and then read in `NinthLoc6`.
- `thm_q_dephased_line_coin`: the dephased half coin `D` on a lone line keeps the slot with weight `3/4` and flips it
  with weight `1/4`, and the dephased full coin `C = D^2` keeps it with `1/4` and flips it with `3/4`: so a lone
  excitation under one beat steps on along its slot with weight `1/4` and turns back with weight `3/4`.

Every equality on constants is decided on the exact representatives (`NinthRaw6`) by `decide`; no `sorry`, no axiom,
no `native_decide`. That the dephased beat's coarse images on dock tones are not a function (no pair rule) is the
experiment's exhaustive finding and is not stated here.
-/

set_option autoImplicit false

namespace Vibe

namespace QuantumBoundary

/-- The Kronecker delta of a star ring. -/
def delta {R : Type} [StarCommRing R] (i j : Nat) : R :=
  if i = j then StarCommRing.one else StarCommRing.zero

/-- `U` is unitary on both sides on the indices below `n`: `U† U = I` and `U U† = I`, entry by entry. -/
def IsUnitaryMat {R : Type} [StarCommRing R] (n : Nat) (U : Nat → Nat → R) : Prop :=
  (∀ i j, i < n → j < n →
    StarCommRing.sumN n (fun k => StarCommRing.mul (StarCommRing.conj (U k i)) (U k j)) = delta i j) ∧
  (∀ i j, i < n → j < n →
    StarCommRing.sumN n (fun k => StarCommRing.mul (U i k) (StarCommRing.conj (U j k))) = delta i j)

/-- The dephased matrix `P i j = conj (U i j) * U i j = |U i j|^2`. -/
def dephased {R : Type} [StarCommRing R] (U : Nat → Nat → R) (i j : Nat) : R :=
  StarCommRing.mul (StarCommRing.conj (U i j)) (U i j)

-- [helper]
theorem delta_self {R : Type} [StarCommRing R] (i : Nat) : delta (R := R) i i = StarCommRing.one :=
  ite_eq_left rfl

-- [helper]
theorem dephased_doubly_stochastic {R : Type} [StarCommRing R] (n : Nat) (U : Nat → Nat → R)
    (hU : IsUnitaryMat n U) :
    (∀ j, j < n → StarCommRing.sumN n (fun i => dephased U i j) = StarCommRing.one) ∧
    (∀ i, i < n → StarCommRing.sumN n (fun j => dephased U i j) = StarCommRing.one) ∧
    (∀ i j, StarCommRing.conj (dephased U i j) = dephased U i j) := by
  refine ⟨?_, ?_, ?_⟩
  · intro j hj
    have h := hU.1 j j hj hj
    rw [delta_self] at h
    exact h
  · intro i hi
    have h := hU.2 i i hi hi
    rw [delta_self] at h
    have hfun : (fun j => dephased U i j) =
        (fun k => StarCommRing.mul (U i k) (StarCommRing.conj (U i k))) := by
      funext k
      exact StarCommRing.mul_comm _ _
    rw [hfun]
    exact h
  · intro i j
    unfold dephased
    rw [StarCommRing.conj_mul, StarCommRing.conj_conj, StarCommRing.mul_comm]

/-- Headline (Q6): the dephased matrix of any two-sided unitary matrix over `ℤ[ζ_9][1/6]` is doubly stochastic
    (every column sum and every row sum is exactly `1`) and real (every entry equals its conjugate). -/
theorem thm_q_dephased_unitary_doubly_stochastic (n : Nat) (U : Nat → Nat → NinthLoc6)
    (hU : IsUnitaryMat n U) :
    (∀ j, j < n → StarCommRing.sumN n (fun i => dephased U i j) = StarCommRing.one) ∧
    (∀ i, i < n → StarCommRing.sumN n (fun j => dephased U i j) = StarCommRing.one) ∧
    (∀ i j, StarCommRing.conj (dephased U i j) = dephased U i j) :=
  dephased_doubly_stochastic n U hU

/-- One quarter, `9 / 36`, in `ℤ[ζ_9][1/6]`. -/
def quarter : NinthLoc6 := NinthLoc6.mk (Ninth.ofInt 9) 2

/-- Three quarters, `27 / 36`, in `ℤ[ζ_9][1/6]`. -/
def threeQuarters : NinthLoc6 := NinthLoc6.mk (Ninth.ofInt 27) 2

/-- Headline (Q6): the dephased line coins. The half coin `D` keeps a lone slot with weight `3/4` and flips it with
    weight `1/4`; the full coin `C = D^2` keeps it with `1/4` and flips it with `3/4`; each pair sums to `1`. -/
theorem thm_q_dephased_line_coin :
    NinthLoc6.mul (NinthLoc6.conj NinthLoc6.coinDiag) NinthLoc6.coinDiag = threeQuarters ∧
    NinthLoc6.mul (NinthLoc6.conj NinthLoc6.coinOff) NinthLoc6.coinOff = quarter ∧
    NinthLoc6.mul (NinthLoc6.conj NinthLoc6.fullCoinDiag) NinthLoc6.fullCoinDiag = quarter ∧
    NinthLoc6.mul (NinthLoc6.conj NinthLoc6.fullCoinOff) NinthLoc6.fullCoinOff = threeQuarters ∧
    NinthLoc6.add quarter threeQuarters = NinthLoc6.one := by
  exact ⟨Quot.sound (by decide), Quot.sound (by decide), Quot.sound (by decide),
    Quot.sound (by decide), Quot.sound (by decide)⟩

end QuantumBoundary

end Vibe
