// 🎮 CodinGame Puzzle - euclids-algorithm
// https://www.codingame.com/training/easy/euclids-algorithm

const [a, b] = readline().split(" ").map(Number)

let x = a
let y = b

while (y !== 0) {
  const q = Math.floor(x / y)
  const r = x % y
  console.log(`${x}=${y}*${q}+${r}`)
  x = y
  y = r
}

console.log(`GCD(${a},${b})=${x}`)
