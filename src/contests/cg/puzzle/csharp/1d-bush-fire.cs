// 🎮 CodinGame Puzzle - 1d-bush-fire
// https://www.codingame.com/training/easy/1d-bush-fire

using System;

class Solution
{
    static void Main()
    {
        int n = int.Parse(Console.ReadLine().Trim());
        for (int t = 0; t < n; t++)
        {
            string strip = Console.ReadLine().TrimEnd();
            int drops = 0, j = 0;
            while (j < strip.Length)
            {
                if (strip[j] == 'f')
                {
                    // Drop at j covers j, j+1, j+2 — skip past all 3.
                    drops++;
                    j += 3;
                }
                else
                {
                    j++;
                }
            }
            Console.WriteLine(drops);
        }
    }
}
