// 🎮 CodinGame Puzzle - simple-awale
// https://www.codingame.com/training/easy/simple-awale

const opLine = readline().trim().split(" ").map(Number)
const myLine = readline().trim().split(" ").map(Number)
const num = parseInt(readline().trim())

// opLine and myLine each have 7 elements: indices 0..5 are regular bowls, index 6 is reserve

// Build a circular distribution sequence starting just after num in my bowls
// Order: my[num+1], ..., my[5], my[6](reserve), op[0], op[1], ..., op[5], my[0], ..., my[5], my[6], ...
// Opponent's reserve (op[6]) is always skipped

// We'll use a flat index: 0..6 = my bowls (6 = my reserve), 7..12 = op bowls (op reserve skipped entirely)
// Distribution starts at position num+1 in my bowls

const my = myLine.slice()
const op = opLine.slice()

let grains = my[num]
my[num] = 0

// Build position sequence: positions cycle through my[0..6] then op[0..5] (skip op[6])
// Total cycle length = 7 (my) + 6 (op, no reserve) = 13

function nextPos(pos: number) {
  // pos: 0..6 = my[0..6], 7..12 = op[0..5]
  if (pos === 12) return 0 // after op[5], go back to my[0]
  return pos + 1
}

// Starting position is num+1 (in my bowls)
let pos = num + 1

let lastPos = -1
while (grains > 0) {
  // my reserve is pos === 6
  // op bowls are pos 7..12
  if (pos === 6) {
    my[6]++
  } else if (pos < 6) {
    my[pos]++
  } else {
    // pos 7..12 => op[0..5]
    op[pos - 7]++
  }
  lastPos = pos
  grains--
  if (grains > 0) {
    pos = nextPos(pos)
  }
}

// Format output
function formatBowls(bowls: number[]) {
  const regular = bowls.slice(0, 6).join(" ")
  return regular + " [" + bowls[6] + "]"
}

console.log(formatBowls(op))
console.log(formatBowls(my))

if (lastPos === 6) {
  console.log("REPLAY")
}
