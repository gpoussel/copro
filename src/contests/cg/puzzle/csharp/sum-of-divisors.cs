// 🎮 CodinGame Puzzle - sum-of-divisors
// https://www.codingame.com/training/medium/sum-of-divisors

using System;

class Solution
{
    static void Main()
    {
        // d appears as a divisor in floor(n/d) of the numbers 1..n, so the total
        // sum of divisors is sum over d of d * floor(n/d).
        long n = long.Parse(Console.ReadLine().Trim());
        long total = 0;
        for (long d = 1; d <= n; d++) total += d * (n / d);
        Console.WriteLine(total);
    }
}
