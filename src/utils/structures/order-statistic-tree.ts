// A self-balancing binary search tree (AVL Tree) that also supports
// finding the k-th smallest element in O(log N).
// This allows it to be used as a sequence container with fast access and deletion.

class Node {
  value: string
  left: Node | null = null
  right: Node | null = null
  height = 1
  // count stores the number of nodes in the subtree rooted at this node.
  count = 1

  constructor(value: string) {
    this.value = value
  }
}

export class OrderStatisticTree {
  root: Node | null = null

  private getHeight(node: Node | null): number {
    return node ? node.height : 0
  }

  private getCount(node: Node | null): number {
    return node ? node.count : 0
  }

  private updateNode(node: Node): void {
    node.height = 1 + Math.max(this.getHeight(node.left), this.getHeight(node.right))
    node.count = 1 + this.getCount(node.left) + this.getCount(node.right)
  }

  private getBalance(node: Node | null): number {
    if (!node) return 0
    return this.getHeight(node.left) - this.getHeight(node.right)
  }

  private rightRotate(y: Node): Node {
    const x = y.left!
    const T2 = x.right

    x.right = y
    y.left = T2

    this.updateNode(y)
    this.updateNode(x)

    return x
  }

  private leftRotate(x: Node): Node {
    const y = x.right!
    const T2 = y.left

    y.left = x
    x.right = T2

    this.updateNode(x)
    this.updateNode(y)

    return y
  }

  private balance(node: Node): Node {
    this.updateNode(node)
    const balance = this.getBalance(node)

    // Left heavy
    if (balance > 1) {
      // Left-Right case
      if (this.getBalance(node.left) < 0) {
        node.left = this.leftRotate(node.left!)
      }
      // Left-Left case
      return this.rightRotate(node)
    }

    // Right heavy
    if (balance < -1) {
      // Right-Left case
      if (this.getBalance(node.right) > 0) {
        node.right = this.rightRotate(node.right!)
      }
      // Right-Right case
      return this.leftRotate(node)
    }
    return node
  }

  // Insert at a specific index
  insert(index: number, value: string): void {
    this.root = this._insert(this.root, index, value)
  }

  private _insert(node: Node | null, index: number, value: string): Node {
    if (!node) {
      return new Node(value)
    }

    const leftCount = this.getCount(node.left)

    if (index <= leftCount) {
      node.left = this._insert(node.left, index, value)
    } else {
      node.right = this._insert(node.right, index - leftCount - 1, value)
    }

    return this.balance(node)
  }

  // Delete element at a specific index
  delete(index: number): void {
    this.root = this._delete(this.root, index)
  }

  private _delete(node: Node | null, index: number): Node | null {
    if (!node) {
      return null
    }

    const leftCount = this.getCount(node.left)

    if (index < leftCount) {
      node.left = this._delete(node.left, index)
    } else if (index > leftCount) {
      node.right = this._delete(node.right, index - leftCount - 1)
    } else {
      if (!node.left) return node.right
      if (!node.right) return node.left

      // Node with two children: Get the inorder successor (smallest in the right subtree)
      const temp = this.minValueNode(node.right)
      node.value = temp.value
      // Delete the inorder successor
      node.right = this._delete(node.right, 0)
    }
    
    if (!node) return null

    return this.balance(node)
  }

  private minValueNode(node: Node): Node {
    let current = node
    while (current.left) {
      current = current.left
    }
    return current
  }

  // Get element at a specific index
  get(index: number): string | null {
    if (index < 0 || index >= this.size()) {
      return null
    }
    let node = this.root
    while (node) {
      const leftCount = this.getCount(node.left)
      if (index < leftCount) {
        node = node.left
      } else if (index > leftCount) {
        index = index - leftCount - 1
        node = node.right
      } else {
        return node.value
      }
    }
    return null
  }

  size(): number {
    return this.getCount(this.root)
  }
}