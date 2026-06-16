// 🎮 CodinGame Puzzle - number-of-digits
// https://www.codingame.com/training/easy/number-of-digits

const n: number = parseInt(readline(), 10)
const k: number = parseInt(readline(), 10)

let count: number = 0
for (let place: number = 1; place <= n; place *= 10) {
  const higher: number = Math.floor(n / (place * 10))
  const current: number = Math.floor(n / place) % 10
  const lower: number = n % place

  count += higher * place
  if (current > k) {
    count += place
  } else if (current === k) {
    count += lower + 1
  }
}

console.log(count)
