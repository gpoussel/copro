// 🎮 CodinGame Puzzle - the-fastest
// https://www.codingame.com/training/medium/the-fastest

using System;

class Solution
{
    static void Main()
    {
        // Times are HH:MM:SS so lexicographic comparison equals chronological comparison.
        int n = int.Parse(Console.ReadLine().Trim());
        string best = "";
        for (int i = 0; i < n; i++)
        {
            string t = Console.ReadLine().Trim();
            if (best == "" || string.CompareOrdinal(t, best) < 0) best = t;
        }
        Console.WriteLine(best);
    }
}
