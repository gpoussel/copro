# 🎮 CodinGame Puzzle - the-descent
# https://www.codingame.com/training/easy/the-descent

# Game loop: each turn, read 8 mountain heights and fire on the tallest one.
$| = 1;
while (1) {
    my $max_height = -1;
    my $max_index = 0;
    for my $i (0 .. 7) {
        my $h = <STDIN>;
        chomp $h;
        if ($h > $max_height) {
            $max_height = $h;
            $max_index = $i;
        }
    }
    print "$max_index\n";
}
