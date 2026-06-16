// 🎮 CodinGame Puzzle - distributing-candy
// https://www.codingame.com/training/easy/distributing-candy

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
	var n, m int
	fmt.Fscan(reader, &n, &m)
	candies := make([]int, n)
	for i := 0; i < n; i++ {
		fmt.Fscan(reader, &candies[i])
	}
	sort.Ints(candies)
	best := math.MaxInt64
	for i := 0; i+m-1 < n; i++ {
		diff := candies[i+m-1] - candies[i]
		if diff < best {
			best = diff
		}
	}
	fmt.Println(best)
}
