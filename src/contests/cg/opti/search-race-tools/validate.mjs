// Calibration: replay the greedy probe policy through the local engine and diff
// every turn's state against a captured real-referee trajectory (the "IN" lines
// echoed to stderr by the probe run through run_puzzle_tests).
// Usage: pnpm exec node src/contests/cg/opti/search-race-tools/validate.mjs <case-label> <dump-file>
import { readFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { dirname, join } from 'node:path';
import { parseCheckpoints, makeGame, stepGame } from './engine.mjs';

const here = dirname(fileURLToPath(import.meta.url));
const cases = JSON.parse(readFileSync(join(here, 'cases.json'), 'utf8'));
const label = process.argv[2] ?? 'test1';
const dumpFile = process.argv[3] ?? join(here, 'out', `probe-${label}.txt`);

const c = cases.find((x) => x.label === label);
const expected = readFileSync(dumpFile, 'utf8').trim().split('\n');
const game = makeGame(parseCheckpoints(c.checkpoints));

let mismatches = 0;
for (let turn = 0; turn < expected.length; turn++) {
  const st = game.st;
  const mine = `${st.idx} ${st.x} ${st.y} ${st.vx} ${st.vy} ${st.ang}`;
  if (mine !== expected[turn]) {
    mismatches++;
    console.log(`turn ${turn}: MINE ${mine} | REAL ${expected[turn]}`);
    if (mismatches > 10) break;
    // resync from the real line so we see whether errors compound or are isolated
    const [idx, x, y, vx, vy, ang] = expected[turn].split(' ').map(Number);
    Object.assign(st, { idx, x, y, vx, vy, ang });
  }
  // The probe's greedy policy, computed from the (real) input state:
  const [idx, x, y, vx, vy, ang] = expected[turn].split(' ').map(Number);
  const want = (Math.atan2(game.cy[idx] - y, game.cx[idx] - x) * 180) / Math.PI;
  const diff = ((((want - ang) % 360) + 540) % 360) - 180;
  const rot = Math.max(-18, Math.min(18, Math.round(diff)));
  const thrust = Math.abs(diff) > 90 ? 0 : 200;
  stepGame(game, rot, thrust);
}
console.log(mismatches === 0 ? `CALIBRATION OK (${expected.length} turns bit-exact)` : `${mismatches} MISMATCHES`);
