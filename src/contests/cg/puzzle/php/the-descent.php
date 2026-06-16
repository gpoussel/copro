<?php
// 🎮 CodinGame Puzzle - the-descent
// https://www.codingame.com/training/easy/the-descent

// Game loop: each turn, read 8 mountain heights and fire on the tallest one.
while (true) {
    $maxHeight = -1;
    $maxIndex = 0;
    for ($i = 0; $i < 8; $i++) {
        $h = (int) trim(fgets(STDIN));
        if ($h > $maxHeight) {
            $maxHeight = $h;
            $maxIndex = $i;
        }
    }
    echo $maxIndex . "\n";
}
