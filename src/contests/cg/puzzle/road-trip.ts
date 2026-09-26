// 🎮 CodinGame Puzzle - road-trip
// https://www.codingame.com/training/medium/road-trip

const [friendCount, baseCost, personCost] = readline().split(" ").map(Number)
const friends: { budget: number; joy: number }[] = []
for (let i = 0; i < friendCount; i++) {
  const [budget, joy] = readline().split(" ").map(Number)
  friends.push({ budget, joy })
}
// Best joy first, so the top k eligible friends give the best happiness for a group of k
friends.sort((a, b) => b.joy - a.joy)

let bestHappiness = 0
for (let k = 1; k <= friendCount; k++) {
  const travelers = k + 1
  // Each traveler pays (C + P * travelers) / travelers; compare without division
  let taken = 0
  let happiness = 0
  for (const f of friends) {
    if (f.budget * travelers < baseCost + personCost * travelers) continue
    happiness += f.joy
    if (++taken === k) break
  }
  if (taken === k) bestHappiness = Math.max(bestHappiness, happiness)
}
console.log(bestHappiness)
