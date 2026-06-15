' 🎮 CodinGame Puzzle - fibonaccis-rabbit
' https://www.codingame.com/training/easy/fibonaccis-rabbit

Imports System

Module Solution
    Sub Main()
        Dim first() As String = Console.ReadLine().Trim().Split(" "c)
        Dim f0 As Integer = Integer.Parse(first(0))
        Dim n As Integer = Integer.Parse(first(1))
        Dim second() As String = Console.ReadLine().Trim().Split(" "c)
        Dim a As Integer = Integer.Parse(second(0))
        Dim b As Integer = Integer.Parse(second(1))
        ' FN can exceed 2^63 (but is < 2^64), so accumulate in ULong.
        Dim f(n) As ULong
        f(0) = CULng(f0)
        For i As Integer = 1 To n
            Dim total As ULong = 0
            For k As Integer = a To b
                If i - k >= 0 Then total += f(i - k)
            Next
            f(i) = total
        Next
        Console.WriteLine(f(n))
    End Sub
End Module
