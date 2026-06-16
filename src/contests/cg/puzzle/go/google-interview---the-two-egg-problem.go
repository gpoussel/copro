// 🎮 CodinGame Puzzle - google-interview---the-two-egg-problem
// https://www.codingame.com/training/hard/google-interview---the-two-egg-problem

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
	var k int64 = 0
	for k*(k+1)/2 < n {
		k++
	}
	fmt.Println(k)
}
