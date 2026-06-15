// 🎮 CodinGame Puzzle - laughter-is-contagious
// https://www.codingame.com/

const row: string = readline()

const people: string[] = []
for (let i = 0; i < row.length; i += 2) {
  people.push(row.substring(i, i + 2))
}

const isLol = (p: string): boolean => p === p.toUpperCase() && p !== p.toLowerCase()
const isSullen = (p: string): boolean => p === p.toLowerCase()
const isPotential = (p: string): boolean => !isLol(p) && !isSullen(p)

// Step 1: a non-LOL person matching (case-insensitive) any LOL person becomes LOL.
const lolLaughs: Set<string> = new Set<string>()
for (const p of people) {
  if (isLol(p)) {
    lolLaughs.add(p.toUpperCase())
  }
}
for (let i = 0; i < people.length; i++) {
  if (!isLol(people[i]) && lolLaughs.has(people[i].toUpperCase())) {
    people[i] = people[i].toUpperCase()
  }
}

// Step 2: each remaining potential person laughs as the closest LOL person within
// 3 seats, provided at most one of their neighbours is sullen. Applied simultaneously.
const next: string[] = people.slice()
for (let i = 0; i < people.length; i++) {
  if (!isPotential(people[i])) {
    continue
  }

  let sullenNeighbours: number = 0
  if (i - 1 >= 0 && isSullen(people[i - 1])) {
    sullenNeighbours++
  }
  if (i + 1 < people.length && isSullen(people[i + 1])) {
    sullenNeighbours++
  }
  if (sullenNeighbours > 1) {
    continue
  }

  // Find closest LOL person(s) within 3 seats.
  let bestDist: number = 4
  let leftPerson: string = ""
  let rightPerson: string = ""
  for (let j = 0; j < people.length; j++) {
    if (j === i || !isLol(people[j])) {
      continue
    }
    const d: number = Math.abs(j - i)
    if (d > 3) {
      continue
    }
    if (d < bestDist) {
      bestDist = d
      leftPerson = ""
      rightPerson = ""
    }
    if (d === bestDist) {
      if (j < i) {
        leftPerson = people[j]
      } else {
        rightPerson = people[j]
      }
    }
  }

  if (bestDist > 3) {
    continue
  }

  if (leftPerson !== "" && rightPerson !== "") {
    // Equidistant on both sides: take closest letter from each.
    next[i] = leftPerson[1] + rightPerson[0]
  } else if (leftPerson !== "") {
    next[i] = leftPerson
  } else {
    next[i] = rightPerson
  }
}

console.log(next.join(""))
