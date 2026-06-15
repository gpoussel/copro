// 🎮 CodinGame Puzzle - telephone-numbers
// https://www.codingame.com/training/medium/telephone-numbers

package main

import (
	"bufio"
	"fmt"
	"os"
	"strings"
)

// Node is a trie node: a map from digit to child node.
type Node map[byte]Node

func main() {
	reader := bufio.NewReader(os.Stdin)
	var n int
	fmt.Fscan(reader, &n)
	reader.ReadString('\n') // consume rest of the first line
	root := Node{}
	cable := 0
	for t := 0; t < n; t++ {
		line, _ := reader.ReadString('\n')
		number := strings.TrimRight(line, "\r\n")
		node := root
		for i := 0; i < len(number); i++ {
			d := number[i]
			if _, ok := node[d]; !ok {
				node[d] = Node{}
				cable++
			}
			node = node[d]
		}
	}
	fmt.Println(cable)
}
