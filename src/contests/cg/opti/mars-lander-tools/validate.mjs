// Calibration check: replay a fixed command script on test 1 and compare the
// simulator's rounded states against the trajectory captured from the REAL
// CodinGame referee (via run_puzzle_tests with a stderr-echo probe).
// Script flown by the probe: 5x "-30 4", 5x "45 2", then "0 4" forever.
import { readFileSync } from "node:fs";
import { makeTerrain, initialState, step, roundState } from "./sim.mjs";

const cases = JSON.parse(new URL("./cases.json", import.meta.url).pathname
  ? readFileSync(new URL("./cases.json", import.meta.url), "utf8")
  : "[]");
const c = cases[0];
makeTerrain(c.surface); // just exercise it

// turn -> "X Y vx vy fuel angle power" as reported by the real referee
const expected = {
  1: "2500 2699 0 -3 549 -15 1",
  2: "2501 2695 1 -5 547 -30 2",
  3: "2503 2690 3 -6 544 -30 3",
  4: "2507 2684 5 -6 540 -30 4",
  5: "2512 2677 7 -6 536 -30 4",
  6: "2520 2671 8 -7 533 -15 3",
  7: "2527 2663 8 -9 531 0 2",
  8: "2534 2653 7 -11 529 15 2",
  9: "2541 2641 6 -13 527 30 2",
  10: "2546 2628 5 -15 525 45 2",
  11: "2550 2612 3 -16 522 30 3",
  12: "2553 2596 2 -16 518 15 4",
  13: "2555 2580 2 -16 514 0 4",
  20: "2569 2478 2 -14 486 0 4",
  50: "2631 2202 2 -5 366 0 4",
  100: "2735 2319 2 10 166 0 4",
  141: "2819 2954 2 21 2 0 4",
};

let s = initialState(c);
let failures = 0;
for (let t = 0; t < 141; t++) {
  const cmd = t < 5 ? [-30, 4] : t < 10 ? [45, 2] : [0, 4];
  s = step(s, cmd[0], cmd[1]);
  const key = t + 1;
  if (expected[key]) {
    const r = roundState(s);
    const got = `${r.x} ${r.y} ${r.vx} ${r.vy} ${r.fuel} ${r.angle} ${r.power}`;
    const ok = got === expected[key];
    if (!ok) failures++;
    console.log(`T${key}: ${ok ? "OK " : "MISMATCH"} got=${got} want=${expected[key]}`);
  }
}
console.log(failures === 0 ? "CALIBRATION OK" : `${failures} MISMATCHES`);
process.exit(failures === 0 ? 0 : 1);
