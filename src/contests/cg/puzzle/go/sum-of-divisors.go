// 🎮 CodinGame Puzzle - sum-of-divisors
// https://www.codingame.com/training/medium/sum-of-divisors

package main

import (
	"bufio"
	"fmt"
	"os"
)

func main() {
	reader := bufio.NewReader(os.Stdin)
	// d appears as a divisor in floor(n/d) of the numbers 1..n, so the total
	// sum of divisors is sum over d of d * floor(n/d).
	var n int64
	fmt.Fscan(reader, &n)
	var total int64 = 0
	for d := int64(1); d <= n; d++ {
		total += d * (n / d)
	}
	fmt.Println(total)
}
