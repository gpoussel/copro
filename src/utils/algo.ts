import { Vector2 } from "./vector.js"
import { PriorityQueue } from "./structures/priority-queue.js"
import { at, Direction, nextDirClockwise, nextDirCounterClockwise } from "./grid.js"
import { logEvery } from "./log.js"

export interface DijkstraPath {
  positions: Vector2[]
  score: number
}

function getKey(position: Vector2, dir: Direction) {
  return `${position.str()},${dir}`
}

export function dijkstraWithDirectionsOnGrid<K>(
  grid: K[][],
  end: Vector2,
  options: {
    scoreLimit?: number // If defined, the algorithm will stop when the score exceeds this limit
    starts: { position: Vector2; dir: Direction }[] // The starting positions and directions
    stopOnFirst: boolean // If true, the algorithm will stop when the first path is found
    isMoveValid: (from: K, to: K) => boolean // A function to check if a move is valid
    turnCost: number
    moveCost: number
  }
) {
  interface DijkstraNode {
    position: Vector2
    dir: Direction
    score: number
    path: Vector2[]
  }
  let bestScore = Infinity
  const priorizer = (node: DijkstraNode) => node.score
  const priorityQueue = new PriorityQueue<DijkstraNode>(priorizer, PriorityQueue.MIN_HEAP_COMPARATOR)
  options.starts.forEach(start => priorityQueue.add({ ...start, score: 0, path: [start.position] }))
  const visited = new Map<string, number>()
  const paths: DijkstraPath[] = []

  while (!priorityQueue.isEmpty()) {
    const { position, dir, score, path } = priorityQueue.poll()
    const key = getKey(position, dir)

    if (options.scoreLimit !== undefined && score > options.scoreLimit) continue
    if (visited.has(key) && visited.get(key)! < score) continue
    visited.set(key, score)

    if (position.equals(end)) {
      if (score < bestScore) {
        bestScore = score
      }
      paths.push({
        positions: path,
        score,
      })
      if (options.stopOnFirst) {
        break
      }
      continue
    }

    const newPosition = position.move(dir)
    if (options.isMoveValid(at(grid, position), at(grid, newPosition))) {
      priorityQueue.add({ position: newPosition, dir, score: score + options.moveCost, path: [...path, newPosition] })
    }

    priorityQueue.add({ position, dir: nextDirClockwise(dir), score: score + options.turnCost, path: [...path] })
    priorityQueue.add({ position, dir: nextDirCounterClockwise(dir), score: score + options.turnCost, path: [...path] })
  }

  const bestPaths = paths.filter(path => path.score === bestScore)
  return { bestScore, paths, bestPaths }
}

export function dijkstraOnGraph<K>(
  starts: K[],
  ends: K[],
  options: {
    key: (node: K) => string
    equals: (a: K, b: K) => boolean
    moves: (node: K, path: K[]) => { to: K; cost: number }[]
  }
) {
  interface DijkstraNode {
    score: number
    node: K
    path: K[]
  }
  let bestScore = Infinity
  const priorizer = (node: DijkstraNode) => node.score
  const priorityQueue = new PriorityQueue<DijkstraNode>(priorizer, PriorityQueue.MIN_HEAP_COMPARATOR)
  starts.forEach(start => priorityQueue.add({ score: 0, node: start, path: [start] }))
  const visited = new Map<string, number>()

  while (!priorityQueue.isEmpty()) {
    const { node, score, path } = priorityQueue.poll()
    const key = options.key(node)

    if (visited.has(key) && visited.get(key)! < score) continue
    visited.set(key, score)

    if (ends.some(end => options.equals(node, end))) {
      if (score < bestScore) {
        bestScore = score
      }
      continue
    }

    for (const { to, cost } of options.moves(node, path)) {
      priorityQueue.add({ node: to, score: score + cost, path: [...path, to] })
    }
    logEvery(priorityQueue.size(), 5000)
  }

  return { bestScore }
}
