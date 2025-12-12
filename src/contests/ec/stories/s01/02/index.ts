import { EverybodyCodesContest } from "../../../../../types/contest.js"
import utils from "../../../../../utils/index.js"

// 🎲 Everybody Codes Story 1 - Quest 2

interface SwapAction {
  id: number
  command: "swap"
}
interface FullSwapAction {
  id: number
  command: "fullswap"
}
interface AddAction {
  id: number
  command: "add"
  left: {
    rank: number
    node: string
  }
  right: {
    rank: number
    node: string
  }
}
type Action = SwapAction | AddAction | FullSwapAction

function parseInput(input: string, fullSwap: boolean = false): Action[] {
  return utils.input.lines(input).map(line => {
    const instruction = line.split(" ")[0]
    if (instruction === "ADD") {
      const [_, idPart, leftPart, rightPart] = line.split(" ")
      const id = parseInt(idPart.split("=")[1])
      const left = leftPart.split("=")[1]
      const [leftRank, leftNode] = left.slice(1, -1).split(",")
      const right = rightPart.split("=")[1]
      const [rightRank, rightNode] = right.slice(1, -1).split(",")
      return {
        command: "add",
        id,
        left: {
          rank: parseInt(leftRank),
          node: leftNode,
        },
        right: {
          rank: parseInt(rightRank),
          node: rightNode,
        },
      }
    } else if (instruction === "SWAP") {
      const identifier = +line.split(" ")[1]
      if (fullSwap) {
        return {
          id: identifier,
          command: "fullswap",
        }
      }
      return {
        id: identifier,
        command: "swap",
      }
    } else {
      throw new Error(`Unknown instruction: ${instruction}`)
    }
  })
}

interface TreeNode {
  id: number
  value: number
  name: string
  left?: TreeNode
  right?: TreeNode
}

class Tree {
  rootNode: TreeNode | undefined
  nodes: Map<number, TreeNode> = new Map()

  add(id: number, name: string, rank: number) {
    const node = {
      id,
      value: rank,
      name,
    }
    if (this.rootNode === undefined) {
      this.rootNode = node
    } else {
      let currentNode = this.rootNode
      while (true) {
        if (rank < currentNode.value) {
          if (currentNode.left === undefined) {
            currentNode.left = node
            break
          } else {
            currentNode = currentNode.left
          }
        } else {
          if (currentNode.right === undefined) {
            currentNode.right = node
            break
          } else {
            currentNode = currentNode.right
          }
        }
      }
    }
    this.nodes.set(id, node)
  }

  getValue() {
    // First, find level with the most symbols
    const levels: { [key: number]: TreeNode[] } = {}
    const queue: { node: TreeNode; level: number }[] = []
    if (this.rootNode) queue.push({ node: this.rootNode, level: 0 })

    while (queue.length > 0) {
      const { node, level } = queue.shift()!
      if (!levels[level]) {
        levels[level] = []
      }
      levels[level].push(node)

      if (node.left) {
        queue.push({ node: node.left, level: level + 1 })
      }
      if (node.right) {
        queue.push({ node: node.right, level: level + 1 })
      }
    }

    let maxLevel = 0
    for (const level in levels) {
      if (levels[level].length > levels[maxLevel].length) {
        maxLevel = parseInt(level)
      }
    }
    // Then, return nodes from left to right at the maxLevel
    const nodes = levels[maxLevel]
    let result = ""
    for (const node of nodes) {
      result += node.name
    }
    return result
  }

  find(id: number): TreeNode | undefined {
    return this.nodes.get(id)
  }

  replace(id: number, newNode: TreeNode, full: boolean = false) {
    const existingNode = this.nodes.get(id)
    if (existingNode) {
      existingNode.name = newNode.name
      existingNode.value = newNode.value
      if (full) {
        existingNode.left = newNode.left
        existingNode.right = newNode.right
      }
    } else {
      throw new Error(`Node with id ${id} not found`)
    }
  }

  print() {
    function prettyPrint(node: TreeNode | undefined, prefix: string = "", isLeft: boolean = false) {
      if (!node) {
        return
      }
      console.log(prefix + (isLeft ? "├── " : "└── ") + `${node.name} (${node.value})`)
      if (node.left || node.right) {
        prettyPrint(node.left, prefix + (isLeft ? "│   " : "    "), true)
        prettyPrint(node.right, prefix + (isLeft ? "│   " : "    "), false)
      }
    }
    prettyPrint(this.rootNode)
  }
}

function buildTrees(actions: Action[]) {
  const leftTree = new Tree()
  const rightTree = new Tree()
  for (const action of actions) {
    if (action.command === "add") {
      leftTree.add(action.id, action.left.node, action.left.rank)
      rightTree.add(action.id, action.right.node, action.right.rank)
    } else if (action.command === "swap") {
      const leftNode = { ...leftTree.find(action.id)! }
      const rightNode = { ...rightTree.find(action.id)! }
      leftTree.replace(leftNode.id!, rightNode)
      rightTree.replace(rightNode.id!, leftNode)
    } else if (action.command === "fullswap") {
      const leftNode = { ...leftTree.find(action.id)! }
      const rightNode = { ...rightTree.find(action.id)! }
      leftTree.replace(leftNode.id!, rightNode, true)
      rightTree.replace(rightNode.id!, leftNode, true)
    }
  }
  return { leftTree, rightTree }
}

function part1(inputString: string) {
  const nodes = parseInput(inputString)
  const { leftTree, rightTree } = buildTrees(nodes)
  return leftTree.getValue() + rightTree.getValue()
}

function part2(inputString: string) {
  const nodes = parseInput(inputString)
  const { leftTree, rightTree } = buildTrees(nodes)
  return leftTree.getValue() + rightTree.getValue()
}

function part3(inputString: string) {
  const nodes = parseInput(inputString, true)
  const { leftTree, rightTree } = buildTrees(nodes)
  return leftTree.getValue() + rightTree.getValue()
}

export default {
  part1: {
    run: part1,
    tests: [
      {
        input: `
ADD id=1 left=[10,A] right=[30,H]
ADD id=2 left=[15,D] right=[25,I]
ADD id=3 left=[12,F] right=[31,J]
ADD id=4 left=[5,B] right=[27,L]
ADD id=5 left=[3,C] right=[28,M]
ADD id=6 left=[20,G] right=[32,K]
ADD id=7 left=[4,E] right=[21,N]`,
        expected: "CFGNLK",
      },
      {
        input: `
ADD id=1 left=[160,E] right=[175,S]
ADD id=2 left=[140,W] right=[224,D]
ADD id=3 left=[122,U] right=[203,F]
ADD id=4 left=[204,N] right=[114,G]
ADD id=5 left=[136,V] right=[256,H]
ADD id=6 left=[147,G] right=[192,O]
ADD id=7 left=[232,I] right=[154,K]
ADD id=8 left=[118,E] right=[125,Y]
ADD id=9 left=[102,A] right=[210,D]
ADD id=10 left=[183,Q] right=[254,E]
ADD id=11 left=[146,E] right=[148,C]
ADD id=12 left=[173,Y] right=[299,S]
ADD id=13 left=[190,B] right=[277,B]
ADD id=14 left=[124,T] right=[142,N]
ADD id=15 left=[153,R] right=[133,M]
ADD id=16 left=[252,D] right=[276,M]
ADD id=17 left=[258,I] right=[245,P]
ADD id=18 left=[117,O] right=[283,!]
ADD id=19 left=[212,O] right=[127,R]
ADD id=20 left=[278,A] right=[169,C]`,
        expected: "EVERYBODYCODES",
      },
    ],
  },
  part2: {
    run: part2,
    tests: [
      {
        input: `
ADD id=1 left=[10,A] right=[30,H]
ADD id=2 left=[15,D] right=[25,I]
ADD id=3 left=[12,F] right=[31,J]
ADD id=4 left=[5,B] right=[27,L]
ADD id=5 left=[3,C] right=[28,M]
SWAP 1
SWAP 5
ADD id=6 left=[20,G] right=[32,K]
ADD id=7 left=[4,E] right=[21,N]`,
        expected: "MGFLNK",
      },
    ],
  },
  part3: {
    run: part3,
    tests: [
      {
        input: `
ADD id=1 left=[10,A] right=[30,H]
ADD id=2 left=[15,D] right=[25,I]
ADD id=3 left=[12,F] right=[31,J]
ADD id=4 left=[5,B] right=[27,L]
ADD id=5 left=[3,C] right=[28,M]
SWAP 1
SWAP 5
ADD id=6 left=[20,G] right=[32,K]
ADD id=7 left=[4,E] right=[21,N]
SWAP 2`,
        expected: "DJMGL",
      },
      {
        input: `
ADD id=1 left=[10,A] right=[30,H]
ADD id=2 left=[15,D] right=[25,I]
ADD id=3 left=[12,F] right=[31,J]
ADD id=4 left=[5,B] right=[27,L]
ADD id=5 left=[3,C] right=[28,M]
SWAP 1
SWAP 5
ADD id=6 left=[20,G] right=[32,K]
ADD id=7 left=[4,E] right=[21,N]
SWAP 2
SWAP 5`,
        expected: "DJCGL",
      },
    ],
  },
} as EverybodyCodesContest
