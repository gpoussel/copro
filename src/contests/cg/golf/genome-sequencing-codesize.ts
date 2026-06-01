var w=[],m=1/0,ov=(a,b)=>{for(var k=b.length;;k--)if(a.slice(a.length-k)==b.slice(0,k))return k}
for(var i=+readline();i--;)w.push(readline())
function go(s,r){r.length?r.map((x,i)=>go(s.includes(x)?s:s+x.slice(ov(s,x)),r.filter((_,j)=>i!=j))):m=Math.min(m,s.length)}
go("",w)
console.log(m)
