// 🎮 CodinGame Puzzle - the-descent
// https://www.codingame.com/training/easy/the-descent

package main

import (
	"bufio"
	"fmt"
	"os"
)

func main() {
	reader := bufio.NewReader(os.Stdin)
	// Game loop: each turn, read 8 mountain heights and fire on the tallest one.
	for {
		maxHeight, maxIndex := -1, 0
		for i := 0; i < 8; i++ {
			var h int
			fmt.Fscan(reader, &h)
			if h > maxHeight {
				maxHeight = h
				maxIndex = i
			}
		}
		fmt.Println(maxIndex)
	}
}
