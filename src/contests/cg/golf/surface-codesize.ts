var R=readline,W=-~R(),H=+R(),S="",m={},p,g=(q,a=m[q]||[0],s=[q])=>{for(;s.length;)S[p=s.pop()]>"#"&&!m[p]&&++(m[p]=a)[0]&&s.push(p-1,p+1,p-W,p+W);return a[0]}
for(;H--;)S+=R()+" "
for(H=+R();H--;console.log(g(+x+W*+y)))var[x,y]=R().split(" ")