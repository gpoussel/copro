// Verifies the program printed by the real solver (stdin) on all N in 1..10000 + validator total.
import fs from "node:fs";
import { run } from "./build.mjs";
const out = fs.readFileSync(0, "utf8").split("\n");
const n = +out[0]; const lines = out.slice(1, 1 + n);
const isPrime = (n) => { if (n < 2) return false; for (let i = 2; i * i <= n; i++) if (n % i === 0) return false; return true; };
let worst = 0;
for (let k = 1; k <= 10000; k++) { const r = run(lines, k); if (r.err || r.out !== (isPrime(k) ? "PRIME" : "NOT PRIME")) { console.log("FAIL", k, r); process.exit(1); } worst = Math.max(worst, r.steps); }
const V = [1,2,3,4,5,7,8,9,11,13,17,19,23,25,29,31,37,41,43,47,49,53,59,61,67,71,73,79,83,89,97,121,129,169,179,187,219,221,235,289,361,377,391,529,797,841,923,961,1003,1363,1369,1627,1681,1763,1829,1849,2209,2339,2393,2689,2729,2809,2963,3271,3481,3499,3599,3721,3739,4201,4399,4447,4489,5041,5183,5329,5429,5569,5609,5963,6241,6421,6427,6889,7369,7559,7789,7829,7921,8167,8190,8191,8219,8387,8867,9283,9409,9613,9623,9991];
console.log("all N ok, worst steps", worst, "validator total", V.reduce((s, v) => s + run(lines, v).steps, 0), "max width", Math.max(...lines.map((l) => l.length)));
