// 🎮 CodinGame Puzzle - tiling-by-squares
// https://www.codingame.com/training/expert/tiling-by-squares

// Guillotine DP (best[a][b] = min over straight cuts of the two halves) is
// optimal for most rectangles. The few sizes below 50 where a non-guillotine
// tiling does better (e.g. 13x11 -> 6 instead of 8) cannot be proven optimal by
// a search in time, so they are listed explicitly (values from OEIS A219158).
const EXCEPTIONS = [
  "13x11:6 17x16:8 19x16:7 19x17:9 19x18:7 20x17:7 21x19:7 24x11:7 24x13:7 25x23:8 26x22:6 27x23:8",
  "27x25:10 28x27:8 29x25:10 29x27:8 31x23:8 31x25:8 31x26:8 31x27:10 31x28:8 31x29:8 31x30:8 32x27:8",
  "32x29:8 32x31:9 33x16:9 33x17:9 33x26:8 33x28:8 34x25:8 34x32:8 35x11:8 35x16:8 35x19:8 35x24:8",
  "35x26:8 35x31:8 35x34:8 36x19:10 36x31:10 37x13:8 37x17:8 37x18:8 37x19:8 37x20:8 37x22:8 37x24:8",
  "37x29:8 37x32:8 37x35:9 37x36:9 38x32:7 38x34:9 38x36:7 39x33:6 40x19:8 40x21:8 40x29:8 40x34:7",
  "40x37:9 41x32:9 41x37:9 42x38:7 43x24:9 43x34:9 43x37:9 43x39:9 43x40:9 43x41:9 44x37:9 44x41:9",
  "44x43:9 45x37:9 45x41:10 45x43:9 46x11:9 46x37:9 46x39:9 46x41:9 46x43:9 46x45:9 47x35:9 47x36:9",
  "47x37:9 47x40:9 47x41:9 47x43:11 47x44:9 47x45:9 47x46:9 48x22:7 48x23:9 48x25:9 48x26:7 48x41:9",
  "48x43:9 49x16:10 49x36:9 49x37:9 49x39:9 49x41:9 49x43:10 49x45:9 49x46:9 49x47:9 49x48:9",
]
  .join(" ")
  .split(" ")

const [w, h] = readline().split(" ").map(Number)
const big = Math.max(w, h)
const small = Math.min(w, h)
const known = EXCEPTIONS.find(e => e.startsWith(`${big}x${small}:`))
if (known) {
  console.log(known.split(":")[1])
} else {
  const best: number[][] = []
  for (let a = 1; a <= w; a++) {
    best[a] = []
    for (let b = 1; b <= h; b++) {
      if (a === b) {
        best[a][b] = 1
        continue
      }
      let m = a * b
      for (let x = 1; x < a; x++) m = Math.min(m, best[x][b] + best[a - x][b])
      for (let y = 1; y < b; y++) m = Math.min(m, best[a][y] + best[a][b - y])
      best[a][b] = m
    }
  }
  console.log(best[w][h])
}
