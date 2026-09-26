// Offline level generator: faithful port of the referee (NumberShifting.java)
// including Java's SHA1PRNG + java.util.Random.nextInt/nextBoolean on top of it.
// Usage: node gen.mjs <level> [seedCsv]  -> prints password, map, and reference solution
import { createHash } from "node:crypto";

export const TEST_SEED = "-99,12,87,19,-72,92,-120,9,31,82,55,18,76,63,-110,-34";

class Sha1Prng {
  constructor(seedBytes) {
    this.state = createHash("sha1").update(Buffer.from(seedBytes)).digest();
    this.remainder = Buffer.alloc(20);
    this.remCount = 0;
  }
  updateState(output) {
    const s = this.state;
    let last = 1, zf = false;
    for (let i = 0; i < s.length; i++) {
      const sv = (s[i] << 24) >> 24, ov = (output[i] << 24) >> 24;
      const v = sv + ov + last;
      const t = v & 0xff;
      zf = zf || s[i] !== t;
      s[i] = t;
      last = v >> 8;
    }
    if (!zf) s[0] = (s[0] + 1) & 0xff;
  }
  nextBytes(n) {
    const result = Buffer.alloc(n);
    let index = 0;
    let output = this.remainder;
    let r = this.remCount;
    if (r > 0) {
      const todo = Math.min(n - index, 20 - r);
      for (let i = 0; i < todo; i++) { result[i] = output[r]; output[r++] = 0; }
      this.remCount += todo;
      index += todo;
    }
    while (index < n) {
      output = createHash("sha1").update(this.state).digest();
      this.updateState(output);
      const todo = Math.min(n - index, 20);
      for (let i = 0; i < todo; i++) { result[index++] = output[i]; output[i] = 0; }
      this.remCount += todo;
    }
    this.remainder = output;
    this.remCount %= 20;
    return result;
  }
  next(bits) {
    const nb = (bits + 7) >> 3;
    const b = this.nextBytes(nb);
    let v = 0;
    for (let i = 0; i < nb; i++) v = (v * 256 + b[i]);
    v = Math.floor(v / 2 ** (nb * 8 - bits));
    return v;
  }
  nextInt(bound) {
    let r = this.next(31);
    const m = bound - 1;
    if ((bound & m) === 0) return Number((BigInt(bound) * BigInt(r)) >> 31n);
    for (let u = r; u - (r = u % bound) + m >= 2 ** 31; u = this.next(31));
    return r;
  }
  nextBoolean() { return this.next(1) !== 0; }
}

const toBytes = (csv) => csv.split(",").map((s) => Number(s) & 0xff);

export function passwords(csv = TEST_SEED, count = 1000) {
  const rnd = new Sha1Prng(toBytes(csv));
  const out = [];
  for (let i = 0; i < count; i++) {
    let p = "";
    for (let x = 0; x < 32; x++) p += String.fromCharCode(97 + rnd.nextInt(26));
    out.push(p);
  }
  out[0] = "first_level";
  return out;
}

const dx = [0, 1, 0, -1], dy = [1, 0, -1, 0], dirs = ["D", "R", "U", "L"];

export function createMap(level, csv = TEST_SEED) {
  const seed = toBytes(csv);
  seed[0] ^= level & 0xff;
  seed[1] ^= (level >> 8) & 0xff;
  const rnd = new Sha1Prng(seed);
  let spawns = 3 + (level >> 1);
  if (level > 150) spawns = 3 + level - 75;
  let height = 5, width = Math.floor((height * 16) / 9);
  while (width * height < spawns * 2) { spawns -= 2; height++; width = Math.floor((height * 16) / 9); }
  const grid = Array.from({ length: width }, () => new Array(height).fill(0));
  const solution = [];
  for (let i = 0; i < spawns; i++) {
    if (i === 0 || rnd.nextInt(5) === 0) {
      for (;;) {
        const x1 = rnd.nextInt(width), y1 = rnd.nextInt(height), dir = rnd.nextInt(4), length = 1 + rnd.nextInt(width);
        const x2 = x1 - length * dx[dir], y2 = y1 - length * dy[dir];
        if (x2 >= 0 && x2 < width && y2 >= 0 && y2 < height && grid[x1][y1] === 0 && grid[x2][y2] === 0) {
          grid[x1][y1] = length; grid[x2][y2] = length;
          solution.push(`${x2} ${y2} ${dirs[dir]} -`);
          break;
        }
      }
    } else {
      for (;;) {
        const x1 = rnd.nextInt(width), y1 = rnd.nextInt(height), dir = rnd.nextInt(4), length = 1 + rnd.nextInt(width);
        const x2 = x1 - length * dx[dir], y2 = y1 - length * dy[dir];
        let add = rnd.nextBoolean();
        if (x2 >= 0 && x2 < width && y2 >= 0 && y2 < height && grid[x1][y1] !== 0 && grid[x1][y1] !== length && grid[x2][y2] === 0) {
          grid[x2][y2] = length;
          if (add) grid[x1][y1] -= length; else grid[x1][y1] += length;
          if (grid[x1][y1] < 0) { grid[x1][y1] = -grid[x1][y1]; add = !add; }
          solution.push(`${x2} ${y2} ${dirs[dir]} ${add ? "+" : "-"}`);
          break;
        }
      }
    }
  }
  const lines = [`${width} ${height}`];
  for (let y = 0; y < height; y++) lines.push(grid.map((c) => c[y]).join(" "));
  return { width, height, lines, solution: solution.reverse() };
}

if ((process.argv[1] ?? "").endsWith("gen.mjs")) {
  const level = Number(process.argv[2] ?? 0);
  const csv = process.argv[3] ?? TEST_SEED;
  console.log(passwords(csv, level + 2).slice(level, level + 2).join("  next: "));
  const m = createMap(level, csv);
  console.log(m.lines.join("\n"));
  console.log(m.solution.join("\n"));
}
