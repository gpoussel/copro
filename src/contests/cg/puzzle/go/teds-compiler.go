// 🎮 CodinGame Puzzle - teds-compiler
// https://www.codingame.com/training/easy/teds-compiler

package main

import (
	"bufio"
	"fmt"
	"os"
	"strings"
)

func main() {
	reader := bufio.NewReader(os.Stdin)
	line, _ := reader.ReadString('\n')
	line = strings.TrimRight(line, "\r\n")
	balance, best := 0, 0
	for i := 0; i < len(line); i++ {
		if line[i] == '<' {
			balance++
		} else {
			balance--
		}
		if balance < 0 {
			break
		}
		if balance == 0 {
			best = i + 1
		}
	}
	fmt.Println(best)
}
