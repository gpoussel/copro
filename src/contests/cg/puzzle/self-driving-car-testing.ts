// 🎮 CodinGame Puzzle - self-driving-car-testing
// https://www.codingame.com/training/easy/self-driving-car-testing

const N = parseInt(readline())

// Parse starting column and commands
const line2 = readline().split(";")
let carCol = parseInt(line2[0]) - 1 // 0-based

// Parse commands into a flat list of moves
const moves: string[] = []
for (let i = 1; i < line2.length; i++) {
  const cmd = line2[i]
  const count = parseInt(cmd.slice(0, -1))
  const dir = cmd[cmd.length - 1]
  for (let j = 0; j < count; j++) {
    moves.push(dir)
  }
}

// Parse road pattern lines and expand them
const roadLines: string[] = []
for (let i = 0; i < N; i++) {
  const parts = readline().split(";")
  const repeat = parseInt(parts[0])
  const pattern = parts.slice(1).join(";") // in case pattern contains semicolons
  for (let r = 0; r < repeat; r++) {
    roadLines.push(pattern)
  }
}

// Output the road with the car
for (let row = 0; row < roadLines.length; row++) {
  const move = moves[row]
  // Apply movement for this row
  if (move === "L") carCol--
  else if (move === "R") carCol++
  // S: no change

  let line = roadLines[row]
  // Place car at carCol (0-based)
  // If carCol is within line length, replace that character; otherwise pad
  const lineArr = line.split("")
  while (lineArr.length <= carCol) lineArr.push(" ")
  lineArr[carCol] = "#"
  console.log(lineArr.join(""))
}
