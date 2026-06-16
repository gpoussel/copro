// 🎮 CodinGame Puzzle - rubik
// https://www.codingame.com/training/medium/rubik

package main

import (
	"bufio"
	"fmt"
	"os"
)

func main() {
	reader := bufio.NewReader(os.Stdin)
	var n int64
	fmt.Fscan(reader, &n)
	// Visible mini-cubes = all cubes minus the hidden inner cube of side n-2.
	var inner int64 = 0
	if n >= 2 {
		inner = n - 2
	}
	fmt.Println(n*n*n - inner*inner*inner)
}
