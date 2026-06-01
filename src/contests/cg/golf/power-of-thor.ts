var r=readline,[X,Y,x,y]=r().split(" ").map(Number)
for(;r();)console.log((y>Y?(y--,"N"):y<Y?(y++,"S"):"")+(x>X?(x--,"W"):x<X?(x++,"E"):""))