' 🎮 CodinGame Puzzle - rubik
' https://www.codingame.com/training/medium/rubik

Imports System

Module Solution
    Sub Main()
        Dim n As Long = Long.Parse(Console.ReadLine().Trim())
        ' Visible mini-cubes = all cubes minus the hidden inner cube of side n-2.
        Dim inner As Long = If(n >= 2, n - 2, 0L)
        Console.WriteLine(n * n * n - inner * inner * inner)
    End Sub
End Module
