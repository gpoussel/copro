' 🎮 CodinGame Puzzle - euclids-algorithm
' https://www.codingame.com/training/easy/euclids-algorithm

Imports System

Module Solution
    Sub Main()
        Dim parts() As String = Console.ReadLine().Trim().Split(" "c)
        Dim a As Long = Long.Parse(parts(0))
        Dim b As Long = Long.Parse(parts(1))
        Dim x As Long = a, y As Long = b
        While y <> 0
            Dim q As Long = x \ y
            Dim r As Long = x Mod y
            Console.WriteLine($"{x}={y}*{q}+{r}")
            x = y
            y = r
        End While
        Console.WriteLine($"GCD({a},{b})={x}")
    End Sub
End Module
