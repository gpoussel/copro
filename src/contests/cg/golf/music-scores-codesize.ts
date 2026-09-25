eval(`R=readline;W=parseInt(R());S=R().replace(/(.) (\\d+) ?/g,(_,c,n)=>c.repeat(n)),e=[],o=""
S.replace(RegExp("B{"+W/5+"}","g"),(m,i)=>e[i/W|0]=1);L=Object.keys(e)
G=L[L.length/5]-L[0],L.map(y=>e[+y+G]=1)
for(x=N=X=Y=0;x<W;n&&n<1.5*G?(N+=n,X+=x*n,Y+=b):(N>G*G/9&&(o+="GFEDCBAGFEDC"[(Y/N-L[0])*2/G+1.5|0]+(S[(Y/N|0)*W+X/N|0]<"W"?"Q ":"H ")),N=X=Y=0),x++)for(n=b=y=0;q=S[y*W+x];y++)q<"W"&&!e[y]&&(n++,b+=y)
print(o.trim())`)