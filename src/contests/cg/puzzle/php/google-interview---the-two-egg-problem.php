<?php
// 🎮 CodinGame Puzzle - google-interview---the-two-egg-problem
// https://www.codingame.com/training/hard/google-interview---the-two-egg-problem

$n = (int) trim(fgets(STDIN));
$k = 0;
while (intdiv($k * ($k + 1), 2) < $n) {
    $k++;
}
echo $k . "\n";
