import { removeIf } from "./iterate.js"
import { PriorityQueue } from "./structures/priority-queue.js"

export class DirectedGraph<K> {
  private nodes = new Map<K, Set<K>>()

  public constructor() {}

  private addNodeIfNecessary(node: K) {
    if (!this.nodes.has(node)) {
      this.nodes.set(node, new Set())
    }
  }

  public addEdge(from: K, to: K) {
    this.addNodeIfNecessary(from)
    this.addNodeIfNecessary(to)
    this.nodes.get(from)!.add(to)
  }

  public roots(): K[] {
    const numberOfParents = new Map<K, number>()
    for (const [node, children] of this.nodes) {
      for (const child of children) {
        numberOfParents.set(child, (numberOfParents.get(child) || 0) + 1)
      }
    }
    const roots = []
    for (const node of this.nodes.keys()) {
      if (!numberOfParents.has(node) || numberOfParents.get(node) === 0) {
        roots.push(node)
      }
    }
    return roots
  }

  public allPathsFrom(root: K): K[][] {
    const paths: K[][] = []
    this.dfs(root, [], (_node, path) => {
      paths.push([...path])
    })
    return paths
  }

  public allPathsFromTo(from: K, to: K | ((n: K) => boolean)): K[][] {
    const paths: K[][] = []
    this.dfs(from, [], (node, path) => {
      if (typeof to === "function" ? (to as (n: K) => boolean)(node) : node === to) {
        paths.push([...path])
      }
    })
    return paths
  }

  public dfs(root: K, path: K[], callback: (node: K, path: K[]) => void) {
    if (path.includes(root)) {
      return
    }
    path.push(root)
    callback(root, path)
    for (const child of this.nodes.get(root) || []) {
      this.dfs(child, path, callback)
    }
    path.pop()
  }

  public serialize(): string {
    const lines: string[] = []
    for (const root of this.roots()) {
      this.dfs(root, [], (node, path) => {
        lines.push(" " + ".".repeat(path.length - 1) + node)
      })
    }
    return lines.join("\n")
  }

  public dotContent(): string {
    const lines: string[] = []
    lines.push("digraph G {")
    for (const [node, children] of this.nodes) {
      for (const child of children) {
        lines.push(`  ${node} -> ${child}`)
      }
    }
    lines.push("}")
    return lines.join("\n")
  }
}

export function minimumSpanningTree<T>(
  edges: { from: T; to: T; weight: number }[],
  opts: {
    equals(a: T, b: T): boolean
    str(a: T): string
  }
) {
  const priorityQueue = new PriorityQueue<(typeof edges)[0]>(a => a.weight, PriorityQueue.MIN_HEAP_COMPARATOR)
  for (const edge of edges) {
    priorityQueue.add(edge)
  }
  const parents = new Map<string, string>()
  const ranks = new Map<string, number>()
  for (const { from, to } of edges) {
    parents.set(opts.str(from), opts.str(from))
    parents.set(opts.str(to), opts.str(to))
  }
  function findParent(nodeStr: string): string {
    if (parents.get(nodeStr) === nodeStr) {
      return nodeStr
    }
    const grandParent = findParent(parents.get(nodeStr)!)
    parents.set(nodeStr, grandParent)
    return grandParent
  }
  function unionSet(from: T, to: T) {
    const fromParent = findParent(opts.str(from))
    const toParent = findParent(opts.str(to))
    const fromRank = ranks.get(fromParent) || 0
    const toRank = ranks.get(toParent) || 0
    if (fromRank < toRank) {
      parents.set(fromParent, toParent)
    } else if (fromRank > toRank) {
      parents.set(toParent, fromParent)
    } else {
      parents.set(toParent, fromParent)
      ranks.set(fromParent, fromRank + 1)
    }
  }

  const mstEdges = []
  while (!priorityQueue.isEmpty()) {
    const nextEdge = priorityQueue.poll()
    const parentFrom = findParent(opts.str(nextEdge.from))
    const parentTo = findParent(opts.str(nextEdge.to))

    if (parentFrom !== parentTo) {
      unionSet(nextEdge.from, nextEdge.to)
      mstEdges.push(nextEdge)
    }
  }
  const distance = mstEdges.reduce((acc, edge) => acc + edge.weight, 0)
  return { distance }
}

export function prim<T>(
  startNode: T,
  opts: {
    equals(a: T, b: T): boolean
    str(a: T): string
    adjacent(node: T): { node: T; distance: number }[]
  }
): {
  total: number
  visited: T[]
} {
  const priorityQueue = new PriorityQueue<{ distance: number; node: T }>(
    a => a.distance,
    PriorityQueue.MIN_HEAP_COMPARATOR
  )
  priorityQueue.add({ distance: 0, node: startNode })
  const visitedMap = new Map<string, T>()
  let total = 0
  while (!priorityQueue.isEmpty()) {
    const { distance, node } = priorityQueue.poll()
    const nodeKey = opts.str(node)
    if (visitedMap.has(nodeKey)) {
      continue
    }
    total += distance
    visitedMap.set(opts.str(node), node)
    for (const { node: n, distance: d } of opts.adjacent(node)) {
      if (visitedMap.has(opts.str(n))) {
        continue
      }
      priorityQueue.add({ distance: d, node: n })
    }
  }
  return { total, visited: [...visitedMap.values()] }
}

export function disjointSets<K>(
  elements: K[],
  options: {
    areUnionable: (a: K, b: K) => boolean
  }
) {
  let remainingElements = [...elements]
  const groups: K[][] = []
  while (remainingElements.length > 0) {
    const reference = remainingElements[0]
    const group = [reference]
    remainingElements = remainingElements.slice(1)
    let i = 0
    while (i < group.length) {
      const point = group[i]
      const neighbors = remainingElements.filter(p => options.areUnionable(point, p))
      group.push(...neighbors)
      removeIf(remainingElements, p => neighbors.includes(p))
      i++
    }
    groups.push(group)
  }
  return groups
}
