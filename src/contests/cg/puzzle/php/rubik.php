<?php
// 🎮 CodinGame Puzzle - rubik
// https://www.codingame.com/training/medium/rubik

$n = (int) trim(fgets(STDIN));
// Visible mini-cubes = all cubes minus the hidden inner cube of side n-2.
$inner = $n >= 2 ? $n - 2 : 0;
echo ($n * $n * $n - $inner * $inner * $inner) . "\n";
