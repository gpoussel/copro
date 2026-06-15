# 🎮 CodinGame Puzzle - horse-racing-duals
# https://www.codingame.com/training/easy/horse-racing-duals

my $n = <STDIN>;
chomp $n;
my @s;
for (1 .. $n) {
    my $v = <STDIN>;
    chomp $v;
    push @s, $v;
}
@s = sort { $a <=> $b } @s;
my $min_diff = 9**9**9;
for my $i (1 .. $#s) {
    my $diff = $s[$i] - $s[$i - 1];
    $min_diff = $diff if $diff < $min_diff;
}
print "$min_diff\n";
