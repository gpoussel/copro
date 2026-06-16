' 🎮 CodinGame Puzzle - the-river-i-
' https://www.codingame.com/training/easy/the-river-i-

Imports System

Module Solution
    Function DigitSum(ByVal x As Long) As Long
        Dim s As Long = 0
        While x > 0
            s += x Mod 10
            x = x \ 10
        End While
        Return s
    End Function

    Sub Main()
        Dim a As Long = Long.Parse(Console.ReadLine().Trim())
        Dim b As Long = Long.Parse(Console.ReadLine().Trim())
        While a <> b
            If a < b Then
                a += DigitSum(a)
            Else
                b += DigitSum(b)
            End If
        End While
        Console.WriteLine(a)
    End Sub
End Module
