import { AdventOfCodeContest } from "../../../../../types/contest.js"
import { Direction, fromDirectionChar, nextDirClockwise, nextDirCounterClockwise } from "../../../../../utils/grid.js"
import utils from "../../../../../utils/index.js"
import { Vector2 } from "../../../../../utils/vector.js"

// 🎄 Advent of Code 2018 - Day 13

function parseInput(input: string) {
  return input
    .split(/\r?\n/)
    .filter(r => r.length > 0)
    .map(r => r.split(""))
}

function getInitialCartStates(grid: string[][]) {
  const carts = []
  for (let y = 0; y < grid.length; y++) {
    for (let x = 0; x < grid[y].length; x++) {
      const position = new Vector2(x, y)
      const cell = utils.grid.at(grid, position)
      if (cell === "v" || cell === "^" || cell === "<" || cell === ">") {
        carts.push({ position, direction: fromDirectionChar(cell), nextTurn: "left" })
      }
    }
  }
  return carts
}

function tickCart(
  cart: { position: Vector2; direction: Direction; nextTurn: string },
  cell: string,
  nextPosition: Vector2
) {
  if (cell === "+") {
    if (cart.nextTurn === "left") {
      cart.direction = nextDirCounterClockwise(cart.direction)
      cart.nextTurn = "straight"
    } else if (cart.nextTurn === "straight") {
      cart.nextTurn = "right"
    } else if (cart.nextTurn === "right") {
      cart.direction = nextDirClockwise(cart.direction)
      cart.nextTurn = "left"
    } else {
      throw new Error(`Invalid next turn: ${cart.nextTurn} at ${cart.position.str()}`)
    }
  } else if (cell === "/") {
    if (cart.direction === "down") {
      cart.direction = "left"
    } else if (cart.direction === "up") {
      cart.direction = "right"
    } else if (cart.direction === "left") {
      cart.direction = "down"
    } else if (cart.direction === "right") {
      cart.direction = "up"
    }
  } else if (cell === "\\") {
    if (cart.direction === "down") {
      cart.direction = "right"
    } else if (cart.direction === "up") {
      cart.direction = "left"
    } else if (cart.direction === "left") {
      cart.direction = "up"
    } else if (cart.direction === "right") {
      cart.direction = "down"
    }
  } else if (cell === "|") {
    if (cart.direction !== "up" && cart.direction !== "down") {
      throw new Error(`Invalid direction: ${cart.direction} at ${cart.position.str()}`)
    }
  } else if (cell === "-") {
    if (cart.direction !== "left" && cart.direction !== "right") {
      throw new Error(`Invalid direction: ${cart.direction} at ${cart.position.str()}`)
    }
  } else {
    throw new Error(`Invalid cell: ${cell} at ${cart.position.str()}`)
  }
  cart.position = nextPosition
}

function part1(inputString: string) {
  const grid = parseInput(inputString)
  const carts = getInitialCartStates(grid)
  carts.forEach(cart => {
    utils.grid.set(grid, cart.position, cart.direction === "up" || cart.direction === "down" ? "|" : "-")
  })
  while (true) {
    for (const cart of carts) {
      const nextPosition = cart.position.move(cart.direction)
      const cell = utils.grid.at(grid, nextPosition)
      if (carts.some(c => c.position.equals(nextPosition))) {
        return nextPosition.str()
      }
      tickCart(cart, cell, nextPosition)
    }
    carts.sort((a, b) => a.position.compare(b.position))
  }
}

function part2(inputString: string) {
  const grid = parseInput(inputString)
  const carts = getInitialCartStates(grid)
  carts.forEach(cart => {
    utils.grid.set(grid, cart.position, cart.direction === "up" || cart.direction === "down" ? "|" : "-")
  })
  while (true) {
    const nextCarts = [...carts]
    for (const cart of carts) {
      const nextPosition = cart.position.move(cart.direction)
      const cell = utils.grid.at(grid, nextPosition)
      const otherCart = nextCarts.find(c => c.position.equals(nextPosition))
      if (otherCart) {
        nextCarts.splice(nextCarts.indexOf(cart), 1)
        nextCarts.splice(nextCarts.indexOf(otherCart), 1)
        continue
      }
      tickCart(cart, cell, nextPosition)
    }
    nextCarts.sort((a, b) => a.position.compare(b.position))
    if (nextCarts.length === 1) {
      return nextCarts[0].position.str()
    }
    carts.splice(0, carts.length, ...nextCarts)
  }
}

export default {
  part1: {
    run: part1,
    tests: [
      {
        input: `
/->-\\        
|   |  /----\\ 
| /-+--+-\\  |
| | |  | v  |
\\-+-/  \\-+--/
  \\------/   `,
        expected: "7,3",
      },
    ],
  },
  part2: {
    run: part2,
    tests: [
      {
        input: `
/>-<\\  
|   |  
| /<+-\\
| | | v
\\>+</ |
  |   ^
  \\<->/`,
        expected: "6,4",
      },
    ],
  },
} as AdventOfCodeContest
