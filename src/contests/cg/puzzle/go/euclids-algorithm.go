// 🎮 CodinGame Puzzle - euclids-algorithm
// https://www.codingame.com/training/easy/euclids-algorithm

package main

import (
	"bufio"
	"fmt"
	"os"
)

func main() {
	reader := bufio.NewReader(os.Stdin)
	var a, b int64
	fmt.Fscan(reader, &a, &b)
	x, y := a, b
	for y != 0 {
		q := x / y
		r := x % y
		fmt.Printf("%d=%d*%d+%d\n", x, y, q, r)
		x, y = y, r
	}
	fmt.Printf("GCD(%d,%d)=%d\n", a, b, x)
}
