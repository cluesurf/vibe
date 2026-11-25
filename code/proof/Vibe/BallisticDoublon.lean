import Vibe.Algebra
import Vibe.Rule
import Vibe.CoxeterTransport

/-!
# Vibe Theory: Hyperbolic Ballistic Wavefront No-Go & Exact `ℤ[ω][1/13]` Composite Doublon

Zero-dependency Lean 4.35.0 formalization of the algebraic core behind Wave-2 Track W3
(Open Challenge 5 resolution & `k = 2` composite bound-state discovery; Milestone P7-B):

1. **Exact `{3,4,3,4}` Hyperbolic Convexity, `ℤ_2`-Grading & Orthochronous Positivity (`O^+(4,1; ℤ[√2])`):**
   - Exact Gram-center contraction `(2 B) c_0 = -2 e_4`, hence `H_2(g) = -2 B(g c_0, c_0) = 2 (g c_0)_4`
     for EVERY `5 × 5` matrix `g : Mat5`.
   - Exact antipodal center sum `k_a c_0 + k_{-a} c_0 = 6 c_0` across all 24 facets and universal
     symbolic convexity `H_2(g k_a) + H_2(g k_{-a}) = 6 H_2(g)` for EVERY `g : Mat5` and `a : Fin 24`.
   - Exact `ℤ_2`-grading closure and `[3,4,3,4]` Cholesky future-sheet positivity across ALL finite
     Coxeter words `w : List (Fin 24)`, proving unconditionally that `(H_2(w)).b = 0`, `H_2(w)` is
     even, and `H_2(w) ≥ 2` throughout the infinite `{3,4,3,4}` honeycomb.
2. **Frontier Arrival-Set Separation, Pell Ballistic Recurrence & Abstract No-Periodicity Theorem:**
   - No antipodal pair `(a, oppSlot a)` can both lie in the frontier arrival set `A_*(g, mPrev)`;
     every arrival slot transmits straight through to height `≥ 6 M_curr - M_prev ≥ 5 M_curr > M_curr`.
   - Exact Pell-Chebyshev ballistic sequence `a_0 = 1, a_1 = 1, a_{n+2} = 6 a_{n+1} - a_n`
     (`1, 1, 5, 29, 169, 985, ...`): exact `a_{n+2} + a_n = 6 a_{n+1}`, `a_{n+1} ≥ 5^n`,
     Cassini invariant `a_{n+1}^2 + a_n^2 + 4 = 6 a_{n+1} a_n`, and unboundedness.
   - Abstract ballistic leap-to-no-periodicity theorem: any positive sequence `M : Nat → Nat` obeying
     `M(t + 1) ≥ M(t) → M(t + 2) + M(t) ≥ 6 M(t + 1)` reaches a finite turnaround `t_0`, obeys
     `M(t_0 + n) ≥ M(t_0) a_n`, escapes every bound `B`, and cannot be periodic for any `T ≥ 1`.
   - *Scope note:* Lean formalizes the exact `O^+(4,1)` convexity, `H_2(w) ≥ 2`, antipodal arrival
     exclusion, antipodal-free disjoint-support frontier Gram diagonalization `1 - (3/4)^m`, and the
     abstract leap-to-no-periodicity theorem; instantiating the Fock-space trajectory
     `M(t) = max_{g ∈ activeDocks(U^t ψ)} H_2(g)` for full multi-particle `U` is bridged externally in
     `test/breakthrough/compacton-nogo-and-doublon.ts` and
     `03-bare-qca-compacton-and-scattering-theorem.md`.
3. **Exact Antipodal-Free Disjoint-Support & `2^m`-Branch Frontier-Leakage Diagonalization (`Lemma 2`):**
   - Exact bare coin weights `|C_diag|^2 = 1/4` (outward transmission) and `|C_off|^2 = 3/4`
     (inward reflection) and unit-norm invariance of every scalar `ζ_6^k` phase factor entering `Φ_odd`.
   - Explicit `AntipodalFree (A : Fin 24 → Bool)` predicate, certified `AntipodalFree (arrivalSlots g mPrev)`,
     zero full lines (`N_full = 0`), and exact disjoint-support / branch-injectivity theorem on
     `flipLines` proving zero off-diagonal Gram cross-terms for distinct `A`-supported configurations.
   - Literal `2^m`-branch Eisenstein tensor-product norm sums for ALL `m : Nat`:
     total `4^m`, retained inward `3^m`, strictly leaked outward `4^m - 3^m` (`1/4, 7/16, 37/64, 175/256`),
     uniform `≥ 1/4` spectral gap for all `m ≥ 1`, and multi-configuration superposition Gram bound.
4. **Exact Zero-Parameter `ℤ[ω][1/13]` Composite Doublon Certificate (`P = 0`, `M_meet sym(+)`):**
   - Exact unit-circle eigenvalue `λ = (7 + 15 ω) / 13` (`|7 + 15 ω|^2 = 169 = 13^2`) and explicit
     Eisenstein eigenvector `a_0 = 13`, `u = (3 + 4 ω, -7 + 8 ω, 1, 3 + 4 ω)` (`|u|^2 = 196 = 14^2`)
     with exact decay `z = 1/13` per even step.
   - Full infinite-line cleared eigenvalue verification `U_2(0) |ψ⟩ = λ |ψ⟩` at `m = 0`, `m = 1`
     (driven by the literal `2 × 2` `M_meet` collision matrix), and ALL bulk sites `2 ≤ m ≤ M` (`∀ M ≥ 2`),
     plus exact `M_meet` and `K`-bounce `2 × 2` unitarity and eigenmode verification.
   - Exact finite-`N` geometric partial sums tied directly to `Eis.normSq` of `doublonState M m`
     (`∀ n : Nat`), certifying exact coincidence weight `p(r = 0) = 6/13` and `IPR = 5118 / 14365`.
-/

set_option autoImplicit false

namespace Vibe

/-! ## Section 1: Exact `{3,4,3,4}` Hyperbolic Height, `ℤ_2`-Grading & Universal Convexity Identity -/

private theorem bd_vec5_ext (u v : Vec5) (h : ∀ i : Fin 5, u i = v i) : u = v := funext h

private theorem bd_z2_add_zero (x : ZSqrt2) : ZSqrt2.add x ZSqrt2.zero = x := by
  cases x; simp only [ZSqrt2.add, ZSqrt2.zero, ZSqrt2.mk.injEq]; exact ⟨by omega, by omega⟩

private theorem bd_z2_zero_add (x : ZSqrt2) : ZSqrt2.add ZSqrt2.zero x = x := by
  cases x; simp only [ZSqrt2.add, ZSqrt2.zero, ZSqrt2.mk.injEq]; exact ⟨by omega, by omega⟩

private theorem bd_z2_add_comm (x y : ZSqrt2) : ZSqrt2.add x y = ZSqrt2.add y x := by
  cases x; cases y; simp only [ZSqrt2.add, ZSqrt2.mk.injEq]; exact ⟨by omega, by omega⟩

private theorem bd_z2_add_assoc (x y z : ZSqrt2) :
    ZSqrt2.add (ZSqrt2.add x y) z = ZSqrt2.add x (ZSqrt2.add y z) := by
  cases x; cases y; cases z; simp only [ZSqrt2.add, ZSqrt2.mk.injEq]; exact ⟨by omega, by omega⟩

private theorem bd_z2_add_sub_sub_add (a b c d : ZSqrt2) :
    ZSqrt2.add (ZSqrt2.sub a b) (ZSqrt2.sub c d) = ZSqrt2.sub (ZSqrt2.add a c) (ZSqrt2.add b d) := by
  cases a; cases b; cases c; cases d
  simp only [ZSqrt2.add, ZSqrt2.sub, ZSqrt2.mk.injEq]; exact ⟨by omega, by omega⟩

private theorem bd_z2_mul_zero (x : ZSqrt2) : ZSqrt2.mul x ZSqrt2.zero = ZSqrt2.zero := by
  cases x; simp only [ZSqrt2.mul, ZSqrt2.zero, ZSqrt2.mk.injEq, Int.mul_zero]
  exact ⟨by omega, by omega⟩

private theorem bd_z2_zero_mul (x : ZSqrt2) : ZSqrt2.mul ZSqrt2.zero x = ZSqrt2.zero := by
  cases x; simp only [ZSqrt2.mul, ZSqrt2.zero, ZSqrt2.mk.injEq, Int.zero_mul, Int.mul_zero]
  exact ⟨by omega, by omega⟩

private theorem bd_z2_one_mul (x : ZSqrt2) : ZSqrt2.mul ZSqrt2.one x = x := by
  cases x; simp only [ZSqrt2.mul, ZSqrt2.one, ZSqrt2.mk.injEq, Int.one_mul, Int.zero_mul, Int.mul_zero]
  exact ⟨by omega, by omega⟩

private theorem bd_z2_mul_add (x y z : ZSqrt2) :
    ZSqrt2.mul x (ZSqrt2.add y z) = ZSqrt2.add (ZSqrt2.mul x y) (ZSqrt2.mul x z) := by
  cases x; cases y; cases z
  simp only [ZSqrt2.mul, ZSqrt2.add, ZSqrt2.mk.injEq, Int.mul_add]; exact ⟨by omega, by omega⟩

private theorem bd_z2_add_mul (x y z : ZSqrt2) :
    ZSqrt2.mul (ZSqrt2.add x y) z = ZSqrt2.add (ZSqrt2.mul x z) (ZSqrt2.mul y z) := by
  cases x; cases y; cases z
  simp only [ZSqrt2.mul, ZSqrt2.add, ZSqrt2.mk.injEq, Int.add_mul, Int.mul_add]
  exact ⟨by omega, by omega⟩

private theorem bd_z2_sub_mul (x y z : ZSqrt2) :
    ZSqrt2.mul (ZSqrt2.sub x y) z = ZSqrt2.sub (ZSqrt2.mul x z) (ZSqrt2.mul y z) := by
  cases x; cases y; cases z
  simp only [ZSqrt2.mul, ZSqrt2.sub, ZSqrt2.mk.injEq, Int.sub_mul, Int.mul_sub]
  exact ⟨by omega, by omega⟩

private theorem bd_z2_mul_assoc (x y z : ZSqrt2) :
    ZSqrt2.mul (ZSqrt2.mul x y) z = ZSqrt2.mul x (ZSqrt2.mul y z) := by
  cases x with | mk xa xb =>
  cases y with | mk ya yb =>
  cases z with | mk za zb =>
  simp only [ZSqrt2.mul, ZSqrt2.mk.injEq, Int.add_mul, Int.mul_add, Int.mul_assoc]
  have h1 : xa * (2 * (yb * zb)) = 2 * (xa * (yb * zb)) := by
    rw [← Int.mul_assoc xa 2 (yb * zb), Int.mul_comm xa 2, Int.mul_assoc 2 xa (yb * zb)]
  have h2 : xb * (2 * (yb * zb)) = 2 * (xb * (yb * zb)) := by
    rw [← Int.mul_assoc xb 2 (yb * zb), Int.mul_comm xb 2, Int.mul_assoc 2 xb (yb * zb)]
  rw [h1, h2]; exact ⟨by omega, by omega⟩

private theorem bd_z2_scale_add (c : Int) (x y : ZSqrt2) :
    ZSqrt2.add (ZSqrt2.scale c x) (ZSqrt2.scale c y) = ZSqrt2.scale c (ZSqrt2.add x y) := by
  cases x; cases y; simp only [ZSqrt2.add, ZSqrt2.scale, Int.mul_add]

private theorem bd_z2_scale_scale (c d : Int) (x : ZSqrt2) :
    ZSqrt2.scale c (ZSqrt2.scale d x) = ZSqrt2.scale (c * d) x := by
  cases x; simp only [ZSqrt2.scale, Int.mul_assoc]

private theorem bd_z2_neg_scale (c : Int) (x : ZSqrt2) :
    ZSqrt2.neg (ZSqrt2.scale c x) = ZSqrt2.scale (-c) x := by
  cases x; simp only [ZSqrt2.neg, ZSqrt2.scale, Int.neg_mul]

private theorem bd_z2_mul_scale (c : Int) (x y : ZSqrt2) :
    ZSqrt2.mul x (ZSqrt2.scale c y) = ZSqrt2.scale c (ZSqrt2.mul x y) := by
  cases x with | mk xa xb =>
  cases y with | mk ya yb =>
  simp only [ZSqrt2.mul, ZSqrt2.scale, ZSqrt2.mk.injEq, Int.mul_add]
  have h1 : xa * (c * ya) = c * (xa * ya) := by
    rw [← Int.mul_assoc xa c ya, Int.mul_comm xa c, Int.mul_assoc c xa ya]
  have h2 : 2 * xb * (c * yb) = c * (2 * xb * yb) := by
    rw [← Int.mul_assoc (2 * xb) c yb, Int.mul_comm (2 * xb) c, Int.mul_assoc c (2 * xb) yb]
  have h3 : xa * (c * yb) = c * (xa * yb) := by
    rw [← Int.mul_assoc xa c yb, Int.mul_comm xa c, Int.mul_assoc c xa yb]
  have h4 : xb * (c * ya) = c * (xb * ya) := by
    rw [← Int.mul_assoc xb c ya, Int.mul_comm xb c, Int.mul_assoc c xb ya]
  rw [h1, h2, h3, h4]; exact ⟨rfl, rfl⟩

private theorem bd_z2_mul_neg2 (x : ZSqrt2) :
    ZSqrt2.mul x (ZSqrt2.ofInt (-2)) = ZSqrt2.scale (-2) x := by
  cases x with | mk xa xb =>
  simp only [ZSqrt2.mul, ZSqrt2.ofInt, ZSqrt2.scale, ZSqrt2.mk.injEq, Int.mul_zero]
  rw [Int.mul_comm xa (-2), Int.mul_comm xb (-2)]; exact ⟨by omega, by omega⟩

private theorem bd_z2_sub_mul_neg2 (c n : ZSqrt2) :
    ZSqrt2.sub c (ZSqrt2.mul n (ZSqrt2.ofInt (-2))) = ZSqrt2.add c (ZSqrt2.scale 2 n) := by
  cases c; cases n with | mk na nb =>
  simp only [ZSqrt2.sub, ZSqrt2.add, ZSqrt2.mul, ZSqrt2.ofInt, ZSqrt2.scale, ZSqrt2.mk.injEq,
    Int.mul_zero, Int.mul_neg]
  rw [Int.mul_comm na 2, Int.mul_comm nb 2]; exact ⟨by omega, by omega⟩

private theorem bd_z2_add_scale2 (c n1 n2 : ZSqrt2)
    (h : ZSqrt2.add n1 n2 = ZSqrt2.scale 2 c) :
    ZSqrt2.add (ZSqrt2.add c (ZSqrt2.scale 2 n1)) (ZSqrt2.add c (ZSqrt2.scale 2 n2)) =
      ZSqrt2.scale 6 c := by
  cases c; cases n1; cases n2
  simp only [ZSqrt2.add, ZSqrt2.scale, ZSqrt2.mk.injEq] at h ⊢
  exact ⟨by omega, by omega⟩

private theorem bd_sum5_add (f g : Fin 5 → ZSqrt2) :
    sum5 (fun k => ZSqrt2.add (f k) (g k)) = ZSqrt2.add (sum5 f) (sum5 g) := by
  have swap4 : ∀ a b c d : ZSqrt2,
      ZSqrt2.add (ZSqrt2.add a b) (ZSqrt2.add c d) =
        ZSqrt2.add (ZSqrt2.add a c) (ZSqrt2.add b d) := by
    intro a b c d
    rw [bd_z2_add_assoc a b (ZSqrt2.add c d), ← bd_z2_add_assoc b c d, bd_z2_add_comm b c,
        bd_z2_add_assoc c b d, ← bd_z2_add_assoc a c (ZSqrt2.add b d)]
  let f0 := f ⟨0, by decide⟩; let f1 := f ⟨1, by decide⟩; let f2 := f ⟨2, by decide⟩
  let f3 := f ⟨3, by decide⟩; let f4 := f ⟨4, by decide⟩
  let g0 := g ⟨0, by decide⟩; let g1 := g ⟨1, by decide⟩; let g2 := g ⟨2, by decide⟩
  let g3 := g ⟨3, by decide⟩; let g4 := g ⟨4, by decide⟩
  change ZSqrt2.add (ZSqrt2.add (ZSqrt2.add (ZSqrt2.add (ZSqrt2.add f0 g0) (ZSqrt2.add f1 g1))
      (ZSqrt2.add f2 g2)) (ZSqrt2.add f3 g3)) (ZSqrt2.add f4 g4) =
    ZSqrt2.add (ZSqrt2.add (ZSqrt2.add (ZSqrt2.add (ZSqrt2.add f0 f1) f2) f3) f4)
      (ZSqrt2.add (ZSqrt2.add (ZSqrt2.add (ZSqrt2.add g0 g1) g2) g3) g4)
  rw [swap4 f0 g0 f1 g1,
      swap4 (ZSqrt2.add f0 f1) (ZSqrt2.add g0 g1) f2 g2,
      swap4 (ZSqrt2.add (ZSqrt2.add f0 f1) f2) (ZSqrt2.add (ZSqrt2.add g0 g1) g2) f3 g3,
      swap4 (ZSqrt2.add (ZSqrt2.add (ZSqrt2.add f0 f1) f2) f3)
            (ZSqrt2.add (ZSqrt2.add (ZSqrt2.add g0 g1) g2) g3) f4 g4]

private theorem bd_sum5_sub (f g : Fin 5 → ZSqrt2) :
    sum5 (fun k => ZSqrt2.sub (f k) (g k)) = ZSqrt2.sub (sum5 f) (sum5 g) := by
  unfold sum5
  rw [bd_z2_add_sub_sub_add, bd_z2_add_sub_sub_add, bd_z2_add_sub_sub_add, bd_z2_add_sub_sub_add]

private theorem bd_sum5_mul_left (c : ZSqrt2) (f : Fin 5 → ZSqrt2) :
    sum5 (fun k => ZSqrt2.mul c (f k)) = ZSqrt2.mul c (sum5 f) := by
  unfold sum5; rw [bd_z2_mul_add, bd_z2_mul_add, bd_z2_mul_add, bd_z2_mul_add]

private theorem bd_sum5_mul_right (f : Fin 5 → ZSqrt2) (c : ZSqrt2) :
    sum5 (fun k => ZSqrt2.mul (f k) c) = ZSqrt2.mul (sum5 f) c := by
  unfold sum5; rw [bd_z2_add_mul, bd_z2_add_mul, bd_z2_add_mul, bd_z2_add_mul]

private theorem bd_sum5_scale (c : Int) (f : Fin 5 → ZSqrt2) :
    sum5 (fun k => ZSqrt2.scale c (f k)) = ZSqrt2.scale c (sum5 f) := by
  unfold sum5; rw [bd_z2_scale_add, bd_z2_scale_add, bd_z2_scale_add, bd_z2_scale_add]

private theorem bd_sum5_comm (f : Fin 5 → Fin 5 → ZSqrt2) :
    sum5 (fun i => sum5 (fun j => f i j)) = sum5 (fun j => sum5 (fun i => f i j)) := by
  change sum5 (fun i => sum5 (fun j => f i j)) =
    ZSqrt2.add (ZSqrt2.add (ZSqrt2.add (ZSqrt2.add
      (sum5 (fun i => f i ⟨0, by decide⟩)) (sum5 (fun i => f i ⟨1, by decide⟩)))
      (sum5 (fun i => f i ⟨2, by decide⟩))) (sum5 (fun i => f i ⟨3, by decide⟩)))
      (sum5 (fun i => f i ⟨4, by decide⟩))
  rw [← bd_sum5_add, ← bd_sum5_add, ← bd_sum5_add, ← bd_sum5_add]; rfl

private theorem bd_sum5_kron_left (i : Fin 5) (f : Fin 5 → ZSqrt2) :
    sum5 (fun k => ZSqrt2.mul (mat5Id i k) (f k)) = f i := by
  match i with
  | ⟨0, _⟩ | ⟨1, _⟩ | ⟨2, _⟩ | ⟨3, _⟩ | ⟨4, _⟩ =>
    simp [sum5, mat5Id, bd_z2_one_mul, bd_z2_zero_mul, bd_z2_add_zero, bd_z2_zero_add]

private theorem bd_mat5Vec_mul (A B : Mat5) (v : Vec5) :
    mat5Vec (mat5Mul A B) v = mat5Vec A (mat5Vec B v) := by
  apply bd_vec5_ext; intro i; unfold mat5Vec mat5Mul
  have hL : sum5 (fun k => ZSqrt2.mul (sum5 (fun m => ZSqrt2.mul (A i m) (B m k))) (v k)) =
      sum5 (fun k => sum5 (fun m => ZSqrt2.mul (A i m) (ZSqrt2.mul (B m k) (v k)))) := by
    apply congrArg sum5; funext k; rw [← bd_sum5_mul_right]
    apply congrArg sum5; funext m; exact bd_z2_mul_assoc (A i m) (B m k) (v k)
  have hR : sum5 (fun m => ZSqrt2.mul (A i m) (sum5 (fun k => ZSqrt2.mul (B m k) (v k)))) =
      sum5 (fun m => sum5 (fun k => ZSqrt2.mul (A i m) (ZSqrt2.mul (B m k) (v k)))) := by
    apply congrArg sum5; funext m; rw [← bd_sum5_mul_left]
  rw [hL, bd_sum5_comm, hR]

private theorem bd_mat5Vec_add (A : Mat5) (u v : Vec5) (i : Fin 5) :
    ZSqrt2.add (mat5Vec A u i) (mat5Vec A v i) =
      mat5Vec A (fun k => ZSqrt2.add (u k) (v k)) i := by
  unfold mat5Vec; rw [← bd_sum5_add]
  apply congrArg sum5; funext k; exact (bd_z2_mul_add (A i k) (u k) (v k)).symm

private theorem bd_mat5Vec_scale (A : Mat5) (c : Int) (v : Vec5) (i : Fin 5) :
    mat5Vec A (fun k => ZSqrt2.scale c (v k)) i = ZSqrt2.scale c (mat5Vec A v i) := by
  unfold mat5Vec
  have h : (fun k => ZSqrt2.mul (A i k) (ZSqrt2.scale c (v k))) =
      (fun k => ZSqrt2.scale c (ZSqrt2.mul (A i k) (v k))) := by
    funext k; exact bd_z2_mul_scale c (A i k) (v k)
  rw [h, bd_sum5_scale]

private theorem bd_transport_baseCenter (a : Fin 24) :
    mat5Vec (transport a) baseCenter =
      fun i => ZSqrt2.add (baseCenter i) (ZSqrt2.scale 2 (facetNormal a i)) := by
  unfold transport
  rw [bd_mat5Vec_mul, thm_central_inversion_properties.2.2.2.1]
  have hDotAll : ∀ x : Fin 24,
      sum5 (fun k => ZSqrt2.mul (mat5Vec twiceGram (facetNormal x) k) (baseCenter k)) =
        ZSqrt2.ofInt (-2) := by
    decide
  apply bd_vec5_ext; intro i
  have hFun : (fun k => ZSqrt2.mul
        (ZSqrt2.sub (mat5Id i k) (ZSqrt2.mul (facetNormal a i) (mat5Vec twiceGram (facetNormal a) k)))
        (baseCenter k)) =
      (fun k => ZSqrt2.sub (ZSqrt2.mul (mat5Id i k) (baseCenter k))
        (ZSqrt2.mul (facetNormal a i) (ZSqrt2.mul (mat5Vec twiceGram (facetNormal a) k) (baseCenter k)))) := by
    funext k; rw [bd_z2_sub_mul, bd_z2_mul_assoc]
  change sum5 (fun k => ZSqrt2.mul
        (ZSqrt2.sub (mat5Id i k) (ZSqrt2.mul (facetNormal a i) (mat5Vec twiceGram (facetNormal a) k)))
        (baseCenter k)) = ZSqrt2.add (baseCenter i) (ZSqrt2.scale 2 (facetNormal a i))
  rw [hFun, bd_sum5_sub, bd_sum5_kron_left i baseCenter, bd_sum5_mul_left, hDotAll a]
  exact bd_z2_sub_mul_neg2 (baseCenter i) (facetNormal a i)

/-- Exact doubled Lorentz height `H_2(g) = -2 B(g c_0, c_0)` in `ℤ[√2]`. -/
def lorentzHeightZ2 (g : Mat5) : ZSqrt2 :=
  ZSqrt2.neg (twiceForm (mat5Vec g baseCenter) baseCenter)

/-- Exact rational integer part of the doubled Lorentz height `H_2(g)`. -/
def lorentzHeight (g : Mat5) : Int := (lorentzHeightZ2 g).a

/-- `ℤ_2`-grading of the 5 Coxeter coordinates: `true` on `{0, 1, 4}`, `false` on `{2, 3}`. -/
def coxeterCoordEven (i : Fin 5) : Bool :=
  i.val == 0 || i.val == 1 || i.val == 4

/-- `ℤ_2`-grading predicate on `ZSqrt2` (`true` ⇒ `b = 0`, `false` ⇒ `a = 0`). -/
abbrev z2HasParity (even : Bool) (x : ZSqrt2) : Prop :=
  (even = true → x.b = 0) ∧ (even = false → x.a = 0)

/-- `Vec5` obeys the `{3,4,3,4}` `ℤ_2`-grading. -/
abbrev vec5Graded (v : Vec5) : Prop :=
  ∀ i : Fin 5, z2HasParity (coxeterCoordEven i) (v i)

/-- `Mat5` preserves the `{3,4,3,4}` `ℤ_2`-grading. -/
abbrev mat5Graded (A : Mat5) : Prop :=
  ∀ i j : Fin 5, z2HasParity (coxeterCoordEven i == coxeterCoordEven j) (A i j)

private theorem bd_z2HasParity_add (p : Bool) (x y : ZSqrt2)
    (hx : z2HasParity p x) (hy : z2HasParity p y) : z2HasParity p (ZSqrt2.add x y) :=
  ⟨fun ht => by have := hx.1 ht; have := hy.1 ht; change x.b + y.b = 0; omega,
   fun hf => by have := hx.2 hf; have := hy.2 hf; change x.a + y.a = 0; omega⟩

private theorem bd_z2HasParity_sub (p : Bool) (x y : ZSqrt2)
    (hx : z2HasParity p x) (hy : z2HasParity p y) : z2HasParity p (ZSqrt2.sub x y) :=
  ⟨fun ht => by have := hx.1 ht; have := hy.1 ht; change x.b - y.b = 0; omega,
   fun hf => by have := hx.2 hf; have := hy.2 hf; change x.a - y.a = 0; omega⟩

private theorem bd_z2HasParity_mul (p q : Bool) (x y : ZSqrt2)
    (hx : z2HasParity p x) (hy : z2HasParity q y) :
    z2HasParity (p == q) (ZSqrt2.mul x y) := by
  cases x with | mk xa xb =>
  cases y with | mk ya yb =>
  cases p <;> cases q
  · refine ⟨fun _ => ?_, fun h => absurd h (by decide)⟩
    have hxa : xa = 0 := hx.2 rfl; have hya : ya = 0 := hy.2 rfl
    change xa * yb + xb * ya = 0; rw [hxa, hya, Int.zero_mul, Int.mul_zero]; rfl
  · refine ⟨fun h => absurd h (by decide), fun _ => ?_⟩
    have hxa : xa = 0 := hx.2 rfl; have hyb : yb = 0 := hy.1 rfl
    change xa * ya + 2 * xb * yb = 0; rw [hxa, hyb, Int.zero_mul, Int.mul_zero]; rfl
  · refine ⟨fun h => absurd h (by decide), fun _ => ?_⟩
    have hxb : xb = 0 := hx.1 rfl; have hya : ya = 0 := hy.2 rfl
    change xa * ya + 2 * xb * yb = 0; rw [hxb, hya, Int.mul_zero, Int.mul_zero, Int.zero_mul]; rfl
  · refine ⟨fun _ => ?_, fun h => absurd h (by decide)⟩
    have hxb : xb = 0 := hx.1 rfl; have hyb : yb = 0 := hy.1 rfl
    change xa * yb + xb * ya = 0; rw [hxb, hyb, Int.mul_zero, Int.zero_mul]; rfl

private theorem bd_sum5_parity (p : Bool) (f : Fin 5 → ZSqrt2)
    (hf : ∀ k : Fin 5, z2HasParity p (f k)) : z2HasParity p (sum5 f) :=
  bd_z2HasParity_add p _ _
    (bd_z2HasParity_add p _ _
      (bd_z2HasParity_add p _ _
        (bd_z2HasParity_add p _ _ (hf ⟨0, by decide⟩) (hf ⟨1, by decide⟩))
        (hf ⟨2, by decide⟩)) (hf ⟨3, by decide⟩)) (hf ⟨4, by decide⟩)

private theorem bd_bool_beq_trans (a k b : Bool) : ((a == k) == (k == b)) = (a == b) := by
  cases a <;> cases k <;> cases b <;> rfl

private theorem bd_bool_beq_cancel (a k : Bool) : ((a == k) == k) = a := by
  cases a <;> cases k <;> rfl

private theorem bd_mat5Graded_vec (A : Mat5) (v : Vec5)
    (hA : mat5Graded A) (hv : vec5Graded v) : vec5Graded (mat5Vec A v) := by
  intro i; apply bd_sum5_parity; intro k
  have hm := bd_z2HasParity_mul _ _ _ _ (hA i k) (hv k)
  rw [bd_bool_beq_cancel] at hm; exact hm

private theorem bd_mat5Graded_mul (A B : Mat5)
    (hA : mat5Graded A) (hB : mat5Graded B) : mat5Graded (mat5Mul A B) := by
  intro i j; apply bd_sum5_parity; intro k
  have hm := bd_z2HasParity_mul _ _ _ _ (hA i k) (hB k j)
  rw [bd_bool_beq_trans] at hm; exact hm

/-- Headline Theorem 1 (Exact Gram-Center Contraction & Lorentz Height Formula):
    `(2 B) c_0 = -2 e_4`, so for EVERY `v : Vec5` and EVERY `g : Mat5`:
    `2 B(v, c_0) = -2 v_4`, `H_2(g) = 2 (g c_0)_4`, `H_2(I_5) = 2`, and `H_2(k_a) = 6` (`∀ a`). -/
theorem thm_bd_twiceForm_baseCenter_and_height :
    mat5Vec twiceGram baseCenter =
      mkVec5 ZSqrt2.zero ZSqrt2.zero ZSqrt2.zero ZSqrt2.zero (ZSqrt2.ofInt (-2)) ∧
    (∀ v : Vec5, twiceForm v baseCenter = ZSqrt2.scale (-2) (v ⟨4, by decide⟩)) ∧
    (∀ g : Mat5, lorentzHeightZ2 g = ZSqrt2.scale 2 (mat5Vec g baseCenter ⟨4, by decide⟩)) ∧
    lorentzHeightZ2 mat5Id = ZSqrt2.ofInt 2 ∧
    (∀ a : Fin 24, lorentzHeightZ2 (transport a) = ZSqrt2.ofInt 6) := by
  have hGramC0 : mat5Vec twiceGram baseCenter =
      mkVec5 ZSqrt2.zero ZSqrt2.zero ZSqrt2.zero ZSqrt2.zero (ZSqrt2.ofInt (-2)) :=
    bd_vec5_ext _ _ (by decide)
  have hTF : ∀ v : Vec5, twiceForm v baseCenter = ZSqrt2.scale (-2) (v ⟨4, by decide⟩) := by
    intro v; unfold twiceForm dot5; rw [hGramC0]
    change ZSqrt2.add (ZSqrt2.add (ZSqrt2.add (ZSqrt2.add
        (ZSqrt2.mul (v ⟨0, by decide⟩) ZSqrt2.zero) (ZSqrt2.mul (v ⟨1, by decide⟩) ZSqrt2.zero))
        (ZSqrt2.mul (v ⟨2, by decide⟩) ZSqrt2.zero)) (ZSqrt2.mul (v ⟨3, by decide⟩) ZSqrt2.zero))
        (ZSqrt2.mul (v ⟨4, by decide⟩) (ZSqrt2.ofInt (-2))) = ZSqrt2.scale (-2) (v ⟨4, by decide⟩)
    rw [bd_z2_mul_zero, bd_z2_mul_zero, bd_z2_mul_zero, bd_z2_mul_zero,
        bd_z2_add_zero, bd_z2_add_zero, bd_z2_add_zero, bd_z2_zero_add, bd_z2_mul_neg2]
  have hH : ∀ g : Mat5, lorentzHeightZ2 g = ZSqrt2.scale 2 (mat5Vec g baseCenter ⟨4, by decide⟩) := by
    intro g; unfold lorentzHeightZ2; rw [hTF, bd_z2_neg_scale]; rfl
  refine ⟨hGramC0, hTF, hH, by decide, ?_⟩
  intro a; unfold lorentzHeightZ2; rw [thm_coxeter_transport_preserves_lorentz.2 a]; decide

/-- Headline Theorem 2 (Universal Antipodal Center Sum `g k_a c_0 + g k_{-a} c_0 = 6 g c_0`):
    across ALL 24 facet pairs `n_a + n_{-a} = 2 c_0`, `k_a c_0 + k_{-a} c_0 = 6 c_0`, and by
    matrix linearity `g k_a c_0 + g k_{-a} c_0 = 6 g c_0` holds for EVERY `g : Mat5`! -/
theorem thm_bd_coxeter_antipodal_sum_six :
    (∀ (a : Fin 24) (i : Fin 5),
      ZSqrt2.add (facetNormal a i) (facetNormal (oppSlot a) i) = ZSqrt2.scale 2 (baseCenter i)) ∧
    (∀ (a : Fin 24) (i : Fin 5),
      ZSqrt2.add (mat5Vec (transport a) baseCenter i)
                 (mat5Vec (transport (oppSlot a)) baseCenter i) =
        ZSqrt2.scale 6 (baseCenter i)) ∧
    (∀ (g : Mat5) (a : Fin 24) (i : Fin 5),
      ZSqrt2.add (mat5Vec (mat5Mul g (transport a)) baseCenter i)
                 (mat5Vec (mat5Mul g (transport (oppSlot a))) baseCenter i) =
        ZSqrt2.scale 6 (mat5Vec g baseCenter i)) := by
  have hNormSum : ∀ (a : Fin 24) (i : Fin 5),
      ZSqrt2.add (facetNormal a i) (facetNormal (oppSlot a) i) = ZSqrt2.scale 2 (baseCenter i) := by
    decide
  have hBase6 : ∀ (a : Fin 24) (i : Fin 5),
      ZSqrt2.add (mat5Vec (transport a) baseCenter i)
                 (mat5Vec (transport (oppSlot a)) baseCenter i) =
        ZSqrt2.scale 6 (baseCenter i) := by
    intro a i
    rw [bd_transport_baseCenter a, bd_transport_baseCenter (oppSlot a)]
    exact bd_z2_add_scale2 (baseCenter i) (facetNormal a i) (facetNormal (oppSlot a) i) (hNormSum a i)
  refine ⟨hNormSum, hBase6, ?_⟩
  intro g a i
  rw [bd_mat5Vec_mul, bd_mat5Vec_mul, bd_mat5Vec_add]
  have hFun : (fun k => ZSqrt2.add (mat5Vec (transport a) baseCenter k)
      (mat5Vec (transport (oppSlot a)) baseCenter k)) =
      (fun k => ZSqrt2.scale 6 (baseCenter k)) := funext (fun k => hBase6 a k)
  rw [hFun, bd_mat5Vec_scale]

/-- Headline Theorem 3 (Universal Hyperbolic Convexity Identity on Infinite `{3,4,3,4}`):
    for EVERY `g : Mat5` (hence every dock in `O^+(4,1; ℤ[√2])`) and EVERY slot `a : Fin 24`:
    `H_2(g k_a) + H_2(g k_{-a}) = 6 H_2(g)` both in `ℤ[√2]` and on integer heights `lorentzHeight`. -/
theorem thm_bd_hyperbolic_height_convexity :
    (∀ (g : Mat5) (a : Fin 24),
      ZSqrt2.add (lorentzHeightZ2 (mat5Mul g (transport a)))
                 (lorentzHeightZ2 (mat5Mul g (transport (oppSlot a)))) =
        ZSqrt2.scale 6 (lorentzHeightZ2 g)) ∧
    (∀ (g : Mat5) (a : Fin 24),
      lorentzHeight (mat5Mul g (transport a)) + lorentzHeight (mat5Mul g (transport (oppSlot a))) =
        6 * lorentzHeight g) := by
  have hZ2 : ∀ (g : Mat5) (a : Fin 24),
      ZSqrt2.add (lorentzHeightZ2 (mat5Mul g (transport a)))
                 (lorentzHeightZ2 (mat5Mul g (transport (oppSlot a)))) =
        ZSqrt2.scale 6 (lorentzHeightZ2 g) := by
    intro g a
    have hH := thm_bd_twiceForm_baseCenter_and_height.2.2.1
    rw [hH, hH, hH, bd_z2_scale_add,
        thm_bd_coxeter_antipodal_sum_six.2.2 g a ⟨4, by decide⟩,
        bd_z2_scale_scale, bd_z2_scale_scale]
    rfl
  exact ⟨hZ2, fun g a => congrArg ZSqrt2.a (hZ2 g a)⟩

private theorem bd_z2_mul_comm (x y : ZSqrt2) : ZSqrt2.mul x y = ZSqrt2.mul y x := by
  cases x with | mk xa xb =>
  cases y with | mk ya yb =>
  simp only [ZSqrt2.mul, ZSqrt2.mk.injEq]
  rw [Int.mul_comm xa ya, Int.mul_comm xa yb, Int.mul_comm xb ya,
      Int.mul_assoc 2 xb yb, Int.mul_comm xb yb, ← Int.mul_assoc 2 yb xb]
  exact ⟨by omega, by omega⟩

private theorem bd_z2_scale_mul_left (c : Int) (x y : ZSqrt2) :
    ZSqrt2.mul (ZSqrt2.scale c x) y = ZSqrt2.scale c (ZSqrt2.mul x y) := by
  rw [bd_z2_mul_comm, bd_z2_mul_scale, bd_z2_mul_comm]

private theorem bd_z2HasParity_scale (p : Bool) (c : Int) (x : ZSqrt2)
    (hx : z2HasParity p x) : z2HasParity p (ZSqrt2.scale c x) :=
  ⟨fun ht => by have h := hx.1 ht; change c * x.b = 0; rw [h, Int.mul_zero],
   fun hf => by have h := hx.2 hf; change c * x.a = 0; rw [h, Int.mul_zero]⟩

private theorem bd_dot5_add_left (u v w : Vec5) :
    dot5 (fun i => ZSqrt2.add (u i) (v i)) w = ZSqrt2.add (dot5 u w) (dot5 v w) := by
  unfold dot5; rw [← bd_sum5_add]; apply congrArg sum5; funext k; exact bd_z2_add_mul _ _ _

private theorem bd_dot5_add_right (u v w : Vec5) :
    dot5 u (fun i => ZSqrt2.add (v i) (w i)) = ZSqrt2.add (dot5 u v) (dot5 u w) := by
  unfold dot5; rw [← bd_sum5_add]; apply congrArg sum5; funext k; exact bd_z2_mul_add _ _ _

private theorem bd_dot5_scale_left (c : Int) (u v : Vec5) :
    dot5 (fun i => ZSqrt2.scale c (u i)) v = ZSqrt2.scale c (dot5 u v) := by
  unfold dot5; rw [← bd_sum5_scale]; apply congrArg sum5; funext k; exact bd_z2_scale_mul_left _ _ _

private theorem bd_dot5_scale_right (c : Int) (u v : Vec5) :
    dot5 u (fun i => ZSqrt2.scale c (v i)) = ZSqrt2.scale c (dot5 u v) := by
  unfold dot5; rw [← bd_sum5_scale]; apply congrArg sum5; funext k; exact bd_z2_mul_scale _ _ _

private theorem bd_twiceForm_symm (u v : Vec5) : twiceForm u v = twiceForm v u := by
  unfold twiceForm dot5 mat5Vec
  have hSym := thm_coxeter_gram_and_center.1
  have hL : sum5 (fun i => ZSqrt2.mul (u i) (sum5 (fun j => ZSqrt2.mul (twiceGram i j) (v j)))) =
      sum5 (fun i => sum5 (fun j => ZSqrt2.mul (u i) (ZSqrt2.mul (twiceGram i j) (v j)))) := by
    apply congrArg sum5; funext i; rw [← bd_sum5_mul_left]
  have hR : sum5 (fun j => ZSqrt2.mul (v j) (sum5 (fun i => ZSqrt2.mul (twiceGram j i) (u i)))) =
      sum5 (fun j => sum5 (fun i => ZSqrt2.mul (u i) (ZSqrt2.mul (twiceGram i j) (v j)))) := by
    apply congrArg sum5; funext j; rw [← bd_sum5_mul_left]
    apply congrArg sum5; funext i
    have hT : twiceGram j i = twiceGram i j := congrFun (congrFun hSym i) j
    rw [hT, bd_z2_mul_comm (twiceGram i j) (u i), ← bd_z2_mul_assoc,
        bd_z2_mul_comm (v j) (u i), bd_z2_mul_assoc, bd_z2_mul_comm (v j) (twiceGram i j)]
  rw [hL, bd_sum5_comm, hR]

private theorem bd_dot5_mat5Vec_left (A : Mat5) (u w : Vec5) :
    dot5 (mat5Vec A u) w = dot5 u (mat5Vec (mat5Transpose A) w) := by
  unfold dot5 mat5Vec mat5Transpose
  have hL : sum5 (fun i => ZSqrt2.mul (sum5 (fun k => ZSqrt2.mul (A i k) (u k))) (w i)) =
      sum5 (fun i => sum5 (fun k => ZSqrt2.mul (u k) (ZSqrt2.mul (A i k) (w i)))) := by
    apply congrArg sum5; funext i; rw [← bd_sum5_mul_right]
    apply congrArg sum5; funext k; rw [bd_z2_mul_comm (A i k) (u k), bd_z2_mul_assoc]
  have hR : sum5 (fun k => ZSqrt2.mul (u k) (sum5 (fun i => ZSqrt2.mul (A i k) (w i)))) =
      sum5 (fun k => sum5 (fun i => ZSqrt2.mul (u k) (ZSqrt2.mul (A i k) (w i)))) := by
    apply congrArg sum5; funext k; rw [← bd_sum5_mul_left]
  rw [hL, bd_sum5_comm, hR]

private theorem bd_twiceForm_orth (A : Mat5)
    (hA : mat5Mul (mat5Transpose A) (mat5Mul twiceGram A) = twiceGram) (u v : Vec5) :
    twiceForm (mat5Vec A u) (mat5Vec A v) = twiceForm u v := by
  unfold twiceForm
  rw [bd_dot5_mat5Vec_left, ← bd_mat5Vec_mul twiceGram A v,
      ← bd_mat5Vec_mul (mat5Transpose A) (mat5Mul twiceGram A) v, hA]

private theorem bd_int_sq_lin (p q x y : Int) :
    (p * x - q * y) * (p * x - q * y) =
      (p * p) * (x * x) - 2 * ((p * q) * (x * y)) + (q * q) * (y * y) := by
  rw [Int.sub_mul, Int.mul_sub, Int.mul_sub]
  have h1 : (p * x) * (p * x) = (p * p) * (x * x) := by
    rw [Int.mul_assoc p x (p * x), ← Int.mul_assoc x p x, Int.mul_comm x p,
        Int.mul_assoc p x x, ← Int.mul_assoc p p (x * x)]
  have h2 : (q * y) * (q * y) = (q * q) * (y * y) := by
    rw [Int.mul_assoc q y (q * y), ← Int.mul_assoc y q y, Int.mul_comm y q,
        Int.mul_assoc q y y, ← Int.mul_assoc q q (y * y)]
  have h3 : (p * x) * (q * y) = (p * q) * (x * y) := by
    rw [Int.mul_assoc p x (q * y), ← Int.mul_assoc x q y, Int.mul_comm x q,
        Int.mul_assoc q x y, ← Int.mul_assoc p q (x * y)]
  have h4 : (q * y) * (p * x) = (p * q) * (x * y) := by
    rw [Int.mul_comm (q * y) (p * x), h3]
  rw [h1, h2, h3, h4]; omega

/-- Exact Cholesky positivity of the `[3,4,3,4]` Lorentz form on the spacelike slice `w_4 = 0`:
    `6 (2 B(w, w)).a = 3(2a_0-a_1)^2 + (3a_1-4b_2)^2 + 2(2b_2-3b_3)^2 + 6 b_3^2 ≥ 0`. -/
private theorem bd_graded_zero4_twiceForm_nonneg (w : Vec5)
    (hw : vec5Graded w) (hw4 : (w ⟨4, by decide⟩).a = 0) :
    0 ≤ (twiceForm w w).a := by
  cases h0 : w ⟨0, by decide⟩ with | mk a0 b0 =>
  cases h1 : w ⟨1, by decide⟩ with | mk a1 b1 =>
  cases h2 : w ⟨2, by decide⟩ with | mk a2 b2 =>
  cases h3 : w ⟨3, by decide⟩ with | mk a3 b3 =>
  cases h4 : w ⟨4, by decide⟩ with | mk a4 b4 =>
  have hb0 : b0 = 0 := by have h := (hw ⟨0, by decide⟩).1 rfl; rw [h0] at h; exact h
  have hb1 : b1 = 0 := by have h := (hw ⟨1, by decide⟩).1 rfl; rw [h1] at h; exact h
  have ha2 : a2 = 0 := by have h := (hw ⟨2, by decide⟩).2 rfl; rw [h2] at h; exact h
  have ha3 : a3 = 0 := by have h := (hw ⟨3, by decide⟩).2 rfl; rw [h3] at h; exact h
  have hb4 : b4 = 0 := by have h := (hw ⟨4, by decide⟩).1 rfl; rw [h4] at h; exact h
  have ha4 : a4 = 0 := by rw [h4] at hw4; exact hw4
  subst hb0; subst hb1; subst ha2; subst ha3; subst hb4; subst ha4
  have hGw : mat5Vec twiceGram w =
      mkVec5 ⟨2 * a0 - a1, 0⟩ ⟨-a0 + 2 * a1 - 2 * b2, 0⟩
             ⟨0, -a1 + 2 * b2 - b3⟩ ⟨0, -b2 + 2 * b3⟩ ⟨-2 * b3, 0⟩ := by
    apply bd_vec5_ext; intro i
    match i with
    | ⟨0, _⟩ | ⟨1, _⟩ | ⟨2, _⟩ | ⟨3, _⟩ | ⟨4, _⟩ =>
      simp only [mat5Vec, sum5, twiceGram, mkVec5, h0, h1, h2, h3, h4,
        ZSqrt2.add, ZSqrt2.mul, ZSqrt2.mk.injEq]
      exact ⟨by omega, by omega⟩
  unfold twiceForm dot5
  rw [hGw]
  simp only [sum5, mkVec5, h0, h1, h2, h3, h4, ZSqrt2.add, ZSqrt2.mul, Int.zero_mul]
  have ht0 : a0 * (2 * a0 - a1) = 2 * (a0 * a0) - a0 * a1 := by
    rw [Int.mul_sub, ← Int.mul_assoc a0 2 a0, Int.mul_comm a0 2, Int.mul_assoc 2 a0 a0]
  have ht1 : a1 * (-a0 + 2 * a1 - 2 * b2) = -(a0 * a1) + 2 * (a1 * a1) - 2 * (a1 * b2) := by
    rw [Int.mul_sub, Int.mul_add, Int.mul_neg, Int.mul_comm a1 a0,
        ← Int.mul_assoc a1 2 a1, Int.mul_comm a1 2, Int.mul_assoc 2 a1 a1,
        ← Int.mul_assoc a1 2 b2, Int.mul_comm a1 2, Int.mul_assoc 2 a1 b2]
  have ht2 : 2 * b2 * (-a1 + 2 * b2 - b3) = -2 * (a1 * b2) + 4 * (b2 * b2) - 2 * (b2 * b3) := by
    rw [Int.mul_sub, Int.mul_add, Int.mul_neg, Int.mul_assoc 2 b2 a1, Int.mul_comm b2 a1,
        Int.mul_assoc 2 b2 (2 * b2), ← Int.mul_assoc b2 2 b2, Int.mul_comm b2 2,
        Int.mul_assoc 2 b2 b2, ← Int.mul_assoc 2 2 (b2 * b2), Int.mul_assoc 2 b2 b3]
    omega
  have ht3 : 2 * b3 * (-b2 + 2 * b3) = -2 * (b2 * b3) + 4 * (b3 * b3) := by
    rw [Int.mul_add, Int.mul_neg, Int.mul_assoc 2 b3 b2, Int.mul_comm b3 b2,
        Int.mul_assoc 2 b3 (2 * b3), ← Int.mul_assoc b3 2 b3, Int.mul_comm b3 2,
        Int.mul_assoc 2 b3 b3, ← Int.mul_assoc 2 2 (b3 * b3)]
    omega
  have hs0 : 0 ≤ (2 * a0 - 1 * a1) * (2 * a0 - 1 * a1) := int_sq_nonneg _
  have hs1 : 0 ≤ (3 * a1 - 4 * b2) * (3 * a1 - 4 * b2) := int_sq_nonneg _
  have hs2 : 0 ≤ (2 * b2 - 3 * b3) * (2 * b2 - 3 * b3) := int_sq_nonneg _
  have hs3 : 0 ≤ b3 * b3 := int_sq_nonneg _
  rw [bd_int_sq_lin] at hs0 hs1 hs2
  rw [ht0, ht1, ht2, ht3]
  omega

private theorem bd_twiceForm_lincomb_a (p q : Int) (u v : Vec5) :
    (twiceForm (fun i => ZSqrt2.add (ZSqrt2.scale p (u i)) (ZSqrt2.scale q (v i)))
               (fun i => ZSqrt2.add (ZSqrt2.scale p (u i)) (ZSqrt2.scale q (v i)))).a =
      (p * p) * (twiceForm u u).a + (p * q) * (twiceForm u v).a +
      ((p * q) * (twiceForm u v).a + (q * q) * (twiceForm v v).a) := by
  have hEq : twiceForm (fun i => ZSqrt2.add (ZSqrt2.scale p (u i)) (ZSqrt2.scale q (v i)))
                       (fun i => ZSqrt2.add (ZSqrt2.scale p (u i)) (ZSqrt2.scale q (v i))) =
      ZSqrt2.add
        (ZSqrt2.add (ZSqrt2.scale (p * p) (twiceForm u u))
                    (ZSqrt2.scale (p * q) (twiceForm u v)))
        (ZSqrt2.add (ZSqrt2.scale (p * q) (twiceForm u v))
                    (ZSqrt2.scale (q * q) (twiceForm v v))) := by
    unfold twiceForm
    have hGw : mat5Vec twiceGram (fun i => ZSqrt2.add (ZSqrt2.scale p (u i)) (ZSqrt2.scale q (v i))) =
        fun i => ZSqrt2.add (ZSqrt2.scale p (mat5Vec twiceGram u i))
                            (ZSqrt2.scale q (mat5Vec twiceGram v i)) := by
      apply bd_vec5_ext; intro i
      rw [← bd_mat5Vec_add, bd_mat5Vec_scale, bd_mat5Vec_scale]
    rw [hGw,
        bd_dot5_add_left, bd_dot5_add_right, bd_dot5_add_right,
        bd_dot5_scale_left, bd_dot5_scale_left, bd_dot5_scale_left, bd_dot5_scale_left,
        bd_dot5_scale_right, bd_dot5_scale_right, bd_dot5_scale_right, bd_dot5_scale_right,
        bd_z2_scale_scale, bd_z2_scale_scale, bd_z2_scale_scale, bd_z2_scale_scale,
        Int.mul_comm q p]
    have hSym : dot5 v (mat5Vec twiceGram u) = dot5 u (mat5Vec twiceGram v) :=
      bd_twiceForm_symm v u
    rw [hSym]
  exact congrArg ZSqrt2.a hEq

private theorem bd_future_sheet_step (u v : Vec5)
    (huG : vec5Graded u) (hvG : vec5Graded v)
    (huQ : (twiceForm u u).a = -2) (hvQ : (twiceForm v v).a = -2)
    (hu4 : (u ⟨4, by decide⟩).a ≥ 1) (hNeg : (twiceForm u v).a < 0) :
    (v ⟨4, by decide⟩).a ≥ 1 := by
  if hvPos : (v ⟨4, by decide⟩).a ≥ 1 then exact hvPos
  else if hv0 : (v ⟨4, by decide⟩).a = 0 then
    have hGe := bd_graded_zero4_twiceForm_nonneg v hvG hv0
    omega
  else
    let p : Int := -(v ⟨4, by decide⟩).a
    let q : Int := (u ⟨4, by decide⟩).a
    have hpGe1 : p ≥ 1 := by change -(v ⟨4, by decide⟩).a ≥ 1; omega
    have hqGe1 : q ≥ 1 := hu4
    let w : Vec5 := fun i => ZSqrt2.add (ZSqrt2.scale p (u i)) (ZSqrt2.scale q (v i))
    have hwG : vec5Graded w := fun i =>
      bd_z2HasParity_add _ _ _ (bd_z2HasParity_scale _ p _ (huG i))
        (bd_z2HasParity_scale _ q _ (hvG i))
    have hw4 : (w ⟨4, by decide⟩).a = 0 := by
      change -(v ⟨4, by decide⟩).a * (u ⟨4, by decide⟩).a +
        (u ⟨4, by decide⟩).a * (v ⟨4, by decide⟩).a = 0
      rw [Int.neg_mul, Int.mul_comm (v ⟨4, by decide⟩).a (u ⟨4, by decide⟩).a]; omega
    have hNonneg := bd_graded_zero4_twiceForm_nonneg w hwG hw4
    have hLC := bd_twiceForm_lincomb_a p q u v
    rw [huQ, hvQ] at hLC
    have hpp : p * p ≥ 1 := by
      have h := Int.mul_nonneg (show 0 ≤ p by omega) (show 0 ≤ p - 1 by omega)
      rw [Int.mul_sub, Int.mul_one] at h; omega
    have hqq : q * q ≥ 1 := by
      have h := Int.mul_nonneg (show 0 ≤ q by omega) (show 0 ≤ q - 1 by omega)
      rw [Int.mul_sub, Int.mul_one] at h; omega
    have hpq : p * q ≥ 1 := by
      have h := Int.mul_nonneg (show 0 ≤ p by omega) (show 0 ≤ q - 1 by omega)
      rw [Int.mul_sub, Int.mul_one] at h; omega
    have hCross : (p * q) * (twiceForm u v).a ≤ 0 := by
      have h := Int.mul_nonneg (show 0 ≤ p * q by omega) (show 0 ≤ -(twiceForm u v).a by omega)
      rw [Int.mul_neg] at h; omega
    change 0 ≤ (twiceForm (fun i => ZSqrt2.add (ZSqrt2.scale p (u i)) (ZSqrt2.scale q (v i)))
                          (fun i => ZSqrt2.add (ZSqrt2.scale p (u i)) (ZSqrt2.scale q (v i)))).a
      at hNonneg
    omega

/-- Headline Theorem 4 (Exact `ℤ_2`-Grading, Pure Even Integrality & Orthochronous Positivity `H_2(w) ≥ 2`):
    for EVERY finite Coxeter walk `w : List (Fin 24)` across infinite `{3,4,3,4}`,
    `evalTransportWord w` preserves the `ℤ_2`-grading, `(H_2(w)).b = 0` (zero `√2` defect),
    `H_2(w) = 2 * (c_w)_4` is an exact even integer, AND `H_2(w) ≥ 2` (unconditional future-sheet
    positivity via the `[3,4,3,4]` Cholesky identity, discharging `hPos` across all of `O^+(4,1; ℤ[√2])`). -/
theorem thm_bd_word_height_pure_even_integer (w : List (Fin 24)) :
    mat5Graded (evalTransportWord w) ∧
    (lorentzHeightZ2 (evalTransportWord w)).b = 0 ∧
    lorentzHeight (evalTransportWord w) =
      2 * (mat5Vec (evalTransportWord w) baseCenter ⟨4, by decide⟩).a ∧
    lorentzHeight (evalTransportWord w) ≥ 2 := by
  have hId : mat5Graded mat5Id := by decide
  have hG : mat5Graded twiceGram := by decide
  have hZ : mat5Graded centralInversion := by decide
  have hC0 : vec5Graded baseCenter := by decide
  have hFN : ∀ a : Fin 24, vec5Graded (facetNormal a) := by decide
  have hTr : ∀ a : Fin 24, mat5Graded (transport a) := by
    intro a
    apply bd_mat5Graded_mul _ _ _ hZ
    intro i j
    have hr := bd_mat5Graded_vec twiceGram (facetNormal a) hG (hFN a)
    exact bd_z2HasParity_sub _ _ _ (hId i j) (bd_z2HasParity_mul _ _ _ _ (hFN a i) (hr j))
  have hWord : ∀ u : List (Fin 24), mat5Graded (evalTransportWord u) := by
    intro u
    induction u with
    | nil => exact hId
    | cons a rest ih => exact bd_mat5Graded_mul (transport a) (evalTransportWord rest) (hTr a) ih
  have hPos4 : ∀ u : List (Fin 24), (mat5Vec (evalTransportWord u) baseCenter ⟨4, by decide⟩).a ≥ 1 := by
    intro u
    induction u with
    | nil => decide
    | cons a rest ih =>
      let cu := mat5Vec (evalTransportWord rest) baseCenter
      let cv := mat5Vec (transport a) cu
      let cu' := mat5Vec (transport a) baseCenter
      have hCvEq : mat5Vec (evalTransportWord (a :: rest)) baseCenter = cv :=
        bd_mat5Vec_mul (transport a) (evalTransportWord rest) baseCenter
      have hu'G : vec5Graded cu' := bd_mat5Graded_vec (transport a) baseCenter (hTr a) hC0
      have hvG : vec5Graded cv := by
        rw [← hCvEq]
        exact bd_mat5Graded_vec (evalTransportWord (a :: rest)) baseCenter (hWord (a :: rest)) hC0
      have hu'Q : (twiceForm cu' cu').a = -2 := by
        change (twiceForm (mat5Vec (transport a) baseCenter) (mat5Vec (transport a) baseCenter)).a = -2
        rw [bd_twiceForm_orth (transport a) (thm_coxeter_transport_preserves_lorentz.1 a),
            thm_coxeter_gram_and_center.2.2.1]; rfl
      have hvQ : (twiceForm cv cv).a = -2 := by
        rw [← hCvEq,
            bd_twiceForm_orth (evalTransportWord (a :: rest))
              (thm_coxeter_word_lorentz_and_inverse (a :: rest)).1,
            thm_coxeter_gram_and_center.2.2.1]; rfl
      have hu'4 : (cu' ⟨4, by decide⟩).a ≥ 1 := by
        have h6 := thm_bd_twiceForm_baseCenter_and_height.2.2.2.2 a
        rw [thm_bd_twiceForm_baseCenter_and_height.2.2.1 (transport a)] at h6
        have ha := congrArg ZSqrt2.a h6
        change 2 * (cu' ⟨4, by decide⟩).a = 6 at ha
        omega
      have hNeg : (twiceForm cu' cv).a < 0 := by
        have hEq : twiceForm cu' cv = twiceForm baseCenter cu :=
          bd_twiceForm_orth (transport a) (thm_coxeter_transport_preserves_lorentz.1 a) baseCenter cu
        rw [bd_twiceForm_symm baseCenter cu, thm_bd_twiceForm_baseCenter_and_height.2.1 cu] at hEq
        have ha := congrArg ZSqrt2.a hEq
        have hCu4 : (cu ⟨4, by decide⟩).a ≥ 1 := ih
        change (twiceForm cu' cv).a = -2 * (cu ⟨4, by decide⟩).a at ha
        omega
      rw [hCvEq]
      exact bd_future_sheet_step cu' cv hu'G hvG hu'Q hvQ hu'4 hNeg
  have hW := hWord w
  have hB0 : (mat5Vec (evalTransportWord w) baseCenter ⟨4, by decide⟩).b = 0 :=
    (bd_mat5Graded_vec (evalTransportWord w) baseCenter hW hC0 ⟨4, by decide⟩).1 rfl
  have hH := thm_bd_twiceForm_baseCenter_and_height.2.2.1 (evalTransportWord w)
  have hEq2 : lorentzHeight (evalTransportWord w) =
      2 * (mat5Vec (evalTransportWord w) baseCenter ⟨4, by decide⟩).a := by
    unfold lorentzHeight; rw [hH]; rfl
  have hGe2 : lorentzHeight (evalTransportWord w) ≥ 2 := by
    have hp := hPos4 w; omega
  refine ⟨hW, ?_, hEq2, hGe2⟩
  rw [hH]; change 2 * (mat5Vec (evalTransportWord w) baseCenter ⟨4, by decide⟩).b = 0
  rw [hB0]; rfl


/-! ## Section 2: Frontier Separation, Pell Ballistic Recurrence & Compacton No-Go -/

private theorem bd_nat_mul_le_left (c a b : Nat) (h : a ≤ b) : c * a ≤ c * b := by
  induction c with
  | zero => simp only [Nat.zero_mul]; exact Nat.le_refl 0
  | succ k ih => rw [Nat.succ_mul, Nat.succ_mul]; omega

private theorem bd_nat_mul_le_right (a b c : Nat) (h : a ≤ b) : a * c ≤ b * c := by
  rw [Nat.mul_comm a c, Nat.mul_comm b c]; exact bd_nat_mul_le_left c a b h

private theorem bd_nat_le_of_mul_le_mul_right (a b c : Nat) (hc : c > 0)
    (h : a * c ≤ b * c) : a ≤ b := by
  if hab : a ≤ b then exact hab
  else
    have hm := bd_nat_mul_le_right (b + 1) a c (by omega)
    rw [Nat.add_mul, Nat.one_mul] at hm; omega

private theorem bd_pow5_ge_succ (n : Nat) : 5 ^ n ≥ n + 1 := by
  induction n with
  | zero => decide
  | succ k ih => rw [Nat.pow_succ]; omega

/-- Exact Pell-Chebyshev ballistic height sequence `a_0 = 1, a_1 = 1, a_{n+2} = 6 a_{n+1} - a_n`
    (`1, 1, 5, 29, 169, 985, ...`, asymptotic growth `(3 + 2 √2)^n = exp(n arccosh 3)`). -/
def ballisticSeq : Nat → Nat
  | 0 => 1
  | 1 => 1
  | n + 2 => 6 * ballisticSeq (n + 1) - ballisticSeq n

/-- Headline Theorem 5 (Frontier Arrival-Set Antipodal Separation & `5×` Outward Leap):
    at any maximal-height dock `g` with `H_2(g) = mCurr ≥ mPrev` (`mCurr > 0`),
    every arrival slot `a` coming from `H_2(g k_{-a}) ≤ mPrev` leaps straight through to
    `H_2(g k_a) ≥ 6 mCurr - mPrev ≥ 5 mCurr > mCurr ≥ mPrev`, so NO antipodal pair `(a, -a)`
    can both lie in the arrival set (`A_* ∩ (-A_*) = ∅`). -/
theorem thm_bd_frontier_no_antipodal_arrival_pair (g : Mat5) (mCurr mPrev : Int)
    (hPos : mCurr > 0) (hMono : mPrev ≤ mCurr) (hHeight : lorentzHeight g = mCurr)
    (a : Fin 24) :
    (lorentzHeight (mat5Mul g (transport (oppSlot a))) ≤ mPrev →
      lorentzHeight (mat5Mul g (transport a)) ≥ 6 * mCurr - mPrev ∧
      lorentzHeight (mat5Mul g (transport a)) ≥ 5 * mCurr ∧
      lorentzHeight (mat5Mul g (transport a)) > mCurr ∧
      ¬ (lorentzHeight (mat5Mul g (transport a)) ≤ mPrev)) ∧
    ¬ (lorentzHeight (mat5Mul g (transport a)) ≤ mPrev ∧
       lorentzHeight (mat5Mul g (transport (oppSlot a))) ≤ mPrev) := by
  have hConv := thm_bd_hyperbolic_height_convexity.2 g a
  rw [hHeight] at hConv
  refine ⟨fun hArr => ⟨by omega, by omega, by omega, by omega⟩, fun hBoth => by omega⟩

/-- Headline Theorem 6 (Exact Pell-Chebyshev Ballistic Sequence Growth & Cassini Invariant):
    proves `a_{n+2} + a_n = 6 a_{n+1}`, `a_{n+2} ≥ 5 a_{n+1} > a_{n+1}`, `a_{n+1} ≥ 5^n`,
    the Pell-Cassini invariant `a_{n+1}^2 + a_n^2 + 4 = 6 a_{n+1} a_n`, and strict unboundedness. -/
theorem thm_bd_ballistic_recurrence_strict_growth :
    (ballisticSeq 0 = 1 ∧ ballisticSeq 1 = 1 ∧ ballisticSeq 2 = 5 ∧
     ballisticSeq 3 = 29 ∧ ballisticSeq 4 = 169 ∧ ballisticSeq 5 = 985) ∧
    (∀ n : Nat, ballisticSeq (n + 2) + ballisticSeq n = 6 * ballisticSeq (n + 1)) ∧
    (∀ n : Nat,
      ballisticSeq (n + 1) ≥ ballisticSeq n ∧
      ballisticSeq (n + 2) ≥ 5 * ballisticSeq (n + 1) ∧
      ballisticSeq (n + 2) > ballisticSeq (n + 1)) ∧
    (∀ n : Nat, ballisticSeq (n + 1) ≥ 5 ^ n) ∧
    (∀ n : Nat,
      ballisticSeq (n + 1) * ballisticSeq (n + 1) + ballisticSeq n * ballisticSeq n + 4 =
        6 * ballisticSeq (n + 1) * ballisticSeq n) ∧
    (∀ B : Nat, ∃ n : Nat, ballisticSeq n > B) := by
  have hMono : ∀ n : Nat,
      ballisticSeq n ≥ 1 ∧ ballisticSeq (n + 1) ≥ ballisticSeq n ∧
      ballisticSeq (n + 2) + ballisticSeq n = 6 * ballisticSeq (n + 1) ∧
      ballisticSeq (n + 2) ≥ 5 * ballisticSeq (n + 1) := by
    intro n
    induction n with
    | zero => decide
    | succ k ih =>
      obtain ⟨hPos, hLe, _, h5⟩ := ih
      have hNextRec : ballisticSeq (k + 3) + ballisticSeq (k + 1) = 6 * ballisticSeq (k + 2) := by
        change (6 * ballisticSeq (k + 2) - ballisticSeq (k + 1)) + ballisticSeq (k + 1) =
          6 * ballisticSeq (k + 2)
        omega
      change ballisticSeq (k + 1) ≥ 1 ∧ ballisticSeq (k + 2) ≥ ballisticSeq (k + 1) ∧
        ballisticSeq (k + 3) + ballisticSeq (k + 1) = 6 * ballisticSeq (k + 2) ∧
        ballisticSeq (k + 3) ≥ 5 * ballisticSeq (k + 2)
      exact ⟨by omega, by omega, hNextRec, by omega⟩
  have hPow : ∀ n : Nat, ballisticSeq (n + 1) ≥ 5 ^ n := by
    intro n
    induction n with
    | zero => decide
    | succ k ih =>
      have h5 := (hMono k).2.2.2
      change ballisticSeq (k + 2) ≥ 5 ^ (k + 1)
      rw [Nat.pow_succ]; omega
  have hCassini : ∀ n : Nat,
      ballisticSeq (n + 1) * ballisticSeq (n + 1) + ballisticSeq n * ballisticSeq n + 4 =
        6 * ballisticSeq (n + 1) * ballisticSeq n := by
    intro n
    induction n with
    | zero => decide
    | succ k ih =>
      have hRec := (hMono k).2.2.1
      have h1 := congrArg (fun t => t * ballisticSeq (k + 2)) hRec
      have h2 := congrArg (fun t => t * ballisticSeq k) hRec
      rw [Nat.add_mul] at h1 h2
      have hComm : ballisticSeq k * ballisticSeq (k + 2) = ballisticSeq (k + 2) * ballisticSeq k :=
        Nat.mul_comm _ _
      have hRhs : (6 * ballisticSeq (k + 1)) * ballisticSeq (k + 2) =
          6 * ballisticSeq (k + 2) * ballisticSeq (k + 1) := by
        rw [Nat.mul_assoc, Nat.mul_comm (ballisticSeq (k + 1)) (ballisticSeq (k + 2)), ← Nat.mul_assoc]
      change ballisticSeq (k + 2) * ballisticSeq (k + 2) +
          ballisticSeq (k + 1) * ballisticSeq (k + 1) + 4 =
        6 * ballisticSeq (k + 2) * ballisticSeq (k + 1)
      omega
  refine ⟨by decide, fun n => (hMono n).2.2.1, fun n => ?_, hPow, hCassini, ?_⟩
  · have h := hMono n; exact ⟨h.2.1, h.2.2.2, by omega⟩
  · intro B; refine ⟨B + 2, ?_⟩
    have hp : ballisticSeq (B + 2) ≥ 5 ^ (B + 1) := hPow (B + 1)
    have h5 := bd_pow5_ge_succ (B + 1); omega

private theorem bd_exists_turnaround_aux :
    ∀ (k : Nat) (M : Nat → Nat), M 0 ≤ k → ∃ t0 : Nat, M (t0 + 1) ≥ M t0 := by
  intro k
  induction k with
  | zero => intro M h0; exact ⟨0, by omega⟩
  | succ k ih =>
    intro M h0
    if h1 : M 1 ≥ M 0 then exact ⟨0, h1⟩
    else
      have hStep : (fun t => M (t + 1)) 0 ≤ k := by change M 1 ≤ k; omega
      obtain ⟨t', ht'⟩ := ih (fun t => M (t + 1)) hStep
      exact ⟨t' + 1, ht'⟩

/-- Headline Theorem 7 (Abstract Ballistic Wavefront Expansion & No-Periodicity Theorem, All `T ≥ 1`):
    ANY positive trajectory `M : Nat → Nat` obeying the hyperbolic leap bound
    `M(t + 1) ≥ M(t) → M(t + 2) + M(t) ≥ 6 M(t + 1)` reaches a finite turnaround `t_0` after which
    `M(t_0 + n) ≥ M(t_0) * ballisticSeq n`, `M(t_0 + n + 1) ≥ 5^n * M(t_0)`, escapes every finite
    bound `B`, and CANNOT be periodic for ANY period `T ≥ 1`.
    (Instantiating `M(t) = max_{g ∈ activeDocks(U^t ψ)} H_2(g)` on the multi-particle Fock space
    from Theorems 3, 4, 5, 8, and 9 is bridged externally in
    `test/breakthrough/compacton-nogo-and-doublon.ts` and
    `03-bare-qca-compacton-and-scattering-theorem.md`.) -/
theorem thm_bd_ballistic_no_periodic_compacton (M : Nat → Nat)
    (hPos : ∀ t : Nat, M t > 0)
    (hLeap : ∀ t : Nat, M (t + 1) ≥ M t → M (t + 2) + M t ≥ 6 * M (t + 1)) :
    (∃ t0 : Nat,
      M (t0 + 1) ≥ M t0 ∧
      ∀ n : Nat, M (t0 + n) ≥ M t0 * ballisticSeq n ∧ M (t0 + n + 1) ≥ 5 ^ n * M t0) ∧
    (∀ B : Nat, ∃ t : Nat, M t > B) ∧
    (∀ T : Nat, T ≥ 1 → ¬ (∀ t : Nat, M (t + T) = M t)) := by
  obtain ⟨t0, ht0⟩ := bd_exists_turnaround_aux (M 0) M (Nat.le_refl (M 0))
  let N : Nat → Nat := fun n => M (t0 + n)
  have hNPos : ∀ n : Nat, N n > 0 := fun n => hPos (t0 + n)
  have hN1 : N 1 ≥ N 0 := ht0
  have hNLeap : ∀ n : Nat, N (n + 1) ≥ N n → N (n + 2) + N n ≥ 6 * N (n + 1) :=
    fun n hn => hLeap (t0 + n) hn
  have hSeqRec := thm_bd_ballistic_recurrence_strict_growth.2.1
  have hSeqMono := thm_bd_ballistic_recurrence_strict_growth.2.2.1
  have hSeqPow := thm_bd_ballistic_recurrence_strict_growth.2.2.2.1
  have hRatio : ∀ n : Nat,
      N (n + 1) * ballisticSeq n ≥ N n * ballisticSeq (n + 1) ∧
      N (n + 1) ≥ N n ∧ N (n + 2) ≥ 5 * N (n + 1) := by
    have hStep5 : ∀ k : Nat,
        N (k + 2) * ballisticSeq (k + 1) ≥ N (k + 1) * ballisticSeq (k + 2) →
        N (k + 2) ≥ 5 * N (k + 1) := by
      intro k hR
      have haPos : ballisticSeq (k + 1) > 0 := by
        have hp := hSeqPow k; have h5 := bd_pow5_ge_succ k; omega
      have h5Mul := bd_nat_mul_le_left (N (k + 1)) (5 * ballisticSeq (k + 1))
        (ballisticSeq (k + 2)) (hSeqMono k).2.1
      rw [← Nat.mul_assoc, Nat.mul_comm (N (k + 1)) 5] at h5Mul
      exact bd_nat_le_of_mul_le_mul_right (5 * N (k + 1)) (N (k + 2)) (ballisticSeq (k + 1))
        haPos (by omega)
    intro n
    induction n with
    | zero =>
      have hL0 : N 2 + N 0 ≥ 6 * N 1 := hNLeap 0 hN1
      change N 1 * 1 ≥ N 0 * 1 ∧ N 1 ≥ N 0 ∧ N 2 ≥ 5 * N 1
      omega
    | succ k ih =>
      obtain ⟨ihR, ihM, ih5⟩ := ih
      have hL := hNLeap k ihM
      have hMul := bd_nat_mul_le_right (6 * N (k + 1)) (N (k + 2) + N k) (ballisticSeq (k + 1)) hL
      rw [Nat.add_mul, Nat.mul_comm 6 (N (k + 1)), Nat.mul_assoc, ← hSeqRec k, Nat.mul_add] at hMul
      have hNextR : N (k + 2) * ballisticSeq (k + 1) ≥ N (k + 1) * ballisticSeq (k + 2) := by omega
      have hM2 : N (k + 2) ≥ N (k + 1) := by omega
      have hL2 : N (k + 3) + N (k + 1) ≥ 6 * N (k + 2) := hNLeap (k + 1) hM2
      have hRec2 : ballisticSeq (k + 3) + ballisticSeq (k + 1) = 6 * ballisticSeq (k + 2) :=
        hSeqRec (k + 1)
      have hMul2 := bd_nat_mul_le_right (6 * N (k + 2)) (N (k + 3) + N (k + 1))
        (ballisticSeq (k + 2)) hL2
      rw [Nat.add_mul, Nat.mul_comm 6 (N (k + 2)), Nat.mul_assoc, ← hRec2, Nat.mul_add] at hMul2
      have hNextR2 : N (k + 3) * ballisticSeq (k + 2) ≥ N (k + 2) * ballisticSeq (k + 3) := by omega
      have h5Next : N (k + 3) ≥ 5 * N (k + 2) := hStep5 (k + 1) hNextR2
      exact ⟨hNextR, hM2, h5Next⟩
  have hPell : ∀ n : Nat, N n ≥ N 0 * ballisticSeq n := by
    intro n
    induction n with
    | zero => change N 0 ≥ N 0 * 1; omega
    | succ k ih =>
      have hR := (hRatio k).1
      have haPos : ballisticSeq k > 0 := by
        cases k with
        | zero => decide
        | succ m => have hp := hSeqPow m; have h5 := bd_pow5_ge_succ m; omega
      have h1 := bd_nat_mul_le_right (N 0 * ballisticSeq k) (N k) (ballisticSeq (k + 1)) ih
      rw [Nat.mul_assoc, Nat.mul_comm (ballisticSeq k) (ballisticSeq (k + 1)), ← Nat.mul_assoc] at h1
      exact bd_nat_le_of_mul_le_mul_right (N 0 * ballisticSeq (k + 1)) (N (k + 1))
        (ballisticSeq k) haPos (by omega)
  have hExp : ∀ n : Nat, N (n + 1) ≥ 5 ^ n * N 0 := by
    intro n
    induction n with
    | zero => change N 1 ≥ 1 * N 0; omega
    | succ k ih =>
      have h5 := (hRatio k).2.2
      have hMul := bd_nat_mul_le_left 5 (5 ^ k * N 0) (N (k + 1)) ih
      have hPowEq : 5 ^ (k + 1) * N 0 = 5 * (5 ^ k * N 0) := by
        rw [Nat.pow_succ, Nat.mul_comm (5 ^ k) 5, Nat.mul_assoc]
      change N (k + 2) ≥ 5 ^ (k + 1) * N 0
      rw [hPowEq]; omega
  have hStrict : ∀ k : Nat, k ≥ 1 → N (k + 1) > N 1 := by
    intro k hk
    induction k with
    | zero => omega
    | succ m ih =>
      cases m with
      | zero =>
        have h5 : N 2 ≥ 5 * N 1 := (hRatio 0).2.2
        have hp := hNPos 1
        change N 2 > N 1
        omega
      | succ r =>
        have hprev : N (r + 2) > N 1 := ih (by omega)
        have h5 : N (r + 3) ≥ 5 * N (r + 2) := (hRatio (r + 1)).2.2
        change N (r + 3) > N 1
        omega
  refine ⟨⟨t0, ht0, fun n => ⟨hPell n, hExp n⟩⟩, ?_, ?_⟩
  · intro B; refine ⟨t0 + (B + 2), ?_⟩
    have hE : N (B + 2) ≥ 5 ^ (B + 1) * N 0 := hExp (B + 1)
    have hP0 := hNPos 0; have h5 := bd_pow5_ge_succ (B + 1)
    have h1 := bd_nat_mul_le_left (5 ^ (B + 1)) 1 (N 0) (by omega)
    rw [Nat.mul_one] at h1; change N (B + 2) > B; omega
  · intro T hT hPer
    have hGt := hStrict T hT
    have hEq : N (T + 1) = N 1 := by
      change M (t0 + (T + 1)) = M (t0 + 1)
      have hIdx : t0 + (T + 1) = (t0 + 1) + T := by omega
      rw [hIdx]
      exact hPer (t0 + 1)
    omega


/-! ## Section 3: Exact `2^m`-Branch Frontier-Leakage Diagonalization (`Lemma 2`) -/

private theorem bd_eis_mul_comm (x y : Eis) : Eis.mul x y = Eis.mul y x :=
  StarCommRing.mul_comm (R := Eis) x y

private theorem bd_eis_mul_assoc (x y z : Eis) :
    Eis.mul (Eis.mul x y) z = Eis.mul x (Eis.mul y z) :=
  StarCommRing.mul_assoc (R := Eis) x y z

private theorem bd_eis_conj_mul (x y : Eis) :
    Eis.conj (Eis.mul x y) = Eis.mul (Eis.conj x) (Eis.conj y) :=
  StarCommRing.conj_mul (R := Eis) x y

private theorem bd_eis_conj_mul_self (x : Eis) :
    Eis.mul (Eis.conj x) x = Eis.ofInt (Eis.normSq x) := by
  cases x with | mk xa xb =>
  simp only [Eis.mul, Eis.conj, Eis.ofInt, Eis.normSq, Eis.mk.injEq, Int.sub_mul, Int.neg_mul]
  rw [Int.mul_comm xb xa]; exact ⟨by omega, by omega⟩

private theorem bd_eis_ofInt_mul (m n : Int) :
    Eis.mul (Eis.ofInt m) (Eis.ofInt n) = Eis.ofInt (m * n) := by
  simp only [Eis.mul, Eis.ofInt, Eis.mk.injEq, Int.mul_zero, Int.zero_mul]
  exact ⟨by omega, by omega⟩

private theorem bd_eis_normSq_mul (x y : Eis) :
    Eis.normSq (Eis.mul x y) = Eis.normSq x * Eis.normSq y := by
  have h : Eis.ofInt (Eis.normSq (Eis.mul x y)) = Eis.ofInt (Eis.normSq x * Eis.normSq y) := by
    rw [← bd_eis_conj_mul_self, bd_eis_conj_mul, bd_eis_mul_assoc,
        ← bd_eis_mul_assoc (Eis.conj y) x y, bd_eis_mul_comm (Eis.conj y) x,
        bd_eis_mul_assoc x (Eis.conj y) y,
        ← bd_eis_mul_assoc (Eis.conj x) x (Eis.mul (Eis.conj y) y),
        bd_eis_conj_mul_self x, bd_eis_conj_mul_self y, bd_eis_ofInt_mul]
  exact congrArg Eis.a h

private theorem bd_eis_normSq_nonneg (x : Eis) : 0 ≤ Eis.normSq x := by
  cases x with | mk xa xb =>
  have h1 := int_sq_nonneg (2 * xa - xb); have h2 := int_sq_nonneg xb
  have hExp : (2 * xa - xb) * (2 * xa - xb) = 4 * (xa * xa) - 4 * (xa * xb) + xb * xb := by
    rw [Int.sub_mul, Int.mul_sub, Int.mul_sub]
    have ha : (2 * xa) * (2 * xa) = 4 * (xa * xa) := by
      rw [Int.mul_assoc 2 xa (2 * xa), ← Int.mul_assoc xa 2 xa, Int.mul_comm xa 2,
          Int.mul_assoc 2 xa xa, ← Int.mul_assoc 2 2 (xa * xa)]; rfl
    have hb1 : (2 * xa) * xb = 2 * (xa * xb) := Int.mul_assoc 2 xa xb
    have hb2 : xb * (2 * xa) = 2 * (xa * xb) := by rw [Int.mul_comm xb (2 * xa), Int.mul_assoc 2 xa xb]
    rw [ha, hb1, hb2]; omega
  rw [hExp] at h1; change 0 ≤ xa * xa - xa * xb + xb * xb; omega

/-- Exact integer power `b^n` with definitional step `bdPowInt b (n + 1) = b * bdPowInt b n`. -/
def bdPowInt (b : Int) : Nat → Int
  | 0 => 1
  | n + 1 => b * bdPowInt b n

private theorem bd_powInt_add (b : Int) (m n : Nat) :
    bdPowInt b (m + n) = bdPowInt b m * bdPowInt b n := by
  induction m with
  | zero => simp only [Nat.zero_add, bdPowInt, Int.one_mul]
  | succ k ih =>
    rw [Nat.succ_add]; change b * bdPowInt b (k + n) = (b * bdPowInt b k) * bdPowInt b n
    rw [ih, Int.mul_assoc]

private theorem bd_powInt_3_le_4 (n : Nat) :
    0 < bdPowInt 3 n ∧ bdPowInt 3 n ≤ bdPowInt 4 n := by
  induction n with
  | zero => decide
  | succ k ih => change 0 < 3 * bdPowInt 3 k ∧ 3 * bdPowInt 3 k ≤ 4 * bdPowInt 4 k; omega

/-- Exact `2^m`-scaled Eisenstein amplitude of an `m`-line frontier coin branch `bs`:
    `true` = outward transmission `2 C_diag = 1 + ω`, `false` = inward reflection `2 C_off = 1 - ω`. -/
def frontierBranchAmp : List Bool → Eis
  | [] => Eis.one
  | true :: bs => Eis.mul coin2.m00 (frontierBranchAmp bs)
  | false :: bs => Eis.mul coin2.m01 (frontierBranchAmp bs)

/-- All `2^m` coin-choice branches for `m` singly-occupied lines on an antipodal-free frontier dock. -/
def frontierBranches : Nat → List (List Bool)
  | 0 => [[]]
  | m + 1 =>
    (frontierBranches m).map (fun bs => true :: bs) ++
    (frontierBranches m).map (fun bs => false :: bs)

def allInward : List Bool → Bool
  | [] => true
  | true :: _ => false
  | false :: bs => allInward bs

def anyOutward : List Bool → Bool
  | [] => false
  | true :: _ => true
  | false :: bs => anyOutward bs

def sumBranchesIf (p : List Bool → Bool) : List (List Bool) → Int
  | [] => 0
  | bs :: rest =>
    (match p bs with | true => Eis.normSq (frontierBranchAmp bs) | false => 0) +
      sumBranchesIf p rest

def frontierTotalWeight (m : Nat) : Int := sumBranchesIf (fun _ => true) (frontierBranches m)
def frontierInwardWeight (m : Nat) : Int := sumBranchesIf allInward (frontierBranches m)
def frontierOutwardWeight (m : Nat) : Int := sumBranchesIf anyOutward (frontierBranches m)

/-- Predicate stating every configuration `(amp, m)` in a frontier superposition has `1 ≤ m ≤ M`. -/
def activeLinesInRange (M : Nat) : List (Eis × Nat) → Prop
  | [] => True
  | (_, m) :: rest => (1 ≤ m ∧ m ≤ M) ∧ activeLinesInRange M rest

def frontierSuperpositionOutward (M : Nat) : List (Eis × Nat) → Int
  | [] => 0
  | (amp, m) :: rest =>
    Eis.normSq amp * (bdPowInt 4 (M - m) * frontierOutwardWeight m) +
      frontierSuperpositionOutward M rest

def frontierSuperpositionTotal (M : Nat) : List (Eis × Nat) → Int
  | [] => 0
  | (amp, _) :: rest => Eis.normSq amp * bdPowInt 4 M + frontierSuperpositionTotal M rest

private theorem bd_sumBranchesIf_append (p : List Bool → Bool) (xs ys : List (List Bool)) :
    sumBranchesIf p (xs ++ ys) = sumBranchesIf p xs + sumBranchesIf p ys := by
  induction xs with
  | nil => simp only [List.nil_append, sumBranchesIf, Int.zero_add]
  | cons _ _ ih => simp only [List.cons_append, sumBranchesIf]; rw [ih]; omega

private theorem bd_sumBranchesIf_false (xs : List (List Bool)) :
    sumBranchesIf (fun _ => false) xs = 0 := by
  induction xs with
  | nil => rfl
  | cons _ rest ih => change 0 + sumBranchesIf (fun _ => false) rest = 0; rw [ih]; rfl

private theorem bd_sumBranchesIf_map (p q : List Bool → Bool) (b : Bool) (c : Int)
    (hp : ∀ x, p (b :: x) = q x)
    (hc : ∀ x, Eis.normSq (frontierBranchAmp (b :: x)) = c * Eis.normSq (frontierBranchAmp x))
    (xs : List (List Bool)) :
    sumBranchesIf p (xs.map (fun bs => b :: bs)) = c * sumBranchesIf q xs := by
  induction xs with
  | nil => simp only [List.map, sumBranchesIf, Int.mul_zero]
  | cons x rest ih =>
    simp only [List.map, sumBranchesIf, hp x]
    rw [ih]
    cases q x
    · change 0 + c * sumBranchesIf q rest = c * (0 + sumBranchesIf q rest)
      rw [Int.zero_add, Int.zero_add]
    · change Eis.normSq (frontierBranchAmp (b :: x)) + c * sumBranchesIf q rest =
        c * (Eis.normSq (frontierBranchAmp x) + sumBranchesIf q rest)
      rw [hc x, Int.mul_add]

private theorem bd_branchAmp_true_normSq (x : List Bool) :
    Eis.normSq (frontierBranchAmp (true :: x)) = 1 * Eis.normSq (frontierBranchAmp x) := by
  change Eis.normSq (Eis.mul coin2.m00 (frontierBranchAmp x)) = _
  have h1 : Eis.normSq coin2.m00 = 1 := by decide
  rw [bd_eis_normSq_mul, h1]

private theorem bd_branchAmp_false_normSq (x : List Bool) :
    Eis.normSq (frontierBranchAmp (false :: x)) = 3 * Eis.normSq (frontierBranchAmp x) := by
  change Eis.normSq (Eis.mul coin2.m01 (frontierBranchAmp x)) = _
  have h3 : Eis.normSq coin2.m01 = 3 := by decide
  rw [bd_eis_normSq_mul, h3]

/-- Antipodal-free slot predicate on `{0..23}`: `A ∩ (-A) = ∅`. -/
def AntipodalFree (A : Fin 24 → Bool) : Prop :=
  ∀ a : Fin 24, A a = true → A (oppSlot a) = false

/-- Exact frontier arrival-slot subset `A_*(g, mPrev) = {a : H_2(g k_{-a}) ≤ mPrev}`. -/
def arrivalSlots (g : Mat5) (mPrev : Int) (a : Fin 24) : Bool :=
  if lorentzHeight (mat5Mul g (transport (oppSlot a))) ≤ mPrev then true else false

/-- Single-dock configuration `c : Fin 24 → Option α` supported inside slot subset `A`. -/
def SupportedOn {α : Type} (A : Fin 24 → Bool) (c : Fin 24 → Option α) : Prop :=
  ∀ a : Fin 24, c a ≠ none → A a = true

/-- Exact antipodal-line index `l ∈ Fin 12` of slot `a ∈ Fin 24`
    (pairing `{4q + 0, 4q + 3} ↦ 2q` and `{4q + 1, 4q + 2} ↦ 2q + 1`). -/
def bdLineOfSlot (a : Fin 24) : Fin 12 :=
  ⟨2 * (a.val / 4) + ((a.val % 4 + 1) / 2) % 2, by have := a.isLt; omega⟩

/-- Line-local coin branch action: for mask `m : Fin 12 → Bool`, swap `a ↔ oppSlot a` on every
    antipodal line `l` with `m l = true` (inward reflection `C_off`) and keep `a` fixed where
    `m l = false` (straight-through outward transmission `C_diag`). -/
def flipLines {α : Type} (c : Fin 24 → Option α) (m : Fin 12 → Bool) : Fin 24 → Option α :=
  fun a => match m (bdLineOfSlot a) with
    | true => c (oppSlot a)
    | false => c a

private theorem bd_lineOfSlot_opp : ∀ a : Fin 24, bdLineOfSlot (oppSlot a) = bdLineOfSlot a := by
  decide

private theorem bd_if_bool_true {P : Prop} [d : Decidable P]
    (h : (if P then true else false) = true) : P := by
  cases d with
  | isTrue hp => exact hp
  | isFalse _ => exact Bool.noConfusion h

private theorem bd_if_bool_false {P : Prop} [d : Decidable P]
    (h : ¬ P) : (if P then true else false) = false := by
  cases d with
  | isTrue hp => exact absurd hp h
  | isFalse _ => rfl

/-- Headline Theorem 8 (Exact Bare-Coin Outward Transmission & Scalar `ζ_6^k` Unit-Norm Invariance):
    `2 C_diag = 1 + ω = ζ_6` has `|C_diag|^2 = 1/4` (strictly positive outward transmission),
    `2 C_off = 1 - ω` has `|C_off|^2 = 3/4` (inward reflection), and every scalar `ζ_6^k` phase
    factor entering `Φ_odd` preserves `Eis.normSq` identically (`∀ k x`). -/
theorem thm_bd_coin_strict_outward_transmission :
    coin2.m00 = Eis.zeta6 ∧ coin2.m01 = ⟨1, -1⟩ ∧
    Eis.normSq coin2.m00 = 1 ∧ Eis.normSq coin2.m01 = 3 ∧
    Eis.normSq coin2.m00 + Eis.normSq coin2.m01 = 4 ∧
    (∀ x : Eis,
      Eis.normSq (Eis.mul coin2.m00 x) = Eis.normSq x ∧
      Eis.normSq (Eis.mul coin2.m01 x) = 3 * Eis.normSq x ∧
      Eis.normSq (Eis.mul coin2.m00 x) + Eis.normSq (Eis.mul coin2.m01 x) = 4 * Eis.normSq x) ∧
    (∀ (k : Nat) (x : Eis), Eis.normSq (Eis.mul (Eis.pow Eis.zeta6 k) x) = Eis.normSq x) := by
  have hZ6Pow : ∀ k : Nat, Eis.normSq (Eis.pow Eis.zeta6 k) = 1 := by
    intro k
    induction k with
    | zero => decide
    | succ m ih =>
      change Eis.normSq (Eis.mul (Eis.pow Eis.zeta6 m) Eis.zeta6) = 1
      rw [bd_eis_normSq_mul, ih]; decide
  refine ⟨rfl, rfl, by decide, by decide, by decide, ?_, ?_⟩
  · intro x
    have h1 : Eis.normSq coin2.m00 = 1 := by decide
    have h3 : Eis.normSq coin2.m01 = 3 := by decide
    rw [bd_eis_normSq_mul, bd_eis_normSq_mul, h1, h3, Int.one_mul]
    exact ⟨rfl, rfl, by omega⟩
  · intro k x; rw [bd_eis_normSq_mul, hZ6Pow k, Int.one_mul]

/-- Headline Theorem 9 (Antipodal-Free Disjoint-Support & Exact `1 - (3/4)^m` Frontier-Leakage Gram):
    1. Every maximal frontier arrival set `arrivalSlots g mPrev` (`H_2(g) = mCurr ≥ mPrev`, `mCurr > 0`)
       is strictly `AntipodalFree`.
    2. For ANY payload type `α`, ANY `AntipodalFree A`, and ANY `A`-supported configurations:
       - **Zero full lines (`N_full = 0`):** no antipodal pair `{a, oppSlot a}` is doubly occupied
         (so `K = M_pair = M_meet = I`),
       - **Exact disjoint-support / zero-interference:** `flipLines c1 m1 = flipLines c2 m2` forces
         `c1 = c2` AND `m1 (bdLineOfSlot a) = m2 (bdLineOfSlot a)` on every occupied slot `a` of `c1`,
         proving zero off-diagonal Gram cross-terms (`Supp(C |c1⟩) ∩ Supp(C |c2⟩) = ∅` for `c1 ≠ c2`).
    3. Exact `2^m`-branch Eisenstein tensor-product weights for ALL `m : Nat` (total `4^m`, inward `3^m`,
       outward `4^m - 3^m`, matching `1/4, 7/16, 37/64, 175/256` at `m = 1..4`), uniform `≥ 1/4`
       spectral gap for ALL `m ≥ 1`, and exact diagonal Gram lower bound `4 * outward ≥ total` for
       every multi-configuration superposition supported on `A`. -/
theorem thm_bd_frontier_leakage_exact_eigenvalues :
    (∀ (g : Mat5) (mCurr mPrev : Int),
      mCurr > 0 → mPrev ≤ mCurr → lorentzHeight g = mCurr →
      AntipodalFree (arrivalSlots g mPrev)) ∧
    (∀ {α : Type} (A : Fin 24 → Bool), AntipodalFree A →
      (∀ (c : Fin 24 → Option α), SupportedOn A c →
        ∀ a : Fin 24, ¬ (c a ≠ none ∧ c (oppSlot a) ≠ none)) ∧
      (∀ (c1 c2 : Fin 24 → Option α), SupportedOn A c1 → SupportedOn A c2 →
        ∀ (m1 m2 : Fin 12 → Bool), flipLines c1 m1 = flipLines c2 m2 →
          c1 = c2 ∧ ∀ a : Fin 24, c1 a ≠ none → m1 (bdLineOfSlot a) = m2 (bdLineOfSlot a))) ∧
    (∀ m : Nat,
      frontierTotalWeight m = bdPowInt 4 m ∧
      frontierInwardWeight m = bdPowInt 3 m ∧
      frontierOutwardWeight m = bdPowInt 4 m - bdPowInt 3 m) ∧
    (frontierOutwardWeight 1 = 1 ∧ frontierOutwardWeight 2 = 7 ∧
     frontierOutwardWeight 3 = 37 ∧ frontierOutwardWeight 4 = 175) ∧
    (∀ m : Nat, m ≥ 1 →
      4 * frontierOutwardWeight m ≥ frontierTotalWeight m ∧
      frontierOutwardWeight m > 0 ∧
      frontierInwardWeight m < frontierTotalWeight m) ∧
    (∀ (M : Nat) (cfg : List (Eis × Nat)),
      activeLinesInRange M cfg →
      4 * frontierSuperpositionOutward M cfg ≥ frontierSuperpositionTotal M cfg) := by
  have hArrFree : ∀ (g : Mat5) (mCurr mPrev : Int),
      mCurr > 0 → mPrev ≤ mCurr → lorentzHeight g = mCurr →
      AntipodalFree (arrivalSlots g mPrev) := by
    intro g mCurr mPrev hPos hMono hHeight a ha
    have hArr : lorentzHeight (mat5Mul g (transport (oppSlot a))) ≤ mPrev :=
      bd_if_bool_true ha
    have hNotOpp : ¬ (lorentzHeight (mat5Mul g (transport (oppSlot (oppSlot a)))) ≤ mPrev) := by
      rw [(thm_24_facets_geometry.2.1 a).1]
      exact ((thm_bd_frontier_no_antipodal_arrival_pair g mCurr mPrev hPos hMono hHeight a).1 hArr).2.2.2
    exact bd_if_bool_false hNotOpp
  have hDisjoint : ∀ {α : Type} (A : Fin 24 → Bool), AntipodalFree A →
      (∀ (c : Fin 24 → Option α), SupportedOn A c →
        ∀ a : Fin 24, ¬ (c a ≠ none ∧ c (oppSlot a) ≠ none)) ∧
      (∀ (c1 c2 : Fin 24 → Option α), SupportedOn A c1 → SupportedOn A c2 →
        ∀ (m1 m2 : Fin 12 → Bool), flipLines c1 m1 = flipLines c2 m2 →
          c1 = c2 ∧ ∀ a : Fin 24, c1 a ≠ none → m1 (bdLineOfSlot a) = m2 (bdLineOfSlot a)) := by
    intro α A hFree
    refine ⟨?_, ?_⟩
    · intro c hSupp a hBoth
      have h1 := hSupp a hBoth.1
      have h2 := hSupp (oppSlot a) hBoth.2
      have hF := hFree a h1
      rw [hF] at h2
      exact absurd h2 (by decide)
    · intro c1 c2 hSupp1 hSupp2 m1 m2 hFlip
      have hNoneOfFalse : ∀ (c : Fin 24 → Option α), SupportedOn A c →
          ∀ x : Fin 24, A x = false → c x = none := by
        intro c hS x hAx
        cases hcx : c x with
        | none => rfl
        | some _ =>
          have hne : c x ≠ none := by rw [hcx]; intro h; cases h
          have ht := hS x hne
          rw [hAx] at ht
          exact absurd ht (by decide)
      have hPoint : ∀ a : Fin 24,
          c1 a = c2 a ∧ (c1 a ≠ none → m1 (bdLineOfSlot a) = m2 (bdLineOfSlot a)) := by
        intro a
        cases hAa : A a with
        | false =>
          have h1 := hNoneOfFalse c1 hSupp1 a hAa
          have h2 := hNoneOfFalse c2 hSupp2 a hAa
          exact ⟨by rw [h1, h2], fun hne => absurd h1 hne⟩
        | true =>
          have hOppF : A (oppSlot a) = false := hFree a hAa
          have ho1 : c1 (oppSlot a) = none := hNoneOfFalse c1 hSupp1 (oppSlot a) hOppF
          have ho2 : c2 (oppSlot a) = none := hNoneOfFalse c2 hSupp2 (oppSlot a) hOppF
          have hAt : flipLines c1 m1 a = flipLines c2 m2 a := congrFun hFlip a
          have hOpp : flipLines c1 m1 (oppSlot a) = flipLines c2 m2 (oppSlot a) :=
            congrFun hFlip (oppSlot a)
          unfold flipLines at hAt hOpp
          rw [bd_lineOfSlot_opp a, (thm_24_facets_geometry.2.1 a).1] at hOpp
          cases hb1 : m1 (bdLineOfSlot a) <;> cases hb2 : m2 (bdLineOfSlot a)
          · rw [hb1, hb2] at hAt
            exact ⟨hAt, fun _ => rfl⟩
          · rw [hb1, hb2] at hAt hOpp
            change c1 a = c2 (oppSlot a) at hAt
            change c1 (oppSlot a) = c2 a at hOpp
            rw [ho2] at hAt; rw [ho1] at hOpp
            exact ⟨by rw [hAt, ← hOpp], fun hne => absurd hAt hne⟩
          · rw [hb1, hb2] at hAt hOpp
            change c1 (oppSlot a) = c2 a at hAt
            change c1 a = c2 (oppSlot a) at hOpp
            rw [ho1] at hAt; rw [ho2] at hOpp
            exact ⟨by rw [hOpp, ← hAt], fun hne => absurd hOpp hne⟩
          · rw [hb1, hb2] at hOpp
            exact ⟨hOpp, fun _ => rfl⟩
      exact ⟨funext (fun a => (hPoint a).1), fun a ha => (hPoint a).2 ha⟩
  have hExact : ∀ m : Nat,
      frontierTotalWeight m = bdPowInt 4 m ∧
      frontierInwardWeight m = bdPowInt 3 m ∧
      frontierOutwardWeight m = bdPowInt 4 m - bdPowInt 3 m := by
    intro m
    induction m with
    | zero => decide
    | succ k ih =>
      obtain ⟨hT, hI, hO⟩ := ih
      have hTNext : frontierTotalWeight (k + 1) = bdPowInt 4 (k + 1) := by
        unfold frontierTotalWeight frontierBranches
        rw [bd_sumBranchesIf_append,
            bd_sumBranchesIf_map _ (fun _ => true) true 1 (fun _ => rfl) bd_branchAmp_true_normSq,
            bd_sumBranchesIf_map _ (fun _ => true) false 3 (fun _ => rfl) bd_branchAmp_false_normSq]
        change 1 * frontierTotalWeight k + 3 * frontierTotalWeight k = 4 * bdPowInt 4 k
        rw [hT]; omega
      have hINext : frontierInwardWeight (k + 1) = bdPowInt 3 (k + 1) := by
        unfold frontierInwardWeight frontierBranches
        rw [bd_sumBranchesIf_append,
            bd_sumBranchesIf_map _ (fun _ => false) true 1 (fun _ => rfl) bd_branchAmp_true_normSq,
            bd_sumBranchesIf_map _ allInward false 3 (fun _ => rfl) bd_branchAmp_false_normSq,
            bd_sumBranchesIf_false]
        change 1 * 0 + 3 * frontierInwardWeight k = 3 * bdPowInt 3 k
        rw [hI]; omega
      have hONext : frontierOutwardWeight (k + 1) = bdPowInt 4 (k + 1) - bdPowInt 3 (k + 1) := by
        unfold frontierOutwardWeight frontierBranches
        rw [bd_sumBranchesIf_append,
            bd_sumBranchesIf_map _ (fun _ => true) true 1 (fun _ => rfl) bd_branchAmp_true_normSq,
            bd_sumBranchesIf_map _ anyOutward false 3 (fun _ => rfl) bd_branchAmp_false_normSq]
        change 1 * frontierTotalWeight k + 3 * frontierOutwardWeight k =
          4 * bdPowInt 4 k - 3 * bdPowInt 3 k
        rw [hT, hO]; omega
      exact ⟨hTNext, hINext, hONext⟩
  have hGap : ∀ m : Nat, m ≥ 1 →
      4 * frontierOutwardWeight m ≥ frontierTotalWeight m ∧
      frontierOutwardWeight m > 0 ∧ frontierInwardWeight m < frontierTotalWeight m := by
    intro m hm
    cases m with
    | zero => omega
    | succ k =>
      obtain ⟨hT, hI, hO⟩ := hExact (k + 1); obtain ⟨h3Pos, h3Le4⟩ := bd_powInt_3_le_4 k
      rw [hT, hI, hO]
      change 4 * (4 * bdPowInt 4 k - 3 * bdPowInt 3 k) ≥ 4 * bdPowInt 4 k ∧
        4 * bdPowInt 4 k - 3 * bdPowInt 3 k > 0 ∧ 3 * bdPowInt 3 k < 4 * bdPowInt 4 k
      omega
  have hSup : ∀ (M : Nat) (cfg : List (Eis × Nat)),
      activeLinesInRange M cfg →
      4 * frontierSuperpositionOutward M cfg ≥ frontierSuperpositionTotal M cfg := by
    intro M cfg hCfg
    induction cfg with
    | nil =>
      change 4 * (0 : Int) ≥ 0
      omega
    | cons p rest ih =>
      cases p with | mk amp m =>
      obtain ⟨⟨hm1, hmM⟩, hRest⟩ := hCfg
      have ihRest := ih hRest
      have hG := (hGap m hm1).1; rw [(hExact m).1] at hG
      have hPow : bdPowInt 4 (M - m) * bdPowInt 4 m = bdPowInt 4 M := by
        rw [← bd_powInt_add, Nat.sub_add_cancel hmM]
      have h4Pos : 0 ≤ bdPowInt 4 (M - m) := by have h := bd_powInt_3_le_4 (M - m); omega
      have hStep1 := Int.mul_nonneg h4Pos (show 0 ≤ 4 * frontierOutwardWeight m - bdPowInt 4 m by omega)
      rw [Int.mul_sub, hPow, ← Int.mul_assoc (bdPowInt 4 (M - m)) 4 (frontierOutwardWeight m),
          Int.mul_comm (bdPowInt 4 (M - m)) 4,
          Int.mul_assoc 4 (bdPowInt 4 (M - m)) (frontierOutwardWeight m)] at hStep1
      have hStep2 := Int.mul_nonneg (bd_eis_normSq_nonneg amp)
        (show 0 ≤ 4 * (bdPowInt 4 (M - m) * frontierOutwardWeight m) - bdPowInt 4 M by omega)
      rw [Int.mul_sub, ← Int.mul_assoc (Eis.normSq amp) 4 _,
          Int.mul_comm (Eis.normSq amp) 4, Int.mul_assoc 4 (Eis.normSq amp) _] at hStep2
      change 4 * (Eis.normSq amp * (bdPowInt 4 (M - m) * frontierOutwardWeight m) +
          frontierSuperpositionOutward M rest) ≥
        Eis.normSq amp * bdPowInt 4 M + frontierSuperpositionTotal M rest
      omega
  exact ⟨hArrFree, fun {α} A hFree => hDisjoint A hFree, hExact, by decide, hGap, hSup⟩


/-! ## Section 4: Exact Zero-Parameter `ℤ[ω][1/13]` Composite Doublon Certificate (`P = 0`) -/

private theorem bd_eis_scale_add (k : Int) (x y : Eis) :
    Eis.add (Eis.scale k x) (Eis.scale k y) = Eis.scale k (Eis.add x y) := by
  cases x; cases y; simp only [Eis.add, Eis.scale, Int.mul_add]

private theorem bd_eis_scale_scale (c d : Int) (x : Eis) :
    Eis.scale c (Eis.scale d x) = Eis.scale (c * d) x := by
  cases x; simp only [Eis.scale, Int.mul_assoc]

private theorem bd_eis_scale_comm (c d : Int) (x : Eis) :
    Eis.scale c (Eis.scale d x) = Eis.scale d (Eis.scale c x) := by
  rw [bd_eis_scale_scale, bd_eis_scale_scale, Int.mul_comm]

private theorem bd_eis_mul_scale_right (k : Int) (x y : Eis) :
    Eis.mul x (Eis.scale k y) = Eis.scale k (Eis.mul x y) := by
  cases x with | mk xa xb =>
  cases y with | mk ya yb =>
  simp only [Eis.mul, Eis.scale, Eis.mk.injEq, Int.mul_add, Int.mul_sub]
  have h1 : xa * (k * ya) = k * (xa * ya) := by rw [← Int.mul_assoc, Int.mul_comm xa k, Int.mul_assoc]
  have h2 : xb * (k * yb) = k * (xb * yb) := by rw [← Int.mul_assoc, Int.mul_comm xb k, Int.mul_assoc]
  have h3 : xa * (k * yb) = k * (xa * yb) := by rw [← Int.mul_assoc, Int.mul_comm xa k, Int.mul_assoc]
  have h4 : xb * (k * ya) = k * (xb * ya) := by rw [← Int.mul_assoc, Int.mul_comm xb k, Int.mul_assoc]
  rw [h1, h2, h3, h4]; exact ⟨rfl, rfl⟩

/-- Exact `P = 0` `M_meet sym(+)` composite doublon eigenvalue numerator `13 λ = 7 + 15 ω ∈ ℤ[ω]`. -/
def doublonLam13 : Eis := ⟨7, 15⟩

/-- Exact unnormalized `m = 0` coincidence amplitude `a_0 = 13` on `|0; +-⟩ + |0; -+⟩`. -/
def doublonA0 : Eis := Eis.ofInt 13

/-- Exact unnormalized `m = 1` 4-spinor `(u_{++}, u_{+-}, u_{-+}, u_{--})` in `ℤ[ω]^4`:
    `u = (3 + 4 ω, -7 + 8 ω, 1, 3 + 4 ω)` with exact spatial decay `v(m) = (1/13)^(m - 1) u`. -/
def doublonU : Fin 4 → Eis
  | ⟨0, _⟩ => ⟨3, 4⟩
  | ⟨1, _⟩ => ⟨-7, 8⟩
  | ⟨2, _⟩ => ⟨1, 0⟩
  | ⟨3, _⟩ => ⟨3, 4⟩

/-- Exact squared norm `|u|^2 = 13 + 169 + 1 + 13 = 196 = 14^2` of the unit-cell doublon spinor. -/
def doublonCellNormSq : Int :=
  Eis.normSq (doublonU ⟨0, by decide⟩) + Eis.normSq (doublonU ⟨1, by decide⟩) +
  Eis.normSq (doublonU ⟨2, by decide⟩) + Eis.normSq (doublonU ⟨3, by decide⟩)

def coin2At (i j : Fin 2) : Eis := if i = j then coin2.m00 else coin2.m01

def tensorCoin4Entry (out k : Fin 4) : Eis :=
  Eis.mul
    (coin2At ⟨out.val / 2, by have := out.isLt; omega⟩ ⟨k.val / 2, by have := k.isLt; omega⟩)
    (coin2At ⟨out.val % 2, by have := out.isLt; omega⟩ ⟨k.val % 2, by have := k.isLt; omega⟩)

/-- Literal 4-spinor action `4 (C ⊗ C) v` on `Fin 4 → Eis` (`{0:++, 1:+-, 2:-+, 3:--}`). -/
def tensorCoin4Vec (v : Fin 4 → Eis) (out : Fin 4) : Eis :=
  Eis.add
    (Eis.add
      (Eis.add (Eis.mul (tensorCoin4Entry out ⟨0, by decide⟩) (v ⟨0, by decide⟩))
               (Eis.mul (tensorCoin4Entry out ⟨1, by decide⟩) (v ⟨1, by decide⟩)))
      (Eis.mul (tensorCoin4Entry out ⟨2, by decide⟩) (v ⟨2, by decide⟩)))
    (Eis.mul (tensorCoin4Entry out ⟨3, by decide⟩) (v ⟨3, by decide⟩))

/-- Literal `P = 0` `M_meet` collision block `2 L_meet = ω [[1 + ω, ω - 1], [ω - 1, 1 + ω]]`. -/
def doublonMeet2 : Mat2Eis :=
  Mat2Eis.scaleEis Eis.omega ⟨⟨1, 1⟩, ⟨-1, 1⟩, ⟨-1, 1⟩, ⟨1, 1⟩⟩

/-- Literal `P = 0` `K`-bounce collision block `L_K = -ω [[0, 1], [1, 0]]`. -/
def doublonK1 : Mat2Eis :=
  ⟨Eis.zero, Eis.neg Eis.omega, Eis.neg Eis.omega, Eis.zero⟩

/-- Common-denominator (`13^M`-scaled) `m = 0` doublon amplitude `13^M * a_0`. -/
def doublonState0 (M : Nat) : Eis := Eis.scale (bdPowInt 13 M) doublonA0

/-- Common-denominator (`13^M`-scaled) bulk doublon 4-spinor `13^M * v(m) = 13^(M + 1 - m) * u`. -/
def doublonState (M m : Nat) : Fin 4 → Eis :=
  fun s => Eis.scale (bdPowInt 13 (M + 1 - m)) (doublonU s)

/-- Exact `r^(N - 1)`-scaled geometric partial sum `∑_{k = 0}^{N - 1} c r^{N - 1 - k}`. -/
def bdGeomScaled (r c : Int) : Nat → Int
  | 0 => 0
  | N + 1 => r * bdGeomScaled r c N + c

private theorem bd_tensorCoin4Vec_scale (c : Int) (v : Fin 4 → Eis) (out : Fin 4) :
    tensorCoin4Vec (fun s => Eis.scale c (v s)) out = Eis.scale c (tensorCoin4Vec v out) := by
  unfold tensorCoin4Vec
  rw [bd_eis_mul_scale_right, bd_eis_mul_scale_right,
      bd_eis_mul_scale_right, bd_eis_mul_scale_right,
      bd_eis_scale_add, bd_eis_scale_add, bd_eis_scale_add]

private theorem bd_geom_series_closed (r c : Int) (N : Nat) :
    (r - 1) * bdGeomScaled r c N = c * (bdPowInt r N - 1) := by
  induction N with
  | zero =>
    change (r - 1) * 0 = c * 0
    rw [Int.mul_zero, Int.mul_zero]
  | succ k ih =>
    change (r - 1) * (r * bdGeomScaled r c k + c) = c * (r * bdPowInt r k - 1)
    have h1 : (r - 1) * (r * bdGeomScaled r c k + c) =
        r * ((r - 1) * bdGeomScaled r c k) + (r - 1) * c := by
      rw [Int.mul_add, ← Int.mul_assoc (r - 1) r (bdGeomScaled r c k),
          Int.mul_comm (r - 1) r, Int.mul_assoc r (r - 1) (bdGeomScaled r c k)]
    rw [h1, ih]
    have hL1 : r * (c * (bdPowInt r k - 1)) = c * (r * bdPowInt r k) - c * r := by
      rw [Int.mul_sub, Int.mul_one, Int.mul_sub,
          ← Int.mul_assoc r c (bdPowInt r k), Int.mul_comm r c, Int.mul_assoc c r (bdPowInt r k)]
    have hL2 : (r - 1) * c = c * r - c := by rw [Int.sub_mul, Int.one_mul, Int.mul_comm r c]
    have hR : c * (r * bdPowInt r k - 1) = c * (r * bdPowInt r k) - c := by
      rw [Int.mul_sub, Int.mul_one]
    rw [hL1, hL2, hR]; omega

/-- Headline Theorem 10 (Exact `ℤ[ω][1/13]` Doublon Unit-Modulus & Spinor-Norm Certificate):
    `λ = (7 + 15 ω)/13 = (-1 + 15 i √3)/26` lies identically on the unit circle (`|7 + 15 ω|^2 = 169`),
    and the explicit `ℤ[ω]` spinor components satisfy `|a_0|^2 = 169`, `|u_{++}|^2 = |u_{--}|^2 = 13`,
    `|u_{+-}|^2 = 169`, `|u_{-+}|^2 = 1`, and cell squared norm `|u|^2 = 196 = 14^2`. -/
theorem thm_bd_doublon_eigenvalue_unit_modulus :
    Eis.normSq doublonLam13 = 169 ∧
    Eis.mul (Eis.conj doublonLam13) doublonLam13 = Eis.ofInt 169 ∧
    2 * doublonLam13.a - doublonLam13.b = -1 ∧
    (-1 : Int) * (-1) + 3 * doublonLam13.b * doublonLam13.b = 26 * 26 ∧
    Eis.normSq doublonA0 = 169 ∧
    Eis.normSq (doublonU ⟨0, by decide⟩) = 13 ∧ Eis.normSq (doublonU ⟨1, by decide⟩) = 169 ∧
    Eis.normSq (doublonU ⟨2, by decide⟩) = 1 ∧ Eis.normSq (doublonU ⟨3, by decide⟩) = 13 ∧
    doublonCellNormSq = 196 := by
  decide

/-- Headline Theorem 11 (Exact Infinite-Line `U_2(0)` Composite Doublon Eigenstate & Collision Eigenmodes):
    1. Both `M_meet` (`doublonMeet2`) and `K`-bounce (`doublonK1`) are exact unitaries on `{|0; +-⟩, |0; -+⟩}`
       with exact verified collision-block eigenvalues `2 ω^2` (`M_meet sym(+)`), `2 ω` (`M_meet anti(-)`),
       `-ω` (`K sym(+)`), and `+ω` (`K anti(-)`) — yielding relative/effective half-line phase
       `μ_0^{eff} = -1` on `K sym(+)`, `K anti(-)`, and `M_meet anti(-)` versus `μ_0^{eff} = ω` on `M_meet sym(+)`.
    2. For EVERY truncation depth `M ≥ 2`, the `13^M`-scaled `ℤ[ω]` state `(doublonState0 M, doublonState M m)`
       satisfies the literal cleared `P = 0` eigenvalue equation `13 * (4 U_2(0) ψ)_m = 4 (7 + 15 ω) ψ_m`
       at the `m = 0` boundary, at `m = 1` (driven by `doublonMeet2`), AND at EVERY bulk site `2 ≤ m ≤ M`! -/
theorem thm_bd_doublon_infinite_line_eigenstate :
    (Mat2Eis.mul (Mat2Eis.dag doublonMeet2) doublonMeet2 = Mat2Eis.scale 4 Mat2Eis.id ∧
     Mat2Eis.mul (Mat2Eis.dag doublonK1) doublonK1 = Mat2Eis.id ∧
     Eis.add doublonMeet2.m00 doublonMeet2.m01 = Eis.scale 2 Eis.omega2 ∧
     Eis.sub doublonMeet2.m00 doublonMeet2.m01 = Eis.scale 2 Eis.omega ∧
     Eis.add doublonK1.m00 doublonK1.m01 = Eis.neg Eis.omega ∧
     Eis.sub doublonK1.m00 doublonK1.m01 = Eis.omega) ∧
    (∀ M : Nat, M ≥ 2 →
      Eis.scale 13 (tensorCoin4Vec (doublonState M 1) ⟨2, by decide⟩) =
        Eis.scale 4 (Eis.mul doublonLam13 (doublonState0 M)) ∧
      Eis.scale 13 (tensorCoin4Vec (doublonState M 1) ⟨0, by decide⟩) =
        Eis.scale 4 (Eis.mul doublonLam13 (doublonState M 1 ⟨0, by decide⟩)) ∧
      Eis.scale 26 (Eis.add (Eis.mul doublonMeet2.m00 (doublonState0 M))
                            (Eis.mul doublonMeet2.m01 (doublonState0 M))) =
        Eis.scale 4 (Eis.mul doublonLam13 (doublonState M 1 ⟨1, by decide⟩)) ∧
      Eis.scale 13 (tensorCoin4Vec (doublonState M 2) ⟨2, by decide⟩) =
        Eis.scale 4 (Eis.mul doublonLam13 (doublonState M 1 ⟨2, by decide⟩)) ∧
      Eis.scale 13 (tensorCoin4Vec (doublonState M 1) ⟨3, by decide⟩) =
        Eis.scale 4 (Eis.mul doublonLam13 (doublonState M 1 ⟨3, by decide⟩)) ∧
      ∀ m : Nat, 2 ≤ m → m ≤ M →
        Eis.scale 13 (tensorCoin4Vec (doublonState M m) ⟨0, by decide⟩) =
          Eis.scale 4 (Eis.mul doublonLam13 (doublonState M m ⟨0, by decide⟩)) ∧
        Eis.scale 13 (tensorCoin4Vec (doublonState M (m - 1)) ⟨1, by decide⟩) =
          Eis.scale 4 (Eis.mul doublonLam13 (doublonState M m ⟨1, by decide⟩)) ∧
        Eis.scale 13 (tensorCoin4Vec (doublonState M (m + 1)) ⟨2, by decide⟩) =
          Eis.scale 4 (Eis.mul doublonLam13 (doublonState M m ⟨2, by decide⟩)) ∧
        Eis.scale 13 (tensorCoin4Vec (doublonState M m) ⟨3, by decide⟩) =
          Eis.scale 4 (Eis.mul doublonLam13 (doublonState M m ⟨3, by decide⟩))) := by
  have hBase :
      Eis.scale 13 (tensorCoin4Vec doublonU ⟨2, by decide⟩) =
        Eis.scale 4 (Eis.mul doublonLam13 doublonA0) ∧
      Eis.scale 13 (tensorCoin4Vec doublonU ⟨0, by decide⟩) =
        Eis.scale 4 (Eis.mul doublonLam13 (doublonU ⟨0, by decide⟩)) ∧
      Eis.scale 26 (Eis.add (Eis.mul doublonMeet2.m00 doublonA0)
                            (Eis.mul doublonMeet2.m01 doublonA0)) =
        Eis.scale 4 (Eis.mul doublonLam13 (doublonU ⟨1, by decide⟩)) ∧
      tensorCoin4Vec doublonU ⟨2, by decide⟩ =
        Eis.scale 4 (Eis.mul doublonLam13 (doublonU ⟨2, by decide⟩)) ∧
      Eis.scale 13 (tensorCoin4Vec doublonU ⟨3, by decide⟩) =
        Eis.scale 4 (Eis.mul doublonLam13 (doublonU ⟨3, by decide⟩)) ∧
      Eis.scale 169 (tensorCoin4Vec doublonU ⟨1, by decide⟩) =
        Eis.scale 4 (Eis.mul doublonLam13 (doublonU ⟨1, by decide⟩)) := by
    decide
  refine ⟨by decide, ?_⟩
  intro M hM
  have hM1 : M + 1 - 1 = M := by omega
  have hM2 : M + 1 - 2 + 1 = M := by omega
  refine ⟨?_, ?_, ?_, ?_, ?_, ?_⟩
  · unfold doublonState doublonState0
    rw [hM1, bd_tensorCoin4Vec_scale, bd_eis_mul_scale_right, bd_eis_scale_comm 13, bd_eis_scale_comm 4]
    exact congrArg (Eis.scale (bdPowInt 13 M)) hBase.1
  · unfold doublonState
    rw [hM1, bd_tensorCoin4Vec_scale, bd_eis_mul_scale_right, bd_eis_scale_comm 13, bd_eis_scale_comm 4]
    exact congrArg (Eis.scale (bdPowInt 13 M)) hBase.2.1
  · unfold doublonState doublonState0
    rw [hM1, bd_eis_mul_scale_right, bd_eis_mul_scale_right, bd_eis_scale_add,
        bd_eis_mul_scale_right, bd_eis_scale_comm 26, bd_eis_scale_comm 4]
    exact congrArg (Eis.scale (bdPowInt 13 M)) hBase.2.2.1
  · unfold doublonState
    rw [hM1, bd_tensorCoin4Vec_scale, bd_eis_mul_scale_right, bd_eis_scale_scale 13, bd_eis_scale_comm 4]
    have hP : 13 * bdPowInt 13 (M + 1 - 2) = bdPowInt 13 M := by
      change bdPowInt 13 (M + 1 - 2 + 1) = bdPowInt 13 M; rw [hM2]
    rw [hP]; exact congrArg (Eis.scale (bdPowInt 13 M)) hBase.2.2.2.1
  · unfold doublonState
    rw [hM1, bd_tensorCoin4Vec_scale, bd_eis_mul_scale_right, bd_eis_scale_comm 13, bd_eis_scale_comm 4]
    exact congrArg (Eis.scale (bdPowInt 13 M)) hBase.2.2.2.2.1
  · intro m hm2 hmM
    have hPrev : M + 1 - (m - 1) = (M + 1 - m) + 1 := by omega
    have hNext : (M + 1 - (m + 1)) + 1 = M + 1 - m := by omega
    refine ⟨?_, ?_, ?_, ?_⟩
    · unfold doublonState
      rw [bd_tensorCoin4Vec_scale, bd_eis_mul_scale_right, bd_eis_scale_comm 13, bd_eis_scale_comm 4]
      exact congrArg (Eis.scale (bdPowInt 13 (M + 1 - m))) hBase.2.1
    · unfold doublonState
      rw [hPrev, bd_tensorCoin4Vec_scale, bd_eis_mul_scale_right, bd_eis_scale_comm 4]
      change Eis.scale 13 (Eis.scale (13 * bdPowInt 13 (M + 1 - m))
          (tensorCoin4Vec doublonU ⟨1, by decide⟩)) = _
      rw [bd_eis_scale_scale 13, ← Int.mul_assoc 13 13 (bdPowInt 13 (M + 1 - m)),
          Int.mul_comm (13 * 13) (bdPowInt 13 (M + 1 - m)),
          ← bd_eis_scale_scale (bdPowInt 13 (M + 1 - m)) (13 * 13)]
      exact congrArg (Eis.scale (bdPowInt 13 (M + 1 - m))) hBase.2.2.2.2.2
    · unfold doublonState
      rw [bd_tensorCoin4Vec_scale, bd_eis_mul_scale_right, bd_eis_scale_scale 13, bd_eis_scale_comm 4]
      have hP : 13 * bdPowInt 13 (M + 1 - (m + 1)) = bdPowInt 13 (M + 1 - m) := by
        change bdPowInt 13 ((M + 1 - (m + 1)) + 1) = bdPowInt 13 (M + 1 - m); rw [hNext]
      rw [hP]; exact congrArg (Eis.scale (bdPowInt 13 (M + 1 - m))) hBase.2.2.2.1
    · unfold doublonState
      rw [bd_tensorCoin4Vec_scale, bd_eis_mul_scale_right, bd_eis_scale_comm 13, bd_eis_scale_comm 4]
      exact congrArg (Eis.scale (bdPowInt 13 (M + 1 - m))) hBase.2.2.2.2.1

/-- Exact squared norm `‖doublonState M m‖^2` of the `13^M`-scaled doublon 4-spinor at shell `m`. -/
def doublonSiteNormSq (M m : Nat) : Int :=
  Eis.normSq (doublonState M m ⟨0, by decide⟩) + Eis.normSq (doublonState M m ⟨1, by decide⟩) +
  Eis.normSq (doublonState M m ⟨2, by decide⟩) + Eis.normSq (doublonState M m ⟨3, by decide⟩)

/-- Literal sum of `2 * ‖doublonState M m‖^2` over shells `m = 1..k`. -/
def doublonTailSumAt (M : Nat) : Nat → Int
  | 0 => 0
  | k + 1 => doublonTailSumAt M k + 2 * doublonSiteNormSq M (k + 1)

/-- Literal sum of `2 * ‖doublonState M m‖^4` over shells `m = 1..k`. -/
def doublonIprSumAt (M : Nat) : Nat → Int
  | 0 => 0
  | k + 1 =>
    doublonIprSumAt M k + 2 * doublonSiteNormSq M (k + 1) * doublonSiteNormSq M (k + 1)

private theorem bd_eis_normSq_scale (c : Int) (x : Eis) :
    Eis.normSq (Eis.scale c x) = (c * c) * Eis.normSq x := by
  have hSc : Eis.scale c x = Eis.mul (Eis.ofInt c) x := by
    cases x; simp only [Eis.scale, Eis.mul, Eis.ofInt, Eis.mk.injEq, Int.zero_mul]
    exact ⟨by omega, by omega⟩
  have hN : Eis.normSq (Eis.ofInt c) = c * c := by
    simp only [Eis.normSq, Eis.ofInt, Int.mul_zero]; omega
  rw [hSc, bd_eis_normSq_mul, hN]

private theorem bd_powInt_13_sq (k : Nat) :
    bdPowInt 13 k * bdPowInt 13 k = bdPowInt 169 k := by
  induction k with
  | zero => decide
  | succ m ih =>
    change (13 * bdPowInt 13 m) * (13 * bdPowInt 13 m) = 169 * bdPowInt 169 m
    rw [Int.mul_assoc 13 (bdPowInt 13 m) (13 * bdPowInt 13 m),
        ← Int.mul_assoc (bdPowInt 13 m) 13 (bdPowInt 13 m),
        Int.mul_comm (bdPowInt 13 m) 13,
        Int.mul_assoc 13 (bdPowInt 13 m) (bdPowInt 13 m),
        ← Int.mul_assoc 13 13 (bdPowInt 13 m * bdPowInt 13 m), ih]
    rfl

private theorem bd_doublonSiteNormSq_eq (M m : Nat) :
    doublonSiteNormSq M m = bdPowInt 169 (M + 1 - m) * doublonCellNormSq := by
  unfold doublonSiteNormSq doublonState doublonCellNormSq
  rw [bd_eis_normSq_scale, bd_eis_normSq_scale, bd_eis_normSq_scale, bd_eis_normSq_scale,
      bd_powInt_13_sq, Int.mul_add, Int.mul_add, Int.mul_add]

private theorem bd_doublonSiteNormSq_shift (M j : Nat) (hj : j ≤ M + 1) :
    doublonSiteNormSq (M + 1) j = 169 * doublonSiteNormSq M j := by
  rw [bd_doublonSiteNormSq_eq (M + 1) j, bd_doublonSiteNormSq_eq M j]
  have hExp : (M + 1) + 1 - j = (M + 1 - j) + 1 := by omega
  rw [hExp]
  change (169 * bdPowInt 169 (M + 1 - j)) * doublonCellNormSq =
    169 * (bdPowInt 169 (M + 1 - j) * doublonCellNormSq)
  rw [Int.mul_assoc]

private theorem bd_doublonTailSumAt_shift (M k : Nat) (hk : k ≤ M + 1) :
    doublonTailSumAt (M + 1) k = 169 * doublonTailSumAt M k := by
  induction k with
  | zero => change (0 : Int) = 169 * 0; rfl
  | succ j ih =>
    unfold doublonTailSumAt
    rw [ih (by omega), bd_doublonSiteNormSq_shift M (j + 1) (by omega)]
    omega

private theorem bd_doublonIprSumAt_shift (M k : Nat) (hk : k ≤ M + 1) :
    doublonIprSumAt (M + 1) k = 28561 * doublonIprSumAt M k := by
  induction k with
  | zero => change (0 : Int) = 28561 * 0; rfl
  | succ j ih =>
    unfold doublonIprSumAt
    rw [ih (by omega), bd_doublonSiteNormSq_shift M (j + 1) (by omega)]
    let s : Int := doublonSiteNormSq M (j + 1)
    have hSq : 2 * (169 * s) * (169 * s) = 28561 * (2 * s * s) := by
      rw [Int.mul_assoc 2 (169 * s) (169 * s), Int.mul_assoc 169 s (169 * s),
          ← Int.mul_assoc s 169 s, Int.mul_comm s 169, Int.mul_assoc 169 s s,
          ← Int.mul_assoc 169 169 (s * s), ← Int.mul_assoc 2 (169 * 169) (s * s),
          Int.mul_comm 2 (169 * 169), Int.mul_assoc (169 * 169) 2 (s * s),
          ← Int.mul_assoc 2 s s]
      rfl
    change 28561 * doublonIprSumAt M j + 2 * (169 * s) * (169 * s) =
      28561 * (doublonIprSumAt M j + 2 * s * s)
    rw [hSq]; omega

/-- Headline Theorem 12 (Exact Eigenstate Geometric-Series Normalization `p(r = 0) = 6/13` & `IPR = 5118/14365`):
    ties the literal finite-shell sums `doublonTailSumAt` and `doublonIprSumAt` directly to
    `Eis.normSq` of the `13^M`-scaled eigenstate `doublonState M m`, proves their exact closed-form
    geometric series for ALL `n : Nat` (`r = 169` and `r = 169^2 = 28561`), and certifies the exact
    infinite-line rational observables `p(r = 0) = 6/13`, `p(1) = 588/2197`, and `IPR = 5118 / 14365`. -/
theorem thm_bd_doublon_exact_norm_and_ipr :
    (∀ n : Nat,
      doublonTailSumAt n (n + 1) = bdGeomScaled 169 (2 * doublonCellNormSq) (n + 1) ∧
      168 * doublonTailSumAt n (n + 1) =
        (2 * doublonCellNormSq) * (bdPowInt 169 (n + 1) - 1)) ∧
    (∀ n : Nat,
      doublonIprSumAt n (n + 1) =
        bdGeomScaled 28561 (2 * doublonCellNormSq * doublonCellNormSq) (n + 1) ∧
      28560 * doublonIprSumAt n (n + 1) =
        (2 * doublonCellNormSq * doublonCellNormSq) * (bdPowInt 28561 (n + 1) - 1)) ∧
    (let p0 : Int := 2 * Eis.normSq doublonA0
     let p1 : Int := doublonCellNormSq
     let nTotX3 : Int := 3 * p0 + 7 * 169
     168 * (7 * 169) = 3 * (2 * p1 * 169) ∧
     nTotX3 = 13 * 169 ∧
     13 * (3 * p0) = 6 * nTotX3 ∧
     2197 * (3 * p1) = 588 * nTotX3 ∧
     14365 * ((3 * p0) * (3 * p0) * 28560 + 2 * (3 * p1) * (3 * p1) * 28561) =
       5118 * (nTotX3 * nTotX3 * 28560)) := by
  have hTail : ∀ n : Nat,
      doublonTailSumAt n (n + 1) = bdGeomScaled 169 (2 * doublonCellNormSq) (n + 1) := by
    intro n
    induction n with
    | zero => decide
    | succ m ih =>
      change doublonTailSumAt (m + 1) (m + 1) + 2 * doublonSiteNormSq (m + 1) (m + 2) =
        169 * bdGeomScaled 169 (2 * doublonCellNormSq) (m + 1) + 2 * doublonCellNormSq
      rw [bd_doublonTailSumAt_shift m (m + 1) (Nat.le_refl _), ih,
          bd_doublonSiteNormSq_eq (m + 1) (m + 2)]
      have hz : (m + 1) + 1 - (m + 2) = 0 := by omega
      rw [hz]; simp only [bdPowInt, Int.one_mul]
  have hIpr : ∀ n : Nat,
      doublonIprSumAt n (n + 1) =
        bdGeomScaled 28561 (2 * doublonCellNormSq * doublonCellNormSq) (n + 1) := by
    intro n
    induction n with
    | zero => decide
    | succ m ih =>
      change doublonIprSumAt (m + 1) (m + 1) +
          2 * doublonSiteNormSq (m + 1) (m + 2) * doublonSiteNormSq (m + 1) (m + 2) =
        28561 * bdGeomScaled 28561 (2 * doublonCellNormSq * doublonCellNormSq) (m + 1) +
          2 * doublonCellNormSq * doublonCellNormSq
      rw [bd_doublonIprSumAt_shift m (m + 1) (Nat.le_refl _), ih,
          bd_doublonSiteNormSq_eq (m + 1) (m + 2)]
      have hz : (m + 1) + 1 - (m + 2) = 0 := by omega
      rw [hz]; simp only [bdPowInt, Int.one_mul]
  refine ⟨fun n => ⟨hTail n, by rw [hTail n]; exact bd_geom_series_closed 169 (2 * doublonCellNormSq) (n + 1)⟩,
    fun n => ⟨hIpr n, by rw [hIpr n]; exact bd_geom_series_closed 28561 (2 * doublonCellNormSq * doublonCellNormSq) (n + 1)⟩,
    by decide⟩

end Vibe
