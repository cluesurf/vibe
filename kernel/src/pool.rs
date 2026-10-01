// THE NATIVE THREAD POOL. kernel/src/
// Persistent std::thread workers that wait on a condition variable. A call splits `rows` into `parts` contiguous ranges,
// row k * rows / parts to (k + 1) * rows / parts: the calling thread computes range 0, worker k range k, and the call
// returns when every range is done. The split is fixed by (rows, parts) alone and every primitive writes only its own
// rows, so the bytes never depend on the thread count, on the split, or on which thread ran which range.
//
// The job is a borrowed closure handed to threads that outlive it: run() erases its lifetime and does not return until
// every worker has finished with it, which is what makes that sound.

use std::sync::atomic::{AtomicUsize, Ordering};
use std::sync::{Condvar, Mutex, OnceLock};

pub const MAX_THREADS: usize = 64;

type Job = dyn Fn(usize, usize) + Sync;

#[derive(Clone, Copy)]
struct JobPtr(*const Job);

unsafe impl Send for JobPtr {}

struct State {
    generation: u64,
    started: usize,
    parts: usize,
    rows: usize,
    remaining: usize,
    job: Option<JobPtr>,
}

struct Pool {
    state: Mutex<State>,
    go: Condvar,
    done: Condvar,
}

static POOL: OnceLock<Pool> = OnceLock::new();
static WANT: AtomicUsize = AtomicUsize::new(1);

fn pool() -> &'static Pool {
    POOL.get_or_init(|| Pool {
        state: Mutex::new(State {
            generation: 0,
            started: 0,
            parts: 1,
            rows: 0,
            remaining: 0,
            job: None,
        }),
        go: Condvar::new(),
        done: Condvar::new(),
    })
}

pub fn set_threads(n: usize) {
    WANT.store(n.clamp(1, MAX_THREADS), Ordering::SeqCst);
}

pub fn threads() -> usize {
    WANT.load(Ordering::SeqCst)
}

fn range(rows: usize, parts: usize, k: usize) -> (usize, usize) {
    (k * rows / parts, (k + 1) * rows / parts)
}

fn worker(id: usize, born: u64) {
    let p = pool();
    let mut seen = born;
    let mut st = p.state.lock().unwrap();

    loop {
        while st.generation == seen {
            st = p.go.wait(st).unwrap();
        }

        seen = st.generation;

        if id < st.parts {
            let job = st.job.unwrap();
            let (parts, rows) = (st.parts, st.rows);

            drop(st);

            let (s, e) = range(rows, parts, id);

            // SAFETY: run() keeps the closure alive until `remaining` reaches 0
            unsafe { (*job.0)(s, e) };
            st = p.state.lock().unwrap();
            st.remaining -= 1;

            if st.remaining == 0 {
                p.done.notify_one();
            }
        }
    }
}

// run job(start, end) over [0, rows), at least `grain` rows a part
pub fn run<'a>(rows: usize, grain: usize, job: &'a (dyn Fn(usize, usize) + Sync + 'a)) {
    let most = if grain > 0 { rows.div_ceil(grain) } else { rows };
    let parts = threads().min(most).max(1);

    if parts <= 1 {
        job(0, rows);
        return;
    }

    let p = pool();
    let mut st = p.state.lock().unwrap();

    while st.started + 1 < parts {
        let id = st.started + 1;
        let born = st.generation;

        std::thread::Builder::new()
            .name(format!("vibe-kernel-{id}"))
            .stack_size(8 << 20)
            .spawn(move || worker(id, born))
            .expect("vibe kernel: could not start a thread");
        st.started += 1;
    }

    // SAFETY: the pointer outlives every use, since this function waits for remaining == 0 before returning
    let erased: *const Job = unsafe {
        std::mem::transmute::<&'a (dyn Fn(usize, usize) + Sync + 'a), &'static Job>(job)
    };

    st.job = Some(JobPtr(erased));
    st.parts = parts;
    st.rows = rows;
    st.remaining = parts - 1;
    st.generation += 1;
    p.go.notify_all();
    drop(st);

    let (s, e) = range(rows, parts, 0);

    job(s, e);

    let mut st = p.state.lock().unwrap();

    while st.remaining > 0 {
        st = p.done.wait(st).unwrap();
    }

    st.job = None;
}
