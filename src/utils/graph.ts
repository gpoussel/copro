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
