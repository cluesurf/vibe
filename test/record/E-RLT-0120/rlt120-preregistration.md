# E-RLT-0120 pre-registration: the bound pair's isotropy at a second size

Frozen 2026-10-23, before the droplet run. No a_B 4.5 correlation at any K other than 0 had been computed when this file and `rlt120-gates.json` were written.

- Experiment: `test/experiment/relativity/bound-pair-size-isotropy.ts` (its header is the full design).
- Gates file: `rlt120-gates.json`, SHA-256 `ad33bafac423211ad74cdc4bc15774341dd0ccc97429ee59765180e5e197bd4a`. The experiment holds the same hash as `GATES_SHA256`, and the combine reads every threshold from that file and reads open if the file does not hash to it.
- Checklist item: vibe-roadmap-moving-matter-0003.

## The question

Is the bound register pair's band isotropic at a second pair size, a_B 4.5 in a ball of radius 21, against E-RLT-0119's a_B 3.5 in a ball of 16? The radius is `radiusOf(4.5) = ceil(4.5 x 4.5) = 21`, the rule that gave E-RLT-0119's 16. a_B 4.5 is 1.29 times the size and puts the lattice term 1 / a_B^2 at 0.60 of E-RLT-0119's, toward the continuum. A pair smaller than 3.5 would be a stronger lattice test and cheaper, but the hydrogenic start has not been used below 3.5 with this engine.

## The plan

Five directions (axis (1,0,0), face (1,1,0), body (1,1,1), plane (2,1,0), generic (1,2,3)) at kappa 0.04, 0.08, 0.12, 0.16, 8,191 lags each. The axis K = 0 read is the reference at 8,191 lags, and the other K = 0 reads have 1,024. Two cubic images of the generic direction, (2,3,1) and (1,2,-3), are read at kappa 0.16 to 512 lags. The plan is E-RLT-0119's, read for read.

## What the probes saw before this was frozen (K = 0 only, scripts and logs in `probe/`)

- Sector sizes at ball 21: axis 5,468, face 10,323, body 6,983, plane 20,142, generic 38,911 representatives (2.26 times ball 16).
- The level: E_L 1.6504683714095383, its one-cycle residual 1.8226e-3 (3.5: 1.5231e-3).
- The K = 0 axis read at 4,096 lags: the start is one cluster with lines (filter diagonalization, S 2,048) of 0.28, 0.53, 0.10 and 0.04 at -2.6e-3, +0.7e-3, +2.0e-3 and +3.7e-3 from E_L. At 3.5 the same read shows one line holding 0.82. In [E_L - 0.02, E_L + 0.02] the start's weight is 1.000000 at both sizes, and the smoothed density at the window's edges is below 1e-8 of a line. This placed the fixed window and the synthetic witness's lines.
- A dry run of this combine with these gates on E-RLT-0119's recorded a_B 3.5 parts (`probe/rlt120-dry.ts`, its output `probe/rlt120-dry.log`) read PASS: every instrument held, G3 included (sigma_A / A at most 0.12%), every direction MOVES, centroid anisotropy 6.8e-4. No gate was changed after it.

## The reads

- The curvature comes from the level group's centroid (`code/measure/level-group` groupMoments) on the fixed window [E_L - h, E_L + h]. The settings are sigma 1.0e-3, 1.5e-3, 2.0e-3 with h 0.02 and 0.015, six in all, and the first is the main read. sigma 1e-3 reaches 7,434 lags and 2e-3 reaches 3,715, so the spread over the settings is the lag-convergence check on centroids.
- Fit d = A kappa^2 + C kappa^4 over the four kappas, M = 1 / (2A). sigma_A = hypot(FIT, SETTINGS, GRID): the fit's standard error, max over settings |A_s - A|, and |A - A(kappa <= 0.12)|.
- Filter-diagonalization lines (on [E_L - 0.008, E_L + 0.012], basis 80, S 4,096) serve only I2, the still share and the controls' line, never a curvature.

## The gates, verbatim (numbers from `rlt120-gates.json`)

INSTRUMENTS:
- W: the reference's one-cycle residual sqrt(1 - |x_1|^2) is within 1% of the level's own residual.
- W2: a synthetic correlation of lines at E0 + (0, -2.6e-3, +2.0e-3, +3.7e-3, +0.04) with weights (0.53, 0.28, 0.10, 0.04, 0.05) gives the group centroid within 1e-7 of the exact weighted mean of the lines in its window, at every setting.
- I1: |x_l| <= 1 + 1e-6 in every correlation.
- I2: the reference's heaviest line has |z| within 1e-6 of 1.
- I3: every part's level is within 1e-12 of the first's (relative), and every sector's K = 0 correlation is within 1e-12 of the reference at every lag it has.
- I6: each cubic image is within 1e-12 of the generic read at every lag it has.
- I5: the group weight is at least 0.99 at every read and setting (the window keeps the start).
- I4: LINES >= 3 x BAND for the residual at kappa 0.12 and 0.16 in every direction.
- G3: every sigma_A / A <= 0.005.
- Every read landed, and the gates file hashes to the frozen value.

PHYSICS:
- G1 MOBILE: in every direction A >= 10 sigma_A, and at the smallest kappa d > 0 and d >= 10 x max over settings |d_s - d|.
- G2 ISOTROPIC: the max over the five directions of |M_n / M_mean - 1| is below 0.02.
- G4 ONE BAND, at kappa 0.12 and 0.16 in every direction: MOVES when residual <= BAND + (LINES - BAND) / 3 and, where LINES leaves a still share at least 0.1 above BAND's, still <= BAND + (LINES - BAND) / 3. STUCK when residual >= BAND + 2 (LINES - BAND) / 3 (and still too, where used). A direction MOVES (STUCK) when both its reads do. The residual is the 6,144-cycle filter at E0L + a_mean kappa^2 read in one cycle, and still is the weight of the lines within 2e-4 of E0L over w0L. LINES puts twelve line branches at E0L + 4 a_mean kappa^2 (n . u)^2 in place of the heaviest K = 0 line, and BAND puts one line at E0L + A_n kappa^2 + C_n kappa^4. a_mean is the mean of the five centroid A, which favors neither hypothesis, since both give the centroid the same K^2 term.

VERDICT: open if an instrument fails. PASS if G1, G2 and every direction MOVES. FAIL if G1 or G2 fails or a direction is STUCK. Open otherwise.

REPORTED, moving no status: C_n and the fit C(n) = alpha + beta sum_i n_i^4, the heaviest-line A per direction (E-RLT-0119's read), and M_mean and the anisotropy against E-RLT-0119's 27.448 and 1.28e-3. Also whether the minimum is at K 0.

## What the gates can and cannot show

The start is O_h-invariant, so the K^2 term of its diagonal energy is an invariant symmetric form, a scalar. G2 read on centroids is therefore assured by symmetry whatever the pair does. The smoke test's tiny pair, which the controls call STUCK, gave five equal A. G2 checks the instrument and the K^4 contamination of the fit, and it is kept because the item names it, but it carries no physics alone. The physics is in G4, the one-band reads against the line-branch and band controls, and in G1's smallest-kappa shift.

## Prediction and risk

Predicted: PASS, with M_mean within 2% of 27.45. The risk is that the 4.5 start is a looser cluster (its heaviest line holds 0.53, not 0.82), so the controls, built by replacing that one line, may separate by less than 3 times and fail I4. That reads open.

## Cost

The plan is 2.84e9 representative-lags. E-RLT-0119's droplet rate, 3.3e-5 s a representative-lag at 6 threads, gives about 26 h at 6 threads. At 3 threads and nice 19, sharing the droplet with one other run, the estimate is 45 to 55 h.
