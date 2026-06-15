# 🎮 CodinGame Puzzle - euclids-algorithm
# https://www.codingame.com/training/easy/euclids-algorithm

my ($a, $b) = split ' ', <STDIN>;
my ($x, $y) = ($a, $b);
while ($y != 0) {
    my $q = int($x / $y);
    my $r = $x % $y;
    print "$x=$y*$q+$r\n";
    ($x, $y) = ($y, $r);
}
print "GCD($a,$b)=$x\n";
