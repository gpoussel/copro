// 🎮 CodinGame Puzzle - the-electrician-apprentice
// https://www.codingame.com/training/easy/the-electrician-apprentice

const C = parseInt(readline())
const wirings: string[] = []
for (let i = 0; i < C; i++) {
  wirings.push(readline())
}
const A = parseInt(readline())

// Track switch states: all start OFF (false)
const switchState: Map<string, boolean> = new Map()

for (let i = 0; i < A; i++) {
  const sw = readline().trim()
  switchState.set(sw, !(switchState.get(sw) ?? false))
}

function isOn(sw: string): boolean {
  return switchState.get(sw) ?? false
}

// Parse wiring and evaluate
// Format: EQUIPMENT <groups>
// where groups are sequences of: (-|=) followed by switch names until next (-|=)
// - means series (ALL must be ON)
// = means parallel (at least ONE must be ON)
for (const wiring of wirings) {
  const tokens = wiring.trim().split(/\s+/)
  const equipment = tokens[0]

  // Parse groups
  // tokens[1], tokens[2], ... form the wiring description
  // Each group starts with '-' or '='
  const groups: Array<{ type: "-" | "="; switches: string[] }> = []
  let currentGroup: { type: "-" | "="; switches: string[] } | null = null

  for (let i = 1; i < tokens.length; i++) {
    const token = tokens[i]
    if (token === "-" || token === "=") {
      if (currentGroup !== null) {
        groups.push(currentGroup)
      }
      currentGroup = { type: token as "-" | "=", switches: [] }
    } else {
      if (currentGroup === null) {
        // Should not happen per problem statement, but handle gracefully
        currentGroup = { type: "-", switches: [] }
      }
      currentGroup.switches.push(token)
    }
  }
  if (currentGroup !== null) {
    groups.push(currentGroup)
  }

  // Evaluate: all groups must be satisfied
  // Series group (-): ALL switches must be ON
  // Parallel group (=): AT LEAST ONE switch must be ON
  let circuitOn = true
  for (const group of groups) {
    if (group.type === "-") {
      // All switches in series must be ON
      const groupOn = group.switches.every(sw => isOn(sw))
      if (!groupOn) {
        circuitOn = false
        break
      }
    } else {
      // At least one switch in parallel must be ON
      const groupOn = group.switches.some(sw => isOn(sw))
      if (!groupOn) {
        circuitOn = false
        break
      }
    }
  }

  console.log(`${equipment} is ${circuitOn ? "ON" : "OFF"}`)
}
