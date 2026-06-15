' 🎮 CodinGame Puzzle - the-fastest
' https://www.codingame.com/training/medium/the-fastest

Imports System

Module Solution
    Sub Main()
        ' Times are HH:MM:SS so lexicographic comparison equals chronological comparison.
        Dim n As Integer = Integer.Parse(Console.ReadLine().Trim())
        Dim best As String = ""
        For i As Integer = 0 To n - 1
            Dim t As String = Console.ReadLine().Trim()
            If best = "" OrElse String.CompareOrdinal(t, best) < 0 Then
                best = t
            End If
        Next
        Console.WriteLine(best)
    End Sub
End Module
