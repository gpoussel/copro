// Offline bench: run the GA bot over the 5 visible cases end to end.
//   pnpm exec node src/contests/cg/opti/mars-lander-tools/bench.mjs [--ms=80] [--seed=N] [--case=K]
// Prints per-case status + remaining fuel + turns, then the TOTAL fuel
// (= the CodinGame score if all 5 land).
import { readFileSync } from "node:fs";
import { makeTerrain, runEpisode, roundState } from "./sim.mjs";
import { createBot } from "./bot.mjs";

const args = Object.fromEntries(
  process.argv.slice(2).filter((a) => a.startsWith("--")).map((a) => {
    const [k, v] = a.slice(2).split("=");
    return [k, v === undefined ? true : Number(v)];
  }),
);
const cases = JSON.parse(readFileSync(new URL("./cases.json", import.meta.url), "utf8"));
const ms = args.ms ?? 80;
const seed = args.seed ?? 0x5eed;
const only = args.case;
const overrides = {};
if (args.pop !== undefined) overrides.POP = args.pop;
if (args.elite !== undefined) overrides.ELITE = args.elite;
if (args.mut !== undefined) overrides.MUT = args.mut;
if (args.bmut !== undefined) overrides.BLOCK_MUT = args.bmut;
if (args.h !== undefined) overrides.H = args.h;
if (args.maxvx !== undefined) overrides.MAX_VX = args.maxvx;
if (args.maxvy !== undefined) overrides.MAX_VY = args.maxvy;
if (args.aim !== undefined) overrides.AIM = args.aim;

let total = 0;
let allLanded = true;
for (let i = 0; i < cases.length; i++) {
  if (only !== undefined && i + 1 !== only) continue;
  const c = cases[i];
  const terrain = makeTerrain(c.surface);
  const bot = createBot(c.surface, { seed: seed + i, ...overrides });
  const t0 = Date.now();
  const res = runEpisode(c, terrain, (rounded) => bot.onTurn(rounded, ms));
  const fuel = res.status === "landed" ? Math.round(res.state.fuel) : 0;
  total += fuel;
  if (res.status !== "landed") allLanded = false;
  console.log(
    `${c.name.padEnd(34)} ${res.status.padEnd(8)} fuel=${String(fuel).padStart(4)} turns=${String(res.turns).padStart(3)}` +
      ` end=(${Math.round(res.state.x)},${Math.round(res.state.y)}) v=(${Math.round(res.state.vx)},${Math.round(res.state.vy)}) ang=${res.state.angle} wall=${Date.now() - t0}ms`,
  );
}
console.log(`TOTAL fuel = ${total}${allLanded ? "" : "  (NOT ALL LANDED)"}`);
