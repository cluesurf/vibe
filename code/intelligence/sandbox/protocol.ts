/**
 * The wire between the evaluator and an isolated candidate: one shared
 * buffer, a flag that says whose turn it is, and plain numbers and text.
 * No object ever crosses it, so a candidate holds nothing of the
 * evaluator's realm, and every message is data the evaluator checks.
 *
 * Layout: int32 slots at the start (flag, kind, three integers, a text
 * length), one float64 at byte 64, and UTF-16 text from byte 128.
 *
 * Shared by the parent channel, the worker host and the in-context bridge;
 * it imports nothing.
 */

export const SLOT_FLAG = 0
export const SLOT_KIND = 1
export const SLOT_A = 2
export const SLOT_B = 3
export const SLOT_C = 4
export const SLOT_LENGTH = 5
/** answers the bridge has sent, counted by the worker alone (the host reads it to know a task was answered) */
export const SLOT_ANSWERS = 6
export const INT_SLOTS = 16
export const NUMBER_OFFSET = 64
export const TEXT_OFFSET = 128

/** text capacity in UTF-16 code units (64 MiB of buffer) */
export const TEXT_CAPACITY = 32 * 1024 * 1024

export const BUFFER_BYTES = TEXT_OFFSET + 2 * TEXT_CAPACITY

/** nobody's turn (start) */
export const FLAG_IDLE = 0
/** a message waits for the worker */
export const FLAG_TO_WORKER = 1
/** a message waits for the parent */
export const FLAG_TO_PARENT = 2

// parent to worker
export const W_OPEN = 1
export const W_TASK = 2
export const W_CLOSE = 3
export const W_REPLY = 4
export const W_FAIL = 5

// worker to parent
export const R_READY = 20
export const R_DONE = 21
export const R_ERROR = 22
export const R_APPLICABLE = 30
export const R_COST = 31
export const R_APPLY = 32
export const R_GOAL = 33
export const R_DISTANCE = 34
export const R_ESTIMATE = 35
export const R_TABLE_GET = 36
export const R_TABLE_HAS = 37
export const R_TABLE_SIZE = 38
export const R_LINKS = 39
/**
 * run a pair-rule layout on the brick line, once per word, on the layout's background tone (0, +1 or -1; 0 when left
 * out): the evaluator executes and meters every round
 */
export const R_MESH_RUNS = 40

/** spins before a waiting side sleeps on the flag: a round trip stays under a microsecond while both sides are busy */
export const SPINS = 20_000
