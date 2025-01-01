import { Vector2 } from "./vector.js"
import { PriorityQueue } from "./structures/priority-queue.js"
import { at, Direction, inBounds, nextDirClockwise, nextDirCounterClockwise } from "./grid.js"
import { logEvery } from "./log.js"

export interface DijkstraPath {
  positions: Vector2[]
  score: number
}

function getKey(position: Vector2, dir: Direction) {
  return `${position.str()},${dir}`
}

export function dijkstraOnGrid<K>(
  grid: K[][],
  options: {
    starts: Vector2[]
    ends: (position: Vector2, path: Vector2[]) => boolean
    isMoveValid: (from: K, to: K) => boolean
    moveCost: number
    stopOnFirst?: boolean
    stopIfScameScore?: boolean
  }
) {
  interface DijkstraNode {
    position: Vector2
    score: number
    path: Vector2[]
  }
  let bestScore = Infinity
  const priorizer = (node: DijkstraNode) => node.score
  const priorityQueue = new PriorityQueue<DijkstraNode>(priorizer, PriorityQueue.MIN_HEAP_COMPARATOR)
  options.starts.forEach(start => priorityQueue.add({ position: start, score: 0, path: [start] }))
  const visited = new Map<string, number>()
  const paths: DijkstraPath[] = []

  while (!priorityQueue.isEmpty()) {
    const { position, score, path } = priorityQueue.poll()
    const key = position.str()

    if (visited.has(key)) {
      const previousScore = visited.get(key)!
      if (previousScore < score) continue
      if (options.stopIfScameScore && previousScore === score) continue
    }
    visited.set(key, score)

    if (options.ends(position, path)) {
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
    for (const dir of ["up", "down", "left", "right"] as Direction[]) {
      const newPosition = position.move(dir)
      if (
        inBounds(grid, newPosition) &&
        options.isMoveValid(at(grid, position), at(grid, newPosition)) &&
        !path.some(p => p.equals(newPosition))
      ) {
        priorityQueue.add({ position: newPosition, score: score + options.moveCost, path: [...path, newPosition] })
      }
    }
    logEvery(priorityQueue.size(), 5000)
  }

  const bestPaths = paths.filter(path => path.score === bestScore)
  return { bestScore, paths, bestPaths, visitedNodes: visited.size }
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
  ends: K[] | ((node: K, path: K[]) => boolean),
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
  let bestPath: K[] = []
  const priorizer = (node: DijkstraNode) => node.score
  const priorityQueue = new PriorityQueue<DijkstraNode>(priorizer, PriorityQueue.MIN_HEAP_COMPARATOR)
  const endPredicate = typeof ends === "function" ? ends : (node: K) => ends.some(end => options.equals(node, end))
  const inserted = new Map<string, number>()
  starts.forEach(start => {
    priorityQueue.add({ score: 0, node: start, path: [start] })
    inserted.set(options.key(start), 0)
  })
  const visited = new Map<string, number>()

  while (!priorityQueue.isEmpty()) {
    const { node, score, path } = priorityQueue.poll()
    const key = options.key(node)

    if (visited.has(key) && visited.get(key)! < score) continue
    visited.set(key, score)

    if (endPredicate(node, path)) {
      if (score < bestScore) {
        bestPath = path
        bestScore = score
      }
      continue
    }

    for (const { to, cost } of options.moves(node, path)) {
      const toKey = options.key(to)
      const toScore = score + cost
      if (inserted.has(toKey) && inserted.get(toKey)! <= toScore) continue
      priorityQueue.add({ node: to, score: toScore, path: [...path, to] })
      inserted.set(toKey, toScore)
    }
    logEvery(priorityQueue.size(), 5000)
  }

  return { bestScore, bestPath }
}

export function breadthFirstSearch<K>(
  start: K,
  options: {
    key: (node: K) => string
    adjacents: (node: K) => K[]
    ends: (node: K) => boolean
    visitEnd?: (node: K, path: K[]) => boolean
    distance?: (from: K, to: K) => number
  }
) {
  interface BreadthFirstSearchNode {
    node: K
    distance: number
    path: K[]
  }
  const nodes = new Array<BreadthFirstSearchNode>()
  nodes.push({ node: start, distance: 0, path: [] })

  const visited = new Set<string>()
  visited.add(options.key(start))

  let smallestDistance = Infinity
  let bestPath = new Array<K>()
  const endPaths = []

  while (nodes.length > 0) {
    const { node, distance, path } = nodes.shift()!
    if (options.ends(node)) {
      if (distance < smallestDistance) {
        smallestDistance = distance
        bestPath = path
      }
      endPaths.push(path)
      if (!options.visitEnd || options.visitEnd(node, path)) {
        break
      } else {
        continue
      }
    }
    for (const n of options.adjacents(node)) {
      const neighborKey = options.key(n)
      if (visited.has(neighborKey)) continue
      visited.add(neighborKey)
      const addedDistance = options.distance ? options.distance(node, n) : 1
      nodes.push({ node: n, distance: distance + addedDistance, path: [...path, n] })
    }
    logEvery(nodes.length, 5000)
  }
  return {
    distance: smallestDistance,
    path: bestPath,
    paths: endPaths,
  }
}
