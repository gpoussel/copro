// End-to-end run of the REAL shipped solver (../search-race.ts) against the
// local engine acting as referee: readline() is shimmed to stream the game and
// console.log is intercepted to apply the EXPERT actions.
// Usage: pnpm exec tsx src/contests/cg/opti/search-race-tools/runner.mjs [case-label]
import { readFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { dirname, join } from 'node:path';
import { parseCheckpoints, makeGame, stepGame, gameScore } from './engine.mjs';

const here = dirname(fileURLToPath(import.meta.url));
const cases = JSON.parse(readFileSync(join(here, 'cases.json'), 'utf8'));
const label = process.argv[2] ?? 'test1';
const c = cases.find((x) => x.label === label);
if (!c) throw new Error(`unknown case ${label}`);

const game = makeGame(parseCheckpoints(c.checkpoints));
const init = [String(game.total)];
for (let i = 0; i < game.total; i++) init.push(`${game.cx[i]} ${game.cy[i]}`);

globalThis.readline = () => {
  if (init.length) return init.shift();
  if (game.st.done || game.timer >= 600) return null;
  const st = game.st;
  return `${st.idx} ${st.x} ${st.y} ${st.vx} ${st.vy} ${st.ang}`;
};
const origLog = console.log;
console.log = (msg) => {
  const m = String(msg).split(' ');
  if (m[0] !== 'EXPERT') throw new Error(`unexpected output: ${msg}`);
  stepGame(game, parseInt(m[1], 10), parseInt(m[2], 10));
};

const t0 = Date.now();
await import('../search-race.ts');
console.log = origLog;
console.log(`${label}: score ${gameScore(game)} (${game.timer} turns, ${((Date.now() - t0) / Math.max(1, game.timer)).toFixed(1)}ms/turn incl. search)`);
