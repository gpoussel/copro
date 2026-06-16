' 🎮 CodinGame Puzzle - 1d-bush-fire
' https://www.codingame.com/training/easy/1d-bush-fire

Imports System

Module Solution
    Sub Main()
        Dim n As Integer = Integer.Parse(Console.ReadLine().Trim())
        For t As Integer = 0 To n - 1
            Dim strip As String = Console.ReadLine().TrimEnd()
            Dim drops As Integer = 0, j As Integer = 0
            While j < strip.Length
                If strip(j) = "f"c Then
                    ' Drop at j covers j, j+1, j+2 — skip past all 3.
                    drops += 1
                    j += 3
                Else
                    j += 1
                End If
            End While
            Console.WriteLine(drops)
        Next
    End Sub
End Module
