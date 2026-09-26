// Writes ../cgfunge-prime.ts from out/best.json (lines escaped to pure ASCII source).
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
const here = path.dirname(fileURLToPath(import.meta.url));
const best = JSON.parse(fs.readFileSync(path.join(here, "out/best.json"), "utf8"));
// Pure printable ASCII source: every char outside [32,126] and the chars " \\ ` are written as
// "\`" + 4 hex digits and decoded at runtime (the MCP/judge path mangles \\u escapes and non-ASCII).
const esc = (l) => '"' + [...l].map((c) => { const k = c.charCodeAt(0); return k >= 32 && k < 127 && c !== '"' && c !== "\\" && c !== "`" ? c : "`" + k.toString(16).padStart(4, "0"); }).join("") + '"';
const header = fs.readFileSync(path.join(here, "header.txt"), "utf8");
const src = `${header}
// Grid rows; "\`hhhh" = char with that hex code (quotes, control chars, unicode numbers).
const FUNGE_ROWS: string[] = [
${best.lines.map((l) => "  " + esc(l) + ",").join("\n")}
];

console.log(FUNGE_ROWS.length);
for (const row of FUNGE_ROWS) console.log(row.replace(/\`([0-9a-f]{4})/g, (_m: string, h: string) => String.fromCharCode(parseInt(h, 16))));
`;
fs.writeFileSync(path.join(here, "../cgfunge-prime.ts"), src);
console.log("written, score", best.tot);
