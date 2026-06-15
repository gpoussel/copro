// 🎮 CodinGame Puzzle - the-fastest
// https://www.codingame.com/training/medium/the-fastest

package main

import (
	"bufio"
	"fmt"
	"os"
)

func main() {
	reader := bufio.NewReader(os.Stdin)
	// Times are HH:MM:SS so lexicographic comparison equals chronological comparison.
	var n int
	fmt.Fscan(reader, &n)
	best := ""
	for i := 0; i < n; i++ {
		var t string
		fmt.Fscan(reader, &t)
		if best == "" || t < best {
			best = t
		}
	}
	fmt.Println(best)
}
