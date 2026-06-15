// 🎮 CodinGame Puzzle - mirrors
// https://www.codingame.com/training/easy/mirrors

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
	r := make([]float64, n)
	for i := 0; i < n; i++ {
		fmt.Fscan(reader, &r[i])
	}
	reflected := 0.0
	for i := n - 1; i >= 0; i-- {
		ri := r[i]
		denom := 1 - ri*reflected
		if denom == 0 {
			reflected = ri
		} else {
			reflected = ri + ((1-ri)*(1-ri)*reflected)/denom
		}
	}
	fmt.Printf("%.4f\n", reflected)
}
