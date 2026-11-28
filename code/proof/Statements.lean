import Vibe

/-!
# Vibe Theory: Frozen Headline Theorem Manifest (`Statements.lean`)

Referee-auditable manifest referencing all `721` public headline theorems exported by the
`Vibe` Lean `4.35.0` + Mathlib `v4.35.0` formal proof suite across all `83` library modules
(`85` `.lean` files total including `Vibe.lean` and `Statements.lean`).

Compiling this file (`lake build Statements`) verifies inside the Lean `4.35.0` kernel that
every listed headline theorem identifier is publicly exported by `Vibe` and inhabits `Prop`,
paired with the fail-closed `code/proof/comparator.json` kernel signature & axiom freeze
enforced by `task/check-lean.ts`.
-/

set_option autoImplicit false

private def checkHeadline {P : Prop} (_ : P) : Unit := ()

/-- `Vibe.Tone` (5 headline theorems). -/
private def manifest_Tone : List Unit := [
  checkHeadline (@Vibe.conjDock_involutive),
  checkHeadline (@Vibe.conjDock_fixes_v1),
  checkHeadline (@Vibe.dockCharge_v1),
  checkHeadline (@Vibe.dockCharge_conj),
  checkHeadline (@Vibe.dockCharge_bounded)
]

/-- `Vibe.Algebra` (4 headline theorems). -/
private def manifest_Algebra : List Unit := [
  checkHeadline (@Vibe.Ninth.zeta18_pow18_eq_one),
  checkHeadline (@Vibe.Ninth.zeta18_unit_left),
  checkHeadline (@Vibe.Ninth.gapSqZeta18_ne_zero),
  checkHeadline (@Vibe.Ninth.gapSqZeta18_minpoly)
]

/-- `Vibe.Rule` (29 headline theorems). -/
private def manifest_Rule : List Unit := [
  checkHeadline (@Vibe.thm1_v1_eternal_stationarity),
  checkHeadline (@Vibe.thm1_light_cone_empty_outside),
  checkHeadline (@Vibe.thm2_coin_unitary_left),
  checkHeadline (@Vibe.thm2_coin_unitary_right),
  checkHeadline (@Vibe.thm2_halfCoin_sq_eq_coin),
  checkHeadline (@Vibe.thm2_halfCoin_unitary_left),
  checkHeadline (@Vibe.thm2_halfCoin_unitary_right),
  checkHeadline (@Vibe.thm2_fg_matrix_unitary),
  checkHeadline (@Vibe.thm2_odd_value_phase_unit),
  checkHeadline (@Vibe.thm2_mpair_zeta18_unitary_diag),
  checkHeadline (@Vibe.thm2_mpair_zeta18_unitary_off),
  checkHeadline (@Vibe.thm3_M_unitary_left),
  checkHeadline (@Vibe.thm3_M_unitary_right),
  checkHeadline (@Vibe.thm3_M_det_eq_four),
  checkHeadline (@Vibe.thm3_M_trace_eq_one),
  checkHeadline (@Vibe.thm3_M_cayley_hamilton),
  checkHeadline (@Vibe.thm3_M_pow_recurrence),
  checkHeadline (@Vibe.thm3_trace_M_pow),
  checkHeadline (@Vibe.thm3_traceSeq_odd),
  checkHeadline (@Vibe.thm3_W_infinite_order_su2),
  checkHeadline (@Vibe.thm3_W_infinite_order_psu2),
  checkHeadline (@Vibe.thm3_noncommuting_conjugate),
  checkHeadline (@Vibe.thm3_not_in_pin2),
  checkHeadline (@Vibe.thm3_commutator_frob_norm_sq),
  checkHeadline (@Vibe.thm4_mpair12_comp),
  checkHeadline (@Vibe.thm4_mpair12_unitary_left),
  checkHeadline (@Vibe.thm4_mpair12_unitary_right),
  checkHeadline (@Vibe.thm4_mpair12_swave_iter),
  checkHeadline (@Vibe.thm4_mpair12_transverse_iter)
]

/-- `Vibe.Geometry` (14 headline theorems). -/
private def manifest_Geometry : List Unit := [
  checkHeadline (@Vibe.thm5_shell_exp_lower_bound),
  checkHeadline (@Vibe.thm5_resistance_exp_lower_bound),
  checkHeadline (@Vibe.thm5_resistance_strictly_increasing),
  checkHeadline (@Vibe.thm5_resistance_unbounded),
  checkHeadline (@Vibe.thm5_cusp_lateral_cumulative),
  checkHeadline (@Vibe.thm5_cusp_lateral_lt_shell),
  checkHeadline (@Vibe.thm6_rayleigh_scale_invariance),
  checkHeadline (@Vibe.thm6_strictly_subluminal),
  checkHeadline (@Vibe.thm_d4_root_system),
  checkHeadline (@Vibe.thm_d4_rank4_so4_isotropy),
  checkHeadline (@Vibe.thm_z4_fails_rank4_isotropy),
  checkHeadline (@Vibe.thm_d4_triangular_plaquette_geometry),
  checkHeadline (@Vibe.thm_d4_no_straddling_triangles),
  checkHeadline (@Vibe.thm_d4_triangle_halfspace_decomposition)
]

/-- `Vibe.Gauge` (27 headline theorems). -/
private def manifest_Gauge : List Unit := [
  checkHeadline (@Vibe.thm7_charge_quantization),
  checkHeadline (@Vibe.thm7_anomaly_grav_u1),
  checkHeadline (@Vibe.thm7_anomaly_u1_cubic),
  checkHeadline (@Vibe.thm7_anomaly_su2_u1),
  checkHeadline (@Vibe.thm7_anomaly_su3_u1),
  checkHeadline (@Vibe.thm7_anomaly_su3_cubic),
  checkHeadline (@Vibe.thm7_witten_su2_even_all_gens),
  checkHeadline (@Vibe.thm7_weinberg_gut_three_eighths),
  checkHeadline (@Vibe.thm8_koide_two_thirds_iff_f4_root_ratio),
  checkHeadline (@Vibe.thm8_warp_koide_exact_identity),
  checkHeadline (@Vibe.thm8_warp_koide_ge_two_thirds),
  checkHeadline (@Vibe.thm8_warp_koide_eq_iff_uniform),
  checkHeadline (@Vibe.thm9_photon_exact_zero_mode),
  checkHeadline (@Vibe.thm9_z_boson_eigenmode),
  checkHeadline (@Vibe.thm9_custodial_rho_eq_one),
  checkHeadline (@Vibe.thm10_ps16_matches_spin10),
  checkHeadline (@Vibe.thm10_ps_trace_bl_zero),
  checkHeadline (@Vibe.thm10_ps_trace_t3L_sq),
  checkHeadline (@Vibe.thm10_ps_trace_t3R_sq),
  checkHeadline (@Vibe.thm10_ps_trace_bl_sq),
  checkHeadline (@Vibe.thm10_ps_trace_bl_t3R_orthogonal),
  checkHeadline (@Vibe.thm10_ps_trace_y_sq),
  checkHeadline (@Vibe.thm10_ps_matching_weights_from_traces),
  checkHeadline (@Vibe.thm10_dyadic_pow2_mod3),
  checkHeadline (@Vibe.thm11_matter_parity_all_16_fermions_odd),
  checkHeadline (@Vibe.thm11_matter_parity_preserved_by_126H),
  checkHeadline (@Vibe.thm13_axion_e_over_n_eight_thirds)
]

/-- `Vibe.Limits` (15 headline theorems). -/
private def manifest_Limits : List Unit := [
  checkHeadline (@Vibe.thm14_z3_transfer_vacuum_eigenmode),
  checkHeadline (@Vibe.thm14_z3_transfer_excited_eigenmode),
  checkHeadline (@Vibe.thm14_z3_transfer_mass_gap_all_time),
  checkHeadline (@Vibe.thm14_z3_transfer_exp_suppression),
  checkHeadline (@Vibe.thm15_zn_pq_min_operator_dim),
  checkHeadline (@Vibe.thm15_z36_pq_dim_ge_18),
  checkHeadline (@Vibe.thm15_z36_pq_dim_ge_36),
  checkHeadline (@Vibe.thm15_mat2eis_dag_mul),
  checkHeadline (@Vibe.thm15_mat2eis_unitary_comp),
  checkHeadline (@Vibe.thm15_gateM_pow_unitary_all_lengths),
  checkHeadline (@Vibe.thm15_gateM2_unitary_left),
  checkHeadline (@Vibe.thm15_gateM2_pow_unitary_all_lengths),
  checkHeadline (@Vibe.thm15_eisWord_unitary_all_words),
  checkHeadline (@Vibe.thm16_gram_btb_positivity),
  checkHeadline (@Vibe.thm16_weighted_gram_positivity)
]

/-- `Vibe.SchurGap` (15 headline theorems). -/
private def manifest_SchurGap : List Unit := [
  checkHeadline (@Vibe.thm_schur_hermite_identity),
  checkHeadline (@Vibe.thm_schur_hermite_nonneg),
  checkHeadline (@Vibe.thm_schur_hermite_qpos),
  checkHeadline (@Vibe.thm_schur_antipodal_pair_identity),
  checkHeadline (@Vibe.thm_d4_root_lines_partition),
  checkHeadline (@Vibe.thm_d4_exact_moments),
  checkHeadline (@Vibe.thm_schur3_nonneg),
  checkHeadline (@Vibe.thm_schur4_simplex_nonneg),
  checkHeadline (@Vibe.thm_d4_moment3_le_9_S3),
  checkHeadline (@Vibe.thm_schur_majorant_bound_13_over_21),
  checkHeadline (@Vibe.thm_busemann_schur_global_bound),
  checkHeadline (@Vibe.thm_busemann_schur_sharp_at_d4_root),
  checkHeadline (@Vibe.thm_busemann_schur_cusp_axis_7_over_15),
  checkHeadline (@Vibe.thm_busemann_spectral_gap_8_over_21),
  checkHeadline (@Vibe.thm_col_resistance_code_bridge)
]

/-- `Vibe.Uniqueness4D` (17 headline theorems). -/
private def manifest_Uniqueness4D : List Unit := [
  checkHeadline (@Vibe.ZSqrt5.isPos_neg_exclusive),
  checkHeadline (@Vibe.thm_classify_spherical3),
  checkHeadline (@Vibe.thm_classify_spherical4),
  checkHeadline (@Vibe.thm_classify_euclidean4_unique),
  checkHeadline (@Vibe.thm_coxeter_classify_compact_4d),
  checkHeadline (@Vibe.thm_coxeter_classify_paracompact_4d),
  checkHeadline (@Vibe.thm_coxeter_classify_euclidean_4d),
  checkHeadline (@Vibe.thm_coxeter_classify_spherical5),
  checkHeadline (@Vibe.thm_coxeter_complete_finite_covolume_4d),
  checkHeadline (@Vibe.thm_coxeter_4d_counts),
  checkHeadline (@Vibe.thm_cell16_fails_rank4_isotropy),
  checkHeadline (@Vibe.thm_self_dual_regular_4polytopes),
  checkHeadline (@Vibe.thm_uniqueness_4d_flat_cusp_finite_covolume),
  checkHeadline (@Vibe.thm_uniqueness_4d_flat_cusp_and_self_dual_all_nat),
  checkHeadline (@Vibe.thm_uniqueness_4d_flat_cusp_and_finite_cell_all_nat),
  checkHeadline (@Vibe.thm_uniqueness_4d_all_four_invariants),
  checkHeadline (@Vibe.thm_uniqueness_4d_negative_controls)
]

/-- `Vibe.CoxeterTransport` (15 headline theorems). -/
private def manifest_CoxeterTransport : List Unit := [
  checkHeadline (@Vibe.thm_coxeter_gram_and_center),
  checkHeadline (@Vibe.thm_central_inversion_properties),
  checkHeadline (@Vibe.thm_orth_group_mul),
  checkHeadline (@Vibe.thm_reflection_involution),
  checkHeadline (@Vibe.thm_reflection_preserves_twiceGram),
  checkHeadline (@Vibe.thm_conj_reflection),
  checkHeadline (@Vibe.thm_24_facets_geometry),
  checkHeadline (@Vibe.thm_24_facet_dirs_isomorphic_to_d4),
  checkHeadline (@Vibe.thm_coxeter_transport_preserves_lorentz),
  checkHeadline (@Vibe.thm_coxeter_transport_det_neg_one),
  checkHeadline (@Vibe.thm_coxeter_transport_antipodal_inverse),
  checkHeadline (@Vibe.thm_coxeter_word_lorentz_and_inverse),
  checkHeadline (@Vibe.thm_honeycomb_stream_antipodal_reversal),
  checkHeadline (@Vibe.thm_cusp_dock0_split_and_ratio),
  checkHeadline (@Vibe.thm_palindromic_beat_T_CP_CPT)
]

/-- `Vibe.Fock.{Ring,State,Gates,Beat}` via `Vibe.FockBeat` (18 headline theorems). -/
private def manifest_FockBeat : List Unit := [
  checkHeadline (@Vibe.thm_fock_ring_and_gate_identities),
  checkHeadline (@Vibe.thm_fock_inner_support_indep),
  checkHeadline (@Vibe.thm_fock_inner_sesquilinear),
  checkHeadline (@Vibe.thm_fock_elementary_unitaries),
  checkHeadline (@Vibe.thm_fock_unitary_iter_all_time),
  checkHeadline (@Vibe.thm_fock_coxeter_parity_equivariance),
  checkHeadline (@Vibe.thm_fock_honeycomb_config_symmetries),
  checkHeadline (@Vibe.thm_fock_scale2_K_MPair_comm),
  checkHeadline (@Vibe.thm_fock_scale2_K_MMeet_comm),
  checkHeadline (@Vibe.thm_fock_scale2_MPair_MMeet_comm),
  checkHeadline (@Vibe.thm_fock_scale2_core_unitary_and_comm),
  checkHeadline (@Vibe.thm_fock_beat_unitary_all_time),
  checkHeadline (@Vibe.thm_fock_sym_beat_unitary_all_time),
  checkHeadline (@Vibe.thm_fock_v1_quantum_stationarity),
  checkHeadline (@Vibe.thm_fock_charge_conservation_all_time),
  checkHeadline (@Vibe.thm_fock_lieb_robinson_light_cone),
  checkHeadline (@Vibe.thm_fock_beat_T_CP_CPT),
  checkHeadline (@Vibe.thm_fock_chiral_witness_C_P_violation)
]

/-- `Vibe.Chirality` (17 headline theorems). -/
private def manifest_Chirality : List Unit := [
  checkHeadline (@Vibe.thm_f4_simple_reflections_orthogonal_and_det),
  checkHeadline (@Vibe.thm_f4_coxeter_relations),
  checkHeadline (@Vibe.thm_wf4_action_orthogonal_and_bijective),
  checkHeadline (@Vibe.thm_wf4_semidirect_order_1152),
  checkHeadline (@Vibe.thm_wf4_generated_by_simples_and_proper_gens),
  checkHeadline (@Vibe.thm_wf4_det4_transformation),
  checkHeadline (@Vibe.thm_f4_24_reflection_hyperplanes),
  checkHeadline (@Vibe.thm_k3_pointwise_improper_stabilizer),
  checkHeadline (@Vibe.thm_achiral_k1),
  checkHeadline (@Vibe.thm_achiral_k2),
  checkHeadline (@Vibe.thm_achiral_k3),
  checkHeadline (@Vibe.thm_chiOddPoly_transformation_laws),
  checkHeadline (@Vibe.thm_chiOddPoly_vanishes_k_le_3),
  checkHeadline (@Vibe.thm_k4_chiral_witnesses_sharp),
  checkHeadline (@Vibe.thm_individual_C_and_P_broken_CP_exact),
  checkHeadline (@Vibe.thm_abstract_canonical_orbit_sign_law),
  checkHeadline (@Vibe.thm_phiOdd_phase_unit_and_covariance)
]

/-- `Vibe.CuspGrowth` (17 headline theorems). -/
private def manifest_CuspGrowth : List Unit := [
  checkHeadline (@Vibe.thm_facet_gram_right_angled),
  checkHeadline (@Vibe.thm_orthogonal_reflections_commute),
  checkHeadline (@Vibe.thm_cusp_layer_stabilizer_exact),
  checkHeadline (@Vibe.thm_wall_hyperplane_exact),
  checkHeadline (@Vibe.thm_direct_o41_ball_shells_0_1_2),
  checkHeadline (@Vibe.thm_24cell_clique_fvector),
  checkHeadline (@Vibe.thm_24cell_foata_matrix_uniform),
  checkHeadline (@Vibe.thm_foata_exact_initial_values),
  checkHeadline (@Vibe.thm_foata_cubic_recurrence),
  checkHeadline (@Vibe.thm_wall_cusp_eq_cuspLateralLinks),
  checkHeadline (@Vibe.thm_cusp_growth_ge_18),
  checkHeadline (@Vibe.thm_cusp_and_ball_growth_rate_bounds),
  checkHeadline (@Vibe.thm_unconditional_cusp_shell_exp),
  checkHeadline (@Vibe.thm_unconditional_resistance_exp),
  checkHeadline (@Vibe.thm_unconditional_resistance_unbounded),
  checkHeadline (@Vibe.thm_unconditional_wall_lt_cusp_shell),
  checkHeadline (@Vibe.thm_unconditional_cusp_strictly_subluminal)
]

/-- `Vibe.Quantum` (15 headline theorems). -/
private def manifest_Quantum : List Unit := [
  checkHeadline (@Vibe.thm_qtm_halfCoin_det_and_sq),
  checkHeadline (@Vibe.thm_qtm_zeta6_braiding_and_strang),
  checkHeadline (@Vibe.thm_qtm_mMeetDiff_unitary_and_order3),
  checkHeadline (@Vibe.thm_qtm_mMeetDiff_weights_and_eigenmodes),
  checkHeadline (@Vibe.thm_qtm_two_inert_mod9),
  checkHeadline (@Vibe.thm_qtm_no_eis_normSq_eq_two),
  checkHeadline (@Vibe.thm_qtm_0204_splitter_layers_unitary),
  checkHeadline (@Vibe.thm_qtm_0204_splitter_composite_unitary),
  checkHeadline (@Vibe.thm_qtm_0204_splitter_balanced_ports),
  checkHeadline (@Vibe.thm_qtm_0204_mach_zehnder_recombination),
  checkHeadline (@Vibe.thm_qtm_0205_psi2_schmidt_and_z6x6_envariance),
  checkHeadline (@Vibe.thm_qtm_0205_fine_graining_to_psi4),
  checkHeadline (@Vibe.thm_qtm_0205_s4_envariance_general),
  checkHeadline (@Vibe.thm_qtm_0205_s4_all_24_permutations),
  checkHeadline (@Vibe.thm_qtm_0205_reduced_density_matrix_scalar)
]

/-- `Vibe.BreakthroughAlgebra` (21 headline theorems). -/
private def manifest_BreakthroughAlgebra : List Unit := [
  checkHeadline (@Vibe.thm_bt2_cell24_triangles_and_gram),
  checkHeadline (@Vibe.thm_bt2_a24_plus_4I_pos_semidef),
  checkHeadline (@Vibe.thm_bt2_a24_min_eigenvector_neg4),
  checkHeadline (@Vibe.thm_bt2_plaquette_tilted_hessian_sos),
  checkHeadline (@Vibe.thm_bt2_combes_thomas_cubic_majorant),
  checkHeadline (@Vibe.thm_bt2_combes_thomas_mass_gap_margin),
  checkHeadline (@Vibe.thm_bt2_d4_z4_bivector_ratio_two),
  checkHeadline (@Vibe.thm_bt3_catalyst_L7_trace_and_unitarity),
  checkHeadline (@Vibe.thm_bt3_catalyst_L7_infinite_order),
  checkHeadline (@Vibe.thm_bt3_eisenstein_molecule_exact),
  checkHeadline (@Vibe.thm_bt3_dfs_S12_S23_dense_su2),
  checkHeadline (@Vibe.thm_bt3_dfs_6spin_casimir_sector_and_su9_dims),
  checkHeadline (@Vibe.thm_bt4a_cayley_14_terms_and_closed_form),
  checkHeadline (@Vibe.thm_bt4a_smg_ground_state_and_frustration_free),
  checkHeadline (@Vibe.thm_bt4a_smg_minpoly_and_spectrum_multiplicities),
  checkHeadline (@Vibe.thm_bt4a_smg_sos_positivity_and_unique_ground_state),
  checkHeadline (@Vibe.thm_bt4a_smg_zero_bilinear_contamination_and_condensate),
  checkHeadline (@Vibe.thm_bt4b_nelson_barr_4x4_symbolic),
  checkHeadline (@Vibe.thm_bt4b_nelson_barr_5x5_symbolic),
  checkHeadline (@Vibe.thm_bt4b_nelson_barr_concrete_witnesses),
  checkHeadline (@Vibe.thm_bt4b_nelson_barr_cp_broken_jarlskog_witness)
]

/-- `Vibe.Countermodels` (14 headline theorems). -/
private def manifest_Countermodels : List Unit := [
  checkHeadline (@Vibe.thm_cm_general_stabilizer_preservation),
  checkHeadline (@Vibe.thm_cm_two_site_symmetric_beat_fixes_zero),
  checkHeadline (@Vibe.thm_cm_symmetric_totality_orbit_invariant),
  checkHeadline (@Vibe.thm_cm_two_zeros_separation),
  checkHeadline (@Vibe.thm_cm_central_trinomial_counts),
  checkHeadline (@Vibe.thm_cm_two_site_rule_census),
  checkHeadline (@Vibe.thm_cm_countermodel_singleton),
  checkHeadline (@Vibe.thm_cm_countermodel_1d_c2),
  checkHeadline (@Vibe.thm_cm_countermodel_free_tn_and_on),
  checkHeadline (@Vibe.thm_cm_countermodel_octonion_nonassociative),
  checkHeadline (@Vibe.thm_cm_countermodel_a4_and_b4_roots),
  checkHeadline (@Vibe.thm_cm_countermodel_euclidean_3433),
  checkHeadline (@Vibe.thm_cm_countermodel_static_vacuum_achiral),
  checkHeadline (@Vibe.thm_cm_five_competing_universes_separation)
]

/-- `Vibe.ParityUniqueness` (14 headline theorems). -/
private def manifest_ParityUniqueness : List Unit := [
  checkHeadline (@Vibe.thm_pu_dn_self_dual_iff_four),
  checkHeadline (@Vibe.thm_pu_dn_facet_vertex_uniformity_iff_four),
  checkHeadline (@Vibe.thm_pu_coxeter_character_even_p),
  checkHeadline (@Vibe.thm_pu_gram_det_343p),
  checkHeadline (@Vibe.thm_pu_parity_and_finite_covolume_uniquely_force_3434),
  checkHeadline (@Vibe.thm_pu_class_swap_left_involution_and_parity),
  checkHeadline (@Vibe.thm_pu_infinite_mesh_J_config_neutrality),
  checkHeadline (@Vibe.thm_pu_infinite_mesh_involutive_neutrality),
  checkHeadline (@Vibe.thm_pu_witness_C_odd_and_L_breaks_PhiOdd),
  checkHeadline (@Vibe.thm_pu_hurwitz_2t_closure_and_order_24),
  checkHeadline (@Vibe.thm_pu_q8_and_h_generate_2t),
  checkHeadline (@Vibe.thm_pu_2t_polar_facet_normal_duality),
  checkHeadline (@Vibe.thm_pu_even_parity_t4_shortest_is_d4),
  checkHeadline (@Vibe.thm_pu_torsor_chart_independence)
]

/-- `Vibe.CausalFoliation` (11 headline theorems). -/
private def manifest_CausalFoliation : List Unit := [
  checkHeadline (@Vibe.thm_cf_facet_pairing_free_involution),
  checkHeadline (@Vibe.thm_cf_edge_swap_involution_and_comm),
  checkHeadline (@Vibe.thm_cf_stream_eq_rev_comp_edge_swap),
  checkHeadline (@Vibe.thm_cf_on_site_commutes_with_rev_and_disjoint_edge),
  checkHeadline (@Vibe.thm_cf_beat_factorization_R_Eswap_W),
  checkHeadline (@Vibe.thm_cf_tomonaga_schwinger_foliation_invariance),
  checkHeadline (@Vibe.thm_cf_valid_cut_lipschitz_and_diamond),
  checkHeadline (@Vibe.thm_cf_vibe_causal_foliation_invariance),
  checkHeadline (@Vibe.thm_cf_spacelike_microcausality),
  checkHeadline (@Vibe.thm_cf_activity_zero_iff_v1),
  checkHeadline (@Vibe.thm_cf_edge_swap_conserves_Q_and_D)
]

/-- `Vibe.SpectralSharp` (12 headline theorems). -/
private def manifest_SpectralSharp : List Unit := [
  checkHeadline (@Vibe.thm_ss_reciprocal_edge_amgm),
  checkHeadline (@Vibe.thm_ss_finite_reciprocal_schur_bound),
  checkHeadline (@Vibe.thm_ss_d4_comm_cliques_and_transitions),
  checkHeadline (@Vibe.thm_ss_foata_detailed_balance),
  checkHeadline (@Vibe.thm_ss_three_rational_row_sums),
  checkHeadline (@Vibe.thm_ss_spectral_radius_lt_12),
  checkHeadline (@Vibe.thm_ss_normalized_gap_gt_half),
  checkHeadline (@Vibe.thm_ss_refined_3rat_bound),
  checkHeadline (@Vibe.thm_ss_racg_subgraph_schur_bound),
  checkHeadline (@Vibe.thm_ss_stratum_rayleigh_exact),
  checkHeadline (@Vibe.thm_ss_rayleigh_lower_gt_11),
  checkHeadline (@Vibe.thm_ss_spectral_bracket_11_12)
]

/-- `Vibe.BallisticDoublon` (12 headline theorems). -/
private def manifest_BallisticDoublon : List Unit := [
  checkHeadline (@Vibe.thm_bd_twiceForm_baseCenter_and_height),
  checkHeadline (@Vibe.thm_bd_coxeter_antipodal_sum_six),
  checkHeadline (@Vibe.thm_bd_hyperbolic_height_convexity),
  checkHeadline (@Vibe.thm_bd_word_height_pure_even_integer),
  checkHeadline (@Vibe.thm_bd_frontier_no_antipodal_arrival_pair),
  checkHeadline (@Vibe.thm_bd_ballistic_recurrence_strict_growth),
  checkHeadline (@Vibe.thm_bd_ballistic_no_periodic_compacton),
  checkHeadline (@Vibe.thm_bd_coin_strict_outward_transmission),
  checkHeadline (@Vibe.thm_bd_frontier_leakage_exact_eigenvalues),
  checkHeadline (@Vibe.thm_bd_doublon_eigenvalue_unit_modulus),
  checkHeadline (@Vibe.thm_bd_doublon_infinite_line_eigenstate),
  checkHeadline (@Vibe.thm_bd_doublon_exact_norm_and_ipr)
]

/-- `Vibe.HolographicCode` (9 headline theorems). -/
private def manifest_HolographicCode : List Unit := [
  checkHeadline (@Vibe.thm_hc_wf4_generators_match_chirality),
  checkHeadline (@Vibe.thm_hc_s3_clifford_homomorphism),
  checkHeadline (@Vibe.thm_hc_orthogonal_block_decomposition),
  checkHeadline (@Vibe.thm_hc_w9_weight4_vs_weight6_split),
  checkHeadline (@Vibe.thm_hc_code_24_1_8_stabilizer_valid),
  checkHeadline (@Vibe.thm_hc_code_24_1_8_wf4_covariant),
  checkHeadline (@Vibe.thm_hc_code_24_1_8_triality_bulk_logical),
  checkHeadline (@Vibe.thm_hc_code_24_0_6_lagrangian_wf4_covariant),
  checkHeadline (@Vibe.thm_hc_native_d4_css_obstruction)
]

/-- `Vibe.HolographicCodeExt` (9 headline theorems). -/
private def manifest_HolographicCodeExt : List Unit := [
  checkHeadline (@Vibe.thm_hce_darboux_dual_basis_and_completeness),
  checkHeadline (@Vibe.thm_hce_wf4_orbit_collapse_5_and_7),
  checkHeadline (@Vibe.thm_hce_5uniform_bulk23_and_pure24),
  checkHeadline (@Vibe.thm_hce_pure24_exact_distance_6),
  checkHeadline (@Vibe.thm_hce_bulk23_all_7erasure_recovery),
  checkHeadline (@Vibe.thm_hce_bulk23_exact_distance_8),
  checkHeadline (@Vibe.thm_hce_3434_height_parity_and_inward_le_3),
  checkHeadline (@Vibe.thm_hce_bulk23_dock_isometric_pushing),
  checkHeadline (@Vibe.thm_hce_infinite_radius_happy_isometry_and_greedy_reconstruction)
]

/-- `Vibe.D4MassGap` (13 headline theorems). -/
private def manifest_D4MassGap : List Unit := [
  checkHeadline (@Vibe.thm_mg_d4_pos_roots_and_frozen_rp),
  checkHeadline (@Vibe.thm_mg_unfixed_L12_and_axial_M11_blocks),
  checkHeadline (@Vibe.thm_mg_axial_perron_eigenvector_and_bracket),
  checkHeadline (@Vibe.thm_mg_su2_vmf_spectral_gap_and_variance_identities),
  checkHeadline (@Vibe.thm_mg_su2_thresholds_and_be_ratios),
  checkHeadline (@Vibe.thm_mg_dobrushin_power_and_geometric_decay),
  checkHeadline (@Vibe.thm_mg_d4_axial_dobrushin_instantiation),
  checkHeadline (@Vibe.thm_mg_h12_graph_and_3forest_partition),
  checkHeadline (@Vibe.thm_mg_h12_exact_fractional_arboricity_32_over_11),
  checkHeadline (@Vibe.thm_mg_bfs_polymer_step_ratio_all_n),
  checkHeadline (@Vibe.thm_mg_d4_tetrahedra_per_triangle_eq_3),
  checkHeadline (@Vibe.thm_mg_su3_closed_form_w1_beyond_be),
  checkHeadline (@Vibe.thm_mg_su3_axial_dobrushin_instantiation)
]

/-- `Vibe.D4MassGapExt` (11 headline theorems). -/
private def manifest_D4MassGapExt : List Unit := [
  checkHeadline (@Vibe.thm_mge_alt_x0_planes_forest_rp_and_acyclic),
  checkHeadline (@Vibe.thm_mge_alt_x0_planes_quotient_M88_structure),
  checkHeadline (@Vibe.thm_mge_alt_x0_planes_spectral_bound_and_contraction),
  checkHeadline (@Vibe.thm_mge_su3_staple_convex_hull_algebraic),
  checkHeadline (@Vibe.thm_mge_su3_maximal_torus_and_cardano_invariants),
  checkHeadline (@Vibe.thm_mge_su3_weyl_dim_and_k2_casimir_spectrum),
  checkHeadline (@Vibe.thm_mge_su3_pieri_branching_and_weight_sectors),
  checkHeadline (@Vibe.thm_mge_su2_chordal_region1_and_region3_bounds),
  checkHeadline (@Vibe.thm_mge_su2_wedge_coverage_and_block_matrix),
  checkHeadline (@Vibe.thm_mge_su2_wedge_dobrushin_contraction),
  checkHeadline (@Vibe.thm_mge_su2_and_su3_sharp_threshold_ratios)
]

/-- `Vibe.SpectralSharpExt` (9 headline theorems). -/
private def manifest_SpectralSharpExt : List Unit := [
  checkHeadline (@Vibe.thm_sse_wf4_automorphisms_and_216_cliques),
  checkHeadline (@Vibe.thm_sse_depth2_automaton_and_shell_growth),
  checkHeadline (@Vibe.thm_sse_depth2_flag_reciprocity),
  checkHeadline (@Vibe.thm_sse_depth2_nagnibeda_upper_bound),
  checkHeadline (@Vibe.thm_sse_depth2_subgraph_schur_bound),
  checkHeadline (@Vibe.thm_sse_q3_link_and_zero_cascade),
  checkHeadline (@Vibe.thm_sse_cf_57_orbits_and_exact_word_sum),
  checkHeadline (@Vibe.thm_sse_cf_lower_bound),
  checkHeadline (@Vibe.thm_sse_combined_spectral_bracket)
]

/-- `Vibe.CompositeTrion` (9 headline theorems). -/
private def manifest_CompositeTrion : List Unit := [
  checkHeadline (@Vibe.thm_ct_trion_eigenvalue_and_ratio),
  checkHeadline (@Vibe.thm_ct_trion_gate_and_collision_modes),
  checkHeadline (@Vibe.thm_ct_trion_shift_pullback_exact),
  checkHeadline (@Vibe.thm_ct_trion_infinite_line_eigenstate),
  checkHeadline (@Vibe.thm_ct_trion_norm_contact_and_ipr),
  checkHeadline (@Vibe.thm_ct_trion_gap_separation),
  checkHeadline (@Vibe.thm_ct_mpair_gap_margin),
  checkHeadline (@Vibe.thm_ct_hyperbolic_excision_pocket),
  checkHeadline (@Vibe.thm_ct_holographic_rate_depressed_cubic)
]

/-- `Vibe.DynamicalHolography` (10 headline theorems). -/
private def manifest_DynamicalHolography : List Unit := [
  checkHeadline (@Vibe.dh_mpair_trivial_on_code),
  checkHeadline (@Vibe.dh_monomial_fock_clifford_classification),
  checkHeadline (@Vibe.dh_single_edge_wf4_nogo),
  checkHeadline (@Vibe.dh_ustar_and_unn_symplectic_covariant),
  checkHeadline (@Vibe.dh_floquet_and_boundary_lift_algebra),
  checkHeadline (@Vibe.dh_dock_clifford_uniform_and_streaming_audit),
  checkHeadline (@Vibe.dh_happy_b1_d40_and_b2_d98),
  checkHeadline (@Vibe.dh_b1_single_cone_threshold),
  checkHeadline (@Vibe.dh_cusp_d0_gauss_law_and_dge1_cliques),
  checkHeadline (@Vibe.dh_b1_stabilizer_code_contraction_invariants)
]

/-- `Vibe.UniversalityObstructions` (7 headline theorems). -/
private def manifest_UniversalityObstructions : List Unit := [
  checkHeadline (@Vibe.thm_univ_z216_parity_and_role_multiset_all_time),
  checkHeadline (@Vibe.thm_univ_dispersion_floor_and_rapidity_nogo),
  checkHeadline (@Vibe.thm_univ_mpair_ceiling_and_role_pigeonhole),
  checkHeadline (@Vibe.thm_univ_yb_crossing_and_dim_ceiling),
  checkHeadline (@Vibe.thm_univ_unitary_halting_nogo_and_w0_clearance),
  checkHeadline (@Vibe.thm_univ_geodesic_2plane_and_junction_cap),
  checkHeadline (@Vibe.thm_univ_mod2_triality_and_l7_bragg_gap)
]

/-- `Vibe.StandardModelCore` (6 headline theorems). -/
private def manifest_StandardModelCore : List Unit := [
  checkHeadline (@Vibe.thm_sm_anomaly_cancellation_and_z6_quotient),
  checkHeadline (@Vibe.thm_sm_so5_custodial_rho_one_and_center_parity),
  checkHeadline (@Vibe.thm_sm_pure_zomega_slab_ir_light_mass),
  checkHeadline (@Vibe.thm_sm_asl23_two_transitivity_and_oh_triality_obstruction),
  checkHeadline (@Vibe.thm_sm_ckr_3d_bosonization_and_fermion_exchange),
  checkHeadline (@Vibe.thm_sm_cusp_shell_recurrence_and_baryon_charge)
]

/-- `Vibe.StandardModelMathlib` (10 headline theorems). -/
private def manifest_StandardModelMathlib : List Unit := [
  checkHeadline (@Vibe.thm_ml_pure_ternary_odd_dim_parity_obstruction),
  checkHeadline (@Vibe.thm_ml_ternary_qutrit_power_odd),
  checkHeadline (@Vibe.thm_ml_so5_custodial_rho_eq_one_real),
  checkHeadline (@Vibe.thm_ml_su3w_custodial_violation_real),
  checkHeadline (@Vibe.thm_ml_su3w_unitary_and_zeta18_complex),
  checkHeadline (@Vibe.thm_ml_z6_sm_quotient_and_baryon_quantization),
  checkHeadline (@Vibe.thm_ml_steinberg_cubic_and_zeta18_gap_real),
  checkHeadline (@Vibe.thm_ml_d4_outer_triality_fprim_det),
  checkHeadline (@Vibe.thm_ml_d4_honeycomb_duality_and_villain_sd),
  checkHeadline (@Vibe.thm_ml_2tr_character_table_and_rank1_origin)
]

/-- `Vibe.LogicEmergence` (7 headline theorems). -/
private def manifest_LogicEmergence : List Unit := [
  checkHeadline (@Vibe.thm_le_bug1_e_invariance_vs_intermodel_counterexample),
  checkHeadline (@Vibe.thm_le_bug2_equiv_disjunction_counterexample_and_eqvgen_join),
  checkHeadline (@Vibe.thm_le_bug3_exogenous_measure_contradiction_and_pushforward_fix),
  checkHeadline (@Vibe.thm_le_strict_transitivity_and_ouroboros_collapse),
  checkHeadline (@Vibe.thm_le_constrained_asymmetry_and_non_transitivity),
  checkHeadline (@Vibe.thm_le_vibe_z2_parity_and_z6_quotient_emergence),
  checkHeadline (@Vibe.thm_le_vibe_d4_triality_torus_emergence)
]

/-- `Vibe.PlebanskiDarkFlux` (8 headline theorems). -/
private def manifest_PlebanskiDarkFlux : List Unit := [
  checkHeadline (@Vibe.thm_untwisted_anomaly_uniqueness),
  checkHeadline (@Vibe.thm_vq2_dark_sector_stability),
  checkHeadline (@Vibe.pleb_simplex_wedge_identities),
  checkHeadline (@Vibe.thm_plebanski_24cell_simplicity_and_closure),
  checkHeadline (@Vibe.thm_nec_monotone_velocity_bound),
  checkHeadline (@Vibe.thm_q8_witten_z2_flux_parity),
  checkHeadline (@Vibe.thm_zero_veto_3smooth_closure),
  checkHeadline (@Vibe.thm_wf4_spin2_diffeo_uniqueness)
]

/-- Complete `400`-theorem manifest aggregator across all `35` `Vibe` proof modules. -/
public def vibeHeadlineManifestCount : Nat :=
  (manifest_Tone ++
   manifest_Algebra ++
   manifest_Rule ++
   manifest_Geometry ++
   manifest_Gauge ++
   manifest_Limits ++
   manifest_SchurGap ++
   manifest_Uniqueness4D ++
   manifest_CoxeterTransport ++
   manifest_FockBeat ++
   manifest_Chirality ++
   manifest_CuspGrowth ++
   manifest_Quantum ++
   manifest_BreakthroughAlgebra ++
   manifest_Countermodels ++
   manifest_ParityUniqueness ++
   manifest_CausalFoliation ++
   manifest_SpectralSharp ++
   manifest_BallisticDoublon ++
   manifest_HolographicCode ++
   manifest_HolographicCodeExt ++
   manifest_D4MassGap ++
   manifest_D4MassGapExt ++
   manifest_SpectralSharpExt ++
   manifest_CompositeTrion ++
   manifest_DynamicalHolography ++
   manifest_UniversalityObstructions ++
   manifest_StandardModelCore ++
   manifest_StandardModelMathlib ++
   manifest_LogicEmergence ++
   manifest_PlebanskiDarkFlux).length

/-- `Vibe.LineScattering` (7 headline theorems). -/
private def manifest_LineScattering : List Unit := [
  checkHeadline (@Vibe.LineScattering.thm_line_mode_eigenvector),
  checkHeadline (@Vibe.LineScattering.thm_line_s_is_yang),
  checkHeadline (@Vibe.LineScattering.thm_line_opposite_reflects),
  checkHeadline (@Vibe.LineScattering.thm_line_spectator_symmetric),
  checkHeadline (@Vibe.LineScattering.thm_line_yang_baxter_one_tone),
  checkHeadline (@Vibe.LineScattering.thm_line_mixed_tone_defect),
  checkHeadline (@Vibe.LineScattering.thm_line_opposite_between_factorizes)
]

/-- `Vibe.NoContraction` (3 headline theorems). -/
private def manifest_NoContraction : List Unit := [
  checkHeadline (@Vibe.thm_ms_no_strict_contraction_of_surjective),
  checkHeadline (@Vibe.thm_ms_reversible_no_global_contraction),
  checkHeadline (@Vibe.thm_ms_reversible_some_pair_not_shrunk)
]

/-- `Vibe.PairRules` (10 headline theorems). -/
private def manifest_PairRules : List Unit := [
  checkHeadline (@Vibe.pr_mem_allPairs),
  checkHeadline (@Vibe.pr_table_sumPres),
  checkHeadline (@Vibe.pr_table_code),
  checkHeadline (@Vibe.pr_code_table),
  checkHeadline (@Vibe.pr_rule_codes_eq),
  checkHeadline (@Vibe.thm_pair_rules_card),
  checkHeadline (@Vibe.pr_rule_of),
  checkHeadline (@Vibe.thm_pair_rule_classes),
  checkHeadline (@Vibe.thm_pair_rule_vacuum_iff),
  checkHeadline (@Vibe.thm_pair_rule_inverse)
]

/-- `Vibe.PartitionedStep` (2 headline theorems). -/
private def manifest_PartitionedStep : List Unit := [
  checkHeadline (@Vibe.thm_cf_partitioned_block_global_invariants),
  checkHeadline (@Vibe.thm_cf_partitioned_rule_step_bijective)
]

/-- `Vibe.QuantumBoundary` (2 headline theorems). -/
private def manifest_QuantumBoundary : List Unit := [
  checkHeadline (@Vibe.QuantumBoundary.thm_q_dephased_unitary_doubly_stochastic),
  checkHeadline (@Vibe.QuantumBoundary.thm_q_dephased_line_coin)
]

/-- `Vibe.QuantumGates` (3 headline theorems). -/
private def manifest_QuantumGates : List Unit := [
  checkHeadline (@Vibe.QuantumGates.thm_q_meet_gates_unitary),
  checkHeadline (@Vibe.QuantumGates.thm_q_role_swap_two_thirds),
  checkHeadline (@Vibe.QuantumGates.thm_q_sym3_cz_minus_one)
]

/-- `Vibe.QuantumMemory` (2 headline theorems). -/
private def manifest_QuantumMemory : List Unit := [
  checkHeadline (@Vibe.QuantumMemory.thm_q_code_space_invariant),
  checkHeadline (@Vibe.QuantumMemory.thm_q_pair_mixer_breaks_dfs)
]

/-- `Vibe.SimulationContract` (8 headline theorems). -/
private def manifest_SimulationContract : List Unit := [
  checkHeadline (@Vibe.SimulationContract.thm_cf_simulation_contract_commutes_composition),
  checkHeadline (@Vibe.SimulationContract.thm_cf_simulation_contract_composition),
  checkHeadline (@Vibe.SimulationContract.thm_cf_simulation_contract_power),
  checkHeadline (@Vibe.SimulationContract.thm_cf_simulation_contract_identity),
  checkHeadline (@Vibe.SimulationContract.thm_cf_simulation_contract_subset_invariant),
  checkHeadline (@Vibe.SimulationContract.thm_cf_simulation_contract_rule_unique),
  checkHeadline (@Vibe.SimulationContract.thm_cf_full_swap_brick2_contract),
  checkHeadline (@Vibe.SimulationContract.thm_cf_full_swap_brick2_contract_two_rounds)
]

/-- `Vibe.WireInvariant` (11 headline theorems). -/
private def manifest_WireInvariant : List Unit := [
  checkHeadline (@Vibe.WireInvariant.thm_wire_bca_passengers),
  checkHeadline (@Vibe.WireInvariant.thm_wire_cab_passengers),
  checkHeadline (@Vibe.WireInvariant.thm_wire_cab_id_backward),
  checkHeadline (@Vibe.WireInvariant.thm_wire_cab_id_no_forward),
  checkHeadline (@Vibe.WireInvariant.thm_wire_bca_rays),
  checkHeadline (@Vibe.WireInvariant.thm_wire_cab_rays),
  checkHeadline (@Vibe.WireInvariant.thm_wire_cab_id_left_ray),
  checkHeadline (@Vibe.WireInvariant.thm_wire_bca_no_neg),
  checkHeadline (@Vibe.WireInvariant.thm_wire_cab_no_neg),
  checkHeadline (@Vibe.WireInvariant.thm_wire_bca_no_min_max),
  checkHeadline (@Vibe.WireInvariant.thm_wire_cab_no_min_max)
]

/-- `Vibe.Compute.Association` (6 headline theorems). -/
private def manifest_Compute_Association : List Unit := [
  checkHeadline (@Vibe.Compute.thm_cmp_completion_charges.{0}),
  checkHeadline (@Vibe.Compute.thm_cmp_vacuum_rule_completion_bound.{0}),
  checkHeadline (@Vibe.Compute.thm_cmp_no_erase_flip_completion.{0}),
  checkHeadline (@Vibe.Compute.thm_cmp_vacuum_rule_no_erase_flip.{0}),
  checkHeadline (@Vibe.Compute.thm_cmp_closed_coincidence_transient.{0, 0}),
  checkHeadline (@Vibe.Compute.thm_cmp_closed_box_completion_transient.{0})
]

/-- `Vibe.Compute.BeatLink` (7 headline theorems). -/
private def manifest_Compute_BeatLink : List Unit := [
  checkHeadline (@Vibe.Compute.gen_bare_beat_coeffs_eq),
  checkHeadline (@Vibe.Compute.gen_bare_beat_layers_eq),
  checkHeadline (@Vibe.Compute.gen_bare_beat_beat_eq),
  checkHeadline (@Vibe.Compute.gen_bare_beat_family_eq),
  checkHeadline (@Vibe.Compute.gen_bare_beat_neighbours_eq),
  checkHeadline (@Vibe.Compute.thm_beat_link_family),
  checkHeadline (@Vibe.Compute.thm_beat_link_q0_gates)
]

/-- `Vibe.Compute.Boundary` (10 headline theorems). -/
private def manifest_Compute_Boundary : List Unit := [
  checkHeadline (@Vibe.Compute.thm_cmp_perturbation_never_meets.{0}),
  checkHeadline (@Vibe.Compute.thm_cmp_finite_perm_return.{0}),
  checkHeadline (@Vibe.Compute.thm_cmp_closed_box_no_repair.{0}),
  checkHeadline (@Vibe.Compute.thm_cmp_export_injective.{0, 0, 0}),
  checkHeadline (@Vibe.Compute.thm_cmp_landauer_export.{0}),
  checkHeadline (@Vibe.Compute.thm_cmp_d_theorem_abstract.{0, 0, 0}),
  checkHeadline (@Vibe.Compute.thm_cmp_d_theorem.{0}),
  checkHeadline (@Vibe.Compute.thm_cmp_d_no_repair_of_erase.{0}),
  checkHeadline (@Vibe.Compute.thm_cmp_z3_linear_additive),
  checkHeadline (@Vibe.Compute.thm_cmp_z3_superposition.{0})
]

/-- `Vibe.Compute.Canon` (14 headline theorems). -/
private def manifest_Compute_Canon : List Unit := [
  checkHeadline (@Vibe.Compute.Canon.thm_canon_rule_group_iff_core),
  checkHeadline (@Vibe.Compute.Canon.thm_canon_rule_code_equiv),
  checkHeadline (@Vibe.Compute.Canon.thm_canon_rule_group_card),
  checkHeadline (@Vibe.Compute.Canon.thm_canon_rule_group_gen),
  checkHeadline (@Vibe.Compute.Canon.thm_canon_klein),
  checkHeadline (@Vibe.Compute.Canon.thm_canon_orbit_iff_core),
  checkHeadline (@Vibe.Compute.Canon.thm_canon_rule_classes),
  checkHeadline (@Vibe.Compute.Canon.thm_canon_block_eq_core),
  checkHeadline (@Vibe.Compute.Canon.thm_canon_block_perm),
  checkHeadline (@Vibe.Compute.Canon.thm_canon_round_perm.{0}),
  checkHeadline (@Vibe.Compute.Canon.thm_canon_round_eq_core.{0}),
  checkHeadline (@Vibe.Compute.Canon.thm_canon_no_strict_contraction.{0}),
  checkHeadline (@Vibe.Compute.Canon.thm_canon_no_contraction_int_iff),
  checkHeadline (@Vibe.Compute.Canon.thm_canon_bijection_no_collapse.{0})
]

/-- `Vibe.Compute.Charge` (8 headline theorems). -/
private def manifest_Compute_Charge : List Unit := [
  checkHeadline (@Vibe.Compute.thm_cmp_relcharge_conserved.{0}),
  checkHeadline (@Vibe.Compute.thm_cmp_relcharge_one_sign),
  checkHeadline (@Vibe.Compute.thm_cmp_offcount_charge_bound.{0}),
  checkHeadline (@Vibe.Compute.thm_cmp_species_never_grow.{0}),
  checkHeadline (@Vibe.Compute.thm_cmp_copies_need_charge.{0}),
  checkHeadline (@Vibe.Compute.thm_cmp_copies_need_species.{0}),
  checkHeadline (@Vibe.Compute.thm_cmp_quiet_cells),
  checkHeadline (@Vibe.Compute.thm_cmp_no_copy_without_food.{0})
]

/-- `Vibe.Compute.CoverDistance` (15 headline theorems). -/
private def manifest_Compute_CoverDistance : List Unit := [
  checkHeadline (@Vibe.Compute.GraphCover.thm_cover_exists_lift.{0, 0}),
  checkHeadline (@Vibe.Compute.GraphCover.thm_cover_lift_unique.{0, 0}),
  checkHeadline (@Vibe.Compute.GraphCover.thm_cover_dist_le.{0, 0}),
  checkHeadline (@Vibe.Compute.GraphCover.thm_cover_dist_eq.{0, 0}),
  checkHeadline (@Vibe.Compute.GraphCover.thm_cover_injOn_ball.{0, 0}),
  checkHeadline (@Vibe.Compute.GraphCover.thm_cover_adj_ball.{0, 0}),
  checkHeadline (@Vibe.Compute.GraphCover.thm_cover_ball_iso.{0, 0}),
  checkHeadline (@Vibe.Compute.GraphCover.thm_cover_lifts_of_injOn.{0, 0}),
  checkHeadline (@Vibe.Compute.GraphCover.thm_cover_lifts_of_ball_embeds.{0, 0}),
  checkHeadline (@Vibe.Compute.GraphCover.thm_cover_systole_le.{0, 0}),
  checkHeadline (@Vibe.Compute.GraphCover.thm_cover_systole_sharp.{0, 0}),
  checkHeadline (@Vibe.Compute.GraphCover.thm_cover_dist_gap.{0, 0}),
  checkHeadline (@Vibe.Compute.GraphCover.thm_cover_systole_even.{0, 0}),
  checkHeadline (@Vibe.Compute.GraphCover.thm_cover_systole_odd.{0, 0}),
  checkHeadline (@Vibe.Compute.GraphCover.thm_surface_limited_reads.{0, 0})
]

/-- `Vibe.Compute.Devices` (16 headline theorems). -/
private def manifest_Compute_Devices : List Unit := [
  checkHeadline (@Vibe.Compute.Devices.thm_dev_one_input_card),
  checkHeadline (@Vibe.Compute.Devices.gen_devices_rule_eq),
  checkHeadline (@Vibe.Compute.Devices.gen_devices_word_index_eq),
  checkHeadline (@Vibe.Compute.Devices.gen_devices_identity_census_eq),
  checkHeadline (@Vibe.Compute.Devices.thm_dev_developments_distinct.{0, 0}),
  checkHeadline (@Vibe.Compute.Devices.thm_dev_identity_one_input.{0}),
  checkHeadline (@Vibe.Compute.Devices.thm_dev_identity_realizes_one_input.{0}),
  checkHeadline (@Vibe.Compute.Devices.thm_dev_identity_exactly_one_input.{0}),
  checkHeadline (@Vibe.Compute.Devices.thm_dev_capacity_ceiling.{0, 0}),
  checkHeadline (@Vibe.Compute.Devices.thm_dev_template_no_go.{0, 0}),
  checkHeadline (@Vibe.Compute.Devices.thm_dev_credit_needs_both_inputs.{0, 0}),
  checkHeadline (@Vibe.Compute.Devices.thm_dev_collective_one_device.{0, 0, 0}),
  checkHeadline (@Vibe.Compute.Devices.thm_dev_apart_one_input.{0}),
  checkHeadline (@Vibe.Compute.Devices.thm_dev_apart_any_entities.{0, 0, 0}),
  checkHeadline (@Vibe.Compute.Devices.thm_dev_interaction_headroom.{0, 0}),
  checkHeadline (@Vibe.Compute.Devices.thm_dev_primitive_developments_distinct)
]

/-- `Vibe.Compute.FiniteInteractionSpecies` (6 headline theorems). -/
private def manifest_Compute_FiniteInteractionSpecies : List Unit := [
  checkHeadline (@Vibe.Compute.SpeciesLine.thm_fis_occupancy_meetings),
  checkHeadline (@Vibe.Compute.SpeciesLine.thm_fis_mover_meetings),
  checkHeadline (@Vibe.Compute.SpeciesLine.thm_fis_mirror_meetings),
  checkHeadline (@Vibe.Compute.SpeciesLine.thm_fis_static_meet_forever),
  checkHeadline (@Vibe.Compute.SpeciesLine.thm_fis_species_cells),
  checkHeadline (@Vibe.Compute.SpeciesLine.thm_fis_static_cells)
]

/-- `Vibe.Compute.FiniteInteractionWire` (6 headline theorems). -/
private def manifest_Compute_FiniteInteractionWire : List Unit := [
  checkHeadline (@Vibe.Compute.WireLine.thm_fiw_deficit_two_steps),
  checkHeadline (@Vibe.Compute.WireLine.thm_fiw_grid_finite),
  checkHeadline (@Vibe.Compute.WireLine.thm_fiw_ray_bridge),
  checkHeadline (@Vibe.Compute.WireLine.thm_fiw_line_finite),
  checkHeadline (@Vibe.Compute.WireLine.thm_fiw_free_flight),
  checkHeadline (@Vibe.Compute.WireLine.thm_fiw_wire_cells)
]

/-- `Vibe.Compute.Frontier` (9 headline theorems). -/
private def manifest_Compute_Frontier : List Unit := [
  checkHeadline (@Vibe.Compute.Frontier.thm_frontier_discovered_field),
  checkHeadline (@Vibe.Compute.Frontier.thm_frontier_lights_iff),
  checkHeadline (@Vibe.Compute.Frontier.thm_frontier_never_early),
  checkHeadline (@Vibe.Compute.Frontier.thm_frontier_unreachable_dark),
  checkHeadline (@Vibe.Compute.Frontier.thm_frontier_readback_shortest),
  checkHeadline (@Vibe.Compute.Frontier.thm_frontier_readback_earlier),
  checkHeadline (@Vibe.Compute.Frontier.thm_frontier_readback_lucas),
  checkHeadline (@Vibe.Compute.Frontier.thm_frontier_isDist_simple_graph),
  checkHeadline (@Vibe.Compute.Frontier.thm_frontier_readback_simple_graph)
]

/-- `Vibe.Compute.GateSetRank` (6 headline theorems). -/
private def manifest_Compute_GateSetRank : List Unit := [
  checkHeadline (@Vibe.Compute.GateSetRank.thm_gsr_transpositions_involutive),
  checkHeadline (@Vibe.Compute.GateSetRank.gen_gsr_generators_eq),
  checkHeadline (@Vibe.Compute.GateSetRank.thm_gsr_sector_projector),
  checkHeadline (@Vibe.Compute.GateSetRank.thm_gsr_generators_in_sector),
  checkHeadline (@Vibe.Compute.GateSetRank.gen_gsr_krylov_degrees_eq),
  checkHeadline (@Vibe.Compute.GateSetRank.thm_gsr_krylov_degrees)
]

/-- `Vibe.Compute.KleeneCertificates` (8 headline theorems). -/
private def manifest_Compute_KleeneCertificates : List Unit := [
  checkHeadline (@Vibe.Compute.Kleene.gen_kleene_layouts_eq),
  checkHeadline (@Vibe.Compute.Kleene.thm_kleene_neg_width_nine),
  checkHeadline (@Vibe.Compute.Kleene.thm_kleene_min_max_width_twelve),
  checkHeadline (@Vibe.Compute.Kleene.thm_kleene_register_move.{0}),
  checkHeadline (@Vibe.Compute.Kleene.thm_kleene_register_stay.{0}),
  checkHeadline (@Vibe.Compute.Kleene.thm_kleene_counter_add_sub),
  checkHeadline (@Vibe.Compute.Kleene.gen_kleene_counter_eq),
  checkHeadline (@Vibe.Compute.Kleene.thm_kleene_counter_cases)
]

/-- `Vibe.Compute.LineScatteringExt` (17 headline theorems). -/
private def manifest_Compute_LineScatteringExt : List Unit := [
  checkHeadline (@Vibe.LineScatteringExt.thm_lsx_det_left_factor),
  checkHeadline (@Vibe.LineScatteringExt.thm_lsx_det_left_nonzero_point),
  checkHeadline (@Vibe.LineScatteringExt.thm_lsx_s_unique),
  checkHeadline (@Vibe.LineScatteringExt.thm_lsx_im_product),
  checkHeadline (@Vibe.LineScatteringExt.thm_lsx_rapidity_square),
  checkHeadline (@Vibe.LineScatteringExt.thm_lsx_rapidity_square_injective),
  checkHeadline (@Vibe.LineScatteringExt.thm_lsx_rapidity_nonzero),
  checkHeadline (@Vibe.LineScatteringExt.thm_lsx_velocity_rapidity),
  checkHeadline (@Vibe.LineScatteringExt.thm_lsx_two_to_one_factor),
  checkHeadline (@Vibe.LineScatteringExt.thm_lsx_rapidity_bridge),
  checkHeadline (@Vibe.LineScatteringExt.thm_lsx_doorb_mismatch_denominator),
  checkHeadline (@Vibe.LineScatteringExt.thm_lsx_doorb_coincidence),
  checkHeadline (@Vibe.LineScatteringExt.thm_lsx_doorb_orientations),
  checkHeadline (@Vibe.LineScatteringExt.thm_lsx_s_unique_field),
  checkHeadline (@Vibe.LineScatteringExt.thm_lsx_equal_rapidity_iff),
  checkHeadline (@Vibe.LineScatteringExt.thm_lsx_equal_velocity_iff),
  checkHeadline (@Vibe.LineScatteringExt.thm_lsx_doorb_symmetric_diffracts)
]

/-- `Vibe.Compute.LinesMeetOnce` (7 headline theorems). -/
private def manifest_Compute_LinesMeetOnce : List Unit := [
  checkHeadline (@Vibe.Compute.thm_lines_meet_once_at_dock),
  checkHeadline (@Vibe.Compute.thm_lines_meet_once_lorentz),
  checkHeadline (@Vibe.Compute.thm_lines_meet_once),
  checkHeadline (@Vibe.Compute.gen_beat_roots_eq),
  checkHeadline (@Vibe.Compute.gen_beat_opposite_eq),
  checkHeadline (@Vibe.Compute.gen_beat_lines_eq),
  checkHeadline (@Vibe.Compute.gen_beat_line_centers_eq)
]

/-- `Vibe.Compute.Lumpability` (14 headline theorems). -/
private def manifest_Compute_Lumpability : List Unit := [
  checkHeadline (@Vibe.Compute.thm_lump_iff_no_conflict.{0, 0}),
  checkHeadline (@Vibe.Compute.thm_lump_window_conflict.{0, 0, 0}),
  checkHeadline (@Vibe.Compute.thm_lump_round_window_conflict.{0, 0, 0}),
  checkHeadline (@Vibe.Compute.thm_lump_mate_path_orientation_free.{0}),
  checkHeadline (@Vibe.Compute.thm_lump_lone_rule_dichotomy),
  checkHeadline (@Vibe.Compute.thm_lump_lone_hypotheses_of_charge),
  checkHeadline (@Vibe.Compute.thm_lump_lone_track.{0}),
  checkHeadline (@Vibe.Compute.thm_lump_lone_split_nogo.{0, 0, 0}),
  checkHeadline (@Vibe.Compute.thm_lump_full_swap_transport.{0, 0, 0, 0}),
  checkHeadline (@Vibe.Compute.thm_lump_split_decided_by_quotient.{0, 0, 0}),
  checkHeadline (@Vibe.Compute.thm_lump_line_witness_sound),
  checkHeadline (@Vibe.Compute.thm_lump_line_conflict_witnesses),
  checkHeadline (@Vibe.Compute.gen_lump_block_maps_eq),
  checkHeadline (@Vibe.Compute.gen_partitioned_ring_eq)
]

/-- `Vibe.Compute.MeshNoGo` (7 headline theorems). -/
private def manifest_Compute_MeshNoGo : List Unit := [
  checkHeadline (@Vibe.Compute.thm_nogo_layer_transport.{0}),
  checkHeadline (@Vibe.Compute.thm_nogo_transport_test.{0}),
  checkHeadline (@Vibe.Compute.thm_nogo_no_hereditary.{0}),
  checkHeadline (@Vibe.Compute.thm_nogo_feedback_cells.{0}),
  checkHeadline (@Vibe.Compute.thm_nogo_write_impossible.{0}),
  checkHeadline (@Vibe.Compute.thm_nogo_species_cells.{0}),
  checkHeadline (@Vibe.Compute.thm_nogo_hereditary_cells.{0})
]

/-- `Vibe.Compute.PairRuleLink` (2 headline theorems). -/
private def manifest_Compute_PairRuleLink : List Unit := [
  checkHeadline (@Vibe.PairRuleLink.gen_pair_tones_eq),
  checkHeadline (@Vibe.PairRuleLink.gen_pair_rules_eq)
]

/-- `Vibe.Compute.QuantumCoarse` (10 headline theorems). -/
private def manifest_Compute_QuantumCoarse : List Unit := [
  checkHeadline (@Vibe.Compute.thm_qc_lone_walk),
  checkHeadline (@Vibe.Compute.thm_qc_monomial_only_vacuum),
  checkHeadline (@Vibe.Compute.thm_qc_lone_branch),
  checkHeadline (@Vibe.Compute.thm_qc_coarse_nogo),
  checkHeadline (@Vibe.Compute.thm_qc_lone_split),
  checkHeadline (@Vibe.Compute.thm_qc_lone_targets),
  checkHeadline (@Vibe.Compute.gen_quantum_coarse_maps_eq),
  checkHeadline (@Vibe.Compute.thm_qc_declared_maps_lone),
  checkHeadline (@Vibe.Compute.thm_qc_declared_maps_nogo),
  checkHeadline (@Vibe.Compute.thm_qc_paired_sign_nogo)
]

/-- `Vibe.Compute.QuantumWalk` (24 headline theorems). -/
private def manifest_Compute_QuantumWalk : List Unit := [
  checkHeadline (@Vibe.Compute.groverCoin_apply.{0}),
  checkHeadline (@Vibe.Compute.thm_qw_coin_transpose.{0}),
  checkHeadline (@Vibe.Compute.groverCoin_mul_self.{0}),
  checkHeadline (@Vibe.Compute.thm_qw_coin_sq_eq_one_iff.{0}),
  checkHeadline (@Vibe.Compute.thm_qw_coin_orthogonal_iff.{0}),
  checkHeadline (@Vibe.Compute.thm_qw_coin_orthogonal_iff_domain.{0}),
  checkHeadline (@Vibe.Compute.thm_qw_coin_exists_iff.{0}),
  checkHeadline (@Vibe.Compute.thm_qw_grover_coin_orthogonal.{0}),
  checkHeadline (@Vibe.Compute.thm_qw_coin_two_is_swap.{0}),
  checkHeadline (@Vibe.Compute.thm_qw_two_div_mem_z_sixth_iff),
  checkHeadline (@Vibe.Compute.thm_qw_exact_degrees_le_24),
  checkHeadline (@Vibe.Compute.thm_qw_lab_degrees),
  checkHeadline (@Vibe.Compute.coinStep_eq_mulVec.{0, 0}),
  checkHeadline (@Vibe.Compute.thm_qw_walk_sum_sq.{0, 0}),
  checkHeadline (@Vibe.Compute.thm_qw_unmarked_uniform_fixed.{0, 0}),
  checkHeadline (@Vibe.Compute.thm_qw_unmarked_prob.{0}),
  checkHeadline (@Vibe.Compute.thm_qw_amplitudes_integral.{0}),
  checkHeadline (@Vibe.Compute.thm_qw_two_regular_amplitudes_unit.{0, 0}),
  checkHeadline (@Vibe.Compute.cycleFlip_involutive),
  checkHeadline (@Vibe.Compute.thm_qw_cycle_prob),
  checkHeadline (@Vibe.Compute.thm_qw_off_sector_never_reaches.{0, 0}),
  checkHeadline (@Vibe.Compute.thm_qw_sector_bound.{0, 0}),
  checkHeadline (@Vibe.Compute.thm_qw_line_confined_search_bound.{0, 0, 0}),
  checkHeadline (@Vibe.Compute.thm_qw_bare_u_search_bound.{0, 0, 0})
]

/-- `Vibe.Compute.Resonance` (10 headline theorems). -/
private def manifest_Compute_Resonance : List Unit := [
  checkHeadline (@Vibe.Compute.Resonance.thm_res_lucas_count),
  checkHeadline (@Vibe.Compute.Resonance.thm_res_lit_of_front),
  checkHeadline (@Vibe.Compute.Resonance.thm_res_square_distance),
  checkHeadline (@Vibe.Compute.Resonance.thm_res_square_lucas_front),
  checkHeadline (@Vibe.Compute.Resonance.thm_res_tri_distance),
  checkHeadline (@Vibe.Compute.Resonance.thm_res_tri_lucas_front),
  checkHeadline (@Vibe.Compute.Resonance.thm_res_lucas_base_two_fails),
  checkHeadline (@Vibe.Compute.Resonance.thm_res_uniform_field),
  checkHeadline (@Vibe.Compute.Resonance.thm_res_uniform_mode),
  checkHeadline (@Vibe.Compute.Resonance.thm_res_uniform_period_injective)
]

/-- `Vibe.Compute.Round` (4 headline theorems). -/
private def manifest_Compute_Round : List Unit := [
  checkHeadline (@Vibe.Compute.thm_cmp_round_perm_charge_negation.{0}),
  checkHeadline (@Vibe.Compute.thm_cmp_pair_rule_perm),
  checkHeadline (@Vibe.Compute.thm_cmp_recurrence_is_periodic.{0}),
  checkHeadline (@Vibe.Compute.thm_cmp_confined_period.{0})
]

/-- `Vibe.Compute.RuleCensus` (12 headline theorems). -/
private def manifest_Compute_RuleCensus : List Unit := [
  checkHeadline (@Vibe.RuleCensus.gen_rule_census_meta_eq),
  checkHeadline (@Vibe.RuleCensus.thm_rule_census_vacuum_classes),
  checkHeadline (@Vibe.RuleCensus.thm_rule_census_time_reversal),
  checkHeadline (@Vibe.RuleCensus.gen_rule_census_passengers_eq),
  checkHeadline (@Vibe.RuleCensus.thm_rule_census_passengers),
  checkHeadline (@Vibe.RuleCensus.thm_rule_census_sided_closure),
  checkHeadline (@Vibe.RuleCensus.gen_rule_census_closures_eq),
  checkHeadline (@Vibe.RuleCensus.gen_rule_census_cells_eq),
  checkHeadline (@Vibe.RuleCensus.thm_rule_census_cells),
  checkHeadline (@Vibe.RuleCensus.thm_rule_census_blind),
  checkHeadline (@Vibe.RuleCensus.thm_rule_census_wire_cells),
  checkHeadline (@Vibe.RuleCensus.thm_rule_census_wire_tone_equiv)
]

/-- `Vibe.Compute.SecondOrderZ3` (9 headline theorems). -/
private def manifest_Compute_SecondOrderZ3 : List Unit := [
  checkHeadline (@Vibe.Compute.SecondOrderZ3.thm_soz3_time_reversal),
  checkHeadline (@Vibe.Compute.SecondOrderZ3.thm_soz3_step_bijective),
  checkHeadline (@Vibe.Compute.SecondOrderZ3.thm_soz3_slice_pairs_permuted),
  checkHeadline (@Vibe.Compute.SecondOrderZ3.thm_soz3_linear_superposition),
  checkHeadline (@Vibe.Compute.SecondOrderZ3.thm_soz3_square_breaks_superposition),
  checkHeadline (@Vibe.Compute.SecondOrderZ3.thm_soz3_light_cone),
  checkHeadline (@Vibe.Compute.SecondOrderZ3.thm_soz3_front_geodesic_count),
  checkHeadline (@Vibe.Compute.SecondOrderZ3.thm_soz3_front_all_laws),
  checkHeadline (@Vibe.Compute.SecondOrderZ3.thm_soz3_front_simple_graph)
]

/-- `Vibe.Compute.SelectSteer` (13 headline theorems). -/
private def manifest_Compute_SelectSteer : List Unit := [
  checkHeadline (@Vibe.Compute.SelectSteer.thm_select_no_selector_of_pinned.{0}),
  checkHeadline (@Vibe.Compute.SelectSteer.thm_select_pinned_of_moved.{0}),
  checkHeadline (@Vibe.Compute.SelectSteer.thm_select_pinned_of_fixed.{0}),
  checkHeadline (@Vibe.Compute.SelectSteer.thm_select_fixed_cells.{0}),
  checkHeadline (@Vibe.Compute.SelectSteer.thm_select_t4_still.{0}),
  checkHeadline (@Vibe.Compute.SelectSteer.thm_select_t5_free_flight.{0}),
  checkHeadline (@Vibe.Compute.SelectSteer.thm_select_pinned_cells.{0}),
  checkHeadline (@Vibe.Compute.SelectSteer.thm_steer_none_of_occ.{0}),
  checkHeadline (@Vibe.Compute.SelectSteer.thm_steer_none_blind_cells.{0}),
  checkHeadline (@Vibe.Compute.SelectSteer.thm_steer_presence_blind_cells.{0}),
  checkHeadline (@Vibe.Compute.SelectSteer.thm_select_t1_t2_select),
  checkHeadline (@Vibe.Compute.SelectSteer.thm_select_value_presence_t45),
  checkHeadline (@Vibe.Compute.SelectSteer.thm_select_steer_cells.{0})
]

/-- `Vibe.Compute.Selection` (16 headline theorems). -/
private def manifest_Compute_Selection : List Unit := [
  checkHeadline (@Vibe.Selection.thm_sel_lemma_s.{0, 0}),
  checkHeadline (@Vibe.Selection.thm_sel_lemma_s_two_levels.{0}),
  checkHeadline (@Vibe.Selection.thm_sel_lemma_k.{0, 0}),
  checkHeadline (@Vibe.Selection.thm_sel_lemma_k_card.{0, 0}),
  checkHeadline (@Vibe.Selection.thm_sel_lemma_k_attained),
  checkHeadline (@Vibe.Selection.thm_sel_lemma_k_attained_card.{0, 0}),
  checkHeadline (@Vibe.Selection.thm_sel_blind_levels),
  checkHeadline (@Vibe.Selection.thm_sel_trit_levels),
  checkHeadline (@Vibe.Selection.thm_sel_lemma_k_blind_three_seven),
  checkHeadline (@Vibe.Selection.thm_sel_lemma_k_trit_five_seventeen),
  checkHeadline (@Vibe.Selection.thm_sel_lemma_t_injective.{0, 0}),
  checkHeadline (@Vibe.Selection.thm_sel_lemma_t.{0, 0}),
  checkHeadline (@Vibe.Selection.thm_sel_lemma_t_card.{0, 0}),
  checkHeadline (@Vibe.Selection.thm_sel_lemma_t_blind),
  checkHeadline (@Vibe.Selection.thm_sel_lemma_t_bijective.{0, 0}),
  checkHeadline (@Vibe.Selection.thm_sel_lemma_t_attained)
]

/-- `Vibe.Compute.SpeciesTransport` (7 headline theorems). -/
private def manifest_Compute_SpeciesTransport : List Unit := [
  checkHeadline (@Vibe.Compute.thm_species_transport.{0}),
  checkHeadline (@Vibe.Compute.thm_species_pull_back.{0}),
  checkHeadline (@Vibe.Compute.thm_species_output_copy.{0}),
  checkHeadline (@Vibe.Compute.thm_species_no_kleene.{0}),
  checkHeadline (@Vibe.Compute.thm_species_transport_cells),
  checkHeadline (@Vibe.Compute.thm_species_blind_cells),
  checkHeadline (@Vibe.Compute.thm_species_point_mutation.{0})
]

/-- `Vibe.Compute.SpinOneQ2R` (10 headline theorems). -/
private def manifest_Compute_SpinOneQ2R : List Unit := [
  checkHeadline (@Vibe.Compute.thm_q2r_move_local),
  checkHeadline (@Vibe.Compute.q2rSetStep_involutive.{0}),
  checkHeadline (@Vibe.Compute.q2rEnergy_setStep.{0}),
  checkHeadline (@Vibe.Compute.thm_q2r_round_general.{0}),
  checkHeadline (@Vibe.Compute.thm_q2r_round.{0}),
  checkHeadline (@Vibe.Compute.thm_q2r_delta_zero_keeps_d.{0}),
  checkHeadline (@Vibe.Compute.thm_q2r_delta_zero_chiral),
  checkHeadline (@Vibe.Compute.thm_q2r_odd_degree_frozen.{0}),
  checkHeadline (@Vibe.Compute.thm_q2r_vacancy_needs_ratio.{0}),
  checkHeadline (@Vibe.Compute.gen_q2r_move_eq)
]
