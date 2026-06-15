// 🎮 CodinGame Puzzle - the-descent
// https://www.codingame.com/training/easy/the-descent

using System;

class Solution
{
    static void Main()
    {
        // Game loop: each turn, read 8 mountain heights and fire on the tallest one.
        while (true)
        {
            int maxHeight = -1, maxIndex = 0;
            for (int i = 0; i < 8; i++)
            {
                int h = int.Parse(Console.ReadLine().Trim());
                if (h > maxHeight)
                {
                    maxHeight = h;
                    maxIndex = i;
                }
            }
            Console.WriteLine(maxIndex);
        }
    }
}
