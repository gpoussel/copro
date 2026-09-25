eval(`R=readline;[W,H]=R().split(" ");V=-~W;O=[K=0];D=[0,1,-1,V,-V]
S=(p,v)=>(G[p+v]>"#"||G[p+(v=-v)]>"#"||(v=0),[p+v,v])
X=(c,a=[],r,s)=>D.map(d=>{for(r=c,s=3;s--&&G[r+=d]>"#";)a.push(r)})&&a
U=x=>Math.random()*x|0
Y=_=>A.reduce((m,q)=>m|M[q],0)
for(C=[],c=400;c--;)D.map(d=>C.push([c,d]))
for(;;){[r,b]=R().split(" ");for(G="",i=H;i--;)G+=R()+"#"
if((n=(C=C.map(h=>S(...h)).filter(h=>G[h[0]]>"?"&&E[h]!=(E[h]=1),E={})).length)<32&&K>1)for(T=Date.now()+70,o=[],M=[],L=C.map(h=>[...Array(r>44?44:+r)].map((_,j)=>(o[(e=h[0])<<6|j]=1,h=S(...h),e))).map((p,k)=>p.flatMap((e,j)=>X(p[j+3]).flatMap(c=>o[q=c<<6|j]?[]:(M[q]|=1<<k,q)))),A=[],f=1;f<=n?Date.now()<T:A.map(q=>q+1&&(O[K+(q&63)]=(c=q>>6)%V+" "+(c/V|0)),C=[])&&0;q=L[k][U(L[k].length)],i=U(b),A.some((a,x)=>x!=i&&(d=a-q+2&63)<5&&(d==2||X(a>>6).includes(q>>6)))||(t=A[i],A[i]=q,(c=Y().toString(2).split(1).length)<f&&U(99)?A[i]=t:f=c))for(g=Y();g>>(k=U(n))&1;);
print(O[K++]||"WAIT")}`)
