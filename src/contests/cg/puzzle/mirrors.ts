// 🎮 CodinGame Puzzle - mirrors
// https://www.codingame.com/

readline()
const r: number[] = readline()
  .split(" ")
  .map((x: string) => parseFloat(x))

let reflected: number = 0
for (let i = r.length - 1; i >= 0; i--) {
  const ri: number = r[i]
  const denom: number = 1 - ri * reflected
  reflected = ri + (denom === 0 ? 0 : ((1 - ri) * (1 - ri) * reflected) / denom)
}

console.log(reflected.toFixed(4))
