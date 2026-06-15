// 🎮 CodinGame Puzzle - fibonaccis-rabbit
// https://www.codingame.com/training/easy/fibonaccis-rabbit

using System;

class Solution
{
    static void Main()
    {
        var first = Console.ReadLine().Trim().Split(' ');
        int f0 = int.Parse(first[0]), n = int.Parse(first[1]);
        var second = Console.ReadLine().Trim().Split(' ');
        int a = int.Parse(second[0]), b = int.Parse(second[1]);
        // FN can exceed 2^63 (but is < 2^64), so accumulate in ulong.
        ulong[] f = new ulong[n + 1];
        f[0] = (ulong)f0;
        for (int i = 1; i <= n; i++)
        {
            ulong total = 0;
            for (int k = a; k <= b; k++)
            {
                if (i - k >= 0) total += f[i - k];
            }
            f[i] = total;
        }
        Console.WriteLine(f[n]);
    }
}
