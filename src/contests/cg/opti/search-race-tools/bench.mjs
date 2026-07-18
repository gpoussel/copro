// Offline bench: full episodes over the visible test cases.
// Usage: pnpm exec node src/contests/cg/opti/search-race-tools/bench.mjs
//        [--gens=60] [--ms=0] [--pop=24] [--h=15] [--elite=6] [--mut=0.12]
//        [--seed=1] [--case=test9] (label substring filter)
import { readFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { dirname, join } from 'node:path';
import { parseCheckpoints, makeGame, stepGame, gameScore } from './engine.mjs';
import { DEFAULTS, search, makeRng, STATS } from './bot.mjs';

const here = dirname(fileURLToPath(import.meta.url));
const cases = JSON.parse(readFileSync(join(here, 'cases.json'), 'utf8'));

const args = Object.fromEntries(
  process.argv.slice(2).map((a) => {
    const m = a.match(/^--([^=]+)(?:=(.*))?$/);
    return m ? [m[1], m[2] ?? '1'] : [a, '1'];
  }),
);
const P = { ...DEFAULTS };
if (args.gens) P.GENS = +args.gens;
if (args.ms) P.TIME_MS = +args.ms;
if (args.pop) P.POP = +args.pop;
if (args.h) P.H = +args.h;
if (args.elite) P.ELITE = +args.elite;
if (args.mut) P.MUT = +args.mut;
if (args.velw) P.VEL_W = +args.velw;
const seed = args.seed ? +args.seed : 1;
const filter = args.case ?? '';

let total = 0;
let fails = 0;
let turnsAll = 0;
let gensAll = 0;
const wall0 = Date.now();
for (const c of cases) {
  if (filter && !c.label.includes(filter)) continue;
  const game = makeGame(parseCheckpoints(c.checkpoints));
  const rng = makeRng(seed);
  let prev = null;
  let turns = 0;
  let gens = 0;
  while (!game.st.done && game.timer < 600) {
    const best = search(game, P, rng, prev);
    stepGame(game, best.rots[0], best.thrs[0]);
    prev = best;
    turns++;
    gens += STATS.lastGens;
  }
  const score = gameScore(game);
  if (!game.st.done) fails++;
  total += score;
  turnsAll += turns;
  gensAll += gens;
  console.log(`${c.label.padEnd(16)} ${String(score).padStart(8)}  (${turns} turns, ${(gens / Math.max(1, turns)).toFixed(0)} gens/turn)`);
}
const wall = Date.now() - wall0;
console.log(`TOTAL ${total.toFixed(2)}  fails=${fails}  ${(wall / Math.max(1, turnsAll)).toFixed(1)}ms/turn  ${(gensAll / Math.max(1, turnsAll)).toFixed(0)} gens/turn`);
