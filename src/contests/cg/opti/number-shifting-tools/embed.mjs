// Rewrites the PLANS table in ../number-shifting.ts from out/plans.json
// (produced by `NS_DUMP=out/plans.json NS_BUDGET=15000 node sim.mjs 0`).
// Key = nsHash(map text) (same function as in the solver), value = moves
// "x,y,dir,op" packed as "xyD+" tokens joined by spaces (coords < 10 here).
import { readFileSync, writeFileSync } from "node:fs";
const MIN_LEVEL = Number(process.argv[2] ?? 15);
const plans = JSON.parse(readFileSync(new URL("./out/plans.json", import.meta.url)));
function nsHash(s) {
  let h = 2166136261;
  for (let i = 0; i < s.length; i++) h = Math.imul(h ^ s.charCodeAt(i), 16777619);
  return (h >>> 0).toString(36);
}
const lines = [];
for (const [lvl, { map, moves }] of Object.entries(plans)) {
  if (+lvl < MIN_LEVEL) continue;
  if (moves.some((m) => m.split(" ").slice(0, 2).some((v) => v.length > 1))) continue;
  lines.push(`  "${nsHash(map)}": "${moves.map((m) => m.replace(/ /g, "")).join(" ")}", // level ${lvl}`);
}
const file = new URL("../number-shifting.ts", import.meta.url);
const src = readFileSync(file, "utf8");
const out = src.replace(/(\/\/ PLANS-BEGIN\n)[\s\S]*?(\/\/ PLANS-END)/, `$1const PLANS: Record<string, string> = {\n${lines.join("\n")}\n};\n$2`);
writeFileSync(file, out);
console.log(`embedded ${lines.length} plans`);
