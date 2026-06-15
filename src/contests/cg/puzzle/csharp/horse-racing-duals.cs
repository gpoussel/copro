// 🎮 CodinGame Puzzle - horse-racing-duals
// https://www.codingame.com/training/easy/horse-racing-duals

using System;

class Solution
{
    static void Main()
    {
        int n = int.Parse(Console.ReadLine().Trim());
        int[] s = new int[n];
        for (int i = 0; i < n; i++) s[i] = int.Parse(Console.ReadLine().Trim());
        Array.Sort(s);
        int minDiff = int.MaxValue;
        for (int i = 1; i < n; i++)
        {
            int diff = s[i] - s[i - 1];
            if (diff < minDiff) minDiff = diff;
        }
        Console.WriteLine(minDiff);
    }
}
