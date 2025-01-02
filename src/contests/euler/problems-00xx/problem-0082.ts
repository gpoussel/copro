import { readFileSync } from "fs"
import { dirname, resolve } from "path"
import { fileURLToPath } from "url"
import { dijkstraOnGraph } from "../../../utils/algo.js"
import { Vector2 } from "../../../utils/vector.js"
import { inBounds } from "../../../utils/grid.js"

// 🧮 Project Euler - Problem 82

export function solve() {
  const filePath = resolve(dirname(fileURLToPath(import.meta.url)), "0082_matrix.txt")
  const matrix = readFileSync(filePath, "utf-8")
    .trim()
    .split("\n")
    .map(line => line.split(",").map(Number))
  const startPosition = new Vector2(-1, -1)
  const result = dijkstraOnGraph<Vector2>([startPosition], end => end.x === matrix[0].length - 1, {
    equals(a, b) {
      return a.equals(b)
    },
    key(node) {
      return node.str()
    },
    moves(node) {
      if (node.equals(startPosition)) {
        return matrix.map((row, y) => ({
          to: new Vector2(0, y),
          cost: row[0],
        }))
      }
      return [node.move("right"), node.move("down"), node.move("up")]
        .filter(target => inBounds(matrix, target))
        .map(target => ({
          to: target,
          cost: matrix[target.y][target.x],
        }))
    },
  })
  return result.bestScore
}
