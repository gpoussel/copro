// 🎮 CodinGame Puzzle - fibonaccis-rabbit
// https://www.codingame.com/training/easy/fibonaccis-rabbit

package main

import (
	"bufio"
	"fmt"
	"os"
)

func main() {
	reader := bufio.NewReader(os.Stdin)
	var f0, n int
	fmt.Fscan(reader, &f0, &n)
	var a, b int
	fmt.Fscan(reader, &a, &b)
	// FN can exceed 2^63 (but is < 2^64), so accumulate in uint64.
	f := make([]uint64, n+1)
	f[0] = uint64(f0)
	for i := 1; i <= n; i++ {
		var total uint64 = 0
		for k := a; k <= b; k++ {
			if i-k >= 0 {
				total += f[i-k]
			}
		}
		f[i] = total
	}
	fmt.Println(f[n])
}
