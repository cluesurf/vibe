// Deterministic Lean 4 kernel, `#print axioms`, `comparator.json` freeze, and structural verifier
// for `code/proof/Vibe.lean` and `code/proof/Statements.lean`.
//
// 1. Audits every `.lean` file under `code/proof/`:
//    - 0 sorry, 0 axiom, 0 native_decide, 0 unsafe, 0 implemented_by
//    - 0 bare `import Mathlib`, 0 `open Classical`
//    - `set_option autoImplicit false` in every module
//    - balanced namespace / section / end pairs
//    - separates substantive public headline theorems, exported cross-module helpers (`-- [helper]`),
//      and module-internal `private theorem` helpers
//    - verifies `Statements.lean` references all 400 headline theorems without declaring new ones
// 2. Runs real `lake build` against the installed Lean 4.35.0 toolchain with strict exit-code
//    and zero-warning verification across `Vibe` and `Statements`.
// 3. Runs a real `#print axioms` kernel audit over EVERY public theorem via
//    `lake env lean --stdin`, verifying ONLY `{propext, Quot.sound, Classical.choice}` appear.
// 4. Extracts `{ name, module, signature, axioms }` for EVERY headline theorem directly from the
//    Lean 4.35.0 kernel (`Lean.collectAxioms` + `Meta.ppExpr`) and either writes
//    `code/proof/comparator.json` (`--update-freeze`) or FAILS CLOSED on any missing theorem,
//    altered signature, changed module, or unexpected axiom.
// 5. Runs E-FND-0185's exact zero-float BigInt algebraic proof-certificate suite (Theorems 1..6).
//
//   pnpm run check:lean
//   pnpm run check:lean -- --update-freeze

import { spawnSync } from 'node:child_process'
import { existsSync, readdirSync, readFileSync, statSync, writeFileSync } from 'node:fs'
import { homedir } from 'node:os'
import { dirname, join, resolve } from 'node:path'
import { fileURLToPath } from 'node:url'
import { runInfiniteTimeProofs } from '@/code/measure/infinite-time-proofs'

const MIN_HEADLINE_THEOREM_COUNT = 400
const EXPECTED_LEAN_TOOLCHAIN = 'leanprover/lean4:v4.35.0'
const EXPECTED_LEAN_VERSION = '4.35.0'

const ALLOWED_AXIOMS = new Set(['propext', 'Quot.sound', 'Classical.choice'])

const REQUIRED_THEOREMS = [
  // Vibe.Tone (5 headline: 24-slot ternary dock algebra)
  'conjDock_involutive',
  'conjDock_fixes_v1',
  'dockCharge_v1',
  'dockCharge_conj',
  'dockCharge_bounded',
  // Vibe.Algebra (4 headline: cyclotomic Z[zeta_9] gap cubic)
  'zeta18_pow18_eq_one',
  'zeta18_unit_left',
  'gapSqZeta18_ne_zero',
  'gapSqZeta18_minpoly',
  // Vibe.Rule (29 headline: classical V1/light-cone, local gate unitarity, 2-adic SU(2) hypotheses, symbolic M_pair)
  'thm1_v1_eternal_stationarity',
  'thm1_light_cone_empty_outside',
  'thm2_coin_unitary_left',
  'thm2_coin_unitary_right',
  'thm2_halfCoin_sq_eq_coin',
  'thm2_halfCoin_unitary_left',
  'thm2_halfCoin_unitary_right',
  'thm2_fg_matrix_unitary',
  'thm2_odd_value_phase_unit',
  'thm2_mpair_zeta18_unitary_diag',
  'thm2_mpair_zeta18_unitary_off',
  'thm3_M_unitary_left',
  'thm3_M_unitary_right',
  'thm3_M_det_eq_four',
  'thm3_M_trace_eq_one',
  'thm3_M_cayley_hamilton',
  'thm3_M_pow_recurrence',
  'thm3_trace_M_pow',
  'thm3_traceSeq_odd',
  'thm3_W_infinite_order_su2',
  'thm3_W_infinite_order_psu2',
  'thm3_noncommuting_conjugate',
  'thm3_not_in_pin2',
  'thm3_commutator_frob_norm_sq',
  'thm4_mpair12_comp',
  'thm4_mpair12_unitary_left',
  'thm4_mpair12_unitary_right',
  'thm4_mpair12_swave_iter',
  'thm4_mpair12_transverse_iter',
  // Vibe.Geometry (14 headline: conditional cusp resistance & subluminality, explicit D_4 geometry + zero-straddling premise)
  'thm5_shell_exp_lower_bound',
  'thm5_resistance_exp_lower_bound',
  'thm5_resistance_strictly_increasing',
  'thm5_resistance_unbounded',
  'thm5_cusp_lateral_cumulative',
  'thm5_cusp_lateral_lt_shell',
  'thm6_rayleigh_scale_invariance',
  'thm6_strictly_subluminal',
  'thm_d4_root_system',
  'thm_d4_rank4_so4_isotropy',
  'thm_z4_fails_rank4_isotropy',
  'thm_d4_triangular_plaquette_geometry',
  'thm_d4_no_straddling_triangles',
  'thm_d4_triangle_halfspace_decomposition',
  // Vibe.Gauge (27 headline: Tier-C Spin(10), 3x3 Koide warp, EW m_gamma=0 & rho=1, Pati-Salam traces, Z_2 parity, axion 8/3)
  'thm7_charge_quantization',
  'thm7_anomaly_grav_u1',
  'thm7_anomaly_u1_cubic',
  'thm7_anomaly_su2_u1',
  'thm7_anomaly_su3_u1',
  'thm7_anomaly_su3_cubic',
  'thm7_witten_su2_even_all_gens',
  'thm7_weinberg_gut_three_eighths',
  'thm8_koide_two_thirds_iff_f4_root_ratio',
  'thm8_warp_koide_exact_identity',
  'thm8_warp_koide_ge_two_thirds',
  'thm8_warp_koide_eq_iff_uniform',
  'thm9_photon_exact_zero_mode',
  'thm9_z_boson_eigenmode',
  'thm9_custodial_rho_eq_one',
  'thm10_ps16_matches_spin10',
  'thm10_ps_trace_bl_zero',
  'thm10_ps_trace_t3L_sq',
  'thm10_ps_trace_t3R_sq',
  'thm10_ps_trace_bl_sq',
  'thm10_ps_trace_bl_t3R_orthogonal',
  'thm10_ps_trace_y_sq',
  'thm10_ps_matching_weights_from_traces',
  'thm10_dyadic_pow2_mod3',
  'thm11_matter_parity_all_16_fermions_odd',
  'thm11_matter_parity_preserved_by_126H',
  'thm13_axion_e_over_n_eight_thirds',
  // Vibe.Limits (15 headline: 3x3 Z_3 transfer gap, modular Z_N PQ dim, arbitrary-word Mat2Eis unitarity, B^T B Gram positivity)
  'thm14_z3_transfer_vacuum_eigenmode',
  'thm14_z3_transfer_excited_eigenmode',
  'thm14_z3_transfer_mass_gap_all_time',
  'thm14_z3_transfer_exp_suppression',
  'thm15_zn_pq_min_operator_dim',
  'thm15_z36_pq_dim_ge_18',
  'thm15_z36_pq_dim_ge_36',
  'thm15_mat2eis_dag_mul',
  'thm15_mat2eis_unitary_comp',
  'thm15_gateM_pow_unitary_all_lengths',
  'thm15_gateM2_unitary_left',
  'thm15_gateM2_pow_unitary_all_lengths',
  'thm15_eisWord_unitary_all_words',
  'thm16_gram_btb_positivity',
  'thm16_weighted_gram_positivity',
  // Vibe.SchurGap (15 headline: global Busemann Schur bound rho <= 13/21, lambda_gap >= 8/21, resistance bridge)
  'thm_schur_hermite_identity',
  'thm_schur_hermite_nonneg',
  'thm_schur_hermite_qpos',
  'thm_schur_antipodal_pair_identity',
  'thm_d4_root_lines_partition',
  'thm_d4_exact_moments',
  'thm_schur3_nonneg',
  'thm_schur4_simplex_nonneg',
  'thm_d4_moment3_le_9_S3',
  'thm_schur_majorant_bound_13_over_21',
  'thm_busemann_schur_global_bound',
  'thm_busemann_schur_sharp_at_d4_root',
  'thm_busemann_schur_cusp_axis_7_over_15',
  'thm_busemann_spectral_gap_8_over_21',
  'thm_col_resistance_code_bridge',
  // Vibe.Uniqueness4D (17 headline: first-principles Coxeter 1956 4D classification & {3,4,3,4} uniqueness)
  'isPos_neg_exclusive',
  'thm_classify_spherical3',
  'thm_classify_spherical4',
  'thm_classify_euclidean4_unique',
  'thm_coxeter_classify_compact_4d',
  'thm_coxeter_classify_paracompact_4d',
  'thm_coxeter_classify_euclidean_4d',
  'thm_coxeter_classify_spherical5',
  'thm_coxeter_complete_finite_covolume_4d',
  'thm_coxeter_4d_counts',
  'thm_cell16_fails_rank4_isotropy',
  'thm_self_dual_regular_4polytopes',
  'thm_uniqueness_4d_flat_cusp_finite_covolume',
  'thm_uniqueness_4d_flat_cusp_and_self_dual_all_nat',
  'thm_uniqueness_4d_flat_cusp_and_finite_cell_all_nat',
  'thm_uniqueness_4d_all_four_invariants',
  'thm_uniqueness_4d_negative_controls',
  // Vibe.CoxeterTransport (15 headline: exact O^+(4,1; Z[sqrt(2)]) 5x5 transport, S R S = R, palindromic T/CP/CPT)
  'thm_coxeter_gram_and_center',
  'thm_central_inversion_properties',
  'thm_orth_group_mul',
  'thm_reflection_involution',
  'thm_reflection_preserves_twiceGram',
  'thm_conj_reflection',
  'thm_24_facets_geometry',
  'thm_24_facet_dirs_isomorphic_to_d4',
  'thm_coxeter_transport_preserves_lorentz',
  'thm_coxeter_transport_det_neg_one',
  'thm_coxeter_transport_antipodal_inverse',
  'thm_coxeter_word_lorentz_and_inverse',
  'thm_honeycomb_stream_antipodal_reversal',
  'thm_cusp_dock0_split_and_ratio',
  'thm_palindromic_beat_T_CP_CPT',
  // Vibe.FockBeat (18 headline: Z[zeta_9][1/6] Fock space, Scale-2 commutation, 8-layer U unitarity, |V_1>, Q, Lieb-Robinson, concrete T/CP/CPT)
  'thm_fock_ring_and_gate_identities',
  'thm_fock_inner_support_indep',
  'thm_fock_inner_sesquilinear',
  'thm_fock_elementary_unitaries',
  'thm_fock_unitary_iter_all_time',
  'thm_fock_coxeter_parity_equivariance',
  'thm_fock_honeycomb_config_symmetries',
  'thm_fock_scale2_K_MPair_comm',
  'thm_fock_scale2_K_MMeet_comm',
  'thm_fock_scale2_MPair_MMeet_comm',
  'thm_fock_scale2_core_unitary_and_comm',
  'thm_fock_beat_unitary_all_time',
  'thm_fock_sym_beat_unitary_all_time',
  'thm_fock_v1_quantum_stationarity',
  'thm_fock_charge_conservation_all_time',
  'thm_fock_lieb_robinson_light_cone',
  'thm_fock_beat_T_CP_CPT',
  'thm_fock_chiral_witness_C_P_violation',
  // Vibe.Chirality (17 headline: order-1152 W(F_4), unconditional k*=4 achirality, chiOddPoly, global W(F_4)^+ covariance)
  'thm_f4_simple_reflections_orthogonal_and_det',
  'thm_f4_coxeter_relations',
  'thm_wf4_action_orthogonal_and_bijective',
  'thm_wf4_semidirect_order_1152',
  'thm_wf4_generated_by_simples_and_proper_gens',
  'thm_wf4_det4_transformation',
  'thm_f4_24_reflection_hyperplanes',
  'thm_k3_pointwise_improper_stabilizer',
  'thm_achiral_k1',
  'thm_achiral_k2',
  'thm_achiral_k3',
  'thm_chiOddPoly_transformation_laws',
  'thm_chiOddPoly_vanishes_k_le_3',
  'thm_k4_chiral_witnesses_sharp',
  'thm_individual_C_and_P_broken_CP_exact',
  'thm_abstract_canonical_orbit_sign_law',
  'thm_phiOdd_phase_unit_and_covariance',
  // Vibe.CuspGrowth (17 headline: right-angled O^+(4,1) Cartier-Foata recurrence, unconditional N_{D+1} >= 18 N_D & Geometry.lean discharge)
  'thm_facet_gram_right_angled',
  'thm_orthogonal_reflections_commute',
  'thm_cusp_layer_stabilizer_exact',
  'thm_wall_hyperplane_exact',
  'thm_direct_o41_ball_shells_0_1_2',
  'thm_24cell_clique_fvector',
  'thm_24cell_foata_matrix_uniform',
  'thm_foata_exact_initial_values',
  'thm_foata_cubic_recurrence',
  'thm_wall_cusp_eq_cuspLateralLinks',
  'thm_cusp_growth_ge_18',
  'thm_cusp_and_ball_growth_rate_bounds',
  'thm_unconditional_cusp_shell_exp',
  'thm_unconditional_resistance_exp',
  'thm_unconditional_resistance_unbounded',
  'thm_unconditional_wall_lt_cusp_shell',
  'thm_unconditional_cusp_strictly_subluminal',
  // Vibe.Quantum (15 headline: C_{1/2}, M_meet^diff, 2-adic normSq != 2, E-QTM-0204 6x6 splitter, E-QTM-0205 36/36 Z_6^2 + 24/24 S_4 envariance)
  'thm_qtm_halfCoin_det_and_sq',
  'thm_qtm_zeta6_braiding_and_strang',
  'thm_qtm_mMeetDiff_unitary_and_order3',
  'thm_qtm_mMeetDiff_weights_and_eigenmodes',
  'thm_qtm_two_inert_mod9',
  'thm_qtm_no_eis_normSq_eq_two',
  'thm_qtm_0204_splitter_layers_unitary',
  'thm_qtm_0204_splitter_composite_unitary',
  'thm_qtm_0204_splitter_balanced_ports',
  'thm_qtm_0204_mach_zehnder_recombination',
  'thm_qtm_0205_psi2_schmidt_and_z6x6_envariance',
  'thm_qtm_0205_fine_graining_to_psi4',
  'thm_qtm_0205_s4_envariance_general',
  'thm_qtm_0205_s4_all_24_permutations',
  'thm_qtm_0205_reduced_density_matrix_scalar',
  // Vibe.BreakthroughAlgebra (21 headline: BT2 Combes-Thomas SOS, BT3 L_7/molecule/su(9), BT4A Cayley SMG, BT4B symbolic Z[zeta_9] Nelson-Barr)
  'thm_bt2_cell24_triangles_and_gram',
  'thm_bt2_a24_plus_4I_pos_semidef',
  'thm_bt2_a24_min_eigenvector_neg4',
  'thm_bt2_plaquette_tilted_hessian_sos',
  'thm_bt2_combes_thomas_cubic_majorant',
  'thm_bt2_combes_thomas_mass_gap_margin',
  'thm_bt2_d4_z4_bivector_ratio_two',
  'thm_bt3_catalyst_L7_trace_and_unitarity',
  'thm_bt3_catalyst_L7_infinite_order',
  'thm_bt3_eisenstein_molecule_exact',
  'thm_bt3_dfs_S12_S23_dense_su2',
  'thm_bt3_dfs_6spin_casimir_sector_and_su9_dims',
  'thm_bt4a_cayley_14_terms_and_closed_form',
  'thm_bt4a_smg_ground_state_and_frustration_free',
  'thm_bt4a_smg_minpoly_and_spectrum_multiplicities',
  'thm_bt4a_smg_sos_positivity_and_unique_ground_state',
  'thm_bt4a_smg_zero_bilinear_contamination_and_condensate',
  'thm_bt4b_nelson_barr_4x4_symbolic',
  'thm_bt4b_nelson_barr_5x5_symbolic',
  'thm_bt4b_nelson_barr_concrete_witnesses',
  'thm_bt4b_nelson_barr_cp_broken_jarlskog_witness',
  // Vibe.Countermodels (14 headline: symmetry persistence, 0_D vs 0_V, rule census, octonion Degen 8-sq, 5-universe separation)
  'thm_cm_general_stabilizer_preservation',
  'thm_cm_two_site_symmetric_beat_fixes_zero',
  'thm_cm_symmetric_totality_orbit_invariant',
  'thm_cm_two_zeros_separation',
  'thm_cm_central_trinomial_counts',
  'thm_cm_two_site_rule_census',
  'thm_cm_countermodel_singleton',
  'thm_cm_countermodel_1d_c2',
  'thm_cm_countermodel_free_tn_and_on',
  'thm_cm_countermodel_octonion_nonassociative',
  'thm_cm_countermodel_a4_and_b4_roots',
  'thm_cm_countermodel_euclidean_3433',
  'thm_cm_countermodel_static_vacuum_achiral',
  'thm_cm_five_competing_universes_separation',
  // Vibe.ParityUniqueness (14 headline: D_n self-duality n=4, {3,4,3,4} parity uniqueness, connected J=L o C, 2T polar duality, torsor)
  'thm_pu_dn_self_dual_iff_four',
  'thm_pu_dn_facet_vertex_uniformity_iff_four',
  'thm_pu_coxeter_character_even_p',
  'thm_pu_gram_det_343p',
  'thm_pu_parity_and_finite_covolume_uniquely_force_3434',
  'thm_pu_class_swap_left_involution_and_parity',
  'thm_pu_infinite_mesh_J_config_neutrality',
  'thm_pu_infinite_mesh_involutive_neutrality',
  'thm_pu_witness_C_odd_and_L_breaks_PhiOdd',
  'thm_pu_hurwitz_2t_closure_and_order_24',
  'thm_pu_q8_and_h_generate_2t',
  'thm_pu_2t_polar_facet_normal_duality',
  'thm_pu_even_parity_t4_shortest_is_d4',
  'thm_pu_torsor_chart_independence',
  // Vibe.CausalFoliation (11 headline: S = R o E_swap, Tomonaga-Schwinger foliation invariance bridged to fockBeat, microcausality, Q & D)
  'thm_cf_facet_pairing_free_involution',
  'thm_cf_edge_swap_involution_and_comm',
  'thm_cf_stream_eq_rev_comp_edge_swap',
  'thm_cf_on_site_commutes_with_rev_and_disjoint_edge',
  'thm_cf_beat_factorization_R_Eswap_W',
  'thm_cf_tomonaga_schwinger_foliation_invariance',
  'thm_cf_valid_cut_lipschitz_and_diamond',
  'thm_cf_vibe_causal_foliation_invariance',
  'thm_cf_spacelike_microcausality',
  'thm_cf_activity_zero_iff_v1',
  'thm_cf_edge_swap_conserves_Q_and_D',
  // Vibe.SpectralSharp (12 headline: 217-clique RACG Schur bound rho <= 335/28 < 12, upward-only Rayleigh compression, (11,12) bracket)
  'thm_ss_reciprocal_edge_amgm',
  'thm_ss_finite_reciprocal_schur_bound',
  'thm_ss_d4_comm_cliques_and_transitions',
  'thm_ss_foata_detailed_balance',
  'thm_ss_three_rational_row_sums',
  'thm_ss_spectral_radius_lt_12',
  'thm_ss_normalized_gap_gt_half',
  'thm_ss_refined_3rat_bound',
  'thm_ss_racg_subgraph_schur_bound',
  'thm_ss_stratum_rayleigh_exact',
  'thm_ss_rayleigh_lower_gt_11',
  'thm_ss_spectral_bracket_11_12',
  // Vibe.BallisticDoublon (12 headline: O^+(4,1) convexity, Cholesky H_2>=2, antipodal-free disjoint-support Gram, exact P=0 M_meet doublon)
  'thm_bd_twiceForm_baseCenter_and_height',
  'thm_bd_coxeter_antipodal_sum_six',
  'thm_bd_hyperbolic_height_convexity',
  'thm_bd_word_height_pure_even_integer',
  'thm_bd_frontier_no_antipodal_arrival_pair',
  'thm_bd_ballistic_recurrence_strict_growth',
  'thm_bd_ballistic_no_periodic_compacton',
  'thm_bd_coin_strict_outward_transmission',
  'thm_bd_frontier_leakage_exact_eigenvalues',
  'thm_bd_doublon_eigenvalue_unit_modulus',
  'thm_bd_doublon_infinite_line_eigenstate',
  'thm_bd_doublon_exact_norm_and_ipr',
  // Vibe.HolographicCode (9 headline: S_3-triality W(F_4) covariance, [[24,1,8]]_3 & [[24,0,6]]_3 isotropy/rank/witnesses, D_4 CSS obstruction)
  'thm_hc_wf4_generators_match_chirality',
  'thm_hc_s3_clifford_homomorphism',
  'thm_hc_orthogonal_block_decomposition',
  'thm_hc_w9_weight4_vs_weight6_split',
  'thm_hc_code_24_1_8_stabilizer_valid',
  'thm_hc_code_24_1_8_wf4_covariant',
  'thm_hc_code_24_1_8_triality_bulk_logical',
  'thm_hc_code_24_0_6_lagrangian_wf4_covariant',
  'thm_hc_native_d4_css_obstruction',
  // Vibe.HolographicCodeExt (9 headline: Darboux completeness, W(F_4) orbit collapse, 5-uniformity, d=6, 536,155 erasures, d=8, |In_H|<=3, HaPPY pushing/tower)
  'thm_hce_darboux_dual_basis_and_completeness',
  'thm_hce_wf4_orbit_collapse_5_and_7',
  'thm_hce_5uniform_bulk23_and_pure24',
  'thm_hce_pure24_exact_distance_6',
  'thm_hce_bulk23_all_7erasure_recovery',
  'thm_hce_bulk23_exact_distance_8',
  'thm_hce_3434_height_parity_and_inward_le_3',
  'thm_hce_bulk23_dock_isometric_pushing',
  'thm_hce_infinite_radius_happy_isometry_and_greedy_reconstruction',
  // Vibe.D4MassGap (13 headline: D_4 1D-axial RP & Perron 4+4sqrt(7), SU(2) vMF & W_1 > 2.51x BE, H_12 arboricity 32/11, BFS ratio, A_2 Pieri SU(3) W_1 & axial contraction)
  'thm_mg_d4_pos_roots_and_frozen_rp',
  'thm_mg_unfixed_L12_and_axial_M11_blocks',
  'thm_mg_axial_perron_eigenvector_and_bracket',
  'thm_mg_su2_vmf_spectral_gap_and_variance_identities',
  'thm_mg_su2_thresholds_and_be_ratios',
  'thm_mg_dobrushin_power_and_geometric_decay',
  'thm_mg_d4_axial_dobrushin_instantiation',
  'thm_mg_h12_graph_and_3forest_partition',
  'thm_mg_h12_exact_fractional_arboricity_32_over_11',
  'thm_mg_bfs_polymer_step_ratio_all_n',
  'thm_mg_d4_tetrahedra_per_triangle_eq_3',
  'thm_mg_su3_closed_form_w1_beyond_be',
  'thm_mg_su3_axial_dobrushin_instantiation',
  // Vibe.SpectralSharpExt (9 headline: Depth-2 19-state/23-flag Nagnibeda <= 387141227/33670000 < 11.5, Q_3 zero-cascade, 57-orbit CF 1-step > 913/80 = 11.4125)
  'thm_sse_wf4_automorphisms_and_216_cliques',
  'thm_sse_depth2_automaton_and_shell_growth',
  'thm_sse_depth2_flag_reciprocity',
  'thm_sse_depth2_nagnibeda_upper_bound',
  'thm_sse_depth2_subgraph_schur_bound',
  'thm_sse_q3_link_and_zero_cascade',
  'thm_sse_cf_57_orbits_and_exact_word_sum',
  'thm_sse_cf_lower_bound',
  'thm_sse_combined_spectral_bracket',
  // Vibe.CompositeTrion (9 headline: Z[omega][1/7] k=3 Sym^3 trion IPR=9/32, Z[zeta_9] cot^2(pi/18) cubic, flat-D_4 excision pocket, depressed-cubic holographic rate)
  'thm_ct_trion_eigenvalue_and_ratio',
  'thm_ct_trion_gate_and_collision_modes',
  'thm_ct_trion_shift_pullback_exact',
  'thm_ct_trion_infinite_line_eigenstate',
  'thm_ct_trion_norm_contact_and_ipr',
  'thm_ct_trion_gap_separation',
  'thm_ct_mpair_gap_margin',
  'thm_ct_hyperbolic_excision_pocket',
  'thm_ct_holographic_rate_depressed_cubic',
  // Vibe.D4MassGapExt (11 headline: Alt-x0+planes forest RP/M88/Lambda_Alt < 4+4sqrt(7), SU(3) convex-hull/Cardano/K<=2 Pieri, SU(2) chordal & 2-link wedge contraction)
  'thm_mge_alt_x0_planes_forest_rp_and_acyclic',
  'thm_mge_alt_x0_planes_quotient_M88_structure',
  'thm_mge_alt_x0_planes_spectral_bound_and_contraction',
  'thm_mge_su3_staple_convex_hull_algebraic',
  'thm_mge_su3_maximal_torus_and_cardano_invariants',
  'thm_mge_su3_weyl_dim_and_k2_casimir_spectrum',
  'thm_mge_su3_pieri_branching_and_weight_sectors',
  'thm_mge_su2_chordal_region1_and_region3_bounds',
  'thm_mge_su2_wedge_coverage_and_block_matrix',
  'thm_mge_su2_wedge_dobrushin_contraction',
  'thm_mge_su2_and_su3_sharp_threshold_ratios',
  // Vibe.DynamicalHolography (10 headline: W11 dynamical holography bridge & W10 B_1 d^(0)=40 / B_2 d^(0)>=98 / C_0 r=3 zero-loss & r=4 threshold)
  'dh_mpair_trivial_on_code',
  'dh_monomial_fock_clifford_classification',
  'dh_single_edge_wf4_nogo',
  'dh_ustar_and_unn_symplectic_covariant',
  'dh_floquet_and_boundary_lift_algebra',
  'dh_dock_clifford_uniform_and_streaming_audit',
  'dh_happy_b1_d40_and_b2_d98',
  'dh_b1_single_cone_threshold',
  'dh_cusp_d0_gauss_law_and_dge1_cliques',
  'dh_b1_stabilizer_code_contraction_invariants',
  // Vibe.UniversalityObstructions (7 headline: Wave-5 Track 1 Turing & QTM universality obstructions)
  'thm_univ_z216_parity_and_role_multiset_all_time',
  'thm_univ_dispersion_floor_and_rapidity_nogo',
  'thm_univ_mpair_ceiling_and_role_pigeonhole',
  'thm_univ_yb_crossing_and_dim_ceiling',
  'thm_univ_unitary_halting_nogo_and_w0_clearance',
  'thm_univ_geodesic_2plane_and_junction_cap',
  'thm_univ_mod2_triality_and_l7_bragg_gap',
  // Vibe.StandardModelCore (6 headline: Wave-5 Standard Model exact algebraic pillars)
  'thm_sm_anomaly_cancellation_and_z6_quotient',
  'thm_sm_so5_custodial_rho_one_and_center_parity',
  'thm_sm_pure_zomega_slab_ir_light_mass',
  'thm_sm_asl23_two_transitivity_and_oh_triality_obstruction',
  'thm_sm_ckr_3d_bosonization_and_fermion_exchange',
  'thm_sm_cusp_shell_recurrence_and_baryon_charge',
  // Vibe.StandardModelMathlib (10 headline: Canonical Mathlib v4.35.0 continuous/matrix/ZMod/D4-triality/2T_R proofs)
  'thm_ml_pure_ternary_odd_dim_parity_obstruction',
  'thm_ml_ternary_qutrit_power_odd',
  'thm_ml_so5_custodial_rho_eq_one_real',
  'thm_ml_su3w_custodial_violation_real',
  'thm_ml_su3w_unitary_and_zeta18_complex',
  'thm_ml_z6_sm_quotient_and_baryon_quantization',
  'thm_ml_steinberg_cubic_and_zeta18_gap_real',
  'thm_ml_d4_outer_triality_fprim_det',
  'thm_ml_d4_honeycomb_duality_and_villain_sd',
  'thm_ml_2tr_character_table_and_rank1_origin',
  // Vibe.LogicEmergence (7 headline: Logic of emergence & dynamical instantiations on Z_2^48, ZMod 6, D_4/3D_4)
  'thm_le_bug1_e_invariance_vs_intermodel_counterexample',
  'thm_le_bug2_equiv_disjunction_counterexample_and_eqvgen_join',
  'thm_le_bug3_exogenous_measure_contradiction_and_pushforward_fix',
  'thm_le_strict_transitivity_and_ouroboros_collapse',
  'thm_le_constrained_asymmetry_and_non_transitivity',
  'thm_le_vibe_z2_parity_and_z6_quotient_emergence',
  'thm_le_vibe_d4_triality_torus_emergence',
  // Vibe.PlebanskiDarkFlux (8 headline: Untwisted anomaly uniqueness, Z_3^DM x 2T_R stability, 24-cell Plebanski BF, NEC, Q_8 Witten parity, 3-smooth closure, W(F_4)^+ spin-2 uniqueness)
  'thm_untwisted_anomaly_uniqueness',
  'thm_vq2_dark_sector_stability',
  'pleb_simplex_wedge_identities',
  'thm_plebanski_24cell_simplicity_and_closure',
  'thm_nec_monotone_velocity_bound',
  'thm_q8_witten_z2_flux_parity',
  'thm_zero_veto_3smooth_closure',
  'thm_wf4_spin2_diffeo_uniqueness',
] as const

const scriptDir = dirname(fileURLToPath(import.meta.url))
const root = resolve(scriptDir, '..')
const proofDir = join(root, 'code', 'proof')
const leanFile = join(proofDir, 'Vibe.lean')
const statementsPath = join(proofDir, 'Statements.lean')
const comparatorPath = join(proofDir, 'comparator.json')
const lakefilePath = join(proofDir, 'lakefile.toml')
const toolchainPath = join(proofDir, 'lean-toolchain')

type TheoremDecl = {
  readonly file: string
  readonly shortName: string
  readonly fullName: string
  readonly kind: 'headline' | 'exported_helper' | 'private_helper'
}

function stripLeanComments(src: string): string {
  let out = ''
  let i = 0
  let blockDepth = 0
  let inLineComment = false

  while (i < src.length) {
    const ch = src[i]!
    const next = src[i + 1]

    if (inLineComment) {
      if (ch === '\n') {
        inLineComment = false
        out += '\n'
      }
      i++
      continue
    }

    if (blockDepth > 0) {
      if (ch === '/' && next === '-') {
        blockDepth++
        i += 2
        continue
      }
      if (ch === '-' && next === '/') {
        blockDepth--
        i += 2
        continue
      }
      if (ch === '\n') {
        out += '\n'
      }
      i++
      continue
    }

    if (ch === '/' && next === '-') {
      blockDepth = 1
      i += 2
      continue
    }

    if (ch === '-' && next === '-') {
      inLineComment = true
      i += 2
      continue
    }

    out += ch
    i++
  }

  return out
}

function scanLeanFile(
  label: string,
  rawSrc: string,
  requireRootVibe: boolean,
): {
  readonly codeOnly: string
  readonly decls: TheoremDecl[]
  readonly errors: string[]
} {
  const codeOnly = stripLeanComments(rawSrc)
  const errors: string[] = []
  const decls: TheoremDecl[] = []
  const scopeStack: Array<{ readonly kind: 'namespace' | 'section'; readonly name: string }> = []
  let hasRootVibe = false

  const rawLines = rawSrc.split('\n')
  const codeLines = codeOnly.split('\n')
  let pendingHelperTag = false

  for (let idx = 0; idx < codeLines.length; idx++) {
    const rawLine = (rawLines[idx] ?? '').trim()
    const line = (codeLines[idx] ?? '').trim()

    if (/^--\s*\[helper\]/.test(rawLine)) {
      pendingHelperTag = true
      continue
    }

    if (line.length === 0) {
      continue
    }

    const nsMatch = /^namespace\s+([A-Za-z0-9_.']+)/.exec(line)
    if (nsMatch) {
      const name = nsMatch[1]!
      if (name === 'Vibe' && scopeStack.length === 0) {
        hasRootVibe = true
      }
      scopeStack.push({ kind: 'namespace', name })
      pendingHelperTag = false
      continue
    }

    const secMatch = /^section\s+([A-Za-z0-9_.']+)/.exec(line)
    if (secMatch) {
      scopeStack.push({ kind: 'section', name: secMatch[1]! })
      pendingHelperTag = false
      continue
    }

    const endMatch = /^end\s+([A-Za-z0-9_.']+)/.exec(line)
    if (endMatch) {
      const name = endMatch[1]!
      const top = scopeStack.pop()
      if (!top || top.name !== name) {
        errors.push(`${label}: mismatched end ${name} (expected ${top?.name ?? 'none'})`)
      }
      pendingHelperTag = false
      continue
    }

    const thmMatch = /^(?:(private|public|protected)\s+)?theorem\s+([A-Za-z0-9_'.?]+)/.exec(line)
    if (thmMatch) {
      const isPrivate = thmMatch[1] === 'private'
      const shortName = thmMatch[2]!
      const nsPrefix = scopeStack
        .filter(s => s.kind === 'namespace')
        .map(s => s.name)
      const fullName = nsPrefix.length > 0 ? `${nsPrefix.join('.')}.${shortName}` : shortName
      const kind: TheoremDecl['kind'] = isPrivate
        ? 'private_helper'
        : pendingHelperTag
          ? 'exported_helper'
          : 'headline'
      decls.push({ file: label, shortName, fullName, kind })
      pendingHelperTag = false
      continue
    }

    pendingHelperTag = false
  }

  if (scopeStack.length > 0) {
    errors.push(`${label}: unclosed namespace/section blocks: ${scopeStack.map(s => s.name).join(', ')}`)
  }
  if (requireRootVibe && !hasRootVibe) {
    errors.push(`${label}: missing root \`namespace Vibe\` / \`end Vibe\` block`)
  }
  if (!/\bset_option\s+autoImplicit\s+false\b/.test(codeOnly)) {
    errors.push(`${label}: missing \`set_option autoImplicit false\``)
  }

  for (const [tokenLabel, re] of [
    ['sorry', /\bsorry\b/g],
    ['axiom', /\baxiom\b/g],
    ['native_decide', /\bnative_decide\b/g],
    ['unsafe', /\bunsafe\b/g],
    ['implemented_by', /\bimplemented_by\b/g],
    ['open Classical', /\bopen\s+Classical\b/g],
    ['import Mathlib', /(?:^|\n)[ \t]*(?:public[ \t]+)?import[ \t]+Mathlib[ \t]*(?=\n|$)/g],
  ] as const) {
    const matches = codeOnly.match(re) ?? []
    if (matches.length > 0) {
      errors.push(`${label}: forbidden \`${tokenLabel}\` found (${matches.length} occurrence(s))`)
    }
  }

  return { codeOnly, decls, errors }
}

function toolchainDirName(spec: string): string {
  return spec.replace(/\//g, '--').replace(/:/g, '---')
}

function findLocalLeanToolchain(spec: string): {
  readonly elanHome: string
  readonly toolchainsDir: string
  readonly matchedDir: string | null
  readonly lakeBin: string | null
  readonly leanBin: string | null
  readonly accessError: string | null
} {
  const elanHome = process.env.ELAN_HOME ?? join(homedir(), '.elan')
  const toolchainsDir = join(elanHome, 'toolchains')
  const expectedName = toolchainDirName(spec)
  const exeSuffix = process.platform === 'win32' ? '.exe' : ''

  try {
    let toolchainsDirExists = false
    try {
      toolchainsDirExists = statSync(toolchainsDir).isDirectory()
    } catch (statErr) {
      if ((statErr as NodeJS.ErrnoException).code !== 'ENOENT') {
        throw statErr
      }
    }

    if (toolchainsDirExists) {
      const entries = readdirSync(toolchainsDir)
      const exactMatch = entries.find(entry => entry === expectedName)

      if (exactMatch) {
        const matchedDir = join(toolchainsDir, exactMatch)
        const lakeBin = join(matchedDir, 'bin', `lake${exeSuffix}`)
        const leanBin = join(matchedDir, 'bin', `lean${exeSuffix}`)

        if (existsSync(lakeBin) && existsSync(leanBin)) {
          return { elanHome, toolchainsDir, matchedDir, lakeBin, leanBin, accessError: null }
        }
        return {
          elanHome,
          toolchainsDir,
          matchedDir,
          lakeBin: null,
          leanBin: null,
          accessError: `matched toolchain ${matchedDir} is missing bin/lake or bin/lean`,
        }
      }

      const otherLeanToolchains = entries.filter(entry => entry.startsWith('leanprover--lean4---'))
      return {
        elanHome,
        toolchainsDir,
        matchedDir: null,
        lakeBin: null,
        leanBin: null,
        accessError:
          otherLeanToolchains.length > 0
            ? `required toolchain ${spec} (${expectedName}) not found in ${toolchainsDir} (found: ${otherLeanToolchains.join(', ')})`
            : `required toolchain ${spec} (${expectedName}) not found in ${toolchainsDir}`,
      }
    }

    const elanLake = join(elanHome, 'bin', `lake${exeSuffix}`)
    const elanLean = join(elanHome, 'bin', `lean${exeSuffix}`)
    if (existsSync(elanLake) && existsSync(elanLean)) {
      const versionRes = spawnSync(elanLean, ['--version'], { encoding: 'utf8' })
      const versionOut = `${versionRes.stdout ?? ''} ${versionRes.stderr ?? ''}`.trim()
      if (versionRes.status === 0 && versionOut.includes(EXPECTED_LEAN_VERSION)) {
        return {
          elanHome,
          toolchainsDir,
          matchedDir: dirname(elanLake),
          lakeBin: elanLake,
          leanBin: elanLean,
          accessError: null,
        }
      }
      return {
        elanHome,
        toolchainsDir,
        matchedDir: null,
        lakeBin: null,
        leanBin: null,
        accessError: `local lean at ${elanLean} does not match required ${spec} (got: ${versionOut || 'unreadable'})`,
      }
    }

    return {
      elanHome,
      toolchainsDir,
      matchedDir: null,
      lakeBin: null,
      leanBin: null,
      accessError: null,
    }
  } catch (err) {
    const message = err instanceof Error ? err.message : String(err)
    return {
      elanHome,
      toolchainsDir,
      matchedDir: null,
      lakeBin: null,
      leanBin: null,
      accessError: message,
    }
  }
}

function auditPrintAxioms(
  lakeBin: string,
  leanBin: string,
  env: NodeJS.ProcessEnv,
  headlineDecls: readonly TheoremDecl[],
): { readonly passed: boolean; readonly summary: string; readonly errors: string[] } {
  const lines = [
    'import Vibe',
    ...headlineDecls.map(d => `#print axioms ${d.fullName}`),
  ]
  const input = `${lines.join('\n')}\n`

  const res = spawnSync(lakeBin, ['env', leanBin, '--stdin'], {
    cwd: proofDir,
    input,
    encoding: 'utf8',
    env,
  })

  const errors: string[] = []
  if (res.error) {
    return { passed: false, summary: 'failed to invoke lean', errors: [res.error.message] }
  }
  if (res.status !== 0) {
    errors.push(`#print axioms lean exited with code ${res.status ?? 1}`)
    if (res.stderr.trim()) errors.push(res.stderr.trim())
    if (res.stdout.trim()) errors.push(res.stdout.trim())
    return { passed: false, summary: 'lean #print axioms failed', errors }
  }

  const rawOutputLines = res.stdout
    .split('\n')
    .map(l => l.trim())
    .filter(l => l.length > 0)

  const outputLines: string[] = []
  for (const rawLine of rawOutputLines) {
    if (
      outputLines.length > 0 &&
      !rawLine.startsWith("'") &&
      outputLines[outputLines.length - 1]!.includes('depends on axioms: [') &&
      !outputLines[outputLines.length - 1]!.endsWith(']')
    ) {
      outputLines[outputLines.length - 1] = `${outputLines[outputLines.length - 1]!} ${rawLine}`
    } else {
      outputLines.push(rawLine)
    }
  }

  const seenNames = new Set<string>()
  const axiomUsage = new Map<string, number>()

  for (const line of outputLines) {
    const noneMatch = /^'([^']+)' does not depend on any axioms$/.exec(line)
    if (noneMatch) {
      seenNames.add(noneMatch[1]!)
      continue
    }

    const depMatch = /^'([^']+)' depends on axioms: \[([^\]]*)\]$/.exec(line)
    if (depMatch) {
      const name = depMatch[1]!
      seenNames.add(name)
      const axioms = depMatch[2]!
        .split(',')
        .map(s => s.trim())
        .filter(s => s.length > 0)
      for (const ax of axioms) {
        axiomUsage.set(ax, (axiomUsage.get(ax) ?? 0) + 1)
        if (!ALLOWED_AXIOMS.has(ax)) {
          errors.push(`disallowed axiom \`${ax}\` in ${name}`)
        }
      }
      continue
    }

    errors.push(`unexpected #print axioms line: ${line}`)
  }

  for (const d of headlineDecls) {
    if (!seenNames.has(d.fullName)) {
      errors.push(`missing #print axioms output for ${d.fullName}`)
    }
  }

  const usageSummary =
    axiomUsage.size === 0
      ? 'none'
      : [...axiomUsage.entries()]
          .sort((a, b) => a[0].localeCompare(b[0]))
          .map(([ax, count]) => `${ax}(${count})`)
          .join(', ')

  return {
    passed: errors.length === 0,
    summary: `${seenNames.size}/${headlineDecls.length} audited; axioms=[${usageSummary}]`,
    errors,
  }
}

type ComparatorTheorem = {
  readonly name: string
  readonly module: string
  readonly signature: string
  readonly axioms: readonly string[]
}

type ComparatorFreeze = {
  readonly toolchain: string
  readonly theoremCount: number
  readonly allowedAxioms: readonly string[]
  readonly theorems: readonly ComparatorTheorem[]
}

function extractKernelComparator(
  lakeBin: string,
  leanBin: string,
  env: NodeJS.ProcessEnv,
  headlineDecls: readonly TheoremDecl[],
): { readonly passed: boolean; readonly records: ComparatorTheorem[]; readonly errors: string[] } {
  const sortedNames = [...headlineDecls].map(d => d.fullName).sort((a, b) => a.localeCompare(b))
  const leanNames = sortedNames.map(n => `  \`${n}`).join(',\n')
  const inspectorSrc = [
    'import Lean',
    'import Vibe',
    '',
    'open Lean Meta',
    '',
    '#eval show MetaM Unit from do',
    '  let env ← getEnv',
    '  let names : List Name := [',
    leanNames,
    '  ]',
    '  for n in names do',
    '    let some info := env.find? n',
    '      | throwError m!"missing constant {n}"',
    '    let modName := match env.getModuleIdxFor? n with',
    '      | some idx => (env.allImportedModuleNames.getD idx.toNat Name.anonymous).toString',
    '      | none => "<local>"',
    '    let fmt ← withOptions (fun o =>',
    '        o.setBool `pp.unicode.fun true',
    '         |>.setBool `pp.proofs false',
    '         |>.setBool `pp.all false',
    '         |>.setBool `pp.universes false) (ppExpr info.type)',
    '    let ax ← Lean.collectAxioms n',
    '    let obj := Json.mkObj [',
    '      ("name", Json.str n.toString),',
    '      ("module", Json.str modName),',
    '      ("signature", Json.str (fmt.pretty 1000000)),',
    '      ("axioms", Json.arr (ax.map (fun a => Json.str a.toString)))',
    '    ]',
    '    IO.println s!"COMPARATOR_JSON:{obj.compress}"',
    '',
  ].join('\n')

  const res = spawnSync(lakeBin, ['env', leanBin, '--stdin'], {
    cwd: proofDir,
    input: inspectorSrc,
    encoding: 'utf8',
    env,
    maxBuffer: 64 * 1024 * 1024,
  })

  const errors: string[] = []
  if (res.error) {
    return { passed: false, records: [], errors: [res.error.message] }
  }
  if (res.status !== 0) {
    errors.push(`kernel comparator inspector exited with code ${res.status ?? 1}`)
    if (res.stderr.trim()) errors.push(res.stderr.trim())
    if (res.stdout.trim()) errors.push(res.stdout.trim().slice(0, 2000))
    return { passed: false, records: [], errors }
  }
  if (res.stderr.trim().length > 0) {
    errors.push(`kernel comparator inspector emitted stderr: ${res.stderr.trim()}`)
  }

  const records: ComparatorTheorem[] = []
  const prefix = 'COMPARATOR_JSON:'
  const lines = res.stdout
    .split('\n')
    .map(l => l.trim())
    .filter(l => l.length > 0)

  for (const line of lines) {
    if (!line.startsWith(prefix)) {
      errors.push(`unexpected comparator inspector stdout line: ${line.slice(0, 200)}`)
      continue
    }
    try {
      const parsed = JSON.parse(line.slice(prefix.length)) as {
        name?: unknown
        module?: unknown
        signature?: unknown
        axioms?: unknown
      }
      if (
        typeof parsed.name !== 'string' ||
        typeof parsed.module !== 'string' ||
        typeof parsed.signature !== 'string' ||
        !Array.isArray(parsed.axioms) ||
        !parsed.axioms.every(a => typeof a === 'string')
      ) {
        errors.push(`malformed comparator JSON record: ${line.slice(0, 200)}`)
        continue
      }
      const sortedAxioms = [...(parsed.axioms as string[])].sort((a, b) => a.localeCompare(b))
      for (const ax of sortedAxioms) {
        if (!ALLOWED_AXIOMS.has(ax)) {
          errors.push(`disallowed kernel axiom \`${ax}\` in ${parsed.name}`)
        }
      }
      records.push({
        name: parsed.name,
        module: parsed.module,
        signature: parsed.signature,
        axioms: sortedAxioms,
      })
    } catch (err) {
      errors.push(
        `invalid comparator JSON: ${err instanceof Error ? err.message : String(err)}`,
      )
    }
  }

  records.sort((a, b) => a.name.localeCompare(b.name))
  const seen = new Set(records.map(r => r.name))
  for (const name of sortedNames) {
    if (!seen.has(name)) {
      errors.push(`missing kernel comparator record for ${name}`)
    }
  }
  if (records.length !== sortedNames.length) {
    errors.push(
      `kernel comparator count mismatch: expected ${sortedNames.length}, extracted ${records.length}`,
    )
  }

  return { passed: errors.length === 0, records, errors }
}

function verifyComparatorFreeze(
  toolchainSpec: string,
  liveRecords: readonly ComparatorTheorem[],
): { readonly passed: boolean; readonly summary: string; readonly errors: string[] } {
  const errors: string[] = []
  if (!existsSync(comparatorPath)) {
    return {
      passed: false,
      summary: 'missing code/proof/comparator.json',
      errors: [
        `missing kernel freeze manifest ${comparatorPath} (run check:lean -- --update-freeze to generate it)`,
      ],
    }
  }

  let frozen: ComparatorFreeze
  try {
    frozen = JSON.parse(readFileSync(comparatorPath, 'utf8')) as ComparatorFreeze
  } catch (err) {
    return {
      passed: false,
      summary: 'unreadable comparator.json',
      errors: [
        `invalid JSON in ${comparatorPath}: ${err instanceof Error ? err.message : String(err)}`,
      ],
    }
  }

  if (
    !frozen ||
    typeof frozen.toolchain !== 'string' ||
    typeof frozen.theoremCount !== 'number' ||
    !Array.isArray(frozen.theorems)
  ) {
    return {
      passed: false,
      summary: 'malformed comparator.json',
      errors: [`malformed schema in ${comparatorPath}`],
    }
  }

  if (frozen.toolchain !== toolchainSpec) {
    errors.push(
      `comparator.json toolchain "${frozen.toolchain}" != expected "${toolchainSpec}"`,
    )
  }
  if (frozen.theoremCount !== frozen.theorems.length) {
    errors.push(
      `comparator.json theoremCount (${frozen.theoremCount}) != theorems.length (${frozen.theorems.length})`,
    )
  }

  const liveByName = new Map(liveRecords.map(r => [r.name, r] as const))
  const frozenByName = new Map<string, ComparatorTheorem>()

  for (const entry of frozen.theorems) {
    if (frozenByName.has(entry.name)) {
      errors.push(`duplicate frozen theorem in comparator.json: ${entry.name}`)
      continue
    }
    frozenByName.set(entry.name, entry)

    const live = liveByName.get(entry.name)
    if (!live) {
      errors.push(`frozen theorem missing from live Lean kernel: ${entry.name}`)
      continue
    }
    if (live.module !== entry.module) {
      errors.push(
        `module mismatch for ${entry.name}: frozen=${entry.module}, live=${live.module}`,
      )
    }
    if (live.signature !== entry.signature) {
      errors.push(`signature drift detected for ${entry.name}`)
    }
    const frozenAxioms = [...entry.axioms].sort((a, b) => a.localeCompare(b))
    const liveAxioms = [...live.axioms].sort((a, b) => a.localeCompare(b))
    for (const ax of liveAxioms) {
      if (!ALLOWED_AXIOMS.has(ax)) {
        errors.push(`disallowed axiom \`${ax}\` in live kernel theorem ${entry.name}`)
      }
    }
    if (
      frozenAxioms.length !== liveAxioms.length ||
      frozenAxioms.some((ax, idx) => ax !== liveAxioms[idx])
    ) {
      errors.push(
        `axiom set drift for ${entry.name}: frozen=[${frozenAxioms.join(', ')}], live=[${liveAxioms.join(', ')}]`,
      )
    }
  }

  for (const live of liveRecords) {
    if (!frozenByName.has(live.name)) {
      errors.push(`unfrozen live headline theorem missing from comparator.json: ${live.name}`)
    }
  }

  return {
    passed: errors.length === 0,
    summary: `${liveRecords.length}/${frozen.theorems.length} signatures, modules & axioms exact match`,
    errors,
  }
}

function main(): void {
  const noBuild = process.argv.includes('--no-build')
  const allowMissingLean = process.argv.includes('--allow-missing-lean')
  const updateFreeze = process.argv.includes('--update-freeze')
  const failures: string[] = []

  if (updateFreeze && (noBuild || allowMissingLean)) {
    console.error('  FAIL  --update-freeze requires live Lean 4.35.0 kernel build (cannot combine with --no-build or --allow-missing-lean)')
    process.exit(1)
  }

  for (const [label, filePath] of [
    ['Vibe.lean', leanFile],
    ['Statements.lean', statementsPath],
    ['lakefile.toml', lakefilePath],
    ['lean-toolchain', toolchainPath],
  ] as const) {
    if (!existsSync(filePath)) {
      failures.push(`missing required file: ${label} (${filePath})`)
    }
  }

  if (failures.length > 0) {
    for (const f of failures) {
      console.error(`  FAIL  ${f}`)
    }
    process.exit(1)
  }

  let toolchainSpec = ''
  try {
    toolchainSpec = readFileSync(toolchainPath, 'utf8').trim()
  } catch (err) {
    const message = err instanceof Error ? err.message : String(err)
    console.error(`  FAIL  cannot read code/proof/lean-toolchain (${toolchainPath}): ${message}`)
    process.exit(1)
  }
  const lakefileSrc = readFileSync(lakefilePath, 'utf8')

  const vibeSubdir = join(proofDir, 'Vibe')
  const leanFiles: Array<{ readonly label: string; readonly path: string }> = [
    { label: 'Vibe.lean', path: leanFile },
    { label: 'Statements.lean', path: statementsPath },
  ]
  const collectLeanFiles = (dirPath: string, relPrefix: string): void => {
    for (const entry of readdirSync(dirPath).sort()) {
      const fullPath = join(dirPath, entry)
      const relLabel = `${relPrefix}/${entry}`
      const st = statSync(fullPath)
      if (st.isDirectory()) {
        collectLeanFiles(fullPath, relLabel)
      } else if (entry.endsWith('.lean')) {
        leanFiles.push({ label: relLabel, path: fullPath })
      }
    }
  }
  if (existsSync(vibeSubdir)) {
    collectLeanFiles(vibeSubdir, 'Vibe')
  }

  const hasSubmodules = leanFiles.length > 2
  const allDecls: TheoremDecl[] = []
  let statementsCodeOnly = ''
  const perFileStats: Array<{
    readonly label: string
    readonly headline: number
    readonly exportedHelper: number
    readonly privateHelper: number
  }> = []

  for (const lf of leanFiles) {
    const src = readFileSync(lf.path, 'utf8')
    const requireRoot =
      lf.label !== 'Vibe.lean' && lf.label !== 'Statements.lean' ? true : !hasSubmodules
    const scan = scanLeanFile(lf.label, src, requireRoot)
    failures.push(...scan.errors)
    if (lf.label === 'Statements.lean') {
      statementsCodeOnly = scan.codeOnly
      if (scan.decls.length > 0) {
        failures.push(
          `Statements.lean must be a pure manifest with 0 theorem declarations (found ${scan.decls.length})`,
        )
      }
    } else {
      allDecls.push(...scan.decls)
    }
    perFileStats.push({
      label: lf.label,
      headline: scan.decls.filter(d => d.kind === 'headline').length,
      exportedHelper: scan.decls.filter(d => d.kind === 'exported_helper').length,
      privateHelper: scan.decls.filter(d => d.kind === 'private_helper').length,
    })
  }

  const headlineDecls = allDecls.filter(d => d.kind === 'headline')
  const exportedHelperDecls = allDecls.filter(d => d.kind === 'exported_helper')
  const privateHelperDecls = allDecls.filter(d => d.kind === 'private_helper')
  const publicDecls = [...headlineDecls, ...exportedHelperDecls]

  const headlineNames = new Set(headlineDecls.map(d => d.shortName))
  const missingTheorems = REQUIRED_THEOREMS.filter(name => !headlineNames.has(name))
  const missingFromStatements = headlineDecls
    .filter(d => !statementsCodeOnly.includes(`@${d.fullName}`))
    .map(d => d.fullName)

  if (toolchainSpec !== EXPECTED_LEAN_TOOLCHAIN) {
    failures.push(
      `code/proof/lean-toolchain specifies "${toolchainSpec}", expected "${EXPECTED_LEAN_TOOLCHAIN}"`,
    )
  }
  if (!lakefileSrc.includes('name = "Vibe"')) {
    failures.push('lakefile.toml missing `name = "Vibe"` lean_lib target')
  }
  if (!lakefileSrc.includes('name = "Statements"')) {
    failures.push('lakefile.toml missing `name = "Statements"` lean_lib target')
  }
  if (headlineDecls.length < MIN_HEADLINE_THEOREM_COUNT) {
    failures.push(
      `headline theorem count ${headlineDecls.length} is below required minimum ${MIN_HEADLINE_THEOREM_COUNT}`,
    )
  }
  if (missingTheorems.length > 0) {
    failures.push(`missing required headline theorems: ${missingTheorems.join(', ')}`)
  }
  if (missingFromStatements.length > 0) {
    failures.push(
      `Statements.lean missing ${missingFromStatements.length} headline theorem reference(s): ${missingFromStatements.slice(0, 10).join(', ')}`,
    )
  }

  console.log(
    `check:lean  structural audit: ${leanFiles.length} files, substantiveTheorems=${headlineDecls.length} (publicTotal=${publicDecls.length}, exportedHelpers=${exportedHelperDecls.length}), privateHelpers=${privateHelperDecls.length}, 0 sorry, 0 axiom, 0 native_decide, 0 unsafe, 0 implemented_by, 0 import Mathlib, 0 open Classical, toolchain=${toolchainSpec}`,
  )
  for (const s of perFileStats) {
    console.log(
      `check:lean    ${s.label.padEnd(32)} headline=${String(s.headline).padStart(2)}  exportedHelpers=${String(s.exportedHelper).padStart(2)}  privateHelpers=${String(s.privateHelper).padStart(3)}`,
    )
  }

  if (failures.length > 0) {
    for (const f of failures) {
      console.error(`  FAIL  ${f}`)
    }
    process.exit(1)
  }

  const localToolchain = findLocalLeanToolchain(toolchainSpec)

  if (noBuild) {
    console.log(
      'check:lean  SKIPPED KERNEL BUILD (--no-build): lake build, #print axioms, and comparator.json freeze did not run',
    )
  } else if (localToolchain.lakeBin && localToolchain.leanBin && localToolchain.matchedDir) {
    console.log(
      `check:lean  local Lean 4 toolchain found (${localToolchain.matchedDir}): running lake build`,
    )
    const binDir = dirname(localToolchain.lakeBin)
    const pathSep = process.platform === 'win32' ? ';' : ':'
    const env: NodeJS.ProcessEnv = {
      ...process.env,
      PATH: `${binDir}${pathSep}${process.env.PATH ?? ''}`,
    }

    const build = spawnSync(localToolchain.lakeBin, ['build'], {
      cwd: proofDir,
      encoding: 'utf8',
      env,
      maxBuffer: 64 * 1024 * 1024,
    })

    const combinedBuildOut = `${build.stdout ?? ''}\n${build.stderr ?? ''}`.trim()
    if (build.error) {
      console.error(`  FAIL  lake build error: ${build.error.message}`)
      process.exit(1)
    }
    if (combinedBuildOut.length > 0) {
      console.log(combinedBuildOut)
    }
    if (build.status !== 0) {
      console.error(`  FAIL  lake build exited with code ${build.status ?? 1}`)
      process.exit(build.status ?? 1)
    }
    if (/\bwarning:/i.test(combinedBuildOut)) {
      console.error('  FAIL  lake build emitted Lean warnings')
      process.exit(1)
    }

    console.log('check:lean  Lean 4 kernel build PASS (lake build exited 0, 0 warnings)')

    const axiomAudit = auditPrintAxioms(
      localToolchain.lakeBin,
      localToolchain.leanBin,
      env,
      publicDecls,
    )
    if (!axiomAudit.passed) {
      for (const e of axiomAudit.errors) {
        console.error(`  FAIL  ${e}`)
      }
      process.exit(1)
    }
    console.log(`check:lean  #print axioms PASS (${axiomAudit.summary})`)

    const liveComparator = extractKernelComparator(
      localToolchain.lakeBin,
      localToolchain.leanBin,
      env,
      headlineDecls,
    )
    if (!liveComparator.passed) {
      for (const e of liveComparator.errors) {
        console.error(`  FAIL  ${e}`)
      }
      process.exit(1)
    }

    if (updateFreeze) {
      const payload: ComparatorFreeze = {
        toolchain: toolchainSpec,
        theoremCount: liveComparator.records.length,
        allowedAxioms: [...ALLOWED_AXIOMS].sort((a, b) => a.localeCompare(b)),
        theorems: liveComparator.records,
      }
      writeFileSync(comparatorPath, `${JSON.stringify(payload, null, 2)}\n`, 'utf8')
      console.log(
        `check:lean  comparator.json UPDATED (${payload.theoremCount} headline theorems frozen -> ${comparatorPath})`,
      )
    } else {
      const freezeCheck = verifyComparatorFreeze(toolchainSpec, liveComparator.records)
      if (!freezeCheck.passed) {
        for (const e of freezeCheck.errors) {
          console.error(`  FAIL  ${e}`)
        }
        process.exit(1)
      }
      console.log(`check:lean  comparator.json freeze PASS (${freezeCheck.summary})`)
    }
  } else {
    const reason = localToolchain.accessError
      ? `toolchains directory unreadable or mismatched (${localToolchain.accessError})`
      : `no extracted Lean 4 toolchain matching ${toolchainSpec} under ${localToolchain.toolchainsDir}`
    if (allowMissingLean) {
      console.log(
        `check:lean  SKIPPED KERNEL BUILD (--allow-missing-lean): ${reason}`,
      )
    } else {
      console.error(
        `  FAIL  local Lean 4 toolchain (${toolchainSpec}) unavailable: ${reason}`,
      )
      console.error(
        '  FAIL  refusing to pass check:lean without running `lake build`, `#print axioms`, and `comparator.json` freeze (pass --no-build or --allow-missing-lean to skip kernel verification explicitly)',
      )
      process.exit(1)
    }
  }

  // Run E-FND-0185's exact zero-float BigInt algebraic proof-certificate suite (T1..T6)
  const started = Date.now()
  const cert = runInfiniteTimeProofs()
  const elapsedSec = ((Date.now() - started) / 1000).toFixed(3)
  const bigIntPassed =
    cert.theorem1.passed &&
    cert.theorem2.passed &&
    cert.theorem3.passed &&
    cert.theorem4.passed &&
    cert.theorem5.passed &&
    cert.theorem6.passed

  if (!bigIntPassed) {
    console.error('  FAIL  E-FND-0185 BigInt proof-certificate suite failed')
    console.error(
      JSON.stringify(
        {
          theorem1: cert.theorem1.passed,
          theorem2: cert.theorem2.passed,
          theorem3: cert.theorem3.passed,
          theorem4: cert.theorem4.passed,
          theorem5: cert.theorem5.passed,
          theorem6: cert.theorem6.passed,
        },
        null,
        2,
      ),
    )
    process.exit(1)
  }

  console.log(
    `check:lean  E-FND-0185 exact BigInt certificates PASS (T1..T6 all true, ${elapsedSec}s)`,
  )
}

main()
