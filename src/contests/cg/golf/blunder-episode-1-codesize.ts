for(var g=[],w,d,b,k=1e4,x,O="";x=readline();w=x.length)g.push(...x)
for(var F={S:w,E:1,N:-w,W:-1},P=[..."SENW"],p=g.indexOf("@");x!="$"&&k--;p+=F[d=[d,...P].find(c=>(x=g[p+F[c]])!="#"&&(x<"X"||b))],O+="SOUTH EAST NORTH WEST".match(d+"\\w+")+`
`,x>"W"?g[p]=O:F[x]?d=x:x=="T"?p=g.indexOf(x)+g.lastIndexOf(x)-p:x=="I"?P.reverse():b^=+(x=="B"));
console.log(~k?O:"LOOP")