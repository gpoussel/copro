// 🎮 CodinGame Puzzle - max-area
// https://www.codingame.com/training/easy/max-area

package main

import (
	"bufio"
	"fmt"
	"os"
)

func main() {
	reader := bufio.NewReader(os.Stdin)
	var n int
	fmt.Fscan(reader, &n)
	a := make([]int64, n)
	for i := 0; i < n; i++ {
		fmt.Fscan(reader, &a[i])
	}
	left, right := 0, n-1
	var best int64 = 0
	for left < right {
		h := a[left]
		if a[right] < h {
			h = a[right]
		}
		area := h * int64(right-left)
		if area > best {
			best = area
		}
		if a[left] < a[right] {
			left++
		} else {
			right--
		}
	}
	fmt.Println(best)
}
