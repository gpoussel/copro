import { readFileSync } from "node:fs"
import { dirname, resolve } from "node:path"
import { fileURLToPath } from "node:url"
import { chunk } from "../../../utils/iterate.js"

// 🧮 Project Euler - Problem 96

const GRID_SIZE = 9

function isMoveValid(sudoku: number[], index: number, digit: number) {
  const row = 9 * Math.trunc(index / GRID_SIZE)
  for (let i = row; i < row + GRID_SIZE; i++) {
    if (sudoku[i] === digit) {
      return false
    }
  }

  const col = index % GRID_SIZE
  for (let i = col; i < 81; i += GRID_SIZE) {
    if (sudoku[i] === digit) {
      return false
    }
  }

  const box = 27 * Math.trunc(row / (3 * GRID_SIZE)) + 3 * Math.trunc(col / 3)
  for (var j = 0; j <= 18; j += GRID_SIZE) {
    for (var i = box + j; i < box + j + 3; i++) {
      if (sudoku[i] === digit) {
        return false
      }
    }
  }

  return true
}

function depthFirstSolve(sudoku: number[]): { solved: true; result: number } | { solved: false } {
  const nextEmptySpot = sudoku.indexOf(0)

  if (nextEmptySpot === -1) {
    return { solved: true, result: sudoku[0] * 100 + sudoku[1] * 10 + sudoku[2] }
  }

  for (let digit = 1; digit <= 9; digit++) {
    if (isMoveValid(sudoku, nextEmptySpot, digit)) {
      const childResult = depthFirstSolve([
        ...sudoku.slice(0, nextEmptySpot),
        digit,
        ...sudoku.slice(nextEmptySpot + 1),
      ])
      if (childResult.solved) {
        return childResult
      }
    }
  }

  return { solved: false }
}

function solveGrid(grid: number[][]) {
  const result = depthFirstSolve(grid.flat())
  if (!result.solved) {
    throw new Error("No solution found")
  }
  return result.result
}

export function solve() {
  const filePath = resolve(dirname(fileURLToPath(import.meta.url)), "p096_sudoku.txt")
  const gridLines = readFileSync(filePath, "utf-8").trim().split("\n")
  return chunk(gridLines, 10)
    .map(g => g.slice(1))
    .map(g => g.map(r => r.split("").map(Number)))
    .map(solveGrid)
    .reduce((a, b) => a + b, 0)
}
