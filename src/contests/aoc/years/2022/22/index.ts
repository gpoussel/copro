import { AdventOfCodeContest } from "../../../../../types/contest.js"
import { Direction, nextDirClockwise, nextDirCounterClockwise } from "../../../../../utils/grid.js"
import utils from "../../../../../utils/index.js"
import { Vector2 } from "../../../../../utils/vector.js"

// 🎄 Advent of Code 2022 - Day 22

function parseInput(input: string) {
  const [mapString, instructionsString] = input.replace(/^\n+/, "").split("\n\n")
  const mapLines = mapString.split("\n")
  const instructions =
    instructionsString.match(/(\d+|L|R)/g)?.map(inst => (inst === "L" || inst === "R" ? inst : +inst)) || []
  return { mapLines, instructions }
}

function part1(inputString: string) {
  const input = parseInput(inputString)
  let facing: Direction = "right"
  let startY = 0
  let startX = input.mapLines[0].indexOf(".")
  let position = new Vector2(startX, startY)
  for (const instruction of input.instructions) {
    if (instruction === "L") {
      facing = nextDirCounterClockwise(facing)
    } else if (instruction === "R") {
      facing = nextDirClockwise(facing)
    } else {
      // Move forward
      for (let step = 0; step < instruction; step++) {
        const nextPosition = position.move(facing, 1)
        const charAtNext = input.mapLines[nextPosition.y]?.[nextPosition.x] || " "
        if (charAtNext === "#") {
          // Hit a wall, stop moving
          break
        } else if (charAtNext === ".") {
          // Valid move
          position = nextPosition
        } else {
          // Need to wrap around
          let wrapPosition = position
          while (true) {
            const testPosition = wrapPosition.move(facing, -1)
            const charAtTest = input.mapLines[testPosition.y]?.[testPosition.x] || " "
            if (charAtTest === " ") {
              break
            }
            wrapPosition = testPosition
          }
          const charAtWrap = input.mapLines[wrapPosition.y]?.[wrapPosition.x] || " "
          if (charAtWrap === "#") {
            // Hit a wall after wrapping, stop moving
            break
          } else if (charAtWrap === ".") {
            // Valid wrap move
            position = wrapPosition
          }
        }
      }
    }
  }
  return (position.x + 1) * 4 + (position.y + 1) * 1000 + { right: 0, down: 1, left: 2, up: 3 }[facing]
}

function part2(inputString: string) {
  const input = parseInput(inputString)

  // Determine face size (50 for real input, 4 for example)
  const faceSize = Math.max(...input.mapLines.map(line => line.length)) >= 100 ? 50 : 4

  // Map to identify which face each position belongs to
  // For real input (50x50 faces):
  //   12
  //   3
  //  45
  //  6
  // For example (4x4 faces):
  //     1
  //   234
  //     56

  // Define the cube transitions: when leaving a face in a direction,
  // what face do you enter and with what new direction?
  // Format: [fromFace, direction] -> [toFace, newDirection, transformFunction]

  type TransformFn = (x: number, y: number, size: number) => { x: number; y: number }

  interface Transition {
    toFace: number
    newDir: Direction
    transform: TransformFn
  }

  // Get face number for a position
  function getFace(x: number, y: number): number {
    if (faceSize === 50) {
      // Real input layout:
      //   12
      //   3
      //  45
      //  6
      const faceX = Math.floor(x / faceSize)
      const faceY = Math.floor(y / faceSize)
      if (faceY === 0 && faceX === 1) return 1
      if (faceY === 0 && faceX === 2) return 2
      if (faceY === 1 && faceX === 1) return 3
      if (faceY === 2 && faceX === 0) return 4
      if (faceY === 2 && faceX === 1) return 5
      if (faceY === 3 && faceX === 0) return 6
    } else {
      // Example input layout:
      //     1
      //   234
      //     56
      const faceX = Math.floor(x / faceSize)
      const faceY = Math.floor(y / faceSize)
      if (faceY === 0 && faceX === 2) return 1
      if (faceY === 1 && faceX === 0) return 2
      if (faceY === 1 && faceX === 1) return 3
      if (faceY === 1 && faceX === 2) return 4
      if (faceY === 2 && faceX === 2) return 5
      if (faceY === 2 && faceX === 3) return 6
    }
    return -1
  }

  // Get top-left corner of each face
  function getFaceOrigin(face: number): { x: number; y: number } {
    if (faceSize === 50) {
      switch (face) {
        case 1:
          return { x: faceSize, y: 0 }
        case 2:
          return { x: 2 * faceSize, y: 0 }
        case 3:
          return { x: faceSize, y: faceSize }
        case 4:
          return { x: 0, y: 2 * faceSize }
        case 5:
          return { x: faceSize, y: 2 * faceSize }
        case 6:
          return { x: 0, y: 3 * faceSize }
      }
    } else {
      switch (face) {
        case 1:
          return { x: 2 * faceSize, y: 0 }
        case 2:
          return { x: 0, y: faceSize }
        case 3:
          return { x: faceSize, y: faceSize }
        case 4:
          return { x: 2 * faceSize, y: faceSize }
        case 5:
          return { x: 2 * faceSize, y: 2 * faceSize }
        case 6:
          return { x: 3 * faceSize, y: 2 * faceSize }
      }
    }
    return { x: 0, y: 0 }
  }

  // Define transitions for each face and direction
  const transitions: Map<string, Transition> = faceSize === 50 ? getRealTransitions() : getExampleTransitions()

  function getRealTransitions(): Map<string, Transition> {
    const t = new Map<string, Transition>()
    const S = faceSize - 1

    // Face 1 transitions
    t.set("1,up", { toFace: 6, newDir: "right", transform: (x, y) => ({ x: 0, y: x }) })
    t.set("1,left", { toFace: 4, newDir: "right", transform: (x, y) => ({ x: 0, y: S - y }) })
    // right -> goes to face 2 naturally
    // down -> goes to face 3 naturally

    // Face 2 transitions
    t.set("2,up", { toFace: 6, newDir: "up", transform: (x, y) => ({ x: x, y: S }) })
    t.set("2,right", { toFace: 5, newDir: "left", transform: (x, y) => ({ x: S, y: S - y }) })
    t.set("2,down", { toFace: 3, newDir: "left", transform: (x, y) => ({ x: S, y: x }) })
    // left -> goes to face 1 naturally

    // Face 3 transitions
    t.set("3,left", { toFace: 4, newDir: "down", transform: (x, y) => ({ x: y, y: 0 }) })
    t.set("3,right", { toFace: 2, newDir: "up", transform: (x, y) => ({ x: y, y: S }) })
    // up -> goes to face 1 naturally
    // down -> goes to face 5 naturally

    // Face 4 transitions
    t.set("4,up", { toFace: 3, newDir: "right", transform: (x, y) => ({ x: 0, y: x }) })
    t.set("4,left", { toFace: 1, newDir: "right", transform: (x, y) => ({ x: 0, y: S - y }) })
    // right -> goes to face 5 naturally
    // down -> goes to face 6 naturally

    // Face 5 transitions
    t.set("5,right", { toFace: 2, newDir: "left", transform: (x, y) => ({ x: S, y: S - y }) })
    t.set("5,down", { toFace: 6, newDir: "left", transform: (x, y) => ({ x: S, y: x }) })
    // up -> goes to face 3 naturally
    // left -> goes to face 4 naturally

    // Face 6 transitions
    t.set("6,left", { toFace: 1, newDir: "down", transform: (x, y) => ({ x: y, y: 0 }) })
    t.set("6,down", { toFace: 2, newDir: "down", transform: (x, y) => ({ x: x, y: 0 }) })
    t.set("6,right", { toFace: 5, newDir: "up", transform: (x, y) => ({ x: y, y: S }) })
    // up -> goes to face 4 naturally

    return t
  }

  function getExampleTransitions(): Map<string, Transition> {
    const t = new Map<string, Transition>()
    const S = faceSize - 1

    // Face 1 transitions (top face)
    t.set("1,up", { toFace: 2, newDir: "down", transform: (x, y) => ({ x: S - x, y: 0 }) })
    t.set("1,left", { toFace: 3, newDir: "down", transform: (x, y) => ({ x: y, y: 0 }) })
    t.set("1,right", { toFace: 6, newDir: "left", transform: (x, y) => ({ x: S, y: S - y }) })
    // down -> goes to face 4 naturally

    // Face 2 transitions
    t.set("2,up", { toFace: 1, newDir: "down", transform: (x, y) => ({ x: S - x, y: 0 }) })
    t.set("2,left", { toFace: 6, newDir: "up", transform: (x, y) => ({ x: S - y, y: S }) })
    t.set("2,down", { toFace: 5, newDir: "up", transform: (x, y) => ({ x: S - x, y: S }) })
    // right -> goes to face 3 naturally

    // Face 3 transitions
    t.set("3,up", { toFace: 1, newDir: "right", transform: (x, y) => ({ x: 0, y: x }) })
    t.set("3,down", { toFace: 5, newDir: "right", transform: (x, y) => ({ x: 0, y: S - x }) })
    // left -> goes to face 2 naturally
    // right -> goes to face 4 naturally

    // Face 4 transitions
    t.set("4,right", { toFace: 6, newDir: "down", transform: (x, y) => ({ x: S - y, y: 0 }) })
    // up -> goes to face 1 naturally
    // left -> goes to face 3 naturally
    // down -> goes to face 5 naturally

    // Face 5 transitions
    t.set("5,left", { toFace: 3, newDir: "up", transform: (x, y) => ({ x: S - y, y: S }) })
    t.set("5,down", { toFace: 2, newDir: "up", transform: (x, y) => ({ x: S - x, y: S }) })
    // up -> goes to face 4 naturally
    // right -> goes to face 6 naturally

    // Face 6 transitions
    t.set("6,up", { toFace: 4, newDir: "left", transform: (x, y) => ({ x: S, y: S - x }) })
    t.set("6,right", { toFace: 1, newDir: "left", transform: (x, y) => ({ x: S, y: S - y }) })
    t.set("6,down", { toFace: 2, newDir: "right", transform: (x, y) => ({ x: 0, y: S - x }) })
    // left -> goes to face 5 naturally

    return t
  }

  function wrapCube(pos: Vector2, facing: Direction): { newPos: Vector2; newFacing: Direction } {
    const face = getFace(pos.x, pos.y)
    const origin = getFaceOrigin(face)
    const localX = pos.x - origin.x
    const localY = pos.y - origin.y

    const key = `${face},${facing}`
    const transition = transitions.get(key)

    if (!transition) {
      // No transition defined means natural movement to adjacent face
      // This shouldn't happen if we call wrapCube only when needed
      throw new Error(`No transition for ${key}`)
    }

    const newLocal = transition.transform(localX, localY, faceSize)
    const newOrigin = getFaceOrigin(transition.toFace)

    return {
      newPos: new Vector2(newOrigin.x + newLocal.x, newOrigin.y + newLocal.y),
      newFacing: transition.newDir,
    }
  }

  let facing: Direction = "right"
  let startY = 0
  let startX = input.mapLines[0].indexOf(".")
  let position = new Vector2(startX, startY)

  for (const instruction of input.instructions) {
    if (instruction === "L") {
      facing = nextDirCounterClockwise(facing)
    } else if (instruction === "R") {
      facing = nextDirClockwise(facing)
    } else {
      // Move forward
      for (let step = 0; step < instruction; step++) {
        const nextPosition = position.move(facing, 1)
        const nextFace = getFace(nextPosition.x, nextPosition.y)
        const charAtNext = input.mapLines[nextPosition.y]?.[nextPosition.x] || " "

        if (nextFace !== -1 && charAtNext !== " ") {
          // Still on the cube, normal move
          if (charAtNext === "#") {
            // Hit a wall, stop moving
            break
          } else if (charAtNext === ".") {
            // Valid move
            position = nextPosition
          }
        } else {
          // Need to wrap around the cube
          const { newPos, newFacing } = wrapCube(position, facing)
          const charAtWrap = input.mapLines[newPos.y]?.[newPos.x] || " "
          if (charAtWrap === "#") {
            // Hit a wall after wrapping, stop moving
            break
          } else if (charAtWrap === ".") {
            // Valid wrap move
            position = newPos
            facing = newFacing
          }
        }
      }
    }
  }

  return (position.x + 1) * 4 + (position.y + 1) * 1000 + { right: 0, down: 1, left: 2, up: 3 }[facing]
}

const EXAMPLE = `
        ...#
        .#..
        #...
        ....
...#.......#
........#...
..#....#....
..........#.
        ...#....
        .....#..
        .#......
        ......#.

10R5L5R10L4R5L5`

export default {
  part1: {
    run: part1,
    tests: [
      {
        input: EXAMPLE,
        expected: 6032,
      },
    ],
  },
  part2: {
    run: part2,
    tests: [
      {
        input: EXAMPLE,
        expected: 5031,
      },
    ],
  },
} as AdventOfCodeContest
