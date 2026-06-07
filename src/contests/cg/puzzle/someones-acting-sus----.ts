// 🎮 CodinGame Puzzle - someones-acting-sus----
// https://www.codingame.com/training/easy/someones-acting-sus----

const L = parseInt(readline())
const F = readline()
const [N, K] = readline().split(" ").map(Number)

for (let i = 0; i < N; i++) {
  const path = readline()
  let sus = false

  // Find pairs of known positions and check if the distance is reachable
  let prevIdx = -1
  let prevPos = -1

  for (let j = 0; j < K; j++) {
    if (path[j] === "#") continue

    const pos = F.indexOf(path[j])

    if (prevPos !== -1) {
      const steps = j - prevIdx // number of minutes between observations
      // Cyclic distance between prevPos and pos
      const diff = Math.abs(pos - prevPos)
      const cyclicDist = Math.min(diff, L - diff)
      // The crewmate can cover at most `steps` rooms in `steps` minutes
      if (cyclicDist > steps) {
        sus = true
        break
      }
    }

    prevIdx = j
    prevPos = pos
  }

  console.log(sus ? "SUS" : "NOT SUS")
}
