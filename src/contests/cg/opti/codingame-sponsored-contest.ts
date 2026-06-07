// 🎮 CodinGame Optimization - CodinGame Sponsored Contest
// https://www.codingame.com/training/optim/codingame-sponsored-contest
//
// WHAT THIS GAME ACTUALLY IS
// --------------------------
// The statement deliberately hides everything ("we won't even tell you what the
// inputs mean — figure it out to get the best score"). Decoding a test case
// proves it: the replay payload is base64+zlib, TWICE. The inner text is a
// classic PAC-MAN maze:
//   `P` = you, `1..4` = ghosts (with release timers 1,0 / 2,0 / 3,30 / 4,90),
//   `#` = walls, `.` = pellets, corners labelled A/B/C/D.
// (Decode: inflate(base64(testIn)) -> a base64 string -> inflate again -> maze.)
//
// THE CRUEL PART: your program never receives the maze. Per the stub it only
// gets LOCAL information each turn. So this is blind/local Pac-Man.
//
// I/O CONTRACT (from the stub — this part is certain)
// ---------------------------------------------------
//   Init: 3 integers, one per line.        (3rd = how many int-pairs per turn)
//   Each turn:
//     4 lines, each a single character.     (the 4 cells around Pac-Man)
//     <3rd-init> lines, each "x y".         (the ghosts)
//     -> output one line: A, B, C, D or E.
//
// ============================ ASSUMPTIONS ============================
// These are INFERRED and need one live run to confirm. Each is a single
// constant so it is trivial to flip once we see real stdin. If the bot
// walks into walls or loops, fix these first.
//
//   A1. The 4 neighbour chars are given in the SAME order as the actions, i.e.
//       cell[i] is what lies in the direction reached by ACTIONS[i].
//       => we never need to know the physical compass mapping, only that the
//          ordering is consistent.
//   A2. Opposite directions are index pairs {0,2} and {1,3} (true for any
//       order like up/right/down/left). Used only to discourage U-turns.
//   A3. '#' is a wall (impassable). '.' is a pellet (worth chasing). Anything
//       else is walkable empty floor.
//   A4. 'E' means "stay / no move"; used only as a last resort when boxed in.
//   A5. The per-turn pairs are ghost coordinates. We READ them (to keep stdin
//       in sync — this is mandatory) but v1 does not use them: without our own
//       position they are not actionable yet. v2 adds ghost avoidance once we
//       know whether they are absolute or relative.
// ====================================================================
//
// STRATEGY (v1): greedy local pellet-muncher.
//   - never step into a wall;
//   - strongly prefer a neighbouring pellet;
//   - mildly discourage immediate U-turns (anti-oscillation);
//   - rotating tie-break so we don't get stuck ping-ponging in a corridor.

// ---- tunables / assumptions (flip after the first real run) ----------------
const ACTIONS = ["A", "B", "C", "D"] as const // A1: cell[i] -> ACTIONS[i]
const WALL = "#" // A3
const PELLET = "." // A3
const STAY = "E" // A4
const PELLET_BONUS = 10
const FLOOR_BONUS = 0
const UTURN_PENALTY = 3 // < PELLET_BONUS so a pellet behind us still wins
// ---------------------------------------------------------------------------

// ===== DIAGNOSTIC MODE =====
// Echo the first reads verbatim to STDERR so we can see the real stdin format
// on CodinGame (the "Debug / Sortie d'erreurs" column). Remove once calibrated.
let logCount = 0
const LOG_LINES = 40
function rl(): string {
  const s = readline()
  if (logCount < LOG_LINES) {
    console.error(`[in ${logCount}] ${JSON.stringify(s)}`)
    logCount++
  }
  return s
}

// Init: 3 integers. The third is the number of ghost pairs streamed each turn.
parseInt(rl()) // init1 (maze width? unused in v1)
parseInt(rl()) // init2 (maze height? unused in v1)
const ghostCount = parseInt(rl()) // = pairs per turn

let prev = -1 // last chosen direction index, -1 = none
let tick = 0

for (;;) {
  const first = rl()
  if (first === undefined || first === null) break

  // The 4 cells around Pac-Man, one char per line, in action order.
  const cells = [first, rl(), rl(), rl()]

  // Consume the ghost pairs every turn (mandatory to stay in sync). A5.
  const ghosts: [number, number][] = []
  for (let i = 0; i < ghostCount; i++) {
    const parts = rl().trim().split(/[\s,]+/).map(Number)
    ghosts.push([parts[0], parts[1]])
  }

  // Score each of the 4 directions; pick the best non-wall one.
  let best = -1
  let bestScore = -Infinity
  for (let i = 0; i < 4; i++) {
    const ch = cells[i]
    if (ch === WALL) continue
    let score = ch === PELLET ? PELLET_BONUS : FLOOR_BONUS
    if (prev !== -1 && i === (prev + 2) % 4) score -= UTURN_PENALTY // A2
    score += ((i + tick) % 4) * 0.1 // rotating tie-break
    if (score > bestScore) {
      bestScore = score
      best = i
    }
  }

  if (best === -1) {
    console.log(STAY) // fully boxed in (shouldn't happen in a real maze)
  } else {
    console.log(ACTIONS[best])
    prev = best
  }
  tick++
}
