// 🎮 CodinGame Puzzle - 1d-bush-fire
// https://www.codingame.com/training/easy/1d-bush-fire

package main

import (
	"bufio"
	"fmt"
	"os"
	"strings"
)

func main() {
	reader := bufio.NewReader(os.Stdin)
	var n int
	fmt.Fscan(reader, &n)
	reader.ReadString('\n') // consume rest of the first line
	for t := 0; t < n; t++ {
		line, _ := reader.ReadString('\n')
		strip := strings.TrimRight(line, "\r\n")
		drops, j := 0, 0
		for j < len(strip) {
			if strip[j] == 'f' {
				// Drop at j covers j, j+1, j+2 — skip past all 3.
				drops++
				j += 3
			} else {
				j++
			}
		}
		fmt.Println(drops)
	}
}
