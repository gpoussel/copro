# 🎮 CodinGame Puzzle - max-area
# https://www.codingame.com/training/easy/max-area

<STDIN>;
my @a = split ' ', <STDIN>;
my $left = 0;
my $right = $#a;
my $best = 0;
while ($left < $right) {
    my $h = $a[$left] < $a[$right] ? $a[$left] : $a[$right];
    my $area = $h * ($right - $left);
    $best = $area if $area > $best;
    if ($a[$left] < $a[$right]) {
        $left++;
    } else {
        $right--;
    }
}
print "$best\n";
