// 🎮 CodinGame Puzzle - telephone-numbers
// https://www.codingame.com/training/medium/telephone-numbers

using System;
using System.Collections.Generic;

class Solution
{
    static void Main()
    {
        int n = int.Parse(Console.ReadLine().Trim());
        var root = new Dictionary<char, object>();
        int cable = 0;
        for (int i = 0; i < n; i++)
        {
            string number = Console.ReadLine().Trim();
            var node = root;
            foreach (char d in number)
            {
                if (!node.ContainsKey(d))
                {
                    node[d] = new Dictionary<char, object>();
                    cable++;
                }
                node = (Dictionary<char, object>)node[d];
            }
        }
        Console.WriteLine(cable);
    }
}
