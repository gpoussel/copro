// Dump the bot's full command sequence for one case (offline), plus the
// predicted touchdown state. Used to build fixed-script probes against the
// real referee (e.g. to test how strict the landing speed limits are).
//   pnpm exec node .../dump.mjs --case=1 [--ms=80] [--seed=N] [--maxvy=39.9] ...
import { readFileSync } from "node:fs";
import { makeTerrain, runEpisode } from "./sim.mjs";
import { createBot } from "./bot.mjs";

const args = Object.fromEntries(
  process.argv.slice(2).filter((a) => a.startsWith("--")).map((a) => {
    const [k, v] = a.slice(2).split("=");
    return [k, v === undefined ? true : Number(v)];
  }),
);
const cases = JSON.parse(readFileSync(new URL("./cases.json", import.meta.url), "utf8"));
const c = cases[(args.case ?? 1) - 1];
const overrides = {};
if (args.pop !== undefined) overrides.POP = args.pop;
if (args.mut !== undefined) overrides.MUT = args.mut;
if (args.bmut !== undefined) overrides.BLOCK_MUT = args.bmut;
if (args.h !== undefined) overrides.H = args.h;
if (args.maxvx !== undefined) overrides.MAX_VX = args.maxvx;
if (args.maxvy !== undefined) overrides.MAX_VY = args.maxvy;

const terrain = makeTerrain(c.surface);
const bot = createBot(c.surface, { seed: args.seed ?? 0x5eed, ...overrides });
const cmds = [];
const res = runEpisode(c, terrain, (rounded) => {
  const cmd = bot.onTurn(rounded, args.ms ?? 80);
  cmds.push(cmd);
  return cmd;
});
console.log(JSON.stringify(cmds));
console.log(
  `status=${res.status} fuel=${res.state.fuel} turns=${res.turns} ` +
    `touchdown v=(${res.state.vx.toFixed(3)},${res.state.vy.toFixed(3)}) angle=${res.state.angle} x=${res.hit ? res.hit.x.toFixed(1) : "?"}`,
);
