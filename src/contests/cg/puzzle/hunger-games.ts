// 🎮 CodinGame Puzzle - hunger-games
// https://www.codingame.com/training/easy/hunger-games

const n = parseInt(readline())
const tributes: string[] = []
for (let i = 0; i < n; i++) {
  tributes.push(readline())
}

const t = parseInt(readline())

// Map of killer -> list of victims (in order they appear)
const kills: Map<string, string[]> = new Map()
// Map of victim -> killer
const killedBy: Map<string, string> = new Map()

for (let i = 0; i < t; i++) {
  const line = readline()
  // Format: "Killer killed Victim1, Victim2, ..."
  const killedIndex = line.indexOf(" killed ")
  const killer = line.substring(0, killedIndex)
  const victimsStr = line.substring(killedIndex + 8) // " killed " is 8 chars
  const victims = victimsStr.split(", ")

  if (!kills.has(killer)) {
    kills.set(killer, [])
  }
  for (const victim of victims) {
    kills.get(killer)!.push(victim)
    killedBy.set(victim, killer)
  }
}

// Sort tributes alphabetically
const sortedTributes = [...tributes].sort()

const output: string[] = []
for (const tribute of sortedTributes) {
  const killedList = kills.get(tribute) || []
  // Sort victims alphabetically
  killedList.sort()
  const killedStr = killedList.length > 0 ? killedList.join(", ") : "None"
  const killer = killedBy.get(tribute) || "Winner"

  output.push(`Name: ${tribute}`)
  output.push(`Killed: ${killedStr}`)
  output.push(`Killer: ${killer}`)
  output.push("")
}

// Remove trailing blank line
if (output[output.length - 1] === "") {
  output.pop()
}

console.log(output.join("\n"))
