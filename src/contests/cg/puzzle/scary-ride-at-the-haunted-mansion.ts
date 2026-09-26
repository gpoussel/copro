// 🎮 CodinGame Puzzle - scary-ride-at-the-haunted-mansion
// https://www.codingame.com/training/medium/scary-ride-at-the-haunted-mansion

const WAGONS = 10
readline()
const groups = readline()
  .split(/\s+/)
  .filter(g => g.length > 0)

/** Wagons of a group as [right seat, left seat], or null if the group is rejected. */
function seat(group: string): [string, string][] | null {
  const adults = group.split("").filter(c => c === "A").length
  const kids = group.length - adults
  if (kids > adults) return null
  const wagons: [string, string][] = []
  // Kids first, each next to an adult; "x" is always the first seated kid
  const hasMe = group.indexOf("x") >= 0
  for (let i = 0; i < kids; i++) wagons.push(["A", i === 0 && hasMe ? "x" : "k"])
  let remaining = adults - kids
  for (; remaining >= 2; remaining -= 2) wagons.push(["A", "A"])
  if (remaining === 1) wagons.push(["A", "D"])
  return wagons.length <= WAGONS ? wagons : null
}

let rideNumber = 1
let ride: [string, string][] = []
let seated = false // whether I am on the current ride
for (const group of groups) {
  const wagons = seat(group)
  if (!wagons) continue
  if (ride.length + wagons.length > WAGONS) {
    // The ride departs; if I was on it, it's the one to show
    if (seated) break
    rideNumber++
    ride = []
  }
  ride.push(...wagons)
  if (group.indexOf("x") >= 0) seated = true
}

while (ride.length < WAGONS) ride.push(["D", "D"])
console.log(rideNumber)
console.log("/< | " + ride.map(w => w[0]).join(" | ") + " |")
console.log("\\< | " + ride.map(w => w[1]).join(" | ") + " |")
