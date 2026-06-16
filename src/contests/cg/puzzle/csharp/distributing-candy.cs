// 🎮 CodinGame Puzzle - distributing-candy
// https://www.codingame.com/training/easy/distributing-candy

using System;

class Solution
{
    static void Main()
    {
        var first = Console.ReadLine().Trim().Split(' ');
        int n = int.Parse(first[0]), m = int.Parse(first[1]);
        var candies = Array.ConvertAll(Console.ReadLine().Trim().Split(' '), int.Parse);
        Array.Sort(candies);
        int best = int.MaxValue;
        for (int i = 0; i + m - 1 < n; i++)
        {
            int diff = candies[i + m - 1] - candies[i];
            if (diff < best) best = diff;
        }
        Console.WriteLine(best);
    }
}
