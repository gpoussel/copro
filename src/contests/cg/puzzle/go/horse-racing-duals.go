// 🎮 CodinGame Puzzle - horse-racing-duals
// https://www.codingame.com/training/easy/horse-racing-duals

package main

import (
	"bufio"
	"fmt"
	"math"
	"os"
	"sort"
)

func main() {
	reader := bufio.NewReader(os.Stdin)
	var n int
	fmt.Fscan(reader, &n)
	s := make([]int, n)
	for i := 0; i < n; i++ {
		fmt.Fscan(reader, &s[i])
	}
	sort.Ints(s)
	minDiff := math.MaxInt64
	for i := 1; i < n; i++ {
		diff := s[i] - s[i-1]
		if diff < minDiff {
			minDiff = diff
		}
	}
	fmt.Println(minDiff)
}
