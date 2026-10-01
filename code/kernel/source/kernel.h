// THE VIBE KERNEL PRIMITIVES, declared once for the native addon (node.c) and the wasm module (wasm.c). code/kernel/
// Every primitive computes a RANGE of disjoint output rows [start, end) and nothing else, so a caller may split its rows
// across threads in any way and get the same bytes: each output element is written by exactly one range, and the sums
// inside it run in the order the TypeScript reference in code/kernel/js.ts runs them. See kernel.c for the arithmetic.
//
// DETERMINISM: no random numbers, no atomics in any sum, no reassociation. Built with -ffp-contract=off so no a * b + c
// becomes a fused multiply-add (JavaScript rounds every operation), and never with -ffast-math.

#ifndef VIBE_KERNEL_H
#define VIBE_KERNEL_H

#include <stdint.h>

// the gathered block convolution's static tables (code/measure/register-ball-reduced and register-reduced's conv): a
// sector of `count` representatives, 24 roots, the neighbour's representative (or -1) and the group element that
// carries it, the element's signed index map per pair type, and the sparse 8 x 8 overlap per root, C then C^dag
typedef struct {
  int32_t count;
  int32_t elements;
  int32_t *plusRep;
  int32_t *plusG;
  int32_t *minusRep;
  int32_t *minusG;
  int16_t *src;   // elements * 4 * 64
  int8_t *sgn;    // elements * 4 * 64
  int32_t *off;   // 25
  int8_t *row;
  int8_t *col;
  double *val;
  int32_t *offT;  // 25
  int8_t *rowT;
  int8_t *colT;
  double *valT;
  double halfRe[24];
  double halfIm[24];
} vk_pair_op;

// out[i] = sum over roots d of C_d (or C_d^dag) applied on member 1 or 2 to the source block of the neighbour, read
// through the element's signed index map; rows i in [start, end)
void vk_conv(const vk_pair_op *op, const double *srcRe, const double *srcIm,
             int32_t srcOff, int32_t srcStride, int32_t t, double *outRe,
             double *outIm, int32_t member, int32_t dagger, int32_t start,
             int32_t end);

// one beat's site-local update (register-meson's pairCycle, reduced): the main block (A in beat 1, D in beat 2) from
// t1, t2, f and beta; block B from qB and block X from qX, with alpha = (alr, ali)
void vk_pair_beat(double *re, double *im, const double *t1r, const double *t1i,
                  const double *t2r, const double *t2i, const double *fr,
                  const double *fi, const double *qBr, const double *qBi,
                  const double *qXr, const double *qXi, const double *beta,
                  double alr, double ali, int32_t mainOff, int32_t start,
                  int32_t end);

// register-reduced's cross piece: p = st[own] + t1 + t2 + t4, then st[own] += cross * p where cross is not 0
void vk_cross_apply(double *re, double *im, const double *t1r,
                    const double *t1i, const double *t2r, const double *t2i,
                    const double *t4r, const double *t4i, const double *cross,
                    int32_t own, int32_t start, int32_t end);

// out block `off` += f, per representative (the Gram's add)
void vk_block_add(double *outRe, double *outIm, const double *fr,
                  const double *fi, int32_t off, int32_t start, int32_t end);

// per representative i: (sr, si) = sum over its 256 entries of conj(a) b, in order; the caller sums w_i (sr, si) in order
void vk_block_inner(const double *aRe, const double *aIm, const double *bRe,
                    const double *bIm, double *partRe, double *partIm,
                    int32_t start, int32_t end);

// y += (fr + i fi) x and st *= f, over entries [start, end)
void vk_axpy(double *yRe, double *yIm, const double *xRe, const double *xIm,
             double fr, double fi, int32_t start, int32_t end);
void vk_scale(double *re, double *im, double f, int32_t start, int32_t end);

// register-sea's sectorPiece at docks [start, end): psi <- psi + alpha (Q psi + psi Q) + beta Q psi Q, Q = E E^T, with
// optional per-dock phase (c, s) applied first (the rule's `whole` control; phase NULL when off). Its scratch (6,272
// doubles) lives on the calling thread's stack
void vk_sea_piece(double *re, double *im, const double *E, const double *alpha,
                  const double *beta, const double *phase, int32_t start,
                  int32_t end);

// register-sea's swap coin and stream, source docks [start, end)
void vk_sea_stream(const double *sRe, const double *sIm, double *oRe,
                   double *oIm, const int32_t *move, const int32_t *opposite,
                   int32_t start, int32_t end);

// the phase-weighted sum over docks (register-sea's pairAt): M[k] = sum_i (c_i + i s_i) psi_i[k], zero entries skipped,
// for entries k in [start, end) of a block of `width`
void vk_phase_sum(const double *re, const double *im, const double *c,
                  const double *s, int32_t docks, int32_t width, double *mRe,
                  double *mIm, int32_t start, int32_t end);

#endif
