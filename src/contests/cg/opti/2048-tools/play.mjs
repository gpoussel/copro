// Local driver for the CodinGame 2048 puzzle.
//
// Usage (run with tsx so the .ts bot can be imported):
//   pnpm exec tsx src/contests/cg/opti/2048-tools/play.mjs sim <seed> [moves]
//   pnpm exec tsx src/contests/cg/opti/2048-tools/play.mjs bot <seed> [--fast]
//   pnpm exec tsx src/contests/cg/opti/2048-tools/play.mjs bench [--fast] [seeds...]
//
// `sim`  : pure engine replay. Prints the initial board, then the board after
//          each single move of [moves] (e.g. ULDRUU). Use this to type the same
//          seed + moves on the website and confirm our spawns/score match.
// `bot`  : runs the bot against the engine to the end, reporting the final score
//          and — crucially — checking that the bot's own prediction matches the
//          engine on every turn (a mismatch means our simulation desynced).
// `bench`: runs `bot` over a set of seeds (defaults to the 30 visible test seeds).

import * as engine from "./engine.mjs";
import { chooseBatch, valuesToExp, W } from "../2048.ts";

const VISIBLE_SEEDS = [
  290797, 10682358, 38333962, 47049887, 11205586, 15242016, 32019767, 46946765,
  4424780, 2524322, 20797492, 28944706, 20969426, 20950077, 8601721, 44677966,
  534357, 970088, 8078305, 5731756, 45283038, 17769313, 41900735, 32506342,
  28758123, 25880068, 41359522, 704563, 29082488, 18470229,
];

const FIRST_TURN_MS = 950;
const TURN_MS = 45;

function maxTile(grid) {
  let m = 0;
  for (const v of grid) if (v > m) m = v;
  return m;
}

function printState(label, state) {
  console.log(`--- ${label} | seed=${state.seed} score=${state.score} ---`);
  for (const line of engine.gridLines(state.grid)) console.log(line);
}

function runSim(seed, moves) {
  const state = engine.newGame(seed);
  printState("initial (turn 1 input)", state);
  if (!moves) return;
  const chars = moves.toUpperCase().replace(/[^URDL]/g, "").split("");
  for (let i = 0; i < chars.length; i++) {
    const c = chars[i];
    const dir = engine.DIRS.indexOf(c);
    if (!engine.canMove(state.grid, dir)) {
      console.log(`move #${i + 1} '${c}': ILLEGAL (engine would ignore the rest)`);
      break;
    }
    const sc = engine.applyMove(state.grid, dir);
    state.score += sc;
    state.seed = engine.spawnTile(state.grid, state.seed);
    printState(`after move #${i + 1} '${c}' (+${sc})`, state);
  }
}

function runBot(seed, cfg) {
  const state = engine.newGame(seed);
  let turns = 0;
  let totalMoves = 0;
  let desync = null;
  const t0 = Date.now();
  let endReason = "stuck";
  while (turns < 600) {
    if (!engine.canMoveAny(state.grid)) {
      endReason = "stuck";
      break;
    }
    const exp = valuesToExp(state.grid);
    const budget = cfg.fast ? 20 : turns === 0 ? FIRST_TURN_MS : TURN_MS;
    const res = chooseBatch(exp, state.seed, budget, cfg.opts);
    const before = state.score;
    const out = engine.playTurn(state, res.moves);
    const gained = state.score - before;
    if (out.stoppedAt !== -1) {
      desync = `illegal move at index ${out.stoppedAt} of "${res.moves}" on turn ${turns + 1}`;
      break;
    }
    if (gained !== res.predictedGain) {
      desync = `score mismatch turn ${turns + 1}: bot predicted +${res.predictedGain}, engine +${gained}`;
      break;
    }
    totalMoves += out.applied;
    turns++;
    if (turns >= 600) endReason = "600-cap";
  }
  const ms = Date.now() - t0;
  return {
    seed,
    score: state.score,
    maxTile: maxTile(state.grid),
    turns,
    totalMoves,
    ms,
    endReason,
    desync,
  };
}

function fmt(r) {
  const base = `seed=${r.seed} score=${r.score} max=${r.maxTile} turns=${r.turns} moves=${r.totalMoves} end=${r.endReason} ${r.ms}ms`;
  return r.desync ? `${base}  DESYNC: ${r.desync}` : base;
}

function parseOpts(flags) {
  const get = (k, d) => {
    const f = flags.find((x) => x.startsWith(`--${k}=`));
    return f ? Number(f.split("=")[1]) : d;
  };
  // Defaults mirror the shipped DEFAULT_OPTS in 2048.ts so a flag-less bench
  // measures exactly what the bot plays on CodinGame.
  return {
    beamWidth: get("bw", 200),
    commitLen: get("clen", 28),
    lookahead: get("look", 60),
    earlyFrac: get("ef", 0.5),
    maxDepth: get("md", 400),
  };
}

const [, , mode, ...rest] = process.argv;
const fast = rest.includes("--fast");
const flags = rest.filter((a) => a.startsWith("--"));
const args = rest.filter((a) => !a.startsWith("--"));
const cfg = { fast, opts: parseOpts(flags) };

// Heuristic weight overrides: --wempty= --wmono= --wsmooth= --wmerge= --wmax= --wcorner=
for (const [k, dst] of [
  ["wempty", "empty"],
  ["wmono", "mono"],
  ["wsmooth", "smooth"],
  ["wmerge", "merge"],
  ["wmax", "max"],
  ["wcorner", "corner"],
]) {
  const f = flags.find((x) => x.startsWith(`--${k}=`));
  if (f) W[dst] = Number(f.split("=")[1]);
}

if (mode === "sim") {
  runSim(parseInt(args[0]), args[1]);
} else if (mode === "bot") {
  console.log(`opts=${JSON.stringify(cfg.opts)} fast=${fast}`);
  console.log(fmt(runBot(parseInt(args[0]), cfg)));
} else if (mode === "bench") {
  const seeds = args.length ? args.map((s) => parseInt(s)) : VISIBLE_SEEDS;
  console.log(`opts=${JSON.stringify(cfg.opts)} fast=${fast}`);
  let total = 0;
  let anyDesync = false;
  for (const s of seeds) {
    const r = runBot(s, cfg);
    console.log(fmt(r));
    total += r.score;
    if (r.desync) anyDesync = true;
  }
  console.log(`---\nmean score = ${Math.round(total / seeds.length)} over ${seeds.length} seeds${anyDesync ? "  (DESYNCS PRESENT)" : "  (no desync)"}`);
} else {
  console.log("usage: play.mjs <sim|bot|bench> [--fast] [--bw= --md= --cf= --cmax=] [seeds...]");
}
