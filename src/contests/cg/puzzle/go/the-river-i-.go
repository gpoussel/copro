// 🎮 CodinGame Puzzle - the-river-i-
// https://www.codingame.com/training/easy/the-river-i-

package main

import (
	"bufio"
	"fmt"
	"os"
)

func digitSum(x int64) int64 {
	var s int64 = 0
	for x > 0 {
		s += x % 10
		x /= 10
	}
	return s
}

func main() {
	reader := bufio.NewReader(os.Stdin)
	var a, b int64
	fmt.Fscan(reader, &a)
	fmt.Fscan(reader, &b)
	for a != b {
		if a < b {
			a += digitSum(a)
		} else {
			b += digitSum(b)
		}
	}
	fmt.Println(a)
}
