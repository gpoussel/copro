var L=+readline(),H=+readline(),S="",m={},i,o=[]
for(i=0;i<H;i++)S+=readline()
function A(p){if(S[p]!="O")return 0;if(m[p])return m[p];var s=[p],C=[],a=0,x,P=q=>S[q]=="O"&&!m[q]&&(m[q]=-1,s.push(q));m[p]=-1;while(s.length){p=s.pop();x=p%L;C.push(p);a++;x<L-1&&P(p+1);x&&P(p-1);P(p+L);P(p-L)}for(p of C)m[p]=a;return a}
for(i=+readline();i--;){var r=readline().split(" ");o.push(A(+r[1]*L+ +r[0]))}
console.log(o.join("\n"))
