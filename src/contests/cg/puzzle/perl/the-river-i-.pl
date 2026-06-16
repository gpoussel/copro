# 🎮 CodinGame Puzzle - the-river-i-
# https://www.codingame.com/training/easy/the-river-i-

sub digit_sum {
    my $x = shift;
    my $s = 0;
    while ($x > 0) {
        $s += $x % 10;
        $x = int($x / 10);
    }
    return $s;
}

my $a = <STDIN>;
chomp $a;
my $b = <STDIN>;
chomp $b;
while ($a != $b) {
    if ($a < $b) {
        $a += digit_sum($a);
    } else {
        $b += digit_sum($b);
    }
}
print "$a\n";
