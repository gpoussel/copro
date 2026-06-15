// 🎮 CodinGame Puzzle - 10-pin-bowling-scores
// https://www.codingame.com/

const n = parseInt(readline(), 10)

for (let g = 0; g < n; g++) {
  const frames = readline().split(" ")

  // Flatten into a list of pin counts per ball, resolving notation.
  const rolls: number[] = []
  for (const frame of frames) {
    for (let i = 0; i < frame.length; i++) {
      const c = frame[i]
      if (c === "X") {
        rolls.push(10)
      } else if (c === "-") {
        rolls.push(0)
      } else if (c === "/") {
        // Spare: 10 minus the previous ball in this frame.
        rolls.push(10 - rolls[rolls.length - 1])
      } else {
        rolls.push(parseInt(c, 10))
      }
    }
  }

  const cumulative: number[] = []
  let total = 0
  let r = 0
  for (let frame = 0; frame < 10; frame++) {
    if (rolls[r] === 10) {
      // Strike
      total += 10 + rolls[r + 1] + rolls[r + 2]
      r += 1
    } else if (rolls[r] + rolls[r + 1] === 10) {
      // Spare
      total += 10 + rolls[r + 2]
      r += 2
    } else {
      total += rolls[r] + rolls[r + 1]
      r += 2
    }
    cumulative.push(total)
  }

  console.log(cumulative.join(" "))
}
