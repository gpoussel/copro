const valueToReach = parseInt(readline())
const N = parseInt(readline())
const counts = readline().split(" ").map(Number)
const values = readline().split(" ").map(Number)

type Coin = { count: number; value: number }
const coins: Coin[] = []
for (let i = 0; i < N; i++) {
  coins.push({ count: counts[i], value: values[i] })
}

coins.sort((a, b) => a.value - b.value)

let sum = 0
let grabbed = 0
for (const coin of coins) {
  if (sum >= valueToReach) break
  for (let k = 0; k < coin.count; k++) {
    sum += coin.value
    grabbed++
    if (sum >= valueToReach) break
  }
}

if (sum >= valueToReach) {
  console.log(grabbed)
} else {
  console.log(-1)
}
