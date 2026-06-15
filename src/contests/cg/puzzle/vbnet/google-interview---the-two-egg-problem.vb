' 🎮 CodinGame Puzzle - google-interview---the-two-egg-problem
' https://www.codingame.com/training/hard/google-interview---the-two-egg-problem

Imports System

Module Solution
    Sub Main()
        Dim n As Long = Long.Parse(Console.ReadLine().Trim())
        Dim k As Long = 0
        While k * (k + 1) \ 2 < n
            k += 1
        End While
        Console.WriteLine(k)
    End Sub
End Module
