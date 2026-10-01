// THE VIBE KERNEL AS A NODE ADDON, the native backend. code/kernel/
// Node has no FFI, but it ships the Node-API headers (include/node/node_api.h beside the node binary), and a shared
// library built against them loads with process.dlopen or require, with no npm package: clang -shared -undefined
// dynamic_lookup resolves the napi_* symbols against the running node. So the typed arrays an engine already holds are
// read and written IN PLACE (napi_get_typedarray_info gives their data pointers, SharedArrayBuffer-backed or not), with
// no copy in or out.
//
// THREADS: a persistent pool of pthreads. A call splits its rows into `parts` contiguous ranges, row k * rows / parts to
// (k + 1) * rows / parts, the calling thread computing range 0 and pool thread k range k, and returns when all are done.
// Every primitive in kernel.c writes only its own rows and sums inside a row in the reference's order, so the bytes do
// not depend on the thread count or the split (the equivalence check proves it at 1, 2, 4, 8 and 16 threads).

#include <node_api.h>
#include <pthread.h>
#include <stdint.h>
#include <stdlib.h>
#include <string.h>

#include "kernel.h"

#define MAX_THREADS 64

// ---- the pool ----

typedef void (*vk_job)(void *ctx, int32_t start, int32_t end);

static pthread_mutex_t pool_mu = PTHREAD_MUTEX_INITIALIZER;
static pthread_cond_t pool_go = PTHREAD_COND_INITIALIZER;
static pthread_cond_t pool_done = PTHREAD_COND_INITIALIZER;
static int pool_started = 0;
static uint64_t pool_generation = 0;
static uint64_t pool_born[MAX_THREADS + 1];
static int pool_remaining = 0;
static vk_job pool_job = NULL;
static void *pool_ctx = NULL;
static int32_t pool_rows = 0;
static int pool_parts = 1;
static int pool_want = 1;

static void part_range(int32_t rows, int parts, int k, int32_t *s, int32_t *e) {
  *s = (int32_t)(((int64_t)k * rows) / parts);
  *e = (int32_t)(((int64_t)(k + 1) * rows) / parts);
}

static void *pool_worker(void *arg) {
  const int id = (int)(intptr_t)arg;

  pthread_mutex_lock(&pool_mu);

  uint64_t seen = pool_born[id];

  for (;;) {
    while (pool_generation == seen) {
      pthread_cond_wait(&pool_go, &pool_mu);
    }

    seen = pool_generation;

    if (id < pool_parts) {
      const vk_job job = pool_job;
      void *ctx = pool_ctx;
      const int parts = pool_parts;
      const int32_t rows = pool_rows;
      int32_t s;
      int32_t e;

      pthread_mutex_unlock(&pool_mu);
      part_range(rows, parts, id, &s, &e);
      job(ctx, s, e);
      pthread_mutex_lock(&pool_mu);

      if (--pool_remaining == 0) {
        pthread_cond_signal(&pool_done);
      }
    }
  }

  return NULL;
}

// start pool threads 1 .. n - 1 (the caller is thread 0)
static void pool_grow(int n) {
  pthread_mutex_lock(&pool_mu);

  while (pool_started + 1 < n) {
    const int id = pool_started + 1;
    pthread_t th;
    pthread_attr_t attr;

    pool_born[id] = pool_generation;
    pthread_attr_init(&attr);
    // vk_sea_piece keeps 50 KB of scratch on the stack
    pthread_attr_setstacksize(&attr, 4 << 20);
    pthread_attr_setdetachstate(&attr, PTHREAD_CREATE_DETACHED);
    pthread_create(&th, &attr, pool_worker, (void *)(intptr_t)id);
    pthread_attr_destroy(&attr);
    pool_started++;
  }

  pthread_mutex_unlock(&pool_mu);
}

// run job over rows, at least `grain` rows a part
static void pool_run(vk_job job, void *ctx, int32_t rows, int32_t grain) {
  int parts = pool_want;
  const int32_t most = grain > 0 ? (rows + grain - 1) / grain : rows;

  if (parts > most) {
    parts = (int)most;
  }

  if (parts <= 1) {
    job(ctx, 0, rows);
    return;
  }

  pool_grow(parts);
  pthread_mutex_lock(&pool_mu);
  pool_job = job;
  pool_ctx = ctx;
  pool_rows = rows;
  pool_parts = parts;
  pool_remaining = parts - 1;
  pool_generation++;
  pthread_cond_broadcast(&pool_go);
  pthread_mutex_unlock(&pool_mu);

  int32_t s;
  int32_t e;

  part_range(rows, parts, 0, &s, &e);
  job(ctx, s, e);

  pthread_mutex_lock(&pool_mu);

  while (pool_remaining > 0) {
    pthread_cond_wait(&pool_done, &pool_mu);
  }

  pthread_mutex_unlock(&pool_mu);
}

// ---- argument reading ----

#define CHECK(call)                                                         \
  do {                                                                      \
    if ((call) != napi_ok) {                                                \
      napi_throw_error(env, NULL, "vibe kernel: a Node-API call failed"); \
      return NULL;                                                          \
    }                                                                       \
  } while (0)

static int typed(napi_env env, napi_value v, napi_typedarray_type want,
                 void **data, size_t *length, const char *what) {
  bool is = false;
  napi_typedarray_type type;

  if (napi_is_typedarray(env, v, &is) != napi_ok || !is ||
      napi_get_typedarray_info(env, v, &type, length, data, NULL, NULL) !=
          napi_ok ||
      type != want) {
    char msg[160];

    snprintf(msg, sizeof msg, "vibe kernel: %s has the wrong array type", what);
    napi_throw_type_error(env, NULL, msg);
    return 0;
  }

  return 1;
}

#define F64(i, name, len)                                                     \
  double *name = NULL;                                                        \
  size_t len = 0;                                                             \
  if (!typed(env, argv[i], napi_float64_array, (void **)&name, &len, #name)) \
    return NULL;

#define I32(i, name, len)                                                   \
  int32_t *name = NULL;                                                     \
  size_t len = 0;                                                           \
  if (!typed(env, argv[i], napi_int32_array, (void **)&name, &len, #name)) \
    return NULL;

#define I16(i, name, len)                                                   \
  int16_t *name = NULL;                                                     \
  size_t len = 0;                                                           \
  if (!typed(env, argv[i], napi_int16_array, (void **)&name, &len, #name)) \
    return NULL;

#define I8(i, name, len)                                                   \
  int8_t *name = NULL;                                                     \
  size_t len = 0;                                                          \
  if (!typed(env, argv[i], napi_int8_array, (void **)&name, &len, #name)) \
    return NULL;

#define INT(i, name)     \
  int32_t name = 0;      \
  CHECK(napi_get_value_int32(env, argv[i], &name));

#define NUM(i, name)     \
  double name = 0;       \
  CHECK(napi_get_value_double(env, argv[i], &name));

#define ARGS(n)                                                    \
  size_t argc = n;                                                 \
  napi_value argv[n];                                              \
  CHECK(napi_get_cb_info(env, info, &argc, argv, NULL, NULL));     \
  if (argc < n) {                                                  \
    napi_throw_error(env, NULL, "vibe kernel: too few arguments"); \
    return NULL;                                                   \
  }

static napi_value undefined(napi_env env) {
  napi_value u;

  napi_get_undefined(env, &u);
  return u;
}

// ---- threads ----

static napi_value js_threads(napi_env env, napi_callback_info info) {
  ARGS(1);
  INT(0, n);

  if (n < 1 || n > MAX_THREADS) {
    napi_throw_range_error(env, NULL, "vibe kernel: threads must be 1 to 64");
    return NULL;
  }

  pool_want = n;

  napi_value out;

  CHECK(napi_create_int32(env, pool_want, &out));
  return out;
}

// ---- the pair operator ----

static void *copy(const void *from, size_t bytes) {
  void *to = malloc(bytes > 0 ? bytes : 1);

  if (bytes > 0) {
    memcpy(to, from, bytes);
  }

  return to;
}

static void op_free(napi_env env, void *data, void *hint) {
  vk_pair_op *op = (vk_pair_op *)data;

  (void)env;
  (void)hint;
  free(op->plusRep);
  free(op->plusG);
  free(op->minusRep);
  free(op->minusG);
  free(op->src);
  free(op->sgn);
  free(op->off);
  free(op->row);
  free(op->col);
  free(op->val);
  free(op->offT);
  free(op->rowT);
  free(op->colT);
  free(op->val == NULL ? NULL : op->valT);
  free(op);
}

// pairOp(plusRep, plusG, minusRep, minusG, src, sgn, off, row, col, val, offT, rowT, colT, valT, halfRe, halfIm)
static napi_value js_pair_op(napi_env env, napi_callback_info info) {
  ARGS(16);
  I32(0, plusRep, nPR);
  I32(1, plusG, nPG);
  I32(2, minusRep, nMR);
  I32(3, minusG, nMG);
  I16(4, src, nSrc);
  I8(5, sgn, nSgn);
  I32(6, off, nOff);
  I8(7, row, nRow);
  I8(8, col, nCol);
  F64(9, val, nVal);
  I32(10, offT, nOffT);
  I8(11, rowT, nRowT);
  I8(12, colT, nColT);
  F64(13, valT, nValT);
  F64(14, halfRe, nHR);
  F64(15, halfIm, nHI);

  if (nPR % 24 != 0 || nPG != nPR || nMR != nPR || nMG != nPR ||
      nSrc % 256 != 0 || nSgn != nSrc || nOff != 25 || nOffT != 25 ||
      nRow != nVal || nCol != nVal || nRowT != nValT || nColT != nValT ||
      nHR != 24 || nHI != 24 || (size_t)off[24] != nVal ||
      (size_t)offT[24] != nValT) {
    napi_throw_range_error(env, NULL, "vibe kernel: pairOp tables disagree in size");
    return NULL;
  }

  vk_pair_op *op = (vk_pair_op *)calloc(1, sizeof(vk_pair_op));

  op->count = (int32_t)(nPR / 24);
  op->elements = (int32_t)(nSrc / 256);
  op->plusRep = (int32_t *)copy(plusRep, nPR * 4);
  op->plusG = (int32_t *)copy(plusG, nPG * 4);
  op->minusRep = (int32_t *)copy(minusRep, nMR * 4);
  op->minusG = (int32_t *)copy(minusG, nMG * 4);
  op->src = (int16_t *)copy(src, nSrc * 2);
  op->sgn = (int8_t *)copy(sgn, nSgn);
  op->off = (int32_t *)copy(off, 25 * 4);
  op->row = (int8_t *)copy(row, nRow);
  op->col = (int8_t *)copy(col, nCol);
  op->val = (double *)copy(val, nVal * 8);
  op->offT = (int32_t *)copy(offT, 25 * 4);
  op->rowT = (int8_t *)copy(rowT, nRowT);
  op->colT = (int8_t *)copy(colT, nColT);
  op->valT = (double *)copy(valT, nValT * 8);
  memcpy(op->halfRe, halfRe, sizeof op->halfRe);
  memcpy(op->halfIm, halfIm, sizeof op->halfIm);

  // every neighbour and element index in range, so the kernel never reads outside a table
  for (size_t k = 0; k < nPR; k++) {
    if (op->plusRep[k] >= op->count || op->minusRep[k] >= op->count ||
        (op->plusRep[k] >= 0 && (op->plusG[k] < 0 || op->plusG[k] >= op->elements)) ||
        (op->minusRep[k] >= 0 && (op->minusG[k] < 0 || op->minusG[k] >= op->elements))) {
      op_free(env, op, NULL);
      napi_throw_range_error(env, NULL, "vibe kernel: a neighbour or element index is out of range");
      return NULL;
    }
  }

  for (size_t k = 0; k < nSrc; k++) {
    if (op->src[k] < 0 || op->src[k] >= 64) {
      op_free(env, op, NULL);
      napi_throw_range_error(env, NULL, "vibe kernel: a source index is out of range");
      return NULL;
    }
  }

  napi_value out;

  CHECK(napi_create_external(env, op, op_free, NULL, &out));
  return out;
}

static vk_pair_op *op_of(napi_env env, napi_value v) {
  void *data = NULL;

  if (napi_get_value_external(env, v, &data) != napi_ok || data == NULL) {
    napi_throw_type_error(env, NULL, "vibe kernel: not a pair operator");
    return NULL;
  }

  return (vk_pair_op *)data;
}

// ---- conv ----

typedef struct {
  const vk_pair_op *op;
  const double *srcRe;
  const double *srcIm;
  int32_t srcOff;
  int32_t srcStride;
  int32_t t;
  double *outRe;
  double *outIm;
  int32_t member;
  int32_t dagger;
} conv_ctx;

static void conv_job(void *c, int32_t s, int32_t e) {
  const conv_ctx *x = (const conv_ctx *)c;

  vk_conv(x->op, x->srcRe, x->srcIm, x->srcOff, x->srcStride, x->t, x->outRe,
          x->outIm, x->member, x->dagger, s, e);
}

// conv(op, srcRe, srcIm, srcOff, srcStride, t, outRe, outIm, member, dagger)
static napi_value js_conv(napi_env env, napi_callback_info info) {
  ARGS(10);

  vk_pair_op *op = op_of(env, argv[0]);

  if (!op) {
    return NULL;
  }

  F64(1, srcRe, nSR);
  F64(2, srcIm, nSI);
  INT(3, srcOff);
  INT(4, srcStride);
  INT(5, t);
  F64(6, outRe, nOR);
  F64(7, outIm, nOI);
  INT(8, member);
  INT(9, dagger);

  const int64_t need = (int64_t)(op->count - 1) * srcStride + srcOff + 64;

  if (nSR != nSI || nOR != nOI || (int64_t)nSR < need ||
      nOR < (size_t)op->count * 64 || t < 0 || t > 3 || srcOff < 0 ||
      (member != 1 && member != 2)) {
    napi_throw_range_error(env, NULL, "vibe kernel: conv arguments out of range");
    return NULL;
  }

  conv_ctx x = {op, srcRe, srcIm, srcOff, srcStride, t, outRe, outIm, member, dagger};

  pool_run(conv_job, &x, op->count, 4);
  return undefined(env);
}

// ---- the beat, the cross piece, the Gram add, the inner ----

typedef struct {
  double *re, *im;
  const double *t1r, *t1i, *t2r, *t2i, *fr, *fi, *qBr, *qBi, *qXr, *qXi, *beta;
  double alr, ali;
  int32_t mainOff;
} beat_ctx;

static void beat_job(void *c, int32_t s, int32_t e) {
  const beat_ctx *x = (const beat_ctx *)c;

  vk_pair_beat(x->re, x->im, x->t1r, x->t1i, x->t2r, x->t2i, x->fr, x->fi,
               x->qBr, x->qBi, x->qXr, x->qXi, x->beta, x->alr, x->ali,
               x->mainOff, s, e);
}

// pairBeat(re, im, t1r, t1i, t2r, t2i, fr, fi, qBr, qBi, qXr, qXi, beta, alr, ali, mainOff)
static napi_value js_pair_beat(napi_env env, napi_callback_info info) {
  ARGS(16);
  F64(0, re, nRe);
  F64(1, im, nIm);
  F64(2, t1r, a1);
  F64(3, t1i, a2);
  F64(4, t2r, a3);
  F64(5, t2i, a4);
  F64(6, fr, a5);
  F64(7, fi, a6);
  F64(8, qBr, a7);
  F64(9, qBi, a8);
  F64(10, qXr, a9);
  F64(11, qXi, a10);
  F64(12, beta, nBeta);
  NUM(13, alr);
  NUM(14, ali);
  INT(15, mainOff);

  const size_t n = nBeta / 2;
  const size_t f = n * 64;

  if (nRe != n * 256 || nIm != nRe || a1 < f || a2 < f || a3 < f || a4 < f ||
      a5 < f || a6 < f || a7 < f || a8 < f || a9 < f || a10 < f ||
      (mainOff != 0 && mainOff != 192)) {
    napi_throw_range_error(env, NULL, "vibe kernel: pairBeat arguments out of range");
    return NULL;
  }

  beat_ctx x = {re, im, t1r, t1i, t2r, t2i, fr, fi, qBr, qBi, qXr, qXi, beta, alr, ali, mainOff};

  pool_run(beat_job, &x, (int32_t)n, 16);
  return undefined(env);
}

typedef struct {
  double *re, *im;
  const double *t1r, *t1i, *t2r, *t2i, *t4r, *t4i, *cross;
  int32_t own;
} cross_ctx;

static void cross_job(void *c, int32_t s, int32_t e) {
  const cross_ctx *x = (const cross_ctx *)c;

  vk_cross_apply(x->re, x->im, x->t1r, x->t1i, x->t2r, x->t2i, x->t4r, x->t4i,
                 x->cross, x->own, s, e);
}

// crossApply(re, im, t1r, t1i, t2r, t2i, t4r, t4i, cross, own)
static napi_value js_cross_apply(napi_env env, napi_callback_info info) {
  ARGS(10);
  F64(0, re, nRe);
  F64(1, im, nIm);
  F64(2, t1r, a1);
  F64(3, t1i, a2);
  F64(4, t2r, a3);
  F64(5, t2i, a4);
  F64(6, t4r, a5);
  F64(7, t4i, a6);
  F64(8, cross, nCross);
  INT(9, own);

  const size_t n = nCross / 2;
  const size_t f = n * 64;

  if (nRe != n * 256 || nIm != nRe || a1 < f || a2 < f || a3 < f || a4 < f ||
      a5 < f || a6 < f || (own != 64 && own != 128)) {
    napi_throw_range_error(env, NULL, "vibe kernel: crossApply arguments out of range");
    return NULL;
  }

  cross_ctx x = {re, im, t1r, t1i, t2r, t2i, t4r, t4i, cross, own};

  pool_run(cross_job, &x, (int32_t)n, 16);
  return undefined(env);
}

typedef struct {
  double *outRe, *outIm;
  const double *fr, *fi;
  int32_t off;
} add_ctx;

static void add_job(void *c, int32_t s, int32_t e) {
  const add_ctx *x = (const add_ctx *)c;

  vk_block_add(x->outRe, x->outIm, x->fr, x->fi, x->off, s, e);
}

// blockAdd(outRe, outIm, fr, fi, off)
static napi_value js_block_add(napi_env env, napi_callback_info info) {
  ARGS(5);
  F64(0, outRe, nOR);
  F64(1, outIm, nOI);
  F64(2, fr, nFR);
  F64(3, fi, nFI);
  INT(4, off);

  const size_t n = nOR / 256;

  if (nOI != nOR || nOR % 256 != 0 || nFR < n * 64 || nFI < n * 64 ||
      (off != 0 && off != 64 && off != 128 && off != 192)) {
    napi_throw_range_error(env, NULL, "vibe kernel: blockAdd arguments out of range");
    return NULL;
  }

  add_ctx x = {outRe, outIm, fr, fi, off};

  pool_run(add_job, &x, (int32_t)n, 64);
  return undefined(env);
}

typedef struct {
  const double *aRe, *aIm, *bRe, *bIm;
  double *partRe, *partIm;
} inner_ctx;

static void inner_job(void *c, int32_t s, int32_t e) {
  const inner_ctx *x = (const inner_ctx *)c;

  vk_block_inner(x->aRe, x->aIm, x->bRe, x->bIm, x->partRe, x->partIm, s, e);
}

// blockInner(aRe, aIm, bRe, bIm, partRe, partIm)
static napi_value js_block_inner(napi_env env, napi_callback_info info) {
  ARGS(6);
  F64(0, aRe, n1);
  F64(1, aIm, n2);
  F64(2, bRe, n3);
  F64(3, bIm, n4);
  F64(4, partRe, nPR);
  F64(5, partIm, nPI);

  if (nPI != nPR || n1 != nPR * 256 || n2 != n1 || n3 != n1 || n4 != n1) {
    napi_throw_range_error(env, NULL, "vibe kernel: blockInner arguments out of range");
    return NULL;
  }

  inner_ctx x = {aRe, aIm, bRe, bIm, partRe, partIm};

  pool_run(inner_job, &x, (int32_t)nPR, 64);
  return undefined(env);
}

// ---- axpy, scale ----

typedef struct {
  double *yRe, *yIm;
  const double *xRe, *xIm;
  double fr, fi;
} axpy_ctx;

static void axpy_job(void *c, int32_t s, int32_t e) {
  const axpy_ctx *x = (const axpy_ctx *)c;

  vk_axpy(x->yRe, x->yIm, x->xRe, x->xIm, x->fr, x->fi, s, e);
}

// axpy(yRe, yIm, xRe, xIm, fr, fi)
static napi_value js_axpy(napi_env env, napi_callback_info info) {
  ARGS(6);
  F64(0, yRe, n1);
  F64(1, yIm, n2);
  F64(2, xRe, n3);
  F64(3, xIm, n4);
  NUM(4, fr);
  NUM(5, fi);

  if (n2 != n1 || n3 < n1 || n4 < n1 || n1 > INT32_MAX) {
    napi_throw_range_error(env, NULL, "vibe kernel: axpy arguments out of range");
    return NULL;
  }

  axpy_ctx x = {yRe, yIm, xRe, xIm, fr, fi};

  pool_run(axpy_job, &x, (int32_t)n1, 1 << 14);
  return undefined(env);
}

typedef struct {
  double *re, *im;
  double f;
} scale_ctx;

static void scale_job(void *c, int32_t s, int32_t e) {
  const scale_ctx *x = (const scale_ctx *)c;

  vk_scale(x->re, x->im, x->f, s, e);
}

// scale(re, im, f)
static napi_value js_scale(napi_env env, napi_callback_info info) {
  ARGS(3);
  F64(0, re, n1);
  F64(1, im, n2);
  NUM(2, f);

  if (n2 != n1 || n1 > INT32_MAX) {
    napi_throw_range_error(env, NULL, "vibe kernel: scale arguments out of range");
    return NULL;
  }

  scale_ctx x = {re, im, f};

  pool_run(scale_job, &x, (int32_t)n1, 1 << 14);
  return undefined(env);
}

// ---- register-sea ----

typedef struct {
  double *re, *im;
  const double *E, *alpha, *beta, *phase;
} piece_ctx;

static void piece_job(void *c, int32_t s, int32_t e) {
  const piece_ctx *x = (const piece_ctx *)c;

  vk_sea_piece(x->re, x->im, x->E, x->alpha, x->beta, x->phase, s, e);
}

// seaPiece(re, im, E, alpha, beta, phase or null)
static napi_value js_sea_piece(napi_env env, napi_callback_info info) {
  ARGS(6);
  F64(0, re, n1);
  F64(1, im, n2);
  F64(2, E, nE);
  F64(3, alpha, nA);
  F64(4, beta, nB);

  napi_valuetype kind;
  double *phase = NULL;
  size_t nP = 0;

  CHECK(napi_typeof(env, argv[5], &kind));

  if (kind != napi_null && kind != napi_undefined) {
    if (!typed(env, argv[5], napi_float64_array, (void **)&phase, &nP, "phase")) {
      return NULL;
    }
  }

  const size_t docks = nA / 2;

  if (n2 != n1 || n1 != docks * 192 * 192 || nE != 192 * 8 || nB != nA ||
      (phase && nP != nA)) {
    napi_throw_range_error(env, NULL, "vibe kernel: seaPiece arguments out of range");
    return NULL;
  }

  piece_ctx x = {re, im, E, alpha, beta, phase};

  pool_run(piece_job, &x, (int32_t)docks, 1);
  return undefined(env);
}

typedef struct {
  const double *sRe, *sIm;
  double *oRe, *oIm;
  const int32_t *move, *opposite;
} stream_ctx;

static void stream_job(void *c, int32_t s, int32_t e) {
  const stream_ctx *x = (const stream_ctx *)c;

  vk_sea_stream(x->sRe, x->sIm, x->oRe, x->oIm, x->move, x->opposite, s, e);
}

// seaStream(sRe, sIm, oRe, oIm, move, opposite)
static napi_value js_sea_stream(napi_env env, napi_callback_info info) {
  ARGS(6);
  F64(0, sRe, n1);
  F64(1, sIm, n2);
  F64(2, oRe, n3);
  F64(3, oIm, n4);
  I32(4, move, nMove);
  I32(5, opposite, nOpp);

  const size_t docks = n1 / (192 * 192);

  if (n2 != n1 || n3 != n1 || n4 != n1 || n1 % (192 * 192) != 0 ||
      nMove != docks * 576 || nOpp != 24) {
    napi_throw_range_error(env, NULL, "vibe kernel: seaStream arguments out of range");
    return NULL;
  }

  for (size_t k = 0; k < nMove; k++) {
    if (move[k] < 0 || (size_t)move[k] >= docks) {
      napi_throw_range_error(env, NULL, "vibe kernel: seaStream move out of range");
      return NULL;
    }
  }

  for (int k = 0; k < 24; k++) {
    if (opposite[k] < 0 || opposite[k] >= 24) {
      napi_throw_range_error(env, NULL, "vibe kernel: seaStream opposite out of range");
      return NULL;
    }
  }

  stream_ctx x = {sRe, sIm, oRe, oIm, move, opposite};

  pool_run(stream_job, &x, (int32_t)docks, 1);
  return undefined(env);
}

typedef struct {
  const double *re, *im, *c, *s;
  int32_t docks, width;
  double *mRe, *mIm;
} phase_ctx;

static void phase_job(void *c, int32_t s, int32_t e) {
  const phase_ctx *x = (const phase_ctx *)c;

  vk_phase_sum(x->re, x->im, x->c, x->s, x->docks, x->width, x->mRe, x->mIm, s, e);
}

// phaseSum(re, im, c, s, width, mRe, mIm)
static napi_value js_phase_sum(napi_env env, napi_callback_info info) {
  ARGS(7);
  F64(0, re, n1);
  F64(1, im, n2);
  F64(2, c, nC);
  F64(3, s, nS);
  INT(4, width);
  F64(5, mRe, nMR);
  F64(6, mIm, nMI);

  if (n2 != n1 || nS != nC || width <= 0 || n1 != nC * (size_t)width ||
      nMR != (size_t)width || nMI != nMR) {
    napi_throw_range_error(env, NULL, "vibe kernel: phaseSum arguments out of range");
    return NULL;
  }

  phase_ctx x = {re, im, c, s, (int32_t)nC, width, mRe, mIm};

  pool_run(phase_job, &x, width, 1024);
  return undefined(env);
}

// ---- the module ----

static napi_value init(napi_env env, napi_value exports) {
  const napi_property_descriptor fns[] = {
      {"threads", NULL, js_threads, NULL, NULL, NULL, napi_default, NULL},
      {"pairOp", NULL, js_pair_op, NULL, NULL, NULL, napi_default, NULL},
      {"conv", NULL, js_conv, NULL, NULL, NULL, napi_default, NULL},
      {"pairBeat", NULL, js_pair_beat, NULL, NULL, NULL, napi_default, NULL},
      {"crossApply", NULL, js_cross_apply, NULL, NULL, NULL, napi_default, NULL},
      {"blockAdd", NULL, js_block_add, NULL, NULL, NULL, napi_default, NULL},
      {"blockInner", NULL, js_block_inner, NULL, NULL, NULL, napi_default, NULL},
      {"axpy", NULL, js_axpy, NULL, NULL, NULL, napi_default, NULL},
      {"scale", NULL, js_scale, NULL, NULL, NULL, napi_default, NULL},
      {"seaPiece", NULL, js_sea_piece, NULL, NULL, NULL, napi_default, NULL},
      {"seaStream", NULL, js_sea_stream, NULL, NULL, NULL, napi_default, NULL},
      {"phaseSum", NULL, js_phase_sum, NULL, NULL, NULL, napi_default, NULL},
  };

  if (napi_define_properties(env, exports, sizeof fns / sizeof fns[0], fns) !=
      napi_ok) {
    napi_throw_error(env, NULL, "vibe kernel: could not define the exports");
    return NULL;
  }

  return exports;
}

NAPI_MODULE_INIT() { return init(env, exports); }
