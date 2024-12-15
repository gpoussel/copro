import { EverybodyCodesContest } from "../../../../../types/contest.js"
import { Direction } from "../../../../../utils/grid.js"
import utils from "../../../../../utils/index.js"
import { Vector2, Vector2Set } from "../../../../../utils/vector.js"

// 🎲 Everybody Codes 2024 - Quest 7

function parseInput(input: string) {
  return utils.input.lines(input).map(line => {
    const parts = line.split(":")
    return {
      name: parts[0],
      plan: parts[1].split(","),
    }
  })
}

function computeTrack(trackGrid: string) {
  const grid = utils.input.readGrid(trackGrid)
  let currentPosition = new Vector2(0, 0)
  const visited = new Vector2Set()
  const pathBuffer = []
  let foundMove = true
  while (pathBuffer.length < 0 || (pathBuffer[pathBuffer.length - 1] !== "S" && foundMove)) {
    visited.add(currentPosition)
    foundMove = false
    for (const direction of ["right", "down", "left", "up"] as Direction[]) {
      const nextPosition = currentPosition.move(direction)
      const nextInDirection = utils.grid.at(grid, nextPosition)
      if (["+", "-", "=", "S"].includes(nextInDirection) && !visited.contains(nextPosition)) {
        currentPosition = nextPosition
        pathBuffer.push(nextInDirection)
        foundMove = true
        break
      }
    }
  }
  pathBuffer.push("S")
  return pathBuffer.join("")
}

function part1(inputString: string) {
  const input = parseInput(inputString)
  const scores = new Map<string, number>()
  for (const { name, plan } of input) {
    let score = 10
    let sumOfScore = 0
    for (let i = 0; i < 10; ++i) {
      const action = plan[i % plan.length]
      if (action === "+") {
        score += 1
      } else if (action === "-" && score > 0) {
        score -= 1
      }
      sumOfScore += score
    }
    scores.set(name, sumOfScore)
  }
  const sorted = Array.from(scores.entries()).sort((a, b) => b[1] - a[1])
  return sorted.map(([name]) => name).join("")
}

function simulateTrack(track: string, input: ReturnType<typeof parseInput>, loops: number) {
  const scores = new Map<string, number>()
  for (const { name, plan } of input) {
    let score = 10
    let sumOfScore = 0
    let planPosition = 0
    for (let loop = 0; loop < loops; ++loop) {
      for (let i = 0; i < track.length; ++i) {
        const trackSymbol = track[i]
        const action = plan[planPosition]
        planPosition = (planPosition + 1) % plan.length
        if (trackSymbol === "=" || trackSymbol === "S") {
          if (action === "+") {
            score += 1
          } else if (action === "-" && score > 0) {
            score -= 1
          }
        } else if (trackSymbol === "+") {
          score += 1
        } else if (trackSymbol === "-" && score > 0) {
          score -= 1
        }
        sumOfScore += score
      }
    }
    scores.set(name, sumOfScore)
  }
  const sorted = Array.from(scores.entries()).sort((a, b) => {
    if (a[1] === b[1]) {
      return a[0].localeCompare(b[0])
    }
    return b[1] - a[1]
  })
  return sorted.map(([name]) => name).join("")
}

function part2(inputString: string) {
  const input = parseInput(inputString)
  const trackString =
    input.length === 4
      ? `
S+===
-   +
=+=-+`
      : `
S-=++=-==++=++=-=+=-=+=+=--=-=++=-==++=-+=-=+=-=+=+=++=-+==++=++=-=-=--
-                                                                     -
=                                                                     =
+                                                                     +
=                                                                     +
+                                                                     =
=                                                                     =
-                                                                     -
--==++++==+=+++-=+=-=+=-+-=+-=+-=+=-=+=--=+++=++=+++==++==--=+=++==+++-`

  const track = computeTrack(trackString)
  return simulateTrack(track, input, 10)
}

function part3(inputString: string) {
  const opponent = parseInput(inputString)[0]
  const trackString = `
S+= +=-== +=++=     =+=+=--=    =-= ++=     +=-  =+=++=-+==+ =++=-=-=--
- + +   + =   =     =      =   == = - -     - =  =         =-=        -
= + + +-- =-= ==-==-= --++ +  == == = +     - =  =    ==++=    =++=-=++
+ + + =     +         =  + + == == ++ =     = =  ==   =   = =++=
= = + + +== +==     =++ == =+=  =  +  +==-=++ =   =++ --= + =
+ ==- = + =   = =+= =   =       ++--          +     =   = = =--= ==++==
=     ==- ==+-- = = = ++= +=--      ==+ ==--= +--+=-= ==- ==   =+=    =
-               = = = =   +  +  ==+ = = +   =        ++    =          -
-               = + + =   +  -  = + = = +   =        +     =          -
--==++++==+=+++-= =-= =-+-=  =+-= =-= =--   +=++=+++==     -=+=++==+++-`
  const track = computeTrack(trackString)
  const myProgram = `${"+".repeat(5)}${"-".repeat(3)}${"=".repeat(3)}`.split("")
  const permutations = utils.iterate.permutations(myProgram)
  return permutations.filter((permutation, index) => {
    utils.log.logEvery(index, 500)
    const result = simulateTrack(track, [{ name: "M", plan: permutation }, opponent], 2024)
    return result === "MA"
  }).length
}

export default {
  part1: {
    run: part1,
    tests: [
      {
        input: `
A:+,-,=,=
B:+,=,-,+
C:=,-,+,+
D:=,=,=,+`,
        expected: "BDCA",
      },
    ],
  },
  part2: {
    run: part2,
    tests: [
      {
        input: `
A:+,-,=,=
B:+,=,-,+
C:=,-,+,+
D:=,=,=,+`,
        expected: "DCBA",
      },
    ],
  },
  part3: {
    run: part3,
    tests: [],
  },
} as EverybodyCodesContest
