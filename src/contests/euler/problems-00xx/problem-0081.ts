import { readFileSync } from "fs"
import { dirname, resolve } from "path"
import { fileURLToPath } from "url"
import { dijkstraOnGraph } from "../../../utils/algo.js"
import { Vector2 } from "../../../utils/vector.js"

// 🧮 Project Euler - Problem 81

export function solve() {
  const filePath = resolve(dirname(fileURLToPath(import.meta.url)), "0081_matrix.txt")
  const matrix = readFileSync(filePath, "utf-8")
    .trim()
    .split("\n")
    .map(line => line.split(",").map(Number))
  const result = dijkstraOnGraph<Vector2>([new Vector2(0, 0)], [new Vector2(matrix.length - 1, matrix[0].length - 1)], {
    equals(a, b) {
      return a.equals(b)
    },
    key(node) {
      return node.str()
    },
    moves(node) {
      return [node.move("right"), node.move("down")]
        .filter(target => target.x < matrix.length && target.y < matrix[0].length)
        .map(target => ({
          to: target,
          cost: matrix[target.y][target.x],
        }))
    },
  })
  return result.bestScore + matrix[0][0]
}
