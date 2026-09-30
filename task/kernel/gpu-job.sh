#!/bin/bash
# THE GPU JOB: what task/kernel/gpu-run.ts runs on the rented machine, once, after copying this package to /root/vibe.
# task/kernel/
#   1. the machine: CPU, memory, ROCm, the GPU agents
#   2. the toolchain: node 24 (the official tarball), rust (rustup, minimal stable), tsx (the one npm package the check
#      and the benchmark need, installed beside the package, never into it)
#   3. the builds: the plain native addon and the addon with the hip feature (task/kernel/build.ts)
#   4. the proof: task/kernel/check.ts on native and hip (must pass), then with the kernels compiled WITH contraction
#      (VIBE_KERNEL_GPU_CONTRACT=1, must fail), then the parity suite
#   5. the timings: task/kernel/bench.ts for every engine, native at several thread counts beside hip
# Every step writes tmp/gpu-logs/<step>.log; a failed step is reported and the job goes on, so one failure does not
# cost the rest of a paid hour. The feature to build is the first argument (hip by default; cuda on an NVIDIA machine).

set -u
FEATURE="${1:-hip}"
BACKEND="$FEATURE"
cd /root/vibe || exit 1
LOG=/root/vibe/tmp/gpu-logs
mkdir -p "$LOG"
export PATH=/opt/node/bin:/root/.cargo/bin:/opt/rocm/bin:/usr/local/cuda/bin:$PATH
TSX=/root/tools/node_modules/.bin/tsx

step() {
  local name=$1
  shift
  local t0
  t0=$(date +%s)
  echo "== $(date -u +%H:%M:%S) $name"
  "$@" >"$LOG/$name.log" 2>&1
  local code=$?
  echo "== $(date -u +%H:%M:%S) $name exit $code in $(($(date +%s) - t0)) s"
  tail -n 4 "$LOG/$name.log"
  echo "$name $code $(($(date +%s) - t0))" >>"$LOG/steps.txt"
}

machine() {
  uname -a
  nproc
  free -g
  lscpu | head -n 20
  cat /opt/rocm/.info/version 2>/dev/null
  rocm_agent_enumerator 2>/dev/null
  rocm-smi 2>/dev/null
  nvidia-smi 2>/dev/null
  ls /opt/rocm/lib 2>/dev/null | grep -E 'hiprtc|amdhip64'
}

install_node() {
  local file arch=x64
  # a GH200's Grace CPU is aarch64
  [ "$(uname -m)" = aarch64 ] && arch=arm64
  file=$(curl -fsSL https://nodejs.org/dist/latest-v24.x/SHASUMS256.txt | awk -v a="linux-$arch.tar.xz" '$2 ~ a"$" {print $2}')
  curl -fsSL "https://nodejs.org/dist/latest-v24.x/$file" -o /tmp/node.tar.xz || return 1
  mkdir -p /opt/node
  tar -xJf /tmp/node.tar.xz -C /opt/node --strip-components=1 || return 1
  node --version
}

install_rust() {
  command -v cc || (apt-get update && apt-get install -y build-essential) || return 1
  curl -fsSL https://sh.rustup.rs | sh -s -- -y --profile minimal --default-toolchain stable || return 1
  cargo --version
}

install_tsx() {
  mkdir -p /root/tools
  (cd /root/tools && npm init -y >/dev/null && npm install --no-audit --no-fund tsx@4) || return 1
  "$TSX" --version
}

step machine machine
step install_node install_node
step install_rust install_rust
step install_tsx install_tsx
step build_native "$TSX" task/kernel/build.ts native
step build_gpu "$TSX" task/kernel/build.ts native "$FEATURE"

# the proof: must pass, then the contracted kernels must fail
step check env CHECK_BACKENDS="native,$BACKEND" "$TSX" task/kernel/check.ts
step check_fma_control env CHECK_BACKENDS="$BACKEND" VIBE_KERNEL_GPU_CONTRACT=1 "$TSX" task/kernel/check.ts --quick

# the parity suite, when this package has it (task/kernel/parity.ts): against js, then against the stored golden files,
# then its FMA control on the GPU
if [ -f task/kernel/parity.ts ]; then
  step parity_golden env PARITY_BACKENDS="$BACKEND,native:$(nproc)" "$TSX" task/kernel/parity.ts --golden
  step parity_fma_control env PARITY_BACKENDS="$BACKEND" VIBE_KERNEL_GPU_CONTRACT=1 "$TSX" task/kernel/parity.ts --golden
fi

# the timings: native at several thread counts (every core last) beside the GPU
CORES=$(nproc)
export BENCH_BACKENDS="native,$BACKEND"
export BENCH_THREADS="1,4,8,16,$CORES"
step bench_primitive "$TSX" task/kernel/bench.ts primitive 24
step bench_ball_24 "$TSX" task/kernel/bench.ts ball 24 8
step bench_reduced_30 "$TSX" task/kernel/bench.ts reduced 30 6
step bench_sea "$TSX" task/kernel/bench.ts sea 3
step bench_holes_3 "$TSX" task/kernel/bench.ts holes 3 3
step bench_ball_40 "$TSX" task/kernel/bench.ts ball 40 4
step bench_sorted_4 env BENCH_THREADS="$CORES" "$TSX" task/kernel/bench.ts sorted 4 2

echo "== $(date -u +%H:%M:%S) job done"
cat "$LOG/steps.txt"
