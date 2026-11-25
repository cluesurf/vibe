import Vibe.Fock.Ring
import Vibe.Fock.State
import Vibe.Fock.Gates
import Vibe.Fock.Beat

/-!
# Vibe Theory: Quantum Fock-Space Composite Beat `U` on Infinite `{3,4,3,4}` (Milestone P1)

Thin re-export facade (0 theorems) assembling the four `Vibe.Fock.*` submodules with
100% preserved public declarations and theorem names for all downstream imports:
- `Vibe.Fock.Ring`: Exact `StarCommRing Ninth`, localization `NinthLoc6 = ℤ[ζ_9][1/6]`,
  and microscopic gate-coefficient unitarity certificates (`thm_fock_ring_and_gate_identities`).
- `Vibe.Fock.State`: Finite-support quantum Fock space (`FockVec`, `innerOn`, `normSqOn`,
  `FockUnitary`, universal constructors, all-time iteration), 24-slot geometry, Coxeter parity
  `M_P = simpleRefl 0`, infinite-honeycomb `HoneycombConfig`, `v1Config`, `totalCharge`,
  configuration symmetries (`S`, `R`, `C`, `P`, `CP`), and charge/light-cone predicates.
- `Vibe.Fock.Gates`: Global `LocalSiteFamily` lifting, concrete local dock operators (`K`, `D`,
  `M_meet`, `M_pair(ζ_18)`, `Φ_odd(χ)`, `S`), and exact Scale-2 pairwise commutation
  (`[K, M_pair] = [K, M_meet] = [M_pair, M_meet] = 0`).
- `Vibe.Fock.Beat`: Full palindromic 8-layer composite beat `fockBeat` (`U`) & `U_sym`,
  all-time unitarity, quantum `|V_1⟩` stationarity, charge `Q` conservation, 1-hop
  Lieb-Robinson light cone (`∀ t`), concrete Fock `T / CP / CPT`, and 4-vibe chiral witness.
-/

set_option autoImplicit false

namespace Vibe
end Vibe
